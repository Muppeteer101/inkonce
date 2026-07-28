import type { GenTask, ModelCapabilities, ModelChoice } from './types';

/**
 * Model routing.
 *
 * One table, consulted by lib/generation, so adding or swapping a model is a
 * one-line change and never touches the generation flow. Two rules learned the
 * hard way:
 *
 *   1. **Capabilities are declared, not assumed.** The previous engine sent
 *      negative prompts to a model with no negative conditioning and quietly
 *      got nothing for it. If a model cannot do a thing, say so here and the
 *      adapter will stop pretending.
 *   2. **Cost lives next to the model.** PRICING.md's table once priced three
 *      tiers this account could not reach, so the margin guardrail was green on
 *      a product we did not ship. `costPerImageUsd` is recorded on every
 *      generation, which makes COGS attributable after the fact instead of
 *      inferred.
 */

const FLUX_CAPS: ModelCapabilities = {
  // Distilled FLUX has no CFG-based negative conditioning; the field is ignored.
  negativePrompt: false,
  imageToImage: false,
  batchSizes: [1, 2, 3, 4],
};

const SDXL_CAPS: ModelCapabilities = {
  negativePrompt: true,
  imageToImage: false,
  batchSizes: [1, 2, 3, 4],
};

/** Editing-capable models: accept a source image, one output at a time. */
const EDIT_CAPS: ModelCapabilities = {
  negativePrompt: false,
  imageToImage: true,
  batchSizes: [1],
};

/**
 * Known models, keyed by a short internal name.
 *
 * Costs are Replicate's published per-image prices (July 2026). Models billed
 * by compute time are recorded at their observed per-image average — treat
 * those as estimates and reconcile against the Replicate dashboard, exactly as
 * PRICING.md §1 requires.
 */
export const MODELS: Record<string, ModelChoice> = {
  'flux-schnell': {
    provider: 'replicate',
    modelId: 'black-forest-labs/flux-schnell',
    costPerImageUsd: 0.003,
    capabilities: FLUX_CAPS,
  },
  'flux-dev': {
    provider: 'replicate',
    modelId: 'black-forest-labs/flux-dev',
    costPerImageUsd: 0.025,
    capabilities: FLUX_CAPS,
  },
  'flux-pro': {
    provider: 'replicate',
    modelId: 'black-forest-labs/flux-1.1-pro',
    costPerImageUsd: 0.04,
    capabilities: FLUX_CAPS,
  },
  /**
   * ⚠️ Trained on **photos of freshly inked tattoos** — i.e. tattoos on skin.
   *
   * The rebuild plan named this as the ready-made tattoo model to adopt, but
   * its training distribution is the exact thing FLASH_SUFFIX spends half its
   * tokens suppressing ("no skin, no body, no hands, no arm, no person, no
   * photo, no mockup"). Pointing the draft tier at it means fighting the model
   * on every generation. Kept in the table because it is genuinely good at
   * *rendered* tattoos — useful later for on-skin previews, which is a feature
   * we do not have yet — but it is not a flash model.
   */
  'fresh-ink': {
    provider: 'replicate',
    modelId: 'fofr/sdxl-fresh-ink',
    version: '8515c238222fa529763ec99b4ba1fa9d32ab5d6ebc82b4281de99e4dbdcec943',
    costPerImageUsd: 0.014,
    capabilities: SDXL_CAPS,
  },

  /**
   * Tattoo LoRAs over FLUX. These are the actually-tattoo-specific options —
   * all community models, so all version-pinned (see ModelChoice.version).
   */
  'tattty-flash': {
    // Trained on 678 *sketch designs*, not skin photos — the right shape for
    // flash, and the closest thing on offer to BlackInk's own fine-tune.
    // Benchmarked well: correct characters, clean white ground, good shading.
    provider: 'replicate',
    modelId: 'tattzy25/tattty_4_all',
    version: '4e8f6c1dc77db77dabaf98318cde3679375a399b434ae2db0e698804ac84919c',
    costPerImageUsd: 0.01,
    capabilities: { ...FLUX_CAPS, batchSizes: [1, 2, 3, 4] },
  },
  'heavy-hand': {
    // "Heavy contrast blackwork trained straight from my portfolio." Beat every
    // general model on solid blackwork — real filled shapes rather than the
    // scale-texture illustration the general models default to — at a third of
    // seedream-4's price. This is the one place routing currently earns its keep.
    provider: 'replicate',
    modelId: 'tattzy25/heavy_hand_dark',
    version: '6955360784cdc441a7bd328874a370ec20a86c545b9ea0d765cef3fb66623569',
    costPerImageUsd: 0.01,
    capabilities: FLUX_CAPS,
  },
  fontivate: {
    // Lettering LoRA. Benchmarked clean, but no better than the $0.003 default,
    // so it earns no override — kept for future re-testing.
    provider: 'replicate',
    modelId: 'tattzy25/fontivate-v0',
    version: '0799b47346ff3bba880a18de24bd84cf63331fd24d579a2c5abba085c2367be5',
    costPerImageUsd: 0.01,
    capabilities: FLUX_CAPS,
  },
  'ideogram-v3': {
    provider: 'replicate',
    modelId: 'ideogram-ai/ideogram-v3-turbo',
    costPerImageUsd: 0.03,
    capabilities: { ...FLUX_CAPS, batchSizes: [1] },
  },
  'nano-banana': {
    provider: 'replicate',
    modelId: 'google/nano-banana',
    costPerImageUsd: 0.039,
    capabilities: EDIT_CAPS,
  },
  'seedream-4': {
    provider: 'replicate',
    modelId: 'bytedance/seedream-4',
    costPerImageUsd: 0.03,
    capabilities: EDIT_CAPS,
  },
};

