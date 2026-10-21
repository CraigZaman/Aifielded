begin;

-- Follow-up discussions inherit the original mission's visibility boundary.
create function public.can_read_mission_intelligence(target_mission uuid)
returns boolean language plpgsql stable security definer set search_path=public as $$
declare workspace uuid; root uuid; access public.mission_visibility;
begin
  select organisation_id into workspace from public.missions where id=target_mission;
  if auth.uid() is null or not public.is_workspace_member(workspace) then return false; end if;
  if public.is_workspace_owner(workspace) then return true; end if;
  select root_mission_id into root from public.investigation_links where child_mission_id=target_mission;
  select * into access from public.mission_visibility where mission_id=coalesce(root,target_mission);
  if not found or access.scope='management' then return public.can_manage_workspace(workspace); end if;
  if access.scope='owners' then return false; end if;
  return exists(select 1 from public.workspace_people p join public.workspace_departments d on d.id=p.department_id and d.organisation_id=p.organisation_id
    where p.organisation_id=workspace and p.user_id=auth.uid() and p.department_id=access.department_id
    and (public.can_manage_workspace(workspace) or d.head_user_id=auth.uid()));
end $$;
revoke all on function public.can_read_mission_intelligence(uuid) from public,anon,authenticated;
grant execute on function public.can_read_mission_intelligence(uuid) to authenticated;

