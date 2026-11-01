import { test, expect, type Page } from "@playwright/test";
import { mkdirSync, readFileSync } from "node:fs";
import { gotoApp } from "./navigation";
const runtime = "docs/mechanic-visuals/runtime";
async function openLab(page: Page, path = "/lab?recipe=aimed-buildcraft") {
  await gotoApp(page, path);
  await expect(page.getByRole("heading", { name: "研究提示词" })).toBeVisible();
}
async function stage(page: Page, name: string) {
  await page
    .getByRole("navigation", { name: "提示词编写步骤" })
    .getByRole("button", { name: new RegExp(name) })
    .click();
}
async function generate(page: Page) {
  await page.getByRole("button", { name: /^生成提示词/ }).click();
  await expect(page.locator("#research-prompt")).not.toHaveValue("");
}
for (const [name, expected] of [
  ["组合研究", "提出可讨论的玩法方向"],
  ["机制对照", "逐项对照真实游戏案例"],
  ["Demo 验证", "可观察指标"],
]) {
  test(`template ${name} composes a bounded editable research request`, async ({
    page,
  }) => {
    await openLab(page);
    await stage(page, "研究要求");
    await page.getByRole("button", { name: new RegExp(`^${name}`) }).click();
    await page
      .getByLabel("补充背景与约束")
      .fill("只讨论单人 2D 原型，先验证强化选择。");
    await generate(page);
    const value = await page.locator("#research-prompt").inputValue();
    expect(value).toContain(`# ${name}请求`);
    expect(value).toContain(expected);
    expect(value).toContain("只讨论单人 2D 原型");
    expect(value).toContain("核心机制：瞄准发射");
    expect(value).toContain("站内编辑定义");
    expect(value).toContain("事实、设计推断与待验证假设");
    expect(value).toContain("https://");
    await expect(
      page.getByRole("heading", { name: "交给 AI 的研究请求" }),
    ).toBeFocused();
    await page
      .locator("#research-prompt")
      .fill(`${value}\n手动补充：先验证一次选择。`);
    await expect(page.getByText("已手动编辑", { exact: true })).toBeVisible();
  });
}
test("legacy recipe/add inputs and recipe selection survive the composer migration", async ({
  page,
}) => {
  await openLab(page, "/lab?recipe=aimed-buildcraft&add=piece-rotation");
  await expect(page.getByLabel("起点配方")).toHaveValue("aimed-buildcraft");
  await generate(page);
  expect(await page.locator("#research-prompt").inputValue()).toContain(
    "配合机制：物件旋转",
  );
  await stage(page, "核心机制");
  const recipes = JSON.parse(
    readFileSync("docs/research/genre-recipes.json", "utf8"),
  ).recipes as { id: string; mechanicIds: string[] }[];
  const alternate = recipes.find((recipe) => recipe.id !== "aimed-buildcraft")!;
  await page.getByLabel("起点配方").selectOption(alternate.id);
  await page.getByRole("button", { name: /^重新生成提示词/ }).click();
  const next = await page.locator("#research-prompt").inputValue();
  for (const id of alternate.mechanicIds) expect(next).toContain(`（${id}）`);
  await openLab(page, "/lab?recipe=missing&add=aimed-launch");
  await expect(
    page.getByText("链接中的配方未收录", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("链接中的附加机制已在当前组合中", { exact: false }),
  ).toBeVisible();
  await generate(page);
  expect(
    (await page.locator("#research-prompt").inputValue()).match(
      /- 核心机制：瞄准发射/g,
    ),
  ).toHaveLength(1);
});
test("copy and Markdown download include the current edited text", async ({
  page,
}) => {
  await openLab(page);
  await generate(page);
  const editor = page.locator("#research-prompt");
  const content = `${await editor.inputValue()}\n只验证当前原型。`;
  await editor.fill(content);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          (window as Window & { copiedPrompt?: string }).copiedPrompt = value;
        },
      },
    }),
  );
  await page.getByRole("button", { name: "复制提示词", exact: true }).click();
  await expect(page.getByText("提示词已复制。", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => (window as Window & { copiedPrompt?: string }).copiedPrompt,
    ),
  ).toBe(content);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "下载 .md", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("机制研究-combination.md");
  expect(readFileSync((await download.path())!, "utf8")).toBe(content);
});
test("denied clipboard selects the complete prompt for manual copying", async ({
  page,
}) => {
  await openLab(page);
  await generate(page);
  await page.evaluate(() =>
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {
          throw new Error("denied");
        },
      },
    }),
  );
  await page.getByRole("button", { name: "复制提示词", exact: true }).click();
  await expect(
    page.getByText("浏览器未允许复制", { exact: false }),
  ).toBeVisible();
  const editor = page.locator("#research-prompt");
  await expect(editor).toBeFocused();
  expect(
    await editor.evaluate((node: HTMLTextAreaElement) => [
      node.selectionStart,
      node.selectionEnd,
    ]),
  ).toEqual([0, (await editor.inputValue()).length]);
});
test("dirty regeneration requires confirmation and cancel or Escape preserves text and focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1050 });
  await openLab(page);
  await generate(page);
  const editor = page.locator("#research-prompt");
  const original = await editor.inputValue();
  await editor.fill("手动研究稿，请保留。");
  const regenerate = page.getByRole("button", {
    name: "重新生成…",
    exact: true,
  });
  const dialog = page.getByRole("dialog", { name: "替换手动修改的提示词？" });
  await regenerate.click();
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "保留当前内容" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(regenerate).toBeFocused();
  await expect(editor).toHaveValue("手动研究稿，请保留。");
  await regenerate.click();
  await dialog.getByRole("button", { name: "保留当前内容" }).click();
  await expect(editor).toHaveValue("手动研究稿，请保留。");
  await regenerate.click();
  mkdirSync(runtime, { recursive: true });
  await page.screenshot({
    path: `${runtime}/lab-desktop-confirm.png`,
    fullPage: true,
  });
  await dialog.getByRole("button", { name: "替换并重新生成" }).click();
  await expect(dialog).toBeHidden();
  await expect(editor).toHaveValue(original);
  await expect(
    page.getByRole("heading", { name: "交给 AI 的研究请求" }),
  ).toBeFocused();
  await page.screenshot({
    path: `${runtime}/lab-desktop-prompt.png`,
    fullPage: true,
  });
});
test("390x844 mobile flow keeps all four steps, selections and prompt usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLab(page);
  const steps = page.getByRole("navigation", { name: "提示词编写步骤" });
  await expect(steps.getByRole("button")).toHaveCount(4);
  await expect(page.locator("#research-prompt")).toBeHidden();
  await page
    .getByRole("searchbox", { name: "查找机制" })
    .fill("piece-rotation");
  await page.getByRole("button", { name: /^物件旋转/ }).click();
  await expect(
    page.getByText("当前核心", { exact: true }).locator(".."),
  ).toContainText("物件旋转");
  const controls = page.getByRole("navigation", { name: "切换编写步骤" });
  await controls.getByRole("button", { name: "下一步 →" }).click();
  await page.getByRole("button", { name: "结构约束", exact: true }).click();
  await page
    .getByRole("searchbox", { name: "查找机制" })
    .fill("sequential-turns");
  await page.getByRole("button", { name: /轮流行动.*参与者/ }).click();
  await controls.getByRole("button", { name: "下一步 →" }).click();
  await page.getByRole("button", { name: /^Demo 验证/ }).click();
  await page
    .getByRole("checkbox", { name: "成本与风险", exact: true })
    .uncheck();
  await page.getByLabel("补充背景与约束").fill("手机端小原型，只测一次回合。");
  mkdirSync(runtime, { recursive: true });
  await page.screenshot({
    path: `${runtime}/lab-mobile-requirements.png`,
    fullPage: true,
  });
  await controls.getByRole("button", { name: "生成提示词 ↗" }).click();
  const value = await page.locator("#research-prompt").inputValue();
  expect(value).toContain("核心机制：物件旋转");
  expect(value).toContain("结构约束：轮流行动");
  expect(value).toContain("# Demo 验证请求");
  expect(value).not.toContain("### 成本与风险");
  expect(value).toContain("手机端小原型");
  await expect(
    page.getByRole("button", { name: "复制提示词", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
  await page.screenshot({
    path: `${runtime}/lab-mobile-prompt.png`,
    fullPage: true,
  });
  await controls.getByRole("button", { name: "调整要求" }).click();
  await expect(page.getByLabel("补充背景与约束")).toHaveValue(
    "手机端小原型，只测一次回合。",
  );
  await steps.getByRole("button", { name: /提示词/ }).click();
  await expect(page.locator("#research-prompt")).toHaveValue(value);
});
