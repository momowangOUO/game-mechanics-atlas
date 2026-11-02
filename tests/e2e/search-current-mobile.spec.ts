import { expect, test } from "@playwright/test";
import { gotoApp, appHref } from "./navigation";
import { readFileSync } from "node:fs";
await import("../../scripts/register-typescript.mjs");
const { games, genres } = await import("../../src/lib/knowledge.ts");
const snapshotDate = JSON.parse(
  readFileSync("src/data/current-trends.json", "utf8"),
).collectedAt.slice(0, 10);
const gamesCount = games.length;

test("category search finds composite types and words separated by spaces", async ({
  page,
}) => {
  await gotoApp(page, "/taxonomy");
  const search = page.getByRole("searchbox", { name: "搜索分类、机制与游戏" });
  await search.fill("RPG");
  const results = page.getByRole("region", { name: "分类搜索结果" });
  await expect(
    results
      .getByRole("link")
      .filter({
        has: page.getByRole("heading", { name: "角色扮演", exact: false }),
      })
      .first(),
  ).toHaveAttribute("href", appHref("/types/rpg"));
  await search.fill("auto battler");
  await expect(
    results.getByRole("link", { name: /自动战斗构筑/ }),
  ).toBeVisible();
  await search.fill("核心交互 跳跃");
  await results.getByRole("link", { name: /跳跃/ }).first().click();
  await expect(
    page.getByRole("region", { name: "跳跃图解", exact: true }),
  ).toBeVisible();
});

test("phone taxonomy scrolls naturally and shows all three comic panels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoApp(page, "/taxonomy");
  const dimensions = page.getByRole("navigation", {
    name: "分类维度",
    exact: true,
  });
  await expect(dimensions.getByRole("link")).toHaveCount(9);
  await expect(
    page.getByRole("button", { name: "分类维度下一页", exact: true }),
  ).toHaveCount(0);
  await dimensions.getByRole("link", { name: /核心交互/ }).click();
  await page
    .getByRole("navigation", { name: "本维度目录", exact: true })
    .getByRole("link", { name: /移动与攀越/ })
    .click();
  await page
    .getByRole("navigation", { name: "移动与攀越机制目录", exact: true })
    .getByRole("link", { name: /跳跃/ })
    .click();
  const article = page.locator('article[data-mechanic-id="jump"]');
  const comic = article.getByRole("region", { name: "跳跃图解", exact: true });
  await expect(comic.locator("[data-panel]")).toHaveCount(3);
  await expect(comic.locator("figure:visible")).toHaveCount(6);
  const open = article.getByRole("link", { name: "看图理解 ↓", exact: true });
  await expect(open).toHaveAttribute("href", "#mechanic-comic-jump");
  await open.click();
  await expect(page).toHaveURL(/#mechanic-comic-jump$/);
  await expect(
    comic.getByRole("heading", { name: "跳跃图解", exact: true }),
  ).toBeInViewport();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBe(0);
});

test("recent actual search data precedes the 2025 archive and can be searched by category", async ({
  page,
}) => {
  await gotoApp(page, "/heat");
  const recent = page.getByRole("region", {
    name: "近期游戏搜索趋势",
    exact: true,
  });
  await expect(recent).toContainText(snapshotDate);
  await expect(recent).toContainText("搜索量档位");
  await recent
    .getByRole("searchbox", { name: "搜索近期游戏、类别与词条" })
    .fill("MOBA");
  await expect(recent).toContainText("英雄聯盟");
  await expect(
    recent.locator("article").filter({ hasText: "彩票" }),
  ).toHaveCount(0);
  await recent.getByRole("searchbox").fill("no-game-998877");
  await expect(
    recent.getByRole("heading", { name: "这份快照里没有匹配的电子游戏词条" }),
  ).toBeVisible();
  await recent.getByRole("button", { name: "清除关键词" }).click();
  await recent
    .getByRole("combobox", { name: "近期趋势地区" })
    .selectOption("US");
  await expect(recent).toContainText("fortnite");
});

test("phone catalogs expose complete scrollable lists without ordinary result pagination", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await gotoApp(page, "/games");
  await expect(page.locator(".catalog-games .case-card")).toHaveCount(
    gamesCount,
  );
  await expect(page.getByRole("navigation", { name: "结果分页" })).toHaveCount(
    0,
  );
  await page
    .locator(".catalog-games .case-card")
    .last()
    .scrollIntoViewIfNeeded();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBe(0);
  await gotoApp(page, "/types");
  await expect(page.locator(".type-index-grid > a")).toHaveCount(genres.length);
  await expect(page.getByRole("navigation", { name: "目录分页" })).toHaveCount(
    0,
  );
  await page.getByRole("searchbox", { name: "搜索复合类型" }).fill("自走棋");
  await expect(page.locator(".type-index-grid > a")).toHaveCount(1);
  await expect(page.locator(".type-index-grid > a")).toContainText(
    "自动战斗构筑",
  );
});

test("choosing a category near the bottom anchors its complete dimension to a visible heading", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await gotoApp(page, "/taxonomy");
  await page
    .getByRole("navigation", { name: "分类维度", exact: true })
    .getByRole("link", { name: /变化与随机/ })
    .click();
  const heading = page.locator('header[id^="dimension-"]').filter({
    has: page.getByRole("heading", { name: "变化与随机", exact: true }),
  });
  await expect(
    heading.getByRole("heading", { name: "变化与随机", exact: true }),
  ).toBeInViewport();
  await expect(
    page.getByRole("navigation", { name: "本维度目录", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "分类浏览层级", exact: true }),
  ).toHaveCount(0);
});

test("current 2026 cases use official pictures and scoped mechanism references", async ({
  page,
}) => {
  for (const id of ["phantom-blade-zero", "monster-hunter-outlanders"]) {
    await gotoApp(page, `/games/${id}`);
    await expect(page.locator(".game-feature-cover img")).toHaveAttribute(
      "src",
      new RegExp(`/art/games/${id}\\.webp$`),
    );
    await expect(
      page.getByRole("link", { name: /看图理解：/ }).first(),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "游戏研究章节", exact: true })
      .getByRole("link", { name: "核心循环 ↓", exact: true })
      .click();
    const loop = page.getByRole("region", { name: "核心循环", exact: true });
    await expect(loop.getByTestId("loop-connections")).toBeVisible();
  }
});
