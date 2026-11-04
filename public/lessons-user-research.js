import courseAudio from './course-audio-manifest.js';
import {kit,frame} from './lesson-art-kit.js';

function interviewArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.face(104,96,'#bad7c2')}${k.text(104,186,'受访者','Interviewee',11,'#665e72','middle')}
  ${k.face(616,96,'#e9c58b')}${k.text(616,186,'你','You',11,'#665e72','middle')}
  ${k.speech(160,50,300,'上次预约时发生了什么？','What happened when you booked?','#fff4d4')}
  ${k.group(.36,k.speech(370,222,300,'我试了三次才成功','It took me three tries','#e7f2e7'))}
  ${k.group(.64,k.clock(360,152,'#7967ac'))}${k.text(384,157,'回到具体经历','Return to the actual event',11,'#665e72')}
  ${k.group(.84,k.chip(248,278,224,'问经历，不问看法','Ask about experience','#f3eef9'))}
  ${k.text(360,338,'具体经历比概括观点可靠','Concrete experience beats general opinion',11,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'避免诱导式问题','Avoid leading questions',14,'#242032','middle')}
  ${k.box(50,74,290,158,'#f9e8e2')}
  ${k.text(72,102,'诱导','Leading',12,'#a64e44')}
  ${k.no(90,136,'#b96559')}${k.text(116,141,'“你觉得这个功能好吧？”','“You like this, right?”',11,'#a64e44')}
  ${k.text(72,184,'答案已经被问题暗示','The question suggests the answer',10,'#665e72')}
  ${k.text(72,212,'听到的只是附和','You hear agreement',10,'#665e72')}
  ${k.path('M356 152H410')}
  ${k.box(424,74,248,158,'#e7f2e7')}
  ${k.text(446,102,'开放','Open',12,'#34734b')}
  ${k.ok(464,136)}${k.text(490,141,'“你上周怎么做的？”','“What did you do last week?”',11,'#34734b')}
  ${k.text(446,184,'让对方自己描述','Let them describe it',10,'#5c7a63')}
  ${k.text(446,212,'答案更接近真实','Answers come closer to reality',10,'#5c7a63')}
  ${k.text(360,272,'问题越开放，信息越具体','More open questions yield concrete detail',12,'#665e72','middle')}
  ${k.group(.8,k.warn(360,296,'#b58a1f')+k.text(384,301,'“为什么不”也要小心','Watch “why not” too',10,'#8a6a25'))}
 `;
 if(step===2)body=`
  ${k.text(360,44,'追问具体','Ask for specifics',14,'#242032','middle')}
  ${k.speech(50,70,260,'有时候会失败','Sometimes it fails','#fff4d4')}
  ${k.group(.24,k.path('M320 92H364'))}
  ${k.group(.36,k.speech(376,70,280,'哪一步失败？多久一次？','Which step? How often?','#fff4d4'))}
  ${k.group(.56,k.speech(50,190,260,'提交后页面没反应','After submitting, nothing happens','#e7f2e7'))}
  ${k.group(.72,k.path('M320 212H364'))}
  ${k.group(.8,k.speech(376,190,280,'当时在用什么设备？','What device were you on?','#f3eef9'))}
  ${k.clock(360,300)}${k.text(384,304,'时间、频率、步骤','Time, frequency, steps',10,'#66502a')}
  ${k.text(360,338,'追问把模糊变成可验证','Follow-ups turn vagueness into something testable',11,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.doc(60,64,'#fffefb',300,196)}
  ${k.text(80,92,'访谈记录','Interview notes',13)}
  ${k.group(.14,k.text(80,122,'原话：“三次才成功”','Quote: “three tries”',11,'#4a3a82'))}
  ${k.group(.3,k.text(80,152,'情境：手机、地铁','Context: phone, subway',11,'#665e72'))}
  ${k.group(.46,k.text(80,182,'频率：每周一次','Frequency: weekly',11,'#665e72'))}
  ${k.group(.62,k.text(80,212,'情绪：着急','Mood: rushed',11,'#665e72'))}
  ${k.group(.78,k.text(80,242,'推断：与网络有关？','Guess: network-related?',11,'#8a6a25'))}
  ${k.path('M374 160H430')}
  ${k.group(.5,k.box(442,74,226,176,'#e7f2e7')+k.text(464,102,'分开记录','Keep them separate',12,'#34734b')+k.ok(464,132)+k.text(488,137,'原话','Quote',11,'#34734b')+k.clock(464,170)+k.text(488,175,'情境','Context',11,'#8a6a25')+k.text(464,216,'推断要标出来','Mark inference',10,'#665e72'))}
  ${k.text(360,300,'原话是证据，推断是假设','Quotes are evidence; inferences are hypotheses',12,'#665e72','middle')}
  ${k.text(360,328,'记录要能在之后复核','Notes must be reviewable later',10,'#665e72','middle')}
 `;
 return frame(body,['用户访谈怎么问','How to run user interviews'],lang);
}

function observeArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.face(110,96,'#bad7c2')}${k.speech(146,42,270,'我觉得挺好用','I find it quite usable','#fff4d4')}
  ${k.text(110,182,'说法','What they say',11,'#665e72','middle')}
  ${k.group(.28,k.path('M150 228Q260 270 360 240','#7967ac',true))}
  ${k.group(.5,k.phone(320,214,0.7))}${k.text(349,316,'实际操作','Actual use',10,'#4a3a82','middle')}
  ${k.group(.7,k.warn(474,92)+k.text(498,97,'卡住了 26 秒','Stuck for 26 seconds',11,'#8a6a25'))}
  ${k.group(.84,k.clock(566,190)+k.text(566,238,'来回三次','Three back-and-forths',10,'#66502a','middle'))}
  ${k.text(360,338,'说得好用，不等于用得顺','Saying it is usable is not using it smoothly',12,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'到工作现场观察','Observe where the work happens',14,'#242032','middle')}
  ${k.box(46,68,628,160,'#f3eef9')}
  ${k.face(120,100,'#bad7c2')}${k.phone(200,90,0.6)}${k.text(152,190,'真实任务','Real task',10,'#4a3a82','middle')}
  ${k.group(.3,k.doc(300,94,'#fffefb',70,88)+k.text(335,200,'纸质步骤','Paper steps',10,'#665e72','middle'))}
  ${k.group(.5,k.face(470,100,'#e9c58b')+k.text(470,190,'同事协助','Colleague helps',10,'#665e72','middle'))}
  ${k.group(.7,k.clock(610,116)+k.text(610,166,'真实节奏','Real pace',10,'#66502a','middle'))}
  ${k.group(.84,k.lens(112,252)+k.text(136,256,'观察，不打扰','Watch without interrupting',11,'#34734b'))}
  ${k.text(360,300,'现场包含系统之外的步骤','The field includes steps outside the system',12,'#665e72','middle')}
  ${k.text(360,328,'纸质表格、口头交接都是真实流程','Paper forms and verbal handoffs are real workflow',10,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.text(360,44,'记录步骤与卡点','Record steps and blockers',14,'#242032','middle')}
  ${k.text(72,84,'1','1',12,'#665e72','middle')}${k.text(110,84,'扫码进入','Scan to enter',11)}${k.group(.14,k.ok(300,84))}
  ${k.text(72,124,'2','2',12,'#665e72','middle')}${k.text(110,124,'选择日期','Choose date',11)}${k.group(.3,k.ok(300,124))}
  ${k.text(72,164,'3','3',12,'#665e72','middle')}${k.text(110,164,'填写手机号','Enter phone number',11)}${k.group(.46,k.warn(300,164,'#b58a1f'))}
  ${k.group(.62,k.chip(340,144,200,'这里停了 40 秒','Paused 40 seconds','#f9e8e2'))}
  ${k.text(72,204,'4','4',12,'#665e72','middle')}${k.text(110,204,'确认提交','Confirm submit',11)}${k.group(.72,k.ok(300,204))}
  ${k.text(72,244,'5','5',12,'#665e72','middle')}${k.text(110,244,'收到通知','Receive notice',11)}${k.group(.82,k.warn(300,244,'#b58a1f'))}
  ${k.group(.88,k.chip(340,224,220,'又去查邮箱','Checks email again','#fff4d4'))}
  ${k.text(360,298,'卡点用时间与动作描述','Describe blockers by time and action',12,'#665e72','middle')}
  ${k.text(360,326,'不要急着解释原因','Do not rush to explain the cause',10,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.text(360,44,'说法与行为不一致','Words and behaviour diverge',14,'#242032','middle')}
  ${k.box(48,74,286,164,'#f9e8e2')}
  ${k.text(70,102,'说法','What they say',12,'#a64e44')}
  ${k.text(70,136,'“我不需要提醒”','“I do not need reminders”',11,'#a64e44')}
  ${k.text(70,180,'但每天手动检查两次','Yet checks twice a day',11,'#665e72')}
  ${k.text(70,210,'说明担心漏掉','Suggests fear of missing',10,'#665e72')}
  ${k.path('M356 156H410')}
  ${k.box(424,74,248,164,'#e7f2e7')}
  ${k.text(446,102,'行为','Behaviour',12,'#34734b')}
  ${k.clock(478,136)}${k.text(502,141,'每天 9:00 与 15:00','9:00 and 15:00 daily',11,'#34734b')}
  ${k.text(446,184,'真实需求可能是安心','The real need may be reassurance',10,'#5c7a63')}
  ${k.text(446,212,'去问，不要假设','Ask rather than assume',10,'#5c7a63')}
  ${k.text(360,266,'行为往往比说法更诚实','Behaviour is often more honest than words',12,'#665e72','middle')}
  ${k.group(.78,k.chip(230,286,260,'把差异写进发现','Write the gap into findings','#fff4d4'))}
  ${k.text(360,344,'不一致的地方最值得研究','Divergence is where research pays off',10,'#665e72','middle')}
 `;
 return frame(body,['观察行为，而不是意见','Observe behaviour, not opinions'],lang);
}

function surveyArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.text(360,42,'问卷适合回答什么','What surveys answer',14,'#242032','middle')}
  ${k.box(46,68,300,192,'#e7f2e7')}
  ${k.text(68,96,'适合','Good for',12,'#34734b')}
  ${k.group(.2,k.ok(68,124)+k.text(92,129,'多少人遇到','How many face it',11,'#34734b'))}
  ${k.group(.36,k.ok(68,160)+k.text(92,165,'分布与比例','Distribution',11,'#34734b'))}
  ${k.group(.52,k.ok(68,196)+k.text(92,201,'偏好排序','Ranking',11,'#34734b'))}
  ${k.text(68,234,'范围与数量','Scale and counts',10,'#5c7a63')}
  ${k.path('M356 162H410')}
  ${k.box(424,68,246,192,'#f9e8e2')}
  ${k.text(446,96,'不适合','Poor for',12,'#a64e44')}
  ${k.group(.46,k.no(446,124,'#b96559')+k.text(470,129,'为什么','Why',11,'#b96559'))}
  ${k.group(.62,k.no(446,160,'#b96559')+k.text(470,165,'怎么操作','How they work',11,'#b96559'))}
  ${k.group(.78,k.no(446,196,'#b96559')+k.text(470,201,'意外情况','Unexpected cases',11,'#b96559'))}
  ${k.text(446,238,'这些交给访谈和观察','Leave these to interviews',10,'#665e72')}
  ${k.text(360,300,'先想清楚问题，再选方法','Choose the method after the question',12,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'问题要封闭、可比较','Make questions closed and comparable',14,'#242032','middle')}
  ${k.box(50,74,290,166,'#f9e8e2')}
  ${k.text(72,102,'难以统计','Hard to count',12,'#a64e44')}
  ${k.no(90,136,'#b96559')}${k.text(116,141,'“你觉得怎么样？”','“How do you feel?”',11,'#a64e44')}
  ${k.text(72,182,'答案五花八门','Answers do not align',10,'#665e72')}
  ${k.text(72,210,'无法比较','No comparison',10,'#665e72')}
  ${k.path('M356 156H410')}
  ${k.box(424,74,248,166,'#e7f2e7')}
  ${k.text(446,102,'可以统计','Countable',12,'#34734b')}
  ${k.group(.4,k.chip(446,124,214,'从未 / 偶尔 / 经常','Never, sometimes, often','#fffefb',11))}
  ${k.group(.58,k.chip(446,172,214,'每周次数：0 1 2–3 4+','Times per week: 0 1 2–3 4+','#fffefb',10))}
  ${k.text(446,222,'选项要互不重叠','Options must not overlap',10,'#5c7a63')}
  ${k.text(360,286,'好问题让不同人给出同一种格式','Good questions produce one format',12,'#665e72','middle')}
  ${k.group(.8,k.warn(360,310,'#b58a1f')+k.text(384,315,'避免双管问题','Avoid double-barrelled questions',10,'#8a6a25'))}
 `;
 if(step===2)body=`
  ${k.text(360,44,'样本代表谁','Who does the sample represent',14,'#242032','middle')}
  ${k.box(48,72,290,176,'#f9e8e2')}
  ${k.text(70,100,'只问了群里的人','Asked only the group chat',11,'#a64e44')}
  ${[0,1,2,3].map(i=>`<circle cx="${96+i*44}" cy="146" r="15" fill="#e9c58b" stroke="#292535" stroke-width="2"/>`).join('')}
  ${k.text(70,196,'都是活跃用户','All active users',10,'#665e72')}
  ${k.text(70,224,'看不到沉默的人','The silent are invisible',10,'#665e72')}
  ${k.path('M356 160H410')}
  ${k.box(424,72,248,176,'#e7f2e7')}
  ${k.text(446,100,'覆盖不同人群','Cover different groups',11,'#34734b')}
  ${[0,1,2,3].map(i=>`<circle cx="${470+i*46}" cy="146" r="15" fill="${['#bad7c2','#e9c58b','#c8b8e5','#9ec6cf'][i]}" stroke="#292535" stroke-width="2"/>`).join('')}
  ${k.text(446,196,'新用户、流失用户','New and lapsed users',10,'#5c7a63')}
  ${k.text(446,224,'以及不使用的人','And those who opt out',10,'#5c7a63')}
  ${k.text(360,278,'样本决定了你能说什么','The sample limits what you can claim',12,'#665e72','middle')}
  ${k.group(.8,k.chip(230,278,260,'说清谁没有回答','Name who did not answer','#fff4d4'))}
  ${k.text(360,344,'沉默本身就是发现','Silence is a finding too',10,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.text(360,44,'结果怎么读','How to read the results',14,'#242032','middle')}
  ${k.box(52,74,286,166,'#fffefb')}
  ${k.text(74,102,'数据','Data',12)}
  ${k.group(.18,k.text(74,132,'68% 每周至少一次','68% weekly or more',11,'#4a3a82'))}
  ${k.group(.32,k.text(74,162,'样本 42 人','Sample of 42',11,'#665e72'))}
  ${k.group(.46,k.text(74,192,'来自两个学院','From two faculties',11,'#665e72'))}
  ${k.group(.6,k.text(74,222,'不能代表全校','Not the whole university',11,'#a64e44'))}
  ${k.path('M356 156H410')}
  ${k.box(424,74,248,166,'#e7f2e7')}
  ${k.text(446,102,'结论','Conclusion',12,'#34734b')}
  ${k.group(.4,k.ok(446,130)+k.text(470,135,'这两个学院成立','True for these faculties',11,'#34734b'))}
  ${k.group(.56,k.warn(446,166,'#b58a1f')+k.text(470,171,'全校还需验证','Whole university needs checking',11,'#8a6a25'))}
  ${k.text(446,206,'结论要跟着样本走','Conclusions follow the sample',10,'#5c7a63')}
  ${k.text(360,286,'不要从局部数据推整体','Do not generalise from a partial sample',12,'#665e72','middle')}
  ${k.group(.82,k.clock(360,310)+k.text(384,314,'复测可以扩大范围','Retest to widen the range',10,'#66502a'))}
 `;
 return frame(body,['问卷与样本','Surveys and samples'],lang);
}

function dataArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.text(360,42,'数据回答什么','What data answers',14,'#242032','middle')}
  ${k.box(46,68,300,192,'#e7f2e7')}
  ${k.text(68,96,'数据能说','Data can show',12,'#34734b')}
  ${k.group(.2,k.ok(68,124)+k.text(92,129,'多少人做了某事','How many did something',11,'#34734b'))}
  ${k.group(.36,k.ok(68,160)+k.text(92,165,'在什么时间','At what time',11,'#34734b'))}
  ${k.group(.52,k.ok(68,196)+k.text(92,201,'变化趋势','Trends',11,'#34734b'))}
  ${k.text(68,234,'行为与规模','Behaviour and scale',10,'#5c7a63')}
  ${k.path('M356 162H410')}
  ${k.box(424,68,246,192,'#f9e8e2')}
  ${k.text(446,96,'数据说不出','Data cannot say',12,'#a64e44')}
  ${k.group(.46,k.no(446,124,'#b96559')+k.text(470,129,'为什么','Why',11,'#b96559'))}
  ${k.group(.62,k.no(446,160,'#b96559')+k.text(470,165,'感受如何','How it felt',11,'#b96559'))}
  ${k.group(.78,k.no(446,196,'#b96559')+k.text(470,201,'他们想要什么','What they want',11,'#b96559'))}
  ${k.text(446,238,'这些需要访谈补充','These need interviews',10,'#665e72')}
  ${k.text(360,300,'数据指出规模，不解释原因','Data shows scale, not reasons',12,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'指标要有定义','Metrics need definitions',14,'#242032','middle')}
  ${k.box(50,72,290,176,'#f9e8e2')}
  ${k.text(72,100,'“活跃用户”','“Active users”',12,'#a64e44')}
  ${k.no(90,134,'#b96559')}${k.text(116,139,'没有定义','Undefined',12,'#a64e44')}
  ${k.text(72,182,'登录算吗？','Does logging in count?',11,'#665e72')}
  ${k.text(72,210,'停留多久算？','How long counts?',11,'#665e72')}
  ${k.text(72,238,'两个人算法不同','Two people count differently',10,'#a64e44')}
  ${k.path('M356 158H410')}
  ${k.box(424,72,248,176,'#e7f2e7')}
  ${k.text(446,100,'写清口径','Write the definition',12,'#34734b')}
  ${k.group(.4,k.ok(446,130)+k.text(470,135,'至少完成一次预约','Completed one booking',11,'#34734b'))}
  ${k.group(.56,k.ok(446,166)+k.text(470,171,'统计窗口 7 天','7-day window',11,'#34734b'))}
  ${k.group(.72,k.ok(446,202)+k.text(470,207,'排除测试账号','Exclude test accounts',11,'#34734b'))}
  ${k.text(446,240,'口径改变，数字不可比','Change the definition, lose comparability',10,'#5c7a63')}
  ${k.text(360,286,'先定义，再测量','Define before measuring',12,'#665e72','middle')}
  ${k.group(.84,k.clock(360,310)+k.text(384,314,'口径变更要记录','Record definition changes',10,'#66502a'))}
 `;
 if(step===2)body=`
  ${k.text(360,44,'相关不等于因果','Correlation is not causation',14,'#242032','middle')}
  <path d="M70 240H650" stroke="#a49ab8" stroke-width="3"/>
  <path d="M70 120H650" stroke="#a49ab8" stroke-width="3"/>
  <path d="M100 200L170 188L240 176L310 152L380 140L450 122L520 112L590 96" fill="none" stroke="#7967ac" stroke-width="3" stroke-linecap="round"/>
  <path d="M100 210L170 196L240 204L310 168L380 176L450 138L520 150L590 116" fill="none" stroke="#34734b" stroke-width="3" stroke-dasharray="7 6" stroke-linecap="round"/>
  ${k.text(596,86,'A','A',12,'#7967ac','middle')}${k.text(596,132,'B','B',12,'#34734b','middle')}
  ${k.group(.42,k.chip(96,72,250,'两条线一起上升','Both lines rise together','#fff4d4'))}
  ${k.group(.62,k.warn(430,150,'#b58a1f')+k.text(454,155,'可能有第三个原因','A third factor may exist',11,'#8a6a25'))}
  ${k.group(.8,k.clock(160,278)+k.text(184,282,'时间先后只是线索','Order in time is only a clue',11,'#66502a'))}
  ${k.text(360,320,'要说明因果，需要额外证据','Causal claims need extra evidence',12,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.text(360,44,'数据要放进情境','Put data in context',14,'#242032','middle')}
  ${k.box(48,72,286,168,'#fffefb')}
  ${k.text(70,100,'数字','Numbers',12)}
  ${k.group(.18,k.text(70,132,'完成率 61%','61% completion',13,'#4a3a82'))}
  ${k.group(.36,k.text(70,166,'上周 74%','74% last week',11,'#665e72'))}
  ${k.group(.52,k.text(70,198,'本周新增考试周','Exam week began',11,'#8a6a25'))}
  ${k.group(.68,k.text(70,228,'网络也更拥挤','Network is busier too',11,'#665e72'))}
  ${k.path('M356 156H410')}
  ${k.box(424,72,248,168,'#e7f2e7')}
  ${k.text(446,100,'情境解释波动','Context explains the shift',12,'#34734b')}
  ${k.group(.44,k.ok(446,130)+k.text(470,135,'考试周时间少','Less time in exam week',11,'#34734b'))}
  ${k.group(.6,k.ok(446,166)+k.text(470,171,'网络质量下降','Network quality fell',11,'#34734b'))}
  ${k.text(446,206,'多个因素一起看','Look at factors together',10,'#5c7a63')}
  ${k.text(360,266,'脱离情境的数字会误导','Numbers without context mislead',12,'#665e72','middle')}
  ${k.group(.82,k.chip(230,286,260,'把时间线与事件对齐','Align timeline with events','#fff4d4'))}
  ${k.text(360,346,'再决定是否干预','Then decide whether to intervene',10,'#665e72','middle')}
 `;
 return frame(body,['用数据支撑判断','Use data as evidence'],lang);
}

function synthesisArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.text(360,42,'发现不是洞察','Findings are not insight',14,'#242032','middle')}
  ${k.box(46,68,300,192,'#fff4d4')}
  ${k.text(68,96,'发现','Findings',12,'#8a6a25')}
  ${k.group(.2,k.text(68,126,'· 6 人提到验证码','· 6 mention captcha',11,'#665e72'))}
  ${k.group(.34,k.text(68,156,'· 3 人在地铁里用','· 3 use on the subway',11,'#665e72'))}
  ${k.group(.48,k.text(68,186,'· 2 人重复提交','· 2 submit twice',11,'#665e72'))}
  ${k.text(68,224,'零散的事实','Scattered facts',10,'#8a6a25')}
  ${k.path('M356 162H410')}
  ${k.box(424,68,246,192,'#e7f2e7')}
  ${k.text(446,96,'洞察','Insight',12,'#34734b')}
  ${k.group(.5,k.ok(446,130)+k.text(470,135,'移动网络下','On mobile networks',11,'#34734b'))}
  ${k.group(.64,k.text(470,166,'验证步骤成为瓶颈','verification is the bottleneck',11,'#34734b'))}
  ${k.group(.78,k.text(446,204,'因此有人放弃或重试','So people give up or retry',10,'#5c7a63'))}
  ${k.text(360,282,'洞察解释多个发现','An insight explains several findings',12,'#665e72','middle')}
  ${k.group(.84,k.chip(240,302,240,'从事实到解释','From facts to explanation','#f3eef9'))}
 `;
 if(step===1)body=`
  ${k.text(360,44,'先归组，再解释','Group first, then explain',14,'#242032','middle')}
  ${k.box(42,72,184,168,'#f3eef9')}${k.text(64,100,'网络与速度','Network and speed',11,'#4a3a82')}${k.group(.2,k.text(64,130,'· 地铁','· Subway',10,'#665e72')+k.text(64,154,'· 弱信号','· Weak signal',10,'#665e72')+k.text(64,178,'· 超时','· Timeouts',10,'#665e72'))}
  ${k.box(256,72,184,168,'#fff4d4')}${k.text(278,100,'验证步骤','Verification',11,'#8a6a25')}${k.group(.36,k.text(278,130,'· 验证码','· Captcha',10,'#665e72')+k.text(278,154,'· 短信延迟','· SMS delay',10,'#665e72')+k.text(278,178,'· 反复重填','· Retype',10,'#665e72'))}
  ${k.box(470,72,184,168,'#e7f2e7')}${k.text(492,100,'重复操作','Repeated actions',11,'#34734b')}${k.group(.52,k.text(492,130,'· 提交两次','· Submit twice',10,'#665e72')+k.text(492,154,'· 检查邮箱','· Check email',10,'#665e72')+k.text(492,178,'· 手动记录','· Note by hand',10,'#665e72'))}
  ${k.group(.7,k.chip(200,262,320,'同一组里找共同点','Find the common thread in each group','#f9e8e2'))}
  ${k.text(360,326,'归组把零散观察压缩成主题','Grouping compresses observations into themes',12,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.text(360,44,'找模式与反例','Look for patterns and counter-examples',14,'#242032','middle')}
  ${k.box(48,74,296,160,'#e7f2e7')}
  ${k.text(70,102,'模式','Pattern',12,'#34734b')}
  ${k.group(.2,k.ok(70,130)+k.text(94,135,'多人都在验证处停下','Many stop at verification',11,'#34734b'))}
  ${k.group(.36,k.ok(70,164)+k.text(94,169,'移动端更常放弃','Mobile users give up more',11,'#34734b'))}
  ${k.group(.52,k.ok(70,198)+k.text(94,203,'重试集中在午后','Retries cluster after noon',11,'#34734b'))}
  ${k.text(70,232,'重复出现的线索','Recurring threads',10,'#5c7a63')}
  ${k.path('M358 154H410')}
  ${k.box(424,74,248,160,'#f9e8e2')}
  ${k.text(446,102,'反例','Counter-example',12,'#a64e44')}
  ${k.group(.4,k.warn(446,130,'#b58a1f')+k.text(470,135,'2 人在电脑上顺畅','2 had no trouble on desktop',11,'#8a6a25'))}
  ${k.group(.56,k.text(446,168,'反例说明条件重要','Counter-examples show conditions matter',10,'#665e72'))}
  ${k.group(.72,k.text(446,198,'也防止过度概括','And prevent over-generalising',10,'#665e72'))}
  ${k.text(360,280,'模式给出方向，反例给出边界','Patterns give direction; counter-examples give limits',12,'#665e72','middle')}
  ${k.group(.82,k.clock(360,306)+k.text(384,310,'反例要主动去找','Seek counter-examples actively',10,'#66502a'))}
 `;
 if(step===3)body=`
  ${k.doc(52,58,'#fffefb',320,210)}
  ${k.text(72,86,'洞察陈述','Insight statement',13)}
  ${k.group(.14,k.text(72,118,'在移动网络下，','On mobile networks,',11,'#4a3a82'))}
  ${k.group(.3,k.text(72,148,'验证步骤导致放弃或重试，','verification causes give-ups or retries,',11,'#4a3a82'))}
  ${k.group(.46,k.text(72,178,'因为等待时间不可见。','because the wait is invisible.',11,'#4a3a82'))}
  ${k.group(.62,k.text(72,212,'依据：6 条访谈 + 数据','Evidence: 6 interviews + data',10,'#665e72'))}
  ${k.group(.78,k.text(72,242,'反例：电脑端用户','Counter-example: desktop users',10,'#a64e44'))}
  ${k.path('M386 158H436')}
  ${k.box(448,74,224,180,'#e7f2e7')}
  ${k.text(470,102,'可验证','Testable',12,'#34734b')}
  ${k.group(.44,k.ok(470,130)+k.text(494,135,'能预测下一步','Predicts a next step',11,'#34734b'))}
  ${k.group(.6,k.ok(470,166)+k.text(494,171,'能设计实验','Can design a test',11,'#34734b'))}
  ${k.group(.76,k.ok(470,202)+k.text(494,207,'能说明反例','Explains counter-cases',11,'#34734b'))}
  ${k.text(360,300,'好洞察能被验证，也能被推翻','A good insight can be tested and disproved',12,'#665e72','middle')}
  ${k.text(360,328,'写清依据，别人才敢相信','State the evidence so others can trust it',10,'#665e72','middle')}
 `;
 return frame(body,['从发现到洞察','From findings to insight'],lang);
}

const base={section:'03 产品与协作技能',sectionEn:'03 PRODUCT AND PEOPLE SKILLS',position:'03 · 用户研究',positionEn:'03 · User research',audio:true};

export const userInterviewsLesson={...base,
 id:'user-interviews',code:'3.2',courseId:'user-research',
 title:'用户访谈怎么问',titleEn:'How to run user interviews',
 sceneTitle:'用户访谈怎么问',sceneTitleEn:'How to run user interviews',
 audioManifest:courseAudio['user-interviews'],
 steps:[
  {title:'问经历，不问看法',en:'Ask about experience',seconds:18,
   script:['问“你觉得这个功能如何”，得到的往往是礼貌的评价。','请对方回忆一次真实经历：当时在做什么，卡在哪里。','具体经历比概括观点更接近真实需求。'],
   enScript:['Asking “what do you think of this feature” often returns polite opinions.','Ask them to recall a real occasion: what they were doing and where they got stuck.','Concrete experience is closer to real needs than general opinion.'],
   notes:['让对方讲故事，而不是评价。','问“上一次”而不是“一般”。'],
   enNotes:['Ask for stories, not evaluations.','Ask “last time” rather than “usually”.'],
   conceptZh:'真实经历',conceptEn:'Actual experience',conceptNoteZh:'当时在做什么',conceptNoteEn:'What they were doing'},
  {title:'避免诱导式问题',en:'Avoid leading questions',seconds:19,
   script:['“你觉得这个功能好吧”已经把答案暗示给受访者。','诱导式问题容易收到附和，却学不到真实想法。','用开放问题让对方自己描述，例如“上周你是怎么做的”。'],
   enScript:['“You like this feature, right?” already suggests the answer.','Leading questions invite agreement but teach you little.','Use open questions so people describe it themselves, such as “How did you do it last week?”'],
   notes:['问题和选项都要中性。','不要替受访者下结论。'],
   enNotes:['Keep questions and options neutral.','Do not conclude for the interviewee.'],
   conceptZh:'开放问题',conceptEn:'Open question',conceptNoteZh:'不暗示答案',conceptNoteEn:'No suggested answer'},
  {title:'追问具体',en:'Ask for specifics',seconds:19,
   script:['当对方说“有时候会失败”，要追问哪一步、多久一次、在什么设备上。','具体的时间、频率和步骤，才能变成可验证的线索。','追问不是怀疑，而是帮助对方把经历说清楚。'],
   enScript:['When someone says “it sometimes fails”, ask which step, how often and on what device.','Concrete time, frequency and steps turn a vague remark into a testable clue.','Follow-ups are not doubt; they help the person explain clearly.'],
   notes:['每句概括至少追一问。','记下原话，不要急着归纳。'],
   enNotes:['Follow up every generalisation at least once.','Note the words before generalising.'],
   conceptZh:'追问',conceptEn:'Follow-up',conceptNoteZh:'哪一步、多久、什么设备',conceptNoteEn:'Which step, how often, what device'},
  {title:'记录原话与情境',en:'Record quotes and context',seconds:19,
   script:['访谈记录要分开写原话、情境和推断。','原话是证据，情境帮助理解，推断是待验证的假设。','把三者混在一起，后来的人会误把猜测当成事实。'],
   enScript:['Interview notes should separate quotes, context and inference.','Quotes are evidence, context helps interpretation and inference is a hypothesis.','Mixing them makes later readers mistake guesses for facts.'],
   notes:['引用要保留原话。','推断要标明是推断。'],
   enNotes:['Keep quotes verbatim.','Label inferences as inferences.'],
   conceptZh:'证据与假设',conceptEn:'Evidence and hypothesis',conceptNoteZh:'原话、情境、推断分开',conceptNoteEn:'Quote, context, inference apart'},
 ].map((s,i)=>({...s,art:(p,lang)=>interviewArt(i,p,lang)}))};

export const observeBehaviourLesson={...base,
 id:'observe-behaviour',code:'3.2',courseId:'user-research',
 title:'观察行为，而不是意见',titleEn:'Observe behaviour, not opinions',
 sceneTitle:'观察行为，而不是意见',sceneTitleEn:'Observe behaviour, not opinions',
 audioManifest:courseAudio['observe-behaviour'],
 steps:[
  {title:'说得好用，不等于用得顺',en:'Saying it is usable is not using it',seconds:18,
   script:['用户可能在访谈里说“挺好用”，实际操作时却卡住很久。','意见经过整理和礼貌过滤，行为更接近真实。','观察能补充访谈看不到的停顿、绕路和重复。'],
   enScript:['A user may say “it works fine” in an interview yet get stuck for a long time in practice.','Opinions pass through tidying and politeness; behaviour is closer to reality.','Observation reveals pauses, detours and repetition that interviews miss.'],
   notes:['访谈与观察结合使用。','以行为作为判断依据。'],
   enNotes:['Combine interviews with observation.','Ground judgement in behaviour.'],
   conceptZh:'行为证据',conceptEn:'Behavioural evidence',conceptNoteZh:'停顿、绕路、重复',conceptNoteEn:'Pauses, detours, repetition'},
  {title:'到工作现场观察',en:'Observe where work happens',seconds:19,
   script:['真实流程往往包含系统之外的步骤：纸质表格、口头交接、同事协助。','只在会议室里问，会漏掉这些真实条件。','到现场观察，能看到系统之外但影响任务的因素。'],
   enScript:['Real workflows include steps outside the system: paper forms, verbal handoffs, colleague help.','Asking only in a meeting room misses these real conditions.','Observing on site reveals factors outside the system that affect the task.'],
   notes:['观察时尽量不打扰。','记录环境与工具。'],
   enNotes:['Interfere as little as possible.','Record environment and tools.'],
   conceptZh:'现场观察',conceptEn:'Field observation',conceptNoteZh:'系统之外的步骤',conceptNoteEn:'Steps outside the system'},
  {title:'记录步骤与卡点',en:'Record steps and blockers',seconds:19,
   script:['把任务拆成步骤，记录每一步的耗时与动作。','卡点用时间和动作描述，而不是急着解释原因。','这些记录能直接变成设计或测试的输入。'],
   enScript:['Break the task into steps and record the time and action at each one.','Describe blockers by time and action instead of rushing to explain causes.','These records become direct input for design or testing.'],
   notes:['卡点记录包括停顿时间。','不要边观察边下结论。'],
   enNotes:['Include pause duration in blocker notes.','Do not conclude while observing.'],
   conceptZh:'步骤与卡点',conceptEn:'Steps and blockers',conceptNoteZh:'时间与动作',conceptNoteEn:'Time and action'},
  {title:'说法与行为不一致',en:'Words and behaviour diverge',seconds:19,
   script:['有人说“我不需要提醒”，却每天手动检查两次。','说法与行为的差异，往往指向未被说出的担心。','不要替对方解释，把差异记录成待研究的问题。'],
   enScript:['Someone says “I do not need reminders” yet checks twice a day by hand.','Gaps between words and behaviour often point to unspoken concerns.','Do not explain it for them; record the gap as a question to study.'],
   notes:['差异是最有价值的发现。','用追问确认，而不是猜测。'],
   enNotes:['Divergence is among the most valuable findings.','Confirm with follow-up questions, not guesses.'],
   conceptZh:'行为差异',conceptEn:'Behaviour gap',conceptNoteZh:'说的与做的不一致',conceptNoteEn:'Said vs done'},
 ].map((s,i)=>({...s,art:(p,lang)=>observeArt(i,p,lang)}))};

export const surveyEvidenceLesson={...base,
 id:'survey-evidence',code:'3.2',courseId:'user-research',
 title:'问卷与样本',titleEn:'Surveys and samples',
 sceneTitle:'问卷与样本',sceneTitleEn:'Surveys and samples',
 audioManifest:courseAudio['survey-evidence'],
 steps:[
  {title:'问卷适合回答什么',en:'What surveys answer',seconds:18,
   script:['问卷擅长回答“多少人遇到”“比例多少”“如何排序”。','“为什么”和“怎么操作”需要访谈和观察。','先想清楚问题，再选择方法。'],
   enScript:['Surveys are good at how many, what proportion and how people rank things.','Why and how they work require interviews and observation.','Choose the method after the question is clear.'],
   notes:['问卷负责规模，访谈负责原因。','不要用问卷替代探索。'],
   enNotes:['Surveys measure scale; interviews explain causes.','Do not use surveys as a substitute for exploration.'],
   conceptZh:'方法与问题',conceptEn:'Method and question',conceptNoteZh:'规模用问卷，原因用访谈',conceptNoteEn:'Scale by survey, reason by interview'},
  {title:'问题要封闭、可比较',en:'Make questions closed and comparable',seconds:19,
   script:['“你觉得怎么样”会收到五花八门的答案，无法统计。','把问题改成有限选项，例如从未、偶尔、经常。','选项要互不重叠，覆盖常见情况，并留出“其他”。'],
   enScript:['“How do you feel” returns a wide range of answers that cannot be counted.','Turn it into bounded options such as never, sometimes, often.','Options should not overlap, cover common cases and include “other”.'],
   notes:['避免双管问题。','问题数量和长度要克制。'],
   enNotes:['Avoid double-barrelled questions.','Keep the number and length restrained.'],
   conceptZh:'可统计问题',conceptEn:'Countable question',conceptNoteZh:'有限选项，互不重叠',conceptNoteEn:'Bounded, non-overlapping options'},
  {title:'样本代表谁',en:'Who the sample represents',seconds:19,
   script:['只问活跃群里的用户，会看不到沉默和流失的人。','样本决定了你能说什么，也决定了你不能说什么。','主动覆盖新用户、流失用户和不使用者。'],
   enScript:['Asking only active group members hides silent and lapsed users.','The sample limits what you can claim, and what you cannot.','Actively include new users, lapsed users and non-users.'],
   notes:['说明谁没有回答。','样本小就少下结论。'],
   enNotes:['Say who did not answer.','Make fewer claims from small samples.'],
   conceptZh:'样本代表',conceptEn:'Sample representation',conceptNoteZh:'沉默的人也要被看见',conceptNoteEn:'Include the silent'},
  {title:'结果怎么读',en:'How to read results',seconds:19,
   script:['68% 的受访者每周至少使用一次，但样本只有两个学院的 42 人。','这个结论对这两个学院成立，不能直接推及全校。','结论要跟着样本走，并说明范围。'],
   enScript:['68% of respondents use it weekly, but the sample is 42 people from two faculties.','The conclusion holds for those faculties and does not extend automatically to the university.','Conclusions follow the sample; state the scope.'],
   notes:['报告写清样本与限制。','复测可以扩大范围。'],
   enNotes:['Report sample size and limits.','Retest to widen the scope.'],
   conceptZh:'结论范围',conceptEn:'Scope of conclusion',conceptNoteZh:'结论跟着样本走',conceptNoteEn:'Conclusions follow the sample'},
 ].map((s,i)=>({...s,art:(p,lang)=>surveyArt(i,p,lang)}))};

export const dataEvidenceLesson={...base,
 id:'data-as-evidence',code:'3.2',courseId:'user-research',
 title:'用数据支撑判断',titleEn:'Use data as evidence',
 sceneTitle:'用数据支撑判断',sceneTitleEn:'Use data as evidence',
 audioManifest:courseAudio['data-as-evidence'],
 steps:[
  {title:'数据回答什么',en:'What data answers',seconds:18,
   script:['数据能说明多少人做了什么、在什么时间、变化趋势如何。','数据通常说不清为什么，也说不出感受和期望。','数据指出规模，访谈解释原因。'],
   enScript:['Data shows how many did something, when and in what trend.','Data usually cannot explain why, nor capture feelings and expectations.','Data measures scale; interviews explain reasons.'],
   notes:['先问数据能回答什么。','不要用数字代替解释。'],
   enNotes:['Ask what the data can answer.','Do not let numbers replace explanation.'],
   conceptZh:'数据边界',conceptEn:'Limits of data',conceptNoteZh:'规模与时间',conceptNoteEn:'Scale and time'},
  {title:'指标要有定义',en:'Metrics need definitions',seconds:19,
   script:['“活跃用户”如果没有定义，两个人会算出两个数字。','写清什么算一次、统计窗口多长、排除哪些账号。','口径改变时，数字之间不再可比。'],
   enScript:['Without a definition, two people compute two different “active user” counts.','Define what counts, the time window and which accounts to exclude.','When the definition changes, numbers stop being comparable.'],
   notes:['口径写在指标旁边。','口径变更要记录。'],
   enNotes:['Write the definition beside the metric.','Record changes to definitions.'],
   conceptZh:'指标口径',conceptEn:'Metric definition',conceptNoteZh:'什么算、窗口、排除项',conceptNoteEn:'What counts, window, exclusions'},
  {title:'相关不等于因果',en:'Correlation is not causation',seconds:19,
   script:['两个指标一起上升，不代表一个导致了另一个。','可能存在第三个因素，或者只是时间上的巧合。','要说明因果，需要更多证据，例如对照或实验。'],
   enScript:['Two metrics rising together does not mean one caused the other.','A third factor may exist, or it may be coincidence in time.','Causal claims need more evidence, such as comparison or experiments.'],
   notes:['先问有没有共同原因。','因果结论要特别谨慎。'],
   enNotes:['Ask whether a common cause exists.','Be especially careful with causal claims.'],
   conceptZh:'相关与因果',conceptEn:'Correlation vs causation',conceptNoteZh:'共同原因与时间巧合',conceptNoteEn:'Common cause and timing'},
  {title:'数据要放进情境',en:'Put data in context',seconds:19,
   script:['完成率从 74% 降到 61%，可能因为考试周时间少、网络更拥挤。','只看数字会误以为是产品变差。','把时间线与事件对齐，再决定是否干预。'],
   enScript:['Completion fell from 74% to 61%, possibly because exam week left less time and the network was busier.','Reading the number alone suggests the product got worse.','Align the timeline with events before deciding whether to intervene.'],
   notes:['数字旁边放情境说明。','多个因素一起看。'],
   enNotes:['Put context beside the number.','Look at factors together.'],
   conceptZh:'数据情境',conceptEn:'Data in context',conceptNoteZh:'时间线与事件',conceptNoteEn:'Timeline and events'},
 ].map((s,i)=>({...s,art:(p,lang)=>dataArt(i,p,lang)}))};

export const synthesiseFindingsLesson={...base,
 id:'synthesise-findings',code:'3.2',courseId:'user-research',
 title:'从发现到洞察',titleEn:'From findings to insight',
 sceneTitle:'从发现到洞察',sceneTitleEn:'From findings to insight',
 audioManifest:courseAudio['synthesise-findings'],
 steps:[
  {title:'发现不是洞察',en:'Findings are not insight',seconds:18,
   script:['“六个人提到验证码”是发现，不是洞察。','洞察要解释多个发现之间的关系，例如移动网络下验证成为瓶颈。','从事实到解释，需要归纳和判断。'],
   enScript:['“Six people mentioned the captcha” is a finding, not an insight.','An insight explains how several findings relate, such as verification bottlenecking on mobile networks.','Moving from facts to explanation needs synthesis and judgement.'],
   notes:['发现描述现象，洞察解释原因。','一条洞察通常能解释多个发现。'],
   enNotes:['Findings describe; insights explain.','One insight usually explains several findings.'],
   conceptZh:'发现与洞察',conceptEn:'Finding and insight',conceptNoteZh:'事实 vs 解释',conceptNoteEn:'Fact vs explanation'},
  {title:'先归组',en:'Group first',seconds:19,
   script:['把零散观察按主题归组：网络与速度、验证步骤、重复操作。','同一组里找共同点，组之间找差别。','归组把大量观察压缩成少量可讨论的主题。'],
   enScript:['Group observations by theme: network and speed, verification steps, repeated actions.','Look for common threads within a group and differences between groups.','Grouping compresses many observations into a few discussable themes.'],
   notes:['一条观察先归组再解释。','组名要具体。'],
   enNotes:['Group an observation before interpreting it.','Give groups specific names.'],
   conceptZh:'归组',conceptEn:'Grouping',conceptNoteZh:'按主题压缩观察',conceptNoteEn:'Compress observations by theme'},
  {title:'找模式与反例',en:'Look for patterns and counter-examples',seconds:19,
   script:['模式是重复出现的线索，例如多人都在验证处停下。','反例同样重要，例如两人在电脑上完全顺畅。','模式给出方向，反例给出边界，防止过度概括。'],
   enScript:['A pattern is a recurring thread, such as many people stopping at verification.','Counter-examples matter too, such as two people having no trouble on desktop.','Patterns give direction; counter-examples give limits and prevent over-generalising.'],
   notes:['主动寻找反例。','反例要写进结论。'],
   enNotes:['Seek counter-examples actively.','Write them into the conclusion.'],
   conceptZh:'模式与反例',conceptEn:'Patterns and counter-examples',conceptNoteZh:'方向与边界',conceptNoteEn:'Direction and limits'},
  {title:'写成可验证的洞察',en:'Write a testable insight',seconds:19,
   script:['洞察陈述要写清条件、机制和结果，并附上依据。','好的洞察能预测下一步，也能设计实验来验证。','能被推翻的洞察，比听起来正确的口号有价值。'],
   enScript:['An insight statement states the condition, mechanism and outcome, with its evidence.','A good insight predicts the next step and suggests an experiment.','A disprovable insight is worth more than a slogan that sounds right.'],
   notes:['写清依据与反例。','洞察要能转成实验或设计决定。'],
   enNotes:['State evidence and counter-examples.','Turn insights into experiments or decisions.'],
   conceptZh:'可验证洞察',conceptEn:'Testable insight',conceptNoteZh:'条件、机制、结果',conceptNoteEn:'Condition, mechanism, outcome'},
 ].map((s,i)=>({...s,art:(p,lang)=>synthesisArt(i,p,lang)}))};
