import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
const root = path.resolve(process.argv[2] || '.');
const require = createRequire(path.join(process.argv[3] || root, 'package.json'));
const { PGlite } = require('@electric-sql/pglite');
const db = new PGlite();
await db.exec('create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to anon, authenticated, service_role;');
await db.exec(readFileSync(path.join(root,'supabase/migrations/008_ai_budget.sql'),'utf8'));
const migration = readFileSync(path.join(root,'supabase/migrations/011_gemini36_budget.sql'),'utf8');
await db.exec(migration);
await db.exec(migration);
for (const role of ['anon','authenticated']) {
  await db.exec(`set role ${role}`);
  await assert.rejects(db.query('select reserve_gemini36_generation(100,256)'), /permission denied/);
  await db.exec('reset role');
}
await db.exec('set role service_role');
for (const [input,output] of [[0,256],[100001,256],[1,0],[1,4097]]) {
  await assert.rejects(db.query('select reserve_gemini36_generation($1,$2)',[input,output]), /allowed size/);
}
await db.query('select reserve_gemini36_generation(1000,256)');
const rateFactor = Number((await db.query("select case when (now() at time zone 'UTC')::date < date '2027-01-01' then 1 else 2 end as factor")).rows[0].factor);
const first = (await db.query('select * from ai_generations')).rows[0];
assert.equal(first.model,'gemini-3.6-flash');
assert.equal(Number(first.reserved_micro_usd),2052*rateFactor);
const attempts = await Promise.allSettled(Array.from({length:100},()=>db.query('select reserve_gemini36_generation(1000,4096)')));
assert.ok(attempts.some(result=>result.status==='rejected'));
const total = Number((await db.query('select reserved_micro_usd from ai_daily_budget')).rows[0].reserved_micro_usd);
assert.ok(total<=1000000);
assert.equal(total,2052*rateFactor+attempts.filter(result=>result.status==='fulfilled').length*19332*rateFactor);
await db.exec("update ai_generations set status='failed'");
assert.equal(Number((await db.query('select reserved_micro_usd from ai_daily_budget')).rows[0].reserved_micro_usd),total);
await db.close();
console.log('PASS: Gemini 3.6 price-aware bounded-output reservations, shared $1 cap, scheduled pricing, server-only access and no failure refunds.');
