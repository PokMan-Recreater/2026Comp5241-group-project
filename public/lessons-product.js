import courseAudio from './course-audio-manifest.js';
import {kit,frame} from './lesson-art-kit.js';

function affectedArt(step,p,lang){
 const {text,path,group,face,phone,doc,ok,no,speech,lens,clock}=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${face(110,106,'#bad7c2')}${phone(190,84,0.85)}
  ${text(150,216,'使用者：学生','User: student',11,'#242032','middle')}${text(150,236,'打开预约页','Opens the booking page',10,'#665e72','middle')}
  ${face(430,110,'#e9c58b')}${face(536,110,'#c8b8e5')}${face(642,110,'#bad7c2')}
  ${text(536,208,'受影响者','Affected people',11,'#a64e44','middle')}${text(536,228,'老师 · 社团 · 候补学生','Teachers · clubs · waitlist',10,'#665e72','middle')}
  ${group(.35,path('M212 150Q300 170 388 158','#b96559',true)+text(300,146,'规则一变，影响扩散','A rule change ripples out',10,'#a64e44','middle'))}
  ${text(360,300,'使用者操作界面，受影响者承担结果','Users operate the interface; affected people carry the outcome',13,'#665e72','middle')}
  ${text(360,326,'两类人都要问','Ask about both groups',12,'#665e72','middle')}
 `;
 if(step===1)body=`
  <circle cx="360" cy="170" r="54" fill="#f3eef9" stroke="#292535" stroke-width="2"/>${text(360,164,'预约系统','Booking',13,'#242032','middle')}${text(360,184,'规则','Rules',10,'#665e72','middle')}
  ${group(.12,face(180,64,'#bad7c2')+text(180,128,'直接使用者','Direct users',10,'#34734b','middle'))}
  ${group(.24,face(540,64,'#e9c58b')+text(540,128,'间接相关者','Indirect',10,'#8a6a25','middle'))}
  ${group(.36,face(120,270,'#c8b8e5')+text(120,336,'被排除的人','Excluded',10,'#a64e44','middle'))}
  ${group(.48,clock(600,246)+text(600,290,'候补者','Waitlisted',10,'#665e72','middle'))}
  ${path('M220 96L314 138','#34734b',true)}${path('M500 96L406 138','#b58a1f',true)}${path('M160 246L312 198','#b96559',true)}${path('M572 232L408 190','#7967ac',true)}
  ${group(.66,`<circle cx="360" cy="170" r="96" fill="none" stroke="#a49ab8" stroke-width="2" stroke-dasharray="5 7"/><circle cx="360" cy="170" r="140" fill="none" stroke="#a49ab8" stroke-width="2" stroke-dasharray="5 7"/>`)}
  ${text(360,346,'三层：谁用、谁受影响、谁被挡在外面','Three rings: who uses, who is affected, who is shut out',11,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${text(360,42,'被“预约需要手机”挡在门外的人','Who “booking needs a phone” shuts out',13,'#242032','middle')}
  ${/** @type {[number,string,string,string][]} */ ([[92,'没有智能手机','No smartphone',phone(64,84,0.8)],[300,'行动不便','Mobility limits',face(330,96,'#c8b8e5')],[540,'不会用小程序','Cannot use the app',speech(520,86,130,'怎么点？','How do I?')]]).map(([x,a,ae,ic],i)=>group(.12+i*.2,`${ic}${text(x+34,196,a,ae,11,'#242032','middle')}${no(x+24,224,'#b96559')}`)).join('')}
  ${group(.7,text(360,282,'每多一道门槛，就多一群人被排除','Every extra barrier excludes another group',13,'#a64e44','middle'))}
  ${text(360,326,'先找门槛，再谈功能','Find the barriers before adding features',11,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${face(120,104,'#bad7c2')}${speech(160,56,200,'我怕占着位置不用','I worry about holding a seat unused')}
  ${face(610,104,'#e9c58b')}${speech(420,180,214,'换课当天才知道','I learn on the day it changes')}
  ${doc(300,240,'#e7f2e7',80,74)}${text(340,338,'走访与数据','Interviews and data',10,'#34734b','middle')}
  ${group(.36,path('M170 150Q230 230 292 262','#7967ac',true))}
  ${group(.56,path('M560 216Q470 250 392 262','#7967ac',true))}
  ${group(.74,lens(200,270)+text(226,275,'先确认，再设计','Confirm before designing',11,'#7967ac'))}
  ${group(.86,ok(520,262)+text(474,310,'想象被证据替换','Imagination replaced by evidence',11,'#34734b'))}
 `;
 return frame(body,['谁在使用，谁在受影响','Who uses it, who is affected'],lang);
}

function constraintsArt(step,p,lang){
 const {text,path,group,doc,db,ok,no,warn,clock,lock,speech}=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${text(360,40,'约束不是凭空来的','Constraints come from somewhere',13,'#242032','middle')}
  ${/** @type {[number,string,string,string][]} */ ([[72,'学校规定','Policy',doc(92,88,'#fff4d4')],[252,'法律与隐私','Law and privacy',lock(292,108)],[430,'预算与人力','Budget and staff','<circle cx="470" cy="120" r="24" fill="#fff4d4" stroke="#292535" stroke-width="2"/><text x="470" y="128" text-anchor="middle" font-size="18" fill="#8a6a25" font-weight="600">¥</text>'],[610,'现有技术','Existing tech',db(634,100)]]).map(([x,a,ae,ic],i)=>group(.1+i*.18,`${ic}${text(x+22,206,a,ae,11,'#242032','middle')}`)).join('')}
  ${group(.8,text(360,290,'约束不是障碍，是方案必须满足的条件','Constraints are conditions, not obstacles',13,'#665e72','middle'))}
  ${text(360,326,'先找到来源，才知道能不能改','Find the source before asking to change it',11,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${speech(58,58,190,'页面要快一点','The page should be fast')}
  ${path('M254 82H320')}
  ${clock(372,86)}${text(372,132,'2 秒内首屏','First paint under 2s',11,'#665e72','middle')}
  ${speech(58,180,190,'提醒别太多','Not too many reminders')}
  ${path('M254 204H320')}
  ${speech(368,180,220,'每天最多 1 条','At most one per day')}
  ${group(.5,`<path d="M214 148l48 20" fill="none" stroke="#d4a735" stroke-width="2.5" stroke-linecap="round"/>`+text(238,168,'换成数字','Turn it into a number',10,'#8a6a25','middle'))}
  ${group(.78,ok(500,282)+text(524,287,'可测量，才能验收','Measurable, therefore acceptable',11,'#34734b'))}
  ${text(360,330,'形容词变阈值，规则才能写进测试','Adjectives become thresholds that tests can check',13,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${text(40,44,'距离开始','Starts in',11)}${text(180,44,'角色','Role',11)}${text(330,44,'规则结果','Outcome',11)}
  <path d="M30 58H690" stroke="#292535" stroke-width="2"/>
  ${group(.1,text(40,96,'> 2 小时','> 2 hours',11)+text(180,96,'学生','Student',11)+ok(346,96)+text(372,96,'可以取消并释放','Cancel and release',11,'#34734b'))}
  ${group(.28,text(40,150,'≤ 2 小时','≤ 2 hours',11)+text(180,150,'学生','Student',11)+no(346,150,'#b96559')+text(372,150,'不可取消','Cannot cancel',11,'#a64e44'))}
  ${group(.46,text(40,204,'任意时间','Any time',11)+text(180,204,'管理员','Admin',11)+ok(346,204)+text(372,204,'可强制释放并记录','Force release, logged',11,'#34734b'))}
  ${group(.64,text(40,258,'活动已开始','Already started',11)+text(180,258,'所有人','Everyone',11)+no(346,258,'#b96559')+text(372,258,'转为缺席记录','Mark as no-show',11,'#a64e44'))}
  <path d="M30 282H690" stroke="#a49ab8" stroke-width="2" stroke-dasharray="5 6"/>
  ${group(.8,text(40,310,'条件 → 结果，一行就是一条可测试规则','Condition → outcome: one row, one testable rule',11,'#665e72'))}
 `;
 if(step===3)body=`
  ${warn(120,92,'#b96559')}${text(120,136,'规则冲突','Rules conflict',11,'#a64e44','middle')}
  ${speech(160,54,220,'公平：先到先得','Fairness: first come, first served')}
  ${speech(430,150,230,'安全：超过人数不能再进','Safety: capacity cannot be exceeded')}
  ${path('M190 108Q300 120 430 166','#b96559',true)}
  ${group(.42,text(360,214,'谁优先？写成顺序，而不是临场争论','Who wins? Write an order, not a debate',13,'#242032','middle'))}
  ${group(.62,`<rect x="180" y="236" width="360" height="44" rx="10" fill="#f3eef9" stroke="#292535" stroke-width="2"/>${text(360,264,'安全 > 公平 > 便利','Safety > fairness > convenience',13,'#242032','middle')}`)}
  ${group(.8,ok(300,310)+text(322,315,'冲突有默认答案','Conflicts have a default answer',11,'#34734b'))}
 `;
 return frame(body,['把约束写成可验证的规则','Write constraints as testable rules'],lang);
}

function compareArt(step,p,lang){
 const {text,group,face,phone,doc,ok,no,speech,clock}=kit(p,lang);
 let body='';
 if(step===0)body=`
  <rect x="56" y="56" width="608" height="196" rx="14" fill="#f3eef9" stroke="#292535" stroke-width="2"/>
  ${text(80,92,'问题陈述骨架','Problem statement skeleton',13)}
  ${text(80,132,'当','When',14,'#7967ac')}${text(130,132,'计划改变','plans change',14,'#7967ac')}${text(80,166,'学生需要释放名额，组织者需要避免占位不用。','a student needs to free a seat; organizers must avoid unused holds.',12,'#242032')}
  ${group(.3,text(80,206,'但','But',13,'#8a6a25')+text(130,206,'活动开始前两小时内不能取消。','cancellation closes two hours before the start.',12,'#8a6a25'))}
  ${group(.6,text(80,238,'因为','Because',13,'#34734b')+text(158,238,'名额有限，候补的人也在等。','seats are limited and the waitlist is waiting.',12,'#34734b'))}
  ${group(.75,face(600,250,'#bad7c2'))}
  ${text(360,300,'对象、场景、目标、约束，一句都要有','People, situation, goal and constraint in one statement',12,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${text(360,40,'至少三个方案，而不是一个','At least three options, not one',13,'#242032','middle')}
  ${/** @type {[number,string,string,string,string,string][]} */ ([[46,'取消按钮','Cancel button',phone(120,72,0.8),'学生主动操作','Student acts'],[278,'自动释放','Auto release',clock(350,96),'到时自动释放','Expires automatically'],[494,'提前提醒','Reminder',speech(500,84,180,'活动要开始了','Event starts soon'),'提醒减少占位','Reminds holders']]).map(([x,a,ae,ic,note,noteEn],i)=>group(.14+i*.2,`<rect x="${x}" y="58" width="180" height="190" rx="12" fill="#fffefb" stroke="#292535" stroke-width="2"/>${ic}${text(x+90,196,a,ae,12,'#242032','middle')}${text(x+90,218,note,noteEn,9,'#665e72','middle')}`)).join('')}
  ${text(360,306,'方案之间要有真正的差别','The options must genuinely differ',12,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${text(40,44,'评价标准','Criteria',11)}${text(210,44,'按钮','Button',11)}${text(390,44,'自动释放','Auto',11)}${text(570,44,'提醒','Remind',11)}
  <path d="M30 58H690" stroke="#292535" stroke-width="2"/>
  ${/** @type {[number,string,string,string,string,string][]} */ ([[96,'实现成本','Cost',ok(226,96),ok(404,96),ok(584,96)],[146,'对候补公平','Fair to waitlist',no(226,146,'#b96559'),ok(404,146),no(584,146,'#b96559')],[196,'减少无效占位','Fewer dead holds',no(226,196,'#b96559'),ok(404,196),ok(584,196)],[246,'可解释性','Explainability',ok(226,246),no(404,246,'#b96559'),ok(584,246)]]).map(([y,a,ae,c1,c2,c3],i)=>group(.08+i*.16,`${text(40,y,a,ae,11,'#242032')}${c1}${c2}${c3}`)).join('')}
  ${text(360,300,'同一把尺子，逐项比较','Compare every option with the same ruler',12,'#665e72','middle')}
  ${text(360,326,'标准来自目标与约束','Criteria come from goal and constraints',11,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${doc(90,64,'#e7f2e7',300,180)}${text(120,96,'决定记录','Decision record',13,'#34734b')}
  ${text(120,130,'选择：自动释放 + 提前提醒','Choose: auto release plus reminder',11,'#24553a')}
  ${text(120,158,'理由：对候补更公平','Why: fairer to the waitlist',11,'#24553a')}
  ${text(120,186,'放弃：纯按钮方案','Rejected: button only',11,'#24553a')}
  ${text(120,214,'风险：提醒可能被忽略','Risk: reminders may be ignored',11,'#24553a')}
  ${group(.4,face(520,110,'#bad7c2')+text(520,186,'负责人签字','Owner signs',10,'#665e72','middle'))}
  ${group(.6,clock(520,236)+text(520,282,'2026 · 11','2026 · 11',10,'#665e72','middle'))}
  ${group(.8,speech(360,278,300,'下次改规则，先看这张记录','Before changing rules, read this record'))}
  ${text(360,344,'记录让决定可追溯，也让复盘有依据','Records make decisions traceable and reviews possible',11,'#665e72','middle')}
 `;
 return frame(body,['问题陈述与方案比较','Problem statements and comparing solutions'],lang);
}

const base={section:'03 产品与协作技能',sectionEn:'03 PRODUCT AND PEOPLE SKILLS',position:'03 · 定义问题',positionEn:'03 · Defining the problem',audio:true};

export const usersAffectedLesson={...base,
 id:'users-affected',code:'3.1',courseId:'problem-definition',
 title:'谁在使用，谁在受影响',titleEn:'Who uses it, who is affected',
 sceneTitle:'谁在使用，谁在受影响',sceneTitleEn:'Who uses it, who is affected',
 audioManifest:courseAudio['users-affected'],
 steps:[
  {title:'使用者不等于受影响者',en:'Users are not the only affected',seconds:19,
   script:['直接打开预约页的是学生，但规则的变化会影响老师、社团和候补名单上的人。','使用者操作界面，受影响的人承担结果，两者并不重合。','只问谁在点击，就会漏掉那些没有说话机会的人。'],
   enScript:['Students open the booking page, but rule changes also affect teachers, clubs and people on the waitlist.','Users operate the interface while affected people carry the outcome; the two groups do not overlap.','Asking only who clicks misses the people without a voice in the discussion.'],
   notes:['受影响的人不一定使用界面。','两类人都要进入问题讨论。'],
   enNotes:['Affected people do not always use the interface.','Bring both groups into the discussion.'],
   conceptZh:'使用者与受影响者',conceptEn:'Users and affected people',conceptNoteZh:'操作界面 ≠ 承担结果',conceptNoteEn:'Operating the UI is not carrying the outcome'},
  {title:'画出利益相关者地图',en:'Map the stakeholders',seconds:20,
   script:['把相关的人分成三层：直接使用者、间接相关者、被排除在外的人。','直接使用者完成主任务，间接相关者依赖数据或规则，被排除者连入口都没有。','画出地图，讨论范围才不会只围着界面转。'],
   enScript:['Sort the people into three rings: direct users, indirect stakeholders and those excluded.','Direct users complete the main task, indirect stakeholders depend on data or rules, and excluded people lack even an entry point.','A map keeps the discussion from circling only around the interface.'],
   notes:['范围越清楚，遗漏越少。','被排除的人往往需要不同的入口。'],
   enNotes:['A clearer scope leaves fewer omissions.','Excluded people often need a different entry point.'],
   conceptZh:'利益相关者地图',conceptEn:'Stakeholder map',conceptNoteZh:'直接、间接、被排除',conceptNoteEn:'Direct, indirect, excluded'},
  {title:'谁被排除在外',en:'Who is left out',seconds:20,
   script:['如果预约必须用智能手机，没有手机的人就被排除在外。','行动不便的人、不会使用小程序的人、临时访客，都需要单独考虑。','每多一道门槛，就多一群人无法参与。'],
   enScript:['If booking requires a smartphone, people without one are excluded.','People with mobility limits, people who cannot use the mini-program, and temporary visitors all need separate thought.','Every extra barrier excludes another group.'],
   notes:['先找门槛，再谈新增功能。','无障碍不是附加项，而是参与条件。'],
   enNotes:['Find barriers before adding features.','Accessibility is a condition of participation, not an extra.'],
   conceptZh:'被排除者',conceptEn:'Excluded people',conceptNoteZh:'门槛决定谁能参与',conceptNoteEn:'Barriers decide who can participate'},
  {title:'用证据确认，不靠想象',en:'Confirm with evidence',seconds:20,
   script:['可以猜测学生为什么占位，但猜测不能直接变成规则。','走访几位真实用户、看预约记录，确认占位发生的条件和频率。','有了证据，讨论才能从“我觉得”转向“我们观察到”。'],
   enScript:['You can guess why students hold seats, but guesses should not become rules directly.','Talk to a few real users and inspect booking records to confirm when and how often holds happen.','With evidence, discussion moves from “I think” to “we observed”.'],
   notes:['少量真实案例胜过大量想象。','证据也帮助你判断问题的优先级。'],
   enNotes:['A few real cases beat a lot of imagination.','Evidence also helps rank the problem.'],
   conceptZh:'证据确认',conceptEn:'Confirm with evidence',conceptNoteZh:'走访与数据',conceptNoteEn:'Interviews and data'},
 ].map((s,i)=>({...s,art:(p,lang)=>affectedArt(i,p,lang)}))};

export const testableConstraintsLesson={...base,
 id:'testable-constraints',code:'3.1',courseId:'problem-definition',
 title:'把约束写成可验证的规则',titleEn:'Write constraints as testable rules',
 sceneTitle:'把约束写成可验证的规则',sceneTitleEn:'Write constraints as testable rules',
 audioManifest:courseAudio['testable-constraints'],
 steps:[
  {title:'约束从哪里来',en:'Where constraints come from',seconds:19,
   script:['约束可能来自学校规定、法律与隐私要求、预算和人力，也可能来自现有技术。','不同来源的约束，可以改变的程度并不一样。','先找到来源，才知道该讨论规则，还是讨论资源。'],
   enScript:['Constraints can come from school policy, law and privacy, budget and staffing, or existing technology.','Constraints from different sources can be changed to different degrees.','Find the source before debating the rule or the resources.'],
   notes:['约束不是障碍，是方案必须满足的条件。','来源清楚的约束更容易协商。'],
   enNotes:['Constraints are conditions, not obstacles.','A constraint with a clear source is easier to negotiate.'],
   conceptZh:'约束来源',conceptEn:'Sources of constraints',conceptNoteZh:'规定、法律、预算、技术',conceptNoteEn:'Policy, law, budget, technology'},
  {title:'把形容词变成阈值',en:'Turn adjectives into thresholds',seconds:20,
   script:['“页面要快一点”“提醒别太多”都是感受，不是可执行的规则。','换成数字：首屏两秒内出现；每人每天最多一条提醒。','阈值可以测量，也就能写进测试。'],
   enScript:['“The page should be fast” and “not too many reminders” are feelings, not executable rules.','Replace them with numbers: first paint within two seconds; at most one reminder per person per day.','A threshold can be measured, and therefore written into a test.'],
   notes:['形容词变阈值，规则才能验收。','阈值要说明在什么条件下测量。'],
   enNotes:['Adjectives become thresholds that can be accepted.','A threshold needs its measurement conditions.'],
   conceptZh:'阈值',conceptEn:'Thresholds',conceptNoteZh:'感受变成可测量的数字',conceptNoteEn:'Feelings become measurable numbers'},
  {title:'用条件到结果写规则',en:'Write rules as conditions to outcomes',seconds:21,
   script:['一条规则可以写成：条件满足时，系统应该产生什么结果。','把距离开始的时间、角色、结果排成表，每一行都是一个测试用例。','例外也要写进表里，而不是留给实现时临场决定。'],
   enScript:['A rule can be written as: when the condition holds, the system should produce this outcome.','Lay out time before start, role and outcome in a table; each row becomes a test case.','Exceptions belong in the table too, not left to implementation time.'],
   notes:['决策表把模糊规则变成可检查的条目。','表里没有覆盖的情况，就是风险。'],
   enNotes:['A decision table turns vague rules into checkable rows.','Uncovered rows in the table are risks.'],
   conceptZh:'决策表',conceptEn:'Decision table',conceptNoteZh:'条件 → 结果，一行一测',conceptNoteEn:'Condition to outcome, one row per test'},
  {title:'冲突时写出优先级',en:'Write down priority when rules conflict',seconds:19,
   script:['规则之间可能冲突，比如先到先得与人数上限同时出现。','与其临场争论，不如提前写出优先级：安全高于公平，公平高于便利。','有默认顺序，团队才能在同样的情形下做出一致的决定。'],
   enScript:['Rules can conflict, for example first-come-first-served meeting a capacity limit.','Instead of debating on the spot, write the priority: safety above fairness, fairness above convenience.','With a default order, the team makes consistent decisions in the same situation.'],
   notes:['冲突不是错误，是需要提前决定的取舍。','优先级要写进问题陈述和规则文档。'],
   enNotes:['Conflict is not an error; it is a trade-off to decide in advance.','Put the priority in the problem statement and rule docs.'],
   conceptZh:'规则优先级',conceptEn:'Rule priority',conceptNoteZh:'安全 > 公平 > 便利',conceptNoteEn:'Safety > fairness > convenience'},
 ].map((s,i)=>({...s,art:(p,lang)=>constraintsArt(i,p,lang)}))};

export const compareSolutionsLesson={...base,
 id:'compare-solutions',code:'3.1',courseId:'problem-definition',
 title:'问题陈述与方案比较',titleEn:'Problem statements and comparing solutions',
 sceneTitle:'问题陈述与方案比较',sceneTitleEn:'Problem statements and comparing solutions',
 audioManifest:courseAudio['compare-solutions'],
 steps:[
  {title:'一句问题陈述的骨架',en:'The shape of a problem statement',seconds:20,
   script:['一句问题陈述包含四件事：对象、场景、目标和约束。','例如：当计划改变时，学生需要释放已占用的名额，而活动开始前两小时内不能取消。','这句话不指定界面，却给方案留下了比较的空间。'],
   enScript:['A problem statement contains four things: people, situation, goal and constraint.','For example: when plans change, a student needs to release a booked seat, while cancellation closes two hours before the start.','The sentence does not prescribe an interface, yet leaves room to compare solutions.'],
   notes:['问题陈述描述需要，不预设方案。','四件事缺一件，方案比较就会失真。'],
   enNotes:['A problem statement describes a need without prescribing a solution.','Missing one of the four pieces distorts comparison.'],
   conceptZh:'问题陈述',conceptEn:'Problem statement',conceptNoteZh:'对象、场景、目标、约束',conceptNoteEn:'People, situation, goal, constraint'},
  {title:'生成多个方案',en:'Generate more than one solution',seconds:19,
   script:['问题清楚之后，先不要急着选第一个方案。','按钮、自动释放、提前提醒，各自解决同一个问题的不同部分。','方案数量足够，比较才有意义。'],
   enScript:['Once the problem is clear, do not rush to the first solution.','A button, automatic release and a reminder each address a different part of the same problem.','Comparison is only meaningful with enough options.'],
   notes:['第一个方案通常只是最熟悉的方案。','方案要真正不同，不是换皮。'],
   enNotes:['The first option is usually just the most familiar one.','Options must differ substantively, not cosmetically.'],
   conceptZh:'多方案',conceptEn:'Multiple options',conceptNoteZh:'不同思路，而非换皮',conceptNoteEn:'Different ideas, not reskins'},
  {title:'用同一把尺子比较',en:'Compare with one ruler',seconds:20,
   script:['比较方案要用同一组标准：实现成本、对候补是否公平、能否减少无效占位、是否容易解释。','标准来自目标与约束，而不是来自你喜欢的方案。','逐项比较，才能看出每个方案牺牲了什么。'],
   enScript:['Compare options with the same criteria: implementation cost, fairness to the waitlist, reduction of dead holds and explainability.','Criteria come from the goal and constraints, not from the option you already like.','Row-by-row comparison shows what each option gives up.'],
   notes:['先定标准，再看方案。','没有标准时，讨论会变成偏好之争。'],
   enNotes:['Set criteria before looking at options.','Without criteria, discussion becomes a contest of preferences.'],
   conceptZh:'比较标准',conceptEn:'Comparison criteria',conceptNoteZh:'来自目标与约束',conceptNoteEn:'Derived from goal and constraints'},
  {title:'决定、记录与复盘',en:'Decide, record, review',seconds:20,
   script:['选定方案后，写下理由、被放弃的方案和已知风险。','记录让后来的人理解当时的限制，而不是重新猜一遍。','上线后复盘：哪些假设成立，哪些需要修正。'],
   enScript:['After choosing, record the reason, the rejected options and the known risks.','A record lets later readers understand the constraints instead of guessing again.','Review after launch: which assumptions held and which need revision.'],
   notes:['决定记录是团队记忆。','复盘针对假设，不针对人。'],
   enNotes:['A decision record is team memory.','Review the assumptions, not the people.'],
   conceptZh:'决定记录',conceptEn:'Decision record',conceptNoteZh:'理由、放弃项、风险',conceptNoteEn:'Reason, rejected options, risks'},
 ].map((s,i)=>({...s,art:(p,lang)=>compareArt(i,p,lang)}))};

function scopeArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  <circle cx="300" cy="170" r="112" fill="#e7f2e7" stroke="#34734b" stroke-width="2" stroke-dasharray="8 6"/>
  ${k.text(300,124,'本轮范围','This round',13,'#34734b','middle')}
  ${k.ok(250,160)}${k.text(274,165,'释放名额','Release a seat',11,'#34734b')}
  ${k.group(.3,k.ok(250,200)+k.text(274,205,'提前提醒','Advance reminder',11,'#34734b'))}
  ${k.group(.6,k.no(492,110,'#b96559'))}${k.text(516,115,'改造全部课程','Rebuild all courses',11,'#b96559')}
  ${k.group(.72,k.no(492,182,'#b96559'))}${k.text(516,187,'自动排课','Auto scheduling',11,'#b96559')}
  ${k.group(.84,k.no(492,254,'#b96559'))}${k.text(516,259,'接入支付','Payments',11,'#b96559')}
  ${k.path('M412 170H470','#b96559',true)}
  ${k.text(360,324,'范围说明做哪些，也说明不做哪些','Scope says what is in and what is out',13,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'非目标不是遗漏','Non-goals are not omissions',14,'#242032','middle')}
  ${k.box(48,72,606,196,'#fffefb')}
  ${k.text(70,100,'非目标','Non-goals',12)}
  ${k.group(.18,k.text(70,130,'· 不改变评分规则','· Do not change scoring rules',11,'#665e72')+k.text(470,130,'原因：影响面大','Why: wide impact',10,'#8a6a25'))}
  ${k.group(.34,k.text(70,164,'· 不做移动端专属版本','· No mobile-only version',11,'#665e72')+k.text(470,164,'原因：本轮没有资源','Why: no capacity now',10,'#8a6a25'))}
  ${k.group(.5,k.text(70,198,'· 不自动排课','· No auto scheduling',11,'#665e72')+k.text(470,198,'原因：需求未确认','Why: need unconfirmed',10,'#8a6a25'))}
  ${k.group(.66,k.text(70,232,'· 不接入外部日历','· No outside calendar',11,'#665e72')+k.text(470,232,'原因：依赖未就绪','Why: dependency not ready',10,'#8a6a25'))}
  ${k.group(.84,k.chip(210,280,300,'写清原因，别人才不会反复问','State reasons to stop repeat questions','#f3eef9'))}
  ${k.text(360,330,'非目标是提前说清的边界','Non-goals are boundaries stated in advance',11,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.text(360,44,'范围变化要重新决定','Scope changes need a new decision',14,'#242032','middle')}
  ${k.box(48,72,290,170,'#f9e8e2')}
  ${k.text(70,100,'顺手的请求','A casual request',12,'#a64e44')}
  ${k.speech(70,118,240,'能不能顺便加导出？','Can we add export too?','#fffefb')}
  ${k.group(.4,k.warn(70,200,'#b58a1f')+k.text(94,205,'“顺便”往往不顺便','“Just” is rarely just',11,'#8a6a25'))}
  ${k.path('M356 156H412')}
  ${k.box(424,72,248,170,'#e7f2e7')}
  ${k.text(446,100,'停下来重新决定','Stop and decide again',12,'#34734b')}
  ${k.group(.5,k.ok(446,130)+k.text(470,135,'影响哪些目标','Which goal is affected',11,'#34734b'))}
  ${k.group(.66,k.ok(446,166)+k.text(470,171,'要推迟什么','What gets delayed',11,'#34734b'))}
  ${k.group(.82,k.ok(446,202)+k.text(470,207,'由谁确认','Who approves',11,'#34734b'))}
  ${k.text(360,280,'范围可以变，但要显式地变','Scope can change, but explicitly',12,'#665e72','middle')}
  ${k.group(.9,k.clock(360,306)+k.text(384,310,'记录变化与理由','Record the change and reason',10,'#66502a'))}
 `;
 if(step===3)body=`
  ${k.doc(52,58,'#fffefb',310,204)}
  ${k.text(72,86,'一句话范围','Scope in one line',13)}
  ${k.group(.14,k.text(72,118,'本轮：释放名额 + 提前提醒','This round: release plus reminder',11,'#34734b'))}
  ${k.group(.3,k.text(72,150,'不做：自动排课、外部日历','Not now: scheduling, calendars',11,'#a64e44'))}
  ${k.group(.46,k.text(72,182,'完成条件：候补能补位','Done: waitlist can take seats',11,'#4a3a82'))}
  ${k.group(.62,k.text(72,214,'复核：两周后看占用率','Review: holds in two weeks',11,'#8a6a25'))}
  ${k.path('M376 158H428')}
  ${k.box(440,74,232,172,'#e7f2e7')}
  ${k.text(462,102,'写下来的好处','Why write it down',12,'#34734b')}
  ${k.group(.44,k.ok(462,130)+k.text(486,135,'进度有参照','Progress has a baseline',11,'#34734b'))}
  ${k.group(.6,k.ok(462,166)+k.text(486,171,'评审有依据','Review has criteria',11,'#34734b'))}
  ${k.group(.76,k.ok(462,202)+k.text(486,207,'交接不丢边界','Handoff keeps limits',11,'#34734b'))}
  ${k.text(360,292,'范围也进入决定记录','Scope belongs in the decision record',12,'#665e72','middle')}
  ${k.text(360,320,'下次从这一句开始讨论','Start the next discussion from this line',10,'#665e72','middle')}
 `;
 return frame(body,['范围与非目标','Scope and non-goals'],lang);
}

export const scopeNonGoalsLesson={...base,
 id:'scope-and-non-goals',code:'3.1',courseId:'problem-definition',
 title:'范围与非目标',titleEn:'Scope and non-goals',
 sceneTitle:'范围与非目标',sceneTitleEn:'Scope and non-goals',
 audioManifest:courseAudio['scope-and-non-goals'],
 steps:[
  {title:'范围说明做哪些',en:'Scope says what is in',seconds:18,
   script:['范围不是功能清单，而是本轮要解决到哪一步。','写清做哪些、不做哪些，讨论才有共同边界。','边界模糊时，每个人对“完成”的理解都不一样。'],
   enScript:['Scope is not a feature list; it is how far this round solves the problem.','State what is in and what is out so discussion shares a boundary.','With a blurry boundary, everyone means something different by “done”.'],
   notes:['范围跟目标和约束一起写。','完成条件要可观察。'],
   enNotes:['Write scope beside goal and constraints.','Done conditions must be observable.'],
   conceptZh:'范围边界',conceptEn:'Scope boundary',conceptNoteZh:'做哪些、不做哪些',conceptNoteEn:'In and out'},
  {title:'非目标不是遗漏',en:'Non-goals are not omissions',seconds:19,
   script:['非目标是主动写明的不做事项，并附上原因。','写清原因，别人不会反复提出同样的问题。','非目标和目标一样重要，它保护了本轮的聚焦。'],
   enScript:['Non-goals are deliberately stated exclusions with reasons.','Stating reasons stops the same request coming back repeatedly.','Non-goals matter as much as goals; they protect this round’s focus.'],
   notes:['每条非目标写明原因。','被排除的需求未来可以重新评估。'],
   enNotes:['Give every non-goal a reason.','Excluded needs can be reconsidered later.'],
   conceptZh:'非目标',conceptEn:'Non-goals',conceptNoteZh:'主动不做 + 原因',conceptNoteEn:'Deliberate exclusions with reasons'},
  {title:'范围变化要重新决定',en:'Scope changes need a decision',seconds:19,
   script:['“能不能顺便加导出”看起来很小，却会改变时间与风险。','范围变化时要停下来，重新看目标、推迟项和确认人。','范围可以变，但要显式地变，并留下记录。'],
   enScript:['“Can we just add export” looks small but changes time and risk.','When scope shifts, stop and revisit the goal, what gets delayed and who approves.','Scope can change, but explicitly, with a record.'],
   notes:['“顺便”往往不顺便。','变化要写进决定记录。'],
   enNotes:['“Just” is rarely just.','Record changes in the decision record.'],
   conceptZh:'范围变更',conceptEn:'Scope change',conceptNoteZh:'重新决定，留下记录',conceptNoteEn:'Re-decide and record'},
  {title:'写进一句话',en:'Write it in one line',seconds:19,
   script:['把本轮范围、非目标、完成条件和复核时间写成一句话。','这句话可以放进任务卡、评审和交接文档。','下次讨论从这一句开始，不必重新猜边界。'],
   enScript:['Write this round’s scope, non-goals, done condition and review time in one line.','This line belongs in task cards, reviews and handoff docs.','The next discussion starts from it instead of guessing boundaries again.'],
   notes:['一句话要能被不同角色读懂。','复核时间写具体日期。'],
   enNotes:['One line that every role can read.','Give the review a concrete date.'],
   conceptZh:'范围一句话',conceptEn:'Scope in one line',conceptNoteZh:'范围、非目标、完成、复核',conceptNoteEn:'Scope, non-goals, done, review'},
 ].map((s,i)=>({...s,art:(p,lang)=>scopeArt(i,p,lang)}))};
