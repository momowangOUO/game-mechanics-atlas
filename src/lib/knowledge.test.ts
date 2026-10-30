import { afterEach, describe, expect, it } from 'vitest';
import { DimensionIdSchema, MechanicInstanceSchema, MechanicSchema, MechanicStatusSchema } from './model';
import { dimensions, mechanics, games, gameModes, scopes, instances, genres, recipes, relationships, sources, getMechanic, getGame, getInstances, getInstanceStatus, getRelatedGames, getMechanicSupply, validateKnowledge } from './knowledge';

describe('canonical catalog', () => {
  it('preserves prepared coverage and the nine identity dimensions', () => {
    expect(mechanics).toHaveLength(52);
    expect(games).toHaveLength(18);
    expect(genres).toHaveLength(16);
    expect(recipes).toHaveLength(10);
    expect(dimensions.map(d => d.id).sort()).toEqual(['interaction','rules','temporal','buildcraft','progression','economy','information','participants','variability'].sort());
    expect(DimensionIdSchema.safeParse('roguelite').success).toBe(false);
    for (const [id, dimension] of Object.entries({ 'run-reset':'temporal', 'rule-modifier':'rules', 'recipe-crafting':'economy', respec:'buildcraft', 'shared-resource-pool':'economy', permadeath:'progression' })) {
      expect(getMechanic(id)?.dimension).toBe(dimension);
    }
    for (const genre of genres) expect(getMechanic(genre.id)).toBeUndefined();
  });

  it('validates source, scope and entity references without fabricating observations', () => {
    expect(validateKnowledge()).toEqual([]);
    expect(instances).toHaveLength(38);
    expect(relationships.length).toBeGreaterThanOrEqual(20);
    expect(gameModes.length).toBeGreaterThanOrEqual(18);
    expect(sources.length).toBeGreaterThanOrEqual(18);
    for (const instance of instances) expect('dimension' in instance).toBe(false);
    expect(MechanicSchema.safeParse({...mechanics[0], dimension:'roguelite'}).success).toBe(false);
  });

  it('accepts all five statuses but rejects missing conditional explanations and dimension copies', () => {
    const fixture = { id:'synthetic', mechanicId:'run-reset', scopeId:'synthetic-scope', sourceIds:[], evidenceKind:'editorial_analysis', rationale:'合成测试范围，仅验证状态结构。' };
    for (const status of ['present','absent','not_applicable','unknown','conditional']) {
      expect(MechanicStatusSchema.safeParse(status).success).toBe(true);
      expect(MechanicInstanceSchema.safeParse({...fixture, status, ...(status === 'conditional' ? {condition:'仅测试条件成立时'} : {})}).success).toBe(true);
    }
    expect(MechanicInstanceSchema.safeParse({...fixture, status:'conditional'}).success).toBe(false);
    expect(MechanicInstanceSchema.safeParse({...fixture, status:'conditional', condition:'  '}).success).toBe(false);
    expect(MechanicInstanceSchema.safeParse({...fixture, status:'present', dimension:'temporal'}).success).toBe(false);
  });

  it('detects a duplicated dimension registry entry', () => {
    dimensions.push({...dimensions[0]});
    try { expect(validateKnowledge().join('\n')).toContain('dimension'); }
    finally { dimensions.pop(); }
  });
});

