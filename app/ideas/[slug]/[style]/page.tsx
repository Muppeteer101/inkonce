import Link from 'next/link';
import { notFound } from 'next/navigation';
import { IDEAS, ideaBySlug } from '@/lib/content/ideas';
import { styleBySlug } from '@/lib/content/styles';
import { placementBySlug } from '@/lib/content/placements';
import { pageMetadata, jsonLd, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo';

/**
 * The long-tail engine: {idea} × {style} pages (49 × 28 ≈ 1,370 URLs) for
 * queries like "fine line snake tattoo". Best-pairing combos are prebuilt;
 * the rest render on demand and cache (ISR).
 */
export const dynamicParams = true;
export const revalidate = 86400;

export function generateStaticParams() {
  return IDEAS.flatMap((idea) =>
    idea.bestStyles.map((style) => ({ slug: idea.slug, style })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; style: string }>;
}) {
  const { slug, style: styleSlug } = await params;
  const idea = ideaBySlug(slug);
  const style = styleBySlug(styleSlug);
  if (!idea || !style) return {};
  return pageMetadata({
    title: `${style.name} ${idea.name} Tattoo — designs & free generator`,
    description: `Design a ${style.name.toLowerCase()} ${idea.name.toLowerCase()} tattoo with AI: what the pairing looks like, why it works, and a free generator that speaks the style's real technique vocabulary.`,
    path: `/ideas/${idea.slug}/${style.slug}`,
  });
}

export default async function IdeaStylePage({
  params,
}: {
  params: Promise<{ slug: string; style: string }>;
}) {
  const { slug, style: styleSlug } = await params;
  const idea = ideaBySlug(slug);
  const style = styleBySlug(styleSlug);
  if (!idea || !style) notFound();

  const recommended = idea.bestStyles.includes(style.slug);
  const placements = idea.bestPlacements.map(placementBySlug).filter(Boolean);
  const otherStyles = idea.bestStyles.filter((s) => s !== style.slug).map(styleBySlug).filter(Boolean);

  const faqs = [
    {
      q: `Does ${idea.name.toLowerCase()} work in ${style.name}?`,
      a: recommended
        ? `Yes — it's one of the classic pairings. ${style.name}'s signature traits (${style.traits.join(', ').toLowerCase()}) flatter the ${idea.name.toLowerCase()}'s symbolism of ${idea.meanings.slice(0, 2).join(' and ').toLowerCase()}.`
        : `It can, with care. ${style.name} (${style.tagline.toLowerCase()}) brings a different attitude to the subject than its classic pairings — generate a few drafts in both and compare before committing.`,
    },
    {
      q: `What does a ${idea.name.toLowerCase()} tattoo mean?`,
      a: `${idea.meanings.join(', ')}. ${idea.description}`,
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
              { name: 'Ideas', path: '/ideas' },
              { name: idea.name, path: `/ideas/${idea.slug}` },
              { name: style.name, path: `/ideas/${idea.slug}/${style.slug}` },
            ]),
          ),
        }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd(faqs)) }} />

      <p className="kicker">{recommended ? 'Classic pairing' : 'Style experiment'}</p>
      <h1 className="display" style={{ fontSize: 'clamp(2rem,4.6vw,3.2rem)' }}>
        {style.name} <em>{idea.name.toLowerCase()}</em> tattoo
      </h1>
      <p className="lede" style={{ margin: '20px 0 30px' }}>
        {idea.description} In {style.name}, that reads as: {style.tagline.toLowerCase()}
      </p>
      <Link
        href={`/create?idea=${encodeURIComponent(idea.name.toLowerCase() + ' tattoo')}&style=${style.slug}`}
        className="btn btn-blood"
      >
        Generate this design — free
      </Link>

      <section className="section-tight prose">
        <h2 className="title">Why this pairing {recommended ? 'works' : 'is interesting'}</h2>
        <p>
          {style.description}
        </p>
        <p>
          A {idea.name.toLowerCase()} carries {idea.meanings.slice(0, 3).join(', ').toLowerCase()} —
          and {style.name}&apos;s {style.traits[0].toLowerCase()} give that symbolism its voice.
          Placement matters too: this subject flows best on the{' '}
          {placements.map((p) => p!.name.toLowerCase()).join(', ')}.
        </p>
      </section>

      {otherStyles.length > 0 && (
        <section className="section-tight">
          <h2 className="title">Same idea, other voices</h2>
          <div className="grid grid-4">
            {otherStyles.map((s) => (
              <Link key={s!.slug} href={`/ideas/${idea.slug}/${s!.slug}`} className="card">
                <h3>{s!.name} {idea.name.toLowerCase()}</h3>
                <p>{s!.tagline}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section-tight prose">
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
