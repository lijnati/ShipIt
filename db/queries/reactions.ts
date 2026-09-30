import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { challengeReactions, challenges, type ReactionType } from "@/db/schema";
import { emptyReactionCounts, type ReactionCounts } from "@/lib/reactions";

/**
 * Per-type counts as SQL aggregates over a (left-joined) challenge_reactions.
 * count(id) skips the NULL row a left join produces, so no reactions → 0.
 * Used by every list so counts come back in the same query as the cards.
 */
export const reactionCountColumns = {
  fire: sql<number>`count(${challengeReactions.id}) filter (where ${challengeReactions.type} = 'fire')`.mapWith(Number),
  respect: sql<number>`count(${challengeReactions.id}) filter (where ${challengeReactions.type} = 'respect')`.mapWith(Number),
  skull: sql<number>`count(${challengeReactions.id}) filter (where ${challengeReactions.type} = 'skull')`.mapWith(Number),
};

/** Total reactions, for popularity ordering. */
export const reactionTotal = sql<number>`count(${challengeReactions.id})`.mapWith(Number);

export type ReactionSummary = {
  counts: ReactionCounts;
  /** Types the viewer has reacted with. Empty when signed out. */
  mine: ReactionType[];
};

/** Counts for one challenge plus the viewer's own reactions, in one grouped query. */
export async function getReactionSummary(
  challengeId: string,
  viewerId: string | null,
): Promise<ReactionSummary> {
  const rows = await getDb()
    .select({
      type: challengeReactions.type,
      count: sql<number>`count(*)`.mapWith(Number),
      mine: viewerId
        ? sql<boolean>`bool_or(${challengeReactions.userId} = ${viewerId})`
        : sql<boolean>`false`,
    })
    .from(challengeReactions)
    .where(eq(challengeReactions.challengeId, challengeId))
    .groupBy(challengeReactions.type);

  const counts = emptyReactionCounts();
  const mine: ReactionType[] = [];
  for (const row of rows) {
    counts[row.type] = row.count;
    if (row.mine) mine.push(row.type);
  }
  return { counts, mine };
}

/**
 * Adds (`active`) or removes one reaction by `userId` — always the session's
 * user, never a client-supplied id. Idempotent: the unique constraint absorbs
 * repeats, and removing a missing reaction is a no-op.
 */
export async function setReaction(
  slug: string,
  userId: string,
  type: ReactionType,
  active: boolean,
): Promise<"ok" | "not-found"> {
  const db = getDb();
  const [challenge] = await db
    .select({ id: challenges.id })
    .from(challenges)
    .where(eq(challenges.slug, slug))
    .limit(1);
  if (!challenge) return "not-found";

  if (active) {
    await db
      .insert(challengeReactions)
      .values({ challengeId: challenge.id, userId, type })
      .onConflictDoNothing({
        target: [challengeReactions.challengeId, challengeReactions.userId, challengeReactions.type],
      });
  } else {
    await db
      .delete(challengeReactions)
      .where(
        and(
          eq(challengeReactions.challengeId, challenge.id),
          eq(challengeReactions.userId, userId),
          eq(challengeReactions.type, type),
        ),
      );
  }
  return "ok";
}

/**
 * Reaction counts for every challenge a user created, keyed by challenge id
 * (server-side only), in one grouped query. Challenges with none are absent.
 */
export async function getReactionCountsForUserChallenges(
  userId: string,
): Promise<Map<string, ReactionCounts>> {
  const rows = await getDb()
    .select({ challengeId: challengeReactions.challengeId, ...reactionCountColumns })
    .from(challengeReactions)
    .innerJoin(challenges, eq(challenges.id, challengeReactions.challengeId))
    .where(eq(challenges.userId, userId))
    .groupBy(challengeReactions.challengeId);

  return new Map(
    rows.map(({ challengeId, fire, respect, skull }) => [challengeId, { fire, respect, skull }]),
  );
}
