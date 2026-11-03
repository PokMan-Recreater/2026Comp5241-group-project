import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {narrationFor,narrationPosition} from '../public/delivery-audio.js';
import {deliverySteps,englishScripts,deliveryLessonHTML} from '../public/delivery-lesson.js';
import {lessonText} from '../public/delivery-i18n.js';

test('narration clock follows sentence boundaries rather than a fixed-duration animation timer',()=>{
 const clip={duration:30,sentenceStarts:[0,4,22]};
 assert.deepEqual(narrationPosition(clip,0),{sentence:0,progress:0});
 assert.deepEqual(narrationPosition(clip,4),{sentence:1,progress:1/3});
 assert.deepEqual(narrationPosition(clip,22),{sentence:2,progress:2/3});
 assert.deepEqual(narrationPosition(clip,45),{sentence:2,progress:1});
 assert.equal(narrationPosition(clip,13).progress,.5);
 assert.deepEqual(narrationPosition(clip,-5),{sentence:0,progress:0});
});

test('all five bilingual recordings exist, and Traditional Chinese reuses the Mandarin assets',async()=>{
 for(let i=0;i<5;i++){
  assert.strictEqual(narrationFor('zh-TW',i),narrationFor('zh-CN',i));
  assert.notEqual(narrationFor('en',i).src,narrationFor('zh-CN',i).src);
  for(const lang of ['zh-CN','en']){
   const clip=narrationFor(lang,i);
   assert.equal(clip.provider,'doubao');assert.ok(clip.duration>8);
   assert.equal(clip.sentenceStarts.length,3);
   assert.equal(clip.sentenceStarts[0],0);
   assert.ok(clip.sentenceStarts[1]>0&&clip.sentenceStarts[2]>clip.sentenceStarts[1]&&clip.sentenceStarts[2]<clip.duration);
   const data=await readFile(new URL('../public'+clip.src.split('?')[0],import.meta.url));
   assert.ok(data.length>50000);assert.equal(data.subarray(0,3).toString(),'ID3');
  }
 }
});

test('the lesson offers three complete text languages with translated narration and controls',()=>{
 const traditional=deliveryLessonHTML('zh-TW');
 assert.match(traditional,/軟體工程全貌/);assert.match(traditional,/慢網路下發生了什麼/);assert.match(traditional,/關閉配音/);
 assert.doesNotMatch(traditional,/软件工程全貌|慢网络下发生了什么/);
 assert.match(deliveryLessonHTML('en'),/A retry creates a duplicate/);
 for(let i=0;i<5;i++)for(let j=0;j<3;j++){
  assert.equal(lessonText('en',deliverySteps[i].script[j],englishScripts[i][j]),englishScripts[i][j]);
  assert.notEqual(lessonText('zh-TW',deliverySteps[i].script[j],englishScripts[i][j]),deliverySteps[i].script[j]);
 }
});
