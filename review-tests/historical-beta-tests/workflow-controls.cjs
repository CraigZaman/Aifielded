const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || '.'), dep = createRequire(path.join(root, 'package.json')), ts = dep('typescript');
const id = '00000000-0000-4000-8000-000000000001';
let calls = [], failure = false, scheduled = 0;
const mocks = {
  '@/lib/audience':require('./support/load-audience.cjs')(root),
  '@/lib/publishing':{},
  'next/cache': { revalidatePath: () => {} },
  'next/navigation': { redirect: url => { throw Object.assign(Error('redirect'), { url }); } },
  'next/server': { after: () => scheduled++ },
  '@/lib/auth': { requireViewer: async () => ({ id, organisationId: id }) },
  '@/lib/env': {}, '@/lib/email': {}, '@/lib/profile-options': {}, '@/lib/mission-analysis': {}, '@/lib/work-notifications': {},
  '@/lib/supabase/server': { createClient: async () => ({ rpc: async (name, args) => { calls.push({ name, args }); return { error: failure ? { message: 'PRIVATE_DATABASE_DETAILS' } : null }; } }) },
};
const exported = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, 'src/app/app/actions.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, { exports: exported, require: name => mocks[name] || dep(name) });
const form = values => { const f = new FormData(); for (const [k, v] of Object.entries(values)) f.set(k, v); return f; };
(async () => {
  await assert.rejects(exported.updateFollowUp(form({ taskId: id, status: 'assigned' })), e => e.url.includes('Choose+a+valid'));
  assert.equal(calls.length, 0);
  await exported.updateFollowUp(form({ taskId: id, status: 'blocked' }));
  assert.equal(calls[0].name, 'update_own_follow_up'); assert.equal(scheduled, 1);
  failure = true;
  await assert.rejects(exported.updateFollowUp(form({ taskId: id, status: 'completed' })), e => e.url.includes('could+not+be+saved') && !e.url.includes('PRIVATE'));
  assert.equal(scheduled, 1);
  await assert.rejects(exported.sendClarification(form({ taskId: id, content: '  ' })), e => e.url.includes('Enter+a+reply'));
  failure = false;
  await exported.sendClarification(form({ taskId: id, content: '  Need a contact  ' }));
  assert.equal(calls.at(-1).args.comment_text, 'Need a contact');
  const chat = fs.readFileSync(path.join(root, 'src/components/fielded-chat.tsx'), 'utf8');
  const finish = chat.slice(chat.indexOf('async function completeConversation'), chat.indexOf('async function approveSummary'));
  assert.ok(finish.indexOf('if (content.trim())') < finish.indexOf('await fetch'));
  assert.ok(finish.indexOf('if (review)') < finish.indexOf('await fetch'));
  assert.ok(finish.includes('busy || recording || approved'));
  const tasks = fs.readFileSync(path.join(root, 'src/app/app/follow-ups/page.tsx'), 'utf8');
  assert.ok(tasks.includes('task.status === "assigned" ? "acknowledged" : task.status'));
  const actions = fs.readFileSync(path.join(root, 'src/app/app/actions.ts'), 'utf8');
  assert.ok(actions.includes('available+in+the+employee+portal')); assert.ok(!actions.includes('Task+assigned.+Email+notification+queued.'));
  console.log('PASS: valid task status defaults, safe task/reply failures, no notifications after failure, trimmed replies and finish guards for unsent/recording/already-reviewed input. Mocked actions and source-level UI guards.');
})().catch(error => { console.error(error); process.exitCode = 1; });
