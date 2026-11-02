import {describe,expect,it} from 'vitest';
import {DimensionIdSchema,MechanicInstanceSchema,MechanicSchema,MechanicStatusSchema} from './model';
import {createKnowledgeBase,dataset,dimensions,games,genres,instances,mechanics,recipes,relationships,sources,getGame,getInstanceStatus,getInstances,getMechanic,validateKnowledge} from './knowledge';
import {assertion,scopeFixture} from './fixtures/knowledge-fixture';
import {minimumSupportedMechanics} from './case-completeness';
describe('canonical catalog',()=>{
  it('keeps nine dimensions and normalized references',()=>{
    expect(dimensions).toHaveLength(9);expect(new Set(dimensions.map(d=>d.id)).size).toBe(9);
    expect(DimensionIdSchema.safeParse('roguelite').success).toBe(false);
    expect(mechanics.length).toBeGreaterThanOrEqual(120);
    for(const rows of [games,genres,recipes]){expect(rows.length).toBeGreaterThan(0);expect(new Set(rows.map(row=>row.id)).size).toBe(rows.length);}
    expect(relationships.length).toBeGreaterThanOrEqual(120);expect(instances.filter(i=>['present','conditional'].includes(i.status)).length).toBeGreaterThanOrEqual(600);
    expect(new Set(sources.map(s=>s.url)).size).toBeGreaterThanOrEqual(120);expect(validateKnowledge()).toEqual([]);
    for(const game of games){expect(getInstances(game.id).filter(i=>['present','conditional'].includes(i.status)).length,game.id).toBeGreaterThanOrEqual(minimumSupportedMechanics(game));expect(game.coreLoop.length).toBeGreaterThanOrEqual(3);expect(game.coreLoop.length).toBeLessThanOrEqual(6);}
  });
  it('preserves original mechanic identity and separates genres',()=>{
    for(const[id,dimension]of Object.entries({'run-reset':'temporal','rule-modifier':'rules','recipe-crafting':'economy',respec:'buildcraft','shared-resource-pool':'economy',permadeath:'progression'}))expect(getMechanic(id)?.dimension).toBe(dimension);
    for(const genre of genres)expect(getMechanic(genre.id)).toBeUndefined();expect(MechanicSchema.safeParse({...mechanics[0],dimension:'roguelite'}).success).toBe(false);expect(getGame('balatro')?.aliases).toContain('小丑牌');
  });
  it('requires cited factual evidence and explicit conditions',()=>{
    const row=assertion('alpha','standard');for(const status of ['present','absent','not_applicable','unknown','conditional'])expect(MechanicStatusSchema.safeParse(status).success).toBe(true);
    expect(MechanicInstanceSchema.safeParse({...row,status:'conditional'}).success).toBe(false);expect(MechanicInstanceSchema.safeParse({...row,status:'conditional',condition:'  '}).success).toBe(false);expect(MechanicInstanceSchema.safeParse({...row,dimension:'rules'}).success).toBe(false);
    for(const evidenceKind of ['official_description','manual','developer_description','community_documentation'])expect(MechanicInstanceSchema.safeParse({...row,evidenceKind}).success).toBe(false);
  });
  it('does not fill unknowns or transfer observations across games',()=>{
    expect(getInstanceStatus('missing','run-reset')).toBe('unknown');expect(getInstances('missing')).toEqual([]);expect(getGame('missing')).toBeUndefined();expect(getInstanceStatus('tetris','permadeath')).toBe('unknown');
    expect(getInstanceStatus('tetris','resource-scarcity','minecraft:creative')).toBe('unknown');expect(getInstanceStatus('minecraft','resource-scarcity','minecraft:creative')).toBe('absent');
  });
});
describe('isolated scope queries',()=>{
  it('inherits only downward and closest observations override ancestors',()=>{
    const input=scopeFixture();input.instances=[assertion('alpha','game'),assertion('alpha','character','absent'),assertion('beta','standard')];const kb=createKnowledgeBase(input);
    expect(kb.getInstanceStatus('fixture','alpha','fixture:standard')).toBe('present');expect(kb.getInstanceStatus('fixture','alpha','fixture:character')).toBe('absent');expect(kb.getInstanceStatus('fixture','beta','fixture:character')).toBe('present');expect(kb.getInstanceStatus('fixture','beta','fixture:alternate')).toBe('unknown');expect(kb.getInstanceStatus('fixture','beta','fixture:game')).toBe('unknown');
  });
  it('never combines unrelated modes',()=>{
    const input=scopeFixture();input.instances=[assertion('alpha','standard'),assertion('beta','alternate')];expect(createKnowledgeBase(input).getMechanicSupply(['alpha','beta'])).toEqual({count:0,conditional:0,unknown:1,gameIds:[]});
  });
  it('keeps an unresearched mode unknown even when other modes show absence',()=>{
    const input=scopeFixture();input.instances=[assertion('alpha','standard','absent')];expect(createKnowledgeBase(input).getMechanicSupply(['alpha']).unknown).toBe(1);
    input.instances.push(assertion('beta','alternate'));expect(createKnowledgeBase(input).getMechanicSupply(['alpha']).unknown).toBe(1);
    input.instances.push(assertion('alpha','alternate','not_applicable'));expect(createKnowledgeBase(input).getMechanicSupply(['alpha'])).toEqual({count:0,conditional:0,unknown:0,gameIds:[]});
  });
  it('separates conditional supply and deduplicates game matches',()=>{
    const input=scopeFixture();input.instances=[assertion('alpha','standard'),assertion('beta','standard','conditional'),assertion('alpha','alternate')];const kb=createKnowledgeBase(input);
    expect(kb.getMechanicSupply(['alpha','alpha'])).toEqual({count:1,conditional:0,unknown:0,gameIds:['fixture']});expect(kb.getMechanicSupply(['alpha','beta'])).toEqual({count:0,conditional:1,unknown:0,gameIds:[]});expect(kb.getMechanicSupply([])).toEqual({count:0,conditional:0,unknown:0,gameIds:[]});
  });
  it('builds independent immutable-input snapshots',()=>{
    const input=scopeFixture(),first=createKnowledgeBase(input);input.instances.push(assertion('alpha','standard'));const second=createKnowledgeBase(input);
    expect(first.getInstanceStatus('fixture','alpha')).toBe('unknown');expect(second.getInstanceStatus('fixture','alpha')).toBe('present');expect(createKnowledgeBase(dataset).validateKnowledge()).toEqual([]);
  });
  it('checks duplicates, references, dimensions and ancestry cycles',()=>{
    const input=scopeFixture();input.dimensions.push({...input.dimensions[0]});input.scopes[0].parentScopeId='fixture:character';input.instances=[assertion('missing','standard'),assertion('missing','standard')];input.instances[0].sourceIds=['missing-source'];const errors=createKnowledgeBase(input).validateKnowledge().join('\n');
    expect(errors).toContain('dimension');expect(errors).toContain('cyclic scope ancestry');expect(errors).toContain('invalid mechanic');expect(errors).toContain('invalid source');expect(errors).toContain('duplicate assertion');
  });
});
