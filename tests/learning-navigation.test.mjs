import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createLearningViews} from '../public/academy-views.js';
import {ensureAcademy} from '../public/academy-core.js';
const state={profile:{},progress:{},events:[],lang:'zh-CN'};
const views=createLearningViews({courses:()=>[],course:()=>null},{
 e:String,L:(en,cn)=>cn,T:x=>typeof x==='object'?x['zh-CN']:x,s:()=>state,a:()=>ensureAcademy(state),
 link:(url,title)=>`<a href="#${url}">${title}</a>`,button:()=>'',heading:title=>`<h1>${title}</h1>`,ico:()=>'',cards:items=>items.join(''),codeLanguage:x=>x,empty:()=>'',
});
test('practice keeps the hands-on labs and the written interview practice beside the new categories',()=>{
 const nav=views.practiceTabs('playground');assert.equal((nav.match(/<a /g)||[]).length,5);
 assert.match(nav,/#practice\/labs/);assert.match(nav,/#practice\/written/);
 assert.match(nav,/#practice\/coding" aria-current="page"/);assert.doesNotMatch(nav,/#practice\/playground/);
 assert.match(views.practice('labs'),/#lab\//);
 assert.match(views.practiceSections('playground'),/#practice\/playground" aria-current="page"/);
});
test('the written interview practice and the AI interview entry stay separate',()=>{
 const ai=views.practice('interviews'),written=views.practice('written');
 assert.match(ai,/#mock-interview/);assert.doesNotMatch(ai,/#interview\//);
 assert.match(written,/#interview\//);assert.doesNotMatch(written,/#mock-interview/);
 assert.match(views.practiceTabs('written'),/#practice\/written" aria-current="page"/);
 assert.equal(views.practiceSections('written'),'');
});
test('games have their own hub and do not appear in the practice lab list',()=>{
 assert.match(views.games(),/#game"/);assert.match(views.games(),/#codequest"/);
 assert.doesNotMatch(views.practice('labs'),/#game"/);
});
test('the rebuilt catalog no longer repeats the old topic taxonomy',()=>{
 assert.equal(views.courseTabs('software'),'');
});
