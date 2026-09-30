const PRODUCTION_URL = "https://shipit.xylolabs.space";
const DEVELOPMENT_URL = "http://localhost:3000";

/**
 * Absolute base URL for canonical links, OG images and share links — the one
 * place the domain lives. Set NEXT_PUBLIC_APP_URL to override (e.g. a local
 * port); otherwise production builds use the production domain.
 */
export const appUrl = (
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === "production" ? PRODUCTION_URL : DEVELOPMENT_URL)
).replace(/\/+$/, "");

/** Absolute URL for an app path, e.g. absoluteUrl("/c/my-slug"). */
export function absoluteUrl(path: string): string {
  return `${appUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export const siteConfig = {
  name: "ShipIt",
  url: appUrl,
  /** Host shown in UI copy, e.g. "shipit.xylolabs.space". */
  domain: new URL(appUrl).host,
  description:
    "Make a public promise. Set a deadline. Ship before the internet watches you fail.",
} as const;

export const routes = {
  home: "/",
  signIn: "/sign-in",
  signUp: "/sign-up",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  newChallenge: "/new",
  explore: "/explore",
} as const;

export const challengePath = (slug: string) => `/c/${slug}`;
export const profilePath = (username: string) => `/u/${username}`;

export const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/explore", label: "Explore" },
] as const;