describe('scope-aware queries', () => {
  it('keeps unknown observations unknown instead of filling a negative matrix', () => {
    expect(getInstanceStatus('tetris','permadeath')).toBe('unknown');
    expect(getInstanceStatus('missing-game','run-reset')).toBe('unknown');
    expect(getInstances('missing-game')).toEqual([]);
    expect(getGame('missing-game')).toBeUndefined();
    expect(getRelatedGames('piece-rotation').map(g => g.id)).toEqual(['tetris']);
  });

  it('isolates special modes while preserving exact observation labels', () => {
    const lobby = getInstances('backpack-battles').find(i => i.mechanicId === 'planning-timer')!;
    expect(getInstanceStatus('backpack-battles','planning-timer')).toBe('unknown');
    expect(getInstanceStatus('backpack-battles','planning-timer',lobby.scopeId)).toBe('conditional');
    expect(lobby.scopeNote).toBe('大厅模式');
    const creative = getInstances('minecraft').find(i => i.mechanicId === 'resource-scarcity')!;
    expect(getInstanceStatus('minecraft','resource-scarcity')).toBe('unknown');
    expect(getInstanceStatus('minecraft','resource-scarcity',creative.scopeId)).toBe('absent');
    expect(getInstanceStatus('tetris','resource-scarcity',creative.scopeId)).toBe('unknown');
  });

  it('combines only observations supported in the same compatible scope', () => {
    expect(getMechanicSupply(['score-threshold','rule-modifier'])).toMatchObject({count:1, conditional:0, gameIds:['balatro']});
    expect(getMechanicSupply(['spatial-loadout','planning-timer']).count).toBe(0);
    expect(getMechanicSupply(['spatial-loadout','planning-timer']).conditional).toBe(0);
    expect(getMechanicSupply(['resource-gathering','cooperative-play']).conditional).toBe(0);
    expect(getMechanicSupply(['cooperative-play'])).toMatchObject({count:0,conditional:3});
    expect(getMechanicSupply(['unknown-mechanic'])).toMatchObject({count:0,conditional:0,unknown:18});
    expect(getMechanicSupply([])).toEqual({count:0,conditional:0,unknown:0,gameIds:[]});
  });

  const originalScopes = scopes.length;
  const originalInstances = instances.length;
  const originalGames = games.length;
  const originalModes = gameModes.length;
  afterEach(() => {
    scopes.splice(originalScopes); instances.splice(originalInstances);
    games.splice(originalGames); gameModes.splice(originalModes);
  });

  it('keeps unresearched modes unknown regardless of unrelated observations and does not substitute the game root', () => {
    const before = getMechanicSupply(['direct-movement']);
    expect(before).toEqual({count:0,conditional:0,unknown:18,gameIds:[]});
    const id = 'synthetic-review-game';
    games.push({...games[0],id,name:'合成范围测试游戏',defaultScopeId:`${id}:default`});
    scopes.push({id:`${id}:game`,gameId:id,kind:'game',label:'合成游戏根范围'});
    for (const suffix of ['default','unresearched']) {
      scopes.push({id:`${id}:${suffix}`,gameId:id,kind:'mode',label:`合成模式 ${suffix}`,parentScopeId:`${id}:game`});
      gameModes.push({id:`${id}:mode:${suffix}`,gameId:id,name:`合成模式 ${suffix}`,description:'只用于范围回归测试。',scopeId:`${id}:${suffix}`});
    }
    instances.push({id:'synthetic-review-absence',mechanicId:'direct-movement',scopeId:`${id}:default`,status:'absent',sourceIds:[],evidenceKind:'editorial_analysis',rationale:'合成测试：仅默认模式明确不存在所查机制。'});
    expect(validateKnowledge()).toEqual([]);
    expect(getInstanceStatus(id,'direct-movement',`${id}:unresearched`)).toBe('unknown');
    const withEmptyMode = getMechanicSupply(['direct-movement']);
    expect(withEmptyMode).toEqual({count:0,conditional:0,unknown:19,gameIds:[]});

    instances.push({id:'synthetic-review-unrelated',mechanicId:'piece-rotation',scopeId:`${id}:unresearched`,status:'present',sourceIds:[],evidenceKind:'editorial_analysis',rationale:'合成测试：与所查机制无关的观察。'});
    expect(validateKnowledge()).toEqual([]);
    expect(getMechanicSupply(['direct-movement'])).toEqual(withEmptyMode);

    instances.push({id:'synthetic-review-second-absence',mechanicId:'direct-movement',scopeId:`${id}:unresearched`,status:'absent',sourceIds:[],evidenceKind:'editorial_analysis',rationale:'合成测试：第二模式也已有明确反面判断。'});
    expect(validateKnowledge()).toEqual([]);
    expect(getInstanceStatus(id,'direct-movement',`${id}:game`)).toBe('unknown');
    expect(getMechanicSupply(['direct-movement'])).toEqual(before);
  });
  it('counts a game once even when duplicate selection or a second scope matches', () => {
    scopes.push({id:'synthetic-second-tetris',gameId:'tetris',kind:'mode',label:'合成测试模式'});
    instances.push({id:'synthetic-second-rotation',scopeId:'synthetic-second-tetris',mechanicId:'piece-rotation',status:'present',sourceIds:[],evidenceKind:'editorial_analysis',rationale:'合成测试，不作为正式游戏事实。'});
    expect(getMechanicSupply(['piece-rotation','piece-rotation'])).toMatchObject({count:1,conditional:0,gameIds:['tetris']});
  });

  it('rejects broken foreign keys and cross-game parent scopes', () => {
    scopes.push({id:'synthetic-invalid',gameId:'tetris',kind:'character',label:'合成错误范围',parentScopeId:getGame('balatro')!.defaultScopeId});
    instances.push({id:'synthetic-bad-reference',scopeId:'synthetic-invalid',mechanicId:'roguelite',status:'unknown',sourceIds:['missing-source'],evidenceKind:'editorial_analysis',rationale:'合成测试，不作为正式游戏事实。'});
    const errors = validateKnowledge().join('\n');
    expect(errors).toContain('synthetic-invalid');
    expect(errors).toContain('roguelite');
    expect(errors).toContain('missing-source');
  });

  it('inherits explicit parent facts downward but never promotes a character fact or combines siblings', () => {
    const parent = getGame('tetris')!.defaultScopeId;
    scopes.push({id:'synthetic-character-a',gameId:'tetris',kind:'character',label:'合成角色 A',parentScopeId:parent});
    scopes.push({id:'synthetic-character-b',gameId:'tetris',kind:'character',label:'合成角色 B',parentScopeId:parent});
    instances.push({id:'synthetic-character-reset',scopeId:'synthetic-character-a',mechanicId:'run-reset',status:'conditional',condition:'合成角色 A 条件',sourceIds:[],evidenceKind:'editorial_analysis',rationale:'合成测试，不作为正式游戏事实。'});
    instances.push({id:'synthetic-character-cooldown',scopeId:'synthetic-character-b',mechanicId:'action-cooldown',status:'present',sourceIds:[],evidenceKind:'editorial_analysis',rationale:'合成测试，不作为正式游戏事实。'});
    expect(getInstanceStatus('tetris','piece-rotation','synthetic-character-a')).toBe('present');
    expect(getInstanceStatus('tetris','run-reset')).toBe('unknown');
    expect(getInstanceStatus('tetris','run-reset','synthetic-character-b')).toBe('unknown');
    expect(getMechanicSupply(['piece-rotation','run-reset'])).toMatchObject({count:0,conditional:1});
    expect(getMechanicSupply(['run-reset','action-cooldown'])).toMatchObject({count:0,conditional:0});
  });
});
