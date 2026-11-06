import {validStoryboard,storyboardProblems} from '../public/course-storyboard.js';
import {hasCompleteCourseware,MIN_GENERATED_SLIDES,MAX_GENERATED_SLIDES} from '../public/courseware-contract.js';
import {selectScene} from '../public/teaching-scene-catalog.js';
import {isScene,itemsFitScene} from './teaching-scenes.mjs';
export const text=(v,n)=>typeof v==='string'&&v.length<=n;
export const strings=(v,min,max,len)=>Array.isArray(v)&&v.length>=min&&v.length<=max&&v.every(x=>text(x,len)&&!!x.trim());
const stringList=(v,min,max,len)=>typeof v==='string'?(!!v.trim()&&v.length<=len?[v]:null):(strings(v,min,max,len)?v:null);
export const validQuestion=q=>q&&typeof q==='object'&&text(q.id,80)&&text(q.prompt,1500)&&Array.isArray(q.options)&&q.options.length>=2&&q.options.length<=5&&q.options.every(x=>text(x,500))&&Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<q.options.length&&text(q.explanation,2500);
export const validArt=a=>a&&(a.story===undefined||validStoryboard(a.story))&&isScene(a.scene)&&a.scene!=='auto'&&Array.isArray(a.items)&&itemsFitScene(a.scene,a.items.length)&&a.items.every(x=>text(x,60));
export const validSlideFields=s=>text(s.concept,120)&&!!s.concept.trim()&&strings(s.script,1,5,300)&&(s.notes===undefined||!!stringList(s.notes,1,5,200));
export const validSlides=s=>Array.isArray(s)&&s.length>=3&&s.length<=8&&s.every(x=>x&&typeof x==='object'&&text(x.heading,120)&&validSlideFields(x)&&Array.isArray(x.bullets)&&x.bullets.length>=1&&x.bullets.length<=5&&x.bullets.every(b=>text(b,200))&&validArt(x.art));
export const legacyContent=l=>text(l.body,18000)&&l.body.trim().length>0&&isScene(l.scene)&&l.scene!=='auto'&&Array.isArray(l.sceneItems)&&itemsFitScene(l.scene,l.sceneItems.length)&&l.sceneItems.every(x=>text(x,60));
export const lessonProblems=l=>{
 const problems=[];
 if(!l||typeof l!=='object')return ['lesson is not an object'];
 if(!text(l.id,80))problems.push('id must be a string of at most 80 characters');
 if(!text(l.title,180))problems.push('title must be a string of at most 180 characters');
 if(!strings(l.objectives,2,3,120))problems.push('objectives must be 2-3 non-empty strings of at most 120 characters');
 if(l.sourceNotes!==undefined&&!strings(l.sourceNotes,1,3,300))problems.push('sourceNotes must be 1-3 non-empty strings of at most 300 characters');
 if(l.slides!==undefined?!validSlides(l.slides):!legacyContent(l)){
  if(!Array.isArray(l.slides))problems.push('slides must be an array of 3-8 slide objects or legacy body content is required');
  else {
   if(l.slides.length<3||l.slides.length>8)problems.push('slides must contain 3-8 slides');
   for(const [i,s] of l.slides.entries()){
   if(!s||typeof s!=='object'){problems.push('slides['+i+'] must be an object');continue;}
   if(!text(s.heading,120))problems.push('slides['+i+'].heading must be at most 120 characters');
   if(!text(s.concept,120)||!s.concept.trim())problems.push('slides['+i+'].concept must be a non-empty string of at most 120 characters');
   if(!strings(s.script,1,5,300))problems.push('slides['+i+'].script must be 1-5 non-empty strings of at most 300 characters');
   if(s.notes!==undefined&&!stringList(s.notes,1,5,200))problems.push('slides['+i+'].notes must be 1-5 non-empty strings of at most 200 characters');
   if(!Array.isArray(s.bullets)||s.bullets.length<1||s.bullets.length>5||!s.bullets.every(b=>text(b,200)))problems.push('slides['+i+'].bullets must be 1-5 strings of at most 200 characters');
   if(!validArt(s.art))problems.push('slides['+i+'].art must use a known scene and respect its label capacity');
   if(s.art?.story)for(const issue of storyboardProblems(s.art.story))problems.push('slides['+i+'].'+issue);
   }
  }
 }
 if(!Array.isArray(l.questions)||l.questions.length>5)problems.push('questions must be an array of at most 5 items');
 else for(const [i,q] of l.questions.entries())if(!validQuestion(q))problems.push('questions['+i+'] is missing required fields or exceeds a bound');
 return problems;
};
export const validLesson=l=>lessonProblems(l).length===0;
export const fullLessonProblems=l=>{
 const problems=lessonProblems(l);
 if(!hasCompleteCourseware(l))problems.push('slides are required: return 4-8 complete slides with heading, concept, bullets, narration script and art; body-only outlines are not completed lessons');
 if(Array.isArray(l?.slides)){const headings=l.slides.map(s=>String(s?.heading||'').trim().toLowerCase());if(new Set(headings).size!==headings.length)problems.push('each slide must have a distinct heading and teach a different step');}
 if(!strings(l?.misconceptions,1,2,300))problems.push('misconceptions must be 1-2 non-empty strings of at most 300 characters');
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
 const slides=validSlides(v.slides)?v.slides.map(s=>{const notes=stringList(s.notes??[],1,5,200);return {heading:s.heading,concept:s.concept,bullets:s.bullets,script:s.script,...(notes?.length?{notes}:{}),art:{scene:s.art.scene,items:s.art.items,...(s.art.story?{story:s.art.story}:{})}};}):undefined;
 const lesson={id:v.id,title:v.title,objectives:v.objectives,...(v.misconceptions?{misconceptions:v.misconceptions}:{}),...(v.sourceNotes?{sourceNotes:v.sourceNotes}:{}),body:v.body??'',...(slides?{slides}:{}),scene:v.scene,sceneItems:v.sceneItems,questions:(v.questions||[]).map(cleanQuestion)};
 if(slides){if(!lesson.body.trim())lesson.body=slides.map(s=>[s.heading,...s.bullets].join('\n')).join('\n\n');if(!isScene(lesson.scene)||lesson.scene==='auto')lesson.scene=slides[0].art.scene;if(!Array.isArray(lesson.sceneItems)||!lesson.sceneItems.length)lesson.sceneItems=slides[0].art.items.slice(0,5);}
 return lesson;
};
export const normalizeOutline=(value,language)=>({title:value.title,description:value.description,language,lessons:value.lessons.map(normalizeLesson)});

