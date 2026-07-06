import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';
import { PLANS } from '@/lib/plans';
import { SITE_URL } from '@/lib/seo';

const Body = z.object({ plan: z.enum(['pass', 'studio', 'studio-annual']) });

/**
 * Creates a Stripe Checkout session. Inline price_data (no dashboard products
 * needed) + automatic tax, matching the proven Almost Legal pattern. Every
 * object carries app:'inkonce' metadata — the Stripe account is shared, so the
 * webhook filters on it.
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid plan.' }, { status: 400 });
  const plan = PLANS[parsed.data.plan];

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;

  const stripe = getStripe();
  const meta = { app: 'inkonce', inkonce_plan: plan.id, inkonce_user: userId };

  const session = await stripe.checkout.sessions.create({
    mode: plan.kind === 'one_time' ? 'payment' : 'subscription',
    client_reference_id: userId,
    customer_email: email,
    metadata: meta,
    ...(plan.kind === 'subscription' ? { subscription_data: { metadata: meta } } : {}),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(plan.priceUsd * 100),
          product_data: {
            name: `InkOnce ${plan.name}`,
            description: plan.blurb,
          },
          ...(plan.kind === 'subscription'
            ? { recurring: { interval: plan.interval as 'month' | 'year' } }
            : {}),
        },
      },
    ],
    automatic_tax: { enabled: true },
    allow_promotion_codes: true,
    success_url: `${SITE_URL}/create?purchase=success`,
    cancel_url: `${SITE_URL}/pricing?purchase=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
