import test from 'node:test';
import assert from 'node:assert/strict';
import {courses} from '../public/data.js';
import {challenges,interviews} from '../public/academy-content.js';
import {createGit,gitStep,buildPlan,ensureAcademy,planStepDone,planStepRoute,learningStats} from '../public/academy-core.js';
import {promptAnalysis,retrieve,rankDocuments,dockerStep,initialDocker,diagnosePipeline,pipelineResult,gradientStep} from '../public/academy-models.js';
import {promptPresets,promptScaffold} from '../public/lab-views.js';
import {local} from '../public/i18n.js';
import {interviewGuides,reviewInterview} from '../public/interview-review.js';
import {knowledgeQuestions,saveKnowledgeAttempt} from '../public/knowledge-checks.js';
import {syntaxCards} from '../public/syntax-reference.js';
import {nextStudyTarget} from '../public/learning-links.js';

test('a resolved merge recognises second-parent ancestry and repeated merges add no commits',()=>{
 let s=createGit();for(const [action,value] of [['branch','feature'],['commit','main edit'],['checkout','feature'],['commit','feature edit'],['merge','main']])s=gitStep(s,action,value);
 assert(s.conflict);assert.throws(()=>gitStep(s,'commit','skip resolution'));
 s=gitStep(s,'resolve','combined');const count=s.commits.length;s=gitStep(s,'merge','main');assert.equal(s.conflict,null);assert.equal(s.commits.length,count);
 s=gitStep(s,'checkout','main');s=gitStep(s,'merge','feature');assert.equal(s.branches.main,s.branches.feature);
});
test('empty prompt labels and untouched suggested outlines cannot complete a prompt lab',()=>{
 assert(promptAnalysis('Goal:\nInput:\nConstraints:\nOutput format:\nVerification / tests:').signals.every(x=>!x));
 for(const p of promptPresets)for(const lang of ['en','zh-CN','zh-TW'])assert(!promptAnalysis(promptScaffold(p.id,lang,local)).signals.every(Boolean));
 const complete='Audience: a manager who missed the meeting\nGoal: summarise decisions and unresolved questions from the meeting notes only.\nInput: The pilot is approved, but the date and budget have not been agreed. Maya will check the room.\nConstraints: use only the source, do not invent names or deadlines; under 120 words.\nOutput format: JSON with decisions and openQuestions arrays.\nExample: input "Pilot agreed; date unknown" -> output {"decisions":["Pilot agreed"],"openQuestions":["date"]}\nVerification: check every decision against the input and mark missing evidence.';
 assert(promptAnalysis(complete).signals.every(Boolean));assert.equal(promptAnalysis(complete).score,100);
});
test('blank and punctuation-only RAG queries never get a phrase boost',()=>{
 const docs=[{id:'a',text:'classroom roster students'},{id:'b',text:'unrelated policy'}];
 for(const q of ['', '   ','?!'])assert.deepEqual(retrieve(q,docs,2,true),[]);
 const ranked=rankDocuments('classroom roster',docs,true);assert.deepEqual(ranked[0].matched,['classroom','roster']);assert.equal(ranked[0].phraseBoost,.3);assert.equal(ranked[1].score,0);
});
test('all requested subject plans use curated lessons, connected practice and a rehearsal',()=>{
 for(const [topic,id] of [['Git','git-essentials'],['Docker','docker-containers'],['RAG','llm-apps'],['SQL','data-sql'],['machine learning','ml-foundations'],['GitHub Actions','cicd-pipelines'],['提示词','prompt-engineering'],['AI tools','ai-toolkit'],['Python file cleanup','python-first-steps'],['TDD','testing-release']]){
  const {course,plan}=buildPlan({courses,topic,profile:{skillLevel:'beginner',weeklyMinutes:30},id:'p',courseId:'unused'});assert.equal(course,null,topic);assert.equal(plan.source,'catalog');assert(plan.steps.filter(x=>x.courseId===id).length>=4,topic);assert(plan.steps.some(x=>x.kind==='practice'&&x.route.startsWith('interview/')),topic);assert(plan.steps.at(-1).route.startsWith('interview/'));assert(plan.steps.every(x=>x.rationale));const totals={};for(const step of plan.steps)totals[step.week]=(totals[step.week]||0)+step.minutes;assert(Object.values(totals).every(x=>x<=30));
 }
 // 'ci' must not match arbitrary words such as 'specific'.
 assert.equal(buildPlan({courses,topic:'specific marine history',profile:{interests:['development','architecture']},id:'p',courseId:'x'}).plan.source,'template');
});
test('plan practice completion follows actual practice results and the home resume can open it',()=>{
 const s={profile:{},progress:{}};ensureAcademy(s);const step={kind:'practice',route:'lab/git',title:'Git',minutes:15};s.academy.plans=[{id:'p',steps:[step]}];s.academy.activePlan='p';assert.equal(planStepDone(step,s),false);assert.deepEqual(nextStudyTarget(courses,s),{kind:'activity',route:'lab/git',title:'Git'});assert.equal(planStepRoute(step),'lab/git');s.academy.labResults.git={completed:true};assert.equal(planStepDone(step,s),true);
});
test('new subject courses declare level/audience and render distinct teaching/checks in all locales',()=>{
 const ids=new Set();for(const c of courses){assert(['beginner','intermediate','advanced'].includes(c.level));assert(c.audience.length);for(const l of c.lessons){assert(!ids.has(c.id+':'+l.id));ids.add(c.id+':'+l.id);}}
 const tools=courses.filter(c=>c.collection==='tools');assert.equal(tools.length,9);assert.equal(tools.reduce((n,c)=>n+c.lessons.length,0),36);
 for(const c of tools)for(const l of c.lessons)for(const lang of ['en','zh-CN','zh-TW']){assert(l.body[lang].length>100);assert(l.workshop.sample[lang].length>20);assert(l.check.options.every(x=>x.text[lang]&&x.feedback[lang]));}
 assert.equal(courses.filter(c=>c.level==='advanced').length,1);assert(courses.filter(c=>c.audience.includes('non-cs')).length<courses.length);
});
test('Docker names, port conflicts, logs, exec, cache and image removal respect lifecycle',()=>{
 let z=initialDocker();z=dockerStep(z,'docker build -t demo .');z=dockerStep(z,'docker build -t demo .');assert.match(z.logs.at(-1),/CACHED/);
 z=dockerStep(z,'docker run -p 8080:3000 -d --name web demo');assert.equal(z.containers.web.ports,'8080:3000');assert.throws(()=>dockerStep(z,'docker run --name other -p 8080:4000 demo'));assert.throws(()=>dockerStep(z,'docker rmi demo'));
 z=dockerStep(z,'docker exec web pwd');assert.match(z.logs.at(-1),/\/app/);z=dockerStep(z,'docker stop web');z=dockerStep(z,'docker logs web');assert.match(z.logs.at(-1),/status=stopped/);assert.throws(()=>dockerStep(z,'docker exec web pwd'));z=dockerStep(z,'docker ps -a');assert.match(z.logs.at(-1),/web/);z=dockerStep(z,'docker start web');z=dockerStep(z,'docker stop web');z=dockerStep(z,'docker rm web');z=dockerStep(z,'docker rmi demo');assert.deepEqual(z.images,{});z=dockerStep(z,'clear');assert.deepEqual(z.logs,[]);
});
test('CI wrong diagnoses cannot advance five stages; correct repairs reach deploy',()=>{
 let fixes=[];assert.deepEqual(pipelineResult(fixes).map(x=>x.stage),['install','lint','test','build','deploy']);
 assert.equal(diagnosePipeline(fixes,'expectation').correct,false);fixes=diagnosePipeline(fixes,'format').fixes;assert.equal(pipelineResult(fixes)[2].status,'failed');assert.deepEqual(diagnosePipeline(fixes,'rerun').fixes,fixes);assert.deepEqual(diagnosePipeline(fixes,'expectation').fixes,fixes);fixes=diagnosePipeline(fixes,'edge').fixes;fixes=diagnosePipeline(fixes,'env').fixes;assert(pipelineResult(fixes).every(x=>x.status==='passed'));
});
test('gradient step counts survive chart history truncation and high rates grow loss',()=>{
 const z=gradientStep({rate:.05},120);assert.equal(z.steps,120);assert.equal(z.history.length,100);assert(z.loss<.1);assert(gradientStep({rate:.8},10).loss>33);
});
test('interview feedback is question-specific and treats short keyword lists as insufficient detail',()=>{
 for(const scenario of interviews){assert.equal(interviewGuides[scenario.id].length,3);for(const guide of interviewGuides[scenario.id])for(const lang of ['en','zh-CN','zh-TW']){assert(guide.outline[lang]);assert(guide.followup[lang]);}const review=reviewInterview(scenario,['test because next','test because next','test because next'],'en');assert(review.every(x=>x.length===false));assert.notEqual(review[0].guide.outline.en,review[1].guide.outline.en);}
 const s=interviews.find(x=>x.id==='ml'),r=reviewInterview(s,['I indexed source chunks and ranked tokens to select top-k results.','',''],'en');assert(r[0].points.every(Boolean));assert.equal(r[1].answered,false);
});
test('revision bank shares canonical quiz IDs and cannot double-reward repeated answers',()=>{
 const qs=knowledgeQuestions(courses);assert.equal(new Set(qs.map(x=>x.key)).size,qs.length);assert.equal(qs.length,73);assert.match(qs.find(x=>x.key==='tutorial:js-arrays').question.en,/return/);assert(qs.filter(x=>x.key.startsWith('tutorial:')).every(x=>x.code));const s={profile:{},progress:{},checks:{}};ensureAcademy(s);const q=qs.find(x=>x.key==='tutorial:js-arrays');saveKnowledgeAttempt(s,q,q.correct);const xp=learningStats(s).xp;saveKnowledgeAttempt(s,q,q.correct);assert.equal(learningStats(s).xp,xp);assert.equal(s.academy.quizzes[q.key].attempts,2);saveKnowledgeAttempt(s,q,(q.correct+1)%3);assert(s.academy.quizzes[q.key].correct);assert.equal(s.academy.quizzes[q.key].lastCorrect,false);assert.equal(s.academy.tutorialChecks['js-arrays'].checked,(q.correct+1)%3);
});
test('syntax cards cover five languages with correct C integer boundaries and no executable markup rendering requirement',()=>{
 assert.equal(syntaxCards.length,15);assert.equal(new Set(syntaxCards.map(x=>x.language)).size,5);assert.match(syntaxCards.find(x=>x.id==='c-limits').body.en,/undefined behaviour/);for(const c of syntaxCards)for(const lang of ['en','zh-CN','zh-TW'])assert(c.title[lang]&&c.body[lang]);
});
test('all fourteen challenge contracts have distinct IDs, localized tests and non-mutating batch reference',()=>{
 assert.equal(challenges.length,14);assert.equal(new Set(challenges.map(c=>c.id)).size,14);const c=challenges.find(x=>x.id==='chunk'),fn=Function(c.solution+';return chunk')();const a=[1,2,3];assert.deepEqual(fn(a,2),[[1,2],[3]]);assert.deepEqual(a,[1,2,3]);assert.deepEqual(fn(a,Infinity),[]);assert.deepEqual(fn(a,NaN),[]);for(const c of challenges)for(const lang of ['en','zh-CN','zh-TW'])assert(c.tests.every(x=>x.name[lang]));
});
