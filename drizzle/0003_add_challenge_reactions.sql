CREATE TYPE "public"."reaction_type" AS ENUM('fire', 'respect', 'skull');--> statement-breakpoint
CREATE TABLE "challenge_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"challenge_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "reaction_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "challenge_reactions_challenge_user_type_unique" UNIQUE("challenge_id","user_id","type")
);
--> statement-breakpoint
ALTER TABLE "challenge_reactions" ADD CONSTRAINT "challenge_reactions_challenge_id_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "challenge_reactions" ADD CONSTRAINT "challenge_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "challenge_reactions_user_id_idx" ON "challenge_reactions" USING btree ("user_id");