import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { validateUsername } from "@/lib/username";

export async function getUserByClerkId(clerkUserId: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1);
  return user ?? null;
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  return user ?? null;
}

type ClerkProfile = {
  clerkUserId: string;
  displayName: string | null;
  avatarUrl: string | null;
  /** Username from Phase 2 Clerk metadata, if any. */
  legacyUsername: string | null;
};

/**
 * Creates the ShipIt row for a Clerk user, or returns the existing one.
 * Safe under repeats and concurrent first requests: clerk_user_id is unique.
 *
 * A Phase 2 metadata username is carried over when it's valid and still free.
 * If someone already owns it, the row is created without a username and the
 * user picks a new one in onboarding — we never invent one for them.
 */
export async function createOrSyncUser(profile: ClerkProfile): Promise<User> {
  const legacy = profile.legacyUsername ? validateUsername(profile.legacyUsername) : null;
  const username = legacy?.ok ? legacy.username : null;

  if (profile.legacyUsername && !username) {
    console.warn(
      `[users] legacy username for ${profile.clerkUserId} is invalid; sending to onboarding`,
    );
  }

  try {
    return await upsertUser(profile, username);
  } catch (error) {
    if (username && isUniqueViolation(error, "users_username_unique")) {
      console.warn(
        `[users] legacy username @${username} for ${profile.clerkUserId} is taken; sending to onboarding`,
      );
      return upsertUser(profile, null);
    }
    throw error;
  }
}

async function upsertUser(profile: ClerkProfile, username: string | null): Promise<User> {
  const [user] = await db
    .insert(users)
    .values({
      clerkUserId: profile.clerkUserId,
      username,
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
    })
    // If a concurrent request created the row first, refresh profile fields and
    // return it. The username is never touched here.
    .onConflictDoUpdate({
      target: users.clerkUserId,
      set: { displayName: profile.displayName, avatarUrl: profile.avatarUrl },
    })
    .returning();
  return user;
}

/**
 * Sets the username for a user who doesn't have one yet. The unique
 * constraint is the real guard; the caller validates format first.
 */
export async function claimUsername(
  userId: string,
  username: string,
): Promise<"claimed" | "taken" | "already-set"> {
  try {
    const [updated] = await db
      .update(users)
      .set({ username })
      .where(and(eq(users.id, userId), isNull(users.username)))
      .returning({ id: users.id });
    return updated ? "claimed" : "already-set";
  } catch (error) {
    if (isUniqueViolation(error, "users_username_unique")) return "taken";
    throw error;
  }
}

/** Postgres unique_violation (23505), optionally on a specific constraint. */
function isUniqueViolation(error: unknown, constraint?: string): boolean {
  // Drizzle wraps driver errors in DrizzleQueryError; the Postgres error is the cause.
  for (let e: unknown = error; e instanceof Error; e = e.cause) {
    const pg = e as Error & { code?: unknown; constraint?: unknown };
    if (pg.code === "23505") return !constraint || pg.constraint === constraint;
  }
  return false;
}
