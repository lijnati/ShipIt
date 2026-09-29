import type { ChallengeState } from "@/lib/challenge-status";

// All public-facing copy about a challenge — page metadata, OG image labels,
// share text — lives here so every surface says the same thing.

type ShareableChallenge = {
  title: string;
  /** Date or ISO 8601 instant. */
  deadline: Date | string;
  username: string;
};

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;

/** Coarse snapshot for static surfaces (no seconds): "3 days", "8 hours", "42 minutes". */
export function formatTimeLeft(ms: number): string {
  if (ms >= DAY) return plural(Math.floor(ms / DAY), "day");
  if (ms >= HOUR) return plural(Math.floor(ms / HOUR), "hour");
  if (ms >= MINUTE) return plural(Math.floor(ms / MINUTE), "minute");
  return "< 1 minute";
}

const msLeft = (c: ShareableChallenge, now: number) => new Date(c.deadline).getTime() - now;

/** <title>, og:title and description for a challenge page. */
export function getChallengeMeta(c: ShareableChallenge, state: ChallengeState, now: number) {
  const who = `@${c.username}`;
  switch (state) {
    case "SHIPPED":
      return { title: `${who} shipped ${c.title} 🚀`, description: "Promise kept on ShipIt." };
    case "FAILED":
      return { title: `${who} failed to ship ${c.title} 💀`, description: "Deadline missed on ShipIt." };
    case "ACTIVE": {
      const left = formatTimeLeft(msLeft(c, now));
      return {
        title: `${who} promised to ship ${c.title}`,
        description: `${left.charAt(0).toUpperCase()}${left.slice(1)} left. Public deadline on ShipIt.`,
      };
    }
  }
}

/** Big labels on the OG card. */
export function getOgLabels(c: ShareableChallenge, state: ChallengeState, now: number) {
  switch (state) {
    case "SHIPPED":
      return { kicker: "Actually shipped", status: "Shipped" };
    case "FAILED":
      return { kicker: "Failed to ship", status: "Deadline missed" };
    case "ACTIVE":
      return { kicker: "Promised to ship", status: `${formatTimeLeft(msLeft(c, now))} left` };
  }
}

export type SharePerspective = "owner" | "visitor";

export const shareLabels: Record<SharePerspective, Record<ChallengeState, string>> = {
  owner: { ACTIVE: "Share the promise", SHIPPED: "Brag about shipping", FAILED: "Own the failure" },
  visitor: { ACTIVE: "Share this promise", SHIPPED: "Share the win", FAILED: "Share the receipt" },
};

/**
 * Post text for sharing a challenge. Owners speak in first person; visitors
 * talk about the creator. The deadline is formatted in `timeZone` (default:
 * the runtime's — the viewer's browser when called client-side).
 */
export function getChallengeShareText(
  c: ShareableChallenge,
  state: ChallengeState,
  perspective: SharePerspective,
  timeZone?: string,
): string {
  const by = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone }).format(
    new Date(c.deadline),
  );
  const who = `@${c.username}`;

  if (perspective === "owner") {
    switch (state) {
      case "ACTIVE":
        return `I just put my reputation on the line.\n\nI'm shipping ${c.title} before ${by}.\n\nNo moving the deadline 👀`;
      case "SHIPPED":
        return `I said I'd ship it.\n\nAnd I actually did 🚀\n\n${c.title}`;
      case "FAILED":
        return `I publicly said I'd ship ${c.title}.\n\nI did not 💀\n\nAt least ShipIt kept the receipt.`;
    }
  }

  switch (state) {
    case "ACTIVE":
      return `${who} publicly promised to ship ${c.title} by ${by}.\n\nThe clock is running 👀`;
    case "SHIPPED":
      return `${who} said they'd ship ${c.title}.\n\nAnd they actually did 🚀`;
    case "FAILED":
      return `${who} promised to ship ${c.title}.\n\nThey did not 💀 ShipIt kept the receipt.`;
  }
}

/** X (Twitter) web intent. Text and URL are passed separately so X builds the card. */
export function getXShareUrl(text: string, url: string): string {
  return `https://x.com/intent/post?${new URLSearchParams({ text, url })}`;
}
