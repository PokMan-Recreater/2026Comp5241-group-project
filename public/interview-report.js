const compact=text=>String(text||'').replace(/\s+/g,' ').trim();
export const interviewAnswers=messages=>messages.filter(m=>m.role==='user'&&m.complete!==false&&compact(m.content));
export function localInterviewReport(messages,language='zh'){
 const en=language==='en',answers=interviewAnswers(messages);if(!answers.length)return null;
 const index=answers.reduce((best,m,i)=>m.content.length>answers[best].content.length?i:best,0),answer=answers[index].content,quote=answer.slice(0,180);
 const evidence=comment=>({answerIndex:index+1,quote,comment});const strengths=[],improvements=[];
 if(/我负责|我实现|我设计|我分析|I (?:built|implemented|designed|led|analysed|analyzed)/i.test(answer))strengths.push(evidence(en?'You identified your own contribution rather than only describing the team.':'你说明了自己的具体贡献，而不只是介绍团队。'));
 else improvements.push(evidence(en?'Make your personal responsibility and actions explicit.':'这段回答还未明确你的个人职责和实际行动。'));
 if(/因为|所以|权衡|选择.{0,20}原因|because|trade.?off|chose|reason/i.test(answer))strengths.push(evidence(en?'You started explaining your reasoning or a trade-off.':'你开始解释方案选择的理由或取舍。'));
 else improvements.push(evidence(en?'Explain why you chose this approach and one alternative you considered.':'补充为什么选这个方案，以及考虑过的一个替代方案。'));
 if(!/提升|降低|减少|验证|测试|结果|影响|improv|reduc|validat|test|result|impact/i.test(answer))improvements.push(evidence(en?'State what changed and how you checked the result; use only verifiable facts.':'补充实际结果及验证方法，只使用可核实的事实。'));
 return {source:'local',answerCount:answers.length,summary:en?`A transcript-based practice checklist for ${answers.length} answer(s), not an AI assessment.`:`已根据 ${answers.length} 段回答整理练习清单；这是本地规则建议，不是 AI 评价。`,strengths,improvements,rewrite:{answerIndex:index+1,original:answer,improved:en?`What you already said: “${answer}”\nMake the structure explicit:\nMy responsibility: [your actual responsibility]\nMy action and rationale: [what you did and why]\nResult and verification: [facts you can verify; do not invent numbers]`:`你已经说到：“${answer}”\n可以按下面的结构补全：\n我的职责：[你的实际职责]\n我的行动与理由：[具体做法及选择原因]\n结果与验证：[可核实的结果，不要编造数字]`},nextSteps:en?['Rewrite this answer with your own contribution, one decision and a verifiable result.','Practise a 60–90 second answer, then check that every claim is supported.']:['用自己的贡献、一个关键决策和可核实的结果重写这段回答。','练习在 60–90 秒内讲清楚，并核对每个结论是否有依据。']};
}
export const interviewScoreRubric={relevance:30,depth:30,evidence:25,clarity:15};
export function validateInterviewScore(value,messages,persona='professional-male'){
 const answers=interviewAnswers(messages);if(!value||typeof value!=='object'||!answers.length)throw new Error('invalid_score');
 const dimensions={};let baseScore=0;
 for(const [name,max]of Object.entries(interviewScoreRubric)){
  const d=value[name],answer=answers[d?.answerIndex-1];
  if(!d||!Number.isInteger(d.points)||d.points<0||d.points>max||!Number.isInteger(d.answerIndex)||!answer||typeof d.quote!=='string'||!d.quote.trim()||d.quote.length>600||!compact(answer.content).includes(compact(d.quote))||typeof d.reason!=='string'||!d.reason.trim()||d.reason.length>1800)throw new Error('invalid_score_evidence');
  dimensions[name]={points:d.points,max,answerIndex:d.answerIndex,quote:d.quote,reason:d.reason};baseScore+=d.points;
 }
 const units=answers.map(m=>m.content).join(' ').match(/[\u3400-\u9fff]|[A-Za-z0-9]+/g)?.length||0;
 const evidenceCap=answers.length<=1&&units<40?40:answers.length<=2&&units<120?60:100;
 const styleAdjustment=persona.startsWith('pressure-')?-2:persona.startsWith('gentle-')?2:0;
 return {rubricVersion:'practice-1.0',dimensions,baseScore,styleAdjustment,evidenceCap,finalScore:Math.min(evidenceCap,Math.max(0,Math.min(100,baseScore+styleAdjustment))),confidence:evidenceCap<100?'limited':'standard',answerCount:answers.length,answerUnits:units};
}
export function validateInterviewReport(value,messages,persona='professional-male'){
 const answers=interviewAnswers(messages);if(!answers.length||!value||typeof value!=='object')throw new Error('invalid_review');
 const text=(v,max=2500)=>{if(typeof v!=='string'||!v.trim()||v.length>max)throw new Error('invalid_review');return v;};
 const point=p=>{const index=p?.answerIndex;if(!Number.isInteger(index)||index<1||index>answers.length)throw new Error('invalid_evidence');const quote=text(p.quote,600);if(!compact(answers[index-1].content).includes(compact(quote)))throw new Error('unmatched_evidence');return {answerIndex:index,quote,comment:text(p.comment)};};
 const points=items=>{if(items===undefined||items===null)return [];if(!Array.isArray(items)||items.length>4)throw new Error('invalid_review');return items.map(point);};
 const steps=value.nextSteps===undefined||value.nextSteps===null?[]:Array.isArray(value.nextSteps)&&value.nextSteps.length<=3?value.nextSteps.map(v=>text(v)):null;
 if(!steps)throw new Error('invalid_review');
 let rewrite=null;const r=value.rewrite;
 if(r!==undefined&&r!==null){const index=r.answerIndex;if(!Number.isInteger(index)||index<1||index>answers.length||compact(r.original)!==compact(answers[index-1].content))throw new Error('invalid_rewrite');rewrite={answerIndex:index,original:answers[index-1].content,improved:text(r.improved,6000)};}
 // The realtime model often fits only summary and score into its tool-call
 // budget. Verified score dimensions still supply grounded evidence for the
 // strengths/improvements sections.
 const score=value.score?validateInterviewScore(value.score,messages,persona):null;
 const derived=keep=>score?Object.values(score.dimensions).filter(d=>keep(d.points,d.max)).map(d=>({answerIndex:d.answerIndex,quote:d.quote,comment:d.reason})):[];
 const strengths=points(value.strengths),improvements=points(value.improvements);
 return {source:'ai',answerCount:answers.length,summary:text(value.summary),strengths:strengths.length?strengths:derived((p,m)=>p/m>=.75),improvements:improvements.length?improvements:derived((p,m)=>p/m<.75),rewrite,nextSteps:steps,score};
}

