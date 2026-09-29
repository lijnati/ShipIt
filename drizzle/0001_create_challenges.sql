CREATE TYPE "public"."challenge_status" AS ENUM('active', 'shipped');--> statement-breakpoint
CREATE TABLE "challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"deadline" timestamp with time zone NOT NULL,
	"project_url" text,
	"status" "challenge_status" DEFAULT 'active' NOT NULL,
	"shipped_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "challenges_slug_unique" UNIQUE("slug"),
	CONSTRAINT "challenges_title_length" CHECK (char_length("challenges"."title") between 5 and 120),
	CONSTRAINT "challenges_description_length" CHECK ("challenges"."description" is null or char_length("challenges"."description") between 1 and 500),
	CONSTRAINT "challenges_slug_format" CHECK ("challenges"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length("challenges"."slug") <= 80),
	CONSTRAINT "challenges_project_url_scheme" CHECK ("challenges"."project_url" is null or "challenges"."project_url" ~ '^https?://'),
	CONSTRAINT "challenges_shipped_at_matches_status" CHECK (("challenges"."status" = 'shipped') = ("challenges"."shipped_at" is not null))
);
--> statement-breakpoint
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "challenges_user_id_created_at_idx" ON "challenges" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "challenges_status_deadline_idx" ON "challenges" USING btree ("status","deadline");