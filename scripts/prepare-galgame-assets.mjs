import sharp from "sharp";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

// Format/size derivation only. Illustration creation and edits use built-in imagegen.
const [source, destination, width = "1600"] = process.argv.slice(2);
if (!source || !destination)
  throw new Error(
    "Usage: node scripts/prepare-galgame-assets.mjs source destination width",
  );
await mkdir(destination.slice(0, destination.lastIndexOf("/")), {
  recursive: true,
});
await sharp(source)
  .resize({ width: Number(width), withoutEnlargement: true })
  .webp({ quality: 88, alphaQuality: 100 })
  .toFile(destination);
const bytes = await readFile(destination);
const meta = await sharp(bytes).metadata();
console.log(
  JSON.stringify({
    path: destination,
    width: meta.width,
    height: meta.height,
    alpha: meta.hasAlpha,
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  }),
);
