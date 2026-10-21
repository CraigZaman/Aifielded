begin;

create table public.mission_suggestions (
 id uuid primary key,
 organisation_id uuid not null references public.organisations(id) on delete cascade,
 author_id uuid not null references public.profiles(id),
 department_id uuid references public.workspace_departments(id),
 question text not null check(char_length(question) between 10 and 500),
 contribution text not null check(char_length(contribution) between 10 and 5000),
 requested_scope text not null check(requested_scope in ('department','organisation')),
 status text not null check(status in ('pending_head','pending_owner','accepted','declined','underway','completed')),
 mission_id uuid references public.missions(id),
 response text not null default '' check(char_length(response)<=1200),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 reviewed_by uuid references public.profiles(id)
);
alter table public.mission_suggestions enable row level security;
revoke all on public.mission_suggestions from public,anon,authenticated;
grant select on public.mission_suggestions to authenticated;
grant all on public.mission_suggestions to service_role;
create index mission_suggestions_queue on public.mission_suggestions(organisation_id,status,created_at);

create function public.can_review_suggestion(suggestion_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.mission_suggestions s where s.id=suggestion_id and s.author_id<>auth.uid()
 and public.is_workspace_member(s.organisation_id) and (public.is_workspace_owner(s.organisation_id)
 or s.status<>'pending_owner' and s.requested_scope='department' and exists(select 1 from public.workspace_departments d where d.id=s.department_id and d.head_user_id=auth.uid())
 or s.status='pending_head' and exists(select 1 from public.workspace_departments d where d.id=s.department_id and d.head_user_id=auth.uid())));
$$;
revoke all on function public.can_review_suggestion(uuid) from public,anon,authenticated;
grant execute on function public.can_review_suggestion(uuid) to authenticated;
create policy suggestions_read on public.mission_suggestions for select to authenticated using(public.is_workspace_member(organisation_id) and (author_id=auth.uid() or public.can_review_suggestion(id)));

create function public.submit_mission_suggestion(workspace uuid,request_id uuid,proposed_question text,initial_contribution text,question_scope text)
returns uuid language plpgsql security definer set search_path=public as $$
declare department uuid; head uuid;
begin
 if auth.uid() is null or not public.is_workspace_member(workspace) then raise exception 'Active membership required'; end if;
 perform 1 from public.organisation_memberships where organisation_id=workspace and user_id=auth.uid() for update;
 if exists(select 1 from public.mission_suggestions where id=request_id and organisation_id=workspace and author_id=auth.uid()) then return request_id; end if;
 if (select count(*) from public.mission_suggestions where organisation_id=workspace and author_id=auth.uid() and created_at>now()-interval '1 day')>=5 then raise exception 'Daily suggestion limit reached'; end if;
 select p.department_id,d.head_user_id into department,head from public.workspace_people p left join public.workspace_departments d on d.id=p.department_id
 where p.organisation_id=workspace and p.user_id=auth.uid();
 if not exists(select 1 from public.organisation_memberships where organisation_id=workspace and user_id=head and status='active') then head:=null; end if;
 insert into public.mission_suggestions(id,organisation_id,author_id,department_id,question,contribution,requested_scope,status)
 values(request_id,workspace,auth.uid(),department,trim(proposed_question),trim(initial_contribution),question_scope,case when head is not null and head<>auth.uid() then 'pending_head' else 'pending_owner' end);
 insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id) values(workspace,auth.uid(),'suggestion.submitted','suggestion',request_id);
 return request_id;
end $$;
revoke all on function public.submit_mission_suggestion(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.submit_mission_suggestion(uuid,uuid,text,text,text) to authenticated;

create function public.review_mission_suggestion(suggestion_id uuid,decision text,reply text,linked_mission uuid default null)
returns text language plpgsql security definer set search_path=public as $$
declare s public.mission_suggestions; next_status text;
begin
 select * into s from public.mission_suggestions where id=suggestion_id for update;
 if s.id is null or not public.can_review_suggestion(s.id) then raise exception 'Independent authorised review required'; end if;
 if decision='decline' and s.status in ('pending_head','pending_owner') then next_status:='declined';
 elsif decision='approve' and s.status in ('pending_head','pending_owner') then
  next_status:=case when s.requested_scope='organisation' and not public.is_workspace_owner(s.organisation_id) then 'pending_owner' else 'accepted' end;
 elsif decision='link' and s.status='accepted' and linked_mission is not null then
  if not exists(select 1 from public.missions m where m.id=linked_mission and m.organisation_id=s.organisation_id and m.status='active' and public.can_read_mission_intelligence(m.id)) then raise exception 'Choose an accessible active mission'; end if;
  next_status:='underway';
 elsif decision='complete' and s.status='underway' then next_status:='completed';
 else raise exception 'This decision does not match the current stage'; end if;
 if char_length(trim(coalesce(reply,''))) not between 5 and 1200 then raise exception 'Provide a concise response for the employee'; end if;
 update public.mission_suggestions set status=next_status,response=trim(reply),mission_id=case when decision='link' then linked_mission else mission_id end,reviewed_by=auth.uid(),updated_at=now() where id=s.id;
 insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata) values(s.organisation_id,auth.uid(),'suggestion.reviewed','suggestion',s.id,jsonb_build_object('status',next_status));
 return next_status;
end $$;
revoke all on function public.review_mission_suggestion(uuid,text,text,uuid) from public,anon,authenticated;
grant execute on function public.review_mission_suggestion(uuid,text,text,uuid) to authenticated;
commit;
