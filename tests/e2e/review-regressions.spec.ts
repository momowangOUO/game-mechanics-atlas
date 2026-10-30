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
  await page.goto("/");
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

for (const sourceKind of ["import", "synthetic"] as const) {
  test(`${sourceKind} working data survives a case visit and invalid import, but resets on reload`, async ({
    page,
    context,
  }) => {
    const record = {
      id: "review-record-1",
      datasetId: "review-working-set",
      date: "2026-10-30",
      query: "计分",
      count: 123,
      region: "CN",
      language: "zh-CN",
      sourceKind,
      attributions: [
        { topicId: "mechanic:score-threshold", weight: 1, mode: "direct" },
      ],
    };
    const badge =
      sourceKind === "synthetic"
        ? "合成示例 · 非真实市场数据"
        : "本地导入 · 来源见数据说明";
    const total = page
      .locator(".data-strip .metric")
      .first()
      .locator(".sr-only");
    const reset = page.getByRole("button", {
      name: "恢复合成示例",
      exact: true,
    });
    const importDialog = page.getByRole("dialog", {
      name: "IMPORT / 本地搜索记录",
    });
    const exportRecords = async () => {
      const downloadReady = page.waitForEvent("download");
      await page
        .getByRole("button", { name: "导出当前JSON", exact: true })
        .click();
      const download = await downloadReady;
      return JSON.parse(await readFile((await download.path())!, "utf8"));
    };
    await page.goto("/heat");
    await hydrated(page);
    await page.getByRole("button", { name: "导入数据 ⇧" }).click();
    await importDialog
      .getByLabel("JSON 内容")
      .fill(JSON.stringify({ schemaVersion: 1, records: [record] }));
    await importDialog
      .getByRole("button", { name: "校验并替换本地数据 →" })
      .click();
    await expect(importDialog).not.toBeVisible();
    await expect(total).toHaveText("123");
    await expect(page.locator(".page-head .seed")).toHaveText(badge);
    await page.getByRole("tab", { name: "热门机制", exact: true }).click();
    await page.locator('.heat-inspector a[href^="/games/"]').first().click();
    await expect(page).toHaveURL(/\/games\/[^/?]+$/);
    await hydrated(page);
    await page.getByRole("tab", { name: "热度标签", exact: true }).click();
    await expect(page.locator(".heat-mini .seed")).toHaveText(badge);
    await expect(page.locator(".heat-mini")).toContainText(
      sourceKind === "synthetic" ? "本期合成示例没有" : "本期导入数据没有",
    );
    await page
      .getByRole("link", { name: "机制研究室首页", exact: true })
      .click();
    await expect(page).toHaveURL(/\/$/);
    await hydrated(page);
    await expect(page.locator(".home-heat-grid strong")).toHaveText("123");
    await expect(page.locator(".home-opportunity-strip .seed")).toHaveText(
      badge,
    );
    await page
      .getByRole("navigation", { name: "主导航", exact: true })
      .getByRole("link", { name: "热度观察", exact: true })
      .click();
    await expect(page).toHaveURL(/\/heat$/);
    await hydrated(page);
    await expect(total).toHaveText("123");
    await expect(reset).toBeVisible();
    await expect(page.locator(".page-head .seed")).toHaveText(badge);
    expect(await exportRecords()).toEqual({
      schemaVersion: 1,
      records: [record],
    });
    await page.getByRole("button", { name: "导入数据 ⇧" }).click();
    await importDialog
      .getByLabel("JSON 内容")
      .fill('{"schemaVersion":1,"records":[{"id":"invalid"}]}');
    await importDialog
      .getByRole("button", { name: "校验并替换本地数据 →" })
      .click();
    await expect(importDialog.getByRole("alert")).toContainText("整批未导入");
    await page.keyboard.press("Escape");
    await expect(total).toHaveText("123");
    expect(await exportRecords()).toEqual({
      schemaVersion: 1,
      records: [record],
    });
    const fresh = await context.newPage();
    await fresh.goto("/heat");
    await hydrated(fresh);
    await expect(
      fresh.getByRole("button", { name: "恢复合成示例", exact: true }),
    ).toHaveCount(0);
    await expect(
      fresh
        .getByLabel("搜索数据集")
        .getByRole("option", { name: "synthetic-demo-v1" }),
    ).toBeAttached();
    await fresh.close();
    await page.reload();
    await hydrated(page);
    await expect(reset).toHaveCount(0);
    await expect(
      page
        .getByLabel("搜索数据集")
        .getByRole("option", { name: "synthetic-demo-v1" }),
    ).toBeAttached();
    await expect(total).not.toHaveText("123");
  });
}
