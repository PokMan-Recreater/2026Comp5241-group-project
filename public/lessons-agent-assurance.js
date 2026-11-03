import courseAudio from './course-audio-manifest.js';
import {kit,frame} from './lesson-art-kit.js';

function verifyOutputArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.bot(120,126)}${k.speech(152,42,260,'改好了，测试也过了','It works and tests pass','#fff4d4')}
  ${k.group(.26,k.doc(444,58,'#fffefb',120,96))}${k.text(504,174,'检查输出','Check output',10,'#665e72','middle')}
  ${k.group(.46,k.path('M402 118H436'))}
  ${k.group(.62,k.lens(596,106))}${k.text(596,152,'你自己看','You verify',10,'#34734b','middle')}
  ${k.group(.8,k.ok(596,204))}
  ${k.text(360,292,'验证不是把智能体的话再问一遍','Verification is not re-asking the agent',13,'#665e72','middle')}
  ${k.text(360,324,'要用独立证据确认','Confirm with independent evidence',11,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'用可运行的检查验证','Verify with runnable checks',14,'#242032','middle')}
  ${k.box(46,72,152,170,'#f3eef9')}${k.gear(122,126)}${k.text(122,190,'运行测试','Run tests',11,'#4a3a82','middle')}${k.text(122,214,'全部通过？','All green?',9,'#665e72','middle')}
  ${k.path('M202 152H254')}
  ${k.group(.24,k.box(266,72,152,170,'#fff4d4')+k.warn(342,128)+k.text(342,190,'看看构建','Check build',11,'#8a6a25','middle')+k.text(342,214,'产物能生成？','Output built?',9,'#665e72','middle'))}
  ${k.path('M422 152H474')}
  ${k.group(.48,k.box(486,72,152,170,'#e7f2e7')+k.ok(562,128)+k.text(562,190,'手动走一遍','Walk through',11,'#34734b','middle')+k.text(562,214,'关键路径能用？','Key path works?',9,'#5c7a63','middle'))}
  ${k.group(.7,k.clock(200,278)+k.text(224,282,'每次都跑同一组检查','Same checks every time',11,'#66502a'))}
  ${k.text(360,320,'能重复的检查，才算验证','A check you can repeat is what verifies work',12,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.box(48,64,300,196,'#fffefb')}
  ${k.text(70,92,'实际输出','Actual output',13)}
  ${k.group(.16,k.text(70,124,'✓ 12 个测试通过','✓ 12 tests pass',11,'#34734b'))}
  ${k.group(.32,k.text(70,156,'✗ 1 个边界测试失败','✗ 1 edge test fails',11,'#b96559'))}
  ${k.group(.48,k.text(70,188,'警告：未使用的变量','Warning: unused variable',11,'#8a6a25'))}
  ${k.group(.64,k.text(70,220,'退出码 1','Exit code 1',11,'#b96559'))}
  ${k.group(.78,k.text(70,252,'不能只读“通过”两字','Do not read just “passes”',10,'#665e72'))}
  ${k.path('M356 160H410')}
  ${k.group(.52,k.chip(422,74,260,'输出里的失败要逐条看','Read each failure','#f9e8e2'))}
  ${k.group(.68,k.chip(422,126,260,'警告也可能藏问题','Warnings can hide issues','#fff4d4'))}
  ${k.group(.84,k.chip(422,178,260,'退出码比总结可靠','Exit codes beat summaries','#e7f2e7'))}
  ${k.text(360,300,'读原始输出，而不是转述','Read the raw output, not a retelling',13,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.text(360,44,'把验证结果留下来','Keep the verification record',14,'#242032','middle')}
  ${k.box(52,72,304,178,'#e7f2e7')}
  ${k.text(74,100,'完成时记录','Record when done',12,'#34734b')}
  ${k.group(.2,k.ok(74,128)+k.text(98,133,'跑了哪些检查','Which checks ran',11,'#34734b'))}
  ${k.group(.36,k.ok(74,166)+k.text(98,171,'结果是什么','What the result was',11,'#34734b'))}
  ${k.group(.52,k.ok(74,204)+k.text(98,209,'什么时候','When it ran',11,'#34734b'))}
  ${k.text(74,242,'别人能据此复查','Others can re-check it',10,'#5c7a63')}
  ${k.path('M360 160H414')}
  ${k.box(426,72,244,178,'#fff4d4')}
  ${k.text(448,100,'没有记录','Without a record',12,'#8a6a25')}
  ${k.group(.42,k.warn(448,132)+k.text(472,137,'无法复查','Cannot re-check',11,'#8a6a25'))}
  ${k.group(.6,k.text(448,174,'“我记得跑过”','“I remember running it”',11,'#665e72'))}
  ${k.group(.78,k.text(448,214,'不能当作证据','Is not evidence',11,'#a64e44'))}
  ${k.text(360,298,'验证记录也是交付的一部分','A verification record is part of delivery',12,'#665e72','middle')}
 `;
 return frame(body,['验证智能体的产出','Verifying agent output'],lang);
}

function diffArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.box(48,64,280,190,'#fff4d4')}
  ${k.text(70,92,'总结说','Summary says',12,'#8a6a25')}
  ${k.speech(72,110,232,'只改了样式','Only styles changed','#fffefb')}
  ${k.text(70,200,'听起来没问题','Sounds fine',10,'#665e72')}
  ${k.text(70,228,'但没有细节','But no detail',10,'#665e72')}
  ${k.path('M342 158H396')}
  ${k.box(410,64,260,190,'#f3eef9')}
  ${k.text(432,92,'差异显示','The diff shows',12,'#4a3a82')}
  ${k.group(.38,k.text(432,124,'样式文件 12 行','Style file, 12 lines',10,'#665e72'))}
  ${k.group(.54,k.text(432,152,'逻辑文件 64 行','Logic file, 64 lines',10,'#a64e44'))}
  ${k.group(.7,k.text(432,180,'配置 3 行','Config, 3 lines',10,'#a64e44'))}
  ${k.group(.84,k.chip(472,206,178,'总结漏掉了','The summary missed these','#f9e8e2'))}
  ${k.text(360,300,'总结是二手信息，差异是一手证据','A summary is second-hand; a diff is primary',13,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'先看改动范围','Check the scope first',14,'#242032','middle')}
  ${k.box(52,74,240,168,'#e7f2e7')}
  ${k.text(74,102,'计划内','In plan',12,'#34734b')}
  ${k.group(.22,k.ok(76,130)+k.text(100,135,'搜索结果组件','Search component',11,'#34734b'))}
  ${k.group(.4,k.ok(76,166)+k.text(100,171,'对应的测试','Its test',11,'#34734b'))}
  ${k.group(.58,k.ok(76,202)+k.text(100,207,'样式文件','Style file',11,'#34734b'))}
  ${k.path('M304 158H358')}
  ${k.box(372,74,296,168,'#f9e8e2')}
  ${k.text(394,102,'计划外','Out of plan',12,'#a64e44')}
  ${k.group(.46,k.no(394,130,'#b96559')+k.text(418,135,'认证模块','Auth module',11,'#b96559'))}
  ${k.group(.62,k.no(394,166,'#b96559')+k.text(418,171,'部署脚本','Deploy script',11,'#b96559'))}
  ${k.group(.78,k.no(394,202,'#b96559')+k.text(418,207,'环境配置','Environment config',11,'#b96559'))}
  ${k.text(360,296,'计划外的改动要单独问清楚','Ask about every out-of-plan change',12,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.text(360,44,'重点看被删掉的内容','Watch what was removed',14,'#242032','middle')}
  ${k.box(48,74,600,150,'#fffefb')}
  ${[0,1,2,3].map(i=>`<rect x="66" y="${96+i*26}" width="${250+i*22}" height="12" rx="4" fill="#e7f2e7"/>`).join('')}
  ${k.group(.16,`<rect x="66" y="122" width="200" height="12" rx="4" fill="#e6b4ab"/>`)}
  ${k.group(.34,`<rect x="66" y="148" width="270" height="12" rx="4" fill="#e6b4ab"/>`)}
  ${k.group(.52,k.no(548,114,'#b96559'))}
  ${k.group(.68,k.warn(548,178)+k.text(520,224,'删掉的不一定是多余的','Removed code is not always redundant',10,'#8a6a25','middle'))}
  ${k.group(.84,k.clock(360,258)+k.text(384,262,'对比前后行为','Compare behaviour before and after',11,'#66502a'))}
  ${k.text(360,310,'删除也会改变行为','Deletion changes behaviour too',13,'#665e72','middle')}
  ${k.text(360,336,'问清为什么删','Ask why it was removed',10,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.text(360,44,'对可疑之处追问','Ask about what looks odd',14,'#242032','middle')}
  ${k.face(100,96,'#bad7c2')}${k.text(100,186,'你','You',11,'#665e72','middle')}
  ${k.bot(340,128)}${k.text(340,196,'智能体','Agent',11,'#665e72','middle')}
  ${k.group(.24,k.speech(150,52,330,'这行为什么要改？','Why change this line?','#fff4d4'))}
  ${k.group(.5,k.speech(360,214,300,'因为依赖已经废弃','Because the dependency is deprecated','#e7f2e7'))}
  ${k.group(.7,k.ok(650,256))}${k.text(650,300,'有依据才接受','Accept with evidence',10,'#34734b','middle')}
  ${k.group(.84,k.warn(620,86)+k.text(620,130,'答不上就停','Stop if it cannot explain',10,'#8a6a25','middle'))}
  ${k.text(360,312,'追问是审查的一部分','Questioning is part of review',12,'#665e72','middle')}
 `;
 return frame(body,['读差异，而不是读总结','Read the diff, not the summary'],lang);
}

function securityArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.lock(360,86)}${k.text(360,132,'权限边界','Permission boundary',13,'#8a6a25','middle')}
  ${k.box(42,160,200,92,'#e7f2e7')}${k.ok(70,190)}${k.text(96,195,'读取代码','Read code',11,'#34734b')}${k.text(96,220,'运行测试','Run tests',11,'#34734b')}
  ${k.box(260,160,200,92,'#fff4d4')}${k.warn(288,190)}${k.text(314,195,'修改文件','Edit files',11,'#8a6a25')}${k.text(314,220,'需要确认','Needs approval',11,'#8a6a25')}
  ${k.box(478,160,200,92,'#f9e8e2')}${k.no(506,190,'#b96559')}${k.text(532,195,'部署与删除','Deploy, delete',11,'#b96559')}${k.text(532,220,'默认禁止','Off by default',11,'#b96559')}
  ${k.text(360,296,'权限按动作划分，不按人划分','Permissions follow actions, not people',13,'#665e72','middle')}
  ${k.text(360,324,'写下来，才不会临时妥协','Write them down to avoid improvised compromises',11,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'最小权限原则','Least privilege',14,'#242032','middle')}
  ${k.box(60,76,180,166,'#f9e8e2')}
  ${k.text(150,104,'给全部权限','Grant everything',11,'#a64e44','middle')}
  ${k.lock(150,154)}${k.text(150,206,'范围过大','Too broad',10,'#a64e44','middle')}
  ${k.group(.5,k.warn(150,224,'#b58a1f'))}
  ${k.path('M254 158H306')}
  ${k.box(320,76,180,166,'#fff4d4')}
  ${k.text(410,104,'只给需要','Only what is needed',11,'#8a6a25','middle')}
  ${k.doc(390,128,'#fffefb',40,54)}${k.text(410,206,'当前目录','Current folder',10,'#8a6a25','middle')}
  ${k.group(.6,k.clock(410,224))}
  ${k.path('M514 158H566')}
  ${k.box(580,76,104,166,'#e7f2e7')}
  ${k.text(632,104,'更小','Smaller',11,'#34734b','middle')}
  ${k.ok(632,158)}${k.text(632,206,'更安全','Safer',10,'#34734b','middle')}
  ${k.group(.8,k.text(360,282,'权限越大，误操作代价越高','Broader access raises the cost of mistakes',11,'#665e72','middle'))}
  ${k.text(360,318,'按任务临时授权','Authorise per task',12,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.text(360,44,'敏感数据不进上下文','Keep secrets out of context',14,'#242032','middle')}
  ${k.box(50,74,300,180,'#fffefb')}
  ${k.text(72,102,'可以给','Safe to include',12,'#34734b')}
  ${k.group(.2,k.ok(72,130)+k.text(96,135,'示例数据','Sample data',11,'#34734b'))}
  ${k.group(.36,k.ok(72,166)+k.text(96,171,'公开文档','Public docs',11,'#34734b'))}
  ${k.group(.52,k.ok(72,202)+k.text(96,207,'脱敏日志','Redacted logs',11,'#34734b'))}
  ${k.path('M356 160H410')}
  ${k.box(422,74,248,180,'#f9e8e2')}
  ${k.text(444,102,'不能给','Never include',12,'#a64e44')}
  ${k.group(.46,k.no(444,130,'#b96559')+k.text(468,135,'密码与密钥','Passwords and keys',11,'#b96559'))}
  ${k.group(.62,k.no(444,166,'#b96559')+k.text(468,171,'真实用户数据','Real user data',11,'#b96559'))}
  ${k.group(.78,k.no(444,202,'#b96559')+k.text(468,207,'内部地址','Internal addresses',11,'#b96559'))}
  ${k.text(360,292,'上下文会被记录和传输','Context gets logged and transmitted',12,'#665e72','middle')}
  ${k.text(360,320,'先用脱敏样例代替真实数据','Replace real data with redacted samples',11,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.text(360,44,'敏感操作要人工确认','Sensitive actions need human approval',14,'#242032','middle')}
  ${k.bot(112,126)}${k.text(112,196,'提出操作','Proposes action',10,'#665e72','middle')}
  ${k.path('M160 128H224')}
  ${k.warn(272,104)}${k.text(272,162,'高风险动作','High-risk action',10,'#8a6a25','middle')}
  ${k.path('M322 128H386')}
  ${k.face(430,96,'#e9c58b')}${k.text(430,182,'你确认','You approve',11,'#665e72','middle')}
  ${k.path('M478 128H548')}
  ${k.group(.64,k.lock(590,124))}${k.text(590,190,'执行','Execute',10,'#8a6a25','middle')}
  ${k.group(.82,k.ok(590,224))}
  ${k.text(360,290,'确认前要看到影响范围','See the blast radius before approving',12,'#665e72','middle')}
  ${k.text(360,320,'能回退吗？影响谁？','Can it be undone? Who is affected?',11,'#665e72','middle')}
 `;
 return frame(body,['权限与安全边界','Permission and security boundaries'],lang);
}

function costArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.text(360,42,'成本也是约束','Cost is a constraint too',14,'#242032','middle')}
  ${k.box(48,68,300,190,'#f9e8e2')}
  ${k.text(70,96,'无限制使用','Unbounded use',12,'#a64e44')}
  ${k.clock(96,142)}${k.text(148,138,'调用越多','More calls',11,'#a64e44')}${k.text(148,160,'上下文越长','Longer context',11,'#a64e44')}
  ${k.group(.36,k.text(70,202,'费用快速上升','Spend rises quickly',10,'#665e72'))}
  ${k.group(.5,k.warn(70,222,'#b58a1f'))}
  ${k.path('M356 158H410')}
  ${k.box(424,68,246,190,'#e7f2e7')}
  ${k.text(446,96,'有预算使用','Stay within budget',12,'#34734b')}
  ${k.group(.56,k.ok(446,126)+k.text(470,131,'按任务限额','Limit per task',11,'#34734b'))}
  ${k.group(.72,k.ok(446,164)+k.text(470,169,'定期看用量','Review usage',11,'#34734b'))}
  ${k.group(.88,k.ok(446,202)+k.text(470,207,'超出就停','Stop on overrun',11,'#34734b'))}
  ${k.text(360,294,'成本约束让使用可持续','Cost limits keep usage sustainable',12,'#665e72','middle')}
  ${k.text(360,322,'先算预算，再谈规模','Budget first, scale second',11,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'控制上下文大小','Control context size',14,'#242032','middle')}
  ${k.box(50,74,280,176,'#fffefb')}
  ${k.text(72,102,'短上下文','Short context',12,'#34734b')}
  ${[0,1,2].map(i=>`<rect x="74" y="${122+i*28}" width="${180-i*18}" height="13" rx="5" fill="#c9e3d1"/>`).join('')}
  ${k.text(72,228,'只放相关片段','Only relevant excerpts',10,'#665e72')}
  ${k.path('M336 160H386')}
  ${k.box(400,74,270,176,'#f9e8e2')}
  ${k.text(422,102,'长上下文','Long context',12,'#a64e44')}
  ${[0,1,2,3,4,5].map(i=>`<rect x="424" y="${118+i*22}" width="${220-i*10}" height="11" rx="4" fill="#e6b4ab"/>`).join('')}
  ${k.text(422,244,'费用与噪声一起增加','Cost and noise rise together',10,'#665e72')}
  ${k.group(.7,k.chip(220,264,280,'剪掉无关历史','Trim irrelevant history','#e7f2e7'))}
  ${k.text(360,322,'更少的信息，可能更准','Less information can be more accurate',12,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.text(360,44,'尊重速率限制','Respect rate limits',14,'#242032','middle')}
  <path d="M70 240H650" stroke="#a49ab8" stroke-width="3"/>
  <path d="M70 120H650" stroke="#b96559" stroke-width="2" stroke-dasharray="7 6"/>
  ${k.text(566,108,'接口上限','Rate limit',10,'#a64e44','middle')}
  <path d="M100 220L150 196L200 204L250 164L300 176L350 148L400 156L450 136L500 228L550 196L600 208" fill="none" stroke="#7967ac" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  ${k.group(.4,k.ok(320,214)+k.text(344,219,'正常节奏','Normal pace',11,'#34734b'))}
  ${k.group(.62,k.warn(500,176)+k.text(524,181,'短时间超限','Burst over limit',11,'#8a6a25'))}
  ${k.group(.8,k.clock(180,272)+k.text(204,276,'超限就退避重试','Back off and retry',11,'#66502a'))}
  ${k.text(360,320,'把限制当成设计条件','Treat limits as design constraints',12,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.box(48,64,300,190,'#f3eef9')}
  ${k.text(70,92,'预算与告警','Budget and alerts',13,'#4a3a82')}
  ${k.group(.16,k.text(70,124,'本周预算 100 次调用','Budget: 100 calls this week',11))}
  ${k.group(.32,k.text(70,156,'已用 62 次','62 used',11,'#4a3a82'))}
  ${k.group(.48,`<rect x="70" y="174" width="250" height="14" rx="7" fill="#e3dcef"/><rect x="70" y="174" width="155" height="14" rx="7" fill="#7967ac"/>`)}
  ${k.group(.64,k.warn(70,204,'#b58a1f')+k.text(94,209,'接近阈值就提醒','Alert near the threshold',11,'#8a6a25'))}
  ${k.text(70,242,'用量要看得见','Usage must be visible',10,'#665e72')}
  ${k.path('M356 160H410')}
  ${k.box(424,64,246,190,'#e7f2e7')}
  ${k.text(446,92,'超预算怎么办','When over budget',12,'#34734b')}
  ${k.group(.4,k.ok(446,124)+k.text(470,129,'先停自动化','Pause automation',11,'#34734b'))}
  ${k.group(.56,k.ok(446,162)+k.text(470,167,'缩小任务','Shrink the task',11,'#34734b'))}
  ${k.group(.72,k.ok(446,200)+k.text(470,205,'向人确认','Ask a person',11,'#34734b'))}
  ${k.text(360,294,'预算是提前约定，不是事后解释','A budget is agreed up front',12,'#665e72','middle')}
  ${k.text(360,322,'告警要早于耗尽','Alert before exhaustion',11,'#665e72','middle')}
 `;
 return frame(body,['成本与速率约束','Cost and rate limits'],lang);
}

function auditArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.doc(84,54,'#fffefb',150,126)}${k.text(159,196,'一次改动','One change',11,'#665e72','middle')}
  ${k.bot(300,118)}
  ${k.path('M244 118H264')}
  ${k.group(.3,k.box(380,54,280,166,'#f3eef9')+k.text(402,82,'没有记录','No record',13,'#4a3a82')+k.text(402,112,'谁改的？','Who changed it?',11,'#665e72')+k.text(402,140,'为什么改？','Why change it?',11,'#665e72')+k.text(402,168,'什么时候？','When?',11,'#665e72')+k.text(402,196,'没人说得清','No one can say',10,'#a64e44'))}
  ${k.group(.62,k.clock(160,250)+k.text(184,254,'追溯需要记录','Tracing needs records',11,'#66502a'))}
  ${k.group(.8,k.chip(380,250,280,'记录让判断可复盘','Records make decisions reviewable','#e7f2e7'))}
  ${k.text(360,320,'没有记录，就无法解释发生的事','Without records, events cannot be explained',12,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'记录什么','What to record',14,'#242032','middle')}
  ${k.box(50,74,606,72,'#e7f2e7')}${k.ok(86,110)}${k.text(114,104,'目标与任务','Goal and task',12,'#34734b')}${k.text(114,126,'这次要解决什么','What this solves',10,'#5c7a63')}
  ${k.group(.26,k.box(50,156,606,72,'#fff4d4')+k.warn(86,192)+k.text(114,186,'改动的范围','Scope of change',12,'#8a6a25')+k.text(114,208,'动了哪些文件','Which files touched',10,'#665e72'))}
  ${k.group(.5,k.box(50,238,606,72,'#f3eef9')+k.clock(86,274)+k.text(114,268,'检查与结果','Checks and results',12,'#4a3a82')+k.text(114,290,'跑了什么、是否通过','What ran, whether green',10,'#665e72'))}
  ${k.group(.74,k.text(360,330,'记录要能回答“为什么”','Records must answer why',11,'#665e72','middle'))}
 `;
 if(step===2)body=`
  ${k.text(360,44,'谁能看见记录','Who can see the record',14,'#242032','middle')}
  ${k.doc(300,64,'#f3eef9',120,106)}${k.text(360,190,'记录','Record',11,'#4a3a82','middle')}
  ${k.face(96,74,'#bad7c2')}${k.text(96,142,'团队','Team',10,'#665e72','middle')}
  ${k.face(606,74,'#e9c58b')}${k.text(606,142,'负责人','Owner',10,'#665e72','middle')}
  ${k.face(96,246,'#c8b8e5')}${k.text(96,314,'审计','Audit',10,'#665e72','middle')}
  ${k.face(606,246,'#bad7c2')}${k.text(606,314,'后来的人','Later joiners',10,'#665e72','middle')}
  ${k.path('M140 108L292 100','#7967ac',true)}${k.path('M562 108L428 100','#7967ac',true)}
  ${k.path('M140 250L292 168','#7967ac',true)}${k.path('M562 250L428 168','#7967ac',true)}
  ${k.group(.62,k.chip(238,270,244,'可见范围要提前定','Decide visibility early','#fff4d4'))}
  ${k.text(360,336,'记录既服务协作者，也服务后来者','Records serve collaborators and successors',11,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.text(360,44,'用记录复盘','Review with records',14,'#242032','middle')}
  <circle cx="170" cy="162" r="44" fill="#f9e8e2" stroke="#292535" stroke-width="2"/>${k.text(170,158,'发生了什么','What happened',10,'#a64e44','middle')}${k.text(170,178,'记录','Record',9,'#665e72','middle')}
  <circle cx="360" cy="162" r="44" fill="#fff4d4" stroke="#292535" stroke-width="2"/>${k.text(360,158,'为什么','Why',11,'#8a6a25','middle')}${k.text(360,178,'依据','Evidence',9,'#665e72','middle')}
  <circle cx="550" cy="162" r="44" fill="#e7f2e7" stroke="#292535" stroke-width="2"/>${k.text(550,158,'下次怎么改','Next time',10,'#34734b','middle')}${k.text(550,178,'调整','Adjust',9,'#665e72','middle')}
  ${k.path('M216 162H312')}${k.path('M406 162H502')}
  ${k.group(.62,k.clock(200,254)+k.text(224,258,'定期回看','Review regularly',11,'#66502a'))}
  ${k.group(.78,k.chip(420,238,250,'记录进入下一轮决定','Records feed the next decision','#f3eef9'))}
  ${k.text(360,310,'复盘讨论证据，而不是记忆','Review discusses evidence, not memory',13,'#665e72','middle')}
  ${k.text(360,336,'记录让决定可以被追问','Records let decisions be questioned',10,'#665e72','middle')}
 `;
 return frame(body,['记录与可追溯','Records and traceability'],lang);
}

const base={section:'02 交给 AI 编码智能体',sectionEn:'02 WORKING WITH CODING AGENTS',position:'02 · 验证与治理',positionEn:'02 · Verification and governance',audio:true};

export const verifyOutputLesson={...base,
 id:'verify-output',code:'2.3',courseId:'agent-assurance',
 title:'验证智能体的产出',titleEn:'Verifying agent output',
 sceneTitle:'验证智能体的产出',sceneTitleEn:'Verifying agent output',
 audioManifest:courseAudio['verify-output'],
 steps:[
  {title:'验证不是重复问一遍',en:'Verification is not re-asking',seconds:18,
   script:['智能体说“完成并测试通过”，这仍然只是一个主张。','验证要用独立证据：原始输出、差异、实际运行结果。','只把同样的问题再问一遍，通常只会得到同样的回答。'],
   enScript:['When an agent says it is done and tested, that is still a claim.','Verification needs independent evidence: raw output, diffs and actual runs.','Asking the same question again usually returns the same answer.'],
   notes:['先看证据，再下结论。','不要用总结代替实际运行。'],
   enNotes:['Look at evidence before concluding.','Do not let a summary replace a run.'],
   conceptZh:'独立证据',conceptEn:'Independent evidence',conceptNoteZh:'原始输出与差异',conceptNoteEn:'Raw output and diffs'},
  {title:'用可运行的检查验证',en:'Verify with runnable checks',seconds:19,
   script:['最快的验证是运行检查：测试、构建、类型检查和关键路径。','同一组检查每次都跑，结果才有可比性。','能重复的检查，比人眼观察更可靠。'],
   enScript:['The fastest verification is running checks: tests, builds, type checks and key paths.','Run the same checks every time so results are comparable.','Repeatable checks are more reliable than eyeballing.'],
   notes:['关键路径至少手动走一遍。','检查失败就先停。'],
   enNotes:['Walk key paths manually at least once.','Stop when a check fails.'],
   conceptZh:'可运行检查',conceptEn:'Runnable checks',conceptNoteZh:'测试、构建、类型检查',conceptNoteEn:'Tests, build, types'},
  {title:'读原始输出',en:'Read the raw output',seconds:19,
   script:['只看“通过”两个字，可能漏掉部分失败和警告。','把原始输出读一遍，特别关注失败条数和退出码。','警告可能不阻塞，但值得知道它说明了什么。'],
   enScript:['Reading only the word “pass” may hide partial failures and warnings.','Read the raw output, especially failure counts and exit codes.','Warnings may not block, but it is worth knowing what they say.'],
   notes:['退出码比总结可靠。','失败条目逐条处理。'],
   enNotes:['Exit codes beat summaries.','Handle each failure individually.'],
   conceptZh:'原始输出',conceptEn:'Raw output',conceptNoteZh:'失败条数与退出码',conceptNoteEn:'Failures and exit codes'},
  {title:'记录验证结果',en:'Record the verification',seconds:19,
   script:['完成时记录跑了哪些检查、结果如何、什么时候跑。','记录让后来的人可以复查，而不是只相信记忆。','验证记录也是交付的一部分。'],
   enScript:['When done, record which checks ran, what they returned and when.','Records let later readers re-check instead of relying on memory.','A verification record is part of delivery.'],
   notes:['记录附上命令与输出摘要。','结果变化时要更新记录。'],
   enNotes:['Attach commands and output summaries.','Update records when results change.'],
   conceptZh:'验证记录',conceptEn:'Verification record',conceptNoteZh:'检查、结果、时间',conceptNoteEn:'Checks, results, time'},
 ].map((s,i)=>({...s,art:(p,lang)=>verifyOutputArt(i,p,lang)}))};

export const readDiffLesson={...base,
 id:'read-the-diff',code:'2.3',courseId:'agent-assurance',
 title:'读差异，而不是读总结',titleEn:'Read the diff, not the summary',
 sceneTitle:'读差异，而不是读总结',sceneTitleEn:'Read the diff, not the summary',
 audioManifest:courseAudio['read-the-diff'],
 steps:[
  {title:'总结是二手信息',en:'A summary is second-hand',seconds:18,
   script:['智能体的总结会压缩信息，也可能漏掉意外改动。','差异是一手证据，显示每一行被增加、删除或修改。','先读差异，再用总结帮助理解。'],
   enScript:['An agent’s summary compresses information and may omit unintended changes.','The diff is primary evidence, showing every line added, removed or changed.','Read the diff first, then use the summary to help interpret it.'],
   notes:['总结可以帮助理解，不能代替差异。','意外改动的文件要单独问。'],
   enNotes:['Summaries aid understanding; they do not replace the diff.','Ask about every unexpected file.'],
   conceptZh:'一手与二手',conceptEn:'Primary and second-hand',conceptNoteZh:'差异在前，总结在后',conceptNoteEn:'Diff first, summary second'},
  {title:'先看改动范围',en:'Check the scope first',seconds:19,
   script:['先确认改了哪些文件，计划内和计划外要分开看。','计划外的认证模块、部署脚本、环境配置要格外警惕。','范围不对，就停下来问，而不是继续往下读。'],
   enScript:['First confirm which files changed, separating in-plan from out-of-plan.','Be especially wary of out-of-plan auth modules, deploy scripts and environment config.','If the scope is wrong, stop and ask rather than reading on.'],
   notes:['文件名本身就能暴露问题。','配置和权限文件最需要警惕。'],
   enNotes:['Filenames alone can reveal problems.','Config and permission files deserve the most care.'],
   conceptZh:'改动范围',conceptEn:'Change scope',conceptNoteZh:'计划内 vs 计划外',conceptNoteEn:'In plan vs out of plan'},
  {title:'重点看删除',en:'Watch the deletions',seconds:19,
   script:['新增代码容易被看到，删除的内容却常常被忽略。','删除也会改变行为，甚至更隐蔽。','删除要问清楚：为什么删，删了之后谁依赖它。'],
   enScript:['Added code is easy to see; deletions are often overlooked.','Deletion also changes behaviour, sometimes more subtly.','Ask why something was removed and who depended on it.'],
   notes:['删除的依赖与配置要重点查。','对比删除前后的行为。'],
   enNotes:['Check removed dependencies and config closely.','Compare behaviour before and after.'],
   conceptZh:'删除的影响',conceptEn:'Deletion impact',conceptNoteZh:'删除同样改变行为',conceptNoteEn:'Deletion changes behaviour'},
  {title:'对可疑之处追问',en:'Ask about what looks odd',seconds:19,
   script:['看不懂的改动不要跳过，要追问依据。','“因为依赖废弃了”是可以验证的理由，“优化一下”通常不是。','答不上来时，停下比继续更安全。'],
   enScript:['Do not skip changes you cannot follow; ask for the basis.','“The dependency is deprecated” is verifiable; “just optimising” usually is not.','When no answer comes, stopping is safer than continuing.'],
   notes:['要求给出文件或文档依据。','不接受含糊解释。'],
   enNotes:['Ask for a file or doc as evidence.','Do not accept vague explanations.'],
   conceptZh:'追问依据',conceptEn:'Ask for the basis',conceptNoteZh:'可验证的理由',conceptNoteEn:'Verifiable reasons'},
 ].map((s,i)=>({...s,art:(p,lang)=>diffArt(i,p,lang)}))};

export const securityBoundariesLesson={...base,
 id:'security-boundaries',code:'2.3',courseId:'agent-assurance',
 title:'权限与安全边界',titleEn:'Permission and security boundaries',
 sceneTitle:'权限与安全边界',sceneTitleEn:'Permission and security boundaries',
 audioManifest:courseAudio['security-boundaries'],
 steps:[
  {title:'权限按动作划分',en:'Permissions follow actions',seconds:18,
   script:['读取代码、运行测试、修改文件、部署上线，风险和影响范围不同。','把动作分成可做、需确认、禁止三类，写进约定里。','分类写下来，临时决策才不会变成妥协。'],
   enScript:['Reading code, running tests, editing files and deploying carry different risks and impact.','Classify actions as allowed, needs approval or forbidden, and write it into the conventions.','Writing the classes down keeps moment-to-moment decisions from becoming compromises.'],
   notes:['禁止项要写具体。','可做项也应有范围。'],
   enNotes:['Make prohibitions specific.','Allowed actions need scope too.'],
   conceptZh:'动作分级',conceptEn:'Action classes',conceptNoteZh:'可做、需确认、禁止',conceptNoteEn:'Allowed, approval, forbidden'},
  {title:'最小权限',en:'Least privilege',seconds:19,
   script:['给全部权限最省事，但误操作的代价也最大。','只给完成任务所需的最小范围，例如当前目录、指定命令。','任务结束后收回权限，下一次重新授权。'],
   enScript:['Granting everything is easiest, but mistakes cost the most.','Grant only what the task needs, such as the current folder or named commands.','Revoke when the task ends and authorise again next time.'],
   notes:['按任务临时授权。','权限范围随任务变化。'],
   enNotes:['Authorise per task.','Let scope change with the task.'],
   conceptZh:'最小权限',conceptEn:'Least privilege',conceptNoteZh:'只给所需范围',conceptNoteEn:'Only the needed scope'},
  {title:'敏感数据不进上下文',en:'Keep secrets out of context',seconds:19,
   script:['密码、密钥、真实用户数据和内部地址不应进入上下文。','上下文会被记录、传输，也可能被日志保存。','用脱敏样例和公开文档代替真实数据。'],
   enScript:['Passwords, keys, real user data and internal addresses should not enter the context.','Context gets logged, transmitted and may be stored in logs.','Use redacted samples and public docs instead of real data.'],
   notes:['先脱敏，再给样例。','发现泄漏要立即更换密钥。'],
   enNotes:['Redact before sharing samples.','Rotate keys immediately if leaked.'],
   conceptZh:'敏感数据',conceptEn:'Sensitive data',conceptNoteZh:'密钥、真实用户数据',conceptNoteEn:'Keys and real user data'},
  {title:'敏感操作人工确认',en:'Approve sensitive actions',seconds:19,
   script:['删除数据、改动权限、部署上线，需要人看过影响范围再执行。','确认前应知道：影响谁、能否回退、失败会怎样。','能回退的操作风险更低，但仍应留下记录。'],
   enScript:['Deleting data, changing permissions and deploying need a person to review the impact first.','Before approving, know who is affected, whether it can be undone and what failure looks like.','Reversible actions are safer but still need records.'],
   notes:['确认前先看影响范围。','不可回退的操作要格外谨慎。'],
   enNotes:['Review the blast radius before approving.','Treat irreversible actions with extra care.'],
   conceptZh:'人工确认',conceptEn:'Human approval',conceptNoteZh:'影响、回退、失败',conceptNoteEn:'Impact, rollback, failure'},
 ].map((s,i)=>({...s,art:(p,lang)=>securityArt(i,p,lang)}))};

export const costLimitsLesson={...base,
 id:'cost-and-rate-limits',code:'2.3',courseId:'agent-assurance',
 title:'成本与速率约束',titleEn:'Cost and rate limits',
 sceneTitle:'成本与速率约束',sceneTitleEn:'Cost and rate limits',
 audioManifest:courseAudio['cost-and-rate-limits'],
 steps:[
  {title:'成本也是约束',en:'Cost is a constraint',seconds:18,
   script:['智能体调用越多、上下文越长，费用上升越快。','成本约束不是限制能力，而是让使用可持续。','先算预算，再决定任务规模和自动化程度。'],
   enScript:['More agent calls and longer context raise cost faster.','A cost constraint does not limit capability; it keeps usage sustainable.','Set the budget first, then decide task size and how much to automate.'],
   notes:['预算要提前约定。','成本与效果一起评估。'],
   enNotes:['Agree the budget up front.','Evaluate cost alongside results.'],
   conceptZh:'成本约束',conceptEn:'Cost constraint',conceptNoteZh:'调用次数与上下文长度',conceptNoteEn:'Calls and context length'},
  {title:'控制上下文大小',en:'Control context size',seconds:19,
   script:['长上下文既贵又有噪声，容易淹没重点。','只放相关片段，剪掉无关历史，必要时再展开。','更少的信息，有时反而更准。'],
   enScript:['Long context is both costly and noisy, easily drowning the point.','Include only relevant excerpts, trim irrelevant history and expand when needed.','Less information can sometimes be more accurate.'],
   notes:['先给最相关的文件。','定期清理过期上下文。'],
   enNotes:['Start with the most relevant files.','Clear stale context regularly.'],
   conceptZh:'上下文预算',conceptEn:'Context budget',conceptNoteZh:'少而准',conceptNoteEn:'Few and precise'},
  {title:'尊重速率限制',en:'Respect rate limits',seconds:19,
   script:['接口通常有单位时间内的调用上限。','短时间集中调用会触发限制，反而更慢。','把限制当成设计条件：退避重试、拆分任务、安排节奏。'],
   enScript:['APIs usually cap calls per unit of time.','Bursts hit the limit and end up slower.','Treat limits as design constraints: back off and retry, split tasks, pace the work.'],
   notes:['退避要带随机间隔。','批量任务要排队。'],
   enNotes:['Add jitter to backoff.','Queue batch tasks.'],
   conceptZh:'速率限制',conceptEn:'Rate limits',conceptNoteZh:'超限就退避',conceptNoteEn:'Back off on overrun'},
  {title:'预算与告警',en:'Budgets and alerts',seconds:19,
   script:['为任务或时间段设置预算，让用量看得见。','接近阈值就提醒，而不是耗尽后才发现。','超预算时先停自动化、缩小任务或向人确认。'],
   enScript:['Set budgets per task or period so usage is visible.','Alert near the threshold instead of discovering exhaustion later.','When over budget, pause automation, shrink the task or ask a person.'],
   notes:['告警要早于耗尽。','超预算处理方式提前约定。'],
   enNotes:['Alert before exhaustion.','Agree the over-budget response in advance.'],
   conceptZh:'预算告警',conceptEn:'Budget alerts',conceptNoteZh:'接近阈值就提醒',conceptNoteEn:'Alert near the threshold'},
 ].map((s,i)=>({...s,art:(p,lang)=>costArt(i,p,lang)}))};

export const auditTrailLesson={...base,
 id:'audit-trail',code:'2.3',courseId:'agent-assurance',
 title:'记录与可追溯',titleEn:'Records and traceability',
 sceneTitle:'记录与可追溯',sceneTitleEn:'Records and traceability',
 audioManifest:courseAudio['audit-trail'],
 steps:[
  {title:'为什么需要记录',en:'Why keep records',seconds:18,
   script:['当事情出问题时，团队要回答谁改了什么、为什么、什么时候。','没有记录，这些只能靠记忆，而记忆并不可靠。','记录让判断可以复盘，也让责任更清楚。'],
   enScript:['When something goes wrong, the team must answer who changed what, why and when.','Without records this depends on memory, which is unreliable.','Records make decisions reviewable and responsibility clearer.'],
   notes:['记录不只是为了追责。','记录服务复盘与交接。'],
   enNotes:['Records are not only for blame.','They serve review and handoff.'],
   conceptZh:'可追溯',conceptEn:'Traceability',conceptNoteZh:'谁、什么、为什么、何时',conceptNoteEn:'Who, what, why, when'},
  {title:'记录什么',en:'What to record',seconds:19,
   script:['至少记录目标、改动范围、检查结果和关键决定。','记录要能回答“为什么”，而不只是“做了什么”。','重要决定附上依据，后来的人才能理解取舍。'],
   enScript:['Record at least the goal, the scope of change, check results and key decisions.','Records must answer why, not just what.','Attach the basis for important decisions so later readers understand the trade-off.'],
   notes:['记录要简短但完整。','关键决定附上文件或数据依据。'],
   enNotes:['Keep records short but complete.','Attach file or data evidence for key decisions.'],
   conceptZh:'记录内容',conceptEn:'Record content',conceptNoteZh:'目标、范围、检查、决定',conceptNoteEn:'Goal, scope, checks, decisions'},
  {title:'谁能看见记录',en:'Who can see the record',seconds:19,
   script:['记录的可见范围要提前约定，避免敏感信息扩散。','团队、负责人和审计者通常需要不同权限。','可见范围清楚，记录才既能协作又不失控。'],
   enScript:['Decide the visibility of records in advance to avoid spreading sensitive information.','Teams, owners and auditors usually need different access.','Clear visibility lets records support collaboration without losing control.'],
   notes:['记录分类，分级可见。','敏感内容先脱敏。'],
   enNotes:['Classify records by visibility.','Redact sensitive content first.'],
   conceptZh:'记录可见性',conceptEn:'Record visibility',conceptNoteZh:'按角色分级',conceptNoteEn:'Classified by role'},
  {title:'用记录复盘',en:'Review with records',seconds:19,
   script:['复盘时对着记录讨论：发生了什么、为什么、下次怎么改。','讨论证据而不是记忆，能减少争论。','复盘结论进入下一轮决定，记录才算真正有用。'],
   enScript:['In a review, discuss the record: what happened, why, and what to change next time.','Discussing evidence instead of memory reduces argument.','Records only prove useful when their conclusions feed the next decision.'],
   notes:['复盘聚焦假设与证据。','结论要写成可执行的调整。'],
   enNotes:['Focus on assumptions and evidence.','Turn conclusions into executable adjustments.'],
   conceptZh:'记录复盘',conceptEn:'Review with records',conceptNoteZh:'讨论证据，不靠记忆',conceptNoteEn:'Evidence over memory'},
 ].map((s,i)=>({...s,art:(p,lang)=>auditArt(i,p,lang)}))};
