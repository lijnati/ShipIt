export async function register() {
  // Check config when a server starts, not while building (builds don't need secrets).
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NEXT_PHASE !== "phase-production-build") {
    const { validateEnv } = await import("@/lib/env");
    validateEnv();
  }
}
