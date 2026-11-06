import {hasCompleteCourseware} from './courseware-contract.js';
// Application-owned work outlives the page that started it. Provider credentials
// remain on the server; only results and resumable UI metadata are stored here.
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createBackgroundAI({storage,notify=()=>{},now=Date.now}={}){
 let owner=null,tasks=[],requestedId=null,epoch=0,active=0;const running=new Map(),queue=[];
 const persist=()=>{if(!owner)return;try{storage?.setItem('forma.ai-tasks.v1.'+owner,JSON.stringify(tasks.slice(-40)));}catch{/* Results remain available in memory when local storage is full. */}};
 const changed=()=>{persist();notify();};
 const pump=()=>{while(active<2&&queue.length){const entry=queue.shift();if(entry.epoch!==epoch){entry.reject(Error('account_changed'));continue;}active++;entry.task.status='running';changed();Promise.resolve().then(()=>entry.work(progress=>{entry.task.progress=progress;if(entry.epoch===epoch)changed();})).then(result=>{if(entry.epoch!==epoch)throw Error('account_changed');entry.task.result=result;entry.task.status='completed';entry.task.finishedAt=now();changed();entry.resolve(result);}).catch(error=>{if(entry.epoch===epoch){entry.task.status='failed';entry.task.error=error.message||'generation_failed';changed();}entry.reject(error);}).finally(()=>{active--;running.delete(entry.key);pump();});}};
 return {
  account(id){if(owner===id)return;owner=id;epoch++;tasks=[];requestedId=null;if(owner)try{const saved=JSON.parse(storage?.getItem('forma.ai-tasks.v1.'+owner)||'[]');if(Array.isArray(saved))tasks=saved.filter(t=>t&&typeof t.id==='string').slice(-40).map(t=>['running','queued'].includes(t.status)?{...t,status:'interrupted'}:t);}catch{/* Keep an empty list if the device record is unreadable. */}changed();},
  list:()=>tasks,
  owns:id=>!!owner&&id===owner,
  active:()=>tasks.some(t=>['running','queued'].includes(t.status)),
  start(meta,work){if(!owner)return Promise.reject(Error('login_required'));const key=owner+':'+meta.key;if(running.has(key))return running.get(key);const task={id:crypto.randomUUID(),...meta,status:'queued',createdAt:now()};tasks.push(task);const promise=new Promise((resolve,reject)=>queue.push({task,work,resolve,reject,key,epoch}));running.set(key,promise);changed();pump();return promise;},
  clearFinished(){const finished=tasks.filter(t=>['completed','failed','interrupted'].includes(t.status));if(!finished.length)return 0;tasks=tasks.filter(t=>!finished.includes(t));if(!tasks.some(t=>t.id===requestedId))requestedId=null;changed();return finished.length;},
  requestOpen(id){requestedId=tasks.some(t=>t.id===id)?id:null;},
  requested(kind){return tasks.find(t=>t.id===requestedId&&(!kind||t.kind===kind));},
  clearRequest(){requestedId=null;},
  linkResult(result,meta){const task=tasks.find(t=>t.result===result);if(task){Object.assign(task,meta);changed();}},
  linkPlan(planId,route){for(const task of tasks)if(task.planPreview?.plan?.id===planId){task.resultRoute=route;changed();}},
  linkCourse(courseId,lessonId,route){for(const task of tasks)if(task.kind==='courseware'&&task.courseId===courseId&&task.lessonId===lessonId&&task.status==='completed'){task.resultRoute=route;task.used=true;}changed();},
  candidate(courseId,route){const requested=tasks.find(t=>t.id===requestedId&&t.kind==='courseware'&&t.courseId===courseId&&t.status==='completed');if(requested&&!requested.used)return requested;const task=[...tasks].reverse().find(t=>t.status==='completed'&&t.courseId===courseId&&t.route===route&&t.kind==='courseware');return task?.used?undefined:task;},
  used(id){const t=tasks.find(t=>t.id===id);if(t){t.used=true;changed();}},
 };
}
let locale='zh-CN',myCourses='#personal-courses',host,panelOpen=false;
const L=(en,cn,tw=cn)=>locale==='en'?en:locale==='zh-TW'?tw:cn;
export const backgroundAI=createBackgroundAI({storage:typeof localStorage==='undefined'?undefined:localStorage,notify:()=>paint()});
export function configureBackgroundAI(userId,language,role){myCourses=role==='instructor'?'#courses':'#personal-courses';locale=language||'zh-CN';backgroundAI.account(userId||null);paint();}
const statusText=status=>({queued:L('Queued','等待生成','等待產生'),running:L('Generating in background','后台生成中','背景產生中'),completed:L('Ready','已生成','已產生'),failed:L('Failed; draft retained','失败，草稿已保留','失敗，草稿已保留'),interrupted:L('Interrupted by reload; retry from the original page','刷新或关闭已中断，请返回原页重试','重新載入或關閉已中斷，請返回原頁重試')}[status]||status);
export const taskFailureText=code=>({provider_busy:L('The AI model is busy; this does not mean your balance is empty.','AI 模型当前繁忙，不代表资源包余额用完。'),provider_quota_exhausted:L('This model has no available quota. Check its applicable resource pack.','当前模型可用额度不足，请核对资源包适用模型。'),provider_timeout:L('AI service timed out. Retry later.','AI 服务超时，请稍后重试。'),provider_rate_limited:L('AI quota or request limit reached.','AI 调用频率受限，请稍后重试。'),provider_auth_failed:L('AI service key is invalid; the project owner needs to update it.','AI 服务密钥无效，需要项目负责人更新配置。'),provider_unavailable:L('AI services are temporarily unavailable.','AI 服务暂不可用，请稍后重试。'),invalid_teaching_plan:L('AI could not finish the lesson plan.','AI 未能完成课件的教学设计。'),invalid_ai_result:L('AI returned incomplete courseware.','AI 返回的课件格式不完整。'),quality_review_failed:L('Courseware did not pass content review.','课件未通过内容复核。'),ai_not_configured:L('No AI service is configured.','尚未配置可用的 AI 服务。')}[code]||L('Generation failed. Return to the original page to retry.','生成未完成，请返回原页重试。'));
export const generationNotice=()=>L('Generation may take about 5 minutes. You can browse other pages in this site; keep this browser tab open. Reloading or closing it interrupts unfinished work. Results stay in AI tasks. Edit your course in My custom courses.','生成可能需要约 5 分钟。可以切换站内页面，请保持此浏览器标签页打开；刷新或关闭会中断未完成任务。结果保留在「AI 任务」，课程可到「我的自定义课程」自行修改。','產生可能需要約 5 分鐘。可以切換站內頁面，請保持此瀏覽器分頁開啟；重新載入或關閉會中斷未完成任務。結果保留在「AI 任務」，課程可到「我的自訂課程」自行修改。');
function resultHTML(result){
 if(!result)return '';
 const block=(title,body)=>`<section><h3>${escape(title)}</h3><p style="white-space:pre-wrap">${escape(body)}</p></section>`;
 if(result.course)return block(result.course.title,result.course.description)+(result.course.lessons||[]).map(l=>block(l.title,l.body)).join('');
 if(result.lesson){const l=result.lesson;return block(l.title||L('Lesson','课节','課節'),l.body||'')+(l.slides||[]).map(s=>block(s.heading,(s.script||s.bullets||[]).join('\n'))).join('');}
 if(result.content)return block(L('AI result','AI 生成结果','AI 產生結果'),result.content);
 if(result.review){const r=result.review;return Object.entries(r).map(([k,v])=>block(k,typeof v==='string'?v:JSON.stringify(v,null,2))).join('');}
 return block(L('Saved result','已保存结果','已儲存結果'),result.message||JSON.stringify(result,null,2));
}
const safeRoute=route=>typeof route==='string'&&route.startsWith('#')?route:null;
export function taskInput(task){try{return task.input||JSON.parse(task.key.slice(task.key.indexOf(':{')+1));}catch{return {};}}
export async function taskDestination(task,{request=fetch}={}){
 if(safeRoute(task.resultRoute))return task.resultRoute;
 if(task.kind==='plan')return '#path';
 if(task.kind==='courseware'&&task.courseId){
  const teacher=task.route?.startsWith('#teacher-course/'),base=teacher?'#teacher-course/':'#personal-course/';
  if(task.route?.startsWith('#plan/')){
   try{const response=await request('/api/teaching?resource=personal-courses&id='+encodeURIComponent(task.courseId),{credentials:'same-origin',cache:'no-store'});if(response.ok){const data=await response.json(),index=data.course?.draft?.lessons?.findIndex(l=>l.id===task.lessonId);if(index>=0&&hasCompleteCourseware(data.course.draft.lessons[index]))return base+encodeURIComponent(task.courseId)+'/study-'+index;}}catch{/* The course editor can recover the stored candidate when lookup is unavailable. */}
  }
  return base+encodeURIComponent(task.courseId);
 }
 if(task.kind==='narration'||task.kind==='expand')return safeRoute(task.route)||myCourses;
 return '#ai-result/'+encodeURIComponent(task.id);
}
async function openResult(id){
 const task=backgroundAI.list().find(t=>t.id===id&&t.status==='completed');if(!task)return;
 const destination=await taskDestination(task);if(!backgroundAI.list().includes(task))return;
 backgroundAI.requestOpen(id);panelOpen=false;paint();
 if(location.hash===destination)window.dispatchEvent(new HashChangeEvent('hashchange'));else location.hash=destination;
}
export function backgroundResultHTML(id){
 const task=backgroundAI.list().find(t=>t.id===id);if(!task)return `<h1>${L('Result not found','未找到生成结果','找不到產生結果')}</h1>`;
 return `<div class="page-heading"><h1>${escape(task.title)}</h1></div><div class="row mb">${safeRoute(task.route)?`<a class="btn secondary" href="${escape(task.route)}">${L('Back to activity','返回相关页面','返回相關頁面')}</a>`:''}<a class="btn secondary" href="${myCourses}">${L('My custom courses','我的自定义课程','我的自訂課程')}</a></div><article class="panel">${resultHTML(task.result)}</article>`;
}
export function refreshBackgroundAI(){paint();}
function paint(){
 if(typeof document==='undefined'||!document.body)return;
 const tasks=backgroundAI.list();if(!tasks.length){host?.remove();host=null;return;}
 const sidebar=document.querySelector('.sidebar-bottom');
 const target=document.querySelector('.dl-player:not(.dl-embedded) .dl-appbar')||(sidebar&&window.innerWidth>700?sidebar:null)||document.querySelector('.top-tools')||document.body;
 if(!host){host=document.createElement('aside');host.className='ai-task-center';host.setAttribute('aria-label',L('AI tasks','AI 任务','AI 任務'));host.addEventListener('click',event=>{const button=event.target.closest('[data-ai-task]');if(!button)return;if(button.dataset.aiTask==='toggle'){panelOpen=!panelOpen;paint();}if(button.dataset.aiTask==='result')void openResult(button.dataset.id);if(button.dataset.aiTask==='clear'){const unused=backgroundAI.list().filter(t=>t.status==='completed'&&t.kind==='courseware'&&t.courseId&&!t.used).length;if(!unused||confirm(L(`Clear finished tasks? ${unused} generated courseware result${unused>1?'s':''} not yet added to a course will be discarded.`,`清理已结束的任务？其中 ${unused} 个已生成但尚未加入课程的课件将无法恢复。`,`清理已結束的任務？其中 ${unused} 個已產生但尚未加入課程的課件將無法復原。`)))backgroundAI.clearFinished();}});}
 if(host.parentElement!==target)target.prepend(host);host.classList.toggle('is-floating',target===document.body);
 const pending=tasks.filter(t=>['running','queued'].includes(t.status)).length;
 const finished=tasks.filter(t=>['completed','failed','interrupted'].includes(t.status)).length;
 host.innerHTML=`<button class="btn" data-ai-task="toggle" aria-expanded="${panelOpen}">${L('AI tasks','AI 任务','AI 任務')} · ${pending||tasks.filter(t=>t.status==='completed').length}</button>${panelOpen?`<section class="ai-task-panel" aria-label="${L('Generation progress and results','生成进度与结果','產生進度與結果')}"><div class="row between"><h2>${L('AI tasks','AI 任务','AI 任務')}</h2><div class="row">${finished?`<button class="btn secondary" data-ai-task="clear">${L('Clear finished','清理已结束','清理已結束')}</button>`:''}<button class="btn secondary" data-ai-task="toggle">${L('Close','收起','收起')}</button></div></div><p class="small muted">${generationNotice()}</p>${[...tasks].reverse().map(t=>`<article class="ai-task-row"><strong>${escape(t.title)}</strong><p role="status">${escape(statusText(t.status))}${t.progress?' · '+escape(t.progress):''}</p>${t.status==='failed'?`<p class="small muted">${escape(taskFailureText(t.error))}</p>`:''}<div class="row">${t.status==='completed'?`<button class="btn secondary" data-ai-task="result" data-id="${escape(t.id)}">${L('View result','查看结果','查看結果')}</button>`:safeRoute(t.route)?`<a class="btn secondary" href="${escape(t.route)}">${L('Return to page','返回原页','返回原頁')}</a>`:''}</div></article>`).join('')}<p class="mt"><a href="${myCourses}">${L('My custom courses — edit your content','我的自定义课程：自行修改内容','我的自訂課程：自行修改內容')}</a></p></section>`:''}`;
}
if(typeof window!=='undefined')window.addEventListener('resize',()=>paint());
export function runBackgroundWork(meta,work){return backgroundAI.start(meta,work);}
export function backgroundRequest(path,body,meta={}){
 const route=typeof location==='undefined'?'':location.hash;
 const kind=path==='/api/course-ai'?'courseware':path==='/api/course-narration'?'narration':body.action==='generate'?'plan':body.action==='expand'?'expand':body.action==='review'?'review':'assistant';
 const titles={courseware:L('Courseware','课程课件','課程課件'),narration:L('Narration','课程配音','課程配音'),plan:L('Learning plan','学习计划','學習計畫'),expand:L('Lesson expansion','扩充课节','擴充課節'),review:L('Interview review','面试复盘','面試複盤'),assistant:L('AI explanation / reply','AI 讲解 / 回复','AI 講解 / 回覆')};
 return runBackgroundWork({kind,route,courseId:body.courseId,lessonId:body.lesson?.id,action:body.action,title:titles[kind]+(body.topic||body.title||body.messages?.at(-1)?.content?' · '+String(body.topic||body.title||body.messages.at(-1).content).slice(0,70):''),key:path+':'+JSON.stringify(body),...meta},async()=>{
  let response;try{response=await fetch(path,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(300000)});}catch(error){throw Error(error?.name==='TimeoutError'||error?.name==='AbortError'?'provider_timeout':'server_connection_failed',{cause:error});}
  let data;try{data=await response.json();}catch{throw Error('invalid_service_response');}if(!response.ok)throw Error(data.error||'generation_failed');
  if(path==='/api/course-ai'&&body.action==='lesson'&&!hasCompleteCourseware(data.lesson))throw Error('invalid_ai_result');
  return data;
 });
}
