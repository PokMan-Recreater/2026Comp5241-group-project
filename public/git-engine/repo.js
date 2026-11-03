// Repository state on top of the simulated file system: refs, HEAD, the
// index, the working tree, .gitignore and the status Git reports.
import {writeBlob,writeTree,treeFiles,commitOf,peel,short,subject,tick,sha1Hex} from './core.js';

/* ------------------------------------------------------------ paths */
export function normPath(p){
 const abs=p.startsWith('/'),parts=[];
 for(const seg of p.split('/')){if(!seg||seg==='.')continue;if(seg==='..'){parts.pop();continue;}parts.push(seg);}
 return (abs?'/':'')+parts.join('/');
}
export function resolvePath(world,p){
 if(p==='~')return world.home;if(p.startsWith('~/'))p=world.home+p.slice(1);
 return normPath(p.startsWith('/')?p:world.cwd+'/'+p);
}
export const dirname=p=>p.slice(0,p.lastIndexOf('/'))||'/';
export const basename=p=>p.slice(p.lastIndexOf('/')+1);
export function relTo(from,to){
 if(from===to)return '';
 if(to.startsWith(from+'/'))return to.slice(from.length+1);
 const a=from.split('/').filter(Boolean),b=to.split('/').filter(Boolean);let i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++;
 return [...a.slice(i).map(()=>'..'),...b.slice(i)].join('/');
}

/* ------------------------------------------------------------ file system */
export const isFile=(world,abs)=>Object.hasOwn(world.fs,abs);
export function isDir(world,abs){
 if(abs==='/'||world.dirs.includes(abs))return true;
 const pre=abs+'/';return Object.keys(world.fs).some(k=>k.startsWith(pre))||world.dirs.some(d=>d.startsWith(pre))||Object.keys(world.repos).some(r=>r===abs||r.startsWith(pre));
}
export function ensureDir(world,abs){
 const parts=abs.split('/').filter(Boolean);let cur='';
 for(const p of parts){cur+='/'+p;if(!world.dirs.includes(cur))world.dirs.push(cur);}
}
export function writeFs(world,abs,content){ensureDir(world,dirname(abs));world.fs[abs]=content;}
export function removeFs(world,abs){delete world.fs[abs];}
/** Removes directories that became empty, stopping at `stop`. */
export function pruneDirs(world,abs,stop){
 let d=dirname(abs);
 while(d.length>stop.length&&d.startsWith(stop+'/')){
  const pre=d+'/';
  if(Object.keys(world.fs).some(k=>k.startsWith(pre))||world.dirs.some(x=>x.startsWith(pre))||world.repos[d])break;
  world.dirs=world.dirs.filter(x=>x!==d);d=dirname(d);
 }
}
/** Direct children of a directory: [{name, dir}] sorted by name. */
export function listDir(world,abs){
 const pre=abs==='/'?'/':abs+'/',names=new Map();
 for(const k of Object.keys(world.fs))if(k.startsWith(pre)){const rest=k.slice(pre.length),i=rest.indexOf('/');names.set(i<0?rest:rest.slice(0,i),i>=0||names.get(i<0?rest:rest.slice(0,i))===true);}
 for(const d of [...world.dirs,...Object.keys(world.repos)])if(d.startsWith(pre)){const rest=d.slice(pre.length),n=rest.split('/')[0];if(n)names.set(n,true);}
 for(const r of Object.keys(world.repos))if(r===abs)names.set('.git',true);
 return [...names].map(([name,dir])=>({name,dir})).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0);
}

