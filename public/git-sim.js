// A teaching model of Git for the free practice sandbox.
//
// Learners type real commands against a simulated repository: a working tree,
// an index, commits with real trees, branches, a stash, tags and remotes. The
// model is deliberately honest. When a command cannot work it prints what Git
// would print and records *why* it failed with the fix, so the review panel can
// explain the mistake afterwards. Nothing is ever quietly "made to work".
//
// Supported: init, clone, config, status, add, rm, mv, restore, reset, commit
// (including --amend), log, diff, show, branch, switch, checkout, merge with
// conflicts, rebase, cherry-pick, revert, tag, stash, remote, fetch, pull,
// push, clean, reflog, help.
//
// Out of scope and refused honestly: a rebase, cherry-pick or revert that hits
// a conflict stops instead of guessing, and no network is contacted.

export const GIT_COMMANDS=['init','clone','config','status','add','rm','mv','restore','reset','commit','log','diff','show','branch','switch','checkout','merge','rebase','cherry-pick','revert','tag','stash','remote','fetch','pull','push','clean','reflog','help'];

export const GIT_USAGE={
 init:'git init',clone:'git clone <url>',config:'git config user.name "Your Name"',status:'git status [--short]',
 add:'git add <path> | . | -A | -u',rm:'git rm [--cached] <path>',mv:'git mv <from> <to>',restore:'git restore [--staged] <path>',
 reset:'git reset [--soft|--mixed|--hard] [<commit>]',commit:'git commit -m "message" [--amend]',log:'git log [--oneline] [--graph] [--all]',
 diff:'git diff [--staged] [<commit>]',show:'git show [<commit>]',branch:'git branch [<name>] [-d|-D <name>]',
 switch:'git switch [-c] <branch>',checkout:'git checkout [-b] <branch>',merge:'git merge <branch> [--abort]',
 rebase:'git rebase <branch>',"cherry-pick":'git cherry-pick <commit>',revert:'git revert <commit>',tag:'git tag [<name>] [-d <name>]',
 stash:'git stash [push|list|pop|apply|drop]',remote:'git remote add <name> <url> | -v',fetch:'git fetch [<remote>]',
 pull:'git pull [<remote>] [<branch>]',push:'git push [-u] [<remote>] [<branch>]',clean:'git clean [-n|-f]',reflog:'git reflog',help:'git help [<command>]'
};

/** A fresh repository: nothing initialised until `git init` or `git clone`. */
export function createRepo(){
 return {
  initialised:false, files:{}, index:{}, commits:[], branches:{}, head:{detached:false,name:'main'},
  previousBranch:null, remotes:{}, remoteRefs:{}, upstream:{}, stash:[], tags:{}, config:{'user.name':'','user.email':''},
  conflict:null, reflog:[], mistakes:[], transcript:[],
  stats:{commands:0,commits:0,branches:0,switches:0,merges:0,conflicts:0,resolves:0,stashes:0,fetches:0,pulls:0,pushes:0}
 };
}

const short=id=>String(id||'').slice(0,7);
const hashOf=seed=>{let h=5381;for(const ch of seed)h=((h<<5)+h+ch.charCodeAt(0))>>>0;return h.toString(16).padStart(8,'0').slice(0,7);};
const same=a=>JSON.stringify(a);
/** The lines Git leaves in a file when a merge conflicts. */
const CONFLICT_MARKERS=/^(<{7}|={7}|>{7})/m;
const headId=r=>r.head.detached?r.head.name:(r.branches[r.head.name]??null);
const commitOf=(r,id)=>r.commits.find(c=>c.id===id)||null;
const treeOf=(r,id)=>{const c=commitOf(r,id);return c?{...c.tree}:{};};
const pathsOf=(...trees)=>[...new Set(trees.flatMap(t=>Object.keys(t||{})))];

function reachable(r,starts){
 const seen=new Set(),stack=[...starts];
 while(stack.length){const id=stack.pop();if(!id||seen.has(id))continue;seen.add(id);const c=commitOf(r,id);if(c)stack.push(...c.parents);}
 return seen;
}
function isAncestor(r,older,newer){
 if(!older||!newer)return false;
 return reachable(r,[newer]).has(older);
}
function mergeBase(r,a,b){
 if(!a||!b)return null;
 const fromA=reachable(r,[a]);
 const stack=[b],seen=new Set();
 while(stack.length){const id=stack.pop();if(!id||seen.has(id))continue;if(fromA.has(id))return id;seen.add(id);const c=commitOf(r,id);if(c)stack.push(...c.parents);}
 return null;
}
/** Resolves HEAD, a branch, a tag, a remote branch, a short hash or `x~n` / `x^n`. */
function resolveRef(r,ref){
 const text=String(ref??'').trim();
 if(!text)return null;
 const parts=/^([^~^]+)((?:[~^]\d*)*)$/.exec(text);
 if(!parts)return null;
 const [,base,suffixes]=parts;
 let id=null;
 if(base==='HEAD')id=headId(r);
 else if(base==='@')id=headId(r);
 else if(base==='-')id=r.previousBranch?r.branches[r.previousBranch]:null;
 else if(Object.hasOwn(r.branches,base))id=r.branches[base];
 else if(Object.hasOwn(r.tags,base))id=r.tags[base];
 else if(Object.hasOwn(r.remoteRefs,base))id=r.remoteRefs[base];
 else if(/^[0-9a-f]{4,40}$/.test(base))id=r.commits.find(c=>c.id.startsWith(base))?.id??null;
 if(!id)return null;
 for(const step of suffixes.match(/[~^]\d*/g)||[]){
  const c=commitOf(r,id);
  if(!c)return null;
  if(step[0]==='^'){const n=Number(step.slice(1)||1);id=c.parents[n-1]??null;}
  else{let n=Number(step.slice(1)||1);while(n-->0){const cur=commitOf(r,id);if(!cur)return null;id=cur.parents[0]??null;}}
  if(!id)return null;
 }
 return id;
}
/** Tokenises a command line, keeping quoted arguments together. */
export function tokenize(line){
 const out=[],re=/"([^"]*)"|'([^']*)'|(\S+)/g;
 let m;
 while((m=re.exec(String(line))))out.push(m[1]??m[2]??m[3]);
 return out;
}
/**
 * @param {any} r
 * @param {{message: string, parents: (string|null)[], tree: Record<string,string>, branch?: string}} options
 */
function writeCommit(r,options){
 const {message,parents,tree,branch}=options;
 const id=hashOf([message,...parents,same(tree),r.commits.length].join('|'));
 const commit={id,message,parents,tree:{...tree},branch:branch??(r.head.detached?'detached':r.head.name),at:r.commits.length};
 r.commits.push(commit);
 return commit;
}
/** Records a learner mistake and returns the lines to print. */
function refuse(r,command,message,why,fix){
 r.mistakes.push({command,message,why,fix});
 return [message];
}
/** Honest limitation of the teaching model: not the learner's mistake. */
const unsupported=message=>[message];
/** Paths whose uncommitted work would be replaced by moving to `tree`. */
function overwriteRisk(r,tree){
 const head=headId(r)?treeOf(r,headId(r)):{};
 return dirtyPaths(r).filter(p=>(p in head?head[p]:undefined)!==(p in tree?tree[p]:undefined));
}
/** The paths a commit changed compared with its first parent. */
function changedPaths(r,commitId){
 const c=commitOf(r,commitId);
 const parentTree=c.parents[0]?treeOf(r,c.parents[0]):{};
 return pathsOf(parentTree,c.tree).filter(p=>parentTree[p]!==c.tree[p]);
}
/**
 * Moves the working tree to `tree`, keeping uncommitted work for every path
 * that does not differ — exactly as Git carries local edits across a switch,
 * a fast-forward or a merge instead of discarding them.
 */
function adoptTree(r,tree){
 const files={...tree},index={...tree};
 for(const p of dirtyPaths(r)){
  if(p in r.files)files[p]=r.files[p];else delete files[p];
  if(p in r.index)index[p]=r.index[p];else delete index[p];
 }
 r.files=files;
 r.index=index;
}
/** Refuses rather than replacing work the learner has not committed yet. */
function refuseOverwrite(r,command,action,paths){
 return refuse(r,command,
  `error: Your local changes to the following files would be overwritten by ${action}:\n\t${paths.join('\n\t')}`,
  ['You have edits that are not saved in a commit, and this would replace them.','你有未提交的修改，这个操作会覆盖它们。','你有未提交的修改，這個操作會覆蓋它們。'],
  ['Commit the work (git add . then git commit -m "…") or set it aside with git stash, then try again.','先提交（git add . 与 git commit -m "…"），或用 git stash 暂存，再重试。','先提交（git add . 與 git commit -m "…"），或用 git stash 暫存，再重試。']);
}

/** What a commit would record right now, compared with HEAD. */
function stagedChanges(r){
 const head=headId(r),tree=head?treeOf(r,head):{};
 return {
  tree,
  added:Object.keys(r.index).filter(p=>!(p in tree)),
  modified:Object.keys(r.index).filter(p=>(p in tree)&&r.index[p]!==tree[p]),
  deleted:Object.keys(tree).filter(p=>!(p in r.index))
 };
}
/** Uncommitted edits, compared with the index. */
function workChanges(r){
 return {
  modified:Object.keys(r.index).filter(p=>(p in r.files)&&r.files[p]!==r.index[p]),
  deleted:Object.keys(r.index).filter(p=>!(p in r.files))
 };
}
const untrackedFiles=r=>Object.keys(r.files).filter(p=>!(p in r.index));
const stagedCount=r=>{const c=stagedChanges(r);return c.added.length+c.modified.length+c.deleted.length;};
const unmergedPaths=r=>(r.conflict?.paths??[]);
const dirtyPaths=r=>{
 const w=workChanges(r),s=stagedChanges(r);
 return [...new Set([...w.modified,...w.deleted,...s.added,...s.modified,...s.deleted])];
};
function writeConflictMarkers(r,path,label,ours,theirs){
 r.files[path]=`<<<<<<< HEAD\n${ours??''}\n=======\n${theirs??''}\n>>>>>>> ${label}\n`;
}
/** The small project the sandbox starts with, so there is something to commit. */
export const GIT_SEED_FILES={
 'README.md':'# Team project\nA small web app the team builds together.',
 'src/app.js':'export function validateSignup(form) {\n  return form.name.trim().length > 0;\n}',
 'notes.txt':'Review checklist:\n- read the diff before staging\n- keep commits small'
};
/** The hint for a task: a fixed triple, or one that depends on the state. */
const hintFor=(task,repo)=>typeof task.hint==='function'?task.hint(repo):task.hint;
/** Writes a file in the working tree, which is how edits become "modified". */
export function writeFile(repo,path,content){
 const next=structuredClone(repo);
 next.files[path]=String(content);
 return syncTasks(next);
}
/** Deletes a file from the working tree. */
export function removeFile(repo,path){
 const next=structuredClone(repo);
 delete next.files[path];
 return syncTasks(next);
}
/**
 * Resolves the conflict markers in one file by keeping the current lines, the
 * incoming lines, or both, so a learner can compare that with editing by hand.
 * @param {any} repo @param {string} path @param {'ours'|'theirs'|'both'} [choice]
 */
export function resolveConflictFile(repo,path,choice='ours'){
 const next=structuredClone(repo);
 const text=String(next.files[path]??'');
 next.files[path]=text.replace(/^<<<<<<<[^\n]*\n([\s\S]*?)^=======\n([\s\S]*?)^>>>>>>>[^\n]*\n?/gm,(all,ours,theirs)=>choice==='theirs'?theirs:choice==='both'?ours+theirs:ours);
 return syncTasks(next);
}
/** The task the learner is on: the first one not yet reached. */
function currentTaskId(r){
 const scenario=scenarioById(r.scenario?.id);
 if(!scenario)return null;
 return scenario.tasks.find(t=>!r.tasks?.[t.id])?.id??null;
}
/**
 * Remembers the tasks that have been satisfied so far. The walk stops at the
 * first unsatisfied task, so a task is only recorded once the tasks before it
 * are done, and a later command can never un-tick it — a stash is empty again
 * after it is popped, and staging is undone by the next commit.
 * @param {any} r
 */
function syncTasks(r){
 const scenario=scenarioById(r.scenario?.id);
 if(!scenario)return r;
 r.tasks??={};
 for(const task of scenario.tasks){
  if(r.tasks[task.id])continue;
  if(!task.done(r))break;
  r.tasks[task.id]=true;
 }
 // Point the file editor at the file the current task talks about.
 const pending=scenario.tasks.find(t=>!r.tasks[t.id]);
 if(pending){
  const named=Object.keys(r.files).find(p=>hintFor(pending,r)[0].includes(p));
  if(named)r.selectedFile=named;
 }
 return r;
}
function cmdInit(r){
 r.initialised=true;
 r.head={detached:false,name:'main'};
 r.branches={};
 r.remoteRefs={};
 r.files={...GIT_SEED_FILES};
 r.index={};
 r.reflog.push({id:null,text:'repository created'});
 return ['Initialized empty Git repository in /forma/playground/.git/'];
}
function cmdConfig(r,args,cmd){
 const key=args.find(a=>!a.startsWith('-'));
 const value=args[args.indexOf(key)+1];
 if(!key||key==='--list'||key==='-l')return Object.entries(r.config).map(([k,v])=>`${k}=${v}`);
 if(!Object.hasOwn(r.config,key))return refuse(r,cmd,`error: key does not contain a section: ${key}`,
  ['This sandbox stores user.name and user.email only.','这个沙盒只保存 user.name 和 user.email。','這個沙盒只儲存 user.name 和 user.email。'],
  ['Run git config user.name "Your Name" and git config user.email "you@example.edu".','请运行 git config user.name "Your Name" 与 git config user.email "you@example.edu"。','請執行 git config user.name "Your Name" 與 git config user.email "you@example.edu"。']);
 if(value===undefined)return [r.config[key]];
 r.config[key]=value;
 return [];
}

