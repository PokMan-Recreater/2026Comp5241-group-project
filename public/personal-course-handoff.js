const PREFIX='forma.personal-course-handoff';
const MAX_AGE=15*60*1000;
const key=userId=>`${PREFIX}.${userId||'local'}`;

export function saveCourseHandoff(userId,value){
 try{localStorage.setItem(key(userId),JSON.stringify({...value,at:Date.now()}));return true;}catch{return false;}
}

export function takeCourseHandoff(userId){
 try{
  const storageKey=key(userId),raw=localStorage.getItem(storageKey);
  if(!raw)return null;
  localStorage.removeItem(storageKey);
  const value=JSON.parse(raw);
  if(!value||Date.now()-Number(value.at||0)>MAX_AGE||!Array.isArray(value.lessons)||!value.lessons.length)return null;
  return value;
 }catch{return null;}
}
