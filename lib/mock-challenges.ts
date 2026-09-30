import type { ChallengeCardData } from "@/lib/challenge-card";

// The illustrative example card in the landing hero. Not a real challenge;
// rendered unlinked and labeled as an example.

const creator = (username: string) => ({ username, avatarUrl: null });

export const featuredChallenge: ChallengeCardData = {
  slug: "ship-my-contract-reminder-mvp",
  creator: creator("nahtty"),
  title: "Ship my contract reminder MVP",
  deadline: "2026-10-03T23:59:00Z",
  status: "active",
  shippedAt: null,
  mock: { state: "ACTIVE", timeLabel: "2d 14h" },
};
