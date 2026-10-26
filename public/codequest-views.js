// Code Quest views — level select, the pixel map, and the run panel.
//
// The page keeps its run state in a closure rather than in persisted state:
// a step-through animation is a live thing, and a page reload already resets
// the rest of the game (choice, highlight) to a clean slate.

import {QUEST_LANGUAGES,QUEST_DIFFICULTIES,levelsFor,findLevel,questProgress,clearedCount,isUnlocked,isQuestLanguage,buildProgram,checkProgram,renderProgram} from './codequest.js';

const PAL={'2':'#050038','3':'#b9afe8','4':'#ffd02f','5':'#e4ddff'};

function sprite(rows,scale=5){
 let out='';
 rows.forEach((row,y)=>{
  row.split('').forEach((ch,x)=>{
   const fill=PAL[ch];
   if(!fill)return;
   out+=`<rect x="${x*scale}" y="${y*scale}" width="${scale}" height="${scale}" fill="${fill}"/>`;
  });
 });
 const w=rows[0].length*scale,h=rows.length*scale;
 return `<svg class="quest-sprite" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${out}</svg>`;
}

const BOT=['.222222.','.222222.','.244442.','.244442.','.222222.','..2222..','..2..2..','.22..22.'];
const STAR=['..4..','.444.','44444','.444.','..4..'];
const LOCK=['..333..','.3...3.','.3...3.','3333333','3333333','3333333'];

