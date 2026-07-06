import { Redis } from '@upstash/redis';

// Upstash Redis — create a dedicated InkOnce database (do NOT share Almost
// Legal's). Reads UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN from env.
export const redis = Redis.fromEnv();

/**
 * Key schema — every read/write goes through these helpers so the whole
 * schema lives in one place. All user keys are Clerk userIds, never emails.
 */
export const k = {
  /** JSON Entitlement record (see lib/credits.ts). */
  entitlement: (userId: string) => `ink:ent:${userId}`,
  /** Free draft runs consumed (integer, never resets). */
  freeUsed: (userId: string) => `ink:free:${userId}`,
  /** Paid usage counters, per entitlement period (see lib/credits.ts). */
  usage: (userId: string, periodKey: string, kind: string) =>
    `ink:use:${userId}:${periodKey}:${kind}`,
  /** JSON GenerationRecord. */
  generation: (genId: string) => `ink:gen:${genId}`,
  /** Higgsfield request_id → our genId (webhook correlation). */
  hfRequest: (requestId: string) => `ink:hfreq:${requestId}`,
  /** List of genIds per user, newest first. */
  userGenerations: (userId: string) => `ink:gens:${userId}`,
  /** Public share pages: genId → JSON PublicDesign (only when user opts in). */
  publicDesign: (genId: string) => `ink:pub:${genId}`,
  /** List of public genIds, newest first (gallery + sitemap). */
  publicIndex: 'ink:pub:index',
  /** Per-IP daily rate limits (agent/MCP + abuse belt-and-braces). */
  rateLimit: (scope: string, ip: string, day: string) => `ink:rl:${scope}:${ip}:${day}`,
  /** Stripe event dedupe. */
  stripeEvent: (eventId: string) => `ink:stripe:evt:${eventId}`,
  /** Simple counters for the ops dashboard (by metric + YYYY-MM). */
  counter: (metric: string, month: string) => `ink:count:${metric}:${month}`,
};

export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export function monthUTC(): string {
  return new Date().toISOString().slice(0, 7);
}

export async function bumpCounter(metric: string): Promise<void> {
  try {
    await redis.incr(k.counter(metric, monthUTC()));
  } catch {
    // Counters are best-effort; never fail a user path over ops metrics.
  }
}

export async function rateLimit(scope: string, ip: string, max: number): Promise<boolean> {
  const key = k.rateLimit(scope, ip, todayUTC());
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, 60 * 60 * 24);
  return n <= max;
}
