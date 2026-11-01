import { gotoApp, appHref, appPath } from "./navigation";
import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

async function hydrated(page: Page) {
  await expect(page.locator("html")).toHaveAttribute(
    "data-effects",
    /^(full|reduced)$/,
  );
  await expect(page.locator('[hidden][id^="S:"]')).toHaveCount(0);
}

test("search shortcut accepts immediate typing and restores trigger focus", async ({
  page,
}) => {
  await gotoApp(page, "/");
  await hydrated(page);
  const trigger = page.getByRole("button", { name: "搜索档案（Ctrl K）" });
  await trigger.focus();
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", {
    name: "SEARCH ARCHIVE / 检索研究档案",
  });
  await expect(dialog).toBeVisible();
  await page.keyboard.type("Balatro");
  await expect(
    dialog.getByRole("textbox", { name: "搜索全部档案" }),
  ).toHaveValue("Balatro");
  await expect(dialog.getByRole("link")).toHaveCount(1);
  await expect(dialog.getByRole("link")).toContainText("Balatro");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Meta+k");
  await expect(
    dialog.getByRole("textbox", { name: "搜索全部档案" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  const settings = page.getByRole("button", { name: "动效设置", exact: true });
  await settings.click();
  await expect(
    page
      .getByRole("dialog", { name: "DISPLAY / 动效与性能" })
      .getByRole("button", { name: "关闭弹窗" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(settings).toBeFocused();
});

async function openCounts(page: Page) {
  const action = page.getByRole("button", { name: "分析自己的搜索次数 →" });
  if (await action.isVisible()) await action.click();
}
async function exportRecords(page: Page) {
  const ready = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "导出当前 JSON", exact: true })
    .click();
  const download = await ready;
  return JSON.parse(await readFile((await download.path())!, "utf8"));
}
const record = {
  id: "review-record-1",
  datasetId: "review-working-set",
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

test("imported working data survives case navigation and invalid or synthetic replacement, but resets on reload", async ({
  page,
  context,
}) => {
  await gotoApp(page, "/heat");
  await hydrated(page);
  await openCounts(page);
  const dialog = page.getByRole("dialog", { name: "IMPORT / 本地搜索记录" });
  const importData = async (value: unknown) => {
    await page.getByRole("button", { name: "导入数据 ⇧" }).click();
    await dialog.getByLabel("JSON 内容").fill(JSON.stringify(value));
    await dialog.getByRole("button", { name: "校验并替换本地数据 →" }).click();
  };
  const total = page.locator(".data-strip .metric").first().locator(".sr-only");
  await importData({ schemaVersion: 1, records: [record] });
  await expect(dialog).not.toBeVisible();
  await expect(total).toHaveText("123");
  await expect(page.locator(".page-head .seed")).toHaveText(
    "本地导入 · 来源待核验",
  );
  await page.getByRole("tab", { name: "热门机制", exact: true }).click();
  await page
    .locator(`.heat-inspector a[href^="${appPath("/games/")}"]`)
    .first()
    .click();
  await expect(page).toHaveURL(/\/games\/[^/?]+\/?$/);
  await hydrated(page);
  await page.getByRole("tab", { name: "热度标签", exact: true }).click();
  await expect(page.locator(".heat-mini .seed")).toHaveText(
    "本地导入 · 来源见数据说明",
  );
  await expect(page.locator(".heat-mini")).toContainText(
    "还没有这个主题的直接搜索记录",
  );
  await page.getByRole("link", { name: "机制研究室首页", exact: true }).click();
  await hydrated(page);
  await expect(page.locator(".home-heat-ranking")).toContainText("Arc Raiders");
  await expect(page.locator(".home-heat-ranking")).not.toContainText("123");
  await expect(page.locator(".home-opportunity-strip")).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "主导航", exact: true })
    .getByRole("link", { name: "热度观察", exact: true })
    .click();
  await hydrated(page);
  await openCounts(page);
  await expect(total).toHaveText("123");
  expect(await exportRecords(page)).toEqual({
    schemaVersion: 1,
    records: [record],
  });
  for (const [replacement, message] of [
    [
      { schemaVersion: 1, records: [{ id: "invalid" }] },
      "导入失败，原有数据保持不变",
    ],
    [
      { schemaVersion: 1, records: [{ ...record, sourceKind: "synthetic" }] },
      "这里不接收合成搜索数据",
    ],
  ] as const) {
    await importData(replacement);
    await expect(dialog.getByRole("alert")).toContainText(message);
    await page.keyboard.press("Escape");
    await expect(total).toHaveText("123");
    expect(await exportRecords(page)).toEqual({
      schemaVersion: 1,
      records: [record],
    });
  }
  const fresh = await context.newPage();
  await gotoApp(fresh, "/heat");
  await hydrated(fresh);
  await expect(
    fresh.getByRole("heading", { name: "2025 年搜索飙升游戏" }),
  ).toBeVisible();
  await openCounts(fresh);
  await expect(
    fresh
      .getByLabel("搜索数据集")
      .getByRole("option", { name: "review-working-set" }),
  ).toHaveCount(0);
  expect(await exportRecords(fresh)).toEqual({ schemaVersion: 1, records: [] });
  await fresh.close();
  await page.reload();
  await hydrated(page);
  await expect(
    page.getByRole("heading", { name: "2025 年搜索飙升游戏" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "清空本地记录", exact: true }),
  ).toHaveCount(0);
});

test("mixed imports containing synthetic records are rejected atomically", async ({
  page,
}) => {
  await gotoApp(page, "/heat");
  await hydrated(page);
  await openCounts(page);
  await page.getByRole("button", { name: "导入数据 ⇧" }).click();
  const dialog = page.getByRole("dialog", { name: "IMPORT / 本地搜索记录" });
  const records = [
    record,
    {
      ...record,
      id: "synthetic-only-test",
      datasetId: "synthetic-only-test",
      sourceKind: "synthetic",
    },
  ];
  await dialog
    .getByLabel("JSON 内容")
    .fill(JSON.stringify({ schemaVersion: 1, records }));
  await dialog.getByRole("button", { name: "校验并替换本地数据 →" }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "这里不接收合成搜索数据",
  );
  await page.keyboard.press("Escape");
  expect(await exportRecords(page)).toEqual({ schemaVersion: 1, records: [] });
  await expect(page.locator(".heat-ranking-table tbody tr")).toHaveCount(0);
});

test("mixed declared sources remain qualified in Compare while home keeps official historical ranks", async ({
  page,
}) => {
  const records = [
    { sourceKind: "site_log", count: 100 },
    { sourceKind: "import", count: 23 },
  ].map(({ sourceKind, count }) => ({
    ...record,
    id: `mixed-${sourceKind}`,
    datasetId: `mixed-${sourceKind}`,
    query: "Balatro",
    sourceKind,
    count,
    attributions: [
      { topicId: "game:balatro", weight: 1, mode: "direct" },
      { topicId: "combination:score-modifier", weight: 1, mode: "direct" },
    ],
  }));
  await gotoApp(page, "/heat");
  await hydrated(page);
  await openCounts(page);
  await page.getByRole("button", { name: "导入数据 ⇧" }).click();
  const dialog = page.getByRole("dialog", { name: "IMPORT / 本地搜索记录" });
  await dialog
    .getByLabel("JSON 内容")
    .fill(JSON.stringify({ schemaVersion: 1, records }));
  await dialog.getByRole("button", { name: "校验并替换本地数据 →" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.locator(".data-strip .metric").first().locator(".sr-only"),
  ).toHaveText("123");
  await page
    .getByRole("navigation", { name: "主导航", exact: true })
    .getByRole("link", { name: "游戏对比", exact: true })
    .click();
  await hydrated(page);
  await page.getByRole("button", { name: /搜索热度/ }).click();
  const balatro = page.locator(".heat-mini").filter({
    has: page.locator(`a[href="${appHref("/heat?topic=game%3Abalatro")}"]`),
  });
  await expect(balatro.locator(".mini-profile-numbers .sr-only")).toHaveText(
    "123",
  );
  await expect(balatro.locator(".seed")).toContainText("混合来源");
  await expect(balatro).not.toContainText("合成示例");
  const qualification =
    balatro.getByText(/不同来源的数据需要分别核对采集方式与范围/);
  for (const width of [768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(qualification).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      )
      .toBe(0);
    const bounds = await qualification.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole("link", { name: "机制研究室首页", exact: true }).click();
  await hydrated(page);
  await expect(page.locator(".home-heat-ranking")).toContainText("Arc Raiders");
  await expect(page.locator(".home-heat-ranking")).not.toContainText("123");
  await expect(page.locator(".home-opportunity-strip")).toHaveCount(0);
});