function cmdStatus(r,args){
 const shortMode=args.includes('-s')||args.includes('--short');
 const s=stagedChanges(r),w=workChanges(r),untracked=untrackedFiles(r),unmerged=unmergedPaths(r);
 const branchLine=r.head.detached?`HEAD detached at ${short(r.head.name)}`:`On branch ${r.head.name}`;
 if(shortMode){
  const lines=[];
  for(const p of unmerged)lines.push(`UU ${p}`);
  for(const p of s.added)lines.push(`A  ${p}`);
  for(const p of s.modified)lines.push(`M  ${p}`);
  for(const p of s.deleted)lines.push(`D  ${p}`);
  for(const p of w.modified)lines.push(` M ${p}`);
  for(const p of w.deleted)lines.push(` D ${p}`);
  for(const p of untracked)lines.push(`?? ${p}`);
  return lines;
 }
 const lines=[branchLine];
 if(!headId(r)&&!r.head.detached)lines.push('','No commits yet');
 if(unmerged.length){
  lines.push('You have unmerged paths.','  (fix conflicts and run "git commit")','  (use "git merge --abort" to abort the merge)','','Unmerged paths:','  (use "git add <file>..." to mark resolution)');
  for(const p of unmerged)lines.push(`\tboth modified:   ${p}`);
  return lines;
 }
 if(s.added.length||s.modified.length||s.deleted.length){
  lines.push('','Changes to be committed:','  (use "git restore --staged <file>..." to unstage)');
  for(const p of s.added)lines.push(`\tnew file:   ${p}`);
  for(const p of s.modified)lines.push(`\tmodified:   ${p}`);
  for(const p of s.deleted)lines.push(`\tdeleted:    ${p}`);
 }
 if(w.modified.length||w.deleted.length){
  lines.push('','Changes not staged for commit:','  (use "git add <file>..." to update what will be committed)','  (use "git restore <file>..." to discard changes in working directory)');
  for(const p of w.modified)lines.push(`\tmodified:   ${p}`);
  for(const p of w.deleted)lines.push(`\tdeleted:    ${p}`);
 }
 if(untracked.length){
  lines.push('','Untracked files:','  (use "git add <file>..." to include in what will be committed)');
  for(const p of untracked)lines.push(`\t${p}`);
 }
 if(lines.length===1)lines.push('','nothing to commit, working tree clean');
 else lines.push('','no changes added to commit (use "git add" and/or "git commit -a")');
 return lines;
}
function cmdAdd(r,args,cmd){
 const all=args.includes('-A')||args.includes('--all');
 const update=args.includes('-u');
 const paths=args.filter(a=>!a.startsWith('-'));
 if(!paths.length&&!all&&!update)return refuse(r,cmd,'Nothing specified, nothing added.',
  ['git add needs a path, or . / -A to add everything.','git add 需要路径，或用 . / -A 添加全部。','git add 需要路徑，或用 . / -A 加入全部。'],
  ['Try git add . or git add src/app.js.','试试 git add . 或 git add src/app.js。','試試 git add . 或 git add src/app.js。']);
 const targets=new Set();
 for(const p of (all?['.']:paths)){
  if(p==='.'||p==='*'||p==='-A'){
   for(const f of Object.keys(r.files))targets.add(f);
   for(const f of Object.keys(r.index))if(!(f in r.files))targets.add(f);
   continue;
  }
  if(update&&!(p in r.index))continue;
  if(!(p in r.files)&&!(p in r.index))return refuse(r,cmd,`fatal: pathspec '${p}' did not match any files`,
   ['That path is not in the project, so Git has nothing to add.','项目里没有这个路径，Git 没有可添加的内容。','專案裡沒有這個路徑，Git 沒有可加入的內容。'],
   ['Run git status to see the exact file names.','先运行 git status 查看确切文件名。','先執行 git status 查看確切檔案名稱。']);
  targets.add(p);
 }
 const unfinished=[...targets].filter(p=>r.conflict&&r.conflict.paths.includes(p)&&CONFLICT_MARKERS.test(String(r.files[p]??'')));
 if(unfinished.length)return refuse(r,cmd,
  `error: '${unfinished[0]}' still contains conflict markers\nhint: remove the <<<<<<<, ======= and >>>>>>> lines, then run git add again.\n(Real Git stages the file as it is; this practice keeps the merge open until the markers are gone.)`,
  ['The file still has the <<<<<<<, ======= and >>>>>>> lines from the merge, so the code is not finished.','文件里还有合并留下的 <<<<<<<、======= 和 >>>>>>> 行，代码还没完成。','檔案裡還有合併留下的 <<<<<<<、======= 和 >>>>>>> 行，程式碼還沒完成。'],
  ['Edit the file, keep the lines you want, then run git add '+unfinished[0]+'.','编辑文件保留需要的行，然后运行 git add '+unfinished[0]+'。','編輯檔案保留需要的行，然後執行 git add '+unfinished[0]+'。']);
 const lines=[];
 for(const p of targets){
  if(p in r.files){
   if(r.index[p]!==r.files[p])lines.push(`add '${p}'`);
   r.index[p]=r.files[p];
  }else if(p in r.index){delete r.index[p];lines.push(`remove '${p}'`);}
  if(r.conflict&&r.conflict.paths.includes(p)){
   r.conflict.paths=r.conflict.paths.filter(x=>x!==p);
   r.stats.resolves++;
   lines.push(`Resolved '${p}'`);
  }
 }
 return lines;
}

function cmdRm(r,args,cmd){
 const cached=args.includes('--cached');
 const paths=args.filter(a=>!a.startsWith('-'));
 if(!paths.length)return refuse(r,cmd,'fatal: No pathspec was given.',
  ['git rm needs the file to remove.','git rm 需要指定要删除的文件。','git rm 需要指定要刪除的檔案。'],
  ['Try git rm notes.txt, or git rm --cached notes.txt to keep the file on disk.','试试 git rm notes.txt，或用 git rm --cached notes.txt 保留磁盘上的文件。','試試 git rm notes.txt，或用 git rm --cached notes.txt 保留磁碟上的檔案。']);
 const lines=[];
 for(const p of paths){
  if(!(p in r.index)&&!(p in r.files))return refuse(r,cmd,`fatal: pathspec '${p}' did not match any files`,
   ['That path is not tracked, so there is nothing to remove.','这个路径没有被跟踪，没有可删除的内容。','這個路徑沒有被追蹤，沒有可刪除的內容。'],
   ['Run git status to list the tracked files.','先运行 git status 列出已跟踪文件。','先執行 git status 列出已追蹤檔案。']);
  delete r.index[p];
  if(!cached)delete r.files[p];
  lines.push(`rm '${p}'`);
 }
 return lines;
}
function cmdMv(r,args,cmd){
 const [from,to]=args.filter(a=>!a.startsWith('-'));
 if(!from||!to)return refuse(r,cmd,'usage: git mv <source> <destination>',
  ['git mv needs the old name and the new name.','git mv 需要旧名称和新名称。','git mv 需要舊名稱和新名稱。'],
  ['Try git mv notes.txt docs/notes.txt.','试试 git mv notes.txt docs/notes.txt。','試試 git mv notes.txt docs/notes.txt。']);
 if(!(from in r.files))return refuse(r,cmd,`fatal: bad source, source=${from}`,
  ['The source file does not exist in the working tree.','工作区里没有这个源文件。','工作區裡沒有這個來源檔案。'],
  ['Run git status to see the file names you have.','先运行 git status 查看现有文件名。','先執行 git status 查看現有檔案名稱。']);
 if(to in r.files)return refuse(r,cmd,`fatal: destination exists, source=${from}, destination=${to}`,
  ['The destination name is already used, so Git refuses to overwrite it.','目标名称已被占用，Git 不会覆盖它。','目標名稱已被佔用，Git 不會覆寫它。'],
  ['Choose another name, or remove the existing file first.','换一个名称，或先删除已存在的文件。','換一個名稱，或先刪除已存在的檔案。']);
 r.files[to]=r.files[from];
 delete r.files[from];
 if(from in r.index){r.index[to]=r.index[from];delete r.index[from];}
 return [];
}
function cmdRestore(r,args,cmd){
 const staged=args.includes('--staged')||args.includes('--cached');
 const worktree=args.includes('--worktree')||args.includes('-W');
 const both=staged&&worktree;
 const paths=args.filter(a=>!a.startsWith('-'));
 if(!paths.length)return refuse(r,cmd,'fatal: you must specify path(s) to restore.',
  ['git restore needs the file to restore.','git restore 需要指定要恢复的文件。','git restore 需要指定要還原的檔案。'],
  ['Try git restore src/app.js, or git restore --staged src/app.js to unstage it.','试试 git restore src/app.js，或用 git restore --staged src/app.js 取消暂存。','試試 git restore src/app.js，或用 git restore --staged src/app.js 取消暫存。']);
 const head=headId(r),tree=head?treeOf(r,head):{};
 for(const p of paths){
  if(!(p in r.index)&&!(p in tree))return refuse(r,cmd,`error: pathspec '${p}' did not match any file(s) known to git`,
   ['That file is not tracked, so there is no saved version to restore.','这个文件未被跟踪，没有可恢复的版本。','這個檔案未被追蹤，沒有可還原的版本。'],
   ['Run git status to see the tracked files.','先运行 git status 查看已跟踪文件。','先執行 git status 查看已追蹤檔案。']);
  // --staged --worktree puts the index and the file back together, as Git does.
  if(staged||both){
   if(p in tree)r.index[p]=tree[p];
   else delete r.index[p];
  }
  if(worktree||both||!staged){
   if(p in r.index)r.files[p]=r.index[p];
   else delete r.files[p];
  }
 }
 return [];
}

function cmdReset(r,args,cmd){
 const mode=args.includes('--soft')?'soft':args.includes('--hard')?'hard':'mixed';
 const target=args.find(a=>!a.startsWith('-'))||'HEAD';
 const id=resolveRef(r,target);
 if(!id)return refuse(r,cmd,`fatal: ambiguous argument '${target}': unknown revision or path not in the working tree.`,
  ['That commit, branch or tag does not exist in this repository.','这个提交、分支或标签在仓库里不存在。','這個提交、分支或標籤在倉庫裡不存在。'],
  ['Run git log --oneline and copy a real commit id.','先运行 git log --oneline 复制真实提交号。','先執行 git log --oneline 複製真實提交號。']);
 const tree=treeOf(r,id);
 // Name the work a --hard reset is about to throw away, instead of losing it silently.
 const discarded=mode==='hard'?dirtyPaths(r).filter(p=>(p in r.files?r.files[p]:undefined)!==(p in tree?tree[p]:undefined)):[];
 const before=headId(r);
 const orphaned=mode==='hard'&&before&&before!==id&&!reachable(r,[id]).has(before)?[before]:[];
 if(r.head.detached)r.head.name=id;
 else r.branches[r.head.name]=id;
 if(mode!=='soft')r.index={...tree};
 if(mode==='hard')r.files={...tree};
 r.conflict=null;
 const lines=[`HEAD is now at ${short(id)} ${commitOf(r,id).message}`];
 if(discarded.length)lines.push(`warning: ${discarded.length} uncommitted change${discarded.length===1?' was':'s were'} discarded: ${discarded.join(', ')}`);
 if(orphaned.length)lines.push(`warning: ${orphaned.length} commit is no longer on ${r.head.detached?'HEAD':r.head.name}: ${short(before)} ${commitOf(r,before)?.message??''}`);
 if(discarded.length||orphaned.length)lines.push('hint: commit before a --hard reset; what you leave behind is still in git reflog, and git reset --hard <id> brings it back.');
 return lines;
}
function cmdCommit(r,args,cmd){
 const amend=args.includes('--amend');
 const messageFlag=args.findIndex(a=>a==='-m'||a==='--message');
 const given=messageFlag>=0?args[messageFlag+1]:null;
 const all=args.some(a=>/^-[a-z]*a$/.test(a))||args.includes('--all');
 if(all){
  const w=workChanges(r);
  for(const p of w.modified)r.index[p]=r.files[p];
  for(const p of w.deleted)delete r.index[p];
 }
 if(unmergedPaths(r).length)return refuse(r,cmd,'error: Committing is not possible because you have unmerged files.',
  ['A merge stopped with a conflict, so there is no single version to record yet.','合并因冲突停下，还没有可以记录的版本。','合併因衝突停下，還沒有可以記錄的版本。'],
  ['Edit each file, keep the lines you want, then run git add <file> and git commit.','编辑文件保留需要的行，然后运行 git add <file> 和 git commit。','編輯檔案保留需要的行，然後執行 git add <file> 和 git commit。']);
 const head=headId(r);
 const merging=!!r.conflict;
 if(!stagedCount(r)&&!amend&&!merging)return refuse(r,cmd,'nothing added to commit but untracked files present (use "git add" to track)',
  ['The index is empty: Git records the staged snapshot, not the working tree.','暂存区是空的：Git 记录的是暂存快照，不是工作区。','暫存區是空的：Git 記錄的是暫存快照，不是工作區。'],
  ['Run git add <file> (or git commit -a) and then commit again.','先运行 git add <file>（或 git commit -a），再提交。','先執行 git add <file>（或 git commit -a），再提交。']);
 if(amend&&!head)return refuse(r,cmd,'fatal: You have nothing to amend.',
  ['There is no commit yet, so there is nothing to replace.','还没有提交，没有可修改的内容。','還沒有提交，沒有可修改的內容。'],
  ['Commit once first, then use --amend to correct it.','先完成一次提交，再用 --amend 修正。','先完成一次提交，再用 --amend 修正。']);
 if(!given&&!amend&&!merging)return refuse(r,cmd,'Aborting commit due to empty commit message.',
  ['A commit message explains why the change happened.','提交说明要解释改动的理由。','提交說明要解釋改動的理由。'],
  ['Run git commit -m "Reject blank sign-up names".','运行 git commit -m "Reject blank sign-up names"。','執行 git commit -m "Reject blank sign-up names"。']);
 const message=given||(merging?`Merge branch '${r.conflict.from}'`:commitOf(r,head)?.message||'Change');
 const parents=merging?[head,r.conflict.fromId??r.conflict.from]:head?[head]:[];
 const tree={...r.index};
 if(amend){
  const replaced=commitOf(r,head);
  r.commits=r.commits.filter(c=>c.id!==head);
  for(const c of r.commits)c.parents=c.parents.map(p=>p===head?(replaced.parents[0]??null):p);
 }
 const commit=writeCommit(r,{message,parents,tree,branch:r.head.detached?'detached':r.head.name});
 if(r.head.detached)r.head.name=commit.id;
 else r.branches[r.head.name]=commit.id;
 r.conflict=null;
 r.stats.commits++;
 r.reflog.push({id:commit.id,text:`${amend?'commit (amend)':'commit'}: ${message}`});
 const changed=Object.keys(tree).length;
 if(r.head.detached)return [`[detached HEAD ${short(commit.id)}] ${message}`,` ${changed} file${changed===1?'':'s'} changed`,'You are not currently on a branch: save this work with git switch -c <name>.'];
 return [`[${r.head.name} ${short(commit.id)}] ${message}`,` ${changed} file${changed===1?'':'s'} changed`];
}

