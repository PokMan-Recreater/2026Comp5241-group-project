import {tri,local} from './i18n.js';
import {referenceTopics,challenges,labs,interviews} from './academy-content.js';
import {practiceForLesson} from './course-practices.js';
import {topicKeywords,hasTopicKeyword} from './topic-matching.js';

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
const keywords=topicKeywords,hasKeyword=hasTopicKeyword;
export function matchCourses(courses,topic='',interests=[]){
 return courses.filter(c=>c.status==='published').map(c=>{const direct=(c.id===topic.trim().toLowerCase()?100:0)+(keywords[c.id]||[]).reduce((n,k)=>n+(hasKeyword(topic.toLowerCase(),k)?6:0),0)+(String(local(c.title)).toLowerCase().includes(topic.toLowerCase())&&topic.trim()?3:0);return {c,direct,score:direct+(keywords[c.id]||[]).reduce((n,k)=>n+(hasKeyword(interests.join(' ').toLowerCase(),k)?1:0),0)};}).filter(x=>x.direct>0).sort((a,b)=>b.score-a.score).map(x=>x.c);
}
export function buildTemplateCourse(topic,id,profile={}){
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
 const level=profile.skillLevel||'beginner',nonCs=profile.audience==='non-cs'||profile.background==='noCoding';
 const framing=nonCs?tri('Use a familiar everyday example; define each new term before using it.','选一个熟悉的日常例子，每个新术语先解释再使用。','選一個熟悉的日常例子，每個新術語先解釋再使用。'):tri('Use a small technical workflow. Record inputs, versions and a reproducible check.','选择小型技术流程，记录输入、版本和可复现检查。','選擇小型技術流程，記錄輸入、版本和可重現檢查。');
 const chosen=rows.map((row,index)=>({row,index})).filter(({index})=>level!=='beginner'||![3,4].includes(index));
 const lessons=chosen.map(({row:[title,body],index:i})=>({id:`${id}-l${i+1}`,title,body:tri(body.en+'\n\n'+framing.en,body['zh-CN']+'\n\n'+framing['zh-CN'],body['zh-TW']+'\n\n'+framing['zh-TW']),advanced:body,type:'read',minutes:10,
  practice:i===5?'interview/study':undefined,
  workshop:{title,brief:body,questions:[tri('What can you support from your sources?','你的资料能支持什么？','你的資料能支持甚麼？'),tri('What did you try and observe?','你尝试并观察到什么？','你嘗試並觀察到甚麼？'),tri('What remains unresolved?','还有什么未解决？','還有甚麼未解決？')],sample:tri('Example — learning a new note-taking tool: I used its official guide (record the link and date), tried creating and finding one note, then asked a classmate to repeat the steps. Search worked for the exact title; synonyms are not yet checked. This example demonstrates a process, not facts about your chosen subject.','例：学习新的笔记工具。我记录官方指南链接和日期，尝试新建并找回一条笔记，请同学复现。精确标题可以找到，同义词尚未验证。这是过程示例，不代表你所选学科的事实。','例：學習新的筆記工具。我記錄官方指南連結和日期，嘗試新增並找回一則筆記，請同學重現。精確標題可以找到，同義詞尚未驗證。這是過程範例，不代表你所選學科的事實。'),rubric:[tri('Sources are identified and claims are traceable.','来源明确，结论可追溯。','來源明確，結論可追溯。'),tri('Someone else can repeat the exercise and check the result.','他人能重复练习并检查结果。','他人能重複練習並檢查結果。'),tri('An unresolved limitation is recorded.','记录了尚未解决的局限。','記錄了尚未解決的侷限。')]},
  check:{question:tri('What would make this study step convincing?','怎样才算有依据地完成这一步？','怎樣才算有依據地完成這一步？'),correct:i%2,options:(i%2?[false,true]:[true,false]).map(ok=>({text:ok?tri('A cited source, a repeatable observation and a stated limitation','有出处、可复现观察，并说明局限','有出處、可重現觀察，並說明侷限'):tri('A confident claim without a source or check','没有来源和检查的肯定说法','沒有來源和檢查的肯定說法'),feedback:ok?tri('Keep evidence separate from what you still need to verify.','把证据和待验证内容分开。','把證據和待驗證內容分開。'):tri('Confidence alone does not establish correctness.','说得肯定不能证明正确。','說得肯定不能證明正確。')}))},hint:framing}));
 const checks=[
 [tri('A source has no author or date. What should you do?','来源没有作者和日期，怎么办？','來源沒有作者和日期，怎麼辦？'),tri('Trace its origin and record the uncertainty','核查出处并记录不确定性','核查出處並記錄不確定性'),tri('Treat a confident tone as proof','把肯定语气当作证据','把肯定語氣當作證據')],
 [tri('Two sources define a term differently. What belongs in your glossary?','两个来源定义不同，词汇表应记录什么？','兩個來源定義不同，詞彙表應記錄甚麼？'),tri('Both sources, their contexts and the unresolved difference','两个来源、各自语境与待解差异','兩個來源、各自語境與待解差異'),tri('Only whichever definition is shorter','只保留更短的定义','只保留更短的定義')],
 [tri('An exercise worked once. What makes it repeatable?','练习成功了一次，怎样让别人复现？','練習成功了一次，怎樣讓別人重現？'),tri('Record input, steps, expected and observed results','记录输入、步骤、预期与实际结果','記錄輸入、步驟、預期與實際結果'),tri('Write only “it worked”','只写“成功了”','只寫「成功了」')],
 [tri('A peer gets a different result. What should you inspect first?','同学得到不同结果，先检查什么？','同學得到不同結果，先檢查甚麼？'),tri('Compare their input and steps with your record','对照输入和步骤记录','對照輸入和步驟紀錄'),tri('Ignore the difference because your attempt succeeded','忽略差异，因为自己成功了','忽略差異，因為自己成功了')],
 [tri('A claim fails in one case. How should you revise your explanation?','一个结论存在反例，说明应怎么改？','一個結論存在反例，說明應怎麼改？'),tri('State the scope, counterexample and next source check','说明适用范围、反例与后续核查','說明適用範圍、反例與後續核查'),tri('Remove the counterexample from your notes','从笔记中删掉反例','從筆記中刪掉反例')],
 [tri('Your listener cannot repeat a step. What should you change?','听众无法重复一个步骤，该改什么？','聽眾無法重複一個步驟，該改甚麼？'),tri('Clarify that step and ask them to try it again','补清那一步，再请对方尝试','補清那一步，再請對方嘗試'),tri('Make the conclusion sound more certain','把结论说得更肯定','把結論說得更肯定')],
 ];
 for(const lesson of lessons){lesson.advanced=lesson.body;const index=Number(lesson.id.split('-l').at(-1))-1,[question,good,bad]=checks[index];lesson.check.question=question;lesson.check.options.forEach((option,i)=>option.text=i===lesson.check.correct?good:bad);}

 return {id,title,description:tri('A source-led study project with checks and an explanation rehearsal.','以资料为依据，包含检查与讲解练习的学习项目。','以資料為依據，包含檢查與講解練習的學習專案。'),topic:'foundations',theme:'lavender',duration:lessons.reduce((n,l)=>n+l.minutes,0),status:'published',personal:true,origin:'template',level,audience:profile.audience&&profile.audience!=='all'?[profile.audience]:['cs','non-cs'],lessons};
}

