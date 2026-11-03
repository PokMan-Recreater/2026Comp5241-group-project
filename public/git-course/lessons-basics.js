// Lessons 1–14: one command each, from configuring Git to amending a commit.
import {t,newWorld,setupEnv} from './kit.js';

const README='# Notes\n\nA small project for practising Git.\n';
/** A repository at ~/<dir> with the given commits ([message, {file: text}]). */
function repoWith(env,dir,commits=[]){
 env.run(`mkdir -p ~/${dir}`,`cd ~/${dir}`,'git init -q');
 for(const [msg,files,who] of commits){
  for(const [f,c] of Object.entries(files)){if(c===null)env.run(`rm -f ${f}`);else env.file(f,c);}
  const go=()=>env.run('git add -A',`git commit -q -m "${msg}"`);
  if(who)env.as(who,go);else go();
 }
 return env;
}

export const basics=[
{
 id:'config',cmd:'git config',
 title:t('Tell Git who you are','告诉 Git 你是谁'),
 summary:t('Set the name and email stamped on every commit.','设置每个提交上记录的姓名和邮箱。'),
 explain:t(
  'Every commit records an author. Git reads it from your configuration, so the first thing to do on a new computer is set `user.name` and `user.email`. `--global` stores them in `~/.gitconfig` for every repository on this computer; without `--global` the setting only applies to the current repository.\n\nUse the same email as your GitHub account so GitHub links commits to you.',
  '每个提交都会记录作者。Git 从配置里读取作者信息，所以在新电脑上第一件事就是设置 `user.name` 和 `user.email`。`--global` 会把设置保存在 `~/.gitconfig`，对这台电脑上的所有仓库生效；不加 `--global` 则只对当前仓库生效。\n\n邮箱最好和 GitHub 账号一致，这样 GitHub 才能把提交关联到你。'),
 syntax:[['git config --global user.name "Your Name"',t('set your name for all repositories','为所有仓库设置姓名')],['git config --global user.email "you@example.com"',t('set your email','设置邮箱')],['git config --list',t('show every setting','列出所有设置')],['git config user.name',t('read one setting','读取单个设置')]],
 setup(){const w=newWorld({identity:false});return {world:w,cwd:w.home};},
 tasks:[
  {text:t('Set your name globally. Any name works.','用 --global 设置你的姓名，任何名字都可以。'),answer:'git config --global user.name "Alice Wang"',hint:t('Put a name with a space in quotes.','带空格的名字要用引号括起来。'),check:c=>!!c.world.global['user.name']},
  {text:t('Set your email globally.','用 --global 设置你的邮箱。'),answer:'git config --global user.email "alice@example.com"',check:c=>/.+@.+/.test(c.world.global['user.email']||'')},
  {text:t('List your settings to check both are saved.','列出所有设置，确认两项都已保存。'),answer:'git config --list',check:c=>c.ran(/^git config (--global )?(--list|-l)\b/)||c.ran(/^git config (--global )?user\.(name|email)$/)},
 ],
},
{
 id:'init',cmd:'git init',
 title:t('Create a repository','创建仓库'),
 summary:t('Turn a folder into a Git repository.','把一个文件夹变成 Git 仓库。'),
 explain:t(
  '`git init` creates a hidden `.git` folder. That folder *is* the repository: it holds every commit, branch and setting. The files next to it are your working tree — the copy you edit.\n\nThe new repository has no commits yet, and its first branch is called `main` here (set by `init.defaultBranch`).',
  '`git init` 会创建一个隐藏的 `.git` 文件夹。这个文件夹才是真正的仓库：所有提交、分支和设置都存在里面。它旁边的文件叫工作区（working tree），也就是你编辑的那份。\n\n新仓库还没有任何提交，第一个分支在这里叫 `main`（由 `init.defaultBranch` 决定）。'),
 syntax:[['git init',t('make the current folder a repository','把当前文件夹变成仓库')],['git init <folder>',t('create the folder and the repository','创建文件夹并初始化仓库')]],
 setup(){const w=newWorld();return {world:w,cwd:w.home};},
 tasks:[
  {text:t('Make a folder called my-project.','新建一个叫 my-project 的文件夹。'),answer:'mkdir my-project',check:c=>c.dir('my-project')},
  {text:t('Move into it.','进入这个文件夹。'),answer:'cd my-project',check:c=>c.cwd()===c.home+'/my-project'},
  {text:t('Create the repository here.','在这里创建仓库。'),answer:'git init',check:c=>!!c.repo('my-project')},
  {text:t('List all files, including hidden ones, to see .git.','列出包括隐藏文件在内的所有文件，看看 .git。'),answer:'ls -a',check:c=>c.ran(/^ls\b.*-\w*a/)},
 ],
},
{
 id:'status',cmd:'git status',
 title:t('Ask Git what changed','查看仓库状态'),
 summary:t('See the branch, staged changes and untracked files.','查看当前分支、已暂存的改动和未跟踪的文件。'),
 explain:t(
  '`git status` is the command you will run most. It never changes anything; it reports which branch you are on, what is staged for the next commit (green), what changed but is not staged (red) and which files Git is not tracking yet.\n\nRead its hints: Git tells you the next command to run.',
  '`git status` 是你最常用的命令。它不会修改任何东西，只报告：你在哪个分支、哪些改动已暂存准备提交（绿色）、哪些改动还没暂存（红色），以及哪些文件 Git 还没有跟踪。\n\n留意它给出的提示：Git 会告诉你下一步可以运行什么命令。'),
 syntax:[['git status',t('full report','完整报告')],['git status -s',t('short form: ?? untracked, A added, M modified','简短格式：?? 未跟踪，A 新增，M 修改')]],
 setup(){const w=newWorld(),env=setupEnv(w);repoWith(env,'notes');return {world:w,cwd:w.home+'/notes'};},
 tasks:[
  {text:t('Run git status in this new repository.','在这个新仓库里运行 git status。'),answer:'git status',check:c=>c.ran(/^git status/)},
  {text:t('Create todo.txt containing "Buy milk".','创建内容为 "Buy milk" 的 todo.txt。'),answer:'echo "Buy milk" > todo.txt',hint:t('echo prints text; > writes it into a file.','echo 输出文字，> 把输出写进文件。'),check:c=>c.file('notes/todo.txt')},
  {text:t('Run git status again and find todo.txt under "Untracked files".','再运行一次 git status，在 "Untracked files" 下找到 todo.txt。'),answer:'git status',check:c=>c.ran(/^git status/)},
  {text:t('Try the short form.','试试简短格式。'),answer:'git status -s',check:c=>c.ran(/^git status (-s|--short)/)},
 ],
},
{
 id:'add',cmd:'git add',
 title:t('Stage changes','暂存改动'),
 summary:t('Choose what goes into the next commit.','挑选要放进下一次提交的内容。'),
 explain:t(
  'Git does not commit everything that changed. You first copy changes into the **staging area** (also called the index) with `git add`, then `git commit` records exactly what is staged.\n\nThis lets you split work into tidy commits: stage one file, commit it, then stage the next. `git add .` stages every change in the current folder.',
  'Git 不会自动提交所有改动。你要先用 `git add` 把改动放进**暂存区**（也叫 index），`git commit` 只会记录暂存区里的内容。\n\n这样你可以把工作拆成清晰的几次提交：先暂存一个文件提交，再暂存下一个。`git add .` 会暂存当前文件夹里的所有改动。'),
 syntax:[['git add <file>',t('stage one file','暂存一个文件')],['git add .',t('stage everything under this folder','暂存当前文件夹下的所有改动')],['git add -A',t('stage every change in the repository, including deletions','暂存整个仓库的所有改动，包括删除')]],
 setup(){const w=newWorld(),env=setupEnv(w);repoWith(env,'notes');env.file('README.md',README).file('todo.txt','Buy milk\n');return {world:w,cwd:w.home+'/notes'};},
 tasks:[
  {text:t('Stage only README.md.','只暂存 README.md。'),answer:'git add README.md',check:c=>{const r=c.repo();return 'README.md' in r.index&&!('todo.txt' in r.index);}},
  {text:t('Check with git status: README.md is green, todo.txt is still red.','用 git status 确认：README.md 是绿色，todo.txt 仍是红色。'),answer:'git status',check:c=>c.ran(/^git status/)},
  {text:t('Stage everything that is left.','暂存剩下的所有改动。'),answer:'git add .',check:c=>'todo.txt' in c.repo().index},
 ],
},
{
 id:'commit',cmd:'git commit',
 title:t('Record a snapshot','提交快照'),
 summary:t('Save the staged changes as a commit with a message.','把暂存的改动保存为一个带说明的提交。'),
 explain:t(
  'A commit is a snapshot of the staged files plus a message, your name, the time and a link to the previous commit. Git names it with a hash such as `3f2a9c1`.\n\nWrite messages that finish the sentence "This commit will…": *Add README*, *Fix login redirect*. `-m` gives the message on the command line; `-a` also stages files Git already tracks.',
  '一个提交（commit）就是暂存区文件的一份快照，外加说明、你的名字、时间，以及指向上一个提交的链接。Git 用一个哈希值给它命名，例如 `3f2a9c1`。\n\n提交说明最好能接上"这个提交会……"，例如 *Add README*、*Fix login redirect*。`-m` 直接在命令行写说明；`-a` 会顺便暂存已被跟踪文件的改动。'),
 syntax:[['git commit -m "message"',t('commit what is staged','提交暂存区内容')],['git commit -am "message"',t('stage tracked changes and commit','暂存已跟踪文件的改动并提交')]],
 setup(){const w=newWorld(),env=setupEnv(w);repoWith(env,'notes');env.file('README.md',README).file('todo.txt','Buy milk\n').run('git add .');return {world:w,cwd:w.home+'/notes'};},
 tasks:[
  {text:t('Commit the staged files with the message "Add README and todo list".','用说明 "Add README and todo list" 提交已暂存的文件。'),answer:'git commit -m "Add README and todo list"',check:c=>!!c.head()},
  {text:t('Add a line "Call Sam" to todo.txt.','在 todo.txt 里加一行 "Call Sam"。'),answer:'echo "Call Sam" >> todo.txt',hint:t('>> appends instead of overwriting.','>> 是追加，不会覆盖原内容。'),check:c=>/Call Sam/.test(c.read('notes/todo.txt')||'')},
  {text:t('Stage and commit that change in one command.','用一条命令暂存并提交这个改动。'),answer:'git commit -am "Add a call to the todo list"',check:c=>{const h=c.head();return !!h&&c.commit(h).parents.length===1&&/Call Sam/.test(c.files(h)['todo.txt']||'');}},
 ],
},
{
 id:'log',cmd:'git log',
 title:t('Read the history','查看提交历史'),
 summary:t('List commits, newest first.','按从新到旧列出提交。'),
 explain:t(
  '`git log` walks back from the current commit and prints each one: its full hash, author, date and message. `(HEAD -> main)` marks where you are.\n\n`--oneline` shows one short line per commit, `-n 3` (or `-3`) limits the count, `--stat` adds which files changed and `--graph --all` draws every branch.',
  '`git log` 从当前提交往回走，逐个打印：完整哈希、作者、日期和说明。`(HEAD -> main)` 表示你当前所在的位置。\n\n`--oneline` 每个提交只显示一行，`-n 3`（或 `-3`）限制数量，`--stat` 显示改了哪些文件，`--graph --all` 画出所有分支。'),
 syntax:[['git log',t('full history','完整历史')],['git log --oneline',t('one line per commit','每个提交一行')],['git log -n 2',t('only the latest two','只看最近两个')],['git log --stat',t('with changed files','附带修改的文件')]],
 setup(){const w=newWorld(),env=setupEnv(w);repoWith(env,'recipes',[['Add pancake recipe',{'pancakes.md':'# Pancakes\n\n- 2 eggs\n- 1 cup flour\n'}],['Add milk to pancakes',{'pancakes.md':'# Pancakes\n\n- 2 eggs\n- 1 cup flour\n- 1 cup milk\n'}],['Add soup recipe',{'soup.md':'# Tomato soup\n\n- 6 tomatoes\n'},{name:'Sam Wu',email:'sam@example.com'}],['Fix typo in soup',{'soup.md':'# Tomato soup\n\n- 6 tomatoes\n- 1 onion\n'}]]);return {world:w,cwd:w.home+'/recipes'};},
 tasks:[
  {text:t('Show the full history.','显示完整历史。'),answer:'git log',check:c=>c.ran(/^git log$/)||c.ran(/^git log( --decorate)?$/)},
  {text:t('Show it with one line per commit.','每个提交只显示一行。'),answer:'git log --oneline',check:c=>c.ran(/^git log\b.*--oneline/)},
  {text:t('Show only the two newest commits.','只显示最新的两个提交。'),answer:'git log -n 2',check:c=>c.ran(/^git log\b.*(-n ?2\b|-2\b|--max-count=2)/)},
  {text:t('See which files each commit changed.','查看每个提交改了哪些文件。'),answer:'git log --stat',check:c=>c.ran(/^git log\b.*--stat/)},
 ],
},
{
 id:'diff',cmd:'git diff',
 title:t('See exactly what changed','查看具体改动'),
 summary:t('Compare the working tree, the staging area and commits line by line.','逐行比较工作区、暂存区和提交。'),
 explain:t(
  '`git diff` with no options shows changes you have **not staged** yet. After `git add`, those changes move to the staging area, so `git diff` shows nothing and `git diff --staged` shows what the next commit will contain.\n\nLines starting with `-` (red) were removed and `+` (green) were added. `@@ -3,2 +3,3 @@` says where in the file the change is.',
  '不带参数的 `git diff` 显示**还没暂存**的改动。`git add` 之后，这些改动进入暂存区，`git diff` 就不再显示，而 `git diff --staged` 会显示下一次提交将包含的内容。\n\n以 `-`（红色）开头的行被删除，`+`（绿色）开头的行是新增的。`@@ -3,2 +3,3 @@` 标出改动在文件中的位置。'),
 syntax:[['git diff',t('unstaged changes','未暂存的改动')],['git diff --staged',t('staged changes (what the next commit contains)','已暂存的改动（下一次提交的内容）')],['git diff <commit> <commit>',t('compare two commits','比较两个提交')]],
 setup(){const w=newWorld(),env=setupEnv(w);repoWith(env,'recipes',[['Add pancake recipe',{'pancakes.md':'# Pancakes\n\n- 2 eggs\n- 1 cup flour\n- 1 cup milk\n'}]]);return {world:w,cwd:w.home+'/recipes',open:'pancakes.md'};},
 tasks:[
  {text:t('Add a line "- 1 tbsp sugar" to pancakes.md (edit it in the editor and save, or use echo >>).','给 pancakes.md 加一行 "- 1 tbsp sugar"（在编辑器里修改并保存，或用 echo >>）。'),answer:'echo "- 1 tbsp sugar" >> pancakes.md',check:c=>/sugar/.test(c.read('recipes/pancakes.md')||'')},
  {text:t('Show the unstaged change.','查看未暂存的改动。'),answer:'git diff',check:c=>c.ran(/^git diff$/)},
  {text:t('Stage the file.','暂存这个文件。'),answer:'git add pancakes.md',check:c=>/sugar/.test(c.index(c.repo())['pancakes.md']||'')},
  {text:t('Show what the next commit will contain.','查看下一次提交将包含的内容。'),answer:'git diff --staged',check:c=>c.ran(/^git diff (--staged|--cached)/)},
 ],
},
{
 id:'show',cmd:'git show',
 title:t('Inspect one commit','查看单个提交'),
 summary:t('Print a commit with its full diff, or a file as it was.','打印一个提交及其完整 diff，或某个版本的文件内容。'),
 explain:t(
  '`git show` prints one commit: the same header as `git log` followed by its diff. With no argument it shows `HEAD`, the commit you are on.\n\nYou can name commits by hash (`a1b2c3d`) or relative to HEAD: `HEAD~1` is its parent, `HEAD~2` the grandparent. `git show HEAD~1:README.md` prints a file exactly as it was in that commit.',
  '`git show` 打印一个提交：和 `git log` 一样的头部信息，后面跟着这个提交的 diff。不带参数时显示 `HEAD`，也就是你当前所在的提交。\n\n提交可以用哈希（`a1b2c3d`）表示，也可以相对 HEAD 表示：`HEAD~1` 是上一个提交，`HEAD~2` 是再上一个。`git show HEAD~1:README.md` 会打印该文件在那个提交里的样子。'),
 syntax:[['git show',t('the current commit','当前提交')],['git show <commit>',t('any commit by hash, branch or HEAD~n','用哈希、分支名或 HEAD~n 指定提交')],['git show <commit>:<file>',t('a file as it was in that commit','某个提交里的文件内容')]],
 setup(){const w=newWorld(),env=setupEnv(w);repoWith(env,'recipes',[['Add pancake recipe',{'pancakes.md':'# Pancakes\n\n- 2 eggs\n- 1 cup flour\n'}],['Add milk to pancakes',{'pancakes.md':'# Pancakes\n\n- 2 eggs\n- 1 cup flour\n- 1 cup milk\n'}],['Add soup recipe',{'soup.md':'# Tomato soup\n\n- 6 tomatoes\n'}]]);return {world:w,cwd:w.home+'/recipes'};},
 tasks:[
  {text:t('Show the latest commit.','显示最新的提交。'),answer:'git show',check:c=>c.ran(/^git show( HEAD)?$/)},
  {text:t('Show the commit before it.','显示它的上一个提交。'),answer:'git show HEAD~1',check:c=>c.ran(/^git show (HEAD[~^]\d*|[0-9a-f]{4,40})\b(?!:)/)},
  {text:t('Print pancakes.md as it was in the first commit (HEAD~2).','打印 pancakes.md 在第一个提交（HEAD~2）里的内容。'),answer:'git show HEAD~2:pancakes.md',check:c=>c.ran(/^git show \S+:pancakes\.md$/,{ok:true})},
 ],
},
{
 id:'ignore',cmd:'.gitignore',
 title:t('Keep secrets and junk out','用 .gitignore 排除文件'),
 summary:t('List files Git should never track.','列出 Git 永远不该跟踪的文件。'),
 explain:t(
  'Some files must never be committed: `.env` with API keys, `node_modules/` with downloaded packages, build output and logs. Write their names or patterns in a file called `.gitignore`, one per line, and commit that file.\n\nIgnored files disappear from `git status`, and `git add .` skips them. `git check-ignore -v <file>` tells you which line ignores a file. Ignoring only works for files that are not tracked yet.',
  '有些文件绝不能提交：存放 API 密钥的 `.env`、下载的依赖 `node_modules/`、构建产物和日志。把它们的名字或通配模式写进 `.gitignore` 文件，每行一个，然后提交这个文件。\n\n被忽略的文件不会出现在 `git status` 里，`git add .` 也会跳过它们。`git check-ignore -v <文件>` 会告诉你是哪一行规则忽略了它。注意：忽略规则只对还没被跟踪的文件有效。'),
 syntax:[['echo ".env" >> .gitignore',t('ignore one file','忽略一个文件')],['node_modules/',t('a trailing / ignores a whole folder','结尾的 / 表示忽略整个文件夹')],['*.log',t('* matches any name','* 匹配任意名字')],['git check-ignore -v <file>',t('which rule ignores a file','查看是哪条规则忽略了文件')]],
 setup(){const w=newWorld(),env=setupEnv(w);repoWith(env,'shop',[['Add README',{'README.md':'# Shop\n'}]]);env.file('app.js','console.log("shop");\n').file('.env','STRIPE_KEY=sk_live_51H8xQ2\n').file('node_modules/react/index.js','module.exports={};\n').file('debug.log','boot ok\n');return {world:w,cwd:w.home+'/shop'};},
 tasks:[
  {text:t('Run git status: .env, node_modules/ and debug.log should not be committed.','运行 git status：.env、node_modules/ 和 debug.log 都不应该被提交。'),answer:'git status',check:c=>c.ran(/^git status/)},
  {text:t('Create .gitignore that ignores .env, node_modules/ and every .log file.','创建 .gitignore，忽略 .env、node_modules/ 和所有 .log 文件。'),answer:'printf ".env\\nnode_modules/\\n*.log\\n" > .gitignore',hint:t('Write three lines, or create the file in the editor (code .gitignore).','写三行规则，也可以用 code .gitignore 在编辑器里创建。'),check:c=>{const r=c.repo();return ['.env','node_modules/react/index.js','debug.log'].every(f=>c.ignored(r,f));}},
  {text:t('Ask Git which rule ignores .env.','问 Git 是哪条规则忽略了 .env。'),answer:'git check-ignore -v .env',check:c=>c.ran(/^git check-ignore\b.*\.env/)},
  {text:t('Stage everything and commit with "Add app and .gitignore".','暂存所有改动并提交，说明为 "Add app and .gitignore"。'),answer:'git add . && git commit -m "Add app and .gitignore"',check:c=>{const f=c.files(c.head());return '.gitignore' in f&&'app.js' in f&&!('.env' in f)&&!Object.keys(f).some(x=>x.startsWith('node_modules/'))&&!('debug.log' in f);}},
 ],
},
{
 id:'restore',cmd:'git restore',
 title:t('Undo changes in files','撤销文件改动'),
 summary:t('Throw away edits, or take a file back out of the staging area.','丢弃修改，或把文件移出暂存区。'),
 explain:t(
  '`git restore <file>` puts a file back to the staged (or last committed) version — your unsaved edits are **gone for good**, so check `git diff` first.\n\n`git restore --staged <file>` only unstages: the file leaves the staging area but your edits stay in the working tree. Git prints these commands as hints in `git status`.',
  '`git restore <文件>` 把文件恢复成暂存区（或上次提交）的版本——你的修改会**永久丢失**，所以先用 `git diff` 确认一下。\n\n`git restore --staged <文件>` 只是取消暂存：文件离开暂存区，但你的修改仍保留在工作区。`git status` 的提示里就会给出这两个命令。'),
 syntax:[['git restore <file>',t('discard unstaged edits','丢弃未暂存的修改')],['git restore --staged <file>',t('unstage but keep the edits','取消暂存，保留修改')],['git restore --source=HEAD~1 <file>',t('take the file from an older commit','从更早的提交取回文件')]],
 setup(){const w=newWorld(),env=setupEnv(w);repoWith(env,'shop',[['Add shop',{'README.md':'# Shop\n','app.js':'function total(items) {\n  return items.reduce((s, i) => s + i.price, 0);\n}\n'}]]);env.file('app.js','function total(items) {\n  return 42; // TODO remove this hack\n}\n').file('README.md','# Shop\n\nOpen index.html to start.\n').run('git add README.md');return {world:w,cwd:w.home+'/shop',open:'app.js'};},
 tasks:[
  {text:t('Run git status. app.js has a bad edit; README.md is staged too early.','运行 git status。app.js 有一处错误修改；README.md 被过早暂存了。'),answer:'git status',check:c=>c.ran(/^git status/)},
  {text:t('Discard the bad edit in app.js.','丢弃 app.js 里的错误修改。'),answer:'git restore app.js',check:c=>!/42/.test(c.read('shop/app.js')||'')},
  {text:t('Unstage README.md but keep its new line.','取消暂存 README.md，但保留新加的那一行。'),answer:'git restore --staged README.md',check:c=>{const r=c.repo(),i=c.index(r);return i['README.md']==='# Shop\n'&&/index\.html/.test(c.read('shop/README.md')||'');}},
 ],
},
{
 id:'rm',cmd:'git rm',
 title:t('Stop tracking files','删除或停止跟踪文件'),
 summary:t('Delete a tracked file, or untrack it but keep it on disk.','删除已跟踪的文件，或停止跟踪但保留在磁盘上。'),
 explain:t(
  '`git rm <file>` deletes the file and stages the deletion in one step. `git rm --cached <file>` only removes it from the repository: the file stays on your disk as an untracked file. That is how you fix a secret file that was committed by mistake — then add it to `.gitignore`.\n\nThe old commits still contain the file; if it was a real password, change the password too.',
  '`git rm <文件>` 一步完成删除文件并暂存这个删除。`git rm --cached <文件>` 只把它从仓库里移除：文件仍留在磁盘上，变成未跟踪文件。误提交了含密钥的文件时就这样处理，然后把它加进 `.gitignore`。\n\n注意：旧提交里仍然有这个文件；如果是真实密码，还要去更换密码。'),
 syntax:[['git rm <file>',t('delete and stage the deletion','删除并暂存这个删除')],['git rm --cached <file>',t('untrack, keep the file','停止跟踪，保留文件')],['git rm -r <folder>',t('a whole folder','整个文件夹')]],
 setup(){const w=newWorld(),env=setupEnv(w);repoWith(env,'shop',[['Add shop',{'README.md':'# Shop\n','app.js':'console.log("shop");\n','old-notes.txt':'ideas from last year\n','secrets.txt':'ADMIN_PASSWORD=hunter2\n'}]]);return {world:w,cwd:w.home+'/shop'};},
 tasks:[
  {text:t('Delete old-notes.txt from the project and the repository.','把 old-notes.txt 从项目和仓库里一起删除。'),answer:'git rm old-notes.txt',check:c=>{const r=c.repo();return !('old-notes.txt' in r.index)&&!c.file('shop/old-notes.txt');}},
  {text:t('Stop tracking secrets.txt but keep the file on disk.','停止跟踪 secrets.txt，但保留磁盘上的文件。'),answer:'git rm --cached secrets.txt',check:c=>{const r=c.repo();return !('secrets.txt' in r.index)&&c.file('shop/secrets.txt');}},
  {text:t('Ignore secrets.txt, then commit everything with "Remove old notes and untrack secrets".','忽略 secrets.txt，然后提交所有改动，说明为 "Remove old notes and untrack secrets"。'),answer:'echo "secrets.txt" >> .gitignore && git add .gitignore && git commit -m "Remove old notes and untrack secrets"',check:c=>{const f=c.files(c.head());return !('secrets.txt' in f)&&!('old-notes.txt' in f)&&'.gitignore' in f&&c.ignored(c.repo(),'secrets.txt');}},
 ],
},
{
 id:'mv',cmd:'git mv',
 title:t('Rename or move files','重命名或移动文件'),
 summary:t('Rename a tracked file and stage the rename.','重命名已跟踪的文件，并暂存这个重命名。'),
 explain:t(
  '`git mv old new` renames the file on disk and in the staging area at once, so `git status` shows `renamed: old -> new`. (Renaming with a normal `mv` works too, but then you must `git add` both paths.)\n\nIt is also the reliable way to change only the letter case of a name, which matters on Linux servers: `SessionStore.ts` and `sessionStore.ts` are different files there.',
  '`git mv 旧名 新名` 会同时在磁盘和暂存区里重命名，`git status` 会显示 `renamed: 旧名 -> 新名`。（用普通的 `mv` 也可以，但之后要对两个路径都执行 `git add`。）\n\n只改文件名大小写时，它也是最可靠的方法。这在 Linux 服务器上很重要：`SessionStore.ts` 和 `sessionStore.ts` 在那里是两个不同的文件。'),
 syntax:[['git mv <old> <new>',t('rename','重命名')],['git mv <file> <folder>/',t('move into a folder','移动到文件夹')]],
 setup(){const w=newWorld(),env=setupEnv(w);repoWith(env,'shop',[['Add shop',{'readme.txt':'# Shop\n','helpers.js':'export const money = n => `$${n}`;\n','src/app.js':'import { money } from "./helpers.js";\n'}]]);return {world:w,cwd:w.home+'/shop'};},
 tasks:[
  {text:t('Rename readme.txt to README.md.','把 readme.txt 重命名为 README.md。'),answer:'git mv readme.txt README.md',check:c=>{const r=c.repo();return 'README.md' in r.index&&!('readme.txt' in r.index);}},
  {text:t('Move helpers.js into the src folder.','把 helpers.js 移进 src 文件夹。'),answer:'git mv helpers.js src/',check:c=>'src/helpers.js' in c.repo().index},
  {text:t('Check git status shows two renames, then commit with "Tidy file names".','确认 git status 显示两个 renamed，然后提交，说明为 "Tidy file names"。'),answer:'git status && git commit -m "Tidy file names"',check:c=>{const f=c.files(c.head());return 'README.md' in f&&'src/helpers.js' in f;}},
 ],
},
{
 id:'reset',cmd:'git reset',
 title:t('Move a branch back','回退提交'),
 summary:t('Undo commits that are not pushed yet: --soft, --mixed or --hard.','撤销还没推送的提交：--soft、--mixed 或 --hard。'),
 explain:t(
  '`git reset <commit>` moves the current branch back to an older commit. What happens to the changes from the commits you undo depends on the mode:\n\n* `--soft` keeps them **staged**, ready to commit again.\n* `--mixed` (the default) keeps them in your files but **unstaged**.\n* `--hard` **throws them away** together with any uncommitted edits.\n\nOnly reset commits you have not pushed: rewriting shared history confuses teammates. For shared commits use `git revert`.',
  '`git reset <提交>` 会把当前分支移回到更早的提交。被撤销的那些提交里的改动怎么处理，取决于模式：\n\n* `--soft` 保留改动并保持**已暂存**，可以马上重新提交。\n* `--mixed`（默认）保留改动在文件里，但**未暂存**。\n* `--hard` 连同未提交的修改一起**全部丢弃**。\n\n只回退还没推送的提交：改写共享历史会让队友混乱。已经共享的提交请用 `git revert`。'),
 syntax:[['git reset --soft HEAD~1',t('undo the commit, keep changes staged','撤销提交，改动保持暂存')],['git reset HEAD~1',t('undo the commit, keep changes unstaged','撤销提交，改动变为未暂存')],['git reset --hard HEAD',t('discard every uncommitted change','丢弃所有未提交的改动')]],
 setup(){const w=newWorld(),env=setupEnv(w);repoWith(env,'shop',[['Add shop',{'app.js':'console.log("shop");\n'}],['Add cart',{'cart.js':'export const cart = [];\n'}],['WIP debugging',{'debug.js':'console.log("debug");\n'}]]);return {world:w,cwd:w.home+'/shop'};},
 tasks:[
  {text:t('Undo the "WIP debugging" commit but keep its change staged.','撤销 "WIP debugging" 提交，但让改动保持已暂存。'),answer:'git reset --soft HEAD~1',check:c=>{const r=c.repo();return c.msg(c.head())==='Add cart'&&'debug.js' in r.index;}},
  {text:t('Now undo "Add cart" too, keeping its change unstaged (the default mode).','再撤销 "Add cart"，让改动变为未暂存（默认模式）。'),answer:'git reset HEAD~1',check:c=>{const r=c.repo();return c.msg(c.head())==='Add shop'&&!('cart.js' in r.index)&&c.file('shop/cart.js');}},
  {text:t('Add a line to app.js, then throw the edit away with a hard reset.','给 app.js 加一行，然后用 hard 模式把修改丢掉。'),answer:'echo "oops" >> app.js && git reset --hard',check:c=>c.ran(/^git reset --hard/)&&c.read('shop/app.js')==='console.log("shop");\n'},
 ],
},
{
 id:'amend',cmd:'git commit --amend',
 title:t('Fix the last commit','修改最后一次提交'),
 summary:t('Change the last commit message or add a forgotten file.','修改最后一次提交的说明，或补上漏掉的文件。'),
 explain:t(
  '`git commit --amend` replaces the last commit with a new one made from the current staging area. Stage the forgotten file first, then amend; `-m` gives a new message, `--no-edit` keeps the old one.\n\nThe amended commit has a **new hash**. Like reset, only amend commits you have not pushed.',
  '`git commit --amend` 会用当前暂存区重新生成一个提交，替换掉最后一次提交。先暂存漏掉的文件再 amend；`-m` 给出新说明，`--no-edit` 保留原说明。\n\n修改后的提交会得到**新的哈希**。和 reset 一样，只修改还没推送的提交。'),
 syntax:[['git commit --amend -m "new message"',t('rewrite the message','改写提交说明')],['git commit --amend --no-edit',t('add staged files, keep the message','加入暂存的文件，保留说明')]],
 setup(){const w=newWorld(),env=setupEnv(w);repoWith(env,'shop',[['Add shop',{'index.html':'<h1>Shop</h1>\n'}],['Fix lgoin bug',{'login.js':'export const login = () => true;\n'}]]);env.file('login.css','.login { color: red; }\n');return {world:w,cwd:w.home+'/shop'};},
 tasks:[
  {text:t('login.css belongs in the last commit. Stage it.','login.css 应该属于最后一次提交，先暂存它。'),answer:'git add login.css',check:c=>'login.css' in c.repo().index},
  {text:t('Amend the commit and fix the typo: "Fix login bug".','修改最后一次提交，并改正拼写为 "Fix login bug"。'),answer:'git commit --amend -m "Fix login bug"',check:c=>{const h=c.head();return c.msg(h)==='Fix login bug'&&'login.css' in c.files(h)&&c.msg(c.commit(h).parents[0])==='Add shop';}},
  {text:t('Confirm the history has two commits.','确认历史里只有两个提交。'),answer:'git log --oneline',check:c=>c.ran(/^git log/)},
 ],
},
];
export {repoWith,README};
