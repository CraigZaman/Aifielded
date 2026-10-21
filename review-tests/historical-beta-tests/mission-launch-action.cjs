const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),deps=createRequire(path.join(root,'package.json')),ts=deps('typescript');
const id=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
let role='owner',failure=false,created=true,calls=[],afterCount=0,allowed=true,publicationStatus='pending_owner';
const mocks={
  '@/lib/audience':require('./support/load-audience.cjs')(root),
  '@/lib/publishing':{getPublishingRule:async()=>({allowed})},
  'next/cache':{revalidatePath:()=>{}},'next/navigation':{redirect:url=>{throw Object.assign(Error('redirect'),{url});}},'next/server':{after:()=>{afterCount++;}},
  '@/lib/auth':{requireViewer:async()=>({id:id(1),organisationId:id(2),role}),canManage:r=>r==='hr'},
  '@/lib/env':{appUrl:()=> 'https://try-fielded.vercel.app'},'@/lib/email':{},'@/lib/profile-options':{},'@/lib/work-notifications':{},'@/lib/mission-analysis':{},
  '@/lib/supabase/server':{createClient:async()=>({from:()=>{throw Error('Unexpected non-transactional write');},rpc:async(name,args)=>{calls.push({name,args});return {data:failure?null:name==='submit_publication'?{id:id(3),status:publicationStatus}:{mission_id:id(3),created},error:failure?{message:'database failure'}:null};}})},
};
const exported={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/app/app/actions.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,{exports:exported,require:name=>mocks[name]||deps(name)});
function form(){const data=new FormData();for(const [k,v]of Object.entries({requestId:id(3),title:'Safety policy',objective:'Understand the updated reporting route.',context:'Out of hours guidance',desiredOutcome:'Identify practical blockers',departments:'Operations, Engineering'}))data.set(k,v);data.append('participantId',id(4));data.append('participantId',id(4));return data;}
(async()=>{
  role='participant';allowed=false;assert.ok((await exported.createMission({error:null},form())).error);assert.equal(calls.length,0);role='owner';allowed=true;
  const invalid=form();invalid.set('objective','too short');assert.ok((await exported.createMission({error:null},invalid)).error);assert.equal(calls.length,0);
  failure=true;assert.ok((await exported.createMission({error:null},form())).error);assert.equal(afterCount,0);failure=false;calls=[];
  await assert.rejects(exported.createMission({error:null},form()),error=>error.url.startsWith(`/app/missions/${id(3)}?invite=`));
  assert.equal(calls.length,1);assert.equal(calls[0].name,'launch_mission_targeted');assert.deepEqual(Array.from(calls[0].args.individual_ids),[id(4)]);assert.equal(calls[0].args.audience_mode,'individuals');assert.equal(calls[0].args.workspace_id,id(2));assert.match(calls[0].args.invitation_digest,/^[a-f0-9]{64}$/);assert.equal(afterCount,1);
  const grouped=form();grouped.set('audienceMode','departments');grouped.append('audienceDepartment','operations');
  await assert.rejects(exported.createMission({error:null},grouped),e=>Boolean(e.url));
  assert.equal(calls.at(-1).args.audience_mode,'departments');assert.deepEqual(Array.from(calls.at(-1).args.department_keys),['operations']);
  created=false;await assert.rejects(exported.createMission({error:null},form()),error=>error.url===`/app/missions/${id(3)}`);
  role='participant';const before=afterCount;
  await assert.rejects(exported.createMission({error:null},form()),error=>error.url===`/app/publishing/${id(3)}`);
  assert.equal(calls.at(-1).name,'submit_publication');assert.equal(calls.at(-1).args.publication_kind,'mission');assert.equal(afterCount,before,'Pending requests do not dispatch notifications');
  role='hr';publicationStatus='published';await assert.rejects(exported.createMission({error:null},form()),error=>Boolean(error.url));assert.equal(afterCount,before+1);
  console.log('PASS: launch action role/input checks, one transactional write, participant deduplication, digest-only invitation storage, preserved form errors and retry redirect. Database calls mocked.');
})().catch(error=>{console.error(error);process.exitCode=1;});
