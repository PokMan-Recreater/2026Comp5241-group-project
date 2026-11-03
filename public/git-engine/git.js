// The `git` command: every subcommand prints what Git 2.43 prints, with the
// same colours, hints and exit codes, against the simulated repository.
import {writeBlob,writeCommit,writeTag,commitOf,peel,short,subject,treeFiles,isAncestor,revList,ancestors,flattenTree} from './core.js';
import {findRepo,newRepo,headCommit,currentBranch,config,identity,sig,updateRef,logHead,upstreamOf,resolveRev,resolveCommit,worktree,writeWt,deleteWt,ignoreRules,isIgnored,statusData,writeBlobId,addToIndex,indexTree,checkoutTree,headTree,relTo,resolvePath,isFile,isDir,ensureDir} from './repo.js';
import {hunks} from './diff.js';
import {C,gitDate,isoDate} from './format.js';
import {parse,repoRel,matches,shown,textOf,changes,cmp,commitTexts,indexTexts,worktreeTracked,patch,printStat,commitSummary,dirtyPaths} from './util.js';
import {cmdMerge,cmdRebase,cmdCherryPick,cmdRevert,cmdStash} from './git-ops.js';
import {cmdRemote,cmdPush,cmdFetch,cmdPull,cmdClone} from './git-remote.js';

export const GIT_VERSION='2.43.0';
const NOT_REPO='fatal: not a git repository (or any of the parent directories): .git';

/* ------------------------------------------------------------ dispatcher */
const COMMANDS={
 init:{run:cmdInit},config:{run:cmdConfig},clone:{run:cmdClone},help:{run:cmdHelp},version:{run:({p})=>(p(`git version ${GIT_VERSION}`),0)},
 status:{repo:true,run:cmdStatus},add:{repo:true,run:cmdAdd},rm:{repo:true,run:cmdRm},mv:{repo:true,run:cmdMv},restore:{repo:true,run:cmdRestore},
 commit:{repo:true,run:cmdCommit},log:{repo:true,run:cmdLog},show:{repo:true,run:cmdShow},diff:{repo:true,run:cmdDiff},
 branch:{repo:true,run:cmdBranch},switch:{repo:true,run:cmdSwitch},checkout:{repo:true,run:cmdCheckout},tag:{repo:true,run:cmdTag},
 reset:{repo:true,run:cmdReset},reflog:{repo:true,run:cmdReflog},blame:{repo:true,run:cmdBlame},
 merge:{repo:true,run:cmdMerge},rebase:{repo:true,run:cmdRebase},'cherry-pick':{repo:true,run:cmdCherryPick},revert:{repo:true,run:cmdRevert},stash:{repo:true,run:cmdStash},
 remote:{repo:true,run:cmdRemote},push:{repo:true,run:cmdPush},fetch:{repo:true,run:cmdFetch},pull:{repo:true,run:cmdPull},
 'ls-files':{repo:true,run:cmdLsFiles},'cat-file':{repo:true,run:cmdCatFile},'rev-parse':{repo:true,run:cmdRevParse},'check-ignore':{repo:true,run:cmdCheckIgnore},clean:{repo:true,run:cmdClean},
};
export const GIT_SUBCOMMANDS=Object.keys(COMMANDS);

/** Runs `git <args>`; `p` prints one line. Returns the exit code. */
export function git(world,args,p){
 args=[...args];
 while(args[0]==='-C'||args[0]==='--no-pager'||args[0]==='-c'){
  if(args[0]==='--no-pager'){args.shift();continue;}
  if(args[0]==='-c'){args.shift();args.shift();continue;}
  args.shift();const dir=args.shift();const abs=resolvePath(world,dir||'');
  if(!isDir(world,abs)){p(`fatal: cannot change to '${dir}': No such file or directory`);return 128;}
  const saved=world.cwd;world.cwd=abs;try{return git(world,args,p);}finally{world.cwd=saved;}
 }
 const name=args.shift();
 if(!name){usage(p);return 1;}
 if(name==='--version'||name==='-v')return (p(`git version ${GIT_VERSION}`),0);
 if(name==='--help'||name==='-h')return cmdHelp({p,args:[]});
 const cmd=COMMANDS[name];
 if(!cmd){
  p(`git: '${name}' is not a git command. See 'git --help'.`);
  const near=closest(name);
  if(near.length){p('');p(near.length===1?'The most similar command is':'The most similar commands are');for(const n of near)p('\t'+n);}
  return 1;
 }
 if(args.includes('-h')||args.includes('--help')){p(`usage: ${USAGE[name]||`git ${name} [<options>]`}`);return 129;}
 const r=cmd.repo?findRepo(world):null;
 if(cmd.repo&&!r){p(NOT_REPO);return 128;}
 return cmd.run({world,r,args,p});
}
function closest(name){
 const d=(a,b)=>{const m=a.length,n=b.length,dp=Array.from({length:m+1},(_,i)=>[i,...Array(n).fill(0)]);for(let j=1;j<=n;j++)dp[0][j]=j;for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return dp[m][n];};
 const scored=GIT_SUBCOMMANDS.map(c=>[c,d(name,c)]).filter(([c,s])=>s<=2||c.startsWith(name)).sort((a,b)=>a[1]-b[1]);
 if(!scored.length)return [];const best=scored[0][1];return scored.filter(([,s])=>s===best).map(([c])=>c);
}
export const USAGE={
 init:'git init [-q | --quiet] [--bare] [-b <branch-name>] [<directory>]',config:'git config [<options>]',status:'git status [<options>] [--] [<pathspec>...]',
 add:'git add [<options>] [--] <pathspec>...',commit:'git commit [-a | --interactive | --patch] [-s] [-v] [-u<mode>] [--amend]\n                  [--dry-run] [(-c | -C | --squash) <commit> | --fixup [(amend|reword):]<commit>)]\n                  [-F <file> | -m <msg>] [--reset-author] [--allow-empty]',
 log:'git log [<options>] [<revision-range>] [[--] <path>...]',diff:'git diff [<options>] [<commit>] [--] [<path>...]',branch:'git branch [<options>] [-r | -a] [--merged] [--no-merged]',
 switch:'git switch [<options>] [<branch>]',checkout:'git checkout [<options>] <branch>',merge:'git merge [<options>] [<commit>...]',rebase:'git rebase [-i] [options] [--exec <cmd>] [--onto <newbase> | --keep-base] [<upstream> [<branch>]]',
 push:'git push [<options>] [<repository> [<refspec>...]]',pull:'git pull [<options>] [<repository> [<refspec>...]]',fetch:'git fetch [<options>] [<repository> [<refspec>...]]',
 clone:'git clone [<options>] [--] <repo> [<dir>]',remote:'git remote [-v | --verbose]\n   or: git remote add [-t <branch>] [-m <master>] [-f] [--[no-]tags] [--mirror=<fetch|push>] <name> <url>',
 stash:'git stash list [<log-options>]\n   or: git stash show [-u | --include-untracked | --only-untracked] [<diff-options>] [<stash>]\n   or: git stash drop [-q | --quiet] [<stash>]\n   or: git stash pop [--index] [-q | --quiet] [<stash>]\n   or: git stash apply [--index] [-q | --quiet] [<stash>]\n   or: git stash push [-u | --include-untracked] [-m | --message <message>] [--] [<pathspec>...]',
 tag:'git tag [-a | -s | -u <key-id>] [-f] [-m <msg> | -F <file>] <tagname> [<head>]',reset:'git reset [--mixed | --soft | --hard | --merge | --keep] [-q] [<commit>]',
 restore:'git restore [<options>] [--source=<branch>] <file>...',rm:'git rm [-f | --force] [-n] [-r] [--cached] [--] <pathspec>...',mv:'git mv [<options>] <source>... <destination>',
 revert:'git revert [--[no-]edit] [-n] [-m <parent-number>] [-s] [-S[<keyid>]] <commit>...',show:'git show [<options>] <object>...',blame:'git blame [<options>] [<rev-opts>] [<rev>] [--] <file>',
 'cherry-pick':'git cherry-pick [--edit] [-n] [-m <parent-number>] [-s] [-x] [--ff] [-S[<keyid>]] <commit>...',reflog:'git reflog [show] [<log-options>] [<ref>]',
};
function bad(p,name,o){p(`error: ${o.error}`);p(`usage: ${USAGE[name]||'git '+name}`);return 129;}
function usage(p){
 p('usage: git [-v | --version] [-h | --help] [-C <path>] [-c <name>=<value>]');
 p('           [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]');
 p('           [-p | --paginate | -P | --no-pager] [--no-replace-objects] [--bare]');
 p('           [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]');
 p('           [--config-env=<name>=<envvar>] <command> [<args>]');
 p('');
}
function cmdHelp({p,args}){
 if(args[0]&&USAGE[args[0]]){p(`usage: ${USAGE[args[0]]}`);return 0;}
 usage(p);
 p('These are common Git commands used in various situations:');
 const sec=(t,rows)=>{p('');p(t);for(const [c,d] of rows)p(`   ${c.padEnd(11)}${d}`);};
 sec('start a working area (see also: git help tutorial)',[['clone','Clone a repository into a new directory'],['init','Create an empty Git repository or reinitialize an existing one']]);
 sec('work on the current change (see also: git help everyday)',[['add','Add file contents to the index'],['mv','Move or rename a file, a directory, or a symlink'],['restore','Restore working tree files'],['rm','Remove files from the working tree and from the index']]);
 sec('examine the history and state (see also: git help revisions)',[['bisect','Use binary search to find the commit that introduced a bug'],['diff','Show changes between commits, commit and working tree, etc'],['grep','Print lines matching a pattern'],['log','Show commit logs'],['show','Show various types of objects'],['status','Show the working tree status']]);
 sec('grow, mark and tweak your common history',[['branch','List, create, or delete branches'],['commit','Record changes to the repository'],['merge','Join two or more development histories together'],['rebase','Reapply commits on top of another base tip'],['reset','Reset current HEAD to the specified state'],['switch','Switch branches'],['tag','Create, list, delete or verify a tag object signed with GPG']]);
 sec('collaborate (see also: git help workflows)',[['fetch','Download objects and refs from another repository'],['pull','Fetch from and integrate with another repository or a local branch'],['push','Update remote refs along with associated objects']]);
 p('');
 p("'git help -a' and 'git help -g' list available subcommands and some");
 p("concept guides. See 'git help <command>' or 'git help <concept>'");
 p('to read about a specific subcommand or concept.');
 p("See 'git help git' for an overview of the system.");
 return 0;
}

