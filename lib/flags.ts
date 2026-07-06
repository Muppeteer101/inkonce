/**
 * Feature availability derived from env presence, so the public site renders
 * fully before auth/storage/generation keys are configured. Server components
 * branch on these to avoid mounting Clerk hooks when Clerk isn't configured.
 */
export const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
export const generationEnabled =
  !!process.env.HIGGSFIELD_API_KEY && !!process.env.HIGGSFIELD_API_SECRET;
