import {gitMilestones,GIT_DRILLS,GIT_SITUATIONS,scenarioById,scenarioTasks} from './git-sim.js';

/** Ready-made commands, so a learner can start without memorising syntax. */
export const gitPresets=[
 'git status',
 'git add .',
 'git commit -m "Clarify the sign-up form"',
 'git log --oneline --graph',
 'git switch -c feature/form',
 'git switch main',
 'git merge feature/form',
 'git stash',
 'git stash pop',
 'git diff --staged',
 'git remote -v',
 'git push',
 'git pull',
 'git help'
];

/** Commit graph with one lane per branch and an edge per parent link. */
function gitGraph(z,h){
 const {e,L}=h;
 const lanes=[...new Set(['main',...z.commits.map(c=>c.branch),...Object.keys(z.branches)])];
 const width=Math.max(660,z.commits.length*110+130),height=80+lanes.length*80;
 const xy=c=>({x:90+z.commits.indexOf(c)*110,y:45+Math.max(0,lanes.indexOf(c.branch))*80});
 return `<div class="lab-graph-scroll"><svg class="git-dag" viewBox="0 0 ${width} ${height}" style="min-width:${width}px" role="img" aria-label="${L('Commit graph with every parent link','显示所有父连接的提交图','顯示所有父連接的提交圖')}">${lanes.map((name,i)=>`<text x="6" y="${49+i*80}" class="graph-label">${e(name)}</text><path d="M80 ${45+i*80}H${width}" class="lane-line"/>`).join('')}${z.commits.flatMap(c=>c.parents.filter(Boolean).map((parent,i)=>{const p=z.commits.find(x=>x.id===parent);if(!p)return '';const a=xy(c),b=xy(p);return `<path d="M${a.x} ${a.y} C${a.x-40} ${a.y} ${b.x+40} ${b.y} ${b.x} ${b.y}" class="parent-edge ${i?'merge-edge':''}"/>`;})).join('')}${z.commits.map(c=>{const a=xy(c),heads=Object.entries(z.branches).filter(([,tip])=>tip===c.id).map(([name])=>name).join(', '),tags=Object.entries(z.tags??{}).filter(([,tip])=>tip===c.id).map(([name])=>'tag: '+name).join(', ');return `<g><title>${e(c.message)}${heads?' · '+e(heads):''}</title><circle cx="${a.x}" cy="${a.y}" r="9" class="commit-dot"/><text x="${a.x}" y="${a.y+25}" text-anchor="middle" class="graph-label">${e(c.id.slice(0,7))}</text>${heads||tags?`<text x="${a.x}" y="${a.y-17}" text-anchor="middle" class="graph-label">${e([heads,tags].filter(Boolean).join(' · '))}</text>`:''}</g>`;}).join('')}</svg></div>`;
}
/** Working tree, index and conflict state, in the order Git reports them. */
function gitState(z,h){
 const {e,L}=h;
 const head=z.head.detached?z.head.name:z.branches[z.head.name];
 const tree=head?(z.commits.find(c=>c.id===head)?.tree??{}):{};
 const added=Object.keys(z.index).filter(p=>!(p in tree));
 const modified=Object.keys(z.index).filter(p=>(p in tree)&&z.index[p]!==tree[p]);
 const deleted=Object.keys(tree).filter(p=>!(p in z.index));
 const unstaged=Object.keys(z.index).filter(p=>(p in z.files)&&z.files[p]!==z.index[p]);
 const untracked=Object.keys(z.files).filter(p=>!(p in z.index));
 const row=(label,paths)=>paths.length?`<p><strong>${label}</strong><br>${paths.map(p=>e(p)).join('<br>')}</p>`:'';
 const clean=!added.length&&!modified.length&&!deleted.length&&!unstaged.length&&!untracked.length&&!z.conflict;
 return `<div class="git-state"><div><h3>${L('Where you are','当前状态','目前狀態')}</h3><p>${L('Branch','分支','分支')}: <strong>${e(z.head.detached?L('detached HEAD','游离 HEAD','游離 HEAD'):z.head.name)}</strong>${z.head.detached?` (${e(z.head.name.slice(0,7))})`:''}</p><p>${L('Commits','提交数','提交數')}: ${z.commits.length} · ${L('Branches','分支数','分支數')}: ${Object.keys(z.branches).length} · ${L('Remotes','远程数','遠端數')}: ${Object.keys(z.remotes).length}</p>${z.conflict?`<p class="callout warning">${L('A merge is waiting: resolve each file, then git add and git commit.','有一个合并待完成：解决每个文件后运行 git add 与 git commit。','有一個合併待完成：解決每個檔案後執行 git add 與 git commit。')}</p>`:''}</div><div><h3>${L('Index and working tree','暂存区与工作区','暫存區與工作區')}</h3>${z.conflict?row(L('Unmerged','冲突未解决','衝突未解決'),z.conflict.paths):''}${row(L('Staged (new)','已暂存（新增）','已暫存（新增）'),added)}${row(L('Staged (modified)','已暂存（修改）','已暫存（修改）'),modified)}${row(L('Staged (deleted)','已暂存（删除）','已暫存（刪除）'),deleted)}${row(L('Not staged','未暂存','未暫存'),unstaged)}${row(L('Untracked','未跟踪','未追蹤'),untracked)}${clean?'<p>'+L('Nothing to commit, working tree clean.','没有待提交内容，工作区干净。','沒有待提交內容，工作區乾淨。')+'</p>':''}</div></div>`;
}

