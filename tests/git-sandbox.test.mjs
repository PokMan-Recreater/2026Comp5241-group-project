import test from 'node:test';
import assert from 'node:assert/strict';
import {gitSandboxExamples,newSandboxRepo,sandboxStep,sandboxTranscript} from '../public/git-sandbox.js';
import {writeFile} from '../public/git-sim.js';

test('a fresh sandbox repository starts empty and refuses work before git init',()=>{
 const repo=newSandboxRepo();
 assert.equal(repo.initialised,false);assert.equal(repo.commits.length,0);assert.deepEqual(repo.transcript,[]);
 const refused=sandboxStep(repo,'git status');
 assert.equal(refused.repo.initialised,false);
 assert.match(refused.mistake.message,/not a git repository/);
 assert.match(refused.mistake.fix[0],/git init/);
 assert.match(sandboxTranscript(refused.repo),/^\$ git status/m);
});

test('every example command runs in order on a small project',()=>{
 let repo=newSandboxRepo();
 for(const [,label,command] of gitSandboxExamples){
  if(command==='git add .')repo=writeFile(repo,'notes.txt','Review checklist:\n- keep commits small');
  const step=sandboxStep(repo,command);
  assert.equal(step.mistake,null,'the example was refused: '+command+' ('+label[0]+')');
  repo=step.repo;
 }
 assert.equal(repo.commits.length,1);
 assert.deepEqual(Object.keys(repo.branches).sort(),['feature/form','main']);
 assert.match(sandboxTranscript(repo),/\$ git commit -m "Initial version"/);
});

test('the examples cover the everyday commands',()=>{
 const commands=gitSandboxExamples.map(x=>x[2]);
 for(const needed of ['git init','git status','git add .','git commit -m "Initial version"','git switch -c feature/form','git log --oneline --graph --all','git push -u origin main'])assert.ok(commands.includes(needed),needed);
});

test('a refused or unknown command leaves the repository safe and explains itself',()=>{
 let repo=sandboxStep(newSandboxRepo(),'git init').repo;
 const before=sandboxTranscript(repo);
 const unknown=sandboxStep(repo,'git frobnicate');
 assert.equal(unknown.repo.initialised,true);
 assert.equal(unknown.repo.commits.length,0);
 assert.match(unknown.mistake.message,/not a git command/);
 assert.match(unknown.mistake.why[0],/sandbox runs the commands/);
 assert.match(unknown.mistake.fix[0],/git help/);
 assert.ok(sandboxTranscript(unknown.repo).length>before.length,'the terminal keeps the record of the attempt');
});

test('the sandbox keeps the recent mistakes for the review panel',()=>{
 let repo=newSandboxRepo();
 for(let i=0;i<8;i++)repo=sandboxStep(repo,'git status').repo;
 assert.ok(repo.mistakes.length>=5);
 assert.equal(repo.mistakes.at(-1).command,'git status');
});
