import {readFile,writeFile,mkdir,unlink,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {allLessons} from '../public/all-lessons.js';

const root=process.cwd();
const force=process.argv.includes('--force');
const voice='zh_female_sophie_uranus_bigtts';
const langs=['zh-CN','en'];
const lessons=allLessons.filter(l=>l.id!=='delivery-ready');
const mp3Path=(id,lang,i)=>path.join(root,'public','audio',id,lang,`step-${i+1}.mp3`);
const exists=async p=>{try{await access(p);return true;}catch{return false;}};
const run=(cmd,args,opts={})=>{const r=spawnSync(cmd,args,{encoding:'utf8',...opts});if(r.status!==0)throw new Error(`${cmd} failed: ${(r.stderr||r.stdout||'').slice(-400)}`);return r;};

const plan=[];
for(const lesson of lessons)for(const lang of langs)for(const [i,step] of lesson.steps.entries()){
 const mp3=mp3Path(lesson.id,lang,i);
 if(!force&&await exists(mp3))continue;
 const sentences=lang==='en'?step.enScript:step.script;
 plan.push({lang,voice,text:sentences.join(' '),output:mp3.replace(/\.mp3$/,'.pcm'),mp3});
}
if(plan.length){
 const manifestPath=path.join(root,'.tmp-narration-plan.json');
 await writeFile(manifestPath,JSON.stringify(plan.map(({lang,voice,text,output})=>({lang,voice,text,output})),null,1));
 console.log(`Synthesizing ${plan.length} clips…`);
 run(process.execPath,['scripts/synthesize-course-narration.mjs',manifestPath],{stdio:'inherit',timeout:900000});
 await unlink(manifestPath);
 for(const item of plan){
  await mkdir(path.dirname(item.mp3),{recursive:true});
  run('ffmpeg',['-y','-loglevel','error','-f','s16le','-ar','24000','-ac','1','-i',item.output,'-codec:a','libmp3lame','-b:a','64k',item.mp3]);
  await unlink(item.output);
 }
}

function analyse(file,count){
 const { stdout }=run('ffprobe',['-v','error','-show_entries','format=duration','-of','default=nw=1:nk=1',file]);
 const duration=Number(stdout.trim());
 const probe=spawnSync('ffmpeg',['-hide_banner','-i',file,'-af','silencedetect=noise=-35dB:d=0.2','-f','null','-'],{encoding:'utf8'});
 const log=probe.stderr||'';
 const gaps=[];
 let start=null;
 for(const line of log.split('\n')){
  const s=line.match(/silence_start: ([\d.]+)/);if(s)start=Number(s[1]);
  const e=line.match(/silence_end: ([\d.]+) \| silence_duration: ([\d.]+)/);
  if(e&&start!==null){const end=Number(e[1]),dur=Number(e[2]);if(start>0.3&&start<duration-0.25&&dur>=0.28&&dur<=2)gaps.push({start,end,dur});start=null;}
 }
 gaps.sort((a,b)=>b.dur-a.dur);
 const picked=gaps.slice(0,Math.max(0,count-1)).sort((a,b)=>a.start-b.start);
 return {duration,gaps,picked};
}
function sentenceStarts(duration,gaps,count){
 if(count<2)return [0];
 const starts=[0];
 for(const g of gaps){const mid=(g.start+g.end)/2;if(mid<duration-0.2)starts.push(mid);}
 while(starts.length<count)starts.push(Math.min(duration-0.5,(starts.at(-1)||0)+duration/count));
 return starts.slice(0,count).map((v,i,a)=>i>0?Math.min(duration-0.1,Math.max(v,a[i-1]+0.15)):0);
}

const manifest={};
for(const lesson of lessons){
 manifest[lesson.id]={};
 for(const lang of langs){
  manifest[lesson.id][lang]=[];
  for(const [i,step] of lesson.steps.entries()){
   const mp3=mp3Path(lesson.id,lang,i);
   const count=(lang==='en'?step.enScript:step.script).length;
   const {duration,gaps}=analyse(mp3,count);
   const hash=createHash('md5').update(await readFile(mp3)).digest('hex').slice(0,12);
   manifest[lesson.id][lang].push({
    src:`/audio/${lesson.id}/${lang}/step-${i+1}.mp3?v=${hash}`,
    duration:Number(duration.toFixed(5)),
    sentenceStarts:sentenceStarts(duration,gaps,count).map(v=>Number(v.toFixed(5))),
    voice,provider:'doubao',sampleRate:24000
   });
  }
  console.log(`${lesson.id} ${lang}: ${manifest[lesson.id][lang].length} clips`);
 }
}
const out=`// Pre-generated neural narration. Traditional Chinese shares the Mandarin recordings.\nexport default ${JSON.stringify(manifest,null,2)};\n`;
await writeFile(path.join(root,'public','course-audio-manifest.js'),out);
console.log('Wrote public/course-audio-manifest.js');
