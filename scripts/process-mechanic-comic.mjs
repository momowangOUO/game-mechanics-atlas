import sharp from "sharp";
import { mkdir, readFile } from "node:fs/promises";
const [source, id] = process.argv.slice(2);
const mechanisms = JSON.parse(
  await readFile("docs/research/mechanic-dossiers.json", "utf8"),
).mechanisms;
if (!mechanisms.some((m) => m.id === id))
  throw new Error("Unknown mechanic comic ID");
const info = await sharp(source).metadata();
if (Math.abs(info.width / info.height - 3) > 0.2)
  throw new Error(
    `${id}: expected a horizontal triptych, got ${info.width}x${info.height}`,
  );
await mkdir("public/art/comics", { recursive: true });
await sharp(source)
  .resize(1800, 600, { fit: "cover" })
  .webp({ quality: 83 })
  .toFile(`public/art/comics/${id}.webp`);
console.log(`${id}: illustrated triptych saved`);
