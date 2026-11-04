// A small bash: quoting, &&, ||, ;, pipes, > and >> redirection, globbing and
// the everyday file commands, so learners use Git the way they would in a
// real terminal. Git itself is the `git` builtin.
import {git,GIT_SUBCOMMANDS} from './git.js';
import {findRepo,currentBranch,headCommit,resolvePath,isFile,isDir,listDir,writeFs,removeFs,ensureDir,dirname,basename,relTo} from './repo.js';
import {short} from './core.js';
import {C,stripAnsi} from './format.js';

/* ------------------------------------------------------------ parsing */
/** Splits a command line into words and operators, keeping quoted text intact. */
export function tokenize(line,world){
 const out=[];let cur=null,quoted=false,i=0;
 const push=()=>{if(cur!==null){out.push({w:cur,q:quoted});cur=null;quoted=false;}};
 const vars=s=>s.replace(/\$(\{?)(HOME|USER|PWD)\}?/g,(_,b,n)=>n==='HOME'?world.home:n==='USER'?world.user:world.cwd);
 while(i<line.length){
  const c=line[i];
  if(c===' '||c==='\t'){push();i++;continue;}
  if(c==='#'&&cur===null)break;
  const two=line.slice(i,i+2);
  if(['&&','||','>>'].includes(two)){push();out.push({op:two});i+=2;continue;}
  if(c===';'||c==='|'||c==='>'||c==='<'){push();out.push({op:c});i++;continue;}
  if(c==="'"){const j=line.indexOf("'",i+1);if(j<0)return {error:"unexpected EOF while looking for matching `''"};cur=(cur??'')+line.slice(i+1,j);quoted=true;i=j+1;continue;}
  if(c==='"'){let j=i+1,s='';while(j<line.length&&line[j]!=='"'){if(line[j]==='\\'&&'"\\$`'.includes(line[j+1])){s+=line[j+1];j+=2;continue;}s+=line[j++];}if(j>=line.length)return {error:'unexpected EOF while looking for matching `"\''};cur=(cur??'')+vars(s);quoted=true;i=j+1;continue;}
  if(c==='\\'&&i+1<line.length){cur=(cur??'')+line[i+1];i+=2;continue;}
  let j=i,s='';while(j<line.length&&!' \t;|&><\'"\\'.includes(line[j]))s+=line[j++];
  if(cur===null&&(s==='~'||s.startsWith('~/')))s=world.home+s.slice(1);
  cur=(cur??'')+vars(s);i=j;
 }
 push();
 return {tokens:out};
}
function expandGlob(world,word){
 if(!/[*?]/.test(word))return [word];
 const slash=word.lastIndexOf('/'),dirPart=slash>=0?word.slice(0,slash):'',pat=slash>=0?word.slice(slash+1):word;
 const dir=resolvePath(world,dirPart||'.');if(!isDir(world,dir))return [word];
 const re=new RegExp('^'+pat.split('').map(c=>c==='*'?'[^/]*':c==='?'?'[^/]':c.replace(/[.+^${}()|[\]\\]/g,'\\$&')).join('')+'$');
 const hits=listDir(world,dir).map(x=>x.name).filter(n=>re.test(n)&&(pat.startsWith('.')||!n.startsWith('.'))).sort();
 return hits.length?hits.map(n=>(dirPart?dirPart+'/':'')+n):[word];
}

