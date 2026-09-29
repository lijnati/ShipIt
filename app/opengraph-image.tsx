import { brandCard, ogSize, renderOgCard } from "@/lib/og";

// Site-wide default preview (landing page, profiles, anything without its own).
export const alt = "ShipIt — Stop saying you're going to ship it.";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return renderOgCard(brandCard);
}
