// A small GitHub in the browser tab: repository files, commits, branches,
// tags and pull requests (create, review, merge, delete branch), reading the
// same simulated server that push, fetch and clone talk to.
import {commitOf,short,subject,treeFiles,revList,isAncestor,mergeBase} from '../git-engine/core.js';
import {openPullRequest,prMergeable,mergePullRequest} from '../git-engine/server.js';
import {changes,commitTexts,textOf} from '../git-engine/util.js';
import {hunks,hunkBody} from '../git-engine/diff.js';
import {ago} from '../git-engine/format.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const servers=world=>Object.values(world.servers);
const heads=s=>Object.keys(s.refs).filter(k=>k.startsWith('refs/heads/')).map(k=>k.slice(11)).sort((a,b)=>a===s.head?-1:b===s.head?1:a<b?-1:1);
const tags=s=>Object.keys(s.refs).filter(k=>k.startsWith('refs/tags/')).map(k=>k.slice(10)).sort();
const tip=(s,b)=>s.refs['refs/heads/'+b];
const peelTag=(world,id)=>{let o=world.objects[id];while(o?.t==='tag'){id=o.obj;o=world.objects[id];}return id;};
const login=(who)=>who==='Alice Wang'?'alice-wang':String(who||'').toLowerCase().replace(/\s+/g,'-');
const icon={
 repo:'<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/></svg>',
 dir:'<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1.75 1A1.75 1.75 0 0 0 0 2.75v10.5C0 14.216.784 15 1.75 15h12.5A1.75 1.75 0 0 0 16 13.25v-8.5A1.75 1.75 0 0 0 14.25 3H7.5a.25.25 0 0 1-.2-.1l-.9-1.2C6.07 1.26 5.55 1 5 1H1.75Z"/></svg>',
 file:'<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z"/></svg>',
 pr:'<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354Z"/></svg>',
 merged:'<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.95-.218Z"/></svg>',
 check:'<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"/></svg>',
 commit:'<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M11.93 8.5a4.002 4.002 0 0 1-7.86 0H.75a.75.75 0 0 1 0-1.5h3.32a4.002 4.002 0 0 1 7.86 0h3.32a.75.75 0 0 1 0 1.5Zm-1.43-.75a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Z"/></svg>',
};

/** Text for both languages. */
const L=(lang,en,zh)=>lang==='zh'?zh:en;
export function defaultGithubView(world){const s=servers(world)[0];return {repo:s?s.url:null,tab:'code',branch:s?.head||'main',pr:null,path:'',form:null};}

