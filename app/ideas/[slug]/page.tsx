import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { IDEAS, ideaBySlug } from '@/lib/content/ideas';
import { styleBySlug } from '@/lib/content/styles';
import { placementBySlug } from '@/lib/content/placements';
import { ideaImage } from '@/lib/content/showcase';
import { pageMetadata, jsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo';

export function generateStaticParams() {
  return IDEAS.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idea = ideaBySlug(slug);
  if (!idea) return {};
  return pageMetadata({
    title: `${idea.name} Tattoo — meaning, styles & free design generator`,
    description: `${idea.name} tattoo meaning: ${idea.meanings.join(', ').toLowerCase()}. Best styles, best placements, and a free AI generator to design yours.`,
    path: `/ideas/${idea.slug}`,
  });
}

export default async function IdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const idea = ideaBySlug(slug);
  if (!idea) notFound();

  const styles = idea.bestStyles.map(styleBySlug).filter(Boolean);
  const placements = idea.bestPlacements.map(placementBySlug).filter(Boolean);
  const faqs = [
    { q: `What does a ${idea.name.toLowerCase()} tattoo mean?`, a: `${idea.name} tattoos most commonly represent ${idea.meanings.join(', ').toLowerCase()}. ${idea.description}` },
    { q: `Where should a ${idea.name.toLowerCase()} tattoo go?`, a: `Popular placements are the ${placements.map((p) => p!.name.toLowerCase()).join(', ')} — chosen for how the subject's composition flows with that part of the body.` },
    { q: `Which styles suit a ${idea.name.toLowerCase()} tattoo?`, a: `${styles.map((s) => s!.name).join(', ')} all treat this subject brilliantly, each with a different attitude. Try the same idea in two or three styles before committing — that's exactly what InkOnce's free runs are for.` },
  ];

  return (
    <main className="wrap section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(
            breadcrumbJsonLd([
              { name: 'Home', path: '/' },
              { name: 'Ideas', path: '/ideas' },
              { name: idea.name, path: `/ideas/${idea.slug}` },
            ]),
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd(faqs)) }} />

      <p className="kicker">Tattoo idea</p>
      <h1 className="display" style={{ fontSize: 'clamp(2.2rem,5vw,3.4rem)' }}>
        {idea.name} <em>tattoo</em>
      </h1>
      <div className={ideaImage(idea.slug) ? 'split' : ''} style={{ marginTop: 18 }}>
        <div>
          <p className="lede" style={{ marginBottom: 8 }}>{idea.description}</p>
          <div style={{ margin: '10px 0 22px' }}>
            {idea.meanings.map((m) => <span key={m} className="tag">{m}</span>)}
          </div>
          <Link href={`/create?idea=${encodeURIComponent(idea.name.toLowerCase() + ' tattoo')}`} className="btn btn-blood">
            Design a {idea.name.toLowerCase()} tattoo — free
          </Link>
        </div>
        {ideaImage(idea.slug) && (
          <figure className="hero-figure">
            <Image src={ideaImage(idea.slug)!} alt={`${idea.name} tattoo design generated with InkOnce`} width={896} height={1200} priority />
          </figure>
        )}
      </div>

      <section className="section-tight">
        <h2 className="title">Best styles for a {idea.name.toLowerCase()}</h2>
        <div className="grid grid-4">
          {styles.map((s) => (
            <Link key={s!.slug} href={`/ideas/${idea.slug}/${s!.slug}`} className="card">
              <h3>{s!.name}</h3>
              <p>{s!.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-tight">
        <h2 className="title">Where it sits best</h2>
        <div className="grid grid-3">
          {placements.map((p) => (
            <Link key={p!.slug} href={`/placements/${p!.slug}`} className="card">
              <h3>{p!.name}</h3>
              <p>{p!.sizeGuide}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-tight prose">
        <h2 className="title">Questions</h2>
        {faqs.map((f) => (
          <div key={f.q} style={{ marginBottom: 20 }}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
