// Semantic slide illustrations. Each scene is a fixed SVG composition that only
// takes short text labels, so model output can never become executable drawing code.
import {selectScene} from './teaching-scene-catalog.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const INK='#292535',MUTED='#665e72',ACCENT='#7967ac';
const FILLS=['#f4e9bf','#dceada','#e5def4','#dbe6ef','#f5dfd9','#fff4d4','#f1ecfa'];
let seq=0;
const wide=c=>/[ᄀ-ᅟ⺀-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]/.test(c);
const measure=(v,size)=>Array.from(String(v??'')).reduce((w,c)=>w+(wide(c)?size:size*0.56),0);
// Greedy line breaking by rendered width: keeps English words whole, breaks CJK by
// character, and only ellipsizes when even maxLines cannot hold the text.
export function wrap(value,maxWidth,size,maxLines=3){
 const text=String(value??'').replace(/\s+/g,' ').trim();
 if(!text)return [];
 const spaced=text.includes(' ');
 const tokens=spaced?text.split(' '):Array.from(text),sep=spaced?' ':'';
 const lines=[];let line='';
 const push=()=>{if(line){lines.push(line);line='';}};
 for(const raw of tokens){
  let token=raw;
  while(measure(token,size)>maxWidth){
   let cut='';
   for(const c of Array.from(token)){
    if(cut&&measure(cut+c,size)>maxWidth)break;
    cut+=c;
   }
   if(!cut)cut=Array.from(token)[0];
   push();lines.push(cut);token=token.slice(cut.length);
  }
  if(!token)continue;
  const candidate=line?line+sep+token:token;
  if(measure(candidate,size)<=maxWidth)line=candidate;
  else{push();line=token;}
 }
 push();
 if(lines.length>maxLines){
  const kept=lines.slice(0,maxLines);
  let last=kept[kept.length-1];
  while(last&&measure(last+'…',size)>maxWidth)last=Array.from(last).slice(0,-1).join('');
  kept[kept.length-1]=last+'…';
  return kept;
 }
 return lines;
}
const clipLine=(value,maxWidth,size)=>wrap(value,maxWidth,size,1)[0]||'';
const txt=(x,y,t,size=11,color=INK,anchor='middle',weight=600)=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" fill="${color}" font-weight="${weight}">${esc(t)}</text>`;
const box=(x,y,w,h,fill)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" stroke="${INK}" stroke-width="1.8"/>`;
const arrow=(d,id,color=ACCENT)=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" marker-end="url(#${id})"/>`;
const block=(x,centerY,lines,size,color=INK,weight=600)=>{
 const step=Math.round(size*1.35);
 return lines.map((line,j)=>txt(x,centerY+(j-(lines.length-1)/2)*step+size*0.34,line,size,color,'middle',weight)).join('');
};
const caption=title=>{
 const lines=wrap(title,320,11,2);
 return lines.map((line,j)=>txt(180,lines.length>1?214+j*14:220,line,11,MUTED,'middle',500)).join('');
};

function flow(title,it,id){
 const n=Math.max(2,Math.min(5,it.length||2)),rows=n>3?2:1,cols=rows===2?Math.ceil(n/2):n,r=rows===2?24:32,size=rows===2?8:9.5;
 const colW=rows===2?(cols===3?120:140):300/n,maxW=rows===2?colW-12:86,centers=[];
 for(let i=0;i<n;i++){
  const row=Math.floor(i/cols),col=i%cols,count=row===0?cols:n-cols;
  const offset=180-count*colW/2;
  centers.push([offset+col*colW+colW/2,rows===2?(row===0?74:160):106]);
 }
 let s='';
 centers.forEach(([x,y],i)=>{
  s+=`<circle cx="${x}" cy="${y}" r="${r}" fill="${FILLS[i%FILLS.length]}" stroke="${INK}" stroke-width="1.8"/>`
   +txt(x,y+4,String(i+1),r>28?13:10);
  wrap(it[i]||title,maxW,size,rows===2?2:3).forEach((line,j)=>s+=txt(x,y+r+15+j*Math.round(size*1.3),line,size));
 });
 for(let i=0;i<n-1;i++){
  const [x1,y1]=centers[i],[x2,y2]=centers[i+1];
  s+=y1===y2?arrow(`M${x1+r+2} ${y1}H${x2-r-2}`,id):arrow(`M${x1} ${y1+r+2}C${x1} ${(y1+y2)/2-12} ${x2} ${(y1+y2)/2-12} ${x2} ${y2-r-2}`,id);
 }
 return s+caption(title);
}

function compare(title,it){
 const size=10,left=wrap(it[0]||title,110,size,3),right=wrap(it[1]||'',110,size,3);
 return `<circle cx="106" cy="116" r="72" fill="#e7f2e7" stroke="${INK}" stroke-width="1.8"/>`
  +`<circle cx="254" cy="116" r="72" fill="#f9e8e2" stroke="${INK}" stroke-width="1.8"/>`
  +txt(106,72,'✓',20,'#34734b')+txt(254,72,'✕',20,'#a64e44')
  +block(106,126,left,size,'#24553a')+block(254,126,right,size,'#7a3b32')
  +`<path d="M180 40V196" stroke="${INK}" stroke-width="2" stroke-dasharray="6 5"/>`
  +caption(title);
}
function timeline(title,it){
 const n=Math.max(2,Math.min(5,it.length)),step=280/(n-1||1),size=9;
 let s=`<path d="M30 128H330" stroke="${INK}" stroke-width="2.5"/>`;
 for(let i=0;i<n;i++){
  const x=40+i*step,up=i%2===0,lines=wrap(it[i]||title,64,size,3);
  s+=`<circle cx="${x}" cy="128" r="9" fill="${FILLS[i%FILLS.length]}" stroke="${INK}" stroke-width="2"/>`;
  lines.forEach((line,j)=>s+=txt(x,up?100-(lines.length-1-j)*14:158+j*14,line,size));
 }
 return s+caption(title);
}
function cycle(title,it){
 const n=Math.max(2,Math.min(5,it.length)),cx=180,cy=120,r=62,size=9;
 let s=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${MUTED}" stroke-width="1.5" stroke-dasharray="4 5"/>`;
 for(let i=0;i<n;i++){
  const a=-Math.PI/2+i*2*Math.PI/n,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
  const lines=wrap(it[i]||title,64,size,3),lx=x+Math.cos(a)*36,ly=y+Math.sin(a)*36+3;
  s+=`<circle cx="${x}" cy="${y}" r="21" fill="${FILLS[i%FILLS.length]}" stroke="${INK}" stroke-width="1.8"/>`;
  lines.forEach((line,j)=>s+=txt(lx,ly+(j-(lines.length-1)/2)*11,line,size));
 }
 s+=`<path d="M${cx+r-6} ${cy-16}a10 10 0 0 1-2 16" fill="none" stroke="${ACCENT}" stroke-width="2.5" stroke-linecap="round"/>`
  +`<path d="M${cx+r-7} ${cy+4}l1-8 7 3z" fill="${ACCENT}"/>`;
 return s;
}
function layers(title,it){
 const n=Math.max(2,Math.min(4,it.length));
 let s='';
 for(let i=0;i<n;i++){
  const w=220-i*26,x=180-w/2,y=58+i*38;
  s+=`<rect x="${x}" y="${y}" width="${w}" height="30" rx="8" fill="${FILLS[i%FILLS.length]}" stroke="${INK}" stroke-width="1.8"/>`
   +txt(180,y+20,clipLine(it[i]||title,w-20,11),11);
 }
 return s+caption(title);
}
function hub(title,it){
 const cx=180,cy=112,pts=[[cx-112,cy-50],[cx+112,cy-50],[cx-112,cy+58],[cx+112,cy+58],[cx,cy-84]];
 const n=Math.min(5,it.length);
 let s=`<circle cx="${cx}" cy="${cy}" r="36" fill="${FILLS[4]}" stroke="${INK}" stroke-width="2"/>`+block(cx,cy,wrap(title,64,8,3),8);
 for(let i=0;i<n;i++){
  const [x,y]=pts[i];
  s+=`<path d="M${cx} ${cy}L${x} ${y}" stroke="${ACCENT}" stroke-width="1.5" opacity=".55"/>`
   +`<circle cx="${x}" cy="${y}" r="26" fill="${FILLS[i%FILLS.length]}" stroke="${INK}" stroke-width="1.8"/>`
   +block(x,y,wrap(it[i],50,8,3),8);
 }
 return s;
}
function decision(title,it){
 const cond=wrap(it[0]||title,106,10,2),a=wrap(it[1]||'',68,9,2),b=wrap(it[2]||'',68,9,2),res=it[3]||'';
 let s=`<path d="M180 22L258 62L180 102L102 62Z" fill="${FILLS[0]}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`
  +block(180,62,cond,10)
  +`<path d="M180 102V116H90M180 116H270" stroke="${MUTED}" stroke-width="2" fill="none"/>`
  +`<circle cx="90" cy="152" r="36" fill="${FILLS[1]}" stroke="${INK}" stroke-width="1.8"/>`
  +`<circle cx="270" cy="152" r="36" fill="${FILLS[2]}" stroke="${INK}" stroke-width="1.8"/>`
  +txt(90,131,'✓',14,'#34734b')+txt(270,131,'✕',14,'#a64e44')
  +block(90,157,a,9)+block(270,157,b,9);
 if(res){
  const w=Math.min(236,Math.round(measure(res,10))+28);
  s+=`<path d="M${180-w/2} 186H${180+w/2}L${180+w/2+9} 197L${180+w/2} 208H${180-w/2}L${180-w/2-9} 197Z" fill="${FILLS[3]}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`
   +txt(180,200.5,res,10);
 }
 return s+caption(title);
}
function balance(title,it){
 return `<path d="M120 188L180 96L240 188Z" fill="${FILLS[0]}" stroke="${INK}" stroke-width="2"/>`
  +`<path d="M60 96H300" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`
  +`<circle cx="180" cy="96" r="7" fill="${INK}"/>`
  +`<path d="M60 96V112M300 96V112" stroke="${INK}" stroke-width="2"/>`
  +`<path d="M30 124a30 15 0 0 0 60 0M270 124a30 15 0 0 0 60 0" fill="none" stroke="${INK}" stroke-width="2"/>`
  +block(60,158,wrap(it[0]||title,110,10,2),10)+block(300,158,wrap(it[1]||'',110,10,2),10)
  +caption(title);
}
function network(title,it){
 const n=Math.max(2,Math.min(5,it.length)),pts=[[80,70],[280,70],[180,112],[70,182],[290,182]];
 const links=[[0,3],[1,4],[3,4],[0,2],[1,2],[2,3],[2,4]].filter(([,b])=>b<n);
 let s='';
 for(const [a,b] of links){const [x1,y1]=pts[a],[x2,y2]=pts[b];s+=`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${ACCENT}" stroke-width="1.4" opacity=".45"/>`;}
 for(let i=0;i<n;i++){const [x,y]=pts[i];s+=`<circle cx="${x}" cy="${y}" r="24" fill="${FILLS[i%FILLS.length]}" stroke="${INK}" stroke-width="1.8"/>`+block(x,y,wrap(it[i]||title,46,8,3),8);}
 return s+caption(title);
}
function chain(title,it){
 const n=Math.max(2,Math.min(4,it.length)),step=54,x0=180-(n-1)*step/2,cy=102;
 let s='';
 for(let i=0;i<n;i++){
  const x=x0+i*step;
  s+=`<g transform="rotate(${i%2?-9:9} ${x} ${cy})"><ellipse cx="${x}" cy="${cy}" rx="38" ry="25" fill="none" stroke="${INK}" stroke-width="6"/></g>`;
 }
 for(let i=0;i<n;i++)s+=block(x0+i*step,164,wrap(it[i]||title,76,9,3),9);
 return s+caption(title);
}
const person=(x,y,color)=>`<circle cx="${x}" cy="${y-24}" r="12" fill="#fff8ef" stroke="${INK}" stroke-width="1.8"/><rect x="${x-13}" y="${y-10}" width="26" height="34" rx="8" fill="${color}" stroke="${INK}" stroke-width="1.8"/>`;
const sheet=(x,y,w,h,fill)=>`<path d="M${x} ${y}h${w-14}l14 14v${h-14}H${x}z" fill="${fill}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M${x+w-14} ${y}v14h14" fill="none" stroke="${INK}" stroke-width="1.8"/><path d="M${x+10} ${y+28}h${w-26}M${x+10} ${y+38}h${w-26}M${x+10} ${y+48}h${w-36}" stroke="${MUTED}" stroke-width="2" stroke-linecap="round"/>`;
function conversation(title,it){
 const say=(x,w,text,fill)=>{const lines=wrap(text||title,w-16,9,2);return box(x,22,w,56,fill)+block(x+w/2,50,lines,9);};
 let s=say(14,152,it[0],FILLS[0])+say(194,152,it[1],FILLS[1])
  +`<path d="M96 78l-8 22 20-22z" fill="${FILLS[0]}" stroke="${INK}" stroke-width="1.6"/>`
  +`<path d="M246 78l14 20-2-20z" fill="${FILLS[1]}" stroke="${INK}" stroke-width="1.6"/>`
  +person(70,148,FILLS[3])+person(290,148,FILLS[4]);
 const extra=it.slice(2,5);
 if(extra.length){
  const w=Math.min(104,(320-extra.length*8)/extra.length),x0=(360-(w*extra.length+8*(extra.length-1)))/2;
  extra.forEach((t,i)=>{const x=x0+i*(w+8);s+=box(x,172,w,24,'#fffdf6')+txt(x+w/2,188,clipLine(t,w-12,8.5),8.5);});
 }
 return s+caption(title);
}
function phone(title,it){
 const n=Math.max(2,Math.min(5,it.length)),start=46,step=Math.min(30,Math.floor(140/n));
 let s=`<rect x="24" y="30" width="88" height="164" rx="14" fill="#fffefb" stroke="${INK}" stroke-width="2.2"/><rect x="32" y="44" width="72" height="130" rx="6" fill="#f3eef9" stroke="${INK}" stroke-width="1.2"/><circle cx="68" cy="64" r="9" fill="${FILLS[1]}" stroke="${INK}" stroke-width="1.6"/>`
  +[86,98,110,122].map((y,i)=>`<path d="M44 ${y}h${i===2?32:52}" stroke="${MUTED}" stroke-width="2.4" stroke-linecap="round"/>`).join('')
  +`<circle cx="68" cy="184" r="3.5" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
 s+=`<path d="M144 ${start+step/2}V${start+step*(n-.5)}" stroke="${MUTED}" stroke-width="1.5" stroke-dasharray="4 4"/>`;
 for(let i=0;i<n;i++){
  const cy=start+step*(i+.5);
  s+=`<circle cx="144" cy="${cy}" r="8" fill="${FILLS[i%FILLS.length]}" stroke="${INK}" stroke-width="1.5"/>`+txt(144,cy+3,String(i+1),8)
   +txt(160,cy+3,clipLine(it[i]||title,182,10),10,INK,'start');
 }
 return s+caption(title);
}
function document(title,it,id){
 const n=Math.max(2,Math.min(3,it.length)),w=56,gap=26,total=n*w+(n-1)*gap;let x=(360-total)/2,s='';
 for(let i=0;i<n;i++){
  s+=sheet(x,52,w,68,FILLS[i%FILLS.length])+block(x+w/2,158,wrap(it[i]||title,86,9,2),9);
  if(i<n-1)s+=`<path d="M${x+w+3} 86h${gap-6}" stroke="${ACCENT}" stroke-width="2" stroke-linecap="round" marker-end="url(#${id})"/>`;
  x+=w+gap;
 }
 return s+caption(title);
}
function database(title,it,id){
 const labels=[it[0]||title,it[1]||'',it[2]||''];
 const client=`<rect x="16" y="58" width="98" height="70" rx="10" fill="${FILLS[3]}" stroke="${INK}" stroke-width="1.8"/><path d="M16 74h98" stroke="${INK}" stroke-width="1.4"/><circle cx="26" cy="66" r="2.4" fill="${INK}"/><circle cx="34" cy="66" r="2.4" fill="${INK}"/>`
  +block(65,101,wrap(labels[0],84,9,2),9);
 const server=`<rect x="132" y="58" width="92" height="70" rx="10" fill="${FILLS[1]}" stroke="${INK}" stroke-width="1.8"/>`+block(178,93,wrap(labels[1],78,9,2),9);
 const db=`<ellipse cx="290" cy="72" rx="30" ry="10" fill="${FILLS[2]}" stroke="${INK}" stroke-width="1.8"/><path d="M260 72v42M320 72v42" stroke="${INK}" stroke-width="1.8"/><path d="M260 93a30 10 0 0 0 60 0M260 114a30 10 0 0 0 60 0" fill="none" stroke="${INK}" stroke-width="1.8"/>`+block(290,148,wrap(labels[2],84,9,2),9);
 return client+server+db+arrow('M114 93h14',id)+arrow('M224 93h32',id)+caption(title);
}
function robot(title,it){
 const n=Math.max(2,Math.min(5,it.length)),step=Math.min(30,Math.floor(140/n)),start=56;
 let s=`<path d="M76 92V80" stroke="${INK}" stroke-width="2"/><circle cx="76" cy="76" r="4" fill="#d4a735" stroke="${INK}" stroke-width="1.6"/><rect x="46" y="92" width="60" height="48" rx="12" fill="#c8b8e5" stroke="${INK}" stroke-width="1.8"/><circle cx="64" cy="110" r="3.2" fill="${INK}"/><circle cx="88" cy="110" r="3.2" fill="${INK}"/><path d="M64 122q12 8 24 0" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/><rect x="54" y="146" width="44" height="28" rx="8" fill="${FILLS[2]}" stroke="${INK}" stroke-width="1.8"/>`;
 for(let i=0;i<n;i++){
  const cy=start+step*(i+.5);
  s+=`<path d="M106 116L146 ${cy}" stroke="${MUTED}" stroke-width="1.2" stroke-dasharray="3 4" opacity=".6"/>`
   +box(150,cy-12,192,24,FILLS[i%FILLS.length])+txt(246,cy+3,clipLine(it[i]||title,178,9),9);
 }
 return s+caption(title);
}
function venn(title,it){
 const left=wrap(it[0]||title,76,9,3),right=wrap(it[1]||'',76,9,3),shared=it[2]?wrap(it[2],56,8,2):[];
 return `<circle cx="142" cy="112" r="66" fill="${FILLS[0]}" fill-opacity=".78" stroke="${INK}" stroke-width="1.8"/>`
  +`<circle cx="218" cy="112" r="66" fill="${FILLS[3]}" fill-opacity=".74" stroke="${INK}" stroke-width="1.8"/>`
  +block(112,112,left,9)+block(248,112,right,9)+block(180,112,shared,8)
  +caption(title);
}
function quadrant(title,it){
 const cells=[[28,44],[190,44],[28,138],[190,138]],size=9;
 let s=`<path d="M180 34V206M20 122H340" stroke="${MUTED}" stroke-width="1.5" stroke-dasharray="5 5"/>`;
 cells.forEach(([x,y],i)=>{s+=box(x,y,142,70,FILLS[i%FILLS.length])+block(x+71,y+35,wrap(it[i]||'—',122,size,2),size);});
 return s+caption(title);
}
function stairs(title,it){
 const n=Math.max(2,Math.min(5,it.length)),w=Math.min(56,290/n),x0=(360-n*w)/2,size=8;
 let s=`<path d="M20 198H340" stroke="${INK}" stroke-width="2"/>`;
 for(let i=0;i<n;i++){
  const h=44+i*(104/Math.max(1,n-1)),x=x0+i*w,y=198-h;
  s+=`<rect x="${x+2}" y="${y}" width="${w-4}" height="${h}" rx="7" fill="${FILLS[i%FILLS.length]}" stroke="${INK}" stroke-width="1.8"/>`
   +block(x+w/2,y+h/2,wrap(it[i]||title,w-10,size,3),size);
 }
 return s+caption(title);
}
function funnel(title,it){
 const n=Math.max(2,Math.min(3,it.length)),top=42,h=44,gap=8,size=10;
 const widths=n===3?[280,196,118]:[280,160];
 let s='';
 for(let i=0;i<n;i++){
  const tw=widths[i],bw=widths[i+1]??widths[i]*0.55,y=top+i*(h+gap);
  s+=`<path d="M${180-tw/2} ${y}H${180+tw/2}L${180+bw/2} ${y+h}H${180-bw/2}Z" fill="${FILLS[i%FILLS.length]}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`
   +block(180,y+h/2,wrap(it[i]||title,tw-18,size,2),size);
 }
 return s+caption(title);
}
function pyramid(title,it){
 const n=Math.max(2,Math.min(3,it.length)),levels=n===3?[[112,46],[178,96],[244,146]]:[[150,58],[230,118]];
 let s='';
 levels.forEach(([w,y],i)=>{
  const h=44,bw=w*0.68;
  s+=`<path d="M${180-bw/2} ${y}H${180+bw/2}L${180+w/2} ${y+h}H${180-w/2}Z" fill="${FILLS[i%FILLS.length]}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`
   +block(180,y+h/2,wrap(it[i]||title,w-22,9,2),9);
 });
 return s+caption(title);
}
function tree(title,it){
 const children=it.slice(1,4),n=Math.max(1,children.length),spots=n===3?[74,180,286]:n===2?[110,250]:[180],busY=112;
 let s=`<circle cx="180" cy="52" r="33" fill="${FILLS[4]}" stroke="${INK}" stroke-width="2"/>`
  +block(180,52,wrap(it[0]||title,52,9,3),9)
  +`<path d="M180 85V${busY}${n>1?`M${spots[0]} ${busY}H${spots[n-1]}`:''}" stroke="${MUTED}" stroke-width="1.8" fill="none"/>`;
 children.forEach((c,i)=>{const x=spots[i];s+=`<path d="M${x} ${busY}V136" stroke="${MUTED}" stroke-width="1.8"/>`+`<circle cx="${x}" cy="172" r="36" fill="${FILLS[i%FILLS.length]}" stroke="${INK}" stroke-width="1.8"/>`+block(x,172,wrap(c,56,9,3),9);});
 return s+caption(title);
}
function target(title,it){
 const cx=180,cy=112,spots=[[180,26],[86,176],[274,176]];
 let s=`<circle cx="${cx}" cy="${cy}" r="76" fill="${FILLS[3]}" fill-opacity=".35" stroke="${INK}" stroke-width="1.6"/>`
  +`<circle cx="${cx}" cy="${cy}" r="52" fill="${FILLS[1]}" fill-opacity=".6" stroke="${INK}" stroke-width="1.6"/>`
  +`<circle cx="${cx}" cy="${cy}" r="28" fill="${FILLS[0]}" stroke="${INK}" stroke-width="1.8"/>`
  +block(cx,cy,wrap(it[0]||title,46,8,2),8);
 for(let i=1;i<Math.min(4,it.length);i++){const [x,y]=spots[i-1];s+=txt(x,y,clipLine(it[i],92,8),8);}
 return s+caption(title);
}
function shield(title,it){
 const n=Math.max(2,Math.min(4,it.length)),step=Math.min(35,140/n),start=64;
 let s=`<path d="M70 54H150V122C150 158 124 178 110 186C96 178 70 158 70 122Z" fill="${FILLS[3]}" stroke="${INK}" stroke-width="2"/>`
  +`<path d="M92 118l12 12 24-26" fill="none" stroke="#34734b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
 for(let i=0;i<n;i++){const y=start+step*i;s+=`<circle cx="172" cy="${y}" r="4" fill="${ACCENT}"/>`+txt(184,y+3,clipLine(it[i]||title,156,9),9,INK,'start');}
 return s+caption(title);
}
function chart(title,it){
 const n=Math.max(2,Math.min(5,it.length)),barW=Math.min(26,120/n),gap=8,x0=42,baseline=186,heights=[70,104,84,132,112];
 let s=`<path d="M32 ${baseline}H210M32 ${baseline}V44" stroke="${INK}" stroke-width="2"/>`;
 for(let i=0;i<n;i++){
  const h=heights[i%heights.length],x=x0+i*(barW+gap),y=baseline-h,ly=56+i*(130/Math.max(1,n-1));
  s+=`<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="6" fill="${FILLS[i%FILLS.length]}" stroke="${INK}" stroke-width="1.6"/>`
   +`<path d="M${x+barW} ${y+4}H218" stroke="${MUTED}" stroke-width="1" stroke-dasharray="3 3"/>`
   +`<circle cx="218" cy="${ly-3}" r="3.5" fill="${ACCENT}"/>`+txt(228,ly,clipLine(it[i]||title,120,8),8,INK,'start');
 }
 return s+caption(title);
}
function puzzle(title,it){
 const n=Math.max(2,Math.min(3,it.length)),w=88,h=88,gap=18,total=n*w+(n-1)*gap,x0=(360-total)/2,y=74;
 let s='';
 for(let i=0;i<n;i++){
  const x=x0+i*(w+gap),f=FILLS[i%FILLS.length];
  s+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${f}" stroke="${INK}" stroke-width="1.8"/>`;
  if(i<n-1)s+=`<circle cx="${x+w}" cy="${y+h/2}" r="12" fill="${f}" stroke="${INK}" stroke-width="1.8"/>`;
  s+=block(x+w/2,y+h/2,wrap(it[i]||title,w-18,9,3),9);
 }
 return s+caption(title);
}
function iceberg(title,it){
 const n=Math.max(2,Math.min(4,it.length));
 let s=`<path d="M20 128H240" stroke="#7a9cb8" stroke-width="2.5" stroke-dasharray="7 5"/>`
  +`<path d="M100 128L136 58L172 128Z" fill="${FILLS[3]}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`
  +`<path d="M74 128H198L238 206H34Z" fill="${FILLS[1]}" fill-opacity=".72" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>`
  +`<path d="M176 100H242" stroke="${MUTED}" stroke-width="1" stroke-dasharray="3 3"/>`
  +`<circle cx="246" cy="97" r="3.5" fill="${ACCENT}"/>`+txt(256,100,clipLine(it[0]||title,96,8),8,INK,'start');
 for(let i=1;i<n;i++){const y=146+(i-1)*20;s+=`<circle cx="246" cy="${y-3}" r="3.5" fill="${ACCENT}"/>`+txt(256,y,clipLine(it[i],96,8),8,INK,'start');}
 return s+caption(title);
}
function bridge(title,it){
 const n=Math.max(2,Math.min(4,it.length));
 let s=`<path d="M0 206Q30 198 60 206T120 206T180 206T240 206T300 206T360 206" fill="none" stroke="#9fb9cf" stroke-width="2"/>`
  +`<path d="M0 198C10 148 46 130 94 140C128 147 150 168 158 198Z" fill="${FILLS[1]}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`
  +`<path d="M360 198C350 148 314 130 266 140C232 147 210 168 202 198Z" fill="${FILLS[2]}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`
  +`<path d="M128 152C150 92 210 92 232 152" fill="none" stroke="${INK}" stroke-width="2.5"/>`
  +`<path d="M124 152H236" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`
  +`<path d="M156 120V152M180 106V152M204 120V152" stroke="${INK}" stroke-width="1.6"/>`;
 s+=block(60,176,wrap(it[0]||title,84,8.5,2),8.5)+block(300,176,wrap(it[1]||'',84,8.5,2),8.5);
 for(let i=2;i<n;i++)s+=block(180,i===2?62:38,wrap(it[i],200,8,2),8,MUTED,500);
 return s+caption(title);
}
const draw={flow,compare,timeline,cycle,layers,hub,decision,balance,network,chain,conversation,phone,document,database,robot,venn,quadrant,stairs,funnel,pyramid,tree,target,shield,chart,puzzle,iceberg,bridge};
export const SCENE_IDS=['auto',...Object.keys(draw)];
export function sceneArt(scene,items,opts={}){
 const list=(Array.isArray(items)?items:[]).map(String).filter(v=>v.trim());
 const title=String(opts.title||''),id='sr-'+(++seq);
 const chosen=draw[scene]?scene:selectScene({title,body:list.join(' '),sceneItems:list});
 const body=(draw[chosen]||flow)(title,list.length?list:[title||'…'],id);
 return `<svg class="tc-slide-illustration" viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(title)}"><defs><marker id="${id}" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0 0L8 4 0 8" fill="${ACCENT}"/></marker></defs>${body}</svg>`;
}
