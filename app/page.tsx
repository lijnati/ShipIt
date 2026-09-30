import type { Metadata } from "next";
import { Hero } from "@/components/shipit/hero";
import { ShipLog } from "@/components/shipit/ship-log";
import { HowItWorks } from "@/components/shipit/how-it-works";
import { RecentChallenges } from "@/components/shipit/recent-challenges";
import { FinalCta } from "@/components/shipit/final-cta";
import { getRecentChallenges } from "@/db/queries/challenges";
import type { ChallengeCardData } from "@/lib/challenge-card";
import { getRequestTime } from "@/lib/request-time";

// Canonical is set per page (not in the layout) so children don't inherit "/".
export const metadata: Metadata = { alternates: { canonical: "/" } };

// Static page, refreshed at most once a minute: one cheap query, not one per visit.
export const revalidate = 60;

async function loadRecent(): Promise<ChallengeCardData[]> {
  try {
    const rows = await getRecentChallenges(6);
    return rows.map((c) => ({
      slug: c.slug,
      title: c.title,
      deadline: c.deadline.toISOString(),
      status: c.status,
      shippedAt: c.shippedAt?.toISOString() ?? null,
      creator: c.creator,
    }));
  } catch (error) {
    // The landing page must never go down with the database; show the empty state.
    console.error("[home] recent challenges unavailable", error);
    return [];
  }
}

export default async function Home() {
  const recent = await loadRecent();
  const now = getRequestTime();

  return (
    <>
      <Hero />
      <ShipLog challenges={recent} now={now} />
      <HowItWorks />
      <RecentChallenges challenges={recent} serverNow={now} />
      <FinalCta />
    </>
  );
}
