import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import * as z from 'zod/v4';
import { STYLES } from '../content/styles';
import { cleanSubject } from '../prompts';

/**
 * The interpretation layer — what turns a sentence a person would actually type
 * into a brief an image model can render.
 *
 * ## Why this exists
 *
 * The renderer was never the problem. Step 0 (docs/MODEL_BENCHMARK.md) tested
 * five models against clean art direction and several were excellent. Then the
 * same pipeline was tested with phrases as *typed*, and it produced **one
 * acceptable result in five**:
 *
 *   - "a lion but make it look hard"              → a manga boy with a dagger
 *   - "something for my nan who passed away"      → a stock flower
 *   - "A tattoo of death, from the disc world     → a generic hooded reaper
 *      novels"
 *
 * Because `buildTattooPrompt` concatenates, the model literally received
 * `tattoo design of i need something to cover my exs name on my arm`. Nothing
 * in the pipeline understood the request; it only reformatted it.
 *
 * Competitors have the same gap and have mostly decided not to close it — they
 * constrain the input with dropdowns, publish "how to write the perfect prompt"
 * guides, or bolt on a one-shot "make my prompt more artistic" rewrite. That
 * last one is specifically the failure mode measured in the benchmark's
 * interpretation table: richer text produced a *worse* image, because a lotus
 * and a storm cloud arrived as two disconnected objects. Longer is not better.
 * **One unified composition** is the objective, and it is the constraint this
 * module is built around.
 *
 * ## Design rules
 *
 * 1. **Never block a generation.** No key, an API error, a timeout, or a
 *    refusal all degrade to today's behaviour (`cleanSubject`) rather than
 *    failing the run. The brain is an enhancement on a working path.
 * 2. **Bounded latency.** A draft renders in ~15s; the brain gets a hard
 *    deadline well inside that and is abandoned if it overruns.
 * 3. **Show the work.** `interpretation` is a one-line summary written for the
 *    user, so a wrong reading is visible and correctable instead of silently
 *    producing the wrong tattoo. This is the part no competitor surfaces.
 */

/** Style slugs offered to the interpreter, with a short label for grounding. */
const STYLE_MENU = STYLES.map((s) => `${s.slug} (${s.name}: ${s.tagline})`).join('\n');
const STYLE_SLUGS = new Set(STYLES.map((s) => s.slug));

/**
 * The rules encoded here are the findings from the benchmark, not general
 * prompt-writing advice. Each numbered item maps to an observed failure.
 */
const SYSTEM = `You are the design interpreter for a tattoo flash generator. A person types what they want in their own words — often vague, emotional, or oblique. You turn that into a single concrete visual brief that an image model can render.

You are NOT a prompt beautifier. Do not pad, do not add adjectives for their own sake, and do not stack extra motifs. Adding material the person did not ask for is a failure, not a service.

RULES

1. ONE UNIFIED COMPOSITION.
   The single most common failure is a brief that reads as a list, which renders as disconnected objects floating near each other. Every brief must describe one integrated image with one focal subject. If two ideas are present, bind them physically — a subject that is growing from, wrapped around, emerging out of, or held by the other. Never "X and Y" as separate items.

2. DESCRIBE, DON'T NAME.
   Image models do not reliably know characters, books, films, bands, or memes. Never rely on a proper noun to carry the picture. Translate it into what the thing LOOKS like, and keep the name only as a trailing hint.
   Bad:  "Death from the Discworld novels"
   Good: "a tall skeletal figure in a hooded black robe, empty eye sockets lit from within, holding a curved scythe and an hourglass, seated on a muscular living horse"

3. MEANING BECOMES IMAGERY.
   Emotional or biographical input ("for my nan who passed away", "getting through a hard year", "my daughter") carries no visual content on its own. Choose imagery that holds the meaning and describe THAT. Prefer the specific and personal over the generic: a named flower, a particular bird, an object with a story, rather than "a flower" or "a heart".

4. READ THE TONE WORDS.
   Ordinary phrases carry style information. "make it look hard", "something clean and small", "girly", "old-school", "not too busy" are instructions about weight, line, scale and palette. Translate them into the style and complexity fields rather than leaving them in the subject text.

5. HANDLE THE REAL TATTOO TASKS.
   - COVER-UP ("cover my ex's name", "over an old tattoo"): the design must be able to hide existing ink. Favour dense, high-coverage, dark subjects with organic irregular outer edges — foliage, wings, smoke, big cats, florals. Say so in the brief. Never propose a delicate fine-line design for a cover-up.
   - SCAR or STRETCH-MARK work: flowing organic forms that travel along the mark, not rigid geometry.
   - MEMORIAL: dignified, never morbid, unless the person asked for morbid.

6. NO WORDS IN THE IMAGE unless the person explicitly asked for text, a name, a quote or a date. If they did, put the exact string in quotation marks in the brief and nothing else textual.

7. STAY OFF THE BODY. Describe the artwork only. Never mention skin, an arm, placement, a person, a photo or a mockup — a later stage owns all of that.

8. RESPECT WHAT THEY SAID. Keep every concrete element they named. You may make it renderable; you may not replace it with something you like better.

OUTPUT FIELDS

subject: The brief. One sentence, 12–45 words, describing a single unified composition. No style name, no colour instruction, no "tattoo design of" prefix — later stages add those.

styleSlug: The best-fitting style from the menu, or null if they gave no signal and no subject-implied convention. Do not guess for the sake of filling it.

colorMode: "blackwork" (solid black only), "black-and-grey", or "color" — or null if unsignalled.

complexity: "simple", "balanced", or "detailed" — or null if unsignalled. Small placements and words like "minimal", "clean", "subtle" mean simple.

interpretation: One short sentence in second person telling the user how you read them, shown in the UI so they can correct you. Plain language, no jargon, no praise. e.g. "Read this as a memorial piece, so I've gone with forget-me-nots and a robin rather than a generic flower."

confidence: "high" when their words determined the image. "low" when you had to make a real creative choice they did not specify — the UI leans on this to invite a correction.

clarifyingQuestion: One short question, ONLY when a genuinely load-bearing detail is missing and any guess would likely be wrong. Otherwise null. Do not ask about things you can reasonably decide.

STYLE MENU
${STYLE_MENU}`;

