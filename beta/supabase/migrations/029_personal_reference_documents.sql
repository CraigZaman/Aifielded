begin;
create table public.personal_reference_documents (
 id uuid primary key,
 organisation_id uuid not null references public.organisations(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 title text not null check(char_length(title) between 2 and 160),
 source_name text not null default '' check(char_length(source_name)<=300),
 content text not null check(char_length(content) between 1 and 50000),
 use_for_dialogue boolean not null default false,
 created_at timestamptz not null default now()
);
alter table public.personal_reference_documents enable row level security;
revoke all on public.personal_reference_documents from public,anon,authenticated;
grant select,delete on public.personal_reference_documents to authenticated;
grant update(use_for_dialogue) on public.personal_reference_documents to authenticated;
grant all on public.personal_reference_documents to service_role;
create policy personal_document_own on public.personal_reference_documents for all to authenticated
 using(user_id=auth.uid() and public.is_workspace_member(organisation_id)) with check(user_id=auth.uid() and public.is_workspace_member(organisation_id));

create function public.add_personal_document(workspace uuid,request_id uuid,document_title text,source text,document_content text,allow_dialogue boolean)
returns uuid language plpgsql security definer set search_path=public as $$
begin
 if not public.is_workspace_member(workspace) then raise exception 'Active membership required'; end if;
 perform 1 from public.organisation_memberships where organisation_id=workspace and user_id=auth.uid() for update;
 if exists(select 1 from public.personal_reference_documents where id=request_id and user_id=auth.uid() and organisation_id=workspace) then return request_id; end if;
 if (select count(*) from public.personal_reference_documents where user_id=auth.uid() and organisation_id=workspace)>=20 then raise exception 'Keep up to twenty personal references'; end if;
 insert into public.personal_reference_documents(id,organisation_id,user_id,title,source_name,content,use_for_dialogue)
 values(request_id,workspace,auth.uid(),trim(document_title),source,document_content,allow_dialogue);
 return request_id;
end $$;
revoke all on function public.add_personal_document(uuid,uuid,text,text,text,boolean) from public,anon,authenticated;
grant execute on function public.add_personal_document(uuid,uuid,text,text,text,boolean) to authenticated;

create function public.my_work_structure(workspace uuid)
returns jsonb language sql stable security definer set search_path=public as $$
 select jsonb_build_object('department',d.name,'reportsTo',manager.full_name,'confirmed',w.confirmed_by is not null)
 from public.workspace_people w left join public.workspace_departments d on d.id=w.department_id
 left join public.profiles manager on manager.id=w.reports_to
 where w.organisation_id=workspace and w.user_id=auth.uid() and public.is_workspace_member(workspace);
$$;
create function public.concern_contacts(workspace uuid)
returns jsonb language sql stable security definer set search_path=public as $$
 select jsonb_build_object('primary',coalesce((select jsonb_agg(p.full_name) from public.profiles p where p.id=any(r.primary_handlers)),'[]'),
 'alternate',coalesce((select jsonb_agg(p.full_name) from public.profiles p where p.id=any(r.alternate_handlers)),'[]'))
 from public.concern_routes r where r.organisation_id=workspace and public.is_workspace_member(workspace);
$$;
create function public.concern_reporter_name(case_id uuid)
returns text language sql stable security definer set search_path=public as $$
 select p.full_name from public.confidential_concerns c join public.profiles p on p.id=c.author_id
 where c.id=case_id and public.is_workspace_member(c.organisation_id) and (auth.uid()=c.author_id or auth.uid()=any(c.handler_ids));
$$;
revoke all on function public.my_work_structure(uuid),public.concern_contacts(uuid),public.concern_reporter_name(uuid) from public,anon,authenticated;
grant execute on function public.my_work_structure(uuid),public.concern_contacts(uuid),public.concern_reporter_name(uuid) to authenticated;
commit;