/* ------------------------------------------------------------ repositories */
export function newRepo(world,path,branch){
 const b=branch||world.global['init.defaultbranch']||'master';
 const r={path,head:{ref:'refs/heads/'+b},refs:{},index:{},unmerged:null,config:{},stash:[],reflog:[],merge:null,seq:null,orig:null,fetchHead:null};
 world.repos[path]=r;ensureDir(world,path);return r;
}
export function findRepo(world,cwd=world.cwd){
 let d=cwd;
 while(true){if(world.repos[d])return world.repos[d];if(d==='/'||!d)return null;d=dirname(d);}
}
export const headRef=r=>r.head.ref||null;
export const currentBranch=r=>r.head.ref?.startsWith('refs/heads/')?r.head.ref.slice(11):null;
export const headCommit=r=>r.head.ref?r.refs[r.head.ref]??null:r.head.sha;
export function config(world,r,key){key=key.toLowerCase();return r?.config[key]??world.global[key];}
export function identity(world,r){
 const name=config(world,r,'user.name'),email=config(world,r,'user.email');
 return name&&email?{name,email}:null;
}
export function sig(world,r){const id=identity(world,r),t=tick(world);return {...id,time:t.time,tz:t.tz};}
/** Moves a ref (and HEAD's reflog when HEAD points at it). */
export function updateRef(world,r,ref,id,msg,{log=true}={}){
 const old=ref==='HEAD'?headCommit(r):r.refs[ref]??null;
 if(ref==='HEAD'){if(r.head.ref){r.refs[r.head.ref]=id;}else r.head={sha:id};}
 else if(id==null)delete r.refs[ref];else r.refs[ref]=id;
 if(log&&(ref==='HEAD'||ref===r.head.ref))r.reflog.push({id,old,msg});
}
export function logHead(r,id,msg){r.reflog.push({id,old:null,msg});}
export const upstreamOf=(world,r,branch)=>{
 const remote=r.config[`branch.${branch}.remote`],merge=r.config[`branch.${branch}.merge`];
 if(!remote||!merge)return null;return {remote,branch:merge.replace('refs/heads/',''),ref:`refs/remotes/${remote}/${merge.replace('refs/heads/','')}`};
};

/* ------------------------------------------------------------ revisions */
export function resolveRev(world,r,spec){
 if(!spec)return null;
 const m=spec.match(/^(.*?)((?:[~^]\d*)*)$/);let base=m[1],ops=m[2];
 let id=resolveBase(world,r,base);if(!id)return null;
 const re=/([~^])(\d*)/g;let x;
 while((x=re.exec(ops))){
  id=peel(world,id);const c=commitOf(world,id);if(!c)return null;
  const n=x[2]===''?1:Number(x[2]);
  if(x[1]==='~'){for(let i=0;i<n;i++){const cc=commitOf(world,id);if(!cc?.parents[0])return null;id=cc.parents[0];}}
  else{if(n===0)continue;id=c.parents[n-1];if(!id)return null;}
 }
 return id;
}
function resolveBase(world,r,base){
 if(base==='HEAD'||base==='@'||base==='')return headCommit(r);
 if(base==='ORIG_HEAD')return r.orig;if(base==='MERGE_HEAD')return r.merge?.head??null;if(base==='FETCH_HEAD')return r.fetchHead?.id??null;
 if(base==='CHERRY_PICK_HEAD'||base==='REVERT_HEAD')return r.seq?.current??null;
 let m=base.match(/^(.*)@\{(\d+)\}$/);
 if(m){const n=Number(m[2]);if(m[1]==='stash'||m[1]==='refs/stash')return r.stash[n]?.id??null;if(m[1]===''||m[1]==='HEAD'){const e=r.reflog[r.reflog.length-1-n];return e?.id??null;}return null;}
 if(base==='stash')return r.stash[0]?.id??null;
 m=base.match(/^(.*)@\{(u|upstream)\}$/);
 if(m){const b=m[1]||currentBranch(r);const u=b&&upstreamOf(world,r,b);return u?r.refs[u.ref]??null:null;}
 for(const ref of [base,'refs/'+base,'refs/tags/'+base,'refs/heads/'+base,'refs/remotes/'+base])if(r.refs[ref])return r.refs[ref];
 const rh=base.match(/^(?:refs\/remotes\/)?([^/]+)(?:\/HEAD)?$/);
 if(rh&&r.remoteHead?.[rh[1]])return r.refs[`refs/remotes/${rh[1]}/${r.remoteHead[rh[1]]}`]??null;
 if(/^[0-9a-f]{4,40}$/.test(base)){const hits=Object.keys(world.objects).filter(k=>k.startsWith(base));if(hits.length===1)return hits[0];}
 return null;
}
export const resolveCommit=(world,r,spec)=>{const id=resolveRev(world,r,spec);if(!id)return null;const p=peel(world,id);return commitOf(world,p)?p:null;};

