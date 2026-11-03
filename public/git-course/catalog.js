// What Forma needs to know about the Git simulator without opening it:
// lesson titles for practice links (route "git/<lesson>") and whether the
// learner finished a lesson, read from the simulator's saved progress.
import {LESSONS,lessonById} from './course.js';

const STORE='forma.gitcourse.v1';
function progress(){
 try{return JSON.parse(globalThis.localStorage?.getItem(STORE)||'{}')?.progress||{};}catch{return {};}
}
/** Done when that lesson is finished; with no id, when any lesson is. */
export function gitLessonDone(id){
 const p=progress();
 return id?!!p[id]?.done:LESSONS.some(l=>p[l.id]?.done);
}
const tri=v=>({en:v.en,'zh-CN':v.zh,'zh-TW':v.zh});
/** A practice card for "git" or "git/<lesson>", in Forma's activity shape. */
export function gitActivity(id,{L,T}){
 if(!id)return {title:L('Git simulator','Git 模拟练习','Git 模擬練習'),description:L('Type real Git commands in a simulated terminal: one lesson per command, then a team project.','在模拟终端里输入真实的 Git 命令：每条命令一节课，最后完成团队项目。','在模擬終端裡輸入真實的 Git 指令：每條指令一節課，最後完成團隊專案。'),done:gitLessonDone(''),icon:'git-branch'};
 const lesson=lessonById(id);
 if(!lesson)return null;
 return {title:`${lesson.cmd} · ${T(tri(lesson.title))}`,description:T(tri(lesson.summary)),done:gitLessonDone(id),icon:'git-branch'};
}
export const gitLessonIds=LESSONS.map(l=>l.id);
/** Plan step title for "git/<lesson>" in Forma's three-language shape; null for an unknown lesson. */
export function gitLessonTitle(id){
 if(!id)return {en:'Git simulator','zh-CN':'Git 模拟练习','zh-TW':'Git 模擬練習'};
 const l=lessonById(id);if(!l)return null;
 return {en:`${l.cmd} · ${l.title.en}`,'zh-CN':`${l.cmd} · ${l.title.zh}`,'zh-TW':`${l.cmd} · ${l.title.zh}`};
}
