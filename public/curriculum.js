// Original teaching cases; see docs/course-design.md for provenance and limitations.
export const courses = [
  {
    "id": "development",
    "title": {
      "en": "Software development: from brief to release",
      "zh-CN": "软件开发：从需求到发布",
      "zh-TW": "軟體開發：從需求到釋出"
    },
    "description": {
      "en": "Plan the first release of a campus second-hand book service. Learn what happens before and after the code is written.",
      "zh-CN": "为校园二手书服务安排第一个版本，了解写代码前后各要做哪些工作。",
      "zh-TW": "為校園二手書服務安排第一個版本，瞭解寫程式碼前後各要做哪些工作。"
    },
    "outcomes": {
      "en": "Distinguish an outcome from a feature; plan a small release; explain where testing and user feedback belong.",
      "zh-CN": "区分目标和功能，安排范围适当的首版，解释测试与用户反馈应该放在哪里。",
      "zh-TW": "區分目標和功能，安排範圍適當的首版，解釋測試與使用者回饋應該放在哪裡。"
    },
    "deliverable": {
      "en": "A first-release plan with a test and a feedback method.",
      "zh-CN": "一份包含测试与反馈方法的首版计划。",
      "zh-TW": "一份包含測試與回饋方法的首版計劃。"
    },
    "prerequisite": {
      "en": "No programming required.",
      "zh-CN": "不需要编程基础。",
      "zh-TW": "不需要程式設計基礎。"
    },
    "topic": "foundations",
    "theme": "mint",
    "duration": 31,
    "status": "published",
    "source": "built-in",
    "curriculumVersion": 2,
    "lessons": [
      {
        "id": "d1",
        "title": {
          "en": "Read the brief before choosing the technology",
          "zh-CN": "先读清楚委托，再选技术",
          "zh-TW": "先讀清楚委託，再選技術"
        },
        "body": {
          "en": "## The brief\nThe student union wants a second-hand book website before term starts. Its message lists chat, online payment, seller ratings and a recommendation feed. You have two weeks. Nobody has yet spoken to a buyer.\n\nIt is tempting to turn this list into a development checklist. First ask what the service is meant to improve. Perhaps buyers cannot find books for their course. Perhaps sellers forget to remove sold books. Those are different problems, and a recommendation feed does not automatically solve either one.\n\n## A useful first conversation\nAsk a student to describe their most recent attempt to buy a used book. Where did they look? What information was missing? At what point did the exchange fail? A recent example gives you something to investigate. “Would you use our new website?” mainly invites politeness.\n\n## From observation to a small release\nSuppose five buyers report that old advertisements waste their time. A plausible first release is a searchable list with a visible availability status and a seller contact link. Payment can remain outside the service. This is a hypothesis to test, rather than proof that every student has the same problem.",
          "zh-CN": "## 项目委托\n学生会希望在开学前上线二手书网站。邮件里列了聊天、在线支付、卖家评分和推荐信息流。你们有两周时间，还没有访谈过买书的同学。\n\n不要急着把这张功能表变成开发清单。先问：现在的交易在哪一步出问题？可能是买家找不到对应课程的书，也可能是书卖掉以后旧帖子一直没有删除。两个问题的解决办法不同，推荐信息流未必能帮上忙。\n\n## 第一轮怎么问\n请一位同学回忆最近一次购买二手书的经过：去哪里找？缺少什么信息？哪一步没谈成？具体经历便于继续追问。“如果我们做个网站，你会不会用？”很容易只得到一句客气的“会”。\n\n## 缩小第一个版本\n假设五位买家都提到旧帖子浪费时间，可以先验证一个方案：可搜索的书单、明确的在售状态和卖家联系方式。交易暂时在线下完成。这是根据访谈提出的假设，还不能说明全校学生都有同样的问题。",
          "zh-TW": "## 專案委託\n學生會希望在開學前上線二手書網站。郵件裡列了聊天、線上支付、賣家評分和推薦資訊流。你們有兩週時間，還沒有訪談過買書的同學。\n\n不要急著把這張功能表變成開發清單。先問：現在的交易在哪一步出問題？可能是買家找不到對應課程的書，也可能是書賣掉以後舊貼文一直沒有刪除。兩個問題的解決辦法不同，推薦資訊流未必能幫上忙。\n\n## 第一輪怎麼問\n請一位同學回憶最近一次購買二手書的經過：去哪裡找？缺少什麼資訊？哪一步沒談成？具體經歷便於繼續追問。“如果我們做個網站，你會不會用？”很容易只得到一句客氣的“會”。\n\n## 縮小第一個版本\n假設五位買家都提到舊貼文浪費時間，可以先驗證一個方案：可搜尋的書單、明確的在售狀態和賣家聯絡方式。交易暫時線下完成。這是根據訪談提出的假設，還不能說明全校學生都有同樣的問題。"
        },
        "advanced": {
          "en": "Separate the outcome metric from a proxy. A count of listings does not show whether buyers find available books. Define an observation window, the denominator and how you would record unsuccessful searches. Five interviews can reveal a problem; they do not estimate its prevalence reliably.",
          "zh-CN": "区分结果指标和替代指标。上架数量并不能证明买家找到了仍在出售的书。说明观察周期、分母，以及怎样记录没有成功的搜索。五次访谈可以发现问题，但不足以可靠估计问题在全校出现的比例。",
          "zh-TW": "區分結果指標和替代指標。上架數量並不能證明買家找到了仍在出售的書。說明觀察週期、分母，以及怎樣記錄沒有成功的搜尋。五次訪談可以發現問題，但不足以可靠估計問題在全校出現的比例。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Name a user and a problem, rather than restating the feature list.",
          "zh-CN": "先回到案例里的证据。写清具体用户和问题，不要只复述功能表。",
          "zh-TW": "先回到案例裡的證據。寫清具體使用者和問題，不要只複述功能表。"
        },
        "workshop": {
          "title": {
            "en": "Prepare a one-page brief",
            "zh-CN": "整理一页项目说明",
            "zh-TW": "整理一頁專案說明"
          },
          "brief": {
            "en": "Use the fictional interview finding above. Write a proposal the student union could question.",
            "zh-CN": "根据上面的访谈发现，写一份便于学生会讨论的建议。",
            "zh-TW": "根據上面的訪談發現，寫一份便於學生會討論的建議。"
          },
          "questions": [
            {
              "en": "What problem will the first version address? Cite the observation.",
              "zh-CN": "首版要解决什么问题？依据是哪条观察？",
              "zh-TW": "首版要解決什麼問題？依據是哪條觀察？"
            },
            {
              "en": "Which two capabilities belong in the first release? What can wait?",
              "zh-CN": "首版保留哪两个能力？什么可以暂缓？",
              "zh-TW": "首版保留哪兩個能力？什麼可以暫緩？"
            },
            {
              "en": "What would you observe to decide whether the release helped?",
              "zh-CN": "观察什么，才能判断首版有没有帮助？",
              "zh-TW": "觀察什麼，才能判斷首版有沒有幫助？"
            }
          ],
          "sample": {
            "en": "Problem: buyers lose time contacting sellers whose books are already sold. Evidence: five recent buying accounts, to be checked with more users. First release: search by course or book title, and show a seller-maintained availability status. A contact link can use an existing channel. Defer payment and recommendations. During a one-week pilot, record whether a buyer can find an available matching book and the reasons unsuccessful searches fail. Do not claim the pilot proves campus-wide demand.",
            "zh-CN": "问题：买家花时间联系已经卖掉书的卖家。依据是五位同学的近期购买经历，仍需向更多用户核实。首版支持按课程或书名搜索，并由卖家维护在售状态；联系卖家先使用现成渠道。暂缓支付和推荐。试用一周，记录买家是否找到符合需要且仍在出售的书，并记录失败原因。不能把小范围试用当成全校需求已经得到证明。",
            "zh-TW": "問題：買家花時間聯絡已經賣掉書的賣家。依據是五位同學的近期購買經歷，仍需向更多使用者核實。首版支援按課程或書名搜尋，並由賣家維護在售狀態；聯絡賣家先使用現成渠道。暫緩支付和推薦。試用一週，記錄買家是否找到符合需要且仍在出售的書，並記錄失敗原因。不能把小範圍試用當成全校需求已經得到證明。"
          },
          "rubric": [
            {
              "en": "Name a user and a problem, rather than restating the feature list.",
              "zh-CN": "写清具体用户和问题，不要只复述功能表。",
              "zh-TW": "寫清具體使用者和問題，不要只複述功能表。"
            },
            {
              "en": "Keep the proposed scope feasible within two weeks.",
              "zh-CN": "首版范围要与两周时间相称。",
              "zh-TW": "首版範圍要與兩週時間相稱。"
            },
            {
              "en": "Use an observable outcome, including unsuccessful attempts.",
              "zh-CN": "观察真实结果，也记录没有成功的尝试。",
              "zh-TW": "觀察真實結果，也記錄沒有成功的嘗試。"
            }
          ]
        },
        "type": "read",
        "minutes": 8,
        "check": {
          "question": {
            "en": "Which question is most useful in the first interview?",
            "zh-CN": "第一次访谈中，哪个问题最有帮助？",
            "zh-TW": "第一次訪談中，哪個問題最有幫助？"
          },
          "options": [
            {
              "text": {
                "en": "Would you use an AI-powered book website?",
                "zh-CN": "你会使用 AI 二手书网站吗？",
                "zh-TW": "你會使用 AI 二手書網站嗎？"
              },
              "feedback": {
                "en": "It asks for a prediction and introduces your preferred solution before you understand the current difficulty.",
                "zh-CN": "它要求对未来作预测，而且过早引入了你偏好的方案。",
                "zh-TW": "它要求對未來作預測，而且過早引入了你偏好的方案。"
              }
            },
            {
              "text": {
                "en": "Tell me about the last time you tried to buy a used textbook.",
                "zh-CN": "说说你最近一次买二手教材的经过。",
                "zh-TW": "說說你最近一次買二手教材的經過。"
              },
              "feedback": {
                "en": "A recent event lets you ask about the actual steps, obstacles and workarounds. It is still one person’s account, not a representative survey.",
                "zh-CN": "近期经历便于追问真实步骤、阻碍和替代办法；但一个人的经历仍不代表所有用户。",
                "zh-TW": "近期經歷便於追問真實步驟、阻礙和替代辦法；但一個人的經歷仍不代表所有使用者。"
              }
            },
            {
              "text": {
                "en": "Should the button be yellow or purple?",
                "zh-CN": "按钮应该用黄色还是紫色？",
                "zh-TW": "按鈕應該用黃色還是紫色？"
              },
              "feedback": {
                "en": "Appearance matters later, but it does not establish which problem the service should solve.",
                "zh-CN": "外观可以以后讨论，现在还没有明确服务要解决什么问题。",
                "zh-TW": "外觀可以以後討論，現在還沒有明確服務要解決什麼問題。"
              }
            }
          ],
          "correct": 1
        }
      },
      {
        "id": "d2",
        "title": {
          "en": "Follow one change through the development process",
          "zh-CN": "跟着一个改动看开发流程",
          "zh-TW": "跟著一個改動看開發流程"
        },
        "body": {
          "en": "## A change with consequences\nA seller wants to mark a book as sold. Before coding a button, decide who may change a listing and what buyers should see afterwards. “Mark as sold” is the feature; the owner check and the resulting search behaviour are part of its requirements.\n\nDesign comes next: the listing needs an owner and an availability state. Development implements the interface and the server operation. Tests should include the seller’s normal request, a different user’s request, and a repeated click.\n\n## Release is not the finish line\nAfter deployment, a seller reports that the button appears to work, but a refresh restores the old status. The browser changed its display without saving to the server. The report sends us back to implementation and testing. It does not require starting the entire project again.\n\nA development lifecycle names kinds of work. It need not mean one long, irreversible sequence. A small change can pass through clarification, design, implementation, checking and observation several times.",
          "zh-CN": "## 一个按钮牵动哪些工作\n卖家希望把教材标记为“已售”。写按钮以前，先明确谁能修改帖子，以及修改后买家会看到什么。“标记已售”是功能，身份检查和搜索结果的变化也是需求的一部分。\n\n设计时，帖子需要保存发布者和出售状态。开发时，既要做界面，也要实现服务端操作。测试至少检查：卖家正常修改、其他用户尝试修改，以及连续点击两次。\n\n## 发布以后还有工作\n上线后，一位卖家反映：点完按钮似乎成功了，但刷新页面又变回“在售”。原因是浏览器只改了显示，没有把状态保存到服务器。这个反馈会让我们回到实现和测试，而不必把整个项目从头再做一遍。\n\n开发生命周期描述的是几类工作，不一定是一条只能往前走的长流水线。一个小改动也会经历澄清、设计、实现、检查和观察，并根据发现反复调整。",
          "zh-TW": "## 一個按鈕牽動哪些工作\n賣家希望把教材標記為“已售”。寫按鈕以前，先明確誰能修改貼文，以及修改後買家會看到什麼。“標記已售”是功能，身份檢查和搜尋結果的變化也是需求的一部分。\n\n設計時，貼文需要儲存釋出者和出售狀態。開發時，既要做介面，也要實現服務端操作。測試至少檢查：賣家正常修改、其他使用者嘗試修改，以及連續點選兩次。\n\n## 釋出以後還有工作\n上線後，一位賣家反映：點完按鈕似乎成功了，但重新整理頁面又變回“在售”。原因是瀏覽器只改了顯示，沒有把狀態儲存到伺服器。這個回饋會讓我們回到實現和測試，而不必把整個專案從頭再做一遍。\n\n開發生命週期描述的是幾類工作，不一定是一條只能往前走的長流水線。一個小改動也會經歷澄清、設計、實現、檢查和觀察，並根據發現反覆調整。"
        },
        "advanced": {
          "en": "For this change, identify the authoritative state and the trust boundary. The server must derive the owner from the authenticated session and stored listing, not accept an ownerId supplied by the browser. A UI-only check improves usability but does not authorize an update.",
          "zh-CN": "指出该改动的权威数据来源和信任边界。服务端应根据登录会话及已保存的帖子判断发布者，不能直接相信浏览器提交的 ownerId。界面检查可以减少误操作，但不能替代权限校验。",
          "zh-TW": "指出該改動的權威資料來源和信任邊界。服務端應根據登入會話及已儲存的貼文判斷髮布者，不能直接相信瀏覽器提交的 ownerId。介面檢查可以減少誤操作，但不能替代許可權校驗。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Separate a visible UI change from persisted data.",
          "zh-CN": "先回到案例里的证据。区分界面显示改变和数据已经保存。",
          "zh-TW": "先回到案例裡的證據。區分介面顯示改變和資料已經儲存。"
        },
        "workshop": {
          "title": {
            "en": "Trace a change",
            "zh-CN": "追踪一个改动",
            "zh-TW": "追蹤一個改動"
          },
          "brief": {
            "en": "A listing looks sold until the page is refreshed.",
            "zh-CN": "帖子刚修改时显示已售，刷新后又显示在售。",
            "zh-TW": "貼文剛修改時顯示已售，重新整理後又顯示在售。"
          },
          "questions": [
            {
              "en": "What behaviour did the user expect?",
              "zh-CN": "用户期望什么行为？",
              "zh-TW": "使用者期望什麼行為？"
            },
            {
              "en": "Which part of the system would you inspect first, and what evidence would you collect?",
              "zh-CN": "先检查系统的哪个部分？收集什么证据？",
              "zh-TW": "先檢查系統的哪個部分？收集什麼證據？"
            },
            {
              "en": "Write a check that would have caught this before release.",
              "zh-CN": "写一个上线前本可发现该问题的检查。",
              "zh-TW": "寫一個上線前本可發現該問題的檢查。"
            }
          ],
          "sample": {
            "en": "Expected behaviour: an owner’s successful update remains visible after reload and in another authorized session. Inspect the network request and the stored listing status; do not infer persistence from the colour of a button. Test by changing a listing, reloading, and fetching it again. Also verify that another user cannot perform the same update.",
            "zh-CN": "预期行为：卖家的成功修改应在刷新后仍然保留，其他有权查看的用户也应看到新状态。先检查请求有没有发出，以及保存的帖子状态；不要仅凭按钮变色推断已持久保存。测试步骤是修改帖子、重新加载、再次读取状态，还要验证其他用户不能修改这条帖子。",
            "zh-TW": "預期行為：賣家的成功修改應在重新整理後仍然保留，其他有權檢視的使用者也應看到新狀態。先檢查請求有沒有發出，以及儲存的貼文狀態；不要僅憑按鈕變色推斷已持久儲存。測試步驟是修改貼文、重新載入、再次讀取狀態，還要驗證其他使用者不能修改這條貼文。"
          },
          "rubric": [
            {
              "en": "Separate a visible UI change from persisted data.",
              "zh-CN": "区分界面显示改变和数据已经保存。",
              "zh-TW": "區分介面顯示改變和資料已經儲存。"
            },
            {
              "en": "Describe a reproducible check with an expected result.",
              "zh-CN": "写出能够复现的步骤与预期结果。",
              "zh-TW": "寫出能夠復現的步驟與預期結果。"
            }
          ]
        },
        "type": "slides",
        "minutes": 7,
        "slides": [
          {
            "en": "Clarify: the owner can mark their own listing as sold.",
            "zh-CN": "澄清：发布者可以将自己的帖子标记为已售。",
            "zh-TW": "澄清：釋出者可以將自己的貼文標記為已售。"
          },
          {
            "en": "Design: store owner and status; identify the server operation.",
            "zh-CN": "设计：保存发布者与状态，明确服务端操作。",
            "zh-TW": "設計：儲存釋出者與狀態，明確服務端操作。"
          },
          {
            "en": "Implement and test: try the owner, another user and a repeated request.",
            "zh-CN": "实现和测试：检查发布者、其他用户及重复请求。",
            "zh-TW": "實現和測試：檢查釋出者、其他使用者及重複請求。"
          },
          {
            "en": "Release and observe: reload the page and ask a seller to try it.",
            "zh-CN": "发布和观察：重新加载页面，请卖家实际试用。",
            "zh-TW": "釋出和觀察：重新載入頁面，請賣家實際試用。"
          }
        ],
        "stepLabels": [
          {
            "en": "Clarify",
            "zh-CN": "澄清",
            "zh-TW": "澄清"
          },
          {
            "en": "Design",
            "zh-CN": "设计",
            "zh-TW": "設計"
          },
          {
            "en": "Build & test",
            "zh-CN": "实现和测试",
            "zh-TW": "實現和測試"
          },
          {
            "en": "Review",
            "zh-CN": "观察和复查",
            "zh-TW": "觀察和複查"
          }
        ]
      },
      {
        "id": "d3",
        "title": {
          "en": "Choose a release you can learn from",
          "zh-CN": "安排一个能获得反馈的首版",
          "zh-TW": "安排一個能獲得回饋的首版"
        },
        "body": {
          "en": "## Small does not mean unfinished\nThe book service can launch without recommendations. It cannot sensibly launch with no way to tell whether a book is still available. A minimum viable release should support a useful task from beginning to end.\n\nConsider two plans. Plan A builds separate pieces of search, chat, payments and ratings, but none can complete a transaction. Plan B lets a small group list a book, find it, contact the seller and close the listing. Plan B leaves out more features, yet teaches the team more about the core exchange.\n\n## Set a stopping rule\nBefore the pilot, agree what would make you pause. For example, if users can edit another seller’s listing, stop the pilot and repair that behaviour. If buyers cannot find the subject filter, observe where they look before redesigning the page. A software defect and an uncertain design assumption need different kinds of evidence.\n\nWrite the reason for every postponed feature. “Not now” should preserve a decision, not lose the request.",
          "zh-CN": "## 小版本也要能把事情做完\n二手书服务可以暂时没有推荐功能，但不能让买家完全看不出书是否仍在出售。最小可用版本应该让用户从头到尾完成一项有用的任务。\n\n比较两种安排：A 方案分别做了一点搜索、聊天、支付和评分，但没有一条流程能完整走通；B 方案让一个小范围的用户能够上架、找书、联系卖家和关闭帖子。B 少做了很多功能，却更适合检验交易过程是否可用。\n\n## 提前约定什么时候暂停\n试用前先约定停止条件。例如发现用户能修改别人的帖子，就暂停试用，先修复权限问题。若买家找不到学科筛选，则先观察他们会去哪里找，再考虑改界面。软件缺陷和设计假设需要的证据不同。\n\n被推迟的功能要留下理由和重新讨论的条件。“以后再说”不应变成把用户的请求忘掉。",
          "zh-TW": "## 小版本也要能把事情做完\n二手書服務可以暫時沒有推薦功能，但不能讓買家完全看不出書是否仍在出售。最小可用版本應該讓使用者從頭到尾完成一項有用的任務。\n\n比較兩種安排：A 方案分別做了一點搜尋、聊天、支付和評分，但沒有一條流程能完整走通；B 方案讓一個小範圍的使用者能夠上架、找書、聯絡賣家和關閉貼文。B 少做了很多功能，卻更適合檢驗交易過程是否可用。\n\n## 提前約定什麼時候暫停\n試用前先約定停止條件。例如發現使用者能修改別人的貼文，就暫停試用，先修復許可權問題。若買家找不到學科篩選，則先觀察他們會去哪裡找，再考慮改介面。軟體缺陷和設計假設需要的證據不同。\n\n被推遲的功能要留下理由和重新討論的條件。“以後再說”不應變成把使用者的請求忘掉。"
        },
        "advanced": {
          "en": "Specify entry and exit criteria for a pilot. Include ownership, recovery and a review date. A fixed two-week iteration is a planning choice, not a guarantee of value; the release still needs a coherent user task and a way to evaluate it.",
          "zh-CN": "为小范围试用写进入条件和结束条件，包括负责人、恢复办法与复盘日期。两周迭代只是安排工作的方式，不会自动带来价值；版本仍需要完整的用户任务及评估方法。",
          "zh-TW": "為小範圍試用寫進入條件和結束條件，包括負責人、恢復辦法與檢討日期。兩週迭代只是安排工作的方式，不會自動帶來價值；版本仍需要完整的使用者任務及評估方法。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Preserve a complete user task.",
          "zh-CN": "先回到案例里的证据。保留一条完整的用户流程。",
          "zh-TW": "先回到案例裡的證據。保留一條完整的使用者流程。"
        },
        "workshop": {
          "title": {
            "en": "Set the first-release boundary",
            "zh-CN": "划定首版范围",
            "zh-TW": "劃定首版範圍"
          },
          "brief": {
            "en": "You have two developers for two weeks. Search, listing updates, payment and recommendations are requested.",
            "zh-CN": "两名开发者，两周时间。当前有人提出搜索、更新帖子、支付和推荐四项需求。",
            "zh-TW": "兩名開發者，兩週時間。當前有人提出搜尋、更新貼文、支付和推薦四項需求。"
          },
          "questions": [
            {
              "en": "Describe the complete task a pilot user should be able to finish.",
              "zh-CN": "试用者应该能完整完成什么任务？",
              "zh-TW": "試用者應該能完整完成什麼任務？"
            },
            {
              "en": "Choose what to defer and give a reason for each item.",
              "zh-CN": "推迟哪些内容？分别说明理由。",
              "zh-TW": "推遲哪些內容？分別說明理由。"
            },
            {
              "en": "Name one release-blocking defect and one question to investigate during the pilot.",
              "zh-CN": "列出一个阻止上线的缺陷，以及一个留待试用观察的问题。",
              "zh-TW": "列出一個阻止上線的缺陷，以及一個留待試用觀察的問題。"
            }
          ],
          "sample": {
            "en": "A pilot buyer finds an available book, contacts its owner and sees the listing closed after the sale. Defer integrated payment because existing payment arrangements are adequate for this experiment; defer recommendations until search failures provide evidence of need. Unauthorized listing edits block release. Whether the subject filter is understandable can be investigated with pilot users. Record a review date for both deferred features.",
            "zh-CN": "试用买家可以找到仍在出售的书、联系发布者，并在成交后看到帖子关闭。暂缓站内支付，因为现有方式已能完成这次试验；暂缓推荐，等搜索失败的记录说明是否确有需要。越权修改帖子属于上线阻断问题。学科筛选是否易懂，可以在试用中观察。为推迟的两项功能约定重新讨论的时间。",
            "zh-TW": "試用買家可以找到仍在出售的書、聯絡釋出者，並在成交後看到貼文關閉。暫緩站內支付，因為現有方式已能完成這次試驗；暫緩推薦，等搜尋失敗的記錄說明是否確有需要。越權修改貼文屬於上線阻斷問題。學科篩選是否易懂，可以在試用中觀察。為推遲的兩項功能約定重新討論的時間。"
          },
          "rubric": [
            {
              "en": "Preserve a complete user task.",
              "zh-CN": "保留一条完整的用户流程。",
              "zh-TW": "保留一條完整的使用者流程。"
            },
            {
              "en": "Distinguish a defect from an assumption that needs feedback.",
              "zh-CN": "区分必须修复的缺陷与需要用户反馈的假设。",
              "zh-TW": "區分必須修復的缺陷與需要使用者回饋的假設。"
            }
          ]
        },
        "type": "read",
        "minutes": 9
      },
      {
        "id": "d4",
        "title": {
          "en": "Review a pilot without moving the goalposts",
          "zh-CN": "怎样复盘一次试用",
          "zh-TW": "怎樣檢討一次試用"
        },
        "body": {
          "en": "## The pilot notes\nEight students tried the book service. Six found a relevant listing. Four contacted a seller; two of those listings were already sold. One seller could not find the status control. No money changed hands through the website.\n\nThe team reports “75% success” because six of eight found a listing. That is a result for one step, not for the whole task. The notes do not establish how many exchanges were completed. Be precise about what was observed and what remains unknown.\n\n## Decide what to do next\nA reasonable next change is to make availability easier to maintain and then repeat the same task with new users. Adding a recommendation feed would not directly address the failure reported here.\n\nKeep the original success criterion beside the results. If you change it after seeing the data, record why. A useful review contains the observation, its limits, a proposed change and the next check. It need not turn a small pilot into a grand claim about impact.",
          "zh-CN": "## 试用记录\n八名学生试用了二手书服务，六人找到相关帖子，四人联系了卖家；其中两条帖子里的书早已卖出。一位卖家找不到修改出售状态的入口。网站没有经手任何付款。\n\n团队因为“八人中有六人找到帖子”而报告“成功率 75%”。这个数字只描述了其中一步，不能代表整项购买任务成功。现有记录也无法说明到底完成了多少次交易。报告时要分清实际观察与仍然未知的部分。\n\n## 决定下一次改什么\n一个合理的后续动作是让卖家更容易维护出售状态，再让新用户尝试同样的任务。此时增加推荐信息流，并不能直接解决记录中出现的问题。\n\n把试用前的成功标准与结果放在一起。如果看到数据后修改了标准，要记录原因。复盘写清观察、局限、下一项改动及验证办法就够了，不必把一次小范围试用包装成显著成效。",
          "zh-TW": "## 試用記錄\n八名學生試用了二手書服務，六人找到相關貼文，四人聯絡了賣家；其中兩條貼文裡的書早已賣出。一位賣家找不到修改出售狀態的入口。網站沒有經手任何付款。\n\n團隊因為“八人中有六人找到貼文”而報告“成功率 75%”。這個數字只描述了其中一步，不能代表整項購買任務成功。現有記錄也無法說明到底完成了多少次交易。報告時要分清實際觀察與仍然未知的部分。\n\n## 決定下一次改什麼\n一個合理的後續動作是讓賣家更容易維護出售狀態，再讓新使用者嘗試同樣的任務。此時增加推薦資訊流，並不能直接解決記錄中出現的問題。\n\n把試用前的成功標準與結果放在一起。如果看到資料後修改了標準，要記錄原因。檢討寫清觀察、侷限、下一項改動及驗證辦法就夠了，不必把一次小範圍試用包裝成顯著成效。"
        },
        "advanced": {
          "en": "The sample is small and self-selected. Report counts alongside proportions, distinguish funnel stages, and avoid causal claims about the redesign without a comparison. Record missing outcomes explicitly rather than treating them as successes or failures.",
          "zh-CN": "样本很小，而且参与者并非随机抽取。比例旁边保留人数，区分各个流程阶段。没有比较依据时，不要声称某次改版造成了效果；缺失结果应记为未知，不要自动算成成功或失败。",
          "zh-TW": "樣本很小，而且參與者並非隨機抽取。比例旁邊保留人數，區分各個流程階段。沒有比較依據時，不要聲稱某次改版造成了效果；缺失結果應記為未知，不要自動算成成功或失敗。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Do not invent completed purchases.",
          "zh-CN": "先回到案例里的证据。不要编造已经完成的交易。",
          "zh-TW": "先回到案例裡的證據。不要編造已經完成的交易。"
        },
        "workshop": {
          "title": {
            "en": "Write the release review",
            "zh-CN": "写一份版本复盘",
            "zh-TW": "寫一份版本檢討"
          },
          "brief": {
            "en": "Use only the eight-person pilot notes.",
            "zh-CN": "只使用上面的八人试用记录。",
            "zh-TW": "只使用上面的八人試用記錄。"
          },
          "questions": [
            {
              "en": "What can you report with confidence? What remains unknown?",
              "zh-CN": "哪些结果可以报告？哪些仍然未知？",
              "zh-TW": "哪些結果可以報告？哪些仍然未知？"
            },
            {
              "en": "Choose one change and connect it to a specific observation.",
              "zh-CN": "选择一项改动，并指出对应哪条观察。",
              "zh-TW": "選擇一項改動，並指出對應哪條觀察。"
            },
            {
              "en": "Describe the next test using the same task.",
              "zh-CN": "围绕同一任务安排下一次验证。",
              "zh-TW": "圍繞同一任務安排下一次驗證。"
            }
          ],
          "sample": {
            "en": "Six of eight found a relevant listing and four contacted a seller. Two of those contacts were to sold books; completed exchanges are unknown. Improve the status update control and remind sellers to close sold listings. In the next pilot, observe the same search-to-contact task and record availability at the time of contact. This can reveal whether the stale-listing problem persists; it will not prove that the change caused every difference.",
            "zh-CN": "可报告六人找到相关帖子、四人联系卖家，其中两次联系的是已售书籍；完成交易数未知。改进出售状态入口，并提醒卖家关闭已售帖子。下一轮仍观察从搜索到联系的过程，记录联系当时是否真的有货。这样可以了解旧帖子问题是否仍存在，但不能据此解释所有变化的原因。",
            "zh-TW": "可報告六人找到相關貼文、四人聯絡賣家，其中兩次聯絡的是已售書籍；完成交易數未知。改進出售狀態入口，並提醒賣家關閉已售貼文。下一輪仍觀察從搜尋到聯絡的過程，記錄聯絡當時是否真的有貨。這樣可以瞭解舊貼文問題是否仍存在，但不能據此解釋所有變化的原因。"
          },
          "rubric": [
            {
              "en": "Do not invent completed purchases.",
              "zh-CN": "不要编造已经完成的交易。",
              "zh-TW": "不要編造已經完成的交易。"
            },
            {
              "en": "Tie the next change to evidence rather than a new feature wish.",
              "zh-CN": "下一项改动要对应证据，而不是临时追加功能愿望。",
              "zh-TW": "下一項改動要對應證據，而不是臨時追加功能願望。"
            }
          ]
        },
        "type": "read",
        "minutes": 7
      }
    ]
  },
  {
    "id": "requirements",
    "title": {
      "en": "Requirements and stakeholder interviews",
      "zh-CN": "需求分析与用户访谈",
      "zh-TW": "需求分析與使用者訪談"
    },
    "description": {
      "en": "Work from conflicting accounts of a room-booking service to an implementable set of rules.",
      "zh-CN": "从活动室预约中的不同诉求出发，整理出可实现、可验收的规则。",
      "zh-TW": "從活動室預約中的不同訴求出發，整理出可實現、可驗收的規則。"
    },
    "outcomes": {
      "en": "Ask evidence-seeking questions; resolve conflicting needs; write acceptance criteria for normal and exceptional cases.",
      "zh-CN": "提出能获得证据的问题，处理冲突诉求，为正常和异常情况编写验收条件。",
      "zh-TW": "提出能獲得證據的問題，處理衝突訴求，為正常和異常情況編寫驗收條件。"
    },
    "deliverable": {
      "en": "A room-booking brief with three acceptance scenarios and an open-questions log.",
      "zh-CN": "一份活动室预约说明，含三条验收场景和待确认问题。",
      "zh-TW": "一份活動室預約說明，含三條驗收場景和待確認問題。"
    },
    "prerequisite": {
      "en": "Start here if you can describe a user task. No coding is needed.",
      "zh-CN": "能够描述用户任务即可，不需要编程。",
      "zh-TW": "能夠描述使用者任務即可，不需要程式設計。"
    },
    "topic": "foundations",
    "theme": "mint",
    "duration": 38,
    "status": "published",
    "source": "built-in",
    "curriculumVersion": 2,
    "lessons": [
      {
        "id": "r1",
        "title": {
          "en": "Separate requests, needs and assumptions",
          "zh-CN": "把请求、需要和假设分开",
          "zh-TW": "把請求、需要和假設分開"
        },
        "body": {
          "en": "## The request\n“Let students book activity rooms on their phones. It should be quick and fair.” The facilities office has six rooms and currently accepts requests by email. A student has suggested automatic approval.\n\nThere are three different things here: an observed process, a desired quality and a proposed solution. We know requests arrive by email. We do not yet know what “fair” means, how room access is controlled, or whether automatic approval is acceptable.\n\n## A working requirements log\nUse separate columns for evidence, proposed rule and unresolved question. For example: evidence — staff manually check room capacity; proposed rule — a request includes expected attendance; open question — may attendance exceed the fire limit? The final question has an obvious safety concern, but you still need the actual capacity rule from the responsible office.\n\nDo not turn “students prefer convenience” into “all requests must be instantly approved.” A need can be met by several designs. Keeping the distinction visible makes later negotiation easier.",
          "zh-CN": "## 收到的请求\n“让学生用手机预约活动室，要快一点、公平一点。”设施管理处有六间活动室，目前通过邮件受理。一位同学建议改为自动批准。\n\n这里混合了已知流程、期望的质量和建议的方案。我们知道现在使用邮件，但还不知道“公平”具体指什么、活动室如何开门，以及自动批准是否被允许。\n\n## 先建一张需求记录表\n把“证据”“建议规则”“待确认问题”分列。例如：证据——工作人员现在会核对场地容量；建议规则——申请时填写预计人数；待确认——允许的最大人数以什么正式记录为准？不要自行编造容量，也不要把未经核实的数字当作正式规则。\n\n“学生希望方便”不能直接推导出“所有申请必须立即批准”。同一种需要可以有多种解决办法。先保留这层区别，之后讨论取舍时才不会把方案当成不可更改的要求。",
          "zh-TW": "## 收到的請求\n“讓學生用手機預約活動室，要快一點、公平一點。”設施管理處有六間活動室，目前透過郵件受理。一位同學建議改為自動批准。\n\n這裡混合了已知流程、期望的質量和建議的方案。我們知道現在使用郵件，但還不知道“公平”具體指什麼、活動室如何開門，以及自動批准是否被允許。\n\n## 先建一張需求記錄表\n把“證據”“建議規則”“待確認問題”分列。例如：證據——工作人員現在會核對場地容量；建議規則——申請時填寫預計人數；待確認——允許的最大人數以什麼正式記錄為準？不要自行編造容量，也不要把未經核實的數字當作正式規則。\n\n“學生希望方便”不能直接推匯出“所有申請必須立即批准”。同一種需要可以有多種解決辦法。先保留這層區別，之後討論取捨時才不會把方案當成不可更改的要求。"
        },
        "advanced": {
          "en": "Add an owner, source date and validation method to each requirement. Separate functional behaviour from quality constraints. A response-time requirement needs a workload and measurement boundary; “quick” alone is not testable.",
          "zh-CN": "为需求补充负责人、来源日期及确认方式，区分功能行为与质量约束。响应时间要求需要明确负载和测量范围，单写“快”不能被测试。",
          "zh-TW": "為需求補充負責人、來源日期及確認方式，區分功能行為與質量約束。響應時間要求需要明確負載和測量範圍，單寫“快”不能被測試。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Label assumptions explicitly.",
          "zh-CN": "先回到案例里的证据。明确标出假设。",
          "zh-TW": "先回到案例裡的證據。明確標出假設。"
        },
        "workshop": {
          "title": {
            "en": "Start the requirements log",
            "zh-CN": "建立需求记录",
            "zh-TW": "建立需求記錄"
          },
          "brief": {
            "en": "Do not assume automatic approval has been agreed.",
            "zh-CN": "不要假设自动批准已经获得同意。",
            "zh-TW": "不要假設自動批准已經獲得同意。"
          },
          "questions": [
            {
              "en": "Write one fact, one proposed solution and one unresolved question.",
              "zh-CN": "分别写一条事实、建议方案和待确认问题。",
              "zh-TW": "分別寫一條事實、建議方案和待確認問題。"
            },
            {
              "en": "Rewrite “quick and fair” as questions for the office.",
              "zh-CN": "把“快捷公平”改写成要向管理处确认的问题。",
              "zh-TW": "把“快捷公平”改寫成要向管理處確認的問題。"
            },
            {
              "en": "Who must confirm the room capacity and approval policy?",
              "zh-CN": "场地容量和审批规则应由谁确认？",
              "zh-TW": "場地容量和審批規則應由誰確認？"
            }
          ],
          "sample": {
            "en": "Fact: requests are currently emailed to the facilities office. Proposal: automatic approval. Open question: which requests require staff review? Ask how long a normal response takes now, what delay is acceptable, and how competing requests should be prioritized. Confirm capacity and approval authority with the facilities office; consult students about the consequences of the existing process.",
            "zh-CN": "事实：目前通过邮件提交预约。方案：自动批准。待确认：哪些预约必须由工作人员审核？继续问正常回复目前要多久、可接受的等待多久、冲突申请如何排序。容量和审批权限由设施管理处确认；学生的经历用于了解现有流程造成的影响。",
            "zh-TW": "事實：目前透過郵件提交預約。方案：自動批准。待確認：哪些預約必須由工作人員稽核？繼續問正常回複目前要多久、可接受的等待多久、衝突申請如何排序。容量和審批許可權由設施管理處確認；學生的經歷用於瞭解現有流程造成的影響。"
          },
          "rubric": [
            {
              "en": "Label assumptions explicitly.",
              "zh-CN": "明确标出假设。",
              "zh-TW": "明確標出假設。"
            },
            {
              "en": "Send each question to someone able to answer it.",
              "zh-CN": "每个问题都要找到能够确认的人。",
              "zh-TW": "每個問題都要找到能夠確認的人。"
            }
          ]
        },
        "type": "read",
        "minutes": 7
      },
      {
        "id": "r2",
        "title": {
          "en": "Interview people who disagree",
          "zh-CN": "访谈意见不同的人",
          "zh-TW": "訪談意見不同的人"
        },
        "body": {
          "en": "## Three accounts of the same service\nThe facilities officer wants time to inspect a room between bookings. A society organizer wants recurring weekly slots. A student who is not in a society says recurring bookings leave no rooms for anyone else. None of these accounts is automatically the complete requirement.\n\n## Ask about an actual occasion\nWith the officer, ask what happened after the last back-to-back booking. With the organizer, ask how many weekly sessions were actually attended. With the student, ask which room and times they tried. Avoid the leading question “Would a waiting list solve this?” until you understand the problem it would address.\n\nRecord who said each thing and whether it describes an observed event, a policy or a preference. Two people can disagree about a policy that neither has authority to set. Your job is to surface the conflict and identify who can resolve it.\n\nThe interview extracts below are fictional. Use them as practice material, then write the follow-up you would ask in a real interview.",
          "zh-CN": "## 同一服务，三种说法\n管理人员希望两次预约之间留出检查时间；社团负责人希望固定每周的活动时段；一位非社团学生认为长期预约把房间全占完了。任何一方的说法都不能自动当作完整需求。\n\n## 从一次具体经历问起\n向管理人员询问最近一次连续预约发生了什么；向社团负责人询问最近几周实际使用了多少次；向普通学生询问具体尝试过哪间房、哪个时段。还没理解原因时，别急着问“候补名单能不能解决”。\n\n记录是谁说的，以及它属于实际经历、正式政策还是个人偏好。两人可能争论某项规则，但两人都没有制定规则的权限。分析者要把冲突呈现出来，并找到能确认规则的人。\n\n下面的访谈摘录是虚构练习材料。先阅读，再写下真实访谈中还需要追问的问题。",
          "zh-TW": "## 同一服務，三種說法\n管理人員希望兩次預約之間留出檢查時間；社團負責人希望固定每週的活動時段；一位非社團學生認為長期預約把房間全佔完了。任何一方的說法都不能自動當作完整需求。\n\n## 從一次具體經歷問起\n向管理人員詢問最近一次連續預約發生了什麼；向社團負責人詢問最近幾周實際使用了多少次；向普通學生詢問具體嘗試過哪間房、哪個時段。還沒理解原因時，別急著問“候補名單能不能解決”。\n\n記錄是誰說的，以及它屬於實際經歷、正式政策還是個人偏好。兩人可能爭論某項規則，但兩人都沒有制定規則的許可權。分析者要把衝突呈現出來，並找到能確認規則的人。\n\n下面的訪談摘錄是虛構練習材料。先閱讀，再寫下真實訪談中還需要追問的問題。"
        },
        "advanced": {
          "en": "Compare leading, hypothetical and incident-based questions. In your synthesis, preserve conflicting evidence rather than counting votes. A policy decision needs a named decision-maker and an agreed record, not a majority of interview snippets.",
          "zh-CN": "比较诱导性问题、假设性问题和基于实际事件的问题。整理访谈时保留冲突证据，不要只数赞成票。政策决定需要明确的负责人及记录，不能用几段访谈的多数意见替代。",
          "zh-TW": "比較誘導性問題、假設性問題和基於實際事件的問題。整理訪談時保留衝突證據，不要只數贊成票。政策決定需要明確的負責人及記錄，不能用幾段訪談的多數意見替代。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Use evidence from more than one person.",
          "zh-CN": "先回到案例里的证据。使用不止一方的证据。",
          "zh-TW": "先回到案例裡的證據。使用不止一方的證據。"
        },
        "workshop": {
          "title": {
            "en": "Prepare a follow-up interview",
            "zh-CN": "准备追问",
            "zh-TW": "準備追問"
          },
          "brief": {
            "en": "Read the three case-file extracts. No live AI is needed to read them.",
            "zh-CN": "阅读三方访谈摘录；这些材料无需连接 AI。",
            "zh-TW": "閱讀三方訪談摘錄；這些材料無需連線 AI。"
          },
          "questions": [
            {
              "en": "Which two goals conflict? Quote the relevant evidence in your own words.",
              "zh-CN": "哪两个目标发生冲突？用自己的话指出对应证据。",
              "zh-TW": "哪兩個目標發生衝突？用自己的話指出對應證據。"
            },
            {
              "en": "Write one non-leading follow-up for each person.",
              "zh-CN": "为每个人写一个不预设答案的追问。",
              "zh-TW": "為每個人寫一個不預設答案的追問。"
            },
            {
              "en": "Which policy still needs confirmation, and who should decide?",
              "zh-CN": "还缺什么政策确认？应由谁决定？",
              "zh-TW": "還缺什麼政策確認？應由誰決定？"
            }
          ],
          "sample": {
            "en": "Recurring slots help organizers plan but can limit access for one-off users. Ask the officer what inspection found after the last incident, the organizer how unused sessions were released, and the student which searches failed. Confirm recurring-booking limits and inspection gaps with the office responsible for room policy. A possible compromise is a limited advance window and automatic release of cancelled sessions, but it still needs agreement.",
            "zh-CN": "固定时段便于社团安排，却可能限制临时使用者。向管理员追问最近一次检查发现了什么；向社团询问不用的时段如何释放；向学生询问哪些查询没有成功。长期预约上限和检查间隔应由负责场地政策的管理处确认。限制可提前预约的时间并及时释放取消时段是候选办法，但仍需协商确认。",
            "zh-TW": "固定時段便於社團安排，卻可能限制臨時使用者。向管理員追問最近一次檢查發現了什麼；向社團詢問不用的時段如何釋放；向學生詢問哪些查詢沒有成功。長期預約上限和檢查間隔應由負責場地政策的管理處確認。限制可提前預約的時間並及時釋放取消時段是候選辦法，但仍需協商確認。"
          },
          "rubric": [
            {
              "en": "Use evidence from more than one person.",
              "zh-CN": "使用不止一方的证据。",
              "zh-TW": "使用不止一方的證據。"
            },
            {
              "en": "Ask about behaviour before proposing a feature.",
              "zh-CN": "先问实际行为，再提功能方案。",
              "zh-TW": "先問實際行為，再提功能方案。"
            }
          ]
        },
        "type": "conversation",
        "minutes": 12,
        "interview": [
          {
            "person": {
              "en": "Facilities officer",
              "zh-CN": "设施管理员",
              "zh-TW": "設施管理員"
            },
            "question": {
              "en": "What happened after the last consecutive bookings?",
              "zh-CN": "最近一次连续预约发生了什么？",
              "zh-TW": "最近一次連續預約發生了什麼？"
            },
            "answer": {
              "en": "The first group left cables across the floor. We need 15 minutes for a check before the next group enters. That interval is our proposed rule; the manager must approve it.",
              "zh-CN": "上一组把线缆留在地上。我们建议下一组入场前预留 15 分钟检查，但这项规则还需要主管批准。",
              "zh-TW": "上一組把線纜留在地上。我們建議下一組入場前預留 15 分鐘檢查，但這項規則還需要主管批准。"
            }
          },
          {
            "person": {
              "en": "Society organizer",
              "zh-CN": "社团负责人",
              "zh-TW": "社團負責人"
            },
            "question": {
              "en": "How do you use recurring reservations?",
              "zh-CN": "你们怎样使用固定预约？",
              "zh-TW": "你們怎樣使用固定預約？"
            },
            "answer": {
              "en": "We meet on Thursdays, but cancelled two sessions last month. We emailed the office; I do not know when those rooms became available again.",
              "zh-CN": "我们周四活动，上个月取消过两次，只给管理处发了邮件，不知道房间什么时候重新开放。",
              "zh-TW": "我們週四活動，上個月取消過兩次，只給管理處發了郵件，不知道房間什麼時候重新開放。"
            }
          },
          {
            "person": {
              "en": "Student",
              "zh-CN": "普通学生",
              "zh-TW": "普通學生"
            },
            "question": {
              "en": "Describe the last time you could not book.",
              "zh-CN": "说说上次没有约到房间的经历。",
              "zh-TW": "說說上次沒有約到房間的經歷。"
            },
            "answer": {
              "en": "I checked three Thursday evenings. The calendar said full, but I walked past an empty room once. I do not know whether the booking had been cancelled.",
              "zh-CN": "我查过三个周四晚上，日历都显示已满，但有一次路过发现房间空着。我不知道是不是已经取消。",
              "zh-TW": "我查過三個週四晚上，日曆都顯示已滿，但有一次路過發現房間空著。我不知道是不是已經取消。"
            }
          }
        ]
      },
      {
        "id": "r3",
        "title": {
          "en": "Write a rule someone else can test",
          "zh-CN": "把规则写到别人能够测试",
          "zh-TW": "把規則寫到別人能夠測試"
        },
        "body": {
          "en": "## Start with a small story\n“As a student, I want to cancel my reservation so another group can use the room.” This explains a need. It does not yet specify what cancellation does.\n\nFor this exercise, the office has agreed: only the booking owner can cancel; cancellation is allowed before the session starts; a cancelled slot becomes available immediately. These are case rules, not general university policy.\n\n## Describe the observable result\nGiven an upcoming booking owned by Alex, when Alex cancels it, then the booking is marked cancelled and the slot can be requested by another student. A different student attempting cancellation receives a rejection and the original booking stays active.\n\n## Look at boundaries\nWhat if the start time has just been reached? What if Alex clicks twice? An acceptance scenario should state the starting state, the action and the resulting state. “The cancellation works correctly” does not tell a tester what to do or observe. Keep implementation details out unless they are genuine constraints.",
          "zh-CN": "## 从一个小故事开始\n“作为学生，我希望取消自己的预约，让其他小组能使用房间。”这句话解释了需要，但还没有明确取消会造成什么结果。\n\n本练习假设管理处已经同意三条规则：只有预约者本人可以取消；开始时间之前允许取消；取消后时段立即重新开放。这些只是案例规则，不代表学校正式政策。\n\n## 描述可观察结果\n假设 Alex 拥有一条尚未开始的预约，当 Alex 取消时，预约变为已取消，其他学生可以申请同一时段。如果另一个学生尝试取消，应拒绝请求，原预约仍然有效。\n\n## 再看边界\n如果刚好到开始时间怎么办？Alex 连点两次怎么办？一条验收场景应说明初始状态、动作和最终结果。“取消功能正常”没有告诉测试者具体做什么、看什么。除非属于真正的约束，否则不要过早指定内部实现方法。",
          "zh-TW": "## 從一個小故事開始\n“作為學生，我希望取消自己的預約，讓其他小組能使用房間。”這句話解釋了需要，但還沒有明確取消會造成什麼結果。\n\n本練習假設管理處已經同意三條規則：只有預約者本人可以取消；開始時間之前允許取消；取消後時段立即重新開放。這些只是案例規則，不代表學校正式政策。\n\n## 描述可觀察結果\n假設 Alex 擁有一條尚未開始的預約，當 Alex 取消時，預約變為已取消，其他學生可以申請同一時段。如果另一個學生嘗試取消，應拒絕請求，原預約仍然有效。\n\n## 再看邊界\n如果剛好到開始時間怎麼辦？Alex 連點兩次怎麼辦？一條驗收場景應說明初始狀態、動作和最終結果。“取消功能正常”沒有告訴測試者具體做什麼、看什麼。除非屬於真正的約束，否則不要過早指定內部實現方法。"
        },
        "advanced": {
          "en": "Define the time boundary precisely: now < startTime is allowed; now >= startTime is rejected in this case. Use server time. Specify idempotent repeated cancellation so a retry does not release the slot twice or corrupt an audit trail. A unique booking identifier is safer than selecting by a display name.",
          "zh-CN": "把时间边界写清楚：本案例中 now < startTime 允许取消，now >= startTime 拒绝，使用服务端时间。重复取消需要保持结果一致，不能因为重试而重复释放时段或破坏记录。使用唯一预约编号，不能按显示名称定位预约。",
          "zh-TW": "把時間邊界寫清楚：本案例中 now < startTime 允許取消，now >= startTime 拒絕，使用服務端時間。重複取消需要保持結果一致，不能因為重試而重複釋放時段或破壞記錄。使用唯一預約編號，不能按顯示名稱定位預約。"
        },
        "hint": {
          "en": "Start with the evidence in the case. State the expected data change, not only a success message.",
          "zh-CN": "先回到案例里的证据。写出数据应怎样变化，不只写成功提示。",
          "zh-TW": "先回到案例裡的證據。寫出資料應怎樣變化，不只寫成功提示。"
        },
        "workshop": {
          "title": {
            "en": "Write three acceptance scenarios",
            "zh-CN": "编写三条验收场景",
            "zh-TW": "編寫三條驗收場景"
          },
          "brief": {
            "en": "Follow the agreed cancellation rules in the reading.",
            "zh-CN": "遵循讲解中已经约定的取消规则。",
            "zh-TW": "遵循講解中已經約定的取消規則。"
          },
          "questions": [
            {
              "en": "Describe cancellation by the owner before the start time.",
              "zh-CN": "描述本人在开始前取消。",
              "zh-TW": "描述本人在開始前取消。"
            },
            {
              "en": "Describe cancellation attempted by another student.",
              "zh-CN": "描述其他学生尝试取消。",
              "zh-TW": "描述其他學生嘗試取消。"
            },
            {
              "en": "Describe cancellation exactly at the start time.",
              "zh-CN": "描述刚好到开始时间时取消。",
              "zh-TW": "描述剛好到開始時間時取消。"
            }
          ],
          "sample": {
            "en": "1. Given Alex owns active booking B17 starting at 18:00, at 17:59 Alex cancels B17: it becomes cancelled and the slot is available. 2. Given Sam does not own B17, Sam’s cancellation is rejected and B17 is unchanged. 3. At 18:00 exactly, the cancellation is rejected because it is no longer before the start. A repeated successful cancellation must not create a second release.",
            "zh-CN": "1. Alex 拥有 18:00 开始的有效预约 B17，在 17:59 取消后，B17 变为已取消，时段重新开放。2. Sam 不是 B17 的预约者，取消请求被拒绝，B17 不变。3. 刚好 18:00 时已不属于开始之前，请求被拒绝。对已经成功取消的请求进行重试，不应再次释放名额。",
            "zh-TW": "1. Alex 擁有 18:00 開始的有效預約 B17，在 17:59 取消後，B17 變為已取消，時段重新開放。2. Sam 不是 B17 的預約者，取消請求被拒絕，B17 不變。3. 剛好 18:00 時已不屬於開始之前，請求被拒絕。對已經成功取消的請求進行重試，不應再次釋放名額。"
          },
          "rubric": [
            {
              "en": "State the expected data change, not only a success message.",
              "zh-CN": "写出数据应怎样变化，不只写成功提示。",
              "zh-TW": "寫出資料應怎樣變化，不只寫成功提示。"
            },
            {
              "en": "Include the exact boundary and an unauthorized actor.",
              "zh-CN": "包含准确的时间边界和无权操作的人。",
              "zh-TW": "包含準確的時間邊界和無權操作的人。"
            }
          ]
        },
        "type": "read",
        "minutes": 10,
        "check": {
          "question": {
            "en": "At 18:00 exactly, which behaviour follows the case rule?",
            "zh-CN": "刚好 18:00，什么行为符合案例规则？",
            "zh-TW": "剛好 18:00，什麼行為符合案例規則？"
          },
          "options": [
            {
              "text": {
                "en": "Allow cancellation because it is the same minute.",
                "zh-CN": "允许取消，因为仍在同一分钟。",
                "zh-TW": "允許取消，因為仍在同一分鐘。"
              },
              "feedback": {
                "en": "That silently changes “before” into “at or before”. If the office wants a grace period, it must be agreed explicitly.",
                "zh-CN": "这把“之前”悄悄改成了“不晚于”。若需要宽限期，应明确协商。",
                "zh-TW": "這把“之前”悄悄改成了“不晚於”。若需要寬限期，應明確協商。"
              }
            },
            {
              "text": {
                "en": "Reject cancellation and leave the booking active.",
                "zh-CN": "拒绝取消，预约保持有效。",
                "zh-TW": "拒絕取消，預約保持有效。"
              },
              "feedback": {
                "en": "Correct for this stated rule: the start time is an exclusive boundary. Other policies are possible, but this is the agreed behaviour to test.",
                "zh-CN": "符合已约定的规则：开始时刻不包含在允许范围内。可以采用其他政策，但需要先修改约定。",
                "zh-TW": "符合已約定的規則：開始時刻不包含在允許範圍內。可以採用其他政策，但需要先修改約定。"
              }
            },
            {
              "text": {
                "en": "Let the browser decide using its local clock.",
                "zh-CN": "让浏览器根据本机时间决定。",
                "zh-TW": "讓瀏覽器根據本機時間決定。"
              },
              "feedback": {
                "en": "Different client clocks can disagree and can be changed. The authoritative check belongs on the server.",
                "zh-CN": "客户端时钟可能不同，也可以修改，最终检查应在服务端。",
                "zh-TW": "客戶端時鐘可能不同，也可以修改，最終檢查應在服務端。"
              }
            }
          ],
          "correct": 1
        }
      },
      {
        "id": "r4",
        "title": {
          "en": "Review the brief before handing it over",
          "zh-CN": "交付前检查需求说明",
          "zh-TW": "交付前檢查需求說明"
        },
        "body": {
          "en": "## A developer finds a gap\nYour brief says students cannot make overlapping bookings. A developer asks whether this includes bookings in different rooms. Another asks what should happen when two students request the same free slot at the same time. These are useful questions, not signs that the developer failed to read.\n\n## A small review checklist\nCheck the actor, action, preconditions, result and exception for each important rule. Then trace the rule back to a source. If the office has not decided a conflict, write “unresolved” with an owner and review date. Filling the gap with an invented rule makes the brief look finished while leaving the disagreement hidden.\n\nAn implementable brief does not describe every possible screen. It explains enough behaviour for someone to build and verify the next agreed scope. Sketches help reveal missing steps; acceptance examples help reveal missing rules.\n\nFor the handover, include the agreed rules, three scenarios, deferred features and the questions still awaiting a decision.",
          "zh-CN": "## 开发者发现了空缺\n需求说明写着“学生不能重复预约”。开发者追问：不同房间的同一时段也算重复吗？另一个问题是：两个人同时申请最后一个可用时段，应如何处理？这些都是有效问题，不能归结为开发者没认真读。\n\n## 用一张小清单复核\n逐条检查谁操作、做什么、前提是什么、结果是什么、异常怎么办，再追溯规则的来源。如果管理处还没解决某个冲突，就写“待确认”，同时注明负责人和复查时间。自行补一条规则，只会让文档表面完整，却把分歧藏起来。\n\n可实施的需求说明不必提前描述所有页面，但应足够支持下一阶段已同意的范围。草图能帮助发现漏掉的步骤，验收例子能帮助发现漏掉的规则。\n\n交付时整理已经确认的规则、三条验收场景、暂缓功能和仍待决定的问题。",
          "zh-TW": "## 開發者發現了空缺\n需求說明寫著“學生不能重複預約”。開發者追問：不同房間的同一時段也算重複嗎？另一個問題是：兩個人同時申請最後一個可用時段，應如何處理？這些都是有效問題，不能歸結為開發者沒認真讀。\n\n## 用一張小清單複核\n逐條檢查誰操作、做什麼、前提是什麼、結果是什麼、異常怎麼辦，再追溯規則的來源。如果管理處還沒解決某個衝突，就寫“待確認”，同時註明負責人和複查時間。自行補一條規則，只會讓文件表面完整，卻把分歧藏起來。\n\n可實施的需求說明不必提前描述所有頁面，但應足夠支援下一階段已同意的範圍。草圖能幫助發現漏掉的步驟，驗收例子能幫助發現漏掉的規則。\n\n交付時整理已經確認的規則、三條驗收場景、暫緩功能和仍待決定的問題。"
        },
        "advanced": {
          "en": "Add a trace from stakeholder evidence to requirement to acceptance check. For concurrent requests, describe the externally visible guarantee first; leave locking or transaction choices to design unless imposed by an integration constraint.",
          "zh-CN": "建立“访谈证据—需求规则—验收检查”的对应关系。并发申请先写外部可见的保证，不必在需求中提前指定锁或事务方案，除非已有集成约束。",
          "zh-TW": "建立“訪談證據—需求規則—驗收檢查”的對應關係。併發申請先寫外部可見的保證，不必在需求中提前指定鎖或事務方案，除非已有整合約束。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Keep unresolved policy separate from agreed behaviour.",
          "zh-CN": "先回到案例里的证据。将未决政策与已确认行为分开。",
          "zh-TW": "先回到案例裡的證據。將未決政策與已確認行為分開。"
        },
        "workshop": {
          "title": {
            "en": "Submit the booking brief",
            "zh-CN": "整理预约需求说明",
            "zh-TW": "整理預約需求說明"
          },
          "brief": {
            "en": "Use the work from the previous lessons.",
            "zh-CN": "整合前面几节的练习。",
            "zh-TW": "整合前面幾節的練習。"
          },
          "questions": [
            {
              "en": "List three agreed rules and their evidence or authority.",
              "zh-CN": "列出三条已确认规则及依据或确认者。",
              "zh-TW": "列出三條已確認規則及依據或確認者。"
            },
            {
              "en": "Add one concurrency scenario and one question that still needs a decision.",
              "zh-CN": "补一条并发场景，以及一个仍待决定的问题。",
              "zh-TW": "補一條併發場景，以及一個仍待決定的問題。"
            },
            {
              "en": "State what is outside the first release.",
              "zh-CN": "说明哪些内容不在首版范围内。",
              "zh-TW": "說明哪些內容不在首版範圍內。"
            }
          ],
          "sample": {
            "en": "Agreed rules: only the owner cancels, only before the start, and a cancelled slot is released. Concurrent requests for one slot must not both become confirmed; the unsuccessful request receives an unavailable result. The office must still decide whether recurring bookings have a quota. Record its manager as the decision owner. Leave recurring-booking automation outside the first release until that rule is agreed.",
            "zh-CN": "已确认：本人才能取消、开始之前可取消、取消后释放时段。同一时段的并发申请不能都变为已确认，未成功的请求应收到时段不可用的结果。长期预约是否设上限仍待管理处主管确认；在规则确定前，自动长期预约不进入首版。",
            "zh-TW": "已確認：本人才能取消、開始之前可取消、取消後釋放時段。同一時段的併發申請不能都變為已確認，未成功的請求應收到時段不可用的結果。長期預約是否設上限仍待管理處主管確認；在規則確定前，自動長期預約不進入首版。"
          },
          "rubric": [
            {
              "en": "Keep unresolved policy separate from agreed behaviour.",
              "zh-CN": "将未决政策与已确认行为分开。",
              "zh-TW": "將未決政策與已確認行為分開。"
            },
            {
              "en": "Include a result for both competing requests.",
              "zh-CN": "并发场景中写清两个请求各自的结果。",
              "zh-TW": "併發場景中寫清兩個請求各自的結果。"
            }
          ]
        },
        "type": "read",
        "minutes": 9
      }
    ]
  },
  {
    "id": "architecture",
    "title": {
      "en": "Web architecture and data",
      "zh-CN": "网页系统、数据与权限",
      "zh-TW": "網頁系統、資料與許可權"
    },
    "description": {
      "en": "Trace a lost-property claim from a browser to stored data, then examine what happens when a request fails or comes from the wrong person.",
      "zh-CN": "跟踪失物认领请求怎样从浏览器到达数据库，再检查失败和越权时会发生什么。",
      "zh-TW": "跟蹤失物認領請求怎樣從瀏覽器到達資料庫，再檢查失敗和越權時會發生什麼。"
    },
    "outcomes": {
      "en": "Explain client and server responsibilities; model a claim; locate authorization and consistency checks.",
      "zh-CN": "说明客户端与服务端各自的职责，为认领记录建模，确定权限和一致性检查的位置。",
      "zh-TW": "說明客戶端與服務端各自的職責，為認領記錄建模，確定許可權和一致性檢查的位置。"
    },
    "deliverable": {
      "en": "A request-flow diagram and a short data-and-permissions specification.",
      "zh-CN": "一张请求流程图和一份数据、权限说明。",
      "zh-TW": "一張請求流程圖和一份資料、許可權說明。"
    },
    "prerequisite": {
      "en": "Requirements and stakeholder interviews, or equivalent experience.",
      "zh-CN": "建议先学需求分析，或具备相应经验。",
      "zh-TW": "建議先學需求分析，或具備相應經驗。"
    },
    "topic": "foundations",
    "theme": "mint",
    "duration": 36,
    "status": "published",
    "source": "built-in",
    "curriculumVersion": 2,
    "lessons": [
      {
        "id": "s1",
        "title": {
          "en": "Trace one request",
          "zh-CN": "跟踪一次请求",
          "zh-TW": "跟蹤一次請求"
        },
        "body": {
          "en": "## The claim button\nA student opens a lost-property listing and clicks “Claim”. The button is part of the browser interface. It can collect an explanation, but it cannot safely decide that the student now owns the item.\n\nThe browser sends a request identifying the listing and the proposed claim. The server checks the signed-in user, validates the data and consults stored state. If the request is accepted, it stores a claim and sends a response. The browser then displays the result.\n\n## Why the boundary matters\nChanging a button label to “Approved” does not approve anything on the server. Likewise, hiding a button from some users does not prevent them from making the underlying request. The browser is under the user’s control. The server must check permissions even when the interface already checked them.\n\nIn this case, a claim is a request for review, not a transfer of ownership. Keep that distinction in the response: “Claim submitted” is more accurate than “Item is yours”.",
          "zh-CN": "## 点击认领以后\n学生打开失物信息，点击“认领”。按钮属于浏览器界面，可以收集说明，但不能安全地决定物品已经属于这个学生。\n\n浏览器发送物品编号和认领说明。服务端检查登录者身份、校验内容，再读取已经保存的状态。受理后保存认领记录并返回响应，浏览器最后显示结果。\n\n## 边界为什么重要\n把按钮文字改成“已批准”，不代表服务端真的批准了。把按钮对某些人隐藏，也不能阻止他们直接发送请求。浏览器处在用户控制之下，即使界面检查过权限，服务端仍要再检查。\n\n在这个案例里，“认领”只是提交审核申请，不是转移物品所有权。因此响应应该是“申请已提交”，而不是“物品归你了”。措辞也属于系统行为的一部分。",
          "zh-TW": "## 點選認領以後\n學生開啟失物資訊，點選“認領”。按鈕屬於瀏覽器介面，可以收集說明，但不能安全地決定物品已經屬於這個學生。\n\n瀏覽器傳送物品編號和認領說明。服務端檢查登入者身份、校驗內容，再讀取已經儲存的狀態。受理後儲存認領記錄並返回響應，瀏覽器最後顯示結果。\n\n## 邊界為什麼重要\n把按鈕文字改成“已批准”，不代表服務端真的批准了。把按鈕對某些人隱藏，也不能阻止他們直接傳送請求。瀏覽器處在使用者控制之下，即使介面檢查過許可權，服務端仍要再檢查。\n\n在這個案例裡，“認領”只是提交稽核申請，不是轉移物品所有權。因此響應應該是“申請已提交”，而不是“物品歸你了”。措辭也屬於系統行為的一部分。"
        },
        "advanced": {
          "en": "Describe a request contract, for example listingId and explanation in, claimId and status out. Do not accept claimantId as authoritative client input. Identify validation, authorization, persistence and response as distinct responsibilities, even if one server function performs all four.",
          "zh-CN": "描述请求约定，例如输入 listingId 和 explanation，输出 claimId 和 status。不能直接信任客户端提交的 claimantId。区分校验、授权、持久保存和返回响应几类职责，即使它们由同一个服务端函数完成。",
          "zh-TW": "描述請求約定，例如輸入 listingId 和 explanation，輸出 claimId 和 status。不能直接信任客戶端提交的 claimantId。區分校驗、授權、持久儲存和返回響應幾類職責，即使它們由同一個服務端函式完成。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Include the return journey, not only the outgoing request.",
          "zh-CN": "先回到案例里的证据。既画请求，也画结果返回的路径。",
          "zh-TW": "先回到案例裡的證據。既畫請求，也畫結果返回的路徑。"
        },
        "workshop": {
          "title": {
            "en": "Draw the request path",
            "zh-CN": "画出请求路径",
            "zh-TW": "畫出請求路徑"
          },
          "brief": {
            "en": "A user submits a claim and sees a confirmation.",
            "zh-CN": "用户提交认领申请，然后看到确认信息。",
            "zh-TW": "使用者提交認領申請，然後看到確認資訊。"
          },
          "questions": [
            {
              "en": "List the steps from click to confirmation in order.",
              "zh-CN": "按顺序列出从点击到确认的步骤。",
              "zh-TW": "按順序列出從點選到確認的步驟。"
            },
            {
              "en": "Where should identity and permission be checked? Why?",
              "zh-CN": "在哪里检查身份和权限？为什么？",
              "zh-TW": "在哪裡檢查身份和許可權？為什麼？"
            },
            {
              "en": "What should the user see if saving fails?",
              "zh-CN": "保存失败时，用户应该看到什么？",
              "zh-TW": "儲存失敗時，使用者應該看到什麼？"
            }
          ],
          "sample": {
            "en": "Browser collects the explanation → server authenticates the caller and validates the listing → storage saves a pending claim → server returns its ID → browser confirms submission. Permission is enforced on the server because a user can bypass interface controls. If persistence fails, report that submission did not complete and offer a retry; do not show a confirmed claim without evidence it was saved.",
            "zh-CN": "浏览器收集说明→服务端验证请求者及物品→保存待审核的认领记录→服务端返回编号→浏览器确认提交。权限在服务端执行，因为用户可以绕过界面控件。如果保存失败，应说明提交没有完成并允许重试，不能在没有保存依据时显示已确认。",
            "zh-TW": "瀏覽器收集說明→服務端驗證請求者及物品→儲存待稽核的認領記錄→服務端返回編號→瀏覽器確認提交。許可權在服務端執行，因為使用者可以繞過介面控制元件。如果儲存失敗，應說明提交沒有完成並允許重試，不能在沒有儲存依據時顯示已確認。"
          },
          "rubric": [
            {
              "en": "Include the return journey, not only the outgoing request.",
              "zh-CN": "既画请求，也画结果返回的路径。",
              "zh-TW": "既畫請求，也畫結果返回的路徑。"
            },
            {
              "en": "Do not give the browser final authorization authority.",
              "zh-CN": "不要让浏览器承担最终授权。",
              "zh-TW": "不要讓瀏覽器承擔最終授權。"
            }
          ]
        },
        "type": "slides",
        "minutes": 8,
        "slides": [
          {
            "en": "Browser: collect the item ID and the explanation. The claim is not approved here.",
            "zh-CN": "浏览器：收集物品编号和说明，此时没有批准认领。",
            "zh-TW": "瀏覽器：收集物品編號和說明，此時沒有批准認領。"
          },
          {
            "en": "Server: verify the caller, validate the item and apply permissions.",
            "zh-CN": "服务端：验证请求者，校验物品，执行权限规则。",
            "zh-TW": "服務端：驗證請求者，校驗物品，執行許可權規則。"
          },
          {
            "en": "Database: store a pending claim and return its identifier.",
            "zh-CN": "数据库：保存待审核记录，并返回记录编号。",
            "zh-TW": "資料庫：儲存待稽核記錄，並返回記錄編號。"
          },
          {
            "en": "Response: show the saved claim status, or explain that submission failed.",
            "zh-CN": "响应：显示已保存的申请状态，或说明提交失败。",
            "zh-TW": "響應：顯示已儲存的申請狀態，或說明提交失敗。"
          }
        ],
        "stepLabels": [
          {
            "en": "Browser",
            "zh-CN": "浏览器",
            "zh-TW": "瀏覽器"
          },
          {
            "en": "Server",
            "zh-CN": "服务端",
            "zh-TW": "服務端"
          },
          {
            "en": "Database",
            "zh-CN": "数据库",
            "zh-TW": "資料庫"
          },
          {
            "en": "Response",
            "zh-CN": "响应",
            "zh-TW": "響應"
          }
        ]
      },
      {
        "id": "s2",
        "title": {
          "en": "Store the facts you will need later",
          "zh-CN": "保存后续真正需要的事实",
          "zh-TW": "儲存後續真正需要的事實"
        },
        "body": {
          "en": "## A spreadsheet becomes a data model\nAn early prototype puts an item title, claimant name and approval flag in one row. Two students called Alex submit claims. A title is corrected. Now the team cannot reliably tell which person or item a row describes.\n\nGive each item, user and claim a stable identifier. A claim refers to an item and a claimant. Names and titles are display information; they can change and need not be unique.\n\n## Model the states explicitly\nFor this exercise, claims can be pending, approved or rejected. An item can be open or returned. Approving a claim must not leave the same item available for another approval. Store enough information to explain the decision: which claim, who reviewed it, and when.\n\nYou do not need a separate database table for every noun in a paragraph. Start with the relationships and questions the service must answer. Then check whether the model can represent more than one claim without overwriting earlier evidence.",
          "zh-CN": "## 从一张表开始\n早期原型在一行里保存物品标题、认领人姓名和是否批准。两个都叫 Alex 的学生提交了申请，物品标题随后又被改过。现在团队无法可靠判断每行到底指向谁、哪件物品。\n\n给物品、用户和认领记录分别设置稳定编号。一条认领记录关联一件物品及一个申请人。姓名和标题用于显示，可能改变，也不一定唯一。\n\n## 明确状态\n本练习中，申请分为待审核、已批准和已拒绝；物品分为待认领和已归还。批准一条申请后，同一物品不能仍可被另一条申请批准。还要能说明审核依据：批准哪条申请、谁审核、什么时候审核。\n\n不必看到一个名词就建一张表。先列清系统要回答的问题和对象之间的关系，再检查模型能否保存多条申请，而不是后来的人覆盖前人的记录。",
          "zh-TW": "## 從一張表開始\n早期原型在一行裡儲存物品標題、認領人姓名和是否批准。兩個都叫 Alex 的學生提交了申請，物品標題隨後又被改過。現在團隊無法可靠判斷每行到底指向誰、哪件物品。\n\n給物品、使用者和認領記錄分別設定穩定編號。一條認領記錄關聯一件物品及一個申請人。姓名和標題用於顯示，可能改變，也不一定唯一。\n\n## 明確狀態\n本練習中，申請分為待稽核、已批准和已拒絕；物品分為待認領和已歸還。批准一條申請後，同一物品不能仍可被另一條申請批准。還要能說明稽核依據：批准哪條申請、誰稽核、什麼時候稽核。\n\n不必看到一個名詞就建一張表。先列清系統要回答的問題和物件之間的關係，再檢查模型能否儲存多條申請，而不是後來的人覆蓋前人的記錄。"
        },
        "advanced": {
          "en": "Propose foreign keys and an invariant: at most one approved claim for an item. Explain how an atomic update or transaction could enforce it under concurrency. Keep uploaded proof separate from public listing fields and retain it only under an agreed policy.",
          "zh-CN": "提出关联约束以及“每件物品最多一条批准申请”的不变量，说明原子操作或事务如何在并发时保持它。认领证据与公开信息分开保存，保留时间需要明确政策。",
          "zh-TW": "提出關聯約束以及“每件物品最多一條批准申請”的不變數，說明原子操作或事務如何在併發時保持它。認領證據與公開資訊分開儲存，保留時間需要明確政策。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Use stable IDs rather than titles or names as keys.",
          "zh-CN": "先回到案例里的证据。关联使用稳定编号，不以标题或姓名作主键。",
          "zh-TW": "先回到案例裡的證據。關聯使用穩定編號，不以標題或姓名作主鍵。"
        },
        "workshop": {
          "title": {
            "en": "Draft the data model",
            "zh-CN": "起草数据模型",
            "zh-TW": "起草資料模型"
          },
          "brief": {
            "en": "Two students with the same name claim the same umbrella.",
            "zh-CN": "两位同名学生申请认领同一把伞。",
            "zh-TW": "兩位同名學生申請認領同一把傘。"
          },
          "questions": [
            {
              "en": "List the identifiers and relationships you need.",
              "zh-CN": "需要哪些编号和关联？",
              "zh-TW": "需要哪些編號和關聯？"
            },
            {
              "en": "Which states belong to the claim and which belong to the item?",
              "zh-CN": "哪些状态属于申请，哪些属于物品？",
              "zh-TW": "哪些狀態屬於申請，哪些屬於物品？"
            },
            {
              "en": "Write one rule the database operations must preserve.",
              "zh-CN": "写一条数据操作必须保持的规则。",
              "zh-TW": "寫一條資料操作必須保持的規則。"
            }
          ],
          "sample": {
            "en": "Use userId, itemId and claimId. Each claim stores itemId and claimantUserId, with pending/approved/rejected status. The item stores open/returned status. Reviewer identity and review time belong to a review record or the reviewed claim. Preserve the invariant that only one claim can be approved for an item, including when two reviewers act concurrently. Display names may repeat.",
            "zh-CN": "使用 userId、itemId 和 claimId。申请保存 itemId、claimantUserId 和待审核／批准／拒绝状态；物品保存待认领／已归还状态。审核人和时间可以保存在申请或审核记录中。即使两个审核者同时操作，也要确保同一物品最多只有一条获批申请。姓名允许重复。",
            "zh-TW": "使用 userId、itemId 和 claimId。申請儲存 itemId、claimantUserId 和待稽核／批准／拒絕狀態；物品儲存待認領／已歸還狀態。稽核人和時間可以儲存在申請或稽核記錄中。即使兩個稽核者同時操作，也要確保同一物品最多隻有一條獲批申請。姓名允許重複。"
          },
          "rubric": [
            {
              "en": "Use stable IDs rather than titles or names as keys.",
              "zh-CN": "关联使用稳定编号，不以标题或姓名作主键。",
              "zh-TW": "關聯使用穩定編號，不以標題或姓名作主鍵。"
            },
            {
              "en": "Account for multiple simultaneous claims.",
              "zh-CN": "模型要容纳同时存在的多条申请。",
              "zh-TW": "模型要容納同時存在的多條申請。"
            }
          ]
        },
        "type": "read",
        "minutes": 9
      },
      {
        "id": "s3",
        "title": {
          "en": "Test access with another person’s account",
          "zh-CN": "用另一个人的身份检查访问",
          "zh-TW": "用另一個人的身份檢查訪問"
        },
        "body": {
          "en": "## A useful negative test\nAlex submitted claim C12. Sam signs in and changes a request URL from C13 to C12. If the server returns Alex’s private explanation, the application has exposed information even if no navigation link ever showed C12 to Sam.\n\nAuthentication answers who is making the request. Authorization answers whether that person may perform this action on this record. A signed-in user is not automatically allowed to read every claim.\n\nFor our case, students may read their own claims; designated staff may review all claims; the public listing shows an item description but not private proof. These are teaching-case rules. A real service must agree its rules with the people responsible.\n\nUse the access lab to vary the caller and the record owner. The result is a rule-based illustration. It does not log into a real account or inspect anyone’s data.",
          "zh-CN": "## 一个值得做的反向测试\nAlex 提交了申请 C12。Sam 登录后，把请求里的 C13 改成 C12。如果服务端直接返回 Alex 的私密认领说明，即使界面从未给 Sam 展示 C12 的链接，信息仍然泄露了。\n\n身份认证回答“谁在请求”，权限校验回答“这个人能否对这条记录做这个动作”。已经登录，不代表可以读取所有申请。\n\n本案例约定：学生只能读取自己的申请；指定工作人员可以审核全部申请；公开页面显示物品描述，不展示私密证明材料。这些是教学规则，真实服务需要与负责人确认。\n\n在下面的访问实验中改变请求者和记录归属，观察结果。这里是明确规则下的模拟，不会登录真实账号，也不会读取真实人员的数据。",
          "zh-TW": "## 一個值得做的反向測試\nAlex 提交了申請 C12。Sam 登入後，把請求裡的 C13 改成 C12。如果服務端直接返回 Alex 的私密認領說明，即使介面從未給 Sam 展示 C12 的連結，資訊仍然洩露了。\n\n身份認證回答“誰在請求”，許可權校驗回答“這個人能否對這條記錄做這個動作”。已經登入，不代表可以讀取所有申請。\n\n本案例約定：學生只能讀取自己的申請；指定工作人員可以稽核全部申請；公開頁面顯示物品描述，不展示私密證明材料。這些是教學規則，真實服務需要與負責人確認。\n\n在下面的訪問實驗中改變請求者和記錄歸屬，觀察結果。這裡是明確規則下的模擬，不會登入真實賬號，也不會讀取真實人員的資料。"
        },
        "advanced": {
          "en": "Apply an object-level authorization check on every read and update, and do not accept a client-supplied staff role. Describe a test matrix across actor, resource owner and action. A 403 or non-disclosing 404 can both be valid choices if the contract is consistent.",
          "zh-CN": "每次读取和修改都要检查具体对象的权限，不接受浏览器自报的工作人员身份。按请求者、记录归属和动作建立测试矩阵。403 或不暴露存在性的 404 都可能合理，但接口行为需要一致。",
          "zh-TW": "每次讀取和修改都要檢查具體物件的許可權，不接受瀏覽器自報的工作人員身份。按請求者、記錄歸屬和動作建立測試矩陣。403 或不暴露存在性的 404 都可能合理，但介面行為需要一致。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Check the requested record, not just whether someone is logged in.",
          "zh-CN": "先回到案例里的证据。检查具体记录的归属，不只检查是否登录。",
          "zh-TW": "先回到案例裡的證據。檢查具體記錄的歸屬，不只檢查是否登入。"
        },
        "workshop": {
          "title": {
            "en": "Specify the permission checks",
            "zh-CN": "整理权限检查",
            "zh-TW": "整理許可權檢查"
          },
          "brief": {
            "en": "Use the access lab, then explain the rule without referring to button visibility.",
            "zh-CN": "试用访问实验，再解释规则，不要把是否显示按钮当成权限依据。",
            "zh-TW": "試用訪問實驗，再解釋規則，不要把是否顯示按鈕當成許可權依據。"
          },
          "questions": [
            {
              "en": "What should happen when Sam requests Alex’s claim?",
              "zh-CN": "Sam 请求 Alex 的申请时应怎样处理？",
              "zh-TW": "Sam 請求 Alex 的申請時應怎樣處理？"
            },
            {
              "en": "What changes when the caller is designated staff?",
              "zh-CN": "请求者是指定工作人员时有什么不同？",
              "zh-TW": "請求者是指定工作人員時有什麼不同？"
            },
            {
              "en": "Which checks must repeat when a claim is updated?",
              "zh-CN": "修改申请时还要重复检查哪些条件？",
              "zh-TW": "修改申請時還要重複檢查哪些條件？"
            }
          ],
          "sample": {
            "en": "Sam’s read is rejected because the claim belongs to Alex. Designated staff may read it under the case policy. An update also needs object-level permission, valid state transition and current item state. The server obtains the role from its trusted identity system, not a role dropdown sent in the request.",
            "zh-CN": "Sam 不是该申请的所有者，应拒绝读取；按案例政策，指定工作人员可读取。修改时还要检查对象权限、合法状态变化和物品当前状态。角色由可信身份系统提供，不能根据浏览器提交的角色下拉框决定。",
            "zh-TW": "Sam 不是該申請的所有者，應拒絕讀取；按案例政策，指定工作人員可讀取。修改時還要檢查物件許可權、合法狀態變化和物品當前狀態。角色由可信身份系統提供，不能根據瀏覽器提交的角色下拉框決定。"
          },
          "rubric": [
            {
              "en": "Check the requested record, not just whether someone is logged in.",
              "zh-CN": "检查具体记录的归属，不只检查是否登录。",
              "zh-TW": "檢查具體記錄的歸屬，不只檢查是否登入。"
            },
            {
              "en": "Separate trusted server identity from client input.",
              "zh-CN": "区分可信身份与客户端提交的数据。",
              "zh-TW": "區分可信身份與客戶端提交的資料。"
            }
          ]
        },
        "type": "access",
        "minutes": 10
      },
      {
        "id": "s4",
        "title": {
          "en": "Handle a retry without doing the work twice",
          "zh-CN": "重试时别把同一件事做两遍",
          "zh-TW": "重試時別把同一件事做兩遍"
        },
        "body": {
          "en": "## The uncertain response\nAlex submits a claim. The server saves it, but the response is lost. Alex sees a spinner and clicks again. There are now two requests, but only one intention.\n\nDisabling the button helps with an accidental double-click. It cannot stop a browser refresh, a network retry or another tab. The server needs a policy for repeated submissions. For this case, one user may have only one active claim for the same item; a retry returns the existing claim.\n\n## Two reviewers, one item\nAnother failure happens when two staff members approve different claims after both read “item open”. Checking first and updating later is not enough if those actions can interleave. The operation must preserve the one-approved-claim rule as a whole.\n\nThe design note should cover success, rejection and uncertainty. “Please try again” is incomplete if trying again can silently duplicate the action.",
          "zh-CN": "## 没收到响应，不等于没保存\nAlex 提交认领申请。服务端已经保存，但响应在网络中丢失。页面一直转圈，Alex 又点了一次。现在产生了两次请求，但用户其实只想做一件事。\n\n禁用按钮有助于防止连点，却无法阻止刷新、网络重试或另一个标签页提交。服务端需要明确处理重复提交。本案例规定，同一人对同一物品最多保留一条有效申请，重试时返回原来的申请。\n\n## 两个人审核同一件物品\n另一种失败是两个工作人员都先读到“物品待认领”，随后分别批准不同申请。如果读取和修改可以交错执行，“先检查再保存”仍可能产生两条批准结果。整个操作需要保持只能批准一条的约束。\n\n设计说明应覆盖成功、拒绝和结果不确定的情况。如果重试可能悄悄重复操作，只显示“请重试”是不完整的处理。",
          "zh-TW": "## 沒收到響應，不等於沒儲存\nAlex 提交認領申請。服務端已經儲存，但響應在網路中丟失。頁面一直轉圈，Alex 又點了一次。現在產生了兩次請求，但使用者其實只想做一件事。\n\n禁用按鈕有助於防止連點，卻無法阻止重新整理、網路重試或另一個標籤頁提交。服務端需要明確處理重複提交。本案例規定，同一人對同一物品最多保留一條有效申請，重試時返回原來的申請。\n\n## 兩個人稽核同一件物品\n另一種失敗是兩個工作人員都先讀到“物品待認領”，隨後分別批准不同申請。如果讀取和修改可以交錯執行，“先檢查再儲存”仍可能產生兩條批准結果。整個操作需要保持只能批准一條的約束。\n\n設計說明應覆蓋成功、拒絕和結果不確定的情況。如果重試可能悄悄重複操作，只顯示“請重試”是不完整的處理。"
        },
        "advanced": {
          "en": "Distinguish request idempotency from user-intent uniqueness. A retry token identifies one operation; a uniqueness constraint on active claimant/item pairs expresses domain policy. Use an atomic conditional transition or transaction for approval. Deduplication alone does not solve concurrent approval.",
          "zh-CN": "区分请求幂等和业务唯一性：重试标识对应同一次操作，申请人／物品的有效记录唯一约束表达业务规则。审核采用原子条件更新或事务。请求去重本身不能解决并发批准。",
          "zh-TW": "區分請求冪等和業務唯一性：重試標識對應同一次操作，申請人／物品的有效記錄唯一約束表達業務規則。稽核採用原子條件更新或事務。請求去重本身不能解決併發批准。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Handle retries after a saved operation.",
          "zh-CN": "先回到案例里的证据。考虑已经保存但响应丢失后的重试。",
          "zh-TW": "先回到案例裡的證據。考慮已經儲存但響應丟失後的重試。"
        },
        "workshop": {
          "title": {
            "en": "Add failure paths to the design",
            "zh-CN": "给设计补上失败路径",
            "zh-TW": "給設計補上失敗路徑"
          },
          "brief": {
            "en": "The response disappears after the first successful save.",
            "zh-CN": "第一次保存成功后响应丢失。",
            "zh-TW": "第一次儲存成功後響應丟失。"
          },
          "questions": [
            {
              "en": "Describe what the second submission should return.",
              "zh-CN": "第二次提交应该返回什么？",
              "zh-TW": "第二次提交應該返回什麼？"
            },
            {
              "en": "Which invariant must an approval operation preserve?",
              "zh-CN": "批准操作必须保持什么约束？",
              "zh-TW": "批准操作必須保持什麼約束？"
            },
            {
              "en": "How would you test both failures?",
              "zh-CN": "怎样测试重复提交和并发批准？",
              "zh-TW": "怎樣測試重複提交和併發批准？"
            }
          ],
          "sample": {
            "en": "The retry returns the already-created active claim ID rather than a new claim. Approval must preserve at most one approved claim per item. Test by submitting the same user/item twice, including after a simulated lost response; then run two approval attempts for different claims and inspect stored state. Only one may succeed. A disabled button alone does not establish either guarantee.",
            "zh-CN": "重试应返回已建立的有效申请编号，而不是新建一条。批准操作必须保证同一物品最多一条获批申请。先测试相同用户和物品重复提交，包括模拟丢失响应后的重试；再对两条不同申请并发批准，检查最终保存状态，只允许一条成功。按钮被禁用不能证明这两项保证。",
            "zh-TW": "重試應返回已建立的有效申請編號，而不是新建一條。批准操作必須保證同一物品最多一條獲批申請。先測試相同使用者和物品重複提交，包括模擬丟失響應後的重試；再對兩條不同申請併發批准，檢查最終儲存狀態，只允許一條成功。按鈕被禁用不能證明這兩項保證。"
          },
          "rubric": [
            {
              "en": "Handle retries after a saved operation.",
              "zh-CN": "考虑已经保存但响应丢失后的重试。",
              "zh-TW": "考慮已經儲存但響應丟失後的重試。"
            },
            {
              "en": "Check final stored state under competing operations.",
              "zh-CN": "检查竞争操作后的最终保存状态。",
              "zh-TW": "檢查競爭操作後的最終儲存狀態。"
            }
          ]
        },
        "type": "read",
        "minutes": 9
      }
    ]
  },
  {
    "id": "ai-coding",
    "title": {
      "en": "Working with an AI coding assistant",
      "zh-CN": "与 AI 编程助手一起开发",
      "zh-TW": "與 AI 程式設計助手一起開發"
    },
    "description": {
      "en": "Specify a small task, inspect competing implementations, run checks and leave a review record another developer can follow.",
      "zh-CN": "描述一个小任务，检查不同实现，运行测试，并留下别人能够复查的记录。",
      "zh-TW": "描述一個小任務，檢查不同實現，執行測試，並留下別人能夠複查的記錄。"
    },
    "outcomes": {
      "en": "Write a bounded task; find a plausible code defect; verify behaviour and explain the limits of the checks.",
      "zh-CN": "写清任务边界，识别看似合理的代码缺陷，验证行为并解释测试的局限。",
      "zh-TW": "寫清任務邊界，識別看似合理的程式碼缺陷，驗證行為並解釋測試的侷限。"
    },
    "deliverable": {
      "en": "A reviewed booking function, a task brief and a short change record.",
      "zh-CN": "一份经过检查的报名函数、任务说明和修改记录。",
      "zh-TW": "一份經過檢查的報名函式、任務說明和修改記錄。"
    },
    "prerequisite": {
      "en": "Basic JavaScript helps. Beginners can use the examples before editing the function.",
      "zh-CN": "了解基本 JavaScript 会更顺利；初学者可先看例子，再修改函数。",
      "zh-TW": "瞭解基本 JavaScript 會更順利；初學者可先看例子，再修改函式。"
    },
    "topic": "aiDevelopment",
    "theme": "lavender",
    "duration": 40,
    "status": "published",
    "source": "built-in",
    "curriculumVersion": 2,
    "lessons": [
      {
        "id": "a1",
        "title": {
          "en": "Give the assistant a task it can finish",
          "zh-CN": "把任务交代到可以检查",
          "zh-TW": "把任務交代到可以檢查"
        },
        "body": {
          "en": "## The maintenance ticket\nA booking export sometimes includes the same student more than once. The admin team needs a function that keeps the first booking for each student ID. Two different students may have the same name.\n\nA useful task brief states the input, output, rules, examples and boundaries. Here: input is an array of booking objects; output is a new array; keep the first object for each studentId, preserve input order and do not mutate the input. Assume studentId is a non-empty string in this exercise. Validation of malformed imports is a separate task.\n\n## Keep the scope small\n“Fix booking” might invite changes to authentication, database schema and the interface. Ask for the function and a short explanation of assumptions first. Inspect the proposed change before accepting it.\n\nAn AI assistant can produce a draft, but the contract comes from the task. If an answer quietly changes “first” to “last”, it has changed the requirement even if the code is shorter.",
          "zh-CN": "## 收到一张维护单\n报名导出中有时会重复出现同一学生。管理人员需要一个函数：按学生编号保留首条报名。两个不同学生可能同名。\n\n有效的任务说明需要包含输入、输出、规则、例子和边界。本题输入是报名对象数组，输出是新数组；同一 studentId 保留第一个对象，保持输入顺序，不修改原数组。练习假设 studentId 是非空字符串，损坏导入数据的校验属于另一项任务。\n\n## 控制改动范围\n只说“修好报名”可能让助手同时修改登录、数据库和界面。先要求完成这个函数并解释假设，再检查生成的改动。\n\nAI 可以提供草稿，但任务约定不由草稿决定。如果它把“保留首条”悄悄改成“保留末条”，即使代码更短，也已经改变了需求。",
          "zh-TW": "## 收到一張維護單\n報名匯出中有時會重複出現同一學生。管理人員需要一個函式：按學生編號保留首條報名。兩個不同學生可能同名。\n\n有效的任務說明需要包含輸入、輸出、規則、例子和邊界。本題輸入是報名物件陣列，輸出是新陣列；同一 studentId 保留第一個物件，保持輸入順序，不修改原陣列。練習假設 studentId 是非空字串，損壞匯入資料的校驗屬於另一項任務。\n\n## 控制改動範圍\n只說“修好報名”可能讓助手同時修改登入、資料庫和介面。先要求完成這個函式並解釋假設，再檢查生成的改動。\n\nAI 可以提供草稿，但任務約定不由草稿決定。如果它把“保留首條”悄悄改成“保留末條”，即使程式碼更短，也已經改變了需求。"
        },
        "advanced": {
          "en": "Add performance expectations and a non-goal. A single pass with a Set is expected linear time for this exercise; repeatedly searching the entire input can be quadratic. Do not confuse an in-memory export cleanup with enforcing booking uniqueness in a database.",
          "zh-CN": "补充性能预期和不做事项。本练习单遍扫描配合 Set 通常为线性时间，反复遍历整个输入可能达到平方级。导出文件去重不等于在数据库中保证报名唯一。",
          "zh-TW": "補充效能預期和不做事項。本練習單遍掃描配合 Set 通常為線性時間，反覆遍歷整個輸入可能達到平方級。匯出檔案去重不等於在資料庫中保證報名唯一。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Make conflicting implementations distinguishable with an example.",
          "zh-CN": "先回到案例里的证据。用例子区分可能产生不同结果的实现。",
          "zh-TW": "先回到案例裡的證據。用例子區分可能產生不同結果的實現。"
        },
        "workshop": {
          "title": {
            "en": "Write the coding task",
            "zh-CN": "编写委托说明",
            "zh-TW": "編寫委託說明"
          },
          "brief": {
            "en": "Write instructions for the function, not a request to redesign the application.",
            "zh-CN": "只委托实现函数，不要求重新设计应用。",
            "zh-TW": "只委託實現函式，不要求重新設計應用。"
          },
          "questions": [
            {
              "en": "State input, output and the meaning of “first”.",
              "zh-CN": "说明输入、输出以及“首条”的含义。",
              "zh-TW": "說明輸入、輸出以及“首條”的含義。"
            },
            {
              "en": "Give an example with duplicate IDs and another with duplicate names.",
              "zh-CN": "给出重复编号和同名不同编号两个例子。",
              "zh-TW": "給出重複編號和同名不同編號兩個例子。"
            },
            {
              "en": "List a constraint and something outside scope.",
              "zh-CN": "列出一个约束和一个不在范围内的事项。",
              "zh-TW": "列出一個約束和一個不在範圍內的事項。"
            }
          ],
          "sample": {
            "en": "Implement uniqueBookings(bookings). For valid objects with non-empty string studentId, return a new array containing the original first object for each ID, in original order. Do not mutate input. Example [A:first, A:second, B] becomes [A:first, B]. Two Alex records with IDs A and B both remain. Do not modify authentication, storage or UI. Explain assumptions and include a test that would fail a last-write-wins implementation.",
            "zh-CN": "实现 uniqueBookings(bookings)。输入对象的 studentId 均为非空字符串；返回新数组，按输入顺序保留每个编号首次出现的原对象，不修改输入。[A:first, A:second, B] 应得到 [A:first, B]。两个都叫 Alex、但编号分别为 A 和 B 的记录应同时保留。不修改登录、存储或界面，解释假设，并给出能识别“保留末条”错误的测试。",
            "zh-TW": "實現 uniqueBookings(bookings)。輸入物件的 studentId 均為非空字串；返回新陣列，按輸入順序保留每個編號首次出現的原物件，不修改輸入。[A:first, A:second, B] 應得到 [A:first, B]。兩個都叫 Alex、但編號分別為 A 和 B 的記錄應同時保留。不修改登入、儲存或介面，解釋假設，並給出能識別“保留末條”錯誤的測試。"
          },
          "rubric": [
            {
              "en": "Make conflicting implementations distinguishable with an example.",
              "zh-CN": "用例子区分可能产生不同结果的实现。",
              "zh-TW": "用例子區分可能產生不同結果的實現。"
            },
            {
              "en": "Specify what must remain unchanged.",
              "zh-CN": "说明哪些内容不得被改动。",
              "zh-TW": "說明哪些內容不得被改動。"
            }
          ]
        },
        "type": "read",
        "minutes": 8
      },
      {
        "id": "a2",
        "title": {
          "en": "Review and repair the duplicate-booking function",
          "zh-CN": "检查并修复重复报名函数",
          "zh-TW": "檢查並修復重複報名函式"
        },
        "body": {
          "en": "## Two plausible answers\nAn assistant proposes removing duplicates by name. That loses a booking whenever two students share a name. Another answer builds a Map from studentId to booking; replacing values as it scans keeps the last record for each ID. Both answers may pass a test containing only unique students.\n\n## Work on the contract\nTrack IDs you have already seen. When an ID appears for the first time, keep that object; on later appearances, skip it. A Set is useful because it answers whether an ID has been seen without relying on the person’s name.\n\nEdit the function below and run the checks. The cases include repeated IDs with different details, identical names with different IDs, empty input and input immutability. Read the failing case before changing the implementation.\n\n## What this exercise does not prove\nPassing these checks demonstrates the specified in-memory behaviour for the tested inputs. It does not make a real ticket allocation safe against simultaneous server requests. That needs server-side consistency controls.",
          "zh-CN": "## 两种看似合理的答案\n助手提出按姓名去重，这会误删同名学生。另一种答案用 studentId 构建 Map，每次遇到编号就覆盖旧值，实际保留的是末条记录。这两种答案都可能通过“学生完全不重复”的测试。\n\n## 回到约定修复\n记录已经出现的编号。一个编号第一次出现时保留那个对象，以后再出现就跳过。Set 适合记录是否见过某个编号，不需要依赖姓名。\n\n修改下面的函数，运行检查。测试包括：同一编号但内容不同、姓名相同但编号不同、空输入，以及原数组是否保持不变。先读失败用例，再决定改代码的哪一部分。\n\n## 通过检查说明什么\n通过只说明在这些输入下，内存函数符合约定；它不能证明真实售票系统面对服务端并发请求仍不会超卖。后者需要服务端的一致性控制。",
          "zh-TW": "## 兩種看似合理的答案\n助手提出按姓名去重，這會誤刪同名學生。另一種答案用 studentId 構建 Map，每次遇到編號就覆蓋舊值，實際保留的是末條記錄。這兩種答案都可能透過“學生完全不重複”的測試。\n\n## 回到約定修復\n記錄已經出現的編號。一個編號第一次出現時保留那個物件，以後再出現就跳過。Set 適合記錄是否見過某個編號，不需要依賴姓名。\n\n修改下面的函式，執行檢查。測試包括：同一編號但內容不同、姓名相同但編號不同、空輸入，以及原陣列是否保持不變。先讀失敗用例，再決定改程式碼的哪一部分。\n\n## 透過檢查說明什麼\n透過只說明在這些輸入下，記憶體函式符合約定；它不能證明真實售票系統面對服務端併發請求仍不會超賣。後者需要服務端的一致性控制。"
        },
        "advanced": {
          "en": "Preserve original object identity as well as values and order. Explain the time and memory cost of your approach. Consider whether the domain would ever need last-write-wins; if so, it is a new contract with different tests, not an unannounced optimization.",
          "zh-CN": "除了值和顺序，还要保留原对象引用。说明时间和空间成本。可以讨论某个业务是否需要保留末条，但那是新的约定和测试，不能以优化之名悄悄替换。",
          "zh-TW": "除了值和順序，還要保留原物件引用。說明時間和空間成本。可以討論某個業務是否需要保留末條，但那是新的約定和測試，不能以最佳化之名悄悄替換。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Cite an actual test result.",
          "zh-CN": "先回到案例里的证据。引用实际运行的测试结果。",
          "zh-TW": "先回到案例裡的證據。引用實際執行的測試結果。"
        },
        "workshop": {
          "title": {
            "en": "Leave a code review note",
            "zh-CN": "留下代码审查记录",
            "zh-TW": "留下程式碼審查記錄"
          },
          "brief": {
            "en": "Run the code checks before writing this note.",
            "zh-CN": "运行代码检查后再填写。",
            "zh-TW": "執行程式碼檢查後再填寫。"
          },
          "questions": [
            {
              "en": "Which original defect did you fix?",
              "zh-CN": "修复了原来什么问题？",
              "zh-TW": "修復了原來什麼問題？"
            },
            {
              "en": "Which test distinguishes your implementation from keeping the last record?",
              "zh-CN": "哪个测试能区分你的实现和保留末条？",
              "zh-TW": "哪個測試能區分你的實現和保留末條？"
            },
            {
              "en": "What system-level guarantee is still untested?",
              "zh-CN": "哪项系统层面的保证仍未验证？",
              "zh-TW": "哪項系統層面的保證仍未驗證？"
            }
          ],
          "sample": {
            "en": "I replaced returning every row with first-seen filtering by studentId. The repeated-ID case includes different record details, so keeping the last object fails. I also checked empty input, same-name students and non-mutation. These checks do not exercise a database transaction or simultaneous ticket allocation.",
            "zh-CN": "将直接返回全部记录改为按 studentId 保留首次出现的记录。重复编号用例中两条内容不同，因此能发现保留末条的错误；同时检查空输入、同名不同编号和输入不变。这些测试没有验证数据库事务或并发分票。",
            "zh-TW": "將直接返回全部記錄改為按 studentId 保留首次出現的記錄。重複編號用例中兩條內容不同，因此能發現保留末條的錯誤；同時檢查空輸入、同名不同編號和輸入不變。這些測試沒有驗證資料庫事務或併發分票。"
          },
          "rubric": [
            {
              "en": "Cite an actual test result.",
              "zh-CN": "引用实际运行的测试结果。",
              "zh-TW": "引用實際執行的測試結果。"
            },
            {
              "en": "State at least one limit of the verification.",
              "zh-CN": "说明至少一项验证局限。",
              "zh-TW": "說明至少一項驗證侷限。"
            }
          ]
        },
        "type": "coding",
        "minutes": 15,
        "solution": "function uniqueBookings(bookings) {\n  const seen = new Set();\n  return bookings.filter(booking => {\n    if (seen.has(booking.studentId)) return false;\n    seen.add(booking.studentId);\n    return true;\n  });\n}"
      },
      {
        "id": "a3",
        "title": {
          "en": "Use a failing test to question an answer",
          "zh-CN": "用失败用例追问答案",
          "zh-TW": "用失敗用例追問答案"
        },
        "body": {
          "en": "## A weak test suite\nSuppose a generated test only asserts that the output is an array. The broken starter function already passes. A test can execute code without checking the requirement that matters.\n\nConstruct a small counterexample: two records with studentId A but different contact details, followed by one record for B. Write the exact expected result before asking the assistant to repair anything. This prevents the expected answer from simply following whatever the implementation happens to do.\n\n## Review the change, not the explanation alone\nAsk the assistant to explain why the counterexample failed and propose a limited patch. Then inspect the changed lines and run both the new check and previous checks. A confident explanation is not evidence that the code behaves correctly.\n\nIf the patch adds sorting, notice that it may violate the order requirement. Fixing one failure can introduce another; regression checks protect behaviour that was already correct.",
          "zh-CN": "## 测试也会写得太弱\n假设生成的测试只判断返回值是不是数组。原来那个直接返回全部记录的错误函数也能通过。测试执行过代码，不等于检查了关键需求。\n\n构造一个小反例：编号 A 的两条记录内容不同，后面再放一条 B。请先写出准确的预期结果，再要求助手修复，避免预期答案照着错误实现走。\n\n## 看改动，不只听解释\n让助手说明反例为什么失败，并提出限定范围的补丁。随后检查实际改动，同时运行新用例和原有用例。解释很自信，不能证明代码正确。\n\n若补丁加入排序，要注意它可能破坏保留输入顺序的要求。修好一个问题也可能带来另一个问题，回归测试就是用来保护原本正确的行为。",
          "zh-TW": "## 測試也會寫得太弱\n假設生成的測試只判斷返回值是不是陣列。原來那個直接返回全部記錄的錯誤函式也能透過。測試執行過程式碼，不等於檢查了關鍵需求。\n\n構造一個小反例：編號 A 的兩條記錄內容不同，後面再放一條 B。請先寫出準確的預期結果，再要求助手修復，避免預期答案照著錯誤實現走。\n\n## 看改動，不只聽解釋\n讓助手說明反例為什麼失敗，並提出限定範圍的補丁。隨後檢查實際改動，同時執行新用例和原有用例。解釋很自信，不能證明程式碼正確。\n\n若補丁加入排序，要注意它可能破壞保留輸入順序的要求。修好一個問題也可能帶來另一個問題，迴歸測試就是用來保護原本正確的行為。"
        },
        "advanced": {
          "en": "Evaluate a test by mutation: would it reject a name-based, last-write-wins, always-empty or in-place-sorting implementation? A mutation surviving the suite reveals a coverage gap; it does not by itself show how often that defect occurs in production.",
          "zh-CN": "用错误变体检验测试：按姓名去重、保留末条、永远返回空数组、原地排序，哪些会被发现？错误变体仍能通过说明测试存在缺口，但不能据此推断真实系统出现该问题的频率。",
          "zh-TW": "用錯誤變體檢驗測試：按姓名去重、保留末條、永遠返回空陣列、原地排序，哪些會被發現？錯誤變體仍能透過說明測試存在缺口，但不能據此推斷真實系統出現該問題的頻率。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Expected output must be independent of the broken code.",
          "zh-CN": "先回到案例里的证据。预期输出不能由错误实现决定。",
          "zh-TW": "先回到案例裡的證據。預期輸出不能由錯誤實現決定。"
        },
        "workshop": {
          "title": {
            "en": "Write a repair request",
            "zh-CN": "编写修复请求",
            "zh-TW": "編寫修復請求"
          },
          "brief": {
            "en": "An answer passes unique-student tests but keeps the last duplicate.",
            "zh-CN": "某个答案通过了无重复学生的测试，却保留重复编号的末条。",
            "zh-TW": "某個答案透過了無重復學生的測試，卻保留重複編號的末條。"
          },
          "questions": [
            {
              "en": "Write a minimal failing example and its expected output.",
              "zh-CN": "写最小失败输入及准确预期输出。",
              "zh-TW": "寫最小失敗輸入及準確預期輸出。"
            },
            {
              "en": "Write a follow-up request that limits the patch.",
              "zh-CN": "写一段限制改动范围的追问。",
              "zh-TW": "寫一段限制改動範圍的追問。"
            },
            {
              "en": "Which previous checks must run again?",
              "zh-CN": "哪些已有检查必须重新运行？",
              "zh-TW": "哪些已有檢查必須重新執行？"
            }
          ],
          "sample": {
            "en": "Input [{studentId:\"A\", note:\"first\"}, {studentId:\"A\", note:\"second\"}] must return the first object only. Ask: explain why your implementation keeps the last record, change only uniqueBookings to preserve first occurrence, and do not sort or mutate input. Re-run unique IDs, duplicate IDs, same-name different IDs, empty input and immutability checks.",
            "zh-CN": "输入 [{studentId:\"A\", note:\"first\"}, {studentId:\"A\", note:\"second\"}] 只应返回第一个对象。追问：说明当前为何保留末条，只修改 uniqueBookings 以保留首次记录，不排序也不修改输入。重新运行不同编号、重复编号、同名不同编号、空输入及输入不变检查。",
            "zh-TW": "輸入 [{studentId:\"A\", note:\"first\"}, {studentId:\"A\", note:\"second\"}] 只應返回第一個物件。追問：說明當前為何保留末條，只修改 uniqueBookings 以保留首次記錄，不排序也不修改輸入。重新執行不同編號、重複編號、同名不同編號、空輸入及輸入不變檢查。"
          },
          "rubric": [
            {
              "en": "Expected output must be independent of the broken code.",
              "zh-CN": "预期输出不能由错误实现决定。",
              "zh-TW": "預期輸出不能由錯誤實現決定。"
            },
            {
              "en": "Preserve previous requirements while repairing the defect.",
              "zh-CN": "修复时保留此前约定的其他行为。",
              "zh-TW": "修復時保留此前約定的其他行為。"
            }
          ]
        },
        "type": "read",
        "minutes": 10,
        "check": {
          "question": {
            "en": "Which test would expose a last-write-wins defect?",
            "zh-CN": "哪个测试能识别保留末条的错误？",
            "zh-TW": "哪個測試能識別保留末條的錯誤？"
          },
          "options": [
            {
              "text": {
                "en": "Assert that the result is an array.",
                "zh-CN": "判断结果是不是数组。",
                "zh-TW": "判斷結果是不是陣列。"
              },
              "feedback": {
                "en": "Both first- and last-write-wins implementations return arrays.",
                "zh-CN": "保留首条和末条都会返回数组，无法区分。",
                "zh-TW": "保留首條和末條都會返回陣列，無法區分。"
              }
            },
            {
              "text": {
                "en": "Use two records with the same ID but different details; expect the first object.",
                "zh-CN": "同一编号放两条内容不同的记录，要求返回第一个对象。",
                "zh-TW": "同一編號放兩條內容不同的記錄，要求返回第一個物件。"
              },
              "feedback": {
                "en": "The differing details and object identity make the two policies distinguishable.",
                "zh-CN": "不同内容及对象引用能区分两种保留策略。",
                "zh-TW": "不同內容及物件引用能區分兩種保留策略。"
              }
            },
            {
              "text": {
                "en": "Use two identical copies and assert that the result has length one.",
                "zh-CN": "放两个完全相同的副本，只检查长度为一。",
                "zh-TW": "放兩個完全相同的副本，只檢查長度為一。"
              },
              "feedback": {
                "en": "Both policies can pass because the retained records look identical.",
                "zh-CN": "两个策略都可能通过，因为留下的记录看不出区别。",
                "zh-TW": "兩個策略都可能透過，因為留下的記錄看不出區別。"
              }
            }
          ],
          "correct": 1
        }
      },
      {
        "id": "a4",
        "title": {
          "en": "Explain what you accepted and what you checked",
          "zh-CN": "说明采用了什么、检查了什么",
          "zh-TW": "說明採用了什麼、檢查了什麼"
        },
        "body": {
          "en": "## A handover another person can use\n“AI wrote it and all tests passed” leaves a reviewer with several questions. Which task was delegated? Which generated answer was rejected? Which checks ran, and what do they not cover?\n\nUse a short change record: requested behaviour, proposed implementation, review findings, final change, evidence and remaining limits. For our function, explain the name-based or last-write-wins failure, attach the counterexample and describe the adopted first-seen approach.\n\n## Apply the four decisions\nDelegation: give the assistant a bounded implementation task. Description: supply the contract and examples. Discernment: inspect whether the output follows that contract. Diligence: run independent checks and retain evidence. These terms are useful only when tied to specific actions you took.\n\nDo not claim authorship of a change you merely accepted, or claim that a test suite proves the entire application safe. A clear account of assistance and verification is more useful than either extreme.",
          "zh-CN": "## 交接记录要让别人接得住\n“AI 写的，测试都通过了”仍留下很多问题：交给 AI 的具体是什么？拒绝过哪个答案？跑了什么检查？还有什么没检查？\n\n可以按请求行为、建议实现、审查发现、最终改动、验证证据和剩余局限写一份短记录。本题说明按姓名或保留末条为什么错误，附上反例，再解释最终采用的首次出现策略。\n\n## 把四个判断落到行动\nDelegation：交出范围明确的实现任务；Description：给出约定和例子；Discernment：审查结果是否遵守约定；Diligence：独立检查并保留证据。这些词只有对应到实际做过的事情才有意义。\n\n不要把直接接受的代码说成全由自己完成，也不要说一套函数测试证明了整个应用安全。说明怎样使用协助、怎样验证结果，更便于后续维护。",
          "zh-TW": "## 交接記錄要讓別人接得住\n“AI 寫的，測試都透過了”仍留下很多問題：交給 AI 的具體是什麼？拒絕過哪個答案？跑了什麼檢查？還有什麼沒檢查？\n\n可以按請求行為、建議實現、審查發現、最終改動、驗證證據和剩餘侷限寫一份短記錄。本題說明按姓名或保留末條為什麼錯誤，附上反例，再解釋最終採用的首次出現策略。\n\n## 把四個判斷落到行動\nDelegation：交出範圍明確的實現任務；Description：給出約定和例子；Discernment：審查結果是否遵守約定；Diligence：獨立檢查並保留證據。這些詞只有對應到實際做過的事情才有意義。\n\n不要把直接接受的程式碼說成全由自己完成，也不要說一套函式測試證明了整個應用安全。說明怎樣使用協助、怎樣驗證結果，更便於後續維護。"
        },
        "advanced": {
          "en": "Add the exact version or change identifier, how checks were run, and any deviation between requested and implemented behaviour. For a real repository, keep the reviewable diff and reproducible test command with the change.",
          "zh-CN": "补充具体版本或改动编号、运行检查的方式，以及请求与实际实现之间的差异。在真实仓库中保留可审查的改动和可复现的测试命令。",
          "zh-TW": "補充具體版本或改動編號、執行檢查的方式，以及請求與實際實現之間的差異。在真實倉庫中保留可審查的改動和可復現的測試命令。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Describe specific human decisions rather than a generic AI reflection.",
          "zh-CN": "先回到案例里的证据。写具体判断，不写泛泛的 AI 感想。",
          "zh-TW": "先回到案例裡的證據。寫具體判斷，不寫泛泛的 AI 感想。"
        },
        "workshop": {
          "title": {
            "en": "Submit the review record",
            "zh-CN": "提交审查记录",
            "zh-TW": "提交審查記錄"
          },
          "brief": {
            "en": "Use the function you actually tested in this course.",
            "zh-CN": "使用你在本课实际检查的函数。",
            "zh-TW": "使用你在本課實際檢查的函式。"
          },
          "questions": [
            {
              "en": "What did the assistant draft, and what judgment did you contribute?",
              "zh-CN": "助手起草了什么？你作出了什么判断？",
              "zh-TW": "助手起草了什麼？你作出了什麼判斷？"
            },
            {
              "en": "Record a rejected approach and the evidence against it.",
              "zh-CN": "记录一个没有采用的方案，以及拒绝它的证据。",
              "zh-TW": "記錄一個沒有采用的方案，以及拒絕它的證據。"
            },
            {
              "en": "State the final verification and remaining risk.",
              "zh-CN": "写清最终验证及尚存风险。",
              "zh-TW": "寫清最終驗證及尚存風險。"
            }
          ],
          "sample": {
            "en": "The assistant drafted a deduplication function. I specified first occurrence and input order, rejected name-based matching using same-name students, and checked repeated IDs with different details. The final Set-based approach passed the listed function checks without mutating input. Server concurrency, malformed imports and account authorization are outside this exercise and remain to be tested separately.",
            "zh-CN": "助手起草去重函数；我指定保留首次记录和输入顺序，用同名不同编号的例子否定按姓名去重，并用内容不同的重复编号检查保留策略。最终 Set 方案通过函数检查，未修改输入。服务端并发、损坏导入数据和账号权限不属于本题，仍需分别测试。",
            "zh-TW": "助手起草去重函式；我指定保留首次記錄和輸入順序，用同名不同編號的例子否定按姓名去重，並用內容不同的重複編號檢查保留策略。最終 Set 方案透過函式檢查，未修改輸入。服務端併發、損壞匯入資料和賬號許可權不屬於本題，仍需分別測試。"
          },
          "rubric": [
            {
              "en": "Describe specific human decisions rather than a generic AI reflection.",
              "zh-CN": "写具体判断，不写泛泛的 AI 感想。",
              "zh-TW": "寫具體判斷，不寫泛泛的 AI 感想。"
            },
            {
              "en": "Only report checks you actually ran.",
              "zh-CN": "只报告实际运行过的检查。",
              "zh-TW": "只報告實際執行過的檢查。"
            }
          ]
        },
        "type": "reflection",
        "minutes": 7
      }
    ]
  },
  {
    "id": "testing-release",
    "title": {
      "en": "Testing, incidents and release decisions",
      "zh-CN": "测试、故障与上线决定",
      "zh-TW": "測試、故障與上線決定"
    },
    "description": {
      "en": "Investigate a ticketing failure, reproduce it, and decide what evidence is enough to release a repair.",
      "zh-CN": "调查售票故障、复现错误，并判断修复后还需要什么证据才能上线。",
      "zh-TW": "調查售票故障、復現錯誤，並判斷修復後還需要什麼證據才能上線。"
    },
    "outcomes": {
      "en": "Write independent expected results; reproduce a defect; select protections under constraints; plan verification and recovery.",
      "zh-CN": "独立写出预期结果，复现缺陷，在约束下选择保护措施，安排验证和恢复。",
      "zh-TW": "獨立寫出預期結果，復現缺陷，在約束下選擇保護措施，安排驗證和恢復。"
    },
    "deliverable": {
      "en": "A defect report, a test table and a release note with a rollback condition.",
      "zh-CN": "一份缺陷报告、测试表和包含回滚条件的上线说明。",
      "zh-TW": "一份缺陷報告、測試表和包含回滾條件的上線說明。"
    },
    "prerequisite": {
      "en": "Basic requirements and the AI coding function exercise are useful preparation.",
      "zh-CN": "建议先了解需求和 AI 编程课中的函数练习。",
      "zh-TW": "建議先了解需求和 AI 程式設計課中的函式練習。"
    },
    "topic": "foundations",
    "theme": "lavender",
    "duration": 42,
    "status": "published",
    "source": "built-in",
    "curriculumVersion": 2,
    "lessons": [
      {
        "id": "t1",
        "title": {
          "en": "Turn a complaint into a reproducible defect",
          "zh-CN": "把投诉变成可以复现的缺陷",
          "zh-TW": "把投訴變成可以復現的缺陷"
        },
        "body": {
          "en": "## The incident report\nRegistration opens at noon. A student writes, “I clicked once, the page froze, so I tried again. Now I have two confirmations.” Another says a friend with the same name lost a booking after an export cleanup.\n\nThese reports suggest different failures. One concerns repeated requests; the other may concern the identity used during deduplication. Do not label both “duplicate bug” and assume one fix covers them.\n\n## Collect the minimum useful record\nWrite the starting state, exact steps, expected result, actual result and evidence. For the first report, include the same student ID, request times and both confirmation IDs if available. Avoid placing private data in a public defect report; synthetic IDs are enough for the reproduction.\n\nTry the smallest input that reproduces the behaviour. If the problem only occurs with concurrent requests, a sequential browser demonstration cannot rule it out. State that limit instead of declaring the issue fixed.",
          "zh-CN": "## 两条故障反馈\n中午开放报名。一位学生说：“我点了一次，页面卡住，又试了一次，现在有两条确认。”另一位说导出清理后，同名朋友的一条报名消失了。\n\n两条记录可能对应不同问题：前者是重复请求，后者可能是去重时选错身份字段。不要统称“重复 bug”，再假设一个补丁能一起解决。\n\n## 收集够用的记录\n写初始状态、准确步骤、预期结果、实际结果和证据。第一条应记录同一学生编号、请求时间、两条确认编号。公开缺陷单不需要暴露个人资料，复现时使用虚构编号即可。\n\n尽量找到能够复现的最小输入。如果问题只在并发时出现，顺序点击浏览器不能排除它。应该明确记录检查的局限，而不是直接宣布已经修好。",
          "zh-TW": "## 兩條故障回饋\n中午開放報名。一位學生說：“我點了一次，頁面卡住，又試了一次，現在有兩條確認。”另一位說匯出清理後，同名朋友的一條報名消失了。\n\n兩條記錄可能對應不同問題：前者是重複請求，後者可能是去重時選錯身份欄位。不要統稱“重複 bug”，再假設一個補丁能一起解決。\n\n## 收集夠用的記錄\n寫初始狀態、準確步驟、預期結果、實際結果和證據。第一條應記錄同一學生編號、請求時間、兩條確認編號。公開缺陷單不需要暴露個人資料，復現時使用虛構編號即可。\n\n儘量找到能夠復現的最小輸入。如果問題只在併發時出現，順序點選瀏覽器不能排除它。應該明確記錄檢查的侷限，而不是直接宣佈已經修好。"
        },
        "advanced": {
          "en": "Record correlation IDs, ordering and environment without collecting unnecessary personal data. Separate a retry of one logical operation from two independent bookings. Reproduction should preserve the concurrency condition when that condition is necessary for the fault.",
          "zh-CN": "在不额外收集个人资料的前提下记录关联编号、顺序和环境，区分同一次操作的重试与两次独立报名。若并发是故障必要条件，复现必须保留该条件。",
          "zh-TW": "在不額外收集個人資料的前提下記錄關聯編號、順序和環境，區分同一次操作的重試與兩次獨立報名。若併發是故障必要條件，復現必須保留該條件。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Keep symptoms separate from the unconfirmed cause.",
          "zh-CN": "先回到案例里的证据。区分已经观察到的现象和尚未确认的原因。",
          "zh-TW": "先回到案例裡的證據。區分已經觀察到的現象和尚未確認的原因。"
        },
        "workshop": {
          "title": {
            "en": "Write a defect report",
            "zh-CN": "编写缺陷单",
            "zh-TW": "編寫缺陷單"
          },
          "brief": {
            "en": "Choose one of the two reports. Do not merge them.",
            "zh-CN": "从两条反馈中选一条，不要混成一个问题。",
            "zh-TW": "從兩條回饋中選一條，不要混成一個問題。"
          },
          "questions": [
            {
              "en": "State the smallest setup and reproduction steps.",
              "zh-CN": "说明最小准备条件和复现步骤。",
              "zh-TW": "說明最小準備條件和復現步驟。"
            },
            {
              "en": "Write expected and actual results separately.",
              "zh-CN": "分别写预期与实际结果。",
              "zh-TW": "分別寫預期與實際結果。"
            },
            {
              "en": "What evidence is missing before you can confirm the cause?",
              "zh-CN": "确认原因前还缺什么证据？",
              "zh-TW": "確認原因前還缺什麼證據？"
            }
          ],
          "sample": {
            "en": "Setup: student A has no booking. Submit a booking request, simulate a lost response, then repeat the same logical request. Expected: one confirmed booking and a retry response referring to it. Reported actual: two confirmations; verify whether they reference two stored bookings. Collect synthetic reproduction records and timing. The report alone does not prove whether the server duplicated data or only displayed the confirmation twice.",
            "zh-CN": "准备：学生 A 尚无报名。提交一次请求，模拟响应丢失，再重试同一次操作。预期：只有一条确认报名，重试指向它。反馈中的实际表现是两次确认，仍需核实是否对应两条已保存报名。收集虚构测试记录和时间；仅凭投诉还不能判断是数据重复，还是同一确认显示两次。",
            "zh-TW": "準備：學生 A 尚無報名。提交一次請求，模擬響應丟失，再重試同一次操作。預期：只有一條確認報名，重試指向它。回饋中的實際表現是兩次確認，仍需核實是否對應兩條已儲存報名。收集虛構測試記錄和時間；僅憑投訴還不能判斷是資料重複，還是同一確認顯示兩次。"
          },
          "rubric": [
            {
              "en": "Keep symptoms separate from the unconfirmed cause.",
              "zh-CN": "区分已经观察到的现象和尚未确认的原因。",
              "zh-TW": "區分已經觀察到的現象和尚未確認的原因。"
            },
            {
              "en": "Use steps someone else can repeat.",
              "zh-CN": "步骤要让别人能够重复。",
              "zh-TW": "步驟要讓別人能夠重複。"
            }
          ]
        },
        "type": "read",
        "minutes": 8
      },
      {
        "id": "t2",
        "title": {
          "en": "Check the repair against a test table",
          "zh-CN": "用测试表检查修复",
          "zh-TW": "用測試表檢查修復"
        },
        "body": {
          "en": "## Define expected results first\nWe will reuse the export function from the AI coding course. The requirement is first occurrence by studentId, original order, and no mutation. A repair has been proposed using a Map. Read it before running it: each later value replaces the earlier one for the same key.\n\nBuild a test table with an input, the exact expected output and a reason for the case. Two equal duplicate rows are a weak test of “first”: either record looks the same. Give them different details so the distinction matters.\n\n## Repair and regress\nRun the checks on the proposed repair. When it fails, make a limited change and run the complete set again. Do not remove a failed test just because it conflicts with the implementation.\n\nThe code lab covers a pure function. An integration check must separately show that the application supplies the correct fields and uses the returned array; a system check must exercise repeated server requests. Keep those layers visible in the test report.",
          "zh-CN": "## 先确定预期结果\n这里沿用 AI 编程课的导出去重函数：按 studentId 保留首条，保持顺序，不修改输入。某个修复采用 Map。先读代码：同一个键后面写入的值会覆盖前面的值。\n\n测试表应有输入、准确预期输出和用例理由。两条完全一样的重复记录，并不能有效检查“保留首条”，因为留下哪条都看不出区别。让它们的内容不同，测试才有区分力。\n\n## 修复后重新检查\n先运行建议修复，再根据失败结果作限定范围的修改，并重新运行整组检查。不能因为测试与代码不一致，就直接删掉失败测试。\n\n下面只检查纯函数。集成检查还需要确认应用传入了正确字段、实际使用了返回数组；系统检查要另行覆盖服务端重复请求。报告中应把这些层次分清。",
          "zh-TW": "## 先確定預期結果\n這裡沿用 AI 程式設計課的匯出去重函式：按 studentId 保留首條，保持順序，不修改輸入。某個修復採用 Map。先讀程式碼：同一個鍵後面寫入的值會覆蓋前面的值。\n\n測試表應有輸入、準確預期輸出和用例理由。兩條完全一樣的重複記錄，並不能有效檢查“保留首條”，因為留下哪條都看不出區別。讓它們的內容不同，測試才有區分力。\n\n## 修復後重新檢查\n先執行建議修復，再根據失敗結果作限定範圍的修改，並重新執行整組檢查。不能因為測試與程式碼不一致，就直接刪掉失敗測試。\n\n下面只檢查純函式。整合檢查還需要確認應用傳入了正確欄位、實際使用了返回陣列；系統檢查要另行覆蓋服務端重複請求。報告中應把這些層次分清。"
        },
        "advanced": {
          "en": "A reference implementation is not the only correct algorithm. The checks should specify observable properties and include object identity and non-mutation. Explain what integration evidence you would add and why a unit suite cannot validate a database race.",
          "zh-CN": "参考实现不是唯一正确算法。测试应检查外部行为，包括对象引用和输入不变。说明还要补充什么集成证据，以及为什么函数测试无法验证数据库竞争。",
          "zh-TW": "參考實現不是唯一正確演算法。測試應檢查外部行為，包括物件引用和輸入不變。說明還要補充什麼整合證據，以及為什麼函式測試無法驗證資料庫競爭。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Use expected outputs precise enough to distinguish policies.",
          "zh-CN": "先回到案例里的证据。预期输出要能区分不同保留策略。",
          "zh-TW": "先回到案例裡的證據。預期輸出要能區分不同保留策略。"
        },
        "workshop": {
          "title": {
            "en": "Complete the test table",
            "zh-CN": "完成测试表",
            "zh-TW": "完成測試表"
          },
          "brief": {
            "en": "Use the result of the code lab below.",
            "zh-CN": "使用下面代码实验的实际结果。",
            "zh-TW": "使用下面程式碼實驗的實際結果。"
          },
          "questions": [
            {
              "en": "Write a duplicate-ID case with distinguishable records and exact expected output.",
              "zh-CN": "写内容可区分的重复编号用例及准确输出。",
              "zh-TW": "寫內容可區分的重複編號用例及準確輸出。"
            },
            {
              "en": "Write a same-name/different-ID case.",
              "zh-CN": "写同名不同编号的用例。",
              "zh-TW": "寫同名不同編號的用例。"
            },
            {
              "en": "Add one system-level test that this code runner does not perform.",
              "zh-CN": "补一条该代码运行器没有执行的系统测试。",
              "zh-TW": "補一條該程式碼執行器沒有執行的系統測試。"
            }
          ],
          "sample": {
            "en": "A:first, A:second, B must produce A:first, B in that order, retaining the original objects. Two records named Alex with IDs A and B must both remain. At system level, submit concurrent requests for the last ticket and verify only one confirmed allocation exists. The code runner does not perform that concurrency check.",
            "zh-CN": "A:first、A:second、B 必须按顺序得到 A:first、B，并保留原对象。两条姓名均为 Alex、编号为 A 和 B 的记录都应保留。系统层还要并发申请最后一张票，确认最终只产生一个有效分配；代码运行器没有进行该并发检查。",
            "zh-TW": "A:first、A:second、B 必須按順序得到 A:first、B，並保留原物件。兩條姓名均為 Alex、編號為 A 和 B 的記錄都應保留。系統層還要併發申請最後一張票，確認最終只產生一個有效分配；程式碼執行器沒有進行該併發檢查。"
          },
          "rubric": [
            {
              "en": "Use expected outputs precise enough to distinguish policies.",
              "zh-CN": "预期输出要能区分不同保留策略。",
              "zh-TW": "預期輸出要能區分不同保留策略。"
            },
            {
              "en": "Identify a different test layer for concurrency.",
              "zh-CN": "指出并发验证属于另一层测试。",
              "zh-TW": "指出併發驗證屬於另一層測試。"
            }
          ]
        },
        "type": "coding",
        "minutes": 14,
        "starter": "function uniqueBookings(bookings) {\n  return [...new Map(bookings.map(item => [item.studentId, item])).values()];\n}",
        "solution": "function uniqueBookings(bookings) {\n  const seen = new Set();\n  return bookings.filter(booking => {\n    if (seen.has(booking.studentId)) return false;\n    seen.add(booking.studentId);\n    return true;\n  });\n}"
      },
      {
        "id": "t3",
        "title": {
          "en": "Make a release decision under a budget",
          "zh-CN": "在预算限制下决定怎样上线",
          "zh-TW": "在預算限制下決定怎樣上線"
        },
        "body": {
          "en": "## The release meeting\nThe concert has 200 tickets and around 500 student applicants. You have eight implementation credits. Identity checks, duplicate protection, a traffic queue and cancellation handling all cost something. An attractive event page is also requested.\n\nBefore choosing, list the failure each investment addresses. Identity checks address eligibility; deduplication addresses repeated requests; the queue addresses the opening rush; a waitlist reallocates cancelled tickets. No one option substitutes for all the others.\n\n## Use the model carefully\nThe launch exercise uses fixed teaching rules and synthetic numbers. It is a way to compare consequences, not a forecast for a real university event. Investigation reveals the brief; a load test reveals the queue risk. Neither action secretly implements a missing feature.\n\nRun two affordable strategies and compare them. Explain who experiences each remaining failure. The better choice depends on the agreed priorities, so a high total alone is not an adequate release argument.",
          "zh-CN": "## 上线讨论\n演唱会有 200 张票，预计约 500 名学生申请。可用实施预算为八点。身份检查、重复请求保护、排队和取消处理都需要投入，另外有人希望做一个好看的动态活动页。\n\n选择前先列出每项投入防止什么失败：身份检查保证资格，去重防止重复领票，排队处理开放高峰，候补补回取消门票。任何一项都不能代替其他全部措施。\n\n## 正确使用模拟\n上线实验使用固定教学规则和虚构数字，用于比较后果，不是对真实活动的预测。调查只能让你知道需求，压力测试只能暴露排队风险，它们不会悄悄把缺少的功能做好。\n\n尝试两种预算内的方案，比较留下的问题会影响谁。更好的方案取决于已确认的优先级，不能只拿一个总数作为上线理由。",
          "zh-TW": "## 上線討論\n演唱會有 200 張票，預計約 500 名學生申請。可用實施預算為八點。身份檢查、重複請求保護、排隊和取消處理都需要投入，另外有人希望做一個好看的動態活動頁。\n\n選擇前先列出每項投入防止什麼失敗：身份檢查保證資格，去重防止重複領票，排隊處理開放高峰，候補補回取消門票。任何一項都不能代替其他全部措施。\n\n## 正確使用模擬\n上線實驗使用固定教學規則和虛構數字，用於比較後果，不是對真實活動的預測。調查只能讓你知道需求，壓力測試只能暴露排隊風險，它們不會悄悄把缺少的功能做好。\n\n嘗試兩種預算內的方案，比較留下的問題會影響誰。更好的方案取決於已確認的優先順序，不能只拿一個總數作為上線理由。"
        },
        "advanced": {
          "en": "Document the model assumptions and identify sensitivity: arrival pattern, cancellation rate and eligibility mix could change a real decision. The exercise does not model database overselling, operational staffing or legal policy. State which information you would need before applying it outside the lesson.",
          "zh-CN": "记录模型假设及敏感因素：到达模式、取消比例和报名资格构成都可能改变真实决策。练习未模拟数据库超卖、现场工作人员或正式政策。说明应用到现实前还需要哪些信息。",
          "zh-TW": "記錄模型假設及敏感因素：到達模式、取消比例和報名資格構成都可能改變真實決策。練習未模擬資料庫超賣、現場工作人員或正式政策。說明應用到現實前還需要哪些資訊。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Compare different protections and remaining harms.",
          "zh-CN": "先回到案例里的证据。比较保护措施及遗留影响。",
          "zh-TW": "先回到案例裡的證據。比較保護措施及遺留影響。"
        },
        "workshop": {
          "title": {
            "en": "Compare two launch plans",
            "zh-CN": "比较两种上线方案",
            "zh-TW": "比較兩種上線方案"
          },
          "brief": {
            "en": "Open the launch exercise and record two runs. These are simulated results.",
            "zh-CN": "打开上线实验，记录两次运行；结果属于模拟。",
            "zh-TW": "開啟上線實驗，記錄兩次執行；結果屬於模擬。"
          },
          "questions": [
            {
              "en": "Record both selections and the observed outcomes.",
              "zh-CN": "记录两次选择及观察结果。",
              "zh-TW": "記錄兩次選擇及觀察結果。"
            },
            {
              "en": "Explain the most serious remaining failure in each plan.",
              "zh-CN": "解释每种方案最严重的遗留问题。",
              "zh-TW": "解釋每種方案最嚴重的遺留問題。"
            },
            {
              "en": "Recommend one plan and state an assumption that could change your decision.",
              "zh-CN": "推荐一种，并说明哪项假设改变会让你改选。",
              "zh-TW": "推薦一種，並說明哪項假設改變會讓你改選。"
            }
          ],
          "sample": {
            "en": "Example comparison: identity + duplicate + queue costs seven credits and leaves cancellation reallocation unresolved. Identity + duplicate + waitlist costs six and leaves opening-rush timeouts unresolved. Which is acceptable depends on the event’s agreed release priorities. Use your actual displayed counts in your report. Do not copy this comparison as evidence of having run the exercise.",
            "zh-CN": "参考比较：身份＋去重＋排队花七点，仍未处理取消名额补回；身份＋去重＋候补花六点，仍有开放高峰超时风险。能否接受取决于已确认的上线优先级。报告中的数字应使用你实际看到的运行结果，不能把这段参考比较当成已经运行过的证据。",
            "zh-TW": "參考比較：身份＋去重＋排隊花七點，仍未處理取消名額補回；身份＋去重＋候補花六點，仍有開放高峰超時風險。能否接受取決於已確認的上線優先順序。報告中的數字應使用你實際看到的執行結果，不能把這段參考比較當成已經執行過的證據。"
          },
          "rubric": [
            {
              "en": "Compare different protections and remaining harms.",
              "zh-CN": "比较保护措施及遗留影响。",
              "zh-TW": "比較保護措施及遺留影響。"
            },
            {
              "en": "Identify the numbers as model output, not real measurements.",
              "zh-CN": "明确数字来自模型，而非真实测量。",
              "zh-TW": "明確數字來自模型，而非真實測量。"
            }
          ]
        },
        "type": "simulation",
        "minutes": 12
      },
      {
        "id": "t4",
        "title": {
          "en": "Write the release and recovery note",
          "zh-CN": "写清上线与恢复办法",
          "zh-TW": "寫清上線與恢復辦法"
        },
        "body": {
          "en": "## A repair is ready\nThe duplicate-booking function now passes its checks. The release meeting still needs to know whether the server uses it, whether existing duplicates need cleanup, and what will happen if the error returns after deployment.\n\nWrite a release note for the people doing the work: change identifier, scope, evidence, owner, observation and recovery action. A rollback is not always enough. Reverting code will not automatically repair data already duplicated, and a data migration may need its own recovery procedure.\n\n## Watch a defined signal\nFor a pilot, inspect a sample of booking IDs and duplicate-ID counts after opening. Set a threshold that triggers investigation or a pause. Assign someone who can act. “We will monitor closely” is not a procedure.\n\nAfter the release, record what happened and what was learned. Keep timestamps and uncertainty. A useful incident review explains the contributing conditions and the repair; it should not invent a single careless person as the cause.",
          "zh-CN": "## 函数修好了，能直接发布吗\n去重函数已经通过检查，但上线前还需要确认：服务端是否真正使用它，已有重复记录是否要清理，部署后再次出错怎么办。\n\n上线说明是给实际执行的人看的，应包含版本、范围、证据、负责人、观察内容和恢复动作。回滚代码不一定足够，已经重复的数据不会自动恢复，数据迁移可能还需要独立的恢复办法。\n\n## 观察明确的信号\n小范围上线后，可以抽查报名编号并检查重复编号数量。事先约定什么结果触发调查或暂停，并指定能执行的人。“密切关注”本身不是操作步骤。\n\n上线后保留时间、实际结果和不确定处。故障复盘应解释造成问题的条件及修复办法，不能凭空把一个不认真的人当成唯一原因。",
          "zh-TW": "## 函式修好了，能直接釋出嗎\n去重函式已經透過檢查，但上線前還需要確認：服務端是否真正使用它，已有重複記錄是否要清理，部署後再次出錯怎麼辦。\n\n上線說明是給實際執行的人看的，應包含版本、範圍、證據、負責人、觀察內容和恢復動作。回滾程式碼不一定足夠，已經重複的資料不會自動恢復，資料遷移可能還需要獨立的恢復辦法。\n\n## 觀察明確的訊號\n小範圍上線後，可以抽查報名編號並檢查重複編號數量。事先約定什麼結果觸發調查或暫停，並指定能執行的人。“密切關注”本身不是操作步驟。\n\n上線後保留時間、實際結果和不確定處。故障檢討應解釋造成問題的條件及修復辦法，不能憑空把一個不認真的人當成唯一原因。"
        },
        "advanced": {
          "en": "Separate code rollback, schema compatibility and data repair. A release gate should reference reproducible evidence; monitoring thresholds should match the risk and sample size rather than use arbitrary precision.",
          "zh-CN": "区分代码回滚、结构兼容和数据修复。上线条件应指向可复现证据，监控阈值要与风险、样本量相称，不要使用没有依据的精确数字。",
          "zh-TW": "區分程式碼回滾、結構相容和資料修復。上線條件應指向可復現證據，監控閾值要與風險、樣本量相稱，不要使用沒有依據的精確數字。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Match the recovery action to the actual scope.",
          "zh-CN": "先回到案例里的证据。恢复动作要对应实际改动范围。",
          "zh-TW": "先回到案例裡的證據。恢復動作要對應實際改動範圍。"
        },
        "workshop": {
          "title": {
            "en": "Submit a release note",
            "zh-CN": "提交上线说明",
            "zh-TW": "提交上線說明"
          },
          "brief": {
            "en": "The repair affects only export deduplication, not ticket allocation.",
            "zh-CN": "本次修复只影响导出去重，不改变分票。",
            "zh-TW": "本次修復隻影響匯出去重，不改變分票。"
          },
          "questions": [
            {
              "en": "State the scope and verification evidence.",
              "zh-CN": "说明改动范围和验证证据。",
              "zh-TW": "說明改動範圍和驗證證據。"
            },
            {
              "en": "Name the check after deployment and the condition for pausing.",
              "zh-CN": "指定部署后的检查及暂停条件。",
              "zh-TW": "指定部署後的檢查及暫停條件。"
            },
            {
              "en": "Explain what rollback would and would not recover.",
              "zh-CN": "解释回滚能恢复什么、不能恢复什么。",
              "zh-TW": "解釋回滾能恢復什麼、不能恢復什麼。"
            }
          ],
          "sample": {
            "en": "Scope: export retains the first record for each student ID; no allocation rules changed. Evidence: recorded function and integration checks. After release, compare a controlled export against known duplicate and same-name records; pause export use if the result violates the contract. Reverting the exporter restores previous code but does not correct files already downloaded or change stored bookings. Identify who will regenerate affected exports.",
            "zh-CN": "范围：导出按学生编号保留首条，不改变分票规则。证据：保留函数与集成检查结果。发布后用已知重复及同名样本核对导出；若违反约定，暂停使用导出。回退导出代码不能修复已下载文件，也不会修改保存的报名记录。指定谁重新生成受影响文件。",
            "zh-TW": "範圍：匯出按學生編號保留首條，不改變分票規則。證據：保留函式與整合檢查結果。釋出後用已知重複及同名樣本核對匯出；若違反約定，暫停使用匯出。回退匯出程式碼不能修復已下載檔案，也不會修改儲存的報名記錄。指定誰重新生成受影響檔案。"
          },
          "rubric": [
            {
              "en": "Match the recovery action to the actual scope.",
              "zh-CN": "恢复动作要对应实际改动范围。",
              "zh-TW": "恢復動作要對應實際改動範圍。"
            },
            {
              "en": "Give someone a concrete check and an action to take.",
              "zh-CN": "指定具体检查与能够执行的动作。",
              "zh-TW": "指定具體檢查與能夠執行的動作。"
            }
          ]
        },
        "type": "reflection",
        "minutes": 8
      }
    ]
  },
  {
    "id": "product-decisions",
    "title": {
      "en": "Product scope and team communication",
      "zh-CN": "产品范围与团队沟通",
      "zh-TW": "產品範圍與團隊溝通"
    },
    "description": {
      "en": "Negotiate a late change to a campus lunch-ordering service using user needs, delivery effort and operational evidence.",
      "zh-CN": "围绕校园午餐预订的临时变更，综合用户需要、开发成本和运营证据进行协商。",
      "zh-TW": "圍繞校園午餐預訂的臨時變更，綜合使用者需要、開發成本和運營證據進行協商。"
    },
    "outcomes": {
      "en": "Compare conflicting goals; estimate a change as a team; record a scoped decision and a useful handover.",
      "zh-CN": "比较冲突目标，与团队评估变更，形成范围清楚的决定并完成交接。",
      "zh-TW": "比較衝突目標，與團隊評估變更，形成範圍清楚的決定並完成交接。"
    },
    "deliverable": {
      "en": "A change proposal, a stakeholder response and an implementation handover.",
      "zh-CN": "一份变更建议、给相关人员的回复和实施交接说明。",
      "zh-TW": "一份變更建議、給相關人員的回覆和實施交接說明。"
    },
    "prerequisite": {
      "en": "Requirements and stakeholder interviews is recommended.",
      "zh-CN": "建议先完成需求分析与用户访谈。",
      "zh-TW": "建議先完成需求分析與使用者訪談。"
    },
    "topic": "product",
    "theme": "peach",
    "duration": 40,
    "status": "published",
    "source": "built-in",
    "curriculumVersion": 2,
    "lessons": [
      {
        "id": "p1",
        "title": {
          "en": "Find the problem behind the requested feature",
          "zh-CN": "找到功能请求背后的问题",
          "zh-TW": "找到功能請求背後的問題"
        },
        "body": {
          "en": "## Two days before the pilot\nA campus lunch service lets students order before 10:00 for collection at noon. The shop asks for an “edit any time” button because students keep emailing corrections. The cook says preparation starts at 10:00 and changes afterwards cause waste. A developer says unrestricted editing touches payment and stock.\n\nEach person is describing a real concern, but the feature request hides several different changes: editing before the cutoff, changing a paid order, cancelling preparation and refunding money. Estimate them separately.\n\n## Ask about recent corrections\nWere students correcting collection time, quantity, allergens or the menu item? How many requests arrived before preparation started? The answer matters. A clear confirmation screen might prevent some corrections; a pre-cutoff edit window might address others.\n\nDo not decide that the shop is unreasonable or that the developer is obstructive. First make the consequences visible. Then agree which problem the next version will address.",
          "zh-CN": "## 试用前两天\n校园午餐服务要求学生 10:00 前下单，中午取餐。店员提出增加“随时修改”按钮，因为一直收到更正邮件。厨师说 10:00 开始备餐，之后修改会浪费食材；开发者说无限制修改牵涉支付和库存。\n\n三个人都提出了真实顾虑，但“修改订单”包含不同改动：截止前编辑、改已付款订单、取消备餐、退款。不能把它们当成一个很小的按钮一起估算。\n\n## 看看最近的更正\n学生改的是取餐时间、数量、过敏信息还是菜品？多少请求发生在备餐之前？答案不同，方案也不同。更清楚的确认页可能预防部分问题，截止前修改也许能解决另一部分。\n\n先不要说店员不讲理或开发者不配合。把后果摊开，再约定下个版本真正解决哪部分问题。",
          "zh-TW": "## 試用前兩天\n校園午餐服務要求學生 10:00 前下單，中午取餐。店員提出增加“隨時修改”按鈕，因為一直收到更正郵件。廚師說 10:00 開始備餐，之後修改會浪費食材；開發者說無限制修改牽涉支付和庫存。\n\n三個人都提出了真實顧慮，但“修改訂單”包含不同改動：截止前編輯、改已付款訂單、取消備餐、退款。不能把它們當成一個很小的按鈕一起估算。\n\n## 看看最近的更正\n學生改的是取餐時間、數量、過敏資訊還是菜品？多少請求發生在備餐之前？答案不同，方案也不同。更清楚的確認頁可能預防部分問題，截止前修改也許能解決另一部分。\n\n先不要說店員不講理或開發者不配合。把後果攤開，再約定下個版本真正解決哪部分問題。"
        },
        "advanced": {
          "en": "Distinguish a commercial decision, a domain safety rule and an implementation constraint. If allergen changes are involved, the team must agree a safe operational process with the shop rather than inventing health advice or silently permitting changes after preparation.",
          "zh-CN": "区分商业决定、业务安全规则和实现约束。涉及过敏信息变更时，必须与商家确认安全处理流程，不能擅自提供健康判断，也不能悄悄允许备餐后修改。",
          "zh-TW": "區分商業決定、業務安全規則和實現約束。涉及過敏資訊變更時，必須與商家確認安全處理流程，不能擅自提供健康判斷，也不能悄悄允許備餐後修改。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Separate the feature into behaviours with different consequences.",
          "zh-CN": "先回到案例里的证据。拆出后果不同的行为。",
          "zh-TW": "先回到案例裡的證據。拆出後果不同的行為。"
        },
        "workshop": {
          "title": {
            "en": "Prepare the change discussion",
            "zh-CN": "准备变更讨论",
            "zh-TW": "準備變更討論"
          },
          "brief": {
            "en": "Do not commit to unrestricted editing yet.",
            "zh-CN": "先不要承诺无限制修改。",
            "zh-TW": "先不要承諾無限制修改。"
          },
          "questions": [
            {
              "en": "List the different changes hidden inside “edit any time”.",
              "zh-CN": "拆出“随时修改”中隐藏的不同改动。",
              "zh-TW": "拆出“隨時修改”中隱藏的不同改動。"
            },
            {
              "en": "What evidence should you ask the shop for?",
              "zh-CN": "向店员索取什么证据？",
              "zh-TW": "向店員索取什麼證據？"
            },
            {
              "en": "Name one constraint that must be confirmed before release.",
              "zh-CN": "列出上线前必须确认的一项约束。",
              "zh-TW": "列出上線前必須確認的一項約束。"
            }
          ],
          "sample": {
            "en": "Separate pre-cutoff edits, paid-order adjustments, post-preparation changes and refunds. Ask for recent anonymized correction categories and times, including how staff handled each. Confirm the preparation cutoff and handling of sensitive order corrections with the shop. Do not assume a button alone resolves the operational process.",
            "zh-CN": "拆分截止前修改、已付款订单调整、备餐后变更和退款。请店员提供去标识化的近期更正类型、时间及处理方式。与商家确认备餐截止点和敏感订单更正流程。不能假设增加按钮就能解决运营处理。",
            "zh-TW": "拆分截止前修改、已付款訂單調整、備餐後變更和退款。請店員提供去標識化的近期更正型別、時間及處理方式。與商家確認備餐截止點和敏感訂單更正流程。不能假設增加按鈕就能解決運營處理。"
          },
          "rubric": [
            {
              "en": "Separate the feature into behaviours with different consequences.",
              "zh-CN": "拆出后果不同的行为。",
              "zh-TW": "拆出後果不同的行為。"
            },
            {
              "en": "Ask for evidence before estimating the complete solution.",
              "zh-CN": "估算完整方案前先收集证据。",
              "zh-TW": "估算完整方案前先收集證據。"
            }
          ]
        },
        "type": "read",
        "minutes": 8
      },
      {
        "id": "p2",
        "title": {
          "en": "Compare options without hiding the cost",
          "zh-CN": "比较方案，也写清代价",
          "zh-TW": "比較方案，也寫清代價"
        },
        "body": {
          "en": "## The planning numbers\nFor this fictional pilot, the team has six remaining effort units. Confirmation copy costs one, editing unpaid orders before the cutoff costs three, payment adjustments cost four, and post-cutoff changes cost five. Estimates include the stated implementation and checking, but they are not promises.\n\nYou cannot safely add estimates for features that depend on undefined rules. First agree the behaviour. For example, “before 10:00” needs a time boundary and a result for an edit arriving during checkout.\n\n## Compare coherent options\nOption A improves confirmation and supports pre-cutoff unpaid edits. Option B postpones editing and makes staff-assisted correction explicit. Both can be defensible depending on the pilot’s goals. Unrestricted editing consumes more than a small UI change and leaves payment and kitchen procedures unresolved.\n\nWrite the benefit, cost, risk and deferred work for each option. A priority score can help organize discussion, but made-up decimal values should not masquerade as evidence.",
          "zh-CN": "## 本次讨论使用的估算\n假设试用前还剩六个工作量单位：改确认文案需一，截止前编辑未付款订单需三，支付调整需四，截止后变更需五。估算包含约定的实现和检查，但不是绝对承诺。\n\n规则不清楚时，不能只把数字相加。例如“10:00 前可改”还需要明确时间边界，以及编辑与付款同时发生时怎么办。先确认行为，再估算。\n\n## 比较能实际交付的方案\nA 方案改确认页，并允许截止前修改未付款订单；B 方案暂缓编辑，明确由工作人员协助更正的入口。根据试用目的，两者都可能合理。无限制修改牵涉的远不止一个按钮，支付和厨房处理仍有未决规则。\n\n每个方案都写收益、代价、风险和推迟工作。优先级分数可以整理讨论，但不能用没有依据的小数代替证据。",
          "zh-TW": "## 本次討論使用的估算\n假設試用前還剩六個工作量單位：改確認文案需一，截止前編輯未付款訂單需三，支付調整需四，截止後變更需五。估算包含約定的實現和檢查，但不是絕對承諾。\n\n規則不清楚時，不能只把數字相加。例如“10:00 前可改”還需要明確時間邊界，以及編輯與付款同時發生時怎麼辦。先確認行為，再估算。\n\n## 比較能實際交付的方案\nA 方案改確認頁，並允許截止前修改未付款訂單；B 方案暫緩編輯，明確由工作人員協助更正的入口。根據試用目的，兩者都可能合理。無限制修改牽涉的遠不止一個按鈕，支付和廚房處理仍有未決規則。\n\n每個方案都寫收益、代價、風險和推遲工作。優先順序分數可以整理討論，但不能用沒有依據的小數代替證據。"
        },
        "advanced": {
          "en": "Include dependencies and uncertainty in the estimate. A six-unit plan with no capacity for a risky integration may be less credible than a four-unit plan with a specific verification buffer. Document who agreed the scope and what observation would trigger reconsideration.",
          "zh-CN": "估算要说明依赖与不确定性。正好占满六点、没有空间应对高风险集成的方案，可能不如四点加明确验证余量可信。记录谁同意范围，以及什么观察会触发重新讨论。",
          "zh-TW": "估算要說明依賴與不確定性。正好佔滿六點、沒有空間應對高風險整合的方案，可能不如四點加明確驗證餘量可信。記錄誰同意範圍，以及什麼觀察會觸發重新討論。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Make both software and operational costs visible.",
          "zh-CN": "先回到案例里的证据。同时看软件成本和运营成本。",
          "zh-TW": "先回到案例裡的證據。同時看軟體成本和運營成本。"
        },
        "workshop": {
          "title": {
            "en": "Write the options note",
            "zh-CN": "写方案比较",
            "zh-TW": "寫方案比較"
          },
          "brief": {
            "en": "You have six effort units. Use the estimates in the reading.",
            "zh-CN": "剩余六个工作量单位，使用讲解里的估算。",
            "zh-TW": "剩餘六個工作量單位，使用講解裡的估算。"
          },
          "questions": [
            {
              "en": "Compare two feasible options with cost and expected benefit.",
              "zh-CN": "比较两种可行方案，写成本和预期收益。",
              "zh-TW": "比較兩種可行方案，寫成本和預期收益。"
            },
            {
              "en": "Choose one and state what will wait.",
              "zh-CN": "选择一种，说明推迟什么。",
              "zh-TW": "選擇一種，說明推遲什麼。"
            },
            {
              "en": "What must be verified before calling it ready?",
              "zh-CN": "称为可以上线前，必须检查什么？",
              "zh-TW": "稱為可以上線前，必須檢查什麼？"
            }
          ],
          "sample": {
            "en": "Option A: confirmation copy plus pre-cutoff unpaid editing costs four and addresses avoidable errors before preparation. Option B: copy plus an explicit staff correction process costs one in software effort but requires agreed staffing; do not call operational work free. Choose A for a pilot focused on self-service corrections, defer payment and post-cutoff changes, and verify boundary time, ownership and an edit racing with checkout.",
            "zh-CN": "A：确认文案＋截止前未付款编辑需四点，解决备餐前可避免的错误。B：文案＋明确人工更正流程的软件成本为一点，但需要约定人员投入，不能说运营工作免费。若试用重点是自助更正，可选 A，暂缓支付及截止后改动；检查时间边界、订单归属，以及编辑与付款竞争。",
            "zh-TW": "A：確認文案＋截止前未付款編輯需四點，解決備餐前可避免的錯誤。B：文案＋明確人工更正流程的軟體成本為一點，但需要約定人員投入，不能說運營工作免費。若試用重點是自助更正，可選 A，暫緩支付及截止後改動；檢查時間邊界、訂單歸屬，以及編輯與付款競爭。"
          },
          "rubric": [
            {
              "en": "Make both software and operational costs visible.",
              "zh-CN": "同时看软件成本和运营成本。",
              "zh-TW": "同時看軟體成本和運營成本。"
            },
            {
              "en": "Do not promise behaviour whose rule is still undefined.",
              "zh-CN": "规则未定义的行为不能先作承诺。",
              "zh-TW": "規則未定義的行為不能先作承諾。"
            }
          ]
        },
        "type": "scope",
        "minutes": 11
      },
      {
        "id": "p3",
        "title": {
          "en": "Respond to a disappointed stakeholder",
          "zh-CN": "怎样回复对方案不满意的人",
          "zh-TW": "怎樣回覆對方案不滿意的人"
        },
        "body": {
          "en": "## The shop pushes back\n“We asked for editing, not a lecture about scope.” A reply full of technical terminology is unlikely to help. A useful response acknowledges the underlying problem, describes the proposed behaviour and makes the remaining limitation explicit.\n\nFor example: “We can let students correct unpaid orders before 10:00. After that, preparation may have started, so the pilot will direct them to staff rather than confirm an automatic change. We will record the correction requests to see what remains unresolved.”\n\n## Leave room for an answer\nAsk whether that boundary addresses the main recent cases. If it does not, ask which cases would still fail and bring them back to the team. Negotiation is not repeating the same decision more forcefully.\n\nThe extracts below let you rehearse with the shop, kitchen and developer. The live AI option, when connected, can take the relevant role. Its suggestions still need checking against the agreed case rules.",
          "zh-CN": "## 店员不同意\n“我们要的是能修改，不是听你讲范围。”这时堆技术术语通常没有帮助。回复应承认原本的问题，说明准备提供的行为，并把剩余限制说清楚。\n\n例如：“我们可以先让学生在 10:00 前修改未付款订单。之后可能已开始备餐，试用版会引导联系工作人员，不会自动承诺改动成功。我们会记录更正请求，再看还有哪些问题没解决。”\n\n## 留出回应的余地\n继续问：这条边界能不能解决最近最常见的情况？如果不能，哪些情况仍然会失败？把它带回团队讨论。协商不是更强硬地重复原来的决定。\n\n下面的摘录分别来自店员、厨房和开发者，均为练习材料。接通实时 AI 后可进行角色练习，但它的建议仍要依据已确认规则核对。",
          "zh-TW": "## 店員不同意\n“我們要的是能修改，不是聽你講範圍。”這時堆技術術語通常沒有幫助。回覆應承認原本的問題，說明準備提供的行為，並把剩餘限制說清楚。\n\n例如：“我們可以先讓學生在 10:00 前修改未付款訂單。之後可能已開始備餐，試用版會引導聯絡工作人員，不會自動承諾改動成功。我們會記錄更正請求，再看還有哪些問題沒解決。”\n\n## 留出回應的餘地\n繼續問：這條邊界能不能解決最近最常見的情況？如果不能，哪些情況仍然會失敗？把它帶回團隊討論。協商不是更強硬地重複原來的決定。\n\n下面的摘錄分別來自店員、廚房和開發者，均為練習材料。接通實時 AI 後可進行角色練習，但它的建議仍要依據已確認規則核對。"
        },
        "advanced": {
          "en": "Translate a technical risk into an observable operational consequence without exaggerating certainty. Explicitly distinguish a proposal from a commitment, and close the conversation with the decision owner and a review point.",
          "zh-CN": "把技术风险转成可观察的运营后果，不夸大确定性。区分建议与承诺，并说明由谁决定、什么时候复查。",
          "zh-TW": "把技術風險轉成可觀察的運營後果，不誇大確定性。區分建議與承諾，並說明由誰決定、什麼時候複查。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Use language the recipient understands.",
          "zh-CN": "先回到案例里的证据。使用接收者能理解的语言。",
          "zh-TW": "先回到案例裡的證據。使用接收者能理解的語言。"
        },
        "workshop": {
          "title": {
            "en": "Draft the stakeholder reply",
            "zh-CN": "起草给相关人员的回复",
            "zh-TW": "起草給相關人員的回覆"
          },
          "brief": {
            "en": "Write a reply the shop can act on, not an internal technical memo.",
            "zh-CN": "写店员能据此行动的回复，不要写成内部技术备忘录。",
            "zh-TW": "寫店員能據此行動的回覆，不要寫成內部技術備忘錄。"
          },
          "questions": [
            {
              "en": "Acknowledge the original difficulty in one sentence.",
              "zh-CN": "用一句话回应原来的困难。",
              "zh-TW": "用一句話回應原來的困難。"
            },
            {
              "en": "Explain the proposed boundary and the help available outside it.",
              "zh-CN": "说明建议范围，以及范围外怎样获得帮助。",
              "zh-TW": "說明建議範圍，以及範圍外怎樣獲得幫助。"
            },
            {
              "en": "Ask a question that could change the proposed decision.",
              "zh-CN": "提出一个可能改变方案的问题。",
              "zh-TW": "提出一個可能改變方案的問題。"
            }
          ],
          "sample": {
            "en": "We understand staff are spending time correcting orders by email. We propose letting students edit unpaid orders before 10:00; later corrections will go to staff because preparation or payment may already be committed. We will show this boundary before submission. Of last week’s corrections, which would still fail under this arrangement? Let us review those cases with the kitchen before confirming the pilot scope.",
            "zh-CN": "我们理解店员正在花时间处理更正邮件。建议先支持 10:00 前修改未付款订单；之后可能已经备餐或付款，交给工作人员处理，并在提交前写清边界。上周的更正里，哪些在这个方案下仍然无法处理？我们想与厨房一起看这些情况，再确认试用范围。",
            "zh-TW": "我們理解店員正在花時間處理更正郵件。建議先支援 10:00 前修改未付款訂單；之後可能已經備餐或付款，交給工作人員處理，並在提交前寫清邊界。上週的更正裡，哪些在這個方案下仍然無法處理？我們想與廚房一起看這些情況，再確認試用範圍。"
          },
          "rubric": [
            {
              "en": "Use language the recipient understands.",
              "zh-CN": "使用接收者能理解的语言。",
              "zh-TW": "使用接收者能理解的語言。"
            },
            {
              "en": "Include a real invitation to reconsider evidence.",
              "zh-CN": "留出根据新证据调整方案的机会。",
              "zh-TW": "留出根據新證據調整方案的機會。"
            }
          ]
        },
        "type": "conversation",
        "minutes": 12,
        "interview": [
          {
            "person": {
              "en": "Shop assistant",
              "zh-CN": "店员",
              "zh-TW": "店員"
            },
            "question": {
              "en": "Which corrections arrive most often?",
              "zh-CN": "最常见的更正是什么？",
              "zh-TW": "最常見的更正是什麼？"
            },
            "answer": {
              "en": "Most are quantity changes before 09:30. A few arrive after preparation. We currently reply manually and sometimes miss the first message.",
              "zh-CN": "大部分是 09:30 前改数量，也有少数发生在备餐后。现在靠手动回复，有时漏看第一封邮件。",
              "zh-TW": "大部分是 09:30 前改數量，也有少數發生在備餐後。現在靠手動回覆，有時漏看第一封郵件。"
            }
          },
          {
            "person": {
              "en": "Kitchen lead",
              "zh-CN": "厨房负责人",
              "zh-TW": "廚房負責人"
            },
            "question": {
              "en": "What does a late change affect?",
              "zh-CN": "较晚的修改会影响什么？",
              "zh-TW": "較晚的修改會影響什麼？"
            },
            "answer": {
              "en": "At 10:00 we start grouping meals. A change might already be packed. Staff must confirm what can be changed; the website should not promise it automatically.",
              "zh-CN": "10:00 开始分装，有些订单可能已经打包。能否更改要由工作人员确认，网页不能自动承诺。",
              "zh-TW": "10:00 開始分裝，有些訂單可能已經打包。能否更改要由工作人員確認，網頁不能自動承諾。"
            }
          },
          {
            "person": {
              "en": "Developer",
              "zh-CN": "开发者",
              "zh-TW": "開發者"
            },
            "question": {
              "en": "What is the smallest coherent change?",
              "zh-CN": "最小而完整的改动是什么？",
              "zh-TW": "最小而完整的改動是什麼？"
            },
            "answer": {
              "en": "Unpaid edits before the cutoff are manageable if we check ownership and re-read order status on save. Paid edits need an agreed payment adjustment process.",
              "zh-CN": "截止前改未付款订单可以做，但保存时要检查归属并重新读取状态。改已付款订单还缺支付调整流程。",
              "zh-TW": "截止前改未付款訂單可以做，但儲存時要檢查歸屬並重新讀取狀態。改已付款訂單還缺支付調整流程。"
            }
          }
        ]
      },
      {
        "id": "p4",
        "title": {
          "en": "Hand over the decision to the team",
          "zh-CN": "把决定交接给实施团队",
          "zh-TW": "把決定交接給實施團隊"
        },
        "body": {
          "en": "## A decision needs an owner and a record\nAfter the meeting, one person remembers “editing approved”; another remembers “only before 10:00”. Write the decision while the agreement is fresh. Include the scope, rationale, exceptions, open questions and acceptance examples.\n\nFor this pilot, the proposed behaviour is editing unpaid orders before 10:00. A student may edit only their own order. At or after 10:00, or after payment, the service gives the staff-contact route. Saving an edit must recheck the current order state.\n\n## Make the work reviewable\nSeparate the interface copy, server rule and verification tasks. Agree who reviews each. Keep changes small enough that another developer can understand them; a task with no expected result is difficult to review.\n\nWhen two people change the same behaviour, compare the intended rules before resolving the code difference. A merge that removes the conflict markers can still combine incompatible decisions.",
          "zh-CN": "## 决定需要记录和负责人\n会议结束后，一个人记得“同意编辑”，另一个人记得“仅限 10:00 前”。趁约定还清楚，记录范围、理由、例外、待决问题和验收例子。\n\n本次试用拟支持：学生只修改自己的未付款订单，且必须在 10:00 前；到达截止点或已经付款时，转为联系工作人员；保存时重新检查订单最新状态。\n\n## 把工作拆到可以审查\n分别安排界面说明、服务端规则和验证任务，并约定谁审查。改动小到别人看得懂，才便于合作。没有预期结果的任务，很难判断有没有完成。\n\n如果两人同时改同一行为，先比较各自理解的规则，再处理代码差异。去掉冲突标记并不意味着两个相互矛盾的决定已经被正确整合。",
          "zh-TW": "## 決定需要記錄和負責人\n會議結束後，一個人記得“同意編輯”，另一個人記得“僅限 10:00 前”。趁約定還清楚，記錄範圍、理由、例外、待決問題和驗收例子。\n\n本次試用擬支援：學生只修改自己的未付款訂單，且必須在 10:00 前；到達截止點或已經付款時，轉為聯絡工作人員；儲存時重新檢查訂單最新狀態。\n\n## 把工作拆到可以審查\n分別安排介面說明、服務端規則和驗證任務，並約定誰審查。改動小到別人看得懂，才便於合作。沒有預期結果的任務，很難判斷有沒有完成。\n\n如果兩人同時改同一行為，先比較各自理解的規則，再處理程式碼差異。去掉衝突標記並不意味著兩個相互矛盾的決定已經被正確整合。"
        },
        "advanced": {
          "en": "Include version-control review evidence: a task linked to the agreed rule, a bounded change, independent review and checks. Explain how you would handle a paid-status change arriving between read and save. Do not hide concurrency behind a front-end cutoff.",
          "zh-CN": "加入版本协作证据：任务对应哪条约定、小范围改动、独立审查及检查结果。说明读取后到保存前付款状态改变时怎么办，不能只靠前端截止时间处理并发。",
          "zh-TW": "加入版本協作證據：任務對應哪條約定、小範圍改動、獨立審查及檢查結果。說明讀取後到儲存前付款狀態改變時怎麼辦，不能只靠前端截止時間處理併發。"
        },
        "hint": {
          "en": "Start with the evidence in the case. The handover must preserve the negotiated boundary.",
          "zh-CN": "先回到案例里的证据。交接不能丢掉协商好的边界。",
          "zh-TW": "先回到案例裡的證據。交接不能丟掉協商好的邊界。"
        },
        "workshop": {
          "title": {
            "en": "Write the implementation handover",
            "zh-CN": "编写实施交接",
            "zh-TW": "編寫實施交接"
          },
          "brief": {
            "en": "Treat the proposed pre-cutoff rule as agreed for this exercise.",
            "zh-CN": "本练习假设截止前修改规则已经同意。",
            "zh-TW": "本練習假設截止前修改規則已經同意。"
          },
          "questions": [
            {
              "en": "Write the final rule and two acceptance examples.",
              "zh-CN": "写最终规则和两个验收例子。",
              "zh-TW": "寫最終規則和兩個驗收例子。"
            },
            {
              "en": "Split the work into implementation and independent checking tasks.",
              "zh-CN": "拆出实施任务与独立检查任务。",
              "zh-TW": "拆出實施任務與獨立檢查任務。"
            },
            {
              "en": "Name an open question and who must resolve it.",
              "zh-CN": "列出一个待决问题，以及谁负责确认。",
              "zh-TW": "列出一個待決問題，以及誰負責確認。"
            }
          ],
          "sample": {
            "en": "Rule: only the owner may edit an unpaid order before 10:00, rechecking current status on save. At 09:59 an unpaid owner edit succeeds; at 10:00 it is rejected with the staff-contact route. Assign server enforcement, interface messaging and a separately reviewed boundary/ownership test set. The shop still owns the policy for post-payment corrections; do not implement an invented refund rule.",
            "zh-CN": "规则：本人可在 10:00 前修改未付款订单，保存时重新检查状态。09:59 未付款且本人操作成功；10:00 拒绝并给出联系工作人员入口。分别安排服务端约束、界面说明及独立审查的边界／归属测试。已付款更正政策仍由商家确认，不能自行实现退款规则。",
            "zh-TW": "規則：本人可在 10:00 前修改未付款訂單，儲存時重新檢查狀態。09:59 未付款且本人操作成功；10:00 拒絕並給出聯絡工作人員入口。分別安排服務端約束、介面說明及獨立審查的邊界／歸屬測試。已付款更正政策仍由商家確認，不能自行實現退款規則。"
          },
          "rubric": [
            {
              "en": "The handover must preserve the negotiated boundary.",
              "zh-CN": "交接不能丢掉协商好的边界。",
              "zh-TW": "交接不能丟掉協商好的邊界。"
            },
            {
              "en": "Include independent checking and a named policy owner.",
              "zh-CN": "包含独立检查及政策确认者。",
              "zh-TW": "包含獨立檢查及政策確認者。"
            }
          ]
        },
        "type": "read",
        "minutes": 9
      }
    ]
  },
  {
    "id": "career",
    "title": {
      "en": "Explaining your work in a technical interview",
      "zh-CN": "在技术面试中讲清自己的工作",
      "zh-TW": "在技術面試中講清自己的工作"
    },
    "description": {
      "en": "Prepare an evidence-based project explanation and practise follow-up questions about design, tests and AI assistance.",
      "zh-CN": "用证据准备项目介绍，练习回答设计、测试及 AI 协助方面的追问。",
      "zh-TW": "用證據準備專案介紹，練習回答設計、測試及 AI 協助方面的追問。"
    },
    "outcomes": {
      "en": "Give a bounded account of your contribution; explain a trade-off; respond honestly when evidence is missing.",
      "zh-CN": "准确说明个人贡献，解释设计取舍，在缺少证据时如实回应。",
      "zh-TW": "準確說明個人貢獻，解釋設計取捨，在缺少證據時如實回應。"
    },
    "deliverable": {
      "en": "A project case note, a written mock interview and a revision record.",
      "zh-CN": "一份项目案例说明、书面模拟面试及修改记录。",
      "zh-TW": "一份專案案例說明、書面模擬面試及修改記錄。"
    },
    "prerequisite": {
      "en": "Bring one completed exercise or a project you can explain. Recommended after the AI coding course.",
      "zh-CN": "带一份已完成练习或能解释的项目，建议在 AI 编程课后学习。",
      "zh-TW": "帶一份已完成練習或能解釋的專案，建議在 AI 程式設計課後學習。"
    },
    "topic": "product",
    "theme": "peach",
    "duration": 39,
    "status": "published",
    "source": "built-in",
    "curriculumVersion": 2,
    "lessons": [
      {
        "id": "c1",
        "title": {
          "en": "Choose a project you can explain",
          "zh-CN": "选一个你能解释清楚的项目",
          "zh-TW": "選一個你能解釋清楚的專案"
        },
        "body": {
          "en": "## Start with one change\nAn interviewer asks, “Tell me about something you built.” A list of frameworks gives little evidence of your work. Choose one user problem and a change you can explain: what was wrong, what you changed, how you checked it and what remains uncertain.\n\nYou may use the booking export exercise as a practice example, but describe it as a course exercise. Do not present fictional users or simulated outcomes as a production deployment.\n\n## Keep contribution specific\n“We built the system” can be true but does not identify your role. State which requirement, implementation or check you owned, what another person or AI assistant contributed, and where you reviewed that contribution.\n\nA concise explanation can name the problem, your action, evidence and limitation in four sentences. Details come in the follow-up. Avoid opening with a claim that the project was revolutionary or perfectly secure; those claims are difficult to support and distract from the work.",
          "zh-CN": "## 从一个改动开始\n面试官问“说说你做过的项目”，罗列框架并不能说明你的工作。选一个能够解释清楚的用户问题和改动：原来哪里不对，你改了什么，怎样检查，还有什么不确定。\n\n可以用报名导出去重作为练习案例，但要说明它是课程练习，不能把虚构用户或模拟结果说成真实上线经历。\n\n## 具体说明贡献\n“我们做了整个系统”可能属实，却看不出你的工作。说清由你负责哪项需求、实现或检查，其他人或 AI 提供了什么，以及你怎样审查这些内容。\n\n可以先用四句话分别交代问题、行动、证据和局限，细节留给追问。无需开场就说项目具有突破性或绝对安全；这些主张难以支持，反而会遮住具体工作。",
          "zh-TW": "## 從一個改動開始\n面試官問“說說你做過的專案”，羅列框架並不能說明你的工作。選一個能夠解釋清楚的使用者問題和改動：原來哪裡不對，你改了什麼，怎樣檢查，還有什麼不確定。\n\n可以用報名匯出去重作為練習案例，但要說明它是課程練習，不能把虛構使用者或模擬結果說成真實上線經歷。\n\n## 具體說明貢獻\n“我們做了整個系統”可能屬實，卻看不出你的工作。說清由你負責哪項需求、實現或檢查，其他人或 AI 提供了什麼，以及你怎樣審查這些內容。\n\n可以先用四句話分別交代問題、行動、證據和侷限，細節留給追問。無需開場就說專案具有突破性或絕對安全；這些主張難以支援，反而會遮住具體工作。"
        },
        "advanced": {
          "en": "Prepare a change reference, the contract and one failing/passing example. Distinguish team ownership from individual contribution. If the work was not deployed, say what environment was used and which production questions remain.",
          "zh-CN": "准备改动记录、行为约定和一组修复前后例子。区分团队成果与个人贡献。没有真实部署时，说明使用环境及尚未验证的生产问题。",
          "zh-TW": "準備改動記錄、行為約定和一組修復前後例子。區分團隊成果與個人貢獻。沒有真實部署時，說明使用環境及尚未驗證的生產問題。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Label the setting and scope accurately.",
          "zh-CN": "先回到案例里的证据。准确标明场景和范围。",
          "zh-TW": "先回到案例裡的證據。準確標明場景和範圍。"
        },
        "workshop": {
          "title": {
            "en": "Write a four-sentence project account",
            "zh-CN": "写四句话项目介绍",
            "zh-TW": "寫四句話專案介紹"
          },
          "brief": {
            "en": "Use your own project or clearly label a course exercise.",
            "zh-CN": "可以使用自己的项目，也可以明确标注课程练习。",
            "zh-TW": "可以使用自己的專案，也可以明確標註課程練習。"
          },
          "questions": [
            {
              "en": "What problem and user task did you address?",
              "zh-CN": "解决了什么问题，涉及哪项用户任务？",
              "zh-TW": "解決了什麼問題，涉及哪項使用者任務？"
            },
            {
              "en": "What did you personally change, and what assistance did you use?",
              "zh-CN": "你具体改了什么，使用了哪些协助？",
              "zh-TW": "你具體改了什麼，使用了哪些協助？"
            },
            {
              "en": "What evidence and limitation would you mention first?",
              "zh-CN": "首先展示什么证据，并说明什么局限？",
              "zh-TW": "首先展示什麼證據，並說明什麼侷限？"
            }
          ],
          "sample": {
            "en": "In a course exercise, a booking export kept duplicate student records. I specified first-occurrence semantics and repaired the in-memory function with assistance from a coding tool. I checked repeated IDs, same-name students, empty input and input immutability. This was a function exercise; it did not test production ticket allocation or database concurrency.",
            "zh-CN": "在一项课程练习中，报名导出包含重复学生记录。我明确了保留首次记录的规则，并在编程工具协助下修复内存函数。我检查了重复编号、同名学生、空输入和输入不变。这是函数练习，没有验证生产分票和数据库并发。",
            "zh-TW": "在一項課程練習中，報名匯出包含重復學生記錄。我明確了保留首次記錄的規則，並在程式設計工具協助下修復記憶體函式。我檢查了重複編號、同名學生、空輸入和輸入不變。這是函式練習，沒有驗證生產分票和資料庫併發。"
          },
          "rubric": [
            {
              "en": "Label the setting and scope accurately.",
              "zh-CN": "准确标明场景和范围。",
              "zh-TW": "準確標明場景和範圍。"
            },
            {
              "en": "Use an action and evidence, not a list of tools.",
              "zh-CN": "讲行动与证据，不只列工具。",
              "zh-TW": "講行動與證據，不只列工具。"
            }
          ]
        },
        "type": "read",
        "minutes": 7
      },
      {
        "id": "c2",
        "title": {
          "en": "Answer a follow-up about your design",
          "zh-CN": "回答设计取舍的追问",
          "zh-TW": "回答設計取捨的追問"
        },
        "body": {
          "en": "## The follow-up\n“Why did you use a Set?” Naming a data structure is not an explanation. Connect the choice to the contract: we need to remember IDs already seen while preserving the first original object and input order.\n\nCompare one alternative. Repeatedly searching earlier input is straightforward but may do more work as the array grows. A Map can also solve the task if it only inserts unseen IDs; replacing every value would keep the last record instead.\n\n## Do not overclaim\nSaying “Sets are always faster” ignores input size, implementation and the operation being measured. Explain the expected behaviour and complexity under the assumptions of this exercise. If you did not benchmark, do not describe a measured speedup.\n\nWhen asked about a choice you inherited, say so. You can still explain its consequences and what you would investigate. Understanding an inherited decision is different from claiming that you originally made it.",
          "zh-CN": "## 面试官追问\n“为什么使用 Set？”报出数据结构名称还不够，要把它与约定联系起来：记录已经出现的编号，同时保留首次原对象和输入顺序。\n\n比较一种替代办法。反复搜索之前的输入比较直观，但数组变长时可能做更多重复工作。Map 也能完成任务，只要遇到已有编号时不覆盖；如果每次替换值，就会保留末条。\n\n## 不要夸大\n“Set 一定更快”忽略了输入大小、具体实现及测量的操作。解释本题假设下的行为和复杂度即可；没有做基准测试，就不能声称测出了多少倍加速。\n\n如果选择是接手时已有的，就如实说明。仍然可以分析后果和需要进一步调查的地方。能理解一个继承来的设计，不等于最初作出了那个决定。",
          "zh-TW": "## 面試官追問\n“為什麼使用 Set？”報出資料結構名稱還不夠，要把它與約定聯絡起來：記錄已經出現的編號，同時保留首次原物件和輸入順序。\n\n比較一種替代辦法。反覆搜尋之前的輸入比較直觀，但陣列變長時可能做更多重複工作。Map 也能完成任務，只要遇到已有編號時不覆蓋；如果每次替換值，就會保留末條。\n\n## 不要誇大\n“Set 一定更快”忽略了輸入大小、具體實現及測量的操作。解釋本題假設下的行為和複雜度即可；沒有做基準測試，就不能聲稱測出了多少倍加速。\n\n如果選擇是接手時已有的，就如實說明。仍然可以分析後果和需要進一步調查的地方。能理解一個繼承來的設計，不等於最初作出了那個決定。"
        },
        "advanced": {
          "en": "Discuss expected O(n) work and O(k) auxiliary storage for k distinct IDs, while noting that specification-level guarantees differ from implementation performance. Explain why object identity and ordering are contract concerns, not merely optimizations.",
          "zh-CN": "可以讨论预期 O(n) 工作量和 k 个不同编号所需的 O(k) 辅助空间，同时区分规范保证与具体实现性能。对象引用和顺序属于行为约定，不只是优化。",
          "zh-TW": "可以討論預期 O(n) 工作量和 k 個不同編號所需的 O(k) 輔助空間，同時區分規範保證與具體實現效能。物件引用和順序屬於行為約定，不只是最佳化。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Compare behaviour before comparing performance.",
          "zh-CN": "先回到案例里的证据。先比较行为，再比较性能。",
          "zh-TW": "先回到案例裡的證據。先比較行為，再比較效能。"
        },
        "workshop": {
          "title": {
            "en": "Prepare a design answer",
            "zh-CN": "准备设计回答",
            "zh-TW": "準備設計回答"
          },
          "brief": {
            "en": "Explain a decision from your own implementation or the course function.",
            "zh-CN": "解释自己实现或课程函数中的一个决定。",
            "zh-TW": "解釋自己實現或課程函式中的一個決定。"
          },
          "questions": [
            {
              "en": "Connect the choice to a requirement.",
              "zh-CN": "把选择与一条需求联系起来。",
              "zh-TW": "把選擇與一條需求聯絡起來。"
            },
            {
              "en": "Compare a viable alternative and its consequence.",
              "zh-CN": "比较一种可行替代办法及其后果。",
              "zh-TW": "比較一種可行替代辦法及其後果。"
            },
            {
              "en": "What have you not measured or verified?",
              "zh-CN": "还有什么没有测量或验证？",
              "zh-TW": "還有什麼沒有測量或驗證？"
            }
          ],
          "sample": {
            "en": "A Set records seen student IDs so I can retain the first original record without sorting. A Map also works if it inserts only unseen IDs; unconditional replacement would violate first occurrence. The approach is expected linear in the number of input records with storage for distinct IDs, but I did not benchmark a particular runtime or production dataset.",
            "zh-CN": "Set 记录已经见过的学生编号，让我在不排序的前提下保留首条原记录。Map 只插入未见编号也可行；无条件覆盖会违反保留首次规则。方法预期按记录数线性处理，并保存不同编号，但我没有对某个运行时或生产数据集做基准测试。",
            "zh-TW": "Set 記錄已經見過的學生編號，讓我在不排序的前提下保留首條原記錄。Map 只插入未見編號也可行；無條件覆蓋會違反保留首次規則。方法預期按記錄數線性處理，並儲存不同編號，但我沒有對某個執行時或生產資料集做基準測試。"
          },
          "rubric": [
            {
              "en": "Compare behaviour before comparing performance.",
              "zh-CN": "先比较行为，再比较性能。",
              "zh-TW": "先比較行為，再比較效能。"
            },
            {
              "en": "Separate an expectation from a measured result.",
              "zh-CN": "区分预期分析与测量结果。",
              "zh-TW": "區分預期分析與測量結果。"
            }
          ]
        },
        "type": "read",
        "minutes": 9
      },
      {
        "id": "c3",
        "title": {
          "en": "Practise questions that need evidence",
          "zh-CN": "练习需要拿出证据的追问",
          "zh-TW": "練習需要拿出證據的追問"
        },
        "body": {
          "en": "## A short mock interview\nUse the prompts below one at a time. Write an answer before opening the suggested follow-up. Treat the follow-up as a way to examine the answer, not a script to memorize.\n\nThe interviewer may ask: what input broke the earlier version? How do you know the repair preserved the first record? What happens if two requests reach the server together? Which part did AI draft, and which part did you verify?\n\n## When you do not know\nIf a question goes beyond your evidence, state what you do know and propose a check. “I have not tested the server race. I would submit concurrent requests for the last place and inspect the final allocations” is more informative than guessing that the Set makes it safe.\n\nA practice interview should reveal where your explanation needs work. It is not a hiring decision or an objective measurement of employability. The review checklist is qualitative and tied to the evidence in your answer.",
          "zh-CN": "## 一次简短模拟面试\n逐个使用下面的问题。先写回答，再展开参考追问。追问用于检查你的回答，不是让你背诵一份标准台词。\n\n面试官可能问：旧版本被什么输入弄错？怎样确认保留了首条？两个请求同时到服务端会怎样？AI 起草哪部分，你检查哪部分？\n\n## 不知道时怎么答\n如果问题超出已有证据，说明知道什么，再提出检查办法。“服务端竞争还没测试，我会并发申请最后一个名额，再检查最终分配”比猜测 Set 让整个系统安全更有用。\n\n模拟面试是为了发现表达中的空缺，不是招聘决定，也不是对就业能力的客观分数。自查清单只围绕回答中有没有清楚说明证据。",
          "zh-TW": "## 一次簡短模擬面試\n逐個使用下面的問題。先寫回答，再展開參考追問。追問用於檢查你的回答，不是讓你背誦一份標準臺詞。\n\n面試官可能問：舊版本被什麼輸入弄錯？怎樣確認保留了首條？兩個請求同時到服務端會怎樣？AI 起草哪部分，你檢查哪部分？\n\n## 不知道時怎麼答\n如果問題超出已有證據，說明知道什麼，再提出檢查辦法。“服務端競爭還沒測試，我會併發申請最後一個名額，再檢查最終分配”比猜測 Set 讓整個系統安全更有用。\n\n模擬面試是為了發現表達中的空缺，不是招聘決定，也不是對就業能力的客觀分數。自查清單隻圍繞回答中有沒有清楚說明證據。"
        },
        "advanced": {
          "en": "For a system-design follow-up, clarify workload, consistency and failure assumptions before naming a component. For an implementation follow-up, explain the exact path or counterexample. Switching to generic architecture vocabulary does not answer a question about the code you showed.",
          "zh-CN": "系统设计追问先澄清负载、一致性和失败假设，再谈组件；实现追问应解释具体路径或反例。突然堆系统架构术语，不能回答刚展示的代码问题。",
          "zh-TW": "系統設計追問先澄清負載、一致性和失敗假設，再談元件；實現追問應解釋具體路徑或反例。突然堆系統架構術語，不能回答剛展示的程式碼問題。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Give a counterexample someone can inspect.",
          "zh-CN": "先回到案例里的证据。给出别人能检查的反例。",
          "zh-TW": "先回到案例裡的證據。給出別人能檢查的反例。"
        },
        "workshop": {
          "title": {
            "en": "Complete the written mock interview",
            "zh-CN": "完成书面模拟面试",
            "zh-TW": "完成書面模擬面試"
          },
          "brief": {
            "en": "Choose three prompts below; answer them using work you can substantiate.",
            "zh-CN": "选择下面三个问题，用能够说明依据的工作回答。",
            "zh-TW": "選擇下面三個問題，用能夠說明依據的工作回答。"
          },
          "questions": [
            {
              "en": "Explain one defect and the smallest counterexample.",
              "zh-CN": "解释一个缺陷及最小反例。",
              "zh-TW": "解釋一個缺陷及最小反例。"
            },
            {
              "en": "Explain one design choice and an alternative.",
              "zh-CN": "解释一个设计选择及替代方案。",
              "zh-TW": "解釋一個設計選擇及替代方案。"
            },
            {
              "en": "Describe the help you used, your verification and one unanswered question.",
              "zh-CN": "说明使用的协助、自己的验证及一个尚未回答的问题。",
              "zh-TW": "說明使用的協助、自己的驗證及一個尚未回答的問題。"
            }
          ],
          "sample": {
            "en": "A strong answer names the first/last-record distinction and shows two records with the same ID but different details; compares a Set with a correctly used Map; and separates function checks from server guarantees. It identifies actual AI assistance without treating the generated explanation as evidence. There is no single required wording. If you use a personal project, your evidence should replace this example.",
            "zh-CN": "好的回答会点明首条与末条的区别，展示相同编号、不同内容的两条记录；比较 Set 与正确使用的 Map；区分函数测试和服务端保证。如实说明 AI 协助，不把生成的解释当作验证。没有唯一规定措辞。使用个人项目时，应换成自己的证据。",
            "zh-TW": "好的回答會點明首條與末條的區別，展示相同編號、不同內容的兩條記錄；比較 Set 與正確使用的 Map；區分函式測試和服務端保證。如實說明 AI 協助，不把生成的解釋當作驗證。沒有唯一規定措辭。使用個人專案時，應換成自己的證據。"
          },
          "rubric": [
            {
              "en": "Give a counterexample someone can inspect.",
              "zh-CN": "给出别人能检查的反例。",
              "zh-TW": "給出別人能檢查的反例。"
            },
            {
              "en": "Acknowledge an evidence gap and propose a relevant check.",
              "zh-CN": "承认证据空缺，并提出对应检查。",
              "zh-TW": "承認證據空缺，並提出對應檢查。"
            }
          ]
        },
        "type": "conversation",
        "minutes": 15,
        "mockInterview": true,
        "interview": [
          {
            "person": {
              "en": "Interviewer",
              "zh-CN": "面试官",
              "zh-TW": "面試官"
            },
            "question": {
              "en": "What exactly was wrong with the earlier implementation?",
              "zh-CN": "旧实现具体哪里不对？",
              "zh-TW": "舊實現具體哪裡不對？"
            },
            "answer": {
              "en": "Follow-up: show the smallest input on which it fails, then state the expected output before describing the fix.",
              "zh-CN": "参考追问：展示最小失败输入，先给预期输出，再解释修复。",
              "zh-TW": "參考追問：展示最小失敗輸入，先給預期輸出，再解釋修復。"
            }
          },
          {
            "person": {
              "en": "Interviewer",
              "zh-CN": "面试官",
              "zh-TW": "面試官"
            },
            "question": {
              "en": "Why did you choose this approach rather than a Map?",
              "zh-CN": "为什么采用这个办法，而不是 Map？",
              "zh-TW": "為什麼採用這個辦法，而不是 Map？"
            },
            "answer": {
              "en": "Follow-up: a Map can also work. Explain which use of it changes the first-occurrence contract, and avoid claiming a benchmark you did not run.",
              "zh-CN": "参考追问：Map 也可以正确实现。说明哪种用法改变了首条约定，不要声称没有测过的性能结果。",
              "zh-TW": "參考追問：Map 也可以正確實現。說明哪種用法改變了首條約定，不要聲稱沒有測過的效能結果。"
            }
          },
          {
            "person": {
              "en": "Interviewer",
              "zh-CN": "面试官",
              "zh-TW": "面試官"
            },
            "question": {
              "en": "Does this stop two people booking the last ticket?",
              "zh-CN": "这能阻止两个人抢到最后一张票吗？",
              "zh-TW": "這能阻止兩個人搶到最後一張票嗎？"
            },
            "answer": {
              "en": "Follow-up: distinguish export cleanup from server allocation. What concurrency check and storage guarantee would you need?",
              "zh-CN": "参考追问：区分导出清理和服务端分票，需要什么并发检查及存储保证？",
              "zh-TW": "參考追問：區分匯出清理和服務端分票，需要什麼併發檢查及儲存保證？"
            }
          },
          {
            "person": {
              "en": "Interviewer",
              "zh-CN": "面试官",
              "zh-TW": "面試官"
            },
            "question": {
              "en": "What did you contribute when AI generated the code?",
              "zh-CN": "AI 生成代码时，你贡献了什么？",
              "zh-TW": "AI 生成程式碼時，你貢獻了什麼？"
            },
            "answer": {
              "en": "Follow-up: identify one constraint you supplied, one output you rejected, and one independent check. Use actual evidence.",
              "zh-CN": "参考追问：指出你提供的一条约束、拒绝的一个结果及一项独立检查，使用真实证据。",
              "zh-TW": "參考追問：指出你提供的一條約束、拒絕的一個結果及一項獨立檢查，使用真實證據。"
            }
          }
        ]
      },
      {
        "id": "c4",
        "title": {
          "en": "Revise the explanation after the interview",
          "zh-CN": "面试以后怎样修改介绍",
          "zh-TW": "面試以後怎樣修改介紹"
        },
        "body": {
          "en": "## Review the answer, not your personality\nRead your first answer beside the follow-up questions. Mark places where the reader could not identify the user problem, your contribution or the evidence. Replace vague claims with one concrete example.\n\nFor example, replace “the system was highly reliable” with “the function passed duplicate-ID, same-name, empty-input and non-mutation checks; server concurrency was outside this exercise.” The second statement is narrower and gives the reader something to examine.\n\n## Keep a revision record\nSave the first account, the question that exposed a gap and the revised account. If the gap is technical rather than verbal, do the missing investigation before claiming it has been resolved.\n\nFor your final case note, include the problem, the agreed behaviour, an implementation or design artifact, verification evidence, assistance used and remaining limitations. The result should sound like an explanation of work you understand, rather than an advertisement for yourself.",
          "zh-CN": "## 检查回答，不评价自己的人格\n把第一次回答和追问放在一起，标出读者无法确定用户问题、个人贡献或验证依据的地方。用一个具体例子替换模糊主张。\n\n例如，把“系统高度可靠”改成“函数通过了重复编号、同名、空输入和输入不变检查；服务端并发不在本次练习范围”。后一句范围较小，却给了读者能够核查的内容。\n\n## 保留修改过程\n保存初稿、暴露空缺的问题和修改稿。如果缺的是技术调查，而非表达方式，应先完成调查，再声称已解决。\n\n最终案例说明包含问题、约定行为、一份实现或设计材料、验证证据、使用的协助与剩余局限。读起来应当像在解释自己理解的工作，而不是给自己写宣传文案。",
          "zh-TW": "## 檢查回答，不評價自己的人格\n把第一次回答和追問放在一起，標出讀者無法確定使用者問題、個人貢獻或驗證依據的地方。用一個具體例子替換模糊主張。\n\n例如，把“系統高度可靠”改成“函式透過了重複編號、同名、空輸入和輸入不變檢查；服務端併發不在本次練習範圍”。後一句範圍較小，卻給了讀者能夠核查的內容。\n\n## 保留修改過程\n儲存初稿、暴露空缺的問題和修改稿。如果缺的是技術調查，而非表達方式，應先完成調查，再聲稱已解決。\n\n最終案例說明包含問題、約定行為、一份實現或設計材料、驗證證據、使用的協助與剩餘侷限。讀起來應當像在解釋自己理解的工作，而不是給自己寫宣傳文案。"
        },
        "advanced": {
          "en": "Separate an explanation gap from a verification gap. A clearer sentence cannot replace a missing test. Include a reproducible reference to the evidence and identify what could change your current conclusion.",
          "zh-CN": "区分表达空缺和验证空缺：句子更清楚不能代替缺失测试。提供能够复现或查阅的证据，并说明什么新发现会改变当前结论。",
          "zh-TW": "區分表達空缺和驗證空缺：句子更清楚不能代替缺失測試。提供能夠復現或查閱的證據，並說明什麼新發現會改變當前結論。"
        },
        "hint": {
          "en": "Start with the evidence in the case. Retain the before/after explanation.",
          "zh-CN": "先回到案例里的证据。保留修改前后内容。",
          "zh-TW": "先回到案例裡的證據。保留修改前後內容。"
        },
        "workshop": {
          "title": {
            "en": "Submit the revised project case note",
            "zh-CN": "提交修改后的项目案例说明",
            "zh-TW": "提交修改後的專案案例說明"
          },
          "brief": {
            "en": "Keep both the original and revised account in your work.",
            "zh-CN": "在作业里保留原稿和修改稿。",
            "zh-TW": "在作業裡保留原稿和修改稿。"
          },
          "questions": [
            {
              "en": "Quote a vague sentence from your first answer and explain the problem.",
              "zh-CN": "引用初稿中的模糊句子，解释哪里不够清楚。",
              "zh-TW": "引用初稿中的模糊句子，解釋哪裡不夠清楚。"
            },
            {
              "en": "Rewrite it with specific evidence and a limitation.",
              "zh-CN": "用具体证据和局限重新表述。",
              "zh-TW": "用具體證據和侷限重新表述。"
            },
            {
              "en": "What investigation, if any, still needs doing?",
              "zh-CN": "还有什么需要实际调查，而不能靠改措辞解决？",
              "zh-TW": "還有什麼需要實際調查，而不能靠改措辭解決？"
            }
          ],
          "sample": {
            "en": "Original: “AI helped me make the booking system secure.” Revision: “In a course exercise, I reviewed an AI-generated export function and verified first-occurrence semantics with independent cases. I did not evaluate account security or server allocation.” Missing investigation: authorization and concurrent allocation tests. Better wording makes the scope honest; those tests still need to be performed if the claim is expanded.",
            "zh-CN": "原稿：“AI 帮我把报名系统做安全了。”修改：“在课程练习中，我审查了 AI 生成的导出函数，用独立用例检查了保留首条规则；没有评估账号安全或服务端分配。”仍缺权限和并发分配测试。改措辞只是让范围准确，如果要扩大主张，还必须实际完成这些检查。",
            "zh-TW": "原稿：“AI 幫我把報名系統做安全了。”修改：“在課程練習中，我審查了 AI 生成的匯出函式，用獨立用例檢查了保留首條規則；沒有評估賬號安全或服務端分配。”仍缺許可權和併發分配測試。改措辭只是讓範圍準確，如果要擴大主張，還必須實際完成這些檢查。"
          },
          "rubric": [
            {
              "en": "Retain the before/after explanation.",
              "zh-CN": "保留修改前后内容。",
              "zh-TW": "保留修改前後內容。"
            },
            {
              "en": "Do not treat wording changes as completed technical work.",
              "zh-CN": "不能把改措辞当作完成技术验证。",
              "zh-TW": "不能把改措辭當作完成技術驗證。"
            }
          ]
        },
        "type": "reflection",
        "minutes": 8
      }
    ]
  }
];
export const courseReferences = [
  {
    "title": "Full Stack Open — Fundamentals of Web apps",
    "url": "https://fullstackopen.com/en/part0/fundamentals_of_web_apps",
    "courses": [
      "architecture"
    ],
    "use": {
      "en": "Further reading on browser/server requests and sequence diagrams.",
      "zh-CN": "延伸阅读：浏览器与服务端请求、时序图。",
      "zh-TW": "延伸閱讀：瀏覽器與服務端請求、時序圖。"
    }
  },
  {
    "title": "CS50 — Problem Set 1",
    "url": "https://cs50.harvard.edu/x/psets/1/",
    "courses": [
      "ai-coding",
      "testing-release"
    ],
    "use": {
      "en": "A course-design reference for specifications, examples and independent checks. Our cases and exercises are original.",
      "zh-CN": "课程组织参考：明确题目约定、例子和独立检查。本平台案例与练习为原创。",
      "zh-TW": "課程組織參考：明確題目約定、例子和獨立檢查。本平臺案例與練習為原創。"
    }
  },
  {
    "title": "The Carpentries — Preparing to Teach",
    "url": "https://carpentries.github.io/instructor-training/instructor/18-preparation.html",
    "courses": [],
    "use": {
      "en": "A teaching-design reference for objectives and formative checkpoints.",
      "zh-CN": "教学组织参考：学习目标与形成性检查点。",
      "zh-TW": "教學組織參考：學習目標與形成性檢查點。"
    }
  },
  {
    "title": "MDN — Set",
    "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set",
    "courses": [
      "ai-coding",
      "testing-release",
      "career"
    ],
    "use": {
      "en": "Reference for unique values, identity and collection behaviour.",
      "zh-CN": "关于唯一值、对象引用和集合行为的参考。",
      "zh-TW": "關於唯一值、物件引用和集合行為的參考。"
    }
  },
  {
    "title": "MDN — Map",
    "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map",
    "courses": [
      "ai-coding",
      "testing-release",
      "career"
    ],
    "use": {
      "en": "Compare keyed updates with first-occurrence requirements.",
      "zh-CN": "对照按键更新与保留首次记录的约定。",
      "zh-TW": "對照按鍵更新與保留首次記錄的約定。"
    }
  },
  {
    "title": "OWASP — Authorization Cheat Sheet",
    "url": "https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html",
    "courses": [
      "architecture"
    ],
    "use": {
      "en": "Further reading on enforcing permissions for each request.",
      "zh-CN": "延伸阅读：逐次请求的权限检查。",
      "zh-TW": "延伸閱讀：逐次請求的許可權檢查。"
    }
  },
  {
    "title": "Pro Git — Contributing to a Project",
    "url": "https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project",
    "courses": [
      "development",
      "product-decisions"
    ],
    "use": {
      "en": "Further reading on reviewable changes and collaboration.",
      "zh-CN": "延伸阅读：便于审查的改动和协作方式。",
      "zh-TW": "延伸閱讀：便於審查的改動和協作方式。"
    }
  }
];
