import Link from 'next/link';
import { STYLES } from '@/lib/content/styles';
import { pageMetadata, jsonLd, breadcrumbJsonLd } from '@/lib/seo';

export const metadata = pageMetadata({
  title: '28 Tattoo Styles, Explained — pick yours with confidence',
  description:
    'Every major tattoo style explained: American Traditional, Fine Line, Blackwork, Japanese Irezumi, Chicano, Cyber Sigilism and 22 more — what defines each, how it ages, and what it suits. Generate designs in any of them free.',
  path: '/styles',
});

export default function StylesIndex() {
  return (
    <main className="wrap section">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Styles', path: '/styles' }])),
        }}
      />
      <p className="kicker">The style library</p>
      <h1 className="display" style={{ fontSize: 'clamp(2.2rem,5vw,3.4rem)' }}>
        28 styles, <em>spoken fluently</em>
      </h1>
      <p className="lede" style={{ margin: '22px 0 40px' }}>
        The style decides how your tattoo looks at 60, not just at the appointment.
        Learn what defines each genre, then design in it — free.
      </p>
      <div className="grid grid-3">
        {STYLES.map((s) => (
          <Link key={s.slug} href={`/styles/${s.slug}`} className="card">
            <h3>{s.name}</h3>
            <p style={{ marginBottom: 10 }}>{s.tagline}</p>
            <p className="small faint">{s.traits.join(' · ')}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
