import { recentChallenges } from "@/lib/mock-challenges";

const verbs = {
  ACTIVE: { mark: "…", text: "is racing to" },
  SHIPPED: { mark: "✓", text: "shipped" },
  FAILED: { mark: "✗", text: "failed to" },
} as const;

/** Static ticker strip of recent activity. Decorative — the same data is listed below. */
export function ShipLog() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y-2 border-foreground bg-foreground py-3 font-mono text-sm whitespace-nowrap text-background"
    >
      <div className="flex w-max gap-8 px-4">
        {recentChallenges.map((c) => (
          <span key={c.slug}>
            <span
              className={
                c.status === "SHIPPED"
                  ? "text-shipped"
                  : c.status === "FAILED"
                    ? "text-failed"
                    : "text-active"
              }
            >
              {verbs[c.status].mark}
            </span>{" "}
            @{c.creator.username} {verbs[c.status].text}{" "}
            <span className="opacity-70">{c.title.toLowerCase()}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
