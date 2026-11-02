import dossierData from '../../docs/research/mechanic-dossiers.json';
import gameData from '../../docs/research/game-evidence.json';
import recipeData from '../../docs/research/genre-recipes.json';
import relationshipData from '../../docs/research/mechanic-relationships.json';
import { expandCatalog } from './expand-catalog';
import { expandedGenres } from '../data/expanded-types';
import { genreParents } from '../data/genre-relations';
import { DimensionIdSchema, MechanicSchema, GameSchema, GameModeSchema, ScopeSchema, MechanicInstanceSchema, CompositeGenreSchema, HybridRecipeSchema, MechanicRelationshipSchema, SourceSchema } from './model';
import type { DimensionId, Mechanic, Game, GameMode, Scope, MechanicInstance, CompositeGenre, HybridRecipe, MechanicRelationship, Source, MechanicStatus } from './model';
export const dimensions: {id:DimensionId;name:string;description:string;color:string;short:string}[] = [
  {id:'interaction',name:'核心交互',short:'交互',description:'玩家通过什么输入直接改变局面。',color:'#8fb7d6'},
  {id:'rules',name:'规则与结算',short:'规则',description:'行动如何被判定、组合并结算。',color:'#d69b9d'},
  {id:'temporal',name:'时间与流程',short:'流程',description:'行动如何推进，阶段与尝试如何组织。',color:'#c3a6df'},
  {id:'buildcraft',name:'构筑与配置',short:'构筑',description:'玩家如何配置可用能力与内容。',color:'#dfbd77'},
  {id:'progression',name:'成长与延续',short:'成长',description:'哪些能力、权限和关系随过程改变或保留。',color:'#adbf92'},
  {id:'economy',name:'资源与经济',short:'资源',description:'资源如何获取、转换、共享与消耗。',color:'#d7aa86'},
  {id:'information',name:'信息与认知',short:'信息',description:'玩家能获知什么，以及如何判断局面。',color:'#88cdc5'},
  {id:'participants',name:'参与者关系',short:'参与',description:'玩家之间怎样协作、竞争与同步。',color:'#d5a0c8'},
  {id:'variability',name:'变化与随机',short:'变化',description:'内容与结果如何产生变化或被重现。',color:'#a5b5df'},
];

