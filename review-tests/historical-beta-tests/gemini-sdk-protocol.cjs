const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || '.');
const dep = createRequire(path.join(process.argv[3] || root, 'package.json'));
const ts = dep('typescript');
const { createGoogle } = dep('@ai-sdk/google');
const { generateText } = dep('ai');
const stages = [];
let rejectKey = false;
const admin = {
  rpc: async () => ({ data: 'test-generation', error: null }),
  from: () => ({ update: () => ({ eq: async () => ({ error: null }) }) }),
};
const code = ts.transpileModule(fs.readFileSync(path.join(root, 'src/lib/ai-budget.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exportsForTest = {};
vm.runInNewContext(code, {
  exports: exportsForTest, console, Date,
  require: name => name === 'server-only' ? {} : name === '@/lib/supabase/admin' ? { createAdminClient: () => admin } : dep(name),
  fetch: async (url, init) => {
    const body = JSON.parse(init.body);
    if (String(url).endsWith(':countTokens')) {
      stages.push('count');
      if (rejectKey) return Response.json({ error: { message: 'API key not valid.', details: [{ reason: 'API_KEY_INVALID' }] } }, { status: 400 });
      assert.equal(body.generateContentRequest.model, 'models/gemini-3.6-flash');
      assert.equal(body.generateContentRequest.generationConfig.maxOutputTokens, 4096);
      return Response.json({ totalTokens: 10 });
    }
    stages.push('generate');
    assert.ok(String(url).endsWith('/models/gemini-3.6-flash:generateContent'));
    return Response.json({ candidates: [{ content: { role: 'model', parts: [{ text: 'Connection verified.' }] }, finishReason: 'STOP' }], usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 } });
  },
});
(async () => {
  const model = createGoogle({ apiKey: 'fake-test-key', fetch: exportsForTest.budgetedGeminiFetch })('gemini-3.6-flash');
  const result = await generateText({ model, prompt: 'Test', maxOutputTokens: 4096, maxRetries: 0, providerOptions: { google: { thinkingConfig: { thinkingLevel: "low", includeThoughts: false } } } });
  assert.equal(result.text, 'Connection verified.');
  assert.deepEqual(stages, ['count', 'generate']);
  rejectKey = true;
  await assert.rejects(generateText({ model, prompt: 'Test', maxOutputTokens: 4096, maxRetries: 0 }), error => error instanceof exportsForTest.AIProcessingError && error.code === 'GOOGLE_KEY_INVALID');
  console.log('PASS: installed Google SDK request format passes the actual budget transport and returns a parsed response');
})().catch(error => { console.error(error); process.exitCode = 1; });
