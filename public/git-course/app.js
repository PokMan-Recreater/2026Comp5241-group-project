import {createWorkspaceSync,requestWorkspace} from '../workspace-sync.js';
import {cloudAPI} from '../cloud-records.js';
import {gitStoreKey,gitRunPrefix,readGitProgress,activateGitUser} from './storage.js';
// The Git course page: explorer, editor and terminal on the left, the lesson
// on the right, GitHub in a tab. Every command runs in the simulated computer
// and the current task is checked against the repository afterwards.
import {GROUPS,LESSONS,lessonById,startLesson,command,evaluate,stepsOf,reviewPullRequest} from './course.js';
import {promptParts,complete} from '../git-engine/shell.js';
import {git,statusOf,tracking} from '../git-engine/git.js';
import {findRepo,currentBranch,headCommit,ignoreRules,isIgnored,writeFs} from '../git-engine/repo.js';
import {githubHTML,githubClick,githubChange,defaultGithubView} from './github.js';

let gitAccount=null;try{gitAccount=(await cloudAPI('/api/account')).user;if(gitAccount)activateGitUser(gitAccount.id);}catch{/* The unowned simulator remains usable offline. */}
const STORE=gitStoreKey(),RUN=gitRunPrefix();
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let store=load(STORE)||{progress:{},current:null,lang:null};
if(!store.lang){let l='en';try{l=JSON.parse(localStorage.getItem('forma.workspace.v1')||'{}').lang||'en';}catch{/* ignore */}store.lang=String(l).startsWith('zh')?'zh':'en';}
if(!store.theme){let light=false;try{light=matchMedia('(prefers-color-scheme: light)').matches;}catch{/* ignore */}store.theme=light?'light':'dark';}
const theme=()=>store.theme;
const lang=()=>store.lang;
const T=v=>v==null?'':typeof v==='string'?v:(v[lang()]??v.en??'');
const L=(en,zh)=>lang()==='zh'?zh:en;
let state=null;
const ui={side:'explorer',expanded:new Set(),tabs:[],active:null,buffers:{},gh:null,reveal:{},outline:false,hist:-1,draft:''};

function load(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch{return null;}}
function persist(){
 try{localStorage.setItem(STORE,JSON.stringify(store));gitSync?.changed();if(parent!==window)parent.postMessage({type:'forma-git-progress'},location.origin);}catch{/* storage full or blocked */}
 if(!state)return;
 try{localStorage.setItem(RUN+state.id,JSON.stringify(state));}
 catch{try{for(const k of Object.keys(localStorage))if(k.startsWith(RUN)&&k!==RUN+state.id)localStorage.removeItem(k);localStorage.setItem(RUN+state.id,JSON.stringify(state));}catch{/* keep running without saving */}}
}

/* ------------------------------------------------------------ lessons */
function openLesson(id,{fresh=false}={}){
 if(!lessonById(id))id=LESSONS[0].id;
 const saved=!fresh&&load(RUN+id);
 state=saved&&saved.v===2&&saved.id===id?saved:startLesson(id);
 store.current=id;
 const tb=$('#toasts');if(tb)tb.innerHTML='';
 ui.tabs=[];ui.active=null;ui.buffers={};ui.reveal={};ui.hist=-1;ui.gh=defaultGithubView(state.world);
 ui.expanded=new Set([state.world.home,state.world.cwd]);
 if(state.open)openFile(state.open,false);
 if(!state.term.length)intro();
 history.replaceState(null,'','#'+id);
 persist();renderAll();focusInput();
}
function intro(){
 const lesson=lessonById(state.id);
 state.term.push({k:'out',t:`\x1b[2m${L('Forma Git terminal — Git 2.43 in a simulated Linux computer. Type commands below; try "help".','Forma Git 终端——在模拟的 Linux 电脑里运行 Git 2.43。在下方输入命令，可以先试试 "help"。')}\x1b[m`});
 if(lesson.stages)state.term.push({k:'out',t:`\x1b[2m${L('Project files are in ~/doc-summarise.','项目文件在 ~/doc-summarise。')}\x1b[m`});
}
const index=()=>LESSONS.findIndex(l=>l.id===state.id);

