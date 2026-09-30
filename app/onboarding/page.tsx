import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser, type User as ClerkUser } from "@clerk/nextjs/server";
import { UsernameForm } from "@/app/onboarding/username-form";
import { requireShipItUser } from "@/lib/auth";
import { routes } from "@/lib/site";
import { USERNAME_MAX_LENGTH, validateUsername } from "@/lib/username";

export const metadata: Metadata = { title: "Pick your username", robots: { index: false, follow: false } };

export default async function OnboardingPage() {
  const user = await requireShipItUser();
  if (user.username) redirect(routes.dashboard);

  const clerkUser = await currentUser();
  // A Phase 2 username that couldn't move to the database (someone owns it now).
  const lostLegacyUsername = clerkUser?.publicMetadata.username ?? null;

  return (
    <section className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-20">
      <p className="mb-6 inline-block border-2 border-foreground bg-card px-2 py-1 font-mono text-xs tracking-wide uppercase">
        <span className="text-brand">●</span> Step 1 of 1
      </p>
      <h1 className="font-heading text-5xl leading-[0.95] font-black tracking-tighter text-balance sm:text-6xl">
        Pick your internet identity.
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        This becomes your public ShipIt profile URL. Every promise you make —
        and every one you break — lives there.
      </p>

      {lostLegacyUsername && (
        <p
          role="status"
          className="mt-6 border-2 border-foreground bg-active px-4 py-3 font-mono text-sm"
        >
          We couldn&apos;t keep <strong>@{lostLegacyUsername}</strong> for you —
          it belongs to someone else now. Pick a new one.
        </p>
      )}

      <div className="mt-10 border-2 border-foreground bg-card p-5 shadow-brutal-lg sm:p-8">
        <UsernameForm
          suggestion={
            clerkUser && !lostLegacyUsername ? suggestUsername(clerkUser) : ""
          }
        />
      </div>
    </section>
  );
}

/** Best-effort prefill from what Clerk already knows. Empty if nothing valid. */
function suggestUsername(user: ClerkUser): string {
  const source =
    user.username ??
    user.primaryEmailAddress?.emailAddress.split("@")[0] ??
    user.firstName ??
    "";
  const candidate = source
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, USERNAME_MAX_LENGTH);
  return validateUsername(candidate).ok ? candidate : "";
}
