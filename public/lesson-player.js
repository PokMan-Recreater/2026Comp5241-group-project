import {narrationFor,narrationPosition} from './delivery-audio.js';
import {lessonText,lessonLanguages} from './delivery-i18n.js';
import {mountLessonTools} from './delivery-tools.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
const pad=n=>String(n).padStart(2,'0');
const stepLabel=(group,i)=>`${pad(group+1)}.${i+1}`;
/** @typedef {{id:string,title:string,en:string,steps:{title:string,en:string}[]}} OutlineLesson */
/** @typedef {{themeId?:string,lessons?:OutlineLesson[]}} Outline */
/** @param {Outline} [outline] */
const groupsFor=(lesson,outline={})=>outline.lessons?.length?outline.lessons:[{id:lesson.id,title:lesson.title,en:lesson.titleEn,steps:lesson.steps.map(s=>({title:s.title,en:s.en}))}];
/** @param {Outline} [outline] */
export function lessonPlayerHTML(lesson,lang='zh-CN',outline={}){
 const L=(zh,en)=>lessonText(lang,zh,en),groups=groupsFor(lesson,outline),themeId=outline.themeId||'explore';
 const toc=groups.map((g,gi)=>{const on=g.id===lesson.id;return `<section class="dl-lesson-group${on?' is-active':''}"><button class="dl-lesson-head" data-dl-lesson-toggle aria-expanded="${on}"><span class="dl-lesson-no">${pad(gi+1)}</span><strong>${esc(L(g.title,g.en))}</strong><i class="dl-caret" aria-hidden="true"></i></button><div class="dl-steps dl-step-links"${on?'':' hidden'}>${g.steps.map((st,si)=>on?`<button data-dl-step="${si}"><span>${stepLabel(gi,si)}</span>${esc(L(st.title,st.en))}</button>`:`<a href="#learn/${g.id}/${si}"><span>${stepLabel(gi,si)}</span>${esc(L(st.title,st.en))}</a>`).join('')}</div></section>`;}).join('');
 return `<section class="dl-player" data-delivery-player><header class="dl-appbar"><a href="#module/${themeId}" aria-label="${L('返回板块','Back to theme')}">⌂</a><strong>${esc(L(lesson.title,lesson.titleEn))}</strong><span class="dl-app-position">${esc(L(lesson.position,lesson.positionEn))}</span><select class="dl-language" data-dl-language aria-label="${L('课程语言','Lesson language')}">${Object.entries(lessonLanguages).map(([code,label])=>`<option value="${code}" ${code===lang?'selected':''}>${label}</option>`).join('')}</select><div class="dl-modes"><button data-dl-mode="slides" aria-pressed="true">${L('分步','SLIDES')}</button><button data-dl-mode="document" aria-pressed="false">${L('文档','DOCUMENT')}</button></div><a class="dl-exit" href="#explore">${L('全部主题','All topics')} ↗</a></header><div class="dl-shell"><nav class="dl-toc" aria-label="${L('课程目录与步骤','Course lessons and steps')}"><div class="dl-panel-title">${L('课程','COURSE')}<small>${groups.length} ${L('节','lessons')}</small></div><p class="dl-section-label">${esc(L(lesson.section,lesson.sectionEn))}</p><div class="dl-lessons">${toc}</div><a class="dl-outline-link" href="#module/${themeId}">← ${L('返回板块','Back to theme')}</a></nav><main class="dl-center"><article class="dl-slide"><header><h1>${esc(L(lesson.sceneTitle,lesson.sceneTitleEn))}</h1><span data-dl-current></span></header><div class="dl-stage" data-dl-stage><div data-dl-art></div></div><div class="dl-playbar"><button data-dl-prev aria-label="${L('上一步','Previous step')}"><svg class="dl-nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m15 6-6 6 6 6"/></svg></button><button data-dl-play aria-label="${L('播放','Play')}">▶</button><button data-dl-sound aria-pressed="false" aria-label="${L('关闭配音','Mute narration')}">♪</button><button data-dl-next aria-label="${L('下一步','Next step')}"><svg class="dl-nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9 6 6 6-6 6"/></svg></button><input data-dl-scrub type="range" min="0" max="1000" step="1" value="1000" aria-label="${L('当前步骤播放位置','Position in this step')}"><output data-dl-time></output><select data-dl-speed aria-label="${L('播放速度','Playback speed')}">${[1,1.25,1.5,2].map(x=>`<option value="${x}">${x}×</option>`).join('')}</select><button data-dl-replay aria-label="${L('重播此步','Replay step')}">↻</button></div><section class="dl-narration" aria-label="${L('讲解','Narration')}"><small>${L('讲解','NARRATION')}</small><span class="dl-audio-state" data-dl-audio-state></span><p data-dl-script></p></section></article><div data-dl-document hidden></div></main><aside class="dl-notes"><div class="dl-panel-title">${L('笔记','NOTES')}<button data-dl-notes aria-label="${L('收起笔记','Hide notes')}">×</button></div><ul data-dl-notes-list></ul><p class="dl-note-tip">${L('按播放键看过程；拖动进度可检查每个状态。','Play the sequence, or scrub to inspect each state.')}</p></aside></div><button class="dl-show-notes" data-dl-show-notes hidden>${L('显示笔记','Show notes')}</button></section>`;
}
let cleanup;
export function stopLessonPlayer(){cleanup?.();cleanup=undefined;}
/** @param {Outline} [outline] */
export function mountLessonPlayer(lesson,state,save,lang='zh-CN',initialStep,onLanguageChange,outline={}){
 const root=document.querySelector('[data-delivery-player]');if(!root)return;
 stopLessonPlayer();const L=(zh,en)=>lessonText(lang,zh,en),q=x=>root.querySelector(x),stored=state.deliveryLesson||{},last=lesson.steps.length-1;
 const groups=groupsFor(lesson,outline),groupIndex=Math.max(0,groups.findIndex(g=>g.id===lesson.id));
 const step=Math.floor(clamp(initialStep??stored.step,0,last)),record=lesson.audio?narrationFor(lang,step,lesson.audioManifest):null;
 const s={step,elapsed:(record?.duration||lesson.steps[step].seconds)*(stored.resumeProgress??1),rate:[1,1.25,1.5,2].includes(stored.rate)?stored.rate:1,playing:false,mode:'slides',muted:!!stored.muted};
 delete stored.resumeProgress;
 let tools,raf,audio,lastPaint=0,lastTick=0,loading=false,errorText='';
 const clip=i=>lesson.audio?narrationFor(lang,i,lesson.audioManifest):null;
 const scripts=i=>lesson.steps[i].script.map((x,j)=>L(x,lesson.steps[i].enScript[j]));
 const notes=i=>lesson.steps[i].notes.map((x,j)=>L(x,lesson.steps[i].enNotes[j]??x));
 const duration=()=>Number.isFinite(audio?.duration)&&audio.duration>0?audio.duration:(clip(s.step)?.duration||lesson.steps[s.step].seconds);
 const persist=()=>{state.deliveryLesson={step:s.step,rate:s.rate,muted:s.muted};history.replaceState(null,'',`#learn/${lesson.id}/${s.step}`);save();};
 const time=n=>`${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`;
 const paint=()=>{
  const st=lesson.steps[s.step],dur=duration(),ratio=clamp(s.elapsed/dur);
  const position=clip(s.step)?narrationPosition({...clip(s.step),duration:dur},s.elapsed):{sentence:Math.min(st.script.length-1,Math.floor(ratio*st.script.length)),progress:ratio};
  q('[data-dl-art]').innerHTML=st.art(position.progress,lang);
  q('[data-dl-current]').textContent=`${stepLabel(groupIndex,s.step)} ${L(st.title,st.en)}`;
  q('[data-dl-script]').innerHTML=scripts(s.step).map((x,i)=>`<span class="${s.elapsed<dur&&i===position.sentence?'dl-speaking':''}">${esc(x)}</span>`).join(' ');
  q('[data-dl-notes-list]').innerHTML=notes(s.step).map(x=>`<li>${esc(x)}</li>`).join('');
  q('[data-dl-scrub]').value=String(Math.round(ratio*1000));q('[data-dl-time]').textContent=`${time(s.elapsed)} / ${time(dur)}`;
  q('[data-dl-play]').textContent=s.playing?'Ⅱ':'▶';q('[data-dl-play]').setAttribute('aria-label',L(s.playing?'暂停':'播放',s.playing?'Pause':'Play'));
  q('[data-dl-prev]').disabled=s.step===0;q('[data-dl-next]').disabled=s.step===last;
  q('[data-dl-sound]').hidden=!lesson.audio;
  q('[data-dl-sound]').setAttribute('aria-pressed',String(s.muted));q('[data-dl-sound]').setAttribute('aria-label',L(s.muted?'开启配音':'关闭配音',s.muted?'Unmute narration':'Mute narration'));q('[data-dl-sound]').textContent=s.muted?'♩':'♪';
  q('[data-dl-audio-state]').textContent=errorText||(loading?L('正在加载配音…','Loading narration…'):!lesson.audio?L('本课暂无配音，按时间推进','No narration yet; the scene plays on a timer'):s.muted?L('配音已静音','Narration muted'):lang==='en'?'English narration':L('普通话配音','Mandarin narration'));
  root.querySelectorAll('[data-dl-step]').forEach(b=>b.setAttribute('aria-current',Number(b.getAttribute('data-dl-step'))===s.step?'step':'false'));tools?.paint();
 };
 const pause=()=>{if(s.playing&&audio)s.elapsed=audio.currentTime;s.playing=false;loading=false;audio?.pause();paint();};
 const seek=value=>{s.elapsed=clamp(value,0,duration());if(audio?.readyState>0)audio.currentTime=s.elapsed;paint();};
 const loadAudio=()=>{
  if(audio){audio.pause();audio.onended=null;audio.onerror=null;audio.remove();}
  if(!lesson.audio){audio=null;errorText='';return;}
  const c=clip(s.step);errorText='';
  if(!c){audio=null;errorText=L('配音尚未就绪','Narration is not ready');return;}
  const current=new Audio(c.src);audio=current;current.hidden=true;current.dataset.dlAudio='';root.append(current);current.preload='metadata';current.playbackRate=s.rate;current.muted=s.muted;
  current.addEventListener('loadedmetadata',()=>{if(audio!==current)return;current.currentTime=clamp(s.elapsed,0,current.duration);paint();},{once:true});
  current.onended=()=>{if(audio!==current||!s.playing)return;s.elapsed=duration();if(s.step<last)move(s.step+1,true);else{pause();s.elapsed=duration();persist();paint();}};
  current.onerror=()=>{if(audio!==current)return;s.playing=false;loading=false;errorText=L('配音加载失败，点击播放重试。','Narration could not load. Press play to retry.');paint();};
 };
 const play=async()=>{
  if(!lesson.audio){if(s.elapsed>=duration()-.12)s.elapsed=0;s.playing=true;loading=false;lastTick=performance.now();paint();return;}
  if(errorText||!audio)loadAudio();if(!audio){paint();return;}
  if(s.elapsed>=duration()-.12)s.elapsed=0;
  const current=audio;if(current.readyState>0)current.currentTime=s.elapsed;
  s.playing=true;loading=true;paint();
  try{await current.play();if(audio!==current||!s.playing){current.pause();return;}loading=false;paint();}
  catch{if(audio!==current||!s.playing)return;s.playing=false;loading=false;errorText=L('无法播放配音，请再次点击播放。','Playback was blocked. Press play again.');paint();}
 };
 const move=(n,keep=s.playing)=>{audio?.pause();s.playing=false;s.step=Math.floor(clamp(n,0,last));s.elapsed=keep?0:(clip(s.step)?.duration||lesson.steps[s.step].seconds);loadAudio();persist();paint();if(keep)void play();};
 const tick=now=>{
  if(s.playing&&!document.hidden){
   if(lesson.audio&&audio&&!audio.paused){s.elapsed=audio.currentTime;if(now-lastPaint>65){paint();lastPaint=now;}}
   else if(!lesson.audio){
    const dur=duration();s.elapsed=Math.min(dur,Math.max(0,s.elapsed+(now-lastTick)/1000*s.rate));lastTick=now;
    if(s.elapsed>=dur-.0001){if(s.step<last)move(s.step+1,true);else{pause();s.elapsed=dur;persist();paint();}}
    else if(now-lastPaint>65){paint();lastPaint=now;}
   }
  }else lastTick=now;
  raf=requestAnimationFrame(tick);
 };
 root.addEventListener('click',ev=>{
  const head=/** @type {Element} */ (ev.target).closest('[data-dl-lesson-toggle]');
  if(head){const panel=head.closest('.dl-lesson-group')?.querySelector('.dl-steps');if(panel){const open=head.getAttribute('aria-expanded')==='true';head.setAttribute('aria-expanded',String(!open));/** @type {HTMLElement} */ (panel).hidden=open;}return;}
  const b=/** @type {Element} */ (ev.target).closest('button');if(!b)return;
  if(b.hasAttribute('data-dl-step'))move(Number(b.getAttribute('data-dl-step')));
  if(b.hasAttribute('data-dl-prev'))move(s.step-1);
  if(b.hasAttribute('data-dl-next'))move(s.step+1);
  if(b.hasAttribute('data-dl-play')){if(s.playing)pause();else void play();}
  if(b.hasAttribute('data-dl-replay')){pause();seek(0);void play();}
  if(b.hasAttribute('data-dl-sound')){s.muted=!s.muted;if(audio)audio.muted=s.muted;persist();paint();}
  if(b.hasAttribute('data-dl-notes')||b.hasAttribute('data-dl-show-notes')){const hide=b.hasAttribute('data-dl-notes');root.classList.toggle('dl-notes-hidden',hide);q('[data-dl-show-notes]').hidden=!hide;}
  if(b.hasAttribute('data-dl-mode')){s.mode=b.dataset.dlMode;pause();root.classList.toggle('dl-document-mode',s.mode==='document');q('[data-dl-document]').hidden=s.mode!=='document';root.querySelectorAll('[data-dl-mode]').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));if(s.mode==='document')q('[data-dl-document]').innerHTML=lesson.steps.map((st,i)=>`<section class="dl-doc-scene"><h2>${stepLabel(groupIndex,i)} ${esc(L(st.title,st.en))}</h2>${st.art(1,lang)}<p>${scripts(i).map(esc).join(' ')}</p><ul>${notes(i).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`).join('');paint();}
 });
 q('[data-dl-scrub]').addEventListener('input',ev=>seek(Number(ev.target.value)/1000*duration()));
 q('[data-dl-speed]').value=String(s.rate);q('[data-dl-speed]').addEventListener('change',ev=>{s.rate=Number(ev.target.value);if(audio)audio.playbackRate=s.rate;persist();});
 q('[data-dl-language]').addEventListener('change',ev=>{pause();state.lang=ev.target.value;state.profile.learningLanguage=state.lang;state.deliveryLesson={step:s.step,rate:s.rate,muted:s.muted,resumeProgress:clamp(s.elapsed/duration())};save();onLanguageChange?.();});
 const key=ev=>{if(root.querySelector('dialog[open]'))return;if(ev.target.closest('input,select,button')||ev.ctrlKey||ev.metaKey||ev.altKey)return;if(ev.key==='ArrowRight'||ev.key==='ArrowLeft'){ev.preventDefault();move(s.step+(ev.key==='ArrowRight'?1:-1));}else if(ev.key===' '){ev.preventDefault();q('[data-dl-play]').click();}};
 document.addEventListener('keydown',key);const visibility=()=>{if(document.hidden)pause();};document.addEventListener('visibilitychange',visibility);
 cleanup=()=>{s.playing=false;audio?.pause();audio?.remove();audio=null;tools?.dispose();cancelAnimationFrame(raf);document.removeEventListener('keydown',key);document.removeEventListener('visibilitychange',visibility);};
 loadAudio();paint();tools=mountLessonTools(root,{state,save,lang,lesson,getStep:()=>s.step,pause,finish:()=>{pause();seek(duration());},jump:i=>move(i,false),scenes:lesson.steps.map((st,i)=>({title:`${stepLabel(groupIndex,i)} ${L(st.title,st.en)}`,frame:st.art(1,lang),script:scripts(i),notes:notes(i),concept:L(st.conceptZh??st.title,st.conceptEn??st.en),conceptNote:L(st.conceptNoteZh??st.notes[0],st.conceptNoteEn??st.enNotes?.[0]??st.notes[0])}))});raf=requestAnimationFrame(tick);
}
