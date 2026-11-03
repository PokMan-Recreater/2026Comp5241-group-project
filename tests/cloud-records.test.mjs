import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateSessionPayload,supabaseConfig,authenticatedUser,setAuthCookies,normalizeCloudRecord} from '../scripts/supabase-support.mjs';
import account from '../api/account.js';
import records from '../api/interview-records.js';
const owner='11111111-1111-4111-8111-111111111111',id='22222222-2222-4222-8222-222222222222';
const payload=()=>({clientId:id,settings:{role:'developer',level:'beginner',language:'zh',persona:'pressure-male',context:''},uiLocale:'zh-CN',startedAt:Date.now()-10000,endedAt:Date.now(),messages:[{role:'user',content:'我负责测试',complete:true}]});
const response=()=>({headers:{},code:0,data:null,setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(v){this.data=v;return this;}});
function env(){const old={SUPABASE_URL:process.env.SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY:process.env.SUPABASE_PUBLISHABLE_KEY,SUPABASE_SECRET_KEY:process.env.SUPABASE_SECRET_KEY};Object.assign(process.env,{SUPABASE_URL:'https://example.supabase.co',SUPABASE_PUBLISHABLE_KEY:'public-test',SUPABASE_SECRET_KEY:'secret-test'});return()=>{for(const[k,v]of Object.entries(old))if(v===undefined)delete process.env[k];else process.env[k]=v;};}
test('save validates all settings and preserves completeness; client scores and owner IDs are ignored',()=>{
 const p=payload(),v=validateSessionPayload({...p,user_id:'victim',final_score:100,report:{score:100}});assert(!('user_id'in v));assert(!('report'in v));assert.equal(v.turns[0].transcript_status,'complete');assert.equal(validateSessionPayload({...p,messages:[{role:'user',content:'partial',complete:false}]}).turns[0].transcript_status,'partial');
 for(const bad of [{...p,clientId:'oops'},{...p,startedAt:0},{...p,settings:{...p.settings,role:'admin'}},{...p,messages:[{role:'system',content:'x'}]}])assert.throws(()=>validateSessionPayload(bad));
});
test('configuration accepts only HTTPS project origins and cookies are HttpOnly',()=>{
 assert.equal(supabaseConfig({SUPABASE_URL:'http://example.com',SUPABASE_PUBLISHABLE_KEY:'x',SUPABASE_SECRET_KEY:'y'}),null);const res=response();setAuthCookies({headers:{}},res,{access_token:'access',refresh_token:'refresh'});assert(res.headers['Set-Cookie'].every(x=>x.includes('HttpOnly; SameSite=Lax; Path=/api')));
});
test('missing session is never treated as role preview authentication',async()=>{await assert.rejects(()=>authenticatedUser({headers:{}},response(),{url:'https://example.supabase.co',key:'x'}),/login_required/);});
test('username registration uses server-assigned student role and never returns tokens',async()=>{
 const restore=env(),old=globalThis.fetch,calls=[];
 globalThis.fetch=async(url,opts)=>{calls.push({url,opts});return new Response(JSON.stringify(url.includes('/admin/users')?{id:owner}:{access_token:'private-access',refresh_token:'private-refresh',user:{id:owner,user_metadata:{username:'alice'},app_metadata:{role:'student'}}}));};
 try{const res=response();await account({method:'POST',headers:{host:'local',origin:'http://local'},body:{action:'signup',username:'Alice',password:'test-password',role:'admin'}},res);assert.equal(res.code,200);assert.equal(res.data.user.username,'alice');assert.equal(res.data.user.role,'student');assert.equal(JSON.parse(calls[0].opts.body).app_metadata.role,'student');assert.equal(JSON.parse(calls[0].opts.body).email_confirm,true);assert(!JSON.stringify(res.data).includes('private-access'));assert(res.headers['Set-Cookie']);}finally{globalThis.fetch=old;restore();}
});
test('reserved administrator signup and bcrypt-truncating passwords are rejected before network access',async()=>{
 const restore=env(),old=globalThis.fetch;globalThis.fetch=()=>{throw Error('Must not fetch');};
 try{for(const body of [{username:'admin',password:'test-password'},{username:'alice',password:'密'.repeat(30)}]){const res=response();await account({method:'POST',headers:{host:'local',origin:'http://local'},body:{action:'signup',...body}},res);assert.equal(res.code,400);}}finally{globalThis.fetch=old;restore();}
});
test('records use verified auth token and enforce RLS on reads/deletes',async()=>{
 const restore=env(),old=globalThis.fetch,calls=[];
 globalThis.fetch=async(url,opts)=>{calls.push({url,opts});return new Response(JSON.stringify(url.includes('/auth/v1/user')?{id:owner,email:'student@example.test'}:[]));};
 try{const req={method:'GET',url:'/api/interview-records',headers:{cookie:'forma_access=real-user-token',host:'local'}},res=response();await records(req,res);assert.equal(res.code,200);assert.deepEqual(res.data.records,[]);assert.equal(calls[1].opts.headers.Authorization,'Bearer real-user-token');assert.equal(calls[1].opts.headers.apikey,'public-test');
  calls.length=0;const bad=response();await records({...req,method:'DELETE',url:'/api/interview-records?id='+id,headers:{...req.headers,origin:'https://evil.test'}},bad);assert.equal(bad.code,403);assert.equal(calls.length,0);
 }finally{globalThis.fetch=old;restore();}
});

test('one-to-one Supabase job relations normalize to the same list shape as other record relations',()=>{
 assert.deepEqual(normalizeCloudRecord({interview_review_jobs:{status:'pending'}}).interview_review_jobs,[{status:'pending'}]);
 assert.deepEqual(normalizeCloudRecord({interview_review_jobs:null}).interview_review_jobs,[]);
 assert.deepEqual(normalizeCloudRecord({interview_review_jobs:[{status:'completed'}]}).interview_review_jobs,[{status:'completed'}]);
});

test('browser connection failure is explicit and never reported as a database configuration error',async()=>{
 const {cloudAPI}=await import('../public/cloud-records.js');const old=globalThis.fetch;globalThis.fetch=async()=>{throw new TypeError('Failed to fetch');};
 try{await assert.rejects(()=>cloudAPI('/api/course-ai',{action:'lesson'}),/server_connection_failed/);}finally{globalThis.fetch=old;}
});