export function interviewReviewTool(){
 const point={type:'object',properties:{answerIndex:{type:'integer',minimum:1},quote:{type:'string',description:'Exact short quote from this candidate answer, never from the interviewer.'},comment:{type:'string'}},required:['answerIndex','quote','comment']};
 const dimension=max=>({type:'object',properties:{points:{type:'integer',minimum:0,maximum:max},answerIndex:{type:'integer',minimum:1},quote:{type:'string'},reason:{type:'string'}},required:['points','answerIndex','quote','reason']});
 const score={type:'object',description:'Objective practice-performance score, not hiring suitability or innate ability. Use the SAME rubric for all voices, genders and personalities. Grade relevance (30), depth/reasoning (30), concrete evidence (25), clarity/structure (15). Each dimension must cite an actual answer. Short or vague answers with no evidence earn few points. Time alone earns no points. Do not apply persona bonuses; the server applies disclosed calibration separately.',properties:Object.fromEntries(Object.entries(interviewScoreRubric).map(([key,max])=>[key,dimension(max)])),required:Object.keys(interviewScoreRubric)};
 return {type:'function',name:'update_interview_review',description:'Use ONLY after the interview has ended. Submit one final practice score and review for the entire interview, based on actual candidate answers numbered from 1. Never run this tool between interview questions. No hiring, personality, accent or appearance evaluation. Do not invent facts; mark missing evidence with placeholders.',parameters:{type:'object',properties:{summary:{type:'string'},score,strengths:{type:'array',maxItems:4,items:point},improvements:{type:'array',maxItems:4,items:point},rewrite:{type:'object',properties:{answerIndex:{type:'integer',minimum:1},original:{type:'string',description:'Exact complete candidate answer being improved.'},improved:{type:'string',description:'Improve structure and clarity without adding unverified facts. Use placeholders for missing evidence.'}},required:['answerIndex','original','improved']},nextSteps:{type:'array',minItems:1,maxItems:3,items:{type:'string'}}},required:['summary','score']}};
}

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function interviewReportHTML(report,locale='zh-CN'){
 if(!report)return '';
 const L=(en,cn,tw=cn)=>locale==='en'?en:locale==='zh-TW'?tw:cn;
 const points=(title,items)=>`<section><h3>${title}</h3>${items.length?items.map(p=>`<article class="ir-evidence"><span>${L('Answer','回答','回答')} ${p.answerIndex}</span><blockquote>${esc(p.quote)}</blockquote><p>${esc(p.comment)}</p></article>`).join(''):`<p>${L('Not enough evidence to make a specific observation.','目前没有足够证据作出具体判断。','目前沒有足夠證據作出具體判斷。')}</p>`}</section>`;
 const score=report.score;
 const scoreLabels={relevance:L('Relevance','切题程度','切題程度'),depth:L('Depth & reasoning','专业深度与推理','專業深度與推理'),evidence:L('Evidence','具体证据','具體證據'),clarity:L('Clarity','表达结构','表達結構')};
 const scoreHTML=score?`<section class="ir-score"><div><span>${L('Practice score','本次练习分','本次練習分')}</span><strong>${score.finalScore}<small> / 100</small></strong><p>${L('Base score','基础分','基礎分')} ${score.baseScore} · ${L('Style calibration','风格校准','風格校準')} ${score.styleAdjustment>0?'+':''}${score.styleAdjustment}${score.evidenceCap<100?` · ${L('Evidence cap','证据不足上限','證據不足上限')} ${score.evidenceCap}`:''}</p></div><div>${Object.entries(score.dimensions).map(([key,d])=>`<details><summary>${scoreLabels[key]} <b>${d.points} / ${d.max}</b></summary><blockquote>${esc(d.quote)}</blockquote><p>${esc(d.reason)}</p></details>`).join('')}</div><p class="ir-report-note">${L('Same base rubric for every persona. Strict −2, supportive +2, analytical 0; voice gender has no effect. Very sparse answers limit confidence and the score cap. Duration alone is not scored.','基础标准相同：严格 −2、温和 +2、专业 0，男女声不影响分数。回答过少且内容简短时，会限制分数上限并注明证据不足；不按时长直接打分。','基礎標準相同：嚴格 −2、溫和 +2、專業 0，男女聲不影響分數。回答過少且內容簡短時，會限制分數上限並註明證據不足；不按時長直接評分。')}</p></section>`:`<p class="ir-report-note">${L('No verified AI score was returned. No score has been invented.','未返回可核验的 AI 分数，本页不编造评分。','未回傳可核驗的 AI 分數，本頁不編造評分。')}</p>`;
 return `<section class="ir-report"><div class="ir-report-heading"><div><span class="ir-eyebrow">${L('YOUR INTERVIEW REVIEW','面试复盘','面試回顧')}</span><h2>${L('Make your next answer stronger','让下一次回答更具体','讓下一次回答更具體')}</h2></div><span class="ir-report-source">${report.source==='ai'?L('AI review · grounded in your answers','AI 复盘 · 基于实际回答','AI 回顧 · 基於實際回答'):L('Local practice checklist · not an AI assessment','本地练习建议 · 非 AI 评价','本機練習建議 · 非 AI 評價')}</span></div><p class="ir-report-summary">${esc(report.summary)}</p>${scoreHTML}<div class="ir-report-columns">${points(L('What worked','做得好的地方','做得好的地方'),report.strengths)}${points(L('Evidence to add','需要补足的证据','需要補足的證據'),report.improvements)}</div>${report.rewrite?`<section class="ir-rewrite"><h3>${L('One answer, reworked','一个回答的改写示例','一個回答的改寫範例')} · ${L('Answer','回答')} ${report.rewrite.answerIndex}</h3><div class="ir-report-columns"><div><h4>${L('Your original answer','你的原回答','你的原回答')}</h4><p>${esc(report.rewrite.original)}</p></div><div><h4>${L('Clearer structure','更清楚的表达','更清楚的表達')}</h4><p>${esc(report.rewrite.improved)}</p></div></div></section>`:''}${report.nextSteps.length?`<section><h3>${L('Next practice','下一步练习','下一步練習')}</h3><ol>${report.nextSteps.map(step=>`<li>${esc(step)}</li>`).join('')}</ol></section>`:''}<p class="ir-report-note">${L('Use this as practice feedback, not a hiring judgment. Missing facts must be filled in by you, not invented.','仅用于练习，不代表录用判断。缺失事实需由你补充，不应编造。','僅用於練習，不代表錄用判斷。缺失事實需由你補充，不應編造。')}</p><button type="button" class="ir-secondary" data-rt="download-review">${L('Download review','下载复盘','下載回顧')}</button></section>`;
}
export const interviewReportText=report=>[report.summary,report.score?JSON.stringify(report.score,null,2):'No verified AI score',...report.strengths.map(p=>`+ ${p.quote}\n${p.comment}`),...report.improvements.map(p=>`→ ${p.quote}\n${p.comment}`),...(report.rewrite?[report.rewrite.original,report.rewrite.improved]:[]),...report.nextSteps].join('\n\n');
