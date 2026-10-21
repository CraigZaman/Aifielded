const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),{createRequire}=require('node:module');
module.exports=function(root){
  const dep=createRequire(path.join(root,'package.json')),ts=dep('typescript'),exports={};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,'src/lib/audience.ts'),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:dep});
  return exports;
};