const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
/** Commit dates are simulated from the commit order so runs stay reproducible. */
function logDate(at){
 const d=new Date(Date.UTC(2026,0,5+at,9,0,0));
 return `${DAYS[d.getUTCDay()]} ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()} ${String(d.getUTCHours()).padStart(2,'0')}:00:00 2026 +0000`;
}
/** A compact hunk: unchanged edges are trimmed, the middle is shown as -/+. */
function diffLines(path,before,after){
 const a=String(before??'').split('\n'),b=String(after??'').split('\n');
 const out=[`diff --git a/${path} b/${path}`];
 if(before===undefined)out.push('new file mode 100644');
 if(after===undefined)out.push('deleted file mode 100644');
 out.push(`--- ${before===undefined?'/dev/null':'a/'+path}`,`+++ ${after===undefined?'/dev/null':'b/'+path}`);
 let start=0;
 while(start<a.length&&start<b.length&&a[start]===b[start])start++;
 let endA=a.length,endB=b.length;
 while(endA>start&&endB>start&&a[endA-1]===b[endB-1]){endA--;endB--;}
 const ctx=2,from=Math.max(0,start-ctx),toA=Math.min(a.length,endA+ctx),toB=Math.min(b.length,endB+ctx);
 out.push(`@@ -${from+1},${toA-from} +${from+1},${toB-from} @@`);
 for(let i=from;i<start;i++)out.push(' '+a[i]);
 for(let i=start;i<endA;i++)out.push('-'+a[i]);
 for(let i=start;i<endB;i++)out.push('+'+b[i]);
 for(let i=endA;i<toA;i++)out.push(' '+a[i]);
 return out;
}
function diffTrees(r,before,after){
 const lines=[];
 for(const p of pathsOf(before,after).sort()){
  if(before[p]===after[p])continue;
  lines.push(...diffLines(p,before[p],after[p]));
 }
 return lines;
}
function cmdDiff(r,args,cmd){
 const staged=args.includes('--staged')||args.includes('--cached');
 const ref=args.find(a=>!a.startsWith('-'));
 if(ref){
  const id=resolveRef(r,ref);
  if(!id)return refuse(r,cmd,`fatal: bad revision '${ref}'`,
   ['That commit or branch does not exist here.','这个提交或分支在这里不存在。','這個提交或分支在這裡不存在。'],
   ['Run git log --oneline to see the real commit ids.','先运行 git log --oneline 查看真实提交号。','先執行 git log --oneline 查看真實提交號。']);
  return diffTrees(r,treeOf(r,id),r.files);
 }
 if(staged){
  const head=headId(r);
  return diffTrees(r,head?treeOf(r,head):{},r.index);
 }
 return diffTrees(r,r.index,r.files);
}
function cmdShow(r,args,cmd){
 const ref=args.find(a=>!a.startsWith('-'))||'HEAD';
 const id=resolveRef(r,ref);
 if(!id)return refuse(r,cmd,`fatal: ambiguous argument '${ref}': unknown revision or path not in the working tree.`,
  ['There is no commit with that name.','没有这个名称的提交。','沒有這個名稱的提交。'],
  ['Run git log --oneline to see the commits you have.','先运行 git log --oneline 查看已有提交。','先執行 git log --oneline 查看已有提交。']);
 const c=commitOf(r,id);
 const lines=[`commit ${c.id}`,`Author: ${r.config['user.name']||'Forma learner'} <${r.config['user.email']||'learner@example.edu'}>`,`Date:   ${logDate(c.at)}`,'',`    ${c.message}`,''];
 lines.push(...diffTrees(r,c.parents[0]?treeOf(r,c.parents[0]):{},c.tree));
 return lines;
}

/** Lays commits out in lanes so `git log --graph` looks like Git's own output. */
function graphRows(r,list){
 const lanes=[],rows=[];
 for(const c of list){
  let col=lanes.indexOf(c.id);
  if(col<0){lanes.push(c.id);col=lanes.length-1;}
  rows.push(`${lanes.map((_,i)=>i===col?'*':'|').join(' ')} ${c.id.slice(0,7)} ${c.message}`);
  lanes.splice(col,1,...c.parents.filter(Boolean));
  for(let i=lanes.length-1;i>=0;i--)if(lanes.indexOf(lanes[i])!==i)lanes.splice(i,1);
 }
 return rows;
}
function cmdLog(r,args){
 const oneline=args.includes('--oneline');
 const graph=args.includes('--graph');
 const all=args.includes('--all');
 const nArg=args.find(a=>/^-\d+$/.test(a));
 const limit=nArg?Number(nArg.slice(1)):20;
 const starts=(all?[...Object.values(r.branches),...Object.values(r.tags),...Object.values(r.remoteRefs)]:[headId(r)]).filter(Boolean);
 const seen=reachable(r,starts);
 const list=r.commits.filter(c=>seen.has(c.id)).sort((a,b)=>b.at-a.at).slice(0,limit);
 if(!list.length)return [`fatal: your current branch '${r.head.name}' does not have any commits yet`];
 if(graph)return graphRows(r,list);
 const lines=[];
 for(const c of list){
  if(oneline){lines.push(`${c.id.slice(0,7)} ${c.message}`);continue;}
  const refs=[];
  if(c.id===headId(r)&&!r.head.detached)refs.push(`HEAD -> ${r.head.name}`);
  for(const [n,tip] of Object.entries(r.branches))if(tip===c.id&&n!==r.head.name)refs.push(n);
  for(const [n,tip] of Object.entries(r.remoteRefs))if(tip===c.id)refs.push(n);
  for(const [n,tip] of Object.entries(r.tags))if(tip===c.id)refs.push(`tag: ${n}`);
  lines.push(`commit ${c.id}${refs.length?` (${refs.join(', ')})`:''}`);
  if(c.parents.length>1)lines.push(`Merge: ${c.parents.map(p=>p.slice(0,7)).join(' ')}`);
  lines.push(`Author: ${r.config['user.name']||'Forma learner'} <${r.config['user.email']||'learner@example.edu'}>`,`Date:   ${logDate(c.at)}`,'',`    ${c.message}`,'');
 }
 return lines;
}
function cmdBranch(r,args,cmd){
 const remove=args.includes('-d')||args.includes('-D')||args.includes('--delete');
 const force=args.includes('-D');
 const all=args.includes('-a')||args.includes('--all');
 const name=args.find(a=>!a.startsWith('-'));
 if(remove){
  if(!name)return refuse(r,cmd,'fatal: branch name required.',
   ['git branch -d needs the branch name to delete.','git branch -d 需要指定要删除的分支名。','git branch -d 需要指定要刪除的分支名。'],
   ['Run git branch to see the branch names.','先运行 git branch 查看分支名。','先執行 git branch 查看分支名。']);
  if(!Object.hasOwn(r.branches,name))return refuse(r,cmd,`error: branch '${name}' not found.`,
   ['There is no branch with that name.','没有这个名称的分支。','沒有這個名稱的分支。'],
   ['Run git branch to list the branches you have.','先运行 git branch 列出已有分支。','先執行 git branch 列出已有分支。']);
  if(name===r.head.name&&!r.head.detached)return refuse(r,cmd,`error: Cannot delete branch '${name}' checked out at '/forma/playground'`,
   ['You are standing on that branch, so deleting it would lose your place.','你正在这个分支上，删除它会失去当前位置。','你正在這個分支上，刪除它會失去目前位置。'],
   ['Switch to another branch first: git switch main.','先切换到别的分支：git switch main。','先切換到別的分支：git switch main。']);
  const tip=r.branches[name];
  if(!force&&!isAncestor(r,tip,headId(r)))return refuse(r,cmd,`error: The branch '${name}' is not fully merged.`,
   ['That branch has commits that are not in your current history yet.','该分支上有还没进入当前历史的提交。','該分支上有還沒進入目前歷史的提交。'],
   ['Merge it first (git merge '+name+'), or delete it with git branch -D '+name+' if the work is unwanted.','先合并它（git merge '+name+'），或确认不要这些工作后用 git branch -D '+name+' 删除。','先合併它（git merge '+name+'），或確認不要這些工作後用 git branch -D '+name+' 刪除。']);
  delete r.branches[name];
  return [`Deleted branch ${name} (was ${short(tip)}).`];
 }
 if(name){
  if(Object.hasOwn(r.branches,name))return refuse(r,cmd,`fatal: a branch named '${name}' already exists.`,
   ['Branch names must be unique: the name is already taken.','分支名必须唯一，这个名字已被使用。','分支名必須唯一，這個名稱已被使用。'],
   ['Pick another name, or switch to it with git switch '+name+'.','换一个名字，或用 git switch '+name+' 切换过去。','換一個名稱，或用 git switch '+name+' 切換過去。']);
  if(!/^[A-Za-z][\w./-]{0,35}$/.test(name))return refuse(r,cmd,`fatal: '${name}' is not a valid branch name.`,
   ['A branch name starts with a letter and uses letters, digits, - . / _ only.','分支名以字母开头，只能使用字母、数字和 - . / _。','分支名以字母開頭，只能使用字母、數字和 - . / _。'],
   ['Try git branch feature/form.','试试 git branch feature/form。','試試 git branch feature/form。']);
  if(!headId(r))return refuse(r,cmd,`fatal: not a valid object name: '${r.head.name}'`,
   ['A branch is a name for a commit, and there is no commit yet.','分支是提交的名字，而现在还没有提交。','分支是提交的名稱，而現在還沒有提交。'],
   ['Run git add . and git commit -m "Initial version" first.','先运行 git add . 和 git commit -m "Initial version"。','先執行 git add . 和 git commit -m "Initial version"。']);
  r.branches[name]=headId(r);
  r.stats.branches++;
  return [];
 }
 const lines=Object.keys(r.branches).sort().map(n=>`${n===r.head.name&&!r.head.detached?'* ':'  '}${n}`);
 if(all)for(const ref of Object.keys(r.remoteRefs).sort())lines.push(`  remotes/${ref}`);
 return lines.length?lines:['(no branches yet)'];
}

function cmdSwitch(r,args,cmd){
 const create=args.includes('-c')||args.includes('--create')||args.includes('-b');
 const previous=args.includes('-');
 const target=previous?'-':(args.filter(a=>!a.startsWith('-')).at(-1)??null);
 if(!target)return refuse(r,cmd,'fatal: missing branch name.',
  ['The command needs the branch to switch to.','命令需要指定要切换的分支。','指令需要指定要切換的分支。'],
  ['Try git switch feature/form, or git switch -c feature/form to create it.','试试 git switch feature/form，或用 git switch -c feature/form 创建。','試試 git switch feature/form，或用 git switch -c feature/form 建立。']);
 let branch=null,id=null;
 if(previous){
  if(!r.previousBranch||!Object.hasOwn(r.branches,r.previousBranch))return refuse(r,cmd,'fatal: no previous branch to switch to.',
   ['Nothing has been switched yet in this session.','本次会话还没有切换过分支。','本次工作階段還沒有切換過分支。'],
   ['Run git branch to pick a branch by name.','先运行 git branch 按名称选择分支。','先執行 git branch 依名稱選擇分支。']);
  branch=r.previousBranch;
  id=r.branches[branch];
 }else if(create){
  if(Object.hasOwn(r.branches,target))return refuse(r,cmd,`fatal: a branch named '${target}' already exists.`,
   ['Branch names must be unique: the name is already taken.','分支名必须唯一，这个名字已被使用。','分支名必須唯一，這個名稱已被使用。'],
   ['Switch to it with git switch '+target+', or pick another name.','用 git switch '+target+' 切换过去，或换一个名字。','用 git switch '+target+' 切換過去，或換一個名稱。']);
  if(!/^[A-Za-z][\w./-]{0,35}$/.test(target))return refuse(r,cmd,`fatal: '${target}' is not a valid branch name.`,
   ['A branch name starts with a letter and uses letters, digits, - . / _ only.','分支名以字母开头，只能使用字母、数字和 - . / _。','分支名以字母開頭，只能使用字母、數字和 - . / _。'],
   ['Try git switch -c feature/form.','试试 git switch -c feature/form。','試試 git switch -c feature/form。']);
  const base=resolveRef(r,target)??headId(r);
  if(!base)return refuse(r,cmd,`fatal: not a valid object name: '${r.head.name}'`,
   ['A branch is a name for a commit, and there is no commit yet.','分支是提交的名字，而现在还没有提交。','分支是提交的名稱，而現在還沒有提交。'],
   ['Run git add . and git commit -m "Initial version" first.','先运行 git add . 和 git commit -m "Initial version"。','先執行 git add . 和 git commit -m "Initial version"。']);
  r.branches[target]=base;
  r.stats.branches++;
  branch=target;
  id=base;
 }else if(Object.hasOwn(r.branches,target)){
  branch=target;
  id=r.branches[target];
 }else{
  const found=resolveRef(r,target);
  if(!found)return refuse(r,cmd,`fatal: invalid reference: ${target}`,
   ['No branch, tag or commit has that name in this repository.','仓库里没有这个名称的分支、标签或提交。','倉庫裡沒有這個名稱的分支、標籤或提交。'],
   ['Run git branch to list branches, or git log --oneline to copy a commit id.','先运行 git branch 列出分支，或 git log --oneline 复制提交号。','先執行 git branch 列出分支，或 git log --oneline 複製提交號。']);
  id=found;
 }
 const nextTree=id?treeOf(r,id):{};
 const blocked=overwriteRisk(r,nextTree);
 if(blocked.length)return refuseOverwrite(r,cmd,/^git checkout/.test(cmd)?'checkout':'switch',blocked);
 if(r.head.name&&!r.head.detached)r.previousBranch=r.head.name;
 adoptTree(r,nextTree);
 r.head=branch?{detached:false,name:branch}:{detached:true,name:id};
 r.stats.switches++;
 if(!branch)return [`Note: switching to '${target}'.`,"You are in 'detached HEAD' state. You can look around and commit, but those commits belong to no branch."];
 return [create?`Switched to a new branch '${branch}'`:`Switched to branch '${branch}'`];
}

