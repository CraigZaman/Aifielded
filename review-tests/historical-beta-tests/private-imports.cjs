const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),deps=createRequire(path.join(root,'package.json')),ts=deps('typescript');
let saveError=false,providerError=false,selected=['channel'],records,syncStarted=0;
const supabase={from:table=>{
  const q={select:()=>q,eq:()=>q,maybeSingle:async()=>({data:{id:'connection',provider:'slack',access_token_encrypted:'encrypted-test',metadata:{selected_channels:selected}}}),
    insert:()=>{syncStarted++;return q;},single:async()=>({data:{id:'run'}}),update:()=>q,
    upsert:async value=>{records=value;return {error:saveError?{message:'rejected'}:null};},then:resolve=>resolve({error:null})};return q;
}};
const mocks={'next/server':{NextResponse:{json:(body,init={})=>({body,status:init.status||200})}},'@/lib/crypto':{decryptSecret:()=> 'test-token'},'@/lib/integrations':{integrationViewer:async()=>({supabase,user:{id:'uploader'},membership:{organisation_id:'company'}})}};
const exported={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/app/api/integrations/sync/route.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports:exported,fetch:async()=>({ok:!providerError,json:async()=>({ok:!providerError,messages:[{ts:'1788600000.1',text:'Imported employee message',user:'external-author'}]})}),require:name=>mocks[name]||deps(name)});
(async()=>{
  const req={json:async()=>({provider:'slack'})};
  assert.equal((await exported.POST({json:async()=>{throw Error('bad json');}})).status,400);
  selected=[];assert.equal((await exported.POST(req)).status,400);assert.equal(syncStarted,0);selected=['channel'];
  providerError=true;assert.equal((await exported.POST(req)).status,502);providerError=false;
  saveError=true;assert.equal((await exported.POST(req)).status,502);saveError=false;
  const result=await exported.POST(req);assert.equal(result.status,200);assert.equal(records[0].user_id,'uploader');assert.equal(records[0].confidentiality,'PRIVATE');assert.ok(result.body.message.includes('not automatically'));
  console.log('PASS: imported content stays uploader-private; provider and storage failures cannot report success; missing source selection does not leave a running sync. Provider calls mocked.');
})().catch(error=>{console.error(error);process.exitCode=1;});
