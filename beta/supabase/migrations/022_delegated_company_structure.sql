begin;

create or replace function public.save_workspace_department(workspace uuid,target_department uuid,department_name text,head_id uuid)
returns uuid language plpgsql security definer set search_path=public as $$
declare result uuid; department_key text;
begin
  if auth.uid() is null or public.company_access_level(workspace,'structure')<2 then raise exception 'Company structure editing is required to organise departments'; end if;
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
    values(workspace,auth.uid(),'company.department_updated','department',result,jsonb_build_object('head_user_id',head_id));
  return result;
end $$;
revoke all on function public.save_workspace_department(uuid,uuid,text,uuid) from public,anon,authenticated;
grant execute on function public.save_workspace_department(uuid,uuid,text,uuid) to authenticated;

create or replace function public.place_workspace_member(workspace uuid,member_id uuid,department uuid,manager_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null or public.company_access_level(workspace,'structure')<2 then raise exception 'Company structure editing is required to organise people'; end if;
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
    values(workspace,auth.uid(),'company.member_placed','profile',member_id,jsonb_build_object('department_id',department,'reports_to',manager_id));
end $$;
revoke all on function public.place_workspace_member(uuid,uuid,uuid,uuid) from public,anon,authenticated;
grant execute on function public.place_workspace_member(uuid,uuid,uuid,uuid) to authenticated;


-- Directory administration is separate from minimal operational recipient projections.
drop policy workspace_departments_read on public.workspace_departments;
create policy workspace_departments_read on public.workspace_departments for select to authenticated
using(public.company_access_level(organisation_id,'structure')>0);
drop policy workspace_people_read on public.workspace_people;
create policy workspace_people_read on public.workspace_people for select to authenticated
using(public.company_access_level(organisation_id,'structure')>0 or user_id=auth.uid() and public.is_workspace_member(organisation_id));

create or replace function public.can_admin_memberships(workspace_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select public.company_access_level(workspace_id,'people')=2 and public.company_access_level(workspace_id,'access')=2;
$$;

-- Rule editors cannot edit themselves or grant working authority they do not possess.
create or replace function public.set_publishing_permission(workspace uuid,person uuid,publication_kind text,can_publish boolean,recipient_scope text,approval_sequence text,result_visibility text)
returns void language plpgsql security definer set search_path=public as $$
declare own_rule jsonb;
begin
 perform 1 from public.organisations where id=workspace for update;
 if auth.uid() is null or public.company_access_level(workspace,'access')<2 then raise exception 'Access administration is required'; end if;
 if person=auth.uid() then raise exception 'An administrator cannot change their own publishing rights'; end if;
 if not exists(select 1 from public.organisation_memberships where organisation_id=workspace and user_id=person and status='active' and role<>'owner') then raise exception 'Choose an active non-owner member'; end if;
 own_rule:=public.publishing_rule(workspace,auth.uid(),publication_kind);
 if not public.is_workspace_owner(workspace) and (
   (own_rule->>'allowed')::boolean is distinct from true
   or recipient_scope='organisation' and own_rule->>'audience_scope'<>'organisation'
   or own_rule->>'approval'<>'none' and approval_sequence is distinct from own_rule->>'approval'
   or result_visibility is distinct from own_rule->>'visibility'
 ) then raise exception 'Cannot delegate beyond your own publishing authority'; end if;
 insert into public.publishing_permissions(organisation_id,user_id,kind,allowed,audience_scope,approval,visibility)
 values(workspace,person,publication_kind,can_publish,recipient_scope,approval_sequence,result_visibility)
 on conflict(organisation_id,user_id,kind) do update set allowed=excluded.allowed,audience_scope=excluded.audience_scope,approval=excluded.approval,visibility=excluded.visibility,revision=publishing_permissions.revision+1;
 insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata)
 values(workspace,auth.uid(),'company.publishing_permission_changed','profile',person,jsonb_build_object('kind',publication_kind,'allowed',can_publish,'scope',recipient_scope,'approval',approval_sequence,'visibility',result_visibility));
end $$;
drop policy publishing_permissions_read on public.publishing_permissions;
create policy publishing_permissions_read on public.publishing_permissions for select to authenticated
using(public.company_access_level(organisation_id,'access')>0 or user_id=auth.uid() and public.is_workspace_member(organisation_id));

-- Extra directory access does not confer access to mission intelligence or private evidence.
commit;

