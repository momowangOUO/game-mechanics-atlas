import { z } from "zod";
import { games, getMechanicSupply } from "./knowledge";
import { heatTopics } from "../data/heat-topics";
export { heatTopics } from "../data/heat-topics";
export type TopicKind = "genre" | "mechanic" | "combination" | "game";
export type HeatTopic = {
  id: string;
  name: string;
  kind: TopicKind;
  genreId?: string;
  mechanicIds?: string[];
  gameId?: string;
  description: string;
};
export type SearchQueryStat = {
  id: string;
  datasetId: string;
  date: string;
  query: string;
  count: number;
  region: string;
  language: string;
  sourceKind: "synthetic" | "site_log" | "import";
  attributions: { topicId: string; weight: number; mode: "direct" | "proxy" }[];
};
export type TopicHeatProfile = {
  topicId: string;
  name: string;
  kind: TopicKind;
  demand: number;
  directDemand: number;
  proxyDemand: number;
  supply: number;
  conditionalSupply: number;
  unknownSupply: number;
  gameIds: string[];
  demandIndex: number | null;
  blue: number | null;
  red: number | null;
  trend: number | null;
  trendStatus: "up" | "down" | "flat" | "new" | "missing";
  scoreStatus: "ok" | "no_demand" | "insufficient_supply" | "no_data";
  measurementStatus: "missing" | "partial" | "complete";
  measuredDays: number;
  expectedDays: number;
  series: { date: string; value: number }[];
};
export type HeatOptions = {
  days?: 7 | 30 | 90;
  endDate?: string;
  region?: string;
  kind?: TopicKind;
};
export type HeatAnalysis = {
  profiles: TopicHeatProfile[];
  series: { date: string; total: number; values: Record<string, number> }[];
  totalSearches: number;
  dateStart: string;
  dateEnd: string;
  sourceKinds: string[];
  seedOnly: boolean;
  formulaVersion: string;
  warnings: string[];
};
export const FORMULA_VERSION = "count-analysis-v2-no-market-score";
export const SMOOTHING_K = 2;
const topicById = new Map(heatTopics.map((topic) => [topic.id, topic]));
const topicKinds = ["genre", "mechanic", "combination", "game"] as const;
function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const stamp = Date.parse(`${value}T00:00:00Z`);
  return (
    Number.isFinite(stamp) &&
    new Date(stamp).toISOString().slice(0, 10) === value
  );
}
function shiftDate(value: string, days: number): string {
  const result = new Date(Date.parse(`${value}T00:00:00Z`) + days * 86400000)
    .toISOString()
    .slice(0, 10);
  if (!validDate(result)) throw new Error("日期范围超出支持的日历区间。");
  return result;
}
const nonempty = z.string().trim().min(1);
const recordSchema = z
  .object({
    id: nonempty,
    datasetId: nonempty,
    date: z
      .string()
      .refine(validDate, "日期必须是合法的 YYYY-MM-DD 日历日期。"),
    query: nonempty,
    count: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
    region: nonempty,
    language: nonempty,
    sourceKind: z.enum(["synthetic", "site_log", "import"]),
    attributions: z.array(
      z
        .object({
          topicId: nonempty,
          weight: z.number().gt(0).max(1),
          mode: z.enum(["direct", "proxy"]),
        })
        .strict(),
    ),
  })
  .strict()
  .superRefine((record, ctx) => {
    const weights = new Map<TopicKind, number>(),
      seen = new Set<string>();
    record.attributions.forEach((attribution, index) => {
      const topic = topicById.get(attribution.topicId);
      if (!topic)
        ctx.addIssue({
          code: "custom",
          path: ["attributions", index, "topicId"],
          message:
            "主题 ID 未收录。请使用主题列表中的 ID，系统不会按名称相似度自动归因。",
        });
      if (seen.has(attribution.topicId))
        ctx.addIssue({
          code: "custom",
          path: ["attributions", index, "topicId"],
          message: "同一记录不能重复列出同一主题。",
        });
      seen.add(attribution.topicId);
      if (topic)
        weights.set(
          topic.kind,
          (weights.get(topic.kind) ?? 0) + attribution.weight,
        );
    });
    for (const [kind, weight] of weights)
      if (weight > 1 + Number.EPSILON * 8)
        ctx.addIssue({
          code: "custom",
          path: ["attributions"],
          message: `${kind} 维度的归因权重合计不能超过 1。`,
        });
  });

