import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(), design=path.join(root,'design'), art=path.join(root,'public','art');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');const base=url.pathname.startsWith('/art/')?art:design;const relative=url.pathname.startsWith('/art/')?url.pathname.slice(5):url.pathname.slice(1)||'index.html';const file=path.resolve(base,decodeURIComponent(relative));if(!file.startsWith(base+path.sep)){res.writeHead(403);return res.end('Forbidden');}const bytes=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);}catch{res.writeHead(404);res.end('Not found');}});
server.listen(0,'127.0.0.1',()=>{const address=server.address();console.log(JSON.stringify({url:`http://127.0.0.1:${address.port}`,pid:process.pid}));});
