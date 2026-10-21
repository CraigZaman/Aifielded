import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { getCompanyAccess } from "@/lib/company";
import { extractAttachment } from "@/lib/ai";
export const maxDuration=60;

export async function POST(request:Request) {
 const viewer=await getViewer();
 if(!viewer)return NextResponse.json({error:"Sign in required."},{status:401});
 if(Number(request.headers.get("content-length")||0)>3400000)return NextResponse.json({error:"Choose a file under 3 MB."},{status:413});
 const form=await request.formData().catch(()=>null),file=form?.get("file");
 if(form?.get("purpose")==="company"&&(await getCompanyAccess(viewer.organisationId)).profile<2)return NextResponse.json({error:"Company library editing is not enabled."},{status:403});
 if(form?.get("purpose")==="structure"&&(await getCompanyAccess(viewer.organisationId)).structure<2)return NextResponse.json({error:"Structure editing is not enabled."},{status:403});
 if(!(file instanceof File)||!file.size||file.size>3*1024*1024)return NextResponse.json({error:"Choose a non-empty file under 3 MB."},{status:400});
 const type=file.type.split(";")[0];
 if(!["application/pdf","text/plain","text/csv","image/png","image/jpeg","image/webp","audio/webm","audio/mp4","audio/mpeg","audio/wav","audio/ogg"].includes(type))return NextResponse.json({error:"Use a PDF, text, CSV, photo or audio file. Export presentations as PDF."},{status:415});
 try {
  const bytes=await file.arrayBuffer();
  const content=type.startsWith("text/")?new TextDecoder("utf-8",{fatal:true}).decode(bytes):await extractAttachment({bytes:new Uint8Array(bytes),mediaType:type,filename:file.name.slice(0,300)});
  if(!content.trim()||content.length>50000)throw new Error("Invalid extracted length");
  return NextResponse.json({content,sourceName:file.name.slice(0,300)});
 } catch{return NextResponse.json({error:"The file could not be read. Try a clearer or shorter file. Nothing was saved."},{status:503});}
}
