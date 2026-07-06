import { PLACEMENTS } from '@/lib/content/placements';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-static';

export function GET() {
  return Response.json(
    PLACEMENTS.map((p) => ({ ...p, url: `${SITE_URL}/placements/${p.slug}` })),
    { headers: { 'Cache-Control': 'public, max-age=3600' } },
  );
}
