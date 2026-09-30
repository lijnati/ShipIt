// Server-side environment check, run once at server start (instrumentation.ts).
// Fails loudly and specifically instead of breaking deep inside a request.
// Only reports variable *names*, never values.

/** https everywhere, except a local `next start` (http://localhost:PORT). */
function isHttpsOrLocal(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || ["localhost", "127.0.0.1"].includes(url.hostname);
  } catch {
    return false;
  }
}

const REQUIRED =["DATABASE_URL", "CLERK_SECRET_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"] as const;

export function validateEnv(): void {
  const env = process.env;
  const problems: string[] = [];
  const warnings: string[] = [];

  for (const name of REQUIRED) {
    if (!env[name]) problems.push(`${name} is not set`);
  }
  if (env.DATABASE_URL && !/^postgres(ql)?:\/\//.test(env.DATABASE_URL)) {
    problems.push("DATABASE_URL must be a postgres:// or postgresql:// connection string");
  }
  if (env.CLERK_SECRET_KEY && !env.CLERK_SECRET_KEY.startsWith("sk_")) {
    problems.push("CLERK_SECRET_KEY should start with sk_");
  }
  const publishable = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (publishable && !publishable.startsWith("pk_")) {
    problems.push("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY should start with pk_");
  }

  const production = env.VERCEL_ENV ? env.VERCEL_ENV === "production" : env.NODE_ENV === "production";
  if (production) {
    if (!env.NEXT_PUBLIC_APP_URL) {
      warnings.push("NEXT_PUBLIC_APP_URL is not set; defaulting to https://shipit.xylolabs.space");
    } else if (!isHttpsOrLocal(env.NEXT_PUBLIC_APP_URL)) {
      problems.push("NEXT_PUBLIC_APP_URL must be an https:// URL in production");
    }
    if (publishable?.startsWith("pk_test_")) {
      warnings.push("Clerk development keys (pk_test_) are in use in production; switch to production keys");
    }
  }

  for (const warning of warnings) console.warn(`[env] ${warning}`);
  if (problems.length > 0) {
    throw new Error(
      `[env] Invalid environment:\n${problems.map((p) => `  - ${p}`).join("\n")}\nSee .env.example.`,
    );
  }
}
