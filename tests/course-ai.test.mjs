import {test} from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/course-ai.js';
import {officialCourseCopy,sceneHTML} from '../public/teaching.js';
import {sceneArt} from '../public/scene-render.js';
import {validateCourse} from '../scripts/teaching-support.mjs';
import {SCENE_IDS} from '../scripts/teaching-scenes.mjs';
const fixtureScenes=['flow','network','timeline','decision','chart'];
const fixtureSlides=()=>['记录输入','验证规则','网络广播','状态确认','回看结果'].map((heading,i)=>({heading,concept:'步骤 '+(i+1),bullets:['检查这一阶段的输入和结果'],script:['小明提交一次转账，系统在这一阶段检查必要条件，并把结果交给下一步。'],art:{scene:fixtureScenes[i%fixtureScenes.length],items:['本步输入','验证结果']}}));
const response=()=>({headers:{},statusCode:0,data:null,setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},json(data){this.data=data;return this;}});
const request=body=>({method:'POST',url:'/api/course-ai',headers:{host:'local',origin:'http://local',cookie:'forma_access=teacher-test'},body});
const body={action:'lesson',language:'zh-CN',topic:'测试',requirements:'解释边界测试',instruction:'用具体例子说明'};
async function scenario(fn){const saved={...process.env},fetch=globalThis.fetch;Object.assign(process.env,{SUPABASE_URL:'https://example.supabase.co',SUPABASE_PUBLISHABLE_KEY:'public',SUPABASE_SECRET_KEY:'private',AI_BASE_URL:'https://open.bigmodel.cn/api/paas/v4',AI_MODEL:'glm-4.7-flash',AI_API_KEY:'test-private-key'});try{await fn();}finally{globalThis.fetch=fetch;for(const k of Object.keys(process.env))if(!(k in saved))delete process.env[k];Object.assign(process.env,saved);}}
test('students can spend AI quota on their own course material',()=>scenario(async()=>{const calls=[],lesson={id:'l1',title:'边界',objectives:['理解空输入','识别单元素边界'],misconceptions:['空输入不需要测试。正确做法是把它当作合法输入。'],slides:fixtureSlides(),body:'检查空数组。',scene:'compare',sceneItems:['空数组','单元素'],questions:[{id:'q1',prompt:'哪个测试覆盖空输入？',options:['[]','[1]'],correctIndex:0,explanation:'空数组验证没有元素的情况。'}]};globalThis.fetch=async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'student-ai',app_metadata:{role:'student'}}:{choices:[{message:{content:JSON.stringify(lesson)}}]}));};const res=response();await handler(request(body),res);assert.equal(res.statusCode,200);assert.deepEqual(res.data.lesson,lesson);assert.equal(calls.length,2);}));
test('course AI refuses a course owned by someone else',()=>scenario(async()=>{let provider=0;globalThis.fetch=async url=>{const value=String(url);if(value.includes('/auth/v1/user'))return new Response(JSON.stringify({id:'student-ai',app_metadata:{role:'student'}}));if(value.includes('/rest/v1/teaching_courses')||value.includes('/rest/v1/personal_courses'))return new Response('[]');provider++;return new Response('{}');};const res=response();await handler(request({...body,courseId:'11111111-1111-4111-8111-111111111111'}),res);assert.equal(res.statusCode,404);assert.equal(res.data.error,'course_not_found');assert.equal(provider,0);}));
test('teacher lesson generation validates JSON and never exposes provider credentials',()=>scenario(async()=>{const calls=[],lesson={id:'l1',title:'边界',objectives:['理解空输入','识别单元素边界'],misconceptions:['空输入等于不需要测试。正确做法是把空输入当作合法但无元素的输入。'],slides:fixtureSlides(),body:'检查空数组和单元素。',scene:'compare',sceneItems:['空数组','单元素'],questions:[{id:'q1',prompt:'哪个测试覆盖空输入？',options:['[]','[1]'],correctIndex:0,explanation:'空数组验证没有元素的情况。'}]};globalThis.fetch=async(url,options)=>{calls.push({url,options});return new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'teacher-1',app_metadata:{role:'teacher'}}:{choices:[{message:{content:JSON.stringify(lesson)}}]}));};const res=response();await handler(request(body),res);assert.equal(res.statusCode,200);assert.deepEqual(res.data.lesson,lesson);assert.equal(calls.length,2);assert.equal(JSON.parse(calls[1].options.body).thinking.type,'disabled');assert(!JSON.stringify(res.data).includes('test-private-key'));}));
test('provider rate limit remains explicit and invalid answers cannot be accepted',()=>scenario(async()=>{for(const [status,content,expected]of [[429,{},'provider_rate_limited'],[200,{choices:[{message:{content:'{"id":"bad"}'}}]},'invalid_ai_result']]){globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'teacher-'+status,app_metadata:{role:'teacher'}}:content),{status:String(url).includes('/auth/v1/user')?200:status});const res=response();await handler(request(body),res);assert.equal(res.data.error,expected);}}));
test('official copies have teaching content and do not mutate original definitions',()=>{const a=officialCourseCopy('delivery-basics','en'),b=officialCourseCopy('delivery-basics','zh-CN');assert.equal(a.lessons.length,5);assert(a.lessons.every(l=>l.body.length>100&&l.sceneItems.length>=2));assert.notEqual(a.title,b.title);a.lessons[0].title='changed';assert.notEqual(officialCourseCopy('delivery-basics','en').lessons[0].title,'changed');});
test('scene templates escape author and model text instead of executing it',()=>{const html=sceneHTML({title:'<script>',scene:'flow',sceneItems:['<img src=x>','two']});assert(!html.includes('<img'));assert(html.includes('&lt;img'));});
test('scene templates wrap long labels instead of dropping the rest of the word',()=>{const html=sceneHTML({title:'DApps',scene:'flow',sceneItems:['DApps Definition','Key Characteristics','Traditional Apps','Smart Contracts','Blockchain Integration']});for(const word of ['DApps','Definition','Characteristics','Traditional','Contracts','Blockchain','Integration'])assert(html.includes(word),word+' should be visible');});

