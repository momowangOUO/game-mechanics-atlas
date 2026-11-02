import { gotoApp } from "./navigation";
import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
const mechanicCount = JSON.parse(
  readFileSync("docs/research/mechanic-dossiers.json", "utf8"),
).mechanisms.length;
async function stage(page: Page, name: string) {
  await page
    .getByRole("navigation", { name: "提示词编写步骤" })
    .getByRole("button", { name: new RegExp(name) })
    .click();
}
test("changed settings preserve the previous prompt until explicitly regenerated", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1050 });
  await gotoApp(page, "/lab?recipe=aimed-buildcraft&add=sequential-turns");
  await page.getByRole("button", { name: /^生成提示词/ }).click();
  const editor = page.locator("#research-prompt");
  const original = await editor.inputValue();
  await stage(page, "核心机制");
  await page
    .getByRole("searchbox", { name: "查找机制" })
    .fill("real-time-update");
  await page.getByRole("button", { name: /^实时推进/ }).click();
  await expect(
    page.getByText("研究设置已更改", { exact: false }),
  ).toBeVisible();
  await expect(editor).toHaveValue(original);
  await page.getByRole("button", { name: /^重新生成提示词/ }).click();
  await expect(editor).not.toHaveValue(original);
  expect(await editor.inputValue()).toContain("核心机制：实时推进");
  expect(await editor.inputValue()).toContain("结构约束：轮流行动");
  await expect(page.getByText("研究设置已更改", { exact: false })).toHaveCount(
    0,
  );
  await expect(page.getByRole("button", { name: /^分析当前组合/ })).toHaveCount(
    0,
  );
});
test("full candidate lists and dimension filtering preserve independent selections", async ({
  page,
}) => {
  await gotoApp(page, "/lab?recipe=aimed-buildcraft");
  await expect(page.locator('[class*="candidates"] > button')).toHaveCount(
    mechanicCount,
  );
  await expect(
    page.getByRole("navigation", { name: "机制候选分页" }),
  ).toHaveCount(0);
  await stage(page, "配合与结构");
  await page
    .getByRole("searchbox", { name: "查找机制" })
    .fill("piece-rotation");
  const rotation = page.getByRole("button", { name: /^物件旋转/ });
  await rotation.click();
  await expect(rotation).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "结构约束", exact: true }).click();
  await page
    .getByRole("searchbox", { name: "查找机制" })
    .fill("planning-timer");
  const timer = page.getByRole("button", { name: /^规划时限/ });
  await timer.click();
  await expect(timer).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /^生成提示词/ }).click();
  const value = await page.locator("#research-prompt").inputValue();
  expect(value).toContain("配合机制：物件旋转");
  expect(value).toContain("结构约束：规划时限");
  await stage(page, "核心机制");
  await page.getByRole("button", { name: "移除物件旋转", exact: true }).click();
  await page.getByRole("button", { name: /^重新生成提示词/ }).click();
  expect(await page.locator("#research-prompt").inputValue()).not.toContain(
    "配合机制：物件旋转",
  );
});
for (const [width, height] of [
  [390, 844],
  [320, 844],
  [360, 780],
  [320, 640],
]) {
  test(`mobile ${width}x${height} separates selection, requirements and editable prompt`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await gotoApp(page, "/lab?recipe=aimed-buildcraft");
    await expect(page.locator("#research-prompt")).toBeHidden();
    await expect(page.locator('[class*="candidates"] > button')).toHaveCount(
      mechanicCount,
    );
    await stage(page, "配合与结构");
    await page
      .getByRole("searchbox", { name: "查找机制" })
      .fill("piece-rotation");
    await page.getByRole("button", { name: /^物件旋转/ }).click();
    await stage(page, "研究要求");
    await expect(page.getByRole("checkbox", { name: /易上手/ })).toBeVisible();
    await expect(
      page.getByRole("searchbox", { name: "查找机制" }),
    ).toBeHidden();
    await page
      .getByRole("navigation", { name: "切换编写步骤" })
      .getByRole("button", { name: "生成提示词 ↗" })
      .click();
    await expect(page.locator("#research-prompt")).toBeVisible();
    expect(await page.locator("#research-prompt").inputValue()).toContain(
      "配合机制：物件旋转",
    );
    await expect(
      page.getByRole("heading", { name: "交给 AI 的研究请求" }),
    ).toBeFocused();
    await page
      .getByRole("button", { name: "下载 .md", exact: true })
      .scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("button", { name: "下载 .md", exact: true }),
    ).toBeInViewport();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await stage(page, "配合与结构");
    await expect(
      page.getByRole("button", { name: "移除物件旋转" }),
    ).toBeVisible();
  });
}
test("short keyboard viewport keeps search and candidate interaction reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await gotoApp(page, "/lab?recipe=aimed-buildcraft");
  await stage(page, "配合与结构");
  await page.setViewportSize({ width: 320, height: 400 });
  const search = page.getByRole("searchbox", { name: "查找机制" });
  await search.fill("piece-rotation");
  await search.scrollIntoViewIfNeeded();
  await expect(search).toBeInViewport();
  const choice = page.getByRole("button", { name: /^物件旋转/ });
  await choice.scrollIntoViewIfNeeded();
  await choice.focus();
  await page.keyboard.press("Enter");
  await expect(choice).toHaveAttribute("aria-pressed", "true");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
