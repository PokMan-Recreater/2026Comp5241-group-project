import test from 'node:test';
import assert from 'node:assert/strict';
import {courses} from '../public/data.js';
import {knowledgeQuestions} from '../public/knowledge-checks.js';
import {practiceForLesson} from '../public/course-practices.js';
import {workshopHTML,checkAnswer} from '../public/learning-studio.js';

test('the introductory sample is a five-part course with ten connected objective checks',()=>{
 const course=courses.find(c=>c.id==='development');
 assert.equal(course.title['zh-CN'],'软件工程入门');
 assert.deepEqual(course.lessons.map(l=>l.id),['d1','d2','d3','d4','d5']);
 const bank=knowledgeQuestions(courses).filter(q=>q.key.startsWith('development:'));
 assert.equal(bank.length,10);
 for(const [i,l] of course.lessons.entries()){
  assert.deepEqual(practiceForLesson(course.id,i),['practice/checks/development:'+l.id]);
  for(const lang of ['en','zh-CN','zh-TW']){
   const html=workshopHTML(course,l,{checks:{}},lang);
   assert.doesNotMatch(html,/<textarea|data-action="(?:tutor|roleplay)"/);
   assert.equal((html.match(/data-action="check-answer"/g)||[]).length,2);
   for(const check of l.checks){assert(check.options.every(o=>o.text[lang]&&o.feedback[lang]));assert.equal(new Set(check.options.map(o=>o.feedback[lang])).size,3);}
  }
 }
});
test('feedback distinguishes an attractive interface from a saved result and limits quality claims',()=>{
 const lessons=courses.find(c=>c.id==='development').lessons;
 const resultCheck=lessons[0].check;
 assert.equal(checkAnswer(resultCheck,0).correct,false);
 assert.equal(checkAnswer(resultCheck,1).correct,true);
 const qualityCheck=lessons[4].check;
 assert.equal(checkAnswer(qualityCheck,0).correct,false);
 assert.equal(checkAnswer(qualityCheck,1).correct,false);
 assert.equal(checkAnswer(qualityCheck,2).correct,true);
 const c=courses.find(c=>c.id==='development'),key='development:d5~1';
 const html=workshopHTML(c,lessons[4],{checks:{[key]:{selected:0,checked:0}}},'zh-CN');
 assert.match(html,/负载、阈值和环境共同界定/);
});
