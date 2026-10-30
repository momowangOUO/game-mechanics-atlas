import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const skillRoot = process.argv[2];
if (!skillRoot) throw new Error('Pass the installed auto-design-scout skill directory.');
const engine = await import(pathToFileURL(path.join(skillRoot, 'scripts/engine.mjs')));
const root = process.cwd();
const dir = path.join(root, '.design-scout');
const old = JSON.parse(await fs.readFile(path.join(dir, 'mix-config.json'), 'utf8'));
if (old.sources.length || old.versions.length || old.favorites.length) throw new Error('Selections exist. Preserve and merge them instead of resetting.');
const leads = JSON.parse(await fs.readFile(path.join(root, 'docs/research/retro-reference-leads.json'), 'utf8'));
const extra = [
  { id: 'haruhi-cast', title: '凉宫春日｜动画人物与网点（2009官网图）', creator: '京都动画／SOS团', url: 'https://www.haruhi.tv/fanclub/cast.html', thumbnail: 'https://www.haruhi.tv/fanclub/img/haruhi_cast_main2_091201.jpg', year: 2009, notes: '官方CSS引用的2009年人物介绍底图；不能标为2006首发KV。' },
  { id: 'haruhi-2016', title: '凉宫春日｜2016官网宣传图（年代对照）', creator: '京都动画／SOS团', url: 'https://www.haruhi.tv/fanclub/', thumbnail: 'https://www.haruhi.tv/fanclub/img/haruhi_top_main160930.jpg', year: 2016, notes: '官方CSS引用的2016年宣传图，作为较晚画法与网页包装对照。' },
  { id: 'clannad-anime', title: 'CLANNAD｜京阿尼版官网主图', creator: '京都动画／TBS／光坂高校演剧部', url: 'https://www.tbs.co.jp/clannad/clannad1/', thumbnail: 'https://www.tbs.co.jp/clannad/clannad1/images/top-img.jpg', year: 2007, notes: 'TBS官方页面CSS实际引用；与原游戏是同一作品的不同媒介，不能算成两部独立作品。' },
  { id: 'kanon-anime', title: 'Kanon｜京阿尼版官网主图', creator: '京都动画／TBS／百花屋', url: 'https://www.tbs.co.jp/anime/kanon/', thumbnail: 'https://www.tbs.co.jp/anime/kanon/images/kanon_1.jpg', year: 2006, notes: 'TBS官方页面CSS实际引用；网页含DVD发售提示，非纯角色原画。' },
];
const observations = {
  'haruhi-cast': '深色头发以少量明暗色块区分，眼睛轮廓清楚；斜向人物裁切配合密集网点与白底文字。适合研究有表情的2000年代动画人物和局部印刷感。',
  'haruhi-2016': '红白版面、黄色爆炸形公告、蓝白服装与褐黑发色；人物阴影以明确色块为主。比2006更晚，只作年代变化和醒目菜单对照。',
  'clannad-game': '大眼、小鼻口，纤细发束，衣褶阴影偏柔；粉紫暮色和边缘白色晕染让人物融入背景。适合旧式视觉小说立绘与温柔色彩。',
  'kanon-game': '头脸与眼睛比例突出，发色分区明确，细线描画冬装；雪景底色、淡粉装饰和密集群像表现早期美少女游戏封面感。',
  'air-game': '金色长发、大面积蓝色眼睛、浅蓝水面与白裙；人物轮廓细，阴影低对比，背景明亮。适合早期Key的通透留白和柔和人物。',
  'little-busters': '人物群像叠放，动态长发、红黑服装、艳蓝底色与粗字标形成活力。当前图片是2012 PERFECT EDITION，不是2007首发封面。',
  planetarian: '淡紫长发、绿色大眼、深色制服，弧形金色环与白底结合；科幻气质主要由服装和环形图形承担，适合研究助手与旧式SF包装。',
  rewrite: '白底上的角色群像以红黑制服统一，长发与蝴蝶结构成轻柔轮廓；背景留白多。当前是Rewrite＋页面，不冒充2011原版页面。',
  'angel-beats': '人物纵向成组，制服灰白蓝与鲜明发色相配，边缘白色羽化；画法较早期Key更利落，作为2015年的相邻年代参考。',
  harmonia: '柔和金发、蓝色大眼、蓝白衣着与少量金色细节；立绘轮廓细、边缘浅，适合说明助手的亲和感。年代较晚，不当作早期Key原画。',
  'summer-pockets': '大块明亮蓝天、云海与白衣角色，色彩鲜明，光影和发丝更细；这是2018年的现代对照，用于判断是否过于新潮。',
  'haruhi-sos-website': '当前只目视核验SOS团彩色标记，并读取官网HTML：入口、访问计数文字、图片按钮和1024×768提示。网页布局仍须打开原站观察，不能从logo推断完整页面效果。',
  'clannad-anime': '人物在大场景中占比很小；暖色云层、深蓝夜空和金色草地形成情绪层次，官网外框有淡粉线条。适合场景气氛，不能用这一张判断脸部画法。',
  'kanon-anime': '清楚的赛璐璐分层、深色描边、较完整的衣装结构；蓝色横纹、雪花、字标与人物拼接，保留旧式游戏官网的图像切片感。',
};
const refs = [...leads.filter(r => !['haruhi-2006', 'lucky-star'].includes(r.id)), ...extra].map(r => ({
  ...r, platform: r.url.includes('key.visualarts') ? 'Key 官方' : r.url.includes('tbs.co.jp') ? 'TBS 动画官方' : 'SOS团官方',
  tags: [r.year ? `${Math.floor(r.year / 10) * 10}年代` : '年代未核验', '日系', '真实作品', ...(r.id.includes('haruhi') ? ['凉宫春日', '动画'] : ['Key', '视觉小说'])],
  analysis: observations[r.id],
  analysis_basis: r.id === 'haruhi-sos-website' ? '2026-10-30：已实际查看标记图、读取官方HTML；未完成原网页浏览器目视。' : '2026-10-30：已实际查看官方公开图；观察限该图，不是原作完整画集、字体或色值实测。',
  license: '官方作品版权保留，仅作为视觉研究；未获角色、图像、字标或完整构图的再利用授权。',
  rights: { type: 'visual-reference', asset_reuse_authorized: false, license: null },
  verified_at: '2026-10-30', validation: { source_verified: true, image_http: 200, visually_inspected: true },
  params_basis: '用于参考板的策展方案近似值，不是原图色值、字体或尺寸测量。',
}));
const groups = [
  ['search_haruhi', '凉宫春日｜清晰赛璐璐', ['haruhi-cast', 'haruhi-2016'], '看人物神态、深色描边与少量色块阴影；两张分别为2009和2016官网图，不能混称2006首发画风。', ['#faf6ed', '#25283f', '#e5ad42']],
  ['search_key_early', '早期 Key｜大眼与柔和上色', ['air-game', 'kanon-game', 'clannad-game'], '对比AIR、Kanon、CLANNAD原游戏：大眼比例、细线与低对比阴影。可只取人物画法，不必连浅色背景一起采用。', ['#e8eff6', '#363a5b', '#9eaed1']],
  ['search_kyoani_key', 'Key 动画版｜利落赛璐璐', ['kanon-anime', 'clannad-anime', 'haruhi-cast'], '京阿尼版Kanon的清楚分层与旧式官网切片，配CLANNAD场景气氛；人物画法与背景应分别选。', ['#e8f1f8', '#2c3550', '#79a7ca']],
  ['search_key_twilight', 'CLANNAD｜粉紫暮色与场景', ['clannad-game', 'clannad-anime', 'air-game'], '粉紫暮色、蓝色远景和白边羽化；适合女仆立绘与背景的融合方式。场景氛围可以与深色研究页面局部组合。', ['#f2e6ef', '#43395c', '#a78cab']],
  ['search_little_busters', 'Little Busters!｜活力与群像', ['little-busters', 'rewrite', 'angel-beats'], '红黑服装、斜向人物、紧凑群像和醒目字标；可用于首页焦点和活动入口，正文保持清楚。包含2012及之后版本。', ['#f6f1ed', '#302b3c', '#c24d65']],
  ['search_planetarian', 'planetarian｜旧式科幻助手', ['planetarian', 'harmonia'], '深色制服、白底金色环与柔和立绘；比霓虹终端更接近旧式科幻视觉小说，可研究助手服装和资料面板。', ['#f3eff4', '#303554', '#ac9ac9']],
  ['search_key_modern', '后期 Key｜明亮夏日（对照）', ['summer-pockets', 'harmonia', 'angel-beats'], '较新的发丝、光影与通透蓝天，用来判断想保留多少现代精致度；不是默认方向。', ['#e5f3fa', '#303e59', '#55a8d7']],
  ['search_old_web', 'SOS 团｜旧式官网与个人站', ['haruhi-sos-website', 'kanon-anime', 'clannad-game'], '主要选网页元素：入口页、图片按钮、窄幅主体、局部纹理与站点标记。需点开原站看布局；人物参考可另选。', ['#f5eff3', '#302d46', '#bd5d8a']],
];
const styles = groups.map(([id, name, references, features, palette]) => ({
  id, name, name_en: name, aliases: [name, '凉宫春日', 'Key', '复古二次元'], domains: ['C', 'E'],
  era: '本项目策展分组；每张图的年份单独标记', media: ['web', 'illustration', 'game'], moods: ['鲜明'],
  features, references, keywords: [name, '2000年代', '视觉小说'], compatible_with: [],
  avoid: '不直接复制既有角色、字标或完整构图；不把新版宣传图冒充首发版本。',
  params: { palette, font: 'serif', auxFont: 'sans-serif', columns: 2, spacing: 28, radius: 0, texture: 0.1, contrast: 1, saturation: 0.9, density: 4, duration: 0.4, imagery: 'organic', rendering: 'soft', layout: 'split', hover: 1.02, stroke: 1, easing: 'ease-out' },
  params_basis: '参考板策展近似值，不是参考原图测量；最终方案等待用户选择。', verified: true,
}));
const state = engine.initialState({ title: '游戏机制研究站｜凉宫与 Key 视觉参考', brief: '先选人物画法，再选色彩、场景和网页元素。可跨作品混搭。保留原创黑发女仆，暂停赛博霓虹方案；当前等待你的选择，不自动采用推荐。', media: 'web', width: 1440, height: 1000 });
state.revision = old.revision + 1;
state.style_only = true;
state.mode = 'pro';
engine.validateRegistry(styles, refs);
engine.validateState(state, styles, refs);
const write = (file, value) => fs.writeFile(path.join(dir, file), JSON.stringify(value, null, 2) + '\n');
await write('references.json', refs);
await write('styles.json', styles);
await write('sources.json', [
  { id: 'key', name: 'Key 官方', enabled: true, url: 'https://key.visualarts.co.jp/', kind: 'public-metadata', terms: '只作视觉研究，原图未授权用于产品。' },
  { id: 'haruhi', name: 'SOS团官方', enabled: true, url: 'https://www.haruhi.tv/', kind: 'public-metadata', terms: '公开官网；原图未授权用于产品。' },
  { id: 'tbs', name: 'TBS 动画官方', enabled: true, url: 'https://www.tbs.co.jp/', kind: 'public-metadata', terms: '公开动画官网；原图未授权用于产品。' },
]);
await write('mix-config.json', state);
await write('research-summary.json', { status: 'awaiting_selection', directions: styles.length, referenceImages: refs.length, distinctWorks: 10, inspectedAt: '2026-10-30', coverage: '本批针对用户明确给出的凉宫/Key方向收集14张真实参考，未达到技能默认40–60案例广泛研究规模，不声称穷尽。', excluded: [{ id: 'lucky-star', reason: '当前官方缩略图只有字标，不足以支持人物画风选择。' }, { id: 'haruhi-2006', reason: '入口横幅不是人物图，已替换成标明年份的官方人物图。' }], newDirection: '用户2026-10-30明确要求亲自选参考后再制作。' });
console.log(JSON.stringify({ directions: styles.length, references: refs.length, status: 'awaiting_selection', revision: state.revision }));
