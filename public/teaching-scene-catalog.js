// Shared bounded vocabulary: the model selects a scene, never executable drawing code.
export const sceneCatalog=[
 {id:'auto',zh:'智能匹配',tw:'智慧配對',en:'Auto layout',description:'根据课节内容选择插画'},
 {id:'chain',zh:'链式记录',tw:'鏈式紀錄',en:'Linked records',description:'区块、哈希与记录连接'},
 {id:'network',zh:'分布式网络',tw:'分散式網路',en:'Distributed network',description:'节点同步与消息传播'},
 {id:'flow',zh:'操作流程',tw:'操作流程',en:'Process',description:'输入、处理、验证与结果'},
 {id:'compare',zh:'双向对比',tw:'雙向對比',en:'Comparison',description:'两种方案的差异'},
 {id:'timeline',zh:'演进时间线',tw:'演進時間軸',en:'Timeline',description:'阶段、里程碑与变化'},
 {id:'cycle',zh:'迭代循环',tw:'迭代循環',en:'Iteration cycle',description:'反馈推动下一轮改进'},
 {id:'layers',zh:'系统分层',tw:'系統分層',en:'System layers',description:'职责、边界与层间配合'},
 {id:'hub',zh:'概念关系',tw:'概念關係',en:'Concept map',description:'核心概念与关联要素'},
 {id:'decision',zh:'条件分支',tw:'條件分支',en:'Decision paths',description:'条件、不同路径与结果'},
 {id:'balance',zh:'取舍天平',tw:'取捨天平',en:'Trade-offs',description:'目标之间的权衡'},
 {id:'conversation',zh:'对话交流',tw:'對話交流',en:'Conversation',description:'提问、回答与讨论互动'},
 {id:'phone',zh:'手机操作',tw:'手機操作',en:'Mobile app',description:'在手机上完成的步骤'},
 {id:'document',zh:'文档流转',tw:'文檔流轉',en:'Documents',description:'合同、报告与文件传递'},
 {id:'database',zh:'数据存取',tw:'資料存取',en:'Data storage',description:'客户端访问服务器与数据库'},
 {id:'robot',zh:'自动化助手',tw:'自動化助手',en:'Automation',description:'助手自动完成的任务'}
];
export const sceneIds=sceneCatalog.map(s=>s.id);
export function selectScene(lesson){
 const text=[lesson.title,lesson.body,...lesson.sceneItems||[]].join(' ').toLowerCase();
 if(/哈希|区块|區塊|blockchain|linked block|hash chain/.test(text))return 'chain';
 if(/分布式|分散式|节点|節點|replica|distributed|peer.to.peer|同步/.test(text))return 'network';
 if(/数据库|資料庫|伺服器|服务器|database|backend|后端|\bapi\b/.test(text))return 'database';
 if(/手机|手機|行動裝置|钱包|錢包|mobile|smartphone|\bapp\b|扫码|掃碼|客户端/.test(text))return 'phone';
 if(/机器人|機器人|智能助手|自动化|自動化|\bagent\b|automation|\bbot\b/.test(text))return 'robot';
 if(/文档|文檔|合同|报告|報告|document|contract|report|发票|發票|论文|論文/.test(text))return 'document';
 if(/对话|對話|沟通|溝通|交流|讨论|討論|conversation|dialogue|interview/.test(text))return 'conversation';
 if(/取舍|取捨|权衡|權衡|trade.off|balance|成本.*质量|cost.*quality/.test(text))return 'balance';
 if(/分层|分層|架构|架構|architecture|layer|界面.*服务.*存储/.test(text))return 'layers';
 if(/循环|循環|迭代|iteration|feedback loop|sprint|反馈|回饋/.test(text))return 'cycle';
 if(/条件|條件|分支|如果|decision|branch|if\b/.test(text))return 'decision';
 if(/对比|比較|比较|對比|versus|\bvs\b|compare|comparison/.test(text))return 'compare';
 if(/时间|時間|历史|歷史|阶段|階段|timeline|milestone|evolution/.test(text))return 'timeline';
 if(/关系|關係|角色|stakeholder|concept|关联|關聯/.test(text))return 'hub';
 return 'flow';
}
const generic=/^(概念介绍|概念介紹|工作原理|应用场景|應用場景|开始|開始|结果|結果|concept introduction|working principle|applications?|start|outcome)$/i;
export function resolveScene(lesson){
 const oldGeneric=lesson.scene==='flow'&&(lesson.sceneItems||[]).length>0&&lesson.sceneItems.every(item=>generic.test(item.trim()));
 const scene=lesson.scene==='auto'||!sceneIds.includes(lesson.scene)||oldGeneric?selectScene(lesson):lesson.scene;
 let items=(lesson.sceneItems||[]).slice(0,5);
 const en=lesson.language==='en'||(!/[\u3400-\u9fff]/.test(lesson.title||'')&&/[a-z]/i.test(lesson.title||''));
 if(oldGeneric&&scene==='chain')items=en?['Transaction data','Previous block hash','New linked block','Network verification']:['交易记录','前一区块哈希','连接新区块','网络验证'];
 if(oldGeneric&&scene==='network')items=en?['Shared record','Node verification','Replica sync','Agreement']:['共享记录','节点验证','副本同步','达成一致'];
 if(items.length===0)items=[lesson.title||'…'];
 return {scene,items,automatic:lesson.scene==='auto'||oldGeneric};
}
