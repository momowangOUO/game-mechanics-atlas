import fs from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
const rows = JSON.parse(
  await fs.readFile("docs/research/catalog-expansion.json", "utf8"),
);
const mapPath = "src/data/game-art-sources.json";
const map = JSON.parse(await fs.readFile(mapPath, "utf8"));
await fs.mkdir("public/art/games", { recursive: true });
await fs.mkdir(".build/expanded-game-art", { recursive: true });
let index = 0;
const results = [];
await Promise.all(
  Array.from({ length: 5 }, async () => {
    while (index < rows.length) {
      const game = rows[index++];
      const output = `public/art/games/${game.id}.webp`;
      if (
        map[game.id]?.imageUrl === game.cover?.url &&
        (await fs.stat(output).catch(() => false))
      ) {
        results.push({ id: game.id, status: "cached" });
        continue;
      }
      try {
        if (!game.cover?.url) throw new Error("No image URL");
        const response = await fetch(game.cover.url, {
          signal: AbortSignal.timeout(25000),
          headers: {
            "User-Agent":
              "GameMechanicsAtlas/1.0 (game reference image preparation)",
          },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const bytes = Buffer.from(await response.arrayBuffer());
        const info = await sharp(bytes).metadata();
        if (!info.width || !info.height)
          throw new Error("Not a decodable image");
        await sharp(bytes)
          .resize({
            width: 960,
            height: 540,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 83 })
          .toFile(output);
        const out = await fs.readFile(output);
        const source = game.sources.find(
          (source) => source.url === game.cover.sourceUrl,
        );
        const official =
          source &&
          ["official_store", "official_site", "developer"].includes(
            source.type,
          );
        map[game.id] = {
          kind: official ? "official" : "reference",
          sourceUrl: game.cover.sourceUrl,
          publisher: source?.publisher ?? game.studio,
          imageUrl: game.cover.url,
          checkedAt: source?.checkedAt,
          sourceSha256: createHash("sha256").update(bytes).digest("hex"),
          outputSha256: createHash("sha256").update(out).digest("hex"),
          preparation: "采用已有游戏图像，等比缩小并转为WebP，未生成或重绘。",
        };
        results.push({
          id: game.id,
          status: "saved",
          width: info.width,
          height: info.height,
        });
      } catch (error) {
        results.push({ id: game.id, status: "error", error: String(error) });
      }
    }
  }),
);
await fs.writeFile(mapPath, JSON.stringify(map, null, 2) + "\n");
await fs.writeFile(
  ".build/expanded-game-art/results.json",
  JSON.stringify(results, null, 2),
);
console.log(
  JSON.stringify({
    saved: results.filter((row) => row.status === "saved").length,
    cached: results.filter((row) => row.status === "cached").length,
    errors: results.filter((row) => row.status === "error"),
  }),
);
if (results.some((row) => row.status === "error")) process.exitCode = 1;
