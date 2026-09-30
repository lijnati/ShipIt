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
