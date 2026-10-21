begin;
alter table public.mission_suggestions drop constraint mission_suggestions_status_check;
alter table public.mission_suggestions add constraint mission_suggestions_status_check
 check(status in ('pending_head','pending_owner','awaiting_clarification','accepted','declined','underway','completed','discontinued'));
alter table public.mission_suggestions add column resume_status text check(resume_status in ('pending_head','pending_owner'));

create table public.suggestion_messages (
 id uuid primary key default gen_random_uuid(),
 suggestion_id uuid not null references public.mission_suggestions(id) on delete cascade,
 actor_id uuid not null references public.profiles(id),
 kind text not null,
 message text not null check(char_length(message) between 5 and 1200),
 created_at timestamptz not null default now()
);
alter table public.suggestion_messages enable row level security;
revoke all on public.suggestion_messages from public,anon,authenticated;
grant select on public.suggestion_messages to authenticated;
grant all on public.suggestion_messages to service_role;
create policy suggestion_message_read on public.suggestion_messages for select to authenticated using(exists
 (select 1 from public.mission_suggestions s where s.id=suggestion_id));

create or replace function public.can_review_suggestion(suggestion_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.mission_suggestions s where s.id=suggestion_id and s.author_id<>auth.uid()
 and public.is_workspace_member(s.organisation_id) and (public.is_workspace_owner(s.organisation_id)
 or case when s.status='awaiting_clarification' then s.resume_status else s.status end<>'pending_owner'
 and (s.requested_scope='department' or s.status='pending_head' or s.resume_status='pending_head')
 and exists(select 1 from public.workspace_departments d where d.id=s.department_id and d.head_user_id=auth.uid())));
$$;

alter function public.review_mission_suggestion(uuid,text,text,uuid) rename to review_mission_suggestion_v023;
revoke all on function public.review_mission_suggestion_v023(uuid,text,text,uuid) from public,anon,authenticated,service_role;
create function public.review_mission_suggestion(suggestion_id uuid,decision text,reply text,linked_mission uuid default null)
returns text language plpgsql security definer set search_path=public as $$
declare s public.mission_suggestions; next_status text;
begin
 select * into s from public.mission_suggestions where id=suggestion_id for update;
 if s.id is null or not public.can_review_suggestion(s.id) then raise exception 'Independent authorised review required'; end if;
 if char_length(trim(coalesce(reply,''))) not between 5 and 1200 then raise exception 'Provide a response for the employee'; end if;
 if decision='clarify' and s.status in ('pending_head','pending_owner') then next_status:='awaiting_clarification';
 elsif decision='escalate' and s.status='pending_head' then next_status:='pending_owner';
 elsif decision='discontinue' and s.status in ('accepted','underway') then next_status:='discontinued';
 else next_status:=public.review_mission_suggestion_v023(suggestion_id,decision,reply,linked_mission); end if;
 if decision in ('clarify','escalate','discontinue') then
  update public.mission_suggestions set status=next_status,response=trim(reply),resume_status=case when decision='clarify' then s.status else null end,
  reviewed_by=auth.uid(),updated_at=now() where id=s.id;
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata)
  values(s.organisation_id,auth.uid(),'suggestion.reviewed','suggestion',s.id,jsonb_build_object('status',next_status));
 end if;
 insert into public.suggestion_messages(suggestion_id,actor_id,kind,message) values(s.id,auth.uid(),decision,trim(reply));
 return next_status;
end $$;
revoke all on function public.review_mission_suggestion(uuid,text,text,uuid) from public,anon,authenticated;
grant execute on function public.review_mission_suggestion(uuid,text,text,uuid) to authenticated;

create function public.clarify_mission_suggestion(suggestion_id uuid,reply text)
returns void language plpgsql security definer set search_path=public as $$
declare s public.mission_suggestions;
begin
 select * into s from public.mission_suggestions where id=suggestion_id for update;
 if s.id is null or s.author_id<>auth.uid() or not public.is_workspace_member(s.organisation_id) or s.status<>'awaiting_clarification' then raise exception 'No clarification awaiting your response'; end if;
 if char_length(trim(coalesce(reply,''))) not between 5 and 1200 then raise exception 'Provide a concise clarification'; end if;
 insert into public.suggestion_messages(suggestion_id,actor_id,kind,message) values(s.id,auth.uid(),'employee_reply',trim(reply));
 update public.mission_suggestions set status=coalesce(resume_status,'pending_owner'),resume_status=null,updated_at=now() where id=s.id;
end $$;
revoke all on function public.clarify_mission_suggestion(uuid,text) from public,anon,authenticated;
grant execute on function public.clarify_mission_suggestion(uuid,text) to authenticated;
commit;