const BriefSchema = z.object({
  subject: z.string(),
  styleSlug: z.string().nullable(),
  colorMode: z.enum(['blackwork', 'black-and-grey', 'color']).nullable(),
  complexity: z.enum(['simple', 'balanced', 'detailed']).nullable(),
  interpretation: z.string(),
  confidence: z.enum(['high', 'low']),
  clarifyingQuestion: z.string().nullable(),
});

export type TattooBrief = {
  /** Render-ready subject. Always populated, interpreted or not. */
  subject: string;
  styleSlug?: string;
  colorMode?: 'blackwork' | 'black-and-grey' | 'color';
  complexity?: 'simple' | 'balanced' | 'detailed';
  /** User-facing "here's how I read you". Absent when not interpreted. */
  interpretation?: string;
  confidence?: 'high' | 'low';
  clarifyingQuestion?: string;
  /** False when we fell back — the caller may want to say so, or not retry. */
  interpreted: boolean;
};

export type InterpretInput = {
  rawInput: string;
  /** A style the user already picked. Present means don't suggest one. */
  styleSlug?: string;
};

/**
 * Opus by default. The brain runs once per design pass while the images run
 * 25×, so at $0.003/draft the interpreter is a minority of the cost even at the
 * top tier — and interpretation quality is the entire reason this layer exists.
 * `INK_BRAIN_MODEL` moves it without a deploy if that trade changes.
 */
const MODEL = process.env.INK_BRAIN_MODEL || 'claude-opus-5';

/**
 * Hard ceiling on interpretation latency. A draft render is ~15s, and the API
 * route budget is 60s; a brain that overruns this is worth less than the
 * unblocked generation it is delaying, so it gets abandoned.
 */
const TIMEOUT_MS = Number(process.env.INK_BRAIN_TIMEOUT_MS || 15_000);

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client ??= new Anthropic();
  return client;
}

/** What the pipeline did before this module existed. Also the fallback. */
function passthrough(rawInput: string): TattooBrief {
  return { subject: cleanSubject(rawInput), interpreted: false };
}

export async function interpret(input: InterpretInput): Promise<TattooBrief> {
  const raw = input.rawInput.trim();
  if (!raw) return passthrough(raw);

  const anthropic = getClient();
  if (!anthropic) return passthrough(raw);

  const userTurn = input.styleSlug
    ? `${raw}\n\n[The user has already chosen the "${input.styleSlug}" style. Return null for styleSlug and do not name a style in the subject.]`
    : raw;

  try {
    const res = await anthropic.messages.parse(
      {
        model: MODEL,
        max_tokens: 2000,
        // The rules are the expensive part of this prompt and never vary, so
        // they cache; only the user's sentence is billed at full rate.
        system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userTurn }],
        output_config: {
          effort: 'medium',
          format: zodOutputFormat(BriefSchema),
        },
      },
      { timeout: TIMEOUT_MS },
    );

    const out = res.parsed_output;
    // A refusal, a truncation, or an empty subject all mean we have nothing
    // usable — the raw input is still better than a blank prompt.
    if (!out?.subject?.trim()) return passthrough(raw);

    return {
      subject: out.subject.trim().slice(0, 400),
      // The model is given the menu, but a hallucinated slug would throw deep
      // inside buildTattooPrompt, so it is checked rather than trusted.
      styleSlug:
        out.styleSlug && STYLE_SLUGS.has(out.styleSlug) ? out.styleSlug : undefined,
      colorMode: out.colorMode ?? undefined,
      complexity: out.complexity ?? undefined,
      interpretation: out.interpretation?.trim() || undefined,
      confidence: out.confidence,
      clarifyingQuestion: out.clarifyingQuestion?.trim() || undefined,
      interpreted: true,
    };
  } catch (err) {
    // Deliberately swallowed. Every failure mode here — no credit, rate limit,
    // timeout, malformed output — is survivable by rendering what they typed,
    // and a generation that fails because the *interpreter* was down would be
    // a worse product than the one we had before this file existed.
    console.error('brain: interpretation failed, falling back', {
      model: MODEL,
      err: err instanceof Error ? err.message : String(err),
    });
    return passthrough(raw);
  }
}

/** Exported for tests. */
export const __testing = { SYSTEM, BriefSchema, passthrough, STYLE_SLUGS };
