# ShipIt Launch Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render a ~24s 1920×1080 H.264 launch video for X that tells ShipIt's promise → countdown → SHIPPED/FAILED story in the site's brand.

**Architecture:** A standalone Remotion project in `video/` (own `package.json`, installed with `--ignore-workspace`, excluded from the root tsconfig/eslint). One component per scene, sequenced with `<Series>`; pure timing helpers (countdown, typewriter) are unit-tested with vitest; visuals are verified by rendering stills.

**Tech Stack:** Remotion 4 (`remotion`, `@remotion/cli`, `@remotion/fonts`, all the same exact version), React 19, TypeScript 5, vitest.

**Spec:** `docs/superpowers/specs/2026-09-30-launch-video-design.md`

## Global Constraints

- Output: 1920×1080, 30fps, 720 frames (24s), H.264, `video/out/shipit-launch.mp4`.
- Scene frames: hook 90, headline 90, promise 120, share 120, outcome 120, outro 180.
- Colors (from `app/globals.css`): paper `#f4f1e9`, ink `#0b0b0b`, card `#ffffff`, brand `#ff4f00`, active `#ffd60a`, shipped `#2fe06f`, failed `#ff3b30`, muted `#57524a`.
- Fonts: Archivo Black (`assets/fonts/Archivo-Black.woff`), JetBrains Mono Bold (`assets/fonts/JetBrainsMono-Bold.woff`); logo `brand/shipit-logo.png` (transparent). Copied into `video/public/` by `scripts/sync-assets.mjs`, never edited in place.
- Silent unless `video/public/music.mp3` exists; then mixed in with a 1s fade-out.
- The Next app is untouched: root `pnpm exec tsc --noEmit` and `pnpm lint` must still pass.
- All `remotion*` packages pinned to the same exact version.
- No git commits unless the user asks.

## Review Focus

1. **Fonts not loaded when a frame is captured** → text falls back to a system font. Expect Archivo Black / JetBrains Mono in every still (Task 5 still review; fonts are loaded through `@remotion/fonts`, which blocks rendering until ready).
2. **No `music.mp3`** → render must still succeed silently, not 404. Expect `src/generated/assets.ts` to say `hasMusic = false` and the render to pass (Task 1 check, Task 5 render).
3. **Widest text lines overflowing 1920px** (hook sentence, "you’re going to", URL bar + watching pill, outro tagline). Expect everything inside the frame with margin (Task 3/4/5 stills).
4. **Countdown going negative, backwards, or out of range at scene edges.** Expect it clamped to `2d 14h 00m` … `0d 00h 03m` and never increasing (Task 2 tests).
5. **Root app picking up `video/`** (TypeScript `**/*.tsx` include, eslint, pnpm workspace). Expect root tsc/lint unchanged (Task 1 check, Task 5 re-check).

---

### Task 1: Scaffold the isolated Remotion project

**Files:**
- Create: `video/package.json`, `video/tsconfig.json`, `video/remotion.config.ts`, `video/.gitignore`, `video/scripts/sync-assets.mjs`, `video/src/index.ts`, `video/src/Root.tsx`, `video/src/LaunchVideo.tsx`, `video/src/theme.ts`, `video/src/fonts.ts`
- Modify: `tsconfig.json` (exclude), `eslint.config.mjs` (ignore)

**Interfaces:**
- Produces: `colors`, `fonts`, `VIDEO`, `SCENE_FRAMES`, `TOTAL_FRAMES`, `hardShadow(px, color?)`, `DEMO` from `src/theme.ts`; `hasMusic: boolean` from `src/generated/assets.ts`; composition id `ShipItLaunch`.

- [ ] **Step 1: Create `video/package.json`**

```json
{
  "name": "shipit-launch-video",
  "private": true,
  "type": "module",
  "scripts": {
    "sync": "node scripts/sync-assets.mjs",
    "studio": "node scripts/sync-assets.mjs && remotion studio src/index.ts",
    "render": "node scripts/sync-assets.mjs && remotion render src/index.ts ShipItLaunch out/shipit-launch.mp4 --codec=h264 --crf=18",
    "still": "remotion still src/index.ts ShipItLaunch",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "packageManager": "pnpm@11.13.1"
}
```

- [ ] **Step 2: Install dependencies (outside the root workspace)**

Run from `video/`:
```bash
pnpm add --ignore-workspace remotion@4.0.530 @remotion/cli@4.0.530 @remotion/fonts@4.0.530 react@19.2.8 react-dom@19.2.8
pnpm add -D --ignore-workspace typescript@^5 @types/react@^19 vitest
```
Expected: `video/node_modules` and `video/pnpm-lock.yaml` created; root `pnpm-lock.yaml` unchanged (`git diff --stat pnpm-lock.yaml` empty).

