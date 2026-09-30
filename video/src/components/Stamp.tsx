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
