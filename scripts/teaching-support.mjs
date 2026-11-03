import {CloudError} from './supabase-support.mjs';
import {isScene} from './teaching-scenes.mjs';
const fail=()=>{throw new CloudError('invalid_request',400);};
export function text(value,max,empty=false){if(typeof value!=='string'||value.length>max||(!empty&&!value.trim()))fail();return value.trim();}
export function validateCourse(value,publishing=false){
 const keys=(o,allowed)=>{if(!o||typeof o!=='object'||Array.isArray(o)||Object.keys(o).some(k=>!allowed.includes(k)))fail();};
 keys(value,['title','description','language','lessons']);
 const title=text(value.title,180),description=text(value.description,3000,true),language=text(value.language,10);
 if(!['en','zh-CN','zh-TW'].includes(language)||!Array.isArray(value.lessons)||value.lessons.length<1||value.lessons.length>10)fail();
 const ids=new Set();const id=(v,seen=ids)=>{text(v,80);if(!/^[\w-]+$/.test(v)||seen.has(v))fail();seen.add(v);return v;};
 const lessons=value.lessons.map(l=>{
  keys(l,['id','title','body','slides','scene','sceneItems','questions']);
  const raw=l.slides;
  if(raw!==undefined&&(!Array.isArray(raw)||raw.length<1||raw.length>20))fail();
  if(!isScene(l.scene)||!Array.isArray(l.sceneItems)||l.sceneItems.length<1||l.sceneItems.length>5||!Array.isArray(l.questions)||l.questions.length>5)fail();
  const slides=raw===undefined?undefined:raw.map(s=>{
   keys(s,['heading','bullets','art']);
   if(!Array.isArray(s.bullets)||s.bullets.length<1||s.bullets.length>6)fail();
   keys(s.art,['scene','items']);
   if(!isScene(s.art.scene)||!Array.isArray(s.art.items)||s.art.items.length<1||s.art.items.length>6)fail();
   return {heading:text(s.heading,120),bullets:s.bullets.map(b=>text(b,200)),art:{scene:s.art.scene,items:s.art.items.map(i=>text(i,80))}};
  });
  const questionIds=new Set();
  const lesson={id:id(l.id),title:text(l.title,180),body:text(l.body??'',18000,!publishing||!!slides),scene:l.scene,sceneItems:l.sceneItems.map(s=>text(s,60)),questions:l.questions.map(q=>{
   keys(q,['id','prompt','options','correctIndex','explanation']);
   if(!Array.isArray(q.options)||q.options.length<2||q.options.length>5||!Number.isInteger(q.correctIndex)||q.correctIndex<0||q.correctIndex>=q.options.length)fail();
   return {id:id(q.id,questionIds),prompt:text(q.prompt,1500),options:q.options.map(s=>text(s,500)),correctIndex:q.correctIndex,explanation:text(q.explanation,2500,true)};
  })};
  return slides===undefined?lesson:{...lesson,slides};
 });return {title,description,language,lessons};
}
export function studentSnapshot(snapshot){return {...snapshot,lessons:snapshot.lessons.map(l=>({...l,questions:l.questions.map(({id,prompt,options})=>({id,prompt,options}))}))};}
export function summarize(events,members=[]){
 const rows=new Map(members.map(m=>[m.student_id,{studentId:m.student_id,activeSeconds:0,completedLessons:[],attempts:0,correct:0,lastActivity:null}]));
 for(const e of events){let r=rows.get(e.student_id);if(!r){r={studentId:e.student_id,activeSeconds:0,completedLessons:[],attempts:0,correct:0,lastActivity:null};rows.set(e.student_id,r);}r.activeSeconds+=e.active_seconds;if(e.event_type==='complete'&&!r.completedLessons.includes(e.lesson_id))r.completedLessons.push(e.lesson_id);if(e.event_type==='quiz'){r.attempts++;if(e.correct)r.correct++;}if(!r.lastActivity||e.created_at>r.lastActivity)r.lastActivity=e.created_at;}
 return [...rows.values()].map(r=>({...r,accuracy:r.attempts?r.correct/r.attempts:null}));
}
