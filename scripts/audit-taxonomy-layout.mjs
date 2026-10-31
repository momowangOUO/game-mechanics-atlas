import { chromium } from "@playwright/test";
import fs from "node:fs";
fs.mkdirSync(".build", { recursive: true });
const rows = JSON.parse(
  fs.readFileSync("docs/research/mechanic-dossiers.json", "utf8"),
).mechanisms;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 320, height: 640 },
  reducedMotion: "reduce",
});
page.setDefaultTimeout(5000);
const report = {
  viewport: { width: 320, height: 640 },
  mechanisms: 0,
  states: 0,
  failures: [],
};
const origin =
  (process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000").replace(
    /\/$/,
    "",
  ) + (process.env.PAGES_BASE_PATH ?? "");
async function check(panel, id, label) {
  report.states++;
  const bounds = await panel.evaluate((el) => {
    const c = el.querySelector("[role=tabpanel]");
    return {
      height: c.clientHeight,
      scroll: c.scrollHeight,
      panelHeight: el.clientHeight,
      panelScroll: el.scrollHeight,
      rootHeight: document.documentElement.scrollHeight,
    };
  });
  if (
    bounds.scroll > bounds.height + 2 ||
    bounds.panelScroll > bounds.panelHeight + 2 ||
    bounds.rootHeight > 640
  )
    report.failures.push({ id, label, ...bounds });
}
for (const [index, row] of rows.entries()) {
  try {
    await page.goto(origin + "/taxonomy?mechanic=" + row.id);
    const panel = page.getByRole("region", { name: "机制阅读卡", exact: true });
    await panel.getByRole("heading", { name: row.name, exact: true }).waitFor();
    for (const [label, pager] of [
      ["有什么用", "作用与风险下一页"],
      ["典型游戏", "游戏实例下一页"],
      ["怎么区分", "机制边界下一页"],
    ]) {
      await panel.getByRole("tab", { name: label, exact: true }).click();
      await check(panel, row.id, label);
      const next = panel.getByRole("button", { name: pager, exact: true });
      let i = 0;
      while (
        (await next.count()) &&
        (await next.isVisible()) &&
        (await next.isEnabled())
      ) {
        const before = await next.evaluate((el) => el.parentElement.innerText);
        await next.click();
        await page.waitForFunction(
          ({ label, before }) =>
            document.querySelector(`button[aria-label="${label}"]`)
              ?.parentElement?.innerText !== before,
          { label: pager, before },
        );
        await check(panel, row.id, label + ":" + ++i);
        if (i > 10) throw new Error("Unexpected pager cycle");
      }
    }
  } catch (error) {
    report.failures.push({ id: row.id, error: String(error), url: page.url() });
  }
  report.mechanisms = index + 1;
  fs.writeFileSync(
    ".build/taxonomy-final-audit.json",
    JSON.stringify(report, null, 2),
  );
  if (index % 20 === 0)
    console.log(
      "audited",
      index + 1,
      "/",
      rows.length,
      "states",
      report.states,
      "failures",
      report.failures.length,
    );
}
console.log(JSON.stringify(report, null, 2));
await browser.close();
if (report.failures.length) process.exitCode = 1;
