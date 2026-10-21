import {specialistCourses,supplementalLessons} from './specialist-courses.js';
const connections = {
 development: [['game'], ['lab/git'], ['learn/product-decisions/1'], ['lab/ci']],
 requirements: [['learn/requirements/1'], ['interview/team'], ['challenge/form'], ['challenge/access']],
 architecture: [['tutorial/html-structure'], ['tutorial/js-async'], ['challenge/access'], ['lab/docker']],
 'ai-coding': [['lab/prompt'], ['challenge/unique'], ['challenge/summary'], ['interview/stakeholder']],
 'testing-release': [['challenge/summary'], ['challenge/retry'], ['game'], ['lab/ci']],
 'product-decisions': [['interview/team'], ['game'], ['interview/stakeholder'], ['lab/git']],
 career: [['interview/frontend'], ['interview/team'], ['interview/ml'], ['interview/data']],
};

export function practiceForLesson(courseId, index) {
 const supplemental=specialistCourses.find(c=>c.id===courseId)?.lessons[Number(index)]?.practice||supplementalLessons[courseId]?.[Number(index)-4]?.practice;return supplemental?[supplemental]:connections[courseId]?.[Number(index)] || [];
}
