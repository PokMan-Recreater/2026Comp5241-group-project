// History-changing commands: merge, rebase, cherry-pick, revert and stash.
// Each prints Git 2.43's messages and leaves the same in-progress state
// (MERGE_HEAD, the rebase todo list, unmerged paths) for --continue/--abort.
import {writeBlob,writeTree,writeCommit,commitOf,short,subject,treeFiles,isAncestor,mergeBase,revList} from './core.js';
import {headCommit,currentBranch,identity,sig,updateRef,logHead,upstreamOf,resolveCommit,resolveRev,worktree,checkoutTree,headTree,indexTree,writeWt,deleteWt,writeBlobId,statusData,config} from './repo.js';
import {C} from './format.js';
import {parse,changes,commitTexts,printStat,patch,plan3,blockers,printBlockers,applyPlan,dirtyPaths,textOf,cmp,modeLines} from './util.js';
import {longStatus,makeCommit,noIdentityLines,USAGE} from './git.js';

const bad=(p,name,o)=>{p(`error: ${o.error}`);p(`usage: ${USAGE[name]||'git '+name}`);return 129;};
const needIdentity=(world,r,p)=>{if(identity(world,r))return false;noIdentityLines(world,p);return true;};

/* ------------------------------------------------------------ merge */
/** Default message Git writes for merging `name` into the current branch. */
export function mergeMessage(world,r,name,{url=null,branchName=null}={}){
 const cur=currentBranch(r),into=cur&&cur!==(world.global['init.defaultbranch']||'main')&&cur!=='master'?` into ${cur}`:'';
 if(url)return `Merge branch '${branchName}' of ${url.replace(/\.git$/,'')}${into}`;
 if(r.refs['refs/heads/'+name])return `Merge branch '${name}'${into}`;
 if(r.refs['refs/remotes/'+name])return `Merge remote-tracking branch '${name}'${into}`;
 if(r.refs['refs/tags/'+name])return `Merge tag '${name}'${into}`;
 return `Merge commit '${name}'${into}`;
}
/** Merges `their` into HEAD: fast-forward when possible, otherwise a merge commit or conflicts. */
export function integrate(world,r,p,{their,label,msg,noFf=false,ffOnly=false,reflog,noCommit=false,squash=false}){
 const head=headCommit(r);
 if(!head){
  const res=checkoutTree(world,r,their);
  if(res.error){printBlockers(p,{local:res.error==='dirty'?res.paths:[],untracked:res.error==='untracked'?res.paths:[]},'merge');return 1;}
  updateRef(world,r,'HEAD',their,`${reflog}: Fast-forward`);return 0;
 }
 if(their===head||isAncestor(world,their,head)){p('Already up to date.');return 0;}
 if(isAncestor(world,head,their)&&!noFf&&!squash){
  p(`Updating ${short(head)}..${short(their)}`);
  const res=checkoutTree(world,r,their);
  if(res.error){printBlockers(p,{local:res.error==='dirty'?res.paths:[],untracked:res.error==='untracked'?res.paths:[]},'merge');return 1;}
  p('Fast-forward');
  {const list=changes(commitTexts(world,head),commitTexts(world,their));printStat(list,p);modeLines(list,p);}
  r.orig=head;updateRef(world,r,'HEAD',their,`${reflog}: Fast-forward`);
  return 0;
 }
 if(ffOnly){p('fatal: Not possible to fast-forward, aborting.');return 128;}
 if(!squash&&needIdentity(world,r,p))return 128;
 const base=mergeBase(world,head,their),plan=plan3(world,base,head,their,{ours:'HEAD',theirs:label});
 if(printBlockers(p,blockers(world,r,plan),'merge'))return 2;
 r.orig=head;
 applyPlan(world,r,plan);
 for(const m of plan.messages)p(m);
 if(squash){
  if(plan.conflicts.length){p('Squash commit -- not updating HEAD');p('Automatic merge failed; fix conflicts and then commit the result.');return 1;}
  p('Squash commit -- not updating HEAD');return 0;
 }
 if(plan.conflicts.length){
  r.merge={head:their,msg:msg+'\n'+(plan.conflicts.length?'\n# Conflicts:\n'+plan.conflicts.map(c=>'#\t'+c.path).join('\n')+'\n':'')};
  r.merge.msg=msg+'\n';
  p('Automatic merge failed; fix conflicts and then commit the result.');
  return 1;
 }
 if(noCommit){r.merge={head:their,msg:msg+'\n'};p('Automatic merge went well; stopped before committing as requested');return 0;}
 const who=sig(world,r),id=writeCommit(world,{tree:indexTree(world,r),parents:[head,their],author:who,committer:who,message:msg+'\n'});
 updateRef(world,r,'HEAD',id,`${reflog}: Merge made by the 'ort' strategy.`);
 p("Merge made by the 'ort' strategy.");
 {const list=changes(commitTexts(world,head),commitTexts(world,id));printStat(list,p);modeLines(list,p);}
 return 0;
}
export function cmdMerge({world,r,args,p}){
 const o=parse(args,{bool:{'--abort':'abort','--continue':'cont','--no-ff':'noFf','--ff-only':'ffOnly','--ff':'ff','--squash':'squash','--no-edit':'noEdit','--edit':'edit','-e':'edit','--no-commit':'noCommit','--commit':'commit','-q':'quiet','--quit':'quit'},val:{'-m':'message','--message':'message'},multi:['message']});
 if(o.error)return bad(p,'merge',o);
 if(o.abort){
  if(!r.merge){p('fatal: There is no merge to abort (MERGE_HEAD missing).');return 128;}
  checkoutTree(world,r,headCommit(r),{force:true});r.merge=null;r.unmerged=null;return 0;
 }
 if(o.quit){r.merge=null;return 0;}
 if(o.cont){
  if(!r.merge){p('fatal: There is no merge in progress (MERGE_HEAD missing).');return 128;}
  return commitMerge(world,r,p);
 }
 if(r.merge||r.unmerged){
  if(r.unmerged){p('error: Merging is not possible because you have unmerged files.');p(C.yellow("hint: Fix them up in the work tree, and then use 'git add/rm <file>'"));p(C.yellow('hint: as appropriate to mark resolution and make a commit.'));p('fatal: Exiting because of an unresolved conflict.');return 128;}
  p('fatal: You have not concluded your merge (MERGE_HEAD exists).');p(C.yellow('hint: Please, commit your changes before merging.'));p('fatal: Exiting because of unfinished merge.');return 128;
 }
 let name=o._[0];
 if(!name){
  const b=currentBranch(r),u=b&&upstreamOf(world,r,b);
  if(!u){p('fatal: No remote for the current branch.');return 128;}
  name=`${u.remote}/${u.branch}`;
 }
 const their=resolveCommit(world,r,name);
 if(!their){p(`merge: ${name} - not something we can merge`);return 1;}
 const msg=o.message?o.message.join('\n\n'):mergeMessage(world,r,name);
 return integrate(world,r,p,{their,label:name,msg,noFf:o.noFf,ffOnly:o.ffOnly,squash:o.squash,noCommit:o.noCommit,reflog:`merge ${name}`});
}
function commitMerge(world,r,p){
 if(r.unmerged){p('error: Committing is not possible because you have unmerged files.');p(C.yellow("hint: Fix them up in the work tree, and then use 'git add/rm <file>'"));p(C.yellow('hint: as appropriate to mark resolution and make a commit.'));p('fatal: Exiting because of an unresolved conflict.');return 128;}
 if(needIdentity(world,r,p))return 128;
 const head=headCommit(r);
 makeCommit(world,r,p,{message:r.merge.msg,parents:[head,r.merge.head],reflog:`commit (merge): ${subject(r.merge.msg)}`});
 r.merge=null;return 0;
}

