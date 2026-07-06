import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { startDesignRun, publicView, AllowanceError, UserFacingError } from '@/lib/generation';
import { STYLES } from '@/lib/content/styles';
import { PLACEMENTS } from '@/lib/content/placements';

export const maxDuration = 60;

const Body = z.object({
  subject: z.string().min(2).max(300),
  styleSlug: z.enum(STYLES.map((s) => s.slug) as [string, ...string[]]),
  placementSlug: z.enum(PLACEMENTS.map((p) => p.slug) as [string, ...string[]]).optional(),
  complexity: z.enum(['simple', 'balanced', 'detailed']).optional(),
  colorMode: z.enum(['blackwork', 'black-and-grey', 'color']).optional(),
  kind: z.enum(['draft', 'refine']).default('draft'),
  parentId: z.string().max(40).optional(),
});

const ALLOWANCE_MESSAGES: Record<string, string> = {
  draftRuns:
    'You’ve used your free design runs. The Design Pass unlocks 25 more plus refined renders, hi-res files and stencils — one payment, no subscription.',
  refineRuns: 'You’ve used all refined renders on this plan.',
  hiResExports: 'You’ve used all hi-res exports on this plan.',
  stencilExports: 'You’ve used all stencil exports on this plan.',
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to generate designs (it’s free).' }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  const b = parsed.data;

  try {
    const rec = await startDesignRun(
      {
        userId,
        subject: b.subject,
        styleSlug: b.styleSlug,
        placementSlug: b.placementSlug,
        complexity: b.complexity,
        colorMode: b.colorMode,
      },
      b.kind,
      b.parentId,
    );
    return NextResponse.json(publicView(rec), { status: 201 });
  } catch (err) {
    if (err instanceof AllowanceError) {
      return NextResponse.json({ error: ALLOWANCE_MESSAGES[err.usageKind] }, { status: 402 });
    }
    if (err instanceof UserFacingError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('generate failed', err);
    return NextResponse.json(
      { error: 'Generation service hiccup — your run was not counted. Try again.' },
      { status: 502 },
    );
  }
}
