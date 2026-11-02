# GitHub Pages 发布验收

513 款目录、热门补档与标签审查的本轮结果见[当前验收](catalog-review/verification.md)。下文保留此前发布记录。

2026-11-02 的案例扩充、组合目录与漫画画风修正见[本轮验收](content-expansion/verification.md)。当前发布状态请查看对应提交的 [Pages 工作流](https://github.com/momowangOUO/game-mechanics-atlas/actions/workflows/pages.yml)。

当前机制图解、全站文案、品牌与机器阅读版本见[本轮验收](mechanic-visuals/verification.md)及 [Pages 工作流](https://github.com/momowangOUO/game-mechanics-atlas/actions/workflows/pages.yml)。下列为仓库转公开时的首发记录。

日期：2026-11-01（Asia/Shanghai）。用户明确要求将网站对应的原仓库改为公开，同时公布静态网站。

- 正式网站：https://momowangouo.github.io/game-mechanics-atlas/
- 分类参考：https://momowangouo.github.io/game-mechanics-atlas/taxonomy/
- 公开仓库：https://github.com/momowangOUO/game-mechanics-atlas
- 发布工作流：https://github.com/momowangOUO/game-mechanics-atlas/actions/runs/41284776480
- 本次网站部署源码：`5f4bde73499f01340841f6ebc206c7c29fb7bdfa`。后续文档提交只更新发布地址和验收记录，没有改变本次部署的网站内容。

## 实际结果

GitHub 仓库 API 返回 `visibility:PUBLIC`、`isPrivate:false`。Pages 已启用工作流发布，API 返回正式网址、`public:true` 与 `https_enforced:true`，仓库主页链接也已指向正式网站。

之前的构建产物已过期，因此重新执行了完整云端工作流。本次 build 与 deploy 两个任务均为 success；类型检查、78 项单元测试、内容完整性、静态服务器检查、来源解析及 55 项浏览器测试均通过，247 个静态页面生成成功。没有沿用此前因私有仓库套餐而失败的部署结论。

## 公网验证

匿名 HTTPS 请求验证首页、分类图鉴、机制详情、游戏详情、类型详情、图谱、实验室和搜索观察共 8 条路径，全部返回 200；首页引用的 43 项脚本、样式、图片与图标全部返回 200。实际响应记录见 [publication-http.json](publication-http.json)。

随后针对正式域名执行 4 项 Chromium 浏览器检查，全部通过：真实搜索资料披露、分类逐层进入与游戏实例、手机分类分页与返回、手机类型卡与证据布局。该检查访问公网 GitHub Pages，未使用本地预览服务，结果为 4 passed（17.7 秒）。

发布保留现有内容边界：历史搜索榜不冒充当前类别需求，未取得的真实需求保持为空；没有因公开上线重新启用合成热门榜。此次没有增加数据库、定时研究或抓取服务。
