const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || '.');
const deps = createRequire(path.join(root, 'package.json')), ts = deps('typescript');
const id = '394d3411-5d5c-48c5-b184-6f4a5a32e341';
let user = { id }, rejected = false, failedSave = false, events = [];
const mocks = {
  '@/lib/audience':require('./support/load-audience.cjs')(root),
  '@/lib/publishing':{},
  'next/navigation': { redirect: url => { throw Object.assign(Error('redirect'), { url }); } },
  'next/cache': { revalidatePath: (...args) => events.push(['refresh', ...args]) },
  'next/server': {}, '@/lib/env': {}, '@/lib/email': {}, '@/lib/auth': {},
  '@/lib/mission-analysis': {}, '@/lib/work-notifications': {},
  '@/lib/profile-options': { BUSINESS_ROLE_VALUES: ['other'], DEPARTMENT_VALUES: ['other'] },
  '@/lib/supabase/server': { createClient: async () => ({
    auth: { getUser: async () => ({ data: { user }, error: null }) },
    rpc: async () => { events.push(['accept']); return { data: {}, error: rejected ? { message: 'Invitation rejected' } : null }; },
    from: table => {
      assert.equal(table, 'profiles');
      const query = {
        update: payload => { events.push(['update', payload]); return query; },
        eq: (column, value) => { events.push(['filter', column, value]); return query; },
        select: () => query,
        single: async () => ({ data: failedSave ? null : { id }, error: failedSave ? {} : null }),
        then: resolve => resolve({ error: failedSave ? {} : null }),
      }; return query;
    },
  }) },
};
function load(file) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, { exports, require: name => mocks[name] || deps(name) });
  return exports;
}
function form(accountId = id) {
  const data = new FormData();
  for (const [key, value] of Object.entries({ token: 'a'.repeat(32), accountId, fullName: 'Ruzgar Takmak', businessRole: 'other', department: 'other', role: 'owner' })) data.set(key, value);
  return data;
}
async function redirected(promise, expected) {
  await assert.rejects(promise, error => { assert.match(error.url || '', expected); return true; });
}
(async () => {
  const { acceptInvitation } = load('src/app/app/actions.ts');
  const { updateDisplayName } = load('src/app/app/settings/actions.ts');
  await redirected(acceptInvitation(form('different-account')), /account\+changed/);
  assert.equal(events.length, 0);
  rejected = true;
  await redirected(acceptInvitation(form()), /Invitation%20rejected/);
  assert.deepEqual(events, [['accept']]);
  events = []; rejected = false;
  await redirected(acceptInvitation(form()), /^\/app$/);
  assert.equal(events[0][0], 'accept'); assert.equal(events[1][0], 'update');
  assert.deepEqual(events[2], ['filter', 'id', id]);
  events = []; failedSave = true;
  await redirected(acceptInvitation(form()), /Invitation\+accepted/);
  events = []; failedSave = false;
  await redirected(updateDisplayName(form('other-account')), /account\+changed/); assert.equal(events.length, 0);
  const invalid = form(); invalid.set('fullName', ' ');
  await redirected(updateDisplayName(invalid), /Enter\+a\+name/); assert.equal(events.length, 0);
  await redirected(updateDisplayName(form()), /display\+name\+has\+been\+updated/);
  assert.deepEqual(Object.keys(events[0][1]), ['full_name']);
  assert.deepEqual(events[1], ['filter', 'id', id]);
  events = []; failedSave = true;
  await redirected(updateDisplayName(form()), /could\+not\+be\+saved/);
  assert.ok(!events.some(item => item[0] === 'refresh'));
  events = []; user = null;
  await redirected(updateDisplayName(form()), /^\/sign-in/); assert.equal(events.length, 0);
  const join = fs.readFileSync(path.join(root, 'src/app/join/[token]/page.tsx'), 'utf8');
  assert.ok(join.includes('name="accountId" value={auth.user.id}'));
  assert.ok(join.includes('Joining as')); assert.ok(join.includes('Use a different account'));
  console.log('PASS: rejected invitations do not change profiles, stale-account forms fail closed, profile writes target only the authenticated ID, name edits cannot change roles, failed saves report failure, invitation identity is visible. Mocked Supabase.');
})().catch(error => { console.error(error); process.exitCode = 1; });
