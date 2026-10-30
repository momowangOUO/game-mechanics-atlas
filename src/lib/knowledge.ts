import dossierData from '../../docs/research/mechanic-dossiers.json';
import gameData from '../../docs/research/game-evidence.json';
import recipeData from '../../docs/research/genre-recipes.json';
import { DimensionIdSchema, MechanicSchema, GameSchema, GameModeSchema, ScopeSchema, MechanicInstanceSchema, CompositeGenreSchema, HybridRecipeSchema, MechanicRelationshipSchema, SourceSchema } from './model';
import type { DimensionId, Mechanic, Game, GameMode, Scope, MechanicInstance, CompositeGenre, HybridRecipe, MechanicRelationship, Source, MechanicStatus } from './model';

export const dimensions: {id:DimensionId;name:string;description:string;color:string;short:string}[] = [
  {id:'interaction',name:'核心交互',short:'交互',description:'玩家通过什么输入直接改变局面。',color:'#527fa1'},
  {id:'rules',name:'规则与结算',short:'规则',description:'行动如何被判定、组合并结算。',color:'#a96b75'},
  {id:'temporal',name:'时间与流程',short:'流程',description:'行动如何推进，阶段与尝试如何组织。',color:'#8e76ae'},
  {id:'buildcraft',name:'构筑与配置',short:'构筑',description:'玩家如何配置可用能力与内容。',color:'#b68a43'},
  {id:'progression',name:'成长与延续',short:'成长',description:'哪些能力、权限和关系随过程改变或保留。',color:'#718d62'},
  {id:'economy',name:'资源与经济',short:'资源',description:'资源如何获取、转换、共享与消耗。',color:'#b17855'},
  {id:'information',name:'信息与认知',short:'信息',description:'玩家能获知什么，以及如何判断局面。',color:'#5e9690'},
  {id:'participants',name:'参与者关系',short:'参与',description:'玩家之间怎样协作、竞争与同步。',color:'#b1749c'},
  {id:'variability',name:'变化与随机',short:'变化',description:'内容与结果如何产生变化或被重现。',color:'#7786af'},
];

// Retrieval tags are editorial aids, not additional mechanic identities.
const tagsByDimension: Record<DimensionId,string[]> = {
  interaction:['动作','空间解谜'],rules:['策略','构筑'],temporal:['策略','冒险'],buildcraft:['构筑','策略'],
  progression:['成长','冒险'],economy:['经营','生存'],information:['探索','策略'],participants:['多人'],variability:['构筑','冒险'],
};
const tagOverrides: Record<string,string[]> = {
  'direct-movement':['动作','探索'], 'aimed-launch':['动作','空间解谜'], 'piece-rotation':['空间解谜','构筑'],
  'drag-placement':['空间解谜','构筑'], 'score-threshold':['计分挑战','策略'], 'line-completion-clear':['空间解谜','计分挑战'],
  'in-run-deck-growth':['卡牌','构筑'], 'random-draw':['卡牌','策略'], 'hidden-hand':['卡牌','多人'],
  'relationship-progression':['叙事','生活模拟'], 'environmental-clues':['探索','叙事','空间解谜'],
  'toll-payment':['棋盘','经营'], 'dice-roll':['棋盘','策略'], 'production-investment':['经营','增量'],
  'base-construction':['经营','生存'], 'recipe-crafting':['经营','生存','构筑'], 'extraction-bank':['生存','动作'],
};
export const mechanics: Mechanic[] = dossierData.mechanisms.map(raw => MechanicSchema.parse({
  ...raw,corePlayTags:tagOverrides[raw.id] ?? tagsByDimension[raw.dimension as DimensionId],
}));