/** Import JSON shape: {schemaVersion:1, records:SearchQueryStat[]}. Validation is atomic.
 * Within one dataset/source/region/language, each normalized query must use one
 * attribution rule across all imported dates. Counts may vary; rule changes
 * require a separate dataset or a consistent re-attribution of the history.
 */
export const SearchImportSchema = z
  .object({ schemaVersion: z.literal(1), records: z.array(recordSchema) })
  .strict()
  .superRefine((value, ctx) => {
    const ids = new Set<string>(),
      datasetSources = new Map<string, SearchQueryStat["sourceKind"]>();
    const attributionRules = new Map<string, string>();
    value.records.forEach((record, index) => {
      if (ids.has(record.id))
        ctx.addIssue({
          code: "custom",
          path: ["records", index, "id"],
          message: `重复记录 ID：${record.id}。整批未导入。`,
        });
      ids.add(record.id);
      if (
        datasetSources.has(record.datasetId) &&
        datasetSources.get(record.datasetId) !== record.sourceKind
      )
        ctx.addIssue({
          code: "custom",
          path: ["records", index, "sourceKind"],
          message:
            "同一数据集中的来源类别必须一致。请为不同来源使用不同的数据集 ID，包括合成数据。",
        });
      datasetSources.set(record.datasetId, record.sourceKind);
      const ruleKey = JSON.stringify([
        record.datasetId,
        record.sourceKind,
        record.region,
        record.language,
        normalizeQuery(record.query),
      ]);
      const signature = JSON.stringify(
        [...record.attributions]
          .sort((a, b) => a.topicId.localeCompare(b.topicId))
          .map(({ topicId, weight, mode }) => [topicId, weight, mode]),
      );
      const previousRule = attributionRules.get(ruleKey);
      if (previousRule !== undefined && previousRule !== signature)
        ctx.addIssue({
          code: "custom",
          path: ["records", index, "attributions"],
          message: `搜索词「${normalizeQuery(record.query)}」的归因规则不一致。请按同一规则重新归因历史记录，或用独立数据集保存不同口径；归因变化不能直接解释为搜索增长。`,
        });
      else attributionRules.set(ruleKey, signature);
    });
  });
