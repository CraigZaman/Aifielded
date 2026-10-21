begin;
create function public.create_company_workspace(workspace_name text,business_description text default '',company_website text default '')
returns uuid language plpgsql security definer set search_path=public as $$
declare workspace uuid;
begin
 if auth.uid() is null then raise exception 'Sign in required'; end if;
 perform 1 from public.profiles where id=auth.uid() for update;
 select organisation_id into workspace from public.organisation_memberships where user_id=auth.uid();
 if workspace is not null then return workspace; end if;
 workspace:=public.create_workspace(workspace_name);
 perform public.save_company_profile(workspace,0,jsonb_build_object('company_name',trim(workspace_name),'description',coalesce(business_description,''),'website',coalesce(company_website,'')));
 return workspace;
end $$;
revoke all on function public.create_company_workspace(text,text,text) from public,anon,authenticated;
grant execute on function public.create_company_workspace(text,text,text) to authenticated;
commit;
