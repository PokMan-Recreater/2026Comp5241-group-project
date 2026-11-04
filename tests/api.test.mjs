import {test} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/ai.js';
function response(){return{headers:{},statusCode:200,setHeader(k,v){this.headers[k]=v;},status(code){this.statusCode=code;return this;},json(data){this.data=data;return this;}};}
test('AI endpoint fails explicitly when not configured, then validates and forwards bounded requests',async()=>{
 const originalConfig={SUPABASE_URL:process.env.SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY:process.env.SUPABASE_PUBLISHABLE_KEY,SUPABASE_SECRET_KEY:process.env.SUPABASE_SECRET_KEY,AI_BASE_URL:process.env.AI_BASE_URL,AI_MODEL:process.env.AI_MODEL};Object.assign(process.env,{SUPABASE_URL:'https://example.supabase.co',SUPABASE_PUBLISHABLE_KEY:'public',SUPABASE_SECRET_KEY:'private'});
 const withAuth=fetcher=>async(url,options)=>String(url).includes('/auth/v1/user')?new Response(JSON.stringify({id:'test-user',app_metadata:{role:'teacher'}})):fetcher(url,options);
 const original=process.env.AI_API_KEY;const originalFetch=globalThis.fetch;
 try{
  delete process.env.AI_API_KEY;
  let res=response();await handler({method:'GET',headers:{}},res);assert.equal(res.data.configured,false);
  res=response();await handler({method:'POST',headers:{}},res);assert.equal(res.statusCode,503);
  process.env.AI_API_KEY='test-only-placeholder';
  res=response();await handler({method:'POST',headers:{host:'example.com',origin:'https://untrusted.example'},body:{}},res);assert.equal(res.statusCode,403);
  res=response();await handler({method:'POST',headers:{host:'example.com',cookie:'forma_access=test-session'},body:{action:'unknown'}},res);assert.equal(res.statusCode,400);
  let payload;
  globalThis.fetch=withAuth(async(url,options)=>{payload=JSON.parse(options.body);return{ok:true,json:async()=>({choices:[{message:{content:'A bounded explanation.'}}]})};});
  res=response();await handler({method:'POST',headers:{host:'example.com',cookie:'forma_access=test-session'},body:{action:'tutor',language:'zh-TW',context:'Requirements',messages:[{role:'user',content:'Please explain.'}]}},res);
  assert.equal(res.statusCode,200);assert.equal(res.data.content,'A bounded explanation.');assert(payload.messages[0].content.includes('Traditional Chinese'));assert.equal(payload.max_tokens,800);
  globalThis.fetch=withAuth(async(url,options)=>{payload=JSON.parse(options.body);return{ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({body:'Expanded lesson body',advanced:'Deeper analysis'})}}]})};});
  res=response();await handler({method:'POST',headers:{host:'example.com',cookie:'forma_access=test-session'},body:{action:'expand',language:'en',topic:'Biology',title:'Cells',body:'Short outline'}},res);
  assert.equal(res.statusCode,200);assert.equal(res.data.lesson.body,'Expanded lesson body');assert.equal(res.data.lesson.advanced,'Deeper analysis');assert.equal(payload.max_tokens,1800);assert.equal(payload.response_format.type,'json_object');
  res=response();await handler({method:'POST',headers:{host:'example.com',cookie:'forma_access=test-session'},body:{action:'expand',language:'en',title:'Cells'}},res);assert.equal(res.statusCode,400);
  globalThis.fetch=withAuth(async()=>({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({title:'Course',description:'Description',lessons:[{title:'Lesson',body:'Real content'}]})}}]})}));
  res=response();await handler({method:'POST',headers:{host:'example.com',cookie:'forma_access=test-session'},body:{action:'generate',language:'en',topic:'Biology'}},res);assert.equal(res.statusCode,200);assert.equal(res.data.course.lessons.length,1);
  globalThis.fetch=withAuth(async()=>({ok:true,json:async()=>({choices:[{message:{content:'{}'}}]})}));
  res=response();await handler({method:'POST',headers:{host:'example.com',cookie:'forma_access=test-session'},body:{action:'generate',topic:'Biology'}},res);assert.equal(res.statusCode,502);
  Object.assign(process.env,{AI_BASE_URL:'https://open.bigmodel.cn/api/paas/v4',AI_MODEL:'glm-4.5-flash'});
  const models=[];globalThis.fetch=withAuth(async(url,options)=>{const sent=JSON.parse(options.body);models.push(sent.model);if(sent.model!=='glm-4-flash')return{ok:false,status:429,json:async()=>({error:{code:'1305'}})};return{ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({title:'Course',description:'Description',lessons:[{title:'Lesson',body:'Short outline'}]})}}]})};});
  res=response();await handler({method:'POST',headers:{host:'example.com',cookie:'forma_access=test-session'},body:{action:'generate',language:'en',topic:'Biology'}},res);
  assert.equal(res.statusCode,200);assert.deepEqual(models,['glm-4.5-flash','glm-4-flash']);
 }finally{for(const[k,v]of Object.entries(originalConfig))if(v===undefined)delete process.env[k];else process.env[k]=v;globalThis.fetch=originalFetch;if(original===undefined)delete process.env.AI_API_KEY;else process.env.AI_API_KEY=original;}
});
