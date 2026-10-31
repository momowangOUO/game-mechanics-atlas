import { expect, it } from "vitest";
import { matchesCatalog } from "./catalog-search";
it("finds reviewed Chinese and full-width aliases without guessing a different title", () => {
  const game = {
    id: "league-of-legends",
    name: "League of Legends",
    aliases: ["英雄联盟", "LOL"],
  };
  expect(matchesCatalog(game, " ＬＯＬ ")).toBe(true);
  expect(matchesCatalog(game, "英雄联盟")).toBe(true);
  expect(matchesCatalog(game, "tetris")).toBe(false);
  expect(
    matchesCatalog({ id: "rotation", name: "物件旋转" }, "空间", "空间配置"),
  ).toBe(true);
});
