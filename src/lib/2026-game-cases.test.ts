import { expect, it } from "vitest";
import { getGame, getInstanceStatus, getInstances, sources } from "./knowledge";
it("keeps 2026 official cases and their actual source dates", () => {
  for (const id of ["phantom-blade-zero", "monster-hunter-outlanders"]) {
    const game = getGame(id)!;
    expect(game.year).toBe(2026);
    expect(
      game.sourceIds.every(
        (id) =>
          sources.find((source) => source.id === id)?.checkedAt ===
          "2026-11-02",
      ),
    ).toBe(true);
    expect(getInstances(id).length).toBeGreaterThanOrEqual(6);
  }
});
it("does not turn a character's energy rule or multiplayer rules into universal game facts", () => {
  expect(
    getInstanceStatus(
      "monster-hunter-outlanders",
      "cooperative-play",
      "monster-hunter-outlanders:standard",
    ),
  ).toBe("unknown");
  expect(
    getInstanceStatus(
      "monster-hunter-outlanders",
      "cooperative-play",
      "monster-hunter-outlanders:coop",
    ),
  ).toBe("present");
  expect(
    getInstanceStatus(
      "monster-hunter-outlanders",
      "combat-resource-conversion",
      "monster-hunter-outlanders:coop",
    ),
  ).toBe("unknown");
  expect(
    getInstanceStatus(
      "monster-hunter-outlanders",
      "combat-resource-conversion",
      "monster-hunter-outlanders:rhodes",
    ),
  ).toBe("present");
  expect(
    getInstanceStatus(
      "phantom-blade-zero",
      "combo-chain",
      "phantom-blade-zero:standard",
    ),
  ).toBe("unknown");
});
