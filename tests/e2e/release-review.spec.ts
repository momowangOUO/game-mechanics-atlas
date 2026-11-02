import { test, expect } from "@playwright/test";
import { appHref, gotoApp } from "./navigation";
await import("../../scripts/register-typescript.mjs");
const { games } = await import("../../src/lib/knowledge.ts");
const { getCoverageMatches } = await import("../../src/lib/catalog-coverage.ts");

for (const width of [390, 1440]) {
  test(`middle release era is usable in both catalogs at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await gotoApp(page, "/games?era=2011-2019");
    const select = page.getByLabel("筛选原作年代");
    await expect(select.locator("option")).toHaveText(["全部年代", "2010 年及以前", "2011–2019 年", "2020 年及以后"]);
    await expect(select).toHaveValue("2011-2019");
    const expected = games.filter(game => (game.originalReleaseYear ?? game.year) >= 2011 && (game.originalReleaseYear ?? game.year) <= 2019);
    await expect(page.locator(".catalog-games .case-card")).toHaveCount(expected.length);
    if (width <= 700) {
      const card = await page.locator(".catalog-games .case-card").first().boundingBox();
      expect(card!.width).toBeGreaterThan(width * 0.65);
    }
    await page.reload();
    await expect(select).toHaveValue("2011-2019");
    await expect(page.getByTestId("brand-intro")).toBeHidden();
    await page.locator(".catalog-games .case-card").first().click();
    await expect(page).toHaveURL(/\/games\/[^/?]+\/?(?:\?|$)/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goBack();
    await expect(select).toHaveValue("2011-2019");
    await expect(page.locator(".catalog-games .case-card")).toHaveCount(expected.length);
    await gotoApp(page, "/games/coverage?genre=platformer&play=platforming");
    await page.getByLabel("原作年代").selectOption("2011-2019");
    await expect(page.locator("#coverage-results .case-card")).toHaveCount(getCoverageMatches("platformer", "platforming", { era: "2011-2019" }).length);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  });
}

test("rhythm filter no longer mislabels SEKAI as action; actual rhythm action remains", async ({ page }) => {
  await gotoApp(page, "/games?genre=action&q=Project%20SEKAI");
  await expect(page.locator(".catalog-games .case-card")).toHaveCount(0);
  await page.getByLabel("筛选传统类型").selectOption("rhythm-game");
  await expect(page.locator(".catalog-games .case-card")).toHaveCount(1);
  await page.getByLabel("搜索游戏").fill("Hi-Fi");
  await page.getByLabel("筛选游戏核心玩法").selectOption("action-combat");
  await expect(page.locator(".catalog-games .case-card")).toHaveCount(1);
});

test("new popular cases, reference progress and discovery sources are visible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const id of ["hollow-knight-silksong", "black-myth-wukong", "cyberpunk-2077", "hi-fi-rush"]) {
    await gotoApp(page, `/games/${id}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(games.find(game => game.id === id)!.name);
    const cover = page.locator(".game-feature-cover img");
    await expect.poll(() => cover.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
    if (id === "hi-fi-rush") await expect(page.getByText("资料进度", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
  await gotoApp(page, "/games/discovery");
  await expect(page.getByRole("heading", { level: 1, name: "直播与传播案例" })).toBeVisible();
  await expect(page.locator(`a.case-card[href="${appHref("/games/grand-theft-auto-5")}"]`)).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Grow a Garden", exact: true })).toBeVisible();
  await expect(page.getByText("案例资料待补", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /来源：Twitch/ }).first()).toHaveAttribute("href", /^https:\/\/blog.twitch.tv/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
});
