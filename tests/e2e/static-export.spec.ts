import { test, expect, type Page } from "@playwright/test";
import { appHref, appPath, gotoApp } from "./navigation";

async function hydrated(page: Page) {
  await expect(page.locator("html")).toHaveAttribute(
    "data-effects",
    /^(full|reduced)$/,
  );
  await expect(page.locator('[hidden][id^="S:"]')).toHaveCount(0);
}

async function changeQuery(page: Page, href: string) {
  await page.evaluate((url) => history.pushState({}, "", url), appHref(href));
}

test("static catalog queries survive direct loads, refresh, query-only navigation and history", async ({
  page,
}) => {
  await gotoApp(page, "/mechanics?q=计分");
  await hydrated(page);
  const search = page.getByRole("textbox", { name: "搜索机制" });
  await expect(search).toHaveValue("计分");
  await page.reload();
  await expect(search).toHaveValue("计分");
  await changeQuery(page, "/mechanics?q=计分&dimension=");
  await expect(search).toHaveValue("计分");
  await search.fill("保留当前输入");
  await changeQuery(page, "/mechanics?dimension=&q=计分");
  await expect(search).toHaveValue("保留当前输入");
  await changeQuery(page, "/mechanics?q=局内");
  await expect(search).toHaveValue("局内");
  await page.goBack();
  await expect(search).toHaveValue("计分");
  await changeQuery(page, "/mechanics?q=计分&q=局内");
  await expect(search).toHaveValue("");
});

test("graph and heat tools reinitialize on query-only changes", async ({
  page,
}) => {
  await gotoApp(page, "/graph?focus=in-run-deck-growth");
  await hydrated(page);
  await expect(page.getByLabel("聚焦机制", { exact: true })).toHaveValue(
    "in-run-deck-growth",
  );
  await changeQuery(page, "/graph?focus=score-threshold");
  await expect(page.getByLabel("聚焦机制", { exact: true })).toHaveValue(
    "score-threshold",
  );
  await gotoApp(page, "/heat?topic=game%3Abalatro");
  await hydrated(page);
  await expect(
    page.locator(".scope-box").filter({ hasText: "正在研究「Balatro" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "分析自己的搜索次数 →" }).click();
  await expect(page.locator(".selected-topic-heading h2")).toHaveText(
    "Balatro",
  );
  await changeQuery(page, "/heat?topic=game%3Aslay-the-spire&view=blue");
  await expect(
    page.locator(".scope-box").filter({ hasText: "正在研究「Slay the Spire" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "分析自己的搜索次数 →" }).click();
  await expect(
    page.getByRole("tab", { name: "蓝海线索", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await changeQuery(
    page,
    "/heat?topic=game%3Abalatro&topic=game%3Aslay-the-spire",
  );
  await expect(
    page.locator(".scope-box").filter({ hasText: "正在研究「" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "分析自己的搜索次数 →" }).click();
  await expect(
    page.getByRole("tab", { name: "热门类别", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
});

test("lab keeps recipe, duplicate and illegal add query behavior", async ({
  page,
}) => {
  await gotoApp(page, "/lab?recipe=aimed-buildcraft&add=piece-rotation");
  await hydrated(page);
  await expect(page.getByLabel("组合配方")).toHaveValue("aimed-buildcraft");
  await changeQuery(
    page,
    "/lab?recipe=missing&add=piece-rotation&add=score-threshold",
  );
  await expect(
    page.getByText("链接中的配方未收录", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("链接中的附加机制未收录", { exact: false }),
  ).toBeVisible();
  await changeQuery(page, "/lab?recipe=aimed-buildcraft&add=aimed-launch");
  await expect(
    page.getByText("链接中的附加机制已在当前组合中", { exact: false }),
  ).toBeVisible();
});

test("Compare resolves repeated ids and refreshes sides after a query change", async ({
  page,
}) => {
  await gotoApp(page, "/compare?left=peglin&right=balatro");
  await hydrated(page);
  await expect(page.getByLabel("左侧游戏", { exact: true })).toHaveValue(
    "peglin",
  );
  await expect(page.getByLabel("右侧游戏", { exact: true })).toHaveValue(
    "balatro",
  );
  await changeQuery(page, "/compare?left=balatro&left=peglin&right=balatro");
  await expect(page.getByLabel("左侧游戏", { exact: true })).toHaveValue(
    "balatro",
  );
  await expect(page.getByLabel("右侧游戏", { exact: true })).toHaveValue(
    "slay-the-spire",
  );
  await page.reload();
  await expect(page.getByLabel("右侧游戏", { exact: true })).toHaveValue(
    "slay-the-spire",
  );
});

test("raw artwork, favicon and CSS scenery respect the deployment mount", async ({
  page,
  request,
}) => {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400 && /\/(art|_next)\//.test(response.url()))
      failures.push(`${response.status()} ${response.url()}`);
  });
  await gotoApp(page, "/mechanics/score-threshold");
  await hydrated(page);
  const icon = page.locator('link[rel="icon"]').first();
  await expect(icon).toHaveAttribute("href", appPath("/icon.svg"));
  expect((await request.get(appPath("/icon.svg"))).status()).toBe(200);
  await expect
    .poll(() =>
      page
        .locator("main img")
        .first()
        .evaluate((img: HTMLImageElement) => img.naturalWidth),
    )
    .toBeGreaterThan(0);
  for (const src of await page
    .locator("img")
    .evaluateAll((images) =>
      images.map((image) => image.getAttribute("src")),
    )) {
    expect(src).toMatch(new RegExp(`^${appPath("/art/")}`));
  }
  const background = await page
    .locator(".assistant-small")
    .evaluate((element) => getComputedStyle(element).backgroundImage);
  expect(background).toContain(appPath("/art/room-dusk.webp"));
  expect(
    (await request.get(appPath("/mechanics/no-such-file/"))).status(),
  ).toBe(404);
  expect(failures).toEqual([]);
});
