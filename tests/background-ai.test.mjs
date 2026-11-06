import test from 'node:test';
import assert from 'node:assert/strict';
import {createBackgroundAI,taskDestination,taskInput} from '../public/background-ai.js';
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
function harness(){const map=new Map(),storage={getItem:k=>map.get(k),setItem:(k,v)=>map.set(k,v)};const jobs=createBackgroundAI({storage});jobs.account('alice');return {jobs,storage};}
test('work outlives its original view and completed results survive reload',async()=>{
 const {jobs,storage}=harness(),pending=deferred();const result=jobs.start({key:'course',title:'Course'},()=>pending.promise);
 assert.equal(jobs.list()[0].status,'running');pending.resolve({lesson:{title:'Ready'}});assert.deepEqual(await result,{lesson:{title:'Ready'}});
 const reloaded=createBackgroundAI({storage});reloaded.account('alice');assert.equal(reloaded.list()[0].status,'completed');assert.equal(reloaded.list()[0].result.lesson.title,'Ready');
});
test('duplicate requests share one generation and queue limits concurrent work',async()=>{
 const {jobs}=harness(),pending=deferred();let calls=0;const work=()=>{calls++;return pending.promise;};
 const first=jobs.start({key:'same'},work),duplicate=jobs.start({key:'same'},work);assert.equal(first,duplicate);
 const second=jobs.start({key:'second'},work),third=jobs.start({key:'third'},work);await Promise.resolve();assert.equal(calls,2);assert.equal(jobs.list()[2].status,'queued');
 pending.resolve('done');await Promise.all([first,second,third]);assert.equal(calls,3);
});
test('switching accounts cannot expose another account result or run its queued work',async()=>{
 const {jobs}=harness(),a=deferred(),b=deferred();const first=jobs.start({key:'a'},()=>a.promise).catch(e=>e.message),second=jobs.start({key:'b'},()=>b.promise).catch(e=>e.message);let ran=false;const queued=jobs.start({key:'c'},()=>{ran=true;}).catch(e=>e.message);
 jobs.account('bob');a.resolve('secret');b.resolve('secret');assert.equal(await first,'account_changed');assert.equal(await second,'account_changed');assert.equal(await queued,'account_changed');assert.equal(ran,false);assert.deepEqual(jobs.list(),[]);
});
test('unfinished tasks become interrupted on reload without silently regenerating',()=>{
 const {jobs,storage}=harness();void jobs.start({key:'slow'},()=>new Promise(()=>{}));const reloaded=createBackgroundAI({storage});reloaded.account('alice');assert.equal(reloaded.list()[0].status,'interrupted');assert.equal(reloaded.active(),false);
});
test('only the matching course and route can recover an unused courseware candidate',async()=>{
 const {jobs}=harness();await jobs.start({key:'lesson',kind:'courseware',courseId:'c1',route:'#personal-course/c1',lessonId:'l1'},()=>({lesson:{title:'New'}}));
 assert.equal(jobs.candidate('other','#personal-course/c1'),undefined);const candidate=jobs.candidate('c1','#personal-course/c1');assert.equal(candidate.lessonId,'l1');jobs.used(candidate.id);assert.equal(jobs.candidate('c1','#personal-course/c1'),undefined);
});

test('using the latest candidate does not resurrect an older rejected generation',async()=>{
 const {jobs}=harness(),meta={kind:'courseware',courseId:'c',route:'#personal-course/c',lessonId:'l'};
 await jobs.start({...meta,key:'first'},()=>({lesson:{title:'Old'}}));await jobs.start({...meta,key:'second'},()=>({lesson:{title:'New'}}));
 const candidate=jobs.candidate('c','#personal-course/c');assert.equal(candidate.result.lesson.title,'New');jobs.used(candidate.id);assert.equal(jobs.candidate('c','#personal-course/c'),undefined);
});

test('clearing finished tasks keeps running work and persists the removal',async()=>{
 const {jobs,storage}=harness();await jobs.start({key:'done'},()=>({ok:true}));
 const failed=jobs.start({key:'failed'},()=>{throw Error('boom');}).catch(()=>{});
 void jobs.start({key:'slow'},()=>new Promise(()=>{}));await failed;
 assert.equal(jobs.list().length,3);assert.equal(jobs.clearFinished(),2);
 assert.equal(jobs.list().length,1);assert.equal(jobs.active(),true);
 const reloaded=createBackgroundAI({storage});reloaded.account('alice');assert.equal(reloaded.list().length,1);
});
test('view result routes to native destinations and ignores external result links',async()=>{
 assert.equal(await taskDestination({kind:'plan'}),'#path');
 assert.equal(await taskDestination({kind:'plan',resultRoute:'#plan/p'}),'#plan/p');
 assert.equal(await taskDestination({kind:'courseware',courseId:'c',route:'#teacher-course/c'}),'#teacher-course/c');
 assert.equal(await taskDestination({kind:'courseware',courseId:'c',route:'#plan/p'},{request:async()=>{throw Error('offline');}}),'#personal-course/c');
 assert.equal(await taskDestination({id:'r',kind:'review',resultRoute:'https://example.com'}),'#ai-result/r');
 assert.equal(await taskDestination({kind:'narration',route:'#personal-course/c'}),'#personal-course/c');
 assert.deepEqual(taskInput({key:'/api/ai:{"topic":"test"}'}),{topic:'test'});
});
test('explicitly opening a task recovers that candidate across routes without mixing accounts',async()=>{
 const {jobs}=harness();await jobs.start({key:'old',kind:'courseware',courseId:'c',route:'#plan/p'},()=>({lesson:{title:'Selected'}}));
 const selected=jobs.list()[0];await jobs.start({key:'new',kind:'courseware',courseId:'c',route:'#personal-course/c'},()=>({lesson:{title:'Newest'}}));
 jobs.requestOpen(selected.id);assert.equal(jobs.candidate('c','#personal-course/c').id,selected.id);
 jobs.account('bob');assert.equal(jobs.requested(),undefined);assert.equal(jobs.candidate('c','#personal-course/c'),undefined);
});
