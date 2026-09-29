export const TITLE_MIN_LENGTH = 5;
export const TITLE_MAX_LENGTH = 120;
export const DESCRIPTION_MAX_LENGTH = 500;
const PROJECT_URL_MAX_LENGTH = 2048;
const SLUG_BASE_MAX_LENGTH = 60;
// A promise is a near-term thing. Also keeps out typos like year 20266.
const MAX_DEADLINE_MS = 366 * 24 * 60 * 60 * 1000;

export type ChallengeField = "title" | "deadline" | "description" | "projectUrl";
export type ChallengeFieldErrors = Partial<Record<ChallengeField, string>>;

export type ChallengeInput = {
  title: string;
  /** ISO 8601 instant, e.g. from combineLocalDateTime(...).toISOString(). */
  deadline: string;
  description: string;
  projectUrl: string;
};

export type ValidChallenge = {
  title: string;
  deadline: Date;
  description: string | null;
  projectUrl: string | null;
};

export type ChallengeValidation =
  | { ok: true; data: ValidChallenge }
  | { ok: false; errors: ChallengeFieldErrors };

/**
 * Shared by the form (instant feedback, browser clock) and the server action
 * (the real check, server clock). `now` is injected so each side uses its own.
 */
export function validateChallenge(input: ChallengeInput, now: Date): ChallengeValidation {
  const errors: ChallengeFieldErrors = {};

  const title = input.title.trim().replace(/\s+/g, " ");
  const titleLength = charLength(title);
  if (titleLength === 0) {
    errors.title = "Say what you're shipping.";
  } else if (titleLength < TITLE_MIN_LENGTH) {
    errors.title = `Be more specific — at least ${TITLE_MIN_LENGTH} characters.`;
  } else if (titleLength > TITLE_MAX_LENGTH) {
    errors.title = `Keep it under ${TITLE_MAX_LENGTH} characters. One clear promise.`;
  }

  const deadline = parseDeadline(input.deadline);
  if (!deadline) {
    errors.deadline = "Pick a date and time.";
  } else if (deadline.getTime() <= now.getTime()) {
    errors.deadline = "That's in the past. Future You needs a real deadline.";
  } else if (deadline.getTime() - now.getTime() > MAX_DEADLINE_MS) {
    errors.deadline = "Pick a deadline within the next year. ShipIt is for shipping, not someday.";
  }

  const description = input.description.trim();
  if (charLength(description) > DESCRIPTION_MAX_LENGTH) {
    errors.description = `Keep it under ${DESCRIPTION_MAX_LENGTH} characters.`;
  }

  const projectUrl = normalizeWebUrl(input.projectUrl);
  if (projectUrl === false) {
    errors.projectUrl = "That doesn't look like a web link. Use something like myapp.com.";
  }

  if (Object.keys(errors).length > 0 || !deadline || projectUrl === false) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      title,
      deadline,
      description: description || null,
      projectUrl,
    },
  };
}

/** Counts characters like Postgres char_length (code points, not UTF-16 units). */
export function charLength(value: string): number {
  return Array.from(value).length;
}

const ISO_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

function parseDeadline(value: string): Date | null {
  if (!ISO_INSTANT.test(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * null when empty, false when invalid, else a normalized http(s) URL.
 * Bare domains get https://. Any other scheme (javascript:, data:, file:…) is rejected.
 */
export function normalizeWebUrl(value: string): string | null | false {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > PROJECT_URL_MAX_LENGTH) return false;

  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
  if (hasScheme && !/^https?:\/\//i.test(trimmed)) return false;

  let url: URL;
  try {
    url = new URL(hasScheme ? trimmed : `https://${trimmed}`);
  } catch {
    return false;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  if (url.username || url.password) return false;
  // Require a real-looking host (has a dot, e.g. "myapp.com", not "myapp").
  if (!url.hostname.includes(".") || url.hostname.endsWith(".")) return false;

  return url.toString();
}

/**
 * Interprets date ("YYYY-MM-DD") and time ("HH:mm") in the browser's local
 * timezone. Only meaningful client-side; the result is sent as an ISO instant.
 */
export function combineLocalDateTime(date: string, time: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const result = new Date(y, m - 1, d, hh, mm);
  // Reject rollovers like Feb 31 → Mar 3.
  if (result.getFullYear() !== y || result.getMonth() !== m - 1 || result.getDate() !== d) {
    return null;
  }
  return result;
}

/** Readable slug base from a title. Always non-empty and within the DB format. */
export function slugifyTitle(title: string): string {
  const slug = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!slug) return "promise";
  if (slug.length <= SLUG_BASE_MAX_LENGTH) return slug;

  // Cut at a word boundary where possible.
  const cut = slug.slice(0, SLUG_BASE_MAX_LENGTH);
  const lastDash = cut.lastIndexOf("-");
  return (lastDash > 20 ? cut.slice(0, lastDash) : cut).replace(/-+$/g, "");
}