/* ------------------------------------------------------------ init / config */
function cmdInit({world,args,p}){
 const o=parse(args,{bool:{'-q':'quiet','--quiet':'quiet','--bare':'bare'},val:{'-b':'branch','--initial-branch':'branch'}});
 if(o.error)return bad(p,'init',o);
 const dir=o._[0]?resolvePath(world,o._[0]):world.cwd;
 ensureDir(world,dir);
 if(world.repos[dir]){if(!o.quiet)p(`Reinitialized existing Git repository in ${dir}/.git/`);return 0;}
 if(!world.global['init.defaultbranch']&&!o.branch){
  for(const l of ["Using 'master' as the name for the initial branch. This default branch name","is subject to change. To configure the initial branch name to use in all","of your new repositories, which will suppress this warning, call:","","\tgit config --global init.defaultBranch <name>","","Names commonly chosen instead of 'master' are 'main', 'trunk' and","'development'. The just-created branch can be renamed via this command:","","\tgit branch -m <name>"])p(C.yellow('hint: '+l).replace(/hint: $/,'hint:'));
 }
 newRepo(world,dir,o.branch);
 if(!o.quiet)p(`Initialized empty Git repository in ${dir}/.git/`);
 return 0;
}
const normKey=k=>{const parts=k.split('.');if(parts.length<2)return null;parts[0]=parts[0].toLowerCase();parts[parts.length-1]=parts.at(-1).toLowerCase();return parts.join('.');};
function cmdConfig({world,args,p}){
 const o=parse(args,{bool:{'--global':'global','--local':'local','--list':'list','-l':'list','--unset':'unset','--get':'get','--show-origin':'origin','--system':'system'}});
 if(o.error)return bad(p,'config',o);
 const r=findRepo(world);
 if(o.list){
  const g=Object.entries(world.global),l=r&&!o.global?Object.entries(r.config):[];
  for(const [k,v] of [...(o.local?[]:g),...l])p(`${o.origin?(g.some(([x])=>x===k)&&!l.some(([x])=>x===k)?'file:/home/'+world.user+'/.gitconfig\t':'file:.git/config\t'):''}${k}=${v}`);
  if(o.local&&!r){p('fatal: --local can only be used inside a git repository');return 128;}
  return 0;
 }
 const [rawKey,value]=o._;
 if(!rawKey){p('error: no action specified');return 2;}
 const key=normKey(rawKey);
 if(!key){p(`error: key does not contain a section: ${rawKey}`);return 1;}
 const store=o.global?world.global:r?r.config:null;
 if(o.unset){if(!store){p('fatal: not in a git directory');return 128;}if(!(key in store))return 5;delete store[key];return 0;}
 if(value===undefined){
  const v=o.global?world.global[key]:o.local?r?.config[key]:config(world,r,key);
  if(v===undefined)return 1;p(v);return 0;
 }
 if(!store){p('fatal: not in a git directory');return 128;}
 store[key]=value;return 0;
}

/* ------------------------------------------------------------ status */
export function tracking(world,r,branch){
 const u=upstreamOf(world,r,branch);if(!u)return null;
 const up=r.refs[u.ref],h=r.refs['refs/heads/'+branch],name=`${u.remote}/${u.branch}`;
 if(!up)return {name,gone:true,ahead:0,behind:0};
 return {name,ahead:revList(world,[h],[up]).length,behind:revList(world,[up],[h]).length};
}
function trackLines(world,r,b){
 const t=tracking(world,r,b);if(!t)return [];
 const s=n=>n===1?'commit':'commits';
 if(t.gone)return [`Your branch is based on '${t.name}', but the upstream is gone.`,'  (use "git branch --unset-upstream" to fixup)'];
 if(!t.ahead&&!t.behind)return [`Your branch is up to date with '${t.name}'.`];
 if(t.ahead&&!t.behind)return [`Your branch is ahead of '${t.name}' by ${t.ahead} ${s(t.ahead)}.`,'  (use "git push" to publish your local commits)'];
 if(!t.ahead)return [`Your branch is behind '${t.name}' by ${t.behind} ${s(t.behind)}, and can be fast-forwarded.`,'  (use "git pull" to update your local branch)'];
 return [`Your branch and '${t.name}' have diverged,`,`and have ${t.ahead} and ${t.behind} different commits each, respectively.`,'  (use "git pull" if you want to integrate the remote branch with yours)'];
}
/** Status split into sections; also used by the explorer's file badges. */
export function statusOf(world,r){
 const d=statusData(world,r),un=r.unmerged||{};
 return {...d,unstaged:d.unstaged.filter(x=>!(x.path in un)),unmerged:Object.keys(un).sort(cmp).map(path=>({path,kind:un[path].kind}))};
}
export function longStatus(world,r,p,{commitMode=false}={}){
 const b=currentBranch(r),s=statusOf(world,r),seq=r.seq;
 if(seq?.op==='rebase'){
  const done=seq.done.length;
  p(`interactive rebase in progress; onto ${short(seq.onto)}`);
  p(`Last command${done===1?'':'s'} done (${done} command${done===1?'':'s'} done):`);
  for(const id of seq.done.slice(-2))p(`   pick ${short(id)} ${subject(commitOf(world,id)?.msg)}`);
  if(seq.todo.length){p(`Next command${seq.todo.length===1?'':'s'} to do (${seq.todo.length} remaining command${seq.todo.length===1?'':'s'}):`);for(const id of seq.todo.slice(0,2))p(`   pick ${short(id)} ${subject(commitOf(world,id)?.msg)}`);p('  (use "git rebase --edit-todo" to view and edit)');}
  else p('No commands remaining.');
  p(`You are currently rebasing branch '${seq.branch}' on '${short(seq.onto)}'.`);
  if(s.unmerged.length){p('  (fix conflicts and then run "git rebase --continue")');p('  (use "git rebase --skip" to skip this patch)');p('  (use "git rebase --abort" to check out the original branch)');}
  else p('  (all conflicts fixed: run "git rebase --continue")');
  p('');
 }else{
  if(b)p(`On branch ${b}`);else p(C.red(`HEAD detached at ${short(r.head.sha)}`));
  const tl=b&&!commitMode?trackLines(world,r,b):b?trackLines(world,r,b):[];
  for(const l of tl)p(l);
  if(tl.length)p('');
 }
 const noCommits=!headCommit(r);
 if(noCommits){if(!tlSkip(world,r,b))p('');p('No commits yet');p('');}
 if(r.merge&&!seq){
  if(s.unmerged.length){p('You have unmerged paths.');p('  (fix conflicts and run "git commit")');p('  (use "git merge --abort" to abort the merge)');}
  else{p('All conflicts fixed but you are still merging.');p('  (use "git commit" to conclude merge)');}
  p('');
 }else if(seq&&seq.op!=='rebase'){
  const verb=seq.op==='cherry-pick'?'cherry-picking':'reverting';
  p(`You are currently ${verb} commit ${short(seq.current)}.`);
  if(s.unmerged.length)p(`  (fix conflicts and run "git ${seq.op} --continue")`);else p(`  (all conflicts fixed: run "git ${seq.op} --continue")`);
  p(`  (use "git ${seq.op} --skip" to skip this patch)`);p(`  (use "git ${seq.op} --abort" to cancel the ${seq.op} operation)`);p('');
 }
 const label=k=>(k+':').padEnd(12);
 const hide=commitMode;
 if(s.staged.length){
  p('Changes to be committed:');
  if(!r.merge&&!hide)p(noCommits?'  (use "git rm --cached <file>..." to unstage)':'  (use "git restore --staged <file>..." to unstage)');
  for(const x of s.staged)p(C.green('\t'+label(x.kind)+(x.kind==='renamed'?`${shown(world,r,x.from)} -> ${shown(world,r,x.path)}`:shown(world,r,x.path))));
  p('');
 }
 if(s.unmerged.length){
  p('Unmerged paths:');
  if(!hide){if(seq?.op==='rebase')p('  (use "git restore --staged <file>..." to unstage)');p(s.unmerged.some(x=>x.kind.startsWith('deleted'))?'  (use "git add/rm <file>..." as appropriate to mark resolution)':'  (use "git add <file>..." to mark resolution)');}
  for(const x of s.unmerged)p(C.red('\t'+(x.kind+':').padEnd(17)+shown(world,r,x.path)));
  p('');
 }
 if(s.unstaged.length){
  p('Changes not staged for commit:');
  if(!hide){p(s.unstaged.some(x=>x.kind==='deleted')?'  (use "git add/rm <file>..." to update what will be committed)':'  (use "git add <file>..." to update what will be committed)');p('  (use "git restore <file>..." to discard changes in working directory)');}
  for(const x of s.unstaged)p(C.red('\t'+label(x.kind)+shown(world,r,x.path)));
  p('');
 }
 if(s.untracked.length){
  p('Untracked files:');
  if(!hide)p(`  (use "git add <file>..." to include in what will be committed)`);
  for(const x of s.untracked)p(C.red('\t'+shown(world,r,x)));
  p('');
 }
 if(!s.staged.length&&!(r.merge&&!s.unmerged.length)){
  if(s.unstaged.length||s.unmerged.length)p('no changes added to commit (use "git add" and/or "git commit -a")');
  else if(s.untracked.length)p('nothing added to commit but untracked files present (use "git add" to track)');
  else if(noCommits)p('nothing to commit (create/copy files and use "git add" to track)');
  else p('nothing to commit, working tree clean');
 }
 return s;
}
const tlSkip=(world,r,b)=>false;
function cmdStatus({world,r,args,p}){
 const o=parse(args,{bool:{'-s':'short','--short':'short','-b':'branch','--branch':'branch','--porcelain':'porcelain','-u':'untracked','--long':'long'}});
 if(o.error)return bad(p,'status',o);
 if(o.short||o.porcelain){
  const s=statusOf(world,r),c=o.porcelain?{green:x=>x,red:x=>x}:C;
  if(o.branch){
   const b=currentBranch(r),t=b&&tracking(world,r,b);
   let line=!headCommit(r)?`## No commits yet on ${b}`:b?`## ${C.green(b)}`:`## ${C.red('HEAD (no branch)')}`;
   if(t&&headCommit(r)){line+=`...${C.red(t.name)}`;const bits=[t.ahead&&`ahead ${C.green(t.ahead)}`,t.behind&&`behind ${C.red(t.behind)}`].filter(Boolean);if(t.gone)line+=' [gone]';else if(bits.length)line+=` [${bits.join(', ')}]`;}
   p(line);
  }
  const rows=new Map();
  const code={'new file':'A',modified:'M',deleted:'D',renamed:'R'};
  for(const x of s.staged)rows.set(x.path,{x:code[x.kind],y:' ',from:x.from});
  for(const x of s.unstaged){const e=rows.get(x.path)||{x:' ',y:' '};e.y=code[x.kind];rows.set(x.path,e);}
  const uc={'both modified':'UU','both added':'AA','deleted by us':'DU','deleted by them':'UD'};
  for(const x of s.unmerged)rows.set(x.path,{u:uc[x.kind]});
  for(const [path,e] of [...rows].sort((a,b)=>cmp(a[0],b[0]))){
   if(e.u){p(`${c.red(e.u)} ${shown(world,r,path)}`);continue;}
   p(`${e.x===' '?' ':c.green(e.x)}${e.y===' '?' ':c.red(e.y)} ${e.from?shown(world,r,e.from)+' -> ':''}${shown(world,r,path)}`);
  }
  for(const x of s.untracked)p(`${c.red('??')} ${shown(world,r,x)}`);
  return 0;
 }
 longStatus(world,r,p);
 return 0;
}

