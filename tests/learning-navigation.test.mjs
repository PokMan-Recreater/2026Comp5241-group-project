import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createLearningViews} from '../public/academy-views.js';
import {ensureAcademy} from '../public/academy-core.js';
const state={profile:{},progress:{},events:[],lang:'zh-CN'};
const views=createLearningViews({courses:()=>[],course:()=>null},{
 e:String,L:(en,cn)=>cn,T:x=>typeof x==='object'?x['zh-CN']:x,s:()=>state,a:()=>ensureAcademy(state),
 link:(url,title)=>`<a href="#${url}">${title}</a>`,button:()=>'',heading:title=>`<h1>${title}</h1>`,ico:()=>'',cards:items=>items.join(''),codeLanguage:x=>x,empty:()=>'',
});
test('practice has three top-level categories and groups free coding under coding',()=>{
 const nav=views.practiceTabs('playground');assert.equal((nav.match(/<a /g)||[]).length,3);
 assert.match(nav,/#practice\/coding" aria-current="page"/);assert.doesNotMatch(nav,/#practice\/playground/);
 assert.match(views.practiceSections('playground'),/#practice\/playground" aria-current="page"/);
});
test('short-answer entry is retired and its old list opens objective knowledge practice',()=>{
 const ai=views.practice('interviews'),written=views.practice('written');
 assert.match(ai,/#mock-interview/);assert.doesNotMatch(ai,/#interview\//);
 assert.doesNotMatch(written,/#interview\//);assert.doesNotMatch(written,/#mock-interview/);
 assert.match(views.practiceTabs('written'),/#practice\/checks" aria-current="page"/);
 assert.equal(views.practiceSections('written'),'');
});
test('games have their own hub and do not appear in the practice lab list',()=>{
 assert.match(views.games(),/#game"/);assert.match(views.games(),/#codequest"/);
 assert.doesNotMatch(views.practice('labs'),/#game"/);
});
test('the rebuilt catalog no longer repeats the old topic taxonomy',()=>{
 assert.equal(views.courseTabs('software'),'');
});
