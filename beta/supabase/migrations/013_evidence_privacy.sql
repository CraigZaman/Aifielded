begin;

drop policy if exists observations_manager_select on public.observations;
create policy observations_manager_select on public.observations for select using (
  organisation_id is not null and public.can_manage_workspace(organisation_id)
  and participant_approved and confidentiality='SHARE'
);

-- Owner-executed view deliberately exposes a restricted projection, never raw identities for CONTRIBUTE.
create or replace view public.management_observations with (security_barrier=true) as
select id,organisation_id,mission_id,category,summary,detail,confidence,confidentiality,participant_approved,
  case when confidentiality='SHARE' then user_id else null end as user_id,
  case when confidentiality='SHARE' then created_at else date_trunc('day',created_at at time zone 'UTC') at time zone 'UTC' end as created_at
from public.observations
where auth.uid() is not null and public.can_manage_workspace(organisation_id)
  and participant_approved and confidentiality in ('CONTRIBUTE','SHARE');
revoke all on public.management_observations from public,anon,authenticated;
grant select on public.management_observations to authenticated;

create or replace function public.count_evidence_contributors(evidence_ids uuid[])
returns integer language plpgsql stable security definer set search_path=public as $$
declare contributor_count integer;
begin
  if auth.uid() is null or cardinality(evidence_ids) not between 1 and 200 then raise exception 'Invalid evidence request'; end if;
  if exists(select 1 from unnest(evidence_ids) requested where not exists (
    select 1 from public.observations o where o.id=requested and o.participant_approved
      and o.confidentiality in ('CONTRIBUTE','SHARE') and public.can_manage_workspace(o.organisation_id)
  )) then raise exception 'Evidence unavailable'; end if;
  select count(distinct user_id) into contributor_count from public.observations where id=any(evidence_ids);
  return contributor_count;
end $$;
revoke all on function public.count_evidence_contributors(uuid[]) from public,anon,authenticated;
grant execute on function public.count_evidence_contributors(uuid[]) to authenticated;

drop policy if exists sources_manager on public.source_records;
create policy sources_manager on public.source_records for all
using (public.can_manage_workspace(organisation_id) and confidentiality='SHARE')
with check (public.can_manage_workspace(organisation_id) and confidentiality='SHARE');
drop policy if exists sources_participant_own on public.source_records;
create policy sources_participant_own on public.source_records for all
using (user_id=auth.uid() and public.is_workspace_member(organisation_id))
with check (user_id=auth.uid() and public.is_workspace_member(organisation_id));

update storage.buckets set allowed_mime_types=array[
  'application/pdf','text/plain','text/csv','image/jpeg','image/png','image/webp','image/gif',
  'audio/webm','audio/mpeg','audio/mp4','audio/wav','audio/x-wav','audio/ogg','audio/flac','audio/aac'
] where id='evidence';
commit;
