import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseAnnualGames } from "./collect-search-demand.mjs";

test("parses published Games evidence and refuses missing or truncated lists", async () => {
  const excerpt = await readFile(
    new URL(
      "../public/data/search-demand/annual-games-source.txt",
      import.meta.url,
    ),
    "utf8",
  );
  const result = parseAnnualGames(excerpt);
  assert.equal(result.entries.length, 10);
  assert.equal(result.entries[0].query, "Arc Raiders");
  assert.equal(result.entries[7].query, "Pokémon Legends: Z-A");
  assert.throws(() => parseAnnualGames("<html>Temporary error</html>"));
  assert.throws(() =>
    parseAnnualGames(excerpt.replace("10 of 10.", "11 of 10.")),
  );
  assert.throws(() =>
    parseAnnualGames(
      excerpt.replace(/<li[^>]+aria-label="5 of 10[^>]+>/, "<li>"),
    ),
  );
});