/* ------------------------------------------------------------ builtins */
const display=(world,p)=>p===world.home?'~':p.startsWith(world.home+'/')?'~'+p.slice(world.home.length):p;
function fileText(world,args,name,io){
 if(!args.length)return io.stdin??'';
 let out='';
 for(const a of args){const abs=resolvePath(world,a);if(isFile(world,abs))out+=world.fs[abs];else if(isDir(world,abs)){io.err(`${name}: ${a}: Is a directory`);io.code=1;}else{io.err(`${name}: ${a}: No such file or directory`);io.code=1;}}
 return out;
}
const linesOf=t=>t?t.replace(/\n$/,'').split('\n'):[];
const BUILTINS={
 pwd:({world,io})=>{io.out(world.cwd);},
 cd:({world,args,io})=>{
  const target=!args[0]?world.home:args[0]==='-'?(world.oldpwd||world.cwd):args[0];
  const abs=resolvePath(world,target);
  if(isFile(world,abs)){io.err(`bash: cd: ${args[0]}: Not a directory`);return 1;}
  if(!isDir(world,abs)){io.err(`bash: cd: ${args[0]}: No such file or directory`);return 1;}
  if(args[0]==='-')io.out(abs);
  world.oldpwd=world.cwd;world.cwd=abs;return 0;
 },
 ls:({world,args,io})=>{
  const flags=args.filter(a=>a.startsWith('-')).join(''),all=flags.includes('a'),long=flags.includes('l');
  const targets=args.filter(a=>!a.startsWith('-'));if(!targets.length)targets.push('.');
  let code=0;
  // like ls: missing paths first, then plain files on one line, then each directory
  const files=targets.filter(t=>isFile(world,resolvePath(world,t))),dirs=targets.filter(t=>isDir(world,resolvePath(world,t))&&!isFile(world,resolvePath(world,t)));
  for(const t of targets)if(!files.includes(t)&&!dirs.includes(t)){io.err(`ls: cannot access '${t}': No such file or directory`);code=2;}
  if(files.length){if(long)for(const t of files)io.out(`-rw-r--r-- 1 ${world.user} ${world.user} ${String(world.fs[resolvePath(world,t)].length).padStart(5)} Nov  3 20:13 ${t}`);else io.out(files.join('  '));}
  dirs.forEach((t,ti)=>{
   const abs=resolvePath(world,t);
   if(targets.length>1){if(ti||files.length)io.out('');io.out(`${t}:`);}
   let items=listDir(world,abs);if(!all)items=items.filter(x=>!x.name.startsWith('.'));
   if(all)items=[{name:'.',dir:true},{name:'..',dir:true},...items];
   const paint=x=>x.dir?C.boldBlue(x.name):x.name;
   if(long){io.out(`total ${items.length*4}`);for(const x of items){const size=x.dir?4096:(world.fs[abs+'/'+x.name]??'').length;io.out(`${x.dir?'d':'-'}${x.dir?'rwxr-xr-x':'rw-r--r--'} ${x.dir?2:1} ${world.user} ${world.user} ${String(size).padStart(5)} Nov  3 20:13 ${paint(x)}`);}}
   else if(items.length)io.out(items.map(paint).join('  '));
  });
  return code;
 },
 cat:({world,args,io})=>{const t=fileText(world,args,'cat',io);if(t)for(const l of linesOf(t))io.out(l);return io.code||0;},
 head:({world,args,io})=>{let n=10;const rest=[];for(let i=0;i<args.length;i++){if(args[i]==='-n'){n=Number(args[++i]);continue;}if(/^-\d+$/.test(args[i])){n=Number(args[i].slice(1));continue;}rest.push(args[i]);}for(const l of linesOf(fileText(world,rest,'head',io)).slice(0,n))io.out(l);return io.code||0;},
 tail:({world,args,io})=>{let n=10;const rest=[];for(let i=0;i<args.length;i++){if(args[i]==='-n'){n=Number(args[++i]);continue;}if(/^-\d+$/.test(args[i])){n=Number(args[i].slice(1));continue;}rest.push(args[i]);}for(const l of linesOf(fileText(world,rest,'tail',io)).slice(-n))io.out(l);return io.code||0;},
 wc:({world,args,io})=>{const rest=args.filter(a=>!a.startsWith('-')),t=fileText(world,rest,'wc',io),l=(t.match(/\n/g)||[]).length;if(args.includes('-l'))io.out(`${l}${rest[0]?' '+rest[0]:''}`);else io.out(`${String(l).padStart(2)} ${String(t.split(/\s+/).filter(Boolean).length).padStart(2)} ${String(t.length).padStart(3)}${rest[0]?' '+rest[0]:''}`);return 0;},
 grep:({world,args,io})=>{
  const flags=args.filter(a=>/^-[a-zA-Z]+$/.test(a)).join(''),rest=args.filter(a=>!/^-[a-zA-Z]+$/.test(a)),[pat,...files]=rest;
  if(pat===undefined){io.err('Usage: grep [OPTION]... PATTERNS [FILE]...');return 2;}
  const re=new RegExp(pat.replace(/[.+^${}()|[\]\\]/g,m=>m==='.'?'.':'\\'+m),flags.includes('i')?'i':'');let hit=false;
  const scan=(text,name)=>linesOf(text).forEach((l,i)=>{if(re.test(l)!==flags.includes('v')){hit=true;io.out(`${files.length>1&&name?C.magenta(name)+C.cyan(':'):''}${flags.includes('n')?C.green(i+1)+C.cyan(':'):''}${flags.includes('v')?l:l.replace(re,m=>C.boldRed(m))}`);}});
  if(!files.length)scan(io.stdin??'','');else for(const f of files){const abs=resolvePath(world,f);if(isFile(world,abs))scan(world.fs[abs],f);else if(!flags.includes('s')){io.err(`grep: ${f}: No such file or directory`);}}
  return hit?0:1;
 },
 echo:({args,io})=>{let n=false,e=false;while(args[0]==='-n'||args[0]==='-e'){if(args[0]==='-n')n=true;else e=true;args=args.slice(1);}let s=args.join(' ');if(e)s=s.replace(/\\n/g,'\n').replace(/\\t/g,'\t');io.write(s+(n?'':'\n'));return 0;},
 printf:({args,io})=>{const [fmt='',...rest]=args;let i=0;io.write(fmt.replace(/%s/g,()=>rest[i++]??'').replace(/\\n/g,'\n').replace(/\\t/g,'\t'));return 0;},
 touch:({world,args,io})=>{for(const a of args){const abs=resolvePath(world,a);if(!isDir(world,dirname(abs))){io.err(`touch: cannot touch '${a}': No such file or directory`);return 1;}if(!isFile(world,abs)&&!isDir(world,abs))writeFs(world,abs,'');}return 0;},
 mkdir:({world,args,io})=>{
  const parents=args.includes('-p');let code=0;
  for(const a of args.filter(x=>!x.startsWith('-'))){
   const abs=resolvePath(world,a);
   if(isDir(world,abs)||isFile(world,abs)){if(!parents){io.err(`mkdir: cannot create directory ‘${a}’: File exists`);code=1;}continue;}
   if(!parents&&!isDir(world,dirname(abs))){io.err(`mkdir: cannot create directory ‘${a}’: No such file or directory`);code=1;continue;}
   ensureDir(world,abs);
  }
  return code;
 },
 rm:({world,args,io})=>{
  const flags=args.filter(a=>/^-[a-zA-Z]+$/.test(a)).join(''),rec=/r|R/.test(flags),force=flags.includes('f');let code=0;
  for(const a of args.filter(x=>!/^-[a-zA-Z]+$/.test(x))){
   const abs=resolvePath(world,a);
   if(abs.endsWith('/.git')&&world.repos[dirname(abs)]){if(!rec){io.err(`rm: cannot remove '${a}': Is a directory`);code=1;continue;}delete world.repos[dirname(abs)];continue;}
   if(isFile(world,abs)){removeFs(world,abs);continue;}
   if(isDir(world,abs)){
    if(!rec){io.err(`rm: cannot remove '${a}': Is a directory`);code=1;continue;}
    if(abs===world.cwd||world.cwd.startsWith(abs+'/'))world.cwd=dirname(abs);
    for(const k of Object.keys(world.fs))if(k.startsWith(abs+'/'))delete world.fs[k];
    world.dirs=world.dirs.filter(d=>d!==abs&&!d.startsWith(abs+'/'));
    for(const k of Object.keys(world.repos))if(k===abs||k.startsWith(abs+'/'))delete world.repos[k];
    continue;
   }
   if(!force){io.err(`rm: cannot remove '${a}': No such file or directory`);code=1;}
  }
  return code;
 },
 mv:({world,args,io})=>copyMove(world,args.filter(a=>!a.startsWith('-')),io,true),
 cp:({world,args,io})=>copyMove(world,args.filter(a=>!a.startsWith('-')),io,false),
 clear:({io})=>{io.clear=true;return 0;},
 whoami:({world,io})=>{io.out(world.user);return 0;},
 history:({world,io})=>{(world.history||[]).forEach((h,i)=>io.out(`${String(i+1).padStart(5)}  ${h}`));return 0;},
 code:({world,args,io})=>openEditor(world,args,io,'code'),nano:({world,args,io})=>openEditor(world,args,io,'nano'),vim:({world,args,io})=>openEditor(world,args,io,'vim'),vi:({world,args,io})=>openEditor(world,args,io,'vi'),
 help:({io})=>{io.out('GNU bash, version 5.2.21(1)-release (x86_64-pc-linux-gnu)');io.out('Commands in this terminal:');io.out('  git  cd  pwd  ls  cat  echo  printf  touch  mkdir  rm  mv  cp');io.out('  head  tail  grep  wc  clear  history  whoami  code <file>');io.out('Operators: &&  ||  ;  |  >  >>');return 0;},
 true:()=>0,false:()=>1,exit:({io})=>{io.out('logout');io.out('(The terminal stays open — this is a simulation.)');return 0;},
};
function copyMove(world,args,io,move){
 const name=move?'mv':'cp';
 if(args.length<2){io.err(`${name}: missing destination file operand after '${args[0]??''}'`);return 1;}
 const dest=resolvePath(world,args.at(-1));
 for(const a of args.slice(0,-1)){
  const src=resolvePath(world,a),target=isDir(world,dest)?dest+'/'+basename(src):dest;
  if(isFile(world,src)){writeFs(world,target,world.fs[src]);if(move)removeFs(world,src);continue;}
  if(isDir(world,src)){
   if(!move&&!args.includes('-r')){io.err(`cp: -r not specified; omitting directory '${a}'`);return 1;}
   for(const k of Object.keys(world.fs))if(k.startsWith(src+'/')){writeFs(world,target+k.slice(src.length),world.fs[k]);if(move)delete world.fs[k];}
   ensureDir(world,target);if(move)world.dirs=world.dirs.filter(d=>d!==src&&!d.startsWith(src+'/'));
   continue;
  }
  io.err(`${name}: cannot stat '${a}': No such file or directory`);return 1;
 }
 return 0;
}
function openEditor(world,args,io,name){
 const f=args.find(a=>!a.startsWith('-'));
 if(!f){io.err(`${name}: a file name is needed in this terminal`);return 1;}
 const abs=resolvePath(world,f);
 if(isDir(world,abs)){io.err(`${name}: ${f}: Is a directory`);return 1;}
 if(!isDir(world,dirname(abs))){io.err(`${name}: ${f}: No such file or directory`);return 1;}
 if(!isFile(world,abs))writeFs(world,abs,'');
 io.open=abs;
 if(name!=='code')io.out(C.dim(`(${name} opens in the editor panel here — edit, then press Ctrl+S to save.)`));
 return 0;
}

