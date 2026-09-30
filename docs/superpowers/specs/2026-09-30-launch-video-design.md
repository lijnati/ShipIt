# ShipIt launch video — design

## Goal

A ~24s launch video for X/Twitter that sells ShipIt's core loop — public
promise → public countdown → SHIPPED or FAILED TO SHIP — and ends on
`shipit.xylolabs.space`. It autoplays muted in the feed, so all meaning is
carried by on-screen type; audio is optional.

## Output

- 1920×1080, 30fps, ~24s (720 frames), H.264 MP4 at `video/out/shipit-launch.mp4`.
- Silent by default. If `video/public/music.mp3` exists it is mixed in with a
  short fade-out at the end.

## Approach

Remotion (React → MP4), in a standalone `video/` folder with its own
`package.json`:

- Not a pnpm workspace member; excluded from the root `tsconfig.json` and
  eslint config so the Next app and Vercel builds are untouched.
- Fonts come from `assets/fonts` (Archivo Black, JetBrains Mono Bold) and the
  logo from `brand/`, copied into `video/public/` by a script, so the brand
  files stay the single source.
- Brand tokens mirror `app/globals.css`: paper `#f4f1e9`, ink `#0b0b0b`,
  brand `#ff4f00`, active `#ffd60a`, shipped `#2fe06f`, failed `#ff3b30`,
  muted text `#57524a`.

## Storyboard

| Frames (s)   | Scene | Content |
|--------------|-------|---------|
| 0–90 (0–3)   | Hook | Ink background. Mono text types "I'll ship it this weekend." An orange strike-through line draws across it; caption "— you, for the 14th time". |
| 90–180 (3–6) | Headline | Hard cut to paper. "Stop saying you're going to ship it." in Archivo Black; the orange highlight bar swipes in under "ship it." |
| 180–300 (6–10) | 01 Make the promise | Step label "01 — Make the promise". Challenge card springs in; title types "Ship my landing page by Friday." |
| 300–420 (10–14) | 02 Share the page | Step label "02 — Share the page". URL `shipit.xylolabs.space/c/ship-my-landing-page` shown; countdown accelerates from `2d 14h 00m` to `0d 00h 03m`; "watcher" dots pop in around the card. |
| 420–540 (14–18) | 03 Ship it — or don't | Green SHIPPED stamp slams onto the card (scale spring + shake). Brief red FAILED TO SHIP flash (~15 frames), then "Permanently. Publicly." |
| 540–720 (18–24) | Outro | Logo, "Make a public promise. Set a deadline. Ship.", large `shipit.xylolabs.space`, footer "Free. Public by default. No moving the deadline." |

## Motion language

Hard cuts and spring snaps, not soft fades. 2px ink borders and hard offset
shadows (neo-brutalist, as on the site). One component per scene, sequenced
with `<Series>` so scenes can be retimed or rewritten independently.

## Verification

- `tsc` passes in `video/`; root `pnpm lint` and `tsc` still pass.
- Render the MP4; extract a still from the middle of every scene and inspect
  it for layout, overflow and legibility.
- Confirm duration, resolution and codec with ffprobe (or Remotion's output).
