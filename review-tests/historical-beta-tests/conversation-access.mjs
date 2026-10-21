import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const require = createRequire(path.join(process.argv[3] || root, 'package.json'));
const { PGlite } = require('@electric-sql/pglite');
const db = new PGlite();
await db.exec(`
create role anon; create role authenticated;
create schema auth; create schema storage; create schema extensions;
create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql as $$select nullif(current_setting('test.uid', true), '')::uuid$$;
create function auth.jwt() returns jsonb language sql as $$select '{}'::jsonb$$;
create function extensions.digest(text,text) returns bytea language sql as $$select sha256(convert_to($1,'UTF8'))$$;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key,bucket_id text,name text);
create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$;
alter default privileges in schema public grant execute on functions to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
grant usage on schema public, auth to anon, authenticated;
`);
for (const file of ['001_core.sql', '002_invitation_profiles.sql', '003_invitation_security.sql', '004_atomic_approval.sql', '005_atomic_synthesis.sql', '006_conversation_access.sql', '007_function_permissions.sql']) {
  await db.exec(readFileSync(path.join(root, 'supabase/migrations', file), 'utf8').replace('create extension if not exists pgcrypto;', ''));
}
await db.exec(readFileSync(path.join(root, 'supabase/migrations/006_conversation_access.sql'), 'utf8'));
const id = number => `00000000-0000-4000-8000-${String(number).padStart(12, '0')}`;
const [employee, other, org, foreignOrg, mission, foreignMission, assignment, foreignAssignment, conversation, observation] = Array.from({ length: 10 }, (_, index) => id(index + 1));
await db.exec(`
insert into auth.users(id) values ('${employee}'), ('${other}');
insert into organisations(id, name, slug, created_by) values ('${org}', 'Company A', 'company-a', '${employee}'), ('${foreignOrg}', 'Company B', 'company-b', '${other}');
insert into organisation_memberships(organisation_id, user_id, role) values ('${org}', '${employee}', 'participant'), ('${foreignOrg}', '${other}', 'participant');
insert into missions(id, organisation_id, title, objective, created_by) values ('${mission}', '${org}', 'Mission A', 'Test', '${employee}'), ('${foreignMission}', '${foreignOrg}', 'Mission B', 'Test', '${other}');
insert into mission_assignments(id, organisation_id, mission_id, user_id) values ('${assignment}', '${org}', '${mission}', '${employee}'), ('${foreignAssignment}', '${foreignOrg}', '${foreignMission}', '${other}');
set role authenticated;
set test.uid = '${employee}';
`);
await assert.rejects(db.query('insert into conversations(assignment_id, mission_id, user_id) values ($1,$2,$3)', [foreignAssignment, foreignMission, employee]));
await assert.rejects(db.query('insert into conversations(assignment_id, mission_id, user_id) values ($1,$2,$3)', [assignment, foreignMission, employee]));
await db.query('insert into conversations(id, assignment_id, mission_id, user_id) values ($1,$2,$3,$4)', [conversation, assignment, mission, employee]);
await assert.rejects(db.query('update mission_assignments set mission_id=$1 where id=$2', [foreignMission, assignment]));
await assert.rejects(db.query('update conversations set user_id=$1 where id=$2', [other, conversation]));
const insertObservation = (workspace, targetMission) => db.query(`insert into observations(id, organisation_id, mission_id, conversation_id, user_id, category, summary, detail, confidentiality, confidence) values ($1,$2,$3,$4,$5,'process','Test','Test','PRIVATE',0.8)`, [observation, workspace, targetMission, conversation, employee]);
await assert.rejects(insertObservation(foreignOrg, mission));
await assert.rejects(insertObservation(org, foreignMission));
await insertObservation(null, mission);
await assert.rejects(db.query('update observations set organisation_id=$1 where id=$2', [foreignOrg, observation]));
await db.query(`insert into messages(conversation_id,sender,content,confidentiality) values ($1,'participant','Private contribution','PRIVATE')`, [conversation]);
await db.query(`insert into conversation_summaries(conversation_id,user_id,summary) values ($1,$2,'Review') on conflict(conversation_id) do update set conversation_id=excluded.conversation_id,user_id=excluded.user_id,summary=excluded.summary`, [conversation, employee]);
await db.query('select approve_conversation($1)', [assignment]);
assert.equal((await db.query('select status from mission_assignments where id=$1', [assignment])).rows[0].status, 'completed');
assert.equal((await db.query('select confidentiality from observations where id=$1', [observation])).rows[0].confidentiality, 'PRIVATE');
await db.exec(`reset role; update organisation_memberships set status='suspended' where user_id='${employee}'; set role authenticated;`);
for (const table of ['conversations', 'messages', 'conversation_summaries', 'observations', 'mission_assignments']) {
  assert.equal((await db.query(`select * from ${table}`)).rows.length, 0, `suspended access: ${table}`);
}
await assert.rejects(db.query(`insert into messages(conversation_id,sender,content) values ($1,'participant','Blocked')`, [conversation]));
await assert.rejects(db.query('select approve_conversation($1)', [assignment]));
const signatures = ['approve_conversation(uuid)', 'replace_mission_synthesis(uuid,jsonb)', 'accept_invitation(text)', 'create_workspace(text)', 'update_own_follow_up(uuid,public.follow_up_status)', 'can_issue_invitation(uuid,public.workspace_role,uuid)'];
for (const signature of signatures) {
  const { rows } = await db.query("select has_function_privilege('anon',$1,'EXECUTE') as anonymous, has_function_privilege('authenticated',$1,'EXECUTE') as signed_in", [`public.${signature}`]);
  assert.equal(rows[0].anonymous, false);
  assert.equal(rows[0].signed_in, true);
}
await db.close();
console.log('PASS: cross-workspace conversation/evidence forgery blocked; approval works; suspended users lose dialogue access; anonymous grants revoked');
