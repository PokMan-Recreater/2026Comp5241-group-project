// Runs the storyboard-v1 pipeline against the configured provider and writes a
// browsable HTML preview of the rendered slides. Structural validity is checked,
// but factual accuracy and teaching quality still need a human review.
// Usage: node scripts/course-storyboard-eval.mjs [--lang zh-CN] [--no-open] [topic ...]
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {execFile} from 'node:child_process';
import {planningMessages,validTeachingBrief,storyboardRepairMessages,lessonReviewMessages,validLessonReview} from './course-storyboard-prompts.mjs';
import {providerMessages} from './course-ai-prompts.mjs';
import {fullLessonProblems,normalizeLesson,canonicalAIResult} from './course-ai-shape.mjs';
import {storyboardArt,validStoryboard,storyboardProblems} from '../public/course-storyboard.js';
import {sceneArt} from '../public/scene-render.js';

async function loadEnv(){
 try{for(const line of (await readFile('.env.local','utf8')).split('\n')){const m=line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^['"]|['"]$/g,'');}}
 catch{/* .env.local is optional when the shell already exports the settings */}
}
const args=process.argv.slice(2);
const flag=name=>{const i=args.indexOf('--'+name);if(i<0)return false;args.splice(i,1);return true;};
const option=(name,fallback)=>{const i=args.indexOf('--'+name);if(i<0)return fallback;const value=args[i+1];args.splice(i,2);return value;};
const language=option('lang','zh-CN'),openPreview=!flag('no-open');
const topics=args.length?args:['Git 提交后工作区与暂存区的状态变化'];
const endpoint=new URL((process.env.AI_BASE_URL||'https://open.bigmodel.cn/api/paas/v4').replace(/\/$/,'')+'/chat/completions');
const primary=process.env.AI_MODEL||'glm-4.7-flash';
const freeFallback=endpoint.hostname==='open.bigmodel.cn'&&primary==='glm-4.7-flash';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const parse=content=>JSON.parse(String(content).replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));

async function ask(model,messages,maxTokens=6500,timeout=120000){
 const res=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+process.env.AI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model,messages,response_format:{type:'json_object'},max_tokens:maxTokens,...(freeFallback&&model===primary?{thinking:{type:'disabled'}}:{})}),signal:AbortSignal.timeout(timeout)});
 const body=await res.json().catch(()=>null);
 if(!res.ok)throw Object.assign(new Error('provider_status_'+res.status),{status:res.status});
 return {model,content:body?.choices?.[0]?.message?.content};
}
async function askWithFallback(messages,maxTokens){
 try{return await ask(primary,messages,maxTokens);}
 catch(error){if(!freeFallback||!(error.status===429||error.name==='TimeoutError'))throw error;return ask('glm-4-flash-250414',messages,maxTokens);}
}
async function checked(messages,valid,maxTokens=6500){
 let value,raw;
 for(let attempt=0;attempt<2;attempt++){
  const answer=await askWithFallback(attempt?[...messages,{role:'assistant',content:String(raw??'')},{role:'user',content:'Your previous JSON was incomplete or invalid. Return the complete corrected object, respecting the exact schema and bounds.'}]:messages,maxTokens);
  raw=answer.content;
  try{value=parse(raw);if(valid(value))return {value,raw,model:answer.model};}catch{/* retry once */ }
 }
 return {value:null,raw,model:null};
}
const withoutStory=lesson=>{
 const clone=structuredClone(lesson);
 for(const slide of clone?.slides||[])if(slide?.art)delete slide.art.story;
 return clone;
};
const nonStoryProblems=lesson=>fullLessonProblems(withoutStory(lesson));
const storyProblems=lesson=>{
 const problems=[];
 for(const [i,slide]of (lesson?.slides||[]).entries())if(!validStoryboard(slide?.art?.story))problems.push('slides['+i+'] storyboard: '+storyboardProblems(slide?.art?.story).join('; '));
 return problems;
};
const frameHTML=(slide,progress,lang)=>`<figure class="frame">${slide.art?.story?storyboardArt(slide.art.story,progress,lang):sceneArt(slide.art.scene,slide.art.items,{title:slide.heading})}<figcaption>${slide.art?.story?(progress<1?'progress '+Math.round(progress*100)+'%':'final frame'):'template fallback'}</figcaption></figure>`;

