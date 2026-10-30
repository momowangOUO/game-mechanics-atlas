import { describe, expect, it } from 'vitest';
import { analyzeHeat, validateSearchImport, normalizeQuery, heatTopics, searchSeed, scoreHeat } from './heat';
import type { SearchQueryStat } from './heat';
import { getMechanicSupply } from './knowledge';

const endDate = '2026-10-30';
const row = (id:string, count:number, topicId='mechanic:piece-rotation', date=endDate):SearchQueryStat => ({id,datasetId:'test',date,query:id,count,region:'CN',language:'zh-CN',sourceKind:'synthetic',attributions:[{topicId,weight:1,mode:'direct'}]});
const envelope = (records:unknown[]) => ({schemaVersion:1,records});
const period = (previous:number,current:number) => Array.from({length:14},(_,i) => row(`day-${i}`,i<7?previous:current,'mechanic:piece-rotation',new Date(Date.UTC(2026,9,17+i)).toISOString().slice(0,10)));

describe('heat import boundary', () => {
  it('normalizes reviewed aliases without creating duplicate events or guessing ambiguous queries', () => {
    expect(normalizeQuery('  ＬＯＬ  ')).toBe(normalizeQuery('League of Legends'));
    expect(normalizeQuery('  MOBA  玩法 ')).toBe('moba 玩法');
    expect(normalizeQuery('射击')).toBe('射击');
    const input = [row('a',1),{...row('b',2),query:'  LOL  ',attributions:[]}];
    const result = validateSearchImport(envelope(input));
    expect(result.success).toBe(true);
    if(result.success) expect(result.stats).toHaveLength(2);
    expect(input[1].query).toBe('  LOL  ');
  });
  it('rejects duplicate IDs atomically and gives record paths', () => {
    const result=validateSearchImport(envelope([row('same',1),row('same',2)]));
    expect(result.success).toBe(false);
    expect(result.errors.join(' ')).toMatch(/records.*1.*id/);
    expect(result).not.toHaveProperty('stats');
    expect(()=>analyzeHeat([row('same',1),row('same',2)])).toThrow();
  });
  it('keeps one dataset provenance consistent and never relabels synthetic imports as real',()=>{
    const synthetic=row('synthetic',10),log={...row('log',20),sourceKind:'site_log' as const};
    const invalid=validateSearchImport(envelope([synthetic,log]));
    expect(invalid.success).toBe(false);expect(invalid.errors.join(' ')).toMatch(/sourceKind|来源/);
    log.datasetId='different-source';
    const imported=validateSearchImport(envelope([synthetic,log]));
    expect(imported.success).toBe(true);
    if(imported.success){
      expect(imported.stats[0].sourceKind).toBe('synthetic');
      const result=analyzeHeat(imported.stats);
      expect(result.sourceKinds).toEqual(['site_log','synthetic']);expect(result.seedOnly).toBe(false);
      expect(result.warnings.join(' ')).toMatch(/混合|多种来源/);
      expect(result.totalSearches).toBe(30);
    }
  });
  it.each([-1,NaN,Infinity,1.5,Number.MAX_SAFE_INTEGER+1])('rejects invalid count %s',count=>{
    expect(validateSearchImport(envelope([row('bad',count)])).success).toBe(false);
  });
  it.each(['2026-02-29','2026-04-31','2026-13-01','2026-1-01','nonsense'])('rejects invalid calendar date %s',date=>{
    expect(validateSearchImport(envelope([row('bad',1,undefined,date)])).success).toBe(false);
  });
  it('rejects unknown IDs, attribution modes, shapes and weights by dimension',()=>{
    for(const patch of [{attributions:[{topicId:'bad',weight:1,mode:'direct'}]},{count:'12'},{sourceKind:'real'},{extra:true},{attributions:[{topicId:'genre:moba',weight:0,mode:'direct'}]},{attributions:[{topicId:'genre:moba',weight:1.1,mode:'direct'}]},{attributions:[{topicId:'genre:moba',weight:0.6,mode:'direct'},{topicId:'genre:roguelite',weight:0.6,mode:'proxy'}]},{attributions:[{topicId:'genre:moba',weight:1,mode:'guess'}]}]) {
      expect(validateSearchImport(envelope([{...row('bad',1),...patch}])).success).toBe(false);
    }
    expect(validateSearchImport({schemaVersion:2,records:[]}).success).toBe(false);
    expect(validateSearchImport([]).success).toBe(false);
    expect(validateSearchImport(envelope([row('leap',1,undefined,'2024-02-29')])).success).toBe(true);
  });
});

