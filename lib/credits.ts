import { redis, k, monthUTC } from './redis';
import { FREE_DRAFT_RUNS, PLANS, type Plan, type PlanCaps } from './plans';

/**
 * Entitlements + usage accounting.
 *
 * An Entitlement is the static record of what a user bought (written by the
 * Stripe webhook). Usage is tracked in separate Redis integer counters keyed
 * by (user, periodKey, kind) so concurrent generations INCR atomically instead
 * of read-modify-writing JSON.
 *
 *  - Design Pass: periodKey = activation timestamp; caps are totals for 7 days.
 *  - Ink Studio (monthly/annual): periodKey = current UTC month; caps reset
 *    monthly, no rollover.
 *  - Free tier: 3 draft runs per account, never resets (ink:free:{userId}).
 */

export type Entitlement = {
  plan: Plan['id'];
  activatedAt: number;
  /** ms epoch. Pass: activation + 7 days. Subs: current period end from Stripe. */
  expiresAt: number;
  /** Pass only: fixed period key (activation ts as string). */
  periodKey?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
};

export type UsageKind = keyof PlanCaps; // draftRuns | refineRuns | hiResExports | stencilExports

export async function getEntitlement(userId: string): Promise<Entitlement | null> {
  const ent = await redis.get<Entitlement>(k.entitlement(userId));
  if (!ent) return null;
  if (ent.expiresAt < Date.now()) return null;
  return ent;
}

export async function setEntitlement(userId: string, ent: Entitlement): Promise<void> {
  await redis.set(k.entitlement(userId), ent);
}

export async function clearEntitlement(userId: string): Promise<void> {
  await redis.del(k.entitlement(userId));
}

function periodKeyFor(ent: Entitlement): string {
  return ent.plan === 'pass' ? (ent.periodKey ?? String(ent.activatedAt)) : monthUTC();
}

export type Allowance = {
  plan: Plan['id'] | 'free';
  /** Remaining units per kind. Free users only have draftRuns. */
  remaining: Record<UsageKind, number>;
  expiresAt: number | null;
};

export async function getAllowance(userId: string): Promise<Allowance> {
  const ent = await getEntitlement(userId);
  if (!ent) {
    const used = (await redis.get<number>(k.freeUsed(userId))) ?? 0;
    return {
      plan: 'free',
      remaining: {
        draftRuns: Math.max(0, FREE_DRAFT_RUNS - used),
        refineRuns: 0,
        hiResExports: 0,
        stencilExports: 0,
      },
      expiresAt: null,
    };
  }
  const caps = PLANS[ent.plan].caps;
  const pk = periodKeyFor(ent);
  const kinds: UsageKind[] = ['draftRuns', 'refineRuns', 'hiResExports', 'stencilExports'];
  const usedValues = await Promise.all(
    kinds.map((kind) => redis.get<number>(k.usage(userId, pk, kind))),
  );
  const remaining = {} as Record<UsageKind, number>;
  kinds.forEach((kind, i) => {
    remaining[kind] = Math.max(0, caps[kind] - (usedValues[i] ?? 0));
  });
  return { plan: ent.plan, remaining, expiresAt: ent.expiresAt };
}

/**
 * Atomically consume one unit of `kind`. Returns false (and rolls back) if the
 * cap is exceeded — callers must not start a generation on false.
 */
export async function consume(userId: string, kind: UsageKind): Promise<boolean> {
  const ent = await getEntitlement(userId);
  if (!ent) {
    if (kind !== 'draftRuns') return false;
    const n = await redis.incr(k.freeUsed(userId));
    if (n > FREE_DRAFT_RUNS) {
      await redis.decr(k.freeUsed(userId));
      return false;
    }
    return true;
  }
  const caps = PLANS[ent.plan].caps;
  const key = k.usage(userId, periodKeyFor(ent), kind);
  const n = await redis.incr(key);
  if (n === 1) {
    // Usage counters die with the entitlement period; 60 days covers appeals.
    await redis.expire(key, 60 * 60 * 24 * 60);
  }
  if (n > caps[kind]) {
    await redis.decr(key);
    return false;
  }
  return true;
}

/** Refund one unit (generation failed/NSFW — Higgsfield refunds us, we refund the user). */
export async function refund(userId: string, kind: UsageKind): Promise<void> {
  const ent = await getEntitlement(userId);
  if (!ent) {
    if (kind === 'draftRuns') {
      const n = await redis.decr(k.freeUsed(userId));
      if (n < 0) await redis.incr(k.freeUsed(userId));
    }
    return;
  }
  const key = k.usage(userId, periodKeyFor(ent), kind);
  const n = await redis.decr(key);
  if (n < 0) await redis.incr(key);
}
