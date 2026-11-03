// Line diffs, unified hunks, --stat and three-way merges, formatted the way
// Git 2.43 formats them.

const NOEOL='\u0000';
/** Splits text into lines; a last line without a newline carries a marker so it differs from one with it. */
export function splitLines(text){
 if(!text)return [];
 const lines=text.split('\n');
 if(lines.at(-1)==='')lines.pop();else lines[lines.length-1]+=NOEOL;
 return lines;
}
/** Myers O(ND) diff. Returns ops: [' '|'-'|'+', line, oldIndex, newIndex]. */
export function diffLines(a,b){
 const n=a.length,m=b.length,max=n+m,v=new Map([[1,0]]),trace=[];
 let found=false;
 for(let d=0;d<=max&&!found;d++){
  trace.push(new Map(v));
  for(let k=-d;k<=d;k+=2){
   let x=(k===-d||(k!==d&&(v.get(k-1)??-1)<(v.get(k+1)??-1)))?v.get(k+1)??0:(v.get(k-1)??0)+1;
   let y=x-k;
   while(x<n&&y<m&&a[x]===b[y]){x++;y++;}
   v.set(k,x);
   if(x>=n&&y>=m){found=true;break;}
  }
 }
 trace.push(new Map(v));
 const ops=[];let x=n,y=m;
 for(let d=trace.length-2;d>=0&&(x>0||y>0);d--){
  const vv=trace[d],k=x-y;
  const down=(k===-d||(k!==d&&(vv.get(k-1)??-1)<(vv.get(k+1)??-1)));
  const pk=down?k+1:k-1,px=vv.get(pk)??0,py=px-pk;
  while(x>px&&y>py){x--;y--;ops.push([' ',a[x],x,y]);}
  if(d>0){if(down){y--;ops.push(['+',b[y],x,y]);}else{x--;ops.push(['-',a[x],x,y]);}}
 }
 while(x>0&&y>0){x--;y--;ops.push([' ',a[x],x,y]);}
 ops.reverse();
 // Git shows deletions before additions inside one change block.
 const out=[];
 for(let i=0;i<ops.length;){
  if(ops[i][0]===' '){out.push(ops[i]);i++;continue;}
  const dels=[],adds=[];while(i<ops.length&&ops[i][0]!==' '){(ops[i][0]==='-'?dels:adds).push(ops[i]);i++;}
  out.push(...dels,...adds);
 }
 return out;
}
const funcLine=line=>/^[A-Za-z_$]/.test(line);
/** Unified hunks with three lines of context, including Git's function-context header. */
export function hunks(oldText,newText,context=3){
 const a=splitLines(oldText),b=splitLines(newText),ops=diffLines(a,b);
 const changes=ops.map((o,i)=>o[0]!==' '?i:-1).filter(i=>i>=0);
 if(!changes.length)return [];
 const groups=[];let start=changes[0],end=changes[0];
 for(const i of changes.slice(1)){
  // Count the context lines between two changes; join them when the gap is small.
  let gap=0;for(let j=end+1;j<i;j++)if(ops[j][0]===' ')gap++;
  if(gap<=context*2)end=i;else{groups.push([start,end]);start=end=i;}
 }
 groups.push([start,end]);
 return groups.map(([s,e])=>{
  let from=s,to=e,c=0;
  while(from>0&&c<context&&ops[from-1][0]===' '){from--;c++;}
  c=0;while(to<ops.length-1&&c<context&&ops[to+1][0]===' '){to++;c++;}
  const slice=ops.slice(from,to+1);
  const oldLines=slice.filter(o=>o[0]!=='+').length,newLines=slice.filter(o=>o[0]!=='-').length;
  // Old start: index of the first old line in the hunk.
  let oldStart,newStart;
  const firstOld=slice.find(o=>o[0]!=='+'),firstNew=slice.find(o=>o[0]!=='-');
  oldStart=firstOld?firstOld[2]+1:(slice[0][2]);newStart=firstNew?firstNew[3]+1:(slice[0][3]);
  if(!oldLines)oldStart=slice[0][2];if(!newLines)newStart=slice[0][3];
  const range=(st,n)=>n===1?`${st}`:`${st},${n}`;
  let func='';
  const scanFrom=(firstOld?firstOld[2]:slice[0][2])-1;
  for(let i=scanFrom;i>=0;i--){const t=a[i].replace(NOEOL,'');if(funcLine(t)){func=t.slice(0,80).replace(/\s+$/,'');break;}}
  return {header:`@@ -${range(oldStart,oldLines)} +${range(newStart,newLines)} @@`,func,lines:slice.map(([t,l])=>[t,l])};
 });
}
/** Lines of a hunk body ready to print (with the "No newline" note). */
export function hunkBody(h){
 const out=[];
 for(const [t,l] of h.lines){if(l.endsWith(NOEOL)){out.push([t,l.slice(0,-1)]);out.push(['\\',' No newline at end of file']);}else out.push([t,l]);}
 return out;
}
export function countChanges(oldText,newText){
 const ops=diffLines(splitLines(oldText),splitLines(newText));
 return {ins:ops.filter(o=>o[0]==='+').length,del:ops.filter(o=>o[0]==='-').length};
}

