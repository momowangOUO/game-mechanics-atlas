import { expect, test } from "@playwright/test";
import { gotoApp, appHref } from "./navigation";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import type {
  TaxonomyExample,
  TaxonomyGroup,
} from "../../src/data/taxonomy-reference";
// Reuse the repository's Node loader so JSON-backed canonical data has no Next runtime dependency.
const { mechanicExamples, taxonomyGroups } = JSON.parse(
  execFileSync(
    process.execPath,
    [
      "--import",
      "./scripts/register-typescript.mjs",
      "--input-type=module",
      "-e",
      "import {mechanicExamples,taxonomyGroups} from './src/data/taxonomy-reference.ts';process.stdout.write(JSON.stringify({mechanicExamples,taxonomyGroups}));",
    ],
    { encoding: "utf8" },
  ),
) as {
  mechanicExamples: Record<string, TaxonomyExample[]>;
  taxonomyGroups: TaxonomyGroup[];
};
const dossiers = JSON.parse(
  readFileSync("docs/research/mechanic-dossiers.json", "utf8"),
).mechanisms as {
  id: string;
  definition: string;
  designValue: string[];
  risks: string[];
  inclusionRules: string[];
  exclusionRules: string[];
}[];

test("a mechanic keeps its canonical path when a link contains a conflicting group", async ({
  page,
}) => {
  await gotoApp(page, "/taxonomy?group=movement-basics&mechanic=damage-health");
  const path = page.getByLabel("当前分类路径", { exact: true });
  await expect(path).toContainText("规则与结算");
  await expect(path).not.toContainText("移动与攀越");
  const reading = page.getByRole("region", { name: "机制阅读卡", exact: true });
  await expect(reading).toBeVisible();
  await expect(
    reading.getByRole("link", { name: "完整机制档案 ↗" }),
  ).toHaveAttribute("href", appHref("/mechanics/damage-health"));
});

test("classification atlas drills from dimensions to a scoped game example", async ({
  page,
}) => {
  await gotoApp(page, "/taxonomy");
  const dimensions = page.getByRole("region", {
    name: "一级分类维度",
    exact: true,
  });
  await expect(dimensions.getByRole("button", { pressed: true })).toHaveCount(
    1,
  );
  await dimensions.getByRole("button", { name: /构筑与配置/ }).click();
  const groups = page.getByRole("region", {
    name: "二级机制分组",
    exact: true,
  });
  await groups.locator("button[aria-pressed]").first().click();
  const mechanisms = page.getByRole("region", {
    name: "三级原子机制",
    exact: true,
  });
  await mechanisms.locator("button[aria-pressed]").first().click();
  const reading = page.getByRole("region", { name: "机制阅读卡", exact: true });
  await expect(reading).toBeVisible();
  await reading.getByRole("tab", { name: "典型游戏", exact: true }).click();
  await expect(
    reading.getByRole("link", { name: /查看范围与来源/ }),
  ).toHaveAttribute("href", /\/games\/.+\?scope=/);
  await expect(
    reading.getByRole("link", { name: "完整机制档案 ↗" }),
  ).toHaveAttribute("href", /\/mechanics\//);
  await page
    .getByRole("searchbox", { name: "搜索分类、机制与游戏" })
    .fill("Balatro");
  const results = page.getByRole("region", { name: "分类搜索结果" });
  await expect(results).toBeVisible();
  await expect(
    results.getByRole("link", { name: /Balatro/ }).first(),
  ).toBeVisible();
  await expect(
    results.getByRole("link", { name: /Balatro/ }).first(),
  ).toHaveAttribute("href", appHref("/games/balatro"));
  await page
    .getByRole("searchbox", { name: "搜索分类、机制与游戏" })
    .fill("no-such-classification-998877");
  await expect(
    page.getByText("没有找到匹配的分类或机制", { exact: true }),
  ).toBeVisible();
});

test("mobile taxonomy shows complete scrolling lists and preserves a selected mechanism on return", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoApp(page, "/taxonomy");
  const dimensions = page.getByRole("region", {
    name: "一级分类维度",
    exact: true,
  });
  await expect(dimensions).toBeVisible();
  await expect(dimensions.locator("button[aria-pressed]:visible")).toHaveCount(
    9,
  );
  await expect(
    page.getByRole("button", { name: "分类维度下一页", exact: true }),
  ).toHaveCount(0);
  await dimensions
    .getByRole("button", { name: /变化与随机/ })
    .scrollIntoViewIfNeeded();
  await expect(
    dimensions.getByRole("button", { name: /变化与随机/ }),
  ).toBeInViewport();
  await dimensions.getByRole("button", { name: /构筑与配置/ }).click();
  const groups = page.getByRole("region", {
    name: "二级机制分组",
    exact: true,
  });
  await expect(groups).toBeVisible();
  await expect(dimensions).not.toBeVisible();
  const expectedGroups = taxonomyGroups.filter(
    (group) => group.dimensionId === "buildcraft",
  );
  await expect(groups.locator("button[aria-pressed]")).toHaveCount(
    expectedGroups.length,
  );
  await expect(
    groups.getByRole("navigation", { name: "机制分组", exact: true }),
  ).toHaveCount(0);
  await groups.locator("button[aria-pressed]").first().click();
  const mechanisms = page.getByRole("region", {
    name: "三级原子机制",
    exact: true,
  });
  await expect(mechanisms).toBeVisible();
  await expect(mechanisms.locator("button[aria-pressed]")).toHaveCount(
    expectedGroups[0].mechanicIds.length,
  );
  await expect(
    mechanisms.getByRole("navigation", { name: "原子机制", exact: true }),
  ).toHaveCount(0);
  const selected = await mechanisms
    .locator("button[aria-pressed]")
    .first()
    .locator("strong")
    .innerText();
  await mechanisms.locator("button[aria-pressed]").first().click();
  const reading = page.getByRole("region", { name: "机制阅读卡", exact: true });
  await expect(
    reading.getByRole("heading", { name: selected, exact: true }),
  ).toBeVisible();
  await reading.getByRole("tab", { name: "怎么区分" }).click();
  await expect(
    reading.getByRole("heading", { name: "纳入条件", exact: true }),
  ).toBeVisible();
  await expect(
    reading.getByRole("heading", { name: "排除边界" }),
  ).toBeVisible();
  await expect(
    reading.getByRole("navigation", { name: "机制边界", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "分类浏览层级" })
    .getByRole("button", { name: /03\s*机制/ })
    .click();
  await expect(
    mechanisms.locator("button[aria-pressed=true]").locator("strong"),
  ).toHaveText(selected);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBe(0);
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight),
  ).toBeGreaterThan(844);
  const finalMechanism = mechanisms.locator("button[aria-pressed]").last();
  await finalMechanism.scrollIntoViewIfNeeded();
  await expect(finalMechanism).toBeInViewport();
  await page.getByRole("button", { name: "分类怎么读", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "分类层级说明" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "层级说明下一页", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "查看复合类型 →" }),
  ).toHaveAttribute("href", appHref("/types"));
});

