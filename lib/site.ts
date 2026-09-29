export const siteConfig = {
  name: "ShipIt",
  url: "https://shipit.xylolabs.space",
  description:
    "Make a public promise. Set a deadline. Ship before the internet watches you fail.",
  // Challenge creation doesn't exist yet — CTAs point here until it does.
  ctaHref: "#how-it-works",
} as const;

export const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#shipping", label: "Who's shipping" },
] as const;
