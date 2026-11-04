import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import {once} from 'node:events';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {WebSocket,WebSocketServer} from 'ws';
import {attachDoubaoRealtime,sessionConfig,validClientEvent,interviewGreeting} from '../scripts/doubao-realtime.mjs';
import {createRealtimeInterview,interviewRoomHTML} from '../public/doubao-interview.js';
import {speechLanguage,interviewText} from '../public/interview-i18n.js';
import {interviewPersonas,getInterviewPersona} from '../public/interview-personas.js';

test('six personas map to distinct allowlisted voices and server-authored interview styles',()=>{
 assert.equal(interviewPersonas.length,6);assert.equal(new Set(interviewPersonas.map(p=>p.voice)).size,6);
 for(const p of interviewPersonas){
  const config=sessionConfig({persona:p.id,voice:'untrusted-voice',instructions:'untrusted-instructions'},{});
  assert.equal(config.session.audio.output.voice,p.voice);assert.ok(config.session.instructions.includes(p.style));assert.ok(!config.session.instructions.includes('untrusted-instructions'));
 }
 assert.equal(getInterviewPersona('unknown').id,'pressure-male');
 assert.match(getInterviewPersona('pressure-male').style,/证据/);assert.match(getInterviewPersona('gentle-female').style,/组织/);
});

test('speech language has two choices, interface translations and context reach the provider',()=>{
 assert.equal(speechLanguage('en'),'en');assert.equal(speechLanguage('zh-TW'),'zh');assert.equal(speechLanguage('zh-CN'),'zh');
 assert.equal(interviewText('面试设置','en'),'Interview setup');assert.equal(interviewText('面试设置','zh-TW'),'面試設定');
 assert.ok(!/[\u4e00-\u9fff]/.test(interviewRoomHTML('en')));
 const prompt=sessionConfig({language:'en',context:'Library booking project'},{}).session.instructions;
 assert.ok(prompt.includes('Library booking project'));assert.ok(prompt.includes('必须以此为主要面试素材'));assert.ok(prompt.includes('不要按固定问题数或轮数结束'));
 assert.match(interviewGreeting({language:'en',context:'Library booking project'}),/personal role/);
 assert.match(interviewGreeting({language:'zh',context:'图书预约'}),/已经收到你的项目背景/);
});

