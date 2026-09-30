import { AbsoluteFill, Audio, getStaticFiles, interpolate, Series, staticFile, useVideoConfig } from "remotion";
import { Headline } from "./scenes/Headline";
import { Hook } from "./scenes/Hook";
import { Outcome } from "./scenes/Outcome";
import { Outro } from "./scenes/Outro";
import { PromiseScene } from "./scenes/PromiseScene";
import { Share } from "./scenes/Share";
import { colors, SCENE_FRAMES } from "./theme";

export function LaunchVideo() {
  const { durationInFrames, fps } = useVideoConfig();
  // Read public/ at render time so an added or removed track is never stale.
  const hasMusic = getStaticFiles().some((file) => file.name === "music.mp3");

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
