import { put } from '@vercel/blob';
import { redis, k, bumpCounter } from './redis';
import { consume, refund, type UsageKind } from './credits';
import {
  submitGeneration,
  getRequestStatus,
  type HfStatusResponse,
  type ModelTier,
} from './higgsfield';
import { buildTattooPrompt, cleanSubject, STENCIL_PROMPT, type PromptInput } from './prompts';
import { DRAFT_IMAGES_PER_RUN, REFINE_IMAGES_PER_RUN } from './plans';

export type GenerationKind = 'draft' | 'refine' | 'stencil' | 'hires';

export type GenerationRecord = {
  id: string;
  userId: string;
  kind: GenerationKind;
  status: 'pending' | 'completed' | 'failed' | 'nsfw';
  subject: string;
  styleSlug: string;
  placementSlug?: string;
  prompt: string;
  aspectRatio: string;
  hfRequestId?: string;
  /** Permanent Blob URLs once mirrored; Higgsfield CDN URLs until then. */
  images: string[];
  /** For refine/stencil/hires: the source generation. */
  parentId?: string;
  isPublic: boolean;
  createdAt: number;
  completedAt?: number;
  error?: string;
};

const KIND_TO_USAGE: Record<GenerationKind, UsageKind> = {
  draft: 'draftRuns',
  refine: 'refineRuns',
  stencil: 'stencilExports',
  hires: 'hiResExports',
};

const KIND_TO_TIER: Record<GenerationKind, ModelTier> = {
  draft: 'draft',
  refine: 'refine',
  stencil: 'stencil',
  hires: 'refine', // hi-res runs the quality model at export resolution
};

function newId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 20);
}

export async function getGeneration(genId: string): Promise<GenerationRecord | null> {
  return await redis.get<GenerationRecord>(k.generation(genId));
}

async function saveGeneration(rec: GenerationRecord): Promise<void> {
  await redis.set(k.generation(rec.id), rec);
}

export type StartDraftInput = PromptInput & { userId: string };

/**
 * Start a draft or refine run. Consumes allowance first (atomic), refunds on
 * submit failure. Returns the pending record; images arrive via webhook/poll.
 */
export async function startDesignRun(
  input: StartDraftInput,
  kind: 'draft' | 'refine',
  parentId?: string,
): Promise<GenerationRecord> {
  const subject = cleanSubject(input.subject);
  if (!subject) throw new UserFacingError('Describe your tattoo idea first.');
  const { prompt, aspectRatio } = buildTattooPrompt({ ...input, subject });

  const usageKind = KIND_TO_USAGE[kind];
  const ok = await consume(input.userId, usageKind);
  if (!ok) throw new AllowanceError(usageKind);

  const rec: GenerationRecord = {
    id: newId(),
    userId: input.userId,
    kind,
    status: 'pending',
    subject,
    styleSlug: input.styleSlug,
    placementSlug: input.placementSlug,
    prompt,
    aspectRatio,
    images: [],
    parentId,
    isPublic: false,
    createdAt: Date.now(),
  };

  try {
    const submitted = await submitGeneration({
      tier: KIND_TO_TIER[kind],
      prompt,
      aspectRatio,
      batchSize: kind === 'draft' ? DRAFT_IMAGES_PER_RUN : REFINE_IMAGES_PER_RUN,
      genId: rec.id,
    });
    rec.hfRequestId = submitted.request_id;
  } catch (err) {
    await refund(input.userId, usageKind);
    throw err;
  }

  await Promise.all([
    saveGeneration(rec),
    redis.set(k.hfRequest(rec.hfRequestId!), rec.id, { ex: 60 * 60 * 24 }),
    redis.lpush(k.userGenerations(input.userId), rec.id),
    bumpCounter(`gen:${kind}`),
  ]);
  return rec;
}

/** Start a stencil or hi-res export from a completed parent design. */
export async function startExport(
  userId: string,
  parentId: string,
  imageIndex: number,
  kind: 'stencil' | 'hires',
): Promise<GenerationRecord> {
  const parent = await getGeneration(parentId);
  if (!parent || parent.userId !== userId) throw new UserFacingError('Design not found.');
  const source = parent.images[imageIndex];
  if (parent.status !== 'completed' || !source) {
    throw new UserFacingError('That design has not finished generating yet.');
  }

  const usageKind = KIND_TO_USAGE[kind];
  const ok = await consume(userId, usageKind);
  if (!ok) throw new AllowanceError(usageKind);

  const prompt =
    kind === 'stencil'
      ? STENCIL_PROMPT
      : `${parent.prompt}, ultra high resolution master render of this exact design`;

  const rec: GenerationRecord = {
    id: newId(),
    userId,
    kind,
    status: 'pending',
    subject: parent.subject,
    styleSlug: parent.styleSlug,
    placementSlug: parent.placementSlug,
    prompt,
    aspectRatio: parent.aspectRatio,
    images: [],
    parentId,
    isPublic: false,
    createdAt: Date.now(),
  };

  try {
    const submitted = await submitGeneration({
      tier: KIND_TO_TIER[kind],
      prompt,
      aspectRatio: parent.aspectRatio,
      batchSize: 1,
      imageUrl: source,
      genId: rec.id,
    });
    rec.hfRequestId = submitted.request_id;
  } catch (err) {
    await refund(userId, usageKind);
    throw err;
  }

  await Promise.all([
    saveGeneration(rec),
    redis.set(k.hfRequest(rec.hfRequestId!), rec.id, { ex: 60 * 60 * 24 }),
    redis.lpush(k.userGenerations(userId), rec.id),
    bumpCounter(`gen:${kind}`),
  ]);
  return rec;
}

