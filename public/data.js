import {courses as coreCourses,courseReferences} from './curriculum.js';
import {specialistCourses,supplementalLessons} from './specialist-courses.js';
const metadata={development:['beginner',['cs','non-cs']],requirements:['beginner',['cs','non-cs']],architecture:['intermediate',['cs']], 'ai-coding':['intermediate',['cs']], 'testing-release':['intermediate',['cs']], 'product-decisions':['beginner',['cs','non-cs']],career:['advanced',['cs']]};
export const courses=[...coreCourses.map(c=>({...c,level:metadata[c.id][0],audience:metadata[c.id][1],collection:'software',lessons:[...c.lessons,...(supplementalLessons[c.id]||[])],duration:c.duration+(supplementalLessons[c.id]||[]).reduce((n,l)=>n+l.minutes,0)})),...specialistCourses];
export {courseReferences};
export const starterCode = `function uniqueBookings(bookings) {
  // Keep the first booking for each studentId.
  // 保留每个 studentId 的首条报名 / 保留每個 studentId 的首筆報名
  return bookings;
}`;
