// Pinned public runtimes. Submitted source stays in an opaque-origin sandbox.
export const runtimeURLs={compiler:'https://cdn.jsdelivr.net/npm/browsercc@0.1.1/dist/index.js',wasi:'https://cdn.jsdelivr.net/npm/@bjorn3/browser_wasi_shim@0.4.2/dist/index.js',python:'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs'};
export const runtimeAssets=[...['clang.wasm','lld.wasm','sysroot.tar'].map(name=>new URL(name,runtimeURLs.compiler).href),...['pyodide.asm.wasm','python_stdlib.zip','pyodide-lock.json'].map(name=>new URL(name,runtimeURLs.python).href)];
export function createRuntimeAssetLoader({storage=globalThis.caches,fetcher=globalThis.fetch}={}){
 const memory=new Map();
 return async url=>{
  if(!runtimeAssets.includes(url))throw new Error('Runtime asset not allowed');
  if(!memory.has(url))memory.set(url,(async()=>{
   let cache,response,cacheHit=false;
   try{cache=await storage?.open('forma-runtime-assets-v1');response=await cache?.match(url);cacheHit=!!response;}catch{/* Private mode / storage disabled: network still works. */}
   if(!response)response=await fetcher(url,{credentials:'omit',mode:'cors',cache:'force-cache'});
   if(!response.ok)throw new Error('Runtime download failed');
   const bytes=await response.arrayBuffer();if(bytes.byteLength>70000000)throw new Error('Runtime asset too large');
   const type=response.headers.get('content-type')||'application/octet-stream';
   if(cache&&!cacheHit)try{await cache.put(url,new Response(bytes,{headers:{'Content-Type':type}}));}catch{/* Quota failure must not break execution. */}
   return {bytes,type,cacheHit};
  })().catch(error=>{memory.delete(url);throw error;}));
  return memory.get(url);
 };
}
export function browserErrorText(error,locale='en'){
 if(locale==='en'||!error)return error;
 const translations={'Execution stopped':['已停止运行。','已停止執行。'],'Browser execution timed out':['运行超时，已停止；可修改代码后重试。','執行逾時，已停止；可修改程式碼後重試。'],'Compilation failed':['编译失败，请查看上方错误。','編譯失敗，請查看上方錯誤。'],'Enter a complete program to run.':['请输入完整程序。','請輸入完整程式。'],'Code or input is too large.':['代码或输入过长。','程式碼或輸入過長。']};
 return translations[error]?.[locale==='zh-TW'?1:0]||error;
}
export function runtimeWorker(urls,allowedAssets){
 const post=self.postMessage.bind(self);let python,compiler,wasi,busy=false,jobId;
 const send=value=>post({...value,jobId});
 // browsercc creates fresh compiler instances per job. Keep its immutable large
 // assets in worker memory, rather than revalidating/downloading them every run.
 const nativeFetch=self.fetch.bind(self),assets=new Map(),assetRequests=new Map();let assetSequence=0;
 const requestAsset=url=>new Promise((resolve,reject)=>{const id=++assetSequence;assetRequests.set(id,{resolve,reject});send({assetRequest:{id,url}});});
 self.fetch=async(input,options)=>{
  const url=String(input instanceof Request?input.url:input);
  if(!allowedAssets.includes(url))return nativeFetch(input,options);
  if(!assets.has(url))assets.set(url,requestAsset(url).then(asset=>({bytes:asset.bytes,headers:{'Content-Type':asset.type}})).catch(error=>{assets.delete(url);throw error;}));
  const cached=await assets.get(url);return new Response(cached.bytes,{headers:cached.headers});
 };
 self.onmessage=async({data})=>{
  if(data.assetResponse){const answer=data.assetResponse,request=assetRequests.get(answer.id);if(request){assetRequests.delete(answer.id);if(answer.error)request.reject(new Error(answer.error));else request.resolve(answer);}return;}
  if(busy)return;busy=true;jobId=data.jobId;
  const {language,code,stdin}=data;let output='',diagnostics='';
  const append=text=>{output+=text;if(output.length>24000)throw new Error('Output limit exceeded (24 KB)');};
  try{
   const compilerReady=compiler&&['clang.wasm','lld.wasm','sysroot.tar'].every(name=>assets.has(new URL(name,urls.compiler).href));
   send({phase:language==='python'?(python?'running':'loading'):(compilerReady?'compiling':'loading')});
   if(language==='python'){
    python??=await(await import(urls.python)).loadPyodide({indexURL:urls.python.replace(/[^/]+$/,'')});
    let offset=0;const input=new TextEncoder().encode(stdin);
    python.setStdin({read:buffer=>{const n=Math.min(buffer.length,input.length-offset);buffer.set(input.subarray(offset,offset+n));offset+=n;return n;}});
    python.setStdout({write:buffer=>{append(new TextDecoder().decode(buffer));return buffer.length;}});
    python.setStderr({write:buffer=>{append(new TextDecoder().decode(buffer));return buffer.length;}});
    const globals=python.toPy({__name__:'__main__'});
    send({phase:'running'});
    try{await python.runPythonAsync(code,{globals});}finally{globals.destroy();}
   }else{
    compiler??=await import(urls.compiler);wasi??=await import(urls.wasi);
    // browsercc loads the actual compiler/linker/sysroot on the first compilation.
    const flags=language==='c'?['--driver-mode=gcc','-x','c','-std=c17','-O0']:['-std=c++20','-O0','-fno-exceptions'];
    const result=await compiler.compile({source:code,fileName:language==='c'?'main.c':'main.cpp',flags});
    diagnostics=result.compileOutput||'';
    if(!result.module){send({result:{logs:[diagnostics.slice(0,24000)],error:'Compilation failed'}});return;}
    send({phase:'running'});
    const fds=[new wasi.OpenFile(new wasi.File(new TextEncoder().encode(stdin))),new wasi.ConsoleStdout(bytes=>append(new TextDecoder().decode(bytes))),new wasi.ConsoleStdout(bytes=>append(new TextDecoder().decode(bytes)))];
    // Fresh in-memory workspace per execution; never exposes the visitor's disk.
    fds.push(new wasi.PreopenDirectory('.',[]));
    const runtime=new wasi.WASI(['program'],[],fds),instance=await WebAssembly.instantiate(result.module,{wasi_snapshot_preview1:runtime.wasiImport});
    const exit=runtime.start(instance);if(exit)throw new Error('Program exited with status: '+exit);
   }
   send({result:{logs:[diagnostics,output].filter(Boolean)}});
  }catch(error){send({result:{logs:[diagnostics,output].filter(Boolean).map(x=>x.slice(0,24000)),error:String(error.message||error).slice(0,6000)}});}
  finally{busy=false;}
 };
}