test('provider timeouts are not mislabeled as database failures',()=>scenario(async()=>{
 globalThis.fetch=async url=>{if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'timeout-teacher',app_metadata:{role:'teacher'}}));throw new DOMException('timed out','TimeoutError');};
 const res=response();await handler(request(body),res);assert.equal(res.statusCode,502);assert.equal(res.data.error,'provider_timeout');
}));

test('overloaded free model falls back only to the same-provider free model',()=>scenario(async()=>{
 const models=[],lesson={id:'lesson-test',title:'区块链',objectives:['解释记录如何连接','说明节点如何验证'],misconceptions:['区块链记录可以随意覆盖。正确做法是每个区块从前一区块的哈希继续连接。'],slides:fixtureSlides(),body:'区块链将记录按顺序连接，节点依据约定验证记录。',scene:'flow',sceneItems:['记录','验证'],questions:[{id:'q1',prompt:'区块链记录如何组织？',options:['按约定连接','随意覆盖'],correctIndex:0,explanation:'记录按顺序连接。'}]};
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
 {heading:'取舍',concept:'透明性与性能的权衡',bullets:['透明可验证','速度相对较慢'],script:['链上执行让结果可验证。','代价是确认速度和计算成本更高。'],notes:['取舍要结合具体场景判断。'],art:{scene:'balance',items:['透明可信','性能成本']}},
 {heading:'未确认的交易',concept:'签名不等于确认',bullets:['签名只是授权','确认取决于网络规则'],script:['小明签名之后，交易仍可能因余额不足而失败。'],art:{scene:'decision',items:['提交交易','检查余额','确认结果']}},
 {heading:'检查最终状态',concept:'以确认后的记录为依据',bullets:['核对交易状态','不要重复转账'],script:['小明等待交易确认，再核对账本上的金额变化。'],art:{scene:'flow',items:['查询交易','核对状态','确认结果']}}
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
 const bad=JSON.parse(JSON.stringify(slideLesson));bad.slides[0].art={scene:'script',items:['甲','乙']};
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
 assert.equal(calls[1].model,'glm-4-flash-250414');
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
 assert.deepEqual(arts.slice(0,3).map(a=>a.scene),['database','phone','conversation']);
 for(const art of arts)for(const item of art.items)assert.ok(sceneArt(art.scene,art.items).includes(item),item+' should be visible');
}));

