import { gotoApp } from "./navigation";
import { test, expect, type Page } from "@playwright/test";

async function openLab(page: Page, path = "/lab?recipe=aimed-buildcraft") {
  await gotoApp(page, path);
  await expect(page.locator("html")).toHaveAttribute(
    "data-effects",
    /full|reduced/,
  );
  await expect(page.locator('[hidden][id^="S:"]')).toHaveCount(0);
}
async function stage(page: Page, name: string) {
  await page
    .getByRole("navigation", { name: "实验步骤", exact: true })
    .getByRole("button", { name: new RegExp(name) })
    .click();
}
async function fitsTaskViewport(page: Page) {
  const bounds = await page.evaluate(() => {
    const controls = document
      .querySelector('nav[aria-label="移动端实验步骤控制"]')!
      .getBoundingClientRect().top;
    const panels = [...document.querySelectorAll("main section.window")].filter(
      (node) => node.getBoundingClientRect().height > 0,
    );
    return {
      root: document.documentElement.scrollHeight,
      height: innerHeight,
      bottom: Math.max(
        ...panels.map((node) => node.getBoundingClientRect().bottom),
      ),
      controls,
    };
  });
  expect(bounds.root).toBeLessThanOrEqual(bounds.height + 1);
  expect(bounds.bottom).toBeLessThanOrEqual(bounds.controls + 1);
}