export type RouteInput = {
  task: GenTask;
  styleSlug?: string;
  /** Reserved for reference-image support; already affects model suitability. */
  hasReferences?: boolean;
};

/**
 * Per-style overrides, chosen from the Step-0 benchmark rather than assumption.
 * See docs/MODEL_BENCHMARK.md. One row, and not the one the plan predicted.
 *
 * The plan expected **lettering** to need a specialist. It doesn't: every model
 * spelled the test phrase correctly, the general models produced better tattoo
 * script than the candidate specialist, and Ideogram tinted the background on
 * all five cases — which breaks the flash contract outright.
 *
 * Where routing *does* pay is **blackwork**, because the style asks for
 * something general models resist: solid filled black shapes rather than
 * scale-texture illustration. An artist's own blackwork LoRA produced real
 * fills at a third of the refine model's price.
 *
 * Add a row only when a benchmark shows a model measurably winning a style.
 */
const STYLE_OVERRIDES: Record<string, Partial<Record<GenTask, string>>> = {
  blackwork: { draft: 'heavy-hand', refine: 'heavy-hand', hires: 'heavy-hand' },
};

/**
 * Defaults per task, set from the benchmark. Env vars win, so prod can be
 * retuned without a deploy.
 *
 * Draft is deliberately the cheapest capable model rather than the best one:
 * exploration is where volume lives, and draft $/image is multiplied ~200× by
 * the free tier (3 free runs ÷ 3% conversion), so it dominates unit economics.
 * Quality spend belongs at refine and export, once a user has chosen a concept.
 */
const TASK_DEFAULTS: Record<GenTask, string> = {
  draft: process.env.INK_MODEL_DRAFT || 'flux-schnell',
  refine: process.env.INK_MODEL_REFINE || 'seedream-4',
  // Stencil is an image edit, so it must come from an editing-capable model.
  stencil: process.env.INK_MODEL_STENCIL || 'seedream-4',
  hires: process.env.INK_MODEL_HIRES || 'seedream-4',
};

export function selectModel(input: RouteInput): ModelChoice {
  const override = input.styleSlug ? STYLE_OVERRIDES[input.styleSlug]?.[input.task] : undefined;
  const key = override ?? TASK_DEFAULTS[input.task];
  const model = MODELS[key];
  if (!model) throw new Error(`Router: unknown model "${key}" for task ${input.task}`);

  // A stencil run against a model that cannot take a source image would
  // silently produce an unrelated picture rather than a stencil of the chosen
  // design, so fail loudly at selection instead.
  if (input.task === 'stencil' && !model.capabilities.imageToImage) {
    throw new Error(`Router: "${key}" cannot do image-to-image, required for stencil`);
  }
  return model;
}
