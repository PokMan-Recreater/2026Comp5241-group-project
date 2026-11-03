// Source and stdin are sent to Wandbox only when the learner clicks Run.
// Never execute submitted programs on the web server itself.
export const compilers = Object.freeze({c:'gcc-13.2.0-c',cpp:'gcc-13.2.0',python:'cpython-3.12.7'});
const requests = new Map();

export async function executeProgram({language,code,stdin=''}, fetcher=fetch) {
 if(!Object.hasOwn(compilers,language)||typeof code!=='string'||!code.trim()||typeof stdin!=='string')throw new Error('invalid_program');
 if(code.length>60000||stdin.length>10000)throw new Error('program_too_large');
 const response=await fetcher('https://wandbox.org/api/compile.json',{
  method:'POST',headers:{'Content-Type':'application/json'},
  body:JSON.stringify({compiler:compilers[language],code,stdin,save:false}),
  signal:AbortSignal.timeout(25000)
 });
 if(!response.ok)throw new Error('runner_unavailable');
 const result=await response.json();
 if(typeof result.status!=='string'&&typeof result.status!=='number')throw new Error('invalid_runner_response');
 const clip=value=>String(value||'').slice(0,24000);
 return {stdout:clip(result.program_output),stderr:clip(result.program_error),diagnostics:clip(result.compiler_message||result.compiler_error||result.compiler_output),exitCode:String(result.status),signal:clip(result.signal)};
}

export default async function handler(req,res) {
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST'){res.setHeader('Allow','POST');return res.status(405).json({error:'method_not_allowed'});}
 if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host)return res.status(403).json({error:'origin_not_allowed'});}catch{return res.status(403).json({error:'origin_not_allowed'});}}
 const now=Date.now(),ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'local').split(',')[0];
 for(const [key,bucket]of requests)if(now-bucket.start>60000)requests.delete(key);
 const bucket=requests.get(ip)||{start:now,count:0};bucket.count++;requests.set(ip,bucket);
 if(bucket.count>12){res.setHeader('Retry-After','60');return res.status(429).json({error:'rate_limited'});}
 let body;
 try{
  if(req.body)body=typeof req.body==='string'?JSON.parse(req.body):req.body;
  else{let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>90000)return res.status(413).json({error:'program_too_large'});}body=JSON.parse(raw);}
  if(!body||typeof body!=='object')return res.status(400).json({error:'invalid_program'});
  return res.status(200).json(await executeProgram(body));
 }catch(error){
  const message=String(error?.message||'');
  if(['invalid_program','program_too_large'].includes(message))return res.status(message==='program_too_large'?413:400).json({error:message});
  if(error instanceof SyntaxError)return res.status(400).json({error:'invalid_json'});
  return res.status(502).json({error:error?.name==='TimeoutError'?'runner_timeout':'runner_unavailable'});
 }
}
