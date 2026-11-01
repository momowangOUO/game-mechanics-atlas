import "./register-typescript.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";

const { createAgentDocuments } = await import("./export-agent-data.mjs");
const { publicContentPaths, SITE_URL } = await import("../src/lib/seo.ts");
const { dataset } = await import("../src/lib/knowledge.ts");
const { mechanicScenes } = await import("../src/data/mechanic-scenes.ts");
const files = createAgentDocuments();
const parse = (name) => JSON.parse(files.get(name));

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
    dimensions: 9,
    groups: 50,
    mechanics: 122,
    games: 80,
    types: 32,
    recipes: 32,
    instances: 705,
    sources: 149,
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
  assert.deepEqual(full.instances, dataset.instances);
  assert.deepEqual(full.scopes, dataset.scopes);
  assert.deepEqual(full.sources, dataset.sources);
  for (const row of dataset.mechanics) {
    const exported = parse(`data/v1/mechanics/${row.id}.json`);
    assert.deepEqual(
      exported.instances,
      dataset.instances.filter((instance) => instance.mechanicId === row.id),
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
