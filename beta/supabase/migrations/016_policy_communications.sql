begin;

create table public.policy_communications (
  mission_id uuid primary key references public.missions(id) on delete cascade,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  version text not null,
  policy_text text not null,
  briefing text not null,
  source_name text not null,
  questions jsonb not null,
  created_at timestamptz not null default now()
);
create table public.policy_answer_keys (
  mission_id uuid primary key references public.policy_communications(mission_id) on delete cascade,
  questions jsonb not null
);
create table public.policy_responses (
  assignment_id uuid primary key references public.mission_assignments(id) on delete cascade,
  mission_id uuid not null references public.policy_communications(mission_id) on delete cascade,
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  answers integer[] not null,
  score integer not null check(score between 0 and 3),
  acknowledged boolean not null,
  has_concerns boolean not null,
  feedback text not null,
  created_at timestamptz not null default now()
);
create index policy_responses_mission on public.policy_responses(mission_id);

create or replace function public.can_manage_policies(workspace_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.organisation_memberships where organisation_id=workspace_id
    and user_id=auth.uid() and status='active' and role in ('owner','manager','hr'));
$$;
alter table public.policy_communications enable row level security;
alter table public.policy_answer_keys enable row level security;
alter table public.policy_responses enable row level security;
revoke all on public.policy_communications,public.policy_answer_keys,public.policy_responses from public,anon,authenticated;
grant select on public.policy_communications,public.policy_answer_keys,public.policy_responses to authenticated;
create policy policy_read on public.policy_communications for select to authenticated using (
  public.can_manage_policies(organisation_id) or (public.is_workspace_member(organisation_id) and exists(
    select 1 from public.mission_assignments where mission_id=policy_communications.mission_id and user_id=auth.uid())));
create policy policy_keys_read on public.policy_answer_keys for select to authenticated using (exists(
  select 1 from public.policy_communications p where p.mission_id=policy_answer_keys.mission_id and public.can_manage_policies(p.organisation_id)));
create policy policy_responses_read on public.policy_responses for select to authenticated using (
  public.can_manage_policies(organisation_id) or (user_id=auth.uid() and public.is_workspace_member(organisation_id)));

create or replace function public.launch_policy_communication(request_id uuid, workspace_id uuid, policy_title text,
  policy_version text, source_text text, policy_briefing text, source_filename text, quiz jsonb, recipients uuid[])