- [ ] **Step 3: Create `video/tsconfig.json`, `video/remotion.config.ts`, `video/.gitignore`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["src", "remotion.config.ts"]
}
```

```ts
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
```

```
node_modules/
out/
public/fonts/
public/shipit-logo.png
public/music.mp3
src/generated/
```

- [ ] **Step 4: Create `video/scripts/sync-assets.mjs`**

```js
// Copies the brand fonts and logo from the app into video/public and records
// whether a music track is present, so the brand files stay the single source.
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const videoDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = join(videoDir, "..");
const publicDir = join(videoDir, "public");

const copies = [
  ["assets/fonts/Archivo-Black.woff", "fonts/Archivo-Black.woff"],
  ["assets/fonts/JetBrainsMono-Bold.woff", "fonts/JetBrainsMono-Bold.woff"],
  ["brand/shipit-logo.png", "shipit-logo.png"],
];

for (const [from, to] of copies) {
  const dest = join(publicDir, to);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(join(repoDir, from), dest);
}

const hasMusic = existsSync(join(publicDir, "music.mp3"));
const generatedDir = join(videoDir, "src", "generated");
mkdirSync(generatedDir, { recursive: true });
writeFileSync(
  join(generatedDir, "assets.ts"),
  `// Generated by scripts/sync-assets.mjs — do not edit.\nexport const hasMusic = ${hasMusic};\n`,
);

console.log(`[sync-assets] copied ${copies.length} files; music: ${hasMusic ? "yes" : "no"}`);
```

- [ ] **Step 5: Create `video/src/theme.ts`**

```ts
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
```

- [ ] **Step 6: Create `video/src/fonts.ts`, `video/src/index.ts`, `video/src/Root.tsx`, `video/src/LaunchVideo.tsx`**

```ts
// @remotion/fonts delays rendering until each face has loaded.
import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const fontsReady = Promise.all([
  loadFont({ family: "Archivo Black", url: staticFile("fonts/Archivo-Black.woff"), weight: "400" }),
  loadFont({ family: "JetBrains Mono", url: staticFile("fonts/JetBrainsMono-Bold.woff"), weight: "700" }),
]);
```

```ts
import { registerRoot } from "remotion";
import { Root } from "./Root";

registerRoot(Root);
```

```tsx
import { Composition } from "remotion";
import "./fonts";
import { LaunchVideo } from "./LaunchVideo";
import { TOTAL_FRAMES, VIDEO } from "./theme";

