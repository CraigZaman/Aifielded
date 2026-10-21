begin;

create table public.workspace_departments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  key text not null check(char_length(key) between 1 and 80),
  name text not null check(char_length(trim(name)) between 2 and 100),
  head_user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(organisation_id,key),unique(organisation_id,id)
);
create unique index workspace_departments_name on public.workspace_departments(organisation_id,lower(trim(name)));
create table public.workspace_people (
  organisation_id uuid not null,
  user_id uuid not null,
  department_id uuid,
  reports_to uuid references public.profiles(id) on delete set null,
  confirmed_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key(organisation_id,user_id),
  foreign key(organisation_id,user_id) references public.organisation_memberships(organisation_id,user_id) on delete cascade,
  foreign key(organisation_id,department_id) references public.workspace_departments(organisation_id,id),
  check(reports_to is distinct from user_id)
);
alter table public.workspace_departments enable row level security;
alter table public.workspace_people enable row level security;
revoke all on public.workspace_departments,public.workspace_people from public,anon,authenticated;
grant select on public.workspace_departments,public.workspace_people to authenticated;
grant all on public.workspace_departments,public.workspace_people to service_role;
create policy workspace_departments_read on public.workspace_departments for select to authenticated using(public.can_manage_people(organisation_id));
create policy workspace_people_read on public.workspace_people for select to authenticated using(public.can_manage_people(organisation_id) or user_id=auth.uid() and public.is_workspace_member(organisation_id));

-- Preserve existing department information as unconfirmed profile imports. A job title never appoints a head.
insert into public.workspace_departments(organisation_id,key,name)
select distinct m.organisation_id,p.department,case p.department
  when 'executive' then 'Executive leadership' when 'people' then 'People and HR'
  when 'legal_compliance' then 'Legal and compliance' when 'customer' then 'Customer success or service'
  else initcap(replace(p.department,'_',' ')) end
from public.organisation_memberships m join public.profiles p on p.id=m.user_id where nullif(p.department,'') is not null;
insert into public.workspace_people(organisation_id,user_id,department_id)
select m.organisation_id,m.user_id,d.id from public.organisation_memberships m join public.profiles p on p.id=m.user_id
left join public.workspace_departments d on d.organisation_id=m.organisation_id and d.key=p.department;

create function public.save_workspace_department(workspace uuid,target_department uuid,department_name text,head_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare result uuid; department_key text;
begin
  if auth.uid() is null or not public.is_workspace_owner(workspace) then raise exception 'Only the workspace owner can organise departments'; end if;
  perform 1 from public.organisations where id=workspace for update;
  if char_length(trim(coalesce(department_name,''))) not between 2 and 100 then raise exception 'Department name must be 2 to 100 characters'; end if;
  if head_id is not null and not exists(select 1 from public.organisation_memberships where organisation_id=workspace and user_id=head_id and status='active' and role<>'consultant') then raise exception 'Choose an active employee as department head'; end if;
  if target_department is null then
    department_key:=left(trim(both '_' from regexp_replace(lower(trim(department_name)),'[^a-z0-9]+','_','g')),60);
    if department_key='' then department_key:='department'; end if;
    if exists(select 1 from public.workspace_departments where organisation_id=workspace and key=department_key) then department_key:=department_key||'_'||left(gen_random_uuid()::text,8); end if;
    insert into public.workspace_departments(organisation_id,key,name) values(workspace,department_key,trim(department_name)) returning id into result;
  else
    update public.workspace_departments set name=trim(department_name) where id=target_department and organisation_id=workspace returning id into result;
    if result is null then raise exception 'Department not found'; end if;
  end if;
  if head_id is not null then
    -- One primary department per person; moving a head leaves the previous department unappointed.
    update public.workspace_departments set head_user_id=null where organisation_id=workspace and head_user_id=head_id and id<>result;
    insert into public.workspace_people(organisation_id,user_id,department_id,confirmed_by) values(workspace,head_id,result,auth.uid())
      on conflict(organisation_id,user_id) do update set department_id=result,confirmed_by=auth.uid(),updated_at=now();
  end if;
  update public.workspace_departments set head_user_id=head_id where id=result;
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata)
    values(workspace,auth.uid(),'organisation.department_updated','department',result,jsonb_build_object('head_user_id',head_id));
  return result;
