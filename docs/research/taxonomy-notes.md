# 机制分类与证据边界研究

核验日期：2026-10-30。本文是知识库的研究材料，不代表行业统一分类。原子机制、复合类型与组合配方分别维护；不能用类型标签自动填充游戏机制。

## 可复用资源

本轮搜索使用“game design mechanics taxonomy dataset license”和“Steam official … game”等互补查询，读取了以下仓库的说明、许可证及首个仓库的 JSON Schema：

| 资源 | 核验结果 | 本项目处理 |
| --- | --- | --- |
| [Open Game Mechanics Dataset](https://github.com/Thaelith/open-game-mechanics-dataset) | [数据许可证](https://raw.githubusercontent.com/Thaelith/open-game-mechanics-dataset/main/LICENSE)为 CC0；标记为 MIT 的工具单列。存在参数、边界、关系和游戏参考字段；项目自己声明许多内容仍是种子材料。 | COMPOSE：借鉴记录边界与关系的方法，不直接导入游戏断言；其分类与固定九维不一致，转换成本高于小规模原创种子。 |
| [Game Design Index](https://github.com/blazium-games/game-design-index) | [许可证](https://raw.githubusercontent.com/blazium-games/game-design-index/main/LICENSE)为 MIT；提供静态 JSON API 与游戏拆解。 | 用作后续候选发现来源。本轮没有导入数据、代码或名称说明；若未来复制内容须保留许可证。 |

选择：保留用户指定九维和实例状态，原创编写初始条目，逐款回到开发者或发行商正式页面核验。本轮没有安装依赖或运行第三方项目；“读过源码/schema”和“实测通过”分开。

## 固定九维

一个原子机制只有一个 `dimension`。跨维度的关联通过 `requires`、`modifies`、`feeds` 等关系表达，不重复建立同义条目。维度按它直接改变的规则对象分配；不是按界面出现在哪一页分配。

| dimension | 中文展示名 | 直接回答的问题 | 边界 |
| --- | --- | --- | --- |
| interaction | 操作与交互 | 玩家怎样对角色、物体或空间发出动作？ | 移动、瞄准、旋转、拖放。伤害结算不在此维。 |
| rules | 规则、目标与挑战 | 状态在什么条件下如何改变，怎样判定结果？ | 伤害、连锁、阈值与规则修饰。结束后重新建立尝试另归 temporal，死亡后不可恢复的状态另归 progression。 |
| temporal | 时间、流程与重置 | 行动按什么顺序、时限和流程推进，何时重建尝试？ | 回合、实时、冷却、暂停与重开。难度随状态变化不自动等于计时。 |
| buildcraft | 能力配置与构筑 | 玩家怎样组合、修改和安排可用能力？ | 卡组、装备、布局与成长重配。材料向产出的转化另归 economy，规则变化本身另归 rules。 |
| progression | 状态持久性与成长 | 哪些状态、能力或权限随进度变化、保留或不可恢复地丢失？ | 等级、跨局强化、路线解锁与角色永久死亡。重新分配成长选项另归 buildcraft。 |
| economy | 资源、约束与经济 | 资源怎样产生、转化、共享、流通、消耗与兑现？ | 采集、生产、交易、配方转化、共享余额与撤离。能力组合另归 buildcraft。 |
| information | 信息与认知 | 谁能知道什么，什么时候知道？ | 预告、迷雾、预览、线索、日志。未向研究者公开不等于游戏的信息机制。 |
| participants | 参与者与关系 | 哪些行动者合作、竞争或分工？ | PvP、合作、异步对手、控制权。仅有联网功能不能推出竞争。 |
| variability | 变化与随机 | 哪些内容通过何种变化过程被决定？ | 随机抽取、布局生成、固定种子。剧情分支不自动等于随机。 |

## 原子机制候选（72项）

这些是待统一 schema 的词表候选。条目的定义是本项目的操作口径，不能单凭某款游戏具有相近名称就填写 `present`。其中尚未有游戏证据的候选继续保持未绑定。

### interaction：操作与交互（8）

| ID | 名称 | 最小判定与排除项 |
| --- | --- | --- |
| direct-movement | 直接移动 | 输入直接改变可控对象位置；排除仅选择路线节点。 |
| aimed-launch | 瞄准发射 | 玩家设定方向或目标后发射对象；排除纯随机投射。 |
| dodge-move | 闪避位移 | 玩家主动触发以避开威胁的移动；无敌窗口是可选附加规则。 |
| piece-rotation | 物件旋转 | 玩家改变物件朝向；不要求网格或特定角度。 |
| drag-placement | 拖放布置 | 拖动对象到合法位置；空间加成另归构筑。 |
| block-editing | 环境方块改造 | 玩家增删构成环境的方块；排除只摆装饰的预设槽。 |
| target-selection | 目标选择 | 玩家从合法对象中指定受作用者；与瞄准弹道可同时存在。 |
| active-interaction | 主动交互 | 玩家触发与物体或角色的上下文动作；对白内容不由此推断。 |

### rules：规则、目标与挑战（7）

| ID | 名称 | 最小判定与排除项 |
| --- | --- | --- |
| score-threshold | 分数达标 | 累积分数达到目标触发通过；排除仅显示成绩。 |
| line-completion-clear | 满行消除 | 完成规定横行后清除组成物；不等同三消。 |
| automatic-resolution | 自动战斗结算 | 战斗执行主要由预设行为自动推进；准备阶段可手动。 |
| stacking-effects | 效果叠加 | 同类或异类效果按明确规则组合；不默认相乘。 |
| chain-trigger | 连锁触发 | 一个效果的结果触发另一个效果；纯同时播放动画不计。 |
| rule-modifier | 规则修饰器 | 特定有效效果改变结算条件、对象或计算方式；组件的选择配置另建关系。 |
| health-damage | 生命伤害 | 伤害事件扣减目标生命状态；不是所有失败条件都具有生命值。 |

### temporal：时间、流程与重置（10）

| ID | 名称 | 最小判定与排除项 |
| --- | --- | --- |
| sequential-turns | 轮流行动 | 参与者按回合顺序获得行动权限；不等同所有卡牌游戏。 |
| real-time-update | 实时推进 | 输入间隔中世界状态仍按时钟变化；不要求多人。 |
| action-cooldown | 行动冷却 | 使用后必须等待时间才能再次使用；排除只按消耗品数量限制。 |
| planning-timer | 规划时限 | 决策阶段存在截止时刻；不从整局计时推断。 |
| pause-planning | 暂停规划 | 世界时钟停止时允许改变后续决策；打开菜单但不能操作不计。 |
| scheduled-cycle | 周期日程 | 内容按日夜、周或季节等时段反复出现；是否现实时间另记。 |
| time-pressure-scaling | 随时间增压 | 压力明确由经过时间驱动；波次加压不一定属于此项。 |
| optional-endless-loop | 可选延长流程 | 玩家能在通常结束节点选择继续循环；不是单纯失败后重开。 |
| run-reset | 单局重开 | 失败或结束清除当前尝试的局面并重建尝试；不推断删除存档或角色永久死亡。 |
| route-branching | 路线分支 | 流程中可选择后续路径；只是视觉岔路但无选择不计。 |

### buildcraft：能力配置与构筑（7）

| ID | 名称 | 最小判定与排除项 |
| --- | --- | --- |
| in-run-deck-growth | 局内扩充卡组 | 在当前尝试中获得新卡，并纳入可使用卡组；排除只在局外收藏。 |
| loadout-selection | 出战配置 | 开始遭遇前选择携带能力/物品；不要求稀有度。 |
| spatial-loadout | 空间装备配置 | 构筑对象占用空间，位置或形状影响合法配置/效果；不是单纯列表排序。 |
| adjacency-synergy | 邻接增益 | 构筑对象的邻接关系改变效果；需要逐项证据，不能从背包题材推断。 |
| skill-modification | 技能改造 | 更换或改变技能的行为结构；角色等级提升不自动计入。 |
| encounter-placement | 遭遇布置 | 玩家通过组件配置决定敌人或遭遇在流程中的出现位置。 |
| respec | 成长重配 | 可以撤回已分配成长再配置；普通换装不计。 |

### progression：状态持久性与成长（7）

| ID | 名称 | 最小判定与排除项 |
| --- | --- | --- |
| persistent-stat-upgrade | 跨局数值强化 | 在明确重开边界之后仍保留的数值增强；不等同局内临时增益。 |
| persistent-unlock | 持久内容解锁 | 获得后续可用内容或权限；解锁物品池不保证立刻拥有物品。 |
| skill-experience | 技能经验成长 | 指定行为或奖励累计经验并改变技能等级。 |
| relationship-progression | 关系发展 | 累积互动改变与角色的关系状态或内容权限。 |
| ability-gated-access | 能力门槛通行 | 获得能力后能进入此前不可达区域；钥匙门需单列条件。 |
| objective-unlock | 目标条件解锁 | 完成明确目标开启新权限；不强行规定奖励来自战斗。 |
| permadeath | 角色永久死亡 | 对指定存档/挑战范围，角色死亡不可常规恢复；必须写明损失对象，不等同重新开始一次尝试。 |

### economy：资源、约束与经济（10）

| ID | 名称 | 最小判定与排除项 |
| --- | --- | --- |
| resource-gathering | 资源采集 | 从世界或节点取得可使用资源；奖励结算可采用其他来源子类。 |
| resource-scarcity | 资源稀缺 | 范围内的可用量构成实际选择约束；资源数字存在不证明稀缺。 |
| production-investment | 生产投资 | 消耗资源购买未来持续产出的能力。 |
| shop-purchase | 商店购买 | 以明确成本换取商品；不从出现商店界面推断货币类型。 |
| shop-reroll | 商店刷新 | 重新生成当前商品选项；概率与是否收费另记。 |
| toll-payment | 过路支付 | 满足位置经过/停留条件时向拥有者支付资源。 |
| extraction-bank | 撤离兑现 | 达到退出条件后才将本次收益转入可保留状态；必须列出例外。 |
| base-construction | 基地建设 | 将资源投入可保留的设施；设施布局效果可关联 buildcraft。 |
| recipe-crafting | 配方制作 | 按输入组合把材料或组件转化为产出；能力配置与配方的取舍另归 buildcraft。 |
| shared-resource-pool | 团队共享资源 | 多位行动者支取/补充同一余额，一方使用影响其他方可用量；参与者权限另建关系。 |

### information：信息与认知（8）

| ID | 名称 | 最小判定与排除项 |
| --- | --- | --- |
| intent-preview | 行动意图预告 | 执行前展示某行动者未来行动信息；不要求完全精确。 |
| next-piece-preview | 后续对象预览 | 当前决策前显示后续将出现的对象；不要默认所有 Tetris 版本都有。 |
| hidden-hand | 隐藏手牌 | 手牌身份对至少一方隐藏；卡背美术本身不证明对谁隐藏。 |
| fog-of-war | 战争迷雾 | 区域信息受探索或侦察权限限制；普通黑暗不一定构成。 |
| environmental-clues | 环境线索 | 玩家从场景信息推断规则/解谜条件；装饰背景不计。 |
| consequence-preview | 后果预览 | 确认动作之前显示其预期结果；实际随机结果仍可能变化。 |
| codex-discovery | 发现记录 | 通过探索获得可再次查阅的对象知识；纯成就列表不必算。 |
| probability-disclosure | 概率公开 | 玩家可见相关随机事件的概率信息；研究者知道概率不等同公开。 |

### participants：参与者结构（7）

| ID | 名称 | 最小判定与排除项 |
| --- | --- | --- |
| cooperative-play | 玩家合作 | 多位玩家围绕共享或相容目标行动；同屏不自动证明合作。 |
| pvp-opposition | 玩家竞争 | 玩家行动可直接影响彼此胜负；排行榜比较另列。 |
| asynchronous-opponent | 异步对手 | 对手贡献的状态可在其不同时在线时参与结算；不能将所有自动战斗视为异步。 |
| synchronous-session | 同步会话 | 多位玩家在同一时间窗口共同影响当前对局；不限实时操作。 |
| team-roles | 团队分工 | 规则或能力为团队提供有区别的职责；选不同外观不计。 |
| controllable-party | 可控队伍 | 单位控制权覆盖多个成员，并允许分别分配行动。 |
| leaderboard-comparison | 榜单比较 | 按统一的成绩标准比较参与者；不等同直接 PvP。 |

### variability：变化与随机（8）

| ID | 名称 | 最小判定与排除项 |
| --- | --- | --- |
| random-upgrade-offer | 随机强化候选 | 从候选池抽取玩家可选强化；“每局不同”本身证据不够。 |
| random-draw | 随机抽取 | 按随机过程决定下一张/个对象；顺序未知不一定随机。 |
| dice-roll | 掷骰取样 | 掷骰结果参与状态决定；实际骰面概率需另核验。 |
| generated-layout | 布局生成 | 系统生成关卡布局；排除只随机挑选完整手工场景。 |
| randomized-encounters | 遭遇变化 | 抽取或变换敌人/事件集合；不要求几何变化。 |
| seeded-replay | 种子重现 | 给定种子可重现规定范围的随机过程；不默认跨版本也能保持一致。 |
| random-loot | 随机战利品 | 奖励对象由随机过程决定；随机属性与随机类别可分别扩展。 |
| variable-start | 变化起始条件 | 开局时关键条件发生变化；玩家主动选职业不自动等于随机。 |

## 易混条目的判定

- **自动攻击、自动战斗与放置不同。** 自动攻击只描述攻击触发方式；自动战斗还包含执行阶段的自动结算；放置强调玩家暂不输入时仍有有效进展。可关联，不能彼此替代。
- **卡牌载体、卡组构筑与牌组随机抽取不同。** 有卡牌不保证能修改卡组；能构筑不保证能在局内构筑；局内构筑也不保证随机抽牌。Balatro、Slay the Spire、Inscryption 应分别保留证据。
- **单局重开与永久死亡不同。** 写清重置的是当前局面、角色还是存档；Dead Cells 的跨局解锁不应被“永久死亡”一词抹掉。
- **随机关卡与随机选关不同。** Risk of Rain 2 官方既描述手工场景，也描述场景/敌人/物品变化。可记录内容抽取，但不能据此断言所有空间布局都由程序生成。
- **背包空间与道具邻接不同。** Backpack Battles 商店明确位置重要，但每件物品的邻接规则仍需单独取证。
- **建造与配方不同。** 基地设施投资、材料按配方转化为产出，记入 economy；空间与能力配置记入 buildcraft。一个操作可涉及多个机制，但原子条目不复制。
- **路线分支归 temporal。** 当前定义直接改变流程路径；节点点击可关联 interaction；解锁能力后长期获得新区域的通行权限，另记 progression；路径的随机生成另归 variability。
- **资源共享归 economy。** 当前定义直接描述共享余额及支取对余额的影响；参与者的使用权限可单独关联，但不改变资源机制的主维度。

本轮按“直接改变什么对象或过程”复核研究稿，不要求各维度的条目数量相同：`run-reset → temporal`、`route-branching → temporal`、`rule-modifier → rules`、`recipe-crafting → economy`、`respec → buildcraft`、`shared-resource-pool → economy`、`permadeath → progression`。这些修订发生在正式数据库建立之前；后续页面运行时须引用相同的机制ID与定义版本。
- **MOBA 风格不是 MOBA 规则证明。** 梦之形官方使用这一风格描述，已核验的是动作构筑与合作，未据此添加推塔、兵线、PvP或补刀机制。

## 五种实例状态

| status | 含义 | 最低证据要求 |
| --- | --- | --- |
| present | 在指定范围确实存在 | 可指向支持该机制的直接说明，或明确标注的实际观察。 |
| absent | 该机制对范围有意义，但已确认不具备 | 需要直接反证或覆盖充分的规则说明；不能由商店未提及产生。 |
| not_applicable | 机制的前提在范围内未建立，问题不适用 | 先指出缺失的前提，并有证据支持；不能用它绕过未知。 |
| unknown | 证据不足、未核验或来源冲突 | 保留未知原因和下一步证据需求；默认未填项为此状态。 |
| conditional | 仅在明确条件下成立 | 写出模式、选项、版本、角色或事件条件及对应来源。 |

本批 `game-evidence.json` 没有为了凑齐状态示例给真实游戏添加否定。唯一 `absent` 是官方明确无限资源的 Minecraft 创造模式中的基础建造资源稀缺，范围不能扩大到自定义服务器。未使用 `not_applicable`；尚无实例具备足够证据，能确认该机制所需的前提不成立。Backpack Battles 的大厅计时、Cult of the Lamb 的特殊永久死亡挑战等采用 `conditional`。

建议最小实例字段：`gameSlug`、`mechanicId`、`status`、`scope`、`sourceRefs`、`verifiedAt`、`note`。`scope` 后续可结构化为平台、模式、版本、设置、章节和角色；未知版本不要伪装成精确版本号。来源另加 `evidenceType`（官方规则/官方宣传/本机观察/开发者访谈），避免将宣传说明当作实际测试结果。

否定查询不应写成“没有这个标签”。筛选“没有机制 X”时只命中相应范围的 `absent`；未知默认显示为“尚未核验”。把 `conditional` 混入 `present` 时，界面必须保留条件。

## 复合类型候选（12项）

这些是多机制组合或已有类型词，不进入原子维度表。以下组成用于检索解释，不是排他性的行业定义；实际实例仍依证据维护。

| ID / 类型 | 可用于说明的组成 | 边界建议 |
| --- | --- | --- |
| roguelite / Roguelite | 单局尝试、重开、内容变化，常伴跨局成长 | 不把跨局数值成长设为全行业必要条件；官方标签与本项目画像并列。 |
| traditional-roguelike / 传统 Roguelike | 常见回合/网格、复杂局面、重开与随机探索 | “传统”存在争议，不用单项计分硬判真假；记录采用的定义来源。 |
| rpg / 角色扮演 | 能力发展、角色配置、任务或身份扮演 | 数值升级单独存在不足以判为 RPG。 |
| action-rpg / 动作角色扮演 | 直接操作战斗与角色成长/配置 | 自动战斗与动作判定并存时按具体模式说明。 |
| deckbuilder / 卡组构筑 | 组成可用卡组、获取/移除/修改卡牌、使用卡组 | 卡牌对战不自动有构筑；局内与局外构筑分别说明。 |
| auto-battler / 自动战斗构筑 | 准备配置、自动执行、结果驱动调整 | 不要求一定有棋盘、同步多人或随机商店。 |
| survivor-like / 生存割草 | 持续敌群、位置应对、周期成长选择 | 不把任何“活到最后”的游戏都收入；自动攻击可选且另证。 |
| extraction-shooter / 撤离射击 | 射击、风险收益、进入/退出、带出结算 | PvP不是所有衍生玩法的必需条件；失败损失需明确例外。 |
| metroidvania / 类银河恶魔城 | 互联探索、能力门槛、旧区新通路 | 平台跳跃和地图分支单独不足；Dead Cells 的官方用语为 inspired。 |
| farming-life-sim / 农场生活模拟 | 生产经营、日程、社交与自主目标 | 有种植系统不必就是农场生活模拟。 |
| sandbox-survival / 沙盒生存 | 自主目标、环境改造、资源约束与威胁 | Minecraft 创造模式属于不同条件画像，不能继承生存资源稀缺。 |
| incremental-idle / 增量放置 | 生产投资、增长、输入间隔仍进展及长期目标 | 点击、自动生产、离线收益分别取证；不默认所有增量作品都有离线收益。 |

## 组合配方候选（10项）

配方是设计假设，表示值得一起试验的机制和张力，不表示已证明的成功公式。参考游戏只指向相关切面，不代表完整复制或全部原子机制已经核验。

| 配方 | 原子机制组合 | 预期体验与约束 | 最小验证问题 / 参考切面 |
| --- | --- | --- | --- |
| 规则放大计分 | score-threshold + rule-modifier + stacking-effects | 以清楚的目标承载逐步复杂的计分；避免不透明乘区。 | 玩家能否解释一手分数为何变化？参考 Balatro 的牌型与小丑牌。 |
| 瞄准带动构筑 | aimed-launch + in-run-deck-growth + randomized-encounters | 技术判断与配置互相补充；要让玩家看清碰撞过程。 | 同一构筑是否保留有意义的瞄准差异？参考 Peglin 的弹珠与遗物；“卡组”口径需谨慎。 |
| 路线与卡组协同 | route-branching + in-run-deck-growth + resource-scarcity | 通过选路决定将要面对的风险与奖励；注意信息量。 | 玩家能否根据构筑解释选路？参考 Slay the Spire；资源类型需另证。 |
| 重试推进关系 | run-reset + persistent-stat-upgrade + relationship-progression | 重试也推进局外内容；避免强迫失败刷对话。 | 失败后是否仍有可理解的新行动？参考 Hades 的逃脱与关系。 |
| 外出供给营地 | randomized-encounters + resource-gathering + base-construction | 战斗所得用于经营；避免一边的杂务拖累另一边的节奏。 | 两个循环各有什么输入、产出与暂停点？参考 Cult of the Lamb。 |
| 布局构筑观战 | spatial-loadout + recipe-crafting + automatic-resolution | 准备是主要决策，战斗承担检验；需要可读反馈。 | 玩家能否从失败中找出布局需要改的地方？参考 Backpack Battles。 |
| 自建风险路径 | encounter-placement + stacking-effects + base-construction | 玩家配置资源来源，也设置威胁；不能无代价堆收益。 | 玩家能否看清每次新增遭遇带来的风险？参考 Loop Hero；具体叠加需另证。 |
| 搜集还是撤离 | resource-gathering + resource-scarcity + extraction-bank | 带出前收益存在风险；失败损失过重可能压制尝试。 | 玩家何时认为继续探索不划算？参考 Escape from Tarkov 的撤离目标；容器/保险例外另证。 |
| 增长再投资 | production-investment + persistent-unlock + objective-unlock | 用新生产选项维持增长目标；避免只有数字膨胀。 | 每次投入是否带来新的选择，而非纯等待？参考 Cookie Clicker。 |
| 位置财产竞争 | dice-roll + toll-payment + pvp-opposition | 随机位置与技能干预共同制造局势；避免胜负过早失去悬念。 | 落后者是否仍有规则允许且有效的反制手段？参考 Game of Dice；概率与反制强度未核验。 |

## 本批证据覆盖与下一步

已读取18款指定游戏的官方或开发者/发行商商店页面。除 Tetris 的品牌基础规则、Minecraft 的官方概览、Game of Dice 的 Android 商店外，主要为 Steam 开发者商品介绍。Game of Dice 年份补读 JOYCITY 官方历史；梦之形身份在官方简体中文 Steam 页核对，并用开发者署名的 PlayStation Blog 作补充。

《梦之形》确认是 Lizard Smoothie 开发、NEOWIZ 发行的 Steam app 2444750；PC 正式版为2025。Peglin 的2024、Backpack Battles 的2025、Escape from Tarkov 的2025均采用当前商品页正式版年份。Cookie Clicker 采用官方介绍确认的原作2013，并注明 Steam 版本2021。Tetris 采用原始设计1984，开发者字段因此直接写原作者，不编造当年的工作室。

本轮没有安装游戏、逐条实测、读取所有补丁、核验概率和商业数值，也没有下载图片。商店介绍支持的是能力与一般流程，不能代替详细结算手册。Tarkov 当前商店正文主要是图片，文本证据限于简介与功能；没有推断保险、清档、特殊容器和所有模式的损失规则。Slay the Spire 的能量、敌意图和抽弃牌细则，Vampire Survivors 的自动攻击、武器进化和关卡时长，均保留后续官方详细资料或实际观察需求。

`game-evidence.json` 的 `factNotes` 是短事实归纳；`analysis`、`coreLoop`、`learning` 是设计归纳，不伪装成开发者结论。`mechanicEvidence` 为稀疏实例，只覆盖已取得足够直接说明的切面；没有填充18款游戏与72个候选机制的完整对应矩阵。
