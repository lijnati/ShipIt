export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 24;

const USERNAME_PATTERN = /^[a-z0-9_]+$/;

// Names that would be confusing or impersonate the product on a public profile.
const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "api",
  "dashboard",
  "help",
  "new",
  "null",
  "onboarding",
  "root",
  "settings",
  "shipit",
  "support",
  "undefined",
]);

export type UsernameValidation =
  | { ok: true; username: string }
  | { ok: false; error: string };

export function normalizeUsername(input: string): string {
  return input.trim().toLowerCase();
}

/** Shared by the onboarding form (instant feedback) and the server action (the real check). */
export function validateUsername(input: string): UsernameValidation {
  const username = normalizeUsername(input);

  if (username.length === 0) {
    return { ok: false, error: "Pick a username first." };
  }
  if (!USERNAME_PATTERN.test(username)) {
    return {
      ok: false,
      error: "Letters, numbers and underscores only. No spaces, no @.",
    };
  }
  if (username.length < USERNAME_MIN_LENGTH) {
    return {
      ok: false,
      error: `Too short. At least ${USERNAME_MIN_LENGTH} characters.`,
    };
  }
  if (username.length > USERNAME_MAX_LENGTH) {
    return {
      ok: false,
      error: `Too long. ${USERNAME_MAX_LENGTH} characters max.`,
    };
  }
  if (RESERVED_USERNAMES.has(username)) {
    return { ok: false, error: "Nice try. That one's reserved." };
  }

  return { ok: true, username };
}
