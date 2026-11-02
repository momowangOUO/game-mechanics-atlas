import { test, expect } from "@playwright/test";
import { appPath, appHref } from "./navigation";
import { readFileSync } from "node:fs";
await import("../../scripts/register-typescript.mjs");
const { dataset } = await import("../../src/lib/knowledge.ts");
const { taxonomyGroups } = await import("../../src/data/taxonomy-reference.ts");
const { playStyles } = await import("../../src/data/play-styles.ts");
const { instances, sources } = JSON.parse(
  readFileSync("docs/research/game-evidence.json", "utf8"),
);
const SITE_URL = "https://momowangouo.github.io/game-mechanics-atlas";
const canonicalUrl = (path: string) =>
  `${SITE_URL}${path === "/" ? "/" : path + "/"}`;
const SUPPORT_MESSAGE =
  "如果这些资料对你有帮助，欢迎到 GitHub 项目页点个 Star，支持后续整理。";
type CatalogEntity = {
  kind: string;
  id: string;
  name: string;
  canonicalUrl: string;
};

test("new taxonomy routes deliver distinct titles, canonical URLs and readable SSR bodies", async ({
  request,
}) => {
  const titles = new Set<string>();
  const catalog = await (
    await request.get(appPath("/data/v1/catalog.json"))
  ).json();
  const taxonomyRoutes = (catalog.entities as CatalogEntity[]).filter(
    (row) => row.kind === "dimension" || row.kind === "taxonomyGroup",
  );
  expect(taxonomyRoutes).toHaveLength(dataset.dimensions.length + taxonomyGroups.length);
  const routes = [
    ...taxonomyRoutes.map((row) => ({
      path: row.canonicalUrl.slice(SITE_URL.length).replace(/\/$/, ""),
      name: row.name,
    })),
    { path: "/for-agents", name: "机器阅读入口" },
    { path: "/copyright", name: "版权与署名" },
  ];
  for (const { path, name } of routes) {
    const response = await request.get(appHref(path));
    expect(response.status(), path).toBe(200);
    const html = await response.text();
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
    expect(title, path).toContain(name.split("：")[0]);
    expect(title, path).toBeTruthy();
    expect(titles.has(title!), path).toBe(false);
    titles.add(title!);
    expect(html, path).toContain(
      `rel="canonical" href="${canonicalUrl(path)}"`,
    );
    expect(html, path).toContain(
      `type="text/markdown" href="${canonicalUrl(path)}index.md"`,
    );
    expect(html, path).toContain(name);
    expect(html, path).not.toMatch(/name="robots" content="[^"]*noindex/);
  }
});

