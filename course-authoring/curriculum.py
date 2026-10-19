"""Original course manuscript. Run with the OpenCC authoring tool on PYTHONPATH.

The public site consumes the generated curriculum.js; OpenCC is not a runtime dependency.
Cases, names, figures and sample submissions in this manuscript are fictional teaching material.
"""
from pathlib import Path
import json
from opencc import OpenCC

converter = OpenCC('s2twp')
def B(en, cn):
    return {'en': en.strip(), 'zh-CN': cn.strip(), 'zh-TW': converter.convert(cn.strip()).replace('線上下','線下').replace('覆盤','檢討').replace('反饋','回饋').replace('帖子','貼文')}
def Q(en, cn, options, correct):
    return {'question': B(en, cn), 'options': [{'text': B(*label), 'feedback': B(*feedback)} for label, feedback in options], 'correct': correct}
def W(title, brief, questions, sample, rubric):
    return {'title': B(*title), 'brief': B(*brief), 'questions': [B(*q) for q in questions], 'sample': B(*sample), 'rubric': [B(*r) for r in rubric]}
def L(id, title, body, advanced, workshop, kind='read', **kwargs):
    return {'id': id, 'title': B(*title), 'body': B(*body), 'advanced': B(*advanced), 'hint': B(*rubric_hint(workshop)), 'workshop': workshop, 'type': kind, 'minutes': 8, **kwargs}
def rubric_hint(w):
    return ('Start with the evidence in the case. ' + w['rubric'][0]['en'], '先回到案例里的证据。' + w['rubric'][0]['zh-CN'])
def C(id, title, description, outcomes, deliverable, topic, theme, lessons, prerequisite):
    return {'id': id, 'title': B(*title), 'description': B(*description), 'outcomes': B(*outcomes), 'deliverable': B(*deliverable), 'prerequisite': B(*prerequisite), 'topic': topic, 'theme': theme, 'duration': sum(l['minutes'] for l in lessons), 'status': 'published', 'source': 'built-in', 'curriculumVersion': 2, 'lessons': lessons}

courses = []
courses.append(C('development', ('Software development: from brief to release', '软件开发：从需求到发布'),
 ('Plan the first release of a campus second-hand book service. Learn what happens before and after the code is written.', '为校园二手书服务安排第一个版本，了解写代码前后各要做哪些工作。'),
 ('Distinguish an outcome from a feature; plan a small release; explain where testing and user feedback belong.', '区分目标和功能，安排范围适当的首版，解释测试与用户反馈应该放在哪里。'),
 ('A first-release plan with a test and a feedback method.', '一份包含测试与反馈方法的首版计划。'), 'foundations', 'mint', [
 L('d1', ('Read the brief before choosing the technology', '先读清楚委托，再选技术'),
 ('''## The brief
The student union wants a second-hand book website before term starts. Its message lists chat, online payment, seller ratings and a recommendation feed. You have two weeks. Nobody has yet spoken to a buyer.

It is tempting to turn this list into a development checklist. First ask what the service is meant to improve. Perhaps buyers cannot find books for their course. Perhaps sellers forget to remove sold books. Those are different problems, and a recommendation feed does not automatically solve either one.

## A useful first conversation
Ask a student to describe their most recent attempt to buy a used book. Where did they look? What information was missing? At what point did the exchange fail? A recent example gives you something to investigate. “Would you use our new website?” mainly invites politeness.

## From observation to a small release
Suppose five buyers report that old advertisements waste their time. A plausible first release is a searchable list with a visible availability status and a seller contact link. Payment can remain outside the service. This is a hypothesis to test, rather than proof that every student has the same problem.''',
 '''## 项目委托
学生会希望在开学前上线二手书网站。邮件里列了聊天、在线支付、卖家评分和推荐信息流。你们有两周时间，还没有访谈过买书的同学。

不要急着把这张功能表变成开发清单。先问：现在的交易在哪一步出问题？可能是买家找不到对应课程的书，也可能是书卖掉以后旧帖子一直没有删除。两个问题的解决办法不同，推荐信息流未必能帮上忙。

## 第一轮怎么问
请一位同学回忆最近一次购买二手书的经过：去哪里找？缺少什么信息？哪一步没谈成？具体经历便于继续追问。“如果我们做个网站，你会不会用？”很容易只得到一句客气的“会”。

## 缩小第一个版本
假设五位买家都提到旧帖子浪费时间，可以先验证一个方案：可搜索的书单、明确的在售状态和卖家联系方式。交易暂时在线下完成。这是根据访谈提出的假设，还不能说明全校学生都有同样的问题。'''),
 ('Separate the outcome metric from a proxy. A count of listings does not show whether buyers find available books. Define an observation window, the denominator and how you would record unsuccessful searches. Five interviews can reveal a problem; they do not estimate its prevalence reliably.', '区分结果指标和替代指标。上架数量并不能证明买家找到了仍在出售的书。说明观察周期、分母，以及怎样记录没有成功的搜索。五次访谈可以发现问题，但不足以可靠估计问题在全校出现的比例。'),
 W(('Prepare a one-page brief', '整理一页项目说明'), ('Use the fictional interview finding above. Write a proposal the student union could question.', '根据上面的访谈发现，写一份便于学生会讨论的建议。'), [('What problem will the first version address? Cite the observation.', '首版要解决什么问题？依据是哪条观察？'), ('Which two capabilities belong in the first release? What can wait?', '首版保留哪两个能力？什么可以暂缓？'), ('What would you observe to decide whether the release helped?', '观察什么，才能判断首版有没有帮助？')],
 ('Problem: buyers lose time contacting sellers whose books are already sold. Evidence: five recent buying accounts, to be checked with more users. First release: search by course or book title, and show a seller-maintained availability status. A contact link can use an existing channel. Defer payment and recommendations. During a one-week pilot, record whether a buyer can find an available matching book and the reasons unsuccessful searches fail. Do not claim the pilot proves campus-wide demand.', '问题：买家花时间联系已经卖掉书的卖家。依据是五位同学的近期购买经历，仍需向更多用户核实。首版支持按课程或书名搜索，并由卖家维护在售状态；联系卖家先使用现成渠道。暂缓支付和推荐。试用一周，记录买家是否找到符合需要且仍在出售的书，并记录失败原因。不能把小范围试用当成全校需求已经得到证明。'), [('Name a user and a problem, rather than restating the feature list.', '写清具体用户和问题，不要只复述功能表。'), ('Keep the proposed scope feasible within two weeks.', '首版范围要与两周时间相称。'), ('Use an observable outcome, including unsuccessful attempts.', '观察真实结果，也记录没有成功的尝试。')]),
 check=Q('Which question is most useful in the first interview?', '第一次访谈中，哪个问题最有帮助？', [
 (('Would you use an AI-powered book website?', '你会使用 AI 二手书网站吗？'), ('It asks for a prediction and introduces your preferred solution before you understand the current difficulty.', '它要求对未来作预测，而且过早引入了你偏好的方案。')),
 (('Tell me about the last time you tried to buy a used textbook.', '说说你最近一次买二手教材的经过。'), ('A recent event lets you ask about the actual steps, obstacles and workarounds. It is still one person’s account, not a representative survey.', '近期经历便于追问真实步骤、阻碍和替代办法；但一个人的经历仍不代表所有用户。')),
 (('Should the button be yellow or purple?', '按钮应该用黄色还是紫色？'), ('Appearance matters later, but it does not establish which problem the service should solve.', '外观可以以后讨论，现在还没有明确服务要解决什么问题。'))], 1)),
 L('d2', ('Follow one change through the development process', '跟着一个改动看开发流程'),
 ('''## A change with consequences
A seller wants to mark a book as sold. Before coding a button, decide who may change a listing and what buyers should see afterwards. “Mark as sold” is the feature; the owner check and the resulting search behaviour are part of its requirements.

Design comes next: the listing needs an owner and an availability state. Development implements the interface and the server operation. Tests should include the seller’s normal request, a different user’s request, and a repeated click.

## Release is not the finish line
After deployment, a seller reports that the button appears to work, but a refresh restores the old status. The browser changed its display without saving to the server. The report sends us back to implementation and testing. It does not require starting the entire project again.

A development lifecycle names kinds of work. It need not mean one long, irreversible sequence. A small change can pass through clarification, design, implementation, checking and observation several times.''',
 '''## 一个按钮牵动哪些工作
卖家希望把教材标记为“已售”。写按钮以前，先明确谁能修改帖子，以及修改后买家会看到什么。“标记已售”是功能，身份检查和搜索结果的变化也是需求的一部分。

设计时，帖子需要保存发布者和出售状态。开发时，既要做界面，也要实现服务端操作。测试至少检查：卖家正常修改、其他用户尝试修改，以及连续点击两次。

## 发布以后还有工作
上线后，一位卖家反映：点完按钮似乎成功了，但刷新页面又变回“在售”。原因是浏览器只改了显示，没有把状态保存到服务器。这个反馈会让我们回到实现和测试，而不必把整个项目从头再做一遍。

开发生命周期描述的是几类工作，不一定是一条只能往前走的长流水线。一个小改动也会经历澄清、设计、实现、检查和观察，并根据发现反复调整。'''),
 ('For this change, identify the authoritative state and the trust boundary. The server must derive the owner from the authenticated session and stored listing, not accept an ownerId supplied by the browser. A UI-only check improves usability but does not authorize an update.', '指出该改动的权威数据来源和信任边界。服务端应根据登录会话及已保存的帖子判断发布者，不能直接相信浏览器提交的 ownerId。界面检查可以减少误操作，但不能替代权限校验。'),
 W(('Trace a change', '追踪一个改动'), ('A listing looks sold until the page is refreshed.', '帖子刚修改时显示已售，刷新后又显示在售。'), [('What behaviour did the user expect?', '用户期望什么行为？'), ('Which part of the system would you inspect first, and what evidence would you collect?', '先检查系统的哪个部分？收集什么证据？'), ('Write a check that would have caught this before release.', '写一个上线前本可发现该问题的检查。')],
 ('Expected behaviour: an owner’s successful update remains visible after reload and in another authorized session. Inspect the network request and the stored listing status; do not infer persistence from the colour of a button. Test by changing a listing, reloading, and fetching it again. Also verify that another user cannot perform the same update.', '预期行为：卖家的成功修改应在刷新后仍然保留，其他有权查看的用户也应看到新状态。先检查请求有没有发出，以及保存的帖子状态；不要仅凭按钮变色推断已持久保存。测试步骤是修改帖子、重新加载、再次读取状态，还要验证其他用户不能修改这条帖子。'), [('Separate a visible UI change from persisted data.', '区分界面显示改变和数据已经保存。'), ('Describe a reproducible check with an expected result.', '写出能够复现的步骤与预期结果。')]), 'slides',
 slides=[B('Clarify: the owner can mark their own listing as sold.', '澄清：发布者可以将自己的帖子标记为已售。'), B('Design: store owner and status; identify the server operation.', '设计：保存发布者与状态，明确服务端操作。'), B('Implement and test: try the owner, another user and a repeated request.', '实现和测试：检查发布者、其他用户及重复请求。'), B('Release and observe: reload the page and ask a seller to try it.', '发布和观察：重新加载页面，请卖家实际试用。')] ),
 L('d3', ('Choose a release you can learn from', '安排一个能获得反馈的首版'),
 ('''## Small does not mean unfinished
The book service can launch without recommendations. It cannot sensibly launch with no way to tell whether a book is still available. A minimum viable release should support a useful task from beginning to end.

Consider two plans. Plan A builds separate pieces of search, chat, payments and ratings, but none can complete a transaction. Plan B lets a small group list a book, find it, contact the seller and close the listing. Plan B leaves out more features, yet teaches the team more about the core exchange.

## Set a stopping rule
Before the pilot, agree what would make you pause. For example, if users can edit another seller’s listing, stop the pilot and repair that behaviour. If buyers cannot find the subject filter, observe where they look before redesigning the page. A software defect and an uncertain design assumption need different kinds of evidence.

Write the reason for every postponed feature. “Not now” should preserve a decision, not lose the request.''',
 '''## 小版本也要能把事情做完
二手书服务可以暂时没有推荐功能，但不能让买家完全看不出书是否仍在出售。最小可用版本应该让用户从头到尾完成一项有用的任务。

比较两种安排：A 方案分别做了一点搜索、聊天、支付和评分，但没有一条流程能完整走通；B 方案让一个小范围的用户能够上架、找书、联系卖家和关闭帖子。B 少做了很多功能，却更适合检验交易过程是否可用。

## 提前约定什么时候暂停
试用前先约定停止条件。例如发现用户能修改别人的帖子，就暂停试用，先修复权限问题。若买家找不到学科筛选，则先观察他们会去哪里找，再考虑改界面。软件缺陷和设计假设需要的证据不同。

被推迟的功能要留下理由和重新讨论的条件。“以后再说”不应变成把用户的请求忘掉。'''),
 ('Specify entry and exit criteria for a pilot. Include ownership, recovery and a review date. A fixed two-week iteration is a planning choice, not a guarantee of value; the release still needs a coherent user task and a way to evaluate it.', '为小范围试用写进入条件和结束条件，包括负责人、恢复办法与复盘日期。两周迭代只是安排工作的方式，不会自动带来价值；版本仍需要完整的用户任务及评估方法。'),
 W(('Set the first-release boundary', '划定首版范围'), ('You have two developers for two weeks. Search, listing updates, payment and recommendations are requested.', '两名开发者，两周时间。当前有人提出搜索、更新帖子、支付和推荐四项需求。'), [('Describe the complete task a pilot user should be able to finish.', '试用者应该能完整完成什么任务？'), ('Choose what to defer and give a reason for each item.', '推迟哪些内容？分别说明理由。'), ('Name one release-blocking defect and one question to investigate during the pilot.', '列出一个阻止上线的缺陷，以及一个留待试用观察的问题。')],
 ('A pilot buyer finds an available book, contacts its owner and sees the listing closed after the sale. Defer integrated payment because existing payment arrangements are adequate for this experiment; defer recommendations until search failures provide evidence of need. Unauthorized listing edits block release. Whether the subject filter is understandable can be investigated with pilot users. Record a review date for both deferred features.', '试用买家可以找到仍在出售的书、联系发布者，并在成交后看到帖子关闭。暂缓站内支付，因为现有方式已能完成这次试验；暂缓推荐，等搜索失败的记录说明是否确有需要。越权修改帖子属于上线阻断问题。学科筛选是否易懂，可以在试用中观察。为推迟的两项功能约定重新讨论的时间。'), [('Preserve a complete user task.', '保留一条完整的用户流程。'), ('Distinguish a defect from an assumption that needs feedback.', '区分必须修复的缺陷与需要用户反馈的假设。')]) ),
 L('d4', ('Review a pilot without moving the goalposts', '怎样复盘一次试用'),
 ('''## The pilot notes
Eight students tried the book service. Six found a relevant listing. Four contacted a seller; two of those listings were already sold. One seller could not find the status control. No money changed hands through the website.

The team reports “75% success” because six of eight found a listing. That is a result for one step, not for the whole task. The notes do not establish how many exchanges were completed. Be precise about what was observed and what remains unknown.

## Decide what to do next
A reasonable next change is to make availability easier to maintain and then repeat the same task with new users. Adding a recommendation feed would not directly address the failure reported here.

Keep the original success criterion beside the results. If you change it after seeing the data, record why. A useful review contains the observation, its limits, a proposed change and the next check. It need not turn a small pilot into a grand claim about impact.''',
 '''## 试用记录
八名学生试用了二手书服务，六人找到相关帖子，四人联系了卖家；其中两条帖子里的书早已卖出。一位卖家找不到修改出售状态的入口。网站没有经手任何付款。

团队因为“八人中有六人找到帖子”而报告“成功率 75%”。这个数字只描述了其中一步，不能代表整项购买任务成功。现有记录也无法说明到底完成了多少次交易。报告时要分清实际观察与仍然未知的部分。

## 决定下一次改什么
一个合理的后续动作是让卖家更容易维护出售状态，再让新用户尝试同样的任务。此时增加推荐信息流，并不能直接解决记录中出现的问题。

把试用前的成功标准与结果放在一起。如果看到数据后修改了标准，要记录原因。复盘写清观察、局限、下一项改动及验证办法就够了，不必把一次小范围试用包装成显著成效。'''),
 ('The sample is small and self-selected. Report counts alongside proportions, distinguish funnel stages, and avoid causal claims about the redesign without a comparison. Record missing outcomes explicitly rather than treating them as successes or failures.', '样本很小，而且参与者并非随机抽取。比例旁边保留人数，区分各个流程阶段。没有比较依据时，不要声称某次改版造成了效果；缺失结果应记为未知，不要自动算成成功或失败。'),
 W(('Write the release review', '写一份版本复盘'), ('Use only the eight-person pilot notes.', '只使用上面的八人试用记录。'), [('What can you report with confidence? What remains unknown?', '哪些结果可以报告？哪些仍然未知？'), ('Choose one change and connect it to a specific observation.', '选择一项改动，并指出对应哪条观察。'), ('Describe the next test using the same task.', '围绕同一任务安排下一次验证。')],
 ('Six of eight found a relevant listing and four contacted a seller. Two of those contacts were to sold books; completed exchanges are unknown. Improve the status update control and remind sellers to close sold listings. In the next pilot, observe the same search-to-contact task and record availability at the time of contact. This can reveal whether the stale-listing problem persists; it will not prove that the change caused every difference.', '可报告六人找到相关帖子、四人联系卖家，其中两次联系的是已售书籍；完成交易数未知。改进出售状态入口，并提醒卖家关闭已售帖子。下一轮仍观察从搜索到联系的过程，记录联系当时是否真的有货。这样可以了解旧帖子问题是否仍存在，但不能据此解释所有变化的原因。'), [('Do not invent completed purchases.', '不要编造已经完成的交易。'), ('Tie the next change to evidence rather than a new feature wish.', '下一项改动要对应证据，而不是临时追加功能愿望。')]) )
], ('No programming required.', '不需要编程基础。')))

