import { test, expect } from "@playwright/test";
import { gotoApp, appHref } from "./navigation";

test("official covers keep their source identity and full image", async ({
  page,
}) => {
  await gotoApp(page, "/games/balatro");
  const cover = page.getByRole("img", {
    name: "Balatro 官方代表图",
    exact: true,
  });
  await expect(cover).toBeVisible();
  await expect(cover.locator("img")).toHaveCSS("object-fit", "contain");
  await expect(page.getByRole("link", { name: "查看图源 ↗" })).toHaveAttribute(
    "href",
    /^https:\/\//,
  );
});

test("reference catalogs search, paginate and explain an empty result", async ({
  page,
}) => {
  await gotoApp(page, "/sources");
  const sourceCatalog = page.getByRole("region", { name: "来源检索" });
  await expect(sourceCatalog.locator("article")).toHaveCount(10);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBe(0);
  await sourceCatalog.getByRole("button", { name: "下一页 →" }).click();
  await expect(
    sourceCatalog.getByRole("button", { name: "← 上一页" }),
  ).toBeEnabled();
  await sourceCatalog
    .getByRole("searchbox", { name: "搜索来源" })
    .fill("zzzz-no-source-765");
  await expect(sourceCatalog.getByText("没有匹配的来源")).toBeVisible();
  await sourceCatalog.getByRole("searchbox", { name: "搜索来源" }).fill("");
  await expect(sourceCatalog.locator("article")).toHaveCount(10);
  await gotoApp(page, "/types");
  await page.getByRole("searchbox", { name: "搜索复合类型" }).fill("MOBA");
  await expect(
    page.locator(`.type-index-grid a[href="${appHref("/types/moba")}"]`),
  ).toBeVisible();
  await expect(
    page.locator(`.type-index-grid a[href="${appHref("/types/roguelite")}"]`),
  ).toHaveCount(0);
});

test("case relations expose a focal selector only in their own view", async ({
  page,
}) => {
  await gotoApp(page, "/games/balatro");
  await page.getByRole("tab", { name: "循环视图", exact: true }).click();
  await expect(page.getByLabel("关系焦点")).toHaveCount(0);
  await page.getByRole("tab", { name: "关系视图", exact: true }).click();
  await expect(page.getByLabel("关系焦点")).toBeVisible();
  const count = await page.locator(".case-relation-graph rect").count();
  expect(count).toBeGreaterThan(0);
  expect(count).toBeLessThanOrEqual(7);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBe(0);
});
