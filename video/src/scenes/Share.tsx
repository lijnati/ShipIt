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
