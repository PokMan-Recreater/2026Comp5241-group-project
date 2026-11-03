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
test('teacher lesson generation validates JSON and never exposes provider credentials',()=>scenario(async()=>{const calls=[],lesson={id:'l1',title:'边界',body:'检查空数组和单元素。',scene:'compare',sceneItems:['空数组','单元素'],questions:[{id:'q1',prompt:'哪个测试覆盖空输入？',options:['[]','[1]'],correctIndex:0,explanation:'空数组验证没有元素的情况。'}]};globalThis.fetch=async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'teacher-1',app_metadata:{role:'teacher'}}:{choices:[{message:{content:JSON.stringify(lesson)}}]}));};const res=response();await handler(request(body),res);assert.equal(res.statusCode,200);assert.deepEqual(res.data.lesson,lesson);assert.equal(calls.length,2);assert.equal(JSON.parse(calls[1].options.body).thinking.type,'disabled');assert(!JSON.stringify(res.data).includes('test-private-key'));}));
test('provider rate limit remains explicit and invalid answers cannot be accepted',()=>scenario(async()=>{for(const [status,content,expected]of [[429,{},'provider_rate_limited'],[200,{choices:[{message:{content:'{"id":"bad"}'}}]},'invalid_ai_result']]){globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'teacher-'+status,app_metadata:{role:'teacher'}}:content),{status:String(url).includes('/auth/v1/user')?200:status});const res=response();await handler(request(body),res);assert.equal(res.data.error,expected);}}));
test('official copies have teaching content and do not mutate original definitions',()=>{const a=officialCourseCopy('delivery-basics','en'),b=officialCourseCopy('delivery-basics','zh-CN');assert.equal(a.lessons.length,5);assert(a.lessons.every(l=>l.body.length>100&&l.sceneItems.length>=2));assert.notEqual(a.title,b.title);a.lessons[0].title='changed';assert.notEqual(officialCourseCopy('delivery-basics','en').lessons[0].title,'changed');});
test('scene templates escape author and model text instead of executing it',()=>{const html=sceneHTML({title:'<script>',scene:'flow',sceneItems:['<img src=x>','two']});assert(!html.includes('<img'));assert(html.includes('&lt;img'));});
test('scene templates wrap long labels instead of dropping the rest of the word',()=>{const html=sceneHTML({title:'DApps',scene:'flow',sceneItems:['DApps Definition','Key Characteristics','Traditional Apps','Smart Contracts','Blockchain Integration']});for(const word of ['DApps','Definition','Characteristics','Traditional','Contracts','Blockchain','Integration'])assert(html.includes(word),word+' should be visible');});

test('provider timeouts are not mislabeled as database failures',()=>scenario(async()=>{
 globalThis.fetch=async url=>{if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'timeout-teacher',app_metadata:{role:'teacher'}}));throw new DOMException('timed out','TimeoutError');};
 const res=response();await handler(request(body),res);assert.equal(res.statusCode,502);assert.equal(res.data.error,'provider_timeout');
}));

test('overloaded free model falls back only to the same-provider free model',()=>scenario(async()=>{
 const models=[],lesson={id:'lesson-test',title:'区块链',body:'区块链将记录按顺序连接，节点依据约定验证记录。',scene:'flow',sceneItems:['记录','验证'],questions:[{id:'q1',prompt:'区块链记录如何组织？',options:['按约定连接','随意覆盖'],correctIndex:0,explanation:'记录按顺序连接。'}]};
 globalThis.fetch=async(url,options)=>{
  if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'fallback-teacher',app_metadata:{role:'teacher'}}));
  const payload=JSON.parse(options.body);models.push(payload.model);
  return models.length===1?new Response(JSON.stringify({error:{code:'1305'}}),{status:429}):new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(lesson)}}]}));
 };
 const res=response();await handler(request(body),res);assert.equal(res.statusCode,200);assert.deepEqual(models,['glm-4.7-flash','glm-4-flash-250414']);assert.equal(res.data.fallbackUsed,true);assert.equal(res.data.model,'glm-4-flash-250414');assert.deepEqual(res.data.lesson,lesson);
}));

