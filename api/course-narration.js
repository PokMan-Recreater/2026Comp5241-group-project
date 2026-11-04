import {supabaseConfig,authenticatedUser,cloudRequest,cloudFailure,CloudError,sameOrigin,readJSON,validUUID,allowRequest} from '../scripts/supabase-support.mjs';
import {isNarratableLesson} from '../public/courseware-contract.js';
import {narrationKey,narrationText,narrationLanguage,narrationWav,synthesizeNarration} from '../scripts/course-narration.mjs';
export function createNarrationHandler(deps={}){
 const configOf=deps.supabaseConfig||supabaseConfig,authenticate=deps.authenticatedUser||authenticatedUser,request=deps.cloudRequest||cloudRequest,synthesize=deps.synthesize||synthesizeNarration;
 return async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  try{
   if(!['GET','POST'].includes(req.method))throw new CloudError('method_not_allowed',405);
   if(req.method==='POST'&&!sameOrigin(req))throw new CloudError('origin_not_allowed',403);
   const config=configOf();if(!config)throw new CloudError('database_not_configured',503);
   const {user,token}=await authenticate(req,res,config),role=user.app_metadata?.role;
   const query=new URL(req.url,'http://local').searchParams;
   const body=req.method==='POST'?await readJSON(req,3000):null;
   const courseId=body?.courseId||query.get('courseId');if(!validUUID(courseId))throw new CloudError('invalid_request',400);
   const sources=[];let record,personal=false;
   const ownPersonal=async()=>{
    const rows=await request(config,'/rest/v1/personal_courses?id=eq.'+courseId+'&owner_id=eq.'+user.id+'&select=*',{token});
    return rows[0];
   };
   if(role==='teacher'){
    const rows=await request(config,'/rest/v1/teaching_courses?id=eq.'+courseId+'&deleted_at=is.null&select=*',{token});record=rows.find(c=>c.teacher_id===user.id);
    if(record){sources.push(record.draft);if(record.published)sources.push(record.published);}
    else{
     record=await ownPersonal();if(!record)throw new CloudError('course_not_found',404);
     personal=true;sources.push(record.draft);
    }
   }else if(role==='student'){
    record=await ownPersonal();
    if(record){personal=true;sources.push(record.draft);}
    else if(req.method==='GET'){
     const assignments=await request(config,'/rest/v1/rpc/teaching_student_assignments',{method:'POST',body:{assignment_id:null},token});
     sources.push(...assignments.filter(a=>a.course_id===courseId).map(a=>a.published_snapshot));if(!sources.length)throw new CloudError('course_not_found',404);
    }else throw new CloudError('teacher_required',403);
   }else throw new CloudError('teacher_required',403);
   const allowed=new Map();for(const source of sources)for(const lesson of source.lessons||[])for(const slide of lesson.slides||[])if(narrationText(slide))allowed.set(narrationKey(slide,source.language),{slide,language:source.language});
   const cachePath='/rest/v1/teaching_narration?'+(personal?'personal_course_id':'course_id')+'=eq.'+courseId;
   const clip=row=>({key:row.cache_key,text:row.script_text,language:row.language,duration:row.duration,url:'/api/course-narration?courseId='+courseId+'&key='+row.cache_key});
   if(req.method==='GET'){
    const key=query.get('key');
    if(key){if(!allowed.has(key))throw new CloudError('narration_not_found',404);const rows=await request(config,cachePath+'&cache_key=eq.'+key+'&select=audio_base64',{admin:true});if(!rows.length)throw new CloudError('narration_not_found',404);const bytes=Buffer.from(rows[0].audio_base64,'base64');res.setHeader('Content-Type','audio/wav');res.setHeader('Content-Length',String(bytes.length));res.setHeader('Cache-Control','private, no-store');res.setHeader('Vary','Cookie');return res.status(200).end(bytes);}
    const rows=await request(config,cachePath+'&select=cache_key,script_text,language,duration',{admin:true});
    return res.status(200).json({configured:!!process.env.DOUBAO_REALTIME_API_KEY,clips:rows.filter(r=>allowed.has(r.cache_key)).map(clip)});
   }
   if(record.revision!==body.revision)throw new CloudError('revision_conflict',409);
   const lesson=record.draft.lessons.find(l=>l.id===body.lessonId),slide=lesson?.slides?.[body.slideIndex];
   if(!Number.isInteger(body.slideIndex)||body.slideIndex<0||!slide)throw new CloudError('invalid_request',400);
   if(!isNarratableLesson(lesson))throw new CloudError('incomplete_courseware',400);
   const key=narrationKey(slide,record.draft.language);
   const existing=await request(config,cachePath+'&cache_key=eq.'+key+'&select=cache_key,script_text,language,duration',{admin:true});
   if(existing.length)return res.status(200).json({clip:clip(existing[0]),cached:true});
   if(!process.env.DOUBAO_REALTIME_API_KEY)throw new CloudError('narration_not_configured',503);
   if(!allowRequest(req,'narration:'+user.id,60))throw new CloudError('rate_limited',429);
   let pcm;try{pcm=await synthesize(narrationText(slide),narrationLanguage(record.draft.language),process.env.DOUBAO_REALTIME_API_KEY);}catch(error){throw new CloudError(['narration_timeout','narration_too_long'].includes(error.message)?error.message:'narration_provider_failed',502);}
   const row={...(personal?{personal_course_id:courseId}:{course_id:courseId}),cache_key:key,script_text:narrationText(slide),language:narrationLanguage(record.draft.language),duration:pcm.length/48000,audio_base64:narrationWav(pcm).toString('base64')};
   try{await request(config,'/rest/v1/teaching_narration',{method:'POST',admin:true,body:row,headers:{Prefer:'return=minimal'}});}
   catch(error){
    const again=await request(config,cachePath+'&cache_key=eq.'+key+'&select=cache_key,script_text,language,duration',{admin:true}).catch(()=>[]);
    if(!again.length)throw error;
    return res.status(200).json({clip:clip(again[0]),cached:true});
   }
   return res.status(200).json({clip:clip(row),cached:false});
  }catch(error){return cloudFailure(res,error);}
 };
}
export default createNarrationHandler();
