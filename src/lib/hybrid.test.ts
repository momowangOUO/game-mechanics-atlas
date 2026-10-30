import { describe, expect, it } from 'vitest';
import { analyzeHybrid } from './hybrid';
import { getInstanceStatus } from './knowledge';
const base={core:'aimed-launch',mechanics:['rule-modifier','random-upgrade-offer'],structures:[],goals:[]};

describe('rule-driven design hypotheses',()=>{
  it('explains aimed-launch, modifiers and random offers with distinct roles and an actionable loop',()=>{
    const result=analyzeHybrid(base);
    expect(result.valid).toBe(true);expect(result.roles.map(r=>r.mechanicId)).toEqual(['aimed-launch','rule-modifier','random-upgrade-offer']);
    expect(result.loop.join(' ')).toMatch(/瞄准|发射/); expect(result.loop.join(' ')).toMatch(/随机|选项/);
    expect(result.synergies.join(' ')).toMatch(/规则|结算/);expect(result.demoTests.length).toBeGreaterThan(0);
    expect(result.roles.every(r=>r.role.length>5)).toBe(true);
    expect(result.risks.length).toBeGreaterThan(0);
  });
  it('deduplicates selection and rejects unknown core or ingredients without invented advice',()=>{
    expect(analyzeHybrid({...base,mechanics:['aimed-launch','rule-modifier','rule-modifier'],structures:['rule-modifier']}).roles).toHaveLength(2);
    for(const input of [{...base,core:''},{...base,core:'roguelite'},{...base,mechanics:['not-real']}]){
      const r=analyzeHybrid(input);expect(r.valid).toBe(false);expect(r.warnings.length).toBeGreaterThan(0);expect(r.references).toEqual([]);
    }
  });
  it('treats two clocks as a phase design question, and allows pause planning with real time',()=>{
    const clash=analyzeHybrid({...base,structures:['real-time-update','sequential-turns']});
    expect(clash.conflicts.join(' ')).toMatch(/同一.*阶段/);expect(clash.adjustments.join(' ')).toMatch(/分.*阶段|阶段.*分/);
    const pause=analyzeHybrid({...base,mechanics:['pause-planning'],structures:['real-time-update']});
    expect(pause.synergies.join(' ')).toMatch(/暂停/);expect(pause.conflicts).toHaveLength(0);
  });
  it('warns about reading and decision costs for accessibility instead of rewarding mechanic count',()=>{
    const r=analyzeHybrid({...base,mechanics:['in-run-deck-growth','spatial-loadout','loadout-selection','random-upgrade-offer'],goals:['accessible']});
    expect(r.risks.join(' ')).toMatch(/阅读|决策/);expect(r.adjustments.join(' ')).toMatch(/逐步|分.*阶段|同时/);
    expect(r).not.toHaveProperty('score');
  });
  it('uses scope-compatible confirmed references and calls other ingredients unconfirmed',()=>{
    const r=analyzeHybrid({...base,core:'spatial-loadout',mechanics:['automatic-resolution','planning-timer']});
    const ref=r.references.find(g=>g.gameId==='backpack-battles')!;
    expect(ref.matchedMechanicIds).toEqual(['spatial-loadout','automatic-resolution']);
    expect(ref.missingMechanicIds).toEqual(['planning-timer']);expect(ref.complete).toBe(false);
    expect(r.warnings.join(' ')).toMatch(/未确认|不代表/);
    for(const reference of r.references) for(const id of reference.matchedMechanicIds) expect(getInstanceStatus(reference.gameId,id,reference.scopeId)).toBe('present');
    expect(new Set(r.references.map(g=>g.gameId)).size).toBe(r.references.length);
  });
  it('finds a documented two-mechanic subset but never validates an entire recipe from partial evidence',()=>{
    const complete=analyzeHybrid({...base,core:'score-threshold',mechanics:['rule-modifier']});
    expect(complete.references.find(r=>r.gameId==='balatro')).toMatchObject({complete:true,missingMechanicIds:[]});
    const partial=analyzeHybrid({...base,core:'score-threshold',mechanics:['rule-modifier','stacking-effects']});
    expect(partial.references.find(r=>r.gameId==='balatro')).toMatchObject({complete:false,missingMechanicIds:['stacking-effects']});
    const few=analyzeHybrid({...base,mechanics:[]});
    expect(few.valid).toBe(true);expect(few.warnings.join(' ')).toMatch(/单个|一个|不足/);
  });
});
