import test from 'node:test';
import assert from 'node:assert/strict';
import {createRepo,runGit,writeFile,resolveConflictFile,gitMilestones,gitComplete,GIT_SEED_FILES,GIT_DRILLS,GIT_SITUATIONS,startScenario,scenarioTasks,scenarioComplete,scenarioById} from '../public/git-sim.js';
import {labs} from '../public/academy-content.js';
import {renderLabBody} from '../public/lab-views.js';
const APP_RESOLVED='export function validateSignup(form) {\n  return form.name.trim().length > 2;\n}';

/** Runs a list of commands and returns the final repository plus every output. */
function play(...commands){
 let repo=createRepo();
 const outputs=[],mistakes=[];
 for(const command of commands){
  const step=runGit(repo,command);
  repo=step.repo;
  outputs.push(step.output.join('\n'));
  if(step.mistake)mistakes.push(step.mistake);
 }
 return {repo,outputs,mistakes,last:outputs.at(-1)};
}
/** A repository with one commit, ready for the scenario under test. */
const committed=()=>play('git init','git add .','git commit -m "Initial version"').repo;

test('commands are refused until a repository exists, and init seeds a project',()=>{
 const {mistakes,last}=play('git status','git commit -m "start"');
 assert.equal(mistakes.length,2);
 assert.match(last,/not a git repository/);
 assert.deepEqual(play('git init').repo.files,{...GIT_SEED_FILES});
 assert.match(play('git init').last,/Initialized empty Git repository/);
});

test('the everyday workflow needs staging first, then records the snapshot',()=>{
 const blocked=play('git init','git commit -m "nothing staged"');
 assert.equal(blocked.mistakes.length,1);
 assert.match(blocked.last,/nothing added to commit/);
 const {repo,outputs,mistakes}=play('git init','git add .','git commit -m "Initial version"','git log --oneline');
 assert.equal(mistakes.length,0);
 assert.equal(repo.commits.length,1);
 assert.equal(repo.branches.main,repo.commits[0].id);
 assert.match(outputs[2],/\[main [0-9a-f]{7}\] Initial version/);
 assert.match(outputs.at(-1),/Initial version/);
 assert.deepEqual(play('git init','git add .','git commit').mistakes.length,1);
});

test('status separates staged, unstaged and untracked work',()=>{
 let repo=committed();
 repo=writeFile(repo,'notes.txt','Review checklist:\n- write a failing test first');
 assert.match(runGit(repo,'git status --short').output.join('\n'),/ M notes\.txt/);
 repo=runGit(repo,'git add .').repo;
 assert.match(runGit(repo,'git status --short').output.join('\n'),/M {2}notes\.txt/);
 assert.match(runGit(repo,'git status').output.join('\n'),/Changes to be committed/);
 assert.match(runGit(repo,'git diff --staged').output.join('\n'),/\+- write a failing test first/);
});

test('branches move independently and a fast-forward merge moves the pointer',()=>{
 let repo=committed();
 repo=runGit(repo,'git branch feature/form').repo;
 repo=runGit(repo,'git switch feature/form').repo;
 repo=writeFile(repo,'notes.txt','Review checklist:\n- write a failing test first');
 repo=runGit(repo,'git add .').repo;
 repo=runGit(repo,'git commit -m "Ask for a test first"').repo;
 const featureTip=repo.branches['feature/form'];
 assert.notEqual(repo.branches.main,featureTip);
 repo=runGit(repo,'git switch main').repo;
 assert.equal(repo.branches.main,repo.commits[0].id);
 const merged=runGit(repo,'git merge feature/form');
 assert.match(merged.output.join('\n'),/Fast-forward/);
 assert.equal(merged.repo.branches.main,featureTip);
});

test('a divergent merge records two parents and combines both changes',()=>{
 let repo=committed();
 repo=runGit(repo,'git switch -c feature/validation').repo;
 repo=writeFile(repo,'src/app.js','export function validateSignup(form) {\n  return form.name.trim().length > 2;\n}');
 repo=runGit(repo,'git add .').repo;
 repo=runGit(repo,'git commit -m "Require three characters"').repo;
 repo=runGit(repo,'git switch main').repo;
 repo=writeFile(repo,'notes.txt','Review checklist:\n- keep commits small\n- run the checks before review');
 repo=runGit(repo,'git add .').repo;
 repo=runGit(repo,'git commit -m "Add a checks reminder"').repo;
 const merged=runGit(repo,'git merge feature/validation');
 assert.equal(merged.repo.conflict,null);
 const merge=merged.repo.commits.at(-1);
 assert.equal(merge.parents.length,2);
 for(const parent of merge.parents)assert.ok(merged.repo.commits.some(c=>c.id===parent),'every parent must be a real commit');
 assert.ok(merged.repo.commits.some(c=>c.id===merged.repo.branches.main),'the branch tip must be a commit id');
 assert.equal(merge.tree['src/app.js'],'export function validateSignup(form) {\n  return form.name.trim().length > 2;\n}');
 assert.match(merge.tree['notes.txt'],/run the checks before review/);
});

