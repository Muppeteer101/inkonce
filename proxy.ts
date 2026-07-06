import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtected = createRouteMatcher(['/account(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Run on everything except static assets and Next internals. Webhooks are
    // included (harmless) — their routes do their own secret/signature auth.
    '/((?!_next|.*\\.(?:svg|png|jpg|jpeg|ico|css|js|txt|xml|json|webmanifest)$).*)',
    '/(api|trpc)(.*)',
  ],
};
