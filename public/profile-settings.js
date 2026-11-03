import {local, tri, languages} from './i18n.js';

/** @param {Record<string, any>} profile */
export function defaultCourseLevel(profile) {
 return ['beginner','intermediate','advanced'].includes(profile.skillLevel)
  ? profile.skillLevel : profile.depth==='advanced'?'advanced':'beginner';
}

/** Match example framing to experience without limiting course access.
 * @param {Record<string, any>} profile
 */
export function experienceFraming(profile) {
 if(profile.background==='noCoding')return 'non-cs';
 if(['someCoding','experienced'].includes(profile.background))return 'cs';
 return ['cs','non-cs'].includes(profile.audience)?profile.audience:'non-cs';
}

/** @param {Record<string, any>} profile @param {Record<string, any>} academy @param {string} courseId */
export function lessonReadingDepth(profile, academy, courseId) {
 const override=academy.lessonDepths?.[courseId];
 return ['beginner','advanced'].includes(override)?override:defaultCourseLevel(profile)==='advanced'?'advanced':'beginner';
}

/** Save explicit settings without altering plans, records or other roles' preferences.
 * @param {Record<string, any>} profile @param {FormData} form @param {string} role
 */
export function updatedProfile(profile, form, role) {
 const name=String(form.get('name')||'').trim().slice(0,50);
 if(!name)throw new Error('Name is required');
 if(role!=='learner')return {...profile,name};
 const get=(key,allowed,fallback)=>allowed.includes(String(form.get(key)))?String(form.get(key)):fallback;
 const background=get('background',['noCoding','someCoding','experienced'],profile.background||'noCoding');
 return {...profile,name,
  background,
  goal:get('goal',['understand','build','career'],profile.goal||'build'),
  learningLanguage:get('learningLanguage',['','en','zh-CN','zh-TW'],profile.learningLanguage||''),
  audience:experienceFraming({background})
 };
}

const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function profileSettingsHTML(profile,role,lang) {
 const L=(en,cn,tw)=>local(tri(en,cn,tw),lang),e=escape;
 const learner=role==='learner';
 const select=(id,name,title,items,value,hint='')=>`<div class="field"><label for="${id}">${title}</label><select id="${id}" name="${name}"${hint?` aria-describedby="${id}-hint"`:''}>${items.map(([v,text])=>`<option value="${e(v)}" ${v===value?'selected':''}>${e(text)}</option>`).join('')}</select>${hint?`<p class="field-hint" id="${id}-hint">${hint}</p>`:''}</div>`;
 const section=(title,body)=>`<fieldset class="profile-section"><legend>${title}</legend><div class="form-grid">${body}</div></fieldset>`;
 const basics=section(L('Basic information','基本信息','基本資料'),`<div class="field full-field"><label for="profile-name">${L('Your name','你的名字','你的名字')}</label><input id="profile-name" name="name" required maxlength="50" autocomplete="name" value="${e(profile.name)}"></div>`);
 const background=section(L('Learning background','学习背景','學習背景'),
  select('background','background',L('Current experience','目前经验','目前經驗'),[
   ['noCoding',L('New to development','没有开发基础','沒有開發基礎')],['someCoding',L('Some coding experience','有一些编程经验','有一些程式經驗')],['experienced',L('Project experience','有完整项目经验','有完整專案經驗')]
  ],profile.background||'noCoding',L('Study templates use your experience for example framing. All courses remain available.','学习模板按目前经验选择讲解视角，所有课程均可自由选择。','學習範本依目前經驗選擇講解角度，所有課程均可自由選擇。'))+
  select('goal','goal',L('Learning goal','学习目标','學習目標'),[
   ['understand',L('Understand software development','理解软件如何开发','理解軟體如何開發')],['build',L('Build my own project','做出自己的项目','做出自己的專案')],['career',L('Prepare for a related role','准备相关岗位求职','準備相關職位求職')]
  ],profile.goal||'build'));
 const preferences=section(L('Learning language','学习语言','學習語言'),
  select('learning-language','learningLanguage',L('Course content language','课文语言','課文語言'),[['',L('Follow interface language','跟随界面语言','跟隨介面語言')],...Object.entries(languages)],profile.learningLanguage||''));
 return `<div class="page-heading"><h1>${learner?L('Learning profile','学习档案','學習檔案'):L('Personal settings','个人设置','個人設定')}</h1><p>${learner?L('Tell us your experience and goals. Choose what to study, difficulty and weekly time in your study plans.','记录你的经验和目标；学习主题、难度和每周时间在学习计划中设置。','記錄你的經驗與目標；學習主題、難度和每週時間在學習計畫中設定。'):L('Update your display name. Learning preferences are available in the learner workspace.','修改你的显示名字，学习偏好在学习者工作区中设置。','修改你的顯示名字，學習偏好在學習者工作區中設定。')}</p></div><div class="profile-settings-layout"><form id="profile-form" class="form-card profile-settings-form">${basics}${learner?background+preferences:''}<div class="form-actions"><button class="btn" type="submit">${L('Save changes','保存更改','儲存變更')}</button></div></form>${learner?`<aside class="profile-settings-aside"><h2>${L('Plan your next topic','安排下一段学习','安排下一段學習')}</h2><p class="small muted">${L('A profile describes your starting point. Each study plan has its own topic, difficulty and schedule.','档案记录你的起点。每份学习计划分别设置主题、难度和时间安排。','檔案記錄你的起點。每份學習計畫分別設定主題、難度與時間安排。')}</p><a class="home-text-link" href="#path">${L('View study plans','查看学习计划','查看學習計畫')} →</a></aside>`:''}</div>`;
}
