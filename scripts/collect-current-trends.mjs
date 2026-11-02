import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const hash = (body) => createHash("sha256").update(body).digest("hex");
export function parseTrendingPage(html, region) {
  const script = [
    ...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g),
  ].find(
    (match) => match[1].includes("key: 'ds:0'") && match[1].includes("data:"),
  )?.[1];
  const raw = script?.match(/data:([\s\S]*), sideChannel:/)?.[1];
  if (!raw) throw new Error("Google Trending Now 页面格式已变，未更新快照。");
  const payload = JSON.parse(raw);
  if (!Array.isArray(payload?.[1])) throw new Error("Google 趋势列表缺失。");
  for (const row of payload[1]) {
    if (
      !Array.isArray(row) ||
      typeof row[0] !== "string" ||
      row[2] !== region ||
      !Array.isArray(row[10]) ||
      !Array.isArray(row[9]) ||
      !Number.isSafeInteger(row[6]) ||
      row[6] < 0 ||
      !Number.isFinite(row[3]?.[0]) ||
      !Number.isFinite(row[8]) ||
      row[8] < 0
    )
      throw new Error("Google 趋势字段异常，停止更新。");
  }
  return payload[1].filter((row) => row[10].includes(6));
}
const timestamp = (value) =>
  value === null ? null : new Date(value[0] * 1000).toISOString();
const normalize = (text) => text.normalize("NFKC").toLowerCase();
function reviewedGame(query, matches) {
  const text = normalize(query);
  return matches.find((game) =>
    game.terms.some((term) => {
      const key = normalize(term),
        at = text.indexOf(key);
      if (at < 0) return false;
      return (
        !/^[a-z0-9 ]+$/.test(key) ||
        (!/[a-z0-9]/.test(text[at - 1] ?? "") &&
          !/[a-z0-9]/.test(text[at + key.length] ?? ""))
      );
    }),
  );
}

export async function collectCurrentTrends() {
  const matches = JSON.parse(
    await readFile(resolve(root, "src/data/trend-game-matches.json"), "utf8"),
  );
  const evidenceDir = resolve(root, "public/data/search-demand");
  const privateDir = resolve(root, ".build/search-demand");
  await mkdir(evidenceDir, { recursive: true });
  await mkdir(privateDir, { recursive: true });
  const collectedAt = new Date().toISOString();
  const hours = 168;
  const markets = [];
  const evidence = [];
  for (const [region, name] of [
    ["TW", "中国台湾"],
    ["HK", "中国香港"],
    ["JP", "日本"],
    ["US", "美国"],
  ]) {
    const sourceUrl = `https://trends.google.com/trending?geo=${region}&category=6&hours=${hours}`;
    const response = await fetch(sourceUrl, {
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok)
      throw new Error(
        `${region} Google Trends HTTP ${response.status}，保留原快照。`,
      );
    const html = await response.text();
    const rawRows = parseTrendingPage(html, region).filter((row) =>
      reviewedGame(row[0], matches),
    );
    const excerpt = JSON.stringify(rawRows, null, 2) + "\n";
    const evidencePath = `/data/search-demand/trending-${region}-source.json`;
    const entries = rawRows.map((row, index) => {
      const game = reviewedGame(row[0], matches);
      return {
        id: `${region}-${row[3][0]}-${index}`,
        query: row[0],
        volumeLowerBound: row[6],
        growthPercent: row[8],
        startedAt: timestamp(row[3]),
        endedAt: timestamp(row[4]),
        relatedQueries: row[9],
        categoryIds: row[10],
        ...(game
          ? {
              gameName: game.name,
              gameSourceUrl: game.sourceUrl,
              ...(game.gameId ? { gameId: game.gameId } : {}),
            }
          : {}),
      };
    });
    if (
      entries.some(
        (row) =>
          row.startedAt > new Date().toISOString() ||
          (row.endedAt && row.endedAt > new Date().toISOString()),
      )
    )
      throw new Error("趋势时间晚于采集时间，请检查来源。");
    markets.push({
      region,
      name,
      collectedAt: new Date().toISOString(),
      sourceUrl,
      rawSha256: hash(html),
      excerptSha256: hash(excerpt),
      evidencePath,
      entries,
    });
    evidence.push({ region, html, excerpt });
  }
  const snapshot = {
    schemaVersion: 1,
    provider: "google_trending_now",
    metric: "bucketed_trending_search_volume",
    collectedAt,
    windowHours: hours,
    categoryId: 6,
    categoryName: "Games",
    methodologyUrl: "https://support.google.com/trends/answer/3076011?hl=en",
    markets,
  };
  const serialized = JSON.stringify(snapshot, null, 2) + "\n";
  for (const item of evidence) {
    await writeFile(
      resolve(privateDir, `trending-${item.region}.html`),
      item.html,
    );
    await writeFile(
      resolve(evidenceDir, `trending-${item.region}-source.json`),
      item.excerpt,
    );
  }
  await writeFile(resolve(root, "src/data/current-trends.json"), serialized);
  await writeFile(resolve(evidenceDir, "current-trends.json"), serialized);
  console.log(
    JSON.stringify(
      {
        collectedAt,
        markets: markets.map((m) => ({
          region: m.region,
          officialGamesQueries: m.entries.length,
          reviewedVideoGameQueries: m.entries.filter((e) => e.gameName).length,
        })),
      },
      null,
      2,
    ),
  );
  return snapshot;
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await collectCurrentTrends();
