import type { GenRequest, GenResult, ModelChoice, SubmitResult } from './types';

/**
 * What every renderer must implement.
 *
 * Three methods rather than one `generate()`: submit the job, settle it from a
 * webhook when one arrives, and poll as the fallback. Adding a provider means
 * writing one of these and one row in the router table — no changes in
 * lib/generation.
 */
export interface ImageProvider {
  /** Stable key used in the router table and persisted on the record. */
  readonly name: string;

  /** Enqueue a run. Returns the reference needed to settle it later. */
  submit(req: GenRequest, model: ModelChoice, webhookUrl: string): Promise<SubmitResult>;

  /**
   * Turn a webhook delivery into a result.
   *
   * Returns null when the payload is not a terminal state we act on, so the
   * caller can no-op rather than guess. Implementations MUST verify
   * authenticity — a forged "completed" is a free generation, and a forged
   * "failed" is a free refund.
   */
  parseWebhook(rawBody: string, headers: Headers): Promise<GenResult | null>;

  /** Authoritative fetch, for when the webhook is late, lost, or local dev. */
  poll(providerRef: string): Promise<GenResult>;
}

/** Thrown when a submit is rejected before anything was charged. */
export class ProviderSubmitError extends Error {
  readonly retryable: boolean;
  constructor(message: string, retryable = false) {
    super(message);
    this.retryable = retryable;
  }
}