courses.append(C('requirements', ('Requirements and stakeholder interviews', '需求分析与用户访谈'),
 ('Work from conflicting accounts of a room-booking service to an implementable set of rules.', '从活动室预约中的不同诉求出发，整理出可实现、可验收的规则。'),
 ('Ask evidence-seeking questions; resolve conflicting needs; write acceptance criteria for normal and exceptional cases.', '提出能获得证据的问题，处理冲突诉求，为正常和异常情况编写验收条件。'),
 ('A room-booking brief with three acceptance scenarios and an open-questions log.', '一份活动室预约说明，含三条验收场景和待确认问题。'), 'foundations', 'mint', [
 L('r1', ('Separate requests, needs and assumptions', '把请求、需要和假设分开'),
 ('''## The request
“Let students book activity rooms on their phones. It should be quick and fair.” The facilities office has six rooms and currently accepts requests by email. A student has suggested automatic approval.

There are three different things here: an observed process, a desired quality and a proposed solution. We know requests arrive by email. We do not yet know what “fair” means, how room access is controlled, or whether automatic approval is acceptable.

## A working requirements log
Use separate columns for evidence, proposed rule and unresolved question. For example: evidence — staff manually check room capacity; proposed rule — a request includes expected attendance; open question — may attendance exceed the fire limit? The final question has an obvious safety concern, but you still need the actual capacity rule from the responsible office.

Do not turn “students prefer convenience” into “all requests must be instantly approved.” A need can be met by several designs. Keeping the distinction visible makes later negotiation easier.''',
 '''## 收到的请求
“让学生用手机预约活动室，要快一点、公平一点。”设施管理处有六间活动室，目前通过邮件受理。一位同学建议改为自动批准。

这里混合了已知流程、期望的质量和建议的方案。我们知道现在使用邮件，但还不知道“公平”具体指什么、活动室如何开门，以及自动批准是否被允许。

## 先建一张需求记录表
把“证据”“建议规则”“待确认问题”分列。例如：证据——工作人员现在会核对场地容量；建议规则——申请时填写预计人数；待确认——允许的最大人数以什么正式记录为准？不要自行编造容量，也不要把未经核实的数字当作正式规则。

“学生希望方便”不能直接推导出“所有申请必须立即批准”。同一种需要可以有多种解决办法。先保留这层区别，之后讨论取舍时才不会把方案当成不可更改的要求。'''),
 ('Add an owner, source date and validation method to each requirement. Separate functional behaviour from quality constraints. A response-time requirement needs a workload and measurement boundary; “quick” alone is not testable.', '为需求补充负责人、来源日期及确认方式，区分功能行为与质量约束。响应时间要求需要明确负载和测量范围，单写“快”不能被测试。'),
 W(('Start the requirements log', '建立需求记录'), ('Do not assume automatic approval has been agreed.', '不要假设自动批准已经获得同意。'), [('Write one fact, one proposed solution and one unresolved question.', '分别写一条事实、建议方案和待确认问题。'), ('Rewrite “quick and fair” as questions for the office.', '把“快捷公平”改写成要向管理处确认的问题。'), ('Who must confirm the room capacity and approval policy?', '场地容量和审批规则应由谁确认？')],
 ('Fact: requests are currently emailed to the facilities office. Proposal: automatic approval. Open question: which requests require staff review? Ask how long a normal response takes now, what delay is acceptable, and how competing requests should be prioritized. Confirm capacity and approval authority with the facilities office; consult students about the consequences of the existing process.', '事实：目前通过邮件提交预约。方案：自动批准。待确认：哪些预约必须由工作人员审核？继续问正常回复目前要多久、可接受的等待多久、冲突申请如何排序。容量和审批权限由设施管理处确认；学生的经历用于了解现有流程造成的影响。'), [('Label assumptions explicitly.', '明确标出假设。'), ('Send each question to someone able to answer it.', '每个问题都要找到能够确认的人。')]) ),
 L('r2', ('Interview people who disagree', '访谈意见不同的人'),
 ('''## Three accounts of the same service
The facilities officer wants time to inspect a room between bookings. A society organizer wants recurring weekly slots. A student who is not in a society says recurring bookings leave no rooms for anyone else. None of these accounts is automatically the complete requirement.

## Ask about an actual occasion
With the officer, ask what happened after the last back-to-back booking. With the organizer, ask how many weekly sessions were actually attended. With the student, ask which room and times they tried. Avoid the leading question “Would a waiting list solve this?” until you understand the problem it would address.

Record who said each thing and whether it describes an observed event, a policy or a preference. Two people can disagree about a policy that neither has authority to set. Your job is to surface the conflict and identify who can resolve it.

The interview extracts below are fictional. Use them as practice material, then write the follow-up you would ask in a real interview.''',
 '''## 同一服务，三种说法
管理人员希望两次预约之间留出检查时间；社团负责人希望固定每周的活动时段；一位非社团学生认为长期预约把房间全占完了。任何一方的说法都不能自动当作完整需求。

## 从一次具体经历问起
向管理人员询问最近一次连续预约发生了什么；向社团负责人询问最近几周实际使用了多少次；向普通学生询问具体尝试过哪间房、哪个时段。还没理解原因时，别急着问“候补名单能不能解决”。

记录是谁说的，以及它属于实际经历、正式政策还是个人偏好。两人可能争论某项规则，但两人都没有制定规则的权限。分析者要把冲突呈现出来，并找到能确认规则的人。

下面的访谈摘录是虚构练习材料。先阅读，再写下真实访谈中还需要追问的问题。'''),
 ('Compare leading, hypothetical and incident-based questions. In your synthesis, preserve conflicting evidence rather than counting votes. A policy decision needs a named decision-maker and an agreed record, not a majority of interview snippets.', '比较诱导性问题、假设性问题和基于实际事件的问题。整理访谈时保留冲突证据，不要只数赞成票。政策决定需要明确的负责人及记录，不能用几段访谈的多数意见替代。'),
 W(('Prepare a follow-up interview', '准备追问'), ('Read the three case-file extracts. No live AI is needed to read them.', '阅读三方访谈摘录；这些材料无需连接 AI。'), [('Which two goals conflict? Quote the relevant evidence in your own words.', '哪两个目标发生冲突？用自己的话指出对应证据。'), ('Write one non-leading follow-up for each person.', '为每个人写一个不预设答案的追问。'), ('Which policy still needs confirmation, and who should decide?', '还缺什么政策确认？应由谁决定？')],
 ('Recurring slots help organizers plan but can limit access for one-off users. Ask the officer what inspection found after the last incident, the organizer how unused sessions were released, and the student which searches failed. Confirm recurring-booking limits and inspection gaps with the office responsible for room policy. A possible compromise is a limited advance window and automatic release of cancelled sessions, but it still needs agreement.', '固定时段便于社团安排，却可能限制临时使用者。向管理员追问最近一次检查发现了什么；向社团询问不用的时段如何释放；向学生询问哪些查询没有成功。长期预约上限和检查间隔应由负责场地政策的管理处确认。限制可提前预约的时间并及时释放取消时段是候选办法，但仍需协商确认。'), [('Use evidence from more than one person.', '使用不止一方的证据。'), ('Ask about behaviour before proposing a feature.', '先问实际行为，再提功能方案。')]), 'conversation', interview=[
 {'person': B('Facilities officer', '设施管理员'), 'question': B('What happened after the last consecutive bookings?', '最近一次连续预约发生了什么？'), 'answer': B('The first group left cables across the floor. We need 15 minutes for a check before the next group enters. That interval is our proposed rule; the manager must approve it.', '上一组把线缆留在地上。我们建议下一组入场前预留 15 分钟检查，但这项规则还需要主管批准。')},
 {'person': B('Society organizer', '社团负责人'), 'question': B('How do you use recurring reservations?', '你们怎样使用固定预约？'), 'answer': B('We meet on Thursdays, but cancelled two sessions last month. We emailed the office; I do not know when those rooms became available again.', '我们周四活动，上个月取消过两次，只给管理处发了邮件，不知道房间什么时候重新开放。')},
 {'person': B('Student', '普通学生'), 'question': B('Describe the last time you could not book.', '说说上次没有约到房间的经历。'), 'answer': B('I checked three Thursday evenings. The calendar said full, but I walked past an empty room once. I do not know whether the booking had been cancelled.', '我查过三个周四晚上，日历都显示已满，但有一次路过发现房间空着。我不知道是不是已经取消。')}
 ]),
 L('r3', ('Write a rule someone else can test', '把规则写到别人能够测试'),
 ('''## Start with a small story
“As a student, I want to cancel my reservation so another group can use the room.” This explains a need. It does not yet specify what cancellation does.

For this exercise, the office has agreed: only the booking owner can cancel; cancellation is allowed before the session starts; a cancelled slot becomes available immediately. These are case rules, not general university policy.

## Describe the observable result
Given an upcoming booking owned by Alex, when Alex cancels it, then the booking is marked cancelled and the slot can be requested by another student. A different student attempting cancellation receives a rejection and the original booking stays active.

## Look at boundaries
What if the start time has just been reached? What if Alex clicks twice? An acceptance scenario should state the starting state, the action and the resulting state. “The cancellation works correctly” does not tell a tester what to do or observe. Keep implementation details out unless they are genuine constraints.''',
 '''## 从一个小故事开始
“作为学生，我希望取消自己的预约，让其他小组能使用房间。”这句话解释了需要，但还没有明确取消会造成什么结果。

本练习假设管理处已经同意三条规则：只有预约者本人可以取消；开始时间之前允许取消；取消后时段立即重新开放。这些只是案例规则，不代表学校正式政策。

## 描述可观察结果
假设 Alex 拥有一条尚未开始的预约，当 Alex 取消时，预约变为已取消，其他学生可以申请同一时段。如果另一个学生尝试取消，应拒绝请求，原预约仍然有效。

## 再看边界
如果刚好到开始时间怎么办？Alex 连点两次怎么办？一条验收场景应说明初始状态、动作和最终结果。“取消功能正常”没有告诉测试者具体做什么、看什么。除非属于真正的约束，否则不要过早指定内部实现方法。'''),
 ('Define the time boundary precisely: now < startTime is allowed; now >= startTime is rejected in this case. Use server time. Specify idempotent repeated cancellation so a retry does not release the slot twice or corrupt an audit trail. A unique booking identifier is safer than selecting by a display name.', '把时间边界写清楚：本案例中 now < startTime 允许取消，now >= startTime 拒绝，使用服务端时间。重复取消需要保持结果一致，不能因为重试而重复释放时段或破坏记录。使用唯一预约编号，不能按显示名称定位预约。'),
 W(('Write three acceptance scenarios', '编写三条验收场景'), ('Follow the agreed cancellation rules in the reading.', '遵循讲解中已经约定的取消规则。'), [('Describe cancellation by the owner before the start time.', '描述本人在开始前取消。'), ('Describe cancellation attempted by another student.', '描述其他学生尝试取消。'), ('Describe cancellation exactly at the start time.', '描述刚好到开始时间时取消。')],
 ('1. Given Alex owns active booking B17 starting at 18:00, at 17:59 Alex cancels B17: it becomes cancelled and the slot is available. 2. Given Sam does not own B17, Sam’s cancellation is rejected and B17 is unchanged. 3. At 18:00 exactly, the cancellation is rejected because it is no longer before the start. A repeated successful cancellation must not create a second release.', '1. Alex 拥有 18:00 开始的有效预约 B17，在 17:59 取消后，B17 变为已取消，时段重新开放。2. Sam 不是 B17 的预约者，取消请求被拒绝，B17 不变。3. 刚好 18:00 时已不属于开始之前，请求被拒绝。对已经成功取消的请求进行重试，不应再次释放名额。'), [('State the expected data change, not only a success message.', '写出数据应怎样变化，不只写成功提示。'), ('Include the exact boundary and an unauthorized actor.', '包含准确的时间边界和无权操作的人。')]),
 check=Q('At 18:00 exactly, which behaviour follows the case rule?', '刚好 18:00，什么行为符合案例规则？', [
 (('Allow cancellation because it is the same minute.', '允许取消，因为仍在同一分钟。'), ('That silently changes “before” into “at or before”. If the office wants a grace period, it must be agreed explicitly.', '这把“之前”悄悄改成了“不晚于”。若需要宽限期，应明确协商。')),
 (('Reject cancellation and leave the booking active.', '拒绝取消，预约保持有效。'), ('Correct for this stated rule: the start time is an exclusive boundary. Other policies are possible, but this is the agreed behaviour to test.', '符合已约定的规则：开始时刻不包含在允许范围内。可以采用其他政策，但需要先修改约定。')),
 (('Let the browser decide using its local clock.', '让浏览器根据本机时间决定。'), ('Different client clocks can disagree and can be changed. The authoritative check belongs on the server.', '客户端时钟可能不同，也可以修改，最终检查应在服务端。'))],1)),
 L('r4', ('Review the brief before handing it over', '交付前检查需求说明'),
 ('''## A developer finds a gap
Your brief says students cannot make overlapping bookings. A developer asks whether this includes bookings in different rooms. Another asks what should happen when two students request the same free slot at the same time. These are useful questions, not signs that the developer failed to read.

## A small review checklist
Check the actor, action, preconditions, result and exception for each important rule. Then trace the rule back to a source. If the office has not decided a conflict, write “unresolved” with an owner and review date. Filling the gap with an invented rule makes the brief look finished while leaving the disagreement hidden.

An implementable brief does not describe every possible screen. It explains enough behaviour for someone to build and verify the next agreed scope. Sketches help reveal missing steps; acceptance examples help reveal missing rules.

For the handover, include the agreed rules, three scenarios, deferred features and the questions still awaiting a decision.''',
 '''## 开发者发现了空缺
需求说明写着“学生不能重复预约”。开发者追问：不同房间的同一时段也算重复吗？另一个问题是：两个人同时申请最后一个可用时段，应如何处理？这些都是有效问题，不能归结为开发者没认真读。

## 用一张小清单复核
逐条检查谁操作、做什么、前提是什么、结果是什么、异常怎么办，再追溯规则的来源。如果管理处还没解决某个冲突，就写“待确认”，同时注明负责人和复查时间。自行补一条规则，只会让文档表面完整，却把分歧藏起来。

可实施的需求说明不必提前描述所有页面，但应足够支持下一阶段已同意的范围。草图能帮助发现漏掉的步骤，验收例子能帮助发现漏掉的规则。

交付时整理已经确认的规则、三条验收场景、暂缓功能和仍待决定的问题。'''),
 ('Add a trace from stakeholder evidence to requirement to acceptance check. For concurrent requests, describe the externally visible guarantee first; leave locking or transaction choices to design unless imposed by an integration constraint.', '建立“访谈证据—需求规则—验收检查”的对应关系。并发申请先写外部可见的保证，不必在需求中提前指定锁或事务方案，除非已有集成约束。'),
 W(('Submit the booking brief', '整理预约需求说明'), ('Use the work from the previous lessons.', '整合前面几节的练习。'), [('List three agreed rules and their evidence or authority.', '列出三条已确认规则及依据或确认者。'), ('Add one concurrency scenario and one question that still needs a decision.', '补一条并发场景，以及一个仍待决定的问题。'), ('State what is outside the first release.', '说明哪些内容不在首版范围内。')],
 ('Agreed rules: only the owner cancels, only before the start, and a cancelled slot is released. Concurrent requests for one slot must not both become confirmed; the unsuccessful request receives an unavailable result. The office must still decide whether recurring bookings have a quota. Record its manager as the decision owner. Leave recurring-booking automation outside the first release until that rule is agreed.', '已确认：本人才能取消、开始之前可取消、取消后释放时段。同一时段的并发申请不能都变为已确认，未成功的请求应收到时段不可用的结果。长期预约是否设上限仍待管理处主管确认；在规则确定前，自动长期预约不进入首版。'), [('Keep unresolved policy separate from agreed behaviour.', '将未决政策与已确认行为分开。'), ('Include a result for both competing requests.', '并发场景中写清两个请求各自的结果。')]) )
], ('Start here if you can describe a user task. No coding is needed.', '能够描述用户任务即可，不需要编程。')))

