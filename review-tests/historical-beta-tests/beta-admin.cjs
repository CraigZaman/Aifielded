const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || '.');
const deps = createRequire(path.join(root,'package.json'));
const ts = deps('typescript');
const actorId='00000000-0000-4000-8000-000000000001';
const targetId='00000000-0000-4000-8000-000000000002';
const workspaceId='00000000-0000-4000-8000-000000000003';
let allowed=true, protectedTarget=false, auditFails=false;
let calls=[];
const auth = { getUser: async()=>({data:{user:{id:actorId,email:'admin@example.test'}},error:null}) };
const admin = {
  auth:{admin:{
    createUser:async value=>{calls.push(['createUser',value]);return {data:{user:{id:targetId}},error:null};},
    getUserById:async()=>({data:{user:{id:targetId,email:'priya@fielded.test'}},error:null}),
    deleteUser:async (...args)=>{calls.push(['deleteUser',...args]);return {data:{},error:null};},
    updateUserById:async (...args)=>{calls.push(['updateUser',...args]);return {data:{},error:null};},
  }},
  from(table){let operation;const chain={
    select:()=>chain,eq:()=>chain,
    insert:value=>{operation='insert';calls.push([table,'insert',value]);return chain;},
    update:value=>{operation='update';calls.push([table,'update',value]);return chain;},
    maybeSingle:async()=>({data:table==='platform_admins'?(protectedTarget?{user_id:targetId}:null):{id:workspaceId},error:null}),
    single:async()=>({data:auditFails?null:{id:'event'},error:auditFails?{message:'denied'}:null}),
    then:resolve=>Promise.resolve(resolve({data:operation?{}:null,error:null})),
  };return chain;},
};
const mocks={
  'server-only':{},
  'next/navigation':{notFound:()=>{throw Error('NOT_FOUND');},redirect:url=>{throw Object.assign(Error('REDIRECT'),{url});}},
  'next/cache':{revalidatePath:()=>{}},
  '@/lib/supabase/server':{createClient:async()=>({auth,rpc:async()=>({data:allowed,error:null})})},
  '@/lib/supabase/admin':{createAdminClient:()=>{calls.push(['adminClient']);return admin;}},
};
function load(file){const exports={};const code=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{exports,Date,console,require:name=>mocks[name]||deps(name)});return exports;}
mocks['@/lib/platform-admin']=load('src/lib/platform-admin.ts');
const actions=load('src/app/ops/actions.ts');
function form(values){const f=new FormData();Object.entries(values).forEach(([k,v])=>f.set(k,v));return f;}
async function redirected(fn){try{await fn();assert.fail('Expected redirect');}catch(error){if(error.message!=='REDIRECT')throw error;return decodeURIComponent(error.url);}}
(async()=>{
  const values={email:'priya@fielded.test',name:'Priya Test',password:'Example-Password-123',workspaceId,role:'hr'};
  allowed=false;
  assert.equal(await redirected(()=>actions.createTestAccount(form(values))),'/ops/access');
  assert.equal(await redirected(()=>actions.manageBetaAccount(form({}))),'/ops/access');
  assert.equal(calls.length,0,'unauthorised calls never obtain the admin client');
  allowed=true;
  await redirected(()=>actions.createTestAccount(form({...values,email:'someone@gmail.com'})));
  assert.equal(calls.length,0,'normal domains cannot bypass email verification');
  await redirected(()=>actions.createTestAccount(form(values)));
  const created=calls.find(c=>c[0]==='createUser')[1];
  assert.equal(created.email_confirm,true);assert.equal(created.app_metadata.beta_test,true);
  assert.equal(calls.find(c=>c[0]==='organisation_memberships'&&c[1]==='insert')[2].role,'hr');
  assert.ok(!JSON.stringify(calls.filter(c=>c[0]==='platform_admin_events')).includes(values.password));
  calls=[];
  const manage={userId:targetId,confirmEmail:'priya@fielded.test',operation:'remove_login',consent:'on'};
  protectedTarget=true;
  await redirected(()=>actions.manageBetaAccount(form(manage)));
  assert.ok(!calls.some(c=>c[0]==='deleteUser'));
  protectedTarget=false;calls=[];
  await redirected(()=>actions.manageBetaAccount(form({...manage,confirmEmail:'wrong@fielded.test'})));
  assert.ok(!calls.some(c=>c[0]==='deleteUser'));
  calls=[];auditFails=true;
  await redirected(()=>actions.manageBetaAccount(form(manage)));
  assert.ok(!calls.some(c=>c[0]==='deleteUser'));
  calls=[];auditFails=false;
  await redirected(()=>actions.manageBetaAccount(form(manage)));
  assert.equal(calls.find(c=>c[0]==='deleteUser')[2],true,'remove login uses soft deletion to preserve workspace records');
  assert.ok(calls.findIndex(c=>c[0]==='organisation_memberships')<calls.findIndex(c=>c[0]==='deleteUser'));
  calls=[];
  await redirected(()=>actions.manageBetaAccount(form({...manage,operation:'reset_password',password:values.password})));
  assert.equal(calls.find(c=>c[0]==='updateUser')[2].password,values.password);
  assert.ok(!JSON.stringify(calls.filter(c=>c[0]==='platform_admin_events')).includes(values.password));
  console.log('PASS: admin-only actions, reserved fake emails, workspace roles, protected admin deletion, exact confirmation, audit-before-mutation and password redaction. Provider calls are mocked.');
})().catch(error=>{console.error(error);process.exitCode=1;});
