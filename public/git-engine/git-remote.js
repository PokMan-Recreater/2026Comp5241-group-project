// Remotes: remote, clone, fetch, pull and push against the simulated GitHub,
// printing the same transfer progress, ref updates and GitHub hints.
import {commitOf,short,isAncestor,revList,ancestors} from './core.js';
import {newRepo,headCommit,currentBranch,config,upstreamOf,resolveCommit,checkoutTree,resolvePath,listDir,isFile,isDir,ensureDir,logHead,updateRef} from './repo.js';
import {serverFor,normUrl,objectClosure} from './server.js';
import {C} from './format.js';
import {parse} from './util.js';
import {integrate,mergeMessage,cmdRebase} from './git-ops.js';
import {USAGE} from './git.js';

const bad=(p,name,o)=>{p(`error: ${o.error}`);p(`usage: ${USAGE[name]||'git '+name}`);return 129;};
/** Accepts https and SSH GitHub URLs. */
export function canonicalUrl(url){
 const s=String(url||'').trim(),ssh=s.match(/^git@github\.com:(.+)$/);
 return ssh?`https://github.com/${ssh[1]}`:s;
}
const display=url=>canonicalUrl(url).replace(/\/+$/,'');
const remoteUrl=(r,name)=>r.config[`remote.${name}.url`];
const remotes=r=>[...new Set(Object.keys(r.config).filter(k=>/^remote\.[^.]+\.url$/.test(k)).map(k=>k.split('.')[1]))];
function notFound(p,url){p('remote: Repository not found.');p(`fatal: repository '${display(url).replace(/\.git$/,'')}/' not found`);return 128;}

/* ------------------------------------------------------------ remote */
export function cmdRemote({world,r,args,p}){
 const sub=args[0];
 if(!sub||sub==='-v'||sub==='--verbose'){
  for(const n of remotes(r).sort()){if(sub){p(`${n}\t${remoteUrl(r,n)} (fetch)`);p(`${n}\t${remoteUrl(r,n)} (push)`);}else p(n);}
  return 0;
 }
 const [,a,b]=args;
 if(sub==='add'){
  if(!a||!b){p('usage: git remote add [<options>] <name> <url>');return 129;}
  if(remoteUrl(r,a)){p(`error: remote ${a} already exists.`);return 3;}
  r.config[`remote.${a}.url`]=b;r.config[`remote.${a}.fetch`]=`+refs/heads/*:refs/remotes/${a}/*`;return 0;
 }
 if(sub==='remove'||sub==='rm'){
  if(!remoteUrl(r,a)){p(`error: No such remote: '${a}'`);return 2;}
  for(const k of Object.keys(r.config))if(k.startsWith(`remote.${a}.`)||(k.endsWith('.remote')&&r.config[k]===a)){delete r.config[k];if(k.endsWith('.remote'))delete r.config[k.replace(/remote$/,'merge')];}
  for(const k of Object.keys(r.refs))if(k.startsWith(`refs/remotes/${a}/`))delete r.refs[k];
  return 0;
 }
 if(sub==='rename'){
  if(!remoteUrl(r,a)){p(`error: No such remote: '${a}'`);return 2;}
  if(remoteUrl(r,b)){p(`error: remote ${b} already exists.`);return 3;}
  r.config[`remote.${b}.url`]=r.config[`remote.${a}.url`];r.config[`remote.${b}.fetch`]=`+refs/heads/*:refs/remotes/${b}/*`;
  delete r.config[`remote.${a}.url`];delete r.config[`remote.${a}.fetch`];
  for(const k of Object.keys(r.config))if(k.endsWith('.remote')&&r.config[k]===a)r.config[k]=b;
  for(const k of Object.keys(r.refs))if(k.startsWith(`refs/remotes/${a}/`)){r.refs[`refs/remotes/${b}/`+k.slice(14+a.length)]=r.refs[k];delete r.refs[k];}
  return 0;
 }
 if(sub==='get-url'){if(!remoteUrl(r,a)){p(`error: No such remote '${a}'`);return 2;}p(remoteUrl(r,a));return 0;}
 if(sub==='set-url'){if(!remoteUrl(r,a)){p(`error: No such remote '${a}'`);return 2;}r.config[`remote.${a}.url`]=b;return 0;}
 if(sub==='show'){
  if(!remoteUrl(r,a)){p(`fatal: '${a}' does not appear to be a git repository`);p('fatal: Could not read from remote repository.');return 128;}
  const s=serverFor(world,canonicalUrl(remoteUrl(r,a)));
  p(`* remote ${a}`);p(`  Fetch URL: ${remoteUrl(r,a)}`);p(`  Push  URL: ${remoteUrl(r,a)}`);
  p(`  HEAD branch: ${s?s.head:'(unknown)'}`);
  if(s){const bs=Object.keys(s.refs).filter(k=>k.startsWith('refs/heads/')).map(k=>k.slice(11)).sort();p(`  Remote branch${bs.length===1?'':'es'}:`);for(const x of bs)p(`    ${x.padEnd(12)} ${r.refs[`refs/remotes/${a}/${x}`]?'tracked':'new (next fetch will store in remotes/'+a+')'}`);}
  return 0;
 }
 p(`error: unknown subcommand: \`${sub}'`);p(`usage: ${USAGE.remote}`);return 129;
}

