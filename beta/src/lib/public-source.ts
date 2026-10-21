import "server-only";
import { lookup } from "node:dns/promises";
import { request } from "node:https";
import ipaddr from "ipaddr.js";
import { load } from "cheerio";

export function validateSourceUrl(raw:string) {
 const url=new URL(raw);
 if(url.protocol!=="https:"||url.username||url.password||url.port||url.hash||url.hostname.length>253)throw new Error("Use a public HTTPS page without credentials, fragments or a custom port.");
 return url;
}
export function isPublicSourceAddress(address:string) {
 return ipaddr.isValid(address)&&ipaddr.parse(address).kind()==="ipv4"&&ipaddr.parse(address).range()==="unicast";
}
export function referenceOnlySource(url:URL) {
 return ["linkedin.com","facebook.com","instagram.com","x.com","twitter.com","tiktok.com"].some(host=>url.hostname===host||url.hostname.endsWith(`.${host}`));
}

export async function readPublicSource(raw:string) {
 let target=validateSourceUrl(raw);
 for(let hop=0;hop<3;hop++) {
  if(referenceOnlySource(target))throw new Error("This social source is reference-only.");
  let dnsTimer:ReturnType<typeof setTimeout>|undefined;
  const addresses=await Promise.race([lookup(target.hostname,{all:true,family:4}),new Promise<never>((_,reject)=>{dnsTimer=setTimeout(()=>reject(new Error("Source DNS lookup timed out.")),5000);})]).finally(()=>clearTimeout(dnsTimer));
  if(!addresses.length||addresses.some(a=>!isPublicSourceAddress(a.address)))throw new Error("The source does not resolve exclusively to public addresses.");
  // Pin the validated address; redirects are revalidated, and no cookies or credentials are forwarded.
  const result=await new Promise<{status:number;location?:string;type:string;body:string}>((resolve,reject)=>{
   const req=request({hostname:addresses[0].address,servername:target.hostname,port:443,path:target.pathname+target.search,method:"GET",agent:false,headers:{Host:target.hostname,Accept:"text/html, text/plain", "User-Agent":"Fielded-CompanyContext/1.0"}},res=>{
    const chunks:Buffer[]=[];let size=0;
    res.on("data",chunk=>{size+=chunk.length;if(size>300000){res.destroy(new Error("Source exceeds 300 KB."));return;}chunks.push(chunk);});
    res.on("error",reject);res.on("end",()=>resolve({status:res.statusCode||0,location:res.headers.location,type:String(res.headers["content-type"]||"").split(";")[0],body:Buffer.concat(chunks).toString("utf8")}));
   });
   const timeout=setTimeout(()=>req.destroy(new Error("Source timed out.")),8000);
   req.on("error",reject);req.on("close",()=>clearTimeout(timeout));req.end();
  });
  if([301,302,303,307,308].includes(result.status)&&result.location){target=validateSourceUrl(new URL(result.location,target).href);continue;}
  if(result.status!==200||!["text/html","text/plain"].includes(result.type))throw new Error("Only accessible public HTML and text pages can be refreshed.");
  let content=result.body;
  if(result.type==="text/html"){const $=load(content);$("script,style,noscript,iframe,nav,footer,form").remove();content=$("main").text()||$("body").text();}
  content=content.replace(/\s+/g," ").trim();
  if(content.length<40)throw new Error("No usable public page content was found.");
  return {content:content.slice(0,20000),url:target.href};
 }
 throw new Error("Too many redirects.");
}
