"use server";

import { redirect } from "next/navigation";
import { claimUsername as saveUsername } from "@/db/queries/users";
import { getCurrentShipItUser } from "@/lib/auth";
import { routes } from "@/lib/site";
import { validateUsername } from "@/lib/username";

export type ClaimUsernameState = {
  error: string | null;
  /** The input the error refers to, so the form can hide stale errors. */
  username: string;
};

export async function claimUsername(
  _prev: ClaimUsernameState,
  formData: FormData,
): Promise<ClaimUsernameState> {
  const raw = formData.get("username");
  const input = typeof raw === "string" ? raw : "";

  const result = validateUsername(input);
  if (!result.ok) return { error: result.error, username: input };
  const { username } = result;

  let outcome: Awaited<ReturnType<typeof saveUsername>>;
  try {
    // Identity always comes from the Clerk session, never from the form.
    const user = await getCurrentShipItUser();
    if (!user) {
      return {
        error: "Your session expired. Sign in again to claim a username.",
        username,
      };
    }
    outcome = await saveUsername(user.id, username);
  } catch (error) {
    console.error("[onboarding] username claim failed", error);
    return {
      error: "We couldn't save your username. Nothing was claimed — try again in a moment.",
      username,
    };
  }

  if (outcome === "taken") {
    return { error: "That username was just claimed. Try another one.", username };
  }

  // "claimed", or "already-set" if another tab finished onboarding first.
  redirect(outcome === "claimed" ? routes.newChallenge : routes.dashboard);
}
