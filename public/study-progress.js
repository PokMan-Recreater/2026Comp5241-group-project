import {recordActivity} from './academy-core.js';
export function completeStudyLesson(state,courseId,lessonId){
 if(!courseId||!lessonId)return false;state.progress??={};state.progress[courseId]??=[];
 if(state.progress[courseId].includes(lessonId))return false;
 state.progress[courseId].push(lessonId);recordActivity(state,'lesson',courseId+':'+lessonId);return true;
}