/* ------------------------------------------------------------ terminal */
function ansi(s){
 let out='',cls=[],last=0,m;const re=new RegExp(String.fromCharCode(27)+'\\[([0-9;]*)m','g');
 const span=t=>t?(cls.length?`<span class="${cls.join(' ')}">${esc(t)}</span>`:esc(t)):'';
 while((m=re.exec(s))){out+=span(s.slice(last,m.index));last=re.lastIndex;for(const c of (m[1]||'0').split(';')){if(c==='0'||c==='')cls=[];else if(c==='1')cls.push('a-b');else if(c==='2')cls.push('a-d');else cls=cls.filter(x=>!/^a-3/.test(x)).concat('a-'+c);}}
 return out+span(s.slice(last));
}
const promptHTML=p=>`<span class="p-user">${esc(p.user)}@${esc(p.host)}</span>:<span class="p-path">${esc(p.path)}</span>${p.branch?` <span class="p-branch">(${esc(p.branch)})</span>`:''}$ `;
function termLine(e){return e.k==='cmd'?`<div class="ln cmd">${promptHTML(e.p)}${esc(e.t)}</div>`:`<div class="ln">${ansi(e.t)||'&nbsp;'}</div>`;}
function renderTerminal(){
 const box=$('#term');
 box.innerHTML=state.term.map(termLine).join('')+`<div class="input-line"><span id="prompt">${promptHTML(promptParts(state.world))}</span><input id="cmd" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="${esc(L('Terminal command','终端命令'))}" value="${esc(ui.draft)}"></div>`;
 box.scrollTop=box.scrollHeight;
}
function appendTerm(entries){
 const box=$('#term'),line=box.querySelector('.input-line');
 line.insertAdjacentHTML('beforebegin',entries.map(termLine).join(''));
 $('#prompt').innerHTML=promptHTML(promptParts(state.world));
 box.scrollTop=box.scrollHeight;
}
function runLine(line){
 const p=promptParts(state.world),entries=[{k:'cmd',p,t:line}];
 ui.draft='';ui.hist=-1;
 if(!line.trim()){state.term.push(...entries);appendTerm(entries);return;}
 const feedBefore=state.feed.length;
 const res=command(state,line);
 if(res.clear){state.term=[];renderTerminal();}
 else{const out=res.lines.map(t=>({k:'out',t}));entries.push(...out);state.term.push(...entries);if(state.term.length>1500)state.term=state.term.slice(-1500);appendTerm(entries);}
 if(res.open)openFile(res.open,false);
 afterChange(feedBefore);
 const input=$('#cmd');if(input){input.value='';input.focus();}
}
function afterChange(feedBefore=state.feed.length){
 const finished=evaluate(state);
 for(const s of finished)toast('✓ '+T(s.text),'ok');
 for(const f of state.feed.slice(feedBefore))toast(`${f.who}: ${T(f.text)}`,'info');
 if(finished.length&&state.done){store.progress[state.id]={done:true};toast(L('Lesson complete!','本课完成！'),'ok');}
 else if(finished.length)store.progress[state.id]={done:false,step:state.step};
 ui.reveal={};
 for(let d=state.world.cwd;d.startsWith(state.world.home);d=d.slice(0,d.lastIndexOf('/')))ui.expanded.add(d);
 persist();
 renderSidebar();renderMission();renderStatus();renderTopbar();
 if(ui.active==='github')renderEditor();else syncBuffers();
}
function onKey(e){
 const input=e.target;
 if(e.key==='Enter'){e.preventDefault();runLine(input.value);return;}
 if(e.key==='ArrowUp'||e.key==='ArrowDown'){
  const h=state.world.history||[];if(!h.length)return;e.preventDefault();
  if(ui.hist<0)ui.hist=h.length;ui.hist=Math.max(0,Math.min(h.length,ui.hist+(e.key==='ArrowUp'?-1:1)));
  input.value=h[ui.hist]??'';input.setSelectionRange(input.value.length,input.value.length);return;
 }
 if(e.key==='Tab'){e.preventDefault();const r=complete(state.world,input.value);input.value=r.line;if(r.options.length>1){const entries=[{k:'cmd',p:promptParts(state.world),t:input.value},{k:'out',t:'\x1b[36m'+r.options.join('  ')+'\x1b[m'}];state.term.push(...entries);appendTerm(entries);$('#cmd').value=r.line;$('#cmd').focus();}return;}
 if(e.ctrlKey&&e.key.toLowerCase()==='l'){e.preventDefault();state.term=[];ui.draft=input.value;renderTerminal();focusInput();return;}
 if(e.ctrlKey&&e.key.toLowerCase()==='c'&&input.selectionStart===input.selectionEnd){e.preventDefault();const entries=[{k:'cmd',p:promptParts(state.world),t:input.value+'^C'}];state.term.push(...entries);input.value='';appendTerm(entries);}
}
function focusInput(){const i=$('#cmd');if(i&&window.innerWidth>960)i.focus({preventScroll:true});}