/* ------------------------------------------------------------ add / rm / mv / restore */
function pathspecs(world,r,list,p){
 const out=[];
 for(const x of list){const rel=repoRel(world,r,x);if(rel===null){p(`fatal: ${x}: '${x}' is outside repository at '${r.path}'`);return null;}out.push(rel);}
 return out;
}
function cmdAdd({world,r,args,p}){
 const o=parse(args,{bool:{'-A':'all','--all':'all','-u':'update','--update':'update','-f':'force','--force':'force','-v':'verbose','--verbose':'verbose','-n':'dry','--dry-run':'dry','-p':'patch','--patch':'patch'}});
 if(o.error)return bad(p,'add',o);
 if(o.patch){p('Interactive patch mode is not available in this terminal; stage whole files with git add <file>.');return 1;}
 let raw=[...o._,...(o.paths||[])];
 if(!raw.length&&!o.all&&!o.update){p('Nothing specified, nothing added.');p(C.yellow("hint: Maybe you wanted to say 'git add .'?"));p(C.yellow('hint: Turn this message off by running'));p(C.yellow('hint: "git config advice.addEmptyPathspec false"'));return 0;}
 if(!raw.length)raw=['/'+r.path.slice(1)];
 const specs=pathspecs(world,r,raw,p);if(!specs)return 128;
 const W=worktree(world,r),rules=ignoreRules(world,r),un=r.unmerged||{};
 const known=new Set([...Object.keys(W),...Object.keys(r.index),...Object.keys(un)]);
 const ignoredHits=[];let code=0;
 for(let i=0;i<specs.length;i++){
  const spec=specs[i],hits=[...known].filter(f=>matches(spec,f));
  if(!hits.length){p(`fatal: pathspec '${raw[i]}' did not match any files`);return 128;}
  let any=false;
  for(const f of hits.sort(cmp)){
   const tracked=f in r.index||f in un;
   if(!tracked){
    if(o.update)continue;
    if(isIgnored(rules,f)&&!o.force){if(spec===f)ignoredHits.push(f);continue;}
   }
   any=true;
   if(o.dry){if(!(f in W))p(`remove '${f}'`);else if(!tracked||writeBlobId(W[f])!==r.index[f])p(`add '${f}'`);continue;}
   if(o.verbose){if(!(f in W))p(`remove '${f}'`);else if(!tracked||writeBlobId(W[f])!==r.index[f])p(`add '${f}'`);}
   addToIndex(world,r,f);
   if(un[f]){delete un[f];}
  }
  if(!any&&!ignoredHits.length&&!o.update&&spec!==''&&hits.every(f=>isIgnored(rules,f)))ignoredHits.push(spec);
 }
 if(r.unmerged&&!Object.keys(r.unmerged).length)r.unmerged=null;
 if(ignoredHits.length){
  p('The following paths are ignored by one of your .gitignore files:');
  for(const f of [...new Set(ignoredHits)])p(f);
  p(C.yellow('hint: Use -f if you really want to add them.'));p(C.yellow('hint: Turn this message off by running'));p(C.yellow('hint: "git config advice.addIgnoredFile false"'));
  code=1;
 }
 return code;
}
function cmdRm({world,r,args,p}){
 const o=parse(args,{bool:{'--cached':'cached','-r':'recursive','-f':'force','--force':'force','-q':'quiet','-n':'dry','--dry-run':'dry'}});
 if(o.error)return bad(p,'rm',o);
 const raw=[...o._,...(o.paths||[])];
 if(!raw.length){p('usage: '+USAGE.rm);return 129;}
 const specs=pathspecs(world,r,raw,p);if(!specs)return 128;
 const W=worktree(world,r),H=headTree(world,r),targets=[];
 for(let i=0;i<specs.length;i++){
  const spec=specs[i],hits=Object.keys(r.index).filter(f=>matches(spec,f)).sort(cmp);
  if(!hits.length){p(`fatal: pathspec '${raw[i]}' did not match any files`);return 128;}
  if(!o.recursive&&hits.some(f=>f!==spec)&&!spec.includes('*')){p(`fatal: not removing '${raw[i]}' recursively without -r`);return 128;}
  targets.push(...hits);
 }
 if(!o.force){
  const staged=targets.filter(f=>H[f]!==r.index[f]&&(f in W)&&writeBlobId(W[f])===r.index[f]&&!o.cached);
  const local=targets.filter(f=>f in W&&writeBlobId(W[f])!==r.index[f]);
  const both=local.filter(f=>H[f]!==r.index[f]);
  if(both.length&&!o.cached){p(`error: the following file${both.length>1?'s have':' has'} staged content different from both the`);p('file and the HEAD:');for(const f of both)p('    '+f);p('(use -f to force removal)');return 1;}
  if(local.length&&!o.cached){p(`error: the following file${local.length>1?'s have':' has'} local modifications:`);for(const f of local)p('    '+f);p('(use --cached to keep the file, or -f to force removal)');return 1;}
  if(staged.length){p(`error: the following file${staged.length>1?'s have':' has'} changes staged in the index:`);for(const f of staged)p('    '+f);p('(use --cached to keep the file, or -f to force removal)');return 1;}
 }
 for(const f of [...new Set(targets)]){
  if(!o.quiet)p(`rm '${f}'`);
  if(o.dry)continue;
  delete r.index[f];if(!o.cached&&f in W)deleteWt(world,r,f);
 }
 return 0;
}
function cmdMv({world,r,args,p}){
 const o=parse(args,{bool:{'-f':'force','--force':'force','-v':'verbose','-n':'dry','-k':'skip'}});
 if(o.error)return bad(p,'mv',o);
 const raw=[...o._,...(o.paths||[])];
 if(raw.length<2){p('usage: '+USAGE.mv);return 129;}
 const specs=pathspecs(world,r,raw,p);if(!specs)return 128;
 const dest=specs.pop(),destRaw=raw.at(-1),W=worktree(world,r);
 const destIsDir=isDir(world,resolvePath(world,destRaw))&&!isFile(world,resolvePath(world,destRaw));
 if(specs.length>1&&!destIsDir){p(`fatal: destination '${destRaw}' is not a directory`);return 128;}
 for(let i=0;i<specs.length;i++){
  const src=specs[i],srcRaw=raw[i],name=src.split('/').pop(),to=destIsDir?(dest?dest+'/':'')+name:dest;
  const files=Object.keys(r.index).filter(f=>f===src||f.startsWith(src+'/'));
  if(!(src in W)&&!files.length){p(`fatal: bad source, source=${srcRaw}, destination=${destIsDir?(destRaw.replace(/\/$/,'')+'/'+name):destRaw}`);return 128;}
  if(!files.length){p(`fatal: not under version control, source=${srcRaw}, destination=${destIsDir?(destRaw.replace(/\/$/,'')+'/'+name):destRaw}`);return 128;}
  const caseOnly=src.toLowerCase()===to.toLowerCase()&&src!==to;
  if(!o.force&&!caseOnly&&(to in W)){p(`fatal: destination exists, source=${srcRaw}, destination=${destRaw}`);return 128;}
  for(const f of files){
   const nf=to+f.slice(src.length);
   if(o.verbose)p(`Renaming ${f} to ${nf}`);
   if(o.dry)continue;
   const content=W[f];
   if(content!==undefined){deleteWt(world,r,f);writeWt(world,r,nf,content);}
   r.index[nf]=r.index[f];delete r.index[f];
  }
 }
 return 0;
}
function cmdRestore({world,r,args,p}){
 const o=parse(args,{bool:{'-S':'staged','--staged':'staged','-W':'worktree','--worktree':'worktree','--ours':'ours','--theirs':'theirs','-q':'quiet'},val:{'-s':'source','--source':'source'}});
 if(o.error)return bad(p,'restore',o);
 const raw=[...o._,...(o.paths||[])];
 if(!raw.length){p('fatal: you must specify path(s) to restore');return 128;}
 const specs=pathspecs(world,r,raw,p);if(!specs)return 128;
 const staged=!!o.staged,wt=o.worktree||!staged;
 let srcFiles;
 if(o.source){const id=resolveCommit(world,r,o.source);if(!id){p(`fatal: could not resolve ${o.source}`);return 128;}srcFiles=treeFiles(world,id);}
 const H=headTree(world,r),W=worktree(world,r),un=r.unmerged||{};
 for(let i=0;i<specs.length;i++){
  const spec=specs[i],from=staged?(srcFiles||H):(srcFiles||r.index);
  const pool=new Set([...Object.keys(from),...Object.keys(r.index),...(wt?Object.keys(W).filter(f=>f in r.index||f in from):[]),...Object.keys(un)]);
  const hits=[...pool].filter(f=>matches(spec,f));
  if(!hits.length){p(`error: pathspec '${raw[i]}' did not match any file(s) known to git`);return 1;}
  for(const f of hits){
   if(un[f]&&wt&&!staged){
    if(o.ours||o.theirs){const id=o.ours?un[f].ours:un[f].theirs;if(id)writeWt(world,r,f,textOf(world,id));else deleteWt(world,r,f);continue;}
    p(`error: path '${f}' is unmerged`);return 1;
   }
   if(staged){if(f in from)r.index[f]=from[f];else delete r.index[f];if(un[f])delete un[f];}
   if(wt){const src=staged?from:(srcFiles||r.index);if(f in src)writeWt(world,r,f,textOf(world,src[f]));else if(f in W&&(f in r.index||srcFiles))deleteWt(world,r,f);}
  }
 }
 if(r.unmerged&&!Object.keys(r.unmerged).length)r.unmerged=null;
 return 0;
}