function gitFileEditor(z,h){
 const {e,L,button,option}=h;
 const paths=Object.keys(z.files).sort();
 const selected=paths.includes(z.selectedFile)?z.selectedFile:(paths[0]??'');
 const conflicted=!!selected&&/^(<{7}|={7}|>{7})/m.test(String(z.files[selected]??''));
 return `<div class="git-files"><div class="form-grid"><div class="field"><label for="git-file">${L('Working tree file','工作区文件','工作區檔案')}</label><select id="git-file">${paths.map(p=>option(p,p,selected)).join('')||`<option value="">${L('No files yet','还没有文件','還沒有檔案')}</option>`}</select></div><div class="field"><label for="git-new-file">${L('New file path','新文件路径','新檔案路徑')}</label><input id="git-new-file" placeholder="src/format.js" maxlength="80"></div></div>${conflicted?`<div class="callout warning"><p>${L('This file still has conflict markers. Edit them out by hand, or resolve the whole file in one click:','这个文件还有冲突标记。可以手动删掉，也可以一键解决整个文件：','這個檔案還有衝突標記。可以手動刪掉，也可以一鍵解決整個檔案：')}</p><div class="row">${button('gitcli-resolve-file',L('Keep current','保留当前','保留目前'),'data-choice="ours"',false)}${button('gitcli-resolve-file',L('Keep incoming','保留来源','保留來源'),'data-choice="theirs"')}${button('gitcli-resolve-file',L('Combine both','综合两边','整合兩邊'),'data-choice="both"')}</div></div>`:''}<label for="git-file-content">${L('File content','文件内容','檔案內容')}</label><textarea id="git-file-content" class="code-editor" spellcheck="false" rows="6">${e(selected?z.files[selected]:'')}</textarea><div class="row mt">${button('gitcli-save-file',L('Save file','保存文件','儲存檔案'),'',false)}${button('gitcli-create-file',L('Create file','创建文件','建立檔案'))}${button('gitcli-delete-file',L('Delete file','删除文件','刪除檔案'))}</div><p class="small muted">${L('Editing here changes the working tree only. Nothing reaches a commit until you stage it with git add.','在这里编辑只改动工作区。只有用 git add 暂存后，才会进入提交。','在這裡編輯只改動工作區。只有用 git add 暫存後，才會進入提交。')}</p></div>`;
}
function gitMistakeReview(z,h){
 const {e,L,button}=h;
 const all=z.mistakes??[];
 if(!all.length)return '';
 const scenario=scenarioById(z.scenario?.id);
 const taskNumber=id=>scenario?scenario.tasks.findIndex(t=>t.id===id)+1:0;
 const shown=z.showAllMistakes?all:all.slice(-5);
 return `<section class="git-review"><h2>${L('Review your mistakes','回顾你的错误','回顧你的錯誤')} <span class="pill">${all.length}</span></h2><p class="small muted">${L('Every command Git refused is listed with the reason and what to run instead.','Git 拒绝的每条命令都会列出原因和应改用的命令。','Git 拒絕的每條指令都會列出原因和應改用的指令。')}</p><ol>${shown.map(m=>`<li>${m.task&&taskNumber(m.task)>0?`<span class="pill">${L('Task','任务','任務')} ${taskNumber(m.task)}</span> `:''}<code>${e(m.command)}</code><p class="git-review-message">${e(m.message.split('\n')[0])}</p><p><strong>${L('What went wrong','问题在哪','問題在哪')}:</strong> ${e(L(...m.why))}</p><p><strong>${L('Do this instead','应该这样做','應該這樣做')}:</strong> ${e(L(...m.fix))}</p></li>`).join('')}</ol>${all.length>5?button('gitcli-mistakes',z.showAllMistakes?L('Show only the last five','只看最近五条','只看最近五條'):L('Show all mistakes','显示全部错误','顯示全部錯誤')):''}</section>`;
}
function gitGoals(z,h){
 const {L}=h;
 const milestones=gitMilestones(z);
 const required=milestones.filter(m=>m.core),done=required.filter(m=>m.done).length;
 return `<section class="git-goals"><h2>${L('Goals','学习目标','學習目標')} <span class="pill">${done} / ${required.length} ${L('required','必做','必做')}</span></h2><ul class="git-goal-list">${milestones.map(m=>`<li class="${m.done?'done':''}">${m.done?'✓':'○'} ${L(...m.label)}${m.core?'':` <span class="small muted">(${L('optional','选做','選做')})</span>`}</li>`).join('')}</ul></section>`;
}
/** A practice, broken into small ordered tasks with the next step shown on request. */
function gitScenario(z,h){
 const {e,L,button,option}=h;
 const active=scenarioById(z.scenario?.id);
 const tasks=scenarioTasks(z);
 const done=tasks.filter(t=>t.done).length;
 const current=tasks.findIndex(t=>!t.done);
 const pick=z.scenarioPick??z.scenario?.id??'';
 const picker=`<div class="form-grid"><div class="field"><label for="git-scenario">${L('Practice','练习','練習')}</label><select id="git-scenario"><optgroup label="${L('One command each','每条命令一个练习','每條指令一個練習')}">${GIT_DRILLS.map(s=>option(s.id,L(...s.title),pick)).join('')}</optgroup><optgroup label="${L('Whole situations','完整场景','完整情境')}">${GIT_SITUATIONS.map(s=>option(s.id,L(...s.title),pick)).join('')}</optgroup></select></div><div class="field"><label>${L('Start or restart','开始或重开','開始或重開')}</label><div class="row">${button('gitcli-start-scenario',L('Start this practice','开始这个练习','開始這個練習'),'',false)}${active?button('gitcli-restart-scenario',L('Start it again','重新开始','重新開始')):''}</div></div></div>`;
 if(!active)return `<section class="git-scenario"><h2>${L('Practice','练习','練習')}</h2>${picker}<p class="small muted">${L('Start with a small practice: one command, one thing to learn. The whole situations put several of those commands together the way a real team hits them. The setup commands are written into the terminal, so you can see how the problem arose.','从小练习开始：一条命令，一个知识点。完整场景则像真实团队那样把几条命令连在一起。搭建这些情况的命令会写进终端，你能看到问题是怎么产生的。','從小練習開始：一條指令，一個知識點。完整情境則像真實團隊那樣把幾條指令連在一起。搭建這些情況的指令會寫進終端，你能看到問題是怎麼產生的。')}</p></section>`;
 return `<section class="git-scenario"><h2>${L('Practice','练习','練習')}</h2>${picker}<div class="git-brief"><p><strong>${L(...active.title)}</strong></p><p>${L(...active.brief)}</p></div><p class="pill">${done} / ${tasks.length} ${L('tasks done','任务已完成','任務已完成')}</p><ul class="git-task-list">${tasks.map((t,i)=>`<li class="${t.done?'done':i===current?'current':''}">${t.done?'✓':i===current?'▶':'○'} ${L(...t.label)}${i===current?`<span class="git-task-hint">${z.hintFor===t.id?`${L('Next step','下一步','下一步')}: ${L(...t.hint)}`:`<button class="btn ghost small-btn" data-ac="gitcli-hint" data-task="${e(t.id)}">${L('Show hint','显示提示','顯示提示')}</button>`}</span>`:''}</li>`).join('')}</ul>${done===tasks.length?`<div class="callout"><p><strong>${L('Every task is done.','所有任务已完成。','所有任務已完成。')}</strong> ${L('One way to do it:','一种做法：','一種做法：')}</p><ol class="git-solution">${active.solution.map(c=>`<li><code>${e(c)}</code></li>`).join('')}</ol></div>`:''}</section>`;
}
/**
 * The whole Git command-line lab: terminal, state, editor, graph, goals and
 * the mistake review.
 * @param {any} z the stored lab state
 * @param {{e: Function, L: Function, button: Function, option: Function}} h view helpers
 */
