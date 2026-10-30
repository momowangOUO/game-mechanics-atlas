import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
const url=process.argv[2];
if(!url) throw new Error('Pass the running design preview URL.');
const modules=process.env.CODEX_RUNTIME_NODE_MODULES;
if(!modules) throw new Error('Set CODEX_RUNTIME_NODE_MODULES to the bundled package directory.');
const {chromium}=createRequire(path.join(modules,'package.json'))('playwright');
const browser=await chromium.launch({headless:true,channel:process.env.PLAYWRIGHT_CHANNEL||'msedge'});
const reports=[];
try{
  for(const id of ['home-desktop','home-mobile','mechanic','game','heat','lab']){
    const mobile=id==='home-mobile',page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},deviceScaleFactor:1});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(`${url}/${id}.html`,{waitUntil:'networkidle'});
    await page.locator('img').evaluateAll(async images=>{await Promise.all(images.map(i=>i.decode().catch(()=>{})));});
    await page.screenshot({path:`design/previews/${id}.png`,fullPage:true});
    const state=await page.evaluate(()=>({images:[...document.images].map(i=>({loaded:i.complete&&i.naturalWidth>0,alt:i.alt})),overflow:document.documentElement.scrollWidth>window.innerWidth,h1:document.querySelector('h1')?.textContent}));
    reports.push({id,viewport:mobile?'390x844':'1440x1000',...state,errors});
    await page.close();
  }
}finally{await browser.close();}
await fs.writeFile('design/previews/render-report.json',JSON.stringify(reports,null,2)+'\n');
console.log(JSON.stringify(reports,null,2));
if(reports.some(r=>r.errors.length||r.overflow||r.images.some(i=>!i.loaded)))process.exitCode=1;