/** A repository whose two branches both changed the same line. */
function conflicted(){
 let repo=committed();
 repo=runGit(repo,'git switch -c feature/validation').repo;
 repo=writeFile(repo,'src/app.js','export function validateSignup(form) {\n  return form.name.trim().length > 2;\n}');
 repo=runGit(repo,'git add .').repo;
 repo=runGit(repo,'git commit -m "Require three characters"').repo;
 repo=runGit(repo,'git switch main').repo;
 repo=writeFile(repo,'src/app.js','export function validateSignup(form) {\n  return form.name.trim() !== "";\n}');
 repo=runGit(repo,'git add .').repo;
 repo=runGit(repo,'git commit -m "Reject blank names only"').repo;
 return runGit(repo,'git merge feature/validation');
}

test('a conflicting merge writes markers, refuses to stage them, and finishes after the edit',()=>{
 const merge=conflicted();
 assert.deepEqual(merge.repo.conflict.paths,['src/app.js']);
 assert.match(merge.output.join('\n'),/CONFLICT \(content\): Merge conflict in src\/app\.js/);
 assert.match(merge.repo.files['src/app.js'],/<<<<<<< HEAD/);
 assert.match(merge.repo.files['src/app.js'],/>>>>>>> feature\/validation/);
 assert.match(runGit(merge.repo,'git status').output.join('\n'),/both modified: {3}src\/app\.js/);
 const blocked=runGit(merge.repo,'git commit -m "during conflict"');
 assert.match(blocked.output.join('\n'),/unmerged files/);
 const markers=runGit(merge.repo,'git add src/app.js');
 assert.match(markers.output.join('\n'),/still contains conflict markers/);
 assert.deepEqual(markers.repo.conflict.paths,['src/app.js'],'the merge must stay open while the markers are there');
 assert.equal(markers.repo.mistakes.length,1);
 assert.match(runGit(markers.repo,'git commit -m "commit the markers"').output.join('\n'),/unmerged files/);
 const staged=runGit(writeFile(markers.repo,'src/app.js',APP_RESOLVED),'git add src/app.js');
 assert.deepEqual(staged.repo.conflict.paths,[]);
 assert.match(staged.output.join('\n'),/Resolved 'src\/app\.js'/);
 const done=runGit(staged.repo,'git commit -m "Merge the validation rules"');
 assert.equal(done.repo.conflict,null);
 assert.equal(done.repo.commits.at(-1).parents.length,2);
 for(const parent of done.repo.commits.at(-1).parents)assert.ok(done.repo.commits.some(c=>c.id===parent),'a resolved merge must point at real commits');
 assert.ok(done.repo.commits.some(c=>c.id===done.repo.branches.main));
 assert.equal(/<<<<<<</.test(String(done.repo.commits.at(-1).tree['src/app.js'])),false,'no markers may reach the commit');
});

test('merge --abort restores the branch, index and files from before the merge',()=>{
 const merge=conflicted();
 const before=merge.repo.conflict.snapshot;
 const aborted=runGit(merge.repo,'git merge --abort');
 assert.equal(aborted.repo.conflict,null);
 assert.deepEqual(aborted.repo.files,before.files);
 assert.deepEqual(aborted.repo.branches,before.branches);
 assert.equal(aborted.repo.mistakes.length,0);
});

test('switching is refused when unsaved edits would be overwritten, and stash unblocks it',()=>{
 let repo=committed();
 repo=runGit(repo,'git switch -c feature/form').repo;
 repo=writeFile(repo,'notes.txt','Review checklist:\n- a different version on this branch');
 repo=runGit(repo,'git add .').repo;
 repo=runGit(repo,'git commit -m "Change the checklist"').repo;
 repo=writeFile(repo,'notes.txt','Review checklist:\n- unsaved edit');
 const refused=runGit(repo,'git switch main');
 assert.match(refused.output.join('\n'),/would be overwritten by switch/);
 assert.match(refused.mistake.fix[0],/git stash/);
 const stashed=runGit(refused.repo,'git stash');
 assert.match(stashed.output.join('\n'),/Saved working directory/);
 assert.equal(stashed.repo.files['notes.txt'],'Review checklist:\n- a different version on this branch');
 const switched=runGit(stashed.repo,'git switch main');
 assert.equal(switched.repo.head.name,'main');
 const restored=runGit(switched.repo,'git stash pop');
 assert.equal(restored.repo.files['notes.txt'],'Review checklist:\n- unsaved edit');
 assert.equal(restored.repo.stash.length,0);
});

