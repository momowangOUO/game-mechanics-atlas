import { test, expect } from "@playwright/test";
import { gotoApp } from "./navigation";
import { readFileSync } from "node:fs";

const evidence = JSON.parse(
  readFileSync("docs/research/game-evidence.json", "utf8"),
);
const balatro = evidence.games.find(
  (game: { id: string }) => game.id === "balatro",
);

for (const width of [1440, 768, 390, 320]) {
  test(`core loop has ordered symbols and a closing path at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await gotoApp(page, "/games/balatro");
    await page
      .getByRole("navigation", { name: "游戏研究章节" })
      .getByRole("link", { name: "核心循环 ↓", exact: true })
      .click();
    const loop = page.getByTestId("game-loop");
    await expect(
      loop.getByRole("list", { name: "核心循环" }).locator("li"),
    ).toHaveCount(4);
    await expect(loop.locator("[data-loop-from]")).toHaveCount(4);
    await expect(
      loop.locator(
        '[data-loop-from="4"][data-loop-to="1"][data-closing="true"]',
      ),
    ).toBeAttached();
    await expect(loop).toContainText("第 04 步后，返回第 01 步");
    for (const [index, step] of balatro.coreLoop.entries()) {
      const card = loop.locator(`[data-loop-step="${index + 1}"]`);
      await expect(card.locator("strong")).toHaveText(step);
      await expect(card.locator("svg")).toBeVisible();
      expect(
        await card
          .locator("strong")
          .evaluate((element) => element.scrollHeight - element.clientHeight),
      ).toBeLessThanOrEqual(1);
    }
    const boxes = await loop
      .locator("[data-loop-step]")
      .evaluateAll((elements) =>
        elements.map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          };
        }),
      );
    if (width === 1440) {
      expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThan(2);
      expect(boxes[2].y).toBeGreaterThan(boxes[1].y + boxes[1].height);
      expect(boxes[2].x).toBeGreaterThan(boxes[3].x);
    } else if (width <= 390) {
      for (let i = 1; i < boxes.length; i++) {
        expect(boxes[i].y).toBeGreaterThan(
          boxes[i - 1].y + boxes[i - 1].height,
        );
        expect(Math.abs(boxes[i].x - boxes[0].x)).toBeLessThan(2);
      }
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBe(0);
    await loop.screenshot({ path: `test-results/game-loop-${width}.png` });
  });
}

test("a nondefault scope stays unknown instead of inheriting the default loop", async ({
  page,
}) => {
  await gotoApp(page, "/games/minecraft");
  await page
    .getByRole("navigation", { name: "游戏研究章节" })
    .getByRole("link", { name: "核心循环 ↓", exact: true })
    .click();
  await expect(page.getByTestId("game-loop")).toBeVisible();
  await page
    .getByLabel("当前研究范围", { exact: true })
    .selectOption("minecraft:creative");
  await expect(
    page.getByText("这个模式的循环还未整理", { exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId("game-loop")).toHaveCount(0);
  await page.getByRole("button", { name: "查看默认范围的循环 →" }).click();
  await expect(page.getByTestId("game-loop")).toBeVisible();
  await expect(page.getByLabel("当前研究范围", { exact: true })).toHaveValue(
    "minecraft:standard",
  );
});

test("connections stay attached when the same loop reflows between desktop and phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await gotoApp(page, "/games/counter-strike-2");
  await page
    .getByRole("navigation", { name: "游戏研究章节" })
    .getByRole("link", { name: "核心循环 ↓", exact: true })
    .click();
  const loop = page.getByTestId("game-loop");
  for (const width of [1440, 320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        loop.evaluate((element) => {
          const svg = element.querySelector(
            '[data-testid="loop-connections"]',
          ) as SVGSVGElement | null;
          if (!svg) return false;
          const bounds = svg.getBoundingClientRect();
          const paths = Array.from(
            svg.querySelectorAll<SVGPathElement>("path[data-loop-from]"),
          );
          return (
            paths.length === 4 &&
            paths.every((path) => {
              const from = element
                .querySelector(`[data-loop-step="${path.dataset.loopFrom}"]`)!
                .getBoundingClientRect();
              const to = element
                .querySelector(`[data-loop-step="${path.dataset.loopTo}"]`)!
                .getBoundingClientRect();
              const start = path.getPointAtLength(0),
                end = path.getPointAtLength(path.getTotalLength());
              const onBoundary = (point: DOMPoint, rect: DOMRect) => {
                const x = point.x + bounds.left,
                  y = point.y + bounds.top;
                return (
                  x >= rect.left - 1 &&
                  x <= rect.right + 1 &&
                  y >= rect.top - 1 &&
                  y <= rect.bottom + 1 &&
                  Math.min(
                    Math.abs(x - rect.left),
                    Math.abs(x - rect.right),
                    Math.abs(y - rect.top),
                    Math.abs(y - rect.bottom),
                  ) < 1
                );
              };
              return onBoundary(start, from) && onBoundary(end, to);
            })
          );
        }),
      )
      .toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBe(0);
  }
});