courses.append(C('architecture', ('Web architecture and data', '网页系统、数据与权限'),
 ('Trace a lost-property claim from a browser to stored data, then examine what happens when a request fails or comes from the wrong person.', '跟踪失物认领请求怎样从浏览器到达数据库，再检查失败和越权时会发生什么。'),
 ('Explain client and server responsibilities; model a claim; locate authorization and consistency checks.', '说明客户端与服务端各自的职责，为认领记录建模，确定权限和一致性检查的位置。'),
 ('A request-flow diagram and a short data-and-permissions specification.', '一张请求流程图和一份数据、权限说明。'), 'foundations', 'mint', [
 L('s1', ('Trace one request', '跟踪一次请求'),
 ('''## The claim button
A student opens a lost-property listing and clicks “Claim”. The button is part of the browser interface. It can collect an explanation, but it cannot safely decide that the student now owns the item.

The browser sends a request identifying the listing and the proposed claim. The server checks the signed-in user, validates the data and consults stored state. If the request is accepted, it stores a claim and sends a response. The browser then displays the result.

## Why the boundary matters
Changing a button label to “Approved” does not approve anything on the server. Likewise, hiding a button from some users does not prevent them from making the underlying request. The browser is under the user’s control. The server must check permissions even when the interface already checked them.

In this case, a claim is a request for review, not a transfer of ownership. Keep that distinction in the response: “Claim submitted” is more accurate than “Item is yours”.''',
 '''## 点击认领以后
学生打开失物信息，点击“认领”。按钮属于浏览器界面，可以收集说明，但不能安全地决定物品已经属于这个学生。

浏览器发送物品编号和认领说明。服务端检查登录者身份、校验内容，再读取已经保存的状态。受理后保存认领记录并返回响应，浏览器最后显示结果。

## 边界为什么重要
把按钮文字改成“已批准”，不代表服务端真的批准了。把按钮对某些人隐藏，也不能阻止他们直接发送请求。浏览器处在用户控制之下，即使界面检查过权限，服务端仍要再检查。

在这个案例里，“认领”只是提交审核申请，不是转移物品所有权。因此响应应该是“申请已提交”，而不是“物品归你了”。措辞也属于系统行为的一部分。'''),
 ('Describe a request contract, for example listingId and explanation in, claimId and status out. Do not accept claimantId as authoritative client input. Identify validation, authorization, persistence and response as distinct responsibilities, even if one server function performs all four.', '描述请求约定，例如输入 listingId 和 explanation，输出 claimId 和 status。不能直接信任客户端提交的 claimantId。区分校验、授权、持久保存和返回响应几类职责，即使它们由同一个服务端函数完成。'),
 W(('Draw the request path', '画出请求路径'), ('A user submits a claim and sees a confirmation.', '用户提交认领申请，然后看到确认信息。'), [('List the steps from click to confirmation in order.', '按顺序列出从点击到确认的步骤。'), ('Where should identity and permission be checked? Why?', '在哪里检查身份和权限？为什么？'), ('What should the user see if saving fails?', '保存失败时，用户应该看到什么？')],
 ('Browser collects the explanation → server authenticates the caller and validates the listing → storage saves a pending claim → server returns its ID → browser confirms submission. Permission is enforced on the server because a user can bypass interface controls. If persistence fails, report that submission did not complete and offer a retry; do not show a confirmed claim without evidence it was saved.', '浏览器收集说明→服务端验证请求者及物品→保存待审核的认领记录→服务端返回编号→浏览器确认提交。权限在服务端执行，因为用户可以绕过界面控件。如果保存失败，应说明提交没有完成并允许重试，不能在没有保存依据时显示已确认。'), [('Include the return journey, not only the outgoing request.', '既画请求，也画结果返回的路径。'), ('Do not give the browser final authorization authority.', '不要让浏览器承担最终授权。')]), 'slides',
 slides=[B('Browser: collect the item ID and the explanation. The claim is not approved here.', '浏览器：收集物品编号和说明，此时没有批准认领。'),B('Server: verify the caller, validate the item and apply permissions.', '服务端：验证请求者，校验物品，执行权限规则。'),B('Database: store a pending claim and return its identifier.', '数据库：保存待审核记录，并返回记录编号。'),B('Response: show the saved claim status, or explain that submission failed.', '响应：显示已保存的申请状态，或说明提交失败。')]),
 L('s2', ('Store the facts you will need later', '保存后续真正需要的事实'),
 ('''## A spreadsheet becomes a data model
An early prototype puts an item title, claimant name and approval flag in one row. Two students called Alex submit claims. A title is corrected. Now the team cannot reliably tell which person or item a row describes.

Give each item, user and claim a stable identifier. A claim refers to an item and a claimant. Names and titles are display information; they can change and need not be unique.

## Model the states explicitly
For this exercise, claims can be pending, approved or rejected. An item can be open or returned. Approving a claim must not leave the same item available for another approval. Store enough information to explain the decision: which claim, who reviewed it, and when.

You do not need a separate database table for every noun in a paragraph. Start with the relationships and questions the service must answer. Then check whether the model can represent more than one claim without overwriting earlier evidence.''',
 '''## 从一张表开始
早期原型在一行里保存物品标题、认领人姓名和是否批准。两个都叫 Alex 的学生提交了申请，物品标题随后又被改过。现在团队无法可靠判断每行到底指向谁、哪件物品。

给物品、用户和认领记录分别设置稳定编号。一条认领记录关联一件物品及一个申请人。姓名和标题用于显示，可能改变，也不一定唯一。

## 明确状态
本练习中，申请分为待审核、已批准和已拒绝；物品分为待认领和已归还。批准一条申请后，同一物品不能仍可被另一条申请批准。还要能说明审核依据：批准哪条申请、谁审核、什么时候审核。

不必看到一个名词就建一张表。先列清系统要回答的问题和对象之间的关系，再检查模型能否保存多条申请，而不是后来的人覆盖前人的记录。'''),
 ('Propose foreign keys and an invariant: at most one approved claim for an item. Explain how an atomic update or transaction could enforce it under concurrency. Keep uploaded proof separate from public listing fields and retain it only under an agreed policy.', '提出关联约束以及“每件物品最多一条批准申请”的不变量，说明原子操作或事务如何在并发时保持它。认领证据与公开信息分开保存，保留时间需要明确政策。'),
 W(('Draft the data model', '起草数据模型'), ('Two students with the same name claim the same umbrella.', '两位同名学生申请认领同一把伞。'), [('List the identifiers and relationships you need.', '需要哪些编号和关联？'), ('Which states belong to the claim and which belong to the item?', '哪些状态属于申请，哪些属于物品？'), ('Write one rule the database operations must preserve.', '写一条数据操作必须保持的规则。')],
 ('Use userId, itemId and claimId. Each claim stores itemId and claimantUserId, with pending/approved/rejected status. The item stores open/returned status. Reviewer identity and review time belong to a review record or the reviewed claim. Preserve the invariant that only one claim can be approved for an item, including when two reviewers act concurrently. Display names may repeat.', '使用 userId、itemId 和 claimId。申请保存 itemId、claimantUserId 和待审核／批准／拒绝状态；物品保存待认领／已归还状态。审核人和时间可以保存在申请或审核记录中。即使两个审核者同时操作，也要确保同一物品最多只有一条获批申请。姓名允许重复。'), [('Use stable IDs rather than titles or names as keys.', '关联使用稳定编号，不以标题或姓名作主键。'), ('Account for multiple simultaneous claims.', '模型要容纳同时存在的多条申请。')]) ),
 L('s3', ('Test access with another person’s account', '用另一个人的身份检查访问'),
 ('''## A useful negative test
Alex submitted claim C12. Sam signs in and changes a request URL from C13 to C12. If the server returns Alex’s private explanation, the application has exposed information even if no navigation link ever showed C12 to Sam.

Authentication answers who is making the request. Authorization answers whether that person may perform this action on this record. A signed-in user is not automatically allowed to read every claim.

For our case, students may read their own claims; designated staff may review all claims; the public listing shows an item description but not private proof. These are teaching-case rules. A real service must agree its rules with the people responsible.

Use the access lab to vary the caller and the record owner. The result is a rule-based illustration. It does not log into a real account or inspect anyone’s data.''',
 '''## 一个值得做的反向测试
Alex 提交了申请 C12。Sam 登录后，把请求里的 C13 改成 C12。如果服务端直接返回 Alex 的私密认领说明，即使界面从未给 Sam 展示 C12 的链接，信息仍然泄露了。

身份认证回答“谁在请求”，权限校验回答“这个人能否对这条记录做这个动作”。已经登录，不代表可以读取所有申请。

本案例约定：学生只能读取自己的申请；指定工作人员可以审核全部申请；公开页面显示物品描述，不展示私密证明材料。这些是教学规则，真实服务需要与负责人确认。

在下面的访问实验中改变请求者和记录归属，观察结果。这里是明确规则下的模拟，不会登录真实账号，也不会读取真实人员的数据。'''),
 ('Apply an object-level authorization check on every read and update, and do not accept a client-supplied staff role. Describe a test matrix across actor, resource owner and action. A 403 or non-disclosing 404 can both be valid choices if the contract is consistent.', '每次读取和修改都要检查具体对象的权限，不接受浏览器自报的工作人员身份。按请求者、记录归属和动作建立测试矩阵。403 或不暴露存在性的 404 都可能合理，但接口行为需要一致。'),
 W(('Specify the permission checks', '整理权限检查'), ('Use the access lab, then explain the rule without referring to button visibility.', '试用访问实验，再解释规则，不要把是否显示按钮当成权限依据。'), [('What should happen when Sam requests Alex’s claim?', 'Sam 请求 Alex 的申请时应怎样处理？'), ('What changes when the caller is designated staff?', '请求者是指定工作人员时有什么不同？'), ('Which checks must repeat when a claim is updated?', '修改申请时还要重复检查哪些条件？')],
 ('Sam’s read is rejected because the claim belongs to Alex. Designated staff may read it under the case policy. An update also needs object-level permission, valid state transition and current item state. The server obtains the role from its trusted identity system, not a role dropdown sent in the request.', 'Sam 不是该申请的所有者，应拒绝读取；按案例政策，指定工作人员可读取。修改时还要检查对象权限、合法状态变化和物品当前状态。角色由可信身份系统提供，不能根据浏览器提交的角色下拉框决定。'), [('Check the requested record, not just whether someone is logged in.', '检查具体记录的归属，不只检查是否登录。'), ('Separate trusted server identity from client input.', '区分可信身份与客户端提交的数据。')]), 'access'),
 L('s4', ('Handle a retry without doing the work twice', '重试时别把同一件事做两遍'),
 ('''## The uncertain response
Alex submits a claim. The server saves it, but the response is lost. Alex sees a spinner and clicks again. There are now two requests, but only one intention.

Disabling the button helps with an accidental double-click. It cannot stop a browser refresh, a network retry or another tab. The server needs a policy for repeated submissions. For this case, one user may have only one active claim for the same item; a retry returns the existing claim.

## Two reviewers, one item
Another failure happens when two staff members approve different claims after both read “item open”. Checking first and updating later is not enough if those actions can interleave. The operation must preserve the one-approved-claim rule as a whole.

The design note should cover success, rejection and uncertainty. “Please try again” is incomplete if trying again can silently duplicate the action.''',
 '''## 没收到响应，不等于没保存
Alex 提交认领申请。服务端已经保存，但响应在网络中丢失。页面一直转圈，Alex 又点了一次。现在产生了两次请求，但用户其实只想做一件事。

禁用按钮有助于防止连点，却无法阻止刷新、网络重试或另一个标签页提交。服务端需要明确处理重复提交。本案例规定，同一人对同一物品最多保留一条有效申请，重试时返回原来的申请。

## 两个人审核同一件物品
另一种失败是两个工作人员都先读到“物品待认领”，随后分别批准不同申请。如果读取和修改可以交错执行，“先检查再保存”仍可能产生两条批准结果。整个操作需要保持只能批准一条的约束。

设计说明应覆盖成功、拒绝和结果不确定的情况。如果重试可能悄悄重复操作，只显示“请重试”是不完整的处理。'''),
 ('Distinguish request idempotency from user-intent uniqueness. A retry token identifies one operation; a uniqueness constraint on active claimant/item pairs expresses domain policy. Use an atomic conditional transition or transaction for approval. Deduplication alone does not solve concurrent approval.', '区分请求幂等和业务唯一性：重试标识对应同一次操作，申请人／物品的有效记录唯一约束表达业务规则。审核采用原子条件更新或事务。请求去重本身不能解决并发批准。'),
 W(('Add failure paths to the design', '给设计补上失败路径'), ('The response disappears after the first successful save.', '第一次保存成功后响应丢失。'), [('Describe what the second submission should return.', '第二次提交应该返回什么？'), ('Which invariant must an approval operation preserve?', '批准操作必须保持什么约束？'), ('How would you test both failures?', '怎样测试重复提交和并发批准？')],
 ('The retry returns the already-created active claim ID rather than a new claim. Approval must preserve at most one approved claim per item. Test by submitting the same user/item twice, including after a simulated lost response; then run two approval attempts for different claims and inspect stored state. Only one may succeed. A disabled button alone does not establish either guarantee.', '重试应返回已建立的有效申请编号，而不是新建一条。批准操作必须保证同一物品最多一条获批申请。先测试相同用户和物品重复提交，包括模拟丢失响应后的重试；再对两条不同申请并发批准，检查最终保存状态，只允许一条成功。按钮被禁用不能证明这两项保证。'), [('Handle retries after a saved operation.', '考虑已经保存但响应丢失后的重试。'), ('Check final stored state under competing operations.', '检查竞争操作后的最终保存状态。')]) )
], ('Requirements and stakeholder interviews, or equivalent experience.', '建议先学需求分析，或具备相应经验。')))