export function Root() {
  return (
    <Composition
      id="ShipItLaunch"
      component={LaunchVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  );
}
```

```tsx
import { AbsoluteFill } from "remotion";
import { colors } from "./theme";

export function LaunchVideo() {
  return <AbsoluteFill style={{ backgroundColor: colors.paper }} />;
}
```

- [ ] **Step 7: Keep the Next app away from `video/`**

In root `tsconfig.json` change `"exclude": ["node_modules"]` to `"exclude": ["node_modules", "video"]`.
In root `eslint.config.mjs` add `"video/**",` to the `globalIgnores([...])` list after `"next-env.d.ts",`.

- [ ] **Step 8: Verify**

Run from `video/`:
```bash
pnpm sync && cat src/generated/assets.ts && pnpm typecheck && pnpm exec remotion compositions src/index.ts
```
Expected: `[sync-assets] copied 3 files; music: no`, `export const hasMusic = false;`, tsc clean, composition list shows `ShipItLaunch  30  1920x1080  720 (24.00 sec)`.

Run from repo root: `pnpm exec tsc --noEmit && pnpm lint` → both clean.

---

### Task 2: Timing helpers (TDD)

**Files:**
- Create: `video/src/lib/countdown.ts`, `video/src/lib/countdown.test.ts`, `video/src/lib/typewriter.ts`, `video/src/lib/typewriter.test.ts`

**Interfaces:**
- Produces: `COUNTDOWN_START_MINUTES = 3720`, `COUNTDOWN_END_MINUTES = 3`, `minutesRemaining(progress: number): number`, `formatCountdown(totalMinutes: number): string`; `typedText(text, frame, charsPerFrame, startFrame = 0): string`, `caretVisible(frame): boolean`.

- [ ] **Step 1: Write the failing tests**

`video/src/lib/countdown.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import {
  COUNTDOWN_END_MINUTES,
  COUNTDOWN_START_MINUTES,
  formatCountdown,
  minutesRemaining,
} from "./countdown";

describe("formatCountdown", () => {
  it("formats the start value", () => {
    expect(formatCountdown(COUNTDOWN_START_MINUTES)).toBe("2d 14h 00m");
  });
  it("formats the end value", () => {
    expect(formatCountdown(COUNTDOWN_END_MINUTES)).toBe("0d 00h 03m");
  });
  it("clamps negatives to zero", () => {
    expect(formatCountdown(-5)).toBe("0d 00h 00m");
  });
  it("floors fractional minutes", () => {
    expect(formatCountdown(61.9)).toBe("0d 01h 01m");
  });
});

describe("minutesRemaining", () => {
  it("starts at 2d 14h", () => {
    expect(minutesRemaining(0)).toBe(3720);
  });
  it("ends at 3 minutes", () => {
    expect(minutesRemaining(1)).toBe(3);
  });
  it("clamps progress outside 0..1", () => {
    expect(minutesRemaining(-1)).toBe(3720);
    expect(minutesRemaining(2)).toBe(3);
  });
  it("never counts back up", () => {
    let previous = Infinity;
    for (let i = 0; i <= 100; i++) {
      const minutes = minutesRemaining(i / 100);
      expect(minutes).toBeLessThanOrEqual(previous);
      previous = minutes;
    }
  });
  it("accelerates: the second half covers more time than the first", () => {
    const firstHalf = minutesRemaining(0) - minutesRemaining(0.5);
    const secondHalf = minutesRemaining(0.5) - minutesRemaining(1);
    expect(secondHalf).toBeGreaterThan(firstHalf);
  });
});
```

`video/src/lib/typewriter.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { caretVisible, typedText } from "./typewriter";

describe("typedText", () => {
  it("is empty before the start frame", () => {
    expect(typedText("hello", 3, 1, 5)).toBe("");
  });
  it("reveals characters at the given rate", () => {
    expect(typedText("hello", 7, 1, 5)).toBe("he");
  });
  it("never exceeds the full text", () => {
    expect(typedText("hello", 500, 1)).toBe("hello");
  });
  it("counts astral characters as one", () => {
    expect(typedText("a🚀b", 2, 1)).toBe("a🚀");
  });
});

describe("caretVisible", () => {
  it("blinks every 15 frames", () => {
    expect(caretVisible(0)).toBe(true);
    expect(caretVisible(15)).toBe(false);
    expect(caretVisible(30)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run from `video/`: `pnpm test`
Expected: FAIL — cannot resolve `./countdown` / `./typewriter`.

- [ ] **Step 3: Implement**

`video/src/lib/countdown.ts`:
```ts
/** 2d 14h, matching the landing page's example card. */
export const COUNTDOWN_START_MINUTES = (2 * 24 + 14) * 60;
export const COUNTDOWN_END_MINUTES = 3;

/** Minutes left at `progress` (0..1, clamped), easing in so the clock speeds up. */
export function minutesRemaining(progress: number): number {
  const t = Math.min(1, Math.max(0, progress));
  const eased = t * t * t;
  return Math.round(
    COUNTDOWN_START_MINUTES - (COUNTDOWN_START_MINUTES - COUNTDOWN_END_MINUTES) * eased,
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "2d 14h 00m". Negative input reads as zero. */
export function formatCountdown(totalMinutes: number): string {
  const minutes = Math.max(0, Math.floor(totalMinutes));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  return `${days}d ${pad(hours)}h ${pad(minutes % 60)}m`;
}
```

`video/src/lib/typewriter.ts`:
```ts
/** The prefix of `text` visible at `frame`, typing `charsPerFrame` from `startFrame`. */
export function typedText(
  text: string,
  frame: number,
  charsPerFrame: number,
  startFrame = 0,
): string {
  const chars = Array.from(text);
  const count = Math.floor((frame - startFrame) * charsPerFrame);
  return chars.slice(0, Math.min(Math.max(count, 0), chars.length)).join("");
}

const CARET_BLINK_FRAMES = 15;

export function caretVisible(frame: number): boolean {
  return Math.floor(frame / CARET_BLINK_FRAMES) % 2 === 0;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test && pnpm typecheck` → all tests PASS, tsc clean.

---

### Task 3: Hook and Headline scenes

**Files:**
- Create: `video/src/components/Caret.tsx`, `video/src/components/Highlight.tsx`, `video/src/scenes/Hook.tsx`, `video/src/scenes/Headline.tsx`
- Modify: `video/src/LaunchVideo.tsx`

**Interfaces:**
- Consumes: `colors`, `fonts`, `SCENE_FRAMES` (Task 1); `typedText`, `caretVisible` (Task 2).
- Produces: `<Caret color blink? />`, `<Highlight progress?>…</Highlight>`, `<Hook />`, `<Headline />`.

- [ ] **Step 1: Create shared components**

`video/src/components/Caret.tsx`:
```tsx
import { useCurrentFrame } from "remotion";
import { caretVisible } from "../lib/typewriter";

/** Solid block caret; steady while typing, blinking once `blink` is set. */
export function Caret({ color, blink = false }: { color: string; blink?: boolean }) {
  const frame = useCurrentFrame();
  return (
    <span
      style={{
        display: "inline-block",
        width: "0.5em",
        height: "0.85em",
        marginLeft: "0.08em",
        verticalAlign: "-0.08em",
        backgroundColor: color,
        opacity: !blink || caretVisible(frame) ? 1 : 0,
      }}
    />
  );
}
```

`video/src/components/Highlight.tsx`:
```tsx
import type { ReactNode } from "react";
import { colors } from "../theme";

/** The site's tilted orange marker bar under a phrase; `progress` wipes it in. */
export function Highlight({ progress = 1, children }: { progress?: number; children: ReactNode }) {
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        style={{
          position: "absolute",
          left: "-0.06em",
          right: "-0.06em",
          bottom: "0.08em",
          height: "0.35em",
          backgroundColor: colors.brand,
          transform: `rotate(-1deg) scaleX(${progress})`,
          transformOrigin: "left center",
        }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
}
```

- [ ] **Step 2: Create `video/src/scenes/Hook.tsx`**

```tsx
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Caret } from "../components/Caret";
import { typedText } from "../lib/typewriter";
import { colors, fonts } from "../theme";

const LINE = "I’ll ship it this weekend.";
const TYPE_START = 6;
const TYPE_RATE = 0.9;
const STRIKE_START = 42;
const CAPTION_START = 56;

export function Hook() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typed = typedText(LINE, frame, TYPE_RATE, TYPE_START);
  const strike = interpolate(frame, [STRIKE_START, STRIKE_START + 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const caption = spring({ frame: frame - CAPTION_START, fps, config: { damping: 14, stiffness: 180 } });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink, justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "relative",
          fontFamily: fonts.mono,
          fontWeight: 700,
          fontSize: 92,
          letterSpacing: "-0.02em",
          color: colors.paper,
          whiteSpace: "pre",
        }}
      >
        {/* The full line reserves the width so the text doesn't shift while typing. */}
        <span style={{ visibility: "hidden" }}>{LINE}</span>
        <span style={{ position: "absolute", left: 0, top: 0 }}>
          {typed}
          <Caret color={colors.brand} blink={typed === LINE} />
        </span>
        <div
          style={{
            position: "absolute",
            left: -16,
            right: -16,
            top: "54%",
            height: 14,
            backgroundColor: colors.brand,
            transform: `rotate(-1.5deg) scaleX(${strike})`,
            transformOrigin: "left center",
          }}
        />
      </div>
      <p
        style={{
          position: "absolute",
          top: "62%",
          margin: 0,
          fontFamily: fonts.mono,
          fontWeight: 700,
          fontSize: 44,
          color: colors.brand,
          opacity: caption,
          transform: `translateY(${(1 - caption) * 30}px)`,
        }}
      >
        — you, for the 14th time
      </p>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 3: Create `video/src/scenes/Headline.tsx`**

```tsx
import type { CSSProperties } from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Highlight } from "../components/Highlight";
import { colors, fonts } from "../theme";

const LINES = ["Stop saying", "you’re going to"];

export function Headline() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = (delay: number) =>
    spring({ frame: frame - delay, fps, config: { damping: 13, stiffness: 170 } });
  const rise = (p: number): CSSProperties => ({
    display: "block",
    opacity: p,
    transform: `translateY(${(1 - p) * 80}px)`,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper, justifyContent: "center", paddingLeft: 160 }}>
      <h1
        style={{
          margin: 0,
          fontFamily: fonts.heading,
          fontWeight: 400,
          fontSize: 150,
          lineHeight: 0.95,
          letterSpacing: "-0.04em",
          color: colors.ink,
        }}
      >
        {LINES.map((line, i) => (
          <span key={line} style={rise(enter(i * 4))}>
            {line}
          </span>
        ))}
        <span style={rise(enter(8))}>
          <Highlight progress={spring({ frame: frame - 26, fps, config: { damping: 20, stiffness: 140 } })}>
            ship it.
          </Highlight>
        </span>
      </h1>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 4: Sequence them in `video/src/LaunchVideo.tsx`**

```tsx
import { AbsoluteFill, Series } from "remotion";
import { Headline } from "./scenes/Headline";
import { Hook } from "./scenes/Hook";
import { colors, SCENE_FRAMES } from "./theme";

export function LaunchVideo() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <Series>
        <Series.Sequence durationInFrames={SCENE_FRAMES.hook}>
          <Hook />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_FRAMES.headline}>
          <Headline />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 5: Verify with stills**

Run from `video/`:
```bash
pnpm typecheck
pnpm still out/stills/01-hook-typing.png --frame=20
pnpm still out/stills/02-hook-struck.png --frame=80
pnpm still out/stills/03-headline.png --frame=170
```
Open each PNG. Expected: hook in JetBrains Mono on ink, sentence struck through in orange with caption below at frame 80; headline in Archivo Black on paper, three lines, orange bar under "ship it.", nothing clipped at the right edge.

---

### Task 4: Card scenes — promise, share, outcome

**Files:**
- Create: `video/src/components/StepLabel.tsx`, `video/src/components/ChallengeCard.tsx`, `video/src/components/Stamp.tsx`, `video/src/scenes/PromiseScene.tsx`, `video/src/scenes/Share.tsx`, `video/src/scenes/Outcome.tsx`
- Modify: `video/src/LaunchVideo.tsx`

**Interfaces:**
- Consumes: `colors`, `fonts`, `hardShadow`, `DEMO`, `SCENE_FRAMES` (Task 1); `typedText`, `minutesRemaining`, `formatCountdown`, `COUNTDOWN_START_MINUTES`, `COUNTDOWN_END_MINUTES` (Task 2); `Caret` (Task 3).
- Produces: `<StepLabel index title />`, `<ChallengeCard title state footer caret? style? />`, `type CardState`, `<FooterText prefix? big suffix? />`, `<Stamp label color startFrame />`, `<PromiseScene />`, `<Share />`, `<Outcome />`.

- [ ] **Step 1: Create `video/src/components/StepLabel.tsx`**

```tsx
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts } from "../theme";

export function StepLabel({ index, title }: { index: number; title: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 14, stiffness: 200 } });

  return (
    <div
      style={{
        position: "absolute",
        top: 90,
        left: 120,
        display: "flex",
        alignItems: "center",
        gap: 28,
        opacity: p,
        transform: `translateX(${(1 - p) * -60}px)`,
      }}
    >
      <span
        style={{
          fontFamily: fonts.mono,
          fontWeight: 700,
          fontSize: 40,
          color: colors.paper,
          backgroundColor: colors.ink,
          padding: "8px 18px",
        }}
      >
        {String(index).padStart(2, "0")}
      </span>
      <span style={{ fontFamily: fonts.heading, fontSize: 68, letterSpacing: "-0.03em", color: colors.ink }}>
        {title}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Create `video/src/components/ChallengeCard.tsx`**

```tsx
import type { CSSProperties, ReactNode } from "react";
import { colors, DEMO, fonts, hardShadow } from "../theme";
import { Caret } from "./Caret";

export type CardState = "ACTIVE" | "SHIPPED" | "FAILED";

const stateStyles: Record<CardState, { label: string; color: string }> = {
  ACTIVE: { label: "Active", color: colors.active },
  SHIPPED: { label: "Shipped", color: colors.shipped },
  FAILED: { label: "Failed", color: colors.failed },
};

const border = `4px solid ${colors.ink}`;

type ChallengeCardProps = {
  title: string;
  state: CardState;
  footer: ReactNode;
  /** Show a typing caret after the title. */
  caret?: boolean;
  style?: CSSProperties;
};

/** Video-sized copy of components/shipit/challenge-card.tsx. */
export function ChallengeCard({ title, state, footer, caret = false, style }: ChallengeCardProps) {
  const s = stateStyles[state];
  const failed = state === "FAILED";

  return (
    <div
      style={{
        width: 1040,
        backgroundColor: colors.card,
        border,
        boxShadow: hardShadow(16),
        color: colors.ink,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: border,
          padding: "18px 28px",
          fontFamily: fonts.mono,
          fontWeight: 700,
          fontSize: 26,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: colors.ink,
            color: colors.paper,
            padding: "6px 14px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          <span style={{ width: 14, height: 14, backgroundColor: s.color }} />
          {s.label}
        </span>
        <span style={{ color: colors.muted }}>/c/{DEMO.slug}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "32px 36px 36px" }}>
        <p
          style={{
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: fonts.mono,
            fontWeight: 700,
            fontSize: 30,
          }}
        >
          <span style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: colors.brand, border }} />
          @{DEMO.username}
          <span style={{ color: colors.muted }}>promised to</span>
        </p>

        <h2
          style={{
            margin: 0,
            minHeight: "2.2em",
            fontFamily: fonts.heading,
            fontWeight: 400,
            fontSize: 72,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: failed ? colors.muted : colors.ink,
            textDecorationLine: failed ? "line-through" : "none",
            textDecorationColor: colors.failed,
            textDecorationThickness: 8,
          }}
        >
          “{title}
          {caret && <Caret color={colors.brand} />}”
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            border,
            fontFamily: fonts.mono,
            fontWeight: 700,
          }}
        >
          <div style={{ borderRight: border, padding: "12px 18px" }}>
            <div style={{ fontSize: 20, color: colors.muted, textTransform: "uppercase" }}>Deadline</div>
            <div style={{ fontSize: 30 }}>Fri, Oct 3</div>
          </div>
          <div style={{ padding: "12px 18px" }}>
            <div style={{ fontSize: 20, color: colors.muted, textTransform: "uppercase" }}>Time</div>
            <div style={{ fontSize: 30 }}>11:59 PM</div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          borderTop: border,
          backgroundColor: s.color,
          padding: "20px 28px",
          fontFamily: fonts.mono,
          fontWeight: 700,
        }}
      >
        {footer}
      </div>
    </div>
  );
}

/** Card footer copy: optional small prefix/suffix around a big tabular value. */
export function FooterText({ prefix, big, suffix }: { prefix?: string; big: string; suffix?: string }) {
  return (
    <>
      {prefix && <span style={{ fontSize: 28 }}>{prefix}</span>}
      <span style={{ fontSize: 56, fontVariantNumeric: "tabular-nums" }}>{big}</span>
      {suffix && <span style={{ fontSize: 28 }}>{suffix}</span>}
    </>
  );
}
```

- [ ] **Step 3: Create `video/src/components/Stamp.tsx`**

```tsx
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, fonts, hardShadow } from "../theme";

/** A rubber stamp that slams down onto its (position: relative) parent. */
export function Stamp({ label, color, startFrame }: { label: string; color: string; startFrame: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < startFrame) return null;

  const p = spring({ frame: frame - startFrame, fps, config: { damping: 11, stiffness: 260, mass: 0.8 } });
  const scale = interpolate(p, [0, 1], [2.6, 1]);

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) rotate(-9deg) scale(${scale})`,
        opacity: Math.min(1, p * 3),
        border: `10px solid ${colors.ink}`,
        backgroundColor: color,
        color: colors.ink,
        boxShadow: hardShadow(14),
        padding: "8px 40px",
        fontFamily: fonts.heading,
        fontSize: 120,
        letterSpacing: "-0.02em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
}
```

- [ ] **Step 4: Create `video/src/scenes/PromiseScene.tsx`**

```tsx
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ChallengeCard, FooterText } from "../components/ChallengeCard";
import { StepLabel } from "../components/StepLabel";
import { COUNTDOWN_START_MINUTES, formatCountdown } from "../lib/countdown";
import { typedText } from "../lib/typewriter";
import { colors, DEMO } from "../theme";

const TYPE_START = 24;
const TYPE_RATE = 0.8;

export function PromiseScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 160 } });
  const title = typedText(DEMO.title, frame, TYPE_RATE, TYPE_START);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <StepLabel index={1} title="Make the promise" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 110 }}>
        <ChallengeCard
          title={title}
          caret={title !== DEMO.title}
          state="ACTIVE"
          footer={<FooterText big={formatCountdown(COUNTDOWN_START_MINUTES)} suffix="left" />}
          style={{
            opacity: enter,
            transform: `translateY(${(1 - enter) * 120}px) rotate(1deg) scale(${0.92 + 0.08 * enter})`,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 5: Create `video/src/scenes/Share.tsx`**

```tsx
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ChallengeCard, FooterText } from "../components/ChallengeCard";
import { StepLabel } from "../components/StepLabel";
import { formatCountdown, minutesRemaining } from "../lib/countdown";
import { colors, DEMO, fonts, hardShadow } from "../theme";

const COUNT_START = 12;
const COUNT_FRAMES = 96;

// Offsets from the card's center; they sit just outside its left/right edges.
const WATCHERS: [number, number][] = [
  [-640, -220], [660, -180], [-700, 20], [690, 60], [-620, 250],
  [640, 260], [-760, -90], [770, -60], [-760, 150], [760, 170],
];
const WATCHER_COLORS = [colors.brand, colors.active, colors.shipped, colors.card];

export function Share() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bar = spring({ frame: frame - 4, fps, config: { damping: 14, stiffness: 180 } });
  const minutes = minutesRemaining((frame - COUNT_START) / COUNT_FRAMES);
  const watching = Math.round(
    interpolate(frame, [20, 110], [3, 1204], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.in(Easing.quad),
    }),
  );
  const pill = { fontFamily: fonts.mono, fontWeight: 700, fontSize: 36 } as const;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <StepLabel index={2} title="Share the page" />

      <div
        style={{
          position: "absolute",
          top: 205,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 24,
          opacity: bar,
          transform: `translateY(${(1 - bar) * -40}px)`,
        }}
      >
        <div
          style={{
            ...pill,
            backgroundColor: colors.card,
            border: `4px solid ${colors.ink}`,
            boxShadow: hardShadow(8),
            padding: "14px 28px",
          }}
        >
          {DEMO.domain}/c/<span style={{ color: colors.brand }}>{DEMO.slug}</span>
        </div>
        <div
          style={{
            ...pill,
            display: "flex",
            alignItems: "center",
            gap: 14,
            backgroundColor: colors.ink,
            color: colors.paper,
            padding: "14px 24px",
          }}
        >
          <span style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: colors.failed }} />
          {watching.toLocaleString("en-US")} watching
        </div>
      </div>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 200 }}>
        <div style={{ position: "relative" }}>
          <ChallengeCard
            title={DEMO.title}
            state="ACTIVE"
            footer={<FooterText big={formatCountdown(minutes)} suffix="left" />}
            style={{ transform: "rotate(1deg)" }}
          />
          {WATCHERS.map(([x, y], i) => {
            const p = spring({ frame: frame - 20 - i * 6, fps, config: { damping: 10, stiffness: 220 } });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  backgroundColor: WATCHER_COLORS[i % WATCHER_COLORS.length],
                  border: `4px solid ${colors.ink}`,
                  boxShadow: hardShadow(5),
                  transform: `translate(-50%, -50%) scale(${p})`,
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 6: Create `video/src/scenes/Outcome.tsx`**

```tsx
import type { ReactNode } from "react";
import { AbsoluteFill, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ChallengeCard, FooterText } from "../components/ChallengeCard";
import { Stamp } from "../components/Stamp";
import { StepLabel } from "../components/StepLabel";
import { COUNTDOWN_END_MINUTES, formatCountdown } from "../lib/countdown";
import { colors, DEMO, fonts } from "../theme";

const IMPACT = 8;
const FAIL_START = 56;
const FAIL_END = 74;

export function Outcome() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <Sequence durationInFrames={FAIL_START}>
        <ShippedBeat />
      </Sequence>
      <Sequence from={FAIL_START} durationInFrames={FAIL_END - FAIL_START}>
        <FailedBeat />
      </Sequence>
      <Sequence durationInFrames={FAIL_END}>
        <StepLabel index={3} title="Ship it — or don’t" />
      </Sequence>
      <Sequence from={FAIL_END}>
        <PermanentlyBeat />
      </Sequence>
    </AbsoluteFill>
  );
}