export function buildPlan({courses,topic,profile={},id,courseId}){
 const languageRules=[['cpp',/c\+\+|\bcpp\b/i],['javascript',/javascript|\bjs\b/i],['python',/python|派森/i],['html',/html|css/i],['c',/\bc\b(?!\s*\+)|c语言|c語言/i]];
 const languageMatches=languageRules.filter(([,pattern])=>pattern.test(topic)).filter(([language])=>!(language==='python'&&/script|file|csv|automation|文件|檔案/i.test(topic)));
 let selected=matchCourses(courses,topic,profile.interests||[]),course=null;
 // A language course can coexist with another requested subject; do not let it swallow that subject.
 if(languageMatches.some(([x])=>x==='python'))selected=selected.filter(c=>c.id!=='python-first-steps');
 const beginner=(profile.skillLevel||'beginner')==='beginner';
 const stages=[],seen=new Set();
 const addStage=(stageId,title,steps)=>{const unique=steps.filter(x=>{const key=x.kind==='practice'?x.route:x.kind==='tutorial'?'tutorial/'+x.tutorialId:x.courseId+':'+x.lessonId;if(seen.has(key))return false;seen.add(key);return true;});if(unique.length)stages.push({id:stageId,title,steps:unique.map(x=>({...x,stageId}))});};
 for(const [language] of languageMatches){const name={c:'C',cpp:'C++',python:'Python',javascript:'JavaScript',html:'HTML/CSS'}[language],list=referenceTopics.filter(t=>t.language===language),included=beginner?list.slice(0,3):list;addStage('language-'+language,tri(`${name} foundations`,`${name} 基础`,`${name} 基礎`),included.map((t,index)=>({kind:'tutorial',tutorialId:t.id,courseId:'programming-'+language,lessonId:t.id,index,title:t.title,courseTitle:tri(`${name} foundations`,`${name} 基础`,`${name} 基礎`),minutes:8,rationale:tri('Read an example, change it and check your prediction.','先读例子，再修改并检查预测。','先讀範例，再修改並檢查預測。')})));}
 if(!selected.length&&!languageMatches.length){course=buildTemplateCourse(topic,courseId,profile);selected=[course];}
 const practiceRoutes=[];
 for(const c of selected){const included=c.collection==='tools'||c.origin==='template'||!beginner||/\btdd\b/i.test(topic)?c.lessons:c.lessons.slice(0,2);addStage('course-'+c.id,c.title,included.map(l=>({courseId:c.id,lessonId:l.id,index:c.lessons.indexOf(l),title:l.title,courseTitle:c.title,minutes:l.minutes||8,rationale:tri('Work through this case before the connected practice.','先学这一案例，再完成关联练习。','先學這一案例，再完成關聯練習。')})));
  for(const l of included){const routes=l.practice?[l.practice]:practiceForLesson(c.id,c.lessons.indexOf(l));for(const route of routes)practiceRoutes.push({route,from:c.id});}
 }
 const toPractice=({route,from})=>{const [kind,pid,index]=route.split('/');if(kind==='learn'){const c=courses.find(x=>x.id===pid),l=c?.lessons[Number(index)];return l&&{courseId:c.id,lessonId:l.id,index:Number(index),title:l.title,courseTitle:c.title,minutes:l.minutes||8,rationale:tri('Use this connected case to apply the idea.','用关联案例应用所学。','用關聯案例應用所學。')};}if(kind==='tutorial'){const t=referenceTopics.find(x=>x.id===pid);return t&&{kind:'tutorial',tutorialId:t.id,lessonId:t.id,title:t.title,minutes:8,courseTitle:t.title,rationale:tri('Apply the idea in a programming exercise.','通过编程练习应用概念。','透過程式練習應用概念。')};}const title=kind==='lab'?labs.find(x=>x[0]===pid)?.[1]:kind==='challenge'?challenges.find(x=>x.id===pid)?.title:kind==='interview'?interviews.find(x=>x.id===pid)?.title:kind==='game'?tri('Launch challenge','上线挑战','上線挑戰'):kind==='playground'?tri('Trace a small program','跟踪一个小程序','追蹤一個小程式'):null;return title&&{kind:'practice',route,from,title,courseTitle:tri('Practice','实践','實作'),minutes:15,rationale:tri('Use observable results to check your understanding.','用可观察的结果检验理解。','用可觀察的結果檢驗理解。')};};
 const languageTasks={javascript:'fizzbuzz'};
 for(const [language] of languageMatches)practiceRoutes.push({route:language==='javascript'?'challenge/'+languageTasks[language]:'playground/'+language,from:'programming-'+language});
 const exercises=practiceRoutes.filter(x=>!x.route.startsWith('interview/')).map(x=>x.route==='playground/html'?{kind:'practice',route:x.route,from:x.from,title:tri('Build an interactive page','制作交互网页','製作互動網頁'),courseTitle:tri('Practice','实践','實作'),minutes:15,rationale:tri('Connect a button to a DOM update in the isolated preview.','在隔离预览中让按钮更新页面。','在隔離預覽中讓按鈕更新頁面。')}:toPractice(x)).filter(Boolean);
 addStage('practice',tri('Try it yourself','动手验证','動手驗證'),exercises);
 const scenario=course?'study':selected.some(c=>c.id==='ml-foundations')?'ml-delivery':selected.some(c=>c.id==='llm-apps')?'ml':selected.some(c=>c.id==='data-sql')?'sql-case':selected.some(c=>c.id==='ai-toolkit'||c.id==='prompt-engineering')?'stakeholder':languageMatches.some(([x])=>['html','javascript'].includes(x))?'frontend':languageMatches.length?'study':'team';
 const rehearsals=practiceRoutes.filter(x=>x.route.startsWith('interview/')).map(toPractice).filter(Boolean);if(!rehearsals.length)rehearsals.push(toPractice({route:'interview/'+scenario}));
 addStage('review',tri('Explain and review','讲解与复盘','講解與回顧'),rehearsals);
 const schedule=scheduleLessons(stages.flatMap(x=>x.steps),profile.weeklyMinutes);
 const modules=stages.map(({id,title})=>({id,title,steps:schedule.steps.filter(x=>x.stageId===id)}));
 const titles=lang=>[...languageMatches.map(([x])=>({cpp:'C++',javascript:'JavaScript',python:'Python',html:'HTML/CSS',c:'C'}[x])),...selected.map(c=>local(c.title,lang))];
 const rationale=tri(`Your topic matched ${titles('en').join(', ')}. Study the examples, try the connected exercises, then explain what you checked.`, `根据你的主题安排了 ${titles('zh-CN').join('、')}。先学案例，再做关联练习，最后说明验证结果。`,`依你的主題安排了 ${titles('zh-TW').join('、')}。先學案例，再做關聯練習，最後說明驗證結果。`);
 return {course,plan:{id,topic,title:tri(`${topic} · learning plan`,`${topic} · 学习计划`,`${topic} · 學習計畫`),...schedule,modules,rationale,matchedCourses:selected.map(c=>c.id),level:profile.skillLevel||'beginner',source:course?'template':languageMatches.length&&!selected.length?'programming':'catalog',createdAt:new Date().toISOString()}};
}

export function planStepDone(step,state){if(step.kind==='tutorial')return !!state.academy?.tutorials?.includes(step.tutorialId);if(step.kind==='practice'){const [kind,id]=step.route.split('/');return kind==='lab'?!!state.academy?.labResults?.[id]:kind==='challenge'?!!state.academy?.challenges?.[id]?.passed:kind==='interview'?state.academy?.interviews?.some(x=>x.scenarioId===id):kind==='game'?!!state.game?.result:kind==='playground'?!!state.academy?.pageExercises?.[id]?.completed:false;}return !!state.progress?.[step.courseId]?.includes(step.lessonId);}
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
