const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'),deps=createRequire(path.join(root,'package.json')),ts=deps('typescript');
const React=deps('react');let states=[],cursor=0,pending=false,error=null;
const mockedReact={...React,useActionState:()=>[{error},'/test/launch',pending],useState:initial=>{const index=cursor++;if(!(index in states))states[index]=initial;return [states[index],value=>{states[index]=typeof value==='function'?value(states[index]):value;}];}};
const audience=require('./support/load-audience.cjs')(root);
const cache={};
function load(file){if(cache[file])return cache[file];const exports={};cache[file]=exports;vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:name=>name==='react'?mockedReact:name==='@/app/app/actions'?{createMission:()=>{}}:name==='@/lib/audience'?audience:name==='@/components/audience-picker'?load('src/components/audience-picker.tsx'):deps(name)});return exports;}
const exported=load('src/components/mission-launch-form.tsx');
function expand(node){if(Array.isArray(node))return node.map(expand);if(!React.isValidElement(node))return node;if(node.type===cache['src/components/audience-picker.tsx'].AudiencePicker)return expand(node.type(node.props));const children=expand(node.props.children);return node.props.children ? React.cloneElement(node,{},...(Array.isArray(children)?children:[children])) : node;}
let members=[{id:'priya',name:'Priya Shah',department:'Engineering',role:'participant'},{id:'harriet',name:'Harriet Wells',department:'People',role:'hr'}];
const departments=[{id:'engineering',key:'Engineering',name:'Engineering',headUserId:'priya'},{id:'people',key:'People',name:'People',headUserId:null}];
const render=()=>{cursor=0;return expand(exported.MissionLaunchForm({requestId:'stable-request',members,departments}));};
function all(node,predicate){if(Array.isArray(node))return node.flatMap(child=>all(child,predicate));if(!node||typeof node!=='object')return [];return [...(predicate(node)?[node]:[]),...all(node.props?.children,predicate)];}
const find=(tree,predicate)=>all(tree,predicate)[0];
cursor=0;
let tree=exported.MissionLaunchForm({requestId:'investigate-request',members,initialBrief:{title:'Investigate the reporting route',objective:'Check whether every shift has a clear escalation owner.'}});
assert.equal(find(tree,n=>n.props?.name==='title').props.value,'Investigate the reporting route');
assert.equal(find(tree,n=>n.props?.name==='objective').props.value,'Check whether every shift has a clear escalation owner.');
states=[];
tree=render();
assert.equal(find(tree,n=>n.props?.name==='requestId').props.value,'stable-request');
find(tree,n=>n.props?.name==='title').props.onChange({target:{value:'Safety policy'}});
find(tree,n=>n.type==='input'&&n.props.type==='checkbox').props.onChange();
tree=render();assert.equal(all(tree,n=>n.props?.name==='participantId').length,2);
find(tree,n=>n.type==='input'&&n.props.type==='search').props.onChange({target:{value:'Engineering'}});
tree=render();assert.equal(all(tree,n=>n.type==='input'&&n.props.type==='checkbox').length,2);assert.equal(all(tree,n=>n.props?.name==='participantId').length,2,'Filtering retains selected hidden employees');
find(tree,n=>n.type==='input'&&n.props.type==='checkbox').props.onChange();
tree=render();assert.equal(find(tree,n=>n.props?.name==='participantId').props.value,'harriet');
error='Mission could not be launched';pending=true;tree=render();
assert.equal(find(tree,n=>n.props?.name==='title').props.value,'Safety policy','Brief survives a server error');
assert.equal(find(tree,n=>n.type==='fieldset').props.disabled,true);assert.equal(find(tree,n=>n.type==='button'&&n.props.type==='submit').props.disabled,true);
pending=false;error=null;states=[];members=Array.from({length:201},(_,i)=>({id:String(i),name:`Employee ${i}`,department:'Engineering',role:'participant'}));tree=render();
assert.equal(find(tree,n=>n.type==='input'&&n.props.type==='checkbox').props.disabled,true,'Bulk selection cannot exceed 200');
console.log('PASS: participant selection/filtering, retained hidden selections and form values, pending state and bulk-selection limit. React handlers exercised with a hook-state harness.');

states=[{title:'Health and safety reporting',objective:'Understand whether the updated incident reporting route is clear for employees.',context:'The new policy includes a safety lead and out-of-hours reporting.',desiredOutcome:'Identify unanswered questions and assign practical follow-ups.',departments:'Engineering, Operations'},{mode:'individuals',departmentKeys:[],individualIds:['priya']},''];
members=[{id:'priya',name:'Priya Shah',department:'Engineering',role:'Employee'},{id:'harriet',name:'Harriet Wells',department:'People',role:'HR'},{id:'alex',name:'Alex Montgomery-Wellington',department:'Operations',role:'Manager'}];
const css=['globals.css','role-workspaces.css'].map(f=>fs.readFileSync(path.join(root,'src/app',f),'utf8')).join('\n');
const markup=deps('react-dom/server').renderToStaticMarkup(render());
fs.mkdirSync('/private/tmp/fielded-role-screens',{recursive:true});
fs.writeFileSync('/private/tmp/fielded-role-screens/mission-launch.html',`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fielded mission launch</title><style>:root{--font-sans:Arial,sans-serif;--font-mono:monospace}${css}</style><body><main class="page"><header class="page-header"><div class="page-title"><h1>Create a mission</h1></div></header><div class="two-column-form">${markup}<aside class="panel mission-brief"><h3>Strong mission questions</h3><div class="example-prompts"><div>Where are we losing time between sales and delivery?</div></div></aside></div></main></body></html>`);
