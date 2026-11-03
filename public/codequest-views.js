// Code Quest views — the course page (chapters, progress, badges) and the
// exercise pages (type-your-own Python, or fix the missing line).
//
// Run state lives in a closure rather than in saved state: a step-through
// animation is a live thing, and a page reload already resets it to a clean
// slate. Only the learner's code draft and cleared exercises are saved.

import {QUEST_LANGUAGES,findLevel,questProgress,isQuestLanguage,buildProgram,checkProgram,renderProgram} from './codequest.js';
import {sprite,BOT,BADGES,CAST,WORLD,CHAPTER_STORY,chapterScene,worldScene} from './codequest-story.js';
import {CHAPTERS,BADGE_NAMES,XP_PER_LEVEL,findExercise,isWriteExercise,exerciseXp,exerciseLevel,courseStats,chapterProgress,nextExercise,neighbours,checkTyped,starterFor,SYNTAX_TIPS} from './codequest-course.js';

export const SYNTAX_MESSAGES={
 unterminatedText:['A piece of text is missing its closing quote.','有一段文字缺少结尾的引号。','有一段文字缺少結尾的引號。'],
 missingParen:['A bracket was opened but never closed.','有括号打开后没有关闭。','有括號打開後沒有關閉。'],
 missingColon:['This line should end with a colon (:).','这一行末尾应该有冒号（:）。','這一行末尾應該有冒號（:）。'],
 expectedIndent:['The line after a colon must be indented.','冒号后面的那一行需要缩进。','冒號後面的那一行需要縮排。'],
 unexpectedIndent:['This line is indented more than the code above it.','这一行比上面的代码多缩进了。','這一行比上面的程式碼多縮排了。'],
 strayElse:['else / elif needs an if directly above it, at the same indent.','else / elif 必须紧跟在同一缩进的 if 之后。','else / elif 必須緊跟在同一縮排的 if 之後。'],
 unsupported:['This line is not something the game understands yet. It reads print(), name = value, if, elif, else and while.','游戏还不认识这一行。目前支持 print()、name = 值、if、elif、else 和 while。','遊戲還不認識這一行。目前支援 print()、name = 值、if、elif、else 和 while。'],
 badCharacter:['This character is not allowed here:','这里不能使用这个字符：','這裡不能使用這個字元：'],
 unexpected:['Python did not expect this here:','这里不应该出现：','這裡不應該出現：'],
 unfinished:['The line ends before the expression is finished.','表达式还没写完这一行就结束了。','運算式還沒寫完這一行就結束了。'],
 printParen:['The print needs brackets, like print("hi").','输出语句需要括号，例如 print("hi")。','輸出語句需要括號，例如 print("hi")。'],
 missingSemicolon:['This statement should end with a semicolon (;).','这条语句末尾应该有分号（;）。','這條語句末尾應該有分號（;）。'],
 missingBrace:['A curly brace { is missing here.','这里缺少花括号 {。','這裡缺少花括號 {。'],
 unclosedBlock:['A block was opened with { but never closed with }.','有一个 { 打开后没有用 } 关闭。','有一個 { 打開後沒有用 } 關閉。'],
 noMain:['The program needs a main function. Keep the starter code around your lines.','程序需要 main 函数。请保留起始代码的外层结构。','程式需要 main 函式。請保留起始程式碼的外層結構。'],
 unsupportedType:['The game supports int and text variables only (string in C++, String in Java). Not supported:','游戏只支持 int 和文字变量（C++ 用 string，Java 用 String）。不支持：','遊戲只支援 int 和文字變數（C++ 用 string，Java 用 String）。不支援：'],
 decimal:['Decimal numbers are not supported in C++ and Java here. Use whole numbers.','C++ 和 Java 里暂不支持小数，请使用整数。','C++ 和 Java 裡暫不支援小數，請使用整數。'],
 forRange:['Write the loop as for i in range(...):.','请把循环写成 for i in range(...):。','請把迴圈寫成 for i in range(...):。']
};

