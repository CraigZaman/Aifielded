begin;

create table public.publishing_permissions (
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null,
  kind text not null check(kind in ('mission','policy')),
  allowed boolean not null default false,
  audience_scope text not null check(audience_scope in ('department','organisation')),
  approval text not null check(approval in ('none','owner','head_then_owner')),
  visibility text not null check(visibility in ('owners','department','management')),
  revision bigint not null default 1,
  primary key(organisation_id,user_id,kind),
  foreign key(organisation_id,user_id) references public.organisation_memberships(organisation_id,user_id) on delete cascade
);
create table public.publication_requests (
  id uuid primary key,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check(kind in ('mission','policy')),
  payload jsonb not null,
  recipients uuid[] not null,
  rule_snapshot jsonb not null,
  department_id uuid references public.workspace_departments(id),
  head_id uuid references public.profiles(id) on delete set null,
  status text not null check(status in ('pending_head','pending_owner','publishing','published','rejected')),
  head_approved_by uuid references public.profiles(id) on delete set null,
  decided_by uuid references public.profiles(id) on delete set null,
  decision_note text not null default '',
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
create index publication_requests_queue on public.publication_requests(organisation_id,status,created_at);
create table public.mission_visibility (
  mission_id uuid primary key references public.missions(id) on delete cascade,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  scope text not null check(scope in ('owners','department','management')),
  department_id uuid references public.workspace_departments(id)
);
alter table public.publishing_permissions enable row level security;
alter table public.publication_requests enable row level security;
alter table public.mission_visibility enable row level security;
revoke all on public.publishing_permissions,public.publication_requests,public.mission_visibility from public,anon,authenticated;
grant select on public.publishing_permissions,public.publication_requests,public.mission_visibility to authenticated;
grant all on public.publishing_permissions,public.publication_requests,public.mission_visibility to service_role;
create function public.can_review_publication(request_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.publication_requests r where r.id=request_id and public.is_workspace_member(r.organisation_id) and
    (public.is_workspace_owner(r.organisation_id) or r.head_id=auth.uid() and exists(select 1 from public.workspace_departments d where d.id=r.department_id and d.organisation_id=r.organisation_id and d.head_user_id=auth.uid())));
$$;
revoke all on function public.can_review_publication(uuid) from public,anon,authenticated;
grant execute on function public.can_review_publication(uuid) to authenticated;
create policy publishing_permissions_read on public.publishing_permissions for select to authenticated using(public.is_workspace_owner(organisation_id) or user_id=auth.uid() and public.is_workspace_member(organisation_id));
create policy publication_requests_read on public.publication_requests for select to authenticated using(public.is_workspace_member(organisation_id) and (author_id=auth.uid() or public.can_review_publication(id)));
create policy mission_visibility_read on public.mission_visibility for select to authenticated using(public.is_workspace_owner(organisation_id));

create function public.publishing_rule(workspace uuid,person uuid,publication_kind text)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare r public.publishing_permissions; member_role public.workspace_role;
begin
  select role into member_role from public.organisation_memberships where organisation_id=workspace and user_id=person and status='active';
  if member_role is null then return jsonb_build_object('allowed',false); end if;
  if member_role<>'owner' then
    select * into r from public.publishing_permissions where organisation_id=workspace and user_id=person and kind=publication_kind;
    if found then return jsonb_build_object('allowed',r.allowed,'audience_scope',r.audience_scope,'approval',r.approval,'visibility',r.visibility,'revision',r.revision); end if;
  end if;
  return jsonb_build_object('allowed',member_role='owner' or publication_kind='mission' and member_role in ('manager','hr','consultant') or publication_kind='policy' and member_role in ('manager','hr'),
    'audience_scope','organisation','approval','none','visibility','management','revision',0);
end $$;
revoke all on function public.publishing_rule(uuid,uuid,text) from public,anon,authenticated;

create function public.my_publishing_rule(workspace uuid,publication_kind text)
returns jsonb language sql stable security definer set search_path=public as $$
  select public.publishing_rule(workspace,auth.uid(),publication_kind);
$$;
revoke all on function public.my_publishing_rule(uuid,text) from public,anon,authenticated;
grant execute on function public.my_publishing_rule(uuid,text) to authenticated;

create function public.set_publishing_permission(workspace uuid,person uuid,publication_kind text,can_publish boolean,recipient_scope text,approval_sequence text,result_visibility text)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.is_workspace_owner(workspace) or auth.uid() is null then raise exception 'Only the workspace owner can set publishing permissions'; end if;
  perform 1 from public.organisations where id=workspace for update;
  if not exists(select 1 from public.organisation_memberships where organisation_id=workspace and user_id=person and status='active' and role<>'owner') then raise exception 'Choose an active non-owner member'; end if;
  insert into public.publishing_permissions(organisation_id,user_id,kind,allowed,audience_scope,approval,visibility)
    values(workspace,person,publication_kind,can_publish,recipient_scope,approval_sequence,result_visibility)
    on conflict(organisation_id,user_id,kind) do update set allowed=excluded.allowed,audience_scope=excluded.audience_scope,approval=excluded.approval,visibility=excluded.visibility,revision=publishing_permissions.revision+1;
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata)
    values(workspace,auth.uid(),'publishing.permission_changed','profile',person,jsonb_build_object('kind',publication_kind,'allowed',can_publish,'approval',approval_sequence,'visibility',result_visibility));
