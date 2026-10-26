import {test} from 'node:test';
import assert from 'node:assert/strict';
import {QUEST_LEVELS,QUEST_LANGUAGES,QUEST_DIFFICULTIES,levelsFor,findLevel,questProgress,clearedCount,isUnlocked,isQuestLanguage,buildProgram,runProgram,checkProgram,renderProgram} from '../public/codequest.js';

const LANGUAGE_IDS=QUEST_LANGUAGES.map(x=>x.id);

test('language guard accepts the three supported languages only',()=>{
 for(const {id} of QUEST_LANGUAGES)assert.equal(isQuestLanguage(id),true,id+' should be supported');
 for(const id of ['ruby','javascript',''] )assert.equal(isQuestLanguage(id),false,id+' should be rejected');
});

test('every level is solved by its correct option and by no other',()=>{
 for(const level of QUEST_LEVELS){
  assert.ok(level.slot.options.length>1,level.id+' needs more than one option');
  assert.ok(checkProgram(level,level.slot.correct).passed,level.id+' correct option should pass');
  level.slot.options.forEach((option,index)=>{
   if(index===level.slot.correct)return;
   const wrong=checkProgram(level,index);
   assert.equal(wrong.passed,false,level.id+' wrong option "'+option.code+'" should not pass');
   assert.equal(wrong.error,null,level.id+' wrong option should run, not crash');
  });
 }
});

test('the missing line is actually required to run the program',()=>{
 for(const level of QUEST_LEVELS){
  const result=runProgram(level.program);
  assert.equal(result.error,'unfilled slot',level.id+' should refuse to run with a gap');
 }
});

test('each level exposes the language it teaches',()=>{
 for(const level of QUEST_LEVELS){
  assert.ok(LANGUAGE_IDS.includes(level.difficulty)===false,level.id);
 }
});

test('every level renders in all three languages with line mapping',()=>{
 for(const level of QUEST_LEVELS){
  for(const lang of LANGUAGE_IDS){
   const {code,map}=renderProgram(level.program,lang);
   assert.ok(code.length>0,level.id+' '+lang);
   assert.ok(map.size>=level.program.length,level.id+' '+lang+' missing line mapping');
  }
 }
});

test('rendered code uses the syntax of the selected language',()=>{
 const level=findLevel('master-accumulate');
 const cpp=renderProgram(level.program,'cpp').code;
 const python=renderProgram(level.program,'python').code;
 const java=renderProgram(level.program,'java').code;
 assert.match(cpp,/cout\s*<</);
 assert.match(python,/print\(/);
 assert.match(java,/System\.out\.println\(/);
 assert.ok(!/;\s*$/.test(python.split('\n').filter(Boolean).at(-1)),'python should not end with a semicolon');
});

test('choosing an option fills the gap so the code runs',()=>{
 for(const level of QUEST_LEVELS){
  const built=buildProgram(level,level.slot.correct);
  for(const lang of LANGUAGE_IDS){
   const {code}=renderProgram(built,lang);
   assert.ok(!code.includes('pick something'),level.id+' '+lang+' kept its placeholder');
   assert.ok(code.includes(level.slot.options[level.slot.correct].code),level.id+' '+lang+' missing chosen code');
  }
 }
});

test('execution traces each line and ends in the goal output',()=>{
 for(const level of QUEST_LEVELS){
  const result=checkProgram(level,level.slot.correct);
  assert.deepEqual(result.output,level.goal,level.id+' output mismatch');
  assert.ok(result.steps.length>0,level.id+' should record steps');
  for(const step of result.steps)assert.ok(step.id,level.id+' step without id');
 }
});

test('loops are bounded so a bad condition cannot hang the page',()=>{
 const level=findLevel('master-accumulate');
 // Keep the two setup lines so `total` and `i` exist, then force a condition
 // that never becomes false. Both guards must fire before the loop runs away.
 const stuck=[...level.program.slice(0,2),{op:'while',id:'s3',cond:{type:'num',value:1},body:level.program[2].body}];
 assert.equal(runProgram(stuck).error,'step limit reached','the step budget should stop a runaway loop');
 assert.equal(runProgram(stuck,{limit:100000}).error,'too many passes','the pass guard should stop a runaway loop');
});

test('progress unlocks levels in order',()=>{
 const a={codequest:{lang:'cpp',cleared:{},attempts:{}}};
 const rookie=levelsFor('rookie');
 assert.ok(rookie.length>=2);
 assert.equal(isUnlocked(a,'rookie',rookie[0]),true,'first level starts unlocked');
 assert.equal(isUnlocked(a,'rookie',rookie[1]),false,'second level starts locked');
 questProgress(a).cleared[rookie[0].id]=true;
 assert.equal(isUnlocked(a,'rookie',rookie[1]),true,'clearing one level unlocks the next');
 assert.equal(clearedCount(a,'rookie'),1);
});

test('questProgress backfills missing fields on older records',()=>{
 const a={codequest:{}};
 const p=questProgress(a);
 assert.equal(p.lang,'cpp');
 assert.deepEqual(p.cleared,{});
 assert.deepEqual(p.attempts,{});
});

test('each difficulty has levels and translated copy',()=>{
 for(const d of QUEST_DIFFICULTIES){
  assert.ok(levelsFor(d.id).length>0,d.id+' has no levels');
  for(const key of ['name','summary','focus']){
   assert.equal(typeof d[key].en,'string',d.id+'.'+key+'.en');
   assert.equal(typeof d[key]['zh-CN'],'string',d.id+'.'+key+'.zh-CN');
   assert.equal(typeof d[key]['zh-TW'],'string',d.id+'.'+key+'.zh-TW');
  }
 }
});

test('each level has a title, brief, teaching note and goal in three languages',()=>{
 for(const level of QUEST_LEVELS){
  for(const key of ['title','brief','teach']){
   assert.equal(typeof level[key].en,'string',level.id+'.'+key+'.en');
   assert.equal(typeof level[key]['zh-CN'],'string',level.id+'.'+key+'.zh-CN');
   assert.equal(typeof level[key]['zh-TW'],'string',level.id+'.'+key+'.zh-TW');
  }
  assert.ok(level.goal.length>0,level.id+' has no goal');
 }
});
