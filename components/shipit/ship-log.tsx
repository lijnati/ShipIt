import type { ChallengeCardData } from "@/lib/challenge-card";
import { getChallengeState } from "@/lib/challenge-status";

const verbs = {
  ACTIVE: { mark: "…", text: "is racing to ship", color: "text-active" },
  SHIPPED: { mark: "✓", text: "shipped", color: "text-shipped" },
  FAILED: { mark: "✗", text: "failed to ship", color: "text-failed" },
} as const;

/**
 * Static strip of real recent activity. Decorative (the same challenges are
 * listed below), so hidden from assistive tech. Renders nothing when empty.
 */
export function ShipLog({ challenges, now }: { challenges: ChallengeCardData[]; now: number }) {
  if (challenges.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y-2 border-foreground bg-foreground py-3 font-mono text-sm whitespace-nowrap text-background"
    >
      <div className="flex w-max gap-8 px-4">
        {challenges.map((c) => {
          const verb = verbs[getChallengeState(c, now)];
          return (
            <span key={c.slug}>
              <span className={verb.color}>{verb.mark}</span> @{c.creator.username} {verb.text}{" "}
              <span className="opacity-70">{c.title.toLowerCase()}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
