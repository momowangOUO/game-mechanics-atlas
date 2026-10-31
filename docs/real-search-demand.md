# 真实搜索资料与采集范围

默认页面不再加载合成搜索量。已接入 Google 官方的 2025 年全球 Games 飙升搜索榜，保留官方十个名次、原始词条、来源、采集时间和证据摘要；它是实际发布的历史搜索资料。

## 已取得的数据

- 来源：[Google Year in Search 2025](https://trends.withgoogle.com/year-in-search/2025/)，Games，Global。
- 指标：飙升搜索名次（ordinal rank），不是搜索总次数、玩家人数或销量。
- 区间：2025-01-01 至 2025-11-25，对比 2024 年同一日期区间。
- [官方统计方法](https://trends.withgoogle.com/year-in-search/data-methodology/)说明榜单按当年增长识别趋势，不能称为“搜索最多”。
- 资料入口：`src/data/search-demand.json`、`public/data/search-demand/snapshot.json`。
- 原文证据：`public/data/search-demand/annual-games-source.txt` 保存官方列表的原始条目起始标签，包含名次与搜索词，以纯文本展示，避免空标签在网页中渲染成空列表。完整响应与方法页保存在被忽略的 `.build/search-demand/`；不将整份网页复制进发布内容。
- 采集脚本：`node scripts/collect-search-demand.mjs`。脚本验证十个连续名次与方法页日期，保存 SHA-256；页面变化或请求失败时停止，不填补虚构条目。

年度榜不能作为当前类型需求、原子机制需求、机制组合需求或蓝海结论的依据。没有该主题的直接测量时，页面仍显示未采集。

## 本次未取得的数据

2026-10-31，本机用一次 Google Trends explore 请求比较 `roguelike`、`deck-building game`、`auto battler`、`idle game`、`extraction shooter`。地区为全球，网页搜索，全部类别，区间为 2026-07-31 至 2026-10-30。实际返回 HTTP 429，没有取得时间序列。

完整请求参数、时间、状态码及响应 SHA-256 在快照中；原始错误响应为 `public/data/search-demand/genre-request-response.txt`。页面显示未取得，不把失败视为零，也不生成替代排名。官网 explore 页的工具读取同样失败。本次没有使用浏览量或在线人数替代搜索次数。

另尝试通过 Codex 内置浏览器打开官方比较页，工具实际返回 Work 设置已禁用本地浏览器使用，未取得页面或指数；没有以其他自动化渠道绕过该设置。

[官方 Trends API](https://developers.google.com/search/apis/trends)核验时仍要求申请 Alpha 访问。也检查了 MIT 许可的 [pytrends](https://github.com/GeneralMills/pytrends)；该项目是非官方接口，2025-04-17 已归档，无法解决本次 429，因此没有新增依赖。[旧游戏洞察报告链接](https://games.withgoogle.com/reports/insightsreport/)实际跳转到 Android 开发者首页，本次未用其历史数字。

## 相对指数导入契约

页面提供独立的 Google Trends 指数 JSON 校验。它与旧搜索次数记录使用不同字段和解析器，不把 0–100 存进 count。

必需字段：`schemaVersion:1`、`provider:google_trends`、`metric:relative_search_interest`、`comparisonGroupId`、`sourceUrl`、`collectedAt`、`rawSha256`、`region`、`dateStart`、`dateEnd`、`granularity:day`、`searchProperty:web`、`category`、`terms`、`rows`。`sourceUrl` 必须保留 Google Trends 原始比较链接和完全相同的词条、日期、地区、分类。`terms` 是同一次请求的 2–5 个有序搜索词；`rows` 中每行有 `date`、与 terms 一一对应的 `values` 数组和 `partial` 布尔值。

校验不能证明导入文件真实，页面明确显示“本地导入 · 来源待核验”。只有所有日期、所有搜索词均有完整且非空测量，才展示同组平均指数。缺失、null、partial 不补零；指数 0 可能表示搜索量过低，不能证明没人搜索。按 Google [说明](https://support.google.com/trends/answer/4365533?hl=en)，指数经过抽样、归一化，独立请求、不同地区和不同区间不可直接拼接比较。

相对指数、年度名次均不计算搜索总次数或蓝海、红海分。旧次数分析保留为独立的个人数据工具，拒绝合成数据；实际导入记录也不将本站有限样本量转成市场机会评分。合成数据和旧公式仅保留为明确的单元测试夹具，不是默认资料。
