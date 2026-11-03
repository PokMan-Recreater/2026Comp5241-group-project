import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import WebSocket from 'ws';

// Authoring only. Credentials are never copied into public assets.
if(!process.env.DOUBAO_REALTIME_API_KEY)process.loadEnvFile('.env.local');
const input=process.argv[2];
if(!input)throw new Error('Usage: node scripts/synthesize-course-narration.mjs manifest.json');
const items=JSON.parse(await readFile(input,'utf8'));
const key=process.env.DOUBAO_REALTIME_API_KEY;
if(!key)throw new Error('Speech service is not configured');
for(const item of items){
 const pcm=await new Promise((resolve,reject)=>{
  const chunks=[];let done=false;
  const ws=new WebSocket('wss://openspeech.bytedance.com/api/v3/duplex/realtime/dialogue',{headers:{'X-Api-Key':key},handshakeTimeout:15000});
  const timeout=setTimeout(()=>finish(new Error('Narration synthesis timed out')),45000);
  function finish(error){if(done)return;done=true;clearTimeout(timeout);ws.close();if(error)reject(error);else resolve(Buffer.concat(chunks));}
  const send=event=>ws.send(JSON.stringify(event));
  ws.on('open',()=>send({type:'session.create',session:{model:'1.2.6.1',instructions:item.lang==='en'?'Read the supplied educational narration verbatim in clear, calm, natural English. Use the voice of an experienced adult instructor. No added greeting or commentary.':'请用成熟、清晰、从容的普通话教师声音，逐字朗读指定的课程讲解，不添加问候、解释或对话。自然表达，不卖萌，不夸张。',audio:{input:{format:{type:'pcm',rate:16000}},output:{format:{type:'pcm_s16le',rate:24000},voice:item.voice||'zh_female_sophie_uranus_bigtts',speed:0,loudness:0}}}}));
  ws.on('message',raw=>{let event;try{event=JSON.parse(raw.toString());}catch{return finish(new Error('Invalid speech response'));}
   if(event.type==='session.created'){send({type:'input_audio_mute.commit'});send({type:'speech_text_buffer.commit',text:item.text});}
   if(event.type==='response.output_audio.delta'&&typeof event.delta==='string')chunks.push(Buffer.from(event.delta,'base64'));
   if(event.type==='response.output_audio.done'){if(chunks.reduce((n,x)=>n+x.length,0)<2000)return finish(new Error('No usable narration received'));send({type:'session.close'});finish();}
   if(event.type==='error'){const message=String(event.error?.message||event.message||event.error?.code||'Speech provider error').replaceAll(key,'[redacted]').slice(0,220);finish(new Error(message));}
  });
  ws.on('unexpected-response',(_request,response)=>{response.resume();finish(new Error(`Speech authentication failed (${response.statusCode})`));});
  ws.on('error',()=>finish(new Error('Speech connection failed')));
  ws.on('close',()=>{if(!done)finish(new Error('Speech connection ended before audio completed'));});
 });
 const out=path.resolve(item.output);await mkdir(path.dirname(out),{recursive:true});await writeFile(out,pcm);console.log(`${path.basename(out)}: ${(pcm.length/48000).toFixed(2)}s`);
}
