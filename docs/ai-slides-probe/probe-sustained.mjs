import {readFileSync} from 'node:fs';

const env = Object.fromEntries(
  readFileSync('/Users/crr/Desktop/软件工程/2026Comp5241-group-project-forma/.env.local', 'utf8')
    .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')]; })
);
const BASE = (env.AI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4').replace(/\/$/, '');
const PRIMARY = env.AI_MODEL || 'glm-4.7-flash';
const FALLBACK = 'glm-4-flash-250414';
const KEY = env.AI_API_KEY;
const SCENES = ['flow','compare','timeline','cycle','layers','hub','decision','balance','network','chain'];
const schema = `{"title":"...","description":"...","slides":[{"heading":"...","bullets":["...","..."],"art":{"scene":"${SCENES.join('|')}","items":["...","..."]}}]}`;
const system = `You are a careful course designer writing in Simplified Chinese. Return ONLY JSON matching this schema: ${schema}. Create 5 to 8 slides that teach the topic with a concrete example. Each slide: heading <= 24 chars; bullets 2 to 4 items, each <= 40 chars; art.scene MUST be exactly one of ${SCENES.join(', ')} chosen to fit that slide's idea; art.items 2 to 5 very short labels, each <= 18 chars, that describe the diagram, not repeat the heading. No markdown, no code fences, no commentary. Do not invent citations.`;

async function once(topic, model) {
  const t0 = Date.now();
  const res = await fetch(BASE + '/chat/completions', {
    method: 'POST',
    headers: {Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      model, messages: [{role: 'system', content: system}, {role: 'user', content: 'Topic: ' + topic}],
      response_format: {type: 'json_object'}, max_tokens: 2500,
      ...(BASE.includes('open.bigmodel.cn') && model === 'glm-4.7-flash' ? {thinking: {type: 'disabled'}} : {})
    }),
    signal: AbortSignal.timeout(120000)
  });
  const ms = Date.now() - t0;
  if (!res.ok) return {ok: false, status: res.status, ms, model};
  const raw = await res.json();
  return {ok: true, ms, model, content: raw.choices?.[0]?.message?.content || '', tps: raw.usage?.completion_tokens, finish: raw.choices?.[0]?.finish_reason};
}
function check(content) {
  try {
    const v = JSON.parse(content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, ''));
    if (!Array.isArray(v.slides) || v.slides.length < 5) return 'slides=' + (v.slides?.length);
    const bad = v.slides.filter(s => !s.art || !SCENES.includes(s.art.scene) || !Array.isArray(s.art.items) || s.art.items.length < 2).length;
    return bad ? `badArt=${bad}` : 'VALID';
  } catch { return 'JSONFAIL'; }
}
const topics = ['数据库索引与查询优化', '代码评审看什么', '需求优先级排序', '监控与告警', '接口幂等性'];
console.log('model, topic, status, ms, result');
for (const topic of topics) {
  let r = await once(topic, PRIMARY);
  if (!r.ok && r.status === 429) {
    await new Promise(x => setTimeout(x, 3000));
    r = await once(topic, FALLBACK);
    r.fallback = true;
  }
  const tag = r.ok ? check(r.content) : 'HTTP' + r.status;
  console.log(`${r.fallback ? FALLBACK + '(fb)' : PRIMARY} | ${topic} | ${r.ms}ms | ${tag}`);
  await new Promise(x => setTimeout(x, 5000));
}
