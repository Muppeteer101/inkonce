import { NextResponse, type NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { clerkEnabled } from '@/lib/flags';

const isProtected = createRouteMatcher(['/account(.*)']);

const clerkProxy = clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect();
});

// Before Clerk is configured, the middleware must not invoke Clerk at all
// (it throws without keys). Bounce the only auth-gated route home and let
// everything else through, so the public site is fully live pre-keys.
function passthrough(req: NextRequest) {
  if (isProtected(req)) return NextResponse.redirect(new URL('/', req.url));
  return NextResponse.next();
}

export default clerkEnabled ? clerkProxy : passthrough;

export const config = {
  matcher: [
    '/((?!_next|.*\\.(?:svg|png|jpg|jpeg|ico|css|js|txt|xml|json|webmanifest)$).*)',
    '/(api|trpc)(.*)',
  ],
};
