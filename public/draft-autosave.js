// One writer per editor. A change made during a request is saved in the next
// request with the returned revision, never overwritten by an older response.
export function createDraftAutosave({snapshot,save,onState,delay=1200}){
 let version=0,saved=0,timer,active=null,stopped=false,paused=false;
 const schedule=()=>{clearTimeout(timer);if(!stopped&&!paused)timer=setTimeout(()=>{void flush().catch(()=>{});},delay);};
 async function flush(){
  clearTimeout(timer);
  if(active){await active;return flush();}
  if(stopped||paused||saved===version)return;
  active=(async()=>{
   while(!stopped&&!paused&&saved!==version){
    const sent=version,payload=structuredClone(snapshot());onState('saving');
    try{await save(payload);saved=sent;onState(saved===version?'saved':'pending');}
    catch(error){onState('error',error);throw error;}
   }
  })();
  try{await active;}finally{active=null;}
 }
 return {change(){version++;onState('pending');schedule();},flush,pause(){paused=true;clearTimeout(timer);},resume(){paused=false;if(saved!==version)schedule();},retry(){if(saved!==version)schedule();},dispose(){stopped=true;clearTimeout(timer);}};
}
