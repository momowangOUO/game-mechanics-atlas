import type { DimensionId } from "./model";

export type MaidState =
  | "welcome"
  | "explain"
  | "think"
  | "surprise"
  | "conflict"
  | "complete";
export const maidStates: Record<MaidState, { src: string; label: string }> = {
  welcome: {
    src: "/art/maid-welcome.webp",
    label: "RIN伸手欢迎，手持研究档案",
  },
  explain: { src: "/art/maid-explain.webp", label: "RIN拿着铅笔讲解研究档案" },
  think: { src: "/art/maid-think.webp", label: "RIN翻开笔记，托腮思考" },
  surprise: {
    src: "/art/maid-surprise.webp",
    label: "RIN举起机制卡，发现新线索",
  },
  conflict: {
    src: "/art/maid-conflict.webp",
    label: "RIN举起手指，提醒机制边界",
  },
  complete: {
    src: "/art/maid-complete.webp",
    label: "RIN微笑举起整理好的研究报告",
  },
};
export const chapters = [
  {
    id: "mechanics",
    href: "/mechanics",
    name: "机制档案",
    subtitle: "一条规则，如何改变选择",
    number: "01",
  },
  {
    id: "games",
    href: "/games",
    name: "游戏案例",
    subtitle: "从真实游戏里拆解好玩",
    number: "02",
  },
  {
    id: "graph",
    href: "/graph",
    name: "机制图谱",
    subtitle: "沿着关系，发现下一条线索",
    number: "03",
  },
  {
    id: "heat",
    href: "/heat",
    name: "热度观察",
    subtitle: "玩家在搜什么，供给有多少",
    number: "04",
  },
  {
    id: "lab",
    href: "/lab",
    name: "混合实验室",
    subtitle: "把机制放上桌，试一组新组合",
    number: "05",
  },
] as const;
export type ChapterId = (typeof chapters)[number]["id"];
export const chapterArt = (id: ChapterId) => `/art/chapters/${id}.webp`;
export const gameArt = (id: string) => `/art/games/${id}.webp`;
export const recipeArt = (id: string) => `/art/recipes/${id}.webp`;
export const dimensionArt = (id: DimensionId) => `/art/ui/${id}.svg`;
