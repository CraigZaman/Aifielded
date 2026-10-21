begin;

create or replace function public.can_access_own_assignment(target_assignment uuid, target_mission uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.mission_assignments a
    join public.missions m on m.id = a.mission_id and m.organisation_id = a.organisation_id
    join public.organisation_memberships member on member.organisation_id = a.organisation_id
      and member.user_id = a.user_id and member.status = 'active'
    where a.id = target_assignment and a.mission_id = target_mission and a.user_id = auth.uid()
  )
$$;
revoke all on function public.can_access_own_assignment(uuid, uuid) from public, anon;
grant execute on function public.can_access_own_assignment(uuid, uuid) to authenticated;

drop policy if exists assignments_select on public.mission_assignments;
create policy assignments_select on public.mission_assignments for select using (
  (user_id = auth.uid() and public.is_workspace_member(organisation_id))
  or public.can_manage_workspace(organisation_id)
);
drop policy if exists assignments_own_update on public.mission_assignments;
create policy assignments_own_update on public.mission_assignments for update
using (public.can_access_own_assignment(id, mission_id))
with check (public.can_access_own_assignment(id, mission_id));
revoke update on public.mission_assignments from authenticated;
grant update(status, started_at, completed_at) on public.mission_assignments to authenticated;

drop policy if exists conversations_own_all on public.conversations;
create policy conversations_own_all on public.conversations for all
using (user_id = auth.uid() and public.can_access_own_assignment(assignment_id, mission_id))
with check (user_id = auth.uid() and public.can_access_own_assignment(assignment_id, mission_id));
revoke update on public.conversations from authenticated;
grant update(completed_at) on public.conversations to authenticated;

drop policy if exists summaries_own_all on public.conversation_summaries;
create policy summaries_own_all on public.conversation_summaries for all
using (user_id = auth.uid() and exists (
  select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()
))
with check (user_id = auth.uid() and exists (
  select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()
));

create or replace function public.can_write_own_observation(target_conversation uuid, target_mission uuid, target_workspace uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.conversations c
    join public.mission_assignments a on a.id = c.assignment_id
    where c.id = target_conversation and c.user_id = auth.uid()
      and c.mission_id = target_mission
      and public.can_access_own_assignment(a.id, target_mission)
      and (target_workspace is null or target_workspace = a.organisation_id)
  )
$$;
revoke all on function public.can_write_own_observation(uuid, uuid, uuid) from public, anon;
grant execute on function public.can_write_own_observation(uuid, uuid, uuid) to authenticated;

drop policy if exists observations_participant_select on public.observations;
create policy observations_participant_select on public.observations for select using (
  user_id = auth.uid() and public.can_write_own_observation(conversation_id, mission_id, organisation_id)
);
drop policy if exists observations_participant_insert on public.observations;
create policy observations_participant_insert on public.observations for insert with check (
  user_id = auth.uid() and public.can_write_own_observation(conversation_id, mission_id, organisation_id)
);
drop policy if exists observations_participant_update on public.observations;
create policy observations_participant_update on public.observations for update
using (user_id = auth.uid() and public.can_write_own_observation(conversation_id, mission_id, organisation_id))
with check (user_id = auth.uid() and public.can_write_own_observation(conversation_id, mission_id, organisation_id));
drop policy if exists observations_participant_delete on public.observations;
create policy observations_participant_delete on public.observations for delete using (
  user_id = auth.uid() and not participant_approved
  and public.can_write_own_observation(conversation_id, mission_id, organisation_id)
);

commit;
