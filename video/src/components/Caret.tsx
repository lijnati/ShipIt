import { useCurrentFrame } from "remotion";
import { caretVisible } from "../lib/typewriter";

/** Solid block caret; steady while typing, blinking once `blink` is set. */
export function Caret({ color, blink = false }: { color: string; blink?: boolean }) {
  const frame = useCurrentFrame();
  return (
    <span
      style={{
        display: "inline-block",
        width: "0.5em",
        height: "0.85em",
        marginLeft: "0.08em",
        verticalAlign: "-0.08em",
        backgroundColor: color,
        opacity: !blink || caretVisible(frame) ? 1 : 0,
      }}
    />
  );
}
