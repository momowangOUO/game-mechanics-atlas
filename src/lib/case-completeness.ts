export function minimumSupportedMechanics(game: { referenceOnly?: boolean }): number {
  return game.referenceOnly ? 2 : 6;
}
