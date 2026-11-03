import {allLessons} from './all-lessons.js';
import {courseById} from './course-map.js';
import {lessonPlayerHTML,mountLessonPlayer,stopLessonPlayer} from './lesson-player.js';
const byId=new Map(allLessons.map(lesson=>[lesson.id,lesson]));
function outlineFor(lesson){
 const found=courseById(lesson.courseId);
 if(!found)return {themeId:undefined,lessons:[]};
 const lessons=[];
 for(const m of found.course.lessons){const def=m.id?byId.get(m.id):undefined;if(def)lessons.push({id:m.id,title:m.title,en:m.en,steps:def.steps.map(s=>({title:s.title,en:s.en}))});}
 return {themeId:found.theme.id,lessons};
}
const registry=new Map(allLessons.map(lesson=>[lesson.id,{lesson,html:lang=>lessonPlayerHTML(lesson,lang,outlineFor(lesson)),mount:(state,save,lang,index,onLanguageChange)=>mountLessonPlayer(lesson,state,save,lang,index,onLanguageChange,outlineFor(lesson))}]));
export function hasLesson(id){return registry.has(id);}
export function lessonHTMLFor(id,lang='zh-CN'){const found=registry.get(id);return found?found.html(lang):null;}
export function mountLessonFor(state,save,lang,id,index,onLanguageChange){const found=registry.get(id);if(found)found.mount(state,save,lang,index,onLanguageChange);}
export function stopAllLessons(){stopLessonPlayer();}
