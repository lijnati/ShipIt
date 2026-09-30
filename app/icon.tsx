import { ImageResponse } from "next/og";

// The ShipIt mark (same as the logo and OG cards): orange square, ink arrow.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ff4f00",
          border: "3px solid #0b0b0b",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M12 3 L21 13 H15 V21 H9 V13 H3 Z" fill="#0b0b0b" />
        </svg>
      </div>
    ),
    size,
  );
}
