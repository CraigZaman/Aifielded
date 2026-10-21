const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),dep=createRequire(path.join(root,'package.json')),ts=dep('typescript'),React=dep('react'),{renderToStaticMarkup}=dep('react-dom/server');
const members=[{id:'owner',name:'Ruzgar Takmak',role:'owner',department:''},{id:'hr',name:'Harriet Wells',role:'hr',department:'people'},{id:'employee',name:'Priya Shah',role:'participant',department:'engineering'}];
const rules=[{user_id:'employee',kind:'mission',allowed:true,audience_scope:'department',approval:'head_then_owner',visibility:'department',revision:1},{user_id:'hr',kind:'policy',allowed:true,audience_scope:'organisation',approval:'owner',visibility:'owners',revision:2}];
const mocks={
 'next/link':{default:({children,...props})=>React.createElement('a',props,children)},
 'next/navigation':{usePathname:()=>'/app/publishing'},
 'next/image':{default:({priority,...props})=>React.createElement('img',{...props,src:'.'+props.src})},
 '@/lib/auth':{canManage:r=>r==='owner',canManagePeople:r=>r==='owner',canManageIntegrations:()=>false},
 '@/app/(auth)/actions':{signOut:'/sign-in'},
 '@/components/refresh-workspace':{RefreshWorkspace:()=>null},
 '@/app/app/publishing/actions':{reviewPublication:async()=>({error:null}),saveMissionVisibility:async()=>({error:null}),savePublishingPermission:async()=>({error:null})},
};
const cache={};function load(file){if(cache[file])return cache[file];const exports={};cache[file]=exports;vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:name=>{if(mocks[name])return mocks[name];if(name.startsWith('@/')){const f='src/'+name.slice(2);return load(f+(fs.existsSync(path.join(root,f+'.tsx'))?'.tsx':'.ts'));}return dep(name);}});return exports;}
const {PublishingPermissions,PublicationDecision,MissionVisibilityControl}=load('src/components/publishing-controls.tsx'),{AppShell}=load('src/components/app-shell.tsx');
const e=React.createElement;
const content=e('div',{className:'page'},e('header',{className:'page-header'},e('div',{className:'page-title'},e('h1',{},'Publishing and approvals'),e('p',{},'2 requests awaiting review.'))),e(PublishingPermissions,{members,rules}),e(PublicationDecision,{id:'request',step:'pending_owner',canApprove:true}),e(MissionVisibilityControl,{mission:'mission',departments:[{id:'department',key:'engineering',name:'Engineering',headUserId:'head'}]}));
const html=renderToStaticMarkup(e(AppShell,{viewer:{id:'owner',name:'Ruzgar Takmak',role:'owner',organisationName:'Example Engineering'}},content));
for(const label of ['Publishing permission matrix','Department head, then owner','Save permissions','Approve and assign','Save visibility'])assert.ok(html.includes(label));
const noApprove=renderToStaticMarkup(e(PublicationDecision,{id:'request',step:'pending_head',canApprove:false}));assert.ok(!noApprove.includes('value="approve"'));assert.ok(noApprove.includes('value="reject"'));
const css=['globals.css','role-workspaces.css','policies.css'].map(f=>fs.readFileSync(path.join(root,'src/app',f),'utf8')).join('\n');
fs.mkdirSync('/private/tmp/fielded-role-screens',{recursive:true});
fs.writeFileSync('/private/tmp/fielded-role-screens/publishing-owner.html','<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>:root{--font-sans:Arial,sans-serif;--font-mono:monospace}'+css+'</style><body>'+html+'</body></html>');
console.log('PASS: real permission matrix, independent-review controls, mission visibility form and labelled settings rendered. Static fixture.');
