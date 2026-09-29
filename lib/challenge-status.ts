import type { ChallengeStatus } from "@/db/schema";

/** What a challenge *is* right now. Only "active"/"shipped" are ever stored. */
export type ChallengeState = "ACTIVE" | "SHIPPED" | "FAILED";

/**
 * The single source of truth for a challenge's visible state. FAILED is
 * derived from the deadline — it is never written to the database.
 */
export function getChallengeState(
  challenge: { status: ChallengeStatus; deadline: Date | string },
  now: Date | number,
): ChallengeState {
  if (challenge.status === "shipped") return "SHIPPED";
  const deadline = new Date(challenge.deadline).getTime();
  const current = typeof now === "number" ? now : now.getTime();
  return deadline <= current ? "FAILED" : "ACTIVE";
}

/** Shared labels and colors so every surface looks the same for a state. */
export const stateStyles: Record<ChallengeState, { label: string; color: string }> = {
  ACTIVE: { label: "Active", color: "bg-active" },
  SHIPPED: { label: "Shipped", color: "bg-shipped" },
  FAILED: { label: "Failed to ship", color: "bg-failed" },
};

const pad = (n: number) => String(n).padStart(2, "0");

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3_600),
    minutes: Math.floor((total % 3_600) / 60),
    seconds: total % 60,
  };
}

/** "2d 14h 32m 08s", or "04h 12m 32s" under a day. */
export function formatCountdown(ms: number): string {
  const { days, hours, minutes, seconds } = parts(ms);
  const clock = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  return days > 0 ? `${days}d ${clock}` : clock;
}

/** Two most significant units, for cards: "2d 14h", "4h 12m", "12m 08s". */
export function formatCountdownShort(ms: number): string {
  const { days, hours, minutes, seconds } = parts(ms);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${pad(minutes)}m`;
  return `${minutes}m ${pad(seconds)}s`;
}