function CardStage({ offsetX = 0, children }: { offsetX?: number; children: ReactNode }) {
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 110 }}>
      <div style={{ position: "relative", transform: `translateX(${offsetX}px) rotate(1deg)` }}>{children}</div>
    </AbsoluteFill>
  );
}

function ShippedBeat() {
  const frame = useCurrentFrame();
  const t = frame - IMPACT;
  const shake = t >= 0 && t < 14 ? Math.sin(t * 2.4) * 22 * (1 - t / 14) : 0;
  const shipped = frame >= IMPACT;

  return (
    <CardStage offsetX={shake}>
      <ChallengeCard
        title={DEMO.title}
        state={shipped ? "SHIPPED" : "ACTIVE"}
        footer={
          shipped ? (
            <FooterText prefix="shipped" big="3m" suffix="early" />
          ) : (
            <FooterText big={formatCountdown(COUNTDOWN_END_MINUTES)} suffix="left" />
          )
        }
      />
      <Stamp label="Shipped" color={colors.shipped} startFrame={IMPACT} />
    </CardStage>
  );
}

function FailedBeat() {
  return (
    <CardStage>
      <ChallengeCard title={DEMO.title} state="FAILED" footer={<FooterText prefix="missed by" big="2h 13m" />} />
      <Stamp label="Failed to ship" color={colors.failed} startFrame={0} />
    </CardStage>
  );
}

