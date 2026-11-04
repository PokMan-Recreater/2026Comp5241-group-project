begin;
-- Deletion removes items from the workspace and revokes course access while
-- retaining recoverable course, roster, assignment and learning-history data.
alter table public.teaching_courses add column if not exists deleted_at timestamptz;
alter table public.teaching_classrooms add column if not exists deleted_at timestamptz;
alter table public.teaching_courses drop constraint if exists teaching_courses_draft_check;
alter table public.teaching_courses add constraint teaching_courses_draft_check check(deleted_at is not null or public.teaching_valid_draft(draft)) not valid;
alter table public.teaching_courses drop constraint if exists teaching_courses_published_check;
alter table public.teaching_courses add constraint teaching_courses_published_check check(deleted_at is not null or published is null or public.teaching_valid_course(published)) not valid;

create or replace function public.teaching_ensure_course_class(target_course uuid) returns uuid
language plpgsql security invoker set search_path='' as $$
declare course_row public.teaching_courses; class_id uuid;
begin
 if not public.teaching_is_teacher() then raise exception 'teacher_required'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target_course::text,0));
 select * into course_row from public.teaching_courses where id=target_course and teacher_id=auth.uid();
 if not found then raise exception 'course_not_found'; end if;
 if course_row.published is null or course_row.deleted_at is not null then return null; end if;
 select id into class_id from public.teaching_classrooms where course_id=target_course and teacher_id=auth.uid();
 -- An existing class is authoritative, including intentional deletion or
 -- cancellation of its assignment. Listing must never undo that action.
 if class_id is not null then
  if exists(select 1 from public.teaching_classrooms where id=class_id and deleted_at is null) then return class_id; end if;
  return null;
 end if;
 if class_id is null then
  select c.id into class_id from public.teaching_classrooms c
   where c.teacher_id=auth.uid() and c.course_id is null and c.deleted_at is null
    and exists(select 1 from public.teaching_assignments a where a.classroom_id=c.id and a.course_id=target_course)
    and not exists(select 1 from public.teaching_assignments a where a.classroom_id=c.id and a.course_id<>target_course)
   order by c.created_at,c.id limit 1;
  if class_id is null then
   insert into public.teaching_classrooms(teacher_id,name,course_id)
    values(auth.uid(),course_row.published->>'title',target_course) returning id into class_id;
  else
   update public.teaching_classrooms set course_id=target_course where id=class_id;
  end if;
 end if;
 if not exists(select 1 from public.teaching_assignments where classroom_id=class_id and course_id=target_course) then
  insert into public.teaching_assignments(classroom_id,course_id,published_snapshot)
   values(class_id,target_course,course_row.published);
 end if;
 return class_id;
end $$;

create or replace function public.teaching_sync_course_classrooms() returns void
language plpgsql security invoker set search_path='' as $$
declare course_row record;
begin
 if not public.teaching_is_teacher() then raise exception 'teacher_required'; end if;
 for course_row in select id from public.teaching_courses where teacher_id=auth.uid() and published is not null and deleted_at is null order by id loop
  perform public.teaching_ensure_course_class(course_row.id);
 end loop;
end $$;

create or replace function public.teaching_class_after_publish() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if new.published is not null and new.published is distinct from old.published then
  perform public.teaching_ensure_course_class(new.id);
 end if;
 return new;
end $$;
drop trigger if exists teaching_class_after_publish on public.teaching_courses;
create trigger teaching_class_after_publish after update of published on public.teaching_courses
 for each row execute function public.teaching_class_after_publish();


create or replace function public.teaching_delete_course(target_course uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare affected integer;
begin
 if not public.teaching_is_teacher() then raise exception 'teacher_required'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target_course::text,0));
 perform 1 from public.teaching_courses where id=target_course and teacher_id=auth.uid() and deleted_at is null for update;
 if not found then raise exception 'course_not_found'; end if;
 update public.teaching_classrooms c set deleted_at=coalesce(c.deleted_at,now())
 where c.teacher_id=auth.uid() and (c.course_id=target_course or (
  c.course_id is null and exists(select 1 from public.teaching_assignments a where a.classroom_id=c.id and a.course_id=target_course)
  and not exists(select 1 from public.teaching_assignments a join public.teaching_courses tc on tc.id=a.course_id
   where a.classroom_id=c.id and a.course_id<>target_course and tc.deleted_at is null)));
 get diagnostics affected=row_count;
 update public.teaching_courses set deleted_at=now(),revision=revision+1 where id=target_course;
 return jsonb_build_object('ok',true,'classroomsRemoved',affected);
end $$;

