import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ai from '../api/ai.js';
const root = fileURLToPath(new URL('../public/', import.meta.url));
const mime = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.json':'application/json' };
const server = http.createServer(async (req, res) => {
  if (req.url.split('?')[0] === '/api/ai') {
    res.status = n => { res.statusCode = n; return res; };
    res.json = obj => { res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(obj)); };
    return ai(req,res);
  }
  try {
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const target = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!target.startsWith(root)) { res.writeHead(403); res.end(); return; }
    const data = await readFile(target);
    res.writeHead(200, { 'Content-Type':mime[path.extname(target)] || 'application/octet-stream', 'Cache-Control':'no-cache' });
    res.end(data);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(Number(process.env.PORT || 4173),'127.0.0.1',()=>console.log('Forma preview: http://127.0.0.1:' + server.address().port));
