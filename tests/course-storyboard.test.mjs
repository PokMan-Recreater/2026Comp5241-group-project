import test from 'node:test';
import assert from 'node:assert/strict';
import {validStoryboard,storyboardArt} from '../public/course-storyboard.js';
import {teachingLessonForPlayer,lessonForSave} from '../public/teaching-lesson-adapter.js';
import {normalizeLesson,fullLessonProblems} from '../scripts/course-ai-shape.mjs';
import {validateCourse} from '../scripts/teaching-support.mjs';
import {providerMessages} from '../scripts/course-ai-prompts.mjs';
import {validTeachingBrief} from '../scripts/course-storyboard-prompts.mjs';
const story=()=>({layout:'process',context:'Alice sends five tokens to Bob',actors:[{kind:'phone',label:'Alice’s wallet'},{kind:'network',label:'Peer nodes'},{kind:'database',label:'Shared ledger'}],events:[{from:0,to:1,action:'Sign and broadcast',result:'Peers receive a signed request',status:'normal'},{from:1,to:2,action:'Validate the transfer',result:'Valid transactions may enter a block',status:'success'}],takeaway:'The private key stays in the wallet'});
const lesson=()=>({id:'transfer',title:'Wallet transfer',objectives:['Explain a signature','Trace a transaction'],misconceptions:['A wallet sends its private key. Correction: only the signature is sent.'],body:'',slides:['Signing','Broadcast','Validation','Confirmation'].map(heading=>({heading,concept:'Trace this change',bullets:['Follow the signed transaction'],script:['Alice signs a five-token transfer. Peers validate the signature without receiving her private key.'],art:{scene:'flow',items:['Wallet','Peers','Ledger'],story:story()}})),questions:[{id:'q1',prompt:'What leaves the wallet?',options:['Signature','Private key'],correctIndex:0,explanation:'Only the signature is shared.'}]});
test('storyboards remain intact through normalization, course validation and editor save',()=>{
 const normalized=normalizeLesson(lesson());assert.deepEqual(fullLessonProblems(normalized),[]);const saved=lessonForSave(normalized),course=validateCourse({title:'Blockchain',description:'',language:'en',lessons:[saved]});assert.deepEqual(course.lessons[0].slides[0].art.story,story());
});
test('the same player now passes playback progress to authored drawing primitives',()=>{
 const normalized=normalizeLesson(lesson()),player=teachingLessonForPlayer(normalized,{language:'en'}),start=player.steps[0].art(0,'en'),end=player.steps[0].art(1,'en');assert.notEqual(start,end);assert.match(start,/<g opacity="0">/);assert.match(end,/<g opacity="1">/);assert.match(end,/Alice/);assert.match(end,/Sign and broadcast/);assert.doesNotMatch(end,/NaN|undefined|Infinity/);
});
test('untrusted drawing code, unknown actors and invalid event references are rejected',()=>{
 for(const mutate of [s=>{s.actors[0].kind='script';},s=>{s.events[0].to=99;},s=>{s.svg='<script/>';},s=>{s.events[0].status='url(javascript:evil)';}]){const s=story();mutate(s);assert.equal(validStoryboard(s),false);assert.equal(storyboardArt(s),'');}
 const s=story();s.actors[0].label='<script>alert(1)</script>';const svg=storyboardArt(s);assert.doesNotMatch(svg,/<script>/);assert.match(svg,/&lt;script&gt;/);
});
test('all three storyboard layouts render finite progressive frames and conversation limits prevent overflow',()=>{
 for(const layout of ['process','conversation','before-after']){const s=story();s.layout=layout;if(layout!=='process'){s.actors=s.actors.slice(0,2);s.events=s.events.map(e=>({...e,from:0,to:1,action:'Sign request',result:'Signature is shared'}));}assert(validStoryboard(s));for(const p of [0,.25,.5,.75,1]){const svg=storyboardArt(s,p,'zh-CN');assert.match(svg,/viewBox="0 0 720 360"/);assert.doesNotMatch(svg,/NaN|undefined|Infinity/);}}
 const s=story();s.layout='conversation';s.actors=s.actors.slice(0,2);s.events=[{from:0,to:1,action:'A'.repeat(37),result:'Reply',status:'normal'},{from:1,to:0,action:'Reply',result:'Done',status:'success'}];assert.equal(validStoryboard(s),false);
});
test('the teaching brief governs the authored production prompt without changing legacy requests',()=>{
 const brief={audience:'Beginners',goal:'Trace a signed transfer',case:'Alice sends five tokens to Bob',steps:['Sign','Broadcast','Verify','Confirm'].map(heading=>({heading,purpose:'Show an observable state change',layout:'process'}))};assert(validTeachingBrief(brief));assert(!validTeachingBrief({...brief,steps:[brief.steps[0]]}));
 const input={action:'lesson',language:'en',topic:'Blockchain',requirements:'',instruction:'',current:'',production:'storyboard-v1',teachingBrief:brief};const messages=providerMessages(input);assert.match(messages[0].content,/actual visual explanation/);assert.deepEqual(JSON.parse(messages[1].content).teachingBrief,brief);assert.doesNotMatch(providerMessages({...input,production:null})[0].content,/Production mode storyboard-v1/);
});
