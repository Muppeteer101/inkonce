import { describe, expect, it } from 'vitest';
import { interpret } from './brain';
import { STYLES } from '../content/styles';

/**
 * Live regression set — the five phrases from docs/MODEL_BENCHMARK.md that
 * scored **one acceptable result in five** through the un-interpreted pipeline.
 *
 * Skipped without `ANTHROPIC_API_KEY`, so `npm test` stays offline and free.
 * With a key:
 *
 *     ANTHROPIC_API_KEY=... npx vitest run lib/ai/brain.live.test.ts
 *
 * These assert the *structural* properties each failure needed — a described
 * figure instead of a proper noun, a coverage-capable subject for a cover-up,
 * concrete imagery for an emotional brief. They deliberately do not assert
 * specific wording: there are many right answers and pinning one would make
 * this a change-detector. Judging whether the resulting images are good is
 * still a human job; this only proves the interpreter is doing its stated work.
 */

const live = describe.skipIf(!process.env.ANTHROPIC_API_KEY);

/** Words that indicate a described figure rather than a bare name. */
const DISCWORLD_VISUAL = /skeletal|skull|hooded|robe|scythe|hourglass|horse/i;
/** A cover-up needs mass and an irregular edge, not a delicate line. */
const COVERAGE = /dense|solid|heavy|bold|coverage|foliage|leaves|wings|smoke|shadow|dark/i;

live('interpretation on the real API', () => {
  it('resolves a named fiction into what it looks like', async () => {
    const brief = await interpret({ rawInput: 'A tattoo of death, from the disc world novels' });

    expect(brief.interpreted).toBe(true);
    // The original bug: this rendered a generic hooded reaper on every model,
    // because the name did all the work and the name means nothing to FLUX.
    expect(brief.subject).toMatch(DISCWORLD_VISUAL);
    expect(brief.subject.length).toBeGreaterThan(40);
  }, 30_000);

  it('turns a tone word into a style rather than leaving it in the subject', async () => {
    const brief = await interpret({ rawInput: 'a lion but make it look hard' });

    expect(brief.interpreted).toBe(true);
    expect(brief.subject).toMatch(/lion/i); // it rendered a manga boy before
    expect(brief.subject).not.toMatch(/make it look hard/i);
  }, 30_000);

  it('gives a memorial brief real imagery instead of a stock flower', async () => {
    const brief = await interpret({
      rawInput: 'something for my nan who passed away last year',
    });

    expect(brief.interpreted).toBe(true);
    expect(brief.subject.length).toBeGreaterThan(40);
    expect(brief.interpretation).toBeTruthy();
  }, 30_000);

  it('treats a cover-up as a constraint, not a subject', async () => {
    const brief = await interpret({
      rawInput: "i need something to cover my exs name on my arm",
    });

    expect(brief.interpreted).toBe(true);
    expect(brief.subject).toMatch(COVERAGE);
    // A fine-line suggestion here is actively wrong — it cannot hide ink.
    expect(brief.styleSlug).not.toBe('fine-line');
    expect(brief.styleSlug).not.toBe('minimalist');
  }, 30_000);

  it('binds two ideas into one composition rather than listing them', async () => {
    // The measured regression: a longer brief produced a lotus and a storm
    // cloud as two disconnected objects — worse than the naive prompt.
    const brief = await interpret({ rawInput: 'something about getting through depression' });

    expect(brief.interpreted).toBe(true);
    // One integrated image: a connecting relationship, not a bare conjunction.
    expect(brief.subject).toMatch(
      /through|from|around|within|out of|emerging|rising|breaking|growing|wrapped|held/i,
    );
  }, 30_000);

  it('never invents a style that does not exist', async () => {
    const brief = await interpret({ rawInput: 'a geometric wolf, quite minimal' });
    if (brief.styleSlug) expect(STYLES.map((s) => s.slug)).toContain(brief.styleSlug);
  }, 30_000);
});
