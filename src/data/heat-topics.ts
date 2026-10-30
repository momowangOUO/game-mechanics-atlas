import { games, genres, mechanics } from '../lib/knowledge';
import type { HeatTopic } from '../lib/heat';

export const heatTopics:HeatTopic[] = [
  ...genres.map(genre=>({id:`genre:${genre.id}`,name:genre.name,kind:'genre' as const,genreId:genre.id,description:`${genre.definition} 供给按收录游戏的编辑类型标签统计，不代表完整市场。`})),
  {id:'genre:synthetic-horror',name:'恐怖相关方向（虚构示例）',kind:'genre',description:'仅用于演示十组搜索词的需求相加；不是目录正式分类，也没有据此认定任何游戏。'},
  ...mechanics.map(mechanic=>({id:`mechanic:${mechanic.id}`,name:mechanic.name,kind:'mechanic' as const,mechanicIds:[mechanic.id],description:mechanic.definition})),
  ...games.map(game=>({id:`game:${game.id}`,name:game.name,kind:'game' as const,gameId:game.id,description:'游戏名称搜索的合成示例；一款收录案例不代表市场竞争供给。'})),
  {id:'combination:score-modifier',name:'分数达标 × 规则修饰',kind:'combination',mechanicIds:['score-threshold','rule-modifier'],description:'只统计两个机制在同一有效范围内的已确认实例，不代表整套计分配方。'},
  {id:'combination:deck-route',name:'局内扩充卡组 × 路线分支',kind:'combination',mechanicIds:['in-run-deck-growth','route-branching'],description:'只统计卡组扩充与路线分支的共同实例，不补齐其他配方组件。'},
  {id:'combination:spatial-auto',name:'空间装备配置 × 自动结算',kind:'combination',mechanicIds:['spatial-loadout','automatic-resolution'],description:'同范围中布局和自动结算的已确认组合，不自动包含配方制作。'},
  {id:'combination:rotation-clear',name:'方块旋转 × 满行消除',kind:'combination',mechanicIds:['piece-rotation','line-completion-clear'],description:'旋转和满行清除在同一范围的共同实例，不扩展为所有空间解谜游戏。'},
];
