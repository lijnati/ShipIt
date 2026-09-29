"use client";

import Link from "next/link";
import { LocalDateTime } from "@/components/shipit/local-date-time";
import type { ChallengeCardData } from "@/lib/challenge-card";
import { formatCountdownShort, getChallengeState, stateStyles } from "@/lib/challenge-status";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

/** One dashboard line. State is derived live, same as cards and the challenge page. */
export function ChallengeRow({
  challenge,
  serverNow,
}: {
  challenge: ChallengeCardData;
  serverNow: number;
}) {
  const now = useNow(serverNow);
  const state = getChallengeState(challenge, now);
  const style = stateStyles[state];

  return (
    <Link
      href={`/c/${challenge.slug}`}
      className="flex flex-col gap-2 px-4 py-4 hover:bg-secondary focus-visible:bg-secondary sm:flex-row sm:items-center sm:gap-4 sm:px-5"
    >
      <span
        className={cn(
          "w-fit shrink-0 border-2 border-foreground px-2 py-0.5 font-mono text-xs font-bold tracking-wider uppercase transition-colors",
          style.color,
        )}
      >
        {style.label}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 font-heading text-lg font-extrabold tracking-tight break-words",
          state === "FAILED" && "text-muted-foreground line-through decoration-failed decoration-2",
        )}
      >
        {challenge.title}
      </span>
      <span className="shrink-0 font-mono text-sm text-muted-foreground tabular-nums">
        {state === "ACTIVE" && (
          <>{formatCountdownShort(new Date(challenge.deadline).getTime() - now)} left</>
        )}
        {state === "SHIPPED" && challenge.shippedAt && (
          <>
            shipped <LocalDateTime value={challenge.shippedAt} format="date" />
          </>
        )}
        {state === "FAILED" && (
          <>
            missed <LocalDateTime value={challenge.deadline} format="date" />
          </>
        )}
      </span>
    </Link>
  );
}
