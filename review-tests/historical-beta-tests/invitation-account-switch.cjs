const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),deps=createRequire(path.join(root,'package.json'));
const ts=deps('typescript'),React=deps('react'),{renderToStaticMarkup}=deps('react-dom/server');
const token='test-invitation-token-0123456789';
let email='wrong@fielded.test',signedOut=false;
const supabase={auth:{getUser:async()=>({data:{user:{id:'user',email,user_metadata:{}}}}),signInWithPassword:async()=>({error:{message:'Invalid credentials'}}),signOut:async options=>{assert.equal(options.scope,'local');signedOut=true;return {error:null};}},
rpc:async()=>({data:[{organisation_name:'Test Company',mission_title:'Join the team',mission_objective:'Invitation',access_role:'participant',invited_email:'invited@fielded.test',expired:false}]}),
from:()=>{const q={select:()=>q,eq:()=>q,maybeSingle:async()=>({data:null})};return q;}};
const mocks={
  'next/navigation':{redirect:url=>{throw Object.assign(Error('REDIRECT'),{url});},notFound:()=>{throw Error('NOT_FOUND');}},
  'next/link':{default:({children,...props})=>React.createElement('a',props,children)},
  '@/components/brand':{Brand:()=>React.createElement('span',{},'Fielded.ai')},
  '@/lib/env':{appUrl:()=> 'https://try-fielded.vercel.app',hasSupabaseEnv:()=>true},
  '@/lib/supabase/server':{createClient:async()=>supabase},
  '@/app/app/actions':{acceptInvitation:'/test/accept'},
};
function load(file){const exports={};const code=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;vm.runInNewContext(code,{exports,URL,console,require:name=>mocks[name]||deps(name)});return exports;}
mocks['@/lib/safe-redirect']=load('src/lib/safe-redirect.ts');
mocks['@/lib/profile-options']=load('src/lib/profile-options.ts');
const actions=load('src/app/(auth)/actions.ts');
mocks['@/app/(auth)/actions']={switchInvitationAccount:'/test/switch'};
const Join=load('src/app/join/[token]/page.tsx').default;
async function redirected(fn){try{await fn();assert.fail('Expected redirect');}catch(error){if(error.message!=='REDIRECT')throw error;return error.url;}}
function form(values){const f=new FormData();Object.entries(values).forEach(([k,v])=>f.set(k,v));return f;}
(async()=>{
  const result=await redirected(()=>actions.signIn(form({email:'invited@fielded.test',password:'incorrect-password',next:`/join/${token}`})));
  assert.equal(new URL(result,'https://fielded.test').searchParams.get('next'),`/join/${token}`);
  const html=renderToStaticMarkup(await Join({params:Promise.resolve({token}),searchParams:Promise.resolve({})}));
  assert.ok(html.includes('Switch account and continue invitation'));
  assert.ok(!html.includes('name="fullName"'));
  assert.ok(html.includes('wrong@fielded.test')&&html.includes('invited@fielded.test'));
  assert.equal(await redirected(()=>actions.switchInvitationAccount(form({token}))),`/join/${token}`);
  assert.equal(signedOut,true);
  email='INVITED@fielded.test';
  const matching=renderToStaticMarkup(await Join({params:Promise.resolve({token}),searchParams:Promise.resolve({})}));
  assert.ok(matching.includes('Accept invitation'));
  assert.ok(!matching.includes('Switch account and continue invitation'));
  signedOut=false;await assert.rejects(actions.switchInvitationAccount(form({token:'https://evil.invalid'})));assert.equal(signedOut,false);
  console.log('PASS: wrong-account invitation UI, local sign-out preserves invite, case-insensitive match, failed login retains invitation, invalid switch token rejected.');
})().catch(error=>{console.error(error);process.exitCode=1;});