test('scene capacity mismatch changes layout without clipping labels or losing teaching content',()=>scenario(async()=>{
 const input=structuredClone(slideLesson);input.slides[0].art={scene:'document',items:['甲','乙','丙','丁']};let calls=0;
 globalThis.fetch=async url=>{if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'capacity-teacher',app_metadata:{role:'teacher'}}));calls++;return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(input)}}]}));};
 const res=response();await handler(request(body),res);assert.equal(res.statusCode,200);assert.equal(calls,1);
 assert.deepEqual(res.data.lesson.slides[0].art.items,input.slides[0].art.items);assert.notEqual(res.data.lesson.slides[0].art.scene,'document');
 assert.deepEqual(res.data.lesson.slides[0].script,input.slides[0].script);
 const {itemsFitScene}=await import('../scripts/teaching-scenes.mjs');
 assert.ok(itemsFitScene(res.data.lesson.slides[0].art.scene,4));
}));

test('diagrams with too many or missing labels still fail instead of silently losing or inventing labels',async()=>{
 const {fitSceneToLabels,canonicalAIResult,fullLessonProblems}=await import('../scripts/course-ai-shape.mjs');
 for(const items of [['Only one'],['1','2','3','4','5','6']]){
  const art={scene:'compare',items};assert.equal(fitSceneToLabels(art),art);
  const lesson=structuredClone(slideLesson);lesson.slides[0].art=art;assert.ok(fullLessonProblems(canonicalAIResult(lesson,'lesson')).length>0);
 }
});

test('personal course format failures use the same backup repair after ownership verification',()=>scenario(async()=>{
 const models=[],id='11111111-1111-4111-8111-111111111111';
 const bad=structuredClone(slideLesson);delete bad.slides[0].script;
 globalThis.fetch=async(url,options)=>{
  const target=String(url);
  if(target.includes('/auth/v1/user'))return new Response(JSON.stringify({id:'learner-format-test',app_metadata:{role:'student'}}));
  if(target.includes('/rest/v1/teaching_courses'))return new Response('[]');
  if(target.includes('/rest/v1/personal_courses'))return new Response(JSON.stringify([{id,owner_id:'learner-format-test'}]));
  models.push(JSON.parse(options.body).model);return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(models.length===1?bad:slideLesson)}}]}));
 };
 const res=response();await handler(request({...body,courseId:id}),res);assert.equal(res.statusCode,200);assert.equal(res.data.fallbackUsed,true);
 assert.deepEqual(models,['glm-4.7-flash','glm-4-flash-250414']);assert.ok(res.data.lesson.slides.every(s=>s.script.length));
}));

test('generated lessons must declare objectives and per-slide narration; optional extras degrade safely',()=>scenario(async()=>{
 for(const strip of [l=>delete l.objectives,l=>delete l.slides[0].concept,l=>delete l.slides[0].script]){
  const bad=JSON.parse(JSON.stringify(slideLesson));strip(bad);
  globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'required-teacher',app_metadata:{role:'teacher'}}:{choices:[{message:{content:JSON.stringify(bad)}}]}));
  const res=response();await handler(request(body),res);assert.equal(res.statusCode,502);assert.equal(res.data.error,'invalid_ai_result');
 }
 const withoutExtras=JSON.parse(JSON.stringify(slideLesson));delete withoutExtras.misconceptions;
 globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'optional-teacher',app_metadata:{role:'teacher'}}:{choices:[{message:{content:JSON.stringify(withoutExtras)}}]}));
 const res=response();await handler(request(body),res);
 assert.equal(res.statusCode,200);assert.equal(res.data.lesson.misconceptions,undefined);assert.equal(res.data.lesson.slides.length,5);
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
 const models=[],lesson={id:'lesson-timeout',title:'超时回退',objectives:['说明超时后的回退','识别备用模型的限制'],misconceptions:['超时应当直接报错。正确做法是保留草稿并切换同一提供商的快速备用模型重试。'],slides:fixtureSlides(),body:'主模型超时后应切换到快速备用模型。',scene:'flow',sceneItems:['主模型超时','切换备用'],questions:[{id:'q1',prompt:'超时后做什么？',options:['切换备用模型','直接报错'],correctIndex:0,explanation:'备用模型更稳定。'}]};
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

