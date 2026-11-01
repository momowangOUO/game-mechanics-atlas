"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  analyzeSearchInterest,
  annualSearchSnapshot,
  currentSearchAttempt,
  validateSearchInterest,
  type SearchInterestSnapshot,
} from "@/lib/search-demand";
import { heatTopics } from "@/lib/heat";
import { publicAssetPath } from "@/lib/paths";
import { PageHead, Window } from "./Primitives";
import { TrendChart, topicDestination } from "./HeatCharts";

export function AnnualSearchRanking({
  compact = false,
}: {
  compact?: boolean;
}) {
  const data = annualSearchSnapshot;
  return (
    <Window title="GOOGLE YEAR IN SEARCH / 真实搜索资料">
      <div className="selected-topic-heading">
        <span className="seed">Google 官方资料 · 2025 · 全球</span>
        <h2>2025 年搜索飙升游戏</h2>
        <p>
          Google 发布的游戏相关飙升搜索名次。统计 {data.dateStart} 至{" "}
          {data.dateEnd}，比较上年同期的搜索增长。
        </p>
      </div>
      <table
        className="ranking heat-ranking-table"
        aria-label="2025全球游戏飙升搜索官方榜单"
      >
        <thead>
          <tr>
            <th scope="col">名次</th>
            <th scope="col">官方搜索词</th>
          </tr>
        </thead>
        <tbody>
          {data.entries.slice(0, compact ? 5 : 10).map((entry) => (
            <tr key={entry.rank}>
              <td>{String(entry.rank).padStart(2, "0")}</td>
              <td>
                <a
                  className="ranking-name"
                  href={`${data.sourceUrl}#lifestyle--gaming`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {entry.query} ↗
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="scope-box">
        这是历史飙升搜索榜：名次反映当年增长，不能读成搜索总量，也不说明 2026
        年的当前热度。Google 没有在该榜单公布搜索次数、增长百分比或类型需求量。
      </p>
      <p className="filter-note">
        <a href={data.sourceUrl} target="_blank" rel="noreferrer">
          官方榜单 ↗
        </a>{" "}
        ·{" "}
        <a href={data.methodologyUrl} target="_blank" rel="noreferrer">
          统计方法 ↗
        </a>
        {!compact && (
          <>
            {" "}
            ·{" "}
            <a href={publicAssetPath(data.evidencePath)}>
              保存的榜单原文片段
            </a>{" "}
            ·{" "}
            <a
              href={publicAssetPath("/data/search-demand/snapshot.json")}
              download
            >
              采集记录 JSON
            </a>
          </>
        )}
        <br />
        采集于 {data.collectedAt.replace("T", " ").slice(0, 19)} UTC
      </p>
    </Window>
  );
}

export default function RealSearchDemand({
  initialTopic = "",
  onOpenCounts,
}: {
  initialTopic?: string;
  onOpenCounts: () => void;
}) {
  const [interest, setInterest] = useState<SearchInterestSnapshot | null>(null);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [selectedQuery, setSelectedQuery] = useState("");
  const analyzed = useMemo(
    () => (interest ? analyzeSearchInterest(interest) : null),
    [interest],
  );
  const selected =
    analyzed?.profiles.find((profile) => profile.query === selectedQuery) ||
    analyzed?.profiles[0];
  const topic = heatTopics.find((item) => item.id === initialTopic);
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">研究室</Link> / 搜索观察
      </div>
      <PageHead
        eyebrow="SEARCH EVIDENCE / 来源与时间范围"
        title="玩家在搜什么？"
        description="查看有来源的搜索资料，分清年度飙升名次、相对搜索指数和实际搜索次数。"
      >
        <span className="seed">真实来源 · 历史快照</span>
      </PageHead>
      <div className="data-strip">
        <div className="metric">
          <span>OFFICIAL SEARCH SNAPSHOT</span>
          <strong>{annualSearchSnapshot.entries.length}</strong>
          <span>Google 2025 全球游戏飙升名次</span>
        </div>
        <div className="metric">
          <span>GENRE SEARCH INTEREST</span>
          <strong>未取得</strong>
          <span>当前类型相对指数 · HTTP {currentSearchAttempt.httpStatus}</span>
        </div>
        <div className="metric">
          <span>SEARCH COUNTS</span>
          <strong>未取得</strong>
          <span>不从名次、指数或在线人数换算</span>
        </div>
        <div className="metric">
          <span>MECHANIC DEMAND</span>
          <strong>未采集</strong>
          <span>游戏名称搜索不直接归因到机制</span>
        </div>
      </div>
      {topic && (
        <p className="scope-box">
          正在研究「{topic.name}
          」。年度榜单没有这个主题的直接搜索数据，暂时无法比较。
          <Link href={topicDestination(topic.id)}>继续查看主题资料 →</Link>
        </p>
      )}
      <div className="heat-ranking-layout">
        <section>
          <AnnualSearchRanking />
        </section>
        <aside className="heat-inspector">
          <Window title="COLLECTION STATUS / 当前类型数据">
            <div className="selected-topic-heading">
              <h2>类型与机制需求待采集</h2>
              <p>
                本次采集尝试在同一次 Google Trends
                请求中比较五组类型搜索词，时间和地区保持一致。
              </p>
            </div>
            <p className="scope-box">
              {currentSearchAttempt.reason}
              <br />
              没有取得的值显示为“未取得”，不填零，也不生成热门类型、蓝海或红海排名。
            </p>
            <p className="filter-note">
              搜索词：{currentSearchAttempt.terms.join(" / ")}
              <br />
              地区：全球 · 网页搜索 · 全部类别
              <br />
              区间：{currentSearchAttempt.dateStart} —{" "}
              {currentSearchAttempt.dateEnd}
              <br />
              尝试时间：
              {currentSearchAttempt.collectedAt
                .replace("T", " ")
                .slice(0, 19)}{" "}
              UTC
            </p>
            <div className="modal-actions">
              <a
                className="button"
                href={currentSearchAttempt.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                查看同组 Google Trends ↗
              </a>
              <a
                className="button"
                href={publicAssetPath(currentSearchAttempt.evidencePath)}
              >
                查看原始响应
              </a>
            </div>
            <p className="filter-note">
              <a
                href={currentSearchAttempt.apiAccessUrl}
                target="_blank"
                rel="noreferrer"
              >
                官方 API 仍需申请 Alpha 访问权限 ↗
              </a>
            </p>
          </Window>
        </aside>
      </div>
      <details className="method-details">
        <summary>导入有来源的同组 Google Trends 指数</summary>
        <div className="paper">
          <h2>同一请求中的相对搜索指数</h2>
          <p>
            请保留搜索词、来源链接、采集时间、原始文件
            SHA-256、日期、地区与每日指数。只比较同组完整日期；独立请求的 0–100
            不能直接拼成排行榜。导入通过只说明格式一致，不证明文件来自 Google。
          </p>
          <label className="field-label" htmlFor="interest-json">
            相对指数 JSON
          </label>
          <textarea
            id="interest-json"
            aria-label="相对指数JSON"
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            rows={6}
            spellCheck={false}
          />
          <input
            type="file"
            accept="application/json,.json"
            aria-label="选择相对指数JSON文件"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (file.size > 5 * 1024 * 1024) {
                setImportError("文件超过 5 MB，请缩小文件后重新选择。");
                return;
              }
              setImportText(await file.text());
              setImportError("");
            }}
          />
          <div className="modal-actions">
            <button
              className="button primary"
              onClick={() => {
                try {
                  const parsed = validateSearchInterest(JSON.parse(importText));
                  if (!parsed.success) {
                    setImportError(
                      parsed.error.issues
                        .map(
                          (issue) =>
                            `${issue.path.join(".") || "导入文件"}：${issue.code === "custom" ? issue.message : "字段格式或取值不正确，请按格式说明检查内容与统计范围。"}`,
                        )
                        .join("；"),
                    );
                    return;
                  }
                  setInterest(parsed.data);
                  setSelectedQuery("");
                  setImportError("");
                } catch {
                  setImportError(
                    "JSON 格式有误，尚未替换原记录。请检查引号、逗号和括号。",
                  );
                }
              }}
            >
              校验并查看指数
            </button>
            {interest && (
              <button className="button" onClick={() => setInterest(null)}>
                移除本地指数
              </button>
            )}
          </div>
          {importError && (
            <p role="alert" className="scope-box">
              {importError}
            </p>
          )}
          <p className="filter-note">
            文件只在当前浏览器中分析，刷新后清除。请保留原始文件，确认搜索词、日期和地区一致后再导入。
          </p>
          <details>
            <summary>查看 JSON 必需字段</summary>
            <p className="filter-note">
              元信息：schemaVersion 固定为 1，provider 为 google_trends，metric
              为 relative_search_interest，granularity 为 day，searchProperty 为
              web。还需
              comparisonGroupId（比较组标识）、sourceUrl（原始比较链接）、collectedAt（UTC
              采集时间）、rawSha256（原始文件摘要）、region（地区，全球用
              GLOBAL）、dateStart 与 dateEnd（起止日期）、category（分类编号）和
              terms（按原始顺序保存的搜索词数组）。
            </p>
            <p className="filter-note">
              rows 数组中的每行填写 date、values 和 partial。values 是按 terms
              顺序排列的 0–100 指数，缺失用 null；partial
              表示该日是否尚未统计完整。不同请求应分别导入，每次替换一组。
            </p>
          </details>
        </div>
      </details>
      {interest && analyzed && (
        <Window title="LOCAL IMPORT / 相对指数 · 来源待核验">
          <p className="scope-box">
            比较组 {interest.comparisonGroupId} · {interest.region} ·{" "}
            {interest.dateStart} — {interest.dateEnd}。指数为 0
            可能表示搜索量过低；不能解释为无人搜索。相对指数不计算搜索总次数和蓝海、红海分。
          </p>
          <p className="filter-note">
            <a href={interest.sourceUrl} target="_blank" rel="noreferrer">
              导入记录声明的来源 ↗
            </a>{" "}
            · 采集时间 {interest.collectedAt}
          </p>
          <div className="type-chips">
            {analyzed.profiles.map((profile) => (
              <button
                className="chip"
                key={profile.query}
                onClick={() => setSelectedQuery(profile.query)}
              >
                {profile.query} ·{" "}
                {profile.meanInterest === null
                  ? "覆盖不完整"
                  : profile.meanInterest.toFixed(1)}
              </button>
            ))}
          </div>
          {selected && (
            <TrendChart
              name={selected.query}
              unit="指数"
              points={selected.points.map((point) => ({
                ...point,
                value: point.value ?? 0,
              }))}
            />
          )}
          <p className="filter-note">
            {analyzed.complete
              ? "上列数值是同组完整区间的平均搜索兴趣指数，量纲为 0–100。"
              : "有缺失日期、空值或未完整统计的日期，暂不排序或计算均值。"}
          </p>
        </Window>
      )}
      <p className="catalog-note">
        需要分析自己的站内搜索记录时，可使用独立的次数分析工具。站内记录反映该站访问者，不能直接代表全市场。
      </p>
      <button className="button" onClick={onOpenCounts}>
        分析自己的搜索次数 →
      </button>
    </>
  );
}
