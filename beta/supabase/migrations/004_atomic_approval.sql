begin;
create or replace function public.approve_conversation(target_assignment uuid)
returns void language plpgsql security invoker set search_path = public
as $$
declare
  assignment public.mission_assignments%rowtype;
  conversation public.conversations%rowtype;
  reviewed public.conversation_summaries%rowtype;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  select * into assignment from public.mission_assignments
    where id = target_assignment and user_id = auth.uid() for update;
  if assignment.id is null or not public.is_workspace_member(assignment.organisation_id) then
    raise exception 'Conversation not available';
  end if;
  select * into conversation from public.conversations
    where assignment_id = assignment.id and user_id = auth.uid() for update;
  if conversation.id is null then raise exception 'Conversation not available'; end if;
  select * into reviewed from public.conversation_summaries
    where conversation_id = conversation.id and user_id = auth.uid() for update;
  if reviewed.id is null then raise exception 'Review a summary before approving'; end if;
  if reviewed.status = 'approved' then return; end if;
  if reviewed.status <> 'draft' then raise exception 'This summary cannot be approved'; end if;
  update public.conversation_summaries set status = 'approved', approved_at = now(), updated_at = now() where id = reviewed.id;
  update public.observations set participant_approved = true, organisation_id = assignment.organisation_id
    where conversation_id = conversation.id and user_id = auth.uid() and not participant_approved;
  update public.mission_assignments set status = 'completed', completed_at = now() where id = assignment.id;
  update public.conversations set completed_at = now() where id = conversation.id;
end
$$;
revoke all on function public.approve_conversation(uuid) from public;
grant execute on function public.approve_conversation(uuid) to authenticated;
commit;
