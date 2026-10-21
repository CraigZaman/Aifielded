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
create function extensions.digest(text,text) returns bytea language sql as $$select sha256(convert_to($1,'UTF8'))$$;
create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql as $$select nullif(current_setting('test.uid', true), '')::uuid$$;
create function auth.jwt() returns jsonb language sql as $$select '{}'::jsonb$$;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key,bucket_id text,name text);
create function storage.foldername(text) returns text[] language sql as $$select string_to_array($1,'/')$$;
`);
await db.exec(readFileSync(root + '/supabase/migrations/001_core.sql', 'utf8').replace('create extension if not exists pgcrypto;', ''));
const migration = readFileSync(root + '/supabase/migrations/005_atomic_synthesis.sql', 'utf8');
await db.exec(migration);
await db.exec(migration);
const owner = '10000000-0000-4000-8000-000000000001';
const employee = '10000000-0000-4000-8000-000000000002';
const org = '20000000-0000-4000-8000-000000000001';
const mission = '30000000-0000-4000-8000-000000000001';
await db.exec(`
insert into auth.users(id) values ('${owner}'), ('${employee}');
insert into organisations(id,name,slug,created_by) values ('${org}','Test company','test','${owner}');
insert into organisation_memberships(organisation_id,user_id,role) values ('${org}','${owner}','owner'), ('${org}','${employee}','participant');
insert into missions(id,organisation_id,title,objective,created_by) values ('${mission}','${org}','Test mission','Test objective','${owner}');
grant usage on schema public, auth to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
set role authenticated;
set test.uid = '${owner}';
`);
const report = {
  themes: [{ title: 'Theme', description: 'Evidence', evidenceCount: 2, participantCount: 1, confidence: 0.8 }],
  hypotheses: [{ title: 'Hypothesis', description: 'Needs testing', evidenceFor: ['Evidence'], evidenceAgainst: [], confidence: 0.5 }],
  findings: [{ title: 'Original finding', summary: 'Supported', evidenceSummary: 'Evidence', confidence: 0.8, impact: 'medium', recommendedAction: 'Investigate' }],
};
const save = value => db.query('select replace_mission_synthesis($1,$2::jsonb)', [mission, JSON.stringify(value)]);
await save(report);
const broken = structuredClone(report);
broken.findings[0].impact = 'invalid';
broken.themes[0].title = 'Should roll back';
await assert.rejects(save(broken));
assert.equal((await db.query('select title from themes')).rows[0].title, 'Theme');
assert.equal((await db.query('select title from findings')).rows[0].title, 'Original finding');
await assert.rejects(save({ themes: [], hypotheses: [] }));
await db.exec(`set test.uid = '${employee}'`);
await assert.rejects(save(report));
await db.exec(`set test.uid = '${owner}'; reset role; update organisation_memberships set status = 'suspended' where user_id = '${owner}'; set role authenticated;`);
await assert.rejects(save(report));
await db.close();
console.log('PASS: synthesis replacement rolls back on failure and rejects employees and suspended managers');