/* ------------------------------------------------------------ explorer */
function decorations(){
 const w=state.world,map=new Map();
 for(const [path,r] of Object.entries(w.repos)){
  const s=statusOf(w,r),rules=ignoreRules(w,r),abs=p=>path+'/'+p;
  for(const f of s.untrackedFiles)map.set(abs(f),'U');
  for(const x of s.unstaged)map.set(abs(x.path),x.kind==='deleted'?'D':'M');
  for(const x of s.staged)if(!map.has(abs(x.path)))map.set(abs(x.path),x.kind==='new file'?'A':x.kind==='renamed'?'R':x.kind==='deleted'?'D':'M');
  for(const x of s.unmerged)map.set(abs(x.path),'C');
  for(const f of Object.keys(w.fs))if(f.startsWith(path+'/')&&!map.has(f)&&isIgnored(rules,f.slice(path.length+1))&&!(f.slice(path.length+1) in r.index))map.set(f,'!');
 }
 return map;
}
function treeHTML(){
 const w=state.world,deco=decorations(),home=w.home;
 const kids=dir=>{
  const names=new Map();
  for(const f of Object.keys(w.fs))if(f.startsWith(dir+'/')){const rest=f.slice(dir.length+1),i=rest.indexOf('/');names.set(i<0?rest:rest.slice(0,i),i>=0||names.get(rest)===true);}
  for(const d of w.dirs)if(d.startsWith(dir+'/')){const n=d.slice(dir.length+1).split('/')[0];if(n)names.set(n,true);}
  return [...names].filter(([n])=>n!=='.git').sort((a,b)=>a[1]!==b[1]?(a[1]?-1:1):a[0].toLowerCase()<b[0].toLowerCase()?-1:1);
 };
 const dirState=abs=>{let worst='';for(const [f,s] of deco)if(f.startsWith(abs+'/')&&s!=='!'){if(s==='C')return 'C';if(!worst||s==='M')worst=s;}return worst;};
 const rows=[];
 const walk=(dir,depth)=>{
  for(const [name,isDir] of kids(dir)){
   const abs=dir+'/'+name,pad=8+depth*12;
   if(isDir){
    const open=ui.expanded.has(abs),st=dirState(abs),repo=w.repos[abs];
    rows.push(`<button class="tree-row ${st?'st-'+st:''}" style="padding-left:${pad}px" data-act="dir" data-path="${esc(abs)}" aria-expanded="${open}"><span class="tw">${open?'▾':'▸'}</span><span class="nm">${esc(name)}${repo?' <span style="opacity:.5;font-size:11px">git</span>':''}</span>${st&&!open?'<span class="badge">●</span>':''}</button>`);
    if(open)walk(abs,depth+1);
   }else{
    const st=deco.get(abs)||'';
    rows.push(`<button class="tree-row ${st==='!'?'ignored':st?'st-'+st:''} ${ui.active===abs?'active':''}" style="padding-left:${pad+14}px" data-act="open" data-path="${esc(abs)}"><span class="nm">${esc(name)}</span>${st&&st!=='!'?`<span class="badge">${st==='C'?'!':st}</span>`:''}</button>`);
   }
  }
 };
 walk(home,0);
 return rows.join('')||`<p class="empty-note">${L('The home folder is empty.','主目录是空的。')}</p>`;
}
function graphText(){
 const w=state.world,r=findRepo(w);
 if(!r)return `<p class="empty-note">${L('No repository here. cd into one or run git init.','这里没有仓库。cd 进入仓库或运行 git init。')}</p>`;
 if(!headCommit(r)&&!Object.keys(r.refs).length)return `<p class="empty-note">${L('No commits yet.','还没有提交。')}</p>`;
 const out=[];git(w,['log','--oneline','--graph','--all','-n','40'],l=>out.push(l));
 return `<div class="graph">${out.map(ansi).join('\n')}</div>`;
}
function renderSidebar(){
 const w=state.world,r=findRepo(w);
 $('#sidebar').innerHTML=`<div class="side-title"><span>${L('Explorer','资源管理器')}</span><span style="text-transform:none;letter-spacing:0">~/</span></div>
  <div class="side-scroll tree" role="tree">${treeHTML()}</div>
  <div class="graph-wrap"><div class="side-title"><span>${L('Graph','提交图')}</span>${r?`<span style="text-transform:none;letter-spacing:0">${esc(r.path.replace(w.home,'~'))}</span>`:''}</div><div class="side-scroll">${graphText()}</div></div>`;
}

