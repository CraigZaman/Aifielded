import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import { requireEnv } from "@/lib/env";

export async function createClient() {
  const authorization = (await headers()).get("authorization");
  const bearer = authorization?.match(/^Bearer ([A-Za-z0-9._-]+)$/i)?.[1];
  if (bearer) {
    // Native clients carry a Supabase user JWT instead of browser cookies.
    // Supabase Auth verifies it for getUser(); PostgREST still enforces RLS.
    return createSupabaseClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
      {
        auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
        global: { headers: { Authorization: `Bearer ${bearer}` } },
      },
    );
  }
  const cookieStore = await cookies();

  return createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (items) => {
          try {
            items.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot set cookies. Proxy refreshes the session.
          }
        },
      },
    },
  );
}
