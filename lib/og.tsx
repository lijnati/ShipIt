import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { ChallengeState } from "@/lib/challenge-status";
import { siteConfig } from "@/lib/site";

export const ogSize = { width: 1200, height: 630 };

// Mirrors the tokens in app/globals.css (Satori can't read CSS variables).
const ink = "#0b0b0b";
const paper = "#f4f1e9";
const muted = "#57524a";
const colors: Record<ChallengeState | "BRAND", string> = {
  ACTIVE: "#ffd60a",
  SHIPPED: "#2fe06f",
  FAILED: "#ff3b30",
  BRAND: "#ff4f00",
};

// Bundled font files (assets/fonts, OFL): no network fetches at render time.
const fonts = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Archivo-Black.woff")),
  readFile(join(process.cwd(), "assets/fonts/JetBrainsMono-Bold.woff")),
]);

export type OgCard = {
  state: ChallengeState | "BRAND";
  /** Omitted on the generic card. */
  username?: string;
  kicker: string;
  title: string;
  status: string;
};

/** The generic ShipIt card: site default and fallback for missing challenges. */
export const brandCard: OgCard = {
  state: "BRAND",
  kicker: "Public promises. Real deadlines.",
  title: "Stop saying you're going to ship it.",
  status: "Make it public",
};

function titleSize(title: string): number {
  if (title.length <= 28) return 96;
  if (title.length <= 50) return 78;
  if (title.length <= 80) return 62;
  return 52;
}

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

export async function renderOgCard(card: OgCard, headers?: HeadersInit): Promise<ImageResponse> {
  const [archivo, mono] = await fonts;
  const title = truncate(card.title, 110);
  const failed = card.state === "FAILED";
  const quoted = card.state !== "BRAND";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: paper,
          border: `16px solid ${ink}`,
          padding: "44px 56px 52px",
          color: ink,
          fontFamily: "JetBrains Mono",
        }}
      >
        {/* Top bar: logo + domain */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                background: colors.BRAND,
                border: `5px solid ${ink}`,
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24">
                <path d="M12 3 L21 13 H15 V21 H9 V13 H3 Z" fill={ink} />
              </svg>
            </div>
            <div style={{ fontFamily: "Archivo", fontSize: 44, letterSpacing: -1 }}>SHIPIT</div>
          </div>
          <div style={{ fontSize: 26, color: muted }}>{siteConfig.domain}</div>
        </div>

        {/* Who + what */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, fontSize: 32 }}>
            {card.username && <span>@{card.username}</span>}
            <span style={{ color: muted, textTransform: "uppercase", letterSpacing: 2 }}>
              {card.kicker}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Archivo",
              fontSize: titleSize(title),
              lineHeight: 1.02,
              letterSpacing: -2,
              color: failed ? muted : ink,
              textDecoration: failed ? "line-through" : "none",
              wordBreak: "break-word",
            }}
          >
            {quoted ? `“${title}”` : title}
          </div>
        </div>

        {/* Status block */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              background: colors[card.state],
              border: `6px solid ${ink}`,
              boxShadow: `10px 10px 0 0 ${ink}`,
              padding: "14px 28px",
              fontFamily: "Archivo",
              fontSize: 48,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {card.status}
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Archivo", data: archivo, weight: 900, style: "normal" },
        { name: "JetBrains Mono", data: mono, weight: 700, style: "normal" },
      ],
      headers,
    },
  );
}
