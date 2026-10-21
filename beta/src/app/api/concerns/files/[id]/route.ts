import {NextResponse} from "next/server";
import {z} from "zod";
import {getViewer} from "@/lib/auth";
import {createClient} from "@/lib/supabase/server";
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}) {
 if(!await getViewer())return NextResponse.json({error:"Sign in required."},{status:401});
 const parsed=z.string().uuid().safeParse((await params).id);if(!parsed.success)return new NextResponse(null,{status:404});
 const db=await createClient(),file=await db.from("concern_files").select("storage_path,filename").eq("id",parsed.data).maybeSingle();
 if(file.error||!file.data)return new NextResponse(null,{status:404});
 const link=await db.storage.from("confidential-case-files").createSignedUrl(file.data.storage_path,60,{download:file.data.filename});
 if(link.error)return NextResponse.json({error:"Attachment unavailable."},{status:503});
 return NextResponse.redirect(link.data.signedUrl,{headers:{"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer"}});
}
