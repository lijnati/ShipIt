"use client";

import { useOptimistic, useState, useTransition } from "react";
import Link from "next/link";
import { reactToChallenge } from "@/app/c/[slug]/actions";
import { reactions, type ReactionCounts, type ReactionType } from "@/lib/reactions";
import { cn } from "@/lib/utils";

type ReactionBarProps = {
  slug: string;
  counts: ReactionCounts;
  /** Types the viewer has already reacted with. */
  mine: ReactionType[];
  /** Signed-out visitors see counts; clicking sends them to sign in and back. */
  signInHref: string | null;
};

type Summary = { counts: ReactionCounts; mine: ReactionType[] };

function applyReaction(state: Summary, change: { type: ReactionType; active: boolean }): Summary {
  const has = state.mine.includes(change.type);
  if (has === change.active) return state;
  return {
    counts: {
      ...state.counts,
      [change.type]: Math.max(0, state.counts[change.type] + (change.active ? 1 : -1)),
    },
    mine: change.active
      ? [...state.mine, change.type]
      : state.mine.filter((type) => type !== change.type),
  };
}

const buttonClass =
  "inline-flex items-center gap-2 border-2 border-foreground px-3 py-2 font-mono text-sm font-bold shadow-brutal transition-transform outline-none focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px active:shadow-none motion-reduce:transition-none";

/**
 * Three fixed reactions. Counts update instantly (useOptimistic) and settle
 * to the server's numbers when the action's refresh arrives; on failure the
 * optimistic change simply falls away.
 */
export function ReactionBar({ slug, counts, mine, signInHref }: ReactionBarProps) {
  const [optimistic, setOptimistic] = useOptimistic({ counts, mine }, applyReaction);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(type: ReactionType) {
    const active = !optimistic.mine.includes(type);
    setError(null);
    startTransition(async () => {
      setOptimistic({ type, active });
      try {
        const result = await reactToChallenge(slug, type, active);
        if (!result.ok) setError(result.error);
      } catch {
        setError("Couldn't save that reaction. Try again.");
      }
    });
  }

  return (
    <section aria-labelledby="reactions-title" className="mt-10">
      <h2 id="reactions-title" className="font-mono text-xs font-bold tracking-wide uppercase">
        React to this promise
      </h2>
      <ul className="mt-3 flex flex-wrap gap-3">
        {reactions.map((reaction) => {
          const count = optimistic.counts[reaction.type];
          const pressed = optimistic.mine.includes(reaction.type);
          const content = (
            <>
              <span aria-hidden="true" className="text-lg leading-none">
                {reaction.emoji}
              </span>
              <span>{reaction.label}</span>
              <span className="tabular-nums">{count}</span>
            </>
          );
          return (
            <li key={reaction.type}>
              {signInHref ? (
                <Link
                  href={signInHref}
                  aria-label={`Sign in to react with ${reaction.label} (${count})`}
                  className={cn(buttonClass, "bg-card")}
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  aria-pressed={pressed}
                  aria-label={`React with ${reaction.label} (${count})`}
                  onClick={() => toggle(reaction.type)}
                  className={cn(buttonClass, pressed ? "bg-brand" : "bg-card hover:bg-secondary")}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {signInHref && (
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          <Link href={signInHref} className="underline underline-offset-4">
            Sign in
          </Link>{" "}
          to react.
        </p>
      )}
      <p role="status" className={cn("mt-3 font-mono text-sm font-bold text-destructive", !error && "sr-only")}>
        {error}
      </p>
    </section>
  );
}
