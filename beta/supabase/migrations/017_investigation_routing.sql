begin;

create table public.investigation_proposals (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  root_mission_id uuid not null references public.missions(id) on delete cascade,
  source_mission_id uuid not null references public.missions(id) on delete cascade,
  title text not null check (char_length(title) between 4 and 120),
  rationale text not null check (char_length(rationale) between 1 and 1500),
  question text not null check (char_length(question) between 20 and 2000),
  departments text[] not null default '{}',
  evidence_ids uuid[] not null check (cardinality(evidence_ids) between 1 and 12),
  origin text not null check (origin in ('ai','manager')),
  status text not null default 'pending' check (status in ('pending','approved','rejected','superseded')),
  created_by uuid references public.profiles(id),
  decided_by uuid references public.profiles(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create index investigation_proposals_inbox on public.investigation_proposals(organisation_id,status,created_at);
create table public.investigation_links (
  child_mission_id uuid primary key references public.missions(id) on delete cascade,
  root_mission_id uuid not null references public.missions(id) on delete cascade,
  source_mission_id uuid not null references public.missions(id) on delete cascade,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  proposal_id uuid not null unique references public.investigation_proposals(id) on delete cascade,
  created_at timestamptz not null default now(),
  check(child_mission_id <> root_mission_id and child_mission_id <> source_mission_id)
);
create index investigation_links_root on public.investigation_links(root_mission_id);
alter table public.investigation_proposals enable row level security;
alter table public.investigation_links enable row level security;
revoke all on public.investigation_proposals,public.investigation_links from public,anon,authenticated;
grant select on public.investigation_proposals,public.investigation_links to authenticated;
grant all on public.investigation_proposals,public.investigation_links to service_role;
create policy investigation_proposals_read on public.investigation_proposals for select to authenticated
  using(public.can_manage_workspace(organisation_id));
create policy investigation_links_read on public.investigation_links for select to authenticated
  using(public.can_manage_workspace(organisation_id));

-- Shared investigation evidence is scoped to one root and its approved follow-up missions.
create function public.investigation_evidence_valid(root_id uuid,workspace_id uuid,ids uuid[])
returns boolean language sql stable security definer set search_path=public as $$
  select coalesce(cardinality(ids),0) between 1 and 12 and not exists(
    select 1 from unnest(ids) ref where not exists(
      select 1 from public.observations o where o.id=ref and o.organisation_id=workspace_id
      and o.participant_approved and o.confidentiality in ('SHARE','CONTRIBUTE')
      and (o.mission_id=root_id or exists(select 1 from public.investigation_links l
        where l.root_mission_id=root_id and l.child_mission_id=o.mission_id and l.organisation_id=workspace_id))
    )
  );
$$;
revoke all on function public.investigation_evidence_valid(uuid,uuid,uuid[]) from public,anon,authenticated;

create function public.propose_investigation(target_mission uuid,proposal_title text,reason text,discussion_question text,target_departments text[],sources uuid[])
returns uuid language plpgsql security definer set search_path=public as $$
declare workspace uuid; root_id uuid; result uuid;
begin
  select organisation_id into workspace from public.missions where id=target_mission and status='active';
  if auth.uid() is null or workspace is null or not public.can_manage_workspace(workspace) then raise exception 'Not authorised'; end if;
  select coalesce((select root_mission_id from public.investigation_links where child_mission_id=target_mission),target_mission) into root_id;
  if not public.investigation_evidence_valid(root_id,workspace,sources) or coalesce(cardinality(target_departments),0)>20 then raise exception 'Approved evidence is required'; end if;
  perform 1 from public.missions where id=root_id for update;
  select id into result from public.investigation_proposals where root_mission_id=root_id and question=discussion_question and status='pending' limit 1;
  if result is not null then return result; end if;
  insert into public.investigation_proposals(organisation_id,root_mission_id,source_mission_id,title,rationale,question,departments,evidence_ids,origin,created_by)
    values(workspace,root_id,target_mission,proposal_title,reason,discussion_question,coalesce(target_departments,'{}'),sources,'manager',auth.uid()) returning id into result;
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id) values(workspace,auth.uid(),'investigation.proposed','investigation',result);
  return result;
end $$;
revoke all on function public.propose_investigation(uuid,text,text,text,text[],uuid[]) from public,anon,authenticated;
grant execute on function public.propose_investigation(uuid,text,text,text,text[],uuid[]) to authenticated;

create function public.decide_investigation(proposal uuid,approve boolean,discussion_question text,recipient_mode text,department_names text[],individual_ids uuid[])
returns uuid language plpgsql security definer set search_path=public as $$
declare p public.investigation_proposals%rowtype; root public.missions%rowtype; child uuid; recipients uuid[]; person uuid;
begin
  -- Root-first lock ordering matches evidence invalidation and serialises decisions across proposals.
  select m.* into root from public.missions m join public.investigation_proposals i on i.root_mission_id=m.id where i.id=proposal for update of m;
  select * into p from public.investigation_proposals where id=proposal for update;
  if auth.uid() is null or p.id is null or not public.is_workspace_owner(p.organisation_id) then raise exception 'Only an active workspace owner can decide'; end if;
  if p.status='approved' then return (select child_mission_id from public.investigation_links where proposal_id=p.id); end if;
  if p.status<>'pending' then raise exception 'This proposal is no longer awaiting approval'; end if;
  if approve is null then raise exception 'Choose a decision'; end if;
  if not approve then
    update public.investigation_proposals set status='rejected',decided_by=auth.uid(),decided_at=now() where id=p.id;
    insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id) values(p.organisation_id,auth.uid(),'investigation.rejected','investigation',p.id);
    return null;
  end if;
  if root.status<>'active' or not public.investigation_evidence_valid(p.root_mission_id,p.organisation_id,p.evidence_ids) then raise exception 'The investigation or supporting evidence has changed'; end if;
  if char_length(trim(coalesce(discussion_question,''))) not between 20 and 2000 then raise exception 'Review the discussion question'; end if;
  if recipient_mode='departments' and cardinality(department_names) between 1 and 20 then
    select array_agg(distinct m.user_id) into recipients from public.organisation_memberships m join public.profiles pr on pr.id=m.user_id
      where m.organisation_id=p.organisation_id and m.status='active' and pr.department=any(department_names);
  elsif recipient_mode='individuals' and cardinality(individual_ids) between 1 and 200 then
    select array_agg(distinct i) into recipients from unnest(individual_ids) i;
    if exists(select 1 from unnest(recipients) i where not exists(select 1 from public.organisation_memberships m where m.user_id=i and m.organisation_id=p.organisation_id and m.status='active')) then raise exception 'Choose active workspace members'; end if;
  else raise exception 'Choose departments or individuals'; end if;
  if coalesce(cardinality(recipients),0) not between 1 and 200 then raise exception 'Choose between 1 and 200 active recipients'; end if;
  if (select count(*) from public.investigation_links where root_mission_id=root.id)>=20 then raise exception 'This investigation has reached its 20 follow-up limit'; end if;
  insert into public.missions(organisation_id,created_by,title,objective,context,desired_outcome,departments,status)
    values(p.organisation_id,auth.uid(),p.title,trim(discussion_question),
      'A follow-up discussion for: '||root.title||'. Explain your own steps and dependencies without naming colleagues. Do not assume another department is at fault.',
      'Test the proposed explanation against first-hand process evidence; identify dependencies, timing and remaining uncertainty.',
      case when recipient_mode='departments' then department_names else '{}'::text[] end,'active') returning id into child;
  insert into public.investigation_links(child_mission_id,root_mission_id,source_mission_id,organisation_id,proposal_id)
    values(child,root.id,p.source_mission_id,p.organisation_id,p.id);
  foreach person in array recipients loop perform public.assign_mission_participant(child,person); end loop;
  update public.investigation_proposals set status='approved',question=trim(discussion_question),
    departments=coalesce((select array_agg(distinct pr.department) from public.profiles pr where pr.id=any(recipients) and nullif(pr.department,'') is not null),'{}'),
    decided_by=auth.uid(),decided_at=now() where id=p.id;
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata)
    values(p.organisation_id,auth.uid(),'investigation.approved','investigation',p.id,jsonb_build_object('mission_id',child,'assigned_count',cardinality(recipients)));
  return child;