await loadEnv();
if(!process.env.AI_API_KEY)throw new Error('AI_API_KEY is not configured');

for(const topic of topics){
 const requirements='面向大学一年级学生，用具体例子讲清原理，避免未经证实的说法。';
 const payload={action:'lesson',language,topic,requirements,instruction:'',current:'',production:'storyboard-v1',teachingBrief:null};
 let brief;
 try{
  const plan=await checked(planningMessages(payload),validTeachingBrief,1400);
  brief=plan.value;
  if(!brief)throw Error('invalid_teaching_plan');
 }catch(error){console.log(topic+'  plan FAILED: '+error.message);continue;}
 payload.teachingBrief=brief;
 let lesson=null,usedModel;
 {
  const messages=providerMessages(payload);
  const answer=await askWithFallback(messages,6500);usedModel=answer.model;
  try{lesson=canonicalAIResult(parse(answer.content),'lesson','lesson-1');}catch{/* retry below */}
  if(!lesson){
   const retry=await askWithFallback([...messages,{role:'assistant',content:String(answer.content??'')},{role:'user',content:'Return one complete valid lesson JSON object only.'}],6500);
   usedModel=retry.model;
   try{lesson=canonicalAIResult(parse(retry.content),'lesson','lesson-1');}catch{/* fail below */}
   if(!lesson){await writeFile('/tmp/forma-storyboard-raw.json',String(retry.content));console.log(topic+'  generation FAILED; raw output kept for inspection');continue;}
  }
 }
 let nonStory=nonStoryProblems(lesson);
 if(nonStory.length){
  const repair=await askWithFallback([...providerMessages(payload),{role:'assistant',content:JSON.stringify(lesson)},{role:'user',content:'Your previous JSON failed validation: '+nonStory.slice(0,10).join('; ')+'. Return the complete corrected JSON only.'}],6500);
  usedModel=repair.model;
  try{lesson=canonicalAIResult(parse(repair.content),'lesson','lesson-1');}catch{/* keep the first candidate */}
 }
 const lostStories=[];
 for(const [index,slide]of lesson.slides.entries()){
  if(validStoryboard(slide.art?.story))continue;
  for(let retry=0;retry<2;retry++){
   try{
    const fix=await checked(storyboardRepairMessages(slide,language,storyboardProblems(slide.art?.story)),story=>validStoryboard(story),1800);
    if(fix.value){slide.art.story=fix.value;break;}
   }catch{break;}
  }
  if(!validStoryboard(slide.art?.story)){lostStories.push(index+1);delete slide.art.story;}
 }
 lesson=normalizeLesson(lesson);
 let review;
 try{const result=await checked(lessonReviewMessages(lesson,payload),value=>validLessonReview(value,lesson.slides.length),1600);review=result.value;}catch(error){review={pass:false,issues:[{slide:-1,problem:'review unavailable: '+error.message}]};}
 const problems=[...nonStoryProblems(lesson),...storyProblems(lesson)];
 const outDir=join('/tmp/forma-storyboard-eval',topic.replace(/[^\w一-龥-]+/g,'_').slice(0,80));
 await mkdir(outDir,{recursive:true});
 await writeFile(join(outDir,'lesson.json'),JSON.stringify({topic,brief,lesson,review,problems,lostStories},null,2));
 const slidesHTML=lesson.slides.map((slide,i)=>`<article class="slide"><header><span class="no">${String(i+1).padStart(2,'0')}</span><h2>${escape(slide.heading)}</h2><span class="scene">${escape(slide.art?.story?.layout||'template')}</span></header><p class="concept">${escape(slide.concept)}</p><div class="frames">${frameHTML(slide,.5,language)}${frameHTML(slide,1,language)}</div><ul>${slide.bullets.map(b=>`<li>${escape(b)}</li>`).join('')}</ul><p class="script">${slide.script.map(escape).join(' ')}</p>${slide.art?.story?`<details><summary>storyboard JSON</summary><pre>${escape(JSON.stringify(slide.art.story,null,2))}</pre></details>`:'<p class="meta">The storyboard stayed invalid, so this page falls back to the template illustration.</p>'}</article>`).join('');
 const reviewHTML=review?`<section class="review ${review.pass?'pass':'fail'}"><h2>Automated review: ${review.pass?'PASS':'ISSUES ('+review.issues.length+')'}</h2>${review.issues.length?`<ul>${review.issues.map(i=>`<li>slide ${i.slide===-1?'metadata':i.slide+1}: ${escape(i.problem)}</li>`).join('')}</ul>`:'<p>The automated reviewer found no issue. This is not proof of factual accuracy.</p>'}</section>`:'';
 const html=`<!doctype html><html lang="${escape(language)}"><meta charset="utf-8"><title>Storyboard trial: ${escape(topic)}</title><style>
body{margin:0;padding:32px;background:#f6f3ee;color:#292535;font:15px/1.6 -apple-system,"PingFang SC","Noto Sans CJK SC",sans-serif}
h1{font-size:24px;margin:0 0 8px}h2{font-size:18px;margin:0}
.meta{color:#665e72;margin:0 0 24px}.info,.review,.slide{background:#fff;border:1px solid #e6e0d6;border-radius:14px;padding:20px;margin:0 0 20px;box-shadow:0 1px 2px rgba(0,0,0,.03)}
.slide header{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.no{font-weight:700;color:#7967ac}.scene{margin-left:auto;background:#f1ecfa;color:#4a3a82;border-radius:999px;padding:2px 10px;font-size:12px}
.concept{color:#665e72;margin:6px 0 12px}.frames{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:12px 0}.frame{margin:0}.frame svg{width:100%;height:auto;border:1px solid #eee;border-radius:10px;background:#fff}
figcaption{text-align:center;color:#8a8197;font-size:12px;margin-top:4px}.script{background:#faf8f4;border-left:3px solid #7967ac;padding:8px 12px;border-radius:4px}
ul.brief{columns:2}pre{white-space:pre-wrap;font-size:12px;background:#faf8f4;padding:10px;border-radius:8px}.review.pass{border-color:#bad7c2}.review.fail{border-color:#e9c3ba}
</style><body><h1>Storyboard trial: ${escape(topic)}</h1><p class="meta">${escape(language)} · model ${escape(usedModel||primary)} · structural problems: ${problems.length}${lostStories.length?' · template fallback pages: '+lostStories.join(', '):''}</p><section class="info"><h2>Teaching brief</h2><p><strong>Audience:</strong> ${escape(brief.audience)}</p><p><strong>Goal:</strong> ${escape(brief.goal)}</p><p><strong>Case:</strong> ${escape(brief.case)}</p><ul class="brief">${brief.steps.map(s=>`<li><strong>${escape(s.heading)}</strong> · ${escape(s.layout)}<br>${escape(s.purpose)}</li>`).join('')}</ul></section>${reviewHTML}${slidesHTML}<p class="meta">Rendered by storyboardArt. Mid-progress frames show which events appear during playback. Automated review only catches some issues; verify facts against source material before reuse.</p></body></html>`;
 await writeFile(join(outDir,'preview.html'),html);
 console.log(`\n${topic}\n  slides: ${lesson.slides.length}\n  layouts: ${lesson.slides.map(s=>s.art?.story?.layout||'template').join(', ')}\n  review: ${review?.pass?'PASS':'ISSUES '+review?.issues.length}\n  lost storyboards: ${lostStories.length?lostStories.join(', '):'none'}\n  structural problems: ${problems.length?'FAIL '+problems.join('; '):'none'}\n  preview: ${join(outDir,'preview.html')}`);
 if(openPreview&&process.platform==='darwin')execFile('open',[join(outDir,'preview.html')],()=>{});
}
