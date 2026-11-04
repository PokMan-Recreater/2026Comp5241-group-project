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
test('the extended templates render all of their bounded labels',()=>{
 const cases=[['venn',['左侧','右侧','共同']],['quadrant',['高影响','低影响','低成本','高成本']],['stairs',['起步','练习','熟练','精通']],['funnel',['访问','试用','付费']],['pyramid',['核心','支撑','基础']],['tree',['分类','子类一','子类二']],['target',['主目标','次要一','次要二']],['shield',['识别风险','限制权限','监控告警']],['chart',['一月','二月','三月']],['puzzle',['部件一','部件二','部件三']],['iceberg',['可见现象','隐藏原因','长期影响']],['bridge',['现状','目标','迁移步骤']]];
 for(const [scene,items] of cases){
  const svg=sceneArt(scene,items,{title:'示例'});
  assert.match(svg,/^<svg /,scene);
  assert.doesNotMatch(svg,/NaN|undefined|Infinity/,scene);
  for(const item of items)assert.ok(svg.includes(item),scene+' should show '+item);
 }
});

test('auto scene selection maps teaching intent to a story template',()=>{
 assert.equal(selectScene({title:'在手机上用钱包签名',body:'打开 App 扫码',sceneItems:[]}),'phone');
 assert.equal(selectScene({title:'服务器与数据库',body:'客户端发起请求',sceneItems:[]}),'database');
 assert.equal(selectScene({title:'客服机器人',body:'自动处理工单',sceneItems:[]}),'robot');
 assert.equal(selectScene({title:'签署合同',body:'文档在双方之间流转',sceneItems:[]}),'document');
 assert.equal(selectScene({title:'师生对话',body:'提问与回答',sceneItems:[]}),'conversation');
 assert.equal(selectScene({title:'共同点和差异',body:'两者的交集与共有部分',sceneItems:[]}),'venn');
 assert.equal(selectScene({title:'优先级矩阵',body:'按影响和成本排序',sceneItems:[]}),'quadrant');
 assert.equal(selectScene({title:'能力进阶阶梯',body:'从入门逐步提升',sceneItems:[]}),'stairs');
 assert.equal(selectScene({title:'转化漏斗',body:'逐层筛选潜在用户',sceneItems:[]}),'funnel');
 assert.equal(selectScene({title:'需求金字塔',body:'从基础到核心的层级',sceneItems:[]}),'pyramid');
 assert.equal(selectScene({title:'错误分类树',body:'按类型归类问题',sceneItems:[]}),'tree');
 assert.equal(selectScene({title:'聚焦目标',body:'把注意力放在核心结果',sceneItems:[]}),'target');
 assert.equal(selectScene({title:'安全防护',body:'识别风险并降低威胁',sceneItems:[]}),'shield');
 assert.equal(selectScene({title:'增长指标',body:'每月数量的变化',sceneItems:[]}),'chart');
 assert.equal(selectScene({title:'系统组件拼合',body:'多个部件组成整体',sceneItems:[]}),'puzzle');
 assert.equal(selectScene({title:'冰山模型',body:'表面现象下的深层原因',sceneItems:[]}),'iceberg');
 assert.equal(selectScene({title:'阶段之间的桥梁',body:'从现状过渡到新方案',sceneItems:[]}),'bridge');
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


test('lesson previews use semantic artwork and preserve AI-selected scenes when saved',async()=>{
 const {sceneHTML}=await import('../public/teaching.js');
 const {ensureScene}=await import('../public/scene-auto.js');
 for(const scene of serverScenes){
  const lesson={title:'Example',body:'A concrete example',scene,sceneItems:['Input','Result']};
  assert.equal(ensureScene(lesson),lesson,scene+' must survive editing and saving');
  assert.match(sceneHTML(lesson),/viewBox="0 0 360 240"/);
  assert.match(sceneHTML(lesson),/class="tc-scene"/);
 }
 const old={title:'区块链',scene:'flow',sceneItems:['概念介绍','工作原理','应用场景']};
 assert.match(sceneHTML(old),/交易记录/);
});

test('generated lessons retain the original player contract and all teaching content through save',async()=>{
 const {teachingLessonForPlayer,lessonForSave}=await import('../public/teaching-lesson-adapter.js');
 const {validateCourse}=await import('../scripts/teaching-support.mjs');
 const lesson={id:'l1',title:'签名',body:'演示签名',objectives:['区分签名与广播'],misconceptions:['签名不等于已确认'],sourceNotes:['教师材料'],scene:'phone',sceneItems:['签名','广播'],questions:[],slides:[{heading:'签名之前',concept:'授权边界',bullets:['检查收款人'],script:['小明先检查收款人和金额，再决定是否签名。'],notes:['签名不保证交易会被确认。'],art:{scene:'phone',items:['检查金额','钱包签名']}}]};
 const saved=validateCourse({title:'钱包',description:'',language:'zh-CN',lessons:[lessonForSave(lesson)]}).lessons[0];
 assert.deepEqual(saved,lesson);
 const player=teachingLessonForPlayer(saved);
 assert.equal(player.audio,false);
 assert.deepEqual(player.steps[0].script,lesson.slides[0].script);
 assert.deepEqual(player.steps[0].notes,lesson.slides[0].notes);
 assert.match(player.steps[0].art(1,'zh-CN'),/<svg/);
});
