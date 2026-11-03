import courseAudio from './course-audio-manifest.js';
import {kit,frame} from './lesson-art-kit.js';
export function agentArt(step,p,lang){
 const {text,box,path,group,lock}=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${box(250,18,220,44,'#f1ecfa')}${text(360,46,'同一个请求，两种回应','One request, two responses',14,'#242032','middle')}
  ${box(36,86,310,236)}
  ${text(56,116,'代码补全','Code completion',16)}
  ${box(56,130,270,152,'#fff')}
  ${text(72,156,'function unclaimed(items) {','function unclaimed(items) {',11,'#665e72')}
  ${text(72,180,'  return items.filter(','  return items.filter(',11,'#a49ab8')}
  ${text(72,202,'    i => !i.claimed)','    i => !i.claimed)',11,'#a49ab8')}
  ${text(72,224,'}','}',11,'#a49ab8')}
  <rect x="72" y="234" width="2" height="14" fill="#7967ac"/>
  ${text(191,306,'猜出光标后的下一行','Guesses the next line',13,'#665e72','middle')}
  ${box(374,86,310,236)}
  ${text(394,116,'编码智能体','Coding agent',16)}
  ${box(392,134,128,38,'#f3eef9')}${text(456,158,'读代码','Read files',13,'#242032','middle')}
  ${box(536,134,128,38,'#f3eef9')}${text(600,158,'列计划','Plan',13,'#242032','middle')}
  ${box(392,186,128,38,'#f3eef9')}${text(456,210,'改代码','Edit',13,'#242032','middle')}
  ${box(536,186,128,38,'#f3eef9')}${text(600,210,'运行检查','Run checks',13,'#242032','middle')}
  ${path('M600 224C600 258 456 258 456 224','#7967ac',true)}
  ${text(529,278,'反复尝试，直到检查通过','Repeat until the checks pass',12,'#7967ac','middle')}
  ${text(529,306,'完成一整步，而不只是一行','A whole step, not just a line',13,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${box(36,74,268,196,'#f9e8e2')}
  ${text(56,106,'“加一个待认领列表”','“Add an unclaimed list”',15,'#9c4a3c')}
  ${text(56,140,'听起来清楚，','It sounds clear,',13,'#a64e44')}
  ${text(56,164,'却无法判断何时算完成','but “done” has no test',13,'#a64e44')}
  ${text(56,216,'✕ 没说内容、顺序、空状态','✕ No content, order or empty state',11,'#a64e44')}
  ${path('M310 172H360')}
  ${box(372,54,314,240)}
  ${text(392,86,'改写为可验收的目标','Rewrite as a checkable goal',15)}
  ${group(.16,text(392,124,'✓ 只显示未认领的物品','✓ Only unclaimed items',13,'#34734b'))}
  ${group(.30,text(392,156,'✓ 最新的排在最前','✓ Newest first',13,'#34734b'))}
  ${group(.44,text(392,188,'✓ 空列表也说明原因','✓ Empty state explained',13,'#34734b'))}
  ${group(.58,text(392,220,'✓ 不显示认领人联系方式','✓ No claimant contact details',13,'#34734b'))}
  ${group(.74,text(392,258,'写进任务，才能逐条验收','Put these in the task; check them one by one',11,'#665e72'))}
  ${text(360,326,'目标写清楚，你和智能体才有同一把尺子','A clear goal gives you and the agent the same ruler',13,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${box(258,24,204,56,'#f3eef9')}
  ${text(360,50,'智能体','Agent',15,'#242032','middle')}
  ${text(360,70,'可以提出方案','may propose',11,'#665e72','middle')}
  ${path('M300 84L150 132')}${path('M360 84V132')}${path('M420 84L570 132')}
  ${box(36,140,196,120,'#fff4d4')}
  ${lock(134,178)}
  ${text(134,214,'公开哪些字段','Which fields are public',14,'#242032','middle')}
  ${text(134,238,'需要人确认','Person confirms',11,'#665e72','middle')}
  ${box(262,140,196,120,'#fff4d4')}
  ${lock(360,178)}
  ${text(360,214,'删除失物记录','Deleting records',14,'#242032','middle')}
  ${text(360,238,'需要人确认','Person confirms',11,'#665e72','middle')}
  ${box(488,140,196,120,'#fff4d4')}
  ${lock(586,178)}
  ${text(586,214,'新增依赖','Adding a dependency',14,'#242032','middle')}
  ${text(586,238,'需要人确认','Person confirms',11,'#665e72','middle')}
  ${text(360,306,'边界写进任务，而不是事后才发现','State the boundary in the task, not after the fact',14,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${box(36,52,360,248)}
  ${text(56,86,'交付前的检查','Checks before delivery',16)}
  ${group(.14,text(56,132,'✓ 页面能列出待认领物品','✓ The page lists unclaimed items',13,'#34734b'))}
  ${group(.28,text(56,168,'✓ 空数据显示说明','✓ Empty data shows an explanation',13,'#34734b'))}
  ${group(.42,text(56,204,'✓ 联系方式没有出现','✓ No contact details appear',13,'#34734b'))}
  ${group(.56,text(56,240,'✓ 排序符合约定','✓ The order matches the rule',13,'#34734b'))}
  ${box(424,66,260,220,'#fff4d4')}
  <circle cx="554" cy="108" r="17" fill="#fff8ef" stroke="#292535" stroke-width="2"/><path d="M566 120l13 13" stroke="#292535" stroke-width="3" stroke-linecap="round"/>
  ${text(554,164,'“完成了”是一句声明','“Done” is a claim',15,'#8a6a25','middle')}
  ${path('M500 184H608','#b58a1f',true)}
  ${text(554,224,'自己复现结果，才算证据','Reproduce it yourself',14,'#66502a','middle')}
  ${text(554,252,'看结果、跑检查，再决定','Inspect, check, then decide',11,'#8a6a25','middle')}
  ${text(360,330,'看结果、跑检查，再决定是否交付','Inspect, run checks, then decide whether to deliver',14,'#665e72','middle')}
 `;
 return frame(body,['智能体不是更快的补全','An agent is not a faster completion'],lang);
}
export function problemArt(step,p,lang){
 const {text,box,path,group,person}=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${person(84,124,'#e9c58b')}
  ${box(150,52,420,92,'#fff')}
  ${text(172,86,'“给活动室预约加一个取消按钮。”','“Add a cancel button to room booking.”',15)}
  ${text(172,114,'老师的需求，已经是一个方案','The teacher’s request is already a solution',12,'#665e72')}
  ${person(620,206,'#bad7c2')}
  <path d="M590 104q26 4 40 26" fill="none" stroke="#8274b1" stroke-width="3" stroke-dasharray="5 7"/>
  ${box(400,178,220,86,'#fff4d4')}
  ${text(420,208,'为什么现在要加？','Why now?',14,'#8a6a25')}
  ${text(420,236,'谁需要取消？取消之后呢？','Who cancels, and what follows?',11,'#8a6a25')}
  ${text(360,318,'功能请求，是别人先替你选好的答案','A feature request is an answer chosen for you',14,'#665e72','middle')}
 `;
 if(step===1)body=
  /** @type {[number,string,string,string,string,string,number][]} */ ([[36,'学生','Student','订错时段，想换一场','Booked the wrong slot','#bad7c2',.1],[262,'社团负责人','Club lead','活动改期，整批释放','Event moved','#c8b8e5',.28],[488,'管理员','Admin','清理未到场的占位','Clears no-shows','#e9c58b',.46]])
   .map(([x,zh,en,line,lineEn,color,at])=>group(at,`${box(x,50,196,178)}<circle cx="${x+98}" cy="94" r="18" fill="${color}" stroke="#292535" stroke-width="2"/>${text(x+98,150,zh,en,15,'#242032','middle')}${text(x+98,180,line,lineEn,11,'#665e72','middle')}`)).join('')+
  `${box(60,258,600,62,'#fff4d4')}${text(360,284,'接着问：谁最需要？多久之前？释放后谁会用？','Then ask: who needs it most, by when, and who gets the seat?',14,'#66502a','middle')}${text(360,306,'同一个按钮，背后可能是三种任务','One button can hide three different tasks',11,'#8a6a25','middle')}`;
 if(step===2)body=`
  ${/** @type {[string,string,number][]} */ ([['取消按钮','Cancel',42],['立即释放名额','Release',207],['通知候补','Notify',372],['记录原因','Record',537]]).map(([zh,en,x])=>`${box(x,40,140,54,'#f3eef9')}${text(x+70,72,zh,en,13,'#242032','middle')}`).join('')}
  ${path('M182 67h20')}${path('M347 67h20')}${path('M512 67h20')}
  ${box(60,128,600,144)}
  ${text(80,160,'规则才是需求','The rules are the requirement',15)}
  ${group(.28,text(80,196,'· 活动开始前 2 小时之后不可取消','· No cancellation within 2 hours of the start',13,'#665e72'))}
  ${group(.42,text(80,226,'· 同一时段不能出现两个有效预约','· No double booking in the same slot',13,'#665e72'))}
  ${group(.56,text(80,256,'· 取消后名额回到可预约列表','· The seat returns to the available list',13,'#665e72'))}
  ${text(360,306,'按钮只是入口，规则决定系统是否可靠','The button is only an entry point; the rules decide reliability',14,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${box(36,72,270,180,'#f9e8e2')}
  ${text(56,106,'“加一个取消按钮”','“Add a cancel button”',14,'#9c4a3c')}
  ${text(56,144,'✕ 只描述一个界面动作','✕ Describes only a UI action',12,'#a64e44')}
  ${text(56,178,'✕ 没说谁、何时、之后会怎样','✕ No who, when, or what follows',12,'#a64e44')}
  ${path('M314 160H356')}
  ${box(366,54,318,220,'#e7f2e7')}
  ${text(386,86,'问题陈述','Problem statement',14,'#34734b')}
  ${text(386,122,'学生在计划改变时，需要释放','When plans change, a student needs',12,'#24553a')}
  ${text(386,144,'已占用的名额；组织者需要避免','to release a booked seat; the organizer',12,'#24553a')}
  ${text(386,166,'有人占位后不使用。','must avoid seats held but unused.',12,'#24553a')}
  ${text(386,208,'目标 · 对象 · 场景 · 约束','Goal · people · situation · rules',11,'#34734b')}
  ${text(386,238,'再比较按钮、提醒或自动释放','Then compare a button, reminders, or auto-release',11,'#5c7a63')}
  ${text(360,318,'问题清楚，方案才有比较的对象','A clear problem gives solutions something to compare',14,'#665e72','middle')}
 `;
 return frame(body,['从功能退回到问题','Step back from the feature to the problem'],lang);
}
export const delegatingLesson={
 id:'delegating-to-agents',code:'2.1',courseId:'delegating-to-agents',
 title:'把任务交给智能体',titleEn:'Delegating to agents',
 section:'02 交给 AI 编码智能体',sectionEn:'02 WORKING WITH CODING AGENTS',
 sceneTitle:'智能体不是更快的补全',sceneTitleEn:'An agent is not a faster completion',
 position:'02 · 交给智能体',positionEn:'02 · Working with agents',audio:true,audioManifest:courseAudio['delegating-to-agents'],
 steps:[
  {title:'同一个请求，两种回应',en:'The same request, two responses',seconds:16,
   script:['同学对工具说：“给校园失物招领加一个待认领列表。”','代码补全会猜出光标后的下一行，响应快，但不会替你决定整个列表怎么工作。','编码智能体能读文件、列计划、改多处代码并运行检查；它尝试的是一个完整步骤，而不只是一行。'],
   enScript:['A student asks: “Add an unclaimed-items list to the campus lost-and-found.”','Code completion guesses the next line after the cursor. It is fast, but it does not decide how the list works.','A coding agent reads files, plans, edits several places and runs checks. It attempts a whole step, not just a line.'],
   notes:['补全与智能体的差别在任务范围，不在速度。','任务越大，越需要把目标和检查方式说清楚。'],
   enNotes:['The difference is task scope, not speed.','The larger the task, the clearer the goal and checks must be.'],
   conceptZh:'补全与智能体',conceptEn:'Completion vs agent',conceptNoteZh:'一个给下一行，一个给下一步',conceptNoteEn:'One suggests a line; the other attempts a step'},
  {title:'目标要能被检查',en:'A goal you can check',seconds:22,
   script:['“加一个待认领列表”听起来明确，但做完之后无法判断应不应该通过。','把它改写为：只显示未认领的物品，最新的在最前，空列表显示说明，页面不出现认领人的联系方式。','这些条件写进任务里，智能体才能对照它们修改，你也能逐条验收。'],
   enScript:['“Add an unclaimed list” sounds clear, but no one can say whether the result passes.','Rewrite it: show only unclaimed items, newest first, explain an empty list, and never display a claimant’s contact details.','Put those conditions in the task so the agent can edit against them and you can check them one by one.'],
   notes:['模糊的目标会被模糊地完成。','可验收的目标包含内容、顺序、空状态和不暴露的信息。'],
   enNotes:['A vague goal gets a vague result.','A checkable goal states content, order, empty state, and what must stay hidden.'],
   conceptZh:'可验收的目标',conceptEn:'Checkable goal',conceptNoteZh:'内容、顺序、空状态、不暴露的信息',conceptNoteEn:'Content, order, empty state, hidden data'},
  {title:'哪些决定必须留给人',en:'Decisions that stay human',seconds:20,
   script:['智能体可以提出界面和数据方案，但有些决定会影响真实的人。','公开哪些字段、是否删除记录、要不要新增依赖，都需要负责人确认。','把这些边界写进任务，比事后发现数据被公开更容易修正。'],
   enScript:['An agent may propose interface and data changes, but some decisions affect real people.','Which fields are public, whether records are deleted, and whether to add a dependency all need a person to confirm.','Write those boundaries into the task; fixing them afterwards is much harder than stating them up front.'],
   notes:['边界是任务的一部分，不是额外的谨慎。','把“可以做什么”和“必须问谁”分开写。'],
   enNotes:['Boundaries are part of the task, not extra caution.','Separate what the agent may do from what needs approval.'],
   conceptZh:'任务边界',conceptEn:'Task boundaries',conceptNoteZh:'哪些决定必须由人确认',conceptNoteEn:'Which decisions need a person'},
  {title:'结果要能自己复现',en:'Reproduce the result yourself',seconds:18,
   script:['智能体回复“已完成”，这是一条声明，还不是交付证据。','打开页面看列表，用空数据试一次，检查联系方式是否出现，再确认排序。','结果能按约定复现，才可以把这次修改当作可交付的变更。'],
   enScript:['“Done” from an agent is a claim, not delivery evidence.','Open the page, try empty data, check that contact details never appear, and confirm the order.','Only when the result reproduces against the agreed checks is the change ready to deliver.'],
   notes:['“完成”需要可重复的检查支持。','把检查步骤写下来，下次换成别人也能验收。'],
   enNotes:['“Done” needs a repeatable check behind it.','Write the checks down so someone else can accept the work later.'],
   conceptZh:'验收证据',conceptEn:'Acceptance evidence',conceptNoteZh:'自己复现，才不依赖声明',conceptNoteEn:'Reproduce it instead of trusting the claim'},
 ].map((s,i)=>({...s,art:(p,lang)=>agentArt(i,p,lang)}))
};
export const problemDefinitionLesson={
 id:'problem-definition',code:'3.1',courseId:'problem-definition',
 title:'定义真正的问题',titleEn:'Defining the real problem',
 section:'03 产品与协作技能',sectionEn:'03 PRODUCT AND PEOPLE SKILLS',
 sceneTitle:'从功能退回到问题',sceneTitleEn:'Step back from the feature to the problem',
 position:'03 · 定义问题',positionEn:'03 · Defining the problem',audio:true,audioManifest:courseAudio['problem-definition'],
 steps:[
  {title:'一句功能请求',en:'A feature request',seconds:16,
   script:['老师说：“给活动室预约加一个取消按钮。”这是一句清楚的功能请求。','但它已经替团队选好了方案，没有说明谁要取消、什么时候取消、取消后发生什么。','如果直接照做，按钮可能有了，真正的困难仍然留在使用现场。'],
   enScript:['The teacher says: “Add a cancel button to room booking.” That is a clear feature request.','But it has already chosen a solution. It does not say who cancels, when, or what happens afterwards.','Build it directly and the button may exist while the real difficulty stays untouched.'],
   notes:['功能请求是一个方案，不一定是一个问题。','先弄清使用场景，再决定按钮是否足够。'],
   enNotes:['A feature request is a solution, not necessarily the problem.','Understand the situation before deciding a button is enough.'],
   conceptZh:'功能请求',conceptEn:'Feature request',conceptNoteZh:'别人已经替你选好的方案',conceptNoteEn:'A solution someone already chose'},
  {title:'谁在什么情况下取消',en:'Who cancels, and when',seconds:22,
   script:['学生订错时段，想换一场；社团负责人遇到活动改期，要整批释放；管理员需要清理占位后不来的人。','三种情形对“能否取消、提前多久、谁得到空位”的要求并不相同。','先问清最常见、最紧急的是哪一种，再决定规则优先照顾谁。'],
   enScript:['A student booked the wrong slot. A club lead needs to release a whole batch after an event moves. An admin clears bookings held by people who never arrive.','These three situations demand different answers about whether, how late, and who gets the seat.','Find the most common and urgent case first, then decide whose needs the rules should prioritise.'],
   notes:['同一个按钮，背后可能是三种不同的任务。','先找最需要解决的那一种，不要一次满足所有角色。'],
   enNotes:['One button can hide three different tasks.','Solve the most important one first instead of every role at once.'],
   conceptZh:'使用场景',conceptEn:'Usage situations',conceptNoteZh:'同一个功能请求背后的不同任务',conceptNoteEn:'Different tasks behind one request'},
  {title:'功能背后的规则',en:'The rules behind the feature',seconds:22,
   script:['取消不是把预约从列表里删掉，而是立刻释放名额，让候补的人可以预订。','还要约定：活动开始前两小时之后不能再取消，同一时段不能出现两个有效预约。','按钮只是入口，这些规则才决定系统是否可靠。'],
   enScript:['Cancellation is not deleting a row; it releases the seat immediately so someone on the waitlist can book.','Also agree that cancellation closes two hours before the start, and that one slot can never hold two active bookings.','The button is only an entry point. These rules decide whether the system is reliable.'],
   notes:['把取消翻译成状态变化：预约失效、名额回到可预约。','每条规则都应该能在测试里写出预期结果。'],
   enNotes:['Translate cancellation into state changes: the booking ends, the seat returns.','Every rule should have an expected result you can test.'],
   conceptZh:'业务规则',conceptEn:'Business rules',conceptNoteZh:'状态变化与时间限制',conceptNoteEn:'State changes and time limits'},
  {title:'用问题陈述替代功能清单',en:'State the problem, not just the feature',seconds:20,
   script:['把发现整理成一句问题陈述：学生在计划改变时，需要释放已占用的名额；组织者需要避免有人占位后不使用。','这句话包含对象、场景、目标，也暗示了约束，比“加一个取消按钮”更能比较方案。','有了共同的问题，团队才能讨论按钮、自动释放或提醒哪种做法更合适。'],
   enScript:['Turn the findings into one problem statement: when plans change, a student needs to release a booked seat, while the organizer must avoid seats held but unused.','It names the people, the situation, the goal and hints at constraints. It makes solutions comparable in a way a button request cannot.','With a shared problem, the team can compare a button, automatic release, or a reminder.'],
   notes:['问题陈述描述需要，不预设界面。','问题越清楚，方案比较越公平。'],
   enNotes:['A problem statement describes needs without prescribing an interface.','A clearer problem makes solution comparisons fair.'],
   conceptZh:'问题陈述',conceptEn:'Problem statement',conceptNoteZh:'对象、场景、目标与约束',conceptNoteEn:'People, situation, goal and rules'},
 ].map((s,i)=>({...s,art:(p,lang)=>problemArt(i,p,lang)}))
};
