const key=userId=>`forma.plan-course.v1.${userId||'local'}`;

const read=userId=>{
 try{const value=JSON.parse(localStorage.getItem(key(userId))||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}
};

export function linkPlanCourse(userId,planId,courseId){
 if(!planId||!courseId)return false;
 try{const map=read(userId);map[planId]=courseId;localStorage.setItem(key(userId),JSON.stringify(map));return true;}catch{return false;}
}

export function planCourseFor(userId,planId){
 if(!planId)return null;
 const value=read(userId)[planId];
 return typeof value==='string'&&value?value:null;
}

export function clearPlanCourse(userId,planId){
 if(!planId)return false;
 try{const map=read(userId);if(!(planId in map))return false;delete map[planId];localStorage.setItem(key(userId),JSON.stringify(map));return true;}catch{return false;}
}
