import test from 'node:test';
import assert from 'node:assert/strict';
const store=new Map();
globalThis.localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
const {linkPlanCourse,planCourseFor,clearPlanCourse}=await import('../public/plan-course-link.js');

test('a personal course is linked back to its plan',()=>{
 assert.equal(linkPlanCourse('u1','plan-1','course-1'),true);
 assert.equal(planCourseFor('u1','plan-1'),'course-1');
 assert.equal(planCourseFor('u2','plan-1'),null);
 assert.equal(planCourseFor('u1','plan-2'),null);
 assert.equal(linkPlanCourse('u1','plan-1','course-2'),true);
 assert.equal(planCourseFor('u1','plan-1'),'course-2');
 assert.equal(linkPlanCourse('u1','','course-1'),false);
});
test('deleting a stale link leaves other plans intact',()=>{
 linkPlanCourse('u3','plan-1','course-1');
 linkPlanCourse('u3','plan-2','course-2');
 assert.equal(clearPlanCourse('u3','plan-1'),true);
 assert.equal(planCourseFor('u3','plan-1'),null);
 assert.equal(planCourseFor('u3','plan-2'),'course-2');
 assert.equal(clearPlanCourse('u3','plan-1'),false);
});
