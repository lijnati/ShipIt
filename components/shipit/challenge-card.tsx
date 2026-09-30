"use client";

import Link from "next/link";
import { PackageCheck, Skull, Timer, type LucideIcon } from "lucide-react";
import { Avatar } from "@/components/shipit/avatar";
import { LocalDateTime } from "@/components/shipit/local-date-time";
import type { ChallengeCardData } from "@/lib/challenge-card";
import {
  formatCountdownShort,
  getChallengeState,
  stateStyles,
  type ChallengeState,
} from "@/lib/challenge-status";
import { reactions, totalReactions, type ReactionCounts } from "@/lib/reactions";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

const icons: Record<ChallengeState, LucideIcon> = {
  ACTIVE: Timer,
  SHIPPED: PackageCheck,
  FAILED: Skull,
};

// Wording for the fixed marketing examples on the landing page.
const mockWording: Record<ChallengeState, { prefix?: string; suffix?: string }> = {
  ACTIVE: { suffix: "remaining" },
  SHIPPED: { prefix: "shipped", suffix: "early" },
  FAILED: { prefix: "missed by" },
};

type ChallengeCardProps = {
  challenge: ChallengeCardData;
  /** Server render time (ms), so the first client render matches the HTML. */
  serverNow?: number;
  featured?: boolean;
  /** Link the title to the public page. Off for marketing mocks. */
  linked?: boolean;
  className?: string;
};

export function ChallengeCard({
  challenge,
  serverNow = 0,
  featured = false,
  linked = true,
  className,
}: ChallengeCardProps) {
  const now = useNow(serverNow);
  const state = challenge.mock?.state ?? getChallengeState(challenge, now);
  const style = stateStyles[state];
  const StatusIcon = icons[state];
  const titleId = `challenge-${challenge.slug}-title`;

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "relative flex min-w-0 flex-col border-2 border-foreground bg-card text-card-foreground transition-colors",
        featured ? "shadow-brutal-lg" : "shadow-brutal",
        linked && "transition-transform focus-within:-translate-y-0.5 hover:-translate-y-0.5",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b-2 border-foreground px-4 py-2.5 font-mono text-xs">
        <span className="inline-flex shrink-0 items-center gap-2 bg-foreground px-2 py-1 font-bold tracking-wider text-background uppercase">
          <span aria-hidden="true" className={cn("size-2", style.color)} />
          {style.label}
        </span>
        <span className="min-w-0 truncate text-muted-foreground">/c/{challenge.slug}</span>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
          <Avatar username={challenge.creator.username} avatarUrl={challenge.creator.avatarUrl} />
          <span className="min-w-0 font-mono font-bold break-all">@{challenge.creator.username}</span>
          <span className="text-muted-foreground">promised to</span>
        </p>

        <h3
          id={titleId}
          className={cn(
            "font-heading leading-[1.1] font-extrabold tracking-tight text-balance break-words",
            featured ? "text-2xl sm:text-3xl" : "text-xl",
            state === "FAILED" && "text-muted-foreground line-through decoration-failed decoration-4",
          )}
        >
          {linked ? (
            // Stretched link: the whole card is clickable, one tab stop.
            <Link href={`/c/${challenge.slug}`} className="outline-none after:absolute after:inset-0">
              &ldquo;{challenge.title}&rdquo;
            </Link>
          ) : (
            <>&ldquo;{challenge.title}&rdquo;</>
          )}
        </h3>

        <dl className="mt-auto grid grid-cols-2 border-2 border-foreground font-mono text-xs">
          <div className="border-r-2 border-foreground px-3 py-2">
            <dt className="text-muted-foreground uppercase">Deadline</dt>
            <dd className="mt-0.5 font-bold">
              <LocalDateTime value={challenge.deadline} format="date" />
            </dd>
          </div>
          <div className="px-3 py-2">
            <dt className="text-muted-foreground uppercase">Time</dt>
            <dd className="mt-0.5 font-bold">
              <LocalDateTime value={challenge.deadline} format="time" />
            </dd>
          </div>
        </dl>

        {challenge.reactions && <ReactionTally counts={challenge.reactions} />}
      </div>

      <footer
        className={cn(
          "flex items-center justify-between gap-3 border-t-2 border-foreground px-4 py-3 font-mono text-foreground transition-colors",
          style.color,
        )}
      >
        <p className="flex flex-wrap items-baseline gap-x-1.5">
          <CardFooterText challenge={challenge} state={state} now={now} featured={featured} />
        </p>
        <StatusIcon aria-hidden="true" className={featured ? "size-7" : "size-6"} />
      </footer>
    </article>
  );
}

function CardFooterText({
  challenge,
  state,
  now,
  featured,
}: {
  challenge: ChallengeCardData;
  state: ChallengeState;
  now: number;
  featured: boolean;
}) {
  const big = cn("font-bold tabular-nums", featured ? "text-3xl sm:text-4xl" : "text-2xl");

  if (challenge.mock) {
    const { prefix, suffix } = mockWording[state];
    return (
      <>
        {prefix && <span className="text-sm">{prefix}</span>}
        <span className={big}>{challenge.mock.timeLabel}</span>
        {suffix && <span className="text-sm">{suffix}</span>}
      </>
    );
  }

  if (state === "ACTIVE") {
    const remaining = new Date(challenge.deadline).getTime() - now;
    return (
      <>
        <span className={big}>{formatCountdownShort(remaining)}</span>
        <span className="text-sm">left</span>
      </>
    );
  }

  if (state === "SHIPPED") {
    return challenge.shippedAt ? (
      <>
        <span className="text-sm">shipped</span>
        <LocalDateTime value={challenge.shippedAt} format="date" className="text-lg font-bold" />
      </>
    ) : (
      <span className="text-lg font-bold">Shipped</span>
    );
  }

  return (
    <>
      <span className="text-sm">missed</span>
      <LocalDateTime value={challenge.deadline} format="date" className="text-lg font-bold" />
    </>
  );
}

/** Compact read-only reaction totals. Hidden when there are none. */
function ReactionTally({ counts }: { counts: ReactionCounts }) {
  if (totalReactions(counts) === 0) return null;
  const shown = reactions.filter((r) => counts[r.type] > 0);
  return (
    <p className="-mt-1 flex flex-wrap gap-x-3 font-mono text-xs">
      <span className="sr-only">
        Reactions: {shown.map((r) => `${counts[r.type]} ${r.label}`).join(", ")}
      </span>
      {shown.map((r) => (
        <span key={r.type} aria-hidden="true" className="tabular-nums">
          {r.emoji} {counts[r.type]}
        </span>
      ))}
    </p>
  );
}