test('outlines that repeat one lesson title are deduplicated instead of rejected',()=>scenario(async()=>{
 const lesson={id:'lesson-1',title:'What are DApps?',objectives:['解释 DApp 的组成','区分 DApp 与普通网页'],body:'大纲摘要。',scene:'flow',sceneItems:['定义','合约'],questions:[]};
 const course={title:'DApp 深度解析',description:'面向新生',language:'zh-CN',lessons:[lesson,{...lesson,id:'lesson-2'},{...lesson,id:'lesson-3'}]};
 globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'dup-teacher',app_metadata:{role:'teacher'}}:{choices:[{message:{content:JSON.stringify(course)}}]}));
 const res=response();await handler(request({...body,action:'outline'}),res);
 assert.equal(res.statusCode,200);
 const titles=res.data.course.lessons.map(l=>l.title);
 assert.deepEqual(titles,['What are DApps?','What are DApps? (2)','What are DApps? (3)']);
 assert.equal(new Set(titles.map(t=>t.toLowerCase())).size,titles.length);
 assert.doesNotThrow(()=>validateCourse(res.data.course));
}));

test('slow fallback still leaves a repair window after the old 55 second deadline',()=>scenario(async()=>{
 const realNow=Date.now;let elapsed=0,calls=0;
 Date.now=()=>realNow()+elapsed;
 const bad=structuredClone(slideLesson);bad.slides[0].art.scene='invalid';
 globalThis.fetch=async(url)=>{
  if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'slow-fallback-teacher',app_metadata:{role:'teacher'}}));
  calls++;
  if(calls===1){elapsed+=14000;throw new DOMException('timeout','TimeoutError');}
  elapsed+=calls===2?45000:15000;
  return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(calls===2?bad:slideLesson)}}]}));
 };
 try{const res=response();await handler(request(body),res);assert.equal(res.statusCode,200);assert.equal(calls,3);assert.equal(res.data.fallbackUsed,true);assert.deepEqual(res.data.lesson.slides,slideLesson.slides);}finally{Date.now=realNow;}
}));

test('complete English explanations use the same bounds as course storage',()=>scenario(async()=>{
 const lesson=structuredClone(slideLesson);
 lesson.objectives[0]='Explain why verification is needed before accepting a transaction into the shared ledger of a network.';
 lesson.misconceptions=['A digital signature means the payment is already confirmed. In fact, signing authorizes a transaction; nodes must still validate it, and confirmation depends on the network rules.'];
 lesson.slides[0].script=['Alice checks the recipient and the amount before signing. Signing authorizes the transaction, but the network must still validate it before the shared ledger can treat it as confirmed.'];
 globalThis.fetch=async url=>new Response(JSON.stringify(String(url).includes('/auth/v1/user')?{id:'english-bounds-teacher',app_metadata:{role:'teacher'}}:{choices:[{message:{content:JSON.stringify(lesson)}}]}));
 const res=response();await handler(request(body),res);assert.equal(res.statusCode,200);
 const stored=validateCourse({title:'Blockchain',description:'',language:'en',lessons:[res.data.lesson]},true);
 assert.deepEqual(stored.lessons[0].misconceptions,lesson.misconceptions);
 assert.deepEqual(stored.lessons[0].slides[0].script,lesson.slides[0].script);
}));

test('JSON parse failures receive the repair attempt rather than failing immediately',()=>scenario(async()=>{
 let calls=0;
 globalThis.fetch=async url=>{
  if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'json-repair-teacher',app_metadata:{role:'teacher'}}));
  return new Response(JSON.stringify({choices:[{message:{content:++calls===1?'```json\n{"slides":[':JSON.stringify(slideLesson)}}]}));
 };
 const res=response();await handler(request(body),res);assert.equal(res.statusCode,200);assert.equal(calls,2);
}));

test('representation differences are normalized without inventing missing course content',async()=>{
 const {canonicalAIResult,fullLessonProblems}=await import('../scripts/course-ai-shape.mjs');
 const lesson=structuredClone(slideLesson);delete lesson.id;delete lesson.questions[0].id;
 lesson.slides[0].script=lesson.slides[0].script.join(' ');lesson.slides[0].notes=[];
 const fixed=canonicalAIResult({lesson},'lesson','original-lesson');
 assert.equal(fixed.id,'original-lesson');assert.equal(fixed.questions[0].id,'q-1');assert.deepEqual(fullLessonProblems(fixed),[]);
 const missing=structuredClone(fixed);delete missing.slides[0].script;
 assert.ok(fullLessonProblems(missing).length>0);
 const excess=structuredClone(fixed);excess.slides=Array(9).fill(excess.slides[0]);excess.body='Legacy fallback must not hide invalid slide counts';excess.scene='flow';excess.sceneItems=['A','B'];
 assert.ok(fullLessonProblems(excess).some(p=>p.includes('3-8')));
});

