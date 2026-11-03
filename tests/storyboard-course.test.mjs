import test from 'node:test';
import assert from 'node:assert/strict';
import {storySteps,storyboardCourse,storyboardHTML,scopeResult} from '../public/storyboard-course.js';

test('the visual lesson has eight independently addressable frames and accessible controls',()=>{
 assert.equal(storySteps.length,8);assert.equal(new Set(storySteps.map(x=>x.frame)).size,8);
 assert.equal(storyboardCourse.format,'storyboard');
 for(const lang of ['en','zh-CN','zh-TW'])for(let i=0;i<8;i++){
  const html=storyboardHTML({storyboard:{step:i}},lang);
  assert.match(html,new RegExp(`data-sb-step="${i}" aria-current="step"`));
  assert.match(html,/data-sb-play/);assert.match(html,/data-sb-move/);
  assert.doesNotMatch(html,/<textarea|data-action="(?:tutor|roleplay)"/);
 }
});
test('scope exploration distinguishes a usable task from a merely affordable selection',()=>{
 assert.deepEqual(scopeResult(['chart']),{cost:3,usable:false,over:false});
 assert.deepEqual(scopeResult(['add','share','check']),{cost:5,usable:true,over:false});
 assert.deepEqual(scopeResult(['add','share','check','chart']),{cost:8,usable:true,over:true});
 assert.deepEqual(scopeResult(['add','add']),{cost:2,usable:false,over:false});
 assert.throws(()=>scopeResult(['invented']));
});
test('document mode, hidden notes and saved position survive independent rendering',()=>{
 const html=storyboardHTML({storyboard:{step:5,mode:'document',notes:false,scope:['chart']}},'zh-CN');
 assert.match(html,/sb-document/);assert.match(html,/3 \/ 5/);assert.match(html,/流程还不完整/);
 assert.doesNotMatch(html,/<aside class="sb-notes"/);
 assert.match(storyboardHTML({storyboard:{step:900}},'en'),/data-sb-step="7" aria-current="step"/);
});
