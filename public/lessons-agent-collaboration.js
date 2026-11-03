import courseAudio from './course-audio-manifest.js';
import {kit,frame} from './lesson-art-kit.js';

function planFirstArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.bot(120,116)}${k.speech(152,44,240,'我可以直接开始','I can start right away','#fff4d4')}
  ${k.group(.24,k.warn(388,92)+k.text(412,97,'先别急','Not yet',11,'#8a6a25'))}
  ${k.group(.42,k.doc(470,58,'#e7f2e7',92,112))}${k.text(516,186,'计划','Plan',11,'#34734b','middle')}
  ${k.group(.62,k.ok(612,132))}${k.text(612,178,'先对齐','Align first',10,'#34734b','middle')}
  ${k.group(.8,k.clock(360,250)+k.text(384,254,'几分钟换少返工','Minutes save rework',11,'#66502a'))}
  ${k.text(360,318,'先看清再动手','Look before you act',13,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'计划必须可检查','A plan must be checkable',14,'#242032','middle')}
  ${k.box(56,72,290,184,'#f9e8e2')}
  ${k.text(78,100,'模糊计划','Vague plan',12,'#a64e44')}
  ${k.no(96,134,'#b96559')}${k.text(122,139,'“把功能做完”','“Finish the feature”',12,'#a64e44')}
  ${k.text(78,178,'无法判断什么时候算完','No way to tell when it is done',10,'#665e72')}
  ${k.text(78,210,'也无法发现偏离','Nor to notice drift',10,'#665e72')}
  ${k.path('M358 162H412')}
  ${k.box(424,72,250,184,'#e7f2e7')}
  ${k.text(446,100,'可检查计划','Checkable plan',12,'#34734b')}
  ${k.group(.36,k.ok(448,128)+k.text(472,133,'列出要改的文件','List files to change',11,'#34734b'))}
  ${k.group(.52,k.ok(448,164)+k.text(472,169,'写清验收条件','State acceptance',11,'#34734b'))}
  ${k.group(.68,k.ok(448,200)+k.text(472,205,'标明不确定点','Mark unknowns',11,'#34734b'))}
  ${k.text(446,238,'每步都能回答“完成了吗”','Each step answers “done yet?”',9,'#5c7a63')}
  ${k.text(360,300,'计划的价值在于能被检查','A plan earns its keep by being checkable',12,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.box(46,68,286,188,'#f3eef9')}
  ${k.text(68,96,'计划','Plan',13,'#4a3a82')}
  ${k.group(.16,k.text(68,126,'1. 找到入口','1. Find entry point',11))}
  ${k.group(.3,k.text(68,156,'2. 列出改动','2. List changes',11))}
  ${k.group(.44,k.text(68,186,'3. 运行检查','3. Run checks',11))}
  ${k.group(.58,k.text(68,216,'4. 汇报差异','4. Report the diff',11))}
  ${k.path('M340 162H398')}
  ${k.bot(452,134)}${k.text(452,202,'执行','Execute',11,'#665e72','middle')}
  ${k.path('M502 162H566')}
  ${k.group(.6,k.face(614,102,'#e9c58b'))}${k.text(614,192,'你验收','You check',11,'#665e72','middle')}
  ${k.group(.8,k.ok(614,220))}
  ${k.text(360,300,'计划与执行分开，问题更容易看见','Separating plan and action makes problems visible',13,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.text(360,44,'计划被推翻时','When the plan breaks',14,'#242032','middle')}
  ${k.bot(112,116)}${k.warn(220,92)}${k.text(244,97,'发现依赖缺失','A missing dependency',11,'#8a6a25')}
  ${k.group(.3,k.doc(360,58,'#fff4d4',150,112))}${k.text(435,186,'更新计划','Update the plan',11,'#8a6a25','middle')}
  ${k.group(.52,k.path('M334 138H352'))}
  ${k.group(.62,k.face(566,96,'#bad7c2')+k.text(566,188,'停下确认','Stop and confirm',11,'#665e72','middle'))}
  ${k.group(.78,k.chip(452,224,220,'重新确认边界','Re-confirm boundaries','#e7f2e7'))}
  ${k.text(360,300,'计划变了要说出来，而不是硬做下去','Say the plan changed instead of pushing through',13,'#665e72','middle')}
  ${k.text(360,328,'每次偏离都是一次重新对齐的机会','Every deviation is a chance to realign',11,'#665e72','middle')}
 `;
 return frame(body,['先计划，再执行','Plan first, then execute'],lang);
}

function smallBatchArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.text(360,44,'大跨步与小步走','Big leaps and small steps',14,'#242032','middle')}
  ${k.box(52,72,288,186,'#f9e8e2')}
  ${k.text(74,100,'一次改完','Change everything at once',12,'#a64e44')}
  ${k.path('M76 162H300','#b96559')}${k.warn(316,120)}
  ${k.text(74,204,'出错时不知道是哪一处','A failure hides among many edits',10,'#665e72')}
  ${k.text(74,232,'回退会丢掉全部进度','Rollback loses all progress',10,'#665e72')}
  ${k.path('M354 162H408')}
  ${k.box(420,72,254,186,'#e7f2e7')}
  ${k.text(442,100,'分几次改','Change in small batches',12,'#34734b')}
  ${[0,1,2,3].map(i=>`<circle cx="${462+i*48}" cy="162" r="8" fill="#fffefb" stroke="#34734b" stroke-width="3"/>`).join('')}
  ${k.ok(618,132)}
  ${k.text(442,204,'每步都能单独确认','Each step confirmed alone',10,'#5c7a63')}
  ${k.text(442,232,'出错只回退一小步','A failure rolls back one step',10,'#5c7a63')}
  ${k.text(360,304,'小批量让错误更贵不起','Small batches keep mistakes cheap',13,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'每一步都要有检查','Every step needs a check',14,'#242032','middle')}
  ${k.box(56,74,146,78,'#f3eef9')}${k.text(129,106,'改一处','One edit',11,'#4a3a82','middle')}${k.text(129,130,'只碰目标','Only the target',9,'#665e72','middle')}
  ${k.path('M214 112H274')}
  ${k.group(.24,k.box(286,74,146,78,'#fffefb')+k.text(359,106,'跑检查','Run checks',11)+k.text(359,130,'测试或命令','Tests or command',9,'#665e72','middle'))}
  ${k.path('M444 112H504')}
  ${k.group(.48,k.box(516,74,146,78,'#e7f2e7')+k.text(589,106,'看结果','Read results',11,'#34734b')+k.text(589,130,'通过再继续','Proceed if green',9,'#5c7a63','middle'))}
  ${k.group(.66,k.clock(180,214)+k.text(204,218,'反馈在一分钟内','Feedback within a minute',11,'#66502a'))}
  ${k.group(.82,k.warn(420,196,'#b58a1f')+k.text(444,201,'没检查就继续 = 批量','No check before continuing',11,'#8a6a25'))}
  ${k.text(360,292,'小步的停顿本身就是保险','The pause between steps is the safety net',13,'#665e72','middle')}
  ${k.text(360,320,'检查失败就先停','Stop when a check fails',11,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.text(360,44,'缩短反馈回路','Shorten the feedback loop',14,'#242032','middle')}
  <circle cx="170" cy="168" r="46" fill="#f3eef9" stroke="#292535" stroke-width="2"/>${k.text(170,164,'改动','Edit',12,'#4a3a82','middle')}${k.text(170,184,'小范围','Small',10,'#665e72','middle')}
  <circle cx="420" cy="168" r="46" fill="#e7f2e7" stroke="#292535" stroke-width="2"/>${k.text(420,164,'检查','Check',12,'#34734b','middle')}${k.text(420,184,'立刻跑','Run now',10,'#665e72','middle')}
  ${k.path('M218 150H372')}${k.path('M372 186H218')}
  ${k.group(.5,k.clock(560,120)+k.text(584,124,'越短越好','Shorter is better',11,'#66502a'))}
  ${k.group(.68,k.doc(540,208,'#fff4d4',110,74))}${k.text(595,304,'反馈记录','Feedback record',10,'#8a6a25','middle')}
  ${k.text(360,320,'反馈越长，错误越贵','Longer loops make errors costlier',12,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.text(360,44,'避免大爆炸式改动','Avoid the big-bang change',14,'#242032','middle')}
  ${k.box(48,70,304,188,'#f9e8e2')}
  ${k.text(70,98,'一次提交','One commit',12,'#a64e44')}
  ${k.group(.2,k.doc(72,116,'#fffefb',66,82)+k.text(105,214,'界面','UI',10,'#665e72','middle'))}
  ${k.group(.32,k.doc(154,116,'#fffefb',66,82)+k.text(187,214,'逻辑','Logic',10,'#665e72','middle'))}
  ${k.group(.44,k.doc(236,116,'#fffefb',66,82)+k.text(269,214,'数据','Data',10,'#665e72','middle'))}
  ${k.group(.58,k.no(304,96,'#b96559'))}
  ${k.text(70,246,'问题出现时无法定位','No way to locate the problem',10,'#665e72')}
  ${k.path('M364 160H420')}
  ${k.box(432,70,242,188,'#e7f2e7')}
  ${k.text(454,98,'多次提交','Several commits',12,'#34734b')}
  ${k.group(.4,k.ok(454,128)+k.text(478,133,'界面已确认','UI confirmed',11,'#34734b'))}
  ${k.group(.56,k.ok(454,166)+k.text(478,171,'逻辑已确认','Logic confirmed',11,'#34734b'))}
  ${k.group(.72,k.ok(454,204)+k.text(478,209,'数据已确认','Data confirmed',11,'#34734b'))}
  ${k.text(454,244,'每步都可回退','Each step reversible',10,'#5c7a63')}
  ${k.text(360,300,'大改动拆开，风险就分散了','Splitting spreads the risk',13,'#665e72','middle')}
 `;
 return frame(body,['小批量迭代','Iterate in small batches'],lang);
}

function agentRolesArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.text(360,42,'三种角色，三种问题','Three roles, three questions',14,'#242032','middle')}
  ${k.box(44,66,196,190,'#f3eef9')}${k.lens(142,112)}${k.text(142,156,'探索','Explore',13,'#4a3a82','middle')}${k.text(142,184,'该改哪里？','Where to change?',10,'#665e72','middle')}${k.text(142,208,'有哪些相关文件？','Related files?',10,'#665e72','middle')}
  ${k.box(262,66,196,190,'#fff4d4')}${k.bot(360,132)}${k.text(360,190,'实现','Build',13,'#8a6a25','middle')}${k.text(360,218,'按计划改代码','Change per plan',10,'#665e72','middle')}
  ${k.box(480,66,196,190,'#e7f2e7')}${k.lens(578,112)}${k.text(578,156,'审查','Review',13,'#34734b','middle')}${k.text(578,184,'差异有没有问题？','Any issue in the diff?',10,'#665e72','middle')}${k.text(578,208,'边界是否覆盖？','Edges covered?',10,'#665e72','middle')}
  ${k.path('M240 160H262','#7967ac',true)}${k.path('M458 160H480','#7967ac',true)}
  ${k.text(360,300,'分工避免同一个人既写又判','Split writing from judging',13,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.lens(96,86)}
  ${k.text(96,132,'探索','Explore',13,'#4a3a82','middle')}
  ${k.box(38,158,124,92,'#f3eef9')}${k.text(100,184,'读目录','Read layout',10,'#4a3a82','middle')}${k.text(100,206,'找入口','Find entry',10,'#665e72','middle')}${k.text(100,228,'列依赖','List deps',10,'#665e72','middle')}
  ${k.path('M170 204H236')}
  ${k.group(.3,k.doc(258,148,'#fffefb',128,104))}${k.text(322,270,'一张地图','A map',10,'#665e72','middle')}
  ${k.group(.56,k.text(414,180,'先探索的人','Explorer first',12,'#242032'))}
  ${k.group(.68,k.text(414,210,'少改错文件','Touches fewer wrong files',10,'#665e72'))}
  ${k.group(.8,k.chip(470,240,180,'理解先于修改','Understand before edit','#e7f2e7'))}
  ${k.text(360,318,'探索的产出是理解，不是代码','Exploration produces understanding, not code',13,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.doc(56,74,'#fff4d4',150,112)}${k.text(131,204,'已确认计划','Confirmed plan',10,'#8a6a25','middle')}
  ${k.path('M214 132H282')}
  ${k.bot(342,128)}${k.text(342,196,'实现','Build',11,'#665e72','middle')}
  ${k.path('M392 132H456')}
  ${k.group(.4,k.doc(474,70,'#fffefb',120,90))}${k.text(534,180,'差异','Diff',10,'#665e72','middle')}
  ${k.group(.6,k.lens(626,120))}${k.text(626,162,'审查','Review',10,'#34734b','middle')}
  ${k.group(.78,k.ok(626,214))}${k.text(626,256,'通过','Pass',10,'#34734b','middle')}
  ${k.group(.3,k.chip(230,246,220,'只做计划里的事','Only what the plan covers','#f3eef9'))}
  ${k.text(360,320,'实现要克制，不顺手加功能','Implementation stays within scope',12,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.face(104,104,'#e9c58b')}${k.text(104,192,'你','You',12,'#665e72','middle')}
  ${k.bot(300,126)}${k.text(300,196,'实现者','Builder',11,'#665e72','middle')}
  ${k.lens(516,96)}${k.text(516,148,'审查者','Reviewer',11,'#665e72','middle')}
  ${k.path('M148 132H252')}${k.path('M350 132H470')}
  ${k.group(.3,k.speech(150,228,260,'验收条件是什么？','What are the acceptance criteria?','#fff4d4'))}
  ${k.group(.56,k.warn(430,214)+k.text(454,219,'审查与实现分开','Keep review separate',11,'#8a6a25'))}
  ${k.group(.76,k.ok(586,214))}${k.text(586,260,'问题更早暴露','Issues surface earlier',10,'#34734b','middle')}
  ${k.text(360,320,'你负责判断，角色负责执行','You judge; the roles execute',12,'#665e72','middle')}
 `;
 return frame(body,['探索、实现与审查的分工','Exploring, building and reviewing roles'],lang);
}

function contextLayerArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.text(360,42,'上下文有层次','Context has layers',14,'#242032','middle')}
  ${k.box(116,64,488,54,'#f3eef9')}${k.text(360,88,'长期约定','Long-term conventions',12,'#4a3a82','middle')}${k.text(360,108,'技术栈、目录、风格、禁止项','Stack, layout, style, prohibitions',9,'#665e72','middle')}
  ${k.group(.24,k.box(176,130,368,54,'#fff4d4')+k.text(360,154,'当前任务','Current task',12,'#8a6a25','middle')+k.text(360,174,'目标、范围、验收条件','Goal, scope, acceptance',9,'#665e72','middle'))}
  ${k.group(.48,k.box(236,196,248,54,'#e7f2e7')+k.text(360,220,'这一刻','This moment',12,'#34734b','middle')+k.text(360,240,'正在看的文件与报错','File and error at hand',9,'#5c7a63','middle'))}
  ${k.group(.68,k.text(360,278,'越往下越具体，也越短命','Lower layers are more specific and shorter-lived',11,'#665e72','middle'))}
  ${k.group(.84,k.clock(600,120)+k.text(600,164,'约定稳定','Conventions last',10,'#66502a','middle'))}
  ${k.text(360,322,'分层让智能体既不迷路也不超载','Layers keep the agent neither lost nor overloaded',13,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.box(48,64,300,200,'#f3eef9')}
  ${k.text(70,92,'长期约定写进项目','Conventions live in the project',12,'#4a3a82')}
  ${k.group(.16,k.ok(70,120)+k.text(94,125,'技术栈与版本','Stack and versions',11,'#4a3a82'))}
  ${k.group(.32,k.ok(70,154)+k.text(94,159,'目录与命名','Layout and naming',11,'#4a3a82'))}
  ${k.group(.48,k.ok(70,188)+k.text(94,193,'测试与构建命令','Test and build commands',11,'#4a3a82'))}
  ${k.group(.64,k.ok(70,222)+k.text(94,227,'禁止改动的位置','Do-not-touch areas',11,'#4a3a82'))}
  ${k.path('M356 162H412')}
  ${k.box(424,64,246,200,'#fffefb')}
  ${k.text(446,92,'每次新建对话','Every new session',12)}
  ${k.group(.4,k.doc(446,112,'#f3eef9',66,82))}${k.text(479,206,'自动读到','Read automatically',10,'#665e72','middle')}
  ${k.group(.62,k.text(446,234,'不用重复解释','No need to repeat',11,'#4a3a82'))}
  ${k.text(360,300,'稳定约定降低重复沟通','Stable conventions cut repeated explanations',13,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.doc(52,66,'#fff4d4',130,106)}${k.text(117,190,'任务说明','Task brief',10,'#8a6a25','middle')}
  ${k.path('M196 128H258')}
  ${k.bot(306,124)}${k.text(306,192,'智能体','Agent',11,'#665e72','middle')}
  ${k.path('M352 128H414')}
  ${k.group(.3,k.box(430,66,240,150,'#e7f2e7')+k.text(452,94,'当前上下文','Current context',12,'#34734b')+k.text(452,122,'目标与范围','Goal and scope',10,'#665e72')+k.text(452,146,'相关文件','Relevant files',10,'#665e72')+k.text(452,170,'最近的报错','Latest error',10,'#665e72')+k.text(452,194,'验收条件','Acceptance',10,'#665e72'))}
  ${k.group(.62,k.chip(218,244,284,'只给这一步需要的','Only what this step needs','#fff4d4'))}
  ${k.text(360,318,'当前任务层要小、要新','The task layer should be small and fresh',12,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.text(360,44,'过多的上下文会淹没重点','Too much context drowns the point',14,'#242032','middle')}
  ${k.box(48,72,300,188,'#f9e8e2')}
  ${k.text(70,100,'一次给全部','Give everything',12,'#a64e44')}
  ${Array.from({length:7},(_,i)=>`<rect x="${76}" y="${112+i*18}" width="${220-i*14}" height="9" rx="4" fill="#e6b4ab"/>`).join('')}
  ${k.group(.5,k.no(316,90,'#b96559'))}
  ${k.text(70,250,'重点被稀释','The point gets diluted',10,'#665e72')}
  ${k.path('M356 164H412')}
  ${k.box(424,72,246,188,'#e7f2e7')}
  ${k.text(446,100,'按需分层','Layer on demand',12,'#34734b')}
  ${k.group(.36,k.ok(446,130)+k.text(470,135,'先给目标','Goal first',11,'#34734b'))}
  ${k.group(.52,k.ok(446,166)+k.text(470,171,'再给相关文件','Then the files',11,'#34734b'))}
  ${k.group(.68,k.ok(446,202)+k.text(470,207,'追问时再补','Add on request',11,'#34734b'))}
  ${k.text(446,242,'上下文也有预算','Context has a budget too',10,'#5c7a63')}
  ${k.text(360,302,'少而准，比多而杂更有用','Few and precise beats many and vague',13,'#665e72','middle')}
 `;
 return frame(body,['上下文分层','Layering context'],lang);
}

function failureModesArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.bot(140,128)}${k.speech(172,44,260,'已经全部完成','Everything is done','#fff4d4')}
  ${k.group(.3,k.ok(454,110))}${k.text(478,115,'说的是真的吗？','Is that true?',11,'#34734b')}
  ${k.group(.48,k.doc(500,56,'#fffefb',120,92))}${k.text(560,168,'实际差异','Actual diff',10,'#665e72','middle')}
  ${k.group(.68,k.warn(454,200,'#b58a1f')+k.text(478,205,'总结可能乐观','Summaries can be optimistic',11,'#8a6a25'))}
  ${k.text(360,300,'“完成”是主张，差异才是证据','“Done” is a claim; the diff is evidence',13,'#665e72','middle')}
  ${k.text(360,328,'先读改动，再信总结','Read changes before trusting summaries',11,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'忽略边界的典型表现','Edges ignored',14,'#242032','middle')}
  ${k.box(52,72,300,180,'#f9e8e2')}
  ${k.text(74,100,'只测主路径','Happy path only',12,'#a64e44')}
  ${k.group(.2,k.ok(74,128)+k.text(98,133,'正常输入通过','Normal input passes',11,'#34734b'))}
  ${k.group(.4,k.no(74,168,'#b96559')+k.text(98,173,'空输入未处理','Empty input unhandled',11,'#b96559'))}
  ${k.group(.6,k.no(74,208,'#b96559')+k.text(98,213,'重复提交未处理','Duplicate unhandled',11,'#b96559'))}
  ${k.text(74,244,'检查清单不完整','Incomplete checklist',10,'#665e72')}
  ${k.path('M356 158H412')}
  ${k.box(424,72,246,180,'#e7f2e7')}
  ${k.text(446,100,'补上边界','Add the edges',12,'#34734b')}
  ${k.group(.36,k.ok(446,130)+k.text(470,135,'空列表','Empty list',11,'#34734b'))}
  ${k.group(.52,k.ok(446,164)+k.text(470,169,'重复提交','Duplicate submit',11,'#34734b'))}
  ${k.group(.68,k.ok(446,198)+k.text(470,203,'超量输入','Large input',11,'#34734b'))}
  ${k.text(446,236,'把边界写进要求','Put edges into the brief',10,'#5c7a63')}
  ${k.text(360,294,'不说的边界，智能体通常不会补','Unstated edges are usually skipped',13,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.bot(120,128)}${k.text(120,196,'智能体','Agent',11,'#665e72','middle')}
  ${k.lock(276,124)}${k.text(276,190,'边界','Boundary',11,'#8a6a25','middle')}
  ${k.path('M160 128H248','#b58a1f')}
  ${k.group(.3,k.no(276,66,'#b96559'))}${k.text(316,71,'不要改配置','Do not touch config',11,'#b96559')}
  ${k.group(.48,k.box(380,64,270,150,'#f3eef9')+k.text(402,92,'可做','Allowed',12,'#4a3a82')+k.text(402,120,'读写指定目录','Read and write named dirs',10,'#665e72')+k.text(402,144,'运行测试命令','Run test commands',10,'#665e72')+k.text(402,180,'部署、删数据、改权限','Deploy, delete, change access',10,'#a64e44'))}
  ${k.group(.7,k.chip(200,246,300,'越权动作要先问','Ask before privileged actions','#fff4d4'))}
  ${k.text(360,318,'边界写在任务里，不靠事后追责','Write boundaries upfront',12,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.text(360,44,'循环停滞要能识别','Spot a stalled loop',14,'#242032','middle')}
  <circle cx="200" cy="170" r="54" fill="#f9e8e2" stroke="#292535" stroke-width="2" stroke-dasharray="7 6"/>
  ${k.text(200,166,'同一尝试','Same attempt',11,'#a64e44','middle')}${k.text(200,186,'重复三次','Repeated thrice',9,'#665e72','middle')}
  ${k.path('M254 148C300 120 330 120 360 144','#b96559',true)}
  ${k.group(.34,k.warn(410,120)+k.text(434,125,'没有新信息','No new information',11,'#8a6a25'))}
  ${k.group(.54,k.clock(410,196)+k.text(434,200,'时间在流失','Time slipping away',11,'#66502a'))}
  ${k.group(.74,k.chip(430,240,232,'停下，换一个假设','Stop, change the hypothesis','#e7f2e7'))}
  ${k.text(360,306,'重复不等于进展','Repetition is not progress',13,'#665e72','middle')}
  ${k.text(360,332,'停滞时先总结已知，再换路径','Summarise what is known, then change path',10,'#665e72','middle')}
 `;
 return frame(body,['常见失败模式','Common failure modes'],lang);
}

const base={section:'02 交给 AI 编码智能体',sectionEn:'02 WORKING WITH CODING AGENTS',position:'02 · 协作模式',positionEn:'02 · Working modes',audio:true};

export const planThenExecuteLesson={...base,
 id:'plan-then-execute',code:'2.2',courseId:'agent-collaboration',
 title:'先计划，再执行',titleEn:'Plan first, then execute',
 sceneTitle:'先计划，再执行',sceneTitleEn:'Plan first, then execute',
 audioManifest:courseAudio['plan-then-execute'],
 steps:[
  {title:'先看清再动手',en:'Look before you act',seconds:18,
   script:['智能体可以立刻开始改代码，但立刻开始不一定最快。','先让它说明准备改哪些文件、按什么顺序、如何验证。','几分钟的对齐，通常能省下后面几次返工。'],
   enScript:['An agent can start editing immediately, but immediate is not always fastest.','First have it state which files it will touch, in what order and how it will verify.','A few minutes of alignment usually saves several rounds of rework.'],
   notes:['先要计划，再要代码。','计划里要写清不确定的地方。'],
   enNotes:['Ask for the plan before the code.','The plan should name its uncertainties.'],
   conceptZh:'先对齐',conceptEn:'Align first',conceptNoteZh:'文件和顺序先说清',conceptNoteEn:'Files and order first'},
  {title:'计划必须可检查',en:'A plan must be checkable',seconds:19,
   script:['“把功能做完”无法判断什么时候算完成。','可检查的计划会列出要改的文件、验收条件和未知项。','每一步都能回答“完成了吗”，执行才不会失控。'],
   enScript:['“Finish the feature” gives no way to tell when it is done.','A checkable plan lists the files to change, the acceptance conditions and the unknowns.','When each step answers “done yet?”, execution stays under control.'],
   notes:['计划写到能被验收。','未知项要单独列出来。'],
   enNotes:['Write the plan to acceptance level.','List unknowns separately.'],
   conceptZh:'可检查计划',conceptEn:'Checkable plan',conceptNoteZh:'文件、验收、未知项',conceptNoteEn:'Files, acceptance, unknowns'},
  {title:'计划与执行分开',en:'Separate plan and action',seconds:19,
   script:['让智能体先写出计划，再由你确认，然后才执行。','执行时只做计划里列出的事，超出范围要停下来问。','分开之后，问题出现在哪一步更容易被发现。'],
   enScript:['Have the agent write the plan, let you confirm, then execute.','During execution it should do only what the plan lists and stop to ask when it exceeds scope.','Separating the two makes it easier to see where a problem appeared.'],
   notes:['确认计划后可以要求按步执行。','每步结束都要看结果。'],
   enNotes:['After confirming, ask for step-by-step execution.','Review results after every step.'],
   conceptZh:'计划与执行',conceptEn:'Plan and execute',conceptNoteZh:'先确认，再动手',conceptNoteEn:'Confirm, then act'},
  {title:'计划被推翻时',en:'When the plan breaks',seconds:19,
   script:['执行中发现依赖缺失或假设错误时，不要硬做下去。','停下来，说明发现了什么，更新计划再继续。','每一次偏离都是重新对齐的机会，而不是失败。'],
   enScript:['When execution reveals a missing dependency or a wrong assumption, do not push through.','Stop, say what was found, update the plan and continue.','Every deviation is a chance to realign, not a failure.'],
   notes:['变化要说明原因。','新计划也要重新确认边界。'],
   enNotes:['Explain why the plan changed.','Re-confirm boundaries for the new plan.'],
   conceptZh:'重新对齐',conceptEn:'Realign',conceptNoteZh:'发现偏离就停下',conceptNoteEn:'Stop when drift appears'},
 ].map((s,i)=>({...s,art:(p,lang)=>planFirstArt(i,p,lang)}))};

export const smallBatchLesson={...base,
 id:'small-batch-iteration',code:'2.2',courseId:'agent-collaboration',
 title:'小批量迭代',titleEn:'Iterate in small batches',
 sceneTitle:'小批量迭代',sceneTitleEn:'Iterate in small batches',
 audioManifest:courseAudio['small-batch-iteration'],
 steps:[
  {title:'小批量让错误更便宜',en:'Small batches keep mistakes cheap',seconds:18,
   script:['一次改完时，出错很难判断是哪一处引起的。','分成几次小改，每一步都能单独确认。','出错时只回退一小步，损失也更小。'],
   enScript:['When everything changes at once, a failure is hard to attribute.','Split into several small changes so each step can be confirmed alone.','A failure rolls back one small step, so the loss is smaller too.'],
   notes:['小批量让定位更快。','每批结束都留下可用的状态。'],
   enNotes:['Small batches localise faults faster.','End each batch in a usable state.'],
   conceptZh:'小批量',conceptEn:'Small batch',conceptNoteZh:'出错只回退一小步',conceptNoteEn:'One step back on failure'},
  {title:'每一步都要有检查',en:'Every step needs a check',seconds:19,
   script:['小改之后要立刻运行检查，例如测试或构建命令。','检查通过再继续，失败就先停下来。','没有检查的连续改动，等于把许多小错叠在一起。'],
   enScript:['Run a check right after a small change, such as tests or a build.','Continue when it passes; stop when it fails.','Continuing without checks stacks many small errors together.'],
   notes:['检查和改动成对出现。','失败时先保留输出。'],
   enNotes:['Pair every change with a check.','Keep the output when a check fails.'],
   conceptZh:'改一步，查一步',conceptEn:'Edit, then check',conceptNoteZh:'通过才继续',conceptNoteEn:'Proceed only when green'},
  {title:'缩短反馈回路',en:'Shorten the feedback loop',seconds:19,
   script:['反馈回路越短，错误越早被发现。','把运行时间长的检查放到后面，把快的检查放在前面。','让每次小改都能在一分钟内得到回应。'],
   enScript:['The shorter the feedback loop, the earlier errors appear.','Put fast checks first and slow checks later.','Aim for a response within a minute of each small change.'],
   notes:['先跑快检查，再跑全量。','过慢的检查要拆开或并行。'],
   enNotes:['Run fast checks before the full suite.','Split or parallelise slow checks.'],
   conceptZh:'反馈回路',conceptEn:'Feedback loop',conceptNoteZh:'一分钟内得到回应',conceptNoteEn:'A response within a minute'},
  {title:'避免大爆炸式改动',en:'Avoid big-bang changes',seconds:19,
   script:['一次提交同时改界面、逻辑和数据，问题出现时无法定位。','拆成多次提交，每一步都可以独立验证和回退。','大改动拆开，风险就分散到可管理的小块。'],
   enScript:['Changing UI, logic and data in one commit makes attribution impossible.','Split into several commits, each verifiable and reversible on its own.','Splitting spreads risk into manageable pieces.'],
   notes:['大重构先列出可独立验证的步。','不要在同一批里混合修错和加功能。'],
   enNotes:['List independently verifiable steps for big refactors.','Do not mix fixes and features in one batch.'],
   conceptZh:'拆分风险',conceptEn:'Split the risk',conceptNoteZh:'界面、逻辑、数据分开',conceptNoteEn:'UI, logic and data apart'},
 ].map((s,i)=>({...s,art:(p,lang)=>smallBatchArt(i,p,lang)}))};

export const agentRolesLesson={...base,
 id:'agent-roles',code:'2.2',courseId:'agent-collaboration',
 title:'探索、实现与审查的分工',titleEn:'Exploring, building and reviewing roles',
 sceneTitle:'探索、实现与审查的分工',sceneTitleEn:'Exploring, building and reviewing roles',
 audioManifest:courseAudio['agent-roles'],
 steps:[
  {title:'三种角色，三种问题',en:'Three roles, three questions',seconds:18,
   script:['探索回答“该改哪里”，实现回答“怎么改”，审查回答“改得对吗”。','让同一个智能体一边写一边判，容易漏掉自己的问题。','分工之后，每个角色只需要关注一类问题。'],
   enScript:['Exploring answers where to change, building answers how, and review answers whether it is right.','Letting one agent both write and judge makes it easy to miss its own problems.','With roles split, each focuses on one kind of question.'],
   notes:['不同角色用不同提示词。','审查最好换一个上下文。'],
   enNotes:['Use different prompts per role.','Review benefits from a fresh context.'],
   conceptZh:'角色分工',conceptEn:'Role split',conceptNoteZh:'探索、实现、审查',conceptNoteEn:'Explore, build, review'},
  {title:'探索者先画地图',en:'The explorer draws the map',seconds:19,
   script:['探索者先读目录、找入口、列依赖，产出一张理解地图。','它的产出不是代码，而是“相关位置和原因”。','先探索再实现，能少改错文件。'],
   enScript:['The explorer reads the layout, finds entry points and lists dependencies to produce a map.','Its output is not code but relevant locations and reasons.','Exploring before building means fewer wrong files are touched.'],
   notes:['探索阶段不要急着改。','地图里写明依据。'],
   enNotes:['Do not edit during exploration.','Write the evidence on the map.'],
   conceptZh:'探索产出',conceptEn:'Exploration output',conceptNoteZh:'理解地图',conceptNoteEn:'A map of understanding'},
  {title:'实现者按计划动手',en:'The builder follows the plan',seconds:19,
   script:['实现者只做计划里列出的事情，不顺手加功能。','每完成一步就运行检查，并把差异交出来。','实现要克制，范围外的问题先记下来。'],
   enScript:['The builder does only what the plan lists and does not add features along the way.','It runs checks after each step and hands over the diff.','Implementation stays restrained; out-of-scope issues are noted first.'],
   notes:['实现阶段不扩大范围。','差异要能被读懂。'],
   enNotes:['Do not expand scope while building.','Keep the diff readable.'],
   conceptZh:'克制的实现',conceptEn:'Restrained build',conceptNoteZh:'只做计划内的事',conceptNoteEn:'Only what is planned'},
  {title:'审查者读差异',en:'The reviewer reads the diff',seconds:19,
   script:['审查者面对差异，检查行为、边界和副作用。','它要能说出“哪里可能出错”和“依据是什么”。','审查与实现分开，问题才更容易被指出。'],
   enScript:['The reviewer reads the diff and checks behaviour, edges and side effects.','It should say where a problem may be and on what evidence.','Keeping review separate from building makes problems easier to raise.'],
   notes:['审查用新上下文，避免自我辩解。','审查结论要写清通过或阻塞。'],
   enNotes:['Use a fresh context for review.','State clearly pass or blocked.'],
   conceptZh:'独立审查',conceptEn:'Independent review',conceptNoteZh:'换一个上下文看差异',conceptNoteEn:'A fresh context on the diff'},
 ].map((s,i)=>({...s,art:(p,lang)=>agentRolesArt(i,p,lang)}))};

export const contextLayeringLesson={...base,
 id:'context-layering',code:'2.2',courseId:'agent-collaboration',
 title:'上下文分层',titleEn:'Layering context',
 sceneTitle:'上下文分层',sceneTitleEn:'Layering context',
 audioManifest:courseAudio['context-layering'],
 steps:[
  {title:'上下文有层次',en:'Context has layers',seconds:18,
   script:['上下文至少分三层：长期约定、当前任务、这一刻的细节。','越往下越具体，也越短命。','分层让智能体既不迷路，也不被信息淹没。'],
   enScript:['Context has at least three layers: long-term conventions, the current task and this moment’s details.','Lower layers are more specific and shorter-lived.','Layering keeps the agent neither lost nor overwhelmed.'],
   notes:['长期约定放在项目里。','当前任务每次单独说明。'],
   enNotes:['Keep conventions in the project.','State the current task each time.'],
   conceptZh:'上下文分层',conceptEn:'Context layers',conceptNoteZh:'约定、任务、细节',conceptNoteEn:'Conventions, task, details'},
  {title:'长期约定写进项目',en:'Conventions live in the project',seconds:19,
   script:['技术栈、目录结构、测试命令和禁止改动的位置，属于长期约定。','把它们写进项目文档，每次新对话都会自动读到。','稳定约定减少重复解释，也减少理解偏差。'],
   enScript:['The stack, layout, test commands and do-not-touch areas are long-term conventions.','Write them into project docs so every new session reads them.','Stable conventions cut repeated explanation and misunderstanding.'],
   notes:['约定变更要更新文档。','禁止项要写具体。'],
   enNotes:['Update docs when conventions change.','Make prohibitions specific.'],
   conceptZh:'项目约定',conceptEn:'Project conventions',conceptNoteZh:'技术栈、目录、命令、禁区',conceptNoteEn:'Stack, layout, commands, limits'},
  {title:'当前任务要小而新',en:'Keep the task layer small and fresh',seconds:19,
   script:['当前任务层写清目标、范围、相关文件和验收条件。','只要这一步需要的信息，不要把整个项目都塞进去。','任务变了就更新任务层，而不是沿用旧说明。'],
   enScript:['The task layer states the goal, scope, relevant files and acceptance conditions.','Include only what this step needs; do not stuff in the whole project.','When the task changes, update the task layer instead of reusing old notes.'],
   notes:['任务说明要能直接使用。','旧任务说明容易误导。'],
   enNotes:['Make the brief directly usable.','Old briefs mislead.'],
   conceptZh:'任务层',conceptEn:'Task layer',conceptNoteZh:'目标、范围、文件、验收',conceptNoteEn:'Goal, scope, files, acceptance'},
  {title:'只给需要的',en:'Give only what is needed',seconds:19,
   script:['一次给出全部资料，重点反而被稀释。','按需分层：先给目标，再给相关文件，追问时再补细节。','上下文也有预算，少而准比多而杂更有用。'],
   enScript:['Giving everything at once dilutes the point.','Layer on demand: goal first, then the relevant files, then details when asked.','Context has a budget; few and precise beats many and vague.'],
   notes:['先给最相关的文件。','追问时再展开历史。'],
   enNotes:['Start with the most relevant files.','Expand history only when asked.'],
   conceptZh:'按需给上下文',conceptEn:'Context on demand',conceptNoteZh:'先目标，再文件，再细节',conceptNoteEn:'Goal, then files, then detail'},
 ].map((s,i)=>({...s,art:(p,lang)=>contextLayerArt(i,p,lang)}))};

export const agentFailureModesLesson={...base,
 id:'agent-failure-modes',code:'2.2',courseId:'agent-collaboration',
 title:'常见失败模式',titleEn:'Common failure modes',
 sceneTitle:'常见失败模式',sceneTitleEn:'Common failure modes',
 audioManifest:courseAudio['agent-failure-modes'],
 steps:[
  {title:'过度自信的总结',en:'Overconfident summaries',seconds:18,
   script:['智能体说“已经全部完成”时，那是一个主张，不是证据。','总结可能漏掉失败的检查，或把部分完成说成完成。','先读差异和检查输出，再决定是否相信。'],
   enScript:['When an agent says everything is done, that is a claim, not evidence.','A summary may omit failing checks or describe partial work as complete.','Read the diff and check output before deciding to trust it.'],
   notes:['总结和差异一起看。','让智能体列出运行过的检查。'],
   enNotes:['Read summaries together with diffs.','Ask which checks were actually run.'],
   conceptZh:'主张与证据',conceptEn:'Claim and evidence',conceptNoteZh:'差异才是证据',conceptNoteEn:'The diff is the evidence'},
  {title:'忽略边界',en:'Edges ignored',seconds:19,
   script:['常见情况是只测了正常输入，就宣布功能可用。','空数据、重复提交、超量输入往往没有处理。','把边界写进任务要求，智能体才不会漏掉。'],
   enScript:['A common pattern is testing only normal input and declaring the feature ready.','Empty data, duplicates and large input often go unhandled.','Write edges into the brief so they are not skipped.'],
   notes:['要求列出边界用例。','审查时专门看异常路径。'],
   enNotes:['Ask for edge cases explicitly.','Review the failure paths.'],
   conceptZh:'边界遗漏',conceptEn:'Missing edges',conceptNoteZh:'只测了主路径',conceptNoteEn:'Happy path only'},
  {title:'越权操作',en:'Actions beyond permission',seconds:19,
   script:['智能体可能顺手改动配置、删除数据或执行部署。','这些动作影响范围大，事后很难恢复。','在任务里写清可做与不可做，越权动作先停下来问。'],
   enScript:['An agent may casually change config, delete data or run a deployment.','Such actions have wide impact and are hard to undo.','State what is allowed and forbidden, and stop to ask before privileged actions.'],
   notes:['敏感操作需要人工确认。','权限边界要写在长期约定里。'],
   enNotes:['Sensitive actions need human confirmation.','Put permission boundaries in conventions.'],
   conceptZh:'权限边界',conceptEn:'Permission boundary',conceptNoteZh:'敏感动作先问',conceptNoteEn:'Ask before sensitive actions'},
  {title:'循环停滞',en:'Stalled loops',seconds:19,
   script:['有时智能体会反复尝试同一种方法，却没有新信息。','重复不等于进展，时间却在流失。','识别停滞的信号：同样的报错、同样的改动、同样的解释。'],
   enScript:['Sometimes an agent repeats the same approach without new information.','Repetition is not progress, yet time keeps passing.','Signs of a stalled loop: the same error, the same edit, the same explanation.'],
   notes:['停滞时先总结已知。','换一个假设或缩小问题。'],
   enNotes:['Summarise what is known when stuck.','Change the hypothesis or narrow the problem.'],
   conceptZh:'停滞信号',conceptEn:'Stall signals',conceptNoteZh:'重复而没有新信息',conceptNoteEn:'Repetition without new information'},
 ].map((s,i)=>({...s,art:(p,lang)=>failureModesArt(i,p,lang)}))};
