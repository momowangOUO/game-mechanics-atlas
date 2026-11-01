import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const logo = await readFile(path.join(root, "public/brand/logo-still.webp"));
const maid = await readFile(path.join(root, "public/art/maid-welcome.webp"));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="640" viewBox="0 0 1280 640">
<defs><pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#c4aff0" opacity=".12"/></pattern></defs>
<rect width="1280" height="640" fill="#171927"/><rect width="1280" height="640" fill="url(#dots)"/>
<rect x="32" y="28" width="1216" height="584" fill="none" stroke="#665e79"/>
<path d="M32 28H1248" stroke="#c4aff0" stroke-width="5"/>
<path d="M752 29H1247V611H800" fill="#202338"/>
<text x="76" y="102" fill="#c4aff0" font-family="Consolas,monospace" font-size="17" letter-spacing="4">GAME MECHANICS ATLAS</text>
<text x="71" y="230" fill="#f4eddf" font-family="Microsoft YaHei,SimSun,serif" font-weight="700" font-size="90">机制研究室</text>
<path d="M76 269H694" stroke="#665e79"/>
<text x="76" y="326" fill="#dfbd77" font-family="Microsoft YaHei,sans-serif" font-size="28">游戏范例 · 机制图解 · 研究提示词</text>
<text x="76" y="377" fill="#bcb3c9" font-family="Microsoft YaHei,sans-serif" font-size="22">面向游戏设计师的机制参考库</text>
<text x="310" y="487" fill="#f4eddf" font-family="Microsoft YaHei,sans-serif" font-size="24">由魔魔王架设</text>
<text x="310" y="523" fill="#bcb3c9" font-family="Microsoft YaHei,sans-serif" font-size="17">© 2026 魔魔王</text>
</svg>`;
// Use sharp for bitmap placement: SVG rasterizers do not all decode embedded WebP.
await writeFile(
  path.join(root, "public/brand/social-preview.png"),
  await sharp(Buffer.from(svg))
    .composite([
      {
        input: await sharp(maid)
          .resize(420, 630)
          .extract({ left: 0, top: 0, width: 420, height: 585 })
          .png()
          .toBuffer(),
        left: 777,
        top: 55,
      },
      {
        input: await sharp(logo).resize(210, 109).png().toBuffer(),
        left: 73,
        top: 443,
      },
    ])
    .png()
    .toBuffer(),
);
console.log("Generated public/brand/social-preview.png (1280 × 640)");
