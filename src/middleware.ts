import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password", 
  "/reset-password",
  "/auth/callback",
];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Not logged in + not public page → send to login
  if (!user && !isPublicRoute) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in + on login page → send to correct dashboard
  if (user && pathname === "/login") {
    return NextResponse.redirect(request.nextUrl.clone());
  }

  // Logged in + on root "/" → send to role-specific dashboard
  if (user && pathname === "/") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;
    const url = request.nextUrl.clone();

    if (role === "super_admin" || role === "administrator") url.pathname = "/dashboard";
    else if (role === "chairperson") url.pathname = "/dashboard/approvals";
    else if (role === "union_rep") url.pathname = "/dashboard/employees";
    else if (role === "fund_manager") url.pathname = "/dashboard/ledger";
    else if (role === "employee") url.pathname = "/dashboard/profile";
    else url.pathname = "/dashboard"; // fallback

    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|public/).*)"],
};
