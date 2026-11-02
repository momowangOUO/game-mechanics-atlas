import { dimensions, games, genres, mechanics, recipes } from "./knowledge";
import {
  taxonomyDimensions,
  taxonomyGroups,
  mechanicExamples,
} from "../data/taxonomy-reference";
import { matchesCatalog, normalizeSearch } from "./catalog-search";
import { playStyles } from "../data/play-styles";

export type CatalogResult = {
  id: string;
  name: string;
  kind: "dimension" | "group" | "mechanic" | "genre" | "game" | "recipe" | "playStyle";
  path: string;
  description: string;
  extra: string;
  aliases?: readonly string[];
  href: string;
};

const genreAliases: Record<string, string[]> = {
  "traditional-roguelike": ["传统肉鸽", "传统肉鴿"],
  roguelite: ["肉鸽", "肉鴿", "轻度Rogue"],
  "auto-battler": ["自走棋", "自动战斗", "自動戰鬥", "auto chess"],
  deckbuilder: ["卡牌构筑", "卡組構築", "deck building", "deck builder"],
  "extraction-shooter": ["搜打撤", "撤離射擊", "extraction shooter"],
  "incremental-idle": ["挂机", "掛機", "放置游戏", "idle game", "clicker"],
  rpg: ["角色扮演游戏", "角色扮演遊戲"],
  "action-rpg": ["ARPG", "动作RPG", "動作角色扮演"],
  "real-time-strategy": ["RTS", "即時戰略"],
  "tactical-turn-based": ["回合制战术", "回合制戰術"],
  "rhythm-game": ["音游", "音遊", "音乐游戏", "rhythm game"],
  soulslike: ["类魂", "類魂", "souls like"],
};
const gameText = (id: string) => {
  const game = games.find((game) => game.id === id);
  return [game?.name, ...(game?.aliases ?? [])].join(" ");
};
const entries: CatalogResult[] = [
  ...playStyles.map(style=>({id:style.id,name:style.name,kind:"playStyle" as const,path:"核心玩法方向",description:style.definition,extra:games.filter(game=>game.playStyleIds?.includes(style.id)).map(game=>game.name).join(" "),href:`/play-styles/${style.id}`})),
  ...taxonomyDimensions.map((info) => {
    const d = dimensions.find((d) => d.id === info.dimensionId)!;
    return {
      id: d.id,
      name: d.name,
      kind: "dimension" as const,
      path: "一级 · 分类维度",
      description: info.explanation,
      extra: `${info.question} ${info.use} ${info.boundary} ${d.description}`,
      href: `/taxonomy?dimension=${d.id}`,
    };
  }),
  ...taxonomyGroups.map((group) => ({
    id: group.id,
    name: group.name,
    kind: "group" as const,
    path: `二级 · ${dimensions.find((d) => d.id === group.dimensionId)!.name}`,
    description: group.explanation,
    extra: `${group.function} ${group.boundary} ${group.examples.map((e) => gameText(e.gameId)).join(" ")}`,
    href: `/taxonomy?group=${group.id}`,
  })),
  ...mechanics.map((m) => {
    const path = `三级 · ${dimensions.find((d) => d.id === m.dimension)!.name} / ${taxonomyGroups.find((g) => g.mechanicIds.includes(m.id))?.name ?? ""}`;
    return {
      ...m,
      kind: "mechanic" as const,
      path,
      description: m.definition,
      extra: [
        path,
        ...m.designValue,
        ...m.inclusionRules,
        ...m.exclusionRules,
        ...m.corePlayTags,
        ...(mechanicExamples[m.id] ?? []).map(
          (e) => `${gameText(e.gameId)} ${e.observation}`,
        ),
      ].join(" "),
      href: `/mechanics/${m.id}`,
    };
  }),
  ...genres.map((g) => ({
    id: g.id,
    name: g.name,
    kind: "genre" as const,
    path: "复合类型 · 独立于机制层级",
    description: g.definition,
    aliases: genreAliases[g.id],
    extra: g.boundaries.join(" "),
    href: `/types/${g.id}`,
  })),
  ...games.map((g) => ({
    ...g,
    kind: "game" as const,
    path: "游戏范例",
    description: g.summary,
    extra: g.summary,
    href: `/games/${g.id}`,
  })),
  ...recipes.map((r) => ({
    id: r.id,
    name: r.name,
    kind: "recipe" as const,
    path: "组合配方 · 研究提示词",
    description: r.synergies[0] || "选择配方中的机制，编写研究提示词。",
    extra: r.synergies.join(" "),
    href: `/lab?recipe=${r.id}`,
  })),
];

export function searchCatalog(query: string): CatalogResult[] {
  const normalized = normalizeSearch(query);
  if (!normalized) return [];
  const score = (entry: CatalogResult) => {
    const names = [entry.name, entry.id, ...(entry.aliases ?? [])].map(
      normalizeSearch,
    );
    if (names.includes(normalized)) return 1000;
    if (names.some((name) => name.startsWith(normalized))) return 700;
    if (names.some((name) => name.includes(normalized))) return 500;
    return (
      100 +
      normalized
        .split(" ")
        .filter((word) => names.some((name) => name.includes(word))).length *
        50
    );
  };
  return entries
    .filter((entry) =>
      matchesCatalog(
        entry,
        query,
        `${entry.path} ${entry.description} ${entry.extra}`,
      ),
    )
    .sort((a, b) => score(b) - score(a));
}
