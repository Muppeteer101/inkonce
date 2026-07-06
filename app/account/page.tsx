import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { redis, k } from '@/lib/redis';
import { getAllowance } from '@/lib/credits';
import { getGeneration, type GenerationRecord } from '@/lib/generation';
import { PLANS } from '@/lib/plans';
import { styleBySlug } from '@/lib/content/styles';

export const metadata = { title: 'My designs', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const { userId } = await auth();
  if (!userId) redirect('/');

  const [allowance, genIds] = await Promise.all([
    getAllowance(userId),
    redis.lrange<string>(k.userGenerations(userId), 0, 59),
  ]);
  const gens = (await Promise.all(genIds.map(getGeneration))).filter(
    (g): g is GenerationRecord => !!g && g.status === 'completed' && g.images.length > 0,
  );

  const planName =
    allowance.plan === 'free' ? 'Free' : PLANS[allowance.plan as keyof typeof PLANS].name;

  return (
    <main className="wrap section-tight">
      <p className="kicker">Your studio</p>
      <h1 className="title" style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem' }}>
        My designs
      </h1>

      <div className="panel" style={{ margin: '22px 0', display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <span className="small faint">Plan</span>
          <h3>{planName}</h3>
        </div>
        <div>
          <span className="small faint">Design runs left</span>
          <h3>{allowance.remaining.draftRuns}</h3>
        </div>
        {allowance.plan !== 'free' && (
          <>
            <div>
              <span className="small faint">Refines</span>
              <h3>{allowance.remaining.refineRuns}</h3>
            </div>
            <div>
              <span className="small faint">Hi-res</span>
              <h3>{allowance.remaining.hiResExports}</h3>
            </div>
            <div>
              <span className="small faint">Stencils</span>
              <h3>{allowance.remaining.stencilExports}</h3>
            </div>
          </>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
          <Link href="/create" className="btn btn-blood btn-sm">Open studio</Link>
          {allowance.plan === 'free' && (
            <Link href="/pricing" className="btn btn-ghost btn-sm">Upgrade</Link>
          )}
        </div>
      </div>

      {gens.length === 0 ? (
        <div className="panel pending-tile" style={{ minHeight: 220 }}>
          <p className="muted">Nothing here yet — your finished designs collect here, forever.</p>
          <Link href="/create" className="btn btn-bone btn-sm">Design your first</Link>
        </div>
      ) : (
        <div className="grid grid-4">
          {gens.flatMap((g) =>
            g.images.map((url, i) => (
              <figure key={`${g.id}-${i}`} className="design-tile">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`${g.subject} — ${styleBySlug(g.styleSlug)?.name ?? g.styleSlug} tattoo design`} loading="lazy" />
                <figcaption className="design-actions">
                  <a className="btn btn-bone btn-sm" href={url} download target="_blank" rel="noreferrer">Save</a>
                </figcaption>
              </figure>
            )),
          )}
        </div>
      )}

      <p className="small faint" style={{ marginTop: 26 }}>
        Every design here is private and permanent — passes and subscriptions gate new
        generations, never your existing work. Manage subscriptions via the receipt email
        from Stripe, or contact hello@inkonce.com.
      </p>
    </main>
  );
}
