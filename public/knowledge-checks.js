import {referenceTopics} from './academy-content.js';
import {programmingLessonById} from './programming-lessons.js';
export function knowledgeQuestions(courses){return [
 ...courses.filter(c=>c.status==='published').flatMap(c=>c.lessons.filter(l=>l.check).map(l=>({key:c.id+':'+l.id,group:c.collection==='tools'?'tools':'software',title:l.title,question:l.check.question,options:l.check.options.map(x=>x.text),correct:l.check.correct,feedback:l.check.options.map(x=>x.feedback),route:`learn/${c.id}/${c.lessons.indexOf(l)}`}))),
 ...referenceTopics.map(t=>{const l=programmingLessonById[t.id];return {key:'tutorial:'+t.id,group:t.language,title:t.title,question:l.checkQuestion||l.question,code:t.code,options:l.options,correct:l.correct,feedback:l.options.map(()=>l.answer),route:'tutorial/'+t.id};})
];}
export function saveKnowledgeAttempt(state,q,choice){if(!Number.isInteger(choice)||!q.options[choice])throw new Error('Choose an answer first');const a=state.academy,passed=choice===q.correct,old=a.quizzes[q.key]||{};a.quizzes[q.key]={...old,correct:!!old.correct||passed,lastCorrect:passed,selected:choice,attempts:(old.attempts||0)+1,at:new Date().toISOString()};if(q.key.startsWith('tutorial:')){a.tutorialChecks??={};a.tutorialChecks[q.key.slice(9)]={selected:choice,checked:choice};}else{state.checks??={};state.checks[q.key]={selected:choice,checked:choice};}return passed;}
