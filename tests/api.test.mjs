import {test} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/ai.js';
function response(){return{headers:{},statusCode:200,setHeader(k,v){this.headers[k]=v;},status(code){this.statusCode=code;return this;},json(data){this.data=data;return this;}};}
test('AI endpoint fails explicitly when not configured, then validates and forwards bounded requests',async()=>{
 const original=process.env.AI_API_KEY;const originalFetch=globalThis.fetch;
 try{
  delete process.env.AI_API_KEY;
  let res=response();await handler({method:'GET',headers:{}},res);assert.equal(res.data.configured,false);
  res=response();await handler({method:'POST',headers:{}},res);assert.equal(res.statusCode,503);
  process.env.AI_API_KEY='test-only-placeholder';
  res=response();await handler({method:'POST',headers:{host:'example.com',origin:'https://untrusted.example'},body:{}},res);assert.equal(res.statusCode,403);
  res=response();await handler({method:'POST',headers:{host:'example.com'},body:{action:'unknown'}},res);assert.equal(res.statusCode,400);
  let payload;
  globalThis.fetch=async(url,options)=>{payload=JSON.parse(options.body);return{ok:true,json:async()=>({choices:[{message:{content:'A bounded explanation.'}}]})};};
  res=response();await handler({method:'POST',headers:{host:'example.com'},body:{action:'tutor',language:'zh-TW',context:'Requirements',messages:[{role:'user',content:'Please explain.'}]}},res);
  assert.equal(res.statusCode,200);assert.equal(res.data.content,'A bounded explanation.');assert(payload.messages[0].content.includes('Traditional Chinese'));assert.equal(payload.max_tokens,800);
  globalThis.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:JSON.stringify({title:'Course',description:'Description',lessons:[{title:'Lesson',body:'Real content'}]})}}]})});
  res=response();await handler({method:'POST',headers:{host:'example.com'},body:{action:'generate',language:'en',topic:'Biology'}},res);assert.equal(res.statusCode,200);assert.equal(res.data.course.lessons.length,1);
  globalThis.fetch=async()=>({ok:true,json:async()=>({choices:[{message:{content:'{}'}}]})});
  res=response();await handler({method:'POST',headers:{host:'example.com'},body:{action:'generate',topic:'Biology'}},res);assert.equal(res.statusCode,502);
 }finally{globalThis.fetch=originalFetch;if(original===undefined)delete process.env.AI_API_KEY;else process.env.AI_API_KEY=original;}
});
