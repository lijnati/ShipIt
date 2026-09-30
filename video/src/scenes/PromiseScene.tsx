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