// The model tends to fall back on a few familiar templates even when told to
// vary them. After validation, rewrite repeated scenes deterministically so a
// deck never becomes a wall of identical diagrams. Item counts are preserved,
// so every replacement still satisfies the template's slot capacity.
const FALLBACK_SCENES=['hub','network','tree','flow','timeline','cycle','stairs','layers','chart','target','shield','iceberg','bridge','quadrant','decision','puzzle','funnel','pyramid','robot','conversation','phone','document','database','venn','compare','balance','chain'];
export function diversifyLessonScenes(lesson){
 if(!Array.isArray(lesson?.slides)||lesson.slides.length<3)return lesson;
 const maxRepeat=lesson.slides.length<=4?1:2;
 const counts=new Map();
 const slides=lesson.slides.map(slide=>{
  const art=slide?.art;
  if(!art||!isScene(art.scene)||art.scene==='auto')return slide;
  const items=Array.isArray(art.items)?art.items:[];
  const used=counts.get(art.scene)||0;
  if(used<maxRepeat){counts.set(art.scene,used+1);return slide;}
  const body=[slide.heading,slide.concept,...(slide.bullets||[]),...items].filter(Boolean).join(' ');
  const preferred=selectScene({title:slide.heading||'',body,sceneItems:items});
  const candidates=[preferred,...FALLBACK_SCENES].filter((id,index,all)=>all.indexOf(id)===index&&id!=='auto'&&itemsFitScene(id,items.length)&&(counts.get(id)||0)<maxRepeat);
  if(!candidates.length){counts.set(art.scene,used+1);return slide;}
  const next=candidates[0];
  counts.set(next,(counts.get(next)||0)+1);
  return {...slide,art:{...art,scene:next}};
 });
 return {...lesson,slides};
}

