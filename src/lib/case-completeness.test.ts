import { describe, expect, it } from "vitest";
import evidence from "../../docs/research/game-evidence.json";
import { GameSchema } from "./model";
import { minimumSupportedMechanics } from "./case-completeness";

describe("reference entries and detailed cases", () => {
  it("requires reference entries to state what remains unresearched", () => {
    const game = evidence.games[0];
    expect(GameSchema.safeParse({ ...game, referenceOnly: true }).success).toBe(false);
    expect(GameSchema.safeParse({ ...game, referenceOnly: true, coverageNote: "目前核实了语言破译与笔记功能，其他机制待补查。" }).success).toBe(true);
  });
  it("does not force simple games to invent six mechanics", () => {
    expect(minimumSupportedMechanics({ referenceOnly: true })).toBe(2);
    expect(minimumSupportedMechanics({})).toBe(6);
  });
});
