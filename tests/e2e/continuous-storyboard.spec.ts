import { expect, test } from "@playwright/test";
import { gotoApp } from "./navigation";

for (const width of [1440, 768, 390, 320]) {
  test(`comic and rule stages form one continuous column at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await gotoApp(page, "/mechanics/jump/");
    const story = page.locator("#mechanic-comic-jump");
    await expect(story.locator("figure")).toHaveCount(6);
    await expect(story.locator("button, nav, [role=tab]")).toHaveCount(0);
    await expect(story.locator("[data-rule-stage]")).toHaveCount(3);
    let previousBottom = 0;
    for (const frame of await story.locator("figure").all()) {
      await expect(frame).toBeVisible();
      const bounds = await frame.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top + scrollY, bottom: rect.bottom + scrollY };
      });
      expect(bounds.top).toBeGreaterThanOrEqual(previousBottom);
      previousBottom = bounds.bottom;
    }
    for (const panel of await story.locator("[data-panel]").all()) {
      await panel.scrollIntoViewIfNeeded();
      const bounds = (await panel.boundingBox())!;
      expect(bounds.width).toBeLessThanOrEqual(600);
      expect(bounds.width).toBeGreaterThan(width > 700 ? 450 : 200);
      expect(Math.abs(bounds.width - bounds.height)).toBeLessThan(1);
      const image = panel.locator("img");
      await expect
        .poll(() =>
          image.evaluate((element: HTMLImageElement) => element.naturalWidth),
        )
        .toBe(1800);
      expect(
        await image.evaluate(
          (element: HTMLImageElement) => element.naturalHeight,
        ),
      ).toBe(600);
      await expect(image).toHaveCSS("object-fit", "contain");
      expect(
        Math.abs((await image.boundingBox())!.width - bounds.width * 3),
      ).toBeLessThan(1);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
    ).toBeLessThanOrEqual(1);
    await story.screenshot({
      path: testInfo.outputPath(`jump-continuous-${width}.png`),
    });
  });
}

for (const width of [1440, 390, 320]) {
  test(`classification mechanic icon keeps its native square at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await gotoApp(page, "/taxonomy?mechanic=jump");
    const frame = page.locator('[class*="iconFrame"]').first();
    await expect(frame).toBeVisible();
    const expectedFrame = width > 700 ? 160 : 128;
    const expectedIcon = width > 700 ? 128 : 112;
    const bounds = (await frame.boundingBox())!;
    expect(bounds.width).toBe(expectedFrame);
    expect(bounds.height).toBe(expectedFrame);
    const image = frame.locator("img");
    const icon = (await image.boundingBox())!;
    expect(icon.width).toBe(expectedIcon);
    expect(icon.height).toBe(expectedIcon);
    await expect(image).toHaveCSS("object-fit", "contain");
    await expect
      .poll(() =>
        image.evaluate((element: HTMLImageElement) => element.naturalWidth),
      )
      .toBe(256);
    expect(icon.x).toBeGreaterThan(bounds.x);
    expect(icon.x + icon.width).toBeLessThan(bounds.x + bounds.width);
  });
}
