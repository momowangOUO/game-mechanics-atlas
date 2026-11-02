import { games, genres, scopes } from "./knowledge";
import type { Game } from "./model";
import { playStyles } from "../data/play-styles";
import { expandGenreIds } from "../data/genre-relations";
import { matchesReleaseEra } from "./release-era";
import reviewData from "../../docs/research/coverage-reviews.json";
export type CoverageReview = {
  genreId: string;
  playStyleId: string;
  status: "researched_no_examples" | "not_applicable";
  checkedAt: string;
  scope: string;
  queries: string[];
  sourceUrls: string[];
  note: string;
};
export const coverageReviews = reviewData as CoverageReview[];
export type CoverageFilters = {
  platform?: string;
  era?: string;
  primaryOnly?: boolean;
};
export type CoverageMatch = {
  game: Game;
  scopeId: string;
  scopeLabel: string;
  role: "primary" | "supporting";
};
function inFilter(game: Game, filters: CoverageFilters) {
  if (filters.platform && !game.platforms?.includes(filters.platform))
    return false;
  return matchesReleaseEra(game, filters.era);
}
function relatedScopes(
  gameId: string,
  a: string,
  b: string,
): string | undefined {
  if (
    !scopes.some((scope) => scope.id === a && scope.gameId === gameId) ||
    !scopes.some((scope) => scope.id === b && scope.gameId === gameId)
  )
    return undefined;
  if (a === b) return a;
  function ancestor(child: string, parent: string) {
    const seen = new Set<string>();
    let current = scopes.find(
      (scope) => scope.id === child && scope.gameId === gameId,
    );
    while (current && !seen.has(current.id)) {
      if (current.id === parent) return true;
      seen.add(current.id);
      current = scopes.find(
        (scope) =>
          scope.id === current!.parentScopeId && scope.gameId === gameId,
      );
    }
    return false;
  }
  return ancestor(a, b) ? a : ancestor(b, a) ? b : undefined;
}
const matchIndex = new Map<string, Map<string, CoverageMatch>>();
for (const game of games)
  for (const play of game.playStyleAssignments ?? [])
    for (const type of game.genreAssignments ?? []) {
      const matchingScope = relatedScopes(game.id, play.scopeId, type.scopeId);
      if (!matchingScope) continue;
      for (const genreId of expandGenreIds([type.genreId])) {
        const key = `${genreId}/${play.playStyleId}`;
        const matches = matchIndex.get(key) ?? new Map<string, CoverageMatch>();
        const previous = matches.get(game.id);
        if (
          !previous ||
          (previous.role === "supporting" && play.role === "primary")
        )
          matches.set(game.id, {
            game,
            scopeId: matchingScope,
            scopeLabel:
              scopes.find((scope) => scope.id === matchingScope)?.label ??
              game.scopeNotes,
            role: play.role,
          });
        matchIndex.set(key, matches);
      }
    }
export function getCoverageMatches(
  genreId: string,
  playStyleId: string,
  filters: CoverageFilters = {},
): CoverageMatch[] {
  return [
    ...(matchIndex.get(`${genreId}/${playStyleId}`)?.values() ?? []),
  ].filter(
    (match) =>
      inFilter(match.game, filters) &&
      (!filters.primaryOnly || match.role === "primary"),
  );
}
export function getCoverageCell(
  genreId: string,
  playStyleId: string,
  filters: CoverageFilters = {},
) {
  const matches = getCoverageMatches(genreId, playStyleId, filters);
  const review = coverageReviews.find(
    (row) => row.genreId === genreId && row.playStyleId === playStyleId,
  );
  const filtered = Boolean(
    filters.platform || filters.era || filters.primaryOnly,
  );
  return {
    genreId,
    playStyleId,
    matches,
    review,
    status: matches.length
      ? ("has_examples" as const)
      : filtered
        ? ("filtered_empty" as const)
        : (review?.status ?? ("unreviewed" as const)),
  };
}
let cachedSummary: ReturnType<typeof calculateSummary> | undefined;
function calculateSummary() {
  const byGenre = genres.map((genre) => ({
    id: genre.id,
    name: genre.name,
    count: games.filter((game) => game.genreIds.includes(genre.id)).length,
  }));
  const byPlayStyle = playStyles.map((style) => ({
    id: style.id,
    name: style.name,
    count: games.filter((game) => game.playStyleIds?.includes(style.id)).length,
  }));
  const cells = genres.flatMap((genre) =>
    playStyles.map((style) => getCoverageCell(genre.id, style.id)),
  );
  return {
    games: games.length,
    detailedCases: games.filter(game => !game.referenceOnly).length,
    referenceCases: games.filter(game => game.referenceOnly).length,
    mobile: games.filter((game) =>
      game.platforms?.some(
        (platform) => platform === "ios" || platform === "android",
      ),
    ).length,
    mobileOrigin: games.filter((game) => game.mobileOrigin).length,
    classics: games.filter(
      (game) => (game.originalReleaseYear ?? game.year) <= 2010,
    ).length,
    byGenre,
    byPlayStyle,
    totalCells: cells.length,
    coveredCells: cells.filter((cell) => cell.matches.length).length,
    reviewedEmpty: cells.filter(
      (cell) =>
        cell.status === "researched_no_examples" ||
        cell.status === "not_applicable",
    ).length,
    pendingCells: cells.filter((cell) => cell.status === "unreviewed").length,
  };
}
export function catalogCoverageSummary() {
  return (cachedSummary ??= calculateSummary());
}
