import Link from 'next/link';
import { PLACEMENTS } from '@/lib/content/placements';
import { pageMetadata, jsonLd, breadcrumbJsonLd } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Tattoo Placements — pain, size and design guide for every spot',
  description:
    'Where should your tattoo go? Every placement compared: pain level, size guidance, how designs age there, and which compositions flow best — forearm to sternum.',
  path: '/placements',
});

export default function PlacementsIndex() {
  return (
    <main className="wrap section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Placements', path: '/placements' }])),
        }}
      />
      <p className="kicker">Placement guide</p>
      <h1 className="display" style={{ fontSize: 'clamp(2.2rem,5vw,3.4rem)' }}>
        Where it <em>lives</em> matters
      </h1>
      <p className="lede" style={{ margin: '22px 0 40px' }}>
        The same design reads differently on a forearm than a ribcage — and hurts
        differently too. Honest notes on all 20 placements.
      </p>
      <div className="grid grid-3">
        {PLACEMENTS.map((p) => (
          <Link key={p.slug} href={`/placements/${p.slug}`} className="card">
            <h3>{p.name}</h3>
            <p>{p.painNote}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
