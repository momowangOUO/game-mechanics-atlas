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

function readingArticle(page: import("@playwright/test").Page, id: string) {
  return page.locator(`article[data-mechanic-id="${id}"]`);
}

async function expectDimensionContents(
  page: import("@playwright/test").Page,
  dimensionId: string,
) {
  const groups = taxonomyGroups.filter(
    (group) => group.dimensionId === dimensionId,
  );
  await expect(page.locator("section[data-taxonomy-group]")).toHaveCount(
    groups.length,
  );
  await expect(page.locator("article[data-mechanic-id]")).toHaveCount(
    groups.flatMap((group) => group.mechanicIds).length,
  );
  const contents = page.getByRole("navigation", {
    name: "本维度目录",
    exact: true,
  });
  for (const group of groups) {
    await expect(
      contents.getByRole("link", { name: new RegExp(group.name) }),
    ).toHaveAttribute("href", `#group-${group.id}`);
    const section = page.locator(`section[data-taxonomy-group="${group.id}"]`);
    await expect(section).toBeVisible();
    for (const id of group.mechanicIds)
      await expect(readingArticle(page, id)).toBeVisible();
  }
  await expect(page.getByRole("tab")).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

async function expectFullDossier(
  page: import("@playwright/test").Page,
  id: string,
) {
  const article = readingArticle(page, id);
  const dossier = dossiers.find((mechanic) => mechanic.id === id)!;
  await expect(article).toBeVisible();
  for (const heading of ["设计作用", "设计风险", "纳入条件", "排除边界"])
    await expect(
      article.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
  for (const text of [
    dossier.definition,
    ...dossier.designValue,
    ...dossier.risks,
    ...dossier.inclusionRules,
    ...dossier.exclusionRules,
  ])
    await expect(article.getByText(text, { exact: true })).toBeVisible();
  await expect(article).toHaveCSS("overflow-y", "visible");
  await expect(article.getByRole("tab")).toHaveCount(0);
  await expect(
    article.getByRole("navigation", { name: /作用与风险|机制边界|游戏实例/ }),
  ).toHaveCount(0);
  const examples = mechanicExamples[id];
  const exampleArticles = article.locator("article");
  await expect(exampleArticles).toHaveCount(examples.length);
  for (const [index, example] of examples.entries()) {
    const entry = exampleArticles.nth(index);
    await expect(
      entry.getByText(example.observation, { exact: true }),
    ).toBeVisible();
    if (example.condition)
      await expect(
        entry.getByText(`适用条件：${example.condition}`, { exact: true }),
      ).toBeVisible();
    await expect(
      entry.getByRole("link", { name: /查看范围与来源/ }),
    ).toHaveAttribute(
      "href",
      appHref(
        `/games/${example.gameId}?scope=${encodeURIComponent(example.scopeId)}`,
      ),
    );
  }
}

test("a mechanic keeps its canonical path when a link contains a conflicting group", async ({
  page,
}) => {
  await gotoApp(page, "/taxonomy?group=movement-basics&mechanic=damage-health");
  const group = taxonomyGroups.find((group) =>
    group.mechanicIds.includes("damage-health"),
  )!;
  const selected = page
    .getByRole("navigation", { name: "分类维度", exact: true })
    .locator('[aria-current="page"]');
  await expect(selected).toHaveAttribute(
    "href",
    appHref(
      `/taxonomy?dimension=${group.dimensionId}#dimension-${group.dimensionId}`,
    ),
  );
  await expect(
    page.locator('[data-taxonomy-group="movement-basics"]'),
  ).toHaveCount(0);
  await expectDimensionContents(page, group.dimensionId);
  await expect(
    readingArticle(page, "damage-health").getByRole("link", {
      name: "完整机制档案 ↗",
    }),
  ).toHaveAttribute("href", appHref("/mechanics/damage-health"));
});

test("classification atlas links dimensions, groups and scoped game examples", async ({
  page,
}) => {
  await gotoApp(page, "/taxonomy");
  const dimensions = page.getByRole("navigation", {
    name: "分类维度",
    exact: true,
  });
  await expect(dimensions.locator('[aria-current="page"]')).toHaveCount(1);
  await expect(dimensions.getByRole("link")).toHaveCount(9);
  await dimensions.getByRole("link", { name: /构筑与配置/ }).click();
  await expectDimensionContents(page, "buildcraft");
  const group = taxonomyGroups.find(
    (group) => group.dimensionId === "buildcraft",
  )!;
  await page
    .getByRole("navigation", { name: "本维度目录", exact: true })
    .getByRole("link", { name: new RegExp(group.name) })
    .click();
  const reading = readingArticle(page, group.mechanicIds[0]);
  await expect(
    reading.getByRole("link", { name: /查看范围与来源/ }).first(),
  ).toHaveAttribute("href", /\/games\/.+\?scope=/);
  await expect(
    reading.getByRole("link", { name: "完整机制档案 ↗" }),
  ).toHaveAttribute("href", /\/mechanics\//);
  const search = page.getByRole("searchbox", { name: "搜索分类、机制与游戏" });
  await search.fill("Balatro");
  const results = page.getByRole("region", { name: "分类搜索结果" });
  await expect(results).toBeVisible();
  await expect(
    results.getByRole("link", { name: /Balatro/ }).first(),
  ).toHaveAttribute("href", appHref("/games/balatro"));
  await search.fill("no-such-classification-998877");
  await expect(results).toContainText("没有找到匹配的分类或机制");
});

test("mobile taxonomy retains complete dimension, group and mechanic lists with anchored navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoApp(page, "/taxonomy");
  const dimensions = page.getByRole("navigation", {
    name: "分类维度",
    exact: true,
  });
  await expect(dimensions.getByRole("link")).toHaveCount(9);
  await expect(
    page.getByRole("button", { name: /分类维度下一页/ }),
  ).toHaveCount(0);
  await dimensions
    .getByRole("link", { name: /变化与随机/ })
    .scrollIntoViewIfNeeded();
  await expect(
    dimensions.getByRole("link", { name: /变化与随机/ }),
  ).toBeInViewport();
  await dimensions.getByRole("link", { name: /构筑与配置/ }).click();
  await expectDimensionContents(page, "buildcraft");
  const groups = taxonomyGroups.filter(
    (group) => group.dimensionId === "buildcraft",
  );
  const first = groups[0];
  const reading = readingArticle(page, first.mechanicIds[0]);
  await expect(
    reading.getByRole("heading", { name: "纳入条件", exact: true }),
  ).toBeVisible();
  await expect(
    reading.getByRole("heading", { name: "排除边界", exact: true }),
  ).toBeVisible();
  await reading.getByRole("link", { name: "回到本组 ↑", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`#group-${first.id}$`));
  await expect(reading).toBeVisible();
  const final = readingArticle(page, groups.at(-1)!.mechanicIds.at(-1)!);
  await final
    .getByRole("link", { name: "完整机制档案 ↗" })
    .scrollIntoViewIfNeeded();
  await expect(
    final.getByRole("link", { name: "完整机制档案 ↗" }),
  ).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBe(0);
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight),
  ).toBeGreaterThan(844);
  await page.getByRole("link", { name: "分类怎么读 ↓", exact: true }).click();
  const guide = page.getByRole("region", { name: "分类层级说明", exact: true });
  await expect(guide).toBeVisible();
  await expect(guide.locator("article")).toHaveCount(7);
  await expect(
    guide.getByRole("link", { name: "复合类型 →", exact: true }),
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
    readingArticle(page, "in-run-deck-growth").getByRole("heading", {
      name: "局内扩充卡组",
      exact: true,
    }),
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
    await expectFullDossier(page, id);
    const reading = readingArticle(page, id);
    await reading
      .getByRole("heading", { name: "设计风险", exact: true })
      .scrollIntoViewIfNeeded();
    await expect(
      reading.getByRole("heading", { name: "设计风险", exact: true }),
    ).toBeInViewport();
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
  const reading = readingArticle(page, "permadeath");
  const example = mechanicExamples.permadeath.find((item) => item.condition)!;
  const article = reading
    .locator("article")
    .filter({ hasText: example.observation });
  const observation = article.getByText(example.observation, { exact: true });
  const condition = article.getByText(`适用条件：${example.condition}`, {
    exact: true,
  });
  await expect(observation).toBeVisible();
  await expect(condition).toBeVisible();
  await condition.scrollIntoViewIfNeeded();
  await expect(condition).toBeInViewport();
  const observationBounds = (await observation.boundingBox())!;
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
  await expectFullDossier(page, "automatic-resolution");
  const risk = readingArticle(page, "automatic-resolution")
    .getByRole("heading", { name: "设计风险", exact: true })
    .locator("..");
  await risk.locator("li").last().scrollIntoViewIfNeeded();
  await expect(risk.locator("li").last()).toBeInViewport();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  ).toBe(0);
});

test("desktop purpose and boundaries remain completely readable without pagers", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await gotoApp(page, "/taxonomy?mechanic=automatic-resolution");
  await expectFullDossier(page, "automatic-resolution");
  const reading = readingArticle(page, "automatic-resolution");
  await expect(
    reading.getByRole("button", { name: /下一页|上一页/ }),
  ).toHaveCount(0);
  for (const heading of ["设计作用", "设计风险", "纳入条件", "排除边界"]) {
    await reading
      .getByRole("heading", { name: heading, exact: true })
      .scrollIntoViewIfNeeded();
    await expect(
      reading.getByRole("heading", { name: heading, exact: true }),
    ).toBeInViewport();
  }
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
