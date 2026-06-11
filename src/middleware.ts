import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are not set, skip auth checks (for build time)
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: any) => {
          cookiesToSet.forEach(({ name, value, options }: any) => request.cookies.set({ name, value, ...options }));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }: any) => response.cookies.set({ name, value, ...options }));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const publicPaths = ['/', '/login', '/forgot-password', '/reset-password'];
  const isPublic = publicPaths.includes(pathname) || pathname.startsWith('/auth');
  const isApi = pathname.startsWith('/api');

  if (!user && !isPublic && !isApi) return NextResponse.redirect(new URL('/login', request.url));
  if (user && pathname === '/login') return NextResponse.redirect(new URL('/dashboard', request.url));

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};