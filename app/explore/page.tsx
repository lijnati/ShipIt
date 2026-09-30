import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ChallengeCard } from "@/components/shipit/challenge-card";
import { buttonVariants } from "@/components/ui/button";
import {
  listChallengeCards,
  type ChallengeSort,
  type ChallengeStateFilter,
} from "@/db/queries/challenges";
import { getRequestTime } from "@/lib/request-time";
import { routes } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Explore",
  description: "See what people are actually trying to ship. Recent and popular public promises.",
  alternates: { canonical: routes.explore },
};

const PAGE_SIZE = 24;
const MAX_PAGE = 50;

const sorts: { value: ChallengeSort; label: string }[] = [
  { value: "recent", label: "Recent" },
  { value: "popular", label: "Popular" },
];

const stateFilters: { value: ChallengeStateFilter | null; label: string }[] = [
  { value: null, label: "All" },
  { value: "active", label: "Active" },
  { value: "shipped", label: "Shipped" },
  { value: "failed", label: "Failed" },
];

type View = { sort: ChallengeSort; state: ChallengeStateFilter | null; page: number };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Unknown or malformed params fall back to defaults rather than erroring. */
function parseView(params: Record<string, string | string[] | undefined>): View {
  const sort = first(params.sort) === "popular" ? "popular" : "recent";
  const rawState = first(params.state);
  const state = stateFilters.find((f) => f.value !== null && f.value === rawState)?.value ?? null;
  const page = Number.parseInt(first(params.page) ?? "1", 10);
  return { sort, state, page: Number.isFinite(page) ? Math.min(Math.max(page, 1), MAX_PAGE) : 1 };
}

function hrefFor({ sort, state, page }: View): string {
  const params = new URLSearchParams();
  if (sort !== "recent") params.set("sort", sort);
  if (state) params.set("state", state);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${routes.explore}?${query}` : routes.explore;
}

export default async function ExplorePage({ searchParams }: PageProps<"/explore">) {
  const view = parseView(await searchParams);
  // One extra row tells us whether there's a next page.
  const rows = await listChallengeCards({
    sort: view.sort,
    state: view.state ?? undefined,
    limit: PAGE_SIZE + 1,
    offset: (view.page - 1) * PAGE_SIZE,
  });
  const challenges = rows.slice(0, PAGE_SIZE);
  const hasNext = rows.length > PAGE_SIZE && view.page < MAX_PAGE;
  const serverNow = getRequestTime();

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
      <h1 className="font-heading text-5xl leading-[0.95] font-black tracking-tighter sm:text-6xl">
        Explore
      </h1>
      <p className="mt-3 text-lg text-muted-foreground">
        See what people are actually trying to ship.
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterLinks
          label="Sort"
          items={sorts.map((s) => ({
            label: s.label,
            href: hrefFor({ ...view, sort: s.value, page: 1 }),
            current: s.value === view.sort,
          }))}
          size="lg"
        />
        <FilterLinks
          label="Filter by status"
          items={stateFilters.map((f) => ({
            label: f.label,
            href: hrefFor({ ...view, state: f.value, page: 1 }),
            current: f.value === view.state,
          }))}
          size="sm"
        />
      </div>

      {view.sort === "popular" && (
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          Most reactions on promises made in the last 30 days. That&apos;s the whole algorithm.
        </p>
      )}

      {challenges.length > 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge) => (
            <li key={challenge.slug} className="flex">
              <ChallengeCard challenge={challenge} serverNow={serverNow} className="w-full" />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState view={view} />
      )}

      {(view.page > 1 || hasNext) && (
        <nav aria-label="Pagination" className="mt-10 flex justify-between gap-4">
          {view.page > 1 ? (
            <Link
              href={hrefFor({ ...view, page: view.page - 1 })}
              className={buttonVariants({ variant: "paper", size: "lg" })}
            >
              <ArrowLeft aria-hidden="true" />
              {view.sort === "recent" ? "Newer" : "Previous"}
            </Link>
          ) : (
            <span />
          )}
          {hasNext && (
            <Link
              href={hrefFor({ ...view, page: view.page + 1 })}
              className={buttonVariants({ variant: "paper", size: "lg" })}
            >
              {view.sort === "recent" ? "Older" : "Next"}
              <ArrowRight aria-hidden="true" />
            </Link>
          )}
        </nav>
      )}
    </section>
  );
}

function FilterLinks({
  label,
  items,
  size,
}: {
  label: string;
  items: { label: string; href: string; current: boolean }[];
  size: "sm" | "lg";
}) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.label}>
            <Link
              href={item.href}
              aria-current={item.current ? "page" : undefined}
              className={cn(
                "inline-block border-2 border-foreground font-mono font-bold uppercase",
                size === "lg" ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs",
                item.current ? "bg-foreground text-background" : "bg-card hover:bg-secondary",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function EmptyState({ view }: { view: View }) {
  const filtered = view.state !== null || view.page > 1;
  const popular = view.sort === "popular";

  return (
    <div className="mt-8 border-2 border-dashed border-foreground bg-card px-6 py-12 text-center">
      <p className="font-heading text-3xl font-black tracking-tight">
        {popular && !filtered ? "No one has earned internet approval yet." : "Nothing here yet."}
      </p>
      <p className="mt-2 text-lg text-muted-foreground">
        {popular && !filtered
          ? "React to a promise and it could be the first one here."
          : "Someone has to make the first bad decision."}
      </p>
      <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
        {popular || filtered ? (
          <Link
            href={hrefFor({ sort: "recent", state: null, page: 1 })}
            className={buttonVariants({ variant: "paper", size: "xl" })}
          >
            See recent promises
          </Link>
        ) : null}
        <Link href={routes.newChallenge} className={buttonVariants({ variant: "brand", size: "xl" })}>
          Make a promise
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
