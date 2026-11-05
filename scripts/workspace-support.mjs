import {supabaseConfig,authenticatedUser,cloudRequest,cloudFailure,CloudError,sameOrigin,readJSON,allowRequest,validUUID} from './supabase-support.mjs';
import {validWorkspaceOperations} from '../public/workspace-state.js';

export function createWorkspaceHandler(deps={}){
 const configuration=deps.supabaseConfig||supabaseConfig,authenticate=deps.authenticatedUser||authenticatedUser,request=deps.cloudRequest||cloudRequest;
 return async function handleWorkspace(req,res){
  res.setHeader('Cache-Control','no-store');
  try{
   if(!['GET','POST'].includes(req.method))throw new CloudError('method_not_allowed',405);
   if(req.method==='POST'&&!sameOrigin(req))throw new CloudError('origin_not_allowed',403);
   const config=configuration();if(!config)throw new CloudError('database_not_configured',503);
   const {user,token}=await authenticate(req,res,config);
   if(!allowRequest(req,'workspace:'+user.id,100))throw new CloudError('rate_limited',429);
   if(req.method==='GET'){
    const rows=await request(config,'/rest/v1/learner_workspaces?select=state,revision,updated_at&user_id=eq.'+encodeURIComponent(user.id),{token});
    return res.status(200).json(rows[0]||{state:{},revision:0});
   }
   const body=await readJSON(req,1500000);
   if(!validUUID(body.batchId)||!validWorkspaceOperations(body.operations)||JSON.stringify(body).length>1500000)throw new CloudError('invalid_request',400);
   // The RPC derives ownership from auth.uid(), locks the row, and merges deltas.
   const result=await request(config,'/rest/v1/rpc/sync_learner_workspace',{method:'POST',token,body:{operations:body.operations,batch_id:body.batchId}});
   return res.status(200).json(result);
  }catch(error){return cloudFailure(res,error);}
 };
}
export const handleWorkspace=createWorkspaceHandler();
