begin;

create or replace function public.launch_mission(
  requested_mission_id uuid,
  workspace_id uuid,
  mission_title text,
  mission_objective text,
  mission_context text,
  mission_outcome text,
  mission_departments text[],
  participant_ids uuid[],
  invitation_digest text
)
returns jsonb language plpgsql security definer set search_path=public as $$
declare existing public.missions%rowtype; participant uuid; selected_ids uuid[]; new_id uuid;
begin
  if auth.uid() is null or not public.can_manage_workspace(workspace_id) then raise exception 'Not authorised'; end if;
  if requested_mission_id is null or char_length(trim(coalesce(mission_title,''))) not between 4 and 120
    or char_length(trim(coalesce(mission_objective,''))) not between 20 and 2000
    or char_length(coalesce(mission_context,''))>4000
    or char_length(trim(coalesce(mission_outcome,''))) not between 8 and 1000
    or participant_ids is null or cardinality(participant_ids)>200
    or mission_departments is null or cardinality(mission_departments)>50
    or char_length(array_to_string(mission_departments,','))>500
    or invitation_digest is null or invitation_digest !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid mission brief';
  end if;
  select coalesce(array_agg(distinct selected),'{}'::uuid[]) into selected_ids from unnest(participant_ids) selected;
  if exists(select 1 from unnest(selected_ids) selected where not exists (
    select 1 from public.organisation_memberships where organisation_id=workspace_id and user_id=selected and status='active'
  )) then raise exception 'Choose active members of this workspace'; end if;

  -- Reuse the form's request ID so a retry cannot create a second mission or duplicate notifications.
  insert into public.missions(id,organisation_id,created_by,title,objective,context,desired_outcome,departments,status)
    values(requested_mission_id,workspace_id,auth.uid(),trim(mission_title),trim(mission_objective),mission_context,trim(mission_outcome),mission_departments,'active')
    on conflict(id) do nothing returning id into new_id;
  if new_id is null then
    select * into existing from public.missions where id=requested_mission_id for update;
    if existing.organisation_id is distinct from workspace_id or existing.created_by is distinct from auth.uid() then raise exception 'Request ID unavailable'; end if;
    return jsonb_build_object('mission_id',existing.id,'created',false);
  end if;
  insert into public.invitations(organisation_id,mission_id,created_by,role,token_digest,expires_at)
    values(workspace_id,new_id,auth.uid(),'participant',invitation_digest,now()+interval '30 days');
  foreach participant in array selected_ids loop
    perform public.assign_mission_participant(new_id,participant);
  end loop;
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata)
    values(workspace_id,auth.uid(),'mission.created','mission',new_id,jsonb_build_object('assigned_count',cardinality(selected_ids)));
  return jsonb_build_object('mission_id',new_id,'created',true);
end $$;
revoke all on function public.launch_mission(uuid,uuid,text,text,text,text,text[],uuid[],text) from public,anon,authenticated;
grant execute on function public.launch_mission(uuid,uuid,text,text,text,text,text[],uuid[],text) to authenticated;
commit;
