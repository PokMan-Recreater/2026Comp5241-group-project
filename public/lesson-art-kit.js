import {lessonText} from './delivery-i18n.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number(v)||0));
export const DEFS='<defs><marker id="dl-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5 0 7" fill="#7967ac"/></marker><marker id="dl-arrow-sm" markerUnits="userSpaceOnUse" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0L6 3 0 6" fill="#7967ac"/></marker></defs>';
// Speech labels wrap within their bubble instead of crossing adjacent artwork.
export function speechLines(value,width,size=13){
 const measure=text=>[...text].reduce((n,c)=>n+(/[\u2e80-\u9fff]/.test(c)?size:/[MW@]/.test(c)?size*.9:size*.57),0);
 const words=/[\u2e80-\u9fff]/.test(value)?[...value]:value.split(/\s+/),join=words[0]?.length===1&&/[\u2e80-\u9fff]/.test(value)?'':' ';
 const lines=[];let line='';for(const word of words){const next=line?line+join+word:word;if(line&&measure(next)>width){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);return lines;
}
export function kit(p,lang){
 const L=(zh,en)=>lessonText(lang,zh,en);
 return {
  L,
  text:(x,y,zh,en,size=15,color='#242032',anchor='start')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${color}" font-weight="600">${esc(L(zh,en))}</text>`,
  box:(x,y,w,h,fill='#fffefb',dash=false)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${fill}" stroke="#292535" stroke-width="2" ${dash?'stroke-dasharray="6 5"':''}/>`,
  path:(d,color='#7967ac',dash=false,marker='dl-arrow')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" ${dash?'stroke-dasharray="6 6"':''} marker-end="url(#${marker})"/>`,
  group:(at,body)=>`<g opacity="${clamp((p-at)/.09)}">${body}</g>`,
  person:(x,y,color)=>`<g><circle cx="${x}" cy="${y-40}" r="14" fill="#fff8ef" stroke="#292535" stroke-width="2"/><rect x="${x-13}" y="${y-24}" width="26" height="38" rx="8" fill="${color}" stroke="#292535" stroke-width="2"/></g>`,
  lock:(x,y)=>`<g stroke="#b58a1f" stroke-width="2.5" fill="none"><rect x="${x-12}" y="${y-2}" width="24" height="20" rx="4"/><path d="M${x-7} ${y-2}v-6a7 7 0 0 1 14 0v6"/></g>`,
  face:(x,y,color,hair='#292535')=>`<g><rect x="${x-22}" y="${y+24}" width="44" height="28" rx="11" fill="${color}" stroke="#292535" stroke-width="2"/><circle cx="${x}" cy="${y}" r="21" fill="#fff8ef" stroke="#292535" stroke-width="2"/><path d="M${x-14} ${y-6}q4-17 14-17t14 17" fill="${hair}" opacity=".8"/><circle cx="${x-7}" cy="${y+3}" r="2" fill="#292535"/><circle cx="${x+7}" cy="${y+3}" r="2" fill="#292535"/><path d="M${x-6} ${y+11}q6 5 12 0" fill="none" stroke="#292535" stroke-width="2" stroke-linecap="round"/></g>`,
  phone:(x,y,scale=1)=>`<g transform="translate(${x} ${y}) scale(${scale})"><rect width="58" height="104" rx="12" fill="#fffefb" stroke="#292535" stroke-width="2.5"/><rect x="8" y="14" width="42" height="66" rx="5" fill="#f3eef9"/><path d="M18 27h22M18 38h22M18 49h14" stroke="#7967ac" stroke-width="2.5" stroke-linecap="round"/><circle cx="29" cy="92" r="4" fill="none" stroke="#292535" stroke-width="2"/></g>`,
  doc:(x,y,color='#fffefb',w=58,h=74)=>`<g transform="translate(${x} ${y})"><path d="M0 0h${w-16}l16 16v${h-16}H0z" fill="${color}" stroke="#292535" stroke-width="2"/><path d="M${w-16} 0v16h16" fill="none" stroke="#292535" stroke-width="2"/>${w<100&&h<100?`<path d="M10 28h${w-24}M10 38h${w-24}M10 48h${w-34}" stroke="#a49ab8" stroke-width="2.4" stroke-linecap="round"/>`:``}</g>`,
  db:(x,y,color='#c8b8e5')=>`<g><ellipse cx="${x}" cy="${y}" rx="30" ry="10" fill="${color}" stroke="#292535" stroke-width="2"/><path d="M${x-30} ${y}v44M${x+30} ${y}v44" stroke="#292535" stroke-width="2"/><path d="M${x-30} ${y+22}a30 10 0 0 0 60 0M${x-30} ${y+44}a30 10 0 0 0 60 0" fill="none" stroke="#292535" stroke-width="2"/></g>`,
  cloud:(x,y,color='#e6eef7')=>`<path d="M${x-40} ${y+18}a18 18 0 0 1 4-35 26 26 0 0 1 50-6 20 20 0 0 1 26 33 16 16 0 0 1-8 8z" fill="${color}" stroke="#292535" stroke-width="2"/>`,
  warn:(x,y,color='#d4a735')=>`<g><path d="M${x} ${y-22}l24 40h-48z" fill="#fff4d4" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/><path d="M${x} ${y-6}v10" stroke="${color}" stroke-width="3" stroke-linecap="round"/><circle cx="${x}" cy="${y+10}" r="2.4" fill="${color}"/></g>`,
  ok:(x,y,color='#34734b')=>`<circle cx="${x}" cy="${y}" r="14" fill="#e7f2e7" stroke="${color}" stroke-width="2.5"/><path d="M${x-6} ${y}l4 5 9-10" fill="none" stroke="${color}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>`,
  no:(x,y,color='#b96559')=>`<circle cx="${x}" cy="${y}" r="14" fill="#f9e8e2" stroke="${color}" stroke-width="2.5"/><path d="M${x-5} ${y-5}l10 10M${x+5} ${y-5}l-10 10" stroke="${color}" stroke-width="2.8" stroke-linecap="round"/>`,
  clock:(x,y,color='#7967ac')=>`<circle cx="${x}" cy="${y}" r="16" fill="#fffefb" stroke="${color}" stroke-width="2.5"/><path d="M${x} ${y-8}v8l6 4" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>`,
  lens:(x,y,color='#7967ac')=>`<g fill="none" stroke="${color}" stroke-width="3"><circle cx="${x}" cy="${y}" r="14"/><path d="M${x+10} ${y+10}l12 12" stroke-linecap="round"/></g>`,
  bot:(x,y,color='#c8b8e5')=>`<g><path d="M${x} ${y-34}v-10" stroke="#292535" stroke-width="2.5"/><circle cx="${x}" cy="${y-48}" r="4" fill="#d4a735" stroke="#292535" stroke-width="2"/><rect x="${x-28}" y="${y-28}" width="56" height="46" rx="12" fill="${color}" stroke="#292535" stroke-width="2"/><circle cx="${x-10}" cy="${y-8}" r="3.4" fill="#242032"/><circle cx="${x+10}" cy="${y-8}" r="3.4" fill="#242032"/><path d="M${x-9} ${y+5}q9 7 18 0" fill="none" stroke="#242032" stroke-width="2" stroke-linecap="round"/><rect x="${x-20}" y="${y+20}" width="40" height="26" rx="8" fill="#f3eef9" stroke="#292535" stroke-width="2"/></g>`,
  gear:(x,y,color='#7967ac')=>`<g stroke="${color}" stroke-width="2.6" fill="none">${[0,45,90,135].map(a=>`<path d="M${x} ${y-24}v6M${x} ${y+24}v-6" transform="rotate(${a} ${x} ${y})"/>`).join('')}<circle cx="${x}" cy="${y}" r="15"/><circle cx="${x}" cy="${y}" r="5"/></g>`,
  speech:(x,y,w,zh,en,fill='#fff4d4')=>{
   const lines=speechLines(L(zh,en),w-28),size=lines.length>2?11:13,spacing=size+2,start=y+23-(lines.length-1)*spacing/2;
   return `<g><rect x="${x}" y="${y}" width="${w}" height="46" rx="10" fill="${fill}" stroke="#292535" stroke-width="2"/><path d="M${x+24} ${y+46}l14 13v-13z" fill="${fill}" stroke="#292535" stroke-width="2"/><text x="${x+w/2}" y="${start}" dominant-baseline="middle" text-anchor="middle" font-size="${size}" fill="#242032" font-weight="600">${lines.map((line,i)=>`<tspan x="${x+w/2}" dy="${i?spacing:0}">${esc(line)}</tspan>`).join('')}</text></g>`;
  },
  chip:(x,y,w,zh,en,fill='#f3eef9',size=13)=>`<rect x="${x}" y="${y}" width="${w}" height="38" rx="9" fill="${fill}" stroke="#292535" stroke-width="2"/>${L?`<text x="${x+w/2}" y="${y+24}" text-anchor="middle" font-size="${size}" fill="#242032" font-weight="600">${esc(L(zh,en))}</text>`:''}`,
  arrowHead:(x,y,dir='right',color='#4a3a82')=>dir==='right'?`<path d="M${x-7} ${y-5}l7 5-7 5z" fill="${color}"/>`:`<path d="M${x+7} ${y-5}l-7 5 7 5z" fill="${color}"/>`
 };
}
export function frame(body,label,lang){
 return `<svg viewBox="0 0 720 360" role="img" aria-label="${esc(lessonText(lang,label[0],label[1]))}">${DEFS}${body}</svg>`;
}
