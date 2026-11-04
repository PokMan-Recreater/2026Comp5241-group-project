import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createLearningViews} from '../public/academy-views.js';
import {ensureAcademy} from '../public/academy-core.js';
import {practiceForLesson} from '../public/course-practices.js';
import {isHiddenLab,isHiddenLabRoute,labs} from '../public/academy-content.js';
import {courses} from '../public/data.js';
import {gitActivity,gitLessonIds} from '../public/git-course/catalog.js';
const state={profile:{},progress:{},events:[],lang:'zh-CN'};
const views=createLearningViews({courses:()=>[],course:()=>null},{
 e:String,L:(en,cn)=>cn,T:x=>typeof x==='object'?x['zh-CN']:x,s:()=>state,a:()=>ensureAcademy(state),
 link:(url,title)=>`<a href="#${url}">${title}</a>`,button:()=>'',heading:title=>`<h1>${title}</h1>`,ico:()=>'',cards:items=>items.join(''),codeLanguage:x=>x,empty:()=>'',
});
test('practice keeps three categories and drops the labs and written tabs',()=>{
 const nav=views.practiceTabs('playground');assert.equal((nav.match(/<a /g)||[]).length,3);
 assert.doesNotMatch(nav,/#practice\/git/);assert.doesNotMatch(nav,/#practice\/labs/);assert.doesNotMatch(nav,/#practice\/written/);
 assert.match(nav,/#practice\/coding" aria-current="page"/);assert.doesNotMatch(nav,/#practice\/playground/);
 assert.match(views.practiceSections('playground'),/#practice\/playground" aria-current="page"/);
});
test('Git practice lives in the Git simulator, not in the practice tabs',()=>{
 assert.doesNotMatch(views.practiceTabs('checks'),/#practice\/git/);
 assert.equal(labs.some(([id])=>id==='git'||/^git-/.test(id)),false,'the old Git lab pages are gone');
 assert.deepEqual(practiceForLesson('git-essentials',0),['git/commit'],'the Git reading course opens the matching simulator lesson');
 for(const route of ['development','requirements','product-decisions'].flatMap(c=>[0,1,2,3,4,5].flatMap(i=>practiceForLesson(c,i))).filter(r=>r.startsWith('git')))
  assert.ok(gitLessonIds.includes(route.split('/')[1]),route+' must name a simulator lesson');
 const L=(en,cn)=>cn,T=x=>x['zh-CN'];
 assert.equal(gitActivity('commit',{L,T}).title,'git commit · 提交快照');
 assert.equal(gitActivity('',{L,T}).title,'Git 模拟练习');
 assert.equal(gitActivity('nope',{L,T}),null);
});
test('Knowledge practice asks Git questions and links no practice page',()=>{
 assert.match(views.practice('checks'),/#practice\/checks\/topic-git/);
 const git=views.practice('checks','topic-git');
 assert.doesNotMatch(git,/#lab\//);
 assert.ok((git.match(/href="#practice\/checks\/git:[a-z-]+"/g)||[]).length>=8,'the Git group needs questions');
});
test('the retired lab and written entries open Knowledge practice instead',()=>{
 const labs=views.practice('labs'),written=views.practice('written');
 for(const page of [labs,written]){assert.match(page,/#practice\/checks\/topic-git/);assert.doesNotMatch(page,/#interview\//);assert.doesNotMatch(page,/#mock-interview/);}
 assert.match(views.practiceTabs('written'),/#practice\/checks" aria-current="page"/);
 assert.equal(views.practiceSections('written'),'');
});
test('games open the challenge course directly and do not appear in the practice lab list',()=>{
 assert.equal(views.games,undefined);
 assert.doesNotMatch(views.practice('labs'),/#game"/);
});
test('the rebuilt catalog no longer repeats the old topic taxonomy',()=>{
 assert.equal(views.courseTabs('software'),'');
});
test('the five hidden labs stay registered but no lesson or practice page links them',()=>{
 for(const id of ['prompt','rag','ci','docker','gradient']){
  assert(labs.some(l=>l[0]===id),'the hidden page must stay in the code: '+id);
  assert(isHiddenLab(id),id+' must be marked hidden');
 }
 for(const c of courses)for(const [i] of c.lessons.entries())for(const route of practiceForLesson(c.id,i))assert(!isHiddenLabRoute(route),c.id+':'+i+' links '+route);
 assert.doesNotMatch(views.practice('checks','topic-git'),/#lab\/(prompt|rag|ci|docker|gradient)"/);
});