const queryAliases: Record<string, string> = {
  lol: "英雄联盟",
  "league of legends": "英雄联盟",
  英雄联盟: "英雄联盟",
};
export function normalizeQuery(query: string): string {
  const normalized = query
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  return Object.hasOwn(queryAliases, normalized)
    ? queryAliases[normalized]
    : normalized;
}
function importIssueText(issue: z.core.$ZodIssue): string {
  if (issue.code === "custom") return issue.message;
  if (issue.code === "invalid_type") {
    const types: Record<string, string> = {
      string: "文本",
      number: "数值",
      int: "整数",
      array: "数组",
      object: "对象",
      boolean: "布尔值",
    };
    return `此字段应为${types[issue.expected] ?? "规定的数据类型"}，请检查是否漏填或填写了其他类型。`;
  }
  if (issue.code === "invalid_value")
    return `请使用允许的取值：${issue.values.map(String).join("、")}。`;
  if (issue.code === "unrecognized_keys")
    return `包含不支持的字段：${issue.keys.join("、")}。`;
  if (issue.code === "too_small" || issue.code === "too_big") {
    const minimum = issue.code === "too_small";
    const limit = minimum ? issue.minimum : issue.maximum;
    if (issue.origin === "string" || issue.origin === "array") {
      const unit = issue.origin === "string" ? "个字符" : "项";
      return `${issue.origin === "string" ? "内容长度" : "数组长度"}${minimum ? "至少" : "最多"}为 ${limit} ${unit}。`;
    }
    return `数值${minimum ? (issue.inclusive ? "不得小于" : "必须大于") : issue.inclusive ? "不得大于" : "必须小于"} ${limit}。`;
  }
  if (issue.code === "invalid_format") return "内容格式不正确，请按示例填写。";
  return issue.message;
}
export function validateSearchImport(
  value: unknown,
):
  | { success: true; stats: SearchQueryStat[]; errors: [] }
  | { success: false; errors: string[] } {
  const parsed = SearchImportSchema.safeParse(value);
  if (!parsed.success)
    return {
      success: false,
      errors: parsed.error.issues.map(
        (issue) =>
          `${issue.path.join(".") || "导入文件"}：${importIssueText(issue)}`,
      ),
    };
  return {
    success: true,
    stats: parsed.data.records.map((record) => ({
      ...record,
      query: normalizeQuery(record.query),
    })),
    errors: [],
  };
}

