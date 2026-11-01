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
test("desktop comic uses illustrated panels and an independent step-by-step diagram", async ({
  page,
}) => {
  await gotoApp(page, "/mechanics/direct-movement/");
  const story = page.getByRole("region", { name: "直接移动图解" });
  const panels = story.locator("figure");
  await expect(panels).toHaveCount(3);
  for (const p of await panels.all()) {
    const image = p.locator("img");
    await expect(image).toHaveAttribute(
      "src",
      /art\/comics\/direct-movement\.webp/,
    );
    expect(await image.evaluate((e: HTMLImageElement) => e.naturalWidth)).toBe(
      1800,
    );
  }
  await story.getByRole("button", { name: "规则示意", exact: true }).click();
  await expect(story.locator("svg")).toHaveCount(1);
  const diagram = story.locator("svg");
  const original = await diagram.innerHTML();
  await story
    .getByRole("navigation", { name: "示意步骤" })
    .getByRole("button")
    .nth(1)
    .click();
  expect(await diagram.innerHTML()).not.toBe(original);
});
test("phone comic exposes all three panels without horizontal scrolling", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoApp(page, "/mechanics/jump/");
  const story = page.getByRole("region", { name: "跳跃图解" });
  const visibleFrames = story.locator("figure:visible");
  await expect(visibleFrames).toHaveCount(1);
  await story.evaluate((e) => e.scrollIntoView({ block: "center" }));
  const next = story.getByRole("button", { name: "下一格 →" });
  await next.click();
  await expect(
    story.getByRole("navigation", { name: "漫画分镜" }),
  ).toContainText("2 / 3");
  await next.click();
  await expect(next).toBeDisabled();
  await story.getByRole("button", { name: "← 上一格" }).click();
  await expect(
    story.getByRole("navigation", { name: "漫画分镜" }),
  ).toContainText("2 / 3");
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
