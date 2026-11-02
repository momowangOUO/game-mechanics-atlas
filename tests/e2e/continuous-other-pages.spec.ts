import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { gotoApp } from "./navigation";

const dossier = JSON.parse(
  readFileSync("docs/research/mechanic-dossiers.json", "utf8"),
);
const evidence = JSON.parse(
  readFileSync("docs/research/game-evidence.json", "utf8"),
);
const recipes = JSON.parse(
  readFileSync("docs/research/genre-recipes.json", "utf8"),
);

async function noPageOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
}

for (const width of [320, 390, 768, 1440]) {
  test(`${width}px catalogs render every filtered result without pagination`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const [path, selector, count] of [
      ["/games", ".catalog-games .case-card", evidence.games.length],
      [
        "/mechanics",
        ".mechanic-grid .mechanic-card",
        dossier.mechanisms.length,
      ],
      ["/types", ".type-index-grid > a", recipes.compositeTypes.length],
      ["/sources", ".source-catalog > article", evidence.sources.length],
    ] as const) {
      await gotoApp(page, path);
      await expect(page.locator(selector)).toHaveCount(count);
      await expect(
        page.getByRole("navigation", { name: /分页|翻页/ }),
      ).toHaveCount(0);
      await noPageOverflow(page);
      await page.locator(selector).last().scrollIntoViewIfNeeded();
      await expect(page.locator(selector).last()).toBeVisible();
    }
    await gotoApp(page, "/mechanics");
    await page
      .getByRole("textbox", { name: "搜索机制", exact: true })
      .fill("aimed-launch");
    await expect(page.locator(".mechanic-grid .mechanic-card")).toHaveCount(1);
  });

  test(`${width}px game and comparison chapters stay visible with exact scope controls`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await gotoApp(page, "/games/minecraft");
    for (const name of ["机制记录", "核心循环", "机制关系", "搜索资料"]) {
      await expect(
        page.getByRole("region", { name, exact: true }),
      ).toBeVisible();
    }
    await expect(
      page.getByRole("navigation", { name: "游戏研究章节" }).getByRole("link"),
    ).toHaveCount(4);
    await expect(page.getByRole("tab", { name: /视图/ })).toHaveCount(0);
    await page
      .getByLabel("当前研究范围", { exact: true })
      .selectOption("minecraft:creative");
    await expect(
      page.getByText("这个模式的循环还未整理", { exact: true }),
    ).toBeVisible();
    await expect(page.getByTestId("game-loop")).toHaveCount(0);
    await noPageOverflow(page);

    await gotoApp(page, "/compare");
    for (const name of ["机制记录对比", "循环资源与构筑对比", "搜索热度对比"]) {
      await expect(
        page.getByRole("region", { name, exact: true }),
      ).toBeVisible();
    }
    await page.getByRole("button", { name: "全部记录", exact: true }).click();
    await expect(page.locator("#compare-mechanics tbody tr")).toHaveCount(
      dossier.mechanisms.length,
    );
    await expect(
      page.getByRole("navigation", { name: "机制对比翻页" }),
    ).toHaveCount(0);
    await expect(page.locator("#compare-mechanics details")).toHaveCount(0);
    await page
      .getByLabel("左侧游戏", { exact: true })
      .selectOption("minecraft");
    await page
      .getByLabel("左侧研究范围", { exact: true })
      .selectOption("minecraft:creative");
    await expect(
      page.getByText(
        "这个范围的循环、资源与成长笔记还未整理。可切换到默认范围查看已有笔记。",
        { exact: true },
      ),
    ).toBeVisible();
    await noPageOverflow(page);
  });
}

test("lab lists every candidate, selected mechanic and reference while top actions remain reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoApp(page, "/lab?recipe=aimed-buildcraft&add=piece-rotation");
  let candidates = page.locator('[class*="candidates"] > button');
  await expect(candidates).toHaveCount(dossier.mechanisms.length);
  for (const width of [320, 768, 1440, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await noPageOverflow(page);
    await expect(candidates).toHaveCount(dossier.mechanisms.length);
  }
  await candidates.last().scrollIntoViewIfNeeded();
  const controls = page.getByRole("navigation", { name: "切换编写步骤" });
  const bounds = await controls.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.y + bounds!.height).toBeLessThan(844);
  await controls.getByRole("button", { name: "下一步 →" }).click();
  candidates = page.locator(
    '[class*="candidates"] > button:not(:disabled)[aria-pressed="false"]',
  );
  for (let index = 0; index < 8; index += 1) await candidates.first().click();
  const selected = page.getByRole("region", { name: "当前组合" });
  const selectedCount = Number(
    (await selected.locator("h2 + span").innerText()).match(/\d+/)![0],
  );
  expect(selectedCount).toBeGreaterThan(6);
  await expect(selected.locator("li")).toHaveCount(selectedCount);
  await expect(page.getByRole("navigation", { name: /分页/ })).toHaveCount(0);
  await controls.getByRole("button", { name: "下一步 →" }).click();
  await controls
    .getByRole("button", { name: "生成提示词 ↗", exact: true })
    .click();
  const references = page.getByRole("region", {
    name: "参照线索",
    exact: true,
  });
  const referenceCount = Number(
    (await references.getByRole("heading").innerText()).match(/\d+/)![0],
  );
  expect(referenceCount).toBeGreaterThan(1);
  await expect(references.locator(":scope > div")).toHaveCount(referenceCount);
  await expect(page.locator("#research-prompt")).not.toHaveValue("");
  await page.locator("#research-prompt").fill("手动研究稿，保留现有约束。");
  await page.getByRole("button", { name: "重新生成…", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "替换手动修改的提示词？" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "保留当前内容" }).click();
  await expect(page.locator("#research-prompt")).toHaveValue(
    "手动研究稿，保留现有约束。",
  );
  await noPageOverflow(page);
});

test("own-count ranking displays more than seven measured topics without a pager", async ({
  page,
}) => {
  await gotoApp(page, "/heat");
  await page.getByRole("button", { name: "分析自己的搜索次数 →" }).click();
  await page.getByRole("button", { name: "导入数据 ⇧" }).click();
  // Isolated importer fixture; it is never added to the production dataset.
  const records = recipes.compositeTypes
    .slice(0, 10)
    .map((genre: { id: string; name: string }, index: number) => ({
      id: `continuous-test-${index}`,
      datasetId: "continuous-reading-test",
      date: "2026-11-02",
      query: genre.name,
      count: index + 1,
      region: "TEST",
      language: "zh",
      sourceKind: "site_log",
      attributions: [
        { topicId: `genre:${genre.id}`, weight: 1, mode: "direct" },
      ],
    }));
  await page
    .locator("#search-import-json")
    .fill(JSON.stringify({ schemaVersion: 1, records }));
  await page.getByRole("button", { name: "校验并替换本地数据 →" }).click();
  await page.getByRole("tab", { name: "热门类别", exact: true }).click();
  await expect(page.locator(".heat-ranking-table tbody tr")).toHaveCount(10);
  await expect(
    page.getByRole("navigation", { name: "热度排行分页" }),
  ).toHaveCount(0);
});
