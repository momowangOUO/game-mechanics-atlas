import { instances, mechanics, scopes } from "../lib/knowledge";
import type { DimensionId, MechanicInstance } from "../lib/model";

/** An editorial browsing structure. It never changes the canonical dimension of an atom. */
export type TaxonomyDimension = {
  dimensionId: DimensionId;
  question: string;
  explanation: string;
  use: string;
  boundary: string;
};

export type TaxonomyExample = {
  gameId: string;
  mechanicId: string;
  instanceId: string;
  scopeId: string;
  scopeLabel: string;
  status: "present" | "conditional";
  observation: string;
  condition?: string;
  scopeNote?: string;
  evidenceKind: MechanicInstance["evidenceKind"];
  sourceIds: string[];
};

export type TaxonomyGroup = {
  id: string;
  dimensionId: DimensionId;
  name: string;
  explanation: string;
  function: string;
  boundary: string;
  mechanicIds: string[];
  examples: TaxonomyExample[];
};

export const classificationLevels = [
  {
    id: "dimension",
    name: "一级：机制维度",
    question: "规则直接改变什么？",
    explanation:
      "九个并列观察角度，把输入、结算、流程、配置、成长、资源、信息、参与者与变化分开。每项原子机制保留一个主维度，涉及的其他维度通过关系表达。",
    example: "资源与经济关注资源如何取得、转换、分配和消耗。",
  },
  {
    id: "group",
    name: "二级：机制分组",
    question: "这一维里有哪些相近的做法？",
    explanation:
      "把同一维度内作用相近的机制放在一起，方便查找和比较。分组由本站编辑整理，不代表行业统一分类，也不改变机制是否成立的判断。",
    example:
      "资源与经济 → 生产与设施投资，包含生产投资、基地建设、种植与养殖、劳动力分配。",
  },
  {
    id: "mechanic",
    name: "三级：原子机制",
    question: "哪条可独立判断的规则成立？",
    explanation:
      "用定义、纳入条件和排除条件识别一个具体规则。它可以出现在不同游戏类型中，不能因为游戏有某个类型标签就直接判定存在。",
    example: "撤离兑现：满足退出条件后，才能把本次尚未结算的收益带走。",
  },
  {
    id: "instance",
    name: "实例：游戏中的实际用法",
    question: "哪款游戏、哪个范围有依据？",
    explanation:
      "记录某项机制在具体游戏、模式、系统、角色或版本中的用法，附上来源与成立条件。这里的范例只选用已记录为存在或有条件成立的实例。",
    example: "同款游戏不同模式可以采用不同规则；条件实例必须连同条件阅读。",
  },
  {
    id: "genre",
    name: "并列入口：游戏类型",
    question: "哪些机制通常一起形成一种玩法？",
    explanation:
      "RPG、即时战略、卡组构筑等类型描述一组常见玩法特征。类型的必要、常见与可选组成是本目录的讨论口径，跨越多个维度，不放在原子机制下面。",
    example:
      "卡组构筑可以同时涉及构筑、资源、时间和随机抽取；有卡牌不等于有构筑。",
  },
  {
    id: "recipe",
    name: "设计入口：组合配方",
    question: "这些机制放在一起值得试什么？",
    explanation:
      "配方说明各机制可以怎样分工、配合或产生冲突，并列出原型需要验证的问题。参考游戏只用于对照其中的相关用法，不代表整套配方已经在该游戏中验证。",
    example: "路线分支 × 局内扩充卡组：测试玩家能否根据当前卡组解释选路。",
  },
  {
    id: "metadata",
    name: "辅助标签：题材、视角与平台",
    question: "游戏讲什么、怎样呈现、在哪运行？",
    explanation:
      "科幻题材、俯视视角或移动平台可以帮助检索，但本身不定义规则。本目录没有把这些标签强行补成机制维度，也不据此推断游戏具备哪些机制。",
    example: "第一人称是一种呈现视角；瞄准发射才是可独立核验的交互规则。",
  },
] as const;

