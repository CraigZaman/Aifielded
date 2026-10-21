const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),dep=createRequire(path.join(root,'package.json')),ts=dep('typescript'),React=dep('react'),{renderToStaticMarkup}=dep('react-dom/server');
let viewer={id:'owner',name:'Ruzgar Takmak',role:'owner',organisationName:'Example Engineering',organisationId:'org'};
const data={investigation_proposals:[{id:'proposal',root_mission_id:'root',title:'Check the payment-confirmation dependency',rationale:'Delivery reports late slips. Sales reports waiting for bank payment confirmation. Finance has not yet provided its perspective; the root cause remains unverified.',question:'What steps happen between receiving a payment and confirming it to Sales? Please explain timings, exceptions and the evidence available for each step.',departments:['finance'],evidence_ids:['source-one','source-two'],status:'pending',origin:'ai'}],investigation_links:[],organisation_memberships:[{user_id:'one'},{user_id:'two'}],profiles:[{id:'one',full_name:'Priya Shah',department:'finance'},{id:'two',full_name:'Adam Reed',department:'sales'}]};
const mocks={
 'next/link':{default:({children,...props})=>React.createElement('a',props,children)},
 'next/navigation':{usePathname:()=>'/app/investigations',redirect:()=>{throw Error('redirect')},notFound:()=>{throw Error('not found')}},
 'next/image':{default:({priority,...props})=>React.createElement('img',{...props,src:'.'+props.src})},
 '@/lib/auth':{requireViewer:async()=>viewer,canManage:r=>r!=='participant',canManagePeople:()=>true,canManageIntegrations:()=>true},
 '@/lib/workspace-directory':{getWorkspaceDirectory:async()=>({members:data.profiles.map(p=>({id:p.id,name:p.full_name,department:p.department,role:'participant'})),departments:[{id:'finance',key:'finance',name:'Finance',headUserId:'one'},{id:'sales',key:'sales',name:'Sales',headUserId:null}]})},
 '@/app/(auth)/actions':{signOut:'/sign-in'},
 '@/app/app/investigations/actions':{decideInvestigation:async()=>({error:null})},
 '@/components/refresh-workspace':{RefreshWorkspace:()=>React.createElement('button',{},'Refresh')},
 '@/lib/supabase/server':{createClient:async()=>({from:table=>{const q={select:()=>q,eq:()=>q,in:()=>q,order:()=>q,limit:()=>q,then:resolve=>Promise.resolve(resolve({data:data[table],error:null}))};return q;}})},
};
const cache={};
function load(file){if(cache[file])return cache[file];const exports={};cache[file]=exports;vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,{exports,console,URLSearchParams,require:name=>{if(mocks[name])return mocks[name];if(name.startsWith('@/')){const f='src/'+name.slice(2);return load(f+(fs.existsSync(path.join(root,f+'.tsx'))?'.tsx':'.ts'));}return dep(name);}});return exports;}
(async()=>{
 const Shell=load('src/components/app-shell.tsx').AppShell,Page=load('src/app/app/investigations/page.tsx').default;
 const css=['globals.css','role-workspaces.css','policies.css'].map(f=>fs.readFileSync(path.join(root,'src/app',f),'utf8')).join('\n');
 const output='/private/tmp/fielded-role-screens';fs.mkdirSync(output,{recursive:true});
 for(const role of ['owner','hr']){
  viewer={...viewer,role};const html=renderToStaticMarkup(React.createElement(Shell,{viewer},await Page({searchParams:Promise.resolve({})})));
  assert.ok(html.includes('root cause remains unverified'));
  assert.equal(html.includes('Approve and send discussions'),role==='owner');
  assert.equal(html.includes('name="audienceMode"'),role==='owner');
  if(role==='owner'){assert.ok(html.includes('1 recipient'));assert.match(html,/<input(?=[^>]*name="audienceDepartment")(?=[^>]*value="finance")[^>]*>/);assert.ok(html.includes('name="question"'));}
  fs.writeFileSync(path.join(output,`investigation-${role}.html`),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>:root{--font-sans:Arial,sans-serif;--font-mono:monospace}'+css+'</style><body>'+html+'</body></html>');
 }
 viewer={...viewer,role:'participant'};await assert.rejects(Page({searchParams:Promise.resolve({})}),/redirect/);
 console.log('PASS: owner decision controls, suggested department selection, reviewable employee question, HR read-only proposals and employee route guard. Static fixtures, not live browser authorisation.');
})().catch(e=>{console.error(e);process.exitCode=1;});
