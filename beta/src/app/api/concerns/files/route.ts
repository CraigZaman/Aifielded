import crypto from "node:crypto";
import {NextResponse} from "next/server";
import {z} from "zod";
import {getViewer} from "@/lib/auth";
import {createClient} from "@/lib/supabase/server";
export async function POST(request:Request) {
 const viewer=await getViewer();if(!viewer)return NextResponse.json({error:"Sign in required."},{status:401});
 if(Number(request.headers.get("content-length")||0)>3400000)return NextResponse.json({error:"Use a file under 3 MB."},{status:413});
 const form=await request.formData().catch(()=>null),file=form?.get("file"),caseId=z.string().uuid().safeParse(form?.get("caseId"));
 if(!caseId.success||!(file instanceof File)||!file.size||file.size>3145728||!["application/pdf","text/plain","image/png","image/jpeg"].includes(file.type))return NextResponse.json({error:"Choose a PDF, text file or PNG/JPEG image under 3 MB."},{status:400});
 const db=await createClient(),record=await db.from("confidential_concerns").select("id,status").eq("id",caseId.data).eq("organisation_id",viewer.organisationId).eq("author_id",viewer.id).maybeSingle();
 if(record.error||!record.data||record.data.status==="closed")return NextResponse.json({error:"This case is unavailable for uploads."},{status:403});
 const count=await db.from("concern_files").select("id",{count:"exact",head:true}).eq("concern_id",caseId.data);
 if(count.error||(count.count||0)>=10)return NextResponse.json({error:"A case can hold up to ten attachments."},{status:409});
 const id=crypto.randomUUID(),path=`${viewer.organisationId}/${caseId.data}/${id}`;
 const upload=await db.storage.from("confidential-case-files").upload(path,file,{contentType:file.type,upsert:false});
 if(upload.error)return NextResponse.json({error:"The attachment could not be uploaded."},{status:503});
 const metadata=await db.from("concern_files").insert({id,concern_id:caseId.data,filename:file.name.slice(0,200)||"Attachment",media_type:file.type,bytes:file.size,storage_path:path});
 if(metadata.error){await db.storage.from("confidential-case-files").remove([path]);return NextResponse.json({error:"The attachment record could not be saved. Try again."},{status:503});}
 return NextResponse.json({ok:true});
}
