"use client";

import { useHydrated } from "@/lib/use-hydrated";

type Format = "date" | "time" | "datetime";

const formats: Record<Format, Intl.DateTimeFormatOptions> = {
  date: { month: "short", day: "numeric", year: "numeric" },
  time: { hour: "numeric", minute: "2-digit" },
  datetime: { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" },
};

type LocalDateTimeProps = {
  /** ISO 8601 instant. */
  value: string;
  format?: Format;
  /** Append the timezone abbreviation, e.g. "GMT+3". */
  showZone?: boolean;
  className?: string;
};

/**
 * Renders an instant in the viewer's own timezone. The server can't know that
 * timezone, so it renders UTC (labeled) and the browser swaps in local time.
 */
export function LocalDateTime({
  value,
  format = "datetime",
  showZone = false,
  className,
}: LocalDateTimeProps) {
  const hydrated = useHydrated();
  const labelZone = showZone || (!hydrated && format !== "date");

  const text = new Intl.DateTimeFormat("en-US", {
    ...formats[format],
    timeZone: hydrated ? undefined : "UTC",
    timeZoneName: labelZone ? "short" : undefined,
  }).format(new Date(value));

  return (
    <time dateTime={value} className={className}>
      {text}
    </time>
  );
}
