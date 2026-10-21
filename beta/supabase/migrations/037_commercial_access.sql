-- Fielded: workspace trials, bounded AI, tester codes and private demo access.
begin;

create table public.workspace_access (
  organisation_id uuid primary key references public.organisations(id) on delete cascade,
  plan text not null default 'sme' check (plan in ('startup','sme','enterprise')),
  trial_started_at timestamptz not null default now(),
  trial_ends_at timestamptz not null default now() + interval '30 days',
  paid_until timestamptz,
  tester_until timestamptz,
  tester_code_id uuid,
  check (trial_ends_at > trial_started_at)
);
create table public.commercial_codes (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('tester','demo')),
  label text not null check (length(label) between 2 and 100),
  token_digest text unique not null check (length(token_digest)=64),
  plan text not null default 'sme' check (plan in ('startup','sme','enterprise')),
  access_days integer not null default 90 check (access_days between 1 and 365),
  max_uses integer not null default 1 check (max_uses between 1 and 100),
  uses integer not null default 0 check (uses >= 0),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.workspace_access add foreign key (tester_code_id) references public.commercial_codes(id);
create table public.commercial_redemptions (
  code_id uuid references public.commercial_codes(id),
  organisation_id uuid references public.organisations(id) on delete cascade,
  redeemed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  primary key (code_id, organisation_id)
);
create table public.workspace_ai_usage (
  organisation_id uuid references public.organisations(id) on delete cascade,
  period text not null,
  units bigint not null default 0 check (units>=0),
  primary key (organisation_id,period)
);
create table public.demo_sessions (
  token_digest text primary key check (length(token_digest)=64),
  code_id uuid not null references public.commercial_codes(id),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create table public.commercial_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  target_id uuid,
  created_at timestamptz not null default now()
);
alter table public.workspace_access enable row level security;
alter table public.commercial_codes enable row level security;
alter table public.commercial_redemptions enable row level security;
alter table public.workspace_ai_usage enable row level security;
alter table public.demo_sessions enable row level security;
alter table public.commercial_audit enable row level security;
revoke all on public.workspace_access,public.commercial_codes,public.commercial_redemptions,public.workspace_ai_usage,public.demo_sessions,public.commercial_audit from anon,authenticated;
grant all on public.workspace_access,public.commercial_codes,public.commercial_redemptions,public.workspace_ai_usage,public.demo_sessions,public.commercial_audit to service_role;

create function public.initialise_workspace_trial() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.workspace_access(organisation_id) values(new.id) on conflict do nothing;
  return new;
end $$;
create trigger "00_initialise_workspace_trial" after insert on public.organisations for each row execute function public.initialise_workspace_trial();
insert into public.workspace_access(organisation_id) select id from public.organisations on conflict do nothing;

create function public.commercial_status_internal(workspace uuid) returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare a public.workspace_access; c public.commercial_codes; mode text := 'expired'; ends timestamptz; seat_limit int; allowance bigint; period_key text; used bigint;
begin
  select * into a from public.workspace_access where organisation_id=workspace;
  if not found then raise exception 'Workspace access unavailable'; end if;
  ends := a.trial_ends_at;
  if a.trial_ends_at > now() then mode := 'trial'; end if;
  if a.tester_code_id is not null then
    select * into c from public.commercial_codes where id=a.tester_code_id and kind='tester' and revoked_at is null;
    if found and a.tester_until > now() then mode := 'tester'; ends := a.tester_until; end if;
  end if;
  if a.paid_until > now() then mode := 'paid'; ends := a.paid_until; end if;
  seat_limit := case a.plan when 'startup' then 5 when 'sme' then 25 else 100 end;
  allowance := case when mode='trial' then 4000000 when a.plan='startup' then 8000000 when a.plan='sme' then 24000000 else 80000000 end;
  period_key := case when mode='trial' then 'trial' else to_char(now() at time zone 'UTC','YYYY-MM') end;
  select units into used from public.workspace_ai_usage where organisation_id=workspace and period=period_key;
  return jsonb_build_object('active',mode<>'expired','state',mode,'ends_at',ends,'plan',a.plan,'seats',seat_limit,
    'used_seats',(select count(*) from public.organisation_memberships where organisation_id=workspace and status='active'),
    'ai_limit',allowance,'ai_used',coalesce(used,0),'period',period_key);
