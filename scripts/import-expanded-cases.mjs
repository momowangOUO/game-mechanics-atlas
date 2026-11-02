import fs from "node:fs";
import path from "node:path";
const directory = "docs/research/expansion";
const existing = new Set(
  JSON.parse(
    fs.readFileSync("docs/research/game-evidence.json", "utf8"),
  ).games.map((game) => game.id),
);
const seen = new Map(),
  merged = [];
for (const file of fs
  .readdirSync(directory)
  .filter((file) => file.endsWith(".json"))
  .sort()) {
  const rows = JSON.parse(fs.readFileSync(path.join(directory, file), "utf8"));
  if (!Array.isArray(rows)) continue;
  for (const row of rows) {
    if (!row.id || !row.mechanics)
      throw new Error(`${file}: invalid authored game`);
    if (existing.has(row.id))
      throw new Error(`${file}: already registered ${row.id}`);
    if (seen.has(row.id))
      throw new Error(
        `${row.id}: duplicate in ${file} and ${seen.get(row.id)}`,
      );
    seen.set(row.id, file);
    merged.push(row);
  }
}
fs.writeFileSync(
  "docs/research/catalog-expansion.json",
  JSON.stringify(merged, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    newGames: merged.length,
    totalGames: merged.length + existing.size,
    batches: [...new Set(seen.values())],
  }),
);
