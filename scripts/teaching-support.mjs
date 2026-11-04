import {validStoryboard} from '../public/course-storyboard.js';
import {CloudError} from './supabase-support.mjs';
import {isScene,itemsFitScene} from './teaching-scenes.mjs';
const fail=()=>{throw new CloudError('invalid_request',400);};
export function text(value,max,empty=false){if(typeof value!=='string'||value.length>max||(!empty&&!value.trim()))fail();return value.trim();}
export function validateCourse(value,publishing=false){
 const keys=(o,allowed)=>{if(!o||typeof o!=='object'||Array.isArray(o)||Object.keys(o).some(k=>!allowed.includes(k)))fail();};
 keys(value,['title','description','language','lessons']);
 const title=text(value.title,180),description=text(value.description,3000,true),language=text(value.language,10);
 if(!['en','zh-CN','zh-TW'].includes(language)||!Array.isArray(value.lessons)||value.lessons.length<1||value.lessons.length>10)fail();
 if(publishing&&value.lessons.some(l=>!Array.isArray(l.slides)||l.slides.length<1))throw new CloudError('incomplete_courseware',400);
 const ids=new Set();const id=(v,seen=ids)=>{text(v,80);if(!/^[\w-]+$/.test(v)||seen.has(v))fail();seen.add(v);return v;};
 const lessons=value.lessons.map(l=>{
  keys(l,['id','title','objectives','misconceptions','sourceNotes','body','slides','scene','sceneItems','questions']);
  const raw=l.slides;
  if(raw!==undefined&&(!Array.isArray(raw)||raw.length<1||raw.length>20))fail();
  if(!isScene(l.scene)||!Array.isArray(l.sceneItems)||l.sceneItems.length<1||l.sceneItems.length>5||!Array.isArray(l.questions)||l.questions.length>5)fail();
  const list=(v,min,max,len)=>{if(v===undefined)return undefined;if(!Array.isArray(v)||v.length<min||v.length>max)fail();return v.map(x=>text(x,len));};
  const objectives=list(l.objectives,1,5,120),misconceptions=list(l.misconceptions,1,5,300),sourceNotes=list(l.sourceNotes,1,5,400);
  const slides=raw===undefined?undefined:raw.map(s=>{
   keys(s,['heading','concept','bullets','script','notes','art']);
   if(!Array.isArray(s.bullets)||s.bullets.length<1||s.bullets.length>6)fail();
   const concept=s.concept===undefined?undefined:text(s.concept,120),script=list(s.script,1,5,300),notes=list(s.notes,1,5,200);
   keys(s.art,['scene','items','story']);
   if(s.art.story!==undefined&&!validStoryboard(s.art.story))fail();
   if(!isScene(s.art.scene)||!Array.isArray(s.art.items)||!itemsFitScene(s.art.scene,s.art.items.length))fail();
   return {heading:text(s.heading,120),...(concept?{concept}:{}),bullets:s.bullets.map(b=>text(b,200)),...(script?{script}:{}),...(notes?{notes}:{}),art:{scene:s.art.scene,items:s.art.items.map(i=>text(i,80)),...(s.art.story?{story:structuredClone(s.art.story)}:{})}};
  });
  const questionIds=new Set();
  const lesson={id:id(l.id),title:text(l.title,180,!publishing),...(objectives?{objectives}:{}),...(misconceptions?{misconceptions}:{}),...(sourceNotes?{sourceNotes}:{}),body:text(l.body??'',18000,!publishing||!!slides),scene:l.scene,sceneItems:l.sceneItems.map(s=>text(s,60)),questions:l.questions.map(q=>{
   keys(q,['id','prompt','options','correctIndex','explanation']);
   if(!Array.isArray(q.options)||q.options.length<2||q.options.length>5||!Number.isInteger(q.correctIndex)||q.correctIndex<0||q.correctIndex>=q.options.length)fail();
   return {id:id(q.id,questionIds),prompt:text(q.prompt,1500,!publishing),options:q.options.map(s=>text(s,500,!publishing)),correctIndex:q.correctIndex,explanation:text(q.explanation,2500,true)};
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
