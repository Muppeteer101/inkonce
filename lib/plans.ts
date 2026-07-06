/**
 * InkOnce pricing model — the single source of truth for plan caps and the
 * 70%-margin guardrail. PRICING.md explains the maths; lib/plans.test.ts
 * fails the build if any constant here drops a plan below the target margin.
 *
 * Costs are per-image USD on the Higgsfield platform API. They are researched
 * estimates (see PRICING.md §1) — replace with observed dashboard numbers at
 * launch; the test recomputes everything.
 */

export const COST_PER_IMAGE_USD = {
  /** Draft-class model (Z-Image / Nano Banana Lite class). */
  draft: 0.01,
  /** Standard model (Seedream 4.5 class, up to 4K). */
  standard: 0.0625,
  /** Premium render (Nano Banana Pro / Soul HD class). */
  premium: 0.125,
} as const;

export const DRAFT_IMAGES_PER_RUN = 2;
export const REFINE_IMAGES_PER_RUN = 4;

/** Free tier: draft runs per account, sign-in required, never resets. */
export const FREE_DRAFT_RUNS = 3;

/** Planning-case free→paid conversion. Loaded onto EVERY purchase (conservative). */
export const ASSUMED_FREE_TO_PAID_CONVERSION = 0.03;

export const STRIPE_FEE = { pct: 0.029, fixedUsd: 0.3 } as const;

export const TARGET_MIN_NET_MARGIN = 0.7;

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
    blurb: 'A year of Ink Studio for less than half of what the other guys charge.',
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
