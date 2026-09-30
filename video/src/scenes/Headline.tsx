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