type GameEditorial = { genres:string[]; tags:string[]; baseline:string; resource?:string[]; progression?:string[] };
const editorial: Record<string,GameEditorial> = {
  balatro:{genres:['roguelite','deckbuilder'],tags:['卡牌','构筑','计分挑战'],baseline:'标准单人战役',resource:['设计归纳：筹码作为盲注目标的计量；当前来源不足以建立完整商店经济。']},
  peglin:{genres:['roguelite'],tags:['动作','构筑'],baseline:'标准单人冒险'},
  'slay-the-spire':{genres:['roguelite','deckbuilder'],tags:['卡牌','构筑','策略'],baseline:'第一作标准单人攀塔'},
  hades:{genres:['roguelite','action-rpg'],tags:['动作','构筑','叙事'],baseline:'第一作标准单人流程',progression:['设计归纳：夜之镜强化与人物关系提供跨次尝试的延续；未核验具体数值。']},
  'cult-of-the-lamb':{genres:['roguelite'],tags:['动作','经营'],baseline:'基础单人主线'},
  'backpack-battles':{genres:['auto-battler'],tags:['构筑','策略'],baseline:'常规背包构筑与战斗'},
  'loop-hero':{genres:['roguelite'],tags:['构筑','经营','策略'],baseline:'标准远征与营地流程'},
  'vampire-survivors':{genres:['survivor-like','roguelite'],tags:['动作','构筑'],baseline:'基础标准流程',progression:['设计归纳：基础金币强化服务后续尝试，强化购买可退款重配。']},
  'risk-of-rain-2':{genres:['roguelite'],tags:['动作','构筑'],baseline:'普通冒险'},
  inscryption:{genres:['deckbuilder'],tags:['卡牌','构筑','探索','叙事'],baseline:'主线流程（章节分别记录）'},
  'stardew-valley':{genres:['farming-life-sim'],tags:['经营','生活模拟'],baseline:'标准农场流程'},
  minecraft:{genres:['sandbox-survival','survival-craft'],tags:['生存','经营','探索'],baseline:'原版单人生存模式',resource:['生存模式的采集与创造模式的无限基础材料分别记录，不能互相继承。']},
  tetris:{genres:[],tags:['空间解谜','计分挑战'],baseline:'官方基础规则'},
  'cookie-clicker':{genres:['incremental-idle'],tags:['增量','经营'],baseline:'基础生产与永久强化系统',resource:['设计归纳：饼干既是产出也是再投资资源；当前来源不足以说明离线结算。'],progression:['官方列出永久强化；未核验转生公式与具体解锁条件。']},
  'dead-cells':{genres:['roguelite','metroidvania'],tags:['动作','探索'],baseline:'基础标准流程',progression:['设计归纳：跨局保留部分道路、能力与武器权限；辅助模式和 DLC 另行取证。']},
  'escape-from-tarkov':{genres:['extraction-shooter'],tags:['动作','生存'],baseline:'基础 PvPvE 突袭',resource:['一般战利品以成功撤离为兑现目标；保险、容器与模式例外尚未核验。']},
  'game-of-dice':{genres:[],tags:['棋盘','策略','多人'],baseline:'常规个人棋盘对局',resource:['官方说明地盘、过路费与破产目标；未核验具体支付数值。']},
  'shape-of-dreams':{genres:['roguelite','action-rpg'],tags:['动作','构筑'],baseline:'PC 标准单人冒险'},
};

