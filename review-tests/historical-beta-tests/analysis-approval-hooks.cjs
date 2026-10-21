const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),deps=createRequire(path.join(root,'package.json')),ts=deps('typescript');
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
let user={id:id(1)},databaseError=null,callbacks=[],processed=[];
const supabase={auth:{getUser:async()=>({data:{user}})},rpc:async()=>({error:databaseError})};
const mocks={
  '@/lib/audience':require('./support/load-audience.cjs')(root),
  '@/lib/publishing':{},
  'next/server':{after:callback=>callbacks.push(callback),NextResponse:{json:(body,options)=>({body,status:options?.status||200})}},
  'next/navigation':{redirect:url=>{throw Object.assign(Error('redirect'),{url});}},'next/cache':{revalidatePath:()=>{}},
  '@/lib/auth':{requireViewer:async()=>({id:id(1)})},
  '@/lib/supabase/server':{createClient:async()=>supabase},
  '@/lib/mission-analysis':{processApprovedAssignment:async(...args)=>processed.push(args)},
  '@/lib/env':{},'@/lib/email':{},'@/lib/profile-options':{},'@/lib/work-notifications':{},
};
function load(file){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{exports,URLSearchParams,require:name=>mocks[name]||deps(name)});return exports;}
(async()=>{
  const approve=load('src/app/api/conversations/[assignmentId]/approve/route.ts').POST;
  const written=load('src/app/app/actions.ts').submitWrittenResponse;
  const request={json:async()=>({reviewId:id(3)})},context={params:Promise.resolve({assignmentId:id(2)})};
  user=null;assert.equal((await approve(request,context)).status,401);assert.equal(callbacks.length,0);user={id:id(1)};
  databaseError={message:'stale review'};assert.equal((await approve(request,context)).status,409);assert.equal(callbacks.length,0);
  databaseError=null;assert.equal((await approve(request,context)).status,200);assert.equal(callbacks.length,1);await callbacks.pop()();assert.deepEqual(processed.pop(),[id(2),id(1)]);
  const form=new FormData();for(const [key,value]of Object.entries({assignmentId:id(2),title:'Safety policy',response:'Please clarify the reporting route for employees on late shifts.',confidentiality:'SHARE',confirmed:'on'}))form.set(key,value);
  databaseError={message:'not authorised'};await assert.rejects(written(form),error=>Boolean(error.url));assert.equal(callbacks.length,0);
  databaseError=null;await assert.rejects(written(form),error=>error.url?.includes('complete'));assert.equal(callbacks.length,1);await callbacks.pop()();assert.deepEqual(processed.pop(),[id(2),id(1)]);
  console.log('PASS: AI review and written-response success schedule the approved assignment with the authenticated user ID; failed or signed-out approvals never start processing. Actions/RPC mocked.');
})().catch(error=>{console.error(error);process.exit(1);});
