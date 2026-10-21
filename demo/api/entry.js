import { readFile } from 'node:fs/promises';
import path from 'node:path';
import demoAI from '../private-demo/api/fielded-ai.js';

const cookieName='__Host-fielded-demo';
const assets=new Map([
  ['/app.js','text/javascript'],['/consulting.js','text/javascript'],['/dialogue.js','text/javascript'],['/enterprise.js','text/javascript'],['/experiences.js','text/javascript'],['/hr.js','text/javascript'],
  ['/styles.css','text/css'],['/dialogue.css','text/css'],['/enterprise.css','text/css'],['/experiences.css','text/css'],
  ['/assets/fielded-icons.js','text/javascript'],['/assets/fielded-logo.png','image/png'],['/assets/lucide-LICENSE','text/plain'],
]);
const base=path.join(process.cwd(),'private-demo');
const cookie=(value,age=28800)=>`${cookieName}=${value}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=${age}`;

async function access(mode,token){
  const result=await fetch('https://app.fielded.ai/api/demo-access',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({mode,token}),signal:AbortSignal.timeout(10000),redirect:'error'});
  if(!result.ok)return {valid:false};
  return result.json();
}

const gate=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Private demo | Fielded.ai</title><style>*{box-sizing:border-box}body{margin:0;background:#f3f6f1;color:#21352b;font-family:Arial,sans-serif}main{max-width:490px;padding:64px 24px;margin:auto}img{width:166px;margin-bottom:64px}h1{font-size:34px;font-weight:500;line-height:1.15}p{font-size:15px;line-height:1.7;color:#5b6c60}label{font-size:13px;display:block;margin-top:30px}input{display:block;width:100%;padding:14px;border:1px solid #aebfb1;border-radius:4px;font:inherit;margin:10px 0 18px}button{background:#195c47;color:white;width:100%;padding:15px;border:0;border-radius:4px;font-size:15px;cursor:pointer}button:disabled{opacity:.6}a{color:#195c47}footer{margin-top:40px;font-size:13px}#status{min-height:48px;font-size:13px}input:focus-visible,button:focus-visible,a:focus-visible{outline:3px solid #82ac5b;outline-offset:3px}</style></head><body><main><a href="https://fielded.ai"><img src="/brand.png" alt="Fielded.ai"></a><h1>A closer look at Fielded.</h1><p>This demonstration is shared by invitation. Enter your demo access code to continue.</p><form id="access-form"><label for="code">Demo access code</label><input id="code" name="code" type="password" autocomplete="off" minlength="43" maxlength="43" required><button id="submit">Open the demo</button><p id="status" role="status"></p></form><footer><a href="mailto:tech@fielded.ai?subject=Private%20demo%20access">Request access</a> · <a href="https://fielded.ai">Back to Fielded</a></footer></main><script>const f=document.getElementById('access-form'),i=document.getElementById('code'),s=document.getElementById('status'),b=document.getElementById('submit');const token=location.hash.slice(1);if(/^[A-Za-z0-9_-]{43}$/.test(token))i.value=token;if(location.hash)history.replaceState(null,'',location.pathname);f.addEventListener('submit',async e=>{e.preventDefault();b.disabled=true;s.textContent='Checking access…';try{const r=await fetch('/access',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({code:i.value.trim()})});if(r.ok){i.value='';location.replace('/');return;}s.textContent=r.status===503?'Access is temporarily unavailable. Please try again shortly.':'This code is invalid, expired or fully used. Please request a new invitation.';}catch{s.textContent='Could not connect. Please try again.';}b.disabled=false;});</script></body></html>`;

export default async function handler(req,res){
  res.setHeader('Cache-Control','private, no-store, max-age=0');
  res.setHeader('CDN-Cache-Control','no-store');
  res.setHeader('Vercel-CDN-Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('X-Frame-Options','DENY');
  res.setHeader('Referrer-Policy','no-referrer');
  res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
  const host=String(req.headers.host||'').toLowerCase();
  if(host!=='demo.fielded.ai'){res.statusCode=410;res.end('This demo address is no longer available.');return;}
  let pathname;
  try{pathname=new URL(req.url,'https://demo.fielded.ai').pathname;}catch{res.statusCode=400;res.end();return;}
  if(pathname==='/brand.png'&&req.method==='GET'){res.setHeader('Content-Type','image/png');res.end(await readFile(path.join(base,'assets/fielded-logo.png')));return;}
  if(pathname==='/logout'&&req.method==='POST'){res.setHeader('Set-Cookie',cookie('',0));res.statusCode=303;res.setHeader('Location','/access');res.end();return;}
  if(pathname==='/access'&&req.method==='POST'){
    if(req.headers.origin!=='https://demo.fielded.ai'){res.statusCode=403;res.end();return;}
    let body=req.body;
    try{
      if(!body){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>512){res.statusCode=413;res.end();return;}}body=JSON.parse(raw);}
      if(typeof body==='string')body=JSON.parse(body);
      if(!body||typeof body.code!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(body.code)){res.statusCode=403;res.end();return;}
      const result=await access('exchange',body.code);
      if(!result.valid||!/^[A-Za-z0-9_-]{43}$/.test(result.session||'')){res.statusCode=403;res.end();return;}
      res.setHeader('Set-Cookie',cookie(result.session));res.statusCode=204;res.end();return;
    }catch{res.statusCode=503;res.end();return;}
  }
  const token=String(req.headers.cookie||'').split(';').map(c=>c.trim()).find(c=>c.startsWith(cookieName+'='))?.slice(cookieName.length+1);
  let valid=false;
  if(token&&/^[A-Za-z0-9_-]{43}$/.test(token)){
    try{valid=(await access('verify',token)).valid===true;}catch{res.statusCode=503;res.end('Demo access is temporarily unavailable. Please retry.');return;}
  }
  if(!valid||pathname==='/access'){
    if(assets.has(pathname)||pathname.startsWith('/api/')){res.statusCode=403;res.end('Demo access required.');return;}
    res.statusCode=pathname==='/access'?200:401;res.setHeader('Content-Type','text/html; charset=utf-8');res.end(gate);return;
  }
  if(pathname==='/api/fielded-ai'){await demoAI(req,res);return;}
  if(req.method!=='GET'&&req.method!=='HEAD'){res.statusCode=405;res.end();return;}
  const file=assets.has(pathname)?pathname.slice(1):'index.html';
  if(!assets.has(pathname)&&!/^\/(?:$|demos$|individual$|sme$|organisation(?:\/.*)?$|third-party(?:\/.*)?$|participant(?:\/.*)?$|m\/[^/]+$|admin$|consulting(?:\/.*)?$|hr(?:\/.*)?$)/.test(pathname)){res.statusCode=404;res.end('Not found');return;}
  const content=await readFile(path.join(base,file));
  res.setHeader('Content-Type',assets.get(pathname)||'text/html; charset=utf-8');
  res.end(req.method==='HEAD'?undefined:content);
}