/* ------------------------------------------------------------ transfer helpers */
function packLines(world,newCommits,haveCommits,p,{remote=false}={}){
 const have=objectClosure(world,haveCommits),all=objectClosure(world,newCommits);
 const objs=[...all].filter(x=>!have.has(x)),n=objs.length;
 const bytes=objs.reduce((s,id)=>{const o=world.objects[id];return s+Math.max(40,Math.round((o?.t==='blob'?o.c.length:o?.t==='tree'?o.e.length*30:180)*0.6));},0);
 const deltas=objs.filter(id=>world.objects[id]?.t==='tree').length>1?Math.max(0,Math.floor(n/6)):0;
 const size=bytes<1024?`${bytes} bytes | ${bytes}.00 KiB/s`:`${(bytes/1024).toFixed(2)} KiB | ${(bytes/1024).toFixed(2)} MiB/s`;
 const pre=remote?'remote: ':'';
 if(remote){
  if(!n)return n;
  p(`${pre}Enumerating objects: ${n}, done.`);p(`${pre}Counting objects: 100% (${n}/${n}), done.`);
  const cmp=Math.max(1,objs.filter(id=>world.objects[id]?.t!=='commit').length-1);p(`${pre}Compressing objects: 100% (${cmp}/${cmp}), done.`);
  p(`${pre}Total ${n} (delta ${deltas}), reused ${n} (delta ${deltas}), pack-reused 0`);
  p(`Unpacking objects: 100% (${n}/${n}), ${size.split(' | ')[0]} | ${size.split(' | ')[1]}, done.`);
  if(deltas)p(`Resolving deltas: 100% (${deltas}/${deltas}), done.`);
  return n;
 }
 if(!n){p('Total 0 (delta 0), reused 0 (delta 0), pack-reused 0');return 0;}
 p(`Enumerating objects: ${n}, done.`);p(`Counting objects: 100% (${n}/${n}), done.`);
 if(n>3){const k=Math.max(1,objs.filter(id=>world.objects[id]?.t!=='commit').length-1);p('Delta compression using up to 8 threads');p(`Compressing objects: 100% (${k}/${k}), done.`);}
 p(`Writing objects: 100% (${n}/${n}), ${size}, done.`);
 p(`Total ${n} (delta ${deltas}), reused 0 (delta 0), pack-reused 0`);
 if(deltas)p(`remote: Resolving deltas: 100% (${deltas}/${deltas}), done.`);
 return n;
}
const serverHeads=s=>Object.entries(s.refs).filter(([k])=>k.startsWith('refs/heads/'));
/** Downloads a remote's branches into refs/remotes/<name>/ and prints the updates. */
function fetchRemote(world,r,name,p,{prune=false,quiet=false,tags=true}={}){
 const url=remoteUrl(r,name);
 if(!url){p(`fatal: '${name}' does not appear to be a git repository`);p('fatal: Could not read from remote repository.');p('');p('Please make sure you have the correct access rights');p('and the repository exists.');return {code:128};}
 const s=serverFor(world,canonicalUrl(url));if(!s)return {code:notFound(p,url)};
 const lines=[],have=Object.entries(r.refs).filter(([k])=>k.startsWith('refs/remotes/')||k.startsWith('refs/heads/')).map(([,v])=>v);
 const incoming=serverHeads(s).map(([,v])=>v);
 const width=Math.max(0,...serverHeads(s).map(([k])=>k.slice(11).length));
 const updates=[];
 for(const [k,id] of serverHeads(s).sort()){
  const b=k.slice(11),local=`refs/remotes/${name}/${b}`,old=r.refs[local];
  if(old===id)continue;
  if(!old)updates.push(` * ${'[new branch]'.padEnd(17)} ${b.padEnd(width)} -> ${name}/${b}`);
  else if(isAncestor(world,old,id))updates.push(`   ${`${short(old)}..${short(id)}`.padEnd(17)} ${b.padEnd(width)} -> ${name}/${b}`);
  else updates.push(` + ${`${short(old)}...${short(id)}`.padEnd(17)} ${b.padEnd(width)} -> ${name}/${b}  (forced update)`);
  r.refs[local]=id;
 }
 if(tags)for(const [k,id] of Object.entries(s.refs).filter(([k])=>k.startsWith('refs/tags/'))){
  if(r.refs[k]===id)continue;const t=k.slice(10);
  if(!r.refs[k])updates.push(` * ${'[new tag]'.padEnd(17)} ${t.padEnd(width)} -> ${t}`);
  r.refs[k]=id;
 }
 if(prune)for(const k of Object.keys(r.refs).filter(k=>k.startsWith(`refs/remotes/${name}/`)&&!k.endsWith('/HEAD'))){
  const b=k.slice(14+name.length);if(!s.refs['refs/heads/'+b]){updates.push(` - ${'[deleted]'.padEnd(17)} ${'(none)'.padEnd(width)} -> ${name}/${b}`);delete r.refs[k];}
 }
 if(updates.length&&!quiet){packLines(world,incoming,have,x=>lines.push(x),{remote:true});lines.push(`From ${display(url).replace(/\.git$/,'')}`);lines.push(...updates);}
 for(const l of lines)p(l);
 return {code:0,server:s};
}

