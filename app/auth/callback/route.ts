import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/feed";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Upsert profile
      await supabase.from("profiles").upsert({
        id: data.user.id,
        name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "User",
      });

      // Check if user has a group
      const { data: membership } = await supabase
        .from("group_members")
        .select()
        .eq("user_id", data.user.id)
        .single();

      if (!membership) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
