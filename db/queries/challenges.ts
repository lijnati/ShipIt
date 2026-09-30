import "server-only";
import { and, desc, eq, gt, isNotNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { challenges, users, type Challenge } from "@/db/schema";
import { isUniqueViolation } from "@/db/queries/users";
import { slugifyTitle, type ValidChallenge } from "@/lib/challenge";

const SLUG_ATTEMPTS = 5;

/**
 * Creates a challenge owned by `userId` (always the session's user — callers
 * must never pass a client-supplied id). Returns the final slug.
 *
 * Tries the readable slug first; on collision, appends a short random suffix
 * and retries. The unique constraint decides — no check-then-insert.
 */
export async function createChallenge(userId: string, data: ValidChallenge): Promise<string> {
  const base = slugifyTitle(data.title);

  for (let attempt = 0; attempt < SLUG_ATTEMPTS; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${randomSuffix()}`;
    try {
      const [created] = await getDb()
        .insert(challenges)
        .values({ ...data, userId, slug })
        .returning({ slug: challenges.slug });
      return created.slug;
    } catch (error) {
      if (!isUniqueViolation(error, "challenges_slug_unique")) throw error;
    }
  }

  throw new Error(`Could not find a free slug for "${base}" after ${SLUG_ATTEMPTS} attempts`);
}

function randomSuffix(): string {
  // 4 base36 chars ≈ 1.7M combinations per base slug.
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return Array.from(bytes, (b) => (b % 36).toString(36)).join("");
}

export type ShipOutcome = "shipped" | "not-found" | "not-owner" | "already-shipped" | "too-late";

/**
 * Marks a challenge shipped, if and only if it belongs to `userId`, is still
 * active, and its deadline hasn't passed — all checked in one UPDATE against
 * the database clock, so replays and races can't slip through. shipped_at is
 * the database's now(), never a client time.
 */
export async function shipChallenge(
  slug: string,
  userId: string,
  proofUrl: string | null,
): Promise<ShipOutcome> {
  const db = getDb();
  const [updated] = await db
    .update(challenges)
    .set({ status: "shipped", shippedAt: sql`now()`, proofUrl })
    .where(
      and(
        eq(challenges.slug, slug),
        eq(challenges.userId, userId),
        eq(challenges.status, "active"),
        gt(challenges.deadline, sql`now()`),
      ),
    )
    .returning({ slug: challenges.slug });
  if (updated) return "shipped";

  // Nothing matched. Work out why, for a human-readable message.
  const [row] = await db
    .select({ userId: challenges.userId, status: challenges.status })
    .from(challenges)
    .where(eq(challenges.slug, slug))
    .limit(1);
  if (!row) return "not-found";
  if (row.userId !== userId) return "not-owner";
  if (row.status === "shipped") return "already-shipped";
  return "too-late";
}

/** A challenge plus only the public fields of its creator. */
export async function getChallengeBySlug(slug: string) {
  const challenge = await getDb().query.challenges.findFirst({
    where: eq(challenges.slug, slug),
    with: {
      user: { columns: { username: true, displayName: true, avatarUrl: true } },
    },
  });
  return challenge ?? null;
}

/** Newest public challenges with their creator's public fields (landing page). */
export async function getRecentChallenges(limit: number) {
  const rows = await getDb().query.challenges.findMany({
    orderBy: desc(challenges.createdAt),
    limit,
    columns: { slug: true, title: true, deadline: true, status: true, shippedAt: true },
    with: { user: { columns: { username: true, avatarUrl: true } } },
  });
  return rows.flatMap(({ user, ...challenge }) =>
    user.username ? [{ ...challenge, creator: { username: user.username, avatarUrl: user.avatarUrl } }] : [],
  );
}

/** Public URLs for the sitemap: every challenge and every profile with a username. */
export async function getSitemapEntries() {
  const db = getDb();
  const [challengeRows, profileRows] = await Promise.all([
    db
      .select({ slug: challenges.slug, updatedAt: challenges.updatedAt })
      .from(challenges)
      .orderBy(desc(challenges.createdAt))
      .limit(20_000),
    db
      .select({ username: users.username, updatedAt: users.updatedAt })
      .from(users)
      .where(isNotNull(users.username))
      .limit(20_000),
  ]);
  return { challenges: challengeRows, profiles: profileRows };
}

/** One user's challenges, newest first. */
export async function getChallengesByUserId(userId: string): Promise<Challenge[]> {
  return getDb()
    .select()
    .from(challenges)
    .where(eq(challenges.userId, userId))
    .orderBy(desc(challenges.createdAt));
}
