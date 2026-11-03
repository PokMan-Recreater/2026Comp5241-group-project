import {supabaseConfig,authenticatedUser,cloudRequest,cloudFailure,CloudError,sameOrigin,readJSON,allowRequest} from '../scripts/supabase-support.mjs';
import {languages,providerMessages,repairMessages} from '../scripts/course-ai-prompts.mjs';
import {outlineProblems,fullLessonProblems,normalizeLesson,normalizeOutline} from '../scripts/course-ai-shape.mjs';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 try{
  const config=supabaseConfig();if(!config)throw new CloudError('database_not_configured',503);
  const {user,token}=await authenticatedUser(req,res,config);
  if(user.app_metadata?.role!=='teacher')throw new CloudError('teacher_required',403);
  if(req.method==='GET')return res.status(200).json({configured:!!process.env.AI_API_KEY,model:process.env.AI_MODEL||'glm-4.7-flash'});
  if(req.method!=='POST')throw new CloudError('method_not_allowed',405);
  if(!sameOrigin(req))throw new CloudError('origin_not_allowed',403);
  if(!allowRequest(req,'teacher-ai:'+user.id,5))throw new CloudError('rate_limited',429);
  const body=await readJSON(req,42000);
  if(!['outline','lesson'].includes(body.action)||!languages[body.language]||typeof body.topic!=='string'||!body.topic.trim()||body.topic.length>180||typeof body.requirements!=='string'||body.requirements.length>16000||typeof body.instruction!=='string'||body.instruction.length>2500)throw new CloudError('invalid_request',400);
  if(body.courseId){
   if(!/^[a-f\d-]{36}$/i.test(body.courseId))throw new CloudError('invalid_request',400);
   const rows=await cloudRequest(config,'/rest/v1/teaching_courses?select=id,teacher_id&id=eq.'+encodeURIComponent(body.courseId),{token});
   if(!rows.some(row=>row.teacher_id===user.id))throw new CloudError('course_not_found',404);
  }
  if(!process.env.AI_API_KEY)throw new CloudError('ai_not_configured',503);
  const current=body.lesson===undefined?'':JSON.stringify(body.lesson);if(current.length>18000)throw new CloudError('invalid_request',400);
  const endpoint=new URL((process.env.AI_BASE_URL||'https://open.bigmodel.cn/api/paas/v4').replace(/\/$/,'')+'/chat/completions');if(endpoint.protocol!=='https:')throw new CloudError('invalid_provider',503);
  const primaryModel=process.env.AI_MODEL||'glm-4.7-flash';let usedModel=primaryModel;
  const startedAt=Date.now(),budget=55000;
  const remaining=()=>budget-(Date.now()-startedAt);
  const payload={action:body.action,language:body.language,topic:body.topic,requirements:body.requirements,instruction:body.instruction,current};
  const providerRequest=(model,messages,timeout)=>fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+process.env.AI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model,messages,response_format:{type:'json_object'},max_tokens:body.action==='outline'?2000:5200,...(endpoint.hostname==='open.bigmodel.cn'&&model==='glm-4.7-flash'?{thinking:{type:'disabled'}}:{})}),signal:AbortSignal.timeout(timeout)});
  const requestProvider=(model,timeout)=>providerRequest(model,providerMessages(payload),timeout);
  const attempt=model=>{const limit=remaining()-1500;if(limit<3000)throw new CloudError('provider_timeout',502);return requestProvider(model,Math.min(model===primaryModel?28000:limit,limit));};
  let result;try{
   try{result=await attempt(primaryModel);}catch(error){if(!(error.name==='TimeoutError'||error.name==='AbortError'))throw error;result=null;}
   if(!result||result.status===429){
    if(endpoint.hostname==='open.bigmodel.cn'&&primaryModel==='glm-4.7-flash')usedModel='glm-4-flash-250414';
    else if(result)await new Promise(resolve=>setTimeout(resolve,1500));
    result=await attempt(usedModel);
   }
  }catch(error){if(error instanceof CloudError)throw error;throw new CloudError(error.name==='TimeoutError'||error.name==='AbortError'?'provider_timeout':'provider_unavailable',502);}
  if(result.status===429)throw new CloudError('provider_rate_limited',429);
  if(!result.ok)throw new CloudError('provider_unavailable',502);
  let value,rawContent;try{const raw=await result.json();rawContent=raw.choices[0].message.content;value=JSON.parse(rawContent.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));}catch{throw new CloudError('invalid_ai_result',502);}
  const problemsFor=v=>body.action==='outline'?outlineProblems(v):fullLessonProblems(v).concat(Array.isArray(v?.questions)&&v.questions.length>=1?[]:['at least one multiple-choice question is required']);
  let problems=problemsFor(value);
  if(problems.length){
   const limit=remaining()-1500;
   if(limit<3000)throw new CloudError('invalid_ai_result',502);
   const repair=async model=>providerRequest(model,repairMessages(payload,rawContent,problems),Math.min(limit,20000))
    .catch(error=>{throw new CloudError(error.name==='TimeoutError'||error.name==='AbortError'?'provider_timeout':'provider_unavailable',502);});
   let repaired;
   try{repaired=await repair(usedModel);}catch(error){if(error instanceof CloudError)throw error;throw new CloudError('provider_unavailable',502);}
   if(repaired.status===429&&endpoint.hostname==='open.bigmodel.cn'&&usedModel!=='glm-4-flash-250414'){
    usedModel='glm-4-flash-250414';
    repaired=await repair(usedModel);
   }
   if(repaired.status===429)throw new CloudError('provider_rate_limited',429);
   if(!repaired.ok)throw new CloudError('provider_unavailable',502);
   try{const raw=await repaired.json();rawContent=raw.choices[0].message.content;value=JSON.parse(rawContent.replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));}catch{throw new CloudError('invalid_ai_result',502);}
   problems=problemsFor(value);
   if(problems.length)throw new CloudError('invalid_ai_result',502);
  }
  if(body.action==='outline'){
   const titles=value.lessons.map(l=>l.title.trim().toLowerCase());
   if(new Set(titles).size!==titles.length)throw new CloudError('duplicate_lesson_titles',502);
   value=normalizeOutline(value,body.language);
  }else value=normalizeLesson(value);
  return res.status(200).json({[body.action==='outline'?'course':'lesson']:value,model:usedModel,fallbackUsed:usedModel!==primaryModel});
 }catch(error){return cloudFailure(res,error);}
}
