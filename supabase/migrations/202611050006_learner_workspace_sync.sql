-- Account-owned learning records. Clients send field/set deltas, not a last-writer
-- full snapshot, so two devices do not erase each other's completed activities.
begin;
create table if not exists public.learner_workspaces (
 user_id uuid primary key references auth.users(id) on delete cascade,
 state jsonb not null default '{}'::jsonb,
 revision bigint not null default 0,
 applied_batches uuid[] not null default '{}',
 updated_at timestamptz not null default now(),
 constraint learner_workspace_object check (jsonb_typeof(state)='object'),
 constraint learner_workspace_size check (octet_length(state::text)<=2000000)
);
alter table public.learner_workspaces enable row level security;
revoke all on public.learner_workspaces from anon,authenticated;
grant select on public.learner_workspaces to authenticated;
drop policy if exists learner_workspace_owner on public.learner_workspaces;
create policy learner_workspace_owner on public.learner_workspaces for select to authenticated using (user_id=auth.uid());

create or replace function public.learning_set_path(document jsonb, parts text[], value jsonb)
returns jsonb language plpgsql immutable set search_path=public as $$
declare result jsonb; first text;
begin
 if cardinality(parts)=0 then return value; end if;
 result=case when jsonb_typeof(document)='object' then document else '{}'::jsonb end;
 first=parts[1];
 if cardinality(parts)=1 then return jsonb_set(result,array[first],value,true); end if;
 return jsonb_set(result,array[first],public.learning_set_path(result->first,parts[2:],value),true);
end $$;
revoke all on function public.learning_set_path(jsonb,text[],jsonb) from public,anon,authenticated;

create or replace function public.sync_learner_workspace(operations jsonb,batch_id uuid)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
 owner uuid=auth.uid(); saved public.learner_workspaces%rowtype;
 document jsonb; op jsonb; parts text[]; kind text; value jsonb; current_value jsonb;
 items jsonb; found boolean; item jsonb; matches boolean; bootstrap boolean;
 allowed text[]=array['profile','courses','progress','notes','code','events','work','checks','path','game','academy','deliveryLesson','deliveryAnnotations','deliveryTheme','deliveryPenColor','gitProgress'];
begin
 if owner is null then raise exception 'login_required' using errcode='42501'; end if;
 if batch_id is null or jsonb_typeof(operations) is distinct from 'array' or jsonb_array_length(operations)>3000 or octet_length(operations::text)>1500000 then raise exception 'invalid_workspace_operations'; end if;
 insert into public.learner_workspaces(user_id) values(owner) on conflict do nothing;
 select * into saved from public.learner_workspaces where user_id=owner for update;
 if batch_id=any(saved.applied_batches) then return jsonb_build_object('state',saved.state,'revision',saved.revision,'updated_at',saved.updated_at); end if;
 document=saved.state;
 for op in select jsonb_array_elements(operations) loop
  if jsonb_typeof(op->'path') is distinct from 'array' or jsonb_array_length(op->'path') not between 1 and 20 then raise exception 'invalid_workspace_path'; end if;
  if exists(select 1 from jsonb_array_elements(op->'path') p where jsonb_typeof(p) is distinct from 'string') then raise exception 'invalid_workspace_path'; end if;
  select array_agg(p order by position) into parts from jsonb_array_elements_text(op->'path') with ordinality x(p,position);
  if not(parts[1]=any(allowed)) or exists(select 1 from unnest(parts) p where length(p) not between 1 and 180 or p in ('__proto__','prototype','constructor')) then raise exception 'invalid_workspace_path'; end if;
  kind=op->>'type'; value=op->'value'; current_value=document#>parts; bootstrap=coalesce(op->'bootstrap'='true'::jsonb,false);
  if kind='delete' then document=document#-parts;
  elsif kind='set' then
   if value is null then raise exception 'missing_workspace_value'; end if;
   if bootstrap and current_value is not null then continue; end if;
   if parts[cardinality(parts)] in ('passed','correct','done') and current_value='true'::jsonb and value='false'::jsonb and (op->'before') is distinct from 'true'::jsonb then continue; end if;
   document=public.learning_set_path(document,parts,value);
  elsif kind in ('append','discard') then
   if value is null then raise exception 'missing_workspace_value'; end if;
   items='[]'::jsonb; found=false;
   for item in select jsonb_array_elements(case when jsonb_typeof(current_value)='array' then current_value else '[]'::jsonb end) loop
    matches=case when jsonb_typeof(item)='object' and jsonb_typeof(value)='object' and jsonb_typeof(item->'id')='string' and jsonb_typeof(value->'id')='string' then item->>'id'=value->>'id' and (case when jsonb_typeof(item->'type')='string' and coalesce(item->>'at',item->>'time') is not null then item->>'type'=value->>'type' and coalesce(item->>'at',item->>'time')=coalesce(value->>'at',value->>'time') else true end) else item=value end;
    if matches then
     found=true;
     if kind='append' then items=items||jsonb_build_array(case when bootstrap then item else value end); end if;
    else items=items||jsonb_build_array(item); end if;
   end loop;
   if kind='append' and not found then items=items||jsonb_build_array(value); end if;
   document=public.learning_set_path(document,parts,items);
  else raise exception 'invalid_workspace_operation'; end if;
 end loop;
 update public.learner_workspaces set state=document,revision=revision+1,updated_at=now(),applied_batches=(array_append(saved.applied_batches,batch_id))[greatest(1,cardinality(saved.applied_batches)-62):] where user_id=owner returning * into saved;
 return jsonb_build_object('state',saved.state,'revision',saved.revision,'updated_at',saved.updated_at);
end $$;
revoke all on function public.sync_learner_workspace(jsonb,uuid) from public,anon;
grant execute on function public.sync_learner_workspace(jsonb,uuid) to authenticated;
notify pgrst,'reload schema';
commit;
