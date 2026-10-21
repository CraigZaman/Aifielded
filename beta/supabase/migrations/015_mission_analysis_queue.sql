begin;

create table if not exists public.mission_analysis_jobs (
  mission_id uuid primary key references public.missions(id) on delete cascade,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  revision bigint not null default 1,
  claimed_revision bigint,
  status text not null default 'pending' check (status in ('pending','running','ready','retry','failed')),
  claim_token uuid,
  locked_until timestamptz,
  evidence_ids uuid[],
  attempts integer not null default 0,
  available_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  error_code text
);
alter table public.mission_analysis_jobs enable row level security;
revoke all on public.mission_analysis_jobs from public,anon,authenticated;
grant all on public.mission_analysis_jobs to service_role;

create or replace view public.mission_analysis_status with (security_barrier=true) as
select mission_id,organisation_id,status,updated_at,completed_at,error_code
from public.mission_analysis_jobs
where auth.uid() is not null and public.can_manage_workspace(organisation_id);
revoke all on public.mission_analysis_status from public,anon,authenticated;
grant select on public.mission_analysis_status to authenticated;

create or replace function public.queue_approved_mission_evidence()
returns trigger language plpgsql security definer set search_path=public as $$
declare target uuid; workspace uuid; old_shared boolean := false; new_shared boolean := false;
begin
  if tg_op<>'INSERT' then old_shared := old.participant_approved and old.confidentiality in ('SHARE','CONTRIBUTE'); end if;
  if tg_op<>'DELETE' then new_shared := new.participant_approved and new.confidentiality in ('SHARE','CONTRIBUTE'); end if;
  if not old_shared and not new_shared then return null; end if;
  if tg_op='UPDATE' and new is not distinct from old then return null; end if;
  for target,workspace in select distinct m.id,m.organisation_id from public.missions m
    where m.id in (case when old_shared then old.mission_id end,case when new_shared then new.mission_id end)
  loop
    -- Withdrawing or changing previously shared evidence must not leave derived text visible.
    if old_shared then
      delete from public.themes where mission_id=target;
      delete from public.hypotheses where mission_id=target;
      delete from public.findings where mission_id=target;
    end if;
    insert into public.mission_analysis_jobs(mission_id,organisation_id) values(target,workspace)
    on conflict(mission_id) do update set revision=mission_analysis_jobs.revision+1,
      status=case when mission_analysis_jobs.status='running' and mission_analysis_jobs.locked_until>now() then 'running' else 'pending' end,
      attempts=0,available_at=now(),updated_at=now(),error_code=null;
  end loop;
  return null;
end $$;
drop trigger if exists queue_approved_mission_evidence on public.observations;
create trigger queue_approved_mission_evidence after insert or update or delete on public.observations
for each row execute function public.queue_approved_mission_evidence();
revoke all on function public.queue_approved_mission_evidence() from public,anon,authenticated;

create or replace function public.request_mission_analysis(target_mission uuid)
returns void language plpgsql security definer set search_path=public as $$
declare workspace uuid;
begin
  select organisation_id into workspace from public.missions where id=target_mission;
  if auth.uid() is null or workspace is null or not public.can_manage_workspace(workspace) then raise exception 'Not authorised'; end if;
  insert into public.mission_analysis_jobs(mission_id,organisation_id) values(target_mission,workspace)
  on conflict(mission_id) do update set
    status=case when mission_analysis_jobs.status='running' and mission_analysis_jobs.locked_until>now() then 'running' else 'pending' end,
    attempts=0,available_at=now(),updated_at=now(),error_code=null;
end $$;
revoke all on function public.request_mission_analysis(uuid) from public,anon,authenticated;
grant execute on function public.request_mission_analysis(uuid) to authenticated;

