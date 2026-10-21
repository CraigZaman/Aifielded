import { createHash, randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic="force-dynamic";
const digest=(s:string)=>createHash("sha256").update(s).digest("hex");
const response=(body:object,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer"}});
export async function POST(request:Request) {
  if(Number(request.headers.get("content-length"))>512)return response({valid:false},413);
  const text=await request.text();
  if(text.length>512)return response({valid:false},413);
  let input:{mode?:string;token?:string};
  try{input=JSON.parse(text);}catch{return response({valid:false},400);}
  if(typeof input.token!=="string"||!/^[A-Za-z0-9_-]{43}$/.test(input.token))return response({valid:false},400);
  try{
    const db=createAdminClient();
    if(input.mode==="exchange"){
      const session=randomBytes(32).toString("base64url");
      const result=await db.rpc("open_demo_session",{code_digest:digest(input.token),session_digest:digest(session)});
      return result.error||!result.data ? response({valid:false},403) : response({valid:true,session});
    }
    if(input.mode!=="verify")return response({valid:false},400);
    const found=await db.from("demo_sessions").select("code_id,expires_at").eq("token_digest",digest(input.token)).gt("expires_at",new Date().toISOString()).maybeSingle();
    if(found.error||!found.data)return response({valid:false},403);
    const code=await db.from("commercial_codes").select("id").eq("id",found.data.code_id).eq("kind","demo").is("revoked_at",null).gt("expires_at",new Date().toISOString()).maybeSingle();
    return code.error||!code.data ? response({valid:false},403) : response({valid:true});
  }catch{return response({valid:false},503);}
}
