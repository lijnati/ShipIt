"use server";

import { auth, clerkClient, type User } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { routes } from "@/lib/site";
import { validateUsername } from "@/lib/username";

export type ClaimUsernameState = {
  error: string | null;
  /** The input the error refers to, so the form can hide stale errors. */
  username: string;
};

type ClaimOutcome = "claimed" | "taken" | "already-set";

export async function claimUsername(
  _prev: ClaimUsernameState,
  formData: FormData,
): Promise<ClaimUsernameState> {
  const raw = formData.get("username");
  const input = typeof raw === "string" ? raw : "";

  // Identity always comes from the session, never from the form.
  const { userId } = await auth();
  if (!userId) {
    return {
      error: "Your session expired. Sign in again to claim a username.",
      username: input,
    };
  }

  const result = validateUsername(input);
  if (!result.ok) return { error: result.error, username: input };
  const { username } = result;

  let outcome: ClaimOutcome;
  try {
    outcome = await claim(userId, username);
  } catch (error) {
    console.error("[onboarding] username claim failed", error);
    return {
      error:
        "We couldn't save your username. Nothing was claimed — try again in a moment.",
      username,
    };
  }

  if (outcome === "taken") {
    return { error: `@${username} is already taken. Someone shipped faster.`, username };
  }

  redirect(routes.newChallenge);
}

/*
 * TEMPORARY (Phase 2): usernames live in Clerk publicMetadata, which Clerk can't
 * query or constrain. We scan users server-side for uniqueness and resolve races
 * by re-checking after the write. Replaced by a unique column in Postgres.
 */
async function claim(userId: string, username: string): Promise<ClaimOutcome> {
  const client = await clerkClient();

  const me = await client.users.getUser(userId);
  if (me.publicMetadata.username) return "already-set";

  const existing = await findUsersWithUsername(username);
  if (existing.some((user) => user.id !== userId)) return "taken";

  const claimedAt = Date.now();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { username, usernameClaimedAt: claimedAt },
  });

  // No conditional writes in Clerk, so check again: if someone claimed the same
  // name concurrently, the earliest claim wins and later claimants roll back.
  const holders = await findUsersWithUsername(username);
  const lostRace = holders.some(
    (user) =>
      user.id !== userId &&
      isEarlierClaim(user.publicMetadata.usernameClaimedAt ?? 0, user.id, claimedAt, userId),
  );

  if (lostRace) {
    await client.users.updateUserMetadata(userId, {
      publicMetadata: { username: null, usernameClaimedAt: null },
    });
    return "taken";
  }

  return "claimed";
}

function isEarlierClaim(
  aClaimedAt: number,
  aId: string,
  bClaimedAt: number,
  bId: string,
): boolean {
  return aClaimedAt < bClaimedAt || (aClaimedAt === bClaimedAt && aId < bId);
}

async function findUsersWithUsername(username: string): Promise<User[]> {
  const client = await clerkClient();
  const limit = 500;
  const matches: User[] = [];

  for (let offset = 0; ; offset += limit) {
    const { data, totalCount } = await client.users.getUserList({
      limit,
      offset,
      orderBy: "+created_at",
    });
    matches.push(
      ...data.filter((user) => user.publicMetadata.username === username),
    );
    if (data.length < limit || offset + limit >= totalCount) break;
  }

  return matches;
}
