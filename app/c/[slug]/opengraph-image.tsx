import { getChallengeBySlug } from "@/db/queries/challenges";
import { getChallengeState } from "@/lib/challenge-status";
import { brandCard, ogSize, renderOgCard, type OgCard } from "@/lib/og";
import { getOgLabels } from "@/lib/share";

export const alt = "A public ShipIt promise";
export const size = ogSize;
export const contentType = "image/png";
// State and "time left" are a request-time snapshot; don't cache at build.
export const dynamic = "force-dynamic";

// Short CDN cache: previews stay cheap but pick up SHIPPED/FAILED quickly.
const headers = { "Cache-Control": "public, max-age=300, s-maxage=300" };

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderOgCard(await loadCard(slug), headers);
}

async function loadCard(slug: string): Promise<OgCard> {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 80) return brandCard;
  try {
    const challenge = await getChallengeBySlug(slug);
    const username = challenge?.user.username;
    if (!challenge || !username) return brandCard;

    // Server time: a snapshot, never a live countdown.
    const now = Date.now();
    const state = getChallengeState(challenge, now);
    const labels = getOgLabels({ ...challenge, username }, state, now);
    // Only public fields make it onto the image.
    return { state, username, title: challenge.title, ...labels };
  } catch (error) {
    // A preview must never 500; fall back to the generic card.
    console.error("[og] challenge image failed", error);
    return brandCard;
  }
}
