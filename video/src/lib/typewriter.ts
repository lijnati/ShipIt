/** The prefix of `text` visible at `frame`, typing `charsPerFrame` from `startFrame`. */
export function typedText(
  text: string,
  frame: number,
  charsPerFrame: number,
  startFrame = 0,
): string {
  const chars = Array.from(text);
  const count = Math.floor((frame - startFrame) * charsPerFrame);
  return chars.slice(0, Math.min(Math.max(count, 0), chars.length)).join("");
}

const CARET_BLINK_FRAMES = 15;

export function caretVisible(frame: number): boolean {
  return Math.floor(frame / CARET_BLINK_FRAMES) % 2 === 0;
}
