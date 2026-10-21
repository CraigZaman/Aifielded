begin;

-- Invitation authority is checked in the database, including direct API requests.
create or replace function public.can_issue_invitation(workspace_id uuid, target_role public.workspace_role, target_mission uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select target_role <> 'owner' and exists (
    select 1 from public.organisation_memberships actor
    where actor.organisation_id = workspace_id and actor.user_id = auth.uid()
      and actor.status = 'active'
      and (
        (target_mission is not null and target_role = 'participant'
          and actor.role in ('owner','manager','hr','consultant')
          and exists(select 1 from public.missions m where m.id = target_mission and m.organisation_id = workspace_id))
        or (target_mission is null and (
          actor.role = 'owner'
          or (actor.role = 'manager' and target_role in ('hr','participant','consultant'))
          or (actor.role = 'hr' and target_role = 'participant')
        ))
      )
  )
$$;

drop policy if exists invitations_insert on public.invitations;
create policy invitations_insert on public.invitations for insert to authenticated
with check (created_by = auth.uid() and public.can_issue_invitation(organisation_id, role, mission_id));

-- Only revocation is mutable; tokens, scope and granted roles cannot be rewritten.
revoke update on public.invitations from authenticated;
grant update(status) on public.invitations to authenticated;
drop policy if exists invitations_update on public.invitations;
create policy invitations_update on public.invitations for update to authenticated
using (public.can_issue_invitation(organisation_id, role, mission_id))
with check (status = 'revoked' and public.can_issue_invitation(organisation_id, role, mission_id));

-- Access administration cannot move a membership to a different person or company.
revoke update on public.organisation_memberships from authenticated;
grant update(role, status) on public.organisation_memberships to authenticated;
drop policy if exists memberships_manage on public.organisation_memberships;
create policy memberships_manage on public.organisation_memberships for update to authenticated
using (user_id <> auth.uid() and role <> 'owner' and public.can_admin_memberships(organisation_id)
  and (role <> 'manager' or public.is_workspace_owner(organisation_id)))
with check (user_id <> auth.uid() and role <> 'owner' and public.can_admin_memberships(organisation_id)
  and (role <> 'manager' or public.is_workspace_owner(organisation_id)));

create or replace function public.accept_invitation(raw_token text)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare
  invite public.invitations%rowtype;
  member public.organisation_memberships%rowtype;
  assignment_id uuid;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  -- Serialize acceptance for this identity across different invitation links.
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text, 0));
  select * into invite from public.invitations
    where token_digest = encode(extensions.digest(raw_token, 'sha256'), 'hex') for update;
  if invite.id is null or invite.status <> 'active' or invite.expires_at <= now()
    or invite.uses_count >= invite.max_uses then raise exception 'This invitation is no longer valid'; end if;
  if invite.role = 'owner' or (invite.mission_id is not null and invite.role <> 'participant') then
    raise exception 'This invitation grants an invalid access level';
  end if;
  if invite.invited_email is not null and lower(invite.invited_email) <> lower(coalesce(auth.jwt()->>'email','')) then
    raise exception 'This invitation was created for a different email address';
  end if;
  if exists(select 1 from public.organisation_memberships where user_id = auth.uid() and organisation_id <> invite.organisation_id) then
    raise exception 'This account already belongs to another Fielded workspace';
  end if;
  select * into member from public.organisation_memberships
    where user_id = auth.uid() and organisation_id = invite.organisation_id for update;
  if member.id is not null and member.status <> 'active' then
    raise exception 'Your workspace access is suspended. Contact your workspace owner';
  end if;
  if invite.mission_id is not null and not exists (
    select 1 from public.missions where id = invite.mission_id and organisation_id = invite.organisation_id and status = 'active'
  ) then raise exception 'This mission is not accepting participants'; end if;
  if member.id is null then
    insert into public.organisation_memberships(organisation_id,user_id,role,status)
      values(invite.organisation_id,auth.uid(),invite.role,'active') returning * into member;
  end if;
  if invite.mission_id is not null then
    insert into public.mission_assignments(organisation_id,mission_id,user_id,invitation_id)
      values(invite.organisation_id,invite.mission_id,auth.uid(),invite.id)
      on conflict(mission_id,user_id) do update set invitation_id = excluded.invitation_id
      returning id into assignment_id;
  end if;
  update public.invitations set uses_count = uses_count + 1,
    status = case when uses_count + 1 >= max_uses then 'expired' else status end where id = invite.id;
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id)
    values(invite.organisation_id,auth.uid(),'invitation.accepted','invitation',invite.id);
  return jsonb_build_object('organisation_id',invite.organisation_id,'assignment_id',assignment_id,'role',member.role);
end
$$;

revoke all on function public.can_issue_invitation(uuid,public.workspace_role,uuid) from public;
grant execute on function public.can_issue_invitation(uuid,public.workspace_role,uuid) to authenticated;
revoke all on function public.accept_invitation(text) from public;
grant execute on function public.accept_invitation(text) to authenticated;

commit;
