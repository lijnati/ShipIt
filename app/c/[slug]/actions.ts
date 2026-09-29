"use server";

import { revalidatePath } from "next/cache";
import type { User } from "@/db/schema";
import { shipChallenge, type ShipOutcome } from "@/db/queries/challenges";
import { getCurrentShipItUser } from "@/lib/auth";
import { normalizeWebUrl } from "@/lib/challenge";

export type ShipState = { error: string | null; shipped: boolean };

const FAILED: ShipState = {
  error: "Couldn't save that. Your promise is still active — try again in a moment.",
  shipped: false,
};

const messages: Record<Exclude<ShipOutcome, "shipped">, string> = {
  "too-late": "Too late. The deadline already passed.",
  "already-shipped": "Already shipped. Once is enough.",
  // Same message for both: don't reveal whether a slug exists to non-owners.
  "not-owner": "You can only ship your own promises.",
  "not-found": "You can only ship your own promises.",
};

const field = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
};

export async function shipIt(_prev: ShipState, formData: FormData): Promise<ShipState> {
  // The slug only says *which* challenge; ownership is checked server-side.
  const slug = field(formData, "slug");
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return { error: messages["not-found"], shipped: false };

  const proofUrl = normalizeWebUrl(field(formData, "proofUrl"));
  if (proofUrl === false) {
    return {
      error: "That proof link doesn't look like a web link. Use http(s), e.g. myapp.com.",
      shipped: false,
    };
  }

  // Identity always comes from the Clerk session, never the form.
  let user: User | null;
  try {
    user = await getCurrentShipItUser();
  } catch (error) {
    console.error("[ship] resolving user failed", error);
    return FAILED;
  }
  if (!user) return { error: "Sign in to ship your promise.", shipped: false };

  let outcome: ShipOutcome;
  try {
    outcome = await shipChallenge(slug, user.id, proofUrl);
  } catch (error) {
    console.error("[ship] update failed", error);
    return FAILED;
  }

  // Refresh the page either way so it shows the true state (shipped, or failed).
  revalidatePath(`/c/${slug}`);
  if (outcome === "shipped") return { error: null, shipped: true };
  return { error: messages[outcome], shipped: false };
}
