# 数据实体与分类约束

本文说明当前本地实现的数据边界。`src/lib/model.ts` 已实现实体的 Zod schema，`src/lib/knowledge.ts` 提供知识库校验与范围查询，`src/lib/heat.ts` 提供搜索导入校验和分析器。数据来自随应用交付的资料与本标签页内存中的导入记录；当前没有数据库或远程数据服务。尚未实现的历史修订、循环步骤实体等设计在下文单独标明。

## 分类身份

原子机制只在 `Mechanic.dimension` 保存一个主维度ID。游戏实例、图谱节点、组合、搜索主题和比较结果通过 `mechanicId` 查回该字段，不另存一个可漂移的分类副本。

维度固定为：`interaction`、`rules`、`temporal`、`buildcraft`、`progression`、`economy`、`information`、`participants`、`variability`。扩展机制词表时不改变现有ID的含义；发现定义实质变化应新增ID、迁移并说明，不悄悄覆盖旧身份。

`CompositeGenre` 与 `Mechanic` 分开，前者可保存多个必要、常见、可选和排除特征。Roguelite、RPG、MOBA等名称不能直接通过原子机制字段写入。题材、画风、平台、叙事标签存在游戏元数据中。

## 作用范围

增加 `Scope` 记录，避免把作用范围藏在自由文本里。范围至少含 `id`、`gameId`、`kind`、`label`、可选 `parentScopeId` 与 `versionNote`。

`kind` 支持整个游戏、模式、系统、章节/阶段、角色/职业与版本。父范围必须属于同一游戏；引用不存在的模式或跨游戏父范围无效。记录日期是研究日期，不能冒充已经核验的游戏版本号。

`GameMode` 有独立ID、所属游戏ID、说明和默认研究范围。不同模式中的事实不能互相覆盖。展示“整个游戏包含此机制”和“标准模式中存在此机制”是不同查询。

`MechanicInstance` 通过 `scopeId` 和 `mechanicId` 表示断言。它不单独保存主分类维度。同一范围、机制和版本基线有一个当前断言，不能同时出现无条件的相反断言。历史修订保留来源与替换关系是后续约定；当前未实现历史版本库。

状态约束：

|状态|含义|额外要求|
|---|---|---|
|`present`|所指范围有此机制|来源或明确标记的编辑分析，含判定依据|
|`absent`|所指范围确定无此机制|必须记录反面证据/边界判定，不能来自“资料没提到”|
|`not_applicable`|此范围没有适用该定义的对象|解释不适用原因，不推导为整个游戏缺失|
|`unknown`|目前不能判断|记录资料缺口；未记录实例的查询结果同样是未知|
|`conditional`|某些明确条件满足时成立|非空条件、对应范围与证据|

条件本身是可显示的信息，不只保存一个布尔值。例如角色专属机制应引用角色范围；模式切换后存在的机制应引用模式范围。需要进一步限定解锁、阶段或选项时，记录原条件，不将它自动提升为父范围的 `present`。

## 实体分工

|实体|主要字段|职责|
|---|---|---|
|`Source`|id、title、url、publisher、checkedAt、type、claimScope|证据来源与实际核验范围；事实、设计分析和未确认内容分开|
|`Game`|id、name、studio、year、yearBasis、summary、metadataNote、sourceIds、defaultScopeId|游戏身份与玩法概要；年份保留首发/正式版口径|
|`GameMode`|id、gameId、name、description、scopeId|可独立比较的模式|
|`Scope`|id、gameId、kind、label、parentScopeId、versionNote|明确断言的作用对象|
|`Mechanic`|id、name、dimension、definition、inclusionRules、exclusionRules、misconceptions、designValue、risks、adaptation、complexity、implementationNotes|稳定定义和设计说明|
|`MechanicInstance`|id、mechanicId、scopeId、status、condition、evidenceKind、sourceIds、rationale|某个范围是否具备某机制|
|`CompositeGenre`|id、name、definition、requiredMechanics、commonMechanics、optionalMechanics、boundaries|复合类型配方和传统名称，不充当原子机制|
|`MechanicRelationship`|id、from、to、type、context、rationale、evidenceKind、sourceIds|依赖、协同、替代、冲突、供给、改写、反馈；不改变机制身份|
|`HybridRecipe`|id、name、mechanicIds、roles、synergies、tensions、demoQuestions、exampleGameIds、evidenceNotes|已编写的代表组合；与实验室自由组合结果区分|
|`SearchQueryStat`|id、datasetId、date、query、count、region、language、sourceKind、attributions|按日搜索事件输入；不含个人标识|
|`TopicHeatProfile`|topicId、kind、demand、directDemand、proxyDemand、supply、conditionalSupply、unknownSupply、blue、red、trend、trendStatus、scoreStatus、measurementStatus、measuredDays、expectedDays|从规范事件与知识库计算的主题结果；公式版本与日期范围保存在外层 `HeatAnalysis`|

其中 `HybridRecipe`、`CompositeGenre` 中的机制字段均为ID引用。字段为 `requiredMechanics` 表示本平台此配方的工作定义，不能冒充所有历史作品必须遵守的类型公理。表格列出主要字段，完整字段与枚举以对应 schema 和类型为准。

## 游戏页面与比较

资料核验支持的事实和编辑归纳分别存储。`coreLoop`、创新点、可借鉴之处通常是设计分析，不能与开发者自述混用来源身份。长文应拆为可视化数据与简短说明，但拆分不删除条件和反例。

比较以选定范围为基准，对同一个原子机制输出五状态之一。不能把某游戏没有实例的机制单元格渲染成“无”。资源经济和构筑另列结构说明，不把单一勾选矩阵当成完整比较。

当前循环图按 `Game.coreLoop` 文字列表展示，关系图引用独立关系数据，图谱节点进入同一个规范机制详情。独立循环步骤ID与有向边是后续数据结构约定，尚未实现。

## 查询与校验

当前实现采用 Zod 检查字段和枚举，`validateKnowledge()` 检查外键、唯一性、范围与跨实体关系；`getInstanceStatus()`、`getMechanicSupply()` 等查询保留未知和作用范围。schema通过不能证明内容属实，两者分开报告。

当前校验与查询的核心约束：

1. 所有机制只有一个有效维度，跨页面使用同一字段。
2. 复合类型ID不能出现在原子机制外键中。
3. 条件实例有条件、未知不补成否定、允许某维度无记录。
4. scope与mode、game外键一致，组合统计不跨范围拼接。
5. 每个真实案例保留来源；编辑定义不伪造外部权威。
6. 图谱和实验室所有ID引用存在，关系的两个端点不因视觉分组改变身份。
7. 搜索归因与来源合法，分数由公式计算，示例标记随导出保留。
8. 不要求所有游戏都有货币、构筑、成长、局次或PvP。

当前 `docs/research` 是应用使用的资料源，经 `knowledge.ts` 映射和校验后进入页面；原始资料文件本身不等于已验证所有玩法事实的数据库。校验只证明结构与引用满足约束，不证明来源覆盖完整。
