import { expect, test } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { gotoApp, appHref } from "./navigation";
const catalog = JSON.parse(
  execFileSync(
    process.execPath,
    [
      "--import",
      "./scripts/register-typescript.mjs",
      "--input-type=module",
      "-e",
      "import {taxonomyGroups} from './src/data/taxonomy-reference.ts';import {mechanics} from './src/lib/knowledge.ts';process.stdout.write(JSON.stringify({groups:taxonomyGroups,mechanics}));",
    ],
    { encoding: "utf8" },
  ),
);

test("the whole selected dimension is readable without stages or page controls", async ({
  page,
}) => {
  await gotoApp(page, "/taxonomy?dimension=interaction");
  const groups = catalog.groups.filter(
    (group: { dimensionId: string }) => group.dimensionId === "interaction",
  );
  const mechanics = catalog.mechanics.filter(
    (mechanic: { dimension: string }) => mechanic.dimension === "interaction",
  );
  await expect(page.locator("section[data-taxonomy-group]")).toHaveCount(
    groups.length,
  );
  await expect(page.locator("article[data-mechanic-id]")).toHaveCount(
    mechanics.length,
  );
  for (const mechanic of mechanics) {
    const article = page.locator(`article[data-mechanic-id="${mechanic.id}"]`);
    await expect(article).toContainText(mechanic.definition);
    await expect(
      article
        .getByRole("region", { name: `${mechanic.name}图解`, exact: true })
        .locator("figure"),
    ).toHaveCount(6);
  }
  await expect(page.getByRole("tab")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /上一页|下一页|上一格|下一格|放大漫画/ }),
  ).toHaveCount(0);
});

for (const width of [1440, 390, 320])
  test(`group artwork, square mechanism frames and inline full artwork remain clear at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await gotoApp(page, "/taxonomy?mechanic=jump");
    const group = page.locator(
      'section[data-taxonomy-group="movement-basics"]',
    );
    await expect(group.locator(":scope > header img")).toHaveAttribute(
      "src",
      /\/art\/taxonomy-groups\/movement-basics\.webp$/,
    );
    const article = page.locator('article[data-mechanic-id="jump"]');
    await article.scrollIntoViewIfNeeded();
    const icon = article.locator(":scope > header img");
    const box = (await icon.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(width > 700 ? 128 : 112);
    expect(Math.abs(box.width - box.height)).toBeLessThan(1);
    const comic = article.locator('[data-panel="0"]');
    await comic.scrollIntoViewIfNeeded();
    const picture = (await comic.boundingBox())!;
    expect(picture.width).toBeGreaterThan(width > 700 ? 450 : 220);
    expect(Math.abs(picture.width - picture.height)).toBeLessThan(2);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBe(0);
  });

test("old mechanism links select the canonical dimension and in-page navigation never replays the intro", async ({
  page,
}) => {
  await gotoApp(page, "/taxonomy?group=movement-basics&mechanic=damage-health");
  await expect(
    page
      .locator("#dimension-rules")
      .getByRole("heading", { name: "规则与结算", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('article[data-mechanic-id="damage-health"]'),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "分类维度", exact: true })
    .getByRole("link", { name: /资源与经济/ })
    .click();
  await expect(
    page
      .locator("#dimension-economy")
      .getByRole("heading", { name: "资源与经济", exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("brand-intro")).toBeHidden();
  await expect(page.locator("article[data-mechanic-id]")).toHaveCount(
    catalog.mechanics.filter(
      (m: { dimension: string }) => m.dimension === "economy",
    ).length,
  );
  await page
    .getByRole("searchbox", { name: "搜索分类、机制与游戏" })
    .fill("RPG");
  await expect(
    page
      .getByRole("region", { name: "分类搜索结果" })
      .getByRole("link")
      .first(),
  ).toHaveAttribute("href", appHref("/types/rpg"));
});
