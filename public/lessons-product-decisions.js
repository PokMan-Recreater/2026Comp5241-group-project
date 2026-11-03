import courseAudio from './course-audio-manifest.js';
import {kit,frame} from './lesson-art-kit.js';

function priorityArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.doc(58,58,'#fffefb',280,204)}${k.text(78,86,'愿望清单','Wish list',13)}
  ${[['加搜索','Add search'],['添加导出','Add export'],['改主题','Change theme'],['做排行榜','Leaderboards'],['自动提醒','Auto reminders']].map(([zh,en],i)=>k.group(i*.1,k.ok(78,116+i*28)+k.text(102,121+i*28,zh,en,10,'#665e72'))).join('')}
  ${k.group(.72,k.warn(310,220)+k.text(334,225,'全都想要','Everything at once',11,'#8a6a25'))}
  ${k.path('M370 160H424')}
  ${k.box(436,58,232,204,'#e7f2e7')}
  ${k.text(458,86,'优先级','Priority',13,'#34734b')}
  ${k.group(.35,k.chip(458,104,188,'1. 修复登录','1. Fix login','#fffefb'))}
  ${k.group(.5,k.chip(458,150,188,'2. 加快搜索','2. Speed up search','#fffefb'))}
  ${k.group(.65,k.chip(458,196,188,'3. 导出记录','3. Export records','#fffefb'))}
  ${k.text(458,244,'其余等下一轮','The rest waits',10,'#5c7a63')}
  ${k.text(360,306,'优先级是取舍，不是排序愿望','Priority is a trade-off, not a wish list',12,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'价值与成本','Value and cost',14,'#242032','middle')}
  <path d="M70 250H650" stroke="#a49ab8" stroke-width="3"/>${k.text(640,274,'成本','Cost',11,'#665e72','end')}
  <path d="M70 250V64" stroke="#a49ab8" stroke-width="3"/>${k.text(72,54,'价值','Value',11,'#665e72')}
  ${k.group(.2,k.face(160,96,'#bad7c2')+k.chip(108,196,120,'高价值低成本','High value, low cost','#e7f2e7',10))}
  ${k.group(.4,k.face(360,84,'#e9c58b')+k.chip(314,176,120,'高价值高成本','High value, high cost','#fff4d4',10))}
  ${k.group(.6,k.face(220,204,'#c8b8e5')+k.chip(166,276,120,'低价值低成本','Low value, low cost','#f3eef9',10))}
  ${k.group(.78,k.face(500,204,'#9ec6cf')+k.chip(446,276,120,'低价值高成本','Low value, high cost','#f9e8e2',10))}
  ${k.group(.88,k.no(620,92,'#b96559'))}
  ${k.text(360,334,'先做左上，最后做右下','Top-left first, bottom-right last',11,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.text(360,44,'依赖决定顺序','Dependencies set the order',14,'#242032','middle')}
  ${k.box(70,78,170,92,'#f3eef9')}${k.text(155,116,'账号系统','Accounts',12,'#4a3a82','middle')}${k.text(155,142,'先要能用','Must work first',9,'#665e72','middle')}
  ${k.path('M246 124H306')}
  ${k.box(320,78,150,92,'#fff4d4')}${k.text(395,116,'权限','Permissions',12,'#8a6a25','middle')}${k.text(395,142,'依赖账号','Needs accounts',9,'#665e72','middle')}
  ${k.path('M476 124H526')}
  ${k.box(540,78,130,92,'#e7f2e7')}${k.text(605,116,'分享','Sharing',12,'#34734b','middle')}${k.text(605,142,'依赖权限','Needs permissions',8,'#665e72','middle')}
  ${k.group(.5,k.clock(150,224)+k.text(174,228,'先解锁后面的任务','Unlock downstream work',11,'#66502a'))}
  ${k.group(.7,k.warn(420,204,'#b58a1f')+k.text(444,209,'跳过依赖会返工','Skipping dependencies causes rework',11,'#8a6a25'))}
  ${k.text(360,290,'价值高的任务也可能排在后面','A high-value task may still wait',12,'#665e72','middle')}
  ${k.text(360,318,'因为前置条件还没解决','Because its prerequisites are unmet',11,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.text(360,44,'对不重要的事说不','Say no to what is not important',14,'#242032','middle')}
  ${k.speech(96,74,280,'能不能顺便加导出？','Can we add export too?','#fff4d4')}
  ${k.group(.3,k.no(400,118,'#b96559'))}
  ${k.group(.44,k.chip(430,96,230,'本轮不做','Not this round','#f9e8e2'))}
  ${k.group(.6,k.doc(440,166,'#fffefb',120,84))}${k.text(500,270,'记录原因','Record the reason',10,'#665e72','middle')}
  ${k.group(.78,k.chip(96,258,280,'说清代价，而不是拒绝人','Explain cost, not rejection','#e7f2e7'))}
  ${k.text(360,322,'说不保护了当前目标','Saying no protects the current goal',12,'#665e72','middle')}
 `;
 return frame(body,['需求优先级','Prioritising requirements'],lang);
}

function tradeoffArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.face(104,96,'#e9c58b')}${k.text(104,186,'你','You',11,'#665e72','middle')}
  ${k.face(320,96,'#bad7c2')}${k.text(320,186,'业务方','Business',11,'#665e72','middle')}
  ${k.face(572,96,'#c8b8e5')}${k.text(572,186,'用户','User',11,'#665e72','middle')}
  ${k.speech(146,52,260,'要做，但更慢','Do it, but slower','#fff4d4')}
  ${k.group(.3,k.speech(346,222,240,'不做，但更快','Skip it, but faster','#e7f2e7'))}
  ${k.group(.58,k.speech(430,52,260,'快一点，别复杂','Fast and simple','#f3eef9'))}
  ${k.text(360,286,'同一决定，关注点不同','One decision, different concerns',12,'#665e72','middle')}
  ${k.text(360,314,'先翻译成共同的取舍','Translate into a shared trade-off',11,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'用熟悉的类比','Use a familiar analogy',14,'#242032','middle')}
  ${k.box(48,74,286,166,'#f9e8e2')}
  ${k.text(70,102,'术语','Jargon',12,'#a64e44')}
  ${k.no(88,136,'#b96559')}${k.text(114,141,'“加一层缓存”','“Add a cache layer”',11,'#a64e44')}
  ${k.text(70,180,'听不懂，只能点头','No understanding, just nodding',10,'#665e72')}
  ${k.path('M356 156H410')}
  ${k.box(424,74,248,166,'#e7f2e7')}
  ${k.text(446,102,'类比','Analogy',12,'#34734b')}
  ${k.ok(464,130)}${k.text(490,135,'“先备一点货”','“Keep some stock ready”',11,'#34734b')}
  ${k.text(446,176,'用熟悉的场景解释','Explain through a familiar scene',10,'#5c7a63')}
  ${k.text(446,206,'对方能复述才算讲清','Clear once they can retell it',10,'#5c7a63')}
  ${k.text(360,286,'好类比保留关键结构','A good analogy keeps the key structure',12,'#665e72','middle')}
  ${k.group(.82,k.warn(360,310,'#b58a1f')+k.text(384,315,'类比别省略代价','Do not hide the cost in the analogy',10,'#8a6a25'))}
 `;
 if(step===2)body=`
  ${k.text(360,44,'把代价说清楚','Name the cost clearly',14,'#242032','middle')}
  ${k.box(50,74,290,172,'#fff4d4')}
  ${k.text(72,102,'好处','Benefit',12,'#8a6a25')}
  ${k.group(.2,k.ok(72,130)+k.text(96,135,'编辑更快','Faster editing',11,'#8a6a25'))}
  ${k.group(.36,k.ok(72,166)+k.text(96,171,'操作更少','Fewer actions',11,'#8a6a25'))}
  ${k.text(72,212,'听起来全是优点','Sounds all positive',10,'#665e72')}
  ${k.path('M356 160H410')}
  ${k.box(424,74,248,172,'#f9e8e2')}
  ${k.text(446,102,'代价','Cost',12,'#a64e44')}
  ${k.group(.4,k.warn(446,130,'#b58a1f')+k.text(470,135,'多两周开发','Two more weeks',11,'#8a6a25'))}
  ${k.group(.56,k.warn(446,166,'#b58a1f')+k.text(470,171,'上线时间推后','Later launch',11,'#8a6a25'))}
  ${k.group(.72,k.warn(446,202,'#b58a1f')+k.text(470,207,'要维护新逻辑','New logic to maintain',11,'#8a6a25'))}
  ${k.text(360,288,'只讲好处，等于没做取舍','Benefits alone are not a trade-off',12,'#665e72','middle')}
  ${k.text(360,316,'代价要具体到时间与范围','Make costs concrete in time and scope',11,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.text(360,44,'给出选择，而不是单选题答案','Offer options, not one answer',14,'#242032','middle')}
  ${k.box(48,74,192,168,'#f3eef9')}${k.text(144,102,'方案 A','Option A',12,'#4a3a82','middle')}${k.clock(144,136)}${k.text(144,176,'两周上线','Two weeks',11,'#4a3a82','middle')}${k.text(144,200,'功能完整','Full feature',10,'#665e72','middle')}
  ${k.box(264,74,192,168,'#fff4d4')}${k.text(360,102,'方案 B','Option B',12,'#8a6a25','middle')}${k.clock(360,136)}${k.text(360,176,'一周上线','One week',11,'#8a6a25','middle')}${k.text(360,200,'先做核心','Core first',10,'#665e72','middle')}
  ${k.box(480,74,192,168,'#e7f2e7')}${k.text(576,102,'方案 C','Option C',12,'#34734b','middle')}${k.clock(576,136)}${k.text(576,176,'先做验证','Validate first',11,'#34734b','middle')}${k.text(576,200,'再决定规模','Then decide scale',10,'#665e72','middle')}
  ${k.group(.6,k.chip(210,262,300,'让决定有比较基础','Give decisions a basis for comparison','#fffefb'))}
  ${k.text(360,322,'选择权交给对方，依据由你提供','They choose; you supply the evidence',12,'#665e72','middle')}
 `;
 return frame(body,['向非技术人解释取舍','Explaining trade-offs to non-technical people'],lang);
}

function stakeholderArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  <circle cx="360" cy="168" r="54" fill="#f3eef9" stroke="#292535" stroke-width="2"/>${k.text(360,162,'预约系统','Booking',12,'#4a3a82','middle')}${k.text(360,182,'变更','Change',10,'#665e72','middle')}
  ${k.group(.14,k.face(150,74,'#bad7c2')+k.text(150,138,'学生','Students',10,'#665e72','middle'))}
  ${k.group(.28,k.face(576,74,'#e9c58b')+k.text(576,138,'教师','Teachers',10,'#665e72','middle'))}
  ${k.group(.42,k.face(104,244,'#c8b8e5')+k.text(104,318,'管理员','Admins',10,'#665e72','middle'))}
  ${k.group(.56,k.face(598,244,'#9ec6cf')+k.text(598,318,'教务','Registry',10,'#665e72','middle'))}
  ${k.path('M188 104L312 140')}${k.path('M534 104L408 140')}${k.path('M142 262L314 194')}${k.path('M562 262L408 194')}
  ${k.group(.72,k.chip(258,270,204,'谁影响决定？','Who affects the decision?','#fff4d4'))}
  ${k.text(360,344,'相关者不只包括使用者','Stakeholders are not just users',11,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'先听关切','Listen to the concern first',14,'#242032','middle')}
  ${k.face(96,96,'#e9c58b')}${k.text(96,186,'教务','Registry',11,'#665e72','middle')}
  ${k.speech(140,52,300,'我担心数据不完整','I worry the data is incomplete','#fff4d4')}
  ${k.group(.3,k.face(560,96,'#bad7c2')+k.text(560,186,'教师','Teacher',11,'#665e72','middle'))}
  ${k.group(.46,k.speech(360,214,300,'我担心操作变复杂','I worry it gets more complex','#e7f2e7'))}
  ${k.group(.66,k.doc(96,232,'#fffefb',120,84))}${k.text(156,336,'关切清单','Concern list',10,'#665e72','middle')}
  ${k.group(.82,k.chip(400,272,260,'先理解，再回应','Understand before responding','#f3eef9'))}
  ${k.text(360,326,'关切背后通常有真实约束','Concerns usually carry real constraints',11,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.text(360,44,'找共同目标','Find the shared goal',14,'#242032','middle')}
  <circle cx="200" cy="168" r="66" fill="rgba(186,215,194,.45)" stroke="#34734b" stroke-width="2"/>
  <circle cx="360" cy="168" r="66" fill="rgba(233,197,139,.45)" stroke="#8a6a25" stroke-width="2"/>
  <circle cx="520" cy="168" r="66" fill="rgba(200,184,229,.45)" stroke="#4a3a82" stroke-width="2"/>
  ${k.text(200,164,'按时开课','Start on time',11,'#34734b','middle')}
  ${k.text(360,164,'数据准确','Accurate data',11,'#8a6a25','middle')}
  ${k.text(520,164,'操作简单','Simple steps',11,'#4a3a82','middle')}
  ${k.group(.5,k.chip(250,252,280,'共同目标：少出错、少返工','Shared: fewer errors and reworks','#fff4d4'))}
  ${k.text(360,306,'共同目标让分歧可讨论','A shared goal makes disagreement discussable',12,'#665e72','middle')}
  ${k.text(360,334,'从共同目标回看方案','Re-read the proposal from that goal',10,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.doc(50,58,'#fffefb',310,204)}
  ${k.text(72,86,'对齐记录','Alignment record',13)}
  ${k.group(.14,k.text(72,116,'一致：先保证数据准确','Agreed: accurate data first',11,'#34734b'))}
  ${k.group(.3,k.text(72,146,'一致：分两批上线','Agreed: two releases',11,'#34734b'))}
  ${k.group(.46,k.warn(72,172,'#b58a1f')+k.text(96,177,'分歧：是否保留纸质流程','Open: keep paper workflow?',11,'#8a6a25'))}
  ${k.group(.62,k.text(72,212,'负责人：教务与产品','Owner: registry and product',10,'#665e72'))}
  ${k.group(.76,k.clock(72,236)+k.text(96,240,'下次决定：下周三','Next decision: Wednesday',10,'#66502a'))}
  ${k.path('M376 158H428')}
  ${k.box(440,74,232,172,'#e7f2e7')}
  ${k.text(462,102,'一致与分歧分开','Separate agreement and open points',11,'#34734b')}
  ${k.group(.44,k.ok(462,130)+k.text(486,135,'已定事项','Decided',11,'#34734b'))}
  ${k.group(.6,k.warn(462,166,'#b58a1f')+k.text(486,171,'待定事项','Open',11,'#8a6a25'))}
  ${k.group(.76,k.text(462,206,'各自负责人','Each owner named',10,'#5c7a63'))}
  ${k.text(360,296,'记录让对齐可以复查','Records make alignment reviewable',12,'#665e72','middle')}
  ${k.text(360,324,'口头同意容易变形','Verbal agreement drifts',10,'#665e72','middle')}
 `;
 return frame(body,['对齐利益相关者','Aligning stakeholders'],lang);
}

function decisionRecordArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.text(360,42,'没有记录的决定','Decisions without records',14,'#242032','middle')}
  ${k.box(46,70,300,182,'#f9e8e2')}
  ${k.text(68,98,'三个月后','Three months later',12,'#a64e44')}
  ${k.group(.2,k.text(68,128,'为什么选这个方案？','Why this option?',11,'#665e72'))}
  ${k.group(.36,k.text(68,158,'谁决定的？','Who decided?',11,'#665e72'))}
  ${k.group(.52,k.text(68,188,'当时放弃了什么？','What was rejected?',11,'#665e72'))}
  ${k.group(.7,k.warn(68,214,'#b58a1f')+k.text(92,219,'没人记得','No one remembers',11,'#8a6a25'))}
  ${k.path('M356 160H410')}
  ${k.box(424,70,248,182,'#e7f2e7')}
  ${k.text(446,98,'有记录','With a record',12,'#34734b')}
  ${k.group(.4,k.ok(446,128)+k.text(470,133,'决定与理由','Decision and reason',11,'#34734b'))}
  ${k.group(.56,k.ok(446,164)+k.text(470,169,'考虑过的选项','Options considered',11,'#34734b'))}
  ${k.group(.72,k.ok(446,200)+k.text(470,205,'什么时候复核','When to revisit',11,'#34734b'))}
  ${k.text(360,288,'记录对抗遗忘与重复讨论','Records fight forgetting and re-debate',12,'#665e72','middle')}
  ${k.group(.86,k.clock(360,312)+k.text(384,316,'问题复现时有据可查','Evidence when it recurs',10,'#66502a'))}
 `;
 if(step===1)body=`
  ${k.text(360,44,'一条决定记录写什么','What a decision record holds',14,'#242032','middle')}
  ${k.box(50,72,604,66,'#f3eef9')}${k.text(72,98,'背景','Context',12,'#4a3a82')}${k.text(160,98,'要解决什么问题，有什么约束','Problem and constraints',11,'#665e72')}
  ${k.group(.24,k.box(50,146,604,66,'#fff4d4')+k.text(72,172,'决定','Decision',12,'#8a6a25')+k.text(160,172,'选了什么，为什么不选其他','What and why not others',11,'#665e72'))}
  ${k.group(.48,k.box(50,220,604,66,'#e7f2e7')+k.text(72,246,'代价','Cost',12,'#34734b')+k.text(160,246,'接受了什么代价','Accepted cost',11,'#665e72'))}
  ${k.group(.72,k.text(360,312,'以及：何时复核、谁负责','And: when to revisit, who owns it',11,'#665e72','middle'))}
  ${k.text(360,340,'只写结论，不写理由，等于没记录','A conclusion without reasons is not a record',11,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.text(360,44,'记录不是判决书','A record is not a verdict',14,'#242032','middle')}
  ${k.box(50,74,290,166,'#f9e8e2')}
  ${k.text(72,102,'当成判决','Treat as final',12,'#a64e44')}
  ${k.no(90,136,'#b96559')}${k.text(116,141,'“已经定了，别提”','“Decided, do not ask”',11,'#a64e44')}
  ${k.text(72,182,'新证据也被忽略','New evidence gets ignored',10,'#665e72')}
  ${k.text(72,210,'错误决定无法纠正','Wrong calls cannot be corrected',10,'#665e72')}
  ${k.path('M356 156H410')}
  ${k.box(424,74,248,166,'#e7f2e7')}
  ${k.text(446,102,'当成假设','Treat as hypothesis',12,'#34734b')}
  ${k.ok(464,130)}${k.text(490,135,'“当时依据如下”','“Basis at the time”',11,'#34734b')}
  ${k.text(446,176,'新证据可以推翻','New evidence can overturn it',10,'#5c7a63')}
  ${k.text(446,206,'复核条件预先写明','Revisit conditions stated',10,'#5c7a63')}
  ${k.text(360,286,'记录服务判断，不冻结判断','Records serve judgement; they do not freeze it',12,'#665e72','middle')}
  ${k.group(.82,k.chip(230,308,260,'写清复核触发条件','State what triggers a revisit','#fff4d4'))}
 `;
 if(step===3)body=`
  ${k.text(360,44,'什么时候更新记录','When to update the record',14,'#242032','middle')}
  ${k.box(48,72,286,182,'#fffefb')}
  ${k.text(70,100,'触发更新','Triggers',12)}
  ${k.group(.16,k.ok(70,128)+k.text(94,133,'约束发生变化','Constraints change',11,'#34734b'))}
  ${k.group(.32,k.ok(70,164)+k.text(94,169,'出现新证据','New evidence',11,'#34734b'))}
  ${k.group(.48,k.ok(70,200)+k.text(94,205,'复核日期到了','Revisit date reached',11,'#34734b'))}
  ${k.group(.64,k.ok(70,236)+k.text(94,241,'方案失败','The option failed',11,'#34734b'))}
  ${k.path('M354 158H408')}
  ${k.box(422,72,248,182,'#f3eef9')}
  ${k.text(444,100,'更新方式','How to update',12,'#4a3a82')}
  ${k.group(.44,k.doc(444,120,'#fffefb',58,70))}${k.text(546,206,'追加新记录','Append a new record',10,'#665e72','middle')}
  ${k.group(.62,k.text(444,236,'不删旧理由','Do not delete the old reason',11,'#4a3a82'))}
  ${k.group(.8,k.clock(444,262)+k.text(468,266,'保留时间线','Keep the timeline',10,'#66502a'))}
  ${k.text(360,292,'追加而不是覆盖','Append, do not overwrite',13,'#665e72','middle')}
  ${k.text(360,320,'旧理由说明当时为何那样判断','Old reasons explain the past judgement',10,'#665e72','middle')}
 `;
 return frame(body,['决策记录','Decision records'],lang);
}

function feedbackLoopArt(step,p,lang){
 const k=kit(p,lang);
 let body='';
 if(step===0)body=`
  ${k.text(360,42,'上线不是终点','Launch is not the end',14,'#242032','middle')}
  <circle cx="170" cy="170" r="46" fill="#f3eef9" stroke="#292535" stroke-width="2"/>${k.text(170,166,'设计','Design',12,'#4a3a82','middle')}${k.text(170,186,'假设','Hypothesis',9,'#665e72','middle')}
  <circle cx="360" cy="170" r="46" fill="#fff4d4" stroke="#292535" stroke-width="2"/>${k.text(360,166,'上线','Launch',12,'#8a6a25','middle')}${k.text(360,186,'观察','Observe',9,'#665e72','middle')}
  <circle cx="550" cy="170" r="46" fill="#e7f2e7" stroke="#292535" stroke-width="2"/>${k.text(550,166,'调整','Adjust',12,'#34734b','middle')}${k.text(550,186,'下一轮','Next round',9,'#665e72','middle')}
  ${k.path('M218 170H310')}${k.path('M408 170H500')}
  ${k.path('M550 220C500 300 210 300 170 220','#7967ac',true)}
  ${k.group(.74,k.clock(360,308)+k.text(384,312,'循环继续','The loop continues',11,'#66502a'))}
  ${k.text(360,342,'每次上线都在检验假设','Every launch tests a hypothesis',11,'#665e72','middle')}
 `;
 if(step===1)body=`
  ${k.text(360,44,'观察真实使用','Observe real usage',14,'#242032','middle')}
  ${k.phone(74,78,0.85)}${k.text(99,196,'新界面','New UI',10,'#665e72','middle')}
  ${k.path('M146 130H208')}
  ${k.group(.24,k.box(220,84,176,100,'#f3eef9')+k.text(308,116,'使用数据','Usage data',11,'#4a3a82','middle')+k.text(308,142,'点击与完成','Clicks and completion',9,'#665e72','middle'))}
  ${k.path('M400 132H462')}
  ${k.group(.48,k.speech(474,84,200,'找不到入口','Cannot find the entry','#fff4d4'))}
  ${k.group(.68,k.warn(500,168,'#b58a1f')+k.text(524,173,'安静的地方也有信息','Silence speaks too',11,'#8a6a25'))}
  ${k.group(.84,k.lens(160,252)+k.text(184,256,'看行为，也看放弃','Watch use, and abandonment',11,'#34734b'))}
  ${k.text(360,310,'真实使用常与设计预期不同','Real use often differs from expectation',12,'#665e72','middle')}
 `;
 if(step===2)body=`
  ${k.text(360,44,'把反馈变成假设','Turn feedback into hypotheses',14,'#242032','middle')}
  ${k.speech(72,74,270,'每次都要重新填表','Filling the form every time','#fff4d4')}
  ${k.path('M210 126L330 160')}
  ${k.group(.3,k.box(344,120,300,70,'#f3eef9')+k.text(494,146,'反馈：重复填写','Feedback: repeated entry',11,'#4a3a82','middle')+k.text(494,170,'出现于 7 位用户','Seen in 7 users',9,'#665e72','middle'))}
  ${k.path('M494 194V228')}
  ${k.group(.58,k.box(330,232,328,70,'#e7f2e7')+k.text(494,258,'假设：保存常用信息可减少放弃','Hypothesis: saved details reduce drop-off',10,'#34734b','middle')+k.text(494,282,'验证：对比两组完成率','Test: compare completion in two groups',9,'#5c7a63','middle'))}
  ${k.group(.82,k.chip(110,250,200,'可验证，而不是直接开发','Testable, not instant build','#fff4d4'))}
  ${k.text(360,330,'反馈先变成假设，再决定做什么','Turn feedback into a hypothesis first',11,'#665e72','middle')}
 `;
 if(step===3)body=`
  ${k.text(360,44,'决定下一步','Decide the next step',14,'#242032','middle')}
  ${k.box(48,74,190,158,'#e7f2e7')}${k.ok(143,112)}${k.text(143,146,'继续','Continue',12,'#34734b','middle')}${k.text(143,176,'假设成立','Hypothesis holds',10,'#5c7a63','middle')}${k.text(143,202,'扩大范围','Widen scope',10,'#5c7a63','middle')}
  ${k.box(264,74,190,158,'#fff4d4')}${k.gear(360,112)}${k.text(360,146,'调整','Adjust',12,'#8a6a25','middle')}${k.text(360,176,'部分成立','Partly holds',10,'#665e72','middle')}${k.text(360,202,'改方案再测','Change and retest',10,'#665e72','middle')}
  ${k.box(480,74,190,158,'#f9e8e2')}${k.no(575,112,'#b96559')}${k.text(575,146,'停止','Stop',12,'#a64e44','middle')}${k.text(575,176,'假设不成立','Hypothesis fails',10,'#665e72','middle')}${k.text(575,202,'保留学习','Keep the learning',10,'#665e72','middle')}
  ${k.group(.62,k.clock(190,272)+k.text(214,276,'下一次复核时间','Next review date',11,'#66502a'))}
  ${k.group(.8,k.doc(430,246,'#fffefb',120,64))}${k.text(490,330,'决定记录','Decision record',10,'#665e72','middle')}
  ${k.text(360,324,'三种结果都算进展','All three outcomes are progress',11,'#665e72','middle')}
 `;
 return frame(body,['上线后的反馈闭环','The feedback loop after launch'],lang);
}

const base={section:'03 产品与协作技能',sectionEn:'03 PRODUCT AND PEOPLE SKILLS',position:'03 · 产品决策',positionEn:'03 · Product decisions',audio:true};

export const prioritisationLesson={...base,
 id:'prioritisation',code:'3.3',courseId:'product-decisions',
 title:'需求优先级',titleEn:'Prioritising requirements',
 sceneTitle:'需求优先级',sceneTitleEn:'Prioritising requirements',
 audioManifest:courseAudio['prioritisation'],
 steps:[
  {title:'优先级不是愿望清单',en:'Priority is not a wish list',seconds:18,
   script:['把每一件想做的事都列出来，并不是优先级。','优先级回答的是：现在最重要的是哪一件，其余为什么可以等。','取舍意味着明确放弃一部分，而不是全部排进本轮。'],
   enScript:['Listing everything you want is not prioritisation.','Prioritisation answers which single thing matters most now, and why the rest can wait.','Trade-off means clearly giving something up, not fitting everything into this round.'],
   notes:['先定目标，再排顺序。','被推迟的事项也要写理由。'],
   enNotes:['Set the goal before the order.','Record why postponed items wait.'],
   conceptZh:'取舍',conceptEn:'Trade-off',conceptNoteZh:'现在做什么，为什么其他可以等',conceptNoteEn:'What now, why others wait'},
  {title:'价值与成本',en:'Value and cost',seconds:19,
   script:['用两个维度看需求：带来多少价值，需要多少成本。','高价值低成本先做，低价值高成本最后做。','成本和价值都要写依据，而不是凭感觉打分。'],
   enScript:['View requirements on two axes: how much value and how much cost.','Do high value and low cost first; leave low value and high cost last.','State evidence for both value and cost instead of scoring by feel.'],
   notes:['价值要对应具体用户或目标。','成本包括开发和维护。'],
   enNotes:['Tie value to a user or goal.','Cost includes development and maintenance.'],
   conceptZh:'价值与成本',conceptEn:'Value and cost',conceptNoteZh:'两个维度一起看',conceptNoteEn:'Two axes together'},
  {title:'依赖决定顺序',en:'Dependencies set the order',seconds:19,
   script:['有些任务本身价值不高，却是其他任务的前置条件。','跳过依赖直接做后面的事，通常会返工。','排序时要同时看价值、成本和依赖。'],
   enScript:['Some tasks have modest value but unlock others.','Skipping a prerequisite usually causes rework later.','Order by value, cost and dependencies together.'],
   notes:['把前置任务标出来。','依赖变化时重排顺序。'],
   enNotes:['Mark prerequisite tasks.','Reorder when dependencies change.'],
   conceptZh:'依赖顺序',conceptEn:'Dependency order',conceptNoteZh:'先解锁后面的任务',conceptNoteEn:'Unlock downstream work'},
  {title:'对不重要的事说不',en:'Say no to what is not important',seconds:19,
   script:['每个新请求都答应，会让本轮目标失焦。','说不时要说明代价：多做这件事，会推迟什么。','把“本轮不做”记录下来，未来仍可以重新评估。'],
   enScript:['Accepting every new request blurs this round’s goal.','Saying no includes explaining the cost: doing this delays what.','Record “not this round” so it can be reconsidered later.'],
   notes:['拒绝针对请求，不针对人。','记录被推迟的事项与原因。'],
   enNotes:['Reject the request, not the person.','Record deferred items and reasons.'],
   conceptZh:'有理由的说不',conceptEn:'Reasoned no',conceptNoteZh:'说清代价，而非拒绝人',conceptNoteEn:'Explain cost, not rejection'},
 ].map((s,i)=>({...s,art:(p,lang)=>priorityArt(i,p,lang)}))};

export const explainTradeoffsLesson={...base,
 id:'explain-tradeoffs',code:'3.3',courseId:'product-decisions',
 title:'向非技术人解释取舍',titleEn:'Explaining trade-offs to non-technical people',
 sceneTitle:'向非技术人解释取舍',sceneTitleEn:'Explaining trade-offs to non-technical people',
 audioManifest:courseAudio['explain-tradeoffs'],
 steps:[
  {title:'不同人关心不同的事',en:'Different people care about different things',seconds:18,
   script:['业务方关心时间与收入，用户关心操作是否顺畅。','同一个决定，在不同人眼里有不同的重点。','解释取舍前，先了解对方关心什么。'],
   enScript:['The business cares about time and revenue; users care about smooth operation.','One decision has different emphases for different people.','Understand what the audience cares about before explaining.'],
   notes:['先问对方最在意什么。','用对方的语言组织解释。'],
   enNotes:['Ask what matters most to them.','Use their language.'],
   conceptZh:'受众关注点',conceptEn:'Audience concerns',conceptNoteZh:'时间、收入、顺畅',conceptNoteEn:'Time, revenue, smoothness'},
  {title:'用熟悉的类比',en:'Use a familiar analogy',seconds:19,
   script:['“加一层缓存”对非技术听众没有意义。','换成“先备一点货，取的时候更快”，对方就能理解。','类比要保留关键结构，不能把代价藏起来。'],
   enScript:['“Add a cache layer” means little to a non-technical audience.','“Keep some stock ready so it is faster to fetch” lands.','An analogy must keep the structure and not hide the cost.'],
   notes:['类比要贴近对方经验。','类比后补充准确说明。'],
   enNotes:['Anchor analogies in their experience.','Follow the analogy with the precise version.'],
   conceptZh:'类比',conceptEn:'Analogy',conceptNoteZh:'用熟悉场景解释',conceptNoteEn:'Explain through a familiar scene'},
  {title:'把代价说清楚',en:'Name the cost clearly',seconds:19,
   script:['只讲好处，等于没有做取舍。','代价要具体：多多少时间、影响哪些范围、需要维护什么。','把代价写在好处旁边，对方才能比较。'],
   enScript:['Benefits alone are not a trade-off.','Costs must be concrete: how much time, what scope, what upkeep.','Put costs beside benefits so they can be compared.'],
   notes:['代价要可量化。','不要用“可能有点慢”这类模糊说法。'],
   enNotes:['Quantify the cost.','Avoid vague phrases like “a bit slower”.'],
   conceptZh:'代价具体化',conceptEn:'Concrete cost',conceptNoteZh:'时间、范围、维护',conceptNoteEn:'Time, scope, upkeep'},
  {title:'给出选择',en:'Offer options',seconds:19,
   script:['与其给一个答案，不如给出两三个有代价的方案。','每个方案写清时间、范围和风险，让对方选择。','选择权交给对方，依据由你提供。'],
   enScript:['Rather than one answer, offer two or three options with their costs.','Each option states time, scope and risk for the other person to choose.','They choose; you supply the evidence.'],
   notes:['方案不超过三个。','写清推荐哪个及原因。'],
   enNotes:['Keep options to three or fewer.','State your recommendation and why.'],
   conceptZh:'选项比较',conceptEn:'Options',conceptNoteZh:'时间、范围、风险',conceptNoteEn:'Time, scope, risk'},
 ].map((s,i)=>({...s,art:(p,lang)=>tradeoffArt(i,p,lang)}))};

export const stakeholderAlignmentLesson={...base,
 id:'stakeholder-alignment',code:'3.3',courseId:'product-decisions',
 title:'对齐利益相关者',titleEn:'Aligning stakeholders',
 sceneTitle:'对齐利益相关者',sceneTitleEn:'Aligning stakeholders',
 audioManifest:courseAudio['stakeholder-alignment'],
 steps:[
  {title:'谁是关键相关者',en:'Who are the key stakeholders',seconds:18,
   script:['相关者不只是使用者，还包括受影响的人和决定资源的人。','学生、教师、管理员、教务，对同一个变更的关切不同。','先画出相关者地图，再决定找谁谈。'],
   enScript:['Stakeholders are not only users; they include affected people and resource owners.','Students, teachers, admins and registry care differently about the same change.','Map the stakeholders before deciding whom to talk to.'],
   notes:['相关者可分为使用者、受影响者、决策者。','关键相关者不一定最常使用系统。'],
   enNotes:['Classify as users, affected people, decision-makers.','Key stakeholders may rarely use the system.'],
   conceptZh:'相关者地图',conceptEn:'Stakeholder map',conceptNoteZh:'使用、受影响、决策',conceptNoteEn:'Users, affected, deciders'},
  {title:'先听关切',en:'Listen to concerns first',seconds:19,
   script:['先听对方担心什么，再介绍方案。','教务担心数据不完整，教师担心操作变复杂，都是真实约束。','先理解，再回应，比直接说服更有效。'],
   enScript:['Listen to what worries them before presenting the proposal.','Registry worries about incomplete data; teachers worry about complexity; both are real constraints.','Understanding before responding works better than persuading.'],
   notes:['把关切逐条记下来。','回应要针对具体担忧。'],
   enNotes:['Write down each concern.','Respond to the specific worry.'],
   conceptZh:'关切清单',conceptEn:'Concern list',conceptNoteZh:'先理解，再回应',conceptNoteEn:'Understand, then respond'},
  {title:'找共同目标',en:'Find the shared goal',seconds:19,
   script:['各方表述不同，但常常共享一个更高层的目标。','“按时开课”“数据准确”“操作简单”可以归结为少出错、少返工。','从共同目标回看方案，分歧就更容易讨论。'],
   enScript:['Different parties often share a higher-level goal beneath their words.','“Start on time”, “accurate data” and “simple steps” can reduce to fewer errors and reworks.','Re-reading the proposal from that goal makes disagreement easier to discuss.'],
   notes:['共同目标要能被各方接受。','分歧说明各自约束不同。'],
   enNotes:['The shared goal must be acceptable to all.','Disagreement reveals different constraints.'],
   conceptZh:'共同目标',conceptEn:'Shared goal',conceptNoteZh:'少出错、少返工',conceptNoteEn:'Fewer errors, less rework'},
  {title:'记录一致与分歧',en:'Record agreement and divergence',seconds:19,
   script:['对齐之后，把已定事项和待定事项分开记录。','每条待定事项写明负责人和下次决定的时间。','口头同意容易变形，记录让对齐可以复查。'],
   enScript:['After alignment, record decided and open items separately.','Each open item names its owner and next decision date.','Verbal agreement drifts; records make alignment reviewable.'],
   notes:['分歧不是失败，是待解决的问题。','记录发给所有相关者确认。'],
   enNotes:['Divergence is an open question, not a failure.','Send the record to all parties to confirm.'],
   conceptZh:'对齐记录',conceptEn:'Alignment record',conceptNoteZh:'已定、待定、负责人',conceptNoteEn:'Decided, open, owners'},
 ].map((s,i)=>({...s,art:(p,lang)=>stakeholderArt(i,p,lang)}))};

export const decisionRecordsLesson={...base,
 id:'decision-records',code:'3.3',courseId:'product-decisions',
 title:'决策记录',titleEn:'Decision records',
 sceneTitle:'决策记录',sceneTitleEn:'Decision records',
 audioManifest:courseAudio['decision-records'],
 steps:[
  {title:'为什么要记录决定',en:'Why record decisions',seconds:18,
   script:['没有记录，三个月后没人说得清为什么选了这个方案。','同样的问题会被反复讨论，决定也可能被悄悄推翻。','记录让决定与理由一起留存，便于复查。'],
   enScript:['Without records, no one can explain three months later why this option was chosen.','The same issue gets re-debated and decisions may be quietly overturned.','Records keep the decision together with its reasons for review.'],
   notes:['记录不是为了形式。','记录能减少重复讨论。'],
   enNotes:['Records are not ceremony.','They reduce repeated debate.'],
   conceptZh:'决定与理由',conceptEn:'Decision and reasons',conceptNoteZh:'一起留存',conceptNoteEn:'Kept together'},
  {title:'一条记录写什么',en:'What a record holds',seconds:19,
   script:['记录至少包含背景、决定、代价和复核条件。','背景写清问题与约束，决定写清选了什么、没选什么。','代价要诚实，复核条件要具体。'],
   enScript:['A record includes at least context, decision, cost and review conditions.','Context states the problem and constraints; the decision states what was chosen and rejected.','Costs must be honest and review conditions concrete.'],
   notes:['一条记录只写一个决定。','附上关键依据的链接或引用。'],
   enNotes:['One record, one decision.','Link the key evidence.'],
   conceptZh:'记录结构',conceptEn:'Record structure',conceptNoteZh:'背景、决定、代价、复核',conceptNoteEn:'Context, decision, cost, review'},
  {title:'记录不是判决书',en:'A record is not a verdict',seconds:19,
   script:['决定记录说明当时的依据，而不是禁止后来者提问。','新证据出现时，记录可以被推翻或修正。','把复核触发条件写进记录，决定才不会僵化。'],
   enScript:['A decision record states the basis at the time; it does not forbid later questions.','When new evidence appears, the record can be overturned or revised.','Write revisit triggers into the record so decisions do not freeze.'],
   notes:['记录里的理由要可讨论。','推翻决定时也留下记录。'],
   enNotes:['Reasons in the record stay discussable.','Record overturns as well.'],
   conceptZh:'可修正记录',conceptEn:'Revocable record',conceptNoteZh:'依据可以更新',conceptNoteEn:'Basis can be updated'},
  {title:'什么时候更新',en:'When to update',seconds:19,
   script:['约束变化、出现新证据、复核日期到了、方案失败时，都要更新。','更新方式是追加新记录，而不是删除旧理由。','旧理由说明当时为何那样判断，时间线要保留。'],
   enScript:['Update when constraints change, new evidence appears, the revisit date arrives or an option fails.','Update by appending a new record rather than deleting the old reason.','Old reasons explain the past judgement; keep the timeline.'],
   notes:['追加而不是覆盖。','时间线让后来者理解演变。'],
   enNotes:['Append, do not overwrite.','The timeline explains how thinking evolved.'],
   conceptZh:'追加更新',conceptEn:'Append updates',conceptNoteZh:'不删旧理由',conceptNoteEn:'Do not delete old reasons'},
 ].map((s,i)=>({...s,art:(p,lang)=>decisionRecordArt(i,p,lang)}))};

export const feedbackLoopLesson={...base,
 id:'feedback-loop',code:'3.3',courseId:'product-decisions',
 title:'上线后的反馈闭环',titleEn:'The feedback loop after launch',
 sceneTitle:'上线后的反馈闭环',sceneTitleEn:'The feedback loop after launch',
 audioManifest:courseAudio['feedback-loop'],
 steps:[
  {title:'上线不是终点',en:'Launch is not the end',seconds:18,
   script:['上线只是把假设放到真实使用中检验。','设计、上线、观察、调整应当形成闭环。','每次上线都在检验一个假设，而不是完成任务。'],
   enScript:['Launch puts a hypothesis into real use for testing.','Design, launch, observe and adjust should form a loop.','Every launch tests a hypothesis rather than completing a task.'],
   notes:['上线前写清要验证什么。','上线后安排观察时间。'],
   enNotes:['State what will be tested before launch.','Schedule observation after launch.'],
   conceptZh:'反馈闭环',conceptEn:'Feedback loop',conceptNoteZh:'设计、上线、观察、调整',conceptNoteEn:'Design, launch, observe, adjust'},
  {title:'观察真实使用',en:'Observe real usage',seconds:19,
   script:['看使用数据：点击、完成率、放弃的位置。','也看反馈：用户在哪里说找不到入口。','安静的地方也有信息，没人使用本身就是信号。'],
   enScript:['Watch usage data: clicks, completion and where people give up.','Also watch feedback about where users cannot find an entry.','Silence speaks too; no use is itself a signal.'],
   notes:['数据与反馈一起看。','观察要持续一段时间。'],
   enNotes:['Read data and feedback together.','Observe over time.'],
   conceptZh:'真实使用',conceptEn:'Real usage',conceptNoteZh:'点击、完成、放弃',conceptNoteEn:'Clicks, completion, drop-off'},
  {title:'把反馈变成假设',en:'Turn feedback into hypotheses',seconds:19,
   script:['“每次都要重新填表”是一个观察，还不是要开发的功能。','把它写成假设：保存常用信息能减少放弃。','再设计验证方式，例如对比两组完成率。'],
   enScript:['“Filling the form every time” is an observation, not yet a feature.','Turn it into a hypothesis: saved details reduce drop-off.','Then design a test, such as comparing completion in two groups.'],
   notes:['假设要能验证。','不要直接从反馈跳到开发。'],
   enNotes:['Hypotheses must be testable.','Do not jump from feedback straight to building.'],
   conceptZh:'反馈到假设',conceptEn:'Feedback to hypothesis',conceptNoteZh:'观察 → 假设 → 验证',conceptNoteEn:'Observe, hypothesise, test'},
  {title:'决定下一步',en:'Decide the next step',seconds:19,
   script:['验证后通常有三种结果：继续、调整、停止。','三种结果都算进展，因为都增加了认识。','把决定和依据记录下来，下一轮从那里开始。'],
   enScript:['Testing usually leads to three outcomes: continue, adjust or stop.','All three are progress because each increases understanding.','Record the decision and its basis so the next round starts there.'],
   notes:['停止也是有效结果。','调整要说明改了什么假设。'],
   enNotes:['Stopping is a valid outcome.','Adjusting means changing the hypothesis.'],
   conceptZh:'下一步决定',conceptEn:'Next step',conceptNoteZh:'继续、调整、停止',conceptNoteEn:'Continue, adjust, stop'},
 ].map((s,i)=>({...s,art:(p,lang)=>feedbackLoopArt(i,p,lang)}))};
