import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function hydrated(page: Page) {
  await expect(page.locator("html")).toHaveAttribute(
    "data-effects",
    /^(full|reduced)$/,
  );
  await expect(page.locator('[hidden][id^="S:"]')).toHaveCount(0);
}

async function importRecords(page: Page, records: unknown[]) {
  await page.goto("/heat");
  await hydrated(page);
  await page.getByRole("button", { name: "导入数据 ⇧" }).click();
  const dialog = page.getByRole("dialog", { name: "IMPORT / 本地搜索记录" });
  await dialog
    .getByLabel("JSON 内容")
    .fill(JSON.stringify({ schemaVersion: 1, records }));
  await dialog.getByRole("button", { name: "校验并替换本地数据 →" }).click();
  await expect(dialog).not.toBeVisible();
}

for (const entry of ["home preview", "case relations"] as const) {
  test(`${entry} SVG link retains imported data and real link behavior`, async ({
    page,
    context,
  }) => {
    const record = {
      id: "svg-session-record",
      datasetId: "svg-session",
      date: "2026-10-30",
      query: "计分",
      count: 123,
      region: "CN",
      language: "zh-CN",
      sourceKind: "import",
      attributions: [
        { topicId: "mechanic:score-threshold", weight: 1, mode: "direct" },
      ],
    };
    await importRecords(page, [record]);
    if (entry === "home preview") {
      await page
        .getByRole("link", { name: "机制研究室首页", exact: true })
        .click();
    } else {
      await page.getByRole("tab", { name: "热门机制", exact: true }).click();
      await page.locator('.heat-inspector a[href="/games/balatro"]').click();
      await hydrated(page);
      await page.getByRole("tab", { name: "关系视图", exact: true }).click();
    }
    await hydrated(page);
    const node = page
      .locator(
        entry === "home preview"
          ? ".relation-preview a"
          : ".case-relation-graph a",
      )
      .first();
    const href = (await node.getAttribute("href"))!;
    expect(href).toMatch(/^\/mechanics\//);
    // An intentional new tab owns a fresh provider; the original stays imported.
    const tabReady = context.waitForEvent("page");
    await node.click({ button: "middle" });
    const fresh = await tabReady;
    await expect(fresh).toHaveURL(new RegExp(`${href}$`));
    await hydrated(fresh);
    await fresh
      .getByRole("navigation", { name: "主导航", exact: true })
      .getByRole("link", { name: "热度观察", exact: true })
      .click();
    await hydrated(fresh);
    await expect(
      fresh.getByRole("button", { name: "恢复合成示例", exact: true }),
    ).toHaveCount(0);
    await fresh.close();
    const documents: string[] = [];
    page.on("request", (request) => {
      if (
        request.isNavigationRequest() &&
        request.resourceType() === "document"
      )
        documents.push(request.url());
    });
    if (entry === "home preview") await node.click();
    else {
      await node.focus();
      await page.keyboard.press("Enter");
    }
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await hydrated(page);
    await page
      .getByRole("navigation", { name: "主导航", exact: true })
      .getByRole("link", { name: "热度观察", exact: true })
      .click();
    await hydrated(page);
    await expect(
      page.locator(".data-strip .metric").first().locator(".sr-only"),
    ).toHaveText("123");
    const downloadReady = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "导出当前JSON", exact: true })
      .click();
    const download = await downloadReady;
    expect(
      JSON.parse(await readFile((await download.path())!, "utf8")),
    ).toEqual({ schemaVersion: 1, records: [record] });
    expect(documents).toEqual([]);
    await page.reload();
    await hydrated(page);
    await expect(
      page.getByRole("button", { name: "恢复合成示例", exact: true }),
    ).toHaveCount(0);
  });
}

test("complete measured zeros display zero and flat trend in case and Compare", async ({
  page,
}) => {
  const records = Array.from({ length: 60 }, (_, index) => ({
    id: `zero-${index}`,
    datasetId: "complete-zero-periods",
    date: new Date(Date.UTC(2026, 8, 1 + index)).toISOString().slice(0, 10),
    query: "Balatro",
    count: 0,
    region: "CN",
    language: "zh-CN",
    sourceKind: "import",
    attributions: [{ topicId: "game:balatro", weight: 1, mode: "direct" }],
  }));
  await importRecords(page, records);
  await page.getByRole("tab", { name: "游戏关注", exact: true }).click();
  await page
    .locator('.heat-inspector a[href="/games/balatro"]')
    .first()
    .click();
  await hydrated(page);
  await page.getByRole("tab", { name: "热度标签", exact: true }).click();
  const caseMini = page.locator(".heat-mini");
  await expect
    .soft(caseMini.locator(".mini-profile-numbers .sr-only"))
    .toHaveText("0", { timeout: 2000 });
  await expect
    .soft(
      caseMini.locator(".mini-profile-numbers > div").nth(1).locator("strong"),
    )
    .toHaveText("0.0%", { timeout: 2000 });
  await page
    .getByRole("navigation", { name: "主导航", exact: true })
    .getByRole("link", { name: "游戏对比", exact: true })
    .click();
  await hydrated(page);
  await page.getByRole("button", { name: /搜索热度/ }).click();
  const measured = page
    .locator(".heat-mini")
    .filter({ has: page.locator('a[href="/heat?topic=game%3Abalatro"]') });
  await expect
    .soft(measured.locator(".mini-profile-numbers .sr-only"))
    .toHaveText("0", { timeout: 2000 });
  await expect
    .soft(
      measured.locator(".mini-profile-numbers > div").nth(1).locator("strong"),
    )
    .toHaveText("0.0%", { timeout: 2000 });
  const missing = page.locator(".heat-mini").filter({
    has: page.locator('a[href="/heat?topic=game%3Aslay-the-spire"]'),
  });
  await expect(missing).toContainText("本期导入数据没有这个主题的搜索记录");
  await expect(missing.locator(".mini-profile-numbers")).toHaveCount(0);
});
