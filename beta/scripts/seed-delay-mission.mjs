// Example discovery mission for the test workspace: "Why are customer orders
// shipping late?" Two people in different departments each hold a real AI
// conversation, prepare their summary and approve it; approval triggers the
// mission analysis that relays their evidence up to the owner and manager.
//
// Uses only the product's own paths (RPCs as the signed-in user and the
// /api routes with a bearer token), so the result is what the app would make.
// Run on avacado:
//   set -a; . ./.env.production.local; set +a; node scripts/seed-delay-mission.mjs

import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const appOrigin = `http://127.0.0.1:${process.env.PORT || 3100}`;
const accountsFile = new URL('../test-accounts.json', import.meta.url);
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, secretKey, options);

function must(result, what) {
  if (result.error) throw new Error(`${what}: ${result.error.message}`);
  return result.data;
}

const accounts = JSON.parse(readFileSync(accountsFile, 'utf8'));
const passwordFor = email => accounts.find(a => a.email === email)?.password;

async function session(email) {
  const client = createClient(url, publicKey, options);
  const data = must(await client.auth.signInWithPassword({ email, password: passwordFor(email) }), `Sign in ${email}`);
  return { client, user: data.user, token: data.session.access_token };
}

async function api(token, path, body) {
  const response = await fetch(appOrigin + path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${path} ${response.status}: ${payload.error || 'failed'}`);
  return payload;
}

// A second employee in Finance, so the two accounts come from different teams.
async function ensureFinanceEmployee(owner, workspaceId) {
  const email = 'finance@fielded.test';
  if (passwordFor(email)) return;
  const password = `${randomBytes(12).toString('base64url').replace(/[-_]/g, 'x')}-${randomBytes(2).toString('hex')}!`;
  const created = must(await admin.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { full_name: 'Fran Finance', business_role: 'Accounts Assistant', department: 'finance' },
    app_metadata: { beta_test: true },
  }), 'Create Fran');
  must(await admin.from('profiles').update({ full_name: 'Fran Finance', business_role: 'Accounts Assistant' }).eq('id', created.user.id), 'Fran profile');
  must(await admin.from('organisation_memberships').insert({ organisation_id: workspaceId, user_id: created.user.id, role: 'participant', status: 'active' }), 'Fran membership');
  const finance = must(await owner.rpc('save_workspace_department', { workspace: workspaceId, target_department: null, department_name: 'Finance', head_id: null }), 'Finance department');
  must(await owner.rpc('place_workspace_member', { workspace: workspaceId, member_id: created.user.id, department: finance, manager_id: null }), 'Place Fran');
  accounts.push({ email, password, role: 'participant', name: 'Fran Finance' });
  writeFileSync(accountsFile, JSON.stringify(accounts, null, 2) + '\n', { mode: 0o600 });
}

// What each person tells the interviewer. The two accounts describe the same
// bottleneck from opposite ends, which is what analysis should connect.
const interviews = {
  'employee@fielded.test': [
    ['SHARE', 'Most late orders are not slow in the warehouse. Once an order is released to us we pick and pack it the same day. The problem is that orders sit as "awaiting credit release" for two or three days before we can touch them.'],
    ['SHARE', 'We have no way to see why an order is held or when it will be released. Customer service chases us, we chase Finance by email, and usually the answer is that it is waiting for the Thursday credit run.'],
    ['CONTRIBUTE', 'Last month around a third of our late shipments were orders that came in on a Friday or Monday and waited for the next credit run. If credit checks happened daily, or we could see the status, most of those would ship on time.'],
    ['PRIVATE', 'Honestly I am tired of being blamed in the ops meeting for delays that are not in our hands.'],
  ],
  'finance@fielded.test': [
    ['SHARE', 'New-customer and over-limit orders need a credit check before Operations can ship. We run those checks in one batch every Thursday, because the credit tool needs a manual export from the order system and it takes most of a morning.'],
    ['CONTRIBUTE', 'Nobody tells us when an order is urgent, and Operations cannot see the credit status, so they email us individually. I spend several hours a week answering "where is this order" emails.'],
    ['SHARE', 'If the order system sent orders to the credit tool automatically, we could check them daily. Even a shared status column would cut most of the chasing.'],
    ['PRIVATE', 'The weekly batch was my manager\'s idea and I am nervous about saying it is the cause.'],
  ],
};

async function interview(email, assignmentId) {
  const { token } = await session(email);
  for (const [confidentiality, content] of interviews[email]) {
    const reply = await api(token, '/api/ai/chat', { assignmentId, content, confidentiality });
    console.log(`  ${email} (${confidentiality}) -> Fielded: ${reply.content.slice(0, 110).replace(/\s+/g, ' ')}...`);
  }
  const review = await api(token, '/api/conversations/' + assignmentId + '/complete');
  console.log(`  summary ready (${review.observations.length} observations)`);
  await api(token, '/api/conversations/' + assignmentId + '/approve', { reviewId: review.reviewId });
  console.log('  approved and shared');
}

async function main() {
  const owner = await session('owner@fielded.test');
  const workspaceId = must(await owner.client.from('organisation_memberships').select('organisation_id').eq('user_id', owner.user.id).eq('role', 'owner').single(), 'Owner workspace').organisation_id;
  await ensureFinanceEmployee(owner.client, workspaceId);

  const people = {};
  for (const email of Object.keys(interviews)) people[email] = must(await admin.auth.admin.listUsers({ perPage: 100 }), 'Users').users.find(u => u.email === email).id;

  const launched = must(await owner.client.rpc('launch_mission_targeted', {
    requested_mission_id: randomUUID(),
    workspace_id: workspaceId,
    mission_title: 'Why are customer orders shipping late?',
    mission_objective: 'Find where orders are delayed between being placed and leaving the warehouse, and what is causing it.',
    mission_context: 'Customers report deliveries two to four days later than promised. Each team has its own explanation.',
    mission_outcome: 'A clear view of the main cause of late shipments and practical changes to fix it.',
    mission_departments: ['Operations', 'Finance'],
    individual_ids: Object.values(people),
    audience_mode: 'individuals',
    department_keys: [],
    invitation_digest: createHash('sha256').update(randomBytes(24).toString('base64url')).digest('hex'),
  }), 'Launch mission');
  console.log(`Mission launched: ${launched.mission_id}`);

  for (const email of Object.keys(interviews)) {
    const assignment = must(await admin.from('mission_assignments').select('id').eq('mission_id', launched.mission_id).eq('user_id', people[email]).single(), `Assignment for ${email}`);
    console.log(`Interview: ${email}`);
    await interview(email, assignment.id);
  }

  // Approval queues the analysis in the background; wait for it to finish.
  for (let i = 0; i < 40; i++) {
    const status = must(await admin.from('mission_analysis_jobs').select('status,error_code').eq('mission_id', launched.mission_id).maybeSingle(), 'Analysis status');
    if (status && ['ready', 'failed', 'retry'].includes(status.status)) { console.log(`Analysis: ${status.status}${status.error_code ? ` (${status.error_code})` : ''}`); break; }
    await new Promise(r => setTimeout(r, 5000));
  }
  console.log(JSON.stringify({ missionId: launched.mission_id }));
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