export const sources: Source[] = gameData.games.flatMap(raw => [
  SourceSchema.parse({id:`${raw.slug}-official`,title:raw.sourceTitle,url:raw.sourceUrl,publisher:raw.studio,
    checkedAt:raw.verifiedAt,type:raw.sourceUrl.includes('store.') || raw.sourceUrl.includes('play.google') ? 'official_store' : 'official_site',
    claimScope:`${raw.scopeNotes} 仅核验官方可读介绍与发行信息；未安装实测。`}),
  ...(raw.additionalSources ?? []).map((source,index) => SourceSchema.parse({
    id:`${raw.slug}-additional-${index + 1}`,title:source.title,url:source.url,publisher:raw.studio,
    checkedAt:raw.verifiedAt,type:'official_site',claimScope:source.supports,
  })),
]);
export const scopes: Scope[] = [];
export const gameModes: GameMode[] = [];
function addScope(gameId:string,suffix:string,kind:Scope['kind'],label:string,parentScopeId?:string):string {
  const id = `${gameId}:${suffix}`;
  if (!scopes.some(scope => scope.id === id)) scopes.push({id,gameId,kind,label,...(parentScopeId ? {parentScopeId} : {})});
  return id;
}
function addMode(gameId:string,suffix:string,label:string):string {
  const scopeId = addScope(gameId,suffix,'mode',label,`${gameId}:game`);
  if (!gameModes.some(mode => mode.scopeId === scopeId)) gameModes.push({id:`${gameId}:mode:${suffix}`,gameId,name:label,description:`研究范围：${label}。其他模式不自动继承此范围的观察。`,scopeId});
  return scopeId;
}
export const games: Game[] = gameData.games.map(raw => {
  const meta = editorial[raw.slug];
  addScope(raw.slug,'game','game',raw.name);
  const standard = addMode(raw.slug,'standard',meta.baseline);
  const defaultScopeId = raw.slug === 'inscryption' ? addScope(raw.slug,'opening','chapter','主线开篇小屋',standard) : standard;
  return GameSchema.parse({id:raw.slug,name:raw.name,studio:raw.studio,year:raw.year,yearBasis:raw.yearBasis,
    summary:raw.summary,analysis:raw.analysis,factNotes:raw.factNotes,scopeNotes:raw.scopeNotes,coreLoop:raw.coreLoop,
    learning:raw.learning,caveats:raw.caveats,sourceIds:sources.filter(source => source.id.startsWith(`${raw.slug}-`)).map(source => source.id),
    defaultScopeId,genreIds:meta.genres,corePlayTags:meta.tags,
    metadataNote:'类型与核心玩法标签为编辑归纳，用于检索，不是官方完整分类或机制证据。',
    resourceNotes:meta.resource ?? ['当前来源不足以说明完整资源流、获取条件和消耗规则；请结合已收录实例阅读。'],
    progressionNotes:meta.progression ?? ['当前来源不足以建立完整成长结构；概要中的设计归纳不代替具体规则证据。'],
  });
});
function observationScope(gameId:string,mechanicId:string):string {
  if (gameId === 'minecraft' && mechanicId === 'resource-scarcity') return addMode(gameId,'creative','创造模式基础建造');
  if (gameId === 'minecraft' && mechanicId === 'cooperative-play') return addMode(gameId,'multiplayer','多人世界、Realms 或服务器');
  if (gameId === 'cult-of-the-lamb' && mechanicId === 'permadeath') return addMode(gameId,'permadeath-challenge','Permadeath 特殊挑战');
  if (gameId === 'backpack-battles' && mechanicId === 'planning-timer') return addMode(gameId,'lobby','大厅模式');
  if (gameId === 'game-of-dice' && mechanicId === 'cooperative-play') return addMode(gameId,'team','组队赛');
  if (gameId === 'shape-of-dreams' && mechanicId === 'cooperative-play') return addMode(gameId,'cooperative','在线合作冒险');
  return games.find(game => game.id === gameId)!.defaultScopeId;
}
export const instances: MechanicInstance[] = gameData.games.flatMap(raw => raw.mechanicEvidence.map((observation,index) => MechanicInstanceSchema.parse({
  id:`${raw.slug}:observation:${index + 1}`,mechanicId:observation.mechanic,scopeId:observationScope(raw.slug,observation.mechanic),
  status:observation.status,...(observation.status === 'conditional' ? {condition:`仅在「${observation.scope}」范围成立；${observation.note}`} : {}),
  sourceIds:[sources.find(source => source.url === observation.sourceUrl)!.id],evidenceKind:'official_description',
  rationale:observation.note,scopeNote:observation.scope,
})));
export const genres: CompositeGenre[] = recipeData.compositeTypes.map(raw => CompositeGenreSchema.parse(raw));
export const recipes: HybridRecipe[] = recipeData.recipes.map(raw => HybridRecipeSchema.parse({...raw,
  evidenceNotes:[recipeData.recipePolicy.meaning,recipeData.recipePolicy.exampleMeaning,
    recipeData.exampleReferenceNotes[raw.id as keyof typeof recipeData.exampleReferenceNotes]],
}));

