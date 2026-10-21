begin;
create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);
alter table public.platform_admins enable row level security;
revoke all on public.platform_admins from public, anon, authenticated;
grant select, insert, delete on public.platform_admins to service_role;

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select auth.uid() is not null and exists(select 1 from public.platform_admins where user_id=auth.uid());
$$;
revoke all on function public.is_platform_admin() from public, anon, authenticated;
grant execute on function public.is_platform_admin() to authenticated;

create table if not exists public.platform_admin_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.platform_admins(user_id),
  target_user_id uuid,
  action text not null check(action in ('create_test_account','reset_password','remove_login')),
  status text not null default 'pending' check(status in ('pending','succeeded','failed')),
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
alter table public.platform_admin_events enable row level security;
revoke all on public.platform_admin_events from public, anon, authenticated;
grant select, insert, update on public.platform_admin_events to service_role;
commit;
