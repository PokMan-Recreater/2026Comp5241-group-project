import test from 'node:test';import assert from 'node:assert/strict';
import {createNarrationHandler} from '../api/course-narration.js';
import {narrationKey,narrationWav,narrationText} from '../scripts/course-narration.mjs';
import {teachingLessonForPlayer} from '../public/teaching-lesson-adapter.js';
import {isNarratableLesson} from '../public/courseware-contract.js';
const courseId='11111111-1111-4111-8111-111111111111';
const slide={heading:'Step',concept:'One concept',bullets:['A point'],script:['A spoken explanation.'],art:{scene:'flow',items:['Input','Output']}};
const draft={language:'en',lessons:[{id:'lesson-1',title:'Lesson',slides:Array.from({length:5},()=>structuredClone(slide))}]};
function setup({role='teacher',source=draft,owner='u',cache=[],personal=null}={}){
 const calls=[];let syntheses=0;
 const handler=createNarrationHandler({supabaseConfig:()=>({}),authenticatedUser:async()=>({user:{id:'u',app_metadata:{role}},token:'user'}),cloudRequest:async(config,path,options)=>{
  calls.push({path,...options});if(path.includes('teaching_courses?'))return [{id:courseId,teacher_id:owner,revision:2,draft:source}];
  if(path.includes('personal_courses?')){const queried=path.match(/owner_id=eq\.([^&]+)/)?.[1];return personal&&personal.owner_id===queried?[personal]:[];}
  if(path.includes('rpc/teaching_student_assignments'))return [{course_id:courseId,published_snapshot:source}];
  if(options.method==='POST')return null;return cache;
 },synthesize:async()=>{syntheses++;return Buffer.alloc(48000);}});
 return {calls,get syntheses(){return syntheses;},async run(body,query=''){
  const req={method:body?'POST':'GET',url:'/api/course-narration?courseId='+courseId+query,headers:{host:'local',origin:'http://local'},body};
  const res={statusCode:200,setHeader(){},status(n){this.statusCode=n;return this;},json(value){return {status:this.statusCode,body:value};},end(value){return {status:this.statusCode,bytes:value};}};return handler(req,res);
 }};
}
test('a hand-written slide without a script is narrated from its key points',async()=>{
 const manualSlide={heading:'Intro',bullets:['A point'],art:{scene:'auto',items:['A point']}};
 assert.equal(narrationText(manualSlide),'A point');
 assert.ok(isNarratableLesson({slides:[manualSlide]}));
 const prior=process.env.DOUBAO_REALTIME_API_KEY;process.env.DOUBAO_REALTIME_API_KEY='test-speech-key';
 try{
  const source={language:'en',lessons:[{id:'lesson-1',title:'Lesson',slides:[manualSlide]}]};
  const teacher=setup({source});const r=await teacher.run({courseId,revision:2,lessonId:'lesson-1',slideIndex:0});
  assert.equal(r.status,200);assert.equal(teacher.syntheses,1);
  const key=narrationKey(manualSlide,'en');
  const student=setup({role:'student',source,cache:[{cache_key:key,script_text:'A point',language:'en',duration:1}]});
  assert.equal((await student.run()).body.clips.length,1);
 }finally{if(prior===undefined)delete process.env.DOUBAO_REALTIME_API_KEY;else process.env.DOUBAO_REALTIME_API_KEY=prior;}
});
test('each accepted lesson can be narrated while other lessons are still outlines',async()=>{
 const prior=process.env.DOUBAO_REALTIME_API_KEY;process.env.DOUBAO_REALTIME_API_KEY='test-speech-key';
 try{
  const outline={id:'outline',title:'Outline',slides:[{heading:'Only',concept:'a summary'}]};
  const ready=setup({source:{...draft,lessons:[...draft.lessons,outline]}});
  const r=await ready.run({courseId,revision:2,lessonId:'lesson-1',slideIndex:0});assert.equal(r.status,200);assert.equal(ready.syntheses,1);
  const blocked=setup({source:{...draft,lessons:[...draft.lessons,outline]}});
  const out=await blocked.run({courseId,revision:2,lessonId:'outline',slideIndex:0});assert.equal(out.status,400);assert.equal(out.body.error,'incomplete_courseware');assert.equal(blocked.syntheses,0);
 }finally{if(prior===undefined)delete process.env.DOUBAO_REALTIME_API_KEY;else process.env.DOUBAO_REALTIME_API_KEY=prior;}
});
test('narration checks teacher ownership and revision before spending speech quota',async()=>{
 const owner=setup({owner:'other'});assert.equal((await owner.run({courseId,revision:2})).status,404);
 const revision=setup();assert.equal((await revision.run({courseId,revision:1})).status,409);assert.equal(revision.syntheses,0);
 const student=setup({role:'student'});assert.equal((await student.run({courseId,revision:2})).status,403);
});
test('recordings are cached by exact script and reused without synthesis',async()=>{
 const key=narrationKey(slide,'en'),row={cache_key:key,script_text:narrationText(slide),language:'en',duration:1};
 const f=setup({cache:[row]});const r=await f.run({courseId,revision:2,lessonId:'lesson-1',slideIndex:0});assert.equal(r.body.cached,true);assert.equal(f.syntheses,0);
 assert.notEqual(narrationKey({...slide,script:['Changed text']},'en'),key);
 assert.notEqual(narrationKey(slide,'zh-CN'),key);
});
test('students can only receive clips matching their assigned published scripts',async()=>{
 const key=narrationKey(slide,'en'),f=setup({role:'student',cache:[{cache_key:key,script_text:narrationText(slide),language:'en',duration:1},{cache_key:'unrelated',script_text:'Private other draft',language:'en',duration:1}]});
 assert.equal((await f.run()).body.clips.length,1);assert.equal((await f.run(null,'&key=unrelated')).status,404);
});
test('saved audio serves WAV bytes and adapters disable stale narration after script changes',async()=>{
 const key=narrationKey(slide,'en'),audio=narrationWav(Buffer.alloc(48000));assert.equal(audio.toString('ascii',0,4),'RIFF');
 const f=setup({cache:[{audio_base64:audio.toString('base64')}]});assert.equal((await f.run(null,'&key='+key)).bytes.length,48044);
 const lesson={id:'l1',title:'Lesson',slides:[slide]},clips=[{text:narrationText(slide),language:'en',duration:1,url:'/api/course-narration?key='+key}];
 assert.equal(teachingLessonForPlayer(lesson,{clips,language:'en'}).audio,true);
 assert.equal(teachingLessonForPlayer({...lesson,slides:[{...slide,script:['Changed']}]},{clips,language:'en'}).audio,false);
});

