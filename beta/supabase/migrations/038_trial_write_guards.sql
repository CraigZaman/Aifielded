-- Enforce trial expiry below the UI, including security-definer RPC writes.
begin;
create function public.guard_commercial_work() returns trigger language plpgsql security definer set search_path='' as $$
declare workspace uuid; row_data jsonb := to_jsonb(new); s jsonb;
begin
  workspace := (row_data->>'organisation_id')::uuid;
  if workspace is null and row_data->>'mission_id' is not null then
    select organisation_id into workspace from public.missions where id=(row_data->>'mission_id')::uuid;
  end if;
  if workspace is null and row_data->>'conversation_id' is not null then
    select m.organisation_id into workspace from public.conversations c join public.missions m on m.id=c.mission_id where c.id=(row_data->>'conversation_id')::uuid;
  end if;
  if workspace is null and row_data->>'thread_id' is not null then
    select organisation_id into workspace from public.open_dialogue_threads where id=(row_data->>'thread_id')::uuid;
  end if;
  if workspace is null and row_data->>'task_id' is not null then
    select organisation_id into workspace from public.follow_up_tasks where id=(row_data->>'task_id')::uuid;
  end if;
  if workspace is null and row_data->>'suggestion_id' is not null then
    select organisation_id into workspace from public.mission_suggestions where id=(row_data->>'suggestion_id')::uuid;
  end if;
  if workspace is null then raise exception 'Workspace access could not be resolved'; end if;
  -- Read receipts are not new work and should remain available in read-only mode.
  if TG_TABLE_NAME='open_dialogue_turns' and TG_OP='UPDATE' and (row_data-'seen')=(to_jsonb(old)-'seen') then return new; end if;
  s := public.commercial_status_internal(workspace);
  if not (s->>'active')::boolean then raise exception 'Workspace trial has ended. Activate a plan or tester code to continue'; end if;
  return new;
end $$;
revoke all on function public.guard_commercial_work() from public,anon,authenticated;
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'missions','invitations','mission_assignments','conversations','messages','conversation_summaries','observations',
    'themes','hypotheses','findings','follow_up_tasks','follow_up_clarifications','source_records',
    'policy_communications','policy_responses','publication_requests','investigation_proposals',
    'mission_suggestions','suggestion_messages','open_dialogue_threads','open_dialogue_turns',
    'company_profiles','company_documents','company_sources','company_source_snapshots','company_structure_imports'
  ] loop
    if to_regclass('public.'||table_name) is null then raise exception 'Required work table % is missing',table_name; end if;
    execute format('create trigger commercial_work_guard before insert or update on public.%I for each row execute function public.guard_commercial_work()',table_name);
  end loop;
end $$;
-- Confidential reporting, account removal, permission administration and audit records
-- remain separate from commercial processing. Existing visibility policies are unchanged.
notify pgrst, 'reload schema';
commit;
