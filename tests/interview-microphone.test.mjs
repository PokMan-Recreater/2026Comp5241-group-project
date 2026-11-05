import test from 'node:test';
import assert from 'node:assert/strict';
import {createRealtimeInterview,microphoneErrorText} from '../public/doubao-interview.js';
import {interviewText} from '../public/interview-i18n.js';

test('permission, missing-device and busy-device errors give distinct actionable messages',()=>{
 assert.match(microphoneErrorText({name:'NotAllowedError'}),/网站设置/);
 assert.match(microphoneErrorText({name:'NotFoundError'}),/没有找到麦克风/);
 assert.match(microphoneErrorText({name:'NotReadableError'}),/其他应用/);
 assert.match(microphoneErrorText({name:'UnsupportedError'}),/HTTPS/);
 for(const name of ['NotAllowedError','NotFoundError','NotReadableError','UnsupportedError','Other'])assert.ok(!/[\u4e00-\u9fff]/.test(interviewText(microphoneErrorText({name}),'en')));
});
test('room waits for an explicit tap; a suspended audio context cannot suppress the permission request',async()=>{
 const keys=['window','document','navigator','sessionStorage','history','fetch'];
 const saved=Object.fromEntries(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 const elements=new Map(['connect','status','mute','elapsed','direction'].map(k=>[k,{disabled:true,hidden:false,textContent:''}]));let click,microphoneRequests=0;
 const root={innerHTML:'',addEventListener(type,handler){if(type==='click')click=handler;},removeEventListener(){},querySelector:selector=>elements.get(/data-rt="([^"]+)"/.exec(selector)?.[1])||null,querySelectorAll:()=>[]};
 const entry={settings:{role:'developer',level:'beginner',language:'zh',persona:'pressure-male',context:''},consent:true,uiLocale:'zh-CN',at:Date.now()};
 const fake={
  window:{addEventListener(){},removeEventListener(){},AudioContext:class{resume(){return new Promise(()=>{});}close(){return Promise.resolve();}}},
  document:{hidden:false,documentElement:{},addEventListener(){},removeEventListener(){}},
  navigator:{mediaDevices:{getUserMedia(){microphoneRequests++;return Promise.reject(Object.assign(Error('denied'),{name:'NotAllowedError'}));}}},
  sessionStorage:{getItem:()=>JSON.stringify(entry),removeItem(){}},history:{replaceState(){}},
  fetch:async url=>new Response(JSON.stringify(String(url).includes('realtime-status')?{available:true,configured:true,maxMinutes:4}:{user:{id:'fixture'}})),
 };
 for(const key of keys)Object.defineProperty(globalThis,key,{configurable:true,writable:true,value:fake[key]});
 const interview=createRealtimeInterview();
 try{
  await interview.mountRoom(root);assert.equal(microphoneRequests,0);assert.equal(elements.get('connect').disabled,false);assert.match(elements.get('status').textContent,/点击/);
  click({target:{closest:()=>({dataset:{rt:'connect'}})}});assert.equal(microphoneRequests,1,'request must begin in the tap handler, before waiting on AudioContext.resume');
  for(let i=0;i<8;i++)await Promise.resolve();
  assert.match(elements.get('status').textContent,/网站设置/);assert.equal(elements.get('connect').disabled,false);assert.equal(elements.get('connect').hidden,false);assert.ok(!root.innerHTML.includes('INTERVIEW COMPLETE'));
 }finally{interview.cleanup();for(const key of keys){if(saved[key])Object.defineProperty(globalThis,key,saved[key]);else delete globalThis[key];}}
});
