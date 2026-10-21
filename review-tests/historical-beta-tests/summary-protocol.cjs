const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || '.'), dep = createRequire(path.join(root, 'package.json')), ts = dep('typescript');
process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'fake-local-test-key';
const requests = [];
let invalid = false, invalidId = false;
const observation = { category: 'bottleneck', summary: 'Handoffs wait for approval.', detail: 'Approval ownership is unclear.', confidence: 0.8 };
const guardedFetch = async (url, init) => {
  assert.equal(url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent');
  const body = JSON.parse(init.body); requests.push(body);
  const config = body.generationConfig, schema = config.responseJsonSchema;
  assert.equal(config.responseSchema, undefined);
  assert.equal(config.maxOutputTokens, 4096);
  if (schema.properties.citations) {
    assert.equal(schema.properties.citations.items.format, undefined);
    assert.equal(schema.properties.citations.items.pattern, undefined);
    assert.equal(schema.properties.citations.maxItems, 12);
    return Response.json({ candidates: [{ content: { role: 'model', parts: [{ text: JSON.stringify({ citations: [invalidId ? 'not-an-id' : '00000000-0000-4000-8000-000000000001'] }) }] }, finishReason: 'STOP' }] });
  }
  assert.equal(schema.properties.observations.maxItems, 4);
  assert.equal(schema.properties.observations.items.properties.confidence.minimum, 0);
  assert.equal(schema.properties.observations.items.properties.confidence.maximum, 1);
  assert.equal(schema.properties.summary.maxLength, 6000);
  return Response.json({ candidates: [{ content: { role: 'model', parts: [{ text: JSON.stringify({ summary: 'Handoff ownership needs clarification.', observations: Array(invalid ? 5 : 1).fill(observation) }) }] }, finishReason: 'STOP' }], usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 100, totalTokenCount: 200 } });
};
const exported = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, 'src/lib/ai.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports: exported, process, require: name => name === 'server-only' ? {} : name === '@/lib/ai-budget' ? { budgetedGeminiFetch: guardedFetch } : dep(name) });
(async () => {
  const result = await exported.extractConversation({ mission: 'Handoffs', messages: [
    { sender: 'participant', content: 'PRIVATE_SENTINEL', confidentiality: 'PRIVATE' },
    { sender: 'participant', content: 'SHARED_SENTINEL', confidentiality: 'SHARE' },
    { sender: 'fielded', content: 'NOT_EMPLOYEE_EVIDENCE', confidentiality: 'SHARE' },
  ] });
  assert.equal(requests.length, 2);
  assert.equal(result.observations[0].sourceConfidentiality, 'PRIVATE');
  assert.equal(result.observations[1].sourceConfidentiality, 'SHARE');
  assert.ok(!JSON.stringify(requests[1]).includes('PRIVATE_SENTINEL'));
  assert.ok(!JSON.stringify(requests).includes('NOT_EMPLOYEE_EVIDENCE'));
  invalid = true;
  await assert.rejects(exported.extractConversation({ mission: 'Handoffs', messages: [{ sender: 'participant', content: 'Test', confidentiality: 'PRIVATE' }] }));
  assert.equal(requests.length, 3, 'No automatic extra generation or model fallback');
  const { z } = dep('zod'), { generateText, Output } = dep('ai');
  const citationSchema = z.object({ citations: z.array(z.string().uuid()).max(12) });
  const model = exported.createStructuredModel(citationSchema);
  const run = () => generateText({ ...exported.AI_REQUEST_OPTIONS, model, output: Output.object({ schema: citationSchema }), prompt: 'Synthetic citation test' });
  assert.equal((await run()).output.citations.length, 1);
  invalidId = true;
  await assert.rejects(run(), 'UUID validation remains enforced after wire-schema adaptation');
  console.log('PASS: actual SDK sends native JSON Schema bounds through guarded transport; confidentiality isolation, exact model/output limits and rejection of invalid replies retained. Google responses mocked.');
})().catch(error => { console.error(error); process.exitCode = 1; });
