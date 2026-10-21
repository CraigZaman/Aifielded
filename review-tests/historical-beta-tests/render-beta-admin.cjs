const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),deps=createRequire(path.join(root,'package.json'));
const ts=deps('typescript'),React=deps('react'),{renderToStaticMarkup}=deps('react-dom/server');
const users=[{id:'admin',email:'admin@example.test',created_at:'2026-09-01',user_metadata:{full_name:'Beta Administrator'},app_metadata:{}},{id:'test',email:'priya-test@fielded.test',created_at:'2026-09-05',user_metadata:{full_name:'Priya Test'},app_metadata:{beta_test:true}}];
const results={organisations:[{id:'workspace',name:'Example Engineering'}],platform_admins:[{user_id:'admin'}],organisation_memberships:[{user_id:'test',organisation_id:'workspace',role:'participant',status:'active'}],platform_admin_events:[{id:'event',action:'create_test_account',status:'succeeded',created_at:'2026-09-05T12:00:00Z'}]};
const client={auth:{admin:{listUsers:async()=>({data:{users},error:null})}},from:table=>{const q={select:()=>q,order:()=>q,in:()=>q,limit:()=>q,then:resolve=>Promise.resolve(resolve({data:results[table],error:null}))};return q;}};
const mocks={
  'next/link':{default:({children,...props})=>React.createElement('a',props,children)},
  '@/components/brand':{Brand:()=>React.createElement('img',{src:'./fielded-logo.png',alt:'Fielded.ai',width:140})},
  '@/lib/supabase/admin':{createAdminClient:()=>client},
  '@/lib/platform-admin':{requirePlatformAdmin:async()=>users[0]},
  '@/app/ops/actions':{createTestAccount:'/test/create',manageBetaAccount:'/test/manage'},
};
const exportsForTest={};
const code=ts.transpileModule(fs.readFileSync(path.join(root,'src/app/ops/page.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
vm.runInNewContext(code,{exports:exportsForTest,Date,console,require:name=>mocks[name]||deps(name)});
(async()=>{
  const html=renderToStaticMarkup(await exportsForTest.default({searchParams:Promise.resolve({})}));
  assert.ok(html.includes('Create test account')&&html.includes('Reset password')&&html.includes('Remove login'));
  assert.ok(!html.includes('name="userId" value="admin"'));
  assert.ok(html.includes('Protected admin')&&html.includes('Test account'));
  const css=['globals.css','role-workspaces.css'].map(f=>fs.readFileSync(path.join(root,'src/app',f),'utf8')).join('\n');
  fs.writeFileSync('/private/tmp/fielded-role-screens/beta-admin.html',`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Beta admin layout test</title><style>:root{--font-sans:Arial,sans-serif;--font-mono:monospace}${css}</style><body>${html}</body></html>`);
  console.log('PASS: admin creation/reset/removal forms and protected-account rendering; local fixture ready for screenshot verification.');
})().catch(error=>{console.error(error);process.exitCode=1;});
