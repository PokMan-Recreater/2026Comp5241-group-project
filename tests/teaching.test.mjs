import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createTeachingHandler} from '../api/teaching.js';
import {validateCourse,studentSnapshot,summarize} from '../scripts/teaching-support.mjs';
import {lessonSlides} from '../public/teaching-slides.js';
import {slideArt} from '../public/slide-art.js';
import {autoScene,ensureScene} from '../public/scene-auto.js';
import {SCENE_IDS} from '../scripts/teaching-scenes.mjs';
const uid='11111111-1111-4111-8111-111111111111',aid='22222222-2222-4222-8222-222222222222',eid='33333333-3333-4333-8333-333333333333';
const course=()=>({title:'Course',description:'',language:'en',lessons:[{id:'l1',title:'Lesson',body:'Text',scene:'flow',sceneItems:['One'],questions:[{id:'q1',prompt:'Why?',options:['A','B'],correctIndex:1,explanation:'Because'}]}]});
function fixture(role='teacher',responses=[]){
 const calls=[];const handler=createTeachingHandler({supabaseConfig:()=>({}),authenticatedUser:async()=>({user:{id:uid,app_metadata:{role}},token:'user-jwt'}),cloudRequest:async(config,path,options)=>{calls.push({path,...options});if(!responses.length)throw Error('unexpected request');const value=responses.shift();return typeof value==='function'?value(path,options):value;}});
 return {calls,async run(resource,body,method=body===undefined?'GET':'POST',extra=''){
  const req={url:'/api/teaching?resource='+resource+extra,method,headers:{host:'localhost',origin:'http://localhost'},body};
  const res={statusCode:200,setHeader(){},status(code){this.statusCode=code;return this;},json(value){return {status:this.statusCode,body:value};}};
  return handler(req,res);
 }};
}
test('strict bounded schema rejects malformed, duplicate, unknown and oversized fields',()=>{
 assert.deepEqual(validateCourse(course()),course());
 for(const change of [c=>c.lessons.push(...Array(10).fill(c.lessons[0])),c=>c.lessons[0].scene='script',c=>c.lessons[0].questions[0].correctIndex=2,c=>c.lessons[0].questions[0].options=['A'],c=>c.lessons[0].questions.push({...c.lessons[0].questions[0]}),c=>c.html='<script>',c=>c.lessons[0].body='x'.repeat(18001),c=>c.language='invalid']){const c=course();change(c);assert.throws(()=>validateCourse(c),/invalid_request/);}
});
test('student projection removes answer and explanation without mutating teacher copy',()=>{
 const c=course(),s=studentSnapshot(c);assert.equal(s.lessons[0].questions[0].correctIndex,undefined);assert.equal(s.lessons[0].questions[0].explanation,undefined);assert.equal(c.lessons[0].questions[0].correctIndex,1);
});
test('student cannot save or query teacher analytics',async()=>{
 const f=fixture('student');assert.equal((await f.run('courses',{action:'save',course:course()})).status,403);assert.equal((await f.run('analytics',undefined,'GET','&id='+aid)).status,403);assert.equal(f.calls.length,0);
});
test('new save uses user JWT only and returns course',async()=>{
 const f=fixture('teacher',[[{id:aid,revision:1}]]);const r=await f.run('courses',{action:'save',course:course(),sourceId:'official-1'});
 assert.equal(r.status,201);assert.equal(r.body.course.revision,1);assert.equal(f.calls[0].body.teacher_id,uid);assert.equal(f.calls[0].token,'user-jwt');assert.equal(f.calls[0].admin,undefined);assert.deepEqual(f.calls[0].body.draft,course());
});
test('save checks revision and handles a concurrent update with no returned rows',async()=>{
 for(const [revision,responses] of [[1,[[{teacher_id:uid,revision:2}]]],[2,[[{teacher_id:uid,revision:2}],[]]]]){
  const f=fixture('teacher',responses);const r=await f.run('courses',{action:'save',id:aid,revision,course:course()});assert.equal(r.status,409);assert.equal(r.body.error,'revision_conflict');
 }
});
test('publish freezes stored draft and never accepts replacement course from client',async()=>{
 const draft=course(),f=fixture('teacher',[[{teacher_id:uid,revision:3,draft}],[{id:aid,revision:4}]]);
 assert.equal((await f.run('courses',{action:'publish',id:aid,revision:3,course:{title:'malicious'}})).status,200);
 assert.deepEqual(f.calls[1].body.published,draft);assert.match(f.calls[1].path,/revision=eq.3/);
});
test('cross-owner course rejected before write',async()=>{
 const f=fixture('teacher',[[{teacher_id:aid,revision:1}]]);assert.equal((await f.run('courses',{action:'publish',id:aid,revision:1})).status,404);assert.equal(f.calls.length,1);
});
test('class create and username import contract',async()=>{
 let f=fixture('teacher',[[{id:aid,name:'Class'}]]);assert.equal((await f.run('classrooms',{action:'create-class',name:'Class'})).body.classroom.name,'Class');
 f=fixture('teacher',[[{teacher_id:uid}],{imported:['student01'],duplicates:[],missing:['teacher01']}]);const r=await f.run('import',{action:'import',classroomId:aid,usernames:['student01','teacher01']});assert.deepEqual(r.body.imported,['student01']);assert.match(f.calls[1].path,/rpc\/teaching_import_usernames$/);assert.equal(f.calls[1].admin,undefined);
});
test('assignment uses published course, never client snapshot',async()=>{
 const c=course(),f=fixture('teacher',[[{teacher_id:uid}],[{teacher_id:uid,published:c}],[{id:eid}]]);
 assert.equal((await f.run('assignments',{action:'assign',classroomId:aid,courseId:uid,published_snapshot:{}})).status,201);assert.deepEqual(f.calls[2].body.published_snapshot,c);
});
test('student detail uses safe RPC and singular response; missing returns 404',async()=>{
 const f=fixture('student',[[{id:aid,published_snapshot:studentSnapshot(course())}],[]]);const r=await f.run('assignments',undefined,'GET','&id='+aid);assert.equal(r.body.assignment.id,aid);assert.match(f.calls[0].path,/rpc\/teaching_student_assignments/);assert.equal((await f.run('assignments',undefined,'GET','&id='+uid)).status,404);
});
test('heartbeat capped, duplicate retries retrieve existing event, no admin requests',async()=>{
 const e={student_id:uid,assignment_id:aid,lesson_id:'l1',event_id:eid,event_type:'heartbeat',active_seconds:30},f=fixture('student',[[],[e]]);
 const r=await f.run('activity',{assignmentId:aid,lessonId:'l1',eventId:eid,eventType:'heartbeat',activeSeconds:999});assert.deepEqual(r.body.event,e);assert.equal(f.calls[0].body.active_seconds,30);assert.equal(f.calls[0].headers.Prefer,'resolution=ignore-duplicates,return=representation');
});
test('quiz passes selection but never client correctness; DB returns grade',async()=>{
 const f=fixture('student',[[{assignment_id:aid,lesson_id:'l1',event_type:'quiz',question_id:'q1',selected_index:1,correct:true}]]),b={assignmentId:aid,lessonId:'l1',questionId:'q1',eventId:eid,choice:1};
 assert.equal((await f.run('attempts',{...b,correct:true})).status,400);assert.equal((await f.run('attempts',{...b,score:100})).status,400);assert.equal(f.calls.length,0);
 assert.equal((await f.run('attempts',b)).body.event.correct,true);assert.equal(f.calls[0].body.correct,undefined);assert.equal(f.calls[0].body.selected_index,1);
});
test('malformed JSON, null body, invalid UUID and wrong event types return 400',async()=>{
 const f=fixture('student');for(const body of ['{','null',{assignmentId:'bad',lessonId:'l1',eventId:eid,eventType:'complete'},{assignmentId:aid,lessonId:'l1',eventId:eid,eventType:'quiz'}])assert.equal((await f.run('activity',body)).status,400);assert.equal(f.calls.length,0);
});
test('analytics counts real unique completion and grades, includes inactive members',()=>{
 const rows=summarize([{student_id:uid,lesson_id:'l1',event_type:'heartbeat',active_seconds:30,created_at:'2026-11-03'},{student_id:uid,lesson_id:'l1',event_type:'complete',active_seconds:0},{student_id:uid,lesson_id:'l1',event_type:'complete',active_seconds:0},{student_id:uid,lesson_id:'l1',event_type:'quiz',active_seconds:0,correct:true}],[{student_id:uid},{student_id:aid}]);assert.equal(rows[0].activeSeconds,30);assert.deepEqual(rows[0].completedLessons,['l1']);assert.equal(rows[0].accuracy,1);assert.equal(rows[1].accuracy,null);
});
test('migration keeps raw snapshots teacher-only, grades in DB and restricts import',async()=>{
 const sql=await readFile(new URL('../supabase/migrations/202611030003_teacher_courses.sql',import.meta.url),'utf8');
 for(const table of ['courses','classrooms','members','assignments','events'])assert.ok(sql.includes('alter table public.teaching_'+table+' enable row level security'));
 assert.match(sql,/new.correct:=new.selected_index=/);assert.match(sql,/new.published_snapshot:=snapshot/);assert.match(sql,/q-'correctIndex'-'explanation'/);assert.match(sql,/raw_app_meta_data->>'role'='student'/);assert.match(sql,/raw_user_meta_data->>'username'=name/);assert.match(sql,/teacher_id=auth.uid\(\)/);assert.match(sql,/from public,anon,authenticated/);assert.doesNotMatch(sql,/grant.*service_role/);assert.doesNotMatch(sql,/create policy teaching_assignments.*student/);
});
test('frontend classroom list embeds usernames and analytics uses matching row fields',async()=>{
 const f=fixture('teacher',[[{id:aid,name:'Class',teaching_members:[{student_id:uid,username:'student01'}]}]]);
 assert.equal((await f.run('classrooms')).body.classrooms[0].teaching_members[0].username,'student01');assert.match(f.calls[0].path,/teaching_members\(student_id,username\)/);
 const g=fixture('teacher',[[{id:aid,classroom_id:eid,published_snapshot:course()}],[{teacher_id:uid,name:'Class'}],[{student_id:uid,lesson_id:'l1',event_type:'quiz',active_seconds:0,correct:true,created_at:'2026-11-03'}],[{student_id:uid,username:'student01'}]]);
 const result=await g.run('analytics');assert.deepEqual(result.body.rows,[{assignment_id:aid,student_id:uid,username:'student01',classroom_name:'Class',course_title:'Course',completed_lessons:0,total_lessons:1,active_seconds:0,correct_attempts:1,quiz_attempts:1,last_active:'2026-11-03'}]);
});
test('draft outline can be saved, but publishing requires every lesson body',()=>{
 const c=course();c.lessons[0].body='';assert.equal(validateCourse(c).lessons[0].body,'');assert.throws(()=>validateCourse(c,true),/invalid_request/);
});
test('students endpoint returns only id and username for role student, sorted',async()=>{
 const adminPath=(p)=>p.startsWith('/auth/v1/admin/users');
 const users=[{app_metadata:{role:'student'},user_metadata:{username:'b_student'},id:uid},{app_metadata:{role:'student'},user_metadata:{username:'a_student'},id:aid},{app_metadata:{role:'teacher'},user_metadata:{username:'teacher01'},id:eid}];
 const f=fixture('teacher',[{users}]);
 const r=await f.run('students');assert.equal(r.status,200);assert.deepEqual(r.body,{students:[{id:aid,username:'a_student'},{id:uid,username:'b_student'}]});assert.ok(adminPath(f.calls[0].path));assert.equal(f.calls[0].admin,true);
});
test('students endpoint rejects non-teacher',async()=>{
 const f=fixture('student');assert.equal((await f.run('students')).status,403);
});
test('lessonSlides splits long body into at least 5 pages, capped at 30',()=>{
 const long=Array.from({length:40},(_,i)=>`Paragraph ${i+1}. `+'内容内容内容内容内容内容内容内容内容内容内容内容内容内容。').join('\n\n');
 const slides=lessonSlides(long);assert.ok(slides.length>=5,`expected >=5 slides, got ${slides.length}`);assert.ok(slides.length<=30);assert.ok(slides.every(s=>typeof s.heading==='string'&&typeof s.bullets==='string'));
});
test('long paragraphs split and compress into short bullets',()=>{
 const one=Array.from({length:12},(_,i)=>`This is sentence ${i+1} about decentralized applications and their behavior.`).join(' ');
 const slides=lessonSlides(one);assert.ok(slides.length>=1,`expected >=1, got ${slides.length}`);
 for(const s of slides){assert.ok(s.heading.length<=27,`heading too long: ${s.heading.length}`);for(const b of String(s.bullets||'').split('\n').filter(Boolean))assert.ok(b.length<=66,`bullet too long: ${b.length} in "${b}"`);}
 const huge=Array.from({length:200},(_,i)=>`第${i+1}句讲的是第${i+1}个要点，继续展开说明。`).join('');
 assert.ok(lessonSlides(huge).length<=30);
});
test('markdown numbered items and colon headings produce clean titles',()=>{
	 const body='1. **Transaction Creation**: The DApp packages the vote data.\n2. **Broadcast**: It sends to the network.\n3. **Confirmation**: Nodes validate the transaction.';
	 const slides=lessonSlides(body);assert.ok(slides.length>=1,`expected >=1, got ${slides.length}`);
	 const headings=slides.map(s=>s.heading);
	 assert.ok(headings.some(h=>h.startsWith('Transaction Creation')),`heading not found in ${headings}`);
	});
