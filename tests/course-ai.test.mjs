import {test} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/course-ai.js';
import {officialCourseCopy,sceneHTML} from '../public/teaching.js';
import {sceneArt} from '../public/scene-render.js';
import {validateCourse} from '../scripts/teaching-support.mjs';
import {SCENE_IDS} from '../scripts/teaching-scenes.mjs';
const response=()=>({headers:{},statusCode:0,data:null,setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},json(data){this.data=data;return this;}});
const request=body=>({method:'POST',url:'/api/course-ai',headers:{host:'local',origin:'http://local',cookie:'forma_access=teacher-test'},body});
const body={action:'lesson',language:'zh-CN',topic:'测试',requirements:'解释边界测试',instruction:'用具体例子说明'};
async function scenario(fn){const saved={...process.env},fetch=globalThis.fetch;Object.assign(process.env,{SUPABASE_URL:'https://example.supabase.co',SUPABASE_PUBLISHABLE_KEY:'public',SUPABASE_SECRET_KEY:'private',AI_BASE_URL:'https://open.bigmodel.cn/api/paas/v4',AI_MODEL:'glm-4.7-flash',AI_API_KEY:'test-private-key'});try{await fn();}finally{globalThis.fetch=fetch;for(const k of Object.keys(process.env))if(!(k in saved))delete process.env[k];Object.assign(process.env,saved);}}
test('student accounts cannot spend teacher AI quota',()=>scenario(async()=>{let count=0;globalThis.fetch=async()=>{count++;return new Response(JSON.stringify({id:'student',app_metadata:{role:'student'}}));};const res=response();await handler(request(body),res);assert.equal(res.statusCode,403);assert.equal(count,1);}));
test('teacher lesson generation validates JSON and never exposes provider credentials',()=>scenario(async()=>{const calls=[],lesson={id:'l1',title:'边界',objectives:['理解空输入','识别单元素边界'],misconceptions:['空输入等于不需要测试。正确做法是把空输入当作合法但无元素的输入。'],body:'检查空数组和单元素。',scene:'compare',sceneItems:['空数组','单元素'],questions:[{id:'q1',prompt:'哪个测试覆盖空输入？',options:['[]','[1]'],correctIndex:0,explanation:'空数组验证没有元素的情况。'}]};globalThis.fetch=async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'teacher-1',app_metadata:{role:'teacher'}}:{choices:[{message:{content:JSON.stringify(lesson)}}]}));};const res=response();await handler(request(body),res);assert.equal(res.statusCode,200);assert.deepEqual(res.data.lesson,lesson);assert.equal(calls.length,2);assert.equal(JSON.parse(calls[1].options.body).thinking.type,'disabled');assert(!JSON.stringify(res.data).includes('test-private-key'));}));
test('provider rate limit remains explicit and invalid answers cannot be accepted',()=>scenario(async()=>{for(const [status,content,expected]of [[429,{},'provider_rate_limited'],[200,{choices:[{message:{content:'{"id":"bad"}'}}]},'invalid_ai_result']]){globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'teacher-'+status,app_metadata:{role:'teacher'}}:content),{status:String(url).includes('/auth/v1/user')?200:status});const res=response();await handler(request(body),res);assert.equal(res.data.error,expected);}}));
test('official copies have teaching content and do not mutate original definitions',()=>{const a=officialCourseCopy('delivery-basics','en'),b=officialCourseCopy('delivery-basics','zh-CN');assert.equal(a.lessons.length,5);assert(a.lessons.every(l=>l.body.length>100&&l.sceneItems.length>=2));assert.notEqual(a.title,b.title);a.lessons[0].title='changed';assert.notEqual(officialCourseCopy('delivery-basics','en').lessons[0].title,'changed');});
test('scene templates escape author and model text instead of executing it',()=>{const html=sceneHTML({title:'<script>',scene:'flow',sceneItems:['<img src=x>','two']});assert(!html.includes('<img'));assert(html.includes('&lt;img'));});
test('scene templates wrap long labels instead of dropping the rest of the word',()=>{const html=sceneHTML({title:'DApps',scene:'flow',sceneItems:['DApps Definition','Key Characteristics','Traditional Apps','Smart Contracts','Blockchain Integration']});for(const word of ['DApps','Definition','Characteristics','Traditional','Contracts','Blockchain','Integration'])assert(html.includes(word),word+' should be visible');});

