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
require(summary.detailedCases >= 320, "fewer than 320 detailed cases");
require(summary.mobile >= 100, "fewer than 100 verified mobile releases");
require(summary.mobileOrigin >= 60, "fewer than 60 mobile-origin cases");
require(summary.classics >= 60, "fewer than 60 classics");
// Ten examples is a research target, not a reason to admit unsupported games.
const coverageTarget = 10;
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
  coverageTarget,
  genreGaps: summary.byGenre.filter((row) => row.count < coverageTarget),
  playDirectionGaps: summary.byPlayStyle.filter((row) => row.count < coverageTarget),
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
      detailedCases: summary.detailedCases,
      referenceCases: summary.referenceCases,
      mobile: summary.mobile,
      mobileOrigin: summary.mobileOrigin,
      classics: summary.classics,
      genres: summary.byGenre.length,
      playDirections: summary.byPlayStyle.length,
      coveredCells: summary.coveredCells,
      reviewedEmpty: summary.reviewedEmpty,
      pendingCells: summary.pendingCells,
      genreGaps: report.genreGaps,
      playDirectionGaps: report.playDirectionGaps,
      errors,
    },
    null,
    2,
  ),
);
if (errors.length) process.exitCode = 1;
