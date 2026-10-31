import { gotoApp, appHref, appPath } from "./navigation";
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
const mechanicDirectory = JSON.parse(
  readFileSync("docs/research/mechanic-dossiers.json", "utf8"),
).mechanisms as { dimension: string }[];
const gameDirectory = JSON.parse(
  readFileSync("docs/research/game-evidence.json", "utf8"),
).games as { genreIds: string[] }[];

async function visit(page: Page, path: string) {
  const response = await gotoApp(page, path);
  await expect(page.locator("html")).toHaveAttribute(
    "data-effects",
    /^(full|reduced)$/,
  );
  // Next streams hidden copies until React has consumed the segment. Wait for
  // that real lifecycle condition before using selectors that include hidden DOM.
  await expect(page.locator('[hidden][id^="S:"]')).toHaveCount(0);
  return response;
}

test("heat charts hydrate without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await visit(page, "/heat");
  await expect(
    page.getByRole("tab", { name: "热门类别", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "热门机制", exact: true }).click();
  await expect(
    page.getByRole("tab", { name: "热门机制", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  expect(errors).toEqual([]);
});

test("global search opens by keyboard, handles empty results and navigates", async ({
  page,
}) => {
  await visit(page, "/");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", {
    name: "SEARCH ARCHIVE / 检索研究档案",
  });
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole("textbox", { name: "搜索全部档案" });
  await input.fill("no-such-archive-987");
  await expect(dialog.getByText("没有找到匹配的档案")).toBeVisible();
  await input.fill("Balatro");
  await dialog.getByRole("link").filter({ hasText: "Balatro" }).first().click();
  await expect(page).toHaveURL(/\/games\/balatro\/?$/);
  await expect(dialog).not.toBeVisible();
});

test("mechanics filter by canonical dimension, core tag and keyword", async ({
  page,
}) => {
  await visit(page, "/mechanics");
  await page
    .locator(".catalog-sidebar")
    .getByRole("button")
    .filter({ hasText: "核心交互" })
    .click();
  await expect(page.locator(".mechanic-card")).toHaveCount(
    Math.min(
      8,
      mechanicDirectory.filter((m) => m.dimension === "interaction").length,
    ),
  );
  await page.getByRole("textbox", { name: "搜索机制" }).fill("不存在的机制987");
  await expect(
    page.getByRole("heading", { name: "没有找到匹配档案" }),
  ).toBeVisible();
  await page
    .locator(".catalog-sidebar")
    .getByRole("button", { name: "重置", exact: true })
    .click();
  await page.getByLabel("适用核心玩法").selectOption("卡牌");
  await expect(page.locator(".result-count")).not.toHaveText(
    `${mechanicDirectory.length} 条档案`,
  );
  await page.locator(".mechanic-card").first().click();
  await expect(page).toHaveURL(/\/mechanics\/.+/);
  await expect(
    page.getByRole("heading", { name: "＋ 纳入条件", exact: true }),
  ).toBeVisible();
});

test("game scopes keep creative absence separate from survival unknown", async ({
  page,
}) => {
  await visit(page, "/games/minecraft");
  await page.getByLabel("当前研究范围").selectOption("minecraft:creative");
  const observed = page.locator(".observation-card");
  await expect(observed.filter({ hasText: "资源稀缺" })).toContainText(
    "不存在",
  );
  await page.getByLabel("当前研究范围").selectOption("minecraft:standard");
  await expect(observed.filter({ hasText: "不存在" })).toHaveCount(0);
  await page.getByRole("tab", { name: "循环视图" }).click();
  await expect(page.locator(".loop-step").first()).toBeVisible();
  await page.getByRole("tab", { name: "热度标签" }).click();
  await expect(
    page.getByText("本期合成示例没有给这个主题设置搜索记录。", {
      exact: false,
    }),
  ).toBeVisible();
});

test("game catalog filters real cases by type and literal search", async ({
  page,
}) => {
  await visit(page, "/games");
  await page.getByLabel("筛选传统类型").selectOption("deckbuilder");
  await expect(page.locator(".catalog-games .case-card")).toHaveCount(
    Math.min(
      6,
      gameDirectory.filter((g) => g.genreIds.includes("deckbuilder")).length,
    ),
  );
  await page.getByRole("textbox", { name: "搜索游戏" }).fill("Balatro");
  await expect(page.locator(".catalog-games .case-card")).toHaveCount(1);
  await page.getByRole("textbox", { name: "搜索游戏" }).fill("no-case-987");
  await expect(
    page.getByRole("heading", { name: "暂时没有匹配的游戏" }),
  ).toBeVisible();
});

test("graph selects, filters, zooms, drags and follows cooccurrence cases", async ({
  page,
}) => {
  await visit(page, "/graph");
  const graph = page.getByTestId("mechanic-graph");
  await expect(graph.locator(".react-flow__node").first()).toBeVisible();
  const viewport = graph.locator(".react-flow__viewport");
  const before = await viewport.getAttribute("style");
  await graph.locator(".react-flow__controls-zoomin").click();
  await expect(viewport).not.toHaveAttribute("style", before!);
  const node = graph.locator(".react-flow__node").first();
  const position = await node.getAttribute("style");
  const box = (await node.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + 55,
    box.y + box.height / 2 + 25,
    { steps: 8 },
  );
  await page.mouse.up();
  await expect(node).not.toHaveAttribute("style", position!);
  await page
    .getByLabel("聚焦机制", { exact: true })
    .selectOption("in-run-deck-growth");
  await expect(page.locator(".graph-inspector h2")).toHaveText("局内扩充卡组");
  await page
    .locator(".inspector-tabs")
    .getByRole("button", { name: "共现", exact: true })
    .click();
  await expect(page.locator(".cooccurrence-item").first()).toBeVisible();
  await page.locator(".cooccurrence-item").first().click();
  await expect(
    page.locator(`.graph-inspector a[href^="${appPath("/games/")}"]`).first(),
  ).toBeVisible();
  for (const check of await page.locator(".graph-dimensions input").all())
    await check.uncheck();
  await expect(
    graph.getByRole("heading", { name: "当前过滤条件没有节点" }),
  ).toBeVisible();
  await graph.getByRole("button", { name: "恢复全部维度" }).click();
  await expect(graph.locator(".react-flow__node").first()).toBeVisible();
});

test("heat rankings use raw demand and expose blue/red same-kind results", async ({
  page,
}) => {
  await visit(page, "/heat");
  const rows = page.locator(".heat-ranking-table tbody tr");
  await expect(rows.first()).toContainText("MOBA");
  await expect(rows.first()).toContainText("1,000 万");
  await expect(rows.nth(1)).toContainText("10 万");
  await page.getByRole("tab", { name: "蓝海线索", exact: true }).click();
  await expect(page.getByLabel("线索分比较组")).toHaveValue("combination");
  await expect(rows.first()).toContainText("方块旋转");
  await rows.first().getByRole("button").click();
  await expect(page.locator(".heat-inspector")).toContainText("样本有限");
  await page.getByRole("tab", { name: "红海观察", exact: true }).click();
  await page.getByLabel("线索分比较组").selectOption("genre");
  await expect(rows.first()).toContainText("Roguelite");
  await page.getByLabel("热度时间窗口").selectOption("7");
  await expect(page.locator(".heat-window-note")).toContainText("2026-10-24");
});

test("search import is atomic and preserves synthetic origin", async ({
  page,
}) => {
  await visit(page, "/heat");
  await page.getByRole("button", { name: "导入数据 ⇧" }).click();
  const dialog = page.getByRole("dialog", { name: "IMPORT / 本地搜索记录" });
  await dialog.getByLabel("JSON 内容").fill('{"schemaVersion":1,"records":[}');
  await dialog.getByRole("button", { name: "校验并替换本地数据 →" }).click();
  await expect(dialog.getByRole("alert")).toContainText("JSON 语法不正确");
  await dialog
    .getByLabel("JSON 内容")
    .fill('{"schemaVersion":1,"records":[{"id":"bad"}]}');
  await dialog.getByRole("button", { name: "校验并替换本地数据 →" }).click();
  await expect(dialog.getByRole("alert")).toContainText(
    "导入失败，原有数据保持不变",
  );
  const record = {
    id: "test-1",
    datasetId: "local-test",
    date: "2026-10-30",
    query: "计分",
    count: 100,
    region: "CN",
    language: "zh-CN",
    sourceKind: "synthetic",
    attributions: [
      { topicId: "mechanic:score-threshold", weight: 1, mode: "direct" },
    ],
  };
  await dialog
    .getByLabel("JSON 内容")
    .fill(JSON.stringify({ schemaVersion: 1, records: [record] }));
  await dialog.getByRole("button", { name: "校验并替换本地数据 →" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByLabel("搜索数据集").getByRole("option", { name: "local-test" }),
  ).toBeAttached();
  await expect(
    page.getByText("合成示例 · 非真实市场数据").first(),
  ).toBeVisible();
  await page.getByRole("tab", { name: "热门机制", exact: true }).click();
  await expect(page.locator(".heat-ranking-table tbody tr")).toHaveCount(1);
  await expect(page.locator(".heat-ranking-table")).toContainText(
    "日期记录不完整",
  );
  await expect(page.locator(".heat-ranking-table")).toContainText(
    "暂无可比数据",
  );
  await page.getByRole("button", { name: "恢复合成示例", exact: true }).click();
  await expect(
    page
      .getByLabel("搜索数据集")
      .getByRole("option", { name: "synthetic-demo-v1" }),
  ).toBeAttached();
});

test("compare swaps the selected scopes and exposes unknown observations", async ({
  page,
}) => {
  await visit(page, "/compare?left=minecraft&right=balatro");
  await page
    .getByLabel("左侧研究范围", { exact: true })
    .selectOption("minecraft:creative");
  await page.getByRole("button", { name: "全部记录", exact: true }).click();
  await expect(page.locator("table")).toContainText("尚未确认");
  await page.getByRole("button", { name: "交换左右游戏与研究范围" }).click();
  await expect(page.getByLabel("右侧研究范围", { exact: true })).toHaveValue(
    "minecraft:creative",
  );
  await page.getByRole("button", { name: /循环与构筑/ }).click();
  await expect(
    page.getByText("你已切换到其他研究范围。", { exact: false }),
  ).toBeVisible();
});

test("reduced motion and dialog escape restore keyboard focus", async ({
  page,
}) => {
  await visit(page, "/");
  await expect(page.locator("html")).toHaveAttribute("data-effects", "reduced");
  const trigger = page.getByRole("button", { name: "动效设置", exact: true });
  await trigger.click();
  await expect(
    page.getByRole("dialog", { name: "DISPLAY / 动效与性能" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("mobile tools use drawers and have no document overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const path of [
    "/",
    "/mechanics",
    "/games",
    "/games/balatro",
    "/mechanics/score-threshold",
    "/graph",
    "/heat",
    "/compare",
    "/types",
    "/method",
    "/sources",
  ]) {
    await visit(page, path);
    await expect(page.locator("main")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
      path,
    ).toBe(0);
  }
  await visit(page, "/mechanics");
  await page.getByRole("button", { name: "筛选", exact: true }).click();
  const filter = page.getByRole("dialog");
  await expect(filter).toBeVisible();
  await filter.getByLabel("适用核心玩法").selectOption("卡牌");
  await page.keyboard.press("Escape");
  await expect(filter).not.toBeVisible();
  await page.getByRole("button", { name: "打开导航菜单" }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: /混合实验室/ })
    .click();
  await expect(page).toHaveURL(/\/lab\/?$/);
});

test("invalid archive route has a usable not-found page", async ({ page }) => {
  const response = await visit(page, "/mechanics/no-such-mechanic");
  expect(response?.status()).toBe(404);
  await expect(page.locator("main")).toContainText("档案");
  await expect(
    page.locator(`main a[href="${appHref("/mechanics")}"]`).first(),
  ).toBeVisible();
});

test("lab keeps analyzed snapshots and explains a timing conflict", async ({
  page,
}) => {
  await visit(page, "/lab?recipe=aimed-buildcraft");
  await expect(page.getByLabel("组合配方")).toHaveValue("aimed-buildcraft");
  await page.getByRole("button", { name: /^分析当前组合/ }).click();
  await expect(
    page.getByRole("tab", { name: "循环与分工", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "实验步骤", exact: true })
    .getByRole("button", { name: /核心/ })
    .click();
  await page
    .getByRole("combobox", { name: "核心机制", exact: true })
    .selectOption("real-time-update");
  await expect(page.getByText("组合已修改，以下仍是上次分析。")).toBeVisible();
  await page
    .getByRole("navigation", { name: "实验步骤", exact: true })
    .getByRole("button", { name: /配料/ })
    .click();
  await page.getByRole("button", { name: "流程与结构", exact: true }).click();
  await page
    .getByRole("searchbox", { name: "搜索机制" })
    .fill("sequential-turns");
  await page.getByRole("checkbox", { name: /轮流行动/ }).check();
  await page.getByRole("button", { name: /^重新分析当前组合/ }).click();
  await page.getByRole("tab", { name: "协同与冲突", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("冲突与张力 · 1 条");
  await expect(page.getByRole("tabpanel")).toContainText("轮流");
  await page.getByRole("tab", { name: "调整与边界", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("不同阶段");
  await visit(page, "/lab?recipe=missing-recipe");
  await expect(
    page.getByText("链接中的配方未收录，已恢复默认组合。", { exact: false }),
  ).toBeVisible();
});

test("full motion can be selected while system reduction takes priority", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    reducedMotion: "no-preference",
    viewport: { width: 1440, height: 900 },
  });
  await context.addInitScript(() =>
    localStorage.setItem("atlas.motion", "full"),
  );
  const page = await context.newPage();
  await visit(page, "/");
  await expect(page.locator("html")).toHaveAttribute("data-effects", "full");
  await expect(
    page.getByRole("region", { name: "知识库规模", exact: true }),
  ).toContainText(String(mechanicDirectory.length));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-effects", "reduced");
  await context.close();
});
