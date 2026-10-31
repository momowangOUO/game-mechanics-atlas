import type { KnowledgeDataset } from '../knowledge';
import type { DimensionId, MechanicInstance, MechanicStatus } from '../model';
/** Synthetic catalog; no live game data or global array mutations. */
export function scopeFixture():KnowledgeDataset {
  const ids:DimensionId[]=['interaction','rules','temporal','buildcraft','progression','economy','information','participants','variability'];
  return {
    dimensions:ids.map(id=>({id,name:id,description:'合成维度说明',color:'#ffffff',short:id})),
    mechanics:['alpha','beta'].map(id=>({id,name:id,dimension:'rules',definition:'仅供测试的原子规则。',inclusionRules:['测试条件成立。'],exclusionRules:['排除其他条件。'],misconceptions:['不是正式游戏证据。'],designValue:['验证查询边界。'],risks:['不用于产品内容。'],adaptation:['只在测试数据中使用。'],complexity:'低',implementationNotes:'合成测试。',relatedMechanics:[],evidenceRefs:[],epistemicStatus:'editorial_definition',corePlayTags:['测试']})),
    sources:[],games:[{id:'fixture',name:'范围测试',studio:'测试',year:2000,yearBasis:'合成',summary:'合成游戏',analysis:'合成分析',factNotes:[],scopeNotes:'仅测试',coreLoop:['观察','行动','结算'],learning:[],caveats:[],sourceIds:[],defaultScopeId:'fixture:standard',genreIds:[],corePlayTags:['测试'],resourceNotes:['合成资源'],progressionNotes:['合成成长'],metadataNote:'不作为正式内容'}],
    scopes:[{id:'fixture:game',gameId:'fixture',kind:'game',label:'根'},{id:'fixture:standard',gameId:'fixture',kind:'mode',label:'默认模式',parentScopeId:'fixture:game'},{id:'fixture:alternate',gameId:'fixture',kind:'mode',label:'另一模式',parentScopeId:'fixture:game'},{id:'fixture:character',gameId:'fixture',kind:'character',label:'默认模式中的角色',parentScopeId:'fixture:standard'}],
    gameModes:['standard','alternate'].map(id=>({id:`fixture:mode:${id}`,gameId:'fixture',name:id,description:'合成模式',scopeId:`fixture:${id}`})),
    instances:[],genres:[],recipes:[],relationships:[],
  };
}
export function assertion(mechanicId:string,scope:string,status:MechanicStatus='present'):MechanicInstance {
  return {id:`${scope}:${mechanicId}`,mechanicId,scopeId:`fixture:${scope}`,status,sourceIds:[],evidenceKind:'editorial_analysis',rationale:'合成规则，绝不进入正式游戏资料。',...(status==='conditional'?{condition:'仅测试条件满足时成立。'}:{})};
}
