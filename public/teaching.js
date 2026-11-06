import {courseBookmarkButton} from './course-bookmark.js';
import {backgroundAI,runBackgroundWork,generationNotice} from './background-ai.js';
import {hasCompleteCourseware,isNarratableLesson,narrationScriptText} from './courseware-contract.js';
import {createDraftAutosave} from './draft-autosave.js';
import {cloudAPI} from './cloud-records.js';
import {curriculum} from './course-map.js';
import {allLessons} from './all-lessons.js';
import {csvCell} from './engine.js';
import {ensureScene} from './scene-auto.js';
import {sceneArt} from './scene-render.js';
import {teachingLessonForPlayer,lessonForSave} from './teaching-lesson-adapter.js';
import {lessonPlayerHTML,mountLessonPlayer,stopLessonPlayer} from './lesson-player.js';
import {takeCourseHandoff} from './personal-course-handoff.js';
import {linkPlanCourse} from './plan-course-link.js';
import {resolveScene} from './teaching-scene-catalog.js';
const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let dispose=()=>{};
export const stopTeaching=()=>{dispose();dispose=()=>{};};
export const teachingHTML=()=>'<div id="teaching-workspace" aria-live="polite"></div>';
export function sceneHTML(lesson){
 const {scene,items}=resolveScene(lesson);
 return sceneArt(scene,items,{title:lesson.title}).replace('class="tc-slide-illustration"','class="tc-scene"');
}
export function officialCourseCopy(id,language){
 const course=curriculum.flatMap(t=>t.courses).find(c=>c.id===id);if(!course)return null;
 const en=language==='en';
 return {title:en?course.en:course.title,description:en?course.enGoal:course.goal,language,lessons:course.lessons.map((entry,i)=>{
  const lesson=allLessons.find(l=>l.id===entry.id),steps=lesson?.steps||[];
  return {id:'lesson-'+(i+1),title:en?entry.en:entry.title,body:steps.map(step=>[(en?step.en:step.title),...(en?step.enScript:step.script)||[]].join('\n')).join('\n\n'),scene:'flow',sceneItems:steps.slice(0,5).map(step=>(en?step.en:step.title).slice(0,60)),questions:[]};
 })};
}
export function mountTeaching({page,id,index=0,locale='zh-CN',user,mode,onStudyComplete,bookmarks=[]}){
 stopTeaching();const root=document.querySelector('#teaching-workspace');if(!root)return;
 const personal=mode==='personal'||page==='personal-courses'||page==='personal-course',listHash=personal?'#personal-courses':page==='assigned'?'#assigned':'#courses';
 let narrationClips=[],narrationConfigured=false,narrationRunning=false;
 let alive=true,record=null,draft=null,candidate=null,lastAIAction=null,lessonIndex=0,busy=false,analytics=[],courseList=[],previewState=null,timer,lastInteraction=Date.now(),lastBeat=Date.now(),pendingPlanId=null;
 const L=(en,cn,tw=cn)=>locale==='en'?en:locale==='zh-TW'?tw:cn;
 const courseOutlineLessons=()=>(previewState?.course?.lessons||[]).map(lesson=>({id:lesson.id,title:lesson.title,en:lesson.title,steps:(lesson.slides||[]).map(slide=>({title:slide.heading,en:slide.heading}))}));
  const deckHTML=(lesson,key,showNotes=true,contentLanguage=draft?.language||locale,hideToc=false)=>{
   if(Array.isArray(lesson.slides)&&lesson.slides.length){
    const playable=teachingLessonForPlayer(lesson,{clips:narrationClips,language:contentLanguage});
    return `<div class="${hideToc?'tc-hide-toc':''}" data-content-language="${contentLanguage}" data-teaching-player='${e(JSON.stringify(lesson))}'>${lessonPlayerHTML(playable,locale,hideToc?{embedded:true,lessons:courseOutlineLessons()}:{embedded:true})}</div>`;
   }
   return `<section class="tc-courseware-empty"><h3>${L('No complete courseware yet','尚未生成完整课件','尚未產生完整課件')}</h3><p>${L('This lesson only has a planning summary. Generate the lesson courseware, review the narrated steps, then accept it.','当前只有课节大纲。请点击“生成课件”，预览完整分步讲解后再采纳。','目前只有課節大綱。請點擊「產生課件」，預覽完整分步講解後再採納。')}</p>${lesson.body?`<details><summary>${L('View outline','查看大纲','查看大綱')}</summary><div class="tc-reading">${e(lesson.body)}</div></details>`:''}</section>`;
  }

const api=(resource,body)=>cloudAPI('/api/teaching?resource='+resource,body);
 // Personal courses share the editor but live in their own owner-scoped table.
 const personalAPI=body=>cloudAPI('/api/teaching?resource=personal-courses',body);
 const button=(action,label,secondary=true,attrs='')=>`<button type="button" class="btn ${secondary?'secondary':''}" data-teach="${action}" ${attrs}>${label}</button>`;
 const heading=(title,sub='')=>`<div class="page-heading"><h1>${e(title)}</h1>${sub?`<p>${e(sub)}</p>`:''}</div>`;
 const status=message=>{root.querySelectorAll('[data-teach-status],[data-ai-status]').forEach(el=>{el.textContent=message;});};
 const aiStatus=message=>{const el=root.querySelector('[data-ai-status]');if(!el)return;el.textContent=message;el.scrollIntoView({block:'nearest',behavior:'smooth'});};
 const errors={teacher_required:L('A teacher account is required.','请使用教师账号。','請使用教師帳號。'),revision_conflict:L('The course changed in another window. Copy your edits and reload.','课程已在其他窗口修改，请保留当前内容后刷新。'),provider_rate_limited:L('The free model is busy. Your draft is safe; try again shortly.','免费模型暂时限流，草稿已保留，请稍后重试。'),ai_not_configured:L('The AI service is not configured.','AI 服务尚未配置。'),invalid_course:L('Check lesson content, question answers and scene labels before publishing.','请检查课文、选择题答案和场景标签后再发布。'),invalid_request:L('Please check the required fields.','请检查必填内容。'),login_required:L('Please sign in again.','请重新登录。')};
 Object.assign(errors,{
 narration_not_configured:L('The speech service is not configured.','语音服务尚未配置。','語音服務尚未設定。'),narration_timeout:L('Narration timed out. Completed recordings are saved; click again to continue.','配音生成超时，已完成部分已保存，再点按钮可继续。','配音產生逾時，已完成部分已儲存，再點按鈕可繼續。'),narration_too_long:L('This step is too long. Split its narration and retry.','这一页讲稿过长，请拆分讲解后再生成配音。','這一頁講稿過長，請拆分講解後再產生配音。'),narration_provider_failed:L('The speech service failed. Completed recordings are saved; retry to continue.','语音服务暂时未返回录音，已完成部分已保存，可重试继续。','語音服務暫時未回傳錄音，已完成部分已儲存，可重試繼續。'),
 server_connection_failed:L('The local server is unavailable. Your draft is kept; restart the server and retry.','无法连接本机后台，草稿已保留。请恢复后台后重试。','無法連線本機後台，草稿已保留。請恢復後台後重試。'),
 provider_unavailable:L('The AI service could not respond. Your draft is kept; please retry.','AI 服务暂时无法响应，草稿已保留，请重试。','AI 服務暫時無法回應，草稿已保留，請重試。'),
 provider_timeout:L('AI generation timed out. Your draft is kept; please retry.','AI 生成超时，草稿已保留，请重试。','AI 生成逾時，草稿已保留，請重試。'),
 incomplete_courseware:L('Every lesson needs at least one slide before publishing. Add slides by hand or generate them with AI.','发布前每节课至少需要一页幻灯片。可手动添加，或用 AI 生成。','發佈前每節課至少需要一頁幻燈片。可手動新增，或用 AI 產生。'),
 invalid_teaching_plan:L('AI could not finish the teaching design. Draft retained; please retry.','AI 未能完成教学设计，草稿已保留，请重试。','AI 未能完成教學設計，草稿已保留，請重試。'),
 quality_review_failed:L('The generated lesson did not pass content review. Draft retained; please retry.','生成内容未通过复核，草稿已保留，请重试。','產生內容未通過複核，草稿已保留，請重試。'),
 invalid_ai_result:L('AI returned incomplete lesson data. Your draft is kept; please regenerate.','AI 返回的课节内容格式不完整，草稿已保留，请重新生成。','AI 回傳的課節內容格式不完整，草稿已保留，請重新生成。'),
 duplicate_lesson_titles:L('AI repeated the same lesson title. Your draft is kept; please regenerate.','AI 给出的课节标题重复，草稿已保留，请重新生成。','AI 給出的課節標題重複，草稿已保留，請重新生成。'),
 invalid_service_response:L('The server returned an invalid response. Your draft is kept; please retry.','后台返回异常，草稿已保留，请重试。','後台回傳異常，草稿已保留，請重試。'),
 database_not_configured:L('The database is not configured on this server.','服务器上的数据库尚未配置。','伺服器上的資料庫尚未設定。'),database_unavailable:L('The database could not complete this request. Please retry shortly.','数据库暂时无法完成该请求，请稍后重试。','資料庫暫時無法完成該請求，請稍後重試。'),invalid_provider:L('The AI service address is misconfigured.','AI 服务地址配置有误。','AI 服務位址設定有誤。'),origin_not_allowed:L('Open the page from the same address as the server.','请使用与服务器一致的地址打开页面。','請使用與伺服器一致的位址開啟頁面。'),
 course_not_found:L('This course is not accessible to the current teacher account.','当前教师账号无权访问这门课程。','目前教師帳號無權存取這門課程。'),
 course_in_use:L('This course is assigned to a class. Remove the assignment before deleting it.','这门课程已分配给班级，请先取消分配再删除。','這門課程已分配給班級，請先取消分配再刪除。'),
 rate_limited:L('Too many requests. Please wait a minute before trying again.','操作较频繁，请稍候一分钟再重试。','操作較頻繁，請稍候一分鐘再重試。')});
 const errorText=error=>errors[error.message]||L('Unable to complete this action. Check the connection and database setup.','操作未完成，请检查连接与数据库配置。','操作未完成，請檢查連線與資料庫設定。');
 const backupKey=()=>`${personal?'forma.personal-draft':'forma.teacher-draft'}.${user.id}.${record?.id||'new'}`;
 let autosaver,localBackupOK=true,saveMessage='';
 const saveStatus=message=>{saveMessage=message;root.querySelectorAll('[data-save-status]').forEach(el=>{el.textContent=message;});};
 const backup=()=>{try{localStorage.setItem(backupKey(),JSON.stringify({revision:record?.revision,draft,candidate}));localBackupOK=true;}catch{localBackupOK=false;saveStatus(L('Local backup failed. Keep this page open until server save succeeds.','本机备份失败，请保留页面直到服务器保存成功。','本機備份失敗，請保留頁面直到伺服器儲存成功。'));}};
 const changed=()=>{backup();autosaver?.change();};
 const courseSnapshot=()=>({title:draft.title,description:draft.description,language:draft.language,lessons:draft.lessons.map(ensureScene).map(lessonForSave)});
 const restoreAICandidate=()=>{
  if(!record)return;
  const route=(personal?'#personal-course/':'#teacher-course/')+record.id,task=backgroundAI.candidate(record.id,route);
  if(!task||candidate?.taskId===task.id)return;
  const selected=task.lessonId?draft.lessons.findIndex(l=>l.id===task.lessonId):0;
  if(selected<0)return;
  candidate={kind:task.action==='outline'?'ai-outline':'ai-lesson',index:selected,value:task.action==='outline'?task.result.course:task.result.lesson,source:task.result.source,taskId:task.id};
  lessonIndex=selected;backup();
 };
 const mergeGeneratedLesson=(current,generated)=>{const lessonId=current.id;return {...ensureScene(generated),id:lessonId,questions:(generated.questions||[]).map((q,i)=>({...q,id:lessonId+'-q-'+(i+1)}))};};
 autosaver=createDraftAutosave({snapshot:()=>({course:courseSnapshot(),authorMaterials:draft.authorMaterials||''}),save:async ({course,authorMaterials})=>{
  if(!course.title.trim())throw Error('draft_title_required');
  const oldKey=backupKey();
  const data=personal?await personalAPI({action:'save',id:record?.id,revision:record?.revision,course,authorMaterials,sourceId:record?.source_id}):await api('courses',{action:'save',id:record?.id,revision:record?.revision,course,authorMaterials,sourceId:record?.source_id});
  record=data.course;backup();
  if(pendingPlanId&&record.id){if(linkPlanCourse(user?.id,pendingPlanId,record.id))pendingPlanId=null;}
  if(oldKey!==backupKey())try{localStorage.removeItem(oldKey);}catch{/* The new backup remains authoritative. */}
  if(alive&&location.hash===(personal?'#personal-course/new':'#teacher-course/new'))history.replaceState(null,'',(personal?'#personal-course/':'#teacher-course/')+record.id);
 },onState:(state,error)=>{
  const local=localBackupOK?L('Saved on this device. ','已备份到本机。','已備份到本機。'):L('Local backup unavailable. ','本机备份不可用。','本機備份無法使用。');
  if(state==='pending')saveStatus(local+L('Waiting to sync…','等待自动同步…','等待自動同步…'));
  if(state==='saving')saveStatus(local+L('Saving to server…','正在保存到服务器…','正在儲存到伺服器…'));
  if(state==='saved')saveStatus(L('All changes saved to server.','所有修改已自动保存到服务器。','所有修改已自動儲存到伺服器。'));
  if(state==='error')saveStatus(local+(error.message==='draft_title_required'?L('Enter a course title to sync.','填写课程标题后会自动同步。','填寫課程標題後會自動同步。'):error.message==='invalid_request'?L('Some fields are unfinished. They are backed up locally; server sync will retry after editing.','部分内容尚未填完，已保留本机备份；继续编辑后会重试同步。','部分內容尚未填完，已保留本機備份；繼續編輯後會重試同步。'):errorText(error)));
 }});
 const blankLesson=()=>({id:'lesson-'+crypto.randomUUID(),title:L('New lesson','新课节','新課節'),body:'',scene:'flow',sceneItems:['开始','结果'],questions:[]});
 const blankSlide=()=>{const point=L('Key point','要点','要點');return {heading:L('New slide','新幻灯片','新幻燈片'),bullets:[point],art:{scene:'auto',items:[point]}};};
 const narrationLanguage=()=>draft?.language==='en'?'en':'zh-CN';
 const hasNarration=slide=>narrationClips.some(c=>c.text===narrationScriptText(slide)&&c.language===narrationLanguage());
 const lessonNarrationCount=lesson=>(lesson.slides||[]).filter(hasNarration).length;
 const narrationPanel=()=>{
  const complete=draft.lessons.filter(isNarratableLesson);
  const ready=complete.length>0,waiting=draft.lessons.length-complete.length;
  const total=complete.reduce((n,l)=>n+l.slides.length,0);
  const done=complete.reduce((n,l)=>n+lessonNarrationCount(l),0);
  const progress=ready?L(`Recorded: ${done}/${total} steps in ${complete.length} ready lesson(s).`,`已配音：${done}/${total} 个分镜（${complete.length} 节已就绪）。`,`已配音：${done}/${total} 個分鏡（${complete.length} 節已就緒）。`):L('Add slides to a lesson, by hand or with AI, to unlock narration.','任一节添加幻灯片（手动或 AI）后，即可为该节生成配音。','任一節新增幻燈片（手動或 AI）後，即可為該節產生配音。');
  return `<section class="panel tc-narration-panel"><h2>${L('Course narration','课程配音','課程配音')}</h2><p>${progress}${waiting?L(` ${waiting} lesson(s) have no slides yet and are skipped.`,` 另有 ${waiting} 节还没有幻灯片，暂不配音。`,` 另有 ${waiting} 節還沒有幻燈片，暫不配音。`):''}</p>${button('generate-narration',L(done?'Continue / update ready lessons':'Generate for ready lessons',done?'继续／更新已就绪小节':'为已就绪小节生成',done?'繼續／更新已就緒小節':'為已就緒小節產生'),false,!ready||narrationRunning?'disabled':'')}<p class="small muted">${L('Uses the existing speech service. Each lesson can also be voiced on its own from the lesson panel. Slides without a script read their key points. Completed recordings are reused; changing a script requires updated narration.','使用现有语音服务额度；也可在课节面板里单独为某一节配音。未填写讲稿的幻灯片会朗读要点。已完成的录音会复用，讲稿修改后需更新对应配音。','使用現有語音服務額度；也可在課節面板裡單獨為某一節配音。未填寫講稿的幻燈片會朗讀要點。已完成的錄音會重用，講稿修改後需更新對應配音。')}</p><p data-narration-status role="status"></p></section>`;
 };
 const loadNarration=async courseId=>{const data=await cloudAPI('/api/course-narration?courseId='+encodeURIComponent(courseId));narrationClips=data.clips||[];narrationConfigured=data.configured;};
 const slidesPanel=lesson=>{
  const slides=lesson.slides||[];
  const tools=i=>`<span class="row tc-slide-tools">${i>0?button('move-slide-up','↑',true,`data-index="${i}" aria-label="${e(L('Move slide up','上移这一页','上移這一頁'))}"`):''}${i<slides.length-1?button('move-slide-down','↓',true,`data-index="${i}" aria-label="${e(L('Move slide down','下移这一页','下移這一頁'))}"`):''}${button('remove-slide',L('Remove','删除','刪除'),true,`data-index="${i}"`)}</span>`;
  const fields=slides.map((slide,i)=>`<fieldset class="tc-slide-field" data-slide="${i}"><legend><span>${L('Slide','幻灯片','幻燈片')} ${i+1}</span>${tools(i)}</legend><label>${L('Heading','标题','標題')}<input data-slide-field="heading" maxlength="120" value="${e(slide.heading)}"></label><label>${L('Concept label (optional)','概念标签（可选）','概念標籤（可選）')}<input data-slide-field="concept" maxlength="120" value="${e(slide.concept||'')}"></label><label>${L('Key points, one per line (1–6)','要点，每行一条（1–6 条）','要點，每行一條（1–6 條）')}<textarea data-slide-field="bullets" rows="3" maxlength="1300">${e((slide.bullets||[]).join('\n'))}</textarea></label><label>${L('Narration script, one sentence per line (optional; key points are read when empty)','配音讲稿，每行一句（可选；留空则朗读要点）','配音講稿，每行一句（可選；留空則朗讀要點）')}<textarea data-slide-field="script" rows="2" maxlength="1600">${e((slide.script||[]).join('\n'))}</textarea></label><label>${L('Illustration labels, one per line (1–5, the layout is chosen automatically)','插画标签，每行一个（1–5 个，版式自动选择）','插畫標籤，每行一個（1–5 個，版式自動選擇）')}<textarea data-slide-field="items" rows="2" maxlength="410">${e((slide.art?.items||[]).join('\n'))}</textarea></label></fieldset>`).join('');
  return `<section class="panel tc-slides-editor"><div class="row between"><h2>${L('Slide deck','幻灯片','幻燈片')}</h2><span class="pill">${slides.length}/20</span></div><p class="small muted">${L('Each slide becomes one step in the student player. Write the deck by hand here, or let AI fill the whole lesson below; either way you can keep editing every slide.','每一页对应学生播放器里的一个步骤。可以在这里手动编写，也可以稍后用 AI 一次性生成整节课件，之后继续修改。','每一頁對應學生播放器裡的一個步驟。可以在這裡手動編寫，也可以稍後用 AI 一次性產生整節課件，之後繼續修改。')}</p>${slides.length?fields:`<p class="small muted">${L('No slides yet. Add the first slide or generate the lesson with AI.','还没有幻灯片。可以添加第一页，或用 AI 生成整节课件。','還沒有幻燈片。可以新增第一頁，或用 AI 產生整節課件。')}</p>`}${slides.length<20?button('add-slide',slides.length?L('Add slide','添加幻灯片','新增幻燈片'):L('Add the first slide','添加第一页幻灯片','新增第一頁幻燈片')):''}</section>`;
 };
 const courseForm=()=>`<p data-save-status role="status" class="tc-save-status">${e(saveMessage||L('Changes are saved automatically.','修改后自动保存。','修改後自動儲存。'))}</p><div class="tc-toolbar"><a href="${listHash}">← ${L('My courses','我的课程','我的課程')}</a><div class="row">${button('save',L(personal?'Save now':'Save draft',personal?'立即保存':'保存草稿',personal?'立即儲存':'儲存草稿'),false)}${personal?'':button('publish',L('Publish version','发布版本','發佈版本'))}${!personal&&record?.published?button('preview-published',L('Preview published','预览发布版','預覽發佈版')):''}</div></div><div class="tc-meta panel"><div class="field"><label for="tc-title">${L('Course title','课程标题','課程標題')}</label><input id="tc-title" data-course-field="title" maxlength="180" value="${e(draft.title)}"></div><div class="field"><label for="tc-description">${L('Learning objectives','学习目标','學習目標')}</label><textarea id="tc-description" data-course-field="description" maxlength="3000">${e(draft.description)}</textarea></div><div class="field"><label for="tc-language">${L('Content language','内容语言','內容語言')}</label><select id="tc-language" data-course-field="language">${[['zh-CN','简体中文'],['zh-TW','繁體中文'],['en','English']].map(([v,label])=>`<option value="${v}" ${draft.language===v?'selected':''}>${label}</option>`).join('')}</select></div></div>`;
 function editor(){
  restoreAICandidate();
  const lesson=ensureScene(draft.lessons[lessonIndex]);
  const narratable=isNarratableLesson(lesson)?lesson.slides.length:0,narrated=narratable?lessonNarrationCount(lesson):0;
  const names=draft.lessons.map(l=>l.title.trim().toLowerCase()).filter(Boolean),duplicate=names.length!==new Set(names).size;
  // Outline generation belongs to the empty start state only. Once the draft
  // has an outline or slides, the AI panel offers per-lesson slide generation.
  const outlineStarted=draft.lessons.some(l=>String(l.body||'').trim()||(Array.isArray(l.slides)&&l.slides.length));
  const outlineCandidate=candidate?.kind==='ai-outline';
  const aiSteps=outlineStarted&&!outlineCandidate
   ?`<div class="field"><strong>${L('Generate slides for this lesson','生成这一讲课件','產生這一講課件')}</strong><p class="small muted">${L('Fills this lesson with the full text, illustration labels and quiz questions from the accepted outline.','根据已采纳的大纲，补全这一讲的正文、插画标签和选择题。','根據已採納的大綱，補全這一講的正文、插畫標籤和選擇題。')}</p><p class="small muted">${L('Preview the draft slides, narration script and illustrations before accepting.','采纳前可以预览幻灯片、讲稿和插图。','採納前可以預覽投影片、講稿和插圖。')}</p>${button('ai-lesson',L('Generate slides','生成课件','產生課件'),false)}${button('preview',L('Preview lesson','预览课节','預覽課節'))}${button('clear-all',L('Clear all','清空所有','清空所有'))}</div>`
   :`<div class="field"><strong>${L('Step 1 · Course outline','第 1 步 · 生成大纲','第 1 步 · 產生大綱')}</strong><p class="small muted">${L('AI proposes the course structure and per-lesson summaries. Accept a version you are happy with, then generate slides for each lesson; regenerate until satisfied.','AI 先给出课程结构和每一讲的大纲摘要。满意就采纳，然后逐讲生成课件；不满意可重新生成。','AI 先給出課程結構和每一講的大綱摘要。滿意就採納，然後逐講產生課件；不滿意可重新產生。')}</p>${button('ai-outline',L('Generate course outline','生成课程大纲','產生課程大綱'),false)}${button('clear-all',L('Clear all','清空所有','清空所有'))}</div>`;
  root.innerHTML=heading(L(personal?'My custom course studio':'Course studio',personal?'我的自定义课程工作台':'课程工作台',personal?'我的自訂課程工作台':'課程工作台'))+courseForm()+narrationPanel()+`<p class="tc-status" data-teach-status role="status"></p><div class="tc-editor"><aside class="panel tc-outline"><h2>${L('Lessons','课节','課節')}</h2>${draft.lessons.map((l,i)=>`<button class="tc-lesson-tab" data-teach="lesson" data-index="${i}" aria-current="${i===lessonIndex?'step':'false'}">${i+1}. ${e(l.title)}<span class="tc-lesson-adoption ${l.slides?.length?'is-accepted':''}">${l.slides?.length?L('✓ Slides ready','✓ 有课件','✓ 有課件'):L('○ No slides','○ 无课件','○ 無課件')}</span></button>`).join('')}${draft.lessons.length<10?button('add-lesson',L('Add lesson','添加课节','新增課節')):''}${duplicate?`<p class="small tc-warn">${L(personal?'Two or more lessons share the same title. Give each lesson a distinct title.':'Two or more lessons share the same title. Give each lesson a distinct title before publishing.',personal?'有课节的标题重复，请为每节课设置不同标题。':'有课节的标题重复，请为每节课设置不同标题后再发布。',personal?'有課節的標題重複，請為每節課設定不同標題。':'有課節的標題重複，請為每節課設定不同標題後再發佈。')}</p>`:''}<p class="small muted">${L(personal?'Your course saves automatically.':'Changes save automatically. Publish after every lesson is ready.',personal?'课程会自动保存。':'修改后自动保存，所有课节准备好后再发布。',personal?'課程會自動儲存。':'修改後自動儲存，所有課節準備好後再發佈。')}</p></aside><div class="tc-edit-main"><section class="panel"><div class="row between"><h2>${L('Lesson content','课节内容','課節內容')}</h2>${draft.lessons.length>1?button('delete-lesson',L('Remove lesson','删除课节','刪除課節')):''}</div>${narratable?`<div class="row between tc-lesson-narration"><p class="small muted"><span data-lesson-narration-count>${L(`Narration: ${narrated}/${narratable} steps recorded.`,`本节配音：${narrated}/${narratable} 个分镜已完成。`,`本節配音：${narrated}/${narratable} 個分鏡已完成。`)}</span> <span data-lesson-narration-status role="status"></span></p>${button('generate-lesson-narration',L(narrated===narratable?'Update this lesson':'Voice this lesson',narrated===narratable?'更新本节配音':'为这一节配音',narrated===narratable?'更新本節配音':'為這一節配音'),true,narrationRunning?'disabled':'')}</div>`:''}<div class="field"><label for="tc-lesson-title">${L('Lesson title','课节标题','課節標題')}</label><input id="tc-lesson-title" data-lesson-field="title" maxlength="180" value="${e(lesson.title)}"></div><div class="field"><label for="tc-body">${L('Explanation and worked example','讲解与示例','講解與範例')}</label><textarea id="tc-body" data-lesson-field="body" maxlength="18000" rows="12">${e(lesson.body)}</textarea></div><p class="small muted">${L('The illustration is chosen automatically from the lesson content and AI suggestions. No manual selection is needed.','插画由 AI 根据课节内容自动选择，无需手动设置。','插畫由 AI 根據課節內容自動選擇，無需手動設定。')}</p><div data-scene-preview></div><details class="tc-deck-preview"><summary>${L('Slide preview','幻灯片预览','幻燈片預覽')}</summary><section data-lesson-preview><button type="button" class="btn secondary" data-preview-full>${L('Fullscreen preview','全屏预览','全螢幕預覽')}</button>${deckHTML(lesson,'editor-'+lessonIndex)}</section></details></section>${slidesPanel(lesson)}<section class="panel"><h2>${L('Multiple-choice activities','选择题活动','選擇題活動')}</h2>${lesson.questions.map((q,i)=>`<fieldset data-question="${i}"><legend>${L('Question','题目','題目')} ${i+1}</legend><label>${L('Prompt','题干','題幹')}<textarea data-question-field="prompt" maxlength="1500">${e(q.prompt)}</textarea></label><label>${L('Options, one per line (2–5)','选项，每行一个（2–5 个）','選項，每行一個（2–5 個）')}<textarea data-question-field="options" rows="4">${e(q.options.join('\n'))}</textarea></label><label>${L('Correct option number','正确选项序号','正確選項序號')}<input type="number" min="1" max="5" data-question-field="correctIndex" value="${q.correctIndex+1}"></label><label>${L('Explanation','答案解析','答案解析')}<textarea data-question-field="explanation" maxlength="2500">${e(q.explanation)}</textarea></label>${button('remove-question',L('Remove question','删除题目','刪除題目'),true,`data-index="${i}"`)}</fieldset>`).join('')}${lesson.questions.length<5?button('add-question',L('Add question','添加题目','新增題目')):''}</section><section class="panel tc-ai"><h2>${L('AI co-author','AI 辅助制作','AI 輔助製作')}</h2><div class="field"><label for="tc-materials">${L('Teaching requirements and source material','教学要求与参考材料','教學要求與參考資料')}</label><textarea id="tc-materials" data-materials maxlength="16000" rows="5" placeholder="${L('Audience, learning goals, accurate source notes…','受众、难度、教学目标、已有讲义……','受眾、難度、教學目標、已有講義……')}">${e(draft.authorMaterials||'')}</textarea></div><div class="field"><label for="tc-instruction">${L('What should AI change?','希望 AI 怎样优化？','希望 AI 如何優化？')}</label><input id="tc-instruction" maxlength="2500" placeholder="${L('e.g. explain with a concrete case and add two questions','例如：用具体案例讲清概念，并补两道选择题','例如：用具體案例講清概念，並補兩道選擇題')}"></div>${aiSteps}<p class="small muted">${L(personal?'AI suggestions remain drafts until you accept them.':'AI suggestions remain drafts until you accept and publish them.',personal?'AI 生成内容先预览，采纳后进入你的课程。':'AI 生成内容先预览，采纳并发布后学生才会看到。',personal?'AI 產生內容先預覽，採納後進入你的課程。':'AI 生成內容先預覽，採納並發佈後學生才會看到。')}</p><p class="tc-status" data-ai-status role="status"></p><p class="small muted">${generationNotice()}</p><div data-ai-candidate>${candidatePanel()}</div><div data-ai-manual-preview></div></section></div></div>`;
 }
 const answerHTML=q=>{
  const index=q.correctIndex,option=q.options?.[index];
  const answer=Number.isInteger(index)&&index>=0&&typeof option==='string'&&option.trim()?`${String.fromCharCode(65+index)}. ${e(option)}`:L('Not set','尚未设置','尚未設定');
  return `<p><strong>${L('Correct answer','正确答案','正確答案')}: ${answer}</strong></p>${q.explanation?`<p>${L('Explanation','解析','解析')}: ${e(q.explanation)}</p>`:''}`;
 };
 const preview=lesson=>`<section data-lesson-preview><div class="row between">${lesson.slides?.length?'':`<h3>${e(lesson.title)}</h3>`}<button type="button" class="btn secondary" data-preview-full>${L('Fullscreen preview','全屏预览','全螢幕預覽')}</button></div>${deckHTML(lesson,'preview')}${lesson.questions.map(q=>`<div class="tc-preview-question"><strong>${e(q.prompt)}</strong><ol type="A">${q.options.map(o=>`<li>${e(o)}</li>`).join('')}</ol>${answerHTML(q)}</div>`).join('')}</section>`;
 const candidatePanel=()=>{
  if(!candidate||candidate.index!==lessonIndex)return '';
  const actions=`<div class="row">${button('accept',L('Accept suggestion','采纳建议','採納建議'),false)}${button('regenerate',L('Not satisfied? Regenerate','不满意？重新生成','不滿意？重新產生'))}${button('discard',L('Discard','不采用','不採用'))}</div><p class="small muted">${L('Saved on this device until you accept or discard it.','在你采纳或不采用前，这份候选内容会保存在本机。','在你採納或不採用前，這份候選內容會儲存在本機。')}</p>`;
  const fromOutline=candidate.source==='outline';
  const outlineNote=fromOutline?`<p class="small muted">${L('The AI service could not finish. This editable draft uses your outline; review it and add examples and quiz questions before publishing.','AI 未能完成生成。这份可编辑初稿来自已采纳的大纲，发布前请补充案例和选择题。','AI 未能完成產生。這份可編輯初稿來自已採納的大綱，發佈前請補充案例和選擇題。')}</p>`:'';
  if(candidate.kind==='ai-lesson')return `<section class="tc-candidate"><h3>${fromOutline?L('Outline-based draft','大纲初稿','大綱初稿'):L('Preview AI suggestion','预览 AI 建议','預覽 AI 建議')}</h3>${outlineNote}<details><summary>${L('Current lesson','修改前','修改前')}</summary><div class="tc-reading">${e(draft.lessons[lessonIndex].body)}</div></details>${preview(candidate.value)}${actions}</section>`;
  return `<section class="tc-candidate"><h3>${L('Preview AI outline','预览 AI 大纲','預覽 AI 大綱')}</h3><ol class="tc-outline-preview">${candidate.value.lessons.map((l,i)=>`<li><article><h4><span>${i+1}.</span> ${e(l.title)}</h4>${l.body?`<p>${e(l.body)}</p>`:''}</article></li>`).join('')}</ol><p>${L('Accepting replaces the draft outline. Each lesson body is an outline summary; generate full content for each lesson.','采纳后会替换草稿目录，每节课正文为大纲摘要，可逐节生成完整内容。')}</p>${actions}</section>`;
 };
 const previewQuestions=lesson=>lesson.questions.map(q=>`<details class="tc-preview-question"><summary>${e(q.prompt)}</summary><ol type="A">${q.options.map((o,i)=>`<li>${e(o)}${i===q.correctIndex?' ✓':''}</li>`).join('')}</ol>${answerHTML(q)}</details>`).join('');
 const pad2=n=>String(n).padStart(2,'0');
 const previewLessonHTML=(lesson,index)=>`<article class="panel tc-preview-lesson" data-preview-lesson="${index}" data-lesson-preview><div class="row between"><h2><span class="tc-preview-no">${pad2(index+1)}</span> ${e(lesson.title)}</h2><button type="button" class="btn secondary" data-preview-full>${L('Fullscreen preview','全屏预览','全螢幕預覽')}</button></div>${deckHTML(lesson,'published-'+index,true,previewState.course.language,true)}${previewQuestions(lesson)}</article>`;
 const fullscreenLessonHTML=(lesson,index)=>`<article class="panel tc-preview-lesson" data-fullscreen-lesson="${index}"><div class="row between"><h2><span class="tc-preview-no">${pad2(index+1)}</span> ${e(lesson.title)}</h2></div>${deckHTML(lesson,'fullscreen-'+index,true,previewState.course.language,true)}${previewQuestions(lesson)}</article>`;
 const courseOutlineHTML=(course,activeIndex)=>`<div class="tc-course-outline"><div class="dl-panel-title"><span>${L('Course','课程','課程')}</span><small>${course.lessons.length} ${L('lessons','节','節')}</small></div>${course.lessons.map((lesson,index)=>{
  const slides=lesson.slides||[];
  const steps=slides.map((slide,i)=>`<button type="button" data-preview-step="${index}:${i}"><span>${pad2(index+1)}.${i+1}</span>${e(slide.heading)}</button>`).join('');
  return `<section class="dl-lesson-group${index===activeIndex?' is-active':''}" data-outline-group="${index}"><button type="button" class="dl-lesson-head" data-outline-toggle="${index}" aria-expanded="${index===activeIndex}"><span class="dl-lesson-no">${pad2(index+1)}</span><strong>${e(lesson.title)}</strong><i class="dl-caret" aria-hidden="true"></i></button><div class="dl-steps dl-step-links"${index===activeIndex?'':' hidden'}>${steps||`<p class="small muted">${L('No courseware yet','暂无课件','暫無課件')}</p>`}</div></section>`;
 }).join('')}</div>`;
 let previewObserver=null,previewActive=null;
 const mountPreviewLesson=section=>{
  if(!section)return;
  const wrapper=section.querySelector('[data-teaching-player]');if(!wrapper||wrapper===previewActive)return;
  const lesson=teachingLessonForPlayer(JSON.parse(wrapper.dataset.teachingPlayer),{clips:narrationClips,language:wrapper.dataset.contentLanguage||draft?.language||locale});
  const outline={embedded:true,lessons:courseOutlineLessons()};
  wrapper.innerHTML=lessonPlayerHTML(lesson,locale,outline);
  mountLessonPlayer(lesson,{profile:{},lang:locale},()=>{},locale,0,undefined,{...outline,root:wrapper.querySelector('[data-delivery-player]')});
  previewActive=wrapper;
 };
 const renderPreview=()=>{
  const {course,fromEditor}=previewState;
  previewObserver?.disconnect();previewActive=null;
  root.innerHTML=heading(course.title,course.description||'')+`<div class="tc-toolbar">${personal&&/^study-\d+$/.test(String(index))?'<a class="btn secondary" href="#path">'+L('Back to learning paths','返回学习路径','返回學習路徑')+'</a>':fromEditor?button('preview-exit',L('Back to editor','返回编辑','返回編輯')):button('back-courses','← '+L('My courses','我的课程','我的課程'))}<span class="pill">${personal?L('Your course','你的课程','你的課程'):L('Published version','已发布版本','已發佈版本')}</span></div><div class="tc-editor"><aside class="panel tc-outline">${/^study-\d+$/.test(String(index))?`<p>${L('Current lesson','当前学习课节','目前學習課節')}</p><strong>${e(course.lessons[previewState.index]?.title)}</strong>`:courseOutlineHTML(course,previewState.index)}</aside><div class="tc-preview-lessons">${course.lessons.map((lesson,i)=>/^study-\d+$/.test(String(index))&&i!==previewState.index?'':previewLessonHTML(lesson,i)).join('')}<p class="small muted">${personal&&/^study-\d+$/.test(String(index))?L('Use the button below after finishing.','学完后可点击下方按钮记录完成。','學完後可點擊下方按鈕記錄完成。'):personal?L('Read-only preview of your course. Answers and progress are not recorded.','这是你自己课程的只读预览，不会记录答题与学习进度。','這是你自己課程的唯讀預覽，不會記錄答題與學習進度。'):L('Read-only preview of the published version. Answers and progress are not recorded.','这是已发布版本的只读预览，不会记录答题与学习进度。','這是已發佈版本的唯讀預覽，不會記錄答題與學習進度。')}</p>${personal&&/^study-\d+$/.test(String(index))?button('complete-personal-study',L('Complete this lesson','完成本节学习','完成本節學習'),false):''}</div></div>`;
  previewObserver=new IntersectionObserver(entries=>{
   if(!alive||!previewState)return;
   for(const entry of entries){if(!entry.isIntersecting)continue;const index=Number(entry.target.dataset.previewLesson);previewState.index=index;root.querySelectorAll('[data-outline-group]').forEach(el=>el.classList.toggle('is-active',Number(el.dataset.outlineGroup)===index));mountPreviewLesson(entry.target);}
  },{threshold:0.1});
  root.querySelectorAll('[data-preview-lesson]').forEach(el=>previewObserver.observe(el));
 };
 const showPublishedPreview=async(course,index=0,fromEditor=false)=>{
  if(!course?.published){status(L('Publish the course first to preview it.','请先发布课程再预览。','請先發佈課程再預覽。'));return;}
  await loadNarration(course.id).catch(()=>{});if(!alive)return;
  previewState={course:course.published,index:Math.min(Math.max(index,0),course.published.lessons.length-1),fromEditor};
  renderPreview();
 };
 const showPersonalPreview=async(course,index=0,fromEditor=false)=>{
  await loadNarration(course.id).catch(()=>{});if(!alive)return;
  previewState={course:course.draft,index:Math.min(Math.max(index,0),course.draft.lessons.length-1),fromEditor};
  renderPreview();
 };
 const backToCourses=async()=>{
  previewState=null;
  if(location.hash===listHash)await courses();else location.hash=listHash;
 };
 async function courses(){
  if(personal){
   const data=await personalAPI();if(!alive)return;courseList=data.courses;
   root.innerHTML=`<div class="tc-toolbar">${button('create',L('Create a mini-course','创建迷你课程','建立迷你課程'),false)}${button('show-library',L('Adapt an existing course','改编现有课程','改編現有課程'))}</div><p data-teach-status role="status"></p><div class="course-grid">${data.courses.map(c=>`<article class="panel tc-course-card"><div class="row between"><h2>${e(c.title)}</h2>${courseBookmarkButton('personal:'+c.id,bookmarks.includes('course:personal:'+c.id),locale,{title:c.title,route:'#personal-course/'+c.id+'/study-0'})}</div><p>${e(c.description)}</p><p class="small muted">${L('Saved course','已保存课程','已儲存課程')} · ${L('Revision','版本','版本')} ${c.revision}</p><div class="row"><a class="btn secondary" href="#personal-course/${c.id}">${L('Edit course','编辑课程','編輯課程')}</a>${button('study-course',L('Study','开始学习','開始學習'),false,`data-id="${c.id}"`)}${button('delete-course',L('Delete','删除','刪除'),true,`data-id="${c.id}"`)}</div></article>`).join('')}</div>${data.courses.length?'':`<section class="panel"><p>${L('Create a course around your own topic, or adapt an official course to begin.','围绕自己的主题新建课程，或改编已有课程开始。','圍繞自己的主題建立課程，或改編已有課程開始。')}</p></section>`}<div data-course-library hidden class="panel mt"><h2>${L('Official course library','官方课程库','官方課程庫')}</h2><p>${L('Creates your own editable copy. The original animated lessons stay unchanged.','创建你自己的可编辑副本，官方动画课程保持不变。','建立你自己的可編輯副本，官方動畫課程保持不變。')}</p><div class="tc-library">${curriculum.flatMap(t=>t.courses).map(c=>button('copy',e(locale==='en'?c.en:c.title),true,`data-source="${c.id}"`)).join('')}</div></div>`;
   return;
  }
  const data=await api('courses');if(!alive)return;courseList=data.courses;
  root.innerHTML=heading(L('My courses','我的课程','我的課程'))+`<div class="tc-toolbar">${button('create',L('Create a mini-course','创建迷你课程','建立迷你課程'),false)}${button('show-library',L('Adapt an existing course','改编现有课程','改編現有課程'))}</div><p data-teach-status role="status"></p><div class="course-grid">${data.courses.map(c=>`<article class="panel tc-course-card"><h2>${e(c.title)}</h2><p>${e(c.description)}</p><p class="small muted">${c.published?L('Published','已发布','已發佈'):L('Draft','草稿','草稿')} · ${L('Revision','版本','版本')} ${c.revision}</p><div class="row"><a class="btn secondary" href="#teacher-course/${c.id}">${L('Edit course','编辑课程','編輯課程')}</a>${c.published?button('preview-course',L('Preview published','预览发布版','預覽發佈版'),true,`data-id="${c.id}"`):''}${c.published?'':button('publish-course',L('Publish','发布','發佈'),true,`data-id="${c.id}"`)}${button('delete-course',L('Delete','删除','刪除'),true,`data-id="${c.id}"`)}</div></article>`).join('')}</div>${data.courses.length?'':`<section class="panel"><p>${L('Create a course or adapt an official course to begin.','先新建一门课程，或改编已有课程。')}</p></section>`}<div data-course-library hidden class="panel mt"><h2>${L('Official course library','官方课程库','官方課程庫')}</h2><p>${L('Creates your own editable teaching-text copy with scene templates. Original animated lessons stay unchanged.','创建你自己的教学文本副本，配合可编辑场景模板，官方动画课程保持不变。')}</p><div class="tc-library">${curriculum.flatMap(t=>t.courses).map(c=>button('copy',e(locale==='en'?c.en:c.title),true,`data-source="${c.id}"`)).join('')}</div></div>`;
 }
 async function saveCourse(publish=false){
  if(personal){
   if(!draft.title.trim()){status(L('Enter a course title first.','请先填写课程标题。','請先填寫課程標題。'));return;}
   changed();await autosaver.flush();status(L('Course saved.','课程已保存。','課程已儲存。'));return true;
  }
  if(publish&&draft.lessons.some(l=>!Array.isArray(l.slides)||l.slides.length<1)){status(errors.incomplete_courseware);return;}
  if(!draft.title.trim()){status(L('Enter a course title first.','请先填写课程标题。','請先填寫課程標題。'));return;}
  changed();await autosaver.flush();
  if(publish){
   autosaver.pause();
   try{const published=await api('courses',{action:'publish',id:record.id,revision:record.revision});record=published.course;backup();}
   finally{autosaver.resume();}
  }
  status(publish?L('Published. Its class is ready; add students from My classrooms.','已发布，教学班已自动建立，请前往“教学班”添加学生。','已發佈，教學班已自動建立，請前往「教學班」新增學生。'):L('Draft saved.','草稿已保存。','草稿已儲存。'));
  return true;
 }
 async function classroomPage(){
  const [data,coursesData,studentData]=await Promise.all([api('classrooms'),api('courses'),api('students').catch(()=>({students:[]}))]);if(!alive)return;
  courseList=coursesData.courses;const roster=studentData.students||[];
  root.innerHTML=heading(L('My classrooms','教学班','教學班'),L('Publishing a course creates its class automatically. Rename the class or manage students here.','发布课程后自动建立同名教学班，可在这里改名、添加或移出学生。','發佈課程後自動建立同名教學班，可在這裡改名、新增或移出學生。'))+`<p data-teach-status role="status"></p>${data.classrooms.length?'':`<section class="panel"><p>${L('Publish a course to create its class.','发布一门课程后，这里会自动出现对应的教学班。','發佈一門課程後，這裡會自動出現對應的教學班。')}</p><a class="btn secondary" href="#courses">${L('My courses','我的课程','我的課程')}</a></section>`}${data.classrooms.map(c=>{
   const members=(c.teaching_members||[]),joined=new Map(members.map(m=>[m.student_id,m.username||m.student_id]));
   return `<section class="panel mt tc-class"><div class="row between"><h2>${e(c.name)}</h2><span class="pill">${L('Students','学生','學生')} ${members.length}</span></div><div class="row tc-class-actions">${button('remove-all-students',L('Remove all students','一键移出全部学生','一鍵移出全部學生'),true,`data-class="${c.id}" ${members.length?'':'disabled'}`)}${button('delete-class',L('Delete class','删除教学班','刪除教學班'),true,`data-class="${c.id}"`)}</div><details class="tc-picker"><summary>${L('Select students with checkboxes','直接勾选学生','直接勾選學生')}</summary>${roster.length?`<form data-teach-form="import" data-class="${c.id}"><input type="search" data-student-search placeholder="${L('Search students…','搜索学生…','搜尋學生…')}" aria-label="${L('Search students','搜索学生','搜尋學生')}"><div class="tc-student-list">${roster.map(s=>{const inClass=joined.has(s.id);return `<label class="tc-student-option${inClass?' joined':''}"><input type="checkbox" name="students" value="${e(s.username)}" ${inClass?'checked disabled':''}><span>${e(s.username)}</span>${inClass?`<em>${L('In class','已加入','已加入')}</em>`:''}</label>`;}).join('')}</div><button class="btn secondary" type="submit">${L('Add selected students','加入所选学生','加入所選學生')}</button></form>`:`<p class="small muted">${L('No student accounts were found. Students register on the sign-in page first.','未找到学生账号，请学生先注册。','未找到學生帳號，請學生先註冊。')}</p>`}</details><details class="mt"><summary>${L('Rename class','修改班名','修改班名')}</summary><form data-teach-form="rename-class" data-class="${c.id}" class="row mt"><label>${L('Class name','班级名称','班級名稱')}<input name="name" value="${e(c.name)}" required maxlength="160"></label><button class="btn secondary" type="submit">${L('Save name','保存名称','儲存名稱')}</button></form></details><div class="tc-members mt">${members.map(m=>`<span class="pill tc-member">${e(m.username||m.student_id)} ${button('remove-student',L('Remove','移出','移出'),true,`data-class="${c.id}" data-student="${e(m.student_id)}" aria-label="${e(L('Remove ','移出学生 ','移出學生 ')+(m.username||m.student_id))}"`)}</span>`).join('')||`<span class="small muted">${L('No students yet.','尚无学生。','尚無學生。')}</span>`}</div></section>`;
  }).join('')}`;
 }
 async function analyticsPage(){
  const data=await api('analytics');if(!alive)return;analytics=data.rows||[];
  root.innerHTML=heading(L('Class participation','班级参与情况','班級參與情況'),L('Active time is a participation signal, not a measure of attention or mastery.','有效学习时间是参与指标，不代表专注程度或知识掌握程度。'))+button('export',L('Export CSV','导出 CSV','匯出 CSV'))+`<p data-teach-status role="status"></p><div class="table-wrap mt"><table><thead><tr>${[L('Student','学生','學生'),L('Class','班级','班級'),L('Course','课程','課程'),L('Completed lessons','完成课节','完成課節'),L('Active minutes','有效分钟','有效分鐘'),L('Correct / attempts','答对 / 尝试','答對 / 嘗試'),L('Last active','最近活动','最近活動')].map(t=>`<th>${t}</th>`).join('')}</tr></thead><tbody>${analytics.map(r=>`<tr><td>${e(r.username||r.student_id)}</td><td>${e(r.classroom_name)}</td><td>${e(r.course_title)}</td><td>${r.completed_lessons??0}/${r.total_lessons??0}</td><td>${Math.round((r.active_seconds||0)/60)}</td><td>${r.correct_attempts??0}/${r.quiz_attempts??0}</td><td>${r.last_active?e(new Date(r.last_active).toLocaleString(locale)):'—'}</td></tr>`).join('')}</tbody></table></div>${analytics.length?'':`<section class="panel mt"><p>${L('Assign a course to students to see their actual activity here.','分配课程给学生后，这里将展示实际学习记录。')}</p></section>`}`;
 }
 async function studentPage(){
  const data=await api('assignments'+(id?'&id='+encodeURIComponent(id):''));if(!alive)return;
  if(!id){root.innerHTML=`<div class="course-grid">${data.assignments.map(a=>`<article class="panel"><div class="row between"><h2>${e(a.published_snapshot?.title||a.course_title)}</h2>${courseBookmarkButton('assigned:'+a.id,bookmarks.includes('course:assigned:'+a.id),locale,{title:a.published_snapshot?.title||a.course_title,route:'#assigned/'+a.id+'/0'})}</div><p>${e(a.classroom_name||'')}</p><a href="#assigned/${a.id}/0">${L('Open course','进入课程','進入課程')} →</a></article>`).join('')}</div>${data.assignments.length?'':`<section class="panel"><p>${L('No assigned courses yet.','老师暂未分配课程。')}</p></section>`}`;return;}
  await loadNarration(data.assignment.course_id).catch(()=>{});
  const assignment=data.assignment,snapshot=assignment.published_snapshot,lesson=snapshot.lessons[Math.min(Math.max(Number(index)||0,0),snapshot.lessons.length-1)];
  root.innerHTML=heading(snapshot.title)+`<a href="#assigned">← ${L('Assigned courses','老师布置的课程','老師指派的課程')}</a><div class="tc-editor mt"><aside class="panel tc-outline">${snapshot.lessons.map((l,i)=>`<a class="tc-lesson-tab" href="#assigned/${id}/${i}">${i+1}. ${e(l.title)}</a>`).join('')}</aside><article class="panel"><section data-lesson-preview><div class="row between"><h2>${e(lesson.title)}</h2><button type="button" class="btn secondary" data-preview-full>${L('Fullscreen preview','全屏预览','全螢幕預覽')}</button></div>${deckHTML(lesson,'lesson',false,snapshot.language)}</section>${lesson.questions.map(q=>`<form data-teach-form="attempt" data-lesson="${e(lesson.id)}" data-question="${e(q.id)}" class="tc-preview-question"><fieldset><legend>${e(q.prompt)}</legend>${q.options.map((o,i)=>`<label class="tc-choice"><input type="radio" name="choice" value="${i}" required> ${e(o)}</label>`).join('')}</fieldset><button class="btn secondary">${L('Check answer','检查答案','檢查答案')}</button><p data-answer-result role="status"></p></form>`).join('')}${button('complete',L('Mark lesson complete','完成本节','完成本節'),false,`data-lesson="${e(lesson.id)}"`)}<p data-teach-status role="status"></p></article></div>`;
  await api('activity',{assignmentId:id,lessonId:lesson.id,eventId:crypto.randomUUID(),eventType:'enter',activeSeconds:0});
  lastInteraction=Date.now();lastBeat=Date.now();
  timer=setInterval(()=>{
   const now=Date.now(),seconds=Math.min(30,Math.floor((now-lastBeat)/1000));lastBeat=now;
   if(document.hidden||now-lastInteraction>60000||seconds<=0)return;
   void api('activity',{assignmentId:id,lessonId:lesson.id,eventId:crypto.randomUUID(),eventType:'heartbeat',activeSeconds:seconds}).catch(()=>status(L('Activity could not sync. Check your connection.','学习记录暂未同步，请检查连接。')));
  },20000);
 }
 async function load(){root.innerHTML=`<p>${L('Loading…','正在读取…','正在讀取…')}</p>`;try{
  if(personal){
   if(page==='personal-course'){
    if(!id){location.hash='personal-courses';return;}
    if(id==='new'){
     record=null;draft={title:'',description:'',language:locale,lessons:[blankLesson()]};try{const saved=JSON.parse(localStorage.getItem(backupKey())||'null');if(saved?.candidate)candidate=saved.candidate;if(saved?.draft)draft=saved.draft;}catch{/* Ignore an unusable local backup. */}
     const handoff=takeCourseHandoff(user?.id);
     if(handoff){pendingPlanId=typeof handoff.planId==='string'?handoff.planId:null;const lessonFrom=l=>{const base=blankLesson();return {...base,title:String(l.title||'').trim().slice(0,180)||base.title,body:String(l.body||'').slice(0,18000)};};draft={title:String(handoff.title||'').slice(0,180),description:String(handoff.description||'').slice(0,3000),language:['zh-CN','zh-TW','en'].includes(handoff.language)?handoff.language:locale,lessons:handoff.lessons.slice(0,10).map(lessonFrom)};}
     draft.lessons=draft.lessons.map(ensureScene);lessonIndex=0;editor();if(draft.title.trim())autosaver.change();return;
    }
    const data=await cloudAPI('/api/teaching?resource=personal-courses&id='+encodeURIComponent(id));if(!alive)return;record=data.course;draft={...structuredClone(record.draft),authorMaterials:record.author_materials||''};await loadNarration(record.id).catch(()=>{});
    try{const saved=/^study-\d+$/.test(String(index))?null:JSON.parse(localStorage.getItem(backupKey())||'null');if(saved?.candidate)candidate=saved.candidate;if(saved?.draft){draft=saved.draft;autosaver.change();saveMessage=L('Recovered this device backup; it will be saved as the next server version.','已恢复本机备份，将自动保存为服务器的新版本。','已恢復本機備份，將自動儲存為伺服器的新版本。');}}catch{/* Ignore an unusable local backup. */}
    draft.lessons=draft.lessons.map(ensureScene);if(/^study-\d+$/.test(String(index))){const selected=Number(String(index).slice(6));await showPersonalPreview({...record,draft},selected,false);return;}editor();return;
   }
   await courses();return;
  }
  if(page==='teacher-course'){
   if(id==='new'){record=null;draft={title:'',description:'',language:locale,lessons:[blankLesson()]};try{const saved=JSON.parse(localStorage.getItem(backupKey())||'null');if(saved?.candidate)candidate=saved.candidate;if(saved?.draft)draft=saved.draft;}catch{/* Ignore an unusable local backup. */}draft.lessons=draft.lessons.map(ensureScene);lessonIndex=0;editor();if(draft.title.trim())autosaver.change();return;}
   const data=await api('courses&id='+encodeURIComponent(id));if(!alive)return;record=data.course;draft={...structuredClone(record.draft),authorMaterials:record.author_materials||''};await loadNarration(record.id).catch(()=>{});
   try{const saved=/^study-\d+$/.test(String(index))?null:JSON.parse(localStorage.getItem(backupKey())||'null');if(saved?.candidate)candidate=saved.candidate;if(saved?.draft){draft=saved.draft;autosaver.change();saveMessage=L('Recovered this device backup; it will be saved as the next server version.','已恢复本机备份，将自动保存为服务器的新版本。','已恢復本機備份，將自動儲存為伺服器的新版本。');}}catch{/* Ignore an unusable local backup. */}
   draft.lessons=draft.lessons.map(ensureScene);
   editor();
  }else if(page==='courses')await courses();else if(page==='classrooms')await classroomPage();else if(page==='engagement')await analyticsPage();else await studentPage();
 }catch(error){if(alive)root.innerHTML=heading(L('Unable to load','暂时无法读取','暫時無法讀取'))+`<section class="panel"><p>${e(errorText(error))}</p><p>${personal?L('If the personal-course table is not installed, run supabase/migrations/202611050001_personal_courses.sql in Supabase SQL Editor first.','若个人课程表尚未安装，请先在 Supabase SQL Editor 执行 supabase/migrations/202611050001_personal_courses.sql。','若個人課程表尚未安裝，請先在 Supabase SQL Editor 執行 supabase/migrations/202611050001_personal_courses.sql。'):L('If the teaching tables are not installed, run the teacher-course migration in Supabase SQL Editor first.','若教师课程表尚未安装，请先在 Supabase SQL Editor 执行教师课程迁移文件。')}</p>${button('reload',L('Retry','重试','重試'))}</section>`;}}
 const input=event=>{
  const el=event.target;
  if(el.hasAttribute('data-student-search')){
   const query=el.value.trim().toLowerCase();
   el.closest('form')?.querySelectorAll('.tc-student-option').forEach(option=>{option.hidden=!!query&&!option.textContent.toLowerCase().includes(query);});
  }
  if(!draft||!el.matches('[data-course-field],[data-lesson-field],[data-materials],[data-question-field],[data-slide-field]'))return;
  if(el.dataset.courseField)draft[el.dataset.courseField]=el.value;
  if(el.dataset.lessonField)draft.lessons[lessonIndex][el.dataset.lessonField]=el.value;
  if(el.hasAttribute('data-materials'))draft.authorMaterials=el.value;
  if(el.dataset.questionField){const q=draft.lessons[lessonIndex].questions[Number(el.closest('[data-question]').dataset.question)],key=el.dataset.questionField;q[key]=key==='options'?el.value.split('\n'):key==='correctIndex'?Number(el.value)-1:el.value;}
  if(el.dataset.slideField){
   const slide=draft.lessons[lessonIndex].slides?.[Number(el.closest('[data-slide]').dataset.slide)];
   if(slide){
    const field=el.dataset.slideField,lines=el.value.split('\n').map(line=>line.trim()).filter(Boolean);
    if(field==='heading'){const value=el.value.trim();if(value)slide.heading=value.slice(0,120);}
    if(field==='concept'){const value=el.value.trim();if(value)slide.concept=value.slice(0,120);else delete slide.concept;}
    if(field==='bullets'){const value=lines.slice(0,6);if(value.length)slide.bullets=value.map(line=>line.slice(0,200));}
    if(field==='script'){const value=lines.slice(0,5);if(value.length)slide.script=value.map(line=>line.slice(0,300));else delete slide.script;}
    if(field==='items'){const value=lines.slice(0,5);slide.art={...(slide.art||{}),scene:slide.art?.scene||'auto',items:(value.length?value:[slide.heading]).map(item=>item.slice(0,80))};}
   }
  }
  changed();
 };
 const narrationStatus=message=>{root.querySelectorAll('[data-narration-status],[data-lesson-narration-status]').forEach(el=>{el.textContent=message;});};
 const click=async event=>{
  const el=event.target.closest('[data-teach]');if(!el||busy)return;const action=el.dataset.teach;
  busy=true;el.disabled=true;
  try{
   if(action==='generate-narration'||action==='generate-lesson-narration'){
    const single=action==='generate-lesson-narration',scope=single?[draft.lessons[lessonIndex]]:draft.lessons;
    const lessons=scope.filter(isNarratableLesson);
    if(!lessons.length||(single&&lessons.length!==scope.length)){narrationStatus(single?L('This lesson needs at least one slide before narration.','这一节需要至少一页幻灯片后才能配音。','這一節需要至少一頁幻燈片後才能配音。'):errors.incomplete_courseware);return;}
    narrationRunning=true;
    try{
     changed();await autosaver.flush();await loadNarration(record.id);
     if(!narrationConfigured)throw Error('narration_not_configured');
     const narrationRecord=structuredClone(record);
     await runBackgroundWork({kind:'narration',key:'narration:'+record.id+':'+(single?lessons[0].id:'all'),title:L('Course narration','课程配音','課程配音')+' · '+draft.title,route:(personal?'#personal-course/':'#teacher-course/')+record.id},async report=>{
     const slides=lessons.flatMap(lesson=>lesson.slides.map((_,slideIndex)=>({lesson,slideIndex})));let done=0;
     for(const {lesson,slideIndex} of slides){
      if(!backgroundAI.owns(user.id))throw Error('account_changed');
      report((done+1)+'/'+slides.length);
      if(alive)narrationStatus(L(`Generating narration ${done+1}/${slides.length}…`,`正在生成配音 ${done+1}/${slides.length}…`,`正在產生配音 ${done+1}/${slides.length}…`));
      const result=await cloudAPI('/api/course-narration',{courseId:narrationRecord.id,revision:narrationRecord.revision,lessonId:lesson.id,slideIndex},undefined,{background:false});
      narrationClips=narrationClips.filter(c=>c.key!==result.clip.key).concat(result.clip);done++;
      if(alive&&single){const recorded=lessonNarrationCount(lesson),steps=lesson.slides.length;root.querySelectorAll('[data-lesson-narration-count]').forEach(el=>{el.textContent=L(`Narration: ${recorded}/${steps} steps recorded.`,`本节配音：${recorded}/${steps} 个分镜已完成。`,`本節配音：${recorded}/${steps} 個分鏡已完成。`);});}
     }
     return {message:L('Narration saved. Open your course to listen.','配音已保存，到我的课程打开课件即可试听。','配音已儲存，到我的課程開啟課件即可試聽。')};});
     if(alive){editor();narrationStatus(L('Narration is ready. Preview and press play to listen.','配音已完成，打开课件预览并点击播放即可试听。','配音已完成，開啟課件預覽並點擊播放即可試聽。'));}
    }catch(error){if(alive){editor();narrationStatus(errors[error.message]||errorText(error));}}finally{narrationRunning=false;}
    return;
   }
   if(action==='reload')return await load();
   if(action==='show-library'){root.querySelector('[data-course-library]').hidden=false;return;}
   if(action==='create'){
    record=null;draft={title:'',description:'',language:locale,lessons:[blankLesson()]};lessonIndex=0;changed();location.hash=(personal?'personal-course':'teacher-course')+'/new';return;
   }
   if(action==='copy'){
    const course=officialCourseCopy(el.dataset.source,locale);
    const result=personal?await personalAPI({action:'save',course,sourceId:el.dataset.source||null}):await api('courses',{action:'save',course,sourceId:el.dataset.source||null});
    location.hash=(personal?'personal-course/':'teacher-course/')+result.course.id;
   }
   if(action==='publish-course'){
    const course=courseList.find(c=>c.id===el.dataset.id);if(!course)return;
    await api('courses',{action:'publish',id:course.id,revision:course.revision});await courses();status(L('Published. Its teaching class is ready.','已发布，对应教学班已自动建立。','已發佈，對應教學班已自動建立。'));
   }
   if(action==='delete-course'){
    if(!confirm(personal?L('Delete this course permanently?','确定永久删除这门课程吗？','確定永久刪除這門課程嗎？'):L('Delete this course and its corresponding classes? Students will lose course access. Accounts and learning history are kept.','删除这门课程并同步移除对应教学班？学生将无法继续访问该课程，账号和历史学习记录保留。','刪除這門課程並同步移除對應教學班？學生將無法繼續存取該課程，帳號和歷史學習紀錄保留。')))return;
    await cloudAPI('/api/teaching?resource='+(personal?'personal-courses':'courses')+'&id='+encodeURIComponent(el.dataset.id),null,'DELETE');await courses();status(personal?L('Course deleted.','课程已删除。','課程已刪除。'):L('Course and corresponding classes removed.','课程及对应教学班已同步移除。','課程及對應教學班已同步移除。'));
   }
   if(action==='complete-personal-study'){onStudyComplete?.(record.id,Number(String(index).slice(6)),record.draft.lessons[Number(String(index).slice(6))]?.id);el.textContent=L('Completed','已完成','已完成');return;}
   if(action==='study-course'){const data=await cloudAPI('/api/teaching?resource=personal-courses&id='+encodeURIComponent(el.dataset.id));if(!alive)return;await showPersonalPreview(data.course,0,false);return;}
   if(action==='preview-course'){if(personal)return;const data=await api('courses&id='+encodeURIComponent(el.dataset.id));if(!alive)return;showPublishedPreview(data.course,0,false);return;}
   if(action==='preview-published'&&record?.published){showPublishedPreview(record,0,true);return;}
   if(action==='preview-exit'){previewState=null;editor();return;}
   if(action==='back-courses'){await backToCourses();return;}
   if(action==='lesson'){backup();lessonIndex=Number(el.dataset.index);editor();}
   if(action==='add-lesson'){draft.lessons.push(blankLesson());lessonIndex=draft.lessons.length-1;changed();editor();}
   if(action==='delete-lesson'){if(!confirm(L('Remove this lesson from the draft?','从草稿中删除本节课吗？')))return;draft.lessons.splice(lessonIndex,1);lessonIndex=0;candidate=null;changed();editor();}
   if(action==='delete-class'){
    if(!confirm(L('Delete this class? The course, student accounts and learning history are kept. Students lose access through this class.','删除这个教学班？课程、学生账号和历史学习记录保留，学生将失去本班的课程访问权限。','刪除這個教學班？課程、學生帳號和歷史學習紀錄保留，學生將失去本班的課程存取權限。')))return;
    await cloudAPI('/api/teaching?resource=classrooms&id='+encodeURIComponent(el.dataset.class),null,'DELETE');await classroomPage();status(L('Class deleted.','教学班已删除。','教學班已刪除。'));return;
   }
   if(action==='remove-all-students'){
    if(!confirm(L('Remove every student from this class? Accounts and learning history are kept.','将本班所有学生移出？学生账号和历史学习记录保留。','將本班所有學生移出？學生帳號和歷史學習紀錄保留。')))return;
    const result=await api('classrooms',{action:'remove-all-students',classroomId:el.dataset.class});await classroomPage();status(L(`Removed ${result.removed} students.`,`已移出 ${result.removed} 名学生。`,`已移出 ${result.removed} 名學生。`));return;
   }
   if(action==='remove-student'){await api('classrooms',{action:'remove-student',classroomId:el.dataset.class,studentId:el.dataset.student});await classroomPage();status(L('Student removed from this class. Their account and history are kept.','已将学生移出本班，账号和历史学习记录保留。','已將學生移出本班，帳號和歷史學習紀錄保留。'));return;}
   if(action==='save'||action==='publish'){const saved=await saveCourse(action==='publish');if(action==='publish'&&saved){editor();status(L('Published. You can now preview the published version.','已发布，现在可以预览发布版。','已發佈，現在可以預覽發佈版。'));}}
   if(action==='add-question'){draft.lessons[lessonIndex].questions.push({id:'q-'+crypto.randomUUID(),prompt:'',options:['',''],correctIndex:0,explanation:''});changed();editor();}
   if(action==='remove-question'){draft.lessons[lessonIndex].questions.splice(Number(el.dataset.index),1);changed();editor();}
   if(action==='add-slide'){const lesson=draft.lessons[lessonIndex];lesson.slides=lesson.slides||[];lesson.slides.push(blankSlide());changed();editor();root.querySelector(`[data-slide="${lesson.slides.length-1}"]`)?.scrollIntoView({behavior:'smooth',block:'center'});}
   if(action==='remove-slide'){
    const lesson=draft.lessons[lessonIndex],slides=lesson.slides||[],index=Number(el.dataset.index);
    if(slides.length<=1){if(!confirm(L('Remove the last slide? The lesson will need a new slide before it can be published.','删除最后一页幻灯片？这节课需要重新添加幻灯片后才能发布。','刪除最後一頁幻燈片？這節課需要重新新增幻燈片後才能發佈。')))return;delete lesson.slides;}
    else slides.splice(index,1);
    changed();editor();return;
   }
   if(action==='move-slide-up'||action==='move-slide-down'){
    const slides=draft.lessons[lessonIndex].slides||[],index=Number(el.dataset.index),target=action==='move-slide-up'?index-1:index+1;
    if(target<0||target>=slides.length)return;
    [slides[index],slides[target]]=[slides[target],slides[index]];changed();editor();return;
   }
   if(action==='preview'){const slot=root.querySelector('[data-ai-manual-preview]');if(slot)slot.innerHTML=`<section class="tc-candidate"><h3>${L('Preview current draft','预览当前草稿','預覽目前草稿')}</h3>${preview(draft.lessons[lessonIndex])}</section>`;}
   if(action==='ai-outline'||action==='ai-lesson'||action==='regenerate'){
    const aiAction=action==='regenerate'?lastAIAction:action;if(!aiAction)return;lastAIAction=aiAction;
    if(aiAction==='ai-lesson'&&!(draft.lessons.length>1||draft.lessons[0]?.body.trim())){aiStatus(L('Generate and accept a course outline in step 1 first.','请先在“第 1 步”生成并采纳课程大纲。','請先在「第 1 步」產生並採納課程大綱。'));return;}
    if(!draft.title.trim()){aiStatus(L('Enter a course title first.','请先填写课程标题。','請先填寫課程標題。'));return;}
    // The draft is already backed up locally; a failed sync must not block AI.
    changed();try{await autosaver.flush();}catch{/* Retried by the autosave schedule. */}
    const targetIndex=lessonIndex,instruction=root.querySelector('#tc-instruction')?.value||'';
    const started=Date.now(),progress=()=>alive&&aiStatus(L(`Generating in background; may take about 5 minutes. ${Math.round((Date.now()-started)/1000)}s`,`后台生成中，可能需要约 5 分钟，可切换站内页面。已等待 ${Math.round((Date.now()-started)/1000)} 秒`,`背景產生中，可能需要約 5 分鐘，可切換站內頁面。已等待 ${Math.round((Date.now()-started)/1000)} 秒`));
    progress();const poll=setInterval(progress,1000);
    let result;try{result=await cloudAPI('/api/course-ai',{action:aiAction==='ai-outline'?'outline':'lesson',language:draft.language,topic:draft.title,requirements:draft.authorMaterials||draft.description,instruction,courseId:record?.id,...(aiAction==='ai-lesson'?{lesson:draft.lessons[lessonIndex],production:'lesson-draft'}:{})});}finally{clearInterval(poll);}
    if(aiAction==='ai-lesson'&&!hasCompleteCourseware(result.lesson))throw Error('invalid_ai_result');
    candidate={kind:aiAction,index:targetIndex,value:aiAction==='ai-lesson'?result.lesson:result.course,source:result.source,taskId:backgroundAI.candidate(record?.id,(personal?'#personal-course/':'#teacher-course/')+record?.id)?.id};
    if(!alive){try{const current=JSON.parse(localStorage.getItem(backupKey())||'null');localStorage.setItem(backupKey(),JSON.stringify({...current,candidate}));}catch{backup();}return;}
    backup();editor();
    const reviewNote=result.qualityReview&&result.qualityReview.pass===false?L(' Automated review still has open questions; check the content before accepting.','自动复核仍有疑问，请检查内容后再采纳。','自動複核仍有疑問，請檢查內容後再採納。'):'';
    aiStatus((result.source==='outline'?L('Outline draft ready.','已生成可编辑的大纲初稿。','已產生可編輯的大綱初稿。'):result.fallbackUsed?L('The main model was busy. A free backup model generated this suggestion; it is saved on this device until you accept or discard it.','主模型繁忙，已使用免费备用模型生成候选内容；在采纳或不采用前会保存在本机。','主模型繁忙，已使用免費備用模型產生候選內容；在採納或不採用前會儲存在本機。'):L('Suggestion ready and saved on this device. Review before accepting.','候选内容已生成并保存在本机，请检查后再采纳。','候選內容已產生並儲存在本機，請檢查後再採納。'))+reviewNote);
   }
   if(action==='accept'&&candidate){
    const acceptedOutline=candidate.kind==='ai-outline';if(candidate.taskId)backgroundAI.used(candidate.taskId);
    if(acceptedOutline){draft={...candidate.value,authorMaterials:draft.authorMaterials};lessonIndex=0;}
    else{const target=draft.lessons[candidate.index];draft.lessons[candidate.index]=mergeGeneratedLesson(target,candidate.value);}
    candidate=null;changed();editor();
    status(acceptedOutline?L('Outline accepted and saving. Now generate slides for each lesson.','大纲已采纳并自动保存。现在可以逐讲生成课件。','大綱已採納並自動儲存。現在可以逐講產生課件。'):L('Accepted into draft. Saving automatically. You can voice this lesson when ready.','已采纳到草稿，正在自动保存。准备好后可为这一节生成配音。','已採納到草稿，正在自動儲存。準備好後可為這一節產生配音。'));
   }
   if(action==='clear-all'){if(confirm(L('Clear the entire draft? This cannot be undone.','清空当前整个课程草稿？此操作不可撤销。','清空目前整個課程草稿？此操作不可撤銷。'))){draft={title:'',description:'',language:draft.language,lessons:[blankLesson()],authorMaterials:''};lessonIndex=0;candidate=null;changed();editor();status('');}}if(action==='discard'){if(candidate?.taskId)backgroundAI.used(candidate.taskId);candidate=null;backup();editor();}
   if(action==='complete'){await api('activity',{assignmentId:id,lessonId:el.dataset.lesson,eventId:crypto.randomUUID(),eventType:'complete',activeSeconds:0});onStudyComplete?.(id,Number(index)||0,el.dataset.lesson);el.disabled=true;el.textContent=L('Completed','已完成','已完成');status(L('Lesson completion saved.','本节完成记录已保存。'));}
   if(action==='export'){const rows=[['student','class','course','completed_lessons','total_lessons','active_seconds','correct_attempts','quiz_attempts','last_active'],...analytics.map(r=>[r.username||r.student_id,r.classroom_name,r.course_title,r.completed_lessons,r.total_lessons,r.active_seconds,r.correct_attempts,r.quiz_attempts,r.last_active])];const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='Forma-class-participation.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  }catch(error){status(errorText(error));}finally{busy=false;el.disabled=false;}
 };
 const submit=async event=>{
  const form=event.target;if(!form.dataset.teachForm)return;event.preventDefault();if(busy)return;busy=true;const values=Object.fromEntries(new FormData(form)),button=form.querySelector('button');button.disabled=true;
  try{
   if(form.dataset.teachForm==='rename-class'){await api('classrooms',{action:'rename-class',id:form.dataset.class,name:values.name});await classroomPage();status(L('Class name saved.','班名已保存。','班名已儲存。'));}
   if(form.dataset.teachForm==='create-class'){await api('classrooms',{action:'create-class',name:values.name});await classroomPage();}
   if(form.dataset.teachForm==='import'){const usernames=new FormData(form).getAll('students').map(String).filter(Boolean);if(!usernames.length)return status(L('Select at least one student.','请至少勾选一名学生。','請至少勾選一名學生。'));const result=await api('classrooms',{action:'import',classroomId:form.dataset.class,usernames});await classroomPage();status(L('Imported: ','已导入：')+(Array.isArray(result.imported)?result.imported.length:result.imported)+L('; duplicates: ','；重复：')+(Array.isArray(result.duplicates)?result.duplicates.length:result.duplicates)+L('; missing: ','；未找到：')+(Array.isArray(result.missing)?result.missing.join(', '):result.missing));}
   if(form.dataset.teachForm==='assign'){
    const course=courseList.find(c=>c.id===values.courseId);if(!course)return status(L('Choose a course first.','请先选择课程。','請先選擇課程。'));
    if(!course.published){status(L('Publishing the draft course first…','正在先发布这门课程…','正在先發佈這門課程…'));await api('courses',{action:'publish',id:course.id,revision:course.revision});}
    await api('classrooms',{action:'assign',classroomId:form.dataset.class,courseId:course.id});await classroomPage();status(L('Course assigned to this class.','已将该课程分配给班级。','已將該課程分配給班級。'));
   }
   if(form.dataset.teachForm==='attempt'){const result=await api('attempts',{assignmentId:id,lessonId:form.dataset.lesson,questionId:form.dataset.question,choice:Number(values.choice),eventId:crypto.randomUUID()});form.querySelector('[data-answer-result]').textContent=(result.correct?L('Correct. ','回答正确。'):L('Try again. ','回答错误。'))+(result.explanation||'');}
  }catch(error){const target=form.querySelector('[data-answer-result]');if(target)target.textContent=errorText(error);else status(errorText(error));}finally{busy=false;button.disabled=false;}
 };
 const change=async event=>{if(event.target.matches('[data-import-file]')){const file=event.target.files?.[0];if(!file)return;if(file.size>20000){status(L('CSV is too large.','CSV 文件过大。'));return;}event.target.form.querySelector('textarea').value=await file.text();}};
 const slideClick=event=>{
  const step=event.target.closest('[data-slide-step]'),dot=event.target.closest('[data-slide-dot]');
  if(!step&&!dot)return;
  const deck=event.target.closest('[data-deck]');if(!deck)return;
  const slides=[...deck.querySelectorAll('[data-slide]')];
  let next=step?Number(deck.dataset.index||0)+Number(step.dataset.slideStep):Number(dot.dataset.slideDot);
  next=Math.max(0,Math.min(slides.length-1,next));deck.dataset.index=String(next);
  slides.forEach((slide,i)=>{slide.hidden=i!==next;});
  deck.querySelectorAll('[data-slide-dot]').forEach((dotEl,i)=>dotEl.classList.toggle('on',i===next));
 };
 let mountedPlayer=null;
 const playerObserver=new MutationObserver(()=>{
  if(previewState)return;
  const wrapper=[...root.querySelectorAll('[data-teaching-player]')].at(-1);
  if(wrapper===mountedPlayer)return;
  stopLessonPlayer();mountedPlayer=wrapper;
  if(wrapper){
   const lesson=teachingLessonForPlayer(JSON.parse(wrapper.dataset.teachingPlayer),{clips:narrationClips,language:wrapper.dataset.contentLanguage||draft?.language||locale});
   wrapper.innerHTML=lessonPlayerHTML(lesson,locale,{embedded:true});
   mountLessonPlayer(lesson,{profile:{},lang:locale},()=>{},locale,0,undefined,{embedded:true,root:wrapper.querySelector('[data-delivery-player]')});
  }
 });
 playerObserver.observe(root,{childList:true,subtree:true});
 const fullscreenClick=event=>{
  const open=event.target.closest('[data-preview-full]');
  if(!open)return;
  const source=open.closest('[data-lesson-preview]');if(!source)return;
  const dialog=document.createElement('dialog');dialog.className='tc-fullscreen-preview';
  dialog.setAttribute('aria-label',L('Course fullscreen preview','课程全屏预览','課程全螢幕預覽'));
  const bar=document.createElement('div');bar.className='tc-fullscreen-bar';
  const home=document.createElement('a');home.className='btn secondary tc-preview-home';home.href=listHash;
  home.textContent='← '+(page==='assigned'?L('Assigned courses','老师布置的课程','老師指派的課程'):L('My courses','我的课程','我的課程'));
  home.addEventListener('click',async event=>{event.preventDefault();dialog.close();await backToCourses();});
  const close=document.createElement('button');close.type='button';close.className='btn secondary tc-preview-close';
  close.textContent=L('Exit fullscreen · Esc','退出全屏 · Esc','離開全螢幕 · Esc');
  close.addEventListener('click',()=>dialog.close());
  bar.append(home,close);
  const course=previewState?.course;
  let content,lessons,outline,lessonObserver;
  if(course){
   content=document.createElement('div');content.className='tc-fullscreen-layout';
   outline=document.createElement('aside');outline.className='panel tc-outline';
   outline.innerHTML=courseOutlineHTML(course,Number(source.dataset.previewLesson)||0);
   lessons=document.createElement('div');lessons.className='tc-preview-lessons';
   lessons.innerHTML=course.lessons.map((lesson,index)=>fullscreenLessonHTML(lesson,index)).join('');
   content.append(outline,lessons);
  }else{
   content=source.cloneNode(true);content.querySelector('[data-preview-full]')?.remove();
  }
  content.classList.add('tc-fullscreen-body');
  dialog.append(bar,content);root.append(dialog);
  dialog.addEventListener('close',()=>{
   lessonObserver?.disconnect();previewActive=null;stopLessonPlayer();dialog.remove();
   if(open.isConnected)open.focus();
   if(course)mountPreviewLesson(root.querySelector(`[data-preview-lesson="${previewState?.index??0}"]`));
  },{once:true});
  dialog.showModal();
  if(course){
   lessonObserver=new IntersectionObserver(entries=>{
    for(const entry of entries){if(!entry.isIntersecting)continue;mountPreviewLesson(entry.target);
     const index=Number(entry.target.dataset.fullscreenLesson);previewState.index=index;
     outline.querySelectorAll('[data-outline-group]').forEach(el=>el.classList.toggle('is-active',Number(el.dataset.outlineGroup)===index));}
   },{threshold:0.1});
   lessons.querySelectorAll('[data-fullscreen-lesson]').forEach(el=>lessonObserver.observe(el));
   lessons.querySelector(`[data-fullscreen-lesson="${source.dataset.previewLesson}"]`)?.scrollIntoView({block:'start'});
  }
 };
 const previewSection=(scope,index)=>scope.querySelector(`[data-preview-lesson="${index}"],[data-fullscreen-lesson="${index}"]`);
 const outlineClick=event=>{
  if(!previewState)return;
  const toggle=event.target.closest('[data-outline-toggle]');
  if(toggle){
   const group=toggle.closest('.dl-lesson-group'),steps=group?.querySelector('.dl-steps');
   const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));if(steps)steps.hidden=open;
   const index=Number(toggle.dataset.outlineToggle),section=previewSection(toggle.closest('dialog')||root,index);
   if(section){previewState.index=index;section.scrollIntoView({behavior:'smooth',block:'start'});}
   return;
  }
  const step=event.target.closest('[data-preview-step]');
  if(!step)return;
  event.preventDefault();
  const [index,slideIndex]=step.dataset.previewStep.split(':').map(Number),section=previewSection(step.closest('dialog')||root,index);
  if(!section)return;
  previewState.index=index;section.scrollIntoView({behavior:'smooth',block:'start'});
  mountPreviewLesson(section);
  requestAnimationFrame(()=>section.querySelector('[data-teaching-player]')?.querySelector(`[data-dl-step="${slideIndex}"]`)?.click());
 };
 const retrySave=()=>autosaver.retry();
 window.addEventListener('online',retrySave);
 const touch=()=>{lastInteraction=Date.now();};
 root.addEventListener('input',input);root.addEventListener('change',input);root.addEventListener('change',change);root.addEventListener('click',click);root.addEventListener('click',slideClick);root.addEventListener('click',fullscreenClick);root.addEventListener('click',outlineClick);root.addEventListener('submit',submit);
 for(const name of ['pointerdown','keydown','scroll'])document.addEventListener(name,touch,true);
 dispose=()=>{if(draft)backup();autosaver.dispose();window.removeEventListener('online',retrySave);playerObserver.disconnect();previewObserver?.disconnect();stopLessonPlayer();alive=false;clearInterval(timer);root.removeEventListener('input',input);root.removeEventListener('change',input);root.removeEventListener('change',change);root.removeEventListener('click',click);root.removeEventListener('click',slideClick);root.removeEventListener('click',fullscreenClick);root.removeEventListener('click',outlineClick);root.removeEventListener('submit',submit);for(const name of ['pointerdown','keydown','scroll'])document.removeEventListener(name,touch,true);};
 void load();
}
