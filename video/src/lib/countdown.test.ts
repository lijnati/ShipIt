import { describe, expect, it } from "vitest";
import {
  COUNTDOWN_END_MINUTES,
  COUNTDOWN_START_MINUTES,
  formatCountdown,
  minutesRemaining,
} from "./countdown";

describe("formatCountdown", () => {
  it("formats the start value", () => {
    expect(formatCountdown(COUNTDOWN_START_MINUTES)).toBe("2d 14h 00m");
  });
  it("formats the end value", () => {
    expect(formatCountdown(COUNTDOWN_END_MINUTES)).toBe("0d 00h 03m");
  });
  it("clamps negatives to zero", () => {
    expect(formatCountdown(-5)).toBe("0d 00h 00m");
  });
  it("floors fractional minutes", () => {
    expect(formatCountdown(61.9)).toBe("0d 01h 01m");
  });
});

describe("minutesRemaining", () => {
  it("starts at 2d 14h", () => {
    expect(minutesRemaining(0)).toBe(3720);
  });
  it("ends at 3 minutes", () => {
    expect(minutesRemaining(1)).toBe(3);
  });
  it("clamps progress outside 0..1", () => {
    expect(minutesRemaining(-1)).toBe(3720);
    expect(minutesRemaining(2)).toBe(3);
  });
  it("never counts back up", () => {
    let previous = Infinity;
    for (let i = 0; i <= 100; i++) {
      const minutes = minutesRemaining(i / 100);
      expect(minutes).toBeLessThanOrEqual(previous);
      previous = minutes;
    }
  });
  it("accelerates: the second half covers more time than the first", () => {
    const firstHalf = minutesRemaining(0) - minutesRemaining(0.5);
    const secondHalf = minutesRemaining(0.5) - minutesRemaining(1);
    expect(secondHalf).toBeGreaterThan(firstHalf);
  });
});
