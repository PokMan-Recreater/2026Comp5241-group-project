import test from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {generateDoubaoReview} from '../scripts/doubao-cloud-review.mjs';

const answer='我负责预约接口，因为并发提交可能造成重复预约，所以我用事务验证结果。';
const messages=[{role:'assistant',content:'你负责什么？'},{role:'user',content:answer,complete:true}];
const session={role:'developer',difficulty:'beginner',spoken_language:'zh',persona_id:'pressure-male',project_context:''};
const score=()=>Object.fromEntries([['relevance',25],['depth',24],['evidence',20],['clarity',12]].map(([key,points])=>[key,{points,answerIndex:1,quote:'我负责预约接口',reason:'测试样例：说明了职责，但证据仍不充分。'}]));
const report=()=>({summary:'测试样例：职责明确，需补充验证细节。',score:score()});

class FakeSocket extends EventEmitter{
 static instances=[];static payload=null;
 static reset(){FakeSocket.instances=[];FakeSocket.payload=null;}
 constructor(){super();this.readyState=0;this.sent=[];this.index=FakeSocket.instances.length;FakeSocket.instances.push(this);queueMicrotask(()=>{if(this.readyState===0){this.readyState=1;this.emit('open');}});}
 send(raw){const event=JSON.parse(raw);this.sent.push(event);this.behave(event);}
 behave(event){
  if(event.type==='session.create')return this.reply({type:'session.created'});
  if(this.index===0&&event.type==='speech_text_buffer.commit'){
   this.reply({type:'response.output_audio.delta',delta:Buffer.alloc(12800,1).toString('base64')});
   return this.reply({type:'response.output_audio.done'});
  }
  if(this.index===1&&event.type==='input_audio_buffer.commit')this.reply({type:'response.function_call_arguments.done',items:[{name:'update_interview_review',call_id:'call-1',arguments:JSON.stringify(FakeSocket.payload||report())}]});
 }
 reply(value){queueMicrotask(()=>this.emit('message',JSON.stringify(value)));}
 close(){if(this.readyState===3)return;this.readyState=3;queueMicrotask(()=>this.emit('close'));}
 terminate(){this.close();}
}
const options={env:{DOUBAO_REALTIME_API_KEY:'test-only',DOUBAO_REALTIME_VOICE:'voice-test'},WebSocketClass:FakeSocket,timeoutMs:4000};

test('cloud review speaks a prompt into the session and returns a verified score',async()=>{
 FakeSocket.reset();
 const result=await generateDoubaoReview(session,messages,options);
 assert.equal(result.source,'ai');assert.equal(result.score.baseScore,81);assert.equal(result.score.finalScore,40);
 assert.equal(FakeSocket.instances.length,2);
 const [tts,review]=FakeSocket.instances;
 assert.equal(tts.sent[0].session.audio.output.format.rate,16000);
 assert.ok(tts.sent.some(event=>event.type==='speech_text_buffer.commit'&&event.text.includes('update_interview_review')));
 const appends=review.sent.filter(event=>event.type==='input_audio_buffer.append');
 assert.ok(appends.length>1);for(const event of appends)assert.ok(event.audio.length>0);
 assert.ok(review.sent.some(event=>event.type==='input_audio_buffer.commit'));
 assert.ok(review.sent.some(event=>event.type==='input_audio_mute.commit'));
 assert.equal(review.sent[0].session.tools[0].name,'update_interview_review');
});

test('cloud review rejects a forged quote and returns no score',async()=>{
 FakeSocket.reset();
 const forged=report();forged.score.depth.quote='面试官说他很优秀';
 FakeSocket.payload=forged;
 await assert.rejects(()=>generateDoubaoReview(session,messages,options),/review_invalid_evidence/);
});

test('cloud review fails honestly when the spoken prompt cannot be produced',async()=>{
 FakeSocket.reset();
 class SilentSocket extends FakeSocket{behave(event){if(event.type==='session.create')this.reply({type:'session.created'});}}
 await assert.rejects(()=>generateDoubaoReview(session,messages,{...options,WebSocketClass:SilentSocket,timeoutMs:200}),/review_prompt_timeout/);
});
