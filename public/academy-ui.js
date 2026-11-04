import {completeStudyLesson} from './study-progress.js';
import {curriculum} from './course-map.js';
import {courseBookmarkButton} from './course-bookmark.js';
import {recordCheckin} from './study-calendar.js';
import {generationNotice,backgroundAI,taskInput} from './background-ai.js';
import {cloudAPI} from './cloud-records.js';
import {hasCompleteCourseware} from './courseware-contract.js';
import {nativeChallenges,checkNativeChallenge} from './native-challenges.js';
import {challengeSolutions} from './challenge-solutions.js';
import {studyTimeHTML,resolveStudyTime} from './study-time.js';
import {rewritePrompt} from './prompt-rewrite.js';
import {interactivePageExample,domPageExample,mountInteractivePage} from './academy-runner.js';
import {renderLabBody} from './lab-views.js';
import {diagnosePipeline} from './academy-models.js';
import {interviewContext,reviewInterview,interviewFeedbackHTML} from './interview-review.js';
import {syntaxCards} from './syntax-reference.js';
import {knowledgeQuestions,saveKnowledgeAttempt} from './knowledge-checks.js';
import {tri,local} from './i18n.js';
import {ensureAcademy,buildPlan,planProgress,planStepDone,planStepRoute,learningStats,recordActivity,lessonKey,evaluateInterview,promptReview,retrieve,initialDocker,dockerStep,gradientStep,pipelineResult} from './academy-core.js';
import {challenges,interviews,labs,retrievalDocs,referenceTopics} from './academy-content.js';
import {runSandbox} from './academy-runner.js';
import {runNativeProgram} from './native-runner.js';
import {createBrowserRunner,browserErrorText} from './browser-runner.js';
import {runnableExample,repairBuiltinDraft} from './runnable-examples.js';
import {createVoiceInterview} from './voice-interview.js';
import {createLearningViews} from './academy-views.js';
import {saveCourseHandoff} from './personal-course-handoff.js';
import {planCourseFor,clearPlanCourse,linkPlanCourse} from './plan-course-link.js';
import {createQuestViews} from './codequest-views.js';
import {programmingLessonById} from './programming-lessons.js';

