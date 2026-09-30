import type { ReactionType } from "@/db/schema";

export type { ReactionType };

/** The only reactions ShipIt supports, in display order. */
export const reactions = [
  { type: "fire", emoji: "🔥", label: "ship it" },
  { type: "respect", emoji: "🫡", label: "respect" },
  { type: "skull", emoji: "💀", label: "good luck" },
] as const satisfies readonly { type: ReactionType; emoji: string; label: string }[];

/** Per-type totals for one challenge, e.g. { fire: 12, respect: 4, skull: 7 }. */
export type ReactionCounts = Record<ReactionType, number>;

export const emptyReactionCounts = (): ReactionCounts => ({ fire: 0, respect: 0, skull: 0 });

export const totalReactions = (counts: ReactionCounts): number =>
  counts.fire + counts.respect + counts.skull;

export function isReactionType(value: unknown): value is ReactionType {
  return reactions.some((reaction) => reaction.type === value);
}