returns uuid language plpgsql security definer set search_path=public as $$
declare q jsonb; option_text jsonb; safe_questions jsonb := '[]'; participant uuid; existing uuid;
begin
  if auth.uid() is null or not public.can_manage_policies(workspace_id) then raise exception 'Not authorised'; end if;
  if request_id is null or char_length(trim(coalesce(policy_title,''))) not between 4 and 120
    or char_length(trim(coalesce(policy_version,''))) not between 1 and 80
    or char_length(trim(coalesce(source_text,''))) not between 80 and 24000
    or char_length(trim(coalesce(policy_briefing,''))) not between 20 and 3000
    or char_length(coalesce(source_filename,''))>200
    or recipients is null or cardinality(recipients) not between 1 and 200
    or quiz is null or jsonb_typeof(quiz)<>'array' or jsonb_array_length(quiz)<>3 then raise exception 'Invalid policy communication'; end if;
  for q in select value from jsonb_array_elements(quiz) loop
    if jsonb_typeof(q)<>'object' or char_length(trim(coalesce(q->>'question',''))) not between 8 and 500
      or jsonb_typeof(q->'options') is distinct from 'array' or jsonb_array_length(q->'options')<>3
      or jsonb_typeof(q->'correctIndex') is distinct from 'number' or (q->>'correctIndex') !~ '^[012]$'
      or char_length(trim(coalesce(q->>'explanation',''))) not between 8 and 1000
      or char_length(trim(coalesce(q->>'sourceQuote',''))) not between 8 and 500
      or strpos(source_text,q->>'sourceQuote')=0 then raise exception 'Each question needs three options and a quotation from the policy'; end if;
    for option_text in select value from jsonb_array_elements(q->'options') loop
      if jsonb_typeof(option_text)<>'string' or char_length(trim(option_text#>>'{}')) not between 1 and 300 then raise exception 'Invalid answer option'; end if;
    end loop;
    if (select count(distinct lower(trim(value))) from jsonb_array_elements_text(q->'options'))<>3 then raise exception 'Answer options must differ'; end if;
    safe_questions := safe_questions || jsonb_build_array(jsonb_build_object('question',q->>'question','options',q->'options'));
  end loop;
  if exists(select 1 from unnest(recipients) u where not exists(select 1 from public.organisation_memberships
    where organisation_id=workspace_id and user_id=u and status='active')) then raise exception 'Choose active workspace members'; end if;
  insert into public.missions(id,organisation_id,created_by,title,objective,context,desired_outcome,departments,status)
    values(request_id,workspace_id,auth.uid(),trim(policy_title),'Review this policy, discuss questions and complete the three-question understanding check.',
      policy_briefing,'Record acknowledgement, checked understanding and explicitly shared concerns.','{}','active') on conflict(id) do nothing returning id into existing;
  if existing is null then
    if not exists(select 1 from public.missions m join public.policy_communications p on p.mission_id=m.id
      where m.id=request_id and m.organisation_id=workspace_id and m.created_by=auth.uid()) then raise exception 'Request ID unavailable'; end if;
    return request_id;
  end if;
  insert into public.policy_communications values(request_id,workspace_id,trim(policy_version),source_text,policy_briefing,coalesce(source_filename,''),safe_questions,now());
  insert into public.policy_answer_keys values(request_id,quiz);
  for participant in select distinct unnest(recipients) loop perform public.assign_mission_participant(request_id,participant); end loop;
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id)
    values(workspace_id,auth.uid(),'policy.published','mission',request_id);
  return request_id;
end $$;

-- Even a direct call to the old written-response/approval routes cannot bypass the check.
create or replace function public.guard_policy_completion()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.status='completed' and exists(select 1 from public.policy_communications where mission_id=new.mission_id)
    and not exists(select 1 from public.policy_responses where assignment_id=new.id and user_id=new.user_id and mission_id=new.mission_id)
    then raise exception 'Complete the policy understanding check first'; end if;
  return new;
end $$;
create trigger guard_policy_completion before insert or update on public.mission_assignments for each row execute function public.guard_policy_completion();

create or replace function public.submit_policy_check(target_assignment uuid, selected_answers integer[], confirmed_receipt boolean,
  concerns boolean, shared_feedback text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare a public.mission_assignments; previous public.policy_responses; keys jsonb; result_score integer:=0;
  c uuid; i integer; response_summary text;
begin
  select * into a from public.mission_assignments where id=target_assignment for update;
  if not found or auth.uid() is null or a.user_id<>auth.uid() or not public.is_workspace_member(a.organisation_id)
    then raise exception 'Assignment not available'; end if;
  select questions into keys from public.policy_answer_keys where mission_id=a.mission_id;
  if keys is null then raise exception 'Policy not available'; end if;
  select * into previous from public.policy_responses where assignment_id=a.id;
  if found then return jsonb_build_object('score',previous.score,'questions',keys); end if;
  if a.status not in ('invited','in_progress') or not exists(select 1 from public.missions where id=a.mission_id and status='active')
    then raise exception 'Policy responses are closed'; end if;
  if selected_answers is null or cardinality(selected_answers)<>3 or array_ndims(selected_answers)<>1 or array_lower(selected_answers,1)<>1
    or exists(select 1 from unnest(selected_answers) v where v is null or v not between 0 and 2)
    or confirmed_receipt is distinct from true or concerns is null or shared_feedback is null or char_length(shared_feedback)>2000
    then raise exception 'Complete all three questions and confirm receipt'; end if;
  for i in 1..3 loop if selected_answers[i]=(keys->(i-1)->>'correctIndex')::integer then result_score:=result_score+1; end if; end loop;
  insert into public.policy_responses values(a.id,a.mission_id,a.organisation_id,auth.uid(),selected_answers,result_score,true,concerns,trim(shared_feedback),now());
  insert into public.conversations(assignment_id,mission_id,user_id) values(a.id,a.mission_id,auth.uid()) on conflict(assignment_id) do nothing;
  select id into c from public.conversations where assignment_id=a.id;
  response_summary := 'Policy receipt acknowledged. Understanding check: '||result_score||'/3 correct. '||
    case when result_score=3 then 'All three questions answered correctly.' else 'Further clarification is recommended.' end||
    case when concerns then ' Employee flagged a concern.' else ' No concern flagged.' end;
  -- Only the assessment and the employee's explicitly shared feedback go to HR, never private chat.
  delete from public.observations where conversation_id=c and not participant_approved;
  insert into public.conversation_summaries(conversation_id,user_id,summary,status,approved_at)
    values(c,auth.uid(),response_summary,'approved',now()) on conflict(conversation_id) do update
    set summary=excluded.summary,status='approved',approved_at=now(),updated_at=now();
  if length(trim(shared_feedback))>0 then
    insert into public.observations(organisation_id,mission_id,conversation_id,user_id,category,summary,detail,confidentiality,confidence,participant_approved)
      values(a.organisation_id,a.mission_id,c,auth.uid(),'policy','Employee-shared policy question or concern',trim(shared_feedback),'SHARE',1,true);
  end if;
  update public.mission_assignments set status='completed',started_at=coalesce(started_at,now()),completed_at=now() where id=a.id;
  update public.conversations set completed_at=now() where id=c;
  insert into public.audit_events(organisation_id,actor_id,action,entity_type,entity_id,metadata)
    values(a.organisation_id,auth.uid(),'policy.check_submitted','mission_assignment',a.id,jsonb_build_object('score',result_score));
  return jsonb_build_object('score',result_score,'questions',keys);
end $$;

create or replace function public.policy_check_result(target_assignment uuid)
returns jsonb language sql stable security definer set search_path=public as $$
  select jsonb_build_object('score',r.score,'questions',k.questions) from public.policy_responses r
    join public.policy_answer_keys k on k.mission_id=r.mission_id where r.assignment_id=target_assignment
    and r.user_id=auth.uid() and public.is_workspace_member(r.organisation_id);
$$;
revoke all on function public.can_manage_policies(uuid),public.launch_policy_communication(uuid,uuid,text,text,text,text,text,jsonb,uuid[]),
  public.guard_policy_completion(),public.submit_policy_check(uuid,integer[],boolean,boolean,text),public.policy_check_result(uuid) from public,anon,authenticated;
grant execute on function public.can_manage_policies(uuid),public.launch_policy_communication(uuid,uuid,text,text,text,text,text,jsonb,uuid[]),
  public.submit_policy_check(uuid,integer[],boolean,boolean,text),public.policy_check_result(uuid) to authenticated;
commit;