test("mechanism detail keeps its classification path addressable", async ({
  page,
}) => {
  await gotoApp(page, "/mechanics/in-run-deck-growth");
  const context = page.getByRole("region", { name: "机制分类位置" });
  await expect(
    context.getByRole("link", { name: "玩法分类图鉴", exact: true }),
  ).toHaveAttribute("href", appHref("/taxonomy"));
  await context.getByRole("link", { name: "对照同组机制 →" }).click();
  await expect(
    page
      .getByRole("region", { name: "机制阅读卡", exact: true })
      .getByRole("heading", { name: "局内扩充卡组", exact: true }),
  ).toBeVisible();
});

test("compact phone exposes complete purpose, boundary and scoped examples without reading pagination", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  for (const id of [
    "event-director",
    "mutable-environment",
    "randomized-market",
    "hold-input",
    "combo-chain",
  ]) {
    await gotoApp(page, `/taxonomy?mechanic=${id}`);
    const reader = page.getByRole("region", {
      name: "机制阅读卡",
      exact: true,
    });
    const panel = reader.getByRole("tabpanel");
    const dossier = dossiers.find((mechanic) => mechanic.id === id)!;
    await reader.getByRole("tab", { name: "有什么用", exact: true }).click();
    for (const heading of ["标准定义", "设计作用", "常见设计问题"])
      await expect(
        panel.getByRole("heading", { name: heading, exact: true }),
      ).toBeVisible();
    for (const text of [
      dossier.definition,
      ...dossier.designValue,
      ...dossier.risks,
    ])
      await expect(panel.getByText(text, { exact: true })).toBeVisible();
    await expect(
      panel.getByRole("navigation", { name: "作用与风险", exact: true }),
    ).toHaveCount(0);
    await panel
      .getByRole("heading", { name: "常见设计问题", exact: true })
      .scrollIntoViewIfNeeded();
    await expect(
      panel.getByRole("heading", { name: "常见设计问题", exact: true }),
    ).toBeInViewport();
    await expect(panel).toHaveCSS("overflow-y", "visible");
    await reader.getByRole("tab", { name: "怎么区分", exact: true }).click();
    for (const heading of ["纳入条件", "排除边界"])
      await expect(
        panel.getByRole("heading", { name: heading, exact: true }),
      ).toBeVisible();
    for (const text of [...dossier.inclusionRules, ...dossier.exclusionRules])
      await expect(panel.getByText(text, { exact: true })).toBeVisible();
    await expect(
      panel.getByRole("navigation", { name: "机制边界", exact: true }),
    ).toHaveCount(0);
    await reader.getByRole("tab", { name: "典型游戏", exact: true }).click();
    const examples = mechanicExamples[id];
    await expect(panel.locator("article")).toHaveCount(examples.length);
    for (const [index, example] of examples.entries()) {
      const article = panel.locator("article").nth(index);
      await expect(
        article.getByText(example.observation, { exact: true }),
      ).toBeVisible();
      if (example.condition)
        await expect(
          article.getByText(`成立条件：${example.condition}`, { exact: true }),
        ).toBeVisible();
      await expect(
        article.getByRole("link", { name: /查看范围与来源/ }),
      ).toBeVisible();
      await expect(
        article.getByRole("link", { name: /查看范围与来源/ }),
      ).toHaveAttribute(
        "href",
        appHref(`/games/${example.gameId}?scope=${example.scopeId}`),
      );
    }
    await expect(
      panel.getByRole("navigation", { name: "游戏实例", exact: true }),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
      id,
    ).toBe(0);
  }
});