test('unknown scene names normalize to a valid template instead of failing the outline',async()=>{
 const {canonicalAIResult,outlineProblems}=await import('../scripts/course-ai-shape.mjs');
 const outline={title:'Web 前端',description:'入门',language:'zh-CN',lessons:[{id:'lesson-1',title:'浏览器渲染',objectives:['说明渲染流程','解释重排影响'],body:'浏览器解析 HTML 与 CSS，构建页面并绘制。',scene:'tool',sceneItems:['HTML','CSS','页面'],questions:[]}]};
 const fixed=canonicalAIResult(outline,'outline');
 assert.notEqual(fixed.lessons[0].scene,'tool');
 assert.deepEqual(outlineProblems(fixed),[]);
});

test('outline repair keeps the outline shape and never asks for slides',async()=>{
 const {repairMessages}=await import('../scripts/course-ai-prompts.mjs');
 const message=repairMessages({action:'outline',language:'zh-CN',topic:'Web 前端',requirements:'',instruction:'',current:''},'{}',['bad']).at(-1).content;
 assert.match(message,/Do not add a slides array/);
 assert.doesNotMatch(message,/expand the outline into 4-8/);
});


test('a body-only legacy lesson is repaired into full courseware, never accepted as a completed lesson',()=>scenario(async()=>{
 const old={...slideLesson,body:'模拟用户转账，展示交易广播、验证和确认。',scene:'flow',sceneItems:['钱包','广播','验证']};delete old.slides;
 let calls=0;
 globalThis.fetch=async(url,options)=>{
  if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'legacy-repair-teacher',app_metadata:{role:'teacher'}}));
  calls++;if(calls===2)assert.match(JSON.parse(options.body).messages.at(-1).content,/4-8 complete/);
  return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(calls===1?old:slideLesson)}}]}));
 };
 const res=response();await handler(request(body),res);assert.equal(res.statusCode,200);assert.equal(calls,2);assert.equal(res.data.lesson.slides.length,5);
}));

test('fallback model uses the same complete-courseware gate for every later lesson',()=>scenario(async()=>{
 for(const number of [2,3,4]){
  let calls=0;const old={...slideLesson,id:'lesson-'+number,body:'这一讲只是目录摘要。',scene:'flow',sceneItems:['开始','结束']};delete old.slides;
  globalThis.fetch=async url=>{
   if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'later-lesson-teacher-'+number,app_metadata:{role:'teacher'}}));
   if(++calls===1)return new Response('{}',{status:429});
   return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(old)}}]}));
  };
  const res=response();await handler(request({...body,lesson:old}),res);assert.equal(res.statusCode,502);assert.equal(res.data.error,'invalid_ai_result');assert.equal(calls,3);
 }
}));

test('lesson prompts separate the requested lesson from its old outline representation',async()=>{
 const {providerMessages}=await import('../scripts/course-ai-prompts.mjs');
 const messages=providerMessages({action:'lesson',language:'zh-CN',topic:'区块链',requirements:'零基础',instruction:'',current:JSON.stringify({id:'lesson-2',title:'数据如何流动',body:'用转账举例',scene:'flow',sceneItems:['钱包','节点']})});
 const input=JSON.parse(messages[1].content).currentLesson;
 assert.equal(input.title,'数据如何流动');assert.equal(input.outline,'用转账举例');assert.equal(input.body,undefined);assert.equal(input.scene,undefined);
 assert.match(messages[0].content,/slides array is mandatory/);
});

