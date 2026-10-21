import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const root = path.resolve(process.argv[2] || '.');
const require = createRequire(path.join(process.argv[3] || root, 'package.json'));
const { PGlite } = require('@electric-sql/pglite');
const db = new PGlite();
await db.exec(`
create role anon; create role authenticated; create role service_role;
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
grant usage on schema public, auth to anon, authenticated, service_role;
`);
for (const file of ['001_core.sql','002_invitation_profiles.sql','003_invitation_security.sql','004_atomic_approval.sql','005_atomic_synthesis.sql','006_conversation_access.sql','007_function_permissions.sql','008_ai_budget.sql','009_work_routing.sql']) {
  await db.exec(readFileSync(path.join(root, 'supabase/migrations', file), 'utf8').replace('create extension if not exists pgcrypto;', ''));
}
await db.exec(readFileSync(path.join(root, 'supabase/migrations/009_work_routing.sql'), 'utf8'));
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const [owner, employee, stranger, hr, org, foreignOrg, mission, foreignMission] = Array.from({ length: 8 }, (_, i) => id(i + 1));
await db.exec(`
insert into auth.users(id) values ('${owner}'),('${employee}'),('${stranger}'),('${hr}');
insert into organisations(id,name,slug,created_by) values ('${org}','Company A','company-a','${owner}'),('${foreignOrg}','Company B','company-b','${stranger}');
insert into organisation_memberships(organisation_id,user_id,role) values
('${org}','${owner}','owner'),('${org}','${employee}','participant'),('${org}','${hr}','hr'),('${foreignOrg}','${stranger}','owner');
insert into missions(id,organisation_id,title,objective,created_by,status) values
('${mission}','${org}','Policy review','Read and acknowledge','${hr}','active'),('${foreignMission}','${foreignOrg}','Other review','Confidential','${stranger}','active');
set role authenticated; set test.uid='${hr}';
`);
const create = (recipient = employee, linkedMission = mission) => db.query('select create_follow_up($1,$2,$3,$4,$5) as id', [org, recipient, 'Read safety policy', 'Confirm the latest safety procedure.', linkedMission]);
await assert.rejects(create(stranger));
await assert.rejects(create(employee, foreignMission));
const task = (await create()).rows[0].id;
assert.equal((await db.query('select * from work_notifications')).rows.length, 1);
await assert.rejects(db.query('update follow_up_tasks set assignee_id=$1 where id=$2', [stranger, task]));
await assert.rejects(db.query('select update_own_follow_up($1,$2)', [task, 'completed']));
const assignment = (await db.query('select assign_mission_participant($1,$2) as id', [mission, employee])).rows[0].id;
assert.equal((await db.query('select assign_mission_participant($1,$2) as id', [mission, employee])).rows[0].id, assignment);
assert.equal((await db.query("select * from work_notifications where kind='mission_assigned'")).rows.length, 1);
await assert.rejects(db.query('select assign_mission_participant($1,$2)', [mission, stranger]));
await db.exec(`set test.uid='${employee}'`);
assert.equal((await db.query('select id from follow_up_tasks')).rows[0].id, task);
assert.equal((await db.query('select id from mission_assignments')).rows[0].id, assignment);
await db.query('select submit_written_response($1,$2,$3,$4)', [assignment,'Safety feedback','The revised safety process is clear and has been reviewed.','SHARE']);
await db.query('select submit_written_response($1,$2,$3,$4)', [assignment,'Duplicate','This duplicate must not overwrite an approved response.','SHARE']);
assert.equal((await db.query('select status from mission_assignments where id=$1',[assignment])).rows[0].status,'completed');
assert.equal((await db.query('select count(*)::int as count from observations')).rows[0].count,1);
await assert.rejects(create());
await db.query('select update_own_follow_up($1,$2)', [task, 'acknowledged']);
await db.query('select add_follow_up_clarification($1,$2)', [task, 'The attachment needs clarification.']);
await db.query('select update_own_follow_up($1,$2)', [task, 'completed']);
const completed = (await db.query('select completed_at from follow_up_tasks where id=$1', [task])).rows[0].completed_at;
await db.query('select update_own_follow_up($1,$2)', [task, 'completed']);
assert.equal(String((await db.query('select completed_at from follow_up_tasks where id=$1', [task])).rows[0].completed_at), String(completed));
await db.exec(`set test.uid='${owner}'`);
assert.equal((await db.query('select status from follow_up_tasks where id=$1', [task])).rows[0].status, 'completed');
assert.equal((await db.query('select content from follow_up_clarifications')).rows.length, 1);
assert.equal((await db.query('select summary from observations')).rows[0].summary,'Safety feedback');
await db.query('select assign_mission_participant($1,$2)',[mission,hr]);
await db.exec(`set test.uid='${hr}'`);
const hrAssignment = (await db.query('select id from mission_assignments where user_id=$1',[hr])).rows[0].id;
await db.query('select submit_written_response($1,$2,$3,$4)',[hrAssignment,'Private response','My private policy comments must not reach other managers.','PRIVATE']);
await db.exec(`set test.uid='${owner}'`);
assert.equal((await db.query('select * from observations')).rows.length,1);
await db.exec(`set test.uid='${stranger}'`);
assert.equal((await db.query('select * from follow_up_tasks')).rows.length, 0);
assert.equal((await db.query('select * from follow_up_clarifications')).rows.length, 0);
assert.equal((await db.query('select * from work_notifications')).rows.length, 0);
await assert.rejects(db.query('select add_follow_up_clarification($1,$2)', [task, 'Forged response']));
await assert.rejects(db.query('select update_own_follow_up($1,$2)', [task, 'in_progress']));
await assert.rejects(db.query('select claim_work_notifications($1)', [org]));
await db.exec(`reset role; update organisation_memberships set status='suspended' where user_id='${employee}'; set role authenticated; set test.uid='${employee}';`);
assert.equal((await db.query('select * from follow_up_tasks')).rows.length, 0);
await assert.rejects(db.query('select update_own_follow_up($1,$2)', [task, 'blocked']));
await db.exec(`set test.uid='${hr}'`);
await assert.rejects(create());
await db.exec('set role service_role');
assert.equal((await db.query('select * from claim_work_notifications($1)', [org])).rows.length, 6);
assert.equal((await db.query('select * from claim_work_notifications($1)', [org])).rows.length, 0);
await db.exec('reset role');
// Queue failure must roll back task creation, not leave a task without its notification.
await db.exec(`create function fail_notification() returns trigger language plpgsql as $$begin raise exception 'injected failure'; end$$;
create trigger notification_failure before insert on work_notifications for each row execute function fail_notification();
set role authenticated; set test.uid='${hr}';`);
await assert.rejects(create(hr, null));
assert.equal((await db.query('select count(*)::int as count from follow_up_tasks')).rows[0].count, 1);
await db.exec('reset role');
for (const signature of ['create_follow_up(uuid,uuid,text,text,uuid,timestamptz)','update_own_follow_up(uuid,public.follow_up_status)','add_follow_up_clarification(uuid,text)','assign_mission_participant(uuid,uuid)','claim_work_notifications(uuid)']) {
  assert.equal((await db.query("select has_function_privilege('anon',$1,'EXECUTE') as allowed", [`public.${signature}`])).rows[0].allowed, false);
}
await db.close();
console.log('PASS: HR assignment -> employee acknowledgement/reply/completion -> owner visibility; tenant and suspension checks; duplicate mission assignment; atomic queue; exclusive claims; anonymous access denied.');
