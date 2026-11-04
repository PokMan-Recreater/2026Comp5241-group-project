// Lessons 15–26: branches, merging, conflicts and repairing history.
import {t,newWorld,setupEnv,JORDAN} from './kit.js';
import {repoWith} from './lessons-basics.js';

const page=(title,extra='')=>`<!doctype html>\n<html>\n<head>\n  <title>${title}</title>\n</head>\n<body>\n  <h1>${title}</h1>\n${extra}</body>\n</html>\n`;
const site=env=>repoWith(env,'site',[['Add home page',{'index.html':page('My Site')}],['Add about page',{'about.html':page('About')}],['Add contact page',{'contact.html':page('Contact')}]]);

export const branching=[
{
 id:'branch',cmd:'git branch',
 title:t('Create and list branches','创建和查看分支'),
 summary:t('A branch is a movable name for a line of work.','分支是一条工作线上可移动的名字。'),
 explain:t(
  'A branch is just a name that points at a commit. When you commit on a branch, the name moves forward to the new commit. Branches let you try a change without touching `main`.\n\n`git branch` lists branches (the current one has `*`), `git branch <name>` creates one at the current commit **without switching to it**, `-v` shows each tip and `-d` deletes a branch that is already merged.',
  '分支只是一个指向某个提交的名字。你在分支上提交时，这个名字会移动到新提交上。有了分支，你可以尝试改动而不影响 `main`。\n\n`git branch` 列出分支（当前分支前有 `*`），`git branch <名字>` 在当前提交上创建分支，**但不会切换过去**；`-v` 显示每个分支最新的提交，`-d` 删除已经合并过的分支。'),
 syntax:[['git branch',t('list local branches','列出本地分支')],['git branch <name>',t('create a branch here','在当前位置创建分支')],['git branch -v',t('with the latest commit','附带最新提交')],['git branch -d <name>',t('delete a merged branch','删除已合并的分支')]],
 setup(){const w=newWorld(),env=setupEnv(w);site(env);env.run('git branch old-experiment HEAD~1');return {world:w,cwd:w.home+'/site'};},
 tasks:[
  {text:t('List the branches.','列出所有分支。'),answer:'git branch',check:c=>c.ran(/^git branch$/)},
  {text:t('Create a branch called feature/login.','创建一个叫 feature/login 的分支。'),answer:'git branch feature/login',check:c=>!!c.repo().refs['refs/heads/feature/login']},
  {text:t('List them again with their latest commits.','再列一次，附带每个分支的最新提交。'),answer:'git branch -v',check:c=>c.ran(/^git branch (-v|-vv|--verbose)/)},
  {text:t('Delete old-experiment; it is already part of main.','删除 old-experiment，它已经包含在 main 里了。'),answer:'git branch -d old-experiment',check:c=>!c.repo().refs['refs/heads/old-experiment']},
 ],
},
{
 id:'switch',cmd:'git switch',
 title:t('Move between branches','切换分支'),
 summary:t('Switch the working tree to another branch.','把工作区切换到另一个分支。'),
 explain:t(
  '`git switch <branch>` moves `HEAD` to that branch and rewrites your files to match its latest commit. Files committed only on the other branch appear or disappear as you switch.\n\n`git switch -c <name>` creates a branch and switches to it in one step; `git switch -` goes back to the previous branch. Git refuses to switch if your uncommitted edits would be overwritten — commit or stash them first.',
  '`git switch <分支>` 把 `HEAD` 移到那个分支，并把文件改写成它最新提交的样子。只在另一个分支上提交过的文件，会随着切换出现或消失。\n\n`git switch -c <名字>` 一步完成创建分支并切换过去；`git switch -` 回到上一个分支。如果未提交的修改会被覆盖，Git 会拒绝切换——先提交或 stash。'),
 syntax:[['git switch <branch>',t('go to a branch','切换到分支')],['git switch -c <name>',t('create and switch','创建并切换')],['git switch -',t('back to the previous branch','回到上一个分支')]],
 setup(){const w=newWorld(),env=setupEnv(w);site(env);env.run('git branch feature/login');return {world:w,cwd:w.home+'/site'};},
 tasks:[
  {text:t('Switch to feature/login.','切换到 feature/login。'),answer:'git switch feature/login',check:c=>c.branch()==='feature/login'},
  {text:t('Create login.html and commit it with "Add login page".','创建 login.html 并提交，说明为 "Add login page"。'),answer:'echo "<h1>Login</h1>" > login.html && git add login.html && git commit -m "Add login page"',check:c=>{const r=c.repo();return 'login.html' in c.files(r.refs['refs/heads/feature/login']);}},
  {text:t('Switch back to main and notice login.html disappears.','切回 main，注意 login.html 消失了。'),answer:'git switch main',check:c=>c.branch()==='main'&&!c.file('site/login.html')},
  {text:t('Create and switch to a new branch hotfix/footer in one command.','用一条命令创建并切换到新分支 hotfix/footer。'),answer:'git switch -c hotfix/footer',check:c=>c.branch()==='hotfix/footer'},
 ],
},
{
 id:'checkout',cmd:'git checkout',
 title:t('The older all-in-one command','老式万能命令 checkout'),
 summary:t('Switch branches, create them or visit an old commit.','切换分支、创建分支或查看旧提交。'),
 explain:t(
  'Before `git switch` and `git restore` existed, `git checkout` did both jobs, and you will see it in many tutorials and teams. `git checkout <branch>` switches, `git checkout -b <name>` creates and switches, and `git checkout -- <file>` discards edits.\n\n`git checkout <commit>` puts you in **detached HEAD**: you can look around an old version, but new commits belong to no branch. Go back with `git checkout <branch>` or `git switch -`.',
  '在 `git switch` 和 `git restore` 出现之前，`git checkout` 同时负责这两类工作，很多教程和团队至今仍在用。`git checkout <分支>` 切换分支，`git checkout -b <名字>` 创建并切换，`git checkout -- <文件>` 丢弃修改。\n\n`git checkout <提交>` 会进入 **detached HEAD**（分离头指针）：你可以查看旧版本，但新提交不属于任何分支。用 `git checkout <分支>` 或 `git switch -` 回来。'),
 syntax:[['git checkout <branch>',t('switch','切换分支')],['git checkout -b <name>',t('create and switch','创建并切换')],['git checkout <commit>',t('visit an old commit (detached HEAD)','查看旧提交（分离头指针）')],['git checkout -- <file>',t('discard edits to a file','丢弃文件修改')]],
 setup(){const w=newWorld(),env=setupEnv(w);site(env);env.run('git branch dev');return {world:w,cwd:w.home+'/site'};},
 tasks:[
  {text:t('Switch to dev using checkout.','用 checkout 切换到 dev。'),answer:'git checkout dev',check:c=>c.branch()==='dev'&&c.ran(/^git checkout dev$/)},
  {text:t('Create and switch to docs using checkout.','用 checkout 创建并切换到 docs。'),answer:'git checkout -b docs',check:c=>c.branch()==='docs'&&c.ran(/^git checkout -b docs/)},
  {text:t('Visit the first commit (HEAD~2) and read the warning.','查看第一个提交（HEAD~2），读一读警告信息。'),answer:'git checkout HEAD~2',check:c=>{const r=c.repo();return !r.head.ref&&c.msg(c.head())==='Add home page';}},
  {text:t('Return to the docs branch.','回到 docs 分支。'),answer:'git checkout docs',check:c=>c.branch()==='docs'},
 ],
},
{
 id:'merge',cmd:'git merge',
 title:t('Combine branches','合并分支'),
 summary:t('Bring another branch\'s commits into the current branch.','把另一个分支的提交合并到当前分支。'),
 explain:t(
  '`git merge <branch>` brings the commits of `<branch>` into the branch you are on. When your branch has not moved since the other one started, Git simply moves your branch forward: a **fast-forward**, no new commit.\n\nWhen both branches have new commits, Git makes a **merge commit** with two parents. Look at the result with `git log --oneline --graph`.',
  '`git merge <分支>` 把 `<分支>` 的提交合并到你当前所在的分支。如果从对方分支分出去之后你的分支没有新提交，Git 只需把你的分支往前移：这叫 **fast-forward（快进）**，不会产生新提交。\n\n如果两边都有新提交，Git 会生成一个有两个父提交的 **merge commit（合并提交）**。用 `git log --oneline --graph` 查看结果。'),
 syntax:[['git merge <branch>',t('merge into the current branch','合并到当前分支')],['git merge --no-ff <branch>',t('always make a merge commit','总是生成合并提交')],['git merge --abort',t('give up a merge with conflicts','放弃有冲突的合并')]],
 setup(){const w=newWorld(),env=setupEnv(w);site(env);env.run('git switch -c feature/search');env.file('search.html',page('Search')).run('git add .','git commit -qm "Add search page"','git switch main','git switch -c feature/footer');env.file('footer.html','<footer>© 2026</footer>\n').run('git add .','git commit -qm "Add footer"','git switch main');env.file('index.html',page('My Site','  <p>Welcome!</p>\n')).run('git commit -qam "Welcome visitors"');return {world:w,cwd:w.home+'/site'};},
 tasks:[
  {text:t('Look at the branches with git log --oneline --graph --all.','用 git log --oneline --graph --all 查看分支。'),answer:'git log --oneline --graph --all',check:c=>c.ran(/^git log\b.*--graph/)},
  {text:t('Merge feature/search into main.','把 feature/search 合并到 main。'),answer:'git merge feature/search',check:c=>{const r=c.repo();return c.branch()==='main'&&c.isAncestor(r.refs['refs/heads/feature/search'],c.head());}},
  {text:t('Merge feature/footer into main too (it needs a merge commit).','再把 feature/footer 也合并到 main（这次需要合并提交）。'),answer:'git merge feature/footer',check:c=>{const r=c.repo();return c.isAncestor(r.refs['refs/heads/feature/footer'],c.head())&&!r.merge;}},
  {text:t('Draw the history again and find the merge.','再画一次历史，找到合并的位置。'),answer:'git log --oneline --graph',check:c=>c.ran(/^git log\b.*--graph/)},
 ],
},
{
 id:'conflict',cmd:'git merge (conflict)',
 title:t('Resolve a merge conflict','解决合并冲突'),
 summary:t('Fix lines both branches changed, then add and commit.','修好两个分支都改过的行，然后 add 并 commit。'),
 explain:t(
  'When both branches changed the same lines, Git cannot choose and stops with `CONFLICT`. It writes both versions into the file between markers:\n\n`<<<<<<< HEAD` your branch · `=======` · `>>>>>>> other` their branch.\n\nEdit the file to the version you want and **delete all three marker lines** (the editor buttons can do it for you). Then `git add` the file to mark it resolved and `git commit` to finish. `git merge --abort` gives up and restores the state before the merge.',
  '当两个分支改了同样的行，Git 无法替你选择，就会停下并报告 `CONFLICT`。它把两个版本都写进文件，用标记隔开：\n\n`<<<<<<< HEAD` 你当前分支的内容 · `=======` · `>>>>>>> 另一个分支` 对方的内容。\n\n把文件改成你想要的样子，并**删掉全部三行标记**（编辑器上方的按钮可以帮你完成）。然后用 `git add` 标记冲突已解决，再用 `git commit` 完成合并。`git merge --abort` 会放弃合并，恢复到合并前的状态。'),
 syntax:[['git merge <branch>',t('start the merge','开始合并')],['git status',t('lists "both modified" files','列出 "both modified" 的文件')],['git add <file>',t('mark it resolved','标记冲突已解决')],['git commit',t('finish the merge','完成合并')]],
 setup(){const w=newWorld(),env=setupEnv(w);site(env);env.run('git switch -c feature/title');env.file('index.html',page('Welcome to My Site')).run('git commit -qam "Use a friendlier title"','git switch main');env.file('index.html',page('My Portfolio')).run('git commit -qam "Rename site to My Portfolio"');return {world:w,cwd:w.home+'/site',open:'index.html'};},
 tasks:[
  {text:t('Merge feature/title into main.','把 feature/title 合并到 main。'),answer:'git merge feature/title',check:c=>!!c.repo().merge},
  {text:t('See which file conflicts.','查看是哪个文件冲突了。'),answer:'git status',check:c=>c.ran(/^git (status|diff)/)},
  {text:t('Open index.html, keep the title you prefer and remove every marker line, then save.','打开 index.html，保留你想要的标题，删掉所有标记行，然后保存。'),answer:'code index.html',hint:t('Use "Accept Current", "Accept Incoming" or "Accept Both" above the editor, then Ctrl+S.','可以用编辑器上方的“保留当前 / 保留传入 / 保留两者”，然后按 Ctrl+S 保存。'),check:c=>{const s=c.read('site/index.html')||'';return !/^(<{7}|={7}|>{7})/m.test(s)&&/<h1>/.test(s);}},
  {text:t('Mark it resolved and finish the merge.','标记冲突已解决并完成合并。'),answer:'git add index.html && git commit --no-edit',check:c=>{const r=c.repo();return !r.merge&&!r.unmerged&&c.commit(c.head()).parents.length===2;}},
 ],
},
{
 id:'stash',cmd:'git stash',
 title:t('Put unfinished work aside','暂时收起未完成的工作'),
 summary:t('Save uncommitted changes, get a clean tree, bring them back later.','保存未提交的改动，得到干净的工作区，之后再取回。'),
 explain:t(
  'Half-way through a change you are asked to fix something urgent on another branch, but your edits are not ready to commit. `git stash` saves them on a stack and returns your files to the last commit.\n\n`git stash list` shows saved entries, `git stash pop` reapplies the newest one and removes it from the list (`apply` keeps it). Untracked files are only stashed with `-u`.',
  '改动做到一半，突然要去另一个分支修紧急问题，但现在的修改还不适合提交。`git stash` 会把它们存到一个栈里，并把文件恢复成最后一次提交的样子。\n\n`git stash list` 查看保存的条目，`git stash pop` 恢复最新的一条并把它从列表删除（`apply` 则保留）。未跟踪的文件只有加 `-u` 才会被 stash。'),
 syntax:[['git stash',t('save and clean','保存并清空改动')],['git stash list',t('saved entries','查看保存的条目')],['git stash pop',t('reapply and drop the newest','恢复并删除最新一条')],['git stash -u',t('include untracked files','包括未跟踪文件')]],
 setup(){const w=newWorld(),env=setupEnv(w);site(env);env.run('git branch hotfix/typo');env.file('about.html',page('About','  <p>I build websites with</p>\n'));return {world:w,cwd:w.home+'/site',open:'about.html'};},
 tasks:[
  {text:t('Run git status: about.html has unfinished work.','运行 git status：about.html 有未完成的修改。'),answer:'git status',check:c=>c.ran(/^git status/)},
  {text:t('Stash it.','把它 stash 起来。'),answer:'git stash',check:c=>c.repo().stash.length>=1&&c.clean(c.repo())},
  {text:t('Fix the urgent typo: switch to hotfix/typo, then come back to main.','处理紧急任务：切换到 hotfix/typo，然后再回到 main。'),answer:'git switch hotfix/typo && git switch main',check:c=>c.ran(/^git (switch|checkout) hotfix\/typo/)&&c.branch()==='main'},
  {text:t('List the stash, then bring your work back.','查看 stash 列表，然后取回你的工作。'),answer:'git stash list && git stash pop',check:c=>c.repo().stash.length===0&&/I build websites/.test(c.read('site/about.html')||'')},
 ],
},
{
 id:'tag',cmd:'git tag',
 title:t('Mark releases','给版本打标签'),
 summary:t('Give a commit a permanent name such as v1.0.0.','给提交起一个固定的名字，例如 v1.0.0。'),
 explain:t(
  'A tag is a name for one commit that never moves — perfect for releases. A **lightweight** tag (`git tag v1.0`) is just a name. An **annotated** tag (`git tag -a v1.1 -m "…"`) also stores who tagged it, when and a message; use those for releases.\n\nTags are not pushed by `git push` on their own: push one with `git push origin v1.1`.',
  '标签（tag）是指向某个提交、永远不会移动的名字，非常适合标记发布版本。**轻量标签**（`git tag v1.0`）只是一个名字。**附注标签**（`git tag -a v1.1 -m "…"`）还会记录打标签的人、时间和说明，发布时应该用它。\n\n`git push` 默认不会推送标签，要用 `git push origin v1.1` 单独推送。'),
 syntax:[['git tag',t('list tags','列出标签')],['git tag <name>',t('lightweight tag','轻量标签')],['git tag -a <name> -m "msg"',t('annotated tag','附注标签')],['git show <tag>',t('see what a tag points to','查看标签指向的内容')]],
 setup(){const w=newWorld(),env=setupEnv(w);site(env);return {world:w,cwd:w.home+'/site'};},
 tasks:[
  {text:t('Tag the second commit (HEAD~1) as v1.0.','给第二个提交（HEAD~1）打上标签 v1.0。'),answer:'git tag v1.0 HEAD~1',check:c=>{const r=c.repo(),id=r.refs['refs/tags/v1.0'];return !!id&&c.msg(id)==='Add about page';}},
  {text:t('Create an annotated tag v1.1 on the current commit with the message "Add contact page".','在当前提交上创建附注标签 v1.1，说明为 "Add contact page"。'),answer:'git tag -a v1.1 -m "Add contact page"',check:c=>{const r=c.repo(),id=r.refs['refs/tags/v1.1'];return !!id&&c.world.objects[id]?.t==='tag';}},
  {text:t('List the tags and show v1.1.','列出标签，并查看 v1.1。'),answer:'git tag && git show v1.1',check:c=>c.ran(/^git show v1\.1/)},
 ],
},
{
 id:'rebase',cmd:'git rebase',
 title:t('Replay commits on a new base','变基：在新的基础上重放提交'),
 summary:t('Move your branch so it starts from the latest main.','把你的分支移到最新的 main 之后。'),
 explain:t(
  'While you worked on a feature branch, `main` moved on. `git rebase main` takes your branch\'s commits and replays them one by one on top of the latest `main`, giving a straight history with no merge commit.\n\nThe replayed commits get new hashes, so rebase only branches nobody else is using. If a replay conflicts, fix the file, `git add` it and run `git rebase --continue` (or `--abort`).',
  '你在功能分支上工作时，`main` 已经往前走了。`git rebase main` 会把你分支上的提交逐个取出，重新应用到最新的 `main` 之后，得到一条没有合并提交的直线历史。\n\n重放后的提交哈希会改变，所以只对没有别人在用的分支做 rebase。如果重放时冲突，修好文件、`git add`，再运行 `git rebase --continue`（或 `--abort` 放弃）。'),
 syntax:[['git rebase <branch>',t('replay current branch on top of <branch>','把当前分支重放到 <branch> 之后')],['git rebase --continue',t('after fixing a conflict','解决冲突后继续')],['git rebase --abort',t('give up','放弃变基')]],
 setup(){const w=newWorld(),env=setupEnv(w);site(env);env.run('git switch -c feature/blog');env.file('blog.html',page('Blog')).run('git add .','git commit -qm "Add blog page"');env.file('blog.html',page('Blog','  <p>First post</p>\n')).run('git commit -qam "Write first post"','git switch main');env.file('style.css','body { font-family: sans-serif; }\n').run('git add .','git commit -qm "Add stylesheet"','git switch feature/blog');return {world:w,cwd:w.home+'/site'};},
 tasks:[
  {text:t('See how main and feature/blog have split.','看看 main 和 feature/blog 是怎么分叉的。'),answer:'git log --oneline --graph --all',check:c=>c.ran(/^git log\b.*--all/)},
  {text:t('Rebase feature/blog onto main.','把 feature/blog 变基到 main 上。'),answer:'git rebase main',check:c=>{const r=c.repo();return c.branch()==='feature/blog'&&c.isAncestor(r.refs['refs/heads/main'],c.head())&&c.commit(c.head()).parents.length===1;}},
  {text:t('Draw the graph again: the history is now a straight line.','再画一次：历史已经变成一条直线。'),answer:'git log --oneline --graph --all',check:c=>c.ran(/^git log\b.*--graph/)},
 ],
},
{
 id:'cherry-pick',cmd:'git cherry-pick',
 title:t('Copy one commit','挑选单个提交'),
 summary:t('Apply a single commit from another branch to the current one.','把另一个分支上的某一个提交应用到当前分支。'),
 explain:t(
  'Sometimes you need one commit from another branch, not the whole branch — a bug fix buried in an unfinished feature, for example. `git cherry-pick <commit>` applies that commit\'s change on top of your branch as a new commit (with a new hash but the same message and author).\n\nFind the hash with `git log --oneline <branch>`.',
  '有时你只需要另一个分支上的某一个提交，而不是整个分支——比如藏在未完成功能里的一个 bug 修复。`git cherry-pick <提交>` 会把那个提交的改动作为新提交应用到你的分支上（哈希不同，但说明和作者相同）。\n\n用 `git log --oneline <分支>` 找到提交的哈希。'),
 syntax:[['git cherry-pick <commit>',t('copy one commit here','把一个提交复制过来')],['git cherry-pick --continue / --abort',t('after a conflict','冲突之后继续或放弃')]],
 setup(){const w=newWorld(),env=setupEnv(w);site(env);env.run('git switch -c experiment');env.file('gallery.html',page('Gallery')).run('git add .','git commit -qm "Start gallery page"');env.file('index.html',page('My Site').replace('<title>My Site</title>','<title>My Site | Home</title>')).run('git commit -qam "Fix page title for search engines"');env.file('gallery.html',page('Gallery','  <img src="cat.jpg">\n')).run('git commit -qam "Add first photo"','git switch main');return {world:w,cwd:w.home+'/site'};},
 tasks:[
  {text:t('Find the "Fix page title for search engines" commit on experiment.','在 experiment 分支上找到 "Fix page title for search engines" 这个提交。'),answer:'git log --oneline experiment',check:c=>c.ran(/^git log\b.*experiment/)},
  {text:t('Copy only that commit onto main.','只把这个提交复制到 main。'),answer:'git cherry-pick <hash>',hint:t('Use the 7-character hash from the log.','用日志里那串 7 位哈希。'),check:c=>{const h=c.head();return c.branch()==='main'&&c.msg(h)==='Fix page title for search engines'&&!('gallery.html' in c.files(h));}},
 ],
},
{
 id:'revert',cmd:'git revert',
 title:t('Undo a shared commit safely','安全撤销已共享的提交'),
 summary:t('Make a new commit that reverses an old one.','生成一个新提交，抵消某个旧提交的改动。'),
 explain:t(
  '`git reset` rewrites history, which breaks things for teammates once a commit is pushed. `git revert <commit>` instead adds a **new** commit that does the opposite of the old one, so history only moves forward.\n\nGit normally opens an editor for the message; `--no-edit` accepts the default "Revert …" message.',
  '`git reset` 会改写历史，一旦提交已经推送，就会给队友带来麻烦。`git revert <提交>` 则是新增一个**新**提交，做与旧提交相反的改动，历史只会往前走。\n\nGit 通常会打开编辑器让你写说明；`--no-edit` 直接使用默认的 "Revert …" 说明。'),
 syntax:[['git revert <commit>',t('reverse a commit with a new commit','用新提交抵消一个提交')],['git revert --no-edit <commit>',t('keep the default message','使用默认说明')]],
 setup(){const w=newWorld(),env=setupEnv(w);repoWith(env,'site',[['Add home page',{'index.html':page('My Site'),'style.css':'button { color: blue; }\n'}],['Change button color to red',{'style.css':'button { color: red; }\n'}],['Add about page',{'about.html':page('About')}]]);return {world:w,cwd:w.home+'/site'};},
 tasks:[
  {text:t('Find the commit that turned the buttons red.','找到把按钮改成红色的那个提交。'),answer:'git log --oneline',check:c=>c.ran(/^git (log|blame|show)/)},
  {text:t('Revert it without rewriting history.','在不改写历史的前提下撤销它。'),answer:'git revert --no-edit <hash>',check:c=>{const h=c.head();return /^Revert "Change button color to red"/.test(c.msg(h))&&/blue/.test(c.files(h)['style.css']||'')&&'about.html' in c.files(h);}},
  {text:t('Check the log: the bad commit is still there, followed by its revert.','查看日志：那个错误提交还在，后面跟着撤销它的提交。'),answer:'git log --oneline',check:c=>c.ran(/^git log/)},
 ],
},
{
 id:'reflog',cmd:'git reflog',
 title:t('Recover "lost" commits','找回“丢失”的提交'),
 summary:t('Every place HEAD has been, even after reset --hard.','HEAD 去过的每个位置，即使执行过 reset --hard。'),
 explain:t(
  'Commits are rarely truly lost. Every time `HEAD` moves — commit, switch, reset, merge — Git writes a line in the **reflog**. `git reflog` lists them newest first as `HEAD@{0}`, `HEAD@{1}`…\n\nAfter an accidental `git reset --hard`, find the commit you were on and move back to it with `git reset --hard <hash>` (or `HEAD@{n}`).',
  '提交很少会真的丢失。每当 `HEAD` 移动——提交、切换、reset、merge——Git 都会在 **reflog** 里记一行。`git reflog` 按从新到旧列出它们：`HEAD@{0}`、`HEAD@{1}`……\n\n误执行 `git reset --hard` 之后，在 reflog 里找到之前所在的提交，再用 `git reset --hard <哈希>`（或 `HEAD@{n}`）回去。'),
 syntax:[['git reflog',t('where HEAD has been','HEAD 去过的位置')],['git reset --hard HEAD@{1}',t('go back to an earlier position','回到更早的位置')]],
 setup(){const w=newWorld(),env=setupEnv(w);site(env);env.file('blog.html',page('Blog')).run('git add .','git commit -qm "Add blog page"');env.file('blog.html',page('Blog','  <p>Hello world</p>\n')).run('git commit -qam "Write first blog post"','git reset --hard HEAD~2');return {world:w,cwd:w.home+'/site'};},
 tasks:[
  {text:t('Someone ran git reset --hard HEAD~2. Check the log: the blog commits are gone.','有人执行了 git reset --hard HEAD~2。看看日志：博客相关的提交不见了。'),answer:'git log --oneline',check:c=>c.ran(/^git log/)},
  {text:t('Show the reflog to find where HEAD was before the reset.','查看 reflog，找到 reset 之前 HEAD 所在的位置。'),answer:'git reflog',check:c=>c.ran(/^git reflog/)},
  {text:t('Move main back to "Write first blog post".','把 main 移回 "Write first blog post"。'),answer:'git reset --hard HEAD@{1}',check:c=>c.msg(c.head())==='Write first blog post'&&c.branch()==='main'},
 ],
},
{
 id:'blame',cmd:'git blame',
 title:t('Who changed this line?','这一行是谁改的？'),
 summary:t('Show the commit and author behind every line of a file.','显示文件每一行来自哪个提交、哪位作者。'),
 explain:t(
  '`git blame <file>` prints each line with the commit that last changed it, its author and date. It is not about blaming people — it tells you **which commit to read** to understand why a line is the way it is.\n\nTake the hash from the line you care about and run `git show <hash>` to see the whole change and its message.',
  '`git blame <文件>` 会在每一行前面显示最后修改它的提交、作者和日期。它不是用来追究责任的，而是告诉你**该去读哪个提交**，才能理解这一行为什么是现在这样。\n\n拿到你关心那一行的哈希，再运行 `git show <哈希>`，就能看到完整的改动和说明。'),
 syntax:[['git blame <file>',t('author of every line','每一行的作者')],['git blame -L 3,5 <file>',t('only lines 3–5','只看第 3–5 行')],['git show <hash>',t('read the commit','查看那个提交')]],
 setup(){const w=newWorld(),env=setupEnv(w);repoWith(env,'api',[['Add API config',{'config.js':'export const config = {\n  port: 3000,\n  timeout: 5000,\n  retries: 3,\n};\n'}]]);env.as(JORDAN,()=>{env.file('config.js','export const config = {\n  port: 3000,\n  timeout: 500,\n  retries: 3,\n};\n').run('git commit -qam "Speed up slow requests"');});env.as({name:'Sam Wu',email:'sam@example.com'},()=>{env.file('config.js','export const config = {\n  port: 8080,\n  timeout: 500,\n  retries: 3,\n};\n').run('git commit -qam "Use port 8080 in production"');});return {world:w,cwd:w.home+'/api',open:'config.js'};},
 tasks:[
  {text:t('Requests time out too fast. Blame config.js to see who set timeout.','请求超时太快了。对 config.js 运行 blame，看看是谁设置的 timeout。'),answer:'git blame config.js',check:c=>c.ran(/^git blame\b.*config\.js/)},
  {text:t('Show the commit that changed the timeout line.','查看修改 timeout 那一行的提交。'),answer:'git show <hash>',check:c=>{const r=c.repo();const id=Object.keys(c.world.objects).find(k=>c.world.objects[k].t==='commit'&&c.world.objects[k].msg.startsWith('Speed up slow requests'));return c.log.some(e=>{const m=e.line.match(/git show ([0-9a-f]{4,40})/);return m&&id.startsWith(m[1]);})&&!!r;}},
 ],
},
];
