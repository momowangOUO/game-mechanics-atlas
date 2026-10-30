import type { SearchQueryStat } from '../lib/heat';
import { heatTopics } from './heat-topics';

export const SEED_END_DATE='2026-10-30';
const end=Date.parse(`${SEED_END_DATE}T00:00:00Z`);
const activeIds=new Set(['genre:roguelite','genre:deckbuilder','genre:auto-battler','genre:incremental-idle','genre:extraction-shooter','genre:sandbox-survival',
  'mechanic:aimed-launch','mechanic:piece-rotation','mechanic:line-completion-clear','mechanic:rule-modifier','mechanic:score-threshold','mechanic:cooperative-play','mechanic:random-upgrade-offer','mechanic:spatial-loadout',
  'game:balatro','game:tetris','game:peglin','game:slay-the-spire']);
const active=heatTopics.filter(topic=>activeIds.has(topic.id)||topic.kind==='combination');

// These counts are authored demonstration data. No external search service was queried.
function makeSeed():SearchQueryStat[] {
  const records:SearchQueryStat[]=[];
  const add=(date:string,key:string,query:string,count:number,topicId:string,mode:'direct'|'proxy'='direct')=>records.push({
    id:`synthetic:${date}:${key}`,datasetId:'synthetic-demo-v1',date,query,count,region:'CN',language:'zh-CN',sourceKind:'synthetic',attributions:[{topicId,weight:1,mode}],
  });
  for(let offset=179;offset>=0;offset--){
    const date=new Date(end-offset*86400000).toISOString().slice(0,10);
    // The final 30 days total exactly 10M versus 10 × 10k.
    add(date,'moba','MOBA（合成示例）',offset<30?333333+(offset<10?1:0):250000,'genre:moba');
    for(let part=0;part<10;part++) add(date,`horror-${part}`,`虚构恐怖搜索主题 ${part+1}`,offset<30?333+(offset<10?1:0):250,'genre:synthetic-horror');
    active.forEach((topic,index)=>{
      const base=(index+1)*97;
      const factor=offset<30?(index%3===0?1.5:index%3===1?0.7:1):1;
      const count=Math.round(base*factor*(1+(offset%7-3)*0.03));
      add(date,topic.id,`${topic.name}（合成示例）`,count,topic.id,index%5===0?'proxy':'direct');
    });
  }
  return records;
}
export const searchSeed=makeSeed();
