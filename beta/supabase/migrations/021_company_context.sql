begin;

create table public.company_access_grants (
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  area text not null check(area in ('profile','sources','structure','people','access')),
  level integer not null check(level between 0 and 2),
  granted_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key(organisation_id,user_id,area)
);
create function public.company_access_level(workspace uuid,section_name text)
returns integer language sql stable security definer set search_path=public as $$
  select case when not public.is_workspace_member(workspace) then 0
    when public.is_workspace_owner(workspace) and section_name in ('profile','sources','structure','people','access') then 2
    else coalesce((select level from public.company_access_grants where organisation_id=workspace and user_id=auth.uid() and area=section_name),0) end
$$;
create function public.my_company_access(workspace uuid)
returns jsonb language sql stable security definer set search_path=public as $$
  select jsonb_object_agg(area,public.company_access_level(workspace,area))
  from unnest(array['profile','sources','structure','people','access']) area
$$;
revoke all on function public.company_access_level(uuid,text),public.my_company_access(uuid) from public,anon,authenticated;
grant execute on function public.company_access_level(uuid,text),public.my_company_access(uuid) to authenticated;

alter table public.company_access_grants enable row level security;
revoke all on public.company_access_grants from public,anon,authenticated;
grant select on public.company_access_grants to authenticated;
grant all on public.company_access_grants to service_role;
create policy company_grants_read on public.company_access_grants for select to authenticated
  using(public.is_workspace_member(organisation_id) and (user_id=auth.uid() or public.company_access_level(organisation_id,'access')>0));

create function public.set_company_access(workspace uuid,person uuid,section_name text,access_level integer)
returns void language plpgsql security definer set search_path=public as $$
declare current_level integer;
begin
  perform 1 from public.organisations where id=workspace for update;
  if public.company_access_level(workspace,'access')<2 or person=auth.uid() then raise exception 'An authorised administrator must change another member access'; end if;
  if section_name not in ('profile','sources','structure','people','access') or access_level not between 0 and 2 then raise exception 'Invalid access choice'; end if;
  if not exists(select 1 from public.organisation_memberships where organisation_id=workspace and user_id=person and status='active' and role<>'owner') then raise exception 'Choose an active non-owner member'; end if;
  select coalesce(level,0) into current_level from public.company_access_grants where organisation_id=workspace and user_id=person and area=section_name;
  if greatest(access_level,coalesce(current_level,0))>public.company_access_level(workspace,section_name) then raise exception 'You cannot administer permissions beyond your own grant'; end if;
  insert into public.company_access_grants(organisation_id,user_id,area,level,granted_by) values(workspace,person,section_name,access_level,auth.uid())
    on conflict(organisation_id,user_id,area) do update set level=excluded.level,granted_by=auth.uid(),updated_at=now();
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata)
    values(workspace,auth.uid(),'company.access_changed','profile',person,jsonb_build_object('area',section_name,'before',coalesce(current_level,0),'after',access_level));
end $$;
revoke all on function public.set_company_access(uuid,uuid,text,integer) from public,anon,authenticated;
grant execute on function public.set_company_access(uuid,uuid,text,integer) to authenticated;

create table public.company_profiles (
  organisation_id uuid primary key references public.organisations(id) on delete cascade,
  details jsonb not null default '{}',
  revision integer not null default 1,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  check(jsonb_typeof(details)='object' and octet_length(details::text)<=40000)
);
create table public.company_documents (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  title text not null check(char_length(trim(title)) between 2 and 160),
  version text not null default '1' check(char_length(version) between 1 and 80),
  category text not null check(category in ('handbook','policy','process','presentation','annual_report','product','other')),
  content text not null check(char_length(content) between 1 and 50000),
  visibility text not null default 'administrators' check(visibility in ('company','administrators')),
  status text not null default 'draft' check(status in ('draft','approved','archived')),
  source_name text check(char_length(source_name)<=300),
  storage_path text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  check((status='approved')=(approved_by is not null and approved_at is not null))
);
create index company_documents_workspace on public.company_documents(organisation_id,status,created_at desc);
alter table public.company_profiles enable row level security;
alter table public.company_documents enable row level security;
revoke all on public.company_profiles,public.company_documents from public,anon,authenticated;
grant select on public.company_profiles,public.company_documents to authenticated;
grant all on public.company_profiles,public.company_documents to service_role;
create policy company_profile_read on public.company_profiles for select to authenticated using(public.company_access_level(organisation_id,'profile')>0);
create policy company_documents_read on public.company_documents for select to authenticated using(public.company_access_level(organisation_id,'profile')>0);

