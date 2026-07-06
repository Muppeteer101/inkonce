import { IDEAS } from '@/lib/content/ideas';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-static';

export function GET() {
  return Response.json(
    IDEAS.map((i) => ({
      ...i,
      url: `${SITE_URL}/ideas/${i.slug}`,
      designUrl: `${SITE_URL}/create?idea=${encodeURIComponent(i.name.toLowerCase() + ' tattoo')}`,
    })),
    { headers: { 'Cache-Control': 'public, max-age=3600' } },
  );
}
