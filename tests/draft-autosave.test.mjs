import test from 'node:test';
import assert from 'node:assert/strict';
import {createDraftAutosave} from '../public/draft-autosave.js';

test('edits during an in-flight save are serialized and use a fresh snapshot',async()=>{
 let draft={body:'first'},release;const calls=[],states=[];
 const saver=createDraftAutosave({snapshot:()=>draft,onState:s=>states.push(s),save:async value=>{calls.push(value);if(calls.length===1)await new Promise(r=>{release=r;});}});
 saver.change();const saving=saver.flush();draft.body='second';saver.change();release();await saving;
 assert.deepEqual(calls,[{body:'first'},{body:'second'}]);assert.equal(states.at(-1),'saved');saver.dispose();
});
test('failed writes stay dirty and can be retried without losing edits',async()=>{
 let fail=true,calls=0;const states=[];
 const saver=createDraftAutosave({snapshot:()=>({body:'kept'}),onState:s=>states.push(s),save:async()=>{calls++;if(fail)throw Error('offline');}});
 saver.change();await assert.rejects(saver.flush(),/offline/);assert.equal(states.at(-1),'error');fail=false;await saver.flush();assert.equal(calls,2);assert.equal(states.at(-1),'saved');saver.dispose();
});
test('pausing for publication prevents concurrent autosaves and resumes pending changes',async()=>{
 let calls=0;const saver=createDraftAutosave({snapshot:()=>({}),save:async()=>{calls++;},onState:()=>{}});
 saver.pause();saver.change();await saver.flush();assert.equal(calls,0);saver.resume();await saver.flush();assert.equal(calls,1);saver.dispose();
});
