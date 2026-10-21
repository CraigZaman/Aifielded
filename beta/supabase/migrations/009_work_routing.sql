begin;

create table if not exists public.work_notifications (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('task_assigned','task_updated','task_comment','mission_assigned')),
  entity_id uuid not null,
  status text not null default 'pending' check (status in ('pending','sending','accepted','failed','unknown','skipped')),
  attempts integer not null default 0,
  first_attempt_at timestamptz,
  last_attempt_at timestamptz,
  provider_id text,
  error_code text,
  created_at timestamptz not null default now()
);
alter table public.work_notifications enable row level security;
revoke all on public.work_notifications from public, anon, authenticated;
grant select on public.work_notifications to authenticated;
grant select, insert, update on public.work_notifications to service_role;
drop policy if exists work_notifications_read on public.work_notifications;
create policy work_notifications_read on public.work_notifications for select to authenticated
using (public.can_manage_workspace(organisation_id) or
  (recipient_id = auth.uid() and public.is_workspace_member(organisation_id)));
create index if not exists work_notifications_pending on public.work_notifications(organisation_id, status, created_at);

-- Mutations go through checked functions so task routing cannot be forged via REST.
revoke insert, update, delete on public.follow_up_tasks from public, anon, authenticated;
revoke insert, update, delete on public.follow_up_clarifications from public, anon, authenticated;
drop policy if exists follow_up_select on public.follow_up_tasks;
create policy follow_up_select on public.follow_up_tasks for select to authenticated
using (public.can_manage_workspace(organisation_id) or
  (assignee_id = auth.uid() and public.is_workspace_member(organisation_id)));
drop policy if exists clarification_select on public.follow_up_clarifications;
create policy clarification_select on public.follow_up_clarifications for select to authenticated
using (exists(select 1 from public.follow_up_tasks t where t.id = task_id));

create or replace function public.create_follow_up(
  workspace_id uuid, recipient_id uuid, task_title text, task_description text,
  linked_mission_id uuid default null, task_due_at timestamptz default null
) returns uuid language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  if auth.uid() is null or not public.can_manage_workspace(workspace_id) then
    raise exception 'Not authorised.';
  end if;
  if not exists(select 1 from public.organisation_memberships where organisation_id = workspace_id
    and user_id = recipient_id and status = 'active') then
    raise exception 'Choose an active member of this workspace.';
  end if;
  if linked_mission_id is not null and not exists(select 1 from public.missions
    where id = linked_mission_id and organisation_id = workspace_id and status = 'active') then
    raise exception 'Choose an active mission in this workspace.';
  end if;
  if task_title is null or char_length(trim(task_title)) not between 4 and 160
    or task_description is null or char_length(trim(task_description)) not between 6 and 1500 then
    raise exception 'Complete the follow-up details.';
  end if;
  insert into public.follow_up_tasks(organisation_id,mission_id,assigned_by,assignee_id,title,description,due_at)
    values(workspace_id,linked_mission_id,auth.uid(),recipient_id,trim(task_title),trim(task_description),task_due_at)
    returning id into new_id;
  insert into public.work_notifications(organisation_id,recipient_id,kind,entity_id)
    values(workspace_id,recipient_id,'task_assigned',new_id);
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id)
    values(workspace_id,auth.uid(),'task.created','follow_up_task',new_id);
  return new_id;
end $$;