end $$;
revoke all on function public.set_publishing_permission(uuid,uuid,text,boolean,text,text,text) from public,anon,authenticated;
grant execute on function public.set_publishing_permission(uuid,uuid,text,boolean,text,text,text) to authenticated;

-- This projection grants a publisher only the names and department keys needed to address a discussion.
create function public.publishing_directory(workspace uuid,publication_kind text)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare rule jsonb; own_department uuid; people jsonb; departments jsonb;
begin
  rule:=public.publishing_rule(workspace,auth.uid(),publication_kind);
  if auth.uid() is null or (rule->>'allowed')::boolean is distinct from true then raise exception 'Publishing is not enabled for this account'; end if;
  select department_id into own_department from public.workspace_people where organisation_id=workspace and user_id=auth.uid();
  select coalesce(jsonb_agg(jsonb_build_object('id',m.user_id,'name',p.full_name,'role',m.role,'department',coalesce(d.key,'')) order by p.full_name),'[]') into people
    from public.organisation_memberships m join public.profiles p on p.id=m.user_id
    left join public.workspace_people w on w.organisation_id=m.organisation_id and w.user_id=m.user_id
    left join public.workspace_departments d on d.id=w.department_id
    where m.organisation_id=workspace and m.status='active' and (rule->>'audience_scope'='organisation' or w.department_id=own_department);
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'key',key,'name',name,'headUserId',head_user_id) order by name),'[]') into departments
    from public.workspace_departments where organisation_id=workspace and (rule->>'audience_scope'='organisation' or id=own_department);
  return jsonb_build_object('members',people,'departments',departments,'rule',rule);
end $$;
revoke all on function public.publishing_directory(uuid,text) from public,anon,authenticated;
grant execute on function public.publishing_directory(uuid,text) to authenticated;

