import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const modules = process.env.CODEX_RUNTIME_NODE_MODULES;
if (!modules) throw new Error('Set CODEX_RUNTIME_NODE_MODULES to the bundled package directory.');
const require = createRequire(path.join(modules, 'package.json'));
const { chromium } = require('playwright');
const root = process.cwd();
const service = JSON.parse(await fs.readFile(path.join(root, '.design-scout/service.json'), 'utf8'));
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
try {
  const page = await browser.newPage({ viewport: { width: 1500, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(service.url + '&reference=haruhi-key', { waitUntil: 'networkidle' });
  await page.locator('.style-card').first().waitFor();
  await page.locator('.style-card img').evaluateAll(async imgs => {
    for (const img of imgs) img.loading = 'eager';
    await Promise.all(imgs.map(img => img.decode().catch(() => {})));
  });
  const count = await page.locator('.style-card').count();
  const imageState = await page.locator('.style-card img').evaluateAll(imgs => imgs.map(i => ({ alt: i.alt, loaded: i.complete && i.naturalWidth > 0 })));
  await fs.mkdir(path.join(root, '.build/reference-inspection'), { recursive: true });
  await page.screenshot({ path: path.join(root, '.build/reference-inspection/board-desktop.png'), fullPage: true });
  await page.getByRole('button', { name: '作品 / 元素', exact: true }).first().click();
  await page.locator('#detail[open]').waitFor();
  const detailWorks = await page.locator('#detail-body .reference-item').count();
  await page.screenshot({ path: path.join(root, '.build/reference-inspection/board-detail.png') });
  const result = { directions: count, detailWorks, visibleImages: imageState.length, imagesLoaded: imageState.filter(i => i.loaded).length, errors, selectionMutated: false };
  console.log(JSON.stringify(result, null, 2));
  if (count !== 8 || errors.length || imageState.some(i => !i.loaded)) process.exitCode = 1;
} finally {
  await browser.close();
}