/* ------------------------------------------------------------ editor */
function openFile(abs,focus=true){
 if(!ui.tabs.includes(abs))ui.tabs.push(abs);
 ui.active=abs;
 const disk=state.world.fs[abs];
 if(!ui.buffers[abs]||!ui.buffers[abs].dirty)ui.buffers[abs]={text:disk??'',dirty:false,disk};
 for(let d=abs.slice(0,abs.lastIndexOf('/'));d.startsWith(state.world.home);d=d.slice(0,d.lastIndexOf('/')))ui.expanded.add(d);
 renderEditor();renderSidebar();
 if(focus)setTimeout(()=>$('#code')?.focus(),0);
}
function syncBuffers(){
 for(const [p,b] of Object.entries(ui.buffers)){const disk=state.world.fs[p];if(!b.dirty&&b.text!==disk){b.text=disk??'';b.disk=disk;}}
 renderEditor();
}
function save(){
 const p=ui.active,b=ui.buffers[p];if(!b)return;
 writeFs(state.world,p,b.text);b.dirty=false;b.disk=b.text;
 renderEditor();afterChange();
}
const MARK=/^(<{7}|={7}|>{7})/m;
function resolveConflicts(choice){
 const b=ui.buffers[ui.active];if(!b)return;
 b.text=b.text.replace(/<{7}[^\n]*\n([\s\S]*?)={7}\n([\s\S]*?)>{7}[^\n]*\n?/g,(_,ours,theirs)=>choice==='ours'?ours:choice==='theirs'?theirs:ours+theirs);
 b.dirty=true;renderEditor();
}
function renderEditor(){
 const gh=Object.keys(state.world.servers).length>0;
 const tabs=ui.tabs.map(p=>{const b=ui.buffers[p];return `<div class="tab" role="tab" aria-selected="${ui.active===p}"><button data-act="tab" data-path="${esc(p)}" title="${esc(p.replace(state.world.home,'~'))}">${esc(p.split('/').pop())}${state.world.fs[p]===undefined?` <i style="opacity:.6">(${L('deleted','已删除')})</i>`:''}</button>${b?.dirty?'<span class="dirty" aria-label="unsaved"></span>':''}<button class="x" data-act="close" data-path="${esc(p)}" aria-label="${L('Close','关闭')}">×</button></div>`;}).join('')+(gh?`<div class="tab gh" role="tab" aria-selected="${ui.active==='github'}"><button data-act="github">🌐 GitHub</button></div>`:'');
 let pane;
 if(ui.active==='github')pane=githubHTML(state,ui.gh,lang());
 else if(ui.active&&ui.buffers[ui.active]){
  const p=ui.active,b=ui.buffers[p],deleted=state.world.fs[p]===undefined&&!b.dirty;
  const lines=b.text.split('\n').length;
  pane=`<div class="pane"><div class="crumbs"><span>${esc(p.replace(state.world.home,'~').split('/').join(' › '))}</span><button class="save" data-act="save" ${b.dirty?'':'disabled'}>${L('Save','保存')} (Ctrl+S)</button></div>
   ${MARK.test(b.text)?`<div class="conflict-bar"><b>${L('Merge conflict','合并冲突')}</b><span>${L('Pick a side for every block, or edit by hand, then save.','为每个冲突块选择一方，或手动编辑，然后保存。')}</span><button data-act="resolve" data-v="ours">${L('Accept Current','保留当前')}</button><button data-act="resolve" data-v="theirs">${L('Accept Incoming','保留传入')}</button><button data-act="resolve" data-v="both">${L('Accept Both','保留两者')}</button></div>`:''}
   <div class="code"><div class="gutter" id="gutter">${Array.from({length:lines},(_,i)=>i+1).join('\n')}</div><textarea id="code" spellcheck="false" ${deleted?'readonly':''} aria-label="${esc(p.split('/').pop())}">${esc(deleted?L('// This file no longer exists on disk.','// 这个文件已经不在磁盘上了。'):b.text)}</textarea></div></div>`;
 }else pane=`<div class="welcome"><div><h2>${L('Open a file from the explorer','从资源管理器打开文件')}</h2><p>${L('or type','或者输入')} <kbd>code &lt;file&gt;</kbd> ${L('in the terminal. Save with','打开。保存用')} <kbd>Ctrl+S</kbd>.</p></div></div>`;
 $('#editor').innerHTML=`<div class="tabs" role="tablist">${tabs}</div>${pane}`;
 const ta=$('#code');
 if(ta){ta.addEventListener('input',()=>{const b=ui.buffers[ui.active];b.text=ta.value;if(!b.dirty){b.dirty=true;renderEditorTabsOnly();}const g=$('#gutter');const n=ta.value.split('\n').length;if(g.childElementCount!==n)g.textContent=Array.from({length:n},(_,i)=>i+1).join('\n');});ta.addEventListener('scroll',()=>{$('#gutter').scrollTop=ta.scrollTop;});ta.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();save();}if(e.key==='Tab'){e.preventDefault();const s=ta.selectionStart;ta.setRangeText('  ',s,ta.selectionEnd,'end');ta.dispatchEvent(new Event('input'));}});}
}
function renderEditorTabsOnly(){const p=ui.active,sel=[...document.querySelectorAll('.tab')].find(t=>t.querySelector(`[data-path="${CSS.escape(p)}"]`));if(sel&&!sel.querySelector('.dirty'))sel.querySelector('.x').insertAdjacentHTML('beforebegin','<span class="dirty"></span>');const btn=document.querySelector('.crumbs .save');if(btn)btn.disabled=false;}

