import {readFileSync} from 'node:fs';

const env = Object.fromEntries(
  readFileSync(process.argv[2] || new URL('../../.env.local', import.meta.url), 'utf8')
    .split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^["']|["']$/g, '')]; })
);
const BASE = (env.AI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4').replace(/\/$/, '');
const MODEL = env.AI_MODEL || 'glm-4.7-flash';
const KEY = env.AI_API_KEY;

const SCENES = ['flow','compare','timeline','cycle','layers','hub','decision','balance','network','chain'];
const schema = `{"title":"...","description":"...","slides":[{"heading":"...","bullets":["...","..."],"art":{"scene":"${SCENES.join('|')}","items":["...","..."]}}]}`;
const system = `You are a careful course designer writing in Simplified Chinese. Return ONLY JSON matching this schema: ${schema}. Create 5 to 8 slides that teach the topic with a concrete example. Each slide: heading <= 24 chars; bullets 2 to 4 items, each <= 40 chars; art.scene MUST be exactly one of ${SCENES.join(', ')} chosen to fit that slide's idea; art.items 2 to 5 very short labels, each <= 18 chars, that describe the diagram, not repeat the heading. No markdown, no code fences, no commentary. Do not invent citations.`;

const topics = ['软件测试与发布检查', 'AI 编码智能体的任务边界', '数据库索引与查询优化'];

async function call(topic) {
  const t0 = Date.now();
  const res = await fetch(BASE + '/chat/completions', {
    method: 'POST',
    headers: {Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      model: MODEL,
      messages: [{role: 'system', content: system}, {role: 'user', content: 'Topic: ' + topic}],
      response_format: {type: 'json_object'},
      max_tokens: 2500,
      ...(BASE.includes('open.bigmodel.cn') && MODEL === 'glm-4.7-flash' ? {thinking: {type: 'disabled'}} : {})
    }),
    signal: AbortSignal.timeout(90000)
  });
  const ms = Date.now() - t0;
  if (!res.ok) return {ok: false, status: res.status, ms, err: (await res.text()).slice(0, 200)};
  const raw = await res.json();
  const content = raw.choices?.[0]?.message?.content || '';
  return {ok: true, ms, tokens: raw.usage, content, finishReason: raw.choices?.[0]?.finish_reason};
}

function validate(content) {
  let v;
  try { v = JSON.parse(content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')); }
  catch { return {valid: false, why: 'JSON parse failed', preview: content.slice(0, 160)}; }
  const errs = [];
  if (typeof v.title !== 'string' || !v.title) errs.push('title');
  if (typeof v.description !== 'string' || !v.description) errs.push('description');
  if (!Array.isArray(v.slides) || v.slides.length < 5 || v.slides.length > 8) errs.push('slides count=' + (v.slides?.length));
  (v.slides || []).forEach((s, i) => {
    if (typeof s.heading !== 'string' || !s.heading) errs.push(`s${i}.heading`);
    if (!Array.isArray(s.bullets) || s.bullets.length < 2 || s.bullets.length > 4) errs.push(`s${i}.bullets=${s.bullets?.length}`);
    else s.bullets.forEach((b, j) => { if (typeof b !== 'string' || Array.from(b).length > 40) errs.push(`s${i}.b${j}len`); });
    if (!s.art || !SCENES.includes(s.art.scene)) errs.push(`s${i}.scene=${s.art?.scene}`);
    if (!Array.isArray(s.art?.items) || s.art.items.length < 2 || s.art.items.length > 5) errs.push(`s${i}.items=${s.art?.items?.length}`);
    else s.art.items.forEach((x, j) => { if (typeof x !== 'string' || Array.from(x).length > 18) errs.push(`s${i}.i${j}len`); });
  });
  return {valid: errs.length === 0, errs: errs.slice(0, 12), slides: v.slides?.length, scenes: v.slides?.map(s => s.art?.scene)};
}

for (const topic of topics) {
  const r = await call(topic);
  if (!r.ok) { console.log(`\n=== ${topic} ===\nFAIL status=${r.status} ${r.ms}ms ${r.err}`); continue; }
  const c = validate(r.content);
  console.log(`\n=== ${topic} ===`);
  console.log(`time=${r.ms}ms tokens=${JSON.stringify(r.tokens)} finish=${r.finishReason}`);
  console.log(`valid=${c.valid} slides=${c.slides} scenes=${JSON.stringify(c.scenes)}`);
  if (!c.valid) console.log('errors:', c.errs);
  if (c.valid) console.log('sample slide:', JSON.stringify(JSON.parse(r.content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')).slides[0], null, 0).slice(0, 240));
  await new Promise(r => setTimeout(r, 2500));
}
