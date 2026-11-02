"use client";
import Link from "next/link";
import { useState } from "react";
import {
  currentTrends,
  snapshotDate,
  videoGameTrends,
  volumeBucket,
} from "@/lib/current-trends";
import { publicAssetPath } from "@/lib/paths";
import styles from "./CurrentSearchTrends.module.css";

export default function CurrentSearchTrends() {
  const [region, setRegion] = useState("TW");
  const [query, setQuery] = useState("");
  const market = currentTrends.markets.find((item) => item.region === region)!;
  const entries = videoGameTrends(region, query);
  return (
    <section className={styles.section} aria-label="近期游戏搜索趋势">
      <header className={styles.heading}>
        <div>
          <span className="eyebrow">GOOGLE TRENDING NOW / 近期搜索</span>
          <h2>近期游戏搜索趋势</h2>
          <p>
            截至 {snapshotDate}{" "}
            的近七天快照。先看玩家最近搜过哪些游戏，再对照词条背后的更新、攻略或赛事。
          </p>
        </div>
        <span className={styles.stamp}>
          {snapshotDate}
          <small>已核对来源</small>
        </span>
      </header>
      <div className={styles.tools}>
        <label>
          地区
          <select
            aria-label="近期趋势地区"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            {currentTrends.markets.map((item) => (
              <option key={item.region} value={item.region}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.search}>
          查找词条
          <input
            type="search"
            aria-label="搜索近期游戏、类别与词条"
            placeholder="游戏名、MOBA、原始搜索词…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <p className={styles.note}>
        搜索量是 Google
        公布的档位下限，例如“2万+”，并非精确次数。相近词条可能重叠，地区之间分别查看，不相加。
      </p>
      <div className={styles.entries}>
        {entries.map((entry) => (
          <article key={entry.id} className={styles.entry}>
            <div className={styles.query}>
              <strong>{entry.query}</strong>
              <span>{"gameName" in entry ? entry.gameName : ""}</span>
            </div>
            <div className={styles.volume}>
              <strong>{volumeBucket(entry.volumeLowerBound)}</strong>
              <span>搜索量档位</span>
            </div>
            <div className={styles.status}>
              <span>{entry.endedAt ? "已回落" : "仍在走热"}</span>
              <small>
                较通常水平 +{entry.growthPercent}%
                {entry.growthPercent === 1000 ? "（显示上限）" : ""}
              </small>
            </div>
            <details>
              <summary>相关搜索与时间</summary>
              <p>{entry.relatedQueries.join(" / ")}</p>
              <p>
                开始走热：{entry.startedAt.replace("T", " ").slice(0, 16)} UTC
                {entry.endedAt && (
                  <>
                    {" "}
                    · 回落于 {entry.endedAt.replace("T", " ").slice(0, 16)} UTC
                  </>
                )}
              </p>
            </details>
            <div className={styles.links}>
              {"gameId" in entry && entry.gameId && (
                <Link href={`/games/${entry.gameId}`}>游戏范例 →</Link>
              )}
              {"gameSourceUrl" in entry && (
                <a href={entry.gameSourceUrl} target="_blank" rel="noreferrer">
                  游戏官网 ↗
                </a>
              )}
            </div>
          </article>
        ))}
        {!entries.length && (
          <div className={styles.empty}>
            <h3>这份快照里没有匹配的电子游戏词条</h3>
            <p>
              短期走热词条不覆盖所有游戏；没上榜不代表没人搜索。也可以到分类库继续查资料。
            </p>
            <Link
              className="button"
              href={`/taxonomy?q=${encodeURIComponent(query)}`}
            >
              查分类与游戏 →
            </Link>
            <button className="button" onClick={() => setQuery("")}>
              清除关键词
            </button>
          </div>
        )}
      </div>
      <footer className={styles.footer}>
        <p>
          采集时间：{market.collectedAt.replace("T", " ").slice(0, 19)}{" "}
          UTC。当前显示 {entries.length}{" "}
          个已核对的电子游戏词条。游戏名与类别的关联用于找资料，不用于计算类别热度。
        </p>
        <div>
          <a href={market.sourceUrl} target="_blank" rel="noreferrer">
            Google 原始趋势 ↗
          </a>
          <a
            href={currentTrends.methodologyUrl}
            target="_blank"
            rel="noreferrer"
          >
            统计说明 ↗
          </a>
          <a href={publicAssetPath("/data/search-demand/current-trends.json")}>
            下载快照 JSON
          </a>
        </div>
        <p>只收录已核对的电子游戏词条，排除纯赌博和传统棋牌。</p>
        <a href={publicAssetPath(market.evidencePath)}>
          查看保留原始数值的来源片段 →
        </a>
      </footer>
    </section>
  );
}
