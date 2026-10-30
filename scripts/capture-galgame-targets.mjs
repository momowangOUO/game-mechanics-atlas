import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const base = process.env.DESIGN_URL || "http://127.0.0.1:54102";
await mkdir("design/galgame/targets", { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const records = [];
for (const [id, width, height] of [
  ["home-desktop", 1440, 960],
  ["home-mobile", 390, 844],
  ["mechanic", 1440, 960],
  ["game", 1440, 960],
  ["heat", 1440, 960],
  ["lab", 1440, 960],
  ["lab-complete", 1440, 960],
  ["lab-conflict", 1440, 960],
  ["lab-mobile", 390, 844],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  const failed = [];
  page.on("response", (r) => {
    if (r.status() >= 400)
      failed.push({ url: new URL(r.url()).pathname, status: r.status() });
  });
  await page.goto(`${base}/galgame/${id === "lab-mobile" ? "lab" : id}.html`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({
    path: `design/galgame/targets/${id}.png`,
    fullPage: true,
  });
  records.push({ id, width, height, failed });
  await page.close();
}
await browser.close();
await writeFile(
  "design/galgame/targets/report.json",
  JSON.stringify(records, null, 2),
);
console.log(
  JSON.stringify(records.map((r) => ({ id: r.id, missing: r.failed.length }))),
);
