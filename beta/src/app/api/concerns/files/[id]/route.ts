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
 // When the server reaches Supabase on a private address, send the browser to its public one.
 const internal=process.env.NEXT_PUBLIC_SUPABASE_URL,external=process.env.SUPABASE_PUBLIC_URL;
 const target=internal&&external&&link.data.signedUrl.startsWith(internal)?external+link.data.signedUrl.slice(internal.length):link.data.signedUrl;
 return NextResponse.redirect(target,{headers:{"Cache-Control":"private, no-store","Referrer-Policy":"no-referrer"}});
}
