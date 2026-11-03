// Helpers every Git command shares: option parsing, pathspecs, tree
// comparisons, diff printing and the three-way merge applied to a repository.
import {writeBlob,commitOf,short,subject,treeFiles,mergeBase} from './core.js';
import {resolvePath,relTo,worktree,headCommit,headTree,writeWt,deleteWt,writeBlobId,currentBranch,wtAbs,updateRef} from './repo.js';
import {hunks,hunkBody,countChanges,renameLabel,statLines,shortstat,merge3} from './diff.js';
import {C} from './format.js';

/* ------------------------------------------------------------ options */
/**
 * Parses Git-style options. spec.bool maps a flag to a key, spec.val maps an
 * option that takes a value. Short flags may be bundled (-am "msg"), long
 * options may use "=". Everything after "--" lands in `paths`.
 */
export function parse(args,spec={}){
 const o={_:[],paths:null},bool=spec.bool||{},val=spec.val||{},multi=new Set(spec.multi||[]);
 const set=(k,v)=>{if(multi.has(k))(o[k]??=[]).push(v);else o[k]=v;};
 for(let i=0;i<args.length;i++){
  const a=args[i];
  if(o.paths){o.paths.push(a);continue;}
  if(a==='--'){o.paths=[];continue;}
  if(a.startsWith('--')&&a.length>2){
   const eq=a.indexOf('='),k=eq>0?a.slice(0,eq):a;
   if(k in val){const v=eq>0?a.slice(eq+1):args[++i];if(v===undefined)return {error:`option \`${k.slice(2)}' requires a value`};set(val[k],v);continue;}
   if(a in bool){o[bool[a]]=true;continue;}
   if(a.startsWith('--no-')&&('--'+a.slice(5)) in bool){o[bool['--'+a.slice(5)]]=false;continue;}
   return {error:`unknown option \`${a.slice(2)}'`};
  }
  if(a.length>1&&a[0]==='-'){
   if(/^-\d+$/.test(a)&&spec.count){o.count=Number(a.slice(1));continue;}
   for(let j=1;j<a.length;j++){
    const k='-'+a[j];
    if(k in val){const v=j+1<a.length?a.slice(j+1):args[++i];if(v===undefined)return {error:`switch \`${a[j]}' requires a value`};set(val[k],v);break;}
    if(k in bool){o[bool[k]]=true;continue;}
    return {error:`unknown switch \`${a[j]}'`};
   }
   continue;
  }
  o._.push(a);
 }
 return o;
}

/* ------------------------------------------------------------ paths */
/** A path the learner typed, relative to the repository root ('' is the root). Null when outside. */
export function repoRel(world,r,p){
 const abs=resolvePath(world,p);
 if(abs===r.path)return '';
 if(!abs.startsWith(r.path+'/'))return null;
 return abs.slice(r.path.length+1);
}
const globRe=g=>new RegExp('^'+g.split('').map(c=>c==='*'?'.*':c==='?'?'.':c.replace(/[.+^${}()|[\]\\]/g,'\\$&')).join('')+'$');
/** Whether a repository path matches a pathspec ('' matches everything, directories match their contents, * and ? glob). */
export function matches(spec,path){
 if(spec==='')return true;
 if(path===spec||path.startsWith(spec+'/'))return true;
 if(/[*?]/.test(spec))return globRe(spec).test(path);
 return false;
}
/** Shown relative to the current directory, the way status and diff stats print paths. */
export function shown(world,r,rel){
 const cwdRel=world.cwd===r.path?'':world.cwd.startsWith(r.path+'/')?world.cwd.slice(r.path.length+1):'';
 return cwdRel?relTo('/'+cwdRel,'/'+rel)||'.':rel;
}

