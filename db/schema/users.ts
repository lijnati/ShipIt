import { sql } from "drizzle-orm";
import { check, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Stable external identity. The unique constraint doubles as the lookup index.
    clerkUserId: text("clerk_user_id").notNull().unique("users_clerk_user_id_unique"),
    // Null until onboarding. Postgres allows many NULLs under a unique constraint.
    username: text("username").unique("users_username_unique"),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Mirrors lib/username.ts so bad data can't get in even around the app.
    // Lowercase-only also makes the plain unique constraint case-insensitive.
    check("users_username_format", sql`${table.username} ~ '^[a-z0-9_]{3,24}$'`),
  ],
);

export type User = typeof users.$inferSelect;