function PermanentlyBeat() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = (delay: number) =>
    spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 200 } });
  const a = enter(0);
  const b = enter(10);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.ink,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: fonts.heading,
        fontSize: 170,
        lineHeight: 1,
        letterSpacing: "-0.04em",
      }}
    >
      <span style={{ color: colors.paper, opacity: a, transform: `translateY(${(1 - a) * 60}px)` }}>
        Permanently.
      </span>
      <span style={{ color: colors.brand, opacity: b, transform: `translateY(${(1 - b) * 60}px)` }}>
        Publicly.
      </span>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 7: Add them to `video/src/LaunchVideo.tsx`**

```tsx
import { AbsoluteFill, Series } from "remotion";
import { Headline } from "./scenes/Headline";
import { Hook } from "./scenes/Hook";
import { Outcome } from "./scenes/Outcome";
import { PromiseScene } from "./scenes/PromiseScene";
import { Share } from "./scenes/Share";
import { colors, SCENE_FRAMES } from "./theme";

export function LaunchVideo() {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <Series>
        <Series.Sequence durationInFrames={SCENE_FRAMES.hook}>
          <Hook />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_FRAMES.headline}>
          <Headline />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_FRAMES.promise}>
          <PromiseScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_FRAMES.share}>
          <Share />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_FRAMES.outcome}>
          <Outcome />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 8: Verify with stills**

Run from `video/`:
```bash
pnpm typecheck
pnpm still out/stills/04-promise.png --frame=290
pnpm still out/stills/05-share.png --frame=380
pnpm still out/stills/06-shipped.png --frame=450
pnpm still out/stills/07-failed.png --frame=485
pnpm still out/stills/08-permanently.png --frame=530
```
Expected: step label top-left; card fully in frame and not overlapping the label; typed title with caret mid-typing at 290; URL bar + watching pill in one row inside the frame, countdown mid-way (e.g. `1d …`) at 380; green SHIPPED stamp across the card at 450; red FAILED TO SHIP with struck title at 485; "Permanently. Publicly." on ink at 530.

---

### Task 5: Outro, music, full render

**Files:**
- Create: `video/src/scenes/Outro.tsx`
- Modify: `video/src/LaunchVideo.tsx`

**Interfaces:**
- Consumes: everything above; `hasMusic` (Task 1).
- Produces: `video/out/shipit-launch.mp4`.

- [ ] **Step 1: Create `video/src/scenes/Outro.tsx`**

```tsx
import type { CSSProperties } from "react";
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Highlight } from "../components/Highlight";
import { colors, DEMO, fonts, hardShadow } from "../theme";

