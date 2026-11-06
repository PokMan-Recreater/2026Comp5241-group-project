import {createHash} from 'node:crypto';
import {produceLesson} from '../scripts/course-production.mjs';
import {planningMessages,validTeachingBrief,fallbackTeachingBrief,coerceTeachingBrief,storyboardRepairMessages,lessonReviewMessages,validLessonReview,contentRepairMessages} from '../scripts/course-storyboard-prompts.mjs';
import {validStoryboard,storyboardProblems} from '../public/course-storyboard.js';
import {supabaseConfig,authenticatedUser,cloudRequest,cloudFailure,CloudError,sameOrigin,readJSON,allowRequest} from '../scripts/supabase-support.mjs';
import {languages,providerMessages,repairMessages} from '../scripts/course-ai-prompts.mjs';
import {outlineProblems,fullLessonProblems,normalizeLesson,normalizeOutline,canonicalAIResult,parseAIContent,diversifyLessonScenes,salvageLesson,salvageProblems,dedupeLessonTitles} from '../scripts/course-ai-shape.mjs';
// Bounded, account-scoped recovery for a retry on the same server instance.
// No provider credentials are stored; expiry and process restart clear it.
const productionCheckpoints=new Map();
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 try{
  const config=supabaseConfig();if(!config)throw new CloudError('database_not_configured',503);
  const {user,token}=await authenticatedUser(req,res,config);
  // Teachers author class courses; learners author their own personal courses.
  if(!['teacher','student','admin'].includes(user.app_metadata?.role))throw new CloudError('teacher_required',403);
  if(req.method==='GET')return res.status(200).json({configured:!!process.env.AI_API_KEY,model:process.env.AI_MODEL||'glm-4.7-flash'});
  if(req.method!=='POST')throw new CloudError('method_not_allowed',405);
  if(!sameOrigin(req))throw new CloudError('origin_not_allowed',403);
  if(!allowRequest(req,'course-ai:'+user.id,5))throw new CloudError('rate_limited',429);
  const body=await readJSON(req,42000);
  if(!['outline','lesson'].includes(body.action)||!languages[body.language]||typeof body.topic!=='string'||!body.topic.trim()||body.topic.length>180||typeof body.requirements!=='string'||body.requirements.length>16000||typeof body.instruction!=='string'||body.instruction.length>2500)throw new CloudError('invalid_request',400);
  if(body.courseId){
   if(!/^[a-f\d-]{36}$/i.test(body.courseId))throw new CloudError('invalid_request',400);
   const id=encodeURIComponent(body.courseId);
   const classRows=await cloudRequest(config,'/rest/v1/teaching_courses?select=id,teacher_id&id=eq.'+id,{token});
   if(!classRows.some(row=>row.teacher_id===user.id)){
    const personalRows=await cloudRequest(config,'/rest/v1/personal_courses?select=id,owner_id&id=eq.'+id,{token});
    if(!personalRows.some(row=>row.owner_id===user.id))throw new CloudError('course_not_found',404);
   }
  }
  if(!process.env.AI_API_KEY)throw new CloudError('ai_not_configured',503);
  const current=body.lesson===undefined?'':JSON.stringify(body.lesson);if(current.length>18000)throw new CloudError('invalid_request',400);
  const endpoint=new URL((process.env.AI_BASE_URL||'https://open.bigmodel.cn/api/paas/v4').replace(/\/$/,'')+'/chat/completions');if(endpoint.protocol!=='https:')throw new CloudError('invalid_provider',503);
  const primaryModel=process.env.AI_MODEL||'glm-4.7-flash';let usedModel=primaryModel;
  const isOutline=body.action==='outline';
  const isLessonDraft=body.action==='lesson'&&body.production==='lesson-draft';
  const fastFallback=(isOutline||isLessonDraft)&&endpoint.hostname==='open.bigmodel.cn'
   ?(primaryModel==='glm-4-flash-250414'?'glm-4-flash':'glm-4-flash-250414')
   :null;
  const startedAt=Date.now(),budget=isLessonDraft?165000:isOutline?125000:['storyboard-v1','lesson-v2'].includes(body.production)?275000:110000;
  const remaining=()=>budget-(Date.now()-startedAt);
  const production=body.action==='lesson'&&body.production==='storyboard-v1'?'storyboard-v1':isLessonDraft?'lesson-draft':null;
  const payload={action:body.action,language:body.language,topic:body.topic,requirements:body.requirements,instruction:body.instruction,current,production,teachingBrief:null};
  const providerRequest=(model,messages,timeout,maxTokens=isOutline?2000:isLessonDraft?3000:6500)=>fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+process.env.AI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model,messages,response_format:{type:'json_object'},max_tokens:maxTokens,...(endpoint.hostname==='open.bigmodel.cn'&&model==='glm-4.7-flash'?{thinking:{type:'disabled'}}:{})}),signal:AbortSignal.timeout(timeout)});
  if(body.production==='lesson-v2'&&body.action==='lesson'){
   const ask=async(messages,maxTokens)=>{
    const timeout=()=>{const limit=Math.min(35000,remaining()-2000);if(limit<3000)throw new CloudError('provider_timeout',502);return limit;};
    let response;
    try{response=await providerRequest(usedModel,messages,timeout(),maxTokens);}catch(error){if(!['TimeoutError','AbortError'].includes(error.name))throw error;}
    if(!response||response.status===429){
     if(endpoint.hostname==='open.bigmodel.cn'&&usedModel==='glm-4.7-flash'){usedModel='glm-4-flash-250414';response=await providerRequest(usedModel,messages,timeout(),maxTokens);}
    }
    if(!response)throw new CloudError('provider_timeout',502);
    if(response.status===429)throw new CloudError('provider_rate_limited',429);
    if(!response.ok)throw new CloudError('provider_unavailable',502);
    const data=await response.json();return parseAIContent(data?.choices?.[0]?.message?.content);
   };
   const cacheKey=createHash('sha256').update(user.id+'\n'+JSON.stringify(payload)).digest('hex');
   for(const [key,entry]of productionCheckpoints)if(Date.now()-entry.at>600000)productionCheckpoints.delete(key);
   if(!productionCheckpoints.has(cacheKey)){if(productionCheckpoints.size>=20)productionCheckpoints.delete(productionCheckpoints.keys().next().value);productionCheckpoints.set(cacheKey,{at:Date.now(),data:{}});}
   const entry=productionCheckpoints.get(cacheKey);entry.at=Date.now();
   const generated=await produceLesson(payload,ask,entry.data);productionCheckpoints.delete(cacheKey);
   return res.status(200).json({...generated,model:usedModel,fallbackUsed:usedModel!==primaryModel});
  }
  if(payload.production==='storyboard-v1'){
   // A plan is helpful, never mandatory: coerce what the model returned and
   // otherwise use a localized deterministic brief so lesson writing never
   // fails just because the planning call was slow or malformed.
   let brief=null,primaryUnavailable=false;
   for(const model of [...new Set([primaryModel,...(endpoint.hostname==='open.bigmodel.cn'?['glm-4-flash-250414']:[])])]){
    const timeout=Math.min(30000,remaining()-40000);if(timeout<3000)break;
    try{
     const response=await providerRequest(model,planningMessages(payload),timeout,1400);
     if(!response.ok){if(model===primaryModel)primaryUnavailable=true;continue;}
     const data=await response.json(),parsed=parseAIContent(data?.choices?.[0]?.message?.content),coherent=Array.isArray(parsed?.steps)&&parsed.steps.filter(step=>step&&typeof step==='object'&&typeof step.heading==='string'&&!!step.heading.trim()).length>=3,coerced=coerceTeachingBrief(parsed,{language:body.language,topic:body.topic,current:body.lesson});
     if(coherent&&validTeachingBrief(coerced)){brief=coerced;if(model!==primaryModel)usedModel=model;break;}
    }catch(error){if(model===primaryModel&&(error.name==='TimeoutError'||error.name==='AbortError'))primaryUnavailable=true;}
   }
   // A planner failure is a useful latency signal: do not spend another 65s
   // on the same overloaded primary model for the lesson itself.
   if(primaryUnavailable&&usedModel===primaryModel&&endpoint.hostname==='open.bigmodel.cn'&&primaryModel==='glm-4.7-flash')usedModel='glm-4-flash-250414';
   payload.teachingBrief=brief||fallbackTeachingBrief({language:body.language,topic:body.topic,current:body.lesson});
  }
  const requestProvider=(model,timeout)=>providerRequest(model,providerMessages(payload),timeout);
  // Reserve time for schema repair instead of letting fallback consume the whole request.
  const attempt=model=>{
   const limit=remaining()-25000;
   if(limit<3000)throw new CloudError('provider_timeout',502);
   const timeout=isLessonDraft?60000:isOutline?45000:payload.production==='storyboard-v1'?65000:model===primaryModel?15000:55000;
   return requestProvider(model,Math.min(timeout,limit));
  };
  let result;try{
   if(usedModel===primaryModel){
    try{result=await attempt(primaryModel);}catch(error){if(!(error.name==='TimeoutError'||error.name==='AbortError'))throw error;result=null;}
    if(!result||!result.ok){
     if(fastFallback)usedModel=fastFallback;
     else if(endpoint.hostname==='open.bigmodel.cn'&&primaryModel==='glm-4.7-flash')usedModel='glm-4-flash-250414';
     else if(result)await new Promise(resolve=>setTimeout(resolve,1500));
    }
   }
   if(!result||!result.ok)result=await attempt(usedModel);
  }catch(error){if(error instanceof CloudError)throw error;throw new CloudError(error.name==='TimeoutError'||error.name==='AbortError'?'provider_timeout':'provider_unavailable',502);}
  if(result.status===429)throw new CloudError('provider_rate_limited',429);
  if(!result.ok)throw new CloudError('provider_unavailable',502);
  let value,rawContent;
  const decode=async response=>{
   const raw=await response.json();rawContent=raw?.choices?.[0]?.message?.content;
   return canonicalAIResult(parseAIContent(rawContent),body.action,body.lesson?.id);
  };
  const repairDetails=async lesson=>{
   if(payload.production!=='storyboard-v1'||!Array.isArray(lesson?.slides))return lesson;
   const smallRequest=async messages=>{
    const timeout=Math.min(20000,remaining()-15000);if(timeout<3000)throw new CloudError('provider_timeout',502);
    let response=await providerRequest(usedModel,messages,timeout,1800);
    if(response.status===429&&endpoint.hostname==='open.bigmodel.cn'&&usedModel!=='glm-4-flash-250414'){usedModel='glm-4-flash-250414';response=await providerRequest(usedModel,messages,Math.min(20000,remaining()-15000),1800);}
    if(!response.ok)throw new CloudError('provider_unavailable',502);
    const data=await response.json();return parseAIContent(data?.choices?.[0]?.message?.content);
   };
   // Repair at most two stories. The rest degrade to their scene template in
   // salvage, which is better than spending the budget on eight retries.
   let storyRepairs=0;
   for(const slide of lesson.slides.slice(0,8)){
    if(!slide?.art||validStoryboard(slide.art.story))continue;
    if(storyRepairs>=2||remaining()<70000)break;
    storyRepairs++;
    try{const story=await smallRequest(storyboardRepairMessages(slide,body.language,storyboardProblems(slide.art.story)));if(validStoryboard(story))slide.art.story=story;}catch{break;}
   }
   if(Array.isArray(lesson.objectives)&&lesson.objectives.length>3&&remaining()>20000){
    try{const fixed=await smallRequest([{role:'system',content:'Return JSON {"objectives":[...]} with 2-3 measurable objectives of <=120 characters each. Preserve all learning goals by merging overlaps; use the requested language.'},{role:'user',content:JSON.stringify({language:body.language,objectives:lesson.objectives})}]);if(Array.isArray(fixed.objectives)&&fixed.objectives.length>=2&&fixed.objectives.length<=3&&fixed.objectives.every(x=>typeof x==='string'&&x.trim()&&x.length<=120))lesson.objectives=fixed.objectives;}catch{/* Keep the existing goals for the full repair validator. */}
   }
   rawContent=JSON.stringify(lesson);return lesson;
  };
  let parseFailed=false;
  try{value=await decode(result);}catch(error){if(error.name==='TimeoutError'||error.name==='AbortError')throw new CloudError('provider_timeout',502);parseFailed=true;}
  const repairHintsFor=v=>body.action==='outline'?outlineProblems(v):fullLessonProblems(v).concat(payload.production==='storyboard-v1'&&(!Array.isArray(v?.slides)||v.slides.some(s=>!validStoryboard(s?.art?.story)))?['Every slide requires a valid storyboard with concrete actors and 2-3 causal events']:[]).concat(payload.teachingBrief&&v?.slides?.length!==payload.teachingBrief.steps.length?['Follow the teaching brief: return exactly '+payload.teachingBrief.steps.length+' slides']:[]).concat(Array.isArray(v?.questions)&&v.questions.length>=1?[]:['at least one multiple-choice question is required']);
  if(!parseFailed)value=await repairDetails(value);
  // Only unplayable output goes back to the model. Missing stories, quiz items,
  // misconceptions or duplicate headings are degraded deterministically below
  // rather than burning another long generation call.
  const critical=v=>body.action==='outline'?outlineProblems(v):salvageProblems(v);
  if(critical(body.action==='outline'?value:salvageLesson(value)).length){
   // One best-effort repair, then a deterministic downgrade for lessons. A
   // failed repair call must not discard an otherwise usable result.
   try{
    if(endpoint.hostname==='open.bigmodel.cn'&&primaryModel==='glm-4.7-flash'&&usedModel===primaryModel)usedModel='glm-4-flash-250414';
    const hints=parseFailed?['Return one complete valid JSON object; the previous response was not parseable JSON']:repairHintsFor(value);
    const repair=async model=>{
     const timeout=Math.min(payload.production==='storyboard-v1'?65000:55000,remaining()-1500);
     if(timeout<3000)throw new CloudError('provider_timeout',502);
     return providerRequest(model,repairMessages(payload,rawContent,hints),timeout);
    };
    let repaired=await repair(usedModel);
    if(repaired.status===429&&endpoint.hostname==='open.bigmodel.cn'&&usedModel!=='glm-4-flash-250414'){
     usedModel='glm-4-flash-250414';
     repaired=await repair(usedModel);
    }
    if(repaired.ok){value=await repairDetails(await decode(repaired));}
   }catch{/* Keep the first candidate and salvage it below. */}
   if(body.action==='outline'){
    if(critical(value).length)throw new CloudError('invalid_ai_result',502);
   }else{
    value=salvageLesson(value);
    if(critical(value).length)throw new CloudError('invalid_ai_result',502);
   }
  }else if(body.action==='lesson')value=salvageLesson(value);
  let qualityReview;
  if(payload.production==='storyboard-v1'){
   const review=async lesson=>{
    const timeout=Math.min(25000,remaining()-10000);if(timeout<3000)throw new CloudError('provider_timeout',502);
    const response=await providerRequest(usedModel,lessonReviewMessages(lesson,payload),timeout,1400);if(!response.ok)throw new CloudError('quality_review_failed',502);
    const data=await response.json();const result=parseAIContent(data?.choices?.[0]?.message?.content);if(!validLessonReview(result,lesson.slides.length))throw new CloudError('quality_review_failed',502);return result;
   };
   // Review is advisory: an unavailable or unhappy reviewer must not erase a
   // structurally valid lesson. Its issues still travel back to the author.
   try{qualityReview=await review(value);}catch{qualityReview=undefined;}
   if(qualityReview&&!qualityReview.pass){
    try{
     const timeout=Math.min(65000,remaining()-25000);if(timeout<3000)throw new CloudError('provider_timeout',502);
     const response=await providerRequest(usedModel,contentRepairMessages(value,qualityReview.issues,payload),timeout);if(!response.ok)throw new CloudError('quality_review_failed',502);
     const data=await response.json(),patch=parseAIContent(data?.choices?.[0]?.message?.content),allowed=new Set(qualityReview.issues.map(i=>i.slide));
     if(!Array.isArray(patch.corrections)||patch.corrections.length>value.slides.length)throw new CloudError('quality_review_failed',502);
     const changed=new Set(),next=structuredClone(value);let valid=true;
     for(const correction of patch.corrections){
      if(!Number.isInteger(correction.index)||correction.index<0||correction.index>=next.slides.length||!allowed.has(correction.index)||changed.has(correction.index)){valid=false;break;}
      next.slides[correction.index]=correction.slide;changed.add(correction.index);
     }
     if(valid){
      if(allowed.has(-1)){if(patch.misconceptions!==undefined)next.misconceptions=patch.misconceptions;if(patch.questions!==undefined)next.questions=patch.questions;}
      const clean=salvageLesson(await repairDetails(canonicalAIResult(next,'lesson',body.lesson?.id)));
      if(!salvageProblems(clean).length){value=clean;try{qualityReview=await review(value);}catch{/* Keep the first review. */}}
     }
    }catch{/* Advisory review only. */}
   }
  }
  if(body.action==='outline'){
   value={...value,lessons:dedupeLessonTitles(value.lessons)};
   value=normalizeOutline(value,body.language);
  }else value=diversifyLessonScenes(normalizeLesson(value));
  return res.status(200).json({[body.action==='outline'?'course':'lesson']:value,model:usedModel,fallbackUsed:usedModel!==primaryModel,...(payload.teachingBrief?{production:'storyboard-v1',teachingBrief:payload.teachingBrief,qualityReview}:{})});
 }catch(error){return cloudFailure(res,error);}
}
