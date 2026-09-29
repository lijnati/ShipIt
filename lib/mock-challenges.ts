import type { ChallengeCardData } from "@/components/shipit/challenge-card";

// Marketing examples for the landing page. Not real challenges; cards built
// from these are rendered unlinked.

const creator = (username: string) => ({ username, avatarUrl: null });

export const featuredChallenge: ChallengeCardData = {
  slug: "ship-my-contract-reminder-mvp",
  creator: creator("nahtty"),
  title: "Ship my contract reminder MVP",
  deadline: "2026-10-03T23:59:00Z",
  status: "ACTIVE",
  timeLabel: "2d 14h",
};

export const recentChallenges: ChallengeCardData[] = [
  {
    slug: "launch-my-chrome-extension-on-product-hunt",
    creator: creator("marta_dev"),
    title: "Launch my Chrome extension on Product Hunt",
    deadline: "2026-09-30T17:00:00Z",
    status: "ACTIVE",
    timeLabel: "19h",
  },
  {
    slug: "ship-v1-of-my-invoice-parser-api",
    creator: creator("kenji"),
    title: "Ship v1 of my invoice parser API",
    deadline: "2026-09-28T12:00:00Z",
    status: "SHIPPED",
    timeLabel: "3h",
  },
  {
    slug: "finish-the-onboarding-flow-i-keep-redesigning",
    creator: creator("dropout_dan"),
    title: "Finish the onboarding flow I keep redesigning",
    deadline: "2026-09-26T23:59:00Z",
    status: "FAILED",
    timeLabel: "2d 1h",
  },
  {
    slug: "get-10-paying-users-for-my-notion-template",
    creator: creator("priya_builds"),
    title: "Get 10 paying users for my Notion template",
    deadline: "2026-10-04T23:59:00Z",
    status: "ACTIVE",
    timeLabel: "5d 2h",
  },
  {
    slug: "rewrite-my-landing-page-copy-for-the-4th-time",
    creator: creator("solofounder"),
    title: "Rewrite my landing page copy (for the 4th time)",
    deadline: "2026-09-27T18:00:00Z",
    status: "SHIPPED",
    timeLabel: "1d 6h",
  },
  {
    slug: "open-source-my-dotfiles-cli",
    creator: creator("leo"),
    title: "Open-source my dotfiles CLI",
    deadline: "2026-09-25T23:59:00Z",
    status: "FAILED",
    timeLabel: "6h",
  },
];

export const mockStats = [
  { label: "promises made", value: "3,412" },
  { label: "shipped", value: "58%" },
  { label: "publicly failed", value: "1,433" },
] as const;