/* ------------------------------------------------------------ trees */
export const textOf=(world,id)=>id?world.objects[id]?.c??'':'';
/** Changes between two {path: text} maps, with exact renames detected. */
export function changes(A,B){
 /** @type {{status:string,path:string,a:string,b:string,from?:string,gone?:boolean}[]} */
 const out=[];
 for(const p of [...new Set([...Object.keys(A),...Object.keys(B)])].sort(cmp)){
  const a=A[p],b=B[p];
  if(a===b)continue;
  if(a===undefined)out.push({status:'A',path:p,a:'',b});
  else if(b===undefined)out.push({status:'D',path:p,a,b:''});
  else out.push({status:'M',path:p,a,b});
 }
 const dels=out.filter(c=>c.status==='D'),adds=out.filter(c=>c.status==='A');
 for(const d of dels){const n=adds.find(x=>x.status==='A'&&x.b===d.a&&d.a!=='');if(n){n.status='R';n.from=d.path;n.a=d.a;d.gone=true;}}
 return out.filter(c=>!c.gone);
}
export const cmp=(a,b)=>a<b?-1:a>b?1:0;
export const texts=(world,flat)=>Object.fromEntries(Object.entries(flat).map(([p,id])=>[p,textOf(world,id)]));
export const commitTexts=(world,id)=>id?texts(world,treeFiles(world,id)):{};
export const indexTexts=(world,r)=>texts(world,r.index);
export function worktreeTracked(world,r){const W=worktree(world,r),out={};for(const p of Object.keys(r.index))if(p in W)out[p]=W[p];for(const p of Object.keys(r.unmerged||{}))if(p in W)out[p]=W[p];return out;}

/* ------------------------------------------------------------ diff output */
const id7=text=>text===''?'0000000':short(writeBlobId(text));
/** Prints `git diff` patches for a list of changes. */
export function patch(list,p,{nul=false}={}){
 for(const c of list){
  const from=c.from??c.path;
  p(C.bold(`diff --git a/${from} b/${c.path}`));
  if(c.status==='A'){p(C.bold('new file mode 100644'));p(C.bold(`index 0000000..${nul?'0000000':id7(c.b)}`));}
  else if(c.status==='D'){p(C.bold('deleted file mode 100644'));p(C.bold(`index ${id7(c.a)}..0000000`));}
  else if(c.status==='R'){p(C.bold('similarity index 100%'));p(C.bold(`rename from ${c.from}`));p(C.bold(`rename to ${c.path}`));continue;}
  else p(C.bold(`index ${id7(c.a)}..${id7(c.b)} 100644`));
  const hs=hunks(c.a,c.b);if(!hs.length)continue;
  p(C.bold(c.status==='A'?'--- /dev/null':`--- a/${from}`));p(C.bold(c.status==='D'?'+++ /dev/null':`+++ b/${c.path}`));
  for(const h of hs){
   p(C.cyan(h.header)+(h.func?' '+h.func:''));
   for(const [t,l] of hunkBody(h))p(t==='+'?C.green('+'+l):t==='-'?C.red('-'+l):t==='\\'?'\\'+l:' '+l);
  }
 }
}
export function statEntries(list){
 return list.map(c=>{const n=c.status==='R'?{ins:0,del:0}:countChanges(c.a,c.b);return {name:c.status==='R'?renameLabel(c.from,c.path):c.path,...n};});
}
export function printStat(list,p){for(const l of statLines(statEntries(list),{green:C.green,red:C.red}))p(l);}
/** The lines `git commit` prints after its summary: shortstat plus create/delete/rename modes. */
export function commitSummary(list,p){
 if(!list.length){p(' 0 files changed');return;}
 p(shortstat(statEntries(list)));
 modeLines(list,p);
}
export function modeLines(list,p){
 for(const c of [...list].sort((x,y)=>cmp(x.path,y.path))){
  if(c.status==='A')p(` create mode 100644 ${c.path}`);
  else if(c.status==='D')p(` delete mode 100644 ${c.path}`);
  else if(c.status==='R')p(` rename ${renameLabel(c.from,c.path)} (100%)`);
 }
}

/* ------------------------------------------------------------ local changes */
/** Paths whose index or working copy differs from HEAD (tracked files only). */
export function dirtyPaths(world,r){
 const H=headTree(world,r),W=worktree(world,r),out=new Set();
 for(const p of new Set([...Object.keys(H),...Object.keys(r.index)])){
  if(H[p]!==r.index[p])out.add(p);
  else if(p in r.index&&(!(p in W)||writeBlobId(W[p])!==r.index[p]))out.add(p);
 }
 return out;
}

