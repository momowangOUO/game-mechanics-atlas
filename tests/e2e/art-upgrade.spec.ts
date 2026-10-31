import { gotoApp } from "./navigation";
import { test, expect, type Page } from "@playwright/test";

async function visit(page: Page, path: string) {
  await gotoApp(page, path);
  await expect(page.locator("html")).toHaveAttribute(
    "data-effects",
    /^(full|reduced)$/,
  );
  await expect(page.locator('[hidden][id^="S:"]')).toHaveCount(0);
}

test("paper worksheet keeps scope warnings and category labels readable", async ({
  page,
}) => {
  await visit(page, "/games/balatro");
  for (const selector of [
    ".game-worksheet .scope-notice",
    ".game-worksheet .observation-card .chip",
  ]) {
    const label = page.locator(selector).first();
    await expect(label).toBeVisible();
    const contrast = await label.evaluate((element) => {
      const rgb = (value: string) =>
        value
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number);
      const luminance = (values: number[]) =>
        values
          .map((n) => {
            const c = n / 255;
            return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          })
          .reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
      let parent: Element | null = element;
      let background = "";
      while (parent) {
        const color = getComputedStyle(parent).backgroundColor;
        if (!color.endsWith(", 0)") && color !== "transparent") {
          background = color;
          break;
        }
        parent = parent.parentElement;
      }
      const text = luminance(rgb(getComputedStyle(element).color)),
        back = luminance(rgb(background));
      return (Math.max(text, back) + 0.05) / (Math.min(text, back) + 0.05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  }
});

test("RIN advice advances real pose without losing the search draft", async ({
  page,
}) => {
  await visit(page, "/");
  await expect(page.locator('[data-maid-state="welcome"]')).toBeVisible();
  await page.getByRole("textbox", { name: "首页搜索" }).fill("Balatro");
  await page.getByRole("button", { name: "听听 RIN 的研究建议" }).click();
  await expect(page.locator('[data-maid-state="explain"]')).toBeVisible();
  await page.getByRole("button", { name: "听听 RIN 的研究建议" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-maid-state="think"]')).toBeVisible();
  await expect(page.getByRole("textbox", { name: "首页搜索" })).toHaveValue(
    "Balatro",
  );
  await page.getByRole("button", { name: "搜索知识库", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("textbox")).toHaveValue(
    "Balatro",
  );
});

test("phone title scene keeps every chapter reachable without document scrolling", async ({
  page,
}) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 360, height: 780 },
    { width: 320, height: 640 },
  ]) {
    await page.setViewportSize(viewport);
    await visit(page, "/");
    const directory = page.getByRole("navigation", { name: "研究室章节" });
    for (const name of [
      "机制档案",
      "游戏案例",
      "机制图谱",
      "热度观察",
      "混合实验室",
      "游戏对比",
    ]) {
      const link = directory.getByRole("link").filter({ hasText: name });
      await expect(link).toBeVisible();
      const box = await link.boundingBox();
      expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height - 60);
    }
    expect(
      await page.evaluate(() =>
        Math.max(0, document.documentElement.scrollHeight - innerHeight),
      ),
    ).toBe(0);
  }
});

test("failed scenery preserves search and usable chapter links", async ({
  page,
}) => {
  await page.route("**/art/room-dusk.webp", (r) => r.abort());
  await visit(page, "/");
  await expect(page.locator(".vn-background .art-fallback")).toBeVisible();
  await page.getByRole("textbox", { name: "首页搜索" }).fill("卡组");
  await page.getByRole("button", { name: "搜索知识库", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "SEARCH ARCHIVE / 检索研究档案" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("navigation", { name: "研究室章节" })
    .getByRole("link")
    .filter({ hasText: "机制档案" })
    .click();
  await expect(page).toHaveURL(/\/mechanics\/?$/);
});

test("system reduced motion prevents pointer parallax while preserving pose changes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await visit(page, "/");
  await expect(page.locator("html")).toHaveAttribute("data-effects", "reduced");
  await page.locator(".vn-stage").hover({ position: { x: 200, y: 150 } });
  await expect(page.locator(".vn-background")).toHaveCSS(
    "transform",
    /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/,
  );
  await page.getByRole("button", { name: "听听 RIN 的研究建议" }).click();
  await expect(page.locator('[data-maid-state="explain"]')).toBeVisible();
});