// Contextual design propositions, not demonstrated effects in reference games.
const relationshipRows: [string,string,MechanicRelationship['type'],string,string][] = [
  ['rule-modifier','score-threshold','rule_rewrite','规则放大计分','当修饰器改变计分公式时，基础牌型或行动的达标价值会改变。'],
  ['stacking-effects','rule-modifier','synergy','规则放大计分','在结算顺序可读的前提下，多效果可为规则修饰提供组合空间；需检验极端收益。'],
  ['aimed-launch','in-run-deck-growth','synergy','瞄准与卡组构筑原型','若卡组决定可发射对象，构筑与瞄准可分别改善结果；弹珠池不能未经定义直接视作卡组。'],
  ['randomized-encounters','aimed-launch','feedback','变化遭遇中的瞄准','不同障碍可检验玩家的瞄准判断；随机结果仍需留下可读的反馈。'],
  ['in-run-deck-growth','route-branching','feedback','路线与卡组规划','当前卡组的长短处影响选路，沿途奖励又改变后续路线价值。'],
  ['resource-scarcity','route-branching','conflict','路线与资源规划','当资源紧缺到只剩一条可行路线时，分支可能失去实际决策价值；并非两机制天然排斥。'],
  ['run-reset','persistent-stat-upgrade','synergy','重复挑战与长期成长','若重开仅清除局内状态，跨局强化可延续目标；需测试积累是否替代操作学习。'],
  ['run-reset','relationship-progression','feedback','重复尝试与人物回应','若关系内容回应尝试过程，重开可提供新情境；需避免必须失败才推进内容的激励。'],
  ['resource-gathering','base-construction','resource_supply','远征采集与营地建设','当设施配方消费外出材料时，采集为建设供给资源；具体流量仍需验证。'],
  ['base-construction','randomized-encounters','feedback','营地与外出探索','当新设施打开外出目标时，建设可改变探索动机；不是任意建设都会影响遭遇。'],
  ['recipe-crafting','spatial-loadout','resource_supply','制作与背包布局','当制作产物需要放入有限空间时，产物形状与可用格数共同约束配置。'],
  ['spatial-loadout','automatic-resolution','feedback','空间构筑与自动战斗','自动战斗若能解释触发与结果，玩家可据此调整下一轮布局。'],
  ['encounter-placement','stacking-effects','synergy','玩家布置风险路线','当布置对象存在相互作用时，叠加可增加风险收益方案；需明确作用范围。'],
  ['encounter-placement','base-construction','feedback','风险路线与营地发展','若布置风险带来可投入营地的收益，营地目标可反过来影响布置。'],
  ['resource-gathering','extraction-bank','resource_supply','采集与撤离兑现','当采集物需带出才能兑现时，已取得物品成为继续冒险的风险载体。'],
  ['resource-scarcity','extraction-bank','synergy','有限补给下的撤离','消耗中的补给可为退出时机提供依据；保留例外应明确展示。'],
  ['production-investment','persistent-unlock','feedback','增长再投资','当新权限提供新的投资选项时，产出与解锁能形成阶段性目标。'],
  ['objective-unlock','persistent-unlock','dependency','目标触发的永久权限','仅在设计规定完成目标才授予永久权限时，目标条件才是该权限的前置；不是通用必要依赖。'],
  ['dice-roll','toll-payment','synergy','骰子棋盘财产竞争','仅在骰子结果影响落点且落点触发支付时，取样与支付才形成位置收益关系。'],
  ['toll-payment','pvp-opposition','feedback','多人财产竞争','若支付改变双方可用财产，位置优势会反馈到竞争；需检验落后方有效选择。'],
  ['sequential-turns','real-time-update','alternative','同一行动阶段的推进规则','单一阶段可选择轮流行动或持续推进；不同阶段可以组合，不据此判为整款游戏冲突。'],
  ['pause-planning','planning-timer','conflict','限时规划阶段','若暂停同时冻结用于施压的计时，原规划压力可能失效；可通过分阶段计时重新组合。'],
  ['action-cooldown','dodge-move','dependency','带冷却的闪避方案','只有明确采用冷却作为再次闪避的门槛时，冷却才是此动作的前置条件。'],
  ['shared-resource-pool','cooperative-play','synergy','协作资源分配','共享资源可形成沟通与分工需求；需防止个别玩家垄断投入。'],
];
export const relationships: MechanicRelationship[] = relationshipRows.map(([from,to,type,context,rationale],index) => MechanicRelationshipSchema.parse({
  id:`relationship-${index + 1}`,from,to,type,context,rationale,evidenceKind:'editorial_analysis',sourceIds:[],
}));

