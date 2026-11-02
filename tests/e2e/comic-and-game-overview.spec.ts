import { test, expect } from "@playwright/test";
import { gotoApp, appHref } from "./navigation";
import { readFileSync } from "node:fs";
const evidence = JSON.parse(
  readFileSync("docs/research/game-evidence.json", "utf8"),
);
for (const [width, height] of [
  [1440, 1000],
  [390, 844],
  [320, 640],
]) {
  test(`classification article shows its real comic and all rule stages at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await gotoApp(page, "/taxonomy?mechanic=dodge-move");
    const reader = page.locator('article[data-mechanic-id="dodge-move"]');
    const comic = reader.getByRole("region", {
      name: "闪避位移图解",
      exact: true,
    });
    await expect(comic).toBeVisible();
    await expect(comic.locator("figure:visible")).toHaveCount(6);
    await expect(comic.locator("[data-panel]")).toHaveCount(3);
    await expect(comic.locator("[data-rule-stage] svg")).toHaveCount(3);
    await expect(comic.locator("button, nav")).toHaveCount(0);
    let previousBottom = 0;
    for (const frame of await comic.locator("figure").all()) {
      await frame.scrollIntoViewIfNeeded();
      await expect(frame.locator("figcaption")).toBeInViewport();
      const bounds = await frame.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top + scrollY, bottom: rect.bottom + scrollY };
      });
      expect(bounds.top).toBeGreaterThanOrEqual(previousBottom);
      previousBottom = bounds.bottom;
    }
    for (const drawing of await comic.locator("[data-panel]").all()) {
      const bounds = (await drawing.boundingBox())!;
      expect(bounds.width).toBeGreaterThan(140);
      expect(bounds.height).toBeGreaterThan(140);
      expect(bounds.width).toBeLessThanOrEqual(600);
      expect(Math.abs(bounds.width - bounds.height)).toBeLessThan(1);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollHeight),
    ).toBeGreaterThan(height);
    await expect(reader).toHaveCSS("overflow-y", "visible");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBe(0);
    const open = reader.getByRole("link", { name: "看图理解 ↓", exact: true });
    await expect(open).toBeVisible();
    await expect(open).toHaveAttribute("href", "#mechanic-comic-dodge-move");
    await open.click();
    await expect(page).toHaveURL(/#mechanic-comic-dodge-move$/);
    await expect(
      comic.getByRole("heading", { name: "闪避位移图解", exact: true }),
    ).toBeInViewport();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(reader.getByRole("tab")).toHaveCount(0);
    await comic
      .locator("figure")
      .last()
      .locator("figcaption")
      .scrollIntoViewIfNeeded();
    await expect(
      comic.locator("figure").last().locator("figcaption"),
    ).toBeInViewport();
  });
}
test("a game graph starts with all recorded directions and keeps them when changing focus", async ({
  page,
}) => {
  await gotoApp(page, "/graph?game=hades");
  const inventory = page.getByRole("region", {
    name: "游戏机制总览",
    exact: true,
  });
  const scopeIds = evidence.scopes
    .filter((s: { gameId: string }) => s.gameId === "hades")
    .map((s: { id: string }) => s.id);
  const ids = [
    ...new Set(
      evidence.instances
        .filter(
          (i: { scopeId: string; status: string }) =>
            scopeIds.includes(i.scopeId) &&
            ["present", "conditional"].includes(i.status),
        )
        .map((i: { mechanicId: string }) => i.mechanicId),
    ),
  ];
  await expect(inventory.locator("button[data-mechanic-id]")).toHaveCount(
    ids.length,
  );
  await expect(page.locator(".react-flow__node")).toHaveCount(ids.length);
  await inventory.locator("button[data-mechanic-id]").last().click();
  await expect(page.locator(".react-flow__node")).toHaveCount(ids.length);
  await expect(page.getByLabel("图谱模式范围")).toHaveValue("all");
});
test("browsing into a mechanism opens its comic instead of the old text page", async ({
  page,
}) => {
  await gotoApp(page, "/taxonomy?group=mobility-tools");
  const group = page.locator('[data-taxonomy-group="mobility-tools"]');
  await group
    .getByRole("navigation", {
      name: "特殊位移与空间连接机制目录",
      exact: true,
    })
    .getByRole("link", { name: /闪避位移/ })
    .click();
  const article = page.locator('article[data-mechanic-id="dodge-move"]');
  await expect(
    article.getByRole("region", { name: "闪避位移图解", exact: true }),
  ).toBeVisible();
  await expect(
    article.getByRole("link", { name: "看图理解 ↓", exact: true }),
  ).toHaveAttribute("href", "#mechanic-comic-dodge-move");
});
test("case relation view lists all mechanisms and opens the same scope in the interactive graph", async ({
  page,
}) => {
  await gotoApp(page, "/games/balatro");
  const relations = page.getByRole("region", { name: "机制关系", exact: true });
  await page
    .getByRole("navigation", { name: "游戏研究章节", exact: true })
    .getByRole("link", { name: "机制关系 ↓", exact: true })
    .click();
  for (const label of ["机制记录", "核心循环", "机制关系", "搜索资料"])
    await expect(
      page.getByRole("region", { name: label, exact: true }),
    ).toBeVisible();
  const game = evidence.games.find((g: { id: string }) => g.id === "balatro");
  const ids = evidence.instances.filter(
    (i: { scopeId: string; status: string }) =>
      i.scopeId === game.defaultScopeId &&
      ["present", "conditional"].includes(i.status),
  );
  await expect(relations.locator(".case-relation-graph rect")).toHaveCount(
    ids.length,
  );
  await expect(
    relations
      .getByRole("region", { name: "游戏机制总览", exact: true })
      .locator("button[data-mechanic-id]"),
  ).toHaveCount(ids.length);
  const graphLink = relations.getByRole("link", {
    name: "在完整交互图谱中查看 ↗",
    exact: true,
  });
  await expect(graphLink).toHaveAttribute(
    "href",
    appHref(
      `/graph?game=balatro&scope=${encodeURIComponent(game.defaultScopeId)}`,
    ),
  );
});
