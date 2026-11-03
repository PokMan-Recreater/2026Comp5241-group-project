import courseAudio from './course-audio-manifest.js';
import {kit,frame} from './lesson-art-kit.js';

function testsAsEvidenceArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.bot(124,128)}${k.speech(156,50,182,'已经完成了！','All done!')}
  ${k.group(.24,k.warn(356,108)+k.text(380,113,'谁说的？','Says who?',11,'#8a6a25'))}
  ${k.group(.44,k.doc(470,58,'#fffefb',92,106))}${k.text(516,182,'一份运行记录','A run log',11,'#665e72','middle')}
  ${k.group(.66,k.ok(612,188)+k.text(636,193,'可重复','Repeatable',11,'#34734b'))}
  ${k.text(360,292,'“完成”是声明，测试是证据','“Done” is a claim; a test is evidence',14,'#242032','middle')}
  ${k.text(360,326,'先问：哪条检查能被重复？','Ask: which check can be repeated?',12,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.doc(52,86,'#f3eef9',82,96)}${k.text(93,204,'输入','Input',11,'#665e72','middle')}
  ${k.path('M146 132H214')}
  ${k.group(.22,k.gear(258,132))}${k.text(258,196,'执行','Run',11,'#7967ac','middle')}
  ${k.path('M290 132H356')}
  ${k.group(.44,k.box(374,86,140,92,'#fffefb'))}${k.text(444,124,'期望结果','Expected result',12,'#242032','middle')}${k.text(444,152,'相同输入 → 相同输出','Same input, same output',10,'#665e72','middle')}
  ${k.path('M526 132H592')}
  ${k.group(.66,k.ok(620,132))}
  ${k.group(.8,k.clock(560,246)+k.text(584,250,'每次都能重跑','Rerun every time',11,'#66502a'))}
  ${k.text(360,316,'条件、动作、期望结果，缺一不可','Condition, action and expected result',13,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.doc(46,74,'#fff4d4',150,118)}${k.text(121,214,'需求：空列表要有说明','Need: empty list explained',10,'#8a6a25','middle')}
  ${k.path('M208 132H300')}
  ${k.box(314,58,344,150,'#fffefb')}
  ${k.text(334,88,'测试用例','Test cases',13)}
  ${k.group(.24,k.ok(346,120)+k.text(370,125,'空数据 → 显示说明','Empty data → note shown',11,'#34734b'))}
  ${k.group(.38,k.ok(346,158)+k.text(370,163,'正常数据 → 显示列表','Normal data → list shown',11,'#34734b'))}
  ${k.group(.52,k.ok(346,196)+k.text(370,201,'重复提交 → 只存一次','Duplicate submit → saved once',11,'#34734b'))}
  ${k.group(.72,k.doc(560,230,'#e7f2e7',86,76)+k.text(603,322,'一条需求，多条检查','One need, several checks',10,'#34734b','middle'))}
  ${k.text(360,332,'测试是需求的另一种写法','A test is another way to write the requirement',12,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.box(44,58,372,190,'#f9e8e2')}
  ${k.text(64,88,'失败输出','Failing output',13,'#a64e44')}
  ${k.group(.2,k.no(76,128,'#b96559')+k.text(100,133,'断言失败：列表为空','Assertion failed: empty list',11,'#a64e44'))}
  ${k.group(.4,k.text(64,170,'期望 3 条，实际 0 条','Expected 3, got 0',11,'#665e72'))}
  ${k.group(.56,k.text(64,200,'错误码 500','Error 500',11,'#665e72'))}
  ${k.group(.3,k.doc(470,58,'#fffefb',150,110))}
  ${k.text(545,190,'复现步骤','Steps to reproduce',11,'#665e72','middle')}
  ${k.group(.62,k.clock(496,236)+k.text(520,240,'发生在哪个时间点','When it happened',11,'#66502a'))}
  ${k.group(.8,k.lens(620,238)+k.text(596,280,'日志与截图','Logs and screenshots',11,'#7967ac','middle'))}
  ${k.text(360,326,'失败信息也要能被别人复现','A failure must be reproducible by someone else',13,'#665e72','middle')}
 `;
 return frame(body,['测试是交付的证据','Tests are delivery evidence'],lang);
}

function unitIntegrationArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.box(40,60,290,200,'#e7f2e7')}
  ${k.text(62,92,'单元测试','Unit test',14,'#34734b')}
  ${k.gear(150,158)}${k.text(150,222,'一个函数','One function',11,'#34734b','middle')}
  ${k.text(62,238,'范围小、速度快','Small scope, fast',11,'#5c7a63')}
  ${k.path('M340 152H382')}
  ${k.box(392,60,288,200,'#f3eef9')}
  ${k.text(414,92,'集成测试','Integration test',14,'#4a3a82')}
  ${k.phone(430,128,.7)}${k.arrowHead(510,162)}${k.db(566,158)}
  ${k.text(520,222,'界面 + 服务 + 存储','UI, service, storage',11,'#4a3a82','middle')}
  ${k.text(414,238,'范围大、更接近真实','Wider and closer to reality',11,'#5e5470')}
  ${k.text(360,310,'两种尺度回答不同的问题','Two scopes answer different questions',13,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.box(72,66,240,180,'#e7f2e7')}
  ${k.text(192,96,'一个单元','One unit',13,'#34734b','middle')}
  ${k.group(.2,k.gear(140,160))}${k.text(140,222,'纯逻辑','Pure logic',10,'#5c7a63','middle')}
  ${k.group(.36,k.ok(230,160))}${k.text(230,222,'快速反馈','Fast feedback',10,'#34734b','middle')}
  ${k.group(.5,k.clock(392,126)+k.text(416,130,'毫秒级','Milliseconds',11,'#66502a'))}
  ${k.group(.64,k.box(352,176,250,66,'#fffefb'))}${k.text(477,204,'改一行，跑一次','Edit one line, run once',12,'#242032','middle')}${k.text(477,226,'错误位置更明确','Points to the fault',10,'#665e72','middle')}
  ${k.group(.8,k.chip(470,58,180,'数量可以很多','Run them in bulk','#f3eef9'))}
  ${k.text(360,312,'越小的范围，越容易定位问题','A smaller scope localises faults',13,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.phone(58,86,.9)}${k.text(87,208,'界面','Interface',11,'#665e72','middle')}
  ${k.path('M132 132H196')}
  ${k.group(.24,k.box(210,92,130,82,'#f3eef9'))}${k.text(275,126,'服务','Service',13,'#242032','middle')}${k.text(275,150,'规则与接口','Rules and API',10,'#665e72','middle')}
  ${k.path('M356 132H420')}
  ${k.group(.46,k.db(470,126))}${k.text(470,196,'存储','Storage',11,'#665e72','middle')}
  ${k.path('M502 132H560')}
  ${k.group(.64,k.ok(590,132))}
  ${k.group(.78,k.warn(520,232,'#b58a1f')+k.text(544,237,'一次要启动多层','Starts several layers',11,'#8a6a25'))}
  ${k.text(360,310,'集成测试检查层与层能否配合','Integration tests check that layers work together',13,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.text(360,42,'测试金字塔','The test pyramid',14,'#242032','middle')}
  <path d="M360 62L470 168H250Z" fill="#f9e8e2" stroke="#292535" stroke-width="2"/>
  <path d="M300 176H420L470 262H250Z" fill="#fff4d4" stroke="#292535" stroke-width="2"/>
  <path d="M290 270H430L500 330H220Z" fill="#e7f2e7" stroke="#292535" stroke-width="2"/>
  ${k.text(360,112,'端到端','End to end',11,'#a64e44','middle')}
  ${k.text(360,222,'集成','Integration',11,'#8a6a25','middle')}
  ${k.text(360,306,'单元','Unit',11,'#34734b','middle')}
  ${k.text(560,112,'少而慢','Few, slow',10,'#665e72')}
  ${k.text(560,222,'适量','Some',10,'#665e72')}
  ${k.text(560,306,'多而快','Many, fast',10,'#665e72')}
  ${k.text(150,120,'越靠下，越多越快','Lower levels: more and faster',10,'#665e72','middle')}
 `;
 return frame(body,['单元与集成测试的分工','Unit and integration tests'],lang);
}

function testDataEdgesArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.phone(96,74,.95)}${k.text(125,194,'正常路径','Happy path',11,'#34734b','middle')}
  ${k.group(.2,k.ok(96,232)+k.text(120,237,'一条数据通过了','One case passes',11,'#34734b'))}
  ${k.group(.4,k.warn(330,104)+k.text(354,109,'空数据','Empty data',11,'#8a6a25'))}
  ${k.group(.52,k.warn(330,166)+k.text(354,171,'重复数据','Duplicate data',11,'#8a6a25'))}
  ${k.group(.64,k.warn(330,228)+k.text(354,233,'超长内容','Very long content',11,'#8a6a25'))}
  ${k.group(.8,k.box(520,92,150,120,'#fffefb'))}${k.text(595,130,'只测一种输入','One input only',12,'#242032','middle')}${k.text(595,158,'不能说明可靠','Does not prove safety',10,'#665e72','middle')}
  ${k.text(360,320,'正常数据只覆盖一半','Normal data covers only half the picture',13,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'特殊输入清单','Special inputs',14,'#242032','middle')}
  ${k.box(56,70,606,64,'#f9e8e2')}${k.no(92,102,'#b96559')}${k.text(120,98,'空列表 / 空字符串 / 缺失字段','Empty list, empty string, missing field',12,'#a64e44')}${k.text(120,118,'系统能否给出清楚的说明？','Does it explain clearly?',10,'#665e72')}
  ${k.group(.26,k.box(56,146,606,64,'#fff4d4')+k.no(92,178,'#b58a1f')+k.text(120,174,'同一请求重复两次','Same request sent twice',12,'#8a6a25')+k.text(120,194,'会不会保存两份？','Does it save twice?',10,'#665e72'))}
  ${k.group(.5,k.box(56,222,606,64,'#f3eef9')+k.warn(92,254)+k.text(120,250,'一次一万条数据','Ten thousand rows at once',12,'#4a3a82')+k.text(120,270,'会不会超时或崩溃？','Timeout or crash?',10,'#665e72'))}
  ${k.group(.76,k.box(56,298,606,42,'#e7f2e7')+k.ok(92,319)+k.text(120,324,'把边界写进验收条件','Put edges into acceptance criteria',12,'#34734b'))}
 `;
 if(step===2)body=`
  ${k.text(360,48,'边界值','Boundary values',14,'#242032','middle')}
  <path d="M70 168H650" stroke="#a49ab8" stroke-width="3" stroke-linecap="round"/>
  ${[90,250,410,570].map(x=>`<circle cx="${x}" cy="168" r="7" fill="#fffefb" stroke="#7967ac" stroke-width="3"/>`).join('')}
  ${k.text(90,208,'0','0',12,'#242032','middle')}${k.text(250,208,'1','1',12,'#242032','middle')}${k.text(410,208,'上限','Max',12,'#242032','middle')}${k.text(570,208,'上限+1','Max + 1',12,'#a64e44','middle')}
  ${k.group(.3,k.text(90,240,'空','Empty',10,'#665e72','middle'))}
  ${k.group(.46,k.text(250,240,'最小有效','Smallest valid',10,'#665e72','middle'))}
  ${k.group(.62,k.text(410,240,'刚好允许','Exactly allowed',10,'#665e72','middle'))}
  ${k.group(.78,k.text(570,240,'应该拒绝','Should reject',10,'#a64e44','middle'))}
  ${k.group(.86,k.ok(410,110)+k.text(434,115,'边界两侧都要测','Test both sides of an edge',11,'#34734b'))}
  ${k.text(360,312,'错误通常藏在边界上','Errors usually hide at the edges',13,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.box(60,66,270,190,'#fffefb')}
  ${k.text(82,96,'固定测试数据','Fixed fixtures',13)}
  ${k.group(.2,k.doc(96,116,'#f3eef9',80,92)+k.text(136,228,'一组预置数据','A preset data set',10,'#665e72','middle'))}
  ${k.group(.4,k.text(82,254,'每次都从同一状态开始','Start from the same state',11,'#665e72'))}
  ${k.path('M344 160H404')}
  ${k.group(.56,k.gear(444,160))}
  ${k.text(444,224,'重置','Reset',11,'#7967ac','middle')}
  ${k.group(.72,k.ok(560,160))}
  ${k.text(560,206,'结果可比较','Results comparable',11,'#34734b','middle')}
  ${k.text(360,314,'数据一变，测试就失去可比性','Change the data and comparisons stop meaning anything',12,'#665e72','middle')}
 `;
 return frame(body,['测试数据与边界情况','Test data and edge cases'],lang);
}

function releaseChecklistArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.doc(64,52,'#fffefb',150,150)}${k.text(139,224,'发布清单','Release checklist',12,'#242032','middle')}
  ${k.box(256,52,404,214,'#fffefb')}
  ${k.text(276,82,'发布之前逐项确认','Confirm each item before release',13)}
  ${k.group(.18,k.ok(292,112)+k.text(316,117,'检查全部通过','All checks pass',11,'#34734b'))}
  ${k.group(.33,k.ok(292,148)+k.text(316,153,'数据已备份','Data backed up',11,'#34734b'))}
  ${k.group(.48,k.ok(292,184)+k.text(316,189,'回退步骤可执行','Rollback ready',11,'#34734b'))}
  ${k.group(.63,k.ok(292,220)+k.text(316,225,'通知了相关人员','People informed',11,'#34734b'))}
  ${k.group(.78,k.clock(568,132)+k.text(568,168,'每次发布都跑','Every release',10,'#66502a','middle'))}
  ${k.text(360,314,'清单把记忆变成流程','A checklist turns memory into process',13,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'把检查项写具体','Make each item concrete',14,'#242032','middle')}
  ${k.box(52,76,270,150,'#f9e8e2')}${k.text(72,106,'模糊','Vague',12,'#a64e44')}${k.no(90,146,'#b96559')}${k.text(116,150,'“测试过了”','“Tests passed”',12,'#a64e44')}${k.text(72,196,'谁测的？测了什么？','Who ran what?',10,'#665e72')}
  ${k.path('M334 150H392')}
  ${k.box(404,76,264,150,'#e7f2e7')}${k.text(424,106,'可执行','Executable',12,'#34734b')}${k.ok(442,146)}${k.text(468,150,'“npm test 全部通过”','“npm test is green”',11,'#34734b')}${k.text(424,196,'命令 + 结果 + 时间','Command, result, time',10,'#665e72')}
  ${k.group(.73,k.chip(220,258,280,'检查项写成可重复的动作','Write checks as repeatable actions','#f3eef9'))}
  ${k.text(360,326,'别人能照着做，才叫检查项','A check is only real if someone else can run it',12,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.face(96,108,'#bad7c2')}${k.text(96,196,'提交者','Author',11,'#665e72','middle')}
  ${k.path('M140 146H204')}
  ${k.bot(250,128)}${k.text(250,196,'自动检查','Checks',11,'#665e72','middle')}
  ${k.path('M300 146H364')}
  ${k.face(416,108,'#e9c58b')}${k.text(416,196,'复核者','Reviewer',11,'#665e72','middle')}
  ${k.path('M460 146H524')}
  ${k.lock(566,142)}${k.text(566,208,'放行','Release',11,'#8a6a25','middle')}
  ${k.group(.72,k.ok(646,142))}
  ${k.group(.84,k.text(360,300,'关键动作由人按下','A person presses the final button',12,'#34734b','middle'))}
  ${k.text(360,332,'责任要跟着放行动作走','Responsibility follows the release action',11,'#665e72','middle')}
 `;
 if(step===3)body=`
  <circle cx="180" cy="120" r="42" fill="#f9e8e2" stroke="#292535" stroke-width="2"/>${k.text(180,116,'新版本','New',12,'#a64e44','middle')}${k.text(180,136,'v2.4','v2.4',10,'#665e72','middle')}
  ${k.warn(180,248)}${k.text(180,292,'出现异常','Problem found',11,'#8a6a25','middle')}
  ${k.path('M180 164v56','#b58a1f')}
  <circle cx="420" cy="120" r="42" fill="#f3eef9" stroke="#292535" stroke-width="2"/>${k.text(420,116,'旧版本','Previous',11,'#4a3a82','middle')}${k.text(420,136,'v2.3','v2.3',10,'#665e72','middle')}
  ${k.path('M222 120H376','#b58a1f')}${k.text(300,106,'回退','Roll back',10,'#8a6a25','middle')}
  ${k.group(.5,k.db(600,100))}${k.text(600,160,'备份','Backup',11,'#665e72','middle')}
  ${k.group(.68,k.ok(600,222))}${k.text(600,262,'可恢复','Restorable',11,'#34734b','middle')}
  ${k.group(.82,k.clock(420,222)+k.text(444,226,'预先演练','Rehearse first',11,'#66502a'))}
  ${k.text(360,326,'回退方案要在发布前写好','Write the rollback plan before release',13,'#665e72','middle')}
 `;
 return frame(body,['发布检查清单','The release checklist'],lang);
}

function monitorFeedbackArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.box(52,56,616,190,'#fffefb')}
  ${k.text(72,86,'上线后的仪表板','After-launch dashboard',13)}
  ${k.box(76,104,164,108,'#f9e8e2')}${k.text(158,130,'错误率','Error rate',11,'#a64e44','middle')}${k.text(158,160,'0.4%','0.4%',20,'#a64e44','middle')}${k.text(158,188,'↑ 0.1%','↑ 0.1%',10,'#665e72','middle')}
  ${k.box(258,104,164,108,'#fff4d4')}${k.text(340,130,'响应时间','Latency',11,'#8a6a25','middle')}${k.text(340,160,'820ms','820ms',20,'#8a6a25','middle')}${k.text(340,188,'接近阈值','Near limit',10,'#665e72','middle')}
  ${k.box(440,104,198,108,'#f3eef9')}${k.text(539,130,'用户反馈','User reports',11,'#4a3a82','middle')}${k.text(539,160,'12','12',20,'#4a3a82','middle')}${k.text(539,188,'本周新提交','New this week',10,'#665e72','middle')}
  ${k.group(.75,k.clock(628,286)+k.text(604,314,'持续观察','Keep watching',10,'#66502a','middle'))}
  ${k.text(360,330,'拿掉测试环境，才能看到真实信号','Leave the test environment to see real signals',13,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,46,'定义什么算异常','Define what counts as abnormal',14,'#242032','middle')}
  <path d="M60 220H660" stroke="#a49ab8" stroke-width="3"/>
  ${k.path('M60 140H660','#b96559',true,'dl-arrow-sm')}
  ${k.text(566,128,'阈值','Threshold',11,'#a64e44','middle')}
  <path d="M120 220L180 196L240 204L300 176L360 182L420 152L480 158L540 138L600 146" fill="none" stroke="#7967ac" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  ${k.group(.42,k.ok(300,214)+k.text(324,219,'正常波动','Normal range',11,'#34734b'))}
  ${k.group(.68,k.warn(480,190)+k.text(504,195,'超过阈值','Above threshold',11,'#8a6a25'))}
  ${k.group(.84,k.text(120,258,'低于阈值','Below',10,'#665e72'))+k.text(120,276,'安静','Quiet',10,'#665e72')}
  ${k.text(360,328,'没有基线，就分不清正常与异常','Without a baseline, normal and abnormal blur',12,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.face(96,86,'#bad7c2')}${k.speech(132,42,250,'我提交后没反应','Nothing happened')}
  ${k.group(.3,k.face(600,92,'#e9c58b')+k.speech(320,130,230,'加载太慢了','It loads slowly'))}
  ${k.group(.56,k.face(100,240,'#c8b8e5')+k.speech(136,196,260,'通知来得太晚','The notice came late'))}
  ${k.group(.78,k.doc(500,240,'#fff4d4',110,74)+k.text(555,336,'反馈汇总','Feedback summary',10,'#8a6a25','middle'))}
  ${k.text(360,312,'用户的话是线索，不是结论','User reports are clues, not conclusions',13,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.text(360,44,'反馈进入下一轮','Feedback enters the next round',14,'#242032','middle')}
  <circle cx="150" cy="170" r="44" fill="#f9e8e2" stroke="#292535" stroke-width="2"/>${k.text(150,166,'观察','Observe',12,'#a64e44','middle')}${k.text(150,186,'信号','Signals',10,'#665e72','middle')}
  <circle cx="360" cy="170" r="44" fill="#fff4d4" stroke="#292535" stroke-width="2"/>${k.text(360,166,'判断','Decide',12,'#8a6a25','middle')}${k.text(360,186,'取舍','Trade-off',10,'#665e72','middle')}
  <circle cx="570" cy="170" r="44" fill="#e7f2e7" stroke="#292535" stroke-width="2"/>${k.text(570,166,'调整','Adjust',12,'#34734b','middle')}${k.text(570,186,'下一版','Next',10,'#665e72','middle')}
  ${k.path('M194 170H310')}${k.path('M404 170H520')}
  ${k.path('M570 218C520 296 210 300 150 218','#7967ac',true)}
  ${k.group(.72,k.clock(360,304)+k.text(384,308,'定期回看','Review regularly',11,'#66502a'))}
  ${k.text(360,342,'闭环让每次发布都比上次更有依据','A loop makes each release better grounded',11,'#665e72','middle')}
 `;
 return frame(body,['上线后的监控与反馈','Monitoring and feedback after launch'],lang);
}

const base={section:'01 软件工程与开发基础',sectionEn:'01 SOFTWARE ENGINEERING FOUNDATIONS',position:'01 · 测试与发布',positionEn:'01 · Testing and release',audio:true};

export const testsAsEvidenceLesson={...base,
 id:'tests-as-evidence',code:'1.2',courseId:'testing-quality-release',
 title:'测试是交付的证据',titleEn:'Tests are delivery evidence',
 sceneTitle:'测试是交付的证据',sceneTitleEn:'Tests are delivery evidence',
 audioManifest:courseAudio['tests-as-evidence'],
 steps:[
  {title:'测试回答什么问题',en:'What a test answers',seconds:18,
   script:['测试不是证明程序永远能用，而是回答在什么条件下结果应该是什么。','把条件、动作和期望结果写下来，检查就能被重复。','能被别人复现的检查，才是可以拿出来的证据。'],
   enScript:['A test does not prove software always works; it answers what the result should be under certain conditions.','Write down the condition, the action and the expected result so the check can be repeated.','A check someone else can reproduce is evidence you can show.'],
   notes:['测试是一种可以重复的检查。','先写期望结果，再决定怎么测。'],
   enNotes:['A test is a repeatable check.','Write the expected result before choosing how to test.'],
   conceptZh:'可重复检查',conceptEn:'Repeatable check',conceptNoteZh:'条件、动作、期望',conceptNoteEn:'Condition, action, expectation'},
  {title:'一条可重复的检查',en:'One repeatable check',seconds:19,
   script:['一条测试至少包含输入、执行和期望结果三部分。','同样的输入每次运行都应得到同样的结论，才算可靠。','重复运行不需要人盯着，检查才能频繁发生。'],
   enScript:['A test includes at least an input, an action and an expected result.','The same input should produce the same verdict every run for the check to be reliable.','A check that runs without someone watching can happen frequently.'],
   notes:['把检查写成一条命令。','结果要能自动判断通过或失败。'],
   enNotes:['Write the check as one command.','The result must be judged pass or fail automatically.'],
   conceptZh:'输入与断言',conceptEn:'Input and assertion',conceptNoteZh:'相同输入，相同结论',conceptNoteEn:'Same input, same verdict'},
  {title:'测试跟着需求走',en:'Tests follow the requirements',seconds:19,
   script:['一条需求通常需要多条测试来覆盖不同的行为。','空列表如何显示、重复提交如何处理，都应该能找到对应的检查。','测试和需求对不上，交付时就少了一块证据。'],
   enScript:['One requirement usually needs several tests to cover different behaviours.','How an empty list appears and how duplicates are handled should each have a matching check.','When tests and requirements do not line up, delivery is missing evidence.'],
   notes:['每条验收条件至少对应一条测试。','测试名称要写出行为，而不是函数名。'],
   enNotes:['Every acceptance criterion should have at least one test.','Name tests by behaviour, not by function.'],
   conceptZh:'需求与测试对应',conceptEn:'Requirement coverage',conceptNoteZh:'一条需求，多条检查',conceptNoteEn:'One need, several checks'},
  {title:'失败也要留下证据',en:'Failures must leave evidence',seconds:19,
   script:['测试失败时，输出要写清期望什么、实际得到什么。','最好还能说明如何复现：输入、步骤和时间点。','能复现的失败，才能被修复并被验证。'],
   enScript:['When a test fails, the output must say what was expected and what actually happened.','It should also explain how to reproduce it: input, steps and timing.','A reproducible failure can be fixed and verified.'],
   notes:['失败信息先写差异，再写日志。','保留截图和日志，方便别人接手。'],
   enNotes:['Lead with the difference, then the log.','Keep screenshots and logs so someone else can take over.'],
   conceptZh:'失败证据',conceptEn:'Failure evidence',conceptNoteZh:'期望、实际、复现步骤',conceptNoteEn:'Expected, actual, reproduction'},
 ].map((s,i)=>({...s,art:(p,lang)=>testsAsEvidenceArt(i,p,lang)}))};

export const unitAndIntegrationLesson={...base,
 id:'unit-and-integration',code:'1.2',courseId:'testing-quality-release',
 title:'单元与集成测试的分工',titleEn:'Unit and integration tests',
 sceneTitle:'单元与集成测试的分工',sceneTitleEn:'Unit and integration tests',
 audioManifest:courseAudio['unit-and-integration'],
 steps:[
  {title:'两种测试尺度',en:'Two scopes of testing',seconds:18,
   script:['单元测试只检查一小块逻辑，范围窄、速度快。','集成测试让界面、服务和存储连起来，检查它们能否配合。','两种尺度回答的问题不同，不能互相替代。'],
   enScript:['A unit test checks one small piece of logic: narrow and fast.','An integration test connects interface, service and storage to see whether they work together.','The two scopes answer different questions and cannot replace each other.'],
   notes:['单元测试定位快，集成测试更接近真实。','先想清楚这一条检查在哪个尺度上。'],
   enNotes:['Unit tests localise quickly; integration tests are closer to reality.','Decide which scope a check belongs to.'],
   conceptZh:'测试尺度',conceptEn:'Test scope',conceptNoteZh:'单块逻辑 vs 多层协作',conceptNoteEn:'One unit vs several layers'},
  {title:'单元测试快而窄',en:'Unit tests are fast and narrow',seconds:19,
   script:['单元测试只依赖一小块代码，不启动数据库和网络。','因此它可以在几毫秒内跑完，适合频繁运行。','范围小也意味着错误更容易被定位到具体位置。'],
   enScript:['A unit test depends on a small piece of code, without a database or network.','It therefore runs in milliseconds and suits frequent execution.','A narrow scope also makes it easier to locate a fault.'],
   notes:['不要让单元测试依赖外部服务。','数量可以多，运行要快。'],
   enNotes:['Keep unit tests free of external services.','You can have many; they must stay fast.'],
   conceptZh:'快速反馈',conceptEn:'Fast feedback',conceptNoteZh:'毫秒级，多而快',conceptNoteEn:'Milliseconds, many and fast'},
  {title:'集成测试慢而真',en:'Integration tests are slow and real',seconds:20,
   script:['集成测试会启动多层，检查数据从界面到存储的完整路径。','它更接近真实使用，但也更慢、更容易受环境影响。','接口约定变化时，集成测试往往最先发现问题。'],
   enScript:['An integration test starts several layers and checks the full path from interface to storage.','It is closer to real use, but slower and more sensitive to the environment.','When a contract changes, integration tests often catch the problem first.'],
   notes:['集成测试关注层与层的接口。','数量不宜过多，优先覆盖关键路径。'],
   enNotes:['Integration tests focus on contracts between layers.','Keep their number modest and cover key paths.'],
   conceptZh:'层间协作',conceptEn:'Layer collaboration',conceptNoteZh:'界面 → 服务 → 存储',conceptNoteEn:'UI to service to storage'},
  {title:'组合成测试金字塔',en:'Combine them as a pyramid',seconds:19,
   script:['常见做法是底层大量单元测试，中层适量集成测试，顶层少量端到端测试。','越往上越接近真实，也越慢、越容易不稳定。','金字塔不是固定比例，而是提醒你分配检查成本。'],
   enScript:['A common shape is many unit tests at the bottom, some integration tests in the middle and few end-to-end tests on top.','Higher levels are closer to reality but slower and more fragile.','The pyramid is not a fixed ratio; it reminds you to allocate checking cost.'],
   notes:['关键路径值得用集成测试覆盖。','端到端测试少而精。'],
   enNotes:['Key paths deserve integration coverage.','Keep end-to-end tests few and focused.'],
   conceptZh:'测试金字塔',conceptEn:'Test pyramid',conceptNoteZh:'多单元、适量集成、少端到端',conceptNoteEn:'Many unit, some integration, few end-to-end'},
 ].map((s,i)=>({...s,art:(p,lang)=>unitIntegrationArt(i,p,lang)}))};

export const testDataEdgesLesson={...base,
 id:'test-data-edges',code:'1.2',courseId:'testing-quality-release',
 title:'测试数据与边界情况',titleEn:'Test data and edge cases',
 sceneTitle:'测试数据与边界情况',sceneTitleEn:'Test data and edge cases',
 audioManifest:courseAudio['test-data-edges'],
 steps:[
  {title:'正常数据只覆盖一半',en:'Normal data covers half',seconds:18,
   script:['用一条正常数据跑通，只能说明主路径可以走。','空数据、重复数据、超长内容往往才会暴露问题。','测试数据要主动包含不合适、不完整的情况。'],
   enScript:['One normal record proves only that the main path can run.','Empty data, duplicates and very long content are what usually expose problems.','Test data should deliberately include awkward and incomplete cases.'],
   notes:['正常数据证明可行，异常数据证明可靠。','先列出可能出现的特殊输入。'],
   enNotes:['Normal data proves feasibility; odd data proves reliability.','List the special inputs likely to appear.'],
   conceptZh:'正常与异常',conceptEn:'Normal and odd',conceptNoteZh:'主路径之外的情况',conceptNoteEn:'Beyond the happy path'},
  {title:'空、重复、超量',en:'Empty, duplicate, too many',seconds:19,
   script:['空数据检查系统有没有兜底说明，重复数据检查会不会保存两份。','超量数据检查性能与超时，缺失字段检查容错。','每类特殊输入，都要有明确期望结果。'],
   enScript:['Empty data checks for a clear fallback message; duplicates check whether two copies are saved.','Very large input checks performance and timeouts; missing fields check tolerance.','Each kind of special input needs an explicit expected result.'],
   notes:['把特殊输入写进验收条件。','没有期望结果的测试无法判断对错。'],
   enNotes:['Write special inputs into acceptance criteria.','A test without an expected result cannot judge right from wrong.'],
   conceptZh:'特殊输入清单',conceptEn:'Special input list',conceptNoteZh:'空、重复、超量、缺失',conceptNoteEn:'Empty, duplicate, volume, missing'},
  {title:'边界值',en:'Boundary values',seconds:19,
   script:['边界值常常是错误出现的地方：0、1、上限、上限加一。','只测中间值，往往看不到边界处的处理。','边界两侧都要测：刚好允许，以及刚好不允许。'],
   enScript:['Boundaries are where errors cluster: zero, one, the maximum, and the maximum plus one.','Testing only middle values often misses how boundaries are handled.','Test both sides of an edge: just allowed and just rejected.'],
   notes:['边界值要成对测试。','把边界写进规则或验收表。'],
   enNotes:['Test boundary values in pairs.','Write boundaries into rules or acceptance tables.'],
   conceptZh:'边界值',conceptEn:'Boundary values',conceptNoteZh:'0、1、上限、上限+1',conceptNoteEn:'Zero, one, max, max plus one'},
  {title:'测试数据要可重复',en:'Test data must be repeatable',seconds:19,
   script:['如果每次测试的数据都不同，结果就无法比较。','使用固定的预置数据，并在每次测试前重置到同一状态。','可重复的数据，才能支撑可重复的判断。'],
   enScript:['If the data differs every run, results cannot be compared.','Use fixed fixtures and reset to the same state before each run.','Repeatable data supports repeatable judgement.'],
   notes:['测试数据与用户数据要隔离。','重置步骤本身也要可靠。'],
   enNotes:['Keep test data separate from user data.','The reset step must itself be reliable.'],
   conceptZh:'固定数据',conceptEn:'Fixtures',conceptNoteZh:'从同一状态开始',conceptNoteEn:'Start from the same state'},
 ].map((s,i)=>({...s,art:(p,lang)=>testDataEdgesArt(i,p,lang)}))};

export const releaseChecklistLesson={...base,
 id:'release-checklist',code:'1.2',courseId:'testing-quality-release',
 title:'发布检查清单',titleEn:'The release checklist',
 sceneTitle:'发布检查清单',sceneTitleEn:'The release checklist',
 audioManifest:courseAudio['release-checklist'],
 steps:[
  {title:'发布前逐项确认',en:'Confirm every item',seconds:18,
   script:['发布检查清单把“应该记得”变成“必须确认”。','至少覆盖检查结果、数据备份、回退步骤和通知。','每次发布都跑同一份清单，习惯就不依赖记忆。'],
   enScript:['A release checklist turns “should remember” into “must confirm”.','It covers at least checks, backups, rollback steps and notifications.','Running the same checklist every release makes the habit independent of memory.'],
   notes:['清单要短而关键。','清单本身也要定期更新。'],
   enNotes:['Keep the checklist short and critical.','Review and update the checklist itself.'],
   conceptZh:'发布清单',conceptEn:'Release checklist',conceptNoteZh:'检查、备份、回退、通知',conceptNoteEn:'Checks, backup, rollback, notice'},
  {title:'检查项要可执行',en:'Each item must be executable',seconds:19,
   script:['“测试过了”不是一个可检查的条目，因为它没有说明谁测了什么。','把它换成具体命令和结果，例如测试全部通过、错误率为零。','别人能照着执行的条目，才算真正的检查。'],
   enScript:['“Tests passed” is not checkable because it does not say who ran what.','Replace it with a concrete command and result, such as all tests green and no errors.','An item someone else can execute is a real check.'],
   notes:['检查项写成动作加结果。','模糊条目要拆成几条具体条目。'],
   enNotes:['Write each item as action plus result.','Split vague items into concrete ones.'],
   conceptZh:'可执行条目',conceptEn:'Executable item',conceptNoteZh:'命令、结果、时间',conceptNoteEn:'Command, result, time'},
  {title:'谁按下放行键',en:'Who presses release',seconds:19,
   script:['自动检查负责挡住机械错误，放行动作仍然由人完成。','放行者要看过检查结果，并知道回退方案。','责任跟着放行动作走，才能避免“大家都以为别人确认过”。'],
   enScript:['Automated checks stop mechanical errors, but a person still performs the release.','That person should see the check results and know the rollback plan.','Responsibility follows the release action, avoiding “someone else must have checked”.'],
   notes:['放行条件要提前写明。','关键发布最好有第二人复核。'],
   enNotes:['Write the release criteria in advance.','Critical releases deserve a second reviewer.'],
   conceptZh:'放行责任',conceptEn:'Release responsibility',conceptNoteZh:'检查通过后由人放行',conceptNoteEn:'A person releases after checks'},
  {title:'回退方案',en:'The rollback plan',seconds:19,
   script:['发布前就要写好：发现问题时回到哪个版本、谁来执行、多久能完成。','回退最好提前演练一次，确认备份真的可以恢复。','回退不是失败，而是把损失控制在可接受范围内。'],
   enScript:['Before release, write which version to return to, who will do it and how long it takes.','Rehearse the rollback once to confirm the backup actually restores.','Rollback is not failure; it keeps the loss within an acceptable range.'],
   notes:['回退与热修复是两条不同路径。','回退后要保留现场信息。'],
   enNotes:['Rollback and hotfix are different paths.','Preserve evidence after a rollback.'],
   conceptZh:'回退预案',conceptEn:'Rollback plan',conceptNoteZh:'版本、执行人、时间',conceptNoteEn:'Version, owner, duration'},
 ].map((s,i)=>({...s,art:(p,lang)=>releaseChecklistArt(i,p,lang)}))};

export const monitorFeedbackLesson={...base,
 id:'monitor-and-feedback',code:'1.2',courseId:'testing-quality-release',
 title:'上线后的监控与反馈',titleEn:'Monitoring and feedback after launch',
 sceneTitle:'上线后的监控与反馈',sceneTitleEn:'Monitoring and feedback after launch',
 audioManifest:courseAudio['monitor-and-feedback'],
 steps:[
  {title:'上线后要看信号',en:'Watch the signals',seconds:18,
   script:['发布后，团队要观察错误率、响应时间、失败请求和用户反馈。','这些信号来自真实用户和真实数据，测试环境无法完全模拟。','先建立观察习惯，再谈优化。'],
   enScript:['After release, watch error rate, latency, failed requests and user feedback.','These signals come from real users and data, which a test environment cannot fully simulate.','Build the habit of watching before talking about optimisation.'],
   notes:['没有基线的指标无法判断。','信号要能定期看到，而不是出事才查。'],
   enNotes:['A metric without a baseline cannot be judged.','Signals should be reviewed regularly, not only after an incident.'],
   conceptZh:'运行信号',conceptEn:'Production signals',conceptNoteZh:'错误、延迟、失败、反馈',conceptNoteEn:'Errors, latency, failures, reports'},
  {title:'定义异常阈值',en:'Define thresholds',seconds:19,
   script:['只有定义了什么算异常，团队才知道何时介入。','阈值可以来自历史基线，也可以来自业务要求。','阈值不是永远不变，它应随使用量增长而调整。'],
   enScript:['Only after defining what counts as abnormal does the team know when to intervene.','Thresholds can come from historical baselines or business requirements.','Thresholds are not permanent; adjust them as usage grows.'],
   notes:['阈值要写下来，而不是凭感觉。','阈值调整也要留下记录。'],
   enNotes:['Write thresholds down instead of judging by feel.','Record changes to thresholds too.'],
   conceptZh:'异常阈值',conceptEn:'Thresholds',conceptNoteZh:'基线之上才算异常',conceptNoteEn:'Abnormal above the baseline'},
  {title:'用户反馈是信号',en:'User reports are signals',seconds:19,
   script:['用户反馈能告诉你指标看不到的体验问题。','但单条反馈也可能是个例，需要结合数据判断范围。','把反馈当作线索，再用证据确认它的普遍性。'],
   enScript:['User reports reveal experience problems that metrics cannot see.','A single report may be an outlier, so check its scale against data.','Treat reports as clues, then confirm how widespread they are with evidence.'],
   notes:['反馈要记录来源与情境。','把反馈与指标对照，而不是二选一。'],
   enNotes:['Record where and when feedback came from.','Compare reports with metrics rather than choosing one.'],
   conceptZh:'反馈线索',conceptEn:'Feedback as clues',conceptNoteZh:'个例需要证据确认',conceptNoteEn:'Confirm single reports with evidence'},
  {title:'反馈进入下一轮',en:'Feedback enters the next round',seconds:19,
   script:['观察、判断、调整应该形成闭环，而不是发布后就结束。','每次调整都要说明依据，下一次复盘才有参照。','闭环让每一次发布都比上一次更有依据。'],
   enScript:['Observe, decide and adjust should form a loop; release is not the end.','Each adjustment should state its basis so the next review has a reference.','A loop makes every release better grounded than the last.'],
   notes:['复盘针对假设与证据。','没有进入下一轮的反馈会被遗忘。'],
   enNotes:['Review assumptions and evidence.','Feedback that never enters the next round is forgotten.'],
   conceptZh:'反馈闭环',conceptEn:'Feedback loop',conceptNoteZh:'观察、判断、调整',conceptNoteEn:'Observe, decide, adjust'},
 ].map((s,i)=>({...s,art:(p,lang)=>monitorFeedbackArt(i,p,lang)}))};
