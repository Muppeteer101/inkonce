import type { MetadataRoute } from 'next';
import { STYLES } from '@/lib/content/styles';
import { IDEAS } from '@/lib/content/ideas';
import { PLACEMENTS } from '@/lib/content/placements';
import { SITE_URL } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (p: string) => `${SITE_URL}${p}`;

  const core: MetadataRoute.Sitemap = [
    { url: url('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: url('/create'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: url('/pricing'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: url('/styles'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/ideas'), lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/placements'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: url('/faq'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const styles = STYLES.map((s) => ({
    url: url(`/styles/${s.slug}`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const ideas = IDEAS.map((i) => ({
    url: url(`/ideas/${i.slug}`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const placements = PLACEMENTS.map((p) => ({
    url: url(`/placements/${p.slug}`),
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // The full idea×style long tail (≈1,370 URLs — well within sitemap limits).
  const combos = IDEAS.flatMap((i) =>
    STYLES.map((s) => ({
      url: url(`/ideas/${i.slug}/${s.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: i.bestStyles.includes(s.slug) ? 0.6 : 0.4,
    })),
  );

  return [...core, ...styles, ...ideas, ...placements, ...combos];
}
