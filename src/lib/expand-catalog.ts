import expansion from "../../docs/research/catalog-expansion.json";
import { playStyles, legacyPlayAliases } from "../data/play-styles";
import {
  originalPlayDirections,
  originalGenreAdditions,
  originalGenreCorrections,
} from "../data/catalog-overrides";
import { expandGenreIds } from "../data/genre-relations";
import {
  GameSchema,
  ScopeSchema,
  GameModeSchema,
  SourceSchema,
  MechanicInstanceSchema,
} from "./model";
import type { Game, Source, Scope, GameMode, MechanicInstance } from "./model";

export type AuthoredCase = {
  id: string;
  name: string;
  studio: string;
  year: number;
  platforms: string[];
  mobileOrigin?: boolean;
  referenceOnly?: boolean;
  coverageNote?: string;
  genreIds: string[];
  playStyleIds: string[];
  summary: string;
  analysis: string;
  loop: string[];
  learning: string[];
  caveats: string[];
  resources: string[];
  progression: string[];
  scopeLabel: string;
  scopeNotes: string;
  aliases?: string[];
  sources: {
    url: string;
    title: string;
    publisher: string;
    type: Source["type"];
    checkedAt: string;
    verificationNote: string;
  }[];
  mechanics: {
    id: string;
    note: string;
    source: number;
    status?: "present" | "conditional";
    condition?: string;
    evidenceKind: MechanicInstance["evidenceKind"];
  }[];
  cover?: { url: string; sourceUrl: string };
};
export const authoredExpansion = expansion as AuthoredCase[];
const styleById = new Map(
  playStyles.map((style) => [style.id as string, style]),
);
function classify(game: Game, ids: string[], directGenres: string[]): Game {
  const sourceIds = game.sourceIds;
  for (const id of ids)
    if (!styleById.has(id))
      throw new Error(`${game.id}: unregistered play direction ${id}`);
  const directionIds = [...new Set(ids)];
  return GameSchema.parse({
    ...game,
    originalReleaseYear: game.originalReleaseYear ?? game.year,
    playStyleIds: directionIds,
    corePlayTags: directionIds.map((id) => styleById.get(id)!.name),
    genreIds: expandGenreIds(directGenres),
    genreAssignments: directGenres.map((genreId) => ({
      genreId,
      scopeId: game.defaultScopeId,
      sourceIds,
      rationale: "根据该研究范围的主要规则归类；这是本站编辑判断。",
    })),
    playStyleAssignments: directionIds.map((playStyleId) => ({
      playStyleId,
      scopeId: game.defaultScopeId,
      role: "primary",
      sourceIds,
      rationale: "此玩法参与本范围的主要循环；具体规则见机制记录与来源。",
    })),
  });
}
export function expandCatalog(
  originalGames: Game[],
  originalSources: Source[],
) {
  const sources = [...originalSources],
    scopes: Scope[] = [],
    gameModes: GameMode[] = [],
    instances: MechanicInstance[] = [];
  const urlToSource = new Map(sources.map((source) => [source.url, source.id]));
  const games = originalGames.map((game) => {
    const cited = originalSources.filter((source) =>
      game.sourceIds.includes(source.id),
    );
    const platforms = new Set(game.platforms ?? []);
    if (
      cited.some(
        (source) =>
          source.url.includes("store.steampowered.com") ||
          /\bPC\b|Windows/.test(source.claimScope),
      )
    )
      platforms.add("pc");
    for (const [host, platform] of [
      ["play.google.com", "android"],
      ["apps.apple.com", "ios"],
      ["nintendo.com", "switch"],
      ["playstation.com", "playstation"],
      ["xbox.com", "xbox"],
    ])
      if (cited.some((source) => source.url.includes(host)))
        platforms.add(platform);
    game = { ...game, platforms: [...platforms] };
    const ids = originalPlayDirections[game.id] ?? [
      ...new Set(
        game.corePlayTags.flatMap((tag) => legacyPlayAliases[tag] ?? []),
      ),
    ];
    return classify(game, ids, [
      ...new Set([
        ...(originalGenreCorrections[game.id] ?? game.genreIds),
        ...(originalGenreAdditions[game.id] ?? []),
      ]),
    ]);
  });
  const gameIds = new Set(games.map((game) => game.id));
  for (const row of authoredExpansion) {
    if (gameIds.has(row.id))
      throw new Error(`Duplicate expanded game ${row.id}`);
    gameIds.add(row.id);
    const scopeId = `${row.id}:standard`;
    const sourceIds = row.sources.map((raw, index) => {
      const known = urlToSource.get(raw.url);
      if (known) return known;
      const id = `${row.id}-research-${index + 1}`;
      const source = SourceSchema.parse({
        ...raw,
        id,
        claimScope: row.scopeLabel + "；" + row.scopeNotes,
      });
      sources.push(source);
      urlToSource.set(raw.url, id);
      return id;
    });
    const game = GameSchema.parse({
      id: row.id,
      name: row.name,
      studio: row.studio,
      year: row.year,
      originalReleaseYear: row.year,
      yearBasis: "原作首次公开发行年份；抢先体验与移植差异见研究范围。",
      summary: row.summary,
      analysis: row.analysis,
      factNotes: [`开发：${row.studio}。`, `原作首发：${row.year} 年。`],
      scopeNotes: row.scopeNotes,
      coreLoop: row.loop,
      learning: row.learning,
      caveats: row.caveats,
      sourceIds: [...new Set(sourceIds)],
      defaultScopeId: scopeId,
      genreIds: row.genreIds,
      corePlayTags: [],
      platforms: row.platforms,
      mobileOrigin: row.mobileOrigin ?? false,
      referenceOnly: row.referenceOnly,
      coverageNote: row.coverageNote,
      resourceNotes: row.resources,
      progressionNotes: row.progression,
      metadataNote: row.scopeLabel,
      aliases: row.aliases,
    });
    games.push(classify(game, row.playStyleIds, row.genreIds));
    scopes.push(
      ScopeSchema.parse({
        id: `${row.id}:game`,
        gameId: row.id,
        kind: "game",
        label: row.name,
      }),
      ScopeSchema.parse({
        id: scopeId,
        gameId: row.id,
        kind: "mode",
        label: row.scopeLabel,
        parentScopeId: `${row.id}:game`,
        versionNote: row.scopeNotes,
      }),
    );
    gameModes.push(
      GameModeSchema.parse({
        id: `${row.id}-standard`,
        gameId: row.id,
        name: row.scopeLabel,
        description: row.scopeNotes,
        scopeId,
      }),
    );
    for (const observation of row.mechanics) {
      const sourceId = sourceIds[observation.source];
      if (!sourceId)
        throw new Error(`${row.id}/${observation.id}: invalid source index`);
      instances.push(
        MechanicInstanceSchema.parse({
          id: `${row.id}-${observation.id}`,
          mechanicId: observation.id,
          scopeId,
          status: observation.status ?? "present",
          condition: observation.condition,
          sourceIds: [sourceId],
          evidenceKind: observation.evidenceKind,
          rationale: observation.note,
          scopeNote: row.scopeLabel,
        }),
      );
    }
  }
  return { games, sources, scopes, gameModes, instances };
}