/* ------------------------------------------------------------ fetch / pull */
export function cmdFetch({world,r,args,p}){
 const o=parse(args,{bool:{'--all':'all','-p':'prune','--prune':'prune','-q':'quiet','--tags':'tags','-v':'verbose'}});
 if(o.error)return bad(p,'fetch',o);
 const names=o.all?remotes(r):[o._[0]||defaultRemote(r)];
 if(!names[0]){p('fatal: No remote repository specified.  Please, specify either a URL or a');p('remote name from which new revisions should be fetched.');return 128;}
 for(const n of names){if(o.all)p(`Fetching ${n}`);const res=fetchRemote(world,r,n,p,{prune:o.prune,quiet:o.quiet});if(res.code)return res.code;}
 return 0;
}
function defaultRemote(r){const b=currentBranch(r);return (b&&r.config[`branch.${b}.remote`])||(remotes(r).includes('origin')?'origin':remotes(r)[0]);}
export function cmdPull({world,r,args,p}){
 const o=parse(args,{bool:{'--rebase':'rebase','-r':'rebase','--no-rebase':'noRebase','--ff-only':'ffOnly','--no-ff':'noFf','-q':'quiet','--no-edit':'noEdit'}});
 if(o.error)return bad(p,'pull',o);
 if(r.merge||r.unmerged){p('error: Pulling is not possible because you have unmerged files.');p(C.yellow("hint: Fix them up in the work tree, and then use 'git add/rm <file>'"));p(C.yellow('hint: as appropriate to mark resolution and make a commit.'));p('fatal: Exiting because of an unresolved conflict.');return 128;}
 const b=currentBranch(r);
 let [remote,branch]=o._;
 if(!remote){
  const u=b&&upstreamOf(world,r,b);
  if(!u){
   if(!remotes(r).length){p('There is no tracking information for the current branch.');}
   for(const l of ['There is no tracking information for the current branch.','Please specify which branch you want to merge with.','See git-pull(1) for details.','','    git pull <remote> <branch>','','If you wish to set tracking information for this branch you can do so with:','',`    git branch --set-upstream-to=origin/<branch> ${b}`,''].slice(remotes(r).length?0:1))p(l);
   return 1;
  }
  remote=u.remote;branch=u.branch;
 }
 if(!branch){const u=b&&upstreamOf(world,r,b);branch=u&&u.remote===remote?u.branch:null;if(!branch){p(`You asked to pull from the remote '${remote}', but did not specify`);p('a branch. Because this is not the default configured remote');p('for your current branch, you must specify a branch on the command line.');return 1;}}
 const res=fetchRemote(world,r,remote,p);if(res.code)return res.code;
 const their=res.server.refs['refs/heads/'+branch];
 if(!their){p(`fatal: couldn't find remote ref ${branch}`);return 1;}
 r.refs[`refs/remotes/${remote}/${branch}`]=their;
 r.fetchHead={id:their};
 const head=headCommit(r);
 const url=remoteUrl(r,remote);
 const diverged=head&&!isAncestor(world,head,their)&&!isAncestor(world,their,head)&&head!==their;
 let mode=o.rebase?'rebase':o.noRebase?'merge':o.ffOnly?'ff':null;
 if(!mode){const pr=config(world,r,'pull.rebase'),ff=config(world,r,'pull.ff');mode=pr==='true'?'rebase':pr==='false'?'merge':ff==='only'?'ff':null;}
 if(diverged&&!mode){
  for(const l of ['You have divergent branches and need to specify how to reconcile them.','You can do so by running one of the following commands sometime before','your next pull:','','  git config pull.rebase false  # merge','  git config pull.rebase true   # rebase','  git config pull.ff only       # fast-forward only','','You can replace "git config" with "git config --global" to set a default','preference for all repositories. You can also pass --rebase, --no-rebase,','or --ff-only on the command line to override the configured default per','invocation.'])p(C.yellow(('hint: '+l).replace(/ $/,'')));
  p('fatal: Need to specify how to reconcile divergent branches.');return 128;
 }
 if(mode==='rebase'&&diverged)return cmdRebase({world,r,args:[`${remote}/${branch}`],p});
 if(mode==='ff'&&diverged){p('fatal: Not possible to fast-forward, aborting.');return 128;}
 return integrate(world,r,p,{their,label:their,msg:mergeMessage(world,r,branch,{url:display(url),branchName:branch}),noFf:o.noFf,reflog:`pull`});
}

