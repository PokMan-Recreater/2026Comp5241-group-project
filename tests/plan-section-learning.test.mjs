import test from 'node:test';
import assert from 'node:assert/strict';
import {configureBackgroundAI} from '../public/background-ai.js';
import {createAcademy} from '../public/academy-ui.js';
import {validateCourse} from '../scripts/teaching-support.mjs';
const complete=()=>({title:'A lesson',body:'Explanation',scene:'flow',sceneItems:['Input','Output'],questions:[],slides:Array.from({length:4},(_,i)=>({heading:'Step '+i,concept:'Concept '+i,bullets:['Example'],script:['An explained example.'],art:{scene:'flow',items:['Input','Output']}}))});
function harness(){
 const storage=new Map(),listeners={};
 globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 globalThis.window={};globalThis.document={addEventListener:(k,fn)=>{(listeners[k]??=[]).push(fn);}};
 configureBackgroundAI('u-'+Math.random(),'zh-CN');
 const lessons=[{id:'s1',title:'First',body:'Outline 1'},{id:'s2',title:'Second',body:'Outline 2'}];
 const source={id:'source',title:'Topic',lessons},plan={id:'p',source:'ai',topic:'Topic',title:'My plan',weeklyMinutes:120,weeks:1,steps:lessons.map((l,index)=>({courseId:'source',lessonId:l.id,title:l.title,courseTitle:'Topic',index,minutes:10,week:1}))};
 const state={profile:{},progress:{},events:[],lang:'zh-CN',courses:[source]};
 const navigated=[],messages=[],calls=[];let record=null,fail=false,failSave=false,route=['plan','p'],gate=null,release;
 globalThis.fetch=async(path,options={})=>{
  const body=options.body?JSON.parse(options.body):null;calls.push({path,body});
  if(path==='/api/course-ai'&&gate)await gate;
  if(path==='/api/course-ai')return {ok:true,json:async()=>({lesson:fail?{body:'Incomplete'}:complete()})};
  if(!body)return {ok:!!record,json:async()=>record?{course:structuredClone(record)}:{error:'not_found'}};
  if(body.id&&failSave)return {ok:false,json:async()=>({error:'database_unavailable'})};
  record={id:'saved-course',revision:(record?.revision||0)+1,draft:validateCourse(body.course)};
  return {ok:true,json:async()=>({course:structuredClone(record)})};
 };
 const academy=createAcademy({state:()=>state,esc:String,ico:()=>'',courses:()=>[source],course:id=>id==='source'?source:null,user:()=>({id:'u'}),save:()=>{},render:()=>{},go:x=>navigated.push(x),toast:x=>messages.push(x),route:()=>route});
 state.academy.plans=[plan];
 const click=async lesson=>{
  const el={dataset:{ac:'learn-plan-section',plan:'p',lesson},disabled:false,isConnected:true,textContent:'Generate'};
  const event={target:{closest:()=>el},preventDefault(){}};
  for(const listener of listeners.click)listener(event);
  for(let i=0;i<30;i++)await new Promise(resolve=>setTimeout(resolve,0));
 };
 return {academy,plan,calls,navigated,messages,click,leave:()=>{route=['explore'];},pause:()=>{gate=new Promise(resolve=>{release=resolve;});},resume:()=>release(),setFail:v=>{fail=v;},setFailSave:v=>{failSave=v;},deleteRecord:()=>{record=null;}};
}
test('an outline offers generation instead of completion or a teacher studio',()=>{
 const h=harness(),html=h.academy.page('plan','p');assert.match(html,/生成并学习/);assert.doesNotMatch(html,/data-ac="create-course"|data-ac="complete-plan"/);
});
test('each section generates once and reuses the same saved personal course',async()=>{
 const h=harness();await h.click('s1');await h.click('s1');await h.click('s2');
 assert.equal(h.calls.filter(c=>c.path==='/api/course-ai').length,2);
 assert.equal(h.calls.filter(c=>c.body?.action==='save'&&!c.body.id).length,1);
 assert.deepEqual(h.navigated,['personal-course/saved-course/study-0','personal-course/saved-course/study-0','personal-course/saved-course/study-1']);
 assert.equal(h.plan.generatedLessons.s2.index,1);assert(h.messages.every(m=>m.includes('5 分钟')));
});
test('incomplete AI output keeps the plan and cannot enter learning',async()=>{
 const h=harness();h.setFail(true);await h.click('s1');assert.equal(h.navigated.length,0);assert.equal(h.plan.generatedLessons,undefined);assert.equal(h.messages.length,2);
 h.setFail(false);await h.click('s1');assert.equal(h.navigated.length,1);assert.equal(h.calls.filter(c=>c.body?.action==='save'&&!c.body.id).length,1);
});
test('a deleted bound course can be recreated without a stale content flag',async()=>{
 const h=harness();await h.click('s1');h.deleteRecord();await h.click('s2');assert.equal(h.plan.generatedLessons.s1,undefined);assert.equal(h.plan.generatedLessons.s2.index,1);
});

test('a failed server save retains the generated lesson and retries without another AI call',async()=>{
 const h=harness();h.setFailSave(true);await h.click('s1');assert.equal(h.navigated.length,0);assert(h.plan.pendingCourseware.s1);
 h.setFailSave(false);await h.click('s1');assert.equal(h.navigated.length,1);assert.equal(h.calls.filter(c=>c.path==='/api/course-ai').length,1);assert.equal(h.plan.pendingCourseware.s1,undefined);
});
test('double clicking cannot create duplicate courses or AI requests',async()=>{
 const h=harness();await Promise.all([h.click('s1'),h.click('s2')]);assert.equal(h.calls.filter(c=>c.path==='/api/course-ai').length,1);assert.equal(h.calls.filter(c=>c.body?.action==='save'&&!c.body.id).length,1);
});
test('catalog paths continue to link existing content directly',()=>{
 const h=harness();h.plan.source='catalog';const html=h.academy.page('plan','p');assert.doesNotMatch(html,/data-ac="learn-plan-section"/);assert.match(html,/#plan\/p\/s1/);
});

test('leaving the plan keeps generation running and never hijacks the new page',async()=>{
 const h=harness();h.pause();await h.click('s1');h.leave();h.resume();for(let i=0;i<30;i++)await new Promise(resolve=>setTimeout(resolve,0));
 assert.equal(h.plan.generatedLessons.s1.courseId,'saved-course');assert.deepEqual(h.navigated,[]);assert(h.messages.some(m=>m.includes('课件已保存')));
});