export function githubHTML(state,ui,lang){
 const world=state.world;
 const list=servers(world);
 if(!list.length)return `<div class="gh"><div class="gh-empty"><h2>GitHub</h2><p>${L(lang,'This lesson has no GitHub repository.','这一课没有 GitHub 仓库。')}</p></div></div>`;
 const s=list.find(x=>x.url===ui.repo)||list[0];ui.repo=s.url;
 if(!tip(s,ui.branch))ui.branch=s.head;
 const prs=s.prs,open=prs.filter(p=>p.state==='open').length;
 const urlPath=ui.tab==='pulls'&&ui.pr?`/pull/${ui.pr}`:ui.tab==='pulls'?(ui.form?`/compare/${ui.form.base}...${ui.form.head}`:'/pulls'):ui.tab==='commits'?`/commits/${ui.branch}`:ui.tab==='branches'?'/branches':ui.tab==='tags'?'/tags':ui.path?`/blob/${ui.branch}/${ui.path}`:'';
 const tab=(id,label,count)=>`<button role="tab" data-gh="tab" data-v="${id}" aria-selected="${ui.tab===id}">${label}${count!=null?` <span class="gh-count">${count}</span>`:''}</button>`;
 const repoPicker=list.length>1?`<select class="gh-select" data-gh-change="repo" aria-label="Repository">${list.map(x=>`<option value="${esc(x.url)}" ${x===s?'selected':''}>${esc(x.owner)}/${esc(x.name)}</option>`).join('')}</select>`:'';
 let body='';
 if(ui.tab==='code')body=codeView(world,s,ui,lang);
 else if(ui.tab==='commits')body=commitsView(world,s,ui,lang);
 else if(ui.tab==='branches')body=branchesView(world,s,ui,lang);
 else if(ui.tab==='tags')body=tagsView(world,s,lang);
 else if(ui.tab==='pulls')body=ui.pr?prView(world,s,s.prs.find(p=>p.number===ui.pr),ui,lang):ui.form?compareView(world,s,ui,lang):pullsView(world,s,lang);
 return `<div class="gh" data-gh-root>
  <div class="gh-bar"><span>🔒</span><span class="url">https://github.com/${esc(s.owner)}/${esc(s.name)}${esc(urlPath)}</span>${repoPicker}</div>
  <div class="gh-head"><div class="gh-repo">${icon.repo}<span class="owner">${esc(s.owner)}</span> / <strong>${esc(s.name)}</strong><span class="gh-pill">Public</span></div>
   ${s.description?`<p class="muted" style="margin:6px 0 0;font-size:14px">${esc(s.description)}</p>`:''}
   <nav class="gh-tabs" role="tablist">${tab('code','&lt;&gt; Code')}${tab('pulls',icon.pr+' Pull requests',open)}${tab('commits',L(lang,'Commits','提交'),null)}${tab('branches',L(lang,'Branches','分支'),heads(s).length)}${tab('tags',L(lang,'Tags','标签'),tags(s).length)}</nav></div>
  <div class="gh-body">${body}</div></div>`;
}
function branchSelect(s,ui,action='branch'){return `<select class="gh-select" data-gh-change="${action}" aria-label="Branch">${heads(s).map(b=>`<option ${b===ui.branch?'selected':''}>${esc(b)}</option>`).join('')}</select>`;}
function recentPushes(world,s){
 const seen=new Set(),out=[];
 for(const e of [...s.events].reverse()){
  if(e.type!=='push'||e.by!=='you'||!e.ref?.startsWith('refs/heads/'))continue;
  const b=e.ref.slice(11);if(b===s.head||seen.has(b))continue;seen.add(b);
  if(!tip(s,b)||s.prs.some(p=>p.head===b&&p.state!=='closed'))continue;
  if(isAncestor(world,tip(s,b),tip(s,s.head))||tip(s,b)===tip(s,s.head))continue;
  out.push(b);
 }
 return out.slice(0,2);
}
function codeView(world,s,ui,lang){
 if(!heads(s).length)return `<div class="gh-box"><div class="gh-empty"><h2>${L(lang,'This repository is empty','这个仓库还是空的')}</h2><p>${L(lang,'…or push an existing repository from the command line','……或者从命令行推送一个已有的仓库')}</p><pre class="gh-diff gh-code">git remote add origin ${esc(s.url)}\ngit branch -M ${esc(s.head)}\ngit push -u origin ${esc(s.head)}</pre></div></div>`;
 const id=tip(s,ui.branch),c=commitOf(world,id),files=treeFiles(world,id);
 const banners=recentPushes(world,s).map(b=>`<div class="gh-banner"><span>${icon.pr}</span><span><b>${esc(b)}</b> ${L(lang,'had recent pushes','有新的推送')}</span><span style="flex:1"></span><button class="gh-btn green" data-gh="compare" data-v="${esc(b)}">${L(lang,'Compare & pull request','Compare & pull request')}</button></div>`).join('');
 if(ui.path&&files[ui.path]!==undefined){
  const text=textOf(world,files[ui.path]);
  return `${banners}<p><span class="link" data-gh="path" data-v="">${esc(s.name)}</span> / ${esc(ui.path)}</p><div class="gh-box"><div class="gh-box-head">${branchSelect(s,ui)}<span class="mono">${text.split('\n').length-1} lines</span></div><pre class="gh-diff" style="padding:10px 14px;margin:0">${esc(text)}</pre></div>`;
 }
 const dir=ui.path;
 const entries=new Map();
 for(const f of Object.keys(files)){if(dir&&!f.startsWith(dir+'/'))continue;const rest=dir?f.slice(dir.length+1):f,i=rest.indexOf('/');entries.set(i<0?rest:rest.slice(0,i),i>=0);}
 const sorted=[...entries].sort((a,b)=>a[1]!==b[1]?(a[1]?-1:1):a[0].toLowerCase()<b[0].toLowerCase()?-1:1);
 const total=revList(world,[id]).length;
 const readme=!dir&&Object.keys(files).find(f=>/^readme\.md$/i.test(f));
 return `${banners}
  <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap">${branchSelect(s,ui)}<span class="muted" style="font-size:13px">${heads(s).length} ${L(lang,'branches','个分支')} · ${tags(s).length} ${L(lang,'tags','个标签')}</span></div>
  <div class="gh-box"><div class="gh-box-head"><b>${esc(c.author.name)}</b><span style="flex:1;min-width:120px">${esc(subject(c.msg))}</span><span class="mono muted">${short(id)}</span><span class="muted">${ago(c.committer.time)}</span><span class="link" data-gh="tab" data-v="commits">${icon.commit} ${total} ${L(lang,'commits','个提交')}</span></div>
   ${dir?`<div class="gh-row"><span class="link" data-gh="path" data-v="${esc(dir.includes('/')?dir.slice(0,dir.lastIndexOf('/')):'')}">..</span></div>`:''}
   ${sorted.map(([n,isDir])=>`<div class="gh-row">${isDir?icon.dir:icon.file}<span class="link" data-gh="path" data-v="${esc((dir?dir+'/':'')+n)}">${esc(n)}</span></div>`).join('')}</div>
  ${readme?`<div class="gh-box"><div class="gh-box-head"><b>README.md</b></div><div class="gh-readme">${markdown(textOf(world,files[readme]))}</div></div>`:''}`;
}
function markdown(md){
 const out=[];let code=false,buf=[];
 for(const line of md.split('\n')){
  if(/^ {4}/.test(line)&&!code){buf.push(line.slice(4));continue;}
  if(buf.length){out.push(`<pre>${esc(buf.join('\n'))}</pre>`);buf=[];}
  if(/^# /.test(line))out.push(`<h1>${esc(line.slice(2))}</h1>`);else if(/^## /.test(line))out.push(`<h2>${esc(line.slice(3))}</h2>`);else if(/^- /.test(line))out.push(`<li>${esc(line.slice(2))}</li>`);else if(line.trim())out.push(`<p>${esc(line)}</p>`);
 }
 if(buf.length)out.push(`<pre>${esc(buf.join('\n'))}</pre>`);
 return out.join('');
}
function commitsView(world,s,ui,lang){
 if(!heads(s).length)return `<div class="gh-empty">${L(lang,'No commits yet.','还没有提交。')}</div>`;
 const ids=revList(world,[tip(s,ui.branch)]).sort((a,b)=>commitOf(world,b).committer.time-commitOf(world,a).committer.time);
 return `<div style="margin-bottom:12px">${branchSelect(s,ui)}</div><div class="gh-box">${ids.map(id=>{const c=commitOf(world,id);return `<div class="gh-row"><div style="flex:1;min-width:0"><div><b>${esc(subject(c.msg))}</b></div><div class="muted" style="font-size:12px">${esc(c.author.name)} ${L(lang,'committed','提交于')} ${ago(c.committer.time)}${c.parents.length>1?' · merge':''}</div></div><span class="mono gh-pill">${short(id)}</span></div>`;}).join('')}</div>`;
}
function branchesView(world,s,ui,lang){
 if(!heads(s).length)return `<div class="gh-empty">${L(lang,'No branches yet.','还没有分支。')}</div>`;
 const base=tip(s,s.head);
 return `<div class="gh-box"><div class="gh-box-head"><b>${L(lang,'Branches','分支')}</b></div>${heads(s).map(b=>{const id=tip(s,b),c=commitOf(world,id),ahead=revList(world,[id],[base]).length,behind=revList(world,[base],[id]).length,pr=s.prs.find(p=>p.head===b);return `<div class="gh-row"><span class="mono gh-ref">${esc(b)}</span>${b===s.head?`<span class="gh-pill">default</span>`:''}<span class="muted" style="flex:1;font-size:12px">${L(lang,'Updated','更新于')} ${ago(c.committer.time)} · ${esc(c.author.name)}</span>${b===s.head?'':`<span class="muted mono">${behind}|${ahead}</span>`}${b===s.head?'':pr?`<span class="link" data-gh="openpr" data-v="${pr.number}">#${pr.number}</span>`:`<button class="gh-btn" data-gh="compare" data-v="${esc(b)}">${L(lang,'New pull request','New pull request')}</button>`}${b===s.head?'':`<button class="gh-btn" data-gh="delbranch" data-v="${esc(b)}" title="Delete">🗑</button>`}</div>`;}).join('')}</div>`;
}
function tagsView(world,s,lang){
 const list=tags(s);
 if(!list.length)return `<div class="gh-empty"><h2>${L(lang,'There aren’t any releases here','这里还没有版本')}</h2><p>${L(lang,'Push a tag with git push origin <tag>.','用 git push origin <tag> 推送标签。')}</p></div>`;
 return `<div class="gh-box">${list.map(t=>{const raw=s.refs['refs/tags/'+t],id=peelTag(world,raw),o=world.objects[raw];return `<div class="gh-row"><b>${esc(t)}</b><span class="muted" style="flex:1;font-size:12px">${o?.t==='tag'?esc(subject(o.msg))+' · ':''}${ago(commitOf(world,id).committer.time)}</span><span class="mono gh-pill">${short(id)}</span></div>`;}).join('')}</div>`;
}
function pullsView(world,s,lang){
 return `<div style="display:flex;justify-content:flex-end;margin-bottom:12px"><button class="gh-btn green" data-gh="compare" data-v="">${L(lang,'New pull request','New pull request')}</button></div>
 <div class="gh-box"><div class="gh-box-head">${icon.pr} ${s.prs.filter(p=>p.state==='open').length} Open · ${icon.check} ${s.prs.filter(p=>p.state!=='open').length} Closed</div>
 ${s.prs.length?[...s.prs].reverse().map(p=>`<div class="gh-row"><span class="${p.state==='open'?'gh-ok':'gh-purple'}">${p.state==='open'?icon.pr:icon.merged}</span><div style="flex:1"><span class="link" data-gh="openpr" data-v="${p.number}"><b>${esc(p.title)}</b></span><div class="muted" style="font-size:12px">#${p.number} ${L(lang,'opened by','由')} ${esc(p.author)}${lang==='zh'?' 创建':''} · ${esc(p.head)} → ${esc(p.base)}${p.reviews.some(r=>r.state==='approved')?` · <span class="gh-ok">${L(lang,'Approved','已批准')}</span>`:''}</div></div></div>`).join(''):`<div class="gh-empty"><h2>${L(lang,'Welcome to pull requests!','欢迎使用 Pull Request！')}</h2><p>${L(lang,'Pull requests help you review a branch before it is merged into main.','Pull Request 让团队在分支合并进 main 之前先进行审查。')}</p></div>`}</div>`;
}
function compareView(world,s,ui,lang){
 const f=ui.form,bs=heads(s);
 if(!f.head||f.head===f.base)f.head=bs.find(b=>b!==f.base)||'';
 const base=tip(s,f.base),head=tip(s,f.head);
 const commits=head?revList(world,[head],[base]).sort((a,b)=>commitOf(world,a).committer.time-commitOf(world,b).committer.time):[];
 const files=head?changes(commitTexts(world,mergeBase(world,base,head)),commitTexts(world,head)):[];
 const can=head&&commits.length;
 const ok=can&&prMergeable(world,s,{base:f.base,head:f.head}).ok;
 if(!f.titleTouched&&commits.length)f.title=commits.length===1?subject(commitOf(world,commits[0]).msg):f.head.replace(/[-/_]/g,' ').replace(/^\w/,c=>c.toUpperCase());
 const sel=(key,val)=>`<select class="gh-select" data-gh-change="form-${key}">${bs.map(b=>`<option ${b===val?'selected':''}>${esc(b)}</option>`).join('')}</select>`;
 return `<h2 style="font-size:24px;font-weight:400;margin:0 0 4px">${L(lang,'Open a pull request','创建 Pull Request')}</h2><p class="muted" style="margin:0 0 14px">${L(lang,'Choose two branches to see what’s changed or to start a new pull request.','选择两个分支，查看改动或创建新的 Pull Request。')}</p>
 <div class="gh-box"><div class="gh-box-head">base: ${sel('base',f.base)} ← compare: ${sel('head',f.head)} ${can?(ok?`<span class="gh-ok">✓ Able to merge.</span> <span class="muted">These branches can be automatically merged.</span>`:`<span class="gh-bad">✗ Can’t automatically merge.</span>`):''}</div>
 ${can?`<div style="padding:14px;display:flex;flex-direction:column;gap:10px"><input class="gh-input" data-gh-input="title" value="${esc(f.title||'')}" aria-label="Title"><textarea class="gh-input" data-gh-input="body" placeholder="${L(lang,'Add a description','添加描述')}" aria-label="Description">${esc(f.body||'')}</textarea><div><button class="gh-btn green" data-gh="createpr">${L(lang,'Create pull request','Create pull request')}</button></div></div>`:`<div class="gh-empty">${head?L(lang,'There isn’t anything to compare. ','没有可以比较的内容。')+esc(f.base)+L(lang,' and ',' 和 ')+esc(f.head)+L(lang,' are identical.',' 完全相同。'):L(lang,'Push a branch first.','请先推送一个分支。')}</div>`}</div>
 ${can?`<p class="muted">${icon.commit} ${commits.length} commit${commits.length===1?'':'s'} · ${files.length} file${files.length===1?'':'s'} changed</p>${diffBox(files)}`:''}`;
}
function diffBox(files){
 return files.map(c=>{const hs=c.status==='R'?[]:hunks(c.a,c.b);return `<div class="gh-box"><div class="gh-box-head mono">${esc(c.from?c.from+' → ':'')}${esc(c.path)}</div><div class="gh-diff">${hs.map(h=>`<div class="hunk">${esc(h.header)}</div>${hunkBody(h).map(([t,l])=>`<div class="${t==='+'?'add':t==='-'?'del':''}">${esc(t+l)}</div>`).join('')}`).join('')||'<div class="muted" style="padding:6px">renamed</div>'}</div></div>`;}).join('');
}
function prView(world,s,pr,ui,lang){
 if(!pr)return '';
 const state=pr.state==='merged'?`<span class="gh-state merged">${icon.merged} Merged</span>`:`<span class="gh-state open">${icon.pr} Open</span>`;
 const base=tip(s,pr.base),head=tip(s,pr.head)??pr.headTip;
 const commits=head?revList(world,[head],[pr.state==='merged'?commitOf(world,pr.mergeCommit).parents[0]:base]):[];
 const check=pr.state==='open'?prMergeable(world,s,pr):{ok:false};
 const approved=pr.reviews.some(r=>r.state==='approved');
 const files=head?changes(commitTexts(world,mergeBase(world,pr.state==='merged'?commitOf(world,pr.mergeCommit).parents[0]:base,head)),commitTexts(world,head)):[];
 let mergeBox;
 if(pr.state==='merged')mergeBox=`<div class="gh-merge"><div><b class="gh-purple">${L(lang,'Pull request successfully merged and closed','Pull Request 已成功合并并关闭')}</b></div><div class="muted">${L(lang,`You’re all set — the ${esc(pr.head)} branch can be safely deleted.`,`一切就绪——可以安全删除 ${esc(pr.head)} 分支。`)}</div>${tip(s,pr.head)?`<div><button class="gh-btn" data-gh="delbranch" data-v="${esc(pr.head)}">${L(lang,'Delete branch','Delete branch')}</button></div>`:`<div class="muted">${L(lang,'Branch deleted.','分支已删除。')}</div>`}</div>`;
 else mergeBox=`<div class="gh-merge"><div>${approved?`<span class="gh-ok">${icon.check} ${L(lang,'Changes approved','改动已批准')}</span><div class="muted" style="font-size:13px">${L(lang,'1 approving review by a reviewer with write access.','1 位有写权限的审查者已批准。')}</div>`:`<span class="muted">${L(lang,'Review required','需要审查')}</span>`}</div>
  <div>${check.ok?`<span class="gh-ok">${icon.check} ${L(lang,'This branch has no conflicts with the base branch','该分支与目标分支没有冲突')}</span>`:check.reason==='conflict'?`<span class="gh-bad">✗ ${L(lang,'This branch has conflicts that must be resolved','该分支有冲突，必须先解决')}</span><div class="muted" style="font-size:13px">${L(lang,`Merge ${esc(pr.base)} into ${esc(pr.head)} locally, fix the conflicts and push again.`,`在本地把 ${esc(pr.base)} 合并进 ${esc(pr.head)}，解决冲突后重新推送。`)}</div>`:check.reason==='merged'?`<span class="muted">${L(lang,'Nothing left to merge.','没有需要合并的内容。')}</span>`:''}</div>
  <div><button class="gh-btn green" data-gh="mergepr" data-v="${pr.number}" ${check.ok&&approved?'':'disabled'}>${L(lang,'Merge pull request','Merge pull request')}</button></div></div>`;
 return `<p><span class="link" data-gh="tab" data-v="pulls">← Pull requests</span></p>
 <h2 style="font-size:26px;font-weight:400;margin:0 0 8px">${esc(pr.title)} <span class="muted">#${pr.number}</span></h2>
 <p style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">${state}<span class="muted"><b>${esc(pr.author)}</b> ${pr.state==='merged'?L(lang,'merged','合并了'):L(lang,'wants to merge','请求合并')} ${commits.length} commit${commits.length===1?'':'s'} ${L(lang,'into','到')} <span class="mono gh-ref">${esc(pr.base)}</span> ${L(lang,'from','来自')} <span class="mono gh-ref">${esc(pr.head)}</span></span></p>
 <div class="gh-comment"><div class="gh-box-head"><b>${esc(pr.author)}</b> <span class="muted">${L(lang,'commented','评论')}</span></div><div style="padding:12px 14px">${pr.body?esc(pr.body).replace(/\n/g,'<br>'):`<span class="muted">${L(lang,'No description provided.','没有填写描述。')}</span>`}</div></div>
 <div class="gh-timeline">${commits.sort((a,b)=>commitOf(world,a).committer.time-commitOf(world,b).committer.time).map(id=>`<div class="gh-event">${icon.commit} <span class="muted">${esc(commitOf(world,id).author.name)}</span> ${esc(subject(commitOf(world,id).msg))} <span class="mono muted">${short(id)}</span></div>`).join('')}
 ${pr.reviews.map(r=>`<div class="gh-event">${icon.check} <b>${esc(r.login||login(r.by))}</b> ${L(lang,'approved these changes','批准了这些改动')}<div class="gh-comment" style="margin-top:8px"><div style="padding:10px 14px">${esc(r.body?.[lang]??r.body?.en??'')}</div></div></div>`).join('')}
 ${pr.state==='merged'?`<div class="gh-event">${icon.merged} <b>${esc(pr.mergedBy||'alice-wang')}</b> ${L(lang,'merged commit','合并了提交')} <span class="mono">${short(pr.mergeCommit)}</span> ${L(lang,'into','到')} ${esc(pr.base)}</div>`:''}</div>
 ${mergeBox}
 <h3 style="margin:20px 0 10px;font-size:16px">${L(lang,'Files changed','修改的文件')} <span class="gh-count">${files.length}</span></h3>${diffBox(files)}`;
}

/** Handles a click in the GitHub page. Returns {toast?, changed} when something happened. */
export function githubClick(state,ui,action,value,root,{onPR,lang}){
 const world=state.world,s=servers(world).find(x=>x.url===ui.repo)||servers(world)[0];
 if(!s)return null;
 if(action==='tab'){ui.tab=value;ui.pr=null;ui.form=null;ui.path='';return {};}
 if(action==='path'){ui.path=value;return {};}
 if(action==='openpr'){ui.tab='pulls';ui.pr=Number(value);ui.form=null;return {};}
 if(action==='compare'){ui.tab='pulls';ui.pr=null;ui.form={base:s.head,head:value||'',title:'',body:''};return {};}
 if(action==='createpr'){
  const f=ui.form,title=root.querySelector('[data-gh-input="title"]')?.value.trim()||f.title,body=root.querySelector('[data-gh-input="body"]')?.value||'';
  if(!title)return {toast:L(lang,'Add a title first.','请先填写标题。')};
  if(s.prs.some(p=>p.head===f.head&&p.base===f.base&&p.state==='open'))return {toast:L(lang,'A pull request for this branch already exists.','这个分支已经有一个打开的 Pull Request。')};
  const pr=openPullRequest(world,s,{head:f.head,base:f.base,title,body,author:'alice-wang'});
  s.events.push({type:'pr',number:pr.number,by:'you'});
  onPR?.(pr);
  ui.form=null;ui.pr=pr.number;
  return {changed:true,toast:L(lang,`Opened pull request #${pr.number}`,`已创建 Pull Request #${pr.number}`)};
 }
 if(action==='mergepr'){
  const pr=s.prs.find(p=>p.number===Number(value));
  const g=world.global,user={name:g['user.name']||'Alice Wang',email:g['user.email']||'alice@example.com'};
  const res=mergePullRequest(world,s,pr,{user});
  if(!res.ok)return {toast:L(lang,'This pull request cannot be merged.','这个 Pull Request 无法合并。')};
  pr.headTip=tip(s,pr.head);pr.mergedBy='alice-wang';
  return {changed:true,toast:L(lang,`Merged pull request #${pr.number} into ${pr.base}`,`已把 Pull Request #${pr.number} 合并到 ${pr.base}`)};
 }
 if(action==='delbranch'){
  if(value===s.head)return null;
  const pr=s.prs.find(p=>p.head===value);if(pr)pr.headTip=tip(s,value);
  delete s.refs['refs/heads/'+value];s.events.push({type:'delete',ref:'refs/heads/'+value,by:'you'});
  if(ui.branch===value)ui.branch=s.head;
  return {changed:true,toast:L(lang,`Deleted branch ${value}`,`已删除分支 ${value}`)};
 }
 return null;
}
export function githubChange(state,ui,key,value){
 if(key==='repo'){ui.repo=value;ui.tab='code';ui.pr=null;ui.form=null;ui.path='';return;}
 if(key==='branch'){ui.branch=value;ui.path='';return;}
 if(key.startsWith('form-')&&ui.form){ui.form[key.slice(5)]=value;ui.form.titleTouched=false;}
}
export {login};
