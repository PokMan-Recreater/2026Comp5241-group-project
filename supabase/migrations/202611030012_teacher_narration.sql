-- Cached speech stays private; the API checks course ownership or active
-- assignment membership, and matches the exact script before serving audio.
create table if not exists public.teaching_narration (
 course_id uuid not null references public.teaching_courses(id),
 cache_key text not null check(cache_key ~ '^[a-f0-9]{64}$'),
 script_text text not null check(length(script_text) between 1 and 1600),
 language text not null check(language in ('en','zh-CN')),
 duration double precision not null check(duration>0 and duration<=42),
 audio_base64 text not null check(length(audio_base64) between 2000 and 2700000),
 created_at timestamptz not null default now(), primary key(course_id,cache_key)
);
alter table public.teaching_narration enable row level security;
revoke all on public.teaching_narration from public,anon,authenticated;
grant select,insert,update,delete on public.teaching_narration to service_role;
notify pgrst,'reload schema';
