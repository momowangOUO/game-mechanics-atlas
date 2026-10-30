import { mkdir, writeFile } from "node:fs/promises";
const out = new URL("./", import.meta.url);
await mkdir(new URL("targets/", out), { recursive: true });
const header = `<header class="mast"><b class="brand">✦ 机制研究室</b><span class="nav">机制档案　游戏案例　机制图谱　热度观察　混合实验室</span><span class="meta">MENU ／ 01</span></header>`;
const page = (title, body) =>
  `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · 目标样张</title><link rel="stylesheet" href="target.css"></head><body><main class="wrap ${title.startsWith("首页") ? "home-page" : ""} ${title.startsWith("实验室") ? "lab-page" : ""}">${header}${body}<footer class="foot">GAME MECHANICS ATLAS　／　研究仍在继续。<span style="float:right">2026 · RIN'S ARCHIVE</span></footer></main><div class="preview-label">设计目标 · 非实际网站截图</div></body></html>`;
const banner = (id, title, desc) =>
  `<section class="banner"><img src="/art/chapters/${id}.webp" alt=""><div class="banner-copy"><span class="tag">RESEARCH CHAPTER ／ ${id.toUpperCase()}</span><h1>${title}</h1><p>${desc}</p></div></section>`;
const dialogue = `<div class="dialogue"><strong>研究助手 RIN</strong><p>欢迎回来。档案已经整理好了，<br>今天，想从哪一种“好玩”开始研究？　▾</p></div>`;
const chapters = [
  ["mechanics", "机制档案"],
  ["games", "游戏案例"],
  ["graph", "机制图谱"],
  ["heat", "热度观察"],
  ["lab", "混合实验室"],
];
const home = `<section class="scene"><div class="copy"><span class="tag">夜の研究室 ／ OPEN FOR IDEAS</span><h1>拆解游戏，<br>发现<em>新玩法。</em></h1><p>从一条规则到一组机制。<br>这里收集那些让游戏变得好玩的秘密。</p><div class="search"><small>SEARCH ARCHIVE ／ 検索</small>⌕　搜机制、游戏，或者一种玩法组合…</div><a class="btn">进入机制档案 →</a><a class="btn alt">试验一种新组合 ↗</a></div><img class="portrait" src="/art/maid-welcome.webp" alt="黑发女仆欢迎"><span class="scene-no">GAME MECHANICS LABORATORY</span>${dialogue}</section><nav class="chapters">${chapters.map(([id, title], i) => `<a class="chapter"><img src="/art/chapters/${id}.webp" alt=""><small>CHAPTER 0${i + 1}</small><b>${title} ↗</b></a>`).join("")}</nav><div class="subhead"><div><span class="meta">TODAY'S FILE ／ 今日档案</span><h2>把熟悉的游戏，拆开看。</h2></div><span class="meta">52 MECHANICS · 18 GAMES</span></div><div class="columns"><article class="paper"><img class="cover" src="/art/games/balatro.webp" alt="原创牌桌机制示意"><h2>Balatro</h2><p>牌型、规则修饰与局内构筑，如何一起改变每次出牌？</p></article><article class="dark"><span class="meta">DESIGN NOTE ／ 研究便签</span><h2>先从一条机制开始。</h2><div class="file-row"><strong>局内扩充卡组</strong>构筑选择如何改变后续行动？</div><div class="file-row"><strong>单局重开</strong>一次尝试结束后，哪些状态重建？</div><div class="file-row"><strong>空间装备配置</strong>位置如何成为能力的一部分？</div></article></div>`;
const mechanic =
  banner("mechanics", "局内扩充卡组", "在一次尝试中，改变后续可抽到的牌。") +
  `<div class="columns"><article class="paper"><span class="meta">MECHANIC FILE ／ 017</span><h2>让每次选择，进入下一次行动。</h2><p>在单次运行中新增牌张到可用卡组，改变后续抽牌的候选集合。它属于构筑与配置，不因在游戏中的作用改变分类。</p><div class="tabs"><span>定义与边界</span><span>真实案例</span><span>组合与风险</span></div><div class="file-row"><strong>＋ 纳入条件</strong>局内新牌进入后续抽取的卡组。</div><div class="file-row"><strong>－ 排除条件</strong>只解锁局外收藏，不改变本局卡组。</div><div class="graph"><span>选择新牌</span>→<span>卡组变化</span>→<span>后续决策</span></div></article><aside class="dark"><img class="maid-mini" src="/art/maid-think.webp" alt=""><span class="meta">RIN'S NOTE</span><h2>先看它改变了什么。</h2><p>关联可以增加，分类不能随意挪动。未知，也不等于不存在。</p></aside></div>`;
