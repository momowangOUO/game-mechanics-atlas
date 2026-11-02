/** Only actual containment, never similarity or a shared theme. */
export const genreParents: Record<string, string[]> = {
  "action-rpg": ["rpg", "action"],
  "turn-based-rpg": ["rpg"],
  "precision-platformer": ["platformer"],
  platformer: ["action"],
  fighting: ["action"],
  "tactical-shooter": ["shooter"],
  "extraction-shooter": ["shooter"],
  "shoot-em-up": ["shooter"],
  "real-time-strategy": ["strategy"],
  "four-x": ["strategy"],
  "tactical-turn-based": ["strategy"],
  "tower-defense": ["strategy"],
  "city-builder": ["simulation-management"],
  "colony-simulation": ["simulation-management"],
  "factory-automation": ["simulation-management"],
  "farming-life-sim": ["simulation-management"],
  "logic-puzzle": ["puzzle"],
  "language-puzzle": ["puzzle"],
  "match-three": ["puzzle"],
  "investigation-adventure": ["adventure"],
};
export function expandGenreIds(ids: readonly string[]): string[] {
  const result = new Set<string>();
  function visit(id: string, path: Set<string>) {
    if (path.has(id)) throw new Error(`Cyclic genre relation: ${id}`);
    if (result.has(id)) return;
    result.add(id);
    const next = new Set(path).add(id);
    for (const parent of genreParents[id] ?? []) visit(parent, next);
  }
  for (const id of ids) visit(id, new Set());
  return [...result];
}
