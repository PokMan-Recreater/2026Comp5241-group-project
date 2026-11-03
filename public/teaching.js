import {cloudAPI} from './cloud-records.js';
import {curriculum} from './course-map.js';
import {allLessons} from './all-lessons.js';
import {csvCell} from './engine.js';
import {lessonSlides} from './teaching-slides.js';
import {slideArt} from './slide-art.js';
import {ensureScene} from './scene-auto.js';
import {sceneArt,wrap as wrapText} from './scene-render.js';
const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let dispose=()=>{};
export const stopTeaching=()=>{dispose();dispose=()=>{};};
export const teachingHTML=()=>'<div id="teaching-workspace" aria-live="polite"></div>';
export function sceneHTML(lesson){
 const items=(lesson.sceneItems||[]).slice(0,5),n=Math.max(items.length,1),gap=14,w=(680-gap*(n-1))/n,size=n>3?11:13;
 const lines=text=>wrapText(text,w-28,size,3);
 return `<svg class="tc-scene" viewBox="0 0 720 210" role="img" aria-label="${e(lesson.title)}">${lesson.scene==='timeline'?'<path d="M35 162H685" stroke="#8a78ad" stroke-width="3"/>':''}${items.map((text,i)=>{const x=20+i*(w+gap),ls=lines(text);return `<g class="tc-scene-item" style="animation-delay:${i*.25}s"><rect x="${x}" y="35" width="${w}" height="115" rx="15" fill="${['#f4e9bf','#dceada','#e5def4','#dbe6ef','#f5dfd9'][i]}" stroke="#625777" stroke-width="1.5"/><text x="${x+w/2}" y="60" text-anchor="middle" fill="#635c91" font-size="12">${i+1}</text>${ls.map((line,j)=>`<text x="${x+w/2}" y="${97+(j-(ls.length-1)/2)*16+size*0.34}" text-anchor="middle" fill="#18113e" font-size="${size}">${e(line)}</text>`).join('')}${lesson.scene==='timeline'?`<circle cx="${x+w/2}" cy="162" r="6" fill="#8a78ad"/>`:i<n-1&&lesson.scene==='flow'?`<path d="M${x+w+2} 94h10m-4-4 4 4-4 4" fill="none" stroke="#625777"/>`:''}</g>`;}).join('')}</svg>`;
}
const sceneBlock=lesson=>Array.isArray(lesson.slides)&&lesson.slides.length?'':sceneHTML(lesson);
export function officialCourseCopy(id,language){
 const course=curriculum.flatMap(t=>t.courses).find(c=>c.id===id);if(!course)return null;
 const en=language==='en';
 return {title:en?course.en:course.title,description:en?course.enGoal:course.goal,language,lessons:course.lessons.map((entry,i)=>{
  const lesson=allLessons.find(l=>l.id===entry.id),steps=lesson?.steps||[];
  return {id:'lesson-'+(i+1),title:en?entry.en:entry.title,body:steps.map(step=>[(en?step.en:step.title),...(en?step.enScript:step.script)||[]].join('\n')).join('\n\n'),scene:'flow',sceneItems:steps.slice(0,5).map(step=>(en?step.en:step.title).slice(0,60)),questions:[]};
 })};
}
export function mountTeaching({page,id,index=0,locale='zh-CN',user}){
 stopTeaching();const root=document.querySelector('#teaching-workspace');if(!root)return;
 let alive=true,record=null,draft=null,candidate=null,lastAIAction=null,lessonIndex=0,busy=false,analytics=[],courseList=[],previewState=null,timer,lastInteraction=Date.now(),lastBeat=Date.now();
 const L=(en,cn,tw=cn)=>locale==='en'?en:locale==='zh-TW'?tw:cn;
  const deckHTML=(lesson,key,showNotes=true)=>{
   const labelsFor=slide=>{const own=String(slide.bullets||"").split("\n").map(b=>b.replace(/^•\s*/,"").trim()).filter(Boolean);return own.length>=2?own:(lesson.sceneItems||[]);};
   const pages=Array.isArray(lesson.slides)&&lesson.slides.length
    ?lesson.slides.map(s=>({heading:s.heading||"",concept:s.concept||"",bullets:(s.bullets||[]).map(b=>"• "+b).join("\n"),script:s.script||[],notes:showNotes?s.notes||[]:[],art:s.art||null}))
    :lessonSlides(lesson.body).map(s=>({heading:s.heading,bullets:s.bullets,art:null,labels:labelsFor(s)}));
   return `<div class="tc-deck" data-deck="${key}" data-index="0">${pages.map((slide,i)=>`<section class="tc-slide" data-slide="${i}" ${i?"hidden":""}><span class="tc-slide-num">${L("Page","第","第")} ${i+1} / ${pages.length}</span><div class="tc-slide-grid"><div class="tc-slide-content">${slide.concept?`<p class="tc-slide-concept">${e(slide.concept)}</p>`:""}<div class="tc-slide-title">${e(slide.heading||lesson.title||"")}</div>${slide.bullets?`<div class="tc-slide-bullets">${slide.bullets.split("\n").map(b=>`<span>${e(b)}</span>`).join("")}</div>`:`<div class="tc-reading">${e(slide.heading||lesson.title||"")}</div>`}${slide.script&&slide.script.length?`<div class="tc-slide-script">${slide.script.map(line=>`<p>${e(line)}</p>`).join("")}</div>`:""}${slide.notes&&slide.notes.length?`<ul class="tc-slide-notes">${slide.notes.map(note=>`<li>${e(note)}</li>`).join("")}</ul>`:""}</div><div class="tc-slide-art">${slide.art?sceneArt(slide.art.scene,slide.art.items,{title:slide.heading||lesson.title||""}):slideArt(slide.heading||lesson.title||"",slide.labels||[],i)}</div></div></section>`).join("")}<div class="tc-deck-nav"><button type="button" class="btn secondary" data-slide-step="-1">\u2190 ${L("Previous","上一页","上一頁")}</button><span class="tc-deck-dots">${pages.map((_,i)=>`<button type="button" class="tc-deck-dot${i?"":" on"}" data-slide-dot="${i}" aria-label="${L("Page","第","第")} ${i+1}"></button>`).join("")}</span><button type="button" class="btn secondary" data-slide-step="1">${L("Next","下一页","下一頁")} \u2192</button></div></div>`;
  }
const api=(resource,body)=>cloudAPI('/api/teaching?resource='+resource,body);
 const button=(action,label,secondary=true,attrs='')=>`<button type="button" class="btn ${secondary?'secondary':''}" data-teach="${action}" ${attrs}>${label}</button>`;
 const heading=(title,sub='')=>`<div class="page-heading"><h1>${e(title)}</h1>${sub?`<p>${e(sub)}</p>`:''}</div>`;
 const status=message=>{root.querySelectorAll('[data-teach-status],[data-ai-status]').forEach(el=>{el.textContent=message;});};
 const aiStatus=message=>{const el=root.querySelector('[data-ai-status]');if(!el)return;el.textContent=message;el.scrollIntoView({block:'nearest',behavior:'smooth'});};
 const errors={teacher_required:L('A teacher account is required.','请使用教师账号。','請使用教師帳號。'),revision_conflict:L('The course changed in another window. Copy your edits and reload.','课程已在其他窗口修改，请保留当前内容后刷新。'),provider_rate_limited:L('The free model is busy. Your draft is safe; try again shortly.','免费模型暂时限流，草稿已保留，请稍后重试。'),ai_not_configured:L('The AI service is not configured.','AI 服务尚未配置。'),invalid_course:L('Check lesson content, question answers and scene labels before publishing.','请检查课文、选择题答案和场景标签后再发布。'),invalid_request:L('Please check the required fields.','请检查必填内容。'),login_required:L('Please sign in again.','请重新登录。')};
 Object.assign(errors,{
 server_connection_failed:L('The local server is unavailable. Your draft is kept; restart the server and retry.','无法连接本机后台，草稿已保留。请恢复后台后重试。','無法連線本機後台，草稿已保留。請恢復後台後重試。'),
 provider_unavailable:L('The AI service could not respond. Your draft is kept; please retry.','AI 服务暂时无法响应，草稿已保留，请重试。','AI 服務暫時無法回應，草稿已保留，請重試。'),
 provider_timeout:L('AI generation timed out. Your draft is kept; please retry.','AI 生成超时，草稿已保留，请重试。','AI 生成逾時，草稿已保留，請重試。'),
 invalid_ai_result:L('AI returned incomplete lesson data. Your draft is kept; please regenerate.','AI 返回的课节内容格式不完整，草稿已保留，请重新生成。','AI 回傳的課節內容格式不完整，草稿已保留，請重新生成。'),
 duplicate_lesson_titles:L('AI repeated the same lesson title. Your draft is kept; please regenerate.','AI 给出的课节标题重复，草稿已保留，请重新生成。','AI 給出的課節標題重複，草稿已保留，請重新生成。'),
 invalid_service_response:L('The server returned an invalid response. Your draft is kept; please retry.','后台返回异常，草稿已保留，请重试。','後台回傳異常，草稿已保留，請重試。'),
 database_not_configured:L('The database is not configured on this server.','服务器上的数据库尚未配置。','伺服器上的資料庫尚未設定。'),database_unavailable:L('The database could not complete this request. Please retry shortly.','数据库暂时无法完成该请求，请稍后重试。','資料庫暫時無法完成該請求，請稍後重試。'),invalid_provider:L('The AI service address is misconfigured.','AI 服务地址配置有误。','AI 服務位址設定有誤。'),origin_not_allowed:L('Open the page from the same address as the server.','请使用与服务器一致的地址打开页面。','請使用與伺服器一致的位址開啟頁面。'),
 course_not_found:L('This course is not accessible to the current teacher account.','当前教师账号无权访问这门课程。','目前教師帳號無權存取這門課程。'),
 course_in_use:L('This course is assigned to a class. Remove the assignment before deleting it.','这门课程已分配给班级，请先取消分配再删除。','這門課程已分配給班級，請先取消分配再刪除。'),
 rate_limited:L('Too many requests. Please wait a minute before trying again.','操作较频繁，请稍候一分钟再重试。','操作較頻繁，請稍候一分鐘再重試。')});
 const errorText=error=>errors[error.message]||L('Unable to complete this action. Check the connection and database setup.','操作未完成，请检查连接与数据库配置。','操作未完成，請檢查連線與資料庫設定。');
 const backupKey=()=>`forma.teacher-draft.${user.id}.${record?.id||'new'}`;
 const backup=()=>{try{localStorage.setItem(backupKey(),JSON.stringify({revision:record?.revision,draft}));}catch{/* The current editor stays usable without local storage. */}};
 const blankLesson=()=>({id:'lesson-'+crypto.randomUUID(),title:L('New lesson','新课节','新課節'),body:'',scene:'flow',sceneItems:['开始','结果'],questions:[]});
 const courseForm=()=>`<div class="tc-toolbar"><a href="#courses">← ${L('My courses','我的课程','我的課程')}</a><div class="row">${button('save',L('Save draft','保存草稿','儲存草稿'),false)}${button('publish',L('Publish version','发布版本','發佈版本'))}${record?.published?button('preview-published',L('Preview published','预览发布版','預覽發佈版')):''}</div></div><div class="tc-meta panel"><div class="field"><label for="tc-title">${L('Course title','课程标题','課程標題')}</label><input id="tc-title" data-course-field="title" maxlength="180" value="${e(draft.title)}"></div><div class="field"><label for="tc-description">${L('Learning objectives','学习目标','學習目標')}</label><textarea id="tc-description" data-course-field="description" maxlength="3000">${e(draft.description)}</textarea></div><div class="field"><label for="tc-language">${L('Content language','内容语言','內容語言')}</label><select id="tc-language" data-course-field="language">${[['zh-CN','简体中文'],['zh-TW','繁體中文'],['en','English']].map(([v,label])=>`<option value="${v}" ${draft.language===v?'selected':''}>${label}</option>`).join('')}</select></div></div>`;
 function editor(){
  const lesson=ensureScene(draft.lessons[lessonIndex]);
  const names=draft.lessons.map(l=>l.title.trim().toLowerCase()).filter(Boolean),duplicate=names.length!==new Set(names).size;
  root.innerHTML=heading(L('Course studio','课程工作台','課程工作台'))+courseForm()+`<p class="tc-status" data-teach-status role="status"></p><div class="tc-editor"><aside class="panel tc-outline"><h2>${L('Lessons','课节','課節')}</h2>${draft.lessons.map((l,i)=>`<button class="tc-lesson-tab" data-teach="lesson" data-index="${i}" aria-current="${i===lessonIndex?'step':'false'}">${i+1}. ${e(l.title)}${String(l.body||'').trim()?' ✓':''}</button>`).join('')}${draft.lessons.length<10?button('add-lesson',L('Add lesson','添加课节','新增課節')):''}${duplicate?`<p class="small tc-warn">${L('Two or more lessons share the same title. Give each lesson a distinct title before publishing.','有课节的标题重复，请为每节课设置不同标题后再发布。','有課節的標題重複，請為每節課設定不同標題後再發佈。')}</p>`:''}<p class="small muted">${L('Save drafts at any time. Publish after every lesson is ready.','可随时保存草稿，所有课节准备好后再发布。')}</p></aside><div class="tc-edit-main"><section class="panel"><div class="row between"><h2>${L('Lesson content','课节内容','課節內容')}</h2>${draft.lessons.length>1?button('delete-lesson',L('Remove lesson','删除课节','刪除課節')):''}</div><div class="field"><label for="tc-lesson-title">${L('Lesson title','课节标题','課節標題')}</label><input id="tc-lesson-title" data-lesson-field="title" maxlength="180" value="${e(lesson.title)}"></div><div class="field"><label for="tc-body">${L('Explanation and worked example','讲解与示例','講解與範例')}</label><textarea id="tc-body" data-lesson-field="body" maxlength="18000" rows="12">${e(lesson.body)}</textarea></div><p class="small muted">${L('The illustration is chosen automatically from the lesson content and AI suggestions. No manual selection is needed.','插画由 AI 根据课节内容自动选择，无需手动设置。','插畫由 AI 根據課節內容自動選擇，無需手動設定。')}</p><div data-scene-preview>${sceneBlock(lesson)}</div><details class="tc-deck-preview"><summary>${L('Slide preview','幻灯片预览','幻燈片預覽')}</summary>${deckHTML(lesson,'editor-'+lessonIndex)}</details></section><section class="panel"><h2>${L('Multiple-choice activities','选择题活动','選擇題活動')}</h2>${lesson.questions.map((q,i)=>`<fieldset data-question="${i}"><legend>${L('Question','题目','題目')} ${i+1}</legend><label>${L('Prompt','题干','題幹')}<textarea data-question-field="prompt" maxlength="1500">${e(q.prompt)}</textarea></label><label>${L('Options, one per line (2–5)','选项，每行一个（2–5 个）','選項，每行一個（2–5 個）')}<textarea data-question-field="options" rows="4">${e(q.options.join('\n'))}</textarea></label><label>${L('Correct option number','正确选项序号','正確選項序號')}<input type="number" min="1" max="5" data-question-field="correctIndex" value="${q.correctIndex+1}"></label><label>${L('Explanation','答案解析','答案解析')}<textarea data-question-field="explanation" maxlength="2500">${e(q.explanation)}</textarea></label>${button('remove-question',L('Remove question','删除题目','刪除題目'),true,`data-index="${i}"`)}</fieldset>`).join('')}${lesson.questions.length<5?button('add-question',L('Add question','添加题目','新增題目')):''}</section><section class="panel tc-ai"><h2>${L('AI co-author','AI 辅助制作','AI 輔助製作')}</h2><div class="field"><label for="tc-materials">${L('Teaching requirements and source material','教学要求与参考材料','教學要求與參考資料')}</label><textarea id="tc-materials" data-materials maxlength="16000" rows="5" placeholder="${L('Audience, learning goals, accurate source notes…','受众、难度、教学目标、已有讲义……','受眾、難度、教學目標、已有講義……')}">${e(draft.authorMaterials||'')}</textarea></div><div class="field"><label for="tc-instruction">${L('What should AI change?','希望 AI 怎样优化？','希望 AI 如何優化？')}</label><input id="tc-instruction" maxlength="2500" placeholder="${L('e.g. explain with a concrete case and add two questions','例如：用具体案例讲清概念，并补两道选择题','例如：用具體案例講清概念，並補兩道選擇題')}"></div><div class="field"><strong>${L('Step 1 · Course outline','第 1 步 · 生成大纲','第 1 步 · 產生大綱')}</strong><p class="small muted">${L('AI proposes the course structure and per-lesson summaries. Accept it, then continue to step 2.','AI 先给出课程结构和每一讲的大纲摘要，采纳后再进行第 2 步。','AI 先給出課程結構和每一講的大綱摘要，採納後再進行第 2 步。')}</p>${button('ai-outline',L('Generate course outline','生成课程大纲','產生課程大綱'),false)}</div><div class="field"><strong>${L('Step 2 · Slides for this lesson','第 2 步 · 生成这一讲课件','第 2 步 · 產生這一講課件')}</strong><p class="small muted">${L('Requires an accepted outline. Fills the full lesson text, illustration labels and quiz questions.','需要先采纳大纲。会补全这一讲的正文、插画标签和选择题。','需要先採納大綱。會補全這一講的正文、插畫標籤和選擇題。')}</p>${button('ai-lesson',L('Generate slides','生成课件','產生課件'),false)}${button('preview',L('Preview lesson','预览课节','預覽課節'))}${button('clear-all',L('Clear all','清空所有','清空所有'))}</div><p class="small muted">${L('AI suggestions remain drafts until you accept and publish them.','AI 生成内容先预览，采纳并发布后学生才会看到。')}</p><p class="tc-status" data-ai-status role="status"></p><div data-ai-candidate></div></section></div></div>`;
 }
 const preview=lesson=>`<h3>${e(lesson.title)}</h3>${sceneBlock(lesson)}${deckHTML(lesson,'preview')}${lesson.questions.map(q=>`<div class="tc-preview-question"><strong>${e(q.prompt)}</strong><ol type="A">${q.options.map(o=>`<li>${e(o)}</li>`).join('')}</ol><p>${L('Answer','答案','答案')}: ${q.correctIndex+1} · ${e(q.explanation)}</p></div>`).join('')}`;
 const renderPreview=()=>{
  const {course,index,fromEditor}=previewState,lesson=course.lessons[index];
  root.innerHTML=heading(course.title,course.description||'')+`<div class="tc-toolbar">${fromEditor?button('preview-exit',L('Back to editor','返回编辑','返回編輯')):`<a class="btn secondary" href="#courses">← ${L('My courses','我的课程','我的課程')}</a>`}<span class="pill">${L('Published version','已发布版本','已發佈版本')}</span></div><div class="tc-editor"><aside class="panel tc-outline"><h2>${L('Lessons','课节','課節')}</h2>${course.lessons.map((l,i)=>`<button class="tc-lesson-tab" data-teach="preview-lesson" data-index="${i}" aria-current="${i===index?'step':'false'}">${i+1}. ${e(l.title)}</button>`).join('')}</aside><article class="panel"><h2>${e(lesson.title)}</h2>${sceneBlock(lesson)}${deckHTML(lesson,'published-'+index)}${lesson.questions.map(q=>`<details class="tc-preview-question"><summary>${e(q.prompt)}</summary><ol type="A">${q.options.map((o,i)=>`<li>${e(o)}${i===q.correctIndex?' ✓':''}</li>`).join('')}</ol><p>${L('Answer','答案','答案')}: ${q.correctIndex+1}${q.explanation?' · '+e(q.explanation):''}</p></details>`).join('')}<p class="small muted">${L('Read-only preview of the published version. Answers and progress are not recorded.','这是已发布版本的只读预览，不会记录答题与学习进度。','這是已發佈版本的唯讀預覽，不會記錄答題與學習進度。')}</p></article></div>`;
 };
 const showPublishedPreview=(course,index=0,fromEditor=false)=>{
  if(!course?.published){status(L('Publish the course first to preview it.','请先发布课程再预览。','請先發佈課程再預覽。'));return;}
  previewState={course:course.published,index:Math.min(Math.max(index,0),course.published.lessons.length-1),fromEditor};
  renderPreview();
 };
 async function courses(){
  const data=await api('courses');if(!alive)return;courseList=data.courses;
  root.innerHTML=heading(L('My courses','我的课程','我的課程'))+`<div class="tc-toolbar">${button('create',L('Create a mini-course','创建迷你课程','建立迷你課程'),false)}${button('show-library',L('Adapt an existing course','改编现有课程','改編現有課程'))}</div><p data-teach-status role="status"></p><div class="course-grid">${data.courses.map(c=>`<article class="panel tc-course-card"><h2>${e(c.title)}</h2><p>${e(c.description)}</p><p class="small muted">${c.published?L('Published','已发布','已發佈'):L('Draft','草稿','草稿')} · ${L('Revision','版本','版本')} ${c.revision}</p><div class="row"><a class="btn secondary" href="#teacher-course/${c.id}">${L('Edit course','编辑课程','編輯課程')}</a>${c.published?button('preview-course',L('Preview published','预览发布版','預覽發佈版'),true,`data-id="${c.id}"`):''}${c.published?'':button('publish-course',L('Publish','发布','發佈'),true,`data-id="${c.id}"`)}${button('delete-course',L('Delete','删除','刪除'),true,`data-id="${c.id}"`)}</div></article>`).join('')}</div>${data.courses.length?'':`<section class="panel"><p>${L('Create a course or adapt an official course to begin.','先新建一门课程，或改编已有课程。')}</p></section>`}<div data-course-library hidden class="panel mt"><h2>${L('Official course library','官方课程库','官方課程庫')}</h2><p>${L('Creates your own editable teaching-text copy with scene templates. Original animated lessons stay unchanged.','创建你自己的教学文本副本，配合可编辑场景模板，官方动画课程保持不变。')}</p><div class="tc-library">${curriculum.flatMap(t=>t.courses).map(c=>button('copy',e(locale==='en'?c.en:c.title),true,`data-source="${c.id}"`)).join('')}</div></div>`;
 }
 async function saveCourse(publish=false){
  if(!draft.title.trim()){status(L('Enter a course title first.','请先填写课程标题。','請先填寫課程標題。'));return;}
  draft.lessons=draft.lessons.map(ensureScene);
  const cleanLesson=l=>{
   const slides=Array.isArray(l.slides)&&l.slides.length?l.slides.map(s=>({heading:s.heading,bullets:s.bullets,art:{scene:s.art?.scene,items:s.art?.items}})):undefined;
   return {id:l.id,title:l.title,body:l.body??'',...(slides?{slides}:{}),scene:l.scene,sceneItems:l.sceneItems,questions:(l.questions||[]).map(q=>({id:q.id,prompt:q.prompt,options:q.options,correctIndex:q.correctIndex,explanation:q.explanation}))};
  };
  const course={title:draft.title,description:draft.description,language:draft.language,lessons:draft.lessons.map(cleanLesson)};
  const data=await api('courses',{action:'save',id:record?.id,revision:record?.revision,course,sourceId:record?.source_id});record=data.course;backup();if(location.hash==='#teacher-course/new')history.replaceState(null,'','#teacher-course/'+record.id);
  if(publish){const published=await api('courses',{action:'publish',id:record.id,revision:record.revision});record=published.course;backup();}
  status(publish?L('Published. Assign this version to a class from My classrooms.','已发布，请在“我的班级”中将这个版本分配给学生。','已發佈，請在「我的班級」中將這個版本分配給學生。'):L('Draft saved.','草稿已保存。','草稿已儲存。'));
 }
 async function classroomPage(){
  const [data,coursesData,studentData]=await Promise.all([api('classrooms'),api('courses'),api('students').catch(()=>({students:[]}))]);if(!alive)return;
  courseList=coursesData.courses;const roster=studentData.students||[];
  root.innerHTML=heading(L('My classrooms','我的班级','我的班級'))+`<form data-teach-form="create-class" class="panel row mb"><label>${L('Class name','班级名称','班級名稱')}<input name="name" required maxlength="120"></label><button class="btn">${L('Create class','创建班级','建立班級')}</button></form><p data-teach-status role="status"></p>${data.classrooms.map(c=>{
   const members=(c.teaching_members||[]),joined=new Map(members.map(m=>[m.student_id,m.username||m.student_id]));
   return `<section class="panel mt tc-class"><div class="row between"><h2>${e(c.name)}</h2><span class="pill">${L('Students','学生','學生')} ${members.length}</span></div><details class="tc-picker"${members.length?'':' open'}><summary>${L('Select students with checkboxes','直接勾选学生','直接勾選學生')}</summary>${roster.length?`<form data-teach-form="import" data-class="${c.id}"><input type="search" data-student-search placeholder="${L('Search students…','搜索学生…','搜尋學生…')}" aria-label="${L('Search students','搜索学生','搜尋學生')}"><div class="tc-student-list">${roster.map(s=>{const inClass=joined.has(s.id);return `<label class="tc-student-option${inClass?' joined':''}"><input type="checkbox" name="students" value="${e(s.username)}" ${inClass?'checked disabled':''}><span>${e(s.username)}</span>${inClass?`<em>${L('In class','已加入','已加入')}</em>`:''}</label>`;}).join('')}</div><button class="btn secondary" type="submit">${L('Add selected students','加入所选学生','加入所選學生')}</button></form>`:`<p class="small muted">${L('No student accounts were found. Students register on the sign-in page first.','未找到学生账号，请学生先注册。','未找到學生帳號，請學生先註冊。')}</p>`}</details><form data-teach-form="assign" data-class="${c.id}" class="row mt"><label>${L('Course','课程','課程')}<select name="courseId" required><option value="">${L('Choose a course','选择课程','選擇課程')}</option>${coursesData.courses.map(course=>`<option value="${course.id}">${e(course.title)}${course.published?'':` · ${L('Draft','草稿','草稿')}`}</option>`).join('')}</select></label><button class="btn secondary">${L('Assign to class','分配给班级','分配給班級')}</button></form>${coursesData.courses.length?'':`<p class="small muted mt">${L('Create and publish a course first.','请先创建并发布课程。','請先建立並發佈課程。')} <a href="#courses">${L('My courses','我的课程','我的課程')}</a></p>`}<div class="tc-members mt">${members.map(m=>`<span class="pill">${e(m.username||m.student_id)}</span>`).join('')||`<span class="small muted">${L('No students yet.','尚无学生。','尚無學生。')}</span>`}</div></section>`;
  }).join('')}`;
 }
 async function analyticsPage(){
  const data=await api('analytics');if(!alive)return;analytics=data.rows||[];
  root.innerHTML=heading(L('Class participation','班级参与情况','班級參與情況'),L('Active time is a participation signal, not a measure of attention or mastery.','有效学习时间是参与指标，不代表专注程度或知识掌握程度。'))+button('export',L('Export CSV','导出 CSV','匯出 CSV'))+`<p data-teach-status role="status"></p><div class="table-wrap mt"><table><thead><tr>${[L('Student','学生','學生'),L('Class','班级','班級'),L('Course','课程','課程'),L('Completed lessons','完成课节','完成課節'),L('Active minutes','有效分钟','有效分鐘'),L('Correct / attempts','答对 / 尝试','答對 / 嘗試'),L('Last active','最近活动','最近活動')].map(t=>`<th>${t}</th>`).join('')}</tr></thead><tbody>${analytics.map(r=>`<tr><td>${e(r.username||r.student_id)}</td><td>${e(r.classroom_name)}</td><td>${e(r.course_title)}</td><td>${r.completed_lessons??0}/${r.total_lessons??0}</td><td>${Math.round((r.active_seconds||0)/60)}</td><td>${r.correct_attempts??0}/${r.quiz_attempts??0}</td><td>${r.last_active?e(new Date(r.last_active).toLocaleString(locale)):'—'}</td></tr>`).join('')}</tbody></table></div>${analytics.length?'':`<section class="panel mt"><p>${L('Assign a course to students to see their actual activity here.','分配课程给学生后，这里将展示实际学习记录。')}</p></section>`}`;
 }
 async function studentPage(){
  const data=await api('assignments'+(id?'&id='+encodeURIComponent(id):''));if(!alive)return;
  if(!id){root.innerHTML=heading(L('Assigned courses','老师布置的课程','老師指派的課程'))+`<div class="course-grid">${data.assignments.map(a=>`<a class="panel" href="#assigned/${a.id}/0"><h2>${e(a.published_snapshot?.title||a.course_title)}</h2><p>${e(a.classroom_name||'')}</p><span>${L('Open course','进入课程','進入課程')} →</span></a>`).join('')}</div>${data.assignments.length?'':`<section class="panel"><p>${L('No assigned courses yet.','老师暂未分配课程。')}</p></section>`}`;return;}
  const assignment=data.assignment,snapshot=assignment.published_snapshot,lesson=snapshot.lessons[Math.min(Math.max(Number(index)||0,0),snapshot.lessons.length-1)];
  root.innerHTML=heading(snapshot.title)+`<a href="#assigned">← ${L('Assigned courses','我的课程','我的課程')}</a><div class="tc-editor mt"><aside class="panel tc-outline">${snapshot.lessons.map((l,i)=>`<a class="tc-lesson-tab" href="#assigned/${id}/${i}">${i+1}. ${e(l.title)}</a>`).join('')}</aside><article class="panel"><h2>${e(lesson.title)}</h2>${sceneBlock(lesson)}${deckHTML(lesson,'lesson',false)}${lesson.questions.map(q=>`<form data-teach-form="attempt" data-lesson="${e(lesson.id)}" data-question="${e(q.id)}" class="tc-preview-question"><fieldset><legend>${e(q.prompt)}</legend>${q.options.map((o,i)=>`<label class="tc-choice"><input type="radio" name="choice" value="${i}" required> ${e(o)}</label>`).join('')}</fieldset><button class="btn secondary">${L('Check answer','检查答案','檢查答案')}</button><p data-answer-result role="status"></p></form>`).join('')}${button('complete',L('Mark lesson complete','完成本节','完成本節'),false,`data-lesson="${e(lesson.id)}"`)}<p data-teach-status role="status"></p></article></div>`;
  await api('activity',{assignmentId:id,lessonId:lesson.id,eventId:crypto.randomUUID(),eventType:'enter',activeSeconds:0});
  lastInteraction=Date.now();lastBeat=Date.now();
  timer=setInterval(()=>{
   const now=Date.now(),seconds=Math.min(30,Math.floor((now-lastBeat)/1000));lastBeat=now;
   if(document.hidden||now-lastInteraction>60000||seconds<=0)return;
   void api('activity',{assignmentId:id,lessonId:lesson.id,eventId:crypto.randomUUID(),eventType:'heartbeat',activeSeconds:seconds}).catch(()=>status(L('Activity could not sync. Check your connection.','学习记录暂未同步，请检查连接。')));
  },20000);
 }
 async function load(){root.innerHTML=`<p>${L('Loading…','正在读取…','正在讀取…')}</p>`;try{
  if(page==='teacher-course'){
   if(id==='new'){record=null;draft={title:'',description:'',language:locale,lessons:[blankLesson()]};try{const saved=JSON.parse(localStorage.getItem(backupKey())||'null');if(saved?.draft)draft=saved.draft;}catch{/* Ignore an unusable local backup. */}draft.lessons=draft.lessons.map(ensureScene);lessonIndex=0;editor();return;}
   const data=await api('courses&id='+encodeURIComponent(id));if(!alive)return;record=data.course;draft=structuredClone(record.draft);
   try{const saved=JSON.parse(localStorage.getItem(backupKey())||'null');if(saved?.revision===record.revision)draft=saved.draft;}catch{/* Ignore an unusable local backup. */}
   draft.lessons=draft.lessons.map(ensureScene);
   editor();
  }else if(page==='courses')await courses();else if(page==='classrooms')await classroomPage();else if(page==='engagement')await analyticsPage();else await studentPage();
 }catch(error){if(alive)root.innerHTML=heading(L('Unable to load','暂时无法读取','暫時無法讀取'))+`<section class="panel"><p>${e(errorText(error))}</p><p>${L('If the teaching tables are not installed, run the teacher-course migration in Supabase SQL Editor first.','若教师课程表尚未安装，请先在 Supabase SQL Editor 执行教师课程迁移文件。')}</p>${button('reload',L('Retry','重试','重試'))}</section>`;}}
 const input=event=>{
  const el=event.target;
  if(el.hasAttribute('data-student-search')){
   const query=el.value.trim().toLowerCase();
   el.closest('form')?.querySelectorAll('.tc-student-option').forEach(option=>{option.hidden=!!query&&!option.textContent.toLowerCase().includes(query);});
  }
  if(!draft)return;
  if(el.dataset.courseField)draft[el.dataset.courseField]=el.value;
  if(el.dataset.lessonField)draft.lessons[lessonIndex][el.dataset.lessonField]=el.value;
  if(el.hasAttribute('data-materials'))draft.authorMaterials=el.value;
  if(el.dataset.questionField){const q=draft.lessons[lessonIndex].questions[Number(el.closest('[data-question]').dataset.question)],key=el.dataset.questionField;q[key]=key==='options'?el.value.split('\n'):key==='correctIndex'?Number(el.value)-1:el.value;}
  backup();
 };
 const click=async event=>{
  const el=event.target.closest('[data-teach]');if(!el||busy)return;const action=el.dataset.teach;
  busy=true;el.disabled=true;
  try{
   if(action==='reload')return await load();
   if(action==='show-library'){root.querySelector('[data-course-library]').hidden=false;return;}
   if(action==='create'){
    record=null;draft={title:'',description:'',language:locale,lessons:[blankLesson()]};lessonIndex=0;backup();location.hash='teacher-course/new';return;
   }
   if(action==='copy'){
    const course=officialCourseCopy(el.dataset.source,locale);
    const result=await api('courses',{action:'save',course,sourceId:el.dataset.source||null});location.hash='teacher-course/'+result.course.id;
   }
   if(action==='publish-course'){
    const course=courseList.find(c=>c.id===el.dataset.id);if(!course)return;
    await api('courses',{action:'publish',id:course.id,revision:course.revision});await courses();status(L('Published. It can now be assigned to a class.','已发布，现在可以分配给班级。','已發佈，現在可以分配給班級。'));
   }
   if(action==='delete-course'){
    if(!confirm(L('Delete this course? Its lessons and drafts will be removed. A course assigned to a class cannot be deleted.','删除这门课程？课节和草稿都会移除。已分配给班级的课程不能删除。','刪除這門課程？課節和草稿都會移除。已分配給班級的課程不能刪除。')))return;
    await cloudAPI('/api/teaching?resource=courses&id='+encodeURIComponent(el.dataset.id),null,'DELETE');await courses();status(L('Course deleted.','课程已删除。','課程已刪除。'));
   }
   if(action==='preview-course'){const data=await api('courses&id='+encodeURIComponent(el.dataset.id));if(!alive)return;showPublishedPreview(data.course,0,false);return;}
   if(action==='preview-published'&&record?.published){showPublishedPreview(record,0,true);return;}
   if(action==='preview-lesson'&&previewState){previewState.index=Number(el.dataset.index);renderPreview();return;}
   if(action==='preview-exit'){previewState=null;editor();return;}
   if(action==='lesson'){backup();lessonIndex=Number(el.dataset.index);candidate=null;editor();}
   if(action==='add-lesson'){draft.lessons.push(blankLesson());lessonIndex=draft.lessons.length-1;backup();editor();}
   if(action==='delete-lesson'){if(!confirm(L('Remove this lesson from the draft?','从草稿中删除本节课吗？')))return;draft.lessons.splice(lessonIndex,1);lessonIndex=0;backup();editor();}
   if(action==='save'||action==='publish'){await saveCourse(action==='publish');if(action==='publish'){editor();status(L('Published. You can now preview the published version.','已发布，现在可以预览发布版。','已發佈，現在可以預覽發佈版。'));}}
   if(action==='add-question'){draft.lessons[lessonIndex].questions.push({id:'q-'+crypto.randomUUID(),prompt:'',options:['',''],correctIndex:0,explanation:''});backup();editor();}
   if(action==='remove-question'){draft.lessons[lessonIndex].questions.splice(Number(el.dataset.index),1);backup();editor();}
   if(action==='preview'){root.querySelector('[data-ai-candidate]').innerHTML=`<section class="tc-candidate">${preview(draft.lessons[lessonIndex])}</section>`;}
   if(action==='ai-outline'||action==='ai-lesson'||action==='regenerate'){
    const aiAction=action==='regenerate'?lastAIAction:action;if(!aiAction)return;lastAIAction=aiAction;
    if(aiAction==='ai-lesson'&&!(draft.lessons.length>1||draft.lessons[0]?.body.trim())){aiStatus(L('Generate and accept a course outline in step 1 first.','请先在“第 1 步”生成并采纳课程大纲。','請先在「第 1 步」產生並採納課程大綱。'));return;}
    if(!draft.title.trim()){aiStatus(L('Enter a course title first.','请先填写课程标题。','請先填寫課程標題。'));return;}
    backup();
    const started=Date.now(),progress=()=>aiStatus(L(`AI is preparing a suggestion… ${Math.round((Date.now()-started)/1000)}s`,`AI 正在生成候选内容… 已等待 ${Math.round((Date.now()-started)/1000)} 秒`,`AI 正在產生候選內容… 已等待 ${Math.round((Date.now()-started)/1000)} 秒`));
    progress();const poll=setInterval(progress,1000);
    let result;try{result=await cloudAPI('/api/course-ai',{action:aiAction==='ai-outline'?'outline':'lesson',language:draft.language,topic:draft.title,requirements:draft.authorMaterials||draft.description,instruction:root.querySelector('#tc-instruction').value,courseId:record?.id,...(aiAction==='ai-lesson'?{lesson:draft.lessons[lessonIndex]}:{})});}finally{clearInterval(poll);}
    if(!alive)return;candidate={kind:aiAction,value:result.course||result.lesson};
    root.querySelector('[data-ai-candidate]').innerHTML=`<section class="tc-candidate"><h3>${L('Preview AI suggestion','预览 AI 建议','預覽 AI 建議')}</h3>${aiAction==='ai-outline'?`<ol>${result.course.lessons.map(l=>`<li><strong>${e(l.title)}</strong>${l.body?`<div class="tc-reading small muted">${e(l.body)}</div>`:``}</li>`).join('')}</ol><p>${L('Accepting replaces the draft outline. Each lesson body is an outline summary; generate full content for each lesson.','采纳后会替换草稿目录，每节课正文为大纲摘要，可逐节生成完整内容。')}</p>`:`<details><summary>${L('Current lesson','修改前','修改前')}</summary><div class="tc-reading">${e(draft.lessons[lessonIndex].body)}</div></details>${preview(result.lesson)}`}<div class="row">${button('accept',L('Accept suggestion','采纳建议','採納建議'),false)}${button('regenerate',L('Not satisfied? Regenerate','不满意？重新生成','不滿意？重新產生'))}${button('discard',L('Discard','不采用','不採用'))}</div></section>`;aiStatus(result.fallbackUsed?L('The main model was busy. A free backup model generated this suggestion; review before accepting.','主模型繁忙，已使用免费备用模型生成候选内容，请检查后再采纳。','主模型繁忙，已使用免費備用模型產生候選內容，請檢查後再採納。'):L('Suggestion ready. Review before accepting.','候选内容已生成，请检查后再采纳。'));
   }
   if(action==='accept'&&candidate){if(candidate.kind==='ai-outline'){draft={...candidate.value,authorMaterials:draft.authorMaterials};lessonIndex=0;}else{const lessonId=draft.lessons[lessonIndex].id;draft.lessons[lessonIndex]={...ensureScene(candidate.value),id:lessonId,questions:candidate.value.questions.map((q,i)=>({...q,id:lessonId+'-q-'+(i+1)}))};const next=draft.lessons.findIndex((l,i)=>i>lessonIndex&&!String(l.body||'').trim());if(next>-1)lessonIndex=next;}candidate=null;backup();editor();status(L('Accepted into draft. Save when ready.','已采纳到草稿，请保存。'));}
   if(action==='clear-all'){if(confirm(L('Clear the entire draft? This cannot be undone.','清空当前整个课程草稿？此操作不可撤销。','清空目前整個課程草稿？此操作不可撤銷。'))){draft={title:'',description:'',language:draft.language,lessons:[blankLesson()],authorMaterials:''};lessonIndex=0;backup();editor();status('');}}if(action==='discard'){candidate=null;root.querySelector('[data-ai-candidate]').innerHTML='';}
   if(action==='complete'){await api('activity',{assignmentId:id,lessonId:el.dataset.lesson,eventId:crypto.randomUUID(),eventType:'complete',activeSeconds:0});status(L('Lesson completion saved.','本节完成记录已保存。'));}
   if(action==='export'){const rows=[['student','class','course','completed_lessons','total_lessons','active_seconds','correct_attempts','quiz_attempts','last_active'],...analytics.map(r=>[r.username||r.student_id,r.classroom_name,r.course_title,r.completed_lessons,r.total_lessons,r.active_seconds,r.correct_attempts,r.quiz_attempts,r.last_active])];const url=URL.createObjectURL(new Blob(['\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='Forma-class-participation.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  }catch(error){status(errorText(error));}finally{busy=false;el.disabled=false;}
 };
 const submit=async event=>{
  const form=event.target;if(!form.dataset.teachForm)return;event.preventDefault();if(busy)return;busy=true;const values=Object.fromEntries(new FormData(form)),button=form.querySelector('button');button.disabled=true;
  try{
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
 const touch=()=>{lastInteraction=Date.now();};
 root.addEventListener('input',input);root.addEventListener('change',input);root.addEventListener('change',change);root.addEventListener('click',click);root.addEventListener('click',slideClick);root.addEventListener('submit',submit);
 for(const name of ['pointerdown','keydown','scroll'])document.addEventListener(name,touch,true);
 dispose=()=>{alive=false;clearInterval(timer);root.removeEventListener('input',input);root.removeEventListener('change',input);root.removeEventListener('change',change);root.removeEventListener('click',click);root.removeEventListener('click',slideClick);root.removeEventListener('submit',submit);for(const name of ['pointerdown','keydown','scroll'])document.removeEventListener(name,touch,true);};
 void load();
}