end $$;
revoke all on function public.decide_investigation(uuid,boolean,text,text,text[],uuid[]) from public,anon,authenticated;
grant execute on function public.decide_investigation(uuid,boolean,text,text,text[],uuid[]) to authenticated;

-- Preserve the tested lease / revision and atomic synthesis implementation beneath the extension.
alter function public.claim_mission_analysis(uuid) rename to claim_mission_analysis_v15;
alter function public.finish_mission_analysis(uuid,uuid,jsonb) rename to finish_mission_analysis_v15;
revoke all on function public.claim_mission_analysis_v15(uuid),public.finish_mission_analysis_v15(uuid,uuid,jsonb) from public,anon,authenticated,service_role;
create function public.claim_mission_analysis(target_mission uuid default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare result jsonb; target uuid; workspace uuid; evidence jsonb; ids uuid[]; directory jsonb; branches jsonb;
begin
  result:=public.claim_mission_analysis_v15(target_mission);
  if result is null then return null; end if;
  target:=(result->>'mission_id')::uuid;
  select organisation_id into workspace from public.missions where id=target;
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'category',category,'summary',summary,'detail',detail,'confidence',confidence,'confidentiality',confidentiality)),'[]'),coalesce(array_agg(id),'{}') into evidence,ids
  from (select o.* from public.observations o where o.organisation_id=workspace and o.participant_approved and o.confidentiality in ('SHARE','CONTRIBUTE')
    and (o.mission_id=target or exists(select 1 from public.investigation_links l where l.root_mission_id=target and l.child_mission_id=o.mission_id))
    order by o.created_at desc,o.id limit 200) approved;
  update public.mission_analysis_jobs set evidence_ids=ids where mission_id=target;
  select coalesce(jsonb_agg(d.department),'[]') into directory from (select distinct p.department from public.profiles p join public.organisation_memberships m on m.user_id=p.id
    where m.organisation_id=workspace and m.status='active' and nullif(p.department,'') is not null order by p.department) d;
  select coalesce(jsonb_agg(jsonb_build_object('question',p.question,'departments',p.departments,'status',p.status,
    'awaitingResponses',exists(select 1 from public.investigation_links l join public.mission_assignments a on a.mission_id=l.child_mission_id where l.proposal_id=p.id and a.status in ('invited','in_progress')))),'[]')
    into branches from (select * from public.investigation_proposals where root_mission_id=target and status in ('pending','approved','rejected') order by created_at desc limit 40) p;
  return result||jsonb_build_object('evidence',evidence,'departments',directory,'investigations',branches,
    'is_follow_up',exists(select 1 from public.investigation_links where child_mission_id=target),
    'is_policy',exists(select 1 from public.policy_communications where mission_id=target));
