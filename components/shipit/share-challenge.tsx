"use client";

import { useRef, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { ChallengeStatus } from "@/db/schema";
import { getChallengeState } from "@/lib/challenge-status";
import {
  getChallengeShareText,
  getXShareUrl,
  shareLabels,
  type SharePerspective,
} from "@/lib/share";
import { absoluteUrl, challengePath } from "@/lib/site";
import { useHydrated } from "@/lib/use-hydrated";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

type ShareChallengeProps = {
  slug: string;
  title: string;
  username: string;
  status: ChallengeStatus;
  /** ISO 8601 instant. */
  deadline: string;
  /** Server render time (ms), so the first client render matches the HTML. */
  serverNow: number;
  perspective: SharePerspective;
};

const nudges: Record<ReturnType<typeof getChallengeState>, string> = {
  ACTIVE: "Tell people. It's harder to quit when they're watching.",
  SHIPPED: "You shipped. Now make some noise.",
  FAILED: "Failure is part of the record. Own it.",
};

type CopyState = "idle" | "copied" | "failed";

/**
 * Share actions for a public challenge. Nothing is ever posted automatically —
 * every action is a click by the user.
 */
export function ShareChallenge(props: ShareChallengeProps) {
  const now = useNow(props.serverNow);
  const hydrated = useHydrated();
  const state = getChallengeState(props, now);
  const owner = props.perspective === "owner";

  const url = absoluteUrl(challengePath(props.slug));
  // Deadline in the viewer's timezone once hydrated; UTC for the server HTML.
  const text = getChallengeShareText(
    { title: props.title, deadline: props.deadline, username: props.username },
    state,
    props.perspective,
    hydrated ? undefined : "UTC",
  );
  const label = shareLabels[props.perspective][state];

  const [copy, setCopy] = useState<CopyState>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const fallbackInput = useRef<HTMLInputElement>(null);

  async function copyLink() {
    clearTimeout(resetTimer.current);
    try {
      await navigator.clipboard.writeText(url);
      setCopy("copied");
      resetTimer.current = setTimeout(() => setCopy("idle"), 2500);
    } catch {
      // No clipboard access: show the link, selected, for manual copying.
      setCopy("failed");
      requestAnimationFrame(() => fallbackInput.current?.select());
    }
  }

  const canNativeShare = hydrated && typeof navigator.share === "function";
  async function nativeShare() {
    try {
      await navigator.share({ title: props.title, text, url });
    } catch (error) {
      // User closing the share sheet isn't an error.
      if (!(error instanceof DOMException && error.name === "AbortError")) await copyLink();
    }
  }

  return (
    <section
      aria-label="Share this challenge"
      className={cn(
        "mt-8 flex flex-col gap-4",
        owner && "border-2 border-foreground bg-card p-5 shadow-brutal sm:p-6",
      )}
    >
      {owner && <p className="font-heading text-xl font-extrabold tracking-tight">{nudges[state]}</p>}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <a
          href={getXShareUrl(text, url)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: owner ? "brand" : "paper", size: owner ? "xl" : "lg" }),
            "w-full sm:w-auto",
          )}
        >
          {label} on X
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <Button
          type="button"
          variant="paper"
          size={owner ? "xl" : "lg"}
          onClick={copyLink}
          className="w-full sm:w-auto"
        >
          {copy === "copied" ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}
          {copy === "copied" ? "Copied" : "Copy link"}
        </Button>
        {canNativeShare && (
          <Button
            type="button"
            variant="paper"
            size={owner ? "xl" : "lg"}
            onClick={nativeShare}
            className="w-full sm:w-auto"
          >
            <Share2 aria-hidden="true" />
            More…
          </Button>
        )}
      </div>

      <p role="status" className={cn("font-mono text-sm font-bold", copy === "idle" && "sr-only")}>
        {copy === "copied" && "Link copied. Go post it."}
        {copy === "failed" && "Couldn't copy automatically — here's the link:"}
      </p>
      {copy === "failed" && (
        <input
          ref={fallbackInput}
          readOnly
          value={url}
          aria-label="Challenge link"
          onFocus={(e) => e.currentTarget.select()}
          className="w-full border-2 border-foreground bg-background px-3 py-2 font-mono text-sm"
        />
      )}
    </section>
  );
}
