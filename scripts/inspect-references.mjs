import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

// Research-only contact sheet, excluded from the product assets.
const runtimeModules = process.env.CODEX_RUNTIME_NODE_MODULES;
if (!runtimeModules) throw new Error('Set CODEX_RUNTIME_NODE_MODULES to the bundled Node package directory.');
const require = createRequire(path.join(runtimeModules, 'package.json'));
const sharp = require('sharp');
const root = process.cwd();
const output = path.join(root, '.build', 'reference-inspection');
await fs.mkdir(output, { recursive: true });
const refs = JSON.parse(await fs.readFile(path.join(root, 'docs/research/retro-reference-leads.json'), 'utf8'));
const tiles = await Promise.all(refs.map(async (ref, index) => {
  const response = await fetch(ref.thumbnail, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error(`${ref.id}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(path.join(output, `${ref.id}.img`), bytes);
  const metadata = await sharp(bytes).metadata();
  const image = await sharp(bytes).resize(360, 260, { fit: 'contain', background: '#f0edf7' }).png().toBuffer();
  const label = Buffer.from(`<svg width="380" height="48"><rect width="380" height="48" fill="#211e31"/><text x="12" y="28" fill="#ffffff" font-family="Arial" font-size="16">${index + 1}. ${ref.id} / ${metadata.width}x${metadata.height}</text></svg>`);
  console.log(JSON.stringify({ id: ref.id, width: metadata.width, height: metadata.height, bytes: bytes.length }));
  return [{ input: image, left: (index % 3) * 380 + 10, top: Math.floor(index / 3) * 320 }, { input: label, left: (index % 3) * 380, top: Math.floor(index / 3) * 320 + 265 }];
}));
await sharp({ create: { width: 1140, height: Math.ceil(refs.length / 3) * 320, channels: 3, background: '#eeeaf3' } }).composite(tiles.flat()).png().toFile(path.join(output, 'contact-sheet.png'));
