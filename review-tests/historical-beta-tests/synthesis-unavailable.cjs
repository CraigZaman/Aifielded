const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || process.cwd());
const dependencies = createRequire(path.join(process.argv[3] || root,'package.json'));
const ts = dependencies('typescript');
const touched = [];
const results = {
 organisation_memberships: { organisation_id: 'workspace', role: 'owner' },
 missions: { title: 'Test', objective: 'Test' },
 management_observations: [{ summary: 'Existing approved evidence' }],
};
const supabase = {
 auth: { getUser: async () => ({ data: { user: { id: 'owner' } } }) },
 from: table => {
   const query = {
     select: () => query, eq: () => query, neq: () => query, limit: () => query, order: () => query,
     maybeSingle: async () => ({ data: results[table] }),
     then: resolve => resolve({ data: results[table] }),
     delete: () => { touched.push(table); throw new Error('Unexpected deletion'); },
   };
   return query;
 },
};
const mocks = {
 'next/server': { NextResponse: { redirect: (url,status) => ({url:String(url),status}), json: (body,init) => ({body,...init}) } },
 '@/lib/ai': { hasAIProvider: () => false, MODEL: {} },
 '@/lib/mission-analysis': { processMissionAnalysis: () => { throw new Error('Unexpected processing'); } },
 '@/lib/auth': { canManage: () => true },
 '@/lib/supabase/server': { createClient: async () => supabase },
 ai: { generateText: () => { throw new Error('Unexpected AI call'); }, Output: {} },
};
const source = fs.readFileSync(path.join(root,'src/app/api/missions/[id]/synthesise/route.ts'),'utf8');
const code = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const exportsForTest = {};
vm.runInNewContext(code,{exports:exportsForTest,URL,require:name=>mocks[name]||dependencies(name)});
(async()=>{
 const result = await exportsForTest.POST({url:'https://try-fielded.vercel.app/api/missions/test/synthesise'},{params:Promise.resolve({id:'00000000-0000-4000-8000-000000000001'})});
 assert.equal(result.status,303);
 assert.ok(result.url.includes('unchanged'));
 assert.deepEqual(touched,[]);
 console.log('PASS: unavailable AI preserves findings and never invokes a provider');
})().catch(error=>{console.error(error);process.exitCode=1;});
