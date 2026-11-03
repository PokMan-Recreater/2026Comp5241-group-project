import {waitUntil} from '@vercel/functions';
import {supabaseConfig,cloudRequest,authenticatedUser,cloudFailure,CloudError,sameOrigin,readJSON,allowRequest,validUUID,validateSessionPayload,normalizeCloudRecord} from '../scripts/supabase-support.mjs';
import {processInterviewReview} from '../scripts/interview-cloud-review.mjs';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');const config=supabaseConfig();if(!config)return res.status(503).json({error:'database_not_configured'});
 try{
  if(!['GET','POST','DELETE'].includes(req.method))return res.status(405).json({error:'method_not_allowed'});
  if(req.method!=='GET'&&!sameOrigin(req))return res.status(403).json({error:'origin_not_allowed'});
  const {user,token}=await authenticatedUser(req,res,config),id=new URL(req.url,'http://local').searchParams.get('id');
  if(id&&!validUUID(id))throw new CloudError('invalid_request',400);
  if(req.method==='GET'){
   if(!id){const records=await cloudRequest(config,'/rest/v1/interview_sessions?select=id,role,difficulty,spoken_language,persona_id,started_at,duration_seconds,status,interview_reports(final_score,source),interview_review_jobs(status,error_code)&order=started_at.desc&limit=50',{token});return res.status(200).json({records:records.map(normalizeCloudRecord)});}
   const records=await cloudRequest(config,'/rest/v1/interview_sessions?id=eq.'+id+'&select=*,interview_turns(*),interview_reports(*),interview_review_jobs(status,error_code)',{token});if(!records.length)return res.status(404).json({error:'not_found'});return res.status(200).json({record:normalizeCloudRecord(records[0])});
  }
  if(req.method==='DELETE'){if(!id)throw new CloudError('invalid_request',400);await cloudRequest(config,'/rest/v1/interview_sessions?id=eq.'+id,{method:'DELETE',token});return res.status(200).json({ok:true});}
  if(!allowRequest(req,'interview-records',10))return res.status(429).json({error:'rate_limited'});
  const body=await readJSON(req,180000);
  if(body.action==='retry'){
   if(!validUUID(body.id))throw new CloudError('invalid_request',400);
   const owned=await cloudRequest(config,'/rest/v1/interview_sessions?id=eq.'+body.id+'&select=id',{token});if(!owned.length)return res.status(404).json({error:'not_found'});
   // Retrying cannot reset the bounded attempt counter or resurrect a failed job.
   waitUntil(processInterviewReview(config).catch(()=>{}));return res.status(202).json({queued:true});
  }
  const payload=validateSessionPayload(body),recordId=await cloudRequest(config,'/rest/v1/rpc/save_interview_record',{method:'POST',admin:true,body:{owner_id:user.id,payload}});
  waitUntil(processInterviewReview(config).catch(()=>{}));return res.status(201).json({id:recordId,saved:true});
 }catch(error){return cloudFailure(res,error);}
}
