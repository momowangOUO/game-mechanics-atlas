"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { games, genres } from "@/lib/knowledge";
import { playStyles, platformLabels } from "@/data/play-styles";
import {
  getCoverageCell,
  catalogCoverageSummary,
} from "@/lib/catalog-coverage";
import { Assistant, GameCard, PageHead } from "./Primitives";
import styles from "./CatalogCoverage.module.css";
const statusLabels = {
  has_examples: "已有案例",
  unreviewed: "待补查",
  researched_no_examples: "检索后未找到案例",
  not_applicable: "按当前定义不适用",
  filtered_empty: "筛选后没有案例",
};
export default function CatalogCoverage() {
  const params = useSearchParams();
  const [genre, setGenre] = useState(
    genres.some((row) => row.id === params.get("genre"))
      ? params.get("genre")!
      : genres[0].id,
  );
  const [play, setPlay] = useState(
    playStyles.some((row) => row.id === params.get("play"))
      ? params.get("play")!
      : "",
  );
  const [platform, setPlatform] = useState("");
  const [era, setEra] = useState("");
  const [primaryOnly, setPrimaryOnly] = useState(false);
  const summary = catalogCoverageSummary();
  const filters = { platform, era, primaryOnly };
  const selectedType = genres.find((row) => row.id === genre)!;
  const selectedStyle = playStyles.find((row) => row.id === play);
  const cell = selectedStyle
    ? getCoverageCell(genre, play, filters)
    : undefined;
  function choose(type: string, direction: string) {
    setGenre(type);
    setPlay(direction);
    const url = new URL(window.location.href);
    url.searchParams.set("genre", type);
    url.searchParams.set("play", direction);
    window.history.replaceState(null, "", url);
    requestAnimationFrame(() =>
      document
        .getElementById("coverage-results")
        ?.scrollIntoView({ block: "start", behavior: "instant" }),
    );
  }
  return (
    <>
      <PageHead
        eyebrow="CASE COVERAGE / 类型与玩法"
        title="类型 × 核心玩法"
        description="选择一个类型和玩法方向，查找具体游戏。数字表示本站收录数量。"
      />
      <div className={styles.stats}>
        <span>{summary.games} 款游戏</span>
        <span>{summary.mobile} 款手机发行</span>
        <span>{summary.mobileOrigin} 款手机原生／先发</span>
        <span>{summary.classics} 款经典作品</span>
      </div>
      <div className={styles.controls}>
        <label>
          传统类型
          <select
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value);
              setPlay("");
            }}
          >
            {genres.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}（
                {summary.byGenre.find((item) => item.id === row.id)?.count}）
              </option>
            ))}
          </select>
        </label>
        <label>
          发行平台
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="">全部已核实平台</option>
            {Object.entries(platformLabels).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label>
          原作年代
          <select value={era} onChange={(e) => setEra(e.target.value)}>
            <option value="">全部年代</option>
            <option value="classic">2010 年及以前</option>
            <option value="recent">2020 年及以后</option>
          </select>
        </label>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={primaryOnly}
            onChange={(e) => setPrimaryOnly(e.target.checked)}
          />
          只看主要玩法
        </label>
      </div>
      <p className={styles.note}>
        一个游戏可以有多个主要玩法。组合只统计同一研究范围内成立的类型与玩法，重要辅助玩法也可一同查看。
      </p>
      <div
        className={styles.desktop}
        role="region"
        aria-label="类型与玩法覆盖矩阵"
        tabIndex={0}
      >
        <table className={styles.matrix}>
          <caption>点击数字或状态查看案例与核对记录</caption>
          <thead>
            <tr>
              <th scope="col">传统类型</th>
              {playStyles.map((style) => (
                <th scope="col" key={style.id}>
                  <Link href={`/play-styles/${style.id}`}>{style.name}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {genres.map((type) => (
              <tr key={type.id}>
                <th scope="row">
                  <Link href={`/types/${type.id}`}>{type.name}</Link>
                </th>
                {playStyles.map((style) => {
                  const current = getCoverageCell(type.id, style.id, filters);
                  return (
                    <td key={style.id} data-status={current.status}>
                      <button
                        onClick={() => choose(type.id, style.id)}
                        aria-label={`${type.name} × ${style.name}：${current.matches.length} 款，${statusLabels[current.status]}`}
                      >
                        {current.matches.length || "—"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section
        className={styles.phone}
        aria-label={`${selectedType.name}的玩法方向`}
      >
        <h2>{selectedType.name}</h2>
        {playStyles.map((style) => {
          const current = getCoverageCell(genre, style.id, filters);
          return (
            <button key={style.id} onClick={() => choose(genre, style.id)}>
              <span>
                <strong>{style.name}</strong>
                <small>{style.definition}</small>
              </span>
              <b>
                {current.matches.length
                  ? `${current.matches.length} 款`
                  : statusLabels[current.status]}{" "}
                ↓
              </b>
            </button>
          );
        })}
      </section>
      <section
        id="coverage-results"
        className={styles.results}
        aria-live="polite"
      >
        {selectedStyle && cell ? (
          <>
            <h2>
              {selectedType.name} × {selectedStyle.name}
            </h2>
            <p>{selectedStyle.definition}</p>
            <p className={styles.status}>
              {cell.matches.length} 款 · {statusLabels[cell.status]}
            </p>
            {cell.matches.length ? (
              <div className="case-grid continuous-cases">
                {cell.matches.map((match) => (
                  <article key={match.game.id}>
                    <GameCard game={match.game} scopeId={match.scopeId} />
                    <p className={styles.scope}>
                      {match.role === "primary" ? "主要玩法" : "重要辅助玩法"} ·{" "}
                      {match.scopeLabel}
                    </p>
                    <Link
                      href={`/games/${match.game.id}?scope=${encodeURIComponent(match.scopeId)}`}
                    >
                      查看这个范围的机制记录 →
                    </Link>
                  </article>
                ))}
              </div>
            ) : (
              <>
                {cell.status === "researched_no_examples" && (
                  <Assistant
                    message="主人，这个组合我还没找到例子呢……说不定藏着一片蓝海哟，要试试看吗？"
                    state="think"
                  />
                )}
                <p>
                  {cell.status === "unreviewed"
                    ? "这一格还需要补查，暂时不能判断有哪些作品。"
                    : cell.status === "filtered_empty"
                      ? "当前筛选范围内没有匹配案例。可以调整平台、年代或玩法范围。"
                      : cell.review?.note}
                </p>
                {cell.review && (
                  <div className={styles.review}>
                    <h3>核对记录</h3>
                    <p>
                      {cell.review.checkedAt} · {cell.review.scope}
                    </p>
                    <ul>
                      {cell.review.queries.map((query) => (
                        <li key={query}>{query}</li>
                      ))}
                    </ul>
                    {cell.review.sourceUrls.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer">
                        参考资料 ↗{" "}
                      </a>
                    ))}
                    <p>
                      尚未找到案例不等于市场没有竞品；此处不提供搜索需求或蓝海评分。
                    </p>
                  </div>
                )}
              </>
            )}
            <Link href={`/games?genre=${genre}&play=${play}`}>
              在游戏目录中查看这个组合 →
            </Link>
          </>
        ) : (
          <p>
            点击矩阵中的格子，或在手机上选择一个玩法方向，即可查看组合案例。
          </p>
        )}
      </section>
      <section className={styles.gaps}>
        <h2>案例覆盖</h2>
        <p>
          每类以十款不同游戏为收录目标。以下显示当前数量，资料不足的分类继续补查。
        </p>
        <div>
          {summary.byGenre
            .filter((row) => row.count < 10)
            .map((row) => (
              <Link href={`/types/${row.id}`} key={row.id}>
                {row.name} <b>{row.count}／10</b>
              </Link>
            ))}
        </div>
        <p>
          {summary.coveredCells} 个组合已有案例，{summary.reviewedEmpty}{" "}
          个空缺已记录核对结果，{summary.pendingCells} 个组合仍待补查。
        </p>
        <Link href="/games">全部游戏案例 →</Link> ·{" "}
        <Link href="/play-styles">核心玩法方向 →</Link>
      </section>
    </>
  );
}
