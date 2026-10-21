const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),deps=createRequire(path.join(root,'package.json')),ts=deps('typescript');
const id=n=>`30000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
let viewer={id:id(1),organisationId:id(2),role:'participant'},allowed=true,errorCode=null,calls=[];
const mocks={
 'next/cache':{revalidatePath:()=>{}},'next/server':{NextResponse:{json:(body,options)=>({body,status:options?.status||200})}},
 '@/lib/auth':{getViewer:async()=>viewer},'@/lib/publishing':{getPublishingRule:async()=>({allowed})},
 '@/lib/supabase/server':{createClient:async()=>({rpc:async(name,args)=>{calls.push({name,args});return {data:errorCode?null:name==='submit_publication'?{id:id(3),status:'pending_owner'}:id(3),error:errorCode?{code:errorCode,message:'PRIVATE_DATABASE_DETAILS'}:null};}})},
};
const cache={};function load(file){if(cache[file])return cache[file];const exports={};cache[file]=exports;vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:name=>mocks[name]||(name.startsWith('@/')?load('src/'+name.slice(2)+'.ts'):deps(name))});return exports;}
const {POST}=load('src/app/api/communications/route.ts');
const quote='Contact the safety lead before the end of the shift.';
const payload={requestId:id(3),title:'Safety policy update',version:'v1',policyText:quote+' Report incidents promptly and use the deputy contact if the safety lead is absent.',sourceName:'Test.txt',briefing:'Review the safety reporting route and the end-of-shift deadline.',recipients:[id(4)],audience:{mode:'department_heads',departmentKeys:[]},reviewed:true,questions:Array.from({length:3},()=>({question:'Who receives safety reports?',options:['Safety lead','Sales','Nobody'],correctIndex:0,explanation:'The safety lead receives reports.',sourceQuote:quote}))};
(async()=>{
 const request=()=>({json:async()=>payload});
 allowed=false;assert.equal((await POST(request())).status,403);assert.equal(calls.length,0);allowed=true;
 const result=await POST(request());assert.equal(result.body.request,true);assert.equal(result.body.status,'pending_owner');assert.equal(calls[0].name,'submit_publication');assert.equal(calls[0].args.workspace,id(2));assert.equal(calls[0].args.audience_mode,'department_heads');
 errorCode='P0001';const rejected=await POST(request());assert.equal(rejected.status,400,'Known validation failure lets the client edit its retained draft');assert.ok(!rejected.body.error.includes('PRIVATE_DATABASE_DETAILS'));
 errorCode='08006';assert.equal((await POST(request())).status,503,'Uncertain connection failures retain the idempotent retry path');
 errorCode=null;viewer={...viewer,role:'owner'};assert.equal((await POST(request())).body.id,id(3));assert.equal(calls.at(-1).name,'launch_policy_targeted');
 console.log('PASS: policy publishing permission gate, delegated approval request, authenticated workspace and audience binding, retained drafts on validation failure, uncertain retries and existing owner route. Database mocked.');
})().catch(e=>{console.error(e);process.exitCode=1;});
