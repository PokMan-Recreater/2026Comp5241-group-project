import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {once} from 'node:events';
import {WebSocket,WebSocketServer} from 'ws';
import {localInterviewReport,validateInterviewReport,validateInterviewScore,interviewReportHTML,interviewReviewTool} from '../public/interview-report.js';
import {attachDoubaoRealtime,liveSessionConfig,reviewedSessionConfig} from '../scripts/doubao-realtime.mjs';

test('live questions have no review tool or scoring schema; grading is enabled only by end configuration',()=>{
 const live=liveSessionConfig({role:'frontend',language:'en'},{});
 assert.ok(!live.session.tools);assert.ok(!JSON.stringify(live).includes('update_interview_review'));assert.ok(!JSON.stringify(live).includes('baseScore'));
 const end=reviewedSessionConfig({role:'frontend',language:'en'},{},messages.filter(m=>m.role==='user'));
 assert.equal(end.session.tools[0].name,'update_interview_review');assert.ok(end.session.instructions.includes('面试现在已经结束'));assert.ok(end.session.instructions.includes(answer));
});

const answer='我负责预约接口，因为并发提交可能造成重复预约，所以我用事务验证结果。';
const messages=[{role:'assistant',content:'你负责什么？'},{role:'user',content:answer,complete:true}];
const score=()=>Object.fromEntries([['relevance',25],['depth',24],['evidence',20],['clarity',12]].map(([key,points])=>[key,{points,answerIndex:1,quote:'我负责预约接口',reason:'测试样例：说明了职责，但证据仍不充分。'}]));
const review=()=>({summary:'测试样例：职责明确，需补充验证细节。',strengths:[{answerIndex:1,quote:'我负责预约接口',comment:'测试样例：个人职责清楚。'}],improvements:[{answerIndex:1,quote:'用事务验证结果',comment:'测试样例：说明具体测试方法。'}],rewrite:{answerIndex:1,original:answer,improved:'我负责预约接口。考虑到并发提交的重复预约风险，我采用事务处理；验证方法为[请补充实际方法]。'},nextSteps:['补充实际的并发测试过程。'],score:score()});

test('AI feedback and every scoring dimension must cite actual candidate evidence',()=>{
 const report=validateInterviewReport(review(),messages,'pressure-male');assert.equal(report.source,'ai');assert.equal(report.score.baseScore,81);assert.equal(report.score.finalScore,40);
 const forged=review();forged.strengths[0].quote='我将性能提升了99%';assert.throws(()=>validateInterviewReport(forged,messages),/unmatched_evidence/);
 const forgedScore=score();forgedScore.depth.quote='面试官说他很优秀';assert.throws(()=>validateInterviewScore(forgedScore,messages),/invalid_score_evidence/);
 const tooHigh=score();tooHigh.clarity.points=16;assert.throws(()=>validateInterviewScore(tooHigh,messages),/invalid_score_evidence/);
 const fakeRewrite=review();fakeRewrite.rewrite.original='不是用户的回答';assert.throws(()=>validateInterviewReport(fakeRewrite,messages),/invalid_rewrite/);
});

test('a verified score-only report stays usable and derives grounded evidence',()=>{
 const concise={summary:'测试样例：已核对评分引用。',score:score()};
 const report=validateInterviewReport(concise,messages,'pressure-male');
 assert.equal(report.source,'ai');assert.equal(report.score.finalScore,40);assert.equal(report.rewrite,null);assert.deepEqual(report.nextSteps,[]);
 assert.equal(report.strengths.length,4);assert.equal(report.improvements.length,0);
 for(const item of report.strengths){assert.ok(answer.includes(item.quote));assert.ok(item.comment.length>0);}
 const html=interviewReportHTML(report);assert.ok(html.includes('40<small> / 100'));
 assert.ok(!html.includes('一个回答的改写示例'));assert.ok(!html.includes('下一步练习'));
});

test('voice gender cannot change scoring; small disclosed style offsets never change the common base',()=>{
 const full=[{role:'user',content:answer.repeat(6),complete:true}];
 const strict=validateInterviewScore(score(),full,'pressure-male'),strictFemale=validateInterviewScore(score(),full,'pressure-female'),gentle=validateInterviewScore(score(),full,'gentle-female');
 assert.equal(strict.baseScore,81);assert.equal(strict.finalScore,79);assert.equal(strictFemale.finalScore,strict.finalScore);assert.equal(gentle.finalScore,83);
 assert.equal(validateInterviewScore(score(),messages).confidence,'limited');
 assert.throws(()=>validateInterviewScore(score(),[{role:'user',content:answer,complete:false}]));
});