/* ------------------------------------------------------------ running */
/**
 * Runs one command line. Returns {lines, code, clear, open}. `lines` are what
 * the terminal shows (stdout and stderr interleaved, with ANSI colours).
 */
export function run(world,line){
 const lines=[],res={lines,code:0,clear:false,open:null};
 const text=String(line??'');
 if(!text.trim())return res;
 (world.history??=[]).push(text);if(world.history.length>500)world.history.shift();
 const t=tokenize(text,world);
 if(t.error){lines.push(`bash: ${t.error}`);res.code=2;return res;}
 // split into pipelines joined by && || ;
 const chain=[];let cur=[],join=null;
 for(const tok of t.tokens){if(tok.op&&['&&','||',';'].includes(tok.op)){chain.push({join,parts:cur});cur=[];join=tok.op;continue;}cur.push(tok);}
 chain.push({join,parts:cur});
 let last=0;
 for(const step of chain){
  if(!step.parts.length){if(step.join&&step.join!==';'){lines.push(`bash: syntax error near unexpected token \`${step.join}'`);res.code=2;return res;}continue;}
  if(step.join==='&&'&&last!==0)continue;
  if(step.join==='||'&&last===0)continue;
  last=runPipeline(world,step.parts,res);
  if(res.clear){lines.length=0;res.clear=true;}
 }
 res.code=last;
 return res;
}
function runPipeline(world,parts,res){
 const stages=[];let cur=[];
 for(const tok of parts){if(tok.op==='|'){stages.push(cur);cur=[];continue;}cur.push(tok);}
 stages.push(cur);
 let stdin=null,code=0;
 for(let s=0;s<stages.length;s++){
  const words=[];let redirect=null;
  const st=stages[s];
  for(let i=0;i<st.length;i++){
   const tok=st[i];
   if(tok.op==='>'||tok.op==='>>'){const target=st[i+1];if(!target||target.op){res.lines.push("bash: syntax error near unexpected token `newline'");return 2;}redirect={append:tok.op==='>>',path:target.w};i++;continue;}
   if(tok.op==='<'){const target=st[++i];const abs=resolvePath(world,target?.w||'');if(!isFile(world,abs)){res.lines.push(`bash: ${target?.w}: No such file or directory`);return 1;}stdin=world.fs[abs];continue;}
   if(tok.op){res.lines.push(`bash: syntax error near unexpected token \`${tok.op}'`);return 2;}
   if(tok.q)words.push(tok.w);else words.push(...expandGlob(world,tok.w));
  }
  const piped=s<stages.length-1;
  const buf=[],io={stdin,code:0,clear:false,open:null,
   out:l=>buf.push({l}),err:l=>res.lines.push(l),write:t=>{buf.push({raw:t});}};
  try{code=exec(world,words,io);}catch(e){console.error(e);res.lines.push(`fatal: the simulator hit an internal error running '${words.join(' ')}' (${e.message})`);code=128;}
  if(io.clear)res.clear=true;if(io.open)res.open=io.open;
  // collect stdout as text
  let outText='';for(const b of buf)outText+=b.raw!==undefined?b.raw:b.l+'\n';
  if(redirect){
   const abs=resolvePath(world,redirect.path);
   if(isDir(world,abs)){res.lines.push(`bash: ${redirect.path}: Is a directory`);return 1;}
   if(!isDir(world,dirname(abs))){res.lines.push(`bash: ${redirect.path}: No such file or directory`);return 1;}
   const plain=stripAnsi(outText);
   writeFs(world,abs,redirect.append?(world.fs[abs]??'')+plain:plain);
   stdin='';continue;
  }
  if(piped){stdin=stripAnsi(outText);continue;}
  if(outText){const ls=outText.split('\n');if(ls.at(-1)==='')ls.pop();res.lines.push(...ls);}
 }
 return code;
}
function exec(world,words,io){
 const [cmd,...args]=words;
 if(!cmd)return 0;
 if(cmd==='git')return git(world,args,l=>io.out(l));
 const b=BUILTINS[cmd];
 if(b)return b({world,args,io})??0;
 if(/^(gti|gi|igt|got)$/.test(cmd)){io.err(`Command '${cmd}' not found, did you mean:`);io.err("  command 'git' from deb git (1:2.43.0-1ubuntu7)");io.err('Try: sudo apt install <deb name>');return 127;}
 io.err(`${cmd}: command not found`);return 127;
}

