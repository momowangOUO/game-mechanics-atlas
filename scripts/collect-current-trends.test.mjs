import { test } from "node:test";
import assert from "node:assert/strict";
import { parseTrendingPage } from "./collect-current-trends.mjs";

const row = (name, category, volume = 200) => [
  name,
  null,
  "TW",
  [1793577600],
  null,
  null,
  volume,
  null,
  50,
  [name],
  category,
];
const page = (rows) =>
  `<script>AF_initDataCallback({key: 'ds:0', hash: '2', data:${JSON.stringify([null, rows])}, sideChannel: {}});</script>`;
test("extracts official Games rows and preserves volume buckets rather than counts", () => {
  const rows = parseTrendingPage(
    page([row("example game", [6]), row("football", [17])]),
    "TW",
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0][6], 200);
});
test("rejects changed markup, invalid payload, wrong region and invalid metrics", () => {
  for (const html of [
    "<html>429</html>",
    page([row("bad", [6], -1)]),
    page([["bad"]]),
    page([row("wrong region", [6])]),
  ]) {
    assert.throws(() => parseTrendingPage(html, "US"));
  }
});