/** Three-way merge. Returns the lines to print and may leave a conflict behind. */
function mergeInto(r,theirId,label,command,message){
 const ours=headId(r);
 const incoming=treeOf(r,theirId);
 const base=ours?mergeBase(r,ours,theirId):null;
 const baseTree=base?treeOf(r,base):{};
 const touched=pathsOf(baseTree,incoming).filter(p=>baseTree[p]!==incoming[p]);
 const blocked=dirtyPaths(r).filter(p=>touched.includes(p));
 if(blocked.length)return refuseOverwrite(r,command,'merge',blocked);
 if(!ours){
  adoptTree(r,treeOf(r,theirId));
  if(r.head.detached)r.head.name=theirId;
  else r.branches[r.head.name]=theirId;
  r.stats.merges++;
  return [`Updating ${short(theirId)}`,'Fast-forward'];
 }
 if(isAncestor(r,theirId,ours))return ['Already up to date.'];
 if(isAncestor(r,ours,theirId)){
  adoptTree(r,treeOf(r,theirId));
  if(r.head.detached)r.head.name=theirId;
  else r.branches[r.head.name]=theirId;
  r.stats.merges++;
  return [`Updating ${short(ours)}..${short(theirId)}`,'Fast-forward'];
 }
 const ourTree=treeOf(r,ours),theirTree=treeOf(r,theirId);
 /** @type {Record<string,string|undefined>} */
 const merged={};
 /** @type {string[]} */
 const conflicts=[];
 for(const p of pathsOf(baseTree,ourTree,theirTree)){
  const b=baseTree[p],o=ourTree[p],t=theirTree[p];
  if(o===t)merged[p]=o;
  else if(o===b)merged[p]=t;
  else if(t===b)merged[p]=o;
  else conflicts.push(p);
 }
 /** @type {Record<string,string>} */
 const clean={};
 for(const p of Object.keys(merged))if(merged[p]!==undefined)clean[p]=merged[p];
 const snapshot={files:{...r.files},index:{...r.index},branches:{...r.branches},head:{...r.head}};
 if(conflicts.length){
  adoptTree(r,clean);
  for(const p of conflicts)writeConflictMarkers(r,p,label,ourTree[p],theirTree[p]);
  r.conflict={from:label,fromId:theirId,into:r.head.detached?'detached':r.head.name,paths:conflicts,snapshot};
  r.stats.conflicts++;
  return [
   ...conflicts.map(p=>`Auto-merging ${p}`),
   ...conflicts.map(p=>`CONFLICT (content): Merge conflict in ${p}`),
   'Automatic merge failed; fix conflicts and then commit the result.'
  ];
 }
 const id=writeCommit(r,{message:message||`Merge branch '${label}'`,parents:[ours,theirId],tree:clean}).id;
 adoptTree(r,clean);
 if(r.head.detached)r.head.name=id;
 else r.branches[r.head.name]=id;
 r.stats.merges++;
 return ["Merge made by the 'ort' strategy.",` ${pathsOf(baseTree,ourTree,theirTree).length} files merged`];
}
function cmdMerge(r,args,cmd){
 if(args.includes('--abort')){
  if(!r.conflict)return refuse(r,cmd,'fatal: There is no merge to abort (MERGE_HEAD missing).',
   ['No merge is waiting to be finished, so there is nothing to undo.','没有正在进行的合并，所以没有可撤销的内容。','沒有正在進行的合併，所以沒有可撤銷的內容。'],
   ['Check the state with git status.','先用 git status 查看当前状态。','先用 git status 查看目前狀態。']);
  const s=r.conflict.snapshot;
  r.files={...s.files};
  r.index={...s.index};
  r.branches={...s.branches};
  r.head={...s.head};
  r.conflict=null;
  return ['Merge aborted.'];
 }
 if(args.includes('--continue')){
  if(!r.conflict)return refuse(r,cmd,'fatal: There is no merge in progress (MERGE_HEAD missing).',
   ['Nothing is being merged right now.','当前没有正在进行的合并。','目前沒有正在進行的合併。'],
   ['Start one with git merge <branch>.','用 git merge <branch> 开始一次合并。','用 git merge <branch> 開始一次合併。']);
  return cmdCommit(r,['-m',`Merge branch '${r.conflict.from}'`],cmd);
 }
 if(r.conflict)return refuse(r,cmd,'error: You have not concluded your merge (MERGE_HEAD exists).',
  ['The earlier merge still has unresolved conflicts.','之前的合并还有未解决的冲突。','之前的合併還有未解決的衝突。'],
  ['Finish it with git add <file> then git commit, or undo it with git merge --abort.','用 git add <file> 与 git commit 完成，或用 git merge --abort 撤销。','用 git add <file> 與 git commit 完成，或用 git merge --abort 撤銷。']);
 const name=args.find(a=>!a.startsWith('-'));
 if(!name)return refuse(r,cmd,'fatal: No branch specified.',
  ['git merge needs the branch to merge in.','git merge 需要指定要合并进来的分支。','git merge 需要指定要合併進來的分支。'],
  ['Try git merge feature/form.','试试 git merge feature/form。','試試 git merge feature/form。']);
 if(name===r.head.name&&!r.head.detached)return refuse(r,cmd,`Already on '${name}'`,
  ['A branch cannot be merged into itself.','分支不能合并到自己。','分支不能合併到自己。'],
  ['Switch to the branch that should receive the work, then merge: git switch main.','先切换到要接收工作的分支，再合并：git switch main。','先切換到要接收工作的分支，再合併：git switch main。']);
 let theirId=null;
 if(Object.hasOwn(r.branches,name))theirId=r.branches[name];
 else if(Object.hasOwn(r.remoteRefs,name))theirId=r.remoteRefs[name];
 else{
  const found=resolveRef(r,name);
  if(!found)return refuse(r,cmd,`merge: ${name} - not something we can merge`,
   ['No branch, tag or remote branch has that name.','没有这个名称的分支、标签或远程分支。','沒有這個名稱的分支、標籤或遠端分支。'],
   ['Run git branch to list branches, or git fetch to update origin/main.','先运行 git branch 列出分支，或用 git fetch 更新 origin/main。','先執行 git branch 列出分支，或用 git fetch 更新 origin/main。']);
  theirId=found;
 }
 return mergeInto(r,theirId,name,cmd);
}

/** Replays one commit's changes on top of `baseTree`, reporting any conflict first. */
function replay(r,commitId,baseTree){
 const c=commitOf(r,commitId);
 const parentTree=c.parents[0]?treeOf(r,c.parents[0]):{};
 const next={...baseTree},conflicts=[];
 for(const p of pathsOf(parentTree,c.tree)){
  if(parentTree[p]===c.tree[p])continue;
  if(baseTree[p]===parentTree[p])next[p]=c.tree[p];
  else if(baseTree[p]===c.tree[p]){/* already applied */}
  else conflicts.push(p);
 }
 return {next,conflicts};
}
function cmdRebase(r,args,cmd){
 const onto=args.find(a=>!a.startsWith('-'));
 if(!onto)return refuse(r,cmd,'fatal: no upstream specified',
  ['git rebase needs the branch to replay onto.','git rebase 需要指定要重放到的分支。','git rebase 需要指定要重放到的分支。'],
  ['Try git rebase main.','试试 git rebase main。','試試 git rebase main。']);
 const ontoId=resolveRef(r,onto);
 if(!ontoId)return refuse(r,cmd,`fatal: invalid upstream '${onto}'`,
  ['That branch or commit does not exist here.','这个分支或提交在这里不存在。','這個分支或提交在這裡不存在。'],
  ['Run git branch to list the branches you have.','先运行 git branch 列出已有分支。','先執行 git branch 列出已有分支。']);
 if(r.conflict)return refuse(r,cmd,'error: It seems that there is already a merge in progress.',
  ['Finish or abort the merge before rebasing.','请先完成或撤销当前合并，再执行 rebase。','請先完成或撤銷目前合併，再執行 rebase。'],
  ['Run git merge --abort, or git add <file> and git commit to finish it.','运行 git merge --abort，或用 git add <file> 与 git commit 完成。','執行 git merge --abort，或用 git add <file> 與 git commit 完成。']);
 const head=headId(r);
 if(!head)return refuse(r,cmd,`fatal: invalid upstream '${onto}'`,
  ['There is no commit to replay yet.','还没有可以重放的提交。','還沒有可以重放的提交。'],
  ['Commit something first.','先完成一次提交。','先完成一次提交。']);
 const blocked=overwriteRisk(r,treeOf(r,ontoId));
 if(blocked.length)return refuseOverwrite(r,cmd,'rebase',blocked);
 const base=mergeBase(r,head,ontoId);
 const chain=[];
 let cur=head;
 while(cur&&cur!==base){chain.unshift(cur);cur=commitOf(r,cur)?.parents[0]??null;}
 if(!chain.length)return ['Current branch is up to date.'];
 const replayed=new Set(chain.flatMap(id=>{
  const c=commitOf(r,id),parentTree=c.parents[0]?treeOf(r,c.parents[0]):{};
  return pathsOf(parentTree,c.tree).filter(p=>parentTree[p]!==c.tree[p]);
 }));
 const blockedRebase=dirtyPaths(r).filter(p=>replayed.has(p));
 if(blockedRebase.length)return refuseOverwrite(r,cmd,'rebase',blockedRebase);
 let probe={...treeOf(r,ontoId)};
 for(const id of chain){
  const step=replay(r,id,probe);
  if(step.conflicts.length)return unsupported([
   `CONFLICT (content): ${step.conflicts.join(', ')} would conflict while replaying ${short(id)}.`,
   'This teaching model checks the whole rebase first, so nothing has been changed.',
   'Use git merge to keep both histories, or resolve the conflict by hand.'
  ]);
  probe=step.next;
 }
 let current=ontoId;
 for(const id of chain){
  const step=replay(r,id,treeOf(r,current));
  current=writeCommit(r,{message:commitOf(r,id).message,parents:[current],tree:step.next,branch:r.head.detached?'detached':r.head.name}).id;
 }
 adoptTree(r,treeOf(r,current));
 if(r.head.detached)r.head.name=current;
 else r.branches[r.head.name]=current;
 r.reflog.push({id:current,text:`rebase: onto ${onto}`});
 return [`Successfully rebased and updated refs/heads/${r.head.detached?'HEAD':r.head.name}.`];
}

function cmdCherryPick(r,args,cmd){
 const ref=args.find(a=>!a.startsWith('-'));
 const id=ref?resolveRef(r,ref):null;
 if(!id)return refuse(r,cmd,`fatal: bad revision '${ref??''}'`,
  ['That commit does not exist here.','这个提交在这里不存在。','這個提交在這裡不存在。'],
  ['Run git log --oneline to copy a real commit id.','先运行 git log --oneline 复制真实提交号。','先執行 git log --oneline 複製真實提交號。']);
 if(r.conflict)return refuse(r,cmd,'error: A merge is still in progress.',
  ['Finish or abort the merge first.','请先完成或撤销当前合并。','請先完成或撤銷目前合併。'],
  ['Run git merge --abort, or git add <file> and git commit.','运行 git merge --abort，或用 git add <file> 与 git commit。','執行 git merge --abort，或用 git add <file> 與 git commit。']);
 const head=headId(r);
 if(!head)return refuse(r,cmd,'fatal: cannot cherry-pick onto an empty branch',
  ['There is no commit to build on yet.','还没有可以继续的提交。','還沒有可以繼續的提交。'],
  ['Commit something first.','先完成一次提交。','先完成一次提交。']);
 const blockedPick=dirtyPaths(r).filter(p=>changedPaths(r,id).includes(p));
 if(blockedPick.length)return refuseOverwrite(r,cmd,'cherry-pick',blockedPick);
 const step=replay(r,id,treeOf(r,head));
 if(step.conflicts.length)return unsupported([
  `CONFLICT (content): ${step.conflicts.join(', ')} would conflict when applying ${short(id)}.`,
  'This model stops before changing anything rather than guessing a resolution.',
  'Merge the branch instead, or apply the change by hand.'
 ]);
 const c=commitOf(r,id);
 const commit=writeCommit(r,{message:`${c.message} (cherry picked from ${short(id)})`,parents:[head],tree:step.next,branch:r.head.detached?'detached':r.head.name});
 adoptTree(r,step.next);
 if(r.head.detached)r.head.name=commit.id;
 else r.branches[r.head.name]=commit.id;
 r.stats.commits++;
 return [`[${r.head.detached?'detached HEAD':r.head.name} ${short(commit.id)}] ${c.message}`];
}
function cmdRevert(r,args,cmd){
 const ref=args.find(a=>!a.startsWith('-'));
 const id=ref?resolveRef(r,ref):null;
 if(!id)return refuse(r,cmd,`fatal: bad revision '${ref??''}'`,
  ['That commit does not exist here.','这个提交在这里不存在。','這個提交在這裡不存在。'],
  ['Run git log --oneline to copy a real commit id.','先运行 git log --oneline 复制真实提交号。','先執行 git log --oneline 複製真實提交號。']);
 const head=headId(r);
 if(!head)return refuse(r,cmd,'fatal: nothing to revert',
  ['There is no commit to undo yet.','还没有可以撤销的提交。','還沒有可以撤銷的提交。'],
  ['Commit something first.','先完成一次提交。','先完成一次提交。']);
 const blockedRevert=dirtyPaths(r).filter(p=>changedPaths(r,id).includes(p));
 if(blockedRevert.length)return refuseOverwrite(r,cmd,'revert',blockedRevert);
 const c=commitOf(r,id),parentTree=c.parents[0]?treeOf(r,c.parents[0]):{},headTree=treeOf(r,head);
 const next={...headTree},conflicts=[];
 for(const p of pathsOf(parentTree,c.tree)){
  if(parentTree[p]===c.tree[p])continue;
  if(headTree[p]===c.tree[p])next[p]=parentTree[p];
  else conflicts.push(p);
 }
 if(conflicts.length)return unsupported([
  `CONFLICT (content): ${conflicts.join(', ')} changed after ${short(id)}, so undoing it is ambiguous.`,
  'This model stops before changing anything rather than guessing.',
  'Fix the file by hand, or revert an earlier commit instead.'
 ]);
 const commit=writeCommit(r,{message:`Revert "${c.message}"`,parents:[head],tree:next,branch:r.head.detached?'detached':r.head.name});
 adoptTree(r,next);
 if(r.head.detached)r.head.name=commit.id;
 else r.branches[r.head.name]=commit.id;
 r.stats.commits++;
 return [`[${r.head.detached?'detached HEAD':r.head.name} ${short(commit.id)}] Revert "${c.message}"`];
}

