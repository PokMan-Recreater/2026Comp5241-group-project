import {supabaseConfig,cloudRequest,authenticatedUser,cloudFailure,CloudError,sameOrigin,readJSON,validUUID} from '../scripts/supabase-support.mjs';
import {validateCourse,text,summarize} from '../scripts/teaching-support.mjs';
export function createTeachingHandler(deps={}){
 const request=deps.cloudRequest||cloudRequest,authenticate=deps.authenticatedUser||authenticatedUser,configuration=deps.supabaseConfig||supabaseConfig;
 return async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  try{
   if(!['GET','POST','DELETE'].includes(req.method))return res.status(405).json({error:'method_not_allowed'});
   if(req.method!=='GET'&&!sameOrigin(req))throw new CloudError('origin_not_allowed',403);
   const config=configuration();if(!config)return res.status(503).json({error:'database_not_configured'});
   const {user,token}=await authenticate(req,res,config),role=user.app_metadata?.role;
   const query=new URL(req.url,'http://local').searchParams,resource=query.get('resource')||'courses';
   const call=(path,options={})=>request(config,'/rest/v1/'+path,{...options,token});
   const uuid=v=>{if(!validUUID(v))throw new CloudError('invalid_request',400);return v;};
   const teacher=()=>{if(role!=='teacher')throw new CloudError('teacher_required',403);};
   const one=async(table,id)=>{const rows=await call(`${table}?id=eq.${uuid(id)}&select=*`);if(!rows.length)throw new CloudError('not_found',404);return rows[0];};
   const owned=async(table,id)=>{teacher();const row=await one(table,id);if(row.teacher_id!==user.id)throw new CloudError('not_found',404);return row;};
   const rpc=(name,body)=>call('rpc/'+name,{method:'POST',body});
   const send=(value,status=200)=>res.status(status).json(value);
   const id=query.get('id');
   if(req.method==='GET'){
    if(resource==='assignments'){
     if(role==='student'){const assignments=await rpc('teaching_student_assignments',{assignment_id:id?uuid(id):null});if(id&&!assignments.length)throw new CloudError('not_found',404);return send(id?{assignment:assignments[0]}:{assignments});}
     teacher();return id?send({assignment:await one('teaching_assignments',id)}):send({assignments:await call('teaching_assignments?select=*&order=created_at.desc')});
    }
    if(resource==='courses'&&role==='student'){
     const assignments=await rpc('teaching_student_assignments',{assignment_id:null});
     const courses=[...new Map(assignments.map(a=>[a.course_id,{id:a.course_id,...a.published_snapshot,published:a.published_snapshot}])).values()];
     if(id){uuid(id);const course=courses.find(c=>c.id===id);if(!course)throw new CloudError('not_found',404);return send({course});}return send({courses});
    }
    teacher();
    // Teachers pick students from a checkbox list. Only id and username cross the
    // wire; the admin directory also holds emails, which never leave the server.
    if(resource==='students'){
     const users=[];
     for(let page=1;page<=20;page++){
      const data=await request(config,`/auth/v1/admin/users?page=${page}&per_page=100`,{admin:true});
      const list=Array.isArray(data?.users)?data.users:[];
      users.push(...list);if(list.length<100)break;
     }
     const students=users.filter(u=>u.app_metadata?.role==='student').map(u=>({id:u.id,username:u.user_metadata?.username||''})).filter(s=>s.id&&s.username).sort((a,b)=>a.username.localeCompare(b.username));
     return send({students});
    }
    if(resource==='courses')return id?send({course:await owned('teaching_courses',id)}):send({courses:await call('teaching_courses?select=*&order=updated_at.desc')});
    if(resource==='classrooms')return id?send({classroom:await owned('teaching_classrooms',id),members:await call('teaching_members?classroom_id=eq.'+uuid(id)+'&select=student_id,username')}):send({classrooms:await call('teaching_classrooms?select=*,teaching_members(student_id,username)&order=created_at.desc')});
    if(resource==='analytics'){
     const assignments=id?[await one('teaching_assignments',id)]:await call('teaching_assignments?select=*&order=created_at.desc');
     const rows=[];
     for(const assignment of assignments){
      const classroom=await owned('teaching_classrooms',assignment.classroom_id);
      const events=[];for(let offset=0;;offset+=500){const page=await call(`teaching_events?assignment_id=eq.${assignment.id}&select=*&order=id&limit=500&offset=${offset}`);events.push(...page);if(page.length<500)break;}
      const members=[];for(let offset=0;;offset+=500){const page=await call(`teaching_members?classroom_id=eq.${assignment.classroom_id}&select=student_id,username&order=student_id&limit=500&offset=${offset}`);members.push(...page);if(page.length<500)break;}
      for(const r of summarize(events,members))rows.push({assignment_id:assignment.id,student_id:r.studentId,username:members.find(m=>m.student_id===r.studentId)?.username||'',classroom_name:classroom.name,course_title:assignment.published_snapshot.title,completed_lessons:r.completedLessons.length,total_lessons:assignment.published_snapshot.lessons.length,active_seconds:r.activeSeconds,correct_attempts:r.correct,quiz_attempts:r.attempts,last_active:r.lastActivity});
     }
     return send({rows,...(id?{assignmentId:id}:{}),timeNotice:'Reported heartbeat time is capped per event; it is not proof of attention or mastery.'});
    }
    throw new CloudError('invalid_resource',400);
   }
   if(req.method==='DELETE'){
    teacher();const table=resource==='courses'?'teaching_courses':resource==='classrooms'?'teaching_classrooms':null;if(!table)throw new CloudError('invalid_resource',400);await owned(table,id);
    if(resource==='courses'){const used=await call('teaching_assignments?course_id=eq.'+uuid(id)+'&select=id&limit=1');if(used.length)throw new CloudError('course_in_use',409);}
    await call(table+'?id=eq.'+id,{method:'DELETE'});return send({ok:true});
   }
   let b;try{b=await readJSON(req,600000);}catch(error){throw new CloudError(error.message==='payload_too_large'?'payload_too_large':'invalid_json',error.message==='payload_too_large'?413:400);}
   if(!b||typeof b!=='object'||Array.isArray(b))throw new CloudError('invalid_request',400);
   if(resource==='activity'||resource==='attempts'){
    if(role!=='student')throw new CloudError('student_required',403);
    if('correct'in b||'score'in b)throw new CloudError('invalid_request',400);
    const type=resource==='attempts'?'quiz':b.eventType;
    if(!['enter','heartbeat','complete','quiz'].includes(type)||(resource==='activity'&&type==='quiz'))throw new CloudError('invalid_request',400);
    text(b.lessonId,80);if(!/^[\w-]+$/.test(b.lessonId))throw new CloudError('invalid_request',400);
    if(type==='quiz')b.selectedIndex=b.choice??b.selectedIndex;
    if(type==='quiz'&&(!Number.isInteger(b.selectedIndex)||b.selectedIndex<0||b.selectedIndex>4))throw new CloudError('invalid_request',400);
    if(type==='heartbeat'&&(!Number.isInteger(b.activeSeconds)||b.activeSeconds<0))throw new CloudError('invalid_request',400);
    const payload={student_id:user.id,assignment_id:uuid(b.assignmentId),lesson_id:b.lessonId,event_id:uuid(b.eventId),event_type:type,active_seconds:type==='heartbeat'?Math.min(30,b.activeSeconds):0,...(type==='quiz'?{question_id:text(b.questionId,80),selected_index:b.selectedIndex}:{})};
    // ON CONFLICT DO NOTHING preserves the first submission and never overwrites it.
    const rows=await call('teaching_events?on_conflict=event_id',{method:'POST',body:payload,headers:{Prefer:'resolution=ignore-duplicates,return=representation'}});
    const event=rows[0]|| (await call('teaching_events?event_id=eq.'+b.eventId+'&select=*'))[0];
    if(!event||event.assignment_id!==b.assignmentId||event.lesson_id!==b.lessonId||event.event_type!==type||(type==='quiz'&&(event.question_id!==b.questionId||event.selected_index!==b.selectedIndex)))throw new CloudError('event_conflict',409);
    return send({event,...(type==='quiz'?{correct:event.correct}:{})});
   }
   teacher();
   if(resource==='courses'){
    if(!['save','publish'].includes(b.action))throw new CloudError('invalid_request',400);
    if(!b.id){if(b.action!=='save')throw new CloudError('invalid_request',400);const draft=validateCourse(b.course);return send({course:(await call('teaching_courses',{method:'POST',body:{teacher_id:user.id,title:draft.title,description:draft.description,language:draft.language,source_id:b.sourceId==null?null:text(b.sourceId,160),draft},headers:{Prefer:'return=representation'}}))[0]},201);}
    const current=await owned('teaching_courses',b.id);if(!Number.isInteger(b.revision)||b.revision!==current.revision)throw new CloudError('revision_conflict',409);
    const draft=validateCourse(b.action==='save'?b.course:current.draft,b.action==='publish'),patch=b.action==='save'?{draft,title:draft.title,description:draft.description,language:draft.language}:{published:draft};
    const rows=await call(`teaching_courses?id=eq.${b.id}&revision=eq.${b.revision}`,{method:'PATCH',body:{...patch,revision:b.revision+1},headers:{Prefer:'return=representation'}});if(!rows.length)throw new CloudError('revision_conflict',409);return send({course:rows[0]});
   }
   if(resource==='import'||(resource==='classrooms'&&b.action==='import')){
    await owned('teaching_classrooms',b.classroomId);if(!Array.isArray(b.usernames)||b.usernames.length>500)throw new CloudError('invalid_request',400);
    return send(await rpc('teaching_import_usernames',{target_classroom:uuid(b.classroomId),usernames:b.usernames.map(n=>text(n,80))}));
   }
   if(resource==='classrooms'&&b.action==='rename-class'){await owned('teaching_classrooms',b.id);return send({classroom:(await call('teaching_classrooms?id=eq.'+b.id,{method:'PATCH',body:{name:text(b.name,160)},headers:{Prefer:'return=representation'}}))[0]});}
   if(resource==='classrooms'&&b.action==='create-class')return send({classroom:(await call('teaching_classrooms',{method:'POST',body:{teacher_id:user.id,name:text(b.name,160)},headers:{Prefer:'return=representation'}}))[0]},201);
   if((resource==='classrooms'||resource==='assignments')&&b.action==='assign'){
    await owned('teaching_classrooms',b.classroomId);const course=await owned('teaching_courses',b.courseId);if(!course.published)throw new CloudError('course_not_published',400);
    return send({assignment:(await call('teaching_assignments',{method:'POST',body:{classroom_id:b.classroomId,course_id:b.courseId,published_snapshot:course.published},headers:{Prefer:'return=representation'}}))[0]},201);
   }
   throw new CloudError('invalid_request',400);
  }catch(error){return cloudFailure(res,error);}
 };
}
export default createTeachingHandler();
