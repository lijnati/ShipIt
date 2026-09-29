import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { LocalDateTime } from "@/components/shipit/local-date-time";
import { buttonVariants } from "@/components/ui/button";
import { getChallengesByUserId } from "@/db/queries/challenges";
import { requireUsername } from "@/lib/auth";
import { routes, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUsername();
  // Scoped to the session's own user id — never a parameter.
  const challenges = await getChallengesByUserId(user.id);

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
      <p className="font-mono text-sm font-bold">Welcome back, @{user.username}.</p>
      <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-heading text-5xl leading-[0.95] font-black tracking-tighter">
          Your challenges
        </h1>
        {challenges.length > 0 && (
          <Link href={routes.newChallenge} className={buttonVariants({ variant: "ink", size: "lg" })}>
            <Plus aria-hidden="true" />
            New challenge
          </Link>
        )}
      </div>

      {challenges.length === 0 ? (
        <div className="mt-10 border-2 border-dashed border-foreground px-6 py-12 text-center">
          <p className="font-heading text-3xl font-black tracking-tight">
            You&apos;ve made zero public promises.
          </p>
          <p className="mt-2 text-lg text-muted-foreground">Very safe of you.</p>
          <Link
            href={routes.newChallenge}
            className={cn(buttonVariants({ variant: "brand", size: "xl" }), "mt-8")}
          >
            Make one
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <ul className="mt-10 border-2 border-foreground bg-card shadow-brutal">
          {challenges.map((challenge) => {
            const shipped = challenge.status === "shipped";
            return (
              <li key={challenge.slug} className="border-foreground not-last:border-b-2">
                <Link
                  href={`/c/${challenge.slug}`}
                  className="flex flex-col gap-2 px-4 py-4 hover:bg-secondary focus-visible:bg-secondary sm:flex-row sm:items-center sm:gap-4 sm:px-5"
                >
                  <span
                    className={cn(
                      "w-fit shrink-0 border-2 border-foreground px-2 py-0.5 font-mono text-xs font-bold tracking-wider uppercase",
                      shipped ? "bg-shipped" : "bg-active",
                    )}
                  >
                    {shipped ? "Shipped" : "Active"}
                  </span>
                  <span className="min-w-0 flex-1 font-heading text-lg font-extrabold tracking-tight break-words">
                    {challenge.title}
                  </span>
                  <span className="shrink-0 font-mono text-sm text-muted-foreground">
                    <LocalDateTime value={challenge.deadline.toISOString()} format="date" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-10 font-mono text-sm text-muted-foreground">
        Public profile:{" "}
        <Link href={`/u/${user.username}`} className="text-foreground underline underline-offset-4">
          {siteConfig.domain}/u/{user.username}
        </Link>
      </p>
    </section>
  );
}