test('local fallback is explicitly unscored, safe to render, and ignores unfinished speech',()=>{
 const local=localInterviewReport(messages);assert.equal(local.source,'local');assert.ok(!local.score);assert.equal(localInterviewReport([{role:'user',content:'未完成',complete:false}]),null);
 const html=interviewReportHTML({...local,summary:'<script>alert(1)</script>'});assert.ok(!html.includes('<script>'));assert.ok(html.includes('非 AI 评价'));assert.ok(html.includes('不编造评分'));
 assert.ok(interviewReviewTool().parameters.required.includes('score'));
});

async function fixture(t,maxDurationMs=3000){
 const provider=new WebSocketServer({port:0,host:'127.0.0.1'});await once(provider,'listening');
 const server=http.createServer();const relay=attachDoubaoRealtime(server,{env:{DOUBAO_REALTIME_API_KEY:'test-only'},endpoint:`ws://127.0.0.1:${provider.address().port}`,maxDurationMs,handshakeMs:1000});
 server.listen(0,'127.0.0.1');await once(server,'listening');const port=server.address().port;
 t.after(async()=>{for(const c of relay.clients)c.terminate();for(const c of provider.clients)c.terminate();relay.close();await new Promise(resolve=>server.close(resolve));await new Promise(resolve=>provider.close(resolve));});
 const client=new WebSocket(`ws://127.0.0.1:${port}/api/realtime`,{origin:`http://127.0.0.1:${port}`});const events=[];client.on('message',raw=>events.push(JSON.parse(String(raw))));
 return {provider,client,events};
}

test('ending delivers verified AI review and score, then a closing message before disconnecting',async t=>{
 const {provider,client,events}=await fixture(t);let greeted=false,reviewEnabled=false;
 client.on('message',raw=>{if(JSON.parse(String(raw)).type==='conversation.item.input_audio_transcription.completed')client.send(JSON.stringify({type:'forma.finish'}));});
 provider.on('connection',ws=>ws.on('message',raw=>{
  const event=JSON.parse(String(raw));
  if(event.type==='session.create'){assert.ok(!event.session.tools);ws.send(JSON.stringify({type:'session.created'}));}
  if(event.type==='speech_text_buffer.commit'&&!greeted){greeted=true;for(const data of [{type:'conversation.item.input_audio_transcription.started'},{type:'conversation.item.input_audio_transcription.delta',delta:answer},{type:'conversation.item.input_audio_transcription.completed'}])ws.send(JSON.stringify(data));}
  if(event.type==='session.update'&&event.session.tools){reviewEnabled=true;ws.send(JSON.stringify({type:'session.updated'}));}
  if(event.type==='input_audio_buffer.commit'&&reviewEnabled)ws.send(JSON.stringify({type:'response.function_call_arguments.done',items:[{name:'update_interview_review',call_id:'fixture-review',arguments:JSON.stringify(review())}]}));
  if(event.type==='speech_text_buffer.commit'&&greeted&&event.text.includes('复盘和评分')){ws.send(JSON.stringify({type:'response.output_audio.delta',delta:Buffer.alloc(100).toString('base64')}));ws.send(JSON.stringify({type:'response.output_audio.done'}));}
 }));
 await once(client,'open');client.send(JSON.stringify({type:'forma.start',consent:true,settings:{language:'zh',persona:'pressure-male'}}));await once(client,'close');
 assert.ok(events.some(e=>e.type==='forma.reviewing'));const result=events.find(e=>e.type==='forma.review');assert.equal(result.review.source,'ai');assert.equal(result.review.score.finalScore,40);
 assert.ok(events.findIndex(e=>e.type==='forma.closing')<events.findIndex(e=>e.type==='forma.closed'));
 assert.equal(events.at(-1).reason,'review_complete');
});

test('time limit warns first and preserves an honest local report if AI did not return one',async t=>{
 const {provider,client,events}=await fixture(t,800);
 provider.on('connection',ws=>ws.on('message',raw=>{const e=JSON.parse(String(raw));if(e.type==='session.create'){ws.send(JSON.stringify({type:'session.created'}));ws.send(JSON.stringify({type:'conversation.item.input_audio_transcription.completed',text:answer}));}}));
 await once(client,'open');client.send(JSON.stringify({type:'forma.start',consent:true,settings:{language:'zh'}}));await once(client,'close');
 assert.ok(events.some(e=>e.type==='forma.time_warning'));assert.ok(events.some(e=>e.type==='forma.reviewing'));assert.equal(events.find(e=>e.type==='forma.review').review.source,'local');assert.equal(events.at(-1).reason,'time_limit');
});
