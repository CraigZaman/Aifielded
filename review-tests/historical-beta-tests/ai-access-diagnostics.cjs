const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const ts = require('typescript');
const key = 'AQ.synthetic-test-not-a-real-key';
const calls = [];
const output = {};
const source = ts.transpileModule(fs.readFileSync('src/lib/ai-diagnostics.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
vm.runInNewContext(source,{
  exports:output,require:()=>({}),process:{env:{GOOGLE_GENERATIVE_AI_API_KEY:key}},AbortSignal,
  fetch:async(url,init)=>{
    calls.push({url,init});
    assert.equal(init.headers['x-goog-api-key'],key);
    assert.equal(init.redirect,'error');
    return Response.json({error:{message:`models/gemini-3.6-flash not found. ${key}`}},{status:404});
  },
});
(async()=>{
  const result=await output.inspectGeminiAccess();
  assert.equal(calls.length,2);
  assert.equal(calls[0].init.method,'GET');
  assert.ok(calls[0].url.endsWith('/models/gemini-3.6-flash'));
  assert.ok(calls[1].url.endsWith('/models/gemini-3.6-flash:countTokens'));
  assert.ok(!calls.some(call=>call.url.includes('generateContent')));
  assert.equal(result[0].http,404);
  assert.ok(!JSON.stringify(result).includes(key));
  assert.ok(result[0].detail.includes('[REDACTED]'));
  assert.ok(JSON.parse(calls[1].init.body).contents[0].parts[0].text.includes('Synthetic'));
  console.log('PASS: diagnostics use only authorised model metadata and synthetic token count, reject redirects, and redact credentials. No generation calls.');
})().catch(error=>{console.error(error);process.exitCode=1;});
