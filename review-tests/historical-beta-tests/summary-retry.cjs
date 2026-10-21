const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || '.'), dep = createRequire(path.join(root, 'package.json')), ts = dep('typescript');
let draft = true, enabled = true, failedRead = false, aiCalls = 0, saves = 0;
const mocks = {
  'next/server': { NextResponse: { json: (body, options = {}) => ({ body, status: options.status || 200 }) } },
  '@/lib/ai-failure': { describeAIFailure: () => ({ code: 'AI_PROCESSING_FAILED', message: 'Safe error' }) },
  '@/lib/ai': { hasAIProvider: () => enabled, extractConversation: async () => { aiCalls++; return { summary: 'Fresh summary', observations: [] }; } },
  '@/lib/supabase/server': { createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: 'employee' } } }) },
    rpc: async () => { saves++; return { data: { review_id: 'new-review' }, error: null }; },
    from: table => {
      const q = { select: () => q, eq: () => q, maybeSingle: async () => table === 'mission_assignments'
        ? { data: { status: 'in_progress', missions: { title: 'Handoffs', status: 'active' } } }
        : table === 'policy_communications' ? { data: null, error: null } : { error: failedRead ? {} : null, data: failedRead ? null : {
          id: 'conversation', messages: [{ id: 'message', sender: 'participant', content: 'Saved detail', confidentiality: 'PRIVATE', created_at: '2026-09-05' }],
          conversation_summaries: draft ? [{ id: 'same-review', summary: 'Already saved', status: 'draft' }] : [],
          observations: [{ category: 'process', summary: 'Already saved', detail: 'Detail', confidence: 0.8, confidentiality: 'PRIVATE' }],
        } } }; return q;
    },
  }) },
};
const exported = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, 'src/app/api/conversations/[assignmentId]/complete/route.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports: exported, console: { error: () => {} }, require: name => mocks[name] || dep(name) });
(async () => {
  const run = () => exported.POST({}, { params: Promise.resolve({ assignmentId: 'assignment' }) });
  enabled = false;
  const saved = await run(); assert.equal(saved.status, 200); assert.equal(saved.body.reviewId, 'same-review'); assert.equal(saved.body.observations[0].sourceConfidentiality, 'PRIVATE'); assert.equal(aiCalls, 0); assert.equal(saves, 0);
  draft = false; assert.equal((await run()).status, 503); assert.equal(aiCalls, 0);
  enabled = true; failedRead = true; const failed = await run(); assert.equal(failed.status, 503); assert.equal(failed.body.code, 'TRANSCRIPT_READ_FAILED'); assert.equal(aiCalls, 0);
  failedRead = false; assert.equal((await run()).body.reviewId, 'new-review'); assert.equal(aiCalls, 1); assert.equal(saves, 1);
  console.log('PASS: saved review retry reuses the draft with no AI or writes, works without provider access, fresh drafts still generate/save, read failures do not claim an empty transcript. Mocked database/provider.');
})().catch(error => { console.error(error); process.exitCode = 1; });
