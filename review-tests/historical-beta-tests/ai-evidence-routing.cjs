const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(process.argv[2] || '.');
const dependencies = createRequire(path.join(root,'package.json'));
const ts = dependencies('typescript');
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const evidence = [{ id:id(1),mission_id:id(2),summary:'Handoffs delay approval',detail:'A single approval owner is missing.',category:'bottleneck',confidence:0.8,confidentiality:'CONTRIBUTE' }];
let role='owner', user={id:id(3)}, failEvidence=false, providerError=false, calls=0, output, saved, audit, workerResult='ready', workerCalls=0;
function query(table) {
  assert.notEqual(table,'observations','Management must not query raw identities');
  const q={select:()=>q,eq:()=>q,neq:()=>q,order:()=>q,limit:()=>q,maybeSingle:()=>q,
    insert:value=>{audit=value;return Promise.resolve({error:null});},
    then:resolve=>resolve({data:table==='organisation_memberships'?{organisation_id:id(4),role}:table==='missions'?{title:'Handoffs',objective:'Understand delays'}:evidence,error:table==='management_observations' && failEvidence?{message:'database failure'}:null})};
  return q;
}
const supabase={auth:{getUser:async()=>({data:{user}})},from:query,rpc:async(name,args)=>{
  assert.equal(name,'request_mission_analysis');saved=args;return {error:null};
}};
const mocks={
  ai:{generateText:async()=>{calls++;if(providerError)throw Error('secret provider details');return {output};},Output:{object:x=>x}},
  'next/server':{NextResponse:{json:(body,init={})=>({body,status:init.status||200}),redirect:(url,status)=>({url:String(url),status})}},
  '@/lib/ai':{hasAIProvider:()=>true,createStructuredModel:()=>({}),AI_REQUEST_OPTIONS:{}},
  '@/lib/ai-failure':{describeAIFailure:()=>({code:'AI_PROCESSING_FAILED'})},
  '@/lib/auth':{canManage:r=>r==='owner'},
  '@/lib/supabase/server':{createClient:async()=>supabase},
  '@/lib/mission-analysis':{processMissionAnalysis:async()=>{workerCalls++;return workerResult;}},
};
function load(file){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,URL,Set,Buffer,console:{error:()=>{}},require:name=>mocks[name]||dependencies(name)});return exports;}
const ask=load('src/app/api/ai/ask/route.ts').POST;
const synthesise=load('src/app/api/missions/[id]/synthesise/route.ts').POST;
const request={url:'https://try-fielded.vercel.app/api/ai/ask',json:async()=>({question:'Where are handoffs delayed?'})};
(async()=>{
  assert.equal((await ask({json:async()=>{throw Error('bad json');}})).status,400);
  user=null; assert.equal((await ask(request)).status,401);user={id:id(3)};
  role='participant';assert.equal((await ask(request)).status,403);role='owner';
  failEvidence=true;assert.equal((await ask(request)).status,503);assert.equal(calls,0);failEvidence=false;
  providerError=true;const failed=await ask(request);assert.equal(failed.status,503);assert.ok(!JSON.stringify(failed).includes('secret'));providerError=false;
  output={answer:'Approval ownership needs clarification.',evidenceIds:[id(99)]};assert.equal((await ask(request)).status,503);
  output={answer:'Unsupported answer',evidenceIds:[]};assert.ok((await ask(request)).body.answer.includes('does not support'));
  output={answer:'Approval ownership needs clarification.',evidenceIds:[id(1),id(1)]};const answer=await ask(request);
  assert.equal(answer.status,200);assert.equal(answer.body.sources.length,1);assert.equal(answer.body.sources[0].missionId,id(2));assert.ok(!JSON.stringify(answer).includes('user_id'));assert.ok(!JSON.stringify(audit).includes('question'));
  const context={params:Promise.resolve({id:id(2)})};
  role='participant';assert.equal((await synthesise(request,context)).status,403);assert.equal(workerCalls,0);role='owner';
  const result=await synthesise(request,context);assert.equal(result.status,303);assert.equal(saved.target_mission,id(2));assert.equal(workerCalls,1);assert.ok(result.url.includes('updated'));
  workerResult='deferred';assert.ok((await synthesise(request,context)).url.includes('allowance'));
  workerResult='failed';assert.ok((await synthesise(request,context)).url.includes('unchanged'));
  console.log('PASS: Ask authorisation, provider/database failure handling, known evidence citations, identity exclusion and manager-only queued synthesis. Worker citation/count persistence is covered by mission-analysis-worker and mission-analysis-queue.');
})().catch(error=>{console.error(error);process.exitCode=1;});
