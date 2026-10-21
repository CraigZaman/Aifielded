begin;
create table public.concern_updates (
 id uuid primary key default gen_random_uuid(),
 concern_id uuid not null references public.confidential_concerns(id) on delete cascade,
 actor_id uuid not null references public.profiles(id),
 status text not null,
 message text not null,
 created_at timestamptz not null default now()
);
create table public.concern_files (
 id uuid primary key,
 concern_id uuid not null references public.confidential_concerns(id) on delete cascade,
 filename text not null check(char_length(filename) between 1 and 200),
 media_type text not null check(media_type in ('application/pdf','text/plain','image/png','image/jpeg')),
 bytes integer not null check(bytes between 1 and 3145728),
 storage_path text not null unique,
 created_at timestamptz not null default now()
);
alter table public.concern_updates enable row level security;
alter table public.concern_files enable row level security;
revoke all on public.concern_updates,public.concern_files from public,anon,authenticated;
grant select on public.concern_updates,public.concern_files to authenticated;
grant insert on public.concern_files to authenticated;
grant all on public.concern_updates,public.concern_files to service_role;
create policy concern_updates_read on public.concern_updates for select to authenticated using(exists(select 1 from public.confidential_concerns c where c.id=concern_id));
create policy concern_files_read on public.concern_files for select to authenticated using(exists(select 1 from public.confidential_concerns c where c.id=concern_id));
create policy concern_files_insert on public.concern_files for insert to authenticated with check(exists(select 1 from public.confidential_concerns c where c.id=concern_id and c.author_id=auth.uid() and c.status<>'closed' and storage_path=c.organisation_id::text||'/'||c.id::text||'/'||id::text));
create function public.guard_concern_file_count()
returns trigger language plpgsql security definer set search_path=public as $$
begin
 perform 1 from public.confidential_concerns where id=new.concern_id for update;
 if (select count(*) from public.concern_files where concern_id=new.concern_id)>=10 then raise exception 'Attachment limit reached'; end if;
 return new;
end $$;
revoke all on function public.guard_concern_file_count() from public,anon,authenticated;
create trigger concern_file_limit before insert on public.concern_files for each row execute function public.guard_concern_file_count();

alter function public.respond_to_concern(uuid,text,text) rename to respond_to_concern_v025;
revoke all on function public.respond_to_concern_v025(uuid,text,text) from public,anon,authenticated,service_role;
create function public.respond_to_concern(case_id uuid,next_status text,reply text)
returns void language plpgsql security definer set search_path=public as $$
begin
 perform public.respond_to_concern_v025(case_id,next_status,reply);
 insert into public.concern_updates(concern_id,actor_id,status,message) values(case_id,auth.uid(),next_status,trim(reply));
end $$;
revoke all on function public.respond_to_concern(uuid,text,text) from public,anon,authenticated;
grant execute on function public.respond_to_concern(uuid,text,text) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('confidential-case-files','confidential-case-files',false,3145728,array['application/pdf','text/plain','image/png','image/jpeg']);
create policy case_storage_read on storage.objects for select to authenticated using(bucket_id='confidential-case-files' and exists
 (select 1 from public.confidential_concerns c where c.organisation_id::text=(storage.foldername(name))[1] and c.id::text=(storage.foldername(name))[2]));
create policy case_storage_insert on storage.objects for insert to authenticated with check(bucket_id='confidential-case-files' and exists
 (select 1 from public.confidential_concerns c where c.organisation_id::text=(storage.foldername(name))[1] and c.id::text=(storage.foldername(name))[2] and c.author_id=auth.uid() and c.status<>'closed'));
-- Only an incomplete upload may be removed through the ordinary client.
create policy case_storage_cleanup on storage.objects for delete to authenticated using(bucket_id='confidential-case-files'
 and not exists(select 1 from public.concern_files f where f.storage_path=name)
 and exists(select 1 from public.confidential_concerns c where c.organisation_id::text=(storage.foldername(name))[1] and c.id::text=(storage.foldername(name))[2] and c.author_id=auth.uid()));
commit;
