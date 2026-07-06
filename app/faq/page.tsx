import { pageMetadata, jsonLd, faqJsonLd } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'FAQ — how InkOnce works',
  description:
    'Everything about InkOnce: how the AI tattoo generator works, what free really includes, design ownership, stencils, refunds and bringing designs to your artist.',
  path: '/faq',
});

const FAQS = [
  {
    q: 'How does the AI tattoo generator work?',
    a: 'You describe your idea in plain words and choose a style, placement and detail level. InkOnce builds a genre-aware prompt (each of the 28 styles carries its real technique vocabulary) and generates draft concepts. When one clicks, you refine it into a studio-quality render and export hi-res files and a stencil.',
  },
  {
    q: 'Is it really free to start?',
    a: 'Yes. 3 design runs, no card. Free designs are full quality — not blurred, not watermarked into uselessness, not deleted after 30 days, and private by default.',
  },
  {
    q: 'Who owns the designs?',
    a: 'You do. Use them, print them, take them to any artist, get them inked. We never publish your designs unless you explicitly share them.',
  },
  {
    q: 'What is the stencil export?',
    a: 'A conversion of your chosen design into clean, uniform black linework on white — the format artists use for thermal transfer paper. It gives your artist a working document, not just a pretty picture.',
  },
  {
    q: 'Can I get a tattoo directly from an AI design?',
    a: 'Bring it to a professional artist. AI designs are concepts: a good artist will adapt line weights, sizing and detail density to your skin, placement and how the piece will age. The InkOnce handoff pack is built for exactly that conversation.',
  },
  {
    q: 'What if a generation fails or gets blocked?',
    a: 'Failed and content-blocked runs are never counted against your allowance — automatically.',
  },
  {
    q: 'Do my paid credits expire?',
    a: 'The Design Pass lasts 7 days; Ink Studio allowances reset monthly without rollover. Your designs never expire either way.',
  },
  {
    q: 'How is InkOnce different from BlackInk and other tattoo AI apps?',
    a: 'Three ways: no forced subscription (a one-time Design Pass covers a complete tattoo project), a genuinely respectful free tier (private, permanent, full-quality), and placement-aware, genre-disciplined design generation with artist-ready exports.',
  },
];

export default function FaqPage() {
  return (
    <main className="wrap section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd(FAQS)) }} />
      <p className="kicker">FAQ</p>
      <h1 className="display" style={{ fontSize: 'clamp(2.2rem,5vw,3.2rem)', marginBottom: 36 }}>
        Fair <em>questions</em>
      </h1>
      <div className="prose">
        {FAQS.map((f) => (
          <div key={f.q} style={{ marginBottom: 26 }}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
