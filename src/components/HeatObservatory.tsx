"use client";

import Link from "next/link";
import { MaidPortrait } from "./Art";
import { useMemo, useRef, useState } from "react";
import {
  analyzeHeat,
  FORMULA_VERSION,
  heatTopics,
  validateSearchImport,
  type HeatAnalysis,
  type TopicHeatProfile,
  type TopicKind,
} from "@/lib/heat";
import { games, getGame, getMechanic } from "@/lib/knowledge";
import { Dialog, useUI } from "./Providers";
import { useSearchData } from "./SearchDataProvider";
import { CountUp, EmptyState, PageHead, SeedBadge, Window } from "./Primitives";
import RealSearchDemand from "./RealSearchDemand";
import { rinDialogue } from "@/data/rin-dialogue";
import {
  formatAmount,
  ScatterChart,
  topicDestination,
  TrendChart,
  trendLabel,
} from "./HeatCharts";

type RankingView = TopicKind | "blue" | "red";
const kindLabels: Record<TopicKind, string> = {
  genre: "游戏类别",
  mechanic: "原子机制",
  combination: "机制组合",
  game: "具体游戏",
};
const sourceLabels: Record<string, string> = {
  synthetic: "合成示例",
  site_log: "站内日志（由导入提供）",
  import: "外部导入（真实性待核验）",
};

function TopicDetails({
  profile,
  result,
}: {
  profile: TopicHeatProfile;
  result: HeatAnalysis;
}) {
  const topic = heatTopics.find((t) => t.id === profile.topicId)!;
  const measured = profile.measurementStatus !== "missing";
  return (
    <>
      <div className="selected-topic-heading">
        <span className="eyebrow">
          SELECTED TOPIC / {kindLabels[profile.kind]}
        </span>
        <h2>{profile.name}</h2>
        <p>{topic.description}</p>
      </div>
      <div className="topic-numbers">
        <div>
          <small>归因搜索次数</small>
          <strong>{measured ? formatAmount(profile.demand) : "未记录"}</strong>
        </div>
        <div>
          <small>相关游戏样本</small>
          <strong>
            {profile.supply}
            <span> 款</span>
          </strong>
        </div>
        <div>
          <small>蓝海分（暂停）</small>
          <strong className="cyan">
            {profile.blue === null ? "—" : profile.blue.toFixed(1)}
          </strong>
        </div>
        <div>
          <small>红海分（暂停）</small>
          <strong className="gold">
            {profile.red === null ? "—" : profile.red.toFixed(1)}
          </strong>
        </div>
      </div>
      <p className="filter-note">
        有搜索记录的日期：{profile.measuredDays} / {profile.expectedDays}{" "}
        日。这里只统计已记录的日期，不表示市场数据已收集完整。
      </p>
      {measured ? (
        <p className="filter-note">
          直接归因 {formatAmount(profile.directDemand)} 次 · 代理归因{" "}
          {formatAmount(profile.proxyDemand)} 次。
          <br />
          趋势：{trendLabel(profile)}，仅比较采集方式一致的前后两期。
        </p>
      ) : (
        <div className="signal warn">
          这个主题本期没有搜索记录，暂不显示次数和趋势。
        </div>
      )}
      {profile.scoreStatus === "insufficient_supply" && (
        <div className="signal warn">
          还没有确认相关游戏样本。搜索记录仍可查看，可继续补充竞品资料。
        </div>
      )}
      {measured && profile.supply > 0 && profile.supply <= 2 && (
        <div className="signal warn">
          样本有限：本站仅确认 {profile.supply} 款，不能据此证明市场空白。
        </div>
      )}
      <p className="scope-box">
        条件匹配 {profile.conditionalSupply} 款 · 尚未确认{" "}
        {profile.unknownSupply} 款。
        <br />
        游戏数只统计本站样本；组合中的机制必须出现在同一模式或范围。
      </p>
      {topic.mechanicIds && (
        <div className="type-chips">
          {topic.mechanicIds.map((id) => (
            <Link className="chip" href={`/mechanics/${id}`} key={id}>
              {getMechanic(id)?.name} ↗
            </Link>
          ))}
        </div>
      )}
      <h3 className="tiny purple" style={{ marginTop: 20 }}>
        已收录的相关游戏
      </h3>
      {profile.gameIds.length ? (
        <div className="topic-case-list">
          {profile.gameIds.map((id) => (
            <Link className="side-related-link" href={`/games/${id}`} key={id}>
              {getGame(id)?.name || id} ↗
            </Link>
          ))}
        </div>
      ) : (
        <p className="filter-note">还没有确认相关游戏，可继续补充资料。</p>
      )}
      <Link className="button" href={topicDestination(profile.topicId)}>
        {topic.kind === "combination" ? "在图谱中继续研究" : "阅读相关档案"} →
      </Link>
      <p className="tiny muted" style={{ marginTop: 16 }}>
        计算版本 {result.formulaVersion}
        <br />
        {result.dateStart} — {result.dateEnd}
      </p>
    </>
  );
}

