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
    if (width > 700) {
      await expect(comic.locator("figure:visible")).toHaveCount(1);
      for (const number of [1, 2, 3]) {
        await expect(
          comic.getByRole("navigation", { name: "漫画分镜" }),
        ).toContainText(`${number} / 3`);
        if (number < 3)
          await comic.getByRole("button", { name: "下一格 →" }).click();
      }
    } else {
      await expect(comic.locator("figure:visible")).toHaveCount(3);
      await expect(
        comic.getByRole("navigation", { name: "漫画分镜" }),
      ).not.toBeVisible();
      let previousBottom = 0;
      for (const frame of await comic.locator("figure").all()) {
        await frame.scrollIntoViewIfNeeded();
        await expect(frame.locator("figcaption")).toBeInViewport();
        const drawing = (await frame.locator("[data-panel]").boundingBox())!;
        expect(drawing.width).toBeGreaterThan(140);
        expect(drawing.height).toBeGreaterThan(140);
        const bounds = await frame.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return { top: rect.top + scrollY, bottom: rect.bottom + scrollY };
        });
        expect(bounds.top).toBeGreaterThanOrEqual(previousBottom);
        previousBottom = bounds.bottom;
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollHeight),
      ).toBeGreaterThan(height);
    }
    await comic.getByRole("button", { name: "规则示意", exact: true }).click();
    await expect(comic.getByRole("img")).toBeVisible();
    const panel = reader.getByRole("tabpanel");
    if (width > 700) {
      expect(
        await panel.evaluate((e) => e.scrollHeight - e.clientHeight),
      ).toBeLessThanOrEqual(2);
    } else {
      await expect(panel).toHaveCSS("overflow-y", "visible");
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBe(0);
    const open = reader.getByRole("button", { name: /看图理解/ });
    await expect(open).toBeVisible();
    await open.click();
    const dialog = page.getByRole("dialog", {
      name: "闪避位移 · 完整漫画",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    const image = dialog.locator("figure:visible img").first();
    await expect(image).toBeVisible();
    expect((await image.boundingBox())!.height).toBeGreaterThan(180);
    if (width <= 700) {
      await expect(dialog.locator("figure:visible")).toHaveCount(3);
      await expect(
        dialog.getByRole("navigation", { name: "漫画分镜" }),
      ).not.toBeVisible();
      expect(
        await dialog.evaluate(
          (element) => element.scrollHeight - element.clientHeight,
        ),
      ).toBeGreaterThan(100);
      const finalCaption = dialog
        .locator("figure")
        .last()
        .locator("figcaption");
      await finalCaption.scrollIntoViewIfNeeded();
      await expect(finalCaption).toBeInViewport();
      expect(
        await dialog.evaluate((element) => element.scrollTop),
      ).toBeGreaterThan(0);
      await expect(
        dialog.getByRole("button", { name: "关闭弹窗", exact: true }),
      ).toBeInViewport();
      expect(
        await dialog.evaluate(
          (element) => element.scrollWidth - element.clientWidth,
        ),
      ).toBeLessThanOrEqual(1);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(open).toBeFocused();
    await open.click();
    await dialog.getByRole("button", { name: "关闭弹窗", exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await expect(open).toBeFocused();
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
