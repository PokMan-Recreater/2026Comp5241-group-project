import {test} from 'node:test';
import assert from 'node:assert/strict';
import {challenges} from '../public/academy-content.js';
import {challengeSolutions} from '../public/challenge-solutions.js';
import {nativeChallenges,checkNativeChallenge} from '../public/native-challenges.js';
test('formatted hints preserve every JavaScript answer and have multiline bodies',()=>{
 for(const c of challenges){const code=challengeSolutions[c.id];assert(code.includes('\n'));const fn=Function(code+`;return ${c.entry}`)();for(const t of c.tests)assert.deepEqual(JSON.parse(JSON.stringify(fn(...structuredClone(t.args)))),t.expected,c.id);}
});
test('native checker requires all cases to match and rejects runtime errors',async()=>{
 for(const c of nativeChallenges){let i=0;assert((await checkNativeChallenge({run:async()=>({logs:[c.tests[i++].expected+'\n']})},c,c.solution)).results.every(x=>x.pass));assert(!(await checkNativeChallenge({run:async()=>({logs:['wrong']})},c,c.solution)).results.some(x=>x.pass));assert(!(await checkNativeChallenge({run:async()=>({logs:['6'],error:'failed'})},c,c.solution)).results[0].pass);}
});
