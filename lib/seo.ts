import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://inkonce.com';
export const SITE_NAME = 'InkOnce';
export const TAGLINE = 'Design it right, once.';
export const DESCRIPTION =
  'AI tattoo design studio. Explore ideas in 28 real tattoo styles, refine the one you love, and walk into the shop with a hi-res design and stencil. Private by default, keep your designs forever, no subscription required.';

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  ogImagePath?: string;
}): Metadata {
  const url = absoluteUrl(opts.path);
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      images: [{ url: absoluteUrl(opts.ogImagePath ?? `/api/og?title=${encodeURIComponent(opts.title)}`), width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
    },
  };
}

/** Serialize JSON-LD for a <script type="application/ld+json"> block. */
export function jsonLd(data: object): string {
  // Escape < to prevent script-context injection from any string field.
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/create?idea={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/icon.svg'),
    slogan: TAGLINE,
  };
}

export function softwareAppJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${SITE_NAME} — AI Tattoo Generator`,
    url: SITE_URL,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    description: DESCRIPTION,
    offers: [
      {
        '@type': 'Offer',
        name: 'Free',
        price: '0',
        priceCurrency: 'USD',
        description: '3 free design generations. Private by default, keep your designs forever.',
      },
      {
        '@type': 'Offer',
        name: 'Design Pass',
        price: '19.99',
        priceCurrency: 'USD',
        description: 'One-time payment, 7 days. Design one tattoo properly: 25 generations, refined renders, hi-res files and stencils. No subscription.',
      },
      {
        '@type': 'Offer',
        name: 'Ink Studio',
        price: '11.99',
        priceCurrency: 'USD',
        description: 'Monthly subscription for collectors and artists. Cancel anytime.',
      },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function howToJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to design a tattoo with AI on InkOnce',
    step: [
      { '@type': 'HowToStep', name: 'Describe your idea', text: 'Type your tattoo idea in plain words and pick one of 28 real tattoo styles.' },
      { '@type': 'HowToStep', name: 'Explore drafts', text: 'Generate design concepts and iterate freely until one feels right.' },
      { '@type': 'HowToStep', name: 'Refine the winner', text: 'Re-render your chosen concept at studio quality with complexity, colour and line-weight control.' },
      { '@type': 'HowToStep', name: 'Export for your artist', text: 'Download the hi-res design, a clean tattoo stencil, and the artist handoff pack, then book your appointment.' },
    ],
  };
}