export function Outro() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = (delay: number) =>
    spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 170 } });
  const rise = (p: number): CSSProperties => ({ opacity: p, transform: `translateY(${(1 - p) * 50}px)` });
  const logo = enter(0);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper, justifyContent: "center", alignItems: "center", gap: 56 }}>
      <Img
        src={staticFile("shipit-logo.png")}
        style={{ width: 640, opacity: logo, transform: `scale(${0.8 + 0.2 * logo})` }}
      />
      <h2
        style={{
          margin: 0,
          textAlign: "center",
          fontFamily: fonts.heading,
          fontWeight: 400,
          fontSize: 84,
          lineHeight: 1.02,
          letterSpacing: "-0.035em",
          color: colors.ink,
          ...rise(enter(14)),
        }}
      >
        Make a public promise.
        <br />
        Set a deadline. <Highlight progress={enter(26)}>Ship.</Highlight>
      </h2>
      <div
        style={{
          fontFamily: fonts.mono,
          fontWeight: 700,
          fontSize: 64,
          backgroundColor: colors.ink,
          color: colors.paper,
          padding: "18px 40px",
          boxShadow: hardShadow(12, colors.brand),
          ...rise(enter(30)),
        }}
      >
        {DEMO.domain}
      </div>
      <p style={{ margin: 0, fontFamily: fonts.mono, fontWeight: 700, fontSize: 30, color: colors.muted, ...rise(enter(46)) }}>
        Free. Public by default. No moving the deadline.
      </p>
    </AbsoluteFill>
  );
}
```

- [ ] **Step 2: Final `video/src/LaunchVideo.tsx` (outro + optional music)**

```tsx
import { AbsoluteFill, Audio, interpolate, Series, staticFile, useVideoConfig } from "remotion";
import { hasMusic } from "./generated/assets";
import { Headline } from "./scenes/Headline";
import { Hook } from "./scenes/Hook";
import { Outcome } from "./scenes/Outcome";
import { Outro } from "./scenes/Outro";
import { PromiseScene } from "./scenes/PromiseScene";
import { Share } from "./scenes/Share";
import { colors, SCENE_FRAMES } from "./theme";