create or replace function public.claim_mission_analysis(target_mission uuid default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare job public.mission_analysis_jobs%rowtype; token uuid; evidence jsonb; ids uuid[]; brief jsonb;
begin
  update public.mission_analysis_jobs set status='failed',claim_token=null,locked_until=null,evidence_ids=null,error_code='ANALYSIS_FAILED',updated_at=now()
    where status='running' and locked_until<=now() and attempts>=3 and revision=claimed_revision;
  select * into job from public.mission_analysis_jobs
  where (target_mission is null or mission_id=target_mission)
    and (status in ('pending','retry') and available_at<=now() or status='running' and locked_until<=now())
  order by available_at,mission_id for update skip locked limit 1;
  if job.mission_id is null then return null; end if;
  select jsonb_build_object('title',title,'objective',objective) into brief from public.missions where id=job.mission_id;
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'category',category,'summary',summary,'detail',detail,'confidence',confidence,'confidentiality',confidentiality)),'[]'::jsonb),coalesce(array_agg(id),'{}'::uuid[])
  into evidence,ids from (
    select id,category,summary,detail,confidence,confidentiality from public.observations
    where mission_id=job.mission_id and organisation_id=job.organisation_id and participant_approved and confidentiality in ('SHARE','CONTRIBUTE')
    order by created_at desc,id limit 200
  ) approved;
  token := gen_random_uuid();
  update public.mission_analysis_jobs set status='running',claim_token=token,claimed_revision=revision,
    evidence_ids=ids,locked_until=now()+interval '5 minutes',attempts=attempts+1,updated_at=now()
    where mission_id=job.mission_id;
  return jsonb_build_object('mission_id',job.mission_id,'claim_token',token,'mission',brief,'evidence',evidence);
end $$;
revoke all on function public.claim_mission_analysis(uuid) from public,anon,authenticated;
grant execute on function public.claim_mission_analysis(uuid) to service_role;

