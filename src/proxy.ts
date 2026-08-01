import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
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
  const publicPaths = ['/', '/login', '/signup', '/forgot-password', '/reset-password'];
  const isPublic = publicPaths.includes(pathname) || pathname.startsWith('/auth');
  const isApi = pathname.startsWith('/api');
  const isChangePassword = pathname === '/change-password';
  const isVerifyOtp = pathname === '/verify-otp';

  if (!user && !isPublic && !isApi) return NextResponse.redirect(new URL('/login', request.url));
  if (user && (pathname === '/login' || pathname === '/signup')) return NextResponse.redirect(new URL('/dashboard', request.url));

  if (user && !isApi && !isChangePassword && !isVerifyOtp && pathname !== '/reset-password') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('must_change_password, phone')
      .eq('user_id', user.id)
      .single();

    if ((profile as any)?.must_change_password) {
      return NextResponse.redirect(new URL('/change-password', request.url));
    }

    const otpVerified = request.cookies.get('gtpea_otp_verified')?.value === '1';
    const otpEnabled = process.env.ENABLE_OTP_LOGIN !== 'false';

    if (otpEnabled && !otpVerified && (profile as any)?.phone) {
      return NextResponse.redirect(new URL('/verify-otp', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};