create function public.save_company_profile(workspace uuid,expected_revision integer,profile_details jsonb)
returns integer language plpgsql security definer set search_path=public as $$
declare current_revision integer; item record;
begin
  perform 1 from public.organisations where id=workspace for update;
  if public.company_access_level(workspace,'profile')<2 then raise exception 'Company profile editing is not enabled'; end if;
  if jsonb_typeof(profile_details) is distinct from 'object' or octet_length(profile_details::text)>40000 then raise exception 'Invalid company profile'; end if;
  for item in select * from jsonb_each(profile_details) loop
    if item.key not in ('company_name','logo_url','description','website','industry','mission','vision','products','markets','locations','processes','terminology','linkedin','social_links')
      or jsonb_typeof(item.value)<>'string' or char_length(item.value#>>'{}')>4000 then raise exception 'Invalid company profile field'; end if;
    if item.key in ('website','linkedin','logo_url') and item.value#>>'{}'<>'' and (item.value#>>'{}') !~ '^https?://[^[:space:]]+$' then raise exception 'Use an HTTP or HTTPS address'; end if;
  end loop;
  select revision into current_revision from public.company_profiles where organisation_id=workspace;
  if coalesce(current_revision,0)<>expected_revision then raise exception 'The profile changed. Reload before saving'; end if;
  if profile_details ? 'company_name' then
    if char_length(trim(profile_details->>'company_name')) not between 2 and 100 then raise exception 'Company name must be 2 to 100 characters'; end if;
    update public.organisations set name=trim(profile_details->>'company_name') where id=workspace;
  end if;
  insert into public.company_profiles(organisation_id,details,updated_by) values(workspace,profile_details,auth.uid())
    on conflict(organisation_id) do update set details=excluded.details,revision=company_profiles.revision+1,updated_by=auth.uid(),updated_at=now()
    returning revision into current_revision;
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata)
    values(workspace,auth.uid(),'company.profile_saved','organisation',workspace,jsonb_build_object('revision',current_revision));
  return current_revision;
end $$;

create function public.add_company_document(workspace uuid,request_id uuid,document_title text,document_version text,document_category text,document_content text,document_visibility text,source_filename text,object_path text default null)
returns uuid language plpgsql security definer set search_path=public as $$
begin
  if public.company_access_level(workspace,'profile')<2 then raise exception 'Company library editing is not enabled'; end if;
  if object_path is not null and object_path<>workspace::text||'/'||auth.uid()::text||'/'||request_id::text then raise exception 'Invalid document storage path'; end if;
  if exists(select 1 from public.company_documents where id=request_id) then
    if exists(select 1 from public.company_documents where id=request_id and organisation_id=workspace and created_by=auth.uid()) then return request_id; end if;
    raise exception 'Document reference unavailable';
  end if;
  insert into public.company_documents(id,organisation_id,title,version,category,content,visibility,source_name,storage_path,created_by)
    values(request_id,workspace,trim(document_title),document_version,document_category,document_content,document_visibility,source_filename,object_path,auth.uid());
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id) values(workspace,auth.uid(),'company.document_added','company_document',request_id);
  return request_id;
end $$;
create function public.review_company_document(document_id uuid,decision text)
returns void language plpgsql security definer set search_path=public as $$
declare workspace uuid;
begin
  select organisation_id into workspace from public.company_documents where id=document_id for update;
  if public.company_access_level(workspace,'profile')<2 or decision not in ('approved','archived') then raise exception 'Document review is not enabled'; end if;
  update public.company_documents set status=decision,approved_by=case when decision='approved' then auth.uid() end,approved_at=case when decision='approved' then now() end where id=document_id;
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata) values(workspace,auth.uid(),'company.document_reviewed','company_document',document_id,jsonb_build_object('status',decision));
end $$;
revoke all on function public.save_company_profile(uuid,integer,jsonb),public.add_company_document(uuid,uuid,text,text,text,text,text,text,text),public.review_company_document(uuid,text) from public,anon,authenticated;
grant execute on function public.save_company_profile(uuid,integer,jsonb),public.add_company_document(uuid,uuid,text,text,text,text,text,text,text),public.review_company_document(uuid,text) to authenticated;

