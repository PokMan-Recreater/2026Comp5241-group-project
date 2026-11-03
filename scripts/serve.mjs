import account from '../api/account.js';
import interviewRecords from '../api/interview-records.js';
import interviewReviewWorker from '../api/interview-review-worker.js';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ai from '../api/ai.js';
import run from '../api/run.js';
import interview from '../api/interview.js';
import transcribe from '../api/transcribe.js';
import {parseEnv} from 'node:util';
import {attachDoubaoRealtime} from './doubao-realtime.mjs';
for(const name of ['.env.local','.env']){
 try{for(const [key,value]of Object.entries(parseEnv(await readFile(new URL('../'+name,import.meta.url),'utf8'))))if(process.env[key]===undefined)process.env[key]=value;}catch(error){if(error.code!=='ENOENT')throw error;}
}
const handlers={'/api/account':account,'/api/interview-records':interviewRecords,'/api/interview-review-worker':interviewReviewWorker,'/api/ai':ai,'/api/run':run,'/api/interview':interview,'/api/transcribe':transcribe};
const root = fileURLToPath(new URL('../public/', import.meta.url));
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.json':'application/json', '.mp3':'audio/mpeg', '.wav':'audio/wav' };
const server = http.createServer(async (req, res) => {
  if(req.url==='/api/realtime-status'){
    res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
    res.end(JSON.stringify({available:true,configured:!!process.env.DOUBAO_REALTIME_API_KEY,maxMinutes:10}));return;
  }
  if (Object.hasOwn(handlers,req.url.split('?')[0])) {
    const response = Object.assign(res, {
      status(n) { res.statusCode = n; return response; },
      json(obj) { res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(obj)); }
    });
    return handlers[req.url.split('?')[0]](req,response);
  }
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!target.startsWith(root)) { res.writeHead(403); res.end(); return; }
    const data = await readFile(target);
    const type=mime[path.extname(target)] || 'application/octet-stream';
    const headers={'Content-Type':type,'Cache-Control':'no-cache','Content-Length':data.length};
    if(type.startsWith('audio/')){
      headers['Accept-Ranges']='bytes';
      if(req.headers.range){
        const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        let start=match?.[1]?Number(match[1]):0,end=match?.[2]?Number(match[2]):data.length-1;
        if(match&&!match[1]&&match[2]){start=Math.max(0,data.length-Number(match[2]));end=data.length-1;}
        if(!match||(!match[1]&&!match[2])||start>=data.length||start>end){res.writeHead(416,{'Content-Range':`bytes */${data.length}`});res.end();return;}
        end=Math.min(end,data.length-1);
        res.writeHead(206,{...headers,'Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${data.length}`});
        res.end(req.method==='HEAD'?undefined:data.subarray(start,end+1));return;
      }
    }
    res.writeHead(200,headers);
    res.end(req.method==='HEAD'?undefined:data);
  } catch { res.writeHead(404); res.end('Not found'); }
});
attachDoubaoRealtime(server);
server.listen(Number(process.env.PORT || 4173),'127.0.0.1',()=>console.log('Forma preview: http://127.0.0.1:' + (/** @type {import('node:net').AddressInfo} */ (server.address())).port));