export function createAcademy(ctx){
 const practiceChallenges=[...challenges,...nativeChallenges];
 const browserRunner=createBrowserRunner();let runAbort;
 const {esc:e,ico}=ctx,s=()=>ctx.state(),a=()=>ensureAcademy(s()),lang=()=>s().lang,contentLang=()=>s().profile.learningLanguage||lang();
 const L=(en,cn,tw)=>local(tri(en,cn,tw),lang()),T=v=>local(v,contentLang());
 const labels={'ai-result':tri('AI result','生成结果','產生結果'),'courseware-example':tri('Courseware example','课件样板','課件樣板'),assigned:tri('Assigned courses','老师布置的课程','老師指派的課程'),'teacher-course':tri('Course studio','课程工作台','課程工作台'),git:tri('Git simulator','Git 模拟练习','Git 模擬練習'),'interview-records':tri('My interviews','我的面试记录','我的面試紀錄'),games:tri('Learn coding through games','游戏学编程','遊戲學程式'),markComplete:tri('Complete lesson','完成课节','完成課節'),selfStudy:tri('Create a course','创建课程','建立課程'),explore:tri('Courses','课程','課程'),exploreTitle:tri('Courses','课程','課程'),exploreSub:tri('','',''),path:tri('Study plan','学习计划','學習計畫'),records:tri('My records','我的记录','我的紀錄'),next:tri('Next step','下一步','下一步'),practice:tri('Practice','练习中心','練習中心'),playground:tri('Playground','代码试验区','程式試驗區'),reference:tri('Reference','编程速查','程式速查'),setup:tri('Build a plan','制定计划','制定計畫'),plan:tri('Study plan','学习计划','學習計畫'),challenge:tri('Coding practice','编程练习','程式練習'),lab:tri('Interactive lab','交互实验','互動實驗'),interview:tri('Short answers','简答题','簡答題'),tutorial:tri('Programming guide','编程指南','程式指南'),codequest:tri('Code quest','编程闯关','程式闖關')};
 const view={preview:null,setupStep:0,setupDraft:null,interviewId:null,question:0,questionReview:null,feedback:null,loadedAttempt:null,lab:null,output:'',outputFailed:false,running:false,runToken:0,aiPlanSource:false,aiPlanData:null};
 let speech={running:false,paused:false,index:0,sentences:[],utterance:null},lastReset=null;
 let knownBadges=learningStats(s()).badges;
 const save=()=>{ctx.save();const now=learningStats(s()).badges,newBadge=now.findIndex((earned,i)=>earned&&!knownBadges[i]);knownBadges=now;if(newBadge>=0)queueMicrotask(()=>ctx.toast(L('Badge earned: ','获得徽章：','獲得徽章：')+badges()[newBadge]));},render=()=>ctx.render(),go=hash=>ctx.go(hash),uid=prefix=>`${prefix}-${crypto.randomUUID()}`;
 const voiceInterview=createVoiceInterview({locale:lang,getHistory:()=>a().voiceInterviews||[],onSave:session=>{a().voiceInterviews??=[];a().voiceInterviews=[...a().voiceInterviews,session].slice(-20);save();}});
 const button=(action,label,attrs='',secondary=true)=>`<button type="button" class="btn ${secondary?'secondary':''} small-btn" data-ac="${action}" ${attrs}>${label}</button>`;
 const link=(hash,label,secondary=true)=>`<a class="btn ${secondary?'secondary':''} small-btn" href="#${hash}">${label}</a>`;
 const heading=(title,sub='')=>`<div class="page-heading"><h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</div>`;
 const weekText=n=>`${n} ${L(n===1?'week':'weeks','周','週')}`;
 const selected=(x,v)=>x===v?'selected':'';
 const option=(value,label,current)=>`<option value="${e(value)}" ${selected(value,current)}>${e(label)}</option>`;
 const codeLanguage=x=>x==='cpp'?'C++':x==='python'?'Python':x==='html'?'HTML/CSS':x==='javascript'?'JavaScript':'C';
 const levelLabel=x=>x==='advanced'?L('Advanced','进阶','進階'):x==='intermediate'?L('Intermediate','中级','中階'):L('Foundation','入门','入門');
 const levelOptions=current=>['beginner','intermediate','advanced'].map(x=>option(x,levelLabel(x),current)).join('');
 const touch=(type,id,detail={})=>{recordActivity(s(),type,id,detail);save();};
 const cards=rows=>`<div class="academy-cards">${rows.join('')}</div>`;
 const empty=()=>`<p class="empty">${L('Nothing here yet.','这里还没有记录。','這裡還沒有紀錄。')}</p>`;
 const badges=()=>[L('First lesson','第一节课','第一節課'),L('Five lessons','完成五节','完成五節'),L('Knowledge check','理解检查','理解檢查'),L('Code checked','代码通过','程式通過'),L('Three-day rhythm','连续三天','連續三天'),L('Answer review','简答复盘','簡答回顧'),L('Three labs','三个实验','三個實驗')];
 function renderInPlace(){const y=window.scrollY;render();window.scrollTo({top:y,behavior:'instant'});}
 function stateStats(){return learningStats(s());}
 const views=createLearningViews(ctx,{e,L,T,s,a,link,button,heading,ico,cards,codeLanguage,stateStats,activePlan,badges,empty,canUndo:()=>!!lastReset,checkinOffset:()=>view.checkinOffset||0});
 const quest=createQuestViews({...ctx,a},{e,L,T,ico,button,link});
 function activePlan(){return a().plans.find(p=>p.id===a().activePlan)||null;}
 function savePlan(){
  if(!view.preview)return;const {plan,course}=view.preview;
  if(course&&!ctx.courses().some(c=>c.id===course.id))s().courses.push(course);
  a().plans.unshift(plan);backgroundAI.linkPlan(plan.id,'#plan/'+plan.id);a().activePlan=plan.id;s().path=null;save();view.preview=null;go('plan/'+plan.id);
 }
 function restorePlanResult(){
  const task=backgroundAI.requested('plan');if(!task?.result?.course)return;
  if(task.planPreview)view.preview=structuredClone(task.planPreview);
  else{
   const input=taskInput(task),language=input.language||contentLang(),profile={...s().profile,...input.profile},raw=task.result.course,id='study-task-'+task.id;
   const lessons=(raw.lessons||[]).filter(l=>typeof l.title==='string'&&typeof l.body==='string').map((l,i)=>({id:id+'-l'+(i+1),title:{[language]:l.title},body:{[language]:l.body},...(l.advanced?{advanced:{[language]:l.advanced}}:{}),type:'read',minutes:10}));
   if(!lessons.length){backgroundAI.clearRequest();return;}
   const course={id,title:{[language]:raw.title},description:{[language]:raw.description||''},topic:'foundations',theme:'lavender',duration:lessons.length*10,status:'published',personal:true,origin:'ai',level:profile.skillLevel||'beginner',audience:['cs','non-cs'],lessons};
   view.preview=buildPlan({courses:ctx.courses(),topic:input.topic||raw.title,profile,id:'plan-task-'+task.id,courseId:id,aiCourse:course});
   backgroundAI.linkResult(task.result,{planPreview:structuredClone(view.preview)});
  }
  view.aiPlanSource=true;const input=taskInput(task);view.aiPlanData={...input.profile,topic:input.topic||'',requirements:input.requirements||''};backgroundAI.clearRequest();
 }
 const needsCourseware=p=>['ai','template'].includes(p.source);
 const studyButton=(p,x)=>button('learn-plan-section',planStepDone(x,s())?L('Review lesson','复习本节','複習本節'):p.generatedLessons?.[x.lessonId]?L('Continue learning','继续学习','繼續學習'):L('Generate and learn','生成并学习','產生並學習'),`data-plan="${e(p.id)}" data-lesson="${e(x.lessonId)}"`,false);
 const planHref=(p,x)=>x.kind||!x.courseId?planStepRoute(x):`plan/${p.id}/${x.lessonId}`;
 function planForm(){const d=a().planDraft||{topic:'',requirements:'',weeklyMinutes:s().profile.weeklyMinutes,skillLevel:s().profile.skillLevel};return `<form id="academy-plan-form" class="form-card"><div class="form-grid"><div class="field full-field"><label for="plan-topic">${L('What do you want to learn?','你想学习什么？','你想學習甚麼？')}</label><input id="plan-topic" name="topic" required maxlength="180" value="${e(d.topic)}" aria-describedby="plan-topic-hint" placeholder="${L('e.g. testing, AI coding, web architecture','例如：测试、AI 编程、网页架构','例如：測試、AI 程式設計、網頁架構')}"><p class="field-hint" id="plan-topic-hint">${L('Type any topic, or combine topics such as Python + Git.','可自由输入主题，也可组合多个主题，例如 Python + Git。','可自由輸入主題，也可組合多個主題，例如 Python + Git。')}</p></div><div class="field"><label for="plan-level">${L('Level','难度','難度')}</label><select id="plan-level" name="skillLevel">${levelOptions(d.skillLevel)}</select></div>${studyTimeHTML('plan-minutes',d,lang())}<div class="field full-field"><label for="plan-requirements">${L('Goal or notes for AI (optional)','给 AI 的目标或说明（可选）','給 AI 的目標或說明（可選）')}</label><textarea id="plan-requirements" name="requirements" maxlength="5000" rows="3" placeholder="${L('e.g. choose and order the lessons myself; focus on one practical example','例如：请 AI 帮我确定主题并安排课节顺序，多用一个实际例子','例如：請 AI 幫我確定主題並安排課節順序，多用一個實際例子')}">${e(d.requirements||'')}</textarea></div></div><div class="form-actions"><button class="btn" type="submit">${L('Preview my plan','预览计划','預覽計畫')}</button>${button('ai-plan',`${ico('spark',14)}${L('Let AI plan for me','让 AI 为我规划','讓 AI 為我規劃')}`,'',false)}</div><p class="small muted">${generationNotice()}</p><p class="small muted" data-plan-ai-status role="status">${L('Preview matches your topic to published courses. AI planning proposes its own theme and lesson sequence for a brand-new subject.','预览会把主题匹配到已发布课程；AI 规划会为新学科自行提出课程主题和课节顺序。','預覽會把主題配對到已發布課程；AI 規劃會為新學科自行提出課程主題與課節順序。')}</p></form>`;}
 function previewHTML(){const p=view.preview?.plan;if(!p)return '';const aiCourse=p.source==='ai'?view.preview?.course:null;return `<section class="panel academy-preview" id="plan-preview"><h2>${e(T(p.title))}</h2>${aiCourse?`<p><strong>${e(T(aiCourse.title))}</strong>${aiCourse.description?` · ${e(T(aiCourse.description))}`:''}</p>`:''}<p>${weekText(p.weeks)} · ${p.weeklyMinutes} ${L('min / week','分钟 / 周','分鐘 / 週')} · ${p.totalMinutes} ${L('min total','分钟合计','分鐘合計')}</p><p class="small muted">${p.source==='ai'?L('AI-generated theme and lesson sequence. Review everything before saving; this is a planning draft, not verified teaching material.','AI 生成的主题与课节顺序。保存前请逐项检查；这是规划草稿，不是已核实的教学材料。','AI 生成的主題與課節順序。儲存前請逐項檢查；這是規劃草稿，不是已核實的教學材料。'):p.source==='template'?L('Study template: add reliable subject sources before using this as teaching material.','学习模板：作为教学材料前，请补充可靠的学科资料。','學習範本：作為教學材料前，請補充可靠的學科資料。'):L('Matched from the published course catalog.','从已发布课程中匹配。','從已發布課程中配對。')}</p>${p.rationale?`<details class="plan-overview"><summary>${L('How this plan fits your goal','计划如何对应目标','計畫如何對應目標')}</summary><p>${e(T(p.rationale))}</p></details>`:''}${stepsHTML(p,false)}<div class="row mt">${button('save-plan',L('Save and start','保存并开始','儲存並開始'),'',false)}${button('regenerate',L('Regenerate preview','重新生成预览','重新產生預覽'))}</div></section>`;}
 function stepsHTML(p,interactive=true){if(p.modules?.length)return `<div class="plan-stages">${p.modules.map((m,i)=>`<section class="plan-stage"><h3>${i+1}. ${e(T(m.title))}</h3>${stepsHTML({...p,modules:null,steps:m.steps},interactive)}</section>`).join('')}</div>`;return `<ol class="academy-steps">${p.steps.map(x=>{const c=ctx.course(x.courseId),done=planStepDone(x,s());return `<li><span class="academy-week">${L('Week','第','第')} ${x.week}${lang()==='en'?'':' '+L('','周','週')}</span><div class="grow">${interactive&&(c||x.kind==='tutorial'||x.kind==='practice')?`<a href="#${e(planHref(p,x))}">${e(T(x.title))}</a>`:`<strong>${e(T(x.title))}</strong>`}<div class="small muted">${needsCourseware(p)&&!x.kind?(done?L('✓ Completed','✓ 已完成','✓ 已完成'):p.generatedLessons?.[x.lessonId]?L('Content saved','内容已保存','內容已儲存'):L('Not generated','待生成','待產生'))+' · ':''}${e(T(x.courseTitle))} · ${x.minutes} ${L('min','分钟','分鐘')}${x.parts>1?` · ${x.part}/${x.parts}`:''}</div></div>${x.rationale?`<details class="plan-rationale"><summary>${L('Why this step?','为什么学这一步？','為甚麼學這一步？')}</summary><p>${e(T(x.rationale))}</p></details>`:''}${interactive&&needsCourseware(p)&&!x.kind?studyButton(p,x):interactive&&x.kind==='practice'?link(planHref(p,x),done?L('Revisit','复习','複習'):L('Open practice','进入练习','進入練習')):interactive?button(x.kind==='tutorial'?'complete-tutorial':done?'reopen':'complete-plan',done?L('Reopen','撤销完成','撤銷完成'):L('Mark done','标为完成','標為完成'),x.kind==='tutorial'?`data-id="${e(x.tutorialId)}"`:`data-course="${e(x.courseId)}" data-lesson="${e(x.lessonId)}"`):''}</li>`;}).join('')}</ol>`;}
 function pathsPage(){restorePlanResult();return heading(L('Study plan','学习计划','學習計畫'),L('Choose a topic, difficulty and weekly time for this plan. Your profile stays unchanged.','为本次计划选择主题、难度和每周时间，不会修改学习档案。','為本次計畫選擇主題、難度與每週時間，不會修改學習檔案。'))+planForm()+previewHTML()+`<section class="mt-lg"><div class="section-head"><h2>${L('Your plans','你的计划','你的計畫')}</h2></div>${a().plans.length?cards(a().plans.map(p=>{const r=planProgress(p,s());return `<article class="panel"><div class="row between"><h3>${e(T(p.title))}</h3>${a().activePlan===p.id?`<span class="pill">${L('Active','当前','目前')}</span>`:''}</div><p>${weekText(p.weeks)} · ${p.weeklyMinutes} ${L('min / week','分钟 / 周','分鐘 / 週')}</p><div class="progress-track"><div class="progress-fill" style="width:${r.percent}%"></div></div><p class="small">${r.percent}% · ${L(r.remainingWeeks===1?'1 week remaining':r.remainingWeeks+' weeks remaining',r.remainingWeeks+' 周待完成',r.remainingWeeks+' 週待完成')}</p><div class="row">${link('plan/'+p.id,L('View plan','查看计划','查看計畫'))}${a().activePlan!==p.id?button('active-plan',L('Make active','设为当前','設為目前'),`data-id="${e(p.id)}"`):''}${button('delete-plan',L('Delete','删除','刪除'),`data-id="${e(p.id)}"`)}</div></article>`;})):empty()}</section><details class="academy-legacy mt"><summary>${L('Reorder the full course list','调整全部课程顺序','調整全部課程順序')}</summary>${ctx.basePath()}</details>`;}
 function planLesson(p,lessonId){
  const steps=p.modules?.flatMap(m=>m.steps)||p.steps,i=steps.findIndex(x=>!x.kind&&x.lessonId===lessonId),step=steps[i],c=step&&ctx.course(step.courseId),lesson=c?.lessons.find(l=>l.id===lessonId)||c?.lessons[step.index];
  if(!lesson)return heading(L('Lesson not found','未找到课节','找不到課節'))+link('plan/'+p.id,L('Back to plan','返回计划','返回計畫'));
  if(needsCourseware(p))return heading(e(T(lesson.title)))+`<section class="panel"><p>${p.generatedLessons?.[lessonId]?L('Your saved lesson is ready.','这一节已有保存的学习内容。','這一節已有儲存的學習內容。'):L('This is a planning outline. Generate the full lesson before studying.','当前是学习大纲。生成完整讲解、示例和练习后再开始学习。','目前是學習大綱。產生完整講解、範例與練習後再開始學習。')}</p><details><summary>${L('View outline','查看大纲','查看大綱')}</summary><p>${e(T(lesson.body))}</p></details><div class="row mt">${studyButton(p,step)}${link('plan/'+p.id,L('Back to plan','返回计划','返回計畫'))}${p.generatedLessons?.[lessonId]?button('complete-plan',L('Mark done','标为完成','標為完成'),`data-course="${e(step.courseId)}" data-lesson="${e(lessonId)}"`):''}</div><p data-plan-lesson-status role="status"></p></section>`;
  const done=planStepDone(step,s()),prev=steps.slice(0,i).reverse().find(x=>!x.kind&&x.lessonId),next=steps.slice(i+1).find(x=>!x.kind&&x.lessonId);
  const prose=v=>e(T(v)).replace(/\n{2,}/g,'</p><p>').replace(/\n/g,'<br>');
  return `<div class="lesson-top"><a href="#plan/${e(p.id)}">${ico('back',13)}${L('Back to plan','返回计划','返回計畫')}</a><div class="row"><span class="pill">${e(T(c.title))}</span><span class="small muted">${e(T(p.title))}</span></div></div><article class="lesson-paper academy-plan-lesson" lang="${e(contentLang())}"><span class="eyebrow muted">${String(i+1).padStart(2,'0')} / ${String(steps.length).padStart(2,'0')} · ${step.minutes} ${L('min','分钟','分鐘')}</span><h1>${e(T(lesson.title))}</h1><div class="lesson-text"><p>${prose(lesson.body)}</p></div>${lesson.advanced?`<details class="study-reference"><summary>${L('Extension','进阶延伸','進階延伸')}</summary><div class="lesson-text"><p>${prose(lesson.advanced)}</p></div></details>`:''}<p class="small muted" data-plan-lesson-status role="status"></p><div class="lesson-actions">${prev?link('plan/'+p.id+'/'+prev.lessonId,L('Previous lesson','上一节','上一節')):''}${button('expand-plan-lesson',`${ico('spark',14)}${L('Expand with AI','AI 扩充这一节','AI 擴充這一節')}`,`data-plan="${e(p.id)}" data-course="${e(step.courseId)}" data-lesson="${e(lesson.id)}"`,false)}${done?button('reopen',L('Mark as not complete','撤销完成','撤銷完成'),`data-course="${e(step.courseId)}" data-lesson="${e(lesson.id)}"`):button('complete-plan',L('Mark done','标为完成','標為完成'),`data-course="${e(step.courseId)}" data-lesson="${e(lesson.id)}"`,false)}${next?link('plan/'+p.id+'/'+next.lessonId,L('Next lesson','下一节','下一節'),false):''}</div></article>`;
 }
 function setupPage(){const d=view.setupDraft||{...s().profile,topic:''};view.setupDraft=d;return heading(L('Your starting point. Your pace.','按你的起点和节奏学习。','依你的起點和步調學習。'))+`<div class="academy-setup-steps">${[0,1,2].map(i=>`<span class="${i===view.setupStep?'current':''}">${i+1}</span>`).join('')}</div><form id="academy-setup-form" class="form-card"><div class="form-grid">${view.setupStep===0?`<div class="field full-field"><label for="setup-name">${L('Name','名字','名字')}</label><input id="setup-name" name="name" value="${e(d.name)}" maxlength="50" required></div><div class="field"><label for="setup-background">${L('Experience','目前经验','目前經驗')}</label><select id="setup-background" name="background">${['noCoding','someCoding','experienced'].map(x=>option(x,ctx.label(x),d.background)).join('')}</select></div><div class="field"><label for="setup-level">${L('Level','难度','難度')}</label><select id="setup-level" name="skillLevel">${levelOptions(d.skillLevel)}</select></div>`:view.setupStep===1?`<div class="field"><label for="setup-goal">${L('Goal','学习目标','學習目標')}</label><select id="setup-goal" name="goal">${['understand','build','career'].map(x=>option(x,ctx.label(x),d.goal)).join('')}</select></div>${studyTimeHTML('setup-minutes',d,lang())}<fieldset class="field full-field academy-interests"><legend>${L('Interests','兴趣','興趣')}</legend>${['development','requirements','architecture','ai-coding','testing-release','product-decisions','career'].map(x=>`<label><input type="checkbox" name="interests" value="${x}" ${(d.interests||[]).includes(x)?'checked':''}>${e(T(ctx.course(x)?.title||x))}</label>`).join('')}</fieldset>`:`<div class="field full-field"><label for="setup-topic">${L('Topic','学习主题','學習主題')}</label><input id="setup-topic" name="topic" required maxlength="180" value="${e(d.topic||'')}" placeholder="${L('What would you like to learn?','你想学什么？','你想學甚麼？')}"></div><p class="small muted">${L('We match published lessons first. For a new subject, you can preview a source-led study template.','优先匹配已有课节；新学科可以先预览资料导向的学习模板。','優先配對已有課節；新學科可以先預覽資料導向的學習範本。')}</p>`}</div><div class="form-actions">${view.setupStep?button('setup-back',L('Back','上一步','上一步')):''}<button class="btn" type="submit">${view.setupStep===2?L('Preview plan','预览计划','預覽計畫'):L('Continue','继续','繼續')}</button></div></form>`;}
 function planDetail(id,lessonId){const p=a().plans.find(p=>p.id===id);if(!p)return heading(L('Plan not found','未找到计划','找不到計畫'))+link('path',L('All plans','全部计划','全部計畫'));if(lessonId)return planLesson(p,lessonId);const r=planProgress(p,s());const planCourse=[...new Set([...(p.matchedCourses||[]),...p.steps.map(x=>x.courseId)])].map(x=>ctx.course(x)).find(x=>x?.lessons?.length);return heading(e(T(p.title)),`${weekText(p.weeks)} · ${p.weeklyMinutes} ${L('min / week','分钟 / 周','分鐘 / 週')} · ${r.percent}%`)+`<div class="row mb">${link('path',L('All plans','全部计划','全部計畫'))}${r.next?link(planHref(p,r.next),L('Continue learning','继续学习','繼續學習'),false):''}${!p.modules?button('refresh-plan',L('Update this plan','更新这份计划','更新這份計畫'),`data-id="${e(id)}"`):''}${planCourse&&!needsCourseware(p)?button('create-course',planCourseFor(ctx.user?.()?.id,id)?L('Continue designing','继续设计课程','繼續設計課程'):L('Create a course','制作课程','製作課程'),`data-id="${e(id)}"`):''}${needsCourseware(p)&&planCourseFor(ctx.user?.()?.id,id)?link('personal-course/'+planCourseFor(ctx.user?.()?.id,id),L('Edit in My custom courses','到我的自定义课程修改','到我的自訂課程修改')):''}${button('active-plan',L('Make active','设为当前','設為目前'),`data-id="${e(id)}"`)}</div><p>${L('Lessons are scheduled within your weekly time budget. Longer lessons may span more than one session.','课节按每周时间安排，较长课节会拆分到多个学习时段。','課節依每週時間安排，較長課節會拆分為多個學習時段。')}</p>${p.source==='ai'||p.source==='template'?`<p class="callout">${L('Generation may take about 5 minutes. Browse other site pages while keeping this tab open. Saved lessons can be resumed or edited in My custom courses.','这是学习路径大纲。生成可能需要约 5 分钟，可切换站内页面（请保持标签页打开）。完整内容会保存，也可到「我的自定义课程」自行修改。','這是學習路徑大綱。產生可能需要約 5 分鐘，可切換站內頁面（請保持分頁開啟）。完整內容會儲存，也可到「我的自訂課程」自行修改。')}</p>`:''}${p.rationale?`<details class="plan-overview"><summary>${L('How this plan fits your goal','计划如何对应目标','計畫如何對應目標')}</summary><p>${e(T(p.rationale))}</p></details>`:''}${stepsHTML(p)}`;}
 function catalogResults(){
  const q=(document.querySelector('#course-search')?.value||'').trim().toLowerCase(),topic=document.querySelector('#topic-filter')?.value||'allTopics',level=document.querySelector('#academy-level')?.value||'all',audience=document.querySelector('#academy-audience')?.value||'all';
  const cs=ctx.courses().filter(c=>c.status==='published'&&(topic==='allTopics'||c.topic===topic)&&(level==='all'||(c.level||'beginner')===level)&&(audience==='all'||(c.audience||['cs','non-cs']).includes(audience))&&((ctx.route()[1]==='tools')?c.collection==='tools':c.collection!=='tools'));
  const courseMatches=cs.filter(c=>!q||(T(c.title)+' '+T(c.description)).toLowerCase().includes(q));
  const html=courseMatches.map(ctx.card).join('');const hits=q?cs.flatMap(c=>c.lessons.map((l,i)=>({c,l,i}))).filter(({l})=>(T(l.title)+' '+T(l.body).slice(0,500)).toLowerCase().includes(q)).slice(0,20):[];
  const out=document.querySelector('#course-results');if(out)out.innerHTML=html||empty();let h=document.querySelector('#academy-lesson-hits');if(!h){out?.insertAdjacentHTML('afterend','<section id="academy-lesson-hits" class="mt"></section>');h=document.querySelector('#academy-lesson-hits');}if(h)h.innerHTML=hits.length?`<h2>${L('Matching lessons','匹配课节','符合的課節')}</h2><ul class="academy-links">${hits.map(({c,l,i})=>`<li><a href="#learn/${e(c.id)}/${i}">${e(T(l.title))}</a><span class="small muted"> · ${e(T(c.title))}</span></li>`).join('')}</ul>`:'';
 }
 function challengePage(id){const c=practiceChallenges.find(c=>c.id===id);if(!c)return empty();const result=a().challenges[id],siblings=practiceChallenges.filter(x=>(x.language||'javascript')===(c.language||'javascript'));return heading(L('Practice','练习中心','練習中心'))+views.practiceTabs('coding')+views.practiceSections('coding')+`<section class="panel mb"><span class="pill">${c.language?codeLanguage(c.language):'JavaScript'}</span><h2>${e(T(c.title))}</h2><p>${e(T(c.brief))}</p><p>${c.language?'':L('Write a function named','请编写函数','請編寫函式')+' <code>'+e(c.entry)+'</code>。'}${L('Run to check all test cases.','运行后自动检查全部测试用例。','執行後自動檢查全部測試案例。')}</p></section><div class="academy-playground"><section class="panel"><label for="academy-code">${L('Code','代码','程式碼')}</label><textarea id="academy-code" class="code-editor academy-editor" spellcheck="false" data-ac-code="${id}">${e(result?.code??c.starter)}</textarea><div class="row mt">${button('run-challenge',L('Run','运行','執行'),`data-id="${id}"`,false)}${c.language?button('stop-challenge',L('Stop','停止运行','停止執行'),'',true,'disabled'):''}${button('hint-challenge',L('Hint · fill correct code','Hint · 填入正确代码','Hint · 填入正確程式碼'),`data-id="${id}"`)}${button('reset-challenge',L('Reset code','重置代码','重設程式'),`data-id="${id}"`)}${link('challenge/'+siblings[(siblings.indexOf(c)+1)%siblings.length].id,L('Next question →','下一题 →','下一題 →'))}</div></section><section class="panel"><h2>${L('Result','运行结果','執行結果')}</h2><div id="academy-code-output" class="academy-output" role="status">${L('Run your code to check the answer.','运行代码后自动判断对错。','執行程式後自動判斷對錯。')}</div></section></div>`;}
 const playgroundDefaults={javascript:'const values = [1, 2, 3];\nconsole.log(values.map(x => x * 2));',html:interactivePageExample,c:'#include <stdio.h>\nint main(void) {\nint count = 3;\nprintf("Count: %d\\n", count);\nreturn 0;\n}',cpp:'#include <iostream>\n#include <vector>\nint main() {\n  std::vector<int> values = {1, 2, 3};\n  for (int value : values) std::cout << value * 2 << " ";\n  std::cout << "\\n";\n  return 0;\n}',python:'name = "Forma"\nprint("Hello", name)'};
 function playgroundPage(){const p=a().playground,requested=ctx.route()[0]==='playground'?ctx.route()[1]:null;if(requested&&Object.hasOwn(playgroundDefaults,requested))p.language=requested;const language=p.language||'javascript',code=repairBuiltinDraft(language,p.sources?.[language]??p.code??playgroundDefaults[language]);return heading(L('A place to experiment.','给想法一个试验区。','給想法一個試驗區。'))+`<div class="academy-playground"><section class="panel"><div class="field"><label for="academy-play-language">${L('Language / mode','语言 / 模式','語言 / 模式')}</label><select id="academy-play-language">${Object.keys(playgroundDefaults).map(x=>option(x,x==='html'?'HTML / CSS / JavaScript':x==='javascript'?'JavaScript':codeLanguage(x),language)).join('')}</select></div><p class="small muted">${['c','cpp','python'].includes(language)?L('Real browser execution with Clang / Pyodide. First load downloads the runtime (C/C++ about 100 MB); later runs reuse it. No source upload in browser mode.','通过浏览器内 Clang / Pyodide 真实运行。首次下载运行环境（C/C++ 约 100 MB），之后复用；浏览器模式不上传代码。','透過瀏覽器內 Clang / Pyodide 真實執行。首次下載執行環境（C/C++ 約 100 MB），之後重用；瀏覽器模式不會上傳程式碼。'):language==='html'?L('Interactive page in an isolated preview. Click the example button to check the DOM update.','在隔离预览中运行交互网页，点击示例按钮检查 DOM 更新。','在隔離預覽中執行互動網頁，點選範例按鈕檢查 DOM 更新。'):L('JavaScript runs in an isolated worker with a time limit; DOM and network access are unavailable.','JavaScript 在隔离且限时的 Worker 中运行，不能访问 DOM 或网络。','JavaScript 在隔離且限時的 Worker 中執行，無法存取 DOM 或網路。')}</p>${['c','cpp','python'].includes(language)?`<div class="field"><label for="academy-execution-mode">${L('Execution mode','运行方式','執行方式')}</label><select id="academy-execution-mode"><option value="browser">${L('Browser (default)','浏览器运行（默认）','瀏覽器執行（預設）')}</option><option value="remote">${L('Remote backup — uploads code and input','远程备用 — 会上传代码及输入','遠端備用 — 會上傳程式碼及輸入')}</option></select></div>`:''}<label for="academy-play-code">${L('Code','代码','程式碼')}</label><textarea id="academy-play-code" class="code-editor academy-editor" spellcheck="false">${e(code)}</textarea>${['c','cpp','python'].includes(language)?`<div class="field mt"><label for="academy-play-stdin">${L('Standard input (optional)','标准输入（可选）','標準輸入（選填）')}</label><textarea id="academy-play-stdin" rows="3" maxlength="10000" placeholder="${L('For scanf, cin or input()','供 scanf、cin 或 input() 读取','供 scanf、cin 或 input() 讀取')}">${e(p.stdin||'')}</textarea></div>`:''}<div class="row mt">${button('run-playground',L('Run / preview','运行 / 预览','執行 / 預覽'),'',false)}${button('stop-playground',L('Stop','停止运行','停止執行'),'disabled')}${button('reset-playground',L('Reset example','重置示例','重設範例'))}${button('clear-output',L('Clear output','清空输出','清空輸出'))}</div><div class="field mt"><label for="academy-template">${L('Load an example','加载示例','載入範例')}</label><select id="academy-template"><option value="">${L('Choose an example…','选择示例…','選擇範例…')}</option>${referenceTopics.filter(t=>t.language===language).map(t=>option(t.id,T(t.title),'')).join('')}</select></div></section><section class="panel"><h2>${L('Output','输出','輸出')}</h2><pre id="academy-play-output" class="academy-output" role="status">${e(view.output)}</pre><iframe id="academy-html-preview" title="${L('HTML preview','HTML 预览','HTML 預覽')}" sandbox="" class="academy-html-preview" ${language==='html'?'':'hidden'}></iframe></section></div>`;}
 function referenceResults(){const q=(document.querySelector('#academy-reference-search')?.value||'').toLowerCase(),language=document.querySelector('#academy-reference-language')?.value||'all';return cards(syntaxCards.filter(x=>(language==='all'||x.language===language)&&(!q||(T(x.title)+' '+T(x.body)+' '+x.code).toLowerCase().includes(q))).map(x=>`<article class="panel syntax-card"><span class="pill">${codeLanguage(x.language)}</span><h2>${e(T(x.title))}</h2><p>${e(T(x.body))}</p><pre class="academy-code">${e(x.code)}</pre>${link('explore/programming/'+x.language,L('Related lessons','相关课节','相關課節'))}</article>`))||empty();}
 function referencePage(){return heading(L('Syntax reference','语法速查','語法速查'))+`<div class="toolbar"><label class="search">${ico('search',16)}<input id="academy-reference-search" aria-label="${L('Search syntax','搜索语法','搜尋語法')}" placeholder="${L('Find syntax or an example','查找语法或示例','查找語法或範例')}"></label><select id="academy-reference-language" class="filter" aria-label="${L('Programming language','编程语言','程式語言')}"><option value="all">${L('All languages','全部语言','全部語言')}</option>${Object.keys(playgroundDefaults).map(x=>option(x,codeLanguage(x),'all')).join('')}</select></div><div id="academy-reference-results">${referenceResults()}</div>`;}
 function interviewPage(id,attemptId){const scenario=interviews.find(x=>x.id===id)||interviews[0];if(view.interviewId!==scenario.id){view.interviewId=scenario.id;view.question=0;view.questionReview=null;view.feedback=null;}const attempt=a().interviews.find(x=>x.id===attemptId&&x.scenarioId===scenario.id);if(attempt&&view.loadedAttempt!==attempt.id){view.loadedAttempt=attempt.id;view.feedback=reviewInterview(scenario,attempt.answers,contentLang());}if(!attemptId)view.loadedAttempt=null;const draft=a().interviewDrafts?.[scenario.id]||[],i=view.question,h={e,L,T};
 const selection=`<label class="interview-switch" for="academy-interview-scenario">${L('Scenario','练习场景','練習情境')}<select id="academy-interview-scenario">${interviews.map(x=>option(x.id,T(x.title),scenario.id)).join('')}</select></label><p class="interview-context">${e(T(interviewContext[scenario.id]))}</p>`;
 if(view.feedback)return heading(e(T(scenario.title)))+selection+`<section class="panel"><h2>${L('Review your answers','复盘你的回答','回顧你的回答')}</h2>${view.feedback.map((r,j)=>`<section class="academy-answer"><h3>${j+1}. ${e(T(scenario.questions[j]))}</h3><p class="academy-answer-text">${e(r.answer)}</p>${interviewFeedbackHTML(r,{...h,disclosure:false})}</section>`).join('')}<p class="lab-disclosure">${L('Local writing cues support revision; they do not measure hiring suitability or mastery.','本地写作线索供修改参考，不衡量录用或掌握程度。','本機寫作線索供修改參考，不衡量錄用或掌握程度。')}</p><div class="row mt">${button('interview-retry',L('Revise my answers','修改回答','修改回答'))}${button('interview-coach',L('Get coaching','获取辅导','取得輔導'))}</div><div id="academy-coach" role="status"></div></section>`;
 return heading(e(T(scenario.title)))+selection+`<form id="academy-interview-form" class="form-card"><span class="pill">${i+1} / ${scenario.questions.length}</span><h2>${e(T(scenario.questions[i]))}</h2><label for="academy-interview-answer">${L('Your answer','你的回答','你的回答')}</label><textarea id="academy-interview-answer" data-scenario="${scenario.id}" data-question="${i}" rows="7" required maxlength="6000">${e(draft[i]||'')}</textarea><div id="academy-interview-feedback" class="academy-live-review" role="status"></div><div class="form-actions">${i?button('interview-back',L('Previous question','上一题','上一題')):''}<button class="btn" type="submit">${L('Review this answer','检查这一题','檢查這一題')}</button></div></form>${view.questionReview?interviewFeedbackHTML(view.questionReview,h)+`<div class="row mt">${button('interview-next',i+1===scenario.questions.length?L('Finish and save review','完成并保存复盘','完成並儲存回顧'):L('Next question','下一题','下一題'),'',false)}</div>`:''}`;
 }
 function labState(id){const defaults={prompt:{text:'',result:null},rag:{query:'classroom roster',k:2,hybrid:false,result:null},ci:{fixes:[],result:null},docker:initialDocker(),gradient:{m:0,b:0,rate:.05,history:[],loss:33}};a().labStates??={};if(a().labStates[id]===undefined){a().labStates[id]=defaults[id];save();}return a().labStates[id];}
 function labPage(id){const meta=labs.find(x=>x[0]===id);if(!meta)return empty();const z=labState(id);
  const body=renderLabBody(id,z,{e,L,T,button,option});
  return heading(e(T(meta[1])),e(T(meta[2])))+`<div class="row mb">${link('practice',L('All practice','全部练习','全部練習'))}${button('reset-lab',L('Reset lab','重置实验','重設實驗'),`data-id="${id}"`)}</div><section class="panel academy-lab-panel">${body}<div id="academy-lab-feedback" role="status"></div></section>`;
 }
 function stopSpeech(){if('speechSynthesis' in window)window.speechSynthesis.cancel();speech.running=false;speech.paused=false;document.querySelectorAll('.academy-spoken').forEach(n=>n.classList.remove('academy-spoken'));}
 function speakNext(){
  if(!speech.running)return;if(speech.index>=speech.sentences.length){stopSpeech();updateSpeechButtons();return;}
  const node=speech.sentences[speech.index];document.querySelectorAll('.academy-spoken').forEach(n=>n.classList.remove('academy-spoken'));node.classList.add('academy-spoken');
  const utterance=new SpeechSynthesisUtterance(node.textContent);utterance.lang=contentLang()==='en'?'en-US':contentLang();utterance.rate=Number(a().narration.rate)||1;
  const voice=window.speechSynthesis.getVoices().find(v=>v.voiceURI===a().narration.voice);if(voice)utterance.voice=voice;
  utterance.onend=()=>{if(speech.utterance!==utterance)return;speech.index++;speakNext();};utterance.onerror=()=>{stopSpeech();updateSpeechButtons();};speech.utterance=utterance;window.speechSynthesis.speak(utterance);
 }
 function updateSpeechButtons(){const b=document.querySelector('[data-ac="read-lesson"]'),p=document.querySelector('[data-ac="pause-reading"]');if(b)b.textContent=speech.running?L('Stop reading','停止朗读','停止朗讀'):L('Read lesson','朗读课文','朗讀課文');if(p){p.disabled=!speech.running;p.textContent=speech.paused?L('Resume','继续朗读','繼續朗讀'):L('Pause','暂停','暫停');}}
 function voiceOptions(){const selector=document.querySelector('#academy-voice');if(!selector||!('speechSynthesis' in window))return;const voices=speechSynthesis.getVoices().filter(v=>v.lang.startsWith(contentLang()==='en'?'en':'zh')).slice(0,30);selector.innerHTML=option('',L('Device default voice','设备默认声音','裝置預設聲音'),a().narration.voice)+voices.map(v=>option(v.voiceURI,v.name+' · '+v.lang,a().narration.voice)).join('');}
 function lessonTools(c,l,index){
  const done=s().progress[c.id]?.includes(l.id),supported='speechSynthesis' in window;
  return `<section class="academy-lesson-tools"><div class="row">${button('explain',L('Explain simply','通俗解释','淺白解釋'),`data-course="${e(c.id)}" data-index="${index}"`)}${done?button('reopen',L('Mark as not complete','撤销完成','撤銷完成'),`data-course="${e(c.id)}" data-lesson="${e(l.id)}"`):''}</div><div class="academy-narration mt-sm">${button('read-lesson',L('Read lesson','朗读课文','朗讀課文'),supported?'':'disabled')}${button('pause-reading',L('Pause','暂停','暫停'),'disabled')}<label>${L('Speed','语速','語速')}<select id="academy-rate">${[.8,1,1.25,1.5].map(v=>option(String(v),v+'×',String(a().narration.rate))).join('')}</select></label><label>${L('Voice','声音','聲音')}<select id="academy-voice"></select></label></div>${supported?'':`<p class="small muted">${L('This browser does not support speech; the complete lesson remains readable.','此浏览器不支持朗读，可以阅读完整课文。','此瀏覽器不支援朗讀，可閱讀完整課文。')}</p>`}</section>`;
 }
 function afterRender(page,id,index){
  if(page==='course')document.querySelector('#content .page-heading')?.insertAdjacentHTML('beforeend',courseBookmarkButton(id,a().bookmarks.includes('course:'+id),lang()));
  if(page==='learn'){const parent=curriculum.flatMap(t=>t.courses).find(c=>c.lessons.some(l=>l.id===id));if(parent){document.querySelector('.dl-slide>header')?.insertAdjacentHTML('beforeend',courseBookmarkButton(parent.id,a().bookmarks.includes('course:'+parent.id),lang()));const done=s().progress[parent.id]?.includes(id);document.querySelector('.dl-center')?.insertAdjacentHTML('beforeend',`<div class="dl-study-completion">${button('complete-authored-lesson',done?L('✓ Completed','✓ 已完成','✓ 已完成'):L('Complete lesson · +40 XP','完成本节学习 · +40 XP','完成本節學習 · +40 XP'),`data-course="${e(parent.id)}" data-lesson="${e(id)}" ${done?'disabled':''}`,false)}</div>`);}}
  if(page==='mock-interview')voiceInterview.mount();
  if(['challenge','tutorial'].includes(page))document.querySelector('#content')?.insertAdjacentHTML('afterbegin',views.sourceContext());
  if(page==='challenge')document.querySelector('#content')?.insertAdjacentHTML('afterbegin',`<a class="activity-back" href="#practice/${page==='challenge'?'coding':'written'}">${ico('back',17)}${page==='challenge'?L('Coding challenges','编程挑战','程式挑戰'):L('Short answers','简答题','簡答題')}</a>`);
  if(page==='learn'||page==='tutorial'){a().lastStudy=page==='tutorial'?{kind:'tutorial',id}:{kind:'lesson',courseId:id,index:Number(index)||0};save();}
  if(page==='course'){document.querySelector('#content .footer')?.insertAdjacentHTML('beforebegin',views.related(id,0));}
  if(page==='explore'&&id!=='programming'){
   document.querySelector('.page-heading')?.insertAdjacentHTML('afterend',views.courseTabs(id==='tools'?'tools':'software'));
   document.querySelector('#topic-filter')?.remove();
   document.querySelector('.toolbar')?.insertAdjacentHTML('beforeend',`<select id="academy-level" class="filter" aria-label="${L('Course level','课程难度','課程難度')}"><option value="all">${L('All levels','全部难度','全部難度')}</option>${levelOptions('all')}</select>`);catalogResults();
  }
  if(page==='editor'){
   const d=ctx.editor();if(d?.generationFallback)document.querySelector('.page-heading')?.insertAdjacentHTML('afterend',`<p class="callout warning mb">${L('AI was unavailable. This is a study template for you to review and edit.','AI 暂不可用，这是一份供你审核和编辑的学习模板。','AI 暫時無法使用，這是一份供你審核和編輯的學習範本。')}</p>`);if(d)document.querySelector('#editor-form .form-grid')?.insertAdjacentHTML('beforeend',`<div class="field"><label for="academy-edit-level">${L('Course level','课程难度','課程難度')}</label><select id="academy-edit-level">${option('',L('All levels','全部难度','全部難度'),d.level||'')}${levelOptions(d.level)}</select></div><div class="field"><label for="academy-edit-audience">${L('Audience','适用背景','適用背景')}</label><select id="academy-edit-audience">${option('all',L('Any background','不限背景','不限背景'),d.audience?.length===1?d.audience[0]:'all')}${option('cs','CS',d.audience?.length===1?d.audience[0]:'all')}${option('non-cs','Non-CS',d.audience?.length===1?d.audience[0]:'all')}</select></div>`);
  }
  if(page==='tutorial'){const t=referenceTopics.find(x=>x.id===id);if(t){document.querySelector('.mini-lesson-title')?.insertAdjacentHTML('afterend',lessonTools({id:'tutorial',description:t.description},{id,body:programmingLessonById[id].walkthrough},0).replace('data-course="tutorial" data-index="0"','data-tutorial="'+id+'"'));document.querySelectorAll('.mini-lesson > section p,.lesson-opening').forEach(n=>n.classList.add('academy-sentence'));voiceOptions();}}
  if(page==='learn'&&ctx.course(id)?.format!=='storyboard'){
   const c=ctx.course(id),l=c?.lessons[Number(index)||0];if(!l)return;
   document.querySelector('.lesson-top')?.insertAdjacentHTML('afterend',lessonTools(c,l,Number(index)||0));
   const title=document.querySelector('.lesson-paper > h1');if(title){const wrap=document.createElement('div');wrap.className='mini-lesson-title';title.before(wrap);wrap.append(title);const key=lessonKey(c.id,l.id),saved=a().bookmarks.includes(key);wrap.insertAdjacentHTML('beforeend',button('bookmark',ico('bookmark',20)+(saved?L('Saved','已收藏','已收藏'):L('Save','收藏','收藏')),`data-key="${e(key)}" aria-pressed="${saved}"`));}
   document.querySelector('.lesson-actions')?.insertAdjacentHTML('beforebegin',views.related(c.id,Number(index)||0));
   document.querySelectorAll('.lesson-text p,.lesson-text li').forEach(p=>{const texts=p.textContent.match(/[^.!?。！？]+[.!?。！？]*\s*/g)||[p.textContent];p.replaceChildren(...texts.map(t=>{const span=document.createElement('span');span.className='academy-sentence';span.textContent=t;return span;}));});voiceOptions();
  }
 }
 function afterModal(){const f=document.querySelector('#new-course-form');if(f&&!f.querySelector('[value="template"]'))f.querySelector('.form-actions')?.insertAdjacentHTML('beforeend',`<button class="btn secondary" type="submit" name="mode" value="template">${L('Start from a study template','从学习模板开始','從學習範本開始')}</button>`);}
 function localExplanation(c,l){const body=T(l.body),first=body.split(/\n+/).find(x=>x.trim()&&!x.trim().startsWith('#'))||body;return `<p>${e(first)}</p><h3>${L('Make it concrete','用具体例子理解','用具體例子理解')}</h3><p>${e(T(l.checks?l.hint:l.workshop?.brief||l.hint||c.description))}</p><ol><li>${L('Name the input, decision and expected result.','写清输入、决定和预期结果。','寫清輸入、決定和預期結果。')}</li><li>${L('Try the smallest example, then one boundary case.','先试一个最小例子，再试一个边界情况。','先試一個最小例子，再試一個邊界情況。')}</li><li>${L('Explain what the evidence does and does not show.','说明证据能证明什么、不能证明什么。','說明證據能證明甚麼、不能證明甚麼。')}</li></ol><p class="small muted">${L('Study guide assembled from this lesson; not a new AI answer.','根据当前课文整理的学习提示，不是新的 AI 回答。','依目前課文整理的學習提示，不是新的 AI 回答。')}</p>`;}
 function completeLab(id,result){a().labResults[id]={...a().labResults[id],...result,at:new Date().toISOString()};touch('lab',id);}
 /** The Git simulator: one lesson per command and a team project, opened from the sidebar. */
 function gitCoursePage(lessonId){
  const id=/^[a-z-]+$/.test(lessonId||'')?lessonId:'';
  return heading(L('Practice','练习中心','練習中心'))+views.practiceTabs('git')+'<div class="collection-heading"><h2>'+L('Git simulator','Git 模拟练习','Git 模擬練習')+'</h2></div><p>'+L('One lesson for each everyday Git command, typed in a real-looking terminal against a simulated computer and GitHub, then a team project that uses them all.','每条常用 Git 命令一节课：在逼真的终端里对模拟的电脑和 GitHub 输入命令，最后用一个团队项目把它们全部串起来。','每條常用 Git 指令一節課：在逼真的終端裡對模擬的電腦和 GitHub 輸入指令，最後用一個團隊專案把它們全部串起來。')+'</p>'
   +`<div class="git-course-frame"><p class="small muted" style="margin:0 0 10px">${L('Progress is saved in this browser.','学习进度保存在当前浏览器中。','學習進度保存在目前瀏覽器中。')} <a href="git-course.html${id?'#'+id:''}" target="_blank" rel="noopener" style="text-decoration:underline">${L('Open full screen ↗','全屏打开 ↗','全螢幕開啟 ↗')}</a></p><iframe src="git-course.html${id?'#'+id:''}" title="${L('Git simulator','Git 模拟练习','Git 模擬練習')}" style="width:100%;height:calc(100vh - 200px);min-height:620px;border:1px solid var(--line);border-radius:12px;background:#1e1e1e;display:block"></iframe></div>`;
 }
 function previewPlan(data){view.aiPlanSource=false;const draft={...data};data=resolveStudyTime(data,lang());const profile={...s().profile,...data,weeklyMinutes:Number(data.weeklyMinutes)||120};view.preview=buildPlan({courses:ctx.courses(),topic:String(data.topic||'').trim(),profile,id:uid('plan'),courseId:uid('study')});a().planDraft={topic:data.topic,requirements:data.requirements||'',weeklyMinutes:draft.weeklyMinutes,customWeeklyMinutes:draft.customWeeklyMinutes,skillLevel:profile.skillLevel};save();}
 async function aiPlan(data){
  const generationUser=ctx.user?.()?.id;
  const status=document.querySelector('[data-plan-ai-status]'),trigger=document.querySelector('[data-ac="ai-plan"]');
  const topic=String(data.topic||'').trim();
  if(!topic){ctx.toast(L('Enter a topic first.','请先填写学习主题。','請先填寫學習主題。'));return;}
  if(!ctx.aiReady()){ctx.toast(L('AI is not configured. You can still preview a study template.','AI 尚未配置，仍可预览学习模板。','AI 尚未設定，仍可預覽學習範本。'));return;}
  const resolved=resolveStudyTime(data,lang()),profile={...s().profile,...resolved,weeklyMinutes:Number(resolved.weeklyMinutes)||120};
  view.aiPlanData={...data};
  if(trigger)trigger.disabled=true;
  if(status)status.textContent=L('Generating in background…','正在后台生成…','正在背景產生…');
  try{
   const language=contentLang();
   const requirements=[String(data.requirements||'').trim(),`Level: ${resolved.skillLevel||'beginner'}`,`Weekly study time: ${profile.weeklyMinutes} minutes`].filter(Boolean).join('\n');
   const response=await ctx.ai('generate',{topic,requirements,profile});
   if(generationUser!==ctx.user?.()?.id)return;
   const draft=response?.course;
   const raw=Array.isArray(draft?.lessons)?draft.lessons.filter(l=>l&&typeof l.title==='string'&&l.title.trim()&&typeof l.body==='string'&&l.body.trim()).slice(0,8):[];
   if(!raw.length)throw Error('invalid_course');
   const id=uid('study');
   const lessons=raw.map((l,i)=>({id:`${id}-l${i+1}`,title:{[language]:l.title.slice(0,180)},body:{[language]:l.body.slice(0,18000)},...(typeof l.advanced==='string'&&l.advanced.trim()?{advanced:{[language]:l.advanced.slice(0,18000)}}:{}),type:'read',minutes:10}));
   const course={id,title:{[language]:String(draft.title||topic).slice(0,180)},description:{[language]:String(draft.description||'').slice(0,3000)},topic:'foundations',theme:'lavender',duration:lessons.length*10,status:'published',personal:true,origin:'ai',level:profile.skillLevel,audience:['cs','non-cs'],lessons};
   view.preview=buildPlan({courses:ctx.courses(),topic,profile,id:uid('plan'),courseId:id,aiCourse:course});
   view.aiPlanSource=true;
   backgroundAI.linkResult(response,{planPreview:structuredClone(view.preview),resultRoute:'#path'});
   a().planDraft={topic,requirements:data.requirements||'',weeklyMinutes:resolved.weeklyMinutes,customWeeklyMinutes:resolved.customWeeklyMinutes,skillLevel:profile.skillLevel};
   save();if(ctx.route()[0]==='path')render();else ctx.toast(L('Your plan preview is ready. Open Study plan or AI tasks.','学习计划预览已生成，可到学习计划或 AI 任务查看。','學習計畫預覽已產生，可到學習計畫或 AI 任務查看。'));
  }catch{
   if(generationUser!==ctx.user?.()?.id)return;
   view.aiPlanSource=false;
   previewPlan(data);if(ctx.route()[0]==='path')render();
   const next=document.querySelector('[data-plan-ai-status]');
   if(next)next.textContent=L('AI is unavailable right now, so a simple study template is shown instead. Save it, then generate each lesson from the plan.','AI 暂时不可用，已为你生成一份简单学习模板。保存后可逐节生成学习内容。','AI 暫時無法使用，已為你產生一份簡單學習範本。儲存後可逐節產生學習內容。');
  }finally{if(trigger?.isConnected)trigger.disabled=false;}
 }
 async function learnPlanSection(el){
  if(view.generatingSection&&view.generatingSection===ctx.user?.()?.id){ctx.toast(L('A lesson is already generating. You can browse other pages.','已有课件正在后台生成，可以先浏览其他页面。','已有課件正在背景產生，可以先瀏覽其他頁面。'));return;}
  const p=a().plans.find(p=>p.id===el.dataset.plan),step=p?.steps.find(x=>x.lessonId===el.dataset.lesson);
  if(!step)return;
  view.generatingSection=ctx.user?.()?.id||'local';el.disabled=true;
  const original=el.textContent;el.textContent=L('Opening lesson…','正在打开课件…','正在開啟課件…');
  const generationUser=ctx.user?.()?.id,originRoute=ctx.route().join('/');
  try{
   const userId=ctx.user?.()?.id;
   if(!userId)throw Error('login_required');
   let courseId=planCourseFor(userId,p.id),record;
   if(courseId){try{record=(await cloudAPI('/api/teaching?resource=personal-courses&id='+encodeURIComponent(courseId))).course;}catch(error){if(error.message!=='not_found'&&error.message!=='course_not_found')throw error;clearPlanCourse(userId,p.id);courseId=null;p.generatedLessons={};}}
   const source=ctx.course(step.courseId),sourceLesson=source?.lessons.find(l=>l.id===step.lessonId);
   if(!sourceLesson)throw Error('lesson_not_found');
   const unique=[...new Map(p.steps.filter(x=>!x.kind).map(x=>[x.lessonId,x])).values()];
   const sectionIndex=unique.findIndex(x=>x.lessonId===step.lessonId);
   if(sectionIndex<0||sectionIndex>=10)throw Error('lesson_not_found');
   if(!record){
    const course={title:T(p.title).slice(0,180),description:T(p.topic).slice(0,3000),language:contentLang(),lessons:unique.slice(0,10).map((x,i)=>{const l=ctx.course(x.courseId)?.lessons.find(l=>l.id===x.lessonId);return {id:'lesson-'+(i+1),title:T(x.title),body:T(l?.body)||'',scene:'flow',sceneItems:['Start','Learn'],questions:[]};})};
    record=(await cloudAPI('/api/teaching?resource=personal-courses',{action:'save',course})).course;
    courseId=record.id;linkPlanCourse(userId,p.id,courseId);
   }
   const lesson=record.draft.lessons[sectionIndex];
   if(!lesson)throw Error('lesson_not_found');
   if(!hasCompleteCourseware(lesson)){
    const cached=p.pendingCourseware?.[step.lessonId];
    const reuseCandidate=cached?.courseId===courseId&&cached.revision===record.revision;
    if(!reuseCandidate){el.textContent=L('Generating in background…','后台生成中…','背景產生中…');ctx.toast(generationNotice());}
    const result=reuseCandidate?{lesson:cached.lesson}:await cloudAPI('/api/course-ai',{action:'lesson',language:record.draft.language,topic:record.draft.title,requirements:(T(p.topic)+'\n'+T(sourceLesson.body)).slice(0,16000),instruction:L('Create a complete self-study lesson with concrete examples and explained practice questions.','生成完整自主学习课件，包含具体示例和带解析的练习。','產生完整自主學習課件，包含具體範例和附解析的練習。'),courseId,lesson,production:'storyboard-v1'});
    if(generationUser!==ctx.user?.()?.id)return;
    if(!hasCompleteCourseware(result.lesson))throw Error('invalid_ai_result');
    p.pendingCourseware??={};p.pendingCourseware[step.lessonId]={courseId,revision:record.revision,lesson:result.lesson};save();
    const course=structuredClone(record.draft);
    course.lessons[sectionIndex]={...result.lesson,id:lesson.id,questions:(result.lesson.questions||[]).map((q,i)=>({...q,id:lesson.id+'-q-'+(i+1)}))};
    record=(await cloudAPI('/api/teaching?resource=personal-courses',{action:'save',id:courseId,revision:record.revision,course})).course;
   }
   if(p.pendingCourseware)delete p.pendingCourseware[step.lessonId];
   p.generatedLessons??={};p.generatedLessons[step.lessonId]={courseId,index:sectionIndex};backgroundAI.linkCourse(courseId,lesson.id,'#personal-course/'+courseId+'/study-'+sectionIndex);save();
   if(generationUser!==ctx.user?.()?.id)return;
   if(ctx.route().join('/')===originRoute)go('personal-course/'+courseId+'/study-'+sectionIndex);else ctx.toast(L('Lesson saved. Continue from Study plan, or edit it in My custom courses.','课件已保存，可从学习计划继续学习，也可到我的自定义课程修改。','課件已儲存，可從學習計畫繼續學習，也可到我的自訂課程修改。'));
  }catch(error){if(generationUser!==ctx.user?.()?.id)return;ctx.toast(error.message==='login_required'?L('Sign in to save your lessons.','请先登录，以保存生成的课程。','請先登入，以儲存產生的課程。'):L('Lesson preparation failed. Your plan is kept; retry to continue.','课件准备或保存未成功，学习计划和已生成的候选内容已保留，请重试。','課件準備未成功，學習計畫已保留，請重試。'));}
  finally{if(view.generatingSection===generationUser)view.generatingSection=false;if(el.isConnected){el.disabled=false;el.textContent=original;}}
 }
 async function expandPlanLesson(el){
  const generationUser=ctx.user?.()?.id;
  const plan=a().plans.find(x=>x.id===el.dataset.plan),courseId=el.dataset.course,lessonId=el.dataset.lesson,source=ctx.course(courseId),lesson=source?.lessons.find(l=>l.id===lessonId);
  if(!plan||!lesson)return;
  if(!ctx.aiReady()){ctx.toast(L('AI is not configured. Open the course studio to write this lesson yourself.','AI 尚未配置，可进入课程工作室手动补写。','AI 尚未設定，可進入課程工作室手動補寫。'));return;}
  const language=contentLang(),status=document.querySelector('[data-plan-lesson-status]');
  el.disabled=true;
  if(status)status.textContent=L('AI is expanding this lesson…','AI 正在扩充这一节…','AI 正在擴充這一節…');
  try{
   const response=await ctx.ai('expand',{topic:T(plan.topic),title:T(lesson.title),body:T(lesson.body),level:plan.level||s().profile.skillLevel||'beginner',profile:s().profile});
   if(generationUser!==ctx.user?.()?.id)return;
   const body=String(response?.lesson?.body||'').trim();
   if(!body)throw Error('invalid_lesson');
   let course=s().courses.find(c=>c.id===courseId);
   if(!course){course={...source,lessons:source.lessons.map(l=>({...l}))};s().courses.push(course);}
   const target=course.lessons.find(l=>l.id===lessonId)||lesson;
   target.body={...(target.body||{}),[language]:body.slice(0,18000)};
   const advanced=String(response?.lesson?.advanced||'').trim();
   if(advanced)target.advanced={...(target.advanced||{}),[language]:advanced.slice(0,18000)};
   save();if(ctx.route()[0]==='plan'&&ctx.route()[1]===plan.id)render();
  }catch{
   if(status?.isConnected)status.textContent=L('AI could not expand this lesson right now. Try again, or open the course studio to write it yourself.','AI 暂时无法扩充这一节。请稍后重试，或进入课程工作室手动补写。','AI 暫時無法擴充這一節。請稍後重試，或進入課程工作室手動補寫。');
  }finally{if(el.isConnected)el.disabled=false;}
 }
 async function click(action,el){
  if(await quest.click(action,el))return;
  const id=el.dataset.id,route=ctx.route(),page=route[0];
  if(action==='complete-authored-lesson'){if(completeStudyLesson(s(),el.dataset.course,el.dataset.lesson)){save();ctx.toast(L('Lesson completed · +40 XP','本节已完成 · +40 XP','本節已完成 · +40 XP'));}el.textContent=L('✓ Completed','✓ 已完成','✓ 已完成');el.disabled=true;return;}
  if(action==='check-in'){if(recordCheckin(a())){save();ctx.toast(L('Checked in. See you tomorrow!','打卡成功，明天见！','打卡成功，明天見！'));}render();return;}
  if(action==='calendar-month'){view.checkinOffset=Math.max(-120,Math.min(0,(view.checkinOffset||0)+Number(el.dataset.offset||0)));render();return;}
  if(action==='refresh-plan'){const old=a().plans.find(x=>x.id===id);if(old){const updated=buildPlan({courses:ctx.courses(),topic:old.topic,profile:{...s().profile,weeklyMinutes:old.weeklyMinutes,skillLevel:old.level},id:old.id,courseId:uid('study')});if(updated.course)s().courses.push(updated.course);a().plans=a().plans.map(x=>x.id===id?updated.plan:x);save();render();}return;}
  if(action==='save-plan'){savePlan();return;}
  if(action==='learn-plan-section'){await learnPlanSection(el);return;}
  if(action==='expand-plan-lesson'){await expandPlanLesson(el);return;}
  if(action==='ai-plan'){const f=document.querySelector('#academy-plan-form');if(f)await aiPlan(Object.fromEntries(new FormData(f)));return;}
  if(action==='regenerate'){const f=document.querySelector('#academy-plan-form');if(view.aiPlanSource&&view.aiPlanData){await aiPlan(view.aiPlanData);return;}if(f)previewPlan(Object.fromEntries(new FormData(f)));render();return;}
  if(action==='active-plan'){a().activePlan=id;s().path=null;save();render();return;}
  if(action==='delete-plan'){a().plans=a().plans.filter(p=>p.id!==id);if(a().activePlan===id)a().activePlan=a().plans[0]?.id||null;save();render();return;}
  if(action==='create-course'){
   const p=a().plans.find(x=>x.id===id),course=p&&[...new Set([...(p.matchedCourses||[]),...p.steps.map(x=>x.courseId)])].map(x=>ctx.course(x)).find(x=>x?.lessons?.length);
   if(!course){ctx.toast(L('This plan has no lessons to turn into a course.','这个计划没有可制作成课程的课节。','這個計畫沒有可製作成課程的課節。'));return;}
   const userId=ctx.user?.()?.id,linked=planCourseFor(userId,p.id);
   if(linked){
    let missing=false;
    try{const response=await fetch('/api/teaching?resource=personal-courses&id='+encodeURIComponent(linked),{cache:'no-store',credentials:'same-origin'});missing=response.status===404;}catch{/* Open the linked course if the check itself is unavailable. */}
    if(!missing){go('personal-course/'+linked);return;}
    clearPlanCourse(userId,p.id);
   }
   const handed=saveCourseHandoff(ctx.user?.()?.id,{planId:p.id,title:T(course.title),description:T(course.description)||'',language:contentLang(),lessons:course.lessons.map(l=>({title:T(l.title),body:T(l.body)}))});
   if(!handed){ctx.toast(L('The course draft could not be saved on this device.','无法在本机保存课程草稿。','無法在本機儲存課程草稿。'));return;}
   go('personal-course/new');return;
  }
  if(action==='bookmark'){const key=el.dataset.key;if(key.startsWith('course:')&&el.dataset.title&&el.dataset.route?.startsWith('#')){a().courseBookmarkDetails??={};a().courseBookmarkDetails[key]={title:el.dataset.title,route:el.dataset.route};}a().bookmarks=a().bookmarks.includes(key)?a().bookmarks.filter(x=>x!==key):[...a().bookmarks,key];save();renderInPlace();return;}
  if(action==='reopen'||action==='complete-plan'){const cid=el.dataset.course,lid=el.dataset.lesson;s().progress[cid]??=[];if(action==='reopen')s().progress[cid]=s().progress[cid].filter(x=>x!==lid);else if(!s().progress[cid].includes(lid)){s().progress[cid].push(lid);touch('lesson',lessonKey(cid,lid));}save();render();return;}
  if(action==='complete-tutorial'){a().tutorials=a().tutorials.includes(id)?a().tutorials.filter(x=>x!==id):[...a().tutorials,id];touch('tutorial',id);renderInPlace();return;}
  if(action==='check-tutorial'){const lesson=programmingLessonById[id],answer=a().tutorialChecks?.[id];if(!Number.isInteger(answer?.selected)){ctx.toast(L('Choose an answer first.','请先选择答案。','請先選擇答案。'));return;}answer.checked=answer.selected;const q=knowledgeQuestions(ctx.courses()).find(q=>q.key==='tutorial:'+id);saveKnowledgeAttempt(s(),q,answer.checked);touch('checkpoint','tutorial:'+id,{passed:answer.checked===lesson.correct});renderInPlace();return;}
  if(action==='load-tutorial-solution'){const lesson=programmingLessonById[id];a().tutorialCode??={};a().tutorialCode[id]=lesson.solution;document.querySelector('#academy-play-code').value=lesson.solution;document.querySelector('#academy-play-code').scrollIntoView({block:'center',behavior:'instant'});save();return;}
  if(action==='dom-example'){a().playground.sources??={};a().playground.sources.html=domPageExample;a().playground.language='html';a().playground.code=null;save();go('playground/html');return;}
  if(action==='example'){const t=referenceTopics.find(x=>x.id===id);if(t){a().playground.language=t.language;a().playground.sources??={};a().playground.sources[t.language]=runnableExample(t);a().playground.code=null;save();go('playground');}return;}
  if(action==='hint-challenge'){if(view.running)return;const c=practiceChallenges.find(x=>x.id===id);if(c){a().challenges[id]={...a().challenges[id],code:challengeSolutions[c.id]||c.solution};save();render();}return;}
  if(action==='reset-challenge'){const c=practiceChallenges.find(x=>x.id===id);if(c){a().challenges[id]={...a().challenges[id],code:c.starter};save();render();}return;}
  if(action==='stop-challenge'){browserRunner.stop();return;}
  if(action==='run-challenge'){
   if(view.running)return;const c=practiceChallenges.find(x=>x.id===id),editor=document.querySelector('#academy-code'),out=document.querySelector('#academy-code-output');if(!c||!editor)return;
   const code=editor.value,token=++view.runToken,started=Date.now(),stopButton=document.querySelector('[data-ac="stop-challenge"]');let stage=L('Preparing checks…','准备检查…','準備檢查…'),caseNumber=0;
   const display=()=>{if(out.isConnected&&token===view.runToken)out.textContent=stage+'\n'+(caseNumber?L('Test case ','测试用例 ','測試案例 ')+caseNumber+'/'+c.tests.length+' · ':'')+L('Elapsed: ','已等待：','已等待：')+Math.floor((Date.now()-started)/1000)+'s';};
   view.running=true;editor.disabled=true;el.disabled=true;if(stopButton)stopButton.disabled=false;display();const ticker=setInterval(display,1000);
   try{
    const result=c.language?await checkNativeChallenge(browserRunner,c,code,(phase,index)=>{if(phase==='case')caseNumber=index+1;else stage=phase==='running'?L('Running your code…','正在执行代码…','正在執行程式…'):phase==='compiling'?L('Compiling…','正在编译…','正在編譯…'):phase==='cached'?L('Restoring cached runtime…','正在读取已缓存的运行环境…','正在讀取已快取的執行環境…'):L('Loading compiler/runtime. First download may take 1–3 minutes; you can stop this run.','正在加载编译运行环境。首次下载可能需要 1–3 分钟，可随时停止。','正在載入編譯執行環境。首次下載可能需要 1–3 分鐘，可隨時停止。');display();}):await runSandbox(code,{challenge:c});
    if(token!==view.runToken)return;const passed=!result.error&&result.results?.length===c.tests.length&&result.results.every(x=>x.pass);a().challenges[id]={passed:!!passed||!!a().challenges[id]?.passed,code,attempts:(a().challenges[id]?.attempts||0)+1,lastPassed:!!passed};touch('challenge',id,{passed:!!passed});
    if(out.isConnected)out.innerHTML=result.error?`<p class="callout warning">${e(browserErrorText(result.error,lang()))}</p>`:`<ul>${result.results.map((x,i)=>`<li class="${x.pass?'passed':'failed'}">${x.pass?'✓':'✕'} ${e(T(c.tests[i].name))}${x.pass?'':`<pre>${e(x.error?browserErrorText(x.error,lang()):L('Expected','期望','預期')+': '+x.expected+'\n'+L('Received','实际','實際')+': '+x.actual)}</pre>`}</li>`).join('')}</ul>`;
   }catch{if(out.isConnected&&token===view.runToken)out.textContent=L('Unable to run. Your code is kept; please retry.','运行未成功，代码已保留，请重试。','執行未成功，程式碼已保留，請重試。');}
   finally{clearInterval(ticker);if(token===view.runToken)view.running=false;editor.disabled=false;el.disabled=false;if(stopButton)stopButton.disabled=true;}return;
  }
  if(action==='stop-playground'){browserRunner.stop();runAbort?.abort();return;}
  if(action==='run-playground'){
   if(!document.querySelector('#academy-play-code')?.value.trim()){view.output=L('Enter code first, or load an example.','请先输入代码，或加载一个示例。','請先輸入程式碼，或載入一個範例。');document.querySelector('#academy-play-output').textContent=view.output;return;}
   if(view.running)return;const editor=document.querySelector('#academy-play-code'),language=document.querySelector('#academy-play-language').value,code=editor.value,out=document.querySelector('#academy-play-output'),frame=document.querySelector('#academy-html-preview');if(page==='tutorial'){a().tutorialCode??={};a().tutorialCode[route[1]]=code;}else{a().playground.sources??={};a().playground.sources[language]=code;}save();
   if(language==='html'){view.pageCleanup?.();out.textContent=L('Your page is ready below. Edit the code and run again to see changes.','网页已在下方生成；修改左侧代码后重新运行，即可查看变化。','點選預覽中的按鈕，試試網頁互動。');view.pageCleanup=mountInteractivePage(frame,code,{onLog:(text,type)=>{if(out.isConnected)out.textContent+='\n'+(type==='error'?'Error: ':'')+text;},onInteraction:()=>{a().pageExercises??={};a().pageExercises.html={completed:true,at:new Date().toISOString()};touch('page','html');if(out.isConnected)out.textContent+='\n'+L('Observed: a click updated the page.','已观察到：点击后页面内容发生变化。','已觀察到：點選後頁面內容發生變化。');}});return;}
   const token=++view.runToken,started=performance.now(),stopButton=document.querySelector('[data-ac="stop-playground"]');view.running=true;el.disabled=true;editor.disabled=true;runAbort=new AbortController();if(stopButton)stopButton.disabled=false;
   let phase=L('Running…','正在运行…','正在執行…'),result;const display=()=>{if(out.isConnected)out.textContent=phase+' '+((performance.now()-started)/1000).toFixed(1)+'s';};display();const clock=setInterval(display,200);
   try{
    if(language==='javascript')result=await runSandbox(code,{signal:runAbort.signal});
    else if(document.querySelector('#academy-execution-mode')?.value==='remote')result=await runNativeProgram(language,code,document.querySelector('#academy-play-stdin')?.value||'',lang(),fetch,runAbort.signal);
    else result=await browserRunner.run(language,code,document.querySelector('#academy-play-stdin')?.value||'',{onProgress:p=>{phase=p==='running'?L('Running locally…','正在本地执行…','正在本機執行…'):p==='cached'?L('Restoring runtime from this browser’s cache…','正在从本机缓存恢复运行环境…','正在從本機快取還原執行環境…'):p==='compiling'?L('Compiling new code…','正在编译新代码…','正在編譯新程式碼…'):L('Loading / compiling; first load can take longer…','加载环境 / 编译中，首次下载较慢，请稍候…','載入環境 / 編譯中，首次下載較慢，請稍候…');display();}});
   }catch{result={error:L('Execution failed. You can choose remote backup.','运行失败，可手动选择远程备用。','執行失敗，可手動選擇遠端備用。')};}finally{clearInterval(clock);}
   if(result.error)result.error=browserErrorText(result.error,lang());
   if(token!==view.runToken)return;if(!result.error&&page==='playground'){a().pageExercises??={};a().pageExercises[language]={completed:true,at:new Date().toISOString()};touch('page',language);}view.output=([...(result.logs||[]),...(result.error?[result.error]:[])].join('\n')||L('Finished with no output.','运行结束，无输出。','執行結束，沒有輸出。'))+(result.cacheHits?'\n\n'+L('Runtime assets: restored from browser cache','运行环境资源：已从本机缓存读取','執行環境資源：已從本機快取讀取'):'')+'\n\n'+L('Total time: ','总耗时：','總耗時：')+((performance.now()-started)/1000).toFixed(2)+'s';out.textContent=view.output;view.running=false;el.disabled=false;editor.disabled=false;if(stopButton)stopButton.disabled=true;return;
  }
  if(action==='reset-playground'){a().playground.sources??={};a().playground.sources[a().playground.language]=playgroundDefaults[a().playground.language];a().playground.code=null;view.output='';view.outputFailed=false;save();render();return;}
  if(action==='clear-output'){view.pageCleanup?.();view.pageCleanup=null;view.output='';view.outputFailed=false;document.querySelector('#academy-play-output').classList.remove('failed');document.querySelector('#academy-play-output').textContent='';document.querySelector('#academy-html-preview').srcdoc='';return;}
  if(action==='setup-back'){view.setupDraft={...view.setupDraft,...Object.fromEntries(new FormData(document.querySelector('#academy-setup-form')))};view.setupStep=Math.max(0,view.setupStep-1);render();return;}
  if(action==='interview-back'){view.questionReview=null;view.question=Math.max(0,view.question-1);render();return;}
  if(action==='interview-retry'){const attempt=a().interviews.find(x=>x.id===view.loadedAttempt);if(attempt){a().interviewDrafts??={};a().interviewDrafts[attempt.scenarioId]=[...attempt.answers];save();}view.feedback=null;view.questionReview=null;view.question=0;view.loadedAttempt=null;if(ctx.route()[2])go('interview/'+view.interviewId);else render();return;}
  if(action==='interview-next'){if(!view.questionReview)return;const scenario=interviews.find(x=>x.id===view.interviewId),answers=a().interviewDrafts?.[scenario.id]||[];if(view.question+1<scenario.questions.length){view.question++;view.questionReview=null;}else{view.feedback=reviewInterview(scenario,answers,contentLang());const coverage=Math.round(view.feedback.reduce((n,x)=>n+x.dimensions.filter(Boolean).length,0)/view.feedback.reduce((n,x)=>n+x.dimensions.length,0)*100);a().interviews.push({id:uid('attempt'),scenarioId:scenario.id,answers:[...answers],coverage,reviewVersion:3,at:new Date().toISOString()});touch('interview',scenario.id);view.questionReview=null;}save();render();return;}
  if(action==='check-knowledge'){const q=knowledgeQuestions(ctx.courses()).find(x=>x.key===id),choice=Number(document.querySelector('[name="knowledge-answer"]:checked')?.value);if(!q||!Number.isInteger(choice)){ctx.toast(L('Choose an answer first.','请先选择答案。','請先選擇答案。'));return;}const passed=saveKnowledgeAttempt(s(),q,choice);touch('checkpoint',q.key,{passed});renderInPlace();return;}
  if(action==='interview-coach'){
   const scenario=interviews.find(x=>x.id===view.interviewId),answers=a().interviewDrafts?.[scenario.id]||[],out=document.querySelector('#academy-coach');const fallback=L('Choose one answer. Add the specific input, the decision you made, an observable check and one remaining limitation. Revise only claims you can support.','选一个回答，补充具体输入、自己的决定、可观察的检查和一个局限。只修改能提供依据的陈述。','選一個回答，補充具體輸入、自己的決定、可觀察的檢查和一個侷限。只修改能提供依據的陳述。');out.textContent=fallback;
   if(ctx.aiReady()){el.disabled=true;try{const r=await ctx.ai('tutor',{profile:s().profile,context:scenario.questions.map(T).join('\n'),messages:[{role:'user',content:answers.join('\n\n')+'\nGive specific constructive feedback. Do not invent facts or assign a hiring score.'}]});if(out.isConnected)out.textContent=r.content;}catch{if(out.isConnected)out.textContent=L('Live AI unavailable. Review guide: ','实时 AI 暂不可用，以下为复盘提示：','即時 AI 暫時無法使用，以下為回顧提示：')+fallback;}finally{el.disabled=false;}}return;
  }
  if(action==='explain'){const tutorial=referenceTopics.find(x=>x.id===el.dataset.tutorial),lesson=tutorial&&programmingLessonById[tutorial.id],c=tutorial?{description:tutorial.description}:ctx.course(el.dataset.course),l=tutorial?{body:lesson.walkthrough,hint:lesson.answer}:c?.lessons[Number(el.dataset.index)];if(c&&l)ctx.openModal(L('In plain language','换个方式理解','換個方式理解'),`<div id="academy-explanation">${localExplanation(c,l)}</div>`);return;}
  if(action==='ai-explain'){const c=ctx.course(el.dataset.course),l=c?.lessons[Number(el.dataset.index)],out=document.querySelector('#academy-explanation');if(!ctx.aiReady()){ctx.toast(L('Live AI is not configured. The lesson-based guide remains available.','实时 AI 尚未配置，可使用上面的课文提示。','即時 AI 尚未設定，可使用上方課文提示。'));return;}el.disabled=true;try{const r=await ctx.ai('tutor',{profile:s().profile,context:T(l.body),messages:[{role:'user',content:L('Explain this lesson simply, using one concrete example.','用一个具体例子通俗解释这节课。','用一個具體例子淺白解釋這節課。')}]});if(out.isConnected)out.textContent=r.content;}catch{if(out.isConnected)out.innerHTML=localExplanation(c,l);ctx.toast(L('AI unavailable; showing the study guide.','AI 暂不可用，保留学习提示。','AI 暫時無法使用，保留學習提示。'));}finally{el.disabled=false;}return;}
  if(action==='read-lesson'){if(speech.running)stopSpeech();else if('speechSynthesis' in window){window.speechSynthesis.cancel();speech.sentences=[...document.querySelectorAll('.academy-sentence')];speech.index=0;speech.running=true;speakNext();}updateSpeechButtons();return;}
  if(action==='pause-reading'){if(!speech.running)return;speech.paused=!speech.paused;if(speech.paused)speechSynthesis.pause();else speechSynthesis.resume();updateSpeechButtons();return;}
  if(action==='export-progress'){ctx.download('forma-learning-record.json',JSON.stringify({exportedAt:new Date().toISOString(),profile:s().profile,progress:s().progress,academy:a()},null,2),'application/json');return;}
  if(action==='reset-progress'){ctx.openModal(L('Reset learning progress?','重置学习记录？','重設學習紀錄？'),`<p>${L('This clears lesson completion, drafts, notes, code, practice history and rewards on this device. Your profile, courses, classrooms and saved plans are kept. You can undo this reset until you reload the page.','将清除本机课节完成、作业草稿、笔记、代码、练习历史和奖励。档案、课程、教学班和已保存计划保留；刷新页面前可以撤销。','將清除本機課節完成、作業草稿、筆記、程式、練習歷史和獎勵。檔案、課程、教學班和已儲存計畫保留；重新載入前可以復原。')}</p><div class="row mt">${button('confirm-reset',L('Reset learning records','确认重置学习记录','確認重設學習紀錄'),' ',false)}${button('export-progress',L('Download a record first','先下载记录','先下載紀錄'))}</div>`);return;}
  if(action==='confirm-reset'){lastReset=structuredClone(Object.fromEntries(['progress','notes','code','work','checks','events','game','academy'].map(k=>[k,s()[k]])));const plans=a().plans,active=a().activePlan;s().progress={};s().notes={};s().code={};s().work={};s().checks={};s().events=[];s().game={selected:[],result:null};delete s().academy;ensureAcademy(s());a().plans=plans;a().activePlan=active;save();ctx.closeModal();go('records/history');render();return;}
  if(action==='undo-reset'){if(lastReset){Object.assign(s(),lastReset);lastReset=null;save();render();}return;}
  if(action==='reset-lab'){delete a().labStates?.[id];save();render();return;}
  const lab=route[1];if(page!=='lab')return;
  const z=labState(lab);
  if(action==='prompt-check'){z.text=document.querySelector('#prompt-text').value;z.result=promptReview(z.text);if(z.result.every(Boolean))completeLab('prompt',{completed:true});save();render();return;}
  if(action==='prompt-rewrite'){z.previousText=z.text;z.text=rewritePrompt(z.text,z.preset,contentLang());z.result=null;save();render();return;}
  if(action==='prompt-undo'){z.text=z.previousText;delete z.previousText;z.result=null;save();render();return;}
  if(action==='rag-search'){z.query=document.querySelector('#rag-query').value;z.k=Number(document.querySelector('#rag-k').value);z.hybrid=document.querySelector('#rag-hybrid').checked;z.result=retrieve(z.query,retrievalDocs,z.k,z.hybrid);if(z.result.length)completeLab('rag',{completed:true});save();render();return;}
  if(action==='ci-run'){z.result=pipelineResult(z.fixes);if(z.result.every(x=>x.status==='passed'))completeLab('ci',{completed:true});save();render();return;}
  if(action==='ci-fix'){const result=diagnosePipeline(z.fixes,el.dataset.fix);z.fixes=result.fixes;z.correct=result.correct;z.message=result.correct?L('The cause was repaired. Inspect the next stage.','原因已修复，继续检查下一阶段。','原因已修復，繼續檢查下一階段。'):el.dataset.fix==='rerun'?L('The same code produces the same failure. Read the first failing log.','同一代码仍会失败，请读首个失败日志。','同一程式仍會失敗，請讀首個失敗日誌。'):el.dataset.fix==='expectation'?L('Changing the expected answer hides the defect. Keep the contract and repair the function.','改测试答案会掩盖缺陷，应保留约定并修函数。','改測試答案會掩蓋缺陷，應保留約定並修函式。'):L('That change does not repair the first failing cause.','这个修改没有解决首个失败原因。','這個修改沒有解決首個失敗原因。');z.result=pipelineResult(z.fixes);if(z.result.every(x=>x.status==='passed')){z.message=L('All five stages passed. Inspect the simulated deployment smoke check.','五个阶段已通过，请检查模拟部署的冒烟测试。','五個階段已通過，請檢查模擬部署的冒煙測試。');completeLab('ci',{completed:true});}save();render();return;}
  if(action==='docker-command'){a().labStates.docker=dockerStep(z,el.dataset.command);if(a().labStates.docker.status==='stopped')completeLab('docker',{completed:true});save();render();return;}
  if(action==='gradient-step'){if(z.diverged)return;z.rate=Number(document.querySelector('#gradient-rate').value);a().labStates.gradient=gradientStep(z,Number(el.dataset.count));if(a().labStates.gradient.loss<1)completeLab('gradient',{completed:true});save();render();return;}
 }
 document.addEventListener('click',event=>{const el=event.target.closest('[data-ac]');if(!el)return;event.preventDefault();Promise.resolve(click(el.dataset.ac,el)).catch(error=>{ctx.toast(error.message||L('Could not finish this action.','操作未能完成。','操作未能完成。'));});});
 document.addEventListener('input',event=>{
  const el=event.target;
  if(el.id==='course-search'&&ctx.route()[0]==='explore')catalogResults();
  if(el.id==='academy-reference-search')document.querySelector('#academy-reference-results').innerHTML=ctx.route()[0]==='reference'?referenceResults():views.programmingResults();
  quest.input(el);
  if(el.id==='academy-code'){a().challenges[el.dataset.acCode]={...a().challenges[el.dataset.acCode],code:el.value};save();}
  if(el.id==='academy-play-code'){if(ctx.route()[0]==='tutorial'){a().tutorialCode??={};a().tutorialCode[ctx.route()[1]]=el.value;}else{const p=a().playground;p.sources??={};p.sources[p.language]=el.value;}save();}
  if(el.id==='academy-play-stdin'){a().playground.stdin=el.value;save();}
  if(el.id==='academy-interview-answer'){view.questionReview=null;document.querySelector('.interview-question-review')?.remove();document.querySelector('[data-ac="interview-next"]')?.remove();a().interviewDrafts??={};a().interviewDrafts[el.dataset.scenario]??=[];a().interviewDrafts[el.dataset.scenario][Number(el.dataset.question)]=el.value;const review=evaluateInterview([el.value],[''])[0];const out=document.querySelector('#academy-interview-feedback');if(out)out.textContent=[L('Answer draft','回答草稿','回答草稿'),L('Example or check','例子或检查','例子或檢查'),L('Decision and alternative','决定与备选方案','決定與備選方案'),L('Limitation or next step','局限或下一步','侷限或下一步')].map((label,i)=>(review.signals[i]?'✓ ':'○ ')+label).join(' · ');save();}
  if(el.id==='academy-tutorial-note'){a().tutorialNotes??={};a().tutorialNotes[el.dataset.tutorial]=el.value;save();}
  if(el.id==='prompt-text'){const z=labState('prompt');z.text=el.value;z.result=null;document.querySelector('.lab-analysis')?.remove();save();}
  if(el.closest('#academy-plan-form')){a().planDraft=Object.fromEntries(new FormData(el.closest('form')));save();}
 });
 document.addEventListener('change',event=>{
  const el=event.target;
  if(el.matches('[data-study-time]')){
   const custom=el.value==='custom',box=el.closest('.study-time-field').querySelector('[data-custom-time]'),input=box.querySelector('input');
   box.hidden=!custom;input.disabled=!custom;input.required=custom;
   if(custom)input.focus();
   if(el.closest('#academy-plan-form')){a().planDraft=Object.fromEntries(new FormData(el.closest('form')));save();}
  }
  if(['topic-filter','academy-level','academy-audience'].includes(el.id))catalogResults();
  if(el.id==='academy-reference-language')document.querySelector('#academy-reference-results').innerHTML=ctx.route()[0]==='reference'?referenceResults():views.programmingResults();
  if(el.id==='gradient-data'){a().labStates.gradient={m:0,b:0,rate:labState('gradient').rate,history:[],steps:0,loss:33,dataset:el.value};save();render();}
  if(el.id==='prompt-preset'){const z=labState('prompt');z.preset=el.value;z.result=null;save();render();}
  if(el.id==='knowledge-group'){const q=knowledgeQuestions(ctx.courses()).find(x=>el.value==='all'||x.group===el.value);if(q)go('practice/checks/'+q.key);}
  if(el.id==='knowledge-question')go('practice/checks/'+el.value);
  if(el.id==='academy-interview-scenario'){go('interview/'+el.value);}
  if(el.id==='academy-play-language'){a().playground.language=el.value;a().playground.code=null;view.output='';save();if(ctx.route()[0]==='playground')go('playground/'+el.value);else render();}
  if(el.id==='academy-template'&&el.value){const t=referenceTopics.find(x=>x.id===el.value);if(t){a().playground.sources??={};a().playground.sources[t.language]=runnableExample(t);view.output='';save();render();}}
  if(el.id==='academy-rate'||el.id==='academy-voice'){a().narration.rate=Number(document.querySelector('#academy-rate').value);a().narration.voice=document.querySelector('#academy-voice').value;stopSpeech();updateSpeechButtons();save();}
  if(el.id==='academy-edit-level'&&ctx.editor()){ctx.editor().level=el.value;}
  if(el.name==='knowledge-answer')document.querySelector('.knowledge-card .mini-feedback')?.remove();
  if(el.name==='tutorial-answer'){a().tutorialChecks??={};a().tutorialChecks[el.dataset.topic]={selected:Number(el.value)};el.closest('.mini-check')?.querySelector('.mini-feedback')?.remove();save();}
  if(el.id==='academy-edit-audience'&&ctx.editor()){ctx.editor().audience=el.value==='all'?['cs','non-cs']:[el.value];}
 });
 document.addEventListener('keydown',event=>quest.key(event));
 document.addEventListener('keydown',event=>{const el=event.target;if(event.key==='Tab'&&el.matches('textarea.code-editor')){event.preventDefault();const start=el.selectionStart,end=el.selectionEnd;el.value=el.value.slice(0,start)+'  '+el.value.slice(end);el.selectionStart=el.selectionEnd=start+2;el.dispatchEvent(new Event('input',{bubbles:true}));}});
 document.addEventListener('submit',event=>{
  const f=event.target;if(!['academy-plan-form','academy-setup-form','academy-interview-form','academy-docker-form'].includes(f.id))return;event.preventDefault();
  try{
   if(f.id==='academy-plan-form'){previewPlan(Object.fromEntries(new FormData(f)));render();}
   if(f.id==='academy-setup-form'){const d=Object.fromEntries(new FormData(f));view.setupDraft={...view.setupDraft,...d};if(view.setupStep===1)view.setupDraft.interests=new FormData(f).getAll('interests');if(view.setupStep<2){view.setupStep++;render();}else{previewPlan(view.setupDraft);view.setupStep=0;go('path');}}
   if(f.id==='academy-interview-form'){const scenario=interviews.find(x=>x.id===view.interviewId);a().interviewDrafts??={};a().interviewDrafts[scenario.id]??=[];a().interviewDrafts[scenario.id][view.question]=document.querySelector('#academy-interview-answer').value;view.questionReview=reviewInterview(scenario,a().interviewDrafts[scenario.id],contentLang())[view.question];save();render();}
   if(f.id==='academy-docker-form'){a().labStates.docker=dockerStep(labState('docker'),document.querySelector('#docker-command').value);if(a().labStates.docker.status==='stopped')completeLab('docker',{completed:true});save();render();}
  }catch(error){ctx.toast(error.message);}
 });
 if('speechSynthesis' in window)window.speechSynthesis.addEventListener('voiceschanged',voiceOptions);
 ensureAcademy(s());
 return {
  label:key=>key==='mock-interview'||key==='practice/interviews'?L('AI mock interview','AI 模拟面试','AI 模擬面試'):key==='profile'?L(s().role==='learner'?'Learning profile':'Personal settings',s().role==='learner'?'学习档案':'个人设置',s().role==='learner'?'學習檔案':'個人設定'):labels[key]?local(labels[key],lang()):null,
  page:(page,id,index)=>{const playground=()=>heading(L('Practice','练习中心','練習中心'))+views.practiceTabs('playground')+views.practiceSections('playground')+playgroundPage().replace(/<div class="page-heading">[\s\S]*?<\/div>/,'');return ({'mock-interview':voiceInterview.page,learning:views.home,games:()=>quest.page(),explore:()=>id==='programming'?views.programming(index||'all'):null,path:pathsPage,plan:()=>planDetail(id,index),setup:setupPage,records:()=>views.records(id),practice:()=>id==='git'?gitCoursePage(index):id==='playground'?playground():views.practice(id,index),challenge:()=>challengePage(id),git:()=>gitCoursePage(id),playground,reference:()=>heading(L('Syntax reference','语法速查','語法速查'))+views.courseTabs('programming')+referencePage().replace(/<div class="page-heading">[\s\S]*?<\/div>/,''),tutorial:()=>views.tutorial(id),next:()=>views.complete(id,index),interview:()=>interviewPage(id,index),lab:()=>labPage(id),codequest:()=>quest.page(id,index)})[page]?.()??null;},
  afterRender,afterModal,activePlan,template:buildTemplate,
  beforeRender(){browserRunner.cancelActive();runAbort?.abort();voiceInterview.cleanup();view.pageCleanup?.();view.pageCleanup=null;stopSpeech();view.runToken++;view.running=false;},
  recordEvent(type,cid,detail){const key=lessonKey(cid,detail.lessonId||ctx.course(cid)?.lessons[Number(ctx.route()[2])||0]?.id||'');if(type==='checkpoint'){const prior=a().quizzes[key]||{};a().quizzes[key]={...prior,correct:!!prior.correct||!!detail.passed,lastCorrect:!!detail.passed,selected:s().checks?.[key]?.checked,attempts:(prior.attempts||0)+1,at:new Date().toISOString()};}if(type==='code'){const prior=a().challenges['course/'+key]||{};a().challenges['course/'+key]={...prior,passed:!!prior.passed||!!detail.passed,attempts:(prior.attempts||0)+1};}if(['lesson','checkpoint','code','game','scope-lab','access-lab'].includes(type)){recordActivity(s(),type,key,{passed:detail.passed});save();}},
 };
 function buildTemplate(topic,id){return buildPlan({courses:[],topic,profile:{skillLevel:'advanced',weeklyMinutes:120},id:uid('preview'),courseId:id}).course;}
}