create function public.set_mission_visibility(target_mission uuid,result_scope text,target_department uuid)
returns void language plpgsql security definer set search_path=public as $$
declare workspace uuid;
begin
  select organisation_id into workspace from public.missions where id=target_mission for update;
  if auth.uid() is null or not public.is_workspace_owner(workspace) then raise exception 'Only the owner can set mission visibility'; end if;
  if exists(select 1 from public.investigation_links where child_mission_id=target_mission) then raise exception 'Set visibility on the original mission'; end if;
  if result_scope='department' and not exists(select 1 from public.workspace_departments where id=target_department and organisation_id=workspace) then raise exception 'Choose a workspace department'; end if;
  insert into public.mission_visibility values(target_mission,workspace,result_scope,case when result_scope='department' then target_department end)
    on conflict(mission_id) do update set scope=excluded.scope,department_id=excluded.department_id;
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata) values(workspace,auth.uid(),'mission.visibility_changed','mission',target_mission,jsonb_build_object('scope',result_scope,'department',target_department));
end $$;
revoke all on function public.set_mission_visibility(uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.set_mission_visibility(uuid,text,uuid) to authenticated;

create function public.mission_access_context(target_mission uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare workspace uuid; readable boolean;
begin
  select organisation_id into workspace from public.missions where id=target_mission;
  readable:=public.can_read_mission_intelligence(target_mission);
  if auth.uid() is null or not public.is_workspace_member(workspace) or not (readable or exists(select 1 from public.mission_assignments where mission_id=target_mission and user_id=auth.uid())) then raise exception 'Mission unavailable'; end if;
  return jsonb_build_object('intelligence',readable,'governed',exists(select 1 from public.publication_requests where id=target_mission));
end $$;
revoke all on function public.mission_access_context(uuid) from public,anon,authenticated;
grant execute on function public.mission_access_context(uuid) to authenticated;

create policy mission_scoped_reader on public.missions for select to authenticated using(public.can_read_mission_intelligence(id));
create policy mission_scope on public.missions as restrictive for select to authenticated using(public.can_read_mission_intelligence(id) or exists(select 1 from public.mission_assignments where mission_id=missions.id and user_id=auth.uid()));
create policy assignment_scope on public.mission_assignments as restrictive for select to authenticated using(user_id=auth.uid() or public.can_read_mission_intelligence(mission_id));
create policy assignment_scoped_reader on public.mission_assignments for select to authenticated using(public.can_read_mission_intelligence(mission_id));
create policy observation_scope on public.observations as restrictive for select to authenticated using(user_id=auth.uid() or public.can_read_mission_intelligence(mission_id));
create policy theme_scoped_reader on public.themes for select to authenticated using(public.can_read_mission_intelligence(mission_id));
create policy hypothesis_scoped_reader on public.hypotheses for select to authenticated using(public.can_read_mission_intelligence(mission_id));
create policy finding_scoped_reader on public.findings for select to authenticated using(public.can_read_mission_intelligence(mission_id));
create policy theme_scope on public.themes as restrictive for all to authenticated using(public.can_read_mission_intelligence(mission_id)) with check(public.can_read_mission_intelligence(mission_id));
create policy hypothesis_scope on public.hypotheses as restrictive for all to authenticated using(public.can_read_mission_intelligence(mission_id)) with check(public.can_read_mission_intelligence(mission_id));
create policy finding_scope on public.findings as restrictive for all to authenticated using(public.can_read_mission_intelligence(mission_id)) with check(public.can_read_mission_intelligence(mission_id));
create policy proposal_scope on public.investigation_proposals as restrictive for select to authenticated using(public.can_read_mission_intelligence(root_mission_id));
create policy investigation_link_scope on public.investigation_links as restrictive for select to authenticated using(public.can_read_mission_intelligence(root_mission_id));
create policy policy_scope on public.policy_communications as restrictive for select to authenticated using(public.can_read_mission_intelligence(mission_id) or exists(select 1 from public.mission_assignments where mission_id=policy_communications.mission_id and user_id=auth.uid()));
create policy policy_key_scope on public.policy_answer_keys as restrictive for select to authenticated using(public.can_read_mission_intelligence(mission_id));
create policy policy_response_scope on public.policy_responses as restrictive for select to authenticated using(user_id=auth.uid() or public.can_read_mission_intelligence(mission_id));
create policy policy_scoped_reader on public.policy_communications for select to authenticated using(public.can_read_mission_intelligence(mission_id));
create policy policy_response_scoped_reader on public.policy_responses for select to authenticated using(public.can_read_mission_intelligence(mission_id));
create policy follow_up_scope on public.follow_up_tasks as restrictive for select to authenticated using(assignee_id=auth.uid() or mission_id is null or public.can_read_mission_intelligence(mission_id));
create policy source_scope on public.source_records as restrictive for all to authenticated using(user_id=auth.uid() or mission_id is null or public.can_read_mission_intelligence(mission_id)) with check(user_id=auth.uid() or mission_id is null or public.can_read_mission_intelligence(mission_id));
create policy audit_scope on public.audit_events as restrictive for select to authenticated using(actor_id=auth.uid() or public.is_workspace_owner(organisation_id));
create policy notification_scope on public.work_notifications as restrictive for select to authenticated using(recipient_id=auth.uid() or public.is_workspace_owner(organisation_id));

create or replace view public.management_observations with (security_barrier=true) as
select id,organisation_id,mission_id,category,summary,detail,confidence,confidentiality,participant_approved,
  case when confidentiality='SHARE' then user_id else null end as user_id,
  case when confidentiality='SHARE' then created_at else date_trunc('day',created_at at time zone 'UTC') at time zone 'UTC' end as created_at
from public.observations where public.can_read_mission_intelligence(mission_id) and participant_approved and confidentiality in ('CONTRIBUTE','SHARE');
create or replace view public.mission_analysis_status with (security_barrier=true) as
select mission_id,organisation_id,status,updated_at,completed_at,error_code from public.mission_analysis_jobs where public.can_read_mission_intelligence(mission_id);

create or replace function public.count_evidence_contributors(evidence_ids uuid[])
returns integer language plpgsql stable security definer set search_path=public as $$
declare contributor_count integer;
begin
  if auth.uid() is null or coalesce(cardinality(evidence_ids),0) not between 1 and 200 then raise exception 'Invalid evidence request'; end if;
  if exists(select 1 from unnest(evidence_ids) requested where not exists(select 1 from public.observations o where o.id=requested and o.participant_approved and o.confidentiality in ('CONTRIBUTE','SHARE') and public.can_read_mission_intelligence(o.mission_id))) then raise exception 'Evidence unavailable'; end if;
  select count(distinct user_id) into contributor_count from public.observations where id=any(evidence_ids);
  return contributor_count;
end $$;

-- Security-definer RPCs also check visibility; hiding rows in the interface is insufficient.
alter function public.propose_investigation(uuid,text,text,text,text[],uuid[]) rename to propose_investigation_v17;
revoke all on function public.propose_investigation_v17(uuid,text,text,text,text[],uuid[]) from public,anon,authenticated,service_role;
create function public.propose_investigation(target_mission uuid,proposal_title text,reason text,discussion_question text,target_departments text[],sources uuid[])
returns uuid language plpgsql security definer set search_path=public as $$
begin
  if not public.can_read_mission_intelligence(target_mission) then raise exception 'Mission unavailable'; end if;
  return public.propose_investigation_v17(target_mission,proposal_title,reason,discussion_question,target_departments,sources);
end $$;
revoke all on function public.propose_investigation(uuid,text,text,text,text[],uuid[]) from public,anon,authenticated;
grant execute on function public.propose_investigation(uuid,text,text,text,text[],uuid[]) to authenticated;

alter function public.request_mission_analysis(uuid) rename to request_mission_analysis_v15;
revoke all on function public.request_mission_analysis_v15(uuid) from public,anon,authenticated,service_role;
create function public.request_mission_analysis(target_mission uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.can_read_mission_intelligence(target_mission) then raise exception 'Mission unavailable'; end if;
  perform public.request_mission_analysis_v15(target_mission);
end $$;
revoke all on function public.request_mission_analysis(uuid) from public,anon,authenticated;
grant execute on function public.request_mission_analysis(uuid) to authenticated;

create function public.guard_mission_data_scope()
returns trigger language plpgsql security definer set search_path=public as $$
declare target uuid;
begin
  if auth.uid() is null then return new; end if;
  target:=case when tg_table_name='missions' then (to_jsonb(new)->>'id')::uuid else (to_jsonb(new)->>'mission_id')::uuid end;
  if target is null then return new; end if;
  if tg_table_name='mission_assignments' and (to_jsonb(new)->>'user_id')::uuid=auth.uid() then return new; end if;
  if exists(select 1 from public.publication_requests where id=target and status='publishing') then return new; end if;
  if not public.can_read_mission_intelligence(target) then raise exception 'Mission access is required'; end if;
  return new;
end $$;
create trigger mission_data_edit_scope before update on public.missions for each row execute function public.guard_mission_data_scope();
create trigger mission_assignment_data_scope before insert on public.mission_assignments for each row execute function public.guard_mission_data_scope();
create trigger mission_invitation_data_scope before insert on public.invitations for each row execute function public.guard_mission_data_scope();
create trigger mission_follow_up_data_scope before insert on public.follow_up_tasks for each row execute function public.guard_mission_data_scope();
revoke all on function public.guard_mission_data_scope() from public,anon,authenticated;

alter function public.add_follow_up_clarification(uuid,text) rename to add_follow_up_clarification_v9;
revoke all on function public.add_follow_up_clarification_v9(uuid,text) from public,anon,authenticated,service_role;
create function public.add_follow_up_clarification(target_task_id uuid,comment_text text)
returns uuid language plpgsql security definer set search_path=public as $$
declare task public.follow_up_tasks;
begin
  select * into task from public.follow_up_tasks where id=target_task_id;
  if auth.uid() is null or not public.is_workspace_member(task.organisation_id) or not (task.assignee_id=auth.uid() or task.mission_id is null and public.can_manage_workspace(task.organisation_id) or public.can_read_mission_intelligence(task.mission_id)) then raise exception 'Task unavailable'; end if;
  return public.add_follow_up_clarification_v9(target_task_id,comment_text);
end $$;
revoke all on function public.add_follow_up_clarification(uuid,text) from public,anon,authenticated;
grant execute on function public.add_follow_up_clarification(uuid,text) to authenticated;

commit;
