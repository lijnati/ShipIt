import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

// "failed" is deliberately absent: it's derived from the deadline, never stored.
export const challengeStatus = pgEnum("challenge_status", ["active", "shipped"]);

export const challenges = pgTable(
  "challenges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Deleting a user removes their promises: a public promise with no one
    // behind it has no meaning, and account deletion should take their data.
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique("challenges_slug_unique"),
    description: text("description"),
    deadline: timestamp("deadline", { withTimezone: true }).notNull(),
    projectUrl: text("project_url"),
    status: challengeStatus("status").notNull().default("active"),
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Dashboard and profile lists: one user's challenges, newest first.
    // Also covers the user_id foreign key.
    index("challenges_user_id_created_at_idx").on(table.userId, table.createdAt.desc()),
    // Next phase: find active challenges whose deadline has passed.
    index("challenges_status_deadline_idx").on(table.status, table.deadline),
    // Mirrors lib/challenge.ts so bad data can't get in around the app.
    check("challenges_title_length", sql`char_length(${table.title}) between 5 and 120`),
    check(
      "challenges_description_length",
      sql`${table.description} is null or char_length(${table.description}) between 1 and 500`,
    ),
    check(
      "challenges_slug_format",
      sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(${table.slug}) <= 80`,
    ),
    check(
      "challenges_project_url_scheme",
      sql`${table.projectUrl} is null or ${table.projectUrl} ~ '^https?://'`,
    ),
    check(
      "challenges_shipped_at_matches_status",
      sql`(${table.status} = 'shipped') = (${table.shippedAt} is not null)`,
    ),
  ],
);

export type Challenge = typeof challenges.$inferSelect;
export type ChallengeStatus = (typeof challengeStatus.enumValues)[number];
