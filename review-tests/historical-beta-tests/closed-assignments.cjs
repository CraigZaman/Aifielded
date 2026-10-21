const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),deps=createRequire(path.join(root,'package.json')),ts=deps('typescript');
let status='completed',missionStatus='active',touched=[];
const id='00000000-0000-4000-8000-000000000001';
const supabase={auth:{getUser:async()=>({data:{user:{id}}})},from:table=>{
  if(table!=='mission_assignments')touched.push(table);
  const q={select:()=>q,eq:()=>q,maybeSingle:async()=>({data:{id,status,missions:{title:'Policy review',status:missionStatus}}})};return q;
}};
const mocks={
  '@/lib/ai-failure':{describeAIFailure:()=>{throw Error('Closed assignment must not reach extraction');}},
  'next/server':{NextResponse:{json:(body,init)=>({body,status:init?.status||200})}},
  '@/lib/supabase/server':{createClient:async()=>supabase},
  '@/lib/ai':{hasAIProvider:()=>{touched.push('provider');return true;},runDialogue:()=>{throw Error('Unexpected AI call');},extractConversation:()=>{throw Error('Unexpected AI call');}},
};
function load(file){const exports={};const code=ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{exports,File,console,require:name=>mocks[name]||deps(name)});return exports.POST;}
const chat=load('src/app/api/ai/chat/route.ts'),complete=load('src/app/api/conversations/[assignmentId]/complete/route.ts'),upload=load('src/app/api/uploads/route.ts');
(async()=>{
  for(const state of [['completed','active'],['declined','active'],['in_progress','paused'],['invited','archived']]){
    [status,missionStatus]=state;touched=[];
    const req={json:async()=>({assignmentId:id,content:'An old open tab',confidentiality:'PRIVATE'})};
    assert.equal((await chat(req)).status,409);
    assert.equal((await complete({}, {params:Promise.resolve({assignmentId:id})})).status,409);
    const form=new FormData();form.set('file',new File(['test upload'],'test.txt',{type:'text/plain'}));form.set('assignmentId',id);
    assert.equal((await upload({formData:async()=>form})).status,409);
    assert.deepEqual(touched,[],'closed work must not write data, upload files or invoke AI');
  }
  assert.equal((await chat({json:async()=>{throw Error('malformed');}})).status,400);
  console.log('PASS: completed/declined assignments and paused/archived missions reject chat, summary and upload requests before writes or AI. This does not prove concurrent database lifecycle locking.');
})().catch(error=>{console.error(error);process.exitCode=1;});
