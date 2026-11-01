import { test, expect } from "@playwright/test";
import { gotoApp, appHref } from "./navigation";
import { readFileSync } from "node:fs";
const evidence = JSON.parse(
  readFileSync("docs/research/game-evidence.json", "utf8"),
);
for (const [width, height] of [
  [1440, 1000],
  [390, 844],
  [320, 640],
]) {
  test(`classification reader shows its real comic and all frames at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await gotoApp(page, "/taxonomy?mechanic=dodge-move");
    const reader = page.getByRole("region", {
      name: "机制阅读卡",
      exact: true,
    });
    const comic = reader.getByRole("region", {
      name: "闪避位移图解",
      exact: true,
    });
    await expect(comic).toBeVisible();
    await expect(comic.locator("figure:visible")).toHaveCount(1);
    for (const number of [1, 2, 3]) {
      await expect(
        comic.getByRole("navigation", { name: "漫画分镜" }),
      ).toContainText(`${number} / 3`);
      if (number < 3)
        await comic.getByRole("button", { name: "下一格 →" }).click();
    }
    await comic.getByRole("button", { name: "规则示意", exact: true }).click();
    await expect(comic.getByRole("img")).toBeVisible();
    const panel = reader.getByRole("tabpanel");
    expect(
      await panel.evaluate((e) => e.scrollHeight - e.clientHeight),
    ).toBeLessThanOrEqual(2);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBe(0);
    await comic
      .getByRole("button", { name: "放大漫画 ↗", exact: true })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "闪避位移 · 完整漫画",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    const image = dialog.locator("figure:visible img").first();
    await expect(image).toBeVisible();
    expect((await image.boundingBox())!.height).toBeGreaterThan(180);
    if (width <= 700) {
      const pager = await dialog
        .getByRole("navigation", { name: "漫画分镜" })
        .boundingBox();
      expect(pager!.y + pager!.height).toBeLessThanOrEqual(height);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(
      comic.getByRole("button", { name: "放大漫画 ↗", exact: true }),
    ).toBeFocused();
  });
}
test("a game graph starts with all recorded directions and keeps them when changing focus", async ({
  page,
}) => {
  await gotoApp(page, "/graph?game=hades");
  const inventory = page.getByRole("region", {
    name: "游戏机制总览",
    exact: true,
  });
  const scopeIds = evidence.scopes
    .filter((s: { gameId: string }) => s.gameId === "hades")
    .map((s: { id: string }) => s.id);
  const ids = [
    ...new Set(
      evidence.instances
        .filter(
          (i: { scopeId: string; status: string }) =>
            scopeIds.includes(i.scopeId) &&
            ["present", "conditional"].includes(i.status),
        )
        .map((i: { mechanicId: string }) => i.mechanicId),
    ),
  ];
  await expect(inventory.locator("button[data-mechanic-id]")).toHaveCount(
    ids.length,
  );
  await expect(page.locator(".react-flow__node")).toHaveCount(ids.length);
  await inventory.locator("button[data-mechanic-id]").last().click();
  await expect(page.locator(".react-flow__node")).toHaveCount(ids.length);
  await expect(page.getByLabel("图谱模式范围")).toHaveValue("all");
});
test("browsing into a mechanism opens its comic instead of the old text page", async ({
  page,
}) => {
  await gotoApp(page, "/taxonomy?group=mobility-tools");
  await page.getByRole("button", { name: /^闪避位移.*阅读/ }).click();
  await expect(
    page
      .getByRole("region", { name: "机制阅读卡", exact: true })
      .getByRole("region", { name: "闪避位移图解", exact: true }),
  ).toBeVisible();
});
test("case relation view lists all mechanisms and opens the same scope in the interactive graph", async ({
  page,
}) => {
  await gotoApp(page, "/games/balatro");
  await page.getByRole("tab", { name: "关系视图", exact: true }).click();
  const game = evidence.games.find((g: { id: string }) => g.id === "balatro");
  const ids = evidence.instances.filter(
    (i: { scopeId: string; status: string }) =>
      i.scopeId === game.defaultScopeId &&
      ["present", "conditional"].includes(i.status),
  );
  await expect(page.locator(".case-relation-graph rect")).toHaveCount(
    ids.length,
  );
  await expect(
    page
      .getByRole("region", { name: "游戏机制总览", exact: true })
      .locator("button[data-mechanic-id]"),
  ).toHaveCount(ids.length);
  const graphLink = page.getByRole("link", {
    name: "在完整交互图谱中查看 ↗",
    exact: true,
  });
  await expect(graphLink).toHaveAttribute(
    "href",
    appHref(
      `/graph?game=balatro&scope=${encodeURIComponent(game.defaultScopeId)}`,
    ),
  );
});
