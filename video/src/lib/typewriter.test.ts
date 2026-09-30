import { describe, expect, it } from "vitest";
import { caretVisible, typedText } from "./typewriter";

describe("typedText", () => {
  it("is empty before the start frame", () => {
    expect(typedText("hello", 3, 1, 5)).toBe("");
  });
  it("reveals characters at the given rate", () => {
    expect(typedText("hello", 7, 1, 5)).toBe("he");
  });
  it("never exceeds the full text", () => {
    expect(typedText("hello", 500, 1)).toBe("hello");
  });
  it("counts astral characters as one", () => {
    expect(typedText("a🚀b", 2, 1)).toBe("a🚀");
  });
});

describe("caretVisible", () => {
  it("blinks every 15 frames", () => {
    expect(caretVisible(0)).toBe(true);
    expect(caretVisible(15)).toBe(false);
    expect(caretVisible(30)).toBe(true);
  });
});