/* ------------------------------------------------------------ mission */
function prose(text){
 const inline=s=>esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>');
 return text.split(/\n\n+/).map(block=>{const lines=block.split('\n');if(lines.every(l=>/^\* /.test(l)))return `<ul>${lines.map(l=>`<li>${inline(l.slice(2))}</li>`).join('')}</ul>`;return `<p>${lines.map(inline).join('<br>')}</p>`;}).join('');
}
function renderMission(){
 const lesson=lessonById(state.id),steps=stepsOf(lesson),i=index(),total=LESSONS.length;
 const cur=steps[state.step];
 const stageBar=lesson.stages?`<div class="stages">${lesson.stages.map((st,k)=>{const first=steps.findIndex(s=>s.stage===k),last=first+st.steps.length;const cls=state.step>=last?'done':cur&&cur.stage===k?'current':'';return `<span class="stage-dot ${cls}" title="${esc(T(st.title))}">${k+1}</span>`;}).join('')}</div>`:'';
 const list=lesson.stages?steps.filter(s=>cur?s.stage===cur.stage:s.stage===lesson.stages.length-1):steps;
 const offset=steps.indexOf(list[0]);
 const tasks=list.map((s,k)=>{
  const n=offset+k,cls=n<state.step?'done':n===state.step&&!state.done?'current':n<state.step||state.done?'done':'todo';
  let tools='';
  if(cls==='current'){
   tools=`<div class="task-tools">${s.action?`<button class="mini copilot" data-act="action">✨ ${esc(T(s.action.label))}</button>`:''}<button class="mini" data-act="hint">💡 ${L('Hint','提示')}</button><button class="mini" data-act="answer">${L('Show a solution','查看参考答案')}</button></div>`;
   if(ui.reveal.hint)tools+=`<div class="reveal">${esc(T(s.hint)||L('Read the task again and look at the syntax table above. git status usually tells you what to do next.','再读一遍任务，看看上面的语法表。git status 通常会提示下一步该做什么。'))}</div>`;
   if(ui.reveal.answer)tools+=`<div class="reveal"><code>${esc(s.answer)}</code>${/^git |^cd |^echo |^printf |^mkdir |^ls /.test(s.answer)&&!s.answer.includes('<')?`<button class="mini" style="margin-top:6px" data-act="paste">${L('Put in terminal','填入终端')}</button>`:''}</div>`;
  }
  return `<li class="task ${cls}"><span class="n">${cls==='done'?'✓':lesson.stages?k+1:n+1}</span><div><div class="t">${prose(T(s.text)).replace(/^<p>|<\/p>$/g,'')}</div>${tools}</div></li>`;
 }).join('');
 const stage=lesson.stages&&cur?lesson.stages[cur.stage]:null;
 const next=LESSONS[i+1];
 const done=state.done?`<div class="done-card"><h2>${lesson.stages?L('Doc Summarise 1.0 is live 🎉','Doc Summarise 1.0 已上线 🎉'):L('Lesson complete ✓','本课完成 ✓')}</h2><p>${lesson.stages?L('You used every command from the course on a real team workflow.','你在真实的团队工作流里用到了课程中的每一条命令。'):L('Keep experimenting in this terminal, or go on to the next command.','可以继续在终端里随意尝试，也可以进入下一课。')}</p>${next?`<button class="tb-btn primary" data-act="next">${L('Next','下一课')}: ${esc(next.cmd)} →</button>`:''}</div>`:'';
 $('#mission').innerHTML=`<div class="m-head"><div class="m-eyebrow">${lesson.stages?L('Final project','综合项目'):L(`Lesson ${i+1} of ${total-1}`,`第 ${i+1} 课 / 共 ${total-1} 课`)} <span class="chip">${esc(lesson.cmd)}</span></div><h1>${esc(T(lesson.title))}</h1><p>${esc(T(lesson.summary))}</p>${stageBar}</div>
 <div class="m-scroll">${done}
  ${stage?`<section class="m-sec"><h2>${L(`Task ${cur.stage+1} of ${lesson.stages.length}`,`任务 ${cur.stage+1} / ${lesson.stages.length}`)} · ${esc(T(stage.title))}</h2><div class="story">${esc(T(stage.story))}</div></section>`:''}
  <section class="m-sec"><h2>${lesson.stages?L('Steps','步骤'):L('Tasks','任务')} · ${Math.min(state.step,steps.length)}/${steps.length}</h2><ol class="tasks">${tasks}</ol></section>
  ${state.feed.length?`<section class="m-sec"><h2>${L('Team activity','团队动态')}</h2><ul class="feed">${state.feed.slice(-6).reverse().map(f=>`<li><b>${esc(f.who)}</b> ${esc(T(f.text))}</li>`).join('')}</ul></section>`:''}
  <details class="m-sec" ${lesson.stages&&state.step>0?'':'open'}><summary>${lesson.stages?L('About this project','项目说明'):L('How it works','命令讲解')}</summary><div class="prose">${prose(T(lesson.explain))}</div></details>
  ${lesson.syntax?`<section class="m-sec"><h2>${L('Syntax','常用写法')}</h2><table class="syntax">${lesson.syntax.map(([c,d])=>`<tr><td><code>${esc(c)}</code></td><td>${esc(T(d))}</td></tr>`).join('')}</table></section>`:''}
 </div>`;
 const curEl=$('#mission .task.current');if(curEl){const box=$('#mission .m-scroll'),top=curEl.offsetTop-box.offsetTop;if(top<box.scrollTop||top+curEl.offsetHeight>box.scrollTop+box.clientHeight)box.scrollTop=Math.max(0,top-80);}
}

