export type ChallengeStatus = "ACTIVE" | "SHIPPED" | "FAILED";

export type Challenge = {
  id: number;
  creator: string;
  title: string;
  /** ISO date string. */
  deadline: string;
  status: ChallengeStatus;
  /**
   * Pre-formatted time delta. Meaning depends on status:
   * ACTIVE → time remaining, SHIPPED → how early, FAILED → how late.
   */
  timeLabel: string;
  watchers: number;
};

export const featuredChallenge: Challenge = {
  id: 1042,
  creator: "Nahtty",
  title: "Ship my contract reminder MVP",
  deadline: "2026-10-03",
  status: "ACTIVE",
  timeLabel: "2d 14h",
  watchers: 214,
};

export const recentChallenges: Challenge[] = [
  {
    id: 1041,
    creator: "marta.dev",
    title: "Launch my Chrome extension on Product Hunt",
    deadline: "2026-09-30",
    status: "ACTIVE",
    timeLabel: "19h",
    watchers: 87,
  },
  {
    id: 1039,
    creator: "kenji",
    title: "Ship v1 of my invoice parser API",
    deadline: "2026-09-28",
    status: "SHIPPED",
    timeLabel: "3h",
    watchers: 142,
  },
  {
    id: 1036,
    creator: "dropout_dan",
    title: "Finish the onboarding flow I keep redesigning",
    deadline: "2026-09-26",
    status: "FAILED",
    timeLabel: "2d 1h",
    watchers: 311,
  },
  {
    id: 1035,
    creator: "priya.builds",
    title: "Get 10 paying users for my Notion template",
    deadline: "2026-10-04",
    status: "ACTIVE",
    timeLabel: "5d 2h",
    watchers: 64,
  },
  {
    id: 1031,
    creator: "solofounder",
    title: "Rewrite my landing page copy (for the 4th time)",
    deadline: "2026-09-27",
    status: "SHIPPED",
    timeLabel: "1d 6h",
    watchers: 58,
  },
  {
    id: 1028,
    creator: "leo",
    title: "Open-source my dotfiles CLI",
    deadline: "2026-09-25",
    status: "FAILED",
    timeLabel: "6h",
    watchers: 97,
  },
];

export const mockStats = [
  { label: "promises made", value: "3,412" },
  { label: "shipped", value: "58%" },
  { label: "publicly failed", value: "1,433" },
] as const;
