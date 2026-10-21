import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';

nextEnv.loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const password = 'Test1234!!';
const localHosts = new Set(['localhost', '127.0.0.1', '192.168.1.175']);
if (!url || !publicKey || !secretKey || !localHosts.has(new URL(url).hostname) || new URL(url).port !== '26313') {
  throw new Error('Refusing to change logins outside the Fielded local Supabase instance.');
}

const admin = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
const accounts = [
  { name: 'owner', role: 'owner' },
  { name: 'manager', role: 'manager' },
  { name: 'hr', role: 'hr' },
  { name: 'employee', role: 'participant' },
  { name: 'consultant', role: 'consultant' },
  { name: 'operator', role: null },
];

function must(result, what) {
  if (result.error) throw new Error(`${what}: ${result.error.message}`);
  return result.data;
}

async function listUsers() {
  const users = [];
  for (let page = 1; page <= 20; page++) {
    const data = must(await admin.auth.admin.listUsers({ page, perPage: 100 }), 'List local accounts');
    users.push(...data.users);
    if (data.users.length < 100) break;
  }
  return users;
}

async function main() {
  const workspaces = must(await admin.from('organisations').select('id').eq('name', 'Fielded Local'), 'Find local workspace');
  if (workspaces.length !== 1) throw new Error('Expected exactly one Fielded Local workspace.');
  const workspaceId = workspaces[0].id;
  const users = await listUsers();
  const targets = [];

  // Resolve every account before changing any one of them. Never commandeer
  // an unrelated account that already has one of the requested addresses.
  for (const account of accounts) {
    const oldEmail = `${account.name}@local.fielded.test`;
    const newEmail = `${account.name}@aifielded.com`;
    const oldUser = users.find(user => user.email?.toLowerCase() === oldEmail);
    const newUser = users.find(user => user.email?.toLowerCase() === newEmail);
    if (oldUser && newUser && oldUser.id !== newUser.id) throw new Error(`Target email ${newEmail} already belongs to a different account.`);
    const user = oldUser || newUser;
    if (!user) throw new Error(`Missing local test account ${oldEmail}. Nothing changed.`);
    if (account.role) {
      const membership = must(await admin.from('organisation_memberships').select('role,status').eq('organisation_id', workspaceId).eq('user_id', user.id).single(), `Check ${oldEmail} membership`);
      if (membership.role !== account.role || membership.status !== 'active') throw new Error(`Unexpected role/status for ${oldEmail}. Nothing changed.`);
    } else {
      const membership = must(await admin.from('organisation_memberships').select('id').eq('user_id', user.id), 'Check operator membership');
      const platform = must(await admin.from('platform_admins').select('user_id').eq('user_id', user.id).maybeSingle(), 'Check operator permission');
      if (membership.length || !platform) throw new Error('The operator is not an isolated platform account. Nothing changed.');
    }
    targets.push({ user, newEmail, role: account.role });
  }

  for (const target of targets) {
    must(await admin.auth.admin.updateUserById(target.user.id, {
      email: target.newEmail,
      password,
      email_confirm: true,
    }), `Update ${target.newEmail}`);
    console.log(`Updated ${target.newEmail}`);
  }

  for (const target of targets) {
    const client = createClient(url, publicKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const login = must(await client.auth.signInWithPassword({ email: target.newEmail, password }), `Sign in ${target.newEmail}`);
    if (login.user.email?.toLowerCase() !== target.newEmail || !login.user.email_confirmed_at) throw new Error(`Email verification failed for ${target.newEmail}.`);
    const membership = must(await client.from('organisation_memberships').select('role').eq('organisation_id', workspaceId).eq('user_id', login.user.id), `Verify ${target.newEmail} role`);
    if ((membership[0]?.role || null) !== target.role) throw new Error(`Role mismatch for ${target.newEmail}.`);
    const platform = must(await client.rpc('is_platform_admin'), `Verify ${target.newEmail} platform permission`);
    if (platform !== (target.role === null)) throw new Error(`Platform permission mismatch for ${target.newEmail}.`);
    console.log(`Verified ${target.newEmail}: ${target.role || 'platform operator'}`);
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
