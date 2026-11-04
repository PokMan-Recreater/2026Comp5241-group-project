import {cloudAPI} from './cloud-records.js';
import {icon as ico} from './icons.js';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pick=(locale,en,cn,tw)=>locale==='en'?en:locale==='zh-TW'?tw:cn;
const pages={
 overview:['Platform overview','平台概览','平台概覽','Real accounts, courses and learning activity shared by the whole platform.','真实的账号、课程与全平台学习数据。','真實的帳號、課程與全平台學習資料。'],
 users:['People & roles','用户与角色','使用者與角色','Read real accounts, change roles or disable an account.','查看真实账号，调整角色或停用账号。','查看真實帳號，調整角色或停用帳號。'],
 catalog:['Course management','课程管理','課程管理','Teacher courses and private learner drafts across the platform.','全平台教师课程与学员私有草稿。','全平台教師課程與學員私有草稿。'],
 'admin-learning':['Learning overview','学习情况','學習情況','Learning events summarised across all teachers and classrooms.','跨教师、跨班级汇总真实学习事件。','跨教師、跨班級彙總真實學習事件。']
};
const roles={student:['Student','学生','學生'],teacher:['Teacher','教师','教師'],admin:['Administrator','管理员','管理員']};
const roleText=(role,locale)=>pick(locale,...(roles[role]||roles.student));

export function adminHTML(page,locale='zh-CN'){
 const p=pages[page]||pages.overview;
 return `<div class="page-heading"><h1>${esc(pick(locale,p[0],p[1],p[2]))}</h1><p>${esc(pick(locale,p[3],p[4],p[5]))}</p></div><div id="admin-view" data-admin-page="${esc(page)}"><p class="small muted" role="status">${esc(pick(locale,'Loading…','正在加载…','正在載入…'))}</p></div>`;
}

