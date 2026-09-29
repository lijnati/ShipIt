import Link from "next/link";
import { PackageCheck, Skull, Timer, type LucideIcon } from "lucide-react";
import { Avatar } from "@/components/shipit/avatar";
import { LocalDateTime } from "@/components/shipit/local-date-time";
import type { Challenge } from "@/db/schema";
import { cn } from "@/lib/utils";

export type ChallengeCardStatus = "ACTIVE" | "SHIPPED" | "FAILED";

/** Everything the card shows. Built from a DB row (toChallengeCard) or mock data. */
export type ChallengeCardData = {
  slug: string;
  title: string;
  /** ISO 8601 instant. */
  deadline: string;
  status: ChallengeCardStatus;
  creator: { username: string; avatarUrl: string | null };
  /**
   * Marketing mocks only: a pre-formatted delta ("2d 14h"). Real cards show the
   * deadline instead until live countdowns exist.
   */
  timeLabel?: string;
};

export function toChallengeCard(
  challenge: Pick<Challenge, "slug" | "title" | "deadline" | "status">,
  creator: { username: string; avatarUrl: string | null },
): ChallengeCardData {
  return {
    slug: challenge.slug,
    title: challenge.title,
    deadline: challenge.deadline.toISOString(),
    status: challenge.status === "shipped" ? "SHIPPED" : "ACTIVE",
    creator,
  };
}

const statusConfig: Record<
  ChallengeCardStatus,
  { label: string; icon: LucideIcon; color: string; prefix?: string; suffix?: string }
> = {
  ACTIVE: { label: "Active", icon: Timer, color: "bg-active", suffix: "remaining" },
  SHIPPED: { label: "Shipped", icon: PackageCheck, color: "bg-shipped", prefix: "shipped", suffix: "early" },
  FAILED: { label: "Failed to ship", icon: Skull, color: "bg-failed", prefix: "missed by" },
};

type ChallengeCardProps = {
  challenge: ChallengeCardData;
  featured?: boolean;
  /** Link the title to the public page. Off for marketing mocks. */
  linked?: boolean;
  className?: string;
};

export function ChallengeCard({
  challenge,
  featured = false,
  linked = true,
  className,
}: ChallengeCardProps) {
  const status = statusConfig[challenge.status];
  const StatusIcon = status.icon;
  const titleId = `challenge-${challenge.slug}-title`;
  const href = `/c/${challenge.slug}`;

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "relative flex flex-col border-2 border-foreground bg-card text-card-foreground",
        featured ? "shadow-brutal-lg" : "shadow-brutal",
        linked && "transition-transform focus-within:-translate-y-0.5 hover:-translate-y-0.5",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b-2 border-foreground px-4 py-2.5 font-mono text-xs">
        <span className="inline-flex shrink-0 items-center gap-2 bg-foreground px-2 py-1 font-bold tracking-wider text-background uppercase">
          <span aria-hidden="true" className={cn("size-2", status.color)} />
          {status.label}
        </span>
        <span className="truncate text-muted-foreground">/c/{challenge.slug}</span>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <p className="flex items-center gap-2 text-sm">
          <Avatar
            username={challenge.creator.username}
            avatarUrl={challenge.creator.avatarUrl}
          />
          <span className="font-mono font-bold">@{challenge.creator.username}</span>
          <span className="text-muted-foreground">promised to</span>
        </p>

        <h3
          id={titleId}
          className={cn(
            "font-heading leading-[1.1] font-extrabold tracking-tight text-balance break-words",
            featured ? "text-2xl sm:text-3xl" : "text-xl",
            challenge.status === "FAILED" &&
              "text-muted-foreground line-through decoration-failed decoration-4",
          )}
        >
          {linked ? (
            // Stretched link: the whole card is clickable, one tab stop.
            <Link href={href} className="outline-none after:absolute after:inset-0">
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
      </div>

      <footer
        className={cn(
          "flex items-center justify-between gap-3 border-t-2 border-foreground px-4 py-3 font-mono text-foreground",
          status.color,
        )}
      >
        {challenge.timeLabel ? (
          <p className="flex flex-wrap items-baseline gap-x-1.5">
            {status.prefix && <span className="text-sm">{status.prefix}</span>}
            <span
              className={cn(
                "font-bold tabular-nums",
                featured ? "text-3xl sm:text-4xl" : "text-2xl",
              )}
            >
              {challenge.timeLabel}
            </span>
            {status.suffix && <span className="text-sm">{status.suffix}</span>}
          </p>
        ) : (
          <p className="text-sm font-bold uppercase">
            {challenge.status === "SHIPPED" ? "Shipped" : "Clock is running"}
          </p>
        )}
        <StatusIcon aria-hidden="true" className={featured ? "size-7" : "size-6"} />
      </footer>
    </article>
  );
}
