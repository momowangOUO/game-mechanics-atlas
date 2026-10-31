import type { Scope } from "./model";

export function listGameScopes(
  scopes: readonly Scope[],
  gameId: string,
  defaultId: string,
): Scope[] {
  return scopes
    .filter((scope) => scope.gameId === gameId)
    .sort(
      (a, b) =>
        Number(b.id === defaultId) - Number(a.id === defaultId) ||
        a.kind.localeCompare(b.kind) ||
        a.label.localeCompare(b.label, "zh-CN"),
    );
}

/** Variable-height dimension bands prevent a large category crossing into the next. */
export function dimensionGrid(
  ids: readonly string[],
  dimensionIds: readonly string[],
  dimensionOf: (id: string) => string,
) {
  const result = new Map<string, { x: number; y: number }>();
  let top = 0;
  for (let band = 0; band < dimensionIds.length; band += 3) {
    let bandHeight = 120;
    dimensionIds.slice(band, band + 3).forEach((dimension, column) => {
      const group = ids.filter((id) => dimensionOf(id) === dimension);
      group.forEach((id, index) =>
        result.set(id, {
          x: column * 660 + (index % 3) * 210,
          y: top + Math.floor(index / 3) * 125,
        }),
      );
      bandHeight = Math.max(bandHeight, Math.ceil(group.length / 3) * 125);
    });
    top += bandHeight + 100;
  }
  return result;
}

export function neighborhoodGrid(ids: readonly string[], focus: string) {
  const ordered = ids.includes(focus)
    ? [focus, ...ids.filter((id) => id !== focus)]
    : [...ids];
  return new Map(
    ordered.map((id, index) => [
      id,
      { x: (index % 3) * 230, y: Math.floor(index / 3) * 130 },
    ]),
  );
}
