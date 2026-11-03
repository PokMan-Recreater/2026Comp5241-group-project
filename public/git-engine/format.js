// Terminal colours and the date, identity and stat formats Git prints.
// Output is plain text with ANSI colour codes, exactly what a terminal gets
// from Git with color.ui=auto; the page turns the codes into coloured spans.

const esc=code=>s=>`\x1b[${code}m${s}\x1b[m`;
export const C={
 red:esc('31'),green:esc('32'),yellow:esc('33'),blue:esc('34'),magenta:esc('35'),cyan:esc('36'),bold:esc('1'),
 boldRed:esc('1;31'),boldGreen:esc('1;32'),boldYellow:esc('1;33'),boldBlue:esc('1;34'),boldCyan:esc('1;36'),dim:esc('2'),
};
// eslint-disable-next-line no-control-regex
export const stripAnsi=s=>String(s).replace(/\x1b\[[0-9;]*m/g,'');

const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const tzMinutes=tz=>{const m=String(tz).match(/^([+-])(\d\d)(\d\d)$/);return m?(m[1]==='-'?-1:1)*(Number(m[2])*60+Number(m[3])):0;};
const local=(time,tz)=>new Date((time+tzMinutes(tz)*60)*1000);
const two=n=>String(n).padStart(2,'0');
/** "Tue Nov 3 20:13:00 2026 +0800" — Git's default date format. */
export function gitDate(time,tz){
 const d=local(time,tz);
 return `${DAYS[d.getUTCDay()]} ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()} ${two(d.getUTCHours())}:${two(d.getUTCMinutes())}:${two(d.getUTCSeconds())} ${d.getUTCFullYear()} ${tz}`;
}
/** "2026-11-03 20:13:00 +0800" — the ISO-like format blame uses. */
export function isoDate(time,tz){
 const d=local(time,tz);
 return `${d.getUTCFullYear()}-${two(d.getUTCMonth()+1)}-${two(d.getUTCDate())} ${two(d.getUTCHours())}:${two(d.getUTCMinutes())}:${two(d.getUTCSeconds())} ${tz}`;
}
/** "2 hours ago" style relative dates for the GitHub pages. */
export function ago(time,now=Math.floor(Date.now()/1000)){
 const s=Math.max(0,now-time);
 if(s<45)return 'just now';const m=Math.round(s/60);if(m<60)return `${m} minute${m===1?'':'s'} ago`;
 const h=Math.round(m/60);if(h<24)return `${h} hour${h===1?'':'s'} ago`;const d=Math.round(h/24);return `${d} day${d===1?'':'s'} ago`;
}
export const plural=(n,one,many)=>`${n} ${n===1?one:many}`;
