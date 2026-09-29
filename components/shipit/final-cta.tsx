import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export function FinalCta() {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="border-2 border-foreground bg-foreground px-6 py-12 text-background shadow-brutal-lg sm:px-12 sm:py-16">
        <p className="font-mono text-xs tracking-wide text-brand uppercase">
          {"// last chance to stay comfortable"}
        </p>
        <h2
          id="final-cta-title"
          className="mt-4 max-w-3xl font-heading text-4xl leading-[0.95] font-black tracking-tighter text-balance sm:text-6xl"
        >
          Your side project isn&apos;t going to ship itself.
        </h2>
        <p className="mt-6 max-w-xl text-lg opacity-75">
          Pick the thing. Pick the date. Let a few strangers keep you honest.
        </p>
        <Link
          href={siteConfig.ctaHref}
          className={cn(
            buttonVariants({ variant: "brand", size: "xl" }),
            "mt-8 shadow-[4px_4px_0_0_var(--background)]! hover:shadow-[8px_8px_0_0_var(--background)]! active:shadow-none!",
          )}
        >
          Put my reputation on the line
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