create function public.validate_publication(publication_kind text,body jsonb)
returns void language plpgsql immutable set search_path=public as $$
declare q jsonb; v text;
begin
  if jsonb_typeof(body) is distinct from 'object' or char_length(trim(coalesce(body->>'title',''))) not between 4 and 120 then raise exception 'Complete the title'; end if;
  if publication_kind='mission' then
    if char_length(trim(coalesce(body->>'objective',''))) not between 20 and 2000 or char_length(coalesce(body->>'context',''))>4000 or char_length(trim(coalesce(body->>'desiredOutcome',''))) not between 8 and 1000 then raise exception 'Complete the mission brief'; end if;
  elsif publication_kind='policy' then
    if char_length(trim(coalesce(body->>'version',''))) not between 1 and 80 or char_length(trim(coalesce(body->>'policyText',''))) not between 80 and 24000
      or char_length(trim(coalesce(body->>'briefing',''))) not between 20 and 3000 or char_length(coalesce(body->>'sourceName',''))>200
      or jsonb_typeof(body->'questions') is distinct from 'array' or jsonb_array_length(body->'questions')<>3 then raise exception 'Complete the reviewed policy'; end if;
    for q in select value from jsonb_array_elements(body->'questions') loop
      if char_length(trim(coalesce(q->>'question',''))) not between 8 and 500 or jsonb_typeof(q->'options') is distinct from 'array' or jsonb_array_length(q->'options')<>3
        or jsonb_typeof(q->'correctIndex') is distinct from 'number' or (q->>'correctIndex') !~ '^[012]$'
        or char_length(trim(coalesce(q->>'explanation',''))) not between 8 and 1000 or char_length(trim(coalesce(q->>'sourceQuote',''))) not between 8 and 500
        or strpos(body->>'policyText',q->>'sourceQuote')=0 then raise exception 'Questions must be grounded in the policy'; end if;
      if exists(select 1 from jsonb_array_elements(q->'options') x where jsonb_typeof(x)<>'string') then raise exception 'Answer options must be text'; end if;
      for v in select value from jsonb_array_elements_text(q->'options') loop if char_length(trim(v)) not between 1 and 300 then raise exception 'Invalid answer option'; end if; end loop;
      if (select count(distinct lower(trim(value))) from jsonb_array_elements_text(q->'options'))<>3 then raise exception 'Answer options must differ'; end if;
    end loop;
  else raise exception 'Choose a mission or policy'; end if;
end $$;
revoke all on function public.validate_publication(text,jsonb) from public,anon,authenticated;

create function public.publish_reviewed_request(request_id uuid)
returns void language plpgsql security definer set search_path=public as $$
declare r public.publication_requests; current_rule jsonb; participant uuid; assignment uuid; safe_questions jsonb; own_department uuid;
begin
  select * into r from public.publication_requests where id=request_id for update;
  if r.status is distinct from 'publishing' then raise exception 'Publication has not been approved'; end if;
  current_rule:=public.publishing_rule(r.organisation_id,r.author_id,r.kind);
  if current_rule is distinct from r.rule_snapshot or (current_rule->>'allowed')::boolean is distinct from true then raise exception 'Publishing permissions changed. Submit a fresh request'; end if;
  select department_id into own_department from public.workspace_people where organisation_id=r.organisation_id and user_id=r.author_id;
  if (current_rule->>'audience_scope'='department' or current_rule->>'visibility'='department') and own_department is distinct from r.department_id then raise exception 'Department changed. Submit a fresh request'; end if;
  if exists(select 1 from unnest(r.recipients) u where not exists(select 1 from public.organisation_memberships m where m.organisation_id=r.organisation_id and m.user_id=u and m.status='active')
    or current_rule->>'audience_scope'='department' and not exists(select 1 from public.workspace_people p where p.organisation_id=r.organisation_id and p.user_id=u and p.department_id=r.department_id)) then raise exception 'Recipient access changed. Submit a fresh request'; end if;
  perform public.validate_publication(r.kind,r.payload);
  insert into public.missions(id,organisation_id,created_by,title,objective,context,desired_outcome,departments,status)
    values(r.id,r.organisation_id,r.author_id,trim(r.payload->>'title'),case when r.kind='mission' then r.payload->>'objective' else 'Review this policy, discuss questions and complete the three-question understanding check.' end,
    case when r.kind='mission' then r.payload->>'context' else r.payload->>'briefing' end,
    case when r.kind='mission' then r.payload->>'desiredOutcome' else 'Record acknowledgement, checked understanding and explicitly shared concerns.' end,'{}','active');
  insert into public.mission_visibility values(r.id,r.organisation_id,r.rule_snapshot->>'visibility',r.department_id);
  if r.kind='policy' then
    select jsonb_agg(jsonb_build_object('question',q->>'question','options',q->'options')) into safe_questions from jsonb_array_elements(r.payload->'questions') q;
    insert into public.policy_communications values(r.id,r.organisation_id,r.payload->>'version',r.payload->>'policyText',r.payload->>'briefing',coalesce(r.payload->>'sourceName',''),safe_questions,now());
    insert into public.policy_answer_keys values(r.id,r.payload->'questions');
  end if;
  foreach participant in array r.recipients loop
    insert into public.mission_assignments(organisation_id,mission_id,user_id) values(r.organisation_id,r.id,participant) returning id into assignment;
    insert into public.work_notifications(organisation_id,recipient_id,kind,entity_id) values(r.organisation_id,participant,'mission_assigned',assignment);
  end loop;
  update public.publication_requests set status='published',decided_at=now(),decided_by=auth.uid() where id=r.id;
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata)
    values(r.organisation_id,auth.uid(),'publication.published','mission',r.id,jsonb_build_object('author',r.author_id,'recipients',cardinality(r.recipients),'approval',r.rule_snapshot->>'approval'));
