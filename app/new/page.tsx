import type { Metadata } from "next";
import { ChallengeForm } from "@/app/new/challenge-form";
import { requireUsername } from "@/lib/auth";

export const metadata: Metadata = { title: "New challenge" };

export default async function NewChallengePage() {
  // The main CTA lands here; signed-out visitors are almost always new.
  const { username } = await requireUsername({ signedOut: "sign-up" });

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-20">
      <p className="mb-6 inline-block border-2 border-foreground bg-card px-2 py-1 font-mono text-xs tracking-wide uppercase">
        <span className="text-brand">●</span> @{username} is about to promise
      </p>
      <h1 className="font-heading text-5xl leading-[0.95] font-black tracking-tighter text-balance sm:text-6xl">
        Put your reputation on the line.
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Say what you&apos;ll ship. Pick a deadline. We&apos;ll remember.
      </p>

      <div className="mt-10 border-2 border-foreground bg-background p-5 shadow-brutal-lg sm:p-8">
        <ChallengeForm />
      </div>
    </section>
  );
}
