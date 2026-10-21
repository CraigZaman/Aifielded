begin;
-- Qualify the outer attachment ID; an unqualified ID resolves to the inner case.
alter policy concern_files_insert on public.concern_files with check (
 exists (
  select 1 from public.confidential_concerns c
  where c.id = concern_files.concern_id
    and c.author_id = auth.uid()
    and c.status <> 'closed'
    and concern_files.storage_path = c.organisation_id::text || '/' || c.id::text || '/' || concern_files.id::text
 )
);
commit;
