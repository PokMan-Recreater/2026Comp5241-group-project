import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonPlayerHTML} from '../public/lesson-player.js';
import {allLessons} from '../public/all-lessons.js';
import {deliveryLesson,deliveryLessonHTML} from '../public/delivery-lesson.js';
import {hasLesson,lessonHTMLFor} from '../public/learn.js';
import {curriculum} from '../public/course-map.js';

const stepLinks=html=>(html.match(/data-dl-step=/g)||[]).length;

test('the player renders one step link per authored step',()=>{
 assert.equal(deliveryLesson.steps.length,5);
 assert.equal(allLessons.length,45);
 for(const lesson of allLessons){
  assert.ok(lesson.steps.length>=4,`${lesson.id} has at least four steps`);
  const html=lessonPlayerHTML(lesson,'zh-CN');
  assert.equal(stepLinks(html),lesson.steps.length);
  for(const step of lesson.steps)assert.ok(html.includes(step.title),`${lesson.id} shows ${step.title}`);
 }
 assert.equal(stepLinks(deliveryLessonHTML('zh-CN')),5);
});

test('every lesson is narrated in Mandarin and English',()=>{
 for(const lesson of allLessons){
  assert.equal(lesson.audio,true,`${lesson.id} has narration`);
  assert.ok(lesson.audioManifest,`${lesson.id} has a manifest`);
  for(const lang of ['zh-CN','en']){
   const records=lesson.audioManifest[lang];
   assert.equal(records.length,lesson.steps.length,`${lesson.id} ${lang} record count`);
   for(const [i,record] of records.entries()){
    const step=lesson.steps[i];
    assert.ok(record.src.startsWith(`/audio/${lesson.id}/`));
    assert.ok(record.duration>5);
    assert.equal(record.sentenceStarts.length,(lang==='en'?step.enScript:step.script).length);
    assert.equal(record.sentenceStarts[0],0);
    for(let n=1;n<record.sentenceStarts.length;n++)assert.ok(record.sentenceStarts[n]<record.duration);
   }
  }
  for(const step of lesson.steps){
   assert.ok(step.script.length>=2&&step.script.length<=4);
   assert.equal(step.script.length,step.enScript.length);
   assert.equal(step.notes.length,step.enNotes.length);
   const zh=lessonPlayerHTML(lesson,'zh-CN'),en=lessonPlayerHTML(lesson,'en');
   assert.ok(zh.includes(step.title));
   assert.ok(en.includes(step.en));
   const art=step.art(1,'zh-CN');
   assert.match(art,/viewBox="0 0 720 360"/);
   assert.ok(art.length>500);
  }
 }
});

test('the sidebar folds all five course lessons, one open at a time',()=>{
 for(const theme of curriculum)for(const course of theme.courses){
  const first=course.lessons.find(l=>l.id);
  const html=lessonHTMLFor(first.id,'zh-CN');
  assert.equal((html.match(/data-dl-lesson-toggle/g)||[]).length,course.lessons.length);
  assert.equal((html.match(/aria-expanded="true"/g)||[]).length,1);
  assert.equal(stepLinks(html),allLessons.find(l=>l.id===first.id).steps.length);
  for(const lesson of course.lessons)if(lesson.id!==first.id)assert.match(html,new RegExp(`#learn/${lesson.id}/0`));
 }
});

test('the registry resolves every live lesson and rejects unknown ids',()=>{
 for(const lesson of allLessons){
  assert.ok(hasLesson(lesson.id));
  assert.ok(lessonHTMLFor(lesson.id,'zh-CN').includes('data-delivery-player'));
 }
 assert.equal(hasLesson('engineering-overview'),false);
 assert.equal(lessonHTMLFor('engineering-overview','zh-CN'),null);
});
