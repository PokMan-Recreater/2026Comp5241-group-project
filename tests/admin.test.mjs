import test from 'node:test';
import assert from 'node:assert/strict';
import {createAdminHandler} from '../api/admin.js';

const uid='11111111-1111-4111-8111-111111111111',aid='22222222-2222-4222-8222-222222222222',cid='33333333-3333-4333-8333-333333333333',eid='44444444-4444-4444-8444-444444444444';
const count=n=>({data:null,headers:{'content-range':`*/${n}`}});
function fixture(role='admin',responses=[]){
 const calls=[];const handler=createAdminHandler({supabaseConfig:()=>({}),authenticatedUser:async()=>({user:{id:uid,app_metadata:{role}},token:'user-jwt'}),cloudRequest:async(config,path,options={})=>{calls.push({path,...options});if(!responses.length)throw Error('unexpected request');const value=responses.shift();return typeof value==='function'?value(path,options):value;}});
 return {calls,async run(resource,body,method=body===undefined?'GET':'POST',extra=''){
  const req={url:'/api/admin?resource='+resource+extra,method,headers:{host:'localhost',origin:'http://localhost'},body};
  const res={statusCode:200,setHeader(){},status(code){this.statusCode=code;return this;},json(value){return {status:this.statusCode,body:value};}};
  return handler(req,res);
 }};
}
test('non-admin sessions are rejected before any database call',async()=>{
 for(const role of ['student','teacher']){const f=fixture(role);assert.equal((await f.run('users')).status,403);assert.equal((await f.run('overview',{action:'ban',userId:aid,banned:true})).status,403);assert.equal(f.calls.length,0);}
});
test('user directory is paginated, mapped and searchable',async()=>{
 const users=[{id:uid,email:'b@accounts.forma.invalid',created_at:'2026-01-01',last_sign_in_at:null,banned_until:null,app_metadata:{role:'student'},user_metadata:{username:'bob'}},{id:aid,email:'a@accounts.forma.invalid',banned_until:'2999-01-01T00:00:00Z',app_metadata:{role:'teacher'},user_metadata:{username:'alice'}}];
 const f=fixture('admin',[{users}]);const r=await f.run('users');
 assert.equal(r.status,200);
 assert.deepEqual(r.body.users.map(u=>[u.username,u.role,u.banned]),[['alice','teacher',true],['bob','student',false]]);
 assert.match(f.calls[0].path,/\/auth\/v1\/admin\/users\?page=1&per_page=100$/);assert.equal(f.calls[0].admin,true);
 const filtered=fixture('admin',[{users}]);const g=await filtered.run('users',undefined,'GET','&search=ALICE');
 assert.deepEqual(g.body.users.map(u=>u.username),['alice']);
});
test('a second page is requested only while a full page is returned',async()=>{
 const first=Array.from({length:100},(_,i)=>({id:aid,app_metadata:{role:'student'},user_metadata:{username:'u'+i}}));
 const f=fixture('admin',[{users:first},{users:[]}]);await f.run('users');
 assert.equal(f.calls.length,2);assert.match(f.calls[1].path,/page=2/);
});
test('the administrator API rejects role changes without writing to the database',async()=>{
 const f=fixture('admin');
 const result=await f.run('overview',{action:'set-role',userId:aid,role:'teacher'});
 assert.equal(result.status,400);
 assert.equal(result.body.error,'invalid_request');
 assert.equal(f.calls.length,0);
});
test('ban and unban use GoTrue ban_duration and cannot ban the session admin',async()=>{
 const self=fixture('admin');assert.equal((await self.run('overview',{action:'ban',userId:uid,banned:true})).status,400);
 const target={id:aid,app_metadata:{role:'student'},user_metadata:{username:'bob'}};
 const f=fixture('admin',[target,{...target,ban_duration:'876000h'}]);
 assert.equal((await f.run('overview',{action:'ban',userId:aid,banned:true})).status,200);
 assert.deepEqual(f.calls[1].body,{ban_duration:'876000h'});
 const g=fixture('admin',[target,{...target,ban_duration:'none'}]);
 assert.equal((await g.run('overview',{action:'ban',userId:aid,banned:false})).status,200);
 assert.deepEqual(g.calls[1].body,{ban_duration:'none'});
 assert.equal((await fixture('admin').run('overview',{action:'ban',userId:aid,banned:'yes'})).status,400);
});
test('overview reports role counts and exact table counts',async()=>{
 const users=[{app_metadata:{role:'student'}},{app_metadata:{role:'student'}},{app_metadata:{role:'teacher'}},{app_metadata:{role:'admin'}}];
 const f=fixture('admin',[{users},count(11),count(5),count(3),count(4),count(9),count(120)]);
 const r=await f.run('overview');
 assert.deepEqual(r.body.stats,{users:4,students:2,teachers:1,admins:1,teachingCourses:11,publishedCourses:5,personalCourses:3,classrooms:4,assignments:9,events:120});
 assert.equal(f.calls.filter(c=>c.raw).length,6);
 assert.ok(f.calls.filter(c=>c.raw).every(c=>c.admin===true&&c.headers.Prefer==='count=exact'));
 assert.match(f.calls[1].path,/select=id&deleted_at=is\.null&limit=0$/);
 const assignmentsCall=f.calls.find(c=>c.path.includes('teaching_assignments'));
 assert.match(assignmentsCall.path,/select=id,teaching_courses!inner\(deleted_at\),teaching_classrooms!inner\(deleted_at\)/);
});
test('course listing merges teacher and personal courses with owner names',async()=>{
 const users=[{id:aid,app_metadata:{role:'teacher'},user_metadata:{username:'alice'}},{id:cid,app_metadata:{role:'student'},user_metadata:{username:'bob'}}];
 const f=fixture('admin',[{users},[{id:aid,title:'Taught',teacher_id:aid,revision:3,updated_at:'2026-11-02',published_title:'Taught'}],[{id:cid,title:'Mine',owner_id:cid,revision:1,updated_at:'2026-11-03'}]]);
 const r=await f.run('courses');
 assert.deepEqual(r.body.courses.map(c=>[c.id,c.kind,c.published,c.owner_username]),[[cid,'personal',false,'bob'],[aid,'teaching',true,'alice']]);
 assert.match(f.calls[1].path,/published_title:published->>title/);assert.equal(f.calls[1].admin,true);
});
test('unpublishing uses the current revision and reports conflicts',async()=>{
 const f=fixture('admin',[[{id:aid,revision:4}]]);const r=await f.run('overview',{action:'unpublish',courseId:aid,revision:3});
 assert.equal(r.status,200);assert.deepEqual(f.calls[0].body,{published:null,revision:4});assert.match(f.calls[0].path,/revision=eq\.3/);
 const stale=fixture('admin',[[]]);assert.equal((await stale.run('overview',{action:'unpublish',courseId:aid,revision:3})).status,409);
 assert.equal((await fixture('admin').run('overview',{action:'unpublish',courseId:aid})).status,400);
});
test('admin deletion soft-deletes a teaching course and its classrooms only',async()=>{
 const f=fixture('admin',[[{id:aid,revision:2}],[{id:aid,revision:3}],null]);
 const r=await f.run('overview',{action:'delete-course',courseId:aid,kind:'teaching'});
 assert.equal(r.status,200);assert.equal(f.calls[1].body.revision,3);assert.ok(f.calls[1].body.deleted_at);
 assert.match(f.calls[2].path,/teaching_classrooms\?course_id=eq\.22222222/);assert.ok(f.calls[2].body.deleted_at);
 assert.equal((await fixture('admin').run('overview',{action:'delete-course',courseId:aid,kind:'personal'})).status,400);
});
test('cross-teacher learning summary reuses the event grading helper',async()=>{
 const assignment={id:aid,classroom_id:cid,published_snapshot:{title:'SE',lessons:[{id:'l1'},{id:'l2'}]},teaching_classrooms:{name:'Class A'}};
 const events=[{student_id:uid,lesson_id:'l1',event_type:'complete',active_seconds:0,created_at:'2026-11-03'},{student_id:uid,lesson_id:'l1',event_type:'quiz',active_seconds:0,correct:true,created_at:'2026-11-03'}];
 const f=fixture('admin',[[assignment],events,[{student_id:uid,username:'bob'},{student_id:eid,username:'sam'}]]);
 const r=await f.run('learning');
 assert.equal(r.status,200);
 assert.deepEqual(r.body.rows.map(x=>[x.username,x.completed_lessons,x.quiz_attempts,x.correct_attempts]),[['bob',1,1,1],['sam',0,0,0]]);
 assert.equal(r.body.summary.students,2);assert.equal(r.body.summary.accuracy,1);assert.equal(r.body.summary.completedLessons,1);
 assert.match(f.calls[0].path,/teaching_assignments\?select=\*,teaching_classrooms!inner\(name,deleted_at\)/);assert.equal(f.calls[0].admin,true);
});
test('admin POST requires the same origin',async()=>{
 const req={url:'/api/admin?resource=overview',method:'POST',headers:{host:'localhost',origin:'http://evil.example'},body:{action:'ban',userId:aid,banned:true}};
 const res={statusCode:200,setHeader(){},status(code){this.statusCode=code;return this;},json(value){return {status:this.statusCode,body:value};}};
 const handler=createAdminHandler({supabaseConfig:()=>({}),authenticatedUser:async()=>({user:{id:uid,app_metadata:{role:'admin'}}}),cloudRequest:async()=>{throw Error('unexpected request');}});
 assert.equal((await handler(req,res)).status,403);
});
