import { relations } from "drizzle-orm";
import { challenges } from "./challenges";
import { users } from "./users";

export const usersRelations = relations(users, ({ many }) => ({
  challenges: many(challenges),
}));

export const challengesRelations = relations(challenges, ({ one }) => ({
  user: one(users, { fields: [challenges.userId], references: [users.id] }),
}));
