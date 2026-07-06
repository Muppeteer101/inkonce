import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PLACEMENTS, placementBySlug } from '@/lib/content/placements';
import { IDEAS } from '@/lib/content/ideas';
import { pageMetadata, jsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo';

export function generateStaticParams() {
  return PLACEMENTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = placementBySlug(slug);
  if (!p) return {};
  return pageMetadata({
    title: `${p.name} Tattoos — pain, size & design guide`,
    description: `${p.name} tattoo guide: ${p.painNote} ${p.sizeGuide} Generate placement-aware designs free with InkOnce.`,
    path: `/placements/${p.slug}`,
  });
}

export default async function PlacementPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = placementBySlug(slug);
  if (!p) notFound();

  const ideas = IDEAS.filter((i) => i.bestPlacements.includes(p.slug)).slice(0, 6);
  const faqs = [
    { q: `How much does a ${p.name.toLowerCase()} tattoo hurt?`, a: p.painNote },
    { q: `What size should a ${p.name.toLowerCase()} tattoo be?`, a: p.sizeGuide },
    {
      q: `What designs suit the ${p.name.toLowerCase()}?`,
      a: `${p.description} InkOnce generates placement-aware compositions — designs shaped to flow with the ${p.name.toLowerCase()} rather than pasted onto it.`,
    },
  ];

  return (
    <main className="wrap section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Placements', path: '/placements' },
              { name: p.name, path: `/placements/${p.slug}` },
            ]),
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd(faqs)) }} />

      <p className="kicker">Placement guide</p>
      <h1 className="display" style={{ fontSize: 'clamp(2.2rem,5vw,3.4rem)' }}>
        {p.name} <em>tattoos</em>
      </h1>
      <p className="lede" style={{ margin: '20px 0 30px' }}>{p.description}</p>
      <Link href={`/create`} className="btn btn-blood">Design for the {p.name.toLowerCase()} — free</Link>

      <section className="section-tight prose">
        <h2 className="title">The honest notes</h2>
        <h3>Pain</h3>
        <p>{p.painNote}</p>
        <h3>Size &amp; sessions</h3>
        <p>{p.sizeGuide}</p>
      </section>

      {ideas.length > 0 && (
        <section className="section-tight">
          <h2 className="title">Ideas that flow here</h2>
          <div className="grid grid-3">
            {ideas.map((i) => (
              <Link key={i.slug} href={`/ideas/${i.slug}`} className="card">
                <h3>{i.name}</h3>
                <p>{i.meanings.slice(0, 2).join(' · ')}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
