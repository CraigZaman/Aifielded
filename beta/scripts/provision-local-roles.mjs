import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';

nextEnv.loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const password = 'Test1234!!';
const localHosts = new Set(['localhost', '127.0.0.1', '192.168.1.175']);
if (!url || !publicKey || !secretKey || !localHosts.has(new URL(url).hostname) || new URL(url).port !== '26313') {
  throw new Error('Refusing to provision accounts outside the Fielded local Supabase instance.');
}

const admin = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
const owner = createClient(url, publicKey, { auth: { persistSession: false, autoRefreshToken: false } });
const accounts = [
  { email: 'manager@aifielded.com', name: 'Maya Manager', role: 'manager' },
  { email: 'hr@aifielded.com', name: 'Hana HR', role: 'hr' },
  { email: 'consultant@aifielded.com', name: 'Cal Consultant', role: 'consultant' },
  { email: 'operator@aifielded.com', name: 'Owen Operator', role: null },
];

function must(result, what) {
  if (result.error) throw new Error(`${what}: ${result.error.message}`);
  return result.data;
}

async function findUser(email) {
  for (let page = 1; page <= 20; page++) {
    const result = must(await admin.auth.admin.listUsers({ page, perPage: 100 }), 'List local users');
    const found = result.users.find(user => user.email?.toLowerCase() === email);
    if (found) return found;
    if (result.users.length < 100) break;
  }
  return null;
}

async function ensureUser(account, workspaceId) {
  let user = await findUser(account.email);
  let created = false;
  if (!user) {
    const result = must(await admin.auth.admin.createUser({
      email: account.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: account.name, business_role: 'test', department: 'test' },
      app_metadata: { beta_test: true },
    }), `Create ${account.email}`);
    user = result.user;
    created = true;
  }
  if (!user?.email_confirmed_at) throw new Error(`${account.email} is not email-confirmed.`);
  const memberships = must(await admin.from('organisation_memberships').select('organisation_id,role,status').eq('user_id', user.id), `Check ${account.email} membership`);
  if (account.role) {
    const existing = memberships.find(item => item.organisation_id === workspaceId);
    if (existing && (existing.role !== account.role || existing.status !== 'active')) {
      throw new Error(`${account.email} already has a different workspace role/status; leaving it unchanged.`);
    }
    if (!existing) {
      must(await admin.from('organisation_memberships').insert({ organisation_id: workspaceId, user_id: user.id, role: account.role, status: 'active' }), `Join ${account.email} to workspace`);
    }
  } else if (memberships.length) {
    throw new Error(`${account.email} already belongs to a workspace; platform operator must remain separate.`);
  }
  console.log(`${created ? 'Created' : 'Existing'} ${account.email} (${account.role || 'platform operator'})`);
  return user;
}

async function ensureGrant(workspaceId, userId, area, level) {
  const existing = must(await admin.from('company_access_grants').select('level').eq('organisation_id', workspaceId).eq('user_id', userId).eq('area', area).maybeSingle(), `Check ${area} grant`);
  if (existing) {
    if (existing.level !== level) console.log(`Preserved existing ${area} grant at level ${existing.level} (demo default is ${level}).`);
    return;
  }
  must(await owner.rpc('set_company_access', { workspace: workspaceId, person: userId, section_name: area, access_level: level }), `Grant ${area} level ${level}`);
}

async function ensureDepartment(workspaceId, name, headId) {
  const existing = must(await admin.from('workspace_departments').select('id,head_user_id').eq('organisation_id', workspaceId).eq('name', name).maybeSingle(), `Check ${name} department`);
  if (existing) {
    if (existing.head_user_id !== headId) console.log(`Preserved existing ${name} department head.`);
    return existing.id;
  }
  return must(await owner.rpc('save_workspace_department', { workspace: workspaceId, target_department: null, department_name: name, head_id: headId }), `Create ${name} department`);
}