test("compact phone reads long scoped evidence and its condition without overlap", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await gotoApp(page, "/taxonomy?mechanic=permadeath");
  const reading = page.getByRole("region", { name: "机制阅读卡", exact: true });
  await reading.getByRole("tab", { name: "典型游戏", exact: true }).click();
  const example = mechanicExamples.permadeath.find((item) => item.condition)!;
  const article = reading
    .getByRole("tabpanel")
    .locator("article")
    .filter({ hasText: example.observation });
  await expect(
    article.getByText(example.observation, { exact: true }),
  ).toBeVisible();
  const condition = article.getByText(`成立条件：${example.condition}`, {
    exact: true,
  });
  await expect(condition).toBeVisible();
  await condition.scrollIntoViewIfNeeded();
  await expect(condition).toBeInViewport();
  const observationBounds = (await article
    .getByText(example.observation, { exact: true })
    .boundingBox())!;
  const conditionBounds = (await condition.boundingBox())!;
  expect(conditionBounds.y).toBeGreaterThanOrEqual(
    observationBounds.y + observationBounds.height,
  );
  await expect(
    reading.getByText("条件实例 · 下一页查看成立条件。", { exact: true }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight),
  ).toBeGreaterThan(640);
  await gotoApp(page, "/taxonomy?mechanic=automatic-resolution");
  const risk = page.getByRole("region", { name: "机制阅读卡", exact: true });
  await risk.getByRole("tab", { name: "有什么用", exact: true }).click();
  await expect(
    risk.getByRole("heading", { name: "常见设计问题", exact: true }),
  ).toBeVisible();
  const riskPanel = risk.getByRole("tabpanel");
  const dossier = dossiers.find(
    (mechanic) => mechanic.id === "automatic-resolution",
  )!;
  for (const text of [
    dossier.definition,
    ...dossier.designValue,
    ...dossier.risks,
  ])
    await expect(riskPanel.getByText(text, { exact: true })).toBeVisible();
  await riskPanel.locator("li").last().scrollIntoViewIfNeeded();
  await expect(riskPanel.locator("li").last()).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBe(0);
});

test("desktop purpose and boundary retain focused reading pages", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await gotoApp(page, "/taxonomy?mechanic=automatic-resolution");
  const reading = page.getByRole("region", { name: "机制阅读卡", exact: true });
  const panel = reading.getByRole("tabpanel");
  await reading.getByRole("tab", { name: "有什么用", exact: true }).click();
  for (const [index, heading] of [
    "标准定义",
    "设计作用",
    "常见设计问题",
  ].entries()) {
    await expect(
      panel.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
    if (index < 2)
      await panel
        .getByRole("button", { name: "作用与风险下一页", exact: true })
        .click();
  }
  await reading.getByRole("tab", { name: "怎么区分", exact: true }).click();
  await expect(
    panel.getByRole("heading", { name: "纳入条件", exact: true }),
  ).toBeVisible();
  await expect(
    panel.getByRole("heading", { name: "排除边界", exact: true }),
  ).toHaveCount(0);
  await panel
    .getByRole("button", { name: "机制边界下一页", exact: true })
    .click();
  await expect(
    panel.getByRole("heading", { name: "排除边界", exact: true }),
  ).toBeVisible();
});

test("game evidence links select their explicit scope and reject another game's scope", async ({
  page,
}) => {
  await gotoApp(page, "/games/minecraft?scope=minecraft:multiplayer");
  await expect(page.getByLabel("当前研究范围")).toHaveValue(
    "minecraft:multiplayer",
  );
  await gotoApp(
    page,
    "/games/minecraft?scope=cult-of-the-lamb:permadeath-challenge",
  );
  await expect(page.getByLabel("当前研究范围")).toHaveValue(
    "minecraft:standard",
  );
  await gotoApp(
    page,
    "/games/minecraft?scope=minecraft:creative&scope=minecraft:multiplayer",
  );
  await expect(page.getByLabel("当前研究范围")).toHaveValue(
    "minecraft:standard",
  );
});
