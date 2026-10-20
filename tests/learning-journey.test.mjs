import test from 'node:test';
import assert from 'node:assert/strict';
import {courses} from '../public/data.js';
import {referenceTopics,challenges,labs,interviews} from '../public/academy-content.js';
import {programmingLessons,programmingLessonById} from '../public/programming-lessons.js';
import {practiceForLesson,nextStudyTarget} from '../public/learning-links.js';
import {buildPlan,planProgress,planStepRoute,ensureAcademy,learningStats} from '../public/academy-core.js';

test('every built-in lesson connects to an existing practice or teaching page',()=>{
 for(const c of courses)for(const [i] of c.lessons.entries()){
  const links=practiceForLesson(c.id,i);assert(links.length,c.id+':'+i);
  for(const route of links){
   const [kind,id,index]=route.split('/');
   const valid=kind==='game'||kind==='lab'&&labs.some(x=>x[0]===id)||kind==='challenge'&&challenges.some(x=>x.id===id)||kind==='interview'&&interviews.some(x=>x.id===id)||kind==='tutorial'&&referenceTopics.some(x=>x.id===id)||kind==='learn'&&courses.find(x=>x.id===id)?.lessons[Number(index)];
   assert(valid,route);
  }
 }
 assert.deepEqual(practiceForLesson('custom-course',0),[]);
});

test('resume respects an active plan, skips finished lessons and resolves stored lesson IDs after reordering',()=>{
 const s={profile:{},progress:{},academy:{plans:[{id:'p',steps:[{courseId:'development',lessonId:courses[0].lessons[1].id,index:0}]}],activePlan:'p'}};
 assert.deepEqual(nextStudyTarget(courses,s),{kind:'lesson',courseId:'development',index:1});
 s.progress.development=[courses[0].lessons[1].id];
 s.academy.lastStudy={kind:'lesson',courseId:'development',index:1};
 assert.deepEqual(nextStudyTarget(courses,s),{kind:'lesson',courseId:'development',index:0});
 s.academy.lastStudy={kind:'tutorial',id:'deleted-topic'};
 assert.equal(nextStudyTarget(courses,s).kind,'lesson');
});

test('programming plans use real mini lessons, persist no placeholder course and track tutorial completion',()=>{
 for(const [topic,language] of [['Python','python'],['C++','cpp'],['C语言','c'],['HTML/CSS','html'],['JavaScript','javascript']]){
  const {course,plan}=buildPlan({courses,topic,profile:{skillLevel:'intermediate',weeklyMinutes:30},id:'p',courseId:'unused'});
  assert.equal(course,null);assert.equal(plan.source,'programming');
  assert.equal(plan.steps.length,referenceTopics.filter(x=>x.language===language).length);
  const s={profile:{},progress:{}};ensureAcademy(s);s.academy.plans=[plan];s.academy.activePlan='p';
  const first=plan.steps[0];assert.equal(planStepRoute(first),'tutorial/'+first.tutorialId);
  assert.deepEqual(nextStudyTarget(courses,s),{kind:'tutorial',id:first.tutorialId});
  s.academy.tutorials.push(first.tutorialId);assert(planProgress(plan,s).percent>0);
  assert.notEqual(planProgress(plan,s).next.tutorialId,first.tutorialId);
 }
});

test('programming completion counts towards lesson badges without double-rewarding repeat activity',()=>{
 const s={profile:{},progress:{},events:[]},a=ensureAcademy(s);
 a.tutorials=['c-io'];assert.equal(learningStats(s).badges[0],true);assert.equal(learningStats(s).xp,15);
 a.tutorials=referenceTopics.slice(0,5).map(t=>t.id);assert.equal(learningStats(s).badges[1],true);
 a.activities.push({type:'tutorial',id:'c-io',at:new Date().toISOString()});assert.equal(learningStats(s).xp,75);
 a.tutorials=[];assert.equal(learningStats(s).badges[0],false);
});

test('all thirty lessons have specific multilingual teaching, checks, feedback and worked answers',()=>{
 assert.equal(programmingLessons.length,referenceTopics.length);
 assert.equal(new Set(programmingLessons.map(x=>x.id)).size,referenceTopics.length);
 for(const topic of referenceTopics){
  const l=programmingLessonById[topic.id];assert(l,topic.id);assert(l.solution.length>20);
  assert(l.correct>=0&&l.correct<l.options.length);assert.equal(l.options.length,3);
  for(const locale of ['en','zh-CN','zh-TW']){
   for(const field of ['question','walkthrough','answer','pitfall'])assert(l[field][locale]?.length>8,`${topic.id}:${field}:${locale}`);
   assert(l.options.every(x=>typeof x[locale]==='string'&&x[locale].length));
  }
 }
});

test('JavaScript worked answers produce the lesson results, including the rejected-promise path',async()=>{
 const expectations={'js-values':['Sam',false],'js-scope':['ready'],'js-arrays':[[2,6],[1,2,3]],'js-async':['Request failed']};
 const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
 for(const [id,expected] of Object.entries(expectations)){
  const output=[];
  await new AsyncFunction('console',programmingLessonById[id].solution)({log:x=>output.push(x)});
  assert.deepEqual(output,expected,id);
 }
 await assert.rejects(()=>new AsyncFunction(referenceTopics.find(t=>t.id==='js-scope').code)(),ReferenceError);
});
