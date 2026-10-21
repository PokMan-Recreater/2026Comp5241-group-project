import {promptAnalysis} from './academy-models.js';
import {promptPresets} from './lab-views.js';
import {local} from './i18n.js';
export function rewritePrompt(text,preset,lang='en'){
 const original=String(text||''),signals=promptAnalysis(original).signals,p=promptPresets.find(x=>x.id===preset)||promptPresets[0];
 const cn=lang==='zh-CN',tw=lang==='zh-TW',pick=(en,sc,tc)=>cn?sc:tw?tc:en;
 const additions=[
  pick('Audience: a manager who needs a concise decision record.','受众：需要简明决策记录的负责人。','受眾：需要簡明決策紀錄的負責人。'),
  pick('Input: [paste the source you actually want to use]','输入：[粘贴实际使用的来源材料]','輸入：[貼上實際使用的來源資料]'),
  pick('Output format: '+p.format,'输出格式：'+p.format,'輸出格式：'+p.format),
  pick('Constraints: use the supplied material only; do not invent facts; under 120 words.','限制：仅使用所给材料，不编造事实，不超过 120 字。','限制：僅使用所給資料，不編造事實，不超過 120 字。'),
  pick('Example: ','示例：','範例：')+local(p.example,lang),
  pick('Verification: compare every claim with the source and mark uncertainty.','验证：逐项对照来源检查结论，标记不确定之处。','驗證：逐項對照來源檢查結論，標記不確定之處。'),
 ];
 return [original,...additions.filter((_,i)=>!signals[i])].filter(x=>x.trim()).join('\n\n');
}
