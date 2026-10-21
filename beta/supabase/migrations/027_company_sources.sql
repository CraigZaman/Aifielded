begin;
create table public.company_sources (
 id uuid primary key default gen_random_uuid(),organisation_id uuid not null references public.organisations(id) on delete cascade,
 label text not null check(char_length(label) between 2 and 120),url text not null check(char_length(url)<=2000 and url like 'https://%'),
 cadence text not null check(cadence in ('manual','daily','weekly','reference')),
 created_by uuid not null references public.profiles(id),created_at timestamptz not null default now(),
 checked_at timestamptz,attempted_at timestamptz,claim_token uuid,status text not null default 'not_checked' check(status in ('not_checked','checking','ready','failed')),
 unique(organisation_id,url)
);
create table public.company_source_snapshots (
 id uuid primary key default gen_random_uuid(),source_id uuid not null references public.company_sources(id) on delete cascade,
 organisation_id uuid not null references public.organisations(id) on delete cascade,
 content text not null check(char_length(content) between 1 and 20000),content_hash text not null,final_url text not null,
 status text not null default 'draft' check(status in ('draft','approved','rejected')),
 fetched_at timestamptz not null default now(),reviewed_at timestamptz,reviewed_by uuid references public.profiles(id),
 unique(source_id,content_hash)
);
alter table public.company_sources enable row level security;
alter table public.company_source_snapshots enable row level security;
revoke all on public.company_sources,public.company_source_snapshots from public,anon,authenticated;
grant select on public.company_sources,public.company_source_snapshots to authenticated;
grant all on public.company_sources,public.company_source_snapshots to service_role;
create policy source_administration on public.company_sources for select to authenticated using(public.company_access_level(organisation_id,'sources')>0);
create policy snapshot_administration on public.company_source_snapshots for select to authenticated using(public.company_access_level(organisation_id,'sources')>0);

create function public.save_company_source(workspace uuid,source_id uuid,source_label text,source_url text,refresh_cadence text)
returns uuid language plpgsql security definer set search_path=public as $$
declare result uuid;
begin
 perform 1 from public.organisations where id=workspace for update;
 if auth.uid() is null or public.company_access_level(workspace,'sources')<2 then raise exception 'Source editing is not enabled'; end if;
 if source_id is null then
  if (select count(*) from public.company_sources where organisation_id=workspace)>=10 then raise exception 'At most ten sources per workspace'; end if;
  insert into public.company_sources(organisation_id,label,url,cadence,created_by) values(workspace,source_label,source_url,refresh_cadence,auth.uid()) returning id into result;
 else
  update public.company_sources set label=source_label,cadence=refresh_cadence where id=source_id and organisation_id=workspace and url=source_url returning id into result;
  if result is null then raise exception 'Source not found; add a new source to change its URL'; end if;
 end if;
 insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id) values(workspace,auth.uid(),'company.source_saved','source',result);
 return result;
end $$;

create function public.claim_company_source(target_source uuid)
returns jsonb language plpgsql security definer set search_path=public as $$
declare s public.company_sources; token uuid;
begin
 select * into s from public.company_sources where id=target_source for update;
 if s.id is null or auth.uid() is null or public.company_access_level(s.organisation_id,'sources')<2 then raise exception 'Source editing is not enabled'; end if;
 if s.cadence='reference' then raise exception 'This is a reference-only link'; end if;
 if s.attempted_at>now()-interval '2 minutes' then raise exception 'Please wait before checking again'; end if;
 token:=gen_random_uuid();update public.company_sources set status='checking',attempted_at=now(),claim_token=token where id=s.id;
 return jsonb_build_object('id',s.id,'url',s.url,'token',token);
end $$;

create function public.claim_scheduled_company_source()
returns jsonb language plpgsql security definer set search_path=public as $$
declare s public.company_sources; token uuid;
begin
 select * into s from public.company_sources where cadence in ('daily','weekly')
 and (attempted_at is null or attempted_at<now()-case when cadence='daily' then interval '1 day' else interval '7 days' end)
 order by attempted_at nulls first for update skip locked limit 1;
 if s.id is null then return null; end if;
 token:=gen_random_uuid();update public.company_sources set status='checking',attempted_at=now(),claim_token=token where id=s.id;
 return jsonb_build_object('id',s.id,'url',s.url,'token',token);
end $$;

create function public.finish_company_source(target_source uuid,token uuid,extracted_content text,resolved_url text)
returns boolean language plpgsql security definer set search_path=public as $$
declare s public.company_sources;
begin
 select * into s from public.company_sources where id=target_source and claim_token=token for update;
 if s.id is null then return false; end if;
 if extracted_content is not null then
  insert into public.company_source_snapshots(source_id,organisation_id,content,content_hash,final_url)
  values(s.id,s.organisation_id,extracted_content,encode(extensions.digest(extracted_content,'sha256'),'hex'),resolved_url) on conflict(source_id,content_hash) do nothing;
 end if;
 update public.company_sources set status=case when extracted_content is null then 'failed' else 'ready' end,claim_token=null,checked_at=case when extracted_content is not null then now() else checked_at end where id=s.id;
 return true;
end $$;

create function public.review_company_source(snapshot_id uuid,decision text)
returns void language plpgsql security definer set search_path=public as $$
declare workspace uuid;
begin
 select organisation_id into workspace from public.company_source_snapshots where id=snapshot_id for update;
 if workspace is null or public.company_access_level(workspace,'sources')<2 or decision not in ('approved','rejected') then raise exception 'Source review is not enabled'; end if;
 update public.company_source_snapshots set status=decision,reviewed_at=now(),reviewed_by=auth.uid() where id=snapshot_id;
 insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata) values(workspace,auth.uid(),'company.source_reviewed','snapshot',snapshot_id,jsonb_build_object('decision',decision));
end $$;

alter function public.company_dialogue_context(uuid) rename to company_dialogue_context_v021;
revoke all on function public.company_dialogue_context_v021(uuid) from public,anon,authenticated,service_role;
create function public.company_dialogue_context(workspace uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare context jsonb; sources jsonb;
begin
 context:=public.company_dialogue_context_v021(workspace);
 select coalesce(jsonb_agg(jsonb_build_object('label',label,'url',url,'fetched_at',fetched_at,'reviewed_at',reviewed_at,'content',left(content,2000))),'[]') into sources from (
 select distinct on(s.id) s.label,s.url,v.content,v.fetched_at,v.reviewed_at from public.company_sources s join public.company_source_snapshots v on v.source_id=s.id
 where s.organisation_id=workspace and v.status='approved' order by s.id,v.reviewed_at desc
 ) approved;
 return context||jsonb_build_object('external_sources',sources);
end $$;
revoke all on function public.save_company_source(uuid,uuid,text,text,text),public.claim_company_source(uuid),public.claim_scheduled_company_source(),public.finish_company_source(uuid,uuid,text,text),public.review_company_source(uuid,text),public.company_dialogue_context(uuid) from public,anon,authenticated;
grant execute on function public.save_company_source(uuid,uuid,text,text,text),public.claim_company_source(uuid),public.review_company_source(uuid,text),public.company_dialogue_context(uuid) to authenticated;
grant execute on function public.claim_scheduled_company_source(),public.finish_company_source(uuid,uuid,text,text) to service_role;
commit;