create or replace function public.teaching_delete_classroom(target_classroom uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if not public.teaching_is_teacher() then raise exception 'teacher_required'; end if;
 update public.teaching_classrooms set deleted_at=now()
 where id=target_classroom and teacher_id=auth.uid() and deleted_at is null;
 if not found then raise exception 'classroom_not_found'; end if;
 return jsonb_build_object('ok',true);
end $$;

create or replace function public.teaching_remove_all_students(target_classroom uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare removed_count integer;
begin
 if not public.teaching_is_teacher() or not exists(
  select 1 from public.teaching_classrooms where id=target_classroom and teacher_id=auth.uid() and deleted_at is null
 ) then raise exception 'classroom_not_found'; end if;
 delete from public.teaching_members where classroom_id=target_classroom;
 get diagnostics removed_count=row_count;
 return jsonb_build_object('removed',removed_count);
end $$;

create or replace function public.teaching_grade_event() returns trigger language plpgsql security definer set search_path='' as $$
declare snapshot jsonb; lesson jsonb; question jsonb; last_event_at timestamptz; received_at timestamptz; prior public.teaching_events;
begin
 if new.student_id<>auth.uid() or coalesce(auth.jwt()->'app_metadata'->>'role','')<>'student' then raise exception 'student_required'; end if;
 -- Serialize receipts, including direct REST inserts, before reading the last timestamp.
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.student_id::text || ':' || new.assignment_id::text,0));
 -- A retry does not create an event or advance the elapsed-time baseline.
 select * into prior from public.teaching_events where event_id=new.event_id;
 if found then
  if prior.student_id<>new.student_id or prior.assignment_id<>new.assignment_id or prior.lesson_id<>new.lesson_id or prior.event_type<>new.event_type or
    (new.event_type='quiz' and (prior.question_id is distinct from new.question_id or prior.selected_index is distinct from new.selected_index)) then raise exception 'event_conflict'; end if;
  return null;
 end if;
 received_at:=pg_catalog.clock_timestamp();
 select max(created_at) into last_event_at from public.teaching_events where student_id=new.student_id and assignment_id=new.assignment_id;
 select a.published_snapshot into snapshot from public.teaching_assignments a
 join public.teaching_members m on m.classroom_id=a.classroom_id and m.student_id=auth.uid()
 join public.teaching_classrooms c on c.id=a.classroom_id and c.deleted_at is null
 join public.teaching_courses tc on tc.id=a.course_id and tc.deleted_at is null where a.id=new.assignment_id;
 if snapshot is null then raise exception 'not_enrolled'; end if;
 select l into lesson from jsonb_array_elements(snapshot->'lessons') l where l->>'id'=new.lesson_id;
 if lesson is null then raise exception 'invalid_lesson'; end if;
 new.created_at:=received_at;new.correct:=null;
 new.active_seconds:=case when new.event_type='heartbeat' and last_event_at is not null
  then least(30,greatest(0,new.active_seconds),greatest(0,floor(extract(epoch from (received_at-last_event_at)))::integer)) else 0 end;
 if new.event_type='quiz' then
  select q into question from jsonb_array_elements(lesson->'questions') q where q->>'id'=new.question_id;
  if question is null or new.selected_index is null or new.selected_index<0 or new.selected_index>=jsonb_array_length(question->'options') then raise exception 'invalid_question'; end if;
  new.correct:=new.selected_index=(question->>'correctIndex')::integer;
 else new.question_id:=null;new.selected_index:=null;
 end if;
 return new;
end $$;
create or replace function public.teaching_student_assignments(assignment_id uuid default null) returns jsonb
language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'classroom_id',a.classroom_id,'course_id',a.course_id,'created_at',a.created_at,
 'classroom_name',c.name,'published_snapshot',(a.published_snapshot-'lessons') || jsonb_build_object('lessons',(
 select jsonb_agg((l-'questions') || jsonb_build_object('questions',(
 select coalesce(jsonb_agg(q-'correctIndex'-'explanation' order by qi),'[]'::jsonb)
 from jsonb_array_elements(l->'questions') with ordinality as questions(q,qi))) order by li)
 from jsonb_array_elements(a.published_snapshot->'lessons') with ordinality as lessons(l,li)
 ))) order by a.created_at desc),'[]'::jsonb)
 from public.teaching_assignments a join public.teaching_members m on m.classroom_id=a.classroom_id
 join public.teaching_classrooms c on c.id=a.classroom_id and c.deleted_at is null
 join public.teaching_courses tc on tc.id=a.course_id and tc.deleted_at is null
 where m.student_id=auth.uid() and auth.jwt()->'app_metadata'->>'role'='student'
 and (assignment_id is null or a.id=assignment_id)
$$;

create or replace function public.teaching_import_usernames(target_classroom uuid,usernames text[]) returns jsonb
language plpgsql security definer set search_path='' as $$
declare name text; student uuid; seen text[]:='{}'; imported text[]:='{}'; duplicates text[]:='{}'; missing text[]:='{}'; changed integer;
begin
 if coalesce(auth.jwt()->'app_metadata'->>'role','')<>'teacher' or not exists(
 select 1 from public.teaching_classrooms where id=target_classroom and teacher_id=auth.uid() and deleted_at is null) then raise exception 'teacher_ownership_required'; end if;
 if usernames is null or cardinality(usernames)>500 then raise exception 'invalid_usernames'; end if;
 foreach name in array usernames loop
  if name is null or length(btrim(name)) not between 1 and 80 then raise exception 'invalid_username'; end if;
  name:=btrim(name);
  if name=any(seen) then duplicates:=array_append(duplicates,name);continue; end if;
  seen:=array_append(seen,name);student:=null;
  -- Ambiguous usernames are treated as missing rather than enrolling an arbitrary account.
  select (array_agg(id))[1] into student from auth.users
  where raw_app_meta_data->>'role'='student' and raw_user_meta_data->>'username'=name having count(*)=1;
  if student is null then missing:=array_append(missing,name);continue;end if;
  insert into public.teaching_members(classroom_id,student_id,username) values(target_classroom,student,name) on conflict do nothing;
  get diagnostics changed=row_count;
  if changed=0 then duplicates:=array_append(duplicates,name);else imported:=array_append(imported,name);end if;
 end loop;
 return jsonb_build_object('imported',imported,'duplicates',duplicates,'missing',missing);
end $$;

revoke all on function public.teaching_delete_course(uuid),public.teaching_delete_classroom(uuid),public.teaching_remove_all_students(uuid) from public,anon,authenticated;
grant execute on function public.teaching_delete_course(uuid),public.teaching_delete_classroom(uuid),public.teaching_remove_all_students(uuid) to authenticated;
notify pgrst,'reload schema';
commit;
