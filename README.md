# InkOnce — AI tattoo design studio

**inkonce.com · "Design it right, once."**

Standalone Next.js app — this is the whole repo. (Originally built inside
`almostlegal-ai/inkonce/`; split out 2026-07-06.)

## What it is

The anti-subscription answer to BlackInk AI:

- **Design studio** (`/create`) — idea → 28 style-disciplined drafts → refine →
  hi-res + thermal-ready stencil. Draft/refine/export model tiers keep COGS at
  ~30% of price worst-case (see `PRICING.md`, enforced by `lib/plans.test.ts`).
- **Pricing** — Free (3 runs, private, kept forever) · Design Pass **$19.99
  one-time** · Ink Studio $11.99/mo · $39.99/yr. ≥70% net margin per generation
  including amortised free-tier cost and Stripe fees.
- **Programmatic SEO** — 28 style guides, 49 idea guides, 20 placement guides,
  ~1,370 idea×style long-tail pages, all with JSON-LD (FAQ, Breadcrumb, HowTo,
  WebApplication), full sitemap, dynamic OG images.
- **Agent-native** — remote MCP server at `/api/mcp` (list_tattoo_styles,
  get_style_guide, suggest_tattoo_design, get_pricing, list_placements),
  `/llms.txt`, `/openapi.json`, public content API, AI-crawler-welcoming robots.

## Stack

Next 16 (App Router) · Clerk (auth) · Upstash Redis (entitlements/usage/
generations) · Vercel Blob (permanent image storage) · Stripe (one-time +
subscriptions, inline price_data + automatic tax) · Higgsfield platform API
(image generation, async + webhook).

## Runbook

```bash
npm install
cp .env.example .env.local   # fill in keys
npm run dev
npm test                     # margin guardrail + prompt engine + content integrity
npm run typecheck
npm run build
```

## Launch checklist (one-time setup)

1. **Higgsfield**: create API key at cloud.higgsfield.ai → set
   `HIGGSFIELD_API_KEY/SECRET`. Verify per-model $ costs on the dashboard and
   update `COST_PER_IMAGE_USD` in `lib/plans.ts` (the test suite re-validates
   the 70% margin). Confirm the three default model IDs in `lib/higgsfield.ts`
   exist on the account; override via `HF_MODEL_*` envs if better options ship.
2. **Clerk**: create a NEW Clerk application (Google + email). Copy both keys.
3. **Upstash**: create a NEW Redis database (do not share Almost Legal's).
4. **Stripe**: same account is fine — all InkOnce objects carry
   `app: 'inkonce'` metadata and the webhook filters on it. Create a webhook
   endpoint → `https://inkonce.com/api/stripe-webhook` with events
   `checkout.session.completed`, `invoice.paid`,
   `customer.subscription.deleted`; set `STRIPE_WEBHOOK_SECRET`.
5. **Vercel**: new project on this repo (root directory `/`), attach a Blob store,
   set all envs from `.env.example`, generate a random `HF_WEBHOOK_SECRET`.
6. **DNS (GoDaddy)**: point `inkonce.com` A record → `76.76.21.21` and `www`
   CNAME → `cname.vercel-dns.com`, add the domain to the Vercel project.
7. Smoke: `npm run smoke -- https://inkonce.com`.
