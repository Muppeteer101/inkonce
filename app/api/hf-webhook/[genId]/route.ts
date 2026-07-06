import { NextResponse } from 'next/server';
import { applyResult } from '@/lib/generation';
import type { HfStatus } from '@/lib/higgsfield';

export const maxDuration = 60;

/**
 * Higgsfield generation webhook. The URL carries our genId (set at submit
 * time) and a shared secret in ?s= — Higgsfield doesn't sign payloads, so the
 * secret-in-URL is the auth. applyResult is idempotent, so Higgsfield's
 * 2-hour retry loop and our client polling can race safely.
 */
export async function POST(req: Request, ctx: { params: Promise<{ genId: string }> }) {
  const url = new URL(req.url);
  const secret = process.env.HF_WEBHOOK_SECRET;
  if (!secret || url.searchParams.get('s') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { genId } = await ctx.params;
  const payload = (await req.json().catch(() => null)) as {
    status?: HfStatus;
    images?: { url: string }[];
    error?: string;
  } | null;

  if (!payload?.status) return NextResponse.json({ error: 'Bad payload' }, { status: 400 });

  await applyResult(genId, {
    status: payload.status,
    images: payload.images,
    error: payload.error,
  });
  return NextResponse.json({ ok: true });
}
