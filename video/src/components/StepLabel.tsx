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
