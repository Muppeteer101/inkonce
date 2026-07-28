import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Stuck-run accounting. A run whose images never arrive must not strand the
 * user's allowance: the zero-image guard keeps it pending (Higgsfield's webhook
 * often omits images), but past PENDING_TIMEOUT_MS it has to fail and refund.
 *
 * These are money-correctness tests — a regression here silently charges people
 * for generations they never received.
 */

const store = new Map<string, unknown>();
const refund = vi.fn(async () => {});
const getRequestStatus = vi.fn();

vi.mock('./redis', () => ({
  redis: {
    get: async (key: string) => store.get(key) ?? null,
    set: async (key: string, val: unknown) => void store.set(key, val),
    lpush: async () => 1,
  },
  k: {
    generation: (id: string) => `ink:gen:${id}`,
    hfRequest: (id: string) => `ink:hfreq:${id}`,
    userGenerations: (id: string) => `ink:gens:${id}`,
  },
  bumpCounter: async () => {},
}));

vi.mock('./credits', () => ({
  consume: async () => true,
  refund: (...args: unknown[]) => refund(...(args as [])),
}));

vi.mock('./higgsfield', () => ({
  MODELS: { draft: 'm', refine: 'm', stencil: 'm' },
  submitGeneration: async () => ({ request_id: 'req_1' }),
  getRequestStatus: (...args: unknown[]) => getRequestStatus(...(args as [])),
}));

vi.mock('@vercel/blob', () => ({
  put: async (path: string) => ({ url: `https://blob.test/${path}` }),
}));

const interpretMock = vi.fn();
vi.mock('./ai/brain', () => ({
  interpret: (...args: unknown[]) => interpretMock(...(args as [])),
}));

const { applyResult, pollGeneration, startDesignRun } = await import('./generation');

const TEN_MIN = 10 * 60 * 1000;

function seed(ageMs: number, over: Record<string, unknown> = {}) {
  const rec = {
    id: 'gen1',
    userId: 'user1',
    kind: 'draft',
    status: 'pending',
    subject: 'a wolf',
    styleSlug: 'fine-line',
    prompt: 'p',
    aspectRatio: '3:4',
    hfRequestId: 'req_1',
    images: [] as string[],
    isPublic: false,
    createdAt: Date.now() - ageMs,
    ...over,
  };
  store.set('ink:gen:gen1', rec);
  return rec;
}

beforeEach(() => {
  store.clear();
  refund.mockClear();
  getRequestStatus.mockReset();
  interpretMock.mockReset();
  interpretMock.mockResolvedValue({ subject: 'a wolf', interpreted: false });
});

describe('stuck runs never strand the allowance', () => {
  it('a fresh completed-but-imageless result stays pending and is not refunded', async () => {
    seed(5_000);
    getRequestStatus.mockResolvedValue({ status: 'completed', images: [] });

    const out = await applyResult('gen1', { status: 'completed', images: [] });

    expect(out?.status).toBe('pending');
    expect(refund).not.toHaveBeenCalled();
  });

  it('past the deadline, a completed-but-imageless result fails and refunds', async () => {
    seed(TEN_MIN + 1_000);
    getRequestStatus.mockResolvedValue({ status: 'completed', images: [] });

    const out = await applyResult('gen1', { status: 'completed', images: [] });

    expect(out?.status).toBe('failed');
    expect(out?.error).toMatch(/not counted/i);
    expect(refund).toHaveBeenCalledWith('user1', 'draftRuns');
  });

  it('a run stuck queued past the deadline fails and refunds', async () => {
    seed(TEN_MIN + 1_000);

    const out = await applyResult('gen1', { status: 'queued' as never });

    expect(out?.status).toBe('failed');
    expect(refund).toHaveBeenCalledWith('user1', 'draftRuns');
  });

  it('a run still queued inside the deadline is left alone', async () => {
    seed(60_000);

    const out = await applyResult('gen1', { status: 'queued' as never });

    expect(out?.status).toBe('pending');
    expect(refund).not.toHaveBeenCalled();
  });

  it('images still settle the run normally', async () => {
    seed(5_000);

    const out = await applyResult('gen1', {
      status: 'completed',
      images: [{ url: 'https://hf.test/a.png' }],
    });

    expect(out?.status).toBe('completed');
    expect(out?.images).toHaveLength(1);
    expect(refund).not.toHaveBeenCalled();
  });

  it('settling is idempotent — a second result does not double-refund', async () => {
    seed(TEN_MIN + 1_000);
    getRequestStatus.mockResolvedValue({ status: 'completed', images: [] });

    await applyResult('gen1', { status: 'completed', images: [] });
    await applyResult('gen1', { status: 'failed' });

    expect(refund).toHaveBeenCalledTimes(1);
  });

  it('pollGeneration refunds when the status endpoint keeps failing past the deadline', async () => {
    seed(TEN_MIN + 1_000);
    getRequestStatus.mockRejectedValue(new Error('upstream down'));

    const out = await pollGeneration('gen1');

    expect(out?.status).toBe('failed');
    expect(refund).toHaveBeenCalledWith('user1', 'draftRuns');
  });

  it('pollGeneration tolerates a transient status failure inside the deadline', async () => {
    seed(60_000);
    getRequestStatus.mockRejectedValue(new Error('blip'));

    const out = await pollGeneration('gen1');

    expect(out?.status).toBe('pending');
    expect(refund).not.toHaveBeenCalled();
  });

  it('a run that never got a provider id cannot hang forever', async () => {
    seed(TEN_MIN + 1_000, { hfRequestId: undefined });

    const out = await pollGeneration('gen1');

    expect(out?.status).toBe('failed');
    expect(refund).toHaveBeenCalledWith('user1', 'draftRuns');
  });
});

