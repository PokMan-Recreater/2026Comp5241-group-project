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
 const n=Math.max(2,Math.min(5,it.length||2)),gap=n>3?14:22,w=(320-gap*(n-1))/n,size=n>3?9:12,y=70,h=96,cy=y+h/2;
 let s='';
 for(let i=0;i<n;i++){
  const x=20+i*(w+gap);
  s+=box(x,y,w,h,FILLS[i%FILLS.length]);
  s+=block(x+w/2,cy,wrap(it[i]||title,w-12,size,3),size);
  if(i<n-1)s+=arrow(`M${x+w} ${cy}h${gap-1}`,id);
 }
 return s+caption(title);
}
function compare(title,it){
 const size=10,cy=136;
 return box(20,52,150,138,'#e7f2e7')+box(190,52,150,138,'#f9e8e2')
  +txt(95,88,'✓',22,'#34734b')+txt(265,88,'✕',22,'#a64e44')
  +block(95,cy,wrap(it[0]||title,130,size,3),size,'#24553a')
  +block(265,cy,wrap(it[1]||'',130,size,3),size,'#7a3b32')
  +`<path d="M180 46V198" stroke="${INK}" stroke-width="2" stroke-dasharray="6 5"/>`
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
 const cond=clipLine(it[0]||title,104,10),a=clipLine(it[1]||'',104,10),b=clipLine(it[2]||'',104,10),res=clipLine(it[3]||'',104,10);
 let s=box(120,40,120,44,FILLS[0])+txt(180,67,cond)
  +`<path d="M180 84V110M180 110H95V134M180 110H265V134" stroke="${MUTED}" stroke-width="2" fill="none"/>`
  +box(35,134,120,44,FILLS[1])+txt(95,161,a,10)
  +box(205,134,120,44,FILLS[2])+txt(265,161,b,10);
 if(res)s+=box(120,192,120,32,FILLS[3])+txt(180,213,res,10);
 return s;
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
 const n=Math.max(2,Math.min(4,it.length)),w=84,gap=16,total=n*w+(n-1)*gap;
 let x=(360-total)/2,s='';
 for(let i=0;i<n;i++){
  s+=box(x,78,w,82,FILLS[i%FILLS.length])+block(x+w/2,119,wrap(it[i]||title,70,10,2),10);
  if(i<n-1)s+=`<path d="M${x+w} 119h${gap}" stroke="${INK}" stroke-width="2.5"/>`+`<circle cx="${x+w+gap/2}" cy="119" r="4" fill="${ACCENT}"/>`;
  x+=w+gap;
 }
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
const draw={flow,compare,timeline,cycle,layers,hub,decision,balance,network,chain,conversation,phone,document,database,robot};
export const SCENE_IDS=['auto',...Object.keys(draw)];
export function sceneArt(scene,items,opts={}){
 const list=(Array.isArray(items)?items:[]).map(String).filter(v=>v.trim());
 const title=String(opts.title||''),id='sr-'+(++seq);
 const chosen=draw[scene]?scene:selectScene({title,body:list.join(' '),sceneItems:list});
 const body=(draw[chosen]||flow)(title,list.length?list:[title||'…'],id);
 return `<svg class="tc-slide-illustration" viewBox="0 0 360 240" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(title)}"><defs><marker id="${id}" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto"><path d="M0 0L8 4 0 8" fill="${ACCENT}"/></marker></defs>${body}</svg>`;
}
