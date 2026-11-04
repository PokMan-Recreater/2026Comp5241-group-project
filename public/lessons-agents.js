import courseAudio from './course-audio-manifest.js';
import {kit,frame} from './lesson-art-kit.js';

function checkableArt(step,p,lang){
 const {text,path,group,face,doc,ok,no,warn,speech,bot}=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${bot(150,124)}
  ${speech(188,52,190,'已完成！','Done!')}
  <rect x="404" y="42" width="282" height="212" rx="12" fill="#fffefb" stroke="#292535" stroke-width="2"/>
  ${text(424,72,'完成的标准是什么？','What counts as done?',13)}
  ${[['只显示未认领物品','Only unclaimed items'],['最新的排在最前','Newest first'],['空列表也有说明','Empty state explained']].map(([a,ae],i)=>group(.14+i*.16,`<rect x="424" y="${90+i*44}" width="18" height="18" rx="4" fill="none" stroke="#a49ab8" stroke-width="2"/>${text(432,104+i*44,'?','?',13,'#a49ab8','middle')}${text(452,104+i*44,a,ae,11,'#665e72')}`)).join('')}
  ${group(.66,text(424,232,'没有验收条件，就无法确认','Without acceptance criteria you cannot verify',11,'#a64e44'))}
  ${text(360,320,'“完成了”是一句声明，不是结果','“Done” is a claim, not evidence',14,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${doc(64,58,'#f3eef9',86,108)}${text(107,196,'任务','Task',11,'#665e72','middle')}
  ${path('M164 112H240')}
  <rect x="256" y="42" width="412" height="212" rx="12" fill="#fffefb" stroke="#292535" stroke-width="2"/>
  ${text(276,72,'验收条件','Acceptance criteria',14)}
  ${/** @type {[number,string,string][]} */ ([ [104,'打开页面时，只显示未认领的物品','The page shows only unclaimed items'],[142,'最新的物品排在最前','Newest items come first'],[180,'空列表显示原因说明','An empty list explains why'],[218,'不出现认领人的联系方式','No claimant contact details'] ]).map(([y,a,ae],i)=>group(.1+i*.17,ok(292,y-5)+text(316,y,a,ae,11,'#34734b'))).join('')}
  ${text(360,320,'每条条件都要能被观察和重复','Each condition must be observable and repeatable',13,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${text(40,46,'示例','Examples',12)}${text(430,46,'边界','Edge cases',12)}
  ${group(.12,doc(48,70,'#e7f2e7',120,70)+text(124,92,'示例 1','Example 1',10,'#34734b','middle')+path('M180 105H250')+text(262,100,'输入：3 件未认领','Input: 3 unclaimed',10,'#665e72')+text(262,120,'输出：3 条，最新在前','Output: 3, newest first',10,'#665e72'))}
  ${group(.34,doc(48,170,'#e7f2e7',120,70)+text(124,192,'示例 2','Example 2',10,'#34734b','middle')+path('M180 205H250')+text(262,200,'输入：全部已认领','Input: all claimed',10,'#665e72')+text(262,220,'输出：空列表 + 说明','Output: empty + note',10,'#665e72'))}
  ${group(.52,warn(470,96)+text(494,101,'空数据','Empty data',11,'#8a6a25'))}
  ${group(.66,warn(470,156)+text(494,161,'超长标题','Very long title',11,'#8a6a25'))}
  ${group(.8,warn(470,216)+text(494,221,'重复物品','Duplicate item',11,'#8a6a25'))}
  ${group(.8,no(596,90,'#b96559')+no(596,150)+no(596,210))}
  ${text(360,320,'把特殊的输入写进任务，而不是等它出现','Put special inputs in the task before they appear',13,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${bot(140,130)}
  ${speech(178,58,230,'我的计划是：先读列表页…','My plan: read the list page first…')}
  <rect x="434" y="54" width="248" height="168" rx="12" fill="#f3eef9" stroke="#292535" stroke-width="2"/>
  ${[ ['1','读出当前列表逻辑','Read the current list logic'],['2','新增筛选与排序','Add filter and order'],['3','补空状态与检查','Add empty state and checks'] ].map(([n,a,ae],i)=>group(.16+i*.2,`<circle cx="466" cy="${96+i*42}" r="13" fill="#fffefb" stroke="#292535" stroke-width="2"/>${text(466,101+i*42,n,n,11,'#242032','middle')}${text(486,101+i*42,a,ae,11,'#665e72')}`)).join('')}
  ${group(.72,face(360,250,'#bad7c2')+text(360,342,'先复述，再动手','Repeat the plan before acting',12,'#665e72','middle'))}
  ${group(.84,ok(140,250)+text(164,255,'确认一致再执行','Proceed once aligned',11,'#34734b'))}
 `;
 return frame(body,['给智能体一个可检查的目标','A goal the agent can check'],lang);
}

function boundaryArt(step,p,lang){
 const {text,path,group,face,doc,db,ok,no,warn,speech,bot,gear,lock}=kit(p,lang);
 let body='';
 if(step===0)body=`
  <path d="M360 40v272" stroke="#a49ab8" stroke-width="2" stroke-dasharray="6 7"/>
  ${text(184,48,'可逆','Reversible',14,'#34734b','middle')}${text(540,48,'不可逆','Irreversible',14,'#a64e44','middle')}
  <rect x="52" y="70" width="264" height="196" rx="14" fill="#e7f2e7" stroke="#292535" stroke-width="2"/>
  ${doc(96,92,'#fffefb')}${gear(216,132)}${path('M152 182C120 208 140 236 190 236','#34734b',true)}${text(184,262,'改文件 · 跑测试','Edit files · run tests',11,'#34734b','middle')}
  <rect x="404" y="70" width="264" height="196" rx="14" fill="#f9e8e2" stroke="#292535" stroke-width="2"/>
  ${db(460,132)}${lock(566,108)}${warn(566,176,'#b96559')}${text(536,262,'删数据 · 发布 · 对外发送','Delete · publish · send',11,'#a64e44','middle')}
  ${text(360,320,'动作能不能撤回，决定谁能按下它','Whether an action can be undone decides who may press it',12,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${db(160,120)}
  ${face(112,226,'#bad7c2')}${doc(250,224,'#fff4d4',44,54)}
  ${text(172,308,'同一份记录里可能有个人信息','A record can contain personal data',11,'#665e72','middle')}
  ${path('M210 140H300')}
  <rect x="320" y="54" width="360" height="190" rx="12" fill="#fffefb" stroke="#292535" stroke-width="2"/>
  ${text(340,84,'按字段划分权限','Split permissions by field',13)}
  ${group(.2,ok(344,116)+text(368,121,'物品名称 · 地点：可读','Item and place: readable',11,'#34734b'))}
  ${group(.34,ok(344,154)+text(368,159,'状态 · 时间：可写','Status and time: writable',11,'#34734b'))}
  ${group(.5,lock(344,192)+text(368,197,'联系方式：需确认','Contact details: ask first',11,'#8a6a25'))}
  ${group(.66,no(344,224,'#b96559')+text(368,229,'批量删除：禁止','Bulk delete: forbidden',11,'#a64e44'))}
  ${text(360,342,'权限写在字段级，才不是一句空话','Field-level permissions are not a slogan',13,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${lock(84,78)}
  <rect x="120" y="46" width="352" height="232" rx="12" fill="#fffefb" stroke="#292535" stroke-width="2"/>
  ${text(140,78,'任务边界','Task boundaries',14)}
  ${/** @type {[number,string,string][]} */ ([ [112,'不要删除生产数据','Do not delete production data'],[150,'不要修改支付配置','Do not touch payment config'],[188,'不要引入新依赖','Do not add dependencies'],[226,'不要对外发送消息','Do not send external messages'] ]).map(([y,a,ae],i)=>group(.12+i*.16,no(156,y-5)+text(180,y,a,ae,11,'#a64e44'))).join('')}
  ${group(.78,text(140,262,'写在任务里，而不是留在记忆里','Write it in the task, not in memory',11,'#665e72'))}
  ${group(.86,bot(566,124)+speech(600,60,110,'收到','Understood'))}
  ${text(360,320,'禁止项越具体，越容易被遵守','Specific prohibitions are easier to follow',13,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${bot(96,110)}${text(96,186,'智能体修改','Agent edits',11,'#665e72','middle')}
  ${doc(270,70,'#f3eef9',96,110)}${text(318,200,'改动清单','Diff',11,'#665e72','middle')}
  ${face(490,104,'#bad7c2')}${text(490,196,'人复核','Human review',11,'#665e72','middle')}
  ${lock(620,90)}${text(620,156,'合并','Merge',11,'#8a6a25','middle')}
  ${path('M136 116H258')}${path('M386 116H456')}${path('M528 116H600')}
  ${group(.3,text(197,100,'产出','Changes',10,'#7967ac','middle'))}
  ${group(.55,text(421,100,'检查','Inspect',10,'#7967ac','middle'))}
  ${group(.78,text(560,100,'放行','Allow',10,'#7967ac','middle'))}
  ${text(360,260,'检查点设在不可逆动作之前','Put the checkpoint before the irreversible step',14,'#242032','middle')}
  ${text(360,320,'流程比提醒更可靠','A process beats a reminder',12,'#665e72','middle')}
 `;
 return frame(body,['任务边界与人工确认','Boundaries and human approval'],lang);
}

function contextArt(step,p,lang){
 const {text,path,group,doc,ok,no,speech,lens,bot}=kit(p,lang);
 let body='';
 if(step===0)body=`
  <rect x="46" y="52" width="270" height="196" rx="12" fill="#f9e8e2" stroke="#292535" stroke-width="2"/>
  ${text(66,84,'没有上下文','No context',13,'#a64e44')}
  ${text(66,120,'createItem()','createItem()',12,'#a64e44')}
  ${text(66,148,'get_items()','get_items()',12,'#a64e44')}
  ${text(66,176,'ItemStore_v2','ItemStore_v2',12,'#a64e44')}
  ${group(.3,no(270,196,'#b96559')+text(230,240,'命名与风格不一致','Inconsistent names and style',10,'#a64e44','middle'))}
  <rect x="404" y="52" width="270" height="196" rx="12" fill="#e7f2e7" stroke="#292535" stroke-width="2"/>
  ${text(424,84,'读过项目约定','Read the conventions',13,'#34734b')}
  ${text(424,120,'createListing()','createListing()',12,'#34734b')}
  ${text(424,148,'listListings()','listListings()',12,'#34734b')}
  ${text(424,176,'listingStore','listingStore',12,'#34734b')}
  ${group(.5,ok(624,196)+text(590,240,'与现有代码一致','Matches the codebase',10,'#34734b','middle'))}
  ${text(360,312,'上下文决定改动能不能融进代码库','Context decides whether a change fits the codebase',13,'#665e72','middle')}
 `;
 if(step===1)body=`
  <path d="M92 92h64l14 16h178v-40H92z" fill="#f3eef9" stroke="#292535" stroke-width="2"/>
  ${text(230,91,'项目根目录','Project root',10,'#665e72','middle')}
  ${text(120,154,'src/','src/',11,'#242032','middle')+text(224,154,'components/','components/',11,'#242032','middle')+text(330,154,'tests/','tests/',11,'#242032','middle')}
  <path d="M224 110v16M120 138v-12h210v12M224 126v12" fill="none" stroke="#7967ac" stroke-width="2.5" stroke-linecap="round"/>
  ${doc(96,190,'#fff4d4',70,80)}${text(131,288,'README','README',10,'#8a6a25','middle')}
  ${doc(280,190,'#e7f2e7',70,80)}${text(315,288,'约定','Conventions',10,'#34734b','middle')}
  ${group(.35,speech(444,64,220,'先告诉我目录和约定','Show me the layout and rules first'))}
  ${group(.55,lens(520,190)+text(520,230,'当前实现','Current code',10,'#665e72','middle'))}
  ${text(360,332,'给地图，而不是一堆文件','Give a map, not a pile of files',13,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${lens(170,112)}${text(170,158,'先搜索','Search first',11,'#7967ac','middle')}
  ${doc(280,76,'#f3eef9',100,110)}${text(330,206,'已有工具函数','Existing helper',10,'#665e72','middle')}
  ${bot(500,112)}
  ${path('M196 112H258')}${path('M384 112H462')}
  ${group(.36,ok(300,232)+text(324,237,'复用已有实现','Reuse what exists',11,'#34734b'))}
  ${group(.6,no(300,282,'#b96559')+text(324,287,'另写一套重复逻辑','Write a parallel copy',11,'#a64e44'))}
  ${text(360,332,'先搜索，再修改','Search before you modify',13,'#665e72','middle')}
 `;
 if(step===3)body=`
  <rect x="46" y="56" width="300" height="200" rx="12" fill="#f9e8e2" stroke="#292535" stroke-width="2"/>
  ${text(66,86,'大改动','Large change',13,'#a64e44')}
  ${[112,132,152,172,192,212].map(y=>`<path d="M70 ${y}h250" stroke="#b96559" stroke-width="7" stroke-linecap="round"/>`).join('')}
  ${no(322,222,'#b96559')}
  ${text(196,286,'难复核，风险高','Hard to review, high risk',11,'#a64e44','middle')}
  <rect x="404" y="56" width="266" height="200" rx="12" fill="#e7f2e7" stroke="#292535" stroke-width="2"/>
  ${text(424,86,'小改动','Small change',13,'#34734b')}
  ${[112,132].map(y=>`<path d="M428 ${y}h210" stroke="#34734b" stroke-width="7" stroke-linecap="round"/>`).join('')}
  ${ok(638,222)}
  ${text(536,286,'一屏能看完','Fits on one screen',11,'#34734b','middle')}
  ${text(360,332,'小步提交，让每次复核都可能','Small steps make review possible',13,'#665e72','middle')}
 `;
 return frame(body,['让智能体读你的代码库','Let the agent read your codebase'],lang);
}

function checksArt(step,p,lang){
 const {text,path,group,face,phone,doc,ok,no,speech,bot,gear,lock}=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${/** @type {[string,string,number][]} */ ([ ['类型检查','Types',46],['规范检查','Lint',206],['测试','Tests',366],['构建','Build',526] ]).map(([a,ae,x],i)=>group(.1+i*.18,`<rect x="${x}" y="70" width="148" height="132" rx="12" fill="#fffefb" stroke="#292535" stroke-width="2"/>${gear(x+74,112)}${text(x+74,164,a,ae,12,'#242032','middle')}${ok(x+74,188)}`)).join('')}
  ${path('M194 136H206','#7967ac',false,'dl-arrow-sm')}${path('M354 136H366','#7967ac',false,'dl-arrow-sm')}${path('M514 136H526','#7967ac',false,'dl-arrow-sm')}
  ${text(360,268,'一次运行，覆盖所有机械检查','One run covers every mechanical check',14,'#242032','middle')}
  ${text(360,318,'把可重复的部分交给工具','Give the repeatable part to tools',12,'#665e72','middle')}
 `;
 if(step===1)body=`
  <rect x="58" y="56" width="376" height="214" rx="12" fill="#e7f2e7" stroke="#292535" stroke-width="2"/>
  ${text(78,88,'测试行为','Test behaviour',13,'#34734b')}
  ${text(78,126,'打开页面 → 只看到未认领','Open page → unclaimed only',11,'#24553a')}
  ${text(78,154,'提交重复请求 → 只保存一次','Duplicate submit → saved once',11,'#24553a')}
  ${text(78,182,'空列表 → 显示说明','Empty list → note shown',11,'#24553a')}
  ${group(.4,ok(400,226))}
  <rect x="470" y="56" width="196" height="214" rx="12" fill="#f9e8e2" stroke="#292535" stroke-width="2"/>
  ${text(490,88,'测试实现','Test internals',13,'#a64e44')}
  ${text(490,126,'检查私有变量','Checks private fields',11,'#a64e44')}
  ${text(490,154,'依赖函数顺序','Depends on call order',11,'#a64e44')}
  ${text(490,182,'断言内部调用','Asserts internal calls',11,'#a64e44')}
  ${group(.62,no(638,226,'#b96559'))}
  ${text(360,318,'行为测试能证明需求，内部测试只证明当初的写法','Behaviour tests prove needs; internal tests freeze one implementation',12,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${bot(110,120)}${text(110,196,'智能体','Agent',11,'#665e72','middle')}
  ${doc(230,70,'#f3eef9',90,104)}${text(275,196,'检查结果','Checks',11,'#665e72','middle')}
  ${face(430,110,'#bad7c2')}${text(430,190,'人来判断','Human decides',11,'#665e72','middle')}
  ${phone(590,74,0.9)}
  ${path('M148 116H218')}${path('M334 116H392')}
  ${group(.4,ok(116,240)+text(140,245,'自动项全部通过','Automated checks pass',11,'#34734b'))}
  ${group(.62,speech(402,232,240,'可是这个措辞对吗？','But is this wording right?'))}
  ${text(360,332,'工具报告“通过”，不等于产品“做对”','A green run is not a product decision',13,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${/** @type {[string,string,number,string][]} */ ([ ['CI 检查','CI checks',52,ok(126,110)],['清单核对','Checklist',218,'<rect x="262" y="92" width="60" height="36" rx="5" fill="#fffefb" stroke="#292535" stroke-width="2"/><path d="M274 103h34M274 115h24" stroke="#7967ac" stroke-width="2"/>'],['人复核','Review',384,face(458,88,'#bad7c2')],['合并','Merge',550,lock(624,104)] ]).map(([a,ae,x,ic],i)=>group(.08+i*.2,`${ic}${text(x+74,168,a,ae,11,'#242032','middle')}`)).join('')}
  ${path('M152 110H250','#7967ac',false,'dl-arrow-sm')}${path('M334 110H422','#7967ac',false,'dl-arrow-sm')}${path('M490 110H600','#7967ac',false,'dl-arrow-sm')}
  ${text(360,240,'检查挡住机械错误，人批准产品决定','Checks stop mechanical errors; people approve product decisions',14,'#242032','middle')}
  ${text(360,300,'流程写下来，团队才能重复交付','Write the flow down so the team can repeat it',12,'#665e72','middle')}
 `;
 return frame(body,['把检查交给工具，把判断留给自己','Tools run the checks; you make the call'],lang);
}

const base={section:'02 交给 AI 编码智能体',sectionEn:'02 WORKING WITH CODING AGENTS',position:'02 · 交给智能体',positionEn:'02 · Working with agents',audio:true};

export const checkableGoalsLesson={...base,
 id:'checkable-goals',code:'2.1',courseId:'delegating-to-agents',
 title:'给智能体一个可检查的目标',titleEn:'A goal the agent can check',
 sceneTitle:'给智能体一个可检查的目标',sceneTitleEn:'A goal the agent can check',
 audioManifest:courseAudio['checkable-goals'],
 steps:[
  {title:'“完成”长什么样',en:'What does “done” look like?',seconds:19,
   script:['智能体说完成了，但这句话本身不告诉你结果是否符合需要。','先写下完成时必须看到的现象：哪些内容出现，哪些内容不出现。','没有验收条件，“完成”只是一句无法核对的声明。'],
   enScript:['The agent says it is done, but that sentence does not tell you whether the result matches the need.','Write down what must be visible when finished: what appears and what must not appear.','Without acceptance criteria, “done” is a claim no one can check.'],
   notes:['完成标准要能被观察，而不是只能被声称。','先写标准，再看结果。'],
   enNotes:['A completion standard must be observable, not merely claimed.','Write the standard before looking at the result.'],
   conceptZh:'完成标准',conceptEn:'Definition of done',conceptNoteZh:'完成时必须看到什么',conceptNoteEn:'What must be visible when finished'},
  {title:'把目标写成验收条件',en:'Turn the goal into acceptance criteria',seconds:21,
   script:['把目标拆成几条可以逐条勾选的验收条件。','每条写清行为：打开页面显示什么，提交之后发生什么，失败时如何提示。','条件越具体，智能体越知道该改哪里，你也越容易验收。'],
   enScript:['Break the goal into acceptance criteria you can tick off one by one.','Each criterion states behaviour: what appears on open, what happens after submit, how failure is shown.','The more specific the criteria, the better the agent knows where to edit and the easier acceptance becomes.'],
   notes:['一条条件只描述一个可观察结果。','把“好用”“优化”这类词替换成具体动作。'],
   enNotes:['One criterion describes one observable outcome.','Replace words like “nice” or “optimise” with concrete actions.'],
   conceptZh:'验收条件',conceptEn:'Acceptance criteria',conceptNoteZh:'可逐条勾选的行为',conceptNoteEn:'Behaviour you can tick off'},
  {title:'用示例和边界补足',en:'Add examples and edge cases',seconds:20,
   script:['条件之外，再给两组输入输出示例，让智能体看到你期望的样子。','把特殊输入写进去：空数据、超长内容、重复项、权限不足。','示例和边界一起，才算把目标说完整。'],
   enScript:['Beyond the criteria, give two input-output examples so the agent can see the expected shape.','Include special inputs: empty data, very long content, duplicates and missing permissions.','Examples plus edge cases make the goal complete.'],
   notes:['例子比形容词更能传递期望。','边界情况往往决定实现是否可靠。'],
   enNotes:['Examples carry expectations better than adjectives.','Edge cases often decide whether an implementation is reliable.'],
   conceptZh:'示例与边界',conceptEn:'Examples and edges',conceptNoteZh:'输入输出示例 + 特殊输入',conceptNoteEn:'Input-output examples plus odd inputs'},
  {title:'先复述计划再执行',en:'Repeat the plan before acting',seconds:19,
   script:['在动手之前，让智能体用自己的话复述计划：读哪些文件、改哪些地方、怎么检查。','计划与你理解不一致时，此刻纠正的成本最低。','确认一致后再执行，比事后重做便宜得多。'],
   enScript:['Before it acts, have the agent restate its plan: which files to read, what to change and how to check.','When the plan differs from your understanding, correcting it now costs the least.','Act after the plan aligns; it is far cheaper than redoing the work later.'],
   notes:['复述是低成本的检查点。','计划里应包含验证方式。'],
   enNotes:['Restating is a cheap checkpoint.','The plan should include how it will verify the change.'],
   conceptZh:'计划复述',conceptEn:'Plan restatement',conceptNoteZh:'动手前先对齐理解',conceptNoteEn:'Align understanding before acting'},
 ].map((s,i)=>({...s,art:(p,lang)=>checkableArt(i,p,lang)}))};

export const taskBoundariesLesson={...base,
 id:'task-boundaries',code:'2.1',courseId:'delegating-to-agents',
 title:'任务边界与人工确认',titleEn:'Boundaries and human approval',
 sceneTitle:'任务边界与人工确认',sceneTitleEn:'Boundaries and human approval',
 audioManifest:courseAudio['task-boundaries'],
 steps:[
  {title:'可逆与不可逆',en:'Reversible and irreversible',seconds:19,
   script:['改文件、跑测试、生成草稿通常可以撤回，适合让智能体直接做。','删数据、发布版本、对外发送消息往往无法撤回，必须有人确认。','按动作能否撤回分组，比按难度分组更有意义。'],
   enScript:['Editing files, running tests and drafting changes are usually reversible, so an agent can do them directly.','Deleting data, releasing versions and sending external messages are often irreversible and need a person to confirm.','Group actions by whether they can be undone, not by how hard they are.'],
   notes:['可逆动作可以放宽，不可逆动作要收紧。','一次撤回失败，可能造成永久损失。'],
   enNotes:['Relax reversible actions; tighten irreversible ones.','One failed undo can cause permanent loss.'],
   conceptZh:'可逆性',conceptEn:'Reversibility',conceptNoteZh:'能不能撤回决定能不能放行',conceptNoteEn:'Whether it can be undone decides who may act'},
  {title:'数据与权限的边界',en:'Data and permission boundaries',seconds:21,
   script:['同一份记录里，有些字段可以读写，有些涉及个人信息必须限制。','把权限写到字段级：哪些可读、哪些可写、哪些需要人工确认。','边界写清楚，智能体才不会为了完成任务而暴露不该出现的信息。'],
   enScript:['Within one record, some fields are safe to read or write while personal details must be restricted.','Write permissions at field level: what is readable, what is writable and what needs human confirmation.','Clear boundaries stop an agent from exposing data just to finish the task.'],
   notes:['权限不是一句“注意隐私”，而是具体字段规则。','删除和批量操作尤其需要限制。'],
   enNotes:['Permission is not “watch privacy”; it is a field-level rule.','Deletes and bulk operations especially need limits.'],
   conceptZh:'数据边界',conceptEn:'Data boundaries',conceptNoteZh:'按字段划分读写权限',conceptNoteEn:'Read-write rules per field'},
  {title:'把禁止项写进任务',en:'Write prohibitions into the task',seconds:19,
   script:['除了说要做什么，还要写清不要做什么。','例如不要删除生产数据、不要修改支付配置、不要引入新依赖。','禁止项越具体，智能体越不容易在无人注意时越界。'],
   enScript:['Besides what to do, state what not to do.','For example: do not delete production data, do not touch payment configuration, do not add dependencies.','Specific prohibitions make it harder for an agent to cross a line unnoticed.'],
   notes:['禁止项是任务的一部分，不是额外备注。','写下来的边界才能在复核时被检查。'],
   enNotes:['Prohibitions are part of the task, not a footnote.','A written boundary can be checked during review.'],
   conceptZh:'禁止项',conceptEn:'Prohibitions',conceptNoteZh:'明确不要做什么',conceptNoteEn:'State what must not be done'},
  {title:'把检查点设在动作之前',en:'Put checkpoints before actions',seconds:20,
   script:['检查点应该放在不可逆动作之前，而不是发布之后才追问。','智能体产出改动后，先由人查看改动清单，再决定是否合并或发布。','流程比提醒更可靠：提醒会被忽略，流程会挡住动作。'],
   enScript:['Checkpoints belong before irreversible actions, not after a release when you start asking questions.','After the agent produces changes, a person inspects the diff before merging or releasing.','A process is more reliable than a reminder: reminders get ignored, processes block the action.'],
   notes:['检查点要有明确的放行条件。','把审批放在动作之前，才能真的拦住风险。'],
   enNotes:['A checkpoint needs explicit release criteria.','Approval before the action is what actually stops risk.'],
   conceptZh:'检查点',conceptEn:'Checkpoints',conceptNoteZh:'设在不可逆动作之前',conceptNoteEn:'Placed before irreversible steps'},
 ].map((s,i)=>({...s,art:(p,lang)=>boundaryArt(i,p,lang)}))};

export const agentContextLesson={...base,
 id:'agent-context',code:'2.1',courseId:'delegating-to-agents',
 title:'让智能体读你的代码库',titleEn:'Let the agent read your codebase',
 sceneTitle:'让智能体读你的代码库',sceneTitleEn:'Let the agent read your codebase',
 audioManifest:courseAudio['agent-context'],
 steps:[
  {title:'上下文决定一致性',en:'Context decides consistency',seconds:19,
   script:['没有上下文的智能体只看得到任务，看不到项目已有的命名、结构和风格。','读过程序库之后，它会更可能复用已有模式，而不是另造一套。','改动能不能融进代码库，往往取决于这些看不见的约定。'],
   enScript:['An agent without context sees the task but not the project’s naming, structure or style.','After reading the codebase, it is more likely to reuse existing patterns instead of inventing a parallel one.','Whether a change fits the codebase often depends on these invisible conventions.'],
   notes:['一致性减少理解成本。','让智能体先读，再改。'],
   enNotes:['Consistency lowers comprehension cost.','Have the agent read before it edits.'],
   conceptZh:'上下文',conceptEn:'Context',conceptNoteZh:'命名、结构、风格',conceptNoteEn:'Naming, structure and style'},
  {title:'给地图而不是文件堆',en:'Give a map, not a pile of files',seconds:20,
   script:['直接把几十个文件丢给智能体，信息很多，结构却不清楚。','先给一张地图：目录职责、入口文件、关键约定放在哪里。','有了地图，智能体才知道该看什么、不该改什么。'],
   enScript:['Dumping dozens of files gives the agent lots of information but no structure.','Give a map first: what each directory owns, where the entry points are and where key conventions live.','With a map, the agent knows what to read and what to leave alone.'],
   notes:['少量高价值信息胜过大量无序文件。','README 或简短说明通常就够了。'],
   enNotes:['A little high-value context beats a pile of files.','A README or short note is often enough.'],
   conceptZh:'代码库地图',conceptEn:'Codebase map',conceptNoteZh:'目录职责与关键约定',conceptNoteEn:'Directory roles and key conventions'},
  {title:'先搜索，再修改',en:'Search before editing',seconds:19,
   script:['修改之前，让智能体先搜索相似实现和已有工具函数。','能复用就复用，避免在代码库里留下第二套重复逻辑。','搜索的结果也进入检查：它是否引用了正确的现有实现。'],
   enScript:['Before editing, have the agent search for similar implementations and existing helpers.','Reuse when possible so the codebase does not gain a second copy of the same logic.','The search result becomes part of the check: did it reference the right existing code?'],
   notes:['重复实现是维护成本的来源。','搜索也帮助你发现本次改动的影响范围。'],
   enNotes:['Duplicate implementations raise maintenance cost.','Searching also reveals the blast radius of a change.'],
   conceptZh:'先搜索',conceptEn:'Search first',conceptNoteZh:'复用已有实现',conceptNoteEn:'Reuse existing implementations'},
  {title:'保持改动小而集中',en:'Keep changes small and focused',seconds:19,
   script:['一次改动越大，复核越难，出问题的范围也越模糊。','让智能体按步骤提交：先结构，再行为，最后样式。','小步改动让你能一屏看完，也更容易决定是否回退。'],
   enScript:['The larger a change, the harder it is to review and the blurrier the failure surface becomes.','Have the agent submit in steps: structure first, behaviour next, styling last.','Small changes fit on one screen and are easier to accept or roll back.'],
   notes:['可复核的改动才有价值。','按意图拆分提交，而不是按文件拆分。'],
   enNotes:['A change is only useful if it can be reviewed.','Split commits by intent, not by file.'],
   conceptZh:'小步改动',conceptEn:'Small changes',conceptNoteZh:'一屏能看完的差异',conceptNoteEn:'A diff that fits on one screen'},
 ].map((s,i)=>({...s,art:(p,lang)=>contextArt(i,p,lang)}))};

export const checksJudgementLesson={...base,
 id:'checks-and-judgement',code:'2.1',courseId:'delegating-to-agents',
 title:'把检查交给工具，把判断留给自己',titleEn:'Tools run the checks; you make the call',
 sceneTitle:'把检查交给工具，把判断留给自己',sceneTitleEn:'Tools run the checks; you make the call',
 audioManifest:courseAudio['checks-and-judgement'],
 steps:[
  {title:'机械检查交给工具',en:'Give mechanical checks to tools',seconds:18,
   script:['类型检查、规范检查、测试和构建都是可重复的机械判断。','这些检查应该交给工具一次跑完，而不是靠人逐行盯。','工具通过是最低门槛，不通过就不该进入复核。'],
   enScript:['Type checks, linting, tests and builds are repeatable mechanical judgements.','Let tools run them in one pass instead of having a person stare at every line.','A green run is the minimum bar; a red run should never reach review.'],
   notes:['可重复的判断优先自动化。','检查要能一条命令跑起来。'],
   enNotes:['Automate repeatable judgements first.','The checks should run with one command.'],
   conceptZh:'自动检查',conceptEn:'Automated checks',conceptNoteZh:'类型、规范、测试、构建',conceptNoteEn:'Types, lint, tests, build'},
  {title:'好测试检查行为',en:'Good tests check behaviour',seconds:20,
   script:['测试应该描述用户能看到的行为：打开页面、提交请求、看到结果。','测试私有变量或内部调用顺序，会把一种实现方式固定下来。','行为测试能保护需求，内部测试只保护当初的写法。'],
   enScript:['Tests should describe behaviour a user can observe: open the page, submit a request, see the result.','Testing private variables or call order freezes one implementation.','Behaviour tests protect requirements; internal tests only protect the original code.'],
   notes:['测试是需求的另一种写法。','重构时，行为测试仍然应该通过。'],
   enNotes:['A test is another way to write a requirement.','Behaviour tests should survive a refactor.'],
   conceptZh:'行为测试',conceptEn:'Behaviour tests',conceptNoteZh:'测试可观察的结果',conceptNoteEn:'Test observable outcomes'},
  {title:'判断留给人',en:'Judgement stays human',seconds:19,
   script:['工具能告诉你页面没有报错，却不能告诉你措辞是否合适、流程是否符合业务。','这些判断依赖目标、语境和责任感，无法完全自动化。','所以智能体可以提交结果，决定仍要由人做出。'],
   enScript:['Tools can tell you the page has no errors; they cannot tell you whether the wording or flow suits the business.','Those judgements depend on goals, context and accountability, which cannot be fully automated.','An agent may submit a result; a person still makes the decision.'],
   notes:['自动检查解决“对不对”，人决定“该不该”。','判断需要承担后果的人来做。'],
   enNotes:['Automation answers “is it correct”; people decide “should it be”.','Judgement belongs to whoever carries the consequence.'],
   conceptZh:'人工判断',conceptEn:'Human judgement',conceptNoteZh:'目标、语境与责任',conceptNoteEn:'Goals, context and accountability'},
  {title:'把交付流程写下来',en:'Write the delivery flow down',seconds:19,
   script:['把检查顺序固定下来：先自动检查，再看改动，最后由人批准合并。','流程写清楚，团队里的每个人都能重复同样的交付标准。','工具负责挡住机械错误，人负责产品决定，责任各归其位。'],
   enScript:['Fix the order: automated checks first, then inspect the change, then a person approves the merge.','A written flow lets everyone on the team repeat the same delivery standard.','Tools stop mechanical errors while people own product decisions, each with clear responsibility.'],
   notes:['流程让好习惯不依赖记忆。','每一道关卡都要有明确的通过条件。'],
   enNotes:['A flow makes good habits independent of memory.','Each gate needs an explicit pass condition.'],
   conceptZh:'交付流程',conceptEn:'Delivery flow',conceptNoteZh:'检查、复核、批准、合并',conceptNoteEn:'Check, review, approve, merge'},
 ].map((s,i)=>({...s,art:(p,lang)=>checksArt(i,p,lang)}))};
