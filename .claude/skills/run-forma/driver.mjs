#!/usr/bin/env node
// Drive the Forma web app: start the dev server, launch headless Chrome,
// navigate hash routes, evaluate JS, click/play, and capture screenshots.
// Verified on macOS with Google Chrome; set CHROME_BIN on other machines.
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allLessons } from '../../../public/all-lessons.js';
import { curriculum } from '../../../public/course-map.js';

const UNIT = path.resolve(fileURLToPath(new URL('../../..', import.meta.url)));
const DEFAULT_OUT = '/tmp/forma-driver';
const sleep = ms => new Promise(r => setTimeout(r, ms));

function chromeBinary() {
  if (process.env.CHROME_BIN) {
    if (!fs.existsSync(process.env.CHROME_BIN)) throw new Error(`CHROME_BIN not found: ${process.env.CHROME_BIN}`);
    return process.env.CHROME_BIN;
  }
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    'google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser'
  ];
  for (const c of candidates) {
    if (c.includes('/') && fs.existsSync(c)) return c;
    if (!c.includes('/')) {
      const found = spawnSync('which', [c], { encoding: 'utf8' });
      if (found.status === 0 && found.stdout.trim()) return found.stdout.trim();
    }
  }
  throw new Error('No Chrome/Chromium found. Set CHROME_BIN to the browser executable.');
}

function startServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn(process.execPath, ['scripts/serve.mjs'], {
      cwd: UNIT,
      env: { ...process.env, PORT: '0' },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let stderr = '';
    const timer = setTimeout(() => { proc.kill('SIGTERM'); reject(new Error(`server did not report a port in 15s\n${stderr}`)); }, 15000);
    proc.stderr.on('data', d => { stderr += d; });
    proc.stdout.on('data', d => {
      const text = String(d);
      const m = /http:\/\/127\.0\.0\.1:(\d+)/.exec(text);
      if (m) { clearTimeout(timer); resolve({ proc, base: `http://127.0.0.1:${m[1]}` }); }
    });
    proc.on('exit', code => { clearTimeout(timer); reject(new Error(`server exited with code ${code}\n${stderr}`)); });
    proc.on('error', reject);
  });
}

async function launchChrome() {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'forma-driver-'));
  const proc = spawn(chromeBinary(), [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--mute-audio',
    '--autoplay-policy=no-user-gesture-required',
    '--no-first-run', '--no-default-browser-check', '--disable-extensions',
    '--window-size=1440,900', '--remote-debugging-port=0',
    `--user-data-dir=${profile}`, 'about:blank'
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  proc.stderr.on('data', d => { stderr += d; });
  const portFile = path.join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 120; i++) {
    if (fs.existsSync(portFile)) {
      const port = fs.readFileSync(portFile, 'utf8').split('\n')[0].trim();
      if (port) return { proc, profile, port };
    }
    if (proc.exitCode !== null) break;
    await sleep(100);
  }
  proc.kill('SIGKILL');
  throw new Error(`Chrome did not expose DevTools\n${stderr.slice(-1200)}`);
}

async function connect(port) {
  let target;
  for (let i = 0; i < 100 && !target; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      target = list.find(t => t.type === 'page');
    } catch {}
    if (!target) await sleep(100);
  }
  if (!target) throw new Error('No Chrome page target');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  let seq = 0;
  const pending = new Map();
  const errors = [];
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails?.exception?.description || m.params.exceptionDetails?.text || 'exception');
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map(a => a.value ?? a.description).join(' '));
  });
  const send = (method, params = {}) => new Promise(resolve => {
    const id = ++seq;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  const evaluate = async expression => {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.result?.exceptionDetails) throw new Error(res.result.exceptionDetails.text);
    return res.result?.result?.value;
  };
  return { ws, send, evaluate, errors };
}

