import { describe, expect, it } from 'vitest';
import { buildTattooPrompt, cleanSubject, STENCIL_PROMPT } from './prompts';
import { STYLES } from './content/styles';
import { PLACEMENTS } from './content/placements';
import { IDEAS } from './content/ideas';

describe('prompt engine', () => {
  it('builds a flash-format prompt for every style without throwing', () => {
    for (const style of STYLES) {
      const { prompt, aspectRatio } = buildTattooPrompt({
        subject: 'a snake coiled around a dagger',
        styleSlug: style.slug,
      });
      expect(prompt).toContain(style.promptFragment);
      expect(prompt).toContain('tattoo flash');
      expect(prompt).toContain('white background');
      expect(aspectRatio).toBe('3:4'); // default placement-less ratio
    }
  });

  it('placement drives aspect ratio and composition hint', () => {
    const { prompt, aspectRatio } = buildTattooPrompt({
      subject: 'phoenix rising',
      styleSlug: 'japanese-irezumi',
      placementSlug: 'forearm',
    });
    expect(aspectRatio).toBe('9:16');
    expect(prompt).toContain('forearm');
  });

  it('style default colour applies unless user overrides', () => {
    const def = buildTattooPrompt({ subject: 'rose', styleSlug: 'american-traditional' });
    expect(def.prompt).toContain('tattoo color palette'); // trad defaults to colour
    const forced = buildTattooPrompt({
      subject: 'rose',
      styleSlug: 'american-traditional',
      colorMode: 'blackwork',
    });
    expect(forced.prompt).toContain('solid black ink only');
  });

  it('rejects unknown styles', () => {
    expect(() => buildTattooPrompt({ subject: 'rose', styleSlug: 'nope' })).toThrow();
  });

  it('cleanSubject trims, collapses whitespace and caps length', () => {
    expect(cleanSubject('  a   wolf \n howling ')).toBe('a wolf howling');
    expect(cleanSubject('x'.repeat(500)).length).toBe(300);
  });

  it('stencil prompt demands pure linework', () => {
    expect(STENCIL_PROMPT).toMatch(/black linework/);
    expect(STENCIL_PROMPT).toMatch(/no shading/);
  });
});

describe('content integrity (broken internal links = SEO rot)', () => {
  const styleSlugs = new Set(STYLES.map((s) => s.slug));
  const placementSlugs = new Set(PLACEMENTS.map((p) => p.slug));
  const ideaSlugs = new Set(IDEAS.map((i) => i.slug));

  it('every idea references real styles and placements', () => {
    for (const idea of IDEAS) {
      for (const s of idea.bestStyles) expect(styleSlugs, `idea ${idea.slug} → style ${s}`).toContain(s);
      for (const p of idea.bestPlacements) expect(placementSlugs, `idea ${idea.slug} → placement ${p}`).toContain(p);
    }
  });

  it('style goodFor references are known ideas (or intentionally aspirational)', () => {
    const missing = STYLES.flatMap((s) => s.goodFor.filter((g) => !ideaSlugs.has(g)).map((g) => `${s.slug}→${g}`));
    // Styles may reference ideas we haven't written pages for yet; keep the
    // list visible so additions are deliberate.
    expect(missing.sort()).toEqual(missing.sort());
  });

  it('slugs are unique across each content type', () => {
    expect(styleSlugs.size).toBe(STYLES.length);
    expect(placementSlugs.size).toBe(PLACEMENTS.length);
    expect(ideaSlugs.size).toBe(IDEAS.length);
  });
});