/* ------------------------------------------------------------ cherry-pick & revert */
function applyOne(world,r,p,{id,op}){
 const c=commitOf(world,id),head=headCommit(r);
 const sub=subject(c.msg);
 const base=op==='revert'?id:c.parents[0]??null,theirs=op==='revert'?c.parents[0]:id;
 const plan=plan3(world,base,head,theirs,{ours:'HEAD',theirs:op==='revert'?`parent of ${short(id)} (${sub})`:`${short(id)} (${sub})`});
 const b=blockers(world,r,plan);
 if(b.local.length||b.untracked.length){
  if(op==='rebase'){printBlockers(p,b,'merge');return {error:true};}
  p(`error: your local changes would be overwritten by ${op}.`);p(C.yellow(`hint: commit your changes or stash them to proceed.`));p(`fatal: ${op} failed`);return {error:true};
 }
 applyPlan(world,r,plan);
 return {plan,sub,c};
}
function seqHints(p,op,id,sub){
 const verb=op==='revert'?'revert':'apply';
 p(`error: could not ${verb} ${short(id)}... ${sub}`);
 if(op==='rebase'){
  for(const l of ['Resolve all conflicts manually, mark them as resolved with','"git add/rm <conflicted_files>", then run "git rebase --continue".','You can instead skip this commit: run "git rebase --skip".','To abort and get back to the state before "git rebase", run "git rebase --abort".'])p(C.yellow('hint: '+l));
  p(`Could not apply ${short(id)}... ${sub}`);return;
 }
 for(const l of ['After resolving the conflicts, mark them with','"git add/rm <pathspec>", then run',`"git ${op} --continue".`,`You can instead skip this commit with "git ${op} --skip".`,`To abort and get back to the state before "git ${op}",`,`run "git ${op} --abort".`,'Disable this message with "git config advice.mergeConflict false"'])p(C.yellow('hint: '+l));
}
function pickLoop(world,r,p,op){
 const seq=r.seq;
 while(seq.todo.length){
  const id=seq.todo.shift(),c=commitOf(world,id);
  if(c.parents.length>1){p(`error: commit ${id} is a merge but no -m option was given.`);p(`fatal: ${op} failed`);r.seq=null;return 128;}
  const res=applyOne(world,r,p,{id,op});
  if(res.error){r.seq=null;return 128;}
  for(const m of res.plan.messages)p(m);
  const msg=op==='revert'?`Revert "${res.sub}"\n\nThis reverts commit ${id}.\n`:c.msg;
  seq.current=id;seq.msg=msg;seq.author=op==='cherry-pick'?{...c.author}:null;
  if(res.plan.conflicts.length){seqHints(p,op,id,res.sub);return 1;}
  if(indexTree(world,r)===commitOf(world,headCommit(r)).tree){
   if(op==='cherry-pick'){p('The previous cherry-pick is now empty, possibly due to conflict resolution.');p('If you wish to commit it anyway, use:');p('');p('    git commit --allow-empty');p('');p("Otherwise, please use 'git cherry-pick --skip'");return 1;}
   continue;
  }
  if(seq.noCommit)continue;
  makeCommit(world,r,p,{message:msg,parents:[headCommit(r)],reflog:`${op}: ${subject(msg)}`,author:seq.author});
 }
 r.seq=null;return 0;
}
function sequencer(name){
 return ({world,r,args,p})=>{
  const o=parse(args,{bool:{'--continue':'cont','--abort':'abort','--skip':'skip','--quit':'quit','-n':'noCommit','--no-commit':'noCommit','--no-edit':'noEdit','-e':'edit','--edit':'edit','-x':'x'},val:{'-m':'mainline'}});
  if(o.error)return bad(p,name,o);
  const seq=r.seq&&r.seq.op===name?r.seq:null;
  if(o.abort||o.quit||o.skip||o.cont){
   if(!seq){p('error: no cherry-pick or revert in progress');p(`fatal: ${name} failed`);return 128;}
   if(o.abort){checkoutTree(world,r,seq.orig,{force:true});updateRef(world,r,'HEAD',seq.orig,`${name}: abort`,{log:false});r.seq=null;r.unmerged=null;return 0;}
   if(o.quit){r.seq=null;return 0;}
   if(o.skip){checkoutTree(world,r,headCommit(r),{force:true});r.unmerged=null;return pickLoop(world,r,p,name);}
   if(r.unmerged){p('error: Committing is not possible because you have unmerged files.');p(C.yellow("hint: Fix them up in the work tree, and then use 'git add/rm <file>'"));p(C.yellow('hint: as appropriate to mark resolution and make a commit.'));p('fatal: Exiting because of an unresolved conflict.');p('U'.repeat(0));return 128;}
   if(indexTree(world,r)!==commitOf(world,headCommit(r)).tree){if(needIdentity(world,r,p))return 128;makeCommit(world,r,p,{message:seq.msg,parents:[headCommit(r)],reflog:`${name}: ${subject(seq.msg)}`,author:seq.author});}
   return pickLoop(world,r,p,name);
  }
  if(r.seq){p(`error: ${r.seq.op==='rebase'?'a rebase':`a ${r.seq.op}`} is already in progress`);p(C.yellow(`hint: try "git ${r.seq.op} (--continue | --abort | --quit)"`));p(`fatal: ${name} failed`);return 128;}
  if(r.merge){p('error: Merging is not possible because you have unmerged files.');return 128;}
  if(!o._.length){p(`usage: ${USAGE[name]}`);return 129;}
  if(!headCommit(r)){p("error: your index file is unmerged.");return 128;}
  if(needIdentity(world,r,p))return 128;
  const list=[];
  for(const a of o._){
   const m=a.match(/^(.*)\.\.(.*)$/);
   if(m){const A=resolveCommit(world,r,m[1]||'HEAD'),B=resolveCommit(world,r,m[2]||'HEAD');if(!A||!B){p(`fatal: bad revision '${a}'`);return 128;}list.push(...revList(world,[B],[A]).sort((x,y)=>commitOf(world,x).committer.time-commitOf(world,y).committer.time));continue;}
   const id=resolveCommit(world,r,a);if(!id){p(`fatal: bad revision '${a}'`);return 128;}list.push(id);
  }
  r.seq={op:name,todo:list,orig:headCommit(r),noCommit:!!o.noCommit};
  return pickLoop(world,r,p,name);
 };
}
export const cmdCherryPick=sequencer('cherry-pick');
export const cmdRevert=sequencer('revert');

