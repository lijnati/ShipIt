import { relations } from "drizzle-orm";
import { challenges } from "./challenges";
import { challengeReactions } from "./reactions";
import { users } from "./users";

export const usersRelations = relations(users, ({ many }) => ({
  challenges: many(challenges),
  reactions: many(challengeReactions),
}));

export const challengesRelations = relations(challenges, ({ one, many }) => ({
  user: one(users, { fields: [challenges.userId], references: [users.id] }),
  reactions: many(challengeReactions),
}));

export const challengeReactionsRelations = relations(challengeReactions, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeReactions.challengeId],
    references: [challenges.id],
  }),
  user: one(users, { fields: [challengeReactions.userId], references: [users.id] }),
}));
