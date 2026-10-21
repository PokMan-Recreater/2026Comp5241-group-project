// Course-to-practice links use the published lesson order, without changing IDs.
import {referenceTopics} from './academy-content.js';
import {planStepDone} from './academy-core.js';
export {practiceForLesson} from './course-practices.js';

export function nextStudyTarget(courses, state) {
 const published = courses.filter(c => c.status === 'published' && c.lessons.length);
 const academy = state.academy || {};
 const active = academy.plans?.find(p => p.id === academy.activePlan);
 const step = active?.steps.find(x => (x.kind==='practice'?true:x.kind==='tutorial'?referenceTopics.some(t=>t.id===x.tutorialId):published.some(c => c.id === x.courseId && c.lessons.some(l => l.id === x.lessonId))) && !planStepDone(x,state));
 if(step?.kind==='practice')return {kind:'activity',route:step.route,title:step.title};
 if (step?.kind==='tutorial') return {kind:'tutorial',id:step.tutorialId};
 if (step) return {kind:'lesson', courseId:step.courseId, index:published.find(c=>c.id===step.courseId).lessons.findIndex(l=>l.id===step.lessonId)};
 const resume = academy.lastStudy;
 if (resume?.kind === 'tutorial' && referenceTopics.some(t=>t.id===resume.id) && !academy.tutorials?.includes(resume.id)) return resume;
 const last = published.find(c => c.id === resume?.courseId);
 if (last && !state.progress?.[last.id]?.includes(last.lessons[resume.index]?.id)) return resume;
 const ordered = [...(last ? [last] : []), ...published.filter(c => c !== last)];
 for (const c of ordered) {
  const index = c.lessons.findIndex(l => !state.progress?.[c.id]?.includes(l.id));
  if (index >= 0) return {kind:'lesson', courseId:c.id, index};
 }
 return null;
}
