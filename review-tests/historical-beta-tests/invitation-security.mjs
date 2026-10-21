import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const db = new PGlite();
await db.exec(`
create role authenticated;
create schema auth;
create schema extensions;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('test.uid',true),'')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select '{"email":"test@example.com"}'::jsonb $$;
create function extensions.digest(text,text) returns bytea language sql immutable as $$ select sha256(convert_to($1,'UTF8')) $$;
create type workspace_role as enum ('owner','manager','hr','participant','consultant');
create type membership_status as enum ('active','suspended');
create type invitation_status as enum ('active','revoked','expired');
create table organisation_memberships(id uuid default gen_random_uuid(), organisation_id uuid, user_id uuid, role workspace_role, status membership_status, unique(organisation_id,user_id));
create table missions(id uuid primary key, organisation_id uuid, status text);
create table invitations(id uuid primary key default gen_random_uuid(),organisation_id uuid,mission_id uuid,created_by uuid,role workspace_role,invited_email text,token_digest text,status invitation_status default 'active',expires_at timestamptz default now()+interval '1 day',uses_count int default 0,max_uses int default 10);
create table mission_assignments(id uuid default gen_random_uuid(),organisation_id uuid,mission_id uuid,user_id uuid,invitation_id uuid,unique(mission_id,user_id));
create table audit_events(organisation_id uuid,actor_id uuid,action text,entity_type text,entity_id uuid);
create function can_admin_memberships(uuid) returns boolean language sql security definer as $$ select exists(select 1 from organisation_memberships where organisation_id=$1 and user_id=auth.uid() and status='active' and role in ('owner','manager')) $$;
create function is_workspace_owner(uuid) returns boolean language sql security definer as $$ select exists(select 1 from organisation_memberships where organisation_id=$1 and user_id=auth.uid() and status='active' and role='owner') $$;
grant usage on schema public,auth to authenticated;
grant all on all tables in schema public to authenticated;
alter table invitations enable row level security;
alter table organisation_memberships enable row level security;
create policy members_read on organisation_memberships for select using(true);
create policy invites_read on invitations for select using(true);
`);
await db.exec(readFileSync(process.argv[2], 'utf8'));
const org='10000000-0000-0000-0000-000000000001';
const owner='20000000-0000-0000-0000-000000000001';
const manager='20000000-0000-0000-0000-000000000002';
const employee='20000000-0000-0000-0000-000000000003';
const mission='30000000-0000-0000-0000-000000000001';
await db.query(`insert into organisation_memberships(organisation_id,user_id,role,status) values ($1,$2,'owner','active'),($1,$3,'manager','active'),($1,$4,'participant','suspended')`,[org,owner,manager,employee]);
await db.query(`insert into missions values($1,$2,'active')`,[mission,org]);
async function asUser(id){await db.exec('reset role');await db.query(`select set_config('test.uid',$1,false)`,[id]);await db.exec('set role authenticated');}
await asUser(manager);
for (const role of ['owner','manager']) {
 await assert.rejects(db.query(`insert into invitations(organisation_id,created_by,role) values($1,$2,$3)`,[org,manager,role]),/row-level security/);
}
await assert.rejects(db.query(`insert into invitations(organisation_id,mission_id,created_by,role) values($1,$2,$3,'owner')`,[org,mission,manager]),/row-level security/);
await db.query(`insert into invitations(organisation_id,mission_id,created_by,role,token_digest) values($1,$2,$3,'participant',encode(extensions.digest('mission-token','sha256'),'hex'))`,[org,mission,manager]).catch(async error=>{
 // The application hashes tokens outside PostgreSQL; test fixture setup uses admin.
 if(!/permission denied for schema extensions/.test(error.message)) throw error;
 await db.exec('reset role');
 await db.query(`insert into invitations(organisation_id,mission_id,created_by,role,token_digest) values($1,$2,$3,'participant',encode(extensions.digest('mission-token','sha256'),'hex'))`,[org,mission,manager]);
 await db.exec('set role authenticated');
});
await assert.rejects(db.exec(`update invitations set role='owner'`),/permission denied/);
await assert.rejects(db.query(`update organisation_memberships set user_id=$1 where user_id=$2`,[manager,employee]),/permission denied/);
await asUser(owner);
const accepted=await db.query(`select accept_invitation('mission-token') result`);
assert.equal(accepted.rows[0].result.role,'owner');
assert.equal((await db.query(`select role from organisation_memberships where user_id=$1`,[owner])).rows[0].role,'owner');
await asUser(employee);
await assert.rejects(db.exec(`select accept_invitation('mission-token')`),/suspended/);
await db.close();
console.log('PASS: role escalation, immutable identities, owner preservation and suspended invitation rejection');