/* ------------------------------------------------------------ worktree */
/** Every file in the working tree as {relativePath: content}. */
export function worktree(world,r){
 const pre=r.path+'/',out={},nested=Object.keys(world.repos).filter(p=>p!==r.path&&p.startsWith(pre));
 for(const [k,v] of Object.entries(world.fs)){if(!k.startsWith(pre))continue;if(nested.some(n=>k.startsWith(n+'/')))continue;out[k.slice(pre.length)]=v;}
 return out;
}
export const wtAbs=(r,rel)=>r.path+'/'+rel;
export function writeWt(world,r,rel,content){writeFs(world,wtAbs(r,rel),content);}
export function deleteWt(world,r,rel){removeFs(world,wtAbs(r,rel));pruneDirs(world,wtAbs(r,rel),r.path);}

/* ------------------------------------------------------------ ignore */
function globToRe(glob){
 let re='';
 for(let i=0;i<glob.length;i++){
  const c=glob[i];
  if(c==='*'){if(glob[i+1]==='*'){re+='.*';i++;if(glob[i+1]==='/')i++;}else re+='[^/]*';}
  else if(c==='?')re+='[^/]';
  else re+=c.replace(/[.+^${}()|[\]\\]/g,'\\$&');
 }
 return re;
}
export function ignoreRules(world,r){
 const text=world.fs[wtAbs(r,'.gitignore')]??'';
 return text.split('\n').map(l=>l.replace(/\s+$/,'')).filter(l=>l&&!l.startsWith('#')).map(l=>{
  let neg=false;if(l.startsWith('!')){neg=true;l=l.slice(1);}
  let dirOnly=false;if(l.endsWith('/')){dirOnly=true;l=l.slice(0,-1);}
  const anchored=l.includes('/');if(l.startsWith('/'))l=l.slice(1);
  const re=new RegExp('^'+(anchored?'':'(?:.*/)?')+globToRe(l)+'$');
  return {neg,dirOnly,re};
 });
}
/** Whether a working-tree path is ignored (directories in its path count). */
export function isIgnored(rules,rel){
 const parts=rel.split('/');
 for(let i=1;i<=parts.length;i++){
  const p=parts.slice(0,i).join('/'),dir=i<parts.length;let hit=false;
  for(const rule of rules){if(rule.dirOnly&&!dir)continue;if(rule.re.test(p))hit=!rule.neg;}
  if(hit)return true;
 }
 return false;
}

/* ------------------------------------------------------------ status */
export function headTree(world,r){const h=headCommit(r);return h?treeFiles(world,h):{};}
/**
 * Everything `git status` needs: staged, unstaged and untracked changes plus
 * unmerged paths, each sorted by path the way Git lists them.
 */
