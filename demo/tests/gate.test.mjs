import assert from 'node:assert/strict';
import handler from '../api/entry.js';
process.chdir(new URL('..',import.meta.url).pathname);
let allowed=true,calls=0;
global.fetch=async(_url,options)=>{calls++;const {mode,token}=JSON.parse(options.body);return {ok:allowed&&token==='x'.repeat(43),json:async()=>({valid:allowed,session:mode==='exchange'?'s'.repeat(43):undefined})};};
async function request(url,options={}){
 const headers={},req={url,method:'GET',headers:{host:'demo.fielded.ai',...options.headers},body:options.body};req.method=options.method||'GET';
 const res={statusCode:200,setHeader(k,v){headers[k.toLowerCase()]=v;},end(body){this.body=body;},status(n){this.statusCode=n;return this;},json(body){this.body=JSON.stringify(body);}};
 await handler(req,res);return {...res,headers};
}
let r=await request('/');assert.equal(r.statusCode,401);assert.match(r.body,/Demo access code/);assert.doesNotMatch(r.body,/Acme|app\.js/);
for(const file of ['/app.js','/consulting.js','/assets/fielded-icons.js','/api/fielded-ai']){r=await request(file);assert.equal(r.statusCode,403);}
for(const host of ['fielded-company-demo.vercel.app','fielded-company-demo-old.vercel.app','evil.example']){r=await request('/',{headers:{host}});assert.equal(r.statusCode,410);}
r=await request('/brand.png');assert.equal(r.statusCode,200);assert.equal(r.headers['content-type'],'image/png');
r=await request('/access',{method:'POST',headers:{origin:'https://evil.example'},body:{code:'x'.repeat(43)}});assert.equal(r.statusCode,403);
r=await request('/access',{method:'POST',headers:{origin:'https://demo.fielded.ai'},body:{code:'x'.repeat(43)}});assert.equal(r.statusCode,204);assert.match(r.headers['set-cookie'],/Secure; HttpOnly; SameSite=Lax/);
const session={'cookie':'__Host-fielded-demo='+'x'.repeat(43)};
for(const route of ['/','/individual','/sme','/organisation','/third-party','/hr','/participant','/consulting/market-intelligence']){r=await request(route,{headers:session});assert.equal(r.statusCode,200,route);assert.match(r.body.toString(),/app\.js/);assert.equal(r.headers['cache-control'],'private, no-store, max-age=0');}
r=await request('/app.js',{headers:session});assert.equal(r.statusCode,200);assert.equal(r.headers['content-type'],'text/javascript');
r=await request('/private-demo/app.js',{headers:session});assert.equal(r.statusCode,404);
allowed=false;r=await request('/app.js',{headers:session});assert.equal(r.statusCode,403);r=await request('/organisation',{headers:session});assert.equal(r.statusCode,401);
assert.ok(calls>5);
console.log('PASS: old hosts, unauthenticated code/data/API denial, password form, CSRF, secure cookie, all four demo sections, direct-file denial, session revocation and no-cache headers.');
