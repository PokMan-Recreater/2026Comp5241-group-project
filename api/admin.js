import {supabaseConfig,cloudRequest,authenticatedUser,cloudFailure,CloudError,sameOrigin,readJSON,allowRequest,validUUID} from '../scripts/supabase-support.mjs';
import {summarize} from '../scripts/teaching-support.mjs';

const ROLES=['student','teacher','admin'];
const ASSIGNMENT_LIMIT=30;

export function createAdminHandler(deps={}){
 const request=deps.cloudRequest||cloudRequest,authenticate=deps.authenticatedUser||authenticatedUser,configuration=deps.supabaseConfig||supabaseConfig;
 return async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  try{
   if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'method_not_allowed'});
   if(req.method!=='GET'&&!sameOrigin(req))throw new CloudError('origin_not_allowed',403);
   const config=configuration();if(!config)return res.status(503).json({error:'database_not_configured'});
   const {user}=await authenticate(req,res,config);
   if(user.app_metadata?.role!=='admin')throw new CloudError('admin_required',403);
   const query=new URL(req.url,'http://local').searchParams,resource=query.get('resource')||'overview';
   const send=(value,status=200)=>res.status(status).json(value);
   const uuid=value=>{if(!validUUID(value))throw new CloudError('invalid_request',400);return value;};
   // PostgREST returns the exact total in content-range when counted; the parsed
   // body is empty because the count request asks for no rows.
   const count=async(table,filter='',select='id')=>{
    const {headers}=await request(config,'/rest/v1/'+table+'?select='+select+(filter?'&'+filter:'')+'&limit=0',{admin:true,headers:{Prefer:'count=exact'},raw:true});
    const total=Number(String(headers['content-range']||'').split('/').pop());
    return Number.isFinite(total)?total:0;
   };
   const directory=async()=>{
    const users=[];
    for(let page=1;page<=20;page++){
     const data=await request(config,`/auth/v1/admin/users?page=${page}&per_page=100`,{admin:true});
     const batch=Array.isArray(data?.users)?data.users:[];
     users.push(...batch);if(batch.length<100)break;
    }
    return users;
   };
   const publicUser=u=>({id:u.id,username:u.user_metadata?.username||'',email:u.email||'',role:ROLES.includes(u.app_metadata?.role)?u.app_metadata.role:'student',created_at:u.created_at||null,last_sign_in_at:u.last_sign_in_at||null,banned:Boolean(u.banned_until)&&new Date(u.banned_until)>new Date()});
   const nameOf=list=>{const names=new Map(list.map(u=>[u.id,u.user_metadata?.username||'']));return id=>names.get(id)||'';};
   if(req.method==='GET'){
    if(resource==='overview'){
     const users=await directory();
     const roles={student:0,teacher:0,admin:0};
     for(const u of users){const role=u.app_metadata?.role;if(role==='student'||role==='teacher'||role==='admin')roles[role]++;}
     const [teachingCourses,publishedCourses,personalCourses,classrooms,assignments,events]=await Promise.all([
      count('teaching_courses','deleted_at=is.null'),
      count('teaching_courses','deleted_at=is.null&published=not.is.null'),
      count('personal_courses'),
      count('teaching_classrooms','deleted_at=is.null'),
      count('teaching_assignments','teaching_courses.deleted_at=is.null&teaching_classrooms.deleted_at=is.null','id,teaching_courses!inner(deleted_at),teaching_classrooms!inner(deleted_at)'),
      count('teaching_events')
     ]);
     return send({stats:{users:users.length,students:roles.student,teachers:roles.teacher,admins:roles.admin,teachingCourses,publishedCourses,personalCourses,classrooms,assignments,events}});
    }
    if(resource==='users'){
     const search=String(query.get('search')||'').trim().toLowerCase().slice(0,80);
     const users=(await directory()).map(publicUser).filter(u=>!search||u.username.toLowerCase().includes(search)||u.email.toLowerCase().includes(search)).sort((a,b)=>a.username.localeCompare(b.username));
     return send({users});
    }
    if(resource==='courses'){
     const names=nameOf(await directory());
     const teaching=await request(config,'/rest/v1/teaching_courses?select=id,title,description,language,teacher_id,revision,updated_at,published_title:published->>title&deleted_at=is.null&order=updated_at.desc&limit=500',{admin:true});
     const personal=await request(config,'/rest/v1/personal_courses?select=id,title,description,language,owner_id,revision,updated_at&order=updated_at.desc&limit=500',{admin:true});
     const courses=[
      ...teaching.map(c=>({id:c.id,title:c.title,description:c.description,language:c.language,owner_id:c.teacher_id,owner_username:names(c.teacher_id),kind:'teaching',published:Boolean(c.published_title),revision:c.revision,updated_at:c.updated_at})),
      ...personal.map(c=>({id:c.id,title:c.title,description:c.description,language:c.language,owner_id:c.owner_id,owner_username:names(c.owner_id),kind:'personal',published:false,revision:c.revision,updated_at:c.updated_at}))
     ].sort((a,b)=>String(b.updated_at||'').localeCompare(String(a.updated_at||'')));
     return send({courses});
    }
    if(resource==='learning'){
     const assignments=await request(config,`/rest/v1/teaching_assignments?select=*,teaching_classrooms!inner(name,deleted_at),teaching_courses!inner(deleted_at)&teaching_classrooms.deleted_at=is.null&teaching_courses.deleted_at=is.null&order=created_at.desc&limit=${ASSIGNMENT_LIMIT}`,{admin:true});
     const rows=[];
     for(const assignment of assignments){
      const events=[];for(let offset=0;;offset+=500){const page=await request(config,`/rest/v1/teaching_events?assignment_id=eq.${assignment.id}&select=*&order=id&limit=500&offset=${offset}`,{admin:true});events.push(...page);if(page.length<500)break;}
      const members=[];for(let offset=0;;offset+=500){const page=await request(config,`/rest/v1/teaching_members?classroom_id=eq.${assignment.classroom_id}&select=student_id,username&order=student_id&limit=500&offset=${offset}`,{admin:true});members.push(...page);if(page.length<500)break;}
      const roster=new Map(members.map(m=>[m.student_id,m.username||'']));
      for(const row of summarize(events,members))rows.push({assignment_id:assignment.id,classroom_name:assignment.teaching_classrooms?.name||'',course_title:assignment.published_snapshot?.title||'',student_id:row.studentId,username:roster.get(row.studentId)||'',completed_lessons:row.completedLessons.length,total_lessons:assignment.published_snapshot?.lessons?.length||0,active_seconds:row.activeSeconds,correct_attempts:row.correct,quiz_attempts:row.attempts,last_active:row.lastActivity});
     }
     const students=new Set(rows.map(r=>r.student_id)),activeStudents=new Set(rows.filter(r=>r.last_active).map(r=>r.student_id));
     const quizAttempts=rows.reduce((n,r)=>n+r.quiz_attempts,0),correctAttempts=rows.reduce((n,r)=>n+r.correct_attempts,0);
     return send({rows,summary:{assignments:assignments.length,students:students.size,activeStudents:activeStudents.size,completedLessons:rows.reduce((n,r)=>n+r.completed_lessons,0),activeSeconds:rows.reduce((n,r)=>n+r.active_seconds,0),quizAttempts,correctAttempts,accuracy:quizAttempts?correctAttempts/quizAttempts:null,truncated:assignments.length>=ASSIGNMENT_LIMIT}});
    }
    throw new CloudError('invalid_resource',400);
   }
   if(!allowRequest(req,'admin',40))throw new CloudError('rate_limited',429);
   let b;try{b=await readJSON(req,8000);}catch(error){throw new CloudError(error.message==='payload_too_large'?'payload_too_large':'invalid_json',error.message==='payload_too_large'?413:400);}
   if(!b||typeof b!=='object'||Array.isArray(b))throw new CloudError('invalid_request',400);
   if(b.action==='set-role'){
    const target=uuid(b.userId);if(!ROLES.includes(b.role))throw new CloudError('invalid_request',400);
    if(target===user.id&&b.role!=='admin')throw new CloudError('cannot_change_own_role',400);
    const current=await request(config,'/auth/v1/admin/users/'+target,{admin:true});
    if(!current?.id)throw new CloudError('not_found',404);
    if(current.app_metadata?.role==='admin'&&b.role!=='admin'&&(await directory()).filter(u=>u.app_metadata?.role==='admin').length<=1)throw new CloudError('last_admin',400);
    const updated=await request(config,'/auth/v1/admin/users/'+target,{method:'PUT',admin:true,body:{app_metadata:{...(current.app_metadata||{}),role:b.role}}});
    return send({user:publicUser(updated||{...current,app_metadata:{...(current.app_metadata||{}),role:b.role}})});
   }
   if(b.action==='ban'){
    const target=uuid(b.userId);if(typeof b.banned!=='boolean')throw new CloudError('invalid_request',400);
    if(target===user.id&&b.banned)throw new CloudError('cannot_ban_self',400);
    const current=await request(config,'/auth/v1/admin/users/'+target,{admin:true});
    if(!current?.id)throw new CloudError('not_found',404);
    const updated=await request(config,'/auth/v1/admin/users/'+target,{method:'PUT',admin:true,body:{ban_duration:b.banned?'876000h':'none'}});
    return send({user:publicUser(updated||current)});
   }
   if(b.action==='unpublish'){
    const target=uuid(b.courseId);if(!Number.isInteger(b.revision))throw new CloudError('invalid_request',400);
    const rows=await request(config,`/rest/v1/teaching_courses?id=eq.${target}&deleted_at=is.null&revision=eq.${b.revision}`,{method:'PATCH',admin:true,body:{published:null,revision:b.revision+1},headers:{Prefer:'return=representation'}});
    if(!rows.length)throw new CloudError('revision_conflict',409);
    return send({course:rows[0]});
   }
   if(b.action==='delete-course'){
    const target=uuid(b.courseId);if(b.kind!=='teaching')throw new CloudError('invalid_request',400);
    const [current]=await request(config,`/rest/v1/teaching_courses?id=eq.${target}&deleted_at=is.null&select=id,revision`,{admin:true});
    if(!current)throw new CloudError('not_found',404);
    const rows=await request(config,`/rest/v1/teaching_courses?id=eq.${target}&deleted_at=is.null&revision=eq.${current.revision}`,{method:'PATCH',admin:true,body:{deleted_at:new Date().toISOString(),revision:current.revision+1},headers:{Prefer:'return=representation'}});
    if(!rows.length)throw new CloudError('revision_conflict',409);
    await request(config,`/rest/v1/teaching_classrooms?course_id=eq.${target}&deleted_at=is.null`,{method:'PATCH',admin:true,body:{deleted_at:new Date().toISOString()}});
    return send({deleted:true});
   }
   throw new CloudError('invalid_request',400);
  }catch(error){return cloudFailure(res,error);}
 };
}
export default createAdminHandler();