export function getMechanic(id:string):Mechanic|undefined { return mechanics.find(mechanic => mechanic.id === id); }
export function getGame(id:string):Game|undefined { return games.find(game => game.id === id); }
// Explicit parent assertions inherit downward. Child observations do not
// become facts about a parent, sibling, unrelated mode, character or chapter.
function scopeChain(gameId:string,scopeId:string):string[] {
  const chain:string[] = [];
  let current = scopes.find(scope => scope.id === scopeId && scope.gameId === gameId);
  while (current && !chain.includes(current.id)) {
    chain.push(current.id);
    current = current.parentScopeId ? scopes.find(scope => scope.id === current!.parentScopeId && scope.gameId === gameId) : undefined;
  }
  return chain;
}
export function getInstances(gameId:string,scopeId?:string):MechanicInstance[] {
  if (!getGame(gameId)) return [];
  if (scopeId === undefined) {
    const owned = new Set(scopes.filter(scope => scope.gameId === gameId).map(scope => scope.id));
    return instances.filter(instance => owned.has(instance.scopeId));
  }
  const chain = scopeChain(gameId,scopeId);
  const observed = new Set<string>();
  return chain.flatMap(id => instances.filter(instance => instance.scopeId === id).filter(instance => {
    if (observed.has(instance.mechanicId)) return false;
    observed.add(instance.mechanicId);
    return true;
  }));
}
export function getInstanceStatus(gameId:string,mechanicId:string,scopeId?:string):MechanicStatus {
  const game = getGame(gameId);
  if (!game) return 'unknown';
  return getInstances(gameId,scopeId ?? game.defaultScopeId).find(instance => instance.mechanicId === mechanicId)?.status ?? 'unknown';
}
export function getRelatedGames(mechanicId:string):Game[] {
  return games.filter(game => getInstances(game.id).some(instance => instance.mechanicId === mechanicId && ['present','conditional'].includes(instance.status)));
}
export function getMechanicSupply(mechanicIds:string[]):{count:number;conditional:number;unknown:number;gameIds:string[]} {
  const requested = [...new Set(mechanicIds)];
  if (requested.length === 0) return {count:0,conditional:0,unknown:0,gameIds:[]};
  const result = {count:0,conditional:0,unknown:0,gameIds:[] as string[]};
  for (const game of games) {
    const modeScopeIds = new Set(gameModes.filter(mode => mode.gameId === game.id).map(mode => mode.scopeId));
    // A registered mode is comparable even before its first observation.
    // Empty game roots remain containers, not substitutes for mode coverage.
    const candidates = scopes.filter(scope => scope.gameId === game.id && (
      scope.id === game.defaultScopeId || scope.kind === 'mode' || modeScopeIds.has(scope.id) ||
      instances.some(instance => instance.scopeId === scope.id)
    ));
    const statuses = candidates.map(scope => requested.map(id => getInstanceStatus(game.id,id,scope.id)));
    if (statuses.some(values => values.every(value => value === 'present'))) {
      result.count += 1; result.gameIds.push(game.id);
    } else if (statuses.some(values => values.every(value => value === 'present' || value === 'conditional'))) {
      result.conditional += 1;
    } else if (statuses.some(values => !values.some(value => value === 'absent' || value === 'not_applicable'))) {
      result.unknown += 1;
    }
  }
  return result;
}