test('lessonSlides returns single page for short body',()=>{
 const slides=lessonSlides('');assert.equal(slides.length,1);assert.equal(typeof slides[0].heading,'string');
 const s2=lessonSlides('Short text.');assert.equal(s2.length,1);
});
test('illustration scene and labels are chosen automatically from content',()=>{
 const t=ensureScene({title:'流程',body:'第一步：了解需求。随后设计接口。里程碑是能交付。',scene:'flow',sceneItems:[]});
 assert.equal(t.scene,'timeline');assert.ok(t.sceneItems.length>=2);
 const c=ensureScene({title:'取舍',body:'对比两种方案。方案A优点多，方案B缺点明显。',scene:'flow',sceneItems:['开始','结果']});
 assert.equal(c.scene,'compare');assert.ok(c.sceneItems.length>=2);
 assert.equal(autoScene({title:'',body:''}).scene,'flow');
});
test('AI-provided scene and labels are preserved',()=>{
 const lesson={title:'X',body:'some text',scene:'compare',sceneItems:['Keep','These']};
 assert.equal(ensureScene(lesson),lesson);
});
test('slide illustrations differ per page and stay escaped',()=>{
 const arts=Array.from({length:30},(_,i)=>slideArt('Title',['One','Two'],i));
 assert.ok(arts.every(a=>/<svg/.test(a)));assert.equal(new Set(arts).size,30);
 assert.doesNotMatch(slideArt('<img onerror=x>',[],0),/<img/);
});
test('SQL serializes heartbeat receipts and caps first/rapid/retried events at the DB boundary',async()=>{
 const sql=await readFile(new URL('../supabase/migrations/202611030003_teacher_courses.sql',import.meta.url),'utf8');
 const trigger=sql.slice(sql.indexOf('create function public.teaching_grade_event()'),sql.indexOf('create trigger teaching_grade_event'));
 assert.match(trigger,/pg_advisory_xact_lock\(pg_catalog.hashtextextended\(new.student_id::text \|\| ':' \|\| new.assignment_id::text,0\)\)/);
 assert.match(trigger,/select max\(created_at\).*student_id=new.student_id and assignment_id=new.assignment_id/);
 assert.match(trigger,/received_at:=pg_catalog.clock_timestamp\(\)/);
 assert.match(trigger,/least\(30,greatest\(0,new.active_seconds\),greatest\(0,floor\(extract\(epoch from \(received_at-last_event_at\)\)\)::integer\)\) else 0 end/);
 assert.ok(trigger.indexOf('return null;')<trigger.indexOf('received_at:=')&&trigger.indexOf('return null;')<trigger.indexOf('new.correct:='));
 assert.match(trigger,/new.created_at:=received_at/);
});
test('a teacher deletes an unassigned course and the server checks usage first',async()=>{
 const f=fixture('teacher',[[{teacher_id:uid}],[],[]]);
 const r=await f.run('courses',undefined,'DELETE','&id='+aid);
 assert.equal(r.status,200);assert.equal(r.body.ok,true);
 assert.match(f.calls[1].path,/teaching_assignments\?course_id=eq\./);
 assert.equal(f.calls[2].method,'DELETE');assert.match(f.calls[2].path,/teaching_courses\?id=eq\./);
});
test('a course assigned to a class is not deleted',async()=>{
 const f=fixture('teacher',[[{teacher_id:uid}],[{id:eid}]]);
 const r=await f.run('courses',undefined,'DELETE','&id='+aid);
 assert.equal(r.status,409);assert.equal(r.body.error,'course_in_use');
 assert.equal(f.calls.some(c=>c.method==='DELETE'),false);
});
test('lessons may store structured slides with per-slide bounded art',()=>{
 const slides=[{heading:'Start',bullets:['One'],art:{scene:'flow',items:['A','B']}}];
 const c=course();c.lessons[0]={...c.lessons[0],body:'',slides};
 assert.deepEqual(validateCourse(c,true).lessons[0].slides,slides);
 const bad=course();bad.lessons[0]={...bad.lessons[0],body:'',slides:[{heading:'Start',bullets:['One'],art:{scene:'script',items:['A','B']}}]};
 assert.throws(()=>validateCourse(bad),/invalid_request/);
 const empty=course();empty.lessons[0]={...empty.lessons[0],body:'',slides:[{heading:'Start',bullets:['One'],art:{scene:'flow',items:[]}}]};
 assert.throws(()=>validateCourse(empty),/invalid_request/);
 const many=course();many.lessons[0]={...many.lessons[0],body:'',slides:Array.from({length:21},()=>({heading:'H',bullets:['B'],art:{scene:'flow',items:['A']}}))};
 assert.throws(()=>validateCourse(many),/invalid_request/);
 const over=course();over.lessons[0]={...over.lessons[0],body:'',slides:[{heading:'Start',bullets:['One'],art:{scene:'document',items:['A','B','C','D']}}]};
 assert.throws(()=>validateCourse(over),/invalid_request/);
});
test('teaching intent fields are validated when present and preserved on save',()=>{
 const lesson={id:'l1',title:'Lesson',objectives:['Explain A','Apply B'],misconceptions:['A is B. Correct: A is C.'],sourceNotes:['Course handout p.3'],body:'',scene:'flow',sceneItems:['A','B'],questions:[],slides:[{heading:'Start',concept:'One idea',bullets:['B'],script:['Say this'],notes:['Teacher note'],art:{scene:'flow',items:['A','B']}}]};
 const c=course();c.lessons[0]=lesson;
 const saved=validateCourse(c,true).lessons[0];
 for(const key of ['objectives','misconceptions','sourceNotes','slides'])assert.deepEqual(saved[key],lesson[key]);
 for(const strip of [l=>l.objectives=[],l=>l.objectives=['x'.repeat(121)],l=>l.misconceptions=['x'.repeat(301)],l=>l.sourceNotes='note',l=>l.slides[0].concept='',l=>l.slides[0].script=[],l=>l.slides[0].notes=[1],l=>l.slides[0].extra='x']){
  const bad=course();bad.lessons[0]=JSON.parse(JSON.stringify(saved));strip(bad.lessons[0]);assert.throws(()=>validateCourse(bad),/invalid_request/);
 }
 const optional=course();assert.equal('objectives'in validateCourse(optional).lessons[0],false);
});
test('the SQL boundary accepts structured slides and the shared scene vocabulary',async()=>{
 const sql=await readFile(new URL('../supabase/migrations/202611030004_teaching_slides.sql',import.meta.url),'utf8');
 assert.match(sql,/'id','title','body','slides','scene','sceneItems','questions'/);
 assert.match(sql,/art->>'scene' not in \('auto','flow'/);
 assert.match(sql,/jsonb_array_length\(sl->'bullets'\) not between 1 and 6/);
 assert.match(sql,/jsonb_array_length\(art->'items'\) not between 1 and 6/);
});
test('the SQL scene whitelist matches the shared vocabulary in both places',async()=>{
 const sql=await readFile(new URL('../supabase/migrations/202611030005_scene_vocabulary.sql',import.meta.url),'utf8');
 const lists=[...sql.matchAll(/not in \(('auto'(?:,'[a-z]+')+)\)/g)].map(m=>m[1].split(',').map(s=>s.replace(/'/g,'')));
 assert.equal(lists.length,2);
 for(const list of lists)assert.deepEqual([...list].sort(),[...SCENE_IDS].sort());
});
test('the SQL boundary rejects art that exceeds a template slot count',async()=>{
 const sql=await readFile(new URL('../supabase/migrations/202611030006_scene_capacity.sql',import.meta.url),'utf8');
 assert.match(sql,/v in \('compare','balance'\) and jsonb_array_length\(art->'items'\)=2/);
 assert.match(sql,/v in \('layers','chain','decision'\) and jsonb_array_length\(art->'items'\) between 2 and 4/);
 assert.match(sql,/v in \('document','database'\) and jsonb_array_length\(art->'items'\) between 2 and 3/);
});
test('the SQL boundary accepts optional teaching intent fields without weakening bounds',async()=>{
 const sql=await readFile(new URL('../supabase/migrations/202611030007_lesson_quality_fields.sql',import.meta.url),'utf8');
 assert.match(sql,/'objectives','misconceptions','sourceNotes','body','slides','scene','sceneItems','questions'/);
 assert.match(sql,/'heading','concept','bullets','script','notes','art'/);
 assert.match(sql,/jsonb_array_length\(l->'objectives'\) not between 1 and 5/);
 assert.match(sql,/jsonb_array_length\(l->'misconceptions'\) not between 1 and 5/);
 assert.match(sql,/jsonb_array_length\(sl->'script'\) not between 1 and 5/);
 assert.match(sql,/jsonb_array_length\(sl->'notes'\) not between 1 and 5/);
});
