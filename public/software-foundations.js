import {tri} from './i18n.js';

// An original introductory course. Reading, examples and marking work offline.
const T=(en,cn,tw=cn)=>tri(en,cn,tw);
const reading=(en,cn)=>T(en.join('\n\n'),cn.join('\n\n'));
export const foundationsReference={title:'IBM · Introduction to Software Engineering',url:'https://www.coursera.org/learn/introduction-to-software-engineering',courses:['development'],use:T('Public syllabus reference for lifecycle, roles, development methods and quality. Forma’s library case and questions are original; this is not the IBM course.','参考公开大纲中的生命周期、团队角色、开发方法与质量主题。图书续借案例和题目由 Forma 原创，不是 IBM 原课或认证。')};
const question=(en,cn,options,correct,feedback)=>({question:T(en,cn),correct,options:options.map(([a,b],i)=>({text:T(a,b),feedback:T(...feedback[i])}))});
export const foundationsMetadata={
 title:T('Introduction to software engineering','软件工程入门','軟體工程入門'),
 description:T('Start here: understand the lifecycle, team responsibilities, iterative delivery and software quality through a small library-renewal service. Five lessons with worked examples and ten objective checks.','从一个图书续借服务出发，认识开发生命周期、团队分工、迭代交付与软件质量。五节小课，每节有讲解、示例和两道客观练习。','從一個圖書續借服務出發，認識開發生命週期、團隊分工、迭代交付與軟體品質。五節小課，每節有講解、範例和兩道客觀練習。'),
 outcomes:T('Identify engineering work beyond coding, follow a change through its lifecycle, distinguish responsibilities and judge a release using evidence.','辨别写代码之外的工程工作，追踪一次改动的完整过程，区分团队责任，并根据证据判断版本是否可交付。'),
 deliverable:T('Complete ten scenario checks covering the software engineering workflow.','完成十道情境检查，建立软件工程的整体地图。'),
 prerequisite:T('No coding experience required. Read the worked example before answering; you can retry every check.','不需要编程基础。先看示例，再做判断；每道练习都可以重新尝试。'),
 curriculumVersion:2,
};
const rows=[
 {
  id:'d1',minutes:10,title:T('What does software engineering solve?','软件工程到底解决什么问题？','軟體工程到底解決甚麼問題？'),
  body:reading([
   '## Start with something familiar','A library wants readers to renew books online. A developer makes a page with a Renew button. It changes the displayed date. Is the service finished? Not yet: the stored due date may still be unchanged, another reader may have reserved the book, and staff may have no way to investigate a failed renewal.',
   '## Coding is part of a larger job','Programming expresses behaviour in executable instructions. Software engineering also deals with agreeing what should happen, designing responsibilities, checking failures, releasing changes and keeping the service usable. These activities make coding purposeful and maintainable; they do not replace it.',
   '## Follow one complete outcome','For this fictional case, an eligible renewal succeeds only when the server records the new due date and the reader receives that same date. A reserved book must be refused without changing its due date. The page is one component of this outcome, not the outcome itself.',
   '## Compare two deliveries','Team A shows a successful button animation. Team B demonstrates an eligible renewal, a refused reserved-book renewal and the stored records after each. B has stronger evidence for these cases. That demonstration still does not prove every browser, network condition or concurrent request works.',
   '## Carry this distinction forward','Ask three questions: whose problem are we solving, what behaviour counts as success, and what evidence supports it? Next, use the development lifecycle to organise the work that answers those questions.'
  ],[
   '## 从一个熟悉的小功能开始','图书馆希望读者在线续借。开发者做了一个“续借”按钮，点击后页面上的日期会改变。这就做完了吗？还没有：数据库里的到期日可能没变，这本书可能已被别人预约，工作人员也可能查不到失败原因。能演示按钮，与交付可靠服务之间，还有一段工程工作。',
   '## 写代码是其中一部分','编程把行为写成计算机能够执行的指令。软件工程还要处理：应该做什么、各部分怎样配合、失败时如何处理、怎么检查、怎么发布，以及上线后如何维护。这些活动不是为了增加文档数量，而是减少“看起来成功，实际没有完成”的情况。',
   '## 沿着一个结果看完整系统','本课使用虚构的图书续借案例：符合规则时，服务端保存新的到期日，读者看到同一个日期；已被他人预约时，拒绝续借并保持原日期。页面、业务判断、数据保存和结果提示共同完成一件事。只改页面，无法保证其他部分也已经完成。',
   '## 对照两种交付证据','甲组只展示按钮变绿；乙组展示正常续借、预约书被拒绝，并核对两种情况下的保存记录。乙组更能支持“这些情境已正确实现”的结论。但这仍不证明所有浏览器、网络异常和并发请求都没有问题，证据的范围要说清楚。',
   '## 带走三个检查问题','正在解决谁的问题？什么行为算成功？有什么证据支持？先用这三个问题观察软件，再学习下一节的生命周期。你不必先学会一门编程语言，也能判断一个团队是否遗漏了重要工作。'
  ]),
  checks:[question('Which result supports a completed renewal?','哪项结果更能支持“续借已完成”？',[
   ['The button turns green.','按钮变成绿色。'],['The saved due date and the reader’s confirmation agree.','保存的新到期日与读者看到的确认一致。'],['The page contains fewer lines of code.','页面的代码行数更少。']],1,[
   ['A visual change does not establish that the booking record changed.','视觉变化不能证明续借记录已经保存。'],['This checks the result across storage and the user-facing confirmation.','同时检查了保存结果和用户确认，比只看界面更完整。'],['Code length does not establish the renewal outcome.','代码长短不能证明业务结果正确。']]),
   question('The button works, but reserved books can still be renewed. What is missing?','按钮能用，但已被他人预约的书仍能续借，遗漏了什么？',[
    ['The agreed business rule and its check.','已约定的业务规则及对应检查。'],['A more modern colour palette.','更时髦的配色。'],['A different programming language, necessarily.','一定是需要换编程语言。']],0,[
    ['The behaviour violates the stated refusal rule.','这违反了预约书应拒绝续借的约定，需要实现并检查该规则。'],['Styling does not enforce eligibility.','配色不能执行续借资格规则。'],['The evidence identifies a rule defect, not a language limitation.','目前证据指向规则缺陷，不能据此断言必须换语言。']])]
 },
 {
  id:'d2',minutes:12,title:T('Follow a change through the lifecycle','跟着一次改动走完生命周期','跟著一次改動走完生命週期'),
  body:reading([
   '## A lifecycle is a map of work','The Software Development Life Cycle (SDLC) organises requirements, design, implementation, testing, deployment and maintenance. These are kinds of work, not a universal rule requiring six departments or one irreversible pass.',
   '## Give each activity a visible output','Requirement: agree when renewal is allowed. Design: decide which component checks eligibility and which stores the date. Implementation: build those behaviours. Testing: compare observed results with agreed examples. Deployment: make a checked version available. Maintenance: inspect incidents and evolve it.',
   '## Trace a change request','The library adds a rule: a reserved book cannot be renewed. First clarify which reservations count. Then locate the eligibility decision, change it, test allowed and denied cases, deploy the checked version and observe failures. A request to change one sentence can affect several activities.',
   '## Feedback can move backwards','If a test exposes an unclear rule, return to requirements. If a live incident reveals missing evidence, improve logging and tests. This is useful feedback, not proof that the lifecycle failed. The phases describe responsibilities; development methods decide how the work is sequenced.',
   '## Recognise the missing link','“The developer finished, so publish it” skips evidence about the built result. “It was tested locally, so it is already deployed” confuses two environments. Name the output you have and the output still missing before declaring a change complete.'
  ],[
   '## 生命周期是一张工作地图','软件开发生命周期（SDLC）把需求、设计、实现、测试、部署、维护串起来。它们是工作类型，不意味着必须设六个部门，也不意味着每项只能做一次。先知道这些工作分别回答什么问题，再理解不同开发方法如何安排它们。',
   '## 每项工作都有可观察的产物','需求明确哪些情况下允许续借；设计决定哪个部分判断资格、哪个部分保存日期；实现让这些行为真正运行；测试对照规则检查实际结果；部署把经过检查的版本提供给用户；维护处理运行问题并继续演进。产物不一定都是长文档，也可以是明确规则、代码、测试记录或发布记录。',
   '## 追踪一次具体变更','图书馆增加规则：“被他人预约的书不能续借。”先确认哪些预约状态有效，再找到资格判断的位置，修改实现，检查允许和拒绝两条路径，发布对应版本，观察拒绝是否被正确记录。需求只有一句话，却不代表只要修改一行代码就能结束。',
   '## 发现问题可以回头','测试时发现“预约有效”没有定义，应回到需求澄清；上线后发现查不到失败原因，应补充记录并增加回归检查。回头不等于流程失败，而是获得了新证据。生命周期说明有哪些工作，瀑布或迭代等方法说明如何组织和重复这些工作。',
   '## 看清完成了哪一步','“开发者写完，所以直接发布”缺少检查结果；“本地测试通过，所以用户已经用到了”混淆了测试环境和实际部署。讨论进度时，指出已经具备的产物与还缺的产物，比笼统地说“差不多完成”更可靠。'
  ]),
  checks:[question('A test reveals that “active reservation” is undefined. What next?','测试发现“有效预约”没有定义，下一步应该做什么？',[
   ['Treat every reservation as active without asking.','不询问，直接把所有预约都算有效。'],['Skip the case because implementation is finished.','实现已完成，所以跳过这种情况。'],['Clarify the rule, then update the implementation and test.','澄清规则，再同步实现与测试。']],2,[
   ['That silently invents a policy.','这样会把未确认的猜测变成业务政策。'],['Finishing code does not resolve an ambiguous requirement.','写完代码不能消除需求歧义。'],['Feedback returns to the activity that owns the missing decision.','把缺失决定带回需求环节，再让实现与检查保持一致。']]),
   question('A build passed tests on a laptop. What does this establish?','某版本在开发电脑上测试通过，这能说明什么？',[
    ['The tested cases passed in that environment.','该环境中的这些测试用例通过了。'],['Every user already has the new version.','所有用户已经用上了新版。'],['No maintenance will be needed.','以后不再需要维护。']],0,[
    ['Deployment and wider operating conditions still need separate evidence.','部署状态和其他运行条件仍需要各自的证据。'],['Passing a local test does not deploy software.','本地测试通过不会自动完成部署。'],['A finite test set does not eliminate future defects or changes.','有限用例无法排除未来缺陷或需求变化。']])]
 },
 {
  id:'d3',minutes:12,title:T('Understand responsibilities and handoffs','团队怎样分工，怎样交接','團隊怎樣分工，怎樣交接'),
  body:reading([
   '## Roles describe responsibility','A product or business representative clarifies desired outcomes and policies. Designers develop interactions. Developers implement behaviour. Test specialists investigate quality. Operations engineers help release and operate it. Small teams may combine roles, but the responsibilities still exist.',
   '## Trace one renewal across boundaries','The reader submits a book ID. The interface sends a request and explains the response. The server checks trusted identity, current reservation state and renewal eligibility, then saves the result. Storage records the state. Operations makes the deployed service observable. A hidden button cannot replace server-side authorization.',
   '## A handoff is an agreement','Suppose the server refuses a renewal. The interface needs an agreed error code and a safe message; testers need expected state changes; support needs enough information to identify an incident. Agree these before parallel implementation, rather than discovering incompatible assumptions at integration.',
   '## Shared quality does not mean no owner','Everyone contributes to quality. That does not mean a developer may invent a business policy or that testing alone owns all defects. Identify a decision owner, a person doing the work and the people who need to review its effects.',
   '## Use a concrete handoff','For this case, “reserved” means a server refusal with code RESERVED and an unchanged due date. The interface shows a clear explanation. That small contract lets frontend, backend and testing work together without requiring a long document.'
  ],[
   '## 角色描述责任，不只是职位名称','业务或产品负责人澄清目标与政策；设计人员组织用户如何操作；开发者实现行为；测试人员调查质量风险；运维相关人员帮助发布和运行。小团队可能一个人承担几项角色，但相应责任不会消失。没有专职测试，不等于可以不检查。',
   '## 沿续借请求观察边界','读者选择图书，界面发送请求并解释结果；服务端根据可信身份、当前预约状态和续借规则做判断，再保存结果；存储记录状态；运行环境让团队能够观察故障。前端隐藏按钮可以减少误操作，却不能替代服务端权限检查，因为请求不一定来自这个页面。',
   '## 交接要有共同约定','假设服务端拒绝续借：界面需要知道错误码和安全提示，测试需要知道到期日是否应保持不变，支持人员需要能够定位这次失败。最好在并行开发前约定这些接口行为，而不是合并时才发现前端把拒绝当成了成功。',
   '## 共同负责，不等于谁都能拍板','所有角色都参与质量，但开发者不能因为方便就改业务政策，测试也不应成为所有缺陷的唯一责任人。遇到决定时，分清谁有权确认规则、谁负责实现、谁需要检查影响。一个人可以兼任，决定仍应有依据。',
   '## 看一个小而完整的交接','本案例约定：“已被他人预约”时，服务端返回 RESERVED，原到期日保持不变，界面显示明确原因。这个小约定同时指导前端、后端和测试。交接的价值不在于写得长，而在于不同参与者对同一情境有一致预期。'
  ]),
  checks:[question('The page hides Renew for an ineligible reader. Is that sufficient authorization?','页面对无资格读者隐藏了续借按钮，这就完成权限控制了吗？',[
   ['Yes, because a hidden button cannot be clicked.','是，按钮隐藏后不能被点击。'],['No; the server must check every renewal request.','否，服务端仍需检查每次续借请求。'],['Only testers can decide authorization rules.','只有测试人员能决定权限规则。']],1,[
   ['Requests can arrive independently of this interface.','请求可以绕过这个界面，隐藏按钮不能保证权限。'],['The trusted decision belongs at the server boundary.','可信权限判断要在服务端边界执行。'],['Policies need an accountable business owner and technical enforcement.','政策需要明确负责人，技术实现负责落实；不是由测试单方面决定。']]),
   question('Which handoff helps frontend, backend and testing agree?','哪种交接更能让前端、后端和测试形成一致预期？',[
    ['“Make renewal work somehow.”','“想办法让续借能用。”'],['“We will choose error meanings after release.”','“上线以后再确定错误是什么意思。”'],['“RESERVED means refusal, a clear explanation and an unchanged due date.”','“RESERVED 表示拒绝、提示原因，并保持原到期日。”']],2,[
    ['This leaves failure behaviour unspecified.','失败时如何处理仍然没有约定。'],['Delaying the agreement increases integration risk.','推迟约定会让各方带着不同假设开发。'],['This specifies a shared response and observable state.','同时约定响应含义和可观察状态，三方都能据此工作。']])]
 },
 {
  id:'d4',minutes:12,title:T('Deliver in small, usable iterations','小步迭代：每次交付一个可用结果','小步迭代：每次交付一個可用結果'),
  body:reading([
   '## Iteration is a feedback loop','An iteration selects a bounded goal, builds it, checks it and reviews evidence before choosing the next step. It is not simply doing the same work faster, nor a promise to accept every change immediately.',
   '## Slice a usable outcome','For the renewal service, a small increment can let eligible readers renew one book and see its saved due date, with a clear refusal for a reserved book. “All screens drawn, no data saved” is a horizontal layer of unfinished behaviour, not that usable outcome.',
   '## Compare ways of organising work','A more sequential process can suit stable requirements and formal approval needs. Iterative delivery helps when usage and priorities need early feedback. Real projects often combine them. Neither approach removes the need for design, tests, documentation or controlled release.',
   '## Handle change without pretending capacity grew','Halfway through a short iteration, someone requests personalized book recommendations. Investigate the value and urgency. If capacity is unchanged, defer it, replace other work with agreement, or renegotiate the goal. Adding it silently makes the original commitment less credible.',
   '## Review evidence, not just output volume','Ask whether readers completed the intended task and which problems remained. Three finished screens may reveal less than one complete, checked renewal. A review should inform the next decision; it does not automatically certify the whole service.'
  ],[
   '## 迭代是一圈反馈，不只是加快速度','一次迭代选择有限目标，完成实现和检查，再根据观察决定下一步。它不是把大计划切成几个日期，也不是任何新要求都必须立即加入。每圈应带来能用于判断的结果，避免一直忙，却迟迟不知道方向是否正确。',
   '## 按可用结果切一小块','续借服务的首个增量可以是：符合规则的读者续借一本书，看到已保存的新日期；不符合规则时得到明确拒绝。“所有界面画好了，但都不能保存”只是完成了一层技术工作，不等于交付了这条可用流程。',
   '## 方法要看情境选择','需求稳定、存在正式审批时，较顺序化的安排可能有价值；需要尽早验证用户行为和优先级时，迭代能够更早得到反馈。实际项目可以结合使用。采用敏捷并不意味着不做设计、不写必要记录，或让测试等到最后才补。',
   '## 变更不会凭空增加容量','一轮短迭代进行到一半，有人要求增加个性化荐书。先检查价值与紧迫性。如果容量没变，就明确延期、协商替换其他工作，或重新约定目标。默默加进去再声称原承诺不受影响，会让计划失去可信度。',
   '## 评审看证据，不比页面数量','读者能否完成预定任务？哪里失败？下一轮最该处理哪个问题？三个半成品页面未必比一条检查过的续借流程更有价值。评审用于帮助下一次决策，不能因为演示顺利就认定整个服务已经可靠。'
  ]),
  checks:[question('Which increment can provide useful user feedback?','哪个增量更能带来有用的用户反馈？',[
   ['One complete renewal path with saved results and refusal handling.','一条能保存结果、处理拒绝的完整续借流程。'],['Every screen drawn, but no renewal can be saved.','所有界面画完，但都不能保存续借。'],['Only an empty database schema.','只有一份空数据库结构。']],0,[
   ['A user can attempt the intended task and reveal concrete problems.','用户能真正尝试任务，团队可以观察具体问题。'],['The promised user task cannot yet be completed.','还不能完成承诺的用户任务。'],['It can be useful technical work, but alone cannot test the user workflow.','它可能是必要技术工作，但单独无法验证使用流程。']]),
   question('New work arrives but capacity is unchanged. What is a credible response?','增加了新任务，容量却没变，怎样应对更可信？',[
    ['Accept everything and keep every previous promise unchanged.','全部接受，并声称原承诺完全不变。'],['Discuss priority and defer, replace or renegotiate work.','讨论优先级，明确延期、替换或重新协商。'],['Reject any future feedback because the plan exists.','计划已经存在，所以拒绝今后一切反馈。']],1,[
    ['This ignores the effect on scope and capacity.','没有处理范围扩大与容量不变之间的矛盾。'],['A visible trade-off preserves an accountable commitment.','把取舍说清楚，承诺才有依据。'],['A plan supports change decisions; it does not forbid feedback.','计划帮助处理变化，不是禁止反馈。']])]
 },
 {
  id:'d5',minutes:14,title:T('Judge quality using evidence','软件质量：好用之外，还要可靠吗？','軟體品質：好用之外，還要可靠嗎？'),
  body:reading([
   '## Functionality is one quality dimension','A service can offer renewal yet lose saved dates, expose another reader’s information or become unmaintainable. Correct behaviour, reliability, usability, security and maintainability concern different risks. Improving one does not automatically improve them all.',
   '## Make a quality claim inspectable','“Fast” is vague. For this fictional exercise, the team agrees that 95% of renewal responses should finish within two seconds under 20 concurrent readers in a specified test environment. The load, threshold and environment make the claim checkable. These numbers are teaching inputs, not a universal standard.',
   '## Read results with their scope','A single successful renewal supports one functional example. A controlled load test supports a performance observation in that setup. Neither establishes access control, and neither guarantees every future request. Match the evidence to the actual claim.',
   '## Check a release decision','Suppose the happy path passes, but cancelled requests sometimes change the due date and rollback has not been checked. A beautiful interface is insufficient reason to release. Fix or contain the risks and agree a recovery plan; do not hide them behind an overall satisfaction score.',
   '## Connect the course map','You have now seen the problem, lifecycle, roles, iteration and quality. The next course examines requirements: how to turn a vague request into rules and acceptance examples. Later courses deepen design, construction, testing and operation. Games are optional and separate.'
  ],[
   '## 功能齐全，只代表其中一面','一个服务可以有续借功能，却丢失已保存的日期、泄露其他读者的信息，或变得谁都不敢修改。正确性、可靠性、易用性、安全性、可维护性关注不同风险。界面好看不能自动证明数据可靠，运行快也不能自动证明没有越权。',
   '## 让质量要求可以检查','“系统要快”太模糊。本教学案例约定：在指定测试环境、二十位读者并发操作时，百分之九十五的续借响应应在两秒内完成。负载、阈值与环境明确后，才能共同检查。这里的数字只是练习设定，不是所有系统都应采用的通用标准。',
   '## 证据要对得上结论','一次续借成功，支持一个功能例子；受控负载测试，支持该条件下的性能观察。它们都不能替代访问权限检查，也不能保证今后每一次请求都成功。看报告时，要问测了什么、没测什么，而不是只看一个绿色通过标记。',
   '## 试着做一次发布判断','正常路径已通过，但取消请求偶尔仍会修改到期日，恢复旧版本的方法也没检查。此时不能因为界面漂亮就宣布发布。应先修复或限制已知风险，并明确恢复办法。质量判断需要具体证据，不应被一个笼统满意度分数掩盖。',
   '## 把这张地图接到下一门课','你已认识问题、生命周期、角色、迭代和质量。下一门需求分析会继续讲：怎样把模糊请求变成规则与验收例子。后面的设计、构建、测试和维护分别深入一段工作；游戏独立放置，不要求通关才能学课。'
  ]),
  checks:[question('One renewal succeeded. Which claim is supported?','一次续借成功，目前能支持哪项结论？',[
   ['The service is secure for all readers.','服务对所有读者都是安全的。'],['It will meet every future load level.','以后任何负载都能承受。'],['That tested renewal scenario succeeded.','这次被检查的续借情境成功了。']],2,[
   ['A functional success is not an authorization assessment.','功能成功不是权限安全评估。'],['One request does not measure load behaviour.','单个请求没有测量负载能力。'],['The conclusion stays within the observed evidence.','结论没有超出实际观察范围。']]),
   question('Which claim is most directly checkable?','哪项质量要求最容易形成共同检查标准？',[
    ['Under the stated environment and 20-reader load, 95% of responses finish within two seconds.','在约定环境和二十人并发负载下，百分之九十五响应在两秒内完成。'],['The service feels professional.','服务给人专业的感觉。'],['The service should never have any problem.','服务永远不要出现任何问题。']],0,[
    ['The stated load, threshold and environment define a bounded check.','负载、阈值和环境共同界定了一项有边界的检查。'],['Different people may interpret “professional” differently.','专业感缺少共同观察标准，不同人可能理解不同。'],['An unbounded promise has no practical finite acceptance check.','无限范围的承诺无法通过有限验收直接证明。']])]
 }
];

export function softwareFoundations(previous){return rows.map(l=>({
 ...l,type:'read',check:l.checks[0],workshop:previous.find(old=>old.id===l.id)?.workshop,
 hint:l.checks[0].options[l.checks[0].correct].feedback,
 advanced:T('Follow the evidence across boundaries: interface, saved state, failure response and operating environment. A passing observation only supports the conditions actually checked. Keep unresolved assumptions visible before committing to a release.','进一步沿边界追踪证据：用户界面、保存状态、失败响应、运行环境。一次通过只支持已检查的条件；承诺发布前，还要显式记录尚未核对的假设。')
}));}
