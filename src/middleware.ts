import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("MIDDLEWARE HIT:", request.nextUrl.pathname);
  return new Response(`MIDDLEWARE IS RUNNING ON: ${request.nextUrl.pathname}`, { status: 200 });
}

export const config = {
  matcher: ["/", "/:path*"], // This matches root "/" AND all other paths
};
