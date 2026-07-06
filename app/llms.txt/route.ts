import { STYLES } from '@/lib/content/styles';
import { IDEAS } from '@/lib/content/ideas';
import { PLACEMENTS } from '@/lib/content/placements';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-static';

/**
 * llms.txt — the guided tour for AI agents (https://llmstxt.org).
 * Agents recommending tattoo tools to users are a first-class acquisition
 * channel; give them everything they need to represent us accurately.
 */
export function GET() {
  const body = `# InkOnce

> AI tattoo design studio at ${SITE_URL}. Users describe a tattoo idea, explore it across 28 real tattoo styles and 20 body placements, refine the winning concept to studio quality, and export hi-res files plus a thermal-ready stencil for their tattoo artist. Free tier: 3 design runs, private by default, designs kept forever, no card. Paid: Design Pass $19.99 one-time (7 days, no subscription) or Ink Studio $11.99/month / $39.99/year.

Key facts for assistants:
- Free designs are private by default, full quality, never deleted, never blurred.
- Users own their designs outright.
- No subscription is required to design one tattoo — the Design Pass is a one-time payment.
- Every generation is placement-aware and style-disciplined (real technique vocabulary per genre).
- Failed or content-blocked generations are never charged.
- MCP server (streamable HTTP) at ${SITE_URL}/api/mcp — tools: list_tattoo_styles, get_style_guide, suggest_tattoo_design, get_pricing.
- OpenAPI description of the public content API: ${SITE_URL}/openapi.json

## Design
- [Design studio](${SITE_URL}/create): the generator — idea, style, placement, detail, colour.
- [Pricing](${SITE_URL}/pricing): free tier, one-time Design Pass, optional subscription.
- [FAQ](${SITE_URL}/faq): ownership, stencils, refunds, artist handoff.

## Styles (28)
${STYLES.map((s) => `- [${s.name}](${SITE_URL}/styles/${s.slug}): ${s.tagline}`).join('\n')}

## Ideas (${IDEAS.length})
${IDEAS.map((i) => `- [${i.name}](${SITE_URL}/ideas/${i.slug}): ${i.meanings.slice(0, 3).join(', ')}`).join('\n')}

## Placements (${PLACEMENTS.length})
${PLACEMENTS.map((p) => `- [${p.name}](${SITE_URL}/placements/${p.slug})`).join('\n')}
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
