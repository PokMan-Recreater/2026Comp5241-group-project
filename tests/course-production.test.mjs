import test from 'node:test';
import assert from 'node:assert/strict';
import {produceLesson} from '../scripts/course-production.mjs';
const brief={audience:'Beginners',goal:'Explain one transfer',case:'Alice sends five units to Bob',steps:Array.from({length:4},(_,i)=>({heading:'Stage '+i,purpose:'Explain change '+i,layout:'process'}))};
const slide=i=>({heading:'Page '+i,concept:'Concept '+i,bullets:['Alice sends five units','Bob receives the request'],script:['Alice signs the transfer.','Bob can inspect the result.'],art:{scene:i%2?'network':'phone',items:['Alice wallet','Bob wallet']}});
const meta={objectives:['Explain signing','Explain confirmation'],misconceptions:['Signing means finality → signing only authorizes a request.'],questions:[0,1].map(i=>({id:'q'+i,prompt:'Who sends?',options:['Alice','Bob'],correctIndex:0,explanation:'Alice initiates the transfer.'}))};
const payload={language:'en',topic:'Transfers',requirements:'Use Alice and Bob',instruction:'Explain carefully',current:JSON.stringify({id:'lesson-one',title:'One transfer'})};
test('staged production keeps the running case, retries only a failed page and preserves identity',async()=>{
 let calls=0;const inputs=[];const replies=[brief,slide(0),{},slide(1),slide(2),slide(3),meta,{pass:true,issues:[]},{pass:true,issues:[]}];
 const result=await produceLesson(payload,async messages=>{calls++;inputs.push(messages);return structuredClone(replies.shift());});
 assert.equal(calls,9);assert.equal(result.lesson.id,'lesson-one');assert.equal(result.production,'lesson-v2');assert.equal(result.lesson.slides.length,4);assert.equal(result.qualityReview.pass,true);
 assert.equal(JSON.parse(inputs[2][1].content).index,1);assert.equal(JSON.parse(inputs[3][1].content).index,1);assert.equal(JSON.parse(inputs[4][1].content).previousSlides.length,2);
 assert.ok(inputs.slice(1,6).every(m=>m[1].content.includes('Alice sends five units to Bob')));
});
test('review repairs only the flagged page then verifies the complete lesson again',async()=>{
 const correction={...slide(2),script:['Corrected explanation.']};const replies=[brief,...[0,1,2,3].map(slide),meta,{pass:false,issues:[{slide:2,problem:'Explain the boundary correctly'}]},correction,{pass:true,issues:[]},{pass:true,issues:[]}];
 const result=await produceLesson(payload,async()=>structuredClone(replies.shift()));
 assert.deepEqual(result.lesson.slides[2],correction);assert.deepEqual(result.lesson.slides[0],slide(0));assert.equal(result.qualityReview.pass,true);
});
test('review cannot rewrite an unflagged page or release content that still fails',async()=>{
 const replies=[brief,...[0,1,2,3].map(slide),meta,{pass:false,issues:[{slide:1,problem:'Wrong claim'}]},{corrections:[{index:0,slide:slide(0)}]},{corrections:[{index:0,slide:slide(0)}]}];
 await assert.rejects(()=>produceLesson(payload,async()=>structuredClone(replies.shift())),/quality_review_failed/);
 const second=[brief,...[0,1,2,3].map(slide),meta,{pass:false,issues:[{slide:1,problem:'Wrong claim'}]},slide(1),{pass:false,issues:[{slide:1,problem:'Still wrong'}]}];
 await assert.rejects(()=>produceLesson(payload,async()=>structuredClone(second.shift())),/quality_review_failed/);
});

test('a failed generation can reuse checked pages without regenerating them',async()=>{
 const checkpoint={},first=[brief,slide(0),{},{}];
 await assert.rejects(()=>produceLesson(payload,async()=>structuredClone(first.shift()),checkpoint),/invalid_ai_result/);
 assert.equal(checkpoint.slides.length,1);
 const indices=[],rest=[slide(1),slide(2),slide(3),meta,{pass:true,issues:[]},{pass:true,issues:[]}];
 const result=await produceLesson(payload,async messages=>{const input=JSON.parse(messages[1].content);if(Number.isInteger(input.index))indices.push(input.index);return structuredClone(rest.shift());},checkpoint);
 assert.deepEqual(indices,[1,2,3]);assert.equal(result.lesson.slides.length,4);
});

test('four short goals are merged without losing any goal before content review',async()=>{
 const goals=['Goal one','Goal two','Goal three','Goal four'];const replies=[brief,...[0,1,2,3].map(slide),{...meta,objectives:goals},{pass:true,issues:[]},{pass:true,issues:[]}];
 const result=await produceLesson(payload,async()=>structuredClone(replies.shift()));
 assert.equal(result.lesson.objectives.length,3);for(const goal of goals)assert.ok(result.lesson.objectives.join(' ').includes(goal));
});

test('a fluent lesson still gets a separate state and illustration audit before acceptance',async()=>{
 const corrected={...slide(1),art:{scene:'document',items:['Working file','Staged snapshot']}};
 const replies=[brief,...[0,1,2,3].map(slide),meta,{pass:true,issues:[]},{pass:false,issues:[{slide:1,problem:'A desktop command is not a phone interaction'}]},corrected,{pass:true,issues:[]},{pass:true,issues:[]}];
 const result=await produceLesson(payload,async()=>structuredClone(replies.shift()));
 assert.deepEqual(result.lesson.slides[1],corrected);assert.deepEqual(result.lesson.slides[0],slide(0));assert.equal(replies.length,0);
});