describe('demand and sample supply',()=>{
  it('distinguishes missing current measurements from explicitly measured zeros and partial coverage',()=>{
    const rotationZeros=period(0,0).slice(7);
    const clear=rotationZeros.map(record=>({...record,id:`clear-${record.id}`,query:'clear',count:100,attributions:[{topicId:'mechanic:line-completion-clear',weight:1,mode:'direct' as const}]}));
    const profile=(records:SearchQueryStat[])=>analyzeHeat(records,{days:7,endDate}).profiles.find(p=>p.topicId==='mechanic:piece-rotation')!;
    const measured=profile([...clear,...rotationZeros]),missing=profile(clear),partial=profile([...clear,rotationZeros[0]]);
    expect(measured).toMatchObject({demand:0,measurementStatus:'complete',measuredDays:7,expectedDays:7,demandIndex:0,scoreStatus:'no_demand',blue:null});
    expect(measured.red).toBeCloseTo(33.333333,5);
    expect(missing).toMatchObject({demand:0,measurementStatus:'missing',measuredDays:0,expectedDays:7,demandIndex:null,blue:null,red:null,scoreStatus:'no_data'});
    expect(partial).toMatchObject({measurementStatus:'partial',measuredDays:1,expectedDays:7});
    // Historical records and duplicated records on one current day do not fill the current period.
    expect(profile([...clear,...period(0,0).slice(0,7)])).toMatchObject({measurementStatus:'missing',measuredDays:0,red:null});
    expect(profile([...clear,rotationZeros[0],{...rotationZeros[0],id:'second-same-day'}])).toMatchObject({measurementStatus:'partial',measuredDays:1});
    expect(profile(rotationZeros)).toMatchObject({measurementStatus:'complete',scoreStatus:'no_data',demandIndex:null,red:null});
  });
  it('does not give unmeasured seed topics any opportunity or pressure scores',()=>{
    const result=analyzeHeat(searchSeed,{days:30,endDate});
    const recorded=new Set(searchSeed.filter(r=>r.date>='2026-10-01'&&r.date<=endDate).flatMap(r=>r.attributions.map(a=>a.topicId)));
    const missing=result.profiles.filter(profile=>!recorded.has(profile.topicId));
    expect(missing.length).toBeGreaterThan(0);
    for(const profile of missing) expect(profile).toMatchObject({measurementStatus:'missing',measuredDays:0,expectedDays:30,scoreStatus:'no_data',demandIndex:null,blue:null,red:null});
    expect(result.profiles.find(p=>p.topicId==='mechanic:in-run-deck-growth')).toMatchObject({measurementStatus:'missing',red:null});
  });
  it('counts raw events once across kinds and preserves direct/proxy attribution',()=>{
    const r=row('cross',100);
    r.attributions=[{topicId:'mechanic:piece-rotation',weight:0.6,mode:'direct'},{topicId:'mechanic:line-completion-clear',weight:0.4,mode:'proxy'},{topicId:'game:tetris',weight:1,mode:'direct'}];
    const result=analyzeHeat([r,{...row('unmapped',20),attributions:[]}],{days:7});
    expect(result.totalSearches).toBe(120);
    expect(result.series.reduce((s,d)=>s+d.total,0)).toBe(120);
    expect(result.profiles.find(p=>p.topicId==='mechanic:piece-rotation')).toMatchObject({demand:60,directDemand:60,proxyDemand:0});
    expect(result.profiles.find(p=>p.topicId==='mechanic:line-completion-clear')).toMatchObject({demand:40,directDemand:0,proxyDemand:40});
  });
  it('implements formula arithmetic and monotonic supply independent of popularity',()=>{
    const top=scoreHeat(10_000_000,10_000_000,12);
    expect(top).toMatchObject({demandIndex:100,scoreStatus:'ok'});
    expect(top.blue).toBeCloseTo(14.285714,5);expect(top.red).toBeCloseTo(42.857143,5);
    expect(scoreHeat(100_000,10_000_000,2)).toMatchObject({demandIndex:10,blue:5,red:47.5});
    const few=scoreHeat(4_000_000,10_000_000,1), many=scoreHeat(4_000_000,10_000_000,12);
    expect(few.blue!).toBeCloseTo(42.1637,3);
    expect(many.blue!).toBeLessThan(few.blue!); expect(many.red!).toBeGreaterThan(few.red!);
    expect(many.demandIndex).toBe(few.demandIndex);
  });
  it('keeps no-data, zero-demand and zero-supply distinct, rejecting impossible arithmetic',()=>{
    expect(scoreHeat(0,0,1)).toMatchObject({blue:null,red:null,demandIndex:null,scoreStatus:'no_data'});
    expect(scoreHeat(0,100,1)).toMatchObject({blue:null,scoreStatus:'no_demand'});
    expect(scoreHeat(100,100,0)).toMatchObject({blue:null,red:null,demandIndex:100,scoreStatus:'insufficient_supply'});
    for(const args of [[-1,1,1],[2,1,1],[1,Infinity,1],[1,1,-1]]) expect(()=>scoreHeat(...args as [number,number,number])).toThrow();
    expect(scoreHeat(Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER,1).demandIndex).toBe(100);
  });
  it('preserves a 100-fold original total ratio for the synthetic MOBA and ten horror searches',()=>{
    const result=analyzeHeat(searchSeed,{days:30,endDate});
    const moba=result.profiles.find(p=>p.topicId==='genre:moba')!;
    const horror=result.profiles.find(p=>p.topicId==='genre:synthetic-horror')!;
    expect(moba.demand).toBe(10_000_000); expect(horror.demand).toBe(100_000);
    expect(moba.demand/horror.demand).toBe(100);
    expect(result.profiles[0].demand).toBeGreaterThanOrEqual(result.profiles[1].demand);
    expect(result.sourceKinds).toEqual(['synthetic']);expect(result.seedOnly).toBe(true);
    expect(result.warnings.join(' ')).toContain('合成');
    expect(validateSearchImport(envelope(searchSeed)).success).toBe(true);
    expect(searchSeed.every(r=>r.sourceKind==='synthetic')).toBe(true);
  });
  it('gets combinations from confirmed co-occurrence and separates conditional/unknown games',()=>{
    const result=analyzeHeat(searchSeed);
    const combinations=heatTopics.filter(t=>t.kind==='combination');
    expect(combinations.length).toBeGreaterThanOrEqual(4);
    for(const topic of combinations){
      const profile=result.profiles.find(p=>p.topicId===topic.id)!;
      const supply=getMechanicSupply(topic.mechanicIds!);
      expect(profile).toMatchObject({supply:supply.count,conditionalSupply:supply.conditional,unknownSupply:supply.unknown,gameIds:supply.gameIds});
      expect(supply.count).toBeGreaterThan(0);expect(new Set(profile.gameIds).size).toBe(profile.supply);
    }
    expect(result.profiles.find(p=>p.topicId==='mechanic:cooperative-play')).toMatchObject({supply:0,conditionalSupply:3,blue:null});
  });
  it('uses full kind cohorts, raw popularity and selected region without wall-clock dependence',()=>{
    const rows=[row('large',100),row('small',25,'mechanic:line-completion-clear'),{...row('foreign',10000),region:'US'},row('game',10000,'game:tetris')];
    const full=analyzeHeat(rows,{region:'CN'}),filtered=analyzeHeat(rows,{region:'CN',kind:'mechanic'});
    expect(filtered.profiles.find(p=>p.topicId==='mechanic:line-completion-clear')?.demandIndex).toBe(50);
    expect(filtered.profiles).toEqual(full.profiles.filter(p=>p.kind==='mechanic'));
    expect(filtered.totalSearches).toBe(10125);expect(full.dateEnd).toBe(endDate);
    expect(analyzeHeat([], {endDate}).profiles.every(p=>p.scoreStatus==='no_data')).toBe(true);
  });
  it('rejects unsafe aggregate totals and invalid analysis intervals',()=>{
    expect(()=>analyzeHeat([row('a',Number.MAX_SAFE_INTEGER),row('b',1)])).toThrow(/总量|安全|safe/i);
    expect(()=>analyzeHeat([],{endDate:'2026-02-30'})).toThrow();
  });
});

