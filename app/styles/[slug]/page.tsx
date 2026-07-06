import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { STYLES, styleBySlug } from '@/lib/content/styles';
import { IDEAS } from '@/lib/content/ideas';
import { styleImage } from '@/lib/content/showcase';
import { pageMetadata, jsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo';

export function generateStaticParams() {
  return STYLES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const style = styleBySlug(slug);
  if (!style) return {};
  return pageMetadata({
    title: `${style.name} Tattoos — style guide + free AI generator`,
    description: `${style.description.slice(0, 150)}… Generate ${style.name} tattoo designs free with InkOnce.`,
    path: `/styles/${style.slug}`,
  });
}

export default async function StylePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const style = styleBySlug(slug);
  if (!style) notFound();

  const ideas = IDEAS.filter((i) => style.goodFor.includes(i.slug) || i.bestStyles.includes(style.slug));
  const faqs = [
    {
      q: `What defines a ${style.name} tattoo?`,
      a: style.description,
    },
    {
      q: `How do I get a ${style.name} tattoo design?`,
      a: `Describe your idea in the InkOnce design studio and select ${style.name} as the style — the generator applies the genre's real technique vocabulary (${style.traits.join(', ').toLowerCase()}). You get 3 free design runs, private by default, and can export a hi-res file plus a clean stencil to bring to your artist.`,
    },
    {
      q: `What subjects suit ${style.name}?`,
      a: `${style.name} famously suits ${ideas.slice(0, 4).map((i) => i.name.toLowerCase()).join(', ')} — but the style can carry almost any subject if the composition respects its rules.`,
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
              { name: 'Styles', path: '/styles' },
              { name: style.name, path: `/styles/${style.slug}` },
            ]),
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd(faqs)) }} />

      <p className="kicker">Style guide</p>
      <h1 className="display" style={{ fontSize: 'clamp(2.2rem,5vw,3.4rem)' }}>
        {style.name} <em>tattoos</em>
      </h1>
      <p className="lede" style={{ margin: '10px 0 6px' }}>{style.tagline}</p>

      <div style={{ margin: '26px 0 34px', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <Link href={`/create?style=${style.slug}`} className="btn btn-blood">
          Design a {style.name} tattoo — free
        </Link>
        <Link href="/styles" className="btn btn-ghost">All 28 styles</Link>
      </div>

      <div className="split" style={{ marginBottom: 20 }}>
        <div className="prose" style={{ maxWidth: 'none' }}>
          <p>{style.description}</p>
          <h2>What makes it {style.name}</h2>
          <ul>
            {style.traits.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>
        {styleImage(style.slug) && (
          <figure className="hero-figure">
            <Image src={styleImage(style.slug)!} alt={`${style.name} tattoo design example generated with InkOnce`} width={896} height={1200} />
          </figure>
        )}
      </div>

      {ideas.length > 0 && (
        <section className="section-tight">
          <h2 className="title">Great subjects for {style.name}</h2>
          <div className="grid grid-3">
            {ideas.slice(0, 6).map((i) => (
              <Link key={i.slug} href={`/ideas/${i.slug}/${style.slug}`} className="card">
                <h3>{i.name} in {style.name}</h3>
                <p>{i.meanings.slice(0, 2).join(' · ')}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

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