test('reset, revert and cherry-pick rewrite history the way Git does',()=>{
 let repo=committed();
 repo=writeFile(repo,'notes.txt','Review checklist:\n- keep commits small\n- run the checks');
 repo=runGit(repo,'git add .').repo;
 repo=runGit(repo,'git commit -m "Add a checks reminder"').repo;
 const tip=repo.branches.main;
 const hard=runGit(repo,'git reset --hard HEAD~1');
 assert.notEqual(hard.repo.branches.main,tip);
 assert.equal(hard.repo.files['notes.txt'],GIT_SEED_FILES['notes.txt']);
 assert.equal(hard.repo.mistakes.length,0);
 const picked=runGit(hard.repo,'git cherry-pick '+tip);
 assert.match(picked.repo.commits.at(-1).message,/cherry picked from/);
 assert.match(picked.repo.files['notes.txt'],/run the checks/);
 assert.equal(picked.repo.mistakes.length,0);
 const reverted=runGit(picked.repo,'git revert HEAD');
 assert.match(reverted.repo.commits.at(-1).message,/^Revert "Add a checks reminder/);
 assert.equal(reverted.repo.files['notes.txt'],GIT_SEED_FILES['notes.txt']);
});

test('a rebase replays commits, and one that would conflict changes nothing',()=>{
 let repo=committed();
 repo=runGit(repo,'git switch -c feature/form').repo;
 repo=writeFile(repo,'notes.txt','Review checklist:\n- branch edit');
 repo=runGit(repo,'git add .').repo;
 repo=runGit(repo,'git commit -m "Branch edit"').repo;
 repo=runGit(repo,'git switch main').repo;
 repo=writeFile(repo,'README.md','# Team project\nA small web app the team builds together.\nMain edit');
 repo=runGit(repo,'git add .').repo;
 repo=runGit(repo,'git commit -m "Main edit"').repo;
 const mainReadme=repo.files['README.md'];
 repo=runGit(repo,'git switch feature/form').repo;
 const rebased=runGit(repo,'git rebase main');
 assert.equal(rebased.repo.mistakes.length,0);
 assert.match(rebased.output.join('\n'),/Successfully rebased/);
 assert.equal(rebased.repo.files['README.md'],mainReadme);
 assert.equal(runGit(rebased.repo,'git log --oneline').output.length,3);
 let clash=committed();
 clash=runGit(clash,'git switch -c feature/validation').repo;
 clash=writeFile(clash,'src/app.js','export function validateSignup(form) {\n  return form.name.trim().length > 2;\n}');
 clash=runGit(clash,'git add .').repo;
 clash=runGit(clash,'git commit -m "Require three characters"').repo;
 clash=runGit(clash,'git switch main').repo;
 clash=writeFile(clash,'src/app.js','export function validateSignup(form) {\n  return form.name.trim() !== "";\n}');
 clash=runGit(clash,'git add .').repo;
 clash=runGit(clash,'git commit -m "Reject blank names only"').repo;
 clash=runGit(clash,'git switch feature/validation').repo;
 const stopped=runGit(clash,'git rebase main');
 assert.equal(stopped.repo.mistakes.length,0);
 assert.match(stopped.output.join('\n'),/would conflict while replaying/);
 assert.deepEqual(stopped.repo.files,clash.files);
 assert.deepEqual(stopped.repo.commits,clash.commits);
 const midMerge=conflicted();
 const during=runGit(midMerge.repo,'git rebase main');
 assert.equal(during.repo.mistakes.length,1);
 assert.match(during.output.join('\n'),/already a merge in progress/);
});

test('clone, the non-fast-forward refusal and pull',()=>{
 const cloned=play('git clone https://example.edu/team/project.git');
 assert.equal(cloned.mistakes.length,0);
 assert.equal(cloned.repo.commits.length,2);
 assert.equal(cloned.repo.head.name,'main');
 assert.match(cloned.outputs[0],/Cloning into 'project'/);
 assert.match(runGit(cloned.repo,'git push origin main').output.join('\n'),/Everything up-to-date/);
 const repo=cloned.repo;
 const teammate={id:'fffffff',message:'Teammate work',parents:[repo.branches.main],tree:{...repo.files},branch:'main',at:9};
 repo.remotes.origin.objects[teammate.id]=teammate;
 repo.remotes.origin.branches.main=teammate.id;
 const rejected=runGit(repo,'git push origin main');
 assert.match(rejected.output.join('\n'),/non-fast-forward/);
 assert.match(rejected.mistake.fix[0],/git pull first/);
 const pulled=runGit(repo,'git pull origin main');
 assert.equal(pulled.repo.mistakes.length,0);
 assert.equal(pulled.repo.branches.main,teammate.id);
 assert.match(runGit(pulled.repo,'git push origin main').output.join('\n'),/Everything up-to-date/);
 assert.match(runGit(createRepo(),'git clone https://example.edu/team/project.git').output.join('\n'),/Cloning into/);
});

test('branch deletion protects unmerged work and the current branch',()=>{
 let repo=committed();
 repo=runGit(repo,'git switch -c feature/form').repo;
 repo=writeFile(repo,'notes.txt','Review checklist:\n- unmerged work');
 repo=runGit(repo,'git add .').repo;
 repo=runGit(repo,'git commit -m "Unmerged work"').repo;
 repo=runGit(repo,'git switch main').repo;
 assert.match(runGit(repo,'git branch -d feature/form').output.join('\n'),/not fully merged/);
 const forced=runGit(repo,'git branch -D feature/form');
 assert.equal(forced.repo.branches['feature/form'],undefined);
 assert.equal(forced.repo.mistakes.length,0);
 repo=forced.repo;
 assert.match(runGit(repo,'git branch -d main').output.join('\n'),/Cannot delete branch 'main'/);
 assert.deepEqual(runGit(repo,'git branch -a').output.join('\n').split('\n').filter(Boolean),['* main']);
});

test('every refusal explains the reason and the command to use instead',()=>{
 const {mistakes}=play('git init','git add .','git commit -m "Initial version"','git add missing.txt','git commit -m "again"','git merge nothing');
 assert.equal(mistakes.length,3);
 for(const m of mistakes){
  assert.match(m.command,/^git /);
  assert.equal(m.why.length,3);
  assert.equal(m.fix.length,3);
  assert.ok(m.why[0].length>10&&m.fix[0].length>10,m.command);
 }
 assert.match(mistakes[0].fix[0],/git status/);
 assert.deepEqual(play('git init','git add .','git commit -m "Initial version"','git status','git log --oneline','git branch feature','git switch feature','git diff').mistakes,[]);
});

test('an unknown command suggests the closest supported one',()=>{
 const {mistakes,last}=play('git init','git commmit -m "typo"','git stats');
 assert.match(last,/not a git command/);
 assert.match(last,/Did you mean 'status'\?/);
 assert.match(mistakes[0].message,/Did you mean 'commit'\?/);
 assert.deepEqual(mistakes[0].fix.length,3);
});

test('the required goals drive lab completion',()=>{
 assert.equal(gitComplete(createRepo()),false);
 assert.equal(gitMilestones(createRepo()).filter(m=>m.core).length,4);
 let repo=committed();
 repo=runGit(repo,'git switch -c feature/form').repo;
 repo=writeFile(repo,'notes.txt','Review checklist:\n- branch work');
 repo=runGit(repo,'git add .').repo;
 repo=runGit(repo,'git commit -m "Branch work"').repo;
 repo=runGit(repo,'git switch main').repo;
 assert.equal(gitComplete(repo),false);
 const merged=runGit(repo,'git merge feature/form').repo;
 assert.equal(gitComplete(merged),true);
 assert.deepEqual(gitMilestones(merged).filter(m=>!m.core&&m.done).map(m=>m.id),['repository']);
});

test('git help lists what this sandbox really runs',()=>{
 const listed=runGit(createRepo(),'git help').output.join('\n');
 for(const command of ['merge','rebase','stash','push','revert','cherry-pick'])assert.match(listed,new RegExp('git '+command));
 assert.match(listed,/refuses anything else instead of pretending/);
 assert.match(runGit(createRepo(),'git help merge').output.join('\n'),/usage: git merge/);
 assert.match(runGit(createRepo(),'git help frobnicate').output.join('\n'),/No manual entry for frobnicate/);
 assert.match(runGit(createRepo(),'git version').output.join('\n'),/teaching sandbox/);
 assert.match(runGit(createRepo(),'git rm notes.txt').output.join('\n'),/not a git repository/);
});

/** The documented fix for each scenario, which proves the scenarios are solvable. */
const SCENARIO_FIXES={
 divergent:['git merge feature/validation',r=>writeFile(r,'src/app.js',APP_RESOLVED),'git add src/app.js','git commit -m "Merge the validation rules"'],
 'teammate-pushed':['git add .','git commit -m "Add a local note"','git pull origin main','git push origin main'],
 'conflict-and-push':['git add .','git commit -m "Reject blank names only"','git pull origin main',r=>writeFile(r,'src/app.js',APP_RESOLVED),'git add src/app.js','git commit -m "Merge the teammate change"','git push origin main'],
 'stash-hotfix':['git stash','git switch main',r=>writeFile(r,'README.md',r.files['README.md']+'\nUrgent: sign-up is broken'),'git add README.md','git commit -m "Urgent: note the sign-up outage"','git switch feature/form','git stash pop'],
 'revert-bad':['git log --oneline','git revert HEAD'],
 'wrong-branch':['git branch feature/format','git reset --hard HEAD~1','git switch feature/format'],
 'rebase-review':['git rebase main']
};

test('every production situation is split into small ordered tasks that its documented fix completes',()=>{
 assert.equal(GIT_SITUATIONS.length,7);
 assert.deepEqual(Object.keys(SCENARIO_FIXES).sort(),GIT_SITUATIONS.map(s=>s.id).sort());
 assert.ok(GIT_SITUATIONS.every(s=>s.tasks.length>=2),'every situation must be broken into small tasks');
 assert.ok(GIT_SITUATIONS.reduce((n,s)=>n+s.tasks.length,0)>=28,'the work must be broken into many small steps');
 for(const scenario of GIT_SITUATIONS)for(const task of scenario.tasks){
  const commands=(task.hint[0].match(/(^|\s)git\s/g)||[]).length;
  assert.ok(commands<=1,scenario.id+'/'+task.id+' must not chain commands');
  if(commands===0)assert.match(task.hint[0],/file editor/,scenario.id+'/'+task.id+' must be a single editor step');
  assert.ok(!/\bthen\b/.test(task.hint[0]),scenario.id+'/'+task.id+' must not chain steps');
 }
 for(const scenario of GIT_SITUATIONS){
  let repo=startScenario(scenario.id);
  assert.deepEqual(scenarioTasks(repo).filter(t=>t.done),[],scenario.id+' must start unsolved');
  assert.deepEqual(scenarioTasks(runGit(repo,'git status').repo).filter(t=>t.done),[],scenario.id+' must not latch a task before the one before it is done');
  assert.equal(scenarioComplete(repo),false,scenario.id);
  assert.equal(repo.stats.commits,0,scenario.id+' resets the counters so only the learner\'s work counts');
  assert.ok(repo.transcript.some(line=>line.startsWith('$ git ')),scenario.id+' writes its setup into the terminal');
  assert.ok(scenario.tasks.every(t=>t.label.length===3&&t.hint.length===3),scenario.id+' localizes every task and hint');
  assert.deepEqual(scenarioTasks(repo).map(t=>t.id),scenario.tasks.map(t=>t.id),scenario.id+' keeps the task order');
  for(const step of SCENARIO_FIXES[scenario.id])repo=typeof step==='function'?step(repo):runGit(repo,step).repo;
  assert.equal(scenarioComplete(repo),true,scenario.id+' is solved by its documented fix');
  assert.deepEqual(repo.mistakes,[],scenario.id+' should not need a mistake to be solved');
  // Replay the fix once more, checking that a task never un-ticks along the way.
  let replay=startScenario(scenario.id),progress=0;
  for(const step of SCENARIO_FIXES[scenario.id]){
   replay=typeof step==='function'?step(replay):runGit(replay,step).repo;
   const now=scenarioTasks(replay).filter(t=>t.done).length;
   assert.ok(now>=progress,scenario.id+' must not lose progress at '+step);
   progress=now;
  }
  assert.equal(progress,scenario.tasks.length,scenario.id+' ticks every task while replaying');
 }
 assert.equal(scenarioComplete(createRepo()),false);
 assert.deepEqual(scenarioTasks(createRepo()),[]);
 assert.equal(scenarioById('nope'),null);
 assert.equal(startScenario('nope').scenario.id,GIT_DRILLS[0].id);
});

test('every small practice asks for exactly one command and is solved by it',()=>{
 assert.ok(GIT_DRILLS.length>=16,'the practice should cover the everyday commands');
 const fixFor={
  'copy-commit':repo=>['git cherry-pick '+repo.commits.find(c=>c.message==='Require three characters').id]
 };
 for(const drill of GIT_DRILLS){
  assert.equal(drill.tasks.length,1,drill.id+' must ask for one thing');
  assert.equal(drill.kind,'drill');
  assert.equal(drill.tasks[0].label.length,3,drill.id+' localizes its label');
  let repo=startScenario(drill.id);
  const task=scenarioTasks(repo)[0];
  const commands=(task.hint[0].match(/(^|\s)git\s/g)||[]).length;
  assert.ok(commands<=1,drill.id+' must not chain commands');
  if(commands===0)assert.match(task.hint[0],/file editor/,drill.id+' must be a single editor step');
  assert.deepEqual(scenarioTasks(repo).filter(t=>t.done),[],drill.id+' must start unsolved');
  assert.equal(scenarioComplete(repo),false,drill.id);
  const steps=(fixFor[drill.id]??(()=>[drill.solution[0]]))(repo);
  for(const step of steps)repo=typeof step==='function'?step(repo):runGit(repo,step).repo;
  assert.equal(scenarioComplete(repo),true,drill.id+' is solved by '+steps[0]);
  assert.deepEqual(repo.mistakes,[],drill.id+' should not need a mistake to be solved');
  assert.ok(repo.transcript.some(line=>line.startsWith('$ git ')),drill.id+' shows its setup');
 }
 assert.ok(GIT_DRILLS.every(d=>d.tasks.length===1));
 assert.equal(scenarioById('read-status').kind,'drill');
});

test('a wrong first move still gets a hint that works',()=>{
 let repo=startScenario('create-branch');
 repo=runGit(repo,'git branch feature/form').repo;
 assert.equal(scenarioTasks(repo)[0].hint[0],'git switch feature/form','the hint must fit the state');
 assert.equal(scenarioComplete(runGit(repo,scenarioTasks(repo)[0].hint[0]).repo),true);
 const staged=runGit(startScenario('stage-one-file'),'git add .').repo;
 assert.equal(scenarioComplete(staged),false,'staging everything is not staging one file');
 assert.equal(scenarioTasks(staged)[0].hint[0],'git restore --staged README.md');
 assert.equal(scenarioComplete(runGit(staged,'git restore --staged README.md').repo),true,'unstaging the other file finishes the task');
 const discard=runGit(startScenario('discard-edit'),'git add .').repo;
 assert.equal(scenarioTasks(discard)[0].hint[0],'git restore --staged --worktree src/app.js');
 assert.equal(scenarioComplete(runGit(discard,'git restore --staged --worktree src/app.js').repo),true);
 const fetched=runGit(startScenario('get-teammate-work'),'git fetch origin').repo;
 assert.equal(scenarioComplete(fetched),false,'fetching must not count as pulling');
 assert.equal(scenarioComplete(runGit(fetched,'git pull origin main').repo),true);
 const cleaned=runGit(startScenario('preview-clean'),'git clean -f').repo;
 assert.equal(scenarioComplete(cleaned),false,'deleting is not previewing');
 assert.match(scenarioTasks(cleaned)[0].hint[0],/file editor/);
 const undone=runGit(startScenario('undo-commit-keep-work'),'git reset --hard HEAD~1').repo;
 assert.match(scenarioTasks(undone)[0].hint[0],/file editor/,'after a --hard reset the hint must ask for the work to be put back');
 const dropped=runGit(startScenario('undo-shared-commit'),'git reset --hard HEAD~1').repo;
 assert.match(scenarioTasks(dropped)[0].hint[0],/id from reflog/,'after a --hard reset the hint must point at the reflog');
});

test('a --hard reset says what it discarded instead of losing it silently',()=>{
 const dirty=writeFile(committed(),'src/app.js','export function validateSignup() {\n  return true;\n}');
 const reset=runGit(dirty,'git reset --hard HEAD');
 assert.match(reset.output.join('\n'),/warning: 1 uncommitted change was discarded: src\/app\.js/);
 assert.match(reset.output.join('\n'),/git reflog/);
 assert.equal(reset.repo.files['src/app.js'],GIT_SEED_FILES['src/app.js']);
 assert.equal(/warning/.test(runGit(committed(),'git reset --hard HEAD').output.join('\n')),false,'a clean reset must stay quiet');
});

test('a --hard reset warns about the commit it drops, and the reflog brings it back',()=>{
 const bad=runGit(startScenario('undo-shared-commit'),'git reset --hard HEAD~1');
 assert.match(bad.output.join('\n'),/warning: 1 commit is no longer on main: [0-9a-f]{7} Skip the name check/);
 assert.match(bad.output.join('\n'),/git reset --hard <id> brings it back/);
 const log=runGit(bad.repo,'git reflog').output.join('\n');
 assert.match(log,/^[0-9a-f]{7} HEAD@\{0\}: commit: Skip the name check/m);
 assert.match(log,/0000000 HEAD@\{2\}: repository created/);
 const id=bad.repo.reflog.find(e=>e.text&&/Skip the name check/.test(e.text)).id;
 const back=runGit(bad.repo,'git reset --hard '+id).repo;
 assert.equal(back.branches.main,id);
 assert.equal(scenarioComplete(runGit(back,'git revert HEAD').repo),true,'the situation can be finished again');
});

test('git restore --staged --worktree puts a staged file back, as Git does',()=>{
 let repo=committed();
 repo=runGit(writeFile(repo,'src/app.js','export function validateSignup() {\n  return true;\n}'),'git add .').repo;
 assert.notEqual(repo.index['src/app.js'],GIT_SEED_FILES['src/app.js']);
 assert.equal(runGit(repo,'git restore src/app.js').repo.files['src/app.js'],'export function validateSignup() {\n  return true;\n}','restore alone takes the staged version');
 const restored=runGit(repo,'git restore --staged --worktree src/app.js');
 assert.equal(restored.repo.index['src/app.js'],GIT_SEED_FILES['src/app.js']);
 assert.equal(restored.repo.files['src/app.js'],GIT_SEED_FILES['src/app.js']);
 assert.equal(restored.repo.mistakes.length,0);
});

test('a conflict can be resolved in one click by keeping either side',()=>{
 const merge=conflicted();
 const keepOurs=resolveConflictFile(merge.repo,'src/app.js','ours');
 assert.match(keepOurs.files['src/app.js'],/form\.name\.trim\(\) !== ""/);
 assert.equal(/<<<<<<</.test(keepOurs.files['src/app.js']),false);
 const keepTheirs=resolveConflictFile(merge.repo,'src/app.js','theirs');
 assert.match(keepTheirs.files['src/app.js'],/length > 2/);
 const keepBoth=resolveConflictFile(merge.repo,'src/app.js','both');
 assert.match(keepBoth.files['src/app.js'],/!== ""/);
 assert.match(keepBoth.files['src/app.js'],/length > 2/);
 assert.equal(/=======|>>>>>>>/.test(keepBoth.files['src/app.js']),false);
 assert.deepEqual(keepOurs.conflict.paths,['src/app.js'],'resolving the file does not stage it');
 const staged=runGit(keepOurs,'git add src/app.js');
 assert.deepEqual(staged.repo.conflict.paths,[]);
 const merged=runGit(staged.repo,'git commit -m "Merge the validation rules"').repo;
 assert.equal(merged.commits.some(c=>c.parents.length>1),true);
 assert.match(merged.commits.at(-1).tree['src/app.js'],/form\.name\.trim\(\) !== ""/);
});

test('uncommitted work is carried across a switch and never silently discarded',()=>{
 let repo=committed();
 repo=runGit(repo,'git switch -c feature/form').repo;
 repo=writeFile(repo,'notes.txt','Review checklist:\n- unfinished thought');
 const carried=runGit(repo,'git switch main');
 assert.match(carried.output.join('\n'),/Switched to branch 'main'/);
 assert.match(carried.repo.files['notes.txt'],/unfinished thought/,'the unsaved edit must survive the switch');
 assert.match(runGit(carried.repo,'git stash').output.join('\n'),/Saved working directory/,'the carried work can still be stashed');
 let clean=committed();
 clean=runGit(clean,'git switch -c feature/form').repo;
 clean=runGit(writeFile(clean,'docs/form.md','# Form notes'),'git add .').repo;
 clean=runGit(clean,'git commit -m "Document the form"').repo;
 const onMain=runGit(clean,'git switch main').repo;
 assert.equal(onMain.files['docs/form.md'],undefined,'a committed file absent from main leaves the working tree');
 assert.equal(onMain.branches.main,clean.commits[0].id,'main must not gain the feature commit');
 assert.match(runGit(onMain,'git switch feature/form').repo.files['docs/form.md'],/Form notes/);
});

test('a merge, pull, rebase, cherry-pick or revert refuses to replace uncommitted work',()=>{
 const expectRefusal=(repo,command,action)=>{
  const result=runGit(repo,command);
  assert.match(result.output.join('\n'),new RegExp('would be overwritten by '+action),command);
  assert.equal(result.mistake.why.length,3);
  assert.match(result.mistake.fix[0],/git stash/);
  return result;
 };
 let merge=committed();
 merge=runGit(merge,'git switch -c feature/form').repo;
 merge=runGit(writeFile(merge,'README.md','# Team project\nFeature change'),'git add .').repo;
 merge=runGit(merge,'git commit -m "Feature change"').repo;
 merge=runGit(merge,'git switch main').repo;
 const refusedMerge=expectRefusal(writeFile(merge,'README.md','# Team project\nUnsaved local edit'),'git merge feature/form','merge');
 assert.match(refusedMerge.repo.files['README.md'],/Unsaved local edit/,'the local edit must survive a refused merge');
 const cloned=play('git clone https://example.edu/team/project.git').repo;
 const teammate={id:'fffffff',message:'Teammate work',parents:[cloned.branches.main],tree:{...cloned.files,'src/app.js':'teammate version'},branch:'main',at:9};
 cloned.remotes.origin.objects[teammate.id]=teammate;
 cloned.remotes.origin.branches.main=teammate.id;
 expectRefusal(writeFile(cloned,'src/app.js','my unsaved version'),'git pull origin main','merge');
 let rebase=committed();
 rebase=runGit(rebase,'git switch -c feature/form').repo;
 rebase=runGit(writeFile(rebase,'notes.txt','Review checklist:\n- feature'),'git add .').repo;
 rebase=runGit(rebase,'git commit -m "Feature change"').repo;
 expectRefusal(writeFile(rebase,'notes.txt','Review checklist:\n- unsaved'),'git rebase main','rebase');
 let pick=committed();
 pick=runGit(writeFile(pick,'notes.txt','Review checklist:\n- second'),'git add .').repo;
 pick=runGit(pick,'git commit -m "Change the checklist"').repo;
 const target=pick.branches.main;
 pick=runGit(pick,'git reset --hard HEAD~1').repo;
 expectRefusal(writeFile(pick,'notes.txt','Review checklist:\n- unsaved'),'git cherry-pick '+target,'cherry-pick');
 expectRefusal(writeFile(pick,'notes.txt','Review checklist:\n- unsaved'),'git revert '+target,'revert');
});

test('every small practice is its own entry in the practice list',()=>{
 const entries=labs.filter(l=>/^git-/.test(l[0]));
 assert.equal(entries.length,GIT_DRILLS.length+1,'one entry per drill, plus the command-line lab');
 for(const drill of GIT_DRILLS){
  const entry=labs.find(l=>l[0]==='git-'+drill.id);
  assert.ok(entry,drill.id+' must be reachable as its own practice');
  assert.equal(entry[1].en,'Git: '+drill.title[0]);
  assert.equal(entry[1]['zh-CN'],'Git：'+drill.title[1]);
  assert.equal(entry[1]['zh-TW'],'Git：'+drill.title[2]);
  assert.equal(entry[2].en,drill.brief[0],drill.id+' must describe itself in the list');
  assert.equal(entry[2]['zh-CN'],drill.brief[1]);
  assert.equal(entry[2]['zh-TW'],drill.brief[2]);
  assert.ok(entry[3],drill.id+' needs an icon for its card');
 }
 assert.equal(new Set(labs.map(l=>l[0])).size,labs.length,'every lab id must be unique');
});

test('a practice page opens straight into its own task',()=>{
 const drill=GIT_DRILLS.find(d=>d.id==='stage-one-file');
 const state=startScenario(drill.id);
 const body=renderLabBody('git-'+drill.id,state,{e:s=>String(s??''),L:en=>en,T:v=>v.en??v,button:(a,l,attrs='')=>`<button data-ac="${a}" ${attrs}>${l}</button>`,option:(v,l,s)=>`<option value="${v}"${v===s?' selected':''}>${l}</option>`});
 assert.match(body,/git-task-list/);
 assert.equal(/id="git-scenario"/.test(body),false,'a single practice must not show the picker');
 assert.match(body,/Stage only notes\.txt/);
 assert.match(body,/gitcli-restart-scenario/);
 assert.equal(/class="pill">0 \/ 1/.test(body),true);
 assert.ok(body.indexOf('git-dag')<body.indexOf('git-task-list'),'the commit graph must be on top, like the branch lab');
 assert.ok(body.indexOf('git-task-list')<body.indexOf('academy-git-form'),'the run button must be below the task');
 assert.equal(/academy-command-buttons/.test(body),false,'a single practice must not list every command');
 // The command-line lab keeps its own order and its preset buttons.
 const cli=renderLabBody('git-cli',startScenario('divergent'),{e:s=>String(s??''),L:en=>en,T:v=>v.en??v,button:(a,l,attrs='')=>`<button data-ac="${a}" ${attrs}>${l}</button>`,option:(v,l,s)=>`<option value="${v}"${v===s?' selected':''}>${l}</option>`});
 assert.match(cli,/academy-command-buttons/);
 assert.ok(cli.indexOf('git-task-list')<cli.indexOf('git-dag'),'the situation lab keeps the terminal above the graph');
});

test('tasks are worked through one at a time, in order',()=>{
 let repo=startScenario('divergent');
 const tasks=scenarioTasks(repo);
 assert.deepEqual(tasks.map(t=>t.id),['merge','edit','stage','commit']);
 assert.deepEqual(tasks.map(t=>t.done),[false,false,false,false]);
 repo=runGit(repo,'git merge feature/validation').repo;
 assert.deepEqual(scenarioTasks(repo).map(t=>t.done),[true,false,false,false],'only the first task is done after the merge');
 repo=writeFile(repo,'src/app.js',APP_RESOLVED);
 assert.deepEqual(scenarioTasks(repo).map(t=>t.done),[true,true,false,false],'editing finishes the second task');
 repo=runGit(repo,'git add src/app.js').repo;
 assert.deepEqual(scenarioTasks(repo).map(t=>t.done),[true,true,true,false],'staging finishes the third task');
 repo=runGit(repo,'git commit -m "Merge the validation rules"').repo;
 assert.deepEqual(scenarioTasks(repo).map(t=>t.done),[true,true,true,true]);
 assert.equal(scenarioComplete(repo),true);
 assert.deepEqual(scenarioTasks(startScenario('revert-bad')).map(t=>t.done),[false,false]);
});
