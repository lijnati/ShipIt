import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

function createDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local (see .env.example).");
  }
  // HTTP driver: one round trip per query, no pooled connections to manage on serverless.
  return drizzle({ client: neon(databaseUrl), schema });
}

let instance: ReturnType<typeof createDb> | undefined;

/**
 * The Drizzle client, created on first use. Deferred so `next build` can
 * import pages without DATABASE_URL; a missing value fails the first query.
 */
export function getDb() {
  instance ??= createDb();
  return instance;
}
