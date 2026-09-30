import type { Challenge, ChallengeStatus } from "@/db/schema";
import type { ChallengeState } from "@/lib/challenge-status";
import type { ReactionCounts } from "@/lib/reactions";

/** Everything ChallengeCard shows. Plain, serializable data (it's a client component). */
export type ChallengeCardData = {
  slug: string;
  title: string;
  /** ISO 8601 instant. */
  deadline: string;
  status: ChallengeStatus;
  /** ISO 8601 instant, when shipped. */
  shippedAt: string | null;
  creator: { username: string; avatarUrl: string | null };
  /** Reaction totals, when the list query aggregated them. */
  reactions?: ReactionCounts;
  /** Landing-page marketing examples only: a fixed state and delta, never derived. */
  mock?: { state: ChallengeState; timeLabel: string };
};

export function toChallengeCard(
  challenge: Pick<Challenge, "slug" | "title" | "deadline" | "status" | "shippedAt">,
  creator: { username: string; avatarUrl: string | null },
): ChallengeCardData {
  return {
    slug: challenge.slug,
    title: challenge.title,
    deadline: challenge.deadline.toISOString(),
    status: challenge.status,
    shippedAt: challenge.shippedAt?.toISOString() ?? null,
    creator,
  };
}