export function LaunchVideo() {
  const { durationInFrames, fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: colors.paper }}>
      <Series>
        <Series.Sequence durationInFrames={SCENE_FRAMES.hook}>
          <Hook />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_FRAMES.headline}>
          <Headline />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_FRAMES.promise}>
          <PromiseScene />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_FRAMES.share}>
          <Share />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_FRAMES.outcome}>
          <Outcome />
        </Series.Sequence>
        <Series.Sequence durationInFrames={SCENE_FRAMES.outro}>
          <Outro />
        </Series.Sequence>
      </Series>
      {hasMusic && (
        <Audio
          src={staticFile("music.mp3")}
          volume={(f) =>
            interpolate(f, [durationInFrames - fps, durationInFrames], [0.8, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })
          }
        />
      )}
    </AbsoluteFill>
  );
}
```
If tsc reports `Audio` as removed/deprecated in this Remotion version, use the replacement it names (same props).

- [ ] **Step 3: Verify outro still, then render**

Run from `video/`:
```bash
pnpm typecheck && pnpm test
pnpm still out/stills/09-outro.png --frame=700
pnpm render
pnpm exec remotion ffprobe out/shipit-launch.mp4
```
Expected: outro still shows logo, two-line tagline with orange bar under "Ship.", the domain box, footer line, all centered inside the frame. Render completes; ffprobe reports h264, 1920x1080, 30 fps, duration ≈ 24.0s, no audio stream (no music present).

- [ ] **Step 4: Review Focus sweep**

Open every still in `out/stills/` (01–09) and confirm fonts are Archivo Black / JetBrains Mono (not a serif/system fallback) and nothing touches the frame edges. From repo root: `pnpm exec tsc --noEmit && pnpm lint` → clean; `git status` shows only `video/`, `docs/`, `tsconfig.json`, `eslint.config.mjs` (plus the earlier uncommitted analytics change).