courses.append(C('ai-coding', ('Working with an AI coding assistant', '与 AI 编程助手一起开发'),
 ('Specify a small task, inspect competing implementations, run checks and leave a review record another developer can follow.', '描述一个小任务，检查不同实现，运行测试，并留下别人能够复查的记录。'),
 ('Write a bounded task; find a plausible code defect; verify behaviour and explain the limits of the checks.', '写清任务边界，识别看似合理的代码缺陷，验证行为并解释测试的局限。'),
 ('A reviewed booking function, a task brief and a short change record.', '一份经过检查的报名函数、任务说明和修改记录。'), 'aiDevelopment', 'lavender', [
 L('a1', ('Give the assistant a task it can finish', '把任务交代到可以检查'),
 ('''## The maintenance ticket
A booking export sometimes includes the same student more than once. The admin team needs a function that keeps the first booking for each student ID. Two different students may have the same name.

A useful task brief states the input, output, rules, examples and boundaries. Here: input is an array of booking objects; output is a new array; keep the first object for each studentId, preserve input order and do not mutate the input. Assume studentId is a non-empty string in this exercise. Validation of malformed imports is a separate task.

## Keep the scope small
“Fix booking” might invite changes to authentication, database schema and the interface. Ask for the function and a short explanation of assumptions first. Inspect the proposed change before accepting it.

An AI assistant can produce a draft, but the contract comes from the task. If an answer quietly changes “first” to “last”, it has changed the requirement even if the code is shorter.''',
 '''## 收到一张维护单
报名导出中有时会重复出现同一学生。管理人员需要一个函数：按学生编号保留首条报名。两个不同学生可能同名。

有效的任务说明需要包含输入、输出、规则、例子和边界。本题输入是报名对象数组，输出是新数组；同一 studentId 保留第一个对象，保持输入顺序，不修改原数组。练习假设 studentId 是非空字符串，损坏导入数据的校验属于另一项任务。

## 控制改动范围
只说“修好报名”可能让助手同时修改登录、数据库和界面。先要求完成这个函数并解释假设，再检查生成的改动。

AI 可以提供草稿，但任务约定不由草稿决定。如果它把“保留首条”悄悄改成“保留末条”，即使代码更短，也已经改变了需求。'''),
 ('Add performance expectations and a non-goal. A single pass with a Set is expected linear time for this exercise; repeatedly searching the entire input can be quadratic. Do not confuse an in-memory export cleanup with enforcing booking uniqueness in a database.', '补充性能预期和不做事项。本练习单遍扫描配合 Set 通常为线性时间，反复遍历整个输入可能达到平方级。导出文件去重不等于在数据库中保证报名唯一。'),
 W(('Write the coding task', '编写委托说明'), ('Write instructions for the function, not a request to redesign the application.', '只委托实现函数，不要求重新设计应用。'), [('State input, output and the meaning of “first”.', '说明输入、输出以及“首条”的含义。'), ('Give an example with duplicate IDs and another with duplicate names.', '给出重复编号和同名不同编号两个例子。'), ('List a constraint and something outside scope.', '列出一个约束和一个不在范围内的事项。')],
 ('Implement uniqueBookings(bookings). For valid objects with non-empty string studentId, return a new array containing the original first object for each ID, in original order. Do not mutate input. Example [A:first, A:second, B] becomes [A:first, B]. Two Alex records with IDs A and B both remain. Do not modify authentication, storage or UI. Explain assumptions and include a test that would fail a last-write-wins implementation.', '实现 uniqueBookings(bookings)。输入对象的 studentId 均为非空字符串；返回新数组，按输入顺序保留每个编号首次出现的原对象，不修改输入。[A:first, A:second, B] 应得到 [A:first, B]。两个都叫 Alex、但编号分别为 A 和 B 的记录应同时保留。不修改登录、存储或界面，解释假设，并给出能识别“保留末条”错误的测试。'), [('Make conflicting implementations distinguishable with an example.', '用例子区分可能产生不同结果的实现。'), ('Specify what must remain unchanged.', '说明哪些内容不得被改动。')]) ),
 L('a2', ('Review and repair the duplicate-booking function', '检查并修复重复报名函数'),
 ('''## Two plausible answers
An assistant proposes removing duplicates by name. That loses a booking whenever two students share a name. Another answer builds a Map from studentId to booking; replacing values as it scans keeps the last record for each ID. Both answers may pass a test containing only unique students.

## Work on the contract
Track IDs you have already seen. When an ID appears for the first time, keep that object; on later appearances, skip it. A Set is useful because it answers whether an ID has been seen without relying on the person’s name.

Edit the function below and run the checks. The cases include repeated IDs with different details, identical names with different IDs, empty input and input immutability. Read the failing case before changing the implementation.

## What this exercise does not prove
Passing these checks demonstrates the specified in-memory behaviour for the tested inputs. It does not make a real ticket allocation safe against simultaneous server requests. That needs server-side consistency controls.''',
 '''## 两种看似合理的答案
助手提出按姓名去重，这会误删同名学生。另一种答案用 studentId 构建 Map，每次遇到编号就覆盖旧值，实际保留的是末条记录。这两种答案都可能通过“学生完全不重复”的测试。

## 回到约定修复
记录已经出现的编号。一个编号第一次出现时保留那个对象，以后再出现就跳过。Set 适合记录是否见过某个编号，不需要依赖姓名。

修改下面的函数，运行检查。测试包括：同一编号但内容不同、姓名相同但编号不同、空输入，以及原数组是否保持不变。先读失败用例，再决定改代码的哪一部分。

## 通过检查说明什么
通过只说明在这些输入下，内存函数符合约定；它不能证明真实售票系统面对服务端并发请求仍不会超卖。后者需要服务端的一致性控制。'''),
 ('Preserve original object identity as well as values and order. Explain the time and memory cost of your approach. Consider whether the domain would ever need last-write-wins; if so, it is a new contract with different tests, not an unannounced optimization.', '除了值和顺序，还要保留原对象引用。说明时间和空间成本。可以讨论某个业务是否需要保留末条，但那是新的约定和测试，不能以优化之名悄悄替换。'),
 W(('Leave a code review note', '留下代码审查记录'), ('Run the code checks before writing this note.', '运行代码检查后再填写。'), [('Which original defect did you fix?', '修复了原来什么问题？'), ('Which test distinguishes your implementation from keeping the last record?', '哪个测试能区分你的实现和保留末条？'), ('What system-level guarantee is still untested?', '哪项系统层面的保证仍未验证？')],
 ('I replaced returning every row with first-seen filtering by studentId. The repeated-ID case includes different record details, so keeping the last object fails. I also checked empty input, same-name students and non-mutation. These checks do not exercise a database transaction or simultaneous ticket allocation.', '将直接返回全部记录改为按 studentId 保留首次出现的记录。重复编号用例中两条内容不同，因此能发现保留末条的错误；同时检查空输入、同名不同编号和输入不变。这些测试没有验证数据库事务或并发分票。'), [('Cite an actual test result.', '引用实际运行的测试结果。'), ('State at least one limit of the verification.', '说明至少一项验证局限。')]), 'coding'),
 L('a3', ('Use a failing test to question an answer', '用失败用例追问答案'),
 ('''## A weak test suite
Suppose a generated test only asserts that the output is an array. The broken starter function already passes. A test can execute code without checking the requirement that matters.

Construct a small counterexample: two records with studentId A but different contact details, followed by one record for B. Write the exact expected result before asking the assistant to repair anything. This prevents the expected answer from simply following whatever the implementation happens to do.

## Review the change, not the explanation alone
Ask the assistant to explain why the counterexample failed and propose a limited patch. Then inspect the changed lines and run both the new check and previous checks. A confident explanation is not evidence that the code behaves correctly.

If the patch adds sorting, notice that it may violate the order requirement. Fixing one failure can introduce another; regression checks protect behaviour that was already correct.''',
 '''## 测试也会写得太弱
假设生成的测试只判断返回值是不是数组。原来那个直接返回全部记录的错误函数也能通过。测试执行过代码，不等于检查了关键需求。

构造一个小反例：编号 A 的两条记录内容不同，后面再放一条 B。请先写出准确的预期结果，再要求助手修复，避免预期答案照着错误实现走。

## 看改动，不只听解释
让助手说明反例为什么失败，并提出限定范围的补丁。随后检查实际改动，同时运行新用例和原有用例。解释很自信，不能证明代码正确。

若补丁加入排序，要注意它可能破坏保留输入顺序的要求。修好一个问题也可能带来另一个问题，回归测试就是用来保护原本正确的行为。'''),
 ('Evaluate a test by mutation: would it reject a name-based, last-write-wins, always-empty or in-place-sorting implementation? A mutation surviving the suite reveals a coverage gap; it does not by itself show how often that defect occurs in production.', '用错误变体检验测试：按姓名去重、保留末条、永远返回空数组、原地排序，哪些会被发现？错误变体仍能通过说明测试存在缺口，但不能据此推断真实系统出现该问题的频率。'),
 W(('Write a repair request', '编写修复请求'), ('An answer passes unique-student tests but keeps the last duplicate.', '某个答案通过了无重复学生的测试，却保留重复编号的末条。'), [('Write a minimal failing example and its expected output.', '写最小失败输入及准确预期输出。'), ('Write a follow-up request that limits the patch.', '写一段限制改动范围的追问。'), ('Which previous checks must run again?', '哪些已有检查必须重新运行？')],
 ('Input [{studentId:"A", note:"first"}, {studentId:"A", note:"second"}] must return the first object only. Ask: explain why your implementation keeps the last record, change only uniqueBookings to preserve first occurrence, and do not sort or mutate input. Re-run unique IDs, duplicate IDs, same-name different IDs, empty input and immutability checks.', '输入 [{studentId:"A", note:"first"}, {studentId:"A", note:"second"}] 只应返回第一个对象。追问：说明当前为何保留末条，只修改 uniqueBookings 以保留首次记录，不排序也不修改输入。重新运行不同编号、重复编号、同名不同编号、空输入及输入不变检查。'), [('Expected output must be independent of the broken code.', '预期输出不能由错误实现决定。'), ('Preserve previous requirements while repairing the defect.', '修复时保留此前约定的其他行为。')]),
 check=Q('Which test would expose a last-write-wins defect?', '哪个测试能识别保留末条的错误？', [
 (('Assert that the result is an array.', '判断结果是不是数组。'), ('Both first- and last-write-wins implementations return arrays.', '保留首条和末条都会返回数组，无法区分。')),
 (('Use two records with the same ID but different details; expect the first object.', '同一编号放两条内容不同的记录，要求返回第一个对象。'), ('The differing details and object identity make the two policies distinguishable.', '不同内容及对象引用能区分两种保留策略。')),
 (('Use two identical copies and assert that the result has length one.', '放两个完全相同的副本，只检查长度为一。'), ('Both policies can pass because the retained records look identical.', '两个策略都可能通过，因为留下的记录看不出区别。'))],1)),
 L('a4', ('Explain what you accepted and what you checked', '说明采用了什么、检查了什么'),
 ('''## A handover another person can use
“AI wrote it and all tests passed” leaves a reviewer with several questions. Which task was delegated? Which generated answer was rejected? Which checks ran, and what do they not cover?

Use a short change record: requested behaviour, proposed implementation, review findings, final change, evidence and remaining limits. For our function, explain the name-based or last-write-wins failure, attach the counterexample and describe the adopted first-seen approach.

## Apply the four decisions
Delegation: give the assistant a bounded implementation task. Description: supply the contract and examples. Discernment: inspect whether the output follows that contract. Diligence: run independent checks and retain evidence. These terms are useful only when tied to specific actions you took.

Do not claim authorship of a change you merely accepted, or claim that a test suite proves the entire application safe. A clear account of assistance and verification is more useful than either extreme.''',
 '''## 交接记录要让别人接得住
“AI 写的，测试都通过了”仍留下很多问题：交给 AI 的具体是什么？拒绝过哪个答案？跑了什么检查？还有什么没检查？

可以按请求行为、建议实现、审查发现、最终改动、验证证据和剩余局限写一份短记录。本题说明按姓名或保留末条为什么错误，附上反例，再解释最终采用的首次出现策略。

## 把四个判断落到行动
Delegation：交出范围明确的实现任务；Description：给出约定和例子；Discernment：审查结果是否遵守约定；Diligence：独立检查并保留证据。这些词只有对应到实际做过的事情才有意义。

不要把直接接受的代码说成全由自己完成，也不要说一套函数测试证明了整个应用安全。说明怎样使用协助、怎样验证结果，更便于后续维护。'''),
 ('Add the exact version or change identifier, how checks were run, and any deviation between requested and implemented behaviour. For a real repository, keep the reviewable diff and reproducible test command with the change.', '补充具体版本或改动编号、运行检查的方式，以及请求与实际实现之间的差异。在真实仓库中保留可审查的改动和可复现的测试命令。'),
 W(('Submit the review record', '提交审查记录'), ('Use the function you actually tested in this course.', '使用你在本课实际检查的函数。'), [('What did the assistant draft, and what judgment did you contribute?', '助手起草了什么？你作出了什么判断？'), ('Record a rejected approach and the evidence against it.', '记录一个没有采用的方案，以及拒绝它的证据。'), ('State the final verification and remaining risk.', '写清最终验证及尚存风险。')],
 ('The assistant drafted a deduplication function. I specified first occurrence and input order, rejected name-based matching using same-name students, and checked repeated IDs with different details. The final Set-based approach passed the listed function checks without mutating input. Server concurrency, malformed imports and account authorization are outside this exercise and remain to be tested separately.', '助手起草去重函数；我指定保留首次记录和输入顺序，用同名不同编号的例子否定按姓名去重，并用内容不同的重复编号检查保留策略。最终 Set 方案通过函数检查，未修改输入。服务端并发、损坏导入数据和账号权限不属于本题，仍需分别测试。'), [('Describe specific human decisions rather than a generic AI reflection.', '写具体判断，不写泛泛的 AI 感想。'), ('Only report checks you actually ran.', '只报告实际运行过的检查。')]), 'reflection')
], ('Basic JavaScript helps. Beginners can use the examples before editing the function.', '了解基本 JavaScript 会更顺利；初学者可先看例子，再修改函数。')))

