begin;

create or replace function public.replace_mission_synthesis(target_mission uuid, synthesis jsonb)
returns void language plpgsql security invoker set search_path = public
as $$
declare workspace_id uuid;
begin
  select organisation_id into workspace_id from public.missions where id = target_mission for update;
  if auth.uid() is null or workspace_id is null or not public.can_manage_workspace(workspace_id) then
    raise exception 'Not authorised';
  end if;
  if jsonb_typeof(synthesis->'themes') is distinct from 'array'
    or jsonb_typeof(synthesis->'hypotheses') is distinct from 'array'
    or jsonb_typeof(synthesis->'findings') is distinct from 'array' then
    raise exception 'Invalid synthesis';
  end if;
  if jsonb_array_length(synthesis->'themes') > 8
    or jsonb_array_length(synthesis->'hypotheses') > 6
    or jsonb_array_length(synthesis->'findings') > 8 then
    raise exception 'Synthesis exceeds limits';
  end if;

  delete from public.themes where mission_id = target_mission;
  delete from public.hypotheses where mission_id = target_mission;
  delete from public.findings where mission_id = target_mission;

  insert into public.themes(organisation_id, mission_id, title, description, evidence_count, participant_count, confidence)
  select workspace_id, target_mission, title, description, "evidenceCount", "participantCount", confidence
  from jsonb_to_recordset(synthesis->'themes') as x(title text, description text, "evidenceCount" integer, "participantCount" integer, confidence numeric);

  insert into public.hypotheses(organisation_id, mission_id, title, description, evidence_for, evidence_against, confidence)
  select workspace_id, target_mission, title, description, "evidenceFor", "evidenceAgainst", confidence
  from jsonb_to_recordset(synthesis->'hypotheses') as x(title text, description text, "evidenceFor" text[], "evidenceAgainst" text[], confidence numeric);

  insert into public.findings(organisation_id, mission_id, title, summary, evidence_summary, confidence, impact, recommended_action)
  select workspace_id, target_mission, title, summary, "evidenceSummary", confidence, impact, "recommendedAction"
  from jsonb_to_recordset(synthesis->'findings') as x(title text, summary text, "evidenceSummary" text, confidence numeric, impact text, "recommendedAction" text);
end;
$$;

revoke all on function public.replace_mission_synthesis(uuid, jsonb) from public;
grant execute on function public.replace_mission_synthesis(uuid, jsonb) to authenticated;
commit;
