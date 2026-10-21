import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return response;

  const bearer = request.headers.get("authorization")?.match(/^Bearer ([A-Za-z0-9._-]+)$/i)?.[1];
  const supabase = bearer ? createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${bearer}` } },
  }) : createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (items) => {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Verify native bearer sessions here too, so email and workspace-plan gates
  // are enforced before the request reaches an API route.
  const nativeAuth = bearer ? await supabase.auth.getUser() : null;
  if (bearer && !nativeAuth?.data.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const cookieClaims = bearer ? null : (await supabase.auth.getClaims()).data?.claims;
  const userId = nativeAuth?.data.user?.id || cookieClaims?.sub;
  const isProtected =
    request.nextUrl.pathname.startsWith("/app") ||
    request.nextUrl.pathname.startsWith("/onboarding") ||
    request.nextUrl.pathname.startsWith("/billing") ||
    (request.nextUrl.pathname.startsWith("/ops") && !request.nextUrl.pathname.startsWith("/ops/bootstrap"));

  if (isProtected && !userId) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(signIn);
  }

  const path=request.nextUrl.pathname;
  if (userId && (isProtected || path.startsWith("/join/") || path.startsWith("/api/"))) {
    const verified = nativeAuth?.data || (await supabase.auth.getUser()).data;
    if (!verified.user?.email_confirmed_at) {
      const denied = path.startsWith("/api/")
        ? NextResponse.json({ error: "Confirm your email before continuing." }, { status: 403 })
        : NextResponse.redirect(new URL("/check-email", request.url));
      response.cookies.getAll().forEach(item => denied.cookies.set(item));
      return denied;
    }
  }
  const accessFailure=(message:string,status:number,code?:string)=>{
    const denied=NextResponse.json({error:message,...(code?{code}:{})},{status});
    response.cookies.getAll().forEach(item=>denied.cookies.set(item));
    return denied;
  };
  const workspaceWrite=request.method!=="GET"&&request.method!=="HEAD"&&(
    path==="/app"||path.startsWith("/app/")||path.startsWith("/api/")&&!path.startsWith("/api/demo-access")&&!path.startsWith("/api/cron/")
  );
  const safetyOrAccount=path==="/app/concerns"||path.startsWith("/app/concerns/")||path.startsWith("/api/concerns/")||path==="/app/profile"||path==="/app/settings";
  if(workspaceWrite&&!safetyOrAccount&&userId){
    const membership=await supabase.from("organisation_memberships").select("organisation_id").eq("user_id",userId).eq("status","active").maybeSingle();
    if(membership.error)return accessFailure("Workspace access could not be checked.",503);
    if(membership.data){
      const access=await supabase.rpc("workspace_commercial_status",{workspace:membership.data.organisation_id});
      if(access.error||!access.data)return accessFailure("Workspace access could not be checked.",503);
      if(!access.data.active)return accessFailure("Your workspace trial has ended. Your owner can activate tester access from Workspace plan.",402,"WORKSPACE_EXPIRED");
    }
  }

  return response;
}