test("analysis is immediate, highlights only the clock pair and preserves its rule boundary", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1050 });
  await openLab(page, "/lab?recipe=aimed-buildcraft&add=sequential-turns");
  await page
    .getByRole("combobox", { name: "核心机制", exact: true })
    .selectOption("real-time-update");
  await page.getByRole("button", { name: /^分析当前组合/ }).click();
  await expect(
    page.getByRole("heading", { name: "实时推进组合实验" }),
  ).toBeVisible();
  await expect(page.locator('[data-maid-state="conflict"]')).toBeVisible();
  await expect(page.locator("[data-mechanic-id][data-conflict]")).toHaveCount(
    2,
  );
  await expect(
    page.locator('[data-mechanic-id="real-time-update"]'),
  ).toHaveAttribute("data-conflict", "true");
  await expect(
    page.locator('[data-mechanic-id="sequential-turns"]'),
  ).toHaveAttribute("data-conflict", "true");
  await page.getByRole("tab", { name: "协同与冲突", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("不同阶段可以组合");
  await page.getByRole("tab", { name: "调整与边界", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("不同阶段");
});

test("rapid analysis and changed selections cannot revive old presentation or snapshots", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openLab(page);
  await page.evaluate(() => localStorage.setItem("atlas.motion", "full"));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-effects", "full");
  await page.getByRole("button", { name: /^分析当前组合/ }).click();
  const repeat = page.getByRole("button", { name: /^重新分析当前组合/ });
  await repeat.dblclick();
  await expect(
    page.getByRole("heading", { name: "瞄准发射组合实验" }),
  ).toBeVisible();
  await stage(page, "核心");
  await page
    .getByRole("combobox", { name: "核心机制", exact: true })
    .selectOption("piece-rotation");
  await expect(
    page.getByText("组合已修改，以下仍是上次分析。", { exact: true }),
  ).toBeVisible();
  await expect(page.locator('[data-analysis-state="stale"]')).toHaveCount(1);
  await expect(page.locator('[data-maid-state="think"]')).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "瞄准发射组合实验" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "更新分析 ↻", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "物件旋转组合实验" }),
  ).toBeVisible();
  await expect(
    page.getByText("组合已修改，以下仍是上次分析。", { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("tab", { name: "循环与分工", exact: true }).focus();
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: "调整与边界", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Home");
  await expect(
    page.getByRole("tab", { name: "循环与分工", exact: true }),
  ).toBeFocused();
});

for (const [width, height] of [
  [390, 844],
  [320, 844],
  [360, 780],
  [320, 640],
]) {
  test(`mobile ${width}x${height} separates stages and report sections without nested reading scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await openLab(page);
    await fitsTaskViewport(page);
    await page
      .getByRole("navigation", { name: "核心选择分区" })
      .getByRole("button", { name: "核心机制", exact: true })
      .click();
    await expect(
      page.getByRole("combobox", { name: "核心机制", exact: true }),
    ).toBeVisible();
    await fitsTaskViewport(page);
    await stage(page, "配料");
    await fitsTaskViewport(page);
    await page
      .getByRole("searchbox", { name: "搜索机制" })
      .fill("piece-rotation");
    await page.getByRole("checkbox", { name: /物件旋转/ }).check();
    await expect(
      page.getByRole("checkbox", { name: /物件旋转/ }),
    ).toBeChecked();
    await stage(page, "目标");
    await fitsTaskViewport(page);
    await expect(page.getByRole("checkbox", { name: /易上手/ })).toBeVisible();
    await page.getByRole("button", { name: "分析组合 →", exact: true }).click();
    await expect(page.getByRole("tabpanel")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "瞄准发射组合实验", exact: true }),
    ).toBeFocused();
    await fitsTaskViewport(page);
    await page
      .getByRole("navigation", { name: "报告视图" })
      .getByRole("button", { name: "概况与边界", exact: true })
      .click();
    await expect(page.locator("[data-maid-state]")).toBeVisible();
    await fitsTaskViewport(page);
    await page
      .getByRole("navigation", { name: "报告视图" })
      .getByRole("button", { name: "研究内容", exact: true })
      .click();
    await expect(page.locator('[data-maid-state="think"]')).toHaveCount(0);
    await page
      .getByRole("navigation", { name: "报告分区" })
      .getByRole("button", { name: "机制分工", exact: true })
      .click();
    await expect(page.getByRole("tabpanel")).toContainText("机制分工");
    await page.getByRole("tab", { name: "风险与 Demo", exact: true }).click();
    await page
      .getByRole("navigation", { name: "报告分区" })
      .getByRole("button", { name: "Demo 问题", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "首个 Demo，先验证什么？" }),
    ).toBeVisible();
    await page.getByRole("tab", { name: "调整与边界", exact: true }).click();
    await page
      .getByRole("navigation", { name: "报告分区" })
      .getByRole("button", { name: "阅读边界", exact: true })
      .click();
    await expect(page.getByRole("tabpanel")).toContainText("尚未经过原型验证");
    await fitsTaskViewport(page);
    const panel = page.getByRole("tabpanel");
    expect(
      await panel.evaluate((node) => ({
        overflow: getComputedStyle(node).overflowY,
        width: node.scrollWidth > node.clientWidth + 1,
      })),
    ).toEqual({ overflow: "visible", width: false });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(
      page
        .getByRole("navigation", { name: "移动端实验步骤控制" })
        .getByRole("button", { name: "调整核心 ↗" }),
    ).toBeInViewport();
  });
}

test("short keyboard viewport keeps mechanism search and dismissal usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await openLab(page);
  await stage(page, "配料");
  const search = page.getByRole("searchbox", { name: "搜索机制" });
  await search.focus();
  await page.setViewportSize({ width: 320, height: 400 });
  await search.fill("piece-rotation");
  await expect(search).toBeInViewport();
  await expect(
    page.getByRole("checkbox", { name: /物件旋转/ }),
  ).toBeInViewport();
  await fitsTaskViewport(page);
  await search.press("Enter");
  await expect(search).not.toBeFocused();
  await page.setViewportSize({ width: 320, height: 640 });
  await page.getByRole("checkbox", { name: /物件旋转/ }).check();
  await expect(page.getByRole("checkbox", { name: /物件旋转/ })).toBeChecked();
  await fitsTaskViewport(page);
});

test("compact stale reports preserve every result section and the update action above navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1050 });
  await openLab(page, "/lab");
  await page.getByRole("button", { name: /^分析当前组合/ }).click();
  await page.setViewportSize({ width: 320, height: 640 });
  await stage(page, "核心");
  await page
    .getByRole("navigation", { name: "核心选择分区" })
    .getByRole("button", { name: "核心机制", exact: true })
    .click();
  await page
    .getByRole("combobox", { name: "核心机制", exact: true })
    .selectOption("piece-rotation");
  await stage(page, "结果");
  await expect(
    page.getByText("组合已修改，以下仍是上次分析。", { exact: true }),
  ).toBeVisible();
  for (const name of [
    "循环与分工",
    "协同与冲突",
    "风险与 Demo",
    "相似参照",
    "调整与边界",
  ]) {
    await page.getByRole("tab", { name, exact: true }).click();
    if (name === "相似参照") {
      await expect(
        page.getByRole("navigation", { name: "报告分区" }).getByRole("button"),
      ).toHaveText(["参照案例", "匹配机制", "未匹配项", "口径说明"]);
    }
    await fitsTaskViewport(page);
    const sections = page
      .getByRole("navigation", { name: "报告分区" })
      .getByRole("button");
    for (let index = 0; index < (await sections.count()); index++) {
      await sections.nth(index).click();
      await fitsTaskViewport(page);
      const next = page
        .getByRole("tabpanel")
        .getByRole("button", { name: "下一页", exact: true });
      while ((await next.count()) && (await next.isEnabled())) {
        await next.click();
        await fitsTaskViewport(page);
      }
    }
    if (name === "相似参照") {
      const next = page
        .getByRole("tabpanel")
        .getByRole("button", { name: "下一页", exact: true });
      while ((await next.count()) && (await next.isEnabled())) {
        await next.click();
        await fitsTaskViewport(page);
      }
    }
  }
  const update = page.getByRole("button", { name: "更新分析 ↻", exact: true });
  await expect(update).toBeInViewport();
  await update.click();
  await expect(
    page.getByText("组合已修改，以下仍是上次分析。", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "物件旋转组合实验", exact: true }),
  ).toBeFocused();
  await fitsTaskViewport(page);
});
