export type LoopRect = { x: number; y: number; width: number; height: number };
export type LoopLayout = "circuit" | "sequence";

/** Routes only through the gaps around the cards; indices remain in play order. */
export function loopConnections(rects: LoopRect[], layout: LoopLayout) {
  return rects.map((from, index) => {
    const next = (index + 1) % rects.length;
    const to = rects[next];
    const closing = next === 0;
    const cx = (r: LoopRect) => r.x + r.width / 2;
    const cy = (r: LoopRect) => r.y + r.height / 2;
    let path: string;
    if (closing) {
      const rail = Math.max(12, Math.min(from.x, to.x) - 24);
      path =
        rects.length === 1
          ? `M ${cx(from)} ${from.y + from.height} L ${cx(from)} ${from.y + from.height + 24} L ${rail} ${from.y + from.height + 24} L ${rail} ${cy(to)} L ${to.x} ${cy(to)}`
          : `M ${from.x} ${cy(from)} L ${rail} ${cy(from)} L ${rail} ${cy(to)} L ${to.x} ${cy(to)}`;
    } else if (layout === "sequence") {
      path = `M ${cx(from)} ${from.y + from.height} L ${cx(to)} ${to.y}`;
    } else if (Math.abs(from.y - to.y) < 2) {
      path =
        to.x > from.x
          ? `M ${from.x + from.width} ${cy(from)} L ${to.x} ${cy(to)}`
          : `M ${from.x} ${cy(from)} L ${to.x + to.width} ${cy(to)}`;
    } else {
      const rail = Math.max(from.x + from.width, to.x + to.width) + 24;
      path = `M ${from.x + from.width} ${cy(from)} L ${rail} ${cy(from)} L ${rail} ${cy(to)} L ${to.x + to.width} ${cy(to)}`;
    }
    return { from: index, to: next, closing, path };
  });
}

// These are reading aids for the written action, not mechanism classifications.
export function loopSymbol(step: string) {
  if (/观察|查看|判断|辨认|读取|阅读|了解|核对|评估/.test(step))
    return "observe";
  if (/购买|买卖|出售|交易|支付/.test(step)) return "purchase";
  if (
    /战斗|交战|交火|攻击|击杀|击破|狩猎|敌人|首领|对战|招架|挥剑|射击/.test(
      step,
    )
  )
    return "combat";
  if (/出牌|抽牌|手牌|卡牌|牌型|套牌|卡组/.test(step)) return "cards";
  if (/强化|升级|配置|调整|组合|安排|分配|装备|构筑|整理/.test(step))
    return "configure";
  if (/收集|采集|采矿|搜集|取得|获得|开采|带回|资源/.test(step))
    return "collect";
  if (/建设|建造|制作|铺设|挖掘|扩建/.test(step)) return "build";
  if (/下一轮|下一块|重试|结算|新一天|开球/.test(step)) return "repeat";
  if (/探索|路线|道路|移动|出发|前往|航行|飞行|冲刺|跳跃/.test(step))
    return "explore";
  if (/选择|选定|决定/.test(step)) return "choose";
  return "action";
}

export type LoopSymbol = ReturnType<typeof loopSymbol>;