export const taxonomyDimensions: TaxonomyDimension[] = [
  {
    dimensionId: "interaction",
    question: "玩家亲手做什么，直接改变哪个对象？",
    explanation:
      "从一次输入到对象变化，描述移动、攻击、放置、操纵和节奏操作。相同输入方式可以服务不同类型，重点是操作直接造成的变化。",
    use: "比较不同控制方式、可用动作和操作难度，判断同一目标可以怎样完成。",
    boundary:
      "命中后造成多少伤害归规则与结算；行动何时可再次使用归时间与流程。",
  },
  {
    dimensionId: "rules",
    question: "动作与状态如何被判定、组合和结算？",
    explanation:
      "规定输入之后如何算结果，包括伤害、计分、状态叠加、控制权与胜负。这里解释条件与结果的对应关系。",
    use: "梳理结算顺序、反馈与反制方式，检查玩家能否理解一次结果。",
    boundary: "主动按键的方式归核心交互；结果是否跨局保留归成长与延续。",
  },
  {
    dimensionId: "temporal",
    question: "谁在何时行动，一次流程怎样继续或结束？",
    explanation:
      "组织行动顺序、时间限制、流程分支、循环与重试边界。它决定玩家有多少思考时间，也决定失败后从哪里继续。",
    use: "安排决策节奏、阶段切换、重试成本与内容出现的时间。",
    boundary:
      "单局重开说明哪些局面被清除；永久死亡说明哪个角色不可恢复，两者分别记录。",
  },
  {
    dimensionId: "buildcraft",
    question: "玩家如何选择并组合可用能力？",
    explanation:
      "描述卡组、装备、技能、阵容和部署方案的配置。核心是玩家能改变什么组合，以及组合受到哪些结构约束。",
    use: "比较构筑自由度、配置时机、试错成本和组合是否容易理解。",
    boundary:
      "获得成长权限归成长；制作时材料怎样转换归资源；配置改变后的效果仍需单独核验。",
  },
  {
    dimensionId: "progression",
    question: "过程之后，哪些能力、权限与记录发生改变？",
    explanation:
      "关注能力增长、内容解锁、任务关系和持久记录，也包含不可恢复的角色损失。成长可以发生在一局内，也可以跨越多次尝试。",
    use: "安排长期目标、进入条件，以及失败后仍能保留的进展。",
    boundary:
      "配置已有能力归构筑；清除当前尝试归流程。持久解锁不代表立即拥有或数值更强。",
  },
  {
    dimensionId: "economy",
    question: "资源从哪里来，怎样变成别的东西，又被谁花掉？",
    explanation:
      "把获取、容量、消耗、加工、生产设施、运输和归属连起来。资源不只指货币，也可能是弹药、工时、温度控制所需能源或团队余额。",
    use: "梳理资源流向与瓶颈，检查投入之后是否多了值得选择的方案。",
    boundary:
      "拥有数值不证明资源稀缺；共享余额是经济规则，合作关系另归参与者关系。",
  },
  {
    dimensionId: "information",
    question: "玩家知道什么，又通过什么办法知道？",
    explanation:
      "描述预览、隐藏、感知、推理和记录，区分可见事实、可推断线索与尚未揭示的信息。信息结构会改变同一规则下的决策。",
    use: "安排提示、侦察、解谜与误判空间，检查玩家是否有足够依据行动。",
    boundary:
      "玩家获得线索归信息；理解知识后能跨过流程门槛归成长。同一体验可以同时涉及两者。",
  },
  {
    dimensionId: "participants",
    question: "哪些行动者一起玩，他们怎样互相影响？",
    explanation:
      "描述合作、竞争、角色职责、外交与在线时间关系。多人只是人数条件，具体目标、权限与同步方式仍需分别判断。",
    use: "梳理团队如何互相依赖、对抗、沟通，以及能否错开时间参与。",
    boundary: "共享目标不自动意味着共享资源；自动战斗不自动意味着异步对手。",
  },
  {
    dimensionId: "variability",
    question: "每次局面为何不同，哪些变化能够重现？",
    explanation:
      "区分随机取样、候选供给、地图生成、遭遇调度与状态模拟。并非所有变化都随机，也并非所有程序生成内容都无法重现。",
    use: "为重复游玩安排变化，并考虑玩家能否控制、理解和重现这些变化。",
    boundary:
      "玩家主动换装备属于配置；随机换商店候选属于变化。完整预制地图的随机抽选不等同布局生成。",
  },
];

const scopeById = new Map(scopes.map((scope) => [scope.id, scope]));
function toExample(instance: MechanicInstance): TaxonomyExample {
  const scope = scopeById.get(instance.scopeId);
  if (
    !scope ||
    (instance.status !== "present" && instance.status !== "conditional")
  ) {
    throw new Error(`Invalid taxonomy example: ${instance.id}`);
  }
  return {
    gameId: scope.gameId,
    mechanicId: instance.mechanicId,
    instanceId: instance.id,
    scopeId: scope.id,
    scopeLabel: scope.label,
    status: instance.status,
    observation: instance.rationale,
    condition: instance.condition,
    scopeNote: instance.scopeNote,
    evidenceKind: instance.evidenceKind,
    sourceIds: [...instance.sourceIds],
  };
}

const positiveInstances = instances.filter(
  (instance) =>
    instance.status === "present" || instance.status === "conditional",
);
function example(gameId: string, mechanicId: string): TaxonomyExample {
  const candidates = positiveInstances.filter(
    (instance) =>
      instance.mechanicId === mechanicId &&
      scopeById.get(instance.scopeId)?.gameId === gameId,
  );
  const selected =
    candidates.find((instance) => instance.status === "present") ??
    candidates[0];
  if (!selected)
    throw new Error(
      `Missing observed taxonomy example: ${gameId}/${mechanicId}`,
    );
  return toExample(selected);
}

