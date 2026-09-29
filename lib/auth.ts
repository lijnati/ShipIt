import "server-only";
import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { User } from "@/db/schema";
import { createOrSyncUser, getUserByClerkId } from "@/db/queries/users";
import { routes } from "@/lib/site";

/**
 * The ShipIt user for the current Clerk session, or null when signed out.
 * Creates the database row on first sight (carrying over a Phase 2 username).
 * Cached per request, so layouts and pages can all call it.
 */
export const getCurrentShipItUser = cache(async (): Promise<User | null> => {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await getUserByClerkId(userId);
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  return createOrSyncUser({
    clerkUserId: clerkUser.id,
    displayName: clerkUser.fullName,
    avatarUrl: clerkUser.hasImage ? clerkUser.imageUrl : null,
    legacyUsername: clerkUser.publicMetadata.username ?? null,
  });
});

type RequireOptions = {
  /** Where signed-out visitors go. /new sends newcomers to sign-up. */
  signedOut?: "sign-in" | "sign-up";
};

/**
 * The current ShipIt user, or a redirect to sign-in/up that returns here after.
 * Every protected page calls this (or requireUsername) — it is the access check.
 */
export async function requireShipItUser({
  signedOut = "sign-in",
}: RequireOptions = {}): Promise<User> {
  const user = await getCurrentShipItUser();
  if (!user) {
    const { redirectToSignIn, redirectToSignUp } = await auth();
    return signedOut === "sign-up" ? redirectToSignUp() : redirectToSignIn();
  }
  return user;
}

/** Like requireShipItUser, but also sends users without a username to onboarding. */
export async function requireUsername(
  options?: RequireOptions,
): Promise<User & { username: string }> {
  const user = await requireShipItUser(options);
  if (!user.username) redirect(routes.onboarding);
  return { ...user, username: user.username };
}
