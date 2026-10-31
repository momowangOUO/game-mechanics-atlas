# 静态导出与 GitHub Pages 实施记录

更新于 2026-10-31。本轮完成静态构建、项目子路径兼容、纯静态预览和 Pages 工作流；未启用远端 Pages、提交或推送代码。源码仓库继续保持 private，工作流只上传 `out`。

## 构建与预览

项目继续使用已锁定的 Next.js 16.4.3、React 和 Playwright，没有新增依赖。`next.config.ts` 启用 `output: "export"` 和 `trailingSlash: true`，详情页既有 `generateStaticParams` 保留。构建产物包含页面各自的 HTML、客户端导航载荷和 `404.html`。

|用途|命令|访问路径|
|---|---|---|
|根路径构建|`npm run build`|生成 `out`|
|根路径预览|`npm run preview` 或 `npm start`|`http://127.0.0.1:3000/`|
|项目路径构建|`npm run build:pages`|生成 `out`|
|项目路径预览|`npm run preview:pages`|`http://127.0.0.1:3000/game-mechanics-atlas/`|

`PAGES_BASE_PATH` 在构建时确定，接受空值、`/` 或 `/game-mechanics-atlas`。`build:pages` 默认采用项目路径，显式环境变量可以覆盖；根路径构建默认采用空值。切换部署位置必须重新构建，并搭配相同挂载位置的预览命令。更换端口可使用 `npm run preview:pages -- --port=3101`。

预览由 `scripts/static-preview.mjs` 直接读取 `out`，不启动 Next 服务。目录地址补尾斜杠时保留查询串；未知页面和资源返回 HTTP 404，并使用导出的错误页，不将未知地址回退到首页。脚本同时处理 HEAD、资源 MIME、非法编码与越界路径。

## 查询与资源地址

`mechanics`、`graph`、`heat`、`lab`、`compare` 五个入口保留服务端页面与元数据，在 `Suspense` 内挂载客户端查询桥接。桥接通过 `useSearchParams` 读取地址，并以排序后的完整查询串作为工具组件的 key。查询键顺序和等价编码不会导致额外重建；参数变化会更新工具的初始筛选或选择。`AppProviders` 保持在全局布局层，没有查询 key。

重复参数沿用原来的多值处理：需要单值的字段不取第一个重复值；空值、缺失值和非法值仍走各工具既有的默认或提示逻辑。实验室配方、附加机制、重复附加与对比游戏回退逻辑从原入口迁移，未改规则。

Next Link 和路由器继续接收站内逻辑路径，由 Next 自动加前缀。`publicAssetPath` 只处理原生公共资源：所有 `ArtImage`、favicon 和现有 CSS 房间背景。CSS 仅替换这一处背景引用，没有调整样式。未改美术资源或图谱布局。

Playwright 的 `gotoApp` 为实际导航地址显式添加部署前缀，`appHref` 同时处理尾斜杠和查询串；没有仅把项目路径拼到 `baseURL`，避免 `goto("/...")` 丢失路径。既有 SVG 链接和本地数据会话测试保留。

## Pages 工作流

`.github/workflows/pages.yml` 仅由 `main` push 或手动触发，没有定时研究任务。构建任务执行 Node 24、`npm ci`、路由类型生成与类型检查、单元测试、Windows 兼容层测试、静态预览测试、项目路径静态构建，以及 Chromium 浏览器回归。Playwright 默认使用安装的 Chromium，不再默认选择 Edge。

本轮核对并采用的官方 action 发布版本为：checkout 7.0.1、setup-node 7.1.0、configure-pages 6.0.0、upload-pages-artifact 5.0.0、deploy-pages 5.0.1。构建任务只读取代码与 Pages 配置；部署任务取得 `pages: write` 和 `id-token: write`。部署内容只有 `out`，不上传源码树、研究目录、测试报告或私人映射。

## 实际验证

- 根路径 `npm run build` 成功，所有入口为静态页面或通过参数枚举生成的详情页。
- 首次根路径 Chromium 回归中，既有 34 项和新增 5 项静态专项通过。同轮并行新增的来源检索测试因构建时尚未包含新页面失败；重新构建后的项目子路径回归已覆盖并通过该项。
- `npm run build:pages` 成功。随后在 `/game-mechanics-atlas/` 的纯静态预览运行 27 项回归，全部通过：包含查询直达、刷新、查询切换、历史回退、多值参数、配方错误提示、对比回退、图片与 favicon、CSS 背景、真实 404、SVG 导航保留导入数据、来源检索、移动端和实验室交互。
- `npm run typecheck` 通过；命令先执行 `next typegen`，适用于没有 `.next` 的新检出环境。
- 查询兼容单元测试 2 项、静态服务器测试 2 项、既有 readlink 兼容测试 24 项全部通过。较早一次完整单元测试为 60 项通过；资料与图谱扩展合并后的总数和完整回归由最终集成验收记录。

本机实际运行环境为 Windows、Node 24.11.1、Playwright 1.64.1 与其安装的 Chromium。官方文档和 action 源码核对用于确认能力与接口；以上测试结果只对应本机执行。本轮未运行 GitHub Actions，也未验证线上 Pages 地址。最后的资料合并、完整回归、账号 Pages 可用性与远端部署由发布步骤继续确认。

## 采用依据

复用现有 Next.js 静态导出和官方 Pages actions，补充无依赖的本地静态预览与查询桥接。没有引入新的站点框架或部署服务。

- 本机安装包文档：`node_modules/next/dist/docs/01-app/02-guides/static-exports.md`，以及 `use-search-params`、`basePath`、`trailingSlash` 和 `next typegen` 对应指南。
- [Next.js 静态导出](https://nextjs.org/docs/app/guides/static-exports)与 [useSearchParams](https://nextjs.org/docs/app/api-reference/functions/use-search-params)。
- [Next.js 官方 Pages 示例](https://github.com/nextjs/deploy-github-pages)与 [GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
- [官方上传 action](https://github.com/actions/upload-pages-artifact)与[官方部署 action](https://github.com/actions/deploy-pages)，二者采用 MIT 许可；本项目引用发布 action，没有复制其实现。