test('provider timeouts are not mislabeled as database failures',()=>scenario(async()=>{
 globalThis.fetch=async url=>{if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'timeout-teacher',app_metadata:{role:'teacher'}}));throw new DOMException('timed out','TimeoutError');};
 const res=response();await handler(request(body),res);assert.equal(res.statusCode,502);assert.equal(res.data.error,'provider_timeout');
}));

test('overloaded free model falls back only to the same-provider free model',()=>scenario(async()=>{
 const models=[],lesson={id:'lesson-test',title:'区块链',objectives:['解释记录如何连接','说明节点如何验证'],misconceptions:['区块链记录可以随意覆盖。正确做法是每个区块从前一区块的哈希继续连接。'],body:'区块链将记录按顺序连接，节点依据约定验证记录。',scene:'flow',sceneItems:['记录','验证'],questions:[{id:'q1',prompt:'区块链记录如何组织？',options:['按约定连接','随意覆盖'],correctIndex:0,explanation:'记录按顺序连接。'}]};
 globalThis.fetch=async(url,options)=>{
  if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'fallback-teacher',app_metadata:{role:'teacher'}}));
  const payload=JSON.parse(options.body);models.push(payload.model);
  return models.length===1?new Response(JSON.stringify({error:{code:'1305'}}),{status:429}):new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(lesson)}}]}));
 };
 const res=response();await handler(request(body),res);assert.equal(res.statusCode,200);assert.deepEqual(models,['glm-4.7-flash','glm-4-flash-250414']);assert.equal(res.data.fallbackUsed,true);assert.equal(res.data.model,'glm-4-flash-250414');assert.deepEqual(res.data.lesson,lesson);
}));

const slideLesson={id:'lesson-dapp',title:'DApp 概览',objectives:['说清 DApp 的组成','解释一次调用的过程'],misconceptions:['DApp 的后端也放在中心服务器。正确做法是把后端逻辑放进智能合约。'],scene:'auto',questions:[{id:'q1',prompt:'DApp 的后端逻辑运行在哪里？',options:['智能合约','本地 Excel'],correctIndex:0,explanation:'DApp 把后端逻辑放在智能合约里。'}],slides:[
 {heading:'什么是 DApp',concept:'去中心化应用的分层结构',bullets:['运行在区块链上','后端由智能合约提供'],script:['DApp 的前端和普通网页相似。','关键区别是后端逻辑写进智能合约，由区块链执行。'],notes:['先分清界面、合约和数据三层。'],art:{scene:'layers',items:['前端界面','智能合约','区块链数据']}},
 {heading:'一次调用',concept:'从钱包签名到结果回写',bullets:['钱包签名交易','网络执行合约'],script:['用户先在钱包里签名，交易才可能生效。','网络执行合约，确认后把结果写回链上。'],art:{scene:'flow',items:['钱包签名','网络广播','合约执行','结果回写']}},
 {heading:'取舍',concept:'透明性与性能的权衡',bullets:['透明可验证','速度相对较慢'],script:['链上执行让结果可验证。','代价是确认速度和计算成本更高。'],notes:['取舍要结合具体场景判断。'],art:{scene:'balance',items:['透明可信','性能成本']}}
]};

test('structured slide lessons are accepted and derive outline fields',()=>scenario(async()=>{
 globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'slides-teacher',app_metadata:{role:'teacher'}}:{choices:[{message:{content:JSON.stringify(slideLesson)}}]}));
 const res=response();await handler(request(body),res);
 assert.equal(res.statusCode,200);
 const lesson=res.data.lesson;
 assert.deepEqual(lesson.slides,slideLesson.slides);
 assert.equal(lesson.scene,'layers');
 assert.deepEqual(lesson.sceneItems,['前端界面','智能合约','区块链数据']);
 assert.match(lesson.body,/什么是 DApp/);
 assert.deepEqual(lesson.questions,slideLesson.questions);
}));

