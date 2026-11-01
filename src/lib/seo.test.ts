import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import sitemap from "@/app/sitemap";
import { dimensions, games, genres, mechanics } from "./knowledge";
import { taxonomyGroups } from "@/data/taxonomy-reference";
import {
  AUTHOR_NAME,
  SITE_URL,
  SOCIAL_IMAGE,
  breadcrumbSchema,
  canonicalUrl,
  indexPageMetadata,
  pageMetadata,
  publicContentPaths,
  serializeJsonLd,
} from "./seo";

describe("public SEO contract", () => {
  it("uses the public Pages subpath once, with canonical directory URLs", () => {
    expect(canonicalUrl()).toBe(`${SITE_URL}/`);
    expect(canonicalUrl("/taxonomy/economy?group=production#top")).toBe(
      `${SITE_URL}/taxonomy/economy/`,
    );
    expect(canonicalUrl("//games//")).toBe(`${SITE_URL}/games/`);
    expect(AUTHOR_NAME).toBe("魔魔王");
    const metadata = pageMetadata("机制", "说明", "/mechanics");
    expect(metadata.alternates).toEqual({
      canonical: `${SITE_URL}/mechanics/`,
      types: { "text/markdown": `${SITE_URL}/mechanics/index.md` },
    });
    expect(metadata.openGraph).toMatchObject({
      url: `${SITE_URL}/mechanics/`,
      images: [{ url: SOCIAL_IMAGE, width: 1280, height: 640 }],
    });
  });

  it("lists every real content route once, including each dimension and group", () => {
    const paths = publicContentPaths();
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths.length).toBe(
      Object.keys(indexPageMetadata).length +
        mechanics.length +
        games.length +
        genres.length +
        dimensions.length +
        taxonomyGroups.length,
    );
    expect(dimensions).toHaveLength(9);
    expect(taxonomyGroups).toHaveLength(50);
    for (const group of taxonomyGroups)
      expect(paths).toContain(`/taxonomy/${group.dimensionId}/${group.id}`);
    expect(sitemap().map((row) => row.url)).toEqual(paths.map(canonicalUrl));
    expect(
      sitemap().every(
        (row) =>
          !row.url.includes("?") &&
          !row.url.includes("#") &&
          !row.url.includes("404") &&
          row.lastModified === undefined,
      ),
    ).toBe(true);
  });

  it("gives content indexes unique descriptions and titles without a global noindex", () => {
    const metadata = Object.values(indexPageMetadata);
    expect(new Set(metadata.map((row) => JSON.stringify(row.title))).size).toBe(
      metadata.length,
    );
    expect(new Set(metadata.map((row) => row.description)).size).toBe(
      metadata.length,
    );
    for (const row of metadata) {
      expect(row.description?.length).toBeGreaterThan(20);
      expect(row.robots).toBeUndefined();
    }
  });

  it("keeps new taxonomy bodies server rendered and exports only valid params", () => {
    for (const path of [
      "src/app/taxonomy/[dimension]/page.tsx",
      "src/app/taxonomy/[dimension]/[group]/page.tsx",
    ]) {
      const source = readFileSync(path, "utf8");
      expect(source).toContain("generateStaticParams");
      expect(source).toContain("dynamicParams = false");
      expect(source).not.toContain("useSearchParams");
      expect(source).not.toContain('"use client"');
    }
  });

  it("preserves breadcrumb hierarchy and safely embeds arbitrary editorial text", () => {
    expect(
      breadcrumbSchema([
        { name: "首页", path: "/" },
        { name: "资源", path: "/taxonomy/economy" },
      ]).itemListElement,
    ).toEqual([
      { "@type": "ListItem", position: 1, name: "首页", item: `${SITE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "资源",
        item: `${SITE_URL}/taxonomy/economy/`,
      },
    ]);
    const input = { text: "</script><script>alert('x')</script>&" };
    expect(serializeJsonLd(input)).not.toContain("<");
    expect(JSON.parse(serializeJsonLd(input))).toEqual(input);
  });
});
