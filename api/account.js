import {handleWorkspace} from '../scripts/workspace-support.mjs';
import {supabaseConfig,cloudRequest,authenticatedUser,setAuthCookies,cloudFailure,CloudError,sameOrigin,readJSON,allowRequest} from '../scripts/supabase-support.mjs';
export const accountIdentity=username=>`${username}@accounts.forma.invalid`;
export const publicUser=user=>({id:user.id,username:user.user_metadata?.username||user.email?.split('@')[0],role:['student','teacher','admin'].includes(user.app_metadata?.role)?user.app_metadata.role:'student'});
export default async function handler(req,res){
 if(new URL(req.url||'/api/account','http://local').searchParams.get('resource')==='learning-state')return handleWorkspace(req,res);
 res.setHeader('Cache-Control','no-store');const config=supabaseConfig();
 if(!config)return res.status(503).json({error:'database_not_configured'});
 try{
  if(req.method==='GET'){try{const {user}=await authenticatedUser(req,res,config);return res.status(200).json({user:publicUser(user)});}catch(error){if(error.status===401)return res.status(200).json({user:null});throw error;}}
  if(req.method!=='POST')return res.status(405).json({error:'method_not_allowed'});
  if(!sameOrigin(req))return res.status(403).json({error:'origin_not_allowed'});
  if(!allowRequest(req,'account',8))return res.status(429).json({error:'rate_limited'});
  const body=await readJSON(req,4000);
  if(body.action==='logout'){setAuthCookies(req,res,null);return res.status(200).json({ok:true});}
  const username=typeof body.username==='string'?body.username.trim().toLowerCase():'';
  if(!['login','signup'].includes(body.action)||! /^(?!.*[._-]{2})[a-z][a-z0-9._-]{2,31}$/.test(username)||typeof body.password!=='string'||body.password.length<8||Buffer.byteLength(body.password,'utf8')>72)throw new CloudError('invalid_credentials',400);
  // Internal identity only: no mailbox, confirmation message or email address is required.
  const email=accountIdentity(username);
  if(body.action==='signup'){
   if(/^(admin|teacher|student)[0-9]*$/.test(username))throw new CloudError('reserved_username',400);
   try{await cloudRequest(config,'/auth/v1/admin/users',{method:'POST',admin:true,body:{email,password:body.password,email_confirm:true,user_metadata:{username},app_metadata:{role:'student'}}});}catch{throw new CloudError('registration_failed',400);}
  }
  let data;try{data=await cloudRequest(config,'/auth/v1/token?grant_type=password',{method:'POST',body:{email,password:body.password}});}catch{throw new CloudError('authentication_failed',400);}
  setAuthCookies(req,res,data);
  return res.status(200).json({user:publicUser(data.user)});
 }catch(error){return cloudFailure(res,error);}
}
