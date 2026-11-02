import "./register-typescript.mjs";
import fs from "node:fs";
const { dataset, validateKnowledge } = await import("../src/lib/knowledge.ts");
const { catalogCoverageSummary, coverageReviews } = await import(
  "../src/lib/catalog-coverage.ts"
);
const { playStyles } = await import("../src/data/play-styles.ts");
const summary = catalogCoverageSummary();
const { mechanicScenes } = await import("../src/data/mechanic-scenes.ts");
const errors = validateKnowledge();
const require = (condition, message) => {
  if (!condition) errors.push(message);
};
for (const mechanic of dataset.mechanics) {
  require(fs.existsSync(
    `public/art/mechanics/${mechanic.id}.webp`,
  ), `${mechanic.id}: missing icon`);
  require(fs.existsSync(
    `public/art/comics/${mechanic.id}.webp`,
  ), `${mechanic.id}: missing comic`);
  require(mechanicScenes[mechanic.id]?.frames.length ===
    3, `${mechanic.id}: missing three-panel captions`);
}
require(summary.games >= 320, "fewer than 320 complete cases");
require(summary.mobile >= 100, "fewer than 100 verified mobile releases");
require(summary.mobileOrigin >= 60, "fewer than 60 mobile-origin cases");
require(summary.classics >= 60, "fewer than 60 classics");
const exceptions = {
  "language-puzzle": {
    minimum: 4,
    reason:
      "已核实四款完整案例；Sethian、Epigraph等候选仍缺足够机制依据，未用于凑数。",
  },
};
for (const row of summary.byGenre)
  require(row.count >=
    (exceptions[row.id]?.minimum ??
      10), `${row.id}: ${row.count} games, target 10`);
for (const row of summary.byPlayStyle)
  require(row.count >=
    10, `${row.id}: ${row.count} play-direction cases, target 10`);
const sourceIds = new Set(dataset.sources.map((source) => source.id));
const styleIds = new Set(playStyles.map((style) => style.id));
const genreIds = new Set(dataset.genres.map((genre) => genre.id));
for (const game of dataset.games) {
  require(fs.existsSync(
    `public/art/games/${game.id}.webp`,
  ), `${game.id}: missing real game image`);
  for (const assignment of [
    ...(game.genreAssignments ?? []),
    ...(game.playStyleAssignments ?? []),
  ]) {
    require(dataset.scopes.some(
      (scope) => scope.id === assignment.scopeId && scope.gameId === game.id,
    ), `${game.id}: foreign classification scope`);
    require(assignment.sourceIds.length > 0 &&
      assignment.sourceIds.every((id) =>
        sourceIds.has(id),
      ), `${game.id}: unsupported classification`);
  }
  require((game.playStyleIds ?? []).length >
    0, `${game.id}: missing play direction`);
}
const reviewed = new Set();
for (const review of coverageReviews) {
  const key = `${review.genreId}/${review.playStyleId}`;
  require(!reviewed.has(key), `${key}: repeated review`);
  reviewed.add(key);
  require(genreIds.has(review.genreId) &&
    styleIds.has(review.playStyleId), `${key}: unknown review target`);
  require(review.queries.length > 0 &&
    review.sourceUrls.length > 0 &&
    Boolean(review.scope), `${key}: missing bounded research record`);
}
const report = {
  ...summary,
  genreExceptions: summary.byGenre
    .filter((row) => row.count < 10)
    .map((row) => ({ ...row, ...exceptions[row.id] })),
  errors,
};
fs.mkdirSync(".build", { recursive: true });
fs.writeFileSync(
  ".build/catalog-coverage-report.json",
  JSON.stringify(report, null, 2),
);
console.log(
  JSON.stringify(
    {
      games: summary.games,
      mobile: summary.mobile,
      mobileOrigin: summary.mobileOrigin,
      classics: summary.classics,
      genres: summary.byGenre.length,
      playDirections: summary.byPlayStyle.length,
      coveredCells: summary.coveredCells,
      reviewedEmpty: summary.reviewedEmpty,
      pendingCells: summary.pendingCells,
      exceptions: report.genreExceptions,
      errors,
    },
    null,
    2,
  ),
);
if (errors.length) process.exitCode = 1;
