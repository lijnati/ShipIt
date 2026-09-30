import type { ReactNode } from "react";
import { colors } from "../theme";

/** The site's tilted orange marker bar under a phrase; `progress` wipes it in. */
export function Highlight({ progress = 1, children }: { progress?: number; children: ReactNode }) {
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span
        style={{
          position: "absolute",
          left: "-0.06em",
          right: "-0.06em",
          bottom: "0.08em",
          height: "0.35em",
          backgroundColor: colors.brand,
          transform: `rotate(-1deg) scaleX(${progress})`,
          transformOrigin: "left center",
        }}
      />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
}