/* ------------------------------------------------------------ prompt & completion */
/** The parts of a bash prompt with __git_ps1: user@host:~/dir (branch|MERGING)$ */
export function promptParts(world){
 const r=findRepo(world);let branch=null;
 if(r){
  const b=currentBranch(r);
  branch=b??`(${short(headCommit(r))}...)`;
  if(r.seq?.op==='rebase')branch=`${r.seq.branch}|REBASE ${r.seq.done.length}/${r.seq.done.length+r.seq.todo.length}`;
  else if(r.seq?.op==='cherry-pick')branch+='|CHERRY-PICKING';
  else if(r.seq?.op==='revert')branch+='|REVERTING';
  else if(r.merge)branch+='|MERGING';
 }
 return {user:world.user,host:world.host,path:display(world,world.cwd),branch};
}
export const promptText=world=>{const p=promptParts(world);return `${p.user}@${p.host}:${p.path}${p.branch?` (${p.branch})`:''}$ `;};
/** Tab completion for commands, git subcommands, branches and paths. */
export function complete(world,line){
 const m=line.match(/^(.*?)(\S*)$/),before=m[1],word=m[2];
 const words=before.trim().split(/\s+/).filter(Boolean);
 let pool=[];
 if(!words.length)pool=[...Object.keys(BUILTINS),'git'];
 else if(words[0]==='git'&&words.length===1)pool=GIT_SUBCOMMANDS;
 else{
  const r=findRepo(world);
  if(words[0]==='git'&&r&&['switch','checkout','merge','rebase','branch','push','pull','log','diff','show','reset','cherry-pick','revert','tag','fetch','remote'].includes(words[1]))
   pool.push(...Object.keys(r.refs).filter(k=>k.startsWith('refs/heads/')||k.startsWith('refs/tags/')).map(k=>k.replace(/^refs\/(heads|tags)\//,'')),...Object.keys(r.refs).filter(k=>k.startsWith('refs/remotes/')).map(k=>k.slice(13)),...Object.keys(r.config).filter(k=>/^remote\.[^.]+\.url$/.test(k)).map(k=>k.split('.')[1]),'HEAD');
  const slash=word.lastIndexOf('/'),dirPart=slash>=0?word.slice(0,slash+1):'',abs=resolvePath(world,dirPart||'.');
  if(isDir(world,abs))pool.push(...listDir(world,abs).filter(x=>x.name!=='.git'||word.startsWith('.')).map(x=>dirPart+x.name+(x.dir?'/':'')));
 }
 const hits=[...new Set(pool)].filter(x=>x.startsWith(word)).sort();
 if(!hits.length)return {line,options:[]};
 if(hits.length===1)return {line:before+hits[0]+(hits[0].endsWith('/')?'':' '),options:[]};
 let pre=hits[0];for(const h of hits)while(!h.startsWith(pre))pre=pre.slice(0,-1);
 return {line:before+pre,options:hits};
}
export {relTo};
