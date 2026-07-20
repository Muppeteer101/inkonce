import { STYLES, type TattooStyle } from './content/styles';
import { PLACEMENTS } from './content/placements';

/**
 * Tattoo prompt engine — where output quality comes from.
 *
 * General image models produce mediocre tattoos out of the box: soft edges,
 * skin renders, muddy mid-tones, compositions that ignore body flow. Every
 * prompt built here enforces the four things a usable tattoo design needs:
 *
 *   1. FLASH FORMAT — isolated design on a clean background, not a photo of
 *      a tattooed arm. Artists work from flash, and it previews cleanly.
 *   2. STYLE DISCIPLINE — each of the 28 styles carries a hand-written
 *      fragment naming its technique vocabulary (whip shading, bold outlines,
 *      single-needle, tebori…), which anchors the model in the real genre.
 *   3. INK PHYSICS — high contrast and deliberate line weight. Tattoos age;
 *      designs that are all mid-tone grey heal into mush.
 *   4. BODY FLOW — placement-aware composition (vertical flow for a forearm,
 *      circular for a shoulder cap) via each placement's composition hint.
 */

export type Complexity = 'simple' | 'balanced' | 'detailed';
export type ColorMode = 'blackwork' | 'black-and-grey' | 'color';

export type PromptInput = {
  subject: string;
  styleSlug: string;
  placementSlug?: string;
  complexity?: Complexity;
  colorMode?: ColorMode;
};

const COMPLEXITY_FRAGMENTS: Record<Complexity, string> = {
  simple:
    'minimal, clean and readable at small size, generous negative space, few well-chosen elements',
  balanced:
    'balanced level of detail, clear focal point, composition readable from a distance',
  detailed:
    'intricate, richly detailed, layered composition that still keeps a strong silhouette',
};

const COLOR_FRAGMENTS: Record<ColorMode, string> = {
  blackwork: 'solid black ink only, no grey shading, no color',
  'black-and-grey':
    'black and grey ink only, smooth graduated shading, no color',
  color: 'a controlled tattoo color palette with black structural linework',
};

/** The flash-format contract appended to every design prompt. */
const FLASH_SUFFIX =
  'flat 2D tattoo flash artwork, isolated on a plain solid white background, ' +
  'crisp confident linework, high contrast, deliberate line weights that will ' +
  'age well in skin, centered composition, vector-style clean flash sheet, ' +
  'no skin, no body, no hands, no arm, no person, no paper, no pen, no photo, ' +
  'no mockup, no watermark, no text, no words, no letters, no caption, ' +
  'no title, no signature, no frame, no border';

export function getStyle(slug: string): TattooStyle | undefined {
  return STYLES.find((s) => s.slug === slug);
}

export function buildTattooPrompt(input: PromptInput): {
  prompt: string;
  aspectRatio: string;
} {
  const style = getStyle(input.styleSlug);
  if (!style) throw new Error(`Unknown style: ${input.styleSlug}`);
  const placement = input.placementSlug
    ? PLACEMENTS.find((p) => p.slug === input.placementSlug)
    : undefined;

  const complexity = COMPLEXITY_FRAGMENTS[input.complexity ?? 'balanced'];
  // Styles with a fixed color identity (e.g. American Traditional) win over
  // the user toggle unless the user explicitly chose a mode.
  const colorMode = input.colorMode ?? style.defaultColorMode;
  const color = COLOR_FRAGMENTS[colorMode];

  const parts = [
    `${style.promptFragment} tattoo design of ${input.subject.trim()}`,
    complexity,
    color,
    placement?.compositionHint,
    FLASH_SUFFIX,
  ].filter(Boolean);

  return {
    prompt: parts.join(', '),
    aspectRatio: placement?.aspectRatio ?? '3:4',
  };
}

/** Instruction prompt for the image-edit model that produces a stencil. */
export const STENCIL_PROMPT =
  'Convert this tattoo design into a clean professional tattoo stencil: pure ' +
  'black linework on a white background, uniform line weight, no shading ' +
  'fills, no grey, preserve every structural line and proportion exactly, ' +
  'ready for thermal transfer paper';

/**
 * Sanitize free-text subjects. People write "a tattoo of a wolf" or "I want a
 * skull design" — we prepend "tattoo design of", so strip those meta-phrases to
 * avoid "tattoo design of a tattoo of...". Also drop trailing clauses that make
 * the model try to render text (references to books/films/song lyrics), which
 * is where the garbled lettering comes from.
 */
export function cleanSubject(raw: string): string {
  let s = raw.replace(/\s+/g, ' ').trim();
  // Strip leading meta-phrases, repeatedly.
  const leads = /^(i\s+want\s+|i'?d\s+like\s+|please\s+|can\s+you\s+(make|design|do)\s+|a\s+|an\s+|the\s+|some\s+|design\s+of\s+|tattoo\s+(design\s+|idea\s+)?of\s+|tattoo\s+)/i;
  let prev;
  do { prev = s; s = s.replace(leads, ''); } while (s !== prev);
  // Drop "from the X novels/books/films" style attribution clauses that push
  // the model toward rendering titles/text rather than an image.
  s = s.replace(/,?\s+(from|based on|inspired by|in the style of)\s+the?\b.*$/i, '');
  return s.trim().slice(0, 200) || raw.trim().slice(0, 200);
}
