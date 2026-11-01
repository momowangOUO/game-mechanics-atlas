# 搜索发现与机器阅读

正式地址为 `https://momowangouo.github.io/game-mechanics-atlas/`，作者为魔魔王。本轮复用项目现有的 Next.js Metadata、静态导出和数据模型，不引入 SEO 服务或新依赖。实现前对照了已安装 Next.js 16.4.3 的本地文档、[Next.js Metadata 文档](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)与 [sitemap 文档](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)。

## 网页与搜索入口

所有正式内容页都有独立标题、说明、绝对 canonical、Open Graph 和 Twitter 预览。分享图是 `/brand/social-preview.png`，1280 × 640；正式链接固定使用公开部署地址，不随本机预览地址改变。查询参数只是已有内容页的交互状态，canonical 指向相应的无参数页面。

分类内容保留原有交互图鉴，并新增 9 个维度页和 50 个分组页。它们从同一份分类数据静态生成，正文包含作用、边界、机制链接和带范围及来源的游戏实例；不依赖浏览器查询参数才能读到内容。分类首页的静态目录直接链接这些页面。

`/sitemap.xml` 从与页面相同的实体 ID 生成，目前列出 306 个正式内容地址，包含版权与署名页；不加入筛选参数、404、错误页或虚构的配方详情页。当前未提供 `lastmod`，避免把重新构建时间冒充内容更新时间。以后如加入，须来自具体内容的实际修订记录。Google 同样要求准确使用此字段，参见[站点地图指南](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)。

结构化数据使用 WebSite、Person、BreadcrumbList，以及机制、游戏案例与类型文章的 Article。Article 表示本站编辑文章，不把本站分析标成游戏官方陈述；作者与引用来源分别记录。没有评分、奖项、组织资质或虚构发布日期。JSON-LD 对 HTML 分隔符转义，防止正文中的特殊字符关闭脚本标签。

没有在项目子目录新增一个声称控制整站的 robots.txt。搜索爬虫的有效位置是 `https://momowangouo.github.io/robots.txt`，此项目只控制 `/game-mechanics-atlas/`。Google 明确规定 [robots.txt 必须位于主机根目录](https://developers.google.com/crawling/docs/robots-txt/create-robots-txt)。正常内容未设全局 noindex；未找到的动态实体调用 Next.js `notFound()`，错误地址不进入站点地图。

## 机器阅读资源

`/for-agents/` 是可见入口，说明格式、引用方式和数据边界。机器资源包括：

- `/llms.txt`：小型阅读导航，指向 Markdown 目录与 JSON 接口。
- 每个正式内容页相邻的 `index.md`：例如 `/mechanics/aimed-launch/index.md`。机制、游戏、类型、分组与维度提供正文，交互工具提供静态摘要及相关数据链接。
- `/data/v1/catalog.json`：按实体种类和稳定 ID 查找正式页面、Markdown 与单项 JSON。
- `/data/v1/knowledge.json`：完整公开知识快照，含机制、游戏、类型、配方、关系、实例、研究范围和来源。
- `/data/v1/{mechanics,games,types,dimensions,groups,recipes}/{id}.json`：单项结构化记录。
- `/data/v1/schema.json`：字段含义与解释边界；这是接口说明，不冒充完整 JSON Schema 校验器。

页面通过 `rel="alternate" type="text/markdown"` 提供相邻 Markdown，并通过 `rel="describedby"` 指向 llms.txt。此位置和链接方式遵循 [llms.txt 提案](https://llmstxt.org/)；提案允许它放在 GitHub Pages 项目子路径。它是便于按需读取资料的导航，不是爬虫访问控制或排名承诺。

单项游戏和机制数据保留实例原始 status、scopeId、condition、evidenceKind 和 sourceIds，并附研究范围及来源；完整快照保留全部父子范围。机制定义、分组、设计分析、类型与配方标明编辑属性，未知不补成不存在。导出不包含测试 fixtures、合成搜索需求、浏览器本地导入、凭据或第三方原始图片。公开读取不改变游戏图像及原始资料的权利归属。

机制 JSON 与 Markdown 还保留“图解（规则示意）”：三格说明、对象标签、图示类型、机制图标和原创讲解角色插画地址。内容直接来自网页使用的 mechanic-scenes 数据，标记为 editorial_illustration；这些示意用于解释规则，不作为游戏事实证据。

`v1` 是静态导出接口版本，不是游戏版本。核验时间沿用原来源的 checkedAt，不用每次构建时间覆盖。生成物由规范数据重建，不单独编辑；目前不会对已删除实体留下仍在目录中的链接。更新实体时须保持既有 ID；若更改导出结构的语义或移除字段，另开接口版本并更新说明。

## 构建与验证

`scripts/next-build.mjs` 在启动 Next 构建前调用导出器。导出器只读取正式知识数据，并先运行现有完整性校验。由于项目的 TS 源使用无扩展名相对导入，脚本借助已安装的 TypeScript 和 Node 24 同步模块钩子加载这些文件；钩子只在此构建包装进程内处理项目 src 下的 TS，不传给 Next 子进程，没有新增运行时服务。

单独生成可运行：

```powershell
node --import ./scripts/register-typescript.mjs ./scripts/export-agent-data.mjs
```

默认输出到 public，生成目录已加入忽略规则。检查时也可传入 `.build/agent-export-check` 作为输出目录，避免生成正式构建输入。需要全新干净输出时使用新目录；脚本不递归删除现有目录。正式导出每次重建所有当前资源，目录与站点地图只链接仍有效的实体。

本轮已实际通过 SEO 单元测试 5 项、机器导出测试 5 项，以及 4 项静态浏览器与 HTTP 测试，生成 635 份机器阅读资源。检查覆盖站点地图与页面集合、独立 metadata、canonical、结构化数据转义、全部 Markdown 入口、JSON 目录链接、实例状态、来源及规则图解。整体构建与发布记录见本轮验收文档。

```powershell
npx vitest run src/lib/seo.test.ts
npm run test:agent-data
```

## 发布后提交与观察

Google Search Console 与 Bing Webmaster Tools 需要拥有对应站点的账号完成验证。代码没有伪造验证 token；本轮也没有声称已经验证、提交、被索引或获得 AI 引用。

部署后应由站点所有者验证 URL 前缀 `https://momowangouo.github.io/game-mechanics-atlas/`，提交其 `sitemap.xml`，抽查首页、分类页与详情页的索引状态。Google 的操作见 [Search Console 站点地图报告](https://support.google.com/webmasters/answer/7451001)，Bing 的操作见[添加并验证站点](https://www.bing.com/webmasters/help/add-and-verify-site-12184f8b)和[站点地图说明](https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed)。如果账户要求 HTML 验证标签，取得真实值后再配置；不要用占位值冒充验证成功。

Google 说明搜索基础做法仍适用于其 AI 功能，没有专用的 schema.org 标记要求，参见 [AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)。这些改动改善资料可访问性、链接与解释边界，不保证收录、排名、AI 引用或流量。
