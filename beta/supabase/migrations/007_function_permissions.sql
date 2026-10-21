begin;
-- Supabase may grant anon explicitly through default privileges, independently of PUBLIC.
revoke all on function public.approve_conversation(uuid) from public, anon;
revoke all on function public.replace_mission_synthesis(uuid, jsonb) from public, anon;
revoke all on function public.accept_invitation(text) from public, anon;
revoke all on function public.create_workspace(text) from public, anon;
revoke all on function public.update_own_follow_up(uuid, public.follow_up_status) from public, anon;
revoke all on function public.can_issue_invitation(uuid, public.workspace_role, uuid) from public, anon;
grant execute on function public.approve_conversation(uuid) to authenticated;
grant execute on function public.replace_mission_synthesis(uuid, jsonb) to authenticated;
grant execute on function public.accept_invitation(text) to authenticated;
grant execute on function public.create_workspace(text) to authenticated;
grant execute on function public.update_own_follow_up(uuid, public.follow_up_status) to authenticated;
grant execute on function public.can_issue_invitation(uuid, public.workspace_role, uuid) to authenticated;
commit;
