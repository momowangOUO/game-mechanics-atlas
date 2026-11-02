import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) =>
  JSON.parse(fs.readFileSync(path.join(root, "docs/research", name), "utf8"));
const evidence = read("game-evidence.json"),
  dossier = read("mechanic-dossiers.json"),
  mix = read("genre-recipes.json"),
  relationships = read("mechanic-relationships.json");
const errors = [];
const check = (ok, message) => {
  if (!ok) errors.push(message);
};
const ids = (rows) => new Set(rows.map((row) => row.id));
for (const [name, rows] of Object.entries({
  sources: evidence.sources,
  games: evidence.games,
  scopes: evidence.scopes,
  instances: evidence.instances,
  mechanics: dossier.mechanisms,
  genres: mix.compositeTypes,
  recipes: mix.recipes,
  relationships,
}))
  check(ids(rows).size === rows.length, `${name}: duplicate IDs`);
const sourceIds = ids(evidence.sources),
  gameIds = ids(evidence.games),
  mechanicIds = ids(dossier.mechanisms),
  scopeIds = ids(evidence.scopes);
const positive = evidence.instances.filter((i) =>
  ["present", "conditional"].includes(i.status),
);
const scopesByGame = new Map(
  evidence.games.map((g) => [
    g.id,
    new Set(evidence.scopes.filter((s) => s.gameId === g.id).map((s) => s.id)),
  ]),
);
for (const g of evidence.games) {
  check(
    g.coreLoop.length >= 3 && g.coreLoop.length <= 6,
    `${g.id}: expected 3–6 loop steps`,
  );
  check(
    Array.isArray(g.resourceNotes) && Array.isArray(g.progressionNotes),
    `${g.id}: missing economy/progression notes`,
  );
  check(
    g.learning.length > 0 && Array.isArray(g.caveats),
    `${g.id}: missing learning/caveat notes`,
  );
  check(
    positive.filter((i) => scopesByGame.get(g.id).has(i.scopeId)).length >= 6,
    `${g.id}: fewer than 6 supported observations`,
  );
  for (const id of g.sourceIds)
    check(sourceIds.has(id), `${g.id}: missing source ${id}`);
}
const assertions = new Set();
for (const i of evidence.instances) {
  check(mechanicIds.has(i.mechanicId), `${i.id}: missing mechanic`);
  check(scopeIds.has(i.scopeId), `${i.id}: missing scope`);
  for (const id of i.sourceIds)
    check(sourceIds.has(id), `${i.id}: missing source`);
  if (i.status === "conditional")
    check(Boolean(i.condition?.trim()), `${i.id}: missing condition`);
  const key = `${i.scopeId}/${i.mechanicId}`;
  check(!assertions.has(key), `${i.id}: duplicate assertion`);
  assertions.add(key);
}
for (const m of dossier.mechanisms)
  for (const id of m.evidenceRefs)
    check(gameIds.has(id), `${m.id}: missing game evidence`);
const urlCount = new Set(evidence.sources.map((s) => s.url)).size;
check(evidence.games.length === 82, "expected 82 games");
check(dossier.mechanisms.length >= 120, "expected at least 120 mechanics");
check(mix.compositeTypes.length === 32, "expected 32 genres");
check(mix.recipes.length === 32, "expected 32 recipes");
check(relationships.length >= 120, "expected at least 120 relationships");
check(
  positive.length >= 600,
  "expected at least 600 positive/conditional observations",
);
check(urlCount >= 120, "expected at least 120 distinct source URLs");
check(
  urlCount === evidence.sources.length,
  "source URLs must be canonical and unique",
);
const verification = read("source-verification.json");
const checked = new Set(verification.sources.map((s) => s.sourceId));
const report = {
  games: evidence.games.length,
  mechanics: dossier.mechanisms.length,
  dimensions: new Set(dossier.mechanisms.map((m) => m.dimension)).size,
  genres: mix.compositeTypes.length,
  recipes: mix.recipes.length,
  relationships: relationships.length,
  instances: evidence.instances.length,
  supportedInstances: positive.length,
  sources: evidence.sources.length,
  uniqueSourceURLs: urlCount,
  currentReadSourceIds: checked.size,
  minimumSupportedInstancesPerGame: Math.min(
    ...evidence.games.map(
      (g) =>
        positive.filter((i) => scopesByGame.get(g.id).has(i.scopeId)).length,
    ),
  ),
  errors,
};
console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exitCode = 1;
