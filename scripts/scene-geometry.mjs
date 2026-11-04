// Renders every scene at its full slot capacity and checks the real SVG text
// boxes in headless Chrome. Catches labels that leave the 360x240 canvas or get
// ellipsized by the wrap limit, which pure string tests cannot see.
import {existsSync} from 'node:fs';
import {writeFile,unlink} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {sceneArt,SCENE_IDS} from '../public/scene-render.js';
import {sceneHTML} from '../public/teaching.js';
import {sceneCapacity} from './teaching-scenes.mjs';

const run=promisify(execFile);
const macChrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const chrome=existsSync(macChrome)?macChrome:'google-chrome';
const labels={
 cjk:['区块链记录','节点验证','智能合约','用户钱包','网络广播'],
 en:['Blockchain records','Node verification','Smart contracts','User wallet','Network broadcast'],
 mixed:['DApp 钱包','Smart contract','区块确认','API 网关','结果回写']
};
const cases=[];
for(const scene of SCENE_IDS){
 for(const [set,items] of Object.entries(labels)){
  const count=sceneCapacity(scene).max;
  const picked=items.slice(0,count);
  cases.push({name:scene+'/'+set,size:[360,240],svg:sceneArt(scene,picked,{title:'DApps vs Traditional Applications'})});
 }
}
for(const [set,items] of Object.entries(labels)){
 cases.push({name:'lesson-preview/'+set,size:[360,240],svg:sceneHTML({title:'DApps vs Traditional Applications',scene:'flow',sceneItems:items})});
}
const page=`<!doctype html><meta charset="utf-8"><body style="margin:0"><pre id="result"></pre><script>
const cases=${JSON.stringify(cases)};
const out={checked:0,failures:[]};
const holder=document.body;
for(const c of cases){
 const div=document.createElement('div');
 div.innerHTML=c.svg;
 holder.appendChild(div);
 const svg=div.querySelector('svg');
 if(!svg){out.failures.push({case:c.name,kind:'no-svg'});continue;}
 for(const t of svg.querySelectorAll('text')){
  let b;
  try{b=t.getBBox();}catch(error){out.failures.push({case:c.name,text:t.textContent,kind:'no-bbox'});continue;}
  out.checked++;
  const bounds=[b.x,b.y,b.width,b.height].map(v=>Math.round(v*10)/10);
  const [width,height]=c.size;
  if(b.width<=0||b.height<=0)out.failures.push({case:c.name,text:t.textContent,kind:'empty',bounds});
  else if(b.x<-1||b.y<-1||b.x+b.width>width+1||b.y+b.height>height+1)out.failures.push({case:c.name,text:t.textContent,kind:'outside-canvas',bounds});
  if(t.textContent.endsWith('…'))out.failures.push({case:c.name,text:t.textContent,kind:'truncated'});
 }
}
document.getElementById('result').textContent=JSON.stringify(out);
</script>`;
const file=join(tmpdir(),'forma-scene-geometry-'+process.pid+'.html');
try{
 await writeFile(file,page);
 let stdout;
 try{
  ({stdout}=await run(chrome,['--headless=new','--disable-gpu','--no-sandbox','--hide-scrollbars','--virtual-time-budget=2000','--dump-dom',pathToFileURL(file).href],{maxBuffer:16*1024*1024,timeout:60000}));
 }catch(error){
  if(error.code==='ENOENT'){console.error('Headless Chrome not found; skipping scene geometry check.');process.exit(0);}
  if(!error.stdout)throw new Error('Could not run headless Chrome: '+error.message,{cause:error});
  stdout=error.stdout;
 }
 const match=stdout.match(/<pre id="result">([\s\S]*?)<\/pre>/);
 if(!match)throw new Error('Headless Chrome did not return geometry results');
 const result=JSON.parse(match[1].replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>'));
 if(result.failures.length){
  console.error(`Scene geometry failed: ${result.failures.length} issue(s) in ${result.checked} labels`);
  for(const failure of result.failures.slice(0,40))console.error(' -',JSON.stringify(failure));
  process.exitCode=1;
 }else console.log(`Scene geometry OK: ${result.checked} labels across ${cases.length} cases`);
}finally{
 await unlink(file).catch(()=>{});
}
