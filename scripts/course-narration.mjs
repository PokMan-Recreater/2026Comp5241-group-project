import {createHash} from 'node:crypto';
import WebSocket from 'ws';
import {narrationScriptText} from '../public/courseware-contract.js';
export const narrationLanguage=language=>language==='en'?'en':'zh-CN';
export const narrationText=narrationScriptText;
export const narrationKey=(slide,language)=>createHash('sha256').update(JSON.stringify([narrationLanguage(language),'zh_female_sophie_uranus_bigtts','pcm24000-v1',narrationText(slide)])).digest('hex');
export function narrationWav(pcm){const header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(pcm.length+36,4);header.write('WAVEfmt ',8);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(24000,24);header.writeUInt32LE(48000,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);return Buffer.concat([header,pcm]);}
export function synthesizeNarration(text,language,key,{Socket=WebSocket}={}){
 return new Promise((resolve,reject)=>{
  const chunks=[];let done=false,size=0;
  const ws=new Socket('wss://openspeech.bytedance.com/api/v3/duplex/realtime/dialogue',{headers:{'X-Api-Key':key},handshakeTimeout:15000});
  const timeout=setTimeout(()=>finish(Error('narration_timeout')),45000);
  function finish(error){if(done)return;done=true;clearTimeout(timeout);ws.close();if(error)reject(error);else resolve(Buffer.concat(chunks));}
  const send=event=>ws.send(JSON.stringify(event));
  ws.on('open',()=>send({type:'session.create',session:{model:'1.2.6.1',instructions:language==='en'?'Read the supplied educational narration verbatim in clear, calm, natural English. No added greeting or commentary.':'请用清晰、从容的普通话教师声音，逐字朗读指定的课程讲解，不添加问候、解释或对话。',audio:{input:{format:{type:'pcm',rate:16000}},output:{format:{type:'pcm_s16le',rate:24000},voice:'zh_female_sophie_uranus_bigtts',speed:0,loudness:0}}}}));
  ws.on('message',raw=>{let event;try{event=JSON.parse(raw.toString());}catch{return finish(Error('narration_provider_failed'));}
   if(event.type==='session.created'){send({type:'input_audio_mute.commit'});send({type:'speech_text_buffer.commit',text});}
   if(event.type==='response.output_audio.delta'&&typeof event.delta==='string'){const bytes=Buffer.from(event.delta,'base64');size+=bytes.length;if(size>2000000)return finish(Error('narration_too_long'));chunks.push(bytes);}
   if(event.type==='response.output_audio.done'){if(size<2000)return finish(Error('narration_provider_failed'));send({type:'session.close'});finish();}
   if(event.type==='error')finish(Error('narration_provider_failed'));
  });
  ws.on('unexpected-response',(_request,response)=>{response.resume();finish(Error('narration_provider_failed'));});
  ws.on('error',()=>finish(Error('narration_provider_failed')));
  ws.on('close',()=>{if(!done)finish(Error('narration_provider_failed'));});
 });
}
