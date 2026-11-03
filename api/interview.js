import {interviewConfig,sameOrigin,readJSON,allowRequest,interviewMessages,parseInterviewReview} from '../scripts/interview-support.mjs';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 const config=interviewConfig();
 if(req.method==='GET'){let provider;try{provider=new URL(config.base).hostname;}catch{return res.status(200).json({configured:false,speechConfigured:!!process.env.GROQ_API_KEY});}return res.status(200).json({configured:!!config.key,speechConfigured:!!process.env.GROQ_API_KEY,model:config.key?config.model:null,provider:config.key?provider:null});}
 if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
 if(!sameOrigin(req))return res.status(403).json({error:'origin_not_allowed'});
 if(!config.key)return res.status(503).json({error:'ai_not_configured'});
 if(!allowRequest(req,'interview'))return res.status(429).json({error:'rate_limited'});
 let body,messages;
 try{body=await readJSON(req);messages=interviewMessages(body);}catch{return res.status(400).json({error:'invalid_request'});}
 try{
  const url=new URL(config.base.replace(/\/$/,'')+'/chat/completions');
  if(url.protocol!=='https:')throw new Error('invalid_endpoint');
  const result=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${config.key}`,'Content-Type':'application/json'},body:JSON.stringify({model:config.model,messages,max_tokens:body.action==='review'?2200:350,temperature:.6}),signal:AbortSignal.timeout(45000)});
  if(!result.ok)return res.status(result.status===429?429:502).json({error:result.status===429?'rate_limited':'provider_unavailable'});
  const data=await result.json(),content=data.choices?.[0]?.message?.content;
  if(typeof content!=='string'||!content.trim()||content.length>16000)throw new Error('empty_response');
  return res.status(200).json(body.action==='review'?{review:parseInterviewReview(content)}:{question:content.trim()});
 }catch(error){return res.status(502).json({error:error?.name==='TimeoutError'?'provider_timeout':'provider_unavailable'});}
}
