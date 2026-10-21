begin;

create table if not exists public.mobile_push_devices (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('ios','android')),
  app_version text,
  enabled boolean not null default true,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, token)
);

alter table public.mobile_push_devices enable row level security;
revoke all on public.mobile_push_devices from public, anon;
grant select, insert, update, delete on public.mobile_push_devices to authenticated;
drop policy if exists mobile_push_devices_owner on public.mobile_push_devices;
create policy mobile_push_devices_owner on public.mobile_push_devices
  for all to authenticated using (user_id = auth.uid()) with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.organisation_memberships m
      where m.organisation_id = mobile_push_devices.organisation_id
        and m.user_id = auth.uid() and m.status = 'active'
    )
  );

create index if not exists mobile_push_devices_delivery
  on public.mobile_push_devices(user_id, organisation_id, enabled);

create or replace function public.touch_mobile_push_device(target_token text, target_platform text, target_version text default null)
returns public.mobile_push_devices language plpgsql security definer set search_path = public as $$
declare workspace uuid; result public.mobile_push_devices;
begin
  select organisation_id into workspace from public.organisation_memberships
    where user_id = auth.uid() and status = 'active' order by created_at limit 1;
  if auth.uid() is null or workspace is null then raise exception 'Not authorised'; end if;
  if target_platform not in ('ios','android') or length(target_token) < 20 or length(target_token) > 4096 then raise exception 'Invalid device'; end if;
  insert into public.mobile_push_devices(organisation_id,user_id,token,platform,app_version,enabled,last_seen_at,updated_at)
    values(workspace,auth.uid(),target_token,target_platform,target_version,true,now(),now())
  on conflict(user_id,token) do update set organisation_id=excluded.organisation_id,
    platform=excluded.platform,app_version=excluded.app_version,enabled=true,last_seen_at=now(),updated_at=now()
  returning * into result;
  return result;
end $$;
revoke all on function public.touch_mobile_push_device(text,text,text) from public, anon;
grant execute on function public.touch_mobile_push_device(text,text,text) to authenticated;

commit;
