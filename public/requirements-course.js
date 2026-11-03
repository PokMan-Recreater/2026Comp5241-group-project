import {tri} from './i18n.js';

// Original teaching cases. No model calls, generated grading, or remote exercises.
const text=(en,cn)=>tri(en,cn,cn);
const choice=(question,options,correct,reasons)=>({question,options:options.map((label,i)=>({text:label,feedback:reasons[i]})),correct});
const Q=(en,cn,options,correct,reasons)=>choice(text(en,cn),options.map(([a,b])=>text(a,b)),correct,reasons.map(([a,b])=>text(a,b)));
const blocks=(en,cn)=>text(en.join('\n\n'),cn.join('\n\n'));
export const requirementsMetadata={
 description:text('Learn to investigate a booking problem, write a useful user story and test a small first-release scope. Six lessons with worked examples and twelve objective checks.','围绕会议室预约，学会调查问题、整理证据、写用户故事、检查验收条件与首版范围。六节讲解配十二道客观练习。'),
 deliverable:text('Identify sound requirements and verify acceptance examples.','识别有依据的需求，检查验收例子与范围取舍。'),
 outcomes:text('Distinguish facts from assumptions, ask non-leading questions, identify user value, and check boundaries and release scope.','区分事实与假设，识别有效访谈问题，判断用户价值，并检查时间边界与交付范围。')
};
const lessons=[
 {
  id:'r1',title:text('Start with the problem, not a feature','先说清问题，再讨论功能'),minutes:12,
  body:blocks([
   '## The request is not the requirement','A department asks for a “smarter meeting-room booking page”. This names a direction, but says nothing about who is struggling or what must improve. Building notifications immediately could make the wrong process more efficient.',
   '## Follow the existing workflow','In this fictional case, staff choose a time, message the receptionist, and wait for confirmation. Last week, two requests for the same room and time were both confirmed. The receptionist had copied messages into separate spreadsheets. The failure occurred at confirmation, not at room discovery.',
   '## A useful problem statement','“Staff cannot reliably know whether a room is reserved because separate confirmations can overlap. We need a single confirmed booking for each room and overlapping period.” This identifies an actor, a failure and a desired outcome. It does not prescribe a database or mobile app.',
   '## Separate outcome from implementation','The outcome is preventing conflicting confirmations. A calendar is one possible interface; a transaction is a possible technical mechanism. Neither is evidence that the problem is solved. Check the outcome using conflicting requests, including simultaneous ones.',
   '## Before moving on','Ask which events count as a conflict, who can confirm a booking, and whether cancelled bookings block time. Do not invent these policies. A clear unresolved question is more useful than a precise but unsupported rule.'
  ],[
   '## “做个智能预约”还不是需求','部门说：“会议室预约太乱，做一个智能预约页面吧。”这句话提出了一个方向，却没有说明谁遇到了什么困难。直接做日历、提醒和推荐算法，很可能只是把原来有问题的流程包装得更漂亮。需求分析的第一步，是找到具体失败，而不是先列功能。',
   '## 沿着真实流程找断点','本课的虚构案例：员工选时间，发消息给前台，等前台确认。上周，同一会议室的重叠时段被确认了两次。前台把不同群聊的消息抄进两份表格，确认时没有统一检查。问题发生在“确认预约”这一步；目前没有证据表明员工找不到会议室。',
   '## 把问题写到可以讨论','较好的问题描述是：“员工无法可靠判断会议室是否已被占用，因为分散的确认可能产生时间冲突；需要保证同一会议室的重叠时段最多只有一个有效确认。”它包含使用者、当前失败和期望结果，却没有提前指定技术方案。',
   '## 结果与方案分开看','“不产生冲突确认”是结果；“增加日历”是界面方案；“使用数据库事务”是实现手段。三个层次不能互相替代。即使日历很漂亮，两个并发请求仍然可能同时成功，所以验收时必须尝试冲突请求，而不是只看页面能否打开。',
   '## 先留问题，不急着拍板','还需要确认：相邻但不重叠的时段算冲突吗？取消后的预约还占时间吗？谁有权确认？这些都是业务政策，不能因为程序好写就自行决定。下一节要学习如何从访谈中取得这些信息。'
  ]),
  checks:[Q('Which statement describes an outcome?','哪一句描述了要达成的结果？',[
   ['Use a blue calendar.','使用蓝色日历。'],['Prevent overlapping confirmed bookings for one room.','同一会议室不出现重叠的有效确认。'],['Use a relational database.','使用关系数据库。']],1,[
   ['Colour describes a design, not the booking failure.','颜色是设计选择，没有说明预约问题是否解决。'],['This can be tested against the reported failure.','可以通过构造冲突预约来检查这个结果。'],['Storage is an implementation decision.','数据库属于实现选择，并不是业务结果。']]),
   Q('What should be checked before adding reminders?','决定增加提醒前，最该先确认什么？',[
    ['Where the current process fails.','现有流程具体在哪一步失败。'],['Which animation looks best.','哪种动画最好看。'],['How many features competitors have.','竞品有多少功能。']],0,[
    ['The failure determines whether reminders address the problem.','只有知道断点，才能判断提醒是否真的解决问题。'],['Animation cannot establish the cause.','动画无法证明问题的原因。'],['Feature counts do not explain this workflow.','功能数量不能解释本案例的流程问题。']])]
 },
 {
  id:'r2',title:text('Ask for evidence in an interview','访谈：追问经历，不诱导答案'),minutes:14,
  body:blocks([
   '## Ask about a specific event','“Would an app be useful?” invites agreement. “Tell me about the last conflicting booking: what happened before each confirmation?” produces evidence about the workflow. Start with a real event, reconstruct the steps, then ask about exceptions.',
   '## Compare responsibilities','The employee wants a reliable confirmation. Reception needs to resolve conflicts. Facilities needs a maintenance block. These are different responsibilities, not competing votes. Ask each person what information they had and what decision they were allowed to make.',
   '## Worked interview','Employee: “I received a confirmation at 09:00.” Receptionist: “The other request was in a second spreadsheet.” Follow-up: “Can you show the two confirmations and their timestamps?” This checks the claim without blaming the receptionist or assuming an interface caused it.',
   '## Investigate disagreement','If reception says managers may override a booking but an employee says confirmed bookings are guaranteed, record a policy conflict. Do not silently choose the most senior speaker. Ask the policy owner to decide who can override, under what conditions, and how the displaced user is informed.',
   '## A repeatable sequence','Choose a concrete event → reconstruct its steps → inspect supporting material → investigate exceptions → confirm your understanding. This sequence guides investigation; it is not a rigid script that prevents useful follow-up.'
  ],[
   '## 从一次具体经历开始','“如果有个 App，你会不会用？”很容易得到礼貌的“会”。更有用的问题是：“请说一下最近一次撞期，从提交到确认分别发生了什么？”让对方回忆时间、动作和看到的信息，才能找到可核对的事实。先了解经历，再讨论方案。',
   '## 不同人负责不同决定','员工需要可靠的确认，前台需要处理冲突，设施管理员需要封闭维修时段。这不是简单的多数投票。分别问清：当时你知道什么？你负责哪一步？你有权改变什么？同一句“可以取消”，对不同角色可能意味着完全不同的权限。',
   '## 看一段有效追问','员工：“我九点收到了确认。”前台：“另一笔预约记在第二份表里。”下一问应是：“能一起看一下两条确认和对应时间吗？”这样能检查是否真有重叠，也能发现确认顺序。问“是不是你忘了看表”会让对方防御，而且提前假定了原因。',
   '## 意见冲突要转成待决政策','前台说经理可以临时占用，员工却认为确认后一定能使用。不要偷偷选择职位更高的一方。记录冲突，请业务负责人明确覆盖预约的条件、权限以及如何通知被影响的人。访谈者负责暴露不一致，不负责凭空发明制度。',
   '## 可复用的调查顺序','具体事件 → 还原步骤 → 核对材料 → 询问例外 → 复述确认。复述时可以说：“所以你收到成功提示后，没有其他地方可以查看最终状态，对吗？”这让对方纠正误解。完成后再把事实、个人诉求和未验证判断分别记录。'
  ]),
  checks:[Q('Which follow-up is least leading?','哪一个追问最不容易诱导答案？',[
   ['Would automatic reminders solve everything?','自动提醒是不是就全解决了？'],['Did reception make a mistake?','是不是前台犯错了？'],['What did you see after submitting the last request?','上一次提交后，你实际看到了什么？']],2,[
   ['This suggests a solution before establishing the cause.','问题还没查清，就把答案引向了提醒。'],['This assumes blame before checking the steps.','尚未还原过程就先归责，会影响回答。'],['A concrete observation can be checked without prescribing a cause.','它要求具体观察，不预设原因，方便进一步核对。']]),
   Q('Two stakeholders disagree about manager overrides. What next?','两人对经理能否覆盖预约说法不一，下一步呢？',[
    ['Ask the policy owner to clarify conditions and consequences.','请业务负责人确认条件和后果。'],['Let the developer choose the easiest rule.','让开发者选最好实现的一种。'],['Accept the last answer.','以最后听到的说法为准。']],0,[
    ['This makes the policy conflict explicit and accountable.','把冲突显式交给有决策责任的人，才能形成可靠规则。'],['Implementation convenience does not establish authority.','容易实现不代表规则合法有效。'],['The order of answers is not evidence of authority.','发言先后不能证明谁有权确定规则。']])]
 },
 {
  id:'r5',title:text('Separate facts, needs and assumptions','区分事实、需要与假设'),minutes:12,
  body:blocks([
   '## Three labels, three different commitments','A fact is an observation supported by a source. A need describes a desired ability or outcome. An assumption is a claim still being treated as true without enough support. Labelling these prevents guesses becoming hidden requirements.',
   '## Sort the evidence','“The log contains two confirmations for room A, 10:00–11:00” is a fact if you inspected that log. “Users need a reliable reservation” is a need. “All employees prefer email” is an assumption until research supports it. The same sentence may change status after investigation.',
   '## Keep provenance','Record the source, date and context. One employee saying “email is best” establishes that employee’s stated preference, not a preference shared by everybody. A log confirms what the system recorded; it may not prove what happened physically in a room.',
   '## Resolve the risky assumptions first','If confirmation authority is unknown, designing approval around it risks rework. Verify that policy first. A button-colour preference can usually wait. Prioritise by the consequences of being wrong and the cost of checking, not by which detail is easiest to ask about.',
   '## Worked evidence chain','Log: two confirmations → need: prevent conflicting confirmations → open question: are cancelled bookings excluded? → agreed policy: cancelled bookings release time → acceptance example: a new booking after cancellation succeeds. Each step has a distinct purpose.'
  ],[
   '## 三种记录，承诺程度不同','事实是有来源支持的观察；需要是希望具备的能力或结果；假设是尚未获得充分支持、暂时当真使用的判断。把它们混在一张功能清单里，开发者就可能把猜测当作已经确认的制度。分类不是文字游戏，而是在提醒团队哪些内容仍需调查。',
   '## 看同一案例的三句话','“日志里有 A 会议室十点至十一点的两条成功确认”：如果确实核对过日志，这是事实。“员工需要可靠地保住已确认时段”：这是需要。“所有员工都喜欢邮件通知”：尚未调查时，这是假设。不要因为句子听上去合理，就把它提升为事实。',
   '## 来源的边界同样重要','记下来源、日期和场景。一个员工说“邮件最好用”，只能证明这位员工表达了这个偏好，不能证明所有人都这样想。日志能证明系统记录了什么，不一定能证明会议室现场发生了什么。结论不能比证据覆盖的范围更大。',
   '## 先验证会改变方案的假设','假如“任何经理都能覆盖预约”尚未确认，却已经据此设计审批和通知，后面很可能返工。先找负责人核实这条政策；按钮颜色可以稍后决定。验证优先级取决于猜错的损失和核对成本，而不是哪个问题最容易回答。',
   '## 串成可追踪的证据链','日志中的双确认 → 需要避免冲突 → 待确认取消后是否释放时段 → 负责人确认取消即释放 → 验收时检查取消后新预约成功。每一步都有作用：证据说明为什么做，政策说明按什么规则做，验收说明怎么检查。'
  ]),
  checks:[Q('Classify: “All employees prefer email”, with no supporting research.','没有调查支持的“所有员工都喜欢邮件”属于什么？',[
   ['Verified fact','已核实事实'],['Unverified assumption','待验证假设'],['Acceptance test result','验收测试结果']],1,[
   ['A universal preference needs supporting evidence.','全体偏好需要证据支持，不能仅凭感觉确认。'],['It may be plausible, but its scope is not established.','它可能合理，但目前没有证据支持这个范围。'],['No test or observed result is described.','这里没有执行测试，也没有观察结果。']]),
   Q('One employee reports preferring email. What is supported?','一位员工说自己更喜欢邮件，能得出什么结论？',[
    ['Every employee prefers email.','所有员工都喜欢邮件。'],['Email prevents booking conflicts.','邮件能够防止撞期。'],['That employee stated a preference for email.','这位员工表达了邮件偏好。']],2,[
    ['One participant does not represent the whole population.','一个人的意见不能代表全体。'],['A notification preference does not prove conflict prevention.','通知偏好无法证明系统能防止冲突。'],['This preserves the scope of the evidence.','结论没有超出证据范围。']])]
 },
 {
  id:'r6',title:text('Write a story with a useful outcome','用户故事：角色、动作、价值'),minutes:12,
  body:blocks([
   '## A conversation anchor','A user story captures who needs a capability and why: “As an employee, I want to cancel my own booking so that unused time becomes available.” It is an invitation to discuss rules, not a complete specification.',
   '## Make the value observable','“As a system, I want a database so the system works” describes infrastructure without a user outcome. Infrastructure can be necessary, but should be tracked as technical work with its own rationale. Do not force every engineering task into an artificial user story.',
   '## Split by usable behaviour','“Build the entire booking platform” is too broad. “View availability”, “confirm a booking” and “cancel my own booking” each produce a usable outcome. Splitting only into frontend, backend and database creates layers that may deliver no usable behaviour on their own.',
   '## Keep rules next to the story','For cancellation, discuss ownership, allowed booking states, deadlines and notification. A story alone does not establish these. Attach acceptance examples after agreement. If “cancel” also includes refunds, split the policy discussion before estimating.',
   '## Worked revision','Weak: “As a user I want a cancel button.” Better: “As the booking owner, I want to cancel a future booking so another employee can use the released time.” Still unresolved: exactly when does cancellation stop being allowed? Record this rather than silently choosing.'
  ],[
   '## 一句话建立讨论起点','用户故事常用“作为谁，我希望做什么，以便获得什么价值”。例如：“作为预约人，我希望取消自己未来的预约，以便把不用的时段让给其他员工。”角色说明谁需要能力，动作说明要做什么，价值说明为什么值得做。它是讨论的起点，并不是完整规格。',
   '## 不要把技术任务硬装成故事','“作为系统，我希望有数据库，以便系统正常工作”没有表达用户价值。数据库确实可能必需，但可以作为技术任务记录实现理由，不必为了套句式虚构一个用户。判断故事好坏，看它是否有清楚的使用情境，而不是有没有“作为”两个字。',
   '## 按可使用的行为拆分','“完成整个预约平台”范围太大；“查看可用时段”“确认预约”“取消自己的预约”各自能产生一个可体验的结果。只按前端、后端、数据库拆分，容易每层都做了一半，却没有任何一条流程能用。技术分工可以存在，但不能替代用户可见的交付目标。',
   '## 把规则补在故事旁边','取消预约还涉及：是不是本人？预约处于什么状态？最晚什么时候允许取消？是否通知前台？这些都不能从故事句式自动推出。先明确边界，再补验收例子。如果取消还涉及退款，需要额外澄清支付规则，不能默认为只是删除一行数据。',
   '## 比较一次修改','原句：“作为用户，我想要取消按钮。”修改后：“作为预约人，我希望取消自己未来的预约，让空出的时段重新可用。”后者不绑定按钮样式，也更容易讨论成功结果。但“未来”到底截止到开始前几分钟仍需确认，不能靠开发者随手写死。'
  ]),
  checks:[Q('Which story includes an actor, action and outcome?','哪个故事同时包含角色、动作和价值？',[
   ['Build a cancellation button.','做一个取消按钮。'],['As a booking owner, cancel my future booking to release unused time.','作为预约人，取消自己未来的预约，让空出的时段重新可用。'],['Use a faster database.','使用更快的数据库。']],1,[
   ['This is an interface instruction without the user outcome.','只指定界面，没有解释谁需要以及为什么需要。'],['Ownership and released availability make the outcome discussable.','角色明确，也说明了释放时段的价值。'],['This is technical work, not a complete user story.','这是技术任务，没有给出完整使用情境。']]),
   Q('Which split produces independently usable behaviour?','哪种拆分更容易交付独立可用的行为？',[
    ['View availability; confirm a booking; cancel a booking.','查看空闲；确认预约；取消预约。'],['CSS; database columns; half the API.','样式；数据库字段；半个接口。'],['Everything in one task.','所有内容合成一个任务。']],0,[
    ['Each item can be demonstrated through a user workflow.','每项都可以沿着用户流程展示和检查。'],['These are implementation layers and may remain unusable separately.','这只是实现层，单独完成后不一定能被用户使用。'],['A large task hides scope and delays feedback.','范围过大不利于检查和及时反馈。']])]
 },
 {
  id:'r3',title:text('Turn rules into acceptance examples','验收条件：把规则写到能测试'),minutes:16,
  body:blocks([
   '## An example needs a starting state','Given room A has a confirmed booking from 10:00 to 11:00, when another user requests 10:30 to 11:30, then reject the new request and preserve the original booking. A state, action and observable result are all present.',
   '## State the boundary policy','For this teaching case, time intervals are start-inclusive and end-exclusive. Thus 11:00–12:00 does not overlap 10:00–11:00. That is an explicit case rule, not a universal booking policy. A different organisation may require a cleaning buffer.',
   '## Test success, rejection and edges','A free slot should succeed. An overlap should fail. An adjacent slot should follow the boundary rule. A cancelled reservation should not block time. Two simultaneous requests must not both confirm an overlapping slot. A success-only example misses the original failure.',
   '## Avoid vague criteria','“The interface is friendly” has no agreed observation. Replace it with a concrete condition such as showing the room, start time and end time in the confirmation. A measurable condition can still be the wrong target; link every criterion back to a need.',
   '## Review one criterion','“Reject conflicts” omits which states count and what happens to stored data. “Reject an overlapping request against a confirmed booking without creating a new confirmed booking or modifying the original” closes those gaps. It still requires a concurrency test in implementation.'
  ],[
   '## 一个例子需要三个部分','前提：A 会议室十点到十一点已有有效确认。动作：另一位员工申请十点半到十一点半。结果：拒绝新请求，保留原预约不变。前提、动作、可观察结果齐全，别人才能按同样步骤检查。只写“不能撞期”，还不够清楚。',
   '## 先声明时间边界','本教学案例约定时段包含开始、不包含结束，所以十点至十一点与十一点至十二点可以相邻。它是本案例明确采用的政策，不是所有预约系统的通用事实。如果场地需要十分钟清洁，应先确认缓冲政策，再修改验收条件。',
   '## 不只检查成功路径','至少覆盖：空闲时段成功；重叠时段拒绝；相邻时段按边界规则处理；取消后释放时段；两个同时到达的冲突请求最多一个成功。最后一项尤其重要：两个人先后操作都正常，并不意味着同时点击也能保持约束。',
   '## 把模糊词换成观察点','“界面友好”没有共同检查标准。可以改为“确认页显示会议室、开始时间、结束时间”，但可测量也不等于有价值，还要回到员工需要可靠确认这个目标。不要为了容易打勾而添加一堆无关指标。',
   '## 逐步补全一条条件','“拒绝冲突”没有说哪些状态算占用，也没说拒绝后数据怎么办。较完整的表述是：“存在有效确认时，重叠的新请求被拒绝；不新增有效确认，也不修改原预约。”实现时还要用并发测试验证，不能把通过普通页面演示当成已经保证安全。'
  ]),
  checks:[Q('Confirmed 10:00–11:00; intervals exclude the end. What about 11:00–12:00?','已确认十点到十一点；按本课不包含结束时刻的规则，十一点到十二点呢？',[
   ['Always reject because the room is the same.','只要同一会议室就拒绝。'],['It overlaps for one minute.','它们重叠一分钟。'],['The intervals are adjacent, not overlapping.','它们相邻，但不重叠。']],2,[
   ['The conflict rule concerns time as well as room.','冲突要同时考虑会议室和时段。'],['The stated interval rule excludes the first booking’s end.','第一笔预约不包含结束时刻，不产生这一分钟重叠。'],['Exactly: the explicit case boundary permits adjacency.','正确，这是按已声明的案例边界得到的结果。']]),
   Q('Which test targets the original double-confirmation risk?','哪个测试能针对双重确认的核心风险？',[
    ['Open the calendar once.','打开一次日历。'],['Submit two conflicting requests simultaneously and inspect confirmations.','同时提交两个冲突请求，检查最多只有一个有效确认。'],['Change the button colour.','改变按钮颜色。']],1,[
    ['Rendering does not exercise competing updates.','页面显示正常，并没有检查竞争更新。'],['This tests the invariant when requests race.','它检查并发竞争时，业务约束能否仍然保持。'],['Colour cannot reveal conflicting confirmations.','颜色无法暴露双重确认问题。']])]
 },
 {
  id:'r4',title:text('Choose a small, complete first release','首版范围：小，但流程完整'),minutes:14,
  body:blocks([
   '## Small is not unfinished','A first release should let a user achieve a coherent outcome. Viewing a room without being able to reserve it does not deliver reliable booking. A polished recommendation screen is not a substitute for confirmation correctness.',
   '## Use value, dependency and risk','For this fictional release, capacity is six effort points: availability costs two, conflict-safe confirmation costs three, cancellation costs one, animated recommendations cost three. Availability plus confirmation plus cancellation uses six and supports the essential lifecycle. Estimates are case inputs, not real measured development times.',
   '## Do not trade away the core constraint','If the team cannot implement conflict-safe confirmation within capacity, reduce scope or renegotiate the release. Shipping knowingly conflicting confirmations contradicts the reason for building the product. Calling it an MVP does not make that contradiction acceptable.',
   '## Check readiness, not just priority','Before commitment, check ownership rules, boundary policy, examples, dependencies and unresolved questions. A high-value story with an undecided policy is not ready merely because it sits at the top of the list.',
   '## Your review checklist','Can a user complete the promised workflow? Are critical failures covered? Is effort within the agreed case budget? Are unresolved policies visible? Are deferred features explicitly named? These checks support a scope decision; they do not guarantee delivery.'
  ],[
   '## 小版本不等于半成品','首版应该让用户完成一条有意义的流程。只能看会议室、却不能可靠确认预约，并没有实现这门课的问题目标。相反，外观简单但能够查询、确认、取消的流程，已经能带来可体验的价值。先确定承诺的结果，再讨论删减。',
   '## 同时看价值、依赖和风险','本节虚构估算：查看空闲二点，防冲突确认三点，取消预约一点，动画推荐三点；首版容量六点。查询、确认、取消合计六点，能覆盖基本使用周期。这里的点数只是用于比较方案的教学输入，不是对真实开发时长的保证。',
   '## 核心约束不能靠删掉来省事','假如防冲突确认做不完，应缩小其他范围或重新协商交付，而不是让两笔冲突请求都成功，再称它为最小可用版本。因为避免冲突正是这个产品存在的理由。功能少可以接受，违背核心承诺不可以被名称掩盖。',
   '## 优先级高不代表已准备好','承诺前检查：谁有权限？时间边界定了吗？成功和拒绝例子齐了吗？有没有未解决的政策？必要依赖是否包含在估算内？一个价值很高、但规则还在争论的故事，不能仅因为排在第一位就直接进入开发。',
   '## 做一次交付前复核','用户能否走完承诺流程？关键失败是否有验收？容量是否足够？待决问题是否明确标记？哪些内容已经声明延期？需求分析到这里应形成一组相互对应的问题、规则、故事和验收例子，而不是越来越长的愿望清单。'
  ]),
  checks:[Q('Budget 6: availability 2, safe confirmation 3, cancellation 1, recommendations 3. Which scope delivers the core lifecycle?','预算六点：查询二点、安全确认三点、取消一点、推荐三点。哪组覆盖基本周期？',[
   ['Availability + safe confirmation + cancellation.','查询＋安全确认＋取消。'],['Availability + recommendations.','查询＋推荐。'],['All four.','四项全部做。']],0,[
   ['Six points cover discovery, reservation and releasing time.','正好六点，覆盖查询、预约和释放时段。'],['Five points fit, but users still cannot confirm a booking.','五点虽然没超预算，却无法完成预约。'],['Nine points exceed the stated capacity.','合计九点，超过题目容量。']]),
   Q('The cancellation deadline remains undecided. What should the team do?','取消截止时间仍未决定，应该怎么办？',[
    ['Let each programmer guess.','让程序员各自猜。'],['Declare it complete because it is important.','因为很重要，就认定它已经准备好了。'],['Resolve or explicitly defer the policy before committing.','承诺开发前确认政策，或明确延期。']],2,[
    ['Different guesses produce inconsistent behaviour.','各自猜测会产生不一致的行为。'],['Priority is not a substitute for readiness.','优先级不能替代就绪条件。'],['This makes the unresolved dependency visible.','把尚未解决的规则当成真实依赖处理，才能避免假承诺。']])]
 }
];

export function requirementsLessons(previous){
 return lessons.map(l=>({
  ...previous.find(p=>p.id===l.id),...l,type:'read',
  advanced:text('Trace every acceptance example to a policy and an observed problem. A passed example establishes only that case, not all possible states. Look for boundary, permission and concurrency cases before treating a rule as implemented.','把每个验收例子追溯到政策与原始问题。通过一个例子只证明该情境成立，不代表所有状态都正确；继续寻找边界、权限与并发情况，再判断规则是否真正落实。'),
  hint:l.checks[0].options[l.checks[0].correct].feedback,
  // Existing draft keys and legacy portfolio exports remain readable.
  workshop:previous.find(p=>p.id===l.id)?.workshop,
  interview:undefined,slides:undefined,check:l.checks[0]
 }));
}
