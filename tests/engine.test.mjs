import {test} from 'node:test';
import assert from 'node:assert/strict';
import {actions,spent,simulate,parseRoster,recommendation,csvCell} from '../public/engine.js';
test('all valid strategies produce bounded deterministic results',()=>{
 for(let mask=0;mask<(1<<actions.length);mask++){
  const selected=actions.filter((_,i)=>mask&(1<<i)).map(a=>a.id);
  if(spent(selected)>8){assert.throws(()=>simulate(selected));continue;}
  const r=simulate(selected);assert.deepEqual(r,simulate(selected));assert(r.valid>=0&&r.valid<=r.filled&&r.filled<=200);assert(r.complaints>=0);
 }
});
test('specific protections prevent the corresponding launch incident',()=>{
 assert.equal(simulate(['identity']).outside,0);assert.equal(simulate(['duplicate']).duplicates,0);assert.equal(simulate(['queue']).timeouts,0);assert.equal(simulate(['waitlist']).empty,0);
 assert(simulate(['visual']).timeouts>simulate([]).timeouts);
});
test('CSV supports quoted names, CRLF, deduplication, and invalid-row rejection',()=>{
 assert.deepEqual(parseRoster('name,email\r\n"Chan, Alex",alex@example.edu\r\nDuplicate,ALEX@example.edu\r\nBad,nope\r\nSam,sam@example.edu'),[{name:'Chan, Alex',email:'alex@example.edu'},{name:'Sam',email:'sam@example.edu'}]);
});
test('experience and goals, not degree labels, determine recommendations',()=>{
 assert.equal(recommendation({background:'experienced',goal:'career'})[0],'architecture');assert.equal(recommendation({background:'noCoding',goal:'career'})[0],'development');
});
test('CSV export neutralizes spreadsheet formula input',()=>assert.equal(csvCell('=1+1'),'"\'=1+1"'));
