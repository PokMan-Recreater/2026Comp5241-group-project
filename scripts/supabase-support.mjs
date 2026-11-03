import {sameOrigin,readJSON,allowRequest} from './interview-support.mjs';
export {sameOrigin,readJSON,allowRequest};
export class CloudError extends Error {constructor(code,status=502){super(code);this.status=status;}}
export function supabaseConfig(env=process.env){
 let url;try{url=new URL(env.SUPABASE_URL);}catch{return null;}
 if(url.protocol!=='https:'||!url.hostname.endsWith('.supabase.co')||url.username||url.password)return null;
 const key=env.SUPABASE_PUBLISHABLE_KEY,secret=env.SUPABASE_SECRET_KEY;
 return key&&secret?{url:url.origin,key,secret}:null;
}
/** @param {any} config @param {string} path @param {{method?:string,body?:any,token?:string,admin?:boolean,headers?:Record<string,string>}} [options] */
export async function cloudRequest(config,path,{method='GET',body,token,admin=false,headers={}}={}){
 const response=await fetch(config.url+path,{method,headers:{apikey:admin?config.secret:config.key,...(token?{Authorization:'Bearer '+token}:{}),'Content-Type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new CloudError(response.status===401||response.status===403?'login_required':response.status===429?'rate_limited':'database_unavailable',response.status===401||response.status===403?401:response.status===429?429:502);
 if(response.status===204)return null;const text=await response.text();return text?JSON.parse(text):null;
}
const cookies=req=>Object.fromEntries(String(req.headers.cookie||'').split(';').map(x=>{const i=x.indexOf('=');return [x.slice(0,i).trim(),x.slice(i+1)];}));
export function setAuthCookies(req,res,session){
 const secure=process.env.VERCEL||req.headers['x-forwarded-proto']==='https';
 const options=`; HttpOnly; SameSite=Lax; Path=/api${secure?'; Secure':''}`;
 res.setHeader('Set-Cookie',['forma_access','forma_refresh'].map((name,i)=>`${name}=${encodeURIComponent(session?.[i?'refresh_token':'access_token']||'')}; Max-Age=${session?(i?604800:3600):0}${options}`));
}
export async function authenticatedUser(req,res,config){
 const jar=cookies(req);let token;try{token=decodeURIComponent(jar.forma_access||'');}catch{throw new CloudError('login_required',401);}
 if(token){try{return {user:await cloudRequest(config,'/auth/v1/user',{token}),token};}catch(error){if(error.status!==401)throw error;}}
 let refresh;try{refresh=decodeURIComponent(jar.forma_refresh||'');}catch{throw new CloudError('login_required',401);}
 if(!refresh)throw new CloudError('login_required',401);
 const session=await cloudRequest(config,'/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:refresh}});
 setAuthCookies(req,res,session);return {user:session.user,token:session.access_token};
}
export function cloudFailure(res,error){return res.status(error.status||502).json({error:error instanceof CloudError?error.message:'database_unavailable'});}
export const validUUID=value=>typeof value==='string'&&/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(value);
export function validateSessionPayload(body){
 const {settings={},messages=[],clientId,startedAt,endedAt,reason='',uiLocale='zh-CN'}=body||{};
 if(!validUUID(clientId)||!['developer','frontend','data','product'].includes(settings.role)||!['beginner','intermediate','advanced'].includes(settings.level)||!['zh','en'].includes(settings.language)||!['en','zh-CN','zh-TW'].includes(uiLocale)||typeof settings.persona!=='string'||!/^((pressure|gentle|professional)-(male|female))$/.test(settings.persona))throw new CloudError('invalid_request',400);
 if(typeof settings.context!=='string'||settings.context.length>2500||!Number.isFinite(startedAt)||!Number.isFinite(endedAt)||startedAt<=0||startedAt>endedAt||endedAt>Date.now()+60000||endedAt-startedAt>86400000||typeof reason!=='string'||reason.length>200||!Array.isArray(messages)||messages.length>200)throw new CloudError('invalid_request',400);
 const turns=messages.map((m,i)=>{if(!['user','assistant'].includes(m.role)||typeof m.content!=='string'||!m.content.trim()||m.content.length>12000)throw new CloudError('invalid_request',400);return {sequence:i,role:m.role,text:m.content,transcript_status:m.complete===false?'partial':'complete'};});
 if(turns.reduce((n,m)=>n+m.text.length,0)>150000)throw new CloudError('invalid_request',400);
 return {client_session_id:clientId,role:settings.role,difficulty:settings.level,spoken_language:settings.language,ui_language:uiLocale,persona_id:settings.persona,persona_version:'1',project_context:settings.context,consent_version:'interview-cloud-1',consented_at:new Date(startedAt).toISOString(),started_at:new Date(startedAt).toISOString(),ended_at:new Date(endedAt).toISOString(),duration_seconds:Math.round((endedAt-startedAt)/1000),ended_reason:reason,status:reason.includes('异常')||reason.includes('断开')?'interrupted':'completed',turns};
}

export function normalizeCloudRecord(record){
 const job=record.interview_review_jobs;
 return {...record,interview_review_jobs:Array.isArray(job)?job:job?[job]:[]};
}
