import test from 'node:test';
import assert from 'node:assert/strict';
import {workspaceChanges,applyWorkspaceOperations,validWorkspaceOperations,workspaceSnapshot} from '../public/workspace-state.js';
import {createWorkspaceSync} from '../public/workspace-sync.js';
import {learningStats} from '../public/academy-core.js';
import {createWorkspaceHandler} from '../scripts/workspace-support.mjs';

const clone=value=>structuredClone(value);
const memory=()=>{const data=new Map();return {getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};};
const noTimer=()=>1;
function device(initial,server,storage=memory(),options={}){
 let state=clone(initial);const status=[];
 const sync=createWorkspaceSync({getState:()=>state,apply:next=>{state=clone(next);},storage,request:async body=>{if(body)server.state=applyWorkspaceOperations(server.state,body.operations);return {state:clone(server.state),revision:1};},notify:s=>status.push(s),schedule:noTimer,cancel(){},...options});
 return {sync,get state(){return state;},set state(value){state=value;},status};
}
test('offline records from two existing devices merge without losing check-ins, completion or XP',async()=>{
 const server={state:{}};
 const desktop=device({profile:{name:'Alice'},progress:{course:['one']},academy:{checkins:['2026-11-04'],bookmarks:['course:a'],challenges:{a:{passed:true}},quizzes:{q:{correct:true}}}},server);
 const phone=device({profile:{name:'Old name'},progress:{course:['two']},academy:{checkins:['2026-11-05'],bookmarks:['course:b'],challenges:{a:{passed:false},b:{passed:true}}}},server);
 await desktop.sync.start('alice',{hasLocalData:true});await phone.sync.start('alice',{hasLocalData:true});await desktop.sync.sync();
 assert.deepEqual(new Set(desktop.state.progress.course),new Set(['one','two']));assert.deepEqual(desktop.state.academy.checkins,['2026-11-04','2026-11-05']);
 assert.equal(desktop.state.profile.name,'Alice');assert.equal(learningStats(desktop.state).xp,215);
 await desktop.sync.sync();await phone.sync.sync();assert.equal(learningStats(phone.state).xp,215);
});
test('a new phone loads cloud records without overwriting them with fresh defaults',async()=>{
 const remote={profile:{name:'Alice',goal:'career'},progress:{c:['one']},academy:{checkins:['2026-11-05']}};
 const phone=device({profile:{name:'Alex',goal:'build'},progress:{},academy:{checkins:[]}}, {state:clone(remote)});
 await phone.sync.start('alice');assert.deepEqual(phone.state,remote);
});
test('concurrent changes preserve independent achievements and deliberate bookmark removal',()=>{
 const baseline={progress:{c:['one']},academy:{bookmarks:['a'],checkins:['2026-11-04']}};
 const desktop=clone(baseline);desktop.academy.bookmarks=[];desktop.progress.c.push('two');
 const phone=clone(baseline);phone.academy.bookmarks.push('b');phone.academy.checkins.push('2026-11-05');
 let cloud=applyWorkspaceOperations(baseline,workspaceChanges(baseline,phone));cloud=applyWorkspaceOperations(cloud,workspaceChanges(baseline,desktop));
 assert.deepEqual(cloud.academy.bookmarks,['b']);assert.deepEqual(cloud.progress.c,['one','two']);assert.equal(cloud.academy.checkins.length,2);
});
test('an intentional progress reset is respected; retrying merges does not duplicate records',()=>{
 const before={progress:{c:['one','two']},academy:{activities:[{type:'lesson',id:'c:one',at:'2026-11-05'}]}};
 const reset={progress:{},academy:{activities:[]}};
 const operations=workspaceChanges(before,reset);assert.deepEqual(applyWorkspaceOperations(before,operations),reset);
 const append=workspaceChanges({},before,{bootstrap:true});assert.deepEqual(applyWorkspaceOperations(applyWorkspaceOperations({},append),append),before);
});
test('edits made during a slow upload remain pending and are subsequently uploaded',async()=>{
 let state={academy:{checkins:['2026-11-04']}};let finish;
 const sync=createWorkspaceSync({getState:()=>state,apply:next=>{state=next;},storage:memory(),request:()=>new Promise(resolve=>{finish=resolve;}),schedule:noTimer,cancel(){}});
 const starting=sync.start('alice',{hasLocalData:true});state.academy.checkins.push('2026-11-05');finish({state:{academy:{checkins:['2026-11-04']}}});await starting;
 assert.deepEqual(state.academy.checkins,['2026-11-04','2026-11-05']);assert.equal(sync.status(),'pending');sync.stop();
});
test('network failure retains local records and retries after connectivity returns',async()=>{
 const server={state:{}};let offline=true;
 const d=device({progress:{c:['one']}},server,memory(),{request:async body=>{if(offline)throw Error('network');if(body)server.state=applyWorkspaceOperations(server.state,body.operations);return {state:server.state};}});
 await d.sync.start('alice',{hasLocalData:true});assert.equal(d.sync.status(),'offline');assert.deepEqual(d.state.progress.c,['one']);
 offline=false;await d.sync.sync();assert.equal(d.sync.status(),'synced');assert.deepEqual(server.state.progress.c,['one']);
});
test('a late response from the previous account cannot change the new account',async()=>{
 let state={progress:{a:['one']}},finishOld;const applied=[];
 const sync=createWorkspaceSync({getState:()=>state,apply:next=>{state=next;applied.push(next);},storage:memory(),request:async()=>state.progress.a?new Promise(resolve=>{finishOld=resolve;}):{state:{profile:{name:'Bob'}}},schedule:noTimer,cancel(){}});
 const old=sync.start('alice',{hasLocalData:true});sync.stop();state={profile:{name:'Bob'},progress:{}};await sync.start('bob');finishOld({state:{profile:{name:'Alice'},progress:{a:['one']}}});await old;
 assert.equal(state.profile.name,'Bob');assert.ok(applied.every(value=>value.profile?.name!=='Alice'));sync.stop();
});
test('Git-only synchronization never deletes the main workspace or imports another scope',async()=>{
 const server={state:{profile:{name:'Alice'},academy:{checkins:['2026-11-05']},gitProgress:{commit:{done:true}}}};
 const git=device({gitProgress:{push:{done:true}}},server,memory(),{fields:['gitProgress'],namespace:'git'});
 await git.sync.start('alice',{hasLocalData:true});await git.sync.sync();assert.equal(server.state.profile.name,'Alice');assert.equal(server.state.academy.checkins.length,1);assert.deepEqual(Object.keys(git.state),['gitProgress']);assert.equal(git.state.gitProgress.commit.done,true);
});
test('workspace transport rejects ownership/prototype paths and excludes role and language',()=>{
 assert.deepEqual(workspaceSnapshot({profile:{name:'Alice'},role:'admin',lang:'en',accountUser:{id:'x'}}),{profile:{name:'Alice'}});
 for(const path of [['role'],['academy','__proto__','polluted'],['progress',2]])assert.equal(validWorkspaceOperations([{type:'set',path,value:true}]),false);
 assert.equal(validWorkspaceOperations([{type:'set',path:['academy','checkins'],value:[]}]),true);
});
const response=()=>({code:0,headers:{},setHeader(k,v){this.headers[k]=v;},status(code){this.code=code;return this;},json(body){this.body=body;return this;}});
test('workspace API uses only the authenticated token and lets the RPC derive ownership',async()=>{
 const calls=[],handler=createWorkspaceHandler({supabaseConfig:()=>({}),authenticatedUser:async()=>({user:{id:'alice'},token:'alice-token'}),cloudRequest:async(c,path,options)=>{calls.push({path,options});return path.includes('/rpc/')?{state:{progress:{c:['one']}},revision:1}:[];}});
 const req={url:'/api/account?resource=learning-state',headers:{host:'localhost',origin:'http://localhost'},method:'POST',body:{user_id:'victim',batchId:'10000000-0000-4000-8000-000000000001',operations:[{type:'append',path:['progress','c'],value:'one'}]}};
 const res=response();await handler(req,res);assert.equal(res.code,200);assert.equal(calls[0].options.token,'alice-token');assert.equal(calls[0].options.body.user_id,undefined);assert.equal(calls[0].options.admin,undefined);
 const denied=response();await handler({...req,headers:{host:'localhost',origin:'https://evil.test'}},denied);assert.equal(denied.code,403);assert.equal(calls.length,1);
 const read=response();await handler({...req,method:'GET'},read);assert.equal(read.code,200);assert.match(calls[1].path,/user_id=eq.alice/);
});

