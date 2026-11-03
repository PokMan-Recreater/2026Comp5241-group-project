// Building blocks for Git lessons: a fresh simulated computer, silent setup
// commands, and checks that read the repository state (so any correct
// command, not one exact spelling, completes a task).
import {createWorld,commitOf,treeFiles,isAncestor} from '../git-engine/core.js';
import {run} from '../git-engine/shell.js';
import {findRepo,headCommit,currentBranch,resolveCommit,worktree,isDir,isFile,ignoreRules,isIgnored} from '../git-engine/repo.js';
import {createServer,serverCommit,serverFor} from '../git-engine/server.js';
import {statusOf} from '../git-engine/git.js';
import {textOf} from '../git-engine/util.js';
import {canonicalUrl} from '../git-engine/git-remote.js';

export const t=(en,zh)=>({en,zh});
export const ME={name:'Alice Wang',email:'alice@example.com'};
export const ALEX={name:'Alex Chen',email:'alex.chen@example.com',login:'alex-chen'};
export const JORDAN={name:'Jordan Lee',email:'jordan.lee@example.com',login:'jordan-lee'};
export const SARAH={name:'Sarah Shah',email:'sarah.shah@example.com',login:'sarah-shah'};

/** A fresh computer for one lesson. Setup history is dated in the past so new commits sort after it. */
export function newWorld({identity=true}={}){
 const start=Math.floor(Date.now()/1000)-3*86400;
 const w=createWorld({user:'alice',host:'forma',home:'/home/alice',now:start});
 w.global['pull.rebase']='false';
 if(identity){w.global['user.name']=ME.name;w.global['user.email']=ME.email;}
 return w;
}
/** Setup helpers handed to each lesson's setup(). */
export function setupEnv(world){
 const env={
  world,
  run(...cmds){for(const c of cmds){const r=run(world,c);if(r.code!==0&&!c.includes('|| true'))console.warn('[git-course setup]',c,'\n'+r.lines.join('\n'));world.clock.fixed+=1700;}return env;},
  file(path,text){const abs=path.startsWith('/')?path:path.startsWith('~/')?world.home+path.slice(1):world.cwd+'/'+path;run(world,'true');ensure(world,abs,text);return env;},
  as(who,fn){const g=world.global,old=[g['user.name'],g['user.email']];g['user.name']=who.name;g['user.email']=who.email;fn();g['user.name']=old[0];g['user.email']=old[1];if(old[0]===undefined)delete g['user.name'];if(old[1]===undefined)delete g['user.email'];return env;},
  server(owner,name,opts={}){return createServer(world,{owner,name,...opts});},
  push(server,branch,who,message,files){serverCommit(world,server,branch,{author:who,message,files});world.clock.fixed+=1700;return env;},
  cd(p){world.cwd=p.startsWith('/')?p:world.home+'/'+p.replace(/^~\//,'');return env;},
 };
 return env;
}
function ensure(world,abs,text){
 const dir=abs.slice(0,abs.lastIndexOf('/'));
 const parts=dir.split('/').filter(Boolean);let cur='';for(const p of parts){cur+='/'+p;if(!world.dirs.includes(cur))world.dirs.push(cur);}
 world.fs[abs]=text;
}
/** Finishes setup: clear history and let the real clock take over. */
export function finishSetup(world){world.history=[];world.clock.fixed=null;world.oldpwd=null;}

/* ------------------------------------------------------------ checks */
export function makeCtx(world,log,since){
 const repoAt=p=>world.repos[p.startsWith('/')?p:world.home+'/'+p]||null;
 const ctx={
  world,log:log.slice(since),
  repo:(p)=>p?repoAt(p):findRepo(world),
  cwd:()=>world.cwd,
  home:world.home,
  /** Whether a command matching `re` ran since this task started; ok=true also needs exit code 0. */
  ran(re,{ok=null}={}){return ctx.log.some(e=>segments(e.line).some(s=>re.test(s))&&(ok===null||(e.code===0)===ok));},
  head(r){r=r||findRepo(world);return r?headCommit(r):null;},
  branch(r){r=r||findRepo(world);return r?currentBranch(r):null;},
  rev(r,spec){return r?resolveCommit(world,r,spec):null;},
  commit(id){return id?commitOf(world,id):null;},
  msg(id){return (commitOf(world,id)?.msg||'').trim();},
  files(id){const f=id?treeFiles(world,id):{};return Object.fromEntries(Object.entries(f).map(([k,v])=>[k,textOf(world,v)]));},
  index(r){return Object.fromEntries(Object.entries(r.index).map(([k,v])=>[k,textOf(world,v)]));},
  wt(r){return worktree(world,r);},
  status(r){return statusOf(world,r);},
  clean(r){const s=statusOf(world,r);return !s.staged.length&&!s.unstaged.length&&!s.unmerged.length;},
  ignored(r,path){return isIgnored(ignoreRules(world,r),path);},
  isAncestor(a,b){return isAncestor(world,a,b);},
  server(url){return serverFor(world,canonicalUrl(url));},
  dir(p){return isDir(world,p.startsWith('/')?p:world.home+'/'+p);},
  file(p){return isFile(world,p.startsWith('/')?p:world.home+'/'+p);},
  read(p){return world.fs[p.startsWith('/')?p:world.home+'/'+p];},
 };
 return ctx;
}
/** The simple commands inside one line (split on && || ; |). */
export function segments(line){return String(line).split(/&&|\|\||;|\|/).map(s=>s.trim()).filter(Boolean);}
