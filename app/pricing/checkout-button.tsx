'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';

type Props = {
  plan: 'pass' | 'studio' | 'studio-annual';
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

export default function CheckoutButton(props: Props) {
  // Clerk hooks require a mounted ClerkProvider. Before Clerk is configured the
  // provider isn't mounted, so render a keyless fallback that never calls the
  // hooks (the inner component that does is only mounted when Clerk is live).
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <a href="/create" className={props.className} style={props.style}>
        {props.children}
      </a>
    );
  }
  return <LiveCheckoutButton {...props} />;
}

function LiveCheckoutButton({ plan, className, style, children }: Props) {
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const [busy, setBusy] = useState(false);

  async function go() {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      alert(data.error ?? 'Checkout hiccup — try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className={className} style={style} disabled={busy} onClick={go}>
      {busy ? 'Opening checkout…' : children}
    </button>
  );
}