create or replace function public.update_own_follow_up(task_id uuid, next_status public.follow_up_status)
returns void language plpgsql security definer set search_path = public as $$
declare task public.follow_up_tasks;
begin
  select * into task from public.follow_up_tasks where id = task_id for update;
  if not found or auth.uid() is null or task.assignee_id <> auth.uid()
    or not public.is_workspace_member(task.organisation_id) then raise exception 'Task not available.'; end if;
  if next_status is null or next_status = 'assigned' then raise exception 'Choose a valid task status.'; end if;
  if task.status = next_status then return; end if;
  update public.follow_up_tasks set status = next_status, updated_at = now(),
    completed_at = case when next_status = 'completed' then now() else null end where id = task_id;
  if task.assigned_by <> auth.uid() then
    insert into public.work_notifications(organisation_id,recipient_id,kind,entity_id)
      values(task.organisation_id,task.assigned_by,'task_updated',task_id);
  end if;
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata)
    values(task.organisation_id,auth.uid(),'task.status_updated','follow_up_task',task_id,
      jsonb_build_object('from',task.status,'to',next_status));
end $$;

create or replace function public.add_follow_up_clarification(target_task_id uuid, comment_text text)
returns uuid language plpgsql security definer set search_path = public as $$
declare task public.follow_up_tasks; new_id uuid; recipient uuid;
begin
  select * into task from public.follow_up_tasks where id = target_task_id for update;
  if not found or auth.uid() is null or not public.is_workspace_member(task.organisation_id)
    or not (task.assignee_id = auth.uid() or public.can_manage_workspace(task.organisation_id)) then
    raise exception 'Task not available.';
  end if;
  if comment_text is null or char_length(trim(comment_text)) not between 2 and 1200 then
    raise exception 'Enter a comment between 2 and 1200 characters.';
  end if;
  insert into public.follow_up_clarifications(task_id,author_id,content)
    values(target_task_id,auth.uid(),trim(comment_text)) returning id into new_id;
  recipient := case when task.assignee_id = auth.uid() then task.assigned_by else task.assignee_id end;
  if recipient <> auth.uid() then
    insert into public.work_notifications(organisation_id,recipient_id,kind,entity_id)
      values(task.organisation_id,recipient,'task_comment',target_task_id);
  end if;
  return new_id;
end $$;

create or replace function public.assign_mission_participant(target_mission_id uuid, participant_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare mission public.missions; new_id uuid;
begin
  select * into mission from public.missions where id = target_mission_id for share;
  if not found or auth.uid() is null or not public.can_manage_workspace(mission.organisation_id)
    or mission.status <> 'active' then raise exception 'Active mission not available.'; end if;
  if not exists(select 1 from public.organisation_memberships where organisation_id = mission.organisation_id
    and user_id = participant_id and status = 'active') then raise exception 'Choose an active workspace member.'; end if;
  insert into public.mission_assignments(organisation_id,mission_id,user_id)
    values(mission.organisation_id,mission.id,participant_id) on conflict(mission_id,user_id) do nothing returning id into new_id;
  if new_id is null then
    select id into new_id from public.mission_assignments where mission_id = mission.id and user_id = participant_id;
    return new_id;
  end if;
  insert into public.work_notifications(organisation_id,recipient_id,kind,entity_id)
    values(mission.organisation_id,participant_id,'mission_assigned',new_id);
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id)
    values(mission.organisation_id,auth.uid(),'mission.assigned','mission_assignment',new_id);
  return new_id;
end $$;

-- Claims are exclusive. Stop uncertain retries before the provider's 24-hour deduplication window ends.
create or replace function public.claim_work_notifications(workspace_id uuid)
returns setof public.work_notifications language plpgsql security definer set search_path = public as $$
begin
  update public.work_notifications set status = 'unknown', error_code = 'retry_window_expired'
    where organisation_id = workspace_id and status in ('sending','failed')
      and first_attempt_at < now() - interval '23 hours';
  return query
    update public.work_notifications n set status = 'sending', attempts = n.attempts + 1,
      first_attempt_at = coalesce(n.first_attempt_at, now()), last_attempt_at = now()
    where n.id in (
      select q.id from public.work_notifications q where q.organisation_id = workspace_id
        and q.attempts < 6 and (q.status = 'pending' or
          (q.status in ('failed','sending') and q.last_attempt_at < now() - interval '5 minutes'))
      order by q.created_at for update skip locked limit 10
    ) returning n.*;
