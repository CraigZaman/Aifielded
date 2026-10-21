const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || '.');
const dependencies = createRequire(path.join(process.argv[3] || root, 'package.json'));
const ts = dependencies('typescript');
const calls = [];
const configuredModels = [];
const environment = { GOOGLE_GENERATIVE_AI_API_KEY: 'test-only', QWEN_API_KEY: 'must-not-be-used', AI_MODEL: 'must-not-be-used' };
function load(file, mocks) {
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, console, process: { env: environment }, require: name => mocks[name] || dependencies(name) });
  return exports;
}
const moduleUnderTest = load('src/lib/ai.ts', {
  'server-only': {},
  '@/lib/ai-budget': { budgetedGeminiFetch: () => {} },
  '@ai-sdk/google': { createGoogle: options => {
    assert.equal(typeof options.fetch, 'function');
    return model => { configuredModels.push(model); return { model }; };
  } },
  ai: { Output: { object: value => value }, generateText: async options => {
    calls.push(options);
    return { text: 'Extracted test content', output: { summary: 'Test summary', observations: [{ category: 'process', summary: 'Test observation', detail: 'Test detail', confidence: 0.8, sourceConfidentiality: 'SHARE' }] } };
  } },
});
(async () => {
  assert.deepEqual(configuredModels, ['gemini-3.6-flash', 'gemini-3.6-flash']);
  const messages = [
    { sender: 'participant', content: 'private-secret', confidentiality: 'PRIVATE' },
    { sender: 'participant', content: 'anonymous-process', confidentiality: 'CONTRIBUTE' },
    { sender: 'participant', content: 'shareable-process', confidentiality: 'SHARE' },
    { sender: 'fielded', content: 'assistant-private-context', confidentiality: 'SHARE' },
  ];
  const extracted = await moduleUnderTest.extractConversation({ mission: 'Test', messages });
  assert.equal(calls.length, 3);
  assert.deepEqual(Array.from(extracted.observations, item => item.sourceConfidentiality), ['PRIVATE', 'CONTRIBUTE', 'SHARE']);
  assert.ok(calls[0].prompt.includes('private-secret'));
  assert.ok(!calls[1].prompt.includes('private-secret') && !calls[2].prompt.includes('private-secret'));
  assert.ok(calls.every(call => !call.prompt.includes('assistant-private-context')));
  await moduleUnderTest.extractAttachment({ bytes: new Uint8Array([1, 2]), mediaType: 'image/png', filename: 'test.png' });
  assert.equal(calls[3].messages[0].content[1].mediaType, 'image/png');
  assert.ok(calls.every(call => call.model.model === 'gemini-3.6-flash' && call.maxRetries === 0 && call.maxOutputTokens <= 4096));
  environment.GOOGLE_GENERATIVE_AI_API_KEY = '';
  assert.equal(moduleUnderTest.hasAIProvider(), false);
  await assert.rejects(moduleUnderTest.runDialogue({ mission: 'Test', objective: '', transcript: '', latest: 'Hi' }), /not been connected/);
  assert.equal(calls.length, 4);
  console.log('PASS: exact Gemini model, no provider fallback, bounded calls, confidentiality-isolated extraction, multimodal file part');
})().catch(error => { console.error(error); process.exitCode = 1; });
