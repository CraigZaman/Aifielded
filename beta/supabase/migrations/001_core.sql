create extension if not exists pgcrypto;

create type public.workspace_role as enum ('owner', 'manager', 'hr', 'participant', 'consultant');
create type public.membership_status as enum ('active', 'suspended');
create type public.mission_status as enum ('draft', 'active', 'paused', 'completed', 'archived');
create type public.assignment_status as enum ('invited', 'in_progress', 'completed', 'declined');
create type public.confidentiality_state as enum ('PRIVATE', 'CONTRIBUTE', 'SHARE');
create type public.invitation_status as enum ('active', 'revoked', 'expired');
create type public.follow_up_status as enum ('assigned', 'acknowledged', 'in_progress', 'blocked', 'completed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  job_title text,
  business_role text,
  department text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  slug text not null unique,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organisation_memberships (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.workspace_role not null default 'participant',
  status public.membership_status not null default 'active',
  created_at timestamptz not null default now(),
  unique (organisation_id, user_id)
);

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  title text not null check (char_length(title) between 4 and 120),
  objective text not null,
  context text,
  desired_outcome text,
  departments text[] not null default '{}',
  status public.mission_status not null default 'draft',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  mission_id uuid references public.missions(id) on delete cascade,
  created_by uuid not null references auth.users(id),
  role public.workspace_role not null default 'participant',
  invited_email text,
  token_digest text not null unique,
  status public.invitation_status not null default 'active',
  max_uses integer not null default 250 check (max_uses between 1 and 1000),
  uses_count integer not null default 0 check (uses_count >= 0),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.mission_assignments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  invitation_id uuid references public.invitations(id) on delete set null,
  status public.assignment_status not null default 'invited',
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (mission_id, user_id)
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null unique references public.mission_assignments(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender text not null check (sender in ('participant', 'fielded', 'system')),
  content text not null check (char_length(content) between 1 and 20000),
  confidentiality public.confidentiality_state not null default 'CONTRIBUTE',
  created_at timestamptz not null default now()
);

create table public.conversation_summaries (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null unique references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  summary text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected')),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.observations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  summary text not null,
  detail text not null,
  confidentiality public.confidentiality_state not null,
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  participant_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.themes (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  title text not null,
  description text not null,
  participant_count integer not null default 0,
  evidence_count integer not null default 0,
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  created_at timestamptz not null default now()
);

create table public.hypotheses (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  title text not null,
  description text not null,
  status text not null default 'emerging' check (status in ('emerging', 'testing', 'supported', 'rejected')),
  evidence_for text[] not null default '{}',
  evidence_against text[] not null default '{}',
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  created_at timestamptz not null default now()
);

create table public.findings (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  title text not null,
  summary text not null,
  evidence_summary text not null,
  confidence numeric(4,3) not null check (confidence between 0 and 1),
  impact text not null check (impact in ('low', 'medium', 'high')),
  recommended_action text,
  created_at timestamptz not null default now()
);

create table public.follow_up_tasks (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  mission_id uuid references public.missions(id) on delete set null,
  assigned_by uuid not null references auth.users(id),
  assignee_id uuid not null references auth.users(id),
  title text not null,
  description text not null,
  status public.follow_up_status not null default 'assigned',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.follow_up_clarifications (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.follow_up_tasks(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  content text not null check (char_length(content) between 2 and 1200),
  created_at timestamptz not null default now()
);

create table public.source_records (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  mission_id uuid references public.missions(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade,
  provider text,
  source_type text not null,
  external_id text,
  title text not null,
  content text,
  storage_path text,
  mime_type text,
  confidentiality public.confidentiality_state not null default 'PRIVATE',
  occurred_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create unique index source_records_external_key on public.source_records(organisation_id, provider, external_id);

create table public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  provider text not null check (provider in ('slack', 'google', 'microsoft')),
  status text not null default 'active' check (status in ('active', 'attention', 'revoked')),
  access_token_encrypted text not null,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  external_account_id text,
  scopes text[] not null default '{}',
  metadata jsonb not null default '{}',
  connected_by uuid not null references auth.users(id),
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, provider)
);

create table public.integration_sync_runs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  connection_id uuid not null references public.integration_connections(id) on delete cascade,
  status text not null check (status in ('running', 'completed', 'failed')),
  records_processed integer not null default 0,
  error_message text,
  started_by uuid not null references auth.users(id),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index memberships_user_idx on public.organisation_memberships(user_id);
create index assignments_user_idx on public.mission_assignments(user_id, status);
create index messages_conversation_idx on public.messages(conversation_id, created_at);
create index observations_mission_idx on public.observations(mission_id, participant_approved, confidentiality);
create index follow_up_assignee_idx on public.follow_up_tasks(assignee_id, status);
create index source_records_org_idx on public.source_records(organisation_id, provider, occurred_at desc);

create or replace function public.is_workspace_member(workspace_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.organisation_memberships where organisation_id = workspace_id and user_id = auth.uid() and status = 'active') $$;

create or replace function public.can_manage_workspace(workspace_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.organisation_memberships where organisation_id = workspace_id and user_id = auth.uid() and status = 'active' and role in ('owner','manager','hr','consultant')) $$;

create or replace function public.can_manage_people(workspace_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.organisation_memberships where organisation_id = workspace_id and user_id = auth.uid() and status = 'active' and role in ('owner','manager','hr')) $$;

create or replace function public.can_manage_integrations(workspace_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.organisation_memberships where organisation_id = workspace_id and user_id = auth.uid() and status = 'active' and role in ('owner','manager')) $$;

create or replace function public.is_workspace_owner(workspace_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.organisation_memberships where organisation_id = workspace_id and user_id = auth.uid() and status = 'active' and role = 'owner') $$;

create or replace function public.can_admin_memberships(workspace_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.organisation_memberships where organisation_id = workspace_id and user_id = auth.uid() and status = 'active' and role in ('owner','manager')) $$;

create or replace function public.can_view_workspace_profile(profile_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists(
    select 1 from public.organisation_memberships mine
    join public.organisation_memberships theirs on theirs.organisation_id = mine.organisation_id
    where mine.user_id = auth.uid() and mine.status = 'active' and mine.role in ('owner','manager','hr')
      and theirs.user_id = profile_id and theirs.status = 'active'
  )
$$;

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
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.create_workspace(workspace_name text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare workspace_id uuid; workspace_slug text;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  if length(trim(workspace_name)) < 2 then raise exception 'Workspace name is too short'; end if;
  if exists(select 1 from public.organisation_memberships where user_id = auth.uid()) then
    select organisation_id into workspace_id from public.organisation_memberships where user_id = auth.uid() limit 1;
    return workspace_id;
  end if;
  workspace_slug := regexp_replace(lower(trim(workspace_name)), '[^a-z0-9]+', '-', 'g') || '-' || substr(gen_random_uuid()::text, 1, 6);
  insert into public.organisations(name, slug, created_by) values (trim(workspace_name), workspace_slug, auth.uid()) returning id into workspace_id;
  insert into public.organisation_memberships(organisation_id, user_id, role) values (workspace_id, auth.uid(), 'owner');
  insert into public.audit_events(organisation_id, actor_id, action, entity_type, entity_id) values (workspace_id, auth.uid(), 'workspace.created', 'workspace', workspace_id);
  return workspace_id;
end $$;

create or replace function public.invitation_preview(raw_token text)
returns table(mission_title text, mission_objective text, organisation_name text, access_role public.workspace_role, invited_email text, expired boolean)
language sql stable security definer set search_path = public
as $$
  select coalesce(m.title, 'Join ' || o.name), coalesce(m.objective, 'You have been invited to join this Fielded workspace.'), o.name, i.role, i.invited_email,
    (i.status <> 'active' or i.expires_at <= now() or i.uses_count >= i.max_uses)
  from public.invitations i join public.organisations o on o.id = i.organisation_id left join public.missions m on m.id = i.mission_id
  where i.token_digest = encode(extensions.digest(raw_token, 'sha256'), 'hex') limit 1
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
  insert into public.organisation_memberships(organisation_id, user_id, role, status) values (invite.organisation_id, auth.uid(), invite.role, 'active')
    on conflict (organisation_id, user_id) do update set role = excluded.role, status = 'active';
  if invite.mission_id is not null then
    insert into public.mission_assignments(organisation_id, mission_id, user_id, invitation_id) values (invite.organisation_id, invite.mission_id, auth.uid(), invite.id)
      on conflict (mission_id, user_id) do update set invitation_id = excluded.invitation_id returning id into assignment_id;
  end if;
  update public.invitations set uses_count = uses_count + 1, status = case when uses_count + 1 >= max_uses then 'expired' else status end where id = invite.id;
  insert into public.audit_events(organisation_id, actor_id, action, entity_type, entity_id) values (invite.organisation_id, auth.uid(), 'invitation.accepted', 'invitation', invite.id);
  return jsonb_build_object('organisation_id', invite.organisation_id, 'assignment_id', assignment_id, 'role', invite.role);
end $$;

create or replace function public.update_own_follow_up(task_id uuid, next_status public.follow_up_status)
returns void language plpgsql security definer set search_path = public
as $$
begin
  update public.follow_up_tasks set status = next_status, updated_at = now(), completed_at = case when next_status = 'completed' then now() else null end where id = task_id and assignee_id = auth.uid();
  if not found then raise exception 'Follow-up not found'; end if;
end $$;

alter table public.profiles enable row level security;
alter table public.organisations enable row level security;
alter table public.organisation_memberships enable row level security;
alter table public.missions enable row level security;
alter table public.invitations enable row level security;
alter table public.mission_assignments enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.conversation_summaries enable row level security;
alter table public.observations enable row level security;
alter table public.themes enable row level security;
alter table public.hypotheses enable row level security;
alter table public.findings enable row level security;
alter table public.follow_up_tasks enable row level security;
alter table public.follow_up_clarifications enable row level security;
alter table public.source_records enable row level security;
alter table public.integration_connections enable row level security;
alter table public.integration_sync_runs enable row level security;
alter table public.audit_events enable row level security;

create policy profiles_self_select on public.profiles for select using (id = auth.uid() or public.can_view_workspace_profile(id));
create policy profiles_self_update on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy organisations_member_select on public.organisations for select using (public.is_workspace_member(id));
create policy organisations_owner_update on public.organisations for update using (exists(select 1 from public.organisation_memberships where organisation_id = organisations.id and user_id = auth.uid() and role = 'owner'));
create policy memberships_select on public.organisation_memberships for select using (user_id = auth.uid() or public.can_manage_people(organisation_id));
create policy memberships_manage on public.organisation_memberships for update
using (public.can_admin_memberships(organisation_id) and (role not in ('owner','manager') or public.is_workspace_owner(organisation_id)))
with check (public.can_admin_memberships(organisation_id) and role <> 'owner' and (role <> 'manager' or public.is_workspace_owner(organisation_id)));

create policy missions_select on public.missions for select using (public.can_manage_workspace(organisation_id) or exists(select 1 from public.mission_assignments where mission_id = missions.id and user_id = auth.uid()));
create policy missions_insert on public.missions for insert with check (public.can_manage_workspace(organisation_id) and created_by = auth.uid());
create policy missions_update on public.missions for update using (public.can_manage_workspace(organisation_id)) with check (public.can_manage_workspace(organisation_id));
create policy invitations_select on public.invitations for select using (public.can_manage_workspace(organisation_id));
create policy invitations_insert on public.invitations for insert with check (
  created_by = auth.uid() and (
    (mission_id is not null and public.can_manage_workspace(organisation_id))
    or (mission_id is null and role = 'participant' and public.can_manage_people(organisation_id))
    or (mission_id is null and role <> 'manager' and public.can_admin_memberships(organisation_id))
    or (mission_id is null and public.is_workspace_owner(organisation_id))
  )
);
create policy invitations_update on public.invitations for update using (created_by = auth.uid() or public.can_admin_memberships(organisation_id)) with check (created_by = auth.uid() or public.can_admin_memberships(organisation_id));
create policy invitations_delete on public.invitations for delete using (created_by = auth.uid() or public.can_admin_memberships(organisation_id));
create policy assignments_select on public.mission_assignments for select using (user_id = auth.uid() or public.can_manage_workspace(organisation_id));
create policy assignments_own_update on public.mission_assignments for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy conversations_own_all on public.conversations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy messages_own_select on public.messages for select using (exists(select 1 from public.conversations where id = messages.conversation_id and user_id = auth.uid()));
create policy messages_own_insert on public.messages for insert with check (exists(select 1 from public.conversations where id = messages.conversation_id and user_id = auth.uid()));
create policy summaries_own_all on public.conversation_summaries for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy observations_participant_select on public.observations for select using (user_id = auth.uid());
create policy observations_manager_select on public.observations for select using (organisation_id is not null and public.can_manage_workspace(organisation_id) and participant_approved and confidentiality <> 'PRIVATE');
create policy observations_participant_insert on public.observations for insert with check (user_id = auth.uid() and exists(select 1 from public.conversations where id = observations.conversation_id and user_id = auth.uid()));
create policy observations_participant_update on public.observations for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy observations_participant_delete on public.observations for delete using (user_id = auth.uid() and not participant_approved);

create policy themes_manager_all on public.themes for all using (public.can_manage_workspace(organisation_id)) with check (public.can_manage_workspace(organisation_id));
create policy hypotheses_manager_all on public.hypotheses for all using (public.can_manage_workspace(organisation_id)) with check (public.can_manage_workspace(organisation_id));
create policy findings_manager_all on public.findings for all using (public.can_manage_workspace(organisation_id)) with check (public.can_manage_workspace(organisation_id));
create policy follow_up_select on public.follow_up_tasks for select using (assignee_id = auth.uid() or public.can_manage_workspace(organisation_id));
create policy follow_up_manager_insert on public.follow_up_tasks for insert with check (public.can_manage_workspace(organisation_id) and assigned_by = auth.uid() and public.is_workspace_member(organisation_id));
create policy follow_up_manager_update on public.follow_up_tasks for update using (public.can_manage_workspace(organisation_id)) with check (public.can_manage_workspace(organisation_id));
create policy clarification_select on public.follow_up_clarifications for select using (exists(select 1 from public.follow_up_tasks where id = follow_up_clarifications.task_id and (assignee_id = auth.uid() or public.can_manage_workspace(organisation_id))));
create policy clarification_insert on public.follow_up_clarifications for insert with check (author_id = auth.uid() and exists(select 1 from public.follow_up_tasks where id = follow_up_clarifications.task_id and (assignee_id = auth.uid() or public.can_manage_workspace(organisation_id))));

create policy sources_participant_own on public.source_records for all using (user_id = auth.uid()) with check (user_id = auth.uid() and public.is_workspace_member(organisation_id));
create policy sources_manager on public.source_records for all using (public.can_manage_workspace(organisation_id) and (user_id is null or (confidentiality <> 'PRIVATE'))) with check (public.can_manage_workspace(organisation_id));
create policy connections_manager_all on public.integration_connections for all using (public.can_manage_integrations(organisation_id)) with check (public.can_manage_integrations(organisation_id) and connected_by = auth.uid());
create policy sync_runs_manager_all on public.integration_sync_runs for all using (public.can_manage_integrations(organisation_id)) with check (public.can_manage_integrations(organisation_id) and started_by = auth.uid());
create policy audit_member_insert on public.audit_events for insert with check (public.is_workspace_member(organisation_id) and actor_id = auth.uid());
create policy audit_manager_select on public.audit_events for select using (public.can_manage_workspace(organisation_id));

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types) values ('evidence', 'evidence', false, 20971520, array['application/pdf','text/plain','text/csv','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','image/jpeg','image/png','image/webp','audio/webm','audio/mpeg','audio/mp4']) on conflict (id) do nothing;
create policy evidence_owner_insert on storage.objects for insert to authenticated with check (bucket_id = 'evidence' and (storage.foldername(name))[2] = auth.uid()::text);
create policy evidence_owner_select on storage.objects for select to authenticated using (bucket_id = 'evidence' and (storage.foldername(name))[2] = auth.uid()::text);
create policy evidence_owner_delete on storage.objects for delete to authenticated using (bucket_id = 'evidence' and (storage.foldername(name))[2] = auth.uid()::text);

grant execute on function public.create_workspace(text) to authenticated;
grant execute on function public.invitation_preview(text) to anon, authenticated;
grant execute on function public.accept_invitation(text) to authenticated;
grant execute on function public.update_own_follow_up(uuid, public.follow_up_status) to authenticated;
revoke all on function public.is_workspace_member(uuid) from public;
revoke all on function public.can_manage_workspace(uuid) from public;
revoke all on function public.can_manage_people(uuid) from public;
revoke all on function public.can_manage_integrations(uuid) from public;
revoke all on function public.can_view_workspace_profile(uuid) from public;
revoke all on function public.is_workspace_owner(uuid) from public;
revoke all on function public.can_admin_memberships(uuid) from public;
grant execute on function public.is_workspace_member(uuid) to authenticated;
grant execute on function public.can_manage_workspace(uuid) to authenticated;
grant execute on function public.can_manage_people(uuid) to authenticated;
grant execute on function public.can_manage_integrations(uuid) to authenticated;
grant execute on function public.can_view_workspace_profile(uuid) to authenticated;
grant execute on function public.is_workspace_owner(uuid) to authenticated;
grant execute on function public.can_admin_memberships(uuid) to authenticated;
