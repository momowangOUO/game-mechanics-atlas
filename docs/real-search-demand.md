# 真实搜索资料与采集范围

默认页面展示 Google Trending Now 的近期电子游戏搜索快照，2025 年全球 Games 飙升榜保留为历史资料。两种资料分别标注来源、指标和统计范围，不拼成一张排名。

## 近期快照：2026-11-02

- 来源：[Google Trending Now](https://trends.google.com/trending?geo=TW&category=6&hours=168)，近七天，Games 分类。
- 地区：中国台湾、中国香港、日本、美国，各自展示，不跨地区求和。
- 当前发布 38 个已核对的电子游戏词条：9、6、10、13 项。它们是近期走热的词条，不是全部游戏的搜索榜。
- 指标：Google 公布的搜索量档位下限、相对通常水平的增长、开始走热与回落时间。`2万+` 保留为档位，不改成精确的 20,000 次；`1,000%` 保留来源的显示上限。
- 词条可能因发售、赛事、更新、服务器状态或攻略而上榜。相近词条可能重叠，不相加成游戏、类型、机制或组合总需求。
- 公开文件：`src/data/current-trends.json`、`public/data/search-demand/current-trends.json` 和四份 `trending-地区-source.json`。每份来源片段保留原数组数值与 SHA-256；完整官方 HTML 保存在忽略的 `.build/search-demand/`。
- 只发布已核对的电子游戏搜索，排除纯赌博与传统棋牌。原始 Games 池中的彩票、赛马、棋类等未进入公开数据，详见[收录范围](content-scope.md)。
- 手动更新：`node scripts/collect-current-trends.mjs`。没有定时研究或自动更新任务。网站显示实际采集日期，不宣称持续实时更新。

采集适配参考了 MIT 许可的 [google-trends-now](https://github.com/RuochenLyu/google-trends-now) 对数据格式的说明；本项目没有安装其依赖或执行远程脚本，实际数据直接读取 Google 页面。解析仅使用 JSON，不执行页面脚本；字段或地区不符时停止，保留原快照。

Google 的[统计说明](https://support.google.com/trends/answer/3076011?hl=en)解释了走热状态、分档流量与时间窗口。近期游戏名搜索没有被分配成某个机制的直接测量。

## 已取得的数据

- 来源：[Google Year in Search 2025](https://trends.withgoogle.com/year-in-search/2025/)，Games，Global。
- 指标：飙升搜索名次（ordinal rank），不是搜索总次数、玩家人数或销量。
- 区间：2025-01-01 至 2025-11-25，对比 2024 年同一日期区间。
- [官方统计方法](https://trends.withgoogle.com/year-in-search/data-methodology/)说明榜单按当年增长识别趋势，不能称为“搜索最多”。
- 资料入口：`src/data/search-demand.json`、`public/data/search-demand/snapshot.json`。
- 原文证据：`public/data/search-demand/annual-games-source.txt` 保存官方列表的原始条目起始标签，包含名次与搜索词，以纯文本展示，避免空标签在网页中渲染成空列表。完整响应与方法页保存在被忽略的 `.build/search-demand/`；不将整份网页复制进发布内容。
- 采集脚本：`node scripts/collect-search-demand.mjs`。脚本验证十个连续名次与方法页日期，保存 SHA-256；页面变化或请求失败时停止，不填补虚构条目。

年度榜不能作为当前类型需求、原子机制需求、机制组合需求或蓝海结论的依据。没有该主题的直接测量时，页面仍显示未采集。

## 类型对比仍未取得

2026-11-02，再次请求同组 `roguelike`、`deck-building game`、`auto battler`、`idle game`、`extraction shooter`。地区为全球，网页搜索，全部类别，区间为 2026-08-04 至 2026-11-02，实际返回 HTTP 429，没有取得时间序列。采集脚本已改为按执行日期生成近 90 天区间。

完整请求参数、时间、状态码及响应 SHA-256 在快照中；原始错误响应为 `public/data/search-demand/genre-request-response.txt`。页面显示未取得，不把失败视为零，也不生成替代排名。官网 explore 页的工具读取同样失败。本次没有使用浏览量或在线人数替代搜索次数。

另尝试通过 Codex 内置浏览器打开官方比较页，工具实际返回 Work 设置已禁用本地浏览器使用，未取得页面或指数；没有以其他自动化渠道绕过该设置。

[官方 Trends API](https://developers.google.com/search/apis/trends)核验时仍要求申请 Alpha 访问。也检查了 MIT 许可的 [pytrends](https://github.com/GeneralMills/pytrends)；该项目是非官方接口，2025-04-17 已归档，无法解决本次 429，因此没有新增依赖。[旧游戏洞察报告链接](https://games.withgoogle.com/reports/insightsreport/)实际跳转到 Android 开发者首页，本次未用其历史数字。

## 相对指数导入契约

页面提供独立的 Google Trends 指数 JSON 校验。它与旧搜索次数记录使用不同字段和解析器，不把 0–100 存进 count。

必需字段：`schemaVersion:1`、`provider:google_trends`、`metric:relative_search_interest`、`comparisonGroupId`、`sourceUrl`、`collectedAt`、`rawSha256`、`region`、`dateStart`、`dateEnd`、`granularity:day`、`searchProperty:web`、`category`、`terms`、`rows`。`sourceUrl` 必须保留 Google Trends 原始比较链接和完全相同的词条、日期、地区、分类。`terms` 是同一次请求的 2–5 个有序搜索词；`rows` 中每行有 `date`、与 terms 一一对应的 `values` 数组和 `partial` 布尔值。

校验不能证明导入文件真实，页面明确显示“本地导入 · 来源待核验”。只有所有日期、所有搜索词均有完整且非空测量，才展示同组平均指数。缺失、null、partial 不补零；指数 0 可能表示搜索量过低，不能证明没人搜索。按 Google [说明](https://support.google.com/trends/answer/4365533?hl=en)，指数经过抽样、归一化，独立请求、不同地区和不同区间不可直接拼接比较。

相对指数、年度名次均不计算搜索总次数或蓝海、红海分。旧次数分析保留为独立的个人数据工具，拒绝合成数据；实际导入记录也不将本站有限样本量转成市场机会评分。合成数据和旧公式仅保留为明确的单元测试夹具，不是默认资料。
