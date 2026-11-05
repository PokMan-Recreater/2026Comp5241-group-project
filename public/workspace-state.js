// Shared by the browser and API. XP remains derived from completed activities.
export const workspaceFields=['profile','courses','progress','notes','code','events','work','checks','path','game','academy','deliveryLesson','deliveryAnnotations','deliveryTheme','deliveryPenColor','gitProgress'];
const forbidden=new Set(['__proto__','prototype','constructor']);
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const copy=value=>JSON.parse(JSON.stringify(value));
export function sameValue(a,b){
 if(Object.is(a,b))return true;
 if(Array.isArray(a)||Array.isArray(b))return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((value,index)=>sameValue(value,b[index]));
 if(!object(a)||!object(b))return false;
 const keys=Object.keys(a);return keys.length===Object.keys(b).length&&keys.every(key=>Object.hasOwn(b,key)&&sameValue(a[key],b[key]));
}
const member=(a,b)=>{
 if(object(a)&&object(b)&&typeof a.id==='string'&&typeof b.id==='string'){
  if(a.id!==b.id)return false;
  if(typeof a.type==='string'&&(typeof a.at==='string'||typeof a.time==='string'))return a.type===b.type&&(a.at??a.time)===(b.at??b.time);
  return true;
 }
 return sameValue(a,b);
};
export function workspaceSnapshot(state){return Object.fromEntries(workspaceFields.filter(key=>state[key]!==undefined).map(key=>[key,copy(state[key])]));}
export function workspaceChanges(before,after,{bootstrap=false}={}){
 const operations=[];
 function walk(old,value,path){
  if(sameValue(old,value))return;
  if(value===undefined){operations.push({type:'delete',path});return;}
  if(Array.isArray(value)){
   const previous=Array.isArray(old)?old:[];
   for(const item of previous)if(!value.some(other=>member(item,other)))operations.push({type:'discard',path,value:item});
   for(const item of value){const previousItem=previous.find(other=>member(item,other));if(!sameValue(previousItem,item))operations.push({type:'append',path,value:item,bootstrap});}
   // An empty array is still a meaningful value, e.g. after an explicit reset.
   if(!Array.isArray(old)&&!value.length)operations.push({type:'set',path,value:[],bootstrap});
   return;
  }
  if(object(value)){
   const previous=object(old)?old:{};
   const keys=new Set([...Object.keys(previous),...Object.keys(value)]);
   for(const key of keys)if(!forbidden.has(key))walk(previous[key],value[key],[...path,key]);
   if(!keys.size&&old===undefined)operations.push({type:'set',path,value:{},bootstrap});
   return;
  }
  operations.push({type:'set',path,value,bootstrap,...(old!==undefined?{before:old}:{})});
 }
 for(const key of workspaceFields)walk(before?.[key],after?.[key],[key]);
 return operations;
}
export function validWorkspaceOperations(operations){
 if(!Array.isArray(operations)||operations.length>3000)return false;
 return operations.every(op=>op&&['set','delete','append','discard'].includes(op.type)&&Array.isArray(op.path)&&op.path.length>=1&&op.path.length<=20&&workspaceFields.includes(op.path[0])&&op.path.every(key=>typeof key==='string'&&key.length>0&&key.length<=180&&!forbidden.has(key))&&(op.type==='delete'||op.value!==undefined));
}
// Mirrors the database merge for reapplying edits made while a request is in flight.
export function applyWorkspaceOperations(input,operations){
 const state=copy(input||{});
 for(const op of operations){
  let parent=state;
  for(const part of op.path.slice(0,-1)){if(!object(parent[part]))parent[part]={};parent=parent[part];}
  const key=op.path.at(-1),current=parent[key];
  if(op.type==='delete'){delete parent[key];continue;}
  if(op.type==='set'){
   if(op.bootstrap&&current!==undefined)continue;
   if(['passed','correct','done'].includes(key)&&current===true&&op.value===false&&op.before!==true)continue;
   parent[key]=copy(op.value);continue;
  }
  const list=Array.isArray(current)?current:[],index=list.findIndex(item=>member(item,op.value));
  if(op.type==='discard'){parent[key]=list.filter(item=>!member(item,op.value));continue;}
  if(index<0)list.push(copy(op.value));else if(!op.bootstrap)list[index]=copy(op.value);
  parent[key]=list;
 }
 return state;
}
