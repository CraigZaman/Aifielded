const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),dep=createRequire(path.join(root,'package.json')),ts=dep('typescript'),React=dep('react'),{renderToStaticMarkup}=dep('react-dom/server');
const departments=[{id:'d1',key:'sales',name:'Sales',headUserId:'head'},{id:'d2',key:'finance',name:'Finance',headUserId:null},{id:'d3',key:'delivery',name:'Delivery and fulfilment',headUserId:null}];
const members=[{id:'owner',name:'Ruzgar Takmak',role:'owner',department:'',reportsTo:null,confirmed:true,businessRole:'executive_founder'},{id:'head',name:'Harriet Wells',role:'manager',department:'sales',reportsTo:'owner',confirmed:true,businessRole:'department_lead'},{id:'employee',name:'Priya Shah',role:'participant',department:'sales',reportsTo:'head',confirmed:true,businessRole:'individual_contributor'},{id:'finance',name:'Adam Reed',role:'participant',department:'finance',reportsTo:null,confirmed:false,businessRole:'individual_contributor'},{id:'new',name:'Alex Montgomery-Wellington',role:'participant',department:'',reportsTo:null,confirmed:false,businessRole:'individual_contributor'}];
const mocks={
 'next/link':{default:({children,...props})=>React.createElement('a',props,children)},
 'next/navigation':{usePathname:()=>'/app/people'},
 'next/image':{default:({priority,...props})=>React.createElement('img',{...props,src:'.'+props.src})},
 '@/lib/workspace-directory':{getWorkspaceDirectory:async()=>({members,departments})},
 '@/lib/auth':{canManage:()=>true,canManagePeople:()=>true,canManageIntegrations:()=>true},
 '@/app/(auth)/actions':{signOut:'/sign-in'},
 '@/app/app/people/structure-actions':{saveDepartment:async()=>({error:null}),placeMember:async()=>({error:null})},
 '@/components/refresh-workspace':{RefreshWorkspace:()=>React.createElement('button',{},'Refresh')},
};
const cache={};function load(file){if(cache[file])return cache[file];const exports={};cache[file]=exports;vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:name=>{if(mocks[name])return mocks[name];if(name.startsWith('@/')){const f='src/'+name.slice(2);return load(f+(fs.existsSync(path.join(root,f+'.tsx'))?'.tsx':'.ts'));}return dep(name);}});return exports;}
(async()=>{
 const Structure=load('src/components/organisation-structure.tsx').OrganisationStructure,Shell=load('src/components/app-shell.tsx').AppShell;
 const css=['globals.css','role-workspaces.css','policies.css'].map(f=>fs.readFileSync(path.join(root,'src/app',f),'utf8')).join('\n');
 fs.mkdirSync('/private/tmp/fielded-role-screens',{recursive:true});
 for(const role of ['owner','hr']){
   const body=await Structure({organisationId:'org',organisationName:'Example Engineering',canEdit:role==='owner'});
   const html=renderToStaticMarkup(React.createElement(Shell,{viewer:{id:'owner',name:'Ruzgar Takmak',role,organisationName:'Example Engineering'}},React.createElement('div',{className:'page'},body)));
   assert.ok(html.includes('Harriet Wells'));assert.ok(html.includes('From work profile'));assert.ok(html.includes('Head not appointed'));assert.ok(html.includes('Alex Montgomery-Wellington'));
   assert.equal(html.includes('Confirm placement'),role==='owner');assert.equal(html.includes('Save department'),role==='owner');
   fs.writeFileSync(`/private/tmp/fielded-role-screens/structure-${role}.html`,'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>:root{--font-sans:Arial,sans-serif;--font-mono:monospace}'+css+'</style><body>'+html+'</body></html>');
 }
 console.log('PASS: owner/HR organisation structure rendering, department heads, explicit reporting lines, unassigned members, imported-data labels and owner-only editors. Static fixtures.');
})().catch(e=>{console.error(e);process.exitCode=1;});
