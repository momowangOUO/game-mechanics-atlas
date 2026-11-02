import { beforeAll, describe, expect, it, vi } from "vitest";

// These deliberately small examples isolate ancestry, sibling scopes and
// repeated assignments; the expected matches do not depend on catalog size.
const assignments = (id: string, scopeId: string, role: "primary" | "supporting" = "primary") => ({
  playStyleId: id, scopeId, role, sourceIds: ["source"], rationale: "fixture",
});
const type = (genreId: string, scopeId: string) => ({ genreId, scopeId, sourceIds: ["source"], rationale: "fixture" });
const base = { year: 2022, originalReleaseYear: 2008, platforms: ["pc"], genreIds: ["tactical-turn-based", "strategy"], playStyleIds: ["tactical-command"], scopeNotes: "fixture" };
const games = [
  { ...base, id: "ancestor", genreAssignments: [type("tactical-turn-based", "a-root"), type("strategy", "a-root")], playStyleAssignments: [assignments("tactical-command", "a-child", "supporting"), assignments("tactical-command", "a-root")] },
  { ...base, id: "descendant", year: 2021, originalReleaseYear: 2021, platforms: ["ios"], genreAssignments: [type("tactical-turn-based", "b-child")], playStyleAssignments: [assignments("tactical-command", "b-root")] },
  { ...base, id: "siblings", genreAssignments: [type("tactical-turn-based", "c-left")], playStyleAssignments: [assignments("tactical-command", "c-right")] },
  { ...base, id: "support", genreAssignments: [type("tactical-turn-based", "d-root")], playStyleAssignments: [assignments("tactical-command", "d-root", "supporting")] },
];
const scopes = [
  { id: "a-root", gameId: "ancestor", label: "主范围" }, { id: "a-child", gameId: "ancestor", parentScopeId: "a-root", label: "子范围" },
  { id: "b-root", gameId: "descendant", label: "主范围" }, { id: "b-child", gameId: "descendant", parentScopeId: "b-root", label: "子范围" },
  { id: "c-root", gameId: "siblings", label: "主范围" }, { id: "c-left", gameId: "siblings", parentScopeId: "c-root", label: "左模式" }, { id: "c-right", gameId: "siblings", parentScopeId: "c-root", label: "右模式" },
  { id: "d-root", gameId: "support", label: "主范围" },
];

describe("catalog coverage scope and empty-state semantics", () => {
  let coverage: typeof import("./catalog-coverage");
  beforeAll(async () => {
    vi.resetModules();
    vi.doMock("./knowledge", () => ({ games, scopes, genres: [{ id: "strategy", name: "策略" }, { id: "rpg", name: "角色扮演" }] }));
    vi.doMock("../../docs/research/coverage-reviews.json", () => ({ default: [{ genreId: "rpg", playStyleId: "rhythm-play", status: "researched_no_examples", checkedAt: "2026-11-02", scope: "fixture", queries: ["fixture"], sourceUrls: ["https://example.org/"], note: "已核对" }] }));
    coverage = await import("./catalog-coverage");
  });

  it("inherits parent categories, joins only related scopes and counts each game once", () => {
    const direct = coverage.getCoverageMatches("tactical-turn-based", "tactical-command");
    const inherited = coverage.getCoverageMatches("strategy", "tactical-command");
    expect(direct.map(row => row.game.id).sort()).toEqual(["ancestor", "descendant", "support"]);
    expect(inherited.map(row => row.game.id).sort()).toEqual(direct.map(row => row.game.id).sort());
    expect(inherited.find(row => row.game.id === "ancestor")).toMatchObject({ role: "primary", scopeId: "a-root" });
    // A parent play assignment is inherited by the genre's child scope;
    // linking the parent would leave the genre claim outside the shown scope.
    expect(inherited.find(row => row.game.id === "descendant")).toMatchObject({ scopeId: "b-child", scopeLabel: "子范围" });
    expect(inherited.some(row => row.game.id === "siblings")).toBe(false);
  });

  it("filters using original year and the assigned role without turning missing results into research claims", () => {
    expect(coverage.getCoverageMatches("strategy", "tactical-command", { era: "classic" }).map(row => row.game.id).sort()).toEqual(["ancestor", "support"]);
    expect(coverage.getCoverageMatches("strategy", "tactical-command", { platform: "ios", era: "recent" }).map(row => row.game.id)).toEqual(["descendant"]);
    expect(coverage.getCoverageMatches("strategy", "tactical-command", { primaryOnly: true }).map(row => row.game.id).sort()).toEqual(["ancestor", "descendant"]);
    expect(coverage.getCoverageCell("strategy", "tactical-command", { platform: "arcade" }).status).toBe("filtered_empty");
    expect(coverage.getCoverageCell("rpg", "rhythm-play").status).toBe("researched_no_examples");
    expect(coverage.getCoverageCell("rpg", "rhythm-play", { platform: "ios" }).status).toBe("filtered_empty");
    expect(coverage.getCoverageCell("rpg", "platforming").status).toBe("unreviewed");
    expect(coverage.getCoverageCell("strategy", "tactical-command").status).toBe("has_examples");
  });

  it("summarizes the registered matrix without treating an unreviewed gap as a researched one", () => {
    const summary = coverage.catalogCoverageSummary();
    expect(summary.games).toBe(games.length);
    expect(summary.byGenre.find(row => row.id === "strategy")?.count).toBe(games.length);
    expect(summary.reviewedEmpty).toBe(1);
    expect(summary.coveredCells + summary.reviewedEmpty + summary.pendingCells).toBe(summary.totalCells);
  });
});
