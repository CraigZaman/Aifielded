const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),deps=createRequire(path.join(root,'package.json')),ts=deps('typescript');
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
const initial={mission_id:id(1),claim_token:id(2),mission:{title:'Reporting policy',objective:'Find practical gaps'},evidence:[{id:id(3),category:'policy',summary:'Late shifts need a contact',detail:'Clarify the escalation contact.',confidence:0.8,confidentiality:'CONTRIBUTE',user_id:'must-not-reach-model'}]};
let job=initial,enabled=true,calls=[],providerCalls=[],failure=null,finishError=false,stale=false;
let output={insights:[{kind:'theme',title:'Escalation routes',description:'Clarify ownership',evidenceIds:[id(3)],evidenceAgainst:[],confidence:0.8,impact:'low',recommendedAction:'',departments:[],question:''}]};
class AIProcessingError extends Error {constructor(code){super('Sensitive provider detail');this.code=code;}}
const admin={rpc:async(name,args)=>{calls.push({name,args});if(name==='claim_mission_analysis')return {data:job,error:null};if(name==='finish_mission_analysis')return {data:!stale,error:finishError?{}:null};if(name==='fail_mission_analysis')return {error:null};throw Error(name);}};
const mocks={
  'server-only':{},
  ai:{generateText:async args=>{providerCalls.push(args);if(failure)throw failure;return {output};},Output:{object:x=>x}},
  '@/lib/ai':{hasAIProvider:()=>enabled,createStructuredModel:()=> 'gemini-3.6-flash',AI_REQUEST_OPTIONS:{maxRetries:0,timeout:45000,maxOutputTokens:4096}},
  '@/lib/ai-failure':{describeAIFailure:()=>({code:'AI_PROCESSING_FAILED'})},
  '@/lib/ai-budget':{AIProcessingError},
  '@/lib/supabase/admin':{createAdminClient:()=>admin},
};
function load(file,extra={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,Error,Buffer,Response,process:{env:extra.env||{}},console:{error:()=>{}},require:name=>extra[name]||mocks[name]||deps(name)});return exports;}
async function main(){
  const {processMissionAnalysis}=load('src/lib/mission-analysis.ts');
  enabled=false;assert.equal(await processMissionAnalysis(id(1)),'unavailable');assert.equal(calls.length,0);enabled=true;
  job=null;assert.equal(await processMissionAnalysis(id(1)),'idle');assert.equal(providerCalls.length,0);
  job=initial;assert.equal(await processMissionAnalysis(id(1)),'ready');
  assert.equal(providerCalls[0].model,'gemini-3.6-flash');assert.equal(providerCalls[0].maxOutputTokens,4096);assert.equal(providerCalls[0].maxRetries,0);
  assert.ok(!providerCalls[0].prompt.includes('must-not-reach-model'),'Claim schema strips all contributor identifiers');
  assert.equal(calls.at(-1).name,'finish_mission_analysis');assert.equal(calls.at(-1).args.token,id(2));
  assert.equal(calls.at(-1).args.synthesis.themes[0].title,'Escalation routes');
  const theme=output.insights[0];
  job={...initial,departments:['sales','finance']};
  output={insights:[{...theme,kind:'investigation',title:'Check Sales dependency',description:'Delivery has reported a delay but Sales has not corroborated the cause.',departments:['sales'],question:'What needs to happen before Sales can release a packing slip?'}]};
  assert.equal(await processMissionAnalysis(id(1)),'ready');
  assert.equal(calls.at(-1).args.synthesis.investigations[0].departments[0],'sales');
  assert.ok(providerCalls.at(-1).system.includes('lead, not a confirmed root cause'));
  output.insights[0].departments=['invented'];assert.equal(await processMissionAnalysis(id(1)),'failed');
  output.insights[0].departments=['sales'];job={...job,is_follow_up:true};assert.equal(await processMissionAnalysis(id(1)),'failed');
  job={...job,is_follow_up:false,is_policy:true};assert.equal(await processMissionAnalysis(id(1)),'failed');
  output={insights:[theme]};
  calls=[];job={...initial,evidence:[]};const previousCalls=providerCalls.length;
  assert.equal(await processMissionAnalysis(id(1)),'ready');assert.equal(providerCalls.length,previousCalls,'Empty evidence clears results without paid generation');
  job={...initial,evidence:[{...initial.evidence[0],confidentiality:'PRIVATE'}]};await assert.rejects(processMissionAnalysis(id(1)));assert.equal(providerCalls.length,previousCalls);
  job=initial;output={insights:[{...output.insights[0],evidenceIds:[id(999)]}]};calls=[];
  assert.equal(await processMissionAnalysis(id(1)),'failed');assert.ok(!calls.some(c=>c.name==='finish_mission_analysis'));assert.equal(calls.at(-1).args.failure_code,'ANALYSIS_FAILED');
  output={insights:[]};failure=new Error('SDK wrapper',{cause:new AIProcessingError('AI_DAILY_LIMIT')});
  assert.equal(await processMissionAnalysis(id(1)),'deferred');assert.equal(calls.at(-1).args.failure_code,'AI_DAILY_LIMIT');
  failure=null;finishError=true;assert.equal(await processMissionAnalysis(id(1)),'failed');finishError=false;stale=true;assert.equal(await processMissionAnalysis(id(1)),'pending');stale=false;
  job={...initial,evidence:Array.from({length:200},(_,n)=>({...initial.evidence[0],id:id(n+10),detail:'x'.repeat(4000)}))};
  await processMissionAnalysis(id(1));
  assert.ok(Buffer.byteLength(providerCalls.at(-1).prompt,'utf8')<=70000,'Large evidence sets respect the input byte bound');
  assert.ok(JSON.parse(providerCalls.at(-1).prompt).evidence.length<200);
  job=initial;

  let cronCalls=0,cronResult='ready',cronThrow=false;
  const env={CRON_SECRET:'test-only-secret-'.repeat(4)};
  const cron=load('src/app/api/cron/mission-analysis/route.ts',{env,'@/lib/mission-analysis':{processMissionAnalysis:async()=>{cronCalls++;if(cronThrow)throw Error('private detail');return cronResult;}}}).GET;
  const req=token=>new Request('https://try-fielded.vercel.app/api/cron/mission-analysis',{headers:token?{authorization:token}:{}});
  assert.equal((await cron(req())).status,401);assert.equal((await cron(req('Bearer wrong'))).status,401);assert.equal(cronCalls,0);
  assert.equal((await cron(req(`Bearer ${env.CRON_SECRET}`))).status,200);assert.equal(cronCalls,4,'Recovery batch is bounded');
  cronCalls=0;cronResult='deferred';await cron(req(`Bearer ${env.CRON_SECRET}`));assert.equal(cronCalls,1,'Stop processing at the spending guard');
  cronThrow=true;const failed=await cron(req(`Bearer ${env.CRON_SECRET}`));assert.equal(failed.status,503);assert.ok(!(await failed.text()).includes('private'));
  delete env.CRON_SECRET;assert.equal((await cron(req('Bearer undefined'))).status,401);
  console.log('PASS: exact-model worker settings, identity stripping, private rejection, empty evidence, cited IDs, save failure, nested budget deferral, stale result handling and cron authentication/batch/error boundaries. Google and database responses mocked.');
}
main().catch(error=>{console.error(error);process.exit(1);});
