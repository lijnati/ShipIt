import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ChallengeCard } from "@/components/shipit/challenge-card";
import { buttonVariants } from "@/components/ui/button";
import type { ChallengeCardData } from "@/lib/challenge-card";
import { routes } from "@/lib/site";

const legend = [
  { label: "Active", className: "bg-active" },
  { label: "Shipped", className: "bg-shipped" },
  { label: "Failed", className: "bg-failed" },
] as const;

type RecentChallengesProps = {
  challenges: ChallengeCardData[];
  /** Server render time (ms), for the cards' live countdowns. */
  serverNow: number;
};

/** Real, newest public promises. Never filled with fake data. */
export function RecentChallenges({ challenges, serverNow }: RecentChallengesProps) {
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
              {challenges.length > 0
                ? "The newest public promises. Some kept, some very much not."
                : "Nobody's on the clock yet."}
            </p>
          </div>
          {challenges.length > 0 && (
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
          )}
        </div>

        {challenges.length > 0 ? (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {challenges.map((challenge) => (
              <li key={challenge.slug} className="flex">
                <ChallengeCard challenge={challenge} serverNow={serverNow} className="w-full" />
              </li>
            ))}
          </ul>
        ) : (
          <div className="border-2 border-dashed border-foreground bg-background px-6 py-12 text-center">
            <p className="font-heading text-3xl font-black tracking-tight">
              Zero public promises so far.
            </p>
            <p className="mt-2 text-lg text-muted-foreground">
              Somebody has to go first. It might as well be you.
            </p>
            <Link
              href={routes.newChallenge}
              className={`${buttonVariants({ variant: "brand", size: "xl" })} mt-8`}
            >
              Be the first
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
