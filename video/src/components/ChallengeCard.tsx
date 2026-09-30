import type { CSSProperties, ReactNode } from "react";
import { colors, DEMO, fonts, hardShadow } from "../theme";
import { Caret } from "./Caret";

export type CardState = "ACTIVE" | "SHIPPED" | "FAILED";

const stateStyles: Record<CardState, { label: string; color: string }> = {
  ACTIVE: { label: "Active", color: colors.active },
  SHIPPED: { label: "Shipped", color: colors.shipped },
  FAILED: { label: "Failed", color: colors.failed },
};

const border = `4px solid ${colors.ink}`;

type ChallengeCardProps = {
  title: string;
  state: CardState;
  footer: ReactNode;
  /** Show a typing caret after the title. */
  caret?: boolean;
  style?: CSSProperties;
};

/** Video-sized copy of components/shipit/challenge-card.tsx. */
export function ChallengeCard({ title, state, footer, caret = false, style }: ChallengeCardProps) {
  const s = stateStyles[state];
  const failed = state === "FAILED";

  return (
    <div
      style={{
        width: 1040,
        backgroundColor: colors.card,
        border,
        boxShadow: hardShadow(16),
        color: colors.ink,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: border,
          padding: "18px 28px",
          fontFamily: fonts.mono,
          fontWeight: 700,
          fontSize: 26,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: colors.ink,
            color: colors.paper,
            padding: "6px 14px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          <span style={{ width: 14, height: 14, backgroundColor: s.color }} />
          {s.label}
        </span>
        <span style={{ color: colors.muted }}>/c/{DEMO.slug}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "32px 36px 36px" }}>
        <p
          style={{
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: fonts.mono,
            fontWeight: 700,
            fontSize: 30,
          }}
        >
          <span style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: colors.brand, border }} />
          @{DEMO.username}
          <span style={{ color: colors.muted }}>promised to</span>
        </p>

        <h2
          style={{
            margin: 0,
            minHeight: "2.2em",
            fontFamily: fonts.heading,
            fontWeight: 400,
            fontSize: 72,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            color: failed ? colors.muted : colors.ink,
            textDecorationLine: failed ? "line-through" : "none",
            textDecorationColor: colors.failed,
            textDecorationThickness: 8,
          }}
        >
          “{title}
          {caret && <Caret color={colors.brand} />}”
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            border,
            fontFamily: fonts.mono,
            fontWeight: 700,
          }}
        >
          <div style={{ borderRight: border, padding: "12px 18px" }}>
            <div style={{ fontSize: 20, color: colors.muted, textTransform: "uppercase" }}>Deadline</div>
            <div style={{ fontSize: 30 }}>Fri, Oct 2</div>
          </div>
          <div style={{ padding: "12px 18px" }}>
            <div style={{ fontSize: 20, color: colors.muted, textTransform: "uppercase" }}>Time</div>
            <div style={{ fontSize: 30 }}>11:59 PM</div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 14,
          borderTop: border,
          backgroundColor: s.color,
          padding: "20px 28px",
          fontFamily: fonts.mono,
          fontWeight: 700,
        }}
      >
        {footer}
      </div>
    </div>
  );
}

/** Card footer copy: optional small prefix/suffix around a big tabular value. */
export function FooterText({ prefix, big, suffix }: { prefix?: string; big: string; suffix?: string }) {
  return (
    <>
      {prefix && <span style={{ fontSize: 28 }}>{prefix}</span>}
      <span style={{ fontSize: 56, fontVariantNumeric: "tabular-nums" }}>{big}</span>
      {suffix && <span style={{ fontSize: 28 }}>{suffix}</span>}
    </>
  );
}