export function sandboxDocument(source,nonce){
 const encoded=JSON.stringify(source).replace(/</g,'\\u003c'),token=JSON.stringify(nonce);
 return `<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob: https://cdn.jsdelivr.net; worker-src blob:; connect-src https://cdn.jsdelivr.net; base-uri 'none'; form-action 'none'"><script>
 let worker,jobId;addEventListener('message',e=>{if(e.source!==parent||e.data.nonce!==${token})return;if(e.data.stop){worker?.terminate();return;}if(e.data.assetResponse){worker?.postMessage({assetResponse:e.data.assetResponse});return;}jobId=e.data.payload.jobId;if(!worker){const url=URL.createObjectURL(new Blob([${encoded}],{type:'text/javascript'}));worker=new Worker(url);URL.revokeObjectURL(url);worker.onmessage=m=>parent.postMessage({nonce:${token},...m.data},'*');worker.onerror=error=>parent.postMessage({nonce:${token},jobId,result:{error:'Browser runtime could not load: '+(error.message||'Check network/browser support, or choose remote execution.')}},'*');}worker.postMessage(e.data.payload)});</script>`;
}

export function createBrowserRunner({makeFrame=()=>document.createElement('iframe'),host=window,container=()=>document.body,loadTimeout=180000,executionTimeout=8000,loadAsset=createRuntimeAssetLoader()}={}){
 let frame,nonce,pending,listener,timer,sequence=0;
 const destroy=()=>{if(frame){frame.contentWindow?.postMessage({nonce,stop:true},'*');const old=frame;setTimeout(()=>old.remove(),100);frame=null;}if(listener)host.removeEventListener('message',listener);listener=null;};
 const settle=result=>{if(!pending)return;clearTimeout(timer);const done=pending.resolve,hits=pending.cacheHits;pending=null;done(hits?{...result,cacheHits:hits}:result);};
 const stop=()=>{settle({error:'Execution stopped',stopped:true});destroy();};
 const cancelActive=()=>{if(pending)stop();};
 const timeout=ms=>{clearTimeout(timer);timer=setTimeout(()=>{settle({error:'Browser execution timed out',timedOut:true});destroy();},ms);};
 return {stop,cancelActive,run(language,code,stdin='',{onProgress=()=>{}}={}){
  if(pending)return Promise.resolve({error:'A program is already running'});
  if(!['c','cpp','python'].includes(language)||!String(code).trim())return Promise.resolve({error:'Enter a complete program to run.'});
  if(code.length>60000||stdin.length>10000)return Promise.resolve({error:'Code or input is too large.'});
  return new Promise(resolve=>{
   const jobId=++sequence;pending={resolve,onProgress,jobId,assetURLs:new Set(),cacheHits:0};
   const dispatch=()=>{if(pending?.jobId===jobId)frame?.contentWindow.postMessage({nonce,payload:{language,code,stdin,jobId}},'*');};
   if(!frame){
    nonce=crypto.randomUUID();frame=makeFrame();frame.hidden=true;frame.sandbox='allow-scripts';frame.referrerPolicy='no-referrer';
    frame.srcdoc=sandboxDocument(`(${runtimeWorker.toString()})(${JSON.stringify(runtimeURLs)},${JSON.stringify(runtimeAssets)})`,nonce);
    listener=event=>{if(event.source!==frame?.contentWindow||event.data?.nonce!==nonce||!pending||event.data.jobId!==pending.jobId)return;
     if(event.data.assetRequest){
      const {id,url}=event.data.assetRequest;if(!Number.isSafeInteger(id)||!runtimeAssets.includes(url)||pending.assetURLs.has(url))return;
      pending.assetURLs.add(url);const target=frame,token=nonce,assetJob=pending.jobId;
      Promise.resolve().then(()=>loadAsset(url)).then(asset=>{
       if(pending?.jobId!==assetJob||frame!==target)return;
       if(asset.cacheHit){pending.cacheHits++;pending.onProgress('cached');}
       target.contentWindow.postMessage({nonce:token,assetResponse:{id,bytes:asset.bytes,type:asset.type}},'*');
      }).catch(()=>{if(pending?.jobId===assetJob&&frame===target)target.contentWindow.postMessage({nonce:token,assetResponse:{id,error:'Runtime download failed. Check connection and retry.'}},'*');});
      return;
     }
     if(event.data.phase){pending.onProgress(event.data.phase);if(event.data.phase==='running')timeout(executionTimeout);}
     if(event.data.result)settle(event.data.result);
    };host.addEventListener('message',listener);frame.addEventListener('load',dispatch,{once:true});container().append(frame);
   }else dispatch();
   onProgress('loading');timeout(loadTimeout);
  });
 }};
}