/* ------------------------------------------------------------ chrome */
function renderTopbar(){
 const done=LESSONS.filter(l=>store.progress[l.id]?.done).length;
 $('#lesson-select').innerHTML=GROUPS.map(g=>`<optgroup label="${esc(T(g.title))}">${g.lessons.map(l=>`<option value="${l.id}" ${l.id===state.id?'selected':''}>${store.progress[l.id]?.done?'✓ ':''}${l.stages?'★ ':(LESSONS.indexOf(l)+1)+'. '}${esc(l.cmd)} — ${esc(T(l.title))}</option>`).join('')}</optgroup>`).join('');
 $('#progress').textContent=L(`${done}/${LESSONS.length} done`,`已完成 ${done}/${LESSONS.length}`);
 $('#lang').textContent=lang()==='zh'?'EN':'中文';
 document.documentElement.dataset.theme=theme();
 $('#theme').innerHTML=theme()==='dark'?`☀ <span class="lbl">${L('Light','日常模式')}</span>`:`☾ <span class="lbl">${L('Dark','深色模式')}</span>`;
 $('#theme').title=theme()==='dark'?L('Switch to light mode','切换到日常模式'):L('Switch to dark mode','切换到深色模式');
 $('#outline-btn .lbl').textContent=L('Lessons','目录');$('#reset .lbl').textContent=L('Reset','重新开始');
 $('#back').title=L('Back to Forma','返回 Forma');
 $('#prev').disabled=index()<=0;$('#next').disabled=index()>=LESSONS.length-1;
 document.documentElement.lang=lang()==='zh'?'zh-CN':'en';
 document.title=`${lessonById(state.id).cmd} · ${L('Git course','Git 课程')} · Forma`;
 if(ui.outline)renderOutline();
}
function renderStatus(){
 const w=state.world,r=findRepo(w);
 let bits=`<span>⎇ ${r?esc(currentBranch(r)||'('+(headCommit(r)||'').slice(0,7)+'…)'):L('no repository','无仓库')}</span>`;
 if(r&&currentBranch(r)){const t=tracking(w,r,currentBranch(r));if(t)bits+=`<span>↓${t.behind} ↑${t.ahead} ${esc(t.name)}</span>`;const s=statusOf(w,r);const n=s.staged.length+s.unstaged.length+s.untrackedFiles.length+s.unmerged.length;bits+=`<span>${n?`● ${n} ${L('changes','处改动')}`:L('✓ clean','✓ 干净')}</span>`;}
 if(r?.merge)bits+=`<span>MERGING</span>`;if(r?.seq)bits+=`<span>${esc(r.seq.op.toUpperCase())}</span>`;
 $('#status').innerHTML=bits+`<span class="right">${esc(w.cwd.replace(w.home,'~'))} · Git 2.43 · ${L('simulated','模拟环境')}</span>`;
}
function renderOutline(){
 let d=$('#drawer');
 if(!ui.outline){d?.remove();$('#shade')?.remove();return;}
 if(!d){document.body.insertAdjacentHTML('beforeend','<div class="shade" id="shade" data-act="outline"></div><nav class="drawer" id="drawer" aria-label="Lessons"></nav>');d=$('#drawer');}
 d.innerHTML=GROUPS.map(g=>`<h3>${esc(T(g.title))}</h3>${g.lessons.map(l=>`<button data-act="go" data-v="${l.id}" aria-current="${l.id===state.id}"><span class="ck ${store.progress[l.id]?.done?'done':''}">${store.progress[l.id]?.done?'✓':l.stages?'★':LESSONS.indexOf(l)+1}</span><span>${esc(T(l.title))}</span><span class="cmd">${esc(l.cmd)}</span></button>`).join('')}`).join('');
}
function renderAll(){renderTopbar();renderSidebar();renderEditor();renderTerminal();renderMission();renderStatus();}
function toast(text,kind='ok'){
 const box=$('#toasts'),el=document.createElement('div');el.className='toast '+kind;el.textContent=text;box.append(el);
 setTimeout(()=>el.remove(),kind==='info'?6000:3000);
 while(box.children.length>3)box.firstChild.remove();
}

