-- Personal courses are owned by learners, so cached speech is keyed by either a
-- class course or a personal course. Exactly one of the two ids is present.
begin;
alter table public.teaching_narration drop constraint if exists teaching_narration_course_id_fkey;
alter table public.teaching_narration drop constraint if exists teaching_narration_pkey;
alter table public.teaching_narration alter column course_id drop not null;
alter table public.teaching_narration add column if not exists personal_course_id uuid references public.personal_courses(id) on delete cascade;
alter table public.teaching_narration add constraint teaching_narration_course_id_fkey foreign key (course_id) references public.teaching_courses(id) on delete cascade;
alter table public.teaching_narration add constraint teaching_narration_scope check ((course_id is null) <> (personal_course_id is null));
alter table public.teaching_narration add column if not exists scope_id uuid generated always as (coalesce(course_id,personal_course_id)) stored;
create unique index if not exists teaching_narration_scope_key on public.teaching_narration(scope_id,cache_key);
create index if not exists teaching_narration_course on public.teaching_narration(course_id);
create index if not exists teaching_narration_personal on public.teaching_narration(personal_course_id);
notify pgrst,'reload schema';
commit;
