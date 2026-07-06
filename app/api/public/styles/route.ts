import { STYLES } from '@/lib/content/styles';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-static';

export function GET() {
  return Response.json(
    STYLES.map(({ slug, name, tagline, description, traits, goodFor }) => ({
      slug, name, tagline, description, traits, goodFor,
      url: `${SITE_URL}/styles/${slug}`,
      designUrl: `${SITE_URL}/create?style=${slug}`,
    })),
    { headers: { 'Cache-Control': 'public, max-age=3600' } },
  );
}
