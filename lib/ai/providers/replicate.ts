import { createHmac, timingSafeEqual } from 'node:crypto';
import { ProviderSubmitError, type ImageProvider } from '../provider';
import type { GenRequest, GenResult, ModelChoice, SubmitResult } from '../types';

/**
 * Replicate adapter (https://replicate.com/docs).
 *
 * Submit returns a prediction id immediately; the result arrives on our
 * webhook, with `poll` as the authoritative fallback. Unlike the Higgsfield
 * path this replaces, Replicate offers no "failed runs are auto-refunded"
 * guarantee, so mapping its statuses onto our outcome taxonomy is where the
 * money correctness lives — see `toResult`.
 */

const BASE = 'https://api.replicate.com/v1';

function token(): string {
  const t = process.env.REPLICATE_API_TOKEN;
  if (!t) throw new ProviderSubmitError('REPLICATE_API_TOKEN not set');
  return t;
}

type ReplicatePrediction = {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[] | null;
  error?: string | null;
  metrics?: { predict_time?: number };
};

/** Replicate returns either a bare URL or a list of them, depending on model. */
function outputUrls(p: ReplicatePrediction): string[] {
  const out = p.output;
  if (!out) return [];
  return (Array.isArray(out) ? out : [out]).filter(
    (u): u is string => typeof u === 'string' && u.length > 0,
  );
}

const FILTER_HINTS = /nsfw|safety|flagged|content policy|sensitive/i;

/**
 * Map a prediction onto our outcome taxonomy.
 *
 * The subtle case is `succeeded` with no images. Several models run a safety
 * checker *after* generation and return success with the output blanked — the
 * compute happened, Replicate bills us, and the user has nothing. That is
 * `filtered`, not `failed`: chargeable to us, refundable to them, and worth a
 * different message because rephrasing actually helps.
 */
function toResult(p: ReplicatePrediction): GenResult {
  const images = outputUrls(p);
  const ran = typeof p.metrics?.predict_time === 'number';

  if (p.status === 'starting' || p.status === 'processing') {
    return { outcome: 'pending', images: [], chargeable: false };
  }
  if (p.status === 'succeeded') {
    if (images.length > 0) return { outcome: 'completed', images, chargeable: true };
    return {
      outcome: 'filtered',
      images: [],
      chargeable: true,
      error: 'The safety filter blocked that idea. Rephrase and try again — the run was not counted.',
    };
  }
  if (p.status === 'canceled') {
    return { outcome: 'failed', images: [], chargeable: false, error: 'Run cancelled.' };
  }
  // failed
  const err = p.error ?? 'Generation failed.';
  if (FILTER_HINTS.test(err)) {
    return {
      outcome: 'filtered',
      images: [],
      chargeable: ran,
      error: 'The safety filter blocked that idea. Rephrase and try again — the run was not counted.',
    };
  }
  return { outcome: 'failed', images: [], chargeable: ran, error: err };
}

/**
 * Verify a Replicate webhook (svix scheme).
 *
 * Signed content is `${id}.${timestamp}.${body}`, HMAC-SHA256 with the base64
 * body of the `whsec_` secret, compared in constant time. The header may carry
 * several space-separated `v1,<sig>` values during secret rotation, so any
 * match counts. Timestamp is checked to bound replay.
 */
export function verifyWebhook(rawBody: string, headers: Headers, secret: string): boolean {
  const id = headers.get('webhook-id');
  const ts = headers.get('webhook-timestamp');
  const sigHeader = headers.get('webhook-signature');
  if (!id || !ts || !sigHeader || !secret) return false;

  const age = Math.abs(Date.now() / 1000 - Number(ts));
  if (!Number.isFinite(age) || age > 5 * 60) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = createHmac('sha256', key).update(`${id}.${ts}.${rawBody}`).digest();

  return sigHeader.split(' ').some((part) => {
    const [version, value] = part.split(',');
    if (version !== 'v1' || !value) return false;
    const given = Buffer.from(value, 'base64');
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

export class ReplicateProvider implements ImageProvider {
  readonly name = 'replicate';

  async submit(req: GenRequest, model: ModelChoice, webhookUrl: string): Promise<SubmitResult> {
    const input: Record<string, unknown> = {
      prompt: req.prompt,
      aspect_ratio: req.aspectRatio,
    };
    // Only send a negative prompt to models that actually condition on one;
    // the distilled FLUX models silently ignore the field, which is how "the
    // model ignores our negatives" survived the last engine change.
    if (req.negativePrompt && model.capabilities.negativePrompt) {
      input.negative_prompt = req.negativePrompt;
    }
    if (req.imageUrl && model.capabilities.imageToImage) {
      input.image_input = [req.imageUrl];
    }
    if (model.capabilities.batchSizes.includes(req.batchSize) && req.batchSize > 1) {
      input.num_outputs = req.batchSize;
    }

    // Two endpoints, and picking the wrong one is a hard 404. Replicate's
    // `/models/{owner}/{name}/predictions` route serves *official* models only;
    // community models — including every tattoo-specific fine-tune — must be
    // called version-pinned through `/v1/predictions`.
    const { url, payload } = model.version
      ? {
          url: `${BASE}/predictions`,
          payload: { version: model.version, input },
        }
      : {
          url: `${BASE}/models/${model.modelId}/predictions`,
          payload: { input },
        };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        webhook: webhookUrl,
        webhook_events_filter: ['completed'],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      // 429 is this account's low-credit throttle (6/min, burst 1) far more
      // often than genuine overload — worth retrying rather than failing the
      // user's run outright.
      throw new ProviderSubmitError(
        `Replicate submit failed (${res.status}): ${text.slice(0, 300)}`,
        res.status === 429 || res.status >= 500,
      );
    }
    const p = (await res.json()) as ReplicatePrediction;
    return { providerRef: p.id };
  }

  async parseWebhook(rawBody: string, headers: Headers): Promise<GenResult | null> {
    const secret = process.env.REPLICATE_WEBHOOK_SECRET;
    if (!secret || !verifyWebhook(rawBody, headers, secret)) return null;
    let p: ReplicatePrediction;
    try {
      p = JSON.parse(rawBody) as ReplicatePrediction;
    } catch {
      return null;
    }
    const result = toResult(p);
    // Non-terminal deliveries are not ours to act on.
    return result.outcome === 'pending' ? null : result;
  }

  async poll(providerRef: string): Promise<GenResult> {
    const res = await fetch(`${BASE}/predictions/${providerRef}`, {
      headers: { Authorization: `Bearer ${token()}` },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Replicate status failed (${res.status})`);
    return toResult((await res.json()) as ReplicatePrediction);
  }
}

/** Exported for tests — the status mapping is the money-correctness surface. */
export const __testing = { toResult, outputUrls };
