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
