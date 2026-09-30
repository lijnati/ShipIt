// Copies the brand fonts and logo from the app into video/public, so the brand
// files stay the single source.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const videoDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoDir = join(videoDir, "..");
const publicDir = join(videoDir, "public");

const copies = [
  ["assets/fonts/Archivo-Black.woff", "fonts/Archivo-Black.woff"],
  ["assets/fonts/JetBrainsMono-Bold.woff", "fonts/JetBrainsMono-Bold.woff"],
  ["brand/shipit-logo.png", "shipit-logo.png"],
];

for (const [from, to] of copies) {
  const dest = join(publicDir, to);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(join(repoDir, from), dest);
}

console.log(`[sync-assets] copied ${copies.length} files`);
