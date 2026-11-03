-- Interview persistence only. Apply once with Supabase SQL Editor or CLI migrations.
begin;
create table public.interview_sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 client_session_id uuid not null,
 schema_version integer not null default 1 check (schema_version = 1),
 role text not null check (role in ('developer','frontend','data','product')),
 difficulty text not null check (difficulty in ('beginner','intermediate','advanced')),
 spoken_language text not null check (spoken_language in ('zh','en')),
 ui_language text not null check (ui_language in ('zh-CN','zh-TW','en')),
 persona_id text not null check (char_length(persona_id) between 1 and 100),
 persona_version text not null default '1',
 voice_id text,
 project_context text not null default '' check (char_length(project_context) <= 2500),
 consent_version text not null,
 consented_at timestamptz not null,
 started_at timestamptz not null,
 ended_at timestamptz,
 duration_seconds integer check (duration_seconds between 0 and 86400),
 ended_reason text check (char_length(ended_reason) <= 200),
 status text not null default 'active' check (status in ('active','completed','interrupted','failed')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (user_id,client_session_id),
 check (ended_at is null or ended_at >= started_at)
);
create index interview_sessions_owner_time on public.interview_sessions(user_id,started_at desc);
create table public.interview_turns (
 id uuid primary key default gen_random_uuid(),
 interview_id uuid not null references public.interview_sessions(id) on delete cascade,
 sequence integer not null check (sequence between 0 and 999),
 role text not null check (role in ('user','assistant')),
 text text not null check (char_length(text) between 1 and 12000),
 transcript_status text not null check (transcript_status in ('complete','partial','failed')),
 started_at timestamptz,
 ended_at timestamptz,
 created_at timestamptz not null default now(),
 unique (interview_id,sequence)
);
create table public.interview_reports (
 id uuid primary key default gen_random_uuid(),
 interview_id uuid not null references public.interview_sessions(id) on delete cascade,
 version integer not null check (version > 0),
 source text not null check (source in ('ai','local')),
 rubric_version text not null default '1',
 model_version text,
 prompt_version text,
 base_score integer check (base_score between 0 and 100),
 style_adjustment integer check (style_adjustment in (-2,0,2)),
 evidence_cap integer check (evidence_cap in (40,60,100)),
 final_score integer check (final_score between 0 and 100),
 confidence text check (confidence in ('low','medium','high','insufficient')),
 completed_answer_count integer not null check (completed_answer_count >= 0),
 answer_units integer check (answer_units >= 0),
 question_count integer check (question_count >= 0),
 last_covered_sequence integer check (last_covered_sequence >= 0),
 dimensions jsonb,
 report jsonb not null check (jsonb_typeof(report) = 'object'),
 generated_at timestamptz not null default now(),
 unique (interview_id,version),
 check ((final_score is null and base_score is null and style_adjustment is null and evidence_cap is null)
  or (source='ai' and base_score is not null and style_adjustment is not null and evidence_cap is not null
   and dimensions is not null and jsonb_typeof(dimensions)='object'
   and final_score=least(evidence_cap,greatest(0,least(100,base_score+style_adjustment)))))
);
create table public.interview_review_jobs (
 id uuid primary key default gen_random_uuid(),
 interview_id uuid not null unique references public.interview_sessions(id) on delete cascade,
 status text not null default 'pending' check (status in ('pending','processing','completed','failed')),
 attempts integer not null default 0 check (attempts between 0 and 3),
 available_at timestamptz not null default now(),
 locked_until timestamptz,
 error_code text check (char_length(error_code) <= 100),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index interview_review_jobs_pending on public.interview_review_jobs(available_at) where status in ('pending','processing');

-- The role preview selector is NOT authentication. Only a verified Supabase
-- identity may access records, and only server-side code may author reports/jobs.
alter table public.interview_sessions enable row level security;
alter table public.interview_turns enable row level security;
alter table public.interview_reports enable row level security;
alter table public.interview_review_jobs enable row level security;
revoke all on public.interview_sessions,public.interview_turns,public.interview_reports,public.interview_review_jobs from anon,authenticated;
grant select,insert,update,delete on public.interview_sessions to authenticated;
grant select,insert on public.interview_turns to authenticated;
grant select on public.interview_reports,public.interview_review_jobs to authenticated;
grant all on public.interview_sessions,public.interview_turns,public.interview_reports,public.interview_review_jobs to service_role;
create policy session_owner_select on public.interview_sessions for select to authenticated using (user_id=(select auth.uid()));
create policy session_owner_insert on public.interview_sessions for insert to authenticated with check (user_id=(select auth.uid()));
create policy session_owner_update on public.interview_sessions for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy session_owner_delete on public.interview_sessions for delete to authenticated using (user_id=(select auth.uid()));
create policy turn_owner_select on public.interview_turns for select to authenticated using (
 exists(select 1 from public.interview_sessions s where s.id=interview_id and s.user_id=(select auth.uid())));
create policy turn_owner_insert on public.interview_turns for insert to authenticated with check (
 exists(select 1 from public.interview_sessions s where s.id=interview_id and s.user_id=(select auth.uid()) and s.status='active'));
create policy report_owner_select on public.interview_reports for select to authenticated using (
 exists(select 1 from public.interview_sessions s where s.id=interview_id and s.user_id=(select auth.uid())));
create policy job_owner_select on public.interview_review_jobs for select to authenticated using (
 exists(select 1 from public.interview_sessions s where s.id=interview_id and s.user_id=(select auth.uid())));

-- Durable leases allow a scheduled worker to resume after a function exits.
-- This function is server-only; concurrent workers cannot claim the same job.
create function public.claim_interview_review_job() returns setof public.interview_review_jobs
language sql security invoker set search_path=public as $$
 update public.interview_review_jobs j set status='processing',attempts=attempts+1,
 locked_until=now()+interval '5 minutes',updated_at=now()
 where j.id=(select q.id from public.interview_review_jobs q
  where ((q.status='pending' and q.available_at<=now()) or (q.status='processing' and q.locked_until<now()))
  and q.attempts<3 order by q.available_at for update skip locked limit 1)
 returning j.*;
$$;
revoke all on function public.claim_interview_review_job() from public,anon,authenticated;
grant execute on function public.claim_interview_review_job() to service_role;
commit;
