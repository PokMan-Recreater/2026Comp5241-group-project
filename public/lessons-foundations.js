import courseAudio from './course-audio-manifest.js';
import {kit,frame} from './lesson-art-kit.js';

function usersArt(step,p,lang){
 const {text,box,path,group,face,phone,doc,db,lens,ok,no,clock}=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${face(112,96,'#bad7c2')}${text(112,186,'学生','Student',13,'#242032','middle')}${text(112,206,'作答并提交','Answer and submit',10,'#665e72','middle')}
  ${face(608,96,'#e9c58b','#6b4a2f')}${text(608,186,'教师','Teacher',13,'#242032','middle')}${text(608,206,'出题并发布','Create and publish',10,'#665e72','middle')}
  ${phone(331,78,1)}
  ${path('M152 128Q240 100 326 118')}${path('M568 128Q480 100 394 118')}
  ${group(.22,ok(276,224)+text(296,229,'答案保存','Answers saved',11,'#34734b'))}
  ${group(.4,ok(422,224)+text(442,229,'成绩发布','Scores published',11,'#34734b'))}
  ${text(360,322,'直接使用者每天操作界面','Direct users operate the interface every day',14,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${face(360,58,'#e9c58b')}${box(298,136,124,70,'#f3eef9')}${text(360,176,'在线测验','Online quiz',15,'#242032','middle')}
  ${lens(96,72)}${text(96,122,'助教','Teaching assistant',12,'#665e72','middle')}${text(96,140,'核对成绩','Checks scores',10,'#665e72','middle')}
  ${db(624,66)}${text(624,134,'管理员','Administrator',12,'#665e72','middle')}${text(624,152,'账号与备份','Accounts and backups',10,'#665e72','middle')}
  ${doc(72,224,'#fff4d4')}${text(130,318,'教务办公室','Registry office',12,'#665e72','middle')}
  ${clock(624,236)}${text(624,274,'课程负责人','Course lead',12,'#665e72','middle')}${text(624,292,'归档与复核','Archive and review',10,'#665e72','middle')}
  ${path('M132 104Q230 110 292 158','#7967ac',true)}${path('M588 104Q490 110 428 158','#7967ac',true)}
  ${path('M136 240Q230 226 292 190','#7967ac',true)}${path('M584 240Q490 226 428 190','#7967ac',true)}
  ${text(360,328,'他们不常打开界面，却依赖系统产生的数据','They rarely open the interface, yet rely on its data',13,'#665e72','middle')}
 `;
 if(step===2){const {chip}=kit(p,lang),rows=/** @type {[number,string,string,string,string,string,string,string][]} */ ([[38,'学生','Student','#bad7c2','保存与续答','Saves and resumes','改答与撤回','Edit and withdraw'],[118,'教师','Teacher','#e9c58b','评分正确','Correct scoring','批量发布','Batch publishing'],[198,'管理员','Administrator','#c8b8e5','权限控制','Access control','备份恢复','Backup and restore'],[278,'助教','Teaching assistant','#bad7c2','统计口径一致','Consistent counts','快速核对','Fast checking']]);body=rows.map(([y,zh,en,c,a,ae,b,be],i)=>group(i*.2,`${face(66,y+16,c)}${text(104,y+14,zh,en,lang==='en'?11:14,'#242032')}${chip(230,y-4,220,a,ae)}${chip(468,y-4,220,b,be)}`)).join('')+`${text(360,344,'同一个系统，需要满足的不是同一种“好用”','One system, but not one definition of “works well”',13,'#665e72','middle')}`;}
 if(step===3)body=`
  ${text(40,44,'角色','Role',13)}${text(196,44,'任务','Task',13)}${text(436,44,'结果与证据','Outcome and evidence',13)}
  <path d="M30 58H690" stroke="#292535" stroke-width="2"/>
  ${group(.05,face(52,84,'#bad7c2')+text(84,86,'学生','Student',13)+text(84,106,'考试中续答','Resume an exam',10,'#665e72')+text(196,86,'提交后状态可见','Status visible after submit',12)+text(436,106,'截图：已保存','Screenshot: saved',10,'#34734b')+ok(652,86))}
  ${group(.24,face(52,164,'#e9c58b')+text(84,166,'教师','Teacher',13)+text(84,186,'发布成绩','Publish scores',10,'#665e72')+text(196,166,'分数与学生一致','Scores match students',12)+text(436,186,'抽查 10 份','Spot-check 10',10,'#34734b')+ok(652,166))}
  ${group(.44,face(52,244,'#c8b8e5')+text(84,246,'管理员','Administrator',13)+text(84,266,'恢复备份','Restore backup',10,'#665e72')+text(196,246,'数据可完整恢复','Data recovers fully',12)+text(436,266,'演练记录','Drill record',10,'#34734b')+ok(652,246))}
  ${group(.68,no(652,306)+text(40,324,'无法验证的任务：先补条件，或移出本轮范围','Unverifiable tasks: add a condition or move them out of scope',12,'#a64e44'))}
 `;
 return frame(body,['谁使用系统，谁关心结果','Who uses the system and who cares?'],lang);
}

function buildArt(step,p,lang){
 const {text,path,group,face,phone,doc,db,ok,clock,speech,cloud,no}=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${face(84,92,'#bad7c2')}${text(84,182,'学生','Student',13,'#242032','middle')}
  ${speech(140,34,216,'考试中途断网了','My connection dropped mid-exam')}
  ${cloud(238,178,'#e6eef7')}${no(272,166,'#b96559')}${text(238,224,'网络中断','Offline',10,'#b96559','middle')}
  ${phone(382,56,0.95)}${text(411,186,'作答页面','Answer page',11,'#665e72','middle')}
  ${doc(566,72,'#e7f2e7')}${checkMark(590,106)}${text(596,172,'期望结果','Expected',11,'#34734b','middle')}${text(596,192,'继续作答，答案不丢','Resume; answers stay',10,'#34734b','middle')}
  ${text(360,300,'场景 = 人物 + 触发条件 + 期望结果','A scenario = people + trigger + expected result',15,'#242032','middle')}
  ${text(360,326,'一句功能名，通常描述不了行为','A feature name usually cannot describe behaviour',12,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${phone(66,88,0.92)}${text(95,214,'界面','Interface',12,'#665e72','middle')}
  <circle cx="360" cy="150" r="48" fill="#f3eef9" stroke="#292535" stroke-width="2"/>${text(360,146,'服务','Service',14,'#242032','middle')}${text(360,168,'规则','Rules',10,'#665e72','middle')}
  ${db(620,146)}${text(620,216,'存储','Storage',12,'#665e72','middle')}
  ${path('M148 150H300')}${path('M420 150H580')}
  ${group(.3,text(224,132,'提交','Submit',11,'#7967ac','middle')+text(500,132,'保存','Save',11,'#7967ac','middle'))}
  ${group(.55,ok(300,262)+text(322,267,'断网后重新打开，答案还在','Reopen after a drop; answers survive',12,'#34734b'))}
  ${text(360,322,'先切出一条贯穿各层的最小路径','Cut one thin path through every layer',14,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${phone(60,64,0.9)}${text(89,190,'界面','Interface',13,'#242032','middle')}${text(89,210,'收集输入，展示结果','Collect input, show results',10,'#665e72','middle')}
  <circle cx="360" cy="118" r="44" fill="#f3eef9" stroke="#292535" stroke-width="2"/>${text(360,112,'服务','Service',13,'#242032','middle')}${text(360,132,'执行规则','Enforce rules',10,'#665e72','middle')}
  ${db(620,100)}${text(620,170,'存储','Storage',13,'#242032','middle')}${text(620,190,'持久保存','Durable save',10,'#665e72','middle')}
  ${speech(260,204,396,'重复提交由服务拦截','Duplicate submits are blocked by the service')}
  ${no(86,284,'#b96559')}${text(112,289,'不在按钮里做规则','Never put rules in a button',11,'#a64e44')}
  ${text(360,330,'职责分清，改动才不用同时猜三个地方','Clear ownership means fewer places to guess',13,'#665e72','middle')}
 `;
 if(step===3){body=`
  ${face(84,104,'#bad7c2')}${text(84,196,'真实用户','Real user',12,'#665e72','middle')}
  ${phone(320,58,0.86)}${text(349,186,'第一版','First version',12,'#665e72','middle')}
  ${speech(430,72,224,'卡在这一步了','I’m stuck here')}
  <circle cx="612" cy="200" r="42" fill="#f3eef9" stroke="#292535" stroke-width="2"/>${text(612,195,'调整','Adjust',12,'#242032','middle')}${text(612,214,'下一轮','Next round',10,'#665e72','middle')}
  ${group(.18,path('M170 140Q250 96 312 112','#7967ac',true))}
  ${group(.38,path('M396 96Q410 86 422 86','#7967ac',true))}
  ${group(.58,path('M612 152V128','#b58a1f',true)+path('M542 66Q400 14 120 58','#b58a1f',true)+path('M120 58Q66 82 74 118','#b58a1f',true))}
  ${group(.7,clock(566,286)+text(590,290,'早一点看到反馈','See feedback earlier',12,'#66502a'))}
  ${text(360,332,'可运行版本，用来换真实反馈','A working slice buys real feedback',13,'#665e72','middle')}
 `;}
 return frame(body,['从需求到可运行版本','From requirements to a working version'],lang);
}
function checkMark(x,y){return `<path d="M${x-7} ${y}l5 6 11-13" fill="none" stroke="#34734b" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;}

function releaseArt(step,p,lang){
 const {text,path,group,face,phone,doc,db,ok,no,clock,speech,cloud,warn}=kit(p,lang);
 let body='';
 if(step===0)body=`
  <path d="M360 34v276" stroke="#a49ab8" stroke-width="2" stroke-dasharray="6 7"/>
  ${text(180,44,'发布前','Before release',14,'#242032','middle')}${text(540,44,'发布后','After release',14,'#242032','middle')}
  ${phone(96,84,0.9)}${face(226,108,'#c8b8e5')}${text(160,216,'本机 · 测试数据','Local · test data',12,'#665e72','middle')}
  ${cloud(516,92)}${face(468,176,'#bad7c2')}${face(566,176,'#e9c58b')}${face(616,120,'#c8b8e5')}
  ${text(540,244,'真实用户 · 真实数据','Real users · real data',12,'#665e72','middle')}
  ${group(.4,warn(408,70)+text(390,120,'空值 · 重复 · 超量','Nulls · duplicates · volume',10,'#8a6a25','middle'))}
  ${text(360,330,'发布改变的是条件，不只是版本号','Release changes the conditions, not just the number',13,'#665e72','middle')}
 `;
 if(step===1){const tiles=/** @type {[number,string,string,string,string,string][]} */ ([[52,'错误率','Error rate','0.4%','#b96559',warn(126,126)],[220,'响应时间','Latency','820ms','#8a6a25',clock(294,126)],[388,'提交失败','Failed submits','3','#b96559',no(462,126)],[556,'用户反馈','User reports','12','#7967ac',speech(566,106,128,'有学生说慢','Slow for some')]]);body=tiles.map(([x,a,ae,v,c,ic],i)=>group(i*.18,`<rect x="${x}" y="56" width="148" height="150" rx="12" fill="#fffefb" stroke="#292535" stroke-width="2"/>${text(x+74,84,a,ae,12,'#665e72','middle')}${ic}${text(x+74,186,v,v,14,'#242032','middle')}`)).join('')+`${group(.75,ok(300,268)+text(324,273,'指标正常，不代表没有问题','Green metrics do not prove health',12,'#34734b'))}${text(360,322,'先定义什么算异常，再决定何时介入','Define what counts as abnormal before intervening',13,'#665e72','middle')}`;}
 if(step===2)body=`
  <circle cx="140" cy="120" r="40" fill="#f9e8e2" stroke="#292535" stroke-width="2"/>${text(140,114,'新版本','New release',12,'#a64e44','middle')}${text(140,134,'v2.4','v2.4',10,'#665e72','middle')}
  ${warn(140,232,'#d4a735')}${text(140,286,'异常信号','Abnormal signal',11,'#8a6a25','middle')}
  ${path('M140 164v44','#b58a1f')}
  <circle cx="404" cy="120" r="42" fill="#e7f2e7" stroke="#292535" stroke-width="2"/>${text(404,116,'回退','Roll back',12,'#34734b','middle')}${text(404,136,'最快止血','Fastest stop',10,'#5c7a63','middle')}
  <circle cx="404" cy="232" r="42" fill="#fff4d4" stroke="#292535" stroke-width="2"/>${text(404,228,'热修复','Hotfix',12,'#8a6a25','middle')}${text(404,248,'最小改动','Smallest change',10,'#66502a','middle')}
  ${path('M180 120H354')}${path('M180 212Q300 236 356 232','#b58a1f',true)}
  ${path('M448 120Q540 120 596 84','#7967ac',true)}${path('M448 232Q560 240 596 258','#7967ac',true)}
  ${db(626,58)}${text(626,120,'旧版本','Previous',10,'#665e72','middle')}
  ${ok(626,250)}${text(626,288,'验证通过','Verified',10,'#34734b','middle')}
  ${text(360,330,'先止血，再修根因','Stop the bleeding first, then fix the cause',13,'#665e72','middle')}
 `;
 if(step===3){const items=/** @type {[number,string,string,string][]} */ ([[70,'依赖更新','Dependency updates',cloud(92,96)],[240,'安全补丁','Security patches',kit(p,lang).lock(264,96)],[410,'容量调整','Capacity',db(434,84)],[580,'文档同步','Docs',doc(592,76,'#fff4d4')]]);body=items.map(([x,a,ae,ic],i)=>group(i*.18,`${ic}${text(x+34,178,a,ae,12,'#242032','middle')}${text(x+34,198,['每月检查','定期演练','按增长扩容','随改动更新'][i],['Monthly','Drills','Scale up','Keep current'][i],9,'#665e72','middle')}`)).join('')+group(.72,path('M70 268C70 320 640 320 640 268','#7967ac',true)+text(360,320,'把维护放进计划，而不是等空闲','Schedule maintenance instead of waiting for spare time',12,'#7967ac','middle'))+`${text(360,52,'软件寿命越长，维护越重要','The longer it lives, the more maintenance matters',14,'#242032','middle')}`;}
 return frame(body,['发布之后，工作怎样继续','Work after release'],lang);
}

function qualityArt(step,p,lang){
 const {text,path,group,face,doc,ok,clock,speech,warn,lens,lock}=kit(p,lang);
 let body='';
 if(step===0){body=`
  <circle cx="360" cy="176" r="52" fill="#f3eef9" stroke="#292535" stroke-width="2"/>${text(360,172,'质量','Quality',15,'#242032','middle')}${text(360,192,'不是一个分数','Not one score',9,'#665e72','middle')}
  ${group(.1,ok(120,74)+text(120,112,'正确','Correct',11,'#34734b','middle'))}
  ${group(.22,clock(262,58)+text(262,96,'可靠','Reliable',11,'#665e72','middle'))}
  ${group(.34,face(456,56,'#bad7c2')+text(456,116,'易用','Usable',11,'#665e72','middle'))}
  ${group(.46,doc(580,56,'#e7f2e7')+text(609,152,'可维护','Maintainable',11,'#34734b','middle'))}
  ${group(.58,lock(120,226)+text(120,272,'安全','Secure',11,'#66502a','middle'))}
  ${group(.7,`<circle cx="452" cy="246" r="30" fill="#f3eef9" stroke="#292535" stroke-width="2"/><path d="M452 246l16-14" stroke="#7967ac" stroke-width="3" stroke-linecap="round"/>`+text(452,296,'性能','Performance',11,'#7967ac','middle'))}
  ${text(360,334,'先说明在讨论哪一个维度','Name the dimension you are discussing',13,'#665e72','middle')}
 `;}
 if(step===1)body=`
  ${path('M360 74L176 286H544Z','#7967ac',true)}
  ${text(360,58,'范围','Scope',14,'#242032','middle')}
  ${text(150,310,'时间','Time',14,'#242032','middle')}
  ${text(576,310,'质量','Quality',14,'#242032','middle')}
  ${group(.3,`<path d="M270 150l60 10" stroke="#b96559" stroke-width="3" stroke-linecap="round"/>`+speech(250,120,190,'加功能，挤压检查','More features, less checking'))}
  ${group(.52,`<path d="M470 250l-50-14" stroke="#b96559" stroke-width="3" stroke-linecap="round"/>`+text(500,236,'压时间，牺牲可维护','Less time, less care',11,'#a64e44','middle'))}
  ${group(.7,`<circle cx="360" cy="200" r="9" fill="#d4a735"/>`)}
  ${text(360,336,'取舍不是失败，是把限制说清楚','A trade-off is not failure; it is clarity about limits',12,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${text(150,50,'高风险','High risk',13,'#a64e44','middle')}${text(520,50,'低风险','Low risk',13,'#34734b','middle')}
  ${text(66,140,'不确定','Uncertain',11,'#665e72','middle')}${text(66,260,'较确定','Certain',11,'#665e72','middle')}
  <rect x="104" y="64" width="240" height="118" rx="12" fill="#f9e8e2" stroke="#292535" stroke-width="2"/>${warn(152,110)}${text(128,158,'先做原型与测试','Prototype and test first',11,'#a64e44')}
  <rect x="376" y="64" width="240" height="118" rx="12" fill="#fff4d4" stroke="#292535" stroke-width="2"/>${lens(424,110)}${text(400,158,'小样本先验证','Verify on a small sample',11,'#8a6a25')}
  <rect x="104" y="204" width="240" height="118" rx="12" fill="#fffefb" stroke="#292535" stroke-width="2"/>${doc(140,234,'#f3eef9')}${text(128,300,'排期即可','Schedule it',11,'#665e72')}
  <rect x="376" y="204" width="240" height="118" rx="12" fill="#e7f2e7" stroke="#292535" stroke-width="2"/>${ok(424,266)}${text(400,300,'晚一点也没关系','Later is acceptable',11,'#34734b')}
 `;
 if(step===3)body=`
  ${speech(180,44,300,'先这样，回头再改','Ship it for now, fix later')}
  ${doc(200,120,'#f9e8e2',120,110)}${text(260,168,'临时方案','Temporary fix',13,'#a64e44','middle')}${text(260,190,'没有记录','Not recorded',10,'#665e72','middle')}
  ${path('M360 240C460 200 520 168 560 130','#b96559',true)}${text(512,214,'利息','Interest',11,'#a64e44','middle')}
  ${group(.4,`<rect x="470" y="58" width="200" height="44" rx="9" fill="#fff4d4" stroke="#292535" stroke-width="2"/>${text(570,85,'记录：位置 · 原因 · 计划','Record: where, why, when',10,'#66502a','middle')}`)}
  ${group(.62,clock(120,268)+text(148,272,'定期偿还','Repay on a schedule',12,'#665e72'))}
  ${group(.78,ok(600,268)+text(588,318,'债可见，才可管理','Visible debt is manageable',12,'#34734b','end'))}
  ${text(360,338,'并非所有债都要立刻偿还','Not all debt must be repaid immediately',11,'#665e72','middle')}
 `;
 return frame(body,['软件质量与工程取舍','Software quality and trade-offs'],lang);
}

const base={section:'01 软件工程与开发基础',sectionEn:'01 SOFTWARE ENGINEERING FOUNDATIONS',position:'01 · 交付之前',positionEn:'01 · Before delivery',audio:true};

export const usersStakeholdersLesson={...base,
 id:'users-stakeholders',code:'1.1',courseId:'delivery-basics',
 title:'谁使用系统，谁关心结果',titleEn:'Who uses the system and who cares?',
 sceneTitle:'谁使用系统，谁关心结果',sceneTitleEn:'Who uses the system and who cares?',
 audioManifest:courseAudio['users-stakeholders'],
 steps:[
  {title:'直接使用者',en:'Direct users',seconds:18,
   script:['在线测验最直接的使用者是学生和教师：学生作答，教师出题并发布成绩。','程序很容易只照顾其中一方，比如只做了学生端的提交按钮。','先把每个直接使用者要在系统里完成的任务列出来。'],
   enScript:['The direct users of an online quiz are students and teachers: students answer, teachers author and publish scores.','It is easy to serve only one side, for example by building just the student submit button.','Start by listing the tasks each direct user must complete in the system.'],
   notes:['直接使用者每天操作界面，他们的任务决定主流程。','只围绕一个角色设计，另一个角色会被迫绕过系统。'],
   enNotes:['Direct users operate the interface daily; their tasks define the main flow.','Design for one role only and the other role will work around the system.'],
   conceptZh:'直接使用者',conceptEn:'Direct users',conceptNoteZh:'谁在操作界面',conceptNoteEn:'Who operates the interface'},
  {title:'间接受影响的人',en:'Indirectly affected people',seconds:20,
   script:['助教要核对成绩，管理员要处理账号和备份，教务办公室要归档整门课的结果。','他们很少打开这个界面，却依赖系统产生的数据。','所以除了问谁在用，还要问谁在使用结果。'],
   enScript:['Teaching assistants check scores, administrators handle accounts and backups, and the registry office archives results for the whole course.','They rarely open this interface, yet they rely on the data it produces.','So besides asking who uses the system, ask who uses its results.'],
   notes:['间接受影响的人常通过数据接触系统。','他们的要求往往以权限、导出口径和留档形式出现。'],
   enNotes:['Indirect stakeholders often meet the system through its data.','Their needs usually appear as permissions, export rules and archives.'],
   conceptZh:'间接相关者',conceptEn:'Indirect stakeholders',conceptNoteZh:'使用结果而非界面',conceptNoteEn:'They use results, not the UI'},
  {title:'每个角色关心不同的结果',en:'Different roles, different outcomes',seconds:22,
   script:['学生关心答案是否保存、断网后能否继续；教师关心评分是否正确、能否批量发布。','管理员关心权限和备份，助教关心统计口径是否一致。','同一个系统，需要满足的不是同一种好用。'],
   enScript:['Students care whether answers are saved and can resume after a disconnect; teachers care that scoring is correct and scores can be published in batches.','Administrators care about permissions and backups, while teaching assistants care that the counts agree.','One system does not have one shared definition of working well.'],
   notes:['把“好用”拆成每个角色可检查的具体结果。','不同角色之间的要求可能冲突，需要显式取舍。'],
   enNotes:['Break “works well” into checkable outcomes per role.','Requirements across roles can conflict and need explicit trade-offs.'],
   conceptZh:'角色关注点',conceptEn:'Role concerns',conceptNoteZh:'同一个系统，不同的验收',conceptNoteEn:'One system, different acceptance'},
  {title:'用角色任务表收敛范围',en:'Use a role-task table to set scope',seconds:21,
   script:['把角色和任务排成一张表，写清每次操作的输入、结果和证据。','表里出现却无法验证的任务，要么补上条件，要么先移出本轮范围。','范围有了依据，功能清单才不是凭感觉删减。'],
   enScript:['Lay roles and tasks out in a table with the input, outcome and evidence for each operation.','If a task cannot be verified, add a condition or move it out of this round.','With scope grounded in evidence, cutting the feature list stops being guesswork.'],
   notes:['角色任务表把模糊的“大家都要好用”变成可讨论的条目。','无法验证的任务留到下一轮，比含糊承诺更可靠。'],
   enNotes:['A role-task table turns “good for everyone” into debatable items.','Deferring unverifiable tasks is more honest than a vague promise.'],
   conceptZh:'角色任务表',conceptEn:'Stakeholder task table',conceptNoteZh:'用表格收敛范围',conceptNoteEn:'Use the table to set scope'},
 ].map((s,i)=>({...s,art:(p,lang)=>usersArt(i,p,lang)}))};

export const requirementsToBuildLesson={...base,
 id:'requirements-to-build',code:'1.1',courseId:'delivery-basics',
 title:'从需求到可运行版本',titleEn:'From requirements to a working version',
 sceneTitle:'从需求到可运行版本',sceneTitleEn:'From requirements to a working version',
 audioManifest:courseAudio['requirements-to-build'],
 steps:[
  {title:'把需求写成场景',en:'Write the requirement as a scenario',seconds:19,
   script:['需求先写成一个具体场景：谁在什么情况下，需要系统完成什么。','例如学生考试中途断网，重新打开页面后应继续作答，已填答案不能丢失。','场景写清楚，才能判断实现出来的行为对不对。'],
   enScript:['Write a requirement as a concrete scenario: who, under what conditions, needs the system to do what.','For example, a student loses connectivity mid-exam; reopening the page must let them continue without losing answers.','Only a clear scenario lets you judge whether the built behaviour is right.'],
   notes:['场景包含人物、触发条件、期望结果。','一句功能名通常不足以描述行为。'],
   enNotes:['A scenario names the people, the trigger and the expected result.','A feature name rarely describes behaviour.'],
   conceptZh:'场景化需求',conceptEn:'Scenario requirement',conceptNoteZh:'人物、触发、期望',conceptNoteEn:'People, trigger, outcome'},
  {title:'切出最小可运行版本',en:'Cut a working slice',seconds:20,
   script:['不要先做完整界面，也不要先搭完所有服务。','先切出一条能贯穿界面、服务、存储的最小路径，让一个真实操作跑通。','这条路径能运行后，再逐步补齐分支和细节。'],
   enScript:['Do not build the whole interface first, and do not finish every service first.','Cut one minimal path that runs through interface, service and storage so one real action works end to end.','Once that path runs, add branches and detail gradually.'],
   notes:['最小可运行版本要贯穿所有关键层。','一次只加一个能力，问题更容易定位。'],
   enNotes:['A walking slice crosses every key layer.','Add one capability at a time so problems stay locatable.'],
   conceptZh:'最小可运行版本',conceptEn:'Working slice',conceptNoteZh:'贯穿各层的一条路径',conceptNoteEn:'One path through every layer'},
  {title:'把职责分配到各层',en:'Assign responsibilities to layers',seconds:20,
   script:['切出来的路径要分配职责：界面负责收集和展示，服务负责规则，存储负责保存。','例如重复提交的拦截属于服务，不属于按钮。','职责分清，改动才不需要同时猜三个地方。'],
   enScript:['Assign responsibilities along the slice: the interface collects and shows, the service enforces rules, storage persists.','Blocking duplicate submissions belongs to the service, not to a button.','Clear ownership means a change does not require guessing in three places.'],
   notes:['每条规则应该有明确的责任层。','把规则放在界面里，换一个入口就会失效。'],
   enNotes:['Every rule should have an owning layer.','Put a rule in the interface and a second entry point breaks it.'],
   conceptZh:'职责分配',conceptEn:'Responsibility split',conceptNoteZh:'规则放在哪一层',conceptNoteEn:'Which layer owns the rule'},
  {title:'用第一个版本换反馈',en:'Trade the first version for feedback',seconds:18,
   script:['第一个版本能跑通后，尽快让真实用户试一次。','观察他们卡在哪一步，比继续加功能更能修正方向。','反馈进入下一轮，版本才算真正开始演进。'],
   enScript:['Once the first version runs, put it in front of a real user as soon as possible.','Watching where they get stuck corrects direction better than adding more features.','When feedback enters the next round, the version has truly begun to evolve.'],
   notes:['早期反馈便宜，晚期返工昂贵。','先验证主流程，再优化外观。'],
   enNotes:['Early feedback is cheap; late rework is expensive.','Verify the main flow before polishing appearance.'],
   conceptZh:'早期反馈',conceptEn:'Early feedback',conceptNoteZh:'可运行版本换真实反馈',conceptNoteEn:'Trade a working slice for feedback'},
 ].map((s,i)=>({...s,art:(p,lang)=>buildArt(i,p,lang)}))};

export const afterReleaseLesson={...base,
 id:'after-release',code:'1.1',courseId:'delivery-basics',
 title:'发布之后，工作怎样继续',titleEn:'Work after release',
 sceneTitle:'发布之后，工作怎样继续',sceneTitleEn:'Work after release',
 audioManifest:courseAudio['after-release'],
 steps:[
  {title:'发布改变条件',en:'Release changes the conditions',seconds:18,
   script:['发布之前，测试数据由团队控制；发布之后，用户、网络和设备都不再可控。','真实数据会带来空值、重复、超量和权限问题。','发布改变的是条件，不只是版本号。'],
   enScript:['Before release the team controls the test data; afterwards users, networks and devices are no longer under control.','Real data brings nulls, duplicates, volume and permission problems.','Release changes the conditions, not just the version number.'],
   notes:['发布把“能演示”变成“持续承担”。','上线前要预想数据规模和异常输入。'],
   enNotes:['Release turns “it demos” into “we sustain it”.','Anticipate data volume and odd input before launch.'],
   conceptZh:'发布后的条件',conceptEn:'Conditions after release',conceptNoteZh:'真实用户与真实数据',conceptNoteEn:'Real users, real data'},
  {title:'观察运行信号',en:'Watch the production signals',seconds:20,
   script:['发布后要观察信号：错误率、响应时间、提交失败和用户反馈。','单个指标正常，不代表系统健康，例如错误被静默吞掉。','先定义什么算异常，再决定何时介入。'],
   enScript:['After release, watch the signals: error rate, response time, failed submissions and user reports.','A single healthy metric does not prove health; errors can be swallowed silently.','Define what counts as abnormal before deciding when to intervene.'],
   notes:['没有基线的指标无法判断好坏。','用户反馈是信号，不是全部事实。'],
   enNotes:['A metric without a baseline cannot be judged.','User reports are signals, not the whole truth.'],
   conceptZh:'运行信号',conceptEn:'Production signals',conceptNoteZh:'错误、延迟、失败、反馈',conceptNoteEn:'Errors, latency, failures, reports'},
  {title:'修复与回退',en:'Fix and roll back',seconds:20,
   script:['发现问题后，先判断能否回退；回退是最快的止血方式。','如果必须修复，就把改动限制在最小范围，并补上验证。','修复和回退都要写清触发条件和验证结果。'],
   enScript:['When something breaks, first ask whether you can roll back; rollback is the fastest way to stop harm.','If a fix is required, keep the change minimal and add verification.','Both fixes and rollbacks need written triggers and verified outcomes.'],
   notes:['回退预案应在发布前准备。','热修复同样需要检查，不要跳过验证。'],
   enNotes:['Prepare the rollback plan before release.','Hotfixes need checks too; do not skip verification.'],
   conceptZh:'修复与回退',conceptEn:'Fix and roll back',conceptNoteZh:'先止血，再修根因',conceptNoteEn:'Stop the bleeding first'},
  {title:'把维护放回计划',en:'Put maintenance back on the plan',seconds:20,
   script:['软件在发布后还要长期维护：更新依赖、修补安全漏洞、调整容量。','文档要跟着系统更新，否则下一次改动会重复摸索。','把维护当作计划内工作，而不是空闲时才做的事。'],
   enScript:['Software needs long-term maintenance after release: dependency updates, security patches and capacity changes.','Docs must follow the system, or the next change repeats the same discovery.','Treat maintenance as planned work, not something for idle time.'],
   notes:['维护成本会随系统寿命累积。','过期依赖是常见的风险来源。'],
   enNotes:['Maintenance cost accumulates with system lifetime.','Outdated dependencies are a common source of risk.'],
   conceptZh:'持续维护',conceptEn:'Ongoing maintenance',conceptNoteZh:'依赖、漏洞、容量、文档',conceptNoteEn:'Dependencies, security, capacity, docs'},
 ].map((s,i)=>({...s,art:(p,lang)=>releaseArt(i,p,lang)}))};

export const qualityTradeoffsLesson={...base,
 id:'quality-tradeoffs',code:'1.1',courseId:'delivery-basics',
 title:'软件质量与工程取舍',titleEn:'Software quality and trade-offs',
 sceneTitle:'软件质量与工程取舍',sceneTitleEn:'Software quality and trade-offs',
 audioManifest:courseAudio['quality-tradeoffs'],
 steps:[
  {title:'质量有多个维度',en:'Quality has several dimensions',seconds:19,
   script:['质量不是一个分数，而是多个维度：正确性、可靠性、易用性、可维护性、安全性和性能。','一个系统可以在演示时正确，却在并发或断网时失败。','讨论质量时，先说明在说哪一个维度。'],
   enScript:['Quality is not one score but several dimensions: correctness, reliability, usability, maintainability, security and performance.','A system can be correct in a demo yet fail under concurrency or a dropped connection.','When discussing quality, name the dimension first.'],
   notes:['不同维度需要不同的检查方法。','“质量好”是一个需要拆开的说法。'],
   enNotes:['Each dimension needs a different kind of check.','“High quality” is a claim that needs unpacking.'],
   conceptZh:'质量维度',conceptEn:'Quality dimensions',conceptNoteZh:'正确、可靠、易用、可维护…',conceptNoteEn:'Correct, reliable, usable, maintainable…'},
  {title:'取舍不得避免',en:'Trade-offs are unavoidable',seconds:19,
   script:['范围、时间和质量通常不能同时最大化。','增加功能会挤压检查时间，压缩时间会牺牲可维护性。','取舍不是失败，是把限制说清楚。'],
   enScript:['Scope, time and quality usually cannot all be maximised at once.','Adding features squeezes checking time; compressing time sacrifices maintainability.','A trade-off is not failure; it is clarity about limits.'],
   notes:['取舍要写明牺牲了哪一项、为什么可以接受。','沉默的取舍会在发布后变成债务。'],
   enNotes:['State what was sacrificed and why that is acceptable.','Silent trade-offs become debt after release.'],
   conceptZh:'工程取舍',conceptEn:'Trade-offs',conceptNoteZh:'范围、时间、质量',conceptNoteEn:'Scope, time, quality'},
  {title:'用证据决定取舍',en:'Let evidence decide',seconds:20,
   script:['取舍应该由证据决定，而不是由谁声音大决定。','高风险、高不确定的地方，先补测试或原型；低风险处可以晚一点。','把证据放到桌面上，讨论才有共同基础。'],
   enScript:['Trade-offs should follow evidence, not the loudest voice.','Where risk or uncertainty is high, add tests or a prototype first; low-risk parts can wait.','Put the evidence on the table so discussion has common ground.'],
   notes:['风险高的部分值得更早验证。','证据可以是测试、数据、原型或用户反馈。'],
   enNotes:['High-risk parts deserve earlier verification.','Evidence can be tests, data, prototypes or user feedback.'],
   conceptZh:'证据驱动',conceptEn:'Evidence-driven',conceptNoteZh:'先测高风险部分',conceptNoteEn:'Test the risky parts first'},
  {title:'技术债要可见',en:'Make technical debt visible',seconds:19,
   script:['为了赶进度留下的临时方案，会成为技术债。','债本身不可怕，可怕的是没人记录，利息越滚越大。','记录位置、原因和偿还计划，定期清理。'],
   enScript:['Temporary shortcuts taken to hit a deadline become technical debt.','Debt itself is not scary; unrecorded debt is, because interest keeps growing.','Record where it lives, why, and when it will be repaid, then review it regularly.'],
   notes:['技术债要可见、可讨论、可排期。','并非所有债都要立刻偿还。'],
   enNotes:['Debt should be visible, debatable and scheduled.','Not all debt must be repaid immediately.'],
   conceptZh:'技术债',conceptEn:'Technical debt',conceptNoteZh:'记录、偿还、排期',conceptNoteEn:'Record, repay, schedule'},
 ].map((s,i)=>({...s,art:(p,lang)=>qualityArt(i,p,lang)}))};