export function validateKnowledge():string[] {
  const errors:string[] = [];
  if (dimensions.length !== 9 || new Set(dimensions.map(dimension => dimension.id)).size !== 9 ||
    dimensions.some(dimension => !DimensionIdSchema.safeParse(dimension.id).success)) {
    errors.push('dimension: registry must contain exactly the nine canonical dimensions');
  }
  function checkRows<T extends {id:string}>(name:string,rows:T[],schema:{safeParse:(value:unknown) => {success:boolean;error?:{message:string}}}) {
    const ids = new Set<string>();
    for (const row of rows) {
      if (ids.has(row.id)) errors.push(`${name}: duplicate ${row.id}`);
      ids.add(row.id);
      const parsed = schema.safeParse(row);
      if (!parsed.success) errors.push(`${name}: ${row.id}: ${parsed.error?.message}`);
    }
  }
  checkRows('mechanic',mechanics,MechanicSchema);checkRows('game',games,GameSchema);checkRows('mode',gameModes,GameModeSchema);
  checkRows('scope',scopes,ScopeSchema);checkRows('instance',instances,MechanicInstanceSchema);checkRows('genre',genres,CompositeGenreSchema);
  checkRows('recipe',recipes,HybridRecipeSchema);checkRows('relationship',relationships,MechanicRelationshipSchema);checkRows('source',sources,SourceSchema);
  const mechanicIds = new Set(mechanics.map(row => row.id));
  const gameIds = new Set(games.map(row => row.id));
  const sourceIds = new Set(sources.map(row => row.id));
  const genreIds = new Set(genres.map(row => row.id));
  const scopeById = new Map(scopes.map(scope => [scope.id,scope]));
  function refs(owner:string,ids:string[],known:Set<string>,kind:string) {
    for (const id of ids) if (!known.has(id)) errors.push(`${owner}: invalid ${kind} ${id}`);
  }
  for (const mechanic of mechanics) {
    if (genreIds.has(mechanic.id)) errors.push(`${mechanic.id}: composite genre cannot be an atomic mechanic`);
    refs(mechanic.id,mechanic.relatedMechanics,mechanicIds,'mechanic');refs(mechanic.id,mechanic.evidenceRefs,gameIds,'game evidence');
  }
  for (const scope of scopes) {
    refs(scope.id,[scope.gameId],gameIds,'game');
    if (scope.parentScopeId) {
      const parent = scopeById.get(scope.parentScopeId);
      if (!parent || parent.gameId !== scope.gameId) errors.push(`${scope.id}: invalid parent ${scope.parentScopeId}`);
      const visited = new Set([scope.id]);
      let cursor = parent;
      while (cursor) {
        if (visited.has(cursor.id)) { errors.push(`${scope.id}: cyclic scope ancestry`);break; }
        visited.add(cursor.id);cursor = cursor.parentScopeId ? scopeById.get(cursor.parentScopeId) : undefined;
      }
    }
  }
  for (const game of games) {
    if (scopeById.get(game.defaultScopeId)?.gameId !== game.id) errors.push(`${game.id}: invalid default scope ${game.defaultScopeId}`);
    refs(game.id,game.sourceIds,sourceIds,'source');refs(game.id,game.genreIds,genreIds,'genre');
  }
  for (const mode of gameModes) {
    refs(mode.id,[mode.gameId],gameIds,'game');
    if (scopeById.get(mode.scopeId)?.gameId !== mode.gameId) errors.push(`${mode.id}: invalid scope ${mode.scopeId}`);
  }
  const assertions = new Set<string>();
  for (const instance of instances) {
    refs(instance.id,[instance.mechanicId],mechanicIds,'mechanic');refs(instance.id,instance.sourceIds,sourceIds,'source');
    if (!scopeById.has(instance.scopeId)) errors.push(`${instance.id}: invalid scope ${instance.scopeId}`);
    const key = `${instance.scopeId}/${instance.mechanicId}`;
    if (assertions.has(key)) errors.push(`${instance.id}: duplicate assertion ${key}`);
    assertions.add(key);
  }
  for (const genre of genres) refs(genre.id,[...genre.requiredMechanics,...genre.commonMechanics,...genre.optionalMechanics],mechanicIds,'mechanic');
  for (const recipe of recipes) {
    refs(recipe.id,recipe.mechanicIds,mechanicIds,'mechanic');refs(recipe.id,recipe.exampleGameIds,gameIds,'game');
    refs(recipe.id,Object.keys(recipe.roles),new Set(recipe.mechanicIds),'role mechanic');
    for (const id of recipe.mechanicIds) if (!recipe.roles[id]) errors.push(`${recipe.id}: missing role ${id}`);
  }
  for (const relationship of relationships) {
    refs(relationship.id,[relationship.from,relationship.to],mechanicIds,'mechanic');refs(relationship.id,relationship.sourceIds,sourceIds,'source');
  }
  return errors;
}