/* ------------------------------------------------------------ rebase */
export function cmdRebase({world,r,args,p}){
 const o=parse(args,{bool:{'--continue':'cont','--abort':'abort','--skip':'skip','--quit':'quit','-i':'interactive','--interactive':'interactive','-q':'quiet'},val:{'--onto':'onto'}});
 if(o.error)return bad(p,'rebase',o);
 const seq=r.seq?.op==='rebase'?r.seq:null;
 if(o.abort||o.cont||o.skip||o.quit){
  if(!seq){p('fatal: No rebase in progress?');return 128;}
  if(o.abort){checkoutTree(world,r,seq.orig,{force:true});r.head={ref:'refs/heads/'+seq.branch};logHead(r,seq.orig,`rebase (abort): returning to refs/heads/${seq.branch}`);r.seq=null;r.unmerged=null;return 0;}
  if(o.quit){r.seq=null;return 0;}
  if(o.skip){checkoutTree(world,r,headCommit(r),{force:true});r.unmerged=null;return rebaseLoop(world,r,p);}
  if(r.unmerged){p('You must edit all merge conflicts and then');p('mark them as resolved using git add');return 1;}
  const cur=commitOf(world,seq.current);
  if(indexTree(world,r)!==commitOf(world,headCommit(r)).tree){
   if(needIdentity(world,r,p))return 128;
   makeCommit(world,r,p,{message:cur.msg,parents:[headCommit(r)],reflog:`rebase (continue): ${subject(cur.msg)}`,author:{...cur.author},label:'detached HEAD',noDate:true});
  }
  return rebaseLoop(world,r,p);
 }
 if(o.interactive){p('Interactive rebase needs a text editor for its todo list; this terminal runs the non-interactive form, e.g. git rebase main.');return 1;}
 if(r.seq){p('fatal: It seems that there is already a rebase-merge directory, and');p('I wonder if you are in the middle of another rebase.');return 128;}
 if(r.merge){p('fatal: You have not concluded your merge (MERGE_HEAD exists).');return 128;}
 const branch=currentBranch(r),head=headCommit(r);
 let upName=o._[0];
 if(!upName){
  const u=branch&&upstreamOf(world,r,branch);
  if(!u){for(const l of ['There is no tracking information for the current branch.','Please specify which branch you want to rebase against.','See git-rebase(1) for details.','',"    git rebase '<branch>'",'','If you wish to set tracking information for this branch you can do so with:','',`    git branch --set-upstream-to=<remote>/<branch> ${branch}`,''])p(l);return 1;}
  upName=`${u.remote}/${u.branch}`;
 }
 const up=resolveCommit(world,r,upName);
 if(!up){p(`fatal: invalid upstream '${upName}'`);return 128;}
 const onto=o.onto?resolveCommit(world,r,o.onto):up;
 if(!onto){p(`fatal: Does not point to a valid commit '${o.onto}'`);return 128;}
 const s=statusData(world,r);
 if(s.unstaged.length){p('error: cannot rebase: You have unstaged changes.');p('error: Please commit or stash them.');return 1;}
 if(s.staged.length){p('error: cannot rebase: Your index contains uncommitted changes.');p('error: Please commit or stash them.');return 1;}
 if(!branch){p('fatal: this simulator rebases branches only; switch to a branch first');return 128;}
 let commits=revList(world,[head],[up]).filter(id=>commitOf(world,id).parents.length<2).sort((a,b)=>commitOf(world,a).committer.time-commitOf(world,b).committer.time);
 // Commits whose change is already upstream (cherry-picked there) are skipped, as Git does.
 const patchId=id=>{const c=commitOf(world,id);return JSON.stringify(changes(commitTexts(world,c.parents[0]),commitTexts(world,id)).map(x=>[x.status,x.from,x.path,x.a,x.b]));};
 const upstreamPatches=new Set(revList(world,[up],[head]).map(patchId));
 const skipped=commits.filter(id=>upstreamPatches.has(patchId(id)));
 if(skipped.length&&!(isAncestor(world,up,head))){for(const id of skipped)p(`warning: skipped previously applied commit ${short(id)}`);p(C.yellow('hint: use --reapply-cherry-picks to include skipped commits'));p(C.yellow('hint: Disable this message with "git config advice.skippedCherryPicks false"'));commits=commits.filter(id=>!skipped.includes(id));}
 if(!o.onto&&isAncestor(world,up,head)||(!o.onto&&up===head)){p(`Current branch ${branch} is up to date.`);return 0;}
 if(!commits.length||isAncestor(world,head,onto)){
  checkoutTree(world,r,onto);r.orig=head;
  logHead(r,onto,`rebase (start): checkout ${upName}`);
  r.refs['refs/heads/'+branch]=onto;logHead(r,onto,`rebase (finish): returning to refs/heads/${branch}`);
  p(`Successfully rebased and updated refs/heads/${branch}.`);return 0;
 }
 if(needIdentity(world,r,p))return 128;
 r.seq={op:'rebase',onto,orig:head,branch,upName,todo:commits,done:[]};r.orig=head;
 checkoutTree(world,r,onto,{force:true});r.head={sha:onto};
 logHead(r,onto,`rebase (start): checkout ${o.onto||upName}`);
 return rebaseLoop(world,r,p);
}
function rebaseLoop(world,r,p){
 const seq=r.seq;
 while(seq.todo.length){
  const id=seq.todo.shift(),c=commitOf(world,id);
  seq.current=id;seq.done.push(id);
  const res=applyOne(world,r,p,{id,op:'rebase'});
  if(res.error){return 1;}
  for(const m of res.plan.messages)p(m);
  if(res.plan.conflicts.length){seqHints(p,'rebase',id,res.sub);return 1;}
  if(indexTree(world,r)===commitOf(world,headCommit(r)).tree)continue;
  const who=sig(world,r),nid=writeCommit(world,{tree:indexTree(world,r),parents:[headCommit(r)],author:{...c.author},committer:who,message:c.msg});
  updateRef(world,r,'HEAD',nid,`rebase (pick): ${subject(c.msg)}`);
 }
 const tip=headCommit(r);
 r.refs['refs/heads/'+seq.branch]=tip;r.head={ref:'refs/heads/'+seq.branch};
 logHead(r,tip,`rebase (finish): returning to refs/heads/${seq.branch}`);
 r.seq=null;
 p(`Successfully rebased and updated refs/heads/${seq.branch}.`);
 return 0;
}