end $$;

revoke all on function public.create_follow_up(uuid,uuid,text,text,uuid,timestamptz) from public, anon, authenticated;
revoke all on function public.update_own_follow_up(uuid,public.follow_up_status) from public, anon, authenticated;
revoke all on function public.add_follow_up_clarification(uuid,text) from public, anon, authenticated;
revoke all on function public.assign_mission_participant(uuid,uuid) from public, anon, authenticated;
revoke all on function public.claim_work_notifications(uuid) from public, anon, authenticated;
grant execute on function public.create_follow_up(uuid,uuid,text,text,uuid,timestamptz) to authenticated;
grant execute on function public.update_own_follow_up(uuid,public.follow_up_status) to authenticated;
grant execute on function public.add_follow_up_clarification(uuid,text) to authenticated;
grant execute on function public.assign_mission_participant(uuid,uuid) to authenticated;
grant execute on function public.claim_work_notifications(uuid) to service_role;

create or replace function public.submit_written_response(target_assignment uuid, response_title text, response_text text, visibility public.confidentiality_state)
returns void language plpgsql security definer set search_path = public as $$
declare assignment public.mission_assignments; saved_conversation_id uuid; mission public.missions;
begin
  select * into assignment from public.mission_assignments where id = target_assignment for update;
  if not found or auth.uid() is null or assignment.user_id <> auth.uid()
    or not public.is_workspace_member(assignment.organisation_id) then raise exception 'Assignment not available.'; end if;
  if assignment.status = 'completed' then return; end if;
  select * into mission from public.missions where id = assignment.mission_id for share;
  if mission.status <> 'active' then raise exception 'This mission is not accepting responses.'; end if;
  if visibility is null or visibility not in ('PRIVATE','SHARE') then raise exception 'Choose private or attributed sharing.'; end if;
  if response_title is null or char_length(trim(response_title)) not between 4 and 160
    or response_text is null or char_length(trim(response_text)) not between 20 and 6000 then
    raise exception 'Enter a title and a response between 20 and 6000 characters.'; end if;
  insert into public.conversations(assignment_id,mission_id,user_id)
    values(assignment.id,assignment.mission_id,auth.uid()) on conflict(assignment_id) do nothing;
  select id into saved_conversation_id from public.conversations where assignment_id = assignment.id;
  if exists(select 1 from public.conversation_summaries s where s.conversation_id = saved_conversation_id and s.status = 'approved') then
    raise exception 'This response has already been approved.';
  end if;
  insert into public.messages(conversation_id,sender,content,confidentiality)
    values(saved_conversation_id,'participant',trim(response_text),visibility);
  insert into public.conversation_summaries(conversation_id,user_id,summary,status,approved_at)
    values(saved_conversation_id,auth.uid(),trim(response_text),'approved',now())
    on conflict(conversation_id) do update set summary=excluded.summary,status='approved',approved_at=now(),updated_at=now();
  delete from public.observations o where o.conversation_id = saved_conversation_id and not o.participant_approved;
  insert into public.observations(organisation_id,mission_id,conversation_id,user_id,category,summary,detail,confidentiality,confidence,participant_approved)
    values(assignment.organisation_id,assignment.mission_id,saved_conversation_id,auth.uid(),'participant_response',trim(response_title),trim(response_text),visibility,0.5,true);
  update public.mission_assignments set status='completed',started_at=coalesce(started_at,now()),completed_at=now() where id=assignment.id;
  update public.conversations set completed_at=now() where id=saved_conversation_id;
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id)
    values(assignment.organisation_id,auth.uid(),'response.submitted','mission_assignment',assignment.id);
end $$;
revoke all on function public.submit_written_response(uuid,text,text,public.confidentiality_state) from public, anon, authenticated;
grant execute on function public.submit_written_response(uuid,text,text,public.confidentiality_state) to authenticated;

commit;
