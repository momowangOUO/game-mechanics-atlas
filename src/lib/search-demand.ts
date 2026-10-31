import { z } from "zod";
import snapshot from "../data/search-demand.json";

/** Published ordinal ranks and relative indices have separate contracts from search counts. */
export const annualSearchSnapshot = snapshot.annual;
export const currentSearchAttempt = snapshot.current;
export const DEFAULT_SEARCH_RECORDS = [];

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const stamp = Date.parse(`${value}T00:00:00Z`);
    return (
      Number.isFinite(stamp) &&
      new Date(stamp).toISOString().slice(0, 10) === value
    );
  }, "日期不是有效日历日期。");
const googleUrl = z.url().refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" && url.hostname === "trends.google.com";
}, "请保留 Google Trends 原始来源链接。");

export const SearchInterestSchema = z
  .object({
    schemaVersion: z.literal(1),
    provider: z.literal("google_trends"),
    metric: z.literal("relative_search_interest"),
    comparisonGroupId: z.string().min(1),
    sourceUrl: googleUrl,
    collectedAt: z.iso.datetime(),
    rawSha256: z.string().regex(/^[a-f0-9]{64}$/),
    region: z.string().min(1),
    dateStart: isoDate,
    dateEnd: isoDate,
    granularity: z.literal("day"),
    searchProperty: z.literal("web"),
    category: z.number().int().nonnegative(),
    terms: z.array(z.string().trim().min(1)).min(2).max(5),
    rows: z
      .array(
        z
          .object({
            date: isoDate,
            values: z.array(z.number().min(0).max(100).nullable()),
            partial: z.boolean(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    const issue = (message: string) =>
      ctx.addIssue({ code: "custom", message });
    if (value.dateStart > value.dateEnd) issue("开始日期不能晚于结束日期。");
    if (new Set(value.terms).size !== value.terms.length)
      issue("同组搜索词不能重复。");
    const dates = new Set<string>();
    for (const row of value.rows) {
      if (dates.has(row.date)) issue("同一比较组不能重复记录同一天。");
      dates.add(row.date);
      if (row.date < value.dateStart || row.date > value.dateEnd)
        issue("时间序列不能超出请求区间。");
      if (row.values.length !== value.terms.length)
        issue("每行指数必须与同组搜索词一一对应，不能拼接独立请求。");
    }
    const source = new URL(value.sourceUrl);
    if (source.pathname.replace(/\/$/, "") !== "/trends/explore")
      issue("请提供 Google Trends 原始比较页面链接。");
    const sourceTerms = source.searchParams.get("q")?.split(",");
    if (
      !sourceTerms ||
      JSON.stringify(sourceTerms) !== JSON.stringify(value.terms)
    )
      issue("来源链接的搜索词与比较组不一致。");
    if (
      source.searchParams.get("date") !== `${value.dateStart} ${value.dateEnd}`
    )
      issue("来源链接的日期与比较组不一致。");
    const sourceRegion = source.searchParams.get("geo") || "GLOBAL";
    if (sourceRegion !== value.region) issue("来源链接的地区与比较组不一致。");
    if (
      Number(source.searchParams.get("cat") || 0) !== value.category ||
      source.searchParams.get("gprop")
    )
      issue("来源链接的分类或搜索类型与比较组不一致。");
  });
export type SearchInterestSnapshot = z.infer<typeof SearchInterestSchema>;

export function validateSearchInterest(value: unknown) {
  return SearchInterestSchema.safeParse(value);
}

export function analyzeSearchInterest(input: SearchInterestSnapshot) {
  const data = SearchInterestSchema.parse(input);
  const expectedDays =
    Math.round(
      (Date.parse(data.dateEnd) - Date.parse(data.dateStart)) / 86400000,
    ) + 1;
  const complete =
    data.rows.length === expectedDays &&
    data.rows.every(
      (row) => !row.partial && row.values.every((value) => value !== null),
    );
  return {
    comparisonGroupId: data.comparisonGroupId,
    complete,
    totalSearches: null,
    blue: null,
    red: null,
    profiles: data.terms
      .map((query, index) => ({
        query,
        meanInterest: complete
          ? data.rows.reduce((sum, row) => sum + row.values[index]!, 0) /
            expectedDays
          : null,
        points: [...data.rows]
          .sort((a, b) => a.date.localeCompare(b.date))
          .map((row) => ({
            date: row.date,
            value: row.values[index],
            measured: !row.partial && row.values[index] !== null,
          })),
      }))
      .sort((a, b) => (b.meanInterest ?? -1) - (a.meanInterest ?? -1)),
  };
}