export function mountAdmin({page,locale='zh-CN',user=null}={}){
 const root=document.querySelector('#admin-view');
 if(!root)return;
 let alive=true;
 const L=(en,cn,tw)=>pick(locale,en,cn,tw);
 const number=n=>new Intl.NumberFormat(locale).format(Number(n)||0);
 const when=value=>{if(!value)return '—';const d=new Date(value);return Number.isNaN(d.getTime())?'—':d.toLocaleDateString(locale,{year:'numeric',month:'short',day:'numeric'});};
 const minutes=seconds=>`${Math.round((Number(seconds)||0)/60)} ${L('min','分钟','分鐘')}`;
 const statsGrid=items=>`<div class="stats-grid">${items.map(([icon,label,value])=>`<div class="stat-card"><div class="row">${ico(icon,15)}${esc(label)}</div><strong>${typeof value==='number'?number(value):esc(value)}</strong></div>`).join('')}</div>`;
 const errors={
  admin_required:L('This page is for administrators only.','此页面仅管理员可用。','此頁面僅管理員可用。'),
  login_required:L('Please sign in again.','请重新登录。','請重新登入。'),
  database_not_configured:L('The database is not configured yet.','数据库尚未配置。','資料庫尚未設定。'),
  rate_limited:L('Too many requests. Try again later.','操作较频繁，请稍后再试。','操作較頻繁，請稍後再試。'),
  revision_conflict:L('This course changed elsewhere. Reload and try again.','该课程刚刚被修改，请刷新后重试。','該課程剛剛被修改，請重新整理後再試。'),
  last_admin:L('The last administrator cannot be demoted.','不能降级最后一名管理员。','不能降級最後一名管理員。'),
  cannot_change_own_role:L('You cannot change your own administrator role.','不能修改自己的管理员角色。','不能修改自己的管理員角色。'),
  cannot_ban_self:L('You cannot disable your own account.','不能停用自己的账号。','不能停用自己的帳號。'),
  not_found:L('The account or course no longer exists.','账号或课程已不存在。','帳號或課程已不存在。'),
  invalid_request:L('The request was not valid. Reload and try again.','请求无效，请刷新后重试。','請求無效，請重新整理後再試。')
 };
 const errorText=code=>errors[code]||L('Unable to load admin data. Please try again.','暂时无法读取管理员数据，请重试。','暫時無法讀取管理員資料，請重試。');
 const fail=error=>{root.innerHTML=`<div class="callout warning">${esc(errorText(error?.message))}</div>`;};
 const loading=()=>`<p class="small muted" role="status">${L('Loading…','正在加载…','正在載入…')}</p>`;
 const notice=text=>{const node=root.querySelector('[data-admin-notice]');if(node){node.textContent=text;node.className='small muted';}};
 const saved=()=>L('Saved.','已保存。','已儲存。');

 const overview=async()=>{
  try{
   const data=await cloudAPI('/api/admin?resource=overview');
   if(!alive)return;
   const s=data.stats;
   root.innerHTML=statsGrid([
    ['users',L('Accounts','注册账号','註冊帳號'),s.users],
    ['users',L('Students','学生','學生'),s.students],
    ['users',L('Teachers','教师','教師'),s.teachers],
    ['shield',L('Administrators','管理员','管理員'),s.admins],
    ['book',L('Teacher courses','教师课程','教師課程'),s.teachingCourses],
    ['check',L('Published courses','已发布课程','已發布課程'),s.publishedCourses],
    ['layers',L('Personal drafts','私有草稿','私有草稿'),s.personalCourses],
    ['users',L('Classrooms','教学班','教學班'),s.classrooms],
    ['path',L('Assignments','布置记录','佈置記錄'),s.assignments],
    ['activity',L('Learning events','学习事件','學習事件'),s.events]
   ]);
  }catch(error){if(alive)fail(error);}
 };

 const usersPage=async()=>{
  root.innerHTML=`<div class="row between" style="margin-bottom:14px;gap:12px;flex-wrap:wrap"><span class="small muted" data-admin-count></span><input id="admin-search" class="filter" style="min-width:220px;flex:1;max-width:340px" type="search" placeholder="${esc(L('Search username or email','搜索用户名或邮箱','搜尋使用者名稱或電郵'))}" aria-label="${esc(L('Search accounts','搜索账号','搜尋帳號'))}"></div><p class="small muted" data-admin-notice role="status"></p><div id="admin-users">${loading()}</div>`;
  const table=root.querySelector('#admin-users'),search=root.querySelector('#admin-search');
  const load=async query=>{
   try{
    const data=await cloudAPI('/api/admin?resource=users'+(query?'&search='+encodeURIComponent(query):''));
    if(!alive)return;
    root.querySelector('[data-admin-count]').textContent=`${number(data.users.length)} ${L('accounts','个账号','個帳號')}`;
    table.innerHTML=data.users.length?`<div class="table-wrap"><table><thead><tr><th>${L('Username','用户名','使用者名稱')}</th><th>${L('Email','邮箱','電郵')}</th><th>${L('Role','身份','身分')}</th><th>${L('Status','状态','狀態')}</th><th>${L('Last sign-in','最近登录','最近登入')}</th><th></th></tr></thead><tbody>${data.users.map(u=>{const self=u.id===user?.id;return `<tr><td><strong>${esc(u.username||'—')}</strong>${self?` <span class="small muted">(${L('you','你','你')})</span>`:''}</td><td class="small muted">${esc(u.email||'—')}</td><td><select data-admin-role="${esc(u.id)}" aria-label="${esc(L('Role','身份','身分'))}" ${self?'disabled':''}>${Object.keys(roles).map(role=>`<option value="${role}" ${role===u.role?'selected':''}>${esc(roleText(role,locale))}</option>`).join('')}</select></td><td><span class="pill ${u.banned?'':'green'}">${u.banned?esc(L('Disabled','已停用','已停用')):esc(L('Active','正常','正常'))}</span></td><td class="small muted">${esc(when(u.last_sign_in_at))}</td><td>${self?'' : `<button class="btn secondary small-btn" data-admin-ban="${esc(u.id)}" data-banned="${u.banned}">${u.banned?esc(L('Enable','启用','啟用')):esc(L('Disable','停用','停用'))}</button>`}</td></tr>`;}).join('')}</tbody></table></div>`:`<div class="empty">${esc(L('No matching accounts.','没有匹配的账号。','沒有符合的帳號。'))}</div>`;
   }catch(error){if(alive)table.innerHTML=`<div class="callout warning">${esc(errorText(error?.message))}</div>`;}
  };
  const refresh=()=>load(search.value.trim());
  table.addEventListener('change',async event=>{
   const select=event.target.closest('[data-admin-role]');
   if(!select)return;
   select.disabled=true;
   try{await cloudAPI('/api/admin',{action:'set-role',userId:select.dataset.adminRole,role:select.value});notice(saved());await refresh();}
   catch(error){notice(errorText(error?.message));select.disabled=false;select.value=[...select.options].find(o=>o.defaultSelected)?.value||select.value;}
  });
  table.addEventListener('click',async event=>{
   const button=event.target.closest('[data-admin-ban]');
   if(!button)return;
   const banned=button.dataset.banned==='true';
   if(!banned&&!confirm(L('Disable this account? The user cannot sign in until re-enabled.','停用该账号？停用后无法登录，直到重新启用。','停用該帳號？停用後無法登入，直到重新啟用。')))return;
   button.disabled=true;
   try{await cloudAPI('/api/admin',{action:'ban',userId:button.dataset.adminBan,banned:!banned});notice(saved());await refresh();}
   catch(error){notice(errorText(error?.message));button.disabled=false;}
  });
  let timer;search.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(refresh,250);});
  await load('');
 };

 const catalog=async()=>{
  root.innerHTML=loading();
  const render=async()=>{
   try{
    const data=await cloudAPI('/api/admin?resource=courses');
    if(!alive)return;
    root.innerHTML=`<p class="small muted" data-admin-notice role="status" style="margin-bottom:12px">${number(data.courses.length)} ${esc(L('courses','门课程','門課程'))}</p>${data.courses.length?`<div class="table-wrap"><table><thead><tr><th>${L('Course','课程','課程')}</th><th>${L('Owner','所有者','擁有者')}</th><th>${L('Type','类型','類型')}</th><th>${L('Status','状态','狀態')}</th><th>${L('Updated','更新时间','更新時間')}</th><th></th></tr></thead><tbody>${data.courses.map(course=>`<tr><td><strong>${esc(course.title||'—')}</strong>${course.description?`<div class="small muted">${esc(String(course.description).slice(0,90))}</div>`:''}</td><td class="small muted">${esc(course.owner_username||'—')}</td><td><span class="pill">${course.kind==='teaching'?esc(L('Teacher','教师','教師')):esc(L('Private draft','私有草稿','私有草稿'))}</span></td><td>${course.kind==='personal'?`<span class="pill">${esc(L('Private','私有','私有'))}</span>`:course.published?`<span class="pill green">${esc(L('Published','已发布','已發布'))}</span>`:`<span class="pill">${esc(L('Draft','草稿','草稿'))}</span>`}</td><td class="small muted">${esc(when(course.updated_at))}</td><td>${course.kind==='teaching'?`<div class="row" style="gap:6px">${course.published?`<button class="btn secondary small-btn" data-admin-unpublish="${esc(course.id)}" data-revision="${course.revision}">${esc(L('Unpublish','下架','下架'))}</button>`:''}<button class="btn secondary small-btn" data-admin-delete="${esc(course.id)}">${esc(L('Delete','删除','刪除'))}</button></div>`:''}</td></tr>`).join('')}</tbody></table></div>`:`<div class="empty">${esc(L('No courses yet.','暂无课程。','暫無課程。'))}</div>`}`;
   }catch(error){if(alive)fail(error);}
  };
  root.onclick=async event=>{
   const unpublish=event.target.closest('[data-admin-unpublish]'),remove=event.target.closest('[data-admin-delete]');
   if(!unpublish&&!remove)return;
   if(remove&&!confirm(L('Delete this course? It will be removed from the catalog and its classrooms closed.','删除该课程？课程会从目录移除，关联教学班也会关闭。','刪除該課程？課程會從目錄移除，關聯教學班也會關閉。')))return;
   const button=unpublish||remove;button.disabled=true;
   try{
    if(unpublish)await cloudAPI('/api/admin',{action:'unpublish',courseId:unpublish.dataset.adminUnpublish,revision:Number(unpublish.dataset.revision)});
    else await cloudAPI('/api/admin',{action:'delete-course',courseId:remove.dataset.adminDelete,kind:'teaching'});
    await render();
   }catch(error){notice(errorText(error?.message));button.disabled=false;}
  };
  await render();
 };

 const learning=async()=>{
  try{
   const data=await cloudAPI('/api/admin?resource=learning');
   if(!alive)return;
   const s=data.summary,rows=data.rows.slice().sort((a,b)=>String(b.last_active||'').localeCompare(String(a.last_active||''))||a.username.localeCompare(b.username));
   root.innerHTML=statsGrid([
    ['path',L('Assignments reviewed','统计的布置','統計的佈置'),s.assignments],
    ['users',L('Students','学生','學生'),s.students],
    ['activity',L('Active students','有活动的学生','有活動的學生'),s.activeStudents],
    ['check',L('Lessons completed','完成课节','完成課節'),s.completedLessons],
    ['book',L('Study time','学习时长（分钟）','學習時長（分鐘）'),Math.round(s.activeSeconds/60)],
    ['chart',L('Quiz accuracy','测验正确率','測驗正確率'),s.accuracy==null?'—':`${Math.round(s.accuracy*100)}%`]
   ])+`<div class="table-wrap mt"><table><thead><tr><th>${L('Student','学生','學生')}</th><th>${L('Classroom','教学班','教學班')}</th><th>${L('Course','课程','課程')}</th><th>${L('Completed lessons','完成课节','完成課節')}</th><th>${L('Active time','活跃时长','活躍時長')}</th><th>${L('Quiz accuracy','测验正确率','測驗正確率')}</th><th>${L('Last activity','最近活动','最近活動')}</th></tr></thead><tbody>${rows.length?rows.map(row=>`<tr><td><strong>${esc(row.username||row.student_id)}</strong></td><td>${esc(row.classroom_name||'—')}</td><td>${esc(row.course_title||'—')}</td><td>${number(row.completed_lessons)} / ${number(row.total_lessons)}</td><td>${esc(minutes(row.active_seconds))}</td><td>${row.quiz_attempts?`${Math.round(row.correct_attempts/row.quiz_attempts*100)}% (${number(row.correct_attempts)}/${number(row.quiz_attempts)})`:'—'}</td><td class="small muted">${esc(when(row.last_active))}</td></tr>`).join(''):`<tr><td colspan="7">${esc(L('No learning activity yet.','暂无学习活动。','暫無學習活動。'))}</td></tr>`}</tbody></table></div>${s.truncated?`<div class="callout warning mt">${esc(L('Showing the latest 30 assignments.','仅显示最近 30 次布置。','僅顯示最近 30 次佈置。'))}</div>`:''}`;
  }catch(error){if(alive)fail(error);}
 };

 const run={overview,users:usersPage,catalog,'admin-learning':learning}[page]||overview;
 run();
}