test('repeated scenes are diversified deterministically without changing labels',async()=>{
 const {diversifyLessonScenes}=await import('../scripts/course-ai-shape.mjs');
 const repeated={...slideLesson,slides:Array.from({length:5},(_,i)=>({heading:'图 '+(i+1),concept:'共同点',bullets:['检查交集'],script:['这一页讲解共同点和差异。'],art:{scene:'venn',items:['甲','乙','丙']}}))};
 const out=diversifyLessonScenes(repeated);
 const scenes=out.slides.map(s=>s.art.scene);
 assert.ok(scenes.filter(s=>s==='venn').length<=2,'a long deck may repeat a scene at most twice');
 assert.ok(new Set(scenes).size>=3,'a long deck keeps at least three distinct scenes');
 for(const slide of out.slides){assert.ok(SCENE_IDS.includes(slide.art.scene));assert.deepEqual(slide.art.items,['甲','乙','丙']);}
 const short=diversifyLessonScenes({...repeated,slides:repeated.slides.slice(0,4)});
 assert.equal(new Set(short.slides.map(s=>s.art.scene)).size,4,'a four-slide deck must not repeat a scene');
 const varied={...slideLesson};
 assert.deepEqual(diversifyLessonScenes(varied).slides,varied.slides,'an already varied deck is left unchanged');
});

test('storyboard production plans a concrete case first and preserves animated scenes through its response',()=>scenario(async()=>{
 const brief={audience:'Beginners',goal:'Trace a transfer',case:'Alice sends five tokens to Bob',steps:['Sign','Broadcast','Validate','Confirm'].map(heading=>({heading,purpose:'Show what changes',layout:'process'}))};
 const story={layout:'process',context:'Alice sends five tokens',actors:[{kind:'phone',label:'Alice wallet'},{kind:'network',label:'Peer nodes'}],events:[{from:0,to:1,action:'Sign and broadcast',result:'Peers receive the signed request',status:'normal'},{from:1,to:0,action:'Validate the request',result:'Wallet shows a pending transaction',status:'success'}],takeaway:'The private key stays in the wallet'};
 const lesson={id:'story-test',title:'Wallet transfer',objectives:['Explain signing','Trace validation'],misconceptions:['A signature alone guarantees a valid transfer. It does not: other transaction rules must also pass.'],slides:fixtureSlides().slice(0,4).map(s=>({...s,art:{...s.art,story}})),questions:[{id:'q1',prompt:'What is shared?',options:['Signature','Private key'],correctIndex:0,explanation:'The private key stays local.'}]};
 const requests=[];globalThis.fetch=async(url,options)=>{if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'story-teacher',app_metadata:{role:'teacher'}}));const b=JSON.parse(options.body);requests.push(b);return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(requests.length===1?brief:requests.length===2?lesson:{pass:true,issues:[]})}}]}));};
 const res=response();await handler(request({...body,production:'storyboard-v1'}),res);assert.equal(res.statusCode,200);assert.equal(requests.length,3);assert.match(requests[0].messages[0].content,/plan one self-study lesson/);assert.deepEqual(JSON.parse(requests[1].messages[1].content).teachingBrief,brief);assert.equal(res.data.production,'storyboard-v1');assert.deepEqual(res.data.lesson.slides[0].art.story,story);assert.doesNotThrow(()=>validateCourse({title:'Course',description:'',language:'en',lessons:[res.data.lesson]}));
}));

test('content review repairs the flagged slide and stays advisory when doubts remain',()=>scenario(async()=>{
 const brief={audience:'Beginners',goal:'Observe a state change',case:'Alice sends a signed request',steps:['Sign','Send','Validate','Confirm'].map(heading=>({heading,purpose:'Observe this change',layout:'process'}))};
 const story={layout:'process',context:'Alice submits a request',actors:[{kind:'phone',label:'Wallet'},{kind:'network',label:'Peer'}],events:[{from:0,to:1,action:'Submit request',result:'Peer receives it',status:'normal'},{from:1,to:0,action:'Report status',result:'Wallet shows pending',status:'normal'}],takeaway:'Pending is not finalized'};
 const lesson={id:'quality-test',title:'Transfer',objectives:['Trace signing','Distinguish finality'],misconceptions:['Pending does not mean finalized.'],slides:fixtureSlides().slice(0,4).map(s=>({...s,art:{...s.art,story}})),questions:[{id:'q1',prompt:'Is pending finalized?',options:['Yes','No'],correctIndex:1,explanation:'These states differ.'}]};
 for(const passes of [true,false]){
  let calls=0;const fixed={...lesson.slides[1],script:['The request may propagate to peers; delivery is not universal.']};
  globalThis.fetch=async(url)=>{if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'quality-'+passes,app_metadata:{role:'teacher'}}));calls++;const content=calls===1?brief:calls===2?lesson:calls===3?{pass:false,issues:[{slide:1,problem:'Avoid a universal propagation claim.'}]}:calls===4?{corrections:[{index:1,slide:fixed}]}:passes?{pass:true,issues:[]}:{pass:false,issues:[{slide:1,problem:'The explanation still overclaims.'}]};return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(content)}}]}));};
  const res=response();await handler(request({...body,production:'storyboard-v1'}),res);assert.equal(calls,5);
  assert.equal(res.statusCode,200);
  assert.deepEqual(res.data.lesson.slides[1].script,fixed.script);
  assert.deepEqual(res.data.lesson.slides[0].script,lesson.slides[0].script);
  assert.equal(res.data.qualityReview.pass,passes);
  if(!passes)assert.match(res.data.qualityReview.issues[0].problem,/overclaims/);
 }
}));