test('an invalid first answer is repaired with the validation feedback instead of failing',()=>scenario(async()=>{
 const bad=JSON.parse(JSON.stringify(slideLesson));bad.slides[0].art={scene:'document',items:['甲','乙','丙','丁']};
 const calls=[];
 globalThis.fetch=async(url,options)=>{
  if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'repair-teacher',app_metadata:{role:'teacher'}}));
  calls.push(JSON.parse(options.body));
  return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(calls.length===1?bad:slideLesson)}}]}));
 };
 const res=response();await handler(request(body),res);
 assert.equal(res.statusCode,200);
 assert.deepEqual(res.data.lesson.slides,slideLesson.slides);
 assert.equal(calls.length,2);
 assert.equal(calls[1].messages.length,4);
 assert.match(calls[1].messages[3].content,/failed validation/);
 assert.match(calls[1].messages[3].content,/art must use a known scene/);
}));

test('a slide illustration scene must come from the bounded vocabulary',()=>scenario(async()=>{
 const bad=JSON.parse(JSON.stringify(slideLesson));bad.slides[0].art.scene='script';
 globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'scene-teacher',app_metadata:{role:'teacher'}}:{choices:[{message:{content:JSON.stringify(bad)}}]}));
 const res=response();await handler(request(body),res);assert.equal(res.statusCode,502);assert.equal(res.data.error,'invalid_ai_result');
}));

test('story templates in slide art survive validation and render their labels',()=>scenario(async()=>{
 const story=JSON.parse(JSON.stringify(slideLesson));
 story.slides[0].art={scene:'database',items:['客户端','服务器','数据库']};
 story.slides[1].art={scene:'phone',items:['打开 App','确认签名','交易完成']};
 story.slides[2].art={scene:'conversation',items:['用户提问','合约回答','结果回写']};
 globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'story-teacher',app_metadata:{role:'teacher'}}:{choices:[{message:{content:JSON.stringify(story)}}]}));
 const res=response();await handler(request(body),res);
 assert.equal(res.statusCode,200);
 const arts=res.data.lesson.slides.map(s=>s.art);
 assert.deepEqual(arts.map(a=>a.scene),['database','phone','conversation']);
 for(const art of arts)for(const item of art.items)assert.ok(sceneArt(art.scene,art.items).includes(item),item+' should be visible');
}));

test('slide art that exceeds its template slot count is rejected instead of clipped',()=>scenario(async()=>{
 const bad=JSON.parse(JSON.stringify(slideLesson));bad.slides[0].art={scene:'document',items:['甲','乙','丙','丁']};
 globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'capacity-teacher',app_metadata:{role:'teacher'}}:{choices:[{message:{content:JSON.stringify(bad)}}]}));
 const res=response();await handler(request(body),res);assert.equal(res.statusCode,502);assert.equal(res.data.error,'invalid_ai_result');
}));

test('generated lessons must declare objectives, misconceptions and per-slide narration',()=>scenario(async()=>{
 for(const strip of [l=>delete l.objectives,l=>delete l.misconceptions,l=>delete l.slides[0].concept,l=>delete l.slides[0].script]){
  const bad=JSON.parse(JSON.stringify(slideLesson));strip(bad);
  globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'required-teacher',app_metadata:{role:'teacher'}}:{choices:[{message:{content:JSON.stringify(bad)}}]}));
  const res=response();await handler(request(body),res);assert.equal(res.statusCode,502);assert.equal(res.data.error,'invalid_ai_result');
 }
}));

