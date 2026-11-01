import { expect, test } from "@playwright/test";
import { gotoApp, appHref } from "./navigation";

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
    results
      .locator("button")
      .filter({ has: page.locator("h2") })
      .first(),
  ).toBeVisible();
  await page
    .getByRole("searchbox", { name: "搜索分类、机制与游戏" })
    .fill("no-such-classification-998877");
  await expect(
    page.getByText("没有找到匹配的分类或机制", { exact: true }),
  ).toBeVisible();
});

test("mobile taxonomy uses paged stages and preserves a selected mechanism on return", async ({
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
    3,
  );
  await page
    .getByRole("button", { name: "分类维度下一页", exact: true })
    .click();
  await dimensions.getByRole("button", { name: /构筑与配置/ }).click();
  const groups = page.getByRole("region", {
    name: "二级机制分组",
    exact: true,
  });
  await expect(groups).toBeVisible();
  await expect(dimensions).not.toBeVisible();
  await groups.locator("button[aria-pressed]").first().click();
  const mechanisms = page.getByRole("region", {
    name: "三级原子机制",
    exact: true,
  });
  await expect(mechanisms).toBeVisible();
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
  await reading
    .getByRole("button", { name: "机制边界下一页", exact: true })
    .click();
  await expect(
    reading.getByRole("heading", { name: "排除边界" }),
  ).toBeVisible();
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
  const bounds = await mechanisms.boundingBox();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844 - 52);
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

test("compact final mechanisms keep every reading pager reachable", async ({
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
    const panel = page.getByRole("region", { name: "机制阅读卡", exact: true });
    for (const [label, pager] of [
      ["有什么用", "作用与风险"],
      ["典型游戏", "游戏实例"],
      ["怎么区分", "机制边界"],
    ]) {
      await panel.getByRole("tab", { name: label, exact: true }).click();
      const navigation = panel.getByRole("navigation", {
        name: pager,
        exact: true,
      });
      if (!(await navigation.count())) continue;
      const next = navigation.getByRole("button", {
        name: `${pager}下一页`,
        exact: true,
      });
      let states = 0;
      while (true) {
        expect(
          await panel
            .getByRole("tabpanel")
            .evaluate((el) => el.scrollHeight - el.clientHeight),
          `${id}/${label}`,
        ).toBeLessThanOrEqual(2);
        if (!(await next.isEnabled())) break;
        const before = await navigation.locator("span").innerText();
        await next.click();
        await expect(navigation.locator("span")).not.toHaveText(before);
        expect(++states).toBeLessThan(8);
      }
    }
  }
});

test("compact phone reads long scoped evidence and its condition without overlap", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await gotoApp(page, "/taxonomy?mechanic=permadeath");
  const reading = page.getByRole("region", { name: "机制阅读卡", exact: true });
  await reading.getByRole("tab", { name: "典型游戏", exact: true }).click();
  await expect(
    reading.getByText("条件实例 · 下一页查看成立条件。", { exact: true }),
  ).toBeVisible();
  await reading
    .getByRole("button", { name: "游戏实例下一页", exact: true })
    .click();
  await expect(reading.getByText(/成立条件：/)).toBeVisible();
  const panel = await reading.boundingBox();
  expect(
    await reading
      .getByRole("tabpanel")
      .evaluate((el) => el.scrollHeight - el.clientHeight),
  ).toBeLessThanOrEqual(2);
  expect(panel!.y + panel!.height).toBeLessThanOrEqual(580);
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(
    640,
  );
  await gotoApp(page, "/taxonomy?mechanic=automatic-resolution");
  const risk = page.getByRole("region", { name: "机制阅读卡", exact: true });
  await risk.getByRole("tab", { name: "有什么用", exact: true }).click();
  await risk
    .getByRole("button", { name: "作用与风险下一页", exact: true })
    .click();
  await risk
    .getByRole("button", { name: "作用与风险下一页", exact: true })
    .click();
  await expect(
    risk.getByRole("heading", { name: "常见设计问题", exact: true }),
  ).toBeVisible();
  expect(
    await risk
      .getByRole("tabpanel")
      .evaluate((el) => el.scrollHeight - el.clientHeight),
  ).toBeLessThanOrEqual(2);
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
