export function semanticEqual(a,b){if(Object.is(a,b))return true;if(a===null||b===null||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;const ak=Object.keys(a).sort(),bk=Object.keys(b).sort();return ak.length===bk.length&&ak.every((k,i)=>k===bk[i]&&semanticEqual(a[k],b[k]));}
// Each run uses a fresh opaque-origin frame and worker, with no network or DOM.
export function runSandbox(code,{challenge=null,timeout=2500}={}){
 return new Promise(resolve=>{
  const frame=document.createElement('iframe'),nonce=crypto.randomUUID();let timer,finished=false;
  frame.hidden=true;frame.sandbox='allow-scripts';
  const clean=()=>{clearTimeout(timer);window.removeEventListener('message',receive);frame.remove();};
  const finish=result=>{if(finished)return;finished=true;clean();resolve(result);};
  const receive=e=>{if(e.source===frame.contentWindow&&e.data?.nonce===nonce)finish(e.data.result);};
  window.addEventListener('message',receive);
  const source=`self.fetch=undefined;self.WebSocket=undefined;self.XMLHttpRequest=undefined;self.importScripts=undefined;self.EventSource=undefined;
  self.onmessage=async e=>{const logs=[];const equal=${semanticEqual.toString()};const serial=v=>{try{return typeof v==='string'?v:JSON.stringify(v)}catch{return String(v)}};self.console={log:(...v)=>{if(logs.length<100)logs.push(v.map(serial).join(' '))},error:(...v)=>{if(logs.length<100)logs.push(v.map(serial).join(' '))},warn:(...v)=>{if(logs.length<100)logs.push(v.map(serial).join(' '))}};try{const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;const data=e.data;if(data.challenge){const fn=await new AsyncFunction(data.code+'\\n;return typeof '+data.challenge.entry+"==='function'?"+data.challenge.entry+':null;')();if(!fn)throw new Error('Missing function: '+data.challenge.entry);const results=[];for(const test of data.challenge.tests){try{const args=structuredClone(test.args);const before=JSON.stringify(args);const refs=data.challenge.id==='unique'?args[0].filter((x,i,all)=>all.findIndex(y=>y.id===x.id)===i):null;const actual=await fn(...args);const contract=(data.challenge.id!=='chunk'||JSON.stringify(args)===before)&&(!refs||(Array.isArray(actual)&&actual!==args[0]&&JSON.stringify(args)===before&&actual.every((x,i)=>x===refs[i])));results.push({pass:contract&&equal(actual,test.expected),error:contract?undefined:'Contract violation: input mutation or incorrect output identity',actual:serial(actual),expected:serial(test.expected)})}catch(error){results.push({pass:false,error:String(error.message||error)})}}self.postMessage({logs,results});}else{await new AsyncFunction(data.code)();self.postMessage({logs});}}catch(error){self.postMessage({logs,error:String(error.message||error)})}};`;
  frame.srcdoc=`<!doctype html><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'"><script>addEventListener('message',e=>{if(e.source!==parent)return;let worker;try{const url=URL.createObjectURL(new Blob([e.data.source],{type:'text/javascript'}));worker=new Worker(url);URL.revokeObjectURL(url);worker.onmessage=m=>parent.postMessage({nonce:e.data.nonce,result:m.data},'*');worker.onerror=()=>parent.postMessage({nonce:e.data.nonce,result:{error:'Worker execution failed'}},'*');worker.postMessage(e.data.payload)}catch(error){parent.postMessage({nonce:e.data.nonce,result:{error:String(error.message||error)}},'*')}});</script>`;
  frame.addEventListener('load',()=>frame.contentWindow.postMessage({source,nonce,payload:{code:String(code).slice(0,60000),challenge}},'*'),{once:true});
  document.body.append(frame);timer=setTimeout(()=>finish({error:'Execution timed out',timedOut:true}),timeout);
 });
}

// Deliberately small tracing language: unsupported constructs produce errors.
// This is not a C/C++ compiler or a Python interpreter.
export function traceProgram(language,code){
 const vars=Object.create(null),out=[];
 const value=raw=>{const s=raw.trim();if(/^"[^"\n]*"$|^'[^'\n]*'$/.test(s))return s.slice(1,-1).replace(/\\n/g,'\n');if(/^[-+]?\d+(\.\d+)?$/.test(s))return Number(s);if(Object.hasOwn(vars,s))return vars[s];throw new Error('Unsupported expression: '+s);};
 for(let line of code.split(/\n|;(?=(?:[^"']|"[^"]*"|'[^']*')*$)/)){
  line=line.trim();if(!line||line.startsWith('//')||line.startsWith('#')||/^(?:int main\(.*\)\s*\{?|[{}]|return 0)$/.test(line))continue;
  if(/^(if|for|while|def|class|try|except)\b/.test(line))throw new Error('This trace supports literal assignments and output only');
  const assignment=line.match(/^(?:(?:int|float|double|unsigned int|let|const)\s+)?([A-Za-z_]\w*)\s*=\s*(.+)$/);
  if(assignment){vars[assignment[1]]=value(assignment[2]);continue;}
  const py=line.match(/^print\((.*)\)$/);
  if(language==='python'&&py){out.push(py[1].split(',').map(value).join(' '));continue;}
  const printf=line.match(/^printf\("([^"\n]*)"(?:,\s*(.*))?\)$/);
  if(printf){let i=0;const args=printf[2]?printf[2].split(',').map(value):[];const text=printf[1].replace(/%[dfsuc]/g,()=>String(args[i++]??''));if(i!==args.length)throw new Error('Format and argument count differ');out.push(text.replace(/\\n/g,'\n'));continue;}
  if(line.includes('cout')){out.push(line.replace(/^(std::)?cout\s*<</,'').split('<<').map(x=>x.trim()==='std::endl'||x.trim()==='endl'?'\n':String(value(x))).join(''));continue;}
  throw new Error('Unsupported statement: '+line);
 }
 return out;
}

// Interactive pages run in an opaque origin without access to the Forma document/storage.
export const interactivePageExample=`<main style="font-family:system-ui;padding:24px">
  <h1>Click counter</h1>
  <p>Count: <output id="count">0</output></p>
  <button id="add" type="button">Add one</button>
</main>
<script>
let count = 0;
document.querySelector('#add').addEventListener('click', () => {
  count += 1;
  document.querySelector('#count').textContent = count;
  console.log('Count:', count);
});
</script>`;
export function interactiveDocument(code,nonce){
 const token=JSON.stringify(nonce).replace(/</g,'\\u003c');
 return `<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-src 'none'; worker-src 'none'"><script>(()=>{const send=(type,text)=>parent.postMessage({formaPage:${token},type,text},'*');const serial=v=>{try{return typeof v==='string'?v:JSON.stringify(v)}catch{return String(v)}};for(const key of ['log','warn','error'])console[key]=(...args)=>send('log',args.map(serial).join(' '));addEventListener('error',e=>send('error',e.message));addEventListener('unhandledrejection',e=>send('error',String(e.reason)));addEventListener('click',()=>{const before=document.body.innerText;setTimeout(()=>{if(document.body.innerText!==before)send('interaction','Page text changed after a click')},0)},true);})();</script>${String(code).slice(0,60000)}`;
}
/**
 * @param {HTMLIFrameElement} frame
 * @param {string} code
 * @param {{onLog?: (text: string, kind: string) => void, onInteraction?: () => void}} [options]
 */
export function mountInteractivePage(frame,code,{onLog=()=>{},onInteraction=()=>{}}={}){
 const nonce=crypto.randomUUID();let lines=0;
 const receive=event=>{if(event.source!==frame.contentWindow||event.data?.formaPage!==nonce)return;if(event.data.type==='interaction')onInteraction();else if(['log','error'].includes(event.data.type)&&lines++<100)onLog(String(event.data.text).slice(0,3000),event.data.type);};
 window.addEventListener('message',receive);frame.sandbox='allow-scripts';frame.referrerPolicy='no-referrer';frame.hidden=false;frame.srcdoc=interactiveDocument(code,nonce);
 return ()=>{window.removeEventListener('message',receive);frame.srcdoc='';};
}

export const domPageExample=`<main style="font-family:system-ui;padding:24px">
  <h1>Show a message safely</h1>
  <label for="message">Message</label>
  <input id="message" value="&lt;b&gt;Hello&lt;/b&gt;">
  <button id="show" type="button">Show message</button>
  <p id="result">Your message will appear here.</p>
</main>
<script>
document.querySelector('#show').addEventListener('click', () => {
  const message = document.querySelector('#message').value;
  document.querySelector('#result').textContent = message;
  console.log('Displayed plain text:', message);
});
</script>`;
