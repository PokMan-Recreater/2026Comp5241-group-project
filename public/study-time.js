import {local,tri} from './i18n.js';

export const studyTimePresets=[30,60,120,180,300,420];
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/** @param {Record<string, any>} data @param {string} [lang] */
export function resolveStudyTime(data,lang='en') {
 const raw=data.weeklyMinutes==='custom'?data.customWeeklyMinutes:data.weeklyMinutes;
 const minutes=Number(raw);
 if(!Number.isInteger(minutes)||minutes<30||minutes>1200)throw new Error(local(tri('Enter a whole number from 30 to 1200 minutes per week.','请输入每周 30–1200 分钟之间的整数。','請輸入每週 30–1200 分鐘之間的整數。'),lang));
 return {...data,weeklyMinutes:minutes};
}

export function studyTimeHTML(id,data,lang='en') {
 const L=(en,cn,tw)=>local(tri(en,cn,tw),lang),e=escape;
 const raw=data.weeklyMinutes??120;
 const custom=raw==='custom'||!studyTimePresets.includes(Number(raw));
 const value=raw==='custom'?(data.customWeeklyMinutes??''):raw;
 return `<div class="field study-time-field"><label for="${id}">${L('Study time','学习时间','學習時間')}</label><select id="${id}" name="weeklyMinutes" data-study-time>${studyTimePresets.map(n=>`<option value="${n}" ${!custom&&Number(raw)===n?'selected':''}>${n} ${L('min / week','分钟 / 周','分鐘 / 週')}</option>`).join('')}<option value="custom" ${custom?'selected':''}>${L('Custom…','自定义…','自訂…')}</option></select><div class="custom-study-time" data-custom-time ${custom?'':'hidden'}><label for="${id}-custom">${L('Minutes per week','每周分钟数','每週分鐘數')}</label><input id="${id}-custom" name="customWeeklyMinutes" type="number" min="30" max="1200" step="1" inputmode="numeric" value="${e(custom?value:'')}" placeholder="${L('e.g. 90','例如：90','例如：90')}" aria-describedby="${id}-hint" ${custom?'required':'disabled'}><p class="field-hint" id="${id}-hint">${L('30–1200 minutes per week (up to 20 hours).','每周 30–1200 分钟（最多 20 小时）。','每週 30–1200 分鐘（最多 20 小時）。')}</p></div></div>`;
}