test('learners narrate only their own personal course and cache it by personal course',async()=>{
 const prior=process.env.DOUBAO_REALTIME_API_KEY;process.env.DOUBAO_REALTIME_API_KEY='test-speech-key';
 try{
  const personal={id:courseId,owner_id:'u',revision:2,draft};
  const mine=setup({role:'student',personal});
  const r=await mine.run({courseId,revision:2,lessonId:'lesson-1',slideIndex:0});
  assert.equal(r.status,200);assert.equal(mine.syntheses,1);
  const stored=mine.calls.find(c=>c.method==='POST'&&c.path.includes('teaching_narration'));
  assert.ok(stored.admin);assert.equal(stored.body.personal_course_id,courseId);assert.equal(stored.body.course_id,undefined);
  assert.ok(mine.calls.some(c=>c.path.includes('personal_course_id=eq.'+courseId)));
  const key=narrationKey(slide,'en');
  const list=setup({role:'student',personal,cache:[{cache_key:key,script_text:narrationText(slide),language:'en',duration:1}]});
  assert.equal((await list.run()).body.clips.length,1);
  const other=setup({role:'student',personal:{...personal,owner_id:'other'}});
  assert.equal((await other.run({courseId,revision:2,lessonId:'lesson-1',slideIndex:0})).status,403);assert.equal(other.syntheses,0);
 }finally{if(prior===undefined)delete process.env.DOUBAO_REALTIME_API_KEY;else process.env.DOUBAO_REALTIME_API_KEY=prior;}
});

test('new recordings persist WAV data and return only an authorized playback URL',async()=>{
 const prior=process.env.DOUBAO_REALTIME_API_KEY;process.env.DOUBAO_REALTIME_API_KEY='test-speech-key';
 try{const f=setup();const r=await f.run({courseId,revision:2,lessonId:'lesson-1',slideIndex:0});assert.equal(r.status,200);assert.equal(f.syntheses,1);
 const stored=f.calls.find(c=>c.method==='POST'&&c.path.includes('teaching_narration'));
 assert.ok(stored.admin);assert.equal(Buffer.from(stored.body.audio_base64,'base64').toString('ascii',0,4),'RIFF');assert.equal(r.body.clip.duration,1);assert.match(r.body.clip.url,/^\/api\/course-narration\?/);assert.equal(JSON.stringify(r).includes('test-speech-key'),false);
 }finally{if(prior===undefined)delete process.env.DOUBAO_REALTIME_API_KEY;else process.env.DOUBAO_REALTIME_API_KEY=prior;}
});