/* ------------------------------------------------------------ commit */
function noIdentity(world,p){
 for(const l of ['Author identity unknown','','*** Please tell me who you are.','','Run','','  git config --global user.email "you@example.com"','  git config --global user.name "Your Name"','',"to set your account's default identity.",'Omit --global to set the identity only in this repository.',''])p(l);
 p(`fatal: unable to auto-detect email address (got '${world.user}@${world.host}.(none)')`);
 return 128;
}
/** Writes a commit from the index, moves HEAD and prints Git's summary. */
export function makeCommit(world,r,p,{message,parents,reflog,amendOf=null,author=null,quiet=false,label=null,noDate=false}){
 const tree=indexTree(world,r),who=sig(world,r);
 const id=writeCommit(world,{tree,parents,author:author||who,committer:who,message});
 const b=currentBranch(r),root=!parents.length;
 updateRef(world,r,'HEAD',id,reflog);
 if(!quiet){
  p(`[${label||(b??'detached HEAD')}${root?' (root-commit)':''} ${short(id)}] ${subject(message)}`);
  if(author&&author.time!==who.time&&!noDate)p(` Date: ${gitDate(author.time,author.tz)}`);
  if(parents.length<2){const base=amendOf?commitOf(world,amendOf).parents[0]:parents[0];commitSummary(changes(commitTexts(world,base),commitTexts(world,id)),p);}
 }
 return id;
}
function cmdCommit({world,r,args,p}){
 const o=parse(args,{bool:{'-a':'all','--all':'all','--amend':'amend','--no-edit':'noEdit','--allow-empty':'empty','-q':'quiet','--quiet':'quiet','-v':'verbose','--dry-run':'dry','-e':'edit','--edit':'edit'},val:{'-m':'message','--message':'message','-F':'file','-C':'reuse'},multi:['message']});
 if(o.error)return bad(p,'commit',o);
 if(r.unmerged&&Object.keys(r.unmerged).length){
  p('error: Committing is not possible because you have unmerged files.');p(C.yellow("hint: Fix them up in the work tree, and then use 'git add/rm <file>'"));p(C.yellow('hint: as appropriate to mark resolution and make a commit.'));p('fatal: Exiting because of an unresolved conflict.');
  for(const f of Object.keys(r.unmerged).sort(cmp))p(`U\t${f}`);return 128;
 }
 if(o.amend&&r.merge){p('fatal: You are in the middle of a merge -- cannot amend.');return 128;}
 if(!identity(world,r))return noIdentity(world,p);
 const paths=[...o._,...(o.paths||[])];
 if(o.all){const W=worktree(world,r);for(const f of Object.keys(r.index)){if(!(f in W))delete r.index[f];else if(writeBlobId(W[f])!==r.index[f])r.index[f]=writeBlob(world,W[f]);}}
 if(paths.length){
  const specs=pathspecs(world,r,paths,p);if(!specs)return 128;
  const W=worktree(world,r);
  for(let i=0;i<specs.length;i++){const hits=Object.keys(r.index).filter(f=>matches(specs[i],f));if(!hits.length){p(`error: pathspec '${paths[i]}' did not match any file(s) known to git`);return 1;}for(const f of hits){if(f in W)r.index[f]=writeBlob(world,W[f]);else delete r.index[f];}}
 }
 const head=headCommit(r);
 if(o.amend&&!head){p('fatal: You have nothing to amend.');return 128;}
 let message=o.message?o.message.join('\n\n'):null;
 if(o.reuse){const c=resolveCommit(world,r,o.reuse);if(!c){p(`fatal: could not lookup commit ${o.reuse}`);return 128;}message=commitOf(world,c).msg;}
 if(message===null&&o.amend&&o.noEdit)message=commitOf(world,head).msg;
 if(message===null&&r.merge)message=r.merge.msg;
 if(message===null&&r.seq&&r.seq.op!=='rebase'&&r.seq.msg)message=r.seq.msg;
 if(message===null&&o.amend)message=commitOf(world,head).msg;
 const parents=o.amend?commitOf(world,head).parents:r.merge?[head,r.merge.head]:head?[head]:[];
 const base=o.amend?commitOf(world,head).parents[0]:head;
 const tree=indexTree(world,r),same=base?commitOf(world,base).tree===tree:Object.keys(r.index).length===0;
 if(same&&!o.amend&&!o.empty&&!r.merge){
  if(r.seq&&r.seq.op==='cherry-pick'){p('The previous cherry-pick is now empty, possibly due to conflict resolution.');p('If you wish to commit it anyway, use:');p('');p('    git commit --allow-empty');p('');p('Otherwise, please use \'git cherry-pick --skip\'');return 1;}
  longStatus(world,r,p,{commitMode:true});return 1;
 }
 if(message===null){
  p(C.yellow('hint: Waiting for your editor to close the file...'));
  p('error: There was a problem with the editor \'vi\'.');
  p('Please supply the message using either -m or -F option.');
  p(C.dim('(This terminal has no text editor for commit messages — use git commit -m "your message".)'));
  return 1;
 }
 message=message.replace(/\s+$/,'')+'\n';
 if(!message.trim()){p('Aborting commit due to empty commit message.');return 1;}
 if(o.dry){longStatus(world,r,p,{commitMode:true});return 0;}
 const kind=o.amend?'commit (amend)':r.merge?'commit (merge)':!head?'commit (initial)':r.seq?.op==='cherry-pick'?'cherry-pick':r.seq?.op==='revert'?'revert':'commit';
 const authorKeep=o.amend?{...commitOf(world,head).author}:r.seq?.author&&r.seq.op==='cherry-pick'?r.seq.author:null;
 makeCommit(world,r,p,{message,parents,reflog:`${kind}: ${subject(message)}`,amendOf:o.amend?head:null,author:authorKeep,quiet:o.quiet});
 if(r.merge){r.merge=null;}
 if(r.seq&&r.seq.op!=='rebase'){if(r.seq.op==='cherry-pick'||r.seq.op==='revert')r.seq=null;}
 return 0;
}

/* ------------------------------------------------------------ refs & decorations */
export function decorations(world,r){
 const map=new Map(),add=(id,s,front=false)=>{if(!id)return;id=peel(world,id);const list=map.get(id)||map.set(id,[]).get(id);if(front)list.unshift(s);else list.push(s);};
 const h=headCommit(r),b=currentBranch(r);
 // Git lists the remaining refs in reverse refname order, after HEAD.
 for(const ref of Object.keys(r.refs).sort(cmp).reverse()){
  if(ref.startsWith('refs/stash'))continue;
  if(ref.startsWith('refs/heads/')){if(ref.slice(11)!==b)add(r.refs[ref],C.boldGreen(ref.slice(11)));}
  else if(ref.startsWith('refs/tags/'))add(r.refs[ref],C.boldYellow('tag: '+ref.slice(10)));
  else if(ref.startsWith('refs/remotes/')){
   const [remote,...rest]=ref.slice(13).split('/');
   add(r.refs[ref],C.boldRed(ref.slice(13)));
   if(r.remoteHead?.[remote]===rest.join('/'))add(r.refs[ref],C.boldRed(`${remote}/HEAD`));
  }
 }
 if(h)add(h,b?`${C.boldCyan('HEAD -> ')}${C.boldGreen(b)}`:C.boldCyan('HEAD'),true);
 return map;
}
const decor=(map,id)=>map.has(id)?' '+C.yellow('(')+map.get(id).join(C.yellow(', '))+C.yellow(')'):'';

/* ------------------------------------------------------------ log */
/** Commits in --topo-order: a line of history stays together, newest tips first. */
export function topoOrder(world,ids){
 const set=new Set(ids),kids=new Map();
 for(const id of ids)for(const par of commitOf(world,id).parents)if(set.has(par))kids.set(par,(kids.get(par)||0)+1);
 const time=id=>commitOf(world,id).committer.time;
 let ready=ids.filter(id=>!kids.get(id)).sort((a,b)=>time(b)-time(a));
 const out=[];
 while(ready.length){
  const id=ready.shift();out.push(id);
  const fresh=[];
  for(const par of commitOf(world,id).parents){if(!set.has(par))continue;const n=kids.get(par)-1;kids.set(par,n);if(n===0)fresh.push(par);}
  ready=[...fresh.reverse(),...ready];
 }
 return out;
}
export function dateOrder(world,ids){return [...ids].sort((a,b)=>commitOf(world,b).committer.time-commitOf(world,a).committer.time||(isAncestor(world,a,b)?1:-1));}
/** ASCII history graph the way `git log --graph` draws the common shapes. */
export function drawGraph(world,ids,render){
 let cols=[];const out=[],shownSet=new Set(ids);
 const row=(list,mark,i)=>list.map((_,j)=>j===i?mark:'|').join(' ');
 for(const id of ids){
  let i=cols.indexOf(id);if(i<0){cols.push(id);i=cols.length-1;}
  const text=render(id),parents=commitOf(world,id).parents.filter(x=>shownSet.has(x));
  const next=[...cols];next.splice(i,1,...(parents.length?[parents[0]]:[]));
  const added=[];
  for(const par of parents.slice(1))if(!next.includes(par)){next.splice(i+1+added.length,0,par);added.push(par);}
  out.push(row(cols,'*',i).padEnd(Math.max(cols.length,next.length)*2)+text[0]);
  let rest=text.slice(1);
  if(added.length){
   const branchLine=cols.map((_,j)=>j<i?'| ':j===i?'|\\':' \\').join('').replace(/\s+$/,'');
   if(rest.length){out.push(branchLine.padEnd(next.length*2)+rest[0]);rest=rest.slice(1);}else out.push(branchLine);
  }
  for(const l of rest)out.push((next.length?next.map(()=>'|').join(' '):'').padEnd(Math.max(next.length,1)*2)+l);
  cols=next;
  // lanes that now wait for the same commit join: draw "|/" and drop the right one
  for(let j=cols.length-1;j>0;j--){
   const k=cols.indexOf(cols[j]);
   if(k<j){out.push(cols.map((_,x)=>x<j?'|':x===j?'/':'/').map((c,x)=>x===j?'':c).join(' ').replace(/ $/,'')+'/'.slice(0,0));out[out.length-1]=collapseLine(cols.length,j);cols.splice(j,1);}
  }
 }
 return out;
}
function collapseLine(n,j){let s='';for(let x=0;x<j;x++)s+=x===j-1?'|/':'| ';for(let x=j+1;x<n;x++)s+=' /';return s.replace(/\s+$/,'');}
function revisionArgs(world,r,list,p){
 const include=[],exclude=[];
 for(const a of list){
  const m=a.match(/^(.*?)(\.\.\.?)(.*)$/);
  if(m){const A=resolveCommit(world,r,m[1]||'HEAD'),B=resolveCommit(world,r,m[3]||'HEAD');if(!A||!B){p(`fatal: ambiguous argument '${a}': unknown revision or path not in the working tree.`);p("Use '--' to separate paths from revisions, like this:");p("'git <command> [<revision>...] -- [<file>...]'");return null;}
   if(m[2]==='..'){include.push(B);exclude.push(A);}else{include.push(A,B);}continue;}
  if(a.startsWith('^')){const id=resolveCommit(world,r,a.slice(1));if(!id){p(`fatal: bad revision '${a}'`);return null;}exclude.push(id);continue;}
  const id=resolveCommit(world,r,a);
  if(!id)return {path:a};
  include.push(id);
 }
 return {include,exclude};
}
function cmdLog({world,r,args,p}){
 const o=parse(args,{count:true,bool:{'--oneline':'oneline','--graph':'graph','--all':'all','--decorate':'decorate','--stat':'stat','-p':'patch','--patch':'patch','--reverse':'reverse','--first-parent':'firstParent','--no-merges':'noMerges','--merges':'merges','--name-only':'nameOnly','--name-status':'nameStatus','--topo-order':'topo','--date-order':'dateOrd','--no-decorate':'noDecorate','--follow':'follow','--abbrev-commit':'abbrev'},val:{'-n':'n','--max-count':'n','--author':'author','--grep':'grep','--pretty':'pretty','--format':'format','--since':'since','--until':'until'}});
 if(o.error)return bad(p,'log',o);
 const limit=o.n!=null?Number(o.n):o.count??Infinity;
 const head=headCommit(r);
 const revs=[],paths=[...(o.paths||[])];
 for(const a of o._){const one=revisionArgs(world,r,[a],p);if(!one)return 128;if(one.path){const rel=repoRel(world,r,a);if(rel!==null&&(rel in worktree(world,r)||rel in r.index||Object.keys(r.index).some(f=>f.startsWith(rel+'/')))){paths.push(a);continue;}p(`fatal: ambiguous argument '${a}': unknown revision or path not in the working tree.`);p("Use '--' to separate paths from revisions, like this:");p("'git <command> [<revision>...] -- [<file>...]'");return 128;}revs.push(one);}
 let include=revs.flatMap(x=>x.include),exclude=revs.flatMap(x=>x.exclude);
 if(o.all)include.push(...Object.entries(r.refs).filter(([k])=>!k.startsWith('refs/stash')).map(([,v])=>peel(world,v)),...(head?[head]:[]));
 if(!include.length){
  if(!head){const b=currentBranch(r);p(`fatal: your current branch '${b}' does not have any commits yet`);return 128;}
  include=[head];
 }
 let ids;
 if(o.firstParent){ids=[];const ex=ancestors(world,exclude);let c=include[0];while(c&&!ex.has(c)){ids.push(c);c=commitOf(world,c).parents[0];}}
 else ids=revList(world,include,exclude);
 const specs=paths.map(x=>repoRel(world,r,x));
 if(specs.length)ids=ids.filter(id=>{const c=commitOf(world,id),A=c.parents[0]?treeFiles(world,c.parents[0]):{},B=treeFiles(world,id);return [...new Set([...Object.keys(A),...Object.keys(B)])].some(f=>A[f]!==B[f]&&specs.some(s=>matches(s,f)));});
 if(o.noMerges)ids=ids.filter(id=>commitOf(world,id).parents.length<2);
 if(o.merges)ids=ids.filter(id=>commitOf(world,id).parents.length>1);
 if(o.author)ids=ids.filter(id=>{const a=commitOf(world,id).author;return new RegExp(o.author,'i').test(`${a.name} <${a.email}>`);});
 if(o.grep)ids=ids.filter(id=>new RegExp(o.grep,'i').test(commitOf(world,id).msg));
 ids=o.graph||o.topo?topoOrder(world,ids):dateOrder(world,ids);
 if(Number.isFinite(limit))ids=ids.slice(0,limit);
 if(o.reverse&&!o.graph)ids.reverse();
 const map=o.noDecorate?new Map():decorations(world,r);
 const oneline=o.oneline||o.pretty==='oneline'||o.format==='oneline';
 const render=id=>{
  const c=commitOf(world,id),lines=[];
  if(oneline)lines.push(`${C.yellow(short(id))}${decor(map,id)} ${subject(c.msg)}`);
  else{
   lines.push(C.yellow(`commit ${o.abbrev?short(id):id}`)+decor(map,id));
   if(c.parents.length>1)lines.push(`Merge: ${c.parents.map(short).join(' ')}`);
   lines.push(`Author: ${c.author.name} <${c.author.email}>`);lines.push(`Date:   ${gitDate(c.author.time,c.author.tz)}`);lines.push('');
   for(const l of c.msg.replace(/\n+$/,'').split('\n'))lines.push(l?'    '+l:'');
  }
  if(o.stat||o.patch||o.nameOnly||o.nameStatus){
   const list=c.parents.length>1?[]:changes(commitTexts(world,c.parents[0]),commitTexts(world,id));
   if(list.length){
    if(!oneline)lines.push('');
    const buf=[];const q=s=>buf.push(s);
    if(o.nameOnly)for(const x of list)q(x.path);else if(o.nameStatus)for(const x of list)q(`${x.status}\t${x.from?x.from+'\t':''}${x.path}`);
    else{if(o.stat)printStat(list,q);if(o.patch){if(o.stat)q('');patch(list,q);}}
    lines.push(...buf);
   }
  }
  return lines;
 };
 if(o.graph){const out=drawGraph(world,ids,id=>{const t=render(id);return oneline?t:[...t,''];}).map(l=>l.replace(/\s+$/,''));while(out.length&&!out.at(-1).trim())out.pop();for(const l of out)p(l);return 0;}
 ids.forEach((id,i)=>{const t=render(id);if(i&&!oneline)p('');for(const l of t)p(l);});
 return 0;
}

