// Lessons 27–31: working with a remote on (simulated) GitHub.
import {t,newWorld,setupEnv,JORDAN,SARAH} from './kit.js';
import {repoWith} from './lessons-basics.js';

const URL='https://github.com/alice-wang/recipe-book.git';
const recipes=env=>repoWith(env,'recipe-book',[['Add README',{'README.md':'# Recipe book\n'}],['Add pancakes',{'pancakes.md':'# Pancakes\n\n- 2 eggs\n- 1 cup flour\n'}]]);
/** A recipe-book repository already published on GitHub and cloned to ~/recipe-book. */
function published(env){
 const s=env.server('alice-wang','recipe-book',{description:'Family recipes'});
 recipes(env);env.run(`git remote add origin ${URL}`,'git push -q -u origin main');
 return s;
}

export const remote=[
{
 id:'remote',cmd:'git remote',
 title:t('Connect to GitHub','连接远程仓库'),
 summary:t('Give a GitHub repository a short name such as origin.','给 GitHub 上的仓库起一个短名字，例如 origin。'),
 explain:t(
  'A remote is a named URL of another copy of the repository, usually on GitHub. By convention the main one is called `origin`. `git remote add origin <url>` saves it; `git remote -v` lists remotes with their URLs.\n\nAdding a remote sends nothing yet — that is what `git push` does. The empty repository `alice-wang/recipe-book` already exists on GitHub (see the GitHub tab).',
  '远程（remote）是仓库另一份副本的带名字的地址，通常在 GitHub 上。按惯例主要的那个叫 `origin`。`git remote add origin <地址>` 保存它，`git remote -v` 列出远程及其地址。\n\n添加远程时还不会发送任何东西——那是 `git push` 的工作。GitHub 上已经有一个空仓库 `alice-wang/recipe-book`（可在 GitHub 标签页查看）。'),
 syntax:[['git remote -v',t('list remotes and URLs','列出远程及地址')],['git remote add <name> <url>',t('add a remote','添加远程')],['git remote remove <name>',t('remove one','删除远程')]],
 setup(){const w=newWorld(),env=setupEnv(w);env.server('alice-wang','recipe-book',{description:'Family recipes'});recipes(env);return {world:w,cwd:w.home+'/recipe-book',github:true};},
 tasks:[
  {text:t('List the remotes (there are none yet).','列出远程（现在还没有）。'),answer:'git remote -v',check:c=>c.ran(/^git remote( -v| --verbose)?$/)},
  {text:t(`Add ${URL} as origin.`,`把 ${URL} 添加为 origin。`),answer:`git remote add origin ${URL}`,check:c=>/github\.com[/:]alice-wang\/recipe-book/.test(c.repo().config['remote.origin.url']||'')},
  {text:t('List them again with URLs.','再列一次，显示地址。'),answer:'git remote -v',check:c=>c.ran(/^git remote (-v|--verbose)$/)},
 ],
},
{
 id:'push',cmd:'git push',
 title:t('Upload commits','推送提交'),
 summary:t('Send your branch\'s commits to GitHub.','把分支上的提交发送到 GitHub。'),
 explain:t(
  '`git push` uploads commits GitHub does not have and moves the branch there. The first time, use `git push -u origin main`: `-u` remembers `origin/main` as the **upstream**, so later a plain `git push` (and `git pull`) knows where to go.\n\nPushing a new branch prints a link for opening a pull request. GitHub rejects a push when it has commits you do not have — you will fix that in the pull lesson.',
  '`git push` 会上传 GitHub 上还没有的提交，并移动那边的分支。第一次推送用 `git push -u origin main`：`-u` 会记住 `origin/main` 是**上游分支（upstream）**，之后直接 `git push`（和 `git pull`）就知道该去哪里。\n\n推送新分支时，输出里会给出创建 Pull Request 的链接。如果 GitHub 上有你本地没有的提交，推送会被拒绝——在 pull 那一课会处理这种情况。'),
 syntax:[['git push -u origin <branch>',t('first push of a branch','第一次推送分支')],['git push',t('push to the upstream','推送到上游')],['git push origin <tag>',t('push a tag','推送标签')],['git push origin --delete <branch>',t('delete a branch on GitHub','删除 GitHub 上的分支')]],
 setup(){const w=newWorld(),env=setupEnv(w);env.server('alice-wang','recipe-book',{description:'Family recipes'});recipes(env);env.run(`git remote add origin ${URL}`);return {world:w,cwd:w.home+'/recipe-book',github:true};},
 tasks:[
  {text:t('Publish main and set its upstream.','发布 main 并设置上游。'),answer:'git push -u origin main',check:c=>{const s=c.server(URL),r=c.repo();return s?.refs['refs/heads/main']===r.refs['refs/heads/main']&&r.config['branch.main.remote']==='origin';}},
  {text:t('Add soup.md, commit it, then push with a plain git push.','添加 soup.md 并提交，然后直接用 git push 推送。'),answer:'echo "# Soup" > soup.md && git add soup.md && git commit -m "Add soup" && git push',check:c=>{const s=c.server(URL);return !!s&&'soup.md' in c.files(s.refs['refs/heads/main']);}},
  {text:t('Create branch feature/desserts with one commit and publish it.','创建分支 feature/desserts，提交一次，然后发布它。'),answer:'git switch -c feature/desserts && echo "# Cake" > cake.md && git add cake.md && git commit -m "Add cake" && git push -u origin feature/desserts',check:c=>{const s=c.server(URL);return !!s?.refs['refs/heads/feature/desserts']&&s.refs['refs/heads/feature/desserts']!==s.refs['refs/heads/main'];}},
 ],
},
{
 id:'clone',cmd:'git clone',
 title:t('Download a repository','克隆仓库'),
 summary:t('Copy a GitHub repository, its whole history and branches.','复制 GitHub 上的仓库，包括完整历史和分支。'),
 explain:t(
  '`git clone <url>` creates a folder, downloads every commit, sets `origin` to the URL and checks out the default branch. Other branches arrive as remote-tracking branches such as `origin/dev`; `git switch dev` creates a local `dev` that tracks it.\n\nYou only clone once per computer. After that, `git pull` keeps the copy up to date.',
  '`git clone <地址>` 会新建文件夹、下载所有提交、把 `origin` 设为这个地址，并检出默认分支。其他分支会作为远程跟踪分支出现，例如 `origin/dev`；`git switch dev` 会创建跟踪它的本地分支 `dev`。\n\n每台电脑只需要 clone 一次，之后用 `git pull` 保持更新。'),
 syntax:[['git clone <url>',t('into a folder named after the repository','克隆到以仓库命名的文件夹')],['git clone <url> <folder>',t('choose the folder name','自定义文件夹名')],['git branch -a',t('local and remote branches','本地和远程分支')]],
 setup(){const w=newWorld(),env=setupEnv(w);const s=env.server('forma-team','style-guide',{description:'Shared CSS for every Forma page'});env.push(s,'main',SARAH,'Add colours',{'README.md':'# Style guide\n','colors.css':':root { --brand: #3b82f6; }\n'}).push(s,'main',JORDAN,'Add buttons',{'buttons.css':'.btn { border-radius: 6px; }\n'}).push(s,'dev',JORDAN,'Try dark theme',{'dark.css':':root { --bg: #111; }\n'});return {world:w,cwd:w.home,github:true};},
 tasks:[
  {text:t('Clone https://github.com/forma-team/style-guide.git.','克隆 https://github.com/forma-team/style-guide.git。'),answer:'git clone https://github.com/forma-team/style-guide.git',check:c=>!!c.repo('style-guide')},
  {text:t('Move into the new folder.','进入新文件夹。'),answer:'cd style-guide',check:c=>c.cwd()===c.home+'/style-guide'},
  {text:t('List local and remote branches.','列出本地和远程分支。'),answer:'git branch -a',check:c=>c.ran(/^git branch (-a|--all|-r)/)},
  {text:t('Create a local dev branch from origin/dev.','从 origin/dev 创建本地 dev 分支。'),answer:'git switch dev',check:c=>c.branch(c.repo('style-guide'))==='dev'},
 ],
},
{
 id:'fetch',cmd:'git fetch',
 title:t('Download without merging','只下载，不合并'),
 summary:t('Update origin/* to see what teammates pushed.','更新 origin/*，看看队友推送了什么。'),
 explain:t(
  'Your copy of `origin/main` only changes when you talk to GitHub. `git fetch` downloads new commits and moves the remote-tracking branches (`origin/main`, `origin/feature/x`) **without touching your own branches or files**.\n\nAfterwards `git status` says how far behind you are, and `git log main..origin/main` lists the commits you have not merged yet.',
  '你本地的 `origin/main` 只有在和 GitHub 通信时才会更新。`git fetch` 下载新提交并移动远程跟踪分支（`origin/main`、`origin/feature/x`），**不会改动你自己的分支和文件**。\n\n之后 `git status` 会告诉你落后多少，`git log main..origin/main` 会列出你还没合并的那些提交。'),
 syntax:[['git fetch',t('from the upstream remote','从上游远程下载')],['git fetch --prune',t('also forget deleted remote branches','同时清理已删除的远程分支')],['git log main..origin/main',t('commits you do not have yet','你还没有的提交')]],
 setup(){const w=newWorld(),env=setupEnv(w);const s=published(env);env.push(s,'main',JORDAN,'Add tomato soup',{'soup.md':'# Tomato soup\n'}).push(s,'main',JORDAN,'Add salad',{'salad.md':'# Salad\n'}).push(s,'jordan/vegan',JORDAN,'Try vegan pancakes',{'pancakes.md':'# Vegan pancakes\n'});return {world:w,cwd:w.home+'/recipe-book',github:true};},
 tasks:[
  {text:t('Jordan pushed to GitHub. Download his work.','Jordan 往 GitHub 推送了新内容，把它下载下来。'),answer:'git fetch',check:c=>{const s=c.server(URL),r=c.repo();return r.refs['refs/remotes/origin/main']===s.refs['refs/heads/main'];}},
  {text:t('Check how far behind main is.','看看 main 落后了多少。'),answer:'git status',check:c=>c.ran(/^git status/)},
  {text:t('List the commits on origin/main that main does not have.','列出 origin/main 上有、main 上没有的提交。'),answer:'git log --oneline main..origin/main',check:c=>c.ran(/^git log\b.*\.\.origin\/main/)},
 ],
},
{
 id:'pull',cmd:'git pull',
 title:t('Fetch and merge in one step','拉取并合并'),
 summary:t('Bring teammates\' commits into your branch, then push again.','把队友的提交合进你的分支，然后再推送。'),
 explain:t(
  '`git pull` is `git fetch` followed by merging the upstream branch into yours. When you have no new commits it fast-forwards; when both sides have new commits it creates a merge commit (here `pull.rebase=false` is set in the global config, so it merges).\n\nIf GitHub rejects your push with "fetch first", pull, fix any conflicts, then push again.',
  '`git pull` 相当于 `git fetch` 加上把上游分支合并进你的分支。如果你没有新提交，就直接快进；如果两边都有新提交，就生成合并提交（这里全局配置了 `pull.rebase=false`，所以会合并）。\n\n如果 GitHub 以 "fetch first" 拒绝了你的推送，就先 pull，解决可能的冲突，然后再推送。'),
 syntax:[['git pull',t('fetch + merge the upstream','fetch 并合并上游')],['git pull --rebase',t('fetch + rebase instead','fetch 后改用 rebase')]],
 setup(){const w=newWorld(),env=setupEnv(w);const s=published(env);env.file('pancakes.md','# Pancakes\n\n- 2 eggs\n- 1 cup flour\n- 1 cup milk\n').run('git commit -qam "Add milk to pancakes"');env.push(s,'main',JORDAN,'Add tomato soup',{'soup.md':'# Tomato soup\n'});return {world:w,cwd:w.home+'/recipe-book',github:true};},
 tasks:[
  {text:t('Try to push your new commit.','试着推送你的新提交。'),answer:'git push',check:c=>c.ran(/^git push/,{ok:false})},
  {text:t('GitHub has Jordan\'s commit. Pull it in.','GitHub 上有 Jordan 的提交，把它拉下来。'),answer:'git pull',check:c=>{const s=c.server(URL);return c.isAncestor(s.refs['refs/heads/main'],c.head())||s.refs['refs/heads/main']===c.head();}},
  {text:t('Push again.','再推送一次。'),answer:'git push',check:c=>c.server(URL).refs['refs/heads/main']===c.head()},
 ],
},
];
export {URL as RECIPE_URL};
