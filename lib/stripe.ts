import Stripe from 'stripe';

// Lazy singleton — Stripe v22 throws on construction with an empty key, which
// would crash Next's build-time page-data collection when env vars are absent.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  _stripe = new Stripe(key, {
    appInfo: { name: 'inkonce.com', version: '1.0.0' },
  });
  return _stripe;
}