end $$;
revoke all on function public.save_workspace_department(uuid,uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.save_workspace_department(uuid,uuid,text,uuid) to authenticated;

create function public.place_workspace_member(workspace uuid,member_id uuid,department uuid,manager_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null or not public.is_workspace_owner(workspace) then raise exception 'Only the workspace owner can organise people'; end if;
  perform 1 from public.organisations where id=workspace for update;
  if not exists(select 1 from public.organisation_memberships where organisation_id=workspace and user_id=member_id and status='active') then raise exception 'Choose an active workspace member'; end if;
  if department is not null and not exists(select 1 from public.workspace_departments where id=department and organisation_id=workspace) then raise exception 'Choose a department in this workspace'; end if;
  if manager_id is not null and (manager_id=member_id or not exists(select 1 from public.organisation_memberships where organisation_id=workspace and user_id=manager_id and status='active' and role<>'consultant')) then raise exception 'Choose an active reporting manager'; end if;
  if exists(with recursive chain as (
    select user_id,reports_to from public.workspace_people where organisation_id=workspace and user_id=manager_id
    union select p.user_id,p.reports_to from public.workspace_people p join chain c on p.user_id=c.reports_to where p.organisation_id=workspace
  ) select 1 from chain where user_id=member_id or reports_to=member_id) then raise exception 'Reporting lines cannot form a cycle'; end if;
  update public.workspace_departments set head_user_id=null where organisation_id=workspace and head_user_id=member_id and id is distinct from department;
  insert into public.workspace_people(organisation_id,user_id,department_id,reports_to,confirmed_by)
    values(workspace,member_id,department,manager_id,auth.uid()) on conflict(organisation_id,user_id) do update
    set department_id=department,reports_to=manager_id,confirmed_by=auth.uid(),updated_at=now();
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata)
    values(workspace,auth.uid(),'organisation.member_placed','profile',member_id,jsonb_build_object('department_id',department,'reports_to',manager_id));
end $$;
revoke all on function public.place_workspace_member(uuid,uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.place_workspace_member(uuid,uuid,uuid,uuid) to authenticated;

create function public.resolve_workspace_audience(workspace uuid,audience_mode text,department_keys text[],individual_ids uuid[])
returns uuid[] language plpgsql security definer set search_path=public as $$
declare recipients uuid[];
begin
  if auth.uid() is null or not public.can_manage_workspace(workspace) then raise exception 'Not authorised'; end if;
  if cardinality(department_keys)>50 or cardinality(individual_ids)>200 then raise exception 'Audience exceeds the supported limit'; end if;
  if audience_mode='individuals' then
    select coalesce(array_agg(distinct i),'{}') into recipients from unnest(individual_ids) i;
    if exists(select 1 from unnest(recipients) i where not exists(select 1 from public.organisation_memberships m where m.organisation_id=workspace and m.user_id=i and m.status='active')) then raise exception 'Choose active workspace members'; end if;
  elsif audience_mode='organisation' then
    select array_agg(user_id) into recipients from public.organisation_memberships where organisation_id=workspace and status='active' and role<>'consultant';
  elsif audience_mode in ('departments','department_heads') then
    if audience_mode='departments' and coalesce(cardinality(department_keys),0)=0 then raise exception 'Choose at least one department'; end if;
    if exists(select 1 from unnest(department_keys) k where not exists(select 1 from public.workspace_departments d where d.organisation_id=workspace and d.key=k)) then raise exception 'Unknown workspace department'; end if;
    select array_agg(distinct m.user_id) into recipients from public.organisation_memberships m
      join public.workspace_people p on p.organisation_id=m.organisation_id and p.user_id=m.user_id
      join public.workspace_departments d on d.organisation_id=p.organisation_id and d.id=p.department_id
      where m.organisation_id=workspace and m.status='active' and m.role<>'consultant'
      and (coalesce(cardinality(department_keys),0)=0 or d.key=any(department_keys))
      and (audience_mode='departments' or d.head_user_id=m.user_id);
  else raise exception 'Choose an audience'; end if;
  if coalesce(cardinality(recipients),0)>200 then raise exception 'This audience has more than 200 members. Choose smaller department groups'; end if;
  return coalesce(recipients,'{}');
end $$;
revoke all on function public.resolve_workspace_audience(uuid,text,text[],uuid[]) from public,anon,authenticated;
grant execute on function public.resolve_workspace_audience(uuid,text,text[],uuid[]) to authenticated;

create function public.launch_mission_targeted(requested_mission_id uuid,workspace_id uuid,mission_title text,mission_objective text,mission_context text,mission_outcome text,mission_departments text[],invitation_digest text,audience_mode text,department_keys text[],individual_ids uuid[])
returns jsonb language plpgsql security definer set search_path=public as $$
declare recipients uuid[];
begin
  recipients:=public.resolve_workspace_audience(workspace_id,audience_mode,department_keys,individual_ids);
  if audience_mode<>'individuals' and cardinality(recipients)=0 then raise exception 'No active recipients in this audience'; end if;
  return public.launch_mission(requested_mission_id,workspace_id,mission_title,mission_objective,mission_context,mission_outcome,mission_departments,recipients,invitation_digest);
end $$;
revoke all on function public.launch_mission_targeted(uuid,uuid,text,text,text,text,text[],text,text,text[],uuid[]) from public,anon,authenticated;
grant execute on function public.launch_mission_targeted(uuid,uuid,text,text,text,text,text[],text,text,text[],uuid[]) to authenticated;

create function public.launch_policy_targeted(request_id uuid,workspace_id uuid,policy_title text,policy_version text,source_text text,policy_briefing text,source_filename text,quiz jsonb,audience_mode text,department_keys text[],individual_ids uuid[])
returns uuid language plpgsql security definer set search_path=public as $$
begin
  return public.launch_policy_communication(request_id,workspace_id,policy_title,policy_version,source_text,policy_briefing,source_filename,quiz,
    public.resolve_workspace_audience(workspace_id,audience_mode,department_keys,individual_ids));
end $$;
revoke all on function public.launch_policy_targeted(uuid,uuid,text,text,text,text,text,jsonb,text,text[],uuid[]) from public,anon,authenticated;
grant execute on function public.launch_policy_targeted(uuid,uuid,text,text,text,text,text,jsonb,text,text[],uuid[]) to authenticated;

create function public.assign_mission_audience(target_mission uuid,audience_mode text,department_keys text[],individual_ids uuid[])
returns integer language plpgsql security definer set search_path=public as $$
declare workspace uuid; recipients uuid[]; person uuid; added integer:=0;
begin
  select organisation_id into workspace from public.missions where id=target_mission and status='active' for update;
  if workspace is null then raise exception 'Mission is not active'; end if;
  recipients:=public.resolve_workspace_audience(workspace,audience_mode,department_keys,individual_ids);
  if cardinality(recipients)=0 then raise exception 'Choose at least one active recipient'; end if;
  foreach person in array recipients loop
    if not exists(select 1 from public.mission_assignments where mission_id=target_mission and user_id=person) then added:=added+1; end if;
    perform public.assign_mission_participant(target_mission,person);
  end loop;
  return added;
end $$;
revoke all on function public.assign_mission_audience(uuid,text,text[],uuid[]) from public,anon,authenticated;
grant execute on function public.assign_mission_audience(uuid,text,text[],uuid[]) to authenticated;

alter function public.claim_mission_analysis(uuid) rename to claim_mission_analysis_v17;
revoke all on function public.claim_mission_analysis_v17(uuid) from public,anon,authenticated,service_role;
create function public.claim_mission_analysis(target_mission uuid default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare result jsonb; workspace uuid; directory jsonb; labels jsonb;
begin
  result:=public.claim_mission_analysis_v17(target_mission);
  if result is null then return null; end if;
  select organisation_id into workspace from public.missions where id=(result->>'mission_id')::uuid;
  select coalesce(jsonb_agg(d.key),'[]'),coalesce(jsonb_agg(jsonb_build_object('key',d.key,'name',d.name)),'[]') into directory,labels
    from public.workspace_departments d where d.organisation_id=workspace and exists(
      select 1 from public.workspace_people p join public.organisation_memberships m on m.organisation_id=p.organisation_id and m.user_id=p.user_id
      where p.department_id=d.id and p.organisation_id=workspace and m.status='active' and m.role<>'consultant');
  return result||jsonb_build_object('departments',directory,'department_labels',labels);
end $$;
revoke all on function public.claim_mission_analysis(uuid) from public,anon,authenticated;
grant execute on function public.claim_mission_analysis(uuid) to service_role;

create or replace function public.finish_mission_analysis(target_mission uuid,token uuid,synthesis jsonb)
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
    if exists(select 1 from unnest(depts) k where not exists(select 1 from public.workspace_departments d
      join public.workspace_people p on p.department_id=d.id and p.organisation_id=d.organisation_id
      join public.organisation_memberships m on m.organisation_id=p.organisation_id and m.user_id=p.user_id
      where d.organisation_id=workspace and d.key=k and m.status='active' and m.role<>'consultant')) then raise exception 'Unknown or empty department'; end if;
    if exists(select 1 from public.investigation_proposals p where p.root_mission_id=target_mission and
      (p.question=item->>'question' and p.status in ('pending','approved','rejected') or p.departments && depts and
        (p.status='pending' or p.status='approved' and exists(select 1 from public.investigation_links l join public.mission_assignments a on a.mission_id=l.child_mission_id where l.proposal_id=p.id and a.status in ('invited','in_progress'))))) then continue; end if;
    insert into public.investigation_proposals(organisation_id,root_mission_id,source_mission_id,title,rationale,question,departments,evidence_ids,origin)
      values(workspace,target_mission,target_mission,item->>'title',item->>'rationale',item->>'question',depts,sources,'ai') returning id into proposal_id;
    insert into public.audit_events(organisation_id,action,entity_type,entity_id) values(workspace,'investigation.proposed','investigation',proposal_id);
  end loop;
  return true;
end $$;

alter function public.decide_investigation(uuid,boolean,text,text,text[],uuid[]) rename to decide_investigation_v17;
revoke all on function public.decide_investigation_v17(uuid,boolean,text,text,text[],uuid[]) from public,anon,authenticated,service_role;
create function public.decide_investigation(proposal uuid,approve boolean,discussion_question text,recipient_mode text,department_names text[],individual_ids uuid[])
returns uuid language plpgsql security definer set search_path=public as $$
declare p public.investigation_proposals%rowtype; recipients uuid[]; result uuid;
begin
  perform 1 from public.missions m join public.investigation_proposals i on i.root_mission_id=m.id where i.id=proposal for update of m;
  select * into p from public.investigation_proposals where id=proposal for update;
  if auth.uid() is null or p.id is null or not public.is_workspace_owner(p.organisation_id) then raise exception 'Only an active workspace owner can decide'; end if;
  if p.status='pending' and approve then recipients:=public.resolve_workspace_audience(p.organisation_id,recipient_mode,department_names,individual_ids); end if;
  result:=public.decide_investigation_v17(proposal,approve,discussion_question,'individuals','{}',coalesce(recipients,'{}'));
  if result is not null and p.status='pending' then
    update public.investigation_proposals set departments=coalesce((select array_agg(distinct d.key) from public.workspace_people w join public.workspace_departments d on d.id=w.department_id and d.organisation_id=w.organisation_id where w.organisation_id=p.organisation_id and w.user_id=any(recipients)),'{}') where id=proposal;
    update public.missions set departments=(select departments from public.investigation_proposals where id=proposal) where id=result;
  end if;
  return result;
end $$;
revoke all on function public.decide_investigation(uuid,boolean,text,text,text[],uuid[]) from public,anon,authenticated;
grant execute on function public.decide_investigation(uuid,boolean,text,text,text[],uuid[]) to authenticated;

-- An approved investigation cannot be widened through the older mission or invitation paths.
create function public.guard_investigation_scope()
returns trigger language plpgsql security definer set search_path=public as $$
declare target uuid; workspace uuid;
begin
  if tg_table_name='missions' then target:=new.id; else target:=new.mission_id; end if;
  select organisation_id into workspace from public.investigation_links where child_mission_id=target;
  if workspace is null then return new; end if;
  if tg_table_name='invitations' then raise exception 'Follow-up investigations use approved named recipients, not shareable invitation links'; end if;
  if auth.uid() is null or not public.is_workspace_owner(workspace) then raise exception 'The workspace owner must approve investigation scope changes'; end if;
  if tg_table_name='missions' and new.organisation_id is distinct from workspace then raise exception 'Investigation workspace cannot change'; end if;
  return new;
end $$;
create trigger guard_investigation_scope before update on public.missions for each row execute function public.guard_investigation_scope();
create trigger guard_investigation_scope before insert on public.mission_assignments for each row execute function public.guard_investigation_scope();
create trigger guard_investigation_scope before insert on public.invitations for each row execute function public.guard_investigation_scope();
revoke all on function public.guard_investigation_scope() from public,anon,authenticated;

commit;
