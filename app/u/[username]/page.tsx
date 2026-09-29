import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Avatar } from "@/components/shipit/avatar";
import { ChallengeCard } from "@/components/shipit/challenge-card";
import { getChallengesByUserId } from "@/db/queries/challenges";
import { getUserByUsername } from "@/db/queries/users";
import { toChallengeCard } from "@/lib/challenge-card";
import { getChallengeState } from "@/lib/challenge-status";
import { getRequestTime } from "@/lib/request-time";
import { profilePath, siteConfig } from "@/lib/site";
import { validateUsername } from "@/lib/username";

// Shared by generateMetadata and the page so the lookup runs once per request.
const findProfile = cache(async (param: string) => {
  const result = validateUsername(decodeURIComponent(param));
  if (!result.ok) return null;
  const user = await getUserByUsername(result.username);
  return user?.username ? { ...user, username: user.username } : null;
});

// Shared by generateMetadata and the page (one query per request).
const listChallenges = cache((userId: string) => getChallengesByUserId(userId));

const joinedFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export async function generateMetadata({
  params,
}: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  const user = await findProfile(username);
  if (!user) return { title: "Profile not found", robots: { index: false } };

  const challenges = await listChallenges(user.id);
  const now = getRequestTime();
  const counts = { SHIPPED: 0, FAILED: 0, ACTIVE: 0 };
  for (const c of challenges) counts[getChallengeState(c, now)]++;

  const title = `@${user.username} on ShipIt`;
  const promises = `${challenges.length} ${challenges.length === 1 ? "promise" : "promises"}`;
  const description =
    challenges.length === 0
      ? `@${user.username} hasn't made a public promise yet.`
      : `Public shipping record: ${promises}, ${counts.SHIPPED} shipped, ${counts.FAILED} missed.`;
  const path = profilePath(user.username);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    // Setting openGraph here drops the inherited site image, so point at it explicitly.
    openGraph: {
      type: "profile",
      url: path,
      siteName: siteConfig.name,
      title,
      description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "ShipIt" }],
    },
    twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] },
  };
}

export default async function ProfilePage({ params }: PageProps<"/u/[username]">) {
  const { username } = await params;
  const user = await findProfile(username);
  if (!user) notFound();

  const challenges = await listChallenges(user.id);
  // Only public fields reach the cards.
  const creator = { username: user.username, avatarUrl: user.avatarUrl };
  const serverNow = getRequestTime();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="flex items-center gap-4">
        <Avatar
          username={user.username}
          avatarUrl={user.avatarUrl}
          size={64}
          className="shadow-brutal"
        />
        <div>
          <h1 className="font-heading text-4xl font-black tracking-tighter sm:text-5xl">
            @{user.username}
          </h1>
          {user.displayName && <p className="text-muted-foreground">{user.displayName}</p>}
        </div>
      </div>

      <p className="mt-8 font-mono text-sm font-bold">
        {challenges.length} public {challenges.length === 1 ? "promise" : "promises"}
      </p>

      {challenges.length === 0 ? (
        <p className="mt-4 border-2 border-dashed border-foreground/40 px-4 py-6 font-mono text-sm">
          No shipping history yet.
        </p>
      ) : (
        <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge) => (
            <li key={challenge.slug} className="flex">
              <ChallengeCard
                challenge={toChallengeCard(challenge, creator)}
                serverNow={serverNow}
                className="w-full"
              />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-10 font-mono text-xs text-muted-foreground">
        On ShipIt since {joinedFormatter.format(user.createdAt)}
      </p>
    </section>
  );
}
