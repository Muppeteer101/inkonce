import Link from 'next/link';
import { pageMetadata, jsonLd, faqJsonLd } from '@/lib/seo';
import { PLANS } from '@/lib/plans';
import CheckoutButton from './checkout-button';

export const metadata = pageMetadata({
  title: 'Pricing — pay once, design it properly',
  description:
    'InkOnce pricing: 3 free design runs, then a $19.99 one-time Design Pass — no subscription. Hi-res files, tattoo stencils and the artist handoff pack included. Subscriptions only if you actually want one.',
  path: '/pricing',
});

const FAQS = [
  {
    q: 'Why a one-time pass instead of a subscription?',
    a: 'Because a tattoo is a project, not a habit. Most people design one tattoo every year or two — paying monthly for that makes no sense. The Design Pass gives you a full week and everything you need to finish one design properly, for one payment.',
  },
  {
    q: 'What happens to my designs when the pass ends?',
    a: 'Nothing. Your designs stay in your account, private, forever. The pass gates generating new work, never access to work you already made.',
  },
  {
    q: 'Is the free tier actually free?',
    a: 'Yes — 3 design runs, no card. Free designs are full quality, private by default, and never deleted. We think that is how you should be treated before you pay someone.',
  },
  {
    q: 'Can I cancel Ink Studio?',
    a: 'Anytime, in one click from your account. You keep access until the end of the period you paid for, and every design you made is yours forever.',
  },
];

export default function PricingPage() {
  const pass = PLANS.pass;
  const studio = PLANS.studio;
  const annual = PLANS['studio-annual'];

  return (
    <main className="wrap section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd(FAQS)) }} />
      <p className="kicker">Pricing</p>
      <h1 className="display" style={{ fontSize: 'clamp(2.2rem,5vw,3.4rem)' }}>
        The tattoo is permanent.<br /><em>The subscription shouldn&apos;t be.</em>
      </h1>
      <p className="lede" style={{ margin: '22px 0 44px' }}>
        Start free. Finish with one payment. Subscribe only if you genuinely design ink
        every month.
      </p>

      <div className="grid grid-3">
        <div className="card price-card">
          <h3>Free</h3>
          <div className="price">$0</div>
          <ul>
            <li>3 design runs — no card</li>
            <li>All 28 styles &amp; 20 placements</li>
            <li>Private by default</li>
            <li>Designs kept forever, never blurred</li>
            <li>Draft-resolution downloads</li>
          </ul>
          <Link href="/create" className="btn btn-ghost" style={{ marginTop: 'auto' }}>Start free</Link>
        </div>

        <div className="card price-card price-hero">
          <span className="badge">One payment · no subscription</span>
          <h3>{pass.name}</h3>
          <div className="price">${pass.priceUsd} <span>once · {pass.durationDays} days</span></div>
          <ul>
            <li>{pass.caps.draftRuns} design runs</li>
            <li>{pass.caps.refineRuns} studio-quality refined renders</li>
            <li>{pass.caps.hiResExports} hi-res exports</li>
            <li>{pass.caps.stencilExports} clean tattoo stencils</li>
            <li>Artist handoff pack</li>
            <li>Priority queue</li>
          </ul>
          <CheckoutButton plan="pass" className="btn btn-blood" style={{ marginTop: 'auto' }}>
            Get the Design Pass
          </CheckoutButton>
        </div>

        <div className="card price-card">
          <h3>{studio.name}</h3>
          <div className="price">${studio.priceUsd} <span>/month</span></div>
          <ul>
            <li>{studio.caps.draftRuns} design runs monthly</li>
            <li>{studio.caps.refineRuns} refined renders monthly</li>
            <li>{studio.caps.hiResExports} hi-res + {studio.caps.stencilExports} stencils monthly</li>
            <li>For collectors &amp; artists</li>
            <li>Cancel anytime</li>
          </ul>
          <div style={{ marginTop: 'auto', display: 'grid', gap: 10 }}>
            <CheckoutButton plan="studio" className="btn btn-ghost">Subscribe monthly</CheckoutButton>
            <CheckoutButton plan="studio-annual" className="btn btn-ghost">
              ${annual.priceUsd}/year — save 72%
            </CheckoutButton>
          </div>
        </div>
      </div>

      <section className="section-tight">
        <h2 className="title">What every plan includes</h2>
        <div className="table-scroll">
          <table className="compare">
            <thead>
              <tr><th></th><th>Free</th><th>Design Pass</th><th>Ink Studio</th></tr>
            </thead>
            <tbody>
              <tr><td>Design runs</td><td>3</td><td className="yes">25 / week</td><td className="yes">40 / month</td></tr>
              <tr><td>Studio-quality refines</td><td className="no">—</td><td className="yes">7</td><td className="yes">5 / month</td></tr>
              <tr><td>Hi-res + stencil export</td><td className="no">—</td><td className="yes">Included</td><td className="yes">Included</td></tr>
              <tr><td>Private &amp; kept forever</td><td className="yes">Yes</td><td className="yes">Yes</td><td className="yes">Yes</td></tr>
              <tr><td>Billing</td><td>—</td><td className="yes">One payment</td><td>Monthly / yearly</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section-tight prose">
        <h2 className="title">Questions</h2>
        {FAQS.map((f) => (
          <div key={f.q} style={{ marginBottom: 22 }}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
