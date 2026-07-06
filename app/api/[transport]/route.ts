/**
 * InkOnce remote MCP server (streamable HTTP at /api/mcp).
 *
 * Agent-native distribution: assistants helping someone plan a tattoo can
 * consult the style/idea knowledge base, compose a design brief, and hand the
 * user a prefilled studio link. Knowledge is free; generation happens on-site
 * (free tier: 3 runs, no card). No auth; the advisory tools are public
 * content, rate-limited per IP as belt-and-braces.
 */
import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { STYLES, styleBySlug } from '@/lib/content/styles';
import { IDEAS } from '@/lib/content/ideas';
import { PLACEMENTS, placementBySlug } from '@/lib/content/placements';
import { PLANS } from '@/lib/plans';
import { rateLimit } from '@/lib/redis';
import { SITE_URL } from '@/lib/seo';

function clientIp(extra: unknown): string {
  const headers = (extra as { requestInfo?: { headers?: Record<string, string | string[] | undefined> } })
    ?.requestInfo?.headers;
  const xff = headers?.['x-forwarded-for'];
  const first = Array.isArray(xff) ? xff[0] : xff;
  return (first ?? '').split(',')[0].trim() || 'unknown';
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      'list_tattoo_styles',
      {
        title: 'List the 28 tattoo styles',
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
        description:
          'Returns all 28 tattoo styles InkOnce speaks fluently — slug, name, one-line identity and defining traits. Use get_style_guide for depth on one style.',
        inputSchema: {},
      },
      async () => ({
        content: [{
          type: 'text',
          text: JSON.stringify(
            STYLES.map((s) => ({ slug: s.slug, name: s.name, tagline: s.tagline, traits: s.traits })),
            null, 2,
          ),
        }],
      }),
    );

    server.registerTool(
      'get_style_guide',
      {
        title: 'Style guide for one tattoo style',
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
        description:
          'Full guide for a tattoo style: what defines it, how it ages, which subjects suit it, and the on-site guide URL.',
        inputSchema: {
          style: z.enum(STYLES.map((s) => s.slug) as [string, ...string[]]).describe('Style slug from list_tattoo_styles'),
        },
      },
      async ({ style }) => {
        const s = styleBySlug(style)!;
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              ...s,
              promptFragment: undefined, // prompt engineering stays server-side
              guide_url: `${SITE_URL}/styles/${s.slug}`,
              design_url: `${SITE_URL}/create?style=${s.slug}`,
            }, null, 2),
          }],
        };
      },
    );

    server.registerTool(
      'suggest_tattoo_design',
      {
        title: 'Compose a tattoo design brief',
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
        description:
          'Given a user\'s idea (and optionally style/placement preferences), returns a design brief: matched idea meanings, 2–3 recommended styles with reasoning, placement guidance with honest pain/size notes, and a prefilled studio link where the user can generate designs (3 free runs, private, no card).',
        inputSchema: {
          idea: z.string().min(2).max(300).describe('The tattoo idea in the user\'s words'),
          style: z.string().optional().describe('Optional preferred style slug'),
          placement: z.string().optional().describe('Optional preferred placement slug'),
        },
      },
      async ({ idea, style, placement }, extra) => {
        if (!(await rateLimit('mcp-suggest', clientIp(extra), 60))) {
          return { content: [{ type: 'text', text: 'Rate limit reached for today — please try again tomorrow.' }] };
        }
        const lower = idea.toLowerCase();
        const matched = IDEAS.filter((i) => lower.includes(i.slug.replace(/-/g, ' ')) || lower.includes(i.name.toLowerCase()));
        const styles = style && styleBySlug(style)
          ? [styleBySlug(style)!]
          : (matched[0]?.bestStyles ?? ['fine-line', 'blackwork', 'american-traditional'])
              .slice(0, 3).map(styleBySlug).filter(Boolean);
        const place = placement ? placementBySlug(placement) : matched[0] ? placementBySlug(matched[0].bestPlacements[0]) : undefined;

        const params = new URLSearchParams({ idea });
        if (styles[0]) params.set('style', styles[0]!.slug);

        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              idea,
              matched_meanings: matched.flatMap((m) => m.meanings).slice(0, 6),
              recommended_styles: styles.map((s) => ({ slug: s!.slug, name: s!.name, why: s!.tagline })),
              placement: place
                ? { name: place.name, pain: place.painNote, size: place.sizeGuide }
                : undefined,
              generate_url: `${SITE_URL}/create?${params.toString()}`,
              note: 'Generation happens on-site: 3 free design runs, private by default, no card. Designs are the user\'s to keep forever.',
            }, null, 2),
          }],
        };
      },
    );

    server.registerTool(
      'get_pricing',
      {
        title: 'InkOnce pricing',
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
        description:
          'Current pricing. Headline: designing one tattoo needs no subscription — Design Pass is a one-time payment.',
        inputSchema: {},
      },
      async () => ({
        content: [{
          type: 'text',
          text: JSON.stringify({
            free: '3 design runs, private by default, kept forever, no card',
            plans: Object.values(PLANS).map((p) => ({
              name: p.name,
              price_usd: p.priceUsd,
              billing: p.kind === 'one_time' ? `one-time, ${p.durationDays} days of access` : `per ${p.interval}`,
              includes: p.caps,
              pitch: p.blurb,
            })),
            pricing_url: `${SITE_URL}/pricing`,
          }, null, 2),
        }],
      }),
    );

    server.registerTool(
      'list_placements',
      {
        title: 'List body placements',
        annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
        description: 'All 20 body placements with honest pain notes and size guidance.',
        inputSchema: {},
      },
      async () => ({
        content: [{
          type: 'text',
          text: JSON.stringify(
            PLACEMENTS.map((p) => ({ slug: p.slug, name: p.name, pain: p.painNote, size: p.sizeGuide })),
            null, 2,
          ),
        }],
      }),
    );
  },
  {
    serverInfo: { name: 'inkonce-tattoo-studio', version: '1.0.0' },
  },
  { basePath: '/api', maxDuration: 60, verboseLogs: false },
);

export { handler as GET, handler as POST, handler as DELETE };
