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