export function createQuestViews(ctx,h){
 const {e,L,T,button,link}=h;
 const view={run:null};

 // Keeps the scroll position while the animation repaints the whole page.
 const repaint=()=>{const y=window.scrollY;ctx.render();window.scrollTo({top:y,behavior:'instant'});};

 const heading=(title,sub)=>`<div class="page-heading"><h1>${e(title)}</h1>${sub?`<p>${e(sub)}</p>`:''}</div>`;

 function languageBar(lang){
  return `<div class="quest-langbar" role="group" aria-label="${e(L('Language','语言','語言'))}">${QUEST_LANGUAGES.map(x=>`<button type="button" class="quest-lang ${x.id===lang?'on':''}" data-ac="quest-language" data-id="${e(x.id)}" aria-pressed="${x.id===lang}"><code>${e(x.label)}</code></button>`).join('')}</div>`;
 }

 function selectView(q){
  return heading(L('Code quest','编程闯关','程式闖關'),L('Pick a difficulty, then fix the broken line in each program.','先选难度，再修好每段程序里出错的那一行。','先選難度，再修好每段程式裡出錯的那一行。'))
   +languageBar(q.lang)
   +`<div class="quest-difficulties">${QUEST_DIFFICULTIES.map(d=>{
    const total=levelsFor(d.id).length,done=clearedCount(ctx.a(),d.id);
    return `<button type="button" class="quest-difficulty" data-ac="quest-difficulty" data-id="${e(d.id)}"><span class="quest-diff-head"><strong>${e(T(d.name))}</strong><span class="quest-diff-count">${done} / ${total}</span></span><span class="quest-diff-summary">${e(T(d.summary))}</span><span class="quest-diff-focus">${e(L('You practise','练习重点','練習重點'))}: ${e(T(d.focus))}</span><span class="quest-diff-track"><i style="width:${total?Math.round(done/total*100):0}%"></i></span></button>`;}).join('')}</div>`;
 }

 function mapView(q,d){
  const levels=levelsFor(d.id);
  const nodes=levels.map((lv,i)=>{
   const done=!!q.cleared[lv.id],open=isUnlocked(ctx.a(),d.id,lv);
   const art=done?sprite(STAR,4):open?sprite(BOT,5):sprite(LOCK,4);
   return `<button type="button" class="quest-node ${done?'done':open?'open':'locked'}" data-ac="quest-level" data-id="${e(lv.id)}" ${open?'':'disabled'}><span class="quest-node-art">${art}</span><span class="quest-node-index">${String(i+1).padStart(2,'0')}</span><span class="quest-node-title">${e(T(lv.title))}</span><span class="quest-node-state">${e(done?L('Cleared','已通关','已通關'):open?L('Ready','可挑战','可挑戰'):L('Locked','未解锁','未解鎖'))}</span></button>`;
  }).join('<span class="quest-path" aria-hidden="true"></span>');
  return heading(T(d.name),T(d.summary))
   +languageBar(q.lang)
   +`<div class="quest-backrow">${link('codequest',L('All difficulties','全部难度','全部難度'))}</div>`
   +`<div class="quest-map">${nodes}</div>`;
 }

 function playView(q,d,level,lang){
  const choice=Number.isInteger(q.choice?.[level.id])?q.choice[level.id]:null;
  const {code,map}=renderProgram(buildProgram(level,choice),lang);
  const run=view.run?.levelId===level.id?view.run:null;
  const step=run?run.steps[Math.min(run.index,run.steps.length-1)]:null;
  const activeLine=step?map.get(step.id):null;
  const finished=!!run&&run.index>=run.steps.length-1;

  const codePanel=code.split('\n').map((text,i)=>{
   const n=i+1;
   return `<div class="quest-line${activeLine===n?' current':''}"><span class="quest-ln">${n}</span><code>${e(text)}</code></div>`;
  }).join('');

  const vars=step?Object.entries(step.vars):[];
  const varsPanel=vars.length?vars.map(([k,v])=>`<span class="quest-var"><b>${e(k)}</b>${e(String(v))}</span>`).join(''):`<span class="quest-empty">${e(L('No variables yet.','还没有变量。','還沒有變數。'))}</span>`;

  const output=step?step.output:[];
  const terminal=output.length?output.map(line=>`<span>${e(line)}</span>`).join(''):`<span class="quest-empty">${e(L('No output yet.','还没有输出。','還沒有輸出。'))}</span>`;

  const options=level.slot.options.map((opt,i)=>
   `<button type="button" class="quest-option${choice===i?' chosen':''}" data-ac="quest-choose" data-id="${i}" aria-pressed="${choice===i}"><code>${e(opt.code)}</code><small>${e(T(opt.note))}</small></button>`
  ).join('');

  const feedback=!run?'':run.error?`<div class="quest-result bad">${e(L('The program stopped before finishing.','程序没有执行完。','程式沒有執行完。'))} <code>${e(run.error)}</code></div>`
   :finished?(run.passed
    ?`<div class="quest-result good"><strong>${e(L('Cleared','通关','通關'))}</strong><p>${e(T(level.teach))}</p></div>`
    :`<div class="quest-result bad"><strong>${e(L('Not this time','还差一点','還差一點'))}</strong><p>${e(L('The output does not match the goal yet. Try another option.','输出和目标还不一致，换一个选项试试。','輸出和目標還不一致，換一個選項試試。'))}</p></div>`)
   :'';

  return heading(T(level.title),T(d.name))
   +languageBar(lang)
   +`<div class="quest-backrow">${link('codequest/'+d.id,L('Level map','关卡地图','關卡地圖'))}</div>`
   +`<section class="quest-stage">
      <div class="quest-codewrap">
       <div class="quest-filebar"><span>${e(QUEST_LANGUAGES.find(x=>x.id===lang)?.file||'main')}</span></div>
       <div class="quest-code" id="quest-code">${codePanel}</div>
      </div>
      <aside class="quest-side">
       <div class="quest-panel">
        <h2>${e(L('Goal output','目标输出','目標輸出'))}</h2>
        <pre class="quest-goal">${level.goal.map(line=>`<span>${e(line)}</span>`).join('')}</pre>
       </div>
       <div class="quest-panel">
        <h2>${e(L('Terminal','输出屏','輸出螢幕'))}</h2>
        <pre class="quest-terminal" id="quest-terminal">${terminal}</pre>
       </div>
       <div class="quest-panel">
        <h2>${e(L('Variables','变量','變數'))}</h2>
        <div class="quest-vars" id="quest-vars">${varsPanel}</div>
       </div>
      </aside>
     </section>
     <section class="quest-choices">
      <h2>${e(L('Choose the missing code','选择缺少的代码','選擇缺少的程式碼'))}</h2>
      <div class="quest-options">${options}</div>
      <div class="quest-controls">
       ${button('quest-run',L('Run','运行','執行'),'',false)}
       ${button('quest-step',L('Step','单步','單步'))}
       ${button('quest-reset',L('Reset','重置','重置'))}
      </div>
     </section>
     ${feedback}
     <p class="quest-note">${e(L('The game runs a small teaching model of these languages. It covers integer variables, arithmetic, comparison, if and while, so it checks the idea behind the code rather than compiling it.','这个游戏运行的是这三种语言的简化教学模型，只覆盖整型变量、算术、比较、if 和 while，因此它检验的是代码背后的思路，而不是真正编译执行。','這個遊戲執行的是這三種語言的簡化教學模型，只涵蓋整數變數、算術、比較、if 與 while，因此它檢驗的是程式碼背後的想法，而不是真正編譯執行。'))}</p>`;
 }

 function page(difficultyId,levelId){
  const q=questProgress(ctx.a());
  if(!isQuestLanguage(q.lang))q.lang='cpp';
  if(!difficultyId)return selectView(q);
  const d=QUEST_DIFFICULTIES.find(x=>x.id===difficultyId);
  if(!d)return selectView(q);
  if(!levelId)return mapView(q,d);
  const level=findLevel(levelId);
  if(!level||level.difficulty!==difficultyId)return mapView(q,d);
  return playView(q,d,level,q.lang);
 }

 function run(level,choice,lang,q){
  const result=checkProgram(level,choice);
  view.run={levelId:level.id,lang,choice,steps:result.steps,index:0,timer:null,
   passed:result.passed,error:result.error};
  q.attempts[level.id]=(q.attempts[level.id]||0)+1;
  if(result.passed)q.cleared[level.id]=true;
  ctx.save();
  play();
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
  if(action==='quest-language'){q.lang=el.dataset.id;q.choice={};view.run=null;ctx.save();ctx.render();return true;}
  if(action==='quest-difficulty'){view.run=null;ctx.go('codequest/'+el.dataset.id);ctx.render();return true;}
  if(action==='quest-level'){view.run=null;const r=ctx.route();ctx.go('codequest/'+r[1]+'/'+el.dataset.id);ctx.render();return true;}
  if(action==='quest-choose'){q.choice??={};q.choice[view.run?view.run.levelId:ctx.route()[2]]=Number(el.dataset.id);view.run=null;ctx.save();ctx.render();return true;}
  if(action==='quest-run'){
   const r=ctx.route(),level=findLevel(r[2]);
   if(!level)return true;
   const ch=q.choice?.[level.id];
   if(!Number.isInteger(ch)){ctx.toast(L('Choose an option first.','请先选择一个选项。','請先選擇一個選項。'));return true;}
   run(level,ch,q.lang,q);
   return true;
  }
  if(action==='quest-step'){stop();advance();return true;}
  if(action==='quest-reset'){stop();view.run=null;ctx.render();return true;}
  return false;
 }

 function reset(){stop();view.run=null;}

 return {page,click,reset};
}