end $$;

create function public.workspace_commercial_status(workspace uuid) returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists(select 1 from public.organisation_memberships where organisation_id=workspace and user_id=auth.uid() and status='active') then raise exception 'Access denied'; end if;
  return public.commercial_status_internal(workspace);
end $$;

create function public.choose_trial_plan(workspace uuid, chosen_plan text) returns void language plpgsql security definer set search_path = '' as $$
declare seats int;
begin
  if not exists(select 1 from public.organisation_memberships where organisation_id=workspace and user_id=auth.uid() and status='active' and role='owner') then raise exception 'Owner access required'; end if;
  if chosen_plan not in ('startup','sme','enterprise') then raise exception 'Invalid plan'; end if;
  perform 1 from public.workspace_access where organisation_id=workspace for update;
  if (public.commercial_status_internal(workspace)->>'state') <> 'trial' then raise exception 'Plan selection is only available during the trial'; end if;
  seats := case chosen_plan when 'startup' then 5 when 'sme' then 25 else 100 end;
  if (select count(*) from public.organisation_memberships where organisation_id=workspace and status='active') > seats then raise exception 'This plan has fewer seats than your active team'; end if;
  update public.workspace_access set plan=chosen_plan where organisation_id=workspace;
  insert into public.commercial_audit(actor_id,action,target_id) values(auth.uid(),'trial.plan_changed',workspace);
end $$;

create function public.redeem_tester_code(workspace uuid, code_digest text) returns void language plpgsql security definer set search_path = '' as $$
declare c public.commercial_codes;
begin
  if not exists(select 1 from public.organisation_memberships where organisation_id=workspace and user_id=auth.uid() and status='active' and role='owner') then raise exception 'Owner access required'; end if;
  select * into c from public.commercial_codes where token_digest=code_digest and kind='tester' for update;
  if not found or c.revoked_at is not null or c.expires_at<=now() then raise exception 'Code is unavailable or expired'; end if;
  if exists(select 1 from public.commercial_redemptions where code_id=c.id and organisation_id=workspace) then return; end if;
  if c.uses>=c.max_uses then raise exception 'Code is fully redeemed'; end if;
  perform 1 from public.workspace_access where organisation_id=workspace for update;
  if (select count(*) from public.organisation_memberships where organisation_id=workspace and status='active') > (case c.plan when 'startup' then 5 when 'sme' then 25 else 100 end) then raise exception 'Code seat allowance is too small for this workspace'; end if;
  insert into public.commercial_redemptions(code_id,organisation_id,redeemed_by) values(c.id,workspace,auth.uid());
  update public.commercial_codes set uses=uses+1 where id=c.id;
  update public.workspace_access set plan=c.plan,tester_code_id=c.id,tester_until=now()+make_interval(days=>c.access_days) where organisation_id=workspace;
  insert into public.commercial_audit(actor_id,action,target_id) values(auth.uid(),'tester.redeemed',workspace);
end $$;

create function public.guard_workspace_seats() returns trigger language plpgsql security definer set search_path = '' as $$
declare s jsonb;
begin
  if new.status<>'active' then return new; end if;
  if TG_OP='UPDATE' and old.status='active' and old.organisation_id=new.organisation_id then return new; end if;
  perform 1 from public.workspace_access where organisation_id=new.organisation_id for update;
  s := public.commercial_status_internal(new.organisation_id);
  if not (s->>'active')::boolean then raise exception 'Workspace trial has ended. An active plan or tester code is required'; end if;
  if (s->>'used_seats')::int >= (s->>'seats')::int then raise exception 'Workspace seat limit reached. Ask the owner to select a larger plan'; end if;
  return new;
