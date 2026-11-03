import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resolveStudyTime,studyTimeHTML} from '../public/study-time.js';
import {scheduleLessons} from '../public/academy-core.js';

test('custom weekly time reaches the scheduler without being replaced by a preset',()=>{
 for(const minutes of [45,90,225,1200]){
  const data=resolveStudyTime({weeklyMinutes:'custom',customWeeklyMinutes:String(minutes),topic:'Git'});
  assert.equal(data.weeklyMinutes,minutes);assert.equal(data.topic,'Git');
  const schedule=scheduleLessons([{minutes:210}],data.weeklyMinutes);
  assert.equal(schedule.weeklyMinutes,minutes);
  for(const week of new Set(schedule.steps.map(x=>x.week)))assert(schedule.steps.filter(x=>x.week===week).reduce((sum,x)=>sum+x.minutes,0)<=minutes);
 }
 assert.equal(resolveStudyTime({weeklyMinutes:'120'}).weeklyMinutes,120);
});

test('invalid custom time is rejected rather than silently rounded or clamped',()=>{
 for(const customWeeklyMinutes of ['',29,1201,45.5,'abc'])assert.throws(()=>resolveStudyTime({weeklyMinutes:'custom',customWeeklyMinutes}));
});

test('custom drafts render in both planning forms with accessible labels and validation',()=>{
 for(const id of ['plan-minutes','setup-minutes'])for(const lang of ['en','zh-CN','zh-TW']){
  const html=studyTimeHTML(id,{weeklyMinutes:'custom',customWeeklyMinutes:'90'},lang);
  assert.match(html,/value="custom" selected/);assert.match(html,/value="90"/);assert.match(html,/min="30" max="1200" step="1"/);assert.match(html,new RegExp(`for="${id}-custom"`));
 }
 assert.match(studyTimeHTML('plan-minutes',{weeklyMinutes:225}),/value="custom" selected/);
 assert.match(studyTimeHTML('plan-minutes',{weeklyMinutes:120}),/data-custom-time hidden/);
});
