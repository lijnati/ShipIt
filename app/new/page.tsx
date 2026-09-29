import type { Metadata } from "next";
import { requireUsername } from "@/lib/auth";

export const metadata: Metadata = { title: "New challenge" };

export default async function NewChallengePage() {
  // The main CTA lands here; signed-out visitors are almost always new.
  const { username } = await requireUsername({ signedOut: "sign-up" });

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
      <p className="mb-6 inline-block border-2 border-foreground bg-active px-2 py-1 font-mono text-xs font-bold tracking-wide uppercase">
        Coming next
      </p>
      <h1 className="max-w-3xl font-heading text-5xl leading-[0.95] font-black tracking-tighter text-balance sm:text-6xl">
        Ready to put your reputation on the line?
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted-foreground">
        The promise form isn&apos;t live yet, @{username}. Use the time to
        decide exactly what you&apos;re shipping — and by when.
      </p>
    </section>
  );
}
