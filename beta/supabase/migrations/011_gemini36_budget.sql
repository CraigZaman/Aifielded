begin;

alter table public.ai_generations drop constraint if exists ai_generations_model_check;
alter table public.ai_generations add constraint ai_generations_model_check
  check (model in ('gemini-2.5-flash', 'gemini-3.6-flash'));

create or replace function public.reserve_gemini36_generation(input_token_count integer, output_token_limit integer)
returns uuid language plpgsql security invoker set search_path = public
as $$
declare
  today date := (now() at time zone 'UTC')::date;
  input_rate numeric := case when (now() at time zone 'UTC')::date < date '2027-01-01' then 0.75 else 1.50 end;
  output_rate numeric := case when (now() at time zone 'UTC')::date < date '2027-01-01' then 3.75 else 7.50 end;
  reservation bigint;
  generation_id uuid;
  charged_day date;
begin
  if input_token_count is null or input_token_count < 1 or input_token_count > 100000
    or output_token_limit is null or output_token_limit < 1 or output_token_limit > 4096 then
    raise exception 'AI input or output exceeds allowed size';
  end if;
  -- Standard rates apply to every input modality; output includes thinking tokens.
  -- Reserve maximum possible output plus 20%, including announced January pricing.
  reservation := ceil((input_token_count * input_rate + output_token_limit * output_rate) * 1.2);
  insert into public.ai_daily_budget(day, reserved_micro_usd) values(today, reservation)
  on conflict(day) do update
    set reserved_micro_usd = ai_daily_budget.reserved_micro_usd + excluded.reserved_micro_usd
    where ai_daily_budget.reserved_micro_usd + excluded.reserved_micro_usd <= 1000000
  returning day into charged_day;
  if charged_day is null then raise exception 'Daily AI allowance reached'; end if;
  insert into public.ai_generations(budget_day, model, input_tokens, reserved_micro_usd)
    values(today, 'gemini-3.6-flash', input_token_count, reservation)
    returning id into generation_id;
  return generation_id;
end
$$;
revoke all on function public.reserve_gemini36_generation(integer,integer) from public, anon, authenticated;
grant execute on function public.reserve_gemini36_generation(integer,integer) to service_role;
commit;