end $$;
revoke all on function public.claim_mission_analysis(uuid) from public,anon,authenticated;
grant execute on function public.claim_mission_analysis(uuid) to service_role;

create function public.finish_mission_analysis(target_mission uuid,token uuid,synthesis jsonb)
returns boolean language plpgsql security definer set search_path=public as $$
declare workspace uuid; item jsonb; sources uuid[]; depts text[]; proposal_id uuid; saved boolean; snapshot_ids uuid[];
begin
  select evidence_ids into snapshot_ids from public.mission_analysis_jobs where mission_id=target_mission for update;
  saved:=public.finish_mission_analysis_v15(target_mission,token,synthesis);
  if not saved then return false; end if;
  select organisation_id into workspace from public.missions where id=target_mission;
  if jsonb_typeof(coalesce(synthesis->'investigations','[]'))<>'array' or jsonb_array_length(coalesce(synthesis->'investigations','[]'))>3 then raise exception 'Invalid investigations'; end if;
  for item in select value from jsonb_array_elements(coalesce(synthesis->'investigations','[]')) loop
    if exists(select 1 from public.investigation_links where child_mission_id=target_mission) or exists(select 1 from public.policy_communications where mission_id=target_mission) then raise exception 'Only root investigations propose automatic follow-ups'; end if;
    select array_agg(distinct value::uuid) into sources from jsonb_array_elements_text(item->'evidenceIds');
    select array_agg(distinct value) into depts from jsonb_array_elements_text(item->'departments');
    if not public.investigation_evidence_valid(target_mission,workspace,sources) or not sources <@ snapshot_ids or coalesce(cardinality(depts),0) not between 1 and 20 then raise exception 'Invalid investigation evidence or departments'; end if;
    if exists(select 1 from unnest(depts) d where not exists(select 1 from public.profiles p join public.organisation_memberships m on m.user_id=p.id where m.organisation_id=workspace and m.status='active' and p.department=d)) then raise exception 'Unknown department'; end if;
    -- Do not send duplicate proposals while that department's earlier discussion is still outstanding.
    if exists(select 1 from public.investigation_proposals p where p.root_mission_id=target_mission and
      (p.question=item->>'question' and p.status in ('pending','approved','rejected') or p.departments && depts and
        (p.status='pending' or p.status='approved' and exists(select 1 from public.investigation_links l join public.mission_assignments a on a.mission_id=l.child_mission_id where l.proposal_id=p.id and a.status in ('invited','in_progress'))))) then continue; end if;
    insert into public.investigation_proposals(organisation_id,root_mission_id,source_mission_id,title,rationale,question,departments,evidence_ids,origin)
      values(workspace,target_mission,target_mission,item->>'title',item->>'rationale',item->>'question',depts,sources,'ai') returning id into proposal_id;
    insert into public.audit_events(organisation_id,action,entity_type,entity_id) values(workspace,'investigation.proposed','investigation',proposal_id);
  end loop;
  return true;
