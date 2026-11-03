import {test} from 'node:test';
import assert from 'node:assert/strict';
import {executeProgram} from '../api/run.js';
import {runNativeProgram} from '../public/native-runner.js';

test('execution forwards complete source and input without creating a saved permalink',async()=>{
 for(const [language,compiler]of Object.entries({c:'gcc-13.2.0-c',cpp:'gcc-13.2.0',python:'cpython-3.12.7'})){
  const code='full source';
  const result=await executeProgram({language,code,stdin:'6\n'},async(url,options)=>{
   assert.equal(url,'https://wandbox.org/api/compile.json');
   assert.deepEqual(JSON.parse(options.body),{compiler,code,stdin:'6\n',save:false});
   return {ok:true,json:async()=>({status:'0',program_output:'21\n',program_error:'',compiler_message:''})};
  });
  assert.equal(result.stdout,'21\n');assert.equal(result.exitCode,'0');
 }
});
test('invalid requests and upstream failures are rejected rather than simulated',async()=>{
 await assert.rejects(executeProgram({language:'shell',code:'x'}),/invalid_program/);
 await assert.rejects(executeProgram({language:'c',code:'x'.repeat(60001)}),/program_too_large/);
 await assert.rejects(executeProgram({language:'c',code:'x'},async()=>({ok:false})),/runner_unavailable/);
 await assert.rejects(executeProgram({language:'c',code:'x'},async()=>({ok:true,json:async()=>({})})),/invalid_runner_response/);
});
test('compile errors, runtime errors, signals and service outages reach the learner',async()=>{
 const run=body=>runNativeProgram('c','bad code','','en',async()=>({ok:true,json:async()=>body}));
 assert.deepEqual(await run({diagnostics:'main.c: syntax error',stdout:'',stderr:'',exitCode:'1'}),{logs:['main.c: syntax error'],error:'Program exited with status: 1'});
 assert.match((await run({stdout:'before crash',stderr:'error',exitCode:'1',signal:'Killed'})).error,/Killed/);
 const offline=await runNativeProgram('python','print(1)','','zh-CN',async()=>{throw new Error('offline');});
 assert.match(offline.error,/不可用/);
});
