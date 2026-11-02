import { test, expect } from "@playwright/test";
import { appPath, gotoApp } from "./navigation";

test("static dimension and group pages expose the same full illustrated mechanisms without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  for (const [path, count] of [
    ["/taxonomy/interaction/", 17],
    ["/taxonomy/interaction/movement-basics/", 3],
  ] as const) {
    await page.goto(appPath(path));
    await expect(page.locator("article[data-mechanic-id]")).toHaveCount(count);
    await expect(page.locator("[data-panel]")).toHaveCount(count * 3);
    await expect(page.locator("[data-rule-stage]")).toHaveCount(count * 3);
    await expect(page.locator('a[href$="#mechanic-jump"]')).toHaveCount(1);
    await expect(page.locator("#mechanic-jump").getByRole("heading", { name: "游戏范例", exact: true })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://momowangouo.github.io/game-mechanics-atlas${path}`);
    expect(await page.locator('script[type="application/ld+json"]').allTextContents()).toEqual(expect.arrayContaining([expect.stringContaining("BreadcrumbList")]));
    const icon = page.locator('img[src*="/art/taxonomy-groups/movement-basics.webp"]').first();
    await icon.scrollIntoViewIfNeeded();
    expect(await icon.evaluate((image: HTMLImageElement) => image.decode().then(() => image.naturalWidth))).toBe(512);
    await expect(page.getByTestId("brand-intro")).toHaveCount(0);
  }
  await context.close();
});

test("global search includes every match beyond the former 18-result limit", async ({ page }) => {
  await gotoApp(page, "/taxonomy/");
  await page.keyboard.press("ControlOrMeta+k");
  const dialog = page.getByRole("dialog", { name: "SEARCH ARCHIVE / 检索研究档案" });
  await dialog.getByRole("textbox", { name: "搜索全部档案" }).fill("构筑");
  const countLabel = await dialog.locator('[aria-live="polite"]').innerText();
  const count = Number.parseInt(countLabel, 10);
  expect(count).toBeGreaterThan(18);
  await expect(dialog.locator(".search-results a")).toHaveCount(count);
  await dialog.locator(".search-results a").last().scrollIntoViewIfNeeded();
  await expect(dialog.locator(".search-results a").last()).toBeInViewport();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});
