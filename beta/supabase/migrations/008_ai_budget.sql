begin;

create table if not exists public.ai_daily_budget (
  day date primary key,
  reserved_micro_usd bigint not null default 0 check (reserved_micro_usd between 0 and 1000000)
);
create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  budget_day date not null references public.ai_daily_budget(day),
  model text not null check (model = 'gemini-2.5-flash'),
  input_tokens integer not null,
  reserved_micro_usd bigint not null,
  status text not null default 'reserved' check (status in ('reserved', 'succeeded', 'failed')),
  usage jsonb,
  created_at timestamptz not null default now(),
  finished_at timestamptz
);
alter table public.ai_daily_budget enable row level security;
alter table public.ai_generations enable row level security;
revoke all on public.ai_daily_budget, public.ai_generations from public, anon, authenticated;
grant select, insert, update on public.ai_daily_budget, public.ai_generations to service_role;

create or replace function public.reserve_ai_generation(input_token_count integer)
returns uuid language plpgsql security invoker set search_path = public
as $$
declare
  today date := (now() at time zone 'UTC')::date;
  reservation bigint;
  generation_id uuid;
  charged_day date;
begin
  if input_token_count is null or input_token_count < 1 or input_token_count > 100000 then
    raise exception 'AI input exceeds allowed size';
  end if;
  -- Highest input rate ($1/M audio), 4096 output tokens ($2.50/M), plus 20% margin.
  -- Reserve the full upper bound and never refund failures or unused output capacity.
  reservation := ceil((input_token_count + 4096 * 2.5) * 1.2);
  insert into public.ai_daily_budget(day, reserved_micro_usd) values(today, reservation)
  on conflict(day) do update
    set reserved_micro_usd = ai_daily_budget.reserved_micro_usd + excluded.reserved_micro_usd
    where ai_daily_budget.reserved_micro_usd + excluded.reserved_micro_usd <= 1000000
  returning day into charged_day;
  if charged_day is null then raise exception 'Daily AI allowance reached'; end if;
  insert into public.ai_generations(budget_day, model, input_tokens, reserved_micro_usd)
    values(today, 'gemini-2.5-flash', input_token_count, reservation)
    returning id into generation_id;
  return generation_id;
end
$$;
revoke all on function public.reserve_ai_generation(integer) from public, anon, authenticated;
grant execute on function public.reserve_ai_generation(integer) to service_role;
commit;
