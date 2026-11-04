import http from 'node:http';
import {attachDoubaoRealtime} from '../scripts/doubao-realtime.mjs';
import {supabaseConfig,cloudRequest,allowRequest} from '../scripts/supabase-support.mjs';
const server=http.createServer((_req,res)=>{
 res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});
 res.end(JSON.stringify({available:true,configured:!!process.env.DOUBAO_REALTIME_API_KEY,maxMinutes:4}));
});
attachDoubaoRealtime(server,{maxDurationMs:240000,authorize:async req=>{
 const hosts=[process.env.VERCEL_PROJECT_PRODUCTION_URL,process.env.VERCEL_URL,'2026comp5241-group11-project.vercel.app'].filter(Boolean);
 if(!hosts.includes(req.headers.host)||req.headers.origin!==`https://${req.headers.host}`||!allowRequest(req,'realtime',4))return false;
 const config=supabaseConfig();if(!config)return false;
 const cookie=String(req.headers.cookie||'').split(';').map(value=>value.trim()).find(value=>value.startsWith('forma_access='));
 const token=decodeURIComponent(cookie?.slice('forma_access='.length)||'');if(!token)return false;
 const user=await cloudRequest(config,'/auth/v1/user',{token});return !!user?.id;
}});
export default server;
