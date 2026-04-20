import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Demo mode: bypass auth entirely
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") {
    if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
      return NextResponse.redirect(new URL("/feed", request.url));
    }
    return NextResponse.next({ request });
  }

  // Production: Supabase auth guard
  const { createServerClient } = await import("@supabase/ssr");
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Auth pages — redirect to /feed if already logged in
  if (pathname === "/login" || pathname === "/signup") {
    if (user) return NextResponse.redirect(new URL("/feed", request.url));
    return response;
  }

  // Onboarding — require auth; redirect to /feed if already has group
  if (pathname.startsWith("/onboarding")) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));

    const { data: membership } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (membership) return NextResponse.redirect(new URL("/feed", request.url));
    return response;
  }

  // Protected app routes — require auth + group
  if (
    pathname.startsWith("/feed") ||
    pathname.startsWith("/calendar") ||
    pathname.startsWith("/community") ||
    pathname.startsWith("/profile") ||
    pathname === "/me"
  ) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));

    const { data: membership } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership)
      return NextResponse.redirect(new URL("/onboarding", request.url));
    return response;
  }

  // Root redirect
  if (pathname === "/") {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));

    const { data: membership } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", user.id)
      .maybeSingle();

    return NextResponse.redirect(
      new URL(membership ? "/feed" : "/onboarding", request.url)
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
