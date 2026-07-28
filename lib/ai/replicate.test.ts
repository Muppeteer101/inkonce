import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { verifyWebhook, __testing } from './providers/replicate';
import { selectModel, MODELS } from './router';

const { toResult } = __testing;

/**
 * Replicate has no "failed runs are auto-refunded" contract, so this mapping is
 * what decides whether a user is charged for an image they never received.
 */
describe('replicate status → outcome', () => {
  it('succeeded with images completes and is chargeable', () => {
    const r = toResult({
      id: 'p', status: 'succeeded', output: ['https://x/1.png'], metrics: { predict_time: 2 },
    });
    expect(r.outcome).toBe('completed');
    expect(r.images).toEqual(['https://x/1.png']);
    expect(r.chargeable).toBe(true);
  });

  it('accepts a bare string output as well as a list', () => {
    const r = toResult({ id: 'p', status: 'succeeded', output: 'https://x/only.png' });
    expect(r.images).toEqual(['https://x/only.png']);
  });

  // The dangerous case: compute ran and Replicate bills us, but the safety
  // checker blanked the output. Charged to us, refunded to the user.
  it('succeeded with NO images is filtered, not completed', () => {
    const r = toResult({ id: 'p', status: 'succeeded', output: [], metrics: { predict_time: 3 } });
    expect(r.outcome).toBe('filtered');
    expect(r.chargeable).toBe(true);
    expect(r.error).toMatch(/rephrase/i);
  });

  it('null output is filtered too', () => {
    expect(toResult({ id: 'p', status: 'succeeded', output: null }).outcome).toBe('filtered');
  });

  it('an NSFW failure is filtered so the user gets a useful message', () => {
    const r = toResult({
      id: 'p', status: 'failed', error: 'NSFW content detected', metrics: { predict_time: 1 },
    });
    expect(r.outcome).toBe('filtered');
    expect(r.error).toMatch(/rephrase/i);
  });

  it('a real failure that consumed compute is chargeable to us', () => {
    const r = toResult({
      id: 'p', status: 'failed', error: 'CUDA out of memory', metrics: { predict_time: 8 },
    });
    expect(r.outcome).toBe('failed');
    expect(r.chargeable).toBe(true);
    expect(r.error).toMatch(/CUDA/);
  });

  it('a failure that never ran costs us nothing', () => {
    const r = toResult({ id: 'p', status: 'failed', error: 'invalid input' });
    expect(r.outcome).toBe('failed');
    expect(r.chargeable).toBe(false);
  });

  it('cancelled runs are not chargeable', () => {
    const r = toResult({ id: 'p', status: 'canceled' });
    expect(r.outcome).toBe('failed');
    expect(r.chargeable).toBe(false);
  });

  it('in-flight statuses stay pending and never settle', () => {
    expect(toResult({ id: 'p', status: 'starting' }).outcome).toBe('pending');
    expect(toResult({ id: 'p', status: 'processing' }).outcome).toBe('pending');
  });
});

/**
 * A forged "completed" is a free generation; a forged "failed" is a free
 * refund. Both are worth signing for.
 */
describe('webhook signature verification', () => {
  const SECRET = 'whsec_' + Buffer.from('super-secret-signing-key').toString('base64');
  const body = JSON.stringify({ id: 'p', status: 'succeeded', output: ['https://x/1.png'] });

  function sign(rawBody: string, id = 'msg_1', ts = String(Math.floor(Date.now() / 1000))) {
    const key = Buffer.from(SECRET.replace(/^whsec_/, ''), 'base64');
    const sig = createHmac('sha256', key).update(`${id}.${ts}.${rawBody}`).digest('base64');
    return new Headers({
      'webhook-id': id,
      'webhook-timestamp': ts,
      'webhook-signature': `v1,${sig}`,
    });
  }

  it('accepts a correctly signed payload', () => {
    expect(verifyWebhook(body, sign(body), SECRET)).toBe(true);
  });

  it('rejects a tampered body', () => {
    const headers = sign(body);
    const tampered = body.replace('succeeded', 'failed');
    expect(verifyWebhook(tampered, headers, SECRET)).toBe(false);
  });

  it('rejects a signature made with a different secret', () => {
    const other = 'whsec_' + Buffer.from('not-the-key').toString('base64');
    expect(verifyWebhook(body, sign(body), other)).toBe(false);
  });

  it('rejects a replayed old delivery', () => {
    const old = String(Math.floor(Date.now() / 1000) - 3600);
    expect(verifyWebhook(body, sign(body, 'msg_1', old), SECRET)).toBe(false);
  });

  it('rejects missing headers and empty secrets', () => {
    expect(verifyWebhook(body, new Headers(), SECRET)).toBe(false);
    expect(verifyWebhook(body, sign(body), '')).toBe(false);
  });

  // Rotation sends several v1 signatures at once; any valid one is enough.
  it('accepts when one of several signatures matches', () => {
    const good = sign(body);
    const merged = new Headers(good);
    merged.set('webhook-signature', `v1,AAAA ${good.get('webhook-signature')}`);
    expect(verifyWebhook(body, merged, SECRET)).toBe(true);
  });
});

/**
 * Replicate serves official models at /models/{owner}/{name}/predictions and
 * everything else only at version-pinned /v1/predictions. Getting this wrong
 * is a hard 404 at submit time — and it bites exactly the tattoo-specific
 * fine-tunes, which are all community models.
 */
const OFFICIAL_OWNERS = new Set(['black-forest-labs', 'google', 'ideogram-ai', 'bytedance']);

describe('router', () => {
  it('every table entry names a real provider and a non-zero cost', () => {
    for (const [key, m] of Object.entries(MODELS)) {
      expect(m.provider, key).toBe('replicate');
      expect(m.modelId, key).toMatch(/^[\w.-]+\/[\w.-]+$/);
      expect(m.costPerImageUsd, key).toBeGreaterThan(0);
    }
  });

  it('community models are version-pinned; official ones need not be', () => {
    for (const [key, m] of Object.entries(MODELS)) {
      const owner = m.modelId.split('/')[0];
      if (!OFFICIAL_OWNERS.has(owner)) {
        expect(m.version, `${key} is a community model and must pin a version`).toMatch(
          /^[0-9a-f]{64}$/,
        );
      }
    }
  });

  it('routes each task to a usable model', () => {
    for (const task of ['draft', 'refine', 'stencil', 'hires'] as const) {
      expect(selectModel({ task }).modelId).toBeTruthy();
    }
  });

  it('stencil only ever routes to an image-to-image model', () => {
    expect(selectModel({ task: 'stencil' }).capabilities.imageToImage).toBe(true);
  });

  /**
   * The plan assumed lettering would need a specialist model. The benchmark
   * said otherwise — every model spelled the test phrase correctly, and the
   * candidate specialist tinted the background on all five cases, breaking the
   * flash contract. So lettering takes the default like anything else, and
   * this test pins that as a deliberate finding rather than an oversight.
   */
  it('lettering takes the default route — no specialist was warranted', () => {
    expect(selectModel({ task: 'draft', styleSlug: 'script-lettering' }).modelId).toBe(
      selectModel({ task: 'draft' }).modelId,
    );
  });

  it('draft is the cheapest route — the free tier multiplies it ~200x', () => {
    const draft = selectModel({ task: 'draft' });
    const refine = selectModel({ task: 'refine' });
    expect(draft.costPerImageUsd).toBeLessThanOrEqual(refine.costPerImageUsd);
    // A regression here quietly wrecks CAC, so pin the order of magnitude too.
    expect(draft.costPerImageUsd).toBeLessThan(0.01);
  });
});
