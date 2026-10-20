import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// system_settings rarely changes — cache briefly per worker so every
// navigation doesn't pay a remote round-trip just to read two booleans.
// Toggling a flag takes up to TTL to reach in-flight sessions; the login
// route still checks live.
const SETTINGS_TTL_MS = 30_000;
let settingsCache: { locked: boolean; maintenance: boolean; at: number } | null = null;

async function getControlFlags(supabase: any) {
  if (settingsCache && Date.now() - settingsCache.at < SETTINGS_TTL_MS) {
    return settingsCache;
  }
  const { data: settings } = await supabase
    .from("system_settings")
    .select("key, value");
  settingsCache = {
    locked: !!settings?.some((s: any) => s.key === "logins_locked" && s.value === true),
    maintenance: !!settings?.some((s: any) => s.key === "maintenance_mode" && s.value === true),
    at: Date.now(),
  };
  return settingsCache;
}

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
  const publicPaths = ['/', '/login', '/signup'];
  const isPublic = publicPaths.includes(pathname) || pathname.startsWith('/auth');
  const isApi = pathname.startsWith('/api');
  const isChangePassword = pathname === '/change-password';
  const isVerifyOtp = pathname === '/verify-otp';

  if (!user && !isPublic && !isApi) return NextResponse.redirect(new URL('/login', request.url));
  if (user && (pathname === '/login' || pathname === '/signup')) return NextResponse.redirect(new URL('/dashboard', request.url));

  if (user && !isApi) {
    // Emergency controls — everyone except the super admin is signed out
    // while the system is locked or under maintenance.
    const { locked, maintenance } = await getControlFlags(supabase);

    if (locked || maintenance) {
      const { data: roleProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if ((roleProfile as any)?.role !== 'super_admin') {
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }

  if (user && !isApi && !isChangePassword && !isVerifyOtp) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('must_change_password, phone, otp_verified_at, is_suspended')
      .eq('user_id', user.id)
      .single();

    // Suspended accounts are signed out on their next request
    if ((profile as any)?.is_suspended) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if ((profile as any)?.must_change_password) {
      return NextResponse.redirect(new URL('/change-password', request.url));
    }

    // OTP enforcement is server-side — a forgeable cookie used to stand in for
    // this check. otp_verified_at is set by /api/otp/verify and cleared on
    // account reset / password change.
    const otpEnabled = process.env.ENABLE_OTP_LOGIN !== 'false';

    if (otpEnabled && (profile as any)?.phone && !(profile as any)?.otp_verified_at) {
      return NextResponse.redirect(new URL('/verify-otp', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};