export function statusData(world,r){
 const H=headTree(world,r),I=r.index,W=worktree(world,r),rules=ignoreRules(world,r);
 const unmerged=r.unmerged?Object.keys(r.unmerged).sort():[];
 /** @type {{path:string,kind:string,from?:string,gone?:boolean}[]} */
 const staged=[];
 for(const p of new Set([...Object.keys(H),...Object.keys(I)])){
  if(unmerged.includes(p))continue;
  if(!(p in I))staged.push({path:p,kind:'deleted'});else if(!(p in H))staged.push({path:p,kind:'new file'});else if(H[p]!==I[p])staged.push({path:p,kind:'modified'});
 }
 // exact renames: a deleted path and a new path with the same blob
 const dels=staged.filter(s=>s.kind==='deleted'),adds=staged.filter(s=>s.kind==='new file');
 for(const d of dels){const a=adds.find(a=>!a.from&&I[a.path]===H[d.path]);if(a){a.kind='renamed';a.from=d.path;d.gone=true;}}
 const stagedList=staged.filter(s=>!s.gone).sort((a,b)=>cmp(a.path,b.path));
 const unstaged=[];
 for(const p of Object.keys(I)){
  if(!(p in W))unstaged.push({path:p,kind:'deleted'});else if(writeBlobId(W[p])!==I[p])unstaged.push({path:p,kind:'modified'});
 }
 unstaged.sort((a,b)=>cmp(a.path,b.path));
 const tracked=new Set([...Object.keys(I),...unmerged]);
 const untrackedFiles=Object.keys(W).filter(p=>!tracked.has(p)&&!isIgnored(rules,p)).sort(cmp);
 const ignoredFiles=Object.keys(W).filter(p=>!tracked.has(p)&&isIgnored(rules,p)).sort(cmp);
 return {staged:stagedList,unstaged,untracked:collapseUntracked(untrackedFiles,tracked),untrackedFiles,ignored:collapseUntracked(ignoredFiles,tracked),unmerged};
}
const cmp=(a,b)=>a<b?-1:a>b?1:0;
// Blob ids for working-tree comparison (hash without storing).
const blobCache=new Map();
export function writeBlobId(content){
 if(blobCache.has(content))return blobCache.get(content);
 const bytes=new TextEncoder().encode(content).length,id=sha1Hex(`blob ${bytes}\0${content}`);
 if(blobCache.size>2000)blobCache.clear();blobCache.set(content,id);return id;
}
/** Shows an untracked directory as "dir/" when nothing inside it is tracked. */
export function collapseUntracked(files,tracked){
 const trackedDirs=new Set();for(const p of tracked){const parts=p.split('/');for(let i=1;i<parts.length;i++)trackedDirs.add(parts.slice(0,i).join('/'));}
 const out=new Set();
 for(const f of files){
  const parts=f.split('/');let shown=f;
  for(let i=1;i<parts.length;i++){const d=parts.slice(0,i).join('/');if(!trackedDirs.has(d)){shown=d+'/';break;}}
  out.add(shown);
 }
 return [...out].sort(cmp);
}
export const hasStagedChanges=(world,r)=>statusData(world,r).staged.length>0;

/* ------------------------------------------------------------ index */
export function addToIndex(world,r,rel){const content=world.fs[wtAbs(r,rel)];if(content===undefined){delete r.index[rel];}else r.index[rel]=writeBlob(world,content);}
export const indexTree=(world,r)=>writeTree(world,r.index);

/**
 * Moves HEAD's files to `target`'s files, keeping local changes in files the
 * move does not touch. Returns {error, dirty:[paths]} without changing
 * anything when local changes or untracked files would be overwritten.
 */
export function checkoutTree(world,r,target,{force=false,op='checkout'}={}){
 const from=headTree(world,r),to=target?treeFiles(world,target):{},W=worktree(world,r);
 const changed=[...new Set([...Object.keys(from),...Object.keys(to)])].filter(p=>from[p]!==to[p]).sort(cmp);
 if(!force){
  const dirty=changed.filter(p=>(r.index[p]!==from[p])||(p in r.index&&p in W&&writeBlobId(W[p])!==r.index[p])||(p in r.index&&!(p in W)&&p in from));
  if(dirty.length)return {error:'dirty',paths:dirty};
  const rules=ignoreRules(world,r);
  const untracked=changed.filter(p=>!(p in from)&&p in to&&p in W&&!(p in r.index)&&writeBlobId(W[p])!==to[p]&&!isIgnored(rules,p));
  if(untracked.length)return {error:'untracked',paths:untracked};
 }
 for(const p of changed){
  if(p in to){writeWt(world,r,p,world.objects[to[p]].c);r.index[p]=to[p];}
  else{if(p in W)deleteWt(world,r,p);delete r.index[p];}
 }
 if(force){
  for(const p of Object.keys(r.index))if(!(p in to)){if(p in W)deleteWt(world,r,p);delete r.index[p];}
  for(const [p,id] of Object.entries(to)){if(r.index[p]!==id||!(p in W)||writeBlobId(W[p])!==id){writeWt(world,r,p,world.objects[id].c);r.index[p]=id;}}
 }
 return {error:null,changed};
}
export function describeCommit(world,id){const c=commitOf(world,id);return `${short(id)} ${subject(c?.msg)}`;}
