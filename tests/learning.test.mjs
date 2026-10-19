import {test} from 'node:test';
import assert from 'node:assert/strict';
import {courses,courseReferences} from '../public/data.js';
import {recommendation} from '../public/engine.js';
import {evaluateAccess,evaluateScope,checkAnswer,readingHTML,workshopHTML,courseGuideHTML,portfolioText} from '../public/learning-studio.js';

test('every published lesson has complete localized teaching and a usable assignment',()=>{
 const ids=new Set();
 assert.equal(courses.length,7);
 for(const course of courses){
  assert(!ids.has(course.id));ids.add(course.id);
  const lessonIds=new Set();
  for(const lesson of course.lessons){
   assert(!lessonIds.has(lesson.id));lessonIds.add(lesson.id);
   for(const lang of ['en','zh-CN','zh-TW']){
    for(const field of ['title','description','outcomes','deliverable','prerequisite'])assert(course[field][lang]?.trim(),`${course.id}.${field}.${lang}`);
    assert(lesson.body[lang]?.includes('## '),`${lesson.id} has reading sections`);
    assert(lesson.advanced[lang]?.trim(),`${lesson.id} has advanced analysis`);
    assert(lesson.workshop.sample[lang]?.trim());
    assert.equal(lesson.workshop.questions.length,3);
    assert(lesson.workshop.questions.every(q=>q[lang]?.trim()));
    assert(lesson.workshop.rubric.every(q=>q[lang]?.trim()));
    if(lesson.check){assert(lesson.check.options[lesson.check.correct]);assert(lesson.check.options.every(o=>o.text[lang]&&o.feedback[lang]));}
   }
   if(lesson.type==='slides'){assert.equal(lesson.slides.length,lesson.stepLabels.length);assert(lesson.slides.length>1);}
  }
 }
 for(const profile of [{background:'noCoding',goal:'build'},{background:'experienced',goal:'career'},{background:'someCoding',goal:'understand'}]){
  const path=recommendation(profile);assert.equal(new Set(path).size,7);assert(path.every(id=>ids.has(id)));
 }
 assert.equal(courses.find(c=>c.id==='ai-coding').lessons[1].id,'a2');
});

test('permission exercise rejects unauthorized reads and state-invalid approvals',()=>{
 assert.equal(evaluateAccess({actor:'other',action:'read',itemState:'open'}).allowed,false);
 assert.equal(evaluateAccess({actor:'owner',action:'read',itemState:'open'}).allowed,true);
 assert.equal(evaluateAccess({actor:'owner',action:'approve',itemState:'open'}).allowed,false);
 assert.equal(evaluateAccess({actor:'staff',action:'approve',itemState:'returned'}).allowed,false);
 assert.equal(evaluateAccess({actor:'staff',action:'approve',itemState:'open'}).allowed,true);
 assert.throws(()=>evaluateAccess({actor:'self-declared-admin',action:'read',itemState:'open'}));
});

test('scope comparison distinguishes budget feasibility from unresolved policy',()=>{
 assert.deepEqual(evaluateScope(['copy','unpaid']),{cost:4,overBudget:false,unresolvedPolicy:false});
 assert.deepEqual(evaluateScope(['copy','late']),{cost:6,overBudget:false,unresolvedPolicy:true});
 assert.equal(evaluateScope(['unpaid','paid']).overBudget,true);
 assert.equal(evaluateScope(['copy','copy']).cost,1);
 assert.throws(()=>evaluateScope(['invented']));
});

test('feedback follows the selected option, and rejects invalid indices',()=>{
 const check=courses[0].lessons[0].check;
 assert.equal(checkAnswer(check,1).correct,true);
 const wrong=checkAnswer(check,0);assert.equal(wrong.correct,false);assert.equal(wrong.feedback,check.options[0].feedback);
 assert.throws(()=>checkAnswer(check,-1));assert.throws(()=>checkAnswer(check,100));
});

test('course work survives locale changes and exports only the learner draft',()=>{
 const c=courses[0],l=c.lessons[0],key=c.id+':'+l.id;
 const state={work:{[key]:{answers:['My own observation','',''],review:[true,false]}},checks:{},progress:{},notes:{[key]:'My note'}};
 for(const lang of ['en','zh-CN','zh-TW']){
  const html=workshopHTML(c,l,state,lang);assert(html.includes('My own observation'));assert(html.includes('checked'));
  const file=portfolioText(c,state,lang);assert(file.includes('My own observation'));assert(file.includes('My note'));assert(!file.includes(l.workshop.sample[lang]));
  const guide=courseGuideHTML(c,state,lang,courseReferences);assert(guide.includes('#learn/development/0'));
 }
});

test('reading and learner drafts cannot inject executable markup',()=>{
 const payload='</textarea><script>alert(1)</script><img src=x onerror=alert(1)>';
 assert(!readingHTML('## Heading\n\n'+payload).includes('<script>'));
 const c=courses[0],l=c.lessons[0];const html=workshopHTML(c,l,{work:{['development:'+l.id]:{answers:[payload],review:[]}},checks:{}},'en');
 assert(html.includes('&lt;script&gt;'));assert(!html.includes('<script>'));assert(!html.includes('<img src=x'));
});

test('authored code references satisfy the contract; the review exercise starts with a distinguishable defect',()=>{
 for(const course of courses){for(const lesson of course.lessons.filter(l=>l.type==='coding')){
  const reference=Function(lesson.solution+'; return uniqueBookings;')();
  for(const input of [[],[{studentId:'A',name:'Alex'}],[{studentId:'A',note:'first'},{studentId:'A',note:'second'},{studentId:'B',note:'third'}],[{studentId:'A',name:'Alex'},{studentId:'B',name:'Alex'}]]){
   const before=JSON.stringify(input),expected=input.filter((x,i)=>input.findIndex(y=>y.studentId===x.studentId)===i),actual=reference(input);
   assert.notEqual(actual,input);assert.deepEqual(actual,expected);actual.forEach((x,i)=>assert.equal(x,expected[i]));assert.equal(JSON.stringify(input),before);
  }
 }}
 const review=courses.find(c=>c.id==='testing-release').lessons[1];
 const broken=Function(review.starter+'; return uniqueBookings;')();const input=[{studentId:'A',note:'first'},{studentId:'A',note:'second'}];
 assert.equal(broken(input)[0].note,'second');
});
