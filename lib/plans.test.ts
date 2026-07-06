import { describe, expect, it } from 'vitest';
import {
  PLANS,
  TARGET_MIN_NET_MARGIN,
  netMargin,
  perGenerationEconomics,
  freeSignupCogsUsd,
} from './plans';

/**
 * The 70% guardrail. If a price, cap, or cost constant changes such that a
 * plan drops below the target margin under its documented scenario, this
 * suite fails. PRICING.md §4 documents each scenario's rationale.
 */
describe('margin guardrail (≥70% net per PRICING.md)', () => {
  it('Design Pass clears 70% at WORST CASE (full cap usage + free loading)', () => {
    expect(netMargin(PLANS.pass, { includeFreeLoading: true, usageFactor: 1 }))
      .toBeGreaterThanOrEqual(TARGET_MIN_NET_MARGIN);
  });

  it('Ink Studio monthly clears 70% at steady state (full caps, no free loading)', () => {
    expect(netMargin(PLANS.studio, { includeFreeLoading: false, usageFactor: 1 }))
      .toBeGreaterThanOrEqual(TARGET_MIN_NET_MARGIN);
  });

  it('Ink Studio monthly month-1 stays above 50% even worst-case (documented exception)', () => {
    expect(netMargin(PLANS.studio, { includeFreeLoading: true, usageFactor: 1 }))
      .toBeGreaterThanOrEqual(0.5);
  });

  it('Ink Studio Annual clears 70% at observed-usage planning case (25% of caps, 12 periods)', () => {
    expect(
      netMargin(PLANS['studio-annual'], {
        includeFreeLoading: true,
        usageFactor: 0.25,
        periods: 12,
      }),
    ).toBeGreaterThanOrEqual(TARGET_MIN_NET_MARGIN);
  });

  it('per-generation framing: each Design Pass run nets ≥70%', () => {
    const econ = perGenerationEconomics('pass');
    expect(econ.netMarginPerRun).toBeGreaterThanOrEqual(TARGET_MIN_NET_MARGIN);
    expect(econ.revenuePerRunUsd).toBeGreaterThan(econ.loadedCostPerRunUsd);
  });

  it('a free signup costs pennies, not dollars', () => {
    expect(freeSignupCogsUsd()).toBeLessThanOrEqual(0.1);
  });
});
