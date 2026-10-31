import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  analyzeSearchInterest,
  annualSearchSnapshot,
  currentSearchAttempt,
  DEFAULT_SEARCH_RECORDS,
  validateSearchInterest,
  type SearchInterestSnapshot,
} from "./search-demand";
import {
  analyzeHeat,
  validateSearchImport,
  type SearchQueryStat,
} from "./heat";

// Isolated unit-test fixture. These numbers are never published as observed demand.
const fixture = (): SearchInterestSnapshot => ({
  schemaVersion: 1,
  provider: "google_trends",
  metric: "relative_search_interest",
  comparisonGroupId: "test-only",
  sourceUrl:
    "https://trends.google.com/trends/explore?date=2026-10-29%202026-10-30&q=test-a,test-b",
  collectedAt: "2026-10-31T00:00:00Z",
  rawSha256: "a".repeat(64),
  region: "GLOBAL",
  dateStart: "2026-10-29",
  dateEnd: "2026-10-30",
  granularity: "day",
  searchProperty: "web",
  category: 0,
  terms: ["test-a", "test-b"],
  rows: [
    { date: "2026-10-29", values: [100, 0], partial: false },
    { date: "2026-10-30", values: [50, 0], partial: false },
  ],
});

describe("real search provenance and metric boundaries", () => {
  it("starts with no fabricated search-count rankings", () => {
    expect(DEFAULT_SEARCH_RECORDS).toEqual([]);
    expect(
      analyzeHeat(DEFAULT_SEARCH_RECORDS).profiles.every(
        (profile) =>
          profile.measurementStatus === "missing" && profile.blue === null,
      ),
    ).toBe(true);
    const provider = readFileSync(
      new URL("../components/SearchDataProvider.tsx", import.meta.url),
      "utf8",
    );
    expect(provider).not.toMatch(/searchSeed/);
  });
  it("publishes actual official ranks with their historic date scope and raw evidence hash", () => {
    const data = annualSearchSnapshot;
    expect(data.metric).toBe("trending_search_rank");
    expect(data.region).toBe("GLOBAL");
    expect(data.dateEnd).toBe("2025-11-25");
    expect(data.comparisonEnd).toBe("2024-11-25");
    expect(data.entries.map((entry) => entry.rank)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ]);
    expect(data.entries[0].query).toBe("Arc Raiders");
    expect(data.entries[9].query).toBe("Roblox");
    const excerpt = readFileSync(
      new URL(
        "../../public/data/search-demand/annual-games-source.txt",
        import.meta.url,
      ),
    );
    expect(createHash("sha256").update(excerpt).digest("hex")).toBe(
      data.excerptSha256,
    );
    expect(JSON.stringify(data)).not.toMatch(/"count"|"blue"|"red"/);
  });
  it("preserves actual unsuccessful collection without inventing zero measurements", () => {
    expect(currentSearchAttempt.status).toBe("unavailable");
    expect(currentSearchAttempt.httpStatus).toBe(429);
    expect(currentSearchAttempt).not.toHaveProperty("rows");
    const response = readFileSync(
      new URL(
        "../../public/data/search-demand/genre-request-response.txt",
        import.meta.url,
      ),
    );
    expect(createHash("sha256").update(response).digest("hex")).toBe(
      currentSearchAttempt.rawSha256,
    );
  });
  it("never interprets relative indices or ranks as absolute counts or opportunity scores", () => {
    const data = fixture();
    const result = analyzeSearchInterest(data);
    expect(result).toMatchObject({
      totalSearches: null,
      blue: null,
      red: null,
      complete: true,
    });
    expect(result.profiles[0].meanInterest).toBe(75);
    expect(result.profiles[1].meanInterest).toBe(0);
    expect(validateSearchImport(data).success).toBe(false);
    expect(
      validateSearchImport({
        schemaVersion: 1,
        records: annualSearchSnapshot.entries,
      }).success,
    ).toBe(false);
  });
  it.each([
    "terms",
    "dates",
    "region",
    "length",
    "duplicate",
    "count",
    "batches",
  ] as const)("rejects noncomparable %s", (change) => {
    const data: Record<string, unknown> = structuredClone(fixture());
    if (change === "terms") data.terms = ["different-term", "test-b"];
    if (change === "dates") data.dateEnd = "2026-10-31";
    if (change === "region") data.region = "CN";
    if (change === "length")
      (data.rows as SearchInterestSnapshot["rows"])[0].values.push(23);
    if (change === "duplicate")
      (data.rows as SearchInterestSnapshot["rows"]).push(
        (data.rows as SearchInterestSnapshot["rows"])[0],
      );
    if (change === "count") data.metric = "search_count";
    if (change === "batches")
      data.comparisonGroupIds = ["separate-a", "separate-b"];
    expect(validateSearchInterest(data).success).toBe(false);
  });
  it.each(["null", "missing", "partial"] as const)(
    "keeps %s distinct from a complete low-volume index of zero",
    (type) => {
      const data = fixture();
      if (type === "null") data.rows[0].values[1] = null;
      if (type === "missing") data.rows.pop();
      if (type === "partial") data.rows[0].partial = true;
      const result = analyzeSearchInterest(data);
      expect(result.complete).toBe(false);
      expect(
        result.profiles.every((profile) => profile.meanInterest === null),
      ).toBe(true);
    },
  );
  it("withholds market opportunity scores for actual imported counts and an incomplete atlas supply sample", () => {
    const record: SearchQueryStat = {
      id: "test",
      datasetId: "test",
      date: "2026-10-30",
      query: "test",
      count: 100,
      region: "CN",
      language: "zh",
      sourceKind: "import",
      attributions: [{ topicId: "game:tetris", weight: 1, mode: "direct" }],
    };
    expect(
      analyzeHeat([record]).profiles.find(
        (profile) => profile.topicId === "game:tetris",
      ),
    ).toMatchObject({ demand: 100, blue: null, red: null });
  });
});