const slideLesson={id:'lesson-dapp',title:'DApp 概览',scene:'auto',questions:[{id:'q1',prompt:'DApp 的后端逻辑运行在哪里？',options:['智能合约','本地 Excel'],correctIndex:0,explanation:'DApp 把后端逻辑放在智能合约里。'}],slides:[
 {heading:'什么是 DApp',bullets:['运行在区块链上','后端由智能合约提供'],art:{scene:'layers',items:['前端界面','智能合约','区块链数据']}},
 {heading:'一次调用',bullets:['钱包签名交易','网络执行合约'],art:{scene:'flow',items:['钱包签名','网络广播','合约执行','结果回写']}},
 {heading:'取舍',bullets:['透明可验证','速度相对较慢'],art:{scene:'balance',items:['透明可信','性能成本']}}
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

test('outline prompt offers the full scene vocabulary instead of a partial list',()=>scenario(async()=>{
 const course={title:'DApp 入门',description:'面向新生',language:'zh-CN',lessons:[{id:'lesson-1',title:'什么是 DApp',body:'介绍去中心化应用。',scene:'flow',sceneItems:['用户','合约'],questions:[]}]};
 let prompt='';
 globalThis.fetch=async(url,options)=>{if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'prompt-teacher',app_metadata:{role:'teacher'}}));prompt=JSON.parse(options.body).messages[0].content;return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(course)}}]}));};
 const res=response();await handler(request({...body,action:'outline'}),res);
 assert.equal(res.statusCode,200);
 for(const scene of SCENE_IDS.filter(id=>id!=='auto'))assert.ok(prompt.includes(scene),scene+' missing from outline prompt');
 assert.match(prompt,/sceneItems to 2 to 5/);
}));

test('a primary model timeout retries the fast fallback instead of failing',()=>scenario(async()=>{
 const models=[],lesson={id:'lesson-timeout',title:'超时回退',body:'主模型超时后应切换到快速备用模型。',scene:'flow',sceneItems:['主模型超时','切换备用'],questions:[{id:'q1',prompt:'超时后做什么？',options:['切换备用模型','直接报错'],correctIndex:0,explanation:'备用模型更稳定。'}]};
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
  {id:'lesson-1',title:'什么是 DApp',body:'介绍去中心化应用。',scene:'flow',sceneItems:['用户','合约'],questions:[],duration:20},
  {id:'lesson-2',title:'钱包',body:'介绍钱包与签名。',scene:'phone',sceneItems:['打开 App','签名交易'],questions:[],objectives:['理解私钥']}
 ]};
 globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'normalize-teacher',app_metadata:{role:'teacher'}}:{choices:[{message:{content:JSON.stringify(course)}}]}));
 const res=response();await handler(request({...body,action:'outline'}),res);
 assert.equal(res.statusCode,200);
 const normalized=res.data.course;
 assert.deepEqual(Object.keys(normalized).sort(),['description','language','lessons','title']);
 assert.deepEqual(Object.keys(normalized.lessons[0]).sort(),['body','id','questions','scene','sceneItems','title']);
 assert.deepEqual(validateCourse(normalized),normalized);
}));

test('outlines that repeat one lesson title are rejected instead of saving identical lessons',()=>scenario(async()=>{
 const lesson={id:'lesson-1',title:'What are DApps?',body:'大纲摘要。',scene:'flow',sceneItems:['定义','合约'],questions:[]};
 const course={title:'DApp 深度解析',description:'面向新生',language:'zh-CN',lessons:[lesson,{...lesson,id:'lesson-2'},{...lesson,id:'lesson-3'}]};
 globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'dup-teacher',app_metadata:{role:'teacher'}}:{choices:[{message:{content:JSON.stringify(course)}}]}));
 const res=response();await handler(request({...body,action:'outline'}),res);
 assert.equal(res.statusCode,502);assert.equal(res.data.error,'duplicate_lesson_titles');
}));
