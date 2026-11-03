import {supabaseConfig,cloudRequest,authenticatedUser,setAuthCookies,cloudFailure,CloudError,sameOrigin,readJSON,allowRequest} from '../scripts/supabase-support.mjs';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');const config=supabaseConfig();
 if(!config)return res.status(503).json({error:'database_not_configured'});
 try{
  if(req.method==='GET'){try{const {user}=await authenticatedUser(req,res,config);return res.status(200).json({user:{id:user.id,email:user.email}});}catch(error){if(error.status===401)return res.status(200).json({user:null});throw error;}}
  if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
  if(!sameOrigin(req))return res.status(403).json({error:'origin_not_allowed'});
  if(!allowRequest(req,'account',8))return res.status(429).json({error:'rate_limited'});
  const body=await readJSON(req,4000);
  if(body.action==='logout'){setAuthCookies(req,res,null);return res.status(200).json({ok:true});}
  if(!['login','signup'].includes(body.action)||typeof body.email!=='string'||!/^\S+@\S+\.\S+$/.test(body.email)||body.email.length>254||typeof body.password!=='string'||body.password.length<8||body.password.length>128)throw new CloudError('invalid_credentials',400);
  let data;try{data=await cloudRequest(config,body.action==='signup'?'/auth/v1/signup':'/auth/v1/token?grant_type=password',{method:'POST',body:{email:body.email.trim(),password:body.password}});}catch{throw new CloudError('authentication_failed',400);}
  if(data.access_token)setAuthCookies(req,res,data);
  return res.status(200).json({user:data.access_token?{id:data.user.id,email:data.user.email}:null,confirmationRequired:!data.access_token});
 }catch(error){return cloudFailure(res,error);}
}
