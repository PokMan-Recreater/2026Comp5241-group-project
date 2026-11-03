import test from 'node:test';
import assert from 'node:assert/strict';
import {SCENE_IDS as serverScenes,isScene,SCENE_CAPACITY,sceneCapacity,itemsFitScene} from '../scripts/teaching-scenes.mjs';
import {SCENE_IDS as renderScenes,sceneArt} from '../public/scene-render.js';
import {sceneIds,selectScene} from '../public/teaching-scene-catalog.js';

test('scene vocabulary stays in sync across validator, renderer and catalog',()=>{
 assert.deepEqual([...serverScenes].sort(),[...sceneIds].sort());
 assert.deepEqual([...renderScenes].sort(),[...serverScenes].sort());
 assert.ok(serverScenes.every(isScene));
});
test('every scene declares a slot capacity that matches its rendered slots',()=>{
 for(const scene of serverScenes)assert.ok(SCENE_CAPACITY[scene],scene+' has no capacity');
 assert.equal(sceneCapacity('compare').max,2);
 assert.equal(sceneCapacity('balance').max,2);
 assert.equal(sceneCapacity('document').max,3);
 assert.equal(sceneCapacity('database').max,3);
 assert.equal(sceneCapacity('layers').max,4);
 assert.equal(sceneCapacity('chain').max,4);
 assert.equal(sceneCapacity('decision').max,4);
 assert.ok(itemsFitScene('document',3));
 assert.ok(!itemsFitScene('document',4));
 assert.ok(itemsFitScene('flow',5));
 assert.ok(!itemsFitScene('flow',6));
});

test('every scene renders a bounded SVG and escapes model text',()=>{
 for(const scene of renderScenes){
  const svg=sceneArt(scene,['<img src=x>','Two'],{title:'<script>alert(1)</script>'});
  assert.match(svg,/^<svg /);
  assert.match(svg,/<\/svg>$/);
  assert.ok(!svg.includes('<img'));
  assert.ok(!svg.includes('<script>'));
  assert.match(svg,/&lt;img/);
 }
});

test('an unknown scene falls back to a real composition instead of failing',()=>{
 const svg=sceneArt('script',['A','B'],{title:'T'});
 assert.match(svg,/^<svg /);
 assert.ok(!svg.includes('script'));
});

test('story templates render every supplied label',()=>{
 const cases=[['conversation',['客户提问','系统回答','确认需求']],['phone',['打开 App','选择钱包','签名交易']],['document',['合同草案','双方确认','归档']],['database',['客户端','服务器','数据库']],['robot',['读取订单','生成报表','发送提醒']]];
 for(const [scene,items] of cases){
  const svg=sceneArt(scene,items,{title:'示例'});
  assert.match(svg,/^<svg /,scene);
  for(const item of items)assert.ok(svg.includes(item),scene+' should show '+item);
 }
});

test('auto scene selection maps teaching intent to a story template',()=>{
 assert.equal(selectScene({title:'在手机上用钱包签名',body:'打开 App 扫码',sceneItems:[]}),'phone');
 assert.equal(selectScene({title:'服务器与数据库',body:'客户端发起请求',sceneItems:[]}),'database');
 assert.equal(selectScene({title:'客服机器人',body:'自动处理工单',sceneItems:[]}),'robot');
 assert.equal(selectScene({title:'签署合同',body:'文档在双方之间流转',sceneItems:[]}),'document');
 assert.equal(selectScene({title:'师生对话',body:'提问与回答',sceneItems:[]}),'conversation');
});

test('long English labels wrap on word boundaries and captions stay complete',()=>{
 const compare=sceneArt('compare',['Decentralized','Centralized'],{title:'DApps vs Traditional Applications'});
 assert.match(compare,/Decentralized<\/text>/);
 assert.match(compare,/Centralized<\/text>/);
 assert.match(compare,/DApps vs Traditional Applications<\/text>/);
 const flow=sceneArt('flow',['Distributed network','Blockchain technology'],{title:'DApps Definition'});
 assert.match(flow,/Blockchain<\/text>/);
 assert.match(flow,/technology<\/text>/);
 assert.match(flow,/markerUnits="userSpaceOnUse"/);
});