describe('equal-period trends',()=>{
  it.each(['weight','mode','topic','unmapped'] as const)('rejects changed %s attribution for the same normalized query instead of inventing growth',change=>{
    const records=period(100,100).map((record,index):SearchQueryStat=>({
      ...record,datasetId:'review',sourceKind:'import',query:index<7?'  ＳＡＭＥ－ＱＵＥＲＹ  ':'same-query',
      attributions:index<7?[{topicId:'mechanic:piece-rotation',weight:0.5,mode:'direct'}]:change==='unmapped'?[]:[{
        topicId:change==='topic'?'mechanic:line-completion-clear':'mechanic:piece-rotation',
        weight:change==='weight'?1:0.5,mode:change==='mode'?'proxy':'direct',
      }],
    }));
    const result=validateSearchImport(envelope(records));
    expect(result.success).toBe(false);
    expect(result.errors.join(' ')).toMatch(/records\.7\.attributions/);
    expect(result.errors.join(' ')).toMatch(/归因.*口径|口径.*归因/);
    expect(result).not.toHaveProperty('stats');
    expect(()=>analyzeHeat(records,{days:7,endDate})).toThrow(/归因.*口径|口径.*归因/);
  });
  it('compares normal query-mixture changes using stable rules per query rather than one rule for a whole topic',()=>{
    const records=period(100,100).flatMap((record,index):SearchQueryStat[]=>[
      {...record,id:`a-${index}`,query:'query-a',count:index<7?80:20,attributions:[{topicId:'mechanic:piece-rotation',weight:1,mode:'direct'}]},
      {...record,id:`b-${index}`,query:'query-b',count:index<7?20:80,attributions:[{topicId:'mechanic:piece-rotation',weight:0.5,mode:'proxy'}]},
    ]);
    expect(validateSearchImport(envelope(records)).success).toBe(true);
    const result=analyzeHeat(records,{days:7,endDate});
    expect(result.totalSearches).toBe(700);
    const profile=result.profiles.find(p=>p.topicId==='mechanic:piece-rotation')!;
    expect(profile).toMatchObject({demand:420,directDemand:140,proxyDemand:280,trendStatus:'down',measurementStatus:'complete'});
    expect(profile.trend).toBeCloseTo(-1/3);
  });
  it('ignores attribution ordering but applies reviewed aliases and cohort boundaries to rule identity',()=>{
    const attributes:SearchQueryStat['attributions']=[{topicId:'mechanic:piece-rotation',weight:0.5,mode:'direct'},{topicId:'mechanic:line-completion-clear',weight:0.5,mode:'proxy'}];
    const first={...row('first',100),query:'LOL',attributions:attributes};
    const same={...row('second',100),query:'League of Legends',attributions:[...attributes].reverse()};
    expect(validateSearchImport(envelope([first,same])).success).toBe(true);
    const changed={...same,attributions:[{topicId:'mechanic:piece-rotation',weight:1,mode:'direct' as const}]};
    expect(validateSearchImport(envelope([first,changed])).success).toBe(false);
    for(const boundary of [{datasetId:'other'},{region:'US'},{language:'en'}]) {
      expect(validateSearchImport(envelope([first,{...changed,...boundary}])).success).toBe(true);
    }
  });
  it.each([[10,20,'up',1],[20,10,'down',-0.5],[10,10,'flat',0],[0,10,'new',null],[0,0,'flat',0]] as const)('handles %s to %s', (prev,current,status,trend)=>{
    const result=analyzeHeat(period(prev,current),{days:7,endDate});
    expect(result.profiles.find(p=>p.topicId==='mechanic:piece-rotation')).toMatchObject({trendStatus:status,trend});
  });
  it('does not turn missing days, missing topics or missing previous periods into zero',()=>{
    for(const rows of [period(10,20).slice(7),period(10,20).slice(1),[row('one',0)]]) {
      expect(analyzeHeat(rows,{days:7,endDate}).profiles.find(p=>p.topicId==='mechanic:piece-rotation')).toMatchObject({trendStatus:'missing',trend:null});
    }
    expect(analyzeHeat(period(0,0),{days:7,endDate}).profiles.find(p=>p.topicId==='mechanic:direct-movement')?.trendStatus).toBe('missing');
  });
});