/* ------------------------------------------------------------ three-way merge */
/**
 * Merges `theirs` into the current HEAD with `base` as the common ancestor.
 * Returns what would change without touching anything, so callers can refuse
 * when local changes are in the way.
 */
export function plan3(world,base,ours,theirs,labels){
 const B=base?treeFiles(world,base):{},O=ours?treeFiles(world,ours):{},T=theirs?treeFiles(world,theirs):{};
 const result={...O},conflicts=[],messages=[],touched=new Set();
 for(const p of [...new Set([...Object.keys(B),...Object.keys(O),...Object.keys(T)])].sort(cmp)){
  const b=B[p],o=O[p],t=T[p];
  if(o===t)continue;
  if(b===o){if(t)result[p]=t;else delete result[p];touched.add(p);continue;}
  if(b===t)continue;
  touched.add(p);
  if(o&&t){
   messages.push(`Auto-merging ${p}`);
   const m=merge3(textOf(world,b),textOf(world,o),textOf(world,t),labels);
   if(m.clean){result[p]=writeBlob(world,m.text);continue;}
   messages.push(`CONFLICT (${b?'content':'add/add'}): Merge conflict in ${p}`);
   conflicts.push({path:p,kind:b?'both modified':'both added',base:b??null,ours:o,theirs:t,text:m.text});
  }else if(o){
   messages.push(`CONFLICT (modify/delete): ${p} deleted in ${labels.theirs} and modified in ${labels.ours}.  Version ${labels.ours} of ${p} left in tree.`);
   conflicts.push({path:p,kind:'deleted by them',base:b,ours:o,theirs:null,text:textOf(world,o)});
  }else{
   messages.push(`CONFLICT (modify/delete): ${p} deleted in ${labels.ours} and modified in ${labels.theirs}.  Version ${labels.theirs} of ${p} left in tree.`);
   conflicts.push({path:p,kind:'deleted by us',base:b,ours:null,theirs:t,text:textOf(world,t)});
  }
 }
 return {result,conflicts,messages,touched,ours:O};
}
/** Files the merge would overwrite: local edits to touched paths, or untracked files in the way. */
export function blockers(world,r,plan){
 const dirty=dirtyPaths(world,r),W=worktree(world,r);
 const local=[...plan.touched].filter(p=>dirty.has(p)).sort(cmp);
 const untracked=[...plan.touched].filter(p=>!(p in r.index)&&!(p in plan.ours)&&p in W&&(plan.result[p]!==undefined||plan.conflicts.some(c=>c.path===p))&&writeBlobId(W[p])!==plan.result[p]).sort(cmp);
 return {local,untracked};
}
export function printBlockers(p,b,op){
 if(b.local.length){p(`error: Your local changes to the following files would be overwritten by ${op}:`);for(const x of b.local)p('\t'+x);p(`Please commit your changes or stash them before you ${op==='checkout'?'switch branches':op}.`);p('Aborting');return true;}
 if(b.untracked.length){p(`error: The following untracked working tree files would be overwritten by ${op}:`);for(const x of b.untracked)p('\t'+x);p(`Please move or remove them before you ${op==='checkout'?'switch branches':op}.`);p('Aborting');return true;}
 return false;
}
/** Writes a planned merge into the index and working tree; conflicted paths become unmerged. */
export function applyPlan(world,r,plan){
 const O=plan.ours;
 for(const p of plan.touched){
  const c=plan.conflicts.find(x=>x.path===p);
  if(c){
   writeWt(world,r,p,c.text);
   if(c.ours)r.index[p]=c.ours;else delete r.index[p];
   (r.unmerged??={})[p]={kind:c.kind,base:c.base,ours:c.ours,theirs:c.theirs};
   continue;
  }
  const id=plan.result[p];
  if(id===undefined){if(p in O||p in r.index){delete r.index[p];deleteWt(world,r,p);}}
  else{r.index[p]=id;writeWt(world,r,p,textOf(world,id));}
 }
 if(r.unmerged&&!Object.keys(r.unmerged).length)r.unmerged=null;
}
export {mergeBase,commitOf,short,subject,headCommit,currentBranch,updateRef,wtAbs};