create or replace function public.finish_mission_analysis(target_mission uuid,token uuid,synthesis jsonb)
returns boolean language plpgsql security definer set search_path=public as $$
declare job public.mission_analysis_jobs%rowtype; item jsonb; ids uuid[]; for_ids uuid[]; against_ids uuid[]; references_text text[]; against_text text[];
begin
  select * into job from public.mission_analysis_jobs where mission_id=target_mission for update;
  if job.status is distinct from 'running' or token is null or job.claim_token is distinct from token or job.locked_until<=now() then raise exception 'Analysis lease expired'; end if;
  if job.revision<>job.claimed_revision then
    update public.mission_analysis_jobs set status='pending',claim_token=null,locked_until=null,available_at=now(),updated_at=now() where mission_id=target_mission;
    return false;
  end if;
  if jsonb_typeof(synthesis->'themes') is distinct from 'array' or jsonb_typeof(synthesis->'hypotheses') is distinct from 'array' or jsonb_typeof(synthesis->'findings') is distinct from 'array'
    or jsonb_array_length(synthesis->'themes')>8 or jsonb_array_length(synthesis->'hypotheses')>6 or jsonb_array_length(synthesis->'findings')>8 then raise exception 'Invalid analysis'; end if;
  -- Every reference must be part of the exact approved snapshot claimed by this worker.
  for item in select value from jsonb_array_elements(synthesis->'themes') union all select value from jsonb_array_elements(synthesis->'findings')
  loop
    select array_agg(value::uuid) into ids from jsonb_array_elements_text(item->'evidenceIds');
    if coalesce(cardinality(ids),0) not between 1 and 200 or not ids <@ job.evidence_ids then raise exception 'Invalid evidence citation'; end if;
  end loop;
  for item in select value from jsonb_array_elements(synthesis->'hypotheses') loop
    select array_agg(value::uuid) into for_ids from jsonb_array_elements_text(item->'evidenceFor');
    select coalesce(array_agg(value::uuid),'{}'::uuid[]) into against_ids from jsonb_array_elements_text(item->'evidenceAgainst');
    if coalesce(cardinality(for_ids),0) not between 1 and 200 or cardinality(against_ids)>200
      or not for_ids <@ job.evidence_ids or not against_ids <@ job.evidence_ids then raise exception 'Invalid evidence citation'; end if;
  end loop;
  delete from public.themes where mission_id=target_mission;
  delete from public.hypotheses where mission_id=target_mission;
  delete from public.findings where mission_id=target_mission;
  for item in select value from jsonb_array_elements(synthesis->'themes') loop
    select array_agg(distinct value::uuid) into ids from jsonb_array_elements_text(item->'evidenceIds');
    insert into public.themes(organisation_id,mission_id,title,description,confidence,evidence_count,participant_count)
      select job.organisation_id,target_mission,item->>'title',item->>'description',(item->>'confidence')::numeric,cardinality(ids),count(distinct user_id)
      from public.observations where id=any(ids);
  end loop;
  for item in select value from jsonb_array_elements(synthesis->'hypotheses') loop
    select array_agg(distinct value::uuid) into for_ids from jsonb_array_elements_text(item->'evidenceFor');
    select array_agg(distinct value::uuid) into against_ids from jsonb_array_elements_text(item->'evidenceAgainst');
    select coalesce(array_agg('['||id||'] '||summary order by id),'{}'::text[]) into references_text from public.observations where id=any(for_ids);
    select coalesce(array_agg('['||id||'] '||summary order by id),'{}'::text[]) into against_text from public.observations where id=any(against_ids);
    insert into public.hypotheses(organisation_id,mission_id,title,description,evidence_for,evidence_against,confidence)
      values(job.organisation_id,target_mission,item->>'title',item->>'description',references_text,against_text,(item->>'confidence')::numeric);
  end loop;
  for item in select value from jsonb_array_elements(synthesis->'findings') loop
    select array_agg(distinct value::uuid) into ids from jsonb_array_elements_text(item->'evidenceIds');
    select coalesce(array_agg('['||id||'] '||summary order by id),'{}'::text[]) into references_text from public.observations where id=any(ids);
    insert into public.findings(organisation_id,mission_id,title,summary,evidence_summary,confidence,impact,recommended_action)
      values(job.organisation_id,target_mission,item->>'title',item->>'summary',array_to_string(references_text,E'\n'),(item->>'confidence')::numeric,item->>'impact',item->>'recommendedAction');
  end loop;
  update public.mission_analysis_jobs set status='ready',claim_token=null,locked_until=null,evidence_ids=null,
    completed_at=now(),updated_at=now(),error_code=null where mission_id=target_mission;
  insert into public.audit_events(organisation_id,action,entity_type,entity_id,metadata)
    values(job.organisation_id,'mission.analysis_completed','mission',target_mission,jsonb_build_object('revision',job.claimed_revision));
  return true;
end $$;
revoke all on function public.finish_mission_analysis(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.finish_mission_analysis(uuid,uuid,jsonb) to service_role;

create or replace function public.fail_mission_analysis(target_mission uuid,token uuid,failure_code text)
returns void language plpgsql security definer set search_path=public as $$
begin
  if failure_code not in ('AI_DAILY_LIMIT','AI_UNAVAILABLE','ANALYSIS_FAILED') then failure_code:='ANALYSIS_FAILED'; end if;
  update public.mission_analysis_jobs set
    status=case when revision<>claimed_revision then 'pending' when failure_code='AI_DAILY_LIMIT' then 'retry' when attempts>=3 then 'failed' else 'retry' end,
    available_at=case when failure_code='AI_DAILY_LIMIT' then (date_trunc('day',now() at time zone 'UTC')+interval '1 day') at time zone 'UTC' else now()+interval '5 minutes' end,
    claim_token=null,locked_until=null,evidence_ids=null,updated_at=now(),error_code=failure_code
  where mission_id=target_mission and status='running' and claim_token=token;
end $$;
revoke all on function public.fail_mission_analysis(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.fail_mission_analysis(uuid,uuid,text) to service_role;

insert into public.mission_analysis_jobs(mission_id,organisation_id)
select distinct m.id,m.organisation_id from public.missions m join public.observations o on o.mission_id=m.id and o.organisation_id=m.organisation_id
where o.participant_approved and o.confidentiality in ('SHARE','CONTRIBUTE') on conflict do nothing;
commit;