// Repair a layout mismatch by changing the composition, never by dropping
// labels, truncating teaching text or inventing missing labels. Larger or
// incomplete diagrams still go through model repair and full validation.
export function fitSceneToLabels(art,context={}){
 if(!art||!isScene(art.scene)||art.scene==='auto'||!Array.isArray(art.items))return art;
 if(itemsFitScene(art.scene,art.items.length))return art;
 if(art.items.length<2||art.items.length>5||!art.items.every(item=>text(item,60)&&!!item.trim()))return art;
 const preferred=selectScene({title:context.heading||context.title||'',body:[context.concept,...(context.bullets||[])].filter(Boolean).join(' '),sceneItems:art.items});
 const family=['compare','balance','venn','decision','tree'].includes(art.scene)?'hub':'flow';
 const scene=[preferred,family,'hub','flow'].find(id=>id!=='auto'&&isScene(id)&&itemsFitScene(id,art.items.length));
 return scene?{...art,scene}:art;
}

// Final acceptance after model repair has had its chance. Optional narration
// extras and the quiz are not gates: a complete, playable lesson is worth more
// than another hard failure. Missing slides or objectives still fail because
// they cannot be invented safely.
export function salvageProblems(lesson){
 if(!lesson||typeof lesson!=='object'||Array.isArray(lesson))return ['lesson is not an object'];
 const problems=[];
 if(!text(lesson.title,180)||!lesson.title.trim())problems.push('title is required');
 if(!strings(lesson.objectives,2,3,120))problems.push('objectives must be 2-3 non-empty strings of at most 120 characters');
 if(!Array.isArray(lesson.slides)||lesson.slides.length<MIN_GENERATED_SLIDES||lesson.slides.length>MAX_GENERATED_SLIDES||!validSlides(lesson.slides))problems.push('slides must contain 4-8 complete slides with valid art and narration');
 if(!Array.isArray(lesson.questions)||lesson.questions.length>5||!lesson.questions.every(validQuestion))problems.push('questions must be an array of at most 5 valid items');
 return problems;
}

// Deterministic downgrade for a lesson that is structurally close but not
// perfect: drop invalid stories so the slide falls back to its scene template,
// keep only valid quiz items, and trim optional fields. Teaching slides,
// scenes and labels are never dropped or invented here.
export function salvageLesson(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return value;
 const copy={...value};
 if(Array.isArray(copy.objectives))copy.objectives=copy.objectives.filter(o=>text(o,120)&&!!o.trim()).slice(0,3);
 if(Array.isArray(copy.misconceptions)){
  const list=copy.misconceptions.filter(m=>text(m,300)&&!!m.trim()).slice(0,2);
  if(list.length)copy.misconceptions=list;else delete copy.misconceptions;
 }
 copy.questions=Array.isArray(copy.questions)?copy.questions.filter(validQuestion).slice(0,5).map((q,i)=>({...q,id:q.id||'q-'+(i+1)})):[];
 if(Array.isArray(copy.slides)){
  const seen=new Map();
  copy.slides=copy.slides.slice(0,MAX_GENERATED_SLIDES).map(slide=>{
   if(!slide||typeof slide!=='object'||!slide.art)return slide;
   const art={...slide.art};
   if(art.story!==undefined&&!validStoryboard(art.story))delete art.story;
   return {...slide,art:fitSceneToLabels(art,slide)};
  }).map(slide=>{
   const key=String(slide?.heading??'').trim().toLowerCase(),count=(seen.get(key)||0)+1;seen.set(key,count);
   if(count===1)return slide;
   const suffix=' ('+count+')';
   return {...slide,heading:String(slide.heading??'').trim().slice(0,120-suffix.length)+suffix};
  });
 }
 return copy;
}

