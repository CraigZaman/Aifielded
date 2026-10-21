"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function updateDisplayName(formData: FormData) {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) redirect("/sign-in?next=%2Fapp%2Fsettings");
  if (formData.get("accountId") !== auth.user.id) {
    redirect("/app/settings?message=Your+signed-in+account+changed.+Reload+and+try+again.");
  }
  const name = z.string().trim().min(2).max(80).safeParse(formData.get("fullName"));
  if (!name.success) redirect("/app/settings?message=Enter+a+name+between+2+and+80+characters.");
  const { data, error } = await supabase.from("profiles")
    .update({ full_name: name.data })
    .eq("id", auth.user.id)
    .select("id")
    .single();
  if (error || !data) redirect("/app/settings?message=Your+name+could+not+be+saved.+Please+try+again.");
  revalidatePath("/app", "layout");
  redirect("/app/settings?message=Your+display+name+has+been+updated.");
}