test('interview room is a separate focused page without settings or live transcript',async()=>{
 const html=interviewRoomHTML();
 assert.ok(html.includes('data-rt="camera"'));assert.ok(html.includes('data-rt="end"'));
 for(const forbidden of ['transcript','textarea','<form','data-rt="download"','data-rt="start"'])assert.ok(!html.includes(forbidden));
 const entry=await readFile(new URL('../public/interview-room.html',import.meta.url),'utf8');assert.ok(entry.includes('interview-room.js'));assert.ok(!entry.includes('app.js'));assert.ok(entry.includes('href="/styles.css"'));
 const css=await readFile(new URL('../public/interview-room.css',import.meta.url),'utf8');assert.ok(css.includes('background:var(--canvas)'));assert.ok(css.includes('color:var(--ink)'));assert.ok(!css.includes('#14151a'));
 assert.match(css,/\.ir-self\{position:absolute;left:22px;top:22px/);assert.ok(!css.includes('bottom:15px;right:15px'));
 const source=await readFile(new URL('../public/doubao-interview.js',import.meta.url),'utf8');assert.ok(source.includes("location.assign('/interview-room.html')"));assert.ok(!source.includes('scrollIntoView'));
});

test('preparation renders only setup, and direct room entry cannot start a paid session',async()=>{
 const saved={document:globalThis.document,window:globalThis.window,sessionStorage:globalThis.sessionStorage,history:globalThis.history};
 const elements=new Map(['start','download','result-reason','consent'].map(name=>[name,{checked:false,disabled:false,textContent:''}]));
 const root={innerHTML:'',querySelector:selector=>elements.get(selector.match(/"(.*?)"/)?.[1]),querySelectorAll:()=>[],addEventListener(){},removeEventListener(){}};
 globalThis.document={addEventListener(){},removeEventListener(){}};globalThis.window={addEventListener(){},removeEventListener(){}};
 globalThis.sessionStorage={getItem:()=>null,removeItem(){}};globalThis.history={replaceState(){}};
 try{
  const preparation=createRealtimeInterview();preparation.mount(root,{configured:true});
  assert.ok(!root.innerHTML.includes('name="rounds"'));assert.ok(!root.innerHTML.includes('目标轮数'));
  assert.ok(root.innerHTML.includes('name="persona"'));assert.ok(root.innerHTML.includes('AI 实时语音服务'));assert.ok(!root.innerHTML.includes('豆包实时语音服务'));
  assert.ok(root.innerHTML.includes('data-rt="settings"'));assert.ok(!root.innerHTML.includes('<video'));assert.ok(!root.innerHTML.includes('data-rt="transcript"'));assert.ok(!root.innerHTML.includes('data-rt="end"'));assert.equal(elements.get('start').disabled,true);preparation.cleanup();
  const english=createRealtimeInterview();english.mount(root,{configured:true,locale:'en'});assert.ok(!/[\u4e00-\u9fff]/.test(root.innerHTML));assert.ok(root.innerHTML.includes('value="en" selected'));assert.ok(root.innerHTML.includes('value="zh"'));assert.ok(!root.innerHTML.includes('value="zh-TW"'));english.cleanup();
  const room=createRealtimeInterview();await room.mountRoom(root);assert.ok(root.innerHTML.includes('尚未开始面试'));assert.match(elements.get('result-reason').textContent,/先完成面试准备/);room.cleanup();
 }finally{for(const [key,value]of Object.entries(saved)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});

test('Doubao uses fixed documented audio formats and bounded interview settings',()=>{
 const config=sessionConfig({role:'frontend',rounds:6,language:'en',context:'x'.repeat(4000)},{});
 assert.equal(config.session.model,'1.2.6.1');assert.equal(config.session.audio.input.format.rate,16000);assert.equal(config.session.audio.output.format.type,'pcm_s16le');
 assert.equal(config.session.audio.output.format.rate,24000);assert.match(config.session.instructions,/前端开发/);assert.match(config.session.instructions,/English/);assert.ok(config.session.instructions.length<3300);
 assert.equal(validClientEvent({type:'session.update'}),false);assert.equal(validClientEvent({type:'input_audio_buffer.append',audio:'abc!'}),false);
 assert.equal(validClientEvent({type:'input_audio_buffer.append',audio:Buffer.alloc(640).toString('base64')}),true);
 assert.equal(validClientEvent({type:'response.cancel'}),true);
});

test('browser code has no provider key and releases mic, camera, audio and connection',async()=>{
 const code=await readFile(new URL('../public/doubao-interview.js',import.meta.url),'utf8');
 assert.ok(!code.includes('X-Api-Key'));assert.ok(!code.includes('openspeech.bytedance.com'));
 for(const text of ['getTracks().forEach(t=>t.stop())','context?.close()','socket.close()','visibilitychange','input_audio_mute.commit','response.cancel'])assert.ok(code.includes(text));
 const worklet=await readFile(new URL('../public/realtime-pcm-worklet.js',import.meta.url),'utf8');assert.ok(worklet.includes('320'));assert.ok(worklet.includes('setInt16(j*2,n,true)'));
});

test('AudioWorklet emits 20ms little-endian int16 frames at both 48k and 44.1k input',async()=>{
 const code=await readFile(new URL('../public/realtime-pcm-worklet.js',import.meta.url),'utf8');
 for(const rate of [48000,44100]){
  let Processor;const packets=[];
  class Base {constructor(){this.port={postMessage:bytes=>packets.push(bytes)};}}
  vm.runInNewContext(code,{AudioWorkletProcessor:Base,sampleRate:rate,registerProcessor:(_name,processor)=>{Processor=processor;}});
  const processor=new Processor();
  for(let n=0;n<Math.ceil(rate/128);n++)processor.process([[new Float32Array(128).fill(-.5)]]);
  assert.ok(packets.length>=49&&packets.length<=50);assert.equal(packets[0].byteLength,640);
  assert.equal(new DataView(packets[0]).getInt16(0,true),-16383);
 }
});

test('relay refuses a call without explicit consent and never opens the provider connection',async t=>{
 const server=http.createServer();const relay=attachDoubaoRealtime(server,{env:{DOUBAO_REALTIME_API_KEY:'fixture'},endpoint:'ws://127.0.0.1:1'});
 server.listen(0,'127.0.0.1');await once(server,'listening');
 const port=/** @type {import('node:net').AddressInfo} */(server.address()).port;
 t.after(async()=>{for(const c of relay.clients)c.terminate();relay.close();await new Promise(resolve=>server.close(resolve));});
 const client=new WebSocket(`ws://127.0.0.1:${port}/api/realtime`,{origin:`http://127.0.0.1:${port}`});await once(client,'open');
 const rejected=once(client,'message');client.send(JSON.stringify({type:'forma.start',consent:false,settings:{}}));
 assert.equal(JSON.parse(String((await rejected)[0])).reason,'consent_required');await once(client,'close');
});

// No paid provider calls: a local WebSocket fixture verifies the full relay.
test('same-origin relay authenticates only upstream, gates consent and sanitizes events',async t=>{
 const provider=new WebSocketServer({port:0,host:'127.0.0.1'});await once(provider,'listening');
 const port=/** @type {import('node:net').AddressInfo} */(provider.address()).port;
 const server=http.createServer();const relay=attachDoubaoRealtime(server,{env:{DOUBAO_REALTIME_API_KEY:'fixture-not-a-real-key'},endpoint:`ws://127.0.0.1:${port}`,maxDurationMs:2000,handshakeMs:1000});
 server.listen(0,'127.0.0.1');await once(server,'listening');
 const localPort=/** @type {import('node:net').AddressInfo} */(server.address()).port;
 const origin=`http://127.0.0.1:${localPort}`;
 t.after(async()=>{for(const c of relay.clients)c.terminate();for(const c of provider.clients)c.terminate();relay.close();await new Promise(resolve=>server.close(resolve));await new Promise(resolve=>provider.close(resolve));});
 const denied=new WebSocket(`ws://127.0.0.1:${localPort}/api/realtime`,{origin:'http://evil.example'});
 denied.on('error',()=>{});const rejection=await once(denied,'unexpected-response');assert.equal(rejection[1].statusCode,403);rejection[1].resume();denied.terminate();
 let auth,session,upstreamAudio;const forwarded=[];
 provider.on('connection',(ws,req)=>{auth=req.headers['x-api-key'];ws.on('message',raw=>{const event=JSON.parse(String(raw));forwarded.push(event);if(event.type==='session.create'){session=event;ws.send(JSON.stringify({type:'session.created',session:{internal:'private metadata'}}));}if(event.type==='input_audio_buffer.append'){upstreamAudio=event;ws.send(JSON.stringify({type:'response.output_audio.delta',delta:Buffer.alloc(640).toString('base64')}));}});});
 const client=new WebSocket(`ws://127.0.0.1:${localPort}/api/realtime`,{origin});await once(client,'open');
 const created=once(client,'message');client.send(JSON.stringify({type:'forma.start',consent:true,settings:{language:'zh-CN'}}));
 assert.deepEqual(JSON.parse(String((await created)[0])),{type:'session.created'});assert.equal(auth,'fixture-not-a-real-key');assert.equal(session.session.model,'1.2.6.1');
 const audio=once(client,'message');client.send(JSON.stringify({type:'input_audio_buffer.append',audio:Buffer.alloc(640).toString('base64'),secret:'drop-me'}));
 assert.equal(JSON.parse(String((await audio)[0])).type,'response.output_audio.delta');assert.ok(!Object.hasOwn(upstreamAudio,'secret'));assert.ok(forwarded.some(e=>e.type==='speech_text_buffer.commit'));
 const closed=once(client,'close');client.send(JSON.stringify({type:'session.update',session:{instructions:'override'}}));await closed;assert.ok(!forwarded.some(e=>e.type==='session.update'));
});

 test('production authorization denies before upgrade and supports asynchronous checks',async t=>{
 const server=http.createServer();let permitted=false,checked=0;
 const relay=attachDoubaoRealtime(server,{env:{DOUBAO_REALTIME_API_KEY:'fixture'},authorize:async()=>{checked++;await Promise.resolve();return permitted;}});
 server.listen(0,'127.0.0.1');await once(server,'listening');
 const port=/** @type {import('node:net').AddressInfo} */(server.address()).port;
 t.after(async()=>{for(const c of relay.clients)c.terminate();relay.close();await new Promise(resolve=>server.close(resolve));});
 const denied=new WebSocket(`ws://127.0.0.1:${port}/api/realtime`);denied.on('error',()=>{});
 const [,response]=await once(denied,'unexpected-response');assert.equal(response.statusCode,403);response.resume();denied.terminate();
 permitted=true;const client=new WebSocket(`ws://127.0.0.1:${port}/api/realtime`);await once(client,'open');
 const message=once(client,'message');client.send(JSON.stringify({type:'forma.start',consent:false,settings:{}}));assert.equal(JSON.parse(String((await message)[0])).reason,'consent_required');await once(client,'close');assert.equal(checked,2);
});
