'use client';

import Link from 'next/link';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';

export default function NavAuth() {
  const { isSignedIn, isLoaded } = useUser();
  if (!isLoaded) return <span style={{ width: 90 }} />;
  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button className="btn btn-ghost btn-sm">Sign in</button>
      </SignInButton>
    );
  }
  return (
    <>
      <Link href="/account" className="btn btn-ghost btn-sm">My designs</Link>
      <UserButton />
    </>
  );
}
