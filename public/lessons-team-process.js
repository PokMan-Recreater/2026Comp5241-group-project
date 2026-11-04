import courseAudio from './course-audio-manifest.js';
import {kit,frame} from './lesson-art-kit.js';

function versionControlArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.doc(54,76,'#fff4d4',86,104)}${k.text(97,198,'final','final',10,'#8a6a25','middle')}
  ${k.doc(108,68,'#f3eef9',86,104)}${k.text(151,190,'final_v2','final_v2',10,'#4a3a82','middle')}
  ${k.doc(162,60,'#f9e8e2',86,104)}${k.text(205,182,'final_3','final_3',10,'#a64e44','middle')}
  ${k.group(.2,k.warn(214,214)+k.text(238,219,'哪个才是真的？','Which one is real?',11,'#8a6a25'))}
  ${k.path('M290 130H356')}
  ${k.group(.44,k.db(418,118,'#e7f2e7'))}${k.text(418,188,'一条历史线','One history',11,'#34734b','middle')}
  ${k.group(.58,k.clock(418,246)+k.text(442,250,'每次改动有记录','Every change recorded',11,'#66502a'))}
  ${k.group(.76,k.ok(596,246))}${k.text(596,292,'可回到任一版本','Return to any version',10,'#34734b','middle')}
  ${k.text(360,322,'版本控制把文件堆变成历史','Version control turns a pile of files into a history',13,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.box(46,64,300,196,'#f9e8e2')}
  ${k.text(68,92,'一次提交塞进三件事','Three things in one commit',12,'#a64e44')}
  ${k.group(.18,k.doc(70,108,'#fffefb',64,80)+k.text(102,202,'界面','UI',10,'#665e72','middle'))}
  ${k.group(.3,k.gear(178,148))}${k.text(178,202,'逻辑','Logic',10,'#665e72','middle')}
  ${k.group(.42,k.db(262,142,'#e6eef7'))}${k.text(262,202,'存储','Storage',10,'#665e72','middle')}
  ${k.group(.54,k.no(292,84,'#b96559'))}
  ${k.path('M356 162H414')}
  ${k.box(426,64,250,196,'#e7f2e7')}
  ${k.text(448,92,'三件小事，三次提交','Three small commits',12,'#34734b')}
  ${k.group(.36,k.ok(472,126)+k.text(496,131,'界面调整','UI change',11,'#34734b'))}
  ${k.group(.52,k.ok(472,172)+k.text(496,177,'逻辑修正','Logic fix',11,'#34734b'))}
  ${k.group(.68,k.ok(472,218)+k.text(496,223,'存储迁移','Storage migration',11,'#34734b'))}
  ${k.text(360,306,'回退、定位、评审都更容易','Rollback, blame and review all get easier',13,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.text(360,42,'一条主线，一条分支','One main line, one branch',14,'#242032','middle')}
  <path d="M60 190H660" stroke="#7967ac" stroke-width="3" stroke-linecap="round"/>
  ${[120,240,360,480,600].map(x=>`<circle cx="${x}" cy="190" r="7" fill="#fffefb" stroke="#7967ac" stroke-width="3"/>`).join('')}
  <path d="M240 190C290 190 290 96 340 96H480C530 96 530 190 580 190" fill="none" stroke="#34734b" stroke-width="3" stroke-dasharray="7 6"/>
  ${k.group(.2,k.chip(96,60,160,'新增功能','New feature','#f3eef9'))}
  ${k.group(.34,k.text(404,74,'在分支上做，不影响主线','Work on a branch, apart from main',11,'#34734b','middle'))}
  ${k.group(.52,k.text(404,120,'完成后再合并回来','Merge back when done',10,'#5c7a63','middle'))}
  ${k.group(.68,k.ok(240,222)+k.text(264,227,'分支起点','Branch point',10,'#34734b'))}
  ${k.group(.8,k.ok(580,222)+k.text(604,227,'合并点','Merge point',10,'#34734b'))}
  ${k.group(.74,k.warn(360,266)+k.text(384,271,'合并前先跑检查','Run checks before merging',11,'#8a6a25'))}
  ${k.text(360,330,'分支让并行工作不互相踩踏','Branches let parallel work avoid collisions',12,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.box(48,70,290,150,'#f9e8e2')}
  ${k.text(70,100,'说不清','Unclear',12,'#a64e44')}
  ${k.no(88,134,'#b96559')}${k.text(114,139,'“改了点东西”','“Changed some stuff”',12,'#a64e44')}
  ${k.text(70,184,'别人无法判断影响','Others cannot judge the impact',10,'#665e72')}
  ${k.path('M354 145H410')}
  ${k.box(422,70,250,150,'#e7f2e7')}
  ${k.text(444,100,'写给下一位','Write for the next reader',12,'#34734b')}
  ${k.ok(462,134)}${k.text(488,139,'“修复空列表报错”','“Fix empty-list crash”',11,'#34734b')}
  ${k.text(444,178,'做了什么、为什么','What and why',10,'#665e72')}
  ${k.group(.7,k.box(58,244,604,64,'#fffefb')+k.text(80,270,'提交标题写结果，正文写原因','Subject states the result; body states the reason',12)+k.text(80,292,'一个读者不需要追问就能理解','A reader should not need to ask follow-up questions',10,'#665e72'))}
  ${k.text(360,336,'提交信息也是文档','A commit message is documentation too',11,'#665e72','middle')}
 `;
 return frame(body,['版本控制与提交习惯','Version control and commit habits'],lang);
}

function codeReviewArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.face(110,106,'#bad7c2')}${k.text(110,196,'作者','Author',11,'#665e72','middle')}
  ${k.doc(206,88,'#fffefb',92,112)}${k.text(252,218,'改动','Change',11,'#665e72','middle')}
  ${k.path('M310 144H376')}
  ${k.face(430,106,'#e9c58b')}${k.text(430,196,'评审者','Reviewer',11,'#665e72','middle')}
  ${k.path('M486 128H548')}
  ${k.group(.5,k.ok(586,128))}${k.text(586,174,'合并','Merge',10,'#34734b','middle')}
  ${k.group(.34,k.speech(300,222,220,'这个边界怎么处理？','How is this edge handled?','#fff4d4'))}
  ${k.group(.7,k.chip(96,250,190,'一起把问题看清','See the problem together','#e7f2e7'))}
  ${k.text(360,326,'评审是共同检查，不是互相挑错','Review is a shared check, not fault-finding',13,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.box(48,62,300,200,'#f3eef9')}
  ${k.text(70,90,'先看行为','Behaviour first',13,'#4a3a82')}
  ${k.group(.2,k.ok(70,116)+k.text(94,121,'输入为空时返回什么','What empty input returns',11,'#4a3a82'))}
  ${k.group(.36,k.ok(70,150)+k.text(94,155,'失败时是否提示用户','Is the user told on failure',11,'#4a3a82'))}
  ${k.group(.52,k.ok(70,184)+k.text(94,189,'重复提交如何处理','How duplicates are handled',11,'#4a3a82'))}
  ${k.group(.68,k.ok(70,218)+k.text(94,223,'有没有测试覆盖','Is it covered by a test',11,'#4a3a82'))}
  ${k.path('M356 162H414')}
  ${k.box(426,62,250,200,'#fff4d4')}
  ${k.text(448,90,'再看写法','Style second',13,'#8a6a25')}
  ${k.group(.4,k.text(448,126,'命名是否清楚','Clear names',11,'#665e72'))}
  ${k.group(.55,k.text(448,158,'函数是否太长','Functions too long',11,'#665e72'))}
  ${k.group(.7,k.text(448,190,'风格是否一致','Consistent style',11,'#665e72'))}
  ${k.group(.82,k.text(448,222,'工具能查的交给工具','Let tools check style',10,'#8a6a25'))}
  ${k.text(360,304,'行为和风格都要看，顺序不能反','Check behaviour and style, in that order',12,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.box(48,66,286,194,'#f9e8e2')}
  ${k.text(70,94,'一次改动 800 行','One change, 800 lines',12,'#a64e44')}
  ${Array.from({length:6},(_,i)=>`<rect x="${76}" y="${108+i*22}" width="${200-i*12}" height="10" rx="4" fill="#e6b4ab"/>`).join('')}
  ${k.group(.5,`<g transform="translate(300 90) scale(.65)">${k.warn(0,0)}</g>`+k.text(191,282,'看不过来','Too much to review',10,'#a64e44','middle'))}
  ${k.path('M344 160H402')}
  ${k.box(414,66,262,194,'#e7f2e7')}
  ${k.text(436,94,'一次改动 80 行','One change, 80 lines',12,'#34734b')}
  ${Array.from({length:6},(_,i)=>`<rect x="${442}" y="${108+i*22}" width="${64+i*8}" height="10" rx="4" fill="#a9cdb6"/>`).join('')}
  ${k.ok(630,86)}
  ${k.text(545,282,'细节看得清，问题问得出','Details visible, questions possible',10,'#34734b','middle')}
  ${k.text(360,312,'小改动才评得动','Small changes are the ones that actually get reviewed',12,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.text(360,44,'把评论写成可执行的请求','Write comments as actionable requests',14,'#242032','middle')}
  ${k.box(56,74,290,132,'#f9e8e2')}
  ${k.text(78,102,'模糊','Blurry',12,'#a64e44')}
  ${k.no(96,136,'#b96559')}${k.text(122,141,'“这里不太对”','“This seems off”',12,'#a64e44')}
  ${k.text(78,182,'作者不知道要改什么','The author cannot tell what to change',10,'#665e72')}
  ${k.path('M360 140H412')}
  ${k.box(424,74,238,132,'#e7f2e7')}
  ${k.text(446,102,'具体','Specific',12,'#34734b')}
  ${k.ok(464,136)}${k.text(490,141,'“空输入会返回 null”','“Empty input returns null”',11,'#34734b')}
  ${k.text(446,182,'指出位置与建议','Location and suggestion',10,'#665e72')}
  ${k.group(.68,k.box(56,226,306,58,'#fff4d4')+k.text(78,250,'区分必须修改与建议','Separate must-fix from suggestion',11,'#8a6a25')+k.text(78,272,'“必须”要少而清楚','Keep must-fix few and clear',10,'#665e72'))}
  ${k.group(.84,k.box(384,226,278,58,'#f3eef9')+k.text(406,250,'评论针对代码，不针对人','Comment on the code, not the person',11,'#4a3a82')+k.text(406,272,'追问时先说明依据','Explain your evidence when asking',10,'#665e72'))}
  ${k.text(360,336,'好的评论让作者知道下一步做什么','A good comment tells the author the next step',11,'#665e72','middle')}
 `;
 return frame(body,['代码评审看什么','What code review should look for'],lang);
}

function taskBreakdownArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.box(54,78,220,150,'#f9e8e2')}
  ${k.text(164,106,'一整块工作','One big task',13,'#a64e44','middle')}
  ${k.warn(164,170)}${k.text(164,216,'不知道从哪开始','No obvious first step',10,'#a64e44','middle')}
  ${k.path('M286 152H350')}
  ${k.group(.24,k.box(366,58,140,74,'#e7f2e7')+k.text(436,88,'第一件','First',12,'#34734b','middle')+k.text(436,112,'今天能完成','Done today',10,'#5c7a63','middle'))}
  ${k.group(.42,k.box(520,58,140,74,'#e7f2e7')+k.text(590,88,'第二件','Second',12,'#34734b','middle')+k.text(590,112,'依赖第一件','After the first',10,'#5c7a63','middle'))}
  ${k.group(.6,k.box(366,152,140,74,'#e7f2e7')+k.text(436,182,'第三件','Third',12,'#34734b','middle')+k.text(436,206,'可以并行','Can run parallel',10,'#5c7a63','middle'))}
  ${k.group(.78,k.box(520,152,140,74,'#fff4d4')+k.text(590,182,'未知项','Unknown',12,'#8a6a25','middle')+k.text(590,206,'先调查','Investigate first',10,'#8a6a25','middle'))}
  ${k.text(360,310,'拆到每块都能单独验收','Split until each piece can be checked alone',13,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'按可交付的结果拆','Split by deliverable',14,'#242032','middle')}
  ${k.box(54,74,606,74,'#e7f2e7')}${k.ok(90,111)}${k.text(118,105,'用户能看到搜索结果','A user can see search results',12,'#34734b')}${k.text(118,129,'有输入、有输出、能演示','Input, output, demonstrable',10,'#5c7a63')}
  ${k.group(.26,k.box(54,162,606,74,'#fff4d4')+k.clock(90,199)+k.text(118,193,'搜索可以用键盘触发','Search can be triggered by keyboard',12,'#8a6a25')+k.text(118,217,'行为可观察，可算完成','Observable, so it can be called done',10,'#665e72'))}
  ${k.group(.5,k.box(54,250,606,60,'#f3eef9')+k.text(90,276,'不要按“写代码、写样式、联调”拆','Do not split by “code, style, integrate”',12,'#4a3a82')+k.text(90,298,'那样每一块都无法单独验收','None of those pieces can be checked alone',10,'#665e72'))}
  ${k.group(.78,k.text(360,334,'每块都以“能看见的结果”结尾','Each piece ends in something visible',11,'#665e72','middle'))}
 `;
 if(step===2)body=`
  ${k.text(360,44,'估算要写成范围','Estimates are ranges',14,'#242032','middle')}
  ${k.box(56,72,286,170,'#fffefb')}
  ${k.text(78,100,'任务','Task',12)}${k.text(280,100,'估时','Estimate',12,'#665e72','end')}
  ${k.group(.16,k.text(78,132,'界面调整','UI change',11)+k.text(280,132,'2–3 天','2–3 days',11,'#4a3a82','end'))}
  ${k.group(.32,k.text(78,166,'接口联调','API integration',11)+k.text(280,166,'1–2 天','1–2 days',11,'#4a3a82','end'))}
  ${k.group(.48,k.text(78,200,'数据迁移','Data migration',11)+k.text(280,200,'3–5 天','3–5 days',11,'#a64e44','end'))}
  ${k.group(.64,k.text(280,232,'合计 6–10 天','Total 6–10 days',11,'#665e72','end'))}
  ${k.path('M356 156H408')}
  ${k.group(.52,k.box(420,72,240,170,'#fff4d4')+k.text(442,100,'留出余量','Leave room',13,'#8a6a25')+k.clock(458,140)+k.text(482,145,'未知越多，区间越宽','Wider range with more unknowns',10,'#665e72')+k.text(442,190,'承诺前先说明假设','State assumptions before promising',10,'#665e72'))}
  ${k.group(.8,k.warn(360,272,'#b58a1f')+k.text(384,277,'单点估时最容易被现实推翻','A single-number estimate is easily overturned',11,'#8a6a25'))}
  ${k.text(360,324,'范围让沟通有退路','A range leaves room to communicate',12,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.box(48,62,306,206,'#fffefb')}
  ${k.text(70,90,'任务卡','Task card',13)}
  ${k.group(.14,k.text(70,120,'目标：搜索结果可显示','Goal: search results appear',11,'#34734b'))}
  ${k.group(.3,k.text(70,150,'完成条件：有测试 + 可演示','Done: tested and demoable',11,'#34734b'))}
  ${k.group(.46,k.text(70,180,'非目标：不改排序规则','Not now: ranking rules',11,'#a64e44'))}
  ${k.group(.62,k.text(70,210,'需要确认：设计稿','Needs approval: design',11,'#8a6a25'))}
  ${k.group(.78,k.clock(70,244)+k.text(94,248,'预计 2 天','About 2 days',11,'#66502a'))}
  ${k.path('M362 164H414')}
  ${k.box(426,62,250,206,'#e7f2e7')}
  ${k.text(448,90,'边界写清的好处','Why boundaries help',12,'#34734b')}
  ${k.group(.4,k.ok(448,124)+k.text(472,129,'不会越做越大','No scope creep',11,'#34734b'))}
  ${k.group(.56,k.ok(448,162)+k.text(472,167,'评审有依据','Review has criteria',11,'#34734b'))}
  ${k.group(.72,k.ok(448,200)+k.text(472,205,'交接不丢上下文','Handoff keeps context',11,'#34734b'))}
  ${k.text(360,304,'任务边界就是小范围的约定','A task boundary is a small agreement',12,'#665e72','middle')}
 `;
 return frame(body,['任务拆分与估算','Breaking down and estimating work'],lang);
}

function docsArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.doc(316,46,'#f3eef9',92,110)}${k.text(362,176,'文档','Docs',12,'#4a3a82','middle')}
  ${k.face(92,78,'#bad7c2')}${k.text(92,150,'开发者','Developer',10,'#665e72','middle')}
  ${k.face(610,78,'#e9c58b')}${k.text(610,150,'测试者','Tester',10,'#665e72','middle')}
  ${k.face(92,238,'#c8b8e5')}${k.text(92,310,'新同事','Newcomer',10,'#665e72','middle')}
  ${k.face(610,238,'#bad7c2')}${k.text(610,310,'使用者','User',10,'#665e72','middle')}
  ${k.path('M136 118L308 96','#7967ac',true)}${k.path('M566 118L416 96','#7967ac',true)}
  ${k.path('M136 254L308 170','#7967ac',true)}${k.path('M566 254L416 170','#7967ac',true)}
  ${k.group(.6,k.chip(270,262,180,'接口的书面约定','The written contract','#fff4d4'))}
  ${k.text(360,336,'文档让多人不必靠猜','Docs let several people stop guessing',13,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.box(50,64,300,200,'#fffefb')}
  ${k.text(72,92,'先回答两个问题','Answer two questions first',13)}
  ${k.group(.16,k.text(72,124,'· 谁读这份文档？','· Who reads this?',11,'#4a3a82'))}
  ${k.group(.32,k.text(72,158,'· 读完要做什么？','· What should they do?',11,'#4a3a82'))}
  ${k.group(.5,k.text(72,196,'新同事：按步骤启动项目','Newcomer: start the project',10,'#665e72'))}
  ${k.group(.66,k.text(72,224,'测试者：知道边界规则','Tester: know boundary rules',10,'#665e72'))}
  ${k.path('M356 162H412')}
  ${k.box(424,64,246,200,'#f3eef9')}
  ${k.text(446,92,'读者不同，写法不同','Audience changes the form',12,'#4a3a82')}
  ${k.group(.36,k.doc(446,112,'#fffefb',58,72)+k.text(475,196,'步骤清单','Checklist',9,'#665e72','middle'))}
  ${k.group(.58,k.speech(520,112,130,'规则是什么？','What is the rule?','#fff4d4'))}
  ${k.group(.78,k.text(446,232,'用途不清，文档就没人读','Unclear purpose means no readers',10,'#665e72'))}
  ${k.text(360,310,'先写读者与用途，再写内容','Name the reader and purpose before writing',12,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.text(360,44,'例子比形容词有用','Examples beat adjectives',14,'#242032','middle')}
  ${k.box(50,70,290,152,'#f9e8e2')}
  ${k.text(72,98,'形容词','Adjectives',12,'#a64e44')}
  ${k.no(90,132,'#b96559')}${k.text(116,137,'“接口要稳定”','“Keep the API stable”',12,'#a64e44')}
  ${k.text(72,178,'每人理解都不一样','Everyone interprets it differently',10,'#665e72')}
  ${k.path('M356 146H410')}
  ${k.box(422,70,252,152,'#e7f2e7')}
  ${k.text(444,98,'例子','Examples',12,'#34734b')}
  ${k.ok(462,132)}${k.text(488,137,'“返回 200 或 404”','“Return 200 or 404”',11,'#34734b')}
  ${k.text(444,178,'可以照着验证','It can be verified',10,'#5c7a63')}
  ${k.group(.62,k.box(50,238,306,60,'#fff4d4')+k.text(72,262,'一条好文档：可执行','Useful docs are executable',11,'#8a6a25')+k.text(72,284,'读者能照做并得到相同结果','Readers act and get the same result',10,'#665e72'))}
  ${k.group(.8,k.box(378,238,296,60,'#f3eef9')+k.text(400,262,'坏例子写清为什么坏','Bad examples explain why',11,'#4a3a82')+k.text(400,284,'对比让人更快记住规则','Contrast makes rules stick',10,'#665e72'))}
  ${k.text(360,334,'写一个能跑的样例','Write a sample that runs',11,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.text(360,44,'文档跟着代码一起改','Docs change with the code',14,'#242032','middle')}
  <circle cx="170" cy="150" r="46" fill="#f3eef9" stroke="#292535" stroke-width="2"/>${k.text(170,146,'代码','Code',12,'#4a3a82','middle')}${k.text(170,166,'改动','Change',10,'#665e72','middle')}
  <circle cx="430" cy="150" r="46" fill="#fff4d4" stroke="#292535" stroke-width="2"/>${k.text(430,146,'文档','Docs',12,'#8a6a25','middle')}${k.text(430,166,'更新','Update',10,'#665e72','middle')}
  ${k.path('M218 134H382')}${k.path('M382 168H218')}
  ${k.group(.5,k.warn(548,120)+k.text(572,125,'漏改就会误导','Stale docs mislead',11,'#8a6a25'))}
  ${k.group(.66,k.ok(548,204))}${k.text(548,250,'同一提交里更新','Update in the same commit',10,'#34734b','middle')}
  ${k.group(.8,k.clock(360,262)+k.text(384,266,'定期检查过期内容','Review stale content',11,'#66502a'))}
  ${k.text(360,334,'过期的文档比没有更危险','Stale docs are worse than none',12,'#665e72','middle')}
 `;
 return frame(body,['文档即协作接口','Docs as a collaboration interface'],lang);
}

function handoffArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.box(48,64,268,190,'#f9e8e2')}
  ${k.text(70,92,'丢一堆文件','Dump a pile of files',12,'#a64e44')}
  ${k.doc(86,118,'#fffefb',46,52)}
  ${k.doc(146,132,'#fffefb',46,52)}
  ${k.doc(98,180,'#fffefb',46,50)}
  ${k.no(278,126,'#b96559')}${k.text(70,244,'接手的人不知道从哪看','No one knows where to start',10,'#665e72')}
  ${k.path('M338 160H396')}
  ${k.box(408,64,264,190,'#e7f2e7')}
  ${k.text(430,92,'一次交接','A handoff',12,'#34734b')}
  ${k.ok(448,126)}${k.text(474,131,'目标与当前状态','Goal and current state',11,'#34734b')}
  ${k.group(.34,k.ok(448,164)+k.text(474,169,'下一步与风险','Next steps and risks',11,'#34734b'))}
  ${k.group(.56,k.ok(448,202)+k.text(474,207,'关键文件与入口','Key files and entry points',11,'#34734b'))}
  ${k.group(.78,k.text(430,242,'留下提问的方式','How to ask questions',10,'#5c7a63'))}
  ${k.text(360,304,'交接是把上下文交出去','A handoff transfers context',13,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.box(54,60,290,206,'#fff4d4')}
  ${k.text(76,88,'下一步','Next steps',13,'#8a6a25')}
  ${k.group(.16,k.chip(76,104,200,'1. 修复空输入','1. Fix empty input','#e7f2e7'))}
  ${k.group(.32,k.chip(76,152,220,'2. 补一条测试','2. Add a test','#e7f2e7'))}
  ${k.group(.48,k.chip(76,200,190,'3. 邀请评审','3. Request review','#e7f2e7'))}
  ${k.text(76,252,'每步都能独立开始','Each step can start alone',10,'#665e72')}
  ${k.path('M358 160H412')}
  ${k.box(424,60,246,206,'#f9e8e2')}
  ${k.text(446,88,'风险','Risks',13,'#a64e44')}
  ${k.group(.3,k.warn(462,126)+k.text(486,131,'接口可能变','API may change',11,'#a64e44'))}
  ${k.group(.48,k.warn(462,166)+k.text(486,171,'数据未备份','Data not backed up',11,'#a64e44'))}
  ${k.group(.66,k.warn(462,206)+k.text(486,211,'缺少设计确认','Design unconfirmed',11,'#a64e44'))}
  ${k.text(446,250,'风险要写触发条件','State the trigger for each risk',9,'#665e72')}
  ${k.text(360,306,'下一任最需要的是判断依据','The successor needs the basis for decisions',12,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.face(112,96,'#bad7c2')}${k.text(112,186,'交接者','Handing over',11,'#665e72','middle')}
  ${k.speech(150,54,300,'下一位要能自己讲清','The next person can explain it','#fff4d4')}
  ${k.path('M300 196H420')}
  ${k.face(488,106,'#e9c58b')}${k.text(488,196,'接手者','Taking over',11,'#665e72','middle')}
  ${k.group(.3,k.speech(360,236,260,'我来说一遍：先修空输入','Let me retell: fix empty input first','#e7f2e7'))}
  ${k.group(.58,k.ok(96,300)+k.text(120,305,'能复述目标','Can restate the goal',11,'#34734b'))}
  ${k.group(.72,k.ok(340,300)+k.text(364,305,'能说出下一步','Can name the next step',11,'#34734b'))}
  ${k.group(.84,k.ok(584,300)+k.text(608,305,'能指出风险','Can point to risks',11,'#34734b'))}
  ${k.text(360,338,'复述是交接成功的检查','Retelling is the handoff check',12,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.box(48,62,306,200,'#fffefb')}
  ${k.text(70,90,'留下来的人与记录','People and records',13)}
  ${k.group(.18,k.face(104,128,'#bad7c2')+k.text(138,126,'负责人','Owner',11,'#242032')+k.text(138,146,'继续推进','Keeps it moving',9,'#665e72'))}
  ${k.group(.36,k.face(104,196,'#c8b8e5')+k.text(138,194,'评审者','Reviewer',11,'#242032')+k.text(138,214,'把关质量','Checks quality',9,'#665e72'))}
  ${k.group(.56,k.doc(246,118,'#f3eef9',62,80))}${k.text(277,214,'决策记录','Decision record',9,'#665e72','middle')}
  ${k.path('M360 160H414')}
  ${k.box(426,62,250,200,'#e7f2e7')}
  ${k.text(448,90,'可追溯','Traceable',13,'#34734b')}
  ${k.group(.4,k.ok(448,124)+k.text(472,129,'谁决定、何时','Who decided, when',11,'#34734b'))}
  ${k.group(.56,k.ok(448,162)+k.text(472,167,'为什么这样选','Why this option',11,'#34734b'))}
  ${k.group(.72,k.ok(448,200)+k.text(472,205,'下次从哪继续','Where to resume',11,'#34734b'))}
  ${k.text(360,300,'知识留在团队，而不是一个人脑子里','Knowledge stays with the team, not one head',13,'#665e72','middle')}
  ${k.text(360,328,'记录越清楚，交接越短','Clear records make handoffs short',11,'#665e72','middle')}
 `;
 return frame(body,['交接与知识共享','Handoffs and shared knowledge'],lang);
}

const base={section:'01 软件工程与开发基础',sectionEn:'01 SOFTWARE ENGINEERING FOUNDATIONS',position:'01 · 团队与流程',positionEn:'01 · Team and process',audio:true};

export const versionControlLesson={...base,
 id:'version-control',code:'1.3',courseId:'team-and-process',
 title:'版本控制与提交习惯',titleEn:'Version control and commit habits',
 sceneTitle:'版本控制与提交习惯',sceneTitleEn:'Version control and commit habits',
 audioManifest:courseAudio['version-control'],
 steps:[
  {title:'为什么需要版本控制',en:'Why version control',seconds:18,
   script:['没有版本控制时，改动只能靠复制文件保存，很快就会出现多个“最终版”。','版本控制把每次改动连成一条历史，谁改了什么、为什么改都能查到。','它还能让你回到任一版本，而不必猜测哪个文件才是对的。'],
   enScript:['Without version control, people save changes by copying files and soon end up with several “final” versions.','Version control links every change into one history where you can see who changed what and why.','It also lets you return to any version instead of guessing which file is right.'],
   notes:['历史记录比文件副本可靠。','改动前先提交一个可回退的版本。'],
   enNotes:['History is more reliable than file copies.','Commit a recoverable version before changing things.'],
   conceptZh:'版本历史',conceptEn:'Version history',conceptNoteZh:'谁改了什么、为什么',conceptNoteEn:'Who changed what, and why'},
  {title:'一次提交说一件事',en:'One commit, one idea',seconds:19,
   script:['把界面调整、逻辑修正和存储迁移放进同一次提交，会让评审和回退都变难。','一次提交只做一件事，出问题时才能只回退那一块。','提交越聚焦，历史越像可读的清单。'],
   enScript:['Putting a UI tweak, a logic fix and a storage migration in one commit makes review and rollback hard.','One commit should do one thing so a problem can be rolled back on its own.','The more focused each commit is, the more the history reads like a list.'],
   notes:['提交前先想：这一条能不能单独说明？','不相关的小改动分开提交。'],
   enNotes:['Ask: can this commit be described on its own?','Commit unrelated small changes separately.'],
   conceptZh:'原子提交',conceptEn:'Atomic commits',conceptNoteZh:'一次只做一件事',conceptNoteEn:'One change per commit'},
  {title:'分支与合流',en:'Branches and merging',seconds:19,
   script:['分支让新功能在一侧开发，主线保持可用。','完成后再合并回来，并在合并前跑一遍检查。','分支不是越多越好，关键是要能说清每条分支的目的。'],
   enScript:['A branch lets a feature develop on the side while the main line stays usable.','Merge it back when finished, after running the checks once more.','More branches is not better; what matters is being able to state each branch’s purpose.'],
   notes:['分支要有明确目标和结束条件。','合并冲突要理解两边再解决。'],
   enNotes:['Give each branch a goal and an end condition.','Understand both sides before resolving a conflict.'],
   conceptZh:'分支与合并',conceptEn:'Branch and merge',conceptNoteZh:'并行开发，合并前检查',conceptNoteEn:'Parallel work, check before merge'},
  {title:'提交信息写给下一位',en:'Messages for the next reader',seconds:19,
   script:['“改了点东西”无法帮助任何人判断影响。','提交标题写清结果，正文说明原因和需要注意的地方。','好的提交信息让后来的人不必追问就能理解。'],
   enScript:['“Changed some stuff” tells no one what the impact is.','The subject states the result; the body explains the reason and anything to watch.','A good message lets the next person understand without follow-up questions.'],
   notes:['标题用动词开头，写结果。','正文写动机、影响和验证方式。'],
   enNotes:['Start the subject with a verb and state the result.','Use the body for motive, impact and how it was verified.'],
   conceptZh:'可读历史',conceptEn:'Readable history',conceptNoteZh:'结果在前，原因在后',conceptNoteEn:'Result first, reason second'},
 ].map((s,i)=>({...s,art:(p,lang)=>versionControlArt(i,p,lang)}))};

export const codeReviewLesson={...base,
 id:'code-review',code:'1.3',courseId:'team-and-process',
 title:'代码评审看什么',titleEn:'What code review should look for',
 sceneTitle:'代码评审看什么',sceneTitleEn:'What code review should look for',
 audioManifest:courseAudio['code-review'],
 steps:[
  {title:'评审不是挑错',en:'Review is not fault-finding',seconds:18,
   script:['代码评审的目标是让问题更早被发现，而不是证明谁更厉害。','作者和评审者一起检查行为、边界和可维护性。','提出问题时要说明依据，建议要能被执行。'],
   enScript:['The point of code review is to find problems earlier, not to prove who is smarter.','Author and reviewer check behaviour, boundaries and maintainability together.','Questions should state their evidence, and suggestions should be actionable.'],
   notes:['评审针对代码，不针对人。','有疑问先问，再下结论。'],
   enNotes:['Review the code, not the person.','Ask before concluding.'],
   conceptZh:'共同检查',conceptEn:'Shared check',conceptNoteZh:'问题更早暴露',conceptNoteEn:'Problems surface earlier'},
  {title:'先看行为，再看写法',en:'Behaviour before style',seconds:19,
   script:['先确认改动在正常、异常和边界情况下分别会怎样。','再看命名、结构和风格，这些很多可以交给工具检查。','顺序反过来，容易花时间争论格式，却漏掉真正的缺陷。'],
   enScript:['First confirm what the change does in normal, failing and boundary cases.','Then look at naming, structure and style, much of which tools can check.','Reversing the order wastes time on formatting while real defects slip through.'],
   notes:['行为问题优先级最高。','风格问题尽量自动化。'],
   enNotes:['Behaviour issues come first.','Automate style checks where possible.'],
   conceptZh:'行为优先',conceptEn:'Behaviour first',conceptNoteZh:'边界与失败比格式重要',conceptNoteEn:'Edges and failures before formatting'},
  {title:'小改动更容易评审',en:'Small changes review well',seconds:19,
   script:['一次提交几百行时，评审者很难看清每一处细节。','把改动拆小，问题更容易被发现，评论也更具体。','小改动还让回退和追责更简单。'],
   enScript:['A few hundred lines in one change makes it hard for a reviewer to see every detail.','Smaller changes are easier to inspect and invite more specific comments.','They also make rollback and tracing simpler.'],
   notes:['改动大小也是设计问题。','大重构拆成可独立验证的几步。'],
   enNotes:['Change size is a design concern too.','Split big refactors into independently verifiable steps.'],
   conceptZh:'可评审的粒度',conceptEn:'Reviewable size',conceptNoteZh:'小到能看清每一处',conceptNoteEn:'Small enough to inspect'},
  {title:'评论要可执行',en:'Make comments actionable',seconds:19,
   script:['“这里不太对”没有告诉作者要改什么。','具体指出位置、现象和建议，作者才知道下一步。','把“必须修改”和“可以商量”分开，沟通会更快。'],
   enScript:['“This seems off” does not tell the author what to change.','Point to the location, the symptom and a suggestion so the next step is clear.','Separate must-fix from nice-to-have to speed up the conversation.'],
   notes:['每条评论都要有明确动作。','区分阻塞问题与个人偏好。'],
   enNotes:['Every comment needs a clear action.','Separate blockers from personal preference.'],
   conceptZh:'可执行评论',conceptEn:'Actionable comment',conceptNoteZh:'位置、现象、建议',conceptNoteEn:'Location, symptom, suggestion'},
 ].map((s,i)=>({...s,art:(p,lang)=>codeReviewArt(i,p,lang)}))};

export const taskBreakdownLesson={...base,
 id:'task-breakdown',code:'1.3',courseId:'team-and-process',
 title:'任务拆分与估算',titleEn:'Breaking down and estimating work',
 sceneTitle:'任务拆分与估算',sceneTitleEn:'Breaking down and estimating work',
 audioManifest:courseAudio['task-breakdown'],
 steps:[
  {title:'大任务要拆小',en:'Split the big task',seconds:18,
   script:['一整块工作往往让人不知道从哪里开始。','拆成能在一天内完成的小块，进度才看得见。','拆分也让未知项提前暴露，而不是到最后才发现。'],
   enScript:['One large task often leaves people unsure where to start.','Split it into pieces finishable within a day so progress becomes visible.','Splitting also exposes unknowns early instead of at the end.'],
   notes:['拆到每块都能单独开始。','未知项要单独列出来。'],
   enNotes:['Split until each piece can start on its own.','List unknowns separately.'],
   conceptZh:'可开始的小块',conceptEn:'Startable pieces',conceptNoteZh:'一天内能看见进展',conceptNoteEn:'Progress visible within a day'},
  {title:'按可交付拆',en:'Split by deliverable',seconds:19,
   script:['按“写代码、写样式、联调”拆，每一块都无法单独验收。','按用户能看见的结果拆，例如能搜索、能键盘触发。','每块以可观察的行为结尾，完成与否才有共同标准。'],
   enScript:['Splitting into “write code, write styles, integrate” leaves nothing checkable on its own.','Split by what a user can see, such as searching or keyboard triggering.','End each piece in observable behaviour so everyone shares the definition of done.'],
   notes:['避免按技术层次拆任务。','每块写一条验收条件。'],
   enNotes:['Avoid splitting by technical layer.','Give each piece one acceptance condition.'],
   conceptZh:'可交付拆分',conceptEn:'Deliverable slicing',conceptNoteZh:'以可观察结果结尾',conceptNoteEn:'Ends in observable results'},
  {title:'估算要留余地',en:'Estimate with room',seconds:19,
   script:['估算应当写成范围，而不是一个精确数字。','未知越多，区间越宽，并要说明假设条件。','留出余量不是不自信，而是给变化留位置。'],
   enScript:['Estimates should be ranges, not precise single numbers.','The more unknowns, the wider the range, with assumptions stated.','Leaving room is not a lack of confidence; it makes space for change.'],
   notes:['单点估时容易被推翻。','估算前先写清假设。'],
   enNotes:['Single-number estimates are easily overturned.','Write assumptions before estimating.'],
   conceptZh:'区间估算',conceptEn:'Range estimate',conceptNoteZh:'假设与余量',conceptNoteEn:'Assumptions and buffer'},
  {title:'任务边界写清楚',en:'Write the task boundaries',seconds:19,
   script:['任务卡要写清目标、完成条件和非目标。','需要确认的地方提前标出，避免做到一半被推翻。','边界越清楚，评审和交接越有依据。'],
   enScript:['A task card states the goal, the done condition and the non-goals.','Mark what needs approval early so work is not overturned halfway.','Clearer boundaries give review and handoff something to rely on.'],
   notes:['非目标和目标同样重要。','需要确认的点要写明找谁。'],
   enNotes:['Non-goals matter as much as goals.','Name who approves each open point.'],
   conceptZh:'任务边界',conceptEn:'Task boundary',conceptNoteZh:'目标、完成、非目标',conceptNoteEn:'Goal, done, non-goals'},
 ].map((s,i)=>({...s,art:(p,lang)=>taskBreakdownArt(i,p,lang)}))};

export const docsInterfaceLesson={...base,
 id:'docs-as-interface',code:'1.3',courseId:'team-and-process',
 title:'文档即协作接口',titleEn:'Docs as a collaboration interface',
 sceneTitle:'文档即协作接口',sceneTitleEn:'Docs as a collaboration interface',
 audioManifest:courseAudio['docs-as-interface'],
 steps:[
  {title:'文档是协作接口',en:'Docs as an interface',seconds:18,
   script:['多人合作时，文档是彼此约定的书面接口。','开发者、测试者、新同事和使用者都从文档获取同一套规则。','没有文档，大家只能靠猜，猜错就会返工。'],
   enScript:['When several people collaborate, docs are the written interface between them.','Developers, testers, newcomers and users all take the same rules from the docs.','Without docs, everyone guesses, and wrong guesses cause rework.'],
   notes:['文档面向读者，不是面向作者。','接口变化要先反映到文档。'],
   enNotes:['Docs serve readers, not the author.','Reflect interface changes in docs first.'],
   conceptZh:'书面接口',conceptEn:'Written interface',conceptNoteZh:'多人共享同一套规则',conceptNoteEn:'One rule set, shared'},
  {title:'写清谁读、用来做什么',en:'Name the reader and purpose',seconds:19,
   script:['写文档前先回答：谁读，读完要做什么。','新同事需要启动步骤，测试者需要边界规则，用途不同写法也不同。','用途不清的文档，通常也不会有人读。'],
   enScript:['Before writing, answer who reads it and what they should do afterwards.','A newcomer needs setup steps; a tester needs boundary rules, so the form differs.','Docs with no clear purpose usually find no readers.'],
   notes:['一段文档只服务一类主要读者。','开头写清读者和用途。'],
   enNotes:['One passage serves one main reader.','State reader and purpose at the top.'],
   conceptZh:'读者与用途',conceptEn:'Reader and purpose',conceptNoteZh:'先定读者，再定写法',conceptNoteEn:'Reader first, form second'},
  {title:'例子比形容词有用',en:'Examples beat adjectives',seconds:19,
   script:['“接口要稳定”每个人理解都不一样。','“返回 200 或 404”可以照着验证。','好文档通常包含一个能跑起来的样例，以及一个反例。'],
   enScript:['People interpret “keep the API stable” differently.','“Return 200 or 404” can be verified directly.','Good docs usually include a runnable example and a counter-example.'],
   notes:['能用例子就不用形容词。','反例要说明为什么坏。'],
   enNotes:['Use an example instead of an adjective.','Explain why the counter-example is wrong.'],
   conceptZh:'可执行文档',conceptEn:'Executable docs',conceptNoteZh:'能照做并得到相同结果',conceptNoteEn:'Act and get the same result'},
  {title:'文档跟着代码更新',en:'Docs follow the code',seconds:19,
   script:['代码变了而文档没变，读者会被误导。','接口改动最好在同一次提交里更新文档。','定期检查过期内容，避免错误信息继续流传。'],
   enScript:['When code changes but docs do not, readers are misled.','Update docs in the same commit as the interface change.','Review stale content regularly so wrong information stops spreading.'],
   notes:['过期文档比没有文档更危险。','文档更新也进入评审范围。'],
   enNotes:['Stale docs are worse than none.','Include doc updates in review.'],
   conceptZh:'文档同步',conceptEn:'Docs in sync',conceptNoteZh:'代码与文档同一提交',conceptNoteEn:'Same commit, code and docs'},
 ].map((s,i)=>({...s,art:(p,lang)=>docsArt(i,p,lang)}))};

export const knowledgeHandoffLesson={...base,
 id:'knowledge-handoff',code:'1.3',courseId:'team-and-process',
 title:'交接与知识共享',titleEn:'Handoffs and shared knowledge',
 sceneTitle:'交接与知识共享',sceneTitleEn:'Handoffs and shared knowledge',
 audioManifest:courseAudio['knowledge-handoff'],
 steps:[
  {title:'交接不是丢文件',en:'A handoff is not a file dump',seconds:18,
   script:['把一堆文件交给别人，不等于完成交接。','交接要交出上下文：目标、当前状态、下一步和风险。','接手的人能独立判断，才算交接成功。'],
   enScript:['Handing over a pile of files is not a handoff.','A handoff transfers context: the goal, current state, next steps and risks.','Success means the next person can make decisions independently.'],
   notes:['交接要有接收方确认。','留下入口，而不只是文件。'],
   enNotes:['A handoff needs the receiver to confirm.','Leave entry points, not just files.'],
   conceptZh:'交接上下文',conceptEn:'Handoff context',conceptNoteZh:'目标、状态、下一步',conceptNoteEn:'Goal, state, next steps'},
  {title:'写下一步和风险',en:'Write next steps and risks',seconds:19,
   script:['下一步要拆成能独立开始的小项，并标明优先级。','风险要写清触发条件，而不只是“可能有风险”。','这样接手的人遇到情况时，知道该看哪一条。'],
   enScript:['Next steps should be small, startable items with priorities.','Risks need trigger conditions, not just “there may be risk”.','Then the next person knows which item to check when something happens.'],
   notes:['风险和下一步放在同一页。','每条风险写一个观察信号。'],
   enNotes:['Keep risks and next steps on one page.','Give each risk a signal to watch.'],
   conceptZh:'下一步与风险',conceptEn:'Next steps and risks',conceptNoteZh:'可开始的小项 + 触发条件',conceptNoteEn:'Startable items plus triggers'},
  {title:'让接手的人能复述',en:'Let them retell it',seconds:19,
   script:['交接结束后，请对方用自己的话复述目标、下一步和风险。','复述对不上，说明上下文还没交出去。','这一步花几分钟，可以省下后面几天。'],
   enScript:['After the handoff, ask the other person to restate the goal, next steps and risks in their own words.','If the retelling diverges, the context has not transferred.','A few minutes here can save days later.'],
   notes:['复述不是考试，是检查理解。','差异处当场补文档。'],
   enNotes:['Retelling is a check, not a test.','Fix the docs where the retelling diverges.'],
   conceptZh:'复述检查',conceptEn:'Retell check',conceptNoteZh:'用自己的话讲一遍',conceptNoteEn:'Explain it in their own words'},
  {title:'留下联系与记录',en:'Leave contacts and records',seconds:19,
   script:['知识不应只存在一个人的脑子里。','关键决定、负责人和查看入口要写下来，便于追溯。','记录越清楚，交接时间越短，团队越不依赖某个个人。'],
   enScript:['Knowledge should not live only in one person’s head.','Record key decisions, owners and where to look so they can be traced.','Clearer records shorten handoffs and make the team less dependent on one person.'],
   notes:['决定要记录时间和理由。','负责人变化时同步更新。'],
   enNotes:['Record when and why decisions were made.','Update records when ownership changes.'],
   conceptZh:'可追溯记录',conceptEn:'Traceable records',conceptNoteZh:'决定、负责人、入口',conceptNoteEn:'Decision, owner, entry point'},
 ].map((s,i)=>({...s,art:(p,lang)=>handoffArt(i,p,lang)}))};