/**
 * Apply a terminal Higgsfield result to a generation. Idempotent (webhook
 * retries + poll racing the webhook are both expected). Mirrors images to
 * Vercel Blob — Higgsfield deletes outputs after ~7 days; "keep your designs
 * forever" is a product promise, so Blob is the system of record.
 */
export async function applyResult(
  genId: string,
  result: Pick<HfStatusResponse, 'status' | 'images' | 'error'>,
): Promise<GenerationRecord | null> {
  const rec = await getGeneration(genId);
  if (!rec) return null;
  if (rec.status !== 'pending') return rec; // already settled — idempotent

  if (result.status === 'completed') {
    let urls = (result.images ?? []).map((i) => i.url).filter(Boolean);
    // Higgsfield's completion *webhook* frequently omits the images array —
    // only the status endpoint carries it reliably. Never settle a completed
    // run with zero images: re-fetch the authoritative status, and if it's
    // still empty, stay pending so the next poll recovers it.
    if (urls.length === 0 && rec.hfRequestId) {
      try {
        const fresh = await getRequestStatus(rec.hfRequestId);
        urls = (fresh.images ?? []).map((i) => i.url).filter(Boolean);
      } catch {
        /* transient — fall through to the pending guard below */
      }
    }
    if (urls.length === 0) return rec; // not truly ready yet; keep polling
    rec.images = await mirrorToBlob(rec, urls);
    rec.status = 'completed';
    rec.completedAt = Date.now();
  } else if (result.status === 'failed' || result.status === 'nsfw') {
    rec.status = result.status;
    rec.error =
      result.status === 'nsfw'
        ? 'That idea was blocked by the content filter. Rephrase and try again — the run was not counted.'
        : (result.error ?? 'Generation failed. The run was not counted.');
    rec.completedAt = Date.now();
    // Higgsfield refunds us for failed/NSFW runs; pass that on.
    await refund(rec.userId, KIND_TO_USAGE[rec.kind]);
  } else {
    return rec; // still queued/in_progress
  }

  await saveGeneration(rec);
  await bumpCounter(`gen:${rec.kind}:${rec.status}`);
  return rec;
}

/** Poll fallback for when the webhook hasn't landed (or local dev). */
export async function pollGeneration(genId: string): Promise<GenerationRecord | null> {
  const rec = await getGeneration(genId);
  if (!rec || rec.status !== 'pending' || !rec.hfRequestId) return rec;
  // Don't hammer Higgsfield for brand-new requests.
  if (Date.now() - rec.createdAt < 2_000) return rec;
  try {
    const status = await getRequestStatus(rec.hfRequestId);
    return (await applyResult(genId, status)) ?? rec;
  } catch {
    return rec; // transient — client will poll again
  }
}

async function mirrorToBlob(rec: GenerationRecord, urls: string[]): Promise<string[]> {
  return await Promise.all(
    urls.map(async (url, i) => {
      try {
        const res = await fetch(url);
        if (!res.ok) return url;
        const contentType = res.headers.get('content-type') ?? 'image/jpeg';
        const ext = contentType.includes('png') ? 'png' : 'jpg';
        const blob = await put(
          `designs/${rec.userId}/${rec.id}-${i}.${ext}`,
          await res.arrayBuffer(),
          { access: 'public', contentType, addRandomSuffix: true },
        );
        return blob.url;
      } catch {
        return url; // fall back to source URL rather than losing the image
      }
    }),
  );
}

/** Client-safe view of a generation — prompt engineering stays server-side. */
export function publicView(rec: GenerationRecord) {
  const { id, kind, status, subject, styleSlug, placementSlug, images, error, createdAt } = rec;
  return { id, kind, status, subject, styleSlug, placementSlug, images, error, createdAt };
}

export class UserFacingError extends Error {}

export class AllowanceError extends Error {
  usageKind: UsageKind;
  constructor(usageKind: UsageKind) {
    super(`Allowance exceeded: ${usageKind}`);
    this.usageKind = usageKind;
  }
}