end $$;
revoke all on function public.publish_reviewed_request(uuid) from public,anon,authenticated,service_role;

create function public.submit_publication(request_id uuid,workspace uuid,publication_kind text,body jsonb,audience_mode text,department_keys text[],individual_ids uuid[])
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
  if (rule->>'allowed')::boolean is distinct from true then raise exception 'The owner has not enabled this type of publication for your account'; end if;
  perform public.validate_publication(publication_kind,body);
  if request_id is null or department_keys is null or individual_ids is null or cardinality(department_keys)>50 or cardinality(individual_ids)>200 then raise exception 'Invalid audience'; end if;
  select p.department_id,d.head_user_id into own_department,reviewer from public.workspace_people p left join public.workspace_departments d on d.id=p.department_id where p.organisation_id=workspace and p.user_id=auth.uid();
  if rule->>'audience_scope'='department' and (own_department is null or audience_mode='organisation') then raise exception 'Choose recipients in your assigned department'; end if;
  if rule->>'visibility'='department' and own_department is null then raise exception 'Ask the owner to confirm your department first'; end if;
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
  if exists(select 1 from unnest(selected) u where not exists(select 1 from public.organisation_memberships where organisation_id=workspace and user_id=u and status='active') or rule->>'audience_scope'='department' and not exists(select 1 from public.workspace_people where organisation_id=workspace and user_id=u and department_id=own_department)) then raise exception 'Recipient outside your publishing scope'; end if;
  next_status:=case rule->>'approval' when 'none' then 'publishing' when 'owner' then 'pending_owner' else 'pending_head' end;
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
revoke all on function public.submit_publication(uuid,uuid,text,jsonb,text,text[],uuid[]) from public,anon,authenticated;
grant execute on function public.submit_publication(uuid,uuid,text,jsonb,text,text[],uuid[]) to authenticated;

