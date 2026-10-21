const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || '.');
const dependencies = createRequire(path.join(process.argv[3] || root, 'package.json'));
const ts = dependencies('typescript');
const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash';
const calls = [];
let allowance = true;
let tokens = 100;
let generationThrows = false;
const writes = [];
const admin = {
  rpc: async (name, args) => {
    assert.equal(name, 'reserve_gemini36_generation');
    assert.equal(args.output_token_limit, 4096);
    assert.equal(args.input_token_count, tokens);
    calls.push('reserve');
    return allowance ? { data: 'generation-id', error: null } : { data: null, error: { message: 'limit' } };
  },
  from: table => ({ update: value => ({ eq: async () => {
    assert.equal(table, 'ai_generations');
    writes.push(value);
    return { error: null };
  } }) }),
};
const code = ts.transpileModule(fs.readFileSync(path.join(root, 'src/lib/ai-budget.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exportsForTest = {};
vm.runInNewContext(code, {
  exports: exportsForTest, console, Date,
  fetch: async url => {
    if (String(url).endsWith(':countTokens')) { calls.push('count'); return Response.json({ totalTokens: tokens }); }
    assert.equal(String(url), endpoint + ':generateContent');
    calls.push('generate');
    if (generationThrows) throw new Error('provider failure');
    return Response.json({ usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 15 } });
  },
  require: name => name === 'server-only' ? {} : name === '@/lib/supabase/admin' ? { createAdminClient: () => admin } : dependencies(name),
});
const request = { method: 'POST', headers: { 'x-goog-api-key': 'fake' }, body: JSON.stringify({ contents: [], generationConfig: { maxOutputTokens: 4096 } }) };
(async () => {
  const run = exportsForTest.budgetedGeminiFetch;
  await run(endpoint + ':generateContent', request);
  assert.deepEqual(calls, ['count', 'reserve', 'generate']);
  assert.equal(writes[0].status, 'succeeded');
  calls.length = 0;
  allowance = false;
  await assert.rejects(run(endpoint + ':generateContent', request), /allowance/);
  assert.deepEqual(calls, ['count', 'reserve']);
  calls.length = 0;
  tokens = 100001;
  await assert.rejects(run(endpoint + ':generateContent', request), /size/);
  assert.deepEqual(calls, ['count']);
  calls.length = 0;
  await assert.rejects(run(endpoint.replace('3.6-flash', '2.5-flash') + ':generateContent', request), /only|Only/);
  await assert.rejects(run(endpoint + ':generateContent', { ...request, body: '{"generationConfig":{"maxOutputTokens":65536}}' }), /settings/);
  assert.equal(calls.length, 0);
  allowance = true; tokens = 100; generationThrows = true;
  await assert.rejects(run(endpoint + ':generateContent', request), /provider failure/);
  assert.equal(writes.at(-1).status, 'failed');
  assert.equal(calls.filter(value => value === 'generate').length, 1);
  console.log('PASS: count and reserve before inference; no generation on exhausted allowance, bad model or excessive input; failed call recorded without retry');
})().catch(error => { console.error(error); process.exitCode = 1; });
