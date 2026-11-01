import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const base = (
  process.env.PLAYWRIGHT_BASE_URL ||
  "http://127.0.0.1:3000/game-mechanics-atlas"
).replace(/\/$/, "");
const output = "docs/mechanic-visuals/runtime";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const records = [];
async function open(page, route) {
  const response = await page.goto(`${base}${route}`);
  const intro = page.getByTestId("brand-intro");
  await intro.waitFor({ state: "visible" });
  await intro.waitFor({ state: "hidden" });
  await page.evaluate(async () => {
    const visible = Array.from(document.images).filter((image) => {
      const box = image.getBoundingClientRect();
      return (
        box.width > 0 &&
        box.height > 0 &&
        box.top < innerHeight &&
        box.bottom > 0
      );
    });
    await Promise.all(
      visible.map((image) => {
        image.loading = "eager";
        return image.decode().catch(() => {});
      }),
    );
    await document.fonts.ready;
  });
  return response;
}
for (const mobile of process.argv.includes("--video-only")
  ? []
  : [false, true]) {
  const width = mobile ? 390 : 1440;
  const context = await browser.newContext({
    viewport: { width, height: mobile ? 844 : 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const [name, route] of process.argv.includes("--samples-only")
    ? []
    : [
        ["home", "/"],
        ["taxonomy", "/taxonomy/"],
        ["extraction-page", "/mechanics/extraction-bank/"],
        ["game", "/games/balatro/"],
        ["graph", "/graph/"],
        ["lab", "/lab/?recipe=aimed-buildcraft"],
        ["agents", "/for-agents/"],
      ]) {
    const response = await open(page, route);
    await page.screenshot({
      path: `${output}/${name}-${mobile ? "mobile" : "desktop"}.png`,
    });
    records.push({
      name,
      route,
      width,
      status: response.status(),
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth,
      ),
      errors: [...errors],
    });
  }
  for (const id of ["direct-movement", "jump", "extraction-bank"]) {
    await open(page, `/mechanics/${id}/`);
    const story = page.getByRole("region", {
      name: `${await page.locator("h1").innerText()}图解`,
    });
    await story.evaluate((element) =>
      element.scrollIntoView({ block: "center" }),
    );
    await story.locator("img").evaluateAll(async (images) =>
      Promise.all(
        images.map((image) => {
          image.loading = "eager";
          return image.decode().catch(() => {});
        }),
      ),
    );
    await story.screenshot({
      path: `${output}/${id}-${mobile ? "mobile" : "desktop"}.png`,
    });
  }
  await context.close();
}
if (records.length)
  await writeFile(
    `${output}/capture-report.json`,
    JSON.stringify(records, null, 2) + "\n",
  );
if (process.argv.includes("--video")) {
  await mkdir(".build/illustrated-video", { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
    recordVideo: {
      dir: ".build/illustrated-video",
      size: { width: 1440, height: 1000 },
    },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  await open(page, "/");
  await page.waitForTimeout(1200);
  await page
    .locator(".nav")
    .getByRole("link", { name: "分类参考", exact: true })
    .click();
  await page.getByRole("button", { name: /^直接移动.*阅读/ }).click();
  await page.getByRole("heading", { name: "直接移动", exact: true }).waitFor();
  await page.waitForTimeout(1200);
  await page
    .getByRole("link", { name: "完整机制档案 ↗", exact: true })
    .click();
  await page.getByRole("region", { name: "直接移动图解" }).waitFor();
  const story = page.getByRole("region", { name: "直接移动图解" });
  await story.evaluate((element) =>
    element.scrollIntoView({ block: "center", behavior: "smooth" }),
  );
  await page.waitForTimeout(2200);
  await story.getByRole("button", { name: "规则示意", exact: true }).click();
  await story.getByRole("button", { name: /^2\./ }).click();
  await page.waitForTimeout(1200);
  await story.getByRole("button", { name: /^3\./ }).click();
  await page.waitForTimeout(1200);
  await page
    .locator(".nav")
    .getByRole("link", { name: /研究提示词/ })
    .click();
  await page.getByRole("button", { name: /^生成提示词/ }).click();
  await page.locator("#research-prompt").waitFor();
  await page.waitForTimeout(2200);
  const video = page.video();
  await context.close();
  await video.saveAs(".build/illustrated-video/research-session.webm");
}
await browser.close();
console.log(
  JSON.stringify({
    captures: records.length,
    issues: records.filter(
      (row) => row.status !== 200 || row.overflow > 0 || row.errors.length,
    ),
  }),
);
