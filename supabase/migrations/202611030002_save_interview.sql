begin;
-- Server-only atomic save: no orphan sessions or half-written conversations.
create function public.save_interview_record(owner_id uuid,payload jsonb) returns uuid
language plpgsql security invoker set search_path=public as $$
declare session_id uuid;
begin
 insert into public.interview_sessions(user_id,client_session_id,role,difficulty,spoken_language,ui_language,persona_id,persona_version,project_context,consent_version,consented_at,started_at,ended_at,duration_seconds,ended_reason,status)
 values(owner_id,(payload->>'client_session_id')::uuid,payload->>'role',payload->>'difficulty',payload->>'spoken_language',payload->>'ui_language',payload->>'persona_id',payload->>'persona_version',payload->>'project_context',payload->>'consent_version',(payload->>'consented_at')::timestamptz,(payload->>'started_at')::timestamptz,(payload->>'ended_at')::timestamptz,(payload->>'duration_seconds')::integer,payload->>'ended_reason',payload->>'status')
 on conflict(user_id,client_session_id) do nothing returning id into session_id;
 if session_id is null then
  select id into session_id from public.interview_sessions where user_id=owner_id and client_session_id=(payload->>'client_session_id')::uuid;
  return session_id;
 end if;
 insert into public.interview_turns(interview_id,sequence,role,text,transcript_status)
 select session_id,(t->>'sequence')::integer,t->>'role',t->>'text',t->>'transcript_status' from jsonb_array_elements(payload->'turns') t;
 if exists(select 1 from public.interview_turns where interview_id=session_id and role='user' and transcript_status='complete') then
  insert into public.interview_review_jobs(interview_id) values(session_id);
 end if;
 return session_id;
end;
$$;
revoke all on function public.save_interview_record(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.save_interview_record(uuid,jsonb) to service_role;

-- A late worker must not commit after its lease was reassigned.
create function public.complete_interview_review(job_id uuid,lease_until timestamptz,report_row jsonb) returns boolean
language plpgsql security invoker set search_path=public as $$
declare target uuid;
begin
 select interview_id into target from public.interview_review_jobs where id=job_id and status='processing' and locked_until=lease_until for update;
 if target is null then return false; end if;
 insert into public.interview_reports(interview_id,version,source,model_version,prompt_version,base_score,style_adjustment,evidence_cap,final_score,confidence,completed_answer_count,answer_units,last_covered_sequence,dimensions,report)
 values(target,1,report_row->>'source',report_row->>'model_version','interview-review-1',(report_row->>'base_score')::integer,(report_row->>'style_adjustment')::integer,(report_row->>'evidence_cap')::integer,(report_row->>'final_score')::integer,report_row->>'confidence',(report_row->>'completed_answer_count')::integer,(report_row->>'answer_units')::integer,(report_row->>'last_covered_sequence')::integer,report_row->'dimensions',report_row->'report');
 update public.interview_review_jobs set status='completed',locked_until=null,error_code=null,updated_at=now() where id=job_id;
 return true;
end;
$$;
revoke all on function public.complete_interview_review(uuid,timestamptz,jsonb) from public,anon,authenticated;
grant execute on function public.complete_interview_review(uuid,timestamptz,jsonb) to service_role;
commit;

-- Mark exhausted leases as failed instead of leaving them processing forever.
create or replace function public.claim_interview_review_job() returns setof public.interview_review_jobs
language sql security invoker set search_path=public as $$
 update public.interview_review_jobs set status='failed',locked_until=null,error_code='attempts_exhausted',updated_at=now()
 where attempts>=3 and ((status='processing' and locked_until<now()) or status='pending');
 update public.interview_review_jobs j set status='processing',attempts=attempts+1,locked_until=now()+interval '5 minutes',updated_at=now()
 where j.id=(select q.id from public.interview_review_jobs q
 where ((q.status='pending' and q.available_at<=now()) or (q.status='processing' and q.locked_until<now()))
 and q.attempts<3 order by q.available_at for update skip locked limit 1) returning j.*;
$$;
