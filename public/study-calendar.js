import {local,tri} from './i18n.js';
export const localDateKey=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const dates=values=>[...new Set((Array.isArray(values)?values:[]).filter(x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)))];
export function checkinStats(values,now=new Date()){
 const days=new Set(dates(values)),today=localDateKey(now);let cursor=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12),streak=0;
 if(!days.has(today))cursor.setDate(cursor.getDate()-1);
 while(days.has(localDateKey(cursor))){streak++;cursor.setDate(cursor.getDate()-1);}
 return {today,checked:days.has(today),total:days.size,streak};
}
export function recordCheckin(academy,now=new Date()){
 const day=localDateKey(now),saved=dates(academy.checkins);if(saved.includes(day))return false;
 academy.checkins=[...saved,day].sort();return true;
}
export function studyCalendarHTML(values,locale='zh-CN',offset=0,now=new Date()){
 const L=(en,cn,tw=cn)=>local(tri(en,cn,tw),locale),stats=checkinStats(values,now),days=new Set(dates(values));
 const month=new Date(now.getFullYear(),now.getMonth()+Math.min(0,Math.max(-120,offset)),1,12),year=month.getFullYear(),m=month.getMonth(),start=(month.getDay()+6)%7,last=new Date(year,m+1,0).getDate();
 const title=locale==='en'?month.toLocaleDateString('en',{month:'long',year:'numeric'}):`${year} ${L('','年','年')} ${m+1} ${L('','月','月')}`;
 const cells=Array.from({length:start},()=>'<span class="calendar-blank" aria-hidden="true"></span>');
 for(let day=1;day<=last;day++){const key=localDateKey(new Date(year,m,day,12)),checked=days.has(key),today=key===stats.today;cells.push(`<span class="calendar-day ${checked?'is-checked':''} ${today?'is-today':''}" ${today?'aria-current="date"':''} aria-label="${key}${checked?' · '+L('Checked in','已打卡','已打卡'):''}">${day}${checked?'<i aria-hidden="true">✓</i>':''}</span>`);}
 return `<section class="panel study-calendar"><div class="section-head"><h2>${L('Daily check-in','日历打卡','日曆打卡')}</h2><span class="calendar-spark" aria-hidden="true">✦</span></div><div class="calendar-summary"><span>${L('Streak','连续','連續')} <strong>${stats.streak}</strong> ${L('days','天','天')}</span><span>${L('Total','累计','累計')} <strong>${stats.total}</strong> ${L('days','天','天')}</span></div><div class="calendar-month"><button class="icon-btn" data-ac="calendar-month" data-offset="-1" aria-label="${L('Previous month','上个月','上個月')}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button><strong>${title}</strong><button class="icon-btn" data-ac="calendar-month" data-offset="1" aria-label="${L('Next month','下个月','下個月')}" ${offset>=0?'disabled':''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg></button></div><div class="calendar-grid" role="group" aria-label="${title}">${(locale==='en'?['M','T','W','T','F','S','S']:['一','二','三','四','五','六','日']).map(x=>`<span class="calendar-weekday">${x}</span>`).join('')}${cells.join('')}</div><button class="btn calendar-checkin" data-ac="check-in" ${stats.checked?'disabled':''}>${stats.checked?L('✓ Checked in today','✓ 今日已打卡','✓ 今日已打卡'):L('Check in today','今日打卡','今日打卡')}</button><p class="small muted">${L('A little learning, every day.','每天学一点，慢慢走得更远。','每天學一點，慢慢走得更遠。')}</p></section>`;
}
