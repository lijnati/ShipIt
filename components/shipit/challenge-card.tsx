import { Eye, PackageCheck, Skull, Timer, type LucideIcon } from "lucide-react";
import type { Challenge, ChallengeStatus } from "@/lib/mock-challenges";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  ChallengeStatus,
  {
    label: string;
    icon: LucideIcon;
    dot: string;
    footer: string;
    prefix?: string;
    suffix: string;
  }
> = {
  ACTIVE: {
    label: "Active",
    icon: Timer,
    dot: "bg-active",
    footer: "bg-active",
    suffix: "remaining",
  },
  SHIPPED: {
    label: "Shipped",
    icon: PackageCheck,
    dot: "bg-shipped",
    footer: "bg-shipped",
    prefix: "shipped",
    suffix: "early",
  },
  FAILED: {
    label: "Failed to ship",
    icon: Skull,
    dot: "bg-failed",
    footer: "bg-failed",
    prefix: "missed by",
    suffix: "",
  },
};

const deadlineFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

type ChallengeCardProps = {
  challenge: Challenge;
  featured?: boolean;
  className?: string;
};

export function ChallengeCard({
  challenge,
  featured = false,
  className,
}: ChallengeCardProps) {
  const status = statusConfig[challenge.status];
  const StatusIcon = status.icon;
  const titleId = `challenge-${challenge.id}-title`;

  return (
    <article
      aria-labelledby={titleId}
      className={cn(
        "flex flex-col border-2 border-foreground bg-card text-card-foreground",
        featured ? "shadow-brutal-lg" : "shadow-brutal",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b-2 border-foreground px-4 py-2.5 font-mono text-xs">
        <span className="inline-flex items-center gap-2 bg-foreground px-2 py-1 font-bold tracking-wider text-background uppercase">
          <span aria-hidden="true" className={cn("size-2", status.dot)} />
          {status.label}
        </span>
        <span className="text-muted-foreground">#{challenge.id}</span>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <p className="flex items-center gap-2 text-sm">
          <span
            aria-hidden="true"
            className="grid size-7 place-items-center border-2 border-foreground bg-secondary font-mono text-xs font-bold uppercase"
          >
            {challenge.creator.charAt(0)}
          </span>
          <span className="font-mono font-bold">@{challenge.creator}</span>
          <span className="text-muted-foreground">promised to</span>
        </p>

        <h3
          id={titleId}
          className={cn(
            "font-heading leading-[1.1] font-extrabold tracking-tight text-balance",
            featured ? "text-2xl sm:text-3xl" : "text-xl",
            challenge.status === "FAILED" &&
              "text-muted-foreground line-through decoration-failed decoration-4",
          )}
        >
          &ldquo;{challenge.title}&rdquo;
        </h3>

        <dl className="mt-auto grid grid-cols-2 border-2 border-foreground font-mono text-xs">
          <div className="border-r-2 border-foreground px-3 py-2">
            <dt className="text-muted-foreground uppercase">Deadline</dt>
            <dd className="mt-0.5 font-bold">
              <time dateTime={challenge.deadline}>
                {deadlineFormatter.format(new Date(challenge.deadline))}
              </time>
            </dd>
          </div>
          <div className="px-3 py-2">
            <dt className="text-muted-foreground uppercase">Watching</dt>
            <dd className="mt-0.5 inline-flex items-center gap-1 font-bold">
              <Eye aria-hidden="true" className="size-3.5" />
              {challenge.watchers.toLocaleString("en-US")}
            </dd>
          </div>
        </dl>
      </div>

      <footer
        className={cn(
          "flex items-center justify-between gap-3 border-t-2 border-foreground px-4 py-3 font-mono text-foreground",
          status.footer,
        )}
      >
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
        <StatusIcon
          aria-hidden="true"
          className={featured ? "size-7" : "size-6"}
        />
      </footer>
    </article>
  );
}
