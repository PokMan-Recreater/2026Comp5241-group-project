import test from 'node:test';
import assert from 'node:assert/strict';
import {LESSONS,startLesson,command,evaluate,stepsOf,reviewPullRequest} from '../public/git-course/course.js';
import {openPullRequest,mergePullRequest,serverFor} from '../public/git-engine/server.js';
import {stripAnsi} from '../public/git-engine/format.js';

const hashOf=(state,subject)=>Object.keys(state.world.objects).filter(k=>{const o=state.world.objects[k];return o.t==='commit'&&o.msg.startsWith(subject);}).sort((a,b)=>state.world.objects[b].committer.time-state.world.objects[a].committer.time)[0].slice(0,7);
const sh=(state,line)=>{const r=command(state,line);evaluate(state);return r.lines.map(stripAnsi).join('\n');};
const resolve=(state,path,keep)=>{const abs=state.world.home+'/'+path,s=state.world.fs[abs];state.world.fs[abs]=s.replace(/<{7}[^\n]*\n([\s\S]*?)={7}\n([\s\S]*?)>{7}[^\n]*\n/g,(_,a,b)=>keep==='both'?a+b:keep==='ours'?a:b);evaluate(state);};
const pr=(state,head)=>{const s=serverFor(state.world,'https://github.com/alice-wang/doc-summarise');const p=openPullRequest(state.world,s,{head,base:'main',title:head,author:'alice-wang'});reviewPullRequest(state,p);evaluate(state);return p;};
const mergePr=(state,head)=>{const s=serverFor(state.world,'https://github.com/alice-wang/doc-summarise');const p=s.prs.find(x=>x.head===head);const res=mergePullRequest(state.world,s,p,{user:{name:'Alice Wang',email:'alice@example.com'}});assert.ok(res.ok,'merge '+head+' '+JSON.stringify(res));evaluate(state);};
const action=state=>{const st=stepsOf(LESSONS.find(l=>l.id===state.id))[state.step];st.action.run(state.world);evaluate(state);};

