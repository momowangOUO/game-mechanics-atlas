import {
  createKnowledgeBase,
  dataset,
  getGame,
  getInstances,
  getMechanic,
  type KnowledgeDataset,
} from "./knowledge";
import type { Mechanic, MechanicInstance } from "./model";

export type GameMechanicEntry = {
  mechanic: Mechanic;
  records: MechanicInstance[];
};
export function gameMechanicOverview(
  gameId: string,
  requestedScope = "",
  data: KnowledgeDataset = dataset,
) {
  const knowledge =
    data === dataset
      ? { getGame, getInstances, getMechanic }
      : createKnowledgeBase(data);
  const game = knowledge.getGame(gameId);
  const gameScopes = data.scopes.filter((scope) => scope.gameId === gameId);
  const allScopes = !requestedScope || requestedScope === "all";
  const scopeId = allScopes
    ? "all"
    : gameScopes.some((scope) => scope.id === requestedScope)
      ? requestedScope
      : (game?.defaultScopeId ?? "");
  const records = game
    ? knowledge.getInstances(gameId, scopeId === "all" ? undefined : scopeId)
    : [];
  const positiveIds = new Set(
    records
      .filter((row) => row.status === "present" || row.status === "conditional")
      .map((row) => row.mechanicId),
  );
  const entries: GameMechanicEntry[] = data.mechanics
    .filter((mechanic) => positiveIds.has(mechanic.id))
    .map((mechanic) => ({
      mechanic,
      records: records.filter((row) => row.mechanicId === mechanic.id),
    }));
  const resolvedScopes = (
    scopeId === "all"
      ? gameScopes
      : gameScopes.filter((scope) => scope.id === scopeId)
  ).map(
    (scope) =>
      new Set(
        knowledge
          .getInstances(gameId, scope.id)
          .filter(
            (row) => row.status === "present" || row.status === "conditional",
          )
          .map((row) => row.mechanicId),
      ),
  );
  return {
    scopeId,
    entries,
    interactionIds: entries
      .filter((entry) => entry.mechanic.dimension === "interaction")
      .map((entry) => entry.mechanic.id),
    dimensionIds: data.dimensions
      .filter((dimension) =>
        entries.some((entry) => entry.mechanic.dimension === dimension.id),
      )
      .map((dimension) => dimension.id),
    relationshipIds: data.relationships
      .filter(
        (relation) =>
          positiveIds.has(relation.from) &&
          positiveIds.has(relation.to) &&
          resolvedScopes.some(
            (ids) => ids.has(relation.from) && ids.has(relation.to),
          ),
      )
      .map((relation) => relation.id),
  };
}