export const mechanics = dossierData.mechanisms.map(raw => MechanicSchema.parse(raw));
const expanded = expandCatalog(gameData.games.map(raw => GameSchema.parse(raw)),gameData.sources.map(raw => SourceSchema.parse(raw)));
export const sources = expanded.sources;
export const games = expanded.games;
export const gameModes = [...gameData.gameModes.map(raw => GameModeSchema.parse(raw)),...expanded.gameModes];
export const scopes = [...gameData.scopes.map(raw => ScopeSchema.parse(raw)),...expanded.scopes];
export const instances = [...gameData.instances.map(raw => MechanicInstanceSchema.parse(raw)),...expanded.instances];
const evidenceGameByScope=new Map(scopes.map(scope=>[scope.id,scope.gameId]));
for(const mechanic of mechanics)mechanic.evidenceRefs=[...new Set([...mechanic.evidenceRefs,...instances.filter(row=>row.mechanicId===mechanic.id&&(row.status==='present'||row.status==='conditional')).map(row=>evidenceGameByScope.get(row.scopeId)!).filter(Boolean)])];
export const genres = [...recipeData.compositeTypes,...expandedGenres].map(raw => CompositeGenreSchema.parse({...raw,parentGenreIds:genreParents[raw.id]??[]}));
export const recipes = recipeData.recipes.map(raw => HybridRecipeSchema.parse({...raw,evidenceNotes:[recipeData.recipePolicy.meaning,recipeData.recipePolicy.exampleMeaning,recipeData.exampleReferenceNotes[raw.id as keyof typeof recipeData.exampleReferenceNotes]]}));
export const relationships = relationshipData.map(raw => MechanicRelationshipSchema.parse(raw));
export type KnowledgeDataset = {dimensions:typeof dimensions;mechanics:Mechanic[];sources:Source[];games:Game[];gameModes:GameMode[];scopes:Scope[];instances:MechanicInstance[];genres:CompositeGenre[];recipes:HybridRecipe[];relationships:MechanicRelationship[]};
export const dataset:KnowledgeDataset={dimensions,mechanics,sources,games,gameModes,scopes,instances,genres,recipes,relationships};
/** Each query instance owns a snapshot. Tests and callers never mutate the production catalog. */
export function createKnowledgeBase(input:KnowledgeDataset) {
const {dimensions,mechanics,sources,games,gameModes,scopes,instances,genres,recipes,relationships}=structuredClone(input);
const gameById=new Map(games.map(row=>[row.id,row]));
const mechanicById=new Map(mechanics.map(row=>[row.id,row]));
const scopeById=new Map(scopes.map(row=>[row.id,row]));
const instancesByScope=new Map<string,MechanicInstance[]>();
for(const row of instances){const bucket=instancesByScope.get(row.scopeId)??[];bucket.push(row);instancesByScope.set(row.scopeId,bucket);}
const scopesByGame=new Map<string,Scope[]>();
for(const row of scopes){const bucket=scopesByGame.get(row.gameId)??[];bucket.push(row);scopesByGame.set(row.gameId,bucket);}
const instancesByGame=new Map<string,MechanicInstance[]>();
for(const row of instances){const gameId=scopeById.get(row.scopeId)?.gameId;if(!gameId)continue;const bucket=instancesByGame.get(gameId)??[];bucket.push(row);instancesByGame.set(gameId,bucket);}
const modeScopeIds=new Set(gameModes.map(mode=>mode.scopeId));
const candidatesByGame=new Map(games.map(game=>[game.id,(scopesByGame.get(game.id)??[]).filter(scope=>scope.id===game.defaultScopeId||scope.kind==='mode'||modeScopeIds.has(scope.id)||instancesByScope.has(scope.id))]));
const resolvedScopes=new Map<string,MechanicInstance[]>();
function getMechanic(id:string):Mechanic|undefined { return mechanicById.get(id); }
function getGame(id:string):Game|undefined { return gameById.get(id); }
// Explicit parent assertions inherit downward. Child observations do not
// become facts about a parent, sibling, unrelated mode, character or chapter.
function scopeChain(gameId:string,scopeId:string):string[] {
  const chain:string[] = [];
  let current = scopeById.get(scopeId)?.gameId === gameId ? scopeById.get(scopeId) : undefined;
  while (current && !chain.includes(current.id)) {
    chain.push(current.id);
    current = current.parentScopeId ? scopeById.get(current.parentScopeId)?.gameId === gameId ? scopeById.get(current.parentScopeId) : undefined : undefined;
  }
  return chain;
}
function getInstances(gameId:string,scopeId?:string):MechanicInstance[] {
  if (!getGame(gameId)) return [];
  if (scopeId === undefined) {
    return [...(instancesByGame.get(gameId) ?? [])];
  }
  const cacheKey=`${gameId}/${scopeId}`;
  const cached=resolvedScopes.get(cacheKey);
  if(cached)return [...cached];
  const chain = scopeChain(gameId,scopeId);
  const observed = new Set<string>();
  const resolved=chain.flatMap(id => (instancesByScope.get(id) ?? []).filter(instance => {
    if (observed.has(instance.mechanicId)) return false;
    observed.add(instance.mechanicId);
    return true;
  }));
  resolvedScopes.set(cacheKey,resolved);
  return [...resolved];
}
function getInstanceStatus(gameId:string,mechanicId:string,scopeId?:string):MechanicStatus {
  const game = getGame(gameId);
  if (!game) return 'unknown';
  return getInstances(gameId,scopeId ?? game.defaultScopeId).find(instance => instance.mechanicId === mechanicId)?.status ?? 'unknown';
}
function getRelatedGames(mechanicId:string):Game[] {
  return games.filter(game => getInstances(game.id).some(instance => instance.mechanicId === mechanicId && ['present','conditional'].includes(instance.status)));
}
function getMechanicSupply(mechanicIds:string[]):{count:number;conditional:number;unknown:number;gameIds:string[]} {
  const requested = [...new Set(mechanicIds)];
  if (requested.length === 0) return {count:0,conditional:0,unknown:0,gameIds:[]};
  const result = {count:0,conditional:0,unknown:0,gameIds:[] as string[]};
  for (const game of games) {
    // A registered mode is comparable even before its first observation.
    // Empty game roots remain containers, not substitutes for mode coverage.
    const candidates = candidatesByGame.get(game.id) ?? [];
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

function validateKnowledge():string[] {
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
  const sourceById = new Map(sources.map(row => [row.id,row]));
  const sourceUrls = new Set<string>();
  for(const source of sources){if(sourceUrls.has(source.url))errors.push(`${source.id}: duplicate source URL ${source.url}`);sourceUrls.add(source.url);}
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
    for(const id of instance.sourceIds){
      const source=sourceById.get(id);if(!source)continue;
      if(instance.evidenceKind==='official_description'&&!['official_site','official_store'].includes(source.type))errors.push(`${instance.id}: source is not an official description ${id}`);
      if(instance.evidenceKind==='manual'&&source.type!=='manual')errors.push(`${instance.id}: source is not a manual ${id}`);
      if(instance.evidenceKind==='community_documentation'&&source.type!=='community')errors.push(`${instance.id}: source is not community documentation ${id}`);
      if(instance.evidenceKind==='developer_description'&&source.type!=='developer')errors.push(`${instance.id}: source is not developer documentation ${id}`);
    }
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

return {getMechanic,getGame,getInstances,getInstanceStatus,getRelatedGames,getMechanicSupply,validateKnowledge};
}
const knowledge=createKnowledgeBase(dataset);
export const {getMechanic,getGame,getInstances,getInstanceStatus,getRelatedGames,getMechanicSupply,validateKnowledge}=knowledge;
