/**
 * Provider-agnostic generation types.
 *
 * The shape here is deliberately **submit/settle**, not request/response. Every
 * renderer we use is an async queue: you hand it a job, it hands back a
 * reference, and the result arrives later on a webhook (with polling as the
 * fallback). An interface that returned finished images from one call would
 * have to hold a serverless invocation open for the whole generation, which
 * neither Vercel's function limits nor the existing GenerationRecord flow
 * tolerate.
 */

/** What the run is for. Drives model choice, not provider choice. */
export type GenTask = 'draft' | 'refine' | 'stencil' | 'hires';

export type GenRequest = {
  /** Fully assembled positive prompt (lib/prompts owns the flash contract). */
  prompt: string;
  /**
   * Things to keep out of the image. Provider-conditional: the distilled FLUX
   * models have no negative conditioning at all, so an adapter that cannot
   * honour this must fold it into the positive prompt or drop it — see
   * `ModelCapabilities.negativePrompt`. Never assume it was applied.
   */
  negativePrompt?: string;
  aspectRatio: string;
  batchSize: number;
  /** Source image for edit-style tasks (stencil). */
  imageUrl?: string;
  /** Our correlation id, echoed back through the webhook URL. */
  genId: string;
};

/**
 * Why a run ended, and — crucially — whether the user should be charged.
 *
 * The old Higgsfield-only path could get away without this: Higgsfield refunds
 * failed and NSFW runs, so "not completed" meant "not charged". That contract
 * does not generalise. Replicate bills for predictions that reach `succeeded`
 * even when a safety checker blanks the output, and bills nothing for its own
 * infrastructure failures. Collapsing those into one "failed" state would
 * either charge people for images they never got or silently eat real costs,
 * so the outcome carries `chargeable` explicitly rather than leaving callers
 * to infer it.
 */
export type GenOutcome =
  /** Images are ready. */
  | 'completed'
  /** Still queued or running — not terminal, do not settle. */
  | 'pending'
  /** Provider or model error. Not the user's fault; refund. */
  | 'failed'
  /** Blocked by a content filter. Refund, and tell the user to rephrase. */
  | 'filtered';

export type GenResult = {
  outcome: GenOutcome;
  /** Provider-hosted URLs. Callers mirror these to durable storage. */
  images: string[];
  /** Whether the provider bills us for this run (drives the user refund). */
  chargeable: boolean;
  /** Provider-supplied failure text, for logs and the user-facing message. */
  error?: string;
};

/** Handle returned at submit time; stored on the record to settle against. */
export type SubmitResult = {
  /** Opaque, provider-scoped id. */
  providerRef: string;
};

/**
 * What a specific model can actually do. The router consults this so callers
 * never have to special-case a model — e.g. asking for a negative prompt on a
 * model without negative conditioning is a no-op rather than a silent lie.
 */
export type ModelCapabilities = {
  negativePrompt: boolean;
  /** Accepts a source image (needed for stencil conversion). */
  imageToImage: boolean;
  /** Batch sizes the model will accept; 1 is always assumed valid. */
  batchSizes: number[];
};

/** A fully-resolved rendering choice: who runs it, which model, what it costs. */
export type ModelChoice = {
  provider: string;
  /** Provider-scoped model identifier. */
  modelId: string;
  /**
   * Pinned version hash, for providers that distinguish first-party models
   * from community ones.
   *
   * On Replicate this is not optional detail: only "official" models answer at
   * `/models/{owner}/{name}/predictions`. Everything else — which is *every*
   * tattoo-specific fine-tune worth having — 404s there and must be called
   * version-pinned via `/v1/predictions`. Pinning is also the correct default
   * for a community model, since its owner can retrain and silently change
   * what you render.
   */
  version?: string;
  /**
   * Observed cost per image in USD. Recorded on the generation so per-model
   * COGS is attributable after the fact instead of inferred from a table that
   * may have drifted (see PRICING.md — the previous table priced models this
   * account could not even reach).
   */
  costPerImageUsd: number;
  capabilities: ModelCapabilities;
};
