import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The interpretation layer.
 *
 * Two things are worth testing here and they pull in opposite directions:
 *
 *  - It must never take the product down. A missing key, a rate limit, a
 *    timeout or a refusal has to land on the behaviour we shipped before this
 *    file existed, because a generation that fails because the *interpreter*
 *    was unavailable is worse than no interpreter at all.
 *  - It must not be trusted blindly. Its output feeds a prompt builder that
 *    throws on an unknown style, so a hallucinated slug is a 500 unless it is
 *    checked here.
 */

const parse = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: class {
    messages = { parse: (...args: unknown[]) => parse(...(args as [])) };
  },
}));

const { interpret, __testing } = await import('./brain');

/** A well-formed model response, overridable per test. */
function reply(over: Record<string, unknown> = {}) {
  return {
    parsed_output: {
      subject: 'a snarling lion head with a heavy tangled mane and a scarred brow',
      styleSlug: 'blackwork',
      colorMode: 'blackwork',
      complexity: 'balanced',
      interpretation: 'Read "make it look hard" as heavy blackwork rather than fine line.',
      confidence: 'high',
      clarifyingQuestion: null,
      ...over,
    },
  };
}

beforeEach(() => {
  parse.mockReset();
  process.env.ANTHROPIC_API_KEY = 'sk-test';
});

afterEach(() => {
  delete process.env.ANTHROPIC_API_KEY;
});

describe('interpretation', () => {
  it('turns a naive phrase into a brief and reports how it read it', async () => {
    parse.mockResolvedValue(reply());

    const brief = await interpret({ rawInput: 'a lion but make it look hard' });

    expect(brief.interpreted).toBe(true);
    expect(brief.subject).toMatch(/lion/i);
    expect(brief.styleSlug).toBe('blackwork');
    expect(brief.colorMode).toBe('blackwork');
    expect(brief.interpretation).toBeTruthy();
    expect(brief.confidence).toBe('high');
  });

  it('drops a style the model invented rather than passing it downstream', async () => {
    // buildTattooPrompt throws on an unknown style, so an unchecked slug here
    // turns a hallucination into a failed generation.
    parse.mockResolvedValue(reply({ styleSlug: 'hyper-chrome-brutalism' }));

    const brief = await interpret({ rawInput: 'a wolf' });

    expect(brief.styleSlug).toBeUndefined();
    expect(brief.subject).toMatch(/lion/i); // the rest of the brief survives
  });

  it('keeps every real style slug', async () => {
    for (const slug of ['fine-line', 'japanese-irezumi', 'trash-polka']) {
      parse.mockResolvedValue(reply({ styleSlug: slug }));
      expect((await interpret({ rawInput: 'x' })).styleSlug).toBe(slug);
    }
  });

  it('tells the model to stay out of the way when the user already picked a style', async () => {
    parse.mockResolvedValue(reply());

    await interpret({ rawInput: 'a moth', styleSlug: 'fine-line' });

    const content = parse.mock.calls[0][0].messages[0].content as string;
    expect(content).toContain('a moth');
    expect(content).toContain('fine-line');
  });

  it('passes an unclear request back with a question instead of guessing silently', async () => {
    parse.mockResolvedValue(
      reply({
        confidence: 'low',
        clarifyingQuestion: 'Is this covering existing ink, or going on clear skin?',
      }),
    );

    const brief = await interpret({ rawInput: 'something over my old tattoo' });

    expect(brief.confidence).toBe('low');
    expect(brief.clarifyingQuestion).toMatch(/\?$/);
  });
});

describe('the brain never takes generation down with it', () => {
  it('with no API key it degrades to the previous behaviour and calls nothing', async () => {
    delete process.env.ANTHROPIC_API_KEY;

    const brief = await interpret({ rawInput: 'i want a tattoo of a wolf howling' });

    expect(parse).not.toHaveBeenCalled();
    expect(brief.interpreted).toBe(false);
    // cleanSubject still strips the meta-phrase, exactly as it does today.
    expect(brief.subject).toBe('a wolf howling');
  });

  it('an API error falls back rather than throwing', async () => {
    parse.mockRejectedValue(new Error('rate limited'));

    const brief = await interpret({ rawInput: 'a koi carp' });

    expect(brief.interpreted).toBe(false);
    expect(brief.subject).toBe('a koi carp');
  });

  it('a refusal (no parsed output) falls back', async () => {
    parse.mockResolvedValue({ parsed_output: null });

    expect((await interpret({ rawInput: 'a moth' })).interpreted).toBe(false);
  });

  it('an empty subject falls back — a blank prompt is worse than a raw one', async () => {
    parse.mockResolvedValue(reply({ subject: '   ' }));

    const brief = await interpret({ rawInput: 'a moth with moon phases' });

    expect(brief.interpreted).toBe(false);
    expect(brief.subject).toBe('a moth with moon phases');
  });

  it('empty input never reaches the API', async () => {
    expect((await interpret({ rawInput: '   ' })).interpreted).toBe(false);
    expect(parse).not.toHaveBeenCalled();
  });
});

/**
 * These pin the findings from docs/MODEL_BENCHMARK.md into the prompt. Each one
 * corresponds to a failure that was actually observed, so deleting a rule
 * should break a test and make someone justify it.
 */
describe('the system prompt encodes the measured failures', () => {
  const sys = __testing.SYSTEM;

  it('demands a single unified composition', () => {
    // The observed regression: a richer brief produced a lotus and a storm
    // cloud as two disconnected objects — worse than the naive prompt.
    expect(sys).toMatch(/ONE UNIFIED COMPOSITION/);
    expect(sys).toMatch(/never "x and y" as separate items/i);
  });

  it('forbids relying on proper nouns', () => {
    // "Death, from the disc world novels" → a generic hooded reaper, on every
    // model tested. Names do not carry pictures.
    expect(sys).toMatch(/DESCRIBE, DON'T NAME/);
    expect(sys).toMatch(/discworld/i);
  });

  it('requires emotional input to become concrete imagery', () => {
    // "something for my nan who passed away last year" → a stock flower.
    expect(sys).toMatch(/MEANING BECOMES IMAGERY/);
  });

  it('handles cover-ups as a real constraint, not a subject', () => {
    // "i need something to cover my exs name on my arm" → a horned demon face
    // that addressed nothing. A cover-up has physical requirements.
    expect(sys).toMatch(/COVER-UP/);
    expect(sys).toMatch(/never propose a delicate fine-line design for a cover-up/i);
  });

  it('bans the prompt-beautifier behaviour competitors ship', () => {
    expect(sys).toMatch(/not a prompt beautifier/i);
    expect(sys).toMatch(/do not pad/i);
  });

  it('offers only styles that exist', () => {
    for (const slug of __testing.STYLE_SLUGS) expect(sys).toContain(slug);
  });

  it('leaves placement and the flash contract to the prompt builder', () => {
    expect(sys).toMatch(/STAY OFF THE BODY/);
  });
});
