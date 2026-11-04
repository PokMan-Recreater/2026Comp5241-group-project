import {courseBookmarkButton} from './course-bookmark.js';
import {lessonText} from './delivery-i18n.js';
const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pad=n=>String(n).padStart(2,'0');
export const curriculum=[
 {id:'foundations',no:'01',title:'软件工程与开发基础',en:'Software engineering foundations',
  goal:'先看清一项软件工作从问题到长期使用的全程，再练习需求、设计、测试、交付与团队协作。',
  enGoal:'See a piece of software work from problem to long-term use, then practise requirements, design, testing, delivery and teamwork.',
  courses:[
   {id:'delivery-basics',no:'1.1',title:'交付之前的软件工程',en:'Software engineering before delivery',
    goal:'用一次真实的小功能，判断“能运行”和“能交付”之间还缺什么。',
    enGoal:'Use one small feature to judge what still separates “it runs” from “ready to deliver”.',
    lessons:[
     {no:'1.1.1',id:'delivery-ready',title:'写完程序，为什么还不能交付',en:'A working program. Ready to deliver?'},
     {no:'1.1.2',id:'users-stakeholders',title:'谁使用系统，谁关心结果',en:'Who uses the system and who cares?'},
     {no:'1.1.3',id:'requirements-to-build',title:'从需求到可运行版本',en:'From requirements to a working version'},
     {no:'1.1.4',id:'after-release',title:'发布之后，工作怎样继续',en:'Work after release'},
     {no:'1.1.5',id:'quality-tradeoffs',title:'软件质量与工程取舍',en:'Software quality and trade-offs'}
    ]},
   {id:'testing-quality-release',no:'1.2',title:'测试、质量与发布',en:'Testing, quality and release',
    goal:'把“我觉得能行”换成可重复的证据，让每次发布都有检查清单和观察信号。',
    enGoal:'Replace “I think it works” with repeatable evidence, and give every release a checklist and signals to watch.',
    lessons:[
     {no:'1.2.1',id:'tests-as-evidence',title:'测试是交付的证据',en:'Tests are delivery evidence'},
     {no:'1.2.2',id:'unit-and-integration',title:'单元与集成测试的分工',en:'Unit and integration tests'},
     {no:'1.2.3',id:'test-data-edges',title:'测试数据与边界情况',en:'Test data and edge cases'},
     {no:'1.2.4',id:'release-checklist',title:'发布检查清单',en:'The release checklist'},
     {no:'1.2.5',id:'monitor-and-feedback',title:'上线后的监控与反馈',en:'Monitoring and feedback after launch'}
    ]},
   {id:'team-and-process',no:'1.3',title:'团队协作与工程流程',en:'Teamwork and engineering process',
    goal:'让多人改同一个代码库时不靠猜测：提交、评审、拆分、文档与交接都有约定。',
    enGoal:'Let several people change one codebase without guessing: commits, reviews, breakdowns, docs and handoffs all follow agreements.',
    lessons:[
     {no:'1.3.1',id:'version-control',title:'版本控制与提交习惯',en:'Version control and commit habits'},
     {no:'1.3.2',id:'code-review',title:'代码评审看什么',en:'What code review should look for'},
     {no:'1.3.3',id:'task-breakdown',title:'任务拆分与估算',en:'Breaking down and estimating work'},
     {no:'1.3.4',id:'docs-as-interface',title:'文档即协作接口',en:'Docs as a collaboration interface'},
     {no:'1.3.5',id:'knowledge-handoff',title:'交接与知识共享',en:'Handoffs and shared knowledge'}
    ]}
  ]},
 {id:'agents',no:'02',title:'在软件开发中高效使用 AI 编码智能体',en:'Working with AI coding agents',
  goal:'把任务、边界和检查写清楚，选择合适的工作模式，让智能体放大你的工作而不是返工。',
  enGoal:'Write clear tasks, boundaries and checks, choose the right working mode, and let agents amplify your work instead of your rework.',
  courses:[
   {id:'delegating-to-agents',no:'2.1',title:'把任务交给智能体',en:'Delegating work to agents',
    goal:'从“帮我写一段”走到“交给你一整步，我按条件验收”。',
    enGoal:'Move from “write this for me” to “attempt this step, and I will check it against conditions”.',
    lessons:[
     {no:'2.1.1',id:'delegating-to-agents',title:'智能体不是更快的补全',en:'An agent is not a faster completion'},
     {no:'2.1.2',id:'checkable-goals',title:'给智能体一个可检查的目标',en:'A goal the agent can check'},
     {no:'2.1.3',id:'task-boundaries',title:'任务边界与人工确认',en:'Boundaries and human approval'},
     {no:'2.1.4',id:'agent-context',title:'让智能体读你的代码库',en:'Let the agent read your codebase'},
     {no:'2.1.5',id:'checks-and-judgement',title:'把检查交给工具，把判断留给自己',en:'Tools run the checks; you make the call'}
    ]},
   {id:'agent-collaboration',no:'2.2',title:'智能体协作模式',en:'Working modes with agents',
    goal:'根据任务大小选择模式：先计划、小步迭代、分工协作或分层给上下文。',
    enGoal:'Choose a mode by task size: plan first, iterate in small batches, split roles, or layer the context.',
    lessons:[
     {no:'2.2.1',id:'plan-then-execute',title:'先计划，再执行',en:'Plan first, then execute'},
     {no:'2.2.2',id:'small-batch-iteration',title:'小批量迭代',en:'Iterate in small batches'},
     {no:'2.2.3',id:'agent-roles',title:'探索、实现与审查的分工',en:'Exploring, building and reviewing roles'},
     {no:'2.2.4',id:'context-layering',title:'上下文分层',en:'Layering context'},
     {no:'2.2.5',id:'agent-failure-modes',title:'常见失败模式',en:'Common failure modes'}
    ]},
   {id:'agent-assurance',no:'2.3',title:'验证、审查与治理',en:'Verification, review and governance',
    goal:'智能体产出越快，越需要验证、读差异、划安全边界、控成本、留记录。',
    enGoal:'The faster agents produce, the more you need verification, diff review, safety boundaries, cost limits and records.',
    lessons:[
     {no:'2.3.1',id:'verify-output',title:'验证智能体的产出',en:'Verifying agent output'},
     {no:'2.3.2',id:'read-the-diff',title:'读差异，而不是读总结',en:'Read the diff, not the summary'},
     {no:'2.3.3',id:'security-boundaries',title:'权限与安全边界',en:'Permission and security boundaries'},
     {no:'2.3.4',id:'cost-and-rate-limits',title:'成本与速率约束',en:'Cost and rate limits'},
     {no:'2.3.5',id:'audit-trail',title:'记录与可追溯',en:'Records and traceability'}
    ]}
  ]},
 {id:'product',no:'03',title:'软件开发中的软技能与产品技能',en:'Product and people skills',
  goal:'从功能清单退回到真实问题，再用研究、证据、优先级与沟通推动决定落地。',
  enGoal:'Step back from feature lists to real problems, then use research, evidence, prioritisation and communication to make decisions stick.',
  courses:[
   {id:'problem-definition',no:'3.1',title:'定义真正的问题',en:'Defining the real problem',
    goal:'把“加一个按钮”翻译成对象、场景、目标与约束，让方案有比较的基础。',
    enGoal:'Turn “add a button” into people, situation, goal and constraints so solutions can be compared.',
    lessons:[
     {no:'3.1.1',id:'problem-definition',title:'从功能退回到问题',en:'Step back from the feature to the problem'},
     {no:'3.1.2',id:'users-affected',title:'谁在使用，谁在受影响',en:'Who uses it, who is affected'},
     {no:'3.1.3',id:'testable-constraints',title:'把约束写成可验证的规则',en:'Write constraints as testable rules'},
     {no:'3.1.4',id:'compare-solutions',title:'问题陈述与方案比较',en:'Problem statements and comparing solutions'},
     {no:'3.1.5',id:'scope-and-non-goals',title:'范围与非目标',en:'Scope and non-goals'}
    ]},
   {id:'user-research',no:'3.2',title:'用户研究与证据',en:'User research and evidence',
    goal:'少靠想象，多靠访谈、观察、问卷与数据，把“我觉得”换成“我们观察到”。',
    enGoal:'Rely less on imagination and more on interviews, observation, surveys and data: replace “I think” with “we observed”.',
    lessons:[
     {no:'3.2.1',id:'user-interviews',title:'用户访谈怎么问',en:'How to run user interviews'},
     {no:'3.2.2',id:'observe-behaviour',title:'观察行为，而不是意见',en:'Observe behaviour, not opinions'},
     {no:'3.2.3',id:'survey-evidence',title:'问卷与样本',en:'Surveys and samples'},
     {no:'3.2.4',id:'data-as-evidence',title:'用数据支撑判断',en:'Use data as evidence'},
     {no:'3.2.5',id:'synthesise-findings',title:'从发现到洞察',en:'From findings to insight'}
    ]},
   {id:'product-decisions',no:'3.3',title:'产品决策与沟通',en:'Product decisions and communication',
    goal:'在限制中排出优先级，把取舍讲给不同的人听，并让决定留下可复盘的记录。',
    enGoal:'Prioritise under constraints, explain trade-offs to different audiences, and leave decisions with a record you can review.',
    lessons:[
     {no:'3.3.1',id:'prioritisation',title:'需求优先级',en:'Prioritising requirements'},
     {no:'3.3.2',id:'explain-tradeoffs',title:'向非技术人解释取舍',en:'Explaining trade-offs to non-technical people'},
     {no:'3.3.3',id:'stakeholder-alignment',title:'对齐利益相关者',en:'Aligning stakeholders'},
     {no:'3.3.4',id:'decision-records',title:'决策记录',en:'Decision records'},
     {no:'3.3.5',id:'feedback-loop',title:'上线后的反馈闭环',en:'The feedback loop after launch'}
    ]}
  ]}
];
export const themeById=id=>curriculum.find(x=>x.id===id);
export function courseById(id){for(const theme of curriculum){const course=theme.courses.find(x=>x.id===id);if(course)return {theme,course};}return null;}
const lessonCount=theme=>theme.courses.reduce((n,c)=>n+c.lessons.length,0);
const liveCount=course=>course.lessons.filter(l=>l.id).length;
export function courseMapHTML(lang='zh-CN'){
 const L=(zh,en)=>lessonText(lang,zh,en);
 return `<section class="cm-wrap"><h1>${L('软件工程','Software Engineering')}</h1><p class="cm-lead">${L('三个主题围绕一次真实的软件开发展开：先建立工程基础，再用 AI 编码智能体放大你的工作，最后练习定义问题与协作。全部小节都已开放。','Three themes follow one real software project: build the foundations, work with coding agents, then practise defining problems and collaborating. Every lesson is open.')}</p><div class="cm-map">${curriculum.map(theme=>`<a class="cm-topic" href="#module/${theme.id}"><span class="cm-index">${theme.no}</span><span><strong>${e(L(theme.title,theme.en))}</strong><small>${e(L(theme.goal,theme.enGoal))}</small></span><span class="cm-count">${lessonCount(theme)} ${L('小节','lessons')} →</span></a>`).join('')}</div><p class="cm-foot">${L('每节都带中英配音与分步图解，完成一节再进入下一节。','Every lesson has Mandarin and English narration plus step-by-step diagrams. Finish one before starting the next.')}</p></section>`;
}
export function topicHTML(id,lang='zh-CN',bookmarks=[]){
 const L=(zh,en)=>lessonText(lang,zh,en),theme=themeById(id);
 if(theme)return `<section class="cm-wrap"><a class="cm-back" href="#explore">← ${L('学习地图','Learning map')}</a><span class="cm-eyebrow">${theme.no} / ${pad(curriculum.length)}</span><h1>${e(L(theme.title,theme.en))}</h1><p class="cm-lead">${e(L(theme.goal,theme.enGoal))}</p><div class="cm-lessons">${theme.courses.map(course=>{const first=course.lessons.find(l=>l.id);return `<div class="cm-course-row"><a href="${first?`#learn/${first.id}/0`:'#explore'}" class="cm-lesson"><span>${course.no}</span><strong>${e(L(course.title,course.en))}</strong><em>${liveCount(course)} / ${course.lessons.length} ${L('节可学','open')} →</em></a>${courseBookmarkButton(course.id,bookmarks.includes('course:'+course.id),lang)}</div>`;}).join('')}</div><p class="cm-foot">${L('点开直接进入播放器，左侧目录可展开五节课。','Open a course straight into the player; the sidebar expands its five lessons.')}</p></section>`;
 const found=courseById(id);
 if(found){const {theme,course}=found;const first=course.lessons.find(l=>l.id);return `<section class="cm-wrap"><a class="cm-back" href="#module/${theme.id}">← ${e(L(theme.title,theme.en))}</a><span class="cm-eyebrow">${theme.no} / ${pad(curriculum.length)} · ${e(L(theme.title,theme.en))}</span><h1>${e(L(course.title,course.en))}</h1><p class="cm-lead">${e(L(course.goal,course.enGoal))}</p>${first?`<a class="cm-start" href="#learn/${first.id}/0">${L('进入课程','Open the course')} →</a>`:''}<p class="cm-foot">${L('课程页已取消：点课程直接进入第一课，左侧目录列出 01–05，可逐节展开。','The course page is gone: a course opens on its first lesson, and the sidebar lists 01–05, each expandable.')}</p></section>`;}
 return `<section class="cm-wrap"><h1>${L('没有这个主题','Topic not found')}</h1><a href="#explore">← ${L('返回课程地图','Back to map')}</a></section>`;
}
