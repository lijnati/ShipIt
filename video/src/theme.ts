// Mirrors the tokens in app/globals.css.
export const colors = {
  paper: "#f4f1e9",
  ink: "#0b0b0b",
  card: "#ffffff",
  brand: "#ff4f00",
  active: "#ffd60a",
  shipped: "#2fe06f",
  failed: "#ff3b30",
  muted: "#57524a",
} as const;

export const fonts = {
  heading: '"Archivo Black", sans-serif',
  mono: '"JetBrains Mono", monospace',
} as const;

export const VIDEO = { width: 1920, height: 1080, fps: 30 } as const;

export const SCENE_FRAMES = {
  hook: 90,
  headline: 90,
  promise: 120,
  share: 120,
  outcome: 120,
  outro: 180,
} as const;

export const TOTAL_FRAMES = Object.values(SCENE_FRAMES).reduce((a, b) => a + b, 0);

/** The site's hard offset "brutal" shadow. */
export const hardShadow = (px: number, color: string = colors.ink) =>
  `${px}px ${px}px 0 ${color}`;

/** The example challenge the video follows. */
export const DEMO = {
  slug: "ship-my-landing-page",
  title: "Ship my landing page by Friday.",
  username: "you",
  domain: "shipit.xylolabs.space",
} as const;
