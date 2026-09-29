import { clerkMiddleware } from "@clerk/nextjs/server";
import { routes } from "@/lib/site";

// Clerk only needs to run here so auth() works everywhere. Access control lives
// in the protected pages themselves (see lib/auth.ts), per Clerk's guidance
// against path-matching auth checks.
export default clerkMiddleware({
  signInUrl: routes.signIn,
  signUpUrl: routes.signUp,
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
