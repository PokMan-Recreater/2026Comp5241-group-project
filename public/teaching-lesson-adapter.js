import {storyboardArt} from './course-storyboard.js';
import {narrationScriptText} from './courseware-contract.js';
import {sceneArt} from './scene-render.js';

// Keep the same step, explanation, notes and playback contract as the 45 authored lessons.
export function teachingLessonForPlayer(lesson,{clips=[],language='zh-CN'}={}){
 const steps=lesson.slides.map(slide=>{
  const script=slide.script?.length?slide.script:slide.bullets;
  const notes=slide.notes?.length?slide.notes:slide.bullets;
  return {title:slide.heading,en:slide.heading,seconds:Math.max(12,script.join('').length/7),script,enScript:script,notes,enNotes:notes,conceptZh:slide.concept||slide.heading,conceptEn:slide.concept||slide.heading,
   art:(progress=1,lang=language)=>slide.art.story?storyboardArt(slide.art.story,progress,lang):sceneArt(slide.art.scene,slide.art.items,{title:slide.heading})};
 });
 const lang=language==='en'?'en':'zh-CN';
 const records=steps.map(step=>clips.find(c=>c.language===lang&&c.text===narrationScriptText(step)));
 const complete=records.every(Boolean);
 const manifest=records.map((clip,i)=>{if(!clip)return null;const lengths=steps[i].script.map(s=>s.length),total=lengths.reduce((n,x)=>n+x,0);let offset=0;return {...clip,src:clip.url,sentenceStarts:lengths.map(n=>{const start=clip.duration*offset/Math.max(total,1);offset+=n;return start;})};});
 return {id:lesson.id,title:lesson.title,titleEn:lesson.title,position:'',positionEn:'',section:lesson.title,sectionEn:lesson.title,sceneTitle:lesson.title,sceneTitleEn:lesson.title,audio:complete,audioManifest:{en:manifest,'zh-CN':manifest},steps};
}
export function lessonForSave(l){
 const slides=l.slides?.length?l.slides.map(s=>({heading:s.heading,...(s.concept?{concept:s.concept}:{}),bullets:s.bullets,...(s.script?.length?{script:s.script}:{}),...(s.notes?.length?{notes:s.notes}:{}),art:{scene:s.art?.scene,items:s.art?.items,...(s.art?.story?{story:s.art.story}:{})}})):undefined;
 return {id:l.id,title:l.title,...(l.objectives?.length?{objectives:l.objectives}:{}),...(l.misconceptions?.length?{misconceptions:l.misconceptions}:{}),...(l.sourceNotes?.length?{sourceNotes:l.sourceNotes}:{}),body:l.body??'',...(slides?{slides}:{}),scene:l.scene,sceneItems:l.sceneItems,questions:(l.questions||[]).map(q=>({id:q.id,prompt:q.prompt,options:q.options,correctIndex:q.correctIndex,explanation:q.explanation}))};
}
