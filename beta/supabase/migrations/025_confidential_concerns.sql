begin;
create table public.concern_routes (
 organisation_id uuid primary key references public.organisations(id) on delete cascade,
 primary_handlers uuid[] not null,
 alternate_handlers uuid[] not null default '{}',
 guidance text not null default '' check(char_length(guidance)<=3000),
 updated_by uuid not null references public.profiles(id),
 updated_at timestamptz not null default now()
);
create table public.confidential_concerns (
 id uuid primary key,
 organisation_id uuid not null references public.organisations(id) on delete cascade,
 author_id uuid not null references public.profiles(id),
 handler_ids uuid[] not null,
 channel text not null check(channel in ('primary','alternate')),
 title text not null check(char_length(title) between 5 and 200),
 body text not null check(char_length(body) between 10 and 10000),
 status text not null default 'submitted' check(status in ('submitted','acknowledged','reviewing','closed')),
 response text not null default '' check(char_length(response)<=5000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.concern_routes enable row level security;
alter table public.confidential_concerns enable row level security;
revoke all on public.concern_routes,public.confidential_concerns from public,anon,authenticated;
grant select on public.concern_routes,public.confidential_concerns to authenticated;
grant all on public.concern_routes,public.confidential_concerns to service_role;
create policy concern_routes_member on public.concern_routes for select to authenticated using(public.is_workspace_member(organisation_id));
create policy concern_author_or_named_handler on public.confidential_concerns for select to authenticated
 using(public.is_workspace_member(organisation_id) and (author_id=auth.uid() or auth.uid()=any(handler_ids)));

create function public.set_concern_routes(workspace uuid,primary_people uuid[],alternate_people uuid[],instructions text)
returns void language plpgsql security definer set search_path=public as $$
begin
 perform 1 from public.organisations where id=workspace for update;
 if auth.uid() is null or public.company_access_level(workspace,'access')<2 then raise exception 'Access administration required'; end if;
 if coalesce(cardinality(primary_people),0) not between 1 and 5 or coalesce(cardinality(alternate_people),0)>5 or primary_people&&alternate_people then raise exception 'Choose separate primary and alternate handlers'; end if;
 if exists(select 1 from unnest(primary_people||coalesce(alternate_people,'{}')) p where p is null or not exists(select 1 from public.organisation_memberships where organisation_id=workspace and user_id=p and status='active')) then raise exception 'Handlers must be active company members'; end if;
 insert into public.concern_routes(organisation_id,primary_handlers,alternate_handlers,guidance,updated_by)
 values(workspace,primary_people,coalesce(alternate_people,'{}'),instructions,auth.uid()) on conflict(organisation_id) do update set primary_handlers=excluded.primary_handlers,alternate_handlers=excluded.alternate_handlers,guidance=excluded.guidance,updated_by=auth.uid(),updated_at=now();
 insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id) values(workspace,auth.uid(),'company.concern_routes_updated','organisation',workspace);
end $$;

create function public.submit_confidential_concern(workspace uuid,request_id uuid,route text,concern_title text,concern_body text,identity_acknowledged boolean)
returns uuid language plpgsql security definer set search_path=public as $$
declare config public.concern_routes; handlers uuid[];
begin
 if auth.uid() is null or not public.is_workspace_member(workspace) or identity_acknowledged is distinct from true then raise exception 'Confirm the identity disclosure before submitting'; end if;
 if exists(select 1 from public.confidential_concerns where id=request_id and organisation_id=workspace and author_id=auth.uid()) then return request_id; end if;
 select * into config from public.concern_routes where organisation_id=workspace for share;
 if route not in ('primary','alternate') or config.organisation_id is null then raise exception 'A reporting route is not configured'; end if;
 select array_agg(distinct p) into handlers from unnest(case when route='primary' then config.primary_handlers else config.alternate_handlers end) p
 where p<>auth.uid() and exists(select 1 from public.organisation_memberships where organisation_id=workspace and user_id=p and status='active');
 if coalesce(cardinality(handlers),0)=0 then raise exception 'No independent active handler is available for this route'; end if;
 insert into public.confidential_concerns(id,organisation_id,author_id,handler_ids,channel,title,body)
 values(request_id,workspace,auth.uid(),handlers,route,trim(concern_title),trim(concern_body));
 return request_id;
end $$;

create function public.respond_to_concern(case_id uuid,next_status text,reply text)
returns void language plpgsql security definer set search_path=public as $$
declare c public.confidential_concerns;
begin
 select * into c from public.confidential_concerns where id=case_id for update;
 if c.id is null or not public.is_workspace_member(c.organisation_id) or auth.uid()=c.author_id or not auth.uid()=any(c.handler_ids) then raise exception 'Only a designated independent handler may respond'; end if;
 if c.status='closed' or next_status not in ('acknowledged','reviewing','closed') or char_length(trim(reply)) not between 5 and 5000 then raise exception 'Choose a valid next step and response'; end if;
 update public.confidential_concerns set status=next_status,response=trim(reply),updated_at=now() where id=case_id;
end $$;
revoke all on function public.set_concern_routes(uuid,uuid[],uuid[],text),public.submit_confidential_concern(uuid,uuid,text,text,text,boolean),public.respond_to_concern(uuid,text,text) from public,anon,authenticated;
grant execute on function public.set_concern_routes(uuid,uuid[],uuid[],text),public.submit_confidential_concern(uuid,uuid,text,text,text,boolean),public.respond_to_concern(uuid,text,text) to authenticated;
commit;