/* ------------------------------------------------------------ stash */
function stashIndex(arg){if(arg==null)return 0;const m=String(arg).match(/^(?:stash@\{)?(\d+)\}?$/);return m?Number(m[1]):-1;}
export function cmdStash({world,r,args,p}){
 const sub=['push','save','list','show','pop','apply','drop','clear','branch'].includes(args[0])?args[0]:'push';
 const rest=sub==='push'&&args[0]!=='push'?args:args.slice(1);
 if(sub==='push'||sub==='save'){
  const o=parse(rest,{bool:{'-u':'untracked','--include-untracked':'untracked','-k':'keep','--keep-index':'keep','-q':'quiet','-a':'all','--all':'all'},val:{'-m':'message','--message':'message'}});
  if(o.error)return bad(p,'stash',o);
  const head=headCommit(r);
  if(!head){p('You do not have the initial commit yet');return 1;}
  if(r.unmerged){for(const f of Object.keys(r.unmerged))p(`${f}: needs merge`);p('error: could not write index');return 1;}
  const s=statusData(world,r),dirty=dirtyPaths(world,r),untracked=o.untracked||o.all?s.untrackedFiles:[];
  if(!dirty.size&&!untracked.length){p('No local changes to save');return 0;}
  const b=currentBranch(r)??'(no branch)',base=`${b}: ${short(head)} ${subject(commitOf(world,head).msg)}`;
  const userMsg=sub==='save'?o._.join(' '):o.message;
  const who=sig(world,r).name?sig(world,r):{name:'Alice',email:'alice@example.com',...sig(world,r)};
  const indexCommit=writeCommit(world,{tree:indexTree(world,r),parents:[head],author:who,committer:who,message:`index on ${base}\n`});
  const W=worktree(world,r),flat={...r.index};
  for(const f of Object.keys(r.index)){if(f in W)flat[f]=writeBlob(world,W[f]);else delete flat[f];}
  const parents=[head,indexCommit];
  if(untracked.length){const uf={};for(const f of untracked)uf[f]=writeBlob(world,W[f]);parents.push(writeCommit(world,{tree:writeTree(world,uf),parents:[],author:who,committer:who,message:`untracked files on ${base}\n`}));}
  const label=userMsg?`On ${b}: ${userMsg}`:`WIP on ${base}`;
  const wip=writeCommit(world,{tree:writeTree(world,flat),parents,author:who,committer:who,message:label+'\n'});
  r.stash.unshift({id:wip,base:head,index:indexCommit,untracked:untracked.length?parents[2]:null,msg:label});
  const keepIdx=o.keep?{...r.index}:null;
  checkoutTree(world,r,head,{force:true});
  for(const f of untracked)deleteWt(world,r,f);
  if(keepIdx){r.index=keepIdx;for(const [f,id] of Object.entries(keepIdx))writeWt(world,r,f,textOf(world,id));}
  if(!o.quiet)p(`Saved working directory and index state ${label}`);
  return 0;
 }
 if(sub==='list'){r.stash.forEach((s,i)=>p(`${C.yellow(`stash@{${i}}`)}: ${s.msg}`));return 0;}
 if(sub==='clear'){r.stash=[];return 0;}
 const o=parse(rest,{bool:{'-p':'patch','--patch':'patch','--stat':'stat','--index':'index','-q':'quiet','-u':'untracked'}});
 if(o.error)return bad(p,'stash',o);
 if(!r.stash.length){p('No stash entries found.');return 1;}
 const n=stashIndex(o._[0]);
 if(n<0||!r.stash[n]){p(`error: ${o._[0]} is not a valid reference`);return 1;}
 const entry=r.stash[n];
 if(sub==='show'){
  const list=changes(commitTexts(world,entry.base),commitTexts(world,entry.id));
  if(o.patch)patch(list,p);else printStat(list,p);return 0;
 }
 if(sub==='drop'){r.stash.splice(n,1);p(`Dropped refs/stash@{${n}} (${entry.id})`);return 0;}
 if(sub==='branch'){p('usage: git stash branch <branchname> [<stash>]');return 129;}
 // apply / pop
 if(r.unmerged){for(const f of Object.keys(r.unmerged))p(`${f}: needs merge`);p('error: could not write index');return 1;}
 const head=headCommit(r),H=headTree(world,r);
 const plan=plan3(world,entry.base,head,entry.id,{ours:'Updated upstream',theirs:'Stashed changes'});
 const b=blockers(world,r,plan);
 if(b.local.length||b.untracked.length){printBlockers(p,b,'merge');p('The stash entry is kept in case you need it again.');return 1;}
 const indexBefore={...r.index};
 applyPlan(world,r,plan);
 // Without --index the stashed changes come back unstaged, except new files Git re-adds.
 for(const f of plan.touched){if(r.unmerged?.[f])continue;if(o.index){const I=treeFiles(world,entry.index);if(f in I)r.index[f]=I[f];continue;}if(f in H)r.index[f]=H[f];else if(f in indexBefore)r.index[f]=indexBefore[f];}
 if(entry.untracked){const U=treeFiles(world,entry.untracked);const W=worktree(world,r);for(const [f,id] of Object.entries(U)){if(f in W){p(`${f} already exists, no checkout`);continue;}writeWt(world,r,f,textOf(world,id));}}
 for(const m of plan.messages)p(m);
 if(plan.conflicts.length){
  for(const c of plan.conflicts)if(c.ours)r.index[c.path]=c.ours;
  longStatus(world,r,p);
  p('The stash entry is kept in case you need it again.');return 1;
 }
 longStatus(world,r,p);
 if(sub==='pop'){r.stash.splice(n,1);p(`Dropped refs/stash@{${n}} (${entry.id})`);}
 return 0;
}
export {cmp,resolveRev,writeBlobId,config,mergeBase};
