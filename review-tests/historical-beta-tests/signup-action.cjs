const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');

const root = path.resolve(process.argv[2] || process.cwd());
const dependencies = createRequire(path.join(process.argv[3] || root, 'package.json'));
const ts = dependencies('typescript');
const calls = [];
const token = 'a'.repeat(32);
let preview = { expired: false, invited_email: 'invited@example.com' };
const supabase = {
  rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: name === 'invitation_preview' ? [preview] : {}, error: null };
  },
  auth: { signUp: async (args) => { calls.push({ name: 'signUp', args }); return { data: { session: {} }, error: null }; } },
};
function load(relative, mocks = {}) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports, URL, console,
    require: (name) => mocks[name] || dependencies(name),
  }, { filename: relative });
  return exports;
}
const actions = load('src/app/(auth)/actions.ts', {
  'next/navigation': { redirect: (url) => { throw Object.assign(new Error('redirect'), { url }); } },
  '@/lib/env': { appUrl: () => 'https://try-fielded.vercel.app', hasSupabaseEnv: () => true },
  '@/lib/profile-options': load('src/lib/profile-options.ts'),
  '@/lib/safe-redirect': load('src/lib/safe-redirect.ts'),
  '@/lib/supabase/server': { createClient: async () => supabase },
});
function employeeForm(email) {
  const form = new FormData();
  Object.entries({ path: 'employee', fullName: 'Test Employee', businessRole: 'individual_contributor', department: 'engineering', password: 'test-only-password', invitation: `/join/${token}` }).forEach(([key,value]) => form.set(key,value));
  if (email !== undefined) form.set('email', email);
  return form;
}
(async () => {
  await assert.rejects(actions.signUp(employeeForm()), (error) => error.url === '/app');
  assert.equal(calls.find(call => call.name === 'signUp').args.email, 'invited@example.com');
  assert.ok(calls.some(call => call.name === 'accept_invitation'));
  calls.length = 0;
  await assert.rejects(actions.signUp(employeeForm('other@example.com')), error => error.url === '/app');
  assert.equal(calls.find(call => call.name === 'signUp').args.email, 'invited@example.com');
  calls.length = 0;
  preview = { expired: true, invited_email: 'invited@example.com' };
  await assert.rejects(actions.signUp(employeeForm()), error => error.url.includes('invalid') || error.url.includes('expired'));
  assert.ok(!calls.some(call => call.name === 'signUp'));
  console.log('PASS: email-bound signup, forged email ignored, expired invitation rejected before signup');
})().catch(error => { console.error(error); process.exitCode = 1; });
