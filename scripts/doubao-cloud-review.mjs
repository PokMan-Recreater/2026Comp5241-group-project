import {WebSocket} from 'ws';
import {reviewedSessionConfig,DOUBAO_URL} from './doubao-realtime.mjs';
import {interviewAnswers,validateInterviewReport} from '../public/interview-report.js';

// Dedicated background session: uses the existing authorised voice provider,
// emits no audio to the browser, and closes as soon as a verified report arrives.
const prompts={
 zh:'面试已经结束。请现在调用 update_interview_review 工具生成整场评分和复盘。',
 en:'The interview has ended. Call the update_interview_review tool now to produce the final score and review.'
};

function synthesizePrompt(language,{env,WebSocketClass,timeoutMs}){
 return new Promise((resolve,reject)=>{
  let done=false,ws;const chunks=[];
  const finish=(error,pcm)=>{
   if(done)return;done=true;clearTimeout(timer);
   if(ws?.readyState===WebSocket.OPEN){ws.send(JSON.stringify({type:'session.close'}));ws.close();}else ws?.terminate();
   if(error)reject(error);else resolve(pcm);
  };
  const timer=setTimeout(()=>finish(Error('review_prompt_timeout')),timeoutMs);
  try{ws=new WebSocketClass(DOUBAO_URL,{headers:{'X-Api-Key':env.DOUBAO_REALTIME_API_KEY},handshakeTimeout:10000,maxPayload:2*1024*1024});}catch{return finish(Error('review_provider_connection'));}
  ws.on('open',()=>ws.send(JSON.stringify({type:'session.create',session:{model:'1.2.6.1',instructions:language==='en'?'Read the supplied sentence verbatim in English. Add nothing else.':'请逐字朗读指定句子，不要添加其他内容。',audio:{input:{format:{type:'pcm',rate:16000}},output:{format:{type:'pcm_s16le',rate:16000},voice:env.DOUBAO_REALTIME_VOICE||'zh_female_sophie_uranus_bigtts',speed:0,loudness:0}}}})));
  ws.on('message',raw=>{
   let event;try{event=JSON.parse(String(raw));}catch{return finish(Error('review_provider_protocol'));}
   if(event.type==='session.created'){
    // The review model only replies to real input audio, so a short spoken
    // instruction is synthesized first; silence alone never starts a turn.
    ws.send(JSON.stringify({type:'input_audio_mute.commit'}));
    ws.send(JSON.stringify({type:'speech_text_buffer.commit',text:prompts[language==='en'?'en':'zh']}));
   }
   if(event.type==='response.output_audio.delta'&&typeof event.delta==='string')chunks.push(Buffer.from(event.delta,'base64'));
   if(event.type==='response.output_audio.done'){
    const pcm=Buffer.concat(chunks);
    if(pcm.length<6400)return finish(Error('review_prompt_unavailable'));
    finish(null,pcm);
   }
   if(event.type==='error')finish(Error('review_provider_error'));
  });
  ws.on('unexpected-response',(_req,response)=>{response.resume();finish(Error('review_provider_http_'+response.statusCode));});
  ws.on('error',()=>finish(Error('review_provider_connection')));
  ws.on('close',()=>{if(!done)finish(Error('review_provider_closed'));});
 });
}

export async function generateDoubaoReview(session,messages,{env=process.env,WebSocketClass=WebSocket,timeoutMs=50000}={}){
 const startedAt=Date.now();
 const pcm=await synthesizePrompt(session.spoken_language,{env,WebSocketClass,timeoutMs:Math.min(20000,timeoutMs)});
 const remaining=Math.max(5000,timeoutMs-(Date.now()-startedAt));
 return new Promise((resolve,reject)=>{
  let done=false,ws;
  const finish=(error,report)=>{if(done)return;done=true;clearTimeout(timer);if(ws?.readyState===WebSocket.OPEN){ws.send(JSON.stringify({type:'session.close'}));ws.close();}else ws?.terminate();if(error)reject(error);else resolve(report);};
  const timer=setTimeout(()=>finish(Error('review_provider_timeout')),remaining);
  const settings={role:session.role,level:session.difficulty,language:session.spoken_language,persona:session.persona_id,context:session.project_context};
  try{ws=new WebSocketClass(DOUBAO_URL,{headers:{'X-Api-Key':env.DOUBAO_REALTIME_API_KEY},handshakeTimeout:10000,maxPayload:2*1024*1024});}catch{return finish(Error('review_provider_connection'));}
  ws.on('open',()=>ws.send(JSON.stringify(reviewedSessionConfig(settings,env,interviewAnswers(messages)))));
  ws.on('message',raw=>{
   let event;try{event=JSON.parse(String(raw));}catch{return finish(Error('review_provider_protocol'));}
   if(event.type==='session.created'){
    try{
     for(let i=0;i<pcm.length;i+=3200)ws.send(JSON.stringify({type:'input_audio_buffer.append',audio:pcm.subarray(i,i+3200).toString('base64')}));
     ws.send(JSON.stringify({type:'input_audio_buffer.commit'}));ws.send(JSON.stringify({type:'input_audio_mute.commit'}));
    }catch{return finish(Error('review_provider_connection'));}
   }
   if(event.type==='response.function_call_arguments.done'){
    for(const item of Array.isArray(event.items)?event.items:[event])if(item.name==='update_interview_review'){
     try{if(typeof item.arguments!=='string'||item.arguments.length>30000)throw Error();const report=validateInterviewReport(JSON.parse(item.arguments),messages,session.persona_id);if(!report.score)throw Error();return finish(null,report);}catch{return finish(Error('review_invalid_evidence'));}
    }
   }
   if(event.type==='error')finish(Error('review_provider_error'));
  });
  ws.on('unexpected-response',(_req,response)=>{response.resume();finish(Error('review_provider_http_'+response.statusCode));});
  ws.on('error',()=>finish(Error('review_provider_connection')));ws.on('close',()=>{if(!done)finish(Error('review_provider_closed'));});
 });
}
