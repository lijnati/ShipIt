export const siteConfig = {
  name: "ShipIt",
  url: "https://shipit.xylolabs.space",
  domain: "shipit.xylolabs.space",
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
} as const;

export const navLinks = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#shipping", label: "Who's shipping" },
] as const;
