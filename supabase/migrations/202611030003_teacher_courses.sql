begin;
-- No service key is used by the teaching API. All requests carry the user's JWT.
create function public.teaching_is_teacher() returns boolean language sql stable security invoker
set search_path = '' as $$ select coalesce(auth.jwt()->'app_metadata'->>'role','')='teacher' $$;

-- Validate at the database boundary too: authenticated clients can call REST directly.
create function public.teaching_valid_course(c jsonb) returns boolean language plpgsql immutable
set search_path = '' as $$
declare l jsonb; q jsonb; s jsonb; ids text[] := '{}'; question_ids text[]; v text;
begin
 if jsonb_typeof(c)<>'object' or not (c ?& array['title','description','language','lessons']) or
 exists(select 1 from jsonb_object_keys(c) k where k not in ('title','description','language','lessons')) then return false; end if;
 if jsonb_typeof(c->'title')<>'string' or length(btrim(c->>'title')) not between 1 and 180 or
 jsonb_typeof(c->'description')<>'string' or length(c->>'description')>3000 or
 c->>'language' not in ('en','zh-CN','zh-TW') or jsonb_typeof(c->'language')<>'string' or
 jsonb_typeof(c->'lessons')<>'array' or jsonb_array_length(c->'lessons') not between 1 and 10 then return false; end if;
 for l in select * from jsonb_array_elements(c->'lessons') loop
  if jsonb_typeof(l)<>'object' or not (l ?& array['id','title','body','scene','sceneItems','questions']) or
  exists(select 1 from jsonb_object_keys(l) k where k not in ('id','title','body','scene','sceneItems','questions')) then return false; end if;
  v:=l->>'id'; if jsonb_typeof(l->'id')<>'string' or length(v) not between 1 and 80 or v !~ '^[A-Za-z0-9_-]+$' or v=any(ids) then return false; end if; ids:=array_append(ids,v);
  if jsonb_typeof(l->'title')<>'string' or length(btrim(l->>'title')) not between 1 and 180 or
  jsonb_typeof(l->'body')<>'string' or length(l->>'body')>18000 or
  jsonb_typeof(l->'scene')<>'string' or l->>'scene' not in ('flow','compare','timeline') or
  jsonb_typeof(l->'sceneItems')<>'array' or jsonb_array_length(l->'sceneItems') not between 1 and 5 or
  jsonb_typeof(l->'questions')<>'array' or jsonb_array_length(l->'questions')>5 then return false; end if;
  for s in select * from jsonb_array_elements(l->'sceneItems') loop
   if jsonb_typeof(s)<>'string' or length(btrim(s #>> '{}')) not between 1 and 60 then return false; end if;
  end loop;
  question_ids:='{}';
  for q in select * from jsonb_array_elements(l->'questions') loop
   if jsonb_typeof(q)<>'object' or not (q ?& array['id','prompt','options','correctIndex','explanation']) or
   exists(select 1 from jsonb_object_keys(q) k where k not in ('id','prompt','options','correctIndex','explanation')) then return false; end if;
   v:=q->>'id'; if jsonb_typeof(q->'id')<>'string' or length(v) not between 1 and 80 or v !~ '^[A-Za-z0-9_-]+$' or v=any(question_ids) then return false; end if; question_ids:=array_append(question_ids,v);
   if jsonb_typeof(q->'prompt')<>'string' or length(btrim(q->>'prompt')) not between 1 and 1500 or
   jsonb_typeof(q->'explanation')<>'string' or length(q->>'explanation')>2500 or
   jsonb_typeof(q->'options')<>'array' or jsonb_array_length(q->'options') not between 2 and 5 or
   jsonb_typeof(q->'correctIndex')<>'number' or (q->>'correctIndex') !~ '^[0-4]$' or
   (q->>'correctIndex')::integer>=jsonb_array_length(q->'options') then return false; end if;
   for s in select * from jsonb_array_elements(q->'options') loop
    if jsonb_typeof(s)<>'string' or length(btrim(s #>> '{}')) not between 1 and 500 then return false; end if;
   end loop;
  end loop;
 end loop;
 return true;
exception when others then return false;
end $$;

create table public.teaching_courses (
 id uuid primary key default gen_random_uuid(), teacher_id uuid not null references auth.users(id),
 title text not null, description text not null default '', language text not null,
 source_id text check(length(source_id)<=160), draft jsonb not null check(public.teaching_valid_course(draft)),
 published jsonb check(published is null or public.teaching_valid_course(published)),
 revision integer not null default 1 check(revision>0), updated_at timestamptz not null default now()
);
create table public.teaching_classrooms (
 id uuid primary key default gen_random_uuid(), teacher_id uuid not null references auth.users(id),
 name text not null check(length(btrim(name)) between 1 and 180), created_at timestamptz not null default now()
);
create table public.teaching_members (
 classroom_id uuid not null references public.teaching_classrooms(id) on delete cascade,
 student_id uuid not null references auth.users(id), username text not null, primary key(classroom_id,student_id)
);
create table public.teaching_assignments (
 id uuid primary key default gen_random_uuid(), classroom_id uuid not null references public.teaching_classrooms(id) on delete cascade,
 course_id uuid not null references public.teaching_courses(id), published_snapshot jsonb not null,
 created_at timestamptz not null default now()
);
create table public.teaching_events (
 id uuid primary key default gen_random_uuid(), student_id uuid not null references auth.users(id),
 assignment_id uuid not null references public.teaching_assignments(id) on delete cascade,
 lesson_id text not null, event_id uuid not null unique, event_type text not null check(event_type in ('enter','heartbeat','complete','quiz')),
 active_seconds integer not null default 0 check(active_seconds between 0 and 30), correct boolean,
 question_id text, selected_index integer, created_at timestamptz not null default now()
);
create index on public.teaching_courses(teacher_id);
create index on public.teaching_classrooms(teacher_id);
create index on public.teaching_members(student_id);
create index on public.teaching_assignments(classroom_id);
create index on public.teaching_events(assignment_id,student_id,created_at desc);

create function public.teaching_course_write() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='INSERT' then
  new.revision:=1; new.published:=null;
 else
  if new.id<>old.id or new.teacher_id<>old.teacher_id or new.revision<>old.revision+1 then raise exception 'revision_conflict'; end if;
  if new.published is distinct from old.published then
   if new.published is distinct from old.draft then raise exception 'publish_draft_first'; end if;
   if exists(select 1 from jsonb_array_elements(new.published->'lessons') l where length(btrim(l->>'body'))=0) then raise exception 'lesson_body_required'; end if;
  end if;
 end if;
 new.title:=new.draft->>'title';new.description:=new.draft->>'description';new.language:=new.draft->>'language';new.updated_at:=now();return new;
end $$;
create trigger teaching_course_write before insert or update on public.teaching_courses for each row execute function public.teaching_course_write();
create function public.teaching_assignment_write() returns trigger language plpgsql security invoker set search_path='' as $$
declare snapshot jsonb;
begin
 select published into snapshot from public.teaching_courses where id=new.course_id and teacher_id=auth.uid();
 if snapshot is null then raise exception 'course_not_published'; end if;
 new.published_snapshot:=snapshot;new.created_at:=now();return new;
end $$;
create trigger teaching_assignment_write before insert on public.teaching_assignments for each row execute function public.teaching_assignment_write();

alter table public.teaching_courses enable row level security;
alter table public.teaching_classrooms enable row level security;
alter table public.teaching_members enable row level security;
alter table public.teaching_assignments enable row level security;
alter table public.teaching_events enable row level security;
create policy teaching_courses_owner on public.teaching_courses for all to authenticated
 using(public.teaching_is_teacher() and teacher_id=auth.uid()) with check(public.teaching_is_teacher() and teacher_id=auth.uid());
create policy teaching_classrooms_owner on public.teaching_classrooms for all to authenticated
 using(public.teaching_is_teacher() and teacher_id=auth.uid()) with check(public.teaching_is_teacher() and teacher_id=auth.uid());
create policy teaching_members_read on public.teaching_members for select to authenticated using(
 student_id=auth.uid() or exists(select 1 from public.teaching_classrooms c where c.id=classroom_id and c.teacher_id=auth.uid()));
create policy teaching_assignments_owner on public.teaching_assignments for all to authenticated
 using(exists(select 1 from public.teaching_classrooms c where c.id=classroom_id and c.teacher_id=auth.uid()))
 with check(exists(select 1 from public.teaching_classrooms c where c.id=classroom_id and c.teacher_id=auth.uid()));
create policy teaching_events_read on public.teaching_events for select to authenticated using(
 student_id=auth.uid() or exists(select 1 from public.teaching_assignments a join public.teaching_classrooms c on c.id=a.classroom_id where a.id=assignment_id and c.teacher_id=auth.uid()));
create policy teaching_events_insert on public.teaching_events for insert to authenticated with check(
 student_id=auth.uid() and auth.jwt()->'app_metadata'->>'role'='student');

-- This trigger reads the protected answer key, never returns it, and ignores supplied correctness.
create function public.teaching_grade_event() returns trigger language plpgsql security definer set search_path='' as $$
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
 join public.teaching_members m on m.classroom_id=a.classroom_id and m.student_id=auth.uid() where a.id=new.assignment_id;
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
create trigger teaching_grade_event before insert on public.teaching_events for each row execute function public.teaching_grade_event();

-- Students never receive SELECT privileges through a policy on the raw answer-bearing rows.
create function public.teaching_student_assignments(assignment_id uuid default null) returns jsonb
language sql stable security definer set search_path='' as $$
 select coalesce(jsonb_agg(jsonb_build_object('id',a.id,'classroom_id',a.classroom_id,'course_id',a.course_id,'created_at',a.created_at,
 'classroom_name',c.name,'published_snapshot',(a.published_snapshot-'lessons') || jsonb_build_object('lessons',(
 select jsonb_agg((l-'questions') || jsonb_build_object('questions',(
 select coalesce(jsonb_agg(q-'correctIndex'-'explanation' order by qi),'[]'::jsonb)
 from jsonb_array_elements(l->'questions') with ordinality as questions(q,qi))) order by li)
 from jsonb_array_elements(a.published_snapshot->'lessons') with ordinality as lessons(l,li)
 ))) order by a.created_at desc),'[]'::jsonb)
 from public.teaching_assignments a join public.teaching_members m on m.classroom_id=a.classroom_id
 join public.teaching_classrooms c on c.id=a.classroom_id
 where m.student_id=auth.uid() and auth.jwt()->'app_metadata'->>'role'='student'
 and (assignment_id is null or a.id=assignment_id)
$$;

-- The sole roster mutation path resolves usernames from auth.users, never returns emails.
create function public.teaching_import_usernames(target_classroom uuid,usernames text[]) returns jsonb
language plpgsql security definer set search_path='' as $$
declare name text; student uuid; seen text[]:='{}'; imported text[]:='{}'; duplicates text[]:='{}'; missing text[]:='{}'; changed integer;
begin
 if coalesce(auth.jwt()->'app_metadata'->>'role','')<>'teacher' or not exists(
 select 1 from public.teaching_classrooms where id=target_classroom and teacher_id=auth.uid()) then raise exception 'teacher_ownership_required'; end if;
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

revoke all on public.teaching_courses,public.teaching_classrooms,public.teaching_members,public.teaching_assignments,public.teaching_events from public,anon,authenticated;
grant select,insert,update,delete on public.teaching_courses,public.teaching_classrooms to authenticated;
grant select on public.teaching_members to authenticated;
-- Assignment snapshots and events are immutable after insertion.
grant select,insert,delete on public.teaching_assignments to authenticated;
grant select,insert on public.teaching_events to authenticated;
revoke all on function public.teaching_is_teacher(), public.teaching_valid_course(jsonb),public.teaching_course_write(),public.teaching_assignment_write(),public.teaching_grade_event(),public.teaching_student_assignments(uuid),public.teaching_import_usernames(uuid,text[]) from public,anon,authenticated;
grant execute on function public.teaching_is_teacher(),public.teaching_valid_course(jsonb),public.teaching_student_assignments(uuid),public.teaching_import_usernames(uuid,text[]) to authenticated;
commit;