/** Two-click confirmation (browser dialogs are blocked in some embeds). */
function armed(el,message){
 if(el.dataset.armed&&Date.now()-Number(el.dataset.armed)<4000){delete el.dataset.armed;return true;}
 el.dataset.armed=String(Date.now());toast(message,'info');return false;
}

/* ------------------------------------------------------------ events */
document.addEventListener('click',e=>{
 const gh=e.target.closest('[data-gh]');
 if(gh){const res=githubClick(state,ui.gh,gh.dataset.gh,gh.dataset.v,$('#editor'),{lang:lang(),onPR:pr=>reviewPullRequest(state,pr)});if(res){if(res.toast)toast(res.toast,res.changed?'ok':'info');if(res.changed)afterChange();renderEditor();}return;}
 const el=e.target.closest('[data-act]');
 if(!el){if(e.target.closest('#term')&&!window.getSelection().toString())focusInput();return;}
 const act=el.dataset.act;
 if(act==='dir'){const p=el.dataset.path;if(ui.expanded.has(p))ui.expanded.delete(p);else ui.expanded.add(p);renderSidebar();return;}
 if(act==='open'||act==='tab'){openFile(el.dataset.path);return;}
 if(act==='close'){const p=el.dataset.path;if(ui.buffers[p]?.dirty&&!armed(el,L('Unsaved changes — click × again to discard them.','有未保存的修改——再点一次 × 放弃修改。')))return;ui.tabs=ui.tabs.filter(x=>x!==p);delete ui.buffers[p];if(ui.active===p)ui.active=ui.tabs.at(-1)||null;renderEditor();renderSidebar();return;}
 if(act==='github'){ui.active='github';renderEditor();return;}
 if(act==='save'){save();return;}
 if(act==='resolve'){resolveConflicts(el.dataset.v);return;}
 if(act==='hint'||act==='answer'){ui.reveal[act]=!ui.reveal[act];renderMission();return;}
 if(act==='paste'){const s=stepsOf(lessonById(state.id))[state.step];const i=$('#cmd');i.value=s.answer;i.focus();return;}
 if(act==='action'){const s=stepsOf(lessonById(state.id))[state.step];s.action.run(state.world);toast('✨ '+T(s.action.label),'info');afterChange();return;}
 if(act==='next'){openLesson(LESSONS[index()+1].id);return;}
 if(act==='outline'){ui.outline=!ui.outline;renderOutline();return;}
 if(act==='go'){ui.outline=false;renderOutline();openLesson(el.dataset.v);return;}
 if(act==='side'){ui.side=el.dataset.v;return;}
});
document.addEventListener('change',e=>{
 const g=e.target.closest('[data-gh-change]');
 if(g){githubChange(state,ui.gh,g.dataset.ghChange,g.value);renderEditor();return;}
 if(e.target.id==='lesson-select')openLesson(e.target.value);
});
document.addEventListener('input',e=>{const g=e.target.closest('[data-gh-input]');if(g&&ui.gh.form){ui.gh.form[g.dataset.ghInput]=g.value;if(g.dataset.ghInput==='title')ui.gh.form.titleTouched=true;}if(e.target.id==='cmd')ui.draft=e.target.value;});
document.addEventListener('keydown',e=>{
 if(e.target.id==='cmd'){onKey(e);return;}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'&&ui.active&&ui.active!=='github'){e.preventDefault();save();}
 if(e.key==='Escape'&&ui.outline){ui.outline=false;renderOutline();}
});
window.addEventListener('beforeunload',persist);
window.addEventListener('hashchange',()=>{const id=location.hash.slice(1);if(id&&id!==state?.id&&lessonById(id))openLesson(id);});

