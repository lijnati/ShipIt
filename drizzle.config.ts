import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside Next.js, so load .env.local ourselves.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local (e.g. CI) — rely on the real environment.
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema/index.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  strict: true,
  verbose: true,
});