test('a malformed teaching plan falls back to a deterministic brief instead of failing',()=>scenario(async()=>{
 const story={layout:'process',context:'Alice sends five tokens',actors:[{kind:'phone',label:'Alice wallet'},{kind:'network',label:'Peer nodes'}],events:[{from:0,to:1,action:'Broadcast signed transfer',result:'Peers receive the request',status:'normal'},{from:1,to:0,action:'Report validation result',result:'Wallet shows pending confirmation',status:'success'}],takeaway:'The private key stays in the wallet'};
 const lesson={id:'plan-fallback',title:'Wallet transfer',objectives:['Explain signing','Trace validation'],misconceptions:['A signature alone does not confirm a transfer.'],slides:fixtureSlides().slice(0,4).map(s=>({...s,art:{...s.art,story}})),questions:[{id:'q1',prompt:'What stays in the wallet?',options:['Private key','Signature'],correctIndex:0,explanation:'The private key stays local.'}]};
 let planning=0;
 globalThis.fetch=async(url,options)=>{
  if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'plan-fallback-teacher',app_metadata:{role:'teacher'}}));
  const system=JSON.parse(options.body).messages[0].content;
  if(system.includes('plan one self-study lesson')){planning++;return new Response(JSON.stringify({choices:[{message:{content:'{"audience":"Only"}'}}]}));}
  if(system.includes('Review a self-study lesson'))return new Response(JSON.stringify({choices:[{message:{content:'{"pass":true,"issues":[]}'}}]}));
  return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(lesson)}}]}));
 };
 const res=response();await handler(request({...body,production:'storyboard-v1'}),res);
 assert.equal(res.statusCode,200);
 assert.equal(planning,2);
 assert.equal(res.data.teachingBrief.steps.length,4);
 assert.equal(new Set(res.data.teachingBrief.steps.map(s=>s.heading)).size,4);
 assert.equal(res.data.lesson.slides.length,4);
}));

test('invalid storyboards degrade to template art without failing the lesson',()=>scenario(async()=>{
 const brief={audience:'Beginners',goal:'Trace a transfer',case:'Alice sends five tokens',steps:['Sign','Broadcast','Validate','Confirm'].map(heading=>({heading,purpose:'Show what changes',layout:'process'}))};
 const story={layout:'process',context:'Alice sends five tokens',actors:[{kind:'phone',label:'Alice wallet'},{kind:'network',label:'Peer nodes'}],events:[{from:0,to:1,action:'Broadcast signed transfer',result:'Peers receive the request',status:'normal'},{from:1,to:0,action:'Report validation result',result:'Wallet shows pending confirmation',status:'success'}],takeaway:'The private key stays in the wallet'};
 const bad={...story,events:[{from:0,to:9,action:'Broadcast signed transfer',result:'Peers receive the request',status:'normal'},{from:1,to:0,action:'Report validation result',result:'Wallet shows pending confirmation',status:'success'}]};
 const lesson={id:'story-fallback',title:'Wallet transfer',objectives:['Explain signing','Trace validation'],misconceptions:['A signature alone does not confirm a transfer.'],slides:fixtureSlides().slice(0,4).map((s,i)=>({...s,art:{...s.art,story:i===0?bad:story}})),questions:[{id:'q1',prompt:'What stays in the wallet?',options:['Private key','Signature'],correctIndex:0,explanation:'The private key stays local.'}]};
 let calls=0;
 globalThis.fetch=async(url,options)=>{
  if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'story-fallback-teacher',app_metadata:{role:'teacher'}}));
  calls++;const system=JSON.parse(options.body).messages[0].content;
  if(system.includes('plan one self-study lesson'))return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(brief)}}]}));
  if(system.includes('Review a self-study lesson'))return new Response(JSON.stringify({choices:[{message:{content:'{"pass":true,"issues":[]}'}}]}));
  return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(lesson)}}]}));
 };
 const res=response();await handler(request({...body,production:'storyboard-v1'}),res);
 assert.equal(res.statusCode,200);
 assert.equal(res.data.lesson.slides[0].art.story,undefined);
 assert.deepEqual(res.data.lesson.slides[0].art.items,fixtureSlides()[0].art.items);
 assert.deepEqual(res.data.lesson.slides[1].art.story,story);
 assert.equal(calls,4);
}));

