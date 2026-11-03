// The capstone: ship "Doc Summarise" with a small team on GitHub. Eight tasks,
// each a short story with ordered steps, together using every command the
// lessons taught. Teammates act when a step finishes, never on a timer.
import {t,newWorld,setupEnv,finishSetup,ALEX,JORDAN} from './kit.js';
import {serverCommit,openPullRequest} from '../git-engine/server.js';

export const PROJECT_URL='https://github.com/alice-wang/doc-summarise.git';
const prFor=(c,head)=>c.server(PROJECT_URL)?.prs.find(p=>p.head===head)||null;
const merged=(c,head)=>prFor(c,head)?.state==='merged';
const srv=c=>c.server(PROJECT_URL);
const onMain=c=>c.branch()==='main';
const synced=c=>{const s=srv(c),r=c.repo();return !!s&&r.refs['refs/heads/main']===s.refs['refs/heads/main'];};

const HEADER=nav=>`export function Header() {\n  return (\n    <header className="header">\n      <h1>Doc Summarise</h1>\n      <nav>\n        <a href="/">Home</a>\n${nav}      </nav>\n    </header>\n  );\n}\n`;
const AUTH_OK=`import { SessionStore } from './SessionStore';\n\nexport function restoreSession(cookie: string) {\n  const session = SessionStore.get(cookie);\n  if (!session) return null;\n  return session.user;\n}\n`;
const AUTH_BAD=`import { SessionStore } from './SessionStore';\n\nexport function restoreSession(cookie: string) {\n  const session = SessionStore.get(cookie);\n  return session.token.user;\n}\n`;
const PAGE=extra=>`'use client';\nimport { useState } from 'react';\nimport { Header } from '../components/Header';\n\nexport default function Page() {\n  const [summary, setSummary] = useState('');\n  return (\n    <main>\n      <Header />\n      <textarea placeholder="Paste a document" />\n      <button onClick={summarise}>Summarise</button>\n      <p>{summary}</p>\n${extra}    </main>\n  );\n}\n`;
const ROUTE=limit=>`import { NextResponse } from 'next/server';\n${limit?"import { rateLimit } from '../../../lib/rateLimit';\n":''}\nexport async function POST(req: Request) {\n${limit?"  if (!rateLimit(req, 10)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });\n":''}  const { text } = await req.json();\n  const summary = await summarise(text, process.env.OPENROUTER_API_KEY);\n  return NextResponse.json({ summary });\n}\n`;
const FILES={
 'README.md':'# Doc Summarise\n\nPaste a document and get a short summary.\n\n## Run locally\n\n    npm install\n    npm run dev\n',
 'package.json':'{\n  "name": "doc-summarise",\n  "private": true,\n  "scripts": { "dev": "next dev", "build": "next build" },\n  "dependencies": { "next": "15.2.4", "react": "19.0.0" }\n}\n',
 'app/page.tsx':PAGE(''),
 'app/api/summarise/route.ts':ROUTE(false),
 'components/Header.tsx':HEADER(''),
 'lib/auth.ts':AUTH_OK,
 'lib/sessionStore.ts':'export const SessionStore = new Map<string, { user: string; token: string }>();\n',
 '.env':'OPENROUTER_API_KEY=sk-or-demo-a85025a814fae8565c12e700\nOPENROUTER_MODEL=deepseek/deepseek-v4.1-flash\n',
 'node_modules/next/package.json':'{ "name": "next", "version": "15.2.4" }\n',
 'npm-debug.log':'npm info it worked if it ends with ok\n',
};

