import Image from "@/app/c/[slug]/opengraph-image";
import { ogSize } from "@/lib/og";

// Same card for X. Config is repeated because route segment options must be
// declared in the file itself.
export const alt = "A public ShipIt promise";
export const size = ogSize;
export const contentType = "image/png";
export const dynamic = "force-dynamic";

export default Image;
