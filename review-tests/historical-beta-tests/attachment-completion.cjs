const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || '.'), dep = createRequire(path.join(root, 'package.json')), ts = dep('typescript');
let finishReason = 'length', text = 'Extracted source text';
const exported = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root, 'src/lib/ai.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, {
  exports: exported, process: { env: { GOOGLE_GENERATIVE_AI_API_KEY: 'test-only' } },
  require: name => name === 'server-only' ? {} : name === 'ai' ? { generateText: async () => ({ text, finishReason }) } : name === '@/lib/ai-budget' ? {} : dep(name),
});
(async () => {
  const run = () => exported.extractAttachment({ bytes: new Uint8Array(), mediaType: 'application/pdf', filename: 'test.pdf' });
  await assert.rejects(run(), /cut short/);
  finishReason = 'stop'; assert.equal(await run(), text);
  text = ''; await assert.rejects(run(), /No readable content/);
  console.log('PASS: truncated and empty attachment extraction rejected; complete extraction preserved. Mocked provider.');
})().catch(error => { console.error(error); process.exitCode = 1; });