-- This bounded projection is the company knowledge available for ordinary employee dialogue.
create function public.company_dialogue_context(workspace uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare profile jsonb; documents jsonb;
begin
  if not public.is_workspace_member(workspace) then raise exception 'Workspace unavailable'; end if;
  select details into profile from public.company_profiles where organisation_id=workspace;
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'title',title,'version',version,'content',left(content,2000),'approved_at',approved_at)),'[]') into documents
    from (select * from public.company_documents where organisation_id=workspace and status='approved' and visibility='company' order by approved_at desc,id limit 8) d;
  return jsonb_build_object('company',coalesce(profile,'{}'),'documents',documents);
end $$;
revoke all on function public.company_dialogue_context(uuid) from public,anon,authenticated;
grant execute on function public.company_dialogue_context(uuid) to authenticated;

create table public.personal_context (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  details jsonb not null default '{}',
  use_for_dialogue boolean not null default false,
  updated_at timestamptz not null default now(),
  check(jsonb_typeof(details)='object' and octet_length(details::text)<=24000)
);
alter table public.personal_context enable row level security;
revoke all on public.personal_context from public,anon,authenticated;
grant select on public.personal_context to authenticated;
grant all on public.personal_context to service_role;
create policy personal_context_own on public.personal_context for select to authenticated using(user_id=auth.uid());
create function public.save_personal_context(profile_details jsonb,allow_dialogue boolean)
returns void language plpgsql security definer set search_path=public as $$
declare item record;
begin
  if auth.uid() is null or jsonb_typeof(profile_details) is distinct from 'object' or octet_length(profile_details::text)>24000 or allow_dialogue is null then raise exception 'Invalid personal profile'; end if;
  for item in select * from jsonb_each(profile_details) loop
    if item.key not in ('bio','linkedin','social_links','skills','goals','responsibilities','workplace') or jsonb_typeof(item.value)<>'string' or char_length(item.value#>>'{}')>3000 then raise exception 'Invalid personal field'; end if;
    if item.key='linkedin' and item.value#>>'{}'<>'' and (item.value#>>'{}') !~ '^https?://[^[:space:]]+$' then raise exception 'Use an HTTP or HTTPS address'; end if;
  end loop;
  insert into public.personal_context(user_id,details,use_for_dialogue) values(auth.uid(),profile_details,allow_dialogue)
    on conflict(user_id) do update set details=excluded.details,use_for_dialogue=excluded.use_for_dialogue,updated_at=now();
end $$;
revoke all on function public.save_personal_context(jsonb,boolean) from public,anon,authenticated;
grant execute on function public.save_personal_context(jsonb,boolean) to authenticated;

-- Minimal administration directory, independent of permission to read executive intelligence.
create function public.company_directory(workspace uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare members jsonb; departments jsonb;
begin
  if greatest(public.company_access_level(workspace,'structure'),public.company_access_level(workspace,'people'),public.company_access_level(workspace,'access'))<1 then raise exception 'Company directory access is not enabled'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',m.user_id,'membershipId',m.id,'name',p.full_name,'role',m.role,'status',m.status,'department',coalesce(d.key,''),'reportsTo',wp.reports_to,'confirmed',wp.confirmed_by is not null,'businessRole',p.business_role) order by p.full_name),'[]') into members
    from public.organisation_memberships m join public.profiles p on p.id=m.user_id
    left join public.workspace_people wp on wp.organisation_id=m.organisation_id and wp.user_id=m.user_id
    left join public.workspace_departments d on d.organisation_id=m.organisation_id and d.id=wp.department_id
    where m.organisation_id=workspace;
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'key',key,'name',name,'headUserId',head_user_id) order by name),'[]') into departments from public.workspace_departments where organisation_id=workspace;
  return jsonb_build_object('members',members,'departments',departments);
end $$;
revoke all on function public.company_directory(uuid) from public,anon,authenticated;
grant execute on function public.company_directory(uuid) to authenticated;

create policy company_audit_read on public.audit_events for select to authenticated using(action like 'company.%' and public.company_access_level(organisation_id,'access')>0);
drop policy if exists audit_scope on public.audit_events;
create policy audit_scope on public.audit_events as restrictive for select to authenticated using(actor_id=auth.uid() or public.is_workspace_owner(organisation_id) or action like 'company.%' and public.company_access_level(organisation_id,'access')>0);

commit;
