import { describe, expect, it } from "vitest";
import { scopeFixture, assertion } from "./fixtures/knowledge-fixture";
import { gameMechanicOverview } from "./game-mechanic-overview";
import { dataset } from "./knowledge";

describe("game mechanic overview", () => {
  it("keeps multiple interactions and mechanisms without relationships in the opening overview", () => {
    const data = scopeFixture();
    data.mechanics.forEach((m) => {
      m.dimension = "interaction";
    });
    data.instances = [
      assertion("alpha", "standard"),
      assertion("beta", "standard", "conditional"),
    ];
    const overview = gameMechanicOverview("fixture", "", data);
    expect(overview.entries.map((e) => e.mechanic.id)).toEqual([
      "alpha",
      "beta",
    ]);
    expect(overview.interactionIds).toEqual(["alpha", "beta"]);
    expect(overview.entries[1].records[0].condition).toBe(
      "仅测试条件满足时成立。",
    );
  });
  it("lists all recorded directions without connecting mechanisms from incompatible modes", () => {
    const data = scopeFixture();
    data.instances = [
      assertion("alpha", "standard"),
      assertion("beta", "alternate"),
    ];
    data.relationships = [
      {
        id: "cross",
        from: "alpha",
        to: "beta",
        type: "synergy",
        context: "test",
        rationale: "test",
        evidenceKind: "editorial_analysis",
        sourceIds: [],
      },
    ];
    const overview = gameMechanicOverview("fixture", "all", data);
    expect(overview.entries).toHaveLength(2);
    expect(overview.relationshipIds).toEqual([]);
    expect(overview.entries.map((e) => e.records[0].scopeId)).toEqual([
      "fixture:standard",
      "fixture:alternate",
    ]);
  });
  it("honors child overrides and never promotes unknown, absent or not-applicable into nodes", () => {
    const data = scopeFixture();
    data.instances = [
      assertion("alpha", "game"),
      assertion("alpha", "character", "absent"),
      assertion("beta", "standard", "unknown"),
    ];
    expect(
      gameMechanicOverview("fixture", "fixture:character", data).entries,
    ).toEqual([]);
    data.instances[1].status = "not_applicable";
    expect(
      gameMechanicOverview("fixture", "fixture:character", data).entries,
    ).toEqual([]);
    expect(
      gameMechanicOverview("fixture", "fixture:standard", data).entries.map(
        (e) => e.mechanic.id,
      ),
    ).toEqual(["alpha"]);
  });
  it("rejects another game's scope and includes every positive recorded mechanism for each real game", () => {
    const fallback = gameMechanicOverview("minecraft", "hades:standard");
    expect(fallback.scopeId).toBe(
      dataset.games.find((g) => g.id === "minecraft")!.defaultScopeId,
    );
    for (const game of dataset.games) {
      const gameScopeIds=new Set(dataset.scopes.filter(scope=>scope.gameId===game.id).map(scope=>scope.id));
      const expected = [
        ...new Set(
          dataset.instances
            .filter(
              (i) =>
                gameScopeIds.has(i.scopeId) && ["present", "conditional"].includes(i.status),
            )
            .map((i) => i.mechanicId),
        ),
      ].sort();
      expect(
        gameMechanicOverview(game.id)
          .entries.map((e) => e.mechanic.id)
          .sort(),
        game.id,
      ).toEqual(expected);
    }
  });
});
