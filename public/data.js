import {courses as coreCourses,courseReferences as originalReferences} from './curriculum.js';
import {specialistCourses,supplementalLessons} from './specialist-courses.js';
import {requirementsLessons,requirementsMetadata} from './requirements-course.js';
import {softwareFoundations,foundationsMetadata,foundationsReference} from './software-foundations.js';
const metadata={development:['beginner',['cs','non-cs']],requirements:['beginner',['cs','non-cs']],architecture:['intermediate',['cs']], 'ai-coding':['intermediate',['cs']], 'testing-release':['intermediate',['cs']], 'product-decisions':['beginner',['cs','non-cs']],career:['advanced',['cs']]};
export const courses=[...coreCourses.map(c=>{
 const lessons=c.id==='development'?softwareFoundations(c.lessons):c.id==='requirements'?requirementsLessons(c.lessons):[...c.lessons,...(supplementalLessons[c.id]||[])];
 return {...c,...(c.id==='development'?foundationsMetadata:c.id==='requirements'?requirementsMetadata:{}),level:metadata[c.id][0],audience:metadata[c.id][1],collection:'software',lessons,duration:lessons.reduce((n,l)=>n+(l.minutes||8),0)};
}),...specialistCourses];
export const courseReferences=[foundationsReference,...originalReferences,{title:'University of Alberta · Client Needs and Software Requirements',url:'https://www.coursera.org/learn/client-needs-and-software-requirements',courses:['requirements'],use:{en:'Course structure reference. The booking cases and objective questions on Forma are original.', 'zh-CN':'参考其需求获取、需求编写与质量检查的组织顺序；Forma 的预约案例和客观题为原创。','zh-TW':'參考其需求取得、需求編寫與品質檢查的組織順序；Forma 的預約案例和客觀題為原創。'}}];
export const starterCode = `function uniqueBookings(bookings) {
  // Keep the first booking for each studentId.
  // 保留每个 studentId 的首条报名 / 保留每個 studentId 的首筆報名
  return bookings;
}`;
