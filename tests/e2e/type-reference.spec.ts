import { test, expect } from "@playwright/test";
import { gotoApp, appHref } from "./navigation";

test("home global search can enter a category group directly", async ({
  page,
}) => {
  await gotoApp(page, "/");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", {
    name: "SEARCH ARCHIVE / 检索研究档案",
  });
  await dialog
    .getByRole("textbox", { name: "搜索全部档案" })
    .fill("生产与设施投资");
  await dialog.getByRole("link").filter({ hasText: "生产与设施投资" }).click();
  await expect(page).toHaveURL(/\/taxonomy\/?\?group=productive-investment$/);
  const group = page.getByRole("region", {
    name: "机制分组：生产与设施投资",
    exact: true,
  });
  await expect(
    group.getByRole("heading", { name: "生产与设施投资", exact: true }),
  ).toBeInViewport();
  await expect(group.locator("article[data-mechanic-id]")).toHaveCount(4);
  await expect(group.locator("[data-panel]")).toHaveCount(12);
});

test("type guide explains play, nearby boundaries and scoped game observations", async ({
  page,
}) => {
  await gotoApp(page, "/types/deckbuilder");
  await expect(
    page.getByRole("heading", { name: "玩家主要在做什么？" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "与数字卡牌对战有什么不同？" }),
  ).toBeVisible();
  const references = page.locator(".case-grid > article");
  await expect(references.first()).toContainText("观察范围：");
  await expect(
    references.first().getByRole("link", { name: "查看这个范围的机制记录 →" }),
  ).toHaveAttribute("href", /\?scope=/);
  await page.getByRole("link", { name: "对照数字卡牌对战 →" }).click();
  await expect(page).toHaveURL(/\/types\/digital-card-duel\/?$/);
});

test("type reference can expose a conditional cooperative scope instead of inventing a default fact", async ({
  page,
}) => {
  await gotoApp(page, "/types/party-cooperation");
  const conditionalCase = page.locator(".case-grid > article").filter({
    has: page.locator(`a[href="${appHref("/games/peak")}"]`),
  });
  await expect(conditionalCase).toContainText("条件成立");
  await expect(conditionalCase).toContainText("成立条件：");
  await expect(conditionalCase).toContainText("使用多人合作模式");
  const link = conditionalCase.getByRole("link", { name: "查看这个范围的机制记录 →" });
  const href = await link.getAttribute("href");
  const scope = new URL(href!, "http://localhost").searchParams.get("scope");
  await link.click();
  await expect(page.getByLabel("当前研究范围")).toHaveValue(scope!);
});

test("phone type examples use a full-width card with its evidence directly below", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoApp(page, "/types/party-cooperation");
  const first = page.locator(".case-grid > article").first();
  const card = await first.locator(".case-card").boundingBox();
  const evidence = await first.locator(".scope-box").boundingBox();
  expect(card!.width).toBeGreaterThan(320);
  expect(card!.height).toBeLessThan(600);
  expect(evidence!.y - card!.y - card!.height).toBeGreaterThanOrEqual(0);
  expect(evidence!.y - card!.y - card!.height).toBeLessThan(20);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBe(0);
});
