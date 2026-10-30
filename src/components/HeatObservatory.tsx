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
          <small>收录确认供给</small>
          <strong>
            {profile.supply}
            <span> 款</span>
          </strong>
        </div>
        <div>
          <small>蓝海线索分</small>
          <strong className="cyan">
            {profile.blue === null ? "—" : profile.blue.toFixed(1)}
          </strong>
        </div>
        <div>
          <small>红海线索分</small>
          <strong className="gold">
            {profile.red === null ? "—" : profile.red.toFixed(1)}
          </strong>
        </div>
      </div>
      <p className="filter-note">
        有该主题记录的日期：{profile.measuredDays} / {profile.expectedDays}{" "}
        日。日期覆盖不等于全市场采样完整。
      </p>
      {measured ? (
        <p className="filter-note">
          直接归因 {formatAmount(profile.directDemand)} 次 · 代理归因{" "}
          {formatAmount(profile.proxyDemand)} 次。
          <br />
          趋势：{trendLabel(profile)}，需前后两期同口径可比。
        </p>
      ) : (
        <div className="signal warn">
          这个主题本期完全没有记录。它没有被写成零需求，也没有产生机会或压力分数。
        </div>
      )}
      {profile.scoreStatus === "insufficient_supply" && (
        <div className="signal warn">
          尚无确认供给，先补竞品样本。需求仍可见，但没有直接判为蓝海。
        </div>
      )}
      {measured && profile.supply > 0 && profile.supply <= 2 && (
        <div className="signal warn">
          样本有限：确认供给仅 {profile.supply} 款，不能据此证明市场空白。
        </div>
      )}
      <p className="scope-box">
        条件匹配 {profile.conditionalSupply} 款 · 尚未确认{" "}
        {profile.unknownSupply} 款。
        <br />
        供给统计只反映本站收录样本；机制组合要求在同一兼容范围共存。
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
        已确认供给中的案例
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
        <p className="filter-note">
          暂无可列出的确认案例。没有记录不等于该方向不存在。
        </p>
      )}
      <Link className="button" href={topicDestination(profile.topicId)}>
        {topic.kind === "combination" ? "在图谱中继续研究" : "阅读相关档案"} →
      </Link>
      <p className="tiny muted" style={{ marginTop: 16 }}>
        公式 {result.formulaVersion}
        <br />
        {result.dateStart} — {result.dateEnd}
      </p>
    </>
  );
}

export default function HeatObservatory({
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
          error instanceof Error ? error.message : "分析失败，请核对数据。",
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
    announce("已恢复合成搜索示例。");
  };
  const importData = () => {
    try {
      const parsed = validateSearchImport(JSON.parse(importText));
      if (!parsed.success) {
        setImportErrors(parsed.errors);
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
      announce("数据已在本地完成校验与替换，来源标签保持原样。");
    } catch (error) {
      setImportErrors([
        error instanceof Error ? error.message : "无法读取JSON文件。",
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
      : "atlas-search-seed.json";
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
        title="玩家在搜什么？"
        description="搜索关注决定热门排行，收录样本供给用于研究竞争。两者分开，才有可追溯的机会线索。"
      >
        <SeedBadge imported={isImported && !result?.seedOnly} />
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
            <option value="">全部已导入来源</option>
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
            导出当前JSON
          </button>
          {isImported && (
            <button className="text-button" onClick={resetSeed}>
              恢复合成示例
            </button>
          )}
        </div>
      </div>
      {computed.error ? (
        <EmptyState title="数据暂时无法分析" description={computed.error}>
          <button className="button primary" onClick={resetSeed}>
            恢复合成示例
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
                  <CountUp value={result.totalSearches} format={formatAmount} />
                </strong>
                <span>原始搜索事件次数 · 跨维度不重复加计</span>
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
                <span>趋势需同口径的前一等长区间</span>
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
                需求 × 供给
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
                  <Window title="DEMAND × SUPPLY / 需求供给散点">
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
                <h2>热度，是线索。</h2>
                <p>
                  先看搜索关注，再核对样本供给。低供给不等于已经证明的市场空白。
                </p>
                <div>
                  <strong>玩家在搜什么？</strong>
                  <p>原始搜索次数决定关注排行；不是收录游戏越多，就越热门。</p>
                </div>
                <div>
                  <strong>同类供给有多少？</strong>
                  <p>供给只统计已确认的本站样本，未知与条件匹配分别保留。</p>
                </div>
                <div>
                  <strong>下一步，去核验。</strong>
                  <p>
                    把机会线索带回真实案例和原型，核对覆盖范围、成本与玩家选择。
                  </p>
                </div>
                <span className="observation-stamp">需求 ≠ 供给</span>
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
                      aria-label="线索分比较组"
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
                    ? "指数只在同类主题中比较；零供给与无记录不进入机会判断。"
                    : "按原始归因搜索次数排序，不按游戏数或线索分排序。"}{" "}
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
                            <th scope="col">确认供给</th>
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
                                      待补供给样本
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
                      description="可能没有采集记录、缺少确认供给，或关键词没有匹配。不会用零值补出机会结论。"
                    >
                      <button className="button" onClick={() => setQuery("")}>
                        清除关键词
                      </button>
                    </EmptyState>
                  )}
                </Window>
                <details className="method-details">
                  <summary>查看公式、来源限制与分析提示</summary>
                  <div className="paper">
                    <h2>平滑参数 k = 2</h2>
                    <p>
                      d = √(D / Dmax)，c = S / (S + 2)
                      <br />
                      蓝海线索 = 100 × d × (1 − c)
                      <br />
                      红海线索 = 100 × c × (1 − 0.5d)
                    </p>
                    <p>
                      分数不是成功概率。它们各自表达研究线索，不能相加后解释为100%。
                    </p>
                    <ul>
                      {result.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                    <Link href="/method#heat">完整口径与算例 ↗</Link>
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
            只在本地浏览器分析，不上传文件。请使用带 schemaVersion:1 和 records
            数组的JSON；可先导出示例作为格式参考。合成来源标签会原样保留。
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
                  "文件超过5MB，请拆成较小的、口径一致的数据集。",
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
              <strong>整批未导入，当前数据保持不变。</strong>
              <ul>
                {importErrors.slice(0, 6).map((error, index) => (
                  <li key={`${index}-${error}`}>{error}</li>
                ))}
              </ul>
              {importErrors.length > 6 && (
                <p>另有 {importErrors.length - 6} 处错误，请按路径逐项核对。</p>
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
