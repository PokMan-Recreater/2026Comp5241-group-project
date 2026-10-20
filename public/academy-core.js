import {tri,local} from './i18n.js';

export const lessonKey=(c,l)=>`${c}:${l}`;
export function ensureAcademy(s){
 const defaults={version:1,plans:[],activePlan:null,bookmarks:[],challenges:{},interviews:[],quizzes:{},tutorials:[],labResults:{},activities:[],playground:{language:'javascript',code:null},narration:{rate:1,voice:''}};
 s.academy??={};
 for(const [key,value] of Object.entries(defaults))if(s.academy[key]===undefined)s.academy[key]=value;
 s.profile??={};
 for(const [key,value] of Object.entries({weeklyMinutes:120,skillLevel:s.profile.depth==='advanced'?'advanced':'beginner',audience:'all',interests:[]}))if(s.profile[key]===undefined)s.profile[key]=value;
 return s.academy;
}
export function scheduleLessons(lessons,weeklyMinutes=120){
 const budget=Math.min(1200,Math.max(30,Math.round(Number(weeklyMinutes)||120)));
 let week=1,used=0;
 const steps=[];
 for(const lesson of lessons){
  let remaining=Math.max(1,Math.round(Number(lesson.minutes)||8)),part=1;
  const parts=Math.ceil(remaining/budget);
  while(remaining){const minutes=Math.min(budget,remaining);if(used&&used+minutes>budget){week++;used=0;}steps.push({...lesson,week,minutes,part,parts});used+=minutes;remaining-=minutes;part++;}
 }
 return {steps,weeks:steps.at(-1)?.week||0,weeklyMinutes:budget,totalMinutes:steps.reduce((n,x)=>n+x.minutes,0)};
}
const keywords={development:['software','development','workflow','软件','軟體','开发','開發'],requirements:['requirement','interview','stakeholder','需求','访谈','訪談'],architecture:['web','data','security','architecture','网页','網頁','数据','資料','权限','權限'], 'ai-coding':['ai','prompt','agent','人工智能','人工智慧','提示词','提示詞'], 'testing-release':['test','release','ci','deploy','测试','測試','上线','上線','部署'], 'product-decisions':['product','team','scope','产品','產品','团队','團隊','范围','範圍'],career:['career','job','interview','面试','面試','求职','求職']};
export function matchCourses(courses,topic='',interests=[]){
 const q=(topic+' '+interests.join(' ')).toLowerCase();
 return courses.filter(c=>c.status==='published').map(c=>({c,score:(keywords[c.id]||[]).reduce((n,k)=>n+(q.includes(k)?2:0),0)+(String(local(c.title)).toLowerCase().includes(topic.toLowerCase())&&topic.trim()?3:0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.c);
}
export function buildTemplateCourse(topic,id){
 const name=String(topic).trim().slice(0,180);
 if(!name)throw new Error('Topic required');
 const title=tri(`${name}: a study project`,`${name}：自主学习项目`,`${name}：自主學習專案`);
 const rows=[
  [tri('Define the question','明确学习问题','明確學習問題'),tri(`Write a precise question about ${name}. Describe who needs the answer and what you want to produce. Find a reliable introductory source; record its author, date and limitations. This template gives you a study process, not verified facts about the topic.`,`围绕 ${name} 写一个具体问题，说明谁需要答案、你想做出什么。找一份可靠的入门资料，记录作者、日期和局限。这份模板提供学习过程，不代表已经核实的学科知识。`,`圍繞 ${name} 寫一個具體問題，說明誰需要答案、你想做出甚麼。找一份可靠的入門資料，記錄作者、日期和侷限。這份範本提供學習過程，不代表已核實的學科知識。`)],
  [tri('Build a small glossary','整理概念与词汇','整理概念與詞彙'),tri('Choose five important terms from your source. Explain each in your own words, give an example and link back to the source. Mark definitions you cannot yet explain rather than guessing.','从资料中选出五个重要词汇，用自己的话解释，给出例子并记录出处。不确定的定义应标记为问题，不要猜测。','從資料中選出五個重要詞彙，用自己的話解釋，舉例並記錄出處。不確定的定義應標記為問題，不要猜測。')],
  [tri('Try one bounded task','完成一个小练习','完成一個小練習'),tri('Choose an exercise you can finish in one session. Write the inputs, expected output and a way to check it before beginning. Keep your first attempt, inspect the result and change only one thing at a time.','选择一次学习中能够完成的练习。开始前写清输入、期望输出和检查方法。保留第一次尝试，检查结果，每次只改变一个因素。','選擇一次學習中能完成的練習。開始前寫清輸入、預期輸出和檢查方法。保留第一次嘗試，檢查結果，每次只改變一個因素。')],
  [tri('Check and explain the result','核实并解释结果','核實並解釋結果'),tri('Compare the result with your original question. Identify evidence, an alternative explanation and one limitation. Ask another learner to follow your steps. Revise the explanation based on what they could not reproduce.','把结果与最初的问题对照，列出证据、另一种解释和一个局限。请另一位学习者按步骤尝试，针对无法复现的地方修改说明。','把結果與最初的問題對照，列出證據、另一種解釋和一個侷限。請另一位學習者按步驟嘗試，針對無法重現的地方修改說明。')]
 ];
 return {id,title,description:tri('A source-led study template. Add and verify subject material before teaching it.','以资料为依据的学习模板，教学前需补充并核实学科内容。','以資料為依據的學習範本，教學前需補充並核實學科內容。'),topic:'foundations',theme:'lavender',duration:60,status:'published',personal:true,origin:'template',level:'beginner',audience:['cs','non-cs'],lessons:rows.map(([title,body],i)=>({id:`${id}-l${i+1}`,title,body,advanced:body,type:'read',minutes:15,hint:tri('Start with your source and an observable question.','先明确资料来源和可检验的问题。','先明確資料來源和可檢驗的問題。')}))};
}
export function buildPlan({courses,topic,profile={},id,courseId}){
 let selected=matchCourses(courses,topic,profile.interests||[]),course=null;
 if(!selected.length){course=buildTemplateCourse(topic,courseId);selected=[course];}
 const beginner=(profile.skillLevel||'beginner')==='beginner';
 const lessons=selected.slice(0,3).flatMap(c=>(beginner?c.lessons.slice(0,2):c.lessons).map(l=>({courseId:c.id,lessonId:l.id,index:c.lessons.indexOf(l),title:l.title,courseTitle:c.title,minutes:l.minutes||Math.ceil(c.duration/c.lessons.length)||8})));
 const schedule=scheduleLessons(lessons,profile.weeklyMinutes);
 return {course,plan:{id,topic,title:tri(`${topic} · learning plan`,`${topic} · 学习计划`,`${topic} · 學習計畫`),...schedule,level:profile.skillLevel||'beginner',source:course?'template':'catalog',createdAt:new Date().toISOString()}};
}
export function planProgress(plan,s){
 const done=x=>s.progress[x.courseId]?.includes(x.lessonId);
 const completedMinutes=plan.steps.filter(done).reduce((n,x)=>n+x.minutes,0),total=plan.totalMinutes;
 return {percent:total?Math.round(100*completedMinutes/total):0,completedMinutes,totalMinutes:total,remainingWeeks:Math.ceil((total-completedMinutes)/plan.weeklyMinutes),next:plan.steps.find(x=>!done(x))};
}
export function recordActivity(s,type,id,detail={}){
 const a=ensureAcademy(s);a.activities.push({type,id,at:new Date().toISOString(),...detail});a.activities=a.activities.slice(-2000);
}
export function learningStats(s,now=new Date()){
 const a=ensureAcademy(s),completed=Object.values(s.progress||{}).reduce((n,x)=>n+x.length,0);
 const challenges=Object.values(a.challenges).filter(x=>x.passed).length;
 const quizzes=Object.values(a.quizzes).reduce((n,x)=>n+(x.correct?1:0),0);
 const labs=Object.keys(a.labResults).length,tutorials=a.tutorials.length;
 const interviews=new Set(a.interviews.map(x=>x.scenarioId)).size;
 const xp=completed*40+challenges*60+quizzes*15+labs*25+tutorials*15+interviews*50;
 const localDay=date=>{const d=new Date(date);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
 const days=new Set([...a.activities.map(x=>localDay(x.at)),...(s.events||[]).filter(x=>['lesson','checkpoint','code','game'].includes(x.type)).map(x=>localDay(x.time))]);
 let d=new Date(now),streak=0;if(!days.has(localDay(d)))d.setDate(d.getDate()-1);while(days.has(localDay(d))){streak++;d.setDate(d.getDate()-1);}
 return {completed,challenges,quizzes,labs,tutorials,interviews,xp,level:Math.floor(xp/250)+1,levelPercent:Math.round(xp%250/2.5),streak,badges:[completed>0,completed>=5,quizzes>0,challenges>0,streak>=3,interviews>0,labs>=3]};
}
export function evaluateInterview(answers,questions,lang='en'){
 return questions.map((q,i)=>{
  const answer=String(answers[i]||'').trim(),lower=answer.toLowerCase();
  const evidence=/\d|test|example|observ|log|measure|测试|測試|例子|记录|紀錄|证据|證據/.test(lower);
  const decision=/because|chose|trade|instead|alternative|因为|因為|选择|選擇|取舍|取捨|方案/.test(lower);
  const limit=/uncertain|not tested|next|limit|check|unknown|未|不确定|不確定|下一|检查|檢查|局限|侷限/.test(lower);
  return {answered:!!answer,signals:[!!answer,evidence,decision,limit],wordCount:answer.split(/\s+/).filter(Boolean).length,answer,question:local(q,lang)};
 });
}
export const createGit=()=>({branch:'main',branches:{main:'c0'},commits:[{id:'c0',parent:null,message:'Initial version',branch:'main'}],conflict:null,log:[]});
export function gitStep(state,action,value=''){
 const s=structuredClone(state);s.log??=[];
 if(action==='branch'){if(!/^[a-zA-Z][\w/-]{0,35}$/.test(value)||s.branches[value])throw new Error('Choose a new branch name');s.branches[value]=s.branches[s.branch];}
 else if(action==='checkout'){if(!Object.hasOwn(s.branches,value))throw new Error('Unknown branch');s.branch=value;}
 else if(action==='commit'){const id='c'+s.commits.length;s.commits.push({id,parent:s.branches[s.branch],branch:s.branch,message:String(value||'Change').slice(0,80)});s.branches[s.branch]=id;}
 else if(action==='merge'){
  if(!Object.hasOwn(s.branches,value)||value===s.branch)throw new Error('Choose another branch');
  const ancestor=(x,target)=>{const seen=new Set();while(x&&!seen.has(x)){if(x===target)return true;seen.add(x);x=s.commits.find(c=>c.id===x)?.parent;}return false;};
  const current=s.branches[s.branch],incoming=s.branches[value];
  if(ancestor(incoming,current))s.branches[s.branch]=incoming;
  else if(!ancestor(current,incoming))s.conflict={from:value,current,incoming};
 }else if(action==='resolve'){
  if(!s.conflict)throw new Error('No conflict');const id='c'+s.commits.length;s.commits.push({id,parent:s.conflict.current,mergeParent:s.conflict.incoming,branch:s.branch,message:`Resolved merge (${value})`});s.branches[s.branch]=id;s.conflict=null;
 }
 s.log.push(`${action} ${value}`.trim());return s;
}
export function promptReview(prompt){return [/(goal|build|write|create|目标|目標|编写|撰写|建立|生成)/i.test(prompt),/(input|source|given|输入|輸入|资料|資料)/i.test(prompt),/(must|limit|avoid|constraint|不得|限制|约束|約束|必须|必須)/i.test(prompt),/(json|format|table|输出|輸出|格式)/i.test(prompt),/(test|check|example|验收|驗收|测试|測試|例子)/i.test(prompt)];}
const tokenise=s=>String(s).toLowerCase().match(/[a-z0-9]+|[\u3400-\u9fff]/g)||[];
export function retrieve(query,docs,k=2,hybrid=false){const q=tokenise(query),terms=new Set(q);return docs.map(d=>{const words=new Set(tokenise(d.text)),overlap=[...terms].filter(t=>words.has(t)).length;const score=terms.size?overlap/Math.sqrt(terms.size*Math.max(words.size,1)):0;return {...d,score:score+(hybrid&&String(d.text).toLowerCase().includes(String(query).toLowerCase())?.3:0)};}).filter(d=>d.score>0).sort((a,b)=>b.score-a.score).slice(0,Math.max(1,Math.min(5,k)));}
export const initialDocker=()=>({image:false,status:'absent',logs:[]});
export function dockerStep(state,command){const s=structuredClone(state),c=command.trim();let out='';if(c==='docker build -t forma .'){s.image=true;out='Built image forma';}else if(c==='docker images')out=s.image?'forma:latest':'No images';else if(c==='docker run --name app forma'){if(!s.image)throw new Error('Build the image first');if(s.status!=='absent')throw new Error('Container app already exists');s.status='running';out='Container app started';}else if(c==='docker ps')out=s.status==='running'?'app  running':'No running containers';else if(c==='docker stop app'){if(s.status!=='running')throw new Error('app is not running');s.status='stopped';out='app stopped';}else if(c==='docker start app'){if(s.status!=='stopped')throw new Error('app must be stopped first');s.status='running';out='app started';}else if(c==='docker rm app'){if(s.status==='running')throw new Error('Stop app before removing it');if(s.status==='absent')throw new Error('app does not exist');s.status='absent';out='app removed';}else throw new Error('Use one of the supported commands');s.logs.push('$ '+c+'\n'+out);return s;}
export function gradientStep({m=0,b=0,rate=.05,history=[]},count=1){let loss=0;for(let n=0;n<count;n++){let dm=0,db=0;for(const x of [0,1,2,3,4]){const error=m*x+b-(2*x+1);dm+=2*x*error/5;db+=2*error/5;}m-=rate*dm;b-=rate*db;loss=[0,1,2,3,4].reduce((sum,x)=>sum+(m*x+b-(2*x+1))**2/5,0);history=[...history,loss].slice(-100);if(!Number.isFinite(loss)||loss>1e12)break;}return {m,b,rate,history,loss,diverged:!Number.isFinite(loss)||loss>1e12};}
export function pipelineResult(fixes=[]){const stages=[['lint','format'],['test','edge'],['build','env']];return stages.map(([stage,fix],i)=>({stage,status:stages.slice(0,i).some(([,f])=>!fixes.includes(f))?'blocked':fixes.includes(fix)?'passed':'failed',fix}));}
