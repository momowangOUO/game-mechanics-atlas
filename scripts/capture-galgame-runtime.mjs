import { chromium } from "@playwright/test";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
const base = (
  process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000"
).replace(/\/$/, "");
const basePath = new URL(base).pathname.replace(/\/$/, "");
const root = "docs/game-artist";
await mkdir(`${root}/runtime`, { recursive: true });
const manifest = JSON.parse(await readFile(`${root}/assets.json`, "utf8"));
const buildId = (await readFile(".next/BUILD_ID", "utf8")).trim();
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const descriptor = async (path) => ({
  path,
  sha256: hash(await readFile(path)),
});
const browser = await chromium.launch({ channel: "msedge", headless: true });
const captures = [];
const allSeen = new Set();
const homeAssets = [
  "room-dusk",
  "maid-welcome",
  "chapter-mechanics",
  "chapter-games",
  "chapter-graph",
  "chapter-heat",
  "chapter-lab",
];
const requiredByView = {
  "home-desktop": [...homeAssets, "desk-foreground"],
  "home-mobile": homeAssets,
  "home-small": homeAssets,
  mechanic: ["chapter-mechanics", "maid-explain"],
  game: ["chapter-games", "game-balatro", "chapter-graph"],
  "game-factorio": ["chapter-games", "game-factorio", "chapter-graph"],
  "recipe-automation": [
    "chapter-lab",
    "recipe-automation-logistics",
    "maid-explain",
  ],
  heat: ["chapter-heat", "maid-think"],
  lab: ["chapter-lab", "recipe-aimed-buildcraft", "maid-explain"],
  "lab-complete": ["chapter-lab", "maid-complete"],
  "lab-conflict": ["chapter-lab", "maid-conflict"],
  "lab-mobile": ["chapter-lab", "recipe-aimed-buildcraft"],
  "lab-mobile-complete": ["maid-complete"],
};
const definitions = [
  ["home-desktop", "/", 1440, 960, "home-desktop", "home"],
  ["home-mobile", "/", 390, 844, "home-mobile", "home"],
  ["home-small", "/", 320, 640, "home-mobile", "home"],
  ["mechanic", "/mechanics/in-run-deck-growth", 1440, 960, "mechanic", "file"],
  ["game", "/games/balatro", 1440, 960, "game", "file"],
  ["game-factorio", "/games/factorio", 1440, 960, "game", "file"],
  [
    "recipe-automation",
    "/lab?recipe=automation-logistics",
    1440,
    960,
    "lab",
    "initial",
  ],
  ["heat", "/heat", 1440, 960, "heat", "file"],
  ["lab", "/lab?recipe=aimed-buildcraft", 1440, 960, "lab", "initial"],
  ["lab-complete", "/lab", 1440, 960, "lab-complete", "complete"],
  [
    "lab-conflict",
    "/lab?recipe=aimed-buildcraft",
    1440,
    960,
    "lab-conflict",
    "conflict",
  ],
  [
    "lab-mobile",
    "/lab?recipe=aimed-buildcraft",
    390,
    844,
    "lab-mobile",
    "initial",
  ],
  ["lab-mobile-complete", "/lab", 320, 640, "lab-mobile", "mobile-complete"],
];
for (const [id, route, width, height, target, state] of definitions) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const response = await page.goto(`${base}${route}`);
  await page.waitForLoadState("networkidle");
  if (state === "complete")
    await page.getByRole("button", { name: /^分析当前组合/ }).click();
  if (state === "conflict") {
    await page
      .getByRole("combobox", { name: "核心机制", exact: true })
      .selectOption("real-time-update");
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
    await page.getByRole("button", { name: /^分析当前组合/ }).click();
    await page.getByRole("tab", { name: "协同与冲突", exact: true }).click();
  }
  if (state === "mobile-complete") {
    await page
      .getByRole("navigation", { name: "实验步骤", exact: true })
      .getByRole("button")
      .nth(2)
      .click();
    await page
      .getByRole("navigation", { name: "移动端实验步骤控制" })
      .getByRole("button", { name: "分析组合 →" })
      .click();
    await page.getByRole("button", { name: "概况与边界", exact: true }).click();
  }
  await page
    .locator("img")
    .evaluateAll((images) =>
      images.forEach((image) => (image.loading = "eager")),
    );
  await page.waitForFunction(() =>
    Array.from(document.images).every((image) => image.complete),
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  const layout = await page.evaluate(() => ({
    root_scroll_extent: [
      document.documentElement.scrollWidth - innerWidth,
      document.documentElement.scrollHeight - innerHeight,
    ],
    fullscreen_nested_scroll: [...document.querySelectorAll("main *")].some(
      (e) => {
        const s = getComputedStyle(e),
          r = e.getBoundingClientRect();
        return (
          /auto|scroll/.test(s.overflowY) &&
          e.scrollHeight > e.clientHeight + 2 &&
          r.height > innerHeight * 0.8
        );
      },
    ),
  }));
  const seen = await page.locator("img").evaluateAll((images) =>
    images
      .filter(
        (image) =>
          image.naturalWidth &&
          image.checkVisibility({
            checkOpacity: true,
            checkVisibilityCSS: true,
          }) &&
          image.getBoundingClientRect().bottom > 0 &&
          image.getBoundingClientRect().top < innerHeight,
      )
      .map((image) => new URL(image.src).pathname),
  );
  const visible = manifest.assets
    .filter((a) => seen.includes(basePath + a.path.replace("public", "")))
    .map((a) => a.id);
  visible.forEach((a) => allSeen.add(a));
  const capture = `${root}/runtime/${id}.png`;
  await page.screenshot({ path: capture });
  if (width > 700) {
    await page.screenshot({
      path: `${root}/runtime/${id}-full.png`,
      fullPage: true,
    });
  }
  captures.push({
    id,
    build_id: buildId,
    screen: route,
    state,
    platform: width > 700 ? "desktop" : "phone",
    layout: width > height ? "landscape" : "portrait",
    viewport: { width, height },
    target: await descriptor(`design/galgame/targets/${target}.png`),
    capture: await descriptor(capture),
    viewport_rect: [0, 0, width, height],
    runtime_origin: {
      kind: "browser_runtime",
      entry: route,
      steps: [`进入 ${route}`, `执行 ${state} 状态的真实页面操作`],
      environment:
        "Windows Edge headless; desktop browser with simulated viewport",
    },
    visible_asset_ids: visible,
    layout_measurements: layout,
    status: response.status(),
    errors,
  });
  await context.close();
}
// Verify every shipped master asset against the bytes served by this build.
const api = await browser.newContext();
const assetChecks = [];
for (const asset of manifest.assets) {
  const response = await api.request.get(
    base + asset.path.replace("public", ""),
  );
  const bytes = await response.body();
  assetChecks.push({
    id: asset.id,
    status: response.status(),
    hashMatches: hash(bytes) === asset.sha256,
  });
}
await api.close();
await browser.close();
const contract = {
  schema_version: 1,
  profile: "research-website",
  contract_id: "galgame-2026-10-31",
  assets: manifest.assets,
  required_views: captures.map((v) => ({
    id: v.id,
    screen: v.screen,
    state: v.state,
    platform: v.platform,
    layout: v.layout,
    viewport: v.viewport,
    target: v.target,
    required_assets: requiredByView[v.id],
  })),
  rules: {
    allViews:
      "no horizontal overflow, no page errors, current build and real UI",
    phoneTaskViews:
      "home and lab must have zero vertical root scroll and no near-fullscreen nested reader",
    desktopDocuments:
      "vertical browser reading scroll is intentional; pages contain complete research content",
  },
};
const evidence = {
  schema_version: 1,
  profile: "research-website",
  build_id: buildId,
  contract_sha256: hash(Buffer.from(JSON.stringify(contract, null, 2))),
  views: captures,
  assetChecks,
};
await writeFile(
  `${root}/visual-contract.json`,
  JSON.stringify(contract, null, 2),
);
await writeFile(
  `${root}/visual-evidence.json`,
  JSON.stringify(evidence, null, 2),
);
const failures = captures
  .filter(
    (v) =>
      v.status !== 200 ||
      v.errors.length ||
      requiredByView[v.id].some((id) => !v.visible_asset_ids.includes(id)) ||
      v.layout_measurements.root_scroll_extent[0] !== 0 ||
      (v.platform === "phone" &&
        (v.layout_measurements.root_scroll_extent[1] !== 0 ||
          v.layout_measurements.fullscreen_nested_scroll)),
  )
  .map((v) => v.id);
if (assetChecks.some((a) => a.status !== 200 || !a.hashMatches))
  failures.push("assets");
console.log(
  JSON.stringify({
    buildId,
    views: captures.length,
    assets: assetChecks.length,
    failures,
  }),
);
if (failures.length) process.exitCode = 1;
