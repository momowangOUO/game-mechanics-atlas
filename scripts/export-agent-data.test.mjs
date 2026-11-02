import "./register-typescript.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";

const { createAgentDocuments } = await import("./export-agent-data.mjs");
const { publicContentPaths, SITE_URL } = await import("../src/lib/seo.ts");
const { dataset } = await import("../src/lib/knowledge.ts");
const { mechanicScenes } = await import("../src/data/mechanic-scenes.ts");
const { taxonomyGroups } = await import("../src/data/taxonomy-reference.ts");
const { taxonomyGroupVisuals } = await import(
  "../src/data/taxonomy-group-visuals.ts"
);
const files = createAgentDocuments();
const parse = (name) => JSON.parse(files.get(name));

test("all registered taxonomy groups have distinct real square transparent illustrations", () => {
  const expected = taxonomyGroups.map((group) => group.id).sort();
  assert.ok(expected.length > 0);
  assert.deepEqual(Object.keys(taxonomyGroupVisuals).sort(), expected);
  const root = new URL("../public/art/taxonomy-groups/", import.meta.url);
  assert.deepEqual(
    readdirSync(root)
      .filter((name) => name.endsWith(".webp"))
      .sort(),
    expected.map((id) => `${id}.webp`).sort(),
  );
  const hashes = new Set();
  for (const group of taxonomyGroups) {
    const visual = taxonomyGroupVisuals[group.id];
    assert.equal(visual.iconSrc, `/art/taxonomy-groups/${group.id}.webp`);
    assert.ok(visual.description.length > 4, group.id);
    const bytes = readFileSync(new URL(`${group.id}.webp`, root));
    assert.ok(bytes.length > 1000, group.id);
    assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
    assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
    // Pillow's lossless WebP stores its actual dimensions and alpha flag in VP8L.
    let offset = 12;
    let lossless;
    while (offset + 8 <= bytes.length) {
      const kind = bytes.toString("ascii", offset, offset + 4);
      const length = bytes.readUInt32LE(offset + 4);
      if (kind === "VP8L")
        lossless = bytes.subarray(offset + 8, offset + 8 + length);
      offset += 8 + length + (length % 2);
    }
    assert.ok(lossless, group.id);
    assert.equal(lossless[0], 0x2f);
    const bits = lossless.readUInt32LE(1);
    assert.equal((bits & 0x3fff) + 1, 512, group.id);
    assert.equal(((bits >>> 14) & 0x3fff) + 1, 512, group.id);
    assert.equal((bits >>> 28) & 1, 1, `${group.id} alpha`);
    const hash = createHash("sha256").update(bytes).digest("hex");
    assert.equal(hashes.has(hash), false, `${group.id} reused image`);
    hashes.add(hash);
    const exported = parse(`data/v1/groups/${group.id}.json`);
    assert.equal(
      exported.illustration.epistemicStatus,
      "editorial_illustration",
    );
    assert.equal(exported.illustration.icon, `${SITE_URL}${visual.iconSrc}`);
    const markdown = files.get(
      `taxonomy/${group.dimensionId}/${group.id}/index.md`,
    );
    assert.ok(markdown.includes(exported.illustration.icon));
    assert.deepEqual(exported.mechanicIds, group.mechanicIds);
    assert.equal(exported.dimensionId, group.dimensionId);
  }
});

test("current search snapshot links remain direct JSON URLs", () => {
  const heat = files.get("heat/index.md");
  assert.ok(
    heat.includes(`${SITE_URL}/data/search-demand/current-trends.json)`),
  );
  assert.equal(heat.includes("current-trends.json/"), false);
});

test("every canonical content page has a Markdown alternate", () => {
  for (const path of publicContentPaths()) {
    const name = `${path === "/" ? "" : path.slice(1) + "/"}index.md`;
    assert.ok(files.has(name), name);
    assert.match(files.get(name), /作者：魔魔王/);
    assert.ok(files.get(name).includes(`${SITE_URL}/`));
  }
});