/* ------------------------------------------------------------ show / diff */
function cmdShow({world,r,args,p}){
 const o=parse(args,{bool:{'--stat':'stat','--oneline':'oneline','--name-only':'nameOnly','--no-patch':'noPatch','-s':'noPatch'},val:{'--format':'format','--pretty':'pretty'}});
 if(o.error)return bad(p,'show',o);
 const targets=o._.length?o._:['HEAD'];
 let first=true;
 for(const spec of targets){
  const m=spec.match(/^([^:]*):(.*)$/);
  if(m){
   const id=resolveCommit(world,r,m[1]||'HEAD');if(!id){p(`fatal: invalid object name '${m[1]}'.`);return 128;}
   const rel=m[2].startsWith('./')?repoRel(world,r,m[2]):m[2];const files=treeFiles(world,id);
   if(!(rel in files)){if(Object.keys(files).some(f=>f.startsWith(rel+'/'))||rel===''){p(`tree ${spec}`);p('');const kids=[...new Set(Object.keys(files).filter(f=>rel===''||f.startsWith(rel+'/')).map(f=>{const rest=rel?f.slice(rel.length+1):f;const i=rest.indexOf('/');return i<0?rest:rest.slice(0,i+1);}))].sort(cmp);for(const k of kids)p(k);continue;}
    p(`fatal: path '${rel}' does not exist in '${m[1]||'HEAD'}'`);return 128;}
   const t=textOf(world,files[rel]);for(const l of t.replace(/\n$/,'').split('\n'))p(l);continue;
  }
  const raw=resolveRev(world,r,spec);
  if(!raw){if(!headCommit(r)&&spec==='HEAD'){p("fatal: your current branch '"+currentBranch(r)+"' does not have any commits yet");return 128;}p(`fatal: ambiguous argument '${spec}': unknown revision or path not in the working tree.`);p("Use '--' to separate paths from revisions, like this:");p("'git <command> [<revision>...] -- [<file>...]'");return 128;}
  const obj=world.objects[raw];
  if(!first)p('');first=false;
  if(obj?.t==='tag'){p(`${C.yellow('tag '+obj.tag)}`);p(`Tagger: ${obj.tagger.name} <${obj.tagger.email}>`);p(`Date:   ${gitDate(obj.tagger.time,obj.tagger.tz)}`);p('');for(const l of obj.msg.replace(/\n+$/,'').split('\n'))p(l);p('');}
  if(obj?.t==='blob'){for(const l of obj.c.replace(/\n$/,'').split('\n'))p(l);continue;}
  const id=peel(world,raw),c=commitOf(world,id);if(!c)continue;
  const map=decorations(world,r);
  if(o.oneline)p(`${C.yellow(short(id))}${decor(map,id)} ${subject(c.msg)}`);
  else{
   p(C.yellow(`commit ${id}`)+decor(map,id));
   if(c.parents.length>1)p(`Merge: ${c.parents.map(short).join(' ')}`);
   p(`Author: ${c.author.name} <${c.author.email}>`);p(`Date:   ${gitDate(c.author.time,c.author.tz)}`);p('');
   for(const l of c.msg.replace(/\n+$/,'').split('\n'))p(l?'    '+l:'');
  }
  if(o.noPatch||c.parents.length>1)continue;
  const list=changes(commitTexts(world,c.parents[0]),commitTexts(world,id));
  if(!list.length)continue;
  if(!o.oneline)p('');
  if(o.nameOnly){for(const x of list)p(x.path);continue;}
  if(o.stat){printStat(list,p);continue;}
  patch(list,p);
 }
 return 0;
}
function cmdDiff({world,r,args,p}){
 const o=parse(args,{bool:{'--staged':'staged','--cached':'staged','--stat':'stat','--name-only':'nameOnly','--name-status':'nameStatus','--shortstat':'shortstat','--color':'color','--no-color':'noColor','--quiet':'quiet','--exit-code':'exitCode'}});
 if(o.error)return bad(p,'diff',o);
 const revs=[],paths=[...(o.paths||[])];
 for(const a of o._){
  const m=a.match(/^(.*?)\.\.(\.?)(.*)$/);
  if(m){const A=resolveCommit(world,r,m[1]||'HEAD'),B=resolveCommit(world,r,m[3]||'HEAD');if(!A||!B){p(`fatal: ambiguous argument '${a}': unknown revision or path not in the working tree.`);return 128;}revs.push(m[2]?(commitOf(world,A)&&mergeBaseOf(world,A,B)):A,B);continue;}
  const id=resolveCommit(world,r,a);if(id){revs.push(id);continue;}
  const rel=repoRel(world,r,a);
  if(rel!==null&&(isFile(world,resolvePath(world,a))||isDir(world,resolvePath(world,a))||rel in r.index)){paths.push(a);continue;}
  p(`fatal: ambiguous argument '${a}': unknown revision or path not in the working tree.`);p("Use '--' to separate paths from revisions, like this:");p("'git <command> [<revision>...] -- [<file>...]'");return 128;
 }
 let A,B;
 if(revs.length>=2){A=commitTexts(world,revs[0]);B=commitTexts(world,revs[1]);}
 else if(revs.length===1){A=commitTexts(world,revs[0]);B=o.staged?indexTexts(world,r):worktreeTracked(world,r);if(!o.staged)for(const f of Object.keys(A))if(!(f in B)&&f in worktree(world,r))B[f]=worktree(world,r)[f];}
 else if(o.staged){A=commitTexts(world,headCommit(r));B=indexTexts(world,r);}
 else{A=indexTexts(world,r);B=worktreeTracked(world,r);}
 const un=r.unmerged||{};
 const specs=paths.map(x=>repoRel(world,r,x));
 let list=changes(A,B);
 if(!revs.length&&!o.staged)list=list.filter(c=>!(c.path in un));
 if(specs.length)list=list.filter(c=>specs.some(s=>matches(s,c.path)||(c.from&&matches(s,c.from))));
 if(!revs.length)for(const f of Object.keys(un).sort(cmp))if(!specs.length||specs.some(s=>matches(s,f))){if(o.staged||o.stat||o.nameOnly||o.nameStatus)p(`* Unmerged path ${f}`);else combinedDiff(world,r,f,p);}
 if(o.quiet)return list.length?1:0;
 if(o.nameOnly){for(const c of list)p(c.path);}
 else if(o.nameStatus){for(const c of list)p(`${c.status}${c.status==='R'?'100':''}\t${c.from?c.from+'\t':''}${c.path}`);}
 else if(o.stat)printStat(list,p);
 else if(o.shortstat){const s=[];printStat(list,x=>s.push(x));if(s.length)p(s.at(-1));}
 else patch(list,p);
 return o.exitCode&&list.length?1:0;
}
import {mergeBase as mergeBaseOf} from './core.js';
/** `diff --cc` for a conflicted file: one column per side, the way Git shows a merge in progress. */
function combinedDiff(world,r,f,p){
 const u=r.unmerged[f],W=worktree(world,r)[f]??'',sides=[textOf(world,u.ours),textOf(world,u.theirs)];
 p(C.bold(`diff --cc ${f}`));p(C.bold(`index ${short(u.ours||'0000000')},${short(u.theirs||'0000000')}..0000000`));p(C.bold(`--- a/${f}`));p(C.bold(`+++ b/${f}`));
 const res=W.replace(/\n$/,'').split('\n');
 // for each side: which result lines are new, and which side lines were removed before each result line
 const cols=sides.map(s=>{const a=s?s.replace(/\n$/,'').split('\n'):[],ops=diffOps(a,res),added=new Set(),removedBefore=new Map();let pending=[];
  for(const [t,l,,ni] of ops){if(t==='-'){pending.push(l);continue;}if(t==='+')added.add(ni);if(pending.length){removedBefore.set(ni,pending);pending=[];}}
  if(pending.length)removedBefore.set(res.length,pending);return {added,removedBefore,len:a.length};});
 const rows=[];
 for(let i=0;i<=res.length;i++){
  cols.forEach((c,k)=>{for(const l of c.removedBefore.get(i)||[])rows.push({mark:k===0?'- ':' -',l,change:true});});
  if(i<res.length){const m=cols.map(c=>c.added.has(i)?'+':' ').join('');rows.push({mark:m,l:res[i],change:m.trim()!==''});}
 }
 const hunkLen=n=>n;
 p(C.cyan(`@@@ -1,${cols[0].len} -1,${cols[1].len} +1,${hunkLen(res.length)} @@@`));
 for(const x of rows){const line=x.mark+x.l;p(x.mark.includes('+')?C.green(line):x.mark.includes('-')?C.red(line):line);}
}

