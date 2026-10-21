begin;
create or replace function public.publishing_rule(workspace uuid,person uuid,publication_kind text)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare r public.publishing_permissions; member_role public.workspace_role; department_key text;
begin
 select role into member_role from public.organisation_memberships where organisation_id=workspace and user_id=person and status='active';
 if member_role is null or publication_kind not in ('mission','policy') then return jsonb_build_object('allowed',false); end if;
 if member_role<>'owner' then
  select * into r from public.publishing_permissions where organisation_id=workspace and user_id=person and kind=publication_kind;
  if found then return jsonb_build_object('allowed',r.allowed,'audience_scope',r.audience_scope,'approval',r.approval,'visibility',r.visibility,'revision',r.revision); end if;
 end if;
 if member_role='owner' or member_role='hr' and publication_kind='policy' then
  return jsonb_build_object('allowed',true,'audience_scope','organisation','approval','none','visibility','management','revision',0);
 end if;
 select d.key into department_key from public.workspace_people p join public.workspace_departments d on d.id=p.department_id
 where p.organisation_id=workspace and p.user_id=person and d.head_user_id=person;
 if member_role in ('manager','hr','consultant') then
  return jsonb_build_object('allowed',member_role<>'consultant' or publication_kind='mission','audience_scope','organisation','approval','owner',
   'visibility',case when department_key is null then 'owners' else 'department' end,'revision',0,'direct_department',department_key);
 end if;
 return jsonb_build_object('allowed',false);
end $$;

create or replace function public.submit_publication(request_id uuid,workspace uuid,publication_kind text,body jsonb,audience_mode text,department_keys text[],individual_ids uuid[])
returns jsonb language plpgsql security definer set search_path=public as $$
declare rule jsonb; previous public.publication_requests; selected uuid[]; own_department uuid; reviewer uuid; next_status text;
begin
 if auth.uid() is null or not public.is_workspace_member(workspace) then raise exception 'Not authorised'; end if;
 perform 1 from public.organisations where id=workspace for update;
 select * into previous from public.publication_requests where id=request_id;
 if found then
  if previous.organisation_id<>workspace or previous.author_id<>auth.uid() then raise exception 'Request ID unavailable'; end if;
  return jsonb_build_object('id',previous.id,'status',previous.status);
 end if;
 rule:=public.publishing_rule(workspace,auth.uid(),publication_kind);
 if (rule->>'allowed')::boolean is distinct from true then raise exception 'Publishing is not enabled for this account'; end if;
 perform public.validate_publication(publication_kind,body);
 if request_id is null or department_keys is null or individual_ids is null or cardinality(department_keys)>50 or cardinality(individual_ids)>200 then raise exception 'Invalid audience'; end if;
 select p.department_id,d.head_user_id into own_department,reviewer from public.workspace_people p left join public.workspace_departments d on d.id=p.department_id where p.organisation_id=workspace and p.user_id=auth.uid();
 if rule->>'audience_scope'='department' and (own_department is null or audience_mode='organisation') then raise exception 'Choose recipients in your assigned department'; end if;
 if rule->>'visibility'='department' and own_department is null then raise exception 'Confirm your department first'; end if;
 if audience_mode='individuals' then select array_agg(distinct u) into selected from unnest(individual_ids) u;
 elsif audience_mode='organisation' then select array_agg(user_id) into selected from public.organisation_memberships where organisation_id=workspace and status='active' and role<>'consultant';
 elsif audience_mode in ('departments','department_heads') then
  if audience_mode='departments' and cardinality(department_keys)=0 then raise exception 'Choose a department'; end if;
  if exists(select 1 from unnest(department_keys) k where not exists(select 1 from public.workspace_departments where organisation_id=workspace and key=k and (rule->>'audience_scope'='organisation' or id=own_department))) then raise exception 'Department outside your publishing scope'; end if;
  select array_agg(distinct m.user_id) into selected from public.organisation_memberships m join public.workspace_people p on p.organisation_id=m.organisation_id and p.user_id=m.user_id join public.workspace_departments d on d.id=p.department_id
   where m.organisation_id=workspace and m.status='active' and m.role<>'consultant' and (cardinality(department_keys)=0 or d.key=any(department_keys))
   and (rule->>'audience_scope'='organisation' or d.id=own_department) and (audience_mode='departments' or d.head_user_id=m.user_id);
 else raise exception 'Choose an audience'; end if;
 if coalesce(cardinality(selected),0) not between 1 and 200 then raise exception 'Choose between 1 and 200 active recipients'; end if;
 if exists(select 1 from unnest(selected) u where not exists(select 1 from public.organisation_memberships where organisation_id=workspace and user_id=u and status='active')
  or rule->>'audience_scope'='department' and not exists(select 1 from public.workspace_people where organisation_id=workspace and user_id=u and department_id=own_department)) then raise exception 'Recipient outside your publishing scope'; end if;
 next_status:=case rule->>'approval' when 'none' then 'publishing' when 'owner' then 'pending_owner' else 'pending_head' end;
 -- A default head may publish directly only to their confirmed department. Wider work still goes to owner approval.
 if rule->>'direct_department' is not null and not exists(select 1 from unnest(selected) u where not exists
  (select 1 from public.workspace_people p join public.workspace_departments d on d.id=p.department_id where p.organisation_id=workspace and p.user_id=u and d.key=rule->>'direct_department')) then next_status:='publishing'; end if;
 if next_status='pending_head' then
  if reviewer=auth.uid() then next_status:='pending_owner';
  elsif reviewer is null or not exists(select 1 from public.organisation_memberships where organisation_id=workspace and user_id=reviewer and status='active') then raise exception 'An active department head must be appointed first'; end if;
 end if;
 insert into public.publication_requests(id,organisation_id,author_id,kind,payload,recipients,rule_snapshot,department_id,head_id,status)
 values(request_id,workspace,auth.uid(),publication_kind,body,selected,rule,own_department,reviewer,next_status);
 if next_status='publishing' then perform public.publish_reviewed_request(request_id); end if;
 insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id) values(workspace,auth.uid(),'publication.submitted','publication_request',request_id);
 return jsonb_build_object('id',request_id,'status',(select status from public.publication_requests where id=request_id));
end $$;
commit;