test('outline prompt offers the full scene vocabulary instead of a partial list',()=>scenario(async()=>{
 const course={title:'DApp 入门',description:'面向新生',language:'zh-CN',lessons:[{id:'lesson-1',title:'什么是 DApp',objectives:['解释 DApp 的组成','区分 DApp 与普通网页'],body:'介绍去中心化应用。',scene:'flow',sceneItems:['用户','合约'],questions:[]}]};
 let prompt='';
 globalThis.fetch=async(url,options)=>{if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'prompt-teacher',app_metadata:{role:'teacher'}}));prompt=JSON.parse(options.body).messages[0].content;return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(course)}}]}));};
 const res=response();await handler(request({...body,action:'outline'}),res);
 assert.equal(res.statusCode,200);
 for(const scene of SCENE_IDS.filter(id=>id!=='auto'))assert.ok(prompt.includes(scene),scene+' missing from outline prompt');
 assert.match(prompt,/sceneItems to 2 to 5/);
}));

test('a primary model timeout retries the fast fallback instead of failing',()=>scenario(async()=>{
 const models=[],lesson={id:'lesson-timeout',title:'超时回退',objectives:['说明超时后的回退','识别备用模型的限制'],misconceptions:['超时应当直接报错。正确做法是保留草稿并切换同一提供商的快速备用模型重试。'],body:'主模型超时后应切换到快速备用模型。',scene:'flow',sceneItems:['主模型超时','切换备用'],questions:[{id:'q1',prompt:'超时后做什么？',options:['切换备用模型','直接报错'],correctIndex:0,explanation:'备用模型更稳定。'}]};
 globalThis.fetch=async(url,options)=>{
  if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'timeout-fallback-teacher',app_metadata:{role:'teacher'}}));
  const payload=JSON.parse(options.body);models.push(payload.model);
  if(models.length===1)throw new DOMException('timed out','TimeoutError');
  return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(lesson)}}]}));
 };
 const res=response();await handler(request(body),res);
 assert.equal(res.statusCode,200);
 assert.deepEqual(models,['glm-4.7-flash','glm-4-flash-250414']);
 assert.equal(res.data.fallbackUsed,true);
 assert.deepEqual(res.data.lesson,lesson);
}));

test('outline suggestions are normalized so the accepted draft can be saved',()=>scenario(async()=>{
 const course={title:'DApp 入门',description:'面向新生',language:'zh-CN',level:'beginner',totalLessons:2,lessons:[
  {id:'lesson-1',title:'什么是 DApp',objectives:['解释 DApp 的组成','区分 DApp 与普通网页'],body:'介绍去中心化应用。',scene:'flow',sceneItems:['用户','合约'],questions:[],duration:20},
  {id:'lesson-2',title:'钱包',objectives:['说明钱包的作用','解释签名交易'],body:'介绍钱包与签名。',scene:'phone',sceneItems:['打开 App','签名交易'],questions:[]}
 ]};
 globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'normalize-teacher',app_metadata:{role:'teacher'}}:{choices:[{message:{content:JSON.stringify(course)}}]}));
 const res=response();await handler(request({...body,action:'outline'}),res);
 assert.equal(res.statusCode,200);
 const normalized=res.data.course;
 assert.deepEqual(Object.keys(normalized).sort(),['description','language','lessons','title']);
 assert.deepEqual(Object.keys(normalized.lessons[0]).sort(),['body','id','objectives','questions','scene','sceneItems','title']);
 assert.deepEqual(validateCourse(normalized),normalized);
}));

test('outlines that repeat one lesson title are rejected instead of saving identical lessons',()=>scenario(async()=>{
 const lesson={id:'lesson-1',title:'What are DApps?',objectives:['解释 DApp 的组成','区分 DApp 与普通网页'],body:'大纲摘要。',scene:'flow',sceneItems:['定义','合约'],questions:[]};
 const course={title:'DApp 深度解析',description:'面向新生',language:'zh-CN',lessons:[lesson,{...lesson,id:'lesson-2'},{...lesson,id:'lesson-3'}]};
 globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'dup-teacher',app_metadata:{role:'teacher'}}:{choices:[{message:{content:JSON.stringify(course)}}]}));
 const res=response();await handler(request({...body,action:'outline'}),res);
 assert.equal(res.statusCode,502);assert.equal(res.data.error,'duplicate_lesson_titles');
}));
