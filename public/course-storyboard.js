import {kit,frame} from './lesson-art-kit.js';
import {wrap} from './scene-render.js';
export const ACTOR_KINDS=['person','agent','phone','document','database','server','network','lock','chain','block'];
const bounded=(s,n)=>typeof s==='string'&&!!s.trim()&&s.length<=n;
const keys=(o,list)=>o&&typeof o==='object'&&!Array.isArray(o)&&Object.keys(o).every(k=>list.includes(k));
export function validStoryboard(s){
 if(!keys(s,['layout','context','actors','events','takeaway'])||!['process','conversation','before-after'].includes(s.layout)||!bounded(s.context,100)||!bounded(s.takeaway,100))return false;
 if(!Array.isArray(s.actors)||s.actors.length<2||s.actors.length>4||s.actors.some(a=>!keys(a,['kind','label'])||!ACTOR_KINDS.includes(a.kind)||!bounded(a.label,36)))return false;
 if(s.layout!=='process'&&s.actors.length!==2)return false;
 return Array.isArray(s.events)&&s.events.length>=(s.layout==='before-after'?1:2)&&s.events.length<=3&&s.events.every(e=>keys(e,['from','to','action','result','status'])&&Number.isInteger(e.from)&&Number.isInteger(e.to)&&e.from>=0&&e.to>=0&&e.from<s.actors.length&&e.to<s.actors.length&&bounded(e.action,36)&&bounded(e.result,64)&&['normal','success','warning','blocked'].includes(e.status));
}
const textBlock=(k,x,y,value,width,size=12,color='#292535',anchor='middle')=>wrap(value,width,size,5).map((line,i)=>k.text(x,y+i*(size+3),line,line,size,color,anchor)).join('');
function actorArt(k,a,x,y){
 switch(a.kind){
  case 'person':return k.face(x,y,'#bad7c2');
  case 'agent':return k.bot(x,y+8);
  case 'phone':return k.phone(x-22,y-34,.76);
  case 'document':return k.doc(x-24,y-30,'#fff4d4',48,62);
  case 'database':return k.db(x,y-16);
  case 'server':return k.box(x-30,y-30,60,66,'#e6eef7')+[0,1,2].map(i=>`<path d="M${x-18} ${y-14+i*17}h36" stroke="#7967ac" stroke-width="3"/>`).join('');
  case 'block':return k.box(x-25,y-24,50,50,'#e5def4')+`<path d="M${x-14} ${y-8}h28M${x-14} ${y+5}h28" stroke="#7967ac" stroke-width="2"/>`;
  case 'chain':return [-1,0,1].map(i=>k.box(x-12+i*27,y-16,24,34,'#e5def4')).join('')+`<path d="M${x-18} ${y}h3M${x+9} ${y}h3" stroke="#7967ac" stroke-width="2"/>`;
  case 'network':return [0,1,2].map((_,i)=>`<circle cx="${x+(i-1)*26}" cy="${y+(i%2?20:-10)}" r="12" fill="#e6eef7" stroke="#292535" stroke-width="2"/>`).join('')+`<path d="M${x-26} ${y-10}l26 30 26-30" fill="none" stroke="#7967ac" stroke-width="2"/>`;
  default:return k.lock(x,y);
 }
}
export function storyboardArt(story,progress=1,lang='zh-CN'){
 if(!validStoryboard(story))return '';
 const p=Math.max(0,Math.min(1,Number(progress)||0)),k=kit(p,lang),colors={normal:'#7967ac',success:'#34734b',warning:'#a17a21',blocked:'#b96559'};
 let body=textBlock(k,360,23,story.context,640,13);
 if(story.layout==='conversation'){
  body+=story.actors.map((a,i)=>actorArt(k,a,i?630:90,105)+textBlock(k,i?630:90,180,a.label,140,11)).join('');
  body+=story.events.map((ev,i)=>{
   const y=62+i*79,color=colors[ev.status],x=180;
   const value=ev.action+' — '+ev.result,lines=wrap(value,372,12,5),start=y+(62-lines.length*15)/2+12;
   return k.group(.12+i*.27,`<path d="M${ev.from?600:120} ${y+28}H${ev.from?568:152}" fill="none" stroke="${color}" stroke-width="2"/>`+k.box(x-20,y,400,62,ev.status==='blocked'?'#f9e8e2':'#fff4d4')+lines.map((line,j)=>k.text(360,start+j*15,line,line,12,'#292535','middle')).join(''));
  }).join('');
 }else{
  const xs=story.actors.map((_,i)=>story.layout==='before-after'?[188,532][i]:90+i*540/(story.actors.length-1));
  if(story.layout==='before-after')body+=k.box(38,60,300,132,'#f9e8e2')+k.box(382,60,300,132,'#e7f2e7');
  body+=story.actors.map((a,i)=>actorArt(k,a,xs[i],105)+textBlock(k,xs[i],172,a.label,story.layout==='before-after'?260:144,11)).join('');
  const active=Math.min(story.events.length-1,Math.max(0,Math.floor((p-.12)/.27))),ev=story.events[active];
  const from=xs[ev.from],to=xs[ev.to],sign=to>from?1:-1;
  const connection=from===to?`M${from+36} 100C${from+80} 52 ${from-70} 52 ${from-36} 100`:Math.abs(ev.to-ev.from)>1?`M${from+sign*34} 96C${from+sign*50} 54 ${to-sign*50} 54 ${to-sign*34} 96`:`M${from+sign*40} 110H${to-sign*40}`;
  body+=k.group(.12, k.path(connection,colors[ev.status]));
  body+=story.events.map((event,i)=>{
   const y=218+i*36,color=colors[event.status],symbol=event.status==='blocked'?k.no(42,y+2):event.status==='warning'?`<g transform="translate(42 ${y+2}) scale(.55)">${k.warn(0,0)}</g>`:event.status==='success'?k.ok(42,y+2):`<circle cx="42" cy="${y+2}" r="12" fill="#f3eef9" stroke="${color}" stroke-width="2"/>${k.text(42,y+6,String(i+1),String(i+1),10,color,'middle')}`;
   return k.group(.12+i*.27,symbol+textBlock(k,68,y,event.action,218,11,color,'start')+textBlock(k,318,y,event.result,350,11,'#665e72','start'));
  }).join('');
 }
 body+=k.group(.9,textBlock(k,360,338,story.takeaway,650,12,'#665e72'));
 return frame(body,[story.context,story.context],lang);
}

