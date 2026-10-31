import { games, genres, mechanics } from '../lib/knowledge';
import type { HeatTopic } from '../lib/heat';

export const heatTopics:HeatTopic[] = [
  ...genres.map(genre=>({id:`genre:${genre.id}`,name:genre.name,kind:'genre' as const,genreId:genre.id,description:`${genre.definition} 供给按收录游戏的编辑类型标签统计，不代表完整市场供给。`})),
  {id:'genre:synthetic-horror',name:'恐怖相关方向（虚构示例）',kind:'genre',description:'用于演示十组搜索词的需求如何相加。此主题不属于正式类型目录，也未用于判定任何游戏的类型。'},
  ...mechanics.map(mechanic=>({id:`mechanic:${mechanic.id}`,name:mechanic.name,kind:'mechanic' as const,mechanicIds:[mechanic.id],description:mechanic.definition})),
  ...games.map(game=>({id:`game:${game.id}`,name:game.name,kind:'game' as const,gameId:game.id,description:'观察对游戏名称的搜索需求。已有演示记录仍为合成数据；没有记录的新增主题显示未采集。供给仅计这款收录游戏，不代表同类竞品数量。'})),
  {id:'combination:score-modifier',name:'分数达标 × 规则修饰',kind:'combination',mechanicIds:['score-threshold','rule-modifier'],description:'只统计两个机制在同一有效范围内均已确认存在的游戏，不代表整套计分配方已经成立。'},
  {id:'combination:deck-route',name:'局内扩充卡组 × 路线分支',kind:'combination',mechanicIds:['in-run-deck-growth','route-branching'],description:'只统计卡组扩充与路线分支在同一有效范围内均已确认存在的游戏，不据此认定其他配方组件也存在。'},
  {id:'combination:spatial-auto',name:'空间装备配置 × 自动结算',kind:'combination',mechanicIds:['spatial-loadout','automatic-resolution'],description:'只统计空间装备配置与自动结算在同一有效范围内均已确认存在的游戏，不据此认定配方制作也存在。'},
  {id:'combination:rotation-clear',name:'方块旋转 × 满行消除',kind:'combination',mechanicIds:['piece-rotation','line-completion-clear'],description:'只统计旋转和满行消除在同一有效范围内均已确认存在的游戏，不代表所有空间解谜游戏。'},
];
