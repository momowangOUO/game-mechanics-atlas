import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { gotoApp, appPath } from "./navigation";
const ids = JSON.parse(
  readFileSync("docs/research/mechanic-dossiers.json", "utf8"),
).mechanisms.map((m: { id: string }) => m.id) as string[];
test("every mechanism has a real generated icon and three-panel comic", async ({
  request,
}) => {
  const paths = ids.flatMap((id) => [
    `/art/mechanics/${id}.webp`,
    `/art/comics/${id}.webp`,
  ]);
  let index = 0;
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      while (index < paths.length) {
        const path = paths[index++];
        const r = await request.get(appPath(path));
        expect(r.status(), path).toBe(200);
        const b = await r.body();
        expect(b.subarray(0, 4).toString(), path).toBe("RIFF");
        expect(b.subarray(8, 12).toString(), path).toBe("WEBP");
        expect(b.length, path).toBeGreaterThan(1000);
      }
    }),
  );
});
test("desktop comic keeps illustrated panels and all independent rule stages visible", async ({
  page,
}) => {
  await gotoApp(page, "/mechanics/direct-movement/");
  const story = page.getByRole("region", { name: "直接移动图解" });
  const panels = story
    .locator("figure")
    .filter({ has: page.locator("[data-panel]") });
  await expect(panels).toHaveCount(3);
  for (const p of await panels.all()) {
    const image = p.locator("img");
    await expect(image).toHaveAttribute(
      "src",
      /art\/comics\/direct-movement\.webp/,
    );
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() => image.evaluate((e: HTMLImageElement) => e.naturalWidth))
      .toBe(1800);
  }
  await expect(story.locator("svg")).toHaveCount(3);
  const diagrams = await story.locator("svg").all();
  const states = await Promise.all(
    diagrams.map(async (diagram) =>
      (await diagram.innerHTML()).replace(/rule-[a-zA-Z0-9_-]+/g, "marker"),
    ),
  );
  expect(new Set(states).size).toBe(3);
  for (const diagram of diagrams) await expect(diagram).toBeVisible();
  await expect(story.locator("button, nav")).toHaveCount(0);
});
test("phone comic exposes all three panels without horizontal scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoApp(page, "/mechanics/jump/");
  const story = page.getByRole("region", { name: "跳跃图解" });
  const visibleFrames = story
    .locator("figure:visible")
    .filter({ has: page.locator("[data-panel]") });
  await expect(visibleFrames).toHaveCount(3);
  await expect(
    story.getByRole("navigation", { name: "漫画分镜" }),
  ).not.toBeVisible();
  let previousBottom = 0;
  for (const [index, frame] of (await visibleFrames.all()).entries()) {
    const image = frame.locator("img");
    await expect(image).toHaveAttribute(
      "alt",
      new RegExp(`跳跃漫画第${index + 1}格：`),
    );
    await frame.scrollIntoViewIfNeeded();
    await expect(frame.locator("figcaption")).toBeInViewport();
    await expect
      .poll(() =>
        image.evaluate((element: HTMLImageElement) => element.naturalWidth),
      )
      .toBe(1800);
    const drawing = (await frame.locator("[data-panel]").boundingBox())!;
    expect(drawing.width).toBeGreaterThan(220);
    expect(drawing.height).toBeGreaterThan(220);
    const bounds = await frame.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: rect.top + scrollY, bottom: rect.bottom + scrollY };
    });
    expect(bounds.top).toBeGreaterThanOrEqual(previousBottom);
    previousBottom = bounds.bottom;
  }
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight),
  ).toBeGreaterThan(844);
  expect(
    await story.evaluate(
      (element) => element.scrollHeight - element.clientHeight,
    ),
  ).toBeLessThanOrEqual(2);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
test("piece preview cites the specific real product mode", async ({ page }) => {
  await gotoApp(page, "/mechanics/next-piece-preview/");
  const example = page
    .getByRole("link")
    .filter({ hasText: "Tetris" })
    .filter({ has: page.locator("img") })
    .first();
  await expect(example).toHaveAttribute(
    "href",
    /scope=tetris%3Abasicfun-09686-marathon/,
  );
  await expect(
    page.getByText("Basic Fun 09686 / Marathon 模式", { exact: false }).first(),
  ).toBeVisible();
});