courses.append(C('testing-release', ('Testing, incidents and release decisions', '测试、故障与上线决定'),
 ('Investigate a ticketing failure, reproduce it, and decide what evidence is enough to release a repair.', '调查售票故障、复现错误，并判断修复后还需要什么证据才能上线。'),
 ('Write independent expected results; reproduce a defect; select protections under constraints; plan verification and recovery.', '独立写出预期结果，复现缺陷，在约束下选择保护措施，安排验证和恢复。'),
 ('A defect report, a test table and a release note with a rollback condition.', '一份缺陷报告、测试表和包含回滚条件的上线说明。'), 'foundations', 'lavender', [
 L('t1', ('Turn a complaint into a reproducible defect', '把投诉变成可以复现的缺陷'),
 ('''## The incident report
Registration opens at noon. A student writes, “I clicked once, the page froze, so I tried again. Now I have two confirmations.” Another says a friend with the same name lost a booking after an export cleanup.

These reports suggest different failures. One concerns repeated requests; the other may concern the identity used during deduplication. Do not label both “duplicate bug” and assume one fix covers them.

## Collect the minimum useful record
Write the starting state, exact steps, expected result, actual result and evidence. For the first report, include the same student ID, request times and both confirmation IDs if available. Avoid placing private data in a public defect report; synthetic IDs are enough for the reproduction.

Try the smallest input that reproduces the behaviour. If the problem only occurs with concurrent requests, a sequential browser demonstration cannot rule it out. State that limit instead of declaring the issue fixed.''',
 '''## 两条故障反馈
中午开放报名。一位学生说：“我点了一次，页面卡住，又试了一次，现在有两条确认。”另一位说导出清理后，同名朋友的一条报名消失了。

两条记录可能对应不同问题：前者是重复请求，后者可能是去重时选错身份字段。不要统称“重复 bug”，再假设一个补丁能一起解决。

## 收集够用的记录
写初始状态、准确步骤、预期结果、实际结果和证据。第一条应记录同一学生编号、请求时间、两条确认编号。公开缺陷单不需要暴露个人资料，复现时使用虚构编号即可。

尽量找到能够复现的最小输入。如果问题只在并发时出现，顺序点击浏览器不能排除它。应该明确记录检查的局限，而不是直接宣布已经修好。'''),
 ('Record correlation IDs, ordering and environment without collecting unnecessary personal data. Separate a retry of one logical operation from two independent bookings. Reproduction should preserve the concurrency condition when that condition is necessary for the fault.', '在不额外收集个人资料的前提下记录关联编号、顺序和环境，区分同一次操作的重试与两次独立报名。若并发是故障必要条件，复现必须保留该条件。'),
 W(('Write a defect report', '编写缺陷单'), ('Choose one of the two reports. Do not merge them.', '从两条反馈中选一条，不要混成一个问题。'), [('State the smallest setup and reproduction steps.', '说明最小准备条件和复现步骤。'), ('Write expected and actual results separately.', '分别写预期与实际结果。'), ('What evidence is missing before you can confirm the cause?', '确认原因前还缺什么证据？')],
 ('Setup: student A has no booking. Submit a booking request, simulate a lost response, then repeat the same logical request. Expected: one confirmed booking and a retry response referring to it. Reported actual: two confirmations; verify whether they reference two stored bookings. Collect synthetic reproduction records and timing. The report alone does not prove whether the server duplicated data or only displayed the confirmation twice.', '准备：学生 A 尚无报名。提交一次请求，模拟响应丢失，再重试同一次操作。预期：只有一条确认报名，重试指向它。反馈中的实际表现是两次确认，仍需核实是否对应两条已保存报名。收集虚构测试记录和时间；仅凭投诉还不能判断是数据重复，还是同一确认显示两次。'), [('Keep symptoms separate from the unconfirmed cause.', '区分已经观察到的现象和尚未确认的原因。'), ('Use steps someone else can repeat.', '步骤要让别人能够重复。')]) ),
 L('t2', ('Check the repair against a test table', '用测试表检查修复'),
 ('''## Define expected results first
We will reuse the export function from the AI coding course. The requirement is first occurrence by studentId, original order, and no mutation. A repair has been proposed using a Map. Read it before running it: each later value replaces the earlier one for the same key.

Build a test table with an input, the exact expected output and a reason for the case. Two equal duplicate rows are a weak test of “first”: either record looks the same. Give them different details so the distinction matters.

## Repair and regress
Run the checks on the proposed repair. When it fails, make a limited change and run the complete set again. Do not remove a failed test just because it conflicts with the implementation.

The code lab covers a pure function. An integration check must separately show that the application supplies the correct fields and uses the returned array; a system check must exercise repeated server requests. Keep those layers visible in the test report.''',
 '''## 先确定预期结果
这里沿用 AI 编程课的导出去重函数：按 studentId 保留首条，保持顺序，不修改输入。某个修复采用 Map。先读代码：同一个键后面写入的值会覆盖前面的值。

测试表应有输入、准确预期输出和用例理由。两条完全一样的重复记录，并不能有效检查“保留首条”，因为留下哪条都看不出区别。让它们的内容不同，测试才有区分力。

## 修复后重新检查
先运行建议修复，再根据失败结果作限定范围的修改，并重新运行整组检查。不能因为测试与代码不一致，就直接删掉失败测试。

下面只检查纯函数。集成检查还需要确认应用传入了正确字段、实际使用了返回数组；系统检查要另行覆盖服务端重复请求。报告中应把这些层次分清。'''),
 ('A reference implementation is not the only correct algorithm. The checks should specify observable properties and include object identity and non-mutation. Explain what integration evidence you would add and why a unit suite cannot validate a database race.', '参考实现不是唯一正确算法。测试应检查外部行为，包括对象引用和输入不变。说明还要补充什么集成证据，以及为什么函数测试无法验证数据库竞争。'),
 W(('Complete the test table', '完成测试表'), ('Use the result of the code lab below.', '使用下面代码实验的实际结果。'), [('Write a duplicate-ID case with distinguishable records and exact expected output.', '写内容可区分的重复编号用例及准确输出。'), ('Write a same-name/different-ID case.', '写同名不同编号的用例。'), ('Add one system-level test that this code runner does not perform.', '补一条该代码运行器没有执行的系统测试。')],
 ('A:first, A:second, B must produce A:first, B in that order, retaining the original objects. Two records named Alex with IDs A and B must both remain. At system level, submit concurrent requests for the last ticket and verify only one confirmed allocation exists. The code runner does not perform that concurrency check.', 'A:first、A:second、B 必须按顺序得到 A:first、B，并保留原对象。两条姓名均为 Alex、编号为 A 和 B 的记录都应保留。系统层还要并发申请最后一张票，确认最终只产生一个有效分配；代码运行器没有进行该并发检查。'), [('Use expected outputs precise enough to distinguish policies.', '预期输出要能区分不同保留策略。'), ('Identify a different test layer for concurrency.', '指出并发验证属于另一层测试。')]), 'coding', starter='function uniqueBookings(bookings) {\n  return [...new Map(bookings.map(item => [item.studentId, item])).values()];\n}'),
 L('t3', ('Make a release decision under a budget', '在预算限制下决定怎样上线'),
 ('''## The release meeting
The concert has 200 tickets and around 500 student applicants. You have eight implementation credits. Identity checks, duplicate protection, a traffic queue and cancellation handling all cost something. An attractive event page is also requested.

Before choosing, list the failure each investment addresses. Identity checks address eligibility; deduplication addresses repeated requests; the queue addresses the opening rush; a waitlist reallocates cancelled tickets. No one option substitutes for all the others.

## Use the model carefully
The launch exercise uses fixed teaching rules and synthetic numbers. It is a way to compare consequences, not a forecast for a real university event. Investigation reveals the brief; a load test reveals the queue risk. Neither action secretly implements a missing feature.

Run two affordable strategies and compare them. Explain who experiences each remaining failure. The better choice depends on the agreed priorities, so a high total alone is not an adequate release argument.''',
 '''## 上线讨论
演唱会有 200 张票，预计约 500 名学生申请。可用实施预算为八点。身份检查、重复请求保护、排队和取消处理都需要投入，另外有人希望做一个好看的动态活动页。

选择前先列出每项投入防止什么失败：身份检查保证资格，去重防止重复领票，排队处理开放高峰，候补补回取消门票。任何一项都不能代替其他全部措施。

## 正确使用模拟
上线实验使用固定教学规则和虚构数字，用于比较后果，不是对真实活动的预测。调查只能让你知道需求，压力测试只能暴露排队风险，它们不会悄悄把缺少的功能做好。

尝试两种预算内的方案，比较留下的问题会影响谁。更好的方案取决于已确认的优先级，不能只拿一个总数作为上线理由。'''),
 ('Document the model assumptions and identify sensitivity: arrival pattern, cancellation rate and eligibility mix could change a real decision. The exercise does not model database overselling, operational staffing or legal policy. State which information you would need before applying it outside the lesson.', '记录模型假设及敏感因素：到达模式、取消比例和报名资格构成都可能改变真实决策。练习未模拟数据库超卖、现场工作人员或正式政策。说明应用到现实前还需要哪些信息。'),
 W(('Compare two launch plans', '比较两种上线方案'), ('Open the launch exercise and record two runs. These are simulated results.', '打开上线实验，记录两次运行；结果属于模拟。'), [('Record both selections and the observed outcomes.', '记录两次选择及观察结果。'), ('Explain the most serious remaining failure in each plan.', '解释每种方案最严重的遗留问题。'), ('Recommend one plan and state an assumption that could change your decision.', '推荐一种，并说明哪项假设改变会让你改选。')],
 ('Example comparison: identity + duplicate + queue costs seven credits and leaves cancellation reallocation unresolved. Identity + duplicate + waitlist costs six and leaves opening-rush timeouts unresolved. Which is acceptable depends on the event’s agreed release priorities. Use your actual displayed counts in your report. Do not copy this comparison as evidence of having run the exercise.', '参考比较：身份＋去重＋排队花七点，仍未处理取消名额补回；身份＋去重＋候补花六点，仍有开放高峰超时风险。能否接受取决于已确认的上线优先级。报告中的数字应使用你实际看到的运行结果，不能把这段参考比较当成已经运行过的证据。'), [('Compare different protections and remaining harms.', '比较保护措施及遗留影响。'), ('Identify the numbers as model output, not real measurements.', '明确数字来自模型，而非真实测量。')]), 'simulation'),
 L('t4', ('Write the release and recovery note', '写清上线与恢复办法'),
 ('''## A repair is ready
The duplicate-booking function now passes its checks. The release meeting still needs to know whether the server uses it, whether existing duplicates need cleanup, and what will happen if the error returns after deployment.

Write a release note for the people doing the work: change identifier, scope, evidence, owner, observation and recovery action. A rollback is not always enough. Reverting code will not automatically repair data already duplicated, and a data migration may need its own recovery procedure.

## Watch a defined signal
For a pilot, inspect a sample of booking IDs and duplicate-ID counts after opening. Set a threshold that triggers investigation or a pause. Assign someone who can act. “We will monitor closely” is not a procedure.

After the release, record what happened and what was learned. Keep timestamps and uncertainty. A useful incident review explains the contributing conditions and the repair; it should not invent a single careless person as the cause.''',
 '''## 函数修好了，能直接发布吗
去重函数已经通过检查，但上线前还需要确认：服务端是否真正使用它，已有重复记录是否要清理，部署后再次出错怎么办。

上线说明是给实际执行的人看的，应包含版本、范围、证据、负责人、观察内容和恢复动作。回滚代码不一定足够，已经重复的数据不会自动恢复，数据迁移可能还需要独立的恢复办法。

## 观察明确的信号
小范围上线后，可以抽查报名编号并检查重复编号数量。事先约定什么结果触发调查或暂停，并指定能执行的人。“密切关注”本身不是操作步骤。

上线后保留时间、实际结果和不确定处。故障复盘应解释造成问题的条件及修复办法，不能凭空把一个不认真的人当成唯一原因。'''),
 ('Separate code rollback, schema compatibility and data repair. A release gate should reference reproducible evidence; monitoring thresholds should match the risk and sample size rather than use arbitrary precision.', '区分代码回滚、结构兼容和数据修复。上线条件应指向可复现证据，监控阈值要与风险、样本量相称，不要使用没有依据的精确数字。'),
 W(('Submit a release note', '提交上线说明'), ('The repair affects only export deduplication, not ticket allocation.', '本次修复只影响导出去重，不改变分票。'), [('State the scope and verification evidence.', '说明改动范围和验证证据。'), ('Name the check after deployment and the condition for pausing.', '指定部署后的检查及暂停条件。'), ('Explain what rollback would and would not recover.', '解释回滚能恢复什么、不能恢复什么。')],
 ('Scope: export retains the first record for each student ID; no allocation rules changed. Evidence: recorded function and integration checks. After release, compare a controlled export against known duplicate and same-name records; pause export use if the result violates the contract. Reverting the exporter restores previous code but does not correct files already downloaded or change stored bookings. Identify who will regenerate affected exports.', '范围：导出按学生编号保留首条，不改变分票规则。证据：保留函数与集成检查结果。发布后用已知重复及同名样本核对导出；若违反约定，暂停使用导出。回退导出代码不能修复已下载文件，也不会修改保存的报名记录。指定谁重新生成受影响文件。'), [('Match the recovery action to the actual scope.', '恢复动作要对应实际改动范围。'), ('Give someone a concrete check and an action to take.', '指定具体检查与能够执行的动作。')]), 'reflection')
], ('Basic requirements and the AI coding function exercise are useful preparation.', '建议先了解需求和 AI 编程课中的函数练习。')))

