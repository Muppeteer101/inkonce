/**
 * Higgsfield platform API client (https://docs.higgsfield.ai).
 *
 * Async queue pattern: POST https://platform.higgsfield.ai/{model_id} returns
 * { status: 'queued', request_id, status_url }; completion arrives on our
 * webhook (?hf_webhook=) or by polling the status_url. Failed/NSFW requests
 * are never charged (credits auto-refunded).
 *
 * Model tiers map to the pricing model in lib/plans.ts — draft explores,
 * standard refines, premium exports. IDs are env-overridable so the exact
 * models can be tuned from the dashboard without a deploy.
 */

const BASE = 'https://platform.higgsfield.ai';

export type ModelTier = 'draft' | 'refine' | 'stencil';

// Model IDs verified against the account's live platform-API catalog
// (GET /models). Only Higgsfield's own Soul family is exposed on the developer
// API — Seedream/Flux/Nano-Banana are consumer-website only. Soul 2
// (soul/v2/standard) is the newest flagship, costs 0 credits, and produces
// clean flat flash with the flash-format prompt (lib/prompts FLASH_SUFFIX).
export const MODELS: Record<ModelTier, string> = {
  // Soul Standard reliably renders flat isolated flash (Soul 2 tends to add a
  // photoreal "paper held in hands" mockup, which is wrong for tattoo flash).
  // 1 credit (~$0.05) per image; margins still clear the 70% target.
  draft: process.env.HF_MODEL_DRAFT || 'higgsfield-ai/soul/standard',
  refine: process.env.HF_MODEL_REFINE || 'higgsfield-ai/soul/standard',
  stencil: process.env.HF_MODEL_STENCIL || 'higgsfield-ai/soul/standard',
};

export type HfStatus = 'queued' | 'in_progress' | 'completed' | 'failed' | 'nsfw';

export type HfSubmitResponse = {
  status: HfStatus;
  request_id: string;
  status_url: string;
  cancel_url?: string;
};

export type HfStatusResponse = HfSubmitResponse & {
  images?: { url: string }[];
  error?: string;
};

function authHeader(): string {
  const key = process.env.HIGGSFIELD_API_KEY;
  const secret = process.env.HIGGSFIELD_API_SECRET;
  if (!key || !secret) throw new Error('HIGGSFIELD_API_KEY / HIGGSFIELD_API_SECRET not set');
  return `Key ${key}:${secret}`;
}

export type SubmitParams = {
  tier: ModelTier;
  prompt: string;
  aspectRatio: string;
  /** Number of images requested for this run. */
  batchSize: number;
  /** Source image URL for image-edit (stencil) runs. */
  imageUrl?: string;
  /** Correlation id echoed back via the webhook URL path. */
  genId: string;
};

/**
 * Submit a generation. Returns the Higgsfield request_id. Results arrive on
 * /api/hf-webhook/{genId}?s={HF_WEBHOOK_SECRET}; polling the status endpoint
 * is the fallback (lib/generation.ts#pollGeneration).
 */
export async function submitGeneration(p: SubmitParams): Promise<HfSubmitResponse> {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://inkonce.com';
  const secret = process.env.HF_WEBHOOK_SECRET || '';
  const webhook = `${site}/api/hf-webhook/${p.genId}?s=${encodeURIComponent(secret)}`;

  const body: Record<string, unknown> = {
    prompt: p.prompt,
    aspect_ratio: p.aspectRatio,
    batch_size: p.batchSize,
  };
  if (p.imageUrl) body.image_url = p.imageUrl;

  const res = await fetch(`${BASE}/${MODELS[p.tier]}?hf_webhook=${encodeURIComponent(webhook)}`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Higgsfield submit failed (${res.status}): ${text.slice(0, 300)}`);
  }
  return (await res.json()) as HfSubmitResponse;
}

export async function getRequestStatus(requestId: string): Promise<HfStatusResponse> {
  const res = await fetch(`${BASE}/requests/${requestId}/status`, {
    headers: { Authorization: authHeader(), Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Higgsfield status failed (${res.status})`);
  }
  return (await res.json()) as HfStatusResponse;
}