const game =
  banner("games", "Balatro", "用扑克建立牌型分数，再用小丑牌改写计算。") +
  `<div class="columns"><article class="paper"><img class="cover" src="/art/games/balatro.webp" alt=""><div class="tabs"><span>机制视图</span><span>循环视图</span><span>关系视图</span><span>热度标签</span></div><h2>计分规则，也能成为构筑对象。</h2><div class="pills"><span>分数达标</span><span>规则修饰器</span><span>局内扩充卡组</span></div><div class="loop"><div><small>STEP 01</small>抽牌与判断牌型</div><div><small>STEP 02</small>出牌与结算</div><div><small>STEP 03</small>商店购买与取舍</div><div><small>STEP 04</small>迎接下一盲注</div></div></article><aside class="dark"><span class="tag">DESIGN ANALYSIS</span><h2>从结算逆推选择。</h2><p>这里区分可验证的游戏事实与编辑设计分析，机制身份以规范档案为准。</p><img class="cover" src="/art/chapters/graph.webp" alt=""></aside></div>`;
const heat =
  banner(
    "heat",
    "玩家正在搜索什么？",
    "需求与供给，分开观察。全部数值为合成示例。",
  ) +
  `<div class="columns"><article class="dark"><span class="tag">合成示例 · 非真实市场数据</span><h2>搜索关注 ／ 近 30 天</h2><div class="chart">${[25, 33, 30, 45, 40, 53, 61, 57, 72, 78, 89, 100].map((n) => `<i style="height:${n}%"></i>`).join("")}</div><div class="tabs"><span>热门类别</span><span>热门机制</span><span>热门组合</span></div><div class="file-row">01　MOBA　<span style="float:right;color:#dfbd77">1,000 万</span></div><div class="file-row">02　恐怖细分方向　<span style="float:right;color:#dfbd77">10 万</span></div></article><aside class="paper"><img class="maid-mini" src="/art/maid-think.webp" alt=""><span class="meta">OBSERVATION NOTE</span><h2>热度，是线索。</h2><p>先看搜索关注，再核对样本供给；低供给不等于已证明的市场空白。</p><div class="file-row"><strong>蓝海线索</strong>需求高、已确认样本少。</div><div class="file-row"><strong>红海线索</strong>供给拥挤，关注未必成比例。</div></aside></div>`;
const lab = (complete = false, conflict = false) =>
  banner(
    "lab",
    "试验一种新组合。",
    "把机制放上桌，让规则解释它们如何一起工作。",
  ) +
  `<div class="tabs"><span>01 核心</span><span>02 配料</span><span>03 目标</span><span>04 结果</span></div><div class="columns"><article class="paper"><span class="meta">YOUR EXPERIMENT ／ 当前实验</span><h2>${conflict ? "时间规则需要分阶段。" : "瞄准，构筑，再尝试。"}</h2><img class="cover" src="/art/chapters/lab.webp" alt=""><div class="pills"><span>${conflict ? "实时更新" : "瞄准发射"} · 核心</span><span>${conflict ? "轮流行动" : "局内扩充卡组"}</span><span>遭遇变化</span></div><a class="btn">${complete ? "重新分析当前组合 ↻" : "分析当前组合 →"}</a><p class="caption">确定性规则分析 · 设计假设</p></article><article class="dark"><img class="maid-mini" src="/art/maid-think.webp" alt=""><span class="meta">RIN'S REPORT</span><h2>${complete ? (conflict ? "这里有一处张力。" : "研究报告，整理好了。") : "下一张机制，会改变什么？"}</h2>${complete ? `<span class="stamp">${conflict ? "需要验证" : "分析完成"}</span><div class="tabs"><span>循环与分工</span><span>协同与冲突</span></div><p>${conflict ? "实时更新与轮流行动若管理同一行动时钟，会产生控制权冲突。尝试划分不同阶段，再验证切换成本。" : "观察局面 → 瞄准发射 → 结算取舍 → 调整卡组。"}</p><div class="file-row">结果对应已提交的组合；机制修改后需要更新分析。</div>` : `<p>先保留一个核心动作，再逐个加入配料。看看每一项是否改变了玩家的选择。</p>`}</article></div>`;
for (const [id, title, body] of [
  ["home-desktop", "首页桌面", home],
  ["home-mobile", "首页手机", home],
  ["mechanic", "机制详情", mechanic],
  ["game", "游戏案例", game],
  ["heat", "热度观察", heat],
  ["lab", "实验室普通状态", lab()],
  ["lab-complete", "实验室完成", lab(true)],
  ["lab-conflict", "实验室冲突", lab(true, true)],
])
  await writeFile(new URL(`${id}.html`, out), page(title, body));
console.log("Created 6 primary target layouts + 2 experiment states.");