function cmdTag(r,args,cmd){
 const remove=args.includes('-d')||args.includes('--delete');
 const named=args.filter(a=>!a.startsWith('-'));
 if(!named.length)return Object.keys(r.tags).sort();
 const [name,ref]=named;
 if(remove){
  if(!Object.hasOwn(r.tags,name))return refuse(r,cmd,`error: tag '${name}' not found.`,
   ['There is no tag with that name.','没有这个名称的标签。','沒有這個名稱的標籤。'],
   ['Run git tag to list the tags you have.','先运行 git tag 列出已有标签。','先執行 git tag 列出已有標籤。']);
  delete r.tags[name];
  return [`Deleted tag '${name}'`];
 }
 if(Object.hasOwn(r.tags,name))return refuse(r,cmd,`fatal: tag '${name}' already exists`,
  ['Tag names must be unique, and this one is taken.','标签名必须唯一，这个名字已被使用。','標籤名必須唯一，這個名稱已被使用。'],
  ['Pick another name, or delete it first with git tag -d '+name+'.','换一个名字，或先用 git tag -d '+name+' 删除。','換一個名稱，或先用 git tag -d '+name+' 刪除。']);
 const id=ref?resolveRef(r,ref):headId(r);
 if(!id)return refuse(r,cmd,'fatal: Failed to resolve HEAD as a valid ref.',
  ['A tag names a commit, and there is no commit yet.','标签是提交的名字，而现在还没有提交。','標籤是提交的名稱，而現在還沒有提交。'],
  ['Commit something first, then tag it.','先完成一次提交，再打标签。','先完成一次提交，再打標籤。']);
 r.tags[name]=id;
 return [];
}
function cmdStash(r,args,cmd){
 const action=args.find(a=>!a.startsWith('-'))||'push';
 if(action==='list')return r.stash.map((s,i)=>`stash@{${i}}: ${s.message}`);
 if(action==='push'||action==='save'){
  const w=workChanges(r),s=stagedChanges(r);
  if(!w.modified.length&&!w.deleted.length&&!s.added.length&&!s.modified.length&&!s.deleted.length)return ['No local changes to save'];
  const head=headId(r);
  r.stash.unshift({message:`WIP on ${r.head.detached?'detached':r.head.name}: ${short(head)} ${head?commitOf(r,head).message:''}`,files:{...r.files},index:{...r.index}});
  const tree=head?treeOf(r,head):{};
  r.files={...tree};
  r.index={...tree};
  r.stats.stashes++;
  return [`Saved working directory and index state ${r.stash[0].message}`];
 }
 if(action==='pop'||action==='apply'){
  if(!r.stash.length)return refuse(r,cmd,'No stash entries found.',
   ['Nothing has been set aside yet.','还没有暂存过任何改动。','還沒有暫存過任何改動。'],
   ['Run git stash to save unfinished work, then git stash pop to bring it back.','先用 git stash 保存未完成的工作，再用 git stash pop 取回。','先用 git stash 儲存未完成的工作，再用 git stash pop 取回。']);
  const entry=r.stash[0];
  const conflicts=Object.keys(entry.files).filter(p=>(p in r.files)&&r.files[p]!==r.index[p]&&r.files[p]!==entry.files[p]);
  if(conflicts.length)return unsupported([
   `CONFLICT (content): restoring the stash would overwrite unsaved edits in ${conflicts.join(', ')}.`,
   'This model applies a stash only when nothing would be lost.',
   'Commit or discard those edits, then run git stash pop again.'
  ]);
  for(const [p,v] of Object.entries(entry.files))r.files[p]=v;
  for(const [p,v] of Object.entries(entry.index))r.index[p]=v;
  if(action==='pop')r.stash.shift();
  return [`On branch ${r.head.detached?'detached HEAD':r.head.name}`,'Changes restored from the stash'];
 }
 if(action==='drop'){
  if(!r.stash.length)return refuse(r,cmd,'No stash entries found.',
   ['Nothing has been set aside yet.','还没有暂存过任何改动。','還沒有暫存過任何改動。'],
   ['Run git stash list to check.','先用 git stash list 查看。','先用 git stash list 查看。']);
  r.stash.shift();
  return [`Dropped refs/stash@{0}`];
 }
 return refuse(r,cmd,`error: unknown subcommand: ${action}`,
  ['This sandbox supports git stash push, list, pop, apply and drop.','这个沙盒支持 git stash push、list、pop、apply 和 drop。','這個沙盒支援 git stash push、list、pop、apply 和 drop。'],
  ['Run git stash list to see the entries.','运行 git stash list 查看暂存条目。','執行 git stash list 查看暫存條目。']);
}

function cmdRemote(r,args,cmd){
 const sub=(args[0]||'').toLowerCase();
 const rest=args.slice(1).filter(a=>!a.startsWith('-'));
 if(!sub||sub==='-v'||sub==='--verbose')return Object.entries(r.remotes).flatMap(([n,x])=>[`${n}\t${x.url} (fetch)`,`${n}\t${x.url} (push)`]);
 if(sub==='add'){
  const [name,url]=rest;
  if(!name||!url)return refuse(r,cmd,'usage: git remote add <name> <url>',
   ['git remote add needs a name and a URL.','git remote add 需要名称和 URL。','git remote add 需要名稱和 URL。'],
   ['Try git remote add origin https://example.edu/team/project.git.','试试 git remote add origin https://example.edu/team/project.git。','試試 git remote add origin https://example.edu/team/project.git。']);
  if(Object.hasOwn(r.remotes,name))return refuse(r,cmd,`error: remote ${name} already exists.`,
   ['A remote with that name is already configured.','该名称的远程仓库已经配置过。','該名稱的遠端倉庫已經設定過。'],
   ['Run git remote -v to see it, or pick another name.','运行 git remote -v 查看，或换一个名称。','執行 git remote -v 查看，或換一個名稱。']);
  r.remotes[name]={url,branches:{}};
  return [];
 }
 if(sub==='remove'||sub==='rm'){
  const [name]=rest;
  if(!name||!Object.hasOwn(r.remotes,name))return refuse(r,cmd,`error: No such remote: '${name??''}'`,
   ['No remote with that name is configured.','没有配置这个名称的远程仓库。','沒有設定這個名稱的遠端倉庫。'],
   ['Run git remote -v to list the remotes you have.','运行 git remote -v 列出已有远程仓库。','執行 git remote -v 列出已有遠端倉庫。']);
  delete r.remotes[name];
  for(const ref of Object.keys(r.remoteRefs))if(ref.startsWith(name+'/'))delete r.remoteRefs[ref];
  return [];
 }
 return refuse(r,cmd,`error: Unknown subcommand: ${sub}`,
  ['This sandbox supports git remote, add, -v and remove.','这个沙盒支持 git remote、add、-v 和 remove。','這個沙盒支援 git remote、add、-v 和 remove。'],
  ['Run git remote -v to list the remotes.','运行 git remote -v 列出远程仓库。','執行 git remote -v 列出遠端倉庫。']);
}
/** Copies the remote's objects and branches into the local repository. */
function fetchRemote(r,name){
 const remote=r.remotes[name];
 const lines=[`From ${remote.url}`];
 remote.objects??={};
 for(const [branch,tip] of Object.entries(remote.branches)){
  const ref=`${name}/${branch}`,before=r.remoteRefs[ref]??null;
  for(const id of Object.keys(remote.objects))if(!commitOf(r,id))r.commits.push(structuredClone(remote.objects[id]));
  r.remoteRefs[ref]=tip;
  lines.push(before?`   ${short(before)}..${short(tip)}  ${branch}     -> ${ref}`:` * [new branch]      ${branch}     -> ${ref}`);
 }
 r.stats.fetches++;
 if(lines.length===1)lines.push('Everything up to date.');
 return lines;
}
function cmdFetch(r,args,cmd){
 const name=args.find(a=>!a.startsWith('-'))||'origin';
 if(!Object.hasOwn(r.remotes,name))return refuse(r,cmd,`fatal: '${name}' does not appear to be a git repository`,
  ['No remote with that name is configured.','没有配置这个名称的远程仓库。','沒有設定這個名稱的遠端倉庫。'],
  ['Run git remote -v to see the remotes, or git clone <url> to start from one.','运行 git remote -v 查看远程仓库，或用 git clone <url> 从远程开始。','執行 git remote -v 查看遠端倉庫，或用 git clone <url> 從遠端開始。']);
 return fetchRemote(r,name);
}
function cmdPush(r,args,cmd){
 const positional=args.filter(a=>!a.startsWith('-'));
 const remoteName=positional[0]||r.upstream[r.head.name]?.remote||'origin';
 if(!Object.hasOwn(r.remotes,remoteName))return refuse(r,cmd,`fatal: '${remoteName}' does not appear to be a git repository`,
  ['No remote with that name is configured, so there is nowhere to push.','没有配置这个名称的远程仓库，没有可推送的目标。','沒有設定這個名稱的遠端倉庫，沒有可推送的目標。'],
  ['Run git remote -v to see the remotes, or git clone <url> to start from one.','运行 git remote -v 查看远程仓库，或用 git clone <url> 从远程开始。','執行 git remote -v 查看遠端倉庫，或用 git clone <url> 從遠端開始。']);
 if(r.head.detached)return refuse(r,cmd,'fatal: You are not currently on a branch.',
  ['A push sends a branch, and a detached HEAD is not one.','推送需要分支，而 detached HEAD 不是分支。','推送需要分支，而 detached HEAD 不是分支。'],
  ['Save the work on a branch first: git switch -c my-work.','先把工作放到分支上：git switch -c my-work。','先把工作放到分支上：git switch -c my-work。']);
 const branch=positional[1]||r.head.name;
 const local=r.branches[branch];
 if(!local)return refuse(r,cmd,`error: src refspec ${branch} does not match any`,
  ['That branch does not exist locally.','本地没有这个分支。','本地沒有這個分支。'],
  ['Run git branch to list your branches.','运行 git branch 列出你的分支。','執行 git branch 列出你的分支。']);
 const remote=r.remotes[remoteName];
 const remoteTip=remote.branches[branch]??null;
 if(remoteTip===local)return [`To ${remote.url}`,'Everything up-to-date'];
 if(remoteTip&&!isAncestor(r,remoteTip,local))return refuse(r,cmd,
  `! [rejected]        ${branch} -> ${branch} (non-fast-forward)\nerror: failed to push some refs to '${remote.url}'\nhint: Updates were rejected because the remote contains work that you do not have locally.`,
  ['The remote has commits you do not have, so this push would erase someone else\'s work.','远程有你没有的提交，这次推送会抹掉别人的工作。','遠端有你沒有的提交，這次推送會抹掉別人的工作。'],
  ['Run git pull first, then push again.','先运行 git pull，然后再推送。','先執行 git pull，然後再推送。']);
 remote.objects??={};
 for(const c of r.commits)remote.objects[c.id]=structuredClone(c);
 remote.branches[branch]=local;
 if(args.includes('-u')||args.includes('--set-upstream'))r.upstream[branch]={remote:remoteName,branch};
 r.stats.pushes++;
 r.reflog.push({id:local,text:`push: ${branch} -> ${remoteName}/${branch}`});
 return [`To ${remote.url}`,remoteTip?`   ${short(remoteTip)}..${short(local)}  ${branch} -> ${branch}`:` * [new branch]      ${branch} -> ${branch}`];
}

function cmdPull(r,args,cmd){
 const positional=args.filter(a=>!a.startsWith('-'));
 const remoteName=positional[0]||r.upstream[r.head.name]?.remote||'origin';
 if(!Object.hasOwn(r.remotes,remoteName))return refuse(r,cmd,`fatal: '${remoteName}' does not appear to be a git repository`,
  ['No remote with that name is configured, so there is nothing to pull from.','没有配置这个名称的远程仓库，没有可拉取的内容。','沒有設定這個名稱的遠端倉庫，沒有可拉取的內容。'],
  ['Run git remote -v to see the remotes, or git clone <url> to start from one.','运行 git remote -v 查看远程仓库，或用 git clone <url> 从远程开始。','執行 git remote -v 查看遠端倉庫，或用 git clone <url> 從遠端開始。']);
 const branch=positional[1]||r.upstream[r.head.name]?.branch||r.head.name;
 const ref=`${remoteName}/${branch}`;
 const lines=fetchRemote(r,remoteName);
 const theirId=r.remoteRefs[ref]??null;
 if(!theirId)return refuse(r,cmd,`fatal: couldn't find remote ref ${branch}`,
  ['The remote has no branch with that name.','远程没有这个名称的分支。','遠端沒有這個名稱的分支。'],
  ['Run git branch -a to list local and remote branches.','运行 git branch -a 列出本地和远程分支。','執行 git branch -a 列出本地和遠端分支。']);
 lines.push(...mergeInto(r,theirId,ref,cmd));
 r.stats.pulls++;
 return lines;
}
/** A small shared project so clone, fetch, pull and push have something to move. */
function seedRemote(url){
 const first={'README.md':'# Team project\nA small web app the team builds together.'};
 const second={...first,'src/app.js':'export function validateSignup(form) {\n  return form.name.trim().length > 0;\n}'};
 const a=hashOf('forma-clone-seed-readme'),b=hashOf('forma-clone-seed-validate');
 const commits=[
  {id:a,message:'Add the project README',parents:[],tree:{...first},branch:'main',at:0},
  {id:b,message:'Reject blank sign-up names',parents:[a],tree:{...second},branch:'main',at:1}
 ];
 return {url,commits,tip:b,tree:second};
}
function cmdClone(r,args,cmd){
 const url=args.find(a=>!a.startsWith('-'));
 if(!url)return refuse(r,cmd,'fatal: You must specify a repository to clone.',
  ['git clone needs the URL of the repository.','git clone 需要仓库的 URL。','git clone 需要倉庫的 URL。'],
  ['Try git clone https://example.edu/team/project.git.','试试 git clone https://example.edu/team/project.git。','試試 git clone https://example.edu/team/project.git。']);
 if(r.initialised)return refuse(r,cmd,"fatal: destination path '.' already exists and is not an empty directory.",
  ['A repository already exists here, and cloning would replace it.','这里已经有仓库，克隆会覆盖它。','這裡已經有倉庫，複製會覆蓋它。'],
  ['Reset the lab to start from an empty directory, then clone again.','先重置实验，从空目录开始再克隆。','先重設實驗，從空目錄開始再複製。']);
 const seed=seedRemote(url);
 r.initialised=true;
 r.commits=structuredClone(seed.commits);
 r.branches={main:seed.tip};
 r.head={detached:false,name:'main'};
 r.files={...seed.tree};
 r.index={...seed.tree};
 r.remotes={origin:{url,branches:{main:seed.tip},objects:Object.fromEntries(seed.commits.map(c=>[c.id,structuredClone(c)]))}};
 r.remoteRefs={'origin/main':seed.tip};
 r.upstream={main:{remote:'origin',branch:'main'}};
 r.reflog=[{id:seed.tip,text:'clone: from '+url}];
 return [`Cloning into '${url.split('/').filter(Boolean).pop()?.replace(/\.git$/,'')||'project'}'...`,'remote: Enumerating objects: 2, done.','Receiving objects: 100% (2/2), done.','Checking out files: 100% (2/2), done.'];
}
function cmdClean(r,args,cmd){
 const dry=args.includes('-n')||args.includes('--dry-run');
 const force=args.includes('-f')||args.includes('--force');
 if(!dry&&!force)return refuse(r,cmd,'fatal: clean.requireForce defaults to true and neither -i, -n, nor -f given; refusing to clean',
  ['git clean deletes files that Git is not tracking, so it asks for -n or -f first.','git clean 会删除未被跟踪的文件，所以需要先给出 -n 或 -f。','git clean 會刪除未被追蹤的檔案，所以需要先給出 -n 或 -f。'],
  ['Run git clean -n to preview, then git clean -f to delete.','先用 git clean -n 预览，再用 git clean -f 删除。','先用 git clean -n 預覽，再用 git clean -f 刪除。']);
 const untracked=untrackedFiles(r);
 for(const p of untracked)if(!dry)delete r.files[p];
 return untracked.map(p=>dry?`Would remove ${p}`:`Removing ${p}`);
}
function cmdReflog(r){
 return [...r.reflog].reverse().map((entry,i)=>{
  const text=typeof entry==='string'?entry:entry.text;
  const id=typeof entry==='string'?headId(r):entry.id;
  return `${short(id||'0000000')} HEAD@{${i}}: ${text}`;
 });
}
function cmdHelp(r,args){
 const name=args.find(a=>!a.startsWith('-'));
 if(name&&GIT_USAGE[name])return [`usage: ${GIT_USAGE[name]}`,'',`${name} runs for real in this teaching repository.`];
 if(name)return [`No manual entry for ${name}`];
 return [
  'usage: git <command> [<args>]',
  '',
  'These commands run in this teaching repository:',
  '',
  ...GIT_COMMANDS.map(c=>`   ${GIT_USAGE[c]}`),
  '',
  'Real Git has many more commands. This sandbox keeps the everyday workflow and refuses anything else instead of pretending.'
 ];
}

