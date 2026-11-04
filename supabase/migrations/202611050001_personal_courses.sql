-- Self-directed mini-courses. A row belongs to one signed-in learner and is
-- their live draft; there is no publication or classroom. RLS and the REST
-- query both scope every row to auth.uid().
begin;
create table public.personal_courses (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null,
 description text not null default '',
 language text not null,
 source_id text check(length(source_id)<=160),
 author_materials text not null default '' check(length(author_materials)<=16000),
 draft jsonb not null check(public.teaching_valid_draft(draft)),
 revision integer not null default 1 check(revision>0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index on public.personal_courses(owner_id,updated_at desc);
create or replace function public.personal_course_write() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='INSERT' then
  new.revision:=1;
 else
  if new.id<>old.id or new.owner_id<>old.owner_id or new.revision<>old.revision+1 then raise exception 'revision_conflict'; end if;
 end if;
 new.title:=new.draft->>'title';new.description:=new.draft->>'description';new.language:=new.draft->>'language';new.updated_at:=now();return new;
end $$;
create trigger personal_course_write before insert or update on public.personal_courses for each row execute function public.personal_course_write();
alter table public.personal_courses enable row level security;
create policy personal_courses_owner on public.personal_courses for all to authenticated
 using(owner_id=auth.uid()) with check(owner_id=auth.uid());
revoke all on public.personal_courses from public,anon,authenticated;
grant select,insert,update,delete on public.personal_courses to authenticated;
revoke all on function public.personal_course_write() from public,anon,authenticated;
commit;
