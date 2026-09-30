/** 2d 14h, matching the landing page's example card. */
export const COUNTDOWN_START_MINUTES = (2 * 24 + 14) * 60;
export const COUNTDOWN_END_MINUTES = 3;

/** Minutes left at `progress` (0..1, clamped), easing in so the clock speeds up. */
export function minutesRemaining(progress: number): number {
  const t = Math.min(1, Math.max(0, progress));
  const eased = t * t * t;
  return Math.round(
    COUNTDOWN_START_MINUTES - (COUNTDOWN_START_MINUTES - COUNTDOWN_END_MINUTES) * eased,
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

/** "2d 14h 00m". Negative input reads as zero. */
export function formatCountdown(totalMinutes: number): string {
  const minutes = Math.max(0, Math.floor(totalMinutes));
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  return `${days}d ${pad(hours)}h ${pad(minutes % 60)}m`;
}