courses.append(C('product-decisions', ('Product scope and team communication', '产品范围与团队沟通'),
 ('Negotiate a late change to a campus lunch-ordering service using user needs, delivery effort and operational evidence.', '围绕校园午餐预订的临时变更，综合用户需要、开发成本和运营证据进行协商。'),
 ('Compare conflicting goals; estimate a change as a team; record a scoped decision and a useful handover.', '比较冲突目标，与团队评估变更，形成范围清楚的决定并完成交接。'),
 ('A change proposal, a stakeholder response and an implementation handover.', '一份变更建议、给相关人员的回复和实施交接说明。'), 'product', 'peach', [
 L('p1', ('Find the problem behind the requested feature', '找到功能请求背后的问题'),
 ('''## Two days before the pilot
A campus lunch service lets students order before 10:00 for collection at noon. The shop asks for an “edit any time” button because students keep emailing corrections. The cook says preparation starts at 10:00 and changes afterwards cause waste. A developer says unrestricted editing touches payment and stock.

Each person is describing a real concern, but the feature request hides several different changes: editing before the cutoff, changing a paid order, cancelling preparation and refunding money. Estimate them separately.

## Ask about recent corrections
Were students correcting collection time, quantity, allergens or the menu item? How many requests arrived before preparation started? The answer matters. A clear confirmation screen might prevent some corrections; a pre-cutoff edit window might address others.

Do not decide that the shop is unreasonable or that the developer is obstructive. First make the consequences visible. Then agree which problem the next version will address.''',
 '''## 试用前两天
校园午餐服务要求学生 10:00 前下单，中午取餐。店员提出增加“随时修改”按钮，因为一直收到更正邮件。厨师说 10:00 开始备餐，之后修改会浪费食材；开发者说无限制修改牵涉支付和库存。

三个人都提出了真实顾虑，但“修改订单”包含不同改动：截止前编辑、改已付款订单、取消备餐、退款。不能把它们当成一个很小的按钮一起估算。

## 看看最近的更正
学生改的是取餐时间、数量、过敏信息还是菜品？多少请求发生在备餐之前？答案不同，方案也不同。更清楚的确认页可能预防部分问题，截止前修改也许能解决另一部分。

先不要说店员不讲理或开发者不配合。把后果摊开，再约定下个版本真正解决哪部分问题。'''),
 ('Distinguish a commercial decision, a domain safety rule and an implementation constraint. If allergen changes are involved, the team must agree a safe operational process with the shop rather than inventing health advice or silently permitting changes after preparation.', '区分商业决定、业务安全规则和实现约束。涉及过敏信息变更时，必须与商家确认安全处理流程，不能擅自提供健康判断，也不能悄悄允许备餐后修改。'),
 W(('Prepare the change discussion', '准备变更讨论'), ('Do not commit to unrestricted editing yet.', '先不要承诺无限制修改。'), [('List the different changes hidden inside “edit any time”.', '拆出“随时修改”中隐藏的不同改动。'), ('What evidence should you ask the shop for?', '向店员索取什么证据？'), ('Name one constraint that must be confirmed before release.', '列出上线前必须确认的一项约束。')],
 ('Separate pre-cutoff edits, paid-order adjustments, post-preparation changes and refunds. Ask for recent anonymized correction categories and times, including how staff handled each. Confirm the preparation cutoff and handling of sensitive order corrections with the shop. Do not assume a button alone resolves the operational process.', '拆分截止前修改、已付款订单调整、备餐后变更和退款。请店员提供去标识化的近期更正类型、时间及处理方式。与商家确认备餐截止点和敏感订单更正流程。不能假设增加按钮就能解决运营处理。'), [('Separate the feature into behaviours with different consequences.', '拆出后果不同的行为。'), ('Ask for evidence before estimating the complete solution.', '估算完整方案前先收集证据。')]) ),
 L('p2', ('Compare options without hiding the cost', '比较方案，也写清代价'),
 ('''## The planning numbers
For this fictional pilot, the team has six remaining effort units. Confirmation copy costs one, editing unpaid orders before the cutoff costs three, payment adjustments cost four, and post-cutoff changes cost five. Estimates include the stated implementation and checking, but they are not promises.

You cannot safely add estimates for features that depend on undefined rules. First agree the behaviour. For example, “before 10:00” needs a time boundary and a result for an edit arriving during checkout.

## Compare coherent options
Option A improves confirmation and supports pre-cutoff unpaid edits. Option B postpones editing and makes staff-assisted correction explicit. Both can be defensible depending on the pilot’s goals. Unrestricted editing consumes more than a small UI change and leaves payment and kitchen procedures unresolved.

Write the benefit, cost, risk and deferred work for each option. A priority score can help organize discussion, but made-up decimal values should not masquerade as evidence.''',
 '''## 本次讨论使用的估算
假设试用前还剩六个工作量单位：改确认文案需一，截止前编辑未付款订单需三，支付调整需四，截止后变更需五。估算包含约定的实现和检查，但不是绝对承诺。

规则不清楚时，不能只把数字相加。例如“10:00 前可改”还需要明确时间边界，以及编辑与付款同时发生时怎么办。先确认行为，再估算。

## 比较能实际交付的方案
A 方案改确认页，并允许截止前修改未付款订单；B 方案暂缓编辑，明确由工作人员协助更正的入口。根据试用目的，两者都可能合理。无限制修改牵涉的远不止一个按钮，支付和厨房处理仍有未决规则。

每个方案都写收益、代价、风险和推迟工作。优先级分数可以整理讨论，但不能用没有依据的小数代替证据。'''),
 ('Include dependencies and uncertainty in the estimate. A six-unit plan with no capacity for a risky integration may be less credible than a four-unit plan with a specific verification buffer. Document who agreed the scope and what observation would trigger reconsideration.', '估算要说明依赖与不确定性。正好占满六点、没有空间应对高风险集成的方案，可能不如四点加明确验证余量可信。记录谁同意范围，以及什么观察会触发重新讨论。'),
 W(('Write the options note', '写方案比较'), ('You have six effort units. Use the estimates in the reading.', '剩余六个工作量单位，使用讲解里的估算。'), [('Compare two feasible options with cost and expected benefit.', '比较两种可行方案，写成本和预期收益。'), ('Choose one and state what will wait.', '选择一种，说明推迟什么。'), ('What must be verified before calling it ready?', '称为可以上线前，必须检查什么？')],
 ('Option A: confirmation copy plus pre-cutoff unpaid editing costs four and addresses avoidable errors before preparation. Option B: copy plus an explicit staff correction process costs one in software effort but requires agreed staffing; do not call operational work free. Choose A for a pilot focused on self-service corrections, defer payment and post-cutoff changes, and verify boundary time, ownership and an edit racing with checkout.', 'A：确认文案＋截止前未付款编辑需四点，解决备餐前可避免的错误。B：文案＋明确人工更正流程的软件成本为一点，但需要约定人员投入，不能说运营工作免费。若试用重点是自助更正，可选 A，暂缓支付及截止后改动；检查时间边界、订单归属，以及编辑与付款竞争。'), [('Make both software and operational costs visible.', '同时看软件成本和运营成本。'), ('Do not promise behaviour whose rule is still undefined.', '规则未定义的行为不能先作承诺。')]), 'reflection'),
 L('p3', ('Respond to a disappointed stakeholder', '怎样回复对方案不满意的人'),
 ('''## The shop pushes back
“We asked for editing, not a lecture about scope.” A reply full of technical terminology is unlikely to help. A useful response acknowledges the underlying problem, describes the proposed behaviour and makes the remaining limitation explicit.

For example: “We can let students correct unpaid orders before 10:00. After that, preparation may have started, so the pilot will direct them to staff rather than confirm an automatic change. We will record the correction requests to see what remains unresolved.”

## Leave room for an answer
Ask whether that boundary addresses the main recent cases. If it does not, ask which cases would still fail and bring them back to the team. Negotiation is not repeating the same decision more forcefully.

The extracts below let you rehearse with the shop, kitchen and developer. The live AI option, when connected, can take the relevant role. Its suggestions still need checking against the agreed case rules.''',
 '''## 店员不同意
“我们要的是能修改，不是听你讲范围。”这时堆技术术语通常没有帮助。回复应承认原本的问题，说明准备提供的行为，并把剩余限制说清楚。

例如：“我们可以先让学生在 10:00 前修改未付款订单。之后可能已开始备餐，试用版会引导联系工作人员，不会自动承诺改动成功。我们会记录更正请求，再看还有哪些问题没解决。”

## 留出回应的余地
继续问：这条边界能不能解决最近最常见的情况？如果不能，哪些情况仍然会失败？把它带回团队讨论。协商不是更强硬地重复原来的决定。

下面的摘录分别来自店员、厨房和开发者，均为练习材料。接通实时 AI 后可进行角色练习，但它的建议仍要依据已确认规则核对。'''),
 ('Translate a technical risk into an observable operational consequence without exaggerating certainty. Explicitly distinguish a proposal from a commitment, and close the conversation with the decision owner and a review point.', '把技术风险转成可观察的运营后果，不夸大确定性。区分建议与承诺，并说明由谁决定、什么时候复查。'),
 W(('Draft the stakeholder reply', '起草给相关人员的回复'), ('Write a reply the shop can act on, not an internal technical memo.', '写店员能据此行动的回复，不要写成内部技术备忘录。'), [('Acknowledge the original difficulty in one sentence.', '用一句话回应原来的困难。'), ('Explain the proposed boundary and the help available outside it.', '说明建议范围，以及范围外怎样获得帮助。'), ('Ask a question that could change the proposed decision.', '提出一个可能改变方案的问题。')],
 ('We understand staff are spending time correcting orders by email. We propose letting students edit unpaid orders before 10:00; later corrections will go to staff because preparation or payment may already be committed. We will show this boundary before submission. Of last week’s corrections, which would still fail under this arrangement? Let us review those cases with the kitchen before confirming the pilot scope.', '我们理解店员正在花时间处理更正邮件。建议先支持 10:00 前修改未付款订单；之后可能已经备餐或付款，交给工作人员处理，并在提交前写清边界。上周的更正里，哪些在这个方案下仍然无法处理？我们想与厨房一起看这些情况，再确认试用范围。'), [('Use language the recipient understands.', '使用接收者能理解的语言。'), ('Include a real invitation to reconsider evidence.', '留出根据新证据调整方案的机会。')]), 'conversation', interview=[
 {'person':B('Shop assistant','店员'),'question':B('Which corrections arrive most often?','最常见的更正是什么？'),'answer':B('Most are quantity changes before 09:30. A few arrive after preparation. We currently reply manually and sometimes miss the first message.','大部分是 09:30 前改数量，也有少数发生在备餐后。现在靠手动回复，有时漏看第一封邮件。')},
 {'person':B('Kitchen lead','厨房负责人'),'question':B('What does a late change affect?','较晚的修改会影响什么？'),'answer':B('At 10:00 we start grouping meals. A change might already be packed. Staff must confirm what can be changed; the website should not promise it automatically.','10:00 开始分装，有些订单可能已经打包。能否更改要由工作人员确认，网页不能自动承诺。')},
 {'person':B('Developer','开发者'),'question':B('What is the smallest coherent change?','最小而完整的改动是什么？'),'answer':B('Unpaid edits before the cutoff are manageable if we check ownership and re-read order status on save. Paid edits need an agreed payment adjustment process.','截止前改未付款订单可以做，但保存时要检查归属并重新读取状态。改已付款订单还缺支付调整流程。')}
 ]),
 L('p4', ('Hand over the decision to the team', '把决定交接给实施团队'),
 ('''## A decision needs an owner and a record
After the meeting, one person remembers “editing approved”; another remembers “only before 10:00”. Write the decision while the agreement is fresh. Include the scope, rationale, exceptions, open questions and acceptance examples.

For this pilot, the proposed behaviour is editing unpaid orders before 10:00. A student may edit only their own order. At or after 10:00, or after payment, the service gives the staff-contact route. Saving an edit must recheck the current order state.

## Make the work reviewable
Separate the interface copy, server rule and verification tasks. Agree who reviews each. Keep changes small enough that another developer can understand them; a task with no expected result is difficult to review.

When two people change the same behaviour, compare the intended rules before resolving the code difference. A merge that removes the conflict markers can still combine incompatible decisions.''',
 '''## 决定需要记录和负责人
会议结束后，一个人记得“同意编辑”，另一个人记得“仅限 10:00 前”。趁约定还清楚，记录范围、理由、例外、待决问题和验收例子。

本次试用拟支持：学生只修改自己的未付款订单，且必须在 10:00 前；到达截止点或已经付款时，转为联系工作人员；保存时重新检查订单最新状态。

## 把工作拆到可以审查
分别安排界面说明、服务端规则和验证任务，并约定谁审查。改动小到别人看得懂，才便于合作。没有预期结果的任务，很难判断有没有完成。

如果两人同时改同一行为，先比较各自理解的规则，再处理代码差异。去掉冲突标记并不意味着两个相互矛盾的决定已经被正确整合。'''),
 ('Include version-control review evidence: a task linked to the agreed rule, a bounded change, independent review and checks. Explain how you would handle a paid-status change arriving between read and save. Do not hide concurrency behind a front-end cutoff.', '加入版本协作证据：任务对应哪条约定、小范围改动、独立审查及检查结果。说明读取后到保存前付款状态改变时怎么办，不能只靠前端截止时间处理并发。'),
 W(('Write the implementation handover', '编写实施交接'), ('Treat the proposed pre-cutoff rule as agreed for this exercise.', '本练习假设截止前修改规则已经同意。'), [('Write the final rule and two acceptance examples.', '写最终规则和两个验收例子。'), ('Split the work into implementation and independent checking tasks.', '拆出实施任务与独立检查任务。'), ('Name an open question and who must resolve it.', '列出一个待决问题，以及谁负责确认。')],
 ('Rule: only the owner may edit an unpaid order before 10:00, rechecking current status on save. At 09:59 an unpaid owner edit succeeds; at 10:00 it is rejected with the staff-contact route. Assign server enforcement, interface messaging and a separately reviewed boundary/ownership test set. The shop still owns the policy for post-payment corrections; do not implement an invented refund rule.', '规则：本人可在 10:00 前修改未付款订单，保存时重新检查状态。09:59 未付款且本人操作成功；10:00 拒绝并给出联系工作人员入口。分别安排服务端约束、界面说明及独立审查的边界／归属测试。已付款更正政策仍由商家确认，不能自行实现退款规则。'), [('The handover must preserve the negotiated boundary.', '交接不能丢掉协商好的边界。'), ('Include independent checking and a named policy owner.', '包含独立检查及政策确认者。')]) )
], ('Requirements and stakeholder interviews is recommended.', '建议先完成需求分析与用户访谈。')))