end $$;
revoke all on function public.finish_mission_analysis(uuid,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.finish_mission_analysis(uuid,uuid,jsonb) to service_role;

create function public.queue_investigation_evidence()
returns trigger language plpgsql security definer set search_path=public as $$
declare root_id uuid; workspace uuid; old_shared boolean:=false; new_shared boolean:=false;
begin
  if tg_op<>'INSERT' then old_shared:=old.participant_approved and old.confidentiality in ('SHARE','CONTRIBUTE'); end if;
  if tg_op<>'DELETE' then new_shared:=new.participant_approved and new.confidentiality in ('SHARE','CONTRIBUTE'); end if;
  if not old_shared and not new_shared then return null; end if;
  if tg_op='UPDATE' and new is not distinct from old then return null; end if;
  if old_shared then
    update public.investigation_proposals set status=case when status='pending' then 'superseded' else status end,
      title='Investigation evidence changed',
      question=case when status='approved' then question else 'Supporting evidence changed. Review current approved evidence before preparing another discussion.' end,
      rationale='Supporting evidence has changed or been withdrawn. Review the current approved evidence before drawing conclusions.'
      where old.id=any(evidence_ids);
  end if;
  for root_id,workspace in select distinct l.root_mission_id,l.organisation_id from public.investigation_links l
    where l.child_mission_id in (case when old_shared then old.mission_id end,case when new_shared then new.mission_id end)
  loop
    if old_shared then
      delete from public.themes where mission_id=root_id;
      delete from public.hypotheses where mission_id=root_id;
      delete from public.findings where mission_id=root_id;
    end if;
    insert into public.mission_analysis_jobs(mission_id,organisation_id) values(root_id,workspace)
    on conflict(mission_id) do update set revision=mission_analysis_jobs.revision+1,
      status=case when mission_analysis_jobs.status='running' and mission_analysis_jobs.locked_until>now() then 'running' else 'pending' end,
      attempts=0,available_at=now(),updated_at=now(),error_code=null;
  end loop;
  return null;
end $$;
create trigger queue_investigation_evidence after insert or update or delete on public.observations for each row execute function public.queue_investigation_evidence();
revoke all on function public.queue_investigation_evidence() from public,anon,authenticated;
commit;