test('the same lesson on different days preserves both streak/history events without duplicate retries',()=>{
 const old={academy:{activities:[{type:'lesson',id:'c:one',at:'2026-11-04T09:00:00Z'}]}};
 const incoming={academy:{activities:[{id:'c:one',at:'2026-11-05T09:00:00Z',type:'lesson'}]}};
 const operations=workspaceChanges({},incoming,{bootstrap:true});
 const result=applyWorkspaceOperations(applyWorkspaceOperations(old,operations),operations);
 assert.equal(result.academy.activities.length,2);assert.equal(learningStats(result,new Date('2026-11-05T12:00:00Z')).streak,2);
 assert.deepEqual(workspaceChanges(incoming,structuredClone(incoming)),[]);
});
test('large historical imports are sent in bounded batches without losing completions',async()=>{
 const server={state:{}},batches=[];
 const local={progress:{c:Array.from({length:1300},(_,i)=>'lesson-'+i)}};
 const d=device(local,server,memory(),{request:async body=>{batches.push(body.operations.length);server.state=applyWorkspaceOperations(server.state,body.operations);return {state:clone(server.state)};}});
 await d.sync.start('alice',{hasLocalData:true});assert.equal(server.state.progress.c.length,1300);assert.ok(batches.length>1);assert.ok(batches.every(n=>n<=400));
});
