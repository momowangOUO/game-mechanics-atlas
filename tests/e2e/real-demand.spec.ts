import { test, expect } from "@playwright/test";
import { gotoApp } from "./navigation";

test("default demand page uses official historical search data and explicitly missing current measurements", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await gotoApp(page, "/heat");
  await expect(
    page.getByRole("heading", { name: "2025 年搜索飙升游戏" }),
  ).toBeVisible();
  const ranking = page.getByRole("table", {
    name: "2025全球游戏飙升搜索官方榜单",
  });
  await expect(ranking.locator("tbody tr")).toHaveCount(10);
  await expect(ranking.locator("tbody tr").first()).toContainText(
    "Arc Raiders",
  );
  await expect(page.getByText("Google 官方资料 · 2025 · 全球")).toBeVisible();
  await expect(
    page.getByText(/Google Trends explore 返回 HTTP 429/),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "恢复合成示例" })).toHaveCount(
    0,
  );
  await expect(page.getByText("恐怖相关方向（虚构示例）")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("live count importer rejects synthetic records and resetting keeps the real snapshot", async ({
  page,
}) => {
  await gotoApp(page, "/heat");
  await page.getByRole("button", { name: "分析自己的搜索次数 →" }).click();
  await page.getByRole("button", { name: "导入数据 ⇧" }).click();
  await page.locator("#search-import-json").fill(
    JSON.stringify({
      schemaVersion: 1,
      records: [
        {
          id: "test-only",
          datasetId: "test",
          date: "2026-10-30",
          query: "test-only",
          count: 100,
          region: "CN",
          language: "zh",
          sourceKind: "synthetic",
          attributions: [{ topicId: "game:tetris", weight: 1, mode: "direct" }],
        },
      ],
    }),
  );
  await page.getByRole("button", { name: "校验并替换本地数据 →" }).click();
  await expect(
    page
      .getByRole("dialog", { name: "IMPORT / 本地搜索记录" })
      .getByRole("alert"),
  ).toContainText("这里不接收合成搜索数据");
  await page.getByRole("button", { name: "取消", exact: true }).click();
  await page.getByRole("button", { name: "← 返回真实搜索资料" }).click();
  await expect(
    page.getByRole("heading", { name: "2025 年搜索飙升游戏" }),
  ).toBeVisible();
});
