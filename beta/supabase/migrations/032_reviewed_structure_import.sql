begin;
create table public.company_structure_imports (
 id uuid primary key,
 organisation_id uuid not null references public.organisations(id) on delete cascade,
 source_name text not null check(char_length(source_name)<=300),
 placements jsonb not null,
 created_by uuid not null references public.profiles(id),
 created_at timestamptz not null default now()
);
alter table public.company_structure_imports enable row level security;
revoke all on public.company_structure_imports from public,anon,authenticated;
grant select on public.company_structure_imports to authenticated;
grant all on public.company_structure_imports to service_role;
create policy structure_import_read on public.company_structure_imports for select to authenticated using(public.company_access_level(organisation_id,'structure')>0);

create function public.import_company_structure(workspace uuid,request_id uuid,source text,reviewed_rows jsonb)
returns void language plpgsql security definer set search_path=public as $$
declare row_data jsonb; department uuid; person uuid; manager uuid;
begin
 perform 1 from public.organisations where id=workspace for update;
 if public.company_access_level(workspace,'structure')<2 then raise exception 'Structure editing required'; end if;
 if exists(select 1 from public.company_structure_imports where id=request_id and organisation_id=workspace) then return; end if;
 if jsonb_typeof(reviewed_rows) is distinct from 'array' or jsonb_array_length(reviewed_rows) not between 1 and 30 then raise exception 'Review one to thirty placements'; end if;
 if exists(select 1 from jsonb_array_elements(reviewed_rows) r group by r->>'person' having count(*)>1) then raise exception 'Map each member only once'; end if;
 for row_data in select * from jsonb_array_elements(reviewed_rows) loop
  if char_length(trim(coalesce(row_data->>'department',''))) not between 2 and 100 then raise exception 'Department name required'; end if;
  person:=(row_data->>'person')::uuid; manager:=nullif(row_data->>'manager','')::uuid;
  if person is null then raise exception 'Choose an existing member for every selected row'; end if;
  select id into department from public.workspace_departments where organisation_id=workspace and lower(name)=lower(trim(row_data->>'department'));
  if department is null then department:=public.save_workspace_department(workspace,null,trim(row_data->>'department'),null); end if;
  perform public.place_workspace_member(workspace,person,department,manager);
 end loop;
 insert into public.company_structure_imports(id,organisation_id,source_name,placements,created_by) values(request_id,workspace,source,reviewed_rows,auth.uid());
 insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata)
 values(workspace,auth.uid(),'company.structure_imported','structure_import',request_id,jsonb_build_object('count',jsonb_array_length(reviewed_rows),'source',source));
end $$;
revoke all on function public.import_company_structure(uuid,uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.import_company_structure(uuid,uuid,text,jsonb) to authenticated;
commit;