test("sitemap matches all content routes without query variants or invented modification dates", async ({
  request,
}) => {
  const response = await request.get(appPath("/sitemap.xml"));
  expect(response.status()).toBe(200);
  const xml = await response.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (match) => match[1],
  );
  const catalog = await (
    await request.get(appPath("/data/v1/catalog.json"))
  ).json();
  const indexes = ["/", "/taxonomy", "/mechanics", "/games", "/games/coverage", "/play-styles", "/types", "/graph", "/lab", "/compare", "/heat", "/method", "/sources", "/for-agents", "/copyright"];
  const expected = new Set([
    ...indexes.map(canonicalUrl),
    ...playStyles.map(row => canonicalUrl(`/play-styles/${row.id}`)),
    ...(catalog.entities as CatalogEntity[]).map(row => row.canonicalUrl),
  ]);
  expect(new Set(urls)).toEqual(expected);
  expect(urls).toHaveLength(expected.size);
  expect(new Set(urls).size).toBe(urls.length);
  expect(urls).toContain(canonicalUrl("/copyright"));
  expect(xml).not.toContain("<lastmod>");
  expect(urls.every((url) => !/[?#]/.test(url))).toBe(true);
});

test("static machine resources expose real IDs, exact instance conditions and source provenance", async ({
  request,
}) => {
  const llms = await request.get(appPath("/llms.txt"));
  expect(llms.status()).toBe(200);
  const navigation = await llms.text();
  expect(navigation).toContain("# 机制研究室");
  expect(navigation).toContain("作者：魔魔王");
  expect(navigation).toContain(`${SITE_URL}/data/v1/catalog.json`);
  const catalogResponse = await request.get(appPath("/data/v1/catalog.json"));
  expect(catalogResponse.status()).toBe(200);
  const catalog = await catalogResponse.json();
  expect(catalog.counts).toEqual({
    dimensions: dataset.dimensions.length,
    groups: taxonomyGroups.length,
    mechanics: dataset.mechanics.length,
    games: dataset.games.length,
    types: dataset.genres.length,
    recipes: dataset.recipes.length,
    instances: dataset.instances.length,
    sources: dataset.sources.length,
  });
  const conditional = instances.find(
    (row: { status: string; sourceIds: string[] }) =>
      row.status === "conditional" && row.sourceIds.length,
  )!;
  const entityResponse = await request.get(
    appPath(`/data/v1/mechanics/${conditional.mechanicId}.json`),
  );
  expect(entityResponse.status()).toBe(200);
  const entity = await entityResponse.json();
  expect(entity.canonicalUrl).toBe(
    canonicalUrl(`/mechanics/${conditional.mechanicId}`),
  );
  expect(
    entity.instances.find((row: { id: string }) => row.id === conditional.id),
  ).toEqual(conditional);
  expect(
    entity.scopes.some((row: { id: string }) => row.id === conditional.scopeId),
  ).toBe(true);
  for (const sourceId of conditional.sourceIds)
    expect(
      entity.sources.find((row: { id: string }) => row.id === sourceId),
    ).toEqual(sources.find((row: { id: string }) => row.id === sourceId));
  const markdownResponse = await request.get(
    appPath(`/mechanics/${conditional.mechanicId}/index.md`),
  );
  expect(markdownResponse.status()).toBe(200);
  const markdown = await markdownResponse.text();
  expect(markdown).toContain(conditional.condition!);
  expect(markdown).toContain(conditional.scopeId);
  expect(markdown).toContain("条件存在（conditional）");
  expect(markdown).toContain("作者：魔魔王");
  const copyright = await request.get(appPath("/copyright/index.md"));
  expect(copyright.status()).toBe(200);
  expect(await copyright.text()).toContain("© 2026 魔魔王");
});

test("reading and attribution remain available with JavaScript disabled", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto(appHref("/for-agents"));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "机器阅读入口",
  );
  await expect(page.getByText(SUPPORT_MESSAGE, { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "JSON 实体目录 →" }),
  ).toHaveAttribute("href", appPath("/data/v1/catalog.json"));
  const catalog = await (
    await context.request.get(appPath("/data/v1/catalog.json"))
  ).json();
  const group = (catalog.entities as CatalogEntity[]).find(
    (row) => row.kind === "taxonomyGroup",
  )!;
  await page.goto(appHref(group.canonicalUrl.slice(SITE_URL.length)));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(group.name);
  const groupData = await (
    await context.request.get(appPath(`/data/v1/groups/${group.id}.json`))
  ).json();
  await expect(page.locator("article[data-mechanic-id]")).toHaveCount(
    groupData.mechanicIds.length,
  );
  for (const mechanicId of groupData.mechanicIds as string[]) {
    const mechanic = page.locator(`article[data-mechanic-id="${mechanicId}"]`);
    await expect(
      mechanic.getByRole("heading", { name: "游戏范例", exact: true, level: 4 }),
    ).toBeVisible();
    await expect(mechanic.locator('a[href*="/games/"]')).not.toHaveCount(0);
    await expect(mechanic.locator('a[href^="https://"]')).not.toHaveCount(0);
  }
  await expect(
    page.locator('script[type="application/ld+json"]'),
  ).not.toHaveCount(0);
  await context.close();
});