export function scoreHeat(
  demand: number,
  max: number,
  supply: number,
): Pick<TopicHeatProfile, "demandIndex" | "blue" | "red" | "scoreStatus"> {
  if (
    !Number.isFinite(demand) ||
    !Number.isFinite(max) ||
    demand < 0 ||
    max < demand ||
    max > Number.MAX_SAFE_INTEGER ||
    !Number.isSafeInteger(supply) ||
    supply < 0
  )
    throw new Error(
      "需求量和比较组最大值必须为有限非负数，最大值不得小于需求量或超过安全数值上限；样本供给必须为非负安全整数。",
    );
  if (max === 0)
    return { demandIndex: null, blue: null, red: null, scoreStatus: "no_data" };
  const d = Math.sqrt(demand / max),
    c = supply / (supply + SMOOTHING_K),
    demandIndex = 100 * d;
  if (demand === 0)
    return {
      demandIndex,
      blue: null,
      red: supply > 0 ? 100 * c : null,
      scoreStatus: "no_demand",
    };
  if (supply === 0)
    return {
      demandIndex,
      blue: null,
      red: null,
      scoreStatus: "insufficient_supply",
    };
  return {
    demandIndex,
    blue: 100 * d * (1 - c),
    red: 100 * c * (1 - 0.5 * d),
    scoreStatus: "ok",
  };
}
function sampleSupply(topic: HeatTopic): {
  supply: number;
  conditionalSupply: number;
  unknownSupply: number;
  gameIds: string[];
} {
  if (topic.kind === "mechanic" || topic.kind === "combination") {
    const supply = getMechanicSupply(topic.mechanicIds ?? []);
    return {
      supply: supply.count,
      conditionalSupply: supply.conditional,
      unknownSupply: supply.unknown,
      gameIds: supply.gameIds,
    };
  }
  const gameIds = games
    .filter((game) =>
      topic.kind === "game"
        ? game.id === topic.gameId
        : topic.genreId !== undefined && game.genreIds.includes(topic.genreId),
    )
    .map((game) => game.id);
  return {
    supply: gameIds.length,
    conditionalSupply: 0,
    unknownSupply: topic.kind === "genre" ? games.length - gameIds.length : 0,
    gameIds,
  };
}
function safeAdd(a: number, b: number): number {
  const sum = a + b;
  if (sum > Number.MAX_SAFE_INTEGER || !Number.isFinite(sum))
    throw new Error(
      "搜索总量超过安全数值范围，请缩小时间区间或分开数据集分析。",
    );
  return sum;
}
type Accumulator = {
  direct: number;
  proxy: number;
  previous: number;
  days: Map<string, number>;
  coverage: Map<string, Set<string>>;
};
function trendFor(
  acc: Accumulator,
  current: number,
  dateStart: string,
  dateEnd: string,
  previousStart: string,
  days: number,
): Pick<TopicHeatProfile, "trend" | "trendStatus"> {
  // No row is not a measured zero. Each participating dataset/source/region/language
  // must cover both periods explicitly; querying a different cohort is not growth.
  const complete =
    acc.coverage.size > 0 &&
    [...acc.coverage.values()].every((dates) => {
      for (let i = 0; i < days * 2; i++)
        if (!dates.has(shiftDate(previousStart, i))) return false;
      return true;
    });
  if (!complete || dateStart > dateEnd)
    return { trend: null, trendStatus: "missing" };
  if (acc.previous === 0)
    return current > 0
      ? { trend: null, trendStatus: "new" }
      : { trend: 0, trendStatus: "flat" };
  const trend = (current - acc.previous) / acc.previous;
  if (!Number.isFinite(trend)) return { trend: null, trendStatus: "missing" };
  return { trend, trendStatus: trend > 0 ? "up" : trend < 0 ? "down" : "flat" };
}
export function analyzeHeat(
  stats: SearchQueryStat[],
  options: HeatOptions = {},
): HeatAnalysis {
  const validated = validateSearchImport({ schemaVersion: 1, records: stats });
  if (!validated.success) throw new Error(validated.errors.join("\n"));
  const days = options.days ?? 30;
  if (![7, 30, 90].includes(days))
    throw new Error("时间区间只能选择 7、30 或 90 天。");
  if (options.kind !== undefined && !topicKinds.includes(options.kind))
    throw new Error(
      "主题种类无效，请选择游戏类别、原子机制、机制组合或具体游戏。",
    );
  const filtered = validated.stats.filter(
    (row) => !options.region || row.region === options.region,
  );
  const dateEnd =
    options.endDate ??
    (filtered.reduce((last, row) => (row.date > last ? row.date : last), "") ||
      new Date().toISOString().slice(0, 10));
  if (!validDate(dateEnd)) throw new Error("结束日期不是合法日历日期。");
  const dateStart = shiftDate(dateEnd, 1 - days),
    previousStart = shiftDate(dateStart, -days);
  const selected = filtered.filter(
    (row) => row.date >= previousStart && row.date <= dateEnd,
  );
  const accumulators = new Map(
    heatTopics.map((topic) => [
      topic.id,
      {
        direct: 0,
        proxy: 0,
        previous: 0,
        days: new Map<string, number>(),
        coverage: new Map<string, Set<string>>(),
      } satisfies Accumulator,
    ]),
  );
  const series = Array.from({ length: days }, (_, i) => ({
    date: shiftDate(dateStart, i),
    total: 0,
    values: {} as Record<string, number>,
  }));
  const dayMap = new Map(series.map((day) => [day.date, day]));
  let totalSearches = 0,
    previousTotal = 0;
  for (const row of selected) {
    const current = row.date >= dateStart;
    const day = dayMap.get(row.date);
    if (current) {
      totalSearches = safeAdd(totalSearches, row.count);
      day!.total = safeAdd(day!.total, row.count);
    } else previousTotal = safeAdd(previousTotal, row.count);
    for (const attribution of row.attributions) {
      const acc = accumulators.get(attribution.topicId)!;
      const value = row.count * attribution.weight;
      const cohort = JSON.stringify([
        row.datasetId,
        row.sourceKind,
        row.region,
        row.language,
      ]);
      if (!acc.coverage.has(cohort)) acc.coverage.set(cohort, new Set());
      acc.coverage.get(cohort)!.add(row.date);
      if (current) {
        if (attribution.mode === "direct")
          acc.direct = safeAdd(acc.direct, value);
        else acc.proxy = safeAdd(acc.proxy, value);
        acc.days.set(row.date, safeAdd(acc.days.get(row.date) ?? 0, value));
        day!.values[attribution.topicId] = safeAdd(
          day!.values[attribution.topicId] ?? 0,
          value,
        );
      } else acc.previous = safeAdd(acc.previous, value);
    }
  }
  const maxima: Record<TopicKind, number> = {
    genre: 0,
    mechanic: 0,
    combination: 0,
    game: 0,
  };
  for (const topic of heatTopics) {
    const acc = accumulators.get(topic.id)!;
    maxima[topic.kind] = Math.max(
      maxima[topic.kind],
      safeAdd(acc.direct, acc.proxy),
    );
  }
  const profiles = heatTopics
    .map((topic) => {
      const acc = accumulators.get(topic.id)!,
        demand = safeAdd(acc.direct, acc.proxy),
        supply = sampleSupply(topic);
      // A current attributed record, including an explicit zero, measures that day.
      // Past rows and chart zero-fill never establish a current measurement.
      const measuredDays = acc.days.size;
      const measurementStatus: TopicHeatProfile["measurementStatus"] =
        measuredDays === 0
          ? "missing"
          : measuredDays === days
            ? "complete"
            : "partial";
      const scores =
        measuredDays === 0
          ? {
              demandIndex: null,
              blue: null,
              red: null,
              scoreStatus: "no_data" as const,
            }
          : scoreHeat(demand, maxima[topic.kind], supply.supply);
      // Formula arithmetic remains for isolated synthetic test fixtures only.
      // Imported counts and this atlas's non-exhaustive supply sample cannot establish a market opportunity.
      if (selected.some((row) => row.sourceKind !== "synthetic")) {
        scores.blue = null;
        scores.red = null;
      }
      return {
        topicId: topic.id,
        name: topic.name,
        kind: topic.kind,
        demand,
        directDemand: acc.direct,
        proxyDemand: acc.proxy,
        ...supply,
        measurementStatus,
        measuredDays,
        expectedDays: days,
        ...scores,
        ...trendFor(acc, demand, dateStart, dateEnd, previousStart, days),
        series: series.map((day) => ({
          date: day.date,
          value: acc.days.get(day.date) ?? 0,
        })),
      };
    })
    .sort((a, b) => b.demand - a.demand || a.topicId.localeCompare(b.topicId));
  const sourceKinds = [
    ...new Set(selected.map((row) => row.sourceKind)),
  ].sort();
  const warnings = [
    "供给仅统计本站收录样本，类型供给按编辑标签统计；缺少标签不能证明游戏不属于该类型。",
    "搜索次数不代表玩家人数或购买意愿；实际导入记录不计算蓝海、红海分，本站样本数不足以测量完整市场供给。",
    "时间序列保留每日记录的覆盖情况，缺失记录不视为实测零值；计算趋势需要两期逐日可比。",
  ];
  if (sourceKinds.includes("synthetic"))
    warnings.unshift(
      "当前范围包含合成搜索数据，示例趋势和排序不代表真实市场。",
    );
  if (sourceKinds.includes("import"))
    warnings.push(
      "来源标记 import 只表示数据由外部导入，真实性与采样口径仍需核验。",
    );
  if (sourceKinds.length > 1)
    warnings.push(
      "当前范围包含多种来源，指数按同一来源集合汇总比较。请分别核验各数据集，不能将混合结果直接视为某个真实市场的表现。",
    );
  if (selected.length === 0)
    warnings.push(
      "所选范围没有搜索记录。数据为空且未指定结束日期时，仅以今天作为待采集区间的终点；不表示已有当日测量。",
    );
  return {
    profiles: profiles.filter(
      (profile) => !options.kind || profile.kind === options.kind,
    ),
    series,
    totalSearches,
    dateStart,
    dateEnd,
    sourceKinds,
    seedOnly: sourceKinds.length === 1 && sourceKinds[0] === "synthetic",
    formulaVersion: FORMULA_VERSION,
    warnings,
  };
}