function CountObservatory({
  initialTopic = "",
  initialView = "",
}: {
  initialTopic?: string;
  initialView?: string;
}) {
  const initial = heatTopics.find((topic) => topic.id === initialTopic);
  const { stats, isImported, replaceRecords, resetRecords } = useSearchData();
  const [days, setDays] = useState<7 | 30 | 90>(30),
    [source, setSource] = useState(""),
    [dataset, setDataset] = useState(""),
    [region, setRegion] = useState("");
  const [view, setView] = useState<RankingView>(
    ["blue", "red"].includes(initialView)
      ? (initialView as RankingView)
      : initial?.kind || "genre",
  );
  const [scoreKind, setScoreKind] = useState<Exclude<TopicKind, "game">>(
    initial?.kind && initial.kind !== "game" ? initial.kind : "combination",
  );
  const [selected, setSelected] = useState(initial?.id || "genre:moba"),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(1),
    [chart, setChart] = useState<"trend" | "scatter">("trend");
  const [importOpen, setImportOpen] = useState(false),
    [inspectOpen, setInspectOpen] = useState(false),
    [importText, setImportText] = useState(""),
    [importErrors, setImportErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const { announce } = useUI();
  const scopedStats = useMemo(
    () =>
      stats.filter(
        (row) =>
          (!source || row.sourceKind === source) &&
          (!dataset || row.datasetId === dataset) &&
          (!region || row.region === region),
      ),
    [stats, source, dataset, region],
  );
  const computed = useMemo(() => {
    try {
      return { result: analyzeHeat(scopedStats, { days }), error: "" };
    } catch (error) {
      return {
        result: null,
        error:
          error instanceof Error
            ? error.message
            : "无法分析这份记录，请检查文件内容。",
      };
    }
  }, [scopedStats, days]);
  const result = computed.result;
  const cohort: TopicKind =
    view === "blue" || view === "red" ? scoreKind : view;
  const cohortProfiles =
    result?.profiles.filter((profile) => profile.kind === cohort) || [];
  const selectedProfile =
    cohortProfiles.find((profile) => profile.topicId === selected) ||
    cohortProfiles.find((profile) => profile.measurementStatus !== "missing") ||
    cohortProfiles[0];
  const normalized = query.trim().toLowerCase();
  const ranked = cohortProfiles
    .filter(
      (profile) =>
        profile.measurementStatus !== "missing" &&
        `${profile.name} ${profile.topicId}`
          .toLowerCase()
          .includes(normalized) &&
        (view !== "blue" || (profile.blue !== null && profile.demand > 0)) &&
        (view !== "red" || profile.red !== null),
    )
    .sort((a, b) =>
      view === "blue"
        ? (b.blue || 0) - (a.blue || 0)
        : view === "red"
          ? (b.red || 0) - (a.red || 0)
          : b.demand - a.demand,
    );
  const pages = Math.ceil(ranked.length / 7),
    safePage = Math.min(page, Math.max(pages, 1));
  const sourceKinds = [...new Set(stats.map((row) => row.sourceKind))],
    datasets = [...new Set(stats.map((row) => row.datasetId))],
    regions = [...new Set(stats.map((row) => row.region))];
  const selectTopic = (id: string) => {
    setSelected(id);
    if (window.matchMedia("(max-width:700px)").matches) setInspectOpen(true);
  };
  const resetSeed = () => {
    resetRecords();
    setSource("");
    setDataset("");
    setRegion("");
    setQuery("");
    setPage(1);
    announce("已清空本地搜索记录。");
  };
  const importData = () => {
    try {
      const parsed = validateSearchImport(JSON.parse(importText));
      if (!parsed.success) {
        setImportErrors(parsed.errors);
        return;
      }
      if (parsed.stats.some((row) => row.sourceKind === "synthetic")) {
        setImportErrors([
          "这里不接收合成搜索数据。请使用实际取得的搜索记录，并保留来源信息。",
        ]);
        return;
      }
      analyzeHeat(parsed.stats, { days });
      replaceRecords(parsed.stats);
      setSource("");
      setDataset("");
      setRegion("");
      setPage(1);
      setImportErrors([]);
      setImportOpen(false);
      announce("已导入并替换当前记录。请继续核对原始来源。");
    } catch (error) {
      setImportErrors([
        error instanceof SyntaxError
          ? "JSON 语法不正确，请检查引号、逗号、括号和转义字符。"
          : error instanceof Error
            ? error.message
            : "无法读取 JSON 内容，请检查文件是否完整。",
      ]);
    }
  };
  const exportData = () => {
    const blob = new Blob(
        [JSON.stringify({ schemaVersion: 1, records: stats }, null, 2)],
        { type: "application/json" },
      ),
      url = URL.createObjectURL(blob),
      anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = isImported
      ? "atlas-search-data.json"
      : "atlas-search-empty.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <>
      <div className="breadcrumb">
        <Link href="/">研究室</Link> / 热度观察
      </div>
      <PageHead
        eyebrow="DEMAND / SUPPLY OBSERVATORY"
        title="自己的搜索记录"
        description="分析自行导入的搜索次数，查看日期覆盖与归因；数据真实性和市场覆盖需要另行核验。"
      >
        <span className="seed">
          {isImported ? "本地导入 · 来源待核验" : "尚未导入记录"}
        </span>
      </PageHead>
      <div className="heat-filter-row">
        <label>
          时间窗口
          <select
            aria-label="热度时间窗口"
            value={days}
            onChange={(event) => {
              setDays(Number(event.target.value) as 7 | 30 | 90);
              setPage(1);
            }}
          >
            <option value={7}>最近 7 日</option>
            <option value={30}>最近 30 日</option>
            <option value={90}>最近 90 日</option>
          </select>
        </label>
        <label>
          数据来源
          <select
            aria-label="搜索数据来源"
            value={source}
            onChange={(event) => {
              setSource(event.target.value);
              setPage(1);
            }}
          >
            <option value="">全部数据来源</option>
            {sourceKinds.map((kind) => (
              <option key={kind} value={kind}>
                {sourceLabels[kind]}
              </option>
            ))}
          </select>
        </label>
        <label>
          地区
          <select
            aria-label="搜索地区"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          >
            <option value="">全部已记录地区</option>
            {regions.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          数据集
          <select
            aria-label="搜索数据集"
            value={dataset}
            onChange={(event) => setDataset(event.target.value)}
          >
            <option value="">全部数据集</option>
            {datasets.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <div className="heat-data-actions">
          <button
            className="button"
            onClick={() => {
              setImportOpen(true);
              setImportErrors([]);
            }}
          >
            导入数据 ⇧
          </button>
          <button className="text-button" onClick={exportData}>
            导出当前 JSON
          </button>
          {isImported && (
            <button className="text-button" onClick={resetSeed}>
              清空本地记录
            </button>
          )}
        </div>
      </div>
      {computed.error ? (
        <EmptyState title="数据暂时无法分析" description={computed.error}>
          <button className="button primary" onClick={resetSeed}>
            清空本地记录
          </button>
        </EmptyState>
      ) : (
        result && (
          <>
            <p className="heat-window-note">
              记录区间 {result.dateStart} — {result.dateEnd} ·{" "}
              {result.sourceKinds
                .map((kind) => sourceLabels[kind])
                .join(" / ") || "无来源记录"}
              。搜索次数不等于独立人数。
            </p>
            <div className="data-strip">
              <div className="metric">
                <span>RAW SEARCH EVENTS</span>
                <strong>
                  {scopedStats.length ? (
                    <CountUp
                      value={result.totalSearches}
                      format={formatAmount}
                    />
                  ) : (
                    "未记录"
                  )}
                </strong>
                <span>原始记录中的搜索总次数</span>
              </div>
              <div className="metric">
                <span>MEASURED TOPICS</span>
                <strong>
                  {
                    cohortProfiles.filter(
                      (p) => p.measurementStatus !== "missing",
                    ).length
                  }{" "}
                  / {cohortProfiles.length}
                </strong>
                <span>当前比较组有记录的主题</span>
              </div>
              <div className="metric">
                <span>SAMPLE SUPPLY</span>
                <strong>{games.length}</strong>
                <span>收录游戏，不是全市场数量</span>
              </div>
              <div className="metric">
                <span>DATA WINDOW</span>
                <strong>
                  {days}
                  <span className="metric-unit"> 日</span>
                </strong>
                <span>与此前等长区间比较，采集方式须一致</span>
              </div>
            </div>
            <div className="heat-chart-tabs mobile-only">
              <button
                aria-pressed={chart === "trend"}
                onClick={() => setChart("trend")}
              >
                搜索趋势
              </button>
              <button
                aria-pressed={chart === "scatter"}
                onClick={() => setChart("scatter")}
              >
                搜索 × 样本
              </button>
              <button onClick={() => setInspectOpen(true)}>当前主题 ↗</button>
            </div>
            <div className="heat-illustrated-layout">
              <div className="heat-layout heat-charts">
                <div
                  className={`chart-pane ${chart === "trend" ? "mobile-chart-active" : ""}`}
                >
                  <Window
                    title="SEARCH TREND / 搜索关注趋势"
                    extra={
                      <span className="tiny">{selectedProfile?.name}</span>
                    }
                  >
                    {selectedProfile && (
                      <TrendChart
                        key={`${selectedProfile.topicId}-${days}-${dataset}-${source}-${region}`}
                        name={selectedProfile.name}
                        points={result.series.map((day) => ({
                          date: day.date,
                          value: day.values[selectedProfile.topicId] || 0,
                          measured: Object.hasOwn(
                            day.values,
                            selectedProfile.topicId,
                          ),
                        }))}
                      />
                    )}
                    <p className="chart-caption">
                      趋势：
                      {selectedProfile
                        ? trendLabel(selectedProfile)
                        : "暂无可比数据"}
                      。来源、归因规则或日期覆盖不一致时不计算增长。
                    </p>
                  </Window>
                </div>
                <div
                  className={`chart-pane ${chart === "scatter" ? "mobile-chart-active" : ""}`}
                >
                  <Window title="SEARCH × SAMPLE / 搜索与游戏样本">
                    <ScatterChart
                      profiles={cohortProfiles}
                      selected={selectedProfile?.topicId || ""}
                      onSelect={selectTopic}
                    />
                  </Window>
                </div>
              </div>
              <aside className="heat-observation-note">
                <MaidPortrait state="think" decorative />
                <span className="observation-code">
                  RIN'S OBSERVATION ／ 研究便签
                </span>
                <h2>{rinDialogue.heatTitle}</h2>
                <p>{rinDialogue.heat}</p>
                <span className="observation-stamp">搜索关注 / 游戏样本</span>
              </aside>
            </div>
            <div
              className="tabs heat-ranking-tabs"
              role="tablist"
              aria-label="热度榜单"
            >
              {(
                [
                  ["genre", "热门类别"],
                  ["mechanic", "热门机制"],
                  ["combination", "热门组合"],
                  ["blue", "蓝海线索"],
                  ["red", "红海观察"],
                  ["game", "游戏关注"],
                ] as const
              ).map(([id, label]) => (
                <button
                  role="tab"
                  aria-selected={view === id}
                  className={view === id ? "active" : ""}
                  key={id}
                  onClick={() => {
                    setView(id);
                    setPage(1);
                    setQuery("");
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="heat-ranking-layout">
              <section>
                <div className="ranking-controls">
                  <label className="inline-search">
                    <span aria-hidden="true">⌕</span>
                    <input
                      aria-label="筛选热度主题"
                      placeholder="筛选当前榜单…"
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setPage(1);
                      }}
                    />
                  </label>
                  {(view === "blue" || view === "red") && (
                    <select
                      aria-label="主题比较范围"
                      value={scoreKind}
                      onChange={(event) => {
                        setScoreKind(
                          event.target.value as Exclude<TopicKind, "game">,
                        );
                        setPage(1);
                      }}
                    >
                      <option value="combination">机制组合内比较</option>
                      <option value="genre">游戏类别内比较</option>
                      <option value="mechanic">原子机制内比较</option>
                    </select>
                  )}
                </div>
                <p className="ranking-note">
                  {view === "blue" || view === "red"
                    ? "暂不评估市场机会：本站游戏样本不覆盖整个市场，导入记录也不计算蓝海或红海分。"
                    : "按分配到各主题的搜索次数排序，不按游戏数量排序。"}{" "}
                  关键词只筛选榜单，不改变比较基准。
                </p>
                <Window
                  title={`RANKING / ${view === "blue" ? "蓝海线索" : view === "red" ? "红海观察" : kindLabels[cohort]}`}
                >
                  {ranked.length ? (
                    <>
                      <table className="ranking heat-ranking-table">
                        <thead>
                          <tr>
                            <th scope="col">#</th>
                            <th scope="col">研究主题</th>
                            <th scope="col">搜索次数</th>
                            <th scope="col">相关游戏</th>
                            <th scope="col">
                              {view === "blue"
                                ? "蓝海分"
                                : view === "red"
                                  ? "红海分"
                                  : "趋势"}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {ranked
                            .slice((safePage - 1) * 7, safePage * 7)
                            .map((profile, index) => (
                              <tr
                                key={profile.topicId}
                                className={
                                  selectedProfile?.topicId === profile.topicId
                                    ? "selected"
                                    : ""
                                }
                              >
                                <td>
                                  {String(
                                    (safePage - 1) * 7 + index + 1,
                                  ).padStart(2, "0")}
                                </td>
                                <td>
                                  <button
                                    className="ranking-name"
                                    onClick={() => selectTopic(profile.topicId)}
                                  >
                                    {profile.name}
                                  </button>
                                  {profile.supply === 0 && (
                                    <span className="ranking-status">
                                      待补游戏样本
                                    </span>
                                  )}
                                  {profile.measurementStatus === "partial" && (
                                    <span className="ranking-status">
                                      日期记录不完整
                                    </span>
                                  )}
                                </td>
                                <td>{formatAmount(profile.demand)}</td>
                                <td>{profile.supply}</td>
                                <td>
                                  {view === "blue"
                                    ? profile.blue?.toFixed(1)
                                    : view === "red"
                                      ? profile.red?.toFixed(1)
                                      : trendLabel(profile)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      <nav className="pagination" aria-label="热度排行分页">
                        <button
                          disabled={safePage <= 1}
                          onClick={() => setPage((p) => p - 1)}
                        >
                          ← 上一页
                        </button>
                        <span>
                          {safePage} / {pages}
                        </span>
                        <button
                          disabled={safePage >= pages}
                          onClick={() => setPage((p) => p + 1)}
                        >
                          下一页 →
                        </button>
                      </nav>
                    </>
                  ) : (
                    <EmptyState
                      title="当前没有可列出的主题"
                      description={
                        view === "blue" || view === "red"
                          ? "现有搜索记录和游戏样本不足以判断市场机会，暂不发布蓝海或红海排名。"
                          : "可更换关键词、来源或日期范围；没有记录的主题暂不显示次数。"
                      }
                    >
                      <button className="button" onClick={() => setQuery("")}>
                        清除关键词
                      </button>
                    </EmptyState>
                  )}
                </Window>
                <details className="method-details">
                  <summary>查看统计方法与数据说明</summary>
                  <div className="paper">
                    <h2>这些数字能说明什么？</h2>
                    <p>
                      这些搜索记录和本站游戏样本不足以判断市场机会，因此不计算蓝海或红海分。相关游戏数只帮助查找案例。
                    </p>
                    <ul>
                      {result.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                    <Link href="/method#heat">完整统计方法与适用范围 ↗</Link>
                    <p className="tiny">{FORMULA_VERSION}</p>
                  </div>
                </details>
              </section>
              <aside className="heat-inspector desktop-only">
                {selectedProfile && (
                  <Window title="TOPIC FILE / 主题分析">
                    <TopicDetails profile={selectedProfile} result={result} />
                  </Window>
                )}
              </aside>
            </div>
          </>
        )
      )}
      <Dialog
        open={inspectOpen}
        onClose={() => setInspectOpen(false)}
        title="TOPIC FILE / 主题分析"
        className="topic-dialog"
      >
        <div className="window-body">
          {result && selectedProfile && (
            <TopicDetails profile={selectedProfile} result={result} />
          )}
        </div>
      </Dialog>
      <Dialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="IMPORT / 本地搜索记录"
        className="import-dialog"
      >
        <div className="window-body">
          <h2 className="dialog-heading">替换一套搜索记录</h2>
          <p className="filter-note">
            文件只在当前浏览器中分析，不会上传；刷新后清除。请使用包含
            schemaVersion:1 和 records 数组的
            JSON，可先导出文件查看格式。导入时会检查格式与一致性，来源内容仍需自行核对。
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            aria-label="选择搜索记录JSON文件"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              if (file.size > 5 * 1024 * 1024) {
                setImportErrors([
                  "文件超过 5 MB，请按相同的采集方式和范围拆成较小文件。",
                ]);
                return;
              }
              setImportText(await file.text());
              setImportErrors([]);
            }}
          />
          <label className="field-label" htmlFor="search-import-json">
            JSON 内容
          </label>
          <textarea
            id="search-import-json"
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            rows={9}
            spellCheck={false}
            placeholder={'{"schemaVersion":1,"records":[…]}'}
          />
          {importErrors.length > 0 && (
            <div className="import-errors" role="alert">
              <strong>导入失败，原有数据保持不变。</strong>
              <ul>
                {importErrors.slice(0, 6).map((error, index) => (
                  <li key={`${index}-${error}`}>{error}</li>
                ))}
              </ul>
              {importErrors.length > 6 && (
                <p>
                  另有 {importErrors.length - 6} 处错误，请按提示检查对应字段。
                </p>
              )}
            </div>
          )}
          <div className="modal-actions">
            <button className="button primary" onClick={importData}>
              校验并替换本地数据 →
            </button>
            <button className="button" onClick={() => setImportOpen(false)}>
              取消
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

export default function HeatObservatory(props: {
  initialTopic?: string;
  initialView?: string;
}) {
  const { isImported } = useSearchData();
  const [showCounts, setShowCounts] = useState(isImported);
  return showCounts ? (
    <>
      <button className="button" onClick={() => setShowCounts(false)}>
        ← 返回真实搜索资料
      </button>
      <CountObservatory {...props} />
    </>
  ) : (
    <RealSearchDemand
      initialTopic={props.initialTopic}
      onOpenCounts={() => setShowCounts(true)}
    />
  );
}
