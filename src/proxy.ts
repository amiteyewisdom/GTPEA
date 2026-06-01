import { NextResponse } from "next/server";

export async function middleware(request) {
  return new Response(`PROXY IS RUNNING ON: ${request.nextUrl.pathname}`, { status: 200 });
}

export const config = {
  matcher: ["/", "/:path*"],
};
