// A small GitHub: bare repositories that push, fetch and clone talk to,
// plus pull requests and teammates who push their own commits.
import {writeBlob,writeTree,writeCommit,treeFiles,commitOf,isAncestor,mergeBase,tick,ancestors} from './core.js';
import {merge3} from './diff.js';

export const normUrl=url=>String(url||'').trim().replace(/\/+$/,'').replace(/\.git$/,'').toLowerCase();
export function createServer(world,{owner,name,defaultBranch='main',description=''}){
 const url=`https://github.com/${owner}/${name}.git`;
 world.servers[normUrl(url)]={owner,name,url,refs:{},head:defaultBranch,prs:[],issues:[],nextNum:1,description,events:[]};
 return world.servers[normUrl(url)];
}
export const serverFor=(world,url)=>world.servers[normUrl(url)]??null;
/** Every object reachable from the given commits (commits, trees, blobs). */
export function objectClosure(world,commits){
 const out=new Set();
 const walkTree=id=>{if(out.has(id))return;out.add(id);const t=world.objects[id];if(t?.t==='tree')for(const [,,x] of t.e)walkTree(x);};
 const starts=[];
 for(let id of commits){while(world.objects[id]?.t==='tag'){out.add(id);id=world.objects[id].obj;}if(commitOf(world,id))starts.push(id);}
 for(const c of ancestors(world,starts)){const co=commitOf(world,c);if(!co)continue;out.add(c);walkTree(co.tree);}
 return out;
}
/** A teammate commits straight onto a branch on GitHub (as if they pushed from their laptop). */
export function serverCommit(world,server,branch,{author,message,files={},from=null}){
 const parent=server.refs['refs/heads/'+branch]??server.refs['refs/heads/'+(from||server.head)]??null,flat=parent?treeFiles(world,parent):{};
 for(const [p,c] of Object.entries(files)){if(c==null)delete flat[p];else flat[p]=writeBlob(world,c);}
 const t=tick(world),who={...author,time:t.time,tz:t.tz};
 const id=writeCommit(world,{tree:writeTree(world,flat),parents:parent?[parent]:[],author:who,committer:who,message:message.endsWith('\n')?message:message+'\n'});
 server.refs['refs/heads/'+branch]=id;
 server.events.push({type:'push',branch,author:author.name,id,message});
 return id;
}
export function openPullRequest(world,server,{head,base,title,body='',author}){
 const pr={number:server.nextNum++,title,body,head,base,author,state:'open',reviews:[],comments:[]};
 server.prs.push(pr);server.events.push({type:'pr',number:pr.number});return pr;
}
/** Whether GitHub could merge the pull request without conflicts. */
export function prMergeable(world,server,pr){
 const b=server.refs['refs/heads/'+pr.base],h=server.refs['refs/heads/'+pr.head];
 if(!h)return {ok:false,reason:'missing'};
 if(b&&isAncestor(world,h,b))return {ok:false,reason:'merged'};
 return mergeTrees(world,b,h).conflicts.length?{ok:false,reason:'conflict'}:{ok:true};
}
export function mergeTrees(world,ours,theirs){
 const base=mergeBase(world,ours,theirs),B=base?treeFiles(world,base):{},O=ours?treeFiles(world,ours):{},T=treeFiles(world,theirs),out={...O},conflicts=[];
 for(const p of new Set([...Object.keys(B),...Object.keys(O),...Object.keys(T)])){
  const b=B[p],o=O[p],t=T[p];
  if(o===t)continue;if(b===o){if(t)out[p]=t;else delete out[p];continue;}if(b===t)continue;
  if(!o||!t){conflicts.push(p);continue;}
  const m=merge3(b?world.objects[b].c:'',world.objects[o].c,world.objects[t].c);
  if(!m.clean)conflicts.push(p);else out[p]=writeBlob(world,m.text);
 }
 return {tree:out,conflicts};
}
/** Merges a pull request with a merge commit, as GitHub's default button does. */
export function mergePullRequest(world,server,pr,{user}){
 const check=prMergeable(world,server,pr);if(!check.ok)return check;
 const b=server.refs['refs/heads/'+pr.base],h=server.refs['refs/heads/'+pr.head];
 const {tree}=mergeTrees(world,b,h),t=tick(world);
 const author={...user,time:t.time,tz:t.tz},committer={name:'GitHub',email:'noreply@github.com',time:t.time,tz:t.tz};
 const id=writeCommit(world,{tree:writeTree(world,tree),parents:b?[b,h]:[h],author,committer,message:`Merge pull request #${pr.number} from ${server.owner}/${pr.head}\n\n${pr.title}\n`});
 server.refs['refs/heads/'+pr.base]=id;pr.state='merged';pr.mergeCommit=id;server.events.push({type:'merge',number:pr.number,id});
 return {ok:true,id};
}
