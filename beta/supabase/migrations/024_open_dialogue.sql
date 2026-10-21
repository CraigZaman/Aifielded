begin;
create table public.open_dialogue_threads (
 id uuid primary key default gen_random_uuid(),
 organisation_id uuid not null references public.organisations(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 proactive boolean not null default false,
 last_prompt_at timestamptz,
 unique(organisation_id,user_id)
);
create table public.open_dialogue_turns (
 id uuid primary key,
 thread_id uuid not null references public.open_dialogue_threads(id) on delete cascade,
 question text not null check(char_length(question)<=8000),
 answer text check(char_length(answer)<=16000),
 status text not null check(status in ('pending','completed','failed')),
 purpose text not null default 'Private work discussion',
 seen boolean not null default false,
 token uuid,
 started_at timestamptz not null default now(),
 created_at timestamptz not null default now()
);
alter table public.open_dialogue_threads enable row level security;
alter table public.open_dialogue_turns enable row level security;
revoke all on public.open_dialogue_threads,public.open_dialogue_turns from public,anon,authenticated;
grant select on public.open_dialogue_threads,public.open_dialogue_turns to authenticated;
grant all on public.open_dialogue_threads,public.open_dialogue_turns to service_role;
create policy own_open_thread on public.open_dialogue_threads for select to authenticated using(user_id=auth.uid() and public.is_workspace_member(organisation_id));
create policy own_open_turn on public.open_dialogue_turns for select to authenticated using(exists(select 1 from public.open_dialogue_threads t where t.id=thread_id and t.user_id=auth.uid() and public.is_workspace_member(t.organisation_id)));

create function public.open_dialogue_preferences(workspace uuid,allow_prompts boolean)
returns void language plpgsql security definer set search_path=public as $$
begin
 if auth.uid() is null or not public.is_workspace_member(workspace) then raise exception 'Active membership required'; end if;
 insert into public.open_dialogue_threads(organisation_id,user_id,proactive) values(workspace,auth.uid(),allow_prompts)
 on conflict(organisation_id,user_id) do update set proactive=excluded.proactive;
end $$;

create function public.check_open_dialogue(workspace uuid)
returns void language plpgsql security definer set search_path=public as $$
declare t public.open_dialogue_threads;
begin
 if auth.uid() is null or not public.is_workspace_member(workspace) then raise exception 'Active membership required'; end if;
 select * into t from public.open_dialogue_threads where organisation_id=workspace and user_id=auth.uid() for update;
 if t.id is null or not t.proactive or t.last_prompt_at>now()-interval '1 day' then return; end if;
 if exists(select 1 from public.open_dialogue_turns where thread_id=t.id and (not seen or status='pending')) then return; end if;
 if exists(select 1 from public.personal_context where user_id=auth.uid() and length(trim(coalesce(details->>'responsibilities','')))>0) then return; end if;
 insert into public.open_dialogue_turns(id,thread_id,question,answer,status,purpose)
 values(gen_random_uuid(),t.id,'','Would you like to tell me a little about your day-to-day responsibilities? You can skip this, or update My Profile whenever it suits you.','completed','Optional clarification: your work context');
 update public.open_dialogue_threads set last_prompt_at=now() where id=t.id;
end $$;

create function public.mark_open_dialogue_read(workspace uuid,turn_ids uuid[])
returns void language plpgsql security definer set search_path=public as $$
begin
 if not public.is_workspace_member(workspace) or cardinality(turn_ids)>100 then raise exception 'Not authorised'; end if;
 update public.open_dialogue_turns set seen=true where id=any(turn_ids) and status='completed' and thread_id in
 (select id from public.open_dialogue_threads where organisation_id=workspace and user_id=auth.uid());
end $$;

create function public.begin_open_dialogue(workspace uuid,request_id uuid,contribution text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare t uuid; existing public.open_dialogue_turns; claim uuid; history jsonb;
begin
 if auth.uid() is null or not public.is_workspace_member(workspace) then raise exception 'Active membership required'; end if;
 if char_length(trim(contribution)) not between 1 and 8000 then raise exception 'Message must be 1 to 8000 characters'; end if;
 insert into public.open_dialogue_threads(organisation_id,user_id) values(workspace,auth.uid()) on conflict(organisation_id,user_id) do nothing;
 select id into t from public.open_dialogue_threads where organisation_id=workspace and user_id=auth.uid() for update;
 select * into existing from public.open_dialogue_turns where id=request_id;
 if existing.id is not null and (existing.thread_id<>t or existing.question<>trim(contribution)) then raise exception 'Request does not match'; end if;
 if existing.status='completed' then return jsonb_build_object('completed',true,'answer',existing.answer); end if;
 if exists(select 1 from public.open_dialogue_turns where thread_id=t and status='pending' and started_at>now()-interval '90 seconds') then raise exception 'A response is already in progress'; end if;
 if (select count(*) from public.open_dialogue_turns where thread_id=t and question<>'' and created_at>now()-interval '1 hour')>=20 and existing.id is null then raise exception 'Hourly discussion limit reached'; end if;
 claim:=gen_random_uuid();
 insert into public.open_dialogue_turns(id,thread_id,question,status,token) values(request_id,t,trim(contribution),'pending',claim)
 on conflict(id) do update set status='pending',token=claim,started_at=now();
 select coalesce(jsonb_agg(jsonb_build_object('question',h.question,'answer',h.answer) order by h.created_at),'[]') into history from
 (select question,answer,created_at from public.open_dialogue_turns where thread_id=t and id<>request_id order by created_at desc limit 20) h;
 return jsonb_build_object('token',claim,'history',history,'completed',false);
end $$;

create function public.finish_open_dialogue(request_id uuid,claim_token uuid,reply text)
returns boolean language plpgsql security definer set search_path=public as $$
declare changed integer;
begin
 update public.open_dialogue_turns set answer=reply,status=case when reply is null then 'failed' else 'completed' end,token=null
 where id=request_id and token=claim_token and status='pending';
 get diagnostics changed=row_count;
 return changed=1;
end $$;
revoke all on function public.open_dialogue_preferences(uuid,boolean),public.check_open_dialogue(uuid),public.mark_open_dialogue_read(uuid,uuid[]),public.begin_open_dialogue(uuid,uuid,text),public.finish_open_dialogue(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.open_dialogue_preferences(uuid,boolean),public.check_open_dialogue(uuid),public.mark_open_dialogue_read(uuid,uuid[]),public.begin_open_dialogue(uuid,uuid,text) to authenticated;
grant execute on function public.finish_open_dialogue(uuid,uuid,text) to service_role;
commit;
