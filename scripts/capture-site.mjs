import { chromium } from '@playwright/test';
import { mkdir,readFile,writeFile } from 'node:fs/promises';

const base=process.env.PLAYWRIGHT_BASE_URL||'http://127.0.0.1:3000';
const output='docs/screenshots';await mkdir(output,{recursive:true});
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',headless:true});
const records=[];
for(const [name,path,width] of [
 ['home-desktop','/',1440],['home-mobile','/',390],['mechanic','/mechanics/score-threshold',1440],['game','/games/balatro',1440],['heat','/heat?topic=combination:spatial-auto',1440],['lab','/lab?recipe=aimed-buildcraft',1440],['graph','/graph',1440],['compare','/compare',1440],['heat-mobile','/heat',390],['lab-mobile','/lab',390],
]){
 const context=await browser.newContext({viewport:{width,height:960},reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const response=await page.goto(`${base}${path}`);await page.waitForLoadState('networkidle');
 if(name==='lab')await page.getByRole('button',{name:/^分析当前组合/}).click();
 await page.screenshot({path:`${output}/${name}.png`,fullPage:true});
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 records.push({name,path,width,status:response.status(),overflow,errors});await context.close();
}
const research=JSON.parse(await readFile('docs/research/mechanic-dossiers.json','utf8'));
const gameData=JSON.parse(await readFile('docs/research/game-evidence.json','utf8'));
const genreData=JSON.parse(await readFile('docs/research/genre-recipes.json','utf8'));
const routes=['/','/mechanics','/games','/types','/graph','/heat','/lab','/compare','/method','/sources',...research.mechanisms.map(m=>`/mechanics/${m.id}`),...gameData.games.map(g=>`/games/${g.slug}`),...genreData.compositeTypes.map(g=>`/types/${g.id}`)];
const api=await browser.newContext();const routeChecks=[];
for(const route of routes){const response=await api.request.get(`${base}${route}`);routeChecks.push({route,status:response.status()});}
await api.close();await browser.close();
const report={viewportChecks:records,routeChecks};
await writeFile(`${output}/report.json`,JSON.stringify(report,null,2));
const problems=records.filter(r=>r.status!==200||r.overflow||r.errors.length).length+routeChecks.filter(r=>r.status!==200).length;
console.log(JSON.stringify({screenshots:records.length,routes:routes.length,problems}));
if(problems)process.exitCode=1;
