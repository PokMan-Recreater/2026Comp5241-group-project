import test from 'node:test';
import assert from 'node:assert/strict';
const store=new Map();
globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {saveCourseHandoff,takeCourseHandoff}=await import('../public/personal-course-handoff.js');

test('a study plan handoff seeds one learner course exactly once',()=>{
 const draft={title:'Budgeting',description:'Plan',language:'en',lessons:[{title:'Track spending',body:'Record purchases.'}]};
 assert.equal(saveCourseHandoff('u1',draft),true);
 assert.equal(takeCourseHandoff('u2'),null);
 const taken=takeCourseHandoff('u1');
 assert.equal(taken.title,'Budgeting');assert.equal(taken.lessons.length,1);assert.equal(taken.lessons[0].body,'Record purchases.');
 assert.equal(takeCourseHandoff('u1'),null);
});
test('a stale or empty handoff never creates a course',()=>{
 saveCourseHandoff('u3',{title:'x',lessons:[]});
 assert.equal(takeCourseHandoff('u3'),null);
 store.set('forma.personal-course-handoff.u4',JSON.stringify({title:'x',lessons:[{title:'a',body:'b'}],at:Date.now()-16*60*1000}));
 assert.equal(takeCourseHandoff('u4'),null);
});