export function renderGitLab(z,h){
 const {e,L,button}=h;
 const transcript=(z.transcript??[]).join('\n');
 return `<p>${L('A real Git command line for a small project. Every command runs against a simulated repository, and anything Git refuses is explained below with the command to use instead.','一个小项目的真实 Git 命令行。每条命令都在模拟仓库上运行，被拒绝的命令会在下面说明原因和应改用的命令。','一個小專案的真實 Git 命令列。每條指令都在模擬倉庫上執行，被拒絕的指令會在下面說明原因和應改用的指令。')}</p>${gitScenario(z,h)}<div class="academy-command-buttons">${gitPresets.map(c=>button('gitcli-run',e(c),`data-command="${e(c)}"`)).join('')}</div><form id="academy-git-form" class="row mt"><label class="grow" for="git-command">${L('Command','命令','指令')}<input id="git-command" required maxlength="200" autocomplete="off" placeholder="git status"></label><button class="btn small-btn" type="submit">${L('Run','执行','執行')}</button>${button('gitcli-clear',L('Clear terminal','清空终端','清空終端'))}</form><pre class="academy-output docker-terminal" aria-live="polite">${e(transcript||'$ '+L('Type git help to list the commands this sandbox runs.','输入 git help 查看此沙盒支持的命令。','輸入 git help 查看此沙盒支援的指令。'))}</pre>${gitState(z,h)}${gitFileEditor(z,h)}${gitGraph(z,h)}${scenarioById(z.scenario?.id)?`<details class="git-goals-fold"><summary>${L('Goals for the whole lab','整个实验的目标','整個實驗的目標')}</summary>${gitGoals(z,h)}</details>`:gitGoals(z,h)}${gitMistakeReview(z,h)}<p class="lab-disclosure">${L('No real repository, files or network are touched. Commands, conflicts and history are simulated so mistakes are safe, and rebase, cherry-pick or revert stop instead of guessing when they would conflict.','不会接触真实的仓库、文件或网络。命令、冲突和历史都是模拟的，所以出错是安全的；rebase、cherry-pick 或 revert 遇到冲突时会停下，不会替你猜测。','不會接觸真實的倉庫、檔案或網路。指令、衝突和歷史都是模擬的，所以出錯是安全的；rebase、cherry-pick 或 revert 遇到衝突時會停下，不會替你猜測。')}</p>`;
}
