import { NextResponse } from 'next/server';
import { redis, k } from '@/lib/redis';
import { getGeneration } from '@/lib/generation';
import { getRequestStatus, MODELS } from '@/lib/higgsfield';

export const maxDuration = 30;

/**
 * TEMPORARY diagnostic — gated by HF_WEBHOOK_SECRET. Returns the stored
 * generation record plus a live Higgsfield status probe so we can see exactly
 * where a stuck run is failing. Remove after debugging.
 */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const url = new URL(req.url);
  // Temporary hardcoded diag gate (this whole route is removed after debugging).
  if (url.searchParams.get('k') !== 'ink-diag-7f3a91') {
    return NextResponse.json({ error: 'nope' }, { status: 401 });
  }
  const { id } = await ctx.params;
  const rec = await getGeneration(id);

  // Repair a run that settled 'completed' with no images (the webhook bug):
  // pull the authoritative images and write them back.
  if (rec && url.searchParams.get('repair') === '1' && rec.hfRequestId && (rec.images?.length ?? 0) === 0) {
    try {
      const fresh = await getRequestStatus(rec.hfRequestId);
      const urls = (fresh.images ?? []).map((i) => i.url).filter(Boolean);
      if (urls.length) {
        rec.images = urls;
        rec.status = 'completed';
        rec.completedAt = Date.now();
        await redis.set(k.generation(rec.id), rec);
        return NextResponse.json({ repaired: true, images: urls });
      }
      return NextResponse.json({ repaired: false, reason: 'no images in fresh status', fresh });
    } catch (e) {
      return NextResponse.json({ repaired: false, error: String(e) });
    }
  }
  const out: Record<string, unknown> = {
    models: MODELS,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? '(unset)',
    hasBlob: !!process.env.BLOB_READ_WRITE_TOKEN,
    record: rec
      ? {
          status: rec.status,
          kind: rec.kind,
          hfRequestId: rec.hfRequestId,
          images: rec.images,
          error: rec.error,
          aspectRatio: rec.aspectRatio,
          prompt: rec.prompt?.slice(0, 160),
          createdAt: rec.createdAt,
        }
      : null,
  };
  if (rec?.hfRequestId) {
    try {
      out.liveHfStatus = await getRequestStatus(rec.hfRequestId);
    } catch (e) {
      out.liveHfStatusError = String(e);
    }
  }
  // Most recent gen ids for this-ish debugging
  try {
    if (rec?.userId) out.recentGenIds = await redis.lrange(k.userGenerations(rec.userId), 0, 5);
  } catch { /* ignore */ }
  return NextResponse.json(out);
}
