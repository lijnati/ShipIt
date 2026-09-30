import { ImageResponse } from "next/og";

// Home-screen icon: the ShipIt mark at 180px.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        }}
      >
        <svg width="112" height="112" viewBox="0 0 24 24">
          <path d="M12 3 L21 13 H15 V21 H9 V13 H3 Z" fill="#0b0b0b" />
        </svg>
      </div>
    ),
    size,
  );
}
