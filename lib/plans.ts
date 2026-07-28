/**
 * InkOnce pricing model — the single source of truth for plan caps and the
 * margin guardrail. PRICING.md explains the maths; lib/plans.test.ts fails the
 * build if any constant here drops a plan below the target margin.
 *
 * Costs are per-image USD on the Higgsfield platform API. They are researched
 * estimates (see PRICING.md §1) — replace with observed dashboard numbers at
 * launch; the test recomputes everything.
 */

/**
 * Per-image cost by tier.
 *
 * All three tiers currently run the SAME model — `higgsfield-ai/soul/standard`
 * (see lib/higgsfield.ts). Only Higgsfield's own Soul family is exposed on this
 * account's developer API, so the cheap draft class and the premium render
 * class this table used to assume (Z-Image, Seedream 4.5, Nano Banana Pro) are
 * not reachable. Pricing them separately made the guardrail measure a product
 * we don't ship: it reported ~76% on the Design Pass while the real figure was
 * ~45%.
 *
 * Soul Standard bills 1 credit/image; PRICING.md §1 puts a credit at ~$0.0625,
 * so all three tiers carry that. Conservative on purpose — the credit price is
 * itself an estimate, and a guardrail should err expensive.
 *
 * These stop being equal the moment a tier moves to a different model; keep the
 * three keys so that change is a one-line edit.
 */
const SOUL_STANDARD_USD = 0.0625;

export const COST_PER_IMAGE_USD = {
  /** Exploration tier — soul/standard. */
  draft: SOUL_STANDARD_USD,
  /** Refine + stencil tier — soul/standard. */
  standard: SOUL_STANDARD_USD,
  /** Hi-res export tier — soul/standard. */
  premium: SOUL_STANDARD_USD,
} as const;

// Higgsfield soul/standard only accepts batch_size of 1 or 4.
export const DRAFT_IMAGES_PER_RUN = 1;
export const REFINE_IMAGES_PER_RUN = 4;

/** Free tier: draft runs per account, sign-in required, never resets. */
export const FREE_DRAFT_RUNS = 3;

/** Planning-case free→paid conversion. Loaded onto EVERY purchase (conservative). */
export const ASSUMED_FREE_TO_PAID_CONVERSION = 0.03;

export const STRIPE_FEE = { pct: 0.029, fixedUsd: 0.3 } as const;

/**
 * Accepted net-margin floor (decision, 2026-07-27): quality of output wins over
 * margin — a product that sells at ~45% beats one that doesn't at 70%. The
 * original 70% target assumed a cheap draft-class model this account cannot
 * reach; on Soul Standard across all tiers the Design Pass lands at ~45%.
 *
 * If this needs to come back up, the lever is CAC, not the model: the free tier
 * costs FREE_DRAFT_RUNS × $0.0625 ÷ 3% conversion = $6.25 per paying customer,
 * more than the $3.88 of goods they consume. FREE_DRAFT_RUNS 3→1 alone returns
 * the Design Pass to ~66% with zero effect on output quality.
 */
export const TARGET_MIN_NET_MARGIN = 0.4;

export type PlanCaps = {
  draftRuns: number;
  refineRuns: number;
  hiResExports: number;
  stencilExports: number;
};

export type Plan = {
  id: 'pass' | 'studio' | 'studio-annual';
  name: string;
  priceUsd: number;
  kind: 'one_time' | 'subscription';
  /** one_time: days of access. subscription: billing interval. */
  durationDays?: number;
  interval?: 'month' | 'year';
  /** Caps per period (one_time: total; subscription: per month, no rollover). */
  caps: PlanCaps;
  blurb: string;
};

export const PLANS: Record<Plan['id'], Plan> = {
  pass: {
    id: 'pass',
    name: 'Design Pass',
    priceUsd: 19.99,
    kind: 'one_time',
    durationDays: 7,
    caps: { draftRuns: 25, refineRuns: 7, hiResExports: 4, stencilExports: 5 },
    blurb:
      'One payment, one week, one tattoo designed properly. Everything you need to walk into the studio.',
  },
  studio: {
    id: 'studio',
    name: 'Ink Studio',
    priceUsd: 11.99,
    kind: 'subscription',
    interval: 'month',
    caps: { draftRuns: 40, refineRuns: 5, hiResExports: 3, stencilExports: 3 },
    blurb: 'For collectors and artists who design every month. Cancel anytime.',
  },
  'studio-annual': {
    id: 'studio-annual',
    name: 'Ink Studio Annual',
    priceUsd: 39.99,
    kind: 'subscription',
    interval: 'year',
    caps: { draftRuns: 40, refineRuns: 5, hiResExports: 3, stencilExports: 3 },
    blurb: 'A full year of Ink Studio at the best price we offer.',
  },
};

/** Direct model cost of fully exhausting a set of caps. */
export function capsCogsUsd(caps: PlanCaps): number {
  return (
    caps.draftRuns * DRAFT_IMAGES_PER_RUN * COST_PER_IMAGE_USD.draft +
    caps.refineRuns * REFINE_IMAGES_PER_RUN * COST_PER_IMAGE_USD.standard +
    caps.hiResExports * COST_PER_IMAGE_USD.premium +
    caps.stencilExports * COST_PER_IMAGE_USD.standard
  );
}

/** COGS of one free signup (they exhaust the whole free allowance). */
export function freeSignupCogsUsd(): number {
  return FREE_DRAFT_RUNS * DRAFT_IMAGES_PER_RUN * COST_PER_IMAGE_USD.draft;
}

/** Free-tier cost amortised over each paying customer at the assumed conversion. */
export function amortisedFreeLoadUsd(conversion = ASSUMED_FREE_TO_PAID_CONVERSION): number {
  return freeSignupCogsUsd() / conversion;
}

export function stripeFeeUsd(priceUsd: number): number {
  return priceUsd * STRIPE_FEE.pct + STRIPE_FEE.fixedUsd;
}

export type MarginOptions = {
  /** Load the amortised free-tier cost onto this purchase (true for first purchases). */
  includeFreeLoading?: boolean;
  /** Fraction of caps actually consumed. 1 = worst case. */
  usageFactor?: number;
  /** Number of periods the caps apply to (annual sub = 12 monthly cap periods). */
  periods?: number;
  conversion?: number;
};

/**
 * Net margin for a plan purchase: 1 − (COGS + free loading + Stripe) / price.
 */
export function netMargin(plan: Plan, opts: MarginOptions = {}): number {
  const {
    includeFreeLoading = true,
    usageFactor = 1,
    periods = 1,
    conversion = ASSUMED_FREE_TO_PAID_CONVERSION,
  } = opts;
  const cogs = capsCogsUsd(plan.caps) * usageFactor * periods;
  const free = includeFreeLoading ? amortisedFreeLoadUsd(conversion) : 0;
  const fees = stripeFeeUsd(plan.priceUsd);
  return 1 - (cogs + free + fees) / plan.priceUsd;
}

/**
 * Revenue and fully-loaded cost per generation run for the Design Pass —
 * the "≥70% net margin on each image generation" framing.
 */
export function perGenerationEconomics(planId: Plan['id'] = 'pass') {
  const plan = PLANS[planId];
  const runs = plan.caps.draftRuns + plan.caps.refineRuns;
  const loadedCost =
    capsCogsUsd(plan.caps) + amortisedFreeLoadUsd() + stripeFeeUsd(plan.priceUsd);
  return {
    runs,
    revenuePerRunUsd: plan.priceUsd / runs,
    loadedCostPerRunUsd: loadedCost / runs,
    netMarginPerRun: 1 - loadedCost / plan.priceUsd,
  };
}
