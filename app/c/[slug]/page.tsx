import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowUpRight } from "lucide-react";
import { Avatar } from "@/components/shipit/avatar";
import { LocalDateTime } from "@/components/shipit/local-date-time";
import { buttonVariants } from "@/components/ui/button";
import { getChallengeBySlug } from "@/db/queries/challenges";
import { cn } from "@/lib/utils";

// Shared by generateMetadata and the page so the lookup runs once per request.
const findChallenge = cache(async (slug: string) => {
  // Anything outside the stored slug format can't exist; skip the query.
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 80) return null;
  const challenge = await getChallengeBySlug(slug);
  // A creator without a username can't own challenges, but stay defensive.
  if (!challenge?.user.username) return null;
  return { ...challenge, user: { ...challenge.user, username: challenge.user.username } };
});

export async function generateMetadata({ params }: PageProps<"/c/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const challenge = await findChallenge(slug);
  if (!challenge) return { title: "Promise not found" };
  return {
    title: `@${challenge.user.username} promised: ${challenge.title}`,
    description: `@${challenge.user.username} publicly promised to ship "${challenge.title}". Watch them ship it — or not.`,
  };
}

export default async function ChallengePage({ params }: PageProps<"/c/[slug]">) {
  const { slug } = await params;
  const challenge = await findChallenge(slug);
  if (!challenge) notFound();

  const { user } = challenge;
  const shipped = challenge.status === "shipped";
  const deadline = challenge.deadline.toISOString();

  return (
    <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
      {/* Who */}
      <Link
        href={`/u/${user.username}`}
        className="group inline-flex items-center gap-3 font-mono text-sm tracking-wide uppercase"
      >
        <Avatar username={user.username} avatarUrl={user.avatarUrl} size={40} />
        <span>
          <span className="font-bold underline-offset-4 group-hover:underline">
            {user.displayName ?? `@${user.username}`}
          </span>{" "}
          <span className="text-muted-foreground">promised to ship</span>
        </span>
      </Link>
      {user.displayName && (
        <p className="mt-1 pl-[52px] font-mono text-xs text-muted-foreground">@{user.username}</p>
      )}

      {/* What */}
      <h1 className="mt-8 font-heading text-5xl leading-[0.95] font-black tracking-tighter text-balance break-words sm:text-7xl">
        &ldquo;{challenge.title}&rdquo;
      </h1>

      {/* By when + state */}
      <div className="mt-10 grid border-2 border-foreground bg-card shadow-brutal-lg sm:grid-cols-[1fr_auto]">
        <div className="border-b-2 border-foreground p-5 sm:border-r-2 sm:border-b-0 sm:p-6">
          <p className="font-mono text-xs font-bold tracking-wide text-muted-foreground uppercase">By</p>
          <p className="mt-1 font-heading text-3xl font-black tracking-tight uppercase sm:text-4xl">
            <LocalDateTime value={deadline} format="date" />
          </p>
          <p className="font-mono text-lg font-bold">
            <LocalDateTime value={deadline} format="time" showZone />
          </p>
        </div>
        <div
          className={cn(
            "flex items-center justify-center p-5 font-mono text-2xl font-black tracking-widest uppercase sm:px-10",
            shipped ? "bg-shipped" : "bg-active",
          )}
        >
          <span className="sr-only">Status: </span>
          {shipped ? "Shipped" : "Active"}
        </div>
      </div>

      {/* Details */}
      {challenge.description && (
        // Plain text only: React escapes it; whitespace-pre-line keeps line breaks.
        <blockquote className="mt-10 border-l-4 border-foreground pl-5 text-lg whitespace-pre-line break-words sm:text-xl">
          {challenge.description}
        </blockquote>
      )}

      {challenge.projectUrl && (
        <a
          href={challenge.projectUrl}
          target="_blank"
          rel="noopener noreferrer nofollow ugc"
          className={cn(buttonVariants({ variant: "paper", size: "xl" }), "mt-10")}
        >
          View project
          <ArrowUpRight aria-hidden="true" />
        </a>
      )}

      <p className="mt-12 border-t-2 border-dashed border-foreground/40 pt-4 font-mono text-xs text-muted-foreground">
        Promised publicly on <LocalDateTime value={challenge.createdAt.toISOString()} format="date" />
        {shipped && challenge.shippedAt && (
          <>
            {" "}· shipped <LocalDateTime value={challenge.shippedAt.toISOString()} format="date" />
          </>
        )}
      </p>
    </article>
  );
}