/* ------------------------------------------------------------ stat */
/** Shortens "a/b.txt => a/c.txt" to "a/{b.txt => c.txt}" like Git. */
export function renameLabel(from,to){
 let p=0;while(p<from.length&&p<to.length&&from[p]===to[p])p++;
 p=from.lastIndexOf('/',p-1)+1;
 let s=0;while(s<from.length-p&&s<to.length-p&&from[from.length-1-s]===to[to.length-1-s])s++;
 // keep the suffix only from a slash boundary
 let suf=from.slice(from.length-s);const slash=suf.indexOf('/');suf=slash>=0?suf.slice(slash):'';s=suf.length;
 const pre=from.slice(0,p),a=from.slice(p,from.length-s),b=to.slice(p,to.length-s);
 if(!pre&&!suf)return `${from} => ${to}`;
 return `${pre}{${a} => ${b}}${suf}`;
}
const plural=(n,one,many)=>`${n} ${n===1?one:many}`;
/** The " N files changed, X insertions(+), Y deletions(-)" line. */
export function shortstat(files){
 const ins=files.reduce((s,f)=>s+f.ins,0),del=files.reduce((s,f)=>s+f.del,0);
 let line=` ${plural(files.length,'file changed','files changed')}`;
 if(ins||!del)line+=`, ${plural(ins,'insertion(+)','insertions(+)')}`;
 if(del||!ins)line+=`, ${plural(del,'deletion(-)','deletions(-)')}`;
 return line;
}
/** Full --stat block: one line per file, then the summary line. Entries: {name,ins,del}. */
export function statLines(files,color){
 if(!files.length)return [];
 const width=80,nameW=Math.max(...files.map(f=>f.name.length)),total=Math.max(...files.map(f=>f.ins+f.del)),numW=String(total).length;
 let graphW=width-nameW-numW-6;if(graphW<6)graphW=6;
 const scale=total>graphW?graphW/total:1;
 const lines=files.map(f=>{
  let ins=f.ins,del=f.del;
  if(scale<1){const n=f.ins+f.del,scaled=Math.max(n?1:0,Math.round(n*scale));ins=n?Math.round(scaled*f.ins/n):0;del=scaled-ins;if(f.ins&&!ins){ins=1;del--;}if(f.del&&!del&&scaled>1){del=1;ins--;}}
  const graph=color?color.green('+'.repeat(ins))+color.red('-'.repeat(del)):'+'.repeat(ins)+'-'.repeat(del);
  return ` ${f.name.padEnd(nameW)} | ${String(f.ins+f.del).padStart(numW)}${ins+del?' '+graph:''}`;
 });
 return [...lines,shortstat(files)];
}

/* ------------------------------------------------------------ merge */
/**
 * Three-way merge of text (diff3 style). Returns {clean, text, conflicts}.
 * Labels name the two sides in the conflict markers.
 */
export function merge3(base,ours,theirs,{ours:oLabel='HEAD',theirs:tLabel='theirs'}={}){
 if(ours===theirs)return {clean:true,text:ours};
 if(base===ours)return {clean:true,text:theirs};
 if(base===theirs)return {clean:true,text:ours};
 const B=splitLines(base),O=splitLines(ours),T=splitLines(theirs);
 // For each side, map base line index -> matched side index.
 const match=(side)=>{const m=new Array(B.length).fill(-1);for(const [t,,i,j] of diffLines(B,side))if(t===' ')m[i]=j;return m;};
 const mo=match(O),mt=match(T);
 const out=[];let conflicts=0,ib=0,io=0,it=0;
 const same=(x,y)=>x.length===y.length&&x.every((l,i)=>l===y[i]);
 const strip=ls=>ls.map(l=>l.endsWith(NOEOL)?l.slice(0,-1):l);
 while(true){
  if(ib<B.length&&mo[ib]===io&&mt[ib]===it){out.push(B[ib]);ib++;io++;it++;continue;}
  let nb=ib;while(nb<B.length&&!(mo[nb]!==-1&&mt[nb]!==-1))nb++;
  const eo=nb<B.length?mo[nb]:O.length,et=nb<B.length?mt[nb]:T.length;
  const bChunk=B.slice(ib,nb),oChunk=O.slice(io,eo),tChunk=T.slice(it,et);
  if(same(oChunk,bChunk))out.push(...tChunk);
  else if(same(tChunk,bChunk))out.push(...oChunk);
  else if(same(oChunk,tChunk))out.push(...oChunk);
  else{
   // Zealous trimming: lines both sides agree on stay outside the markers.
   let p=0;while(p<oChunk.length&&p<tChunk.length&&oChunk[p]===tChunk[p])p++;
   let q=0;while(q<oChunk.length-p&&q<tChunk.length-p&&oChunk[oChunk.length-1-q]===tChunk[tChunk.length-1-q])q++;
   conflicts++;
   out.push(...oChunk.slice(0,p),'<<<<<<< '+oLabel,...strip(oChunk.slice(p,oChunk.length-q)),'=======',...strip(tChunk.slice(p,tChunk.length-q)),'>>>>>>> '+tLabel,...oChunk.slice(oChunk.length-q));
  }
  if(nb>=B.length)break;
  ib=nb;io=eo;it=et;
 }
 let text=out.map(l=>l.endsWith(NOEOL)?l.slice(0,-1):l).join('\n');
 const last=out.at(-1);
 if(out.length&&!(last&&last.endsWith(NOEOL)))text+='\n';
 return {clean:!conflicts,text,conflicts};
}
export const NO_EOL=NOEOL;
