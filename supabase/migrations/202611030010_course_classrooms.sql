begin;
alter table public.teaching_classrooms add column if not exists course_id uuid unique references public.teaching_courses(id);

-- A teacher cannot reserve another teacher's course through a direct table write.
create or replace function public.teaching_class_course_owner() returns trigger
language plpgsql security invoker set search_path='' as $$
begin
 if new.course_id is not null and not exists(
  select 1 from public.teaching_courses where id=new.course_id and teacher_id=new.teacher_id
 ) then raise exception 'course_not_found'; end if;
 return new;
end $$;
drop trigger if exists teaching_class_course_owner on public.teaching_classrooms;
create trigger teaching_class_course_owner before insert or update of course_id,teacher_id on public.teaching_classrooms
 for each row execute function public.teaching_class_course_owner();

-- One stable class per published course. Reuse a single-course legacy class
-- when possible, keeping its custom name, members and immutable assignments.
create or replace function public.teaching_ensure_course_class(target_course uuid) returns uuid
language plpgsql security invoker set search_path='' as $$
declare course_row public.teaching_courses; class_id uuid;
begin
 if not public.teaching_is_teacher() then raise exception 'teacher_required'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(target_course::text,0));
 select * into course_row from public.teaching_courses where id=target_course and teacher_id=auth.uid();
 if not found then raise exception 'course_not_found'; end if;
 if course_row.published is null then return null; end if;
 select id into class_id from public.teaching_classrooms where course_id=target_course and teacher_id=auth.uid();
 if class_id is null then
  select c.id into class_id from public.teaching_classrooms c
   where c.teacher_id=auth.uid() and c.course_id is null
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
 for course_row in select id from public.teaching_courses where teacher_id=auth.uid() and published is not null order by id loop
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

-- Removing a student revokes class access without deleting the account or
-- their historical activity. Membership can be restored using the picker.
create or replace function public.teaching_remove_student(target_classroom uuid,target_student uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare removed_count integer;
begin
 if not public.teaching_is_teacher() or not exists(
  select 1 from public.teaching_classrooms where id=target_classroom and teacher_id=auth.uid()
 ) then raise exception 'classroom_not_found'; end if;
 delete from public.teaching_members where classroom_id=target_classroom and student_id=target_student;
 get diagnostics removed_count=row_count;
 return jsonb_build_object('removed',removed_count);
end $$;
revoke all on function public.teaching_ensure_course_class(uuid),public.teaching_sync_course_classrooms(),public.teaching_class_after_publish(),public.teaching_class_course_owner(),public.teaching_remove_student(uuid,uuid) from public,anon,authenticated;
grant execute on function public.teaching_ensure_course_class(uuid),public.teaching_sync_course_classrooms(),public.teaching_remove_student(uuid,uuid) to authenticated;
commit;
