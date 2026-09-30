import { index, pgEnum, pgTable, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { challenges } from "./challenges";
import { users } from "./users";

// A deliberately tiny, fixed set. Labels and emoji live in lib/reactions.ts.
export const reactionType = pgEnum("reaction_type", ["fire", "respect", "skull"]);

export const challengeReactions = pgTable(
  "challenge_reactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    challengeId: uuid("challenge_id")
      .notNull()
      .references(() => challenges.id, { onDelete: "cascade" }),
    // Deleting an account takes its reactions with it, like its challenges.
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: reactionType("type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // One reaction of each type per person per challenge. Leading with
    // challenge_id, it also serves every "counts for this challenge" lookup.
    unique("challenge_reactions_challenge_user_type_unique").on(
      table.challengeId,
      table.userId,
      table.type,
    ),
    // Covers the user_id foreign key (cascade on account deletion).
    index("challenge_reactions_user_id_idx").on(table.userId),
  ],
);

export type ReactionType = (typeof reactionType.enumValues)[number];
