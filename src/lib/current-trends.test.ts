import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { currentTrends, videoGameTrends, snapshotDate } from "./current-trends";

it("preserves current official trend buckets, dates, regions and verifiable source excerpts", () => {
  expect(Date.parse(snapshotDate)).toBeGreaterThanOrEqual(
    Date.parse("2026-11-02"),
  );
  expect(Date.parse(currentTrends.collectedAt)).toBeLessThanOrEqual(Date.now());
  expect(currentTrends.metric).toBe("bucketed_trending_search_volume");
  expect(currentTrends.markets).toHaveLength(4);
  expect(JSON.stringify(currentTrends)).not.toMatch(
    /powerball|lottery|競馬|六合彩|大樂透|ロト7/i,
  );
  for (const market of currentTrends.markets) {
    const excerpt = readFileSync(
      new URL(`../../public${market.evidencePath}`, import.meta.url),
    );
    expect(createHash("sha256").update(excerpt).digest("hex")).toBe(
      market.excerptSha256,
    );
    const rows = JSON.parse(excerpt.toString());
    expect(rows.length).toBe(market.entries.length);
    for (const [index, entry] of market.entries.entries()) {
      expect(entry.query).toBe(rows[index][0]);
      expect(entry.volumeLowerBound).toBe(rows[index][6]);
      expect(entry.categoryIds).toContain(6);
      expect(Date.parse(entry.startedAt)).toBeLessThanOrEqual(
        Date.parse(market.collectedAt),
      );
      expect(entry).not.toHaveProperty("count");
      expect(entry).not.toHaveProperty("blue");
    }
  }
});
it("searches reviewed video game terms and their existing categories without aggregating demand", () => {
  const lol = videoGameTrends("TW", "MOBA");
  expect(lol.length).toBeGreaterThan(0);
  expect(
    lol.every(
      (entry) => "gameId" in entry && entry.gameId === "league-of-legends",
    ),
  ).toBe(true);
  expect(
    videoGameTrends("US").some((entry) => entry.query.includes("fortnite")),
  ).toBe(true);
  expect(videoGameTrends("TW", "missing-998877")).toEqual([]);
  expect(
    videoGameTrends("TW").every((entry) => !entry.query.includes("彩票")),
  ).toBe(true);
});
