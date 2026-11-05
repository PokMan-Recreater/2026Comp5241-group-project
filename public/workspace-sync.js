import {workspaceSnapshot,workspaceChanges,applyWorkspaceOperations,sameValue} from './workspace-state.js';

export async function requestWorkspace(body,fetcher=fetch){
 const encoded=body?JSON.stringify(body):undefined;
 const response=await fetcher('/api/account?resource=learning-state',{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},body:encoded,signal:AbortSignal.timeout(12000),keepalive:!!encoded&&new TextEncoder().encode(encoded).length<60000});
 const result=await response.json();if(!response.ok)throw Error(result.error||'sync_unavailable');return result;
}

export function createWorkspaceSync({getState,apply,storage,request,notify=()=>{},schedule=setTimeout,cancel=clearTimeout,uuid=()=>crypto.randomUUID(),fields=null,namespace='main'}){
 let owner=null,epoch=0,baseline={},bootstrap=false,hasLocal=false,timer,busy=null,again=false,status='idle';
 const snapshot=value=>{const result=workspaceSnapshot(value);return fields?Object.fromEntries(fields.filter(key=>result[key]!==undefined).map(key=>[key,result[key]])):result;};
 const key=()=>`forma.workspace.cloud-base.v1.${owner}.${namespace}`;
 const report=value=>{status=value;notify(value);};
 const remember=()=>{try{storage?.setItem(key(),JSON.stringify(baseline));}catch{/* Local workspace is also retained by the app. */}};
 function changed(){if(!owner)return;again=true;report('pending');cancel(timer);timer=schedule(()=>{void sync();},700);}
 async function sync(){
  if(!owner)return;
  if(busy){again=true;return busy;}
  cancel(timer);const token=epoch,user=owner,sent=snapshot(getState());
  const operations=hasLocal?workspaceChanges(baseline,sent,{bootstrap}):[];
  again=false;report('syncing');
  busy=(async()=>{
   try{
    let result;
    if(!operations.length)result=await request();
    else{
     let batch=[],size=0;
     for(const operation of operations){
      const length=JSON.stringify(operation).length;
      if(batch.length&&(batch.length>=400||size+length>200000)){result=await request({operations:batch,batchId:uuid()});if(token!==epoch||user!==owner)return;batch=[];size=0;}
      batch.push(operation);size+=length;
     }
     if(batch.length)result=await request({operations:batch,batchId:uuid()});
    }
    if(token!==epoch||user!==owner)return;
    if(!result?.state||typeof result.state!=='object'||Array.isArray(result.state))throw Error('invalid_sync_response');
    const edits=workspaceChanges(sent,snapshot(getState()));
    const merged=applyWorkspaceOperations(snapshot(result.state),edits);
    baseline=snapshot(result.state);bootstrap=false;hasLocal=true;remember();
    if(!sameValue(snapshot(getState()),merged))apply(merged);
    again=workspaceChanges(baseline,snapshot(getState())).length>0;
    report(again?'pending':'synced');
   }catch(error){if(token===epoch)report(error.message==='login_required'?'signed-out':'offline');}
   finally{if(token===epoch){busy=null;if(again&&status!=='offline'&&status!=='signed-out'){cancel(timer);timer=schedule(()=>{void sync();},700);}}}
  })();
  return busy;
 }
 return {
  async start(id,{hasLocalData=false}={}){
   epoch++;cancel(timer);owner=id;busy=null;again=false;hasLocal=hasLocalData;baseline={};bootstrap=true;
   try{const saved=JSON.parse(storage?.getItem(key())||'null');if(saved&&typeof saved==='object'&&!Array.isArray(saved)){baseline=saved;bootstrap=false;}}catch{/* Import existing local records once. */}
   await sync();
  },
  changed,sync,
  stop(){epoch++;cancel(timer);owner=null;busy=null;again=false;report('idle');},
  status:()=>status,
 };
}