/** A worked solution for each lesson: strings are commands, functions act like the learner in the editor or on GitHub. */
const SOLUTIONS={
 config:['git config --global user.name "Alice Wang"','git config --global user.email "alice@example.com"','git config --list'],
 init:['mkdir my-project','cd my-project','git init','ls -a'],
 status:['git status','echo "Buy milk" > todo.txt','git status','git status -s'],
 add:['git add README.md','git status','git add .'],
 commit:['git commit -m "Add README and todo list"','echo "Call Sam" >> todo.txt','git commit -am "Add a call"'],
 log:['git log','git log --oneline','git log -n 2','git log --stat'],
 diff:['echo "- 1 tbsp sugar" >> pancakes.md','git diff','git add pancakes.md','git diff --staged'],
 show:['git show','git show HEAD~1','git show HEAD~2:pancakes.md'],
 ignore:['git status','printf ".env\\nnode_modules/\\n*.log\\n" > .gitignore','git check-ignore -v .env','git add . && git commit -m "Add app and .gitignore"'],
 restore:['git status','git restore app.js','git restore --staged README.md'],
 rm:['git rm old-notes.txt','git rm --cached secrets.txt','echo "secrets.txt" >> .gitignore && git add .gitignore && git commit -m "Remove old notes and untrack secrets"'],
 mv:['git mv readme.txt README.md','git mv helpers.js src/','git status && git commit -m "Tidy file names"'],
 reset:['git reset --soft HEAD~1','git reset HEAD~1','echo oops >> app.js && git reset --hard'],
 amend:['git add login.css','git commit --amend -m "Fix login bug"','git log --oneline'],
 branch:['git branch','git branch feature/login','git branch -v','git branch -d old-experiment'],
 switch:['git switch feature/login','echo "<h1>Login</h1>" > login.html && git add login.html && git commit -m "Add login page"','git switch main','git switch -c hotfix/footer'],
 checkout:['git checkout dev','git checkout -b docs','git checkout HEAD~2','git checkout docs'],
 merge:['git log --oneline --graph --all','git merge feature/search','git merge feature/footer','git log --oneline --graph'],
 conflict:['git merge feature/title','git status',s=>resolve(s,'site/index.html','ours'),'git add index.html && git commit --no-edit'],
 stash:['git status','git stash','git switch hotfix/typo && git switch main','git stash list && git stash pop'],
 tag:['git tag v1.0 HEAD~1','git tag -a v1.1 -m "Add contact page"','git tag && git show v1.1'],
 rebase:['git log --oneline --graph --all','git rebase main','git log --oneline --graph --all'],
 'cherry-pick':['git log --oneline experiment',s=>sh(s,`git cherry-pick ${hashOf(s,'Fix page title')}`)],
 revert:['git log --oneline',s=>sh(s,`git revert --no-edit ${hashOf(s,'Change button color')}`),'git log --oneline'],
 reflog:['git log --oneline','git reflog','git reset --hard HEAD@{1}'],
 blame:['git blame config.js',s=>sh(s,`git show ${hashOf(s,'Speed up slow requests')}`)],
 remote:['git remote -v','git remote add origin https://github.com/alice-wang/recipe-book.git','git remote -v'],
 push:['git push -u origin main','echo "# Soup" > soup.md && git add soup.md && git commit -m "Add soup" && git push','git switch -c feature/desserts && echo "# Cake" > cake.md && git add cake.md && git commit -m "Add cake" && git push -u origin feature/desserts'],
 clone:['git clone https://github.com/forma-team/style-guide.git','cd style-guide','git branch -a','git switch dev'],
 fetch:['git fetch','git status','git log --oneline main..origin/main'],
 pull:['git push','git pull','git push'],
 project:[
  'git config --global user.name "Alice Wang" && git config --global user.email "alice@example.com"','cd ~/doc-summarise && git init','printf ".env\\nnode_modules/\\n*.log\\n" > .gitignore','git check-ignore -v .env && git status','git add . && git commit -m "Initial commit"',
  'git remote add origin https://github.com/alice-wang/doc-summarise.git','git push -u origin main','git tag -a v0.1.0 -m "First version" && git push origin v0.1.0',
  'git switch -c feature/dark-mode',s=>{action(s);sh(s,'git diff');},'git restore README.md','git add components/Header.tsx && git commit -m "Add dark mode toggle"','git push -u origin feature/dark-mode',s=>pr(s,'feature/dark-mode'),s=>mergePr(s,'feature/dark-mode'),'git switch main && git pull','git branch -d feature/dark-mode',
  'git fetch','git log --oneline main..origin/main && git pull','git blame lib/auth.ts',s=>sh(s,`git show ${hashOf(s,'Refactor session handling')}`),s=>sh(s,`git revert --no-edit ${hashOf(s,'Refactor session handling')}`),'git push',
  'git switch -c hotfix/session-store','git mv lib/sessionStore.ts lib/SessionStore.ts','git add . && git commit -m "Fix SessionStore file name"','git rm --cached config/keys.json; echo "config/keys.json" >> .gitignore && git add .gitignore && git commit --amend --no-edit',s=>{sh(s,'git push -u origin hotfix/session-store');pr(s,'hotfix/session-store');},s=>{mergePr(s,'hotfix/session-store');sh(s,'git switch main && git pull');},
  s=>{sh(s,'git switch -c feature/pdf-export');action(s);},'git stash','git switch main && git fetch && git log --oneline origin/jordan/rate-limit',s=>sh(s,`git cherry-pick ${hashOf(s,'Limit summarise')} && git push`),'git switch feature/pdf-export && git stash pop','git commit -am "Add PDF export"','git reset --hard HEAD~1','git reflog && git reset --hard HEAD@{1}','git rebase main',s=>{sh(s,'git push -u origin feature/pdf-export');pr(s,'feature/pdf-export');mergePr(s,'feature/pdf-export');sh(s,'git switch main && git pull');},
  'git checkout -b feature/copy-summary',s=>{action(s);sh(s,'git commit -am "Add copy summary link"');},'git fetch && git merge origin/main',s=>{resolve(s,'doc-summarise/components/Header.tsx','both');sh(s,'git add components/Header.tsx && git commit --no-edit');},s=>{sh(s,'git push -u origin feature/copy-summary');pr(s,'feature/copy-summary');mergePr(s,'feature/copy-summary');sh(s,'git switch main && git pull');},
  'git status','git tag -a v1.0.0 -m "Release 1.0.0" && git push origin v1.0.0','cd ~ && git clone https://github.com/alice-wang/doc-summarise.git release-check','cd release-check && git log --oneline -1 && ls',
 ],
};

for(const lesson of LESSONS){
 test(`lesson "${lesson.id}" can be completed step by step`,()=>{
  const state=startLesson(lesson.id),steps=stepsOf(lesson),plan=SOLUTIONS[lesson.id];
  assert.ok(plan,'missing solution for '+lesson.id);
  assert.equal(plan.length,steps.length,`solution length for ${lesson.id}`);
  plan.forEach((move,i)=>{
   assert.equal(state.step,i,`${lesson.id}: before step ${i+1} (${steps[i].text.en})`);
   const out=typeof move==='function'?move(state):sh(state,move);
   assert.equal(state.step,i+1,`${lesson.id}: step ${i+1} not completed: ${steps[i].text.en}\n${typeof move==='string'?move:''}\n${out??''}`);
  });
  assert.ok(state.done);
 });
}
test('the project uses every command the lessons teach',()=>{
 const project=LESSONS.find(l=>l.id==='project'),answers=SOLUTIONS.project.map(String).join('\n')+stepsOf(project).map(s=>s.answer).join('\n');
 for(const l of LESSONS.filter(l=>l.id!=='project')){
  const word=l.id==='ignore'?'check-ignore':l.id==='amend'?'--amend':l.id==='conflict'?'merge':l.id==='config'?'git config':'git '+l.id;
  assert.ok(answers.includes(word),`project never uses ${word}`);
 }
});
test('a step is not completed by the wrong command',()=>{
 const state=startLesson('add');sh(state,'git add .');
 assert.equal(state.step,0,'staging everything must not count as staging only README.md');
});