async function main() {
  must(await owner.auth.signInWithPassword({ email: 'owner@aifielded.com', password }), 'Sign in local owner');
  const ownerUser = must(await owner.auth.getUser(), 'Get owner').user;
  const membership = must(await admin.from('organisation_memberships').select('organisation_id,role,status').eq('user_id', ownerUser.id).eq('role', 'owner').eq('status', 'active').maybeSingle(), 'Find owner workspace');
  if (!membership) throw new Error('The local owner has no active owner membership.');
  const workspaceId = membership.organisation_id;
  const workspace = must(await admin.from('organisations').select('name').eq('id', workspaceId).single(), 'Check workspace');
  if (workspace.name !== 'Fielded Local') throw new Error('Refusing to change a workspace other than Fielded Local.');

  const employee = await findUser('employee@aifielded.com');
  if (!employee) throw new Error('The existing local employee account is missing.');
  const employeeMembership = must(await admin.from('organisation_memberships').select('role,status').eq('user_id', employee.id).eq('organisation_id', workspaceId).single(), 'Check existing employee');
  if (employeeMembership.role !== 'participant' || employeeMembership.status !== 'active') throw new Error('Existing employee is not an active participant.');

  const created = {};
  for (const account of accounts) created[account.role || 'operator'] = await ensureUser(account, workspaceId);
  const operatorGrant = must(await admin.from('platform_admins').select('user_id').eq('user_id', created.operator.id).maybeSingle(), 'Check platform operator');
  if (!operatorGrant) must(await admin.from('platform_admins').insert({ user_id: created.operator.id }), 'Enable platform operator');

  for (const [area, level] of Object.entries({ profile: 1, sources: 1, structure: 1, people: 1 })) await ensureGrant(workspaceId, created.manager.id, area, level);
  for (const [area, level] of Object.entries({ profile: 1, structure: 1, people: 2 })) await ensureGrant(workspaceId, created.hr.id, area, level);
  for (const [area, level] of Object.entries({ profile: 1, sources: 1 })) await ensureGrant(workspaceId, created.consultant.id, area, level);

  const operationsId = await ensureDepartment(workspaceId, 'Operations', created.manager.id);
  await ensureDepartment(workspaceId, 'People', created.hr.id);
  const employeePlacement = must(await admin.from('workspace_people').select('department_id,reports_to').eq('organisation_id', workspaceId).eq('user_id', employee.id).maybeSingle(), 'Check employee placement');
  if (!employeePlacement || (!employeePlacement.department_id && !employeePlacement.reports_to)) {
    must(await owner.rpc('place_workspace_member', { workspace: workspaceId, member_id: employee.id, department: operationsId, manager_id: created.manager.id }), 'Place employee under manager');
  }
  const placement = must(await admin.from('workspace_people').select('department_id,reports_to').eq('organisation_id', workspaceId).eq('user_id', employee.id).single(), 'Verify employee placement');
  if (placement.department_id !== operationsId || placement.reports_to !== created.manager.id) {
    console.log(`Employee placement was preserved: Operations=${placement.department_id === operationsId}, reports to demo manager=${placement.reports_to === created.manager.id}.`);
  } else {
    console.log('Reporting line: owner → Operations manager → employee; HR heads People; consultant and operator sit outside that line.');
  }

  console.log('Verified login and permissions:');
  const fixtures = [
    { email: 'owner@aifielded.com', expected: 'owner' },
    { email: 'manager@aifielded.com', expected: 'manager' },
    { email: 'hr@aifielded.com', expected: 'hr' },
    { email: 'employee@aifielded.com', expected: 'participant' },
    { email: 'consultant@aifielded.com', expected: 'consultant' },
    { email: 'operator@aifielded.com', expected: null },
  ];
  for (const fixture of fixtures) {
    const client = createClient(url, publicKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const login = must(await client.auth.signInWithPassword({ email: fixture.email, password }), `Login ${fixture.email}`);
    const memberships = must(await client.from('organisation_memberships').select('role,status').eq('organisation_id', workspaceId).eq('user_id', login.user.id), `Read own membership for ${fixture.email}`);
    const role = memberships[0]?.role || null;
    if (role !== fixture.expected) throw new Error(`${fixture.email} signed in with unexpected role ${role}.`);
    const platform = must(await client.rpc('is_platform_admin'), `Check platform permission for ${fixture.email}`);
    if (platform !== (fixture.expected === null)) throw new Error(`${fixture.email} has unexpected platform permission.`);
    const visibleWorkspace = must(await client.from('organisations').select('id').eq('id', workspaceId), `Check workspace visibility for ${fixture.email}`);
    if (visibleWorkspace.length !== (role ? 1 : 0)) throw new Error(`${fixture.email} has unexpected workspace visibility.`);
    if (role) {
      const management = must(await client.rpc('can_manage_workspace', { workspace_id: workspaceId }), `Check management for ${fixture.email}`);
      const people = must(await client.rpc('can_manage_people', { workspace_id: workspaceId }), `Check people for ${fixture.email}`);
      const integrations = must(await client.rpc('can_manage_integrations', { workspace_id: workspaceId }), `Check integrations for ${fixture.email}`);
      const policies = must(await client.rpc('can_manage_policies', { workspace_id: workspaceId }), `Check policies for ${fixture.email}`);
      const invites = must(await client.rpc('can_invite_team', { workspace: workspaceId }), `Check team invitations for ${fixture.email}`);
      const expected = { owner: [true, true, true], manager: [true, true, true], hr: [true, true, false], participant: [false, false, false], consultant: [true, false, false] }[role];
      if (!expected || [management, people, integrations].some((value, index) => value !== expected[index])) throw new Error(`${fixture.email} permission mismatch.`);
      if (policies !== ['owner', 'manager', 'hr'].includes(role)) throw new Error(`${fixture.email} policy permission mismatch.`);
      if (invites !== ['owner', 'manager', 'hr'].includes(role)) throw new Error(`${fixture.email} team invitation permission mismatch.`);
      const access = must(await client.rpc('my_company_access', { workspace: workspaceId }), `Check company grants for ${fixture.email}`);
      console.log(`${fixture.email}: ${role}; management=${management}, people=${people}, integrations=${integrations}, policies=${policies}, invites=${invites}; company=${JSON.stringify(access)}`);
    } else {
      console.log(`${fixture.email}: platform operator only; no workspace membership`);
    }
  }
}

main().catch(error => { console.error(error.message); process.exitCode = 1; });