test('an unavailable review does not discard a complete lesson',()=>scenario(async()=>{
 const brief={audience:'Beginners',goal:'Trace a transfer',case:'Alice sends five tokens',steps:['Sign','Broadcast','Validate','Confirm'].map(heading=>({heading,purpose:'Show what changes',layout:'process'}))};
 const story={layout:'process',context:'Alice sends five tokens',actors:[{kind:'phone',label:'Alice wallet'},{kind:'network',label:'Peer nodes'}],events:[{from:0,to:1,action:'Broadcast signed transfer',result:'Peers receive the request',status:'normal'},{from:1,to:0,action:'Report validation result',result:'Wallet shows pending confirmation',status:'success'}],takeaway:'The private key stays in the wallet'};
 const lesson={id:'review-fallback',title:'Wallet transfer',objectives:['Explain signing','Trace validation'],misconceptions:['A signature alone does not confirm a transfer.'],slides:fixtureSlides().slice(0,4).map(s=>({...s,art:{...s.art,story}})),questions:[{id:'q1',prompt:'What stays in the wallet?',options:['Private key','Signature'],correctIndex:0,explanation:'The private key stays local.'}]};
 globalThis.fetch=async(url,options)=>{
  if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'review-fallback-teacher',app_metadata:{role:'teacher'}}));
  const system=JSON.parse(options.body).messages[0].content;
  if(system.includes('plan one self-study lesson'))return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(brief)}}]}));
  if(system.includes('Review a self-study lesson'))return new Response(JSON.stringify({choices:[{message:{content:'not json'}}]}));
  return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(lesson)}}]}));
 };
 const res=response();await handler(request({...body,production:'storyboard-v1'}),res);
 assert.equal(res.statusCode,200);
 assert.equal(res.data.qualityReview,undefined);
 assert.equal(res.data.lesson.slides.length,4);
}));

test('staged endpoint authenticates once and returns reviewed per-page material',()=>scenario(async()=>{
 const brief={audience:'Beginners',goal:'Understand boundaries',case:'Test an empty array',steps:[0,1,2,3].map(i=>({heading:'Step '+i,purpose:'Explain '+i,layout:'process'}))};
 const lesson={id:'staged-lesson',title:'Boundary tests',objectives:['Explain empty input','Test one element'],misconceptions:['Empty input cannot be tested → it is a valid boundary case.'],questions:[0,1].map(i=>({id:'q'+i,prompt:'Which is empty?',options:['[]','[1]'],correctIndex:0,explanation:'There are no elements.'}))};
 const replies=[brief,...fixtureSlides().slice(0,4),lesson,{pass:true,issues:[]},{pass:true,issues:[]}];let provider=0;
 globalThis.fetch=async url=>{if(String(url).includes('/auth/v1/user'))return new Response(JSON.stringify({id:'staged-owner',app_metadata:{role:'student'}}));provider++;return new Response(JSON.stringify({choices:[{message:{content:JSON.stringify(replies.shift())}}]}));};
 const res=response();await handler(request({...body,production:'lesson-v2',lesson:{id:lesson.id,title:lesson.title}}),res);
 assert.equal(res.statusCode,200);assert.equal(res.data.production,'lesson-v2');assert.equal(res.data.lesson.id,lesson.id);assert.equal(res.data.qualityReview.pass,true);assert.equal(provider,8);
}));
