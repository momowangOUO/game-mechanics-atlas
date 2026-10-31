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
    label: "RIN 伸手欢迎，手持研究档案",
  },
  explain: { src: "/art/maid-explain.webp", label: "RIN 拿着铅笔讲解研究档案" },
  think: { src: "/art/maid-think.webp", label: "RIN 翻开笔记，托腮思考" },
  surprise: {
    src: "/art/maid-surprise.webp",
    label: "RIN 举起机制卡，发现新线索",
  },
  conflict: {
    src: "/art/maid-conflict.webp",
    label: "RIN 举起手指，提醒机制边界",
  },
  complete: {
    src: "/art/maid-complete.webp",
    label: "RIN 微笑举起整理好的研究报告",
  },
};
export const chapters = [
  {
    id: "mechanics",
    href: "/taxonomy",
    name: "分类参考",
    subtitle: "逐层看类别、作用与游戏用法",
    number: "01",
  },
  {
    id: "games",
    href: "/games",
    name: "游戏案例",
    subtitle: "对照游戏案例，理解规则与选择",
    number: "02",
  },
  {
    id: "graph",
    href: "/graph",
    name: "机制图谱",
    subtitle: "查看机制之间的联系",
    number: "03",
  },
  {
    id: "heat",
    href: "/heat",
    name: "热度观察",
    subtitle: "比较搜索需求与收录样本",
    number: "04",
  },
  {
    id: "lab",
    href: "/lab",
    name: "混合实验室",
    subtitle: "组合机制，提出设计假设",
    number: "05",
  },
] as const;
export type ChapterId = (typeof chapters)[number]["id"];
export const chapterArt = (id: ChapterId) => `/art/chapters/${id}.webp`;
export const gameArt = (id: string) => `/art/games/${id}.webp`;
export const recipeArt = (id: string) => `/art/recipes/${id}.webp`;
export const dimensionArt = (id: DimensionId) => `/art/ui/${id}.svg`;
