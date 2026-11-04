import {backgroundRequest} from './background-ai.js';
import {interviewReportHTML} from './interview-report.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function cloudAPI(path,body,method,options={}){
 if(path==='/api/course-ai'&&body?.action==='lesson'&&!body.production)body={...body,production:'lesson-v2'};
 if(body&&(!method||method==='POST')&&['/api/course-ai','/api/course-narration'].includes(path)&&options.background!==false)return backgroundRequest(path,body);
 let r;try{r=await fetch(path,{method:method||(body?'POST':'GET'),credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});}catch{throw Error('server_connection_failed');}
 let data;try{data=await r.json();}catch{throw Error('invalid_service_response');}if(!r.ok)throw Error(data.error||'database_unavailable');return data;
}
let cleanup=()=>{};
export const stopCloudRecords=()=>{cleanup();cleanup=()=>{};};
export const cloudRecordsHTML=()=>'<div id="cloud-records" aria-live="polite"></div>';
export function mountCloudRecords(locale='zh-CN',id){
 stopCloudRecords();const root=document.querySelector('#cloud-records');if(!root)return;
 let alive=true,timer,user;
 const L=(en,cn,tw=cn)=>locale==='en'?en:locale==='zh-TW'?tw:cn;
 const errors={database_not_configured:L('Cloud storage is not configured yet.','数据库连接尚未配置。'),login_required:L('Please sign in again.','请重新登录。'),authentication_failed:L('Sign-in failed. Check your username and password.','登录失败，请检查账号和密码。'),rate_limited:L('Too many requests. Try later.','操作较频繁，请稍后重试。'),invalid_credentials:L('Enter a 3–32 character username and a password of at least 8 characters (up to 72 UTF-8 bytes).','账号为 3–32 位英文字母、数字或 ._-，以字母开头；密码至少 8 位，最多 72 字节。')};
 errors.reserved_username=L('This username is reserved.','该账号为系统预留，请换一个。');errors.registration_failed=L('Unable to register. The username may already exist.','注册失败，该账号可能已存在。');
 const errorText=e=>errors[e.message]||L('Unable to connect. Your records have not been changed.','暂时无法连接，已有记录未更改。');
 const header=()=>`<div class="page-heading"><h1>${L('My interviews','我的面试记录','我的面試紀錄')}</h1></div><div class="row mb"><a href="#records/history">${L('My records','我的记录','我的紀錄')}</a><a href="#mock-interview">${L('Start an interview','开始面试','開始面試')}</a></div>`;
 const accountForm=()=>`<section class="panel cloud-login"><h2>${L('Sign in to save your interviews','登录后保存面试记录','登入後儲存面試紀錄')}</h2><p>${L('Only you can access your conversations and reviews.','对话与复盘仅本人可查看。')}</p><form data-cloud-form><div class="field"><label for="cloud-username">${L('Username','账号','帳號')}</label><input id="cloud-username" name="username" type="text" autocomplete="username" required minlength="3" maxlength="32" pattern="[a-zA-Z][a-zA-Z0-9._-]{2,31}"></div><div class="field"><label for="cloud-password">${L('Password','密码','密碼')}</label><input id="cloud-password" name="password" type="password" autocomplete="current-password" required minlength="8" maxlength="72"></div><div class="row mt"><button class="btn" name="action" value="login">${L('Sign in','登录','登入')}</button><button class="btn secondary" name="action" value="signup">${L('Create account','注册','註冊')}</button></div></form><p data-cloud-status role="status"></p></section>`;
 const showError=e=>{if(alive){root.innerHTML=header()+`<section class="panel"><p>${esc(errorText(e))}</p><button class="btn secondary" data-cloud="refresh">${L('Retry','重试','重試')}</button></section>`;}};
 const jobText=j=>({pending:L('Review queued','等待后台复盘','等待背景回顧'),processing:L('Review in progress','后台复盘中','背景回顧中'),completed:L('Review saved','复盘已保存','回顧已儲存'),failed:L('Review failed; transcript saved','复盘未成功，对话已保存','回顧未成功，對話已儲存')}[j?.status]||L('No complete answer to review','暂无完整回答可复盘','暫無完整回答可回顧'));
 async function load(){
  clearTimeout(timer);try{
   const session=await cloudAPI('/api/account');if(!alive)return;user=session.user;
   if(!user){root.innerHTML=header()+accountForm();return;}
   const data=await cloudAPI('/api/interview-records'+(id?'?id='+encodeURIComponent(id):''));if(!alive)return;
   const bar=`<div class="row between mb"><span>${esc(user.username)}</span><button class="btn secondary small-btn" data-cloud="logout">${L('Sign out','退出登录','登出')}</button></div>`;
   if(id){const r=data.record,reports=r.interview_reports||[],report=reports.sort((a,b)=>b.version-a.version)[0],job=r.interview_review_jobs?.[0];root.innerHTML=header()+bar+`<section class="panel"><a href="#interview-records">← ${L('All interviews','全部面试','全部面試')}</a><h2>${esc(new Date(r.started_at).toLocaleString(locale))}</h2><p>${esc(r.role)} · ${esc(r.spoken_language==='en'?'English':'中文')} · ${r.duration_seconds??0}s</p><p>${jobText(job)}</p>${job?.status==='pending'?`<button class="btn secondary" data-cloud="retry">${L('Continue review','继续复盘','繼續回顧')}</button>`:''}<details><summary>${L('Conversation transcript','对话记录','對話紀錄')}</summary>${(r.interview_turns||[]).sort((a,b)=>a.sequence-b.sequence).map(m=>`<article class="mt"><strong>${m.role==='user'?L('You','你'):L('Interviewer','面试官','面試官')}${m.transcript_status!=='complete'?L(' · partial',' · 未完整',' · 未完整'):''}</strong><p style="white-space:pre-wrap">${esc(m.text)}</p></article>`).join('')}</details><button class="btn secondary mt" data-cloud="download">${L('Download record','下载记录','下載紀錄')}</button><button class="btn ghost mt" data-cloud="delete">${L('Delete this interview','删除本次面试','刪除本次面試')}</button><p data-cloud-status role="status"></p></section>`+(report?interviewReportHTML(report.report,locale):'');
    root.dataset.download=JSON.stringify(r);if(['pending','processing'].includes(job?.status))timer=setTimeout(load,5000);
   }else{root.innerHTML=header()+bar+(data.records.length?`<div class="knowledge-topics">${data.records.map(r=>{const report=r.interview_reports?.[0];return `<a class="panel knowledge-topic-entry" href="#interview-records/${r.id}"><h2>${esc(new Date(r.started_at).toLocaleDateString(locale))}</h2><p>${esc(r.role)} · ${esc(r.spoken_language==='en'?'English':'中文')} · ${r.duration_seconds??0}s</p><div><span>${report?.final_score!=null?report.final_score+' / 100':esc(jobText(r.interview_review_jobs?.[0]))}</span><span>→</span></div></a>`;}).join('')}</div>`:`<section class="panel"><p>${L('No saved interviews yet.','还没有保存的面试记录。','還沒有儲存的面試紀錄。')}</p></section>`);}
  }catch(e){showError(e);}
 }
 const submit=async e=>{if(!e.target.matches('[data-cloud-form]'))return;e.preventDefault();const form=e.target,button=e.submitter;button.disabled=true;const status=root.querySelector('[data-cloud-status]');try{const data=await cloudAPI('/api/account',{...Object.fromEntries(new FormData(form)),action:button.value});form.reset();if(data.user)await load();}catch(err){if(alive)status.textContent=errorText(err);}finally{if(button.isConnected)button.disabled=false;}};
 const click=async e=>{const button=e.target.closest('[data-cloud]');if(!button)return;const action=button.dataset.cloud;try{
  if(action==='refresh')return await load();
  if(action==='logout'){await cloudAPI('/api/account',{action:'logout'});window.dispatchEvent(new Event('forma-signed-out'));return;}
  if(action==='retry'){button.disabled=true;await cloudAPI('/api/interview-records',{action:'retry',id});await load();}
  if(action==='delete'){if(!confirm(L('Delete this interview, conversation and report permanently?','确定永久删除这次面试、对话和复盘吗？')))return;await cloudAPI('/api/interview-records?id='+encodeURIComponent(id),null,'DELETE');location.hash='interview-records';}
  if(action==='download'){const blob=new Blob([root.dataset.download||'{}'],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Forma-interview.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 }catch(err){const status=root.querySelector('[data-cloud-status]');if(status)status.textContent=errorText(err);}};
 root.addEventListener('submit',submit);root.addEventListener('click',click);root.innerHTML=header()+`<p>${L('Loading…','正在读取…','正在讀取…')}</p>`;load();
 cleanup=()=>{alive=false;clearTimeout(timer);root.removeEventListener('submit',submit);root.removeEventListener('click',click);};
}
export async function saveCloudInterview(payload){
 const session=await cloudAPI('/api/account');if(!session.user)throw Error('login_required');return cloudAPI('/api/interview-records',payload);
}
