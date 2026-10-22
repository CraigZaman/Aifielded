// Creates the test workspace and one account per role on the avacado server,
// following scripts/provision-local-roles.mjs but with a random password per
// account. Run with the server's settings loaded:
//   set -a; . ./.env.production.local; set +a; node scripts/provision-avacado-users.mjs
// Prints the accounts as JSON on stdout; safe to re-run (existing users are kept).

import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
if (!url || !publicKey || !secretKey || new URL(url).hostname !== '127.0.0.1') {
  throw new Error('Run this on avacado with .env.production.local loaded.');
}

const WORKSPACE = 'Fielded Test Co';
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, secretKey, options);
const accounts = [
  { key: 'owner', email: 'owner@fielded.test', name: 'Olivia Owner', title: 'Managing Director', role: 'owner' },
  { key: 'manager', email: 'manager@fielded.test', name: 'Maya Manager', title: 'Operations Manager', role: 'manager' },
  { key: 'hr', email: 'hr@fielded.test', name: 'Hana HR', title: 'People Partner', role: 'hr' },
  { key: 'employee', email: 'employee@fielded.test', name: 'Eli Employee', title: 'Operations Coordinator', role: 'participant' },
  { key: 'consultant', email: 'consultant@fielded.test', name: 'Cal Consultant', title: 'External Consultant', role: 'consultant' },
  { key: 'operator', email: 'operator@fielded.test', name: 'Owen Operator', title: 'Platform Operator', role: null },
];

function must(result, what) {
  if (result.error) throw new Error(`${what}: ${result.error.message}`);
  return result.data;
}

// Letters and digits plus two symbols; 18 characters.
function newPassword() {
  return `${randomBytes(12).toString('base64url').replace(/[-_]/g, 'x')}-${randomBytes(3).toString('hex').slice(0, 4)}!`;
}

async function findUser(email) {
  for (let page = 1; page <= 20; page++) {
    const result = must(await admin.auth.admin.listUsers({ page, perPage: 100 }), 'List users');
    const found = result.users.find(user => user.email?.toLowerCase() === email);
    if (found) return found;
    if (result.users.length < 100) break;
  }
  return null;
}

async function ensureUser(account) {
  const existing = await findUser(account.email);
  if (existing) return { user: existing, password: null };
  const password = newPassword();
  const result = must(await admin.auth.admin.createUser({
    email: account.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: account.name, business_role: account.title, department: account.key },
    app_metadata: { beta_test: true },
  }), `Create ${account.email}`);
  must(await admin.from('profiles').update({ full_name: account.name, business_role: account.title }).eq('id', result.user.id), `Profile ${account.email}`);
  return { user: result.user, password };
}

async function signedIn(email, password) {
  const client = createClient(url, publicKey, options);
  must(await client.auth.signInWithPassword({ email, password }), `Sign in ${email}`);
  return client;
}

async function main() {
  const made = {};
  for (const account of accounts) made[account.key] = await ensureUser(account);
  if (!made.owner.password) throw new Error('The owner already exists; re-running needs its password, so stop here.');

  // The owner creates the workspace exactly as the onboarding page does.
  const owner = await signedIn('owner@fielded.test', made.owner.password);
  const workspaceId = must(await owner.rpc('create_company_workspace', {
    workspace_name: WORKSPACE,
    business_description: 'Fictional company for testing Fielded. No real data.',
    company_website: '',
  }), 'Create workspace');
  must(await owner.rpc('choose_trial_plan', { workspace: workspaceId, chosen_plan: 'sme' }), 'Choose trial plan');

  for (const account of accounts.filter(a => a.role && a.role !== 'owner')) {
    must(await admin.from('organisation_memberships').insert({ organisation_id: workspaceId, user_id: made[account.key].user.id, role: account.role, status: 'active' }), `Join ${account.email}`);
  }
  must(await admin.from('platform_admins').insert({ user_id: made.operator.user.id }), 'Enable platform operator');

  const grant = async (key, area, level) =>
    must(await owner.rpc('set_company_access', { workspace: workspaceId, person: made[key].user.id, section_name: area, access_level: level }), `Grant ${key} ${area}`);
  for (const [area, level] of Object.entries({ profile: 1, sources: 1, structure: 1, people: 1 })) await grant('manager', area, level);
  for (const [area, level] of Object.entries({ profile: 1, structure: 1, people: 2 })) await grant('hr', area, level);
  for (const [area, level] of Object.entries({ profile: 1, sources: 1 })) await grant('consultant', area, level);

  const department = async (name, headKey) =>
    must(await owner.rpc('save_workspace_department', { workspace: workspaceId, target_department: null, department_name: name, head_id: made[headKey].user.id }), `Create ${name}`);
  const operations = await department('Operations', 'manager');
  await department('People', 'hr');
  must(await owner.rpc('place_workspace_member', { workspace: workspaceId, member_id: made.employee.user.id, department: operations, manager_id: made.manager.user.id }), 'Place employee');

  // Every account must sign in, see the expected role, and have platform rights only if operator.
  for (const account of accounts) {
    const client = await signedIn(account.email, made[account.key].password);
    const { user } = must(await client.auth.getUser(), `User ${account.email}`);
    const memberships = must(await client.from('organisation_memberships').select('role').eq('organisation_id', workspaceId).eq('user_id', user.id), `Role ${account.email}`);
    const platform = must(await client.rpc('is_platform_admin'), `Platform ${account.email}`);
    if ((memberships[0]?.role ?? null) !== account.role || platform !== (account.role === null)) throw new Error(`${account.email} has unexpected access.`);
  }

  console.log(JSON.stringify(accounts.map(a => ({ email: a.email, password: made[a.key].password, role: a.role ?? 'platform operator', name: a.name })), null, 2));
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