test("registry points only at generated entity resources and real page alternates", () => {
  const catalog = parse("data/v1/catalog.json");
  assert.deepEqual(catalog.counts, {
    dimensions: dataset.dimensions.length,
    groups: taxonomyGroups.length,
    mechanics: dataset.mechanics.length,
    games: dataset.games.length,
    types: dataset.genres.length,
    recipes: dataset.recipes.length,
    instances: dataset.instances.length,
    sources: dataset.sources.length,
  });
  const keys = new Set();
  for (const row of catalog.entities) {
    const key = `${row.kind}:${row.id}`;
    assert.equal(keys.has(key), false, key);
    keys.add(key);
    assert.ok(files.has(row.jsonUrl.slice(SITE_URL.length + 1)), row.jsonUrl);
    assert.ok(
      files.has(row.markdownUrl.slice(SITE_URL.length + 1)),
      row.markdownUrl,
    );
    assert.ok(
      publicContentPaths().some(
        (path) =>
          `${SITE_URL}${path === "/" ? "/" : path + "/"}` === row.canonicalUrl,
      ),
    );
  }
});

test("instances retain their exact status, conditions, scope and source provenance", () => {
  const full = parse("data/v1/knowledge.json");
  // JSON omits optional properties whose value is undefined.
  const asJson = (value) => JSON.parse(JSON.stringify(value));
  assert.deepEqual(full.instances, asJson(dataset.instances));
  assert.deepEqual(full.scopes, asJson(dataset.scopes));
  assert.deepEqual(full.sources, asJson(dataset.sources));
  for (const row of dataset.mechanics) {
    const exported = parse(`data/v1/mechanics/${row.id}.json`);
    assert.deepEqual(
      exported.instances,
      asJson(dataset.instances.filter((instance) => instance.mechanicId === row.id)),
    );
    for (const instance of exported.instances) {
      assert.ok(exported.scopes.some((scope) => scope.id === instance.scopeId));
      for (const sourceId of instance.sourceIds)
        assert.ok(exported.sources.some((source) => source.id === sourceId));
      if (instance.status === "conditional") assert.ok(instance.condition);
    }
  }
});

test("exports exclude demand fixtures and preserve the public data boundary", () => {
  const full = parse("data/v1/knowledge.json");
  assert.equal("searchDemand" in full, false);
  assert.equal("searchEvents" in full, false);
  for (const [path, data] of files) {
    assert.equal(path.includes("fixtures"), false);
    assert.equal(/(?:D:|C:)\\/i.test(data), false, path);
  }
  assert.ok(files.get("llms.txt").length < 3000);
  assert.match(files.get("for-agents/index.md"), /JSON/);
});

test("mechanic illustrations retain their three captions and labels as editorial rules diagrams", () => {
  const full = parse("data/v1/knowledge.json");
  for (const mechanic of dataset.mechanics) {
    const scene = mechanicScenes[mechanic.id];
    const { illustration } = parse(`data/v1/mechanics/${mechanic.id}.json`);
    assert.ok(scene, mechanic.id);
    assert.equal(illustration.label, "图解（规则示意）");
    assert.equal(illustration.epistemicStatus, "editorial_illustration");
    assert.equal(illustration.comicLabel, "三格漫画（模型生成）");
    assert.equal(illustration.diagramKind, scene.kind);
    assert.deepEqual(illustration.frames, scene.frames);
    assert.deepEqual(illustration.objects, scene.objects);
    assert.equal(illustration.frames.length, 3);
    assert.equal(illustration.objects.length, 3);
    assert.equal(
      illustration.images.comic,
      `${SITE_URL}/art/comics/${mechanic.id}.webp`,
    );
    assert.equal(
      illustration.images.icon,
      `${SITE_URL}/art/mechanics/${mechanic.id}.webp`,
    );
    assert.equal(illustration.images.guide, `${SITE_URL}/art/chibi-guide.webp`);
    assert.deepEqual(full.mechanicIllustrations[mechanic.id], illustration);
    const markdown = files.get(`mechanics/${mechanic.id}/index.md`);
    assert.match(markdown, /## 图解（规则示意）/);
    for (const caption of scene.frames) assert.ok(markdown.includes(caption));
    for (const label of scene.objects) assert.ok(markdown.includes(label));
    assert.match(markdown, /不是游戏截图或游戏事实证据/);
  }
});
