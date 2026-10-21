begin;

create or replace function public.save_conversation_draft(target_assignment uuid, expected_message_ids uuid[], draft_summary text, draft_observations jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare a public.mission_assignments%rowtype; c public.conversations%rowtype; actual_ids uuid[]; review_id uuid;
begin
  select * into a from public.mission_assignments where id=target_assignment for update;
  if auth.uid() is null or a.user_id is distinct from auth.uid() or not public.is_workspace_member(a.organisation_id)
    or a.status not in ('invited','in_progress')
    or not exists(select 1 from public.missions where id=a.mission_id and status='active') then
    raise exception 'Assignment is not open';
  end if;
  select * into c from public.conversations where assignment_id=a.id and user_id=auth.uid() for update;
  if c.id is null then raise exception 'Conversation not found'; end if;
  select array_agg(id order by id) into actual_ids from public.messages where conversation_id=c.id;
  if actual_ids is distinct from (select array_agg(x order by x) from unnest(expected_message_ids) x)
    or not exists(select 1 from public.messages where conversation_id=c.id and sender='participant') then
    raise exception 'Conversation changed; prepare a new summary';
  end if;
  if draft_summary is null or char_length(draft_summary) not between 1 and 20000
    or jsonb_typeof(draft_observations) is distinct from 'array' or jsonb_array_length(draft_observations)>12 then
    raise exception 'Invalid draft';
  end if;
  if exists(select 1 from public.conversation_summaries where conversation_id=c.id and status='approved') then
    raise exception 'Approved response cannot be replaced';
  end if;
  if exists(select 1 from jsonb_array_elements(draft_observations) item where
    coalesce(item->>'sourceConfidentiality','') not in ('PRIVATE','CONTRIBUTE','SHARE')
    or coalesce(item->>'category','') not in ('process','bottleneck','opportunity','risk','dependency','sentiment','capability','policy')
    or char_length(coalesce(item->>'summary','')) not between 1 and 1000
    or char_length(coalesce(item->>'detail',''))>4000
    or not exists(select 1 from public.messages m where m.conversation_id=c.id and m.sender='participant' and m.confidentiality::text=item->>'sourceConfidentiality')) then
    raise exception 'Invalid observation';
  end if;
  delete from public.observations where conversation_id=c.id and not participant_approved;
  delete from public.conversation_summaries where conversation_id=c.id and status<>'approved';
  insert into public.conversation_summaries(conversation_id,user_id,summary,status)
    values(c.id,auth.uid(),draft_summary,'draft') returning id into review_id;
  insert into public.observations(organisation_id,mission_id,conversation_id,user_id,category,summary,detail,confidentiality,confidence,participant_approved)
    select a.organisation_id,a.mission_id,c.id,auth.uid(),item->>'category',item->>'summary',coalesce(item->>'detail',''),
      (item->>'sourceConfidentiality')::public.confidentiality_state,(item->>'confidence')::numeric,false
    from jsonb_array_elements(draft_observations) item;
  return jsonb_build_object('review_id',review_id);
end $$;

create or replace function public.approve_conversation(target_assignment uuid)
returns void language plpgsql security definer set search_path = public as $$
declare a public.mission_assignments%rowtype; c public.conversations%rowtype; reviewed public.conversation_summaries%rowtype;
begin
  select * into a from public.mission_assignments where id=target_assignment for update;
  if auth.uid() is null or a.user_id is distinct from auth.uid() or not public.is_workspace_member(a.organisation_id) then raise exception 'Not authorised'; end if;
  select * into c from public.conversations where assignment_id=a.id and user_id=auth.uid() for update;
  select * into reviewed from public.conversation_summaries where conversation_id=c.id and user_id=auth.uid() for update;
  if reviewed.status='approved' and a.status='completed' then return; end if;
  if reviewed.id is null or reviewed.status<>'draft' or a.status not in ('invited','in_progress')
    or not exists(select 1 from public.missions where id=a.mission_id and status='active') then raise exception 'Review a current summary before approving'; end if;
  update public.conversation_summaries set status='approved',approved_at=now(),updated_at=now() where id=reviewed.id;
  update public.observations set participant_approved=true,organisation_id=a.organisation_id where conversation_id=c.id and user_id=auth.uid() and not participant_approved;
  update public.mission_assignments set status='completed',completed_at=now() where id=a.id;
  update public.conversations set completed_at=now() where id=c.id;
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id)
    values(a.organisation_id,auth.uid(),'conversation.approved','conversation',c.id);
end $$;

create or replace function public.approve_conversation_review(target_assignment uuid, expected_review uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform 1 from public.mission_assignments where id=target_assignment and user_id=auth.uid() for update;
  if not found or not exists(select 1 from public.conversation_summaries s join public.conversations c on c.id=s.conversation_id
    where c.assignment_id=target_assignment and c.user_id=auth.uid() and s.id=expected_review) then
    raise exception 'The summary changed. Reload and review it again';
  end if;
  perform public.approve_conversation(target_assignment);
end $$;

create or replace function public.guard_conversation_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare a public.mission_assignments%rowtype;
begin
  select a1.* into a from public.mission_assignments a1 join public.conversations c on c.assignment_id=a1.id
    where c.id=new.conversation_id for update of a1;
  if auth.uid() is null or a.user_id is distinct from auth.uid() or not public.is_workspace_member(a.organisation_id)
    or a.status not in ('invited','in_progress') or not exists(select 1 from public.missions where id=a.mission_id and status='active') then
    raise exception 'Assignment is not open';
  end if;
  if exists(select 1 from public.conversation_summaries where conversation_id=new.conversation_id and status='approved') then raise exception 'Conversation is already approved'; end if;
  delete from public.observations where conversation_id=new.conversation_id and not participant_approved;
  delete from public.conversation_summaries where conversation_id=new.conversation_id and status<>'approved';
  return new;
end $$;
drop trigger if exists guard_conversation_message on public.messages;
create trigger guard_conversation_message before insert on public.messages for each row execute function public.guard_conversation_message();

create or replace function public.guard_assignment_completion()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if old.status='completed' and (new.status is distinct from old.status or new.completed_at is distinct from old.completed_at) then raise exception 'Completed assignment cannot be reopened'; end if;
  if new.status='completed' and not exists(select 1 from public.conversations c join public.conversation_summaries s on s.conversation_id=c.id
    where c.assignment_id=new.id and s.status='approved' and s.user_id=new.user_id) then raise exception 'Approve a response before completing'; end if;
  if new.status<>'completed' and new.completed_at is not null then raise exception 'Assignment is not completed'; end if;
  return new;
end $$;
drop trigger if exists guard_assignment_completion on public.mission_assignments;
create trigger guard_assignment_completion before update on public.mission_assignments for each row execute function public.guard_assignment_completion();

revoke insert,update,delete on public.conversation_summaries,public.observations from public,anon,authenticated;
revoke update,delete on public.conversations from public,anon,authenticated;
revoke update(completed_at) on public.conversations from authenticated;
revoke all on function public.save_conversation_draft(uuid,uuid[],text,jsonb) from public,anon,authenticated;
revoke all on function public.approve_conversation(uuid) from public,anon,authenticated;
revoke all on function public.approve_conversation_review(uuid,uuid) from public,anon,authenticated;
revoke all on function public.guard_conversation_message(),public.guard_assignment_completion() from public,anon,authenticated;
grant execute on function public.save_conversation_draft(uuid,uuid[],text,jsonb),public.approve_conversation_review(uuid,uuid) to authenticated;
commit;