courses.append(C('career', ('Explaining your work in a technical interview', '在技术面试中讲清自己的工作'),
 ('Prepare an evidence-based project explanation and practise follow-up questions about design, tests and AI assistance.', '用证据准备项目介绍，练习回答设计、测试及 AI 协助方面的追问。'),
 ('Give a bounded account of your contribution; explain a trade-off; respond honestly when evidence is missing.', '准确说明个人贡献，解释设计取舍，在缺少证据时如实回应。'),
 ('A project case note, a written mock interview and a revision record.', '一份项目案例说明、书面模拟面试及修改记录。'), 'product', 'peach', [
 L('c1', ('Choose a project you can explain', '选一个你能解释清楚的项目'),
 ('''## Start with one change
An interviewer asks, “Tell me about something you built.” A list of frameworks gives little evidence of your work. Choose one user problem and a change you can explain: what was wrong, what you changed, how you checked it and what remains uncertain.

You may use the booking export exercise as a practice example, but describe it as a course exercise. Do not present fictional users or simulated outcomes as a production deployment.

## Keep contribution specific
“We built the system” can be true but does not identify your role. State which requirement, implementation or check you owned, what another person or AI assistant contributed, and where you reviewed that contribution.

A concise explanation can name the problem, your action, evidence and limitation in four sentences. Details come in the follow-up. Avoid opening with a claim that the project was revolutionary or perfectly secure; those claims are difficult to support and distract from the work.''',
 '''## 从一个改动开始
面试官问“说说你做过的项目”，罗列框架并不能说明你的工作。选一个能够解释清楚的用户问题和改动：原来哪里不对，你改了什么，怎样检查，还有什么不确定。

可以用报名导出去重作为练习案例，但要说明它是课程练习，不能把虚构用户或模拟结果说成真实上线经历。

## 具体说明贡献
“我们做了整个系统”可能属实，却看不出你的工作。说清由你负责哪项需求、实现或检查，其他人或 AI 提供了什么，以及你怎样审查这些内容。

可以先用四句话分别交代问题、行动、证据和局限，细节留给追问。无需开场就说项目具有突破性或绝对安全；这些主张难以支持，反而会遮住具体工作。'''),
 ('Prepare a change reference, the contract and one failing/passing example. Distinguish team ownership from individual contribution. If the work was not deployed, say what environment was used and which production questions remain.', '准备改动记录、行为约定和一组修复前后例子。区分团队成果与个人贡献。没有真实部署时，说明使用环境及尚未验证的生产问题。'),
 W(('Write a four-sentence project account', '写四句话项目介绍'), ('Use your own project or clearly label a course exercise.', '可以使用自己的项目，也可以明确标注课程练习。'), [('What problem and user task did you address?', '解决了什么问题，涉及哪项用户任务？'), ('What did you personally change, and what assistance did you use?', '你具体改了什么，使用了哪些协助？'), ('What evidence and limitation would you mention first?', '首先展示什么证据，并说明什么局限？')],
 ('In a course exercise, a booking export kept duplicate student records. I specified first-occurrence semantics and repaired the in-memory function with assistance from a coding tool. I checked repeated IDs, same-name students, empty input and input immutability. This was a function exercise; it did not test production ticket allocation or database concurrency.', '在一项课程练习中，报名导出包含重复学生记录。我明确了保留首次记录的规则，并在编程工具协助下修复内存函数。我检查了重复编号、同名学生、空输入和输入不变。这是函数练习，没有验证生产分票和数据库并发。'), [('Label the setting and scope accurately.', '准确标明场景和范围。'), ('Use an action and evidence, not a list of tools.', '讲行动与证据，不只列工具。')]) ),
 L('c2', ('Answer a follow-up about your design', '回答设计取舍的追问'),
 ('''## The follow-up
“Why did you use a Set?” Naming a data structure is not an explanation. Connect the choice to the contract: we need to remember IDs already seen while preserving the first original object and input order.

Compare one alternative. Repeatedly searching earlier input is straightforward but may do more work as the array grows. A Map can also solve the task if it only inserts unseen IDs; replacing every value would keep the last record instead.

## Do not overclaim
Saying “Sets are always faster” ignores input size, implementation and the operation being measured. Explain the expected behaviour and complexity under the assumptions of this exercise. If you did not benchmark, do not describe a measured speedup.

When asked about a choice you inherited, say so. You can still explain its consequences and what you would investigate. Understanding an inherited decision is different from claiming that you originally made it.''',
 '''## 面试官追问
“为什么使用 Set？”报出数据结构名称还不够，要把它与约定联系起来：记录已经出现的编号，同时保留首次原对象和输入顺序。

比较一种替代办法。反复搜索之前的输入比较直观，但数组变长时可能做更多重复工作。Map 也能完成任务，只要遇到已有编号时不覆盖；如果每次替换值，就会保留末条。

## 不要夸大
“Set 一定更快”忽略了输入大小、具体实现及测量的操作。解释本题假设下的行为和复杂度即可；没有做基准测试，就不能声称测出了多少倍加速。

如果选择是接手时已有的，就如实说明。仍然可以分析后果和需要进一步调查的地方。能理解一个继承来的设计，不等于最初作出了那个决定。'''),
 ('Discuss expected O(n) work and O(k) auxiliary storage for k distinct IDs, while noting that specification-level guarantees differ from implementation performance. Explain why object identity and ordering are contract concerns, not merely optimizations.', '可以讨论预期 O(n) 工作量和 k 个不同编号所需的 O(k) 辅助空间，同时区分规范保证与具体实现性能。对象引用和顺序属于行为约定，不只是优化。'),
 W(('Prepare a design answer', '准备设计回答'), ('Explain a decision from your own implementation or the course function.', '解释自己实现或课程函数中的一个决定。'), [('Connect the choice to a requirement.', '把选择与一条需求联系起来。'), ('Compare a viable alternative and its consequence.', '比较一种可行替代办法及其后果。'), ('What have you not measured or verified?', '还有什么没有测量或验证？')],
 ('A Set records seen student IDs so I can retain the first original record without sorting. A Map also works if it inserts only unseen IDs; unconditional replacement would violate first occurrence. The approach is expected linear in the number of input records with storage for distinct IDs, but I did not benchmark a particular runtime or production dataset.', 'Set 记录已经见过的学生编号，让我在不排序的前提下保留首条原记录。Map 只插入未见编号也可行；无条件覆盖会违反保留首次规则。方法预期按记录数线性处理，并保存不同编号，但我没有对某个运行时或生产数据集做基准测试。'), [('Compare behaviour before comparing performance.', '先比较行为，再比较性能。'), ('Separate an expectation from a measured result.', '区分预期分析与测量结果。')]) ),
 L('c3', ('Practise questions that need evidence', '练习需要拿出证据的追问'),
 ('''## A short mock interview
Use the prompts below one at a time. Write an answer before opening the suggested follow-up. Treat the follow-up as a way to examine the answer, not a script to memorize.

The interviewer may ask: what input broke the earlier version? How do you know the repair preserved the first record? What happens if two requests reach the server together? Which part did AI draft, and which part did you verify?

## When you do not know
If a question goes beyond your evidence, state what you do know and propose a check. “I have not tested the server race. I would submit concurrent requests for the last place and inspect the final allocations” is more informative than guessing that the Set makes it safe.

A practice interview should reveal where your explanation needs work. It is not a hiring decision or an objective measurement of employability. The review checklist is qualitative and tied to the evidence in your answer.''',
 '''## 一次简短模拟面试
逐个使用下面的问题。先写回答，再展开参考追问。追问用于检查你的回答，不是让你背诵一份标准台词。

面试官可能问：旧版本被什么输入弄错？怎样确认保留了首条？两个请求同时到服务端会怎样？AI 起草哪部分，你检查哪部分？

## 不知道时怎么答
如果问题超出已有证据，说明知道什么，再提出检查办法。“服务端竞争还没测试，我会并发申请最后一个名额，再检查最终分配”比猜测 Set 让整个系统安全更有用。

模拟面试是为了发现表达中的空缺，不是招聘决定，也不是对就业能力的客观分数。自查清单只围绕回答中有没有清楚说明证据。'''),
 ('For a system-design follow-up, clarify workload, consistency and failure assumptions before naming a component. For an implementation follow-up, explain the exact path or counterexample. Switching to generic architecture vocabulary does not answer a question about the code you showed.', '系统设计追问先澄清负载、一致性和失败假设，再谈组件；实现追问应解释具体路径或反例。突然堆系统架构术语，不能回答刚展示的代码问题。'),
 W(('Complete the written mock interview', '完成书面模拟面试'), ('Choose three prompts below; answer them using work you can substantiate.', '选择下面三个问题，用能够说明依据的工作回答。'), [('Explain one defect and the smallest counterexample.', '解释一个缺陷及最小反例。'), ('Explain one design choice and an alternative.', '解释一个设计选择及替代方案。'), ('Describe the help you used, your verification and one unanswered question.', '说明使用的协助、自己的验证及一个尚未回答的问题。')],
 ('A strong answer names the first/last-record distinction and shows two records with the same ID but different details; compares a Set with a correctly used Map; and separates function checks from server guarantees. It identifies actual AI assistance without treating the generated explanation as evidence. There is no single required wording. If you use a personal project, your evidence should replace this example.', '好的回答会点明首条与末条的区别，展示相同编号、不同内容的两条记录；比较 Set 与正确使用的 Map；区分函数测试和服务端保证。如实说明 AI 协助，不把生成的解释当作验证。没有唯一规定措辞。使用个人项目时，应换成自己的证据。'), [('Give a counterexample someone can inspect.', '给出别人能检查的反例。'), ('Acknowledge an evidence gap and propose a relevant check.', '承认证据空缺，并提出对应检查。')]), 'conversation', mockInterview=True, interview=[
 {'person':B('Interviewer','面试官'),'question':B('What exactly was wrong with the earlier implementation?','旧实现具体哪里不对？'),'answer':B('Follow-up: show the smallest input on which it fails, then state the expected output before describing the fix.','参考追问：展示最小失败输入，先给预期输出，再解释修复。')},
 {'person':B('Interviewer','面试官'),'question':B('Why did you choose this approach rather than a Map?','为什么采用这个办法，而不是 Map？'),'answer':B('Follow-up: a Map can also work. Explain which use of it changes the first-occurrence contract, and avoid claiming a benchmark you did not run.','参考追问：Map 也可以正确实现。说明哪种用法改变了首条约定，不要声称没有测过的性能结果。')},
 {'person':B('Interviewer','面试官'),'question':B('Does this stop two people booking the last ticket?','这能阻止两个人抢到最后一张票吗？'),'answer':B('Follow-up: distinguish export cleanup from server allocation. What concurrency check and storage guarantee would you need?','参考追问：区分导出清理和服务端分票，需要什么并发检查及存储保证？')},
 {'person':B('Interviewer','面试官'),'question':B('What did you contribute when AI generated the code?','AI 生成代码时，你贡献了什么？'),'answer':B('Follow-up: identify one constraint you supplied, one output you rejected, and one independent check. Use actual evidence.','参考追问：指出你提供的一条约束、拒绝的一个结果及一项独立检查，使用真实证据。')}
 ]),
 L('c4', ('Revise the explanation after the interview', '面试以后怎样修改介绍'),
 ('''## Review the answer, not your personality
Read your first answer beside the follow-up questions. Mark places where the reader could not identify the user problem, your contribution or the evidence. Replace vague claims with one concrete example.

For example, replace “the system was highly reliable” with “the function passed duplicate-ID, same-name, empty-input and non-mutation checks; server concurrency was outside this exercise.” The second statement is narrower and gives the reader something to examine.

## Keep a revision record
Save the first account, the question that exposed a gap and the revised account. If the gap is technical rather than verbal, do the missing investigation before claiming it has been resolved.

For your final case note, include the problem, the agreed behaviour, an implementation or design artifact, verification evidence, assistance used and remaining limitations. The result should sound like an explanation of work you understand, rather than an advertisement for yourself.''',
 '''## 检查回答，不评价自己的人格
把第一次回答和追问放在一起，标出读者无法确定用户问题、个人贡献或验证依据的地方。用一个具体例子替换模糊主张。

例如，把“系统高度可靠”改成“函数通过了重复编号、同名、空输入和输入不变检查；服务端并发不在本次练习范围”。后一句范围较小，却给了读者能够核查的内容。

## 保留修改过程
保存初稿、暴露空缺的问题和修改稿。如果缺的是技术调查，而非表达方式，应先完成调查，再声称已解决。

最终案例说明包含问题、约定行为、一份实现或设计材料、验证证据、使用的协助与剩余局限。读起来应当像在解释自己理解的工作，而不是给自己写宣传文案。'''),
 ('Separate an explanation gap from a verification gap. A clearer sentence cannot replace a missing test. Include a reproducible reference to the evidence and identify what could change your current conclusion.', '区分表达空缺和验证空缺：句子更清楚不能代替缺失测试。提供能够复现或查阅的证据，并说明什么新发现会改变当前结论。'),
 W(('Submit the revised project case note', '提交修改后的项目案例说明'), ('Keep both the original and revised account in your work.', '在作业里保留原稿和修改稿。'), [('Quote a vague sentence from your first answer and explain the problem.', '引用初稿中的模糊句子，解释哪里不够清楚。'), ('Rewrite it with specific evidence and a limitation.', '用具体证据和局限重新表述。'), ('What investigation, if any, still needs doing?', '还有什么需要实际调查，而不能靠改措辞解决？')],
 ('Original: “AI helped me make the booking system secure.” Revision: “In a course exercise, I reviewed an AI-generated export function and verified first-occurrence semantics with independent cases. I did not evaluate account security or server allocation.” Missing investigation: authorization and concurrent allocation tests. Better wording makes the scope honest; those tests still need to be performed if the claim is expanded.', '原稿：“AI 帮我把报名系统做安全了。”修改：“在课程练习中，我审查了 AI 生成的导出函数，用独立用例检查了保留首条规则；没有评估账号安全或服务端分配。”仍缺权限和并发分配测试。改措辞只是让范围准确，如果要扩大主张，还必须实际完成这些检查。'), [('Retain the before/after explanation.', '保留修改前后内容。'), ('Do not treat wording changes as completed technical work.', '不能把改措辞当作完成技术验证。')]), 'reflection')
], ('Bring one completed exercise or a project you can explain. Recommended after the AI coding course.', '带一份已完成练习或能解释的项目，建议在 AI 编程课后学习。')))

