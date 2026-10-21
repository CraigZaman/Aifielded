begin;
create function public.set_company_access_all(workspace uuid,person uuid,access_level integer)
returns void language plpgsql security definer set search_path=public as $$
declare section_name text;
begin
 perform 1 from public.organisations where id=workspace for update;
 if public.company_access_level(workspace,'access')<2 then raise exception 'Access administration required'; end if;
 foreach section_name in array array['profile','sources','structure','people','access'] loop
  perform public.set_company_access(workspace,person,section_name,access_level);
 end loop;
end $$;
revoke all on function public.set_company_access_all(uuid,uuid,integer) from public,anon,authenticated;
grant execute on function public.set_company_access_all(uuid,uuid,integer) to authenticated;

-- The service job receives only the company-wide reference projection, never personal or restricted documents.
alter function public.claim_mission_analysis(uuid) rename to claim_mission_analysis_v018_context;
revoke all on function public.claim_mission_analysis_v018_context(uuid) from public,anon,authenticated,service_role;
create function public.claim_mission_analysis(target_mission uuid default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare result jsonb; workspace uuid; company jsonb; documents jsonb; sources jsonb;
begin
 result:=public.claim_mission_analysis_v018_context(target_mission);
 if result is null then return null; end if;
 select organisation_id into workspace from public.missions where id=(result->>'mission_id')::uuid;
 select details into company from public.company_profiles where organisation_id=workspace;
 select coalesce(jsonb_agg(jsonb_build_object('title',title,'version',version,'content',left(content,1500))),'[]') into documents from
 (select * from public.company_documents where organisation_id=workspace and status='approved' and visibility='company' order by approved_at desc,id limit 5) d;
 select coalesce(jsonb_agg(jsonb_build_object('label',label,'url',url,'fetched_at',fetched_at,'content',left(content,1000))),'[]') into sources from
 (select distinct on(s.id) s.label,s.url,v.content,v.fetched_at from public.company_sources s join public.company_source_snapshots v on v.source_id=s.id
 where s.organisation_id=workspace and v.status='approved' order by s.id,v.reviewed_at desc limit 5) approved;
 return result||jsonb_build_object('company_background',jsonb_build_object('company',coalesce(company,'{}'),'documents',documents,'external_sources',sources));
end $$;
revoke all on function public.claim_mission_analysis(uuid) from public,anon,authenticated;
grant execute on function public.claim_mission_analysis(uuid) to service_role;

alter table public.open_dialogue_threads
 add column timezone text not null default 'UTC',
 add column work_start integer not null default 9 check(work_start between 0 and 23),
 add column work_end integer not null default 17 check(work_end between 1 and 24),
 add column weekdays_only boolean not null default true,
 add column snoozed_until timestamptz,
 add column context_prompt_declined boolean not null default false,
 add check(work_start<work_end);

create function public.configure_dialogue_prompts(workspace uuid,allow_prompts boolean,zone text,start_hour integer,end_hour integer,weekdays boolean)
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_workspace_member(workspace) or not exists(select 1 from pg_timezone_names where name=zone) then raise exception 'Choose a valid timezone'; end if;
 perform public.open_dialogue_preferences(workspace,allow_prompts);
 update public.open_dialogue_threads set timezone=zone,work_start=start_hour,work_end=end_hour,weekdays_only=weekdays where organisation_id=workspace and user_id=auth.uid();
end $$;

create function public.defer_dialogue_prompt(workspace uuid,turn_id uuid,decision text)
returns void language plpgsql security definer set search_path=public as $$
declare t uuid;
begin
 if not public.is_workspace_member(workspace) or decision not in ('later','unknown') then raise exception 'Invalid prompt response'; end if;
 select id into t from public.open_dialogue_threads where organisation_id=workspace and user_id=auth.uid() for update;
 if not exists(select 1 from public.open_dialogue_turns where id=turn_id and thread_id=t and question='' and status='completed') then raise exception 'Prompt unavailable'; end if;
 update public.open_dialogue_turns set seen=true where id=turn_id;
 update public.open_dialogue_threads set snoozed_until=now()+interval '7 days',context_prompt_declined=case when decision='unknown' then true else context_prompt_declined end where id=t;
end $$;

create or replace function public.check_open_dialogue(workspace uuid)
returns void language plpgsql security definer set search_path=public as $$
declare t public.open_dialogue_threads; local_time timestamp;
begin
 if not public.is_workspace_member(workspace) then raise exception 'Active membership required'; end if;
 select * into t from public.open_dialogue_threads where organisation_id=workspace and user_id=auth.uid() for update;
 if t.id is null or not t.proactive or t.context_prompt_declined or t.last_prompt_at>now()-interval '1 day' or t.snoozed_until>now() then return; end if;
 local_time:=now() at time zone t.timezone;
 if extract(hour from local_time)<t.work_start or extract(hour from local_time)>=t.work_end or t.weekdays_only and extract(isodow from local_time)>5 then return; end if;
 if exists(select 1 from public.open_dialogue_turns where thread_id=t.id and (not seen or status='pending')) then return; end if;
 if exists(select 1 from public.personal_context where user_id=auth.uid() and length(trim(coalesce(details->>'responsibilities','')))>0) then return; end if;
 insert into public.open_dialogue_turns(id,thread_id,question,answer,status,purpose)
 values(gen_random_uuid(),t.id,'','Would you like to tell me a little about your day-to-day responsibilities? This stays in your private discussion. You can review and save context in My Profile.','completed','Optional clarification: your work context');
 update public.open_dialogue_threads set last_prompt_at=now() where id=t.id;
end $$;
revoke all on function public.configure_dialogue_prompts(uuid,boolean,text,integer,integer,boolean),public.defer_dialogue_prompt(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.configure_dialogue_prompts(uuid,boolean,text,integer,integer,boolean),public.defer_dialogue_prompt(uuid,uuid,text) to authenticated;
commit;