const HANDLERS={
 init:r=>cmdInit(r),
 clone:cmdClone,
 config:cmdConfig,
 status:(r,args)=>cmdStatus(r,args),
 add:cmdAdd,
 rm:cmdRm,
 mv:cmdMv,
 restore:cmdRestore,
 reset:cmdReset,
 commit:cmdCommit,
 log:(r,args)=>cmdLog(r,args),
 diff:cmdDiff,
 show:cmdShow,
 branch:cmdBranch,
 switch:cmdSwitch,
 checkout:cmdSwitch,
 merge:cmdMerge,
 rebase:cmdRebase,
 'cherry-pick':cmdCherryPick,
 revert:cmdRevert,
 tag:cmdTag,
 stash:cmdStash,
 remote:cmdRemote,
 fetch:cmdFetch,
 pull:cmdPull,
 push:cmdPush,
 clean:cmdClean,
 reflog:r=>cmdReflog(r),
 help:(r,args)=>cmdHelp(r,args),
 version:()=>['git version 2.43.0 (Forma teaching sandbox)']
};
function editDistance(a,b){
 const rows=[...Array(a.length+1)].map((_,i)=>[i,...Array(b.length).fill(0)]);
 for(let j=0;j<=b.length;j++)rows[0][j]=j;
 for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)rows[i][j]=Math.min(rows[i-1][j]+1,rows[i][j-1]+1,rows[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
 return rows[a.length][b.length];
}
function closestCommand(name){
 let best=null,score=99;
 for(const c of GIT_COMMANDS){const d=editDistance(name,c);if(d<score){score=d;best=c;}}
 return score<=3?best:null;
}
/**
 * Runs one command line against a copy of the repository.
 * Returns the new repository, the lines to print, and — when the learner made a
 * mistake — the recorded explanation that the review panel shows afterwards.
 * @param {ReturnType<typeof createRepo>} repo
 * @param {string} input
 */
export function runGit(repo,input){
 const next=structuredClone(repo);
 const base=createRepo();
 next.transcript??=[];
 next.mistakes??=[];
 next.stats??={...base.stats};
 for(const key of Object.keys(base.stats))next.stats[key]??=0;
 const raw=String(input??'').trim().replace(/^git\s+/,'');
 const command='git '+raw;
 const argv=tokenize(raw);
 const name=(argv[0]||'').toLowerCase();
 const before=next.mistakes.length;
 const taskBefore=currentTaskId(next);
 let lines;
 if(!raw)lines=refuse(next,command,'usage: git <command> [<args>]',
  ['A Git command needs a subcommand.','Git 命令需要子命令。','Git 指令需要子指令。'],
  ['Try git status, or git help for the full list.','试试 git status，或用 git help 查看全部命令。','試試 git status，或用 git help 查看全部指令。']);
 else if(name==='--help'||name==='-h')lines=cmdHelp(next,[]);
 else if(!next.initialised&&!['init','clone','help','version','config'].includes(name))lines=refuse(next,command,'fatal: not a git repository (or any of the parent directories): .git',
  ['There is no repository here yet, so Git has nothing to work on.','这里还没有仓库，Git 没有可操作的内容。','這裡還沒有倉庫，Git 沒有可操作的內容。'],
  ['Run git init, or git clone <url> to start from a shared project.','先运行 git init，或用 git clone <url> 从共享项目开始。','先執行 git init，或用 git clone <url> 從共享專案開始。']);
 else if(!Object.hasOwn(HANDLERS,name)){
  const guess=closestCommand(name);
  lines=refuse(next,command,`git: '${name}' is not a git command. See 'git help'.${guess?`\nDid you mean '${guess}'?`:''}`,
   ['This sandbox runs the commands listed by git help, and nothing else.','这个沙盒只运行 git help 列出的命令。','這個沙盒只執行 git help 列出的指令。'],
   guess
    ?[`Try git ${guess}, or run git help for the full list.`,'试试 git '+guess+'，或用 git help 查看全部命令。','試試 git '+guess+'，或用 git help 查看全部指令。']
    :['Run git help for the full list.','运行 git help 查看全部命令。','執行 git help 查看全部指令。']);
 }else lines=HANDLERS[name](next,argv.slice(1),command);
 if(!Array.isArray(lines))lines=[];
 next.stats.commands++;
 next.transcript.push('$ '+command,...lines,'');
 // Keep the stored state small: the terminal shows the recent session and the
 // review keeps the most recent mistakes.
 if(next.transcript.length>600)next.transcript=next.transcript.slice(-600);
 if(next.mistakes.length>60)next.mistakes=next.mistakes.slice(-60);
 if(next.mistakes.length>before)next.mistakes.at(-1).task=taskBefore;
 syncTasks(next);
 return {repo:next,output:lines,mistake:next.mistakes.length>before?next.mistakes.at(-1):null};
}
/**
 * The goals a learner works through. Four of them are required before the lab
 * counts as practised; the rest are there to explore.
 * @param {ReturnType<typeof createRepo>} repo
 */
export function gitMilestones(repo){
 const s={...createRepo().stats,...(repo.stats??{})};
 return [
  {id:'repository',core:false,done:repo.initialised,label:['Create a repository','创建仓库','建立倉庫']},
  {id:'commit',core:true,done:(s.commits??0)>0,label:['Make a commit','完成一次提交','完成一次提交']},
  {id:'branch',core:true,done:Object.keys(repo.branches).length>1,label:['Create a branch','创建分支','建立分支']},
  {id:'switch',core:true,done:(s.switches??0)>0,label:['Switch branches','切换分支','切換分支']},
  {id:'merge',core:true,done:(s.merges??0)>0,label:['Merge a branch back','把分支合并回来','把分支合併回來']},
  {id:'conflict',core:false,done:(s.resolves??0)>0,label:['Resolve a conflict','解决一次冲突','解決一次衝突']},
  {id:'stash',core:false,done:(s.stashes??0)>0,label:['Set work aside with git stash','用 git stash 暂存工作','用 git stash 暫存工作']},
  {id:'remote',core:false,done:Object.keys(repo.remotes).length>0,label:['Connect a remote','连接远程仓库','連接遠端倉庫']},
  {id:'push',core:false,done:(s.pushes??0)>0,label:['Push to the remote','推送到远程','推送到遠端']},
  {id:'fetch',core:false,done:(s.fetches??0)>0||(s.pulls??0)>0,label:['Fetch or pull changes','获取远程改动','取得遠端改動']},
  {id:'undo',core:false,done:repo.commits.some(c=>/^Revert /.test(c.message)),label:['Undo a commit safely','安全撤销一次提交','安全撤銷一次提交']}
 ];
}
/** True once every required goal has been met. */
export const gitComplete=repo=>gitMilestones(repo).filter(m=>m.core).every(m=>m.done);
/** True when `id` is reachable from the tip of `branch` (or a commit). */
function onBranch(r,branch,id){
 const tip=Object.hasOwn(r.branches,branch)?r.branches[branch]:branch;
 return !!tip&&reachable(r,[tip]).has(id);
}
/** Builds the situation a scenario describes, so the learner sees how it arose. */
function build(setup){
 let repo=createRepo();
 for(const step of setup)repo=typeof step==='function'?step(repo):runGit(repo,step).repo;
 return repo;
}
/** A commit a teammate made on the remote, as if they pushed before you did. */
function teammateCommit(r,remoteName,message,files){
 const remote=r.remotes[remoteName];
 const branch=Object.keys(remote.branches)[0]??'main';
 const tip=remote.branches[branch]??null;
 const tree={...remote.objects[tip]?.tree,...files};
 const commit={id:hashOf(['teammate',message,same(tree),Object.keys(remote.objects).length].join('|')),message,parents:tip?[tip]:[],tree,branch,at:50+Object.keys(remote.objects).length};
 remote.objects[commit.id]=commit;
 remote.branches[branch]=commit.id;
 return r;
}
const APP_ORIGINAL='export function validateSignup(form) {\n  return form.name.trim().length > 0;\n}';
const APP_STRICT='export function validateSignup(form) {\n  return form.name.trim().length > 2;\n}';
const APP_LOOSE='export function validateSignup(form) {\n  return form.name.trim() !== "";\n}';
/** The urgent README line is committed on main. */
const hotfixShipped=r=>onBranch(r,'main',r.commits.find(c=>String(c.tree['README.md']||'').includes('Urgent'))?.id??'');

/**
 * Situations that really happen on a team. Each one starts a repository in the
 * middle of the problem, states the outcome that counts as fixed, and keeps a
 * reference solution for after the learner has solved it.
 */
/**
 * Small single-command practices. Each one sets up a tiny repository state and
 * asks for one command, so a beginner can practise one thing at a time instead
 * of facing a whole workflow at once.
 */
const drill=(id,title,brief,setup,label,hint,done,solution)=>({
 id,kind:'drill',title,brief,setup,solution,tasks:[{id:'do',label,hint,done}]
});
/** A repository with one commit, used as the starting point for most drills. */
/** @type {any[]} */
const SEEDED=['git init','git add .','git commit -m "Initial version"'];
const SEED_NOTES='Review checklist:\n- keep commits small\n- run the checks';

export const GIT_DRILLS=[
 drill('read-status',['Read the state of the project','查看项目状态','查看專案狀態'],['One file has been edited since the last commit. Find out what Git thinks before you change anything.','提交之后有一个文件被改动了。先看清 Git 怎么看，再决定做什么。','提交之後有一個檔案被改動了。先看清 Git 怎麼看，再決定做什麼。'],SEEDED.concat([r=>writeFile(r,'notes.txt',SEED_NOTES)]),
  ['Run git status and read it','运行 git status 并阅读输出','執行 git status 並閱讀輸出'],['git status','git status','git status'],r=>r.transcript.some(line=>line==='$ git status'),
  ['git status']),
 drill('stage-one-file',['Stage one file','暂存一个文件','暫存一個檔案'],['Two files changed, but only the checklist belongs in the next commit. Stage that one file.','两个文件有改动，但只有清单属于这次提交。只暂存那一个文件。','兩個檔案有改動，但只有清單屬於這次提交。只暫存那一個檔案。'],SEEDED.concat([r=>writeFile(r,'notes.txt',SEED_NOTES),r=>writeFile(r,'README.md','# Team project\nChanged by mistake')]),
  ['Stage only notes.txt','只暂存 notes.txt','只暫存 notes.txt'],r=>{const head=treeOf(r,r.branches.main);return r.index['README.md']!==head['README.md']?['git restore --staged README.md','git restore --staged README.md','git restore --staged README.md']:['git add notes.txt','git add notes.txt','git add notes.txt'];},r=>{const head=treeOf(r,r.branches.main);return r.index['notes.txt']!==head['notes.txt']&&r.index['README.md']===head['README.md'];},
  ['git add notes.txt','git status --short']),
 drill('commit-staged',['Commit what is staged','提交已暂存的内容','提交已暫存的內容'],['The checklist change is already staged. Record it with a message that says what changed.','清单的改动已经暂存。用一句说明“改了什么”的提交信息记录下来。','清單的改動已經暫存。用一句說明「改了什麼」的提交訊息記錄下來。'],SEEDED.concat([r=>writeFile(r,'notes.txt',SEED_NOTES),'git add notes.txt']),
  ['Commit it with a message','用说明提交','用說明提交'],['git commit -m "Ask for a failing test first"','git commit -m "Ask for a failing test first"','git commit -m "Ask for a failing test first"'],r=>(r.stats.commits??0)>0&&/checks/.test(String(commitOf(r,r.branches.main)?.tree['notes.txt']||'')),
  ['git commit -m "Ask for a failing test first"']),
 drill('create-branch',['Create a branch and move to it','创建分支并切换过去','建立分支並切換過去'],['Start work that can be reviewed on its own. Create feature/form and switch to it.','开始一段可以单独审查的工作：创建 feature/form 并切换过去。','開始一段可以單獨審查的工作：建立 feature/form 並切換過去。'],SEEDED,
  ['Create and switch in one command','用一条命令创建并切换','用一條指令建立並切換'],r=>Object.hasOwn(r.branches,'feature/form')?['git switch feature/form','git switch feature/form','git switch feature/form']:['git switch -c feature/form','git switch -c feature/form','git switch -c feature/form'],r=>r.head.name==='feature/form',
  ['git switch -c feature/form']),
 drill('switch-back',['Switch back to main','切换回 main','切換回 main'],['You are on feature/form. Move back to main before you change anything else.','你目前在 feature/form。在继续改动之前，先切回 main。','你目前在 feature/form。在繼續改動之前，先切回 main。'],SEEDED.concat(['git switch -c feature/form']),
  ['Switch to main','切换到 main','切換到 main'],['git switch main','git switch main','git switch main'],r=>r.head.name==='main',
  ['git switch main']),
 drill('read-diff',['See what changed','查看改了什么','查看改了什麼'],['A file changed but you have not staged it. Read the diff to decide whether it belongs in a commit.','有个文件改了但还没暂存。先看差异，再决定是否提交。','有個檔案改了但還沒暫存。先看差異，再決定是否提交。'],SEEDED.concat([r=>writeFile(r,'src/app.js','export function validateSignup(form) {\n  return form.name.trim().length > 2;\n}')]),
  ['Show the unstaged change','显示未暂存的改动','顯示未暫存的改動'],['git diff','git diff','git diff'],r=>r.transcript.some(line=>line==='$ git diff'),
  ['git diff']),
 drill('read-log',['Read the history','阅读提交历史','閱讀提交歷史'],['Before you undo anything, look at the history and copy the commit ids you need.','在撤销任何东西之前，先看历史并复制需要的提交号。','在撤銷任何東西之前，先看歷史並複製需要的提交號。'],SEEDED.concat([r=>writeFile(r,'notes.txt',SEED_NOTES),'git add .','git commit -m "Add a checks reminder"']),
  ['Show the history, one line each','每行显示一条历史','每行顯示一條歷史'],['git log --oneline','git log --oneline','git log --oneline'],r=>r.transcript.some(line=>line==='$ git log --oneline'),
  ['git log --oneline']),
 drill('unstage-file',['Unstage a file','取消暂存一个文件','取消暫存一個檔案'],['notes.txt was staged by mistake. Take it out of the index but keep the edit in your working tree.','notes.txt 被误暂存了。把它从暂存区取出，但保留工作区里的改动。','notes.txt 被誤暫存了。把它從暫存區取出，但保留工作區裡的改動。'],SEEDED.concat([r=>writeFile(r,'notes.txt',SEED_NOTES),'git add notes.txt']),
  ['Unstage it and keep the edit','取消暂存并保留改动','取消暫存並保留改動'],['git restore --staged notes.txt','git restore --staged notes.txt','git restore --staged notes.txt'],r=>{const head=treeOf(r,r.branches.main);return r.index['notes.txt']===head['notes.txt']&&String(r.files['notes.txt']||'').includes('run the checks');},
  ['git restore --staged notes.txt','git status --short']),
 drill('discard-edit',['Throw away an edit','丢弃一次改动','丟棄一次改動'],['The edit to src/app.js was a mistake. Put the file back exactly as the last commit has it.','对 src/app.js 的改动是错的。把文件恢复成上一次提交的样子。','對 src/app.js 的改動是錯的。把檔案還原成上一次提交的樣子。'],SEEDED.concat([r=>writeFile(r,'src/app.js','export function validateSignup(form) {\n  return true;\n}')]),
  ['Discard the working-tree change','丢弃工作区改动','丟棄工作區改動'],r=>{const head=treeOf(r,r.branches.main);return r.index['src/app.js']!==head['src/app.js']?['git restore --staged --worktree src/app.js','git restore --staged --worktree src/app.js','git restore --staged --worktree src/app.js']:['git restore src/app.js','git restore src/app.js','git restore src/app.js'];},r=>r.files['src/app.js']===GIT_SEED_FILES['src/app.js'],
  ['git restore src/app.js']),
 drill('stash-work',['Set work aside','把工作暂存起来','把工作暫存起來'],['You must leave this branch with an unfinished edit. Put the work aside so the branch is clean.','你要带着未完成的改动离开这个分支。先把工作暂存，让分支干净。','你要帶著未完成的改動離開這個分支。先把工作暫存，讓分支乾淨。'],SEEDED.concat([r=>writeFile(r,'notes.txt','Review checklist:\n- half-finished thought')]),
  ['Set the work aside','把工作暂存','把工作暫存'],['git stash','git stash','git stash'],r=>(r.stats.stashes??0)>0&&!workChanges(r).modified.length,
  ['git stash']),
 drill('restore-stash',['Bring stashed work back','取回暂存的工作','取回暫存的工作'],['Your unfinished edit is in the stash. Bring it back into the working tree.','未完成的改动还在 stash 里。把它取回工作区。','未完成的改動還在 stash 裡。把它取回工作區。'],SEEDED.concat([r=>writeFile(r,'notes.txt','Review checklist:\n- half-finished thought'),'git stash']),
  ['Bring it back','取回它','取回它'],['git stash pop','git stash pop','git stash pop'],r=>String(r.files['notes.txt']||'').includes('half-finished thought'),
  ['git stash pop']),
 drill('tag-release',['Tag a release','为发布打标签','為發布打標籤'],['The commit you are on is the one you shipped. Mark it with the tag v1.0.','当前提交就是你发布的版本。用 v1.0 这个标签标记它。','目前提交就是你發布的版本。用 v1.0 這個標籤標記它。'],SEEDED,
  ['Tag the current commit','给当前提交打标签','給目前提交打標籤'],['git tag v1.0','git tag v1.0','git tag v1.0'],r=>r.tags['v1.0']===r.branches.main,
  ['git tag v1.0','git tag']),
 drill('delete-branch',['Delete a finished branch','删除已完成的分支','刪除已完成的分支'],['feature/old is merged into main and no longer needed. Delete it without losing history.','feature/old 已合并进 main，不再需要。删除它，但不要丢失历史。','feature/old 已合併進 main，不再需要。刪除它，但不要遺失歷史。'],SEEDED.concat(['git branch feature/old']),
  ['Delete the merged branch','删除已合并的分支','刪除已合併的分支'],['git branch -d feature/old','git branch -d feature/old','git branch -d feature/old'],r=>!Object.hasOwn(r.branches,'feature/old')&&r.head.name==='main',
  ['git branch -d feature/old']),
 drill('amend-message',['Fix the last commit message','修改最后一次提交说明','修改最後一次提交說明'],['The last message says nothing useful. Replace it before anyone reviews it.','最后一条提交说明没有信息量。在别人审查之前把它改掉。','最後一條提交說明沒有資訊量。在別人審查之前把它改掉。'],SEEDED.concat([r=>writeFile(r,'notes.txt',SEED_NOTES),'git add .','git commit -m "stuff"']),
  ['Rewrite the message of the last commit','重写最后一次提交说明','重寫最後一次提交說明'],['git commit --amend -m "Ask for a failing test first"','git commit --amend -m "Ask for a failing test first"','git commit --amend -m "Ask for a failing test first"'],r=>/checks/.test(String(commitOf(r,r.branches.main)?.tree['notes.txt']||''))&&/failing test/.test(String(commitOf(r,r.branches.main)?.message||'')),
  ['git commit --amend -m "Ask for a failing test first"']),
 drill('undo-commit-keep-work',['Undo a commit but keep the work','撤销提交但保留改动','撤銷提交但保留改動'],['The last commit was made too early. Move the branch back but keep the changes so you can commit them again later. A reset --hard would lose the work, and then the practice has to be started again.','最后一次提交太早了。把分支移回去，但保留改动，方便以后再提交。如果用了 reset --hard，改动会丢失，只能重新开始这个练习。','最後一次提交太早了。把分支移回去，但保留改動，方便以後再提交。如果用了 reset --hard，改動會遺失，只能重新開始這個練習。'],SEEDED.concat([r=>writeFile(r,'notes.txt',SEED_NOTES),'git add .','git commit -m "Too early"']),
  ['Undo the commit, keep the changes','撤销提交，保留改动','撤銷提交，保留改動'],['git reset --soft HEAD~1','git reset --soft HEAD~1','git reset --soft HEAD~1'],r=>r.branches.main===r.commits[0].id&&stagedCount(r)>0,
  ['git reset --soft HEAD~1','git status']),
 drill('connect-remote',['Connect a remote','连接远程仓库','連接遠端倉庫'],['There is nowhere to push yet. Point the name origin at the team repository.','现在还没有可推送的目标。把 origin 指向团队仓库。','現在還沒有可推送的目標。把 origin 指向團隊倉庫。'],SEEDED,
  ['Add the origin remote','添加 origin 远程','加入 origin 遠端'],['git remote add origin https://example.edu/team/project.git','git remote add origin https://example.edu/team/project.git','git remote add origin https://example.edu/team/project.git'],r=>Object.hasOwn(r.remotes,'origin'),
  ['git remote add origin https://example.edu/team/project.git','git remote -v']),
 drill('publish-work',['Publish your work','发布你的工作','發布你的工作'],['You cloned the team project and committed a local note. Send it to the remote.','你克隆了团队项目并提交了一条本地笔记。把它送到远程。','你複製了團隊專案並提交了一條本機筆記。把它送到遠端。'],['git clone https://example.edu/team/project.git',r=>writeFile(r,'README.md',r.files['README.md']+'\nReviewed on the team branch.'),'git add .','git commit -m "Add a local note"'],
  ['Push the branch','推送分支','推送分支'],['git push origin main','git push origin main','git push origin main'],r=>(r.stats.pushes??0)>0&&r.remotes.origin.branches.main===r.branches.main,
  ['git push origin main']),
 drill('get-teammate-work',['Get a teammate change','获取同事的改动','取得同事的改動'],['A teammate pushed a commit you do not have. Bring it into your branch.','同事推送了一个你还没有的提交。把它取到你的分支上。','同事推送了一個你還沒有的提交。把它取到你的分支上。'],['git clone https://example.edu/team/project.git',r=>teammateCommit(r,'origin','Add the sign-up form',{'src/signup.js':'export const fields = ["name", "email"];'})],
  ['Pull their change','拉取他们的改动','拉取他們的改動'],['git pull origin main','git pull origin main','git pull origin main'],r=>{const teammate=r.commits.find(c=>c.message==='Add the sign-up form');return !!teammate&&reachable(r,[r.branches.main]).has(teammate.id);},
  ['git pull origin main','git log --oneline']),
 drill('undo-shared-commit',['Undo a shared commit safely','安全撤销已共享的提交','安全撤銷已共享的提交'],['The last commit removed a check and others already have it. Undo the change without deleting the commit. A reset --hard would delete it, and then the practice has to be started again.','最后一次提交去掉了校验，别人也已经拉取过。请在不删除该提交的前提下撤销改动。如果用了 reset --hard，提交会被删除，只能重新开始这个练习。','最後一次提交去掉了校驗，別人也已經拉取過。請在不刪除該提交的前提下撤銷改動。如果用了 reset --hard，提交會被刪除，只能重新開始這個練習。'],SEEDED.concat([r=>writeFile(r,'src/app.js','export function validateSignup() {\n  return true;\n}'),'git add .','git commit -m "Skip the name check"']),
  ['Revert the last commit','还原最后一次提交','還原最後一次提交'],['git revert HEAD','git revert HEAD','git revert HEAD'],r=>r.files['src/app.js']===GIT_SEED_FILES['src/app.js']&&r.commits.length===3,
  ['git revert HEAD','git log --oneline']),
 drill('copy-commit',['Copy a commit to another branch','把提交复制到另一个分支','把提交複製到另一個分支'],['The fix on feature/form is needed on main too, but main must keep its own history. Copy just that one commit.','feature/form 上的修复在 main 上也需要，但 main 必须保留自己的历史。只复制那一个提交。','feature/form 上的修復在 main 上也需要，但 main 必須保留自己的歷史。只複製那一個提交。'],SEEDED.concat(['git switch -c feature/form',r=>writeFile(r,'src/app.js','export function validateSignup(form) {\n  return form.name.trim().length > 2;\n}'),'git add .','git commit -m "Require three characters"','git switch main']),
  ['Copy the feature commit onto main','把功能提交复制到 main','把功能提交複製到 main'],['git cherry-pick <commit id>','git cherry-pick <commit id>','git cherry-pick <commit id>'],r=>r.head.name==='main'&&String(r.files['src/app.js']||'').includes('length > 2'),
  ['git log --oneline','git cherry-pick <id of "Require three characters">']),
 drill('preview-clean',['Preview untracked files','预览未跟踪文件','預覽未追蹤檔案'],['Before deleting anything, ask Git which files it is not tracking.','在删除任何东西之前，先让 Git 告诉你哪些文件没有被跟踪。','在刪除任何東西之前，先讓 Git 告訴你哪些檔案沒有被追蹤。'],SEEDED.concat([r=>writeFile(r,'scratch.txt','notes I may not need')]),
  ['Preview what clean would remove','预览 clean 会删除什么','預覽 clean 會刪除什麼'],r=>'scratch.txt' in r.files?['git clean -n','git clean -n','git clean -n']:['create scratch.txt again in the file editor','在文件编辑器里重新创建 scratch.txt','在檔案編輯器裡重新建立 scratch.txt'],r=>r.transcript.some(line=>line==='$ git clean -n')&&'scratch.txt' in r.files,
  ['git clean -n'])
];

export const GIT_SITUATIONS=[
 {
  id:'divergent',
  title:['Two branches changed the same line','两个分支改了同一行','兩個分支改了同一行'],
  brief:['You and a teammate both fixed the sign-up validation, on different branches. Merge the branches and keep the rule you decide is right.','你和同事都在各自分支上修改了报名校验。请合并两个分支，并保留你认为正确的规则。','你和同事都在各自分支上修改了報名校驗。請合併兩個分支，並保留你認為正確的規則。'],
  setup:['git init','git add .','git commit -m "Add the sign-up form"','git switch -c feature/validation',
   r=>writeFile(r,'src/app.js',APP_STRICT),'git add .','git commit -m "Require three characters"','git switch main',
   r=>writeFile(r,'src/app.js',APP_LOOSE),'git add .','git commit -m "Reject blank names only"'],
  solution:['git merge feature/validation','# edit src/app.js and keep the rule you chose','git add src/app.js','git commit -m "Merge the validation rules"'],
  tasks:[
   {id:'merge',label:['Start the merge and look at the conflict','开始合并并查看冲突','開始合併並查看衝突'],hint:['git merge feature/validation','git merge feature/validation','git merge feature/validation'],done:r=>r.conflict!==null||r.commits.some(c=>c.parents.length>1)},
   {id:'edit',label:['Edit src/app.js and delete the <<<<<<<, ======= and >>>>>>> lines','编辑 src/app.js，删掉 <<<<<<<、======= 和 >>>>>>> 这些行','編輯 src/app.js，刪掉 <<<<<<<、======= 和 >>>>>>> 這些行'],hint:['open src/app.js in the file editor below and press Save file','在下面的文件编辑器里打开 src/app.js，然后按“保存文件”','在下面的檔案編輯器裡開啟 src/app.js，然後按「儲存檔案」'],done:r=>!Object.values(r.files).some(v=>String(v).includes('<<<<<<<'))},
   {id:'stage',label:['Stage the resolved file','暂存已解决的文件','暫存已解決的檔案'],hint:['git add src/app.js','git add src/app.js','git add src/app.js'],done:r=>!(r.conflict?.paths?.length)},
   {id:'commit',label:['Commit the merge','提交这次合并','提交這次合併'],hint:['git commit -m "Merge the validation rules"','git commit -m "Merge the validation rules"','git commit -m "Merge the validation rules"'],done:r=>r.commits.some(c=>c.parents.length>1)&&!!r.branches.main&&!!r.branches['feature/validation']&&isAncestor(r,r.branches['feature/validation'],r.branches.main)}
  ]
 },
 {
  id:'teammate-pushed',
  title:['A teammate pushed first','同事先推送了','同事先推送了'],
  brief:['You cloned the team project and made a local note. While you were working, a teammate pushed a change to the same branch. Publish your work without erasing theirs.','你克隆了团队项目并在本地做了笔记。你工作期间，同事向同一分支推送了改动。请在不清除同事工作的前提下发布你的改动。','你複製了團隊專案並在本機做了筆記。你工作期間，同事向同一分支推送了改動。請在不清除同事工作的前提下發布你的改動。'],
  setup:['git clone https://example.edu/team/project.git',
   r=>teammateCommit(r,'origin','Add the sign-up form',{'src/signup.js':'export const fields = ["name", "email"];'}),
   r=>writeFile(r,'README.md',r.files['README.md']+'\nReviewed on the team branch.')],
  solution:['git add .','git commit -m "Add a local note"','git pull origin main','git push origin main'],
  tasks:[
   {id:'stage',label:['Stage your note','暂存你的笔记','暫存你的筆記'],hint:['git add .','git add .','git add .'],done:r=>stagedCount(r)>0},
   {id:'commit',label:['Commit your note','提交你的笔记','提交你的筆記'],hint:['git commit -m "Add a local note"','git commit -m "Add a local note"','git commit -m "Add a local note"'],done:r=>r.commits.some(c=>c.message==='Add a local note')},
   {id:'pull',label:['Pull the teammate change','拉取同事的改动','拉取同事的改動'],hint:['git pull origin main','git pull origin main','git pull origin main'],done:r=>r.commits.some(c=>c.message==='Add the sign-up form')},
   {id:'push',label:['Push your work','推送你的工作','推送你的工作'],hint:['git push origin main','git push origin main','git push origin main'],done:r=>(r.stats.pushes??0)>0}
  ]
 },
 {
  id:'conflict-and-push',
  title:['A teammate changed the file you are editing','同事改了你正在编辑的文件','同事改了你正在編輯的檔案'],
  brief:['You are improving the sign-up check locally, and a teammate already pushed a different version of the same file. Integrate their work, resolve the conflict and publish the result.','你正在本地改进报名校验，而同事已经推送了同一文件的另一个版本。请整合他们的工作、解决冲突并发布结果。','你正在本機改進報名校驗，而同事已經推送了同一檔案的另一個版本。請整合他們的工作、解決衝突並發布結果。'],
  setup:['git clone https://example.edu/team/project.git',
   r=>teammateCommit(r,'origin','Require three characters',{'src/app.js':APP_STRICT}),
   r=>writeFile(r,'src/app.js',APP_LOOSE)],
  solution:['git add .','git commit -m "Reject blank names only"','git pull origin main','# edit src/app.js and keep the rule you chose','git add src/app.js','git commit -m "Merge the teammate change"','git push origin main'],
  tasks:[
   {id:'stage',label:['Stage your version','暂存你的版本','暫存你的版本'],hint:['git add .','git add .','git add .'],done:r=>stagedCount(r)>0},
   {id:'commit',label:['Commit your version','提交你自己的版本','提交你自己的版本'],hint:['git commit -m "Reject blank names only"','git commit -m "Reject blank names only"','git commit -m "Reject blank names only"'],done:r=>r.commits.some(c=>c.message==='Reject blank names only')},
   {id:'pull',label:['Pull the teammate version','拉取同事的版本','拉取同事的版本'],hint:['git pull origin main','git pull origin main','git pull origin main'],done:r=>r.commits.some(c=>c.message==='Require three characters')},
   {id:'edit',label:['Edit src/app.js and delete the conflict markers','编辑 src/app.js，删掉冲突标记','編輯 src/app.js，刪掉衝突標記'],hint:['open src/app.js in the file editor below and press Save file','在下面的文件编辑器里打开 src/app.js，然后按“保存文件”','在下面的檔案編輯器裡開啟 src/app.js，然後按「儲存檔案」'],done:r=>!Object.values(r.files).some(v=>String(v).includes('<<<<<<<'))},
   {id:'stage-merge',label:['Stage the resolved file','暂存已解决的文件','暫存已解決的檔案'],hint:['git add src/app.js','git add src/app.js','git add src/app.js'],done:r=>(r.conflict?.paths?.length??0)===0},
   {id:'merge',label:['Commit the merge','提交这次合并','提交這次合併'],hint:['git commit -m "Merge the teammate change"','git commit -m "Merge the teammate change"','git commit -m "Merge the teammate change"'],done:r=>r.commits.some(c=>c.parents.length>1)},
   {id:'push',label:['Push the finished version','推送完成的版本','推送完成的版本'],hint:['git push origin main','git push origin main','git push origin main'],done:r=>(r.stats.pushes??0)>0}
  ]
 },
 {
  id:'stash-hotfix',
  title:['Urgent fix while your work is unfinished','工作没做完就来紧急修复','工作沒做完就來緊急修復'],
  brief:['Production is broken and the fix belongs on main, but you have unfinished edits on feature/form. Put your work aside, ship the hotfix, then bring your work back.','生产环境出故障，修复要放在 main 上，而你在 feature/form 上有未完成的改动。请先暂存工作、发布热修复，再把工作取回。','正式環境出故障，修復要放在 main 上，而你在 feature/form 上有未完成的改動。請先暫存工作、發布熱修復，再把工作取回。'],
  setup:['git init','git add .','git commit -m "Initial version"','git switch -c feature/form',
   r=>writeFile(r,'notes.txt','Review checklist:\n- half-finished thought')],
  solution:['git stash','git switch main','# edit README.md and add the line "Urgent: sign-up is broken"','git add README.md','git commit -m "Urgent: note the sign-up outage"','git switch feature/form','git stash pop'],
  tasks:[
   {id:'stash',label:['Set your unfinished work aside','先把未完成的工作放到一边','先把未完成的工作放到一邊'],hint:['git stash','git stash','git stash'],done:r=>(r.stats.stashes??0)>0},
   {id:'main',label:['Switch to main','切换到 main','切換到 main'],hint:['git switch main','git switch main','git switch main'],done:r=>r.head.name==='main'},
   {id:'edit',label:['Edit README.md and add the urgent line','编辑 README.md，加上紧急说明','編輯 README.md，加上緊急說明'],hint:['open README.md in the file editor below, add a line with Urgent and press Save file','在下面的文件编辑器里打开 README.md，加上含 Urgent 的一行，然后按“保存文件”','在下面的檔案編輯器裡開啟 README.md，加上含 Urgent 的一行，然後按「儲存檔案」'],done:r=>String(r.files['README.md']||'').includes('Urgent')},
   {id:'stage',label:['Stage README.md','暂存 README.md','暫存 README.md'],hint:['git add README.md','git add README.md','git add README.md'],done:r=>stagedCount(r)>0},
   {id:'hotfix',label:['Commit the hotfix','提交热修复','提交熱修復'],hint:['git commit -m "Urgent: note the sign-up outage"','git commit -m "Urgent: note the sign-up outage"','git commit -m "Urgent: note the sign-up outage"'],done:hotfixShipped},
   {id:'branch',label:['Switch back to your feature branch','回到你的功能分支','回到你的功能分支'],hint:['git switch feature/form','git switch feature/form','git switch feature/form'],done:r=>r.head.name==='feature/form'},
   {id:'restore',label:['Bring your unfinished work back','把未完成的工作取回','把未完成的工作取回'],hint:['git stash pop','git stash pop','git stash pop'],done:r=>String(r.files['notes.txt']||'').includes('half-finished thought')}
  ]
 },
 {
  id:'revert-bad',
  title:['A bad commit is already shared','错误提交已经共享','錯誤提交已經共享'],
  brief:['The last commit removed the sign-up check and other people already have it, so rewriting history is not allowed. Undo the change without deleting the commit. A reset --hard would delete it, and then the situation would have to be started again.','最后一次提交去掉了报名校验，而且别人已经拉取过，所以不能改写历史。请在不删除该提交的前提下撤销改动。如果用了 reset --hard，提交会被删除，只能重新开始这个场景。','最後一次提交去掉了報名校驗，而且別人已經拉取過，所以不能改寫歷史。請在不刪除該提交的前提下撤銷改動。如果用了 reset --hard，提交會被刪除，只能重新開始這個情境。'],
  setup:['git init','git add .','git commit -m "Initial version"',
   r=>writeFile(r,'src/app.js','export function validateSignup() {\n  return true; // accepts every name\n}'),
   'git add .','git commit -m "Skip the name check"'],
  solution:['git log --oneline','git revert HEAD','git status'],
  tasks:[
   {id:'revert',label:['Undo the change without deleting the commit','在不删除提交的前提下撤销改动','在不刪除提交的前提下撤銷改動'],hint:['git revert HEAD','git revert HEAD','git revert HEAD'],done:r=>r.files['src/app.js']===APP_ORIGINAL},
   {id:'history',label:['Check the bad commit is still in history','确认错误提交仍在历史中','確認錯誤提交仍在歷史中'],hint:['git log --oneline','git log --oneline','git log --oneline'],done:r=>r.files['src/app.js']===APP_ORIGINAL&&r.commits.length>2&&onBranch(r,'main',r.commits.find(c=>c.message==='Skip the name check')?.id??'')}
  ]
 },
 {
  id:'wrong-branch',
  title:['Work committed on main by mistake','误把改动提交到 main','誤把改動提交到 main'],
  brief:['Your formatter commit landed on main, but it needs review on its own branch. Move it to a branch without losing the work. A reset --hard before the branch exists would lose the commit.','你的格式化提交落在了 main 上，但它需要在自己的分支上被审查。请把这次提交移到分支上，且不要丢失工作。如果分支还不存在就用 reset --hard，提交会丢失。','你的格式化提交落在了 main 上，但它需要在自己的分支上被審查。請把這次提交移到分支上，且不要遺失工作。如果分支還不存在就用 reset --hard，提交會遺失。'],
  setup:['git init','git add .','git commit -m "Initial version"',
   r=>writeFile(r,'src/format.js','export const formatName = value => value.trim();'),
   'git add .','git commit -m "Add the name formatter"'],
  solution:['git branch feature/format','git reset --hard HEAD~1','git switch feature/format','git log --oneline'],
  tasks:[
   {id:'branch',label:['Point a new branch at the commit that should not be on main','让新分支指向那个不该在 main 上的提交','讓新分支指向那個不該在 main 上的提交'],hint:['git branch feature/format','git branch feature/format','git branch feature/format'],done:r=>Object.entries(r.branches).some(([name,tip])=>name!=='main'&&tip===r.commits.find(c=>c.message==='Add the name formatter')?.id)},
   {id:'reset',label:['Move main back so it no longer contains that commit','把 main 移回，使它不再包含该提交','把 main 移回，使它不再包含該提交'],hint:['git reset --hard HEAD~1','git reset --hard HEAD~1','git reset --hard HEAD~1'],done:r=>!onBranch(r,'main',r.commits.find(c=>c.message==='Add the name formatter')?.id??'')},
   {id:'switch',label:['Switch to the new branch and carry on there','切换到新分支继续工作','切換到新分支繼續工作'],hint:['git switch feature/format','git switch feature/format','git switch feature/format'],done:r=>!r.head.detached&&r.head.name!=='main'}
  ]
 },
 {
  id:'rebase-review',
  title:['Rebase a feature branch before review','审查前先变基','審查前先變基'],
  brief:['main moved on while your feature branch was open. Reviewers ask for a linear history, so replay your work on top of main.','你的功能分支开放期间 main 前进了。审查者要求线性历史，请把你的工作重放到 main 之上。','你的功能分支開放期間 main 前進了。審查者要求線性歷史，請把你的工作重放到 main 之上。'],
  setup:['git clone https://example.edu/team/project.git','git switch -c feature/form',
   r=>writeFile(r,'docs/form.md','# Form notes\nForm notes for the sign-up review.'),
   'git add .','git commit -m "Document the form"','git switch main',
   r=>writeFile(r,'README.md',r.files['README.md']+'\nReviewed by the team.'),
   'git add .','git commit -m "Note the review"','git switch feature/form'],
  solution:['git rebase main','git log --oneline --graph'],
  tasks:[
   {id:'rebase',label:['Replay your work on top of main','把你的工作重放到 main 之上','把你的工作重放到 main 之上'],hint:['git rebase main','git rebase main','git rebase main'],done:r=>!!r.branches.main&&isAncestor(r,r.branches.main,r.branches['feature/form'])},
   {id:'linear',label:['Keep the history linear, with no merge commit','保持线性历史，没有合并提交','保持線性歷史，沒有合併提交'],hint:['git reset --hard HEAD~1','git reset --hard HEAD~1','git reset --hard HEAD~1'],done:r=>![...reachable(r,[r.branches['feature/form']])].some(id=>commitOf(r,id).parents.length>1)},
   {id:'kept',label:['Keep your documentation commit','保留你的文档提交','保留你的文件提交'],hint:['git show HEAD','git show HEAD','git show HEAD'],done:r=>String(commitOf(r,r.branches['feature/form'])?.tree['docs/form.md']||'').includes('Form notes')},
   {id:'finish',label:['Finish with your work on top of main','最后让工作位于 main 之上','最後讓工作位於 main 之上'],hint:['git rebase main','git rebase main','git rebase main'],done:r=>!!r.branches.main&&isAncestor(r,r.branches.main,r.branches['feature/form'])&&![...reachable(r,[r.branches['feature/form']])].some(id=>commitOf(r,id).parents.length>1)}
  ]
 },
];
/** Everything a learner can practise: the small drills and the situations. */
export const GIT_SCENARIOS=[...GIT_DRILLS,...GIT_SITUATIONS];

/**
 * Starts a scenario: the repository is put into the situation it describes by
 * running the setup commands, so the terminal shows how the problem arose.
 * The counters are reset afterwards so the lab goals count what the learner
 * does, not what the setup did.
 * @param {string} id
 */
export function startScenario(id){
 const scenario=GIT_SCENARIOS.find(s=>s.id===id)??GIT_SCENARIOS[0];
 const repo=build(scenario.setup);
 repo.scenario={id:scenario.id};
 repo.scenarioPick=scenario.id;
 repo.stats={...createRepo().stats};
 return repo;
}
/** @param {string} id */
export const scenarioById=id=>GIT_SCENARIOS.find(s=>s.id===id)??null;
/**
 * Live state of the active scenario's tasks, for the checklist in the view.
 * Tasks are small and ordered: a task only counts once every task before it is
 * done, so the learner works through one step at a time instead of facing the
 * whole situation at once.
 * @param {any} repo
 */
export function scenarioTasks(repo){
 const scenario=scenarioById(repo?.scenario?.id);
 if(!scenario)return [];
 const tasks=[];
 for(const task of scenario.tasks){
  const previous=tasks.at(-1);
  tasks.push({id:task.id,label:task.label,hint:hintFor(task,repo),done:(!previous||previous.done)&&!!(repo?.tasks?.[task.id]||task.done(repo))});
 }
 return tasks;
}
/** True once every task of the active scenario is done. @param {any} repo */
export function scenarioComplete(repo){
 const tasks=scenarioTasks(repo);
 return tasks.length>0&&tasks.every(t=>t.done);
}

