import {specialistCourses,supplementalLessons} from './specialist-courses.js';
import {isHiddenLabRoute} from './academy-content.js';
const connections = {
 development: [['lab/git'], ['lab/git'], ['learn/product-decisions/1'], ['lab/ci']],
 requirements: [['challenge/form'], ['lab/git'], ['challenge/summary'], ['challenge/form'], ['challenge/access'], ['lab/ci']],
 architecture: [['tutorial/html-structure'], ['tutorial/js-async'], ['challenge/access'], ['lab/docker']],
 'ai-coding': [['lab/prompt'], ['challenge/unique'], ['challenge/summary'], ['interview/stakeholder']],
 'testing-release': [['challenge/summary'], ['challenge/retry'], ['game'], ['lab/ci']],
 'product-decisions': [['interview/team'], ['game'], ['interview/stakeholder'], ['lab/git']],
 career: [['interview/frontend'], ['interview/team'], ['interview/ml'], ['interview/data']],
};

/** The visible practice a hidden lab leaves behind: the lesson's own knowledge check, or another visible practice of the same course. */
function hiddenFallback(courseId,index){
 const lessonId=specialistCourses.find(c=>c.id===courseId)?.lessons[Number(index)]?.id;
 if(lessonId)return `practice/checks/${courseId}:${lessonId}`;
 return (connections[courseId]||[]).flat().find(route=>route!=='game'&&!route.startsWith('interview/')&&!isHiddenLabRoute(route))??'challenge/summary';
}

export function practiceForLesson(courseId, index) {
 if(courseId==='development'){const lessonId=['d1','d2','d3','d4','d5'][Number(index)];return lessonId?['practice/checks/development:'+lessonId]:[];}
 if(courseId==='requirements'){const lessonId=['r1','r2','r5','r6','r3','r4'][Number(index)];return lessonId?['practice/checks/requirements:'+lessonId]:[];}
 const supplemental=specialistCourses.find(c=>c.id===courseId)?.lessons[Number(index)]?.practice||supplementalLessons[courseId]?.[Number(index)-4]?.practice;const routes=supplemental?[supplemental]:connections[courseId]?.[Number(index)] || [];return routes.map(route=>route.startsWith('interview/')?'challenge/summary':route).map(route=>isHiddenLabRoute(route)?hiddenFallback(courseId,index):route);
}
