// Split lesson prose into deck pages. Markdown headings, colon-led titles and
// numbered lists become short page headings plus compressed bullet points.
const compress=(text,max)=>{
 const t=String(text||'').replace(/\*\*/g,'').replace(/\s+/g,' ').trim();
 if(Array.from(t).length<=max)return t;
 const cut=Array.from(t).slice(0,max).join('');
 const at=Math.max(cut.lastIndexOf('，'),cut.lastIndexOf(','),cut.lastIndexOf('；'),cut.lastIndexOf(';'),cut.lastIndexOf('：'),cut.lastIndexOf(':'),cut.lastIndexOf(' '));
 return (at>max*.5?cut.slice(0,at):cut).trim()+'…';
};
const hasLetters=text=>/[\p{L}]/u.test(String(text||''));
const splitSentences=line=>{
 const parts=[];
 for(const chunk of line.match(/[^。！？!?]+[。！？!?]*/g)||[])for(const piece of chunk.match(/[^.]+(?:\.(?=\s|$))?/g)||[])parts.push(piece.trim());
 return parts.filter(Boolean);
};
// Only short, title-like phrases may become a page heading. Full sentences
// always stay as bullets, which avoids headings cut off mid-sentence.
const canTitle=text=>{const n=Array.from(String(text||'')).length;return n>=2&&n<=34&&!/[.!?。！？,，;；:：]$/.test(String(text||''));};
function tokensOf(text){
 const tokens=[];
 for(const raw of text.split('\n')){
  const line=raw.trim();
  if(!line){tokens.push({type:'break'});continue;}
  const markdown=line.match(/^#{1,3}\s+(.+)$/)||line.match(/^\*\*([^*]+)\*\*\s*$/);
  if(markdown){tokens.push({type:'heading',text:markdown[1]});continue;}
  const listed=line.match(/^(?:\d+[.、)]|[-*•])\s*(.+)$/);
  if(listed){tokens.push({type:'item',text:listed[1]});continue;}
  if(Array.from(line).length<=40&&/[:：]$/.test(line)){tokens.push({type:'heading',text:line});continue;}
  for(const sentence of splitSentences(line)){const t=sentence.trim();if(t)tokens.push({type:'text',text:t});}
 }
 return tokens;
}
export function lessonSlides(body){
 const text=String(body??'').replace(/\r\n?/g,'\n').trim();
 if(!text)return[{heading:'',bullets:''}];
 const tokens=tokensOf(text);
 const pages=[];let page={heading:'',bullets:[]};
 const flush=()=>{if(page.heading||page.bullets.length)pages.push({heading:page.heading,bullets:page.bullets.join('\n')});page={heading:'',bullets:[]};};
 const addBullet=text=>{
  const clean=String(text||'').replace(/\*\*/g,'').trim();
  if(!hasLetters(clean))return;
  const titled=clean.match(/^([^:：]{2,26})[:：]\s*(.+)$/);
  if(titled){flush();page.heading=compress(titled[1],26);addBullet(titled[2]);return;}
  if(!page.heading&&canTitle(clean)){page.heading=compress(clean,26);return;}
  if(page.bullets.length>=4){flush();if(canTitle(clean)){page.heading=compress(clean,26);return;}}
  page.bullets.push('• '+compress(clean,64));
 };
 for(const token of tokens){
  if(token.type==='break'){if(page.bullets.length)flush();continue;}
  if(token.type==='heading'){flush();page.heading=compress(token.text,26);continue;}
  for(const piece of Array.from(token.text).length<=160?[token.text]:token.text.split(/(?<=[，,；;：:])\s*/))addBullet(piece);
 }
 flush();
 if(!pages.length)return[{heading:'',bullets:''}];
 if(pages.length>30){
  const flat=pages.flatMap(p=>[p.heading,...String(p.bullets||'').split('\n').map(b=>b.replace(/^•\s*/,''))]).filter(hasLetters);
  const per=Math.ceil(flat.length/30),capped=[];
  for(let i=0;i<flat.length;i+=per){
   const group=flat.slice(i,i+per),head=group.find(item=>canTitle(item))||'',rest=group.filter(item=>item!==head).slice(0,4);
   capped.push({heading:head?compress(head,26):'',bullets:rest.map(b=>'• '+compress(b,64)).join('\n')});
  }
  return capped.slice(0,30);
 }
 return pages;
}
