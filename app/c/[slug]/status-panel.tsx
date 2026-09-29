"use client";

import { ArrowUpRight } from "lucide-react";
import { ShipDialog } from "@/app/c/[slug]/ship-dialog";
import { LocalDateTime } from "@/components/shipit/local-date-time";
import { buttonVariants } from "@/components/ui/button";
import type { ChallengeStatus } from "@/db/schema";
import { formatCountdown, getChallengeState, stateStyles } from "@/lib/challenge-status";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

type StatusPanelProps = {
  slug: string;
  status: ChallengeStatus;
  /** ISO 8601 instants. */
  deadline: string;
  shippedAt: string | null;
  proofUrl: string | null;
  creatorName: string;
  /** Server render time (ms), so the first client render matches the HTML. */
  serverNow: number;
  /** The viewer owns this challenge. The server re-checks on submit. */
  canShip: boolean;
};

const headings = {
  ACTIVE: "Active",
  SHIPPED: "Shipped 🚀",
  FAILED: "Failed to ship 💀",
} as const;

/**
 * The live centerpiece of a challenge page. Flips ACTIVE → FAILED in the
 * browser when the countdown hits zero; nothing is written for that.
 */
export function ChallengeStatusPanel(props: StatusPanelProps) {
  const now = useNow(props.serverNow);
  const state = getChallengeState(props, now);
  const remaining = new Date(props.deadline).getTime() - now;

  return (
    <section
      aria-labelledby="challenge-status"
      className="mt-10 border-2 border-foreground bg-card shadow-brutal-lg"
    >
      <div
        className={cn(
          "border-b-2 border-foreground px-5 py-3 transition-colors duration-500 sm:px-6",
          stateStyles[state].color,
        )}
      >
        <h2 id="challenge-status" className="font-mono text-xl font-black tracking-widest uppercase sm:text-2xl">
          {headings[state]}
        </h2>
      </div>

      <div className="flex flex-col gap-6 p-5 sm:p-6">
        {state === "ACTIVE" && (
          <div>
            {/* role=timer is aria-live="off": readable on demand, never announced every second. */}
            <p role="timer" aria-atomic="true" className="font-mono text-4xl font-black tracking-tight tabular-nums sm:text-6xl">
              {formatCountdown(remaining)}
            </p>
            <p className="mt-1 font-mono text-sm font-bold uppercase">remaining</p>
          </div>
        )}

        {state === "SHIPPED" && (
          <div>
            <p className="font-heading text-3xl font-black tracking-tight sm:text-4xl">
              {props.creatorName} actually shipped it.
            </p>
            {props.shippedAt && (
              <p className="mt-2 font-mono text-sm">
                Shipped <LocalDateTime value={props.shippedAt} format="date" className="font-bold" />
              </p>
            )}
          </div>
        )}

        {state === "FAILED" && (
          <p className="font-heading text-3xl font-black tracking-tight sm:text-4xl">Deadline missed.</p>
        )}

        <div className="border-t-2 border-dashed border-foreground/40 pt-4">
          <p className="font-mono text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Deadline
          </p>
          <p className={cn("mt-1 font-mono text-lg font-bold", state === "FAILED" && "line-through decoration-failed decoration-2")}>
            <LocalDateTime value={props.deadline} format="date" /> ·{" "}
            <LocalDateTime value={props.deadline} format="time" showZone />
          </p>
        </div>

        {state === "ACTIVE" && props.canShip && <ShipDialog slug={props.slug} />}

        {state === "SHIPPED" && props.proofUrl && (
          <a
            href={props.proofUrl}
            target="_blank"
            rel="noopener noreferrer nofollow ugc"
            className={cn(buttonVariants({ variant: "ink", size: "xl" }), "w-full sm:w-fit")}
          >
            View proof
            <ArrowUpRight aria-hidden="true" />
          </a>
        )}
      </div>
    </section>
  );
}
