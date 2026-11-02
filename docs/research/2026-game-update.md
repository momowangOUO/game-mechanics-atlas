# 2026 年游戏案例补充

核验日期：2026-11-02。本次新增《影之刃零》与《魔物猎人旅人》，只收录可由官方现行页面支持的机制。没有安装试玩；玩法循环、分析和可借鉴之处均标为编辑归纳。原有案例保留各自的核验日期，不因这次新增而统一改成已在今天复核。

目录现为 82 款游戏、718 条机制实例、156 项来源、215 个研究范围与 127 项模式记录；机制分类仍为 9 个维度、122 项原子机制。

| 案例         | 年份依据                                                                                                     | 本次机制记录                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| 影之刃零     | Steam 商店显示 2026-10-28；PlayStation 文章列 PS5 为 10 月 29 日。保留平台页面各自的日期，不合并为同一时刻。 | PS5 单人范围的近身攻击、闪避位移、时机招架、姿态击破、战斗资源转换、战利品获取、能力门槛，共 7 条。 |
| 魔物猎人旅人 | 国际版 FAQ 和 CAPCOM 公告列 2026-10-29；中国大陆版在公告中另列为 2027 年起。                                 | 基础探索的采集与近身攻击、4 人组队的合作／同步会话／职责差异、Rhodes 的战斗资源转换，共 6 条。      |

《影之刃零》的作品概况与年份分别查阅 [Steam 官方商店](https://store.steampowered.com/app/4115450/Phantom-Blade-Zero/) 和 [PlayStation 官方游戏页](https://www.playstation.com/en-us/games/phantom-blade-zero/)。[2026-10-28 的 PlayStation 战斗与探索详解](https://blog.playstation.com/2026/10/28/phantom-blade-zero-how-boss-weapons-transform-combat-and-exploration/)支持这次 PS5 机制记录。文章署名为平台博客撰稿人，资料类型没有冒称开发者自述。普通连段描述不足以确认本站定义的“连续成功计数”，该项保持未知。

《魔物猎人旅人》的上线与平台信息由[国际版上线 FAQ](https://monsterhunteroutlanders.com/en/news-monster-hunter-outlanders-official-launch-faq.html)及 [CAPCOM 发行公告](https://www.capcom.co.jp/ir/english/news/html/e260929.html)交叉核对。[Google Play 的发行方产品说明](https://play.google.com/store/apps/details?id=com.tencent.mhadv&hl=en)明确支持与好友组成 4 人狩猎小队；角色职责、Rhodes 能量和野外采集取自[官方网站](https://monsterhunteroutlanders.com/en/index.html)。基础探索、联机与角色范围分别存储；不会把某个角色的能量规则当作全游戏通用规则。

设施建设的保留方式、付费抽取细则、跨平台互通、精确战斗数值及未核验的后续更新均不补写。联机和角色范围尚无独立循环时，页面继续显示“这个模式的循环还未整理”。

两款代表图均来自官方页面。《影之刃零》使用 PlayStation 主视觉，《魔物猎人旅人》使用 CAPCOM 2026 年公告配图；只等比缩小并转换为 WebP，没有生成或重绘。图源 URL、原始图片及输出 SHA-256、核验日期保存在 `src/data/game-art-sources.json`。来源页面的采集 SHA-256 写入对应来源的 `verificationNote`；完整页面仅保存在忽略的 `.build` 中。

数据检查已通过全量 schema 加载、引用与范围验证。另行断言了基础探索不继承合作、合作不继承 Rhodes 能量、普通连段不自动确认为连续成功计数。生产构建与发布验收由本轮最终验证统一进行。
