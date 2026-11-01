import type { MaidState } from "@/lib/art";

export const rinHomeDialogue: { state: MaidState; text: string }[] = [
  {
    state: "welcome",
    text: "欢迎光临，主人！女仆 RIN，随时听候差遣。今天想研究哪款游戏？",
  },
  {
    state: "explain",
    text: "哼哼，一款游戏可不只有一种操作。移动、跳跃、攻击……每一招都值得翻出来看看！",
  },
  {
    state: "think",
    text: "唔……卡牌和弹珠放在一起，会变成什么样呢？先记下来，待会儿再翻翻游戏档案。",
  },
  {
    state: "surprise",
    text: "找到了！这张机制卡原来夹在这里……接下来，就看主人怎么搭配啦！",
  },
];
export const rinDialogue = {
  mechanic: "嗯哼，这条规则还有什么花样呢？RIN 可不想只记住一个名字。",
  genre: "名字听起来真有气势！不过里面装了什么玩法……哼哼，RIN 可好奇得很。",
  missing: "咦，档案怎么不在这里……主人，陪 RIN 回资料架找找吧？",
  heatTitle: "唔，大家都在找什么呢？",
  heat: "热闹归热闹，RIN 还想看看已经有哪些游戏。光盯着一个数字，可没法安心开工呀。",
};
