import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const base = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000";
await mkdir("docs/game-artist/motion", { recursive: true });
await mkdir(".build/motion-recordings", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 960 },
  reducedMotion: "no-preference",
  recordVideo: {
    dir: ".build/motion-recordings",
    size: { width: 1440, height: 960 },
  },
});
await context.addInitScript(() => localStorage.setItem("atlas.motion", "full"));
const page = await context.newPage();
const events = [];
async function event(action) {
  events.push({ action, at: Date.now() });
  // Deliberate viewing dwell in this recorder only; the website never waits.
  await page.waitForTimeout(900);
}
await page.goto(base);
await page.waitForLoadState("networkidle");
await page.waitForFunction(
  () => document.documentElement.dataset.effects === "full",
);
await event("进入实际生产首页，开启完整动态");
await page.locator(".vn-stage").hover({ position: { x: 1200, y: 200 } });
await event("鼠标移动触发场景与独立前景视差");
await page.getByRole("button", { name: "听听 RIN 的研究建议" }).click();
await page.locator('[data-maid-state="explain"] img').waitFor();
await page.waitForFunction(() =>
  Array.from(document.querySelectorAll(".vn-character img")).every(
    (i) => i.complete,
  ),
);
await event("继续对话，切换讲解姿势");
await page.getByRole("button", { name: "听听 RIN 的研究建议" }).click();
await page.waitForFunction(() =>
  Array.from(document.querySelectorAll(".vn-character img")).every(
    (i) => i.complete,
  ),
);
await event("继续对话，切换思考姿势");
await page
  .getByRole("navigation", { name: "研究室章节" })
  .getByRole("link")
  .filter({ hasText: "混合实验室" })
  .click();
await page.waitForLoadState("networkidle");
await event("通过章节入口进入实验室");

await page.getByRole("button", { name: /^分析当前组合/ }).click();
await page.waitForFunction(
  () =>
    document
      .querySelector("[data-analysis-state]")
      ?.getAttribute("data-analysis-state") === "ready",
);
await event("真实规则结果立即提交；短演出结束显示整理完成");
await page
  .getByRole("navigation", { name: "实验步骤", exact: true })
  .getByRole("button")
  .nth(0)
  .click();
await page.getByLabel("组合配方").selectOption("aimed-buildcraft");
await event("应用瞄准与构筑配方，卡片入槽并标记旧报告");
await page.getByRole("tab", { name: "风险与 Demo", exact: true }).click();
await event("切换报告页签");
await page
  .getByRole("combobox", { name: "核心机制", exact: true })
  .selectOption("real-time-update");
await event("修改核心，显示旧分析边界");
await page
  .getByRole("navigation", { name: "实验步骤", exact: true })
  .getByRole("button")
  .nth(1)
  .click();
await page.getByRole("button", { name: "流程与结构", exact: true }).click();
await page
  .getByRole("searchbox", { name: "搜索机制" })
  .fill("sequential-turns");
await page.getByRole("checkbox", { name: /轮流行动/ }).check();
await event("添加轮流行动，与实时推进形成同一时钟的潜在冲突");
await page.getByRole("button", { name: /^重新分析当前组合/ }).click();
await page.waitForFunction(
  () =>
    document
      .querySelector("[data-analysis-state]")
      ?.getAttribute("data-analysis-state") === "ready",
);
await page.getByRole("tab", { name: "协同与冲突", exact: true }).click();
await event("更新分析，显示冲突角色、机制对与解释");
await page.evaluate(() => window.scrollTo(0, 0));
await page.screenshot({ path: "docs/game-artist/motion/final-conflict.png" });
const video = page.video();
await context.close();
await rename(
  await video.path(),
  "docs/game-artist/motion/research-session.webm",
);
await browser.close();
await writeFile(
  "docs/game-artist/motion/events.json",
  JSON.stringify(
    events.map((e) => ({ ...e, atMs: e.at - events[0].at, at: undefined })),
    null,
    2,
  ),
);
const sourcePath = "docs/game-artist/motion/research-session.webm";
const sourceBytes = await readFile(sourcePath);
await writeFile(
  "docs/game-artist/motion/manifest.json",
  JSON.stringify(
    {
      buildId: (await readFile(".next/BUILD_ID", "utf8")).trim(),
      path: sourcePath,
      sha256: createHash("sha256").update(sourceBytes).digest("hex"),
      bytes: sourceBytes.length,
      viewport: { width: 1440, height: 960 },
      environment:
        "Windows Edge headless; actual browser actions against local production build",
    },
    null,
    2,
  ),
);
execFileSync(process.execPath, ["scripts/convert-recording.mjs"], {
  stdio: "inherit",
});
console.log(
  JSON.stringify({
    events: events.length,
    path: "docs/game-artist/motion/research-session.mp4",
  }),
);
