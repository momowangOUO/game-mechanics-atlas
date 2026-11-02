export type DiscoverySource = {
  publisher: string;
  url: string;
  period: string;
  metric: string;
};
export type DiscoveryEntry = {
  id: string;
  name: string;
  gameId?: string;
  observation: string;
  source: DiscoverySource;
  scopeNote?: string;
};

const twitch: DiscoverySource = {
  publisher: "Twitch《State of Gaming 2026》",
  url: "https://blog.twitch.tv/en/2026/09/09/twitch-state-of-gaming-2026/",
  period: "2026 年 1 月 1 日至 9 月 1 日",
  metric: "Twitch 观看时长；地区榜或文中举例另行注明",
};
const hatchet: DiscoverySource = {
  publisher: "Hatchet《Top Games on Live Streaming for 2025》",
  url: "https://hatchet.gg/blog/top-games-on-live-streaming-for-2025/",
  period: "2025 年；新发行作品按上线后首 30 天",
  metric: "直播观看时长；新发行、平台作品和重制版按原文分组",
};
const entry = (id: string, name: string, gameId: string | undefined, observation: string, source: DiscoverySource, scopeNote?: string): DiscoveryEntry => ({ id, name, gameId, observation, source, scopeNote });

// The report names a category or example; a link to a case does not assert that
// every viewing hour belonged to that case's exact edition or game mode.
export const streamDiscovery: DiscoveryEntry[] = [
  entry("lol", "League of Legends", "league-of-legends", "2026 年 Twitch 全球观看时长前五。", twitch),
  entry("gta-v", "Grand Theft Auto V", "grand-theft-auto-5", "2026 年 Twitch 全球观看时长前五。", twitch),
  entry("counter-strike", "Counter-Strike", "counter-strike-2", "2026 年 Twitch 全球观看时长前五。", twitch, "报告使用系列分类名；关联案例为 Counter-Strike 2，不能将分类全部观看量归给该版本。"),
  entry("valorant", "VALORANT", "valorant", "2026 年 Twitch 全球观看时长前五。", twitch),
  entry("wow", "World of Warcraft", "world-of-warcraft", "2026 年 Twitch 全球观看时长前五。", twitch),
  entry("fortnite", "Fortnite", "fortnite", "2026 年美国、英国等地区 Twitch 观看时长前三。", twitch),
  entry("apex", "Apex Legends", "apex-legends", "2026 年台湾及香港地区 Twitch 观看时长前三。", twitch),
  entry("overwatch", "Overwatch", "overwatch-2", "2026 年澳大利亚及新西兰地区 Twitch 观看时长前三。", twitch, "报告使用 Overwatch 分类名；关联案例为 Overwatch 2，分类数据不直接等于该版本数据。"),
  entry("tibia", "Tibia", undefined, "2026 年巴西地区 Twitch 观看时长前三。", twitch),
  entry("dbd", "Dead by Daylight", "dead-by-daylight", "Twitch 在恐怖游戏观察中列举的作品。", twitch),
  entry("phasmophobia", "Phasmophobia", "phasmophobia", "Twitch 在恐怖游戏观察中列举的作品。", twitch),
  entry("silent-hill-f", "Silent Hill f", undefined, "Twitch 在恐怖游戏观察中列举的作品。", twitch),
  entry("arc", "ARC Raiders", "arc-raiders", "2025 年新发行作品中首 30 天观看时长居首，约 1.29 亿小时。", hatchet),
  entry("tarkov", "Escape from Tarkov", "escape-from-tarkov", "Hatchet 将其列入 2025 年发行作品首 30 天观看时长比较。", hatchet, "此处沿用报告的正式发行统计口径，不代表游戏此前没有可玩版本。"),
  entry("wilds", "Monster Hunter Wilds", "monster-hunter-wilds", "2025 年发行作品首 30 天观看时长约 7400 万小时。", hatchet),
  entry("ea-fc-26", "EA Sports FC 26", undefined, "2025 年发行作品首 30 天观看时长约 6200 万小时。", hatchet),
  entry("battlefield-6", "Battlefield 6", undefined, "Hatchet 列入 2025 年新发行作品观看时长前十。", hatchet),
  entry("black-ops-7", "Call of Duty: Black Ops 7", undefined, "Hatchet 列入 2025 年新发行作品观看时长前十。", hatchet),
  entry("kingdom-come", "Kingdom Come: Deliverance II", "kingdom-come-deliverance-2", "Hatchet 列入 2025 年新发行作品观看时长前十。", hatchet),
  entry("mario-kart", "Mario Kart World", undefined, "2025 年发行作品首 30 天观看时长约 3400 万小时。", hatchet),
  entry("expedition-33", "Clair Obscur: Expedition 33", "clair-obscur-expedition-33", "Hatchet 列入 2025 年新发行作品观看时长前百。", hatchet),
  entry("repo", "R.E.P.O.", "repo", "Hatchet 列入 2025 年新发行作品观看时长前百。", hatchet),
  entry("minecraft", "Minecraft", "minecraft", "Hatchet 将其列为 2025 年直播观看时长前十作品。", hatchet),
  entry("dota", "Dota 2", "dota-2", "Hatchet 将其列为 2025 年直播观看时长前十作品。", hatchet),
  entry("mlbb", "Mobile Legends: Bang Bang", "mobile-legends-bang-bang", "Hatchet 将其列为 2025 年直播观看时长前十作品。", hatchet),
  entry("free-fire", "Garena Free Fire", "garena-free-fire", "Hatchet 将其列为 2025 年直播观看时长前十作品。", hatchet),
  entry("roblox", "Roblox", undefined, "2025 年直播观看时长排名第九；平台内有不同创作者的作品。", hatchet),
  entry("grow-a-garden", "Grow a Garden", undefined, "Hatchet 提及其在 2025 年带动 Roblox 平台的病毒传播。", hatchet, "Roblox 平台内作品；平台总观看量不能视为单作观看量。"),
  entry("steal-a-brainrot", "Steal a Brainrot", undefined, "Hatchet 提及其在 2025 年获得持续观看。", hatchet, "Roblox 平台内作品；平台总观看量不能视为单作观看量。"),
  entry("rust", "Rust", "rust", "Twitch 列举主播 TheBurntPeanut 的直播作品之一。", twitch, "这是主播个例，不是单作全球排名。"),
  entry("tcg-shop", "TCG Card Shop Simulator", undefined, "Twitch 列举主播 Rubius 直播最多的分类之一。", twitch, "这是主播个例，不是单作全球排名。"),
  entry("marvel-rivals", "Marvel Rivals", "marvel-rivals", "Twitch 列举主播 Rubius 直播最多的分类之一。", twitch, "这是主播个例，不是单作全球排名。"),
  entry("pokopia", "Pokopia", undefined, "Twitch 在动物与伙伴主题观察中列举的作品。", twitch),
  entry("slime-rancher", "Slime Rancher", undefined, "Twitch 在动物与伙伴主题观察中列举的作品。", twitch),
  entry("temtem", "Temtem", undefined, "Twitch 在动物与伙伴主题观察中列举的作品。", twitch),
  entry("spire-2", "Slay the Spire 2", "slay-the-spire-2", "Twitch 在独立游戏观察中列举的作品。", twitch),
  entry("big-walk", "Big Walk", undefined, "Twitch 在独立游戏观察中列举的作品。", twitch),
  entry("meccha", "Meccha Chameleon", undefined, "Twitch 在独立游戏观察中列举的作品。", twitch),
];

export function resolveDiscovery<T extends { id: string }>(entries: DiscoveryEntry[], games: T[]) {
  const gameById = new Map(games.map((game) => [game.id, game]));
  return entries.map((entry) => ({ entry, game: entry.gameId ? gameById.get(entry.gameId) : undefined }));
}

