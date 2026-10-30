"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import {
  analyzeHeat,
  heatTopics,
  type HeatAnalysis,
  type TopicHeatProfile,
} from "@/lib/heat";
import { CountUp, SeedBadge } from "./Primitives";
import { useSearchData } from "./SearchDataProvider";

export function formatAmount(value: number) {
  if (value >= 100000000)
    return `${(value / 100000000).toLocaleString("zh-CN", { maximumFractionDigits: 2 })} 亿`;
  if (value >= 10000)
    return `${(value / 10000).toLocaleString("zh-CN", { maximumFractionDigits: 2 })} 万`;
  return value.toLocaleString("zh-CN", { maximumFractionDigits: 1 });
}
export function trendLabel(profile: TopicHeatProfile) {
  if (profile.trendStatus === "missing") return "暂无可比数据";
  if (profile.trendStatus === "new") return "新出现";
  if (profile.trend === null) return "—";
  return `${profile.trend > 0 ? "+" : ""}${(profile.trend * 100).toFixed(1)}%`;
}

export function TrendChart({
  name,
  points,
}: {
  name: string;
  points: { date: string; value: number; measured?: boolean }[];
}) {
  const [hover, setHover] = useState<number | null>(null);
  const id = useId().replace(/:/g, "");
  const width = 640,
    height = 235,
    pad = { left: 52, right: 18, top: 20, bottom: 35 };
  const maximum = Math.max(
    1,
    ...points.filter((p) => p.measured !== false).map((p) => p.value),
  );
  const x = (index: number) =>
    pad.left +
    (index / Math.max(1, points.length - 1)) * (width - pad.left - pad.right);
  const y = (value: number) =>
    height - pad.bottom - (value / maximum) * (height - pad.top - pad.bottom);
  let drawing = false;
  const path = points
    .map((point, index) => {
      if (point.measured === false) {
        drawing = false;
        return "";
      }
      const segment = `${drawing ? "L" : "M"}${x(index).toFixed(2)} ${y(point.value).toFixed(2)}`;
      drawing = true;
      return segment;
    })
    .join(" ");
  const selected = hover === null ? null : points[hover];
  const tickIndices = [
    ...new Set([
      0,
      Math.floor((points.length - 1) / 3),
      Math.floor(((points.length - 1) * 2) / 3),
      points.length - 1,
    ]),
  ].filter((i) => i >= 0);
  const hasData = points.some((point) => point.measured !== false);
  return (
    <div className="chart-widget">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${name}每日归因搜索次数，左右方向键查看日期`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            event.preventDefault();
            setHover((previous) =>
              Math.max(
                0,
                Math.min(
                  points.length - 1,
                  (previous ?? points.length - 1) +
                    (event.key === "ArrowRight" ? 1 : -1),
                ),
              ),
            );
          }
        }}
        onPointerMove={(event) => {
          const box = event.currentTarget.getBoundingClientRect();
          const relative = ((event.clientX - box.left) / box.width) * width;
          setHover(
            Math.max(
              0,
              Math.min(
                points.length - 1,
                Math.round(
                  ((relative - pad.left) / (width - pad.left - pad.right)) *
                    (points.length - 1),
                ),
              ),
            ),
          );
        }}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`trend-${id}`} x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#88cdc5" stopOpacity=".15" />
            <stop offset="1" stopColor="#88cdc5" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g stroke="#484056" fill="none">
          {[0, 0.5, 1].map((factor) => (
            <path
              key={factor}
              d={`M${pad.left} ${y(maximum * factor)}H${width - pad.right}`}
              strokeDasharray="2 6"
            />
          ))}
          <path
            d={`M${pad.left} ${pad.top}V${height - pad.bottom}H${width - pad.right}`}
          />
        </g>
        <g className="chart-label">
          {[0, 0.5, 1].map((factor) => (
            <text
              key={factor}
              x={pad.left - 9}
              y={y(maximum * factor) + 4}
              textAnchor="end"
            >
              {formatAmount(maximum * factor)}
            </text>
          ))}
          {tickIndices.map((index) => (
            <text
              key={index}
              x={x(index)}
              y={height - 10}
              textAnchor={
                index === 0
                  ? "start"
                  : index === points.length - 1
                    ? "end"
                    : "middle"
              }
            >
              {points[index]?.date.slice(5).replace("-", ".")}
            </text>
          ))}
        </g>
        {hasData && (
          <path
            className="trend-line"
            d={path}
            fill="none"
            stroke="#88cdc5"
            strokeWidth="2.5"
          />
        )}
        {selected && (
          <g>
            <path
              d={`M${x(hover!)} ${pad.top}V${height - pad.bottom}`}
              stroke="#bfa4da"
              strokeDasharray="3 5"
            />
            {selected.measured !== false && (
              <circle
                cx={x(hover!)}
                cy={y(selected.value)}
                r="5"
                fill="#dfbd77"
                stroke="#202034"
                strokeWidth="2"
              />
            )}
          </g>
        )}
        {!hasData && (
          <text
            x={width / 2}
            y={height / 2}
            textAnchor="middle"
            fill="#aa98bc"
            fontSize="13"
          >
            本期未采集此主题的搜索记录
          </text>
        )}
      </svg>
      <div className="chart-inspect" aria-live="polite">
        {selected ? (
          <>
            <span>{selected.date}</span>
            <strong>
              {selected.measured === false
                ? "未记录"
                : `${formatAmount(selected.value)} 次`}
            </strong>
          </>
        ) : (
          <>
            <span>移动指针或使用左右键查看每日值</span>
            <span>
              {hasData ? "缺失日期保留断点" : "没有记录不等于实测为零"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export function ScatterChart({
  profiles,
  selected,
  onSelect,
}: {
  profiles: TopicHeatProfile[];
  selected: string;
  onSelect: (id: string) => void;
}) {
  const list = profiles.filter((p) => p.scoreStatus !== "no_data");
  const width = 440,
    height = 285,
    left = 44,
    right = 22,
    top = 27,
    bottom = 43;
  const maxSupply = Math.max(1, ...list.map((p) => p.supply));
  const x = (s: number) => left + (s / maxSupply) * (width - left - right),
    y = (d: number) => height - bottom - (d / 100) * (height - top - bottom);
  return (
    <div className="chart-widget">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="需求指数与收录样本供给散点图，空心点表示尚无确认供给"
      >
        <rect
          x={left}
          y={top}
          width={(width - left - right) / 2}
          height={(height - top - bottom) / 2}
          fill="#88cdc50a"
        />
        <g stroke="#50445e" fill="none">
          <path d={`M${left} ${top}V${height - bottom}H${width - right}`} />
          <path
            d={`M${left} ${y(50)}H${width - right}M${x(maxSupply / 2)} ${top}V${height - bottom}`}
            strokeDasharray="3 6"
          />
        </g>
        <g className="chart-label">
          <text x="3" y="15">
            需求指数 ↑
          </text>
          <text x={left + 8} y={top + 16} fill="#88cdc5">
            高需求 / 低已发现供给
          </text>
          <text x={width - 17} y={height - 11} textAnchor="end">
            收录供给（款）→
          </text>
          <text x={left - 10} y={y(100) + 4} textAnchor="end">
            100
          </text>
          <text x={left - 10} y={y(0) + 4} textAnchor="end">
            0
          </text>
          {[0, Math.ceil(maxSupply / 2), maxSupply].map((s, i) => (
            <text
              key={`${i}-${s}`}
              x={x(s)}
              y={height - bottom + 17}
              textAnchor="middle"
            >
              {s}
            </text>
          ))}
        </g>
        {list.map((profile) => {
          const active = profile.topicId === selected;
          return (
            <g
              className={`scatter-point ${active ? "selected" : ""}`}
              key={profile.topicId}
              role="button"
              aria-label={`${profile.name}，搜索${formatAmount(profile.demand)}次，确认供给${profile.supply}款`}
              tabIndex={0}
              onClick={() => onSelect(profile.topicId)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(profile.topicId);
                }
              }}
            >
              <circle
                cx={x(profile.supply)}
                cy={y(profile.demandIndex || 0)}
                r={active ? 11 : 7}
                fill={
                  profile.supply === 0
                    ? "#202033"
                    : active
                      ? "#dfbd77"
                      : "#b59bcd"
                }
                fillOpacity={active ? 1 : 0.8}
                stroke={
                  active
                    ? "#ffe3a2"
                    : profile.supply === 0
                      ? "#d0b6e7"
                      : "#c9b2dc"
                }
                strokeWidth={active ? 2 : 1}
              />
              <title>{`${profile.name}：${formatAmount(profile.demand)}次 / 已确认供给${profile.supply}；${profile.scoreStatus === "insufficient_supply" ? "样本不足，未计算机会分" : "指数为同类主题内比较"}`}</title>
            </g>
          );
        })}
        {!list.length && (
          <text
            x={width / 2}
            y={height / 2}
            fill="#ac99bd"
            fontSize="12"
            textAnchor="middle"
          >
            本期没有可绘制的数据
          </text>
        )}
      </svg>
      <p className="chart-caption">
        空心点＝尚无确认供给，不能直接判为蓝海。点击点查看主题与案例。
      </p>
    </div>
  );
}

function SearchProvenance({ sourceKinds }: Pick<HeatAnalysis, "sourceKinds">) {
  const hasSynthetic = sourceKinds.includes("synthetic");
  const mixed = sourceKinds.length > 1;
  const labels: Record<string, string> = {
    synthetic: "合成示例",
    site_log: "站内日志（由导入提供）",
    import: "外部导入（真实性待核验）",
  };
  return (
    <>
      {mixed ? (
        <span className="seed">
          混合来源{hasSynthetic ? " · 包含合成示例" : " · 本地导入"}
        </span>
      ) : sourceKinds.length ? (
        <SeedBadge imported={!hasSynthetic} />
      ) : (
        <span className="seed">暂无搜索记录</span>
      )}
      {mixed && (
        <p className="filter-note">
          来源：{sourceKinds.map((kind) => labels[kind] || kind).join("、")}。
          请分开数据集核验，不能把混合结果当作单一真实市场。
        </p>
      )}
    </>
  );
}

export function HeatProfileMini({ topicId }: { topicId: string }) {
  const { stats } = useSearchData();
  const result = useMemo(() => analyzeHeat(stats), [stats]);
  const profile = result.profiles.find((p) => p.topicId === topicId);
  return (
    <div className="heat-mini">
      <SearchProvenance sourceKinds={result.sourceKinds} />
      <p className="tiny muted" style={{ marginTop: 10 }}>
        {result.dateStart} — {result.dateEnd}
      </p>
      {profile && profile.scoreStatus !== "no_data" ? (
        <>
          <div className="mini-profile-numbers">
            <div>
              <small>归因搜索次数</small>
              <strong>
                <CountUp value={profile.demand} format={formatAmount} />
              </strong>
            </div>
            <div>
              <small>趋势 / 同口径</small>
              <strong>{trendLabel(profile)}</strong>
            </div>
          </div>
          <p className="filter-note">
            直接归因 {formatAmount(profile.directDemand)} · 代理归因{" "}
            {formatAmount(profile.proxyDemand)}。游戏搜索不证明特定机制偏好。
          </p>
        </>
      ) : (
        <p className="scope-box">
          {result.seedOnly
            ? "本期合成示例没有给这个主题设置搜索记录。"
            : "本期导入数据没有这个主题的搜索记录。"}
          这里保留“未采集”，不会显示成零关注或制造趋势。
        </p>
      )}
      <Link
        className="button"
        href={`/heat?topic=${encodeURIComponent(topicId)}`}
      >
        查看主题与数据来源 →
      </Link>
    </div>
  );
}

export function HomeHeatHighlights() {
  const { stats } = useSearchData();
  const result = useMemo(() => analyzeHeat(stats), [stats]);
  const kinds = [
    ["genre", "热门类别"],
    ["mechanic", "热门机制"],
    ["combination", "热门组合"],
  ] as const;
  const opportunity = result.profiles
    .filter(
      (p) =>
        p.kind === "combination" && p.scoreStatus === "ok" && p.blue !== null,
    )
    .sort((a, b) => (b.blue || 0) - (a.blue || 0))[0];
  return (
    <>
      <div className="home-heat-grid">
        {kinds.map(([kind, title]) => (
          <section className="small-card" key={kind}>
            <p className="eyebrow">SEARCH SIGNAL / {kind}</p>
            <h3 className="serif" style={{ fontSize: 23, margin: "10px 0" }}>
              {title}
            </h3>
            <ol className="home-heat-ranking">
              {result.profiles
                .filter((p) => p.kind === kind && p.demand > 0)
                .slice(0, 3)
                .map((profile) => (
                  <li key={profile.topicId}>
                    <Link
                      href={`/heat?topic=${encodeURIComponent(profile.topicId)}`}
                    >
                      <span>{profile.name}</span>
                      <strong>{formatAmount(profile.demand)}</strong>
                    </Link>
                  </li>
                ))}
            </ol>
          </section>
        ))}
      </div>
      <div className="home-opportunity-strip">
        <div>
          <span className="eyebrow">BLUE OCEAN / 继续研究的线索</span>
          <h3>{opportunity?.name || "先收集可比较的需求与供给"}</h3>
          <p>
            {opportunity
              ? `${result.seedOnly ? "合成搜索" : "搜索归因"} ${formatAmount(opportunity.demand)} 次 · 收录确认供给 ${opportunity.supply} 款 · 仍有 ${opportunity.unknownSupply} 款样本未确认。`
              : "缺少数据时，不自动给出市场机会判断。"}
          </p>
        </div>
        <div>
          <SearchProvenance sourceKinds={result.sourceKinds} />
          <Link
            className="button"
            href={
              opportunity
                ? `/heat?view=blue&topic=${encodeURIComponent(opportunity.topicId)}`
                : "/heat"
            }
          >
            核对线索与案例 →
          </Link>
        </div>
      </div>
      <p className="catalog-note">
        数据窗口截至 {result.dateEnd}
        。热门榜按原始搜索次数排序；指数不代表销量、成功率或已证明的市场空白。
      </p>
    </>
  );
}

export function topicDestination(topicId: string) {
  const topic = heatTopics.find((t) => t.id === topicId);
  if (!topic) return "/heat";
  if (topic.gameId) return `/games/${topic.gameId}`;
  if (topic.genreId) return `/types/${topic.genreId}`;
  if (topic.kind === "mechanic" && topic.mechanicIds?.[0])
    return `/mechanics/${topic.mechanicIds[0]}`;
  if (topic.mechanicIds?.[0]) return `/graph?focus=${topic.mechanicIds[0]}`;
  return "/method";
}