type GroupDraft = Omit<TaxonomyGroup, "examples"> & {
  examplePairs: [string, string][];
};
const groupDrafts: GroupDraft[] = [
  {
    id: "movement-basics",
    dimensionId: "interaction",
    name: "移动与攀越",
    explanation:
      "通过方向、跳跃或攀附输入改变自身位置，解决到达目标与跨越空间障碍的问题。",
    function: "建立移动路线与操作精度要求，让地形成为可以学习和掌握的挑战。",
    boundary: "只负责输入造成的位置变化；通路是否需要解锁能力另看能力门槛。",
    mechanicIds: ["direct-movement", "jump", "wall-climb"],
    examplePairs: [
      ["celeste", "jump"],
      ["genshin-impact", "wall-climb"],
      ["vampire-survivors", "direct-movement"],
    ],
  },
  {
    id: "mobility-tools",
    dimensionId: "interaction",
    name: "特殊位移与空间连接",
    explanation:
      "用冲刺、抓钩或传送入口改变移动方式，突破普通步行的距离、路径或连接限制。",
    function:
      "让玩家用不同办法躲避威胁、接近目标或跨越区域，并判断距离、路径与连接关系。",
    boundary:
      "闪避位移不自动保证无敌；存在传送门也不代表玩家可以自由放置入口。",
    mechanicIds: ["dodge-move", "grappling", "traversal-portal"],
    examplePairs: [
      ["hades", "dodge-move"],
      ["sekiro", "grappling"],
      ["portal-2", "traversal-portal"],
    ],
  },
  {
    id: "attack-defense-input",
    dimensionId: "interaction",
    name: "攻击与招架操作",
    explanation:
      "选择方向或目标发动攻击，或在敌方攻击窗口主动防御。操作时机和空间关系直接影响结果。",
    function: "让瞄准、距离控制和识别攻击预兆成为需要练习的技巧。",
    boundary:
      "这里记录玩家如何触发动作；伤害量、生命阈值与姿态击破由结算机制定义。",
    mechanicIds: ["aimed-launch", "melee-attack", "parry"],
    examplePairs: [
      ["peglin", "aimed-launch"],
      ["hades", "melee-attack"],
      ["sekiro", "parry"],
    ],
  },
  {
    id: "object-arrangement",
    dimensionId: "interaction",
    name: "物件排列与放置",
    explanation:
      "旋转、拖放或推动对象，改变物件在格子、场景或可用位置中的排列。",
    function: "把空间适配与排列顺序变成直接可操作的问题。",
    boundary:
      "拖放是输入方式；装备占用空间是配置规则；邻接后产生加成是结算规则。",
    mechanicIds: ["piece-rotation", "drag-placement", "block-pushing"],
    examplePairs: [
      ["tetris", "piece-rotation"],
      ["teamfight-tactics", "drag-placement"],
      ["baba-is-you", "block-pushing"],
    ],
  },
  {
    id: "physical-world-input",
    dimensionId: "interaction",
    name: "物理操纵与环境改造",
    explanation:
      "通过转向、施力或破坏，改变载具、物理对象与地形的运动或实体状态。",
    function: "让玩家利用惯性、受力和可改造的地形解决问题。",
    boundary:
      "地形破坏是一种行动；世界模拟描述多个状态继续相互作用，不从破坏画面推断完整物理模拟。",
    mechanicIds: [
      "vehicle-steering",
      "physics-manipulation",
      "destructible-terrain",
    ],
    examplePairs: [
      ["rocket-league", "vehicle-steering"],
      ["portal-2", "physics-manipulation"],
      ["deep-rock-galactic", "destructible-terrain"],
    ],
  },
  {
    id: "timed-input",
    dimensionId: "interaction",
    name: "节奏与持续输入",
    explanation: "要求输入落在合适的时间，或维持按住和跟随状态直到条件满足。",
    function: "形成时机判断、持续控制与动作配合的挑战。",
    boundary:
      "连续成功计数是输入结果的奖励规则，不能用连击数代替节奏或长按本身。",
    mechanicIds: ["rhythmic-input", "hold-input"],
    examplePairs: [
      ["beat-saber", "rhythmic-input"],
      ["osu", "hold-input"],
    ],
  },
  {
    id: "completion-scoring",
    dimensionId: "rules",
    name: "完成条件与计分",
    explanation: "把分数阈值、排列完成或连续合格行动转为通过、消除和评分变化。",
    function: "让玩家知道何时完成局部目标，并用可读的成绩反馈引导操作。",
    boundary:
      "满行消除不等于任意同色匹配；连续成功计数也不是多个效果同时叠加。",
    mechanicIds: ["score-threshold", "line-completion-clear", "combo-chain"],
    examplePairs: [
      ["balatro", "score-threshold"],
      ["tetris", "line-completion-clear"],
      ["osu", "combo-chain"],
    ],
  },
  {
    id: "combat-state",
    dimensionId: "rules",
    name: "生命、姿态与状态",
    explanation:
      "根据攻击和事件更新生命、姿态压力与持续状态，达到条件后触发失能，或开放破防、处决等机会。",
    function: "区分消耗、压制与暂时控制，安排战斗中的恢复、爆发与反制。",
    boundary:
      "持续状态不一定造成伤害；有生命量不代表另有姿态条。每种状态分别取证。",
    mechanicIds: ["damage-health", "posture-break", "status-effect"],
    examplePairs: [
      ["dark-souls-3", "damage-health"],
      ["sekiro", "posture-break"],
      ["backpack-battles", "status-effect"],
    ],
  },
  {
    id: "effect-composition",
    dimensionId: "rules",
    name: "效果组合与规则改写",
    explanation: "让多个效果共同参与计算，或通过特殊组合改变原有结算方式。",
    function: "让玩家围绕效果之间的配合与例外规则安排构筑。",
    boundary:
      "叠加描述效果共同生效；修饰器改动规则；元素反应要求具体元素组合，不能互相替代。",
    mechanicIds: ["stacking-effects", "rule-modifier", "elemental-reaction"],
    examplePairs: [
      ["risk-of-rain-2", "stacking-effects"],
      ["baba-is-you", "rule-modifier"],
      ["genshin-impact", "elemental-reaction"],
    ],
  },
  {
    id: "spatial-settlement",
    dimensionId: "rules",
    name: "位置收益与区域规则",
    explanation: "按相邻关系、空间占有或区域政策决定对象效果、收益和当地规则。",
    function: "赋予位置和控制范围明确价值，让布局与争夺改变结算。",
    boundary:
      "同在一个区域不证明存在加成；建设设施属于资源投入，区域规则要另列。",
    mechanicIds: ["adjacency-bonus", "area-control", "territory-policy"],
    examplePairs: [
      ["loop-hero", "adjacency-bonus"],
      ["splatoon-3", "area-control"],
      ["cities-skylines", "territory-policy"],
    ],
  },
  {
    id: "stakes-and-victory",
    dimensionId: "rules",
    name: "胜负比较与赌注",
    explanation:
      "规定最后依据什么比较胜负，以及参与者能否主动提高这次竞争的收益与损失。",
    function: "把局部领先转化为终局目标，或让玩家表达对局势的信心。",
    boundary: "终局胜利点与关卡分数达标不同；加注不是所有高风险选择的统称。",
    mechanicIds: ["victory-points", "risk-staking"],
    examplePairs: [
      ["dominion", "victory-points"],
      ["marvel-snap", "risk-staking"],
    ],
  },
  {
    id: "judgment-rules",
    dimensionId: "rules",
    name: "检定与集体裁决",
    explanation:
      "用能力与要求值比较，或由参与者投票，对一次尝试或角色处置作出规则判定。",
    function: "让能力条件或集体判断参与结果，而不只依赖操作命中。",
    boundary:
      "能力检定依据角色能力与任务要求；身份投票依据集体选择。投票结果不能当作角色能力数值检定。",
    mechanicIds: ["ability-check", "identity-voting"],
    examplePairs: [
      ["disco-elysium", "ability-check"],
      ["among-us", "identity-voting"],
    ],
  },
  {
    id: "automated-execution",
    dimensionId: "rules",
    name: "自动执行结算",
    explanation: "配置完成后，战斗执行阶段的主要行为依预设规则推进。",
    function:
      "让玩家着重准备、观察结果和调整下一轮配置，减少逐次下达动作指令的需要。",
    boundary:
      "自动战斗不自动包含离线进展、异步对手或随机商店；这些机制分别核验。",
    mechanicIds: ["automatic-resolution"],
    examplePairs: [
      ["backpack-battles", "automatic-resolution"],
      ["teamfight-tactics", "automatic-resolution"],
    ],
  },
  {
    id: "turn-order",
    dimensionId: "temporal",
    name: "回合顺序与阶段",
    explanation: "划分谁能行动，以及准备、执行和结算等阶段何时切换。",
    function: "分配决策权限，明确行动顺序对策略和反制机会的影响。",
    boundary:
      "轮流行动不必意味着每回合有多个阶段；有阶段切换也可能是实时团队对局。",
    mechanicIds: ["sequential-turns", "round-phases"],
    examplePairs: [
      ["into-the-breach", "sequential-turns"],
      ["teamfight-tactics", "round-phases"],
      ["counter-strike-2", "round-phases"],
    ],
  },
  {
    id: "clock-and-deliberation",
    dimensionId: "temporal",
    name: "时钟推进与决策窗口",
    explanation:
      "规定世界是否持续运行、行动多久可再用、何时必须完成规划，以及能否暂停思考。",
    function: "控制反应压力与思考时间，让同一组行动产生不同节奏。",
    boundary:
      "行动冷却不等于资源消耗；规划时限必须对应具体决策阶段；打开菜单不自动算暂停规划。",
    mechanicIds: [
      "real-time-update",
      "action-cooldown",
      "planning-timer",
      "pause-planning",
    ],
    examplePairs: [
      ["starcraft-2", "real-time-update"],
      ["league-of-legends", "action-cooldown"],
      ["ftl", "pause-planning"],
    ],
  },
  {
    id: "flow-choice",
    dimensionId: "temporal",
    name: "路径选择与继续流程",
    explanation: "让玩家选择接下来的节点，或在通常结束的位置继续循环。",
    function: "把流程长度和遭遇顺序变成决策，允许玩家选择探索方向与继续投入。",
    boundary:
      "分支描述玩家选路；随机生成路径描述内容来源；结束后重开不是延长当前流程。",
    mechanicIds: ["route-branching", "optional-endless-loop"],
    examplePairs: [
      ["slay-the-spire", "route-branching"],
      ["risk-of-rain-2", "optional-endless-loop"],
    ],
  },
  {
    id: "retry-and-loop",
    dimensionId: "temporal",
    name: "重试、复活与世界循环",
    explanation:
      "规定失败或循环边界之后回到哪里，以及这次尝试中的哪些局面被重置。",
    function: "设置练习距离、试错成本和反复探索的节奏。",
    boundary:
      "回检查点、重开整局与定时重置世界范围不同，不能从其中一项推出其余两项。",
    mechanicIds: ["run-reset", "checkpoint-respawn", "timed-loop"],
    examplePairs: [
      ["hades", "run-reset"],
      ["celeste", "checkpoint-respawn"],
      ["outer-wilds", "timed-loop"],
    ],
  },
  {
    id: "environment-calendar",
    dimensionId: "temporal",
    name: "昼夜、天气与季节",
    explanation: "让环境随时间进入不同阶段，改变活动条件、资源和可用行动。",
    function: "形成可预期的准备与行动时机，使长期规划有时间依据。",
    boundary:
      "昼夜外观变化不一定改变规则；游戏内时间与现实日历也不能默认相同。",
    mechanicIds: ["day-night-cycle", "season-weather"],
    examplePairs: [
      ["animal-crossing-new-horizons", "day-night-cycle"],
      ["against-the-storm", "season-weather"],
    ],
  },
  {
    id: "equipment-build",
    dimensionId: "buildcraft",
    name: "装备选择与空间配置",
    explanation: "选择携带哪些能力和装备，并处理装备位置、形状与强化方向。",
    function: "让有限槽位和空间产生取舍，形成不同的出战方案。",
    boundary:
      "空间配置不保证邻接加成；装备强化改变当前装备，不自动意味着跨局永久成长。",
    mechanicIds: ["loadout-selection", "spatial-loadout", "equipment-upgrade"],
    examplePairs: [
      ["escape-from-tarkov", "loadout-selection"],
      ["backpack-battles", "spatial-loadout"],
      ["monster-hunter-world", "equipment-upgrade"],
    ],
  },
  {
    id: "ability-build",
    dimensionId: "buildcraft",
    name: "技能路线与模块组合",
    explanation:
      "沿前置关系选择能力，组合行为模块，或撤回已经分配的成长重新配置。",
    function: "提供专精方向与重新试验的空间，让能力组合改变行动办法。",
    boundary:
      "技能树是选择结构；经验成长是获得等级的过程。成长重配也不等同普通换装。",
    mechanicIds: ["skill-tree", "modular-ability", "respec"],
    examplePairs: [
      ["path-of-exile", "skill-tree"],
      ["noita", "modular-ability"],
      ["vampire-survivors", "respec"],
    ],
  },
  {
    id: "deck-development",
    dimensionId: "buildcraft",
    name: "局内卡组发展",
    explanation:
      "在一次尝试中取得新卡并加入可用卡组，使之后可抽取或使用的牌发生改变。",
    function:
      "让这次选卡影响之后能抽到或使用哪些牌，玩家也能围绕已有卡牌调整构筑。",
    boundary: "局外收藏、开局选卡和单纯随机抽牌都不自动满足局内扩充卡组。",
    mechanicIds: ["in-run-deck-growth"],
    examplePairs: [
      ["slay-the-spire", "in-run-deck-growth"],
      ["dominion", "in-run-deck-growth"],
    ],
  },
  {
    id: "roster-build",
    dimensionId: "buildcraft",
    name: "招募与队伍配置",
    explanation: "从候选中取得单位，再把可用成员组织成有不同功能的队伍。",
    function: "通过成员选择和互补关系决定队伍应对局势的方式。",
    boundary:
      "招募描述取得单位；队伍配置描述如何组合。多人玩家的职责差异另归参与者关系。",
    mechanicIds: ["unit-drafting", "team-composition"],
    examplePairs: [
      ["teamfight-tactics", "unit-drafting"],
      ["xcom-2", "team-composition"],
      ["genshin-impact", "team-composition"],
    ],
  },
  {
    id: "deployment-authoring",
    dimensionId: "buildcraft",
    name: "遭遇布置",
    explanation: "玩家放置内容，决定敌人或事件会在流程中的什么位置出现。",
    function: "让玩家参与安排挑战与收益的位置，在推进过程中修订布局。",
    boundary: "系统随机生成遭遇不属于玩家布置；摆放纯装饰物也不满足遭遇条件。",
    mechanicIds: ["encounter-placement"],
    examplePairs: [["loop-hero", "encounter-placement"]],
  },
  {
    id: "configuration-reuse",
    dimensionId: "buildcraft",
    name: "配置保存与复制",
    explanation: "把一组配置保存为蓝图，在材料和空间允许时再次部署。",
    function: "减少重复建设的操作，让玩家更专注于改进布局和扩展规模。",
    boundary:
      "蓝图不保证免费建成，也不等于游戏存档；实际部署仍受资源与位置约束。",
    mechanicIds: ["blueprint-replication"],
    examplePairs: [
      ["factorio", "blueprint-replication"],
      ["dyson-sphere-program", "blueprint-replication"],
    ],
  },
  {
    id: "persistence-and-loss",
    dimensionId: "progression",
    name: "跨局保留与永久损失",
    explanation:
      "规定尝试结束后保留哪些能力和权限，以及角色死亡是否会造成不可常规恢复的损失。",
    function: "建立长期积累与失败代价，明确一次重试是否从同样条件出发。",
    boundary: "持久解锁不等于数值强化；永久死亡必须写清角色、存档或挑战范围。",
    mechanicIds: ["persistent-stat-upgrade", "persistent-unlock", "permadeath"],
    examplePairs: [
      ["hades", "persistent-stat-upgrade"],
      ["dead-cells", "persistent-unlock"],
      ["cult-of-the-lamb", "permadeath"],
    ],
  },
  {
    id: "learning-and-research",
    dimensionId: "progression",
    name: "经验积累与技术发展",
    explanation: "通过行为、奖励或研究投入，逐步获得技能等级与新的技术能力。",
    function: "把反复行动和资源投入连接到后续能力，形成可规划的发展路线。",
    boundary:
      "研究投入不一定采用经验条；技能树的选择结构与经验的积累规则分别记录。",
    mechanicIds: ["skill-experience", "technology-research"],
    examplePairs: [
      ["stardew-valley", "skill-experience"],
      ["factorio", "technology-research"],
    ],
  },
  {
    id: "access-gates",
    dimensionId: "progression",
    name: "目标、知识与能力门槛",
    explanation:
      "用完成目标、理解规律或获得行动能力，决定玩家能否继续进入某段内容。",
    function: "安排探索顺序，让玩家用新知识和新能力解决之前遇到的障碍。",
    boundary:
      "知识门槛可能不改变角色数值；能力门槛需要新行动能力；普通岔路不是解锁。",
    mechanicIds: ["objective-unlock", "knowledge-gating", "ability-gating"],
    examplePairs: [
      ["the-witness", "objective-unlock"],
      ["outer-wilds", "knowledge-gating"],
      ["hollow-knight", "ability-gating"],
    ],
  },
  {
    id: "quest-and-relationship",
    dimensionId: "progression",
    name: "任务与关系发展",
    explanation:
      "完成目标或积累互动，使任务状态、人物关系与后续可访问内容改变。",
    function: "让玩家行动在后续过程留下可理解的影响，支撑故事与社交目标。",
    boundary:
      "出现对话不证明关系会发展；有目标提示也不自动意味着一条可推进的任务链。",
    mechanicIds: ["quest-progression", "relationship-progression"],
    examplePairs: [
      ["world-of-warcraft", "quest-progression"],
      ["stardew-valley", "relationship-progression"],
    ],
  },
  {
    id: "collection-records",
    dimensionId: "progression",
    name: "持久收集记录",
    explanation: "把发现或获得过的对象记录下来，形成可以继续补全的收藏与资料。",
    function: "提供探索和补全目标，保留玩家曾经发现内容的进度。",
    boundary:
      "图鉴记录属于持久进展；当前谜题的线索笔记归信息，不要求每份记录都有数值奖励。",
    mechanicIds: ["collectible-catalog"],
    examplePairs: [
      ["animal-crossing-new-horizons", "collectible-catalog"],
      ["hollow-knight", "collectible-catalog"],
    ],
  },
  {
    id: "resource-acquisition",
    dimensionId: "economy",
    name: "采集与战斗供给",
    explanation:
      "从资源节点、奖励对象或指定战斗行为中取得物品、材料与战斗资源。",
    function: "给行动安排具体产出，连接探索、战斗与后续消耗。",
    boundary:
      "战利品获取不证明奖励随机；战斗资源转换需要特定行为对应定向产出。",
    mechanicIds: [
      "resource-gathering",
      "loot-drop",
      "combat-resource-conversion",
    ],
    examplePairs: [
      ["minecraft", "resource-gathering"],
      ["monster-hunter-world", "loot-drop"],
      ["doom-eternal", "combat-resource-conversion"],
    ],
  },
  {
    id: "resource-constraints",
    dimensionId: "economy",
    name: "稀缺、需求与容量",
    explanation: "通过资源不足、持续需求或携带上限，限制玩家同时能做的事情。",
    function: "促成分配、补给与取舍，使获取资源和放弃资源都有意义。",
    boundary:
      "物品有数量不证明稀缺；持续需求与背包容量是不同限制，不能彼此推断。",
    mechanicIds: ["resource-scarcity", "upkeep-needs", "inventory-capacity"],
    examplePairs: [
      ["slay-the-spire", "resource-scarcity"],
      ["dont-starve-together", "upkeep-needs"],
      ["escape-from-tarkov", "inventory-capacity"],
    ],
  },
  {
    id: "resource-conversion",
    dimensionId: "economy",
    name: "配方与生产链",
    explanation: "按规则加工材料或组件，再把上一道工序的产物用于下一道工序。",
    function: "让原料、半成品与最终产物相互依赖，产生配比和瓶颈问题。",
    boundary: "知道配方如何转换属于资源规则；通过实验才发现配方的过程归信息。",
    mechanicIds: ["recipe-crafting", "production-chain"],
    examplePairs: [
      ["minecraft", "recipe-crafting"],
      ["factorio", "production-chain"],
      ["satisfactory", "production-chain"],
    ],
  },
  {
    id: "productive-investment",
    dimensionId: "economy",
    name: "生产与设施投资",
    explanation: "投入资源、土地、设施和人员，换取持续产出或新的生产服务能力。",
    function: "让玩家权衡眼前投入与后续收益，并安排设施、人员和培育周期。",
    boundary:
      "基地建设不必自动生产；种植与养殖有具体培育周期；劳动力分配关注岗位投入。",
    mechanicIds: [
      "production-investment",
      "base-construction",
      "agriculture-husbandry",
      "workforce-assignment",
    ],
    examplePairs: [
      ["cookie-clicker", "production-investment"],
      ["stardew-valley", "agriculture-husbandry"],
      ["frostpunk", "workforce-assignment"],
    ],
  },
  {
    id: "supply-networks",
    dimensionId: "economy",
    name: "运输与供给网络",
    explanation: "用线路、节点和管路在设施之间输送物品、能源、气体或液体。",
    function: "让连接关系、供给范围与输送能力成为生产和城市运行的约束。",
    boundary:
      "资源被消耗不证明存在网络；物品运输、能源分配与流体输送分别记录。",
    mechanicIds: ["transport-network", "energy-network", "fluid-network"],
    examplePairs: [
      ["factorio", "transport-network"],
      ["dyson-sphere-program", "energy-network"],
      ["oxygen-not-included", "fluid-network"],
    ],
  },
  {
    id: "thermal-management",
    dimensionId: "economy",
    name: "温度管理",
    explanation: "利用产热、散热和隔热维持合适温度，以满足生存或生产条件。",
    function:
      "让玩家为维持环境温度投入资源、安排维护，并调整区域和设施的热量分布。",
    boundary:
      "寒冷题材或天气变化不证明能调节温度；必须存在改变温度的实际规则。",
    mechanicIds: ["thermal-regulation"],
    examplePairs: [
      ["frostpunk", "thermal-regulation"],
      ["oxygen-not-included", "thermal-regulation"],
    ],
  },
  {
    id: "exchange-and-market",
    dimensionId: "economy",
    name: "交易与市场分配",
    explanation: "按交换、价格、位置支付或公共供给规则，把资源转移给其他主体。",
    function:
      "让玩家选择何时购买、是否争取有限供给，以及如何利用位置获得收益。",
    boundary:
      "公共市场需要多人使用同一供给；随机商店只描述候选生成，不保证共享。",
    mechanicIds: ["barter-trade", "toll-payment", "public-market"],
    examplePairs: [
      ["path-of-exile", "barter-trade"],
      ["game-of-dice", "toll-payment"],
      ["dominion", "public-market"],
    ],
  },
  {
    id: "resource-ownership",
    dimensionId: "economy",
    name: "收益归属与共同余额",
    explanation: "规定收益要到何时才能保留，以及多个行动者是否共用同一份资源。",
    function:
      "让玩家看清带出收益前的风险，以及团队成员花费资源时会怎样相互影响。",
    boundary:
      "撤离兑现需要写清哪些收益被带出；团队共享余额不代表所有物品都共享。",
    mechanicIds: ["extraction-bank", "shared-resource-pool"],
    examplePairs: [
      ["escape-from-tarkov", "extraction-bank"],
      ["stardew-valley", "shared-resource-pool"],
    ],
  },
  {
    id: "future-preview",
    dimensionId: "information",
    name: "未来行动与对象预览",
    explanation: "在当前决策之前提供即将发生的行动或后续对象信息。",
    function: "让玩家根据已知的后续风险和机会规划，而不是只能等待结果出现。",
    boundary:
      "行动意图预告说明对方接下来做什么；后续对象预览说明之后会出现什么，二者分别核验。",
    mechanicIds: ["intent-preview", "next-piece-preview"],
    examplePairs: [["into-the-breach", "intent-preview"]],
  },
  {
    id: "hidden-information",
    dimensionId: "information",
    name: "隐藏信息与可见权限",
    explanation:
      "限制参与者能看见哪些手牌、区域或身份，使不同人掌握的信息不完全相同。",
    function: "制造侦察、推测、保密与欺骗空间，改变对手行为的解释方式。",
    boundary:
      "视觉黑暗不一定是战争迷雾；卡背不证明手牌对谁隐藏；身份隐藏要写清知情范围。",
    mechanicIds: ["hidden-hand", "fog-of-war", "hidden-role"],
    examplePairs: [
      ["hearthstone", "hidden-hand"],
      ["starcraft-2", "fog-of-war"],
      ["among-us", "hidden-role"],
    ],
  },
  {
    id: "inference-and-validation",
    dimensionId: "information",
    name: "线索推理与规则发现",
    explanation:
      "从环境、符号、文件和实验结果中提出判断，再用规则或反馈确认理解。",
    function: "把观察、比较和推理作为推进的主要手段，让知识本身产生进展。",
    boundary:
      "解谜题材不证明拥有全部推理机制；语言解码、字段核验和试配分别需要具体依据。",
    mechanicIds: [
      "environmental-clues",
      "deduction-validation",
      "language-decoding",
      "document-check",
      "recipe-discovery",
    ],
    examplePairs: [
      ["return-of-the-obra-dinn", "deduction-validation"],
      ["chants-of-sennaar", "language-decoding"],
      ["potion-craft", "recipe-discovery"],
    ],
  },
  {
    id: "knowledge-organization",
    dimensionId: "information",
    name: "线索记录与空间导航",
    explanation:
      "把已发现的信息组织为可回看的笔记、地图和标记，支持回忆与定位。",
    function: "帮助玩家在较长的探索中整理关系、规划路线并校准当前位置。",
    boundary: "记录线索不保证自动给出答案；存在地图也不代表完整揭示全部区域。",
    mechanicIds: ["clue-journal", "map-navigation"],
    examplePairs: [
      ["return-of-the-obra-dinn", "clue-journal"],
      ["hollow-knight", "map-navigation"],
    ],
  },
  {
    id: "sensing-and-tracking",
    dimensionId: "information",
    name: "感知、潜行与追踪",
    explanation:
      "利用视线、声音、痕迹和传感结果判断尚未直接看见的目标，也决定玩家是否被发现。",
    function: "让移动方式、环境遮挡和感官线索参与接近、回避与追猎。",
    boundary:
      "潜行侦测描述敌方如何发现玩家；痕迹追踪和声音定位描述玩家如何获得目标信息。",
    mechanicIds: [
      "stealth-detection",
      "scouting-tracking",
      "sound-information",
    ],
    examplePairs: [
      ["dishonored-2", "stealth-detection"],
      ["monster-hunter-world", "scouting-tracking"],
      ["hunt-showdown-1896", "sound-information"],
    ],
  },
  {
    id: "cooperation-goals",
    dimensionId: "participants",
    name: "合作与共同目标",
    explanation: "让行动者围绕相容目标合作，或共同改变同一项任务进度。",
    function: "把配合转化为可观察的共同成果，产生沟通与任务协调的需要。",
    boundary:
      "共同目标可涉及多个行动者，玩家合作则要求多位玩家；同屏或同阵营本身不足以证明。",
    mechanicIds: ["cooperative-play", "shared-objective"],
    examplePairs: [
      ["portal-2", "cooperative-play"],
      ["overcooked-2", "shared-objective"],
    ],
  },
  {
    id: "conflict-and-diplomacy",
    dimensionId: "participants",
    name: "竞争与外交关系",
    explanation:
      "玩家直接影响彼此胜负，或通过谈判、联盟与声望改变主体之间的关系。",
    function: "让对手和盟友成为决策的一部分，形成压制、交换与合作转变。",
    boundary:
      "榜单比较不等于直接玩家竞争；外交主体可以包含非玩家势力，不能默认都是多人谈判。",
    mechanicIds: ["pvp-opposition", "social-diplomacy"],
    examplePairs: [
      ["counter-strike-2", "pvp-opposition"],
      ["civilization-6", "social-diplomacy"],
    ],
  },
  {
    id: "role-differences",
    dimensionId: "participants",
    name: "角色职责差异",
    explanation:
      "给同场参与者不同能力或任务职责，使他们用不同办法影响同一局势。",
    function: "安排互补配合或不对称对抗，明确队伍内外的依赖关系。",
    boundary:
      "外观不同不构成职责差异；单人选择阵容属于队伍配置，参与者结构另行判断。",
    mechanicIds: ["role-asymmetry"],
    examplePairs: [
      ["deep-rock-galactic", "role-asymmetry"],
      ["among-us", "role-asymmetry"],
    ],
  },
  {
    id: "participation-timing",
    dimensionId: "participants",
    name: "同步与异步参与",
    explanation:
      "规定参与者是否必须在同一时间窗口影响对局，或能用此前提交的状态参与结算。",
    function: "调整共同在线的要求，支持不同的等待、响应和对手匹配方式。",
    boundary: "同步会话可以采用回合制；自动执行的战斗也可能要求双方同时在线。",
    mechanicIds: ["synchronous-session", "asynchronous-opponent"],
    examplePairs: [
      ["beat-saber", "synchronous-session"],
      ["dominion", "asynchronous-opponent"],
    ],
  },
  {
    id: "random-supply",
    dimensionId: "variability",
    name: "随机取样与候选供给",
    explanation: "用随机过程决定抽到的对象、骰子结果，或可选择的强化和商品。",
    function: "改变每次可用选项，要求玩家在已得到的条件下调整方案。",
    boundary:
      "随机抽取直接给出对象；候选供给通常还保留选择。顺序未知不一定意味着随机。",
    mechanicIds: [
      "random-draw",
      "dice-roll",
      "random-upgrade-offer",
      "randomized-market",
    ],
    examplePairs: [
      ["balatro", "random-draw"],
      ["game-of-dice", "dice-roll"],
      ["teamfight-tactics", "randomized-market"],
    ],
  },
  {
    id: "generated-content",
    dimensionId: "variability",
    name: "布局生成与遭遇变化",
    explanation: "生成空间结构，或随机决定后续敌人、事件与出现顺序。",
    function: "改变重复游玩的路线和挑战组合，减少完全照搬上次解法的机会。",
    boundary:
      "遭遇变化不证明地图几何由程序生成；布局生成也不保证所有事件都随机。",
    mechanicIds: ["generated-layout", "randomized-encounters"],
    examplePairs: [
      ["deep-rock-galactic", "generated-layout"],
      ["risk-of-rain-2", "randomized-encounters"],
    ],
  },
  {
    id: "reproducible-variation",
    dimensionId: "variability",
    name: "随机过程重现",
    explanation: "在明确版本和输入条件下，用种子重现约定范围内的随机过程。",
    function:
      "方便复盘、共同挑战和比较策略，让不同方案可以在相同的随机条件下研究。",
    boundary:
      "相同种子不保证跨版本一致，也不保证玩家不同操作之后所有后续结果仍相同。",
    mechanicIds: ["seeded-replay"],
    examplePairs: [
      ["balatro", "seeded-replay"],
      ["binding-of-isaac-rebirth", "seeded-replay"],
    ],
  },
  {
    id: "world-state-change",
    dimensionId: "variability",
    name: "世界模拟与事件调度",
    explanation:
      "世界状态可以相互影响；系统也可以根据节奏策略或明确条件安排事件、改变环境。",
    function:
      "让局面回应已经发生的行为，产生动态障碍、连锁变化或新的事件时机。",
    boundary:
      "变化不必随机；局部开关状态不等于完整世界模拟；事件调度也不默认采用自适应难度。",
    mechanicIds: ["world-simulation", "event-director", "mutable-environment"],
    examplePairs: [
      ["noita", "world-simulation"],
      ["rimworld", "event-director"],
      ["portal-2", "mutable-environment"],
    ],
  },
];

