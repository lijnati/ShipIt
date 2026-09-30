import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/db/queries/challenges";
import { absoluteUrl, challengePath, profilePath } from "@/lib/site";

// Regenerated at most hourly; public pages only.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
  ];

  try {
    const { challenges, profiles } = await getSitemapEntries();
    for (const c of challenges) {
      entries.push({ url: absoluteUrl(challengePath(c.slug)), lastModified: c.updatedAt });
    }
    for (const p of profiles) {
      if (p.username) {
        entries.push({ url: absoluteUrl(profilePath(p.username)), lastModified: p.updatedAt });
      }
    }
  } catch (error) {
    // A sitemap with just the home page beats a failed one.
    console.error("[sitemap] database unavailable", error);
  }

  return entries;
}
