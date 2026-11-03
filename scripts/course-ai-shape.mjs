import {isScene,itemsFitScene} from './teaching-scenes.mjs';
export const text=(v,n)=>typeof v==='string'&&v.length<=n;
export const strings=(v,min,max,len)=>Array.isArray(v)&&v.length>=min&&v.length<=max&&v.every(x=>text(x,len)&&!!x.trim());
const stringList=(v,min,max,len)=>typeof v==='string'?(!!v.trim()&&v.length<=len?[v]:null):(strings(v,min,max,len)?v:null);
export const validQuestion=q=>text(q.id,80)&&text(q.prompt,1500)&&Array.isArray(q.options)&&q.options.length>=2&&q.options.length<=5&&q.options.every(x=>text(x,500))&&Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<q.options.length&&text(q.explanation,2500);
export const validArt=a=>a&&isScene(a.scene)&&a.scene!=='auto'&&Array.isArray(a.items)&&itemsFitScene(a.scene,a.items.length)&&a.items.every(x=>text(x,60));
export const validSlideFields=s=>text(s.concept,60)&&!!s.concept.trim()&&strings(s.script,1,3,120)&&(s.notes===undefined||!!stringList(s.notes,1,2,120));
export const validSlides=s=>Array.isArray(s)&&s.length>=3&&s.length<=8&&s.every(x=>text(x.heading,120)&&validSlideFields(x)&&Array.isArray(x.bullets)&&x.bullets.length>=1&&x.bullets.length<=5&&x.bullets.every(b=>text(b,200))&&validArt(x.art));
export const legacyContent=l=>text(l.body,18000)&&l.body.trim().length>0&&isScene(l.scene)&&l.scene!=='auto'&&Array.isArray(l.sceneItems)&&itemsFitScene(l.scene,l.sceneItems.length)&&l.sceneItems.every(x=>text(x,60));
export const lessonProblems=l=>{
 const problems=[];
 if(!l||typeof l!=='object')return ['lesson is not an object'];
 if(!text(l.id,80))problems.push('id must be a string of at most 80 characters');
 if(!text(l.title,180))problems.push('title must be a string of at most 180 characters');
 if(!strings(l.objectives,2,3,80))problems.push('objectives must be 2-3 non-empty strings of at most 80 characters');
 if(l.sourceNotes!==undefined&&!strings(l.sourceNotes,1,3,300))problems.push('sourceNotes must be 1-3 non-empty strings of at most 300 characters');
 if(!validSlides(l.slides)&&!legacyContent(l)){
  if(!Array.isArray(l.slides))problems.push('slides must be an array of 3-8 slide objects or legacy body content is required');
  else for(const [i,s] of l.slides.entries()){
   if(!text(s.heading,120))problems.push('slides['+i+'].heading must be at most 120 characters');
   if(!text(s.concept,60)||!s.concept.trim())problems.push('slides['+i+'].concept must be a non-empty string of at most 60 characters');
   if(!strings(s.script,1,3,120))problems.push('slides['+i+'].script must be 1-3 non-empty strings of at most 120 characters');
   if(s.notes!==undefined&&!stringList(s.notes,1,2,120))problems.push('slides['+i+'].notes must be 1-2 non-empty strings of at most 120 characters');
   if(!Array.isArray(s.bullets)||s.bullets.length<1||s.bullets.length>5||!s.bullets.every(b=>text(b,200)))problems.push('slides['+i+'].bullets must be 1-5 strings of at most 200 characters');
   if(!validArt(s.art))problems.push('slides['+i+'].art must use a known scene and respect its label capacity');
  }
 }
 if(!Array.isArray(l.questions)||l.questions.length>5)problems.push('questions must be an array of at most 5 items');
 else for(const [i,q] of l.questions.entries())if(!validQuestion(q))problems.push('questions['+i+'] is missing required fields or exceeds a bound');
 return problems;
};
export const validLesson=l=>lessonProblems(l).length===0;
export const fullLessonProblems=l=>{
 const problems=lessonProblems(l);
 if(!strings(l?.misconceptions,1,2,160))problems.push('misconceptions must be 1-2 non-empty strings of at most 160 characters');
 return problems;
};
export const validFullLesson=l=>fullLessonProblems(l).length===0;
export const outlineProblems=value=>{
 const problems=[];
 if(!value||typeof value!=='object')return ['course is not an object'];
 if(!text(value.title,180))problems.push('title must be a string of at most 180 characters');
 if(!text(value.description,3000))problems.push('description must be a string of at most 3000 characters');
 if(!Array.isArray(value.lessons)||value.lessons.length<1||value.lessons.length>5)return [...problems,'lessons must be an array of 1-5 lessons'];
 for(const [i,l] of value.lessons.entries())for(const problem of lessonProblems(l))problems.push('lessons['+i+'].'+problem);
 return problems;
};
export const validOutline=value=>outlineProblems(value).length===0;
const cleanQuestion=q=>({id:q.id,prompt:q.prompt,options:q.options,correctIndex:q.correctIndex,explanation:q.explanation});
export const normalizeLesson=v=>{
 const slides=validSlides(v.slides)?v.slides.map(s=>{const notes=stringList(s.notes??[],1,2,120);return {heading:s.heading,concept:s.concept,bullets:s.bullets,script:s.script,...(notes?.length?{notes}:{}),art:{scene:s.art.scene,items:s.art.items}};}):undefined;
 const lesson={id:v.id,title:v.title,objectives:v.objectives,...(v.misconceptions?{misconceptions:v.misconceptions}:{}),...(v.sourceNotes?{sourceNotes:v.sourceNotes}:{}),body:v.body??'',...(slides?{slides}:{}),scene:v.scene,sceneItems:v.sceneItems,questions:(v.questions||[]).map(cleanQuestion)};
 if(slides){if(!lesson.body.trim())lesson.body=slides.map(s=>[s.heading,...s.bullets].join('\n')).join('\n\n');if(!isScene(lesson.scene)||lesson.scene==='auto')lesson.scene=slides[0].art.scene;if(!Array.isArray(lesson.sceneItems)||!lesson.sceneItems.length)lesson.sceneItems=slides[0].art.items.slice(0,5);}
 return lesson;
};
export const normalizeOutline=(value,language)=>({title:value.title,description:value.description,language,lessons:value.lessons.map(normalizeLesson)});
