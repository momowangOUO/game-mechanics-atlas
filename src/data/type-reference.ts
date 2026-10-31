/** Reading guides are editorial design analysis, not formal genre tests. */
export type TypeReference = {
  id: string;
  playerTask: string;
  loop: [string, string, string];
  designQuestion: string;
  compareId: string;
  difference: string;
};
export const typeReferences: TypeReference[] = [
  {
    id: "roguelite",
    playerTask: "在一次次有限尝试中，用当局获得的选择应对变化的挑战。",
    loop: [
      "进入新的一局，面对变化的起点或遭遇",
      "选择奖励与路线，形成当局解法",
      "结束尝试，按规则重建局面并再次挑战",
    ],
    designQuestion:
      "重开的变化能否让玩家调整策略，而不仅是重复前一局？哪些进展值得保留？",
    compareId: "traditional-roguelike",
    difference:
      "Roguelite 常用于更宽泛的跨玩法组合；传统 Roguelike 的讨论更强调轮流行动、空间探索与系统交互。不能只凭永久升级区分。",
  },
  {
    id: "traditional-roguelike",
    playerTask: "在逐步推进的未知环境中，权衡每一次行动和有限资源。",
    loop: [
      "观察当前位置、敌人和可用物品",
      "作出行动，让世界按规则回应",
      "管理消耗与风险，继续探索或承担重开后果",
    ],
    designQuestion: "玩家能否利用规则知识处理意外，而非完全依赖当局随机运气？",
    compareId: "roguelite",
    difference:
      "传统 Roguelike 不是所有带随机地图和重开的作品；更宽泛的 Roguelite 也可以采用实时动作、弹珠或自动战斗。",
  },
  {
    id: "rpg",
    playerTask: "围绕角色身份与能力发展，在世界中选择行动和成长方向。",
    loop: [
      "接受情境、任务或角色目标",
      "通过战斗、对话或探索解决问题",
      "改变能力与关系，进入新的选择",
    ],
    designQuestion: "角色配置和扮演选择是否真正改变解决问题的办法？",
    compareId: "action-rpg",
    difference:
      "RPG 可以采用回合、实时、对话等不同交互；动作 RPG 进一步要求玩家的即时操作在行动结果中发挥作用。经验条本身不足以判类。",
  },
  {
    id: "action-rpg",
    playerTask: "一边直接操作角色应对战斗，一边调整装备、能力和成长方向。",
    loop: [
      "规划角色配置并进入战斗",
      "移动、攻击或闪避，寻找行动机会",
      "获得资源并调整能力，挑战新的敌人与环境",
    ],
    designQuestion:
      "操作技巧与角色数值分别承担多少胜负责任？配置是否改变操作方式？",
    compareId: "soulslike",
    difference:
      "动作 RPG 覆盖面更广；类魂通常还涉及其特有的风险、恢复、探索和战斗节奏讨论，不能把全部动作 RPG 都叫作类魂。",
  },
  {
    id: "deckbuilder",
    playerTask: "通过加入、移除或调整卡牌，改变后续能够抽到和使用的行动组合。",
    loop: [
      "取得可用卡牌并判断当前卡组缺口",
      "使用卡组处理战斗或计分问题",
      "选择卡牌与改造机会，重新影响抽牌和行动",
    ],
    designQuestion:
      "新牌是在增加选择，还是稀释卡组？删牌、过牌和资源转换是否形成取舍？",
    compareId: "digital-card-duel",
    difference:
      "卡组构筑关注卡组如何被建立和改变；数字卡牌对战关注对手互动。前者可以单人、也可以在一局里构筑，二者并非互斥类型。",
  },
  {
    id: "auto-battler",
    playerTask: "先安排单位、装备或站位，再观察自动战斗并调整下一轮方案。",
    loop: [
      "购买或选择组件，安排阵容与空间",
      "系统自动执行战斗，暴露组合的优缺点",
      "根据对手和结果调整配置",
    ],
    designQuestion:
      "玩家能否从自动结果中读懂因果，并在下一次配置中作出有效修正？",
    compareId: "tactical-turn-based",
    difference:
      "自动战斗将主要决策集中在准备阶段；回合战术通常允许在交战过程中逐次指定行动。自动结算不等于没有策略。",
  },
  {
    id: "survivor-like",
    playerTask: "在持续增长的压力中移动求生，用阶段性升级形成清场能力。",
    loop: [
      "移动并处理成群敌人带来的空间压力",
      "取得经验或掉落，选择强化",
      "在更高密度的敌群中检验当局组合",
    ],
    designQuestion:
      "移动、升级和目标选择能否继续提供有意义的决策？如果采用自动攻击，玩家还需要判断什么？",
    compareId: "roguelite",
    difference:
      "生存割草描述持续敌潮与成长的玩法组织；Roguelite 描述更宽泛的局次变化结构。可重叠，但并非所有 Roguelite 都有割草敌潮。",
  },
  {
    id: "extraction-shooter",
    playerTask:
      "携带有价值的装备进入危险区域，搜集收益并决定何时带着战利品撤离。",
    loop: [
      "配置带入装备，选择行动目标",
      "搜集、交战或回避对手，积累携带风险",
      "选择撤离窗口，按结果结算保留或损失",
    ],
    designQuestion:
      "继续搜集的潜在收益，是否足以让玩家重新权衡已经到手的物品？",
    compareId: "tactical-shooter",
    difference:
      "战术射击不必包含带入、带出和持续库存损失；撤离射击的关键研究问题是撤离结算与局外财产如何影响局内风险。",
  },
  {
    id: "metroidvania",
    playerTask: "在互相连通的区域中获得新能力，再回到旧地点打开新的路线。",
    loop: [
      "探索地图并识别暂时无法通过的障碍",
      "获得会改变通行能力的工具或动作",
      "重访旧区域，进入新的空间与挑战",
    ],
    designQuestion:
      "玩家记住的障碍能否与新能力自然对应？回访是否带来新的空间理解？",
    compareId: "precision-platformer",
    difference:
      "类银河恶魔城关注能力门槛与连通地图；精确平台跳跃关注动作执行。拥有跳跃不代表采用了同一种探索结构。",
  },
  {
    id: "farming-life-sim",
    playerTask:
      "安排农作、采集、交易与社交，把有限日程逐渐组织成自己的生活节奏。",
    loop: [
      "判断日期、资源与个人计划",
      "耕种、采集、交易或与居民互动",
      "收获并改善设施或关系，安排下一个周期",
    ],
    designQuestion:
      "多条日常活动线能否让玩家按偏好取舍，而非每天完成同一张任务清单？",
    compareId: "sandbox-survival",
    difference:
      "农场生活模拟常把长期日程和生活关系放在前景；沙盒生存更常讨论环境约束与生存压力。具体作品可同时使用两组结构。",
  },
  {
    id: "sandbox-survival",
    playerTask: "利用开放环境中的资源，自主安排探索、建造和存活办法。",
    loop: [
      "寻找资源并判断环境危险",
      "制作工具、建造设施或改变地形",
      "扩大安全活动范围，进入更高风险的环境",
    ],
    designQuestion: "玩家自行设定的建造与探索目标，如何与生存压力互相支持？",
    compareId: "survival-craft",
    difference:
      "沙盒生存强调开放空间和玩家目标；生存制作强调采集、制作与生存约束之间的闭环。两种说法经常交叉，不能当作互斥标签。",
  },
  {
    id: "incremental-idle",
    playerTask: "把当前产出再投入增长系统，逐渐提高产出速度并解锁新的规模。",
    loop: [
      "取得基础产出，观察当前瓶颈",
      "购买生产或效率升级",
      "积累更高产出，再判断投资或重置时机",
    ],
    designQuestion: "数值变大之外，升级和重置能否改变玩家的规划问题？",
    compareId: "factory-automation",
    difference:
      "增量放置关注增长与再投资；自动化工厂还常需要处理空间布局、物流与设备依赖。自动产出本身不足以让两者等同。",
  },
  {
    id: "moba",
    playerTask:
      "与队友争夺地图资源和推进机会，逐渐建立足以完成共同胜利目标的优势。",
    loop: [
      "分配角色与线路，争取资源和地图信息",
      "成长、集结并争夺关键区域或目标",
      "利用优势推进，回应对手反击直至结算",
    ],
    designQuestion:
      "个人成长怎样转化为团队窗口？领先方和落后方是否仍有可读的行动选择？",
    compareId: "real-time-strategy",
    difference:
      "MOBA 通常把个人控制集中到英雄及其能力；即时战略通常还要求调配经济、生产和多支单位。具体控制数量须回到作品模式核对。",
  },
  {
    id: "soulslike",
    playerTask: "学习敌人与环境的行动规律，在探索、消耗和失败风险之间推进。",
    loop: [
      "准备装备并进入危险区域",
      "观察攻击、寻找时机并管理恢复资源",
      "通过关口或承担失败后果，再调整路线与做法",
    ],
    designQuestion:
      "失败能否提供可学习的信息？资源恢复与重试距离如何影响玩家愿意尝试的策略？",
    compareId: "action-rpg",
    difference:
      "类魂并无单一普遍认可的机制清单；动作 RPG 更宽泛。不能因为战斗困难、能够翻滚或存在复活点就直接判为类魂。",
  },
  {
    id: "immersive-sim",
    playerTask:
      "理解环境中的一致规则，组合工具和系统，找到多种完成目标的办法。",
    loop: [
      "观察空间、目标和可交互系统",
      "选择工具、路径或系统组合解决障碍",
      "承受系统反馈，并利用新的局面继续行动",
    ],
    designQuestion:
      "不同解法是否来自一致规则的组合，而非只在预设位置出现的选择按钮？",
    compareId: "logic-puzzle",
    difference:
      "逻辑解谜可以围绕单一确定规则求解；沉浸式模拟更强调多系统响应和目标导向的多解空间。两者都不能仅凭自由度宣传词判定。",
  },
  {
    id: "survival-craft",
    playerTask: "把环境中的原料加工成工具和设施，以维持生存并支撑更远的探索。",
    loop: [
      "识别生存需求并采集原料",
      "制作装备、储备与设施",
      "应对新的环境压力，补充或升级供给链",
    ],
    designQuestion:
      "制作的每一层是否解决新的生存问题，还是只增加重复采集的成本？",
    compareId: "sandbox-survival",
    difference:
      "生存制作不必拥有任意改造世界的沙盒能力；沙盒生存也可能弱化配方链。应分别观察制作、环境与目标结构。",
  },
  {
    id: "precision-platformer",
    playerTask: "读懂空间中的障碍，并以可练习的动作序列精确通过。",
    loop: [
      "观察障碍布局与动作资源",
      "执行移动、跳跃或冲刺序列",
      "从失败反馈调整时机，重试并通过关段",
    ],
    designQuestion: "失败原因能否看清？重试成本和动作反馈是否支持持续练习？",
    compareId: "metroidvania",
    difference:
      "精确平台跳跃的重点是动作挑战；类银河恶魔城的重点是能力解锁后的空间探索。关卡中出现跳跃和冲刺并不能证明两者相同。",
  },
  {
    id: "tactical-turn-based",
    playerTask: "在轮流行动的局面里，为有限单位安排位置、行动顺序与风险。",
    loop: [
      "观察单位、地形和已知威胁",
      "分配移动、攻击与其他行动资源",
      "结算敌方回应，再根据新局面规划",
    ],
    designQuestion:
      "可见信息、命中风险与行动资源能否形成多种可解释的战术取舍？",
    compareId: "real-time-strategy",
    difference:
      "回合战术把思考与执行分成轮次；即时战略的局势持续推进。暂停、慢速和小队控制需按具体规则记录。",
  },
  {
    id: "real-time-strategy",
    playerTask: "在持续推进的战场中，同时安排经济、生产和部队行动。",
    loop: [
      "侦察并组织资源与生产",
      "调动部队，争夺空间和经济机会",
      "回应对手变化，调整科技与兵力组合",
    ],
    designQuestion: "经济规划、情报判断和即时调度之间如何分配注意力？",
    compareId: "four-x",
    difference:
      "即时战略强调持续时间压力下的调度；4X 强调探索、扩张、开发和对抗的宏观结构。4X 并不必然采用回合制。",
  },
  {
    id: "four-x",
    playerTask:
      "经营一个持续扩张的势力，在探索、开发、外交和对抗之间选择发展路线。",
    loop: [
      "探索可用空间与其他势力",
      "配置扩张、经济和技术方向",
      "处理势力关系与竞争，推进长期胜利目标",
    ],
    designQuestion:
      "早期空间选择如何影响后期发展？不同胜利路线能否持续互相牵制？",
    compareId: "city-builder",
    difference:
      "4X 通常涉及多个势力及宏观竞争；城市建设主要关注聚落与服务系统。两者都可能采用技术和资源网络，但这些并不足以互相替代。",
  },
  {
    id: "factory-automation",
    playerTask: "将原料、加工和运输连接起来，持续发现并改善生产瓶颈。",
    loop: [
      "规划原料与生产目标",
      "建造机器、运输和配套设施",
      "检查吞吐与瓶颈，扩建或重构生产网络",
    ],
    designQuestion:
      "产线限制是否能被玩家读出来？扩张能否带来新的物流问题而非只复制更多机器？",
    compareId: "incremental-idle",
    difference:
      "工厂自动化通常让物流和空间组织成为主要问题；增量放置可以主要通过购买倍率推进。两者的自动生产不应直接混作一个机制。",
  },
  {
    id: "colony-simulation",
    playerTask: "为具有不同需求的居民安排劳动、设施和风险应对，维持聚落运作。",
    loop: [
      "观察居民需求、工作与环境状态",
      "分派劳动并建设供给设施",
      "应对事故和需求变化，重新安排聚落",
    ],
    designQuestion:
      "个体需求与整体效率发生冲突时，玩家是否有足够信息决定优先级？",
    compareId: "city-builder",
    difference:
      "殖民地模拟常把具体个体及工作状态放在前景；城市建设更常关注区域、网络和服务覆盖。两者存在重叠，应观察实际决策尺度。",
  },
  {
    id: "city-builder",
    playerTask:
      "安排城市空间与服务网络，让人口、交通、预算和设施能够共同运作。",
    loop: [
      "规划区域与基础设施",
      "观察人口、交通和服务需求",
      "调整布局与预算，支持新的发展",
    ],
    designQuestion:
      "局部建设怎样影响全城网络？玩家能否追踪拥堵、短缺和成本的原因？",
    compareId: "colony-simulation",
    difference:
      "城市建设可在抽象人口层面运行；殖民地模拟常追踪具体居民。不能仅因能造建筑就归入同一种设计问题。",
  },
  {
    id: "logic-puzzle",
    playerTask: "从可观察的规则与条件中推出可行操作，并检验自己的理解。",
    loop: [
      "观察规则、限制和目标",
      "提出解法并操作局面",
      "从结果修正理解，解决当前题目",
    ],
    designQuestion:
      "失败反馈能否帮助排除错误假设？新题是在复用旧知识，还是引入必要的新规则？",
    compareId: "investigation-adventure",
    difference:
      "逻辑解谜聚焦规则推演；调查冒险还涉及线索采集、事件还原和情境理解。解出一个谜题不等于完成同一种调查过程。",
  },
  {
    id: "investigation-adventure",
    playerTask: "寻找、交叉核对和解释线索，逐渐还原一个未知事件或世界。",
    loop: [
      "探索并收集可用线索",
      "比较证据，提出人物或事件解释",
      "验证推断并决定继续调查的方向",
    ],
    designQuestion:
      "玩家的理解是否推动进展？系统如何区分合理推断、猜答案和线索遗漏？",
    compareId: "language-puzzle",
    difference:
      "语言解谜以符号含义和交流规则为主要研究对象；调查冒险可以使用文字、空间、时间或人物证据，两者可以重叠。",
  },
  {
    id: "language-puzzle",
    playerTask: "借助语境和反复出现的符号，推断陌生语言或表达系统的含义。",
    loop: [
      "观察符号与其出现的情境",
      "建立词义或规则假设",
      "在新语境中验证并修正解释",
    ],
    designQuestion:
      "不同语境能否让玩家真正验证词义，而不是单靠排列或穷举匹配？",
    compareId: "logic-puzzle",
    difference:
      "语言解谜的核心材料是符号和语义；一般逻辑解谜不必围绕语言。出现虚构文字的世界观，也不自动构成语言推断玩法。",
  },
  {
    id: "digital-card-duel",
    playerTask: "使用受卡牌和规则约束的行动，与对手竞争局面、资源或胜利条件。",
    loop: [
      "准备可用卡组或行动池",
      "抽取并使用卡牌，回应对手行动",
      "争取关键资源或目标，进入结算",
    ],
    designQuestion:
      "随机获取行动与对手互动之间，是否保留了可读的计划和反制空间？",
    compareId: "deckbuilder",
    difference:
      "数字卡牌对战不保证局内能够改变卡组；卡组构筑也不保证存在直接对手。卡牌载体、构筑与竞争应分开核验。",
  },
  {
    id: "tactical-shooter",
    playerTask: "利用信息、位置、装备和队友配合，完成射击对抗中的战术目标。",
    loop: [
      "配置装备并制定进攻或防守计划",
      "获取信息、控制空间并执行交战",
      "按目标和损失结算，调整下一轮方案",
    ],
    designQuestion:
      "信息差、击杀风险和团队目标是否让玩家愿意协作，而非只追逐个人命中？",
    compareId: "extraction-shooter",
    difference:
      "撤离射击增加了携带价值与撤离结算的风险决策；战术射击也可以完全采用回合胜负与固定目标，而无局外库存。",
  },
  {
    id: "vehicle-sport",
    playerTask: "通过载具操控和空间判断，在竞速或体育目标中与他人竞争。",
    loop: [
      "判断速度、位置与目标方向",
      "控制转向、加速和接触时机",
      "回应对手与物理结果，争取下一次机会",
    ],
    designQuestion:
      "载具运动是否足够可预测以支持练习，又能通过碰撞与对手产生变化？",
    compareId: "precision-platformer",
    difference:
      "两者都可依赖精确操作，但载具竞技把运动模型和竞技目标结合；精确平台跳跃通常围绕关段通过与动作资源组织。",
  },
  {
    id: "social-deduction",
    playerTask:
      "在身份或意图不完全公开的情况下，通过行动、交流和判断争取阵营目标。",
    loop: [
      "执行任务或隐蔽行动，留下可观察线索",
      "交流证据与怀疑，判断身份和动机",
      "作出投票或其他集体决定，回应新的局面",
    ],
    designQuestion:
      "公开证据、私有信息与自由发言如何共同支持推理，而非只凭熟人关系判断？",
    compareId: "investigation-adventure",
    difference:
      "社交推理通常包含会主动隐瞒或误导的参与者；调查冒险也可以完全没有真人对抗。未知信息不自动等于隐藏身份。",
  },
  {
    id: "rhythm-game",
    playerTask: "识别随音乐推进的提示，以合适的时机和动作完成演奏或节奏任务。",
    loop: [
      "读取即将到达的节奏与动作提示",
      "在判定窗口内输入或保持动作",
      "根据判定与连段反馈调整下一组输入",
    ],
    designQuestion:
      "视听提示、输入延迟和判定反馈是否让玩家相信结果并能够练习？",
    compareId: "precision-platformer",
    difference:
      "节奏游戏通常以音乐时间结构组织判定；精确平台跳跃以空间障碍组织动作。两者可以结合，但时机操作本身并非完整类型定义。",
  },
  {
    id: "party-cooperation",
    playerTask: "在容易理解的共同目标下，与队友分工、交接并应对现场混乱。",
    loop: [
      "识别共享任务和当前分工",
      "协调移动、操作与交接",
      "应对错误或环境变化，完成共同结算",
    ],
    designQuestion:
      "混乱能否产生可协商的补救和有趣配合，而不是让队友无法理解彼此行动？",
    compareId: "social-deduction",
    difference:
      "派对协作以共同完成任务为前景；社交推理可能存在隐藏的冲突目标。多人同场不必然意味着同一类合作关系。",
  },
];
export const getTypeReference = (id: string) =>
  typeReferences.find((reference) => reference.id === id);
