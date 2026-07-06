'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';

export default function CheckoutButton({
  plan,
  className,
  style,
  children,
}: {
  plan: 'pass' | 'studio' | 'studio-annual';
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
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
