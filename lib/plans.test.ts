import { describe, expect, it } from 'vitest';
import {
  PLANS,
  TARGET_MIN_NET_MARGIN,
  netMargin,
  perGenerationEconomics,
  freeSignupCogsUsd,
} from './plans';

/**
 * The margin guardrail. If a price, cap, or cost constant changes such that a
 * plan drops below the target margin under its documented scenario, this suite
 * fails. PRICING.md §4 documents each scenario's rationale.
 *
 * Floor is TARGET_MIN_NET_MARGIN (40%), down from 70% — see the note on that
 * constant. The old 70% was computed against a cheap draft-class model this
 * account cannot reach; every tier now runs Soul Standard.
 */
describe(`margin guardrail (≥${TARGET_MIN_NET_MARGIN * 100}% net per PRICING.md)`, () => {
  it('Design Pass clears the floor at WORST CASE (full cap usage + free loading)', () => {
    expect(netMargin(PLANS.pass, { includeFreeLoading: true, usageFactor: 1 }))
      .toBeGreaterThanOrEqual(TARGET_MIN_NET_MARGIN);
  });

  it('Ink Studio monthly clears the floor at steady state (full caps, no free loading)', () => {
    expect(netMargin(PLANS.studio, { includeFreeLoading: false, usageFactor: 1 }))
      .toBeGreaterThanOrEqual(TARGET_MIN_NET_MARGIN);
  });

  /**
   * KNOWN WEAK POINT — the monthly plan's first month is barely profitable:
   * ~8% net, about $0.97 on a $11.99 sale. It is not the model cost ($4.13 of
   * goods); it is customer acquisition. The free tier costs $6.25 per paying
   * customer at the 3% planning conversion, which is 52% of Ink Studio's price
   * — the Design Pass absorbs that on $19.99, the monthly plan cannot.
   *
   * Deliberately NOT thresholded down to ~8% and forgotten. The floor asserted
   * here is that month one must never be LOSS-making, so a cap or cost change
   * that tips it negative fails the build. Raising it back is a funnel
   * decision, not a model one: FREE_DRAFT_RUNS 3→1 returns this to ~43% with
   * no effect on output quality.
   */
  it('Ink Studio monthly month-1 is thin but never loss-making', () => {
    const m1 = netMargin(PLANS.studio, { includeFreeLoading: true, usageFactor: 1 });
    expect(m1).toBeGreaterThan(0);
    // Fails if it degrades further, so the weak point can't quietly get worse.
    expect(m1).toBeGreaterThanOrEqual(0.05);
  });

  it('Ink Studio Annual clears the floor at observed-usage planning case (25% of caps, 12 periods)', () => {
    expect(
      netMargin(PLANS['studio-annual'], {
        includeFreeLoading: true,
        usageFactor: 0.25,
        periods: 12,
      }),
    ).toBeGreaterThanOrEqual(TARGET_MIN_NET_MARGIN);
  });

  it('per-generation framing: each Design Pass run clears the floor', () => {
    const econ = perGenerationEconomics('pass');
    expect(econ.netMarginPerRun).toBeGreaterThanOrEqual(TARGET_MIN_NET_MARGIN);
    expect(econ.revenuePerRunUsd).toBeGreaterThan(econ.loadedCostPerRunUsd);
  });

  // $0.1875 on Soul Standard (3 runs × 1 image × $0.0625). Still pennies, but
  // it is the input to the $6.25 CAC above — the cap that actually matters is
  // FREE_DRAFT_RUNS, not this.
  it('a free signup costs pennies, not dollars', () => {
    expect(freeSignupCogsUsd()).toBeLessThanOrEqual(0.25);
  });
});