references = [
 {'title': 'Full Stack Open — Fundamentals of Web apps', 'url': 'https://fullstackopen.com/en/part0/fundamentals_of_web_apps', 'courses':['architecture'], 'use': B('Further reading on browser/server requests and sequence diagrams.', '延伸阅读：浏览器与服务端请求、时序图。')},
 {'title': 'CS50 — Problem Set 1', 'url': 'https://cs50.harvard.edu/x/psets/1/', 'courses':['ai-coding','testing-release'], 'use': B('A course-design reference for specifications, examples and independent checks. Our cases and exercises are original.', '课程组织参考：明确题目约定、例子和独立检查。本平台案例与练习为原创。')},
 {'title': 'The Carpentries — Preparing to Teach', 'url': 'https://carpentries.github.io/instructor-training/instructor/18-preparation.html', 'courses':[], 'use': B('A teaching-design reference for objectives and formative checkpoints.', '教学组织参考：学习目标与形成性检查点。')}
]

references.extend([
 {'title':'MDN — Set', 'url':'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set', 'courses':['ai-coding','testing-release','career'], 'use':B('Reference for unique values, identity and collection behaviour.', '关于唯一值、对象引用和集合行为的参考。')},
 {'title':'MDN — Map', 'url':'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map', 'courses':['ai-coding','testing-release','career'], 'use':B('Compare keyed updates with first-occurrence requirements.', '对照按键更新与保留首次记录的约定。')},
 {'title':'OWASP — Authorization Cheat Sheet', 'url':'https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html', 'courses':['architecture'], 'use':B('Further reading on enforcing permissions for each request.', '延伸阅读：逐次请求的权限检查。')},
 {'title':'Pro Git — Contributing to a Project', 'url':'https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project', 'courses':['development','product-decisions'], 'use':B('Further reading on reviewable changes and collaboration.', '延伸阅读：便于审查的改动和协作方式。')}
])
lesson_times={'development':[8,7,9,7],'requirements':[7,12,10,9],'architecture':[8,9,10,9],'ai-coding':[8,15,10,7],'testing-release':[8,14,12,8],'product-decisions':[8,11,12,9],'career':[7,9,15,8]}
for course in courses:
 course['duration']=sum(lesson_times[course['id']])
 for index,lesson in enumerate(course['lessons']):
  if lesson['type']=='coding':lesson['solution']='function uniqueBookings(bookings) {\n  const seen = new Set();\n  return bookings.filter(booking => {\n    if (seen.has(booking.studentId)) return false;\n    seen.add(booking.studentId);\n    return true;\n  });\n}'
  lesson['minutes']=lesson_times[course['id']][index]
  if lesson['id']=='p2':lesson['type']='scope'
  if lesson['id']=='d2':lesson['stepLabels']=[B('Clarify','澄清'),B('Design','设计'),B('Build & test','实现和测试'),B('Review','观察和复查')]
  if lesson['id']=='s1':lesson['stepLabels']=[B('Browser','浏览器'),B('Server','服务端'),B('Database','数据库'),B('Response','响应')]

if __name__ == '__main__':
    target = Path(__file__).resolve().parents[1] / 'public' / 'curriculum.js'
    target.write_text('// Original teaching cases; see docs/course-design.md for provenance and limitations.\nexport const courses = '+json.dumps(courses,ensure_ascii=False,indent=2)+';\nexport const courseReferences = '+json.dumps(references,ensure_ascii=False,indent=2)+';\n')
    print(f'Generated {len(courses)} courses / {sum(len(c["lessons"]) for c in courses)} lessons → {target}')
