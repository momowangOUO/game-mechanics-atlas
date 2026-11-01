import { expect, test } from "@playwright/test";
import { appHref, appPath, gotoApp } from "./navigation";

test("full motion uses the handwriting asset before fading out", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await gotoApp(page, "/copyright/", { waitForIntro: false });
  const intro = page.getByTestId("brand-intro");
  await expect(intro.locator("img")).toHaveAttribute(
    "src",
    /logo-handwriting\.webp$/,
  );
  await expect(intro).toHaveAttribute("data-ready", "true");
  await page.waitForTimeout(2600);
  await expect(intro).toHaveAttribute("data-state", "showing");
  await expect(intro).toHaveCount(0);
});

test("mobile home keeps author, footer and the GitHub menu link", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoApp(page, "/", { waitForIntro: false });
  const intro = page.getByTestId("brand-intro");
  await expect(intro).toBeVisible();
  await expect(intro).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "由魔魔王架设" }),
  ).toBeVisible();
  await expect(page.locator("footer")).toBeVisible();
  await expect(
    page.locator("footer").getByRole("link", { name: "版权与署名" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "打开导航菜单" }).click();
  await expect(
    page.getByRole("dialog").getByRole("link", { name: /GitHub 点星支持/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});

test("brand intro holds on each document load and stays gone during client navigation", async ({
  page,
}) => {
  await gotoApp(page, "/", { waitForIntro: false });
  const intro = page.getByTestId("brand-intro");
  await expect(intro).toHaveAttribute("data-ready", "true");
  const loadedAt = await page.evaluate(() => performance.now());
  await expect(intro.locator("img")).toHaveAttribute(
    "src",
    /logo-still\.webp$/,
  );
  await page.waitForTimeout(2600);
  await expect(intro).toBeVisible();
  await expect(intro).toHaveCount(0);
  expect(
    (await page.evaluate(() => performance.now())) - loadedAt,
  ).toBeGreaterThanOrEqual(2900);
  await expect(
    page.getByRole("heading", { name: "由魔魔王架设" }),
  ).toBeVisible();
  await page
    .locator(".nav")
    .getByRole("link", { name: "分类参考", exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp(`${appPath("/taxonomy/")}$`));
  await expect(intro).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${appPath("/")}$`));
  await expect(intro).toHaveCount(0);
  await page.goForward();
  await expect(page).toHaveURL(new RegExp(`${appPath("/taxonomy/")}$`));
  await expect(intro).toHaveCount(0);
  await page.reload();
  await expect(intro).toBeVisible();
  await expect(intro).toHaveCount(0);
});

test("failed logo has a timed fallback and copyright remains reachable", async ({
  page,
}) => {
  await page.route("**/brand/logo-still.webp", (route) => route.abort());
  await gotoApp(page, "/copyright/", { waitForIntro: false });
  const intro = page.getByTestId("brand-intro");
  await expect(intro.getByText("魔魔王", { exact: true })).toBeVisible();
  await expect(intro).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "游戏图像与第三方资料" }),
  ).toBeVisible();
  await expect(
    page.locator("footer").getByRole("link", { name: "版权与署名" }),
  ).toHaveAttribute("href", appHref("/copyright"));
});

test("failed handwriting animation uses the static logo for the full intro", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.route("**/brand/logo-handwriting.webp", (route) => route.abort());
  await gotoApp(page, "/copyright/", { waitForIntro: false });
  const intro = page.getByTestId("brand-intro");
  const logo = intro.locator("img");
  await expect(logo).toHaveAttribute("src", /logo-still\.webp$/);
  await expect(logo).toBeVisible();
  const shownAt = await page.evaluate(() => performance.now());
  await page.waitForTimeout(2600);
  await expect(intro).toHaveAttribute("data-state", "showing");
  await expect(intro).toHaveCount(0);
  expect(
    (await page.evaluate(() => performance.now())) - shownAt,
  ).toBeGreaterThanOrEqual(2900);
});

test("without JavaScript the server page has content and no intro overlay", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(
    `${test.info().project.use.baseURL}${appPath("/copyright/")}`,
  );
  await expect(page.getByTestId("brand-intro")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "版权与署名", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator("footer").getByText("© 2026 魔魔王", { exact: false }),
  ).toBeVisible();
  await context.close();
});
