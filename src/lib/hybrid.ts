import { games, gameModes, getInstanceStatus, getMechanic, instances, recipes, relationships, scopes } from './knowledge';
import type { Mechanic } from './model';
export type HybridInput={core:string;mechanics:string[];structures:string[];goals:('accessible'|'replayable'|'hardcore'|'broad')[]};
export type HybridAnalysis={valid:boolean;title:string;loop:string[];roles:{mechanicId:string;name:string;role:string}[];synergies:string[];conflicts:string[];risks:string[];demoTests:string[];references:{gameId:string;scopeId:string;matchedMechanicIds:string[];missingMechanicIds:string[];complete:boolean}[];adjustments:string[];warnings:string[]};
const unique=(values:string[])=>[...new Set(values)];
const goals=['accessible','replayable','hardcore','broad'];
const decisionDimensions=new Set(['buildcraft','rules','economy','information','variability']);
const coreSteps:Record<string,string>={
  'direct-movement':'移动到目标位置，观察局面变化并决定下一次移动。',
  'aimed-launch':'观察目标与障碍，选择方向和时机后瞄准发射。',
  'piece-rotation':'旋转对象，检查当前形状能否放入预期位置。',
  'drag-placement':'拖拽并放置对象，确认占用位置及作用范围。',
  'automatic-resolution':'确认当前配置，开始自动结算并观察触发过程。',
  'in-run-deck-growth':'选择加入或调整卡组的内容，检验下一轮可用行动的变化。',
  'production-investment':'选择生产投入，观察产出并比较下一次投资的收益。',
};
function referencesFor(ids:string[]):HybridAnalysis['references'] {
  return games.flatMap(game=>{
    const modeIds=new Set(gameModes.filter(mode=>mode.gameId===game.id).map(mode=>mode.scopeId));
    const candidates=scopes.filter(scope=>scope.gameId===game.id&&(scope.id===game.defaultScopeId||scope.kind==='mode'||modeIds.has(scope.id)||instances.some(instance=>instance.scopeId===scope.id)));
    const options=candidates.map(scope=>{
      const matchedMechanicIds=ids.filter(id=>getInstanceStatus(game.id,id,scope.id)==='present');
      const missingMechanicIds=ids.filter(id=>!matchedMechanicIds.includes(id));
      return {gameId:game.id,scopeId:scope.id,matchedMechanicIds,missingMechanicIds,complete:missingMechanicIds.length===0};
    }).sort((a,b)=>b.matchedMechanicIds.length-a.matchedMechanicIds.length||Number(b.scopeId===game.defaultScopeId)-Number(a.scopeId===game.defaultScopeId)||a.scopeId.localeCompare(b.scopeId));
    return options[0]?.matchedMechanicIds.length?[options[0]]:[];
  }).sort((a,b)=>b.matchedMechanicIds.length-a.matchedMechanicIds.length||a.gameId.localeCompare(b.gameId));
}
export function analyzeHybrid(input:HybridInput):HybridAnalysis {
  const result:HybridAnalysis={valid:false,title:'机制组合待完善',loop:[],roles:[],synergies:[],conflicts:[],risks:[],demoTests:[],references:[],adjustments:[],warnings:[]};
  if(!input||typeof input.core!=='string'||!Array.isArray(input.mechanics)||!Array.isArray(input.structures)||!Array.isArray(input.goals)||[...input.mechanics,...input.structures,...input.goals].some(id=>typeof id!=='string')){
    result.warnings.push('请从已收录的原子机制中选择核心，并从列表中选择配合机制、流程结构和设计目标。');return result;
  }
  const ids=unique([input.core,...input.mechanics,...input.structures]);
  const unknown=ids.filter(id=>!getMechanic(id));
  if(unknown.length||input.goals.some(goal=>!goals.includes(goal))){
    result.warnings.push(`存在未识别的机制或目标：${unique([...unknown,...input.goals.filter(goal=>!goals.includes(goal))]).map(id=>id||'空核心').join('、')}。复合类型不能代替原子机制。`);return result;
  }
  const selected=ids.map(id=>getMechanic(id)!) as Mechanic[];
  const core=selected[0],has=(...required:string[])=>required.every(id=>ids.includes(id));
  result.valid=true;result.title=`${core.name}组合实验`;
  result.warnings.push('以下是根据已收录的机制定义和情境规则生成的设计假设，尚未经过原型验证。','参照案例只匹配同一有效范围内已确认存在的机制。未确认不等于不存在；即使全部匹配，也不能证明这些机制能产生预期的协同效果。');
  if(ids.length===1) result.warnings.push('目前只选择了一个机制，可以讨论核心规则，尚不足以判断组合关系；目标、结算和失败条件仍需定义。');
  const fullRecipes=recipes.filter(recipe=>recipe.mechanicIds.every(id=>ids.includes(id)));
  result.roles=selected.map(mechanic=>{
    const recipe=fullRecipes.find(item=>item.roles[mechanic.id]);
    const position=mechanic.id===input.core?'核心机制':input.structures.includes(mechanic.id)?'流程或结构约束':'配合机制';
    return {mechanicId:mechanic.id,name:mechanic.name,role:`${position}：${recipe?`在「${recipe.name}」假设中，${recipe.roles[mechanic.id]}`:mechanic.definition}`};
  });
  const setup=selected.filter(mechanic=>mechanic.id!==core.id&&mechanic.dimension==='buildcraft');
  if(setup.length) result.loop.push(`行动前确定配置：${setup.map(mechanic=>mechanic.name).join('、')}；并明确各选项可以调整的时机。`);
  result.loop.push(coreSteps[core.id]??`执行「${core.name}」的核心规则：${core.definition}`);
  const temporal=selected.filter(mechanic=>mechanic.id!==core.id&&mechanic.dimension==='temporal');
  if(temporal.length) result.loop.push(`按约定的阶段推进：${temporal.map(mechanic=>mechanic.name).join('、')}；分别确定触发时机与结束条件。`);
  const rules=selected.filter(mechanic=>mechanic.id!==core.id&&mechanic.dimension==='rules');
  if(rules.length) result.loop.push(`结算行动结果：${rules.map(mechanic=>mechanic.name).join('、')}；展示生效顺序与关键数值。`);
  else result.loop.push('展示行动结果，先明确本轮的成功、失败与继续条件。');
  if(has('random-upgrade-offer')) result.loop.push('在约定节点展示随机强化选项，让玩家比较收益后选择，再用下一轮行动验证效果。');
  const continuation=selected.filter(mechanic=>mechanic.id!==core.id&&['progression','economy'].includes(mechanic.dimension));
  if(continuation.length) result.loop.push(`处理资源或成长变化：${continuation.map(mechanic=>mechanic.name).join('、')}；明确保留、消耗与重置范围。`);
  result.loop.push(`根据结果调整下一次「${core.name}」决策，检查玩家能否理解变化原因。`);
  for(const relation of relationships.filter(relation=>has(relation.from,relation.to))){
    const text=`${relation.context}：${relation.rationale}`;
    if(relation.type==='conflict'||relation.type==='alternative') result.conflicts.push(text);
    else result.synergies.push(text);
  }
  if(has('aimed-launch','rule-modifier')) result.synergies.push('若规则修饰器影响命中后的结算，瞄准负责创造命中条件，修饰器负责改变结果价值；需让两者的贡献可辨认。');
  if(has('rule-modifier','random-upgrade-offer')) result.synergies.push('若随机强化选项能改变规则修饰器，选项可形成不同结算方向；需明确抽取池、叠加顺序与极端收益。');
  if(has('real-time-update','sequential-turns')) {
    result.adjustments.push('将实时推进与轮流行动分到不同阶段，例如实时行动后进入回合规划；明确切换条件以及哪些计时器继续运行。');
    result.demoTests.push('在同一行动阶段，两个推进时钟是否同时生效？切换阶段时是否出现抢行动或重复结算？');
  }
  if(has('pause-planning','real-time-update')) {
    result.synergies.push('实时推进可与暂停规划配合：暂停时制定计划，恢复后继续执行；需明确暂停是否冻结敌人、冷却与其他玩家。');
    result.adjustments.push('列出暂停冻结的系统，以及恢复时排队动作的执行顺序。');
  }
  if(has('pause-planning','planning-timer')) result.adjustments.push('把限时决策与不限时查看分为不同阶段，或明确暂停不冻结哪些计时器。');
  for(const recipe of fullRecipes){
    result.synergies.push(...recipe.synergies.map(text=>`「${recipe.name}」假设：${text}`));
    result.conflicts.push(...recipe.tensions.map(text=>`「${recipe.name}」待验证：${text}`));
    result.demoTests.push(...recipe.demoQuestions);
  }
  for(const mechanic of selected){
    result.risks.push(...mechanic.risks.map(risk=>`${mechanic.name}：${risk}`));
    if(mechanic.adaptation[0]) result.adjustments.push(`${mechanic.name}：${mechanic.adaptation[0]}`);
  }
  const goalSet=new Set(input.goals);
  if(goalSet.has('accessible')){
    const decisions=selected.filter(mechanic=>decisionDimensions.has(mechanic.dimension));
    if(decisions.length>=3){
      result.risks.unshift('如果目标是易上手，多套配置、结算或选项系统可能同时增加阅读与决策负担；机制数量本身不能说明设计质量。');
      result.adjustments.unshift('逐步开放配置与决策系统，分阶段展示选项，先测试同时需要阅读的信息量。');
    }
    result.demoTests.push('首次体验者能否在不看说明全文的情况下说出当前目标，并预测一次行动的主要结果？');
  }
  if(goalSet.has('replayable')) {
    result.demoTests.push('重复三次原型流程时，玩家是否因局面变化作出不同选择，而不只是获得不同数值？');
    result.adjustments.push('先验证两条可行策略，再增加随机内容；不要把内容数量直接当成重玩价值。');
  }
  if(goalSet.has('hardcore')) {
    result.demoTests.push('熟练玩家的判断是否能稳定改善结果，失败原因是否可解释、可练习？');
    result.risks.push('面向硬核体验的设计也需要让玩家能从反馈中学习；增加规则或惩罚不一定增加决策深度。');
  }
  if(goalSet.has('broad')) {
    result.demoTests.push('不同经验的玩家能否找到可理解的初始方案，并在需要时继续深入？');
    result.adjustments.push('提供易读的默认配置和可选的深入信息，分别检查新手与熟练玩家的操作负担。');
  }
  result.demoTests.unshift(`只保留「${core.name}」的最小版本时，玩家能否完成一次行动并理解其反馈？`);
  if(ids.length>1) result.demoTests.push('逐个移除配合机制，比较玩家决策是否发生变化；没有独立作用的组件是否可以省略？');
  result.references=referencesFor(ids);
  if(!result.references.length) result.warnings.push('收录样本尚无这些机制的已确认参照；这表示资料不足，不代表市场空白。');
  result.synergies=unique(result.synergies);result.conflicts=unique(result.conflicts);result.risks=unique(result.risks);
  result.demoTests=unique(result.demoTests);result.adjustments=unique(result.adjustments);
  return result;
}
