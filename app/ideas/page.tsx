import Link from 'next/link';
import { IDEAS } from '@/lib/content/ideas';
import { pageMetadata, jsonLd, breadcrumbJsonLd } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Tattoo Ideas with Meaning — the full library',
  description:
    'Tattoo ideas explained properly: what each subject means, which styles suit it, where it sits best on the body. Lions, snakes, phoenixes, memorial pieces and dozens more — then design yours free.',
  path: '/ideas',
});

export default function IdeasIndex() {
  return (
    <main className="wrap section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Ideas', path: '/ideas' }])),
        }}
      />
      <p className="kicker">The idea library</p>
      <h1 className="display" style={{ fontSize: 'clamp(2.2rem,5vw,3.4rem)' }}>
        Ideas worth <em>keeping</em>
      </h1>
      <p className="lede" style={{ margin: '22px 0 40px' }}>
        Every subject with its real meanings, best styles and best placements — research
        first, ink second.
      </p>
      <div className="grid grid-3">
        {IDEAS.map((i) => (
          <Link key={i.slug} href={`/ideas/${i.slug}`} className="card">
            <h3>{i.name}</h3>
            <p>{i.meanings.slice(0, 3).join(' · ')}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
