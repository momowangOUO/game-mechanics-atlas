import type { MetadataRoute } from "next";
import { canonicalUrl, publicContentPaths } from "@/lib/seo";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  // Omit lastModified rather than treating each build as a content revision.
  return publicContentPaths().map((path) => ({ url: canonicalUrl(path) }));
}
