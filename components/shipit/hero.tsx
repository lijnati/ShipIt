import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ChallengeCard } from "@/components/shipit/challenge-card";
import { featuredChallenge, mockStats } from "@/lib/mock-challenges";
import { siteConfig } from "@/lib/site";

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto grid max-w-6xl gap-12 px-4 pt-12 pb-16 sm:px-6 sm:pt-20 sm:pb-24 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16"
    >
      <div>
        <p className="mb-6 inline-block border-2 border-foreground bg-card px-2 py-1 font-mono text-xs tracking-wide uppercase">
          <span className="text-brand">●</span> Public accountability for
          makers
        </p>

        <h1
          id="hero-title"
          className="font-heading text-5xl leading-[0.95] font-black tracking-tighter text-balance sm:text-6xl lg:text-7xl"
        >
          Stop saying you&apos;re going to{" "}
          <span className="relative inline-block">
            <span className="relative z-10">ship it.</span>
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-[0.08em] h-[0.35em] -rotate-1 bg-brand"
            />
          </span>
        </h1>

        <p className="mt-6 max-w-lg text-lg text-muted-foreground sm:text-xl">
          Make a public promise. Set a deadline. Ship before the internet
          watches you fail.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link
            href={siteConfig.ctaHref}
            className={buttonVariants({ variant: "brand", size: "xl" })}
          >
            Put my reputation on the line
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link
            href="#shipping"
            className={buttonVariants({ variant: "paper", size: "xl" })}
          >
            See who&apos;s shipping
          </Link>
        </div>

        <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3 font-mono text-sm">
          {mockStats.map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-2">
              <dt className="order-2 text-muted-foreground">{stat.label}</dt>
              <dd className="order-1 text-lg font-bold">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mx-auto w-full max-w-md lg:max-w-none">
        <p className="mb-3 truncate font-mono text-xs text-muted-foreground">
          shipit.xylolabs.space/
          <span className="text-foreground">nahtty/contract-reminder-mvp</span>
        </p>
        <ChallengeCard
          challenge={featuredChallenge}
          featured
          className="lg:rotate-1"
        />
        <p className="mt-5 text-right font-mono text-xs text-muted-foreground">
          ↑ this could be you. the clock is not a metaphor.
        </p>
      </div>
    </section>
  );
}