export const taxonomyGroups: TaxonomyGroup[] = groupDrafts.map(
  ({ examplePairs, ...group }) => ({
    ...group,
    examples: examplePairs.map(([gameId, mechanicId]) =>
      example(gameId, mechanicId),
    ),
  }),
);

/** Empty arrays are deliberate evidence gaps, never assertions that a game lacks a mechanic. */
export const mechanicExamples: Record<string, TaxonomyExample[]> =
  Object.fromEntries(
    mechanics.map((mechanic) => {
      const curated = taxonomyGroups
        .flatMap((group) => group.examples)
        .filter((row) => row.mechanicId === mechanic.id);
      const observations = positiveInstances
        .filter((row) => row.mechanicId === mechanic.id)
        .sort(
          (a, b) =>
            Number(a.status === "conditional") -
            Number(b.status === "conditional"),
        )
        .map(toExample);
      const seen = new Set<string>();
      const examples = [...curated, ...observations]
        .filter((row) => {
          if (seen.has(row.gameId)) return false;
          seen.add(row.gameId);
          return true;
        })
        .slice(0, 3);
      return [mechanic.id, examples];
    }),
  );

export function getTaxonomyGroups(dimensionId: DimensionId): TaxonomyGroup[] {
  return taxonomyGroups.filter((group) => group.dimensionId === dimensionId);
}

export function getMechanicTaxonomy(
  mechanicId: string,
): { dimension: TaxonomyDimension; group: TaxonomyGroup } | undefined {
  const group = taxonomyGroups.find((row) =>
    row.mechanicIds.includes(mechanicId),
  );
  const dimension = taxonomyDimensions.find(
    (row) => row.dimensionId === group?.dimensionId,
  );
  return group && dimension ? { dimension, group } : undefined;
}