end $$;
create trigger guard_workspace_seats before insert or update on public.organisation_memberships for each row execute function public.guard_workspace_seats();

create function public.reserve_workspace_generation(workspace uuid,input_token_count int,output_token_limit int) returns uuid language plpgsql security definer set search_path = '' as $$
declare s jsonb; reservation uuid; cost bigint; period_key text;
begin
  if input_token_count not between 1 and 100000 or output_token_limit not between 1 and 4096 then raise exception 'AI request exceeds limits'; end if;
  perform 1 from public.workspace_access where organisation_id=workspace for update;
  s := public.commercial_status_internal(workspace);
  if not (s->>'active')::boolean then raise exception 'Workspace trial has ended'; end if;
  cost := input_token_count::bigint+5*output_token_limit::bigint;
  if (s->>'ai_used')::bigint+cost > (s->>'ai_limit')::bigint then raise exception 'Workspace AI allowance reached'; end if;
  period_key := s->>'period';
  -- Reserve the maximum output before sending; failed requests remain budgeted conservatively.
  reservation := public.reserve_gemini36_generation(input_token_count,output_token_limit);
  insert into public.workspace_ai_usage(organisation_id,period,units) values(workspace,period_key,cost)
    on conflict(organisation_id,period) do update set units=public.workspace_ai_usage.units+excluded.units;
  return reservation;
end $$;

create function public.create_commercial_code(code_id uuid,code_kind text,code_label text,code_digest text,chosen_plan text,days int,uses_limit int,expiry timestamptz) returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator required'; end if;
  if expiry<=now() or expiry>now()+interval '366 days' then raise exception 'Invalid expiry'; end if;
  insert into public.commercial_codes(id,kind,label,token_digest,plan,access_days,max_uses,expires_at,created_by) values(code_id,code_kind,code_label,code_digest,chosen_plan,days,uses_limit,expiry,auth.uid());
  insert into public.commercial_audit(actor_id,action,target_id) values(auth.uid(),'code.created',code_id);
end $$;
create function public.revoke_commercial_code(code_id uuid) returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_platform_admin() then raise exception 'Platform administrator required'; end if;
  update public.commercial_codes set revoked_at=coalesce(revoked_at,now()) where id=code_id;
  insert into public.commercial_audit(actor_id,action,target_id) values(auth.uid(),'code.revoked',code_id);
end $$;
create function public.open_demo_session(code_digest text,session_digest text) returns boolean language plpgsql security definer set search_path = '' as $$
declare c public.commercial_codes;
begin
  select * into c from public.commercial_codes where token_digest=code_digest and kind='demo' for update;
  if not found or c.revoked_at is not null or c.expires_at<=now() or c.uses>=c.max_uses then return false; end if;
  insert into public.demo_sessions(token_digest,code_id,expires_at) values(session_digest,c.id,least(c.expires_at,now()+interval '8 hours'));
  update public.commercial_codes set uses=uses+1 where id=c.id;
  return true;
end $$;

revoke all on function public.initialise_workspace_trial(),public.commercial_status_internal(uuid),public.workspace_commercial_status(uuid),public.choose_trial_plan(uuid,text),public.redeem_tester_code(uuid,text),public.guard_workspace_seats(),public.reserve_workspace_generation(uuid,int,int),public.create_commercial_code(uuid,text,text,text,text,int,int,timestamptz),public.revoke_commercial_code(uuid),public.open_demo_session(text,text) from public,anon,authenticated;
grant execute on function public.workspace_commercial_status(uuid),public.choose_trial_plan(uuid,text),public.redeem_tester_code(uuid,text),public.create_commercial_code(uuid,text,text,text,text,int,int,timestamptz),public.revoke_commercial_code(uuid) to authenticated;
grant execute on function public.commercial_status_internal(uuid),public.reserve_workspace_generation(uuid,int,int),public.open_demo_session(text,text) to service_role;

notify pgrst, 'reload schema';
commit;
