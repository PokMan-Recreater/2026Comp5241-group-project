import test from 'node:test';
import assert from 'node:assert/strict';
import {courses} from '../public/data.js';
import {buildPlan,buildTemplateCourse,ensureAcademy,planStepDone,planStepRoute} from '../public/academy-core.js';
import {practiceForLesson} from '../public/course-practices.js';
import {referenceTopics,interviews,labs,challenges} from '../public/academy-content.js';
import {rankDocuments,retrieve,dockerStep,initialDocker,gradientStep,gradientSamples} from '../public/academy-models.js';
import {rewritePrompt} from '../public/prompt-rewrite.js';
import {reviewInterview,expressionReview,interviewGuides} from '../public/interview-review.js';
import {interactiveDocument,interactivePageExample} from '../public/academy-runner.js';
import {knowledgeQuestions} from '../public/knowledge-checks.js';
const plan=(topic,profile={})=>buildPlan({courses,topic,profile:{skillLevel:'beginner',weeklyMinutes:30,...profile},id:'audit',courseId:'study-audit'});

test('peer topic aliases route to actual catalog material rather than unknown-topic templates',()=>{
 for(const topic of ['ChatGPT','Copilot','embeddings','vector database','AWS cloud','Kubernetes','REST API','TypeScript React','regression','QA','Scrum','Figma','portfolio','deployment','continuous integration','data analysis','deep learning','few-shot','serverless','Azure','GitHub','code review','containers','queries']){
  // TypeScript/React and query synonyms intentionally recommend neighboring curated subjects.
  const result=plan(topic);assert.notEqual(result.plan.source,'template',topic);
 }
 for(const topic of ['specific marine history','ocean archaeology'])assert.equal(plan(topic).plan.source,'template');
});
test('language topics coexist with Git and other languages without discarding intent',()=>{
 const a=plan('Python Git').plan;assert(a.steps.some(x=>x.tutorialId==='py-basics'));assert(a.matchedCourses.includes('git-essentials'));assert(a.steps.some(x=>x.route==='lab/git'));
 const b=plan('HTML Python Git').plan;assert(b.steps.some(x=>x.tutorialId==='html-structure'));assert(b.steps.some(x=>x.tutorialId==='py-basics'));assert(b.matchedCourses.includes('git-essentials'));
});
test('every matched course has readings before its own practice in multi-topic plans',()=>{
 const p=plan('Git Docker SQL').plan;assert(p.matchedCourses.includes('docker-containers'));
 for(const route of ['lab/git','lab/docker','challenge/group']){const at=p.steps.findIndex(x=>x.route===route);assert(at>=0,route);const from=p.steps[at].from;assert(p.steps.slice(0,at).some(x=>x.courseId===from),route);}
 assert.equal(p.modules.flatMap(x=>x.steps).length,p.steps.length);const totals={};for(const s of p.steps)totals[s.week]=(totals[s.week]||0)+s.minutes;assert(Object.values(totals).every(x=>x<=30));
});
test('original SE practice relationships are present in generated intermediate plans',()=>{
 for(const c of courses.filter(x=>x.collection==='software')){const p=plan(c.id,{skillLevel:'intermediate'}).plan;for(const [i] of c.lessons.entries())for(const route of practiceForLesson(c.id,i)){const represented=p.steps.some(s=>planStepRoute(s)===route);assert(represented,c.id+' '+route);}}
});
test('unknown-topic course differentiates levels/backgrounds and has worked activities and checks',()=>{
 const a=buildTemplateCourse('Astronomy','a',{skillLevel:'beginner',audience:'non-cs'}),b=buildTemplateCourse('Astronomy','b',{skillLevel:'advanced',audience:'cs'});assert.equal(a.lessons.length,4);assert.equal(b.lessons.length,6);assert.equal(b.level,'advanced');assert.deepEqual(a.audience,['non-cs']);assert.notEqual(a.lessons[0].body.en,b.lessons[0].body.en);
 for(const c of [a,b])for(const l of c.lessons){assert(l.check);assert.notDeepEqual(l.workshop.sample,l.body);for(const lang of ['en','zh-CN','zh-TW']){assert(l.check.question[lang]);assert(l.workshop.sample[lang]);}}
 assert(plan('Astronomy').plan.steps.some(x=>x.route==='interview/study'));
});
test('new interview topics retain original scenario IDs and fully translated question-specific guides',()=>{
 for(const id of ['frontend','team','stakeholder','data','ml','frontend-hiring','team-stories','ai-adoption','sql-case','ml-delivery','study']){const s=interviews.find(x=>x.id===id);assert(s,id);assert.equal(s.questions.length,3);assert.equal(interviewGuides[id].length,3);for(const lang of ['en','zh-CN','zh-TW'])for(const [i,q] of s.questions.entries()){assert(q[lang]);assert(interviewGuides[id][i].outline[lang]);assert(interviewGuides[id][i].followup[lang]);}}
 assert.match(interviews.find(x=>x.id==='sql-case').questions[1].en,/SQL query/);assert.match(interviews.find(x=>x.id==='ml-delivery').questions[2].en,/50%/);
});
test('interview expression feedback detects long filler-heavy answers and requires actual ownership',()=>{
 const weak='I like this basically actually you know '+Array(70).fill('useful').join(' '),r=expressionReview(weak);assert(r.longSentences);assert(r.fillers.length>=3);assert.equal(r.ownership,false);assert.equal(r.clarity,false);
 const good=expressionReview('I built a small check. First I measured the result. Then I fixed the missing case.');assert(good.ownership);assert(good.clarity);
 const cn=expressionReview('我负责检查结果。首先记录输入，然后比较观察。');assert(cn.ownership);assert(cn.clarity);
 assert.equal(reviewInterview(interviews.find(s=>s.id==='sql-case'),['','',''],'en')[0].dimensions.length,6);
});
test('suggested prompt revisions preserve original material and only append missing components',()=>{
 const text='Audience: an instructor checking classroom feedback\nInput: There were 12 responses; two requests were unclear.\nGoal: summarise the findings.';
 for(const lang of ['en','zh-CN','zh-TW']){const result=rewritePrompt(text,'summary',lang);assert(result.startsWith(text));assert.equal(result.split('Audience:').length,2);assert(!result.includes('paste the source'));assert(result.length>text.length);}
 const blank=rewritePrompt('','summary');assert.match(blank,/\[paste the source/);
});
test('retrieval handles plural/stem variants, filters question words and still rejects empty queries',()=>{
 const docs=[{id:'a',text:'A container holds an application. A branch tracks commits.'},{id:'b',text:'Unrelated weather report.'}];assert.equal(retrieve('containers',docs)[0].id,'a');assert.equal(retrieve('How does a container work?',docs)[0].id,'a');assert.equal(rankDocuments('branches',docs)[0].matched[0],'branch');assert.deepEqual(retrieve('the and is',docs),[]);
});
test('Docker namespace tags and supported shell transcript work without a real shell',()=>{
 let z=dockerStep(initialDocker(),'docker build -t demo/web:1 .');z=dockerStep(z,'docker run --name web demo/web:1');z=dockerStep(z,'docker exec -it web sh');assert.match(z.logs.at(-1),/Simulated shell transcript/);z=dockerStep(z,'docker exec web echo $NODE_ENV');assert.match(z.logs.at(-1),/production/);assert.throws(()=>dockerStep(z,'docker exec web curl https://example.com'));
});
test('noisy gradient observations retain residual error while converging numerically',()=>{
 assert.equal(gradientSamples('noisy').length,11);const z=gradientStep({dataset:'noisy',rate:.05},1000);assert(z.loss>0);assert(z.loss<.1);assert.equal(z.dataset,'noisy');assert(Math.abs(z.m-2)<.1);
});
test('interactive preview isolates its origin and denies remote scripts, connections and form submissions',()=>{
 const html=interactiveDocument(interactivePageExample,'audit-token');for(const expected of ["default-src 'none'","script-src 'unsafe-inline'","connect-src 'none'","form-action 'none'","base-uri 'none'",'audit-token','addEventListener(\'click\''])assert(html.includes(expected),expected);assert(!html.includes('unsafe-eval'));assert.match(interactivePageExample,/textContent = count/);
});
test('new page exercise completion and legacy progress preserve the same completion rules',()=>{
 const s={profile:{},progress:{development:['d1']},courses:[{id:'my-course'}]};ensureAcademy(s);assert.equal(planStepDone({kind:'practice',route:'playground/html'},s),false);s.academy.pageExercises={html:{completed:true}};assert(planStepDone({kind:'practice',route:'playground/html'},s));assert.equal(s.progress.development[0],'d1');assert.equal(s.courses[0].id,'my-course');
});
test('all generated plan route targets exist for catalog, language and fallback inputs',()=>{
 for(const topic of [...courses.map(c=>c.id),'Python Git','HTML Python','Astronomy']){const r=plan(topic,{skillLevel:'intermediate'});const all=[...courses,...(r.course?[r.course]:[])];for(const step of r.plan.steps){const [kind,id,index]=planStepRoute(step).split('/');const valid=kind==='game'||kind==='lab'&&labs.some(x=>x[0]===id)||kind==='challenge'&&challenges.some(x=>x.id===id)||kind==='interview'&&interviews.some(x=>x.id===id)||kind==='tutorial'&&referenceTopics.some(x=>x.id===id)||kind==='learn'&&all.find(x=>x.id===id)?.lessons[Number(index)]||kind==='playground'&&['c','cpp','python','html','javascript'].includes(id);assert(valid,topic+' '+planStepRoute(step));}}
 assert.equal(knowledgeQuestions(courses).length,73);
});
