// Outputs below were captured from real Git 2.43.0 running the same commands.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,writeBlob,writeTree,writeCommit} from '../public/git-engine/core.js';
import {run} from '../public/git-engine/shell.js';
import {createServer,serverCommit} from '../public/git-engine/server.js';
import {stripAnsi} from '../public/git-engine/format.js';

function computer(){const w=createWorld({now:1762172000,tz:'+0800'});Object.assign(w.global,{'user.name':'Alice Wang','user.email':'alice@example.com','pull.rebase':'false'});return w;}
const sh=(w,line)=>run(w,line).lines.map(stripAnsi).join('\n');

test('objects hash exactly like Git',()=>{
 const w=createWorld();const who={name:'Alice Wang',email:'alice@example.com',time:1762172000,tz:'+0800'};
 const blob=writeBlob(w,'hello\n');assert.equal(blob,'ce013625030ba8dba906f756967f9e9ca394464a');
 const tree=writeTree(w,{'README.md':blob});assert.equal(tree,'853694aae8816094a0d875fee7ea26278dbf5d0f');
 assert.equal(writeCommit(w,{tree,parents:[],author:who,committer:who,message:'Initial commit\n'}),'3179e68a3e32a4f4cc04a483e2052c21a759735e');
});
test('status, add and commit print what Git prints',()=>{
 const w=computer();sh(w,'mkdir demo && cd demo && git init');
 assert.equal(sh(w,'git status'),'On branch main\n\nNo commits yet\n\nnothing to commit (create/copy files and use "git add" to track)');
 sh(w,'echo hello > README.md');
 assert.equal(sh(w,'git status'),'On branch main\n\nNo commits yet\n\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n\tREADME.md\n\nnothing added to commit but untracked files present (use "git add" to track)');
 assert.equal(sh(w,'git add README.md && git commit -m "Initial commit"'),'[main (root-commit) 3179e68] Initial commit\n 1 file changed, 1 insertion(+)\n create mode 100644 README.md');
 sh(w,'echo world >> README.md');
 assert.equal(sh(w,'git diff'),'diff --git a/README.md b/README.md\nindex ce01362..94954ab 100644\n--- a/README.md\n+++ b/README.md\n@@ -1 +1,2 @@\n hello\n+world');
 assert.equal(sh(w,'git status -s'),' M README.md');
});
test('a conflicting merge stops with markers and unmerged paths',()=>{
 const w=computer();sh(w,'mkdir p && cd p && git init -q');
 sh(w,"printf 'line1\\nline2\\nline3\\n' > a.txt && git add . && git commit -qm base && git switch -qc feat");
 sh(w,"printf 'line1\\nFEAT\\nline3\\n' > a.txt && git commit -qam feat && git switch -q main");
 sh(w,"printf 'line1\\nMAIN\\nline3\\n' > a.txt && git commit -qam main");
 assert.equal(sh(w,'git merge feat'),'Auto-merging a.txt\nCONFLICT (content): Merge conflict in a.txt\nAutomatic merge failed; fix conflicts and then commit the result.');
 assert.equal(w.fs['/home/alice/p/a.txt'],'line1\n<<<<<<< HEAD\nMAIN\n=======\nFEAT\n>>>>>>> feat\nline3\n');
 assert.match(sh(w,'git status'),/Unmerged paths:\n {2}\(use "git add <file>\.\.\." to mark resolution\)\n\tboth modified: {3}a\.txt/);
 assert.match(sh(w,'git commit -m x'),/^error: Committing is not possible because you have unmerged files\./);
});
test('a push is rejected when GitHub has new commits, and pull fixes it',()=>{
 const w=computer(),s=createServer(w,{owner:'alice-wang',name:'demo'});
 sh(w,'mkdir d && cd d && git init -q && echo a > a && git add . && git commit -qm a');
 sh(w,'git remote add origin https://github.com/alice-wang/demo.git && git push -q -u origin main');
 serverCommit(w,s,'main',{author:{name:'Jordan Lee',email:'j@example.com'},message:'Teammate',files:{b:'b\n'}});
 sh(w,'echo c > c && git add c && git commit -qm c');
 assert.match(sh(w,'git push'),/ ! \[rejected\] {8}main -> main \(fetch first\)\nerror: failed to push some refs to 'https:\/\/github\.com\/alice-wang\/demo\.git'/);
 assert.match(sh(w,'git pull'),/Merge made by the 'ort' strategy\./);
 assert.match(sh(w,'git push'),/\n {3}[0-9a-f]{7}\.\.[0-9a-f]{7} {2}main -> main$/);
});
test('shell basics work with redirects, && and globs',()=>{
 const w=computer();
 assert.equal(sh(w,'mkdir x && cd x && echo one > a.txt && echo two >> a.txt && cat a.txt'),'one\ntwo');
 assert.equal(sh(w,'touch b.txt && ls *.txt'),'a.txt  b.txt');
 assert.equal(sh(w,'nope'),'nope: command not found');
 assert.equal(sh(w,'git comit'),"git: 'comit' is not a git command. See 'git --help'.\n\nThe most similar command is\n\tcommit");
});
