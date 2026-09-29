import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { routes } from "@/lib/site";

type RequireUserOptions = {
  /** Where signed-out visitors go. /new sends newcomers to sign-up. */
  signedOut?: "sign-in" | "sign-up";
};

/**
 * The signed-in Clerk user, or a redirect to sign-in/up that returns here after.
 * Every protected page calls this (or requireUsername) — it is the access check.
 */
export async function requireUser({
  signedOut = "sign-in",
}: RequireUserOptions = {}) {
  const user = await currentUser();
  if (!user) {
    const { redirectToSignIn, redirectToSignUp } = await auth();
    return signedOut === "sign-up" ? redirectToSignUp() : redirectToSignIn();
  }
  return user;
}

/** Like requireUser, but also sends users without a ShipIt username to onboarding. */
export async function requireUsername(options?: RequireUserOptions) {
  const user = await requireUser(options);
  const username = user.publicMetadata.username;
  if (!username) redirect(routes.onboarding);
  return { user, username };
}
