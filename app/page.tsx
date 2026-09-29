import { Hero } from "@/components/shipit/hero";
import { ShipLog } from "@/components/shipit/ship-log";
import { HowItWorks } from "@/components/shipit/how-it-works";
import { RecentChallenges } from "@/components/shipit/recent-challenges";
import { FinalCta } from "@/components/shipit/final-cta";

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
