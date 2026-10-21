const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),deps=createRequire(path.join(root,'package.json')),ts=deps('typescript');
const id=n=>`20000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
let role='owner',fail=false,status='pending_owner',calls=[],dispatched=0;
const mocks={
 'next/cache':{revalidatePath:()=>{}},'next/server':{after:()=>{dispatched++;}},
 '@/lib/auth':{requireViewer:async()=>({id:id(1),organisationId:id(2),role})},
 '@/lib/work-notifications':{},
 '@/lib/supabase/server':{createClient:async()=>({rpc:async(name,args)=>{calls.push({name,args});return {data:status,error:fail?{message:'PRIVATE_DATABASE_DETAILS'}:null};}})},
};
const exported={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/app/app/publishing/actions.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:exported,require:name=>mocks[name]||deps(name)});
const form=values=>{const f=new FormData();for(const[k,v]of Object.entries(values))f.set(k,v);return f;};
(async()=>{
 const permission=form({person:id(3),kind:'mission',allowed:'true',scope:'department',approval:'head_then_owner',visibility:'owners',workspace:id(999)});
 role='participant';assert.ok((await exported.savePublishingPermission({error:null},permission)).error);assert.equal(calls.length,0);
 role='owner';assert.ok((await exported.savePublishingPermission({error:null},permission)).success);assert.equal(calls[0].args.workspace,id(2));assert.equal(calls[0].args.can_publish,true);assert.equal(calls[0].args.approval_sequence,'head_then_owner');
 const decision=form({id:id(4),decision:'approve',note:'Reviewed the named recipients.'});
 fail=true;const failure=await exported.reviewPublication({error:null},decision);assert.ok(failure.error);assert.ok(!failure.error.includes('PRIVATE_DATABASE_DETAILS'));assert.equal(dispatched,0);
 fail=false;status='pending_owner';assert.ok((await exported.reviewPublication({error:null},decision)).success);assert.equal(dispatched,0,'Head review does not dispatch assignments');
 status='published';assert.ok((await exported.reviewPublication({error:null},decision)).success);assert.equal(dispatched,1);
 role='hr';assert.ok((await exported.saveMissionVisibility({error:null},form({mission:id(4),scope:'owners',department:''}))).error);
 role='owner';assert.ok((await exported.saveMissionVisibility({error:null},form({mission:id(4),scope:'department',department:id(5)}))).success);assert.equal(calls.at(-1).args.target_department,id(5));
 console.log('PASS: owner-only permission/visibility actions, authenticated workspace binding, decision payloads, safe errors and notification dispatch only after publication. Database mocked.');
})().catch(e=>{console.error(e);process.exitCode=1;});
