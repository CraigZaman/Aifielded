const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),dep=createRequire(path.join(root,'package.json')),ts=dep('typescript'),React=dep('react'),{renderToStaticMarkup}=dep('react-dom/server');
const output='/private/tmp/fielded-role-screens';
const q=[{question:'Who receives a safety incident report?',options:['Safety lead','Sales team','Nobody'],correctIndex:0,explanation:'The policy names the safety lead.',sourceQuote:'Report safety incidents to the safety lead.'},{question:'When do you report a safety incident?',options:['End of shift','Next year','Never'],correctIndex:0,explanation:'Report before the end of your shift.',sourceQuote:'Report before the end of your shift.'},{question:'Who is the alternate contact?',options:['Deputy safety lead','Sales','Nobody'],correctIndex:0,explanation:'The deputy safety lead is the alternate.',sourceQuote:'Contact the deputy safety lead.'}];
const data={policy_communications:{mission_id:'policy',version:'September 2026',policy_text:q.map(v=>v.sourceQuote).join(' '),briefing:'Review the incident reporting procedure and discuss any points that need clarification.',source_name:'Safety procedure.pdf',questions:q.map(({question,options})=>({question,options})),missions:{title:'Health and safety reporting update',status:'active'}},mission_assignments:[{id:'assignment',user_id:'employee',status:'completed'},{id:'assignment2',user_id:'employee2',status:'invited'}],policy_responses:[{assignment_id:'assignment',user_id:'employee',answers:[0,1,0],score:2,acknowledged:true,has_concerns:true,feedback:'Where can I find the incident form?'}],policy_answer_keys:{questions:q},themes:[{id:'theme',title:'Finding the reporting form',description:'One employee requests the location of the incident form. More responses are needed before calling this recurring.'}],profiles:[{id:'employee',full_name:'Priya Shah'},{id:'employee2',full_name:'Adam Reed'}]};
const viewer={id:'hr',name:'Harriet Wells',role:'hr',organisationName:'Example Engineering',organisationId:'org'};
const mocks={
 'next/link':{default:({children,...props})=>React.createElement('a',props,children)},
 'next/navigation':{useRouter:()=>({push:()=>{},refresh:()=>{}}),usePathname:()=>'/app/communications',redirect:()=>{throw Error('unexpected redirect')},notFound:()=>{throw Error('unexpected notFound')}},
 'next/image':{default:({priority,...props})=>React.createElement('img',{...props,src:'.'+props.src})},
 '@/lib/auth':{requireViewer:async()=>viewer,canManage:()=>true,canManagePeople:()=>true,canManageIntegrations:()=>false},
 '@/app/(auth)/actions':{signOut:'/sign-in'},
 '@/components/refresh-workspace':{RefreshWorkspace:()=>React.createElement('button',{},'Refresh')},
 '@/lib/supabase/server':{createClient:async()=>({from:table=>{const query={select:()=>query,eq:()=>query,in:()=>query,order:()=>query,single:()=>query,maybeSingle:()=>query,then:resolve=>Promise.resolve(resolve({data:data[table],error:null}))};return query;}})},
};
const cache={};
function load(file){if(cache[file])return cache[file];const exports={};cache[file]=exports;vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,{exports,console,URLSearchParams,require:name=>{if(mocks[name])return mocks[name];if(name.startsWith('@/')){const f='src/'+name.slice(2);return load(f+(fs.existsSync(path.join(root,f+'.tsx'))?'.tsx':'.ts'));}return dep(name);}});return exports;}
(async()=>{
 const Shell=load('src/components/app-shell.tsx').AppShell;
 const Launch=load('src/components/policy-launch-form.tsx').PolicyLaunchForm;
 const Check=load('src/components/policy-check.tsx').PolicyCheck;
 const Chat=load('src/components/fielded-chat.tsx').FieldedChat;
 const Report=load('src/app/app/communications/[id]/page.tsx').default;
 const css=['globals.css','role-workspaces.css','policies.css'].map(f=>fs.readFileSync(path.join(root,'src/app',f),'utf8')).join('\n');
 const bodies={
  'policy-launch':React.createElement('div',{className:'page'},React.createElement(Launch,{members:[{id:'employee',name:'Priya Shah',role:'Employee'}],requestId:'test'})),
  'policy-check':React.createElement('div',{className:'page'},React.createElement(Check,{assignmentId:'test',questions:q})),
  'policy-result':React.createElement('div',{className:'page'},React.createElement(Check,{assignmentId:'test',questions:q,initialResult:{score:2,questions:q}})),
  'policy-dialogue':React.createElement(Chat,{assignmentId:'test',missionTitle:'Health and safety reporting update',missionObjective:'Review the updated reporting route.',participantName:'Priya Shah',initialMessages:[],policyMode:true}),
  'policy-report':await Report({params:Promise.resolve({id:'policy'})}),
 };
 fs.mkdirSync(output,{recursive:true});
 for(const [name,body] of Object.entries(bodies)){
  const html=renderToStaticMarkup(React.createElement(Shell,{viewer},body));
  if(name==='policy-check'){assert.ok(html.includes('name="question-2"'));assert.ok(html.includes('private chat is not included'));assert.ok(!html.includes('Correct answer:'));}
  if(name==='policy-result')assert.ok(html.includes('2 / 3 correct'));
  if(name==='policy-report'){assert.ok(html.includes('50%'));assert.ok(html.includes('0%'));assert.ok(html.includes('100%'));assert.ok(html.includes('assigneeId=employee'));}
  if(name==='policy-dialogue'){assert.ok(html.includes('Check understanding'));assert.ok(!html.includes('>Finish and review</button>'));assert.ok(html.includes('Record voice note'));assert.ok(!html.includes('>CONTRIBUTE</button>'));}
  fs.writeFileSync(path.join(output,name+'.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>:root{--font-sans:Inter,Arial,sans-serif;--font-mono:monospace}'+css+'</style><body>'+html+'</body></html>');
 }
 const {policyLaunchSchema}=load('src/lib/policy-schema.ts');
 const payload={requestId:'00000000-0000-4000-8000-000000000001',title:'Policy update',version:'v1',policyText:data.policy_communications.policy_text,sourceName:'test.txt',briefing:data.policy_communications.briefing,questions:q,recipients:['00000000-0000-4000-8000-000000000002'],reviewed:true};
 assert.equal(policyLaunchSchema.safeParse(payload).success,true);
 assert.equal(policyLaunchSchema.safeParse({...payload,reviewed:false}).success,false);
 assert.equal(policyLaunchSchema.safeParse({...payload,questions:q.map(v=>({...v,sourceQuote:'Invented reporting route'}))}).success,false);
 console.log('PASS: policy launch/check/result/dialogue/report rendering, correct denominators, hidden answers, source quote validation, required review and multimodal controls. Static fixtures, not live AI tests.');
})().catch(e=>{console.error(e);process.exitCode=1;});
