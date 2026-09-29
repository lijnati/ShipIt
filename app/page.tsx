import { Hero } from "@/components/shipit/hero";
import { ShipLog } from "@/components/shipit/ship-log";
import { HowItWorks } from "@/components/shipit/how-it-works";
import { RecentChallenges } from "@/components/shipit/recent-challenges";
import { FinalCta } from "@/components/shipit/final-cta";
import type { Metadata } from "next";

// Canonical is set per page (not in the layout) so children don't inherit "/".
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <Hero />
      <ShipLog />
      <HowItWorks />
      <RecentChallenges />
      <FinalCta />
    </>
  );
}
