import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { pollGeneration, publicView } from '@/lib/generation';

export const maxDuration = 30;

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params;
  // pollGeneration doubles as the webhook fallback: if Higgsfield finished but
  // the webhook hasn't landed yet, this settles the record.
  const rec = await pollGeneration(id);
  if (!rec || rec.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(publicView(rec));
}
