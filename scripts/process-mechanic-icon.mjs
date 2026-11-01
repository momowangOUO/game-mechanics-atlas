import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
const [source, id] = process.argv.slice(2);
const mechanisms = JSON.parse(
  await readFile("docs/research/mechanic-dossiers.json", "utf8"),
).mechanisms;
if (!mechanisms.some((m) => m.id === id))
  throw new Error("Unknown mechanic icon ID");
await mkdir("public/art/mechanics", { recursive: true });
const info = await sharp(source).metadata();
if (!info.hasAlpha) throw new Error(`${id}: generated icon needs alpha`);
await sharp(source)
  .trim({ threshold: 8 })
  .resize(256, 256, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .webp({ quality: 85 })
  .toFile(`public/art/mechanics/${id}.webp`);
console.log(`${id}: 256px WebP saved`);