const normalizeRoute = route => (route.startsWith('#') ? route : `#${route.replace(/^\//, '')}`);

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  if (!cmd || cmd === '--help' || cmd === 'help') {
    console.log(`Usage:
  driver.mjs smoke [outDir]
  driver.mjs shot <route> [out.png]
  driver.mjs eval <route> <expression>
  driver.mjs lesson <lessonId> <step> [out.png] [--lang zh-CN|en|zh-TW] [--play]
  driver.mjs play <lessonId> [step] [--seconds 3]

Environment:
  CHROME_BIN   browser executable (defaults to macOS Google Chrome, then PATH)
  FORMA_URL    reuse an already-running server instead of starting one
Screenshots default to ${DEFAULT_OUT}`);
    return;
  }

  const outDir = cmd === 'smoke' ? path.resolve(args[0] || DEFAULT_OUT) : DEFAULT_OUT;
  fs.mkdirSync(outDir, { recursive: true });

  let server, chrome, cdp;
  const shutdown = async () => {
    try { cdp?.ws.close(); } catch {}
    try { chrome?.proc.kill('SIGKILL'); } catch {}
    try { server?.proc.kill('SIGTERM'); } catch {}
  };
  try {
    const base = process.env.FORMA_URL || (await (async () => { server = await startServer(); return server.base; })()).replace(/\/$/, '');
    chrome = await launchChrome();
    cdp = await connect(chrome.port);
    const { send, evaluate, errors } = cdp;

    const navigate = async (route, selector, timeout = 6000) => {
      await send('Page.navigate', { url: `${base}/${normalizeRoute(route)}` });
      const deadline = Date.now() + timeout;
      while (Date.now() < deadline) {
        const ready = await evaluate(`document.readyState === 'complete'`);
        if (ready && (!selector || await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`))) {
          await sleep(350);
          return;
        }
        await sleep(100);
      }
      throw new Error(`route ${route} did not show ${selector || 'readyState=complete'} in ${timeout}ms`);
    };

    const screenshot = async file => {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const target = path.resolve(outDir, file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, Buffer.from(res.result.data, 'base64'));
      return target;
    };

    if (cmd === 'smoke') {
      const routes = [
        { route: '#explore', sel: '.cm-topic', count: '.cm-topic', min: curriculum.length },
        ...curriculum.map(theme => ({ route: `#module/${theme.id}`, sel: '.cm-lesson', count: '.cm-lesson', min: theme.courses.length })),
        ...curriculum.flatMap(theme => theme.courses.map(course => ({ route: `#module/${course.id}`, sel: '[data-delivery-player]', count: '.dl-lesson-group', min: course.lessons.length }))),
        ...allLessons.map(lesson => ({ route: `#learn/${lesson.id}/0`, sel: '[data-delivery-player]', count: '[data-dl-step]', min: lesson.steps.length, acc: '.dl-lesson-group', accMin: 5 }))
      ];
      let failed = 0;
      for (let i = 0; i < routes.length; i++) {
        const r = routes[i];
        try {
          await navigate(r.route, r.sel);
          const n = await evaluate(`document.querySelectorAll(${JSON.stringify(r.count)}).length`);
          const acc = r.acc ? await evaluate(`document.querySelectorAll(${JSON.stringify(r.acc)}).length`) : null;
          const ok = n >= r.min && (acc === null || acc >= r.accMin);
          if (!ok) failed++;
          const file = await screenshot(`smoke-${String(i + 1).padStart(2, '0')}-${r.route.slice(1).replace(/[^\w]+/g, '-')}.png`);
          console.log(`${ok ? 'PASS' : 'FAIL'} ${r.route} (${r.count}=${n}, need>=${r.min}${acc === null ? '' : `; ${r.acc}=${acc}, need>=${r.accMin}`}) -> ${file}`);
        } catch (err) {
          failed++;
          console.log(`FAIL ${r.route}: ${err.message}`);
        }
      }
      if (errors.length) {
        failed++;
        console.log(`FAIL console errors:\n${[...new Set(errors)].join('\n')}`);
      }
      console.log(failed ? `\n${failed} smoke check(s) failed` : `\nAll ${routes.length} routes passed with no console errors`);
      if (failed) process.exitCode = 1;
      return;
    }

    if (cmd === 'shot') {
      const route = args[0];
      if (!route) throw new Error('shot needs a route, e.g. #explore');
      await navigate(route, '.main');
      const file = await screenshot(args[1] || `${route.slice(1).replace(/[^\w]+/g, '-') || 'home'}.png`);
      console.log(file);
      return;
    }

    if (cmd === 'eval') {
      const [route, expression] = args;
      if (!route || !expression) throw new Error('eval needs a route and an expression');
      await navigate(route, '.main');
      const result = await evaluate(expression);
      console.log(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
      return;
    }

    if (cmd === 'lesson') {
      const [lessonId, stepArg, ...rest] = args;
      if (!lessonId || stepArg === undefined) throw new Error('lesson needs <lessonId> <step>');
      const out = rest.find(x => !x.startsWith('--')) || `${lessonId}-step${stepArg}.png`;
      const langIndex = rest.indexOf('--lang');
      const lang = langIndex >= 0 ? rest[langIndex + 1] : null;
      const play = rest.includes('--play');
      await navigate(`#learn/${lessonId}/${Number(stepArg) || 0}`, '[data-delivery-player]');
      if (lang) {
        await evaluate(`(()=>{const s=document.querySelector('[data-dl-language]');if(s){s.value=${JSON.stringify(lang)};s.dispatchEvent(new Event('change',{bubbles:true}));}})()`);
        await sleep(900);
      }
      await evaluate(`(()=>{const r=document.querySelector('[data-dl-scrub]');if(r){r.value=1000;r.dispatchEvent(new Event('input',{bubbles:true}));}})()`);
      await sleep(250);
      const info = {
        title: await evaluate(`document.querySelector('[data-dl-current]')?.textContent`),
        time: await evaluate(`document.querySelector('[data-dl-time]')?.textContent`),
        audio: await evaluate(`document.querySelector('[data-dl-audio-state]')?.textContent`),
        steps: await evaluate(`document.querySelectorAll('[data-dl-step]').length`)
      };
      if (play) {
        await evaluate(`document.querySelector('[data-dl-play]').click()`);
        await sleep(2500);
        info.afterPlay = await evaluate(`document.querySelector('[data-dl-current]')?.textContent`);
        info.afterTime = await evaluate(`document.querySelector('[data-dl-time]')?.textContent`);
        await evaluate(`document.querySelector('[data-dl-play]').click()`);
      }
      const file = await screenshot(out);
      console.log(JSON.stringify({ ...info, screenshot: file }, null, 2));
      return;
    }

    if (cmd === 'play') {
      const [lessonId, ...rest] = args;
      if (!lessonId) throw new Error('play needs a lessonId');
      const step = Number(rest[0] && !rest[0].startsWith('--') ? rest[0] : 0) || 0;
      const secondsIndex = rest.indexOf('--seconds');
      const seconds = secondsIndex >= 0 ? Number(rest[secondsIndex + 1]) || 3 : 3;
      await navigate(`#learn/${lessonId}/${step}`, '[data-delivery-player]');
      await evaluate(`document.querySelector('[data-dl-play]').click()`);
      const before = await evaluate(`document.querySelector('[data-dl-time]')?.textContent`);
      await sleep(seconds * 1000);
      const after = { current: await evaluate(`document.querySelector('[data-dl-current]')?.textContent`), time: await evaluate(`document.querySelector('[data-dl-time]')?.textContent`), hash: await evaluate('location.hash') };
      await evaluate(`document.querySelector('[data-dl-play]').click()`);
      console.log(JSON.stringify({ lessonId, step, seconds, before, after }, null, 2));
      return;
    }

    throw new Error(`Unknown command: ${cmd}`);
  } finally {
    await shutdown();
  }
}

main().catch(err => { console.error(err.stack || err.message); process.exitCode = 1; });
