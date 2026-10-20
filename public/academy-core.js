import {tri,local} from './i18n.js';
import {referenceTopics,challenges,labs,interviews} from './academy-content.js';

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
const keywords={development:['software','development','workflow','软件','軟體','开发','開發'],requirements:['requirement','stakeholder','需求','访谈','訪談'],architecture:['web','security','architecture','网页','網頁','权限','權限'], 'ai-coding':['ai coding','agent','ai编程','ai程式'], 'testing-release':['test','testing','tdd','release','测试','測試','上线','上線'], 'product-decisions':['product','team','scope','产品','產品','团队','團隊','范围','範圍'],'python-first-steps':['python','csv','automation','文件处理','檔案處理'],career:['career','job','interview','star','story bank','面试','面試','求职','求職'], 'ai-toolkit':['ai','artificial intelligence','人工智能','人工智慧','ai literacy','ai tools','non-cs','人工智能入门','人工智慧入門','ai工具'], 'git-essentials':['git','version control','branch','merge','pull request','版本控制','分支','合并','合併'], 'data-sql':['sql','database','select','join','数据查询','資料查詢','数据库','資料庫'], 'docker-containers':['docker','container','compose','容器','镜像','映像'], 'cicd-pipelines':['ci','cd','ci/cd','pipeline','github actions','vercel','deploy','流水线','流水線','部署'], 'prompt-engineering':['prompt','prompt engineering','提示词','提示詞'], 'llm-apps':['llm','rag','retrieval','大模型','检索','檢索'], 'ml-foundations':['ml','machine learning','gradient','overfit','机器学习','機器學習','梯度','过拟合','過度擬合']};
const hasKeyword=(q,k)=>/^[a-z ]+$/i.test(k)?new RegExp('(?:^|[^a-z])'+k+'(?:$|[^a-z])','i').test(q):q.includes(k);
export function matchCourses(courses,topic='',interests=[]){
 return courses.filter(c=>c.status==='published').map(c=>{const direct=(keywords[c.id]||[]).reduce((n,k)=>n+(hasKeyword(topic.toLowerCase(),k)?6:0),0)+(String(local(c.title)).toLowerCase().includes(topic.toLowerCase())&&topic.trim()?3:0);return {c,direct,score:direct+(keywords[c.id]||[]).reduce((n,k)=>n+(hasKeyword(interests.join(' ').toLowerCase(),k)?1:0),0)};}).filter(x=>x.direct>0).sort((a,b)=>b.score-a.score).map(x=>x.c);
}
export function buildTemplateCourse(topic,id){
 const name=String(topic).trim().slice(0,180);
 if(!name)throw new Error('Topic required');
 const title=tri(`${name}: a study project`,`${name}：自主学习项目`,`${name}：自主學習專案`);
 const rows=[
  [tri('Define the question','明确学习问题','明確學習問題'),tri(`Write a precise question about ${name}. Describe who needs the answer and what you want to produce. Find a reliable introductory source; record its author, date and limitations. This template gives you a study process, not verified facts about the topic.`,`围绕 ${name} 写一个具体问题，说明谁需要答案、你想做出什么。找一份可靠的入门资料，记录作者、日期和局限。这份模板提供学习过程，不代表已经核实的学科知识。`,`圍繞 ${name} 寫一個具體問題，說明誰需要答案、你想做出甚麼。找一份可靠的入門資料，記錄作者、日期和侷限。這份範本提供學習過程，不代表已核實的學科知識。`)],
  [tri('Build a small glossary','整理概念与词汇','整理概念與詞彙'),tri('Choose five important terms from your source. Explain each in your own words, give an example and link back to the source. Mark definitions you cannot yet explain rather than guessing.','从资料中选出五个重要词汇，用自己的话解释，给出例子并记录出处。不确定的定义应标记为问题，不要猜测。','從資料中選出五個重要詞彙，用自己的話解釋，舉例並記錄出處。不確定的定義應標記為問題，不要猜測。')],
  [tri('Try one bounded task','完成一个小练习','完成一個小練習'),tri('Choose an exercise you can finish in one session. Write the inputs, expected output and a way to check it before beginning. Keep your first attempt, inspect the result and change only one thing at a time.','选择一次学习中能够完成的练习。开始前写清输入、期望输出和检查方法。保留第一次尝试，检查结果，每次只改变一个因素。','選擇一次學習中能完成的練習。開始前寫清輸入、預期輸出和檢查方法。保留第一次嘗試，檢查結果，每次只改變一個因素。')],
  [tri('Check and explain the result','核实并解释结果','核實並解釋結果'),tri('Compare the result with your original question. Identify evidence, an alternative explanation and one limitation. Ask another learner to follow your steps. Revise the explanation based on what they could not reproduce.','把结果与最初的问题对照，列出证据、另一种解释和一个局限。请另一位学习者按步骤尝试，针对无法复现的地方修改说明。','把結果與最初的問題對照，列出證據、另一種解釋和一個侷限。請另一位學習者按步驟嘗試，針對無法重現的地方修改說明。')],
  [tri('Check a source and a counterexample','核查来源与反例','核查來源與反例'),tri('Choose one claim from your source. Compare it with another reliable reference and write a case in which it would not apply. Check the author, date, scope and evidence. Mark an unresolved disagreement instead of inventing a subject-specific answer.','选取来源中的一个结论，另找可靠资料对照，并写出不适用的情况。检查作者、日期、范围和证据；有分歧就标记待核实，不编造学科答案。','選取來源中的一個結論，另找可靠資料對照，並寫出不適用的情況。檢查作者、日期、範圍和證據；有分歧就標記待核實，不編造學科答案。')],
  [tri('Rehearse a two-minute explanation','练习两分钟讲解','練習兩分鐘講解'),tri('Explain your question, the bounded exercise, evidence and one limitation to a peer. Label it as a study exercise. Ask the peer what they could not reproduce, then revise that step. Save the sources with your final checklist. This is an explanation rehearsal, not an assessed subject qualification.','向同学用两分钟说明问题、小练习、证据和局限，明确这是学习练习。问对方哪一步无法复现，再修改该步骤。将来源与最终清单一同保存，这不是学科资格评定。','向同學用兩分鐘說明問題、小練習、證據和侷限，明確這是學習練習。問對方哪一步無法重現，再修改該步驟。將來源與最終清單一同儲存，這不是學科資格評定。')]

 ];
 return {id,title,description:tri('A source-led study template. Add and verify subject material before teaching it.','以资料为依据的学习模板，教学前需补充并核实学科内容。','以資料為依據的學習範本，教學前需補充並核實學科內容。'),topic:'foundations',theme:'lavender',duration:60,status:'published',personal:true,origin:'template',level:'beginner',audience:['cs','non-cs'],lessons:rows.map(([title,body],i)=>({id:`${id}-l${i+1}`,title,body,advanced:body,type:'read',minutes:10,workshop:{title,brief:body,questions:[tri('What can you support from your sources?','你的资料能支持什么？','你的資料能支持甚麼？'),tri('What did you try and observe?','你尝试并观察到什么？','你嘗試並觀察到甚麼？'),tri('What remains unresolved?','还有什么未解决？','還有甚麼未解決？')],sample:body,rubric:[tri('I recorded sources and separated evidence from guesses.','我记录了来源，并区分证据和猜测。','我記錄了來源，並區分證據和猜測。')]},hint:tri('Start with your source and an observable question.','先明确资料来源和可检验的问题。','先明確資料來源和可檢驗的問題。')}))};
}
export function buildPlan({courses,topic,profile={},id,courseId}){
 const languageRules=[['cpp',/c\+\+|cpp/i],['javascript',/javascript|\bjs\b/i],['python',/python|派森/i],['html',/html|css/i],['c',/\bc\b(?!\s*\+)|c语言|c語言/i]];
 const language=languageRules.find(([,pattern])=>pattern.test(topic))?.[0];
 if(language&&!(language==='python'&&/script|file|csv|automation|文件|檔案/i.test(topic))){
  const list=referenceTopics.filter(t=>t.language===language),name={c:'C',cpp:'C++',python:'Python',javascript:'JavaScript',html:'HTML/CSS'}[language];
  const included=profile.skillLevel==='beginner'?list.slice(0,3):list;
  const schedule=scheduleLessons(included.map((t,index)=>({kind:'tutorial',tutorialId:t.id,courseId:'programming-'+language,lessonId:t.id,index,title:t.title,courseTitle:tri(`${name} foundations`,`${name} 基础`,`${name} 基礎`),minutes:8})),profile.weeklyMinutes);
  return {course:null,plan:{id,topic,title:tri(`${topic} · learning plan`,`${topic} · 学习计划`,`${topic} · 學習計畫`),...schedule,level:profile.skillLevel||'beginner',source:'programming',createdAt:new Date().toISOString()}};
 }
 let selected=matchCourses(courses,topic,profile.interests||[]),course=null;
 if(!selected.length){course=buildTemplateCourse(topic,courseId);selected=[course];}
 const beginner=(profile.skillLevel||'beginner')==='beginner';
 const lessons=selected.slice(0,2).flatMap(c=>(c.collection==='tools'||c.origin==='template'||!beginner||/\btdd\b/i.test(topic)?c.lessons:c.lessons.slice(0,2)).map(l=>({courseId:c.id,lessonId:l.id,index:c.lessons.indexOf(l),title:l.title,courseTitle:c.title,minutes:l.minutes||Math.ceil(c.duration/c.lessons.length)||8,rationale:c.collection==='tools'?tri('Read the worked case before using the connected lab.','先读案例，再到关联实验检验。','先讀案例，再到關聯實驗檢驗。'):tri('Build the explanation from a concrete case.','从具体案例建立理解。','從具體案例建立理解。')})));
 const practices=[...new Set(selected.flatMap(c=>c.lessons.map(l=>l.practice).filter(Boolean)))];
 const practiceTitle=route=>{const [kind,id]=route.split('/');return kind==='lab'?labs.find(x=>x[0]===id)?.[1]:kind==='challenge'?challenges.find(x=>x.id===id)?.title:interviews.find(x=>x.id===id)?.title;};
 for(const route of practices.filter(x=>!x.startsWith('learn/')&&!x.startsWith('interview/')).slice(0,3))lessons.push({kind:'practice',route,title:practiceTitle(route)||route,courseTitle:tri('Connected practice','关联练习','關聯練習'),minutes:15,rationale:tri('Check the lesson idea with observable results.','通过可观察的结果检验课程概念。','透過可觀察的結果檢驗課程概念。')});
 if(practices.length){const scenario=selected.some(c=>c.id==='llm-apps')?'ml':selected.some(c=>c.id==='data-sql'||c.id==='ml-foundations')?'data':selected.some(c=>c.id==='ai-toolkit'||c.id==='prompt-engineering')?'stakeholder':'team';lessons.push({kind:'practice',route:'interview/'+scenario,title:tri('Explain and review your work','讲清你的实践并复盘','講清你的實踐並回顧'),courseTitle:tri('Explanation rehearsal','讲解练习','講解練習'),minutes:15,rationale:tri('Finish by explaining evidence and limitations, not just marking readings complete.','最后说明证据和局限，不只勾完阅读。','最後說明證據和侷限，不只勾完閱讀。')});}
 const schedule=scheduleLessons(lessons,profile.weeklyMinutes);
 return {course,plan:{id,topic,title:tri(`${topic} · learning plan`,`${topic} · 学习计划`,`${topic} · 學習計畫`),...schedule,level:profile.skillLevel||'beginner',source:course?'template':'catalog',createdAt:new Date().toISOString()}};
}
export function planStepDone(step,state){if(step.kind==='tutorial')return !!state.academy?.tutorials?.includes(step.tutorialId);if(step.kind==='practice'){const [kind,id]=step.route.split('/');return kind==='lab'?!!state.academy?.labResults?.[id]:kind==='challenge'?!!state.academy?.challenges?.[id]?.passed:kind==='interview'?state.academy?.interviews?.some(x=>x.scenarioId===id):false;}return !!state.progress?.[step.courseId]?.includes(step.lessonId);}
export const planStepRoute=step=>step.kind==='practice'?step.route:step.kind==='tutorial'?'tutorial/'+step.tutorialId:`learn/${step.courseId}/${step.index}`;
export function planProgress(plan,s){
 const done=x=>planStepDone(x,s);
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
 return {completed,challenges,quizzes,labs,tutorials,interviews,xp,level:Math.floor(xp/250)+1,levelPercent:Math.round(xp%250/2.5),streak,badges:[completed+tutorials>0,completed+tutorials>=5,quizzes>0,challenges>0,streak>=3,interviews>0,labs>=3]};
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
 const s=structuredClone(state);s.log??=[];if(s.conflict&&!['resolve'].includes(action))throw new Error('Resolve the current conflict before changing history');if(action==='resolve'&&!['ours','theirs','combined'].includes(value))throw new Error('Choose a resolution');
 if(action==='branch'){if(!/^[a-zA-Z][\w/-]{0,35}$/.test(value)||s.branches[value])throw new Error('Choose a new branch name');s.branches[value]=s.branches[s.branch];}
 else if(action==='checkout'){if(!Object.hasOwn(s.branches,value))throw new Error('Unknown branch');s.branch=value;}
 else if(action==='commit'){const id='c'+s.commits.length;s.commits.push({id,parent:s.branches[s.branch],branch:s.branch,message:String(value||'Change').slice(0,80)});s.branches[s.branch]=id;}
 else if(action==='merge'){
  if(!Object.hasOwn(s.branches,value)||value===s.branch)throw new Error('Choose another branch');
  const ancestor=(x,target)=>{const seen=new Set(),pending=[x];while(pending.length){const id=pending.pop();if(!id||seen.has(id))continue;if(id===target)return true;seen.add(id);const c=s.commits.find(c=>c.id===id);if(c)pending.push(c.parent,c.mergeParent);}return false;};
  const current=s.branches[s.branch],incoming=s.branches[value];
  if(ancestor(incoming,current))s.branches[s.branch]=incoming;
  else if(!ancestor(current,incoming))s.conflict={from:value,current,incoming};
 }else if(action==='resolve'){
  if(!s.conflict)throw new Error('No conflict');const id='c'+s.commits.length;s.commits.push({id,parent:s.conflict.current,mergeParent:s.conflict.incoming,branch:s.branch,message:`Resolved merge (${value})`});s.branches[s.branch]=id;s.conflict=null;
 }
 s.log.push(`${action} ${value}`.trim());return s;
}
export {promptReview,promptAnalysis,retrieve,rankDocuments,initialDocker,dockerStep,gradientStep,pipelineResult,diagnosePipeline} from './academy-models.js';
