import "server-only";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { challenges, type Challenge } from "@/db/schema";
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

/** One user's challenges, newest first. */
export async function getChallengesByUserId(userId: string): Promise<Challenge[]> {
  return getDb()
    .select()
    .from(challenges)
    .where(eq(challenges.userId, userId))
    .orderBy(desc(challenges.createdAt));
}
