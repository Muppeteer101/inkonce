import Link from 'next/link';
import Image from 'next/image';
import { STYLES } from '@/lib/content/styles';
import { IDEAS } from '@/lib/content/ideas';
import { GALLERY } from '@/lib/content/showcase';
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
        <div className="wrap split">
          <div>
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
          <figure className="hero-figure">
            <Image src="/showcase/place-forearm.png" alt="Fine line botanical tattoo designed on InkOnce, shown on a forearm" width={896} height={1200} priority />
          </figure>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
          <p className="kicker">Made with InkOnce</p>
          <h2 className="title" style={{ marginBottom: 22 }}>Real designs, real styles</h2>
          <div className="gallery">
            {GALLERY.map((g) => (
              <Link key={g.src} href={g.href} aria-label={`${g.label} tattoo designs`}>
                <Image src={g.src} alt={`${g.label} tattoo design generated with InkOnce`} width={896} height={1200} />
                <span className="glabel">{g.label}</span>
              </Link>
            ))}
          </div>
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
          <p className="kicker">What you get</p>
          <h2 className="title">Everything to walk in ready</h2>
          <div className="grid grid-4" style={{ marginTop: 28 }}>
            <div className="card">
              <h3>Pay once</h3>
              <p>$19.99 designs one whole tattoo over a week. No subscription, no auto-renew.</p>
            </div>
            <div className="card">
              <h3>A clean stencil</h3>
              <p>Every design exports to thermal-ready stencil linework your artist can transfer straight to skin.</p>
            </div>
            <div className="card">
              <h3>Artist handoff pack</h3>
              <p>Hi-res design, stencil and placement notes in one download — the document a studio actually wants.</p>
            </div>
            <div className="card">
              <h3>Yours to keep</h3>
              <p>Private by default and kept forever. Your designs are yours to print, share, and ink.</p>
            </div>
          </div>
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
