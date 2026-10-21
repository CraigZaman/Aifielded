begin;
create or replace function public.company_directory(workspace uuid)
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare members jsonb; departments jsonb;
begin
  if greatest(public.company_access_level(workspace,'structure'),public.company_access_level(workspace,'people'),public.company_access_level(workspace,'access'))<1 then raise exception 'Company directory access is not enabled'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',m.user_id,'membershipId',m.id,'name',p.full_name,'role',m.role,'status',m.status,'department',coalesce(d.key,''),'reportsTo',case when public.company_access_level(workspace,'structure')>0 then wp.reports_to else null end,'confirmed',wp.confirmed_by is not null,'businessRole',p.business_role) order by p.full_name),'[]') into members
    from public.organisation_memberships m join public.profiles p on p.id=m.user_id
    left join public.workspace_people wp on wp.organisation_id=m.organisation_id and wp.user_id=m.user_id
    left join public.workspace_departments d on d.organisation_id=m.organisation_id and d.id=wp.department_id
    where m.organisation_id=workspace;
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'key',key,'name',name,'headUserId',case when public.company_access_level(workspace,'structure')>0 then head_user_id else null end) order by name),'[]') into departments from public.workspace_departments where organisation_id=workspace;
  return jsonb_build_object('members',members,'departments',departments);
end $$;
revoke all on function public.company_directory(uuid) from public,anon,authenticated;
grant execute on function public.company_directory(uuid) to authenticated;
commit;
