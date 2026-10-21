const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || '.');
const deps = createRequire(path.join(root,'package.json'));
const ts = deps('typescript'), React = deps('react');
const { renderToStaticMarkup } = deps('react-dom/server');
let configured = true, authError = null, membershipError = null, profileError = null;
let user = { id: 'employee', email: 'employee@example.invalid', user_metadata: { full_name: 'Priya Shah' } };
let membership = { organisation_id: 'org', role: 'participant', organisations: { name: 'Example Engineering' } };
const visited = [];
const mocks = {
  react: { ...React, cache: callback => callback },
  'next/navigation': { redirect: href => { throw Object.assign(Error('REDIRECT'),{href}); } },
  'next/link': { __esModule: true, default: ({children,...props}) => React.createElement('a',props,children) },
  'next/image': { __esModule: true, default: ({priority,...props}) => React.createElement('img',props) },
  '@/lib/env': { hasSupabaseEnv: () => configured },
  '@/lib/supabase/server': { createClient: async () => ({
    auth: { getUser: async () => ({ data: { user }, error: authError }) },
    from: table => { visited.push(table); const query = {
      select: () => query, eq: () => query,
      limit: () => { throw Error('Do not silently choose between conflicting memberships'); },
      maybeSingle: async () => ({ data: table === 'organisation_memberships' ? membership : { full_name: 'Priya Shah' }, error: table === 'organisation_memberships' ? membershipError : profileError }),
    }; return query; },
  }) },
};
const cache = {};
function load(file) {
  if(cache[file]) return cache[file];
  const exports = {}; cache[file] = exports;
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'), { compilerOptions: {module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true} }).outputText, {exports,require:name=>{
    if(mocks[name]) return mocks[name];
    if(name.startsWith('@/')) { const stem=`src/${name.slice(2)}`; return load(fs.existsSync(path.join(root,`${stem}.tsx`)) ? `${stem}.tsx` : `${stem}.ts`); }
    return deps(name);
  }}); return exports;
}
async function main() {
  const {getViewer,requireViewer} = load('src/lib/auth.ts');
  const viewer = await getViewer(); assert.equal(viewer.organisationName,'Example Engineering'); assert.equal(viewer.role,'participant');
  membershipError={code:'PGRST000'}; await assert.rejects(requireViewer(), /Workspace access could not be checked/); membershipError=null;
  membershipError={code:'PGRST116'}; await assert.rejects(requireViewer(), /Workspace access could not be checked/); membershipError=null;
  profileError={code:'timeout'}; await assert.rejects(getViewer(), /profile could not be loaded/); profileError=null;
  membership={...membership,organisations:null}; await assert.rejects(getViewer(), /workspace could not be loaded/);
  membership=null; await assert.rejects(requireViewer(),error=>error.href==='/onboarding');
  user=null; authError={status:503}; visited.length=0; await assert.rejects(getViewer(), /Sign-in status could not be checked/); assert.equal(visited.length,0);
  authError={status:401}; assert.equal(await getViewer(),null);
  authError={status:400,name:'AuthSessionMissingError'}; assert.equal(await getViewer(),null);
  configured=false; await assert.rejects(requireViewer(),error=>error.href==='/setup');
  let retries=0;
  const errorPage=load('src/app/error.tsx').default({error:Error('DO_NOT_DISPLAY_SENSITIVE_DATABASE_DETAILS'),reset:()=>retries++});
  errorPage.props.children.props.onClick(); assert.equal(retries,1);
  const errorHtml=renderToStaticMarkup(errorPage); assert.ok(errorHtml.includes('Try again')); assert.ok(!errorHtml.includes('DO_NOT_DISPLAY'));
  const unavailableHtml=renderToStaticMarkup(React.createElement(load('src/app/not-found.tsx').default)); assert.ok(unavailableHtml.includes('Back to workspace'));
  const css=fs.readFileSync(path.join(root,'src/app/globals.css'),'utf8');
  fs.writeFileSync('/private/tmp/fielded-role-screens/workspace-recovery.html',`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fielded recovery</title><style>:root{--font-sans:Arial,sans-serif}${css}</style><body>${errorHtml.replace('src="/fielded-logo.png"','src="./fielded-logo.png"')}</body></html>`);
  console.log('PASS: correct role/workspace, lookup failures do not redirect to onboarding, conflicting memberships fail closed, normal session/setup paths, retry control and redacted error rendering. Supabase responses mocked.');
}
main().catch(error=>{console.error(error);process.exit(1);});