const CONCEPT_MESSAGES={
 set:['Store the value in a variable first (name = ...), then use the variable.','先把值存进变量（name = ...），再使用这个变量。','先把值存進變數（name = ...），再使用這個變數。'],
 if:['This exercise needs an if statement.','这道题需要用 if 语句。','這道題需要用 if 語句。'],
 while:['This exercise needs a loop (while or for).','这道题需要用循环（while 或 for）。','這道題需要用迴圈（while 或 for）。']
};

export function createQuestViews(ctx,h){
 const {e,L,T,button,link}=h;
 const view={run:null,typed:null};

 // Keeps the scroll position while the animation repaints the whole page.
 const repaint=()=>{const y=window.scrollY;ctx.render();window.scrollTo({top:y,behavior:'instant'});};
 const heading=(title,sub)=>`<div class="page-heading"><h1>${e(title)}</h1>${sub?`<p>${e(sub)}</p>`:''}</div>`;
 const pick=triple=>L(triple[0],triple[1],triple[2]);
 const pickT=v=>L(v.en,v['zh-CN'],v['zh-TW']);
 const questLang=q=>isQuestLanguage(q.lang)?q.lang:'python';
 // Python drafts keep their original key so earlier saved work still loads.
 const draftKey=(id,lang)=>lang==='python'?id:id+'@'+lang;
 const currentId=()=>{const r=ctx.route();return r[2]||r[1]||null;};
 const exTitle=ex=>ex.kind==='fix'?T(exerciseLevel(ex).title):T(ex.title);

 function languageBar(lang){
  return `<div class="quest-langbar" role="group" aria-label="${e(L('Language','语言','語言'))}">${QUEST_LANGUAGES.map(x=>`<button type="button" class="quest-lang ${x.id===lang?'on':''}" data-ac="quest-language" data-id="${e(x.id)}" aria-pressed="${x.id===lang}"><code>${e(x.label)}</code></button>`).join('')}</div>`;
 }

 // ---------- story ----------

 // The story card sits at the top of the left column: this chapter's scene,
 // its place, and what its guardian says (changing once the chapter is done).
 function storyCard(chapter,wide){
  const story=CHAPTER_STORY[chapter.id];
  const done=chapterProgress(ctx.a(),chapter).complete;
  const guide=CAST[story.guide];
  const label=pickT(WORLD.name)+' · '+pickT(story.place);
  return `<div class="quest-card quest-story${wide?' wide':''}">${chapterScene(chapter.id,done,e(label))}<div class="quest-story-text"><span class="quest-story-tags"><span class="pill">${e(pickT(story.place))}</span><span class="pill">${e(pickT(guide.name))}</span></span><p>${e(pickT(done?story.done:story.intro))}</p></div></div>`;
 }

 // ---------- course page ----------

 function chapterBlock(chapter,index,open,cleared){
  const prog=chapterProgress(ctx.a(),chapter);
  const rows=chapter.exercises.map((ex,i)=>{
   const done=!!cleared[ex.id];
   return `<a class="quest-ex ${done?'done':''}" href="#codequest/${e(ex.id)}"><span class="quest-ex-n">${e(L('Exercise','练习','練習'))} ${i+1}</span><strong>${e(exTitle(ex))}</strong><span class="quest-ex-state">${e(done?L('Done!','完成！','完成！'):ex.kind==='project'?L('Project','项目','專案'):L('Start','开始','開始'))}</span></a>`;
  }).join('');
  return `<details class="quest-chapter ${prog.complete?'complete':''}" ${open?'open':''}>
   <summary><span class="quest-chapter-dot">${prog.complete?'✓':index+1}</span><span class="quest-chapter-title">${e(T(chapter.title))}</span><span class="quest-chapter-count">${prog.done} / ${prog.total}</span></summary>
   <div class="quest-chapter-body"><p>${e(T(chapter.summary))}</p><p class="quest-story-line">${e(pickT(prog.complete?CHAPTER_STORY[chapter.id].done:CHAPTER_STORY[chapter.id].intro))}</p>${rows}</div>
  </details>`;
 }

 function bar(value,total){return `<span class="quest-bar" role="img" aria-label="${value} / ${total}"><i style="width:${total?Math.round(value/total*100):0}%"></i></span>`;}

 function sidePanels(stats){
  const into=stats.xp%XP_PER_LEVEL;
  const badges=CHAPTERS.map((c,i)=>{
   const earned=stats.badges[i],name=T(BADGE_NAMES[c.badge]);
   return `<li class="quest-badge ${earned?'on':''}" title="${e(name)}">${sprite(BADGES[c.badge],4,!earned)}<span>${e(name)}</span></li>`;
  }).join('');
  return `<aside class="quest-sidebar">
   <div class="quest-card quest-profile"><span class="quest-avatar">${sprite(BOT,5)}</span><div><strong>${e(L('Level','等级','等級'))} ${stats.level}</strong><small>${into} / ${XP_PER_LEVEL} XP ${e(L('to next level','升下一级','升下一級'))}</small>${bar(into,XP_PER_LEVEL)}</div></div>
   <div class="quest-card"><h2>${e(L('Course progress','课程进度','課程進度'))}</h2>
    <div class="quest-stat"><span>${e(L('Exercises','练习','練習'))}</span><b>${stats.done} / ${stats.total}</b></div>${bar(stats.done,stats.total)}
    <div class="quest-stat"><span>${e(L('Projects completed','完成的项目','完成的專案'))}</span><b>${stats.projectsDone} / ${stats.projects}</b></div>${bar(stats.projectsDone,stats.projects)}
    <div class="quest-stat"><span>${e(L('XP earned','获得 XP','獲得 XP'))}</span><b>${stats.xp} / ${stats.totalXp}</b></div>${bar(stats.xp,stats.totalXp)}
   </div>
   <div class="quest-card"><h2>${e(L('Course badges','课程徽章','課程徽章'))} <small>${stats.badgeCount} / ${CHAPTERS.length}</small></h2><p class="quest-card-note">${e(L('Finish every exercise in a chapter to earn its badge.','完成一个章节的全部练习即可获得徽章。','完成一個章節的全部練習即可獲得徽章。'))}</p><ul class="quest-badges">${badges}</ul></div>
  </aside>`;
 }

 function coursePage(){
  const a=ctx.a(),stats=courseStats(a),cleared=questProgress(a).cleared;
  const next=nextExercise(a);
  const lang=questLang(questProgress(a)),langLabel=QUEST_LANGUAGES.find(x=>x.id===lang)?.label||'Python';
  const firstOpen=CHAPTERS.findIndex(c=>!chapterProgress(a,c).complete);
  const cta=next?link('codequest/'+next.id,e(stats.done?L('Continue learning','继续学习','繼續學習'):L('Start learning','开始学习','開始學習')),false):`<span class="pill">${e(L('Course complete','课程已完成','課程已完成'))}</span>`;
  return heading(L('Code quest','编程闯关','程式闖關'),L('Learn to code by writing it in Python, C++ or Java: printing, variables, if and loops, one small exercise at a time.','用 Python、C++ 或 Java 边写边学：输出、变量、if 和循环，每次一个小练习。','用 Python、C++ 或 Java 邊寫邊學：輸出、變數、if 和迴圈，每次一個小練習。'))
   +languageBar(lang)
   +`<section class="quest-hero">${worldScene(stats.badgeCount===CHAPTERS.length,e(pickT(WORLD.name)))}<div class="quest-hero-copy"><span class="pill">${e(pickT(WORLD.name))} · ${e(L('Beginner course','入门课程','入門課程'))}</span><h2>${e(langLabel)}</h2><p>${e(pickT(stats.badgeCount===CHAPTERS.length?WORLD.won:WORLD.story))}</p>${cta}</div></section>`
   +`<div class="quest-course"><div class="quest-chapters">${CHAPTERS.map((c,i)=>chapterBlock(c,i,i===Math.max(firstOpen,0),cleared)).join('')}</div>${sidePanels(stats)}</div>`;
 }

 // ---------- shared exercise chrome ----------

 function crumbs(chapter,ex,index){
  const {prev,next}=neighbours(ex.id);
  const cleared=!!questProgress(ctx.a()).cleared[ex.id];
  return {
   top:`<div class="quest-backrow">${link('codequest','← '+e(L('Course','课程','課程')))}<span class="quest-crumb">${e(T(chapter.title))} · ${e(L('Exercise','练习','練習'))} ${index+1} / ${chapter.exercises.length} · +${exerciseXp(ex)} XP</span></div>`,
   bottom:`<div class="quest-pager">${prev?link('codequest/'+prev.id,'← '+e(exTitle(prev))):'<span></span>'}${next?link('codequest/'+next.id,e(exTitle(next))+' →',!cleared):'<span></span>'}</div>`
  };
 }

 function rewardToast(before,ex){
  const after=courseStats(ctx.a());
  const chapter=CHAPTERS.find(c=>c.exercises.some(x=>x.id===ex.id));
  let msg='+'+exerciseXp(ex)+' XP';
  if(after.level>before.level)msg+=' · '+L('Level up! Level ','升级！等级 ','升級！等級 ')+after.level;
  if(chapter&&after.badges[CHAPTERS.indexOf(chapter)]&&!before.badges[CHAPTERS.indexOf(chapter)])msg+=' · '+L('Badge: ','徽章：','徽章：')+T(BADGE_NAMES[chapter.badge]);
  ctx.toast(msg);
 }

 function explainError(error,result){
  if(error.kind==='empty')return L('Write some code, then press Run.','先写一些代码，再点运行。','先寫一些程式碼，再點執行。');
  if(error.kind==='syntax'){
   const m=SYNTAX_MESSAGES[error.code]||SYNTAX_MESSAGES.unexpected;
   return L('Line ','第 ','第 ')+error.line+L(': ',' 行：',' 行：')+pick(m)+(error.detail&&['badCharacter','unexpected','unsupportedType'].includes(error.code)?' '+error.detail:'');
  }
  const msg=error.message||'';
  if(msg.startsWith('unknown variable: ')){const name=msg.slice(18);return L(`Python does not know "${name}" yet. Create it with ${name} = ... before using it.`,`Python 还不认识 "${name}"。使用前先写 ${name} = ... 创建它。`,`Python 還不認識 "${name}"。使用前先寫 ${name} = ... 建立它。`);}
  if(msg==='cannot add text and a number')return L('You cannot add text and a number directly. Keep both as text, or both as numbers.','文字和数字不能直接相加，请让两边同为文字或同为数字。','文字和數字不能直接相加，請讓兩邊同為文字或同為數字。');
  if(msg==='division by zero')return L('You cannot divide by zero.','不能除以零。','不能除以零。');
  if(msg==='too many passes'||msg==='step limit reached')return L('The loop ran too many times. Does its counter change on every pass?','循环运行次数太多了。计数器每一轮都在变化吗？','迴圈執行次數太多了。計數器每一輪都在變化嗎？');
  return result?.error?.message||msg;
 }

 // ---------- write exercise ----------

 function writePage(chapter,ex,index){
  const q=questProgress(ctx.a());
  q.code??={};
  const lang=questLang(q),file=QUEST_LANGUAGES.find(x=>x.id===lang)?.file||'main';
  const code=q.code[draftKey(ex.id,lang)]??starterFor(ex,lang,pickT);
  const cleared=!!q.cleared[ex.id];
  const run=view.typed?.id===ex.id&&view.typed.lang===lang?view.typed.result:null;
  const tips=SYNTAX_TIPS[lang].map(([label,snippet])=>`<div><b>${e(pick([label.en,label['zh-CN'],label['zh-TW']]))}</b><pre>${e(snippet)}</pre></div>`).join('');
  const {top,bottom}=crumbs(chapter,ex,index);

  let feedback='';
  if(run){
   if(run.passed)feedback=`<div class="quest-result good"><strong>${e(L('Cleared','通关','通關'))}</strong><p>${e(T(ex.teach))}</p></div>`;
   else if(run.error)feedback=`<div class="quest-result bad"><strong>${e(L('Almost there','再检查一下','再檢查一下'))}</strong><p>${e(explainError(run.error,run))}</p></div>`;
   else if(run.missing?.length)feedback=`<div class="quest-result bad"><strong>${e(L('The output is right, but','输出对了，但','輸出對了，但'))}</strong><p>${e(pick(CONCEPT_MESSAGES[run.missing[0]]))}</p></div>`;
   else{
    const i=run.goal.findIndex((line,k)=>run.output[k]!==line);
    const detail=i>=0&&run.output[i]!==undefined?L(`Line ${i+1} of the output should be "${run.goal[i]}" but is "${run.output[i]}".`,`输出的第 ${i+1} 行应为 "${run.goal[i]}"，现在是 "${run.output[i]}"。`,`輸出的第 ${i+1} 行應為 "${run.goal[i]}"，現在是 "${run.output[i]}"。`)
     :run.output.length<run.goal.length?L('The output stops too early. Compare it with the goal.','输出太早结束了，对照一下目标。','輸出太早結束了，對照一下目標。'):L('The output has extra lines. Compare it with the goal.','输出多了几行，对照一下目标。','輸出多了幾行，對照一下目標。');
    feedback=`<div class="quest-result bad"><strong>${e(L('Not this time','还差一点','還差一點'))}</strong><p>${e(detail)}</p></div>`;
   }
  }
  const terminal=run?.output?.length?run.output.map(line=>`<span>${e(line)}</span>`).join(''):`<span class="quest-empty">${e(L('Run your code to see the output here.','运行代码后，输出会显示在这里。','執行程式碼後，輸出會顯示在這裡。'))}</span>`;
  const trace=run?.steps?.length?`<details class="quest-trace"><summary>${e(L('Step trace','逐步追踪','逐步追蹤'))} (${run.steps.length})</summary><table><thead><tr><th>${e(L('Line','行','行'))}</th><th>${e(L('Variables after the line','这一行之后的变量','這一行之後的變數'))}</th></tr></thead><tbody>${run.steps.slice(0,80).map(s=>`<tr><td>${e(s.id.slice(1))}</td><td>${Object.entries(s.vars).map(([k,v])=>`<code>${e(k)} = ${e(String(v))}</code>`).join(' ')||'—'}</td></tr>`).join('')}</tbody></table></details>`:'';
  const failed=run&&!run.passed;

  return heading(exTitle(ex),T(chapter.title))+top+languageBar(lang)
   +`<section class="quest-lesson">
     <div class="quest-leftcol">${storyCard(chapter,false)}
     <div class="quest-card quest-brief">
      <h2>${e(L('Your task','任务','任務'))}</h2><p>${e(T(ex.brief))}</p>
      <h2>${e(L('Goal output','目标输出','目標輸出'))}</h2><pre class="quest-goal">${ex.goal.map(line=>`<span>${e(line)}</span>`).join('')}</pre>
      <details class="quest-hint" ${failed?'open':''}><summary>${e(L('Need a hint?','需要提示？','需要提示？'))}</summary><p>${e(T(ex.hint))}</p></details>
      <details class="quest-hint"><summary>${e(L('Syntax reminder','语法提示','語法提示'))} · ${e(QUEST_LANGUAGES.find(x=>x.id===lang)?.label||'')}</summary><div class="quest-tips">${tips}</div></details>
      ${cleared&&!run?`<div class="quest-result good"><strong>${e(L('Already cleared','已通关','已通關'))}</strong><p>${e(T(ex.teach))}</p></div>`:''}
     </div></div>
     <div class="quest-work">
      <div class="quest-codewrap"><div class="quest-filebar"><span>${e(file)}</span><button type="button" class="quest-link" data-ac="quest-reset-code">${e(L('Reset code','重置代码','重置程式碼'))}</button></div>
       <textarea id="quest-code-input" class="code-editor academy-editor quest-editor" spellcheck="false" autocomplete="off" aria-label="${e(file)}" rows="${Math.max(9,code.split('\n').length+2)}">${e(code)}</textarea></div>
      <div class="quest-controls">${button('quest-run-code',L('Run','运行','執行'),'',false)}<span class="quest-shortcut">${e(L('Ctrl / Cmd + Enter','Ctrl / Cmd + 回车','Ctrl / Cmd + Enter'))}</span></div>
      <div class="quest-card"><h2>${e(L('Terminal','输出屏','輸出螢幕'))}</h2><pre class="quest-terminal" aria-live="polite">${terminal}</pre></div>
      ${feedback}${trace}
     </div>
    </section>`+bottom
   +`<p class="quest-note">${e(L('The game runs a small teaching model of Python, C++ and Java. It covers printing, int and text variables, arithmetic, comparisons, if / else, while and for, so it checks the idea behind your code rather than compiling or running the full language.','这个游戏运行的是 Python、C++ 和 Java 的简化教学模型，覆盖输出、int 和文字变量、算术、比较、if / else、while 和 for，因此它检验的是代码背后的思路，而不是编译或运行完整的语言。','這個遊戲執行的是 Python、C++ 與 Java 的簡化教學模型，涵蓋輸出、int 與文字變數、算術、比較、if / else、while 與 for，因此它檢驗的是程式碼背後的想法，而不是編譯或執行完整的語言。'))}</p>`;
 }

 function runTyped(){
  const ex=findExercise(currentId())?.exercise;
  if(!ex||!isWriteExercise(ex))return;
  const q=questProgress(ctx.a());
  q.code??={};
  const lang=questLang(q),key=draftKey(ex.id,lang);
  const field=document.querySelector('#quest-code-input');
  if(field)q.code[key]=field.value;
  const source=q.code[key]??starterFor(ex,lang,pickT);
  const before=courseStats(ctx.a());
  const result=checkTyped(ex,source,lang);
  q.attempts[ex.id]=(q.attempts[ex.id]||0)+1;
  const first=result.passed&&!q.cleared[ex.id];
  if(result.passed)q.cleared[ex.id]=true;
  view.typed={id:ex.id,lang,result};
  ctx.save();
  repaint();
  if(first)rewardToast(before,ex);
 }

 // ---------- fix exercise (pick the missing line) ----------

 function playPage(chapter,ex,index){
  const level=findLevel(ex.id);
  const q=questProgress(ctx.a());
  const lang=questLang(q);
  const choice=Number.isInteger(q.choice?.[level.id])?q.choice[level.id]:null;
  const {code,map}=renderProgram(buildProgram(level,choice),lang);
  const run=view.run?.levelId===level.id?view.run:null;
  const step=run?run.steps[Math.min(run.index,run.steps.length-1)]:null;
  const activeLine=step?map.get(step.id):null;
  const finished=!!run&&run.index>=run.steps.length-1;
  const {top,bottom}=crumbs(chapter,ex,index);

  const codePanel=code.split('\n').map((text,i)=>`<div class="quest-line${activeLine===i+1?' current':''}"><span class="quest-ln">${i+1}</span><code>${e(text)}</code></div>`).join('');
  const vars=step?Object.entries(step.vars):[];
  const varsPanel=vars.length?vars.map(([k,v])=>`<span class="quest-var"><b>${e(k)}</b>${e(String(v))}</span>`).join(''):`<span class="quest-empty">${e(L('No variables yet.','还没有变量。','還沒有變數。'))}</span>`;
  const output=step?step.output:[];
  const terminal=output.length?output.map(line=>`<span>${e(line)}</span>`).join(''):`<span class="quest-empty">${e(L('No output yet.','还没有输出。','還沒有輸出。'))}</span>`;
  const options=level.slot.options.map((opt,i)=>`<button type="button" class="quest-option${choice===i?' chosen':''}" data-ac="quest-choose" data-id="${i}" aria-pressed="${choice===i}"><code>${e(opt.code)}</code><small>${e(T(opt.note))}</small></button>`).join('');
  const feedback=!run?'':run.error?`<div class="quest-result bad">${e(L('The program stopped before finishing.','程序没有执行完。','程式沒有執行完。'))} <code>${e(run.error)}</code></div>`
   :finished?(run.passed
    ?`<div class="quest-result good"><strong>${e(L('Cleared','通关','通關'))}</strong><p>${e(T(level.teach))}</p></div>`
    :`<div class="quest-result bad"><strong>${e(L('Not this time','还差一点','還差一點'))}</strong><p>${e(L('The output does not match the goal yet. Try another option.','输出和目标还不一致，换一个选项试试。','輸出和目標還不一致，換一個選項試試。'))}</p></div>`):'';

  return heading(T(level.title),T(chapter.title))+top+storyCard(chapter,true)+languageBar(lang)
   +`<section class="quest-stage">
      <div class="quest-codewrap"><div class="quest-filebar"><span>${e(QUEST_LANGUAGES.find(x=>x.id===lang)?.file||'main')}</span></div><div class="quest-code">${codePanel}</div></div>
      <aside class="quest-side">
       <div class="quest-panel"><h2>${e(L('Task','任务','任務'))}</h2><p class="quest-brief-text">${e(T(level.brief))}</p></div>
       <div class="quest-panel"><h2>${e(L('Goal output','目标输出','目標輸出'))}</h2><pre class="quest-goal">${level.goal.map(line=>`<span>${e(line)}</span>`).join('')}</pre></div>
       <div class="quest-panel"><h2>${e(L('Terminal','输出屏','輸出螢幕'))}</h2><pre class="quest-terminal" aria-live="polite">${terminal}</pre></div>
       <div class="quest-panel"><h2>${e(L('Variables','变量','變數'))}</h2><div class="quest-vars">${varsPanel}</div></div>
      </aside>
     </section>
     <section class="quest-choices">
      <h2>${e(L('Choose the missing code','选择缺少的代码','選擇缺少的程式碼'))}</h2>
      <div class="quest-options">${options}</div>
      <div class="quest-controls">${button('quest-run',L('Run','运行','執行'),'',false)}${button('quest-step',L('Step','单步','單步'))}${button('quest-reset',L('Reset','重置','重置'))}</div>
     </section>${feedback}${bottom}
     <p class="quest-note">${e(L('The game runs a small teaching model of these languages. It covers integer variables, arithmetic, comparison, if and while, so it checks the idea behind the code rather than compiling it.','这个游戏运行的是这三种语言的简化教学模型，只覆盖整型变量、算术、比较、if 和 while，因此它检验的是代码背后的思路，而不是真正编译执行。','這個遊戲執行的是這三種語言的簡化教學模型，只涵蓋整數變數、算術、比較、if 與 while，因此它檢驗的是程式碼背後的想法，而不是真正編譯執行。'))}</p>`;
 }

 function page(id,index){
  const q=questProgress(ctx.a());
  if(!isQuestLanguage(q.lang))q.lang='python';
  // Older links looked like codequest/<difficulty>/<level>, so the exercise
  // id may be in either position.
  const found=findExercise(index||id||'');
  if(!found)return coursePage();
  const {chapter,exercise,index:position}=found;
  return exercise.kind==='fix'?playPage(chapter,exercise,position):writePage(chapter,exercise,position);
 }

 function runLevel(level,choice,lang,q){
  const before=courseStats(ctx.a());
  const result=checkProgram(level,choice);
  view.run={levelId:level.id,lang,choice,steps:result.steps,index:0,timer:null,passed:result.passed,error:result.error};
  q.attempts[level.id]=(q.attempts[level.id]||0)+1;
  const first=result.passed&&!q.cleared[level.id];
  if(result.passed)q.cleared[level.id]=true;
  ctx.save();
  play();
  if(first){
   const ex=findExercise(level.id)?.exercise;
   // The toast waits for the animation so the reward lands with the result.
   if(ex)setTimeout(()=>rewardToast(before,ex),Math.min(result.steps.length,12)*420);
  }
 }

 function play(){
  stop();
  if(!view.run)return;
  view.run.timer=setTimeout(()=>{advance();},420);
 }
 function stop(){if(view.run?.timer){clearTimeout(view.run.timer);view.run.timer=null;}}
 function advance(){
  if(!view.run)return;
  if(view.run.index>=view.run.steps.length-1){stop();repaint();return;}
  view.run.index++;
  repaint();
  play();
 }

 function click(action,el){
  const q=questProgress(ctx.a());
  if(action==='quest-language'){q.lang=el.dataset.id;q.choice={};view.run=null;view.typed=null;ctx.save();ctx.render();return true;}
  if(action==='quest-choose'){q.choice??={};q.choice[view.run?view.run.levelId:currentId()]=Number(el.dataset.id);view.run=null;ctx.save();ctx.render();return true;}
  if(action==='quest-run'){
   const level=findLevel(currentId());
   if(!level)return true;
   const ch=q.choice?.[level.id];
   if(!Number.isInteger(ch)){ctx.toast(L('Choose an option first.','请先选择一个选项。','請先選擇一個選項。'));return true;}
   runLevel(level,ch,q.lang,q);
   return true;
  }
  if(action==='quest-step'){stop();advance();return true;}
  if(action==='quest-reset'){stop();view.run=null;ctx.render();return true;}
  if(action==='quest-run-code'){runTyped();return true;}
  if(action==='quest-reset-code'){
   const ex=findExercise(currentId())?.exercise;
   if(ex){q.code??={};delete q.code[draftKey(ex.id,questLang(q))];view.typed=null;ctx.save();ctx.render();}
   return true;
  }
  return false;
 }

 // Typing only saves the draft. Repainting here would steal focus mid-word.
 function input(el){
  if(el.id!=='quest-code-input')return;
  const ex=findExercise(currentId())?.exercise;
  if(!ex)return;
  const q=questProgress(ctx.a());
  q.code??={};
  q.code[draftKey(ex.id,questLang(q))]=el.value;
  ctx.save();
 }

 function key(event){
  const field=event.target;
  if(event.key!=='Enter'||field?.id!=='quest-code-input')return;
  event.preventDefault();
  if(event.ctrlKey||event.metaKey){runTyped();return;}
  // Plain Enter keeps the indentation of the line above, and goes one level
  // deeper after a line that ends with a colon.
  const before=field.value.slice(0,field.selectionStart);
  const current=before.slice(before.lastIndexOf('\n')+1);
  const indent=/^ */.exec(current)[0]+(current.trimEnd().endsWith(':')?'  ':'');
  field.setRangeText('\n'+indent,field.selectionStart,field.selectionEnd,'end');
  field.dispatchEvent(new Event('input',{bubbles:true}));
 }

 function reset(){stop();view.run=null;view.typed=null;}

 return {page,click,input,key,reset};
}
