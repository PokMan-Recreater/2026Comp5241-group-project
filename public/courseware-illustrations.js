import {kit} from './lesson-art-kit.js';
// Reuse the authored courses' drawings. Labels select safe local artwork;
// the provider never supplies SVG, code, coordinates, or external image URLs.
export function illustrationKind(text){
 const t=String(text||'').toLowerCase();
 /** @type {Array<[string, RegExp]>} */
 const rules=[['key',/私钥|私鑰|密钥|密鑰|签名|簽名|private key|signature|\bsign(?:s|ing)?\b/],['wallet',/钱包|錢包|wallet/],['network',/网络|網絡|網路|节点|節點|network|node|broadcast/],['database',/数据库|資料庫|database|ledger|账本|帳本/],['agent',/智能体|智能體|机器人|機器人|\bagent\b|\brobot\b/],['person',/用户|用戶|学生|學生|开发者|开发人员|開發者|\buser|\bstudent|\bdeveloper|\balice\b|\bbob\b/],['document',/文档|文檔|报告|報告|合约|合約|合同|document|report|contract/],['phone',/手机|手機|mobile|phone|\bapp\b/],['check',/验证|驗證|测试|測試|检查|檢查|test|validat|review/],['lock',/安全|权限|權限|security|permission|encrypt/],['clock',/时间|時間|deadline|schedule|\btime\b/]];
 return rules.find(([,pattern])=>pattern.test(t))?.[0];
}
function icon(kind){
 const k=kit(1,'en');
 if(kind==='person')return k.face(0,-8,'#bdd8c2');
 if(kind==='agent')return k.bot(0,0);
 if(kind==='document')return k.doc(-26,-34,'#fff4d4',52,68);
 if(kind==='phone')return k.phone(-22,-39,.75);
 if(kind==='database')return k.db(0,-22);
 if(kind==='lock')return k.lock(0,0);
 if(kind==='clock')return k.clock(0,0);
 if(kind==='check')return k.lens(-4,-4);
 if(kind==='key')return '<g fill="none" stroke="#b58a1f" stroke-width="3"><circle cx="-14" cy="-8" r="12"/><path d="M-5 1L22 28m-9-9 7-7m-1 13 7-7" stroke-linecap="round"/></g>';
 if(kind==='wallet')return '<g stroke="#292535" stroke-width="2"><rect x="-30" y="-22" width="60" height="44" rx="8" fill="#e9c88e"/><path d="M-24-22v-8h46v8" fill="#fff4d4"/><rect x="10" y="-8" width="26" height="20" rx="5" fill="#fff4d4"/><circle cx="19" cy="2" r="2" fill="#7967ac"/></g>';
 if(kind==='network')return '<g stroke="#7967ac" stroke-width="2"><path d="M0-26L-30 18H30ZM0-26V30M-30 18L30 18" fill="none"/>'+[[0,-26],[-30,18],[30,18],[0,0]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9" fill="#dbe6ef"/>`).join('')+'</g>';
 return '';
}
export function coursewareIllustrations(title,items){
 const kinds=[...new Set(items.map(illustrationKind).filter(Boolean))].slice(0,3);
 if(!kinds.length){const kind=illustrationKind(title);if(kind)kinds.push(kind);}
 if(!kinds.length)return '';
 const centers=kinds.length===1?[112]:kinds.length===2?[72,158]:[48,113,178];
 return `<g class="tc-topic-illustrations" aria-hidden="true"><rect x="8" y="12" width="96" height="216" rx="20" fill="#f7f3fc"/>${kinds.map((kind,i)=>`<g data-illustration="${kind}" transform="translate(56 ${centers[i]}) scale(.65)">${icon(kind)}</g>`).join('')}</g>`;
}
