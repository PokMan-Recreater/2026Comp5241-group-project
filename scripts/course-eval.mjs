// Runs the production outline + lesson prompts against the configured provider
// and reports whether real output clears the same validation gate as the API.
// Usage: node scripts/course-eval.mjs [--lang zh-CN] [--lessons 2] [topic ...]
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {providerMessages,repairMessages} from './course-ai-prompts.mjs';
import {outlineProblems,fullLessonProblems,normalizeLesson,normalizeOutline} from './course-ai-shape.mjs';

async function loadEnv(){
 try{for(const line of (await readFile('.env.local','utf8')).split('\n')){const m=line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)\s*$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^['"]|['"]$/g,'');}}
 catch{/* .env.local is optional when the shell already exports the settings */}
}
const args=process.argv.slice(2);
const flag=(name,fallback)=>{const i=args.indexOf('--'+name);if(i<0)return fallback;const value=args[i+1];args.splice(i,2);return value;};
const language=flag('lang','zh-CN'),maxLessons=Number(flag('lessons','2'));
const topics=args.length?args:['为什么智能合约需要 Gas','变量作用域与闭包','TCP 三次握手'];
const endpoint=new URL((process.env.AI_BASE_URL||'https://open.bigmodel.cn/api/paas/v4').replace(/\/$/,'')+'/chat/completions');
const primary=process.env.AI_MODEL||'glm-4.7-flash';
const freeFallback=endpoint.hostname==='open.bigmodel.cn'&&primary==='glm-4.7-flash';

async function ask(model,messages,maxTokens){
 const res=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+process.env.AI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model,messages,response_format:{type:'json_object'},max_tokens:maxTokens,...(freeFallback&&model===primary?{thinking:{type:'disabled'}}:{})}),signal:AbortSignal.timeout(90000)});
 const body=await res.json().catch(()=>null);
 if(!res.ok)throw Object.assign(new Error('provider_status_'+res.status),{status:res.status,provider:body});
 return {model,content:body.choices?.[0]?.message?.content,usage:body.usage};
}
async function generate(payload,maxTokens){
 const messages=providerMessages(payload);
 try{return await ask(primary,messages,maxTokens);}
 catch(error){if(!freeFallback||!(error.status===429||error.name==='TimeoutError'))throw error;return ask('glm-4-flash-250414',messages,maxTokens);}
}
const parse=content=>JSON.parse(String(content).replace(/^```(?:json)?\s*/,'').replace(/\s*```$/,''));
async function repair(payload,raw,problems){
 const messages=repairMessages(payload,raw,problems),maxTokens=payload.action==='outline'?2000:5200;
 try{return await ask(primary,messages,maxTokens);}
 catch(error){if(!freeFallback||!(error.status===429||error.name==='TimeoutError'))return null;try{return await ask('glm-4-flash-250414',messages,maxTokens);}catch{return null;}}
}
const lessonProblemsOf=value=>{const problems=fullLessonProblems(value);if(!Array.isArray(value?.questions)||value.questions.length<1)problems.push('at least one multiple-choice question is required');return problems;};
const lessonMetrics=l=>({
 slides:l.slides?.length??0,
 scenes:[...new Set((l.slides||[]).map(s=>s.art?.scene))],
 bullets:(l.slides||[]).reduce((n,s)=>n+(s.bullets?.length||0),0),
 scriptLines:(l.slides||[]).reduce((n,s)=>n+(s.script?.length||0),0),
 objectiveChars:(l.objectives||[]).map(o=>o.length),
 misconceptionChars:(l.misconceptions||[]).map(o=>o.length),
 duplicateHeadings:new Set((l.slides||[]).map(s=>s.heading)).size!==(l.slides||[]).length,
 questions:l.questions?.length??0
});
async function main(){
 if(!process.env.AI_API_KEY)throw new Error('AI_API_KEY is not configured');
 const outDir=join('/tmp/forma-eval',new Date().toISOString().replace(/[:.]/g,'-'));
 await mkdir(outDir,{recursive:true});
 let failed=0;
 for(const topic of topics){
  const report={topic,language,stages:[]};
  const requirements='面向大学一年级学生，用具体例子讲清原理，避免未经证实的说法。';
  const outlinePayload={action:'outline',language,topic,requirements,instruction:'',current:''};
  const outlineResult=await generate(outlinePayload,2000);
  let outline=null,outlineRaw=outlineResult.content,outlineModel=outlineResult.model,outlineUsage=outlineResult.usage,outlineRepaired=false;
  try{outline=parse(outlineResult.content);}catch{report.stages.push({stage:'outline',ok:false,error:'invalid_json'});}
  if(outline){
   let problems=outlineProblems(outline);
   if(problems.length){
    const fix=await repair(outlinePayload,outlineResult.content,problems);
    if(fix){try{const fixed=parse(fix.content);if(!outlineProblems(fixed).length){outline=fixed;problems=[];outlineRepaired=true;outlineRaw=fix.content;outlineModel=fix.model;outlineUsage=fix.usage;}}catch{/* keep the original failure */}}
   }
   const ok=problems.length===0;
   report.stages.push({stage:'outline',ok,repaired:outlineRepaired,model:outlineModel,usage:outlineUsage,metrics:ok?{lessons:outline.lessons.length,titles:new Set(outline.lessons.map(l=>l.title.trim())).size,bodies:outline.lessons.map(l=>l.body.split(/\s+/).length)}:{problems},...(ok?{}:{raw:outlineRaw})});
   outline=ok?normalizeOutline(outline,language):null;
  }
  if(outline){
   for(const lesson of outline.lessons.slice(0,maxLessons)){
    const payload={action:'lesson',language,topic:outline.title+' · '+lesson.title,requirements,instruction:'',current:JSON.stringify(lesson)};
    const result=await generate(payload,5200);
    let value;try{value=parse(result.content);}catch{report.stages.push({stage:'lesson',topic:lesson.title,ok:false,error:'invalid_json'});continue;}
    let problems=lessonProblemsOf(value),repaired=false,model=result.model,usage=result.usage;
    if(problems.length){
     const fix=await repair(payload,result.content,problems);
     if(fix){try{const fixed=parse(fix.content);if(!lessonProblemsOf(fixed).length){value=fixed;problems=[];repaired=true;model=fix.model;usage=fix.usage;}}catch{/* keep the original failure */}}
    }
    const ok=problems.length===0;
    report.stages.push({stage:'lesson',topic:lesson.title,ok,repaired,model,usage,metrics:ok?lessonMetrics(normalizeLesson(value)):{problems},...(ok?{lesson:normalizeLesson(value)}:{raw:result.content})});
   }
  }
  const bad=report.stages.filter(s=>!s.ok).length;failed+=bad;
  report.ok=bad===0;
  await writeFile(join(outDir,encodeURIComponent(topic)+'.json'),JSON.stringify({report,outline},null,2));
  console.log('\n'+topic+(report.ok?'  OK':'  FAIL'));
  for(const stage of report.stages)console.log('  -',stage.stage,stage.topic||'',stage.ok?'ok':'FAIL '+stage.error,JSON.stringify(stage.metrics||''));
 }
 console.log('\nRaw output: '+outDir);
 if(failed)process.exitCode=1;
}
await loadEnv();
await main();
