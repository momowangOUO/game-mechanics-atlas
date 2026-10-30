import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const path='docs/game-artist/motion/mp4-manifest.json';const manifest=JSON.parse(await readFile(path,'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
if(hash(await readFile(manifest.path))!==manifest.sha256||hash(await readFile(manifest.source.path))!==manifest.source.sha256)throw new Error('Recording checksum mismatch.');
const source=JSON.parse(execFileSync(process.env.FFPROBE_PATH||'ffprobe',['-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=width,height,avg_frame_rate,nb_read_frames:format=duration','-of','json',manifest.source.path],{encoding:'utf8'}));
const original=source.streams[0];
if(original.width!==manifest.width||original.height!==manifest.height||original.avg_frame_rate!==manifest.frameRate||Number(original.nb_read_frames)!==manifest.frames||Math.abs(Number(source.format.duration)-manifest.durationSeconds)>.001)throw new Error('Conversion changed geometry, frame rate, frame count or duration.');
await mkdir('docs/copy-review/video-frames',{recursive:true});
const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1100}});
await page.goto(pathToFileURL(resolve('docs/game-artist/motion/index.html')).href);
await page.waitForFunction(()=>Number.isFinite(document.querySelector('video').duration));
const current=await page.locator('video').evaluate(v=>({src:v.currentSrc,width:v.videoWidth,height:v.videoHeight,duration:v.duration}));
if(!current.src.endsWith('.mp4')||current.width!==manifest.width||current.height!==manifest.height)throw new Error('Player did not select the MP4 source.');
await page.locator('video').evaluate(v=>{v.muted=true;return v.play();});
for(const [label,fraction] of [['start',.2],['middle',.5],['end',.8]]){
 await page.waitForFunction(t=>document.querySelector('video').currentTime>=t,current.duration*fraction);
 await page.locator('video').screenshot({path:`docs/copy-review/video-frames/${label}.png`});
}
await page.waitForFunction(()=>document.querySelector('video').ended);
const playback=await page.locator('video').evaluate(v=>{const quality=v.getVideoPlaybackQuality();return {durationSeconds:v.duration,totalFrames:quality.totalVideoFrames,droppedFrames:quality.droppedVideoFrames,ended:v.ended};});
await browser.close();manifest.sourceMatches={width:true,height:true,frameRate:true,frames:true,duration:true};manifest.playback=playback;manifest.playerSource='research-session.mp4';manifest.environment='Windows Edge headless; native HTML video playback, not real-device performance profiling';
await writeFile(path,JSON.stringify(manifest,null,2));console.log(JSON.stringify(manifest));
