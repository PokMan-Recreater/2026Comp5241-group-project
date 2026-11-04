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
 {id:'robot',zh:'自动化助手',tw:'自動化助手',en:'Automation',description:'助手自动完成的任务'},
 {id:'venn',zh:'交集关系',tw:'交集關係',en:'Overlap',description:'共同点与共享边界'},
 {id:'quadrant',zh:'四象限',tw:'四象限',en:'Quadrant',description:'按两个维度分类定位'},
 {id:'stairs',zh:'成长阶梯',tw:'成長階梯',en:'Growth steps',description:'逐级提升的阶段'},
 {id:'funnel',zh:'筛选漏斗',tw:'篩選漏斗',en:'Funnel',description:'逐层筛选与转化'},
 {id:'pyramid',zh:'层级金字塔',tw:'層級金字塔',en:'Pyramid',description:'从基础到核心的层级'},
 {id:'tree',zh:'分类树',tw:'分類樹',en:'Tree',description:'从上到下的分类归属'},
 {id:'target',zh:'目标靶心',tw:'目標靶心',en:'Target',description:'聚焦核心目标'},
 {id:'shield',zh:'安全防护',tw:'安全防護',en:'Protection',description:'风险与防护措施'},
 {id:'chart',zh:'数据图表',tw:'數據圖表',en:'Chart',description:'数量、指标与变化'},
 {id:'puzzle',zh:'部件拼合',tw:'部件拼合',en:'Components',description:'多个部件组成整体'},
 {id:'iceberg',zh:'冰山模型',tw:'冰山模型',en:'Iceberg',description:'表面现象与深层原因'},
 {id:'bridge',zh:'连接过渡',tw:'連接過渡',en:'Bridge',description:'两个阶段或系统之间的过渡'}
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
 if(/交集|共同点|共同點|重叠|重疊|共有|overlap|intersection|shared/.test(text))return 'venn';
 if(/象限|矩阵|矩陣|优先级|優先級|quadrant|matrix|impact.*effort/.test(text))return 'quadrant';
 if(/阶梯|階梯|进阶|進階|成熟|成长|成長|maturity|progression/.test(text))return 'stairs';
 if(/漏斗|筛选|篩選|转化|轉化|funnel|conversion/.test(text))return 'funnel';
 if(/金字塔|层级|層級|从基础到|從基礎到|pyramid|hierarchy/.test(text))return 'pyramid';
 if(/分类|分類|目录|目錄|树状|樹狀|taxonomy|category|categor/.test(text))return 'tree';
 if(/冰山|iceberg|隐藏|隱藏|深层原因|深層原因|underlying/.test(text))return 'iceberg';
 if(/桥梁|橋樑|过渡|過渡|连接两|連接兩|bridge|transition/.test(text))return 'bridge';
 if(/目标|目標|靶心|聚焦|focus|goal|objective/.test(text))return 'target';
 if(/安全|风险|風險|防护|防護|威胁|威脅|security|threat|protect/.test(text))return 'shield';
 if(/指标|指標|数量|數量|统计|統計|数据量|數據量|chart|metric|quantity/.test(text))return 'chart';
 if(/组件|組件|部件|拼合|组合|組合|component|puzzle|assemble/.test(text))return 'puzzle';
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
