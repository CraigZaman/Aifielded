begin;
alter table public.invitations add column department_id uuid references public.workspace_departments(id),add column reports_to uuid references public.profiles(id);

create function public.can_invite_team(workspace uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select public.is_workspace_member(workspace) and (public.is_workspace_owner(workspace) or public.company_access_level(workspace,'people')=2
 or exists(select 1 from public.organisation_memberships where organisation_id=workspace and user_id=auth.uid() and role='hr' and status='active')
 or exists(select 1 from public.workspace_departments where organisation_id=workspace and head_user_id=auth.uid()));
$$;
create or replace function public.can_issue_invitation(workspace_id uuid,target_role public.workspace_role,target_mission uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select target_role<>'owner' and public.is_workspace_member(workspace_id) and (
 target_mission is not null and target_role='participant' and public.can_manage_workspace(workspace_id)
 and exists(select 1 from public.missions where id=target_mission and organisation_id=workspace_id)
 or target_mission is null and (public.is_workspace_owner(workspace_id) or target_role='participant' and public.can_invite_team(workspace_id)));
$$;
create function public.guard_team_invitation()
returns trigger language plpgsql security definer set search_path=public as $$
declare broad boolean;
begin
 if new.mission_id is not null then return new; end if;
 if auth.uid() is null or not public.can_issue_invitation(new.organisation_id,new.role,null) then raise exception 'Team invitation is not authorised'; end if;
 broad:=public.is_workspace_owner(new.organisation_id) or public.company_access_level(new.organisation_id,'people')=2
 or exists(select 1 from public.organisation_memberships where organisation_id=new.organisation_id and user_id=auth.uid() and role='hr' and status='active');
 if new.department_id is not null and not exists(select 1 from public.workspace_departments where organisation_id=new.organisation_id and id=new.department_id) then raise exception 'Choose a company department'; end if;
 if not broad and not exists(select 1 from public.workspace_departments where organisation_id=new.organisation_id and id=new.department_id and head_user_id=auth.uid()) then raise exception 'Department heads may invite only to their own team'; end if;
 if new.reports_to is not null and not exists(select 1 from public.organisation_memberships where organisation_id=new.organisation_id and user_id=new.reports_to and status='active' and role<>'consultant') then raise exception 'Choose an active reporting manager'; end if;
 if not broad then new.reports_to:=auth.uid(); end if;
 return new;
end $$;
create trigger enforce_team_invitation_scope before insert on public.invitations for each row execute function public.guard_team_invitation();
revoke all on function public.guard_team_invitation() from public,anon,authenticated;

alter function public.accept_invitation(text) rename to accept_invitation_v003;
revoke all on function public.accept_invitation_v003(text) from public,anon,authenticated,service_role;
create function public.accept_invitation(raw_token text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare result jsonb; invite public.invitations; new_member boolean;
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 select * into invite from public.invitations where token_digest=encode(extensions.digest(raw_token,'sha256'),'hex') for update;
 new_member:=not exists(select 1 from public.organisation_memberships where user_id=auth.uid());
 result:=public.accept_invitation_v003(raw_token);
 if new_member and invite.mission_id is null then
  insert into public.workspace_people(organisation_id,user_id,department_id,reports_to,confirmed_by)
  values(invite.organisation_id,auth.uid(),invite.department_id,case when exists(select 1 from public.organisation_memberships where organisation_id=invite.organisation_id and user_id=invite.reports_to and status='active') then invite.reports_to else null end,invite.created_by)
  on conflict(organisation_id,user_id) do nothing;
 end if;
 return result;
end $$;

create function public.team_onboarding_directory(workspace uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare broad boolean; members jsonb; departments jsonb; invitations jsonb;
begin
 if not public.can_invite_team(workspace) and public.company_access_level(workspace,'people')<1 then raise exception 'People access is not enabled'; end if;
 broad:=public.company_access_level(workspace,'people')>0 or exists(select 1 from public.organisation_memberships where organisation_id=workspace and user_id=auth.uid() and status='active' and role='hr');
 select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'user_id',m.user_id,'name',p.full_name,'role',m.role,'status',m.status,'department_id',w.department_id) order by p.full_name),'[]') into members
 from public.organisation_memberships m join public.profiles p on p.id=m.user_id left join public.workspace_people w on w.organisation_id=m.organisation_id and w.user_id=m.user_id
 where m.organisation_id=workspace and (broad or exists(select 1 from public.workspace_departments d where d.id=w.department_id and d.organisation_id=workspace and d.head_user_id=auth.uid()));
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name,'head_user_id',head_user_id) order by name),'[]') into departments from public.workspace_departments where organisation_id=workspace and (broad or head_user_id=auth.uid());
 select coalesce(jsonb_agg(jsonb_build_object('id',id,'role',role,'email',invited_email,'expires_at',expires_at) order by created_at desc),'[]') into invitations
 from public.invitations where organisation_id=workspace and mission_id is null and status='active' and uses_count=0 and expires_at>now() and (broad or created_by=auth.uid());
 return jsonb_build_object('members',members,'departments',departments,'invitations',invitations,'canInvite',public.can_invite_team(workspace));
end $$;

create function public.transfer_workspace_ownership(workspace uuid,new_owner uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
 perform 1 from public.organisations where id=workspace for update;
 if auth.uid() is null or not public.is_workspace_owner(workspace) or new_owner=auth.uid() then raise exception 'Only the current owner may transfer to another member'; end if;
 if not exists(select 1 from public.organisation_memberships where organisation_id=workspace and user_id=new_owner and status='active') then raise exception 'The new owner must first accept their invitation'; end if;
 update public.organisation_memberships set role='owner' where organisation_id=workspace and user_id=new_owner;
 update public.organisation_memberships set role='participant' where organisation_id=workspace and user_id=auth.uid();
 delete from public.company_access_grants where organisation_id=workspace and user_id=auth.uid();
 insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata) values(workspace,auth.uid(),'company.ownership_transferred','profile',new_owner,jsonb_build_object('previous_owner',auth.uid()));
end $$;
revoke all on function public.can_invite_team(uuid),public.accept_invitation(text),public.team_onboarding_directory(uuid),public.transfer_workspace_ownership(uuid,uuid) from public,anon,authenticated;
grant execute on function public.can_invite_team(uuid),public.accept_invitation(text),public.team_onboarding_directory(uuid),public.transfer_workspace_ownership(uuid,uuid) to authenticated;
commit;
