import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getUserByUsername } from "@/db/queries/users";
import { validateUsername } from "@/lib/username";

// Shared by generateMetadata and the page so the lookup runs once per request.
const findProfile = cache(async (param: string) => {
  const result = validateUsername(decodeURIComponent(param));
  if (!result.ok) return null;
  return getUserByUsername(result.username);
});

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
  return { title: user?.username ? `@${user.username}` : "Profile not found" };
}

export default async function ProfilePage({ params }: PageProps<"/u/[username]">) {
  const { username } = await params;
  const user = await findProfile(username);
  if (!user?.username) notFound();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="grid size-16 place-items-center border-2 border-foreground bg-brand font-mono text-2xl font-bold uppercase shadow-brutal"
        >
          {user.username.charAt(0)}
        </span>
        <div>
          <h1 className="font-heading text-4xl font-black tracking-tighter sm:text-5xl">
            @{user.username}
          </h1>
          {user.displayName && (
            <p className="text-muted-foreground">{user.displayName}</p>
          )}
        </div>
      </div>

      <p className="mt-10 border-2 border-dashed border-foreground/40 px-4 py-6 font-mono text-sm">
        No shipping history yet.
      </p>
      <p className="mt-4 font-mono text-xs text-muted-foreground">
        On ShipIt since {joinedFormatter.format(user.createdAt)}
      </p>
    </section>
  );
}
