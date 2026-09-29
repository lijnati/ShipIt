import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
}

// HTTP driver: one round trip per query, no pooled connections to manage on serverless.
export const db = drizzle({ client: neon(databaseUrl), schema });