/* ------------------------------------------------------------ push */
export function cmdPush({world,r,args,p}){
 const o=parse(args,{bool:{'-u':'setUp','--set-upstream':'setUp','-f':'force','--force':'force','--force-with-lease':'lease','--tags':'tags','-d':'del','--delete':'del','--all':'all','-q':'quiet','-n':'dry','--dry-run':'dry','--follow-tags':'followTags'}});
 if(o.error)return bad(p,'push',o);
 const b=currentBranch(r);
 let [remote,...specs]=o._;
 if(!remote){
  remote=defaultRemote(r);
  if(!remote){p('fatal: No configured push destination.');p('Either specify the URL from the command-line or configure a remote repository using');p('');p('    git remote add <name> <url>');p('');p('and then push using the remote name');p('');p('    git push <name>');p('');return 128;}
 }
 const url=remoteUrl(r,remote);
 if(!url){p(`fatal: '${remote}' does not appear to be a git repository`);p('fatal: Could not read from remote repository.');p('');p('Please make sure you have the correct access rights');p('and the repository exists.');return 128;}
 const s=serverFor(world,canonicalUrl(url));if(!s)return notFound(p,url);
 if(!specs.length&&!o.tags&&!o.all){
  if(!b){p('fatal: You are not currently on a branch.');p('To push the history leading to the current (detached HEAD)');p('state now, use');p('');p(`    git push ${remote} HEAD:<name-of-remote-branch>`);p('');return 128;}
  const u=upstreamOf(world,r,b);
  if(!u&&!o.setUp&&config(world,r,'push.autosetupremote')!=='true'){
   p(`fatal: The current branch ${b} has no upstream branch.`);p('To push the current branch and set the remote as upstream, use');p('');p(`    git push --set-upstream ${remote} ${b}`);p('');p('To have this happen automatically for branches without a tracking');p("upstream, see 'push.autoSetupRemote' in 'git help config'.");p('');return 128;
  }
  specs=[u&&u.remote===remote?`${b}:${u.branch}`:b];
 }
 if(o.all)specs=Object.keys(r.refs).filter(k=>k.startsWith('refs/heads/')).map(k=>k.slice(11));
 const jobs=[];
 for(const spec of specs){
  const force=spec.startsWith('+')||o.force||o.lease,clean=spec.replace(/^\+/,'');
  if(o.del||clean.startsWith(':')){const dst=clean.replace(/^:/,'');jobs.push({del:true,dst:dst.startsWith('refs/')?dst:(s.refs['refs/tags/'+dst]&&!s.refs['refs/heads/'+dst]?'refs/tags/'+dst:'refs/heads/'+dst),name:dst});continue;}
  const [src,dstRaw]=clean.includes(':')?clean.split(':'):[clean,clean];
  const isTag=!!r.refs['refs/tags/'+src]&&!r.refs['refs/heads/'+src];
  const id=r.refs[isTag?'refs/tags/'+src:'refs/heads/'+src]??resolveCommit(world,r,src);
  if(!id){p(`error: src refspec ${src} does not match any`);p(`error: failed to push some refs to '${url}'`);return 1;}
  const dstName=dstRaw==='HEAD'?b:dstRaw;
  jobs.push({src,id,dst:(isTag?'refs/tags/':'refs/heads/')+dstName.replace(/^refs\/(heads|tags)\//,''),name:dstName.replace(/^refs\/(heads|tags)\//,''),srcName:src,isTag,force,branch:!isTag&&r.refs['refs/heads/'+src]?src:null});
 }
 if(o.tags||o.followTags)for(const k of Object.keys(r.refs).filter(k=>k.startsWith('refs/tags/')))if(s.refs[k]!==r.refs[k])jobs.push({id:r.refs[k],dst:k,name:k.slice(10),srcName:k.slice(10),isTag:true,force:o.force});
 // decide each ref update the way receive-pack does
 const results=[];
 for(const j of jobs){
  const cur=s.refs[j.dst];
  if(j.del){if(!cur){results.push({j,line:` ! [remote rejected] ${j.name} (remote ref does not exist)`,err:true,flag:'!'});continue;}results.push({j,line:` - [deleted]         ${j.name}`,apply:()=>{delete s.refs[j.dst];delete r.refs[`refs/remotes/${remote}/${j.name}`];}});continue;}
  const tip=commitOf(world,j.id)?j.id:j.id;
  if(cur===j.id){results.push({j,uptodate:true});continue;}
  if(!cur){results.push({j,line:` * ${(j.isTag?'[new tag]':'[new branch]').padEnd(17)} ${j.srcName} -> ${j.name}`,apply:()=>{s.refs[j.dst]=tip;}});continue;}
  if(j.isTag&&!j.force){results.push({j,line:` ! [rejected]        ${j.srcName} -> ${j.name} (already exists)`,err:'tag'});continue;}
  if(isAncestor(world,cur,j.id)){results.push({j,line:`   ${short(cur)}..${short(j.id)}  ${j.srcName} -> ${j.name}`,apply:()=>{s.refs[j.dst]=tip;}});continue;}
  if(j.force){results.push({j,line:` + ${short(cur)}...${short(j.id)} ${j.srcName} -> ${j.name} (forced update)`,apply:()=>{s.refs[j.dst]=tip;}});continue;}
  const known=Object.values(r.refs).some(v=>v===cur||ancestors(world,[v]).has(cur));
  results.push({j,line:` ! [rejected]        ${j.srcName} -> ${j.name} (${known?'non-fast-forward':'fetch first'})`,err:known?'nff':'fetch'});
 }
 if(results.every(x=>x.uptodate)){p('Everything up-to-date');finishUpstream();return 0;}
 const pushing=results.filter(x=>x.apply&&x.j.id).map(x=>x.j.id);
 const serverHave=Object.values(s.refs);
 if(pushing.length)packLines(world,pushing,serverHave,p);
 const newBranches=results.filter(x=>x.apply&&!x.j.isTag&&!x.j.del&&!s.refs[x.j.dst]&&x.j.name!==s.head);
 if(newBranches.length&&Object.keys(s.refs).length){
  for(const x of newBranches){p('remote: ');p(`remote: Create a pull request for '${x.j.name}' on GitHub by visiting:`);p(`remote:      https://github.com/${s.owner}/${s.name}/pull/new/${x.j.name}`);p('remote: ');}
 }
 p(`To ${display(url)}`);
 for(const x of results)if(!x.uptodate)p(x.line);
 const rejected=results.filter(x=>x.err);
 for(const x of results)if(x.apply&&!o.dry){x.apply();if(!x.j.del&&!x.j.isTag)r.refs[`refs/remotes/${remote}/${x.j.name}`]=x.j.id;s.events.push({type:x.j.del?'delete':'push',ref:x.j.dst,id:x.j.id,by:'you'});}
 if(!s.refs['refs/heads/'+s.head]){const first=Object.keys(s.refs).find(k=>k.startsWith('refs/heads/'));if(first)s.head=first.slice(11);}
 if(rejected.length){
  p(`error: failed to push some refs to '${display(url)}'`);
  const kind=rejected[0].err;
  const hints=kind==='fetch'?['Updates were rejected because the remote contains work that you do not','have locally. This is usually caused by another repository pushing to','the same ref. If you want to integrate the remote changes, use',"'git pull' before pushing again.","See the 'Note about fast-forwards' in 'git push --help' for details."]
   :kind==='nff'?['Updates were rejected because the tip of your current branch is behind','its remote counterpart. If you want to integrate the remote changes,',"use 'git pull' before pushing again.","See the 'Note about fast-forwards' in 'git push --help' for details."]
   :kind==='tag'?['Updates were rejected because the tag already exists in the remote.']:[];
  for(const h of hints)p(C.yellow('hint: '+h));
  return 1;
 }
 finishUpstream();
 return 0;
 function finishUpstream(){
  if(!o.setUp)return;
  for(const x of results)if(x.j.branch&&!x.err){r.config[`branch.${x.j.branch}.remote`]=remote;r.config[`branch.${x.j.branch}.merge`]='refs/heads/'+x.j.name;p(`branch '${x.j.branch}' set up to track '${remote}/${x.j.name}'.`);}
 }
}

/* ------------------------------------------------------------ clone */
export function cmdClone({world,args,p}){
 const o=parse(args,{bool:{'-q':'quiet','--quiet':'quiet','--bare':'bare'},val:{'-b':'branch','--branch':'branch','-o':'origin','--origin':'origin','--depth':'depth'}});
 if(o.error)return bad(p,'clone',o);
 const [url,dirArg]=o._;
 if(!url){p('fatal: You must specify a repository to clone.');p('');p(`usage: ${USAGE.clone}`);return 129;}
 const canon=canonicalUrl(url),name=dirArg||canon.replace(/\/+$/,'').replace(/\.git$/,'').split('/').pop();
 const dir=resolvePath(world,name);
 if(isFile(world,dir)||(isDir(world,dir)&&listDir(world,dir).length)){p(`fatal: destination path '${name}' already exists and is not an empty directory.`);return 128;}
 if(!o.quiet)p(`Cloning into '${name}'...`);
 const s=serverFor(world,canon);
 if(!s)return notFound(p,canon);
 const remote=o.origin||'origin';
 ensureDir(world,dir);
 const r=newRepo(world,dir,o.branch||s.head);
 r.config[`remote.${remote}.url`]=url;r.config[`remote.${remote}.fetch`]=`+refs/heads/*:refs/remotes/${remote}/*`;
 const heads=serverHeads(s);
 if(!heads.length){p('warning: You appear to have cloned an empty repository.');return 0;}
 if(!o.quiet){
  const all=objectClosure(world,heads.map(([,v])=>v)),n=all.size,k=[...all].filter(id=>world.objects[id]?.t!=='commit').length;
  const d=Math.floor(n/8);
  p(`remote: Enumerating objects: ${n}, done.`);p(`remote: Counting objects: 100% (${n}/${n}), done.`);p(`remote: Compressing objects: 100% (${k}/${k}), done.`);p(`remote: Total ${n} (delta ${d}), reused ${n} (delta ${d}), pack-reused 0`);
  p(`Receiving objects: 100% (${n}/${n}), done.`);if(d)p(`Resolving deltas: 100% (${d}/${d}), done.`);
 }
 for(const [k,v] of heads)r.refs[`refs/remotes/${remote}/${k.slice(11)}`]=v;
 for(const [k,v] of Object.entries(s.refs))if(k.startsWith('refs/tags/'))r.refs[k]=v;
 const def=o.branch||s.head,tip=s.refs['refs/heads/'+def];
 if(!tip){p(`warning: Could not find remote branch ${def} to clone.`);p(`fatal: Remote branch ${def} not found in upstream ${remote}`);return 128;}
 (r.remoteHead??={})[remote]=s.head;
 r.refs['refs/heads/'+def]=tip;r.config[`branch.${def}.remote`]=remote;r.config[`branch.${def}.merge`]='refs/heads/'+def;
 r.head={ref:'refs/heads/'+def};
 checkoutTree(world,r,tip,{force:true});
 logHead(r,tip,`clone: from ${url}`);
 return 0;
}
export {revList,normUrl,updateRef};
