import { ChallengeCard } from "@/components/shipit/challenge-card";
import { recentChallenges } from "@/lib/mock-challenges";

const legend = [
  { label: "Active", className: "bg-active" },
  { label: "Shipped", className: "bg-shipped" },
  { label: "Failed", className: "bg-failed" },
] as const;

export function RecentChallenges() {
  return (
    <section
      id="shipping"
      aria-labelledby="shipping-title"
      className="scroll-mt-16 border-y-2 border-foreground bg-secondary"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="shipping-title"
              className="font-heading text-4xl font-black tracking-tighter sm:text-5xl"
            >
              Who&apos;s shipping
            </h2>
            <p className="mt-2 text-muted-foreground">
              Recent promises. Some kept, some very much not.
            </p>
          </div>
          <ul className="flex gap-4 font-mono text-xs uppercase">
            {legend.map((item) => (
              <li key={item.label} className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={`size-3 border-2 border-foreground ${item.className}`}
                />
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recentChallenges.map((challenge) => (
            <li key={challenge.id} className="flex">
              <ChallengeCard challenge={challenge} className="w-full" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