function wireChrome(){
 $('#prev').onclick=()=>openLesson(LESSONS[index()-1].id);
 $('#next').onclick=()=>openLesson(LESSONS[index()+1].id);
 $('#reset').onclick=e=>{if(armed(e.currentTarget,L('Click Reset again to start this lesson over.','再点一次“重新开始”，从头开始这一课。'))){localStorage.removeItem(RUN+state.id);if(store.progress[state.id]&&!store.progress[state.id].done)delete store.progress[state.id];openLesson(state.id,{fresh:true});}};
 $('#theme').onclick=()=>{store.theme=theme()==='dark'?'light':'dark';persist();renderTopbar();};
 $('#lang').onclick=()=>{store.lang=lang()==='zh'?'en':'zh';persist();renderAll();};
 $('#outline-btn').onclick=()=>{ui.outline=!ui.outline;renderOutline();};
 const split=$('#splitter'),center=$('.center');
 split.addEventListener('pointerdown',e=>{split.setPointerCapture(e.pointerId);const move=ev=>{const r=center.getBoundingClientRect();const h=Math.max(140,Math.min(r.height-120,r.bottom-ev.clientY));center.style.setProperty('--term-h',h+'px');};split.addEventListener('pointermove',move);split.addEventListener('pointerup',()=>split.removeEventListener('pointermove',move),{once:true});});
 if(window.self!==window.top){$('#back').target='_top';document.body.classList.add('embedded');}
}
const gitSync=createWorkspaceSync({fields:['gitProgress'],namespace:'git',storage:localStorage,getState:()=>({gitProgress:store.progress}),request:requestWorkspace,apply:next=>{store.progress=next.gitProgress||{};try{localStorage.setItem(STORE,JSON.stringify(store));}catch{/* Progress remains in memory. */}if(state)renderAll();}});
if(gitAccount)await gitSync.start(gitAccount.id,{hasLocalData:!!load(STORE)});
window.addEventListener('focus',()=>{if(gitAccount)void gitSync.sync();});
window.addEventListener('online',()=>{if(gitAccount)void gitSync.sync();});
setInterval(()=>{if(gitAccount&&!document.hidden)void gitSync.sync();},15000);
wireChrome();
openLesson(location.hash.slice(1)||store.current||LESSONS[0].id);

window.addEventListener('storage',event=>{if(event.key===STORE){store.progress=readGitProgress();if(state)renderAll();}});
window.addEventListener('forma-workspace-synced',()=>{store.progress=readGitProgress();if(state)renderAll();});
