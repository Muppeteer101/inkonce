import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { startExport, publicView, AllowanceError, UserFacingError } from '@/lib/generation';

export const maxDuration = 60;

const Body = z.object({
  parentId: z.string().min(4).max(40),
  imageIndex: z.number().int().min(0).max(7),
  kind: z.enum(['stencil', 'hires']),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  try {
    const rec = await startExport(userId, parsed.data.parentId, parsed.data.imageIndex, parsed.data.kind);
    return NextResponse.json(publicView(rec), { status: 201 });
  } catch (err) {
    if (err instanceof AllowanceError) {
      return NextResponse.json(
        {
          error:
            parsed.data.kind === 'stencil'
              ? 'Stencil exports are part of the Design Pass — $19.99 once, no subscription.'
              : 'Hi-res exports are part of the Design Pass — $19.99 once, no subscription.',
        },
        { status: 402 },
      );
    }
    if (err instanceof UserFacingError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('export failed', err);
    return NextResponse.json({ error: 'Export hiccup — nothing was counted. Try again.' }, { status: 502 });
  }
}
