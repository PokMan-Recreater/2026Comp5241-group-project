import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createBrowserRunner,sandboxDocument,runtimeURLs,runtimeWorker,createRuntimeAssetLoader,runtimeAssets} from '../public/browser-runner.js';
import {runnableExample} from '../public/runnable-examples.js';
import {readFile} from 'node:fs/promises';
function fixture(options={}){
 const host=new EventTarget();let load,removed=false,created=0;const sent=[];
 const frame={contentWindow:{postMessage:value=>sent.push(value)},addEventListener:(_type,fn)=>load=fn,remove:()=>{removed=true;}};
 const runner=createBrowserRunner({host,makeFrame:()=>{created++;return frame;},container:()=>({append:()=>load()}),...options});
 const message=data=>{const event=new Event('message'),request=sent.findLast(x=>x.payload);Object.assign(event,{source:frame.contentWindow,data:{nonce:request.nonce,jobId:request.payload.jobId,...data}});host.dispatchEvent(event);};
 return {runner,frame,sent,message,get removed(){return removed;},get created(){return created;}};
}
test('browser runtime uses opaque origin, pinned downloads and no application network access',()=>{
 const html=sandboxDocument('</script><script>bad()</script>','test');
 assert.match(html,/connect-src https:\/\/cdn.jsdelivr.net;/);
 assert.doesNotMatch(html,/allow-same-origin/);assert.doesNotMatch(html,/<script>bad/);
 assert.match(runtimeURLs.compiler,/@0\.1\.1/);assert.match(runtimeURLs.python,/v0\.27\.7/);
});
test('local execution sends stdin only to sandbox and returns real worker results',async()=>{
 const f=fixture(),phases=[];const pending=f.runner.run('c','source','5',{onProgress:p=>phases.push(p)});
 assert.equal(f.frame.sandbox,'allow-scripts');assert.equal(f.sent[0].payload.stdin,'5');
 f.message({phase:'running'});f.message({result:{logs:['55\n']}});
 assert.deepEqual(await pending,{logs:['55\n']});assert.deepEqual(phases,['loading','running']);f.runner.stop();
});
test('stop settles a pending load and explicitly terminates worker',async()=>{
 const f=fixture();const pending=f.runner.run('python','while True: pass');f.runner.stop();
 assert.equal((await pending).stopped,true);assert.equal(f.sent.at(-1).stop,true);
});
test('execution timeout terminates hung worker and retry creates a new sandbox',async()=>{
 const f=fixture({executionTimeout:5});const pending=f.runner.run('cpp','source');f.message({phase:'running'});
 assert.equal((await pending).timedOut,true);assert.equal(f.sent.at(-1).stop,true);
 const retry=f.runner.run('cpp','new source');f.message({result:{logs:['retry works']}});assert.deepEqual(await retry,{logs:['retry works']});f.runner.stop();
});
test('C uses the C driver, runtime assets are reused and Python has fresh globals',()=>{
 const source=runtimeWorker.toString();assert.match(source,/--driver-mode=gcc/);assert.match(source,/'-x','c','-std=c17'/);assert.match(source,/assets\.has\(url\)/);assert.match(source,/globals\.destroy\(\)/);
});
test('invalid input is rejected without fetching or creating sandbox',async()=>{
 const f=fixture();assert.ok((await f.runner.run('shell','x')).error);assert.ok((await f.runner.run('c','x'.repeat(60001))).error);assert.equal(f.sent.length,0);
});
test('changing examples keeps the idle environment and uses the current progress callback',async()=>{
 const f=fixture(),first=[],second=[];
 const one=f.runner.run('cpp','first example','',{onProgress:p=>first.push(p)});f.message({phase:'running'});f.message({result:{logs:['first']}});await one;
 f.runner.cancelActive();assert.equal(f.created,1);assert.ok(f.sent.every(x=>!x.stop));
 const two=f.runner.run('cpp','different example','',{onProgress:p=>second.push(p)});
 f.message({phase:'running'});f.message({result:{logs:['stale']},jobId:1});
 f.message({result:{logs:['second']}});assert.deepEqual(await two,{logs:['second']});
 assert.equal(f.created,1);assert.deepEqual(first,['loading','running']);assert.deepEqual(second,['loading','running']);f.runner.stop();
});
test('navigation still terminates a busy environment and subsequent execution is fresh',async()=>{
 const f=fixture();const one=f.runner.run('cpp','infinite loop');f.runner.cancelActive();assert.equal((await one).stopped,true);
 const two=f.runner.run('cpp','recovered');f.message({result:{logs:['OK']}});await two;assert.equal(f.created,2);f.runner.stop();
});
test('render cleanup preserves idle cache and built-in snippets use only required headers',async()=>{
 const ui=await readFile(new URL('../public/academy-ui.js',import.meta.url),'utf8');assert.match(ui,/beforeRender\(\)\{browserRunner\.cancelActive\(\)/);
 const virtual=runnableExample({id:'cpp-virtual',language:'cpp'});assert.match(virtual,/#include <iostream>/);assert.doesNotMatch(virtual,/#include <(vector|map|fstream)>/);
 assert.match(runnableExample({id:'cpp-map',language:'cpp'}),/#include <map>/);
 assert.match(runnableExample({id:'cpp-raii',language:'cpp'}),/#include <fstream>/);
 assert.match(runnableExample({id:'cpp-raii',language:'cpp'}),/#include <iostream>/);
 assert.match(runtimeWorker.toString(),/new wasi\.PreopenDirectory\('\.',\[\]\)/);
 const untouched={id:'user-code',language:'cpp',code:'learner code'};assert.equal(runnableExample(untouched),untouched.code);
});
test('runtime assets survive a new loader (page refresh) without fetching again',async()=>{
 const stored=new Map();let downloads=0;
 const storage={open:async()=>({match:async url=>stored.get(url)?.clone(),put:async(url,response)=>stored.set(url,response)})};
 const fetcher=async()=>{downloads++;return new Response(new Uint8Array([0,97,115,109]),{headers:{'Content-Type':'application/wasm'}});};
 const first=createRuntimeAssetLoader({storage,fetcher});assert.equal((await first(runtimeAssets[0])).cacheHit,false);
 const refreshed=createRuntimeAssetLoader({storage,fetcher});const result=await refreshed(runtimeAssets[0]);
 assert.equal(result.cacheHit,true);assert.equal(downloads,1);assert.equal(result.type,'application/wasm');
 assert.deepEqual([...new Uint8Array(result.bytes)],[0,97,115,109]);
 await assert.rejects(refreshed('https://evil.example/key'),/not allowed/);assert.equal(downloads,1);
});
test('disabled cache/quota errors fall back to normal execution without masking network failures',async()=>{
 const storage={open:async()=>{throw new Error('disabled');}};let calls=0;
 const loader=createRuntimeAssetLoader({storage,fetcher:async()=>{calls++;return new Response('runtime');}});
 assert.equal((await loader(runtimeAssets[0])).cacheHit,false);await loader(runtimeAssets[0]);assert.equal(calls,1);
 const unavailable=createRuntimeAssetLoader({storage,fetcher:async()=>new Response('failed',{status:503})});
 await assert.rejects(unavailable(runtimeAssets[0]),/download failed/);
});
test('sandbox may only request pinned assets and asset replies use the current job after rerender',async()=>{
 const fetched=[];const f=fixture({loadAsset:async url=>{fetched.push(url);return {bytes:new ArrayBuffer(4),type:'application/wasm',cacheHit:true};}});
 const one=f.runner.run('c','first');f.message({result:{logs:[]}});await one;f.runner.cancelActive();
 const phases=[],two=f.runner.run('python','print(1)','',{onProgress:p=>phases.push(p)});
 f.message({assetRequest:{id:1,url:'http://localhost/api/private'}});
 f.message({assetRequest:{id:2,url:runtimeAssets[3]}});
 await new Promise(resolve=>setTimeout(resolve,0));
 assert.deepEqual(fetched,[runtimeAssets[3]]);assert.equal(f.sent.at(-1).assetResponse.id,2);assert.ok(phases.includes('cached'));
 f.message({result:{logs:['1']}});await two;f.runner.stop();
});
