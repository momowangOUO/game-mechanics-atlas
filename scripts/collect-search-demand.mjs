import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const hash = (text) => createHash("sha256").update(text).digest("hex");
const decode = (text) =>
  text
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCodePoint(parseInt(n, 16)),
    )
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));

export function parseAnnualGames(html) {
  const section = html.match(
    /<ol\b[^>]*aria-label="Trend list for Games"[^>]*>([\s\S]*?)<\/ol>/,
  );
  if (!section)
    throw new Error("官方页面没有 Games 榜单；停止更新，不生成替代数字。");
  const rawItems = [
    ...section[1].matchAll(
      /<li\b[^>]*aria-label="(\d+) of 10\. ([^"]+)"[^>]*>/g,
    ),
  ];
  const entries = rawItems.map((match) => ({
    rank: Number(match[1]),
    query: decode(match[2]),
  }));
  if (
    entries.length !== 10 ||
    entries.some((entry, index) => entry.rank !== index + 1)
  )
    throw new Error("官方榜单条目数或名次异常。");
  return {
    entries,
    excerpt: `<ol aria-label="Trend list for Games">\n${rawItems.map((match) => match[0] + "</li>").join("\n")}\n</ol>\n`,
  };
}

export async function collect() {
  const collectedAt = new Date().toISOString();
  const dateEnd = collectedAt.slice(0, 10);
  const start = new Date(`${dateEnd}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - 90);
  const dateStart = start.toISOString().slice(0, 10);
  const evidenceDir = resolve(root, "public/data/search-demand");
  const privateDir = resolve(root, ".build/search-demand");
  await mkdir(evidenceDir, { recursive: true });
  await mkdir(privateDir, { recursive: true });
  const sourceUrl = "https://trends.withgoogle.com/year-in-search/2025/";
  const methodologyUrl =
    "https://trends.withgoogle.com/year-in-search/data-methodology/";
  const [response, methodologyResponse] = await Promise.all([
    fetch(sourceUrl, { signal: AbortSignal.timeout(25000) }),
    fetch(methodologyUrl, { signal: AbortSignal.timeout(25000) }),
  ]);
  if (!response.ok || !methodologyResponse.ok)
    throw new Error(
      `官方年度页面请求失败：${response.status}/${methodologyResponse.status}`,
    );
  const [html, methodology] = await Promise.all([
    response.text(),
    methodologyResponse.text(),
  ]);
  if (
    !methodology.includes("November 25, 2025") ||
    !methodology.includes("January 1, 2025")
  )
    throw new Error("官方年度方法说明发生变化，请重新核验日期。");
  const { entries, excerpt } = parseAnnualGames(html);
  await writeFile(resolve(privateDir, "year-in-search-2025.html"), html);
  await writeFile(
    resolve(privateDir, "year-in-search-methodology.html"),
    methodology,
  );
  await writeFile(resolve(evidenceDir, "annual-games-source.txt"), excerpt);
  const annual = {
    schemaVersion: 1,
    provider: "google_year_in_search",
    status: "available",
    metric: "trending_search_rank",
    year: 2025,
    region: "GLOBAL",
    category: "Games",
    dateStart: "2025-01-01",
    dateEnd: "2025-11-25",
    comparisonStart: "2024-01-01",
    comparisonEnd: "2024-11-25",
    collectedAt,
    sourceUrl,
    methodologyUrl,
    rawSha256: hash(html),
    methodologySha256: hash(methodology),
    excerptSha256: hash(excerpt),
    evidencePath: "/data/search-demand/annual-games-source.txt",
    entries,
  };
  const terms = [
    "roguelike",
    "deck-building game",
    "auto battler",
    "idle game",
    "extraction shooter",
  ];
  const request = {
    comparisonItem: terms.map((keyword) => ({
      keyword,
      geo: "",
      time: `${dateStart} ${dateEnd}`,
    })),
    category: 0,
    property: "",
  };
  const url =
    "https://trends.google.com/trends/api/explore?hl=en-US&tz=0&req=" +
    encodeURIComponent(JSON.stringify(request));
  let status = null,
    body = "",
    error = "";
  try {
    const result = await fetch(url, { signal: AbortSignal.timeout(20000) });
    status = result.status;
    body = await result.text();
    // No implicit conversion of a successful exploration response to search counts.
    error = result.ok
      ? "explore 返回成功；尚未获取并核验完整时间序列，本次不发布指数。"
      : `Google Trends explore 返回 HTTP ${status}，未获取搜索指数。`;
  } catch (reason) {
    error = reason instanceof Error ? reason.message : String(reason);
  }
  await writeFile(
    resolve(evidenceDir, "genre-request-response.txt"),
    body || error,
  );
  const current = {
    schemaVersion: 1,
    provider: "google_trends",
    status: "unavailable",
    metric: "relative_search_interest",
    collectedAt: new Date().toISOString(),
    region: "GLOBAL",
    dateStart,
    dateEnd,
    terms,
    requestUrl: url,
    request,
    httpStatus: status,
    reason: error,
    rawSha256: hash(body || error),
    evidencePath: "/data/search-demand/genre-request-response.txt",
    sourceUrl:
      `https://trends.google.com/trends/explore?date=${dateStart}%20${dateEnd}&q=` +
      terms.map(encodeURIComponent).join(","),
    apiAccessUrl: "https://developers.google.com/search/apis/trends",
  };
  await writeFile(
    resolve(root, "src/data/search-demand.json"),
    JSON.stringify({ annual, current }, null, 2) + "\n",
  );
  await writeFile(
    resolve(evidenceDir, "snapshot.json"),
    JSON.stringify({ annual, current }, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({
      annualEntries: entries.length,
      annualStatus: response.status,
      currentStatus: status,
      collectedAt,
    }),
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  await collect();