export const project={
 id:'project',cmd:'project',
 title:t('Project: ship Doc Summarise','综合项目：上线 Doc Summarise'),
 summary:t('Eight tasks with a team on GitHub, using every command from the lessons.','和团队在 GitHub 上协作完成 8 个任务，用到课程里的每一条命令。'),
 explain:t(
  'You are Alice, the developer of **Doc Summarise**, a small web app that summarises documents with an AI model. Alex Chen reviews every pull request; Jordan Lee works on the same repository.\n\nWork through the tasks in order. Each step says *what* to achieve — choose the commands yourself, use **Hint** if you are stuck. Teammates react when you finish a step, so there is no clock to beat.',
  '你是 Alice，负责开发 **Doc Summarise**——一个用 AI 模型总结文档的小网站。Alex Chen 会审查每一个 Pull Request，Jordan Lee 也在同一个仓库里工作。\n\n按顺序完成各个任务。每一步只说明*要达到什么结果*，命令由你自己决定，卡住了就点**提示**。队友会在你完成某一步时作出反应，没有倒计时。'),
 setup(){
  const w=newWorld({identity:false}),env=setupEnv(w);
  env.server('alice-wang','doc-summarise',{description:'Summarise any document with one click'});
  env.run('mkdir -p ~/doc-summarise');env.cd('doc-summarise');
  for(const [f,c] of Object.entries(FILES))env.file(f,c);
  finishSetup(w);
  return {world:w,cwd:w.home,github:true};
 },
 stages:[
 {
  id:'s1',title:t('Start the repository','建立仓库'),
  story:t('The code for Doc Summarise is in ~/doc-summarise but it is not under version control. It also contains .env with the real API key, downloaded packages and a log file — none of those may ever reach GitHub.','Doc Summarise 的代码放在 ~/doc-summarise，但还没有纳入版本控制。文件夹里还有存放真实 API 密钥的 .env、下载的依赖和一个日志文件——它们都不能上传到 GitHub。'),
  steps:[
   {text:t('This computer is new: set your Git name and email globally.','这是一台新电脑：用 --global 设置你的 Git 姓名和邮箱。'),answer:'git config --global user.name "Alice Wang" && git config --global user.email "alice@example.com"',check:c=>!!c.world.global['user.name']&&/@/.test(c.world.global['user.email']||'')},
   {text:t('Go into ~/doc-summarise and create a repository there.','进入 ~/doc-summarise，在那里创建仓库。'),answer:'cd ~/doc-summarise && git init',check:c=>!!c.repo('doc-summarise')&&c.cwd()===c.home+'/doc-summarise'},
   {text:t('Write a .gitignore that ignores .env, node_modules/ and *.log.','写一个 .gitignore，忽略 .env、node_modules/ 和 *.log。'),answer:'printf ".env\\nnode_modules/\\n*.log\\n" > .gitignore',check:c=>{const r=c.repo('doc-summarise');return ['.env','node_modules/next/package.json','npm-debug.log'].every(f=>c.ignored(r,f));}},
   {text:t('Prove .env is ignored, then check git status lists only the app files.','证明 .env 已被忽略，然后用 git status 确认只列出了应用文件。'),answer:'git check-ignore -v .env && git status',check:c=>c.ran(/^git check-ignore\b/)&&c.ran(/^git status/)},
   {text:t('Stage everything and make the first commit, "Initial commit".','暂存所有文件，完成第一个提交 "Initial commit"。'),answer:'git add . && git commit -m "Initial commit"',check:c=>{const f=c.files(c.head(c.repo('doc-summarise')));return 'app/page.tsx' in f&&'.gitignore' in f&&!('.env' in f)&&!('npm-debug.log' in f);}},
  ],
 },
 {
  id:'s2',title:t('Publish on GitHub','发布到 GitHub'),
  story:t('Alex created an empty repository for you: alice-wang/doc-summarise (open the GitHub tab). Connect it, upload main and mark this first version.','Alex 已经为你创建了一个空仓库 alice-wang/doc-summarise（打开 GitHub 标签页查看）。连接它，上传 main，并标记第一个版本。'),
  steps:[
   {text:t(`Add ${PROJECT_URL} as the remote origin.`,`把 ${PROJECT_URL} 添加为远程 origin。`),answer:`git remote add origin ${PROJECT_URL}`,check:c=>/alice-wang\/doc-summarise/.test(c.repo('doc-summarise').config['remote.origin.url']||'')},
   {text:t('Push main and make origin/main its upstream.','推送 main，并把 origin/main 设为上游。'),answer:'git push -u origin main',check:c=>synced(c)&&c.repo('doc-summarise').config['branch.main.remote']==='origin'},
   {text:t('Create the annotated tag v0.1.0 ("First version") and push it.','创建附注标签 v0.1.0（说明 "First version"）并推送。'),answer:'git tag -a v0.1.0 -m "First version" && git push origin v0.1.0',check:c=>{const s=srv(c),id=s?.refs['refs/tags/v0.1.0'];return !!id&&c.world.objects[id]?.t==='tag';}},
  ],
 },
 {
  id:'s3',title:t('Feature: dark mode','新功能：暗色模式'),
  story:t('Users asked for a dark mode toggle in the header. Work on a feature branch, let Copilot write the code, review its diff, and ship it through a pull request that Alex reviews.','用户希望页头有一个暗色模式开关。在功能分支上开发，让 Copilot 写代码，检查它的改动，然后通过 Alex 审查的 Pull Request 上线。'),
  steps:[
   {text:t('Create and switch to feature/dark-mode.','创建并切换到 feature/dark-mode。'),answer:'git switch -c feature/dark-mode',check:c=>c.branch()==='feature/dark-mode'},
   {text:t('Ask Copilot to add the toggle (button below), then review every change with git diff.','让 Copilot 加上开关（点下面的按钮），然后用 git diff 检查所有改动。'),answer:'git diff',
    action:{label:t('Copilot: add the dark mode toggle','Copilot：添加暗色模式开关'),run:w=>{const d=w.home+'/doc-summarise/';w.fs[d+'components/Header.tsx']=HEADER('        <button data-theme="toggle">Dark mode</button>\n');w.fs[d+'README.md']=w.fs[d+'README.md']+'\nTODO: remember to ask Copilot about the weather\n';}},
    check:c=>/Dark mode/.test(c.read('doc-summarise/components/Header.tsx')||'')&&c.ran(/^git diff/)},
   {text:t('Copilot also scribbled in README.md by mistake. Discard that change only.','Copilot 还误改了 README.md，只丢弃这一处改动。'),answer:'git restore README.md',check:c=>!/weather/.test(c.read('doc-summarise/README.md')||'')&&/Dark mode/.test(c.read('doc-summarise/components/Header.tsx')||'')},
   {text:t('Commit the header change as "Add dark mode toggle".','把页头的改动提交为 "Add dark mode toggle"。'),answer:'git add components/Header.tsx && git commit -m "Add dark mode toggle"',check:c=>{const r=c.repo('doc-summarise'),id=r.refs['refs/heads/feature/dark-mode'];return /Dark mode/.test(c.files(id)['components/Header.tsx']||'')&&id!==r.refs['refs/heads/main'];}},
   {text:t('Publish the branch.','发布这个分支。'),answer:'git push -u origin feature/dark-mode',check:c=>!!srv(c)?.refs['refs/heads/feature/dark-mode']},
   {text:t('On the GitHub tab, open a pull request from feature/dark-mode into main.','在 GitHub 标签页里，创建从 feature/dark-mode 到 main 的 Pull Request。'),answer:'(GitHub tab → Pull requests → New pull request)',check:c=>!!prFor(c,'feature/dark-mode')},
   {text:t('Alex approved it. Merge the pull request on GitHub.','Alex 已批准，在 GitHub 上合并这个 Pull Request。'),answer:'(GitHub tab → the pull request → Merge pull request)',check:c=>merged(c,'feature/dark-mode')},
   {text:t('Back in the terminal, switch to main and pull the merge.','回到终端，切换到 main 并拉取合并结果。'),answer:'git switch main && git pull',check:c=>onMain(c)&&synced(c)},
   {text:t('Delete the local feature branch; it is merged.','删除本地的功能分支，它已经合并了。'),answer:'git branch -d feature/dark-mode',check:c=>!c.repo('doc-summarise').refs['refs/heads/feature/dark-mode']},
  ],
 },
 {
  id:'s4',title:t('Bug: cannot log in after logout','Bug：退出后无法再登录'),
  story:t('Jordan just pushed two commits to main, and now users who log out cannot log back in. Find the commit that broke login and undo it without rewriting shared history.','Jordan 刚往 main 推送了两个提交，现在用户退出后就无法再登录。找到弄坏登录的提交，在不改写共享历史的前提下撤销它。'),
  start(w,api){api.push('main',JORDAN,'Refactor session handling',{'lib/auth.ts':AUTH_BAD});api.push('main',JORDAN,'Add word count to the summary',{'lib/wordCount.ts':'export const wordCount = (s: string) => s.split(/\\s+/).filter(Boolean).length;\n'});api.say(JORDAN,t('Pushed my session refactor and the word count helper to main.','我把 session 重构和字数统计推到 main 了。'));api.say({name:'Sarah Shah'},t('Bug report: after logging out I cannot log in again (TypeError reading "user").','Bug 报告：退出后无法再次登录（读取 "user" 时报 TypeError）。'));},
  steps:[
   {text:t('Download what Jordan pushed without merging it yet.','下载 Jordan 推送的内容，先不要合并。'),answer:'git fetch',check:c=>{const r=c.repo('doc-summarise');return r.refs['refs/remotes/origin/main']===srv(c).refs['refs/heads/main'];}},
   {text:t('List the commits on origin/main that your main does not have, then pull them.','列出 origin/main 有而你的 main 没有的提交，然后把它们拉下来。'),answer:'git log --oneline main..origin/main && git pull',check:c=>c.ran(/^git log\b.*\.\./)&&synced(c)},
   {text:t('Find who last changed the lines of lib/auth.ts.','查出 lib/auth.ts 每一行最后是谁改的。'),answer:'git blame lib/auth.ts',check:c=>c.ran(/^git blame\b.*auth\.ts/)},
   {text:t('Read the commit that removed the session check.','查看删掉 session 检查的那个提交。'),answer:'git show <hash>',check:c=>{const id=Object.keys(c.world.objects).find(k=>c.world.objects[k].t==='commit'&&c.world.objects[k].msg.startsWith('Refactor session handling'));return c.log.some(e=>{const m=e.line.match(/git show ([0-9a-f]{4,40})/);return m&&id.startsWith(m[1]);});}},
   {text:t('Revert that commit (keep the default message).','撤销那个提交（使用默认说明）。'),answer:'git revert --no-edit <hash>',check:c=>{const h=c.head(c.repo('doc-summarise'));return /^Revert "Refactor session handling"/.test(c.msg(h))&&/if \(!session\) return null;/.test(c.files(h)['lib/auth.ts']||'')&&'lib/wordCount.ts' in c.files(h);}},
   {text:t('Push the fix.','推送修复。'),answer:'git push',check:c=>synced(c)&&/^Revert/.test(c.msg(srv(c).refs['refs/heads/main']))},
  ],
 },
 {
  id:'s5',title:t('Hotfix: production build fails','紧急修复：线上构建失败'),
  story:t('Vercel builds on Linux, where file names are case-sensitive: lib/auth.ts imports ./SessionStore but the file is lib/sessionStore.ts. Fix the name on a hotfix branch. Careful — Copilot left config/keys.json with a key in the folder.','Vercel 在 Linux 上构建，文件名区分大小写：lib/auth.ts 导入的是 ./SessionStore，但文件名是 lib/sessionStore.ts。在 hotfix 分支上改好文件名。小心——Copilot 在文件夹里留下了含密钥的 config/keys.json。'),
  start(w,api){w.fs[w.home+'/doc-summarise/config/keys.json']='{ "openrouter": "sk-or-demo-302c7741ffee" }\n';if(!w.dirs.includes(w.home+'/doc-summarise/config'))w.dirs.push(w.home+'/doc-summarise/config');api.say({name:'Vercel'},t('Build failed: Module not found: Can\'t resolve \'./SessionStore\' in lib/auth.ts','构建失败：Module not found: Can\'t resolve \'./SessionStore\'（lib/auth.ts）'));},
  steps:[
   {text:t('Create and switch to hotfix/session-store.','创建并切换到 hotfix/session-store。'),answer:'git switch -c hotfix/session-store',check:c=>c.branch()==='hotfix/session-store'},
   {text:t('Rename lib/sessionStore.ts to lib/SessionStore.ts with Git.','用 Git 把 lib/sessionStore.ts 重命名为 lib/SessionStore.ts。'),answer:'git mv lib/sessionStore.ts lib/SessionStore.ts',check:c=>{const r=c.repo('doc-summarise');return 'lib/SessionStore.ts' in r.index&&!('lib/sessionStore.ts' in r.index);}},
   {text:t('Commit it as "Fix SessionStore file name".','提交为 "Fix SessionStore file name"。'),answer:'git commit -m "Fix SessionStore file name"',check:c=>{const r=c.repo('doc-summarise'),h=r.refs['refs/heads/hotfix/session-store'];return h!==r.refs['refs/heads/main']&&'lib/SessionStore.ts' in c.files(h);}},
   {text:t('keys.json must never be committed. Make sure it is not tracked, ignore config/keys.json, and fold the .gitignore change into the same commit with --amend.','keys.json 绝不能提交。确认它没有被跟踪，忽略 config/keys.json，并用 --amend 把 .gitignore 的改动并入同一个提交。'),answer:'git rm --cached config/keys.json; echo "config/keys.json" >> .gitignore && git add .gitignore && git commit --amend --no-edit',hint:t('If you committed it with git add ., use git rm --cached config/keys.json first.','如果之前用 git add . 把它提交了，先运行 git rm --cached config/keys.json。'),check:c=>{const r=c.repo('doc-summarise'),h=r.refs['refs/heads/hotfix/session-store'],f=c.files(h);return c.ran(/^git commit\b.*--amend/)&&!('config/keys.json' in f)&&/config\/keys\.json|config\//.test(f['.gitignore']||'')&&c.commit(h).parents[0]===r.refs['refs/heads/main']&&c.file('doc-summarise/config/keys.json');}},
   {text:t('Push the branch and open a pull request into main on GitHub.','推送分支，并在 GitHub 上创建合并到 main 的 Pull Request。'),answer:'git push -u origin hotfix/session-store',check:c=>!!prFor(c,'hotfix/session-store')},
   {text:t('Merge it on GitHub, then update your local main.','在 GitHub 上合并，然后更新本地 main。'),answer:'git switch main && git pull',check:c=>merged(c,'hotfix/session-store')&&onMain(c)&&synced(c)},
  ],
 },
 {
  id:'s6',title:t('Feature: PDF export, with an interruption','新功能：PDF 导出（中途插入紧急任务）'),
  story:t('Start the PDF export feature. Half-way through, Alex needs one commit from Jordan\'s branch on main right now.','开始做 PDF 导出功能。做到一半，Alex 需要立刻把 Jordan 分支上的一个提交放到 main 上。'),
  start(w,api){api.push('jordan/rate-limit',JORDAN,'Limit summarise to 10 requests per minute',{'lib/rateLimit.ts':'const hits = new Map<string, number[]>();\nexport function rateLimit(req: Request, perMinute: number) {\n  const ip = req.headers.get(\'x-forwarded-for\') ?? \'local\';\n  const now = Date.now(), recent = (hits.get(ip) ?? []).filter(t => now - t < 60000);\n  hits.set(ip, [...recent, now]);\n  return recent.length < perMinute;\n}\n','app/api/summarise/route.ts':ROUTE(true)});api.push('jordan/rate-limit',JORDAN,'WIP: try a Redis cache',{'lib/cache.ts':'// TODO: connect to Redis\nexport const cache = null;\n'});},
  steps:[
   {text:t('Create feature/pdf-export and let Copilot start the export button (button below). Do not commit yet.','创建 feature/pdf-export，让 Copilot 开始写导出按钮（点下面的按钮）。先不要提交。'),answer:'git switch -c feature/pdf-export',
    action:{label:t('Copilot: start the PDF export button','Copilot：开始写 PDF 导出按钮'),run:w=>{w.fs[w.home+'/doc-summarise/app/page.tsx']=PAGE('      <button onClick={exportPdf}>Export PDF</button>\n');}},
    check:c=>c.branch()==='feature/pdf-export'&&/Export PDF/.test(c.read('doc-summarise/app/page.tsx')||''),
    done(w,api){api.say(ALEX,t('Urgent: someone is hammering the summarise API. Jordan\'s branch origin/jordan/rate-limit has the fix "Limit summarise to 10 requests per minute". Put only that commit on main and push it — his Redis commit is not ready.','紧急：有人在狂刷 summarise 接口。Jordan 的分支 origin/jordan/rate-limit 上有修复提交 "Limit summarise to 10 requests per minute"。只把这一个提交放到 main 并推送——他的 Redis 提交还没准备好。'));}},
   {text:t('Your PDF work is unfinished. Put it aside so the working tree is clean.','你的 PDF 工作还没完成，先把它收起来，让工作区保持干净。'),answer:'git stash',check:c=>{const r=c.repo('doc-summarise');return r.stash.length>=1&&c.clean(r);}},
   {text:t('Switch to main, fetch, and find the rate-limit commit on origin/jordan/rate-limit.','切换到 main，fetch，然后在 origin/jordan/rate-limit 上找到限流的那个提交。'),answer:'git switch main && git fetch && git log --oneline origin/jordan/rate-limit',check:c=>onMain(c)&&!!c.repo('doc-summarise').refs['refs/remotes/origin/jordan/rate-limit']&&c.ran(/^git log\b/)},
   {text:t('Copy only that commit onto main and push.','只把那一个提交复制到 main 并推送。'),answer:'git cherry-pick <hash> && git push',check:c=>{const h=srv(c).refs['refs/heads/main'],f=c.files(h);return c.msg(h)==='Limit summarise to 10 requests per minute'&&'lib/rateLimit.ts' in f&&!('lib/cache.ts' in f)&&synced(c);}},
   {text:t('Go back to feature/pdf-export and bring your stashed work back.','回到 feature/pdf-export，取回之前 stash 的工作。'),answer:'git switch feature/pdf-export && git stash pop',check:c=>c.branch()==='feature/pdf-export'&&c.repo('doc-summarise').stash.length===0&&/Export PDF/.test(c.read('doc-summarise/app/page.tsx')||'')},
   {text:t('Commit it as "Add PDF export".','提交为 "Add PDF export"。'),answer:'git commit -am "Add PDF export"',check:c=>c.msg(c.repo('doc-summarise').refs['refs/heads/feature/pdf-export'])==='Add PDF export'},
   {text:t('Copilot suggests "cleaning up" with git reset --hard HEAD~1. Run it to see what happens.','Copilot 建议用 git reset --hard HEAD~1 来“清理”。运行它，看看会发生什么。'),answer:'git reset --hard HEAD~1',check:c=>c.ran(/^git reset --hard/)&&c.msg(c.head(c.repo('doc-summarise')))!=='Add PDF export'},
   {text:t('Your commit vanished! Find it in the reflog and move the branch back to it.','你的提交不见了！在 reflog 里找到它，把分支移回去。'),answer:'git reflog && git reset --hard HEAD@{1}',check:c=>c.ran(/^git reflog/)&&c.msg(c.head(c.repo('doc-summarise')))==='Add PDF export'&&c.branch()==='feature/pdf-export'},
   {text:t('main moved on (the rate limit). Replay your branch on top of main.','main 已经前进了（限流修复）。把你的分支重放到 main 之后。'),answer:'git rebase main',check:c=>{const r=c.repo('doc-summarise'),h=r.refs['refs/heads/feature/pdf-export'];return c.isAncestor(r.refs['refs/heads/main'],h)&&c.msg(h)==='Add PDF export';}},
   {text:t('Push it, open a pull request, merge it on GitHub and update local main.','推送，创建 Pull Request，在 GitHub 上合并，然后更新本地 main。'),answer:'git push -u origin feature/pdf-export  →  GitHub  →  git switch main && git pull',check:c=>merged(c,'feature/pdf-export')&&onMain(c)&&synced(c)},
  ],
 },
 {
  id:'s7',title:t('Feature: copy summary, with a conflict','新功能：复制摘要（会遇到冲突）'),
  story:t('Add a "Copy summary" link to the header. Jordan is changing the same lines for his word count feature, so expect a conflict.','在页头加一个 "Copy summary" 链接。Jordan 的字数统计功能也在改同样的几行，所以准备好处理冲突。'),
  steps:[
   {text:t('Create and switch to feature/copy-summary — use the checkout command this time.','创建并切换到 feature/copy-summary——这次用 checkout 命令。'),answer:'git checkout -b feature/copy-summary',check:c=>c.branch()==='feature/copy-summary'&&c.ran(/^git checkout -b/)},
   {text:t('Let Copilot add the link (button below) and commit it as "Add copy summary link".','让 Copilot 加上链接（点下面的按钮），并提交为 "Add copy summary link"。'),answer:'git commit -am "Add copy summary link"',
    action:{label:t('Copilot: add the Copy summary link','Copilot：添加 Copy summary 链接'),run:w=>{w.fs[w.home+'/doc-summarise/components/Header.tsx']=HEADER('        <button data-theme="toggle">Dark mode</button>\n        <a href="/copy">Copy summary</a>\n');}},
    check:c=>/Copy summary/.test(c.files(c.repo('doc-summarise').refs['refs/heads/feature/copy-summary'])['components/Header.tsx']||''),
    done(w,api){api.push('main',JORDAN,'Show word count in the header',{'components/Header.tsx':HEADER('        <button data-theme="toggle">Dark mode</button>\n        <span className="count">Word count</span>\n')});api.say(JORDAN,t('Merged word count into main — it touches the header too. Bring main into your branch before you push.','我把字数统计合进 main 了——它也改了页头。推送前先把 main 合进你的分支。'));}},
   {text:t('Fetch, then merge origin/main into your branch.','先 fetch，然后把 origin/main 合并到你的分支。'),answer:'git fetch && git merge origin/main',check:c=>{const r=c.repo('doc-summarise');return !!r.merge||c.isAncestor(srv(c).refs['refs/heads/main'],r.refs['refs/heads/feature/copy-summary']);}},
   {text:t('Resolve components/Header.tsx so it keeps both the word count and the Copy summary link, then finish the merge.','解决 components/Header.tsx 的冲突，同时保留字数统计和 Copy summary 链接，然后完成合并。'),answer:'(edit, Accept Both, save)  git add components/Header.tsx && git commit --no-edit',hint:t('Open the file, click "Accept Both", save, then add and commit.','打开文件，点“保留两者”，保存，然后 add 并 commit。'),check:c=>{const r=c.repo('doc-summarise'),h=r.refs['refs/heads/feature/copy-summary'],f=c.files(h)['components/Header.tsx']||'';return !r.merge&&!r.unmerged&&/Copy summary/.test(f)&&/Word count/.test(f)&&!/^(<{7}|={7}|>{7})/m.test(f)&&c.isAncestor(srv(c).refs['refs/heads/main'],h);}},
   {text:t('Push, open a pull request, merge it and update local main.','推送，创建 Pull Request，合并，然后更新本地 main。'),answer:'git push -u origin feature/copy-summary  →  GitHub  →  git switch main && git pull',check:c=>merged(c,'feature/copy-summary')&&onMain(c)&&synced(c)},
  ],
 },
 {
  id:'s8',title:t('Release 1.0','发布 1.0 版本'),
  story:t('Everything is merged. Tag the release and prove that a fresh clone of GitHub has everything needed — nothing important lives only on your laptop.','所有改动都已合并。给这个版本打标签，并证明从 GitHub 全新克隆下来的代码是完整的——没有重要的东西只存在你的电脑上。'),
  steps:[
   {text:t('Confirm with git status that main is up to date with origin/main.','用 git status 确认 main 与 origin/main 保持同步。'),answer:'git status',check:c=>onMain(c)&&synced(c)&&c.ran(/^git status/)},
   {text:t('Create the annotated tag v1.0.0 ("Release 1.0.0") and push it.','创建附注标签 v1.0.0（说明 "Release 1.0.0"）并推送。'),answer:'git tag -a v1.0.0 -m "Release 1.0.0" && git push origin v1.0.0',check:c=>{const id=srv(c)?.refs['refs/tags/v1.0.0'];return !!id&&c.world.objects[id]?.t==='tag'&&c.world.objects[id].obj===srv(c).refs['refs/heads/main'];}},
   {text:t('In your home folder, clone the repository into release-check.','在主目录里，把仓库克隆到 release-check。'),answer:`cd ~ && git clone ${PROJECT_URL} release-check`,check:c=>{const r=c.repo('release-check');return !!r&&r.refs['refs/heads/main']===srv(c).refs['refs/heads/main'];}},
   {text:t('In release-check, show the latest commit with its tags and list the files.','在 release-check 里，查看带标签的最新提交，并列出文件。'),answer:'cd release-check && git log --oneline -1 && ls',check:c=>c.cwd()===c.home+'/release-check'&&c.ran(/^git (log|show)\b/)&&c.ran(/^ls\b/)},
  ],
 },
 ],
};
/** Teammate actions for stage hooks. */
export function projectApi(world,notify){
 const s=()=>world.servers['https://github.com/alice-wang/doc-summarise'];
 return {
  push(branch,who,message,files){serverCommit(world,s(),branch,{author:who,message,files});notify({type:'push',who:who.name,branch,message});},
  say(who,text){notify({type:'say',who:who.name,text});},
  openPR(opts){return openPullRequest(world,s(),opts);},
 };
}