export function storyboardProblems(s){
 if(validStoryboard(s))return [];
 if(!s||typeof s!=='object')return ['story is missing'];
 const problems=[];
 if(!['process','conversation','before-after'].includes(s.layout))problems.push('story.layout must be process, conversation or before-after (not a scene name)');
 if(!Array.isArray(s.actors)||s.actors.length<2||s.actors.length>4||(s.layout!=='process'&&s.actors.length!==2))problems.push('story needs 2-4 actors; conversation and before-after require exactly 2');
 if(!Array.isArray(s.events)||s.events.length<(s.layout==='before-after'?1:2)||s.events.length>3)problems.push('story.events must contain 2-3 causal actions (before-after may use 1-3)');
 for(const [i,e] of (Array.isArray(s.events)?s.events:[]).entries()){
  if(!Number.isInteger(e.from)||!Number.isInteger(e.to)||e.from<0||e.to<0||e.from>=s.actors?.length||e.to>=s.actors?.length)problems.push('story.events['+i+'] actor indices must refer to existing actors');
  if(!bounded(e.action,36)||!bounded(e.result,64))problems.push('story.events['+i+'] action/result are required; limits are 36 chars for action and 64 for result');
 }
 return problems.length?problems:['story has invalid fields, actor kinds, lengths or status values'];
}
