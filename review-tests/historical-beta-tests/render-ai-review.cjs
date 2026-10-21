const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm'), assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const root=path.resolve(process.argv[2]||'.'), dependencies=createRequire(path.join(root,'package.json'));
const React=dependencies('react'), {renderToStaticMarkup}=dependencies('react-dom/server'), ts=dependencies('typescript');
const exported={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/components/fielded-chat.tsx'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText,{exports:exported,require:name=>name==='next/link'?{default:({children,...props})=>React.createElement('a',props,children)}:name==='next/navigation'?{useRouter:()=>({push:()=>{}})}:dependencies(name)});
const css=fs.readFileSync(path.join(root,'src/app/globals.css'),'utf8')+fs.readFileSync(path.join(root,'src/app/role-workspaces.css'),'utf8');
const props={assignmentId:'fixture',missionTitle:'Health and safety reporting',missionObjective:'Review the revised reporting process and raise practical questions with HR.',participantName:'Priya',initialMessages:[{id:'one',sender:'participant',content:'When a machine is unsafe I need to know who can approve stopping the line.',confidentiality:'SHARE'}]};
const out='/private/tmp/fielded-role-screens';fs.mkdirSync(out,{recursive:true});
for(const review of [false,true]){
  const html=renderToStaticMarkup(React.createElement(exported.FieldedChat,{...props,initialReview:review?{reviewId:'draft',summary:'The employee needs a clear approval route for stopping unsafe machinery.',observations:[{category:'policy',summary:'Clarify who can approve stopping an unsafe line.',sourceConfidentiality:'SHARE'}]}:null}));
  assert.ok(html.includes('Back to dashboard'));
  if(review){assert.ok(html.includes('Approve summary'));assert.ok(html.includes('SHARE'));}else{assert.ok(html.includes('Record voice note'));assert.ok(html.includes('Upload a file'));assert.ok(html.includes('Take a photo'));}
  fs.writeFileSync(path.join(out,review?'ai-review.html':'ai-chat.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Fielded AI ${review?'review':'conversation'}</title><style>:root{--font-sans:Arial,sans-serif;--font-mono:monospace}${css}</style><body>${html}</body></html>`);
}
console.log('PASS: actual chat and saved-review component render, back navigation, multimodal controls and review confidentiality states. Static fixtures, not live model tests.');