// Repeated titles are a common outline quirk. Renaming duplicates keeps the
// outline usable instead of rejecting the whole course.
export function dedupeLessonTitles(lessons){
 if(!Array.isArray(lessons))return lessons;
 const seen=new Set();
 return lessons.map(lesson=>{
  if(!lesson||typeof lesson!=='object')return lesson;
  const base=String(lesson.title??'').trim();
  if(!base)return lesson;
  let title=base,count=2;
  while(seen.has(title.toLowerCase())){
   const suffix=' ('+count+')';
   title=base.slice(0,180-suffix.length)+suffix;count++;
  }
  seen.add(title.toLowerCase());
  return title===lesson.title?lesson:{...lesson,title};
 });
}

// Normalize representation only. Never invent missing teaching content or answers.
export function canonicalAIResult(value,action,currentId){
 const candidate=action==='outline'?(value?.course??value):(value?.lesson??value);
 const canonicalLesson=(lesson,index)=>{
  if(!lesson||typeof lesson!=='object'||Array.isArray(lesson))return lesson;
  const copy={...lesson};
  if(Array.isArray(copy.misconceptions))copy.misconceptions=copy.misconceptions.map(m=>m&&typeof m==='object'&&!Array.isArray(m)&&Object.keys(m).every(k=>['misconception','correction'].includes(k))&&typeof m.misconception==='string'&&typeof m.correction==='string'&&m.misconception.trim()&&m.correction.trim()?m.misconception+' → '+m.correction:m);
  if(!copy.id)copy.id=action==='lesson'&&currentId?currentId:'lesson-'+(index+1);
  if(Array.isArray(copy.slides))copy.slides=copy.slides.map(slide=>{
   if(!slide||typeof slide!=='object')return slide;
   const s={...slide};
   for(const key of ['script','notes'])if(typeof s[key]==='string'&&s[key].trim())s[key]=[s[key]];
   if((typeof s.notes==='string'&&!s.notes.trim())||(Array.isArray(s.notes)&&s.notes.length===0))delete s.notes;
   if(s.art){s.art={...s.art,...(s.art.story?{story:structuredClone(s.art.story)}:{})};s.art.scene=({process:'flow','before-after':'compare'})[s.art.scene]||s.art.scene;if(s.art.story?.layout==='network')s.art.story.layout='process';s.art=fitSceneToLabels(s.art,s);}
   return s;
  });
  if(Array.isArray(copy.sceneItems)&&(!isScene(copy.scene)||copy.scene==='auto'))copy.scene=selectScene({title:copy.title||'',body:copy.body||'',sceneItems:copy.sceneItems});
  if(copy.scene&&Array.isArray(copy.sceneItems)){const art=fitSceneToLabels({scene:copy.scene,items:copy.sceneItems},copy);copy.scene=art.scene;}
  if(Array.isArray(copy.questions))copy.questions=copy.questions.map((q,i)=>q&&typeof q==='object'?{...q,id:q.id||'q-'+(i+1)}:q);
  return copy;
 };
 return action==='outline'&&candidate&&typeof candidate==='object'?{...candidate,lessons:Array.isArray(candidate.lessons)?candidate.lessons.map(canonicalLesson):candidate.lessons}:canonicalLesson(candidate,0);
}
export function parseAIContent(content){
 if(typeof content!=='string')throw Error('missing_json_content');
 return JSON.parse(content.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));
}