/* ------------------------------------------------------------ branch */
const validName=n=>!!n&&!/(^[-.])|\.\.|[\s~^:?*[\\]|@\{|\/$|\.lock$|\.$|^@$/.test(n)&&!n.split('/').some(x=>x.startsWith('.'));
function cmdBranch({world,r,args,p}){
 const o=parse(args,{bool:{'-a':'all','--all':'all','-r':'remotes','--remotes':'remotes','-d':'del','--delete':'del','-D':'force_del','-m':'move','--move':'move','-M':'force_move','-v':'verbose','-vv':'vv','--verbose':'verbose','-f':'force','--force':'force','--show-current':'current','--unset-upstream':'unsetUp','--list':'list','--merged':'merged','--no-merged':'noMerged','-c':'copy'},val:{'-u':'upstream','--set-upstream-to':'upstream'}});
 if(o.error)return bad(p,'branch',o);
 const vv=args.filter(a=>a==='-vv'||a==='-v'||a==='--verbose').length>=2||args.includes('-vv');
 const cur=currentBranch(r),head=headCommit(r);
 if(o.current){if(cur)p(cur);return 0;}
 if(o.upstream){
  const b=o._[0]||cur,ref=r.refs['refs/remotes/'+o.upstream]?'refs/remotes/'+o.upstream:null;
  if(!ref){p(`error: the requested upstream branch '${o.upstream}' does not exist`);p(C.yellow('hint: '));return 128;}
  const [remote,...rest]=o.upstream.split('/');r.config[`branch.${b}.remote`]=remote;r.config[`branch.${b}.merge`]='refs/heads/'+rest.join('/');
  p(`branch '${b}' set up to track '${o.upstream}'.`);return 0;
 }
 if(o.unsetUp){const b=o._[0]||cur;delete r.config[`branch.${b}.remote`];delete r.config[`branch.${b}.merge`];return 0;}
 if(o.del||o.force_del){
  if(!o._.length){p('fatal: branch name required');return 128;}
  let code=0;
  for(const name of o._){
   if(o.remotes){const ref='refs/remotes/'+name;if(!r.refs[ref]){p(`error: remote-tracking branch '${name}' not found`);code=1;continue;}const was=r.refs[ref];delete r.refs[ref];p(`Deleted remote-tracking branch ${name} (was ${short(was)}).`);continue;}
   const ref='refs/heads/'+name;
   if(!r.refs[ref]){p(`error: branch '${name}' not found`);code=1;continue;}
   if(name===cur){p(`error: cannot delete branch '${name}' used by worktree at '${r.path}'`);code=1;continue;}
   const tip=r.refs[ref],u=upstreamOf(world,r,name),against=u&&r.refs[u.ref]?r.refs[u.ref]:head;
   if(!o.force_del&&!o.force&&!isAncestor(world,tip,against||null)&&tip!==against){p(`error: the branch '${name}' is not fully merged.`);p(`If you are sure you want to delete it, run 'git branch -D ${name}'`);code=1;continue;}
   delete r.refs[ref];delete r.config[`branch.${name}.remote`];delete r.config[`branch.${name}.merge`];
   p(`Deleted branch ${name} (was ${short(tip)}).`);
  }
  return code;
 }
 if(o.move||o.force_move){
  const [a,b]=o._.length>=2?o._:[cur,o._[0]];
  if(!b){p('fatal: branch name required');return 128;}
  if(!r.refs['refs/heads/'+a]&&!(a===cur&&!head)){p(`error: refname refs/heads/${a} not found`);p(`fatal: Branch rename failed`);return 128;}
  if(r.refs['refs/heads/'+b]&&!o.force_move){p(`fatal: a branch named '${b}' already exists`);return 128;}
  if(!validName(b)){p(`fatal: '${b}' is not a valid branch name`);return 128;}
  if(r.refs['refs/heads/'+a]){r.refs['refs/heads/'+b]=r.refs['refs/heads/'+a];delete r.refs['refs/heads/'+a];}
  for(const k of ['remote','merge'])if(r.config[`branch.${a}.${k}`]){r.config[`branch.${b}.${k}`]=r.config[`branch.${a}.${k}`];delete r.config[`branch.${a}.${k}`];}
  if(a===cur)r.head={ref:'refs/heads/'+b};
  return 0;
 }
 if(o._.length&&!o.list){
  const [name,start]=o._;
  if(!validName(name)){p(`fatal: '${name}' is not a valid branch name`);p(C.yellow("hint: See `man git check-ref-format`"));p(C.yellow('hint: Disable this message with "git config advice.refSyntax false"'));return 128;}
  if(r.refs['refs/heads/'+name]&&!o.force){p(`fatal: a branch named '${name}' already exists`);return 128;}
  const id=start?resolveCommit(world,r,start):head;
  if(!id){if(!start)p(`fatal: not a valid object name: '${cur}'`);else p(`fatal: not a valid object name: '${start}'`);return 128;}
  r.refs['refs/heads/'+name]=id;
  if(start&&r.refs['refs/remotes/'+start]){const [remote,...rest]=start.split('/');r.config[`branch.${name}.remote`]=remote;r.config[`branch.${name}.merge`]='refs/heads/'+rest.join('/');p(`branch '${name}' set up to track '${start}'.`);}
  return 0;
 }
 // list
 const locals=Object.keys(r.refs).filter(k=>k.startsWith('refs/heads/')).map(k=>k.slice(11)).sort(cmp);
 const remotes=Object.keys(r.refs).filter(k=>k.startsWith('refs/remotes/')).map(k=>k.slice(13)).sort(cmp);
 /** @type {any[]} */
 const rows=[];
 if(!o.remotes){
  if(!cur)rows.push({star:true,name:`(HEAD detached at ${short(r.head.sha)})`,id:head,color:C.green});
  else if(!head)rows.push(null);
  for(const b of locals)rows.push({star:b===cur,name:b,id:r.refs['refs/heads/'+b],color:b===cur?C.green:x=>x,branch:b});
 }
 if(o.remotes||o.all){
  const virtual=Object.entries(r.remoteHead||{}).filter(([rem,b])=>r.refs[`refs/remotes/${rem}/${b}`]).map(([rem,b])=>({name:`${rem}/HEAD`,arrow:`${rem}/${b}`}));
  const names=[...remotes,...virtual.map(v=>v.name)].sort(cmp);
  for(const b of names){
   const v=virtual.find(x=>x.name===b);
   if(v){rows.push({name:(o.all?'remotes/':'')+b,arrow:v.arrow,id:r.refs['refs/remotes/'+v.arrow],color:C.red});continue;}
   rows.push({name:(o.all?'remotes/':'')+b,id:r.refs['refs/remotes/'+b],color:C.red});
  }
 }
 let list=rows.filter(Boolean);
 if(o.merged)list=list.filter(x=>x.id&&isAncestor(world,x.id,head)||x.id===head);
 if(o.noMerged)list=list.filter(x=>x.id&&!isAncestor(world,x.id,head)&&x.id!==head);
 const w=Math.max(0,...list.map(x=>x.name.length));
 for(const x of list){
  let line=`${x.star?'*':' '} ${x.color(o.verbose||vv?x.name.padEnd(w):x.name)}`;
  if(x.arrow){line=`  ${x.color(x.name)} -> ${x.arrow}`;p(line);continue;}
  if((o.verbose||vv)&&x.id){
   let extra='';
   if(x.branch){const t=tracking(world,r,x.branch);if(t){const bits=[t.ahead&&`ahead ${t.ahead}`,t.behind&&`behind ${t.behind}`].filter(Boolean);if(vv)extra=`[${C.blue(t.name)}${t.gone?': gone':bits.length?': '+bits.join(', '):''}] `;else if(t.gone)extra='[gone] ';else if(bits.length)extra=`[${bits.join(', ')}] `;}}
   line+=` ${C.yellow(short(x.id))} ${extra}${subject(commitOf(world,x.id)?.msg)}`;
  }
  p(line);
 }
 return 0;
}

/* ------------------------------------------------------------ switch / checkout */
export function moveTo(world,r,p,{target,branch=null,detach=false,create=null,from=null,force=false,op='checkout',quietSwitch=false,track=null}){
 const before=currentBranch(r)??headCommit(r),wasDetached=!currentBranch(r)&&headCommit(r);
 if(target!==headCommit(r)||force){
  const res=checkoutTree(world,r,target,{force});
  if(res.error==='dirty'){p(`error: Your local changes to the following files would be overwritten by checkout:`);for(const f of res.paths)p('\t'+f);p('Please commit your changes or stash them before you switch branches.');p('Aborting');return 1;}
  if(res.error==='untracked'){p('error: The following untracked working tree files would be overwritten by checkout:');for(const f of res.paths)p('\t'+f);p('Please move or remove them before you switch branches.');p('Aborting');return 1;}
 }
 if(create){r.refs['refs/heads/'+create]=target;if(track){r.config[`branch.${create}.remote`]=track.remote;r.config[`branch.${create}.merge`]='refs/heads/'+track.branch;}}
 r.prev=currentBranch(r)??before;
 if(wasDetached&&!(detach&&wasDetached===target))p(`Previous HEAD position was ${short(wasDetached)} ${subject(commitOf(world,wasDetached)?.msg)}`);
 if(detach)r.head={sha:target};else r.head={ref:'refs/heads/'+(create||branch)};
 logHead(r,target,`checkout: moving from ${before} to ${create||branch||from||short(target)}`);
 r.reflog[r.reflog.length-1].old=null;
 if(!r.merge){for(const d of [...dirtyPaths(world,r)].sort(cmp)){const s=statusOf(world,r);const x=s.staged.find(y=>y.path===d)||s.unstaged.find(y=>y.path===d);if(x)p(`${({modified:'M',deleted:'D','new file':'A',renamed:'R'})[x.kind]||'M'}\t${d}`);}}
 if(track)p(`branch '${create}' set up to track '${track.remote}/${track.branch}'.`);
 if(detach){
  if(!quietSwitch&&from){
   for(const l of [`Note: switching to '${from}'.`,'',"You are in 'detached HEAD' state. You can look around, make experimental",'changes and commit them, and you can discard any commits you make in this','state without impacting any branches by switching back to a branch.','','If you want to create a new branch to retain commits you create, you may','do so (now or later) by using -c with the switch command. Example:','','  git switch -c <new-branch-name>','','Or undo this operation with:','','  git switch -','','Turn off this advice by setting config variable advice.detachedHead to false',''])p(l);
  }
  p(`HEAD is now at ${short(target)} ${subject(commitOf(world,target)?.msg)}`);
  return 0;
 }
 const name=create||branch;
 if(create)p(`Switched to a new branch '${name}'`);else p(`Switched to branch '${name}'`);
 if(!create||track)for(const l of trackLines(world,r,name))p(l);
 return 0;
}
function remoteGuess(world,r,name){
 const hits=Object.keys(r.refs).filter(k=>k.startsWith('refs/remotes/')&&k.split('/').slice(3).join('/')===name);
 if(hits.length!==1)return null;const [, , remote]=hits[0].split('/');return {remote,branch:name,id:r.refs[hits[0]]};
}
function cmdSwitch({world,r,args,p}){
 const o=parse(args,{bool:{'-d':'detach','--detach':'detach','-f':'force','--force':'force','--discard-changes':'force','-q':'quiet','-t':'trackFlag','--track':'trackFlag','--no-guess':'noGuess'},val:{'-c':'create','--create':'create','-C':'forceCreate','--force-create':'forceCreate'}});
 if(o.error)return bad(p,'switch',o);
 if(r.merge||r.seq){p(r.seq?.op==='rebase'?'fatal: cannot switch branch while rebasing':'fatal: cannot switch branch while merging');p('Consider "git merge --quit" or "git worktree add".');return 128;}
 const create=o.create||o.forceCreate;
 if(create){
  if(!validName(create)){p(`fatal: '${create}' is not a valid branch name`);return 128;}
  if(r.refs['refs/heads/'+create]&&!o.forceCreate){p(`fatal: a branch named '${create}' already exists`);return 128;}
  const start=o._[0],id=start?resolveCommit(world,r,start):headCommit(r);
  if(start&&!id){p(`fatal: invalid reference: ${start}`);return 128;}
  if(!id){r.head={ref:'refs/heads/'+create};p(`Switched to a new branch '${create}'`);return 0;}
  const track=start&&r.refs['refs/remotes/'+start]?{remote:start.split('/')[0],branch:start.split('/').slice(1).join('/')}:null;
  return moveTo(world,r,p,{target:id,create,force:o.force,track});
 }
 let name=o._[0];
 if(!name){p('fatal: missing branch or commit argument');return 128;}
 if(name==='-'){name=r.prev;if(!name){p('fatal: invalid reference: @{-1}');return 128;}}
 if(o.detach){const id=resolveCommit(world,r,name);if(!id){p(`fatal: invalid reference: ${name}`);return 128;}return moveTo(world,r,p,{target:id,detach:true,force:o.force,from:name,quietSwitch:true});}
 if(name===currentBranch(r)){logHead(r,headCommit(r),`checkout: moving from ${name} to ${name}`);p(`Already on '${name}'`);for(const l of trackLines(world,r,name))p(l);return 0;}
 const ref=r.refs['refs/heads/'+name];
 if(ref)return moveTo(world,r,p,{target:ref,branch:name,force:o.force});
 if(!headCommit(r)&&!ref&&currentBranch(r)){p(`fatal: invalid reference: ${name}`);return 128;}
 const guess=!o.noGuess&&remoteGuess(world,r,name);
 if(guess)return moveTo(world,r,p,{target:guess.id,create:name,force:o.force,track:guess});
 const id=resolveCommit(world,r,name);
 if(id){p(`fatal: a branch is expected, got ${r.refs['refs/remotes/'+name]?`remote branch '${name}'`:r.refs['refs/tags/'+name]?`tag '${name}'`:`commit '${name}'`}`);p(C.yellow('hint: If you want to detach HEAD at the commit, try again with the --detach option.'));return 128;}
 p(`fatal: invalid reference: ${name}`);return 128;
}
function cmdCheckout({world,r,args,p}){
 const o=parse(args,{bool:{'-f':'force','--force':'force','-q':'quiet','--detach':'detach','--ours':'ours','--theirs':'theirs','-t':'trackFlag','--track':'trackFlag'},val:{'-b':'create','-B':'forceCreate'}});
 if(o.error)return bad(p,'checkout',o);
 const create=o.create||o.forceCreate;
 // checkout [<commit>] -- <paths>  /  checkout <paths>
 const restorePaths=(src,list,dashed=false)=>{
  const specs=pathspecs(world,r,list,p);if(!specs)return 128;
  const from=src?treeFiles(world,src):r.index,un=r.unmerged||{};let n=0;
  for(let i=0;i<specs.length;i++){
   const hits=[...new Set([...Object.keys(from),...Object.keys(un)])].filter(f=>matches(specs[i],f));
   if(!hits.length){p(`error: pathspec '${list[i]}' did not match any file(s) known to git`);return 1;}
   for(const f of hits){
    if(un[f]&&!src){if(o.ours||o.theirs){const id=o.ours?un[f].ours:un[f].theirs;if(id){writeWt(world,r,f,textOf(world,id));n++;}continue;}p(`error: path '${f}' is unmerged`);return 1;}
    writeWt(world,r,f,textOf(world,from[f]));if(src)r.index[f]=from[f];n++;
   }
  }
  if(!dashed&&!o.quiet)p(`Updated ${n} path${n===1?'':'s'} from ${src?`${short(src)}`:'the index'}`);
  return 0;
 };
 if(o.paths){const src=o._[0]?resolveCommit(world,r,o._[0]):null;if(o._[0]&&!src){p(`fatal: invalid reference: ${o._[0]}`);return 128;}return restorePaths(src,o.paths,true);}
 if(create){
  if(r.merge||r.seq){p('fatal: you need to resolve your current index first');return 128;}
  if(!validName(create)){p(`fatal: '${create}' is not a valid branch name`);return 128;}
  if(r.refs['refs/heads/'+create]&&!o.forceCreate){p(`fatal: a branch named '${create}' already exists`);return 128;}
  const start=o._[0],id=start?resolveCommit(world,r,start):headCommit(r);
  if(start&&!id){p(`fatal: '${start}' is not a commit and a branch '${create}' cannot be created from it`);return 128;}
  if(!id){r.head={ref:'refs/heads/'+create};p(`Switched to a new branch '${create}'`);return 0;}
  const track=start&&r.refs['refs/remotes/'+start]?{remote:start.split('/')[0],branch:start.split('/').slice(1).join('/')}:null;
  return moveTo(world,r,p,{target:id,create,force:o.force,track});
 }
 let name=o._[0];
 if(!name){return 0;}
 if(name==='-'){name=r.prev;if(!name){p("error: pathspec '-' did not match any file(s) known to git");return 1;}}
 const ref=r.refs['refs/heads/'+name];
 if(ref||(!headCommit(r)&&name===currentBranch(r))){
  if(r.merge||r.seq){p(`error: you need to resolve your current index first`);for(const f of Object.keys(r.unmerged||{}))p(`${f}: needs merge`);return 1;}
  if(name===currentBranch(r)){logHead(r,headCommit(r),`checkout: moving from ${name} to ${name}`);p(`Already on '${name}'`);for(const l of trackLines(world,r,name))p(l);return 0;}
  return moveTo(world,r,p,{target:ref,branch:name,force:o.force,detach:o.detach,from:name});
 }
 const guess=remoteGuess(world,r,name);
 if(guess&&!resolveRev(world,r,name)){
  return moveTo(world,r,p,{target:guess.id,create:name,force:o.force,track:guess});
 }
 const id=resolveCommit(world,r,name);
 if(id){if(r.merge||r.seq){p('error: you need to resolve your current index first');return 1;}return moveTo(world,r,p,{target:id,detach:true,force:o.force,from:name});}
 // not a ref: treat the arguments as paths
 const rel=repoRel(world,r,name);
 if(rel!==null&&(rel in r.index||Object.keys(r.index).some(f=>f.startsWith(rel+'/'))||rel===''||(r.unmerged&&rel in r.unmerged)))return restorePaths(null,o._);
 p(`error: pathspec '${name}' did not match any file(s) known to git`);return 1;
}

/* ------------------------------------------------------------ tag */
function cmdTag({world,r,args,p}){
 const o=parse(args,{bool:{'-a':'annotate','--annotate':'annotate','-d':'del','--delete':'del','-f':'force','--force':'force','-l':'list','--list':'list','-n':'lines'},val:{'-m':'message','--message':'message'},multi:['message']});
 if(o.error)return bad(p,'tag',o);
 if(o.del){
  let code=0;for(const n of o._){const ref='refs/tags/'+n;if(!r.refs[ref]){p(`error: tag '${n}' not found.`);code=1;continue;}const was=r.refs[ref];delete r.refs[ref];p(`Deleted tag '${n}' (was ${short(was)})`);}return code;
 }
 if(!o._.length||o.list){
  const pat=o._[0];const names=Object.keys(r.refs).filter(k=>k.startsWith('refs/tags/')).map(k=>k.slice(10)).filter(n=>!pat||matches(pat,n)).sort(cmp);
  for(const n of names){if(o.lines){const obj=world.objects[r.refs['refs/tags/'+n]];p(`${n.padEnd(15)} ${subject(obj?.t==='tag'?obj.msg:commitOf(world,r.refs['refs/tags/'+n])?.msg)}`);}else p(n);}
  return 0;
 }
 const [name,start]=o._;
 if(!validName(name)){p(`fatal: '${name}' is not a valid tag name.`);return 128;}
 if(r.refs['refs/tags/'+name]&&!o.force){p(`fatal: tag '${name}' already exists`);return 128;}
 const id=start?resolveCommit(world,r,start):headCommit(r);
 if(!id){p(`fatal: Failed to resolve '${start||'HEAD'}' as a valid ref.`);return 128;}
 if(o.annotate||o.message){
  if(!o.message){p(C.yellow('hint: Waiting for your editor to close the file...'));p('error: There was a problem with the editor \'vi\'.');p(C.dim('(This terminal has no text editor — add the message with -m "message".)'));return 1;}
  if(!identity(world,r))return noIdentity(world,p);
  const tagId=writeTag(world,{object:id,tag:name,tagger:sig(world,r),message:o.message.join('\n\n')+'\n'});
  r.refs['refs/tags/'+name]=tagId;
 }else r.refs['refs/tags/'+name]=id;
 return 0;
}

/* ------------------------------------------------------------ reset / reflog */
function cmdReset({world,r,args,p}){
 const o=parse(args,{bool:{'--soft':'soft','--mixed':'mixed','--hard':'hard','--merge':'merge','--keep':'keep','-q':'quiet','--quiet':'quiet'}});
 if(o.error)return bad(p,'reset',o);
 const head=headCommit(r);
 let rev=null,paths=[...(o.paths||[])];
 for(const a of o._){if(!rev&&!paths.length&&resolveCommit(world,r,a)){rev=a;continue;}paths.push(a);}
 if(paths.length){
  if(o.soft||o.hard){p(`fatal: Cannot do ${o.soft?'soft':'hard'} reset with paths.`);return 128;}
  const src=rev?resolveCommit(world,r,rev):head,from=src?treeFiles(world,src):{};
  const specs=pathspecs(world,r,paths,p);if(!specs)return 128;
  for(const s of specs)for(const f of new Set([...Object.keys(from),...Object.keys(r.index)]))if(matches(s,f)){if(f in from)r.index[f]=from[f];else delete r.index[f];if(r.unmerged?.[f])delete r.unmerged[f];}
  if(r.unmerged&&!Object.keys(r.unmerged).length)r.unmerged=null;
  if(!o.quiet)unstagedAfter(world,r,p);
  return 0;
 }
 const target=rev?resolveCommit(world,r,rev):head;
 if(rev&&!target){p(`fatal: ambiguous argument '${rev}': unknown revision or path not in the working tree.`);return 128;}
 if(!target){if(o.hard||o.soft){p("fatal: ambiguous argument 'HEAD': unknown revision or path not in the working tree.");return 128;}r.index={};return 0;}
 if(o.soft&&(r.merge||r.unmerged)){p('fatal: Cannot do a soft reset in the middle of a merge.');return 128;}
 const was=head;
 if(o.hard){checkoutTree(world,r,target,{force:true});r.unmerged=null;r.merge=null;if(r.seq&&r.seq.op!=='rebase')r.seq=null;}
 else if(!o.soft){r.index={...treeFiles(world,target)};r.unmerged=null;r.merge=null;}
 r.orig=was;
 updateRef(world,r,'HEAD',target,`reset: moving to ${rev||'HEAD'}`);
 if(o.hard){if(!o.quiet)p(`HEAD is now at ${short(target)} ${subject(commitOf(world,target).msg)}`);}
 else if(!o.soft&&!o.quiet)unstagedAfter(world,r,p);
 return 0;
}
function unstagedAfter(world,r,p){
 const s=statusOf(world,r);if(!s.unstaged.length)return;
 p('Unstaged changes after reset:');for(const x of s.unstaged)p(`${x.kind==='deleted'?'D':'M'}\t${x.path}`);
}
function cmdReflog({world,r,args,p}){
 const o=parse(args,{count:true,val:{'-n':'n'},bool:{'--all':'all'}});
 const sub=o._[0]==='show'?o._.slice(1):o._;
 const map=decorations(world,r),list=[...r.reflog].reverse();
 const limit=o.n!=null?Number(o.n):o.count??Infinity;
 if(sub[0]&&sub[0]!=='HEAD'){
  const b=sub[0].replace(/^refs\/heads\//,'');const entries=list.filter(e=>e.branch===b||(e.msg&&false));
  if(!r.refs['refs/heads/'+b]){p(`fatal: ambiguous argument '${sub[0]}': unknown revision or path not in the working tree.`);return 128;}
  entries.slice(0,limit).forEach((e,i)=>p(`${C.yellow(short(e.id))}${decor(map,e.id)} ${b}@{${i}}: ${e.msg}`));
  return 0;
 }
 list.slice(0,limit).forEach((e,i)=>p(`${C.yellow(short(e.id))}${decor(map,e.id)} HEAD@{${i}}: ${e.msg}`));
 return 0;
}

/* ------------------------------------------------------------ blame */
function cmdBlame({world,r,args,p}){
 const o=parse(args,{bool:{'-s':'noAuthor','-e':'email','-l':'long'},val:{'-L':'range'}});
 if(o.error)return bad(p,'blame',o);
 const list=[...o._,...(o.paths||[])];
 const file=list.at(-1),rev=list.length>1?list[0]:null;
 if(!file){p('usage: '+USAGE.blame);return 129;}
 const start=rev?resolveCommit(world,r,rev):headCommit(r);
 if(!start){p(`fatal: no such ref: ${rev||'HEAD'}`);return 128;}
 const rel=repoRel(world,r,file);
 const tree=treeFiles(world,start);
 if(!(rel in tree)){p(`fatal: no such path '${rel}' in ${rev||'HEAD'}`);return 128;}
 const lines=textOf(world,tree[rel]).replace(/\n$/,'').split('\n');
 const owner=new Array(lines.length).fill(null);
 // Walk history: each line belongs to the oldest commit that still has it unchanged.
 const stack=[{id:start,map:lines.map((_,i)=>i)}];
 while(stack.length){
  const {id,map}=stack.pop(),c=commitOf(world,id),txt=textOf(world,treeFiles(world,id)[rel]).replace(/\n$/,'').split('\n');
  let pending=new Map(map.map((orig,local)=>[local,orig]).filter(([,orig])=>owner[orig]===null));
  if(!pending.size)continue;
  for(const par of c.parents){
   const pt=treeFiles(world,par)[rel];if(!pt)continue;
   const ptxt=textOf(world,pt).replace(/\n$/,'').split('\n');
   const ops=diffOps(ptxt,txt),carry=[];
   for(const [t,,oi,ni] of ops)if(t===' '&&pending.has(ni)){carry[oi]=pending.get(ni);pending.delete(ni);}
   const nextMap=[];ptxt.forEach((_,i)=>{if(carry[i]!==undefined)nextMap[i]=carry[i];});
   const fixed=ptxt.map((_,i)=>nextMap[i]??-1);
   if(fixed.some(x=>x>=0))stack.push({id:par,map:fixed.map(x=>x<0?lines.length:x)});
  }
  for(const orig of pending.values())if(orig<lines.length&&owner[orig]===null)owner[orig]=id;
 }
 const boundary=id=>!commitOf(world,id).parents.length;
 const nameW=Math.max(...owner.map(id=>commitOf(world,id).author.name.length)),numW=String(lines.length).length;
 const from=o.range?Number(o.range.split(',')[0]):1,to=o.range?Number(o.range.split(',')[1]||lines.length):lines.length;
 lines.forEach((l,i)=>{
  if(i+1<from||i+1>to)return;
  const id=owner[i],c=commitOf(world,id);
  const hash=boundary(id)?'^'+id.slice(0,7):id.slice(0,8);
  const who=o.email?`<${c.author.email}>`:c.author.name.padEnd(nameW);
  p(`${hash} ${o.noAuthor?'':`(${who} ${isoDate(c.author.time,c.author.tz)} ${String(i+1).padStart(numW)}) `}${o.noAuthor?String(i+1).padStart(numW)+') ':''}${l}`);
 });
 return 0;
}
import {diffLines as diffOps} from './diff.js';

/* ------------------------------------------------------------ plumbing */
function cmdLsFiles({world,r,args,p}){
 const o=parse(args,{bool:{'-s':'stage','--stage':'stage','-o':'others','--others':'others','-m':'modified','--modified':'modified','-u':'unmerged','--exclude-standard':'std','-c':'cached','--cached':'cached'}});
 if(o.error)return bad(p,'ls-files',o);
 if(o.others){const s=statusOf(world,r);for(const f of s.untrackedFiles)p(f);return 0;}
 if(o.modified){for(const x of statusOf(world,r).unstaged)p(x.path);return 0;}
 const un=r.unmerged||{};
 for(const f of [...new Set([...Object.keys(r.index),...Object.keys(un)])].sort(cmp)){
  if(o.stage||o.unmerged){if(un[f]){const u=un[f];[[u.base,1],[u.ours,2],[u.theirs,3]].forEach(([id,n])=>{if(id)p(`100644 ${id} ${n}\t${f}`);});}else if(!o.unmerged)p(`100644 ${r.index[f]} 0\t${f}`);}
  else p(f);
 }
 return 0;
}
function cmdCatFile({world,r,args,p}){
 const o=parse(args,{bool:{'-t':'type','-p':'pretty','-s':'size','-e':'exists'}});
 if(o.error)return bad(p,'cat-file',o);
 const spec=o._[0];if(!spec){p('usage: git cat-file <type> <object>');return 129;}
 let id=resolveRev(world,r,spec);
 const m=spec.match(/^([^:]+):(.+)$/);if(m){const c=resolveCommit(world,r,m[1]);id=c?treeFiles(world,c)[m[2]]:null;}
 if(spec.endsWith('^{tree}')){const c=resolveCommit(world,r,spec.slice(0,-7));id=c?commitOf(world,c).tree:null;}
 const obj=id&&world.objects[id];
 if(!obj){if(o.exists)return 1;p(`fatal: Not a valid object name ${spec}`);return 128;}
 const type={blob:'blob',tree:'tree',commit:'commit',tag:'tag'}[obj.t];
 if(o.exists)return 0;
 if(o.type){p(type);return 0;}
 const ident=x=>`${x.name} <${x.email}> ${x.time} ${x.tz}`;
 const body=obj.t==='blob'?obj.c:obj.t==='tree'?obj.e.map(([mode,name,x])=>`${mode.padStart(6,'0')} ${mode==='40000'?'tree':'blob'} ${x}\t${name}`).join('\n')+'\n':obj.t==='commit'?`tree ${obj.tree}\n${obj.parents.map(x=>`parent ${x}\n`).join('')}author ${ident(obj.author)}\ncommitter ${ident(obj.committer)}\n\n${obj.msg}`:`object ${obj.obj}\ntype ${obj.type}\ntag ${obj.tag}\ntagger ${ident(obj.tagger)}\n\n${obj.msg}`;
 if(o.size){p(String(new TextEncoder().encode(obj.t==='tree'?'x'.repeat(obj.e.reduce((s,[m,n])=>s+m.length+n.length+22,0)):body).length));return 0;}
 for(const l of body.replace(/\n$/,'').split('\n'))p(l);
 return 0;
}
function cmdRevParse({world,r,args,p}){
 const o=parse(args,{bool:{'--short':'short','--abbrev-ref':'abbrev','--show-toplevel':'top','--git-dir':'gitdir','--is-inside-work-tree':'inside','--verify':'verify'}});
 if(o.error)return bad(p,'rev-parse',o);
 if(o.top){p(r.path);return 0;}if(o.gitdir){p(world.cwd===r.path?'.git':r.path+'/.git');return 0;}if(o.inside){p('true');return 0;}
 for(const a of o._){
  if(o.abbrev){if(a==='HEAD'){p(currentBranch(r)??'HEAD');continue;}if(/@\{u(pstream)?\}$/.test(a)){const b=a.replace(/@\{u(pstream)?\}$/,'')||currentBranch(r),u=upstreamOf(world,r,b);if(!u){p(`fatal: no upstream configured for branch '${b}'`);return 128;}p(`${u.remote}/${u.branch}`);continue;}p(a);continue;}
  const id=resolveRev(world,r,a);
  if(!id){p(a);p(`fatal: ambiguous argument '${a}': unknown revision or path not in the working tree.`);p("Use '--' to separate paths from revisions, like this:");p("'git <command> [<revision>...] -- [<file>...]'");return 128;}
  p(o.short?short(id):id);
 }
 return 0;
}
function cmdCheckIgnore({world,r,args,p}){
 const o=parse(args,{bool:{'-v':'verbose','--verbose':'verbose','-n':'nonMatching'}});
 if(o.error)return bad(p,'check-ignore',o);
 if(!o._.length){p('fatal: no path specified');return 128;}
 const text=world.fs[r.path+'/.gitignore']??'';const raw=text.split('\n');
 let any=false;
 for(const x of o._){
  const rel=repoRel(world,r,x);let hit=/** @type {{line:number,pattern:string}|null} */ (null);
  raw.forEach((line,i)=>{const l=line.replace(/\s+$/,'');if(!l||l.startsWith('#'))return;const rules=ignoreRulesOf(l);if(isIgnored(rules,rel)||(l.startsWith('!')&&isIgnored(ignoreRulesOf(l.slice(1)),rel)))hit={line:i+1,pattern:l};});
  if(hit&&!hit.pattern.startsWith('!')){any=true;p(o.verbose?`.gitignore:${hit.line}:${hit.pattern}\t${x}`:x);}
  else if(o.verbose&&o.nonMatching)p(`::\t${x}`);
 }
 return any?0:1;
}
function ignoreRulesOf(line){return ignoreRules({fs:{'/x/.gitignore':line}},{path:'/x'});}
function cmdClean({world,r,args,p}){
 const o=parse(args,{bool:{'-n':'dry','--dry-run':'dry','-f':'force','--force':'force','-d':'dirs','-x':'ignored','-q':'quiet'}});
 if(o.error)return bad(p,'clean',o);
 if(!o.force&&!o.dry){p('fatal: clean.requireForce defaults to true and neither -i, -n, nor -f given; refusing to clean');return 128;}
 const s=statusOf(world,r),W=worktree(world,r);
 const targets=o.dirs?s.untracked:s.untracked.filter(x=>!x.endsWith('/'));
 if(o.ignored)targets.push(...s.ignored);
 for(const t of targets){
  if(o.dry){p(`Would remove ${t}`);continue;}
  if(!o.quiet)p(`Removing ${t}`);
  for(const f of Object.keys(W))if(f===t||(t.endsWith('/')&&f.startsWith(t)))deleteWt(world,r,f);
 }
 return 0;
}
export {flattenTree,hunks,relTo};
export const noIdentityLines=noIdentity;
