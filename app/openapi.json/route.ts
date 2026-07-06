import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-static';

/**
 * OpenAPI description of the public, unauthenticated content API — lets any
 * agent framework (not just MCP clients) integrate the style/idea knowledge
 * base and deep-link users into the studio.
 */
export function GET() {
  const spec = {
    openapi: '3.1.0',
    info: {
      title: 'InkOnce Public API',
      version: '1.0.0',
      description:
        'Public content API for the InkOnce AI tattoo design studio. Design generation itself requires a signed-in session on inkonce.com; agents should deep-link users to /create with idea and style query params.',
    },
    servers: [{ url: SITE_URL }],
    paths: {
      '/api/public/styles': {
        get: {
          operationId: 'listTattooStyles',
          summary: 'List all 28 tattoo styles with descriptions and traits',
          responses: { '200': { description: 'Array of styles' } },
        },
      },
      '/api/public/ideas': {
        get: {
          operationId: 'listTattooIdeas',
          summary: 'List tattoo ideas with meanings and recommended styles/placements',
          responses: { '200': { description: 'Array of ideas' } },
        },
      },
      '/api/public/placements': {
        get: {
          operationId: 'listPlacements',
          summary: 'List body placements with pain/size/composition guidance',
          responses: { '200': { description: 'Array of placements' } },
        },
      },
      '/create': {
        get: {
          operationId: 'openDesignStudio',
          summary: 'Deep link: open the design studio prefilled',
          parameters: [
            { name: 'idea', in: 'query', schema: { type: 'string' }, description: 'Tattoo idea text' },
            { name: 'style', in: 'query', schema: { type: 'string' }, description: 'Style slug from listTattooStyles' },
          ],
          responses: { '200': { description: 'HTML design studio' } },
        },
      },
    },
  };
  return Response.json(spec, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
