import type { Game } from "./model";

export const releaseEras = [
  { id: "classic", label: "2010 年及以前", from: 1950, through: 2010 },
  { id: "2011-2019", label: "2011–2019 年", from: 2011, through: 2019 },
  { id: "recent", label: "2020 年及以后", from: 2020, through: 2100 },
] as const;

export function matchesReleaseEra(game: Pick<Game, "year" | "originalReleaseYear">, selected = "") {
  const era = releaseEras.find(row => row.id === selected);
  if (!era) return true;
  const year = game.originalReleaseYear ?? game.year;
  return year >= era.from && year <= era.through;
}
