import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { requireUsername } from "@/lib/auth";
import { routes, siteConfig } from "@/lib/site";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { username } = await requireUsername();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
      <p className="font-mono text-sm font-bold">Welcome back, @{username}.</p>
      <h1 className="mt-4 max-w-3xl font-heading text-5xl leading-[0.95] font-black tracking-tighter text-balance sm:text-6xl">
        Your shipping record starts here.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        No promises yet. A suspiciously clean record.
      </p>
      <p className="mt-6 font-mono text-sm text-muted-foreground">
        Public profile:{" "}
        <Link
          href={`/u/${username}`}
          className="text-foreground underline underline-offset-4"
        >
          {siteConfig.domain}/u/{username}
        </Link>
      </p>
      <Link
        href={routes.newChallenge}
        className={`${buttonVariants({ variant: "brand", size: "xl" })} mt-8`}
      >
        Make your first promise
        <ArrowRight aria-hidden="true" />
      </Link>
    </section>
  );
}
