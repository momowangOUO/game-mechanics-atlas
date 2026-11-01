# 机制研究室 · Game Mechanics Atlas

面向游戏设计师的机制知识库、真实游戏案例、组合实验室与搜索需求观察平台。本地数据驱动，无需数据库、模型 API 或账号即可运行。

当前重点是逐层分类参考：9 个维度、50 个机制分组、122 条机制，以及 32 个复合类型的玩法说明和游戏用法。80 款游戏卡面使用官方代表图。默认合成热门榜已撤下，搜索观察改为注明时间与指标的 Google 官方历史快照；当前类别需求未取得时保留为空。2026-11-01 已按用户要求公开仓库，并发布 GitHub Pages 静态网站。

[本次分类与数据修订](docs/taxonomy-revision/implementation.md) · [真实搜索资料与来源](docs/real-search-demand.md)

[在线网站](https://momowangouo.github.io/game-mechanics-atlas/) · [直接查分类](https://momowangouo.github.io/game-mechanics-atlas/taxonomy/) · [GitHub公开仓库](https://github.com/momowangOUO/game-mechanics-atlas) · [发布验收](docs/publication.md)

![首页桌面实际页面](docs/taxonomy-revision/runtime/home-desktop.png)

## Galgame 美术升级 · 2026-10-31

以下记录此前的美术制作阶段；其中 18 张游戏示意图现已归档，当前使用官方代表图，配方图已扩充至 32 张。

按「游戏艺术家」工作流完成研究室场景、独立前景、六种 RIN 角色状态、五张栏目插画、18张原创玩法示意、10张配方场景和九维图标。首页使用标题画面与角色对话；内页增加纸面档案、线索板和观察便签。实验室的机制卡、冲突标记、盖章与角色反应由实际操作驱动。

[目标与制作说明](docs/game-artist/upgrade.md) · [正式素材清单](docs/game-artist/assets.json) · [独立视觉评审](docs/game-artist/review.md) · [本轮验证](docs/game-artist/verification.md)

此前的文案已按 clear-natural-writing 复核，操作录屏已导出为 MP4 并更新播放器；该录屏记录前次版本。本轮分类与数据修订另有当前截图和测试记录。[历史审校](docs/copy-review/summary.md) · [前次 MP4 录屏](docs/game-artist/motion/research-session.mp4)

## 本地运行

需要 Node.js 22.13+（本机验证为 24.11.1）与 npm。

```sh
npm ci
npm run dev
```

打开 http://127.0.0.1:3000 。根路径静态构建与预览：

```sh
npm run build
npm start
```

## GitHub Pages 静态版

**已上线：** https://momowangouo.github.io/game-mechanics-atlas/ 。仓库已改为公开，原先私有仓库的 Pages 套餐限制已解除。云端构建与部署均成功，公网页面、资源及手机交互已验证。[发布记录](docs/publication.md) · [分类版验收](docs/taxonomy-revision/verification.md)

网站已改为纯静态导出，部署内容位于 `out/`，无需 Node 服务或数据库。开发命令仍使用 Next；生产预览仅托管静态文件。

```sh
npm run build:pages
npm run preview:pages
```

访问 http://127.0.0.1:3000/game-mechanics-atlas/ 。根路径和项目子路径是不同构建配置，切换位置需要重新构建。`PAGES_BASE_PATH` 可覆盖构建路径。

[静态化实施说明](docs/static-pages-implementation.md) · [资料独立抽审](docs/static-expansion/content-review.md) · [图像与来源清单](src/data/game-art-sources.json)

源码仓库现为公开。Pages 工作流只发布 `out/`，由 `main` 推送或手动触发，没有定时研究或自动补资料任务。正式网址使用 HTTPS；发布结果见发布记录。

## 功能

|入口|用途|
|---|---|
|`/`|原创女仆引导、搜索、重点案例、组合与搜索关注概览|
|`/taxonomy`|逐层查阅九维、50 分组、全部机制的作用、边界与有范围的游戏实例；手机分步分页|
|`/mechanics`|按维度、核心玩法与关键词检索，定义、边界、反例与相关案例|
|`/games`|真实游戏档案；机制、循环、关系与热度视图，模式范围切换|
|`/types`|32 个复合类型的玩家任务、玩法过程、设计问题、相近类型差别和具体游戏参照|
|`/graph`|拖动、平移、缩放、维度过滤、邻接关系、同范围共现与案例追踪|
|`/lab`|32 组配方、自定义机制与目标、规则诊断、循环、冲突、Demo问题与相似案例|
|`/heat`|Google 官方年度搜索飙升名次、来源与采集状态；相对指数与实际次数分别导入；暂停市场机会分|
|`/compare`|两款游戏与不同范围的机制、循环、构筑、资源和搜索关注对照|
|`/method`、`/sources`|分类约束、五状态、公式、数据格式、事实来源与资产边界|

全局搜索支持 Ctrl/Cmd K。手机使用底部导航、筛选抽屉、图表 Tab、排行分页与实验室分步操作。动效包含页面与面板转场、数字增长、关系路径、图谱邻接高亮、搜索展开和角色轻动效；系统减少动态偏好优先，自动模式同时照顾手机和低性能设备。

## 分类与内容

正式目录包含 **122 条原子机制、80 款游戏、32 个复合类型、32 组配方、120 条编辑关系、704 条机制实例和 148 个独立来源页面**。其中 703 条实例为存在或条件成立，另有 1 条既有反面观察。来源事实、社区资料、编辑分析分别标识；没有安装实测所有游戏，也没有对全部实例完成独立二次审计。

九维ID固定为 `interaction`、`rules`、`temporal`、`buildcraft`、`progression`、`economy`、`information`、`participants`、`variability`。机制实例只引用规范机制ID，不能复制并改写主维度。题材、画风、叙事和平台属于独立元数据；检索标签和复合类型不改变原子身份。

实例支持 `present / absent / not_applicable / unknown / conditional`，并绑定游戏、模式、系统、章节、角色或版本范围。未填写按未知查询；只有显式父子范围可以继承，兄弟范围不能拼接。条件实例需要写明成立条件。已记录实例是有来源的下界，不意味着其余机制不存在，也不是 80 款游戏的完整机制矩阵。

事实、编辑设计分析与未核验事项在页面分别说明。定义、机制组合、核心循环及实现难点是定性编辑归纳，不伪造精确工时、官方结论或已验证创新。

## 真实搜索资料

默认展示 **Google Year in Search 2025 全球 Games 榜的 10 条真实搜索飙升名次**，统计 2025-01-01 至 11-25，比较上一年同期。保留官方出处、统计方法、采集时间、原文片段与 SHA-256。它反映历史增长，不是搜索总量或 2026 年当前热度，也不能自动归因为某个类型或机制的需求。

- 当前类别相对指数请求实际返回 HTTP 429，页面显示未取得，不以零或虚构榜单替代。
- Google Trends 同组相对指数使用独立契约，只比较相同词组、时间、地区和搜索类型；不换算为搜索次数。
- 实际次数分析默认空记录，正式界面拒绝合成数据。导入格式通过不证明来源真实。
- 原始总量每条记录只计一次；同一事件在不同主题种类中可以分别归因，同一种类权重总和不得超过1。
- 游戏名代理信号和直接机制搜索分开。搜索次数不是独立人数、销量或购买意愿。
- 组合供给要求原子机制在同一兼容范围共同存在；条件与未知单列，不跨模式凑组合。
- 不完整的游戏样本不是市场供给；年度名次和相对指数也没有绝对搜索量。因此当前暂停蓝海、红海分与机会排名，真实次数导入后也不计算市场机会。
- 完全未记录不同于实测零；次数趋势要求前后等长区间逐日、来源和归因口径可比。上一期为零时用状态表达，不计算无穷增长。

导入只在当前浏览器会话中生效，不上传服务器；刷新后清空，重新展示真实官方历史快照。原合成记录移入 `src/lib/fixtures/`，只供隔离开发测试，不再作为产品默认数据或搜索主题。本版没有自动研究 Agent、定时更新、抓取服务或研究类 GitHub Actions。

详见[热度口径](docs/heat-method.md)、[实体契约](docs/data-contract.md)与站内方法页。

## 视觉与资产

先完成视觉参考板与六类高保真样张，再建立正式应用；Git历史保留独立视觉基准提交。用户选定清晰赛璐璐人物画法，并要求加粗线条。正式看板娘为原创成年黑发女仆，持纸质档案夹和铅笔，采用粗黑外轮廓、较细内部线和分层色块。

界面结合深墨蓝、暖白纸面、淡紫窗口、像素装饰、网点纹理、衬线标题与视觉小说对话框。80 款游戏卡面采用官方商店或游戏官网的代表图，详情页可查看图源。配方图与研究室插画为本站原创生成资产。参考作品官方图像不随产品打包。

- [六类样张索引](design/index.html)、[实际渲染PNG](design/previews/)
- [视觉规范](.design-scout/design-direction.md)、[样张验收](docs/visual-review.md)
- [角色正式资产](public/art/maid-cel.png)、[提示词与制作记录](design/image-prompts.json)

运行 `npm run preview:design` 可在输出的本地地址查看样张。

## 验证

```sh
npm run typecheck
npm test
npm run test:readlink
npm run build
npm run test:e2e
```

浏览器测试默认使用 Playwright Chromium，先执行 `npx playwright install chromium`；本机也可使用 Microsoft Edge。可用 `PLAYWRIGHT_CHANNEL` 指定其他已安装的Playwright浏览器通道。默认测试复用或启动 3000 端口的静态预览服务（先执行对应构建）；设置 `PLAYWRIGHT_BASE_URL` 可针对指定生产服务运行，届时不会启动开发服务。

测试覆盖分类身份、范围继承、五状态、共同供给、归因总量、导入边界、零数据与趋势、规则实验室，以及真实页面操作、图谱、手机布局、弹窗和减少动态。实际执行结果和环境限制记录在[验收报告](docs/verification.md)。

Windows exFAT可能对普通文件的`readlink`返回`EISDIR`，使Next文件追踪失败，本机已复现。`npm run build`在构建子进程内加载局部兼容入口：仅在Windows收到该错误、且`lstat`确认不是符号链接时规范为`EINVAL`。它不修改全局Node或依赖，其他平台直接执行原构建。[上游同类记录](https://github.com/vercel/next.js/discussions/77912)。

## 项目结构

```text
src/app/             页面与路由
src/components/      交互界面与动效
src/lib/             Zod实体、知识查询、热度与规则分析器、领域测试
src/data/            分类参考、类型阅读指引、搜索主题及真实来源快照
docs/research/       已核验来源、机制定义、真实案例与配方
design/              正式开发前的高保真样张、PNG与制作记录
public/art/          正式原创角色
tests/e2e/           浏览器验收
```

使用 Next.js、React、TypeScript、Motion、XYFlow、Zod、Vitest 与 Playwright，确切版本由package-lock.json固定。未提供远程后台、账户系统或真实全市场数据；本版本完整提供本地研究与演示流程。