create function public.decide_publication(request_id uuid,approve boolean,note text)
returns text language plpgsql security definer set search_path=public as $$
declare r public.publication_requests; workspace uuid;
begin
  select organisation_id into workspace from public.publication_requests where id=request_id;
  if auth.uid() is null or not public.is_workspace_member(workspace) then raise exception 'Not authorised'; end if;
  perform 1 from public.organisations where id=workspace for update;
  select * into r from public.publication_requests where id=request_id for update;
  if not public.can_review_publication(r.id) or r.author_id=auth.uid() then raise exception 'An independent reviewer is required'; end if;
  if r.status in ('published','rejected') then return r.status; end if;
  if approve is null or char_length(coalesce(note,''))>1000 then raise exception 'Invalid decision'; end if;
  if not approve then
    update public.publication_requests set status='rejected',decided_by=auth.uid(),decided_at=now(),decision_note=coalesce(note,'') where id=r.id;
  elsif r.status='pending_head' then
    if r.head_id is distinct from auth.uid() or not exists(select 1 from public.workspace_departments where id=r.department_id and organisation_id=workspace and head_user_id=auth.uid()) then raise exception 'The appointed department head must review first'; end if;
    update public.publication_requests set status='pending_owner',head_approved_by=auth.uid() where id=r.id;
  elsif r.status='pending_owner' then
    if not public.is_workspace_owner(workspace) then raise exception 'Owner approval is required'; end if;
    update public.publication_requests set status='publishing',decision_note=coalesce(note,'') where id=r.id;
    perform public.publish_reviewed_request(r.id);
  else raise exception 'Request is not pending'; end if;
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata) values(workspace,auth.uid(),'publication.reviewed','publication_request',r.id,jsonb_build_object('approved',approve));
  return (select status from public.publication_requests where id=r.id);
end $$;
revoke all on function public.decide_publication(uuid,boolean,text) from public,anon,authenticated;
grant execute on function public.decide_publication(uuid,boolean,text) to authenticated;

-- Legacy launch routes cannot bypass an explicit owner-set publishing rule.
create function public.guard_publication_scope()
returns trigger language plpgsql security definer set search_path=public as $$
declare mission uuid; workspace uuid; publishing boolean;
begin
  if auth.uid() is null then return new; end if;
  mission:=case when tg_table_name='missions' then (to_jsonb(new)->>'id')::uuid else (to_jsonb(new)->>'mission_id')::uuid end;
  if mission is null then return new; end if;
  workspace:=new.organisation_id;
  publishing:=exists(select 1 from public.publication_requests where id=mission and organisation_id=workspace and status='publishing');
  if tg_table_name='missions' and tg_op='INSERT' then
    if not publishing and not public.is_workspace_owner(workspace) and exists(select 1 from public.publishing_permissions where organisation_id=workspace and user_id=auth.uid()) then raise exception 'Use the publishing approval workflow'; end if;
  elsif exists(select 1 from public.publication_requests where id=mission and organisation_id=workspace) then
    if tg_table_name='invitations' then raise exception 'Reviewed publications use named recipients, not shareable links'; end if;
    if not publishing and not public.is_workspace_owner(workspace) then raise exception 'Only the owner can change an approved publication'; end if;
  end if;
  return new;
end $$;
create trigger publication_mission_guard before insert or update on public.missions for each row execute function public.guard_publication_scope();
create trigger publication_assignment_guard before insert on public.mission_assignments for each row execute function public.guard_publication_scope();
create trigger publication_invite_guard before insert on public.invitations for each row execute function public.guard_publication_scope();
revoke all on function public.guard_publication_scope() from public,anon,authenticated;

create function public.publication_recipient_names(request_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare r public.publication_requests; result jsonb;
begin
  select * into r from public.publication_requests where id=request_id;
  if auth.uid() is null or not public.is_workspace_member(r.organisation_id) or not (r.author_id=auth.uid() or public.can_review_publication(r.id)) then raise exception 'Request unavailable'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',u,'name',coalesce(p.full_name,'Former member'),'active',coalesce(m.status='active',false)) order by p.full_name),'[]') into result
    from unnest(r.recipients) u left join public.profiles p on p.id=u left join public.organisation_memberships m on m.organisation_id=r.organisation_id and m.user_id=u;
  return result;
end $$;
revoke all on function public.publication_recipient_names(uuid) from public,anon,authenticated;
grant execute on function public.publication_recipient_names(uuid) to authenticated;

commit;
