import test from 'node:test';
import assert from 'node:assert/strict';
import {referenceTopics} from '../public/academy-content.js';
import {programmingLessonById} from '../public/programming-lessons.js';
import {runnableExample,repairBuiltinDraft} from '../public/runnable-examples.js';

test('every built-in C/C++ runnable demo has main and explicitly required headers',()=>{
 const required=[[/\bprintf\b|\bfopen\b/,'stdio.h'],[/\bmalloc\b|\bfree\b/,'stdlib.h'],[/\bINT_MAX\b/,'limits.h'],[/std::cout/,'iostream'],[/std::vector/,'vector'],[/std::map/,'map'],[/std::string|std::getline/,'string'],[/std::make_unique/,'memory'],[/std::move/,'utility'],[/std::[io]fstream/,'fstream']];
 const native=referenceTopics.filter(t=>['c','cpp'].includes(t.language));assert.equal(native.length,15);
 for(const topic of native){const code=runnableExample(topic);assert.match(code,/int main\(/,topic.id);for(const [symbol,header]of required)if(symbol.test(code))assert.ok(code.includes(`#include <${header}>`),topic.id+' requires '+header);}
});
test('all five JavaScript free-coding demos actually run and return expected values',async()=>{
 const expected={'js-values':['Sam',false],'js-scope':['ready'],'js-arrays':[[4,6]],'js-async':['ready'],'js-dom':['DOM examples need a document.']};
 const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
 for(const topic of referenceTopics.filter(t=>t.language==='javascript')){
  const logs=[];await new AsyncFunction('console',runnableExample(topic))({log:(...args)=>logs.push(...args)});assert.deepEqual(logs,expected[topic.id],topic.id);
 }
 const scope=referenceTopics.find(t=>t.id==='js-scope');assert.equal(runnableExample(scope),programmingLessonById['js-scope'].solution);
 // Debugging starters stay intentionally broken in the lesson, not in free coding.
 await assert.rejects(()=>new AsyncFunction('console',scope.code)({log:()=>{}}),ReferenceError);
});
test('all thirty demo IDs remain covered without rewriting arbitrary learner programs',()=>{
 assert.equal(referenceTopics.length,30);assert.equal(new Set(referenceTopics.map(t=>t.id)).size,30);
 for(const topic of referenceTopics)assert.ok(runnableExample(topic).trim(),topic.id);
 assert.equal(runnableExample({id:'custom',language:'cpp',code:'my source'}),'my source');
});
test('only the exact old broken RAII draft is upgraded, not learner edits',()=>{
 const fixed=runnableExample({id:'cpp-raii',language:'cpp'}),broken=fixed.replace('#include <iostream>\n','');
 assert.equal(repairBuiltinDraft('cpp',broken),fixed);
 assert.equal(repairBuiltinDraft('cpp',broken+'\n// learner note'),broken+'\n// learner note');
 assert.equal(repairBuiltinDraft('c',broken),broken);
});
