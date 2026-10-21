const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || '.');
const deps = createRequire(path.join(root, 'package.json'));
const ts = deps('typescript');
let membershipError = null;
let membership = { role: 'owner', organisation_id: 'company', organisations: { name: 'Fielded' } };
let signedIn = true;
const filters = [];
const db = {
  auth: { getUser: async () => ({ data: { user: signedIn ? { id: 'owner-id', email: 'owner@example.test' } : null }, error: null }) },
  from(table) {
    const q = {
      select(columns) {
        if (table === 'organisation_memberships') {
          assert.equal(columns, 'role, organisation_id, organisations!organisation_memberships_organisation_id_fkey(name)');
        }
        return q;
      },
      eq(column, value) { filters.push([table, column, value]); return q; },
      maybeSingle: async () => table === 'organisation_memberships'
        ? { data: membership, error: membershipError }
        : { data: { full_name: 'Owner' }, error: null },
    };
    return q;
  },
};
const mocks = {
  react: { cache: fn => fn },
  'next/navigation': { redirect: url => { throw new Error(url); } },
  '@/lib/env': { hasSupabaseEnv: () => true },
  '@/lib/supabase/server': { createClient: async () => db },
};
const exportsObject = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, 'src/lib/auth.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports: exportsObject, require: name => mocks[name] || deps(name) });
(async () => {
  const viewer = await exportsObject.getViewer();
  assert.equal(viewer.organisationName, 'Fielded');
  assert.equal(viewer.id, 'owner-id');
  assert.ok(filters.some(([table, column, value]) => table === 'organisation_memberships' && column === 'user_id' && value === 'owner-id'));
  assert.ok(filters.some(([table, column, value]) => table === 'organisation_memberships' && column === 'status' && value === 'active'));
  membershipError = { code: 'PGRST201' };
  await assert.rejects(exportsObject.getViewer(), /Workspace access could not be checked/);
  membershipError = null; membership = null;
  assert.equal(await exportsObject.getViewer(), null);
  signedIn = false;
  assert.equal(await exportsObject.getViewer(), null);
  console.log('PASS: workspace lookup names the direct membership foreign key, scopes the active authenticated account, and fails closed on database errors.');
})().catch(error => { console.error(error); process.exitCode = 1; });
