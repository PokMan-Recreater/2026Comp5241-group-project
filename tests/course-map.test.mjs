import test from 'node:test';
import assert from 'node:assert/strict';
import {curriculum,courseMapHTML,topicHTML} from '../public/course-map.js';
import {hasLesson,lessonHTMLFor} from '../public/learn.js';

test('the learning map has three distinct themes, each with its own courses',()=>{
 assert.equal(curriculum.length,3);
 assert.equal(new Set(curriculum.map(x=>x.id)).size,3);
 const map=courseMapHTML('zh-CN');
 for(const theme of curriculum){
  assert.match(map,new RegExp(`#module/${theme.id}`));
  assert.ok(theme.courses.length>0);
  const page=topicHTML(theme.id,'zh-CN');
  for(const course of theme.courses){
   assert.ok(page.includes(course.title));
   const first=course.lessons.find(l=>l.id);
   assert.match(page,new RegExp(`#learn/${first.id}/0`),`${theme.id} opens ${course.id} on its first lesson`);
  }
 }
});

test('every lesson is written, registered and reachable from its course player',()=>{
 let total=0;
 for(const theme of curriculum)for(const course of theme.courses){
  const first=course.lessons.find(l=>l.id);
  const player=lessonHTMLFor(first.id,'zh-CN');
  assert.ok(player.includes('data-delivery-player'));
  const groups=(player.match(/dl-lesson-group/g)||[]).length;
  assert.equal(groups,course.lessons.length,`${course.id} sidebar lists every lesson`);
  for(const lesson of course.lessons){
   total++;
   assert.ok(lesson.id,`${lesson.no} has an id`);
   assert.ok(hasLesson(lesson.id),`${lesson.id} is registered`);
   assert.ok(player.includes(lesson.title),`${course.id} sidebar names ${lesson.title}`);
   if(lesson.id!==first.id)assert.match(player,new RegExp(`#learn/${lesson.id}/0`));
  }
 }
 assert.equal(total,45);
 assert.equal(curriculum.reduce((n,theme)=>n+theme.courses.length,0),9);
});

test('a course link lands on the first lesson instead of a card page',()=>{
 const page=topicHTML('delivery-basics','zh-CN');
 assert.match(page,/#learn\/delivery-ready\/0/);
 assert.match(page,/课程页已取消/);
 assert.doesNotMatch(page,/分步图解/);
 assert.match(topicHTML('delivery-basics','en'),/#learn\/delivery-ready\/0/);
});

test('all nine course routes point at a live first lesson',()=>{
 for(const theme of curriculum)for(const course of theme.courses){
  const first=course.lessons.find(l=>l.id);
  assert.ok(first,`${course.id} has a live first lesson`);
  assert.ok(hasLesson(first.id));
  assert.match(topicHTML(course.id,'zh-CN'),new RegExp(`#learn/${first.id}/0`));
  assert.match(topicHTML(course.id,'en'),new RegExp(`#learn/${first.id}/0`));
 }
});

test('unknown ids fall back to a link back to the map',()=>{
 const page=topicHTML('does-not-exist','zh-CN');
 assert.match(page,/没有这个主题/);
 assert.match(page,/#explore/);
});
