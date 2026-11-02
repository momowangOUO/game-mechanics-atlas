import rawSnapshot from "../data/current-trends.json";
import { games, genres } from "./knowledge";
import { matchesCatalog } from "./catalog-search";

export const currentTrends = rawSnapshot;
export type CurrentTrend =
  (typeof rawSnapshot.markets)[number]["entries"][number];
export const videoGameTrends = (region: string, query = "") => {
  const market = currentTrends.markets.find(
    (market) => market.region === region,
  );
  return (market?.entries ?? [])
    .filter((entry) => {
      if (!("gameName" in entry) || !entry.gameName) return false;
      const game =
        "gameId" in entry
          ? games.find((game) => game.id === entry.gameId)
          : undefined;
      const categories = genres.filter((genre) =>
        game?.genreIds.includes(genre.id),
      );
      return matchesCatalog(
        {
          id: entry.id,
          name: entry.query,
          aliases: [entry.gameName, ...(game?.aliases ?? [])],
        },
        query,
        `${entry.relatedQueries.join(" ")} ${categories.map((g) => `${g.id} ${g.name}`).join(" ")}`,
      );
    })
    .sort((a, b) => b.volumeLowerBound - a.volumeLowerBound);
};
export function volumeBucket(value: number) {
  return `${new Intl.NumberFormat("zh-CN", { notation: "compact", maximumFractionDigits: 1 }).format(value)}+`;
}
export const snapshotDate = currentTrends.collectedAt.slice(0, 10);
