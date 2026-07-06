import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { redis, k, bumpCounter } from '@/lib/redis';
import { setEntitlement, clearEntitlement, type Entitlement } from '@/lib/credits';
import { PLANS, type Plan } from '@/lib/plans';

export const maxDuration = 30;

/**
 * Stripe webhook for InkOnce. The Stripe account is shared with other
 * products, so every handler requires app:'inkonce' metadata and silently
 * acks everything else. Create the endpoint scoped to:
 *   checkout.session.completed, invoice.paid, customer.subscription.deleted
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get('stripe-signature');
  if (!secret || !sig) return NextResponse.json({ error: 'Misconfigured' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(await req.text(), sig, secret);
  } catch {
    return NextResponse.json({ error: 'Bad signature' }, { status: 400 });
  }

  // Idempotency — Stripe retries deliveries.
  const seen = await redis.set(k.stripeEvent(event.id), 1, { nx: true, ex: 60 * 60 * 24 * 3 });
  if (seen === null) return NextResponse.json({ ok: true, deduped: true });

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.app !== 'inkonce') break;
      const userId = session.metadata.inkonce_user || session.client_reference_id;
      const planId = session.metadata.inkonce_plan as Plan['id'] | undefined;
      if (!userId || !planId || !PLANS[planId]) break;

      const plan = PLANS[planId];
      const now = Date.now();
      const ent: Entitlement = {
        plan: planId,
        activatedAt: now,
        expiresAt:
          plan.kind === 'one_time'
            ? now + (plan.durationDays ?? 7) * 24 * 60 * 60 * 1000
            : // Subscriptions: provisional expiry; invoice.paid keeps extending.
              now + (plan.interval === 'year' ? 366 : 32) * 24 * 60 * 60 * 1000,
        periodKey: plan.kind === 'one_time' ? String(now) : undefined,
        stripeCustomerId: typeof session.customer === 'string' ? session.customer : undefined,
        stripeSubscriptionId:
          typeof session.subscription === 'string' ? session.subscription : undefined,
      };
      await setEntitlement(userId, ent);
      await bumpCounter(`purchase:${planId}`);
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      const subId =
        typeof invoice.parent?.subscription_details?.subscription === 'string'
          ? invoice.parent.subscription_details.subscription
          : undefined;
      if (!subId) break;
      const sub = await getStripe().subscriptions.retrieve(subId);
      if (sub.metadata?.app !== 'inkonce') break;
      const userId = sub.metadata.inkonce_user;
      const planId = sub.metadata.inkonce_plan as Plan['id'] | undefined;
      if (!userId || !planId || !PLANS[planId]) break;

      const periodEnd = sub.items.data[0]?.current_period_end;
      const ent: Entitlement = {
        plan: planId,
        activatedAt: sub.created * 1000,
        // 3-day grace beyond the period end for retry cycles.
        expiresAt: (periodEnd ? periodEnd * 1000 : Date.now()) + 3 * 24 * 60 * 60 * 1000,
        stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : undefined,
        stripeSubscriptionId: sub.id,
      };
      await setEntitlement(userId, ent);
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      if (sub.metadata?.app !== 'inkonce') break;
      const userId = sub.metadata.inkonce_user;
      if (userId) {
        await clearEntitlement(userId);
        await bumpCounter('churn');
      }
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
