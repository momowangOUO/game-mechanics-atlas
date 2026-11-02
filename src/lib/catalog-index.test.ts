import { expect, it } from "vitest";
import { searchCatalog } from "./catalog-index";

it("finds composite categories, synonyms and games with accurate destinations", () => {
  expect(searchCatalog("RPG")[0]).toMatchObject({
    id: "rpg",
    kind: "genre",
    href: "/types/rpg",
  });
  expect(
    searchCatalog("自走棋").some(
      (item) => item.id === "auto-battler" && item.kind === "genre",
    ),
  ).toBe(true);
  expect(searchCatalog("Balatro")[0]).toMatchObject({
    id: "balatro",
    kind: "game",
    href: "/games/balatro",
  });
  expect(searchCatalog(" ＭＯＢＡ ")[0]).toMatchObject({
    id: "moba",
    kind: "genre",
  });
});

it("keeps mechanism identities and classification paths when searching a parent category", () => {
  const jump = searchCatalog("核心交互 跳跃").find(
    (item) => item.id === "jump",
  );
  expect(jump).toMatchObject({ kind: "mechanic", href: "/mechanics/jump" });
  expect(jump?.path).toContain("核心交互");
  expect(searchCatalog("missing-category-998877")).toEqual([]);
});
