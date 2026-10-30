import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";

const gameData = JSON.parse(
  await readFile("docs/research/game-evidence.json", "utf8"),
);
const recipeData = JSON.parse(
  await readFile("docs/research/genre-recipes.json", "utf8"),
);
const dimensions = [
  "interaction",
  "rules",
  "temporal",
  "buildcraft",
  "progression",
  "economy",
  "information",
  "participants",
  "variability",
];
const definitions = [
  ["room-dusk", "room-dusk.webp", "HomeStage / Assistant room"],
  ["desk-foreground", "desk-foreground.webp", "HomeStage foreground"],
  ...["welcome", "explain", "think", "surprise", "conflict", "complete"].map(
    (id) => [
      `maid-${id}`,
      `maid-${id}.webp`,
      "MaidPortrait / HomeStage / Assistant / HybridLab",
    ],
  ),
  ...["mechanics", "games", "graph", "heat", "lab"].map((id) => [
    `chapter-${id}`,
    `chapters/${id}.webp`,
    "PageHead / HomeStage chapter navigation",
  ]),
  ...gameData.games.map((g) => [
    `game-${g.slug}`,
    `games/${g.slug}.webp`,
    "GameCover / GameCard / Compare",
  ]),
  ...recipeData.recipes.map((r) => [
    `recipe-${r.id}`,
    `recipes/${r.id}.webp`,
    "Home recipe cards / HybridLab recipe preview",
  ]),
  ...dimensions.map((id) => [
    `dimension-${id}`,
    `ui/${id}.svg`,
    "DimensionIcon / Catalogs / HybridLab / AtlasGraph",
  ]),
];
const assets = [];
for (const [id, file, binding] of definitions) {
  const path = `public/art/${file}`;
  const bytes = await readFile(path);
  const meta = await sharp(bytes).metadata();
  if (!file.endsWith(".svg") && (!meta.width || meta.width < 800))
    throw new Error(`Insufficient source art: ${id}`);
  if (id.startsWith("maid-") && !meta.hasAlpha)
    throw new Error(`Missing maid alpha: ${id}`);
  assets.push({
    id,
    path,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    width: meta.width,
    height: meta.height,
    bytes: bytes.length,
    hasAlpha: meta.hasAlpha,
    runtime_binding: binding,
    source: id.startsWith("dimension-")
      ? "original repo-native SVG"
      : "built-in imagegen; original illustrative asset",
  });
}
await mkdir("docs/game-artist", { recursive: true });
await writeFile(
  "docs/game-artist/assets.json",
  JSON.stringify(
    {
      version: 1,
      assets,
      totalBytes: assets.reduce((n, a) => n + a.bytes, 0),
      provenance: [
        "design/galgame/core-art-prompts.json",
        "design/galgame/additional-art-prompts.json",
        "design/galgame/game-art-prompts.json",
        "design/galgame/chapter-recipe-prompts.json",
      ],
    },
    null,
    2,
  ),
);
const cards = assets
  .map(
    (a) =>
      `<article><img src="/${a.path.replace("public/", "")}" alt="${a.id}"><b>${a.id}</b><small>${a.width} × ${a.height} / ${Math.round(a.bytes / 1024)} KB</small></article>`,
  )
  .join("");
await writeFile(
  "design/galgame/asset-gallery.html",
  `<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><title>Galgame 美术资产</title><style>body{background:#171927;color:#f4eddf;font:14px Consolas;margin:25px}main{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}article{background:#272237;padding:10px;border:1px solid #81718f;min-width:0}img{width:100%;height:180px;object-fit:contain;background:#292439}b,small{display:block;margin-top:8px}small{font-size:10px;color:#baa9c7}h1{font:28px SimSun}p{color:#b6a8c4}</style><h1>研究室美术资产</h1><p>原创生成插画、角色状态与独立矢量图标。插画不作为游戏事实或市场数据的证据。</p><main>${cards}</main></html>`,
);
console.log(
  JSON.stringify({
    assets: assets.length,
    totalBytes: assets.reduce((n, a) => n + a.bytes, 0),
    games: gameData.games.length,
    recipes: recipeData.recipes.length,
  }),
);
