import Link from 'next/link';
import { STYLES } from '@/lib/content/styles';
import { IDEAS } from '@/lib/content/ideas';
import { jsonLd, howToJsonLd, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'InkOnce — AI Tattoo Generator. Design it right, once.',
  description:
    'Design your tattoo with AI in 28 real tattoo styles. Free to start, private by default, keep your designs forever. Get hi-res files and a clean stencil for your artist — one payment, no subscription.',
  path: '/',
});

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(howToJsonLd()) }} />

      <section className="hero section">
        <div className="wrap">
          <p className="kicker">AI tattoo design studio</p>
          <h1 className="display">
            You only get one skin.<br />
            <em>Design it right, once.</em>
          </h1>
          <p className="lede" style={{ margin: '26px 0 34px' }}>
            Explore your tattoo idea in 28 real styles, refine the one you love, and walk
            into the studio with a hi-res design and a clean stencil. Private by default.
            Yours forever. No subscription required.
          </p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/create" className="btn btn-blood">Design yours free</Link>
            <Link href="/styles" className="btn btn-ghost">Browse the 28 styles</Link>
          </div>
          <p className="small faint" style={{ marginTop: 18 }}>
            3 free design runs · no card · your designs never get deleted or blurred
          </p>
        </div>
      </section>

      <section className="section-tight" style={{ background: 'var(--ink-1)' }}>
        <div className="wrap">
          <div className="grid grid-4">
            <div>
              <h3>Private by default</h3>
              <p className="muted small">Your ideas are yours. Free designs are never published, never deleted, never held hostage.</p>
            </div>
            <div>
              <h3>No subscription needed</h3>
              <p className="muted small">A tattoo is a project, not a monthly habit. Pay once, design it properly, done.</p>
            </div>
            <div>
              <h3>Artist-ready output</h3>
              <p className="muted small">Hi-res files, a clean thermal-ready stencil and a handoff pack your artist will actually thank you for.</p>
            </div>
            <div>
              <h3>Real style discipline</h3>
              <p className="muted small">28 styles with their real technique vocabulary — Chicano shading, Irezumi flow, fine-line restraint.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <p className="kicker">How it works</p>
          <h2 className="title">From idea to appointment in four steps</h2>
          <div className="grid grid-4" style={{ marginTop: 32 }}>
            {[
              ['01 — Describe', 'Type your idea in plain words. Pick a style, a placement, how complex you want it.'],
              ['02 — Explore', 'Generate draft concepts fast and iterate freely. Chase the idea until it clicks.'],
              ['03 — Refine', 'Re-render your chosen concept at studio quality — colour, line weight and detail dialled in.'],
              ['04 — Walk in ready', 'Export the hi-res design, stencil and handoff pack. Book the appointment with confidence.'],
            ].map(([t, d]) => (
              <div className="card" key={t}>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--ink-1)' }}>
        <div className="wrap">
          <p className="kicker">The styles</p>
          <h2 className="title">Every genre, spoken fluently</h2>
          <p className="lede">
            Generic AI draws “a tattoo”. InkOnce speaks the genre — each style carries its
            real technique vocabulary into the design.
          </p>
          <div style={{ marginTop: 28 }}>
            {STYLES.map((s) => (
              <Link key={s.slug} href={`/styles/${s.slug}`} className="tag">
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <p className="kicker">Straight comparison</p>
          <h2 className="title">Why people switch to InkOnce</h2>
          <div className="table-scroll" style={{ marginTop: 26 }}>
            <table className="compare">
              <thead>
                <tr><th></th><th>InkOnce</th><th>Typical AI tattoo apps</th></tr>
              </thead>
              <tbody>
                <tr><td>To design one tattoo</td><td className="yes">$19.99 once — no subscription</td><td className="no">$15/month subscription (up to $72/yr)</td></tr>
                <tr><td>Free designs</td><td className="yes">Private, full-quality, keep forever</td><td className="no">Public, blurred/locked, deleted after 30 days</td></tr>
                <tr><td>Stencil export</td><td className="yes">Included in every paid plan</td><td className="no">Paid tiers only</td></tr>
                <tr><td>Artist handoff pack</td><td className="yes">Design + stencil + placement notes</td><td className="no">—</td></tr>
                <tr><td>Who owns your designs</td><td className="yes">You do</td><td className="no">Check the small print</td></tr>
              </tbody>
            </table>
          </div>
          <p className="small faint" style={{ marginTop: 14 }}>
            Comparison based on published pricing/feature pages of leading AI tattoo apps, July 2026.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--ink-1)' }}>
        <div className="wrap">
          <p className="kicker">Start somewhere</p>
          <h2 className="title">Popular ideas, properly explored</h2>
          <div className="grid grid-3" style={{ marginTop: 28 }}>
            {IDEAS.slice(0, 9).map((i) => (
              <Link key={i.slug} href={`/ideas/${i.slug}`} className="card">
                <h3>{i.name}</h3>
                <p>{i.meanings.slice(0, 3).join(' · ')}</p>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: 26 }}>
            <Link href="/ideas" className="btn btn-ghost">All tattoo ideas →</Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h2 className="title">The tattoo is permanent.<br />The subscription shouldn&apos;t be.</h2>
          <p className="lede" style={{ margin: '0 auto 30px' }}>
            Three free design runs. No card. If you love where it&apos;s going, one payment
            finishes the job.
          </p>
          <Link href="/create" className="btn btn-blood">Start designing free</Link>
        </div>
      </section>
    </main>
  );
}
