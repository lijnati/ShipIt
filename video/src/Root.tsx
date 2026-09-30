import { Composition } from "remotion";
import "./fonts";
import { LaunchVideo } from "./LaunchVideo";
import { TOTAL_FRAMES, VIDEO } from "./theme";

export function Root() {
  return (
    <Composition
      id="ShipItLaunch"
      component={LaunchVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  );
}
