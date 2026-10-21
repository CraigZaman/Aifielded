alter table public.profiles
  add column if not exists business_role text;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles(id, full_name, business_role, department)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'business_role', ''),
    nullif(new.raw_user_meta_data->>'department', '')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    business_role = coalesce(excluded.business_role, public.profiles.business_role),
    department = coalesce(excluded.department, public.profiles.department),
    updated_at = now();
  return new;
end
$$;

drop function if exists public.invitation_preview(text);
create function public.invitation_preview(raw_token text)
returns table(
  mission_title text,
  mission_objective text,
  organisation_name text,
  access_role public.workspace_role,
  invited_email text,
  expired boolean
)
language sql stable security definer set search_path = public
as $$
  select
    coalesce(m.title, 'Join ' || o.name),
    coalesce(m.objective, 'You have been invited to join this Fielded workspace.'),
    o.name,
    i.role,
    i.invited_email,
    (i.status <> 'active' or i.expires_at <= now() or i.uses_count >= i.max_uses)
  from public.invitations i
  join public.organisations o on o.id = i.organisation_id
  left join public.missions m on m.id = i.mission_id
  where i.token_digest = encode(extensions.digest(raw_token, 'sha256'), 'hex')
  limit 1
$$;

create or replace function public.accept_invitation(raw_token text)
returns jsonb language plpgsql security definer set search_path = public
as $$
declare invite public.invitations%rowtype; assignment_id uuid;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  select * into invite from public.invitations where token_digest = encode(extensions.digest(raw_token, 'sha256'), 'hex') for update;
  if invite.id is null or invite.status <> 'active' or invite.expires_at <= now() or invite.uses_count >= invite.max_uses then raise exception 'This invitation is no longer valid'; end if;
  if invite.invited_email is not null and lower(invite.invited_email) <> lower(coalesce(auth.jwt()->>'email','')) then raise exception 'This invitation was created for a different email address'; end if;
  if exists(select 1 from public.organisation_memberships where user_id = auth.uid() and organisation_id <> invite.organisation_id) then raise exception 'This account already belongs to another Fielded workspace'; end if;
  insert into public.organisation_memberships(organisation_id, user_id, role, status)
  values (invite.organisation_id, auth.uid(), invite.role, 'active')
  on conflict (organisation_id, user_id) do update set role = excluded.role, status = 'active';
  if invite.mission_id is not null then
    insert into public.mission_assignments(organisation_id, mission_id, user_id, invitation_id)
    values (invite.organisation_id, invite.mission_id, auth.uid(), invite.id)
    on conflict (mission_id, user_id) do update set invitation_id = excluded.invitation_id returning id into assignment_id;
  end if;
  update public.invitations set uses_count = uses_count + 1, status = case when uses_count + 1 >= max_uses then 'expired' else status end where id = invite.id;
  insert into public.audit_events(organisation_id, actor_id, action, entity_type, entity_id) values (invite.organisation_id, auth.uid(), 'invitation.accepted', 'invitation', invite.id);
  return jsonb_build_object('organisation_id', invite.organisation_id, 'assignment_id', assignment_id, 'role', invite.role);
end
$$;

grant execute on function public.invitation_preview(text) to anon, authenticated;
grant execute on function public.accept_invitation(text) to authenticated;

create or replace function public.can_manage_people(workspace_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists(
    select 1 from public.organisation_memberships
    where organisation_id = workspace_id
      and user_id = auth.uid()
      and status = 'active'
      and role in ('owner', 'manager', 'hr')
  )
$$;

create or replace function public.can_manage_integrations(workspace_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists(
    select 1 from public.organisation_memberships
    where organisation_id = workspace_id
      and user_id = auth.uid()
      and status = 'active'
      and role in ('owner', 'manager')
  )
$$;

create or replace function public.is_workspace_owner(workspace_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists(
    select 1 from public.organisation_memberships
    where organisation_id = workspace_id
      and user_id = auth.uid()
      and status = 'active'
      and role = 'owner'
  )
$$;

create or replace function public.can_admin_memberships(workspace_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists(
    select 1 from public.organisation_memberships
    where organisation_id = workspace_id
      and user_id = auth.uid()
      and status = 'active'
      and role in ('owner', 'manager')
  )
$$;

create or replace function public.can_view_workspace_profile(profile_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists(
    select 1
    from public.organisation_memberships mine
    join public.organisation_memberships theirs on theirs.organisation_id = mine.organisation_id
    where mine.user_id = auth.uid()
      and mine.status = 'active'
      and mine.role in ('owner', 'manager', 'hr')
      and theirs.user_id = profile_id
      and theirs.status = 'active'
  )
$$;

drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles for select
using (id = auth.uid() or public.can_view_workspace_profile(id));

drop policy if exists memberships_select on public.organisation_memberships;
create policy memberships_select on public.organisation_memberships for select
using (user_id = auth.uid() or public.can_manage_people(organisation_id));

drop policy if exists memberships_manage on public.organisation_memberships;
create policy memberships_manage on public.organisation_memberships for update
using (
  public.can_admin_memberships(organisation_id)
  and (role not in ('owner', 'manager') or public.is_workspace_owner(organisation_id))
)
with check (
  public.can_admin_memberships(organisation_id)
  and role <> 'owner'
  and (role <> 'manager' or public.is_workspace_owner(organisation_id))
);

drop policy if exists invitations_manage_all on public.invitations;
drop policy if exists invitations_select on public.invitations;
drop policy if exists invitations_insert on public.invitations;
drop policy if exists invitations_update on public.invitations;
drop policy if exists invitations_delete on public.invitations;
create policy invitations_select on public.invitations for select
using (public.can_manage_workspace(organisation_id));
create policy invitations_insert on public.invitations for insert
with check (
  created_by = auth.uid()
  and (
    (mission_id is not null and public.can_manage_workspace(organisation_id))
    or (mission_id is null and role = 'participant' and public.can_manage_people(organisation_id))
    or (mission_id is null and role <> 'manager' and public.can_admin_memberships(organisation_id))
    or (mission_id is null and public.is_workspace_owner(organisation_id))
  )
);
create policy invitations_update on public.invitations for update
using (created_by = auth.uid() or public.can_admin_memberships(organisation_id))
with check (created_by = auth.uid() or public.can_admin_memberships(organisation_id));
create policy invitations_delete on public.invitations for delete
using (created_by = auth.uid() or public.can_admin_memberships(organisation_id));

drop policy if exists connections_manager_all on public.integration_connections;
create policy connections_manager_all on public.integration_connections for all
using (public.can_manage_integrations(organisation_id))
with check (public.can_manage_integrations(organisation_id) and connected_by = auth.uid());

drop policy if exists sync_runs_manager_all on public.integration_sync_runs;
create policy sync_runs_manager_all on public.integration_sync_runs for all
using (public.can_manage_integrations(organisation_id))
with check (public.can_manage_integrations(organisation_id) and started_by = auth.uid());

revoke all on function public.can_manage_people(uuid) from public;
revoke all on function public.can_manage_integrations(uuid) from public;
revoke all on function public.can_view_workspace_profile(uuid) from public;
revoke all on function public.is_workspace_owner(uuid) from public;
revoke all on function public.can_admin_memberships(uuid) from public;
grant execute on function public.can_manage_people(uuid) to authenticated;
grant execute on function public.can_manage_integrations(uuid) to authenticated;
grant execute on function public.can_view_workspace_profile(uuid) to authenticated;
grant execute on function public.is_workspace_owner(uuid) to authenticated;
grant execute on function public.can_admin_memberships(uuid) to authenticated;