/**
 * The interpreter advises; the user decides. Getting this precedence backwards
 * would mean a person picks "fine-line" and silently gets blackwork, which is
 * a worse product than not interpreting at all.
 */
describe('interpretation feeds the run without overriding the user', () => {
  it('renders the interpreted subject, not the raw text, and keeps both', async () => {
    interpretMock.mockResolvedValue({
      subject: 'a snarling lion head with a heavy mane and a scarred brow',
      interpretation: 'Read "look hard" as heavy blackwork.',
      confidence: 'high',
      interpreted: true,
    });

    const rec = await startDesignRun(
      { userId: 'user1', subject: 'a lion but make it look hard', styleSlug: 'blackwork' },
      'draft',
    );

    expect(rec.subject).toMatch(/snarling lion head/);
    expect(rec.rawSubject).toBe('a lion but make it look hard');
    expect(rec.prompt).toMatch(/snarling lion head/);
    expect(rec.interpretation).toBeTruthy();
  });

  it('an explicit style beats the interpreter’s suggestion', async () => {
    interpretMock.mockResolvedValue({
      subject: 'a moth',
      styleSlug: 'blackwork',
      colorMode: 'blackwork',
      complexity: 'detailed',
      interpreted: true,
    });

    const rec = await startDesignRun(
      {
        userId: 'user1',
        subject: 'a moth',
        styleSlug: 'fine-line',
        colorMode: 'black-and-grey',
        complexity: 'simple',
      },
      'draft',
    );

    expect(rec.styleSlug).toBe('fine-line');
    expect(rec.prompt).toMatch(/black and grey ink only/);
    expect(rec.prompt).toMatch(/readable at small size/); // 'simple', not 'detailed'
  });

  it('the interpreter fills only what the user left blank', async () => {
    interpretMock.mockResolvedValue({
      subject: 'a koi carp swimming up a waterfall',
      styleSlug: 'japanese-irezumi',
      colorMode: 'color',
      complexity: 'detailed',
      interpreted: true,
    });

    const rec = await startDesignRun(
      { userId: 'user1', subject: 'something japanese for my back' },
      'draft',
    );

    expect(rec.styleSlug).toBe('japanese-irezumi');
    expect(rec.prompt).toMatch(/intricate, richly detailed/);
  });

  it('falls back to a neutral style when nobody chose one', async () => {
    interpretMock.mockResolvedValue({ subject: 'a wolf', interpreted: false });

    const rec = await startDesignRun({ userId: 'user1', subject: 'a wolf' }, 'draft');

    expect(rec.styleSlug).toBe('illustrative');
  });

  it('a failure after the allowance is taken refunds it', async () => {
    // The interpreter is total, but buildTattooPrompt throws on an unknown
    // style — and that now happens *after* consume().
    interpretMock.mockResolvedValue({ subject: 'a wolf', interpreted: true });

    await expect(
      startDesignRun({ userId: 'user1', subject: 'a wolf', styleSlug: 'not-a-style' }, 'draft'),
    ).rejects.toThrow(/unknown style/i);
    expect(refund).toHaveBeenCalledWith('user1', 'draftRuns');
  });

  it('an empty description is rejected before any allowance is spent', async () => {
    await expect(
      startDesignRun({ userId: 'user1', subject: '   ' }, 'draft'),
    ).rejects.toThrow(/describe your tattoo idea/i);
    expect(interpretMock).not.toHaveBeenCalled();
  });
});
