begin;

-- A Firebase token identifies one app installation. Keep only its latest owner.
delete from public.mobile_push_devices older using public.mobile_push_devices newer
where older.token = newer.token
  and older.id <> newer.id
  and (older.last_seen_at < newer.last_seen_at
    or (older.last_seen_at = newer.last_seen_at and older.id < newer.id));

alter table public.mobile_push_devices
  drop constraint if exists mobile_push_devices_user_id_token_key;
alter table public.mobile_push_devices
  add constraint mobile_push_devices_token_key unique (token);

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
  on conflict(token) do update set organisation_id=excluded.organisation_id,
    user_id=excluded.user_id,platform=excluded.platform,app_version=excluded.app_version,
    enabled=true,last_seen_at=now(),updated_at=now()
  returning * into result;
  return result;
end $$;

commit;
